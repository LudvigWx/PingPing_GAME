// ================= extra cosmetics =================
// =====================================================================
// RAID LOOT FX (raid_fx.js) - mythic ball skins + paddle auras
//   drawBallSkin(c, id, x, y, r, t, vx, vy)  balls: pearl, core, sun, glitch
//   drawBallChip(cvs, id)                    88x60 shop-chip preview of a ball skin
//   drawAura(c, id, hw, t, col)              auras: abyss, forge, solarflare, datastream
// Helpers are cosr_-prefixed. Deterministic (no Math.random). Every entry point
// wraps its drawing in save/try/restore and multiplies the caller's globalAlpha,
// so ghost/dim effects keep working and canvas state never leaks.
// drawAura also forwards the raid_paddle.js auras (rp_AURAS: venomcoil, timering,
// starwhale) when that file is present, so this definition can safely be the last one.
// =====================================================================

function cosr_h(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function cosr_dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function cosr_glow(c, A0, x, y, r, col, a) { c.fillStyle = col; c.globalAlpha = A0*a; cosr_dot(c, x, y, r); }
// tapered filled ribbon along pts (array of [x, y]); width w0 -> w1
function cosr_ribbon(c, pts, w0, w1) {
  const n = pts.length, L = [], R = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const w = (w0 + (w1 - w0)*i/(n - 1))*0.5;
    L.push([pts[i][0] - dy*w, pts[i][1] + dx*w]); R.push([pts[i][0] + dy*w, pts[i][1] - dx*w]);
  }
  c.beginPath(); c.moveTo(L[0][0], L[0][1]);
  for (let i = 1; i < n; i++) c.lineTo(L[i][0], L[i][1]);
  for (let i = n - 1; i >= 0; i--) c.lineTo(R[i][0], R[i][1]);
  c.closePath();
}
function cosr_backAng(vx, vy, t) { const s = Math.hypot(vx || 0, vy || 0); return s > 1e-6 ? Math.atan2(-vy, -vx) : Math.PI*0.8 + Math.sin(t*0.7)*0.4; }

// ---------------- BALL: Leviathan's Abyss Pearl ----------------
function cosr_pearl(c, A0, x, y, r, t, vx, vy) {
  const ab = cosr_backAng(vx, vy, t);
  cosr_glow(c, A0, x, y, r*1.75, '#7A8CFF', 0.10);
  cosr_glow(c, A0, x, y, r*1.35, '#C8B8FF', 0.16);
  // ink wisps curling out behind the motion
  for (let k = 0; k < 3; k++) {
    const s = (k - 1)*0.6, cd = (k === 1 ? Math.sin(t*1.3)*1.2 : (k - 1)*1.9) + Math.sin(t*2.3 + k)*0.4, pts = [];
    for (let j = 0; j < 7; j++) {
      const u = j/6, d = r*(0.7 + u*(k === 1 ? 1.5 : 1.15));
      const a = ab + s*(0.75 + u*0.5) + Math.sin(t*4 + k*2.1 - u*3.2)*0.38*u + cd*u*u;
      pts.push([x + Math.cos(a)*d, y + Math.sin(a)*d]);
    }
    cosr_ribbon(c, pts, r*0.46, r*0.05);
    c.globalAlpha = A0*0.8; c.fillStyle = '#4A26A0'; c.fill();
    c.globalAlpha = A0*0.75; c.strokeStyle = '#9A6BFF'; c.lineWidth = r*0.06; c.stroke();
    c.globalAlpha = A0*0.9; c.fillStyle = '#C9A8FF'; const p = pts[6]; cosr_dot(c, p[0], p[1], r*0.07);
  }
  // pearl body
  c.globalAlpha = A0;
  const g = c.createRadialGradient(x - r*0.35, y - r*0.4, r*0.05, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.45, '#ECE8F8'); g.addColorStop(0.85, '#B6AED8'); g.addColorStop(1, '#8C84BC');
  c.fillStyle = g; cosr_dot(c, x, y, r);
  // iridescent sheen bands (clipped)
  c.save(); c.beginPath(); c.arc(x, y, r*0.98, 0, TAU); c.clip();
  c.lineWidth = r*0.26;
  for (let k = 0; k < 3; k++) {
    const hue = (t*70 + k*120) % 360, ox = Math.cos(t*0.9 + k*2.1)*r*0.45, oy = Math.sin(t*0.7 + k*1.7)*r*0.45;
    c.globalAlpha = A0*0.42; c.strokeStyle = 'hsl(' + hue + ',95%,68%)';
    c.beginPath(); c.ellipse(x + ox, y + oy, r*(0.55 + k*0.18), r*(0.32 + k*0.1), t*0.6 + k, 0, TAU); c.stroke();
  }
  c.restore();
  // rim + specular
  c.globalAlpha = A0*0.9; c.strokeStyle = 'hsl(' + ((t*90 + 200) % 360) + ',90%,75%)'; c.lineWidth = r*0.07;
  c.beginPath(); c.arc(x, y, r*0.96, 0, TAU); c.stroke();
  c.globalAlpha = A0; c.fillStyle = '#FFFFFF';
  c.beginPath(); c.ellipse(x - r*0.36, y - r*0.42, r*0.24, r*0.15, -0.6, 0, TAU); c.fill();
  c.globalAlpha = A0*0.7; cosr_dot(c, x + r*0.38, y + r*0.36, r*0.08);
}

