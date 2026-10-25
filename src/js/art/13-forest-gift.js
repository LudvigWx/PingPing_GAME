// ===================== forest gift bundle (a personal gift, only from a redeem code) =====================
// Hat: Pine tree · Face: Pinecone eyes · Ball: Lingonberry · Aura: Leaf wind · Win effect: Forest fall · Arena: Forest
// Hooks into the luxe tables (LX_HATS, LX_FACES, LX_BALLS, LX_AURAS, LX_VIC_FN) so no new dispatch chains are needed.

HATS.push(['pinetree', 'Pine tree']);
FACES.push(['pinecones', 'Pinecone eyes']);
BALLSKINS.push(['lingon', 'Lingonberry']);
AURAS.push(['leafwind', 'Leaf wind']);
VICTORY.push(['forestfall', 'Forest fall']);
ARENAS.forest = 'Forest';
Object.assign(PRICE.h, { pinetree: null }); Object.assign(PRICE.f, { pinecones: null }); Object.assign(PRICE.b, { lingon: null });
Object.assign(PRICE.u, { leafwind: null }); Object.assign(PRICE.v, { forestfall: null }); PRICE.a.forest = null;
const GIFT_SRC = { 'h:pinetree': 1, 'f:pinecones': 1, 'b:lingon': 1, 'u:leafwind': 1, 'v:forestfall': 1, 'a:forest': 1 };

const FG_LEAF_COLS = ['#E8742A', '#F2B33D', '#C8402A', '#7CC456', '#3E9E58', '#D9A23A'];
function fg_leaf(c, s, col, vein) {
  c.fillStyle = col; c.beginPath(); c.moveTo(-s, 0); c.bezierCurveTo(-s*0.4, -s*0.75, s*0.5, -s*0.6, s, 0); c.bezierCurveTo(s*0.5, s*0.6, -s*0.4, s*0.75, -s, 0); c.fill();
  if (vein !== false) { c.strokeStyle = 'rgba(60,30,10,0.45)'; c.lineWidth = s*0.09; c.beginPath(); c.moveTo(-s*1.15, 0); c.lineTo(s*0.85, 0); for (const k of [-0.3, 0.2]) { c.moveTo(k*s, 0); c.lineTo(k*s + s*0.3, -s*0.32); c.moveTo(k*s, 0); c.lineTo(k*s + s*0.3, s*0.32); } c.stroke(); }
  c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(-s*0.15, -s*0.22, s*0.45, s*0.12, -0.2, 0, TAU); c.fill();
}
function fg_cone(c, s, rot) { // a small pinecone, pointing down
  c.save(); c.rotate(rot || 0);
  c.fillStyle = lx_lg(c, -s, 0, s, 0, ['#5A3216', '#9A5E2C', '#5A3216']);
  c.beginPath(); c.ellipse(0, 0, s*0.62, s, 0, 0, TAU); c.fill();
  c.strokeStyle = '#E0A060'; c.lineWidth = s*0.1;
  for (let r = -0.7; r <= 0.75; r += 0.32) { const w = Math.sqrt(Math.max(0, 1 - r*r))*s*0.6; c.beginPath(); c.moveTo(-w, r*s); c.quadraticCurveTo(0, r*s + s*0.22, w, r*s); c.stroke(); }
  c.fillStyle = '#4A2A10'; c.fillRect(-s*0.08, -s*1.2, s*0.16, s*0.3);
  c.restore();
}

