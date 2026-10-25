// ================= extra profile cosmetics (borders / backgrounds / emblems) =================
// Entry points: drawCardBorder2, drawCardBg2, drawEmblem2 -> return true when the id was handled.
// Helpers are all cos_-prefixed. Everything is deterministic (no Math.random) and resets canvas state.

function cos_h(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function cos_rng(seed) { let h = (seed*2654435761) >>> 0 || 1; return () => (h = (h*1103515245 + 12345) >>> 0) / 4294967296; }
function cos_lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i/(stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; }
function cos_addPoly(c, pts) { pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }
// point + inward normal along a rounded rectangle (same shape as rr), u in 0..1, clockwise from top-left
function cos_rrp(u, x, y, w, h, R) {
  const a = w - 2*R, b = h - 2*R, q = Math.PI*R/2, P = 2*a + 2*b + 4*q;
  let d = ((u % 1) + 1) % 1 * P;
  const arc = (cx, cy, a0, dd) => { const an = a0 + dd/R; return [cx + Math.cos(an)*R, cy + Math.sin(an)*R, -Math.cos(an), -Math.sin(an)]; };
  if (d < a) return [x + R + d, y, 0, 1]; d -= a;
  if (d < q) return arc(x + w - R, y + R, -Math.PI/2, d); d -= q;
  if (d < b) return [x + w, y + R + d, -1, 0]; d -= b;
  if (d < q) return arc(x + w - R, y + h - R, 0, d); d -= q;
  if (d < a) return [x + w - R - d, y + h, 0, -1]; d -= a;
  if (d < q) return arc(x + R, y + h - R, Math.PI/2, d); d -= q;
  if (d < b) return [x, y + h - R - d, 1, 0]; d -= b;
  return arc(x + R, y + R, Math.PI, Math.min(d, q));
}
function cos_rrLen(w, h, R) { return 2*(w - 2*R) + 2*(h - 2*R) + TAU*R; }
function cos_stars(c, W, H, n, maxY, t, tw) {
  c.fillStyle = '#FFFFFF';
  for (let k = 0; k < n; k++) {
    const x = (k*97.31 + 13) % W, y = (k*53.77 + 7) % maxY, s = k % 7 === 0 ? 2 : 1.2;
    c.globalAlpha = 0.25 + (k % 4)*0.15 + (tw && k % 3 === 0 ? 0.3*Math.sin(t*2.2 + k*1.7) : 0);
    c.fillRect(x, y, s, s);
  }
  c.globalAlpha = 1;
}

// ---------- shared motifs ----------
function cos_anchor(c, x, y, s, col) {
  c.save(); c.translate(x, y); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = s*0.17; c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); c.arc(0, -s*0.74, s*0.17, 0, TAU); c.stroke();
  c.beginPath(); c.moveTo(0, -s*0.56); c.lineTo(0, s*0.82); c.moveTo(-s*0.42, -s*0.36); c.lineTo(s*0.42, -s*0.36); c.stroke();
  c.beginPath(); c.arc(0, s*0.18, s*0.62, Math.PI*0.14, Math.PI*0.86); c.stroke();
  [1, -1].forEach(sx => { const ex = sx*s*0.62*Math.cos(Math.PI*0.14), ey = s*0.18 + s*0.62*Math.sin(Math.PI*0.14);
    c.beginPath(); c.moveTo(ex + sx*s*0.08, ey - s*0.34); c.lineTo(ex - sx*s*0.16, ey + s*0.04); c.lineTo(ex + sx*s*0.2, ey + s*0.06); c.closePath(); c.fill(); });
  c.beginPath(); c.arc(0, s*0.84, s*0.1, 0, TAU); c.fill();
  c.restore();
}
function cos_pumpkin(c, x, y, r, glow) { // glow 0..1 = brightness of the carved face
  c.save(); c.translate(x, y); c.lineJoin = 'round';
  c.fillStyle = '#3F7A2A'; c.beginPath(); c.moveTo(-r*0.14, -r*0.66); c.quadraticCurveTo(-r*0.08, -r*1.02, r*0.28, -r*1.08); c.lineTo(r*0.22, -r*0.9); c.quadraticCurveTo(r*0.08, -r*0.86, r*0.14, -r*0.66); c.closePath(); c.fill();
  const g = c.createRadialGradient(-r*0.3, -r*0.35, r*0.05, 0, 0, r*1.1); g.addColorStop(0, '#FFC060'); g.addColorStop(0.55, '#F2761A'); g.addColorStop(1, '#9A3A08');
  c.fillStyle = g; c.strokeStyle = '#8A3206'; c.lineWidth = Math.max(0.6, r*0.07);
  [[-0.42, 0.56], [0.42, 0.56], [0, 0.6]].forEach(([ox, rx]) => { c.beginPath(); c.ellipse(ox*r, r*0.06, rx*r, r*0.76, 0, 0, TAU); c.fill(); c.stroke(); });
  c.beginPath();
  cos_addPoly(c, [[-0.5, -0.1], [-0.16, -0.1], [-0.34, -0.42]].map(p => [p[0]*r, p[1]*r]));
  cos_addPoly(c, [[0.5, -0.1], [0.16, -0.1], [0.34, -0.42]].map(p => [p[0]*r, p[1]*r]));
  cos_addPoly(c, [[-0.08, 0.1], [0.08, 0.1], [0, -0.04]].map(p => [p[0]*r, p[1]*r]));
  cos_addPoly(c, [[-0.56, 0.2], [-0.36, 0.32], [-0.26, 0.23], [-0.1, 0.34], [0.1, 0.34], [0.26, 0.23], [0.36, 0.32], [0.56, 0.2], [0.4, 0.5], [0.2, 0.6], [0.12, 0.48], [-0.12, 0.48], [-0.2, 0.6], [-0.4, 0.5]].map(p => [p[0]*r, p[1]*r]));
  c.fillStyle = '#2A0C02'; c.fill();
  c.globalAlpha = clamp(glow, 0, 1); c.shadowColor = '#FFB020'; c.shadowBlur = r*0.9; c.fillStyle = '#FFE34A'; c.fill();
  c.restore();
}
function cos_bat(c, x, y, s, flap, col, eyes) { // s = half wingspan, flap -1..1
  c.save(); c.translate(x, y); c.fillStyle = col;
  const wy = flap*s*0.45;
  c.beginPath(); c.moveTo(0, -s*0.08);
  [1, -1].forEach((sx, i) => {
    if (i) c.moveTo(0, -s*0.08);
    c.quadraticCurveTo(sx*s*0.45, -s*0.32 + wy*0.4, sx*s, -s*0.18 + wy);
    c.quadraticCurveTo(sx*s*0.88, s*0.02 + wy*0.7, sx*s*0.72, s*0.08 + wy*0.55);
    c.quadraticCurveTo(sx*s*0.62, -s*0.02 + wy*0.4, sx*s*0.46, s*0.14 + wy*0.3);
    c.quadraticCurveTo(sx*s*0.34, s*0.02 + wy*0.2, sx*s*0.2, s*0.18 + wy*0.1);
    c.lineTo(0, s*0.26); c.closePath();
  });
  c.fill();
  c.beginPath(); c.ellipse(0, s*0.06, s*0.13, s*0.22, 0, 0, TAU); c.fill();
  c.beginPath(); c.arc(0, -s*0.1, s*0.13, 0, TAU); c.fill();
  c.beginPath(); cos_addPoly(c, [[-s*0.12, -s*0.12], [-s*0.1, -s*0.34], [-s*0.02, -s*0.18]]); cos_addPoly(c, [[s*0.12, -s*0.12], [s*0.1, -s*0.34], [s*0.02, -s*0.18]]); c.fill();
  if (eyes) { c.fillStyle = eyes; c.fillRect(-s*0.07, -s*0.13, s*0.05, s*0.05); c.fillRect(s*0.02, -s*0.13, s*0.05, s*0.05); }
  c.restore();
}
function cos_shard(c, bx, by, a, len, wid) {
  const ca = Math.cos(a), sa = Math.sin(a), P = (u, v) => [bx + ca*u - sa*v, by + sa*u + ca*v];
  c.fillStyle = cos_lin(c, bx, by, bx + ca*len, by + sa*len, ['#5FB8E0', '#BDEFFF', '#F4FEFF']);
  c.beginPath(); cos_addPoly(c, [P(0, -wid), P(len*0.72, -wid), P(len, 0), P(len*0.72, wid), P(0, wid)]); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.8; c.stroke();
  c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); cos_addPoly(c, [P(0, -wid), P(len*0.72, -wid), P(len, 0), P(0, 0)]); c.fill();
}
function cos_branch(c, x, y, a, len, d, s) {
  const x2 = x + Math.cos(a)*len, y2 = y + Math.sin(a)*len;
  c.lineWidth = Math.max(0.6, d*0.9); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo((x + x2)/2 + (cos_h(s) - 0.5)*len*0.3, (y + y2)/2, x2, y2); c.stroke();
  if (d <= 1) return;
  const sp = 0.32 + cos_h(s*1.3)*0.3;
  cos_branch(c, x2, y2, a - sp, len*(0.66 + cos_h(s*2.1)*0.12), d - 1, s*2 + 1);
  cos_branch(c, x2, y2, a + sp*0.9, len*(0.62 + cos_h(s*3.7)*0.12), d - 1, s*2 + 2);
}
function cos_ghost(c, x, y, r) {
  c.save(); c.translate(x, y);
  c.shadowColor = '#9FF3FF'; c.shadowBlur = r*0.7; c.fillStyle = cos_lin(c, 0, -r, 0, r, ['#FFFFFF', '#E6E0FF', '#B8B0E8']);
  c.beginPath(); c.moveTo(-r*0.7, r*0.75); c.lineTo(-r*0.7, -r*0.1); c.arc(0, -r*0.1, r*0.7, Math.PI, 0); c.lineTo(r*0.7, r*0.75);
  for (let k = 0; k < 4; k++) { const x0 = r*0.7 - k*r*0.35; c.quadraticCurveTo(x0 - r*0.0875, r*(k % 2 ? 0.98 : 0.55), x0 - r*0.175, r*0.78); c.quadraticCurveTo(x0 - r*0.26, r*(k % 2 ? 0.55 : 0.98), x0 - r*0.35, r*0.75); }
  c.closePath(); c.fill();
  c.shadowBlur = 0; c.fillStyle = '#16112E';
  c.beginPath(); c.ellipse(-r*0.26, -r*0.14, r*0.12, r*0.18, 0, 0, TAU); c.ellipse(r*0.26, -r*0.14, r*0.12, r*0.18, 0, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(0, r*0.22, r*0.1, r*0.14, 0, 0, TAU); c.fill();
  c.restore();
}

// =============== BORDERS ===============
function cos_bHarbor(c, W, H) {
  const x = 5, y = 5, w = W - 10, h = H - 10, R = 20;
  const brass = cos_lin(c, 0, 0, W, H, ['#FFE7A0', '#C9921A', '#FFE08A', '#8A5F0A', '#F5D27A']);
  // rope
  c.strokeStyle = '#4A3016'; c.lineWidth = 10; rr(c, x, y, w, h, R); c.stroke();
  c.strokeStyle = cos_lin(c, 0, 0, W, H, ['#D8B47A', '#B88A4A', '#D8B47A']); c.lineWidth = 7.5; c.stroke();
  const n = Math.round(cos_rrLen(w, h, R)/4.5); c.lineCap = 'round';
  for (let k = 0; k < n; k++) {
    const [px, py, nx, ny] = cos_rrp(k/n, x, y, w, h, R), tx = ny, ty = -nx;
    c.strokeStyle = '#6A4620'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(px - nx*3.6 - tx*1.9, py - ny*3.6 - ty*1.9); c.lineTo(px + nx*3.6 + tx*1.9, py + ny*3.6 + ty*1.9); c.stroke();
    c.strokeStyle = 'rgba(255,240,200,0.55)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(px - nx*2.6 - tx*0.2, py - ny*2.6 - ty*0.2); c.lineTo(px + nx*1.5 + tx*1.3, py + ny*1.5 + ty*1.3); c.stroke();
  }
  // brass inner trim with rivets
  const ix = x + 5.5, iy = y + 5.5, iw = w - 11, ih = h - 11, iR = R - 5;
  c.strokeStyle = "#3A2606"; c.lineWidth = 3.6; rr(c, ix, iy, iw, ih, iR); c.stroke();
  c.strokeStyle = brass; c.lineWidth = 2.6; c.stroke();
  const nr = Math.max(12, Math.round(cos_rrLen(iw, ih, iR)/34));
  for (let k = 0; k < nr; k++) {
    const [px, py] = cos_rrp((k + 0.5)/nr, ix, iy, iw, ih, iR);
    if (Math.abs(px - W/2) < 22 && py < H/2) continue;
    c.fillStyle = '#5A3A08'; c.beginPath(); c.arc(px, py, 2.1, 0, TAU); c.fill();
    c.fillStyle = '#F5D27A'; c.beginPath(); c.arc(px - 0.4, py - 0.4, 1.4, 0, TAU); c.fill();
  }
  // corner brass plates
  [[x + 7, y + 7], [x + w - 7, y + 7], [x + w - 7, y + h - 7], [x + 7, y + h - 7]].forEach(([px, py]) => {
    c.fillStyle = '#3A2606'; c.beginPath(); c.arc(px, py, 7, 0, TAU); c.fill();
    c.fillStyle = brass; c.beginPath(); c.arc(px, py, 5.8, 0, TAU); c.fill();
    c.fillStyle = '#5A3A08'; c.beginPath(); c.arc(px, py, 1.8, 0, TAU); c.fill();
  });
  // anchor medallion top centre
  const ax = W/2, ay = y + 4;
  c.fillStyle = '#2A1A06'; c.beginPath(); c.arc(ax, ay, 13.5, 0, TAU); c.fill();
  c.fillStyle = brass; c.beginPath(); c.arc(ax, ay, 12.2, 0, TAU); c.fill();
  c.fillStyle = cos_lin(c, ax, ay - 10, ax, ay + 10, ['#1A2E5A', '#0A1430']); c.beginPath(); c.arc(ax, ay, 9.8, 0, TAU); c.fill();
  cos_anchor(c, ax, ay + 0.5, 7.4, '#F5D27A');
}
function cos_bGlacier(c, W, H) {
  const x = 5, y = 5, w = W - 10, h = H - 10, R = 20;
  const N = Math.max(60, Math.round(cos_rrLen(w, h, R)/9)), inner = [];
  for (let k = 0; k < N; k++) { const [px, py, nx, ny] = cos_rrp(k/N, x, y, w, h, R), d = ((k % 2 ? 10 : 6) + cos_h(k*3.3)*6)*(W === 300 && py < y + 2 && Math.abs(px - (W - 44)) < 26 ? 0.45 : 1); inner.push([px + nx*d, py + ny*d, px, py]); }
  c.shadowColor = '#7FD8FF'; c.shadowBlur = 10;
  c.fillStyle = cos_lin(c, 0, 0, W, H, ['#F2FEFF', '#9FDDF5', '#5AAED8', '#CFF4FF', '#7FC8EA', '#F2FEFF']);
  rr(c, x, y, w, h, R); cos_addPoly(c, inner); c.fill('evenodd');
  c.shadowBlur = 0;
  // facets and cracks inside the ice
  c.lineWidth = 0.8;
  for (let k = 0; k < N; k++) { const p = inner[k]; c.strokeStyle = k % 3 ? 'rgba(255,255,255,0.35)' : 'rgba(30,90,150,0.35)'; if (k % 2 === 0) { c.beginPath(); c.moveTo(p[2], p[3]); c.lineTo(p[0], p[1]); c.stroke(); } }
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 1.1; c.beginPath(); cos_addPoly(c, inner); c.stroke();
  c.strokeStyle = '#E6FDFF'; c.lineWidth = 1.5; rr(c, x, y, w, h, R); c.stroke();
  // corner crystal clusters
  c.shadowColor = '#9FF3FF'; c.shadowBlur = 8;
  const sc = Math.min(1, Math.min(w, h)/280);
  [[x + 7, y + 7], [x + w - 7, y + 7], [x + w - 7, y + h - 7], [x + 7, y + h - 7]].forEach(([px, py], k) => {
    const diag = Math.PI/4 + k*Math.PI/2;
    [[-0.6, 30, 3.4], [0.6, 28, 3.2], [-0.28, 26, 4], [0.3, 22, 3.6], [0, 24, 4.6]].forEach(([da, L, wd], j) =>
      cos_shard(c, px, py, diag + da + (cos_h(k*7 + j) - 0.5)*0.12, L*sc*(0.85 + cos_h(k*5 + j)*0.3)*(k === 1 && W === 300 ? 0.6 : 1), wd*sc));
    c.fillStyle = '#FFFFFF'; star4(c, px + Math.cos(diag)*20*sc, py + Math.sin(diag)*20*sc, 3);
  });
}
function cos_bRift(c, t, W, H) {
  const x = 5, y = 5, w = W - 10, h = H - 10, R = 20;
  c.strokeStyle = '#040208'; c.lineWidth = 11; rr(c, x, y, w, h, R); c.stroke();
  const pa = 0.35 + 0.25*Math.sin(t*2);
  c.strokeStyle = 'rgba(181,124,255,' + pa + ')'; c.lineWidth = 1.2; rr(c, x - 4.5, y - 4.5, w + 9, h + 9, R + 4); c.stroke();
  rr(c, x + 5.5, y + 5.5, w - 11, h - 11, R - 5); c.stroke();
  const NC = 12, M = 10, tips = [];
  const crack = (k) => { const u0 = (k + cos_h(k*3.1)*0.6)/NC, L = 0.03 + cos_h(k*1.9)*0.03, pts = [];
    for (let j = 0; j <= M; j++) { const [px, py, nx, ny] = cos_rrp(u0 + L*j/M, x, y, w, h, R), o = (cos_h(k*17 + j) - 0.5)*7; pts.push([px + nx*o, py + ny*o, nx, ny]); }
    return pts; };
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (let k = 0; k < NC; k++) {
    const pts = crack(k), ph = (t*0.22 + cos_h(k*5.3)) % 1, f = Math.min(1, ph*2.4), al = ph < 0.72 ? 1 : (1 - ph)/0.28;
    const pulse = 0.65 + 0.35*Math.sin(t*5 + k*1.3);
    // faint permanent scar
    c.strokeStyle = 'rgba(120,60,200,0.28)'; c.lineWidth = 1; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
    // live energy
    const nv = Math.max(1, Math.floor(f*M)), seg = pts.slice(0, nv + 1);
    const br = pts[5], bo = 6 + cos_h(k*9)*5;
    const path = () => { c.beginPath(); seg.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); if (nv >= 6) { c.moveTo(br[0], br[1]); c.lineTo(br[0] + br[2]*bo*0.6 + br[3]*3, br[1] + br[3]*bo*0.6 - br[2]*3); c.lineTo(br[0] + br[2]*bo, br[1] + br[3]*bo); } };
    c.globalAlpha = al*pulse; c.shadowColor = '#A04CFF'; c.shadowBlur = 10; c.strokeStyle = '#8A3AFF'; c.lineWidth = 3.2; path(); c.stroke();
    c.shadowBlur = 0; c.strokeStyle = '#F4E6FF'; c.lineWidth = 1.1; path(); c.stroke();
    c.globalAlpha = 1;
    tips.push([seg[seg.length - 1], al, k]);
  }
  // sparks at the crawling tips
  c.fillStyle = '#FFFFFF'; c.shadowColor = '#C58BFF'; c.shadowBlur = 6;
  tips.forEach(([p, al, k]) => { if (Math.sin(t*3.1 + k*2.7) < 0.35) return; const sp = (t*2.6 + k*0.37) % 1;
    for (let i = 0; i < 3; i++) { const a = k*2.3 + i*2.1, d = sp*11; c.globalAlpha = al*(1 - sp); c.fillRect(p[0] + Math.cos(a)*d - 0.8, p[1] + Math.sin(a)*d - 0.8, 1.6, 1.6); } });
  c.globalAlpha = 1; c.shadowBlur = 0;
}
function cos_bSpooky(c, t, W, H) {
  const x = 5, y = 5, w = W - 10, h = H - 10, R = 20;
  c.strokeStyle = cos_lin(c, 0, 0, W, H, ['#4A1470', '#2A0A40', '#6A2A9A', '#2A0A40', '#4A1470']); c.lineWidth = 10; rr(c, x, y, w, h, R); c.stroke();
  c.setLineDash([6, 5]); c.strokeStyle = 'rgba(255,154,58,0.85)'; c.lineWidth = 1.6; c.stroke(); c.setLineDash([]);
  c.shadowColor = '#FF8A1A'; c.shadowBlur = 8; c.strokeStyle = '#FF8A1A'; c.lineWidth = 1.6; rr(c, x + 6.5, y + 6.5, w - 13, h - 13, R - 6); c.stroke(); c.shadowBlur = 0;
  // drifting bats along the frame
  for (let k = 0; k < 5; k++) {
    const [px, py, nx, ny] = cos_rrp(t*0.022 + k/5 + 0.07, x, y, w, h, R), o = 3 + Math.sin(t*1.7 + k*2)*4;
    cos_bat(c, px + nx*o, py + ny*o + Math.sin(t*3 + k)*1.5, 7.5, Math.sin(t*13 + k*2), '#0E0418', '#FF9A3A');
  }
  // jack-o'-lanterns at the corners
  [[x + 12, y + 13], [x + w - 12, y + 13], [x + w - 12, y + h - 11], [x + 12, y + h - 11]].forEach(([px, py], k) => {
    const fl = 0.6 + 0.22*Math.sin(t*13 + k*2.1) + 0.18*Math.sin(t*7.3 + k*5) - (Math.sin(t*2.3 + k*4) > 0.93 ? 0.5 : 0);
    cos_pumpkin(c, px, py, 12, fl);
  });
}
function cos_bCobweb(c, t, W, H) {
  const x = 5, y = 5, w = W - 10, h = H - 10, R = 20;
  c.strokeStyle = '#2A2A32'; c.lineWidth = 8.5; rr(c, x, y, w, h, R); c.stroke();
  c.strokeStyle = cos_lin(c, 0, 0, W, H, ['#C8C8D2', '#6A6A76', '#A8A8B6', '#55555F', '#C8C8D2']); c.lineWidth = 6.5; c.stroke();
  c.strokeStyle = 'rgba(230,230,240,0.35)'; c.lineWidth = 1; rr(c, x + 6, y + 6, w - 12, h - 12, R - 6); c.stroke();
  // corner webs
  const L = Math.min(w, h)*0.18, shim = (t*0.5) % 1;
  [[x + 2, y + 2], [x + w - 2, y + 2], [x + w - 2, y + h - 2], [x + 2, y + h - 2]].forEach(([cx, cy], k) => {
    const a0 = k*Math.PI/2, NS = 6, spokes = [];
    for (let i = 0; i < NS; i++) { const a = a0 + i/(NS - 1)*Math.PI/2, len = L*(0.85 + cos_h(k*11 + i)*0.25); spokes.push([a, len]); }
    c.strokeStyle = 'rgba(235,235,245,0.6)'; c.lineWidth = 0.75; c.beginPath();
    spokes.forEach(([a, len]) => { c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a)*len, cy + Math.sin(a)*len); }); c.stroke();
    [0.24, 0.42, 0.6, 0.77, 0.92].forEach((f, ri) => {
      c.strokeStyle = 'rgba(235,235,245,' + (0.4 + 0.35*Math.max(0, 1 - Math.abs(f - shim)*5)) + ')'; c.beginPath();
      for (let i = 0; i < NS - 1; i++) { const [a1, l1] = spokes[i], [a2, l2] = spokes[i + 1], r1 = l1*f, r2 = l2*f, am = (a1 + a2)/2, rm = (r1 + r2)/2*0.8;
        if (!i) c.moveTo(cx + Math.cos(a1)*r1, cy + Math.sin(a1)*r1);
        c.quadraticCurveTo(cx + Math.cos(am)*rm, cy + Math.sin(am)*rm, cx + Math.cos(a2)*r2, cy + Math.sin(a2)*r2); }
      c.stroke();
    });
  });
  // spider on a thread, right side
  const sx = x + w - 11, top = y + 4, sc = Math.min(1, Math.min(w, h)/280);
  const sy = top + 22*sc + (0.5 - 0.5*Math.cos(t*0.7))*h*0.3, sw = Math.sin(t*1.3)*1.2;
  c.strokeStyle = 'rgba(235,235,245,0.75)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(sx, top); c.lineTo(sx + sw, sy - 4*sc); c.stroke();
  c.save(); c.translate(sx + sw, sy); c.scale(sc, sc);
  c.strokeStyle = '#121218'; c.lineWidth = 1.1; c.lineCap = 'round';
  for (let i = 0; i < 4; i++) for (const s of [-1, 1]) {
    const wig = Math.sin(t*6 + i*1.3 + s)*0.12, a = -0.9 + i*0.55 + wig;
    const kx = s*Math.cos(a)*5.5, ky = Math.sin(a)*5 - 2.5;
    c.beginPath(); c.moveTo(0, 0.5); c.lineTo(kx, ky); c.lineTo(kx + s*3, ky + 4 + i*0.6); c.stroke();
  }
  c.fillStyle = '#16161E'; c.beginPath(); c.ellipse(0, 3, 3.6, 4.4, 0, 0, TAU); c.fill(); c.beginPath(); c.arc(0, -1.6, 2.4, 0, TAU); c.fill();
  c.fillStyle = 'rgba(200,200,220,0.5)'; c.beginPath(); c.ellipse(-1.1, 2, 1, 1.8, 0, 0, TAU); c.fill();
  c.fillStyle = '#FF3A3A'; c.fillRect(-1.3, -2.2, 0.9, 0.9); c.fillRect(0.4, -2.2, 0.9, 0.9);
  c.restore();
}
function cos_bBone(c, W, H) {
  const e = 8, L = e, T = e, Rt = W - e, B = H - e, th = 5;
  const bones = [];
  const edge = (x1, y1, x2, y2) => { const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(2, Math.round(len/64));
    for (let i = 0; i < n; i++) bones.push([x1 + (x2 - x1)*i/n, y1 + (y2 - y1)*i/n, x1 + (x2 - x1)*(i + 1)/n, y1 + (y2 - y1)*(i + 1)/n]); };
  edge(L, T, Rt, T); edge(Rt, T, Rt, B); edge(Rt, B, L, B); edge(L, B, L, T);
  const path = () => { c.beginPath();
    bones.forEach(([x1, y1, x2, y2]) => { const a = Math.atan2(y2 - y1, x2 - x1), ln = Math.hypot(x2 - x1, y2 - y1), ca = Math.cos(a), sa = Math.sin(a);
      const P = (u, v) => [x1 + ca*u - sa*v, y1 + sa*u + ca*v], ins = 5;
      cos_addPoly(c, [P(ins, -th/2), P(ln - ins, -th/2), P(ln - ins, th/2), P(ins, th/2)]);
      [[ins - 0.5, -th*0.52], [ins - 0.5, th*0.52], [ln - ins + 0.5, -th*0.52], [ln - ins + 0.5, th*0.52]].forEach(([u, v]) => { const [px, py] = P(u, v); c.moveTo(px + th*0.62, py); c.arc(px, py, th*0.62, 0, TAU); }); });
    [[L, T], [Rt, T], [Rt, B], [L, B]].forEach(([px, py]) => { c.moveTo(px + th*1.05, py); c.arc(px, py, th*1.05, 0, TAU); }); };
  c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 4; c.strokeStyle = '#4A3C2A'; c.lineWidth = 2.6; c.lineJoin = 'round'; path(); c.stroke(); c.shadowBlur = 0;
  c.fillStyle = cos_lin(c, 0, 0, W, H, ['#FFFAF0', '#E4DAC4', '#FFF6E6', '#D4C8AE']); c.fill();
  // shaft highlights + shading
  c.lineCap = 'round';
  bones.forEach(([x1, y1, x2, y2]) => { const a = Math.atan2(y2 - y1, x2 - x1), ln = Math.hypot(x2 - x1, y2 - y1), ca = Math.cos(a), sa = Math.sin(a);
    const P = (u, v) => [x1 + ca*u - sa*v, y1 + sa*u + ca*v], [ax, ay] = P(9, -th*0.18), [bx, by] = P(ln - 9, -th*0.18), [cx2, cy2] = P(9, th*0.3), [dx, dy] = P(ln - 9, th*0.3);
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
    c.strokeStyle = 'rgba(140,120,90,0.45)'; c.beginPath(); c.moveTo(cx2, cy2); c.lineTo(dx, dy); c.stroke(); });
  c.fillStyle = 'rgba(120,100,70,0.5)';
  [[L, T], [Rt, T], [Rt, B], [L, B]].forEach(([px, py]) => { c.beginPath(); c.arc(px + 1, py + 1, 1.6, 0, TAU); c.fill(); });
}