// ---------------- BALL: Colossus Reactor Core ----------------
function cosr_ring(c, A0, x, y, R, ry, rot, spin, col, front, r) {
  const a0 = front ? 0 : Math.PI, a1 = front ? Math.PI : TAU;
  c.globalAlpha = A0*(front ? 1 : 0.8);
  c.strokeStyle = '#20242E'; c.lineWidth = r*0.22;
  c.beginPath(); c.ellipse(x, y, R, ry, rot, a0, a1); c.stroke();
  c.setLineDash([r*0.16, r*0.1]); c.lineDashOffset = -spin*r*1.2;
  c.strokeStyle = front ? '#9AA6BC' : '#5A6478'; c.lineWidth = r*0.13; c.stroke();
  c.setLineDash([]); c.lineDashOffset = 0;
  const cr = Math.cos(rot), sr = Math.sin(rot);
  for (let k = 0; k < 4; k++) {
    const ph = spin + k*TAU/4, sp = Math.sin(ph);
    if ((sp >= 0) !== front) continue;
    const lx = Math.cos(ph)*R, ly = sp*ry, px = x + lx*cr - ly*sr, py = y + lx*sr + ly*cr;
    cosr_glow(c, A0, px, py, r*0.22, col, front ? 0.35 : 0.2);
    cosr_glow(c, A0, px, py, r*0.1, col, front ? 1 : 0.6);
  }
}
function cosr_core(c, A0, x, y, r, t) {
  const p = 0.5 + 0.5*Math.sin(t*6), p2 = 0.5 + 0.5*Math.sin(t*6 + 2);
  cosr_glow(c, A0, x, y, r*1.9, '#FF7A1A', 0.08 + 0.05*p);
  cosr_glow(c, A0, x, y, r*1.45, '#FF9A3A', 0.16 + 0.08*p);
  const r1 = [r*1.42, r*0.42, 0.4 + Math.sin(t*0.6)*0.18, t*2.4], r2 = [r*1.28, r*0.5, -0.95 + Math.cos(t*0.5)*0.15, -t*3.1];
  cosr_ring(c, A0, x, y, r1[0], r1[1], r1[2], r1[3], '#FFA030', false, r);
  cosr_ring(c, A0, x, y, r2[0], r2[1], r2[2], r2[3], '#3AF0FF', false, r);
  // metal shell
  c.globalAlpha = A0;
  const g = c.createRadialGradient(x - r*0.35, y - r*0.35, r*0.1, x, y, r);
  g.addColorStop(0, '#6A7488'); g.addColorStop(0.6, '#262B38'); g.addColorStop(1, '#0A0C12');
  c.fillStyle = g; cosr_dot(c, x, y, r);
  // reactor core
  const cr = r*(0.6 + 0.07*p), g2 = c.createRadialGradient(x, y, 0, x, y, cr);
  g2.addColorStop(0, '#FFFFFF'); g2.addColorStop(0.3, '#FFE79A'); g2.addColorStop(0.7, '#FF8A1A'); g2.addColorStop(1, 'rgba(255,70,0,0)');
  c.fillStyle = g2; cosr_dot(c, x, y, cr);
  // turbine fins
  c.globalAlpha = A0*0.85; c.strokeStyle = '#141820'; c.lineWidth = r*0.09; c.lineCap = 'round';
  c.beginPath();
  for (let k = 0; k < 3; k++) { const a = t*2.2 + k*TAU/3; c.moveTo(x + Math.cos(a)*r*0.2, y + Math.sin(a)*r*0.2); c.lineTo(x + Math.cos(a + 0.5)*r*0.62, y + Math.sin(a + 0.5)*r*0.62); }
  c.stroke();
  // cyan containment iris
  c.globalAlpha = A0*(0.7 + 0.3*p2); c.strokeStyle = '#3AF0FF'; c.lineWidth = r*0.08;
  c.setLineDash([r*0.28, r*0.12]); c.lineDashOffset = t*r*2;
  c.beginPath(); c.arc(x, y, r*0.74, 0, TAU); c.stroke(); c.setLineDash([]); c.lineDashOffset = 0;
  c.globalAlpha = A0; c.fillStyle = '#FFFFFF'; cosr_dot(c, x, y, r*0.12*(0.8 + 0.4*p));
  // shell rim highlight
  c.globalAlpha = A0*0.6; c.strokeStyle = '#D8E4FF'; c.lineWidth = r*0.06;
  c.beginPath(); c.arc(x, y, r*0.94, Math.PI*1.05, Math.PI*1.55); c.stroke();
  cosr_ring(c, A0, x, y, r2[0], r2[1], r2[2], r2[3], '#3AF0FF', true, r);
  cosr_ring(c, A0, x, y, r1[0], r1[1], r1[2], r1[3], '#FFA030', true, r);
}

