// ===================== RAID BOSS PORTRAITS (splash art) =====================
// Global: drawRaidPortrait(c, id, W, H, t, opts) -> true if handled. Helpers are cosp_-prefixed.
// Everything is drawn in a virtual 640x360 space scaled to "cover" W x H. Static layers
// (skies, skylines, nebulae) are cached per id/size/pixel-ratio in offscreen canvases.
const cosp_IDS = { leviathan: 1, colossus: 1, solarion: 1, hydra: 1 };
const cosp_TAU = Math.PI*2;
const cosp_cache = new Map();
let cosp_scratch = null, cosp_dev = null, cosp_px = 1; // scratch canvas, device rect of the current portrait, device px per virtual unit

function cosp_hash(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function cosp_fr(v) { return v - Math.floor(v); }
function cosp_view(c, W, H) { const s = Math.max(W/640, H/360); c.translate((W - 640*s)/2, (H - 360*s)/2); c.scale(s, s); }

// Gradient cache (all gradients live in the fixed virtual space, so they can be reused forever per context).
function cosp_grad(c, key, mk) {
  const m = c.__cospGr || (c.__cospGr = new Map());
  let g = m.get(key);
  if (!g) { g = mk(c); m.set(key, g); }
  return g;
}
// Soft additive glow via a cached unit radial gradient. col = 'r,g,b'.
function cosp_glow(c, x, y, r, col, a) {
  if (!(r > 0) || !(a > 0.004)) return;
  const g = cosp_grad(c, 'glow' + col, k => {
    const q = k.createRadialGradient(0, 0, 0, 0, 0, 1);
    q.addColorStop(0, 'rgba(' + col + ',1)'); q.addColorStop(0.22, 'rgba(' + col + ',0.5)');
    q.addColorStop(0.55, 'rgba(' + col + ',0.14)'); q.addColorStop(1, 'rgba(' + col + ',0)'); return q;
  });
  const ga = c.globalAlpha, op = c.globalCompositeOperation, sw = op !== 'lighter';
  if (sw) c.globalCompositeOperation = 'lighter'; // only flip blend mode when needed (mode switches are costly)
  c.globalAlpha = ga*Math.min(1, a);
  c.save(); c.translate(x, y); c.scale(r, r); c.fillStyle = g; c.fillRect(-1, -1, 2, 2); c.restore();
  c.globalAlpha = ga; if (sw) c.globalCompositeOperation = op;
}
function cosp_lin(c, key, x0, y0, x1, y1, stops) {
  return cosp_grad(c, key, k => { const g = k.createLinearGradient(x0, y0, x1, y1); for (let i = 0; i < stops.length; i += 2) g.addColorStop(stops[i], stops[i + 1]); return g; });
}
function cosp_rad(c, key, x0, y0, r0, x1, y1, r1, stops) {
  return cosp_grad(c, key, k => { const g = k.createRadialGradient(x0, y0, r0, x1, y1, r1); for (let i = 0; i < stops.length; i += 2) g.addColorStop(stops[i], stops[i + 1]); return g; });
}
// Cubic bezier sampled to a flat point list.
function cosp_bez(x0, y0, x1, y1, x2, y2, x3, y3, n) {
  const P = [];
  for (let i = 0; i <= n; i++) {
    const u = i/n, m = 1 - u, b0 = m*m*m, b1 = 3*m*m*u, b2 = 3*m*u*u, b3 = u*u*u;
    P.push(b0*x0 + b1*x1 + b2*x2 + b3*x3, b0*y0 + b1*y1 + b2*y2 + b3*y3);
  }
  return P;
}
// Tapered tube path around a polyline; returns edge lists L, R (flat) and normals.
function cosp_tube(c, P, wf) {
  const n = P.length/2, L = [], R = [], N = [];
  for (let i = 0; i < n; i++) {
    const i0 = i > 0 ? i - 1 : 0, i1 = i < n - 1 ? i + 1 : n - 1;
    let dx = P[i1*2] - P[i0*2], dy = P[i1*2 + 1] - P[i0*2 + 1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = wf(n > 1 ? i/(n - 1) : 0)/2;
    L.push(P[i*2] + dy*w, P[i*2 + 1] - dx*w); R.push(P[i*2] - dy*w, P[i*2 + 1] + dx*w); N.push(dy, -dx);
  }
  c.beginPath(); c.moveTo(L[0], L[1]);
  for (let i = 1; i < n; i++) c.lineTo(L[i*2], L[i*2 + 1]);
  for (let i = n - 1; i >= 0; i--) c.lineTo(R[i*2], R[i*2 + 1]);
  c.closePath();
  return { L, R, N, n };
}
function cosp_path(c, pts, close) { c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); if (close) c.closePath(); }
function cosp_mirror(pts) { // pts: right half [x,y,...] top->bottom; returns closed symmetric outline
  const o = pts.slice();
  for (let i = pts.length - 2; i >= 0; i -= 2) if (pts[i] !== 0) o.push(-pts[i], pts[i + 1]);
  return o;
}
function cosp_stars(g, n, h, seed, col) {
  for (let i = 0; i < n; i++) {
    const x = cosp_hash(i*3.1 + seed)*640, y = cosp_hash(i*7.7 + seed)*h, r = cosp_hash(i*1.3 + seed);
    g.fillStyle = 'rgba(' + col + ',' + (0.2 + r*0.65).toFixed(2) + ')';
    if (r > 0.95) { cosp_glow(g, x, y, 6, col, 0.5); star4(g, x, y, 2.6); }
    else { const s = 0.5 + r*1.1; g.fillRect(x, y, s, s); }
  }
}
function cosp_static(c, id, W, H, fn) {
  let d = 1;
  try { const m = c.getTransform(); d = Math.hypot(m.a, m.b) || 1; } catch (e) { d = 1; }
  d = Math.min(3, Math.max(0.25, d));
  const pw = Math.max(1, Math.round(W*d)), ph = Math.max(1, Math.round(H*d)), key = id + '|' + pw + '|' + ph;
  let cv = cosp_cache.get(key);
  if (!cv) {
    cv = document.createElement('canvas'); cv.width = pw; cv.height = ph;
    const g = cv.getContext('2d'); g.scale(pw/W, ph/H); cosp_view(g, W, H);
    g.lineCap = 'round'; g.lineJoin = 'round';
    try { fn(g); } catch (e) { /* keep partial */ }
    if (cosp_cache.size > 40) cosp_cache.clear();
    cosp_cache.set(key, cv);
  }
  c.drawImage(cv, 0, 0, W, H);
}
function cosp_overlay(g, id) {
  if (id === 'hydra') { g.fillStyle = 'rgba(0,0,0,0.16)'; g.beginPath(); for (let y = 0; y < 360; y += 3) g.rect(0, y, 640, 1); g.fill(); }
  cosp_vignette(g, { leviathan: '4,2,14', colossus: '8,4,6', solarion: '6,2,4', hydra: '4,0,14' }[id]);
}
function cosp_vignette(c, col) {
  c.fillStyle = cosp_rad(c, 'vig' + col, 320, 180, 150, 320, 180, 420, [0, 'rgba(' + col + ',0)', 0.7, 'rgba(' + col + ',0.25)', 1, 'rgba(' + col + ',0.8)']);
  c.fillRect(0, 0, 640, 360);
}

// ============================================================ LEVIATHAN
function cosp_levStatic(g) {
  g.fillStyle = cosp_lin(g, 'lsky', 0, 0, 0, 234, [0, '#04030E', 0.45, '#120A30', 0.8, '#2A1256', 1, '#4C1C70']);
  g.fillRect(0, 0, 640, 234);
  cosp_stars(g, 120, 200, 0, '225,215,255');
  // aurora ribbons
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) {
    g.strokeStyle = ['rgba(62,240,224,0.035)', 'rgba(150,90,255,0.045)', 'rgba(62,200,255,0.03)'][k];
    for (let w = 0; w < 6; w++) {
      g.lineWidth = 22 - w*3; g.beginPath();
      for (let x = -20; x <= 660; x += 20) { const y = 50 + k*26 + Math.sin(x*0.012 + k*2) * 22 + Math.sin(x*0.031 + k)*8; x === -20 ? g.moveTo(x, y) : g.lineTo(x, y); }
      g.stroke();
    }
  }
  g.restore();
  // giant moon
  cosp_glow(g, 320, 112, 250, '140,80,255', 0.45);
  cosp_glow(g, 320, 112, 140, '200,160,255', 0.35);
  g.fillStyle = cosp_rad(g, 'lmoon', 290, 80, 10, 320, 112, 94, [0, '#FBF2FF', 0.45, '#D6B8FF', 0.85, '#8E5DE6', 1, '#6A3CC0']);
  g.beginPath(); g.arc(320, 112, 94, 0, cosp_TAU); g.fill();
  g.fillStyle = 'rgba(100,50,180,0.22)';
  [[270, 80, 16], [362, 70, 11], [380, 140, 20], [262, 150, 12], [330, 175, 9], [300, 52, 7]].forEach(q => { g.beginPath(); g.ellipse(q[0], q[1], q[2], q[2]*0.8, 0.3, 0, cosp_TAU); g.fill(); });
  // horizon sea-stacks / far shore
  const far = [0, 234, 0, 214, 30, 200, 48, 206, 70, 186, 96, 204, 120, 212, 150, 220, 490, 222, 520, 210, 548, 192, 566, 180, 588, 196, 612, 188, 640, 204, 640, 234];
  g.fillStyle = '#1C0C3C'; cosp_path(g, far, true); g.fill();
  const near = [0, 234, 0, 222, 20, 214, 40, 224, 60, 218, 100, 230, 560, 232, 590, 216, 616, 220, 640, 212, 640, 234];
  g.fillStyle = '#0E0622'; cosp_path(g, near, true); g.fill();
  // ocean
  g.fillStyle = cosp_lin(g, 'lsea', 0, 232, 0, 360, [0, '#2C1258', 0.18, '#160C3A', 0.6, '#0A0A24', 1, '#04050E']);
  g.fillRect(0, 232, 640, 128);
  g.fillStyle = 'rgba(62,240,224,0.55)'; g.fillRect(0, 232, 640, 1.2);
  cosp_glow(g, 320, 234, 300, '62,240,224', 0.12);
}
function cosp_tentacle(c, bx, by, len, w, dir, ph, t, curl, fill, rim, sucker, lw) {
  const n = 18, P = []; let x = bx, y = by, a = -Math.PI/2 - dir*(len > 200 ? 0.05 : 0.25);
  for (let i = 0; i < n; i++) {
    P.push(x, y); const s = i/(n - 1);
    a += dir*(curl*s*s*0.3) + Math.sin(t*1.1 + ph - s*3.4)*0.085*(0.3 + s);
    x += Math.cos(a)*len/n; y += Math.sin(a)*len/n;
  }
  const E = cosp_tube(c, P, s => w*(1 - s*0.93));
  c.fillStyle = fill; c.fill();
  c.strokeStyle = rim; c.lineWidth = lw; c.stroke();
  if (sucker) {
    const S = dir > 0 ? E.R : E.L, N = E.N, sg = dir > 0 ? -1 : 1;
    c.fillStyle = sucker;
    c.beginPath();
    for (let i = 2; i < n - 2; i++) {
      const s = i/(n - 1), r = w*(1 - s*0.93)*0.14, ox = S[i*2] + N[i*2]*sg*r*1.6, oy = S[i*2 + 1] + N[i*2 + 1]*sg*r*1.6;
      c.moveTo(ox + r, oy); c.arc(ox, oy, r, 0, cosp_TAU);
    }
    c.fill();
  }
  return E;
}
function cosp_leviathan(c, t) {
  // moon reflection + water glints
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 30; i++) {
    const y = 236 + i*i*0.13 + i*1.6; if (y > 360) break;
    const w = (10 + i*5)*(0.55 + 0.45*Math.sin(t*1.7 + i*1.3)), x = 320 + Math.sin(t*0.9 + i*0.7)*(3 + i*0.9);
    c.fillStyle = '#CDA5FF'; c.globalAlpha = Math.max(0.05, 0.42 - i*0.012); c.fillRect(x - w/2, y, w, 1 + i*0.1);
  }
  c.globalAlpha = 1;
  for (let i = 0; i < 80; i++) {
    const row = cosp_hash(i*5.3), y = 238 + row*row*120, sp = 4 + row*18, dirn = i % 2 ? 1 : -1;
    const x = ((cosp_hash(i*9.1)*720 + t*sp*dirn) % 720 + 720) % 720 - 40, len = 5 + row*34;
    c.fillStyle = i % 3 ? '#3EF0E0' : '#BE78FF'; c.globalAlpha = 0.08 + 0.3*row*(0.5 + 0.5*Math.sin(t*2.3 + i)); c.fillRect(x, y, len, 0.7 + row*1.3);
  }
  c.restore();
  // distant tentacles
  const far = [[118, 262, 120, 22, 1, 0.0, 1.6], [520, 256, 132, 24, -1, 1.7, 1.9], [212, 248, 82, 14, 1, 3.1, 2.2], [446, 246, 90, 15, -1, 4.2, 2.0]];
  far.forEach(f => {
    cosp_tentacle(c, f[0], f[1], f[2], f[3], f[4], f[5], t, f[6], '#1A0C38', 'rgba(62,240,224,0.45)', 'rgba(170,120,255,0.5)', 1.2);
    c.strokeStyle = 'rgba(62,240,224,0.4)'; c.lineWidth = 1;
    for (let k = 0; k < 2; k++) { const q = cosp_fr(t*0.35 + k*0.5 + f[5]); c.globalAlpha = 1 - q; c.beginPath(); c.ellipse(f[0], f[1], f[3]*(0.8 + q*1.8), f[3]*(0.18 + q*0.3), 0, 0, cosp_TAU); c.stroke(); }
    c.globalAlpha = 1;
  });
  // neck / body
  const sw = Math.sin(t*0.6)*14, bob = Math.sin(t*1.2)*3;
  const P = cosp_bez(318 + sw*0.3, 336, 214 + sw, 262, 420 - sw, 186, 320 + sw*0.5, 132 + bob, 22);
  const wf = s => 130 - s*66;
  // dorsal frill (behind body, on the left edge)
  {
    c.save();
    // swept-back spines: each spike rises from one edge point and leans toward the tail
    const E0 = cosp_tube(c, P, wf), n = E0.n, pts = [];
    c.beginPath(); c.moveTo(E0.L[2], E0.L[3]);
    for (let i = 1; i < n - 2; i++) {
      const s = i/(n - 1), out = (26 - s*12)*(i % 2 ? 1 : 0.7) + Math.sin(t*2.2 + i*0.8)*3;
      const tx = (E0.L[i*2] - E0.L[i*2 + 2])*0.9, ty = (E0.L[i*2 + 1] - E0.L[i*2 + 3])*0.9;
      const px = E0.L[i*2 + 2] + E0.N[i*2 + 2]*out + tx, py = E0.L[i*2 + 3] + E0.N[i*2 + 3]*out + ty;
      pts.push(px, py, E0.L[i*2 + 2], E0.L[i*2 + 3]);
      c.lineTo(px, py); c.lineTo(E0.L[i*2 + 2] + (P[i*2 + 2] - E0.L[i*2 + 2])*0.1, E0.L[i*2 + 3] + (P[i*2 + 3] - E0.L[i*2 + 3])*0.1);
    }
    for (let i = n - 3; i >= 1; i--) c.lineTo(P[i*2], P[i*2 + 1]);
    c.closePath();
    c.fillStyle = 'rgba(70,30,140,0.9)'; c.fill();
    c.strokeStyle = 'rgba(62,240,224,0.75)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(E0.L[2], E0.L[3]); for (let i = 0; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]); c.stroke();
    c.restore();
  }
  const E = cosp_tube(c, P, wf);
  c.fillStyle = cosp_lin(c, 'lbody', 200, 0, 440, 0, [0, '#0E0522', 0.35, '#2A1260', 0.6, '#3A1A7A', 1, '#120628']); c.fill();
  c.save(); c.clip();
  // belly plates
  c.strokeStyle = 'rgba(150,110,255,0.22)'; c.lineWidth = 2;
  c.beginPath();
  for (let i = 1; i < E.n - 1; i++) {
    const mx = P[i*2] - E.N[i*2]*6, my = P[i*2 + 1] - E.N[i*2 + 1]*6;
    c.moveTo(E.L[i*2], E.L[i*2 + 1]); c.quadraticCurveTo(mx + (P[i*2 + 2] - P[i*2 - 2])*0.0, my + 8, E.R[i*2], E.R[i*2 + 1]);
  }
  c.stroke();
  // rim light from moon (left/top) and sea (bottom)
  c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(62,240,224,0.35)'; c.lineWidth = 10; cosp_path(c, E.R, false); c.stroke();
  c.strokeStyle = 'rgba(180,130,255,0.3)'; cosp_path(c, E.L, false); c.stroke();
  c.restore();
  c.strokeStyle = 'rgba(62,240,224,0.85)'; c.lineWidth = 1.6; cosp_path(c, E.R, false); c.stroke();
  c.strokeStyle = 'rgba(190,140,255,0.7)'; cosp_path(c, E.L, false); c.stroke();
  // bioluminescent spots, travelling pulse
  // (all glows first in one additive batch, then the cores: avoids flipping blend modes per spot)
  c.save(); c.globalCompositeOperation = 'lighter';
  const spots = [];
  for (let i = 2; i < E.n - 1; i++) {
    const s = i/(E.n - 1), pulse = 0.5 + 0.5*Math.sin(t*3 - i*0.55);
    for (let sd = -1; sd <= 1; sd += 2) {
      const off = (wf(s)/2)*0.55*sd, x = P[i*2] + E.N[i*2]*off, y = P[i*2 + 1] + E.N[i*2 + 1]*off;
      spots.push(x, y);
      if ((i + (sd > 0 ? 1 : 0)) % 2 === 0) cosp_glow(c, x, y, 9 + pulse*7, '62,240,224', 0.4 + pulse*0.5);
    }
  }
  c.fillStyle = '#D2FFFA'; c.globalAlpha = 0.85; c.beginPath();
  for (let i = 0; i < spots.length; i += 2) c.rect(spots[i] - 1.3, spots[i + 1] - 1.3, 2.6, 2.6);
  c.fill(); c.restore();
  // head
  const hx = P[P.length - 2], hy = P[P.length - 1] - 34;
  c.save(); c.translate(hx, hy); c.rotate(Math.sin(t*0.6 + 0.6)*0.05); c.scale(1.15, 1.15);
  // crest fan
  const sp = 9;
  const tips = [];
  for (let k = 0; k < sp; k++) {
    const a = -Math.PI*0.92 + k/(sp - 1)*Math.PI*0.84, L = (k % 2 ? 52 : 70) - Math.abs(k - 4)*4 + Math.sin(t*1.6 + k)*3;
    tips.push(Math.cos(a)*L, -18 + Math.sin(a)*L*0.85);
  }
  c.beginPath(); c.moveTo(-50, -18);
  for (let i = 0; i < tips.length; i += 2) c.lineTo(tips[i], tips[i + 1]);
  c.lineTo(50, -18); c.closePath();
  c.fillStyle = cosp_lin(c, 'lcrest', 0, -110, 0, -10, [0, 'rgba(62,240,224,0.15)', 0.5, 'rgba(120,60,220,0.6)', 1, 'rgba(40,14,90,0.95)']); c.fill();
  c.strokeStyle = 'rgba(62,240,224,0.9)'; c.lineWidth = 1.4;
  c.beginPath(); for (let i = 0; i < tips.length; i += 2) { c.moveTo(0, -18); c.lineTo(tips[i], tips[i + 1]); } c.stroke();
  c.beginPath(); c.moveTo(tips[0], tips[1]); for (let i = 2; i < tips.length; i += 2) c.lineTo(tips[i], tips[i + 1]); c.stroke();
  // horns
  c.fillStyle = '#20104A'; c.strokeStyle = 'rgba(62,240,224,0.8)'; c.lineWidth = 1.3;
  for (let sd = -1; sd <= 1; sd += 2) {
    c.beginPath(); c.moveTo(sd*52, -26); c.quadraticCurveTo(sd*96, -36, sd*118, -62); c.quadraticCurveTo(sd*86, -40, sd*60, -8); c.closePath(); c.fill(); c.stroke();
  }
  // skull
  const skull = cosp_mirror([0, -48, 30, -42, 62, -22, 74, -2, 58, 16, 40, 30, 24, 48, 0, 56]);
  cosp_path(c, skull, true);
  c.fillStyle = cosp_lin(c, 'lskull', 0, -48, 0, 56, [0, '#3C1E7C', 0.55, '#1E0C44', 1, '#0C0420']); c.fill();
  c.strokeStyle = 'rgba(62,240,224,0.85)'; c.lineWidth = 1.8; c.stroke();
  // brow plates
  c.strokeStyle = 'rgba(160,110,255,0.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -46); c.lineTo(0, -16); c.moveTo(-18, -38); c.lineTo(-8, -22); c.moveTo(18, -38); c.lineTo(8, -22); c.stroke();
  // maw
  const open = 4 + Math.sin(t*0.9)*3;
  c.beginPath(); c.moveTo(-30, 18); c.quadraticCurveTo(0, 10, 30, 18); c.lineTo(20, 38 + open); c.quadraticCurveTo(0, 50 + open, -20, 38 + open); c.closePath();
  c.fillStyle = '#05010C'; c.fill();
  cosp_glow(c, 0, 30 + open*0.5, 34, '255,80,200', 0.55 + 0.2*Math.sin(t*2.2));
  c.fillStyle = '#E8FFFB';
  c.beginPath();
  for (let k = -3; k <= 3; k++) { const x = k*8.4, y = 16.5 - Math.abs(k)*0.9 + (Math.abs(k) === 3 ? 2 : 0), L = Math.abs(k) === 2 ? 12 : 7; c.moveTo(x - 2.6, y); c.lineTo(x, y + L); c.lineTo(x + 2.6, y); }
  for (let k = -2; k <= 2; k++) { const x = k*7.5, y = 42 + open - Math.abs(k)*1.6, L = Math.abs(k) === 1 ? 9 : 6; c.moveTo(x - 2.4, y); c.lineTo(x, y - L); c.lineTo(x + 2.4, y); }
  c.fill();
  // eyes
  const ep = 0.75 + 0.25*Math.sin(t*2.4), blink = cosp_fr(t/5.3) > 0.975 ? 0.15 : 1;
  c.globalCompositeOperation = 'lighter';
  for (let sd = -1; sd <= 1; sd += 2) { cosp_glow(c, sd*36, -4, 58*ep, '62,255,220', 0.55); cosp_glow(c, sd*36, -4, 22, '230,255,250', 0.6*ep); }
  c.globalCompositeOperation = 'source-over';
  for (let sd = -1; sd <= 1; sd += 2) {
    const ex = sd*36, ey = -4;
    c.save(); c.translate(ex, ey); c.scale(1, blink); c.rotate(-sd*0.3);
    c.beginPath(); c.moveTo(-17, 0); c.quadraticCurveTo(0, -13, 17, 0); c.quadraticCurveTo(0, 12, -17, 0); c.closePath();
    c.fillStyle = cosp_rad(c, 'leye', 0, 0, 1, 0, 0, 17, [0, '#FFFFFF', 0.35, '#B8FFF2', 0.75, '#2EE8D0', 1, '#0E8A90']); c.fill();
    c.fillStyle = '#04020C'; c.beginPath(); c.ellipse(Math.sin(t*0.7)*2, 0, 2.6, 9, 0, 0, cosp_TAU); c.fill();
    c.restore();
  }
  // heavy angry brow ridges hooding the eyes
  for (let sd = -1; sd <= 1; sd += 2) {
    c.beginPath(); c.moveTo(sd*6, -20); c.lineTo(sd*40, -30); c.lineTo(sd*70, -34); c.lineTo(sd*60, -16); c.lineTo(sd*34, -10); c.lineTo(sd*12, -2); c.closePath();
    c.fillStyle = '#1A0A3A'; c.fill(); c.strokeStyle = 'rgba(62,240,224,0.7)'; c.lineWidth = 1.2;
    c.beginPath(); c.moveTo(sd*12, -2); c.lineTo(sd*34, -10); c.lineTo(sd*60, -16); c.stroke();
  }
  // barbels
  const tipsB = [];
  c.lineCap = 'round';
  for (let sd = -1; sd <= 1; sd += 2) {
    for (let k = 0; k < 2; k++) {
      const x0 = sd*(54 - k*14), y0 = 12 + k*14, ph = t*1.3 + k + sd;
      const x1 = sd*(80 - k*10) + Math.sin(ph)*8, y1 = 50 + k*10, x2 = sd*(66 - k*6) + Math.sin(ph + 1)*14, y2 = 96 + k*14;
      c.strokeStyle = 'rgba(62,240,224,0.25)'; c.lineWidth = 6;
      c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x1, y1, x2, y2); c.stroke();
      c.strokeStyle = '#7CFFEA'; c.lineWidth = 1.8; c.stroke();
      tipsB.push(x2, y2);
    }
  }
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < tipsB.length; i += 2) cosp_glow(c, tipsB[i], tipsB[i + 1], 9, '62,240,224', 0.8);
  c.restore();
  // foam rings at the neck base
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineWidth = 1.4;
  for (let k = 0; k < 3; k++) {
    const q = cosp_fr(t*0.28 + k/3);
    c.strokeStyle = 'rgba(62,240,224,' + (0.6*(1 - q)).toFixed(3) + ')';
    c.beginPath(); c.ellipse(318 + sw*0.3, 322, 60 + q*170, 9 + q*20, 0, 0, cosp_TAU); c.stroke();
  }
  c.restore();
  // foreground water band
  const band = [];
  for (let x = -8; x <= 648; x += 16) band.push(x, 320 + Math.sin(x*0.03 + t*1.4)*4 + Math.sin(x*0.071 - t*2)*2.5);
  c.beginPath(); c.moveTo(-8, 362); for (let i = 0; i < band.length; i += 2) c.lineTo(band[i], band[i + 1]); c.lineTo(648, 362); c.closePath();
  c.fillStyle = cosp_lin(c, 'lband', 0, 316, 0, 360, [0, 'rgba(20,12,60,0.96)', 1, 'rgba(3,3,12,1)']); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter';
  c.strokeStyle = 'rgba(62,240,224,0.18)'; c.lineWidth = 7; cosp_path(c, band, false); c.stroke();
  c.strokeStyle = 'rgba(160,255,245,0.85)'; c.lineWidth = 1.5; c.stroke();
  for (let i = 0; i < 16; i++) { const y = 330 + i*2.2, x = ((cosp_hash(i*4.4)*700 + t*(10 + i*3)) % 700) - 30; c.fillStyle = 'rgba(62,240,224,' + (0.2 - i*0.01).toFixed(3) + ')'; c.fillRect(x, y, 30 + cosp_hash(i)*50, 1); }
  c.restore();
  // foreground tentacles rising from the band
  cosp_tentacle(c, 58, 372, 250, 54, 1, 0.8, t, 1.5, '#1A0B36', 'rgba(62,240,224,0.9)', 'rgba(190,130,255,0.75)', 2);
  cosp_tentacle(c, 586, 372, 220, 48, -1, 2.6, t, 1.7, '#1A0B36', 'rgba(62,240,224,0.9)', 'rgba(190,130,255,0.75)', 2);
  // bubbles / spores
  c.save(); c.globalCompositeOperation = 'lighter';
  // bucketed by brightness so each bucket is one stroke
  c.lineWidth = 0.9; c.strokeStyle = 'rgb(140,255,240)'; c.fillStyle = '#FFFFFF';
  for (let b = 0; b < 4; b++) {
    c.beginPath();
    for (let i = 0; i < 34; i++) {
      const h = cosp_hash(i*2.71), q = cosp_fr(t*(0.05 + h*0.07) + cosp_hash(i*6.1)), a = Math.sin(q*Math.PI);
      if (Math.min(3, Math.floor(a*4)) !== b) continue;
      const x = 40 + cosp_hash(i*1.9)*560 + Math.sin(t*1.5 + i)*6, y = 335 - q*300, r = 1.2 + h*3.6;
      c.moveTo(x + r, y); c.arc(x, y, r, 0, cosp_TAU); c.rect(x - r*0.5, y - r*0.5, 1, 1);
    }
    c.globalAlpha = 0.2 + b*0.2; c.stroke();
  }
  c.globalAlpha = 1;
  c.restore();
}

