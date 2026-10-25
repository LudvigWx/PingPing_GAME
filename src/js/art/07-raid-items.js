// =====================================================================
// RAID LOOT cosmetics  (raid_items.js)
//   drawHat3(c, hat, col, t)                 hats: krakencrown, mechhelm, sunhalo, hydra
//   drawCardBorder3(c, id, t, W, H, accent)  enchanted borders: tentacle (L), eclipse (M)
//   drawCardBg3(c, id, t, W, H)              live backgrounds: foundry (L), corrupted (M)
// All return true when the id was handled, false otherwise. Helpers are cosi_-prefixed.
// Deterministic (no Math.random), canvas state restored, errors swallowed.
// =====================================================================

function cosi_h(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function cosi_dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function cosi_lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i/(stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; }
function cosi_rad(c, x, y, r0, r1, stops) { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i/(stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; }
function cosi_reset(c) { c.shadowBlur = 0; c.shadowColor = 'rgba(0,0,0,0)'; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; if (c.setLineDash) c.setLineDash([]); c.lineDashOffset = 0; }
// point + inward normal on a rounded rect, by distance d along the perimeter (clockwise from top-left straight)
function cosi_rrLen(w, h, R) { return 2*(w - 2*R) + 2*(h - 2*R) + TAU*R; }
function cosi_rrd(d, x, y, w, h, R) {
  const a = w - 2*R, b = h - 2*R, q = Math.PI*R/2, P = 2*a + 2*b + 4*q;
  d = ((d % P) + P) % P;
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
// fill a tapered ribbon through centre points [x, y, width]
function cosi_ribbon(c, pts) {
  const n = pts.length, L = [], Rt = [];
  for (let i = 0; i < n; i++) {
    const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
    const hw = p[2]/2; L.push([p[0] - dy*hw, p[1] + dx*hw]); Rt.push([p[0] + dy*hw, p[1] - dx*hw]);
  }
  const e = pts[n - 1], aL = Math.atan2(L[n - 1][1] - e[1], L[n - 1][0] - e[0]), aR = Math.atan2(Rt[n - 1][1] - e[1], Rt[n - 1][0] - e[0]);
  c.beginPath(); L.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
  c.arc(e[0], e[1], Math.max(0.01, e[2]/2), aL, aR, true);
  for (let i = n - 1; i >= 0; i--) c.lineTo(Rt[i][0], Rt[i][1]);
  c.closePath();
  return [L, Rt];
}
// curling tentacle by heading integration; returns centre points [x, y, w, nx, ny] (n = inner/curl side)
function cosi_tentPts(x0, y0, len, w0, a0, curl, ph, t, N) {
  const pts = []; let x = x0, y = y0; const st = len/N, sg = curl >= 0 ? 1 : -1;
  for (let i = 0; i <= N; i++) {
    const s = i/N, a = a0 + curl*Math.pow(s, 2.4) + 0.38*Math.sin(t*2.1 + ph + s*3.6)*s;
    pts.push([x, y, w0*(1 - 0.86*s), -Math.sin(a)*sg, Math.cos(a)*sg]);
    x += Math.cos(a)*st*(1 - 0.35*s); y += Math.sin(a)*st*(1 - 0.35*s);
  }
  return pts;
}

// ============================ HATS ============================
function cosi_hatKraken(c, col, t) {
  const tent = (x0, a0, len, w0, curl, ph) => {
    const pts = cosi_tentPts(x0, -3.2, len, w0, a0, curl, ph, t, 18);
    const tip = pts[pts.length - 1];
    c.fillStyle = cosi_lin(c, x0, -3, tip[0], tip[1], ['#06262C', '#0E5A60', '#2BA39A']);
    c.shadowColor = 'rgba(40,220,200,0.55)'; c.shadowBlur = 4;
    cosi_ribbon(c, pts); c.fill(); c.shadowBlur = 0;
    c.strokeStyle = 'rgba(2,14,18,0.7)'; c.lineWidth = 0.35; c.stroke();
    // violet underside sheen + teal top highlight
    c.lineCap = 'round';
    c.strokeStyle = 'rgba(170,110,255,0.45)'; c.lineWidth = 0.55; c.beginPath();
    pts.forEach((p, i) => { const o = p[2]*0.32; i ? c.lineTo(p[0] + p[3]*o, p[1] + p[4]*o) : c.moveTo(p[0] + p[3]*o, p[1] + p[4]*o); }); c.stroke();
    c.strokeStyle = 'rgba(150,255,240,0.45)'; c.lineWidth = 0.4; c.beginPath();
    pts.forEach((p, i) => { if (i > 15) return; const o = -p[2]*0.28; i ? c.lineTo(p[0] + p[3]*o, p[1] + p[4]*o) : c.moveTo(p[0] + p[3]*o, p[1] + p[4]*o); }); c.stroke();
    // suction cups on the inner side
    for (let i = 2; i < pts.length - 2; i += 2) {
      const p = pts[i], o = p[2]*0.2, r = Math.max(0.22, p[2]*0.2), sx = p[0] + p[3]*o, sy = p[1] + p[4]*o;
      c.fillStyle = '#E8D8F2'; cosi_dot(c, sx, sy, r); c.fillStyle = '#5A3A7A'; cosi_dot(c, sx, sy, r*0.45);
    }
  };
  // outer tentacles curl outward, inner ones curl in over the pearl
  tent(-6.8, -Math.PI/2 - 0.12, 16, 3.5, -5.6, 0);
  tent(6.8, -Math.PI/2 + 0.12, 16, 3.5, 5.6, 2.2);
  tent(-3.2, -Math.PI/2 - 0.1, 17.5, 3.1, 4.4, 4.1);
  tent(3.2, -Math.PI/2 + 0.1, 17.5, 3.1, -4.4, 1.3);
  // crown band
  c.beginPath(); c.moveTo(-9, 0.3); c.lineTo(-8, -4.3); c.quadraticCurveTo(0, -5.6, 8, -4.3); c.lineTo(9, 0.3); c.quadraticCurveTo(0, 1.2, -9, 0.3); c.closePath();
  c.fillStyle = cosi_lin(c, 0, -5, 0, 1, ['#11494E', '#072A30', '#031418']); c.fill();
  c.strokeStyle = '#3FE0D0'; c.lineWidth = 0.5; c.stroke();
  c.strokeStyle = 'rgba(181,124,255,0.6)'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(-8.4, -1.2); c.quadraticCurveTo(0, -0.3, 8.4, -1.2); c.stroke();
  // bioluminescent studs
  for (let k = 0; k < 6; k++) {
    const x = -7 + k*2.8 + (k > 2 ? 0 : 0); if (Math.abs(x) < 2.6) continue;
    const g = 0.5 + 0.5*Math.sin(t*2.6 - k*0.9);
    c.fillStyle = 'rgba(90,255,230,' + (0.35 + 0.6*g) + ')'; c.shadowColor = '#4FFFE0'; c.shadowBlur = 3 + 4*g; cosi_dot(c, x, -2.4, 0.55);
  }
  c.shadowBlur = 0;
  // shell cup + glowing pearl
  c.fillStyle = '#0B3A40'; c.beginPath(); c.moveTo(-3, -3.2); c.quadraticCurveTo(0, -1.2, 3, -3.2); c.quadraticCurveTo(0, -4.4, -3, -3.2); c.fill();
  c.strokeStyle = '#3FE0D0'; c.lineWidth = 0.35; c.stroke();
  const py = -5.7 + Math.sin(t*1.8)*0.25, pg = 0.5 + 0.5*Math.sin(t*2.2);
  c.fillStyle = cosi_rad(c, 0, py, 0, 6, [[0, 'rgba(220,255,250,' + (0.35 + 0.25*pg) + ')'], [1, 'rgba(120,255,235,0)']]); cosi_dot(c, 0, py, 6);
  c.shadowColor = '#BFFFF6'; c.shadowBlur = 8 + 6*pg;
  c.fillStyle = cosi_rad(c, -0.7, py - 0.8, 0.2, 2.6, ['#FFFFFF', '#F4ECFF', '#BFD8E8', '#8FA8C8']); cosi_dot(c, 0, py, 2.3);
  c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,190,230,0.35)'; c.beginPath(); c.arc(0, py, 2.3, 0.2, 1.6); c.lineTo(0, py); c.fill();
  c.fillStyle = '#FFFFFF'; cosi_dot(c, -0.75, py - 0.8, 0.55);
}

function cosi_hatMech(c, col, t) {
  c.lineJoin = 'round';
  // exhaust pipes (behind the dome) + puffs
  [-1, 1].forEach(s => {
    c.save(); c.translate(s*7.6, -10.2); c.rotate(s*0.35);
    c.fillStyle = '#2A2F38'; c.fillRect(-1.1, -4.2, 2.2, 4.4); c.fillStyle = '#4A525E'; c.fillRect(-1.4, -4.8, 2.8, 1.1);
    c.fillStyle = 'rgba(255,140,40,' + (0.55 + 0.35*Math.sin(t*9 + s)) + ')'; c.fillRect(-0.8, -4.9, 1.6, 0.45);
    c.restore();
  });
  [-1, 1].forEach(s => {
    const mx = s*(7.6 + Math.sin(0.35)*4.5), my = -10.2 - Math.cos(0.35)*4.6;
    for (let k = 0; k < 4; k++) {
      const p = (t*0.8 + k/4 + (s > 0 ? 0.13 : 0)) % 1, r = 0.5 + p*2.1;
      c.fillStyle = 'rgba(170,178,195,' + (0.5*(1 - p)*Math.min(1, p*6)) + ')';
      cosi_dot(c, mx + s*p*3.2 + Math.sin(p*6 + k)*0.5, my - p*7.5, r);
    }
  });
  // cheek plates
  [-1, 1].forEach(s => {
    c.fillStyle = cosi_lin(c, s*9, -9, s*11.5, 0, ['#4C5462', '#22262E']);
    c.beginPath(); c.moveTo(s*8.6, -9.4); c.lineTo(s*11.2, -7.8); c.lineTo(s*11.4, -1.2); c.lineTo(s*9.6, 0.4); c.lineTo(s*8.6, 0.4); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.6)'; c.lineWidth = 0.35; c.stroke();
    c.strokeStyle = 'rgba(0,0,0,0.75)'; c.lineWidth = 0.4; c.beginPath();
    for (let k = 0; k < 3; k++) { c.moveTo(s*9.5, -5.6 + k*1.3); c.lineTo(s*10.8, -5.2 + k*1.3); } c.stroke();
    c.fillStyle = '#9AA6B8'; cosi_dot(c, s*10.2, -7.4, 0.35); cosi_dot(c, s*10.4, -0.9, 0.35);
  });
  // main dome
  const dome = () => { c.beginPath(); c.moveTo(-9.2, 0.4); c.lineTo(-9.2, -7.2); c.lineTo(-7, -11.6); c.lineTo(-3.2, -13.4); c.lineTo(3.2, -13.4); c.lineTo(7, -11.6); c.lineTo(9.2, -7.2); c.lineTo(9.2, 0.4); c.closePath(); };
  dome(); c.fillStyle = cosi_lin(c, -6, -14, 5, 1, ['#8A94A6', '#59616F', '#363C47', '#1E2229']); c.fill();
  c.strokeStyle = '#14171C'; c.lineWidth = 0.55; c.stroke();
  // panel seams + rivets
  c.strokeStyle = 'rgba(10,12,16,0.75)'; c.lineWidth = 0.35; c.beginPath();
  c.moveTo(-3.6, -13.2); c.lineTo(-4.4, -8); c.moveTo(3.6, -13.2); c.lineTo(4.4, -8); c.moveTo(-9, -7.6); c.lineTo(9, -7.6); c.stroke();
  c.strokeStyle = 'rgba(220,230,245,0.35)'; c.lineWidth = 0.35; c.beginPath(); c.moveTo(-6.7, -11.3); c.lineTo(-3.1, -13); c.lineTo(3.1, -13); c.stroke();
  c.fillStyle = '#B8C2D2'; [[-7.6, -8.6], [7.6, -8.6], [-2.4, -12.2], [2.4, -12.2]].forEach(p => cosi_dot(c, p[0], p[1], 0.3));
  // crest fin with blinking beacon
  c.fillStyle = cosi_lin(c, 0, -16, 0, -12, ['#6A7484', '#2A2F38']);
  c.beginPath(); c.moveTo(-1.3, -13.2); c.lineTo(-0.8, -16.4); c.lineTo(0.8, -16.4); c.lineTo(1.3, -13.2); c.closePath(); c.fill();
  const bl = Math.sin(t*4) > 0.2 ? 1 : 0.25;
  c.fillStyle = 'rgba(255,150,50,' + bl + ')'; c.shadowColor = '#FF8A2A'; c.shadowBlur = 6*bl; c.fillRect(-0.7, -16.9, 1.4, 0.7); c.shadowBlur = 0;
  // visor recess
  c.beginPath(); c.moveTo(-8.4, -7.3); c.lineTo(8.4, -7.3); c.lineTo(7.4, -3.7); c.lineTo(-7.4, -3.7); c.closePath();
  c.fillStyle = '#07080B'; c.fill(); c.strokeStyle = '#5E6878'; c.lineWidth = 0.35; c.stroke();
  // glowing slit + scanner
  c.save(); c.beginPath(); if (c.roundRect) c.roundRect(-6.9, -6.15, 13.8, 1.35, 0.6); else c.rect(-6.9, -6.15, 13.8, 1.35); c.clip();
  c.fillStyle = 'rgba(255,100,20,0.5)'; c.fillRect(-7, -6.2, 14, 1.5);
  const sx = Math.sin(t*1.9)*5.6, dir = Math.cos(t*1.9) >= 0 ? 1 : -1;
  for (let k = 3; k >= 1; k--) { c.fillStyle = 'rgba(255,150,50,' + (0.22*(4 - k)) + ')'; c.fillRect(sx - dir*k*1.4 - 1.2, -6.2, 2.4, 1.5); }
  c.fillStyle = cosi_rad(c, sx, -5.5, 0, 2.6, ['#FFFFFF', '#FFD08A', 'rgba(255,120,30,0)']); c.fillRect(sx - 3, -6.2, 6, 1.5);
  c.restore();
  c.shadowColor = '#FF7A1A'; c.shadowBlur = 8; c.strokeStyle = 'rgba(255,140,50,0.75)'; c.lineWidth = 0.3;
  c.beginPath(); if (c.roundRect) c.roundRect(-6.9, -6.15, 13.8, 1.35, 0.6); else c.rect(-6.9, -6.15, 13.8, 1.35); c.stroke(); c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,140,50,0.18)'; c.fillRect(-7, -3.7, 14, 0.6);
  // chin guard vents
  c.fillStyle = '#2A2F38'; c.beginPath(); c.moveTo(-7.2, -3.3); c.lineTo(7.2, -3.3); c.lineTo(6.2, 0.4); c.lineTo(-6.2, 0.4); c.closePath(); c.fill();
  c.strokeStyle = '#0A0B0E'; c.lineWidth = 0.5; c.beginPath();
  for (let x = -4.5; x <= 4.6; x += 1.5) { c.moveTo(x, -2.6); c.lineTo(x*0.94, -0.5); } c.stroke();
  c.strokeStyle = 'rgba(255,120,30,' + (0.25 + 0.2*Math.sin(t*3)) + ')'; c.lineWidth = 0.25; c.beginPath();
  for (let x = -4.5; x <= 4.6; x += 1.5) { c.moveTo(x + 0.2, -2.3); c.lineTo(x*0.94 + 0.2, -0.8); } c.stroke();
}

