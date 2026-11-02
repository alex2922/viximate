import * as THREE from "three";

/* ==========================================================================
   Viximate "digital ecosystem" — a procedural WebGL scene.
   A shader core (technology) wired to four service hubs, each orbited by
   satellite nodes, with data packets travelling the network and floating
   interface panels that can be hovered and clicked.
   ========================================================================== */

export type PanelKind = "web" | "app" | "ai" | "growth";

export type ScenePalette = {
  accent: string;
  accent2: string;
  foreground: string;
  background: string;
  muted: string;
  fontMono: string;
  fontSans: string;
};

export type SceneOptions = {
  palette: ScenePalette;
  panels: {
    kind: PanelKind;
    index: string;
    title: string;
    tone: "accent" | "accent-2";
  }[];
  reducedMotion: boolean;
  onHover?: (index: number | null) => void;
  onSelect?: (index: number) => void;
  onReady?: () => void;
};

/* ---------- helpers ---------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function color(hex: string) {
  return new THREE.Color().setStyle(hex, THREE.SRGBColorSpace);
}

const damp = (current: number, target: number, lambda: number, dt: number) =>
  THREE.MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt));

const NOISE_GLSL = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;vec4 s1=floor(b1)*2.+1.;vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

/* ---------- panel textures (drawn procedurally on canvas) ---------- */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawPanel(
  kind: PanelKind,
  index: string,
  title: string,
  tone: string,
  p: ScenePalette,
): HTMLCanvasElement {
  const W = 640;
  const H = 420;
  const S = 2;
  const canvas = document.createElement("canvas");
  canvas.width = W * S;
  canvas.height = H * S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.scale(S, S);

  const fg = p.foreground;
  const line = "rgba(243,244,238,0.14)";
  const faint = "rgba(243,244,238,0.08)";

  // frame
  roundRect(ctx, 2, 2, W - 4, H - 4, 18);
  ctx.fillStyle = "rgba(14,16,18,0.86)";
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = tone;
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;

  // header
  ctx.font = `500 22px ${p.fontMono}`;
  ctx.textBaseline = "middle";
  ctx.fillStyle = tone;
  ctx.fillText(index, 28, 40);
  ctx.fillStyle = fg;
  ctx.fillText(title.toUpperCase(), 72, 40);
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(W - 36 - i * 20, 40, 5, 0, Math.PI * 2);
    ctx.fillStyle = i === 0 ? tone : line;
    ctx.fill();
  }
  ctx.fillStyle = line;
  ctx.fillRect(28, 68, W - 56, 1.5);

  const bar = (
    x: number,
    y: number,
    w: number,
    h: number,
    c: string,
    r = 5,
  ) => {
    roundRect(ctx, x, y, w, h, r);
    ctx.fillStyle = c;
    ctx.fill();
  };

  const top = 92;
  if (kind === "web") {
    bar(28, top, W - 56, 34, faint, 8);
    ctx.beginPath();
    ctx.arc(48, top + 17, 6, 0, Math.PI * 2);
    ctx.fillStyle = tone;
    ctx.fill();
    bar(64, top + 12, 220, 10, line);
    bar(28, top + 54, 300, 26, fg);
    bar(28, top + 92, 230, 26, fg);
    bar(28, top + 136, 180, 10, line);
    bar(28, top + 154, 150, 10, line);
    bar(28, top + 186, 120, 36, tone, 8);
    // image block with diagonal hatching
    ctx.save();
    roundRect(ctx, 360, top + 54, W - 388, 168, 10);
    ctx.clip();
    ctx.fillStyle = faint;
    ctx.fillRect(360, top + 54, W - 388, 168);
    ctx.strokeStyle = tone;
    ctx.globalAlpha = 0.35;
    ctx.lineWidth = 2;
    for (let i = -200; i < 400; i += 16) {
      ctx.beginPath();
      ctx.moveTo(360 + i, top + 54);
      ctx.lineTo(360 + i + 168, top + 222);
      ctx.stroke();
    }
    ctx.restore();
    for (let i = 0; i < 4; i++) bar(28 + i * 148, top + 246, 136, 54, faint, 8);
  } else if (kind === "app") {
    // phone
    roundRect(ctx, 40, top - 4, 150, 300, 24);
    ctx.strokeStyle = tone;
    ctx.lineWidth = 2;
    ctx.stroke();
    bar(90, top + 8, 50, 8, line, 4);
    ctx.beginPath();
    ctx.arc(115, top + 92, 44, 0, Math.PI * 2);
    ctx.strokeStyle = tone;
    ctx.lineWidth = 8;
    ctx.globalAlpha = 0.25;
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(115, top + 92, 44, -Math.PI / 2, Math.PI * 0.9);
    ctx.strokeStyle = tone;
    ctx.stroke();
    bar(62, top + 160, 106, 12, fg);
    bar(62, top + 182, 80, 10, line);
    for (let i = 0; i < 2; i++) bar(62, top + 210 + i * 32, 106, 22, faint, 6);
    // list
    for (let i = 0; i < 4; i++) {
      const y = top + 8 + i * 72;
      bar(224, y, 52, 52, i === 0 ? tone : faint, 12);
      bar(292, y + 10, 200 - i * 24, 12, fg);
      bar(292, y + 32, 140, 10, line);
      bar(W - 92, y + 16, 56, 20, faint, 10);
    }
  } else if (kind === "ai") {
    const nodes: [number, number][] = [
      [80, top + 30],
      [80, top + 150],
      [80, top + 270],
      [W / 2, top + 150],
      [W - 80, top + 70],
      [W - 80, top + 230],
    ];
    ctx.lineWidth = 2;
    const links: [number, number][] = [
      [0, 3],
      [1, 3],
      [2, 3],
      [3, 4],
      [3, 5],
    ];
    for (const [a, b] of links) {
      const [ax, ay] = nodes[a];
      const [bx, by] = nodes[b];
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.bezierCurveTo((ax + bx) / 2, ay, (ax + bx) / 2, by, bx, by);
      ctx.strokeStyle = line;
      ctx.stroke();
    }
    nodes.forEach(([x, y], i) => {
      if (i === 3) {
        ctx.beginPath();
        ctx.arc(x, y, 54, 0, Math.PI * 2);
        ctx.strokeStyle = tone;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, 34, 0, Math.PI * 2);
        ctx.fillStyle = tone;
        ctx.fill();
        ctx.fillStyle = p.background;
        ctx.font = `600 20px ${p.fontMono}`;
        ctx.textAlign = "center";
        ctx.fillText("AI", x, y + 1);
        ctx.textAlign = "start";
      } else {
        bar(x - 44, y - 18, 88, 36, faint, 10);
        bar(x - 30, y - 4, 60, 8, line, 4);
      }
    });
  } else {
    // growth: rising bars + trend line
    const base = top + 290;
    const values = [0.22, 0.3, 0.27, 0.42, 0.38, 0.55, 0.62, 0.74, 0.86];
    const bw = (W - 56) / values.length;
    values.forEach((v, i) => {
      bar(
        28 + i * bw + 6,
        base - v * 260,
        bw - 12,
        v * 260,
        i === values.length - 1 ? tone : faint,
        6,
      );
    });
    ctx.beginPath();
    values.forEach((v, i) => {
      const x = 28 + i * bw + bw / 2;
      const y = base - v * 260 - 26;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = tone;
    ctx.lineWidth = 3;
    ctx.stroke();
    const lx = 28 + (values.length - 1) * bw + bw / 2;
    const ly = base - values[values.length - 1] * 260 - 26;
    ctx.beginPath();
    ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.fillStyle = tone;
    ctx.fill();
  }

  return canvas;
}

/* ---------- scene ---------- */

type NodeData = {
  pos: THREE.Vector3;
  hub: number;
  size: number;
  color: THREE.Color;
};

export class EcosystemScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  private root = new THREE.Group();
  private network = new THREE.Group();
  private last = 0;
  private raf = 0;
  private running = false;
  private disposed = false;
  private readyFired = false;

  private opts: SceneOptions;
  private compact = false;
  private baseZ = 11;
  private time = 0;
  private scroll = 0;
  private pointer = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  private pointerInside = false;
  private raycaster = new THREE.Raycaster();
  private hovered: number | null = null;
  private highlighted: number | null = null;
  private highlightMix = 0;
  private downAt: { x: number; y: number } | null = null;

  private coreMat!: THREE.ShaderMaterial;
  private nodeMat!: THREE.ShaderMaterial;
  private edgeMat!: THREE.ShaderMaterial;
  private packetMat!: THREE.ShaderMaterial;
  private dustMat!: THREE.ShaderMaterial;
  private shell!: THREE.LineSegments;
  private rings: THREE.Line[] = [];
  private panels: THREE.Mesh[] = [];
  private panelAnchors: THREE.Vector3[] = [];
  private nodes: NodeData[] = [];
  private edges: [number, number][] = [];
  private adjacency: number[][] = [];
  private packets: {
    edge: number;
    t: number;
    speed: number;
    forward: boolean;
  }[] = [];
  private packetPositions!: Float32Array;
  private packetGeo!: THREE.BufferGeometry;
  private resizeObserver: ResizeObserver;
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement, opts: SceneOptions) {
    this.canvas = canvas;
    this.opts = opts;
    const width = canvas.clientWidth || window.innerWidth;
    this.compact = width < 768;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !this.compact,
      alpha: true,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, this.compact ? 1.5 : 1.75),
    );

    this.scene.add(this.root);
    this.root.add(this.network);
    this.camera.position.set(0, 0, this.baseZ);

    this.buildCore();
    this.buildNetwork();
    this.buildPanels();
    this.buildAtmosphere();

    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement ?? canvas);
    this.resize();

    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerleave", this.onPointerLeave);
    canvas.addEventListener("pointerdown", this.onPointerDown);
    canvas.addEventListener("pointerup", this.onPointerUp);
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  /* ----- build ----- */

  private buildCore() {
    const { palette } = this.opts;
    const geo = new THREE.IcosahedronGeometry(1.15, this.compact ? 24 : 48);
    this.coreMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uAccent: { value: color(palette.accent) },
        uAccent2: { value: color(palette.accent2) },
        uBase: { value: color(palette.background) },
        uEnergy: { value: 0 },
      },
      vertexShader: /* glsl */ `
        uniform float uTime; uniform float uEnergy;
        varying vec3 vNormal; varying vec3 vView; varying float vNoise; varying vec3 vPos;
        ${NOISE_GLSL}
        void main(){
          float n = snoise(normal * 1.4 + vec3(uTime * 0.18));
          float n2 = snoise(normal * 3.2 - vec3(uTime * 0.12));
          float disp = n * (0.14 + uEnergy * 0.08) + n2 * 0.035;
          vec3 p = position + normal * disp;
          vNoise = n;
          vPos = p;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          vView = normalize(-mv.xyz);
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uAccent; uniform vec3 uAccent2; uniform vec3 uBase; uniform float uTime;
        varying vec3 vNormal; varying vec3 vView; varying float vNoise; varying vec3 vPos;
        void main(){
          float fres = pow(1.0 - max(dot(normalize(vNormal), vView), 0.0), 2.2);
          // topographic contour bands flowing across the surface
          float h = length(vPos) * 9.0 + vNoise * 3.0 - uTime * 0.4;
          float band = 1.0 - smoothstep(0.0, 0.08, abs(fract(h) - 0.5));
          vec3 col = uBase * 1.6;
          col += uAccent * band * 0.55 * (0.35 + fres);
          col = mix(col, uAccent2, smoothstep(0.35, 1.0, fres) * 0.85);
          col += uAccent * pow(fres, 4.0) * 0.6;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    });
    const core = new THREE.Mesh(geo, this.coreMat);
    core.name = "core";
    this.root.add(core);

    const wire = new THREE.WireframeGeometry(
      new THREE.IcosahedronGeometry(1.75, 1),
    );
    this.shell = new THREE.LineSegments(
      wire,
      new THREE.LineBasicMaterial({
        color: color(palette.accent2),
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
      }),
    );
    this.root.add(this.shell);

    // halo sprite behind core
    const halo = new THREE.Mesh(
      new THREE.PlaneGeometry(7, 7),
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uColor: { value: color(palette.accent2) } },
        vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; varying vec2 vUv;
          void main(){ float d = length(vUv - 0.5); float a = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(uColor, pow(a, 3.0) * 0.28);
          #include <colorspace_fragment>
          }`,
      }),
    );
    halo.name = "halo";
    halo.position.z = -1.2;
    this.root.add(halo);
  }

  private buildNetwork() {
    const { palette } = this.opts;
    const rand = mulberry32(7);
    const accent = color(palette.accent);
    const accent2 = color(palette.accent2);
    const white = color(palette.foreground);
    const tones = this.opts.panels.map((p) =>
      p.tone === "accent" ? accent : accent2,
    );

    const hubRadius = this.compact ? 2.35 : 3.1;
    const hubDirs = [
      new THREE.Vector3(-1, 0.55, 0.25),
      new THREE.Vector3(1, 0.75, -0.35),
      new THREE.Vector3(-0.85, -0.7, -0.4),
      new THREE.Vector3(1, -0.6, 0.4),
    ];

    const add = (
      pos: THREE.Vector3,
      hub: number,
      size: number,
      c: THREE.Color,
    ) => {
      this.nodes.push({ pos, hub, size, color: c });
      this.adjacency.push([]);
      return this.nodes.length - 1;
    };
    const link = (a: number, b: number) => {
      this.edges.push([a, b]);
      this.adjacency[a].push(this.edges.length - 1);
      this.adjacency[b].push(this.edges.length - 1);
    };

    const core = add(new THREE.Vector3(0, 0, 0), -1, 0, white);
    const hubs = hubDirs.map((d, i) => {
      const pos = d.normalize().multiplyScalar(hubRadius);
      const id = add(pos, i, 22, tones[i]);
      link(core, id);
      return id;
    });
    for (let i = 0; i < hubs.length; i++)
      link(hubs[i], hubs[(i + 1) % hubs.length]);

    const satellitesPerHub = this.compact ? 9 : 16;
    hubs.forEach((hubId, h) => {
      const hubPos = this.nodes[hubId].pos;
      const members: number[] = [];
      for (let s = 0; s < satellitesPerHub; s++) {
        const dir = new THREE.Vector3(
          rand() * 2 - 1,
          rand() * 2 - 1,
          rand() * 2 - 1,
        ).normalize();
        const dist = 0.55 + rand() * (this.compact ? 1.0 : 1.45);
        const pos = hubPos.clone().add(dir.multiplyScalar(dist));
        const c = rand() > 0.72 ? tones[h] : white;
        const id = add(pos, h, 5 + rand() * 6, c);
        members.push(id);
        link(hubId, id);
      }
      // stitch a few satellite neighbours together
      members.forEach((id) => {
        let best = -1;
        let bestD = Number.POSITIVE_INFINITY;
        for (const other of members) {
          if (other === id) continue;
          const d = this.nodes[id].pos.distanceToSquared(this.nodes[other].pos);
          if (d < bestD) {
            bestD = d;
            best = other;
          }
        }
        if (best >= 0 && rand() > 0.35) link(id, best);
      });
    });

    // outer drifting nodes for depth
    const outer = this.compact ? 10 : 28;
    const existing = this.nodes.length;
    for (let i = 0; i < outer; i++) {
      const dir = new THREE.Vector3(
        rand() * 2 - 1,
        (rand() * 2 - 1) * 0.7,
        rand() * 2 - 1,
      ).normalize();
      const pos = dir.multiplyScalar(hubRadius + 1.6 + rand() * 2.2);
      const id = add(pos, -1, 3 + rand() * 4, rand() > 0.8 ? accent : white);
      let best = 1;
      let bestD = Number.POSITIVE_INFINITY;
      for (let j = 1; j < existing; j++) {
        const d = pos.distanceToSquared(this.nodes[j].pos);
        if (d < bestD) {
          bestD = d;
          best = j;
        }
      }
      if (bestD < 9) link(id, best);
    }

    // points
    const count = this.nodes.length;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const hubAttr = new Float32Array(count);
    const phases = new Float32Array(count);
    this.nodes.forEach((n, i) => {
      positions.set([n.pos.x, n.pos.y, n.pos.z], i * 3);
      colors.set([n.color.r, n.color.g, n.color.b], i * 3);
      sizes[i] = n.size;
      hubAttr[i] = n.hub;
      phases[i] = rand() * Math.PI * 2;
    });
    const nodeGeo = new THREE.BufferGeometry();
    nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    nodeGeo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    nodeGeo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    nodeGeo.setAttribute("aHub", new THREE.BufferAttribute(hubAttr, 1));
    nodeGeo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    this.nodeMat = this.pointMaterial(1);
    this.network.add(new THREE.Points(nodeGeo, this.nodeMat));

    // edges
    const ePos = new Float32Array(this.edges.length * 6);
    const eColor = new Float32Array(this.edges.length * 6);
    const eHub = new Float32Array(this.edges.length * 2);
    const eBase = new Float32Array(this.edges.length * 2);
    this.edges.forEach(([a, b], i) => {
      const pa = this.nodes[a].pos;
      const pb = this.nodes[b].pos;
      ePos.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], i * 6);
      const na = this.nodes[a];
      const nb = this.nodes[b];
      const fromCore = a === 0;
      const hubToHub = na.size > 20 && nb.size > 20;
      const hub = fromCore ? nb.hub : hubToHub ? -1 : Math.max(na.hub, nb.hub);
      const c = fromCore ? tones[nb.hub] : hubToHub ? accent2 : white;
      eColor.set([c.r, c.g, c.b, c.r, c.g, c.b], i * 6);
      eHub[i * 2] = eHub[i * 2 + 1] = hub;
      eBase[i * 2] = eBase[i * 2 + 1] = fromCore
        ? 0.55
        : hubToHub
          ? 0.28
          : 0.15;
    });
    const edgeGeo = new THREE.BufferGeometry();
    edgeGeo.setAttribute("position", new THREE.BufferAttribute(ePos, 3));
    edgeGeo.setAttribute("aColor", new THREE.BufferAttribute(eColor, 3));
    edgeGeo.setAttribute("aHub", new THREE.BufferAttribute(eHub, 1));
    edgeGeo.setAttribute("aBase", new THREE.BufferAttribute(eBase, 1));
    this.edgeMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uActive: { value: -1 }, uMix: { value: 0 } },
      vertexShader: /* glsl */ `
        attribute vec3 aColor; attribute float aHub; attribute float aBase;
        uniform float uActive; uniform float uMix;
        varying vec3 vColor; varying float vAlpha;
        void main(){
          vColor = aColor;
          float isActive = (uActive >= 0.0 && abs(aHub - uActive) < 0.5) ? 1.0 : 0.0;
          vAlpha = mix(aBase, mix(aBase * 0.35, 0.9, isActive), uMix);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: /* glsl */ `
        varying vec3 vColor; varying float vAlpha;
        void main(){ gl_FragColor = vec4(vColor, vAlpha);
          #include <colorspace_fragment>
        }`,
    });
    this.network.add(new THREE.LineSegments(edgeGeo, this.edgeMat));

    // packets travelling along edges
    const packetCount = this.compact ? 36 : 80;
    this.packetPositions = new Float32Array(packetCount * 3);
    const pColors = new Float32Array(packetCount * 3);
    const pSizes = new Float32Array(packetCount);
    const pHub = new Float32Array(packetCount).fill(-1);
    const pPhase = new Float32Array(packetCount);
    for (let i = 0; i < packetCount; i++) {
      this.packets.push({
        edge: Math.floor(rand() * this.edges.length),
        t: rand(),
        speed: 0.25 + rand() * 0.55,
        forward: rand() > 0.5,
      });
      const c = rand() > 0.3 ? accent : accent2;
      pColors.set([c.r, c.g, c.b], i * 3);
      pSizes[i] = 7 + rand() * 5;
      pPhase[i] = rand() * 6.28;
    }
    this.packetGeo = new THREE.BufferGeometry();
    this.packetGeo.setAttribute(
      "position",
      new THREE.BufferAttribute(this.packetPositions, 3),
    );
    this.packetGeo.setAttribute(
      "aColor",
      new THREE.BufferAttribute(pColors, 3),
    );
    this.packetGeo.setAttribute("aSize", new THREE.BufferAttribute(pSizes, 1));
    this.packetGeo.setAttribute("aHub", new THREE.BufferAttribute(pHub, 1));
    this.packetGeo.setAttribute("aPhase", new THREE.BufferAttribute(pPhase, 1));
    this.packetMat = this.pointMaterial(1.6);
    const packetPoints = new THREE.Points(this.packetGeo, this.packetMat);
    packetPoints.frustumCulled = false;
    this.network.add(packetPoints);
  }

  private pointMaterial(intensity: number) {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
        uActive: { value: -1 },
        uMix: { value: 0 },
        uIntensity: { value: intensity },
      },
      vertexShader: /* glsl */ `
        attribute vec3 aColor; attribute float aSize; attribute float aHub; attribute float aPhase;
        uniform float uTime; uniform float uPixelRatio; uniform float uActive; uniform float uMix;
        varying vec3 vColor; varying float vAlpha;
        void main(){
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          float isActive = (uActive >= 0.0 && abs(aHub - uActive) < 0.5) ? 1.0 : 0.0;
          float dim = (uActive >= 0.0 && aHub > -0.5) ? mix(1.0, mix(0.35, 1.0, isActive), uMix) : 1.0;
          float pulse = 0.85 + 0.15 * sin(uTime * 2.0 + aPhase);
          gl_PointSize = aSize * pulse * (1.0 + isActive * uMix * 0.5) * uPixelRatio * (9.0 / -mv.z);
          vColor = aColor;
          vAlpha = dim;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uIntensity;
        varying vec3 vColor; varying float vAlpha;
        void main(){
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float core = smoothstep(0.22, 0.0, d);
          float glow = smoothstep(0.5, 0.0, d);
          float a = (core + pow(glow, 2.5) * 0.55) * vAlpha;
          gl_FragColor = vec4(vColor * uIntensity, a);
          #include <colorspace_fragment>
        }`,
    });
  }

  private buildPanels() {
    const { palette, panels } = this.opts;
    const hubNodes = this.nodes.filter((n) => n.size > 20);
    panels.forEach((panel, i) => {
      const tone = panel.tone === "accent" ? palette.accent : palette.accent2;
      const tex = new THREE.CanvasTexture(
        drawPanel(panel.kind, panel.index, panel.title, tone, palette),
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      const w = this.compact ? 1.15 : 1.55;
      const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(w, w * (420 / 640)),
        new THREE.MeshBasicMaterial({
          map: tex,
          transparent: true,
          depthWrite: false,
          opacity: 0.95,
          side: THREE.DoubleSide,
        }),
      );
      const hub = hubNodes[i]?.pos ?? new THREE.Vector3();
      const outward = hub.clone().normalize();
      const anchor = hub
        .clone()
        .add(outward.multiplyScalar(this.compact ? 0.35 : 0.55))
        .add(new THREE.Vector3(0, this.compact ? 0.45 : 0.4, 0.4));
      mesh.position.copy(anchor);
      mesh.userData.index = i;
      mesh.renderOrder = 10;
      this.panelAnchors.push(anchor);
      this.panels.push(mesh);
      this.network.add(mesh);
    });
  }

  private buildAtmosphere() {
    const { palette } = this.opts;
    const rand = mulberry32(21);

    // orbit rings
    const ringColors = [palette.foreground, palette.accent2, palette.accent];
    [3.4, 4.6, 5.8].forEach((r, i) => {
      const curve = new THREE.EllipseCurve(0, 0, r, r * 0.92, 0, Math.PI * 2);
      const geo = new THREE.BufferGeometry().setFromPoints(
        curve.getPoints(160),
      );
      const ring = new THREE.LineLoop(
        geo,
        new THREE.LineBasicMaterial({
          color: color(ringColors[i]),
          transparent: true,
          opacity: i === 0 ? 0.09 : 0.12,
          depthWrite: false,
        }),
      );
      ring.rotation.set(Math.PI / 2 + (i - 1) * 0.35, i * 0.6, i * 0.2);
      this.rings.push(ring);
      this.root.add(ring);
    });

    // dust field
    const count = this.compact ? 260 : 700;
    const pos = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos.set(
        [(rand() - 0.5) * 30, (rand() - 0.5) * 18, -rand() * 14 + 2],
        i * 3,
      );
      seeds[i] = rand();
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    this.dustMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: color(palette.foreground) },
        uPixelRatio: { value: this.renderer.getPixelRatio() },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed; uniform float uTime; uniform float uPixelRatio; varying float vA;
        void main(){
          vec3 p = position;
          p.y += sin(uTime * 0.15 + aSeed * 30.0) * 0.4;
          p.x += cos(uTime * 0.1 + aSeed * 20.0) * 0.3;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = (1.0 + aSeed * 2.0) * uPixelRatio;
          vA = 0.15 + aSeed * 0.35;
        }`,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor; varying float vA;
        void main(){ if (length(gl_PointCoord - 0.5) > 0.5) discard; gl_FragColor = vec4(uColor, vA);
          #include <colorspace_fragment>
        }`,
    });
    const dust = new THREE.Points(geo, this.dustMat);
    this.scene.add(dust);
  }

  /* ----- layout ----- */

  private resize() {
    const parent = this.canvas.parentElement;
    const w = parent?.clientWidth ?? window.innerWidth;
    const h = parent?.clientHeight ?? window.innerHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;

    const tan = Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const aspect = w / h;
    if (aspect >= 1.05) {
      // landscape — ecosystem sits right of centre, leaving room for the headline
      this.baseZ = 11.5;
      const halfW = this.baseZ * tan * aspect;
      this.root.position.set(Math.min(halfW * 0.5, 3.8), 0.05, 0);
    } else {
      // portrait — fit the network width, lift it above the copy
      const fitHalfWidth = this.compact ? 3.3 : 4.2;
      this.baseZ = Math.max(11, fitHalfWidth / (tan * aspect));
      const halfH = this.baseZ * tan;
      this.root.position.set(0, halfH * 0.4, 0);
    }
    this.camera.updateProjectionMatrix();
    if (!this.running) this.render(0);
  }

  /* ----- input ----- */

  private onPointerMove = (event: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    this.pointerInside = event.pointerType === "mouse";
  };

  private onPointerLeave = () => {
    this.pointerInside = false;
    this.setHovered(null);
  };

  private onPointerDown = (event: PointerEvent) => {
    this.downAt = { x: event.clientX, y: event.clientY };
  };

  private onPointerUp = (event: PointerEvent) => {
    if (!this.downAt) return;
    const moved = Math.hypot(
      event.clientX - this.downAt.x,
      event.clientY - this.downAt.y,
    );
    this.downAt = null;
    if (moved > 8) return;
    const rect = this.canvas.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const hit = this.pick(ndc);
    if (hit !== null) this.opts.onSelect?.(hit);
  };

  private onVisibility = () => {
    if (document.hidden) this.stop();
  };

  private pick(ndc: THREE.Vector2): number | null {
    this.raycaster.setFromCamera(ndc, this.camera);
    const hits = this.raycaster.intersectObjects(this.panels, false);
    return hits.length ? (hits[0].object.userData.index as number) : null;
  }

  private setHovered(index: number | null) {
    if (this.hovered === index) return;
    this.hovered = index;
    this.canvas.style.cursor = index === null ? "" : "pointer";
    this.opts.onHover?.(index);
  }

  /* ----- public API ----- */

  /** Highlight a service hub (driven by the panel hover or the HTML legend). */
  highlight(index: number | null) {
    this.highlighted = index;
  }

  /** 0 → hero at rest, 1 → hero scrolled away. */
  setScroll(progress: number) {
    this.scroll = THREE.MathUtils.clamp(progress, 0, 1);
  }

  start() {
    if (this.running || this.disposed) return;
    this.running = true;
    this.last = performance.now();
    const loop = (now: number) => {
      if (!this.running) return;
      this.raf = requestAnimationFrame(loop);
      const dt = Math.min((now - this.last) / 1000, 0.05);
      this.last = now;
      this.render(Math.max(dt, 0));
    };
    this.raf = requestAnimationFrame(loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  dispose() {
    this.disposed = true;
    this.stop();
    this.resizeObserver.disconnect();
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerleave", this.onPointerLeave);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.canvas.removeEventListener("pointerup", this.onPointerUp);
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      mesh.geometry?.dispose();
      const mats = Array.isArray(mesh.material)
        ? mesh.material
        : mesh.material
          ? [mesh.material]
          : [];
      for (const m of mats) {
        (m as THREE.MeshBasicMaterial).map?.dispose();
        m.dispose();
      }
    });
    this.renderer.dispose();
  }

  /* ----- frame ----- */

  private render(dt: number) {
    const reduced = this.opts.reducedMotion;
    const speed = reduced ? 0.12 : 1;
    this.time += dt * speed;
    const t = this.time;

    // pointer parallax
    const px = this.pointerInside && !reduced ? this.pointer.x : 0;
    const py = this.pointerInside && !reduced ? this.pointer.y : 0;
    this.pointerSmooth.x = damp(this.pointerSmooth.x, px, 3, dt);
    this.pointerSmooth.y = damp(this.pointerSmooth.y, py, 3, dt);

    // hover picking
    if (this.pointerInside && this.scroll < 0.5) {
      this.setHovered(this.pick(this.pointer));
    }

    const active = this.hovered ?? this.highlighted;
    this.highlightMix = damp(this.highlightMix, active === null ? 0 : 1, 6, dt);
    const activeValue = active ?? -1;

    // scroll choreography: dive into the network as the hero leaves
    const s = this.scroll;
    const ease = s * s * (3 - 2 * s);
    this.camera.position.z = this.baseZ - ease * 4.5;
    this.camera.position.x = this.pointerSmooth.x * 0.45;
    this.camera.position.y = this.pointerSmooth.y * 0.3 - ease * 0.6;
    this.camera.lookAt(
      this.root.position.x * 0.5,
      this.root.position.y * 0.4,
      0,
    );

    this.network.rotation.y =
      t * 0.045 + this.pointerSmooth.x * 0.35 + ease * 0.9;
    this.network.rotation.x =
      -this.pointerSmooth.y * 0.18 + Math.sin(t * 0.2) * 0.05;
    this.shell.rotation.y = -t * 0.12;
    this.shell.rotation.x = t * 0.07;
    this.rings.forEach((ring, i) => {
      ring.rotation.z = t * (0.03 + i * 0.015) * (i % 2 ? -1 : 1);
    });

    // uniforms
    this.coreMat.uniforms.uTime.value = t;
    this.coreMat.uniforms.uEnergy.value = this.highlightMix;
    for (const mat of [this.nodeMat, this.packetMat]) {
      mat.uniforms.uTime.value = t;
      mat.uniforms.uActive.value = activeValue;
      mat.uniforms.uMix.value = this.highlightMix;
    }
    this.edgeMat.uniforms.uActive.value = activeValue;
    this.edgeMat.uniforms.uMix.value = this.highlightMix;
    this.dustMat.uniforms.uTime.value = t;

    // packets random-walk the graph
    for (let i = 0; i < this.packets.length; i++) {
      const p = this.packets[i];
      p.t += dt * speed * p.speed;
      if (p.t >= 1) {
        const [a, b] = this.edges[p.edge];
        const arrived = p.forward ? b : a;
        const options = this.adjacency[arrived];
        const next =
          options[Math.floor(Math.random() * options.length)] ?? p.edge;
        p.edge = next;
        p.forward = this.edges[next][0] === arrived;
        p.t = 0;
      }
      const [a, b] = this.edges[p.edge];
      const from = this.nodes[p.forward ? a : b].pos;
      const to = this.nodes[p.forward ? b : a].pos;
      this.packetPositions[i * 3] = from.x + (to.x - from.x) * p.t;
      this.packetPositions[i * 3 + 1] = from.y + (to.y - from.y) * p.t;
      this.packetPositions[i * 3 + 2] = from.z + (to.z - from.z) * p.t;
    }
    (this.packetGeo.attributes.position as THREE.BufferAttribute).needsUpdate =
      true;

    // panels billboard toward camera, float, and respond to highlight
    const camQuat = this.camera.quaternion;
    const parentQuat = this.network
      .getWorldQuaternion(new THREE.Quaternion())
      .invert();
    this.panels.forEach((panel, i) => {
      const anchor = this.panelAnchors[i];
      panel.position.set(
        anchor.x,
        anchor.y + Math.sin(t * 0.8 + i * 1.7) * 0.08,
        anchor.z,
      );
      panel.quaternion.copy(parentQuat).multiply(camQuat);
      const isActive = active === i;
      const target = active === null ? 1 : isActive ? 1.14 : 0.9;
      const sc = damp(panel.scale.x, target, 8, dt);
      panel.scale.setScalar(sc);
      const mat = panel.material as THREE.MeshBasicMaterial;
      mat.opacity =
        damp(mat.opacity, active === null || isActive ? 0.95 : 0.4, 8, dt) *
        (1 - ease * 0.8);
    });

    this.renderer.render(this.scene, this.camera);

    if (!this.readyFired) {
      this.readyFired = true;
      this.opts.onReady?.();
    }
  }
}