// ============================================================ COLOSSUS
function cosp_colStatic(g) {
  g.fillStyle = cosp_lin(g, 'csky', 0, 0, 0, 280, [0, '#0A0818', 0.4, '#1E1030', 0.75, '#5A2418', 1, '#A8441A']);
  g.fillRect(0, 0, 640, 360);
  cosp_stars(g, 50, 110, 40, '255,220,200');
  cosp_glow(g, 320, 250, 330, '255,110,30', 0.4);
  // far skyline
  const layer = (base, seed, n, minH, maxH, col, win, winA) => {
    let x = -10;
    for (let i = 0; i < n && x < 650; i++) {
      const w = 18 + cosp_hash(i + seed)*34, h = minH + cosp_hash(i*2.3 + seed)*(maxH - minH);
      g.fillStyle = col; g.fillRect(x, base - h, w, h + 80);
      if (cosp_hash(i*5.1 + seed) > 0.55) { const cw = 5 + cosp_hash(i*1.7 + seed)*5, ch = h*0.5 + cosp_hash(i*8.8 + seed)*40; g.fillRect(x + w*0.3, base - h - ch, cw, ch); }
      if (cosp_hash(i*3.9 + seed) > 0.7) { g.beginPath(); g.moveTo(x, base - h); g.lineTo(x + w/2, base - h - 12); g.lineTo(x + w, base - h); g.fill(); }
      for (let r = 0; r < h/7 - 1; r++) for (let q = 0; q < w/6 - 1; q++) {
        const hh = cosp_hash(i*31 + r*7 + q*3 + seed);
        if (hh > winA) { g.fillStyle = hh > 0.97 ? 'rgba(120,230,255,0.7)' : win; g.fillRect(x + 3 + q*6, base - h + 4 + r*7, 2, 2.4); }
      }
      g.fillStyle = col; x += w + 2;
    }
  };
  layer(262, 0, 40, 18, 70, '#3A1A22', 'rgba(255,150,60,0.55)', 0.86);
  g.fillStyle = 'rgba(255,120,40,0.12)'; g.fillRect(0, 230, 640, 40);
  layer(308, 50, 30, 30, 120, '#1A0E16', 'rgba(255,170,70,0.75)', 0.9);
  // cranes
  g.strokeStyle = '#0E080E'; g.lineWidth = 3;
  [[70, 300, 150, 1], [560, 300, 170, -1]].forEach(k => {
    const [x, y, h, d] = k; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y - h); g.lineTo(x + d*90, y - h + 6); g.moveTo(x - d*24, y - h + 4); g.lineTo(x, y - h); g.moveTo(x + d*70, y - h + 5); g.lineTo(x + d*70, y - h + 50); g.stroke();
    g.lineWidth = 1; g.beginPath(); for (let j = 0; j < 8; j++) { g.moveTo(x - 4, y - j*18); g.lineTo(x + 4, y - j*18 - 18); } g.stroke(); g.lineWidth = 3;
  });
  g.fillStyle = cosp_lin(g, 'cground', 0, 300, 0, 360, [0, '#0E0810', 1, '#050308']); g.fillRect(0, 300, 640, 60);
}
function cosp_puff(c, x, y, t, sp, seed, n, size, rise, col, drift) {
  for (let k = 0; k < n; k++) {
    const q = cosp_fr(t*sp + k/n + seed), r = size*(0.4 + q*1.6);
    const px = x + q*drift + Math.sin(q*6 + k + seed*9)*size*0.3, py = y - q*rise;
    c.fillStyle = 'rgba(' + col + ',' + (0.55*(1 - q)*Math.min(1, q*6)).toFixed(3) + ')';
    c.beginPath(); c.arc(px, py, r, 0, cosp_TAU); c.fill();
  }
}
function cosp_colossus(c, t) {
  // chimney smoke + blinking lights in the skyline
  [[96, 196], [250, 210], [420, 200], [540, 186]].forEach((p, i) => cosp_puff(c, p[0], p[1], t, 0.08, i*0.31, 5, 12, 80, '60,40,50', 40));
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#FF6A5A';
  for (let i = 0; i < 9; i++) {
    const x = 30 + cosp_hash(i*3.3)*580, y = 160 + cosp_hash(i*1.1)*80, on = Math.sin(t*2.2 + i*1.9) > 0.4;
    if (on) { cosp_glow(c, x, y, 9, '255,40,40', 0.9); c.fillRect(x - 1, y - 1, 2, 2); }
  }
  c.restore();
  // searchlights
  c.save(); c.globalCompositeOperation = 'lighter';
  [[150, 300, 0.5, 0], [500, 300, 0.45, 2]].forEach(s => {
    const a = -Math.PI/2 + Math.sin(t*s[2] + s[3])*0.6, L = 420, w = 0.07;
    c.fillStyle = 'rgba(255,190,120,0.07)';
    c.beginPath(); c.moveTo(s[0], s[1]); c.lineTo(s[0] + Math.cos(a - w)*L, s[1] + Math.sin(a - w)*L); c.lineTo(s[0] + Math.cos(a + w)*L, s[1] + Math.sin(a + w)*L); c.closePath(); c.fill();
  });
  c.restore();
  const bob = Math.sin(t*1.1)*3, cx = 320;
  c.save(); c.translate(0, bob);
  // back exhaust stacks + steam
  for (let sd = -1; sd <= 1; sd += 2) {
    const x = cx + sd*92;
    c.fillStyle = '#20232C'; c.fillRect(x - 11, 40, 22, 90);
    c.fillStyle = '#2E323E'; c.fillRect(x - 14, 36, 28, 10);
    c.fillStyle = 'rgba(255,140,40,0.8)'; c.fillRect(x - 11, 46, 22, 2);
    cosp_puff(c, x, 30, t, 0.32, sd > 0 ? 0.5 : 0, 7, 10, 70, '210,200,215', sd*24);
  }
  // arms
  for (let sd = -1; sd <= 1; sd += 2) {
    const arm = cosp_mirror([0, 0]); void arm;
    c.fillStyle = cosp_lin(c, 'carm', 0, 140, 0, 360, [0, '#3A404E', 1, '#14161E']);
    c.beginPath(); c.moveTo(cx + sd*130, 150); c.lineTo(cx + sd*200, 160); c.lineTo(cx + sd*236, 370); c.lineTo(cx + sd*150, 370); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,140,50,0.35)'; c.lineWidth = 1.5; c.stroke();
    // piston
    c.fillStyle = '#9AA2B0'; c.fillRect(cx + sd*168 - 3, 220, 6, 110);
    c.fillStyle = '#20242E'; c.fillRect(cx + sd*168 - 7, 300, 14, 70);
    c.fillStyle = '#FF8A2A'; c.fillRect(cx + sd*186 - 2, 250, 4, 30);
    cosp_glow(c, cx + sd*186, 265, 18, '255,130,40', 0.5 + 0.3*Math.sin(t*3 + sd));
  }
  // torso
  const torso = cosp_mirror([0, 100, 56, 104, 126, 124, 138, 196, 112, 250, 86, 300, 98, 370, 0, 370]);
  c.save(); c.translate(cx, 0);
  cosp_path(c, torso, true);
  c.fillStyle = cosp_lin(c, 'ctorso', 0, 100, 0, 370, [0, '#4C5464', 0.4, '#2C3240', 1, '#101218']); c.fill();
  c.strokeStyle = 'rgba(255,150,60,0.55)'; c.lineWidth = 2; c.stroke();
  // pectoral plates
  c.fillStyle = cosp_lin(c, 'cpec', 0, 110, 0, 240, [0, '#5E6878', 1, '#2A303C']);
  for (let sd = -1; sd <= 1; sd += 2) {
    c.beginPath(); c.moveTo(sd*12, 116); c.lineTo(sd*112, 132); c.lineTo(sd*122, 192); c.lineTo(sd*70, 238); c.lineTo(sd*44, 232); c.lineTo(sd*50, 160); c.lineTo(sd*12, 150); c.closePath(); c.fill();
    c.strokeStyle = '#0A0C12'; c.lineWidth = 2; c.stroke();
    c.strokeStyle = 'rgba(200,215,240,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(sd*14, 117); c.lineTo(sd*110, 133); c.stroke();
    c.fillStyle = '#1A1E26';
    for (let k = 0; k < 4; k++) { c.beginPath(); c.arc(sd*(24 + k*24), 127 + k*4, 2.2, 0, cosp_TAU); c.fill(); }
    // glowing vent slits
    for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(255,' + (120 + k*20) + ',40,' + (0.55 + 0.35*Math.sin(t*4 + k + sd)).toFixed(2) + ')'; c.fillRect(sd > 0 ? 82 : -112, 160 + k*9, 30, 3); }
    c.fillStyle = cosp_lin(c, 'cpec', 0, 110, 0, 240, [0, '#5E6878', 1, '#2A303C']);
  }
  // abdominal segments
  for (let k = 0; k < 4; k++) {
    const y = 250 + k*28, w = 70 - k*2;
    c.fillStyle = k % 2 ? '#262B36' : '#2F3542'; c.beginPath(); c.moveTo(-w, y); c.lineTo(w, y); c.lineTo(w - 6, y + 24); c.lineTo(-w + 6, y + 24); c.closePath(); c.fill();
    c.strokeStyle = '#0A0C12'; c.lineWidth = 1.5; c.stroke();
    c.fillStyle = 'rgba(255,140,40,0.6)'; c.fillRect(-4, y + 9, 8, 6);
  }
  // reactor core
  const pulse = 0.5 + 0.5*Math.sin(t*3.2), cyR = 188;
  cosp_glow(c, 0, cyR, 130, '255,110,20', 0.4 + 0.2*pulse);
  c.fillStyle = '#12141A'; c.beginPath(); c.arc(0, cyR, 52, 0, cosp_TAU); c.fill();
  c.strokeStyle = '#5A6272'; c.lineWidth = 5; c.stroke();
  c.fillStyle = '#8A93A4';
  for (let k = 0; k < 10; k++) { const a = k/10*cosp_TAU; c.beginPath(); c.arc(Math.cos(a)*48, cyR + Math.sin(a)*48, 2.4, 0, cosp_TAU); c.fill(); }
  c.fillStyle = cosp_rad(c, 'ccore', 0, cyR, 0, 0, cyR, 40, [0, '#FFFFFF', 0.25, '#FFF0A0', 0.55, '#FF9A2A', 0.85, '#E0400E', 1, '#601004']);
  c.beginPath(); c.arc(0, cyR, 38 + pulse*2, 0, cosp_TAU); c.fill();
  c.save(); c.globalCompositeOperation = 'lighter';
  c.translate(0, cyR); c.rotate(t*1.2);
  c.strokeStyle = 'rgba(255,220,140,0.9)'; c.lineWidth = 3;
  for (let k = 0; k < 6; k++) { c.beginPath(); c.arc(0, 0, 30, k/6*cosp_TAU, k/6*cosp_TAU + 0.6); c.stroke(); }
  c.rotate(-t*2.6); c.lineWidth = 1.6; c.strokeStyle = 'rgba(255,255,220,0.8)';
  for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(0, 0, 18, k/3*cosp_TAU, k/3*cosp_TAU + 1.2); c.stroke(); }
  c.restore();
  cosp_glow(c, 0, cyR, 60, '255,230,160', 0.55 + 0.35*pulse);
  // grille over the core
  c.fillStyle = 'rgba(16,18,24,0.85)'; for (let k = -1; k <= 1; k++) c.fillRect(k*16 - 2.5, cyR - 40, 5, 80);
  // pauldrons: stacked angular armour plates
  for (let sd = -1; sd <= 1; sd += 2) {
    c.save(); c.translate(sd*150, 128); c.scale(sd, 1); c.rotate(0.1);
    for (let k = 2; k >= 0; k--) {
      const rx = 84 - k*14, ry = 58 - k*12, oy = k*17;
      const pl = [-rx, oy + 16, -rx*0.95, oy - ry*0.35, -rx*0.55, oy - ry*0.9, rx*0.15, oy - ry, rx*0.8, oy - ry*0.62, rx*1.05, oy - ry*0.05, rx, oy + 16];
      cosp_path(c, pl, true);
      c.fillStyle = ['#5E6878', '#454D5C', '#2E3440'][k]; c.fill();
      c.strokeStyle = '#0A0C12'; c.lineWidth = 2; c.stroke();
      if (k === 0) {
        c.save(); c.clip();
        c.fillStyle = 'rgba(210,225,255,0.18)'; c.beginPath(); c.moveTo(-rx*0.55, oy - ry*0.9); c.lineTo(rx*0.15, oy - ry); c.lineTo(rx*0.1, oy - ry + 14); c.lineTo(-rx*0.6, oy - ry*0.9 + 12); c.closePath(); c.fill();
        c.fillStyle = '#FF8A1E'; c.beginPath();
        for (let q = -8; q < 8; q++) { c.moveTo(q*14, oy + 17); c.lineTo(q*14 + 7, oy + 17); c.lineTo(q*14 + 15, oy + 4); c.lineTo(q*14 + 8, oy + 4); c.closePath(); }
        c.fill();
        c.restore();
      }
    }
    c.strokeStyle = 'rgba(255,150,60,0.6)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(84*1.05, -3); c.lineTo(84*0.8, -36); c.lineTo(84*0.15, -58); c.stroke();
    c.fillStyle = '#1A1E26'; c.beginPath(); for (let k = 0; k < 5; k++) { const x = -60 + k*26, y = -40 - (k < 3 ? k*6 : 12 - (k - 2)*8); c.moveTo(x + 2.4, y); c.arc(x, y, 2.4, 0, cosp_TAU); } c.fill();
    // shoulder vent glow
    c.fillStyle = 'rgba(255,150,50,' + (0.6 + 0.3*Math.sin(t*5 + sd)).toFixed(2) + ')'; c.fillRect(-20, -22, 26, 4); c.fillRect(-16, -14, 20, 3);
    c.restore();
    cosp_puff(c, cx + sd*168 - cx, 86, t, 0.5, sd > 0 ? 0.25 : 0.75, 6, 8, 50, '230,225,235', sd*30);
  }
  // neck + head
  c.fillStyle = '#1A1D25'; c.fillRect(-30, 86, 60, 30);
  c.fillStyle = '#2A2F3A'; for (let k = 0; k < 3; k++) c.fillRect(-34, 92 + k*8, 68, 4);
  c.save(); c.translate(0, 104); c.scale(1.16, 1.16); c.translate(0, -104);
  const head = cosp_mirror([0, 22, 26, 26, 44, 40, 48, 64, 40, 86, 22, 100, 0, 104]);
  cosp_path(c, head, true);
  c.fillStyle = cosp_lin(c, 'chead', 0, 22, 0, 104, [0, '#6A7486', 1, '#262B36']); c.fill();
  c.strokeStyle = 'rgba(255,150,60,0.5)'; c.lineWidth = 1.5; c.stroke();
  // crest fin / antennas
  c.fillStyle = '#3A4150'; c.beginPath(); c.moveTo(-6, 24); c.lineTo(0, -6); c.lineTo(6, 24); c.closePath(); c.fill();
  for (let sd = -1; sd <= 1; sd += 2) {
    c.fillStyle = '#2C323E'; c.beginPath(); c.moveTo(sd*44, 44); c.lineTo(sd*70, 30); c.lineTo(sd*66, 52); c.lineTo(sd*48, 64); c.closePath(); c.fill();
    c.strokeStyle = '#8A94A8'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(sd*40, 34); c.lineTo(sd*58, 4); c.stroke();
    if (Math.sin(t*3 + sd) > 0) { cosp_glow(c, sd*58, 4, 8, '255,60,40', 0.9); }
  }
  // visor
  c.fillStyle = '#05060A'; c.beginPath(); c.moveTo(-40, 54); c.lineTo(40, 54); c.lineTo(34, 70); c.lineTo(-34, 70); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,90,20,0.35)'; c.fillRect(-36, 60, 72, 4);
  const sx = Math.sin(t*1.4)*30;
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 1; k <= 5; k++) { const px = Math.sin(t*1.4 - k*0.07)*30; c.fillStyle = 'rgba(255,120,40,' + (0.35 - k*0.06).toFixed(2) + ')'; c.fillRect(px - 6, 59, 12, 6); }
  c.restore();
  cosp_glow(c, sx, 62, 36, '255,90,30', 0.8);
  cosp_glow(c, sx, 62, 12, '255,240,200', 0.9);
  c.fillStyle = '#FFF2D0'; c.fillRect(sx - 7, 60, 14, 4);
  // jaw grille
  c.fillStyle = '#12141A'; for (let k = -2; k <= 2; k++) c.fillRect(k*8 - 2, 78, 4, 16);
  // angry V-shaped brow plate over the visor
  c.fillStyle = '#4A5262'; c.beginPath(); c.moveTo(-48, 36); c.lineTo(0, 50); c.lineTo(48, 36); c.lineTo(44, 46); c.lineTo(0, 57); c.lineTo(-44, 46); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,150,60,0.7)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-48, 36); c.lineTo(0, 50); c.lineTo(48, 36); c.stroke();
  c.restore();
  c.restore(); // torso translate
  // sparks from the damaged left shoulder joint
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  const burstT = t*0.8, burst = Math.floor(burstT), bq = cosp_fr(burstT);
  for (let i = 0; i < 18; i++) {
    const h = cosp_hash(i*3.7 + burst*11.3), ang = -Math.PI*0.9 + h*Math.PI*0.75, v = 60 + cosp_hash(i*5.3 + burst)*110;
    const tt = bq*1.6, x = cx - 186 + Math.cos(ang)*v*tt, y = 150 + Math.sin(ang)*v*tt + 140*tt*tt;
    const vx = Math.cos(ang)*v, vy = Math.sin(ang)*v + 280*tt, a = Math.max(0, 1 - bq*1.3);
    if (a <= 0) continue;
    c.strokeStyle = 'rgba(255,' + (200 + (i % 3)*20) + ',120,' + a.toFixed(3) + ')'; c.lineWidth = 1.4;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - vx*0.03, y - vy*0.03); c.stroke();
  }
  if (bq < 0.15) cosp_glow(c, cx - 186, 150, 40, '255,200,120', (0.15 - bq)*6);
  c.restore();
  c.restore(); // bob
  // foreground girders
  c.save();
  for (let sd = -1; sd <= 1; sd += 2) {
    c.save(); c.translate(sd > 0 ? 640 : 0, 0); c.scale(-sd, 1);
    c.fillStyle = '#07050A'; c.fillRect(0, 300, 90, 60); c.fillRect(0, 0, 18, 360);
    c.strokeStyle = '#07050A'; c.lineWidth = 5; c.beginPath();
    for (let k = 0; k < 6; k++) { c.moveTo(0, 300 - k*60); c.lineTo(60, 240 - k*60); c.moveTo(0, 240 - k*60); c.lineTo(60, 300 - k*60); }
    c.moveTo(60, 360); c.lineTo(60, -10); c.stroke();
    c.strokeStyle = 'rgba(255,120,40,0.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(62.5, 360); c.lineTo(62.5, -10); c.moveTo(0, 298); c.lineTo(90, 298); c.stroke();
    c.restore();
  }
  c.restore();
  // embers
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 30; i++) {
    const h = cosp_hash(i*4.13), q = cosp_fr(t*(0.06 + h*0.08) + cosp_hash(i*2.2));
    const x = cosp_hash(i*7.9)*640 + Math.sin(t*1.3 + i)*12 + q*30, y = 360 - q*360, a = Math.sin(q*Math.PI);
    c.fillStyle = 'rgba(255,' + (140 + (i % 4)*25) + ',60,' + (a*0.9).toFixed(3) + ')'; c.fillRect(x, y, 1.6 + h*1.6, 1.6 + h*1.6);
  }
  c.restore();
}

