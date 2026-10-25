// =====================================================================
// PRESTIGE  (prestige.js)
//   drawPrestigeBadge(c, p, lv, x, y, r, t)   level badge for prestige p (0..12), level lv, centred at x,y
//   PRESTIGE_NAMES[13], PRESTIGE_COLS[13]
//   drawHat5(c, hat, col, t)                  hats:  laurel   (Level 10)
//   drawSkin5(c, s, look, L, Wd, t)           skins: chevron  (Level 25)
//   drawAura5(c, id, hw, t, col)              auras: wings    (Level 45)
//   drawBallSkin5(c, id, x, y, r, t, vx, vy)  balls: legend   (Level 60)
// Cosmetic draws return true when the id was handled. Helpers are pr5_-prefixed.
// Deterministic (no Math.random), canvas state restored, errors swallowed.
// Badges are drawn in "units": radius 50 == r px (everything fits inside ~57 units).
// =====================================================================
const PRESTIGE_NAMES = ['Rookie', 'Spark', 'Twin Chevron', 'Bronze Guard', 'Silver Wing', 'Gold Star', 'Emerald Orbit', 'Sapphire Crown', 'Amethyst Eye', 'Ruby Inferno', 'Obsidian Dragon', 'Celestial', 'Apex'];
const PRESTIGE_COLS = ['#FFD84A', '#3EE6FF', '#FF4F8B', '#D98A4A', '#C9D6E8', '#FFC93A', '#2EE88A', '#3D7BFF', '#B57CFF', '#FF2E4D', '#FF5A1F', '#8FB8FF', '#F0E6FF'];

let pr5_A = 1; // base alpha of the current draw
function pr5_h(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function pr5_al(c, a) { c.globalAlpha = pr5_A*a; }
function pr5_triPts(cx, cy, R, rot) { rot = rot || 0; return [0, 1, 2].map(k => [cx + Math.cos(rot + k*TAU/3 - Math.PI/2)*R, cy + Math.sin(rot + k*TAU/3 - Math.PI/2)*R]); }
function pr5_scale(pts, cx, cy, k) { return pts.map(p => [cx + (p[0] - cx)*k, cy + (p[1] - cy)*k]); }
function pr5_rpoly(c, pts, rad) {
  const n = pts.length; c.beginPath();
  c.moveTo((pts[n - 1][0] + pts[0][0])/2, (pts[n - 1][1] + pts[0][1])/2);
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; c.arcTo(p[0], p[1], (p[0] + q[0])/2, (p[1] + q[1])/2, rad); }
  c.closePath();
}
function pr5_lg(c, x0, y0, x1, y1, cols) { const g = c.createLinearGradient(x0, y0, x1, y1); cols.forEach((col, i) => g.addColorStop(i/(cols.length - 1), col)); return g; }
function pr5_rg(c, x, y, r0, r1, cols) { const g = c.createRadialGradient(x, y, r0, x, y, r1); cols.forEach((col, i) => g.addColorStop(i/(cols.length - 1), col)); return g; }
function pr5_holo(c, cx, cy, rot, R) {
  const C = ['#3EE6FF', '#7CFFB2', '#FFE34A', '#FFB23E', '#FF4F8B', '#B57CFF', '#3EE6FF'];
  let g;
  if (c.createConicGradient) g = c.createConicGradient(rot, cx, cy);
  else g = c.createLinearGradient(cx - R*Math.cos(rot), cy - R*Math.sin(rot), cx + R*Math.cos(rot), cy + R*Math.sin(rot));
  C.forEach((col, i) => g.addColorStop(i/(C.length - 1), col));
  return g;
}
// leaf / feather / flame sub-paths (no beginPath: callers batch them)
function pr5_leaf(c, x, y, a, len, w) {
  const ca = Math.cos(a), sa = Math.sin(a), tx = x + ca*len, ty = y + sa*len, mx = x + ca*len*0.45, my = y + sa*len*0.45, nx = -sa*w, ny = ca*w;
  c.moveTo(x, y); c.quadraticCurveTo(mx + nx, my + ny, tx, ty); c.quadraticCurveTo(mx - nx, my - ny, x, y);
}
function pr5_flame(c, x, y, w, h, sway) {
  c.moveTo(x - w/2, y); c.quadraticCurveTo(x - w*0.55, y - h*0.55, x + sway, y - h);
  c.quadraticCurveTo(x + w*0.55, y - h*0.55, x + w/2, y); c.quadraticCurveTo(x, y + w*0.35, x - w/2, y);
}
function pr5_chev(c, x, y, w, h, th) {
  poly(c, [[x - w/2, y + h/2 - th], [x, y - h/2], [x + w/2, y + h/2 - th], [x + w/2, y + h/2], [x, y - h/2 + th], [x - w/2, y + h/2]]);
}
function pr5_star5(c, x, y, R, ri, rot) {
  c.beginPath();
  for (let k = 0; k < 10; k++) { const a = rot - Math.PI/2 + k*Math.PI/5, rr2 = k % 2 ? ri : R; k ? c.lineTo(x + Math.cos(a)*rr2, y + Math.sin(a)*rr2) : c.moveTo(x + Math.cos(a)*rr2, y + Math.sin(a)*rr2); }
  c.closePath();
}
function pr5_rays(c, n, r0, rl, rs, rot, w) {
  c.beginPath();
  for (let k = 0; k < n; k++) {
    const a = rot + k*TAU/n, R = k % 2 ? rs : rl, ww = w*(k % 2 ? 0.7 : 1);
    c.moveTo(Math.cos(a - ww)*r0, Math.sin(a - ww)*r0); c.lineTo(Math.cos(a)*R, Math.sin(a)*R); c.lineTo(Math.cos(a + ww)*r0, Math.sin(a + ww)*r0); c.closePath();
  }
}
// laurel branch along an arc, growing from angle a0 to a1
function pr5_laurel(c, cx, cy, R, a0, a1, n, len, wid) {
  const dir = a1 > a0 ? 1 : -1;
  c.beginPath();
  for (let k = 0; k < n; k++) {
    const u = (k + 0.4)/n, a = a0 + (a1 - a0)*u, px = cx + Math.cos(a)*R, py = cy + Math.sin(a)*R, tg = a + dir*Math.PI/2, sz = len*(1 - 0.3*u);
    pr5_leaf(c, px, py, tg - 0.62, sz, wid*sz/len); pr5_leaf(c, px, py, tg + 0.62, sz, wid*sz/len);
  }
  const px = cx + Math.cos(a1)*R, py = cy + Math.sin(a1)*R; pr5_leaf(c, px, py, a1 + dir*Math.PI/2, len*0.75, wid*0.75);
}
// a feathered wing pointing to +x, root at origin; row 0 = flight feathers, row 1 = coverts
function pr5_feathers(c, sc, row, n, wk) {
  wk = wk || 1;
  for (let i = n - 1; i >= 0; i--) {
    const u = i/(n - 1), v = 1 - u;
    const bx = 2*v*u*0.32*sc + u*u*0.72*sc, by = 2*v*u*(-0.95*sc) + u*u*(-0.8*sc);
    const a = 1.2 - u*1.4, L = row ? sc*(0.2 + 0.18*u) : sc*(0.34 + 0.48*u);
    pr5_leaf(c, bx, by, a, L, L*(row ? 0.5 : 0.32)*wk);
  }
}
// heraldic wing silhouette, root at origin, tip near (1,-0.8)
const PR5_WT = [[1.0, -0.8], [0.98, -0.52], [0.9, -0.26], [0.76, -0.02], [0.56, 0.18], [0.32, 0.26]];
const PR5_WN = [[0.72, -0.56], [0.68, -0.36], [0.6, -0.16], [0.48, 0.0], [0.3, 0.08]];
function pr5_wingSil(c) {
  c.beginPath(); c.moveTo(0, 0.06); c.quadraticCurveTo(0.12, -0.6, 0.55, -0.74); c.quadraticCurveTo(0.85, -0.84, 1.0, -0.8);
  for (let i = 0; i < PR5_WN.length; i++) { c.lineTo(PR5_WN[i][0], PR5_WN[i][1]); const q = PR5_WT[i + 1]; c.quadraticCurveTo(q[0] + 0.05, q[1] - 0.06, q[0], q[1]); }
  c.lineTo(0.06, 0.16); c.closePath();
}
function pr5_wingArm(c, sc) { c.moveTo(0, 0); c.quadraticCurveTo(0.32*sc, -0.95*sc, 0.72*sc, -0.8*sc); }
function pr5_glint(c, x, y, sz, t, period, phase) {
  const f = (((t + phase)/period) % 1 + 1) % 1; if (f > 0.16) return;
  const a = Math.sin(f/0.16*Math.PI);
  c.save(); c.globalCompositeOperation = 'lighter'; pr5_al(c, a); c.fillStyle = '#FFFFFF'; star4(c, x, y, sz*(0.4 + 0.6*a)); c.restore();
}
// shiny band sweeping across whatever clip is active
function pr5_sweep(c, t, period, w, alpha) {
  const u = ((t/period) % 1)*2.4 - 1.2; if (Math.abs(u) > 1.05) return;
  const x = u*80;
  c.save(); c.globalCompositeOperation = 'lighter'; c.rotate(0.45); pr5_al(c, alpha);
  c.fillStyle = pr5_lg(c, x - w, 0, x + w, 0, ['rgba(255,255,255,0)', 'rgba(255,255,255,1)', 'rgba(255,255,255,0)']);
  c.fillRect(x - w, -100, w*2, 200); c.restore();
}
function pr5_crown(c, by, w, h, gems, t, lo) {
  const P = [[-w/2, by], [-w*0.56, by - h*0.74], [-w*0.26, by - h*0.4], [0, by - h], [w*0.26, by - h*0.4], [w*0.56, by - h*0.74], [w/2, by]];
  c.fillStyle = pr5_lg(c, 0, by - h, 0, by, ['#FFF6C0', '#FFD84A', '#E2A01A', '#8A5A06']);
  c.strokeStyle = '#4A2E00'; c.lineWidth = Math.max(1.4, h*0.07);
  poly(c, P); c.fill(); c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.35)'; poly(c, [[-w*0.42, by - h*0.12], [-w*0.5, by - h*0.6], [-w*0.26, by - h*0.3], [0, by - h*0.86], [0, by - h*0.12]]); c.fill();
  c.fillStyle = pr5_lg(c, 0, by - h*0.26, 0, by, ['#FFE98A', '#B87A0A']); c.fillRect(-w/2, by - h*0.24, w, h*0.24); c.strokeRect(-w/2, by - h*0.24, w, h*0.24);
  [[-w*0.56, by - h*0.74], [0, by - h], [w*0.56, by - h*0.74]].forEach(p => { c.fillStyle = '#FFF6C0'; c.beginPath(); c.arc(p[0], p[1], h*0.1, 0, TAU); c.fill(); c.stroke(); });
  gems.forEach((g, i) => {
    const gx = (i - (gems.length - 1)/2)*w*0.3, gy = by - h*0.12, gr = h*(i === (gems.length - 1)/2 ? 0.13 : 0.1);
    c.fillStyle = g; c.beginPath(); c.moveTo(gx, gy - gr); c.lineTo(gx + gr, gy); c.lineTo(gx, gy + gr); c.lineTo(gx - gr, gy); c.closePath(); c.fill();
    if (!lo) { c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(gx - gr*0.3, gy - gr*0.3, gr*0.28, 0, TAU); c.fill(); }
  });
}
function pr5_num(c, lv, y, fill, glow, S, maxW) {
  const s = String(Math.max(0, Math.floor(+lv || 0)));
  let fs = s.length >= 3 ? 23 : 28;
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.font = fs + 'px "Rubik Mono One", ui-monospace, monospace';
  const w = c.measureText(s).width; if (w > maxW) { fs *= maxW/w; c.font = fs.toFixed(2) + 'px "Rubik Mono One", ui-monospace, monospace'; }
  y += fs*0.04;
  pr5_al(c, 0.95); c.lineWidth = fs*0.3; c.strokeStyle = '#08061A'; c.strokeText(s, 0, y);
  pr5_al(c, 1);
  if (glow) { c.shadowColor = glow; c.shadowBlur = Math.max(2, 9*S); }
  c.fillStyle = fill; c.fillText(s, 0, y);
  c.restore();
}
function pr5_paddle(c, x, y, a, len, col, S, dim) {
  c.save(); c.translate(x, y); c.rotate(a); c.lineCap = 'round';
  pr5_al(c, dim); c.shadowColor = col; c.shadowBlur = 10*S; c.strokeStyle = col; c.lineWidth = 6.5;
  c.beginPath(); c.moveTo(-len/2, 0); c.lineTo(len/2, 0); c.stroke(); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(-len*0.38, -1.4); c.lineTo(len*0.38, -1.4); c.stroke();
  c.restore();
}

