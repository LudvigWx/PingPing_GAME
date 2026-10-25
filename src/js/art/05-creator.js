// ===================== CREATOR EXCLUSIVES (redeem-code only) =====================
// drawCreatorBorder(c, t, W, H)  "Architect's Prism" border
// drawCreatorBg(c, t, W, H)      "Genesis" live background (the first rally ever played)
// drawCreatorOverlay(c, t, W, H) sparkles + holo sweep drawn above the card's dark shade
const CRE_COLS = ['#3EE6FF', '#FF4F8B', '#FFB23E'];
function cre_s(W, H) { return Math.max(0.5, Math.min(1.4, Math.min(W/300, H/300))); }
function cre_holo(c, cx, cy, t, a) {
  if (c.createConicGradient) {
    const g = c.createConicGradient(t*0.9, cx, cy);
    ['#3EE6FF', '#7CFFB2', '#FFE34A', '#FFB23E', '#FF4F8B', '#B57CFF', '#3EE6FF'].forEach((col, i, A) => g.addColorStop(i/(A.length - 1), col));
    return g;
  }
  const g = c.createLinearGradient(cx - 200*Math.cos(t), cy - 200*Math.sin(t), cx + 200*Math.cos(t), cy + 200*Math.sin(t));
  ['#3EE6FF', '#FFE34A', '#FF4F8B', '#B57CFF'].forEach((col, i, A) => g.addColorStop(i/(A.length - 1), col));
  return g;
}
function cre_tri(c, x, y, r, rot) { poly(c, [0, 1, 2].map(k => [x + Math.cos(rot + k*TAU/3 - Math.PI/2)*r, y + Math.sin(rot + k*TAU/3 - Math.PI/2)*r])); }