const cos_PB = { harbor: 1, glacier: 1, rift: 1, spooky: 1, cobweb: 1, bone: 1 };
function drawCardBorder2(c, id, t, W, H, accent) {
  if (!cos_PB[id]) return false;
  c.save();
  try {
    t = +t || 0;
    if (id === 'harbor') cos_bHarbor(c, W, H);
    else if (id === 'glacier') cos_bGlacier(c, W, H);
    else if (id === 'rift') cos_bRift(c, t, W, H);
    else if (id === 'spooky') cos_bSpooky(c, t, W, H);
    else if (id === 'cobweb') cos_bCobweb(c, t, W, H);
    else if (id === 'bone') cos_bBone(c, W, H);
  } catch (e) { /* never break the card */ }
  c.restore();
  c.shadowBlur = 0; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.setLineDash([]);
  return true;
}

// =============== BACKGROUNDS ===============
function cos_gHarbor(c, W, H) {
  const hz = H*0.62;
  c.fillStyle = cos_lin(c, 0, 0, 0, hz, [[0, '#04031A'], [0.5, '#1E0C44'], [0.85, '#5A1A62'], [1, '#C0306E']]); c.fillRect(0, 0, W, hz);
  cos_stars(c, W, H, 34, hz*0.6, 0, false);
  const rnd = cos_rng(11), blds = [], cols = ['#FF4F8B', '#3EE6FF', '#B57CFF', '#FFD84A'];
  for (let bx = W*0.24; bx < W; ) { const bw = 13 + rnd()*15, bh = H*(0.07 + rnd()*0.19)*(rnd() > 0.85 ? 1.25 : 1); blds.push([bx, bw, bh, cols[Math.floor(rnd()*4)]]); bx += bw + 1 + rnd()*3; }
  // back layer (hazy)
  c.fillStyle = '#2A0C3A'; for (let k = 0; k < 14; k++) { const bw = 18 + cos_h(k)*14, bh = H*(0.05 + cos_h(k*2.7)*0.1); c.fillRect(W*0.2 + k*W*0.06, hz - bh, bw, bh); }
  c.lineWidth = 1.3;
  blds.forEach(([bx, bw, bh, col], k) => {
    const top = hz - bh; c.fillStyle = '#0A0618'; c.fillRect(bx, top, bw, bh);
    if (bh > H*0.2) { c.fillRect(bx + bw/2 - 1, top - 10, 2, 10); c.fillStyle = '#FF4F8B'; c.fillRect(bx + bw/2 - 1.5, top - 12, 3, 3); }
    c.shadowColor = col; c.shadowBlur = 6; c.strokeStyle = col; c.beginPath(); c.moveTo(bx, top + 0.6); c.lineTo(bx + bw, top + 0.6); c.stroke(); c.shadowBlur = 0;
    for (let wy = top + 5; wy < hz - 4; wy += 7) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) { const v = cos_h(k*131 + wy*3.1 + wx*7.7); if (v > 0.55) { c.fillStyle = v > 0.85 ? '#3EE6FF' : '#FFD27A'; c.fillRect(wx, wy, 2.2, 3); } }
  });
  // water
  c.fillStyle = cos_lin(c, 0, hz, 0, H, ['#24103E', '#0C0620', '#04030C']); c.fillRect(0, hz, W, H - hz);
  c.globalAlpha = 0.5; c.fillStyle = '#FF4F8B'; c.fillRect(0, hz, W, 1); c.globalAlpha = 1;
  blds.forEach(([bx, bw, bh, col], k) => {
    for (let yy = hz + 3, i = 0; yy < hz + bh*1.1 && yy < H; yy += 4, i++) { const f = (yy - hz)/(bh*1.1), wv = cos_h(k*17 + i);
      c.globalAlpha = 0.45*(1 - f)*(0.4 + wv*0.6); c.fillStyle = i % 3 ? '#FFD27A' : col; const ww = bw*(0.25 + wv*0.6); c.fillRect(bx + (bw - ww)/2 + (cos_h(i*3 + k) - 0.5)*4, yy, ww, 1.4); }
  });
  c.globalAlpha = 1;
  // lighthouse on rocks
  const lx = W*0.13, base = hz + H*0.02, th = H*0.27, tb = 11, tt = 7;
  c.fillStyle = '#0E0818'; c.beginPath(); cos_addPoly(c, [[lx - 34, base + 10], [lx - 26, base - 4], [lx - 12, base - 8], [lx + 6, base - 9], [lx + 22, base - 3], [lx + 36, base + 10]]); c.fill();
  // beams
  const ly = base - th - 9;
  [[1, 0.06], [-1, -0.04]].forEach(([s, tilt]) => { c.fillStyle = cos_lin(c, lx, ly, lx + s*W*0.8, ly, ['rgba(255,236,150,0.42)', 'rgba(255,236,150,0)']);
    c.beginPath(); c.moveTo(lx, ly); c.lineTo(lx + s*W*0.9, ly - W*0.1 + tilt*W); c.lineTo(lx + s*W*0.9, ly + W*0.12 + tilt*W); c.closePath(); c.fill(); });
  c.save(); c.beginPath(); cos_addPoly(c, [[lx - tb, base - 6], [lx - tt, base - th], [lx + tt, base - th], [lx + tb, base - 6]]); c.clip();
  for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? '#F0ECFF' : '#E02A4A'; c.fillRect(lx - tb, base - 6 - (k + 1)*(th/6), tb*2, th/6 + 0.5); }
  c.fillStyle = 'rgba(0,0,0,0.3)'; c.fillRect(lx + 2, base - th, tb, th); c.restore();
  c.fillStyle = '#1A0A24'; c.fillRect(lx - 10, base - th - 2, 20, 3);
  const lg = c.createRadialGradient(lx, ly, 1, lx, ly, 26); lg.addColorStop(0, 'rgba(255,240,170,0.9)'); lg.addColorStop(1, 'rgba(255,240,170,0)');
  c.fillStyle = lg; c.beginPath(); c.arc(lx, ly, 26, 0, TAU); c.fill();
  c.fillStyle = '#FFF2B0'; c.fillRect(lx - 5, ly - 5, 10, 9);
  c.fillStyle = '#1A0A24'; c.fillRect(lx - 5, ly - 1, 10, 1); c.beginPath(); cos_addPoly(c, [[lx - 8, ly - 5], [lx, ly - 13], [lx + 8, ly - 5]]); c.fill();
  // lighthouse reflection
  for (let i = 0; i < 9; i++) { c.globalAlpha = 0.35*(1 - i/9); c.fillStyle = '#FFE08A'; c.fillRect(lx - 4 + (cos_h(i*5) - 0.5)*6, base + 12 + i*5, 8 + cos_h(i)*6, 1.4); }
  c.globalAlpha = 1;
}
function cos_mtnLayer(c, W, H, base, amp, n, seed, col, snow, shade) {
  const peaks = [], vals = [];
  for (let i = -1; i <= n; i++) peaks.push([(i + 0.5)/n*W + (cos_h(seed*31 + i) - 0.5)*W/n*0.5, H*base - H*amp*(0.55 + 0.45*cos_h(seed*17 + i*3))]);
  for (let i = 0; i < peaks.length - 1; i++) vals.push([(peaks[i][0] + peaks[i + 1][0])/2 + (cos_h(seed*7 + i) - 0.5)*10, H*base + H*0.02 - H*amp*0.25*cos_h(seed*13 + i)]);
  const sil = () => { c.beginPath(); c.moveTo(-10, H + 2); c.lineTo(peaks[0][0] - 30, H*base);
    for (let i = 0; i < peaks.length; i++) { const p = peaks[i]; c.lineTo(p[0], p[1]); const v = vals[i]; if (!v) continue;
      for (let s = 1; s <= 3; s++) { const f = s/4, ex = p[0] + (v[0] - p[0])*f, ey = p[1] + (v[1] - p[1])*f; c.lineTo(ex + (cos_h(seed + i*9 + s) - 0.5)*5, ey + (cos_h(seed*3 + i*9 + s) - 0.5)*6); }
      c.lineTo(v[0], v[1]); for (let s = 1; s <= 3; s++) { const f = s/4, nx2 = peaks[i + 1]; c.lineTo(v[0] + (nx2[0] - v[0])*f + (cos_h(seed*5 + i*7 + s) - 0.5)*5, v[1] + (nx2[1] - v[1])*f + (cos_h(seed*11 + i*7 + s) - 0.5)*6); } }
    c.lineTo(W + 10, H*base); c.lineTo(W + 10, H + 2); c.closePath(); };
  sil(); c.fillStyle = col; c.fill();
  c.save(); sil(); c.clip();
  for (let i = 0; i < peaks.length; i++) { const p = peaks[i], vl = vals[i - 1] || [p[0] - 40, H*base], vr = vals[i] || [p[0] + 40, H*base];
    c.fillStyle = shade; c.beginPath(); cos_addPoly(c, [p, [vr[0], vr[1]], [p[0] + (vr[0] - p[0])*0.2, H + 2]]); c.fill();
    const f = 0.38, pts = [p, [p[0] + (vr[0] - p[0])*f, p[1] + (vr[1] - p[1])*f]];
    for (let s = 1; s < 6; s++) { const u = s/6, bx = p[0] + (vr[0] - p[0])*f*(1 - u) + (vl[0] - p[0])*f*u, by = p[1] + ((vr[1] + vl[1])/2 - p[1])*f*(s % 2 ? 0.7 : 1.05); pts.push([bx, by]); }
    pts.push([p[0] + (vl[0] - p[0])*f, p[1] + (vl[1] - p[1])*f]);
    c.fillStyle = snow; c.beginPath(); cos_addPoly(c, pts); c.fill(); }
  c.restore();
}
function cos_gFrost(c, t, W, H) {
  c.fillStyle = cos_lin(c, 0, 0, 0, H, [[0, '#02051A'], [0.45, '#0C1A46'], [0.75, '#2A4A82'], [1, '#5A7AB0']]); c.fillRect(0, 0, W, H);
  cos_stars(c, W, H, 60, H*0.55, t, true);
  const mx = W*0.78, my = H*0.13, mr = Math.min(W, H)*0.05;
  const mg = c.createRadialGradient(mx, my, mr*0.5, mx, my, mr*4); mg.addColorStop(0, 'rgba(200,225,255,0.35)'); mg.addColorStop(1, 'rgba(200,225,255,0)'); c.fillStyle = mg; c.fillRect(mx - mr*4, my - mr*4, mr*8, mr*8);
  c.fillStyle = '#EAF4FF'; c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fill();
  cos_mtnLayer(c, W, H, 0.55, 0.26, 4, 1, '#34467E', '#B4C8F0', 'rgba(10,20,50,0.25)');
  cos_mtnLayer(c, W, H, 0.68, 0.22, 3, 2, '#1E2A58', '#D6E4FF', 'rgba(5,10,35,0.3)');
  cos_mtnLayer(c, W, H, 0.82, 0.16, 5, 3, '#0E1636', '#F0F6FF', 'rgba(0,0,20,0.35)');
  c.fillStyle = cos_lin(c, 0, H*0.88, 0, H, ['#DCE8FF', '#9FB4E0']);
  c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 15) c.lineTo(x, H*0.91 + Math.sin(x*0.02 + 1)*H*0.015); c.lineTo(W, H); c.fill();
  // falling snow
  for (let g = 0; g < 3; g++) { c.fillStyle = 'rgba(255,255,255,' + (0.5 + g*0.2) + ')'; c.beginPath();
    for (let k = g; k < 75; k += 3) { const sp = 10 + (k % 5)*5 + g*6, sz = 0.8 + g*0.7, x = ((k*67.3 + Math.sin(t*0.7 + k)*10) % W + W) % W, y = ((k*37.9 + t*sp) % (H + 10)) - 5;
      c.moveTo(x + sz, y); c.arc(x, y, sz, 0, TAU); }
    c.fill(); }
}
function cos_gRift(c, t, W, H) {
  const cx = W*0.5, cy = H*0.4, Rm = Math.max(W, H)*0.55;
  const bg = c.createRadialGradient(cx, cy, 10, cx, cy, Rm*1.2); bg.addColorStop(0, '#3A0E66'); bg.addColorStop(0.35, '#16062A'); bg.addColorStop(1, '#000000'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
  cos_stars(c, W, H, 40, H, t, true);
  // vortex arms
  c.save(); c.translate(cx, cy); c.scale(1, 0.62); c.lineCap = 'round';
  const sg = c.createRadialGradient(0, 0, 4, 0, 0, Rm*0.75); sg.addColorStop(0, 'rgba(230,200,255,0.75)'); sg.addColorStop(0.4, 'rgba(160,80,255,0.4)'); sg.addColorStop(1, 'rgba(90,20,160,0)');
  c.strokeStyle = sg;
  for (let arm = 0; arm < 5; arm++) { c.beginPath();
    for (let j = 0; j <= 34; j++) { const r = 6 + j*Rm*0.75/34, a = arm*TAU/5 + j*0.17 - t*0.45; j ? c.lineTo(Math.cos(a)*r, Math.sin(a)*r) : c.moveTo(Math.cos(a)*r, Math.sin(a)*r); }
    c.lineWidth = 7; c.stroke(); c.lineWidth = 2; c.stroke(); }
  c.restore();
  // debris (behind first, then rift, then front)
  const debris = (front) => { for (let k = 0; k < 34; k++) { const rad = 30 + cos_h(k)*W*0.45, ang = cos_h(k*3)*TAU + t*(18/rad)*(0.8 + cos_h(k*5)*0.4), z = Math.sin(ang);
      if ((z >= 0) !== front) continue;
      const ox = Math.cos(ang)*rad, oy = z*rad*0.38, tl = -0.32, px = cx + ox*Math.cos(tl) - oy*Math.sin(tl), py = cy + ox*Math.sin(tl) + oy*Math.cos(tl);
      const s = (1.5 + cos_h(k*7)*3.5)*(0.7 + 0.3*z);
      c.save(); c.translate(px, py); c.rotate(t*(0.5 + cos_h(k*9)) + k); c.globalAlpha = 0.55 + 0.45*(z*0.5 + 0.5);
      c.fillStyle = '#1C1030'; c.strokeStyle = '#B57CFF'; c.lineWidth = 0.8;
      c.beginPath(); cos_addPoly(c, [[-s, -s*0.6], [s*0.3, -s], [s, s*0.2], [-s*0.2, s*0.9]]); c.fill(); c.stroke(); c.restore(); }
    c.globalAlpha = 1; };
  debris(false);
  // the tear
  const Ht = H*0.42, Wd = 22*(1 + 0.06*Math.sin(t*2.2)), N = 16;
  const lens = (sc) => { c.beginPath(); for (let j = 0; j <= N; j++) { const v = j/N, yy = -Ht/2 + v*Ht, hw = Math.pow(Math.sin(Math.PI*v), 0.8)*Wd*sc*(0.75 + 0.35*cos_h(j*7)); const xx = -hw + (cos_h(j + 50) - 0.5)*5*sc + yy*0.3; j ? c.lineTo(cx + xx, cy + yy) : c.moveTo(cx + xx, cy + yy); }
    for (let j = N; j >= 0; j--) { const v = j/N, yy = -Ht/2 + v*Ht, hw = Math.pow(Math.sin(Math.PI*v), 0.8)*Wd*sc*(0.75 + 0.35*cos_h(j*11 + 3)); c.lineTo(cx + hw + (cos_h(j + 90) - 0.5)*5*sc + yy*0.3, cy + yy); } c.closePath(); };
  c.shadowColor = '#B57CFF'; c.shadowBlur = 28; c.fillStyle = '#9A4CFF'; lens(1.25); c.fill();
  c.shadowBlur = 12; c.shadowColor = '#FFFFFF'; c.fillStyle = cos_lin(c, cx, cy - Ht/2, cx, cy + Ht/2, ['#E8D0FF', '#FFFFFF', '#F0C0FF']); lens(0.7); c.fill();
  c.shadowBlur = 0; c.fillStyle = '#0A0014'; lens(0.2); c.fill();
  // energy tendrils
  c.strokeStyle = 'rgba(220,180,255,0.6)'; c.lineWidth = 1;
  for (let k = 0; k < 6; k++) { const a0 = k*1.05 + 0.3, fl = 0.5 + 0.5*Math.sin(t*4 + k*2); c.globalAlpha = fl; c.beginPath(); let x = cx + Math.cos(a0)*Wd*0.8, y = cy + Math.sin(a0)*Ht*0.3; c.moveTo(x, y);
    for (let q = 0; q < 5; q++) { const a = a0 + (cos_h(k*9 + q) - 0.5)*1.2; x += Math.cos(a)*12; y += Math.sin(a)*12; c.lineTo(x, y); } c.stroke(); }
  c.globalAlpha = 1;
  debris(true);
  // motes spiralling in
  c.fillStyle = '#E6CCFF';
  for (let k = 0; k < 30; k++) { const r = ((cos_h(k*13)*Rm*0.6 - t*(14 + (k % 4)*6)) % (Rm*0.6) + Rm*0.6) % (Rm*0.6), a = k*2.4 + t*0.9 + r*0.03; c.globalAlpha = Math.min(1, r/(Rm*0.15)); c.fillRect(cx + Math.cos(a)*r, cy + Math.sin(a)*r*0.6, 1.6, 1.6); }
  c.globalAlpha = 1;
}
function cos_tomb(c, x, y, s, type, tilt) {
  c.save(); c.translate(x, y); c.rotate(tilt); c.scale(s, s);
  c.beginPath();
  if (type === 0) { c.moveTo(-10, 0); c.lineTo(-10, -18); c.arc(0, -18, 10, Math.PI, 0); c.lineTo(10, 0); c.closePath(); }
  else if (type === 1) cos_addPoly(c, [[-3, 0], [-3, -20], [-10, -20], [-10, -26], [-3, -26], [-3, -34], [3, -34], [3, -26], [10, -26], [10, -20], [3, -20], [3, 0]]);
  else if (type === 2) cos_addPoly(c, [[-6, 0], [-5, -30], [0, -37], [5, -30], [6, 0]]);
  else cos_addPoly(c, [[-12, 0], [-12, -20], [-9, -24], [9, -24], [12, -20], [12, 0]]);
  c.fillStyle = cos_lin(c, -10, -30, 10, 0, ['#5A6E6A', '#2E3A3A', '#1A2222']); c.fill();
  c.strokeStyle = 'rgba(170,220,190,0.35)'; c.lineWidth = 1/s; c.stroke();
  if (type === 0 || type === 3) { c.fillStyle = 'rgba(10,16,16,0.75)'; c.font = '700 7px system-ui'; c.textAlign = 'center'; c.textBaseline = 'alphabetic'; c.fillText('RIP', 0, -12); c.fillRect(-6, -8, 12, 1); c.fillRect(-4, -5, 8, 1); }
  c.restore();
}
function cos_gGraveyard(c, t, W, H) {
  c.fillStyle = cos_lin(c, 0, 0, 0, H, [[0, '#070818'], [0.45, '#13223A'], [0.75, '#1F3A36'], [1, '#0A1410']]); c.fillRect(0, 0, W, H);
  cos_stars(c, W, H, 30, H*0.5, t, true);
  const mx = W*0.68, my = H*0.2, mr = Math.min(W*0.17, H*0.2);
  const mg = c.createRadialGradient(mx, my, mr*0.8, mx, my, mr*2.4); mg.addColorStop(0, 'rgba(210,255,200,0.3)'); mg.addColorStop(1, 'rgba(210,255,200,0)'); c.fillStyle = mg; c.fillRect(mx - mr*2.4, my - mr*2.4, mr*4.8, mr*4.8);
  const mf = c.createRadialGradient(mx - mr*0.3, my - mr*0.3, mr*0.1, mx, my, mr); mf.addColorStop(0, '#FFFFF0'); mf.addColorStop(1, '#DAD8A8'); c.fillStyle = mf; c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fill();
  c.fillStyle = 'rgba(120,130,80,0.18)'; [[-0.3, -0.2, 0.22], [0.25, 0.15, 0.3], [-0.1, 0.4, 0.14], [0.35, -0.35, 0.12]].forEach(([ox, oy, r]) => { c.beginPath(); c.arc(mx + ox*mr, my + oy*mr, r*mr, 0, TAU); c.fill(); });
  // far hill + trees
  c.fillStyle = '#0D1C1A'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 12) c.lineTo(x, H*0.7 + Math.sin(x*0.018 + 2)*H*0.03); c.lineTo(W, H); c.fill();
  c.strokeStyle = '#04080A'; c.lineCap = 'round';
  cos_branch(c, W*0.12, H*0.82, -Math.PI/2 - 0.08, H*0.12, 6, 3);
  cos_branch(c, W*0.9, H*0.74, -Math.PI/2 + 0.12, H*0.08, 5, 7);
  // fog band behind stones
  const fog = (b, a) => { const y0 = H*(0.72 + b*0.06); c.fillStyle = cos_lin(c, 0, y0 - 14, 0, H, ['rgba(140,255,170,0)', 'rgba(140,255,170,' + a + ')', 'rgba(140,255,170,' + a*0.4 + ')']);
    c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 12) c.lineTo(x, y0 + Math.sin(x*0.025 + t*(0.4 + b*0.15) + b*2)*8 + Math.sin(x*0.06 - t*0.3*(b + 1))*4); c.lineTo(W, H); c.fill(); };
  fog(0, 0.16);
  // ground + stones
  c.fillStyle = '#071210'; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 12) c.lineTo(x, H*0.83 + Math.sin(x*0.03)*H*0.012); c.lineTo(W, H); c.fill();
  const s = Math.min(1.2, H/330);
  [[0.3, 0.8, 0.7, 0, 0.05], [0.52, 0.79, 0.65, 2, -0.04], [0.7, 0.81, 0.7, 1, 0.06], [0.84, 0.8, 0.6, 3, -0.03],
   [0.2, 0.9, 1, 3, -0.06], [0.42, 0.92, 1.1, 0, 0.03], [0.62, 0.91, 1, 1, -0.08], [0.8, 0.93, 1.05, 0, 0.07]].forEach(([fx, fy, sc, ty, tl]) => cos_tomb(c, W*fx, H*fy, s*sc, ty, tl));
  fog(1, 0.18); fog(2, 0.14);
  // drifting wisps
  for (let k = 0; k < 4; k++) { const wx = ((k*W*0.33 + t*(8 + k*3)) % (W + 120)) - 60, wy = H*(0.76 + (k % 2)*0.1);
    const wg = c.createRadialGradient(wx, wy, 2, wx, wy, 60); wg.addColorStop(0, 'rgba(160,255,180,0.14)'); wg.addColorStop(1, 'rgba(160,255,180,0)');
    c.fillStyle = wg; c.save(); c.translate(wx, wy); c.scale(1, 0.3); c.translate(-wx, -wy); c.fillRect(wx - 60, wy - 60, 120, 120); c.restore(); }
}
function cos_castle(c, x, y, s, col, win) {
  c.save(); c.translate(x, y); c.scale(s, s); c.fillStyle = col;
  const tower = (tx, tw, th, roof) => { c.fillRect(tx, -th, tw, th);
    if (roof) { c.beginPath(); cos_addPoly(c, [[tx - 3, -th], [tx + tw/2, -th - roof], [tx + tw + 3, -th]]); c.fill(); c.fillRect(tx + tw/2 - 0.5, -th - roof - 8, 1, 8); c.beginPath(); cos_addPoly(c, [[tx + tw/2 + 0.5, -th - roof - 8], [tx + tw/2 + 8, -th - roof - 6], [tx + tw/2 + 0.5, -th - roof - 4]]); c.fill(); }
    else for (let m = tx; m < tx + tw - 1; m += 6) c.fillRect(m, -th - 5, 3.5, 5); };
  c.fillRect(-92, -42, 184, 42); for (let m = -92; m < 92; m += 8) c.fillRect(m, -48, 4.5, 6);
  tower(-100, 24, 82, 28); tower(76, 24, 78, 26); tower(-50, 22, 110, 0); tower(28, 22, 104, 0); tower(-17, 34, 142, 40);
  c.fillRect(-4, -58, 8, 16);
  c.fillStyle = win; c.shadowColor = win; c.shadowBlur = 6;
  [[-91, -60], [-91, -40], [84, -55], [-42, -86], [-42, -60], [35, -80], [-6, -118], [4, -118], [-1, -90], [-60, -24], [55, -24]].forEach(([wx, wy]) => c.fillRect(wx, wy, 3.5, 6));
  c.restore();
}
function cos_gMoon(c, t, W, H) {
  c.fillStyle = cos_lin(c, 0, 0, 0, H, [[0, '#10031A'], [0.4, '#3A0A2E'], [0.72, '#8A2418'], [1, '#D8601A']]); c.fillRect(0, 0, W, H);
  cos_stars(c, W, H, 26, H*0.3, t, true);
  const cx = W*0.5, cy = H*0.37, R = Math.min(W*0.36, H*0.3);
  const gl = c.createRadialGradient(cx, cy, R*0.9, cx, cy, R*1.9); gl.addColorStop(0, 'rgba(255,150,50,0.45)'); gl.addColorStop(1, 'rgba(255,120,40,0)'); c.fillStyle = gl; c.fillRect(cx - R*2, cy - R*2, R*4, R*4);
  const mf = c.createRadialGradient(cx - R*0.3, cy - R*0.3, R*0.1, cx, cy, R); mf.addColorStop(0, '#FFE0A0'); mf.addColorStop(0.55, '#FFA040'); mf.addColorStop(1, '#E06418');
  c.fillStyle = mf; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill();
  c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip();
  c.fillStyle = 'rgba(170,60,10,0.2)'; [[-0.35, -0.2, 0.28, 0.2], [0.2, 0.1, 0.34, 0.22], [-0.05, 0.5, 0.2, 0.12], [0.45, -0.4, 0.14, 0.12], [-0.55, 0.3, 0.12, 0.1]].forEach(([ox, oy, rx, ry]) => { c.beginPath(); c.ellipse(cx + ox*R, cy + oy*R, rx*R, ry*R, 0.3, 0, TAU); c.fill(); });
  c.restore();
  // drifting cloud streaks
  c.fillStyle = 'rgba(40,6,30,0.55)';
  for (let k = 0; k < 3; k++) { const wx = ((k*W*0.45 + t*(5 + k*2)) % (W*1.6)) - W*0.3, wy = cy + R*(-0.4 + k*0.45); c.beginPath(); c.ellipse(wx, wy, W*0.28, 3 + k, 0, 0, TAU); c.ellipse(wx + W*0.12, wy + 4, W*0.16, 2.5, 0, 0, TAU); c.fill(); }
  // hill + castle
  c.fillStyle = '#0A0308'; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H*0.86); c.quadraticCurveTo(W*0.5, H*0.74, W, H*0.86); c.lineTo(W, H); c.fill();
  cos_castle(c, W*0.5, H*0.81, Math.min(W/300, H/400)*0.9, '#0A0308', '#FFC04A');
  // bats
  for (let k = 0; k < 9; k++) { const sp = 16 + (k % 3)*8, bx = ((k*W*0.137*1.7 + t*sp) % (W + 60)) - 30, by = H*(0.12 + cos_h(k*3)*0.45) + Math.sin(t*1.3 + k*1.7)*H*0.03;
    cos_bat(c, bx, by, 5 + cos_h(k*7)*7, Math.sin(t*(10 + (k % 3)*2) + k), '#120208'); }
}
function cos_gHaunted(c, W, H) {
  const sky = cos_lin(c, 0, 0, 0, H, [[0, '#0A0420'], [0.5, '#2A0E52'], [0.82, '#6A2A8A'], [1, '#8A3A7A']]);
  c.fillStyle = sky; c.fillRect(0, 0, W, H);
  cos_stars(c, W, H, 34, H*0.5, 0, false);
  const mx = W*0.22, my = H*0.14, mr = Math.min(W, H)*0.07;
  const mg = c.createRadialGradient(mx, my, mr, mx, my, mr*3); mg.addColorStop(0, 'rgba(230,210,255,0.3)'); mg.addColorStop(1, 'rgba(230,210,255,0)'); c.fillStyle = mg; c.fillRect(mx - mr*3, my - mr*3, mr*6, mr*6);
  c.fillStyle = '#F4ECFF'; c.beginPath(); c.arc(mx, my, mr, 0, TAU); c.fill();
  c.fillStyle = sky; c.beginPath(); c.arc(mx + mr*0.45, my - mr*0.2, mr*0.9, 0, TAU); c.fill();
  c.fillStyle = 'rgba(30,8,50,0.55)'; [[0.6, 0.12, 0.3], [0.2, 0.3, 0.25], [0.85, 0.28, 0.2]].forEach(([fx, fy, fw]) => { c.beginPath(); c.ellipse(W*fx, H*fy, W*fw, 4, 0, 0, TAU); c.ellipse(W*fx + W*fw*0.4, H*fy + 4, W*fw*0.6, 3, 0, 0, TAU); c.fill(); });
  // hill
  const col = '#0B0518';
  c.fillStyle = '#140A26'; c.beginPath(); c.moveTo(0, H); c.lineTo(0, H*0.84); c.quadraticCurveTo(W*0.55, H*0.76, W, H*0.83); c.lineTo(W, H); c.fill();
  // mansion
  const s = Math.min(W/300, H/400)*0.95, bx = W*0.56, by = H*0.83;
  c.save(); c.translate(bx, by); c.scale(s, s); c.fillStyle = col;
  c.fillRect(-60, -132, 10, 34); c.fillRect(30, -130, 10, 30);
  c.fillRect(-80, -90, 160, 90);
  c.beginPath(); cos_addPoly(c, [[-92, -88], [-30, -88], [-10, -118], [0, -142], [10, -118], [30, -88], [92, -88], [70, -110], [-70, -110]]); c.fill();
  c.fillRect(-132, -60, 54, 60); c.beginPath(); cos_addPoly(c, [[-138, -58], [-105, -94], [-72, -58]]); c.fill();
  c.fillRect(56, -150, 36, 150); c.beginPath(); cos_addPoly(c, [[51, -150], [74, -210], [97, -150]]); c.fill(); c.fillRect(73, -222, 2, 14);
  c.fillRect(-24, -34, 48, 34); c.beginPath(); cos_addPoly(c, [[-30, -34], [0, -50], [30, -34]]); c.fill();
  const lit = '#FFC94A', dim = '#2A1440';
  const win = (wx, wy, ww, wh, on) => { c.fillStyle = on ? lit : dim; c.shadowColor = lit; c.shadowBlur = on ? 10 : 0; c.beginPath(); c.moveTo(wx, wy + wh); c.lineTo(wx, wy + ww/2); c.arc(wx + ww/2, wy + ww/2, ww/2, Math.PI, 0); c.lineTo(wx + ww, wy + wh); c.closePath(); c.fill(); c.shadowBlur = 0;
    c.fillStyle = col; c.fillRect(wx + ww/2 - 0.6, wy + 2, 1.2, wh - 2); c.fillRect(wx, wy + wh*0.55, ww, 1.2); };
  [[-70, -80, 1], [-46, -80, 0], [34, -80, 1], [58, -80, 0], [-70, -48, 0], [-46, -48, 1], [34, -48, 1], [58, -48, 0]].forEach(([wx, wy, on]) => win(wx, wy, 12, 18, on));
  win(-122, -46, 10, 16, 1); win(-100, -46, 10, 16, 0); win(68, -128, 12, 18, 1); win(68, -90, 12, 18, 0); win(68, -52, 12, 18, 1);
  c.fillStyle = lit; c.shadowColor = lit; c.shadowBlur = 8; c.beginPath(); c.arc(0, -126, 4, 0, TAU); c.fill(); c.shadowBlur = 0;
  c.fillStyle = '#5A2A10'; c.fillRect(-7, -24, 14, 24); c.fillStyle = 'rgba(255,170,60,0.6)'; c.fillRect(-5, -22, 10, 22);
  c.restore();
  // dead tree + fence + bats
  c.strokeStyle = col; c.lineCap = 'round'; cos_branch(c, W*0.08, H*0.88, -Math.PI/2 + 0.1, H*0.1, 6, 5);
  c.fillStyle = col; const fy = H*0.92; c.fillRect(0, fy, W, 2.5); c.fillRect(0, fy + 10, W, 2);
  for (let fx = 4; fx < W; fx += 9) { c.fillRect(fx, fy - 10, 2, 26); c.beginPath(); cos_addPoly(c, [[fx - 1.5, fy - 10], [fx + 1, fy - 16], [fx + 3.5, fy - 10]]); c.fill(); }
  c.fillStyle = col; c.fillRect(0, H*0.96, W, H*0.04);
  [[0.38, 0.1, 7, 0.4], [0.47, 0.17, 5, -0.6], [0.3, 0.22, 4, 0.9]].forEach(([fx, fy, sz, fl]) => cos_bat(c, W*fx, H*fy, sz, fl, '#0B0518'));
}

