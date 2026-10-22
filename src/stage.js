// Full-screen shader stage. Draws the current chapter scene, the light shaft,
// dust in the beam, fog, the cursor light and the light-wipe between chapters.
// A chapter can carry a Higgsfield clip (scrubbed by scroll) or a still; without
// one it falls back to a procedural hall so the page always works.
import * as THREE from 'three';

const vert = /* glsl */`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;

const frag = /* glsl */`
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform float uMouseAmt;
uniform vec4 uA; uniform vec4 uB;      // shaft x, tilt, warm, fog
uniform vec4 uA2; uniform vec4 uB2;    // arches, many, open, -
uniform float uMix; uniform float uIntro; uniform float uLocal; uniform float uOpen;
uniform sampler2D uTexA; uniform sampler2D uTexB; uniform float uHasA; uniform float uHasB;
uniform vec2 uTexAR; uniform vec2 uTexBR;
uniform float uVel; uniform float uTravel; uniform float uPull; uniform float uKick; uniform float uDir;   // glide speed 0..1, distance travelled (chapters)

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float fbm(vec2 p) { float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; } return v; }

vec2 coverUv(vec2 uv, vec2 texRes) {
  float sa = uRes.x / uRes.y, ta = texRes.x / max(texRes.y, 1.0);
  vec2 s = sa > ta ? vec2(1.0, ta / sa) : vec2(sa / ta, 1.0);
  return (uv - 0.5) * s + 0.5;
}

// arch silhouettes for the procedural hall
float arches(vec2 p, float amt) {
  if (amt <= 0.0) return 0.0;
  float aspect = uRes.x / uRes.y; vec2 q = vec2(p.x * aspect, p.y);
  float w = 0.42; float cx = mod(q.x + 0.1, w) - w * 0.5;
  float body = step(abs(cx), w * 0.32) * step(q.y, 0.62);
  float top = step(length(vec2(cx, q.y - 0.62)), w * 0.32);
  float opening = max(body, top) * step(0.12, q.y);
  return opening * amt;
}

vec3 scene(vec2 uv, vec4 P, vec4 P2, sampler2D tex, float hasTex, vec2 texRes, float which, float zoom, vec2 focus, float blur) {
  float t = uTime;
  vec2 m = (uMouse - 0.5) * 0.045 * uMouseAmt + vec2(sin(t * 0.31), cos(t * 0.23)) * 0.0035;
  vec3 cool = vec3(0.30, 0.36, 0.62), gold = vec3(1.0, 0.85, 0.54);
  vec3 tint = mix(cool, gold, P.z);

  // base: clip/still if present, else procedural hall
  vec3 col;
  if (hasTex > 0.5) {
    // slow push-in: the camera drifts forward as the chapter plays
    vec2 base = (uv - 0.5) * (1.0 - 0.09 * zoom) + 0.5 + m * 1.5;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 6; i++) {
      float fi = float(i) / 5.0;
      vec2 q = focus + (base - focus) * (1.0 - blur * 0.16 * fi);
      acc += texture2D(tex, coverUv(q, texRes)).rgb;
    }
    col = acc / 6.0;
    col = pow(col, vec3(1.08)) * 0.92;
  } else {
    float g = smoothstep(1.2, -0.2, uv.y);
    col = mix(vec3(0.010, 0.010, 0.014), vec3(0.035, 0.03, 0.04) + tint * 0.02, g * 0.6);
    // far wall + arches lit from behind
    float ar = arches(uv + vec2(t * 0.002 + m.x * 3.0, 0.0), P2.x);
    vec3 skyBehind = mix(cool * 0.25, tint * 0.6, smoothstep(0.1, 0.9, uv.y));
    col = mix(col, skyBehind * (0.45 + 0.25 * fbm(uv * 3.0 + t * 0.03)), ar * 0.55);
    // floor sheen
    float floorL = smoothstep(0.25, 0.0, uv.y) * 0.06;
    col += tint * floorL * (0.6 + 0.4 * noise(vec2(uv.x * 40.0, t * 0.2)));
  }

  // light shaft from the top
  float x0 = P.x + P.y * (1.0 - uv.y) + m.x * 2.0;
  float width = mix(0.035, 0.16, 1.0 - uv.y) + P2.z * uOpen * 1.2;
  float d = abs(uv.x - x0) * (uRes.x / uRes.y);
  float shaft = smoothstep(width, 0.0, d) * smoothstep(-0.1, 0.9, uv.y);
  shaft *= 0.75 + 0.25 * fbm(vec2(uv.x * 6.0, uv.y * 2.0 - t * 0.08));
  // many small shafts for ILLUMINATE
  if (P2.y > 0.0) {
    float many = 0.0;
    for (int i = 0; i < 6; i++) { float fi = float(i); float xi = 0.12 + fi * 0.15 + 0.02 * sin(t * 0.3 + fi);
      float di = abs(uv.x - xi - 0.05 * (1.0 - uv.y)) * (uRes.x / uRes.y);
      many += smoothstep(0.02 + 0.03 * (1.0 - uv.y), 0.0, di) * (0.4 + 0.6 * fract(fi * 0.37 + 0.2)); }
    shaft = max(shaft, many * P2.y * smoothstep(0.0, 0.7, uLocal * 1.6));
  }
  vec3 shaftCol = mix(cool * 1.2, gold, P.z);
  col += shaftCol * shaft * (0.55 + 0.25 * sin(t * 0.7)) * (1.0 - hasTex * 0.88);

  // dust in the beam
  vec2 duv = uv * vec2(uRes.x / uRes.y, 1.0) * 60.0 + vec2(t * 0.6, -t * 1.4);
  vec2 cell = floor(duv); vec2 f = fract(duv) - 0.5;
  float r = hash(cell + which); vec2 off = vec2(hash(cell + 7.0), hash(cell + 3.0)) - 0.5;
  float mote = smoothstep(0.08, 0.0, length(f - off * 0.6)) * step(0.86, r);
  vec2 casp = vec2(uRes.x / uRes.y, 1.0);
  float near = exp(-pow(length((uv - uMouse) * casp) / 0.2, 2.0)) * uMouseAmt;
  col += gold * mote * (shaft * 2.2 + 0.03 + near * 2.5) * (0.5 + 0.5 * sin(t * 2.0 + r * 30.0));

  // fog
  float fog = fbm(uv * vec2(2.2, 4.0) + vec2(t * 0.02, -t * 0.01));
  col += mix(cool, tint, 0.5) * fog * P.w * 0.07;

  return col;
}