function drawCreatorBorder(c, t, W, H) {
  t = +t || 0; const s = cre_s(W, H), pad = 5*s, x = pad, y = pad, w = W - 2*pad, h = H - 2*pad, R = 20*s;
  c.save(); c.lineJoin = 'round';
  // outer glow
  c.shadowColor = 'hsl(' + ((t*60) % 360) + ',100%,65%)'; c.shadowBlur = 18*s;
  c.strokeStyle = cre_holo(c, W/2, H/2, t, 1); c.lineWidth = 9*s; rr(c, x, y, w, h, R); c.stroke();
  c.shadowBlur = 0;
  // dark channel + engraved inner lines
  c.strokeStyle = 'rgba(12,8,30,0.85)'; c.lineWidth = 3*s; rr(c, x, y, w, h, R); c.stroke();
  c.strokeStyle = cre_holo(c, W/2, H/2, -t*1.3, 1); c.lineWidth = 1.2*s; rr(c, x, y, w, h, R); c.stroke();
  c.strokeStyle = 'rgba(255,216,74,0.9)'; c.lineWidth = 1.5*s; rr(c, x + 7*s, y + 7*s, w - 14*s, h - 14*s, Math.max(4, R - 6*s)); c.stroke();
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 1; rr(c, x - 4*s, y - 4*s, w + 8*s, h + 8*s, R + 4*s); c.stroke();
  // little triangle studs along the gold line
  c.fillStyle = 'rgba(255,230,140,0.9)';
  for (let k = 0; k < 28; k++) { const [px, py, nx, ny] = perim(k/28, x + 7*s, y + 7*s, w - 14*s, h - 14*s); cre_tri(c, px, py, 2.2*s, Math.atan2(ny, nx) + Math.PI/2); c.fill(); }
  // three comets (the three player colours) racing round the frame
  for (let q = 0; q < 3; q++) {
    const col = CRE_COLS[q];
    for (let k = 14; k >= 0; k--) {
      const u = t*0.16 + q/3 - k*0.0045, [px, py] = perim(u, x, y, w, h);
      c.globalAlpha = (1 - k/15)*0.9; c.fillStyle = k ? col : '#FFFFFF';
      c.beginPath(); c.arc(px, py, (k ? 3.2 - k*0.17 : 3.6)*s, 0, TAU); c.fill();
    }
    const [hx, hy] = perim(t*0.16 + q/3, x, y, w, h);
    c.globalAlpha = 1; c.shadowColor = col; c.shadowBlur = 16*s; c.fillStyle = '#FFFFFF'; star4(c, hx, hy, 6*s); c.shadowBlur = 0;
  }
  c.globalAlpha = 1;
  // lightning arcs that crawl along the edges now and then
  const tick = Math.floor(t*7), rnd = seeded(tick*7919 + 13);
  if (rnd() < 0.55) {
    const u0 = rnd(), len = 0.04 + rnd()*0.06, col = CRE_COLS[Math.floor(rnd()*3)];
    c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 10*s; c.lineWidth = 1.4*s; c.beginPath();
    for (let k = 0; k <= 10; k++) { const [px, py, nx, ny] = perim(u0 + len*k/10, x, y, w, h), j = (rnd() - 0.5)*9*s; k ? c.lineTo(px + nx*j, py + ny*j) : c.moveTo(px, py); }
    c.stroke(); c.shadowBlur = 0;
  }
  // corner crests: spinning prism triangles inside rune rings
  [[x + 14*s, y + 14*s], [x + w - 14*s, y + 14*s], [x + w - 14*s, y + h - 14*s], [x + 14*s, y + h - 14*s]].forEach(([cx, cy], k) => {
    c.save(); c.translate(cx, cy);
    c.fillStyle = 'rgba(12,8,30,0.9)'; c.beginPath(); c.arc(0, 0, 12*s, 0, TAU); c.fill();
    c.strokeStyle = cre_holo(c, 0, 0, t*2 + k, 1); c.lineWidth = 2*s; c.beginPath(); c.arc(0, 0, 12*s, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(255,216,74,0.8)'; c.lineWidth = 1; c.setLineDash([2*s, 3*s]); c.lineDashOffset = -t*12; c.beginPath(); c.arc(0, 0, 9*s, 0, TAU); c.stroke(); c.setLineDash([]);
    const rot = t*(k % 2 ? -1.2 : 1.2);
    c.shadowColor = CRE_COLS[k % 3]; c.shadowBlur = 10*s; c.fillStyle = cre_holo(c, 0, 0, -t*3, 1); cre_tri(c, 0, 0, 7*s, rot); c.fill();
    c.shadowBlur = 0; c.fillStyle = '#FFFFFF'; cre_tri(c, 0, 0, 2.6*s, rot + Math.PI); c.fill();
    c.restore();
  });
  // the crown plaque: CREATOR between two spinning prism crests, three player-colour gems on top
  { const cx = W/2, cy = y + 1*s;
    c.save(); c.translate(cx, cy);
    c.fillStyle = 'rgba(12,8,30,0.95)'; rr(c, -44*s, -6*s, 88*s, 15*s, 7*s); c.fill();
    c.shadowColor = '#FFFFFF'; c.shadowBlur = 8*s*(0.5 + 0.5*Math.sin(t*3));
    c.strokeStyle = cre_holo(c, 0, 0, t*1.5, 1); c.lineWidth = 1.6*s; rr(c, -44*s, -6*s, 88*s, 15*s, 7*s); c.stroke(); c.shadowBlur = 0;
    [-36, 36].forEach((dx, k) => { c.fillStyle = cre_holo(c, dx*s, 1.5*s, -t*3, 1); cre_tri(c, dx*s, 1.8*s, 5*s, t*(k ? -2 : 2)); c.fill(); });
    c.fillStyle = '#FFE58A'; c.font = '700 ' + (8*s) + 'px "Chakra Petch", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('CREATOR', 0, 1.8*s);
    c.restore(); }
  // bottom plaque
  { const cx = W/2, cy = y + h;
    c.save(); c.translate(cx, cy);
    c.fillStyle = 'rgba(12,8,30,0.95)'; rr(c, -46*s, -7*s, 92*s, 14*s, 7*s); c.fill();
    c.strokeStyle = 'rgba(255,216,74,0.9)'; c.lineWidth = 1.2*s; rr(c, -46*s, -7*s, 92*s, 14*s, 7*s); c.stroke();
    const tg = c.createLinearGradient(-40*s, 0, 40*s, 0), o = (t*0.35) % 1;
    tg.addColorStop(0, '#FFD84A'); tg.addColorStop(Math.max(0, o - 0.1), '#FFD84A'); tg.addColorStop(o, '#FFFFFF'); tg.addColorStop(Math.min(1, o + 0.1), '#FFD84A'); tg.addColorStop(1, '#FFD84A');
    c.fillStyle = tg; c.font = '700 ' + (7*s) + 'px "Chakra Petch", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('★ MADE TREPONG ★', 0, 0.5*s);
    c.restore(); }
  // orbiting sparkles
  for (let k = 0; k < 10; k++) {
    const [px, py, nx, ny] = perim(k/10 - t*0.05, x, y, w, h), off = (6 + 4*Math.sin(t*2 + k))*s, a = 0.5 + 0.5*Math.sin(t*5 + k*1.7);
    c.globalAlpha = a; c.fillStyle = k % 2 ? '#FFFFFF' : '#FFE58A'; star4(c, px - nx*off, py - ny*off, (2 + 2*a)*s);
  }
  c.restore(); c.globalAlpha = 1; c.shadowBlur = 0;
}

// The first rally: three paddles on a spinning neon triangle, passing the ball round forever.
function cre_rally(t) { const leg = 0.75, k = Math.floor(t/leg), f = (t/leg) - k; return { from: ((k % 3) + 3) % 3, to: ((k + 1) % 3 + 3) % 3, f }; }
function drawCreatorBg(c, t, W, H) {
  t = +t || 0; const s = cre_s(W, H);
  // deep space that slowly drifts through hues
  const hue = (t*6) % 360, g = c.createLinearGradient(0, 0, W*0.4, H);
  g.addColorStop(0, 'hsl(' + (250 + 20*Math.sin(t*0.2)) + ',70%,8%)'); g.addColorStop(0.55, 'hsl(' + (285 + 25*Math.sin(t*0.15)) + ',75%,12%)'); g.addColorStop(1, 'hsl(' + (215 + 20*Math.sin(t*0.25)) + ',80%,10%)');
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  // nebula clouds
  [[0.2, 0.25, '255,79,139'], [0.85, 0.35, '62,230,255'], [0.5, 0.85, '181,124,255'], [0.1, 0.8, '255,178,62']].forEach(([fx, fy, rgb], k) => {
    const cx = W*fx + Math.sin(t*0.3 + k*2)*W*0.06, cy = H*fy + Math.cos(t*0.25 + k)*H*0.04, r = Math.max(W, H)*(0.42 + 0.06*Math.sin(t*0.5 + k));
    const ng = c.createRadialGradient(cx, cy, 0, cx, cy, r); ng.addColorStop(0, 'rgba(' + rgb + ',0.32)'); ng.addColorStop(1, 'rgba(' + rgb + ',0)'); c.fillStyle = ng; c.fillRect(0, 0, W, H);
  });
  // blueprint grid in perspective: the creator's drafting table
  c.save(); c.strokeStyle = 'rgba(62,230,255,0.12)'; c.lineWidth = 1;
  const hz = H*0.55;
  for (let k = -10; k <= 10; k++) { c.beginPath(); c.moveTo(W/2 + k*W*0.04, hz); c.lineTo(W/2 + k*W*0.22, H); c.stroke(); }
  const off = (t*0.25) % 1;
  for (let k = 0; k < 9; k++) { const p = Math.pow((k + off)/9, 2), yy = hz + p*(H - hz); c.globalAlpha = 0.25 + p*0.75; c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); }
  c.restore();
  // twinkling stars + a shooting star every few seconds
  for (let k = 0; k < 90; k++) { const sx = (k*97.31) % W, sy = (k*53.77) % (H*0.9), a = 0.25 + 0.75*Math.abs(Math.sin(t*(0.8 + (k % 7)*0.3) + k)); c.fillStyle = 'rgba(255,255,255,' + a.toFixed(3) + ')'; c.fillRect(sx, sy, k % 9 ? 1.2*s : 2.2*s, k % 9 ? 1.2*s : 2.2*s); }
  { const per = 4.5, k = Math.floor(t/per), f = (t % per)/0.9;
    if (f < 1) { const r = seeded(k*31 + 7), sx = W*(0.1 + r()*0.6), sy = H*(0.05 + r()*0.25), dx = W*0.45, dy = H*0.18;
      const hx = sx + dx*f, hy = sy + dy*f, lg = c.createLinearGradient(hx - dx*0.3, hy - dy*0.3, hx, hy); lg.addColorStop(0, 'rgba(255,255,255,0)'); lg.addColorStop(1, 'rgba(255,255,255,' + (1 - f) + ')');
      c.strokeStyle = lg; c.lineWidth = 2*s; c.beginPath(); c.moveTo(hx - dx*0.3, hy - dy*0.3); c.lineTo(hx, hy); c.stroke(); } }
  cre_arena(c, t, W, H, s);
}
function cre_arena(c, t, W, H, s) {
  // the arena
  const cx = W/2, cy = H*0.6, R = Math.min(W, H)*0.36, rot = t*0.12;
  const V = [0, 1, 2].map(k => [cx + Math.cos(rot + k*TAU/3 - Math.PI/2)*R, cy + Math.sin(rot + k*TAU/3 - Math.PI/2)*R]);
  const rally = cre_rally(t);
  // shockwave rings each time the ball is hit
  for (let q = 0; q < 3; q++) {
    const age = rally.f*0.75 + q*0.75; if (age > 2.2) continue;
    c.strokeStyle = 'rgba(255,255,255,' + (0.35*(1 - age/2.2)) + ')'; c.lineWidth = 1.5*s; cre_tri(c, cx, cy, R*(1 + age*0.5), rot); c.stroke();
  }
  c.save(); c.shadowColor = '#B57CFF'; c.shadowBlur = 22*s;
  c.strokeStyle = cre_holo(c, cx, cy, t, 1); c.lineWidth = 3*s; poly(c, V); c.stroke();
  c.shadowBlur = 0; c.fillStyle = 'rgba(181,124,255,0.07)'; poly(c, V); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 1; cre_tri(c, cx, cy, R*0.55, rot + Math.PI); c.stroke();
  c.restore();
  // paddle on each wall (midpoint of the side opposite each vertex), sliding toward the ball
  const side = k => { const a = V[(k + 1) % 3], b = V[(k + 2) % 3]; return [a, b]; };
  const padPos = (k, u) => { const [a, b] = side(k); return [a[0] + (b[0] - a[0])*u, a[1] + (b[1] - a[1])*u]; };
  const hitU = n => 0.3 + 0.4*seeded(n*977 + 3)();
  const n0 = Math.floor(t/0.75), from = padPos(rally.from, hitU(n0)), to = padPos(rally.to, hitU(n0 + 1));
  const ball = f => [from[0] + (to[0] - from[0])*f, from[1] + (to[1] - from[1])*f];
  for (let k = 0; k < 3; k++) {
    const [a, b] = side(k), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    let u = 0.5; if (k === rally.to) u = 0.5 + (hitU(n0 + 1) - 0.5)*Math.min(1, rally.f*1.6); else if (k === rally.from) u = hitU(n0) + (0.5 - hitU(n0))*Math.min(1, rally.f*1.4);
    const [px, py] = padPos(k, u), nx = cx - px, ny = cy - py, nl = Math.hypot(nx, ny) || 1;
    c.save(); c.translate(px + nx/nl*4*s, py + ny/nl*4*s); c.rotate(ang);
    c.shadowColor = CRE_COLS[k]; c.shadowBlur = 14*s; c.fillStyle = CRE_COLS[k]; rr(c, -14*s, -3*s, 28*s, 6*s, 3*s); c.fill();
    c.shadowBlur = 0; c.fillStyle = 'rgba(255,255,255,0.7)'; rr(c, -10*s, -1.5*s, 20*s, 2*s, 1*s); c.fill(); c.restore();
  }
  // ball + trail in the colour of whoever hit it
  const col = CRE_COLS[rally.from];
  for (let k = 12; k >= 1; k--) { const f = rally.f - k*0.03; if (f < 0) continue; const [bx, by] = ball(f); c.globalAlpha = (1 - k/13)*0.7; c.fillStyle = col; c.beginPath(); c.arc(bx, by, (4.5 - k*0.25)*s, 0, TAU); c.fill(); }
  c.globalAlpha = 1; const [bx, by] = ball(rally.f);
  c.shadowColor = col; c.shadowBlur = 16*s; c.fillStyle = '#FFFFFF'; c.beginPath(); c.arc(bx, by, 4.5*s, 0, TAU); c.fill(); c.shadowBlur = 0;
  // hit flash
  if (rally.f < 0.18) { const a = 1 - rally.f/0.18; c.globalAlpha = a; c.fillStyle = CRE_COLS[rally.from]; for (let k = 0; k < 8; k++) { const an = k*TAU/8 + n0, d = (6 + 18*(1 - a))*s; c.fillRect(from[0] + Math.cos(an)*d, from[1] + Math.sin(an)*d, 2*s, 2*s); } c.globalAlpha = 1; }
}
let cre_off = null;
function drawCreatorOverlay(c, t, W, H) {
  t = +t || 0; const s = cre_s(W, H);
  c.save();
  try { // the rally keeps going faintly over the dark lower half of the card
    if (!cre_off) cre_off = document.createElement('canvas');
    const sc = 2; if (cre_off.width !== W*sc) { cre_off.width = W*sc; cre_off.height = H*sc; }
    const o = cre_off.getContext('2d'); o.setTransform(sc, 0, 0, sc, 0, 0); o.clearRect(0, 0, W, H); cre_arena(o, t, W, H, s);
    c.globalAlpha = 0.42; c.drawImage(cre_off, 0, 0, W, H); c.globalAlpha = 1;
  } catch (e) {}
  // embers rising through the lower half
  for (let k = 0; k < 26; k++) {
    const sp = 18 + (k % 5)*7, yy = H - ((t*sp + k*61.3) % (H*0.62)), xx = (k*47.9 + Math.sin(t*0.9 + k)*10) % W, a = Math.min(1, (H - yy)/(H*0.2))*(1 - (H - yy)/(H*0.62));
    c.globalAlpha = Math.max(0, a)*0.8; c.fillStyle = CRE_COLS[k % 3]; c.fillRect(xx, yy, 1.8*s, 1.8*s);
  }
  // holographic sweep across the whole card every 5 s
  const per = 5, f = (t % per)/1.2;
  if (f < 1) {
    const bx = -W*0.5 + f*W*2, g = c.createLinearGradient(bx - 40*s, 0, bx + 40*s, 0);
    g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.45, 'rgba(62,230,255,0.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0.22)'); g.addColorStop(0.55, 'rgba(255,79,139,0.10)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.globalAlpha = 1; c.fillStyle = g; c.save(); c.translate(bx, H/2); c.transform(1, 0, -0.35, 1, 0, 0); c.translate(-bx, -H/2); c.fillRect(bx - 40*s, 0, 80*s, H); c.restore();
  }
  c.restore(); c.globalAlpha = 1;
}
function drawCandyCorn(c, x, y, r) { // event emblem: a candy-corn triangle (it's a triangle game after all)
  c.save(); c.translate(x, y);
  const T = [[0, -r], [r*0.9, r*0.85], [-r*0.9, r*0.85]];
  c.save(); poly(c, T); c.clip();
  c.fillStyle = '#FFD12A'; c.fillRect(-r, r*0.25, 2*r, r);
  c.fillStyle = '#FF8A1E'; c.fillRect(-r, -r*0.3, 2*r, r*0.56);
  c.fillStyle = '#FFF4DA'; c.fillRect(-r, -r*1.1, 2*r, r*0.81);
  c.fillStyle = 'rgba(255,255,255,0.5)'; c.beginPath(); c.ellipse(-r*0.22, r*0.05, r*0.09, r*0.4, 0.45, 0, TAU); c.fill();
  c.restore();
  c.strokeStyle = 'rgba(90,40,0,0.55)'; c.lineWidth = Math.max(1, r*0.08); c.lineJoin = 'round'; poly(c, T); c.stroke();
  c.restore();
}