// ---------------------------------------------------------------- hat: a short, sturdy Scots pine with a soft living glow
function fg_clump(c, x, y, rx, ry, seed) { // a fuzzy, flat-topped cloud of pine needles
  c.beginPath();
  const n = 34;
  for (let k = 0; k <= n; k++) {
    const a = k/n*TAU, top = Math.sin(a) < 0, spike = k % 2 ? 1.12 : 0.94, wob = 1 + 0.08*Math.sin(a*3 + seed);
    const R = (top ? spike : 0.96)*wob, px = x + Math.cos(a)*rx*R, py = y + Math.sin(a)*ry*R*(top ? 1 : 0.7);
    k ? c.lineTo(px, py) : c.moveTo(px, py);
  }
  c.closePath();
}
LX_HATS.pinetree = function (c, col, t) {
  // a tall Scots pine: long bare orange trunk, airy layers of needle tufts higher up, soft glow
  const pulse = 0.5 + 0.5*Math.sin(t*1.8), H = 25;
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.25 + 0.25*pulse;
  c.fillStyle = lx_rg(c, 0, -16, 1, 12, ['rgba(160,255,180,0.8)', 'rgba(90,220,140,0.22)', 'rgba(60,200,120,0)']); c.beginPath(); c.ellipse(0, -16, 9, 12, 0, 0, TAU); c.fill(); c.restore();
  const sway = y => Math.sin(t*1.2)*0.02*(-y);   // the top moves more than the base
  // trunk
  c.beginPath(); c.moveTo(-0.75, 0.3); c.lineTo(-0.38 + sway(-H), -H); c.lineTo(0.38 + sway(-H), -H); c.lineTo(0.75, 0.3); c.closePath();
  c.fillStyle = lx_lg(c, -0.8, 0, 0.8, 0, ['#7A3A18', '#E08A4E', '#F2A868', '#A85A2A']); c.fill();
  c.fillStyle = 'rgba(70,40,20,0.55)'; c.fillRect(-0.75, -4, 1.5, 4.3);   // greyer, rougher bark at the foot
  c.strokeStyle = 'rgba(90,40,14,0.6)'; c.lineWidth = 0.18; c.lineCap = 'round';
  c.beginPath(); c.moveTo(-0.2, -4.6); c.lineTo(-1.6, -5.6); c.moveTo(0.2, -6.2); c.lineTo(1.4, -6.9); c.stroke();   // dead stubs
  // branch levels, widest in the middle, sparse and alternating like the photo
  const LV = 8, YS = [-9.2, -11, -12.4, -14.3, -15.8, -17.6, -19.6, -21.6];
  for (let i = 0; i < LV; i++) {
    const y = YS[i], u = i/(LV - 1), side = lx_h(i + 31) > 0.5 ? 1 : -1;
    const len = (1.6 + 6.4*Math.sin(Math.min(1, u*1.15 + 0.1)*Math.PI*0.9))*(0.85 + 0.3*lx_h(i)), x0 = sway(y);
    const lift = -0.5 - lx_h(i + 5)*0.6;
    for (const sd of (len > 4 && lx_h(i + 17) > 0.45 ? [side, -side] : [side])) {
      const L = sd === side ? len : len*0.55, ex = x0 + sd*L, ey = y + lift*(sd === side ? 1 : 0.6);
      c.strokeStyle = '#9A5226'; c.lineWidth = 0.32; c.beginPath(); c.moveTo(x0, y); c.quadraticCurveTo(x0 + sd*L*0.5, y + 0.4, ex, ey); c.stroke();
      const n = Math.max(1, Math.round(L/2));
      for (let k = 0; k < n; k++) {
        const f = 1 - k/(n - 0.3 + 0.001) * 0.85, cx = x0 + sd*L*f, cy = y + 0.2 + (ey - y)*f - 0.3, rx = 1.3 + lx_h(i*7 + k)*0.9, ry = 0.7 + lx_h(i*3 + k)*0.35;
        fg_clump(c, cx, cy, rx, ry, i + k);
        c.fillStyle = lx_lg(c, 0, cy - ry, 0, cy + ry, ['#5EA85A', '#2C6A38', '#163A22']); c.fill();
        c.strokeStyle = 'rgba(200,255,200,' + (0.25 + 0.35*pulse).toFixed(2) + ')'; c.lineWidth = 0.18;
        c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, Math.PI*1.1, Math.PI*1.9); c.stroke();
      }
    }
  }
  // the leader at the very top
  const tx = sway(-H);
  for (let k = 0; k < 3; k++) { const cy = -H + 0.6 - k*1.2, rx = 1.4 - k*0.35; fg_clump(c, tx, cy, rx, 0.75, 20 + k); c.fillStyle = lx_lg(c, 0, cy - 0.8, 0, cy + 0.8, ['#6CB866', '#2C6A38']); c.fill(); }
  c.save(); c.shadowColor = '#A8FFB8'; c.shadowBlur = 5 + 5*pulse; c.strokeStyle = 'rgba(200,255,200,' + (0.3 + 0.4*pulse).toFixed(2) + ')'; c.lineWidth = 0.22;
  c.beginPath(); c.moveTo(tx - 1, -H - 1.4); c.quadraticCurveTo(tx, -H - 2.6, tx + 1, -H - 1.4); c.stroke(); c.restore();
};