// dust at three depths that flies toward you as you travel
vec3 depthDust(vec2 uv, vec2 foc) {
  vec3 acc = vec3(0.0);
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  for (int k = 0; k < 3; k++) {
    float fk = float(k);
    float s = fract(uTravel * 0.9 + fk / 3.0 + uTime * 0.01);
    float scale = mix(5.0, 0.45, s);                 // far -> near
    float fade = sin(s * 3.14159);
    vec2 p = (uv - foc) * asp * scale * 7.0;
    vec2 cell = floor(p); vec2 f = fract(p) - 0.5;
    float r = hash(cell + fk * 17.0);
    vec2 off = vec2(hash(cell + 5.0 + fk), hash(cell + 9.0 + fk)) - 0.5;
    vec2 d = f - off * 0.7;
    // streak along the radial direction while gliding
    vec2 dir = normalize((uv - foc) * asp + 1e-4);
    float along = dot(d, dir), across = dot(d, vec2(-dir.y, dir.x));
    float len = 0.05 + uVel * 0.35 * s;
    float m = smoothstep(0.06 + 0.04 * s, 0.0, length(vec2(along / (1.0 + len * 8.0), across))) * step(0.9, r);
    acc += vec3(1.0, 0.86, 0.6) * m * fade * (0.25 + 0.75 * s) * (0.35 + uVel * 0.9);
  }
  return acc;
}

