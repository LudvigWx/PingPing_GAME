// =====================================================================
// NEW FX (new_fx.js) - trails, victory effects and a ball skin
//   trailDot4(c, style, col, x, y, r, k, idx, t)  trails: sparkle, ink, petals, comet, smoke, glitchtrail, plasma (secret)
//   vic4(T, t, dt)                                  victory: meteors, balloons, lasers, singularity (secret)
//   vpart4(p, t)                                    draws this file's 'cf4*' victory particles
//   drawVictoryChip4(c, id, w, h)                   88x60 shop previews for the victory ids
//   drawBallSkin4(c, id, x, y, r, t, vx, vy)        ball skin: eightball (secret)
// Helpers are cf4_-prefixed. Trails / ball skins scale everything off r (works in world units),
// multiply the caller's globalAlpha and never leak canvas state.
// =====================================================================

function cf4_h(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function cf4_shade(col, f) {
  if (typeof col !== 'string' || col[0] !== '#' || col.length < 7) return '#1A1030';
  const n = parseInt(col.slice(1, 7), 16);
  return 'rgb(' + Math.round((n >> 16 & 255)*f) + ',' + Math.round((n >> 8 & 255)*f) + ',' + Math.round((n & 255)*f) + ')';
}
function cf4_dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function cf4_once(key, fn) { if (vicFx && !vicFx[key]) { vicFx[key] = 1; try { fn(); } catch (e) {} } }
function cf4_n(rate, dt) { const v = rate*dt; return Math.floor(v) + (Math.random() < v % 1 ? 1 : 0); }
function cf4_env(t, fin, fout, end) { return Math.max(0, Math.min(1, t/fin, ((end || 4.5) - t)/fout)); }
function cf4_tone(f, d, ty, v, s, dl) { try { if (typeof tone === 'function') tone(f, d, ty, v, s, dl); } catch (e) {} }
function cf4_ss(u) { u = Math.max(0, Math.min(1, u)); return u*u*(3 - 2*u); }
// jagged lightning polyline from (x0,y0) to (x1,y1); amp = max sideways offset, seed varies the shape
function cf4_bolt(c, x0, y0, x1, y1, n, amp, seed) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1, nx = -dy/d, ny = dx/d;
  c.beginPath(); c.moveTo(x0, y0);
  for (let i = 1; i < n; i++) { const u = i/n, o = (cf4_h(seed + i*7.3) - 0.5)*2*amp*Math.sin(u*Math.PI); c.lineTo(x0 + dx*u + nx*o, y0 + dy*u + ny*o); }
  c.lineTo(x1, y1);
}
// soft irregular blob (ink splat) centred at x,y
function cf4_blob(c, x, y, s, seed) {
  const N = 9, P = [];
  for (let i = 0; i < N; i++) { const a = i/N*TAU + cf4_h(seed)*0.6, rr2 = s*(0.6 + 0.6*cf4_h(seed*3.1 + i*1.7)); P.push([x + Math.cos(a)*rr2, y + Math.sin(a)*rr2]); }
  c.beginPath();
  const m = (a, b) => [(a[0] + b[0])/2, (a[1] + b[1])/2], s0 = m(P[N - 1], P[0]);
  c.moveTo(s0[0], s0[1]);
  for (let i = 0; i < N; i++) { const q = m(P[i], P[(i + 1) % N]); c.quadraticCurveTo(P[i][0], P[i][1], q[0], q[1]); }
  c.closePath();
}
// cherry blossom petal around the origin, base at +y, notched tip at -y
function cf4_petal(c, s) {
  c.beginPath(); c.moveTo(0, s);
  c.bezierCurveTo(s*0.95, s*0.35, s*0.85, -s*0.75, s*0.2, -s*0.9);
  c.lineTo(0, -s*0.62); c.lineTo(-s*0.2, -s*0.9);
  c.bezierCurveTo(-s*0.85, -s*0.75, -s*0.95, s*0.35, 0, s);
  c.closePath();
}

