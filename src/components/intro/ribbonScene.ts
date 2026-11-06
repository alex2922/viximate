import * as THREE from "three";

/* ==========================================================================
   The ribbon: one glossy tube that draws itself through the About section
   as it scrolls by, green at one end, lavender at the other.
   ========================================================================== */

/** The four discipline colours, cold to hot along the ribbon. */
export type RibbonPalette = { tones: [string, string, string, string] };

/** A path point in canvas pixels (x right, y down) plus a depth of -1..1. */
export type Point = [number, number, number];
export type PathFor = (width: number, height: number) => Point[];

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

const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const fragment = /* glsl */ `
  uniform vec3 uC0;
  uniform vec3 uC1;
  uniform vec3 uC2;
  uniform vec3 uC3;
  uniform float uProgress;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    if (vUv.x > uProgress) discard;
    // The four discipline colours along its length.
    float t = smoothstep(0.05, 0.95, vUv.x) * 3.0;
    vec3 base = t < 1.0 ? mix(uC0, uC1, t)
      : t < 2.0 ? mix(uC1, uC2, t - 1.0)
      : mix(uC2, uC3, t - 2.0);
    vec3 n = normalize(vNormal);
    vec3 l = normalize(vec3(-0.4, 0.7, 0.6));
    float diffuse = 0.35 + 0.65 * max(dot(n, l), 0.0);
    vec3 h = normalize(l + vView);
    float spec = pow(max(dot(n, h), 0.0), 80.0) * 0.6;
    float rim = pow(1.0 - max(dot(n, vView), 0.0), 3.0);
    vec3 color = base * diffuse + spec + rim * 0.25 * uC3;
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export class RibbonScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(0, 1, 0, -1, -1000, 1000);
  private mesh: THREE.Mesh<THREE.TubeGeometry, THREE.ShaderMaterial>;
  private canvas: HTMLCanvasElement;
  private resizeObserver: ResizeObserver;

  private pathFor: PathFor;

  constructor(
    canvas: HTMLCanvasElement,
    palette: RibbonPalette,
    pathFor: PathFor,
  ) {
    this.canvas = canvas;
    this.pathFor = pathFor;
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    const material = new THREE.ShaderMaterial({
      vertexShader: vertex,
      fragmentShader: fragment,
      uniforms: {
        uC0: { value: cssColor(palette.tones[0], "#8a4af5") },
        uC1: { value: cssColor(palette.tones[1], "#f41f94") },
        uC2: { value: cssColor(palette.tones[2], "#fc4926") },
        uC3: { value: cssColor(palette.tones[3], "#ffce2b") },
        uProgress: { value: 0 },
      },
    });
    this.mesh = new THREE.Mesh(new THREE.TubeGeometry(), material);
    this.scene.add(this.mesh);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas);
    this.resize();
  }

  /** Rebuild the tube, for when the text it threads around has moved. */
  resize() {
    const { clientWidth: w, clientHeight: h } = this.canvas;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    // Pixel units, y down, so the path maps straight onto the box.
    Object.assign(this.camera, { left: 0, right: w, top: 0, bottom: -h });
    this.camera.updateProjectionMatrix();
    const depth = Math.min(w, h) * 0.3;
    const curve = new THREE.CatmullRomCurve3(
      this.pathFor(w, h).map(
        ([x, y, z]) => new THREE.Vector3(x, -y, z * depth),
      ),
      false,
      "centripetal",
    );
    const radius = THREE.MathUtils.clamp(w * 0.016, 9, 24);
    this.mesh.geometry.dispose();
    this.mesh.geometry = new THREE.TubeGeometry(curve, 400, radius, 24, false);
    this.render();
  }

  setProgress(progress: number) {
    this.mesh.material.uniforms.uProgress.value = progress;
    this.render();
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.resizeObserver.disconnect();
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    this.renderer.dispose();
  }
}