// ------------------------------- the 13 badges -------------------------------
// p0 Rookie: clean hexagon
function pr5_b0(c, lv, t, S, lo) {
  const H = [0, 1, 2, 3, 4, 5].map(k => [Math.cos(k/6*TAU + Math.PI/6)*46, Math.sin(k/6*TAU + Math.PI/6)*46]);
  c.fillStyle = '#16112E'; poly(c, H); c.fill();
  c.strokeStyle = '#FFD84A'; c.lineWidth = 5.5; c.stroke();
  if (!lo) { c.strokeStyle = 'rgba(255,216,74,0.28)'; c.lineWidth = 1.5; poly(c, pr5_scale(H, 0, 0, 0.8)); c.stroke(); }
  pr5_num(c, lv, 1, '#FFD84A', null, S, 64);
}
// p1 Spark: cyan neon triangle, one chevron, spark on the apex
function pr5_b1(c, lv, t, S, lo) {
  const T = pr5_triPts(0, 7, 55);
  c.shadowColor = '#3EE6FF'; c.shadowBlur = 12*S*(0.8 + 0.2*Math.sin(t*2.2));
  c.fillStyle = pr5_lg(c, 0, -48, 0, 34, ['#0F3550', '#081828', '#060E1C']); pr5_rpoly(c, T, 6); c.fill();
  c.strokeStyle = '#3EE6FF'; c.lineWidth = 5.5; c.stroke(); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(190,248,255,0.35)'; c.lineWidth = 1.4; pr5_rpoly(c, pr5_scale(T, 0, 7, 0.8), 4); c.stroke();
  c.shadowColor = '#3EE6FF'; c.shadowBlur = 8*S; c.fillStyle = '#7FF2FF'; pr5_chev(c, 0, -17, 28, 14, 6); c.fill(); c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,255,255,0.65)'; pr5_chev(c, 0, -18.2, 24, 11.5, 2); c.fill();
  pr5_num(c, lv, 18, '#E6FCFF', null, S, 64);
  const tw = 0.6 + 0.4*Math.sin(t*3.1);
  c.save(); c.globalCompositeOperation = 'lighter'; c.shadowColor = '#3EE6FF'; c.shadowBlur = 10*S; c.fillStyle = '#FFFFFF';
  star4(c, 0, -48, 7 + 4*tw); pr5_al(c, 0.5*tw); star4(c, 0, -48, 15*tw); c.restore();
}
// p2 Twin Chevron: pink bowed triangle shield, two chevrons
function pr5_p2path(c, k) {
  c.beginPath(); c.moveTo(0, -52*k); c.lineTo(48*k, 22*k); c.quadraticCurveTo(26*k, 44*k, 0, 47*k); c.quadraticCurveTo(-26*k, 44*k, -48*k, 22*k); c.closePath();
}
function pr5_b2(c, lv, t, S, lo) {
  c.shadowColor = '#FF4F8B'; c.shadowBlur = 12*S;
  c.fillStyle = pr5_lg(c, 0, -50, 0, 46, ['#5A1038', '#2A0820', '#160414']); pr5_p2path(c, 1); c.fill();
  c.strokeStyle = '#FF4F8B'; c.lineWidth = 6; c.stroke(); c.shadowBlur = 0;
  c.strokeStyle = '#FFB0CC'; c.lineWidth = 1.6; pr5_p2path(c, 0.8); c.stroke();
  c.save(); pr5_p2path(c, 1); c.clip(); pr5_sweep(c, t, 4.5, 10, 0.35); c.restore();
  c.shadowColor = '#FF4F8B'; c.shadowBlur = 7*S; c.fillStyle = '#FF7FAA';
  pr5_chev(c, 0, -28, 18, 9, 4.5); c.fill(); pr5_chev(c, 0, -16, 28, 12, 5.5); c.fill(); c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,255,255,0.55)'; pr5_chev(c, 0, -29, 15, 7, 1.6); c.fill(); pr5_chev(c, 0, -17.2, 24, 9.5, 1.8); c.fill();
  pr5_num(c, lv, 14, '#FFE6EF', null, S, 64);
  pr5_glint(c, 0, -50, 9, t, 3.2, 0); pr5_glint(c, 46, 21, 7, t, 3.2, 1.1); pr5_glint(c, -46, 21, 7, t, 3.2, 2.2);
}
// p3 Bronze Guard: bronze heater shield with laurel sprigs
function pr5_heater(c, k, oy) {
  c.beginPath(); c.moveTo(-38*k, -38*k + oy); c.lineTo(0, -46*k + oy); c.lineTo(38*k, -38*k + oy); c.lineTo(38*k, 2*k + oy);
  c.quadraticCurveTo(36*k, 32*k + oy, 0, 50*k + oy); c.quadraticCurveTo(-36*k, 32*k + oy, -38*k, 2*k + oy); c.closePath();
}
function pr5_b3(c, lv, t, S, lo) {
  // sprigs
  c.fillStyle = pr5_lg(c, 0, -30, 0, 50, ['#F6C58E', '#C9803E', '#7A4216']); c.strokeStyle = '#3E1E08'; c.lineWidth = lo ? 1.8 : 1.1;
  pr5_laurel(c, 0, 2, 47, Math.PI*0.62, Math.PI*1.18, lo ? 4 : 6, 14, 7); c.fill(); c.stroke();
  pr5_laurel(c, 0, 2, 47, Math.PI*0.38, -Math.PI*0.18, lo ? 4 : 6, 14, 7); c.fill(); c.stroke();
  // shield
  c.fillStyle = pr5_lg(c, -30, -46, 30, 50, ['#FFD3A0', '#D88A46', '#8A4A1C', '#C67A3A', '#5A2C0E']);
  pr5_heater(c, 1, 0); c.fill(); c.strokeStyle = '#2E1404'; c.lineWidth = 3; c.stroke();
  c.save(); pr5_heater(c, 1, 0); c.clip(); pr5_sweep(c, t, 5, 9, 0.45); c.restore();
  c.fillStyle = pr5_rg(c, 0, -4, 4, 44, ['#3E2010', '#1C0C04']); pr5_heater(c, 0.76, 1); c.fill();
  c.strokeStyle = 'rgba(255,214,168,0.6)'; c.lineWidth = 1.4; c.stroke();
  c.fillStyle = '#E9A060'; poly(c, pr5_triPts(0, -21, 9)); c.fill();
  pr5_num(c, lv, 9, '#FFE6C8', null, S, 56);
  pr5_glint(c, 30, -36, 7, t, 4, 0.5);
}
// p4 Silver Wing: silver triangle with spread wings
function pr5_b4(c, lv, t, S, lo) {
  const fl = Math.sin(t*1.6)*0.05;
  for (const s of [-1, 1]) {
    c.save(); c.translate(s*14, -2); c.scale(s*39, 39); c.rotate(-0.06 + fl);
    pr5_wingSil(c);
    c.fillStyle = pr5_lg(c, 0, -0.8, 0.6, 0.3, ['#FFFFFF', '#C9D3E2', '#7A869C']); c.fill();
    c.strokeStyle = '#1E2430'; c.lineWidth = (lo ? 2.4 : 1.6)/39; c.stroke();
    if (!lo) { c.strokeStyle = 'rgba(40,50,70,0.55)'; c.lineWidth = 1/39; c.beginPath(); PR5_WN.forEach(n => { c.moveTo(n[0], n[1]); c.lineTo(n[0]*0.55, n[1]*0.55 - 0.22); }); c.stroke(); }
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 5/39; c.beginPath(); c.moveTo(0.05, -0.05); c.quadraticCurveTo(0.17, -0.5, 0.55, -0.66); c.stroke();
    c.restore();
  }
  const T = pr5_triPts(0, 8, 50);
  c.fillStyle = pr5_lg(c, -30, -40, 30, 34, ['#FFFFFF', '#B8C4D6', '#6A768C', '#D6DEEA', '#8892A6']); pr5_rpoly(c, T, 5); c.fill();
  c.strokeStyle = '#1E2430'; c.lineWidth = 2.6; c.stroke();
  c.save(); pr5_rpoly(c, T, 5); c.clip(); pr5_sweep(c, t, 4, 10, 0.55); c.restore();
  c.fillStyle = pr5_lg(c, 0, -26, 0, 30, ['#24304A', '#0C1222']); pr5_rpoly(c, pr5_scale(T, 0, 8, 0.78), 3); c.fill();
  c.strokeStyle = 'rgba(230,240,255,0.5)'; c.lineWidth = 1.2; c.stroke();
  pr5_num(c, lv, 17, '#F2F6FF', null, S, 60);
  pr5_glint(c, 0, -40, 8, t, 3.6, 0);
}
// p5 Gold Star: gold triangle with a star and rotating rays
function pr5_b5(c, lv, t, S, lo) {
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = pr5_rg(c, 0, 0, 10, 58, ['rgba(255,220,90,0.95)', 'rgba(255,170,30,0.45)', 'rgba(255,150,20,0)']);
  pr5_rays(c, lo ? 12 : 16, 14, 58, 46, t*0.25, 0.11); c.fill(); c.restore();
  const T = pr5_triPts(0, 7, 51);
  c.shadowColor = '#FFB23E'; c.shadowBlur = 10*S;
  c.fillStyle = pr5_lg(c, -30, -44, 30, 32, ['#FFF6B8', '#FFC93A', '#A86C08', '#FFE07A', '#B07A10']); pr5_rpoly(c, T, 5); c.fill(); c.shadowBlur = 0;
  c.strokeStyle = '#4A2E00'; c.lineWidth = 2.6; c.stroke();
  c.save(); pr5_rpoly(c, T, 5); c.clip(); pr5_sweep(c, t, 3.6, 10, 0.6); c.restore();
  c.fillStyle = pr5_lg(c, 0, -26, 0, 30, ['#3A2604', '#1A0E00']); pr5_rpoly(c, pr5_scale(T, 0, 7, 0.78), 3); c.fill();
  c.strokeStyle = 'rgba(255,230,140,0.55)'; c.lineWidth = 1.2; c.stroke();
  c.shadowColor = '#FFD84A'; c.shadowBlur = 8*S; c.fillStyle = pr5_lg(c, 0, -26, 0, -4, ['#FFFFFF', '#FFE27A', '#FFB23E']);
  pr5_star5(c, 0, -13, 11.5, 4.8, 0); c.fill(); c.shadowBlur = 0;
  pr5_num(c, lv, 18, '#FFF3C8', null, S, 58);
  pr5_glint(c, 0, -44, 9, t, 2.8, 0); pr5_glint(c, 43, 31, 7, t, 2.8, 0.9); pr5_glint(c, -43, 31, 7, t, 2.8, 1.8);
}
// p6 Emerald Orbit: cut emerald with a ping-pong ball on a rotating ring
function pr5_b6(c, lv, t, S, lo) {
  const rot = -0.38, RX = 57, RY = 15, a = t*1.5;
  const ring = (a0, a1, al) => { c.save(); c.rotate(rot); pr5_al(c, al); c.strokeStyle = '#7CFFC0'; c.lineWidth = 3; c.shadowColor = '#2EE88A'; c.shadowBlur = 8*S; c.beginPath(); c.ellipse(0, 0, RX, RY, 0, a0, a1); c.stroke(); c.restore(); };
  const ball = () => { const bx = Math.cos(a)*RX, by = Math.sin(a)*RY, x = bx*Math.cos(rot) - by*Math.sin(rot), y = bx*Math.sin(rot) + by*Math.cos(rot), sc = 0.8 + 0.2*Math.sin(a);
    c.save(); c.shadowColor = '#7CFFC0'; c.shadowBlur = 10*S; c.fillStyle = pr5_rg(c, x - 1.5, y - 1.5, 0.5, 6*sc, ['#FFFFFF', '#E8FFF2', '#9AE8C0']); c.beginPath(); c.arc(x, y, 5.5*sc, 0, TAU); c.fill(); c.restore(); };
  ring(Math.PI, TAU, 0.55); if (Math.sin(a) < 0) ball();
  const G = [[0, -55], [42, 0], [0, 55], [-42, 0]], I = pr5_scale(G, 0, 0, 0.48);
  c.shadowColor = '#2EE88A'; c.shadowBlur = 12*S; c.fillStyle = '#0E7A45'; poly(c, G); c.fill(); c.shadowBlur = 0;
  const F = ['#4FFFB0', '#16A85E', '#0A5A32', '#1FCF78'];
  for (let k = 0; k < 4; k++) { c.fillStyle = F[k]; poly(c, [G[k], G[(k + 1) % 4], I[(k + 1) % 4], I[k]]); c.fill(); }
  c.fillStyle = pr5_lg(c, -20, -26, 20, 26, ['#9CFFD0', '#2EE88A', '#0E8A4E']); poly(c, I); c.fill();
  c.strokeStyle = '#063A20'; c.lineWidth = 2.4; poly(c, G); c.stroke();
  c.strokeStyle = 'rgba(220,255,236,0.6)'; c.lineWidth = 1; poly(c, I); c.stroke();
  if (!lo) { c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(G[k][0], G[k][1]); c.lineTo(I[k][0], I[k][1]); } c.stroke(); }
  c.save(); poly(c, G); c.clip(); pr5_sweep(c, t, 3.8, 8, 0.5); c.restore();
  ring(0, Math.PI, 0.95); if (Math.sin(a) >= 0) ball();
  pr5_num(c, lv, 2, '#F0FFF6', null, S, 62);
  pr5_glint(c, 0, -55, 9, t, 3, 0.4);
}
// p7 Sapphire Crown: faceted sapphire crest under a golden crown
function pr5_b7(c, lv, t, S, lo) {
  const P = [[-43, -14], [43, -14], [43, 16], [0, 55], [-43, 16]];
  c.shadowColor = '#3D7BFF'; c.shadowBlur = 12*S;
  c.fillStyle = pr5_rg(c, -8, 4, 4, 58, ['#7FB0FF', '#2F64E8', '#12309A', '#081650']); pr5_rpoly(c, P, 4); c.fill(); c.shadowBlur = 0;
  if (!lo) {
    c.strokeStyle = 'rgba(170,205,255,0.35)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(-43, -14); c.lineTo(-18, 12); c.lineTo(18, 12); c.lineTo(43, -14); c.moveTo(-18, 12); c.lineTo(0, 55); c.lineTo(18, 12); c.moveTo(-43, 16); c.lineTo(-18, 12); c.moveTo(43, 16); c.lineTo(18, 12); c.stroke();
  }
  c.strokeStyle = pr5_lg(c, 0, -14, 0, 55, ['#FFF2A0', '#E2A01A', '#FFE07A']); c.lineWidth = 4.5; pr5_rpoly(c, P, 4); c.stroke();
  c.save(); pr5_rpoly(c, P, 4); c.clip(); pr5_sweep(c, t, 4.2, 9, 0.4); c.restore();
  pr5_crown(c, -12, 64, 42, ['#FF3A5A', '#3D7BFF', '#FF3A5A'], t, lo);
  pr5_num(c, lv, 19, '#EEF4FF', null, S, 62);
  pr5_glint(c, -36, -43, 7, t, 3.3, 0); pr5_glint(c, 0, -54, 8, t, 3.3, 1.1); pr5_glint(c, 36, -43, 7, t, 3.3, 2.2);
}
// p8 Amethyst Eye: purple triangle with a glowing all-seeing eye
function pr5_b8(c, lv, t, S, lo) {
  const pulse = 0.5 + 0.5*Math.sin(t*2.4);
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = pr5_rg(c, 0, -12, 6, 60, ['rgba(200,150,255,' + (0.55 + 0.25*pulse) + ')', 'rgba(150,80,255,0.25)', 'rgba(120,60,255,0)']);
  pr5_rays(c, 12, 10, 60, 50, -t*0.18, 0.08); c.fill(); c.restore();
  const T = pr5_triPts(0, 5, 56);
  c.shadowColor = '#B57CFF'; c.shadowBlur = (9 + 6*pulse)*S;
  c.fillStyle = pr5_lg(c, 0, -50, 0, 33, ['#4A1A86', '#24083E', '#12041E']); pr5_rpoly(c, T, 6); c.fill();
  c.strokeStyle = '#C69BFF'; c.lineWidth = 5.5; c.stroke(); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(232,212,255,0.45)'; c.lineWidth = 1.3; pr5_rpoly(c, pr5_scale(T, 0, 5, 0.82), 4); c.stroke();
  // eye
  const ey = -11, cyc = t % 5.2, bl = cyc < 0.22 ? Math.abs(Math.cos(cyc/0.22*Math.PI)) : 1, eh = 9.5*Math.max(0.12, bl);
  const eye = () => { c.beginPath(); c.moveTo(-19, ey); c.quadraticCurveTo(0, ey - eh*2, 19, ey); c.quadraticCurveTo(0, ey + eh*2, -19, ey); c.closePath(); };
  c.shadowColor = '#D9B8FF'; c.shadowBlur = (8 + 8*pulse)*S; c.fillStyle = '#F6EEFF'; eye(); c.fill(); c.shadowBlur = 0;
  c.save(); eye(); c.clip();
  const ix = Math.sin(t*0.7)*4.5, iy = ey + Math.sin(t*0.53)*1.2;
  c.fillStyle = pr5_rg(c, ix, iy, 1, 8, ['#FFFFFF', '#D8B4FF', '#8A3AE8', '#3A0A7A']); c.beginPath(); c.arc(ix, iy, 8, 0, TAU); c.fill();
  c.fillStyle = '#12021E'; c.beginPath(); c.ellipse(ix, iy, 2, 4.4, 0, 0, TAU); c.fill();
  c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(ix - 2.6, iy - 2.6, 1.5, 0, TAU); c.fill();
  c.restore();
  c.strokeStyle = '#2A0A48'; c.lineWidth = 1.8; eye(); c.stroke();
  if (!lo) { c.strokeStyle = 'rgba(230,205,255,0.75)'; c.lineWidth = 1.4; c.beginPath(); for (let k = -2; k <= 2; k++) { const an = -Math.PI/2 + k*0.42; c.moveTo(Math.cos(an)*15, ey + Math.sin(an)*15 - 3); c.lineTo(Math.cos(an)*(20 + (k % 2 ? 0 : 3)), ey + Math.sin(an)*(20 + (k % 2 ? 0 : 3)) - 3); } c.stroke(); }
  pr5_num(c, lv, 19, '#F6EEFF', null, S, 62);
}
// p9 Ruby Inferno: faceted ruby wreathed in flames
function pr5_b9(c, lv, t, S, lo) {
  const N = lo ? 9 : 13;
  c.save(); c.globalCompositeOperation = 'lighter';
  const pass = (k0, wk, hk, col, al) => {
    c.beginPath();
    for (let k = 0; k < N; k++) {
      const a = Math.PI*0.5 + (k/(N - 1) - 0.5)*TAU*0.92, bx = Math.cos(a)*36, by = Math.sin(a)*30 + 8;
      const up = 0.55 + 0.45*(1 - (by + 30)/70), f = 0.75 + 0.25*Math.sin(t*(7 + pr5_h(k)*5) + k*2.3) + 0.12*Math.sin(t*15 + k);
      pr5_flame(c, bx, by, 15*wk, (14 + 28*up)*f*hk, Math.sin(t*4 + k*1.7)*4*hk + bx*0.12);
    }
    c.fillStyle = col; pr5_al(c, al); c.fill();
  };
  pass(0, 1, 1, '#FF2A10', 0.8); pass(0, 0.7, 0.72, '#FF8A1A', 0.85); if (!lo) pass(0, 0.42, 0.45, '#FFE36A', 0.9);
  c.restore();
  const T = pr5_triPts(0, 8, 48), I = pr5_scale(T, 0, 8, 0.52);
  c.shadowColor = '#FF2E4D'; c.shadowBlur = 12*S; c.fillStyle = '#B00C28'; poly(c, T); c.fill(); c.shadowBlur = 0;
  const F = ['#FF5A74', '#C80E30', '#7A0018'];
  for (let k = 0; k < 3; k++) { c.fillStyle = F[k]; poly(c, [T[k], T[(k + 1) % 3], I[(k + 1) % 3], I[k]]); c.fill(); }
  c.fillStyle = pr5_lg(c, -10, -12, 12, 22, ['#FF8A9C', '#E01A3C', '#9A0A22']); poly(c, I); c.fill();
  c.strokeStyle = '#FFB23E'; c.lineWidth = 3; c.lineJoin = 'round'; poly(c, T); c.stroke();
  c.strokeStyle = 'rgba(255,220,220,0.5)'; c.lineWidth = 1; poly(c, I); c.stroke();
  c.save(); poly(c, T); c.clip(); pr5_sweep(c, t, 2.8, 8, 0.45); c.restore();
  pr5_num(c, lv, 17, '#FFF0E8', null, S, 60);
  if (!lo) for (let k = 0; k < 5; k++) { const u = (t*0.55 + pr5_h(k + 9)) % 1; c.save(); c.globalCompositeOperation = 'lighter'; pr5_al(c, Math.sin(u*Math.PI)); c.fillStyle = '#FFD060'; c.beginPath(); c.arc((pr5_h(k*3.1) - 0.5)*60 + Math.sin(t*3 + k)*3, 10 - u*62, 1.4, 0, TAU); c.fill(); c.restore(); }
}
// p10 Obsidian Dragon: black dragon crest, membrane wings, horns, ember eyes
function pr5_b10(c, lv, t, S, lo) {
  const fl = Math.sin(t*1.3)*0.06, glow = 0.6 + 0.4*Math.sin(t*2.7);
  for (const s of [-1, 1]) {
    c.save(); c.translate(s*16, -16); c.scale(s, 1); c.rotate(fl);
    const B = [[0, 0], [26, -32], [42, -26]], tips = [[44, -18], [43, 2], [34, 22]];
    c.beginPath(); c.moveTo(0, 0); c.lineTo(B[1][0], B[1][1]); c.lineTo(B[2][0], B[2][1]); c.lineTo(tips[0][0], tips[0][1]);
    c.quadraticCurveTo(34, -6, tips[1][0], tips[1][1]); c.quadraticCurveTo(28, 8, tips[2][0], tips[2][1]); c.quadraticCurveTo(14, 14, 4, 26); c.closePath();
    c.fillStyle = pr5_lg(c, 0, -30, 40, 20, ['#7A1A1C', '#3A0A0E', '#140406']); c.fill();
    c.shadowColor = '#FF3A1F'; c.shadowBlur = 8*S*glow; c.strokeStyle = '#FF4A26'; c.lineWidth = 2; c.stroke(); c.shadowBlur = 0;
    c.strokeStyle = '#C8402A'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(26, -32); c.lineTo(42, -26);
    tips.forEach(p => { c.moveTo(26, -32); c.lineTo(p[0], p[1]); }); c.stroke();
    c.fillStyle = '#C8B8A8'; c.beginPath(); c.moveTo(42, -26); c.lineTo(50, -32); c.lineTo(44, -22); c.closePath(); c.fill();
    c.restore();
  }
  // horns
  for (const s of [-1, 1]) {
    c.beginPath(); c.moveTo(s*24, -30); c.quadraticCurveTo(s*30, -46, s*20, -58); c.quadraticCurveTo(s*40, -48, s*38, -30); c.closePath();
    c.fillStyle = pr5_lg(c, 0, -58, 0, -30, ['#F2E2CC', '#9A7A68', '#3A2420']); c.fill(); c.strokeStyle = '#140608'; c.lineWidth = 1.6; c.stroke();
  }
  const P = [[-50, -32], [50, -32], [0, 52]];
  c.fillStyle = pr5_lg(c, -20, -32, 20, 52, ['#3A3446', '#14101A', '#060408', '#221A2A']); pr5_rpoly(c, P, 6); c.fill();
  c.shadowColor = '#FF2A1A'; c.shadowBlur = 10*S*glow; c.strokeStyle = '#E8281E'; c.lineWidth = 3.4; c.stroke(); c.shadowBlur = 0;
  c.save(); pr5_rpoly(c, P, 6); c.clip();
  pr5_al(c, 0.55 + 0.45*glow); c.strokeStyle = '#FF6A1A'; c.lineWidth = 1.5; c.beginPath();
  c.moveTo(-50, -10); c.lineTo(-34, -6); c.lineTo(-28, 4); c.moveTo(50, -6); c.lineTo(36, -2); c.lineTo(31, 10); c.moveTo(-6, 52); c.lineTo(-3, 38); c.lineTo(4, 32); c.stroke();
  pr5_al(c, 1); pr5_sweep(c, t, 5, 7, 0.25);
  c.restore();
  // ember eyes
  c.save(); c.shadowColor = '#FFB23E'; c.shadowBlur = 8*S*glow; c.fillStyle = '#FFC24A';
  for (const s of [-1, 1]) { c.beginPath(); c.moveTo(s*8, -21); c.quadraticCurveTo(s*16, -26, s*25, -22); c.quadraticCurveTo(s*16, -18, s*8, -21); c.closePath(); c.fill(); }
  c.shadowBlur = 0; c.fillStyle = '#2A0400'; for (const s of [-1, 1]) { c.fillRect(s*16 - 0.8, -24.5, 1.6, 5.5); }
  c.restore();
  pr5_num(c, lv, 4, '#FFE8D8', null, S, 62);
  if (!lo) { c.save(); c.globalCompositeOperation = 'lighter'; for (let k = 0; k < 9; k++) { const u = (t*(0.35 + pr5_h(k)*0.3) + pr5_h(k + 4)) % 1; pr5_al(c, Math.sin(u*Math.PI)*0.95); c.fillStyle = k % 3 ? '#FF6A1A' : '#FFD060'; c.fillRect((pr5_h(k*2.7) - 0.5)*90 + Math.sin(t*2 + k)*4, 50 - u*104, 2.2, 2.2); } c.restore(); }
}
// p11 Celestial: midnight disc with constellation, orbiting planets and a comet
function pr5_b11(c, lv, t, S, lo) {
  const orb = (rot, rx, ry, a, back, draw) => { const s = Math.sin(a); if ((s < 0) !== back) return; const bx = Math.cos(a)*rx, by = s*ry; draw(bx*Math.cos(rot) - by*Math.sin(rot), bx*Math.sin(rot) + by*Math.cos(rot), 0.8 + 0.2*s); };
  const ell = (rot, rx, ry, a0, a1, al) => { c.save(); c.rotate(rot); pr5_al(c, al); c.strokeStyle = '#A8C8FF'; c.lineWidth = 1.3; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, a0, a1); c.stroke(); c.restore(); };
  const planet1 = (x, y, k) => { c.fillStyle = pr5_rg(c, x - 2, y - 2, 0.5, 6.5*k, ['#FFF2C8', '#FFB23E', '#8A4A10']); c.beginPath(); c.arc(x, y, 5.5*k, 0, TAU); c.fill(); c.strokeStyle = '#FFE0A0'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y, 9.5*k, 2.6*k, -0.4, 0, TAU); c.stroke(); };
  const planet2 = (x, y, k) => { c.fillStyle = pr5_rg(c, x - 1.5, y - 1.5, 0.5, 5*k, ['#E8FFFF', '#4FD8FF', '#1A4A9A']); c.beginPath(); c.arc(x, y, 4.2*k, 0, TAU); c.fill(); };
  const a1 = t*0.9, a2 = -t*1.25 + 2;
  // star frame behind
  c.save(); c.rotate(t*0.12); c.fillStyle = pr5_rg(c, 0, 0, 20, 58, ['#CFE0FF', '#8FB8FF', 'rgba(143,184,255,0.1)']); star4(c, 0, 0, 58); c.rotate(Math.PI/4); pr5_al(c, 0.6); star4(c, 0, 0, 50); c.restore();
  ell(0.42, 56, 13, Math.PI, TAU, 0.45); ell(-0.62, 52, 17, Math.PI, TAU, 0.45);
  orb(0.42, 56, 13, a1, true, planet1); orb(-0.62, 52, 17, a2, true, planet2);
  c.shadowColor = '#8FB8FF'; c.shadowBlur = 12*S;
  c.fillStyle = pr5_rg(c, -8, -8, 2, 44, ['#3A3EA8', '#1C1E6A', '#0A0A2E']); c.beginPath(); c.arc(0, 0, 40, 0, TAU); c.fill(); c.shadowBlur = 0;
  c.strokeStyle = '#DDE8FF'; c.lineWidth = 3; c.stroke();
  // star field + constellation triangle
  c.fillStyle = '#FFFFFF';
  for (let k = 0; k < (lo ? 8 : 18); k++) { const a = pr5_h(k)*TAU, d = 8 + pr5_h(k + 20)*28; pr5_al(c, 0.35 + 0.65*Math.abs(Math.sin(t*(1 + pr5_h(k + 7)*2) + k))); c.fillRect(Math.cos(a)*d - 0.7, Math.sin(a)*d - 0.7, 1.4, 1.4); }
  pr5_al(c, 1);
  const C3 = pr5_triPts(0, 2, 29, Math.sin(t*0.3)*0.08);
  c.strokeStyle = 'rgba(200,220,255,0.55)'; c.lineWidth = 1.1; poly(c, C3); c.stroke();
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#FFFFFF'; C3.forEach((p, i) => star4(c, p[0], p[1], 4.5 + 1.5*Math.sin(t*2.3 + i*2))); c.restore();
  // comet around the rim
  const ca = t*0.7; c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < (lo ? 6 : 14); k++) { const a = ca - k*0.045; pr5_al(c, (1 - k/14)*0.8); c.fillStyle = k ? '#9FD8FF' : '#FFFFFF'; c.beginPath(); c.arc(Math.cos(a)*45, Math.sin(a)*45, 3 - k*0.17, 0, TAU); c.fill(); }
  c.restore();
  ell(0.42, 56, 13, 0, Math.PI, 0.9); ell(-0.62, 52, 17, 0, Math.PI, 0.9);
  orb(0.42, 56, 13, a1, false, planet1); orb(-0.62, 52, 17, a2, false, planet2);
  pr5_num(c, lv, 3, '#FFFFFF', '#8FB8FF', S, 60);
}
// p12 Apex: prismatic triangle, crown, three orbiting player paddles, rainbow light
function pr5_b12(c, lv, t, S, lo) {
  const PC = ['#3EE6FF', '#FF4F8B', '#FFB23E'];
  // rotating rainbow light
  c.save(); c.globalCompositeOperation = 'lighter';
  c.fillStyle = pr5_holo(c, 0, 0, t*0.6, 60); pr5_al(c, 0.5); pr5_rays(c, lo ? 12 : 18, 10, 60, 48, t*0.3, 0.09); c.fill();
  pr5_al(c, 0.55); c.fillStyle = pr5_rg(c, 0, 4, 4, 60, ['rgba(255,255,255,0.9)', 'rgba(200,170,255,0.35)', 'rgba(120,80,255,0)']); c.beginPath(); c.arc(0, 4, 60, 0, TAU); c.fill();
  c.restore();
  const pads = [0, 1, 2].map(k => { const a = t*1.1 + k*TAU/3; return { a, x: Math.cos(a)*56, y: Math.sin(a)*17 + 12, k }; });
  const drawPad = p => { const s = Math.sin(p.a); pr5_paddle(c, p.x, p.y, Math.atan2(Math.cos(p.a)*17, -Math.sin(p.a)*56), 20*(0.85 + 0.15*s), PC[p.k], S, s < 0 ? 0.6 : 1); };
  if (!lo) { c.save(); c.rotate(0); pr5_al(c, 0.35); c.strokeStyle = '#FFFFFF'; c.lineWidth = 1; c.beginPath(); c.ellipse(0, 12, 56, 17, 0, Math.PI, TAU); c.stroke(); c.restore(); }
  pads.filter(p => Math.sin(p.a) < 0).forEach(drawPad);
  const T = pr5_triPts(0, 10, 50), I = pr5_scale(T, 0, 10, 0.74);
  c.shadowColor = 'hsl(' + ((t*80) % 360) + ',100%,70%)'; c.shadowBlur = 14*S;
  c.fillStyle = pr5_holo(c, 0, 10, t*0.9, 50); pr5_rpoly(c, T, 4); c.fill(); c.shadowBlur = 0;
  // bevel facets
  c.fillStyle = 'rgba(255,255,255,0.28)'; poly(c, [T[0], T[1], I[1], I[0]]); c.fill();
  c.fillStyle = 'rgba(20,0,60,0.28)'; poly(c, [T[1], T[2], I[2], I[1]]); c.fill();
  c.strokeStyle = '#FFF6D0'; c.lineWidth = 2.2; pr5_rpoly(c, T, 4); c.stroke();
  c.save(); pr5_rpoly(c, T, 4); c.clip(); pr5_sweep(c, t, 2.6, 9, 0.7); c.restore();
  c.fillStyle = pr5_lg(c, 0, -20, 0, 34, ['#2A1650', '#0E0826']); poly(c, I); c.fill();
  c.strokeStyle = pr5_holo(c, 0, 10, -t*1.4, 40); c.lineWidth = 1.6; poly(c, I); c.stroke();
  pr5_crown(c, -30, 46, 27, PC, t, lo);
  pads.filter(p => Math.sin(p.a) >= 0).forEach(drawPad);
  pr5_num(c, lv, 20, '#FFFFFF', 'hsl(' + ((t*80 + 180) % 360) + ',100%,70%)', S, 54);
  // sparkles
  const n = lo ? 3 : 7;
  for (let k = 0; k < n; k++) { const a = pr5_h(k + 3)*TAU, d = 34 + pr5_h(k + 11)*22; pr5_glint(c, Math.cos(a)*d, Math.sin(a)*d, 5 + pr5_h(k)*5, t, 1.6 + pr5_h(k + 5), pr5_h(k + 8)*3); }
}
const PR5_BADGES = [pr5_b0, pr5_b1, pr5_b2, pr5_b3, pr5_b4, pr5_b5, pr5_b6, pr5_b7, pr5_b8, pr5_b9, pr5_b10, pr5_b11, pr5_b12];