function cosi_hatSun(c, col, t) {
  const cy = -0.6, pulse = 0.5 + 0.5*Math.sin(t*2.4);
  // soft radiance
  c.fillStyle = cosi_rad(c, 0, cy, 1, 17, [[0, 'rgba(255,240,180,0.55)'], [0.45, 'rgba(255,190,60,0.18)'], [1, 'rgba(255,140,30,0)']]);
  c.beginPath(); c.arc(0, cy, 17, Math.PI, 0); c.closePath(); c.fill();
  // rotating ray fan (only the upper half is lit; rays fade at the horizon)
  const N = 22, sp = TAU/N, rot = t*0.22;
  const gr = cosi_rad(c, 0, cy, 2.5, 16, [[0, '#FFFFFF'], [0.25, '#FFF1A8'], [0.6, '#FFC23E'], [1, 'rgba(255,120,30,0)']]);
  c.fillStyle = gr; c.shadowColor = '#FFB23E'; c.shadowBlur = 6;
  for (let k = 0; k < N; k++) {
    let a = ((k*sp + rot) % TAU + TAU) % TAU; if (a < Math.PI + 0.05 || a > TAU - 0.05) continue;
    const up = Math.sin(a - Math.PI), fade = Math.min(1, up*3.2);
    const long = k % 2 === 0, L = (long ? 14.5 : 9.5)*(0.88 + 0.14*Math.sin(t*3 + k*1.7)), bw = long ? 1.25 : 0.85;
    const ca = Math.cos(a), sa = Math.sin(a);
    c.globalAlpha = fade;
    c.beginPath(); c.moveTo(ca*3.6 - sa*bw, cy + sa*3.6 + ca*bw); c.lineTo(ca*L, cy + sa*L); c.lineTo(ca*3.6 + sa*bw, cy + sa*3.6 - ca*bw); c.closePath(); c.fill();
  }
  c.globalAlpha = 1; c.shadowBlur = 0;
  // thin shimmer rays (counter-rotating)
  c.strokeStyle = 'rgba(255,250,220,0.45)'; c.lineWidth = 0.25; c.beginPath();
  for (let k = 0; k < 11; k++) {
    const a = ((k*TAU/11 - t*0.35) % TAU + TAU) % TAU; if (a < Math.PI + 0.35 || a > TAU - 0.35) continue;
    const L = 9.5 + 2*Math.sin(t*4 + k*2.3); c.moveTo(Math.cos(a)*5, cy + Math.sin(a)*5); c.lineTo(Math.cos(a)*L, cy + Math.sin(a)*L);
  }
  c.stroke();
  // golden crown arc
  c.strokeStyle = cosi_lin(c, -7, 0, 7, 0, ['#B8780A', '#FFE58A', '#FFF6D0', '#FFE58A', '#B8780A']); c.lineWidth = 1.1;
  c.beginPath(); c.arc(0, cy, 6.3 + pulse*0.3, Math.PI + 0.12, TAU - 0.12); c.stroke();
  c.fillStyle = '#FFF6D0'; [-0.5, -0.27, -0.73].forEach((f, i) => { const a = f*Math.PI, r = 6.3 + pulse*0.3; star4(c, Math.cos(a)*r, cy + Math.sin(a)*r, i ? 0.9 : 1.4); });
  // white-hot core
  c.shadowColor = '#FFFFFF'; c.shadowBlur = 10 + 6*pulse;
  c.fillStyle = cosi_rad(c, 0, cy, 0, 4.4, ['#FFFFFF', '#FFFFFF', '#FFF3B0', '#FFB23E']);
  c.beginPath(); c.arc(0, cy, 3.9 + pulse*0.35, Math.PI, 0); c.closePath(); c.fill();
  c.shadowBlur = 0;
  c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(-4.6, cy - 0.45, 9.2, 0.6);
}