// ---------------------------------------------------------------- face: pinecone eyes (layered scales, a dark glossy seed as the pupil)
function fg_coneEye(c, gx, gy, t) {
  const W0 = 2.7, top = -3, bot = 3.4;
  const half = y => { const u = (y - top)/(bot - top); return W0*Math.sin(Math.min(1, Math.max(0, u))*Math.PI*0.92 + 0.12)*(1 - u*0.35); };
  // dark core, so the gaps between the scales read as depth
  c.fillStyle = '#2A1406'; c.beginPath(); c.moveTo(0, top);
  for (let y = top; y <= bot; y += 0.3) c.lineTo(half(y)*0.92, y);
  for (let y = bot; y >= top; y -= 0.3) c.lineTo(-half(y)*0.92, y);
  c.closePath(); c.fill();
  // scales, top row first, every row overlapping the one above
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const y = top + 0.55 + r*((bot - top - 0.9)/(rows - 1)), w = half(y), n = r % 2 ? 2 : 3, sw = Math.min(1.5, (w*2)/n + 0.3), sh = 1.25;
    for (let k = 0; k < n; k++) {
      const x = (k - (n - 1)/2)*(w*2/n);
      c.beginPath();
      c.moveTo(x, y - sh*0.5);
      c.quadraticCurveTo(x + sw*0.62, y - sh*0.2, x + sw*0.5, y + sh*0.18);
      c.quadraticCurveTo(x + sw*0.15, y + sh*0.62, x, y + sh*0.66);
      c.quadraticCurveTo(x - sw*0.15, y + sh*0.62, x - sw*0.5, y + sh*0.18);
      c.quadraticCurveTo(x - sw*0.62, y - sh*0.2, x, y - sh*0.5);
      c.fillStyle = lx_lg(c, x, y - sh*0.5, x, y + sh*0.66, ['#E2A868', '#B0703A', '#6A3A18']); c.fill();
      c.strokeStyle = '#2A1406'; c.lineWidth = 0.17; c.stroke();
      c.strokeStyle = 'rgba(255,225,170,0.6)'; c.lineWidth = 0.12; c.beginPath(); c.moveTo(x - sw*0.3, y - sh*0.12); c.quadraticCurveTo(x, y - sh*0.38, x + sw*0.3, y - sh*0.12); c.stroke();
      c.fillStyle = '#5A3014'; lx_dot(c, x, y + sh*0.22, 0.14);
    }
  }
  // the stem
  c.fillStyle = '#4A2A10'; rr(c, -0.28, top - 0.9, 0.56, 1.1, 0.2); c.fill();
  // a glossy dark seed peeking out of the middle: the pupil
  const px = gx*0.55, py = 0.25 + gy*0.45;
  c.save(); c.shadowColor = 'rgba(255,190,110,0.8)'; c.shadowBlur = 4;
  c.fillStyle = lx_rg(c, px - 0.2, py - 0.2, 0.05, 0.8, ['#4A2A10', '#160A02']); c.beginPath(); c.ellipse(px, py, 0.72, 0.82, 0, 0, TAU); c.fill(); c.restore();
  c.fillStyle = '#FFFFFF'; lx_dot(c, px - 0.25, py - 0.3, 0.24); c.fillStyle = 'rgba(255,255,255,0.6)'; lx_dot(c, px + 0.22, py + 0.22, 0.1);
}
LX_FACES.pinecones = function (c, gx, gy, t) {
  const blink = (t % 4.1) < 0.13;
  for (const s of [-1, 1]) {
    c.save(); c.translate(s*4.2, 0.1); c.rotate(s*0.06 + gx*0.06); c.scale(1, blink ? 0.2 : 1);
    fg_coneEye(c, gx, gy, t);
    c.restore();
  }
};