function drawPrestigeBadge(c, p, lv, x, y, r, t) {
  p = Math.max(0, Math.min(12, Math.floor(+p || 0))); t = +t || 0; r = +r || 16;
  const S = r/50;
  c.save();
  try {
    pr5_A = c.globalAlpha;
    c.translate(x, y); c.scale(S, S);
    c.shadowBlur = 0; c.globalCompositeOperation = 'source-over'; if (c.setLineDash) c.setLineDash([]);
    c.lineJoin = 'round'; c.lineCap = 'round';
    PR5_BADGES[p](c, lv, t, S, r < 34);
  } catch (e) { /* never break the frame */ }
  c.restore();
  pr5_A = 1;
}

// ================================ COSMETICS ================================
// HAT: Laurel crown (Level 10)
function pr5_hatLaurel(c, col, t) {
  const cy = -7.6, R = 7.4;
  c.lineJoin = 'round';
  c.shadowColor = 'rgba(255,210,80,0.8)'; c.shadowBlur = 6;
  c.fillStyle = pr5_lg(c, 0, -16, 0, 1, ['#FFF6B8', '#FFD84A', '#D9960E', '#9A6406']);
  c.strokeStyle = '#6A4004'; c.lineWidth = 0.28;
  pr5_laurel(c, 0, cy, R, Math.PI*0.56, Math.PI*1.36, 6, 3.3, 1.7); c.fill(); c.shadowBlur = 0; c.stroke();
  c.shadowBlur = 6; pr5_laurel(c, 0, cy, R, Math.PI*0.44, -Math.PI*0.36, 6, 3.3, 1.7); c.fill(); c.shadowBlur = 0; c.stroke();
  c.strokeStyle = '#B07A0A'; c.lineWidth = 0.45; c.beginPath(); c.arc(0, cy, R, Math.PI*0.56, Math.PI*1.36); c.stroke(); c.beginPath(); c.arc(0, cy, R, -Math.PI*0.36, Math.PI*0.44); c.stroke();
  // ribbon + gem at the tie
  c.fillStyle = col || '#FF4F8B';
  c.beginPath(); c.moveTo(-0.6, -0.6); c.lineTo(-3.4, 1); c.lineTo(-2.6, -0.2); c.lineTo(-3.2, -1.2); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(0.6, -0.6); c.lineTo(3.4, 1); c.lineTo(2.6, -0.2); c.lineTo(3.2, -1.2); c.closePath(); c.fill();
  c.fillStyle = '#FFE58A'; c.beginPath(); c.arc(0, -0.6, 1.55, 0, TAU); c.fill();
  c.fillStyle = col || '#FF4F8B'; poly(c, pr5_triPts(0, -0.45, 1.15)); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.arc(-0.35, -0.9, 0.32, 0, TAU); c.fill();
  // glint hopping between leaves
  const k = Math.floor(t/0.9) % 6, side = Math.floor(t/0.9) % 2 ? 1 : -1, f = (t/0.9) % 1;
  if (f < 0.5) {
    const u = (k + 0.4)/6, a = side < 0 ? Math.PI*0.56 + Math.PI*0.8*u : Math.PI*0.44 - Math.PI*0.8*u;
    c.globalCompositeOperation = 'lighter'; c.globalAlpha *= Math.sin(f/0.5*Math.PI); c.fillStyle = '#FFFFFF';
    star4(c, Math.cos(a)*(R + 1.2), cy + Math.sin(a)*(R + 1.2), 1.6);
  }
}
const PR5_HATS = { laurel: pr5_hatLaurel };
function drawHat5(c, hat, col, t) {
  const f = PR5_HATS[hat]; if (!f) return false;
  c.save(); try { f(c, col, +t || 0); } catch (e) {} c.restore();
  return true;
}