const cosi_HYD = ['.#...#....', '.##..##...', '#########.', '##e#######', '##########', '#####w.w.w'];
const cosi_JAW = ['#####w.w..', '########..'];
function cosi_hatHydra(c, col, t) {
  const px = 0.72, snap = v => Math.round(v/px)*px;
  const step = Math.floor(t*7), gl = cosi_h(step*1.37) > 0.8, gdx = gl ? (cosi_h(step*2.9) - 0.5)*3.2 : 0;
  const heads = [
    { b: -4.3, hx: -7.8, hy: -10.5, dir: -1, col: '#FF3FD0', dk: '#8A1A72', ph: 0 },
    { b: 4.3, hx: 7.8, hy: -10.5, dir: 1, col: '#3EE6FF', dk: '#146A8A', ph: 2.1 },
    { b: 0, hx: -0.8, hy: -13.2, dir: 1, col: '#7CFF3A', dk: '#2E7A10', ph: 4.2 }
  ];
  const drawAll = (ox, tint) => {
    // body mound
    c.fillStyle = tint || '#3A1A5A';
    for (let x = -6.5; x <= 6.5; x += px) c.fillRect(snap(x) + ox, -px*2, px, px*2);
    heads.forEach((H, i) => {
      const bob = Math.sin(t*2.6 + H.ph)*1.3, sway = Math.sin(t*1.7 + H.ph)*0.6;
      const hx = H.hx + sway, hy = H.hy + bob;
      const jump = gl && i === (step % 3) ? px*2*(cosi_h(step) > 0.5 ? 1 : -1) : 0;
      // pixel neck along a quadratic curve
      const cx = H.b + (hx - H.b)*0.15, cy = hy*0.45, nk = s => [(1 - s)*(1 - s)*H.b + 2*(1 - s)*s*cx + s*s*hx, (1 - s)*(1 - s)*(-px) + 2*(1 - s)*s*cy + s*s*(hy + px)];
      for (let k = 0; k <= 20; k++) {
        const s = k/20, [x, y] = nk(s), nw = s < 0.4 ? 3 : 2;
        c.fillStyle = tint || H.col; c.fillRect(snap(x - px*nw/2) + ox, snap(y), px*nw, px);
        if (!tint) { c.fillStyle = H.dk; c.fillRect(snap(x - px*nw/2) + ox + (H.dir > 0 ? 0 : px*(nw - 1)), snap(y), px, px); }
      }
      if (!tint) { c.fillStyle = '#F4F0FF'; for (let k = 3; k <= 17; k += 4) { const [x, y] = nk(k/20); c.fillRect(snap(x - px) + ox + (H.dir > 0 ? px*2 : -px), snap(y), px*0.7, px*0.7); } }
      // head sprite (anchor at back-bottom)
      const open = Math.sin(t*2.6 + H.ph) > 0.35 ? 1 : 0, rows = cosi_HYD.concat(open ? ['..........'].concat(cosi_JAW) : cosi_JAW.slice(1));
      const x0 = snap(hx) + ox + jump, y0 = snap(hy) - px*6;
      rows.forEach((row, r) => { for (let q = 0; q < row.length; q++) {
        const ch = row[q]; if (ch === '.') continue;
        const X = H.dir > 0 ? x0 - px*2 + q*px : x0 + px*2 - (q + 1)*px, Y = y0 + r*px;
        if (tint) { c.fillStyle = tint; c.fillRect(X, Y, px, px); continue; }
        c.fillStyle = ch === 'e' ? '#FFFFFF' : ch === 'w' ? '#F4F0FF' : r < 2 ? '#F4F0FF' : (r >= 5 ? H.dk : H.col);
        c.fillRect(X, Y, px, px);
      } });
      if (!tint) {
        // glowing eye + breath spark
        const ex = H.dir > 0 ? x0 - px*2 + 2*px : x0 + px*2 - 3*px;
        c.fillStyle = '#FF2A4A'; c.shadowColor = '#FF2A4A'; c.shadowBlur = 4; c.fillRect(ex + px*0.2, y0 + 3*px + px*0.2, px*0.6, px*0.6); c.shadowBlur = 0;
        if (open) { c.fillStyle = H.col; const mx = H.dir > 0 ? x0 - px*2 + 9*px : x0 + px*2 - 10*px;
          c.globalAlpha = 0.5 + 0.5*Math.sin(t*20 + i); c.fillRect(mx + H.dir*px*1.2, y0 + 6*px, px, px); c.fillRect(mx + H.dir*px*2.6, y0 + 5.6*px, px*0.6, px*0.6); c.globalAlpha = 1; }
      }
    });
  };
  if (gl) {
    c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.75;
    drawAll(-gdx - 0.6, '#FF1A3A'); drawAll(gdx + 0.6, '#1AE0FF');
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
  }
  c.shadowColor = 'rgba(181,124,255,0.6)'; c.shadowBlur = 3;
  drawAll(0, null);
  c.shadowBlur = 0;
  if (gl) { // glitch slice bars
    c.fillStyle = 'rgba(255,255,255,0.55)';
    for (let k = 0; k < 2; k++) c.fillRect(-12 + cosi_h(step + k*7)*14, -16 + cosi_h(step*3 + k)*15, 4 + cosi_h(step + k)*6, 0.35);
  }
}

