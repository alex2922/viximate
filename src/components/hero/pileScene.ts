import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MARK_CHEVRON, MARK_TOP, MARK_VIEWBOX } from "@/config/brand";
import { type Bit, FIGURE_STAGE } from "@/config/figures";

/* ==========================================================================
   The hero system. The Viximate mark is cut into blocks at load: first along
   four vertical bands, one colour per discipline, then into irregular cells
   inside each band. The blocks start scattered across the screen in full
   colour. Scrolling draws them in on a spiral, and as each one lands it loses
   its bevel and its colour, so the seams close and the pile becomes the mark:
   one solid shape, one solid colour. There is no second mark behind it. A
   small custom simulation (springs, sphere contacts, damping) is enough; no
   physics engine ships with the page.

   The inner pages run this same system on a different figure: the blocks are
   cut from the figure's own shapes and each settles into its own flat colour.
   ========================================================================== */

export type PilePalette = {
  accent: string;
  accent2: string;
  foreground: string;
  background: string;
  /** The quiet grey of a figure's connecting parts. */
  quiet: string;
  /** One tone per discipline: web, apps, automation and AI, growth. */
  disciplines: [string, string, string, string];
};

type Options = {
  palette: PilePalette;
  reducedMotion: boolean;
  onReady?: () => void;
  /** Build this instead of the mark. `tone` is the colour of its "t" ink. */
  figure?: { bits: Bit[]; tone: string };
  /** The box the finished shape fills, in canvas pixels. Off: the hero's layout. */
  frame?: () => { x: number; y: number; width: number; height: number } | null;
  /** Listens for the pointer, when the canvas itself lets it pass through. */
  pointerTarget?: HTMLElement;
};

type Body = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  quat: THREE.Quaternion;
  spin: THREE.Vector3;
  radius: number;
  pile: number; // scale while scattered; shards run large so the pile fills the frame
  mesh: THREE.Mesh;
  face: THREE.MeshPhysicalMaterial;
  edge: THREE.MeshPhysicalMaterial;
  tone: THREE.Color;
  final: THREE.Color; // the flat colour it lands in
  faceGlow: number;
  edgeGlow: number;
  lock: number; // 0 a coloured block, 1 part of the solid mark
  dock: THREE.Vector3; // its exact place in the mark
  delay: number; // when, within the assembly, it sets off
  swirl: number; // how far round it travels on the way in
};

type Poly = THREE.Vector2[];

const MARK_UNIT = 5.4 / MARK_VIEWBOX.width; // the mark is 5.4 units wide
const MARK_W = MARK_VIEWBOX.width * MARK_UNIT;
const MARK_H = MARK_VIEWBOX.height * MARK_UNIT;
const SHARDS = 84; // cut across the whole mark, shared out by area
const DEPTH = 0.46;
const SEAL = 0.006; // landed blocks overlap by this much, so no seam can show
const BANDS = 4;
const FIGURE_SHARDS = 58;
const FIGURE_UNIT = MARK_W / FIGURE_STAGE.width;
const FIGURE_H = FIGURE_STAGE.height * FIGURE_UNIT;
/** How far each bit of a figure stands in front of the one behind it. */
const FIGURE_LAYER = 0.05;

/** SVG path (M, L, H, Q, C, Z, absolute) to a THREE.Shape, y flipped. */
function shapeFromPath(d: string, unit: number) {
  const shape = new THREE.Shape();
  const t = d.match(/[MLHQCZ]|-?\d*\.?\d+/g) ?? [];
  const p = (v: number) => v * unit;
  let i = 0;
  let cmd = "";
  let x = 0;
  let y = 0;
  const n = () => Number(t[i++]);
  while (i < t.length) {
    if (/[MLHQCZ]/.test(t[i])) cmd = t[i++];
    if (cmd === "Z") break;
    if (cmd === "M") {
      x = n();
      y = n();
      shape.moveTo(p(x), -p(y));
    } else if (cmd === "L") {
      x = n();
      y = n();
      shape.lineTo(p(x), -p(y));
    } else if (cmd === "H") {
      x = n();
      shape.lineTo(p(x), -p(y));
    } else if (cmd === "Q") {
      const x1 = n();
      const y1 = n();
      x = n();
      y = n();
      shape.quadraticCurveTo(p(x1), -p(y1), p(x), -p(y));
    } else if (cmd === "C") {
      const x1 = n();
      const y1 = n();
      const x2 = n();
      const y2 = n();
      x = n();
      y = n();
      shape.bezierCurveTo(p(x1), -p(y1), p(x2), -p(y2), p(x), -p(y));
    }
  }
  return shape;
}