// ---------------- BALL: Solarion's Dying Star ----------------
function cosr_sun(c, A0, x, y, r, t) {
  cosr_glow(c, A0, x, y, r*2.1, '#FF6A10', 0.07);
  cosr_glow(c, A0, x, y, r*1.6, '#FF9A2A', 0.13);
  cosr_glow(c, A0, x, y, r*1.25, '#FFD060', 0.22);
  // corona flares (two batched paths)
  const N = 9;
  for (let pass = 0; pass < 2; pass++) {
    c.beginPath();
    for (let k = 0; k < N; k++) {
      const a = k*TAU/N + t*0.25 + cosr_h(k)*0.5;
      const f = 0.5 + 0.3*Math.sin(t*(5 + cosr_h(k + 3)*4) + k*2.1) + 0.2*Math.sin(t*13 + k*5.3);
      let L = r*(1.12 + 0.5*f); if (pass) L = r + (L - r)*0.5;
      const w = pass ? 0.13 : 0.24, ta = a + Math.sin(t*3 + k)*0.18;
      const bx0 = x + Math.cos(a - w)*r*0.9, by0 = y + Math.sin(a - w)*r*0.9, bx1 = x + Math.cos(a + w)*r*0.9, by1 = y + Math.sin(a + w)*r*0.9;
      const tx = x + Math.cos(ta)*L, ty = y + Math.sin(ta)*L, m = r*1.02 + (L - r)*0.3;
      c.moveTo(bx0, by0);
      c.quadraticCurveTo(x + Math.cos(a - w*0.6)*m, y + Math.sin(a - w*0.6)*m, tx, ty);
      c.quadraticCurveTo(x + Math.cos(a + w*0.6)*m, y + Math.sin(a + w*0.6)*m, bx1, by1);
      c.closePath();
    }
    c.globalAlpha = A0*(pass ? 0.95 : 0.85); c.fillStyle = pass ? '#FFD24A' : '#FF5A10'; c.fill();
  }
  // prominence loop wandering around the limb
  const cyc = 2.6, u = (t % cyc)/cyc, a0 = Math.floor(t/cyc)*2.3 + 0.6, e = Math.sin(u*Math.PI);
  const f1x = x + Math.cos(a0 - 0.4)*r*0.95, f1y = y + Math.sin(a0 - 0.4)*r*0.95, f2x = x + Math.cos(a0 + 0.4)*r*0.95, f2y = y + Math.sin(a0 + 0.4)*r*0.95;
  const ch = r*(1.35 + 0.9*e), cx = x + Math.cos(a0)*ch, cy = y + Math.sin(a0)*ch;
  c.lineCap = 'round';
  c.globalAlpha = A0*e*0.9; c.strokeStyle = '#FF6A10'; c.lineWidth = r*0.16;
  c.beginPath(); c.moveTo(f1x, f1y); c.quadraticCurveTo(cx, cy, f2x, f2y); c.stroke();
  c.strokeStyle = '#FFE58A'; c.lineWidth = r*0.06; c.stroke();
  // photosphere
  c.globalAlpha = A0;
  const g = c.createRadialGradient(x - r*0.2, y - r*0.2, 0, x, y, r);
  g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.35, '#FFF6B0'); g.addColorStop(0.75, '#FFC23A'); g.addColorStop(1, '#FF7A10');
  c.fillStyle = g; cosr_dot(c, x, y, r);
  c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
  // granulation blobs
  c.fillStyle = '#FF9A20';
  for (let k = 0; k < 5; k++) {
    const a = k*1.9 + t*0.35, d = r*(0.3 + 0.45*cosr_h(k + 9));
    c.globalAlpha = A0*(0.2 + 0.15*Math.sin(t*3 + k*2));
    cosr_dot(c, x + Math.cos(a)*d, y + Math.sin(a)*d, r*(0.18 + 0.08*cosr_h(k)));
  }
  // sunspots rotating across the disc (foreshortened near the limb)
  for (let k = 0; k < 2; k++) {
    const lon = t*0.45 + k*2.6, cl = Math.cos(lon);
    if (cl < 0.05) continue;
    const sx = x + Math.sin(lon)*r*0.75, sy = y + (k ? r*0.32 : -r*0.18), w = r*(k ? 0.14 : 0.2)*cl, h = r*(k ? 0.13 : 0.18);
    c.globalAlpha = A0*0.6*cl; c.fillStyle = '#B4400A'; c.beginPath(); c.ellipse(sx, sy, w*1.6, h*1.5, 0, 0, TAU); c.fill();
    c.globalAlpha = A0*0.9*cl; c.fillStyle = '#3A0E00'; c.beginPath(); c.ellipse(sx, sy, w, h, 0, 0, TAU); c.fill();
  }
  c.restore();
  // limb darkening
  c.globalAlpha = A0*0.55; c.strokeStyle = '#FF5A00'; c.lineWidth = r*0.1;
  c.beginPath(); c.arc(x, y, r*0.95, 0, TAU); c.stroke();
}