const cosi_HATS = { krakencrown: cosi_hatKraken, mechhelm: cosi_hatMech, sunhalo: cosi_hatSun, hydra: cosi_hatHydra };
function drawHat3(c, hat, col, t) {
  const fn = cosi_HATS[hat];
  if (!fn) return false;
  c.save();
  try { fn(c, col, +t || 0); } catch (e) { /* never break the paddle */ }
  c.restore();
  return true;
}

// ============================ BORDERS ============================
function cosi_bTentacle(c, t, W, H) {
  const x = 5, y = 5, w = W - 10, h = H - 10, R = 20, a = w - 2*R, b = h - 2*R, q = Math.PI*R/2, P = cosi_rrLen(w, h, R);
  const dBC = a + q + b + q + a/2; // bottom centre
  const gl = 0.5 + 0.5*Math.sin(t*1.6);
  const band = cosi_lin(c, 0, 0, W, H, ['#0A2630', '#160A2E', '#0A2630', '#1E0A36', '#0A2630']);
  const drawBand = () => {
    c.strokeStyle = '#030A10'; c.lineWidth = 11; rr(c, x, y, w, h, R); c.stroke();
    c.strokeStyle = band; c.lineWidth = 8; c.stroke();
    c.strokeStyle = 'rgba(80,255,225,' + (0.3 + 0.3*gl) + ')'; c.lineWidth = 1; rr(c, x + 5.5, y + 5.5, w - 11, h - 11, R - 5); c.stroke();
    c.strokeStyle = 'rgba(181,124,255,' + (0.45 - 0.2*gl) + ')'; c.lineWidth = 0.8; rr(c, x - 4, y - 4, w + 8, h + 8, R + 4); c.stroke();
    for (let k = 0; k < 14; k++) { // bioluminescent pulses travelling on the band
      const p = cosi_rrd((k/14 + t*0.02)*P, x, y, w, h, R), f = 0.5 + 0.5*Math.sin(t*3 + k*2.3);
      c.fillStyle = k % 2 ? 'rgba(90,255,230,' + (0.3 + 0.6*f) + ')' : 'rgba(200,150,255,' + (0.3 + 0.6*f) + ')';
      cosi_dot(c, p[0], p[1], 1.1);
    }
  };
  // abyssal glow + band
  c.strokeStyle = 'rgba(42,216,200,0.08)'; c.lineWidth = 22; rr(c, x, y, w, h, R); c.stroke(); c.strokeStyle = 'rgba(140,80,255,0.10)'; c.lineWidth = 15; c.stroke();
  // tentacles weaving over / under the frame
  const tentacle = (dA, dB, w0, ph, curlSg) => {
    const slide = Math.sin(t*0.33 + ph)*P*0.012, len = Math.abs(dB - dA), M = Math.max(40, Math.round(len/5)), dir = dB > dA ? 1 : -1;
    const pts = [], behind = [];
    for (let j = 0; j <= M; j++) {
      const s = j/M, d = dA + (dB - dA)*s + slide*(0.3 + s), [px, py, nx, ny] = cosi_rrd(d, x, y, w, h, R);
      const env = Math.min(1, s*6), ph2 = (s*len)/46*TAU - t*1.5 + ph;
      const o = Math.sin(ph2)*7.5*env;
      pts.push([px + nx*o, py + ny*o, (w0*(1 - 0.78*s) + 1.4)*(1 + 0.08*Math.sin(t*2 + s*9)), nx, ny, d]);
      behind.push(Math.cos(ph2) < 0 && env > 0.5);
    }
    // curled tip
    let ex = pts[M][0], ey = pts[M][1], hd = Math.atan2(pts[M][1] - pts[M - 1][1], pts[M][0] - pts[M - 1][0]), wd = pts[M][2];
    const sg = curlSg*dir;
    for (let i = 1; i <= 16; i++) { hd += sg*(0.3 + i*0.035 + 0.08*Math.sin(t*1.3 + ph)); const st = 3.4*(1 - i/19); ex += Math.cos(hd)*st; ey += Math.sin(hd)*st; wd *= 0.92; pts.push([ex, ey, wd, -Math.sin(hd)*sg, Math.cos(hd)*sg, null]); behind.push(false); }
    const tip = pts[pts.length - 1], flesh = cosi_lin(c, pts[0][0], pts[0][1], tip[0], tip[1], ['#0F6A6A', '#16807A', '#1E6E8A', '#5A34A8']);
    // 1) whole tentacle in shade (the far side of each coil)
    cosi_ribbon(c, pts);
    c.strokeStyle = 'rgba(60,240,220,0.12)'; c.lineWidth = 6; c.stroke();
    c.strokeStyle = '#02080C'; c.lineWidth = 2; c.stroke();
    c.fillStyle = flesh; c.fill(); c.fillStyle = 'rgba(4,10,24,0.55)'; c.fill();
    return () => {
    // 3) near side of each coil (plus the curled tip) on top
    c.lineCap = 'round'; c.lineJoin = 'round';
    const segs = []; let s0 = -1;
    for (let j = 0; j <= pts.length; j++) { const on = j < pts.length && !behind[j]; if (on && s0 < 0) s0 = j; if (!on && s0 >= 0) { segs.push(pts.slice(Math.max(0, s0 - 1), Math.min(pts.length, j + 1))); s0 = -1; } }
    segs.forEach(sp => {
      if (sp.length < 2) return;
      cosi_ribbon(c, sp); c.strokeStyle = '#02080C'; c.lineWidth = 1.6; c.stroke(); c.fillStyle = flesh; c.fill();
      const edge = (f, col, lw) => { c.strokeStyle = col; c.lineWidth = lw; c.beginPath();
        sp.forEach((p, j) => { const o = p[2]*f; j ? c.lineTo(p[0] + p[3]*o, p[1] + p[4]*o) : c.moveTo(p[0] + p[3]*o, p[1] + p[4]*o); }); c.stroke(); };
      edge(0.26, 'rgba(210,170,255,0.6)', 1.5);
      edge(-0.2, 'rgba(150,255,235,0.6)', 1.2);
      edge(-0.28, 'rgba(235,255,250,0.55)', 0.5);
    });
    // suction cups on the underside, only where the tentacle is in front
    for (let j = 3; j < pts.length - 3; j += 3) {
      if (behind[j] || behind[j - 1] || behind[j + 1]) continue;
      const p = pts[j], r = Math.max(0.7, p[2]*0.16), o = p[2]*0.2, sx = p[0] + p[3]*o, sy = p[1] + p[4]*o;
      c.fillStyle = '#F2E2FF'; cosi_dot(c, sx, sy, r); c.fillStyle = '#7A4AA8'; cosi_dot(c, sx, sy, r*0.55); c.fillStyle = '#2A1040'; cosi_dot(c, sx, sy, r*0.25);
    }
    };
  };
  const fronts = [tentacle(dBC - 4, P + a*0.55, 8, 0, 1), tentacle(dBC + 4, a + q + b*0.14, 7.5, 1.7, -1)];
  drawBand(); // the frame passes in front of the far side of every coil
  fronts.forEach(f => f());
  // leviathan eye at the bottom centre (tentacle roots)
  const [ox, oy] = cosi_rrd(dBC, x, y, w, h, R), blink = ((t*0.31) % 1) > 0.965 ? 0.15 : 1;
  c.fillStyle = cosi_rad(c, ox, oy, 2, 22, [[0, 'rgba(80,255,225,0.35)'], [1, 'rgba(80,255,225,0)']]); cosi_dot(c, ox, oy, 22);
  c.fillStyle = '#05141A'; cosi_dot(c, ox, oy, 11); c.strokeStyle = '#3FE0D0'; c.lineWidth = 1.4; c.stroke();
  c.strokeStyle = 'rgba(181,124,255,0.8)'; c.lineWidth = 0.8; c.beginPath(); c.arc(ox, oy, 13, 0, TAU); c.stroke();
  c.save(); c.beginPath(); c.ellipse(ox, oy, 8.5, 6*blink, 0, 0, TAU); c.clip();
  c.fillStyle = cosi_rad(c, ox, oy, 0, 8.5, ['#E8FFB0', '#7CFFB2', '#1B8A86']); c.fillRect(ox - 9, oy - 7, 18, 14);
  const lk = Math.sin(t*0.7)*2.5;
  c.fillStyle = '#05050C'; c.beginPath(); c.ellipse(ox + lk, oy, 1.3, 5.6, 0, 0, TAU); c.fill();
  c.restore();
  // rising bubbles along the sides
  c.strokeStyle = 'rgba(160,255,240,0.55)'; c.lineWidth = 0.7;
  for (let k = 0; k < 10; k++) {
    const side = k % 2, bx = side ? W - 15 - cosi_h(k)*6 : 15 + cosi_h(k)*6, by = H - 20 - ((t*(10 + k*1.3) + cosi_h(k*3)*H) % (H*0.6));
    c.beginPath(); c.arc(bx + Math.sin(t*2 + k)*1.5, by, 1 + (k % 3)*0.6, 0, TAU); c.stroke();
  }
}