// ---------- trails ----------
const cf4_PETAL = ['#FFB7D5', '#FF8AC0', '#FFD6E8', '#FF6FAE'];
let cf4_prev = null; // last plasma dot (for arcs between neighbouring dots)
function trailDot4(c, style, col, x, y, r, k, idx, t) {
  if (style !== 'sparkle' && style !== 'ink' && style !== 'petals' && style !== 'comet' && style !== 'smoke' && style !== 'glitchtrail' && style !== 'plasma') return false;
  const A0 = c.globalAlpha;
  c.save();
  try {
    if (style === 'sparkle') {
      const tw = 0.5 + 0.5*Math.sin(t*13 + idx*2.3 + cf4_h(idx)*6), s = r*(0.3 + 0.7*k)*(0.5 + 0.65*tw);
      const sx = x + (cf4_h(idx*1.3) - 0.5)*r*1.3, sy = y + (cf4_h(idx*2.7) - 0.5)*r*1.3;
      c.globalAlpha = A0*0.22; c.fillStyle = col; cf4_dot(c, sx, sy, s*1.1);
      c.globalAlpha = A0; c.fillStyle = idx % 2 ? '#FFFFFF' : col; star4(c, sx, sy, s*1.4);
      if (tw > 0.65) { c.globalAlpha = A0*(tw - 0.65)*2.6; c.fillStyle = '#FFFFFF'; c.save(); c.translate(sx, sy); c.rotate(Math.PI/4); star4(c, 0, 0, s*0.95); c.restore(); }
      c.globalAlpha = A0; c.fillStyle = '#FFFFFF'; cf4_dot(c, sx, sy, s*0.22);
      if (idx % 3 === 0) {                                            // stray glitter speck
        const tw2 = 0.5 + 0.5*Math.sin(t*17 + idx*4.1), a = cf4_h(idx*5.3)*TAU, d = r*(1.1 + 0.6*cf4_h(idx*7.7));
        c.globalAlpha = A0*tw2; c.fillStyle = idx % 2 ? col : '#FFFFFF'; star4(c, x + Math.cos(a)*d, y + Math.sin(a)*d, r*0.45*tw2 + r*0.08);
      }
    }
    else if (style === 'ink') {
      const age = 1 - k, s = r*(0.55 + 1.05*age)*(0.85 + 0.3*cf4_h(idx)), fa = 0.35 + 0.65*k;
      const bx = x + (cf4_h(idx*3.9) - 0.5)*r*0.6, by = y + (cf4_h(idx*6.1) - 0.5)*r*0.6;
      c.globalAlpha = A0*fa*0.8; c.fillStyle = col; cf4_blob(c, bx, by, s, idx*1.37); c.fill();
      c.globalAlpha = A0*fa*0.85; c.fillStyle = cf4_shade(col, 0.5); cf4_blob(c, bx - s*0.05, by + s*0.06, s*0.7, idx*2.11 + 5); c.fill();   // dense ink core
      c.fillStyle = col;
      for (let j = 0; j < 4; j++) {                                   // splatter: droplets + streaks flung further with age
        const a = cf4_h(idx*4.3 + j*1.9)*TAU, d = s*(1.1 + 0.45*cf4_h(idx + j*3.3) + 0.45*age), ds = r*(0.08 + 0.13*cf4_h(idx*2 + j))*(0.7 + 0.6*k);
        const dx = bx + Math.cos(a)*d, dy = by + Math.sin(a)*d;
        c.globalAlpha = A0*fa*0.9;
        if (j % 2) { c.beginPath(); c.ellipse(dx, dy, ds*2.2, ds*0.75, a, 0, TAU); c.fill(); } else cf4_dot(c, dx, dy, ds);
      }
      if (k > 0.55) { c.globalAlpha = A0*(k - 0.55)*1.6; c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(bx - s*0.32, by - s*0.34, s*0.22, s*0.12, -0.6, 0, TAU); c.fill(); }
    }
    else if (style === 'petals') {
      const age = 1 - k, s = r*(0.7 + 0.55*k), ph = cf4_h(idx)*TAU;
      const px = x + Math.sin(t*2.2 + idx*1.7)*r*(0.35 + 0.8*age), py = y + age*r*1.0 + Math.cos(t*1.7 + idx)*r*0.25;
      const flip = Math.cos(t*(3 + cf4_h(idx*2)*3) + ph);
      c.translate(px, py); c.rotate(idx*1.3 + t*(1.5 + cf4_h(idx*3)*2.5)); c.scale(1, 0.22 + 0.78*Math.abs(flip));
      c.globalAlpha = A0; c.fillStyle = flip > 0 ? cf4_PETAL[idx % 4] : '#FFC6DE'; cf4_petal(c, s); c.fill();
      c.globalAlpha = A0*0.55; c.strokeStyle = '#FFF2F8'; c.lineWidth = s*0.09; c.lineCap = 'round';
      c.beginPath(); c.moveTo(0, s*0.8); c.lineTo(0, -s*0.35); c.stroke();
      c.globalAlpha = A0*0.5; c.fillStyle = '#FF4F8B'; c.beginPath(); c.ellipse(0, s*0.62, s*0.16, s*0.26, 0, 0, TAU); c.fill();
    }
    else if (style === 'comet') {
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = A0*0.13; c.fillStyle = '#2A5BFF'; cf4_dot(c, x, y, r*(0.6 + 1.25*k));
      c.globalAlpha = A0*0.26; c.fillStyle = '#3FB8FF'; cf4_dot(c, x, y, r*(0.42 + 0.85*k));
      c.globalAlpha = A0*(0.25 + 0.45*k); c.fillStyle = '#A8EEFF'; cf4_dot(c, x, y, r*(0.2 + 0.55*k));
      if (k > 0.45) { c.globalAlpha = A0*(k - 0.45)*1.8; c.fillStyle = '#FFFFFF'; cf4_dot(c, x, y, r*(0.15 + 0.45*(k - 0.45))); }
      if (idx % 3 === 1) {                                            // ice crystals shed off the tail
        const a = cf4_h(idx*2.9)*TAU, d = r*(0.7 + 0.9*(1 - k)), tw = 0.5 + 0.5*Math.sin(t*11 + idx*3);
        const ix = x + Math.cos(a)*d, iy = y + Math.sin(a)*d, s = r*(0.18 + 0.2*tw);
        c.globalCompositeOperation = 'source-over'; c.globalAlpha = A0*(0.5 + 0.5*tw); c.fillStyle = '#E8FDFF';
        c.beginPath(); c.moveTo(ix, iy - s*1.6); c.lineTo(ix + s*0.6, iy); c.lineTo(ix, iy + s*1.6); c.lineTo(ix - s*0.6, iy); c.closePath(); c.fill();
      }
    }
    else if (style === 'smoke') {
      const age = 1 - k, s = r*(0.45 + 1.45*age)*(0.85 + 0.3*cf4_h(idx)), rise = age*age*r*1.6, fa = 0.3 + 0.7*k;
      const sx = x + Math.sin(t*1.5 + idx*0.9)*r*0.5*age, sy = y - rise;
      for (let j = 0; j < 3; j++) {
        const a = cf4_h(idx*3.1 + j)*TAU + t*0.6*(j % 2 ? 1 : -1), d = s*0.45, ps = s*(0.62 + 0.3*cf4_h(idx + j*5));
        const px = sx + Math.cos(a)*d, py = sy + Math.sin(a)*d*0.7;
        c.globalAlpha = A0*fa*0.42; c.fillStyle = j === 1 ? '#8E8AA3' : '#A9A5BC'; cf4_dot(c, px, py, ps);
        c.globalAlpha = A0*fa*0.22; c.fillStyle = '#E8E4F4'; cf4_dot(c, px - ps*0.25, py - ps*0.3, ps*0.55);
      }
    }
    else if (style === 'glitchtrail') {
      const st = Math.floor(t*12 + cf4_h(idx)*3), j = cf4_h(idx*3.7 + st*1.1), g = r*0.42;
      const s = Math.max(1, Math.round((0.7 + 1.5*k)*(0.7 + 0.6*cf4_h(idx + st))))*g;
      const jx = j > 0.72 ? (cf4_h(st + idx*9) - 0.5)*r*2.2 : 0, gx = Math.round((x + jx)/g)*g, gy = Math.round(y/g)*g, sp = g*(0.5 + (j > 0.85 ? 1.2 : 0));
      c.globalCompositeOperation = 'lighter';
      c.globalAlpha = A0*0.85;
      c.fillStyle = '#FF1E46'; c.fillRect(gx - s/2 - sp, gy - s/2, s, s);
      c.fillStyle = '#1EFF6E'; c.fillRect(gx - s/2, gy - s/2 + (j < 0.2 ? g : 0), s, s);
      c.fillStyle = '#1E6EFF'; c.fillRect(gx - s/2 + sp, gy - s/2, s, s);
      if (cf4_h(idx*1.9 + st*0.7) > 0.68) {                           // torn scanline slab
        c.globalCompositeOperation = 'source-over'; c.globalAlpha = A0*0.8;
        c.fillStyle = cf4_h(idx + st) > 0.5 ? '#FFFFFF' : col; c.fillRect(gx - s*1.6, gy + (cf4_h(idx*4 + st) - 0.5)*s, s*3.2, g*0.5);
      }
      if (idx % 4 === 0) { c.globalCompositeOperation = 'source-over'; c.globalAlpha = A0*0.9; c.fillStyle = col; c.fillRect(gx + (cf4_h(idx*7 + st) - 0.5)*r*3, gy + (cf4_h(idx*5 + st) - 0.5)*r*3, g, g); }
    }
    else if (style === 'plasma') {
      const st = Math.floor(t*24), fl = 0.78 + 0.22*Math.sin(t*41 + idx*3.1);
      c.globalCompositeOperation = 'lighter'; c.lineCap = 'round'; c.lineJoin = 'round';
      c.globalAlpha = A0*0.2; c.fillStyle = '#8A2DFF'; cf4_dot(c, x, y, r*(0.75 + 1.15*k)*fl);
      c.globalAlpha = A0*0.28; c.fillStyle = '#2EC8FF'; cf4_dot(c, x, y, r*(0.45 + 0.7*k));
      // arc to the neighbouring dot
      const pv = cf4_prev;
      if (pv && pv.c === c && pv.t === t && Math.abs(pv.idx - idx) === 1 && Math.hypot(pv.x - x, pv.y - y) < r*6 && cf4_h(st*0.7 + idx) > 0.25) {
        const dd = Math.hypot(pv.x - x, pv.y - y), amp = r*0.25 + dd*0.35;
        cf4_bolt(c, pv.x, pv.y, x, y, 5, amp, st*3.3 + idx*1.7);
        c.globalAlpha = A0*0.75; c.strokeStyle = idx % 2 ? '#C08BFF' : '#6FF0FF'; c.lineWidth = r*0.14; c.stroke();
        c.globalAlpha = A0*0.9; c.strokeStyle = '#FFFFFF'; c.lineWidth = r*0.05; c.stroke();
      }
      // crackling tendrils
      const nt = k > 0.5 ? 2 : 1;
      for (let q = 0; q < nt; q++) {
        const sd = idx*5.1 + q*2.3 + st*0.37, a = cf4_h(sd)*TAU, L = r*(0.8 + 1.3*cf4_h(sd + 1))*(0.55 + 0.6*k);
        cf4_bolt(c, x, y, x + Math.cos(a)*L, y + Math.sin(a)*L, 4, L*0.28, sd*11);
        c.globalAlpha = A0*0.8; c.strokeStyle = q ? '#7FF6FF' : '#C890FF'; c.lineWidth = r*0.11; c.stroke();
        c.globalAlpha = A0*0.85; c.strokeStyle = '#FFFFFF'; c.lineWidth = r*0.04; c.stroke();
      }
      c.globalAlpha = A0*(0.45 + 0.55*k); c.fillStyle = '#FFFFFF'; cf4_dot(c, x, y, r*(0.18 + 0.42*k)*fl);
      if (k > 0.88) { c.globalAlpha = A0*fl; star4(c, x, y, r*1.25*fl); }
      cf4_prev = { c, t, idx, x, y };
    }
  } catch (e) {}
  c.restore();
  return true;
}

