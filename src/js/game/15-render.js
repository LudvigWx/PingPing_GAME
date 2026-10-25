// ---------- fx ----------
const BANNERS = {
  multi: ['MULTIBALL!', () => 'More balls in play'],
  giant: ['GIANT PADDLE!', n => n + ' grows'],
  mini:  ['SHRINK!', n => 'Everyone except ' + n + ' shrinks'],
  ice:   ['FREEZE!', n => 'Everyone except ' + n + ' turn sluggish'],
  rev:   ['MIRRORED!', n => 'Everyone except ' + n + ' controls are reversed'],
  shield:['SHIELD!', n => n + ' is saved once'],
  ghost: ['GHOST BALL!', () => 'The ball turns almost invisible'],
  curve: ['SPIN!', () => 'The balls curve'],
  turbo: ['TURBO!', () => 'Full speed ahead'],
  heart: ['EXTRA LIFE!', n => n + ' gets a life back'],
  chaos: ['CHAOS!', () => 'Everything flies everywhere']
};
const CAT_COL = { bra: '#7CFFB2', elak: '#FF7A59', kaos: '#C59BFF' };
const ITEM_GLYPH = { multi: '×3', giant: 'XL', mini: 'XS', ice: '*', rev: '<>', shield: 'S', ghost: '?', curve: '@', turbo: '>>', heart: '+1', chaos: '!' };
function seatName(i) { return i === mySeat ? 'You' : (names[i] || 'Player ' + (i+1)); }
function showPower(type, seat) {
  const b = BANNERS[type]; if (!b) return;
  if (seat === mySeat) track('powers');
  let sub = b[1](seatName(seat));
  if (type === 'rev' && seat !== mySeat && mySeat >= 0) sub = 'Your controls are reversed!';
  banner = { text: b[0], sub, col: CAT_COL[POWERS[type].cat], t: 0 };
  if (mode !== 'menu') { sfx.power(POWERS[type].cat); buzz(20); }
}
function fx(type, seat, x, y, ball, extra) {
  const live = mode !== 'menu';
  if (type === 'hit') {
    if (seat === mySeat) { track('hits'); if (st) trackMax('rallyHits', st.rh); }
    if (ball && st && ball.id === st.gb && seat === mySeat && live) { goldHits++; pops.push({ x, y, txt: '+3 🪙', col: '#FFD84A', t: 0 }); tone(1568, 0.06, 'triangle', 0.04); }
    burst(x, y, colOf(seat), 16, 1);
    if (live) { sfx.hit(seat); if (seat === mySeat) buzz(12); }
    rally++;
  } else if (type === 'wall' || type === 'bump' || type === 'rock') {
    burst(x, y, type === 'rock' ? '#A99BFF' : '#ffffff', type === 'rock' ? 10 : 6, 0.6);
    if (live) sfx[type]();
  } else if (type === 'lvbump') {
    burst(x, y, '#FF4F8B', 12, 0.9); if (live) tone(660 + Math.random()*200, 0.08, 'square', 0.04, 1.3);
  } else if (type === 'lvboost') {
    burst(x, y, '#3EE6FF', 10, 1); if (live) tone(880, 0.1, 'sawtooth', 0.03, 1.6);
  } else if (type === 'brick') {
    burst(x, y, '#FFB23E', 26, 1.4); if (live) { tone(330, 0.12, 'square', 0.05, 0.5); tone(220, 0.15, 'triangle', 0.04, 0.6, 0.05); }
  } else if (type === 'star') {
    burst(x, y, '#FFD84A', 30, 1.5); if (live) { tone(1046, 0.1, 'triangle', 0.05); tone(1568, 0.18, 'triangle', 0.05, 1, 0.08); if (seat >= 0) bubble(seat, '⭐'); }
  } else if (type === 'starback') {
    burst(x, y, '#FFD84A', 8, 0.6);
  } else if (type === 'weak') {
    if (live) { banner = { text: 'WEAK POINT!', sub: 'The core takes double damage for 5 seconds', col: '#FFE34A', t: 0 }; tone(988, 0.15, 'square', 0.05); tone(1318, 0.25, 'square', 0.05, 1, 0.12); buzz([20, 30, 20]); }
  } else if (type === 'ffshield') {
    burst(x, y, '#7CFFB2', 16, 1); if (live) { tone(880, 0.12, 'triangle', 0.05, 1.3); if (seat === mySeat || Math.random() < 0.5) banner = { text: 'TEAM SHIELD', sub: 'No friendly fire in boss fights', col: '#7CFFB2', t: 0.6 }; }
  } else if (type === 'shield') {
    burst(x, y, colOf(seat), 20, 1.2); if (live) sfx.shield();
    if (seat === mySeat) track('shieldSaves');
  } else if (type === 'split') {
    burst(x, y, '#FFC94A', 18, 1.1); if (live) sfx.split();
  } else if (type === 'hero') {
    const H = HEROES[extra]; if (!H) return;
    if (live) { const ln = heroSay(extra, 'use'); heroPop = { id: extra, t: 0, seat, v: st && st.hv ? st.hv[seat] : 'std', line: ln }; }
    if (seat === mySeat && mode !== 'menu') giveHeroXp(extra, 10);
    if (st && extra === 'storm') { const s = st.arena.sides[st.arena.seatSide[seat]]; for (let k = 0; k <= 10; k++) { const t2 = k/10; burst(s.A[0] + (s.B[0]-s.A[0])*t2 - s.out[0]*0.2, s.A[1] + (s.B[1]-s.A[1])*t2 - s.out[1]*0.2, '#9FF3FF', 4, 1.3); } }
    if (live) { banner = { text: H[0].toUpperCase() + '!', sub: (seat === mySeat ? 'Your power: ' : seatName(seat) + ': ') + H[1].toLowerCase(), col: '#9FF3FF', t: 0 }; tone(330, 0.3, 'triangle', 0.07, 2.5); buzz(25); }
  } else if (type === 'lava') {
    burst(x, y, '#FF8A3D', 14, 1.2); if (live) tone(160, 0.15, 'sawtooth', 0.05, 2);
  } else if (type === 'portal') {
    burst(x, y, '#C59BFF', 16, 1); if (live) tone(700, 0.15, 'sine', 0.05, 0.4);
  } else if (type === 'arm') {
    if (live) { tone(220, 0.35, 'sawtooth', 0.05, 4); if (seat === mySeat) { banner = { text: 'SMASH READY!', sub: 'Your next hit is lightning', col: '#FFE34A', t: 0 }; buzz(25); } }
  } else if (type === 'smash') {
    burst(x, y, '#FFE34A', 36, 2.2); burst(x, y, '#ffffff', 14, 1.4); shake = Math.max(shake, 0.7);
    if (live) { tone(1568, 0.06, 'square', 0.07); tone(98, 0.4, 'sawtooth', 0.08, 0.5); buzz([20, 30, 60]); }
  } else if (type === 'shieldbreak') {
    if (seat >= 0) flash[seat] = 1; burst(x, y, '#ffffff', 30, 1.8);
    if (live) { tone(1800, 0.2, 'square', 0.06, 0.2); banner = { text: 'SHIELD SHATTERS!', sub: seatName(seat) + ' loses their shield', col: '#FFE34A', t: 0 }; }
  } else if (type === 'battack') {
    shake = Math.max(shake, 0.5);
    if (live) { banner = { text: BOSS_ATTACKS[extra] || 'THE BOSS ATTACKS!', sub: 'The boss strikes back', col: '#FF5A4A', t: 0 }; tone(110, 0.5, 'sawtooth', 0.08, 0.6); tone(55, 0.6, 'square', 0.05); }
  } else if (type === 'sgen') {
    if (live && seat === mySeat) { sfx.shield(); banner = { text: 'NEW SHIELD', sub: 'Shield generator recharged', col: '#FFC94A', t: 0 }; }
  } else if (type === 'pick') {
    burst(x, y, CAT_COL[POWERS[extra].cat], 26, 1.4);
    showPower(extra, seat);
  } else if (type === 'combo') {
    pops.push({ x, y, txt: extra + '!', col: extra === 'SMASH' ? '#FFE34A' : extra === 'EDGE' ? '#7CFFB2' : '#3EE6FF', t: 0 });
    if (live) tone(extra === 'SMASH' ? 1320 : extra === 'EDGE' ? 1046 : 880, 0.05, 'triangle', 0.03, 1.2);
  } else if (type === 'heat') {
    const H0 = HEAT_INFO[extra] || HEAT_INFO[1];
    pops.push({ x, y, txt: H0[0], col: H0[1], t: -0.2, big: 1 }); burst(x, y, H0[1], 30 + extra*10, 1.2 + extra*0.3);
    if (live) { tone(300 + extra*150, 0.25, 'sawtooth', 0.04, 1.8); if (extra >= 4) { shake = 0.5; buzz([30, 30, 60]); } }
    if (mySeat >= 0 && st && st.alive[mySeat]) { trackMax('heatMax', extra); if (extra >= 4) unlockSecret('t', 'plasma'); }
  } else if (type === 'goal') {
    lastGoalPos = [x, y];
    { const by = ball && ball.lh != null ? ball.lh : -1; // revenge: score on whoever last scored on you
      if (by >= 0 && by !== seat && st && !(st.boss && (seat === st.boss.s || by === st.boss.s))) {
        if (by === mySeat && revengeMap[mySeat] === seat) { revengeN++; revengeMap[mySeat] = -1; pops.push({ x, y, txt: 'REVENGE!', col: '#FF4F8B', t: -0.15, big: 1 }); if (live) { tone(392, 0.12, 'square', 0.05); tone(587, 0.2, 'square', 0.05, 1, 0.1); buzz([30, 30, 30]); } }
        revengeMap[seat] = by;
      } }
    if (heatSeen >= 3) { // meltdown: a hot ball going out is a big deal
      burst(x, y, '#FFFFFF', 40, 2.6); burst(x, y, HEAT_INFO[heatSeen][1], 70, 2.2); shake = Math.max(shake, 1);
      pops.push({ x, y, txt: 'MELTDOWN!', col: HEAT_INFO[heatSeen][1], t: -0.1, big: 1 });
      if (live) { tone(70, 0.6, 'sawtooth', 0.08, 0.5); tone(110, 0.5, 'square', 0.05, 0.6, 0.05); buzz([60, 30, 120]); }
    }
    if (st && st.boss && seat === st.boss.s) {
      flash[seat] = 1; burst(x, y, '#FF5A4A', 50, 2); shake = 0.8; rally = 0;
      if (live) { banner = { text: 'BOSS HIT!', sub: st.lgs >= 0 ? 'Smash does double damage' : 'Keep it up!', col: '#7CFFB2', t: 0 }; sfx.win(); buzz(30); }
      if (st.lgs === mySeat) { track('smashGoals'); if (advCur && !advCur.done) advCur.smashes = (advCur.smashes || 0) + 1; }
      return;
    }
    if (st && st.raid && st.foe[seat] && !st.alive[seat] && live) { banner = { text: (names[seat] || 'ARM').toUpperCase() + ' DESTROYED', sub: st.foe.some((f, i) => f && st.alive[i]) ? 'One more to expose the core' : 'The core is exposed: full damage!', col: '#7CFFB2', t: 0 }; shake = 0.8; tone(150, 0.6, 'sawtooth', 0.06, 0.3); }
    if (st && st.lgs === mySeat && seat !== mySeat) { track('smashGoals'); if (advCur && !advCur.done) advCur.smashes = (advCur.smashes || 0) + 1; }
    if (mode === 'practice' && bots[seat] && Math.random() < 0.3) bubble(seat, pick(['😱', '😤', '🙈']));
    if (seat >= 0) flash[seat] = 1;
    burst(x, y, seat >= 0 ? colOf(seat) : '#fff', 34, 1.6);
    rally = 0;
    if (live) { sfx.goal(); shake = seat === mySeat ? 1 : 0.45; if (seat === mySeat) buzz([40, 50, 40]); }
  }
}
// ----- heat / combo visuals -----
const HEAT_INFO = [null, ['HEATING UP', '#FFD84A'], ['ON FIRE', '#FF8A3D'], ['BLAZING', '#FF3B4A'], ['MELTDOWN MODE', '#E8D8FF']];
let pops = [], heatSeen = 0, revengeMap = {}, revengeN = 0;
function heatCol(h) { return h ? HEAT_INFO[h][1] : '#FFFFFF'; }
function drawHeatBall(c, b, r, h, t) { // glow + licking flames behind the ball, in world units
  const sp = Math.hypot(b.vx, b.vy) || 1, ux = -b.vx/sp, uy = -b.vy/sp, col = heatCol(h);
  c.save(); c.globalCompositeOperation = 'lighter';
  const g = c.createRadialGradient(b.x, b.y, r*0.4, b.x, b.y, r*(2.4 + h*0.5)); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = 0.35 + 0.1*h; c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, r*(2.4 + h*0.5), 0, TAU); c.fill();
  for (let k = 0; k < 3 + h*2; k++) {
    const ph = (t*3 + k*0.37) % 1, d = r*(0.6 + ph*(2 + h*0.6)), j = Math.sin(t*20 + k*2.3)*r*0.7*ph;
    c.globalAlpha = (1 - ph)*0.7; c.fillStyle = h >= 4 ? (k % 2 ? '#B57CFF' : '#7FE8FF') : k % 2 ? col : '#FFE34A';
    c.beginPath(); c.arc(b.x + ux*d - uy*j, b.y + uy*d + ux*j, r*(0.55 - ph*0.4), 0, TAU); c.fill();
  }
  if (h >= 4) { c.strokeStyle = '#E8D8FF'; c.lineWidth = r*0.12; c.globalAlpha = 0.8; for (let k = 0; k < 3; k++) { const a = t*9 + k*2.1; c.beginPath(); c.moveTo(b.x, b.y); c.lineTo(b.x + Math.cos(a)*r*1.6, b.y + Math.sin(a)*r*1.6); c.lineTo(b.x + Math.cos(a + 0.5)*r*2.3, b.y + Math.sin(a + 0.5)*r*2.3); c.stroke(); } }
  c.restore();
}
function burst(x, y, col, n, power) {
  for (let i = 0; i < n; i++) {
    const a = Math.random()*TAU, s = (0.2 + Math.random()*0.9) * power;
    particles.push({ x, y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 1, col });
  }
  if (particles.length > 500) particles.splice(0, particles.length - 500);
}