// ---------------- BALL: Hydra's Glitch Orb ----------------
const COSR_GL_PAL = ['#FFFFFF', '#E8FFFF', '#BFF6FF', '#7FE8FF', '#3AB8E8'];
function cosr_glitch(c, A0, x, y, r, t, vx, vy) {
  const q = Math.floor(t*14), burst = cosr_h(q*1.37) > 0.7, ab = cosr_backAng(vx, vy, t);
  const dx = r*(0.11 + (burst ? 0.3*cosr_h(q + 5) : 0.04*Math.sin(t*20))), dy = burst ? r*(cosr_h(q + 2) - 0.5)*0.3 : 0;
  cosr_glow(c, A0, x, y, r*1.7, '#00E5FF', 0.08);
  cosr_glow(c, A0, x, y, r*1.3, '#FF2AD0', 0.12);
  // pixel fragments trailing / jittering
  const cell = r*2/7;
  for (let k = 0; k < 7; k++) {
    const st = Math.floor(t*9 + cosr_h(k)*5), a = ab + (cosr_h(k*3.1 + st*0.7) - 0.5)*2.4;
    const d = r*(1.15 + 0.9*cosr_h(k*5.7 + st*1.3)), s = cell*(0.5 + 0.6*cosr_h(k + st*2.2));
    c.globalAlpha = A0*(0.55 + 0.45*cosr_h(st + k)); c.fillStyle = k % 3 === 0 ? '#FF2AD0' : k % 3 === 1 ? '#00F0FF' : '#FFFFFF';
    c.fillRect(x + Math.cos(a)*d - s/2, y + Math.sin(a)*d - s/2, s, s);
  }
  // RGB split copies
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = A0*0.8; c.fillStyle = '#FF1A3A'; cosr_dot(c, x - dx, y - dy, r);
  c.fillStyle = '#00D8FF'; cosr_dot(c, x + dx, y + dy, r);
  c.globalCompositeOperation = 'source-over';
  // pixel orb body
  const tear = Math.floor(cosr_h(q*3.3)*7), tdx = (cosr_h(q*4.1) - 0.5)*r*1.0, fl = Math.floor(t*6);
  for (let j = 0; j < 7; j++) {
    const ly = -r + (j + 0.5)*cell, sh = burst && (j === tear || j === tear + 1) ? tdx : 0;
    for (let i = 0; i < 7; i++) {
      const lx = -r + (i + 0.5)*cell;
      if (lx*lx + ly*ly > r*r*1.02) continue;
      const v = cosr_h(i*7.1 + j*3.3 + fl*0.37);
      let col;
      if (v > 0.9) col = '#FF2AD0'; else if (v > 0.8) col = '#00F0FF';
      else { const b = Math.hypot(lx + r*0.35, ly + r*0.35)/(r*2); col = COSR_GL_PAL[Math.min(4, Math.floor(b*5.2 + v*0.8))]; }
      c.globalAlpha = A0; c.fillStyle = col;
      c.fillRect(x + lx - cell/2 + sh, y + ly - cell/2, cell*1.04, cell*1.04);
    }
  }
  // tear line + scanline
  if (burst) { c.globalAlpha = A0*0.9; c.fillStyle = '#FFFFFF'; c.fillRect(x - r*1.6 + tdx, y - r + (tear + 1)*cell - r*0.04, r*3.2, r*0.08); }
  c.globalAlpha = A0*0.55; c.fillStyle = '#0A0F1E';
  c.fillRect(x - r, y - r + ((t*1.7) % 1)*2*r, r*2, r*0.1);
}