// ---------- shared: black hole (accretion disk + photon ring + horizon) ----------
// Draws around (cx,cy) with horizon radius R; A = alpha; tilt = disk flattening (0..1)
function cf4_bh(c, cx, cy, R, t, A, tilt) {
  const DA = R*3.0, DB = DA*(tilt || 0.24);
  c.save(); c.lineCap = 'round';
  // outer violet aura
  let g = c.createRadialGradient(cx, cy, R*0.9, cx, cy, R*4.2);
  g.addColorStop(0, 'rgba(176,77,255,0.55)'); g.addColorStop(0.35, 'rgba(120,50,255,0.18)'); g.addColorStop(1, 'rgba(60,20,160,0)');
  c.globalAlpha = A; c.fillStyle = g; c.fillRect(cx - R*4.2, cy - R*4.2, R*8.4, R*8.4);
  const lg = c.createLinearGradient(cx - DA, cy, cx + DA, cy);     // doppler: approaching side brighter
  lg.addColorStop(0, '#FFF6E0'); lg.addColorStop(0.35, '#FFB04A'); lg.addColorStop(0.7, '#C0408A'); lg.addColorStop(1, '#6A2AD8');
  const DI = R*1.22, DIB = DI*(tilt || 0.24);
  const ring = (a0, a1) => {
    const fr = a0 === 0 ? 0.7 : 1;
    c.globalCompositeOperation = 'lighter'; c.lineCap = 'butt';
    for (const [fo, fi, al] of [[1, 1, 0.22], [0.82, 1, 0.3], [0.62, 1, 0.42]]) {     // glowing disk, hotter inside
      c.beginPath(); c.ellipse(cx, cy, DA*fo, DB*fo, 0, a0, a1); c.ellipse(cx, cy, DI*fi, DIB*fi, 0, a1, a0, true); c.closePath();
      c.globalAlpha = A*al*fr; c.fillStyle = lg; c.fill();
    }
    c.setLineDash([R*0.9, R*0.55]);
    [[0.55, 7, '#FFF2D0'], [0.72, 5, '#FFC27A'], [0.9, 3.6, '#E0B8FF']].forEach(([f, spd, col], i) => {
      c.lineDashOffset = -t*R*spd - i*R*0.4; c.globalAlpha = A*0.45; c.strokeStyle = col; c.lineWidth = R*0.04;
      c.beginPath(); c.ellipse(cx, cy, DA*f, DB*f, 0, a0, a1); c.stroke();
    });
    c.setLineDash([]);
    c.globalAlpha = A*0.9; c.strokeStyle = '#FFF4E4'; c.lineWidth = R*0.05;
    c.beginPath(); c.ellipse(cx, cy, DI, DIB, 0, a0, a1); c.stroke();               // hot inner edge
    c.globalCompositeOperation = 'source-over';
  };
  ring(Math.PI, TAU);                                                // far side of the disk
  // lensed image of the far disk arching over the horizon
  c.globalCompositeOperation = 'lighter';
  c.lineCap = 'butt'; c.globalAlpha = A*0.55; c.strokeStyle = lg; c.lineWidth = R*0.24;
  c.beginPath(); c.ellipse(cx, cy, R*1.42, R*1.3, 0, Math.PI*1.02, Math.PI*1.98); c.stroke();
  c.globalAlpha = A*0.3; c.lineWidth = R*0.16; c.beginPath(); c.ellipse(cx, cy, R*1.3, R*1.2, 0, Math.PI*0.08, Math.PI*0.92); c.stroke();
  c.globalCompositeOperation = 'source-over';
  // horizon
  c.globalAlpha = A; c.fillStyle = '#000000'; cf4_dot(c, cx, cy, R);
  // photon ring
  c.globalCompositeOperation = 'lighter';
  c.globalAlpha = A*0.5; c.strokeStyle = '#B04DFF'; c.lineWidth = R*0.22; c.beginPath(); c.arc(cx, cy, R*1.08, 0, TAU); c.stroke();
  c.globalAlpha = A*(0.85 + 0.15*Math.sin(t*9)); c.strokeStyle = '#FFE8C8'; c.lineWidth = R*0.06; c.beginPath(); c.arc(cx, cy, R*1.03, 0, TAU); c.stroke();
  c.globalCompositeOperation = 'source-over';
  c.globalAlpha = A; c.fillStyle = '#000000'; cf4_dot(c, cx, cy, R*0.98);
  ring(0, Math.PI);                                                  // near side, in front of the horizon
  c.restore();
}