const cos_PG = { harborbg: 1, frostbg: 1, riftbg: 1, graveyard: 1, moon: 1, haunted: 1 };
function drawCardBg2(c, id, t, W, H) {
  if (!cos_PG[id]) return false;
  c.save();
  try {
    t = +t || 0;
    if (id === 'harborbg') cos_gHarbor(c, W, H);
    else if (id === 'frostbg') cos_gFrost(c, t, W, H);
    else if (id === 'riftbg') cos_gRift(c, t, W, H);
    else if (id === 'graveyard') cos_gGraveyard(c, t, W, H);
    else if (id === 'moon') cos_gMoon(c, t, W, H);
    else if (id === 'haunted') cos_gHaunted(c, W, H);
  } catch (e) { /* never break the card */ }
  c.restore();
  c.shadowBlur = 0; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  return true;
}

// =============== EMBLEMS ===============
const cos_PE = { anchor: 1, snowflake: 1, eye: 1, pumpkin: 1, bat: 1, ghost: 1 };
function drawEmblem2(c, id, x, y, r) {
  if (!cos_PE[id]) return false;
  c.save();
  try {
    c.translate(x, y); c.lineJoin = 'round'; c.lineCap = 'round';
    if (id === 'anchor') { c.shadowColor = 'rgba(0,0,0,0.5)'; c.shadowBlur = r*0.3; cos_anchor(c, 0, 0, r, '#F5C85A'); }
    else if (id === 'snowflake') {
      c.strokeStyle = '#E6FCFF'; c.shadowColor = '#7FD8FF'; c.shadowBlur = r*0.6; c.lineWidth = Math.max(1, r*0.14);
      c.beginPath();
      for (let k = 0; k < 6; k++) { const a = k*Math.PI/3 - Math.PI/2, ca = Math.cos(a), sa = Math.sin(a), P = (u, v) => [ca*u - sa*v, sa*u + ca*v];
        c.moveTo(0, 0); c.lineTo(ca*r, sa*r);
        [[0.45, 0.28], [0.72, 0.2]].forEach(([d, b]) => { const [x0, y0] = P(d*r, 0), [x1, y1] = P((d + b)*r, b*r), [x2, y2] = P((d + b)*r, -b*r); c.moveTo(x1, y1); c.lineTo(x0, y0); c.lineTo(x2, y2); }); }
      c.stroke(); c.shadowBlur = 0; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(0, 0, r*0.14, 0, TAU); c.fill();
    }
    else if (id === 'eye') {
      c.shadowColor = '#B57CFF'; c.shadowBlur = r*0.8;
      c.beginPath(); c.moveTo(-r, 0); c.quadraticCurveTo(0, -r*0.95, r, 0); c.quadraticCurveTo(0, r*0.95, -r, 0); c.closePath();
      c.fillStyle = '#1A0B30'; c.fill(); c.strokeStyle = '#D8B8FF'; c.lineWidth = Math.max(1, r*0.12); c.stroke(); c.shadowBlur = 0;
      const ig = c.createRadialGradient(0, 0, r*0.05, 0, 0, r*0.44); ig.addColorStop(0, '#F6E6FF'); ig.addColorStop(0.45, '#B57CFF'); ig.addColorStop(1, '#4A128A');
      c.fillStyle = ig; c.beginPath(); c.arc(0, 0, r*0.42, 0, TAU); c.fill();
      c.fillStyle = '#05010C'; c.beginPath(); c.ellipse(0, 0, r*0.1, r*0.32, 0, 0, TAU); c.fill();
      c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(r*0.14, -r*0.15, r*0.08, 0, TAU); c.fill();
      c.strokeStyle = '#C59BFF'; c.lineWidth = Math.max(0.8, r*0.08); c.beginPath();
      [-0.5, -0.17, 0.17, 0.5].forEach(f => { c.moveTo(f*r*1.3, -r*0.62 + Math.abs(f)*r*0.3); c.lineTo(f*r*1.6, -r*0.88 + Math.abs(f)*r*0.3); }); c.stroke();
    }
    else if (id === 'pumpkin') cos_pumpkin(c, 0, r*0.08, r*0.92, 0.95);
    else if (id === 'bat') { c.shadowColor = '#B57CFF'; c.shadowBlur = r*0.6; cos_bat(c, 0, r*0.2, r*1.2, -0.55, '#9A6AE8', '#FFE34A'); }
    else if (id === 'ghost') cos_ghost(c, 0, 0, r);
  } catch (e) { /* never break the card */ }
  c.restore();
  return true;
}