// ---------------------------------------------------------------- ball: a glossy lingonberry with a little sprig
LX_BALLS.lingon = function (c, A0, x, y, r, t, vx, vy) {
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = A0*0.55; c.fillStyle = lx_rg(c, x, y, r*0.4, r*2.1, ['rgba(255,60,80,0.55)', 'rgba(255,40,60,0)']); lx_dot(c, x, y, r*2.1); c.restore();
  c.fillStyle = lx_rg(c, x - r*0.35, y - r*0.4, r*0.08, r*1.08, ['#FF8A8A', '#E8202E', '#B00A20', '#5A0010']); lx_dot(c, x, y, r);
  c.fillStyle = 'rgba(90,0,10,0.35)'; for (let k = 0; k < 7; k++) { const a = lx_h(k)*TAU, d = lx_h(k + 4)*r*0.75; lx_dot(c, x + Math.cos(a)*d, y + Math.sin(a)*d, r*0.045); }
  // calyx (the little dark star at the bottom of a lingonberry)
  const rot = t*0.8;
  c.save(); c.translate(x + r*0.28, y + r*0.42); c.rotate(rot); c.fillStyle = '#4A0A10';
  c.beginPath(); for (let k = 0; k < 10; k++) { const a = k*TAU/10, rr2 = k % 2 ? r*0.08 : r*0.2; k ? c.lineTo(Math.cos(a)*rr2, Math.sin(a)*rr2) : c.moveTo(Math.cos(a)*rr2, Math.sin(a)*rr2); } c.closePath(); c.fill(); c.restore();
  // gloss
  c.fillStyle = 'rgba(255,255,255,0.85)'; c.beginPath(); c.ellipse(x - r*0.38, y - r*0.42, r*0.26, r*0.15, -0.7, 0, TAU); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.5)'; lx_dot(c, x + r*0.35, y + r*0.05, r*0.08);
  // sprig with two leaves
  c.save(); c.translate(x - r*0.1, y - r*0.92); c.rotate(-0.35 + Math.sin(t*2.5)*0.12);
  c.strokeStyle = '#5A3A1A'; c.lineWidth = r*0.09; c.beginPath(); c.moveTo(0, 0); c.lineTo(r*0.1, -r*0.45); c.stroke();
  for (const s of [-1, 1]) { c.save(); c.translate(r*0.1, -r*0.42); c.rotate(s*0.9 - 0.2); c.translate(r*0.38, 0);
    c.fillStyle = lx_lg(c, -r*0.4, 0, r*0.4, 0, ['#1E6A34', '#3EA65A', '#1E6A34']); c.beginPath(); c.ellipse(0, 0, r*0.4, r*0.19, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(200,255,200,0.5)'; c.lineWidth = r*0.03; c.beginPath(); c.moveTo(-r*0.36, 0); c.lineTo(r*0.36, 0); c.stroke(); c.restore(); }
  c.restore();
  const f = (t % 2.2)/2.2; if (f < 0.15) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = A0*Math.sin(f/0.15*Math.PI); c.fillStyle = '#FFFFFF'; star4(c, x - r*0.45, y - r*0.5, r*0.7); c.restore(); }
};