// ---------- victory effects ----------
const cf4_BAL = [['#FF4F8B', '#FFB0CC'], ['#3EE6FF', '#C8F8FF'], ['#FFE34A', '#FFF6C0'], ['#B57CFF', '#E6D2FF'], ['#4FFFC4', '#C8FFEE'], ['#FF8A3D', '#FFD0B0']];
const cf4_LAS = ['#3CFF7A', '#3EE6FF', '#FF3AD8', '#B57CFF', '#FFE34A'];
let cf4_buf = null, cf4_bc = null;
function cf4_grab() {
  const cv = ctx.canvas;
  if (!cf4_buf) { cf4_buf = document.createElement('canvas'); cf4_bc = cf4_buf.getContext('2d'); }
  if (cf4_buf.width !== cv.width || cf4_buf.height !== cv.height) { cf4_buf.width = cv.width; cf4_buf.height = cv.height; }
  cf4_bc.setTransform(1, 0, 0, 1, 0, 0); cf4_bc.globalCompositeOperation = 'copy'; cf4_bc.drawImage(cv, 0, 0); cf4_bc.globalCompositeOperation = 'source-over';
  return cf4_buf;
}
function cf4_laserAng(q, e, j, t) {
  const n = 5, ex = W*(0.1 + e*0.2), ey = H + 4, up = -Math.PI/2;
  switch (q) {
    case 0: return up + Math.sin(t*2.1 + e*0.7)*0.75 + (j - 1)*0.2;                       // waving fans
    case 1: return up + (e % 2 ? 1 : -1)*(0.25 + 0.45*Math.sin(t*2.8)) + (j - 1)*0.06;     // scissors
    case 2: { const fx = W*0.5 + Math.sin(t*1.7)*W*0.18, fy = H*0.22 + Math.cos(t*2.3)*H*0.08; return Math.atan2(fy - ey, fx - ex) + (j - 1)*0.045; } // converge
    default: return up + ((e - (n - 1)/2)*0.32 + (j - 1)*0.1)*Math.sin(t*1.6) + Math.sin(t*3.4)*0.15; // breathing fan
  }
}
function vic4(T, t, dt) {
  if (T !== 'meteors' && T !== 'balloons' && T !== 'lasers' && T !== 'singularity') return;
  ctx.save();
  try {
    const room = vparts.length < 360;
    if (T === 'meteors') {
      cf4_once('cf4s0', () => { cf4_tone(180, 1.4, 'sawtooth', 0.025, 0.3); });
      const a = cf4_env(t, 0.5, 1);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, 'rgba(255,110,50,0.16)'); sky.addColorStop(0.5, 'rgba(120,40,160,0.06)'); sky.addColorStop(1, 'rgba(255,90,40,0.12)');
      ctx.globalAlpha = a; ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      if (t < 3.3 && room) {
        let n = cf4_n(t < 0.6 ? 16 : 9, dt); if (t < dt*1.5) n += 3;
        for (; n > 0; n--) {
          const ang = 0.78 + Math.random()*0.22, sp = 620 + Math.random()*420, s = 2.2 + Math.random()*3.2, big = Math.random() < 0.18;
          vparts.push({ x: W*(0.15 + Math.random()*1.25), y: -40 - Math.random()*60, vx: -Math.cos(ang)*sp, vy: Math.sin(ang)*sp, life: 4, kind: 'cf4met', s: big ? s*1.7 : s,
            ty: H*(0.45 + Math.random()*0.5), col: Math.random() < 0.15 ? '#7FD8FF' : Math.random() < 0.5 ? '#FFB23E' : '#FF7A3D' });
        }
      }
    }
    else if (T === 'balloons') {
      cf4_once('cf4s0', () => { [523, 659, 784, 1047].forEach((f, i) => cf4_tone(f, 0.18, 'triangle', 0.03, 1, i*0.09)); });
      if (t < 3.0 && room) {
        let n = cf4_n(7, dt); if (t < dt*1.5) n += 9;
        for (; n > 0; n--) {
          const pal = cf4_BAL[Math.floor(Math.random()*cf4_BAL.length)], s = 16 + Math.random()*16;
          vparts.push({ x: W*(0.04 + Math.random()*0.92), y: H + 25 + Math.random()*10, vx: (Math.random() - 0.5)*16, vy: -(85 + Math.random()*95)*(1.2 - s/60), life: 12, kind: 'cf4bal', s, c0: pal[0], c1: pal[1],
            ph: Math.random()*TAU, pop: Math.random() < 0.42 ? H*(0.12 + Math.random()*0.5) : -1e9 });
        }
      }
    }
    else if (T === 'lasers') {
      cf4_once('cf4s0', () => { cf4_tone(110, 0.25, 'sawtooth', 0.04, 1, 0); cf4_tone(110, 0.25, 'sawtooth', 0.04, 1, 0.5); cf4_tone(165, 0.25, 'sawtooth', 0.04, 1, 1.0); cf4_tone(147, 0.5, 'sawtooth', 0.04, 1, 1.5); });
      const env = cf4_env(t, 0.35, 0.8), SL = 0.8, qf = t/SL, q = Math.floor(qf) % 4, q2 = (q + 1) % 4, bl = cf4_ss((qf % 1 - 0.82)/0.18);
      if (env > 0.01) {
        // haze
        ctx.globalAlpha = env;
        const hz = ctx.createLinearGradient(0, H*0.35, 0, H);
        hz.addColorStop(0, 'rgba(120,60,255,0)'); hz.addColorStop(1, 'rgba(150,90,255,0.24)');
        ctx.fillStyle = hz; ctx.fillRect(0, H*0.35, W, H*0.65);
        for (let k = 0; k < 4; k++) {
          const fx = ((k*0.31 + t*0.04*(k % 2 ? 1 : -1)) % 1 + 1) % 1*W*1.2 - W*0.1, fy = H*(0.45 + (k % 3)*0.17), fr = Math.max(W, H)*0.28;
          const rg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
          rg.addColorStop(0, 'rgba(200,180,255,0.07)'); rg.addColorStop(1, 'rgba(200,180,255,0)');
          ctx.fillStyle = rg; ctx.fillRect(fx - fr, fy - fr, fr*2, fr*2);
        }
        ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
        const L = Math.hypot(W, H)*1.05, pal = Math.floor(qf/2);
        for (let e = 0; e < 5; e++) {
          const ex = W*(0.1 + e*0.2), ey = H + 4, col = cf4_LAS[(e + pal) % cf4_LAS.length];
          for (let j = 0; j < 3; j++) {
            const an = cf4_laserAng(q, e, j, t)*(1 - bl) + cf4_laserAng(q2, e, j, t)*bl, ux = Math.cos(an), uy = Math.sin(an);
            const x1 = ex + ux*L, y1 = ey + uy*L, gr = ctx.createLinearGradient(ex, ey, x1, y1);
            gr.addColorStop(0, col); gr.addColorStop(0.55, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
            // scatter cone through the haze
            const sw = 34;
            if (j === 1) { ctx.globalAlpha = env*0.14; ctx.fillStyle = gr;
            ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x1 - uy*sw, y1 + ux*sw); ctx.lineTo(x1 + uy*sw, y1 - ux*sw); ctx.closePath(); ctx.fill(); }
            ctx.strokeStyle = gr;
            ctx.globalAlpha = env*0.35; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(x1, y1); ctx.stroke();
            ctx.globalAlpha = env*0.95; ctx.lineWidth = 1.8; ctx.stroke();
          }
          // emitter head
          ctx.globalAlpha = env; ctx.fillStyle = col;
          const eg = ctx.createRadialGradient(ex, ey - 2, 0, ex, ey - 2, 26); eg.addColorStop(0, col); eg.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = eg; ctx.fillRect(ex - 26, ey - 28, 52, 52);
          ctx.fillStyle = '#FFFFFF'; cf4_dot(ctx, ex, ey - 2, 3.5);
        }
        ctx.globalCompositeOperation = 'source-over';
        // strobe on each pattern change
        const sb = qf % 1;
        if (sb < 0.12 && t > 0.3 && t < 3.9) { ctx.globalAlpha = env*(1 - sb/0.12)*0.14; ctx.fillStyle = '#F4EEFF'; ctx.fillRect(0, 0, W, H); }
        ctx.globalAlpha = 1;
      }
      if (t < 3.6 && room && Math.random() < dt*14) vparts.push({ x: Math.random()*W, y: H*(0.3 + Math.random()*0.7), vx: (Math.random() - 0.5)*14, vy: -8 - Math.random()*14, life: 1.5 + Math.random()*1.5, kind: 'cf4dust', ph: Math.random()*TAU });
    }
    else if (T === 'singularity') {
      const REL = 3.5, cx = W/2, cy = H*0.45, M = Math.min(W, H), FAR = Math.hypot(W, H)*0.55;
      cf4_once('cf4s0', () => { cf4_tone(48, 3.4, 'sawtooth', 0.045, 0.75); cf4_tone(96, 3.3, 'sine', 0.03, 0.6, 0.1); cf4_tone(1900, 3.2, 'sine', 0.008, 0.25, 0.2); });
      const u = Math.min(1, t/REL), R = t < REL ? M*(0.018 + 0.085*cf4_ss(u) + 0.02*u*u*u)*(1 + (u > 0.85 ? Math.sin(t*60)*0.04*(u - 0.85)/0.15 : 0))
                                             : M*0.123*Math.max(0, 1 - (t - REL)/0.08);
      const I = t < REL ? Math.min(1, t/0.9) : 0;
      if (t < REL + 0.75) {
        const buf = cf4_grab();
        if (I > 0) {
          // the screen is dragged and twisted into the centre
          for (let L2 = 1; L2 <= 2; L2++) {
            ctx.save(); ctx.globalAlpha = I*(0.4 - L2*0.1)*(0.6 + 0.4*u);
            ctx.translate(cx, cy); ctx.rotate((0.07 + 0.3*u)*L2); const sc = 1 - (0.07 + 0.17*u)*L2; ctx.scale(sc, sc); ctx.translate(-cx, -cy);
            ctx.drawImage(buf, 0, 0, W, H); ctx.restore();
          }
          // darkness falling in
          const dg = ctx.createRadialGradient(cx, cy, R, cx, cy, FAR);
          dg.addColorStop(0, 'rgba(4,0,12,' + (0.85*I) + ')'); dg.addColorStop(0.25, 'rgba(10,2,30,' + (0.45*I) + ')'); dg.addColorStop(1, 'rgba(10,2,30,' + (0.12*I) + ')');
          ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H);
          // gravitational lensing: an inverted, squeezed copy of the scene in a ring
          const RL = R*3.0;
          ctx.save();
          ctx.beginPath(); ctx.arc(cx, cy, RL, 0, TAU); ctx.arc(cx, cy, R*1.02, 0, TAU, true); ctx.clip();
          ctx.globalAlpha = I*0.8; ctx.translate(cx, cy); ctx.rotate(Math.PI + t*0.5); const ls = RL/FAR*1.35; ctx.scale(ls, ls); ctx.translate(-cx, -cy);
          ctx.drawImage(buf, 0, 0, W, H);
          ctx.restore();
          const lr = ctx.createRadialGradient(cx, cy, R, cx, cy, R*3.0);
          lr.addColorStop(0, 'rgba(0,0,0,0)'); lr.addColorStop(0.8, 'rgba(150,80,255,0.1)'); lr.addColorStop(1, 'rgba(150,80,255,0)');
          ctx.globalAlpha = I; ctx.fillStyle = lr; ctx.fillRect(cx - R*3, cy - R*3, R*6, R*6);
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = I*0.35; ctx.strokeStyle = '#C9A0FF'; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, R*3.0, 0, TAU); ctx.stroke(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }
        if (t >= REL) {
          // shockwave with a refracting band
          const v = t - REL;
          for (const [d, sp, col] of [[0, 1.0, '#FFFFFF'], [0.08, 0.75, '#B04DFF'], [0.16, 0.55, '#3EE6FF']]) {
            const w2 = v - d; if (w2 <= 0) continue;
            const rr2 = w2*FAR*2.6*sp, th = 26*(1 - w2/0.8);
            if (th <= 1) continue;
            if (!d) {
              ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rr2 + th, 0, TAU); ctx.arc(cx, cy, Math.max(0, rr2 - th), 0, TAU, true); ctx.clip();
              ctx.translate(cx, cy); ctx.scale(0.93, 0.93); ctx.translate(-cx, -cy); ctx.drawImage(buf, 0, 0, W, H); ctx.restore();
            }
            ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, 1 - w2/0.8); ctx.strokeStyle = col; ctx.lineWidth = th*0.55;
            ctx.beginPath(); ctx.arc(cx, cy, rr2, 0, TAU); ctx.stroke(); ctx.globalCompositeOperation = 'source-over';
          }
          ctx.globalAlpha = 1;
        }
      }
      if (R > 0.5) cf4_bh(ctx, cx, cy, R, t, Math.min(1, t/0.4), 0.22 + 0.06*Math.sin(t*0.7));
      // infalling matter
      if (t < REL - 0.15 && vparts.length < 260) for (let k = cf4_n(30 + 70*u, dt); k > 0; k--) {
        const a = Math.random()*TAU;
        vparts.push({ x: 0, y: 0, vx: 0, vy: 0, life: 9, kind: 'cf4inf', a, R: FAR*(0.45 + Math.random()*0.6), lt: t, t0: t,
          col: Math.random() < 0.4 ? '#FFC27A' : Math.random() < 0.6 ? '#C890FF' : '#7FE8FF' });
      }
      // release
      if (t >= REL) cf4_once('cf4rel', () => {
        cf4_tone(70, 1.1, 'sawtooth', 0.08, 0.35); cf4_tone(1500, 0.7, 'sine', 0.045, 0.3); cf4_tone(400, 1.2, 'triangle', 0.035, 2.2, 0.05);
        for (let k = 0; k < 140; k++) { const a = Math.random()*TAU, sp = 160 + Math.random()*780; vparts.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 0.6 + Math.random()*1.1, kind: 'cf4ray', col: Math.random() < 0.45 ? '#FFFFFF' : Math.random() < 0.5 ? '#C890FF' : Math.random() < 0.5 ? '#7FE8FF' : '#FFC27A' }); }
      });
      if (t >= REL) {
        const v = t - REL;
        if (v < 0.7) {
          const fg = ctx.createRadialGradient(cx, cy, 0, cx, cy, FAR*(0.6 + v*2));
          fg.addColorStop(0, 'rgba(255,255,255,1)'); fg.addColorStop(0.35, 'rgba(225,205,255,0.85)'); fg.addColorStop(1, 'rgba(150,100,255,0.35)');
          ctx.globalAlpha = Math.pow(1 - v/0.7, 2)*0.95; ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H);
        }
        // lingering newborn star
        const sa = Math.max(0, Math.min(1, 1 - (v - 0.2)/0.8));
        if (sa > 0) {
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = sa;
          const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, M*0.22); sg.addColorStop(0, 'rgba(255,255,255,0.9)'); sg.addColorStop(0.3, 'rgba(200,150,255,0.45)'); sg.addColorStop(1, 'rgba(120,60,255,0)');
          ctx.fillStyle = sg; ctx.fillRect(cx - M*0.22, cy - M*0.22, M*0.44, M*0.44);
          ctx.fillStyle = '#FFFFFF'; const Ls = M*(0.08 + 0.3*Math.max(0, 1 - v));
          ctx.beginPath(); ctx.moveTo(cx - Ls*1.6, cy); ctx.lineTo(cx, cy - 2.5); ctx.lineTo(cx + Ls*1.6, cy); ctx.lineTo(cx, cy + 2.5); ctx.closePath(); ctx.fill();
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(v*1.5); star4(ctx, 0, 0, 14 + 5*Math.sin(v*20)); ctx.restore();
          ctx.globalCompositeOperation = 'source-over';
        }
        ctx.globalAlpha = 1;
      }
    }
  } catch (e) {}
  ctx.restore();
}