// ============================================================ SOLARION
function cosp_solStatic(g) {
  g.fillStyle = cosp_rad(g, 'sbg', 320, 180, 10, 320, 180, 420, [0, '#2A0812', 0.5, '#100410', 1, '#04020A']);
  g.fillRect(0, 0, 640, 360);
  // nebula clouds
  for (let i = 0; i < 16; i++) {
    const x = cosp_hash(i*2.2 + 9)*640, y = cosp_hash(i*4.4 + 9)*360, r = 60 + cosp_hash(i*6.6)*120;
    cosp_glow(g, x, y, r, i % 3 ? '170,30,60' : '110,40,170', 0.18);
  }
  cosp_stars(g, 170, 360, 77, '255,235,220');
  cosp_glow(g, 320, 178, 340, '255,70,30', 0.5);
  cosp_glow(g, 320, 178, 210, '255,170,60', 0.6);
  // distant galaxy
  g.save(); g.translate(92, 70); g.rotate(-0.4); g.scale(1, 0.4);
  cosp_glow(g, 0, 0, 40, '200,170,255', 0.5);
  g.strokeStyle = 'rgba(220,200,255,0.25)'; g.lineWidth = 2;
  for (let k = 0; k < 2; k++) { g.beginPath(); for (let a = 0; a < 7; a += 0.2) { const r = 4 + a*5, x = Math.cos(a + k*Math.PI)*r, y = Math.sin(a + k*Math.PI)*r; a === 0 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
  g.restore();
}
function cosp_rock(c, x, y, r, rot, seed, lightAng) {
  c.save(); c.translate(x, y); c.rotate(rot);
  c.beginPath();
  for (let k = 0; k < 7; k++) { const a = k/7*cosp_TAU, rr2 = r*(0.65 + cosp_hash(seed + k)*0.5); k ? c.lineTo(Math.cos(a)*rr2, Math.sin(a)*rr2) : c.moveTo(Math.cos(a)*rr2, Math.sin(a)*rr2); }
  c.closePath(); c.fillStyle = '#1E0C0A'; c.fill();
  c.clip(); const la = lightAng - rot;
  c.fillStyle = 'rgba(255,160,60,0.85)'; c.beginPath(); c.arc(Math.cos(la)*r*1.25, Math.sin(la)*r*1.25, r*0.95, 0, cosp_TAU); c.fill();
  c.restore();
}
function cosp_solarion(c, t) {
  const X = 320, Y = 178, R = 110;
  // corona + rays
  c.save(); c.globalCompositeOperation = 'lighter'; c.translate(X, Y); c.rotate(t*0.05);
  c.fillStyle = 'rgba(255,190,90,0.08)'; c.beginPath();
  for (let k = 0; k < 14; k++) {
    const a = k/14*cosp_TAU, L = 230 + (k % 3)*60 + Math.sin(t*1.3 + k)*20, w = 0.035 + (k % 2)*0.02;
    c.moveTo(0, 0); c.lineTo(Math.cos(a - w)*L, Math.sin(a - w)*L); c.lineTo(Math.cos(a + w)*L, Math.sin(a + w)*L); c.closePath();
  }
  c.fill();
  c.restore();
  // orbiting debris
  const deb = [];
  for (let i = 0; i < 14; i++) {
    const a = cosp_hash(i*3.3)*cosp_TAU + t*(0.12 + cosp_hash(i)*0.08), rr2 = 1 + cosp_hash(i*8.1)*0.35;
    const ox = Math.cos(a)*240*rr2, oz = Math.sin(a), oy = oz*58*rr2;
    const x = X + ox*Math.cos(-0.22) - oy*Math.sin(-0.22), y = Y + ox*Math.sin(-0.22) + oy*Math.cos(-0.22);
    deb.push([x, y, oz, (4 + cosp_hash(i*1.7)*10)*(0.75 + oz*0.3), i]);
  }
  const drawDeb = front => deb.forEach(d => { if ((d[2] > 0) !== front) return; cosp_rock(c, d[0], d[1], d[3], t*(0.3 + cosp_hash(d[4])*0.6), d[4]*13, Math.atan2(Y - d[1], X - d[0])); });
  c.strokeStyle = 'rgba(255,160,80,0.12)'; c.lineWidth = 1;
  c.save(); c.translate(X, Y); c.rotate(-0.22); c.beginPath(); c.ellipse(0, 0, 280, 68, 0, 0, cosp_TAU); c.stroke(); c.restore();
  drawDeb(false);
  // solar flare loops (behind & in front of limb)
  const flares = [[-2.5, 0.42, 0, 1.0], [-0.75, 0.28, 1.4, 0.55], [0.35, 0.6, 2.6, 1.35], [2.25, 0.3, 3.9, 0.6], [-1.55, 0.2, 5.1, 0.4], [1.3, 0.22, 4.4, 0.45], [-3.4, 0.18, 2.0, 0.35]];
  const loop = (f, pass) => {
    const a0 = f[0], span = f[1], h = (40 + 60*(0.5 + 0.5*Math.sin(t*0.7 + f[2])))*f[3];
    const a1 = a0 - span/2, a2 = a0 + span/2;
    const p1x = X + Math.cos(a1)*R*0.96, p1y = Y + Math.sin(a1)*R*0.96, p2x = X + Math.cos(a2)*R*0.96, p2y = Y + Math.sin(a2)*R*0.96;
    const c1x = X + Math.cos(a1 - 0.25)*(R + h*1.6), c1y = Y + Math.sin(a1 - 0.25)*(R + h*1.6), c2x = X + Math.cos(a2 + 0.25)*(R + h*1.6), c2y = Y + Math.sin(a2 + 0.25)*(R + h*1.6);
    if (pass === 0) {
      c.beginPath(); c.moveTo(p1x, p1y); c.bezierCurveTo(c1x, c1y, c2x, c2y, p2x, p2y);
      c.strokeStyle = 'rgba(255,110,35,0.45)'; c.lineWidth = 7*f[3] + 3; c.stroke();
      c.strokeStyle = 'rgba(255,240,190,0.9)'; c.lineWidth = 1.3; c.stroke();
    } else {
      for (let k = 0; k < 3; k++) {
        const u = cosp_fr(t*0.25 + k/3 + f[2]), m = 1 - u, b0 = m*m*m, b1 = 3*m*m*u, b2 = 3*m*u*u, b3 = u*u*u;
        const x = b0*p1x + b1*c1x + b2*c2x + b3*p2x, y = b0*p1y + b1*c1y + b2*c2y + b3*p2y;
        cosp_glow(c, x, y, 10, '255,230,160', 0.8);
      }
    }
  };
  c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
  flares.forEach(f => loop(f, 0)); flares.forEach(f => loop(f, 1));
  c.restore();
  // flame corona (two wobbling layers)
  const flame = (amp, rad, fill) => {
    c.beginPath();
    for (let k = 0; k <= 90; k++) {
      const a = k/90*cosp_TAU;
      const r = rad*(1 + amp*(0.5*Math.sin(a*7 + t*2.1) + 0.35*Math.sin(a*13 - t*3.3) + 0.25*Math.sin(a*23 + t*5.2) + 0.2*Math.sin(a*3 - t*0.8)));
      k ? c.lineTo(X + Math.cos(a)*r, Y + Math.sin(a)*r) : c.moveTo(X + Math.cos(a)*r, Y + Math.sin(a)*r);
    }
    c.closePath(); c.fillStyle = fill; c.fill();
  };
  flame(0.12, R*1.16, cosp_rad(c, 'sfl1', X, Y, R*0.9, X, Y, R*1.45, [0, 'rgba(255,80,20,0.95)', 0.6, 'rgba(220,30,30,0.5)', 1, 'rgba(160,10,30,0)']));
  flame(0.07, R*1.06, cosp_rad(c, 'sfl2', X, Y, R*0.8, X, Y, R*1.2, [0, 'rgba(255,200,70,1)', 0.7, 'rgba(255,120,30,0.7)', 1, 'rgba(255,60,20,0)']));
  // star body
  c.fillStyle = cosp_rad(c, 'sbody', X - 18, Y - 22, 6, X, Y, R, [0, '#FFFDF2', 0.3, '#FFE68A', 0.65, '#FFA12C', 0.9, '#E8521A', 1, '#C02A14']);
  c.beginPath(); c.arc(X, Y, R, 0, cosp_TAU); c.fill();
  // surface churn
  c.save(); c.beginPath(); c.arc(X, Y, R, 0, cosp_TAU); c.clip();
  for (let i = 0; i < 16; i++) {
    const ph = cosp_hash(i*5.5)*cosp_TAU + t*0.18, lat = (cosp_hash(i*2.9) - 0.5)*1.8, z = Math.cos(ph);
    if (z < 0) continue;
    const x = X + Math.sin(ph)*R*Math.cos(lat*0.8), y = Y + Math.sin(lat*0.8)*R, rr2 = (8 + cosp_hash(i)*16)*(0.4 + z*0.6);
    c.fillStyle = 'rgba(190,40,10,' + (0.22*z).toFixed(3) + ')'; c.beginPath(); c.ellipse(x, y, rr2*z + 2, rr2, 0, 0, cosp_TAU); c.fill();
  }
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) { const a = t*0.3 + i*0.63, x = X + Math.cos(a*1.3 + i)*R*0.6, y = Y + Math.sin(a + i*2)*R*0.6; cosp_glow(c, x, y, 26, '255,220,120', 0.25); }
  c.restore();
  // face of white-hot light: dark crimson sockets, blazing slit eyes, a fanged snarl
  const anger = 0.5 + 0.5*Math.sin(t*1.7), fy = Y + 2;
  c.save();
  c.fillStyle = 'rgba(120,14,8,0.62)';
  for (let sd = -1; sd <= 1; sd += 2) {
    c.beginPath(); c.moveTo(X + sd*4, fy - 6); c.lineTo(X + sd*30, fy - 30); c.lineTo(X + sd*70, fy - 46 - anger*3); c.lineTo(X + sd*66, fy - 16); c.lineTo(X + sd*40, fy + 2); c.lineTo(X + sd*14, fy + 6); c.closePath(); c.fill();
  }
  // mouth socket (downturned)
  const mo = anger*5;
  c.beginPath(); c.moveTo(X - 58, fy + 52); c.quadraticCurveTo(X - 40, fy + 22, X, fy + 20); c.quadraticCurveTo(X + 40, fy + 22, X + 58, fy + 52);
  c.quadraticCurveTo(X + 30, fy + 74 + mo, X, fy + 78 + mo); c.quadraticCurveTo(X - 30, fy + 74 + mo, X - 58, fy + 52); c.closePath(); c.fill();
  // eyes: sharp slits, inner corners low
  c.fillStyle = '#FFFFFF'; c.beginPath();
  for (let sd = -1; sd <= 1; sd += 2) { c.moveTo(X + sd*14, fy - 2); c.lineTo(X + sd*36, fy - 20); c.lineTo(X + sd*62, fy - 32 - anger*2); c.lineTo(X + sd*52, fy - 16); c.lineTo(X + sd*34, fy - 6); c.closePath(); }
  c.fill();
  c.globalCompositeOperation = 'lighter';
  for (let sd = -1; sd <= 1; sd += 2) cosp_glow(c, X + sd*38, fy - 14, 54, '255,240,200', 0.55 + 0.35*anger);
  c.strokeStyle = 'rgba(255,255,220,' + (0.35 + 0.45*anger).toFixed(2) + ')'; c.lineWidth = 1.4; c.beginPath();
  for (let sd = -1; sd <= 1; sd += 2) { c.moveTo(X + sd*62, fy - 32); c.lineTo(X + sd*96, fy - 48 - anger*8); }
  c.stroke();
  // mouth glow sits in the same additive batch
  cosp_glow(c, X, fy + 50, 70, '255,240,190', 0.55 + 0.3*anger);
  c.globalCompositeOperation = 'source-over';
  // white-hot maw with dark fangs silhouetted against it
  c.fillStyle = '#FFFBEA';
  c.beginPath(); c.moveTo(X - 46, fy + 50); c.quadraticCurveTo(X - 30, fy + 30, X, fy + 29); c.quadraticCurveTo(X + 30, fy + 30, X + 46, fy + 50);
  c.quadraticCurveTo(X + 24, fy + 66 + mo, X, fy + 69 + mo); c.quadraticCurveTo(X - 24, fy + 66 + mo, X - 46, fy + 50); c.closePath(); c.fill();
  c.fillStyle = '#8A1408';
  c.beginPath();
  for (let k = -4; k <= 4; k++) {
    const x = X + k*9.5, yt = fy + 30 + Math.abs(k)*k*k*0.06 + Math.abs(k)*1.2, L2 = (Math.abs(k) === 3 ? 18 : 10) - Math.abs(k)*0.6;
    c.moveTo(x - 4, yt - 3); c.lineTo(x, yt + L2); c.lineTo(x + 4, yt - 3);
  }
  for (let k = -3; k <= 3; k++) {
    const x = X + k*10 + 5*(k ? Math.sign(k) : 0)*0, yb = fy + 69 + mo - Math.abs(k)*Math.abs(k)*1.5, L2 = Math.abs(k) === 2 ? 14 : 8;
    c.moveTo(x - 4, yb + 3); c.lineTo(x, yb - L2); c.lineTo(x + 4, yb + 3);
  }
  c.fill();
  // cracks of light
  c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(255,250,210,0.7)'; c.lineWidth = 1.2;
  c.beginPath();
  [[-64, 30, -84, 46, -78, 70], [64, 30, 86, 44, 80, 72], [0, -30, -8, -56, 4, -84], [-24, 82, -32, 94, -26, 102], [26, 82, 36, 92, 30, 102], [-74, -40, -88, -20, -96, -6], [74, -40, 88, -22, 98, -8]].forEach(q => { c.moveTo(X + q[0], fy + q[1]); c.lineTo(X + q[2], fy + q[3]); c.lineTo(X + q[4], fy + q[5]); });
  c.stroke();
  c.restore();
  drawDeb(true);
  // embers spiralling out
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 46; i++) {
    const h = cosp_hash(i*1.77), q = cosp_fr(t*(0.05 + h*0.05) + cosp_hash(i*3.9)), a = h*cosp_TAU + q*1.4 + t*0.05;
    const r = R*1.05 + q*230, a2 = Math.sin(q*Math.PI);
    c.fillStyle = 'rgba(255,' + (150 + (i % 4)*25) + ',70,' + (a2*0.85).toFixed(3) + ')';
    const s = 1.2 + h*2.2*(1 - q); c.fillRect(X + Math.cos(a)*r, Y + Math.sin(a)*r*0.8, s, s);
  }
  // lens flare
  c.fillStyle = 'rgba(255,210,150,0.10)'; c.fillRect(0, Y - 1.5, 640, 3);
  c.fillStyle = 'rgba(255,240,210,0.18)'; c.fillRect(X - 220, Y - 0.6, 440, 1.2);
  [[0.55, 18, '255,120,60'], [0.85, 10, '120,200,255'], [1.25, 30, '255,90,140']].forEach(f => cosp_glow(c, X + (480 - X)*f[0], Y + (300 - Y)*f[0], f[1], f[2], 0.35));
  c.restore();
  // foreground asteroid silhouettes
  c.save();
  [[34, 330, 70, 0.2, 5], [612, 30, 54, -0.3, 9], [600, 352, 36, 0.6, 2]].forEach(r => {
    c.save(); c.translate(r[0], r[1]); c.rotate(r[3] + t*0.04);
    c.beginPath(); for (let k = 0; k < 9; k++) { const a = k/9*cosp_TAU, rr2 = r[2]*(0.7 + cosp_hash(r[4] + k)*0.4); k ? c.lineTo(Math.cos(a)*rr2, Math.sin(a)*rr2) : c.moveTo(Math.cos(a)*rr2, Math.sin(a)*rr2); }
    c.closePath(); c.fillStyle = '#0A0406'; c.fill();
    c.restore();
    c.strokeStyle = 'rgba(255,170,70,0.5)'; c.lineWidth = 1.5;
    const la = Math.atan2(Y - r[1], X - r[0]);
    c.beginPath(); c.arc(r[0], r[1], r[2]*0.82, la - 0.6, la + 0.6); c.stroke();
  });
  c.restore();
}