const COSR_BALLS = { pearl: cosr_pearl, core: cosr_core, sun: cosr_sun, glitch: cosr_glitch };
function drawBallSkin(c, id, x, y, r, t, vx, vy) {
  const f = COSR_BALLS[id]; if (!f) return false;
  c.save();
  try { const A0 = c.globalAlpha; c.shadowBlur = 0; f(c, A0, x, y, r, t, vx || 0, vy || 0); } catch (e) {}
  c.restore();
  return true;
}
function drawBallChip(cvs, id) {
  if (!COSR_BALLS[id]) return false;
  try {
    const c = cvs.getContext('2d'), w = cvs.width, h = cvs.height, r = 13*Math.min(w/88, h/60);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
    const span = w + r*4, u = (clock*0.42) % 1, x = -r*2 + u*span, y = h*0.5 + Math.sin(clock*3)*h*0.08;
    const vx = span*0.42, vy = Math.cos(clock*3)*h*0.08*3;
    // short motion streaks
    c.save(); c.lineCap = 'round'; c.strokeStyle = '#FFFFFF';
    for (let k = 0; k < 3; k++) { c.globalAlpha = 0.18 - k*0.04; c.lineWidth = r*(0.22 - k*0.05); c.beginPath(); c.moveTo(x - r*1.3, y + (k - 1)*r*0.55); c.lineTo(x - r*(2.6 + k*0.6), y + (k - 1)*r*0.55 - vy*0.02); c.stroke(); }
    c.restore();
    drawBallSkin(c, id, x, y, r, clock, vx, vy);
    if (x > w - r*2) drawBallSkin(c, id, x - span, y, r, clock, vx, vy);
  } catch (e) {}
  return true;
}

// ---------------- AURA: Abyssal Tide ----------------
function cosr_aAbyss(c, A0, hw, t) {
  c.fillStyle = '#062A5A'; c.globalAlpha = A0*0.55; c.beginPath(); c.ellipse(0, 1.5, hw + 9, 6.5, 0, 0, TAU); c.fill();
  c.fillStyle = '#0B4A7A'; c.globalAlpha = A0*0.4; c.beginPath(); c.ellipse(0, 1, hw + 5, 4.2, 0, 0, TAU); c.fill();
  // tentacles rising from the depths at both ends, curling inward
  for (let s = -1; s <= 1; s += 2) {
    const pts = []; let px = s*(hw + 5), py = 7, a = -Math.PI/2;
    pts.push([px, py]);
    for (let j = 1; j < 9; j++) {
      const u = j/8;
      a = -Math.PI/2 - s*(Math.pow(u, 2.2)*3.4 + Math.sin(t*1.4 + u*2.5 + s)*0.4*u - 0.12);
      px += Math.cos(a)*3.1; py += Math.sin(a)*3.1; pts.push([px, py]);
    }
    cosr_ribbon(c, pts, 3.4, 0.35);
    c.globalAlpha = A0*0.8; c.fillStyle = '#3A1680'; c.fill();
    c.globalAlpha = A0*0.85; c.strokeStyle = '#A88BFF'; c.lineWidth = 0.5; c.stroke();
    c.globalAlpha = A0*0.7; c.fillStyle = '#C4A8FF'; c.beginPath();
    for (let j = 2; j < 7; j += 1) { const p = pts[j], q = pts[j + 1], dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, o = 0.7*(1 - j/9), sx = p[0] - s*dy/d*o, sy = p[1] + s*dx/d*o; c.moveTo(sx + 0.35, sy); c.arc(sx, sy, 0.35*(1.2 - j/9), 0, TAU); }
    c.fill();
  }
  // swirling currents
  c.lineCap = 'round'; c.lineWidth = 0.85;
  for (let k = 0; k < 4; k++) {
    const dir = k % 2 ? -1 : 1, a0 = t*(1.4 - k*0.22)*dir + k*1.7;
    c.globalAlpha = A0*(0.75 - k*0.1); c.strokeStyle = k % 2 ? '#2EC8E8' : '#7AF0FF';
    c.beginPath(); c.ellipse(0, 1 + k*0.4, hw + 2 + k*2.2, 2.6 + k*1.1, 0, a0, a0 + 1.7); c.stroke();
    c.beginPath(); c.ellipse(0, 1 + k*0.4, hw + 2 + k*2.2, 2.6 + k*1.1, 0, a0 + Math.PI, a0 + Math.PI + 1.1); c.stroke();
  }
  // rising bubbles
  c.lineWidth = 0.32;
  for (let k = 0; k < 8; k++) {
    const u = (t*0.32 + cosr_h(k)) % 1, bx = (cosr_h(k*3.3) - 0.5)*2*(hw + 4) + Math.sin(t*2.2 + k*1.9)*1.2, by = 3 - u*22, br = 0.55 + cosr_h(k*5.1)*0.8 + u*0.35;
    c.globalAlpha = A0*Math.sin(u*Math.PI)*0.9; c.strokeStyle = '#BFF4FF';
    c.beginPath(); c.arc(bx, by, br, 0, TAU); c.stroke();
    c.fillStyle = '#FFFFFF'; cosr_dot(c, bx - br*0.35, by - br*0.35, br*0.25);
  }
}