function vpart4(p, t) {
  const k = p.kind;
  if (typeof k !== 'string' || k.slice(0, 3) !== 'cf4') return false;
  ctx.save();
  try {
    if (k === 'cf4met') {
      if (p.y >= p.ty || p.x < -80) {
        p.life = 0;
        if (p.x > -10 && p.x < W + 10) {
          vparts.push({ x: p.x, y: p.y, vx: 0, vy: 0, life: 0.55, kind: 'cf4boom', s: p.s, col: p.col });
          for (let j = 6 + Math.floor(p.s*2); j > 0; j--) { const a = -Math.PI*(0.1 + Math.random()*0.8), sp = 80 + Math.random()*260; vparts.push({ x: p.x, y: p.y, vx: Math.cos(a)*sp - 60, vy: Math.sin(a)*sp, g: 700, life: 0.4 + Math.random()*0.5, kind: 'cf4emb', col: Math.random() < 0.5 ? '#FFF2C0' : p.col }); }
          if (Math.random() < 0.35) cf4_tone(90 + Math.random()*80, 0.18, 'sawtooth', 0.025, 0.4);
        }
        return true;
      }
      const sp = Math.hypot(p.vx, p.vy) || 1, ux = p.vx/sp, uy = p.vy/sp, L = p.s*34, s = p.s;
      ctx.globalCompositeOperation = 'lighter';
      const tg = ctx.createLinearGradient(p.x, p.y, p.x - ux*L, p.y - uy*L);
      tg.addColorStop(0, '#FFFFFF'); tg.addColorStop(0.12, p.col); tg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = tg; ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.moveTo(p.x + uy*s, p.y - ux*s); ctx.lineTo(p.x - ux*L, p.y - uy*L); ctx.lineTo(p.x - uy*s, p.y + ux*s); ctx.arc(p.x, p.y, s, Math.atan2(ux, -uy) + Math.PI, Math.atan2(ux, -uy), true); ctx.closePath(); ctx.fill();
      const hg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s*5);
      hg.addColorStop(0, p.col); hg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = 0.55; ctx.fillStyle = hg; ctx.fillRect(p.x - s*5, p.y - s*5, s*10, s*10);
      ctx.globalAlpha = 1; ctx.fillStyle = '#FFFFFF'; cf4_dot(ctx, p.x, p.y, s*0.9);
      if (Math.random() < 0.12 && vparts.length < 340) vparts.push({ x: p.x - ux*s*3, y: p.y - uy*s*3, vx: p.vx*0.08 + (Math.random() - 0.5)*30, vy: p.vy*0.08 + (Math.random() - 0.5)*30, life: 0.2 + Math.random()*0.2, kind: 'cf4emb', col: p.col });
    }
    else if (k === 'cf4boom') {
      const u = 1 - Math.max(0, p.life)/0.55, s = p.s;
      ctx.globalCompositeOperation = 'lighter';
      const fg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, s*14);
      fg.addColorStop(0, 'rgba(255,240,200,0.9)'); fg.addColorStop(0.3, p.col); fg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = Math.pow(1 - u, 2)*0.75; ctx.fillStyle = fg; ctx.fillRect(p.x - s*14, p.y - s*14, s*28, s*28);
      ctx.globalAlpha = Math.pow(1 - u, 1.5); ctx.strokeStyle = p.col; ctx.lineWidth = 2.5*(1 - u) + 0.5;
      ctx.beginPath(); ctx.ellipse(p.x, p.y, s*(3 + 11*u), s*(1.1 + 3.6*u), 0, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#FFF6D0'; ctx.globalAlpha = Math.pow(1 - u, 2); star4(ctx, p.x, p.y, s*(5 - 3*u));
    }
    else if (k === 'cf4emb') {
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, Math.min(1, p.life*2.2));
      ctx.strokeStyle = p.col; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx*0.025, p.y - p.vy*0.025); ctx.stroke();
    }
    else if (k === 'cf4bal') {
      if (p.y < -p.s*4) { p.life = 0; return true; }
      const s = p.s, x = p.x + Math.sin(t*1.6 + p.ph)*10, y = p.y, tilt = Math.cos(t*1.6 + p.ph)*0.14;
      if (y < p.pop) {
        p.life = 0;
        vparts.push({ x, y, vx: 0, vy: 0, life: 0.32, kind: 'cf4pop', s, col: p.c0 });
        for (let j = 0; j < 12; j++) { const a = j/12*TAU + Math.random()*0.4, sp = 140 + Math.random()*200; vparts.push({ x: x + Math.cos(a)*s*0.5, y: y + Math.sin(a)*s*0.6, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 40, g: 520, life: 0.6 + Math.random()*0.5, kind: 'cf4shard', col: j % 3 ? p.c0 : '#FFFFFF', r: Math.random()*TAU, sp: (Math.random() - 0.5)*14, s: 2.5 + Math.random()*3 }); }
        cf4_tone(900 + Math.random()*500, 0.06, 'square', 0.03, 0.3);
        return true;
      }
      const a = Math.min(1, (H + 30 - y)/60);
      ctx.translate(x, y); ctx.rotate(tilt);
      // string
      ctx.globalAlpha = a*0.6; ctx.strokeStyle = '#E8E4FF'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, s*1.02);
      for (let j = 1; j <= 6; j++) ctx.lineTo(Math.sin(t*4 + p.ph + j*0.9)*3*(j/6), s*1.02 + j*s*0.38);
      ctx.stroke();
      // glow + body
      const gg = ctx.createRadialGradient(0, 0, s*0.6, 0, 0, s*1.5); gg.addColorStop(0, p.c0); gg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.globalAlpha = a*0.3; ctx.fillStyle = gg; cf4_dot(ctx, 0, 0, s*1.5);
      const bg = ctx.createRadialGradient(-s*0.3, -s*0.4, s*0.1, 0, 0, s*1.1);
      bg.addColorStop(0, p.c1); bg.addColorStop(0.45, p.c0); bg.addColorStop(1, p.c0);
      ctx.globalAlpha = a; ctx.fillStyle = bg;
      ctx.beginPath(); ctx.moveTo(0, s);
      ctx.bezierCurveTo(-s*1.15, s*0.55, -s*0.95, -s, 0, -s);
      ctx.bezierCurveTo(s*0.95, -s, s*1.15, s*0.55, 0, s); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = a*0.35; ctx.strokeStyle = '#1A1030'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.globalAlpha = a; ctx.fillStyle = p.c0;
      ctx.beginPath(); ctx.moveTo(0, s*0.94); ctx.lineTo(-s*0.14, s*1.12); ctx.lineTo(s*0.14, s*1.12); ctx.closePath(); ctx.fill();
      ctx.globalAlpha = a*0.75; ctx.fillStyle = '#FFFFFF';
      ctx.beginPath(); ctx.ellipse(-s*0.36, -s*0.42, s*0.14, s*0.26, 0.5, 0, TAU); ctx.fill();
      ctx.globalAlpha = a*0.5; cf4_dot(ctx, -s*0.18, -s*0.72, s*0.06);
    }
    else if (k === 'cf4pop') {
      const u = 1 - Math.max(0, p.life)/0.32;
      ctx.globalAlpha = 1 - u; ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (let j = 0; j < 8; j++) { const a = j/8*TAU, r0 = p.s*(0.5 + u*1.1), r1 = r0 + p.s*0.35*(1 - u); ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a)*r0, p.y + Math.sin(a)*r0); ctx.lineTo(p.x + Math.cos(a)*r1, p.y + Math.sin(a)*r1); ctx.stroke(); }
      ctx.strokeStyle = p.col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(p.x, p.y, p.s*(0.4 + u*1.2), 0, TAU); ctx.stroke();
    }
    else if (k === 'cf4shard') {
      p.vx *= 0.97;
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life*2)); ctx.fillStyle = p.col;
      ctx.translate(p.x, p.y); ctx.rotate(p.r + t*p.sp);
      ctx.beginPath(); ctx.moveTo(-p.s, -p.s*0.4); ctx.lineTo(p.s*0.9, -p.s*0.2); ctx.lineTo(p.s*0.3, p.s*0.5); ctx.closePath(); ctx.fill();
    }
    else if (k === 'cf4dust') {
      ctx.globalAlpha = Math.max(0, Math.min(0.7, p.life))*(0.5 + 0.5*Math.sin(t*6 + p.ph)); ctx.fillStyle = '#E6DCFF';
      cf4_dot(ctx, p.x, p.y, 1.2);
    }
    else if (k === 'cf4inf') {
      const dt = Math.max(0, Math.min(0.05, t - p.lt)); p.lt = t;
      if (vicFx && vicFx.cf4rel) {                               // flung out by the release
        const M = Math.min(W, H), cx = W/2, cy = H*0.45, fl = 0.22 + 0.78*Math.min(1, p.R/(M*0.5));
        const x = cx + Math.cos(p.a)*p.R, y = cy + Math.sin(p.a)*p.R*fl, sp = 350 + Math.random()*500;
        p.kind = 'cf4ray'; p.x = x; p.y = y; p.vx = Math.cos(p.a)*sp; p.vy = Math.sin(p.a)*sp; p.life = 0.5 + Math.random()*0.6;
        return true;
      }
      const M = Math.min(W, H), cx = W/2, cy = H*0.45, Rh = vicFx ? M*(0.018 + 0.085*cf4_ss(Math.min(1, vicFx.t/3.5))) : 10;
      p.R -= dt*(40 + p.R*0.9); p.a += dt*(0.7 + 210/(p.R + 25));
      if (p.R < Rh*1.15) { p.life = 0; return true; }
      const fl = 0.22 + 0.78*Math.min(1, p.R/(M*0.5)), x = cx + Math.cos(p.a)*p.R, y = cy + Math.sin(p.a)*p.R*fl;
      const heat = Math.max(0, 1 - p.R/(M*0.45)), da = 0.035 + 0.2*heat;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.min(1, (t - p.t0)*3)*(0.3 + 0.65*heat); ctx.strokeStyle = heat > 0.65 ? '#FFF2DC' : p.col; ctx.lineWidth = 1 + heat*1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 1; j <= 6; j++) { const aj = p.a - da*j, Rj = p.R*(1 + 0.015*j), fj = 0.22 + 0.78*Math.min(1, Rj/(M*0.5)); ctx.lineTo(cx + Math.cos(aj)*Rj, cy + Math.sin(aj)*Rj*fj); }
      ctx.stroke();
    }
    else if (k === 'cf4ray') {
      p.vx *= 0.975; p.vy *= 0.975;
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = Math.max(0, Math.min(1, p.life*1.4));
      ctx.strokeStyle = p.col; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx*0.04, p.y - p.vy*0.04); ctx.stroke();
    }
  } catch (e) {}
  ctx.restore();
  return true;
}