// SKIN: Gold chevron on dark steel (Level 25)
function pr5_skChevron(c, look, L, Wd, t) {
  c.fillStyle = pr5_lg(c, 0, -2.2, 0, 2.2, ['#7A8496', '#3A4252', '#1A1E28', '#141820', '#4A5466']); c.fillRect(L, -3, Wd, 6);
  c.strokeStyle = 'rgba(255,255,255,0.07)'; c.lineWidth = 0.2; c.beginPath(); for (let y = -1.8; y < 2; y += 0.7) { c.moveTo(L, y); c.lineTo(L + Wd, y); } c.stroke();
  const sp = 7.5, off = (t*6) % sp;
  c.beginPath();
  for (let x = L - sp*2 + off; x < L + Wd + sp; x += sp) {
    for (const dx of [0, 2.3]) { const X = x + dx; poly2(X); }
  }
  function poly2(X) { c.moveTo(X, -2.6); c.lineTo(X + 1.25, -2.6); c.lineTo(X + 3.05, 0); c.lineTo(X + 1.25, 2.6); c.lineTo(X, 2.6); c.lineTo(X + 1.8, 0); c.closePath(); }
  c.fillStyle = pr5_lg(c, 0, -2.2, 0, 2.2, ['#FFF2A8', '#FFC93A', '#C88A10', '#8A5A06']); c.fill();
  c.strokeStyle = 'rgba(40,24,0,0.7)'; c.lineWidth = 0.22; c.stroke();
  c.fillStyle = 'rgba(255,216,74,0.85)'; c.fillRect(L, -2.05, Wd, 0.3); c.fillRect(L, 1.75, Wd, 0.3);
  const sx = L + ((t*14) % (Wd + 16)) - 8;
  c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,255,255,0.55)';
  c.beginPath(); c.moveTo(sx, -3); c.lineTo(sx + 2.2, -3); c.lineTo(sx - 0.8, 3); c.lineTo(sx - 3, 3); c.closePath(); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(sx + 3, -3); c.lineTo(sx + 3.8, -3); c.lineTo(sx + 0.8, 3); c.lineTo(sx, 3); c.closePath(); c.fill();
}
const PR5_SKINS = { chevron: pr5_skChevron };
function drawSkin5(c, s, look, L, Wd, t) {
  const f = PR5_SKINS[s]; if (!f) return false;
  c.save(); try { f(c, look || {}, L, Wd, +t || 0); } catch (e) {} c.restore();
  return true;
}