function cosi_bEclipse(c, t, W, H) {
  const x = 5, y = 5, w = W - 10, h = H - 10, R = 20, P = cosi_rrLen(w, h, R);
  // black band with ember-red undertone
  c.strokeStyle = '#000000'; c.lineWidth = 11; rr(c, x, y, w, h, R); c.stroke();
  c.strokeStyle = cosi_lin(c, 0, 0, W, H, ['#1A0604', '#050203', '#160404', '#050203', '#1A0604']); c.lineWidth = 7; rr(c, x, y, w, h, R); c.stroke();
  // corona tongues (inner + outer), one path per layer
  c.globalCompositeOperation = 'lighter';
  const N = Math.round(P/7);
  c.strokeStyle = 'rgba(255,90,20,0.09)'; c.lineWidth = 32; rr(c, x, y, w, h, R); c.stroke(); c.strokeStyle = 'rgba(255,110,30,0.12)'; c.lineWidth = 20; c.stroke();
  const tongues = (side, scale, col) => {
    c.fillStyle = col; c.beginPath();
    for (let k = 0; k < N; k++) {
      const d = (k + 0.5*side)/N*P + Math.sin(t*0.6 + k)*1.5, [px, py, nx, ny] = cosi_rrd(d, x, y, w, h, R);
      const f = 0.5 + 0.5*Math.sin(t*4.3 + k*1.7)*Math.sin(t*2.1 + k*0.83 + side);
      const L = (2 + 7*f*f + 3*cosi_h(k*7 + side))*scale*(side ? 0.5 : 1), sw = 2.2*scale, ns = side ? -1 : 1, bx = px + nx*5.2*ns, by = py + ny*5.2*ns;
      const tx = -ny, ty = nx, lean = Math.sin(t*1.7 + k*0.4)*L*0.35;
      c.moveTo(bx - tx*sw, by - ty*sw);
      c.quadraticCurveTo(bx + nx*ns*L*0.5 + tx*lean*0.3, by + ny*ns*L*0.5 + ty*lean*0.3, bx + nx*ns*L + tx*lean, by + ny*ns*L + ty*lean);
      c.quadraticCurveTo(bx + nx*ns*L*0.5 + tx*lean*0.3, by + ny*ns*L*0.5 + ty*lean*0.3, bx + tx*sw, by + ty*sw);
      c.closePath();
    }
    c.fill();
  };
  tongues(0, 1.3, 'rgba(255,70,10,0.35)');
  tongues(0, 1, 'rgba(255,100,20,0.6)');
  tongues(0, 0.55, 'rgba(255,210,110,0.75)');
  tongues(1, 1, 'rgba(255,110,30,0.55)');
  c.globalCompositeOperation = 'source-over';
  c.strokeStyle = '#000000'; c.lineWidth = 9; rr(c, x, y, w, h, R); c.stroke();
  c.strokeStyle = cosi_lin(c, 0, 0, W, H, ['#140403', '#030102', '#120303', '#030102', '#140403']); c.lineWidth = 5; c.stroke();
  c.globalCompositeOperation = 'lighter';
  // the burning limb lines
  c.strokeStyle = 'rgba(255,170,70,0.35)'; c.lineWidth = 4; rr(c, x + 5.2, y + 5.2, w - 10.4, h - 10.4, R - 5); c.stroke();
  c.strokeStyle = 'rgba(255,214,140,0.95)'; c.lineWidth = 1.2; c.stroke();
  c.strokeStyle = 'rgba(255,150,60,0.7)'; c.lineWidth = 0.9; rr(c, x - 5.2, y - 5.2, w + 10.4, h + 10.4, R + 5); c.stroke();
  // prominences: plasma loops rising from the inner edge
  const proms = [0.08, 0.3, 0.44, 0.58, 0.7, 0.84, 0.95];
  proms.forEach((u, k) => {
    const p = (t*0.17 + cosi_h(k*3.3)) % 1, A = Math.sin(p*Math.PI); if (A < 0.05) return;
    const d = u*P, sp = 9 + cosi_h(k)*6, [ax, ay, nx, ny] = cosi_rrd(d - sp, x, y, w, h, R), [bx, by] = cosi_rrd(d + sp, x, y, w, h, R), [mx, my] = cosi_rrd(d, x, y, w, h, R);
    const ht = 5 + A*(12 + cosi_h(k*5)*10), cx = mx + nx*(5 + ht*1.6), cy = my + ny*(5 + ht*1.6);
    c.globalAlpha = A;
    c.beginPath(); c.moveTo(ax + nx*5, ay + ny*5); c.quadraticCurveTo(cx, cy, bx + nx*5, by + ny*5);
    c.strokeStyle = 'rgba(255,80,20,0.25)'; c.lineWidth = 7; c.stroke();
    c.strokeStyle = 'rgba(255,90,30,0.9)'; c.lineWidth = 2.6; c.stroke();
    c.strokeStyle = 'rgba(255,236,190,0.9)'; c.lineWidth = 0.9; c.stroke();
    // droplets falling back
    c.fillStyle = 'rgba(255,200,120,0.9)';
    for (let i = 0; i < 3; i++) { const s = (p*2 + i/3) % 1, qx = (1 - s)*(1 - s)*ax + 2*(1 - s)*s*cx + s*s*bx, qy = (1 - s)*(1 - s)*ay + 2*(1 - s)*s*cy + s*s*by; cosi_dot(c, qx + nx*5, qy + ny*5, 0.9); }
  });
  c.globalAlpha = 1;
  // crescent moons in the corners (eclipse phases)
  c.globalCompositeOperation = 'source-over';
  [[x + 9, y + 9], [x + w - 9, y + 9], [x + w - 9, y + h - 9], [x + 9, y + h - 9]].forEach(([cx, cy], k) => {
    const ph = 1.7 + Math.sin(t*0.5 + k*1.6)*1.4;
    c.fillStyle = '#FFD890'; c.shadowColor = '#FF9A3A'; c.shadowBlur = 6; cosi_dot(c, cx, cy, 4.2); c.shadowBlur = 0;
    c.fillStyle = '#030104'; cosi_dot(c, cx + ph, cy - ph*0.3, 4);
  });
  // eclipsed sun medallion at top centre
  const mx = W/2, my = y + 8, rot = t*0.12;
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = cosi_rad(c, mx, my, 10, 40, [[0, 'rgba(255,220,150,0.75)'], [0.35, 'rgba(255,140,40,0.32)'], [1, 'rgba(255,80,20,0)']]); cosi_dot(c, mx, my, 40);
  // corona streamers
  c.fillStyle = cosi_rad(c, mx, my, 12, 34, [[0, 'rgba(255,245,215,0.95)'], [0.5, 'rgba(255,170,70,0.45)'], [1, 'rgba(255,90,20,0)']]);
  c.beginPath();
  for (let k = 0; k < 18; k++) {
    const a = rot + k/18*TAU + Math.sin(t*0.8 + k)*0.05, L = 18 + (k % 3 === 0 ? 14 : 5) + 4*Math.sin(t*2.2 + k*1.9), bw = 0.12 + (k % 3 === 0 ? 0.05 : 0);
    c.moveTo(mx + Math.cos(a - bw)*12, my + Math.sin(a - bw)*12); c.lineTo(mx + Math.cos(a)*L, my + Math.sin(a)*L); c.lineTo(mx + Math.cos(a + bw)*12, my + Math.sin(a + bw)*12); c.closePath();
  }
  c.fill();
  // flares: arcs licking off the limb
  for (let k = 0; k < 3; k++) {
    const p = (t*0.25 + k/3) % 1, A = Math.sin(p*Math.PI), a = -rot*2 + k*2.1;
    c.strokeStyle = 'rgba(255,170,80,' + (0.8*A) + ')'; c.lineWidth = 1.4; c.beginPath(); c.arc(mx + Math.cos(a)*14, my + Math.sin(a)*14, 3 + A*4, a - 2.2, a + 2.2); c.stroke();
  }
  c.globalCompositeOperation = 'source-over';
  // moon disc + chromosphere rim
  c.shadowColor = '#FFE0A0'; c.shadowBlur = 14;
  c.fillStyle = '#020103'; cosi_dot(c, mx, my, 12.5); c.shadowBlur = 0;
  c.strokeStyle = 'rgba(255,240,210,0.95)'; c.lineWidth = 1.1; c.beginPath(); c.arc(mx, my, 12.6, 0, TAU); c.stroke();
  c.strokeStyle = 'rgba(255,60,90,0.85)'; c.lineWidth = 1; c.beginPath(); c.arc(mx, my, 13.6, Math.PI*0.65 + Math.sin(t*0.6)*0.3, Math.PI*1.25 + Math.sin(t*0.6)*0.3); c.stroke();
  c.fillStyle = cosi_rad(c, mx - 4, my - 4, 0, 13, [[0, 'rgba(80,60,90,0.35)'], [1, 'rgba(0,0,0,0)']]); cosi_dot(c, mx, my, 12);
  // diamond ring bead
  const da = -2.35 + 0.35*Math.sin(t*0.45), dx = mx + Math.cos(da)*12.8, dy = my + Math.sin(da)*12.8, tw = 0.75 + 0.25*Math.sin(t*5);
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = cosi_rad(c, dx, dy, 0, 9, [[0, 'rgba(255,255,255,0.95)'], [0.4, 'rgba(255,230,180,0.35)'], [1, 'rgba(255,200,120,0)']]); cosi_dot(c, dx, dy, 9);
  c.fillStyle = '#FFFFFF'; star4(c, dx, dy, 10*tw); cosi_dot(c, dx, dy, 2);
  c.fillStyle = 'rgba(255,240,220,0.7)'; c.fillRect(dx - 20*tw, dy - 0.5, 40*tw, 1);
  c.globalCompositeOperation = 'source-over';
}