// ---------------------------------------------------------------- aura: leaves swirling around in the wind
LX_AURAS.leafwind = function (c, A0, hw, t, col) {
  const RX = hw + 7, RY = 7;
  c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = A0*0.35; c.strokeStyle = 'rgba(220,255,220,0.6)'; c.lineWidth = 0.3; c.lineCap = 'round';
  for (let k = 0; k < 3; k++) { const a0 = t*1.4 + k*2.1; c.beginPath(); c.ellipse(0, -2.5 + k*0.6, RX - k*2, RY - k, -0.1, a0, a0 + 1.4); c.stroke(); }
  c.restore();
  for (let i = 0; i < 14; i++) {
    const a = t*1.15 + i*TAU/14 + Math.sin(t*0.9 + i)*0.25, rx = RX + Math.sin(i*2.3)*2.5, ry = RY + Math.cos(i*1.7)*1.5;
    const x = Math.cos(a)*rx, y = -2.5 + Math.sin(a)*ry + Math.sin(t*2 + i)*0.8, s = 1.3 + lx_h(i)*0.8;
    c.save(); c.globalAlpha = A0*(0.75 + 0.25*Math.sin(a)); c.translate(x, y); c.rotate(a + Math.PI/2 + Math.sin(t*3 + i)*0.6); c.scale(1, 0.35 + 0.65*Math.abs(Math.cos(t*3.2 + i*1.3)));
    fg_leaf(c, s, FG_LEAF_COLS[i % FG_LEAF_COLS.length], s > 1.6);
    c.restore();
  }
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#FFF2B0';
  for (let k = 0; k < 7; k++) { const a = t*1.15 + k*0.9, x = Math.cos(a - 0.3)*(RX + 1), y = -2.5 + Math.sin(a - 0.3)*RY; c.globalAlpha = A0*(0.4 + 0.6*Math.abs(Math.sin(t*5 + k))); star4(c, x, y, 0.45); }
  c.restore();
};