void main() {
  vec2 uv = vUv;
  // where the light is: the point we fly toward
  vec2 focA = vec2(uA.x + uA.y * 0.55, 0.45);
  vec2 focB = vec2(uB.x + uB.y * 0.55, 0.45);
  float e = uMix * uMix * (3.0 - 2.0 * uMix);
  // fly into scene A (it rushes past), arrive in scene B (it settles from close in)
  float lean = 1.06 + 0.07 * uPull + 0.05 * uKick;     // forward pushes in, back pulls out
  vec2 uvA = focA + (uv - focA) / (lean + 1.8 * e * e);
  vec2 uvB = focB + (uv - focB) / (1.06 + 0.28 * (1.0 - e));
  float blurA = clamp(uVel * 0.6 + e * 1.2 + abs(uPull) * 0.55 + uKick * 0.4, 0.0, 1.0);
  float blurB = clamp(uVel * 0.6 + (1.0 - e) * 0.8, 0.0, 1.0) * step(0.001, uMix);
  vec3 a = scene(uvA, uA, uA2, uTexA, uHasA, uTexAR, 1.0, uLocal, focA, blurA);
  vec3 col = a;
  vec2 foc = focA;
  if (uMix > 0.001) {
    vec3 b = scene(uvB, uB, uB2, uTexB, uHasB, uTexBR, 2.0, 0.0, focB, blurB);
    // the next scene opens out of the light, like stepping through it
    foc = mix(focA, focB, e);
    vec2 asp = vec2(uRes.x / uRes.y, 1.0);
    float n = fbm(uv * 2.5 + uTime * 0.05) * 0.18;
    float dist = length((uv - foc) * asp) + n;
    float reach = e * 1.9;
    float mask = smoothstep(reach, reach - 0.45, dist);
    float edge = smoothstep(0.25, 0.0, abs(dist - reach + 0.22)) * sin(uMix * 3.14159);
    col = mix(a * (1.0 - e * 0.25), b, mask) + vec3(1.0, 0.84, 0.55) * edge * 0.1;
  }
  col += depthDust(uv, foc);
  float fwd = max(uPull, 0.0) + max(uDir, 0.0) * uVel * 0.6;
  float back = max(-uPull, 0.0) + max(-uDir, 0.0) * uVel * 0.6;
  vec2 asp2 = vec2(uRes.x / uRes.y, 1.0);
  float fglow = exp(-pow(length((uv - foc) * asp2) / 0.35, 2.0));
  col += vec3(1.0, 0.82, 0.5) * fglow * (fwd * 0.18 + uKick * 0.12);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  col = mix(col, vec3(lum) * vec3(0.82, 0.9, 1.08), back * 0.35);
  col *= 1.0 - back * 0.3 * smoothstep(0.3, 0.9, length((uv - 0.5) * asp2));

  // the cursor carries a warm light
  vec2 asp = vec2(uRes.x / uRes.y, 1.0);
  float md = length((uv - uMouse) * asp);
  float ml = exp(-pow(md / 0.19, 2.0)) * uMouseAmt;          // soft pool
  float core = exp(-pow(md / 0.05, 2.0)) * uMouseAmt;         // small bright core
  vec3 warm = vec3(1.0, 0.82, 0.52);
  col = col * (1.0 + ml * 1.35) + warm * (ml * 0.035 + core * 0.06) + warm * col * ml * 0.6;

  // vignette, intro fade, end bloom
  float v = smoothstep(1.25, 0.25, length((uv - 0.5) * vec2(1.25, 1.0)));
  col *= mix(0.35, 1.0, v);
  col *= uIntro;
  col = col / (1.0 + col * 0.35);       // soft tone map
  gl_FragColor = vec4(pow(col, vec3(0.95)), 1.0);
}`;

export class Stage {
  constructor(canvas, chapters) {
    this.chapters = chapters;
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    const blank = new THREE.DataTexture(new Uint8Array([0, 0, 0, 255]), 1, 1); blank.needsUpdate = true;
    this.blank = blank;
    this.u = {
      uRes: { value: new THREE.Vector2() }, uTime: { value: 0 }, uMouse: { value: new THREE.Vector2(0.5, 0.5) }, uMouseAmt: { value: 0 },
      uA: { value: new THREE.Vector4() }, uB: { value: new THREE.Vector4() }, uA2: { value: new THREE.Vector4() }, uB2: { value: new THREE.Vector4() },
      uMix: { value: 0 }, uIntro: { value: 0 }, uLocal: { value: 0 }, uOpen: { value: 0 },
      uTexA: { value: blank }, uTexB: { value: blank }, uHasA: { value: 0 }, uHasB: { value: 0 },
      uTexAR: { value: new THREE.Vector2(16, 9) }, uTexBR: { value: new THREE.Vector2(16, 9) },
      uVel: { value: 0 }, uTravel: { value: 0 }, uPull: { value: 0 }, uKick: { value: 0 }, uDir: { value: 0 },
    };
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: vert, fragmentShader: frag, uniforms: this.u, depthTest: false }));
    this.scene.add(this.mesh);
    this.media = chapters.map(() => null);   // { tex, el, w, h, kind }
    this.mouse = new THREE.Vector2(0.5, 0.5);
    this.mouseT = new THREE.Vector2(0.5, 0.5);
    this.resize();
    addEventListener('resize', () => this.resize());
  }

  resize() {
    const w = innerWidth, h = innerHeight;
    this.renderer.setSize(w, h, false);
    this.u.uRes.value.set(w, h);
  }

  // Try clip first, then still. Missing files are fine.
  async loadMedia(i, base, hasVideo = false) {
    const tryVideo = () => new Promise((res) => {
      const v = document.createElement('video');
      Object.assign(v, { muted: true, playsInline: true, preload: 'auto', crossOrigin: 'anonymous', loop: false });
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      // H.264 where the browser has it (Safari, Chrome), VP9 WebM otherwise
      const h264 = v.canPlayType('video/mp4; codecs="avc1.640028"');
      v.src = h264 ? `${base}.mp4` : `${base}.webm`;
      v.addEventListener('loadeddata', () => res(v), { once: true });
      v.addEventListener('error', () => res(null), { once: true });
      setTimeout(() => res(null), 15000);
    });
    const tryImage = () => new Promise((res) => {
      const img = new Image(); img.decoding = 'async';
      img.onload = () => res(img); img.onerror = () => res(null); img.src = `${base}.jpg`;
    });
    const v = hasVideo ? await tryVideo() : null;
    if (v) { const tex = new THREE.VideoTexture(v); tex.colorSpace = THREE.SRGBColorSpace;
      this.media[i] = { tex, el: v, w: v.videoWidth, h: v.videoHeight, kind: 'video' }; return true; }
    const img = await tryImage();
    if (img) { const tex = new THREE.Texture(img); tex.needsUpdate = true; tex.colorSpace = THREE.SRGBColorSpace;
      this.media[i] = { tex, el: img, w: img.naturalWidth, h: img.naturalHeight, kind: 'image' }; return true; }
    return false;
  }

  setMouse(x, y) { this.mouseT.set(x / innerWidth, 1 - y / innerHeight); }

  // a = chapter index, local = 0..1 inside it, mix = 0..1 blend to the next chapter
  frame(t, a, local, mix, opts = {}) {
    const u = this.u, ch = this.chapters;
    const b = Math.min(a + 1, ch.length - 1);
    const set = (v4, v42, c) => { const s = c.scene; v4.set(s.shaft, s.tilt, s.warm, s.fog); v42.set(s.arches || 0, s.many || 0, s.open || 0, 0); };
    set(u.uA.value, u.uA2.value, ch[a]); set(u.uB.value, u.uB2.value, ch[b]);
    const bind = (i, key, has, res) => {
      const m = this.media[i];
      if (m) { u[key].value = m.tex; u[has].value = 1; u[res].value.set(m.w, m.h); }
      else { u[key].value = this.blank; u[has].value = 0; }
    };
    // Play the current clip and the next one (so it is already moving when it fades in).
    // Every other clip pauses. No seeking while a clip is on screen, so no black frames.
    const rate = opts.rate ?? 0.27;
    this.media.forEach((m, i) => {
      if (!m || m.kind !== 'video') return;
      const v = m.el;
      if (i === a || (i === b && mix > 0) || (i === b && local > 0.6)) {
        if (i === b && i !== a && !m.armed) { try { v.currentTime = 0; } catch {} m.armed = true; v.play().catch(() => {}); }
        v.playbackRate = rate; v.loop = false;
        // play once, then hold the last frame (no jump back to the start)
        if (opts.play === false) { if (!v.paused) v.pause(); }
        else if (v.paused && !v.ended) v.play().catch(() => {});
      } else if (!v.paused) { v.pause(); m.armed = false; }
      if (i === a) m.armed = false;
    });
    bind(a, 'uTexA', 'uHasA', 'uTexAR');
    bind(b, 'uTexB', 'uHasB', 'uTexBR');
    this.mouse.lerp(this.mouseT, 0.08);
    u.uMouse.value.copy(this.mouse);
    u.uMouseAmt.value += ((opts.cursor ? 1 : 0) - u.uMouseAmt.value) * 0.05;
    u.uTime.value = t; u.uMix.value = mix; u.uLocal.value = local;
    u.uVel.value += ((opts.vel ?? 0) - u.uVel.value) * 0.12;
    u.uTravel.value = opts.travel ?? 0;
    u.uPull.value = opts.pull ?? 0; u.uKick.value = opts.kick ?? 0;
    u.uDir.value += ((opts.dir ?? 0) - u.uDir.value) * 0.1;
    u.uIntro.value += ((opts.intro ?? 1) - u.uIntro.value) * 0.03;
    u.uOpen.value += ((opts.open ?? 0) - u.uOpen.value) * 0.04;
    this.renderer.render(this.scene, this.camera);
  }
}