const cosi_PB = { tentacle: cosi_bTentacle, eclipse: cosi_bEclipse };
function drawCardBorder3(c, id, t, W, H, accent) {
  const fn = cosi_PB[id];
  if (!fn) return false;
  c.save();
  try { c.lineJoin = 'round'; fn(c, +t || 0, W, H); } catch (e) { /* never break the card */ }
  c.restore();
  cosi_reset(c);
  return true;
}

// ============================ BACKGROUNDS ============================
function cosi_gear(c, x, y, r, teeth, rot) {
  c.beginPath();
  const n = teeth*4;
  for (let i = 0; i <= n; i++) {
    const a = rot + i/n*TAU, rad = (i % 4 === 0 || i % 4 === 1) ? r : r*0.86;
    i ? c.lineTo(x + Math.cos(a)*rad, y + Math.sin(a)*rad) : c.moveTo(x + Math.cos(a)*rad, y + Math.sin(a)*rad);
  }
  c.closePath();
  for (let k = 0; k < 5; k++) { const a = rot + k/5*TAU + 0.6, hx = x + Math.cos(a)*r*0.5, hy = y + Math.sin(a)*r*0.5; c.moveTo(hx + r*0.2, hy); c.arc(hx, hy, r*0.2, 0, TAU); }
  c.moveTo(x + r*0.12, y); c.arc(x, y, r*0.12, 0, TAU);
}
function cosi_gFoundry(c, t, W, H) {
  const m = Math.min(W, H);
  c.fillStyle = cosi_lin(c, 0, 0, 0, H, [[0, '#0C0504'], [0.5, '#1E0A05'], [0.85, '#3A1406'], [1, '#521C06']]); c.fillRect(0, 0, W, H);
  const sx = W*0.7, poolY = H*0.88;
  // furnace glow
  c.fillStyle = cosi_rad(c, sx, poolY, 4, m*0.9, [[0, 'rgba(255,150,40,0.55)'], [0.35, 'rgba(255,90,20,0.18)'], [1, 'rgba(255,60,10,0)']]); c.fillRect(0, 0, W, H);
  // back gears (silhouettes, lit by the melt)
  const gears = [[-0.04*W, 0.6*H, 0.42*m, 18, 0.05], [1.02*W, 0.28*H, 0.34*m, 14, -0.07], [0.24*W, 0.08*H, 0.18*m, 10, 0.12], [0.5*W, 0.42*H, 0.16*m, 9, -0.15]];
  gears.forEach(([gx, gy, r, n, sp], k) => {
    cosi_gear(c, gx, gy, r, n, t*sp + k);
    c.fillStyle = k === 3 ? '#160805' : '#1C0B07'; c.fill('evenodd');
    c.strokeStyle = 'rgba(255,120,40,0.22)'; c.lineWidth = 1.2; c.stroke();
  });
  // girder + chain
  c.fillStyle = '#0E0504'; c.fillRect(0, H*0.05, W, m*0.035);
  c.strokeStyle = '#0E0504'; c.lineWidth = 1.5; c.beginPath();
  for (let gx = 0; gx < W; gx += m*0.06) { c.moveTo(gx, H*0.05 + m*0.035); c.lineTo(gx + m*0.03, H*0.05 + m*0.07); c.lineTo(gx + m*0.06, H*0.05 + m*0.035); }
  c.moveTo(0, H*0.05 + m*0.07); c.lineTo(W, H*0.05 + m*0.07); c.stroke();
  // tilting crucible on a chain
  const tilt = 0.55 + 0.07*Math.sin(t*0.7), cw = m*0.1, ch = m*0.11, cx0 = sx - m*0.12, cy0 = H*0.15;
  c.strokeStyle = '#2A120A'; c.lineWidth = 2; c.setLineDash([3, 2]); c.beginPath(); c.moveTo(cx0, H*0.05 + m*0.07); c.lineTo(cx0, cy0 - ch*0.3); c.stroke(); c.setLineDash([]);
  c.save(); c.translate(cx0, cy0); c.rotate(tilt);
  const bucket = () => { c.beginPath(); c.moveTo(-cw, -ch*0.3); c.lineTo(cw*1.15, -ch*0.3); c.lineTo(cw*0.8, ch*0.7); c.quadraticCurveTo(0, ch*0.85, -cw*0.8, ch*0.7); c.closePath(); };
  bucket(); c.fillStyle = cosi_lin(c, -cw, 0, cw, 0, ['#2A120A', '#140806', '#2A120A']); c.fill();
  c.save(); c.clip(); c.rotate(-tilt);
  c.fillStyle = cosi_lin(c, 0, -ch*0.2, 0, ch*0.5, ['#FFF2B0', '#FF9A2A', '#B8300A']); c.fillRect(-cw*2, -ch*0.12 + Math.sin(t*3)*0.6, cw*4, ch*2);
  c.restore();
  c.strokeStyle = 'rgba(255,140,50,0.65)'; c.lineWidth = 1.2; bucket(); c.stroke();
  c.fillStyle = '#3A1A0E'; c.fillRect(-cw*1.1, -ch*0.38, cw*2.35, ch*0.14);
  c.strokeStyle = '#1A0B07'; c.lineWidth = 1.6; c.beginPath(); c.arc(0, -ch*0.3, cw*0.95, Math.PI, 0); c.stroke();
  c.restore();
  const lx = cw*1.15, ly = -ch*0.3, lipX = cx0 + lx*Math.cos(tilt) - ly*Math.sin(tilt), lipY = cy0 + lx*Math.sin(tilt) + ly*Math.cos(tilt);
  c.fillStyle = cosi_rad(c, lipX, lipY, 0, m*0.06, [[0, 'rgba(255,240,180,0.9)'], [1, 'rgba(255,120,30,0)']]); cosi_dot(c, lipX, lipY, m*0.06);
  // molten stream
  const stream = () => { c.beginPath(); c.moveTo(lipX, lipY);
    for (let k = 1; k <= 26; k++) { const s = k/26, e = 1 - Math.pow(1 - Math.min(1, s*2.2), 3), yy = lipY + (poolY - lipY)*s*s*0.35 + (poolY - lipY)*s*0.65, xx = lipX + (sx - lipX)*e + Math.sin(yy*0.07 - t*9)*1.1*s; c.lineTo(xx, yy); } };
  c.lineCap = 'round'; c.lineJoin = 'round';
  stream(); c.shadowColor = '#FF7A1A'; c.shadowBlur = 16; c.strokeStyle = 'rgba(255,110,20,0.55)'; c.lineWidth = m*0.032; c.stroke(); c.shadowBlur = 0;
  c.strokeStyle = '#FF9A2A'; c.lineWidth = m*0.018; c.stroke();
  c.strokeStyle = '#FFF2B0'; c.lineWidth = m*0.007; c.stroke();
  c.setLineDash([m*0.02, m*0.05]); c.lineDashOffset = -t*m*0.6; c.strokeStyle = 'rgba(255,255,240,0.9)'; c.lineWidth = m*0.009; c.stroke(); c.setLineDash([]);
  // mold + pool
  c.fillStyle = '#120604'; c.beginPath(); c.moveTo(sx - m*0.3, poolY - m*0.02); c.lineTo(sx + m*0.3, poolY - m*0.02); c.lineTo(sx + m*0.26, H); c.lineTo(sx - m*0.26, H); c.closePath(); c.fill();
  c.fillStyle = cosi_rad(c, sx, poolY, 0, m*0.26, ['#FFF6C8', '#FFC23E', '#FF6A14', '#A02A08']);
  c.beginPath(); c.ellipse(sx, poolY, m*0.26, m*0.035, 0, 0, TAU); c.fill();
  c.strokeStyle = 'rgba(255,240,190,0.7)'; c.lineWidth = 1;
  for (let k = 0; k < 3; k++) { const p = (t*0.8 + k/3) % 1; c.globalAlpha = 1 - p; c.beginPath(); c.ellipse(sx, poolY, m*0.03 + p*m*0.2, m*0.006 + p*m*0.026, 0, 0, TAU); c.stroke(); }
  c.globalAlpha = 1;
  // sparks flying from the impact
  c.lineCap = 'round';
  for (let k = 0; k < 48; k++) {
    const T = 0.9 + cosi_h(k*1.7)*0.8, p = ((t/T + cosi_h(k)) % 1), vx = (cosi_h(k*3.1) - 0.5)*m*0.9, vy = m*(0.25 + cosi_h(k*7.3)*0.45);
    const px = sx + vx*p, py = poolY - vy*p + vy*1.3*p*p, dxv = vx, dyv = -vy + 2*vy*1.3*p, l = Math.hypot(dxv, dyv) || 1;
    c.strokeStyle = p < 0.35 ? '#FFF4C0' : p < 0.7 ? '#FFB23E' : '#FF5A1A'; c.globalAlpha = 1 - p*p; c.lineWidth = 1.9 - p*0.9;
    c.beginPath(); c.moveTo(px, py); c.lineTo(px - dxv/l*m*0.025, py - dyv/l*m*0.025); c.stroke();
  }
  c.globalAlpha = 1;
  // front gear (darkest, closest)
  cosi_gear(c, W*0.08, H*1.0, 0.36*m, 16, -t*0.09); c.fillStyle = '#080302'; c.fill('evenodd');
  c.strokeStyle = 'rgba(255,140,50,0.35)'; c.lineWidth = 1.5; c.stroke();
  // rising embers + heat haze
  for (let k = 0; k < 26; k++) {
    const sp = 14 + cosi_h(k*2)*20, ex = (cosi_h(k)*W + Math.sin(t*0.9 + k)*10) % W, ey = H - ((t*sp + cosi_h(k*5)*H) % H);
    c.fillStyle = 'rgba(255,' + (120 + (k % 4)*30) + ',40,' + (0.35 + 0.4*Math.abs(Math.sin(t*3 + k))) + ')'; c.fillRect(ex, ey, 1.6, 1.6);
  }
  c.fillStyle = cosi_lin(c, 0, H*0.7, 0, H, [[0, 'rgba(255,90,20,0)'], [1, 'rgba(255,90,20,0.18)']]); c.fillRect(0, H*0.7, W, H*0.3);
}