// ============================================================ HYDRA
function cosp_hydStatic(g) {
  g.fillStyle = cosp_lin(g, 'hsky', 0, 0, 0, 238, [0, '#05021A', 0.5, '#140630', 0.85, '#36094E', 1, '#5A0E5E']);
  g.fillRect(0, 0, 640, 238);
  cosp_stars(g, 60, 180, 21, '180,240,255');
  // striped synth sun
  cosp_glow(g, 320, 196, 220, '255,40,200', 0.35);
  g.save(); g.beginPath(); g.arc(320, 196, 112, 0, cosp_TAU); g.clip();
  g.fillStyle = cosp_lin(g, 'hsun', 0, 84, 0, 238, [0, '#FF9AF0', 0.45, '#FF2EB4', 1, '#6A1AFF']);
  g.fillRect(200, 80, 240, 160);
  g.fillStyle = '#2A0742';
  for (let k = 0; k < 9; k++) { const y = 150 + k*k*1.1 + k*6, h = 1 + k*0.9; g.fillRect(200, y, 240, h); }
  g.restore();
  // floor
  g.fillStyle = cosp_lin(g, 'hfloor', 0, 236, 0, 360, [0, '#1A0430', 1, '#05010C']); g.fillRect(0, 236, 640, 124);
  g.fillStyle = 'rgba(255,60,220,0.9)'; g.fillRect(0, 235.5, 640, 1.4);
  // distant data monoliths
  g.fillStyle = '#0C0420';
  for (let i = 0; i < 14; i++) { const x = cosp_hash(i*6.1)*640, w = 8 + cosp_hash(i*2.4)*20, h = 20 + cosp_hash(i*9.3)*60; if (Math.abs(x - 320) < 120) continue; g.fillRect(x, 236 - h, w, h); g.fillStyle = 'rgba(62,230,255,0.35)'; g.fillRect(x, 236 - h, w, 1); g.fillStyle = '#0C0420'; }
}
function cosp_codeStrip(c) {
  let pr = 1; try { const m = c.getTransform(); pr = Math.min(4, Math.max(0.5, Math.hypot(m.a, m.b))); } catch (e) { pr = 1; }
  const key = 'strip|' + Math.round(pr*4);
  let cv = cosp_cache.get(key);
  if (!cv) {
    // 8 different glyph columns side by side (also keeps the canvas big enough to be GPU-backed);
    // each column holds its run twice so any 360-tall window can be blitted in one call
    const CH = 13, N = 48, CW = 16; cv = document.createElement('canvas'); cv.width = Math.ceil(CW*8*pr); cv.height = Math.ceil(CH*N*2*pr);
    const g = cv.getContext('2d'); g.scale(pr, pr); g.font = '700 11px monospace'; g.textAlign = 'center'; g.textBaseline = 'top';
    const chars = '01ABCDEF#$%&<>/\\=+*ｱｲｳｴｵｶｷｸｹｺ';
    for (let col = 0; col < 8; col++) for (let i = 0; i < N*2; i++) { const j = i % N, h = j*3.7 + col*17.3; g.fillStyle = cosp_hash(h) > 0.86 ? '#FF7AE6' : '#7CF4FF'; g.fillText(chars[Math.floor(cosp_hash(h*2.9)*chars.length)], col*CW + CW/2, i*CH); }
    cv.__h = CH*N; cv.__pr = cv.height/(CH*N*2); cv.__cw = CW; cosp_cache.set(key, cv);
  }
  return cv;
}
function cosp_hydraHead(c, kind, open, t) {
  // returns nothing; draws in local space. kind 0 = profile facing +x, 1 = frontal
  if (kind === 0) {
    const up = [-34, -6, -30, -20, -10, -26, 14, -18, 46, -10, 58, -3, 56, 6, 10, 8, -20, 14];
    const lo = [8, 10, 50, 10 + open, 46, 18 + open, 4, 22 + open*0.4, -22, 18];
    const horns = [[-10, -26, -48, -50, -20, -20], [-26, -20, -58, -30, -32, -12]];
    return { up, lo, horns, eyes: [[16, -10]], inner: [[-10, -26, 14, 8], [14, -18, 10, 8], [46, -10, 10, 8], [-30, -20, 10, 8], [-34, -6, 10, 8]] };
  }
  const up = cosp_mirror([0, -34, 18, -28, 34, -8, 26, 14, 14, 28, 0, 30]);
  const lo = cosp_mirror([0, 30 + open, 14, 28 + open*0.6, 10, 42 + open, 0, 50 + open]);
  const horns = [[-18, -28, -60, -62, -30, -14], [18, -28, 60, -62, 30, -14], [-34, -8, -64, -18, -30, 6], [34, -8, 64, -18, 30, 6]];
  return { up, lo, horns, eyes: [[-14, -6], [14, -6]], inner: [[0, -34, 0, 30], [-34, -8, 14, 28], [34, -8, -14, 28], [-18, -28, 0, 30], [18, -28, 0, 30]] };
}
function cosp_hydra(c, t, W, H) {
  // falling code
  const strip = cosp_codeStrip(c), SH = strip.__h, spr = strip.__pr;
  c.save();
  c.fillStyle = '#E8FFFF'; c.beginPath();
  for (let i = 0; i < 24; i++) {
    const x = i*26.7 + 6, sp = 30 + cosp_hash(i*1.3)*60, off = (t*sp + cosp_hash(i*7.7)*SH) % SH, a = 0.12 + cosp_hash(i*4.4)*0.22;
    c.globalAlpha = a;
    // one call per column: the strip holds its glyph run twice, so a 360-tall window always fits
    const sc = i % 8, cw = strip.__cw*spr;
    c.drawImage(strip, sc*cw, (SH - off)*spr, cw, Math.min(360, SH)*spr, x - 2, 0, strip.__cw, Math.min(360, SH));
    c.rect(x + 3, (off*1.7) % 360, 6, 2);
  }
  c.globalAlpha = 0.8; c.fill();
  c.globalAlpha = 1; c.restore();
  // corrupted grid floor
  const hz = 236;
  c.save(); c.beginPath(); c.rect(0, hz, 640, 124); c.clip();
  c.globalCompositeOperation = 'lighter';
  const gtick = Math.floor(t*6);
  c.lineWidth = 1/cosp_px; // hairlines: converging long strokes are expensive when wider than 1 device px
  for (let pass = 0; pass < 2; pass++) {
    c.strokeStyle = pass ? 'rgba(62,230,255,0.9)' : 'rgba(255,70,225,0.8)'; c.beginPath();
    for (let i = -22; i <= 22; i++) {
      const broken = cosp_hash(i*3.1 + gtick*0.37) > 0.9; if (broken !== !!pass) continue;
      const sh = broken ? (cosp_hash(i + gtick) - 0.5)*24 : 0;
      c.moveTo(320 + i*14 + sh, hz); c.lineTo(320 + i*150 + sh, 380);
    }
    c.stroke();
  }
  for (let k = 0; k < 16; k++) {
    const d = 16 - cosp_fr(t*0.6 + k/16)*16 + 0.6, y = hz + 128/d; if (y > 362) continue;
    const a = Math.min(0.9, 0.12 + 1.6/d);
    const h = cosp_hash(k*7.3 + gtick*0.71), seg = h > 0.8;
    c.strokeStyle = 'rgba(255,60,220,' + a.toFixed(3) + ')';
    if (!seg) c.fillStyle = c.strokeStyle, c.fillRect(0, y, 640, 1 + 3/d);
    else { c.fillStyle = 'rgba(62,230,255,' + a.toFixed(3) + ')'; const dx = (h - 0.9)*200; c.fillRect(dx, y, 260, 1 + 3/d); c.fillRect(300 - dx, y + 2, 340, 1 + 3/d); }
  }
  // corrupted tiles
  for (let i = 0; i < 7; i++) {
    const h = cosp_hash(i*5.9 + gtick*0.13); if (h < 0.35) continue;
    const gx = Math.floor(cosp_hash(i*2.1 + gtick)*14) - 7, gy = 1 + Math.floor(cosp_hash(i*8.3 + gtick)*5);
    const y0 = hz + 128/(gy + 1.2), y1 = hz + 128/(gy + 0.2), x0 = 320 + gx*14 + (gx*136)*(y0 - hz)/144, x1 = 320 + (gx + 1)*14 + ((gx + 1)*136)*(y0 - hz)/144;
    c.fillStyle = i % 2 ? 'rgba(62,230,255,0.25)' : 'rgba(255,60,220,0.3)'; c.fillRect(x0, y0, Math.max(6, x1 - x0), y1 - y0);
  }
  c.restore();
  // hydra
  const necks = [
    { bx: 262, by: 300, hx: 150 + Math.sin(t*0.9)*16, hy: 132 + Math.sin(t*1.3 + 1)*12, kind: 0, flip: -1, ph: 0.0, rot: Math.sin(t*1.1)*0.12 - 0.1 },
    { bx: 378, by: 300, hx: 490 + Math.sin(t*0.8 + 2)*16, hy: 128 + Math.sin(t*1.2 + 3)*12, kind: 0, flip: 1, ph: 2.0, rot: Math.sin(t*0.95 + 1)*0.12 - 0.1 },
    { bx: 320, by: 280, hx: 320 + Math.sin(t*0.7 + 4)*12, hy: 96 + Math.sin(t*1.0)*8, kind: 1, flip: 1, ph: 4.0, rot: Math.sin(t*0.8)*0.06 }
  ];
  const glitchQ = cosp_fr(t*0.31), burst = glitchQ < 0.09 || (glitchQ > 0.5 && glitchQ < 0.53);
  const split = burst ? 5 + 3*Math.sin(t*40) : 1.6 + Math.sin(t*3)*0.6;
  // body mass
  const body = cosp_mirror([0, 250, 40, 254, 92, 278, 132, 320, 150, 372, 0, 372]);
  const bodyInner = [[0, 250, -60, 372], [0, 250, 60, 372], [-92, 278, 0, 330], [92, 278, 0, 330], [-132, 320, 132, 320], [0, 330, 0, 372], [-40, 254, -132, 320], [40, 254, 132, 320]];
  // precompute neck tubes
  const tubes = necks.map(nk => {
    const P = cosp_bez(nk.bx, nk.by, nk.bx + (nk.hx - nk.bx)*0.1 + Math.sin(t*1.4 + nk.ph)*10, nk.by - 90, nk.hx - (nk.hx - nk.bx)*0.25 + Math.sin(t*1.1 + nk.ph)*20, nk.hy + 70, nk.hx, nk.hy + 16, 14);
    return { P, nk };
  });
  // pass 1: dark fills
  c.save(); c.translate(320, 0); cosp_path(c, body, true); c.fillStyle = 'rgba(8,10,34,0.92)'; c.fill(); c.restore();
  tubes.forEach(tb => { tb.E = cosp_tube(c, tb.P, s => 46 - s*24); c.fillStyle = 'rgba(8,12,38,0.9)'; c.fill(); });
  // pixel blocks along necks
  tubes.forEach(tb => {
    const P = tb.P, n = P.length/2;
    for (let i = 1; i < n - 1; i++) {
      const s = i/(n - 1), sz = Math.round((20 - s*9)/4)*4, x = Math.round(P[i*2]/4)*4, y = Math.round(P[i*2 + 1]/4)*4;
      const lit = 0.5 + 0.5*Math.sin(t*4 - i*0.6 + tb.nk.ph);
      c.fillStyle = 'rgba(20,' + (60 + lit*80 | 0) + ',140,0.9)'; c.fillRect(x - sz/2, y - sz/2, sz, sz);
      c.fillStyle = 'rgba(62,230,255,' + (0.2 + lit*0.5).toFixed(2) + ')'; c.fillRect(x - sz/2, y - sz/2, sz, 2);
    }
  });
  // heads: transform local geometry to world space once, so wire passes can be batched
  const heads = necks.map(nk => {
    const open = 6 + 6*(0.5 + 0.5*Math.sin(t*1.6 + nk.ph)), h = cosp_hydraHead(c, nk.kind, open, t);
    const S = nk.kind ? 1.45 : 1.5, r = nk.rot*nk.flip, cr = Math.cos(r), sr = Math.sin(r);
    const X = (x, y) => nk.hx + cr*x*nk.flip*S - sr*y*S, Y = (x, y) => nk.hy + sr*x*nk.flip*S + cr*y*S;
    const xf = a => { const o = []; for (let i = 0; i < a.length; i += 2) o.push(X(a[i], a[i + 1]), Y(a[i], a[i + 1])); return o; };
    return { nk, open, S, X, Y, up: xf(h.up), lo: xf(h.lo), horns: h.horns.map(xf), inner: h.inner.map(xf), eyes: h.eyes.map(e => [X(e[0], e[1]), Y(e[0], e[1])]) };
  });
  // head fills, teeth, mouth glow
  c.fillStyle = 'rgba(10,14,44,0.95)'; c.beginPath();
  heads.forEach(hd => { cosp_path(c, hd.up, true); c.fill(); cosp_path(c, hd.lo, true); c.fill(); });
  heads.forEach(hd => {
    const nk = hd.nk, open = hd.open;
    const mx = nk.kind ? 0 : 44, my = nk.kind ? 34 + open*0.5 : 10 + open*0.5;
    cosp_glow(c, hd.X(mx, my), hd.Y(mx, my), 30, '255,50,220', 0.75);
  });
  c.fillStyle = '#E8FFFF'; c.beginPath();
  heads.forEach(hd => {
    const tri = (a, b, d, e, f, g) => { c.moveTo(hd.X(a, b), hd.Y(a, b)); c.lineTo(hd.X(d, e), hd.Y(d, e)); c.lineTo(hd.X(f, g), hd.Y(f, g)); };
    if (hd.nk.kind) for (let k = -2; k <= 2; k++) { tri(k*5 - 1.6, 29, k*5, 35, k*5 + 1.6, 29); tri(k*4 - 1.4, 46 + hd.open, k*4, 40 + hd.open, k*4 + 1.4, 46 + hd.open); }
    else for (let k = 0; k < 5; k++) { const x = 18 + k*8; tri(x - 1.6, 8, x, 13, x + 1.6, 8); tri(x - 1.6, 10 + hd.open, x + 2, 5 + hd.open, x + 3.4, 10 + hd.open); }
  });
  c.fill();
  // pass 2: RGB-split wireframe, one stroke per colour channel
  c.save();
  for (let mode = 1; mode <= 3; mode++) {
    const off = mode === 1 ? -split : mode === 2 ? split : 0;
    c.globalCompositeOperation = mode < 3 ? 'lighter' : 'source-over';
    c.strokeStyle = mode === 1 ? 'rgba(255,40,200,0.65)' : mode === 2 ? 'rgba(40,220,255,0.65)' : 'rgba(150,245,255,0.95)';
    c.lineWidth = mode === 3 ? 1.4 : 1/cosp_px;
    c.save(); c.translate(off, 0);
    c.beginPath();
    const pl = (a, close) => { c.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) c.lineTo(a[i], a[i + 1]); if (close) c.closePath(); };
    for (let i = 0; i < body.length; i += 2) { const x = 320 + body[i], y = body[i + 1]; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath();
    bodyInner.forEach(q => { c.moveTo(320 + q[0], q[1]); c.lineTo(320 + q[2], q[3]); });
    tubes.forEach(tb => { pl(tb.E.L, false); pl(tb.E.R, false); });
    heads.forEach(hd => { pl(hd.up, true); pl(hd.lo, true); hd.horns.forEach(q => pl(q, false)); });
    c.stroke();
    if (mode === 3) {
      c.strokeStyle = 'rgba(62,230,255,0.35)'; c.lineWidth = 0.8/cosp_px; c.beginPath();
      tubes.forEach(tb => { const E = tb.E; for (let i = 0; i < E.n; i++) { c.moveTo(E.L[i*2], E.L[i*2 + 1]); c.lineTo(E.R[i*2], E.R[i*2 + 1]); if (i < E.n - 1) { c.moveTo(E.L[i*2], E.L[i*2 + 1]); c.lineTo(E.R[i*2 + 2], E.R[i*2 + 3]); } } });
      heads.forEach(hd => hd.inner.forEach(q => pl(q, false)));
      c.stroke();
      c.fillStyle = 'rgba(62,230,255,0.9)'; c.beginPath();
      heads.forEach(hd => { for (let i = 0; i < hd.up.length; i += 2) c.rect(hd.up[i] - 1.3, hd.up[i + 1] - 1.3, 2.6, 2.6); });
      c.fill();
    }
    c.restore();
  }
  c.restore();
  c.save(); c.globalCompositeOperation = 'lighter';
  heads.forEach(hd => hd.eyes.forEach(e => cosp_glow(c, e[0], e[1], 20, '255,40,200', 0.95)));
  c.restore();
  c.fillStyle = '#FFE6FA'; c.beginPath(); heads.forEach(hd => hd.eyes.forEach(e => c.rect(e[0] - 4.5, e[1] - 2.5, 9, 5))); c.fill();
  c.fillStyle = '#FF2EC8'; c.beginPath(); heads.forEach(hd => hd.eyes.forEach(e => c.rect(e[0] - 1.2, e[1] - 2.5, 2.4, 5))); c.fill();
  // core in the chest
  const cp = 0.5 + 0.5*Math.sin(t*2.6);
  cosp_glow(c, 320, 312, 60, '255,40,200', 0.45 + 0.3*cp);
  c.save(); c.translate(320, 312); c.rotate(Math.PI/4 + t*0.5); c.strokeStyle = '#FFB8F2'; c.lineWidth = 1.5; c.strokeRect(-12, -12, 24, 24); c.rotate(-t); c.strokeStyle = '#7CF4FF'; c.strokeRect(-7, -7, 14, 14); c.restore();
  // pixel dissolve particles
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) {
    const nk = necks[i % 3], h = cosp_hash(i*2.9), q = cosp_fr(t*(0.18 + h*0.2) + cosp_hash(i*6.6));
    const x = nk.hx + (cosp_hash(i*4.1) - 0.5)*120 + q*30*(cosp_hash(i) - 0.5), y = nk.hy + (cosp_hash(i*7.3) - 0.3)*80 - q*70;
    const s = Math.round(2 + h*4), a = (1 - q)*0.8;
    c.fillStyle = (i % 2 ? 'rgba(62,230,255,' : 'rgba(255,60,220,') + a.toFixed(3) + ')';
    c.fillRect(Math.round(x/3)*3, Math.round(y/3)*3, s, s);
  }
  c.restore();
  // RGB tear: copy the portrait region once, then paste shifted horizontal slices of it
  const D = cosp_dev;
  if (burst && D && c.canvas) {
    const cv = c.canvas, x0 = Math.max(0, Math.round(D.x)), y0 = Math.max(0, Math.round(D.y));
    const pw = Math.min(cv.width, Math.round(D.x + D.w)) - x0, ph = Math.min(cv.height, Math.round(D.y + D.h)) - y0;
    if (pw > 4 && ph > 4) {
      const sc = cosp_scratch || (cosp_scratch = document.createElement('canvas'));
      if (sc.width < pw) sc.width = pw; if (sc.height < ph) sc.height = ph;
      const sg = sc.getContext('2d');
      try {
        sg.clearRect(0, 0, pw, ph); sg.drawImage(cv, x0, y0, pw, ph, 0, 0, pw, ph);
        c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
        c.beginPath(); c.rect(x0, y0, pw, ph); c.clip();
        const tick = Math.floor(t*24), ky = ph/360;
        for (let k = 0; k < 5; k++) {
          const sy = Math.round(cosp_hash(k*3.3 + tick)*340*ky), sh = Math.max(1, Math.min(ph - sy, Math.round((4 + cosp_hash(k*7.1 + tick)*22)*ky))), dx = Math.round((cosp_hash(k*5.7 + tick) - 0.5)*40*ky);
          c.drawImage(sc, 0, sy, pw, sh, x0 + dx, y0 + sy, pw, sh);
          c.globalCompositeOperation = 'lighter'; c.fillStyle = k % 2 ? 'rgba(255,40,200,0.18)' : 'rgba(40,220,255,0.18)'; c.fillRect(x0, y0 + sy, pw, sh); c.globalCompositeOperation = 'source-over';
        }
        c.restore();
      } catch (e) { /* tainted or unsupported: skip the tear */ }
    }
  }
  void W; void H;
}

