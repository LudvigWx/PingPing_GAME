// ===================== forester profile card set (gift, only from a redeem code) =====================
// Border: Heartwood frame · Background: Old-growth forest · Title: Skogsmästare · Emblem: The Forester
PROF.pb.push(['heartwood', 'Heartwood frame', 'm', 'gift', 1]);
PROF.pg.push(['oldgrowth', 'Old-growth forest', 'm', 'gift', 1]);
PROF.pt.push(['skogsmastare', 'Skogsmästare', 'm', 'gift']);
PROF.pe.push(['forester', 'The Forester', 'm', 'gift']);
Object.assign(GIFT_SRC, { 'pb:heartwood': 1, 'pg:oldgrowth': 1, 'pt:skogsmastare': 1, 'pe:forester': 1 });

// ---------------------------------------------------------------- emblem: the forester herself, side view, axe on her shoulder, a stump in front
function fr_emblem(c, x, y, r) {
  const t = clock, bob = Math.sin(t*2.2)*0.18;
  c.save(); c.translate(x, y); c.scale(r/10, r/10); c.lineJoin = 'round'; c.lineCap = 'round';
  // soft light behind her so she reads on a dark card
  c.fillStyle = lx_rg(c, 0, 1, 0.5, 11, ['rgba(140,220,150,0.28)', 'rgba(140,220,150,0)']); c.beginPath(); c.arc(0, 1, 11, 0, TAU); c.fill();
  // ground + grass
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(1.5, 9.6, 8.5, 1.1, 0, 0, TAU); c.fill();
  c.strokeStyle = '#4FA05A'; c.lineWidth = 0.35; for (const gx of [-6.5, -5.8, 3.4, 9.2, 9.8]) { c.beginPath(); c.moveTo(gx, 9.6); c.lineTo(gx - 0.4, 8.4); c.moveTo(gx, 9.6); c.lineTo(gx + 0.5, 8.6); c.stroke(); }
  // the stump in front of her, with a little mushroom and a sprout
  c.fillStyle = lx_lg(c, 4.4, 0, 9.2, 0, ['#5A3216', '#8A5428', '#4A2810']); c.beginPath(); c.moveTo(4.4, 6.9); c.lineTo(4.2, 9.6); c.quadraticCurveTo(6.8, 10.3, 9.4, 9.6); c.lineTo(9.2, 6.9); c.closePath(); c.fill();
  c.fillStyle = '#E8C08A'; c.beginPath(); c.ellipse(6.8, 6.9, 2.4, 0.8, 0, 0, TAU); c.fill();
  c.strokeStyle = '#B07A44'; c.lineWidth = 0.18; c.beginPath(); c.ellipse(6.8, 6.9, 1.5, 0.48, 0, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(6.8, 6.9, 0.7, 0.22, 0, 0, TAU); c.stroke();
  c.strokeStyle = 'rgba(30,14,4,0.5)'; c.lineWidth = 0.2; c.beginPath(); c.moveTo(5.4, 7.6); c.lineTo(5.5, 9.4); c.moveTo(7.9, 7.6); c.lineTo(8, 9.5); c.stroke();
  c.fillStyle = '#F2E6D0'; c.fillRect(8.85, 8.4, 0.4, 0.9); c.fillStyle = '#D8453A'; c.beginPath(); c.ellipse(9.05, 8.4, 0.8, 0.5, 0, Math.PI, 0); c.fill(); c.fillStyle = '#FFF'; c.beginPath(); c.arc(8.8, 8.15, 0.12, 0, TAU); c.arc(9.3, 8.2, 0.1, 0, TAU); c.fill();
  c.strokeStyle = '#5FBF5A'; c.lineWidth = 0.25; c.beginPath(); c.moveTo(6.2, 6.8); c.quadraticCurveTo(6, 5.8, 5.4, 5.6); c.moveTo(6.2, 6.8); c.quadraticCurveTo(6.6, 5.9, 7.2, 5.9); c.stroke();
  c.save(); c.translate(-1.2, bob);
  // braid behind her back
  c.fillStyle = '#7A4220'; for (let k = 0; k < 5; k++) { c.beginPath(); c.ellipse(-1.9 - k*0.12, -4.6 + k*1.05, 0.62, 0.55, 0.3, 0, TAU); c.fill(); }
  c.fillStyle = '#E2B84A'; c.beginPath(); c.arc(-2.4, 0.8, 0.32, 0, TAU); c.fill();
  // legs (one step forward) and boots
  c.fillStyle = '#2E4A2A';
  c.beginPath(); c.moveTo(-1.6, 3.6); c.lineTo(-2.6, 8.4); c.lineTo(-1.2, 8.4); c.lineTo(-0.2, 3.6); c.closePath(); c.fill();
  c.beginPath(); c.moveTo(-0.6, 3.6); c.lineTo(1.4, 8.3); c.lineTo(2.7, 8.1); c.lineTo(0.9, 3.6); c.closePath(); c.fill();
  c.fillStyle = '#3A2010'; rr(c, -3.1, 8.2, 2.4, 1.3, 0.4); c.fill(); rr(c, 1.1, 8, 2.6, 1.3, 0.4); c.fill();
  c.fillStyle = 'rgba(255,220,170,0.35)'; c.fillRect(-2.9, 8.3, 1.8, 0.25); c.fillRect(1.3, 8.1, 2, 0.25);
  // red flannel jacket
  c.fillStyle = lx_lg(c, -2, -2, 1.6, 4, ['#E0503E', '#9A2620']); c.beginPath(); c.moveTo(-2.1, -2.2); c.quadraticCurveTo(-2.7, 1.2, -2.2, 4.1); c.lineTo(1.5, 4.1); c.quadraticCurveTo(1.9, 1, 1.2, -2.2); c.closePath(); c.fill();
  c.save(); c.clip(); c.strokeStyle = 'rgba(40,10,10,0.45)'; c.lineWidth = 0.28; for (let k = -3; k <= 2; k += 1.1) { c.beginPath(); c.moveTo(k, -3); c.lineTo(k, 5); c.stroke(); } for (let k = -2; k <= 4; k += 1.1) { c.beginPath(); c.moveTo(-3, k); c.lineTo(2, k); c.stroke(); } c.restore();
  c.fillStyle = '#5A3216'; c.fillRect(-2.4, 2.4, 3.9, 0.55); c.fillStyle = '#E2B84A'; c.fillRect(0.6, 2.35, 0.6, 0.65);
  // the axe on her shoulder: handle from her hand in front, over the shoulder, head behind her
  c.strokeStyle = lx_lg(c, 2.6, 1, -6, -6, ['#6A3A16', '#C08A50']); c.lineWidth = 0.6; c.beginPath(); c.moveTo(2.7, 0.6); c.lineTo(-5.4, -6.6); c.stroke();
  c.save(); c.translate(-5.2, -6.4); c.rotate(-0.72);
  c.fillStyle = lx_lg(c, -1.5, -2.6, 1.5, 0.8, ['#F4F8FF', '#B8C4D4', '#6A7688']); c.beginPath(); c.moveTo(-0.5, -0.6); c.lineTo(-1.6, -2.4); c.quadraticCurveTo(0, -3.3, 1.6, -2.4); c.lineTo(0.5, -0.6); c.closePath(); c.fill();
  c.fillStyle = '#3A3F4A'; rr(c, -0.65, -0.9, 1.3, 1.5, 0.25); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = 0.18; c.beginPath(); c.moveTo(-1.4, -2.5); c.quadraticCurveTo(0, -3.1, 1.4, -2.5); c.stroke();
  const g = (t % 3)/3; if (g < 0.18) { c.save(); c.globalAlpha = Math.sin(g/0.18*Math.PI); c.fillStyle = '#FFFFFF'; star4(c, 1.2, -2.8, 1.4); c.restore(); }
  c.restore();
  // arm reaching up to hold the handle
  c.strokeStyle = '#B83428'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(0.4, -1.4); c.quadraticCurveTo(1.6, 0.6, 2.4, 0.5); c.stroke();
  c.fillStyle = '#F2C49A'; c.beginPath(); c.arc(2.6, 0.5, 0.55, 0, TAU); c.fill();
  // head in profile, facing right towards the stump
  c.fillStyle = '#F2C49A'; c.fillRect(-0.5, -3.2, 1, 1.2);
  c.fillStyle = lx_rg(c, 0.4, -5.2, 0.2, 2.4, ['#FFDDB8', '#F2C49A', '#D9A07A']); c.beginPath(); c.moveTo(-1.6, -5.2); c.quadraticCurveTo(-1.5, -7.2, 0.2, -7.1); c.quadraticCurveTo(1.8, -7, 1.9, -5.6); c.lineTo(2.5, -4.8); c.lineTo(1.9, -4.5); c.quadraticCurveTo(1.8, -3.2, 0.4, -3.1); c.quadraticCurveTo(-1.5, -3.2, -1.6, -5.2); c.fill();
  c.fillStyle = '#7A4220'; c.beginPath(); c.moveTo(-1.7, -4.6); c.quadraticCurveTo(-2, -6.8, -0.2, -7.1); c.lineTo(0.4, -6); c.quadraticCurveTo(-0.6, -5.6, -0.7, -4.2); c.closePath(); c.fill();
  c.fillStyle = '#2A160A'; c.beginPath(); c.ellipse(1.15, -5.45, 0.2, 0.28, 0, 0, TAU); c.fill();
  c.strokeStyle = '#8A3A2A'; c.lineWidth = 0.2; c.beginPath(); c.moveTo(1.2, -4); c.quadraticCurveTo(1.6, -3.8, 1.85, -4.1); c.stroke();
  c.fillStyle = 'rgba(230,110,110,0.4)'; c.beginPath(); c.arc(0.7, -4.5, 0.4, 0, TAU); c.fill();
  // green beanie with the pom-pom bouncing at the back
  c.fillStyle = lx_lg(c, 0, -9, 0, -6, ['#4FA05A', '#2A6A36']); c.beginPath(); c.moveTo(-1.8, -6.1); c.quadraticCurveTo(-1.6, -8.9, 0.6, -8.7); c.quadraticCurveTo(2.2, -8.4, 2.1, -6.1); c.closePath(); c.fill();
  c.fillStyle = '#1F5A2C'; rr(c, -2, -6.5, 4.2, 0.8, 0.35); c.fill();
  c.fillStyle = '#EDE6D6'; c.beginPath(); c.arc(-1.4 + Math.sin(t*4.4)*0.15, -8.6 + Math.cos(t*4.4)*0.12, 0.75, 0, TAU); c.fill();
  c.restore();
  // a leaf drifting past
  const u = (t*0.18) % 1; c.save(); c.globalAlpha = Math.sin(u*Math.PI); c.translate(-8 + u*16, -8 + u*14 + Math.sin(t*2)*0.8); c.rotate(t*2); c.scale(0.9, 0.9*Math.max(0.3, Math.abs(Math.cos(t*3)))); fg_leaf(c, 1, '#E8742A', false); c.restore();
  c.restore();
}

// ---------------------------------------------------------------- border: carved heartwood with gold inlay, pinecones and fireflies
function fr_border(c, t, W, H) {
  const p = 5, x = p, y = p, w = W - p*2, h = H - p*2, R = 20, pulse = 0.5 + 0.5*Math.sin(t*1.4);
  c.save();
  c.shadowColor = 'rgba(0,0,0,0.6)'; c.shadowBlur = 8;
  c.strokeStyle = lx_lg(c, 0, 0, W, H, ['#2A160A', '#4A2A14', '#24130A', '#5A3418', '#2A160A']); c.lineWidth = 12; rr(c, x, y, w, h, R); c.stroke();
  c.restore();
  // wood grain
  c.save(); c.strokeStyle = 'rgba(10,4,0,0.55)'; c.lineWidth = 0.8;
  const N = 140; c.beginPath();
  for (let k = 0; k <= N; k++) { const [px, py, nx, ny] = cos_rrp(k/N, x, y, w, h, R), o = Math.sin(k*0.9)*2.2; k ? c.lineTo(px + nx*o, py + ny*o) : c.moveTo(px + nx*o, py + ny*o); } c.stroke();
  c.strokeStyle = 'rgba(200,150,100,0.14)'; c.beginPath();
  for (let k = 0; k <= N; k++) { const [px, py, nx, ny] = cos_rrp(k/N, x, y, w, h, R), o = -3 + Math.sin(k*1.3 + 1)*1.2; k ? c.lineTo(px + nx*o, py + ny*o) : c.moveTo(px + nx*o, py + ny*o); } c.stroke();
  c.restore();
  // old bronze inlay
  c.save(); c.strokeStyle = lx_lg(c, 0, 0, W, H, ['#B08A4A', '#6A4A1A', '#A07A3A', '#4A320E']); c.lineWidth = 1.3; rr(c, x + 7.5, y + 7.5, w - 15, h - 15, R - 6); c.stroke(); c.restore();
  // moss and pine needles along the sides
  c.save(); c.strokeStyle = '#2E6A38'; c.lineWidth = 1; c.lineCap = 'round';
  for (let k = 0; k < 26; k++) {
    if (W < 290 && k % 2) continue;
    const u = k/26 + 0.012, [px, py, nx, ny] = cos_rrp(u, x, y, w, h, R), tx = -ny, ty = nx;
    for (const s2 of [-1, 1]) { c.beginPath(); c.moveTo(px, py); c.lineTo(px + (tx*0.6 + nx*s2*0.9)*5, py + (ty*0.6 + ny*s2*0.9)*5); c.stroke(); }
  }
  c.restore();
  // leaves hanging down from the top edge on thin vines, swaying a little
  const strands = W < 290 ? [0.14, 0.32, 0.68, 0.86] : [0.08, 0.17, 0.27, 0.38, 0.62, 0.73, 0.83, 0.92];
  strands.forEach((fx, i) => {
    const sx = x + w*fx, sy = y + 4, len = (W < 290 ? 16 : 26) + lx_h(i + 3)*(W < 290 ? 12 : 30), sw = Math.sin(t*1.1 + i*1.3)*3;
    c.save(); c.strokeStyle = '#3A5A2A'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(sx, sy); c.quadraticCurveTo(sx + sw*0.4, sy + len*0.5, sx + sw, sy + len); c.stroke();
    const n = Math.max(2, Math.round(len/8));
    for (let k = 1; k <= n; k++) {
      const f = k/n, lx = sx + sw*f*f, ly = sy + len*f, side = k % 2 ? 1 : -1;
      c.save(); c.translate(lx, ly); c.rotate(side*0.9 + Math.PI/2 + Math.sin(t*1.6 + i + k)*0.15); c.translate(3.2, 0); c.scale(3.4, 3.4);
      fg_leaf(c, 1, ['#2F7A3E', '#3E8E4E', '#6A8A2A', '#B0702A', '#8A3A1A'][(i + k) % 5], true); c.restore();
    }
    c.restore();
  });
  // pinecone ornaments in the corners
  [[x + 9, y + 9, -0.6], [x + w - 9, y + 9, 0.6], [x + w - 9, y + h - 9, 2.5], [x + 9, y + h - 9, -2.5]].forEach(([px, py, a]) => { c.save(); c.translate(px, py); c.scale(6.5, 6.5); fg_cone(c, 1, a); c.restore(); });
  // a dark medallion at the top with a faintly glowing pine
  c.save(); c.translate(W/2, y + 1);
  c.fillStyle = lx_lg(c, -12, -12, 12, 12, ['#B08A4A', '#6A4A1A', '#4A320E']); c.beginPath(); c.arc(0, 0, 11, 0, TAU); c.fill();
  c.fillStyle = '#10261A'; c.beginPath(); c.arc(0, 0, 9, 0, TAU); c.fill();
  c.shadowColor = 'rgba(140,230,150,0.6)'; c.shadowBlur = 3 + 3*pulse; c.fillStyle = '#4F9A4A'; c.beginPath(); c.moveTo(0, -6.5); c.lineTo(4.8, 4); c.lineTo(-4.8, 4); c.closePath(); c.fill();
  c.shadowBlur = 0; c.fillStyle = '#8A5428'; c.fillRect(-0.9, 4, 1.8, 2.5);
  c.restore();
  // just a few dim fireflies
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 4; k++) {
    const u = (t*0.025 + k/4) % 1, [px, py, nx, ny] = cos_rrp(u, x, y, w, h, R), o = 8 + Math.sin(t*2 + k)*4, on = Math.max(0, Math.sin(t*1.8 + k*2.1));
    const fx = px + nx*o, fy = py + ny*o;
    c.globalAlpha = on*0.55; c.fillStyle = lx_rg(c, fx, fy, 0, 4, ['rgba(220,255,140,0.8)', 'rgba(190,255,110,0)']); c.beginPath(); c.arc(fx, fy, 4, 0, TAU); c.fill();
  }
  c.restore();
}