/** Keep the side of a polygon where nx*x + ny*y <= c (Sutherland-Hodgman). */
function clip(poly: Poly, nx: number, ny: number, c: number): Poly {
  const out: Poly = [];
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    const dp = nx * p.x + ny * p.y - c;
    const dq = nx * q.x + ny * q.y - c;
    if (dp <= 0) out.push(p);
    if (dp < 0 !== dq < 0) out.push(p.clone().lerp(q, dp / (dp - dq)));
  }
  return out;
}

function area(poly: Poly) {
  let sum = 0;
  for (let i = 0; i < poly.length; i++) {
    const p = poly[i];
    const q = poly[(i + 1) % poly.length];
    sum += p.x * q.y - q.x * p.y;
  }
  return Math.abs(sum) / 2;
}

function centroid(poly: Poly) {
  const c = new THREE.Vector2();
  for (const p of poly) c.add(p);
  return c.multiplyScalar(1 / poly.length);
}

function inside(poly: Poly, x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (
      a.y > y !== b.y > y &&
      x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x
    )
      hit = !hit;
  }
  return hit;
}

/** Cut a polygon into evenly sized Voronoi cells. */
function cells(poly: Poly, count: number, rand: () => number): Poly[] {
  if (count < 2) return [poly];
  const box = new THREE.Box2().setFromPoints(poly);
  const size = box.getSize(new THREE.Vector2());
  const sample = () => {
    for (let guard = 0; guard < 200; guard++) {
      const x = box.min.x + rand() * size.x;
      const y = box.min.y + rand() * size.y;
      if (inside(poly, x, y)) return new THREE.Vector2(x, y);
    }
    return centroid(poly);
  };
  // Best candidate: each new seed is the farthest of a few tries.
  const seeds = [sample()];
  while (seeds.length < count) {
    let best = sample();
    let reach = 0;
    for (let t = 0; t < 14; t++) {
      const candidate = sample();
      const d = Math.min(...seeds.map((s) => s.distanceToSquared(candidate)));
      if (d > reach) {
        reach = d;
        best = candidate;
      }
    }
    seeds.push(best);
  }
  return seeds.map((seed) => {
    let cell = poly;
    for (const other of seeds) {
      if (other === seed || cell.length < 3) continue;
      const nx = other.x - seed.x;
      const ny = other.y - seed.y;
      const c = (other.lengthSq() - seed.lengthSq()) / 2;
      cell = clip(cell, nx, ny, c);
    }
    return cell;
  });
}

/** The mark as polygons in scene units, centred on the origin. */
function markPolygon(d: string): Poly {
  const points = shapeFromPath(d, MARK_UNIT).getPoints(14);
  const poly = points.map(
    (p) => new THREE.Vector2(p.x - MARK_W / 2, p.y + MARK_H / 2),
  );
  if (poly[0].distanceTo(poly[poly.length - 1]) < 1e-4) poly.pop();
  return poly;
}

/** One bit of a figure as a rounded polygon in scene units. */
function bitPolygon([x, y, width, height, corner]: Bit): Poly {
  const r = Math.min(corner, width / 2, height / 2) * FIGURE_UNIT;
  const left = (x - FIGURE_STAGE.width / 2) * FIGURE_UNIT;
  const top = (FIGURE_STAGE.height / 2 - y) * FIGURE_UNIT;
  const right = left + width * FIGURE_UNIT;
  const bottom = top - height * FIGURE_UNIT;
  const poly: Poly = [];
  const corners: [number, number, number][] = [
    [right - r, bottom + r, -Math.PI / 2],
    [right - r, top - r, 0],
    [left + r, top - r, Math.PI / 2],
    [left + r, bottom + r, Math.PI],
  ];
  for (const [cx, cy, start] of corners) {
    for (let i = 0; i <= 6; i++) {
      const a = start + (i / 6) * (Math.PI / 2);
      poly.push(new THREE.Vector2(cx + Math.cos(a) * r, cy + Math.sin(a) * r));
    }
  }
  return poly;
}