function drawVictoryChip4(c, id, w, h) {
  if (id !== 'meteors' && id !== 'balloons' && id !== 'lasers' && id !== 'singularity') return false;
  const t = clock;
  c.save();
  try {
    if (id === 'meteors') {
      const sky = c.createLinearGradient(0, 0, 0, h); sky.addColorStop(0, 'rgba(255,110,50,0.18)'); sky.addColorStop(1, 'rgba(120,40,160,0.05)');
      c.fillStyle = sky; c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'lighter';
      for (let m = 0; m < 3; m++) {
        const P = 1.1, u = ((t + m*0.37)/P) % 1, cyc = Math.floor((t + m*0.37)/P), x0 = w*(0.45 + 0.5*cf4_h(m + cyc*3.1)), ty = h*(0.6 + 0.3*cf4_h(m*2 + cyc));
        const ux = -0.62, uy = 0.78, dist = (ty + 8)/uy, s = m === 1 ? 2.6 : 1.9;
        if (u < 0.7) {
          const f = u/0.7, hx = x0 + ux*dist*f, hy = -8 + uy*dist*f, L = s*14;
          const g = c.createLinearGradient(hx, hy, hx - ux*L, hy - uy*L); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.15, m % 2 ? '#FF7A3D' : '#FFB23E'); g.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(hx + uy*s, hy - ux*s); c.lineTo(hx - ux*L, hy - uy*L); c.lineTo(hx - uy*s, hy + ux*s); c.closePath(); c.fill();
          c.fillStyle = '#FFFFFF'; cf4_dot(c, hx, hy, s*0.9);
        } else {
          const f = (u - 0.7)/0.3, ix = x0 + ux*dist, iy = ty;
          const fg = c.createRadialGradient(ix, iy, 0, ix, iy, 14); fg.addColorStop(0, 'rgba(255,240,200,0.95)'); fg.addColorStop(0.35, 'rgba(255,150,60,0.6)'); fg.addColorStop(1, 'rgba(255,90,40,0)');
          c.globalAlpha = Math.pow(1 - f, 1.5); c.fillStyle = fg; c.fillRect(ix - 14, iy - 14, 28, 28);
          c.fillStyle = '#FFF6D0'; star4(c, ix, iy, 7*(1 - f) + 2);
          c.strokeStyle = '#FFB23E'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(ix, iy, 3 + f*14, 1 + f*3.5, 0, 0, TAU); c.stroke();
          c.globalAlpha = 1;
        }
      }
    }
    else if (id === 'balloons') {
      [[0.24, 0, 11, 0], [0.55, 0.38, 13, 1], [0.8, 0.7, 9, 3]].forEach(([fx, off, s, pi]) => {
        const u = (t*0.32 + off) % 1, x = w*fx + Math.sin(t*1.8 + pi)*3, y = h + s*2 - u*(h + s*4), pal = cf4_BAL[(pi + 1) % cf4_BAL.length];
        c.save(); c.translate(x, y); c.rotate(Math.cos(t*1.8 + pi)*0.12);
        c.strokeStyle = 'rgba(232,228,255,0.6)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, s); c.quadraticCurveTo(Math.sin(t*4 + pi)*3, s*1.6, 0, s*2.2); c.stroke();
        const bg = c.createRadialGradient(-s*0.3, -s*0.4, 1, 0, 0, s*1.1); bg.addColorStop(0, pal[1]); bg.addColorStop(0.45, pal[0]); bg.addColorStop(1, pal[0]);
        c.fillStyle = bg; c.beginPath(); c.moveTo(0, s); c.bezierCurveTo(-s*1.15, s*0.55, -s*0.95, -s, 0, -s); c.bezierCurveTo(s*0.95, -s, s*1.15, s*0.55, 0, s); c.fill();
        c.beginPath(); c.moveTo(0, s*0.94); c.lineTo(-s*0.15, s*1.14); c.lineTo(s*0.15, s*1.14); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,0.75)'; c.beginPath(); c.ellipse(-s*0.36, -s*0.42, s*0.14, s*0.26, 0.5, 0, TAU); c.fill();
        c.restore();
      });
    }
    else if (id === 'lasers') {
      const hz = c.createLinearGradient(0, 0, 0, h); hz.addColorStop(0, 'rgba(120,60,255,0)'); hz.addColorStop(1, 'rgba(150,90,255,0.3)');
      c.fillStyle = hz; c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
      for (let e = 0; e < 3; e++) {
        const ex = w*(0.2 + e*0.3), ey = h + 2, col = cf4_LAS[(e + Math.floor(t/1.6)) % cf4_LAS.length];
        for (let j = 0; j < 3; j++) {
          const an = -Math.PI/2 + Math.sin(t*2 + e*1.3)*0.6 + (j - 1)*0.22, x1 = ex + Math.cos(an)*90, y1 = ey + Math.sin(an)*90;
          const g = c.createLinearGradient(ex, ey, x1, y1); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
          c.strokeStyle = g; c.globalAlpha = 0.35; c.lineWidth = 3.5; c.beginPath(); c.moveTo(ex, ey); c.lineTo(x1, y1); c.stroke();
          c.globalAlpha = 1; c.lineWidth = 1.1; c.stroke();
        }
        c.fillStyle = '#FFFFFF'; cf4_dot(c, ex, ey - 1, 2);
      }
    }
    else if (id === 'singularity') {
      const cx = w/2, cy = h*0.5, R = 8.5*Math.min(w/88, h/60)*(1 + 0.05*Math.sin(t*2.2));
      c.globalCompositeOperation = 'lighter';
      for (let k = 0; k < 14; k++) {                                // matter spiralling in
        const u = (t*0.35 + cf4_h(k)) % 1, rr2 = R*(1.2 + 3.6*(1 - u)), a = cf4_h(k*3.1)*TAU + u*7 + t*0.4;
        c.globalAlpha = Math.sin(u*Math.PI)*0.85; c.fillStyle = k % 3 === 0 ? '#FFC27A' : k % 3 === 1 ? '#C890FF' : '#7FE8FF';
        cf4_dot(c, cx + Math.cos(a)*rr2, cy + Math.sin(a)*rr2*(0.3 + 0.7*(1 - u)), 0.9 + u*0.6);
      }
      c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
      cf4_bh(c, cx, cy, R, t, 1, 0.26);
      c.fillStyle = '#FFFFFF';
      for (let k = 0; k < 3; k++) { const tw = Math.max(0, Math.sin(t*2.5 + k*2.1)); c.globalAlpha = tw; star4(c, w*(0.14 + k*0.36), h*(0.18 + (k % 2)*0.64), 1.5 + tw*2.5); }
    }
  } catch (e) {}
  c.restore();
  return true;
}