function drawRaidPortrait(c, id, W, H, t, opts) {
  if (!c || !cosp_IDS[id]) return false;
  W = +W || 0; H = +H || 0; if (!(W > 0 && H > 0)) return true;
  t = +t || 0;
  c.save();
  try {
    c.beginPath(); c.rect(0, 0, W, H); c.clip();
    c.lineCap = 'butt'; c.lineJoin = 'miter'; c.miterLimit = 4; c.shadowBlur = 0; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
    const st = { leviathan: cosp_levStatic, colossus: cosp_colStatic, solarion: cosp_solStatic, hydra: cosp_hydStatic }[id];
    cosp_static(c, id, W, H, st);
    cosp_dev = null; cosp_px = 1;
    try { const m = c.getTransform(); if (Math.abs(m.b) < 1e-6 && Math.abs(m.c) < 1e-6) cosp_dev = { x: m.e, y: m.f, w: W*m.a, h: H*m.d }; cosp_px = Math.abs(m.a)*Math.max(W/640, H/360); } catch (e) { cosp_dev = null; }
    c.save(); cosp_view(c, W, H);
    if (id === 'leviathan') cosp_leviathan(c, t);
    else if (id === 'colossus') cosp_colossus(c, t);
    else if (id === 'solarion') cosp_solarion(c, t);
    else cosp_hydra(c, t, W, H);
    c.restore();
    cosp_static(c, id + '#ov', W, H, g => cosp_overlay(g, id));
    if (opts && opts.dim) {
      c.globalAlpha = 0.92; c.globalCompositeOperation = 'saturation'; c.fillStyle = '#808080'; c.fillRect(0, 0, W, H);
      c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.fillStyle = 'rgba(8,6,18,0.55)'; c.fillRect(0, 0, W, H);
    }
  } catch (e) { if (typeof window !== 'undefined' && window.__cospDebug) console.error(e); }
  c.restore();
  return true;
}

