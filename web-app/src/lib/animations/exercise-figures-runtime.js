/*!
 * File: exercise-figures-runtime.js
 * Description: Exercise-figures runtime 0.1.0-draft.2 — line-art exercise animations (SVG) from JSON packs.
 *   Framework-agnostic ESM, zero dependencies, no eval or Function constructor, no network access. Built from the animation
 *   repo (src/lib.ts) by vite.lib.config.ts; do not edit — rebuild instead.
 * Author: Libor Ballaty <liborballaty@gmail.com>, with Claude Opus 5.5 (animation-lead-038475, draft export)
 * Created: 2026-11-23
 * License note: includes line-art helpers (c) 2026 JDhruv14, MIT — see LICENSE-line-art.
 */
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
const RAD = Math.PI / 180;
const I3 = [1, 0, 0, 0, 1, 0, 0, 0, 1];
function rotX(deg) {
  const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD);
  return [1, 0, 0, 0, c, -s, 0, s, c];
}
function rotY(deg) {
  const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD);
  return [c, 0, s, 0, 1, 0, -s, 0, c];
}
function rotZ(deg) {
  const c = Math.cos(deg * RAD), s = Math.sin(deg * RAD);
  return [c, -s, 0, s, c, 0, 0, 0, 1];
}
function mul(a, b) {
  const o = new Array(9);
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) o[r * 3 + c] = a[r * 3] * b[c] + a[r * 3 + 1] * b[3 + c] + a[r * 3 + 2] * b[6 + c];
  return o;
}
const chain = (...ms) => ms.reduce((acc, m) => mul(acc, m), I3);
const apply = (m, v) => [
  m[0] * v[0] + m[1] * v[1] + m[2] * v[2],
  m[3] * v[0] + m[4] * v[1] + m[5] * v[2],
  m[6] * v[0] + m[7] * v[1] + m[8] * v[2]
];
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const scale = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.hypot(a[0], a[1], a[2]);
const dist = (a, b) => len(sub(a, b));
function norm(a) {
  const l = len(a);
  return l > 1e-12 ? [a[0] / l, a[1] / l, a[2] / l] : [0, 0, 0];
}
function twoBone(root, end, l1, l2, pole) {
  const d = sub(end, root);
  const dl = Math.min(len(d), l1 + l2);
  const u = norm(d);
  let v = sub(pole, scale(u, dot(pole, u)));
  if (len(v) < 1e-9) v = norm(cross(u, [1, 0, 0]));
  v = norm(v);
  const a = (l1 * l1 - l2 * l2 + dl * dl) / (2 * dl);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  return add(add(root, u, a), v, h);
}
const sided = (name, dofs) => {
  const out = {};
  for (const side of ["L", "R"]) for (const [k, v] of Object.entries(dofs)) out[`${name}${side}.${k}`] = v;
  return out;
};
const LIMITS = {
  "pelvis.tilt": [-25, 25],
  "pelvis.obliquity": [-15, 15],
  "pelvis.yaw": [-45, 45],
  "lumbar.flex": [-15, 40],
  "lumbar.lat": [-20, 20],
  "lumbar.twist": [-10, 10],
  "thoracic.flex": [-10, 40],
  "thoracic.lat": [-15, 15],
  "thoracic.twist": [-35, 35],
  // neck rotation 75: young-adult mean 71 ± 10 (Apti et al. 2023, n = 300); AAOS's 60 is > 1 SD low (RIG-SPEC §2)
  "neck.flex": [-45, 45],
  "neck.lat": [-45, 45],
  "neck.rot": [-75, 75],
  "head.nod": [-15, 15],
  ...sided("shoulder", { flex: [-60, 180], abd: [-30, 180], rot: [-70, 90] }),
  // elbow: AAOS 0–150; −5 allows the slight hyperextension many adults show (the approved squat uses −4) [judgment]
  ...sided("elbow", { flex: [-5, 150] }),
  ...sided("forearm", { pron: [-80, 80] }),
  ...sided("wrist", { flex: [-70, 80], dev: [-30, 20] }),
  ...sided("hip", { flex: [-30, 120], abd: [-30, 45], rot: [-45, 45] }),
  ...sided("knee", { flex: [0, 135] }),
  // ankle: AAOS dorsiflexion 20 is non-weight-bearing; 40 allowed weight-bearing (RIG-SPEC §2) [judgment]
  ...sided("ankle", { dorsi: [-50, 40], inv: [-15, 35] }),
  // planted foot pitch: + lifts the heel about the ball (heel raise = plantarflexion, AAOS 50; the toes stay down and
  // bend passively at the ball); − lifts the whole forefoot about the planted heel (dorsiflexion, AAOS 20). People
  // lift the foot at the ankle, not the toes alone: active toe MTP motion is kept small [judgment] — AAOS's 70 / 45
  // is passive range, reached only as the passive bend of a heel raise or push-off (RIG-SPEC §2).
  // planted foot yaw: toe-out (+) / toe-in. A planted foot turns with the leg (hip rotation), so it shares the hip's
  // rotation range group; 45 out / 30 in [judgment, within hip rotation 45 / 45]
  ...sided("foot", { pitch: [-20, 50], yaw: [-30, 45] }),
  ...sided("toe", { ext: [-10, 20] })
};
function romGroup(id) {
  const joint = id.split(".")[0].replace(/[LR]$/, "");
  switch (joint) {
    case "lumbar":
    case "thoracic":
      return "spine";
    case "neck":
    case "head":
      return "neck";
    case "forearm":
    case "wrist":
      return "wrist";
    case "foot":
      return id.endsWith(".yaw") ? "hip" : "ankle";
    case "toe":
      return "ankle";
    default:
      return joint;
  }
}
function limitFor(id, rom = {}) {
  const [lo, hi] = LIMITS[id];
  const k = rom[romGroup(id)] ?? 1;
  return [lo * k, hi * k];
}
function clampPose(pose, rom = {}) {
  const out = {};
  for (const [key, value] of Object.entries(pose)) {
    if (value === void 0) continue;
    if (key in LIMITS) {
      const [lo, hi] = limitFor(key, rom);
      out[key] = Math.min(hi, Math.max(lo, value));
    } else out[key] = value;
  }
  return out;
}
function chairDims(B) {
  const k = B.thigh / DEFAULT_BODY.thigh;
  return { k, seatY: B.seatHeight, halfX: 11.5 * k, zBack: -9 * k, zFront: 15 * k, seatT: 1.8 * k, back: 27 * k };
}
const FINGER_DROP = 30;
function chairBackProp(B) {
  const d = chairDims(B), k = d.k;
  const railZ = 19 * k, railLocalZ = d.zBack - 2 * k;
  const offset = [0, 0, railZ - railLocalZ];
  const railY = d.seatY + d.back;
  const a = FINGER_DROP * Math.PI / 180, sa = Math.sin(a), ca = Math.cos(a);
  const frame = [-1, 0, 0, 0, sa, -ca, 0, -ca, -sa];
  const fingers = [0, -sa, ca];
  const grip = {};
  for (const [side, s] of [["L", 1], ["R", -1]]) {
    const palm = [s * B.shoulderOffset[0], railY + 1 * k, railZ];
    const wrist = [palm[0] - fingers[0] * 0.45 * B.hand, palm[1] - fingers[1] * 0.45 * B.hand, palm[2] - fingers[2] * 0.45 * B.hand];
    const hand = [wrist[0] + fingers[0] * B.hand, wrist[1] + fingers[1] * B.hand, wrist[2] + fingers[2] * B.hand];
    grip[side] = { wrist, frame, hand };
  }
  return { offset, railZ, railY, grip };
}
const transpose = (m) => [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]];
function rotAxis(axis, rad) {
  const [x, y, z] = axis, c = Math.cos(rad), s = Math.sin(rad), t = 1 - c;
  return [
    t * x * x + c,
    t * x * y - s * z,
    t * x * z + s * y,
    t * x * y + s * z,
    t * y * y + c,
    t * y * z - s * x,
    t * x * z - s * y,
    t * y * z + s * x,
    t * z * z + c
  ];
}
function rotBetween(u, v) {
  const c = Math.max(-1, Math.min(1, dot(u, v))), ax = cross(u, v), sl = len(ax);
  if (sl < 1e-12) {
    if (c > 0) return [1, 0, 0, 0, 1, 0, 0, 0, 1];
    const p = norm(cross(u, Math.abs(u[0]) < 0.9 ? [1, 0, 0] : [0, 1, 0]));
    return rotAxis(p, Math.PI);
  }
  return rotAxis([ax[0] / sl, ax[1] / sl, ax[2] / sl], Math.atan2(sl, c));
}
function axisAngle(m) {
  const cos = Math.max(-1, Math.min(1, (m[0] + m[4] + m[8] - 1) / 2)), angle = Math.acos(cos);
  if (angle < 1e-12) return { axis: [1, 0, 0], angle: 0 };
  if (Math.PI - angle < 1e-6) {
    const d = [m[0], m[4], m[8]], i = d.indexOf(Math.max(...d));
    const col = [m[i] + (i === 0 ? 1 : 0), m[3 + i] + (i === 1 ? 1 : 0), m[6 + i] + (i === 2 ? 1 : 0)];
    return { axis: norm(col), angle };
  }
  const v = [m[7] - m[5], m[2] - m[6], m[3] - m[1]];
  return { axis: norm(v), angle };
}
function blendRotation(A, B, w) {
  if (w <= 0) return A;
  const rel = mul(transpose(A), B), { axis, angle } = axisAngle(rel);
  if (w >= 1) return B;
  return mul(A, rotAxis(axis, angle * w));
}
const DEG = 180 / Math.PI;
const DEFAULT_BODY = {
  thigh: 24.5,
  shank: 24,
  ankleHeight: 5.6,
  footForward: 11,
  footBack: 4.4,
  ballForward: 7.6,
  footHalfWidth: 2,
  hipHalfWidth: 4.6,
  lumbar: 12,
  shoulderOffset: [9.4, 11.8, -0.6],
  // x: biacromial ≈ 0.22 H, joint centres ≈ ±9.4 (front-view proportions, gate g1)
  neckBaseOffset: [0, 15, 0.8],
  neck: 7.2,
  headForward: 1.6,
  headTop: 6.4,
  upperArm: 17.5,
  forearm: 16.5,
  hand: 7.6,
  seatHeight: 24.7,
  seatedHipOffset: 4.5,
  chairFootForward: 24
};
const SIDES$2 = ["L", "R"];
const sgn = (side) => side === "L" ? 1 : -1;
const mirror$1 = (v, side) => [v[0] * sgn(side), v[1], v[2]];
const spineR = (flex = 0, lat = 0, twist = 0) => chain(rotX(flex), rotZ(-lat), rotY(twist));
function solveSkeleton(input, body = DEFAULT_BODY, support = "standing", rom = {}) {
  const p = clampPose(input, rom);
  const g = (k) => p[k] ?? 0;
  const B = body;
  const Rp = chain(rotY(g("pelvis.yaw")), rotX(g("pelvis.tilt")), rotZ(g("pelvis.obliquity")));
  const restHipY = B.ankleHeight + B.shank + B.thigh;
  const plant = support === "chair" ? { L: [B.hipHalfWidth, B.ankleHeight, B.chairFootForward], R: [-B.hipHalfWidth, B.ankleHeight, B.chairFootForward] } : { L: [B.hipHalfWidth, B.ankleHeight, 0], R: [-B.hipHalfWidth, B.ankleHeight, 0] };
  const warnings = [];
  const placed = p["stance.width"] !== void 0 || SIDES$2.some((sd) => g(`foot${sd}.x`) !== 0 || g(`foot${sd}.z`) !== 0);
  if (placed) {
    const half = (p["stance.width"] ?? 2 * B.hipHalfWidth) / 2;
    const [adLo, abHi] = limitFor("hipL.abd", rom), drop = restHipY - B.ankleHeight;
    for (const side of SIDES$2) {
      const s = sgn(side), want = half + g(`foot${side}.x`);
      const lo = B.hipHalfWidth + drop * Math.tan(adLo * Math.PI / 180), hi = B.hipHalfWidth + drop * Math.tan(abHi * Math.PI / 180);
      const out2 = Math.min(hi, Math.max(lo, want));
      if (out2 !== want) warnings.push(`foot${side} placement ${want.toFixed(1)} out of hip range; clamped to ${out2.toFixed(1)}`);
      plant[side] = [s * out2, plant[side][1], plant[side][2] + g(`foot${side}.z`)];
    }
  }
  const plantedFoot = {};
  for (const side of SIDES$2) {
    const pitch = g(`foot${side}.pitch`), inv = g(`ankle${side}.inv`), yaw = g(`foot${side}.yaw`), s = sgn(side);
    if (pitch === 0 && inv === 0 && yaw === 0) continue;
    const Ry = rotY(s * yaw), R = chain(Ry, rotX(pitch), rotZ(-s * inv));
    const edge = inv > 0 ? s * B.footHalfWidth : inv < 0 ? -s * B.footHalfWidth : 0;
    const pivot = add(plant[side], apply(Ry, [edge, -B.ankleHeight, pitch > 0 ? B.ballForward : pitch < 0 ? -B.footBack : 0]));
    plant[side] = add(pivot, apply(R, sub(plant[side], pivot)));
    plantedFoot[side] = R;
  }
  const standOn = g("stance.side") < 0 ? "L" : "R";
  const chair = g("prop.chair") > 0 ? chairBackProp(B) : null;
  const hipAt = (P2, side) => add(P2, apply(Rp, mirror$1([B.hipHalfWidth, 0, 0], side)));
  const poleFor = (side) => {
    const forward = apply(rotY(g("pelvis.yaw") + sgn(side) * g(`hip${side}.rot`) + sgn(side) * g(`foot${side}.yaw`)), [0, 0, 1]);
    return support === "chair" ? add(forward, [0, 1, 0]) : forward;
  };
  let P = support === "chair" ? [0, B.seatHeight + B.seatedHipOffset, 0] : [g("pelvis.x"), restHipY + g("pelvis.y"), g("pelvis.z")];
  if (support !== "chair") {
    const planted = support === "standing" ? ["L", "R"] : [standOn];
    const reach = B.thigh + B.shank;
    const over = (y) => Math.max(...planted.map((s) => dist(hipAt([P[0], y, P[2]], s), plant[s]))) - reach;
    const bisectReach = (top2) => {
      let lo = B.ankleHeight, hi = top2;
      for (let i = 0; i < 60; i++) {
        const mid2 = (lo + hi) / 2;
        if (over(mid2) > 0) hi = mid2;
        else lo = mid2;
      }
      return lo;
    };
    const overAtRest = (y) => Math.max(...planted.map((s) => dist(hipAt([0, y, 0], s), plant[s]))) - reach;
    let stand = restHipY;
    if (overAtRest(restHipY) > 1e-9) {
      let lo = B.ankleHeight, hi = restHipY;
      for (let i = 0; i < 60; i++) {
        const mid2 = (lo + hi) / 2;
        if (overAtRest(mid2) > 0) hi = mid2;
        else lo = mid2;
      }
      stand = lo;
    }
    if (stand !== restHipY) P = [P[0], stand + g("pelvis.y"), P[2]];
    if (over(P[1]) > 0) {
      const asked = P[1];
      P = [P[0], bisectReach(P[1]), P[2]];
      if (g("pelvis.y") > 0 && asked - P[1] > 0.01) warnings.push(`pelvis held at straight-leg height (${(asked - P[1]).toFixed(1)} lower than asked)`);
    }
    const binding = (y) => {
      for (const side of planted) {
        const s = sgn(side), hip = hipAt([P[0], y, P[2]], side), ankle = plant[side];
        const knee = twoBone(hip, ankle, B.thigh, B.shank, poleFor(side));
        const th = norm(sub(knee, hip)), sh = norm(sub(ankle, knee));
        const l = [Rp[0] * th[0] + Rp[3] * th[1] + Rp[6] * th[2], Rp[1] * th[0] + Rp[4] * th[1] + Rp[7] * th[2], Rp[2] * th[0] + Rp[5] * th[1] + Rp[8] * th[2]];
        const flex = DEG * Math.atan2(l[2], -l[1]), abd = DEG * Math.atan2(s * l[0], Math.hypot(l[1], l[2]));
        const kneeFlex = DEG * Math.acos(Math.max(-1, Math.min(1, dot(th, sh))));
        const up = norm(sub(knee, ankle)), Rf = plantedFoot[side] ?? I3;
        const dorsi = DEG * Math.atan2(dot(up, apply(Rf, [0, 0, 1])), dot(up, apply(Rf, [0, 1, 0])));
        const lim = (id) => limitFor(id, rom);
        if (kneeFlex > lim(`knee${side}.flex`)[1] + 1e-6) return `knee flexion (${side})`;
        if (flex > lim(`hip${side}.flex`)[1] + 1e-6) return `hip flexion (${side})`;
        if (abd > lim(`hip${side}.abd`)[1] + 1e-6 || abd < lim(`hip${side}.abd`)[0] - 1e-6) return `hip ${abd > 0 ? "abduction" : "adduction"} (${side})`;
        if (dorsi > lim(`ankle${side}.dorsi`)[1] + 1e-6) return `ankle dorsiflexion (${side})`;
      }
      return null;
    };
    const why = binding(P[1]);
    const top = over(stand) > 0 ? bisectReach(stand) : stand;
    if (why && top > P[1] && !binding(top)) {
      let lo = P[1], hi = top;
      for (let i = 0; i < 50; i++) {
        const mid2 = (lo + hi) / 2;
        if (binding(mid2)) lo = mid2;
        else hi = mid2;
      }
      P = [P[0], hi, P[2]];
      warnings.push(`max depth reached: ${why} limit`);
    } else if (why) warnings.push(`${why} beyond its limit even standing (check the foot placement)`);
  }
  const Rl = chain(Rp, spineR(g("lumbar.flex"), g("lumbar.lat"), g("lumbar.twist")));
  const chestBase = add(P, apply(Rl, [0, B.lumbar, 0]));
  const Rt = chain(Rl, spineR(g("thoracic.flex"), g("thoracic.lat"), g("thoracic.twist")));
  const neckBase = add(chestBase, apply(Rt, B.neckBaseOffset));
  const Rn = chain(Rt, spineR(g("neck.flex"), g("neck.lat"), g("neck.rot")));
  const nodPivot = [0, -0.36 * B.headTop, -0.08 * B.headTop];
  const skullBase = add(neckBase, apply(Rn, add([0, B.neck, B.headForward], nodPivot)));
  const Rh = chain(Rn, rotX(g("head.nod")));
  const back = [-nodPivot[0], -nodPivot[1], -nodPivot[2]];
  const headC = add(add(neckBase, apply(Rn, [0, B.neck, B.headForward])), sub(apply(Rh, back), apply(Rn, back)));
  const headTop = add(headC, apply(Rh, [0, B.headTop, 0]));
  const joints = { pelvis: P, chestBase, neckBase, skullBase, headC, headTop };
  const frames = { pelvis: Rp, lumbar: Rl, thoracic: Rt, head: Rh };
  for (const side of SIDES$2) {
    const s = sgn(side);
    const shoulder = add(chestBase, apply(Rt, mirror$1(B.shoulderOffset, side)));
    let Rua = chain(Rt, rotX(-g(`shoulder${side}.flex`)), rotZ(s * g(`shoulder${side}.abd`)), rotY(s * g(`shoulder${side}.rot`)));
    let elbow = add(shoulder, apply(Rua, [0, -B.upperArm, 0]));
    let Rfa = chain(Rua, rotX(-g(`elbow${side}.flex`)));
    let wrist = add(elbow, apply(Rfa, [0, -B.forearm, 0]));
    const handOn = (R) => chain(R, rotY(-s * g(`forearm${side}.pron`)), rotX(-g(`wrist${side}.flex`)), rotZ(s * g(`wrist${side}.dev`)));
    let Rhand = handOn(Rfa);
    const hold = chair ? Math.max(0, Math.min(1, g(`hand${side}.hold`))) : 0;
    if (chair && hold > 0) {
      const grip = chair.grip[side];
      const target = add(wrist, sub(grip.wrist, wrist), hold);
      const e2 = twoBone(shoulder, target, B.upperArm, B.forearm, sub(elbow, shoulder));
      const upDir = norm(sub(e2, shoulder));
      Rua = chain(rotBetween(norm(sub(elbow, shoulder)), upDir), Rua);
      const fwDir = norm(sub(target, e2));
      const nrm = cross(upDir, fwDir);
      if (len(nrm) > 1e-6) {
        const h = apply(Rua, [1, 0, 0]), n = norm(nrm), want = dot(h, n) >= 0 ? n : [-n[0], -n[1], -n[2]];
        const ang = Math.atan2(dot(cross(h, want), upDir), dot(h, want));
        Rua = chain(rotAxis(upDir, ang), Rua);
      }
      const l = apply(transpose(Rua), fwDir);
      const flex = Math.atan2(l[2], -l[1]) * DEG;
      elbow = e2;
      Rfa = chain(Rua, rotX(-flex));
      wrist = add(elbow, apply(Rfa, [0, -B.forearm, 0]));
      Rhand = blendRotation(handOn(Rfa), grip.frame, hold);
    }
    const hand = add(wrist, apply(Rhand, [0, -B.hand, 0]));
    Object.assign(joints, { [`shoulder${side}`]: shoulder, [`elbow${side}`]: elbow, [`wrist${side}`]: wrist, [`hand${side}`]: hand });
    Object.assign(frames, { [`upperArm${side}`]: Rua, [`forearm${side}`]: Rfa, [`hand${side}`]: Rhand });
    const hip = hipAt(P, side);
    const free = support === "single-leg" && side !== standOn;
    let knee, ankle, Rfoot;
    if (free) {
      const Rth = chain(Rp, rotX(-g(`hip${side}.flex`)), rotZ(s * g(`hip${side}.abd`)), rotY(s * g(`hip${side}.rot`)));
      knee = add(hip, apply(Rth, [0, -B.thigh, 0]));
      const Rsh = chain(Rth, rotX(g(`knee${side}.flex`)));
      ankle = add(knee, apply(Rsh, [0, -B.shank, 0]));
      Rfoot = chain(Rsh, rotX(-g(`ankle${side}.dorsi`)), rotZ(-s * g(`ankle${side}.inv`)));
    } else {
      ankle = plant[side];
      knee = twoBone(hip, ankle, B.thigh, B.shank, poleFor(side));
      Rfoot = plantedFoot[side] ?? [1, 0, 0, 0, 1, 0, 0, 0, 1];
    }
    const ball = add(ankle, apply(Rfoot, [0, -B.ankleHeight, B.ballForward]));
    const ext = g(`toe${side}.ext`), heelUp = !free && g(`foot${side}.pitch`) > 0;
    const bent = ext !== 0 || heelUp;
    const Rtoe = !bent ? Rfoot : heelUp ? chain(rotY(s * g(`foot${side}.yaw`)), rotZ(-s * g(`ankle${side}.inv`)), rotX(-ext)) : chain(Rfoot, rotX(-ext));
    const toe = bent ? add(ball, apply(Rtoe, [0, 0, B.footForward - B.ballForward])) : add(ankle, apply(Rfoot, [0, -B.ankleHeight, B.footForward]));
    const heel = add(ankle, apply(Rfoot, [0, -B.ankleHeight, -B.footBack]));
    Object.assign(joints, { [`hip${side}`]: hip, [`knee${side}`]: knee, [`ankle${side}`]: ankle, [`ball${side}`]: ball, [`toe${side}`]: toe, [`heel${side}`]: heel });
    Object.assign(frames, { [`foot${side}`]: Rfoot, [`toe${side}`]: Rtoe });
  }
  const out = { support, pose: p, joints, frames };
  if (support === "single-leg") out.stance = standOn;
  if (chair) out.prop = { chairBack: chair };
  if (warnings.length) out.warnings = warnings;
  return out;
}
const REFERENCE_HEIGHT = 95;
const CHIN_DROP = 5.3;
const REFERENCE_WIDTHS = {
  thigh: 4.7,
  calf: 3.7,
  upperArm: 2.7,
  forearm: 2.05,
  waist: 6.4,
  chest: 7,
  pelvis: 8.6,
  neck: 2
};
const BUILD = {
  athletic: { limbs: 1, waist: 1, pelvis: 1, chest: 1, belly: 0 },
  slim: { limbs: 0.9, waist: 0.92, pelvis: 0.95, chest: 0.95, belly: 0 },
  average: { limbs: 1, waist: 1.05, pelvis: 1.02, chest: 1, belly: 0.8 },
  heavier: { limbs: 1.18, waist: 1.3, pelvis: 1.1, chest: 1.12, belly: 3.2 },
  fuller: { limbs: 1.18, waist: 1.2, pelvis: 1.2, chest: 1.12, belly: 2 }
};
const scaleVec = (v, k) => [v[0] * k, v[1] * k, v[2] * k];
function scaleRig(b, k) {
  const out = { ...b };
  for (const [key, v] of Object.entries(b)) out[key] = Array.isArray(v) ? scaleVec(v, k) : v * k;
  return out;
}
function bodyFor(c) {
  const k = c.height / REFERENCE_HEIGHT;
  const rig = scaleRig(DEFAULT_BODY, k);
  if (c.sex === "female") {
    rig.shoulderOffset = [rig.shoulderOffset[0] * 0.92, rig.shoulderOffset[1], rig.shoulderOffset[2]];
    rig.hipHalfWidth *= 1.05;
  }
  const m = BUILD[c.build];
  const w = REFERENCE_WIDTHS;
  const female = c.sex === "female";
  const widths = {
    thigh: w.thigh * k * m.limbs * (female ? 1.04 : 1),
    calf: w.calf * k * m.limbs,
    upperArm: w.upperArm * k * m.limbs * (female ? 0.92 : 1),
    forearm: w.forearm * k * m.limbs * (female ? 0.92 : 1),
    waist: w.waist * k * m.waist * (female ? 0.94 : 1),
    chest: w.chest * k * m.chest,
    pelvis: w.pelvis * k * m.pelvis * (female ? 1.08 : 1),
    shoulders: (rig.shoulderOffset[0] + 2.6 * k) * (c.build === "heavier" ? 1.04 : 1),
    neck: w.neck * k * (female ? 0.9 : 1),
    belly: m.belly * k,
    bust: female ? (c.build === "fuller" ? 2.4 : 1.6) * k : 0
  };
  const posture = c.kyphosis > 0 ? { "thoracic.flex": c.kyphosis, "neck.flex": -0.6 * c.kyphosis } : {};
  return {
    character: c,
    height: c.height,
    headHeight: (DEFAULT_BODY.headTop + CHIN_DROP) * k,
    rig,
    widths,
    posture,
    rom: c.rom,
    pace: c.pace
  };
}
const NS = "http://www.w3.org/2000/svg";
const INK = "currentColor";
const PAPER = "#fdfdfc";
const INK_DAY = "#1c1c1c";
const PEN = 1.35;
function el(tag, attrs = {}, parent) {
  const n = document.createElementNS(NS, tag);
  for (const k in attrs) n.setAttribute(k, String(attrs[k]));
  if (attrs.fill === PAPER) n.classList.add("pp");
  if (parent) parent.appendChild(n);
  return n;
}
const f = (n) => n.toFixed(2);
const pt = (p) => `${f(p[0])} ${f(p[1])}`;
const pen = (parent, w = PEN) => el("path", { fill: "none", stroke: INK, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round" }, parent);
const shape = (parent, w = PEN) => el("path", { fill: PAPER, stroke: INK, "stroke-width": w, "stroke-linejoin": "round", "stroke-linecap": "round" }, parent);
function inkDefs(svg, id = "ink") {
  if (!svg.style.color) svg.style.color = INK_DAY;
  const defs = el("defs", {}, svg);
  const flt = el("filter", { id: `${id}-edge`, x: "-2%", y: "-2%", width: "104%", height: "104%" }, defs);
  el("feTurbulence", { type: "fractalNoise", baseFrequency: "0.6", numOctaves: 1, seed: 7, result: "n" }, flt);
  el("feDisplacementMap", { in: "SourceGraphic", in2: "n", scale: 0.45, xChannelSelector: "R", yChannelSelector: "G", result: "d" }, flt);
  el("feGaussianBlur", { in: "d", stdDeviation: 0.12 }, flt);
  const stripes = el("pattern", { id: `${id}-stripes`, width: 4, height: 2.2, patternUnits: "userSpaceOnUse", patternTransform: "rotate(-12)" }, defs);
  el("rect", { width: 4, height: 2.2, fill: PAPER }, stripes);
  el("rect", { width: 4, height: 1, fill: INK }, stripes);
  return { defs, filter: `url(#${id}-edge)`, stripes: `url(#${id}-stripes)` };
}
const front = { yaw: 0, pitch: 0, cy: 1, sy: 0, cp: 1, sp: 0 };
const PIVOT_Y = 55;
const FRONT_YAW = 18, FRONT_PITCH = 8;
function setFrontCamera(yawDeg, pitchDeg) {
  const r = Math.PI / 180;
  Object.assign(front, { yaw: yawDeg, pitch: pitchDeg, cy: Math.cos(yawDeg * r), sy: Math.sin(yawDeg * r), cp: Math.cos(pitchDeg * r), sp: Math.sin(pitchDeg * r) });
}
setFrontCamera(FRONT_YAW, FRONT_PITCH);
const towardCamera = (view) => view === "side" ? [-1, 0, 0] : [front.cp * front.sy, front.sp, front.cp * front.cy];
function project(p, view) {
  if (view === "side") return { x: 40 + p[2], y: 120 - p[1], depth: -p[0] };
  const x1 = front.cy * p[0] - front.sy * p[2], z1 = front.sy * p[0] + front.cy * p[2];
  const y0 = p[1] - PIVOT_Y;
  const y2 = front.cp * y0 - front.sp * z1, z2 = front.sp * y0 + front.cp * z1;
  return { x: 40 + x1, y: 120 - (y2 + PIVOT_Y), depth: z2 };
}
function loop(P, k = 0.18) {
  const n = P.length;
  if (n < 3) return "";
  let d = `M${pt(P[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) * k)} ${f(p1[1] + (p2[1] - p0[1]) * k)} ${f(p2[0] - (p3[0] - p1[0]) * k)} ${f(p2[1] - (p3[1] - p1[1]) * k)} ${pt(p2)}`;
  }
  return d + "Z";
}
function open(P, k = 0.18) {
  if (P.length < 2) return "";
  let d = `M${pt(P[0])}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    d += ` C${f(p1[0] + (p2[0] - p0[0]) * k)} ${f(p1[1] + (p2[1] - p0[1]) * k)} ${f(p2[0] - (p3[0] - p1[0]) * k)} ${f(p2[1] - (p3[1] - p1[1]) * k)} ${pt(p2)}`;
  }
  return d;
}
function hull(points) {
  const P = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (P.length < 3) return P;
  const cross2 = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of P) {
    while (lower.length >= 2 && cross2(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = P.length - 1; i >= 0; i--) {
    const p = P[i];
    while (upper.length >= 2 && cross2(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}
function thin(P, min = 0.6) {
  const out = [];
  for (const p of P) if (!out.length || Math.hypot(p[0] - out[out.length - 1][0], p[1] - out[out.length - 1][1]) >= min) out.push(p);
  if (out.length > 3 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < min) out.pop();
  return out;
}
const LINE = 0.6;
const scaleProfile = (p, k) => p.map(([u, w]) => [u, w * k]);
function cropProfile(p, u0, u1 = 1) {
  const at = (u) => {
    for (let i = 0; i < p.length - 1; i++) {
      const [a, wa] = p[i], [b, wb] = p[i + 1];
      if (u >= a && u <= b) return wa + (wb - wa) * (u - a) / (b - a || 1);
    }
    return u < p[0][0] ? p[0][1] : p[p.length - 1][1];
  };
  const pts = [[u0, at(u0)], ...p.filter(([u]) => u > u0 && u < u1), [u1, at(u1)]];
  return pts.map(([u, w]) => [(u - u0) / (u1 - u0), w]);
}
function segment(parent, front2, back, caps = {}, w = LINE) {
  const g = el("g", {}, parent);
  const fill = el("path", { fill: PAPER }, g);
  const lf = pen(g, w), lb = pen(g, w);
  const cs = caps.start ? pen(g, w) : null, ce = caps.end ? pen(g, w) : null;
  return {
    g,
    draw(a, b) {
      const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1e-6;
      const d = [dx / L, dy / L], n = [d[1], -d[0]];
      const at = (u, o) => [a[0] + d[0] * u * L + n[0] * o, a[1] + d[1] * u * L + n[1] * o];
      const F = front2.map(([u, o]) => at(u, o)), B = back.map(([u, o]) => at(u, -o));
      lf.setAttribute("d", open(F));
      lb.setAttribute("d", open(B));
      fill.setAttribute("d", `${open(F)} L${open(B.slice().reverse()).slice(1)}Z`);
      cs?.setAttribute("d", `M${pt(F[0])} L${pt(B[0])}`);
      ce?.setAttribute("d", `M${pt(F[F.length - 1])} L${pt(B[B.length - 1])}`);
    }
  };
}
function jointCap(parent, r, w = LINE) {
  const c = el("circle", { r: f(r), fill: PAPER, stroke: INK, "stroke-width": w }, parent);
  return (p) => {
    c.setAttribute("cx", f(p[0]));
    c.setAttribute("cy", f(p[1]));
  };
}
function hullShape(parent, w = LINE, k = 0.14) {
  const node = shape(parent, w);
  return (points) => node.setAttribute("d", loop(thin(hull(points)), k));
}
function outline(parent, w = LINE, k = 0.17) {
  const node = shape(parent, w);
  return (points) => node.setAttribute("d", loop(points, k));
}
function strokes(parent, w = LINE) {
  const node = pen(parent, w);
  return (paths) => node.setAttribute("d", paths.filter((p) => p.length >= 2).map((p) => open(p)).join(" "));
}
function createChair(parent, body, view, offset = [0, 0, 0]) {
  const k = body.height / 95, seatY = body.rig.seatHeight;
  const at = (v) => [v[0] + offset[0], v[1] + offset[1], v[2] + offset[2]];
  const P2 = (v) => {
    const p = project(at(v), view);
    return [p.x, p.y];
  };
  const depth = (v) => project(at(v), view).depth;
  const x = 11.5 * k, zb = -9 * k, zf = 15 * k, t = 1.8 * k, back = 27 * k;
  const ROD = [[0, 0.75], [1, 0.65]];
  const g = el("g", {}, parent);
  const legsG = el("g", {}, g), postsG = el("g", {}, g), backG = el("g", {}, g), seatG = el("g", {}, g);
  const legs = [[-x, zb], [x, zb], [-x, zf], [x, zf]].map(([lx, lz]) => ({ top: [lx, seatY - t, lz], bot: [lx, 0, lz], part: segment(legsG, ROD, ROD, { end: true }, LINE * 0.9) }));
  const posts = [[-x, zb], [x, zb]].map(([lx, lz]) => ({ top: [lx, seatY + back, lz - 2 * k], bot: [lx, seatY, lz], part: segment(postsG, ROD, ROD, { end: true }, LINE * 0.9) }));
  const backrest = hullShape(backG, LINE * 0.9, 0.06);
  const seat = hullShape(seatG, LINE * 0.9, 0.06);
  const box = (y0, y1, z0, z1, xx) => {
    const out = [];
    for (const sx of [-xx, xx]) for (const y of [y0, y1]) for (const z of [z0, z1]) out.push(P2([sx, y, z]));
    return out;
  };
  return {
    g,
    draw() {
      for (const l of [...legs].sort((a, b) => depth(a.top) - depth(b.top))) {
        l.part.draw(P2(l.top), P2(l.bot));
        legsG.appendChild(l.part.g);
      }
      for (const p of posts) p.part.draw(P2(p.bot), P2(p.top));
      backrest(box(seatY + back - 7 * k, seatY + back, zb - 2.6 * k, zb - 1.4 * k, x + 0.8 * k));
      seat(box(seatY - t, seatY, zb - 1 * k, zf + 1 * k, x + 1 * k));
    }
  };
}
function viewTools(view) {
  const cam = towardCamera(view);
  const P2 = (v) => {
    const p = project(v, view);
    return [p.x, p.y];
  };
  const flat = norm([cam[0], 0, cam[2]]);
  const depth = (v) => dot(v, flat);
  const facing = (n) => dot(norm(n), cam);
  const mid2 = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
  function visibleRuns(pts, normals, thr = 0.05, closed = true) {
    const vis = normals.map((n2) => facing(n2) > thr);
    const n = pts.length;
    if (vis.every(Boolean)) return [pts.map(P2).concat(closed ? [P2(pts[0])] : [])];
    const start = closed ? vis.findIndex((v) => !v) : 0;
    const runs = [];
    let run = [];
    for (let i = 0; i < n; i++) {
      const j = (start + i) % n;
      if (vis[j]) run.push(P2(pts[j]));
      else {
        if (run.length > 1) runs.push(run);
        run = [];
      }
    }
    if (run.length > 1) runs.push(run);
    return runs;
  }
  function ringPoints(s, r, n = 24) {
    const R = s.frames[r.frame];
    const o = r.frame === "thoracic" ? s.joints.chestBase : s.joints.pelvis;
    const pts = [], normals = [];
    for (let i = 0; i < n; i++) {
      const th = 2 * Math.PI * i / n, c = Math.cos(th), sn = Math.sin(th);
      pts.push(add(o, apply(R, [r.hx * c, r.y, r.z + r.hz * sn])));
      normals.push(apply(R, [c / r.hx, 0, sn / r.hz]));
    }
    return { pts, normals };
  }
  function sweep(s, rings) {
    return sweepSamples(rings.map((r) => ringPoints(s, r).pts.map(P2)));
  }
  function sweepHem(s, rings) {
    const outline2 = sweep(s, rings);
    const hemPts = ringPoints(s, rings[0]).pts.map(P2);
    const n = hemPts.length, right0 = outline2[0], left0 = outline2[outline2.length - 1];
    const iR = hemPts.indexOf(right0), iL = hemPts.indexOf(left0);
    if (iR < 0 || iL < 0 || iR === iL) return outline2;
    const arc = (step) => {
      const out = [];
      for (let i = (iL + step + n) % n; i !== iR; i = (i + step + n) % n) out.push(hemPts[i]);
      return out;
    };
    const a1 = arc(1), a2 = arc(-1);
    const meanY = (a) => a.length ? a.reduce((t, p) => t + p[1], 0) / a.length : -Infinity;
    return [...outline2, ...meanY(a1) >= meanY(a2) ? a1 : a2];
  }
  function sweepSamples(samples) {
    const c0 = centroid(samples[0]), c1 = centroid(samples[samples.length - 1]);
    let ax = [c1[0] - c0[0], c1[1] - c0[1]];
    const L = Math.hypot(ax[0], ax[1]);
    ax = L > 1 ? [ax[0] / L, ax[1] / L] : [0, -1];
    const nrm = [-ax[1], ax[0]];
    const right = [], left = [];
    for (const pts of samples) {
      let lo = pts[0], hi = pts[0];
      for (const p of pts) {
        if (dot2(p, nrm) > dot2(hi, nrm)) hi = p;
        if (dot2(p, nrm) < dot2(lo, nrm)) lo = p;
      }
      right.push(hi);
      left.push(lo);
    }
    return [...right, ...left.reverse()];
  }
  function sweepCapped(samples, axisLength3d = 0) {
    const sides = sweepSamples(samples), n = samples.length;
    const right = sides.slice(0, n), left = sides.slice(n).reverse();
    const H = hull(samples.flat());
    if (H.length < 3) return sides;
    const c0 = centroid(samples[0]), c1 = centroid(samples[n - 1]);
    const up = [c1[0] - c0[0], c1[1] - c0[1]];
    const L = Math.hypot(up[0], up[1]) || 1, ax = [up[0] / L, up[1] / L];
    const folds = (chain2) => chain2.some((p, i) => i > 0 && dot2(p, ax) < dot2(chain2[i - 1], ax) - 0.05);
    if (L < 1 || folds(right) || folds(left) || axisLength3d > 0 && L < 0.87 * axisLength3d) return H;
    const nearest = (q) => H.reduce((bi, p, i) => Math.hypot(p[0] - q[0], p[1] - q[1]) < Math.hypot(H[bi][0] - q[0], H[bi][1] - q[1]) ? i : bi, 0);
    const arc = (a, b, sgn2) => {
      const ia = nearest(a), ib = nearest(b), m = H.length;
      if (ia === ib) return [];
      const walk = (step) => {
        const out = [];
        for (let i = (ia + step + m) % m; i !== ib; i = (i + step + m) % m) out.push(H[i]);
        return out;
      };
      const w1 = walk(1), w2 = walk(-1);
      const score = (w) => {
        const q = w.length ? w : [H[ia], H[ib]];
        return q.reduce((t, p) => t + dot2(p, up), 0) / q.length * sgn2;
      };
      return score(w1) >= score(w2) ? w1 : w2;
    };
    return [...right, ...arc(right[n - 1], left[n - 1], 1), ...left.slice().reverse(), ...arc(left[0], right[0], -1)];
  }
  const local = (_s, R, o, v) => add(o, apply(R, v));
  return { cam, P2, depth, facing, mid: mid2, visibleRuns, ringPoints, sweep, sweepHem, sweepSamples, sweepCapped, local };
}
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];
const sub2 = (a, b) => [a[0] - b[0], a[1] - b[1]];
function centroid(P) {
  let x = 0, y = 0;
  for (const p of P) {
    x += p[0];
    y += p[1];
  }
  return [x / P.length, y / P.length];
}
const SIDES$1 = ["L", "R"];
const HALF_PI = Math.PI / 2;
const SEAM = LINE * 0.55, DOT = 0.2;
const PELVIS = [[-5.4, 3, 2.8, 0], [-4.4, 5.8, 4, 0], [-2, 7.4, 4.8, -0.2], [1.6, 7.6, 4.8, -0.2], [2.8, 6.8, 4.2, -0.2]];
const CHEST = [[-3.2, 5.4, 4.2, 0.3], [-2.2, 6.2, 4.9, 0.4], [3, 7.3, 5.8, 0.5], [8, 7.8, 5.8, 0.3], [11.2, 7.3, 4.8, -0.3], [13.6, 4.4, 3.6, -0.2], [14.9, 2.6, 2.6, 0.6]];
const HELMET = [
  [-5, 1.8, 2.7, 0.6],
  [-4.2, 2.7, 3.6, -0.8],
  [-3, 3.4, 4.1, -2.4],
  [-1.8, 3.95, 4.35, -3.6],
  [-0.6, 4.25, 4.55, -4.4],
  [0.8, 4.4, 4.6, -4.8],
  [2.2, 4.45, 4.5, -4.9],
  [3.6, 4.3, 4.1, -4.7],
  [4.8, 3.8, 3.3, -4],
  [5.8, 2.8, 2.3, -2.8],
  [6.4, 1.2, 0.8, -0.9]
];
const VISOR = { lo: -0.2, hi: 2.2, span: 1.75, lift: 0.3, liftTop: 0.6 };
const FACEPLATE = [[-0.35, 1, 0.5], [-1.4, 0.95, 0.75], [-2.5, 0.85, 0.45], [-3.5, 0.7, 0.35], [-4.35, 0.5, 0.55]];
function limbRows(L, u0, u1, a, b, bulge = 0) {
  const w = (u, i) => a[i] + (b[i] - a[i]) * ((u - u0) / (u1 - u0));
  const row = (u, s) => [-u * L, w(u, 0) * s, w(u, 1) * s, 0];
  const rows = [row(u0, 0.82), row(u0 + 0.04, 1)];
  if (bulge) rows.push([-(u0 + 0.25 * (u1 - u0)) * L, w(u0, 0) * (1 + bulge), w(u0, 1) * (1 + bulge * 1.4), bulge * 2]);
  rows.push(row(u1 - 0.04, 1), row(u1, 0.82));
  return rows.sort((p, q) => p[0] - q[0]);
}
const sp = (c, e) => Math.sign(c) * Math.abs(c) ** e;
function helmetRing(y, hx, fz, bz, t) {
  const c = Math.cos(t), s = Math.sin(t), p = 2.4;
  return [[hx * sp(c, 2 / p), y, s >= 0 ? fz * sp(s, 2 / p) : -bz * sp(s, 2 / p)], [sp(c, 2 - 2 / p) / hx, 0, sp(s, 2 - 2 / p) / (s >= 0 ? fz : Math.max(0.5, -bz))]];
}
const robotHeadSections = (k) => HELMET.map(([y, hx, fz, bz]) => Array.from({ length: 24 }, (_, i) => {
  const p = helmetRing(y, hx, fz, bz, 2 * Math.PI * i / 24)[0];
  return [p[0] * k, p[1] * k, p[2] * k];
}));
const robotHeadAxis = (k) => (HELMET[HELMET.length - 1][0] - HELMET[0][0]) * k;
function sec(hx, hz, p, t) {
  const c = Math.cos(t), s = Math.sin(t);
  return [hx * sp(c, 2 / p), hz * sp(s, 2 / p), sp(c, 2 - 2 / p) / hx, sp(s, 2 - 2 / p) / hz];
}
function rowAt(rows, y) {
  if (y <= rows[0][0]) return rows[0];
  for (let i = 0; i < rows.length - 1; i++) {
    const a = rows[i], b = rows[i + 1];
    if (y <= b[0]) {
      const u = (y - a[0]) / (b[0] - a[0] || 1);
      return [y, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u];
    }
  }
  return rows[rows.length - 1];
}
const frameOf = (x, y, z) => [x[0], y[0], z[0], x[1], y[1], z[1], x[2], y[2], z[2]];
function boneFrame(a, b, hint) {
  const y = norm(sub(a, b));
  let x = sub(hint, scale(y, dot(hint, y)));
  if (len(x) < 1e-6) x = cross(y, [0, 0, 1]);
  x = norm(x);
  return frameOf(x, y, cross(x, y));
}
function createRobot3D(parent, body, view) {
  const B = body.rig, k = body.height / 95;
  const { P2, depth, facing, mid: mid2, visibleRuns, ringPoints, sweep, sweepCapped } = viewTools(view);
  const at = (R, o, v) => add(o, apply(R, v));
  const K = (v) => [v[0] * k, v[1] * k, v[2] * k];
  const root = el("g", {}, parent);
  const groups = {
    torso: el("g", {}, root),
    head: el("g", {}, root),
    legL: el("g", {}, root),
    legR: el("g", {}, root),
    armL: el("g", {}, root),
    armR: el("g", {}, root)
  };
  function solid(parent2, convex = true) {
    const g = el("g", {}, parent2);
    const shape2 = convex ? hullShape(g, LINE, 0.1) : outline(g, LINE, 0.12);
    const lines = strokes(g, SEAM);
    const d = el("path", { fill: INK }, g);
    return {
      g,
      depth: 0,
      shape: shape2,
      lines,
      dots: (cs) => d.setAttribute("d", cs.map(([x, y]) => `M${f(x - DOT)} ${f(y)}a${DOT} ${DOT} 0 1 0 ${f(2 * DOT)} 0a${DOT} ${DOT} 0 1 0 ${f(-2 * DOT)} 0`).join(""))
    };
  }
  const hide = (p) => {
    p.shape([]);
    p.lines([]);
    p.dots([]);
  };
  function stackPts(R, o, rows, p, n = 16) {
    const out = [];
    for (const r of rows) for (let i = 0; i < n; i++) {
      const [x, z] = sec(r[1], r[2], p, 2 * Math.PI * i / n);
      out.push(at(R, o, K([x, r[0], r[3] + z])));
    }
    return out;
  }
  function surf(R, o, rows, p, y, t, lift = 0) {
    const r = rowAt(rows, y), [x, z, nx, nz] = sec(r[1], r[2], p, t), nn = norm([nx, 0, nz]);
    return { pt: at(R, o, K([x + nn[0] * lift, y, r[3] + z + nn[2] * lift])), n: apply(R, nn) };
  }
  function seam(R, o, rows, p, samples, thr = 0.15) {
    const s = samples.map(([y, t]) => surf(R, o, rows, p, y, t));
    return visibleRuns(s.map((q) => q.pt), s.map((q) => q.n), thr, false);
  }
  const line = (y0, t0, y1, t1, n = 8) => Array.from({ length: n + 1 }, (_, i) => [y0 + (y1 - y0) * i / n, t0 + (t1 - t0) * i / n]);
  const ring = (y, t0 = 0, t1 = 2 * Math.PI, n = 28) => line(y, t0, y, t1, n);
  function housing(p, c, axis, r, h, o = {}) {
    const a = norm(axis), u = norm(cross(a, Math.abs(a[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0])), v = cross(a, u);
    const circ = (cc, rr, n = 20) => Array.from({ length: n }, (_, i) => {
      const th = 2 * Math.PI * i / n;
      return { pt: add(add(cc, u, rr * Math.cos(th)), v, rr * Math.sin(th)), n: add(scale(u, Math.cos(th)), v, Math.sin(th)) };
    });
    r *= k;
    h *= k;
    const pts = [];
    for (const e2 of [-1, 1]) for (const q of [...circ(add(c, a, e2 * h * 0.72), r), ...circ(add(c, a, e2 * h), r * 0.84)]) pts.push(q.pt);
    p.shape(pts.map(P2));
    const fa = facing(a), e = fa >= 0 ? 1 : -1, fc = Math.abs(fa);
    const L = [];
    const band = circ(add(c, a, e * h * 0.72), r, 28);
    if (fc > 0.12 && fc < 0.97) L.push(...visibleRuns(band.map((q) => q.pt), band.map((q) => q.n), 0.15));
    const mid22 = circ(c, r, 28);
    if (fc < 0.85) L.push(...visibleRuns(mid22.map((q) => q.pt), mid22.map((q) => q.n), 0.2));
    if (o.cap !== false && fc > 0.12) {
      const cap = add(c, a, e * h);
      L.push([...circ(cap, r * 0.84, 28), circ(cap, r * 0.84, 28)[0]].map((q) => P2(q.pt)));
      L.push([...circ(cap, r * 0.48, 20), circ(cap, r * 0.48, 20)[0]].map((q) => P2(q.pt)));
    }
    p.lines([...L, ...o.extra ?? []]);
    p.dots(o.dots !== false && fc > 0.45 ? [0, 1, 2].map((i) => {
      const th = HALF_PI + 2 * Math.PI * i / 3;
      return P2(add(add(add(c, a, e * h), u, r * 0.66 * Math.cos(th)), v, r * 0.66 * Math.sin(th)));
    }) : []);
    p.depth = depth(c);
  }
  function box(R, o, a, b, hx, hz) {
    const d = norm(sub(b, a)), z = norm(cross([1, 0, 0], d)), x = norm(cross(d, z));
    const pts = [];
    for (const p of [a, b]) for (const sx of [-1, 1]) for (const sz of [-1, 1]) pts.push(at(R, o, K(add(add(p, x, sx * hx), z, sz * hz))));
    return { pts, x, z };
  }
  const torso = { waist: solid(groups.torso, false), pelvis: solid(groups.torso), chest: solid(groups.torso) };
  const WAIST = [
    { frame: "pelvis", y: 2.2 * k, hx: 4 * k, hz: 3.4 * k, z: -0.4 * k },
    ...Array.from({ length: 7 }, (_, i) => ({ frame: "lumbar", y: (3.4 + i) * k, hx: (i % 2 ? 3.8 : 4.3) * k, hz: (i % 2 ? 3.2 : 3.7) * k, z: -0.4 * k })),
    { frame: "thoracic", y: -2.2 * k, hx: 4 * k, hz: 3.4 * k, z: -0.4 * k }
  ];
  const arm = {};
  const leg = {};
  for (const sd of SIDES$1) {
    const g = groups[`arm${sd}`];
    arm[sd] = { pod: solid(g), upper: solid(g), elbow: solid(g), fore: solid(g), wrist: solid(g), palm: solid(g), digits: Array.from({ length: 4 }, () => solid(g)) };
    const gl = groups[`leg${sd}`];
    leg[sd] = { hip: solid(gl), thigh: solid(gl), knee: solid(gl), shin: solid(gl), ankle: solid(gl), foot: solid(gl), toe: solid(gl) };
  }
  const UPPER = limbRows(B.upperArm / k, 0.12, 0.9, [2.4, 2.5], [1.85, 1.9]);
  const FORE = limbRows(B.forearm / k, 0.1, 0.9, [2, 2], [1.45, 1.4]);
  const THIGH2 = limbRows(B.thigh / k, 0.1, 0.9, [3.7, 4], [2.6, 2.6]);
  const SHIN2 = limbRows(B.shank / k, 0.1, 0.93, [2.8, 2.8], [1.75, 1.8], 0.1);
  const head = { neckLo: solid(groups.head), neckHi: solid(groups.head), helmet: solid(groups.head, false), face: solid(groups.head), visor: solid(groups.head, false), discL: solid(groups.head), discR: solid(groups.head) };
  head.helmet.g.setAttribute("data-part", "head-outline");
  const helmetAt = (y, t, lift = 0) => {
    let i = 0;
    while (i < HELMET.length - 2 && HELMET[i + 1][0] < y) i++;
    const a = HELMET[i], b = HELMET[i + 1], u = Math.max(0, Math.min(1, (y - a[0]) / (b[0] - a[0])));
    const [p, n] = helmetRing(y, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, a[3] + (b[3] - a[3]) * u, t);
    const nn = norm(n);
    return { p: add(p, nn, lift), n: nn };
  };
  return {
    g: root,
    arms: { L: groups.armL, R: groups.armR },
    draw(s) {
      const j = s.joints, F = s.frames;
      const Rp = F.pelvis, Rt = F.thoracic;
      const T = torso;
      T.waist.shape(sweep(s, WAIST));
      T.waist.lines(WAIST.slice(1, -1).filter((_, i) => i % 2 === 0).flatMap((r) => {
        const q = ringPoints(s, r, 28);
        return visibleRuns(q.pts, q.normals, 0.2);
      }));
      T.pelvis.shape(stackPts(Rp, j.pelvis, PELVIS, 3).map(P2));
      T.pelvis.lines([
        ...seam(Rp, j.pelvis, PELVIS, 3, ring(1)),
        ...seam(Rp, j.pelvis, PELVIS, 3, line(1, HALF_PI, -4.6, HALF_PI, 6), 0.3)
      ]);
      T.chest.shape(stackPts(Rt, j.chestBase, CHEST, 3).map(P2));
      const C = (smp, thr = 0.15) => seam(Rt, j.chestBase, CHEST, 3, smp, thr);
      T.chest.lines([
        ...C(line(-2, HALF_PI, 12.6, HALF_PI, 10), 0.2),
        // sternum
        ...[1, -1].flatMap((m) => [
          ...C(line(-2, HALF_PI - m * 0.62, 4, HALF_PI - m * 0.62, 6), 0.2),
          // abdominal plate edges
          ...C(line(4, HALF_PI - m * 0.08, 4, HALF_PI - m * 1.25, 8), 0.2),
          // chest / abdomen plate break
          ...C(line(14.2, HALF_PI - m * 0.5, 10, HALF_PI - m * 1.1, 8), 0.15),
          // shoulder yoke
          ...C(line(-2, HALF_PI - m * HALF_PI, 9, HALF_PI - m * HALF_PI, 8), 0.4)
          // flank panel
        ])
      ]);
      T.chest.dots([]);
      T.pelvis.dots([]);
      T.waist.dots([]);
      const lateral = apply(Rp, [1, 0, 0]);
      for (const sd of SIDES$1) {
        const Lg = leg[sd], m = sd === "L" ? 1 : -1;
        const hip = j[`hip${sd}`], kn = j[`knee${sd}`], an = j[`ankle${sd}`];
        const dT = norm(sub(kn, hip)), dS = norm(sub(an, kn));
        const ortho = norm(sub(lateral, scale(dT, dot(lateral, dT))));
        let nrm = cross(dS, dT);
        const bend = len(nrm);
        nrm = dot(nrm, ortho) < 0 ? scale(norm(nrm), -1) : norm(nrm);
        const w = Math.min(1, bend / 0.25), hinge = norm(add(scale(ortho, 1 - w), nrm, w));
        const Rth = boneFrame(hip, kn, hinge), Rsh = boneFrame(kn, an, hinge);
        housing(Lg.hip, add(hip, lateral, m * 1 * k), lateral, 2.6, 1.9);
        Lg.hip.depth += 1;
        Lg.thigh.shape(stackPts(Rth, hip, THIGH2, 3).map(P2));
        Lg.thigh.lines(seam(Rth, hip, THIGH2, 3, line(THIGH2[1][0], HALF_PI - m * 0.75, THIGH2[THIGH2.length - 2][0], HALF_PI - m * 0.75)));
        Lg.thigh.depth = depth(mid2(hip, kn));
        housing(Lg.knee, kn, hinge, 2.5, 2.5);
        Lg.knee.depth += 1;
        Lg.shin.shape(stackPts(Rsh, kn, SHIN2, 3).map(P2));
        Lg.shin.lines(seam(Rsh, kn, SHIN2, 3, line(SHIN2[1][0], HALF_PI - m * 0.5, SHIN2[SHIN2.length - 2][0], HALF_PI - m * 0.5)));
        Lg.shin.depth = depth(mid2(kn, an));
        const Rf = F[`foot${sd}`], Rtoe = F[`toe${sd}`], aH = B.ankleHeight / k, zb = B.ballForward / k, ball = j[`ball${sd}`];
        const S = (x, y, z) => at(Rf, an, K([x * m, y, z]));
        const T2 = (x, y, z) => at(Rtoe, ball, K([x * m, y + aH, z - zb]));
        const footPts = [];
        for (const x of [-1, 1]) footPts.push(
          S(1.6 * x, -aH, -4.4),
          S(2 * x, -aH, 1),
          S(2.1 * x, -aH, zb - 0.1),
          S(2.1 * x, -aH + 1.5, zb - 0.1),
          S(1.9 * x, -aH + 3.8, 2.4),
          S(1.8 * x, -aH + 4.2, -1.2),
          S(1.6 * x, -aH + 3.2, -4.4)
        );
        Lg.foot.shape(footPts.map(P2));
        const toePts = [];
        for (const x of [-1, 1]) toePts.push(T2(2.1 * x, -aH, zb + 0.1), T2(2.1 * x, -aH + 1.45, zb + 0.1), T2(1.7 * x, -aH, 11), T2(1.7 * x, -aH + 1.2, 11));
        Lg.toe.shape(toePts.map(P2));
        const rearSole = [[2.15, zb - 0.1], [2.05, 0], [1.65, -4.2], [0, -4.5], [-1.65, -4.2], [-2.05, 0], [-2.15, zb - 0.1]];
        const toeSole = [[2.15, zb + 0.1], [1.8, 10.8], [0, 11.1], [-1.8, 10.8], [-2.15, zb + 0.1]];
        const heel = [1, -1].flatMap((x) => facing(apply(Rf, [x * m, 0, 0])) > 0.2 ? [[S(x * 2, -aH + 0.7, 1.6), S(x * 1.9, -aH + 3.6, 1.6)].map(P2)] : []);
        Lg.foot.lines([
          ...visibleRuns(rearSole.map(([x, z]) => S(x, -aH + 0.7, z)), rearSole.map(([x, z]) => apply(Rf, [x * m, 0, z - 3.5])), 0.05, false),
          ...heel
        ]);
        Lg.toe.lines(visibleRuns(toeSole.map(([x, z]) => T2(x, -aH + 0.6, z)), toeSole.map(([x, z]) => apply(Rtoe, [x * m, 0, z - zb])), 0.05, false));
        Lg.foot.dots([]);
        Lg.toe.dots([]);
        Lg.foot.depth = depth(S(0, -aH, 2));
        Lg.toe.depth = depth(T2(0, -aH, 9.5));
        housing(Lg.ankle, an, apply(Rf, [1, 0, 0]), 1.9, 1.8);
        Lg.ankle.depth += 1;
        for (const p of [Lg.thigh, Lg.shin]) p.dots([]);
        const g = groups[`leg${sd}`];
        for (const p of [Lg.hip, Lg.thigh, Lg.knee, Lg.shin, Lg.toe, Lg.foot, Lg.ankle].sort((a, b) => a.depth - b.depth)) g.appendChild(p.g);
      }
      const chestLat = apply(Rt, [1, 0, 0]);
      for (const sd of SIDES$1) {
        const A = arm[sd], m = sd === "L" ? 1 : -1;
        const sh = j[`shoulder${sd}`], e = j[`elbow${sd}`], w = j[`wrist${sd}`];
        const Rua = F[`upperArm${sd}`], Rfa = F[`forearm${sd}`], Rh = F[`hand${sd}`];
        housing(A.pod, add(sh, chestLat, m * 0.4 * k), chestLat, 2.9, 2.2);
        A.pod.depth += 1;
        A.upper.shape(stackPts(Rua, sh, UPPER, 3).map(P2));
        A.upper.lines(seam(Rua, sh, UPPER, 3, line(UPPER[1][0], HALF_PI - m * 0.7, UPPER[UPPER.length - 2][0], HALF_PI - m * 0.7)));
        A.upper.depth = depth(mid2(sh, e));
        housing(A.elbow, e, apply(Rua, [1, 0, 0]), 2, 2.1);
        A.elbow.depth += 1;
        A.fore.shape(stackPts(Rfa, e, FORE, 3).map(P2));
        A.fore.lines(seam(Rfa, e, FORE, 3, line(FORE[1][0], HALF_PI - m * 0.6, FORE[FORE.length - 2][0], HALF_PI - m * 0.6)));
        A.fore.depth = depth(mid2(e, w));
        housing(A.wrist, w, sub(w, e), 1.45, 0.75, { dots: false, cap: false });
        A.wrist.depth += 0.6;
        for (const p of [A.upper, A.fore]) p.dots([]);
        const H2 = (v) => at(Rh, w, K(v));
        const faceLines = (bx, a, b, hz, xs) => {
          const zc = facing(apply(Rh, bx.z)), zf = zc > 0.45 ? hz : zc < -0.45 ? -hz : 0;
          return zf ? xs.map((x) => [P2(H2(add(add(a, bx.x, x), bx.z, zf))), P2(H2(add(add(b, bx.x, x), bx.z, zf)))]) : [];
        };
        const palmA = [0, -0.6, 0], palmB = [0, -4, 0];
        const palm = box(Rh, w, palmA, palmB, 1.55, 0.6);
        A.palm.shape(palm.pts.map(P2));
        A.palm.lines([]);
        A.palm.dots([]);
        A.palm.depth = depth(H2([0, -2.3, 0]));
        const curl1 = 0.2, curl2 = 0.62;
        const d1 = [0, -Math.cos(curl1), Math.sin(curl1)], d2 = [0, -Math.cos(curl2), Math.sin(curl2)];
        const f0 = add(palmB, d1, 0.05), f1 = add(f0, d1, 2), f2 = add(f1, d2, 0.04), f3 = add(f2, d2, 1.55);
        const thumbBase = [1.45 * m, -1.4, 0.3];
        const t1 = add(thumbBase, norm([0.1 * m, -0.98, 0.12]), 1.9), t2 = add(t1, norm([0.02 * m, -0.9, 0.42]), 1.3);
        const pieces = [
          [f0, f1, 1.5, 0.55, [-0.75, 0, 0.75]],
          [f2, f3, 1.4, 0.5, [-0.7, 0, 0.7]],
          [thumbBase, t1, 0.48, 0.45, []],
          [add(t1, sub(t2, t1), 0.03), t2, 0.42, 0.4, []]
        ];
        pieces.forEach(([a, b, hx, hz, grooves], i) => {
          const P = A.digits[i], bx = box(Rh, w, a, b, hx, hz);
          P.shape(bx.pts.map(P2));
          P.lines(faceLines(bx, add(a, sub(b, a), 0.1), b, hz, grooves));
          P.dots([]);
          P.depth = depth(H2(mid2(a, b)));
        });
        const g = groups[`arm${sd}`];
        for (const p of [A.pod, A.upper, A.elbow, A.fore, A.wrist, A.palm, ...A.digits].sort((a, b) => a.depth - b.depth)) g.appendChild(p.g);
      }
      const H = head, Rhd = F.head, c = j.headC;
      const hd = (v) => at(Rhd, c, K(v));
      const neckBase = add(j.neckBase, apply(Rt, [0, -0.4 * k, 0])), neckTop = j.skullBase;
      const nAx = sub(neckTop, neckBase), nl = len(nAx) / k, nA = norm(nAx), split = add(neckBase, nAx, 0.45);
      const keyLine = (from, to, r, dir) => {
        const q = norm(sub(dir, scale(nA, dot(dir, nA))));
        return facing(q) > 0.2 ? [[P2(add(from, q, r * k)), P2(add(to, q, r * k))]] : [];
      };
      const neckFwd = apply(Rhd, [0, 0, 1]);
      housing(H.neckLo, add(neckBase, nAx, 0.22), nAx, 1.9, nl * 0.24, {
        dots: false,
        cap: false,
        extra: keyLine(add(neckBase, nAx, 0.06), add(neckBase, nAx, 0.38), 1.9, apply(Rt, [0, 0, 1]))
      });
      housing(H.neckHi, add(split, nAx, 0.3), nAx, 1.5, nl * 0.32, {
        dots: false,
        cap: false,
        extra: keyLine(add(split, nAx, 0.06), add(split, nAx, 0.5), 1.5, neckFwd)
      });
      H.helmet.shape(sweepCapped(robotHeadSections(k).map((sec2) => sec2.map((p) => P2(at(Rhd, c, p)))), robotHeadAxis(k)));
      const hs = (pts, thr = 0.15) => visibleRuns(pts.map((q) => hd(q.p)), pts.map((q) => apply(Rhd, q.n)), thr, false);
      H.helmet.dots([]);
      const cols = Array.from({ length: 41 }, (_, i) => HALF_PI - VISOR.span + 2 * VISOR.span * i / 40);
      const vis = cols.map((t) => facing(apply(Rhd, helmetAt((VISOR.lo + VISOR.hi) / 2, t).n)) > 0.02);
      let best = [], cur = [];
      vis.forEach((v, i) => {
        if (v) {
          cur.push(i);
          if (cur.length > best.length) best = cur.slice();
        } else cur = [];
      });
      if (best.length >= 2) {
        const top = best.map((i) => P2(hd(helmetAt(VISOR.hi, cols[i], VISOR.liftTop).p)));
        const bot = best.map((i) => P2(hd(helmetAt(VISOR.lo, cols[i], VISOR.lift).p)));
        H.visor.shape([...top, ...bot.reverse()]);
        const hatch = best.filter((i) => i % 2 === 0 && i < cols.length - 1 && facing(apply(Rhd, helmetAt(0.8, cols[i]).n)) > 0.3).map((i) => [P2(hd(helmetAt(VISOR.hi - 0.45, cols[i], VISOR.lift).p)), P2(hd(helmetAt(VISOR.lo + 0.45, cols[i + 1], VISOR.lift).p))]);
        H.visor.lines(hatch);
      } else hide(H.visor);
      H.visor.dots([]);
      const faceN = apply(Rhd, [0, 0, 1]), fFace = facing(faceN);
      const ridgeAt = (y) => {
        const r = rowAt(FACEPLATE.map(([yy, , rr]) => [yy, rr, 0, 0]).reverse(), y);
        return r[1];
      };
      const fp = [];
      for (const [y, w, ridge] of FACEPLATE) {
        for (let i = 0; i <= 6; i++) fp.push(hd(helmetAt(y, HALF_PI - w + 2 * w * i / 6, 0.4).p));
        fp.push(hd(helmetAt(y, HALF_PI, 0.4 + ridge).p));
      }
      for (const t of [-0.45, 0, 0.45]) fp.push(hd(helmetAt(-4.75, HALF_PI + t, 0.15).p));
      if (fFace > -0.05) {
        H.face.shape(fp.map(P2));
        const onPlate = (y, dt) => hd(helmetAt(y, HALF_PI + dt, 0.4 + ridgeAt(y) * Math.max(0, 1 - Math.abs(dt) / 0.45)).p);
        const fl = [];
        if (fFace > 0.2) {
          fl.push([-0.55, -1.2, -2.3].map((y) => P2(onPlate(y, 0))));
          for (const y of [-2.95, -3.3, -3.65]) fl.push([-0.34, -0.17, 0, 0.17, 0.34].map((dt) => P2(onPlate(y, dt))));
          fl.push([-0.5, -0.25, 0, 0.25, 0.5].map((dt) => P2(onPlate(-4.1, dt))));
        }
        H.face.lines(fl);
      } else hide(H.face);
      H.face.dots([]);
      H.helmet.lines([
        ...hs(Array.from({ length: 33 }, (_, i) => helmetAt(3.8, 2 * Math.PI * i / 32))),
        // crown seam
        ...[1, -1].flatMap((m) => hs(Array.from({ length: 7 }, (_, i) => helmetAt(VISOR.lo - i / 6 * 3.6, HALF_PI - m * (1.25 - i * 0.05))), 0.2)),
        // cheek seams
        ...hs(Array.from({ length: 21 }, (_, i) => helmetAt(VISOR.hi + 0.45, HALF_PI - 1.3 + 2.6 * i / 20, 0.35)), 0.15)
        // brow edge
      ]);
      const hg = groups.head;
      for (const p of [H.neckLo, H.neckHi, ...fFace > -0.05 ? [H.helmet, H.face] : [H.face, H.helmet], H.visor, H.discL, H.discR]) hg.appendChild(p.g);
      for (const [p, m] of [[H.discL, 1], [H.discR, -1]]) {
        const ax = apply(Rhd, [m, 0, 0]);
        if (facing(ax) > 0.35) housing(p, hd([m * 4.3, -1.7, -1.6]), ax, 1.3, 0.35);
        else hide(p);
      }
      const order = [
        [groups.torso, depth(mid2(j.pelvis, j.chestBase))],
        [groups.head, depth(c) + 0.5],
        ...SIDES$1.map((sd) => [groups[`leg${sd}`], depth(mid2(j[`knee${sd}`], j[`ankle${sd}`])) + 3]),
        ...SIDES$1.map((sd) => [groups[`arm${sd}`], depth(mid2(j[`elbow${sd}`], j[`wrist${sd}`])) + 1])
      ];
      order.sort((a, b) => a[1] - b[1]);
      for (const [node] of order) root.appendChild(node);
    }
  };
}
const THIGH = [[[-0.05, 4.6], [0.3, 4.7], [0.7, 3.6], [1, 2.9]], [[-0.05, 4.8], [0.35, 4.3], [0.8, 3.1], [1, 2.8]]];
const SHIN = [[[0, 2.9], [0.15, 2.6], [0.6, 2], [1.02, 1.8]], [[0, 2.8], [0.25, 3.7], [0.5, 3.2], [0.85, 1.9], [1.02, 1.8]]];
const UPPER_ARM = [[[0, 2.7], [0.5, 2.3], [1, 1.75]], [[0, 2.6], [0.35, 2.6], [1, 1.75]]];
const FOREARM = [[[0, 1.75], [0.3, 2.05], [1, 1.35]], [[0, 1.75], [0.3, 2], [1, 1.35]]];
const SLEEVE = [[[-0.06, 2.2], [0.1, 3], [0.28, 3.4], [0.48, 3.3]], [[-0.06, 2.6], [0.08, 3.3], [0.48, 3.2]]];
const SHORTS_HEM = 0.6;
const SLEEVE_HEM = 0.48;
const SIDES = ["L", "R"];
const HEAD_SECTIONS = [
  [-5.1, 1.6, 3.2, 0.6, []],
  [-4.4, 2.6, 4.1, -0.6, []],
  [-3.3, 3.3, 4.5, -2, []],
  [-2.6, 3.6, 4.7, -2.8, []],
  [-1.9, 3.9, 4.55, -3.6, [[4.6, -1.9, -1.2], [-4.6, -1.9, -1.2]]],
  [-1.2, 4.1, 4.6, -4.2, [[0, -1.2, 5.6], [4.75, -1.2, -1.4], [-4.75, -1.2, -1.4]]],
  [0, 4.25, 4.6, -4.6, [[4.75, 0, -1.5], [-4.75, 0, -1.5]]],
  [1, 4.3, 4.55, -4.8, [[4.6, 1, -1.3], [-4.6, 1, -1.3]]],
  [2, 4.35, 4.45, -4.85, []],
  [3.4, 4.3, 4.2, -4.7, []],
  [4.6, 4, 3.4, -4.2, []],
  [5.6, 3.2, 2.6, -3, []],
  [6.4, 1.2, 0.6, -0.6, []]
];
function humanHeadSections(k) {
  return HEAD_SECTIONS.map(([y, w, fz, bz, extra]) => {
    const pts = [];
    for (let i = 0; i < 20; i++) {
      const t = 2 * Math.PI * i / 20, cz = Math.cos(t);
      pts.push([w * Math.sin(t) * k, y * k, (cz >= 0 ? fz : -bz) * cz * k]);
    }
    return [...pts, ...extra.map((p) => [p[0] * k, p[1] * k, p[2] * k])];
  });
}
const humanHeadAxis = (k) => (HEAD_SECTIONS[HEAD_SECTIONS.length - 1][0] - HEAD_SECTIONS[0][0]) * k;
function createFigure3D(parent, body, view) {
  if (body.character.appearance.kind === "robot") return createRobot3D(parent, body, view);
  const B = body.rig, W = body.widths, k = body.height / 95;
  const { P2, depth, facing, mid: mid2, visibleRuns, ringPoints, sweep, sweepHem, sweepCapped, local } = viewTools(view);
  const root = el("g", {}, parent);
  const groups = {
    torso: el("g", {}, root),
    head: el("g", {}, root),
    legL: el("g", {}, root),
    legR: el("g", {}, root),
    armL: el("g", {}, root),
    armR: el("g", {}, root)
  };
  const look = body.character.appearance;
  const shorts = look.bottom === "shorts";
  const legCover = look.bottom === "leggings" ? 1.04 : look.bottom === "joggers" ? 1.24 : 1.16;
  const sleeveKind = look.top === "tshirt" ? "short" : look.top === "tank" ? "none" : "long";
  const sleeveCover = look.top === "cardigan" || look.top === "sweater" ? 1.26 : 1.12;
  const kThigh = W.thigh / 4.7, kCalf = W.calf / 3.7, kUpper = W.upperArm / 2.7, kFore = W.forearm / 2.05;
  const seat = outline(groups.torso);
  const tubes = el("g", {}, groups.torso);
  const shortsTube = {};
  if (shorts) for (const s of SIDES) shortsTube[s] = segment(tubes, scaleProfile([[-0.12, 4.9], [0.3, 5], [SHORTS_HEM, 4.6]], kThigh), scaleProfile([[-0.12, 5], [0.3, 4.9], [SHORTS_HEM, 4.4]], kThigh), { end: true });
  const shortsLines = strokes(groups.torso, LINE * 0.7);
  const skin = sleeveKind === "none" ? outline(groups.torso) : null;
  const shirt = outline(groups.torso);
  const shirtLines = strokes(groups.torso, LINE * 0.7);
  const seatRings = [
    { frame: "pelvis", y: -4.2 * k, hx: W.pelvis * 0.55, hz: W.waist * 0.75, z: 0 },
    { frame: "pelvis", y: 0, hx: W.pelvis * 1.02, hz: W.waist * 0.98, z: -0.25 * k },
    { frame: "pelvis", y: 3.6 * k, hx: W.pelvis * 0.96, hz: W.waist, z: 0 }
  ];
  const shirtRings = [
    // a t-shirt hangs a little loose at the hem, so it covers the seat of the shorts
    { frame: "pelvis", y: 1 * k, hx: W.pelvis * 1, hz: W.waist * 1.06, z: -0.2 * k },
    { frame: "lumbar", y: B.lumbar * 0.5, hx: W.pelvis * 0.84, hz: W.waist, z: W.belly * 0.8 },
    { frame: "thoracic", y: 0.5 * k, hx: W.shoulders * 0.64, hz: W.chest * 0.95, z: W.belly * 0.3 + W.bust * 0.3 },
    { frame: "thoracic", y: 6 * k, hx: W.shoulders * 0.7, hz: W.chest, z: W.bust },
    // a tank top stops short of the shoulder joint, leaving the shoulder and arm bare
    { frame: "thoracic", y: B.shoulderOffset[1], hx: W.shoulders * (sleeveKind === "none" ? 0.7 : 0.96), hz: W.chest * 0.78, z: -0.4 * k },
    // trapezius: the shoulder line slopes up to the neck instead of a square corner
    { frame: "thoracic", y: B.shoulderOffset[1] + 2.2 * k, hx: W.shoulders * (sleeveKind === "none" ? 0.45 : 0.55), hz: W.chest * 0.6, z: -0.2 * k },
    { frame: "thoracic", y: B.neckBaseOffset[1] - 0.4 * k, hx: W.neck * 1.3, hz: W.neck * 1.25, z: B.neckBaseOffset[2] }
  ];
  const skinRings = [
    { frame: "thoracic", y: 6 * k, hx: W.shoulders * 0.68, hz: W.chest * 0.95, z: W.bust * 0.5 },
    { frame: "thoracic", y: B.shoulderOffset[1], hx: W.shoulders * 0.94, hz: W.chest * 0.76, z: -0.4 * k },
    { frame: "thoracic", y: B.shoulderOffset[1] + 2.2 * k, hx: W.shoulders * 0.55, hz: W.chest * 0.6, z: -0.2 * k },
    { frame: "thoracic", y: B.neckBaseOffset[1] - 0.4 * k, hx: W.neck * 1.3, hz: W.neck * 1.25, z: B.neckBaseOffset[2] }
  ];
  const thighFrom = shorts ? SHORTS_HEM : -0.05;
  const legK = shorts ? 1 : legCover, shinK = shorts ? 1 : look.bottom === "leggings" ? 1.04 : legCover * 1.02;
  const TROUSER_SHIN = [[[0, 2.95], [0.5, 2.6], [1.02, 2.5]], [[0, 2.9], [0.5, 2.7], [1.02, 2.5]]];
  const shinProfile = shorts || look.bottom === "leggings" ? SHIN : TROUSER_SHIN;
  const leg = {};
  for (const s of SIDES) {
    const g = groups[`leg${s}`];
    leg[s] = {
      knee: jointCap(g, 2.85 * kThigh * legK),
      shin: segment(g, scaleProfile(shinProfile[0], kCalf * shinK), scaleProfile(shinProfile[1], kCalf * shinK), { end: !shorts }),
      shoe: hullShape(g),
      shoeLines: strokes(g, LINE * 0.7),
      thigh: segment(g, scaleProfile(cropProfile(THIGH[0], Math.max(0, thighFrom)), kThigh * legK), scaleProfile(cropProfile(THIGH[1], Math.max(0, thighFrom)), kThigh * legK))
    };
  }
  const upperK = sleeveKind === "long" ? sleeveCover : 1, foreK = sleeveKind === "long" ? sleeveCover : 1;
  const upperFrom = sleeveKind === "short" ? SLEEVE_HEM - 0.04 : 0;
  const arm = {};
  for (const s of SIDES) {
    const g = groups[`arm${s}`];
    const elbow = el("g", {}, g), handG = el("g", {}, g);
    arm[s] = {
      elbow,
      elbowCap: jointCap(elbow, 1.75 * kUpper * upperK),
      fore: segment(g, scaleProfile(FOREARM[0], kFore * foreK), scaleProfile(FOREARM[1], kFore * foreK), { end: sleeveKind === "long" }),
      handG,
      hand: outline(handG, LINE, 0.16),
      fingers: strokes(handG, LINE * 0.7),
      upper: segment(g, scaleProfile(cropProfile(UPPER_ARM[0], upperFrom), kUpper * upperK), scaleProfile(cropProfile(UPPER_ARM[1], upperFrom), kUpper * upperK)),
      sleeve: sleeveKind === "short" ? segment(g, scaleProfile(SLEEVE[0], kUpper), scaleProfile(SLEEVE[1], kUpper), { end: true }) : null
    };
  }
  const neck = segment(groups.head, [[0, W.neck], [1, W.neck * 0.95]], [[0, W.neck], [1, W.neck * 0.95]]);
  const headBack = el("g", {}, groups.head);
  const head = outline(el("g", { "data-part": "head-outline" }, groups.head), LINE, 0.16);
  const headSections = humanHeadSections(k);
  const hair = outline(groups.head, LINE, 0.15);
  const headFront = el("g", {}, groups.head);
  const hairLines = strokes(groups.head, LINE * 0.6);
  const faceLines = strokes(groups.head, LINE * 0.75);
  const glasses = strokes(groups.head, LINE * 0.7);
  const ellipsoid = (c, r, nLat = 9, nLon = 16) => {
    const out = [];
    for (let i = 0; i <= nLat; i++) {
      const th = Math.PI * i / nLat;
      for (let j = 0; j < nLon; j++) {
        const ph = 2 * Math.PI * j / nLon;
        out.push([c[0] + r[0] * Math.sin(th) * Math.sin(ph), c[1] + r[1] * Math.cos(th), c[2] + r[2] * Math.sin(th) * Math.cos(ph)]);
      }
    }
    return out;
  };
  const SKULL_C = [0, 0.7, -0.4], SKULL_R = [4.3, 5.1, 4.8];
  const HAIR = {
    short: { front: 3.2, side: 0.6, back: -2.4, volume: 1.07 },
    ponytail: { front: 3, side: 0.4, back: -2, volume: 1.06 },
    // pulled back: close to the head
    receding: { front: 4.4, side: 0.8, back: -2.4, volume: 1.05 },
    bob: { front: 2.4, side: -3, back: -3.6, volume: 1.17 },
    // fringe; covers the ears to the jaw
    bun: { front: 3, side: 0.4, back: -1.6, volume: 1.05 },
    thinning: { front: 5.4, side: 0.2, back: -2.6, volume: 1.03 }
    // high, thin crown; fuller at the sides
  };
  const hairline = (x, z) => {
    const l = Math.hypot(x, z) || 1, xn = Math.abs(x) / l, zn = z / l;
    const h = HAIR[look.hair];
    return zn >= 0 ? h.front - (h.front - h.side) * xn : h.side + (h.back - h.side) * -zn;
  };
  const toK = (p) => [p[0] * k, p[1] * k, p[2] * k];
  const hairVol = ellipsoid(SKULL_C, SKULL_R, 12, 20).filter((p) => p[1] > hairline(p[0], p[2] - SKULL_C[2])).map((p) => add(SKULL_C, sub(p, SKULL_C), HAIR[look.hair].volume)).map(toK);
  const pieces = el("g", {}, headBack);
  const ponytail = look.hair === "ponytail" ? segment(pieces, [[0, 1.3 * k], [0.25, 1.9 * k], [0.8, 1.2 * k], [1, 0.4 * k]], [[0, 1.3 * k], [0.3, 1.8 * k], [0.8, 1.1 * k], [1, 0.4 * k]]) : null;
  const bun = look.hair === "bun" ? hullShape(pieces) : null;
  const pieceLines = strokes(pieces, LINE * 0.6);
  const hairRing = Array.from({ length: 48 }, (_, i) => {
    const ph = 2 * Math.PI * i / 48, x = Math.sin(ph), z = Math.cos(ph);
    const y = hairline(x, z);
    const ry = Math.max(-0.95, Math.min(0.95, (y - SKULL_C[1]) / SKULL_R[1])), s = Math.sqrt(1 - ry * ry);
    return [SKULL_C[0] + SKULL_R[0] * s * x * 1.02 * k, y * k, (SKULL_C[2] + SKULL_R[2] * s * z * 1.02) * k];
  });
  return {
    g: root,
    arms: { L: groups.armL, R: groups.armR },
    draw(s) {
      const j = s.joints;
      seat(sweep(s, seatRings));
      const across = (a, b, u, halfWidth) => {
        const c2 = P2(add(a, sub(b, a), u)), d2 = sub2(P2(b), P2(a)), l = Math.hypot(d2[0], d2[1]) || 1, n2 = [d2[1] / l, -d2[0] / l];
        return [[c2[0] + n2[0] * halfWidth, c2[1] + n2[1] * halfWidth], [c2[0] - n2[0] * halfWidth, c2[1] - n2[1] * halfWidth]];
      };
      if (shorts) {
        const tubeOrder = [...SIDES].sort((a, b) => depth(j[`hip${a}`]) - depth(j[`hip${b}`]));
        for (const sd of tubeOrder) {
          shortsTube[sd].draw(P2(j[`hip${sd}`]), P2(j[`knee${sd}`]));
          tubes.appendChild(shortsTube[sd].g);
        }
        shortsLines(SIDES.map((sd) => across(j[`hip${sd}`], j[`knee${sd}`], 0.56, 4.4 * kThigh)));
      } else shortsLines([]);
      skin?.(sweep(s, skinRings));
      shirt(sweepHem(s, shirtRings));
      const neckRing = ringPoints(s, { ...shirtRings[shirtRings.length - 1], hx: W.neck * 1.15, hz: W.neck * 1.1 }, 32);
      const folds = [
        [[0.55, 0.25, 0.92], [0.78, 0.45, 0.9]],
        [[0.62, -0.1, 0.95], [0.85, 0.05, 0.92]],
        [[-0.8, 0.15, 0.6], [-0.6, 0.35, 0.8]]
      ].map(([a, b]) => [a, b].map((u) => local(s, s.frames.lumbar, s.joints.pelvis, [u[0] * W.pelvis * 0.9, B.lumbar * (0.5 + u[1] * 0.6), u[2] * W.waist])));
      const foldRuns = folds.filter((f2) => facing(sub(mid2(f2[0], f2[1]), local(s, s.frames.lumbar, s.joints.pelvis, [0, B.lumbar * 0.5, 0]))) > 0.35).map((f2) => f2.map(P2));
      const extra = [];
      const frontFacing = facing(apply(s.frames.thoracic, [0, 0, 1])) > 0.3;
      if (look.top === "cardigan" && frontFacing) {
        for (const x of [-0.55, 0.55]) {
          extra.push([0.12, 0.45, 0.8, 1].map((u) => P2(local(s, s.frames.lumbar, j.pelvis, [x * k, 1 * k + u * (B.lumbar + B.neckBaseOffset[1] - 2) * 1, (W.waist + W.bust * u) * 1.02]))));
        }
        for (const u of [0.3, 0.55, 0.8]) {
          const b = P2(local(s, s.frames.lumbar, j.pelvis, [0.9 * k, 1 * k + u * (B.lumbar + B.neckBaseOffset[1] - 2), (W.waist + W.bust * u) * 1.03]));
          extra.push([[b[0] - 0.35, b[1]], [b[0], b[1] - 0.35], [b[0] + 0.35, b[1]], [b[0], b[1] + 0.35], [b[0] - 0.35, b[1]]]);
        }
      }
      if (look.top === "sweater" || look.top === "cardigan") {
        const band = ringPoints(s, { ...shirtRings[0], y: shirtRings[0].y + 1.6 * k }, 32);
        extra.push(...visibleRuns(band.pts, band.normals, 0.15));
      }
      if (look.top === "tank") {
        const scoop = ringPoints(s, { frame: "thoracic", y: B.neckBaseOffset[1] - 3.2 * k, hx: W.neck * 2.6, hz: W.chest * 0.75, z: 0.4 * k }, 32);
        extra.push(...visibleRuns(scoop.pts, scoop.normals, 0.35));
      }
      shirtLines([...visibleRuns(neckRing.pts, neckRing.normals, 0.1), ...foldRuns, ...extra]);
      for (const sd of SIDES) {
        const L = leg[sd], hip = j[`hip${sd}`], kn = j[`knee${sd}`], an = j[`ankle${sd}`];
        const top = shorts ? add(hip, sub(kn, hip), SHORTS_HEM) : hip;
        L.knee(P2(kn));
        L.shin.draw(P2(kn), P2(shorts ? an : add(an, sub(kn, an), -0.04)));
        L.thigh.draw(P2(top), P2(kn));
        const Rf = s.frames[`foot${sd}`], Rtoe = s.frames[`toe${sd}`], aH = B.ankleHeight / k, m = sd === "L" ? 1 : -1;
        const zb = B.ballForward / k, bent = Rtoe !== Rf, ball = j[`ball${sd}`];
        const S = (x, y, z) => bent && z > zb ? add(ball, apply(Rtoe, [x * m * k, (y + aH) * k, (z - zb) * k])) : local(s, Rf, an, [x * m * k, y * k, z * k]);
        const shoePts = [];
        for (const x of [-1, 1]) {
          shoePts.push(
            S(1.6 * x, -aH, -4.2),
            S(2 * x, -aH, 0),
            S(2.2 * x, -aH, 4),
            S(1.9 * x, -aH, 8.6),
            S(1.2 * x, -aH, 10.6),
            S(1.6 * x, -aH + 2.4, 9),
            S(1.9 * x, -aH + 4.4, 3.5),
            S(2.1 * x, 0.6, -0.4),
            S(1.5 * x, 0.3, -3.8)
          );
        }
        shoePts.push(S(0, -aH, 11.2), S(0, -aH + 2.9, 8.5), S(0, -aH + 4.9, 3.5), S(0, 0.9, -2), S(0, -aH + 0.4, -4.5));
        L.shoe(shoePts.map(P2));
        const solePerim = [[0, -4.4], [1.7, -3.6], [2, 0], [2.2, 4], [1.9, 8.6], [1.1, 10.6], [0, 11.1], [-1.1, 10.6], [-1.9, 8.6], [-2.2, 4], [-2, 0], [-1.7, -3.6]];
        const sole = solePerim.map(([x, z]) => S(x, -aH + 1.3, z));
        const soleN = solePerim.map(([x, z]) => apply(bent && z > zb ? Rtoe : Rf, [x * m, 0, z - 3.5]));
        const crease = bent && facing(apply(Rf, [0, 1, 0.3])) > 0.05 ? [[-1.9, -aH + 2.1], [0, -aH + 2.7], [1.9, -aH + 2.1]].map(([x, y]) => P2(S(x, y, zb))) : null;
        const laces = [3.2, 4.8, 6.4].map((z) => [S(-0.8, -aH + 4.6 - (z - 3) * 0.35, z), S(0.8, -aH + 4.6 - (z - 3) * 0.35, z + 0.4)].map(P2));
        L.shoeLines([...visibleRuns(sole, soleN, 0.05), ...laces, ...crease ? [crease] : []]);
      }
      for (const sd of SIDES) {
        const A = arm[sd], g = groups[`arm${sd}`];
        const sh = j[`shoulder${sd}`], e = j[`elbow${sd}`], w = j[`wrist${sd}`], h = j[`hand${sd}`];
        A.elbowCap(P2(e));
        A.fore.draw(P2(e), P2(w));
        A.upper.draw(P2(add(sh, sub(e, sh), upperFrom)), P2(e));
        A.sleeve?.draw(P2(sh), P2(e));
        const w2 = P2(w), h2 = P2(h), dh = sub2(h2, w2), hl = Math.max(Math.hypot(dh[0], dh[1]), 0.25 * B.hand);
        const d = Math.hypot(dh[0], dh[1]) > 1e-6 ? [dh[0] / Math.hypot(dh[0], dh[1]), dh[1] / Math.hypot(dh[0], dh[1])] : [0, 1];
        const nn = [d[1], -d[0]], sx = hl / B.hand, kw = kFore * k;
        const thumb = sub2(P2(add(w, apply(s.frames[`hand${sd}`], [sd === "L" ? 1 : -1, 0, 0]))), w2);
        const across2 = dot2(thumb, nn), flip = across2 > 0 ? -1 : 1, wk = 0.55 + 0.45 * Math.min(1, Math.abs(across2));
        const H = (x, o) => [w2[0] + d[0] * (x - 0.4) * sx * k + nn[0] * o * flip * wk * kw, w2[1] + d[1] * (x - 0.4) * sx * k + nn[1] * o * flip * wk * kw];
        A.hand([H(0, 1.4), H(2.6, 1.7), H(5, 1.3), H(7.2, 0.7), H(7.9, 0), H(7.3, -0.7), H(6.4, -0.9), H(5.6, -1.6), H(4.6, -2.1), H(2.6, -1.8), H(0.4, -1.5)]);
        A.fingers(wk > 0.75 ? [[H(5, 0.2), H(7.4, 0)], [H(2.4, -1), H(3.8, -0.9), H(5.2, -0.9)]] : []);
        const foreFirst = depth(mid2(e, w)) <= depth(mid2(sh, e));
        const sleeveG = A.sleeve ? [A.sleeve.g] : [];
        const order2 = foreFirst ? [A.elbow, A.fore.g, A.handG, A.upper.g, ...sleeveG] : [A.elbow, A.upper.g, ...sleeveG, A.fore.g, A.handG];
        for (const node of order2) g.appendChild(node);
      }
      const Rh = s.frames.head, c = j.headC;
      neck.draw(P2(add(j.neckBase, apply(s.frames.thoracic, [0, 0.6 * k, 0]))), P2(local(s, Rh, c, [0, -3.4 * k, -1.2 * k])));
      const faceOutline = sweepCapped(headSections.map((sec2) => sec2.map((p) => P2(local(s, Rh, c, p)))), humanHeadAxis(k));
      head(faceOutline);
      const hairPts = hairRing.map((p) => local(s, Rh, c, p));
      const hairN = hairRing.map((p) => apply(Rh, [p[0], 0, p[2] - SKULL_C[2] * k]));
      const strand = (a, b, n) => facing(apply(Rh, n)) > 0.15 ? [P2(local(s, Rh, c, a)), P2(local(s, Rh, c, b))] : null;
      const strands = [
        strand([1.5 * k, 5.6 * k, 2.4 * k], [-1.4 * k, 6.1 * k, -0.6 * k], [0, 1, 0.4]),
        strand([-3.8 * k, 3.4 * k, 0.6 * k], [-4.3 * k, 1.2 * k, -2 * k], [-1, 0.2, 0]),
        strand([3.8 * k, 3.4 * k, 0.6 * k], [4.3 * k, 1.2 * k, -2 * k], [1, 0.2, 0])
      ].filter((x) => x !== null);
      const runs = visibleRuns(hairPts, hairN, 0);
      const run = runs.sort((a, b) => b.length - a.length)[0];
      if (run && run.length > 2) {
        const vol = hull(hairVol.map((p) => P2(local(s, Rh, c, p))));
        const chin = P2(local(s, Rh, c, [0, -5.3 * k, 3.3 * k]));
        const nearest = (q) => vol.reduce((bi, p, i) => Math.hypot(p[0] - q[0], p[1] - q[1]) < Math.hypot(vol[bi][0] - q[0], vol[bi][1] - q[1]) ? i : bi, 0);
        const iA = nearest(run[0]), iB = nearest(run[run.length - 1]), n = vol.length;
        const walk = (step) => {
          const out = [];
          for (let i = iB; ; i = (i + step + n) % n) {
            out.push(vol[i]);
            if (i === iA || out.length > n) break;
          }
          return out;
        };
        const away = (arc) => arc.reduce((acc, p) => acc + Math.hypot(p[0] - chin[0], p[1] - chin[1]), 0) / arc.length;
        const a1 = walk(1), a2 = walk(-1);
        hair([...run, ...away(a1) > away(a2) ? a1 : a2]);
      } else hair([]);
      hairLines(strands);
      let pieceAnchor = null;
      const pl = [];
      if (ponytail) {
        const tie = local(s, Rh, c, toK([0, 2.4, -5]));
        const back = apply(Rh, [0, 0, -1]);
        const end = add(add(tie, [0, -10 * k, 0]), back, 1.6 * k);
        ponytail.draw(P2(tie), P2(end));
        pl.push([P2(add(tie, apply(Rh, [-1.2 * k, 0, 0]))), P2(add(tie, apply(Rh, [1.2 * k, 0, 0])))]);
        pieceAnchor = tie;
      }
      if (bun) {
        const bc = [0, 3.6, -4.4];
        const samples = Array.from({ length: 40 }, (_, i) => {
          const t = i / 40 * Math.PI * 2, u = Math.acos(1 - 2 * (i * 7 % 40 + 0.5) / 40);
          return local(s, Rh, c, toK([bc[0] + 2.3 * Math.sin(u) * Math.cos(t), bc[1] + 2 * Math.cos(u), bc[2] + 2.3 * Math.sin(u) * Math.sin(t) - 0.6]));
        });
        bun(samples.map(P2));
        pl.push([0.5, 0.75, 1].map((r) => P2(local(s, Rh, c, toK([bc[0] + r * 0.8, bc[1] + r * 0.6, bc[2] - 1.9])))));
        pieceAnchor = local(s, Rh, c, toK(bc));
      }
      pieceLines(pl);
      if (pieceAnchor) (depth(pieceAnchor) <= depth(c) ? headBack : headFront).appendChild(pieces);
      const feature = (p, n, a, b, bend = [0, 0, 0]) => facing(apply(Rh, n)) > 0.25 ? [P2(local(s, Rh, c, add(p, a))), P2(local(s, Rh, c, add(add(p, bend), [0, 0, 0]))), P2(local(s, Rh, c, add(p, b)))] : null;
      const sc = (v) => [v[0] * k, v[1] * k, v[2] * k];
      const face = [
        feature(sc([1.7, 0.9, 4.15]), [0.3, 0, 0.95], sc([-0.55, 0, 0]), sc([0.55, 0, 0]), sc([0, 0.12, 0.1])),
        feature(sc([-1.7, 0.9, 4.15]), [-0.3, 0, 0.95], sc([-0.55, 0, 0]), sc([0.55, 0, 0]), sc([0, 0.12, 0.1])),
        feature(sc([0, -3, 4.35]), [0, -0.2, 1], sc([-0.6, 0, 0]), sc([0.6, 0, 0]), sc([0, -0.08, 0.05])),
        facing(apply(Rh, [0, 0, 1])) > 0.7 ? [P2(local(s, Rh, c, sc([0, 0.3, 4.95]))), P2(local(s, Rh, c, sc([0.25, -1, 5.6])))] : null,
        // ears: a C-curve on whichever side faces the camera
        ...[1, -1].map((m) => facing(apply(Rh, [m, 0, 0])) > 0.3 ? [[0.3, 1.3, 0.2], [0.2, 1.4, -1], [0.1, 0, -1.5], [0.2, -1.3, -0.9], [0.3, -1.5, 0.2]].map(([x, y, z]) => P2(local(s, Rh, c, sc([m * (4.2 + x), y - 0.4, z - 0.3])))) : null)
      ].filter((x) => x !== null);
      faceLines(face);
      if (look.glasses) {
        const lens = (m) => {
          const cc = [m * 1.7, 0.9, 4.45], n = [m * 0.3, 0, 0.95];
          if (facing(apply(Rh, n)) < -0.2) return null;
          return Array.from({ length: 17 }, (_, i) => {
            const t = 2 * Math.PI * i / 16;
            return P2(local(s, Rh, c, sc([cc[0] + 1.35 * Math.cos(t), cc[1] + 1.1 * Math.sin(t), cc[2] - m * 0.3 * Math.cos(t)])));
          });
        };
        const temple = (m) => facing(apply(Rh, [m, 0, 0])) > 0.2 ? [P2(local(s, Rh, c, sc([m * 3.05, 1.1, 4]))), P2(local(s, Rh, c, sc([m * 4.4, 0.9, 0.2])))] : null;
        glasses([lens(1), lens(-1), facing(apply(Rh, [0, 0, 1])) > 0.2 ? [P2(local(s, Rh, c, sc([0.35, 1.2, 4.75]))), P2(local(s, Rh, c, sc([-0.35, 1.2, 4.75])))] : null, temple(1), temple(-1)].filter((x) => x !== null));
      } else glasses([]);
      const order = [
        [groups.torso, depth(mid2(j.pelvis, j.chestBase))],
        [groups.head, depth(c) + 0.5],
        // legs +3: a trouser or bare leg sits over the seat/waistband block unless clearly behind the body
        // (the far leg in the side view is 4.6 back); +1 let the slightly-turned front camera tuck a leg behind it
        ...SIDES.map((sd) => [groups[`leg${sd}`], depth(mid2(j[`knee${sd}`], j[`ankle${sd}`])) + 3]),
        ...SIDES.map((sd) => [groups[`arm${sd}`], depth(mid2(j[`elbow${sd}`], j[`wrist${sd}`])) + 1])
      ];
      order.sort((a, b) => a[1] - b[1]);
      for (const [node] of order) root.appendChild(node);
    }
  };
}
const VIEWBOX = { x: -34, y: -6, w: 148, h: 132 };
function createFigureCard(host, body, view, opts = {}) {
  const svg = el("svg", { viewBox: `${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`, role: "img", "aria-label": `${body.character.label}, ${view} view` });
  svg.style.color = "#111111";
  svg.style.setProperty("--paper", "#ffffff");
  const filter = opts.inkWobble === false ? null : inkDefs(svg, opts.id ?? `ink-${view}-${body.character.id}`).filter;
  host.appendChild(svg);
  const scene = el("g", filter ? { filter } : {}, svg);
  const chair = createChair(scene, body, view);
  const heldInFront = towardCamera(view)[2] > 0.3, heldOffset = chairBackProp(body.rig).offset;
  const heldBehind = heldInFront ? null : createChair(scene, body, view, heldOffset);
  const figure = createFigure3D(scene, body, view);
  const held = heldBehind ?? createChair(scene, body, view, heldOffset);
  const over = el("g", {}, scene);
  let chairOn = false;
  chair.g.style.display = "none";
  held.g.style.display = "none";
  return {
    svg,
    draw(s) {
      if (chairOn) chair.draw();
      figure.draw(s);
      held.g.style.display = s.prop ? "" : "none";
      if (!s.prop) return;
      held.draw();
      if (heldInFront) {
        for (const sd of ["L", "R"]) if ((s.pose[`hand${sd}.hold`] ?? 0) >= 0.5) over.appendChild(figure.arms[sd]);
      }
    },
    setChair(on) {
      chairOn = on;
      chair.g.style.display = on ? "" : "none";
    }
  };
}
function stanceFor(body, preset) {
  const r = body.rig, k = body.height / 95, shoulder = 2 * r.shoulderOffset[0];
  switch (preset) {
    // shoe edges meet, not the ankles; parallel, because toe-out swings the heels inward into each other
    case "together":
      return { width: 2 * (r.footHalfWidth + 0.25 * k), toeOut: 0 };
    case "natural":
    case "hip":
      return { width: 2 * r.hipHalfWidth, toeOut: 0 };
    case "shoulder":
      return { width: shoulder, toeOut: 10 };
    case "wide":
      return { width: 1.5 * shoulder, toeOut: 18 };
    case "extra-wide":
      return { width: 2 * shoulder, toeOut: 20 };
  }
}
function stanceTargets(body, preset) {
  const s = stanceFor(body, preset);
  return s.toeOut ? { "stance.width": s.width, "footL.yaw": s.toeOut, "footR.yaw": s.toeOut } : { "stance.width": s.width };
}
const KEYS = [
  [0, { shin: 2, thigh: -1, trunk: 1, head: 0, arm: 88, elbow: 4 }],
  [0.33, { shin: 16, thigh: 30, trunk: 24, head: 8, arm: 88, elbow: 4 }],
  [0.66, { shin: 29, thigh: 62, trunk: 40, head: 15, arm: 86, elbow: 4 }],
  [1, { shin: 34, thigh: 90, trunk: 44, head: 20, arm: 84, elbow: 4 }]
];
KEYS[KEYS.length - 1][1];
function splitTrunkLean(lean, tiltLimit = 25) {
  const tilt = Math.max(-tiltLimit, Math.min(tiltLimit, lean));
  return { "pelvis.tilt": tilt, "lumbar.flex": lean - tilt };
}
function pelvisFromLegAngles(shinDeg, thighDeg, body = DEFAULT_BODY) {
  const r = Math.PI / 180;
  const kneeZ = body.shank * Math.sin(shinDeg * r), kneeY = body.ankleHeight + body.shank * Math.cos(shinDeg * r);
  const hipZ = kneeZ - body.thigh * Math.sin(thighDeg * r), hipY = kneeY + body.thigh * Math.cos(thighDeg * r);
  return { "pelvis.y": hipY - (body.ankleHeight + body.shank + body.thigh), "pelvis.z": hipZ };
}
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
function centreOfMass(s) {
  const j = s.joints;
  const parts = [[0.081, j.headC], [0.497, mid(j.pelvis, j.neckBase)]];
  for (const sd of ["L", "R"]) {
    parts.push(
      [0.028, mid(j[`shoulder${sd}`], j[`elbow${sd}`])],
      [0.016, mid(j[`elbow${sd}`], j[`wrist${sd}`])],
      [6e-3, mid(j[`wrist${sd}`], j[`hand${sd}`])],
      [0.1, mid(j[`hip${sd}`], j[`knee${sd}`])],
      [0.0465, mid(j[`knee${sd}`], j[`ankle${sd}`])],
      [0.0145, mid(j[`ankle${sd}`], j[`toe${sd}`])]
    );
  }
  const total = parts.reduce((a, [m]) => a + m, 0);
  return parts.reduce((acc, [m, p]) => [acc[0] + m * p[0] / total, acc[1] + m * p[1] / total, acc[2] + m * p[2] / total], [0, 0, 0]);
}
const CONTACT = 0.6;
function supportPolygon(s) {
  const stance = s.stance ?? "R", other = stance === "L" ? "R" : "L";
  const resting = Math.max(s.joints[`heel${other}`][1], s.joints[`toe${other}`][1]) < CONTACT;
  const feet = s.support === "single-leg" ? resting ? [stance, other] : [stance] : ["L", "R"];
  const pts = [];
  for (const sd of feet) {
    const h = s.joints[`heel${sd}`], t = s.joints[`toe${sd}`];
    for (const dx of [-2, 2]) pts.push([h[0] + dx, h[2]], [t[0] + dx, t[2]]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross2 = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of pts) {
    while (lo.length >= 2 && cross2(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (const p of [...pts].reverse()) {
    while (hi.length >= 2 && cross2(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop();
    hi.push(p);
  }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
function insideDistance(poly, p) {
  let min = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const ex = b[0] - a[0], ez = b[1] - a[1], l = Math.hypot(ex, ez) || 1;
    min = Math.min(min, (ex * (p[1] - a[1]) - ez * (p[0] - a[0])) / l);
  }
  return min;
}
function balance(pose, body, support, margin = 0.5) {
  const out = { ...pose };
  let shiftX = 0, shiftZ = 0;
  for (let i = 0; i < 6; i++) {
    const s = solveSkeleton(out, body.rig, support, body.rom);
    const com = centreOfMass(s), poly = supportPolygon(s);
    const d = insideDistance(poly, [com[0], com[2]]);
    if (d >= margin) break;
    const cx = poly.reduce((a, p) => a + p[0], 0) / poly.length, cz = poly.reduce((a, p) => a + p[1], 0) / poly.length;
    const vx = cx - com[0], vz = cz - com[2], l = Math.hypot(vx, vz) || 1, step = margin - d + 0.2;
    shiftX = Math.max(-6, Math.min(6, shiftX + vx / l * step));
    shiftZ = Math.max(-6, Math.min(6, shiftZ + vz / l * step));
    out["pelvis.x"] = (pose["pelvis.x"] ?? 0) + shiftX;
    out["pelvis.z"] = (pose["pelvis.z"] ?? 0) + shiftZ;
  }
  return out;
}
const minJerk = (s) => s * s * s * (10 - 15 * s + 6 * s * s);
function monotoneSlopes(x, y, period) {
  const n = x.length;
  const X = [...x, x[0] + period], Y = [...y, y[0]];
  const h = X.slice(0, -1).map((v, i) => X[i + 1] - v);
  const d = h.map((hi, i) => (Y[i + 1] - Y[i]) / hi);
  return x.map((_, i) => {
    const ip = (i - 1 + n) % n, d0 = d[ip], d1 = d[i], h0 = h[ip], h1 = h[i];
    if (d0 === 0 || d1 === 0 || Math.sign(d0) !== Math.sign(d1)) return 0;
    const w1 = 2 * h1 + h0, w2 = h1 + 2 * h0;
    return (w1 + w2) / (w1 / d0 + w2 / d1);
  });
}
function channelAt(beats, values, eases, period, b) {
  const n = beats.length;
  if (n === 1) return values[0];
  b = (b % period + period) % period;
  const beforeFirst = b < beats[0];
  let i = n - 1;
  if (!beforeFirst) {
    for (let j = 0; j < n; j++) if (beats[j] <= b) i = j;
  }
  const i1 = (i + 1) % n;
  const x0 = beats[i] - (beforeFirst ? period : 0);
  const x1 = beats[i1] + (i1 === 0 && !beforeFirst ? period : 0);
  const y0 = values[i], y1 = values[i1], span = x1 - x0, u = span > 0 ? (b - x0) / span : 0;
  switch (eases[i1] ?? "smooth") {
    case "hold":
      return y0;
    case "linear":
      return y0 + (y1 - y0) * u;
    case "minJerk":
      return y0 + (y1 - y0) * minJerk(u);
    default: {
      const m = monotoneSlopes(beats, values, period), u2 = u * u, u3 = u2 * u;
      return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * span * m[i] + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * span * m[i1];
    }
  }
}
const cycleSeconds = (ex, body) => ex.cycleBeats / (ex.tempoBpm / 60 * body.pace);
const variantOf = (ex, key) => ex.variants[key] ?? ex.variants.standing;
const CHANNEL_RANGE = {
  "trunk.lean": (b) => [-40 * (b.rom.spine ?? 1), 65 * (b.rom.spine ?? 1)],
  "spine.lat": (b) => [-35 * (b.rom.spine ?? 1), 35 * (b.rom.spine ?? 1)],
  "spine.twist": (b) => [-45 * (b.rom.spine ?? 1), 45 * (b.rom.spine ?? 1)]
};
function resolve(key, t, body) {
  if (typeof t === "number") return t;
  const range = key in LIMITS ? limitFor(key, body.rom) : CHANNEL_RANGE[key]?.(body);
  if (!range) throw new Error(`ROM-relative target given for "${key}", which has no range; use degrees.`);
  return t.rom >= 0 ? t.rom * range[1] : -t.rom * range[0];
}
const resolveAll = (p, body) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, resolve(k, v, body)]));
function table(v, body) {
  const rest = resolveAll(v.stance ? { ...stanceTargets(body, v.stance), ...v.rest } : v.rest, body);
  const keys = [...v.keyframes].sort((a, b) => a.beat - b.beat);
  if (!keys.length || keys[0].beat > 0) keys.unshift({ beat: 0, pose: {} });
  const snaps = [];
  let cur = { ...rest };
  for (const kf of keys) {
    cur = { ...cur, ...resolveAll(kf.pose, body) };
    snaps.push(cur);
  }
  const names = new Set(snaps.flatMap((s) => Object.keys(s)));
  const channels = {};
  for (const n of names) channels[n] = snaps.map((s) => s[n] ?? rest[n] ?? 0);
  return { beats: keys.map((k) => k.beat), eases: keys.map((k) => k.ease), channels, rest };
}
const NEGATE_ON_MIRROR = /* @__PURE__ */ new Set(["stance.side", "pelvis.obliquity", "pelvis.yaw", "pelvis.x", "lumbar.lat", "lumbar.twist", "thoracic.lat", "thoracic.twist", "neck.lat", "neck.rot", "spine.lat", "spine.twist"]);
function mirror(v) {
  const out = {};
  for (const [k, x] of Object.entries(v)) {
    const m = /^(\w+?)([LR])\.(\w+)$/.exec(k);
    if (m) out[`${m[1]}${m[2] === "L" ? "R" : "L"}.${m[3]}`] = x;
    else out[k] = NEGATE_ON_MIRROR.has(k) ? -x : x;
  }
  return out;
}
function toPose(values, v, body) {
  const { "trunk.lean": lean, "spine.lat": lat, "spine.twist": twist, "leg.shin": shin, "leg.thigh": thigh, ...rest } = values;
  const pose = { ...rest };
  const addTo = (k, x) => {
    pose[k] = (pose[k] ?? 0) + x;
  };
  if (lean !== void 0) for (const [k, x] of Object.entries(splitTrunkLean(lean, 25 * (body.rom.pelvis ?? 1)))) addTo(k, x);
  if (lat !== void 0) {
    addTo("lumbar.lat", 0.55 * lat);
    addTo("thoracic.lat", 0.45 * lat);
  }
  if (twist !== void 0) {
    addTo("lumbar.twist", 0.2 * twist);
    addTo("thoracic.twist", 0.8 * twist);
  }
  if (v.support !== "chair" && (shin !== void 0 || thigh !== void 0)) Object.assign(pose, pelvisFromLegAngles(shin ?? 0, thigh ?? 0, body.rig));
  for (const [k, x] of Object.entries(body.posture)) addTo(k, x);
  return pose;
}
function finish(pose, v, body) {
  return v.support === "chair" ? pose : balance(pose, body, v.support);
}
function poseAt(ex, key, body, t, opts = {}) {
  const v = variantOf(ex, key), tb = table(v, body), cyc = cycleSeconds(ex, body);
  if (opts.durationSeconds !== void 0) {
    const whole = Math.floor(opts.durationSeconds / cyc + 1e-9);
    if (whole === 0 || t >= whole * cyc) return finish(toPose(tb.rest, v, body), v, body);
  }
  const cycle = Math.floor(t / cyc), beat = (t - cycle * cyc) / cyc * ex.cycleBeats;
  let values = {};
  for (const [name, vals] of Object.entries(tb.channels)) values[name] = channelAt(tb.beats, vals, tb.eases, ex.cycleBeats, beat);
  if (ex.mirror && cycle % 2 === 1) values = mirror(values);
  return finish(toPose(values, v, body), v, body);
}
function staticPose(ex, key, body) {
  const v = variantOf(ex, key);
  const beat = v.staticBeat ?? [...v.keyframes].sort((a, b) => a.beat - b.beat).find((k) => Object.keys(k.pose).length > 0)?.beat ?? 0;
  return poseAt(ex, key, body, beat / ex.cycleBeats * cycleSeconds(ex, body));
}
function createExercisePlayer$1(host, o) {
  const variant = o.variant ?? "standing";
  const support = (o.exercise.variants[variant] ?? o.exercise.variants.standing).support;
  const cards = (o.views ?? ["front", "side"]).map((view) => {
    const cell = document.createElement("div");
    cell.className = `exercise-card exercise-card--${view}`;
    host.appendChild(cell);
    const card = createFigureCard(cell, o.body, view, { inkWobble: o.inkWobble, id: o.idPrefix ? `${o.idPrefix}-${view}` : void 0 });
    card.setChair(support === "chair");
    return card;
  });
  let time = 0, playing = false, speed = 1, duration = o.durationSeconds, raf = 0, last = 0, destroyed = false;
  const cyc = cycleSeconds(o.exercise, o.body);
  const draw = (pose = poseAt(o.exercise, variant, o.body, time, { durationSeconds: duration })) => {
    const s = solveSkeleton(pose, o.body.rig, support, o.body.rom);
    for (const c of cards) c.draw(s);
    o.onFrame?.(time, s);
  };
  const tick = (now) => {
    if (!playing || destroyed) return;
    const dt = Math.min(0.05, (now - last) / 1e3);
    last = now;
    time += dt * speed;
    if (duration === void 0) time %= cyc * 2;
    else time = Math.min(time, duration);
    draw();
    if (duration !== void 0 && time >= duration) {
      playing = false;
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  draw();
  return {
    get time() {
      return time;
    },
    get playing() {
      return playing;
    },
    cycleSeconds: cyc,
    play() {
      if (playing || destroyed) return;
      playing = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    },
    pause() {
      playing = false;
      cancelAnimationFrame(raf);
    },
    seek(t) {
      time = Math.max(0, t);
      draw();
    },
    setSpeed(s) {
      speed = s;
    },
    setDuration(sec2) {
      duration = sec2;
      draw();
    },
    showStaticPose() {
      this.pause();
      draw(staticPose(o.exercise, variant, o.body));
    },
    destroy() {
      destroyed = true;
      this.pause();
      host.replaceChildren();
    }
  };
}
const RUNTIME_VERSION$1 = "0.1.0-draft.2";
const PACK_FORMAT_VERSION$1 = 1;
const POSE_KEYS = [
  ...Object.keys(LIMITS),
  "pelvis.x",
  "pelvis.y",
  "pelvis.z",
  "stance.width",
  "footL.x",
  "footL.z",
  "footR.x",
  "footR.z",
  "stance.side",
  "prop.chair",
  "handL.hold",
  "handR.hold",
  "trunk.lean",
  "spine.lat",
  "spine.twist",
  "leg.shin",
  "leg.thigh"
];
const APPEARANCE_CATALOGUE$1 = {
  human: {
    hair: ["short", "ponytail", "receding", "bob", "bun", "thinning"],
    top: ["tshirt", "tank", "longsleeve", "cardigan", "sweater"],
    bottom: ["shorts", "leggings", "joggers", "pants", "slacks", "trousers"],
    shoes: ["sneakers"]
  },
  robot: { visor: ["band"] }
};
const SEMVER = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-.]+)?$/;
const isSemver = (v) => typeof v === "string" && SEMVER.test(v);
function compareSemver(a, b) {
  const pa = SEMVER.exec(a), pb = SEMVER.exec(b);
  if (!pa || !pb) throw new Error(`Not a semver version: ${pa ? b : a}`);
  for (let i = 1; i <= 3; i++) {
    const d = Number(pa[i]) - Number(pb[i]);
    if (d) return d < 0 ? -1 : 1;
  }
  if (!pa[4] && !pb[4]) return 0;
  if (!pa[4]) return 1;
  if (!pb[4]) return -1;
  const xa = pa[4].split("."), xb = pb[4].split(".");
  for (let i = 0; i < Math.max(xa.length, xb.length); i++) {
    if (xa[i] === void 0) return -1;
    if (xb[i] === void 0) return 1;
    const na = /^\d+$/.test(xa[i]), nb = /^\d+$/.test(xb[i]);
    if (na && nb) {
      const d = Number(xa[i]) - Number(xb[i]);
      if (d) return d < 0 ? -1 : 1;
    } else if (na !== nb) return na ? -1 : 1;
    else if (xa[i] !== xb[i]) return xa[i] < xb[i] ? -1 : 1;
  }
  return 0;
}
function exerciseFromPack(p) {
  return {
    id: p.id,
    ...p.livelongStepId !== void 0 ? { livelongStepId: p.livelongStepId } : {},
    title: p.title,
    tempoBpm: p.tempoBpm,
    cycleBeats: p.cycleBeats,
    mirror: p.mirror,
    variants: p.variants
  };
}
function characterFromPack(p) {
  const b = p.body;
  return {
    id: p.id,
    label: p.label,
    sex: b.sex,
    ageYears: b.ageYears,
    height: b.height,
    build: b.build,
    kyphosis: b.kyphosis,
    rom: { ...b.rom },
    pace: b.pace,
    chairByDefault: b.chairByDefault,
    appearance: { ...p.appearance }
  };
}
const RUNTIME_VERSION = RUNTIME_VERSION$1;
const PACK_FORMAT_VERSION = PACK_FORMAT_VERSION$1;
const APPEARANCE_CATALOGUE = APPEARANCE_CATALOGUE$1;
class ExerciseFiguresError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    __publicField(this, "code");
    __publicField(this, "details");
    this.name = "ExerciseFiguresError";
    this.code = code;
    this.details = details;
  }
}
const POSE_KEY_SET = new Set(POSE_KEYS);
const isObj = (x) => typeof x === "object" && x !== null && !Array.isArray(x);
const finite = (x) => typeof x === "number" && Number.isFinite(x);
function fail(code, message, details) {
  throw new ExerciseFiguresError(code, message, details);
}
function checkHeader(p, kind, where) {
  if (p.kind !== kind) fail("INVALID_PACK", `Expected a ${kind}, got kind ${JSON.stringify(p.kind)}`, where);
  if (p.formatVersion !== PACK_FORMAT_VERSION) fail("UNSUPPORTED_FORMAT", `${kind} formatVersion ${JSON.stringify(p.formatVersion)} is not supported (this runtime reads ${PACK_FORMAT_VERSION})`, where);
  for (const k of ["version", "minRuntimeVersion"]) if (!isSemver(p[k])) fail("INVALID_PACK", `${kind} ${k} must be a semver version`, { ...where, [k]: p[k] });
  if (compareSemver(p.minRuntimeVersion, RUNTIME_VERSION) > 0) {
    fail("RUNTIME_TOO_OLD", `${kind} needs runtime ${p.minRuntimeVersion} or newer; this is ${RUNTIME_VERSION}`, { ...where, minRuntimeVersion: p.minRuntimeVersion, runtimeVersion: RUNTIME_VERSION });
  }
}
function checkPose(pose, where) {
  if (!isObj(pose)) fail("INVALID_PACK", "A pose must be an object", where);
  for (const [k, v] of Object.entries(pose)) {
    if (!POSE_KEY_SET.has(k)) fail("UNKNOWN_POSE_KEY", `Unknown pose key "${k}"`, { ...where, key: k });
    if (!(finite(v) || isObj(v) && finite(v.rom) && Object.keys(v).length === 1)) fail("INVALID_PACK", `Pose key "${k}" must be a number or {rom: number}`, { ...where, key: k, value: v });
  }
}
function checkExercisePack(value) {
  if (!isObj(value)) fail("INVALID_PACK", "An exercise pack must be an object", {});
  const where = { pack: value.id };
  checkHeader(value, "exercise-pack", where);
  if (typeof value.id !== "string" || !/^[a-z0-9]+(-[a-z0-9]+)*\.[a-z0-9]+(-[a-z0-9]+)*$/.test(value.id)) fail("INVALID_PACK", 'Exercise pack id must be "<series>.<step>"', where);
  if (!finite(value.tempoBpm) || value.tempoBpm <= 0 || !finite(value.cycleBeats) || value.cycleBeats <= 0) fail("INVALID_PACK", "tempoBpm and cycleBeats must be positive numbers", where);
  if (typeof value.mirror !== "boolean") fail("INVALID_PACK", "mirror must be a boolean", where);
  if (!Array.isArray(value.views) || !value.views.length || value.views.some((v) => v !== "front" && v !== "side")) fail("INVALID_PACK", 'views must list "front" and/or "side"', where);
  const variants = value.variants;
  if (!isObj(variants) || !isObj(variants.standing)) fail("INVALID_PACK", "variants.standing is required", where);
  for (const [name, v] of Object.entries(variants)) {
    const at = { ...where, variant: name };
    if (name !== "standing" && name !== "chair") fail("INVALID_PACK", `Unknown variant "${name}"`, at);
    if (!isObj(v) || !["standing", "single-leg", "chair"].includes(v.support)) fail("INVALID_PACK", "variant.support must be standing, single-leg or chair", at);
    checkPose(v.rest, { ...at, field: "rest" });
    if (!Array.isArray(v.keyframes)) fail("INVALID_PACK", "variant.keyframes must be an array", at);
    v.keyframes.forEach((kf, i) => {
      if (!isObj(kf) || !finite(kf.beat) || kf.beat < 0) fail("INVALID_PACK", "keyframe.beat must be a number >= 0", { ...at, keyframe: i });
      if (kf.ease !== void 0 && !["smooth", "minJerk", "linear", "hold"].includes(kf.ease)) fail("INVALID_PACK", `Unknown ease ${JSON.stringify(kf.ease)}`, { ...at, keyframe: i });
      checkPose(kf.pose, { ...at, keyframe: i });
    });
  }
  return value;
}
function checkCharacterPack(value) {
  if (!isObj(value)) fail("INVALID_PACK", "A character pack must be an object", {});
  const where = { pack: value.id };
  checkHeader(value, "character-pack", where);
  const b = value.body, a = value.appearance;
  if (!isObj(b) || !finite(b.height) || b.height <= 0 || !finite(b.pace) || b.pace <= 0 || !finite(b.kyphosis) || !isObj(b.rom)) fail("INVALID_PACK", "body needs height, pace and kyphosis numbers and a rom object", where);
  if (!["male", "female", "none"].includes(b.sex) || !["athletic", "slim", "average", "heavier", "fuller"].includes(b.build)) fail("INVALID_PACK", "body.sex or body.build is not recognised", where);
  if (!isObj(a)) fail("INVALID_PACK", "appearance is required", where);
  const options = a.kind === "robot" ? APPEARANCE_CATALOGUE.robot : APPEARANCE_CATALOGUE.human;
  for (const [k, allowed] of Object.entries(options)) {
    if (!allowed.includes(a[k])) fail("UNSUPPORTED_APPEARANCE", `This runtime cannot draw ${k} ${JSON.stringify(a[k])}; it can draw ${allowed.join(", ")}`, { ...where, field: k, value: a[k] });
  }
  return value;
}
const prepare = (exercisePack, characterPack) => ({
  exercise: exerciseFromPack(checkExercisePack(exercisePack)),
  body: bodyFor(characterFromPack(checkCharacterPack(characterPack)))
});
function samplePose(exercisePack, characterPack, seconds, options = {}) {
  const { exercise, body } = prepare(exercisePack, characterPack);
  return poseAt(exercise, options.variant ?? "standing", body, seconds, { durationSeconds: options.durationSeconds });
}
function sampleStaticPose(exercisePack, characterPack, options = {}) {
  const { exercise, body } = prepare(exercisePack, characterPack);
  return staticPose(exercise, options.variant ?? "standing", body);
}
function cycleSecondsOf(exercisePack, characterPack) {
  const { exercise, body } = prepare(exercisePack, characterPack);
  return cycleSeconds(exercise, body);
}
let instances = 0;
const argument = (ok, message, details) => {
  if (!ok) fail("INVALID_ARGUMENT", message, details);
};
function createExercisePlayer(options) {
  const exPack = checkExercisePack(options.exercisePack), chPack = checkCharacterPack(options.characterPack);
  const exercise = exerciseFromPack(exPack), body = bodyFor(characterFromPack(chPack));
  const variant = options.variant === "chair" && exPack.variants.chair ? "chair" : "standing";
  const views = [...options.views ?? exPack.views];
  const ctx = { exercise: exPack.id, character: chPack.id };
  for (const v of views) argument(exPack.views.includes(v), `View "${v}" is not offered by ${exPack.id}`, { ...ctx, view: v });
  const checkDuration = (d) => argument(d === void 0 || finite(d) && d >= 0, "durationSeconds must be a number >= 0 or undefined", { ...ctx, durationSeconds: d });
  const checkSpeed = (s) => argument(finite(s) && s >= 0, "speed must be a finite number >= 0", { ...ctx, speed: s });
  checkDuration(options.durationSeconds);
  checkSpeed(options.speed ?? 1);
  const idPrefix = `xfig${++instances}`;
  let duration = options.durationSeconds, speed = options.speed ?? 1, time = 0;
  let wantPlay = false, still = false, destroyed = false;
  let container = null, inner = null;
  const unmount = () => {
    if (inner) {
      time = inner.time;
      inner.destroy();
    }
    container?.parentNode?.removeChild(container);
    inner = null;
    container = null;
  };
  return {
    get time() {
      return inner ? inner.time : time;
    },
    get playing() {
      return inner ? inner.playing : false;
    },
    cycleSeconds: cycleSeconds(exercise, body),
    variant,
    views,
    mount(el2) {
      if (destroyed) fail("DESTROYED", "This player was destroyed; create a new one", ctx);
      argument(!!el2 && typeof el2.appendChild === "function", "mount() needs a DOM element", ctx);
      const resume = inner ? inner.playing : wantPlay;
      unmount();
      container = document.createElement("div");
      container.className = "exercise-figures";
      container.setAttribute("data-exercise", exPack.id);
      container.setAttribute("data-character", chPack.id);
      el2.appendChild(container);
      inner = createExercisePlayer$1(container, { exercise, body, variant, views, durationSeconds: duration, inkWobble: options.inkWobble, idPrefix });
      inner.setSpeed(speed);
      inner.seek(time);
      if (still) inner.showStaticPose();
      else if (resume) inner.play();
    },
    play() {
      if (destroyed) return;
      still = false;
      wantPlay = true;
      inner?.play();
    },
    pause() {
      wantPlay = false;
      inner?.pause();
    },
    seek(seconds) {
      argument(finite(seconds), "seek() needs a finite number of seconds", { ...ctx, seconds });
      if (destroyed) return;
      time = Math.max(0, seconds);
      still = false;
      inner?.seek(time);
    },
    setDuration(stepSeconds) {
      checkDuration(stepSeconds);
      if (destroyed) return;
      duration = stepSeconds;
      inner?.setDuration(stepSeconds);
    },
    setSpeed(s) {
      checkSpeed(s);
      speed = s;
      inner?.setSpeed(s);
    },
    staticPose() {
      if (destroyed) return;
      still = true;
      wantPlay = false;
      inner?.showStaticPose();
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      wantPlay = false;
      unmount();
    }
  };
}
export {
  APPEARANCE_CATALOGUE,
  ExerciseFiguresError,
  PACK_FORMAT_VERSION,
  RUNTIME_VERSION,
  checkCharacterPack,
  checkExercisePack,
  createExercisePlayer,
  cycleSecondsOf,
  samplePose,
  sampleStaticPose
};