// AURA: Neon wings (Level 45)
function pr5_auWings(c, A0, hw, t, col) {
  col = col || '#3EE6FF';
  const fl = Math.sin(t*1.7), sc = hw*0.62 + 7;
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = A0*0.35; c.fillStyle = pr5_rg(c, 0, -5, 1, hw + 14, [col, 'rgba(0,0,0,0)']);
  c.beginPath(); c.ellipse(0, -5, hw + 14, 13, 0, 0, TAU); c.fill();
  for (const s of [-1, 1]) {
    c.save(); c.translate(s*hw*0.42, -0.6); c.scale(s, 1); c.rotate(-0.1 - fl*0.2);
    c.beginPath(); pr5_feathers(c, sc, 0, 7);
    c.globalAlpha = A0*0.28; c.strokeStyle = col; c.lineWidth = 2.2; c.stroke();
    c.globalAlpha = A0*0.55; c.fillStyle = col; c.fill();
    c.globalAlpha = A0*0.9; c.strokeStyle = '#FFFFFF'; c.lineWidth = 0.32; c.stroke();
    c.beginPath(); pr5_feathers(c, sc, 1, 6);
    c.globalAlpha = A0*0.55; c.fillStyle = '#FFFFFF'; c.fill();
    c.globalAlpha = A0*0.9; c.strokeStyle = col; c.lineWidth = 0.3; c.stroke();
    c.globalAlpha = A0; c.strokeStyle = '#FFFFFF'; c.lineWidth = 0.7; c.lineCap = 'round'; c.beginPath(); pr5_wingArm(c, sc); c.stroke();
    c.restore();
  }
  // drifting light motes shed from the wingtips
  c.fillStyle = '#FFFFFF';
  for (let k = 0; k < 8; k++) {
    const u = (t*0.45 + pr5_h(k)) % 1, s = k % 2 ? 1 : -1, x = s*(hw*0.42 + sc*(0.5 + pr5_h(k + 3)*0.8)) + Math.sin(t*2 + k)*1.2, y = -sc*0.7 + u*14;
    c.globalAlpha = A0*Math.sin(u*Math.PI)*0.9; star4(c, x, y, 0.6 + 0.6*pr5_h(k + 6));
  }
}
const PR5_AURAS = { wings: pr5_auWings };
function drawAura5(c, id, hw, t, col) {
  const f = PR5_AURAS[id]; if (!f) return false;
  c.save(); try { const A0 = c.globalAlpha; c.shadowBlur = 0; f(c, A0, +hw || 14, +t || 0, col); } catch (e) {} c.restore();
  return true;
}