// ---------------------------------------------------------------- win effect: leaves and pinecones fall like confetti, in golden forest light
const FG_PIECES = Array.from({ length: 90 }, (_, i) => ({ i, cone: i % 5 === 0, burst: i < 36, x: lx_h(i*3 + 1), d: lx_h(i*3 + 2), s: 0.7 + lx_h(i*3 + 3)*0.8, col: FG_LEAF_COLS[i % FG_LEAF_COLS.length] }));
LX_VIC.push('forestfall');
LX_VIC_FN.forestfall = function (t, dt) {
  const c = ctx, a = lx_env(t), sc = Math.max(0.8, Math.min(W, H)/600);
  // golden light falling through the canopy
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 5; k++) {
    const x0 = W*(0.12 + k*0.19) + Math.sin(t*0.6 + k)*W*0.03, w0 = W*0.035, w1 = W*0.12;
    c.globalAlpha = a*(0.16 + 0.08*Math.sin(t*1.3 + k*1.7));
    c.fillStyle = lx_lg(c, 0, 0, 0, H, ['rgba(255,226,140,0.9)', 'rgba(255,210,120,0.3)', 'rgba(255,200,100,0)']);
    c.beginPath(); c.moveTo(x0 - w0, -10); c.lineTo(x0 + w0, -10); c.lineTo(x0 + w1 + W*0.08, H); c.lineTo(x0 - w1 + W*0.08, H); c.closePath(); c.fill();
  }
  c.globalAlpha = a*0.12; c.fillStyle = lx_rg(c, W/2, -H*0.1, 0, H, ['rgba(255,236,170,1)', 'rgba(255,236,170,0)']); c.fillRect(0, 0, W, H);
  c.restore();
  // the pieces: a burst from the bottom first, then a steady fall from the top
  for (const p of FG_PIECES) {
    let x, y, rot;
    if (p.burst) {
      const tt = t - p.d*0.25; if (tt < 0) continue;
      const vx = (p.x - 0.5)*W*1.1, vy = -H*(1.1 + p.d*0.5), g = H*1.3, drag = Math.min(tt, 1.1);
      x = W/2 + vx*drag*0.8 + Math.sin(tt*2.5 + p.i)*30*sc; y = H*1.02 + vy*drag + 0.5*g*drag*drag + Math.max(0, tt - 1.1)*H*0.22;
      rot = tt*(3 + p.d*4) + p.i;
    } else {
      const tt = t - 0.3 - p.d*1.8; if (tt < 0) continue;
      x = W*p.x + Math.sin(tt*1.8 + p.i)*40*sc; y = -30 + tt*H*(0.22 + p.d*0.18); rot = tt*(2 + p.d*3) + p.i;
    }
    if (y > H + 40) continue;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot);
    if (p.cone) { c.scale(sc*7*p.s, sc*7*p.s); fg_cone(c, 1, 0); }
    else { c.scale(sc*7*p.s, sc*7*p.s*Math.max(0.2, Math.abs(Math.cos(rot*1.3)))); fg_leaf(c, 1, p.col); }
    c.restore();
  }
  // glitter
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = '#FFF2C0';
  for (let k = 0; k < 40; k++) { const tw = Math.sin(t*6 + k*1.7); if (tw < 0.4) continue; c.globalAlpha = a*(tw - 0.4); star4(c, W*lx_h(k + 50), H*lx_h(k + 90)*0.9, (2 + lx_h(k)*3)*sc); }
  c.restore();
};
LX_CHIP_FN.forestfall = function (c, w, h) {
  const t = clock;
  c.fillStyle = lx_lg(c, 0, 0, 0, h, ['#1A3A2A', '#0E2018']); c.fillRect(0, 0, w, h);
  c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,220,140,0.18)'; c.beginPath(); c.moveTo(w*0.3, 0); c.lineTo(w*0.45, 0); c.lineTo(w*0.7, h); c.lineTo(w*0.4, h); c.fill(); c.restore();
  for (let i = 0; i < 8; i++) { const y = (t*22 + i*17) % (h + 10) - 5, x = (i*23 + Math.sin(t*2 + i)*6) % w; c.save(); c.translate(x, y); c.rotate(t*2 + i); if (i % 3 === 0) { c.scale(4, 4); fg_cone(c, 1, 0); } else { c.scale(5, 5*Math.max(0.25, Math.abs(Math.cos(t*3 + i)))); fg_leaf(c, 1, FG_LEAF_COLS[i % 6], false); } c.restore(); }
};

