// ---------- victory effects ----------
let vicFx = null, vicPreview = null, vparts = [];
// ----- slow-motion replay of the deciding goal -----
let rec = [], lastGoalPos = [0, 0];
function recordFrame() {
  if (!st || st.ph !== 'pl' || replay) return;
  rec.push({ b: st.balls.map(b => [b.x, b.y, b.sx]), p: st.pads.slice(), al: st.alive.slice(), last: st.last, lv: st.lives.slice() });
  if (rec.length > 110) rec.shift();
}
function beginReplayThen(done) {
  overShown = true;
  const frames = rec.slice(-80);
  rec = [];
  if (frames.length < 10) { done(); return; }
  replay = { frames, i: 0, done, focus: lastGoalPos.slice() };
  tone(98, 1.2, 'sawtooth', 0.05, 0.5);
}
function endReplay() { if (!replay) return; const d = replay.done; replay = null; trails = new Map(); d(); }
function replayView(g) {
  const f = replay.frames[Math.min(replay.frames.length - 1, Math.floor(replay.i))];
  const balls = f.b.map((q, k) => ({ id: 9000 + k, x: q[0], y: q[1], vx: 0, vy: 0, sx: q[2] }));
  trails = new Map();
  for (let k = 0; k < balls.length; k++) {
    const tr = []; for (let j = Math.max(0, Math.floor(replay.i) - 12); j <= Math.floor(replay.i); j++) { const fr = replay.frames[j]; if (fr && fr.b[k]) tr.push([fr.b[k][0], fr.b[k][1]]); }
    trails.set(9000 + k, tr);
  }
  return { ...g, balls, pads: f.p, alive: f.al, lives: f.lv, last: f.last, ph: 'pl', items: [], banner: null };
}
function drawReplayOverlay() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const bar = Math.min(70, H*0.08);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = '18px "Rubik Mono One", monospace'; ctx.fillStyle = Math.sin(clock*6) > 0 ? '#FF2244' : '#F0ECFF';
  ctx.fillText('● REPLAY', 16, H - bar/2);
  ctx.textAlign = 'right'; ctx.font = '700 12px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#A49CD0';
  ctx.fillText('Tap to skip', W - 16, H - bar/2);
}
function startVictory(type) { vicFx = { type: VICTORY.some(v => v[0] === type) ? type : 'confetti', t: 0 }; vparts = []; if (type === 'chickens') [0, 0.3, 0.7].forEach(d => tone(700, 0.08, 'square', 0.05, 1.4, d)); }
function drawVictory(dt) {
  if (vicFx) {
    vicFx.t += dt; const T = vicFx.type, t = vicFx.t;
    if (t > 4.5) { vicFx = null; vparts = []; }
    else {
      if (T === 'confetti' && t < 3) for (let k = 0; k < 4; k++) vparts.push({ x: Math.random()*W, y: -10, vx: (Math.random() - 0.5)*60, vy: 80 + Math.random()*120, r: Math.random()*6, col: 'hsl(' + Math.floor(Math.random()*360) + ',90%,62%)', kind: 'rect' });
      if (T === 'fireworks' && Math.random() < dt*2.5 && t < 3.5) { const x = W*(0.15 + Math.random()*0.7), y = H*(0.12 + Math.random()*0.35), hue = Math.floor(Math.random()*360); for (let k = 0; k < 40; k++) { const a = Math.random()*TAU, sp = 60 + Math.random()*160; vparts.push({ x, y, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, g: 90, col: 'hsl(' + hue + ',95%,65%)', kind: 'dot', life: 1.4 }); } tone(200 + Math.random()*300, 0.25, 'sawtooth', 0.04, 0.3); }
      if (T === 'chickens' && t < 3.2 && Math.random() < dt*10) vparts.push({ x: Math.random()*W, y: -30, vx: (Math.random() - 0.5)*40, vy: 120 + Math.random()*140, r: Math.random()*6, kind: 'emoji', e: Math.random() < 0.85 ? '🐔' : '🥚', s: 22 + Math.random()*16 });
      if (T === 'champion' && t < 3.5) { for (let k = 0; k < 3; k++) vparts.push({ x: Math.random()*W, y: -10, vx: 0, vy: 140 + Math.random()*120, r: 0, col: Math.random() < 0.5 ? '#FFD84A' : '#FFF6B0', kind: 'star' }); }
      if (T === 'blackhole' && t < 3.5) for (let k = 0; k < 3; k++) { const a = Math.random()*TAU, R = Math.max(W, H)*0.6; vparts.push({ a, R, kind: 'spiral', col: 'hsl(' + (20 + Math.random()*40) + ',95%,60%)' }); }
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      vic2(T, t, dt);
      vic4(T, t, dt);
      if (T === 'disco') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let k = 0; k < 6; k++) { const a = t*1.5 + k*TAU/6; ctx.fillStyle = 'hsla(' + (k*60 + t*90) % 360 + ',90%,60%,0.13)'; ctx.beginPath(); ctx.moveTo(W/2, 40); ctx.lineTo(W/2 + Math.cos(a)*H*1.4 - 60, 40 + Math.sin(a)*H*1.4); ctx.lineTo(W/2 + Math.cos(a)*H*1.4 + 60, 40 + Math.sin(a)*H*1.4); ctx.closePath(); ctx.fill(); } ctx.restore(); ctx.font = '40px system-ui'; ctx.textAlign = 'center'; ctx.fillText('🪩', W/2, 54); }
      if (T === 'champion') { ctx.save(); ctx.globalAlpha = Math.min(1, t) * Math.max(0, 1 - (t - 3.5)); ctx.translate(W/2, H*0.16); ctx.rotate(t*0.3); ctx.fillStyle = 'rgba(255,216,74,0.12)'; for (let k = 0; k < 12; k++) { ctx.rotate(TAU/12); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-30, -H); ctx.lineTo(30, -H); ctx.fill(); } ctx.restore(); ctx.font = '54px system-ui'; ctx.textAlign = 'center'; ctx.fillText('👑', W/2, H*0.16 + 18); }
      const keep = [];
      for (const p of vparts) {
        if (p.kind === 'spiral') { p.R *= 1 - dt*1.4; p.a += dt*(3 + 200/(p.R + 20)); if (p.R > 6) keep.push(p); ctx.fillStyle = p.col; ctx.fillRect(W/2 + Math.cos(p.a)*p.R, H*0.45 + Math.sin(p.a)*p.R, 3, 3); continue; }
        p.x += p.vx*dt; p.y += p.vy*dt; if (p.g) p.vy += p.g*dt; if (p.life != null) p.life -= dt;
        if (p.y > H + 40 || (p.life != null && p.life <= 0)) continue; keep.push(p);
        if (p.kind === 'rect') { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r + t*5); ctx.fillStyle = p.col; ctx.fillRect(-4, -2, 8, 4); ctx.restore(); }
        else if (p.kind === 'dot') { ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.col; ctx.fillRect(p.x - 1.5, p.y - 1.5, 3, 3); ctx.globalAlpha = 1; }
        else if (p.kind === 'emoji') { ctx.font = Math.round(p.s) + 'px system-ui'; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(Math.sin(t*6 + p.r)*0.4); ctx.textAlign = 'center'; ctx.fillText(p.e, 0, 0); ctx.restore(); }
        else if (p.kind === 'star') { ctx.fillStyle = p.col; star4(ctx, p.x, p.y, 5); }
        else if (!vpart4(p, t)) vpart2(p, t);
      }
      vparts = keep;
    }
  }
}
function drawVictoryChip(cvs, id) {
  const c = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h); c.textAlign = 'center'; c.textBaseline = 'middle';
  if (drawVictoryChip4(c, id, w, h) || drawVictoryChip2(c, id, w, h)) return;
  if (id === 'confetti') for (let k = 0; k < 14; k++) { c.fillStyle = 'hsl(' + (k*47 % 360) + ',90%,62%)'; c.save(); c.translate(8 + (k*29 % 72), 8 + ((k*17 + clock*30) % 44)); c.rotate(k + clock*3); c.fillRect(-3, -1.5, 6, 3); c.restore(); }
  if (id === 'fireworks') { [[28, 22, '#FF4F8B'], [58, 30, '#3EE6FF']].forEach(([x, y, col]) => { c.strokeStyle = col; c.lineWidth = 1.5; for (let k = 0; k < 10; k++) { const a = k/10*TAU; c.beginPath(); c.moveTo(x + Math.cos(a)*4, y + Math.sin(a)*4); c.lineTo(x + Math.cos(a)*12, y + Math.sin(a)*12); c.stroke(); } }); }
  if (id === 'disco') { c.font = '30px system-ui'; c.fillText('🪩', w/2, h/2 + 2); }
  if (id === 'chickens') { c.font = '22px system-ui'; c.fillText('🐔', 26, 24 + Math.sin(clock*6)*4); c.fillText('🐔', 62, 34 + Math.cos(clock*6)*4); }
  if (id === 'blackhole') { const g = c.createRadialGradient(w/2, h/2, 0, w/2, h/2, 24); g.addColorStop(0, '#000'); g.addColorStop(0.5, 'rgba(255,140,60,0.9)'); g.addColorStop(1, 'rgba(120,60,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(w/2, h/2, 24, 0, TAU); c.fill(); }
  if (id === 'champion') { c.font = '30px system-ui'; c.fillText('👑', w/2, h/2 + 2); }
}