// ---------------- AURA: Forge Heat ----------------
function cosr_aForge(c, A0, hw, t) {
  const fl = 0.85 + 0.15*Math.sin(t*17) + 0.08*Math.sin(t*29);
  c.globalCompositeOperation = 'lighter'; c.fillStyle = '#FF5A0A'; c.globalAlpha = A0*0.38*fl; c.beginPath(); c.ellipse(0, -0.5, hw + 6, 5.5, 0, 0, TAU); c.fill();
  c.fillStyle = '#FFA040'; c.globalAlpha = A0*0.5*fl; c.beginPath(); c.ellipse(0, -0.5, hw + 2.5, 3.4, 0, 0, TAU); c.fill(); c.globalCompositeOperation = 'source-over';
  // heat shimmer
  c.lineWidth = 1.0; c.lineCap = 'round';
  for (let k = 0; k < 3; k++) {
    const ph = (t*0.55 + k/3) % 1, y0 = -3.5 - ph*14, amp = 0.6 + ph*0.8, ww = hw*(1 - ph*0.35);
    c.globalAlpha = A0*Math.min(1, (1 - ph)*1.8)*0.95; c.strokeStyle = k % 2 ? '#FF8A20' : '#FFC24A'; c.lineWidth = 1.1 - ph*0.6;
    c.beginPath();
    for (let j = 0; j <= 12; j++) { const x = -ww + j*ww/6; const yy = y0 + Math.sin(x*0.55 + t*7 + k*2)*amp; j ? c.lineTo(x, yy) : c.moveTo(x, yy); }
    c.stroke();
  }
  // grinder sparks from a sliding contact point
  const ex = (tt) => Math.sin(tt*0.9)*hw*0.65, gy = 60;
  for (let pass = 0; pass < 2; pass++) {
    c.beginPath();
    for (let i = 0; i < 26; i++) {
      const L = 0.45 + cosr_h(i)*0.35, ph = t/L + cosr_h(i*1.7), u = ph % 1, cy = Math.floor(ph);
      if ((u < 0.45) !== (pass === 0)) continue;
      const tau = u*L, x0 = ex(t - tau), ang = -Math.PI/2 + (cosr_h(i*3 + cy*1.31) - 0.5)*1.9 + Math.sin(t*0.9 + 1.57)*0.25;
      const sp = 24 + cosr_h(i*5 + cy*0.77)*16, vx = Math.cos(ang)*sp, vy = Math.sin(ang)*sp;
      const px = x0 + vx*tau, py = -2.2 + vy*tau + 0.5*gy*tau*tau, cvy = vy + gy*tau, k = pass ? 0.05 : 0.07;
      c.moveTo(px, py); c.lineTo(px - vx*k, py - cvy*k);
    }
    c.globalAlpha = A0*(pass ? 0.9 : 1); c.strokeStyle = pass ? '#FF8A2A' : '#FFF2B0'; c.lineWidth = pass ? 0.6 : 0.85; c.stroke();
  }
  const exn = ex(t), fs = 1.8 + 0.8*Math.sin(t*31);
  c.globalAlpha = A0*0.5; c.fillStyle = '#FFB040'; cosr_dot(c, exn, -2.4, fs*1.3);
  c.globalAlpha = A0; c.fillStyle = '#FFF6D0'; star4(c, exn, -2.4, fs);
  // drifting embers
  c.fillStyle = '#FF6A1A';
  for (let k = 0; k < 7; k++) {
    const u = (t*0.22 + cosr_h(k + 20)) % 1, x = (cosr_h(k*2.3 + 7) - 0.5)*2*(hw + 6) + Math.sin(t*1.3 + k*2)*2, y = 2 - u*20;
    c.globalAlpha = A0*Math.min(1, Math.sin(u*Math.PI)*1.6)*(0.7 + 0.3*Math.sin(t*9 + k)); c.fillRect(x - 0.45, y - 0.45, 0.9, 0.9);
  }
}