// BALL: Legend orb (Level 60)
function pr5_ballLegend(c, A0, x, y, r, t, vx, vy) {
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = A0*0.5; c.fillStyle = pr5_rg(c, x, y, r*0.4, r*2.3, ['rgba(255,220,110,0.9)', 'rgba(255,180,40,0.25)', 'rgba(255,160,20,0)']);
  c.beginPath(); c.arc(x, y, r*2.3, 0, TAU); c.fill();
  c.save(); c.translate(x, y); c.globalAlpha = A0*0.7;
  c.fillStyle = pr5_rg(c, 0, 0, r*0.6, r*2.2, ['rgba(255,250,220,0.9)', 'rgba(255,210,90,0)']);
  pr5_rays(c, 10, r*0.7, r*2.2, r*1.6, t*0.7, 0.1); c.fill(); c.restore();
  c.globalCompositeOperation = 'source-over'; c.globalAlpha = A0;
  // laurel ring
  c.fillStyle = '#FFD84A'; c.strokeStyle = '#8A5A06'; c.lineWidth = Math.max(0.3, r*0.04);
  pr5_laurel(c, x, y, r*1.18, Math.PI*0.55, Math.PI*1.38, 5, r*0.48, r*0.24); c.fill(); c.stroke();
  pr5_laurel(c, x, y, r*1.18, Math.PI*0.45, -Math.PI*0.38, 5, r*0.48, r*0.24); c.fill(); c.stroke();
  // orb
  c.fillStyle = pr5_rg(c, x - r*0.35, y - r*0.4, r*0.05, r*1.05, ['#FFFFFF', '#FFF6D0', '#FFD84A', '#C8860E', '#7A4A04']);
  c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,246,200,0.9)'; c.lineWidth = Math.max(0.4, r*0.07); c.stroke();
  // triangle crest (slowly turning)
  const T = pr5_triPts(x, y + r*0.04, r*0.46, Math.sin(t*1.3)*0.25);
  c.fillStyle = '#FFFFFF'; c.strokeStyle = '#B07A0A'; c.lineWidth = Math.max(0.35, r*0.08); c.lineJoin = 'round'; poly(c, T); c.stroke(); c.fill();
  c.fillStyle = '#FFC93A'; poly(c, pr5_triPts(x, y + r*0.04, r*0.2, Math.sin(t*1.3)*0.25 + Math.PI)); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.beginPath(); c.ellipse(x - r*0.38, y - r*0.46, r*0.24, r*0.14, -0.6, 0, TAU); c.fill();
  // glint
  const f = (t % 1.8)/1.8;
  if (f < 0.2) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = A0*Math.sin(f/0.2*Math.PI); c.fillStyle = '#FFFFFF'; star4(c, x + r*0.55, y - r*0.55, r*0.8); }
}
const PR5_BALLS = { legend: pr5_ballLegend };
function drawBallSkin5(c, id, x, y, r, t, vx, vy) {
  const f = PR5_BALLS[id]; if (!f) return false;
  c.save(); try { const A0 = c.globalAlpha; c.shadowBlur = 0; f(c, A0, x, y, r, +t || 0, vx || 0, vy || 0); } catch (e) {} c.restore();
  return true;
}