// ---------- ball skin: eightball ----------
function cf4_eight(c, A0, x, y, r, t, vx, vy) {
  const sp = Math.hypot(vx, vy), ux = sp > 1e-6 ? vx/sp : Math.cos(t*0.5), uy = sp > 1e-6 ? vy/sp : Math.sin(t*0.5);
  const rate = 1.2 + Math.min(5.5, (sp/(r || 1))*0.2), ph0 = t*rate, phi = ph0 - 0.62*Math.sin(ph0), beta = 0.38 + 0.12*Math.sin(t*0.9);  // lingers on the front face
  const wx = -uy, wy = ux;
  // neon rim glow
  const hg = c.createRadialGradient(x, y, r*0.9, x, y, r*1.85);
  hg.addColorStop(0, 'rgba(180,92,255,0.55)'); hg.addColorStop(0.4, 'rgba(155,61,255,0.18)'); hg.addColorStop(1, 'rgba(120,40,255,0)');
  c.globalAlpha = A0*(0.85 + 0.15*Math.sin(t*5)); c.fillStyle = hg; cf4_dot(c, x, y, r*1.85);
  // glossy black body
  c.globalAlpha = A0;
  const g = c.createRadialGradient(x - r*0.35, y - r*0.4, r*0.05, x, y, r);
  g.addColorStop(0, '#4A4658'); g.addColorStop(0.35, '#16141F'); g.addColorStop(1, '#020205');
  c.fillStyle = g; cf4_dot(c, x, y, r);
  // the "8" spot rolls with the travel direction
  const sa = Math.sin(phi)*Math.cos(beta), sz = Math.cos(phi)*Math.cos(beta), sb = Math.sin(beta);
  if (sz > -0.25) {
    const ox = (ux*sa + wx*sb)*r, oy = (uy*sa + wy*sb)*r, d = Math.hypot(ox, oy), th = d > 1e-9 ? Math.atan2(oy, ox) : 0;
    const fz = Math.max(0.06, sz), vis = Math.min(1, (sz + 0.25)/0.35);
    c.save(); c.beginPath(); c.arc(x, y, r*0.985, 0, TAU); c.clip();
    c.translate(x + ox*0.97, y + oy*0.97); c.rotate(th); c.scale(fz, 1);
    c.globalAlpha = A0*vis; c.fillStyle = '#F4F2FA'; cf4_dot(c, 0, 0, r*0.44);
    c.rotate(-th + Math.sin(phi)*0.25);                           // the 8 stays readable, rocking a little as it rolls
    c.strokeStyle = '#08070C'; c.lineWidth = r*0.085;
    c.beginPath(); c.ellipse(0, -r*0.11, r*0.1, r*0.095, 0, 0, TAU); c.stroke();
    c.beginPath(); c.ellipse(0, r*0.12, r*0.13, r*0.12, 0, 0, TAU); c.stroke();
    c.restore();
  }
  // sheen: fixed light, so it stays put while the ball rolls
  c.globalAlpha = A0*0.85; c.fillStyle = '#FFFFFF';
  c.beginPath(); c.ellipse(x - r*0.4, y - r*0.46, r*0.24, r*0.13, -0.65, 0, TAU); c.fill();
  c.globalAlpha = A0*0.25; c.beginPath(); c.ellipse(x - r*0.2, y - r*0.62, r*0.5, r*0.2, -0.25, 0, TAU); c.fill();
  // purple neon rim
  c.lineCap = 'round';
  c.globalAlpha = A0*0.9; c.strokeStyle = '#B45CFF'; c.lineWidth = r*0.13; c.beginPath(); c.arc(x, y, r*0.97, 0, TAU); c.stroke();
  c.globalAlpha = A0; c.strokeStyle = '#E6CCFF'; c.lineWidth = r*0.045; c.beginPath(); c.arc(x, y, r*0.97, 0, TAU); c.stroke();
  // orbiting glint
  const ga = t*2.6;
  c.globalAlpha = A0*0.95; c.strokeStyle = '#FFFFFF'; c.lineWidth = r*0.07; c.beginPath(); c.arc(x, y, r*0.97, ga, ga + 0.7); c.stroke();
  c.fillStyle = '#FFFFFF'; c.globalAlpha = A0*(0.6 + 0.4*Math.sin(t*9)); star4(c, x + Math.cos(ga + 0.7)*r*0.97, y + Math.sin(ga + 0.7)*r*0.97, r*0.3);
}
function drawBallSkin4(c, id, x, y, r, t, vx, vy) {
  if (id !== 'eightball') return false;
  c.save();
  try { const A0 = c.globalAlpha; c.shadowBlur = 0; cf4_eight(c, A0, x, y, r, t || 0, vx || 0, vy || 0); } catch (e) {}
  c.restore();
  return true;
}