// ---------- canvas & view ----------
const cv = $('#game'), ctx = cv.getContext('2d');
let W = 0, H = 0, DPR = 1, stars = [];
function resize() {
  DPR = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
  cv.width = Math.round(W*DPR); cv.height = Math.round(H*DPR);
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  stars = Array.from({ length: Math.round(W*H/5000) }, () => ({ x: Math.random()*W, y: Math.random()*H, r: Math.random()*1.2 + 0.2, a: Math.random()*0.5 + 0.15 }));
}
addEventListener('resize', resize); resize();

function computeView(arena, seat, flip) {
  const s = arena.sides[arena.seatSide[Math.max(0, seat)]];
  const rot = Math.PI/2 - Math.atan2(s.out[1], s.out[0]) + (flip ? Math.PI : 0);
  const c = Math.cos(rot), sn = Math.sin(rot);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const v of arena.verts) { const x = v[0]*c - v[1]*sn, y = v[0]*sn + v[1]*c; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const bmp = arena.bump ? arena.bump*1.1 : 0, top = 104, bot = 104, side = 10;
  x0 -= bmp; x1 += bmp; y0 -= bmp; y1 += bmp;
  const scale = Math.min((W - side*2) / (x1 - x0), (H - top - bot) / (y1 - y0));
  let cx = W/2 - (x0 + x1)/2*scale, cy = top + (H - top - bot)/2 - (y0 + y1)/2*scale;
  if (shake > 0) { cx += (Math.random()-0.5)*14*shake; cy += (Math.random()-0.5)*14*shake; }
  if (replay && st && arena === st.arena) {
    const p = clamp(replay.i / replay.frames.length, 0, 1), z = 1 + 0.7*Math.sin(Math.min(1, p*1.6)*Math.PI/2);
    const [fx, fy] = replay.focus, sx = cx + (fx*c - fy*sn)*scale, sy = cy + (fx*sn + fy*c)*scale;
    const tx = sx + (W/2 - sx)*0.5*(z - 1)/0.7, ty = sy + (H*0.45 - sy)*0.5*(z - 1)/0.7;
    return { c, sn, scale: scale*z, cx: tx + (cx - sx)*z, cy: ty + (cy - sy)*z };
  }
  return { c, sn, scale, cx, cy };
}
const toScr = (v, x, y) => [v.cx + (x*v.c - y*v.sn)*v.scale, v.cy + (x*v.sn + y*v.c)*v.scale];
function worldTf(v) { ctx.setTransform(DPR*v.scale*v.c, DPR*v.scale*v.sn, -DPR*v.scale*v.sn, DPR*v.scale*v.c, DPR*v.cx, DPR*v.cy); }