/** Move every point of a closed outline along its corner, out for positive. */
function offsetOutline(outline: Poly, amount: number): Poly {
  const n = outline.length;
  return outline.map((p, i) => {
    const prev = outline[(i + n - 1) % n];
    const next = outline[(i + 1) % n];
    // Outward normals of the two edges at this corner (the outline runs CCW).
    const a = new THREE.Vector2(p.y - prev.y, prev.x - p.x).normalize();
    const b = new THREE.Vector2(next.y - p.y, p.x - next.x).normalize();
    const miter = a.clone().add(b).normalize();
    const reach = amount / Math.max(0.4, miter.dot(a));
    return p.clone().addScaledVector(miter, reach);
  });
}

/**
 * One block: a cell of the mark, extruded, its origin at its own centre. Both
 * shapes below share one topology, so the block can morph from the chamfered
 * block to a flat tile, which is what lets landed blocks close into one face.
 */
function blockGeometry(cell: Poly, center: THREE.Vector2) {
  const outline = cell
    .map((p) => p.clone().sub(center))
    .filter((p, i, all) => p.distanceTo(all[(i + 1) % all.length]) > 1e-4);
  if (THREE.ShapeUtils.isClockWise(outline)) outline.reverse();
  const caps = THREE.ShapeUtils.triangulateShape(outline, []);

  const build = (chamfer: number, lip: number, seal: number) => {
    const inner = offsetOutline(outline, seal - chamfer);
    const outer = offsetOutline(outline, seal);
    const half = DEPTH / 2;
    const positions: number[] = [];
    const push = (p: THREE.Vector2, z: number) => positions.push(p.x, p.y, z);

    for (const [a, b, c] of caps) {
      const [p, q, r] = [outline[a], outline[b], outline[c]];
      const ccw = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x) > 0;
      const [i, j] = ccw ? [b, c] : [c, b];
      push(inner[a], half + lip);
      push(inner[i], half + lip);
      push(inner[j], half + lip);
      push(inner[a], -half - lip);
      push(inner[j], -half - lip);
      push(inner[i], -half - lip);
    }
    const capVertices = positions.length / 3;

    const rings: [Poly, number][] = [
      [inner, half + lip],
      [outer, half],
      [outer, -half],
      [inner, -half - lip],
    ];
    for (let r = 0; r < rings.length - 1; r++) {
      const [hi, zHi] = rings[r];
      const [lo, zLo] = rings[r + 1];
      for (let i = 0; i < outline.length; i++) {
        const j = (i + 1) % outline.length;
        push(hi[i], zHi);
        push(lo[i], zLo);
        push(lo[j], zLo);
        push(hi[i], zHi);
        push(lo[j], zLo);
        push(hi[j], zHi);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    geometry.computeVertexNormals();
    geometry.addGroup(0, capVertices, 0);
    geometry.addGroup(capVertices, positions.length / 3 - capVertices, 1);
    return geometry;
  };

  const block = build(0.04, 0.05, 0);
  const tile = build(0, 0, SEAL);
  block.morphAttributes.position = [tile.attributes.position];
  block.morphAttributes.normal = [tile.attributes.normal];
  tile.dispose();
  block.computeBoundingSphere();
  return block;
}

/** How strongly each block glows in its own colour. */
const GLOW = 0.62;
/** Past white, so the finished face stays flat under the tone mapping. */
const SOLID_FACE = 3;
/** The sides of the finished mark: dark, so it still reads as an object. */
const SOLID_EDGE = 0.16;
/** A coloured face, bright but short of the point it would bleach out. */
const FIGURE_FACE = 1;
const FIGURE_EDGE = 0.3;
/** How a finished figure stands: turned a little, so its depth shows. */
const FIGURE_LEAN = { x: 0.1, y: -0.34 };

/** Any CSS colour (oklch included) to sRGB through a 1px canvas. */
function cssColor(value: string, fallback: string) {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return new THREE.Color(fallback);
  ctx.fillStyle = fallback;
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return new THREE.Color().setRGB(
    r / 255,
    g / 255,
    b / 255,
    THREE.SRGBColorSpace,
  );
}

// Seeded random so the pile is the same on every visit.
function mulberry(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const smooth = THREE.MathUtils.smoothstep;
const ease = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

const tmpV = new THREE.Vector3();
const tmpV2 = new THREE.Vector3();
const tmpP = new THREE.Vector3();
const tmpQ = new THREE.Quaternion();
const tmpQ2 = new THREE.Quaternion();
const tmpS = new THREE.Vector3();
const identity = new THREE.Quaternion();

export class PileScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  private bodies: Body[] = [];
  private solid: THREE.Color;
  private canvas: HTMLCanvasElement;
  private reduced: boolean;
  private running = false;
  private frame = 0;
  private last = 0;
  private halfW = 6;
  private halfH = 3;
  private pointer = new THREE.Vector3(999, 999, 0);
  private pointerPrev = new THREE.Vector3(999, 999, 0);
  private pointerNdc = new THREE.Vector2();
  private pointerActive = false;
  private raycaster = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private assembly = 0;
  private dropped = false;
  private dockScale = 1;
  private lift = 0;
  private resizeObserver: ResizeObserver;
  private rig = new THREE.Group();
  /** Holds every block, so the finished mark can lean as one object. */
  private mark = new THREE.Group();
  private disposables: { dispose: () => void }[] = [];
  private frameBox: Options["frame"];
  private target: HTMLElement;
  private figW = MARK_W;
  private figH = MARK_H;

  constructor(canvas: HTMLCanvasElement, options: Options) {
    this.canvas = canvas;
    this.reduced = options.reducedMotion;
    this.frameBox = options.frame;
    this.target = options.pointerTarget ?? canvas;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.camera.position.set(0, 0, 13);

    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environment = env;
    // A dimmer room keeps the reflections from bleaching the colour out.
    this.scene.environmentIntensity = 0.28;
    // The room's ceiling panel goes behind the mark. Overhead, its reflection
    // washes the top of the flat mark pale; here only tumbling shards catch it.
    this.scene.environmentRotation.x = -Math.PI / 2;
    this.disposables.push(env, pmrem);

    const { palette } = options;
    const accent = cssColor(palette.accent, "#c5ff3a");
    const tones = palette.disciplines.map((v, i) =>
      cssColor(v, ["#f5f5f5", "#bdbdbd", "#7a7a7a", "#1c1c1c"][i]),
    );

    // Rim lights in two of the brand colours.
    const key = new THREE.DirectionalLight(0xffffff, 0.8);
    key.position.set(-9, 7, 3);
    const rimA = new THREE.PointLight(accent, 22, 30, 2);
    rimA.position.set(-7, -3, 4);
    const rimB = new THREE.PointLight(tones[2], 30, 30, 2);
    rimB.position.set(7, 4, 3);
    this.scene.add(key, rimA, rimB);

    this.solid = cssColor(palette.foreground, "#fcfcfc");

    // Every block has its own finish, since each turns solid as it lands.
    const finish = (color: THREE.Color, roughness: number) =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness,
        metalness: 0,
        clearcoat: 0.35,
        clearcoatRoughness: 0.12,
        // Each block glows faintly in its own colour, like lit acrylic.
        emissive: color,
        emissiveIntensity: GLOW,
      });
    // Cut the mark: four colour bands, then cells inside each band.
    const rand = mulberry(7);
    const parts = [markPolygon(MARK_TOP), markPolygon(MARK_CHEVRON)];
    const pieces: {
      cell: Poly;
      band: number;
      final?: THREE.Color;
      layer?: number;
    }[] = [];
    const total = parts.reduce((sum, part) => sum + area(part), 0);
    for (const part of options.figure ? [] : parts) {
      for (let band = 0; band < BANDS; band++) {
        const left = -MARK_W / 2 + (MARK_W / BANDS) * band;
        const strip = clip(
          clip(part, 1, 0, left + MARK_W / BANDS),
          -1,
          0,
          -left,
        );
        if (strip.length < 3) continue;
        const count = Math.round((area(strip) / total) * SHARDS);
        for (const cell of cells(strip, Math.max(1, count), rand)) {
          if (cell.length >= 3 && area(cell) > 0.004)
            pieces.push({ cell, band });
        }
      }
    }

    if (options.figure) {
      const { bits, tone } = options.figure;
      this.figH = FIGURE_H;
      const inks: Record<Bit[5], THREE.Color> = {
        t: cssColor(tone, "#fcfcfc"),
        w: cssColor(palette.foreground, "#fcfcfc"),
        d: cssColor(palette.background, "#000000"),
        m: cssColor(palette.quiet, "#3e3e3e"),
        web: tones[0],
        app: tones[1],
        ai: tones[2],
        growth: tones[3],
      };
      const polys = bits.map(bitPolygon);
      const whole = polys.reduce((sum, poly) => sum + area(poly), 0);
      polys.forEach((poly, layer) => {
        const count = Math.round((area(poly) / whole) * FIGURE_SHARDS);
        for (const cell of cells(poly, Math.max(1, count), rand)) {
          if (cell.length < 3 || area(cell) < 0.004) continue;
          // They fly in the four colours, whatever they land as.
          const across = (centroid(cell).x + MARK_W / 2) / MARK_W;
          const band = Math.min(BANDS - 1, Math.floor(across * BANDS));
          pieces.push({ cell, band, final: inks[bits[layer][5]], layer });
        }
      });
    }

    const farthest = Math.hypot(this.figW, this.figH) / 2;
    for (const { cell, band, final, layer = 0 } of pieces) {
      const center = centroid(cell);
      const geometry = blockGeometry(cell, center);
      const tone = tones[band];
      const roughness = [0.3, 0.26, 0.24, 0.18][band];
      const face = finish(tone, roughness);
      const edge = finish(tone, roughness);
      this.disposables.push(geometry, face, edge);
      // Two groups: the caps, then the sides.
      const mesh = new THREE.Mesh(geometry, [face, edge]);
      mesh.matrixAutoUpdate = false;
      this.mark.add(mesh);
      this.bodies.push({
        pos: new THREE.Vector3(),
        vel: new THREE.Vector3(),
        quat: new THREE.Quaternion().setFromEuler(
          new THREE.Euler(rand() * 6.28, rand() * 6.28, rand() * 6.28),
        ),
        spin: new THREE.Vector3(),
        radius: 0,
        pile: 1.05 + rand() * 0.55,
        mesh,
        face,
        edge,
        tone,
        final: final ?? this.solid,
        faceGlow: final ? FIGURE_FACE : SOLID_FACE,
        edgeGlow: final ? FIGURE_EDGE : SOLID_EDGE,
        lock: -1,
        dock: new THREE.Vector3(center.x, center.y, layer * FIGURE_LAYER),
        // The middle of the mark fills first and the edges close it.
        delay: (center.length() / farthest) * 0.22 + rand() * 0.14,
        swirl: 1.5 + rand() * 0.9,
      });
    }
    for (const b of this.bodies) {
      b.radius = (b.mesh.geometry.boundingSphere?.radius ?? 0.4) * b.pile * 0.9;
    }
    this.rig.add(this.mark);
    this.scene.add(this.rig);

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
    this.scatter(rand);

    this.target.addEventListener("pointermove", this.onPointerMove, {
      passive: true,
    });
    this.target.addEventListener("pointerdown", this.onPointerDown, {
      passive: true,
    });
    this.target.addEventListener("pointerleave", this.onPointerLeave, {
      passive: true,
    });

    if (this.reduced) {
      // Nothing moves, so show the finished mark.
      this.assembly = 1;
      this.dropped = true;
    }
    this.syncShards();
    this.render();
    options.onReady?.();
  }

  /** Half extents of the frame in the rig's own units. */
  private local() {
    const fit = this.rig.scale.x || 1;
    return { hw: this.halfW / fit, hh: this.halfH / fit };
  }

  /** Bodies start above the frame, waiting for drop(). */
  private scatter(rand: () => number) {
    const { hw, hh } = this.local();
    const spread = this.frameBox ? Math.min(hw * 0.92, 4.4) : hw * 0.92;
    for (const b of this.bodies) {
      b.pos.set(
        (rand() * 2 - 1) * spread,
        hh + 2 + rand() * hh * 2.4,
        (rand() * 2 - 1) * 1.2,
      );
      b.vel.set(0, 0, 0);
    }
  }

  /** Let the blocks fall into the frame (called once the loader lifts). */
  drop() {
    if (this.dropped) return;
    this.dropped = true;
    for (const b of this.bodies) b.vel.set(0, -6 - Math.random() * 4, 0);
    this.start();
  }

  /** 0 scattered, 1 every block in its place in the mark. */
  setAssembly(progress: number) {
    this.assembly = clamp01(progress);
    if (!this.running) {
      this.syncShards();
      this.render();
    }
  }

  /** A knock: every block is thrown outward from where it is. */
  shatter() {
    for (const b of this.bodies) {
      tmpV
        .set(Math.random() - 0.5, Math.random() - 0.5, Math.random() * 0.5)
        .normalize()
        .multiplyScalar(5 + Math.random() * 7);
      b.vel.add(tmpV);
      b.spin.add(tmpV2.set(tmpV.y, -tmpV.x, tmpV.z).multiplyScalar(0.8));
    }
  }

  private toWorld(event: PointerEvent, out: THREE.Vector3) {
    const rect = this.canvas.getBoundingClientRect();
    this.ndc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.pointerNdc.copy(this.ndc);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    this.raycaster.ray.intersectPlane(this.plane, out);
    out.x -= this.rig.position.x;
    out.y -= this.rig.position.y;
  }

  private onPointerMove = (event: PointerEvent) => {
    if (this.reduced) return;
    this.toWorld(event, this.pointer);
    if (!this.pointerActive) this.pointerPrev.copy(this.pointer);
    this.pointerActive = true;
  };

  private onPointerDown = (event: PointerEvent) => {
    if (this.reduced || this.assembly > 0.05) return;
    this.toWorld(event, tmpV2);
    // A burst: everything near the press is thrown outward.
    const fit = this.rig.scale.x || 1;
    tmpV2.multiplyScalar(1 / fit);
    for (const b of this.bodies) {
      tmpV.subVectors(b.pos, tmpV2);
      const d = tmpV.length();
      if (d < 3.2) {
        tmpV
          .setZ(tmpV.z + 0.6)
          .normalize()
          .multiplyScalar((3.2 - d) * 5);
        b.vel.add(tmpV);
        b.spin.add(new THREE.Vector3(tmpV.y, -tmpV.x, 0).multiplyScalar(0.6));
      }
    }
    this.pointerActive = true;
    this.pointerPrev.copy(this.pointer);
  };

  private onPointerLeave = () => {
    this.pointerActive = false;
    this.pointer.set(999, 999, 0);
    this.pointerNdc.set(0, 0);
  };

  private resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.halfH = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2)) * 13;
    this.halfW = this.halfH * this.camera.aspect;
    const box = this.frameBox?.();
    if (box) {
      // The figure fills its box, wherever that sits on the canvas.
      const perPixel = (this.halfH * 2) / h;
      const scale = Math.min(
        (box.width * perPixel) / this.figW,
        (box.height * perPixel) / this.figH,
      );
      this.rig.scale.setScalar(scale);
      this.rig.position.set(
        (box.x + box.width / 2 - w / 2) * perPixel,
        (h / 2 - box.y - box.height / 2) * perPixel,
        0,
      );
      this.dockScale = 1;
      if (this.bodies.length) this.syncShards();
      if (!this.running) this.render();
      return;
    }
    // Narrow frames zoom the pile in instead of shrinking it to a ball.
    const narrow = this.camera.aspect < 1.2;
    const fit = THREE.MathUtils.clamp(
      this.halfW / (narrow ? 3.4 : 5.2),
      0.5,
      1,
    );
    this.rig.scale.setScalar(fit);
    // Everything sits above the headline, clear of the fade behind it.
    this.lift = this.halfH * (narrow ? 0.28 : 0.2);
    this.rig.position.y = this.lift;
    const room = Math.min(
      (this.halfH * 2 * (narrow ? 0.46 : 0.6)) / MARK_H,
      (this.halfW * 2 * 0.84) / MARK_W,
    );
    this.dockScale = room / fit;
    if (this.bodies.length) this.syncShards();
    if (!this.running) this.render();
  }

  private step(dt: number) {
    const bodies = this.bodies;
    const fit = this.rig.scale.x || 1;
    const { hw } = this.local();
    // The pile is pulled toward a horizontal line, not a point, so it stretches
    // out to both edges of the screen instead of balling up in the middle.
    const reach = Math.max(0, hw * 0.86 - 0.6);
    const span = this.frameBox ? Math.min(reach, 3.4) : reach;
    const kx = 2.4;
    const ky = 1.5;
    const kz = 4;

    // Pointer push: the faster the cursor moves, the harder it shoves.
    const free = this.pointerActive && this.assembly < 0.05;
    const px = this.pointer.x / fit;
    const py = this.pointer.y / fit;
    const pdx = (this.pointer.x - this.pointerPrev.x) / fit;
    const pdy = (this.pointer.y - this.pointerPrev.y) / fit;
    const speed = Math.min(6, Math.hypot(pdx, pdy) / Math.max(dt, 1e-3) / 10);
    this.pointerPrev.copy(this.pointer);

    for (const b of bodies) {
      if (this.dropped) {
        const off = b.pos.x - THREE.MathUtils.clamp(b.pos.x, -span, span);
        b.vel.x -= (off * kx + b.pos.x * 0.06) * dt;
        b.vel.y -= b.pos.y * ky * dt;
        b.vel.z -= b.pos.z * kz * dt;
      }
      if (free) {
        const dx = b.pos.x - px;
        const dy = b.pos.y - py;
        const d = Math.hypot(dx, dy);
        const near = 1.6 + b.radius;
        if (d < near && d > 1e-4) {
          const f = ((near - d) / near) * (10 + speed * 14) * dt;
          b.vel.x += (dx / d) * f + pdx * 0.4;
          b.vel.y += (dy / d) * f + pdy * 0.4;
          b.vel.z += f * 0.35;
          b.spin.x += dy * f * 0.9;
          b.spin.y -= dx * f * 0.9;
        }
      }
    }

    // Sphere contacts: separate overlapping blocks and trade a little spin.
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        tmpV.subVectors(b.pos, a.pos);
        const min = a.radius + b.radius;
        const d2 = tmpV.lengthSq();
        if (d2 >= min * min || d2 < 1e-8) continue;
        const d = Math.sqrt(d2);
        const overlap = (min - d) * 0.5;
        tmpV.multiplyScalar(1 / d);
        a.pos.addScaledVector(tmpV, -overlap);
        b.pos.addScaledVector(tmpV, overlap);
        const rel = tmpV2.subVectors(b.vel, a.vel).dot(tmpV);
        if (rel < 0) {
          a.vel.addScaledVector(tmpV, rel * 0.5);
          b.vel.addScaledVector(tmpV, -rel * 0.5);
          const twist = rel * 0.25;
          a.spin.x += tmpV.y * twist;
          a.spin.y -= tmpV.x * twist;
          b.spin.x -= tmpV.y * twist;
          b.spin.y += tmpV.x * twist;
        }
      }
    }

    const damp = Math.exp(-2.6 * dt);
    const spinDamp = Math.exp(-1.8 * dt);
    for (const b of bodies) {
      b.vel.multiplyScalar(damp);
      b.spin.multiplyScalar(spinDamp);
      b.pos.addScaledVector(b.vel, dt);
      // Soft walls at the frame edge (only once the pile has landed).
      if (this.dropped) {
        const wx = hw - b.radius * 0.6;
        if (b.pos.x > wx) b.vel.x -= (b.pos.x - wx) * 30 * dt;
        if (b.pos.x < -wx) b.vel.x -= (b.pos.x + wx) * 30 * dt;
      }
      const s = b.spin.length();
      if (s > 1e-5) {
        tmpQ.setFromAxisAngle(tmpV.copy(b.spin).multiplyScalar(1 / s), s * dt);
        b.quat.premultiply(tmpQ);
      }
    }
  }

  /** Draw each block from its simulated place into its place in the mark. */
  private syncShards() {
    const a = this.assembly;
    for (const b of this.bodies) {
      const t = ease(clamp01((a - b.delay) / 0.6));
      tmpV.copy(b.dock).multiplyScalar(this.dockScale);
      // A spiral: what is left of the trip turns as it shrinks to nothing.
      tmpP.subVectors(b.pos, tmpV).multiplyScalar(1 - t);
      const turn = b.swirl * t;
      const cos = Math.cos(turn);
      const sin = Math.sin(turn);
      const { x, y } = tmpP;
      tmpP.x = x * cos - y * sin;
      tmpP.y = x * sin + y * cos;
      tmpP.add(tmpV);
      // A shallow arc toward the camera on the way in.
      tmpP.z += Math.sin(t * Math.PI) * 1.3;
      tmpQ2.slerpQuaternions(b.quat, identity, t);
      tmpS.setScalar(THREE.MathUtils.lerp(b.pile, this.dockScale, t));
      b.mesh.matrix.compose(tmpP, tmpQ2, tmpS);
      b.mesh.matrixWorldNeedsUpdate = true;
      this.setLock(b, smooth(t, 0.62, 1));
    }
  }

  /** Turn a block from lit colour into the mark's one flat colour. */
  private setLock(b: Body, lock: number) {
    if (lock === b.lock) return;
    b.lock = lock;
    if (b.mesh.morphTargetInfluences) b.mesh.morphTargetInfluences[0] = lock;
    const keep = 1 - lock;
    for (const [material, glow] of [
      [b.face, b.faceGlow],
      [b.edge, b.edgeGlow],
    ] as const) {
      // Only the glow is left at the end, so no light can shade the face.
      material.color.copy(b.tone).multiplyScalar(keep);
      material.emissive.lerpColors(b.tone, b.final, lock);
      material.emissiveIntensity = THREE.MathUtils.lerp(GLOW, glow, lock);
      material.specularIntensity = keep;
      // Never exactly zero: crossing it would recompile the shader.
      material.clearcoat = Math.max(0.001, 0.35 * keep);
    }
  }

  private render() {
    const s = ease(clamp01((this.assembly - 0.3) / 0.7));
    // The mark swings round as it closes, then leans toward the pointer.
    const swing = Math.sin(s * Math.PI) * 0.55;
    const lean = this.frameBox ? FIGURE_LEAN : { x: 0, y: 0 };
    const tx = (this.pointerNdc.y * -0.22 + lean.x) * s;
    const ty = (this.pointerNdc.x * 0.32 + lean.y) * s + swing;
    this.mark.rotation.x += (tx - this.mark.rotation.x) * 0.1;
    this.mark.rotation.y += (ty - this.mark.rotation.y) * 0.1;
    if (!this.running) {
      this.mark.rotation.set(tx, ty, 0);
    }
    // The last blocks land with a small thud.
    const thud = clamp01((this.assembly - 0.9) / 0.1);
    this.mark.scale.setScalar(1 + Math.sin(thud * Math.PI) * 0.03);
    this.renderer.render(this.scene, this.camera);
  }

  private loop = (now: number) => {
    if (!this.running) return;
    const dt = Math.min(1 / 30, (now - this.last) / 1000 || 1 / 60);
    this.last = now;
    // Two substeps keep fast pushes from tunnelling.
    this.step(dt / 2);
    this.step(dt / 2);
    this.syncShards();
    this.render();
    this.frame = requestAnimationFrame(this.loop);
  };

  start() {
    if (this.running || this.reduced || !this.dropped) return;
    this.running = true;
    this.last = performance.now();
    this.frame = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frame);
  }

  dispose() {
    this.stop();
    this.resizeObserver.disconnect();
    this.target.removeEventListener("pointermove", this.onPointerMove);
    this.target.removeEventListener("pointerdown", this.onPointerDown);
    this.target.removeEventListener("pointerleave", this.onPointerLeave);
    for (const d of this.disposables) d.dispose();
    this.renderer.dispose();
    // Each page brings its own canvas; browsers only allow a handful alive.
    this.renderer.forceContextLoss();
  }
}