// ---------------- AURA: Solar Flare ----------------
function cosr_aSolar(c, A0, hw, t) {
  const cy = -4, rx = hw + 6, ry = 7;
  // faint rotating rays
  c.beginPath();
  for (let k = 0; k < 10; k++) { const a = k*TAU/10 + t*0.25; c.moveTo(0, cy); c.lineTo(Math.cos(a - 0.08)*(rx + 5), cy + Math.sin(a - 0.08)*(ry + 6)); c.lineTo(Math.cos(a + 0.08)*(rx + 5), cy + Math.sin(a + 0.08)*(ry + 6)); c.closePath(); }
  c.globalAlpha = A0*0.13; c.fillStyle = '#FFB040'; c.fill();
  c.globalAlpha = A0*0.18; c.fillStyle = '#FF7A1A'; c.beginPath(); c.ellipse(0, cy, rx + 1, ry + 1, 0, 0, TAU); c.fill();
  // flame ring orbiting the paddle
  const N = 18;
  for (let pass = 0; pass < 2; pass++) {
    c.beginPath();
    for (let k = 0; k < N; k++) {
      const a = k*TAU/N + t*0.9, ca = Math.cos(a), sa = Math.sin(a), px = ca*rx, py = cy + sa*ry;
      let nx = ca/rx, ny = sa/ry; const nd = Math.hypot(nx, ny); nx /= nd; ny /= nd;
      const tx = -ny, ty = nx, f = 0.5 + 0.3*Math.sin(t*9 + k*2.3) + 0.2*Math.sin(t*15 + k*4.1);
      const len = (2.2 + 3*f)*(pass ? 0.55 : 1), wd = pass ? 0.65 : 1.2;
      c.moveTo(px - tx*wd, py - ty*wd);
      c.quadraticCurveTo(px + nx*len*0.5 - tx*wd*0.3, py + ny*len*0.5 - ty*wd*0.3, px + nx*len - tx*len*0.45, py + ny*len - ty*len*0.45);
      c.quadraticCurveTo(px + nx*len*0.4 + tx*wd, py + ny*len*0.4 + ty*wd, px + tx*wd, py + ty*wd);
      c.closePath();
    }
    c.globalAlpha = A0*(pass ? 0.95 : 0.85); c.fillStyle = pass ? '#FFD84A' : '#FF5010'; c.fill();
  }
  c.globalAlpha = A0*0.85; c.strokeStyle = '#FF9A2A'; c.lineWidth = 1.3; c.beginPath(); c.ellipse(0, cy, rx, ry, 0, 0, TAU); c.stroke();
  c.strokeStyle = '#FFF0B0'; c.lineWidth = 0.45; c.stroke();
  // flare arc looping off alternating ends
  const cyc = 1.7, u = (t % cyc)/cyc, s = Math.floor(t/cyc) % 2 ? 1 : -1, pr = Math.min(1, u*2.2), fa = u < 0.6 ? 1 : (1 - u)/0.4;
  const p0 = [s*(hw - 1), -1], p2 = [s*(hw + 10), 1], p1 = [s*(hw + 6), -15 - 4*Math.sin(u*Math.PI)];
  const pts = [];
  for (let j = 0; j <= 10; j++) { const v = pr*j/10, w = 1 - v; pts.push([w*w*p0[0] + 2*w*v*p1[0] + v*v*p2[0], w*w*p0[1] + 2*w*v*p1[1] + v*v*p2[1]]); }
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
  c.globalAlpha = A0*fa*0.35; c.strokeStyle = '#FF7A1A'; c.lineWidth = 3.2; c.stroke();
  c.globalAlpha = A0*fa; c.strokeStyle = '#FF6A10'; c.lineWidth = 1.5; c.stroke();
  c.strokeStyle = '#FFF2A0'; c.lineWidth = 0.55; c.stroke();
  const hp = pts[pts.length - 1]; c.fillStyle = '#FFFBE0'; star4(c, hp[0], hp[1], 1.6 + Math.sin(t*25)*0.4);
}