function drawBg() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  const g = ctx.createRadialGradient(W/2, H*0.45, 0, W/2, H*0.45, Math.max(W, H)*0.8);
  g.addColorStop(0, '#1B1440'); g.addColorStop(1, '#0C0A1C');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#ffffff';
  for (const s of stars) { ctx.globalAlpha = s.a; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
}
function rockPath(o) {
  ctx.beginPath();
  for (let k = 0; k < 9; k++) {
    const a = k/9*TAU, rr = o.r * (0.82 + 0.18*Math.sin(o.id*7.3 + k*2.1));
    k ? ctx.lineTo(o.x + Math.cos(a)*rr, o.y + Math.sin(a)*rr) : ctx.moveTo(o.x + Math.cos(a)*rr, o.y + Math.sin(a)*rr);
  }
  ctx.closePath();
}

const EMOTES = ['😂', '🔥', '😱', '😎', '👋', 'GG'];
function bubble(seat, e) { if (seat == null || seat < 0) return; emoBubbles[seat] = { e, t: 0 }; if (mode !== 'menu') tone(880, 0.05, 'sine', 0.04); }
function drawBubble(seat, x, y) {
  const b = emoBubbles[seat]; if (!b) return;
  const t = b.t, a = t < 0.12 ? t/0.12 : t > 2.1 ? Math.max(0, (2.5 - t)/0.4) : 1, s = t < 0.12 ? 0.6 + 0.6*(t/0.12) : 1;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y - Math.min(t, 0.3)*20); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(240,236,255,0.95)'; ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(-24, -18, 48, 34, 12); else ctx.rect(-24, -18, 48, 34);
  ctx.fill(); ctx.beginPath(); ctx.moveTo(-5, 15); ctx.lineTo(0, 22); ctx.lineTo(5, 15); ctx.fill();
  ctx.font = b.e === 'GG' ? '14px "Rubik Mono One", monospace' : '20px system-ui, sans-serif'; ctx.fillStyle = '#16112E'; ctx.fillText(b.e, 0, 0);
  ctx.restore();
}
function drawDarkness(g, v) {
  const pts = [];
  for (const b of g.balls) pts.push([...toScr(v, b.x, b.y), 0.32]);
  for (let i = 0; i < g.n; i++) if (g.alive[i]) {
    const s = g.arena.sides[g.arena.seatSide[i]], c = padCenter(g.arena, s, g.pads[i], padW(g, i));
    pts.push([...toScr(v, s.A[0] + s.dir[0]*c - s.out[0]*INSET, s.A[1] + s.dir[1]*c - s.out[1]*INSET), 0.22]);
  }
  ctx.save(); ctx.fillStyle = 'rgba(4,2,12,0.9)'; ctx.beginPath(); ctx.rect(0, 0, W, H);
  for (const [x, y, r] of pts) { ctx.moveTo(x + r*v.scale, y); ctx.arc(x, y, r*v.scale, 0, TAU, true); }
  ctx.fill('evenodd'); ctx.restore();
}
let wheelTick = -1;
function drawWheel(g) {
  const keys = MUT_KEYS, N = keys.length, target = keys.indexOf(g.mut);
  const p = clamp((4.6 - g.t) / 2.6, 0, 1), ease = 1 - Math.pow(1 - p, 3);
  const ang = -(target + 0.5)/N*TAU - Math.PI/2 - (1 - ease)*TAU*4;
  const R = Math.min(W, H)*0.3, cx = W/2, cy = H*0.45;
  ctx.save(); ctx.fillStyle = 'rgba(8,6,20,0.82)'; ctx.fillRect(0, 0, W, H);
  ctx.translate(cx, cy);
  for (let k = 0; k < N; k++) {
    const a0 = ang + k/N*TAU, a1 = a0 + TAU/N;
    ctx.fillStyle = 'hsl(' + (k*360/N) + ',70%,' + (k === target && p >= 1 ? 60 : 38) + '%)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, R, a0, a1); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.rotate(a0 + TAU/N/2); ctx.fillStyle = '#fff'; ctx.font = '700 ' + Math.round(R*0.09) + 'px "Chakra Petch", system-ui, sans-serif'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    ctx.fillText(MUTATORS[keys[k]][0], R - 8, 0); ctx.restore();
  }
  ctx.fillStyle = '#16112E'; ctx.beginPath(); ctx.arc(0, 0, R*0.16, 0, TAU); ctx.fill();
  ctx.fillStyle = '#FFE34A'; ctx.beginPath(); ctx.moveTo(-10, -R - 14); ctx.lineTo(10, -R - 14); ctx.lineTo(0, -R + 6); ctx.closePath(); ctx.fill();
  ctx.restore();
  const seg = Math.floor(((-(ang + Math.PI/2)) / TAU * N % N + N) % N);
  if (seg !== wheelTick && mode !== 'menu') { wheelTick = seg; tone(1200, 0.02, 'square', 0.03); }
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = Math.round(Math.min(26, W/14)) + 'px "Rubik Mono One", monospace'; ctx.fillStyle = '#FFE34A';
  ctx.fillText(p >= 1 ? MUTATORS[g.mut][0].toUpperCase() + '!' : 'CHAOS WHEEL', W/2, cy - R - 46);
  if (p >= 1) { ctx.font = '700 14px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#F0ECFF'; ctx.fillText(MUTATORS[g.mut][1], W/2, cy + R + 30); }
}
function drawArenaDecor(g, A, dim) {
  if (g.ar === 'ice') {
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(220,245,255,0.35)'; ctx.lineWidth = 0.004;
    const cr = [[-0.4, 0.1, 0.1, -0.2, 0.3, -0.1], [0.2, 0.4, 0.05, 0.2, -0.2, 0.35], [0.5, -0.2, 0.3, -0.05, 0.42, 0.12]];
    for (const c of cr) { ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(c[2], c[3]); ctx.lineTo(c[4], c[5]); ctx.stroke(); }
    ctx.restore();
  } else if (g.ar === 'hole') {
    const rg = ctx.createRadialGradient(0, 0, 0, 0, 0, 0.32);
    rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.3, 'rgba(8,0,20,0.95)'); rg.addColorStop(0.55, 'rgba(255,120,60,0.35)'); rg.addColorStop(1, 'rgba(120,60,255,0)');
    ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(0, 0, 0.32, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(255,170,90,0.5)'; ctx.lineWidth = 0.006;
    for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(0, 0, 0.14 + k*0.05, 0.05 + k*0.02, clock*(0.6 + k*0.3), 0, TAU); ctx.stroke(); }
  } else if (g.ar === 'retro') {
    ctx.save(); ctx.clip(); ctx.strokeStyle = 'rgba(80,255,160,0.12)'; ctx.lineWidth = 0.003;
    for (let k = -1.2; k <= 1.2; k += 0.1) { ctx.beginPath(); ctx.moveTo(k, -1.3); ctx.lineTo(k, 1.3); ctx.stroke(); ctx.beginPath(); ctx.moveTo(-1.3, k); ctx.lineTo(1.3, k); ctx.stroke(); }
    ctx.restore();
  }
}
function drawGame(g, seatView, dim, lk, isLive) {
  const A = g.arena, v = computeView(A, seatView, g.mut === 'upside');
  ctx.globalAlpha = dim;
  worldTf(v);
  ctx.beginPath(); A.verts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath();
  ctx.fillStyle = ({ ice: 'rgba(170,230,255,0.13)', hole: 'rgba(40,10,60,0.35)', retro: 'rgba(40,255,140,0.05)' })[g.ar] || 'rgba(120,100,255,0.06)'; ctx.fill();
  drawArenaDecor(g, A, dim);
  for (const L of g.lava || []) {
    const lg = ctx.createRadialGradient(L[0], L[1], 0, L[0], L[1], L[2]);
    lg.addColorStop(0, 'rgba(255,230,120,0.75)'); lg.addColorStop(0.6, 'rgba(255,110,40,0.55)'); lg.addColorStop(1, 'rgba(255,60,30,0.05)');
    ctx.fillStyle = lg; ctx.beginPath(); ctx.arc(L[0], L[1], L[2]*(1 + 0.05*Math.sin(clock*3 + L[0]*9)), 0, TAU); ctx.fill();
  }
  if (g.portals) g.portals.forEach((P, k) => {
    ctx.strokeStyle = k ? '#FF8A3D' : '#4FA8FF'; ctx.lineWidth = 0.012; ctx.shadowColor = ctx.strokeStyle; ctx.shadowBlur = 16*DPR;
    for (let r = 0; r < 3; r++) { ctx.beginPath(); ctx.arc(P[0], P[1], 0.03 + r*0.018 + 0.006*Math.sin(clock*6 + r), clock*(k ? -3 : 3) + r, clock*(k ? -3 : 3) + r + 4.5); ctx.stroke(); }
    ctx.shadowBlur = 0;
  });
  if (g.lv) drawLevelObjs(ctx, g, clock, false);
  if (g.mut === 'wind') {
    const wa = g.mt*0.45; ctx.strokeStyle = 'rgba(200,230,255,0.18)'; ctx.lineWidth = 0.006;
    for (let k = 0; k < 9; k++) { const ox = ((k*0.37 + clock*0.25) % 1.6) - 0.8, oy = ((k*0.61) % 1.4) - 0.7; const x = ox*Math.cos(wa) - oy*Math.sin(wa), y = ox*Math.sin(wa) + oy*Math.cos(wa);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(wa)*0.12, y + Math.sin(wa)*0.12); ctx.stroke(); }
  }
  ctx.lineWidth = 0.004; ctx.strokeStyle = g.ar === 'retro' ? 'rgba(80,255,160,0.25)' : 'rgba(160,150,230,0.14)';
  for (const k of [0.33, 0.66]) { ctx.beginPath(); A.verts.forEach((p, i) => i ? ctx.lineTo(p[0]*k, p[1]*k) : ctx.moveTo(p[0]*k, p[1]*k)); ctx.closePath(); ctx.stroke(); }
  ctx.lineCap = 'round';
  for (let i = 0; i < g.n; i++) if (g.mods[i].slow && g.alive[i]) {
    const s = A.sides[A.seatSide[i]], dd = 0.38 + INSET;
    ctx.fillStyle = 'rgba(255,201,74,0.05)';
    ctx.beginPath(); ctx.moveTo(s.A[0], s.A[1]); ctx.lineTo(s.B[0], s.B[1]); ctx.lineTo(s.B[0] - s.out[0]*dd, s.B[1] - s.out[1]*dd); ctx.lineTo(s.A[0] - s.out[0]*dd, s.A[1] - s.out[1]*dd); ctx.closePath(); ctx.fill();
  }
  for (const s of A.sides) {
    const seat = s.owner;
    if (seat < 0) {
      ctx.strokeStyle = '#4A3F86'; ctx.lineWidth = 0.016;
      ctx.beginPath(); ctx.moveTo(s.A[0], s.A[1]); ctx.lineTo(s.B[0], s.B[1]); ctx.stroke();
    } else if (!g.alive[seat]) {
      const ox = -s.out[0]*INSET, oy = -s.out[1]*INSET;
      ctx.strokeStyle = '#5B5480'; ctx.lineWidth = 0.02;
      ctx.beginPath(); ctx.moveTo(s.A[0]+ox, s.A[1]+oy); ctx.lineTo(s.B[0]+ox, s.B[1]+oy); ctx.stroke();
    } else {
      const f = flash[seat] || 0, col = colOf(seat, lk);
      ctx.strokeStyle = col; ctx.globalAlpha = dim * (0.22 + f*0.7); ctx.lineWidth = 0.006 + f*0.02;
      ctx.setLineDash([0.03, 0.025]);
      ctx.beginPath(); ctx.moveTo(s.A[0], s.A[1]); ctx.lineTo(s.B[0], s.B[1]); ctx.stroke();
      ctx.setLineDash([]); ctx.globalAlpha = dim;
      if (g.wall && g.wall[seat] > 0) {
        ctx.strokeStyle = '#9FF3FF'; ctx.lineWidth = 0.02; ctx.shadowColor = '#9FF3FF'; ctx.shadowBlur = 18*DPR; ctx.globalAlpha = dim*(0.7 + 0.3*Math.sin(clock*12));
        ctx.beginPath(); ctx.moveTo(s.A[0] - s.out[0]*0.02, s.A[1] - s.out[1]*0.02); ctx.lineTo(s.B[0] - s.out[0]*0.02, s.B[1] - s.out[1]*0.02); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = dim;
      }
      if (g.F.s[seat] > 0) {
        ctx.shadowColor = col; ctx.shadowBlur = 16*DPR; ctx.strokeStyle = col; ctx.globalAlpha = dim*(0.65 + 0.25*Math.sin(clock*8));
        ctx.lineWidth = 0.012 + 0.006*(g.F.s[seat] - 1);
        ctx.beginPath(); ctx.moveTo(s.A[0] - s.out[0]*0.012, s.A[1] - s.out[1]*0.012); ctx.lineTo(s.B[0] - s.out[0]*0.012, s.B[1] - s.out[1]*0.012); ctx.stroke();
        ctx.shadowBlur = 0; ctx.globalAlpha = dim;
      }
    }
  }
  if (A.bump > 0) for (const p of A.verts) {
    ctx.fillStyle = '#211A44'; ctx.strokeStyle = '#7C6FD0'; ctx.lineWidth = 0.008;
    ctx.beginPath(); ctx.arc(p[0], p[1], A.bump, 0, TAU); ctx.fill(); ctx.stroke();
  }
  for (const o of g.obs) {
    if (o.age < 1) {
      ctx.strokeStyle = '#A99BFF'; ctx.lineWidth = 0.006; ctx.globalAlpha = dim * (0.4 + 0.4*Math.sin(clock*20));
      ctx.setLineDash([0.012, 0.012]); ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.globalAlpha = dim * clamp(o.life, 0, 1);
      rockPath(o); ctx.fillStyle = '#2A2350'; ctx.fill(); ctx.strokeStyle = '#8C7FE0'; ctx.lineWidth = 0.007; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.arc(o.x + o.r*0.25, o.y - o.r*0.2, o.r*0.22, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = dim;
  }
  for (const it of g.items) {
    const col = CAT_COL[POWERS[it.type].cat], blink = it.life < 2.5 && Math.sin(clock*18) < 0;
    if (blink) continue;
    const pr = ITEM_R * (1 + 0.08*Math.sin(clock*5 + it.id));
    ctx.shadowColor = col; ctx.shadowBlur = 16*DPR*dim;
    ctx.fillStyle = 'rgba(12,10,28,0.85)'; ctx.strokeStyle = col; ctx.lineWidth = 0.008;
    ctx.beginPath();
    for (let k = 0; k < 6; k++) { const a = k/6*TAU + clock*0.8; k ? ctx.lineTo(it.x + Math.cos(a)*pr, it.y + Math.sin(a)*pr) : ctx.moveTo(it.x + Math.cos(a)*pr, it.y + Math.sin(a)*pr); }
    ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
  }
  for (let i = 0; i < g.n; i++) {
    if (!g.alive[i]) continue;
    const s = A.sides[A.seatSide[i]], w = padW(g, i);
    const look = lk[i] || validLook(null, SEAT_DEFAULT[i]);
    const draws = [[g.pads[i], w, false]];
    if (g.mods[i].phantom || (g.clone && g.clone[i] > 0)) draws.push([-g.pads[i], w*0.75, true]);
    for (const [u, ww, ghost] of draws) {
      const c = padCenter(A, s, u, ww === w ? w : w);
      const px = s.A[0] - s.out[0]*INSET + s.dir[0]*c, py = s.A[1] - s.out[1]*INSET + s.dir[1]*c;
      let gaze = [0, -1];
      if (g.balls.length) {
        let nb = g.balls[0], nd = 1e9; for (const b of g.balls) { const d = Math.hypot(b.x - px, b.y - py); if (d < nd) { nd = d; nb = b; } }
        const lx = (nb.x - px)*s.dir[0] + (nb.y - py)*s.dir[1], ly = (nb.x - px)*s.out[0] + (nb.y - py)*s.out[1], ll = Math.hypot(lx, ly) || 1;
        gaze = [lx/ll, ly/ll];
      }
      ctx.save(); ctx.transform(s.dir[0], s.dir[1], s.out[0], s.out[1], px, py); ctx.scale(0.01, 0.01);
      if (g.mut === 'invis' && isLive && i !== mySeat) {
        let nd = 9; for (const b of g.balls) nd = Math.min(nd, Math.hypot(b.x - px, b.y - py));
        ctx.globalAlpha = dim * clamp(1.2 - nd*2.2, 0.04, 1);
      }
      if (g.grav && g.grav[i] > 0 && !ghost) {
        ctx.strokeStyle = 'rgba(181,124,255,0.7)'; ctx.lineWidth = 1;
        for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(0, -14, 10 + k*7, 4 + k*3, 0, clock*4 + k, clock*4 + k + 4); ctx.stroke(); }
      }
      if (ghost) { ctx.globalAlpha = dim * (0.35 + 0.1*Math.sin(clock*4)); drawPaddleLocal(ctx, { c: look.c, h: 'none', f: 'none' }, ww*50, clock, gaze, {}, 10*DPR*dim); }
      else {
        if (g.arm[i] > 0) {
          ctx.strokeStyle = '#FFE34A'; ctx.lineWidth = 1.2; ctx.shadowColor = '#FFE34A'; ctx.shadowBlur = 20*DPR;
          for (let k = 0; k < 3; k++) {
            ctx.beginPath(); let xx = -ww*50;
            ctx.moveTo(xx, -3 - Math.random()*3);
            while (xx < ww*50) { xx += 4 + Math.random()*4; ctx.lineTo(Math.min(xx, ww*50), -3 - Math.random()*6); }
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
        drawPaddleLocal(ctx, look, ww*50, clock + i, gaze, { ice: g.F.i[i] > 0 }, 18*DPR*dim);
      }
      ctx.restore(); ctx.globalAlpha = dim;
    }
  }
  const tc = g.last >= 0 ? colOf(g.last, lk) : '#ffffff';
  const tstyle = g.last >= 0 && lk[g.last] ? lk[g.last].t : 'std';
  const ghostA = g.ghost > 0 ? (0.06 + 0.22*Math.max(0, Math.sin(clock*9))) : 1;
  let blind = null;
  if (isLive && mySeat >= 0 && g.mods[mySeat] && g.mods[mySeat].blind) blind = A.sides[A.seatSide[mySeat]];
  const ballA = b => blind ? clamp(1.25 - (blind.d - (b.x*blind.out[0] + b.y*blind.out[1]))*0.95, 0.22, 1) : 1;
  if (isLive) for (const b of g.balls) {
    const tr = trails.get(b.id); if (!tr) continue;
    const ba = ballA(b);
    for (let i = 0; i < tr.length; i++) {
      const k = (i+1)/tr.length;
      ctx.globalAlpha = dim * (tstyle === 'std' ? k*0.45 : 0.35 + k*0.5) * ghostA * ba;
      trailDot(ctx, tstyle, tc, tr[i][0], tr[i][1], g.br || BALL_R, k, i + (b.id*3), clock);
    }
  }
  ctx.globalAlpha = dim * ghostA;
  if (g.ph === 'cd') { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, g.br || BALL_R, 0, TAU); ctx.fill(); }
  const gHeat = heatOf(g.rh || 0);
  for (const b of g.balls) {
    ctx.globalAlpha = dim * ghostA * ballA(b);
    if (gHeat && g.ph === 'pl') { drawHeatBall(ctx, b, g.br || BALL_R, gHeat, clock); ctx.globalAlpha = dim * ghostA * ballA(b); }
    if (b.id === g.gb) { const r0 = (g.br || BALL_R); ctx.save(); ctx.strokeStyle = '#FFD84A'; ctx.lineWidth = r0*0.35; ctx.shadowColor = '#FFD84A'; ctx.shadowBlur = 18*DPR; ctx.beginPath(); ctx.arc(b.x, b.y, r0*1.45, 0, TAU); ctx.stroke(); ctx.fillStyle = '#FFF6B0'; for (let k = 0; k < 3; k++) { const a = clock*4 + k*TAU/3; star4(ctx, b.x + Math.cos(a)*r0*2, b.y + Math.sin(a)*r0*2, r0*0.45); } ctx.restore(); }
    const sm = b.sx >= 0;
    ctx.shadowColor = sm ? '#FFE34A' : tc; ctx.shadowBlur = (sm ? 34 : 22)*DPR*dim;
    const bsk = g.last >= 0 && lk[g.last] ? lk[g.last].b : 'std';
    if (bsk && bsk !== 'std') { ctx.shadowBlur = 0; drawBallSkinX(ctx, bsk, b.x, b.y, (g.br || BALL_R)*(sm ? 1.25 : 1), clock, b.vx, b.vy); }
    else { ctx.fillStyle = sm ? '#FFF6B0' : '#ffffff'; ctx.beginPath(); ctx.arc(b.x, b.y, (g.br || BALL_R)*(sm ? 1.25 : 1), 0, TAU); ctx.fill(); }
    ctx.shadowBlur = 0;
    if (sm) {
      const sp = Math.hypot(b.vx, b.vy) || 1, ux = -b.vx/sp, uy = -b.vy/sp;
      ctx.strokeStyle = '#FFE34A'; ctx.lineWidth = 0.008;
      for (let k = 0; k < 2; k++) {
        ctx.beginPath(); ctx.moveTo(b.x, b.y);
        for (let j = 1; j <= 5; j++) { const d = j*0.035, o = (Math.random() - 0.5)*0.05; ctx.lineTo(b.x + ux*d - uy*o, b.y + uy*d + ux*o); }
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  for (const p of (isLive || !st ? particles : [])) {
    ctx.globalAlpha = dim * Math.max(0, p.life); ctx.fillStyle = p.col;
    ctx.fillRect(p.x - 0.007, p.y - 0.007, 0.014, 0.014);
  }
  ctx.globalAlpha = 1;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.globalAlpha = dim;
  ctx.font = '700 ' + Math.round(ITEM_R*v.scale*0.85) + 'px "Chakra Petch", system-ui, sans-serif';
  for (const it of g.items) {
    if (it.life < 2.5 && Math.sin(clock*18) < 0) continue;
    const [x, y] = toScr(v, it.x, it.y);
    ctx.fillStyle = CAT_COL[POWERS[it.type].cat]; ctx.fillText(ITEM_GLYPH[it.type], x, y + 1);
  }
  ctx.globalAlpha = 1;
  if (isLive && g.mut === 'dark') drawDarkness(g, v);
  if (isLive && g.slowT > 0) { ctx.fillStyle = 'rgba(80,160,255,' + (0.12*Math.min(1, g.slowT)) + ')'; ctx.fillRect(0, 0, W, H); }
  if (isLive) drawHudLayer(g, v, lk);
  if (isLive && g.mut && g.ph === 'cd' && g.t > 1.5) drawWheel(g);
  return v;
}

const FX_TAGS = [['g', 'BIG'], ['m', 'SMALL'], ['i', 'FROZEN'], ['r', 'MIRROR'], ['s', 'SHIELD']];
function drawHudLayer(g, v, lk) {
  const A = g.arena;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const [cx, cy] = toScr(v, 0, 0);
  if (g.ph === 'pl') {
    ctx.font = Math.round(Math.min(64, v.scale*0.22)) + 'px "Rubik Mono One", ui-monospace, monospace';
    ctx.fillStyle = 'rgba(240,236,255,0.16)'; ctx.fillText(fmt(g.sc), cx, cy);
    ctx.font = '700 11px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = 'rgba(240,236,255,0.38)';
    ctx.fillText('RALLY' + (g.balls.length > 1 ? '  ×' + g.balls.length : ''), cx, cy - Math.min(64, v.scale*0.22)*0.75);
    if ((g.cm || 1) > 1.001 && g.ph === 'pl') {
      const hh = heatOf(g.rh || 0), fs = Math.round(Math.min(30, v.scale*0.1)*(1 + 0.08*Math.sin(clock*8)*(hh > 0)));
      ctx.font = fs + 'px "Rubik Mono One", ui-monospace, monospace'; ctx.fillStyle = hh ? heatCol(hh) : 'rgba(124,255,178,0.75)'; ctx.globalAlpha = 0.85;
      ctx.fillText('×' + (g.cm || 1).toFixed(1), cx, cy + Math.min(64, v.scale*0.22)*0.62); ctx.globalAlpha = 1;
      if (hh) { ctx.font = '700 10px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = heatCol(hh); ctx.fillText('🔥'.repeat(hh) + ' ' + HEAT_INFO[hh][0], cx, cy + Math.min(64, v.scale*0.22)*0.62 + fs*0.85); }
    }
    if (g.surv) { const left = Math.max(0, g.surv - g.mt); ctx.font = Math.round(Math.min(30, v.scale*0.1)) + 'px "Rubik Mono One", ui-monospace, monospace'; ctx.fillStyle = left < 10 ? 'rgba(124,255,178,' + (0.55 + 0.35*Math.sin(clock*10)) + ')' : 'rgba(124,255,178,0.5)'; ctx.fillText(Math.ceil(left) + 's', cx, cy + Math.min(64, v.scale*0.22)*0.85); }
  }
  ctx.font = '700 11px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = 'rgba(240,236,255,0.45)';
  const head = (special === 'adv' && advCur && g === st ? 'STAGE ' + (advCur.idx + 1) + '   ·   ' : '') + (g.surv ? 'SURVIVE ' + Math.max(0, Math.ceil(g.surv - g.mt)) + 's   ·   ' : '') + (g.lv && g.lv.rules.goal === 'survive' ? 'TIME ' + Math.max(0, Math.ceil(g.lv.rules.goalV - g.mt)) + 's   ·   ' : '') + (series ? 'MATCH ' + series.r + '/' + series.of + '   ·   ' : '') + 'TEAM ' + fmt(g.tot + (g.ph === 'pl' ? g.sc : 0)) + '   ·   BEST RALLY ' + fmt(Math.max(g.best, g.ph === 'pl' ? g.sc : 0));
  ctx.fillText(head, W/2, 76);
  if (g === st && pops.length) { // combo / heat popups
    ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    for (const p of pops) { if (p.t < 0) continue; const [px, py] = toScr(v, p.x, p.y), a = Math.min(1, 2.2 - p.t*1.6);
      ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = p.col; ctx.shadowColor = p.col; ctx.shadowBlur = 10;
      ctx.font = (p.big ? '15px "Rubik Mono One", monospace' : '700 12px "Chakra Petch", system-ui, sans-serif'); ctx.fillText(p.txt, px, py - 18 - p.t*40); }
    ctx.restore();
  }
  if (g.boss) {
    const bw = Math.min(W - 40, 360), bx = (W - bw)/2, by = 90, f = clamp(g.boss.hp / g.boss.mh, 0, 1);
    ctx.fillStyle = 'rgba(255,90,74,0.15)'; ctx.fillRect(bx, by, bw, 10);
    ctx.fillStyle = g.boss.rage === 2 ? '#FF2244' : '#FF5A4A'; ctx.fillRect(bx, by, bw*f, 10);
    ctx.strokeStyle = '#FF5A4A'; ctx.lineWidth = 1; ctx.strokeRect(bx + 0.5, by + 0.5, bw - 1, 9);
    ctx.font = '700 10px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#F0ECFF'; ctx.fillText((g.boss.wk ? 'WEEKLY BOSS · ' + (names[g.boss.s] || '').toUpperCase() + ' · ' + fmtTime(g.mt) + ' · ' : g.boss.floor ? 'FLOOR ' + g.boss.floor + ' · ' + (names[g.boss.s] || 'THE BOSS').toUpperCase() : g.boss.cn ? (names[g.boss.s] || 'THE BOSS').toUpperCase() + (g.boss.nph > 1 ? ' · PHASE ' + (g.boss.phase + 1) + '/' + g.boss.nph : '') + (g.raid ? (g.boss.weak > 0 ? ' · WEAK POINT ×2' : g.foe.some((f, i) => f && g.alive[i]) ? ' · ARMORED ×½' : ' · EXPOSED') : '') : 'THE BOSS') + ' ' + Math.ceil(g.boss.hp) + ' / ' + g.boss.mh + (g.boss.rage ? (g.boss.rage === 2 ? '  ·  ENRAGED' : '  ·  ANGRY') : ''), W/2, by + 22);
  }
  for (let i = 0; i < g.n; i++) {
    const s = A.sides[A.seatSide[i]];
    const mx = (s.A[0]+s.B[0])/2 + s.out[0]*0.14, my = (s.A[1]+s.B[1])/2 + s.out[1]*0.14;
    let [x, y] = toScr(v, mx, my);
    const x0c = x; x = clamp(x, 70, W - 70); y = clamp(y, 96, H - 56);
    if (Math.abs(x - x0c) > 24) { // no room beside this side: tuck the label under the arena's lower corner
      const a = toScr(v, s.A[0], s.A[1]), b2 = toScr(v, s.B[0], s.B[1]), lo = a[1] > b2[1] ? a : b2;
      x = clamp(lo[0], 56, W - 56); y = Math.min(H - 46, lo[1] + 44);
    }
    const col = g.alive[i] ? colOf(i, lk) : '#6B6490';
    if (g.boss && i === g.boss.s) { const bp = toScr(v, ...bossPos(g)); drawBubble(i, bp[0], bp[1] - 30); if (g.raid && g.boss.weak > 0) { ctx.save(); ctx.strokeStyle = '#FFE34A'; ctx.lineWidth = 3; ctx.globalAlpha = 0.5 + 0.5*Math.sin(clock*12); ctx.beginPath(); ctx.arc(bp[0], bp[1], 34 + 6*Math.sin(clock*6), 0, TAU); ctx.stroke(); ctx.font = '700 11px "Chakra Petch", sans-serif'; ctx.fillStyle = '#FFE34A'; ctx.fillText('WEAK POINT', bp[0], bp[1] + 50); ctx.restore(); } continue; }
    drawBubble(i, x, y - 34);
    let label = (names[i] || ('Player ' + (i+1))).toUpperCase();
    if (i === mySeat) label = label + ' · YOU';
    if (series && series.wins) label += '  ' + '★'.repeat(series.wins[i] || 0);
    if (g.lv && g.lv.rules.goal === 'stars') label += '  ★' + (g.stars ? g.stars[i] || 0 : 0) + '/' + g.lv.rules.goalV;
    ctx.font = '700 12px "Chakra Petch", system-ui, sans-serif';
    ctx.fillStyle = col; ctx.fillText(label, x, y - 10);
    if (!g.alive[i]) { ctx.fillStyle = '#6B6490'; ctx.fillText('OUT', x, y + 7); continue; }
    const n = g.lives[i], total = g.maxL[i], gap = 11, x0 = x - (total-1)*gap/2;
    for (let k = 0; k < total; k++) {
      ctx.beginPath(); ctx.arc(x0 + k*gap, y + 6, 3.6, 0, TAU);
      if (k < n) { ctx.fillStyle = col; ctx.fill(); } else { ctx.strokeStyle = 'rgba(160,150,230,0.4)'; ctx.lineWidth = 1; ctx.stroke(); }
    }
    let yy = y + 19;
    { // smash meter
      const mw = 44, full = g.sm[i] >= 1, armed = g.arm[i] > 0;
      ctx.fillStyle = 'rgba(160,150,230,0.2)'; ctx.fillRect(x - mw/2, yy - 2, mw, 4);
      ctx.fillStyle = armed ? '#FFFFFF' : full ? '#FFE34A' : 'rgba(255,227,74,0.7)'; ctx.fillRect(x - mw/2, yy - 2, mw*clamp(armed ? 1 : g.sm[i], 0, 1), 4);
      if (full || armed) { ctx.font = '700 9px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#FFE34A'; ctx.textAlign = 'left'; ctx.fillText(armed ? 'READY!' : 'SMASH', x + mw/2 + 5, yy); ctx.textAlign = 'center'; }
      yy += 12;
      if (g.he && g.he[i] !== 'none') {
        const hf = clamp(g.hc[i], 0, 1);
        ctx.fillStyle = 'rgba(160,150,230,0.2)'; ctx.fillRect(x - mw/2, yy - 6, mw, 3);
        ctx.fillStyle = hf >= 1 ? '#9FF3FF' : 'rgba(62,230,255,0.6)'; ctx.fillRect(x - mw/2, yy - 6, mw*hf, 3);
        if (hf >= 1) { ctx.font = '700 9px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#9FF3FF'; ctx.textAlign = 'left'; ctx.fillText(HEROES[g.he[i]][0].toUpperCase(), x + mw/2 + 5, yy - 5); ctx.textAlign = 'center'; }
        yy += 4;
      }
    }
    const cards = g.cards[i] || [];
    if (cards.length) {
      const cg = 9, cx0 = x - (cards.length-1)*cg/2;
      cards.forEach((id, k) => { ctx.fillStyle = RAR_COL[CARDS[id].r]; ctx.save(); ctx.translate(cx0 + k*cg, yy); ctx.rotate(Math.PI/4); ctx.fillRect(-2.6, -2.6, 5.2, 5.2); ctx.restore(); });
      yy += 13;
    }
    const tags = FX_TAGS.filter(([k]) => g.F[k][i] > 0).map(([k, t]) => k === 's' ? t + (g.F.s[i] > 1 ? ' ×' + g.F.s[i] : '') : t + ' ' + Math.ceil(g.F[k][i]));
    if (tags.length) { ctx.font = '700 10px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#F0ECFF'; ctx.fillText(tags.join(' · '), x, yy); }
  }
  if (g.ph === 'cd') {
    const n = g.t > 1.5 ? 0 : Math.ceil(g.t*2);
    const txt = n === 0 ? 'READY' : String(n);
    if (n !== lastCount && mode !== 'menu') { lastCount = n; if (n > 0) sfx.count(); }
    ctx.font = (n === 0 ? '28px' : '64px') + ' "Rubik Mono One", ui-monospace, monospace';
    ctx.fillStyle = '#F0ECFF'; ctx.globalAlpha = 0.92; ctx.fillText(txt, cx, cy); ctx.globalAlpha = 1;
  } else if (lastCount !== -1 && g.ph === 'pl') { if (mode !== 'menu') sfx.go(); lastCount = -1; }
  if (banner) {
    const t = banner.t, a = t < 0.15 ? t/0.15 : t > 1.3 ? Math.max(0, (1.7 - t)/0.4) : 1;
    const sc = t < 0.15 ? 0.6 + 0.4*(t/0.15) + 0.15*Math.sin(t/0.15*Math.PI) : 1;
    let topY = 1e9; for (const p of A.verts) topY = Math.min(topY, toScr(v, p[0], p[1])[1]);
    const by = Math.max(g.boss ? 150 : 124, Math.min(topY - (g.n >= 5 ? 110 : 70), cy - v.scale*0.42));
    ctx.save(); ctx.globalAlpha = a; ctx.translate(W/2, by); ctx.scale(sc, sc);
    ctx.font = Math.round(Math.min(34, W/11)) + 'px "Rubik Mono One", ui-monospace, monospace';
    { const tw = ctx.measureText(banner.text).width; if (tw > W - 28) ctx.scale((W - 28)/tw, (W - 28)/tw); }
    ctx.shadowColor = banner.col; ctx.shadowBlur = 20; ctx.fillStyle = banner.col; ctx.fillText(banner.text, 0, 0); ctx.shadowBlur = 0;
    ctx.font = '700 14px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#F0ECFF'; ctx.fillText(banner.sub, 0, 28);
    ctx.restore();
  }
}