// ---------------------------------------------------------------- background: the forest arena's golden-hour forest, alive
const frBgCache = {};
function fr_bg(c, t, W, H) {
  const key = W + 'x' + H; if (!frBgCache[key]) frBgCache[key] = fg_buildBg(W, H);
  c.drawImage(frBgCache[key], 0, 0, W, H);
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 3; k++) {
    const x0 = W*(0.3 + k*0.2) + Math.sin(t*0.3 + k)*W*0.04;
    c.globalAlpha = 0.1 + 0.05*Math.sin(t*0.8 + k*2);
    c.fillStyle = lx_lg(c, 0, 0, 0, H, ['rgba(255,230,160,1)', 'rgba(255,220,150,0)']);
    c.beginPath(); c.moveTo(x0 - W*0.03, 0); c.lineTo(x0 + W*0.03, 0); c.lineTo(x0 + W*0.16, H); c.lineTo(x0 - W*0.08, H); c.closePath(); c.fill();
  }
  for (let k = 0; k < 14; k++) {
    const fx = W*lx_h(k + 3) + Math.sin(t*0.6 + k)*10, fy = H*(0.25 + lx_h(k + 11)*0.7) + Math.cos(t*0.8 + k)*8, on = Math.max(0, Math.sin(t*1.7 + k*2.3));
    c.globalAlpha = on; c.fillStyle = lx_rg(c, fx, fy, 0, 6, ['rgba(220,255,140,0.9)', 'rgba(190,255,110,0)']); c.beginPath(); c.arc(fx, fy, 6, 0, TAU); c.fill();
  }
  c.restore();
  for (let k = 0; k < 6; k++) {
    const u = (t*0.07 + lx_h(k + 30)) % 1, lx = W*lx_h(k + 40) + Math.sin(t + k)*20, ly = -10 + u*(H + 20);
    c.save(); c.globalAlpha = 0.8*Math.sin(u*Math.PI); c.translate(lx, ly); c.rotate(t*1.4 + k); c.scale(5, 5*Math.max(0.25, Math.abs(Math.cos(t*2 + k)))); fg_leaf(c, 1, FG_LEAF_COLS[k % 6], false); c.restore();
  }
}
// title colour: gold melting into forest green, with a soft glow
function fr_titleFill(c, x, t) { const o = (t*0.25) % 1, g = c.createLinearGradient(x - 90 + o*60, 0, x + 90 + o*60, 0); g.addColorStop(0, '#FFE7A0'); g.addColorStop(0.35, '#B8F2A8'); g.addColorStop(0.65, '#FFE7A0'); g.addColorStop(1, '#9FE6A0'); return g; }