// ---------------------------------------------------------------- arena: a deep forest around the triangle
let fgBgCache = null;
function fg_pine(c, x, base, h, col) {
  c.fillStyle = col; c.beginPath();
  const w = h*0.36;
  for (let i = 0; i < 5; i++) { const top = base - h + i*h*0.17, bot = top + h*0.3, ww = w*(0.3 + 0.7*(i + 1)/5); c.moveTo(x, top); c.lineTo(x + ww, bot); c.lineTo(x - ww, bot); c.closePath(); }
  c.fill(); c.fillRect(x - w*0.06, base - h*0.12, w*0.12, h*0.12);
}
function fg_buildBg(w, h) {
  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w)); cv.height = Math.max(1, Math.round(h));
  const c = cv.getContext('2d');
  c.fillStyle = lx_lg(c, 0, 0, 0, h, ['#08161A', '#10302C', '#1D4A3A', '#2E5A40']); c.fillRect(0, 0, w, h);
  c.fillStyle = lx_rg(c, w/2, h*0.42, 0, Math.max(w, h)*0.55, ['rgba(255,214,140,0.42)', 'rgba(240,170,90,0.12)', 'rgba(0,0,0,0)']); c.fillRect(0, 0, w, h);
  const layers = [['#2F5A48', 0.55, 0.22, 60, 0.5], ['#20443A', 0.66, 0.3, 44, 0.75], ['#14302A', 0.8, 0.42, 30, 1], ['#0A1C18', 1.02, 0.62, 16, 1.4]];
  layers.forEach(([col, by, hh, n, sz], li) => {
    for (let k = 0; k < n; k++) {
      const x = lx_h(k*7 + li*131)*w*1.1 - w*0.05, edge = Math.abs(x/w - 0.5)*2; // taller trees at the sides, the middle stays open
      const hgt = h*hh*(0.6 + lx_h(k*3 + li)*0.6)*(li === 3 ? 0.35 + edge*1.1 : 0.45 + edge*0.8);
      fg_pine(c, x, h*by + lx_h(k + li*9)*h*0.04, hgt, col);
    }
    c.fillStyle = 'rgba(190,220,200,' + (0.1 - li*0.02) + ')';
    c.fillRect(0, h*by - h*0.06, w, h*0.08);
  });
  // big trunks framing the view
  for (const s of [-1, 1]) for (let k = 0; k < 2; k++) {
    const x = s < 0 ? w*(0.02 + k*0.09) : w*(0.98 - k*0.09), tw = Math.max(18, w*0.035)*(1 - k*0.3);
    c.fillStyle = lx_lg(c, x - tw, 0, x + tw, 0, ['#0A1410', k ? '#2A2016' : '#3A2A1C', '#0A1410']); c.fillRect(x - tw, 0, tw*2, h);
    c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 2; for (let y = 0; y < h; y += 26) { c.beginPath(); c.moveTo(x - tw*0.6, y + lx_h(y + k)*10); c.lineTo(x - tw*0.2, y + 14); c.stroke(); }
  }
  c.fillStyle = lx_lg(c, 0, h*0.8, 0, h, ['rgba(8,20,14,0)', 'rgba(8,20,14,0.9)']); c.fillRect(0, h*0.8, w, h*0.2);
  c.fillStyle = lx_rg(c, w/2, h*0.55, 0, Math.min(w, h)*0.55, ['rgba(6,16,13,0.45)', 'rgba(6,16,13,0.2)', 'rgba(6,16,13,0)']); c.fillRect(0, 0, w, h); // calmer behind the triangle
  return cv;
}
function drawForestBg() {
  if (!fgBgCache || fgBgCache.w !== W || fgBgCache.h !== H) fgBgCache = { w: W, h: H, cv: fg_buildBg(W, H) };
  ctx.drawImage(fgBgCache.cv, 0, 0, W, H);
  const t = clock;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) {
    const x0 = W*(0.25 + k*0.17) + Math.sin(t*0.25 + k*1.4)*W*0.04, w0 = W*0.02, w1 = W*0.09;
    ctx.globalAlpha = 0.07 + 0.04*Math.sin(t*0.7 + k*2);
    ctx.fillStyle = lx_lg(ctx, 0, 0, 0, H, ['rgba(255,230,160,1)', 'rgba(255,220,150,0.3)', 'rgba(255,220,150,0)']);
    ctx.beginPath(); ctx.moveTo(x0 - w0, 0); ctx.lineTo(x0 + w0, 0); ctx.lineTo(x0 + w1 + W*0.05, H*0.95); ctx.lineTo(x0 - w1 + W*0.05, H*0.95); ctx.closePath(); ctx.fill();
  }
  for (let k = 0; k < 26; k++) {
    const x = W*lx_h(k) + Math.sin(t*0.5 + k)*30, y = H*(0.3 + lx_h(k + 40)*0.65) + Math.cos(t*0.7 + k*1.3)*20, on = Math.max(0, Math.sin(t*1.6 + k*2.1));
    ctx.globalAlpha = on*0.9; ctx.fillStyle = lx_rg(ctx, x, y, 0, 9, ['rgba(220,255,140,0.9)', 'rgba(190,255,110,0)']); lx_dot(ctx, x, y, 9);
    ctx.fillStyle = '#F6FFD0'; lx_dot(ctx, x, y, 1.6);
  }
  ctx.restore();
  for (let k = 0; k < 9; k++) {
    const u = (t*0.06 + lx_h(k + 7)) % 1, x = W*lx_h(k + 20) + Math.sin(t*0.8 + k)*60 + u*W*0.2, y = -20 + u*(H + 40);
    ctx.save(); ctx.globalAlpha = 0.75*Math.sin(u*Math.PI); ctx.translate(x, y); ctx.rotate(t*1.5 + k); ctx.scale(7, 7*Math.max(0.25, Math.abs(Math.cos(t*2 + k))));
    fg_leaf(ctx, 1, FG_LEAF_COLS[k % 6], false); ctx.restore();
  }
  ctx.globalAlpha = 1;
}
function drawForestFloor(A) { // called inside the arena clip, in world units
  ctx.save(); ctx.clip();
  for (let k = 0; k < 18; k++) {
    const x = (lx_h(k*3) - 0.5)*1.8, y = (lx_h(k*3 + 1) - 0.5)*1.8, r = 0.06 + lx_h(k*3 + 2)*0.12;
    ctx.fillStyle = 'rgba(90,170,90,0.07)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(140,210,140,0.10)'; ctx.lineWidth = 0.004;
  for (let k = 0; k < 7; k++) { // fern fronds
    const x = (lx_h(k + 70) - 0.5)*1.6, y = (lx_h(k + 80) - 0.5)*1.6, a = lx_h(k + 90)*TAU;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0.16, 0);
    for (let j = 1; j < 7; j++) { const px = j*0.022, l = 0.04*(1 - j/8); ctx.moveTo(px, 0); ctx.lineTo(px + 0.012, -l); ctx.moveTo(px, 0); ctx.lineTo(px + 0.012, l); }
    ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
function drawForestChip(cvs) {
  const c = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  c.fillStyle = lx_lg(c, 0, 0, 0, h, ['#10302C', '#2E5A40']); c.fillRect(0, 0, w, h);
  for (let k = 0; k < 9; k++) fg_pine(c, k*w/8, h*(0.75 + lx_h(k)*0.15), h*(0.45 + lx_h(k + 3)*0.4), k % 2 ? '#14302A' : '#0A1C18');
  c.strokeStyle = '#7CC456'; c.lineWidth = 2; c.beginPath(); c.moveTo(w/2, 4); c.lineTo(w - 10, h - 4); c.lineTo(10, h - 4); c.closePath(); c.stroke();
}

// a soft warm glow just outside the triangle, so the walls are easy to see against the trees (shields stay inside, in the player colour)
function drawForestEdge(A, dim) {
  const pulse = 0.75 + 0.25*Math.sin(clock*1.4);
  ctx.save(); ctx.lineCap = 'round';
  for (const pass of [0, 1]) {
    ctx.strokeStyle = pass ? 'rgba(255,250,232,0.95)' : 'rgba(255,232,180,0.6)'; ctx.lineWidth = pass ? 0.0045 : 0.013;
    ctx.shadowColor = '#FFE3A0'; ctx.shadowBlur = (pass ? 6 : 16)*DPR; ctx.globalAlpha = dim*pulse;
    ctx.beginPath();
    for (const s of A.sides) { const o = 0.016; ctx.moveTo(s.A[0] + s.out[0]*o, s.A[1] + s.out[1]*o); ctx.lineTo(s.B[0] + s.out[0]*o, s.B[1] + s.out[1]*o); }
    ctx.stroke();
  }
  ctx.restore();
}
