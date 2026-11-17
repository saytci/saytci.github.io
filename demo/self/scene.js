/* SELF — 3D-студия за страницей (three.js).
   Все предметы построены кодом. Камера при прокрутке перелетает от предмета к предмету:
   каждый раздел отмечает невидимой коробкой [data-stage], где на экране должен стоять его предмет. */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

const root = document.documentElement;
const host = document.getElementById("scene");
const fail = () => root.classList.add("no3d");

if (!window.__no3d && host && !root.classList.contains("no3d")) {
  try { start(); } catch (e) { console.warn("3D off:", e); fail(); }
}

function start() {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const coarse = matchMedia("(pointer: coarse)").matches;
  const HQ = !coarse && Math.min(screen.width, screen.height) >= 700;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, HQ ? 2 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const GROUND = new THREE.Color("#E0C9C7");
  scene.background = (() => {
    const c = document.createElement("canvas"); c.width = 256; c.height = 256;
    const x = c.getContext("2d");
    const grd = x.createRadialGradient(180, 70, 10, 150, 110, 260);
    grd.addColorStop(0, "#E9D4D1"); grd.addColorStop(0.55, "#E0C9C7"); grd.addColorStop(1, "#D6BDBA");
    x.fillStyle = grd; x.fillRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  scene.fog = new THREE.Fog(GROUND, 8, 24);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
  pmrem.dispose(); if (roomEnv.dispose) roomEnv.dispose();
  scene.environmentIntensity = 0.9;

  const key = new THREE.DirectionalLight("#fff4ef", 1.6);
  key.position.set(-3, 6, 5);
  scene.add(key);
  const rim = new THREE.DirectionalLight("#ffd6cf", 0.8);
  rim.position.set(4, 3, -4);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight("#fff6f3", "#d4b3ae", 0.55));

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 200);

  // ---------- Материалы ----------
  const M = {
    glass: new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.28, transmission: 1, thickness: 0.35, ior: 1.5, attenuationColor: new THREE.Color("#E7C4BF"), attenuationDistance: 0.9, clearcoat: 0.6, clearcoatRoughness: 0.15, specularIntensity: 1 }),
    capGlass: new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.06, transmission: 1, thickness: 0.5, ior: 1.5, attenuationColor: new THREE.Color("#EFD6D2"), attenuationDistance: 1.2, clearcoat: 1, clearcoatRoughness: 0.03 }),
    jarGlass: new THREE.MeshPhysicalMaterial({ color: "#ffffff", metalness: 0, roughness: 0.36, transmission: 1, thickness: 0.2, ior: 1.5, attenuationColor: new THREE.Color("#EBD3CF"), attenuationDistance: 0.6 }),
    tubeClear: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0.1, transmission: 1, thickness: 0.02 }),
    cream: new THREE.MeshStandardMaterial({ color: "#f4e7e3", roughness: 0.6 }),
    liquid: new THREE.MeshPhysicalMaterial({ color: "#dc9c97", roughness: 0.3, clearcoat: 0.6, sheen: 0.4, sheenColor: new THREE.Color("#ffd1ca") }),
    etch: new THREE.MeshPhysicalMaterial({ color: "#b08883", roughness: 0.4, clearcoat: 1, clearcoatRoughness: 0.2, transparent: true, depthWrite: false }),
    pearl: new THREE.MeshPhysicalMaterial({ color: "#e9dad6", roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.1, iridescence: 0.35, iridescenceIOR: 1.3, sheen: 0.5, sheenColor: new THREE.Color("#ffd9d2") }),
    pearlLid: new THREE.MeshPhysicalMaterial({ color: "#efe6e3", roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.08 }),
    chrome: new THREE.MeshStandardMaterial({ color: "#efe9e7", metalness: 1, roughness: 0.1 }),
    rosegold: new THREE.MeshStandardMaterial({ color: "#dcab9e", metalness: 1, roughness: 0.22 }),
    mirror: new THREE.MeshStandardMaterial({ color: "#f2d8d3", metalness: 1, roughness: 0.12 }),
    bullet: new THREE.MeshPhysicalMaterial({ color: "#a8747a", roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2 }),
    cocoa: new THREE.MeshPhysicalMaterial({ color: "#5a3a31", roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15 }),
    powder: new THREE.MeshStandardMaterial({ color: "#e8bfae", roughness: 0.95 }),
    bristle: new THREE.MeshStandardMaterial({ color: "#f2e6e0", roughness: 0.9 }),
    acrylic: new THREE.MeshPhysicalMaterial({ color: "#e7b3ad", roughness: 0.2, transparent: true, opacity: 0.88, clearcoat: 1 }),
    gem: new THREE.MeshPhysicalMaterial({ color: "#ffffff", roughness: 0, metalness: 0, clearcoat: 1, iridescence: 0.6, ior: 2.4 }),
    amber: new THREE.MeshPhysicalMaterial({ color: "#d9958b", roughness: 0.15, transparent: true, opacity: 0.78, clearcoat: 1, depthWrite: false }),
    tube: new THREE.MeshPhysicalMaterial({ color: "#eccbc5", roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.2, side: THREE.DoubleSide }),
    porcelain: new THREE.MeshPhysicalMaterial({ color: "#f2e9e6", roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.45, sheen: 0.35, sheenColor: new THREE.Color("#ffe3dc") }),
    plinth: new THREE.MeshPhysicalMaterial({ color: "#ead8d4", roughness: 0.5, clearcoat: 0.3 })
  };

  // Мягкая тень-пятно под предметом (без карт теней — дёшево для телефона)
  const shadowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d");
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, "rgba(0,0,0,.55)"); grd.addColorStop(.45, "rgba(0,0,0,.22)"); grd.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  })();
  const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, color: "#7d4d48", transparent: true, opacity: 0.5, depthWrite: false, toneMapped: false });
  const shadowGeo = new THREE.PlaneGeometry(1, 1);
  function blob(parent, x, z, sx, sz, op = 0.5) {
    const m = new THREE.Mesh(shadowGeo, shadowMat.clone());
    m.material.opacity = op;
    m.rotation.x = -Math.PI / 2; m.position.set(x, 0.002, z); m.scale.set(sx, sz, 1);
    m.renderOrder = -1;
    parent.add(m); return m;
  }
  const lathe = (pts, seg = 48) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  const mesh = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); return m; };

  // ---------- Предметы ----------
  function makeBottle() {
    const g = new THREE.Group();
    // Рельеф «Self» на передней грани: карта рельефа + карта шероховатости (буквы — гладкое стекло)
    const W = 1024, Hh = 1536;
    const bumpC = document.createElement("canvas"); bumpC.width = W; bumpC.height = Hh;
    const roughC = document.createElement("canvas"); roughC.width = W; roughC.height = Hh;
    const bumpT = new THREE.CanvasTexture(bumpC), roughT = new THREE.CanvasTexture(roughC);
    const draw = () => {
      const font = '400 470px "Literata", Georgia, serif';
      const b = bumpC.getContext("2d");
      b.fillStyle = "#000"; b.fillRect(0, 0, W, Hh);
      b.filter = "blur(7px)"; b.fillStyle = "#fff"; b.font = font; b.textAlign = "center"; b.textBaseline = "alphabetic";
      b.fillText("Self", W * 0.56, Hh * 0.8); b.filter = "none";
      const r = roughC.getContext("2d");
      r.fillStyle = "#fff"; r.fillRect(0, 0, W, Hh);
      r.fillStyle = "#141414"; r.font = font; r.textAlign = "center"; r.textBaseline = "alphabetic";
      r.fillText("Self", W * 0.56, Hh * 0.8);
      bumpT.needsUpdate = roughT.needsUpdate = true;
    };
    draw();
    if (document.fonts && document.fonts.load) document.fonts.load('400 470px "Literata"').then(draw).catch(() => {});
    const front = M.glass.clone();
    front.bumpMap = bumpT; front.bumpScale = 14; front.roughnessMap = roughT; front.roughness = 0.4;
    // Группы граней BoxGeometry: +x, −x, +y, −y, +z (перед), −z
    const body = mesh(new RoundedBoxGeometry(0.66, 1.0, 0.38, 4, 0.022), [M.glass, M.glass, M.glass, M.glass, front, M.glass], 0, 0.5, 0);
    g.add(body);
    g.add(mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.9, 12), M.tubeClear, 0.0, 0.53, -0.02));
    // Горлышко, металлический воротник, клапан
    g.add(mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.04, 40), M.chrome, 0, 1.02, 0));
    const collar = mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.12, 48), M.chrome, 0, 1.1, 0); g.add(collar);
    g.add(mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.04, 32), M.chrome, 0, 1.18, 0));
    // Гранёная прозрачная крышка
    const cap = mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.36, 8, 1), M.capGlass, 0, 1.38, 0);
    cap.rotation.y = Math.PI / 8; g.add(cap);
    blob(g, 0, 0.02, 1.1, 0.66, 0.55);
    return g;
  }
  function makeJar(lidMat = M.pearlLid, s = 1, body = M.jarGlass) {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(lathe([[0, 0.02], [0.19, 0.02], [0.2, 0.03], [0.2, 0.16], [0.185, 0.172], [0, 0.172]]), M.cream));
    g.add(new THREE.Mesh(lathe([[0, 0], [0.2, 0], [0.215, 0.012], [0.222, 0.045], [0.222, 0.17], [0.205, 0.186], [0, 0.186]]), body));
    g.add(new THREE.Mesh(lathe([[0, 0.186], [0.226, 0.186], [0.234, 0.2], [0.234, 0.246], [0.222, 0.262], [0, 0.265]]), lidMat));
    blob(g, 0, 0, 0.7, 0.7, 0.5);
    g.scale.setScalar(s);
    return g;
  }
  function makeLipstick() {
    const g = new THREE.Group();
    const inner = new THREE.Group();
    inner.add(mesh(new THREE.CylinderGeometry(0.056, 0.056, 0.22, 40), M.chrome, 0, 0.11, 0));
    inner.add(mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.06, 40), M.rosegold, 0, 0.25, 0));
    const bg = new THREE.CylinderGeometry(0.04, 0.04, 0.14, 40, 6);
    const p = bg.attributes.position;
    for (let i = 0; i < p.count; i++) { const y = p.getY(i); if (y > 0.0) p.setY(i, 0.02 + (y / 0.07) * (0.05 + p.getX(i) * 0.75)); }
    bg.computeVertexNormals();
    inner.add(mesh(bg, M.bullet, 0, 0.35, 0));
    inner.rotation.z = Math.PI / 2;
    inner.position.set(0.19, 0.056, 0);
    g.add(inner);
    blob(g, 0, 0, 0.62, 0.22, 0.45);
    return g;
  }
  function makeCompact() {
    const g = new THREE.Group();
    g.add(mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.05, 64), M.rosegold, 0, 0.025, 0));
    g.add(mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.012, 64), M.powder, 0, 0.051, 0));
    const hinge = new THREE.Group(); hinge.position.set(0, 0.05, -0.27);
    const lid = new THREE.Group(); lid.position.set(0, 0, 0.27);
    lid.add(mesh(new THREE.CylinderGeometry(0.27, 0.27, 0.03, 64), M.rosegold, 0, 0.015, 0));
    lid.add(mesh(new THREE.CylinderGeometry(0.235, 0.235, 0.004, 64), M.mirror, 0, -0.002, 0));
    hinge.add(lid); hinge.rotation.x = -1.95;
    g.add(hinge);
    blob(g, 0, -0.05, 0.85, 0.85, 0.5);
    const brush = new THREE.Group();
    brush.add(mesh(new THREE.CylinderGeometry(0.022, 0.032, 0.5, 32), M.cocoa, 0, 0.25, 0));
    brush.add(mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.09, 32), M.rosegold, 0, 0.545, 0));
    const tuft = new THREE.Mesh(lathe([[0, 0], [0.042, 0.004], [0.06, 0.05], [0.05, 0.11], [0.022, 0.15], [0, 0.156]]), M.bristle);
    tuft.position.y = 0.59; brush.add(tuft);
    brush.rotation.z = Math.PI / 2; brush.rotation.y = 0.5;
    brush.position.set(0.32, 0.045, 0.32);
    g.add(brush);
    blob(g, 0.18, 0.42, 0.9, 0.22, 0.4).rotation.z = 0.5;
    return g;
  }
  function makeHair() {
    const g = new THREE.Group();
    const rb = new THREE.Group();
    rb.add(mesh(new THREE.CylinderGeometry(0.03, 0.036, 0.36, 32), M.cocoa, 0, -0.18, 0));
    rb.add(mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.34, 32), M.rosegold, 0, 0.17, 0));
    const bGeo = new THREE.CylinderGeometry(0.004, 0.003, 0.05, 6);
    const inst = new THREE.InstancedMesh(bGeo, M.bristle, 14 * 9);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(1, 1, 1), v = new THREE.Vector3();
    let k = 0;
    for (let row = 0; row < 9; row++) for (let a = 0; a < 14; a++) {
      const ang = (a / 14) * Math.PI * 2 + (row % 2) * 0.22, y = 0.03 + row * 0.035;
      v.set(Math.cos(ang) * 0.06, y, Math.sin(ang) * 0.06);
      q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)));
      m4.compose(v, q, sc); inst.setMatrixAt(k++, m4);
    }
    rb.add(inst);
    rb.rotation.z = Math.PI / 2; rb.rotation.y = -0.35; rb.position.set(0, 0.09, 0.05);
    g.add(rb);
    blob(g, 0, 0.05, 0.85, 0.3, 0.45).rotation.z = -0.35;
    const comb = new THREE.Group();
    comb.add(mesh(new RoundedBoxGeometry(0.56, 0.065, 0.014, 2, 0.006), M.acrylic, 0, 0.0325, 0));
    const tGeo = new THREE.BoxGeometry(0.007, 0.085, 0.012);
    const teeth = new THREE.InstancedMesh(tGeo, M.acrylic, 36);
    for (let i = 0; i < 36; i++) { m4.makeTranslation(-0.26 + i * 0.0149, -0.04, 0); teeth.setMatrixAt(i, m4); }
    comb.add(teeth);
    comb.rotation.x = -Math.PI / 2; comb.rotation.z = 0.25; comb.position.set(0.05, 0.008, -0.3);
    g.add(comb);
    blob(g, 0.05, -0.3, 0.75, 0.3, 0.3);
    return g;
  }
  function makePearls() {
    const g = new THREE.Group();
    const n = 34, geo = new THREE.SphereGeometry(0.044, 32, 20);
    const inst = new THREE.InstancedMesh(geo, M.pearl, n);
    const m4 = new THREE.Matrix4();
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const r = 0.38 + Math.sin(a * 3) * 0.03;
      m4.makeTranslation(Math.cos(a) * r, 0.044, Math.sin(a) * r * 0.72);
      inst.setMatrixAt(i, m4);
    }
    g.add(inst);
    const ring = new THREE.Group();
    ring.add(mesh(new THREE.TorusGeometry(0.075, 0.013, 20, 64), M.rosegold));
    const gem = mesh(new THREE.OctahedronGeometry(0.04, 0), M.gem, 0, 0.1, 0); gem.scale.set(1, 1.25, 1);
    ring.add(gem);
    ring.position.set(0.02, 0.088, 0.02); ring.rotation.y = 0.6;
    g.add(ring);
    blob(g, 0, 0, 0.95, 0.75, 0.32);
    return g;
  }
  function makeShop() {
    const g = new THREE.Group();
    const dropper = new THREE.Group();
    const db = new THREE.Mesh(lathe([[0, 0], [0.1, 0], [0.11, 0.02], [0.11, 0.2], [0.07, 0.26], [0.035, 0.27], [0, 0.27]]), M.amber);
    db.renderOrder = 2; dropper.add(db);
    dropper.add(mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 32), M.rosegold, 0, 0.3, 0));
    const bulb = mesh(new THREE.SphereGeometry(0.045, 24, 16), M.cocoa, 0, 0.37, 0); bulb.scale.set(1, 1.5, 1);
    dropper.add(bulb);
    dropper.position.set(-0.35, 0, 0.1); g.add(dropper); blob(g, -0.35, 0.1, 0.45, 0.45);
    const tube = new THREE.Group();
    const tg = lathe([[0, 0], [0.075, 0], [0.075, 0.22], [0.072, 0.29], [0.06, 0.33], [0.004, 0.345], [0, 0.345]], 40);
    const tp = tg.attributes.position;
    for (let i = 0; i < tp.count; i++) { const y = tp.getY(i); const f = THREE.MathUtils.smoothstep(y, 0.14, 0.36); tp.setX(i, tp.getX(i) * (1 + f * 0.35)); tp.setZ(i, tp.getZ(i) * (1 - f * 0.92)); }
    tg.computeVertexNormals();
    tube.add(mesh(tg, M.tube, 0, 0.065, 0));
    tube.add(mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.065, 32), M.cocoa, 0, 0.0325, 0));
    tube.position.set(0.02, 0, -0.12); tube.rotation.y = 0.4; g.add(tube); blob(g, 0.02, -0.12, 0.35, 0.35);
    const serum = new THREE.Group();
    const sb = mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.38, 40), M.jarGlass, 0, 0.19, 0);
    serum.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.3, 32), M.liquid, 0, 0.15, 0));
    serum.add(sb);
    serum.add(mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05, 32), M.chrome, 0, 0.405, 0));
    serum.add(mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 16), M.chrome, 0, 0.46, 0));
    serum.add(mesh(new RoundedBoxGeometry(0.09, 0.03, 0.04, 2, 0.01), M.chrome, 0.02, 0.5, 0));
    serum.position.set(0.32, 0, 0.0); g.add(serum); blob(g, 0.32, 0, 0.36, 0.36);
    const jar = makeJar(M.cocoa, 0.95, M.pearl); jar.position.set(-0.05, 0, 0.32); g.add(jar);
    return g;
  }

  // ---------- Фарфоровый манекен с зонами лазера ----------
  // Зоны в координатах фигуры (ступни на y=0, лицом к +z), x зеркалится: [a, b, радиус, сторона(1 перед, -1 спина, 0 обе)]
  const ZDEF = [
    [[0, 1.545, 0.095], [0, 1.545, 0.095], 0.03, 1],      // z0 над губой
    [[0.085, 1.6, 0.02], [0.085, 1.6, 0.02], 0.032, 0],   // z1 бакенбарды
    [[0, 1.505, 0.075], [0, 1.505, 0.075], 0.034, 1],     // z2 подбородок
    [[0, 1.53, 0.05], [0, 1.65, 0.05], 0.088, 1],         // z3 лицо
    [[0, 1.44, 0.03], [0, 1.5, 0.03], 0.036, 1],          // z4 горло
    [[0, 1.44, -0.03], [0, 1.52, -0.03], 0.042, -1],      // z5 шея
    [[0, 1.44, -0.03], [0, 1.52, -0.03], 0.047, -1],      // z6 шея с оформлением
    [[0.155, 1.33, 0], [0.155, 1.33, 0], 0.042, 0],       // z7 подмышки
    [[0.24, 0.8, 0], [0.245, 0.74, 0], 0.036, 0],         // z8 пальцы
    [[0.207, 1.12, 0], [0.232, 0.873, 0], 0.052, 0],      // z9 руки до локтя
    [[0.185, 1.37, 0], [0.232, 0.873, 0], 0.057, 0],      // z10 руки полностью
    [[0.06, 1.27, 0.115], [0.06, 1.27, 0.115], 0.026, 1], // z11 ареолы
    [[0, 1.24, 0.07], [0, 1.33, 0.07], 0.12, 1],          // z12 грудь
    [[0, 1.02, 0.09], [0, 1.16, 0.09], 0.03, 1],          // z13 линия пупка
    [[0, 1.0, 0.07], [0, 1.16, 0.07], 0.12, 1],           // z14 живот
    [[0, 1.22, -0.06], [0, 1.4, -0.06], 0.16, -1],        // z15 спина
    [[0, 1.02, -0.06], [0, 1.17, -0.06], 0.15, -1],       // z16 поясница
    [[0, 0.86, 0.07], [0, 0.93, 0.08], 0.075, 1],         // z17 бикини
    [[0, 0.82, 0.05], [0, 0.93, 0.06], 0.086, 0],         // z18 глубокое бикини
    [[0.07, 0.92, -0.07], [0.07, 0.92, -0.07], 0.11, -1], // z19 ягодицы
    [[0.085, 0.5, 0], [0.085, 0.06, 0], 0.072, 0],        // z20 ноги до колена
    [[0.085, 0.86, 0], [0.085, 0.06, 0], 0.096, 0]        // z21 ноги полностью
  ];
  // Зоны для скульптурной модели (assets/mannequin.bin): замеры по референсу, рост 1,70
  const ZGLB = [
    [[0, 1.545, 0.09], [0, 1.545, 0.09], 0.03, 1],
    [[0.075, 1.6, 0.03], [0.075, 1.6, 0.03], 0.032, 0],
    [[0, 1.5, 0.07], [0, 1.5, 0.07], 0.036, 1],
    [[0, 1.53, 0.06], [0, 1.65, 0.06], 0.09, 1],
    [[0, 1.43, 0.03], [0, 1.49, 0.03], 0.04, 1],
    [[0, 1.43, -0.03], [0, 1.51, -0.03], 0.045, -1],
    [[0, 1.43, -0.03], [0, 1.51, -0.03], 0.05, -1],
    [[0.125, 1.305, 0], [0.125, 1.305, 0], 0.045, 0],
    [[0.214, 0.78, 0.02], [0.214, 0.71, 0.02], 0.04, 0],
    [[0.185, 1.076, 0], [0.207, 0.83, 0], 0.046, 0],
    [[0.17, 1.37, 0], [0.207, 0.83, 0], 0.05, 0],
    [[0.06, 1.27, 0.12], [0.06, 1.27, 0.12], 0.028, 1],
    [[0, 1.22, 0.07], [0, 1.32, 0.07], 0.12, 1],
    [[0, 0.98, 0.09], [0, 1.12, 0.09], 0.03, 1],
    [[0, 0.96, 0.07], [0, 1.12, 0.07], 0.12, 1],
    [[0, 1.2, -0.06], [0, 1.4, -0.06], 0.16, -1],
    [[0, 0.98, -0.06], [0, 1.14, -0.06], 0.15, -1],
    [[0, 0.82, 0.06], [0, 0.9, 0.07], 0.075, 1],
    [[0, 0.79, 0.04], [0, 0.9, 0.05], 0.085, 0],
    [[0.07, 0.89, -0.07], [0.07, 0.89, -0.07], 0.11, -1],
    [[0.05, 0.49, 0], [0.037, 0.06, 0], 0.085, 0],
    [[0.066, 0.84, 0], [0.037, 0.06, 0], 0.115, 0]
  ];
  const zU = {
    uZA: { value: ZDEF.map(z => new THREE.Vector4(z[0][0], z[0][1], z[0][2], z[2])) },
    uZB: { value: ZDEF.map(z => new THREE.Vector4(z[1][0], z[1][1], z[1][2], z[3])) },
    uZOn: { value: new Float32Array(ZDEF.length) },
    uHover: { value: -1 },
    uGlowCol: { value: new THREE.Color("#e2787c") },
    uFigInv: { value: new THREE.Matrix4() },
    uPulse: { value: 1 }
  };
  const zOnTarget = new Float32Array(ZDEF.length);
  function useZones(def) {
    ZDEF.splice(0, ZDEF.length, ...def);
    ZDEF.forEach((z, i) => { zU.uZA.value[i].set(z[0][0], z[0][1], z[0][2], z[2]); zU.uZB.value[i].set(z[1][0], z[1][1], z[1][2], z[3]); });
  }
  M.porcelain.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, zU);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform mat4 uFigInv;\nvarying vec3 vFig;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvFig = (uFigInv * modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>
        varying vec3 vFig;
        uniform vec4 uZA[${ZDEF.length}];
        uniform vec4 uZB[${ZDEF.length}];
        uniform float uZOn[${ZDEF.length}];
        uniform float uHover;
        uniform vec3 uGlowCol;
        uniform float uPulse;
        float zoneGlow(vec3 p) {
          vec3 q = vec3(abs(p.x), p.y, p.z);
          float g = 0.0;
          for (int i = 0; i < ${ZDEF.length}; i++) {
            float on = max(uZOn[i], abs(float(i) - uHover) < 0.5 ? 0.4 : 0.0);
            if (on <= 0.001) continue;
            vec4 A = uZA[i]; vec4 B = uZB[i];
            vec3 pa = q - A.xyz, ba = B.xyz - A.xyz;
            float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
            float d = length(pa - ba * h) / A.w;
            float m = 1.0 - smoothstep(0.74, 1.0, d);
            if (B.w > 0.5) m *= smoothstep(-0.02, 0.02, p.z);
            else if (B.w < -0.5) m *= 1.0 - smoothstep(-0.02, 0.02, p.z);
            g = max(g, m * on);
          }
          return g;
        }`)
      .replace("#include <color_fragment>", "#include <color_fragment>\nfloat zg = zoneGlow(vFig) * uPulse;\ndiffuseColor.rgb = mix(diffuseColor.rgb, uGlowCol, zg * 0.62);")
      .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\nfloat zRim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.5);\ntotalEmissiveRadiance += uGlowCol * zg * (0.45 + zRim * 0.9);");
  };
  M.porcelain.customProgramCacheKey = () => "self-zones";

  function makeFigure() {
    const fig = new THREE.Group();
    const parts = [];
    const add = (geo, x, y, z, sx = 1, sy = 1, sz = 1, rz = 0) => {
      const m = mesh(geo, M.porcelain, x, y, z); m.scale.set(sx, sy, sz); m.rotation.z = rz; fig.add(m); parts.push(m); return m;
    };
    add(lathe([[0.001, 0.8], [0.07, 0.81], [0.13, 0.85], [0.165, 0.92], [0.175, 0.98], [0.165, 1.04], [0.14, 1.1], [0.125, 1.15], [0.135, 1.21], [0.15, 1.27], [0.152, 1.31], [0.15, 1.36], [0.138, 1.4], [0.1, 1.43], [0.055, 1.45], [0.045, 1.46], [0.001, 1.465]], 56), 0, 0, 0, 1, 1, 0.66);
    const sGeo = new THREE.SphereGeometry(0.062, 40, 24);
    add(sGeo, 0.158, 1.362, 0, 1.15, 0.82, 0.86); add(sGeo, -0.158, 1.362, 0, 1.15, 0.82, 0.86);
    const bGeo = new THREE.SphereGeometry(0.06, 40, 24);
    add(bGeo, 0.056, 1.262, 0.05, 1, 0.86, 0.72); add(bGeo, -0.056, 1.262, 0.05, 1, 0.86, 0.72);
    add(new THREE.CylinderGeometry(0.041, 0.048, 0.1, 32), 0, 1.48, 0);
    add(new THREE.SphereGeometry(0.1, 40, 28), 0, 1.6, 0.012, 0.86, 1.12, 0.95);
    const legGeo = lathe([[0.001, 0.02], [0.034, 0.03], [0.031, 0.08], [0.037, 0.14], [0.05, 0.3], [0.052, 0.36], [0.042, 0.47], [0.045, 0.52], [0.062, 0.62], [0.075, 0.74], [0.083, 0.84], [0.07, 0.9], [0.001, 0.92]], 40);
    add(legGeo, 0.085, 0, 0, 1, 1, 0.95); add(legGeo, -0.085, 0, 0, 1, 1, 0.95);
    const footGeo = new THREE.SphereGeometry(0.04, 24, 16);
    add(footGeo, 0.085, 0.022, 0.045, 0.8, 0.5, 2.0); add(footGeo, -0.085, 0.022, 0.045, 0.8, 0.5, 2.0);
    const armGeo = lathe([[0.001, 0], [0.04, -0.01], [0.045, -0.05], [0.04, -0.2], [0.032, -0.27], [0.034, -0.32], [0.03, -0.45], [0.022, -0.52], [0.001, -0.53]], 32);
    add(armGeo, 0.178, 1.385, 0, 1, 1, 1, 0.1); add(armGeo, -0.178, 1.385, 0, 1, 1, 1, -0.1);
    const handGeo = new THREE.SphereGeometry(0.04, 24, 16);
    add(handGeo, 0.238, 0.8, 0, 0.55, 1.6, 0.9, 0.1); add(handGeo, -0.238, 0.8, 0, 0.55, 1.6, 0.9, -0.1);
    const plinth = mesh(new THREE.CylinderGeometry(0.34, 0.36, 0.03, 72), M.plinth, 0, -0.015, 0);
    const g = new THREE.Group();
    g.add(plinth); g.add(fig);
    blob(g, 0, 0, 1.2, 0.8, 0.45);
    return { group: g, fig, parts, plinth };
  }

  // ---------- Сборка студии ----------
  const P = { hero: new THREE.Vector3(0, 0, 0), prices: new THREE.Vector3(3.2, 0, -1.2), laser: new THREE.Vector3(6.4, 0, 0), shop: new THREE.Vector3(11.6, 0, -1.8) };

  const hero = new THREE.Group(); hero.position.copy(P.hero); scene.add(hero);
  const bottle = makeBottle(); bottle.scale.setScalar(1.1); bottle.position.set(0.4, 0, 0.28); bottle.rotation.y = -0.32; hero.add(bottle);
  const jar = makeJar(); jar.scale.setScalar(1.15); jar.position.set(-0.46, 0, -0.82); hero.add(jar);
  const lip = makeLipstick(); lip.scale.setScalar(1.45); lip.position.set(-1.0, 0, -0.5); lip.rotation.y = Math.PI + 0.12; hero.add(lip);

  const tabs = new THREE.Group(); tabs.position.copy(P.prices); scene.add(tabs);
  const TAB = { mk: makeCompact(), hr: makeHair(), tl: makePearls() };
  Object.entries(TAB).forEach(([k, o]) => { o.userData.s = k === "mk" ? 1 : 0; o.scale.setScalar(o.userData.s || 0.0001); o.visible = k === "mk"; tabs.add(o); });
  let activeTab = "mk";

  const F = makeFigure(); F.group.position.copy(P.laser); scene.add(F.group);
  // Скульптурная модель (сгенерирована в Krea/Tripo, ужата в 16-битный формат). Без неё — фигура из примитивов
  F.fig.visible = false;
  fetch("assets/mannequin.bin").then(r => { if (!r.ok) throw new Error(r.status); return r.arrayBuffer(); }).then(buf => {
    const dv = new DataView(buf);
    if (dv.getUint32(0, true) !== 0x464c4553) throw new Error("format");
    const n = dv.getUint32(4, true), ni = dv.getUint32(8, true);
    const mn = [0, 1, 2].map(k => dv.getFloat32(12 + k * 4, true)), mx = [0, 1, 2].map(k => dv.getFloat32(24 + k * 4, true));
    const q = new Uint16Array(buf, 36, n * 3), pos = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) { const k = i % 3; pos[i] = mn[k] + (q[i] / 65535) * (mx[k] - mn[k]); }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setIndex(new THREE.BufferAttribute(new Uint16Array(buf, 36 + n * 6, ni), 1));
    geo.rotateY(-Math.PI / 2);
    geo.computeBoundingBox();
    const bb = geo.boundingBox, sc = 1.735 / (bb.max.y - bb.min.y);
    geo.translate(-(bb.min.x + bb.max.x) / 2, -bb.min.y, -(bb.min.z + bb.max.z) / 2);
    geo.scale(sc, sc, sc);
    geo.translate(0, -0.035, -0.025);
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, M.porcelain);
    F.fig.clear(); F.fig.add(m); F.parts.length = 0; F.parts.push(m);
    F.plinth.visible = false;
    useZones(ZGLB);
    F.fig.visible = true;
  }).catch(() => { F.fig.visible = true; });
  const shop = makeShop(); shop.position.copy(P.shop); scene.add(shop);

  // Кадры камеры: цель, «радиус» предмета, азимут и высота (градусы)
  const SHOT = {
    hero: { t: new THREE.Vector3(0.14, 0.98, -0.2), r: 1.03, az: -14, el: 9 },
    prices: { t: new THREE.Vector3(3.2, 0.14, -1.2), r: 0.6, az: 12, el: 34 },
    laser: { t: new THREE.Vector3(6.4, 0.8, 0), r: 1.0, az: 0, el: 6 },
    shop: { t: new THREE.Vector3(11.6, 0.24, -1.8), r: 0.62, az: -16, el: 16 },
    booking: { t: new THREE.Vector3(-0.15, 0.5, -0.4), r: 1.0, az: 34, el: 14 }
  };

  // ---------- Привязка к разделам страницы ----------
  const stages = [...document.querySelectorAll("[data-stage]")].map(el => ({ el, shot: SHOT[el.dataset.stage], name: el.dataset.stage, focus: 0 }))
    .filter(s => s.shot);
  function docTop(el) { let y = 0; for (let n = el; n; n = n.offsetParent) y += n.offsetTop; return y; }
  let W = 1, H = 1, maxScroll = 1;
  function measure() {
    const w = host.clientWidth, h = host.clientHeight;
    if (w !== W || h !== H) { W = w; H = h; renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix(); }
    const vh = window.innerHeight;
    maxScroll = Math.max(1, document.documentElement.scrollHeight - vh);
    stages.forEach(s => {
      const visible = s.el.offsetParent !== null && s.el.offsetHeight > 0;
      s.on = visible;
      s.focus = THREE.MathUtils.clamp(docTop(s.el) + s.el.offsetHeight / 2 - vh / 2, 0, maxScroll);
    });
    stages.sort((a, b) => a.focus - b.focus);
  }
  new ResizeObserver(measure).observe(host);
  new ResizeObserver(measure).observe(document.body);

  const cur = { t: SHOT.hero.t.clone(), r: SHOT.hero.r, az: SHOT.hero.az, el: SHOT.hero.el, ax: W * 0.7, ay: H * 0.4, size: 400 };
  const goal = { t: new THREE.Vector3(), r: 1, az: 0, el: 0, ax: 0, ay: 0, size: 1 };
  const ease = x => x * x * (3 - 2 * x);
  const pointer = { x: 0, y: 0 };
  if (!coarse) window.addEventListener("pointermove", e => { pointer.x = e.clientX / innerWidth - 0.5; pointer.y = e.clientY / innerHeight - 0.5; }, { passive: true });

  function rectOf(s) {
    const r = s.el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, size: Math.max(60, Math.min(r.height, r.width * 1.6)) };
  }
  function computeGoal() {
    const list = stages.filter(s => s.on);
    if (!list.length) return;
    const y = window.scrollY;
    let i = 0;
    while (i < list.length - 1 && y > list[i + 1].focus) i++;
    const a = list[i], b = list[Math.min(i + 1, list.length - 1)];
    let te = 0;
    if (b !== a && b.focus > a.focus) te = ease(THREE.MathUtils.clamp(((y - a.focus) / (b.focus - a.focus) - 0.18) / 0.64, 0, 1));
    if (reduce.matches) te = te < 0.5 ? 0 : 1;
    const ra = rectOf(a), rb = rectOf(b);
    goal.t.lerpVectors(a.shot.t, b.shot.t, te);
    goal.r = THREE.MathUtils.lerp(a.shot.r, b.shot.r, te);
    goal.az = THREE.MathUtils.lerp(a.shot.az, b.shot.az, te);
    goal.el = THREE.MathUtils.lerp(a.shot.el, b.shot.el, te);
    goal.ax = THREE.MathUtils.lerp(ra.x, rb.x, te);
    goal.ay = THREE.MathUtils.lerp(ra.y, rb.y, te);
    goal.size = THREE.MathUtils.lerp(ra.size, rb.size, te);
  }

  const tmp = new THREE.Vector3();
  function placeCamera() {
    const fovT = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const D = (cur.r * H) / (cur.size * 0.5 * 2 * fovT) * 1.0;
    const px = reduce.matches ? 0 : pointer.x, py = reduce.matches ? 0 : pointer.y;
    const az = THREE.MathUtils.degToRad(cur.az + px * 4), el = THREE.MathUtils.degToRad(cur.el - py * 3);
    tmp.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(D);
    camera.position.copy(cur.t).add(tmp);
    camera.lookAt(cur.t);
    camera.setViewOffset(W, H, W / 2 - cur.ax, H / 2 - cur.ay, W, H);
    scene.fog.near = D * 0.85; scene.fog.far = D * 3.2 + 4;
  }

  // ---------- Состояние страницы ----------
  const BACK = new Set(["z5", "z6", "z15", "z16", "z19"]);
  let prevZones = new Set();
  let yawGoal = 0, yaw = 0, facing = "front";
  function setFace(face, silent) {
    const target = face === "back" ? Math.PI : 0;
    const k = Math.round((yawGoal - target) / (Math.PI * 2));
    yawGoal = target + k * Math.PI * 2;
    if (!silent) reportFace();
  }
  function reportFace() {
    const f = Math.cos(yawGoal) < 0 ? "back" : "front";
    if (f !== facing) { facing = f; window.dispatchEvent(new CustomEvent("self:face-changed", { detail: { face: f } })); }
  }
  function applyState(s) {
    if (!s) return;
    const now = new Set(s.zones);
    ZDEF.forEach((_, i) => { zOnTarget[i] = now.has("z" + i) ? 1 : 0; });
    const added = [...now].filter(z => !prevZones.has(z));
    if (added.length) {
      const last = added[added.length - 1];
      const side = ZDEF[+last.slice(1)][3];
      if (BACK.has(last)) setFace("back");
      else if (side === 1) setFace("front");
    }
    prevZones = now;
    if (s.tab && s.tab !== activeTab) { activeTab = s.tab; measureSoon(); }
  }
  window.addEventListener("self:state", e => applyState(e.detail));
  window.addEventListener("self:face", e => { setFace(e.detail.face, true); facing = e.detail.face; });
  let measureT = 0;
  const measureSoon = () => { clearTimeout(measureT); measureT = setTimeout(measure, 60); };

  // ---------- Касания фигуры ----------
  const stageEl = document.getElementById("laserStage");
  const tip = document.getElementById("ztip");
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const figInv = new THREE.Matrix4();
  function zoneAt(clientX, clientY) {
    ndc.set((clientX / W) * 2 - 1, -(clientY / H) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObjects(F.parts, false)[0];
    if (!hit) return -1;
    const p = hit.point.clone().applyMatrix4(figInv);
    const q = new THREE.Vector3(Math.abs(p.x), p.y, p.z);
    let best = -1, bestScore = Infinity, bestOn = -1, bestOnScore = Infinity;
    ZDEF.forEach(([a, b, r, side], i) => {
      if (side === 1 && p.z < -0.005) return;
      if (side === -1 && p.z > 0.005) return;
      const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b);
      const ba = B.clone().sub(A), pa = q.clone().sub(A);
      const h = THREE.MathUtils.clamp(pa.dot(ba) / Math.max(ba.lengthSq(), 1e-6), 0, 1);
      const d = pa.sub(ba.multiplyScalar(h)).length() / r;
      if (d < 1) {
        const score = r * (0.6 + d);
        if (score < bestScore) { bestScore = score; best = i; }
        if (zOnTarget[i] > 0 && score < bestOnScore) { bestOnScore = score; bestOn = i; }
      }
    });
    return bestOn >= 0 ? bestOn : best;  // нажатие на уже выбранную зону снимает её
  }
  if (stageEl) {
    let down = null, dragging = false;
    stageEl.addEventListener("pointerdown", e => {
      if (e.target.closest("button")) return;
      down = { x: e.clientX, y: e.clientY, yaw: yawGoal, id: e.pointerId, moved: 0 };
      dragging = false;
    });
    stageEl.addEventListener("pointermove", e => {
      if (down && e.pointerId === down.id) {
        const dx = e.clientX - down.x;
        down.moved = Math.max(down.moved, Math.hypot(dx, e.clientY - down.y));
        if (!dragging && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(e.clientY - down.y)) { dragging = true; try { stageEl.setPointerCapture(e.pointerId); } catch (_) {} }
        if (dragging) { yawGoal = down.yaw + dx * 0.012; zU.uHover.value = -1; tip.classList.remove("is-on"); }
        return;
      }
      if (e.pointerType !== "mouse") return;
      const z = zoneAt(e.clientX, e.clientY);
      zU.uHover.value = z;
      stageEl.style.cursor = z >= 0 ? "pointer" : "";
      if (z >= 0 && window.SELF) {
        tip.textContent = window.SELF.zoneLabel("z" + z);
        tip.style.left = e.clientX + "px"; tip.style.top = e.clientY + "px";
        tip.classList.add("is-on");
      } else tip.classList.remove("is-on");
    });
    const end = e => {
      if (!down || e.pointerId !== down.id) return;
      if (dragging) reportFace();
      else if (e.type === "pointerup" && down.moved < 6) {
        const z = zoneAt(e.clientX, e.clientY);
        if (z >= 0) window.dispatchEvent(new CustomEvent("self:pick-zone", { detail: { id: "z" + z } }));
      }
      down = null; dragging = false;
    };
    stageEl.addEventListener("pointerup", end);
    stageEl.addEventListener("pointercancel", end);
    stageEl.addEventListener("pointerleave", () => { if (!down) { zU.uHover.value = -1; tip.classList.remove("is-on"); } });
  }

  // ---------- Цикл ----------
  measure();
  computeGoal();
  Object.assign(cur, { r: goal.r, az: goal.az, el: goal.el, ax: goal.ax, ay: goal.ay, size: goal.size }); cur.t.copy(goal.t);
  if (window.SELF) applyState(window.SELF.state());

  const clock = new THREE.Clock();
  let raf = 0, first = true, time = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05);
    const still = reduce.matches;
    time += still ? 0 : dt;
    computeGoal();
    const k = still ? 1 : 1 - Math.exp(-dt * 6);
    cur.t.lerp(goal.t, k);
    cur.r += (goal.r - cur.r) * k; cur.az += (goal.az - cur.az) * k; cur.el += (goal.el - cur.el) * k;
    const ka = still ? 1 : 1 - Math.exp(-dt * 14);
    cur.ax += (goal.ax - cur.ax) * ka; cur.ay += (goal.ay - cur.ay) * ka; cur.size += (goal.size - cur.size) * k;
    placeCamera();

    // Лёгкое движение предметов
    bottle.rotation.y = -0.32 + Math.sin(time * 0.35) * 0.1;
    jar.rotation.y = time * 0.15;
    tabs.rotation.y = Math.sin(time * 0.3) * 0.25;
    shop.rotation.y = Math.sin(time * 0.25) * 0.18;
    Object.entries(TAB).forEach(([k2, o]) => {
      const tgt = k2 === activeTab ? 1 : 0;
      o.userData.s += (tgt - o.userData.s) * (still ? 1 : 1 - Math.exp(-dt * 7));
      o.visible = o.userData.s > 0.01;
      o.scale.setScalar(Math.max(0.0001, o.userData.s));
      o.rotation.y = (1 - o.userData.s) * 1.2;
    });
    // Фигура
    yaw += (yawGoal - yaw) * (still ? 1 : 1 - Math.exp(-dt * 6));
    F.fig.rotation.y = yaw;
    F.fig.updateMatrixWorld(true);
    figInv.copy(F.fig.matrixWorld).invert();
    zU.uFigInv.value.copy(figInv);
    for (let i = 0; i < ZDEF.length; i++) zU.uZOn.value[i] += (zOnTarget[i] - zU.uZOn.value[i]) * (still ? 1 : 1 - Math.exp(-dt * 10));
    zU.uPulse.value = still ? 1 : 0.88 + Math.sin(time * 2.4) * 0.12;

    renderer.render(scene, camera);
    if (first) {
      first = false;
      if (root.classList.contains("no3d")) { cancelAnimationFrame(raf); raf = 0; renderer.dispose(); renderer.domElement.remove(); return; }
      window.__scene3d = true; root.classList.add("has3d");
    }
  }
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (!raf) { clock.getDelta(); frame(); }
  });
  renderer.domElement.addEventListener("webglcontextlost", e => { e.preventDefault(); cancelAnimationFrame(raf); raf = 0; });
  renderer.domElement.addEventListener("webglcontextrestored", () => { if (!raf && !document.hidden) { clock.getDelta(); frame(); } });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  window.addEventListener("load", measure);
  frame();
}