const cosi_hydraCache = {};
function cosi_hydraCells(W, H) {
  const key = W + 'x' + H; if (cosi_hydraCache[key]) return cosi_hydraCache[key];
  const m = Math.min(W, H), cs = Math.max(3, Math.round(m/60)), set = {}, cells = [];
  const add = (gx, gy, g, e) => { const k = gx + ',' + gy; if (set[k] !== undefined) { if (e) cells[set[k]][3] = 1; return; } set[k] = cells.length; cells.push([gx, gy, g, e ? 1 : 0]); };
  const necks = [[-1, 0.53], [0, 0.44], [1, 0.53]];
  const spr = ['..#.....#.....', '..##....##....', '.###########..', '#############.', '###e##########', '##############', '#######.......', '########w.w.w.', '###########...', '.#########....'];
  necks.forEach(([i, hy], g) => {
    const bx = W/2 + i*W*0.07, by = H*1.0, c1x = W/2 + i*W*0.34, c1y = H*0.86, c2x = W/2 + i*W*0.06, c2y = H*0.66, ex = W/2 + i*W*0.27, ey = H*hy;
    for (let k = 0; k <= 80; k++) {
      const s = k/80, u = 1 - s, x = u*u*u*bx + 3*u*u*s*c1x + 3*u*s*s*c2x + s*s*s*ex, y = u*u*u*by + 3*u*u*s*c1y + 3*u*s*s*c2y + s*s*s*ey, r = m*(0.05 - 0.028*s);
      for (let gx = Math.floor((x - r)/cs); gx <= Math.ceil((x + r)/cs); gx++) for (let gy = Math.floor((y - r)/cs); gy <= Math.ceil((y + r)/cs); gy++)
        if (Math.hypot(gx*cs + cs/2 - x, gy*cs + cs/2 - y) < r) add(gx, gy, s > 0.72 ? g : -1, false);
      // dorsal spikes
      if (k % 9 === 4 && s > 0.15 && s < 0.85) { const gx = Math.round((x + (i <= 0 ? -1 : 1)*r*0.2)/cs), gy = Math.round((y - r)/cs) - 1; add(gx, gy, s > 0.72 ? g : -1, false); }
    }
    // head sprite at neck end, facing outward (centre faces right); neck meets the back of the jaw
    const dir = i < 0 ? -1 : 1, hx = Math.round(ex/cs), hyc = Math.round(ey/cs) - 7;
    spr.forEach((row, r) => { for (let q = 0; q < row.length; q++) { const ch = row[q]; if (ch === '.') continue; add(hx + dir*(q - 3), hyc + r, g, ch === 'e' || ch === 'w'); } });
  });
  // body mound
  for (let gx = Math.floor(W*0.22/cs); gx <= Math.ceil(W*0.78/cs); gx++) {
    const top = H - m*0.1*(1 - Math.pow((gx*cs - W/2)/(W*0.28), 2));
    for (let gy = Math.floor(top/cs); gy*cs < H; gy++) add(gx, gy, -1, false);
  }
  return (cosi_hydraCache[key] = { cs, cells });
}
function cosi_gCorrupted(c, t, W, H) {
  const m = Math.min(W, H), step = Math.floor(t*6), step2 = Math.floor(t*1.4);
  c.fillStyle = cosi_rad(c, W/2, H*0.5, 10, Math.hypot(W, H)*0.6, [[0, '#2A0E4A'], [0.45, '#14062A'], [0.8, '#06030F'], [1, '#020106']]); c.fillRect(0, 0, W, H);
  // faint data grid
  c.strokeStyle = 'rgba(140,80,255,0.08)'; c.lineWidth = 1; c.beginPath();
  for (let x = 0; x <= W; x += 20) { c.moveTo(x + 0.5, 0); c.lineTo(x + 0.5, H); } for (let y = 0; y <= H; y += 20) { c.moveTo(0, y + 0.5); c.lineTo(W, y + 0.5); } c.stroke();
  // pixel hydra silhouette with RGB split + row tearing
  const { cs, cells } = cosi_hydraCells(W, H);
  const burst = cosi_h(step*1.31) > 0.62, split = burst ? 2 + cosi_h(step*4.7)*6 : 1.2;
  const bands = burst ? [[cosi_h(step*2.1)*H, 8 + cosi_h(step*3.3)*24, (cosi_h(step*5.1) - 0.5)*36], [cosi_h(step*6.7)*H, 6 + cosi_h(step*7.9)*16, (cosi_h(step*8.3) - 0.5)*28]] : [];
  const bob = [Math.round(Math.sin(t*1.3)*1.2), Math.round(Math.sin(t*1.3 + 2.1)*1.2), Math.round(Math.sin(t*1.3 + 4.2)*1.2)];
  const layer = (ox, col, eyesOnly) => {
    c.fillStyle = col; c.beginPath();
    for (let i = 0; i < cells.length; i++) {
      const [gx, gy, g, e] = cells[i]; if (eyesOnly && !e) continue;
      if (!eyesOnly && cosi_h(i*0.73 + step*3.1) > 0.94) continue; // dropout
      const y = (gy + (g >= 0 ? bob[g] : 0))*cs;
      let dx = 0; for (const b of bands) if (y >= b[0] && y < b[0] + b[1]) dx += b[2];
      c.rect(gx*cs + ox + dx, y, cs - 1, cs - 1);
    }
    c.fill();
  };
  c.globalCompositeOperation = 'lighter';
  layer(-split, 'rgba(255,30,90,0.17)'); layer(split, 'rgba(30,220,255,0.17)');
  layer(0, 'rgba(150,70,255,0.15)');
  layer(-1, 'rgba(255,40,110,0.35)', true); layer(1, 'rgba(255,40,110,0.35)', true); layer(0, 'rgba(255,90,150,' + (0.6 + 0.35*Math.sin(t*5)) + ')', true);
  // glitch blocks
  const pal = ['255,42,109', '42,245,255', '124,255,58', '181,124,255'];
  for (let k = 0; k < 30; k++) {
    const st = k < 18 ? step : step2, hk = cosi_h(k*13.1 + st*7.1); if (hk < 0.45) continue;
    const bx = Math.floor(cosi_h(k*3.7 + st)*W/6)*6, by = Math.floor(cosi_h(k*5.3 + st*1.3)*H/4)*4, bw = 6 + cosi_h(k + st*2.2)*70, bh = 2 + cosi_h(k*9 + st)*12;
    c.fillStyle = 'rgba(' + pal[k % 4] + ',' + (0.06 + 0.22*cosi_h(k*2 + st)) + ')'; c.fillRect(bx, by, bw, bh);
  }
  // RGB tear stripes
  bands.forEach(([by, bh, dx]) => {
    c.fillStyle = 'rgba(255,42,109,0.16)'; c.fillRect(Math.max(0, dx), by, W, bh*0.5);
    c.fillStyle = 'rgba(42,245,255,0.16)'; c.fillRect(Math.min(0, dx), by + bh*0.5, W, bh*0.5);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(0, by, W, 1);
  });
  c.globalCompositeOperation = 'source-over';
  // corrupted hex fragments
  c.font = '700 ' + Math.max(7, Math.round(m*0.03)) + 'px monospace'; c.textBaseline = 'top';
  const frags = ['0xDEAD', 'ERR//', '#!?', 'NULL', '0b1101', 'FATAL', '%%%', 'HYDRA.EXE'];
  for (let k = 0; k < 7; k++) {
    const st = step2 + k*3; if (cosi_h(st*1.9 + k) < 0.4) continue;
    c.fillStyle = 'rgba(' + pal[(k + step2) % 4] + ',0.45)';
    c.fillText(frags[Math.floor(cosi_h(st + k*1.1)*frags.length)], cosi_h(st*2.3 + k)*W*0.85, cosi_h(st*3.1 + k)*H*0.95);
  }
  // scanlines + rolling bar
  c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); for (let y = 0; y < H; y += 3) c.rect(0, y, W, 1); c.fill();
  const ry = ((t*55) % (H + 60)) - 30;
  c.fillStyle = cosi_lin(c, 0, ry - 20, 0, ry + 20, [[0, 'rgba(180,140,255,0)'], [0.5, 'rgba(180,140,255,0.10)'], [1, 'rgba(180,140,255,0)']]); c.fillRect(0, ry - 20, W, 40);
}

const cosi_PG = { foundry: cosi_gFoundry, corrupted: cosi_gCorrupted };
function drawCardBg3(c, id, t, W, H) {
  const fn = cosi_PG[id];
  if (!fn) return false;
  c.save();
  try { fn(c, +t || 0, W, H); } catch (e) { /* never break the card */ }
  c.restore();
  cosi_reset(c);
  return true;
}