// ---------------- AURA: Data Stream ----------------
function cosr_bit(c, x, y, one, s) { if (one) c.fillRect(x - s*0.18, y - s*0.5, s*0.36, s); else { c.lineWidth = s*0.22; c.strokeRect(x - s*0.3, y - s*0.4, s*0.6, s*0.8); } }
function cosr_aData(c, A0, hw, t) {
  const CY = '#2AF4FF', MG = '#FF3AD8', st = Math.floor(t*20);
  c.globalAlpha = A0*0.16; c.fillStyle = CY; c.beginPath(); c.ellipse(-2, -2, hw + 7, 6, 0, 0, TAU); c.fill();
  c.globalAlpha = A0*0.12; c.fillStyle = MG; c.beginPath(); c.ellipse(2, -3, hw + 6, 5, 0, 0, TAU); c.fill();
  // upward streams
  for (let i = 0; i < 7; i++) {
    const x = (i - 3)/3*hw*0.95, col = i % 2 ? MG : CY;
    c.fillStyle = col; c.strokeStyle = col;
    c.globalAlpha = A0*0.14; c.fillRect(x - 0.15, -19, 0.3, 17);
    for (let j = 0; j < 3; j++) {
      const u = (t*0.65 + cosr_h(i) + j/3) % 1, y = -2 - u*17, one = cosr_h(i*5 + j*3 + Math.floor(t*4 + i)) > 0.5;
      c.globalAlpha = A0*(1 - u)*0.95; cosr_bit(c, x, y, one, 1.7);
    }
  }
  // orbiting bits
  const rx = hw + 8, ry = 6.5, cy = -3;
  for (let k = 0; k < 14; k++) {
    const a = k*TAU/14 + t*1.1, d = Math.sin(a), col = k % 2 ? MG : CY, one = cosr_h(k + Math.floor(t*3 + k*0.37)) > 0.5;
    c.globalAlpha = A0*(0.5 + 0.45*d); c.fillStyle = col; c.strokeStyle = col;
    cosr_bit(c, Math.cos(a)*rx, cy + d*ry, one, 1.5 + 0.5*d);
  }
  // scanlines + sweep bar
  c.fillStyle = '#BFFFFF';
  c.globalAlpha = A0*(0.07 + 0.06*cosr_h(st));
  for (let y = -19; y < 7; y += 2) c.fillRect(-hw - 10, y, 2*hw + 20, 0.3);
  const sy = 6 - ((t*0.7) % 1)*25;
  c.globalAlpha = A0*0.45; c.fillStyle = CY; c.fillRect(-hw - 10, sy, 2*hw + 20, 0.55);
  // occasional glitch slab
  if (cosr_h(Math.floor(t*8)*1.7) > 0.8) {
    const gy = -18 + cosr_h(Math.floor(t*8) + 3)*20, gx = (cosr_h(Math.floor(t*8) + 9) - 0.5)*hw;
    c.globalAlpha = A0*0.35; c.fillStyle = MG; c.fillRect(gx - hw*0.5, gy, hw, 1.4);
    c.globalAlpha = A0*0.35; c.fillStyle = CY; c.fillRect(gx - hw*0.4 + 2, gy + 1.4, hw*0.8, 0.8);
  }
}

const COSR_AURAS = { abyss: cosr_aAbyss, forge: cosr_aForge, solarflare: cosr_aSolar, datastream: cosr_aData };
function drawAura(c, id, hw, t, col) {
  const f = COSR_AURAS[id];
  if (!f) {
    // forward the raid_paddle.js auras if that file is present
    let g = null; try { g = typeof rp_AURAS !== 'undefined' ? rp_AURAS[id] : null; } catch (e) { g = null; }
    if (!g) return false;
    c.save(); try { g(c, +hw || 14, t, col); } catch (e) {} c.restore();
    return true;
  }
  c.save();
  try { const A0 = c.globalAlpha; c.shadowBlur = 0; f(c, A0, +hw || 14, t || 0, col); } catch (e) {}
  c.restore();
  return true;
}

