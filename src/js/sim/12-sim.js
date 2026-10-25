// ================= SIM =================
const TAU = Math.PI * 2;
const BALL_R = 0.034, INSET = 0.05, V0 = 0.95, VMAX = 2.6, ACC = 1.05, MAXA = 1.0;
// Heat: the longer a rally runs, the hotter (and faster) the ball gets. Combo: style hits raise a shared rally multiplier.
const HEAT_AT = [8, 18, 32, 50], CM_MAX = 8;
function heatOf(rh) { let h = 0; for (const v of HEAT_AT) if (rh >= v) h++; return h; }
const MAX_BALLS = 5, ITEM_R = 0.068, FIELD_R = 0.44;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const POWERS = {
  multi:  { w: 1.2, cat: 'kaos' }, giant: { w: 1, cat: 'bra' },  mini:  { w: 1, cat: 'elak' },
  ice:    { w: 0.8, cat: 'elak' }, rev:   { w: 0.8, cat: 'elak' }, shield: { w: 0.8, cat: 'bra' },
  ghost:  { w: 0.7, cat: 'kaos' }, curve: { w: 0.8, cat: 'kaos' }, turbo: { w: 0.8, cat: 'kaos' },
  heart:  { w: 0.5, cat: 'bra' },  chaos: { w: 0.6, cat: 'kaos' }
};
const POWER_KEYS = Object.keys(POWERS);
const MUTATORS = {
  lava:   ['Lava floor', 'Balls rolling over lava speed up'],
  giant:  ['Giant ball', 'The ball is twice as big'],
  invis:  ['Invisible paddles', 'Paddles are only visible near the ball'],
  wind:   ['Space wind', 'A turning wind blows across the arena'],
  upside: ['Upside down', 'The whole world is flipped'],
  slowmo: ['Slowmo', 'Everything runs at 65% speed'],
  tiny:   ['Tiny paddles', 'Tiny paddles but two extra lives'],
  storm:  ['Power-storm', 'Power-ups rain down'],
  multi:  ['Triple serve', 'Every serve is three balls'],
  portal: ['Portals', 'Two portals send the ball across the arena'],
  dark:   ['Darkness', 'Only balls and paddles glow']
};
const MUT_KEYS = Object.keys(MUTATORS);
const HEROES = {
  none:     ['None', 'No superpower'],
  kronos:   ['Kronos', 'Slows all balls for 3 seconds'],
  twin:     ['The Twin', 'A clone of your paddle for 6 seconds'],
  warden:   ['The Warden', 'A wall behind you for 5 seconds'],
  storm:    ['The Storm', 'A shockwave knocks away balls near you'],
  graviton: ['Graviton', 'Pulls balls toward your paddle for 4 seconds']
};
const HERO_CD = 18;
function seeded(seed) { let h = seed >>> 0 || 1; return () => (h = (h*1103515245 + 12345) >>> 0) / 4294967296; }
const ARENAS = { classic: 'Classic', ice: 'Ice', hole: 'Black hole', retro: 'Retro' };
const BOSS_ATTACKS = { laser: 'LASER RAIN!', wall: 'STONE WALL!', freeze: 'FREEZING!', shrink: 'SHRINK RAY!', smash: 'THE BOSS IS CHARGING!', multi: 'BULLET RAIN!', mirror: 'MIRROR TRAP!', ghost: 'GHOST FOG!' };
const BASE_ATTACKS = ['laser', 'wall', 'freeze', 'shrink', 'smash'];
// Champion Tower: one boss per floor. rate < 1 attacks more often, spd = paddle speed, err > 1 = sloppier aim, hp = health multiplier
const TOWER = [
  { n: 'The Slime King',        c: '#4FFFC4', h: 'crown',     f: 'sleepy', ar: 'classic', atk: ['wall'],                          rate: 1.3,  spd: 0.85, err: 1.45, hp: 0.8,  cards: [] },
  { n: 'The Frost Giant',       c: '#F3F0FF', h: 'horns',     f: 'angry',  ar: 'ice',     atk: ['freeze', 'wall'],                rate: 1.15, spd: 0.95, err: 1.35, hp: 0.9,  cards: ['wide'] },
  { n: 'The Twin Demon',   c: '#B57CFF', h: 'mohawk',    f: 'angry',  ar: 'classic', atk: ['laser', 'shrink'],               rate: 1.1,  spd: 1.0,  err: 1.25, hp: 1.0,  cards: ['phantom'] },
  { n: 'The Chaos King',        c: '#FF8A3D', h: 'party',     f: 'shades', ar: 'retro',   atk: ['laser', 'freeze', 'wall', 'shrink'], rate: 1.0, spd: 1.05, err: 1.2, hp: 1.0, cards: ['chaoseng'] },
  { n: 'The Laser Queen',  c: '#FF4F8B', h: 'tophat',    f: 'shades', ar: 'classic', atk: ['laser', 'multi'],                rate: 0.85, spd: 1.1,  err: 1.15, hp: 1.1,  cards: ['fire'] },
  { n: 'The Event Horizon',c: '#4A7BFF', h: 'halo',      f: 'none',   ar: 'hole',    atk: ['ghost', 'laser'],                rate: 0.9,  spd: 1.1,  err: 1.1,  hp: 1.15, cards: ['curve'] },
  { n: 'The Mirror Master',    c: '#3EE6FF', h: 'wizard',    f: 'angry',  ar: 'classic', atk: ['mirror', 'shrink', 'laser'],     rate: 0.85, spd: 1.15, err: 1.05, hp: 1.2,  cards: ['angle'] },
  { n: 'The Lightning God',        c: '#FFE34A', h: 'antenna',   f: 'angry',  ar: 'retro',   atk: ['smash', 'laser', 'freeze'],      rate: 0.75, spd: 1.2,  err: 1.0,  hp: 1.25, cards: ['fire', 'shieldgen'] },
  { n: 'The Pixel Demon',      c: '#FF5A4A', h: 'cat',       f: 'angry',  ar: 'retro',   atk: ['wall', 'mirror', 'ghost', 'multi'], rate: 0.7, spd: 1.2, err: 0.95, hp: 1.35, cards: ['split'] },
  { n: 'Champion',          c: '#FFE34A', h: 'crown',     f: 'shades', ar: 'hole',    atk: ['laser', 'multi', 'freeze', 'shrink', 'mirror', 'ghost', 'smash', 'wall'], rate: 0.65, spd: 1.25, err: 0.95, hp: 1.5, cards: ['phantom', 'fire', 'shieldgen'] }
];
function towerCfg(floor) {
  floor = Math.max(1, Math.floor(floor) || 1);
  if (floor <= TOWER.length) { const b = TOWER[floor - 1]; return { ...b, floor, hp: b.hp*0.88, err: b.err*1.08, rate: b.rate*1.08 }; } // a bit gentler than the raw table
  const k = floor - TOWER.length - 1, base = TOWER[5 + (k % 5)], cyc = 1 + Math.floor(k / 5);
  return { ...base, floor, n: base.n + ' +' + cyc, hp: base.hp*(1 + 0.2*cyc), rate: base.rate*Math.pow(0.9, cyc), spd: base.spd*(1 + 0.05*cyc), err: base.err*Math.pow(0.95, cyc) };
}
// r: c=vanlig r=sällsynt e=episk x=förbannad. u: unique (can only be owned once)
const CARDS = {
  wide:      { r: 'c', n: 'Wide paddle',    d: 'Your paddle is 15% wider.' },
  life:      { r: 'c', n: 'Extra life',      d: 'Start every match with one more life.' },
  shield:    { r: 'c', n: 'Starting shield',     d: 'Start every match with a shield.' },
  fire:      { r: 'c', n: 'Fire strike',        d: 'The ball goes 10% faster after your hits. Only yours.' },
  angle:     { r: 'c', n: 'Angle master',  d: 'Your hits get sharper angles.' },
  magnet:    { r: 'r', n: 'Magnet',         d: 'Power-ups are pulled toward balls you\'ve hit.', u: 1 },
  curve:     { r: 'r', n: 'Curveball',       d: 'Your shots curve sideways, away from you.', u: 1 },
  harden:    { r: 'r', n: 'Hardened',         d: 'Bad effects on you last half as long.' },
  amplify:   { r: 'r', n: 'Amplifier',    d: 'Good effects on you last 60% longer.' },
  split:     { r: 'e', n: 'Double strike',     d: 'Every fourth hit splits the ball in two.', u: 1 },
  slow:      { r: 'e', n: 'Slowmo zone',     d: 'Balls slow down near your paddle.', u: 1 },
  phantom:   { r: 'e', n: 'Phantom paddle',   d: 'A ghost paddle mirrors you on the other half.', u: 1 },
  shieldgen: { r: 'e', n: 'Shield generator', d: 'You get a new shield every 20 seconds.', u: 1 },
  giantpact: { r: 'x', n: 'Giant pact',      d: '45% wider paddle. But you move slowly.', u: 1 },
  glass:     { r: 'x', n: 'Glass cannon',      d: 'Your hits are 35% faster. But you have one less life.' },
  dark:      { r: 'x', n: 'Dark pact',     d: 'Fast, sharp hits. But distant balls are hard for you to see.', u: 1 },
  chaoseng:  { r: 'x', n: 'Chaos engine',      d: 'Every 9 seconds a random power-up fires. Half the time for you.', u: 1 },
  pendulum:  { r: 'x', n: 'The Pendulum',        d: 'Every other 5 seconds your paddle is huge. The rest of the time it is tiny.', u: 1 }
};
const CARD_KEYS = Object.keys(CARDS);
const RARITY = { c: 'Common', r: 'Rare', e: 'Epic', x: 'Cursed' };
function modsFrom(list) {
  const m = { w: 1, life: 0, shield: 0, hit: 1, ang: 1, magnet: false, curve: false, bad: 1, good: 1, split: false, slow: false, phantom: false, sgen: false, maxSp: Infinity, blind: false, ce: false, pend: false };
  for (const id of list || []) {
    if (id === 'wide') m.w *= 1.15;
    else if (id === 'life') m.life++;
    else if (id === 'shield') m.shield++;
    else if (id === 'fire') m.hit *= 1.1;
    else if (id === 'angle') m.ang *= 1.15;
    else if (id === 'magnet') m.magnet = true;
    else if (id === 'curve') m.curve = true;
    else if (id === 'harden') m.bad *= 0.5;
    else if (id === 'amplify') m.good *= 1.6;
    else if (id === 'split') m.split = true;
    else if (id === 'slow') m.slow = true;
    else if (id === 'phantom') m.phantom = true;
    else if (id === 'shieldgen') m.sgen = true;
    else if (id === 'giantpact') { m.w *= 1.45; m.maxSp = 1.4; }
    else if (id === 'glass') { m.hit *= 1.35; m.life--; }
    else if (id === 'dark') { m.hit *= 1.15; m.ang *= 1.2; m.blind = true; }
    else if (id === 'chaoseng') m.ce = true;
    else if (id === 'pendulum') m.pend = true;
  }
  return m;
}
function makeOffer(owned, boosted) {
  const w = boosted ? { c: 22, r: 45, e: 33 } : { c: 62, r: 30, e: 8 };
  const pool = CARD_KEYS.filter(k => !(CARDS[k].u && (owned || []).includes(k)));
  const out = [];
  for (let slot = 0; slot < 3; slot++) {
    let rar;
    if (slot === 2 && Math.random() < 0.2) rar = 'x';
    else { let r = Math.random() * (w.c + w.r + w.e); rar = r < w.c ? 'c' : r < w.c + w.r ? 'r' : 'e'; }
    let cand = pool.filter(k => CARDS[k].r === rar && !out.includes(k));
    if (!cand.length) cand = pool.filter(k => !out.includes(k) && CARDS[k].r !== 'x');
    if (!cand.length) break;
    out.push(cand[Math.floor(Math.random()*cand.length)]);
  }
  return out;
}

function makeArena(n, boss, raid) {
  let verts, owners, bump, padW;
  if (n === 2) {
    const w = 1.18, h = 1.78;
    verts = [[-w/2, h/2], [w/2, h/2], [w/2, -h/2], [-w/2, -h/2]];
    owners = [0, -1, 1, -1]; bump = 0; padW = 0.28;
  } else {
    const R = ({ 3: 1.15, 4: 1.13, 5: 1.0, 6: 0.95, 7: 0.92 })[n] || 0.92;
    verts = Array.from({ length: n }, (_, k) => { const a = Math.PI/2 + Math.PI/n - k*TAU/n; return [R*Math.cos(a), R*Math.sin(a)]; });
    const side = 2*R*Math.sin(Math.PI/n);
    padW = n === 3 ? 0.34 : n === 4 ? 0.3 : Math.min(0.28, side*0.3);
    bump = n === 3 ? 0.12 : n === 4 ? 0.1 : 0.075;
    if (raid) { // raid: core faces seat 0, its two arms flank it, players fill the rest
      const bs = Math.round(n/2), P = n - 3; let q = 0;
      owners = Array.from({ length: n }, (_, i) => i === bs ? n - 1 : i === bs - 1 ? P : i === bs + 1 ? P + 1 : q++);
    } else if (boss) { // the boss gets the side facing seat 0
      const bs = n === 3 ? 2 : Math.round(n/2); let q = 0;
      owners = Array.from({ length: n }, (_, i) => i === bs ? n - 1 : q++);
    } else owners = Array.from({ length: n }, (_, i) => i);
  }
  const sides = verts.map((A, i) => {
    const B = verts[(i+1) % verts.length];
    const dx = B[0]-A[0], dy = B[1]-A[1], len = Math.hypot(dx, dy);
    const dir = [dx/len, dy/len], out = [-dir[1], dir[0]];
    return { A, B, len, dir, out, d: A[0]*out[0] + A[1]*out[1], owner: owners[i] };
  });
  const seatSide = [];
  sides.forEach((s, i) => { if (s.owner >= 0) seatSide[s.owner] = i; });
  return { n, verts, sides, seatSide, bump, padW, margin: bump ? bump*0.9 : 0 };
}
function padW(st, i) {
  const s = st.arena.sides[st.arena.seatSide[i]];
  const pend = st.mods[i].pend ? (Math.floor((st.mt || 0) / 5) % 2 ? 0.55 : 1.7) : 1;
  const bossW = (st.boss && i === st.boss.s ? 1.5 : 1) * (st.mut === 'tiny' ? 0.6 : 1);
  return Math.min(s.len*0.6, st.arena.padW * bossW * (st.lv ? st.lv.rules.paddle : 1) * st.mods[i].w * pend * (st.F.g[i] > 0 ? 1.6 : 1) * (st.F.m[i] > 0 ? 0.6 : 1));
}
function padRange(A, s, w) { return Math.max(0.01, s.len/2 - A.margin - w/2); }
function padCenter(A, s, u, w) { return s.len/2 + u * padRange(A, s, w); }

function newGame(n, lives, cards, opt) {
  opt = opt || {};
  const LV = opt.lvl ? cleanLevel(opt.lvl) : null;
  if (LV) { lives = LV.rules.lives; opt = { ...opt, ar: LV.ar, mut: LV.rules.pu === 'storm' ? 'storm' : opt.mut }; }
  const z = () => Array(n).fill(0);
  const cfg = opt.bcfg ? opt.bcfg : opt.tower ? towerCfg(opt.tower) : opt.weekly ? weeklyCfg() : null;
  if (cfg) { opt = { ...opt, boss: true, ar: cfg.ar, hpMul: cfg.hp }; }
  const cl = Array.from({ length: n }, (_, i) => (cards && Array.isArray(cards[i]) ? cards[i].filter(k => CARDS[k]) : []));
  if (cfg) cl[n - 1] = cfg.cards.slice();
  const mods = cl.map(modsFrom);
  const L = mods.map((m, i) => opt.livesArr && opt.livesArr[i] != null ? Math.max(1, opt.livesArr[i]) : Math.max(1, lives + m.life + (opt.mut === 'tiny' ? 2 : 0)));
  const boss = opt.boss ? { s: n - 1, hp: Math.round((10 + 5*Math.min(n - 1, 2) + 2*Math.max(0, n - 3)) * (opt.hpMul || 1)), mh: Math.round((10 + 5*Math.min(n - 1, 2) + 2*Math.max(0, n - 3)) * (opt.hpMul || 1)), at: 7, rage: 0 } : null;
  if (boss) {
    L[boss.s] = 1;
    boss.floor = cfg && opt.tower ? cfg.floor : 0; boss.wk = !!opt.weekly; boss.cn = cfg ? cfg.n : null; boss.lk = cfg ? { c: cfg.c, h: cfg.h, f: cfg.f, t: 'fire', s: 'solid' } : null; boss.atk = cfg ? cfg.atk : BASE_ATTACKS; boss.rate = cfg ? cfg.rate : 1;
    boss.spd = cfg ? cfg.spd : 1; boss.err = cfg ? cfg.err : 1;
    if (opt.bossHp) boss.hp = boss.mh = Math.round(opt.bossHp);
    boss.q = Array.isArray(opt.bossQ) ? opt.bossQ.map(x => ({ ...x })) : []; boss.phase = 0; boss.nph = 1 + boss.q.length;
  }
  const st0 = {
    n, arena: makeArena(n, !!opt.boss, !!opt.raid), balls: [], nid: 1, mid: opt.mid || Math.floor(Math.random()*1e9),
    pads: z(), padSpeed: Array(n).fill(Infinity),
    lives: L.slice(), maxL: L.slice(), alive: Array(n).fill(true), cards: cl, mods,
    ph: 'cd', t: 2.2, hits: 0, goals: 0, lastGoal: -1, last: -1, winner: -1,
    serveTo: Math.floor(Math.random()*n), sinceHit: 0, k: 0,
    items: [], obs: [], itemT: 4, obsT: 9,
    F: { g: z(), m: z(), i: z(), r: z(), s: mods.map(m => Math.min(3, m.shield)) }, ghost: 0, curve: 0, curveDir: 1,
    sc: 0, best: 0, tot: 0, rallyT: 0, pk: [0, '', -1], rh: 0, cm: 1, sh: z(), sg: z(), ce: z(), mt: 0,
    sm: z(), arm: z(), lgs: -1, ar: ARENAS[opt.ar] ? opt.ar : 'classic', boss,
    mut: MUTATORS[opt.mut] ? opt.mut : null, br: opt.mut === 'giant' ? BALL_R*2 : BALL_R, lava: [], portals: null,
    he: Array.from({ length: n }, (_, i) => (opt.heroes && HEROES[opt.heroes[i]]) ? opt.heroes[i] : 'none'),
    hc: z(), slowT: 0, clone: z(), wall: z(), grav: z(),
    hl: Array.from({ length: n }, (_, i) => clamp(Math.floor((opt.heroLv && opt.heroLv[i]) || 1), 1, 10)),
    hv: Array.from({ length: n }, (_, i) => (opt.heroVar && ['std', 'gold', 'shadow'].includes(opt.heroVar[i])) ? opt.heroVar[i] : 'std'),
    foe: Array.from({ length: n }, (_, i) => !!(opt.foes && opt.foes.includes(i))), surv: opt.surv || 0, solo: !!opt.solo, bsw: 0, ffs: opt.ffs !== false, raid: opt.raid || null, lv: LV ? levelRuntime(LV) : null, stars: z()
  };
  if (st0.raid && st0.boss) { st0.boss.weak = 0; st0.boss.wcd = 9; st0.boss.armL = opt.livesArr ? opt.livesArr[n - 2] : 3; }
  if (st0.mut) st0.t = 4.6;
  initMut(st0);
  return st0;
}
function initMut(st0) {
  st0.lava = []; st0.portals = null; st0.br = (st0.mut === 'giant' ? BALL_R*2 : BALL_R) * (st0.lv ? st0.lv.rules.size : 1);
  const rnd = seeded(st0.mid + (st0.mut || '').length*7919);
  if (st0.mut === 'lava') for (let k = 0; k < 3; k++) { const a = rnd()*TAU, r = 0.15 + rnd()*0.3; st0.lava.push([Math.cos(a)*r, Math.sin(a)*r, 0.09 + rnd()*0.05]); }
  if (st0.mut === 'portal') { const a = rnd()*Math.PI; st0.portals = [[Math.cos(a)*0.33, Math.sin(a)*0.33], [-Math.cos(a)*0.33, -Math.sin(a)*0.33]]; }
  return st0;
}
function aliveSeats(st) { const r = []; st.alive.forEach((a, i) => a && r.push(i)); return r; }
function alivePlayers(st) { return aliveSeats(st).filter(i => (!st.boss || i !== st.boss.s) && !(st.foe && st.foe[i])); }
function trySmash(st, i) {
  if (!st || !st.alive[i] || st.sm[i] < 1 || st.arm[i] > 0 || st.ph === 'ov') return false;
  st.sm[i] = 0; st.arm[i] = 6; return true;
}
function bossSpeed(st) { return (1.1 + 0.3*st.boss.rage) * (st.boss.spd || 1); }
function bossPos(st) {
  const A = st.arena, s = A.sides[A.seatSide[st.boss.s]], w = padW(st, st.boss.s), c = padCenter(A, s, st.pads[st.boss.s], w);
  return [s.A[0] + s.dir[0]*c - s.out[0]*(INSET + 0.06), s.A[1] + s.dir[1]*c - s.out[1]*(INSET + 0.06)];
}
function bossAttack(st, ev) {
  const B = st.boss, pl = alivePlayers(st); if (!pl.length) return;
  const type = pick(B.atk || BASE_ATTACKS), F = st.F, M = st.mods;
  if (type === 'laser') {
    const [x, y] = bossPos(st);
    for (let k = 0; k < 2 && st.balls.length < MAX_BALLS; k++) {
      const b = { id: st.nid++, x, y, vx: 0, vy: 0, cu: 0, cd: 1, co: -1, bo: 1, sx: -1 };
      aimBall(st, b, pick(pl), 1.25 + 0.15*B.rage); st.balls.push(b);
    }
  } else if (type === 'multi') {
    const [x, y] = bossPos(st);
    for (let k = 0; k < 3 && st.balls.length < MAX_BALLS + 1; k++) {
      const b = { id: st.nid++, x, y, vx: 0, vy: 0, cu: 0, cd: 1, co: -1, bo: 1, sx: -1 };
      aimBall(st, b, pick(pl), 1.1 + 0.1*B.rage); st.balls.push(b);
    }
  } else if (type === 'mirror') pl.forEach(o => F.r[o] = Math.max(F.r[o], 3 * M[o].bad));
  else if (type === 'ghost') st.ghost = Math.max(st.ghost, 4);
  else if (type === 'wall') { for (let k = 0; k < 3 && st.obs.length < 5; k++) spawnObs(st); }
  else if (type === 'freeze') pl.forEach(o => F.i[o] = Math.max(F.i[o], 2.5 * M[o].bad));
  else if (type === 'shrink') pl.forEach(o => { F.m[o] = Math.max(F.m[o], 4 * M[o].bad); F.g[o] = 0; });
  else if (type === 'smash') { st.arm[B.s] = 6; }
  st.pk = [st.pk[0] + 1, 'boss:' + type, B.s];
  ev('battack', B.s, 0, 0, null, type);
}
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function aimBall(st, b, seat, speed) {
  const s = st.arena.sides[st.arena.seatSide[seat]];
  const tx = (s.A[0]+s.B[0])/2, ty = (s.A[1]+s.B[1])/2;
  let dx = tx - b.x, dy = ty - b.y; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
  const j = (Math.random()*2 - 1) * 0.42, c = Math.cos(j), sn = Math.sin(j);
  b.vx = speed * (dx*c - dy*sn); b.vy = speed * (dx*sn + dy*c);
}
function serve(st) {
  const al = aliveSeats(st);
  const seat = st.alive[st.serveTo] ? st.serveTo : pick(al);
  const b = { id: st.nid++, x: 0, y: 0, vx: 0, vy: 0, cu: 0, cd: 1, co: -1, bo: 1, sx: -1 };
  aimBall(st, b, seat, V0); st.balls = [b]; st.sinceHit = 0; st.gb = !st.boss && Math.random() < 0.07 ? b.id : -1;
  const extra = st.lv ? [[], [0.5], [0.55, -0.55]][st.lv.rules.serve - 1] : st.mut === 'multi' ? [0.55, -0.55] : [];
  for (const a of extra) {
    const c = Math.cos(a), sn = Math.sin(a);
    st.balls.push({ id: st.nid++, x: 0, y: 0, vx: b.vx*c - b.vy*sn, vy: b.vx*sn + b.vy*c, cu: 0, cd: 1, co: -1, bo: 1, sx: -1 });
  }
}
function useHero(st, i, ev) {
  if (!st || !st.alive[i] || st.ph !== 'pl' || st.hc[i] < 1 || st.he[i] === 'none') return false;
  st.hc[i] = 0;
  const h = st.he[i], A = st.arena, s = A.sides[A.seatSide[i]], pw = 1 + 0.06*((st.hl ? st.hl[i] : 1) - 1);
  if (h === 'kronos') st.slowT = 3*pw;
  else if (h === 'twin') st.clone[i] = 6*pw;
  else if (h === 'warden') st.wall[i] = 5*pw;
  else if (h === 'graviton') st.grav[i] = 4*pw;
  else if (h === 'storm') {
    for (const b of st.balls) {
      const p = b.x*s.out[0] + b.y*s.out[1], vn = b.vx*s.out[0] + b.vy*s.out[1];
      if (p > s.d - 0.75*pw && vn > 0) { b.vx -= 2*vn*s.out[0]; b.vy -= 2*vn*s.out[1]; b.sx = -1; b.cu = 0; }
    }
  }
  if (ev) ev('hero', i, 0, 0, null, h);
  return true;
}
// Raid boons: between phases the team votes for one of three.
const BOONS = {
  overload: ['Overload', 'The core takes double damage for 20 seconds once play starts.', '⚡'],
  mend: ['Second wind', 'Everyone on the team gets +1 life.', '❤'],
  scrap: ['Scrap the arms', 'The arms that just grew back break again.', '🔧'],
  calm: ['Jam the weapons', 'The boss attacks half as often this phase.', '🛡'],
  charge: ['Full charge', 'Every supersmash on the team is charged and ready.', '💥'],
  crack: ['Crack the shell', 'The weak spot opens as soon as play starts, for 10 seconds.', '🎯']
};
function rollBoons(st, nx) {
  const pool = Object.keys(BOONS).filter(k => k !== 'scrap' || nx.regrow);
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3);
}
function applyBoon(st, k) {
  const B = st.boss, pl = alivePlayers(st);
  if (k === 'overload') B.dbl = 20;
  else if (k === 'mend') for (const i of pl) { st.lives[i]++; st.maxL[i] = Math.max(st.maxL[i], st.lives[i]); }
  else if (k === 'scrap') for (let i = 0; i < st.n; i++) { if (st.foe[i] && st.alive[i]) { st.alive[i] = false; st.lives[i] = 0; } }
  else if (k === 'calm') { B.rate = (B.rate || 1)*2; B.at = Math.max(B.at, 10); }
  else if (k === 'charge') for (const i of pl) st.sm[i] = 1;
  else if (k === 'crack') { B.weak = 10; B.wcd = 12; }
}
function scoreGoal(st, seat, ball) {
  st.balls = st.balls.filter(b => b !== ball);
  st.lgs = ball.sx >= 0 ? ball.sx : -1;
  if (st.boss && seat === st.boss.s) {
    const B = st.boss;
    const armsUp = st.raid && st.foe.some((f, i) => f && st.alive[i]);
    B.hp = Math.max(0, B.hp - (ball.sx >= 0 ? 10 : 5) * (armsUp ? 0.5 : 1) * (st.raid && B.weak > 0 ? 2 : 1) * (B.dbl > 0 ? 2 : 1)); st.goals++; st.lastGoal = seat;
    B.rage = B.hp / B.mh < 0.33 ? 2 : B.hp / B.mh < 0.66 ? 1 : 0;
    if (B.hp <= 0 && B.q && B.q.length) { // next boss phase steps in
      const nx = B.q.shift(); B.phase++;
      B.cn = nx.n; B.lk = { c: nx.c, h: nx.h, f: nx.f, t: nx.t || 'fire', s: nx.s || 'solid' }; B.atk = nx.atk; B.rate = nx.rate; B.spd = nx.spd; B.err = nx.err;
      B.hp = B.mh = Math.round(nx.hpAbs || 15); B.rage = 0; B.at = 6;
      st.tot += Math.round(st.sc); st.best = Math.max(st.best, Math.round(st.sc)); st.sc = 0; st.rallyT = 0; st.rh = 0; st.cm = 1;
      st.balls = []; st.obs = []; st.ph = 'cd'; st.t = 3.2; st.bsw++; st.serveTo = pick(alivePlayers(st));
      if (nx.regrow) for (let i = 0; i < st.n; i++) if (st.foe[i]) { st.alive[i] = true; st.lives[i] = st.maxL[i] = B.armL || 3; }
      if (nx.mut) { st.mut = nx.mut; initMut(st); }
      if (st.raid) { B.weak = 0; B.wcd = 8; B.dbl = 0; st.t = 12; st.vote = { r: B.phase, o: rollBoons(st, nx), v: {}, done: -1 }; }
      return;
    }
    if (B.hp <= 0) { st.tot += Math.round(st.sc); st.best = Math.max(st.best, Math.round(st.sc)); st.ph = 'ov'; st.winner = -2; st.balls = []; return; }
    if (st.balls.length === 0) { st.ph = 'cd'; st.t = 1.5; st.serveTo = pick(alivePlayers(st)); }
    return;
  }
  st.sm[seat] = Math.min(1, st.sm[seat] + 0.25);
  st.lives[seat] = Math.max(0, st.lives[seat] - 1); st.goals++; st.lastGoal = seat;
  st.tot += Math.round(st.sc); st.best = Math.max(st.best, Math.round(st.sc)); st.sc = 0; st.rallyT = 0; st.rh = 0; st.cm = 1;
  if (st.lives[seat] === 0) { st.alive[seat] = false; for (const k in st.F) st.F[k][seat] = 0; }
  const al = aliveSeats(st), pl = alivePlayers(st);
  if (st.boss ? pl.length === 0 : (al.length <= 1 || (st.solo && !st.alive[0]))) { st.ph = 'ov'; st.winner = st.boss ? st.boss.s : st.alive[0] && al.length <= 1 ? 0 : (al.filter(i => i !== 0)[0] ?? (al.length ? al[0] : -1)); st.balls = []; return; }
  if (st.balls.length === 0) {
    st.ph = 'cd'; st.t = 1.5;
    st.serveTo = st.alive[seat] ? seat : pick(st.boss ? pl : al);
  }
}
function randomSpot(st, minFromBalls) {
  for (let k = 0; k < 14; k++) {
    const a = Math.random()*TAU, r = 0.16 + Math.sqrt(Math.random()) * (FIELD_R - 0.16);
    const x = Math.cos(a)*r, y = Math.sin(a)*r;
    if (st.balls.every(b => Math.hypot(b.x-x, b.y-y) > minFromBalls) &&
        st.obs.every(o => Math.hypot(o.x-x, o.y-y) > o.r + 0.12) &&
        st.items.every(i => Math.hypot(i.x-x, i.y-y) > 0.16)) return [x, y];
  }
  return null;
}
function spawnItem(st) {
  const sp = levelSpot(st);
  const p = sp ? [sp.x, sp.y] : randomSpot(st, 0.2); if (!p) return;
  let tot = 0; for (const k of POWER_KEYS) tot += POWERS[k].w;
  let r = Math.random()*tot, type = POWER_KEYS[0];
  for (const k of POWER_KEYS) { r -= POWERS[k].w; if (r <= 0) { type = k; break; } }
  st.items.push({ id: st.nid++, x: p[0], y: p[1], type, life: 12 });
}
function spawnObs(st) {
  const p = randomSpot(st, 0.25); if (!p) return;
  const a = Math.random()*TAU, sp = 0.04 + Math.random()*0.08;
  st.obs.push({ id: st.nid++, x: p[0], y: p[1], r: 0.05 + Math.random()*0.035, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 13, age: 0 });
}
function applyPower(st, type, ball, forced) {
  const al = aliveSeats(st), F = st.F, M = st.mods;
  const s = forced >= 0 && st.alive[forced] ? forced : st.last >= 0 && st.alive[st.last] ? st.last : pick(al);
  const others = al.filter(i => i !== s);
  if (type === 'multi') {
    for (const a of [0.5, -0.5]) {
      if (st.balls.length >= MAX_BALLS) break;
      const c = Math.cos(a), sn = Math.sin(a);
      st.balls.push({ id: st.nid++, x: ball.x, y: ball.y, vx: ball.vx*c - ball.vy*sn, vy: ball.vx*sn + ball.vy*c, cu: 0, cd: 1, co: -1, bo: ball.bo || 1, sx: ball.sx ?? -1 });
    }
  } else if (type === 'giant') { F.g[s] = 9 * M[s].good; F.m[s] = 0; }
  else if (type === 'mini') others.forEach(o => { F.m[o] = 8 * M[o].bad; F.g[o] = 0; });
  else if (type === 'ice') others.forEach(o => F.i[o] = 6 * M[o].bad);
  else if (type === 'rev') others.forEach(o => F.r[o] = 6 * M[o].bad);
  else if (type === 'shield') F.s[s] = Math.min(3, F.s[s] + 1);
  else if (type === 'ghost') st.ghost = 5;
  else if (type === 'curve') { st.curve = 6; st.curveDir = Math.random() < 0.5 ? -1 : 1; }
  else if (type === 'turbo') st.balls.forEach(b => { const sp = Math.hypot(b.vx, b.vy) || V0, ns = Math.min(VMAX*1.25, sp*1.4); b.vx *= ns/sp; b.vy *= ns/sp; });
  else if (type === 'heart') st.lives[s] = Math.min(st.maxL[s], st.lives[s] + 1);
  else if (type === 'chaos') {
    st.balls.forEach(b => { const sp = Math.max(V0, Math.hypot(b.vx, b.vy)), a = Math.random()*TAU; b.vx = Math.cos(a)*sp; b.vy = Math.sin(a)*sp; });
    for (let k = 0; k < 2 && st.obs.length < 4; k++) spawnObs(st);
  }
  st.pk = [st.pk[0] + 1, type, s];
  return s;
}

function iceKick(b) { const sp = Math.hypot(b.vx, b.vy) || 1, ns = Math.min(VMAX*1.2, sp*1.05); b.vx *= ns/sp; b.vy *= ns/sp; }
function stepSim(st, dt, targets, opts) {
  const A = st.arena, F = st.F, M = st.mods, ev = opts.onEvent || (() => {}), host = !opts.follower, BR = st.br || BALL_R;
  if (st.mut === 'slowmo' && st.ph === 'pl') dt *= 0.65;
  st.slowT = Math.max(0, st.slowT - dt);
  for (let i = 0; i < st.n; i++) { st.clone[i] = Math.max(0, st.clone[i] - dt); st.wall[i] = Math.max(0, st.wall[i] - dt); st.grav[i] = Math.max(0, st.grav[i] - dt); }
  if (st.ph === 'pl') for (let i = 0; i < st.n; i++) if (st.he[i] !== 'none' && st.alive[i]) st.hc[i] = Math.min(1, st.hc[i] + dt / (HERO_CD - 0.6*((st.hl ? st.hl[i] : 1) - 1)));
  for (const k of ['g', 'm', 'i', 'r']) for (let i = 0; i < st.n; i++) F[k][i] = Math.max(0, F[k][i] - dt);
  st.ghost = Math.max(0, st.ghost - dt); st.curve = Math.max(0, st.curve - dt);
  for (let i = 0; i < st.n; i++) st.arm[i] = Math.max(0, st.arm[i] - dt);
  for (let i = 0; i < st.n; i++) {
    const t = targets[i]; if (t == null || !st.alive[i]) continue;
    const mx = Math.min(st.padSpeed[i], M[i].maxSp, F.i[i] > 0 ? 0.9 : Infinity), d = clamp(t, -1, 1) - st.pads[i];
    st.pads[i] += Math.abs(d) <= mx*dt ? d : Math.sign(d)*mx*dt;
  }
  for (const o of st.obs) {
    o.age += dt; o.life -= dt; o.x += o.vx*dt; o.y += o.vy*dt;
    const r = Math.hypot(o.x, o.y);
    if (r > FIELD_R && (o.x*o.vx + o.y*o.vy) > 0) { const nx = o.x/r, ny = o.y/r, vn = o.vx*nx + o.vy*ny; o.vx -= 2*vn*nx; o.vy -= 2*vn*ny; }
  }
  st.obs = st.obs.filter(o => o.life > 0);
  const magnets = []; for (let i = 0; i < st.n; i++) if (M[i].magnet && st.alive[i]) magnets.push(i);
  for (const it of st.items) {
    it.life -= dt;
    if (st.ph === 'pl' && magnets.includes(st.last) && st.balls.length) {
      let nb = null, nd = 1e9;
      for (const b of st.balls) { const d = Math.hypot(b.x - it.x, b.y - it.y); if (d < nd) { nd = d; nb = b; } }
      if (nb && nd > 0.02) { it.x += (nb.x - it.x)/nd*0.3*dt; it.y += (nb.y - it.y)/nd*0.3*dt; }
    }
  }
  st.items = st.items.filter(it => it.life > 0);
  if (st.ph === 'cd') {
    st.t -= dt;
    if (st.t > 0) return;
    st.t = 0;
    if (!host) return;
    st.ph = 'pl'; serve(st);
  }
  if (st.ph !== 'pl') return;
  st.rallyT += dt; st.mt += dt;
  if (st.lv) { stepLevelFrame(st, dt, ev, host); if (st.ph !== 'pl') return; }
  if (st.surv && host && st.mt >= st.surv && st.alive[0]) { st.tot += Math.round(st.sc); st.best = Math.max(st.best, Math.round(st.sc)); st.ph = 'ov'; st.winner = 0; st.balls = []; ev('survived', 0, 0, 0); return; }
  st.sc += dt * 10 * (1 + st.rallyT/5) * Math.max(1, st.balls.length) * (st.cm || 1);
  if (host) {
    st.itemT -= dt; if (st.itemT <= 0 && !(st.lv && st.lv.rules.pu === 'off')) { const storm = st.mut === 'storm'; st.itemT = storm ? 1.6 + Math.random()*1.5 : 5 + Math.random()*4; if (st.items.length < (storm ? 4 : 2)) spawnItem(st); }
    st.obsT -= dt; if (st.obsT <= 0 && !st.lv) { st.obsT = 9 + Math.random()*6; if (st.obs.length < 2) spawnObs(st); }
    st.sinceHit += dt;
    if (st.sinceHit > 7) { const al = aliveSeats(st); st.balls.forEach(b => aimBall(st, b, pick(al), Math.max(V0, Math.hypot(b.vx, b.vy)))); st.sinceHit = 0; }
    if (st.raid && st.boss && st.boss.heal && st.boss.weak <= 0 && st.boss.hp > 0) st.boss.hp = Math.min(st.boss.mh, st.boss.hp + st.boss.heal*dt);
    if (st.raid && st.boss && st.boss.dbl > 0) st.boss.dbl = Math.max(0, st.boss.dbl - dt);
    if (st.raid && st.boss) { const B = st.boss; if (B.weak > 0) B.weak = Math.max(0, B.weak - dt); else { B.wcd -= dt; if (B.wcd <= 0) { B.weak = 6; B.wcd = 10 + Math.random()*3; ev('weak', B.s, 0, 0); } } }
    if (st.boss) { st.boss.at -= dt; if (st.boss.at <= 0) { st.boss.at = (9 - 2*st.boss.rage)*(st.boss.rate || 1) + Math.random()*2; bossAttack(st, ev); } }
    for (let i = 0; i < st.n; i++) if (M[i].ce && st.alive[i] && st.balls.length) {
      st.ce[i] += dt;
      if (st.ce[i] >= 9) {
        st.ce[i] = 0;
        const others = aliveSeats(st).filter(o => o !== i);
        const who = Math.random() < 0.5 || !others.length ? i : pick(others);
        const type = pick(POWER_KEYS), b0 = st.balls[0];
        const got = applyPower(st, type, b0, who);
        ev('pick', got, b0.x, b0.y, b0, type);
      }
    }
    for (let i = 0; i < st.n; i++) if (M[i].sgen && st.alive[i]) {
      st.sg[i] += dt;
      if (st.sg[i] >= 20) { st.sg[i] = 0; if (F.s[i] < 1) { F.s[i] = 1; ev('sgen', i, 0, 0); } }
    }
  }
  const slowSides = []; for (let i = 0; i < st.n; i++) if (M[i].slow && st.alive[i]) slowSides.push(A.sides[A.seatSide[i]]);
  const bspd = st.lv ? st.lv.rules.speed : 1;
  let maxSp = 0; for (const b of st.balls) maxSp = Math.max(maxSp, Math.hypot(b.vx, b.vy)*bspd);
  const steps = Math.max(1, Math.ceil(maxSp * dt / 0.006)), h = dt / steps;
  for (let k = 0; k < steps; k++) {
    for (const b of st.balls.slice()) {
      if (st.ph !== 'pl') return;
      if (st.curve > 0) { const a = st.curveDir*1.7*h, c = Math.cos(a), sn = Math.sin(a), vx = b.vx; b.vx = vx*c - b.vy*sn; b.vy = vx*sn + b.vy*c; }
      if (b.cu > 0) {
        const a = b.cd*1.1*h, c = Math.cos(a), sn = Math.sin(a), vx = b.vx, vy = b.vy;
        b.vx = vx*c - vy*sn; b.vy = vx*sn + vy*c; b.cu -= h;
        if (b.co >= 0 && st.alive[b.co]) { // never let the bend turn the ball back toward the hitter
          const hs = A.sides[A.seatSide[b.co]], sp = Math.hypot(b.vx, b.vy) || 1;
          if ((b.vx*hs.out[0] + b.vy*hs.out[1]) / sp > -0.45) { b.vx = vx; b.vy = vy; b.cu = 0; }
        }
      }
      let f = 1;
      for (const s of slowSides) { if (b.vx*s.out[0] + b.vy*s.out[1] > 0 && b.x*s.out[0] + b.y*s.out[1] > s.d - INSET - 0.38) f = 0.6; }
      if (st.ar === 'hole') { const r = Math.hypot(b.x, b.y); if (r > 0.08) { b.vx -= b.x/r*0.38*h; b.vy -= b.y/r*0.38*h; } }
      if (st.mut === 'wind') { const wa = st.mt*0.45; b.vx += Math.cos(wa)*0.3*h; b.vy += Math.sin(wa)*0.3*h; }
      if (st.slowT > 0) f *= 0.45;
      for (let gi = 0; gi < st.n; gi++) if (st.grav[gi] > 0 && st.alive[gi]) {
        const gs2 = A.sides[A.seatSide[gi]], vn = b.vx*gs2.out[0] + b.vy*gs2.out[1];
        if (vn > 0 && b.x*gs2.out[0] + b.y*gs2.out[1] > gs2.d - 0.95) {
          const along = (b.x - gs2.A[0])*gs2.dir[0] + (b.y - gs2.A[1])*gs2.dir[1];
          const c = padCenter(A, gs2, st.pads[gi], padW(st, gi)), pull = clamp((c - along)*4, -2, 2);
          b.vx += gs2.dir[0]*pull*h; b.vy += gs2.dir[1]*pull*h;
        }
      }
      if (st.lava.length) {
        let inL = false;
        for (const L of st.lava) if (Math.hypot(b.x - L[0], b.y - L[1]) < L[2]) inL = true;
        if (inL && !b.inL) { const sp = Math.hypot(b.vx, b.vy) || 1, ns = Math.min(VMAX*1.3, sp*1.25); b.vx *= ns/sp; b.vy *= ns/sp; ev('lava', -1, b.x, b.y, b); }
        b.inL = inL;
      }
      if (st.portals) {
        b.pc = Math.max(0, (b.pc || 0) - h);
        for (let pi = 0; pi < 2 && !(b.pc > 0); pi++) {
          const P = st.portals[pi], Q = st.portals[1 - pi];
          if (Math.hypot(b.x - P[0], b.y - P[1]) < 0.06) { b.x = Q[0]; b.y = Q[1]; b.pc = 0.6; ev('portal', -1, Q[0], Q[1], b); }
        }
      }
      b.x += b.vx*h*f*bspd; b.y += b.vy*h*f*bspd;
      if (A.bump > 0) for (const v of A.verts) {
        const dx = b.x - v[0], dy = b.y - v[1], dd = Math.hypot(dx, dy), R = A.bump + BR;
        if (dd < R && dd > 1e-6) {
          const nx = dx/dd, ny = dy/dd, vn = b.vx*nx + b.vy*ny;
          if (vn < 0) { b.vx -= 2*vn*nx; b.vy -= 2*vn*ny; if (st.ar === 'ice') iceKick(b); b.cu = 0; ev('bump', -1, b.x, b.y, b); }
          b.x = v[0] + nx*R; b.y = v[1] + ny*R;
        }
      }
      for (const o of st.obs) {
        if (o.age < 1) continue;
        const dx = b.x - o.x, dy = b.y - o.y, dd = Math.hypot(dx, dy), R = o.r + BR;
        if (dd < R && dd > 1e-6) {
          const nx = dx/dd, ny = dy/dd, vn = (b.vx - o.vx)*nx + (b.vy - o.vy)*ny;
          if (vn < 0) { b.vx -= 2*vn*nx; b.vy -= 2*vn*ny; if (st.ar === 'ice') iceKick(b); b.cu = 0; ev('rock', -1, b.x, b.y, b); }
          b.x = o.x + nx*R; b.y = o.y + ny*R;
        }
      }
      if (st.lv && stepLevelBall(st, b, h, ev, host, BR)) return;
      if (host) for (const it of st.items.slice()) {
        if (Math.hypot(b.x - it.x, b.y - it.y) < ITEM_R + BR) {
          st.items = st.items.filter(x => x !== it);
          const who = applyPower(st, it.type, b);
          ev('pick', who, it.x, it.y, b, it.type); st.cm = Math.min(CM_MAX, (st.cm || 1) + 0.1);
        }
      }
      let gone = false;
      for (const s of A.sides) {
        const p = b.x*s.out[0] + b.y*s.out[1], vn = b.vx*s.out[0] + b.vy*s.out[1];
        const seat = s.owner, live = seat >= 0 && st.alive[seat];
        if (!live) {
          const plane = s.d - (seat < 0 ? 0 : INSET);
          if (p > plane - BR && vn > 0) {
            b.vx -= 2*vn*s.out[0]; b.vy -= 2*vn*s.out[1];
            const push = p - (plane - BR); b.x -= push*s.out[0]; b.y -= push*s.out[1];
            if (st.ar === 'ice') iceKick(b); b.cu = 0; ev('wall', -1, b.x, b.y, b);
          }
          continue;
        }
        const face = s.d - INSET;
        if (vn > 0 && p > face - BR && p < face + BR*0.6) {
          const along = (b.x - s.A[0])*s.dir[0] + (b.y - s.A[1])*s.dir[1];
          const w = padW(st, seat), m = M[seat], slack = (opts.slack && opts.slack[seat]) || 0;
          const pads = [[padCenter(A, s, st.pads[seat], w), w/2]];
          if (m.phantom || st.clone[seat] > 0) pads.push([padCenter(A, s, -st.pads[seat], w), w*0.375]);
          let hit = null;
          for (const [c, hw] of pads) if (Math.abs(along - c) < hw + slack + BR) { hit = [c, hw]; break; }
          if (hit) {
            const off = clamp((along - hit[0]) / hit[1], -1, 1), a = clamp(off * MAXA * m.ang, -1.3, 1.3);
            const cur = Math.hypot(b.vx, b.vy) / (b.bo || 1); // strip the previous hitter's boost
            const hb = heatOf(st.rh), sp = Math.min(Math.max(VMAX*(1 + 0.06*hb), cur*0.97), Math.max(cur, V0) * ACC) * m.hit;
            let spx = sp; b.bo = m.hit; b.sx = -1;
            if (st.arm[seat] > 0) { st.arm[seat] = 0; spx = sp*1.55; b.bo = m.hit*1.55; b.sx = seat; }
            st.sm[seat] = Math.min(1, st.sm[seat] + (st.boss && seat === st.boss.s ? 0.05 : 0.1));
            b.vx = spx * (-s.out[0]*Math.cos(a) + s.dir[0]*Math.sin(a));
            b.vy = spx * (-s.out[1]*Math.cos(a) + s.dir[1]*Math.sin(a));
            const push = p - (face - BR); b.x -= push*s.out[0]; b.y -= push*s.out[1];
            st.hits++; st.last = seat; st.sinceHit = 0; st.rh++; st.sh[seat]++; b.lh = seat;
            { // combo: every return counts, style counts more
              const hn = heatOf(st.rh); let add = 0.03, tag = '';
              if (Math.abs(off) > 0.82) { add += 0.1; tag = 'EDGE'; }
              if (b.sx === seat) { add += 0.25; tag = 'SMASH'; }
              else if (cur > VMAX*0.95) { add += 0.04; tag = tag || 'FAST'; }
              if (hn > hb) add += 0.2;
              st.cm = Math.min(CM_MAX, (st.cm || 1) + add);
              if (tag) ev('combo', seat, b.x, b.y, b, tag);
              if (hn > hb) ev('heat', seat, b.x, b.y, b, hn);
            }
            st.sc += 15 * (1 + st.rh*0.15) * (st.cm || 1);
            if (m.curve) {
              // bend toward the side the shot already leans to, so it gets harder to reach
              const lean = Math.abs(off) < 0.15 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(off);
              const tx = b.vx*Math.cos(0.1) - b.vy*Math.sin(0.1), ty = b.vx*Math.sin(0.1) + b.vy*Math.cos(0.1);
              const plus = (tx*s.dir[0] + ty*s.dir[1]) * lean > (b.vx*s.dir[0] + b.vy*s.dir[1]) * lean;
              b.cu = 0.75; b.cd = plus ? 1 : -1; b.co = seat;
            } else { b.cu = 0; b.co = -1; }
            ev('hit', seat, b.x, b.y, b);
            if (b.sx === seat) ev('smash', seat, b.x, b.y, b);
            if (host && m.split && st.sh[seat] % 4 === 0 && st.balls.length < MAX_BALLS) {
              const c = Math.cos(0.38), sn = Math.sin(0.38);
              st.balls.push({ id: st.nid++, x: b.x, y: b.y, vx: b.vx*c - b.vy*sn, vy: b.vx*sn + b.vy*c, cu: b.cu, cd: b.cd, co: b.co, bo: b.bo, sx: b.sx });
              ev('split', seat, b.x, b.y, b);
            }
            continue;
          }
        }
        if (st.ffs && st.boss && seat !== st.boss.s && !st.foe[seat] && b.lh != null && b.lh >= 0 && b.lh !== seat && b.lh !== st.boss.s && !st.foe[b.lh] && vn > 0 && p > s.d - BR*0.5) {
          // friendly fire shield: a teammate's shot can't score on you in boss fights
          b.vx -= 2*vn*s.out[0]; b.vy -= 2*vn*s.out[1];
          const push = p - (s.d - BR*0.5); b.x -= push*s.out[0]; b.y -= push*s.out[1];
          b.cu = 0; ev('ffshield', seat, b.x, b.y, b);
          continue;
        }
        if (F.s[seat] > 0 && vn > 0 && p > s.d - BR*0.5 && b.sx >= 0 && b.sx !== seat) {
          if (host) F.s[seat] = 0;
          ev('shieldbreak', seat, b.x, b.y, b);
        }
        if ((F.s[seat] > 0 || st.wall[seat] > 0) && vn > 0 && p > s.d - BR*0.5 && !(b.sx >= 0 && b.sx !== seat && !(st.wall[seat] > 0))) {
          b.vx -= 2*vn*s.out[0]; b.vy -= 2*vn*s.out[1];
          const push = p - (s.d - BR*0.5); b.x -= push*s.out[0]; b.y -= push*s.out[1];
          if (host && !(st.wall[seat] > 0)) F.s[seat]--;
          b.cu = 0; ev('shield', seat, b.x, b.y, b);
          continue;
        }
        if (p > s.d + BR*1.2) {
          if (!host) { b.vx = 0; b.vy = 0; gone = true; break; }
          const gx = b.x, gy = b.y;
          scoreGoal(st, seat, b); ev('goal', seat, gx, gy, b); gone = true; break;
        }
      }
      if (!gone && (Math.abs(b.x) > 3 || Math.abs(b.y) > 3)) { b.x = 0; b.y = 0; }
    }
  }
}

function botAim(st, seat) {
  const BR = st.br || BALL_R;
  const A = st.arena, s = A.sides[A.seatSide[seat]], w = padW(st, seat), rng = padRange(A, s, w);
  if (st.ph !== 'pl' || !st.balls.length) return 0;
  const face = s.d - INSET;
  let best = null, bestT = 1e9;
  for (const b of st.balls) {
    const vn = b.vx*s.out[0] + b.vy*s.out[1];
    if (vn <= 0.05) continue;
    const tt = (face - BR - (b.x*s.out[0] + b.y*s.out[1])) / vn;
    if (tt < bestT) { bestT = tt; best = b; }
  }
  if (!best) {
    let near = st.balls[0], nd = 1e9;
    for (const b of st.balls) { const d = s.d - (b.x*s.out[0] + b.y*s.out[1]); if (d < nd) { nd = d; near = b; } }
    const al = (near.x - s.A[0])*s.dir[0] + (near.y - s.A[1])*s.dir[1];
    return clamp((al - s.len/2) / rng, -1, 1) * 0.35;
  }
  let x = best.x, y = best.y, vx = best.vx, vy = best.vy;
  for (let i = 0; i < 300; i++) {
    if (x*s.out[0] + y*s.out[1] >= face - BR) break;
    x += vx*0.01; y += vy*0.01;
    for (const o of A.sides) {
      if (o === s) continue;
      const q = x*o.out[0] + y*o.out[1], vn = vx*o.out[0] + vy*o.out[1], pl = o.d - INSET;
      if (q > pl - BR && vn > 0) { vx -= 2*vn*o.out[0]; vy -= 2*vn*o.out[1]; }
    }
  }
  const along = (x - s.A[0])*s.dir[0] + (y - s.A[1])*s.dir[1];
  return clamp((along - s.len/2) / rng, -1, 1);
}
function botErr(st, seat) {
  const A = st.arena, s = A.sides[A.seatSide[seat]];
  let sp = V0; for (const b of st.balls) sp = Math.max(sp, Math.hypot(b.vx, b.vy));
  const f = clamp((sp - V0) / (VMAX - V0), 0, 1);
  const extra = (st.F.r[seat] > 0 ? 0.25 : 0) + (st.balls.length > 1 ? 0.04 : 0) + (st.balls.some(b => b.cu > 0) ? 0.05 : 0);
  const k = st.boss && seat === st.boss.s ? (1.25 - 0.15*st.boss.rage)*(st.boss.err || 1) : 1;
  return (Math.random()*2 - 1) * (0.13 + 0.17*f + extra) * k / padRange(A, s, padW(st, seat));
}
function botPickCard(offer) {
  const score = id => ({ c: 1, r: 2, e: 3, x: 1.5 })[CARDS[id].r] + Math.random()*1.5;
  return offer.slice().sort((a, b) => score(b) - score(a))[0];
}
// ----- custom arenas (Arena Builder): pure simulation part -----
// A level is { v, name, sides, ar, rules: {...}, objs: [{ t, x, y, ... }] }. Objects live in world units inside the polygon.
const LV_TYPES = ['rock', 'bump', 'brick', 'wall', 'spin', 'mover', 'portal', 'lava', 'hole', 'boost', 'star', 'spot'];
const LV_DEFAULT_RULES = { lives: 5, speed: 1, size: 1, serve: 1, pu: 'on', grav: 'none', paddle: 1, goal: 'last', goalV: 5, bots: 1.3 };
function cleanLevel(L) {
  L = L && typeof L === 'object' ? L : {};
  const num = (v, a, b, d) => { v = +v; return isFinite(v) ? clamp(v, a, b) : d; };
  const R = Object.assign({}, LV_DEFAULT_RULES, L.rules || {});
  const rules = {
    lives: Math.round(num(R.lives, 1, 9, 5)), speed: num(R.speed, 0.6, 1.8, 1), size: num(R.size, 0.6, 2.2, 1), serve: Math.round(num(R.serve, 1, 3, 1)),
    pu: ['off', 'on', 'storm'].includes(R.pu) ? R.pu : 'on', grav: ['none', 'center', 'spin', 'wind'].includes(R.grav) ? R.grav : 'none',
    paddle: num(R.paddle, 0.5, 1.8, 1), goal: ['last', 'stars', 'survive'].includes(R.goal) ? R.goal : 'last', goalV: Math.round(num(R.goalV, 1, 300, 5)), bots: num(R.bots, 0.6, 1.8, 1.3)
  };
  const objs = [];
  for (const o of Array.isArray(L.objs) ? L.objs.slice(0, 60) : []) {
    if (!o || !LV_TYPES.includes(o.t)) continue;
    const q = { t: o.t, x: num(o.x, -1.2, 1.2, 0), y: num(o.y, -1.2, 1.2, 0) };
    if (['rock', 'bump', 'lava', 'hole', 'spin', 'mover'].includes(o.t)) q.r = num(o.r, 0.03, 0.3, 0.07);
    if (['wall', 'portal', 'mover'].includes(o.t)) { q.x2 = num(o.x2, -1.2, 1.2, q.x + 0.2); q.y2 = num(o.y2, -1.2, 1.2, q.y); }
    if (o.t === 'brick') { q.hp = Math.round(num(o.hp, 1, 5, 2)); q.s = num(o.s, 0.04, 0.14, 0.06); }
    if (o.t === 'boost') q.a = num(o.a, -10, 10, 0);
    if (o.t === 'spin') q.w = num(o.w, -4, 4, 1.6);
    if (o.t === 'mover') q.w = num(o.w, 0.2, 3, 1);
    objs.push(q);
  }
  return { v: 1, name: String(L.name || 'My arena').replace(/[^\w åäöÅÄÖ'!?.,&-]/g, '').slice(0, 24) || 'My arena', sides: Math.round(num(L.sides, 2, 6, 3)),
    ar: ARENAS[L.ar] ? L.ar : 'classic', rules, objs };
}
// Runtime copy of a level attached to a game state.
function levelRuntime(L) {
  return { name: L.name, rules: L.rules, objs: L.objs.map((o, i) => ({ ...o, id: i, hp0: o.hp, on: true, cd: 0 })) };
}
function moverPos(o, mt) { const k = 0.5 - 0.5*Math.cos(mt*o.w); return [o.x + (o.x2 - o.x)*k, o.y + (o.y2 - o.y)*k]; }
function spinSeg(o, mt) { const a = mt*o.w + o.x*3; return [o.x - Math.cos(a)*o.r, o.y - Math.sin(a)*o.r, o.x + Math.cos(a)*o.r, o.y + Math.sin(a)*o.r]; }
function segBounce(b, x1, y1, x2, y2, BR, ev, kind) {
  const dx = x2 - x1, dy = y2 - y1, L2 = dx*dx + dy*dy || 1e-9;
  const u = clamp(((b.x - x1)*dx + (b.y - y1)*dy) / L2, 0, 1), px = x1 + dx*u, py = y1 + dy*u;
  const ex = b.x - px, ey = b.y - py, d = Math.hypot(ex, ey), R = BR + 0.008;
  if (d >= R || d < 1e-7) return false;
  const nx = ex/d, ny = ey/d, vn = b.vx*nx + b.vy*ny;
  if (vn < 0) { b.vx -= 2*vn*nx; b.vy -= 2*vn*ny; b.cu = 0; ev(kind || 'wall', -1, b.x, b.y, b); }
  b.x = px + nx*R; b.y = py + ny*R;
  return true;
}
function circBounce(b, cx, cy, r, BR, boost) {
  const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy), R = r + BR;
  if (d >= R || d < 1e-7) return false;
  const nx = dx/d, ny = dy/d, vn = b.vx*nx + b.vy*ny;
  if (vn < 0) { b.vx -= 2*vn*nx; b.vy -= 2*vn*ny; b.cu = 0; if (boost) { const sp = Math.hypot(b.vx, b.vy) || 1, ns = Math.min(VMAX*1.25, Math.max(sp, V0)*boost); b.vx *= ns/sp; b.vy *= ns/sp; } }
  b.x = cx + nx*R; b.y = cy + ny*R;
  return vn < 0;
}
// Per ball, per physics sub-step.
function stepLevelBall(st, b, h, ev, host, BR) {
  const R = st.lv.rules;
  if (R.grav === 'center') { const r = Math.hypot(b.x, b.y); if (r > 0.05) { b.vx -= b.x/r*0.5*h; b.vy -= b.y/r*0.5*h; } }
  else if (R.grav === 'spin') { b.vx += -b.y*0.9*h; b.vy += b.x*0.9*h; }
  else if (R.grav === 'wind') { const wa = st.mt*0.5; b.vx += Math.cos(wa)*0.4*h; b.vy += Math.sin(wa)*0.4*h; }
  for (const o of st.lv.objs) {
    if (!o.on) continue;
    if (o.t === 'rock') { if (circBounce(b, o.x, o.y, o.r, BR, 0)) ev('rock', -1, b.x, b.y, b); }
    else if (o.t === 'bump') { if (circBounce(b, o.x, o.y, o.r, BR, 1.18)) { o.cd = 0.25; ev('lvbump', -1, b.x, b.y, b); } }
    else if (o.t === 'brick') {
      if (circBounce(b, o.x, o.y, o.s*0.62, BR, 0)) {
        if (host) { o.hp--; if (o.hp <= 0) { o.on = false; o.cd = 0; ev('brick', b.lh ?? -1, o.x, o.y, b); if (Math.random() < 0.35 && st.items.length < 4 && st.lv.rules.pu !== 'off') { const k = pick(POWER_KEYS); st.items.push({ id: st.nid++, x: o.x, y: o.y, type: k, life: 10 }); } } else ev('rock', -1, b.x, b.y, b); }
      }
    }
    else if (o.t === 'wall') segBounce(b, o.x, o.y, o.x2, o.y2, BR, ev);
    else if (o.t === 'spin') { const s = spinSeg(o, st.mt); segBounce(b, s[0], s[1], s[2], s[3], BR, ev); }
    else if (o.t === 'mover') { const p = moverPos(o, st.mt); if (circBounce(b, p[0], p[1], o.r, BR, 0)) ev('rock', -1, b.x, b.y, b); }
    else if (o.t === 'lava') { const inL = Math.hypot(b.x - o.x, b.y - o.y) < o.r; if (inL && b.inLv !== o.id) { const sp = Math.hypot(b.vx, b.vy) || 1, ns = Math.min(VMAX*1.3, sp*1.25); b.vx *= ns/sp; b.vy *= ns/sp; b.inLv = o.id; ev('lava', -1, b.x, b.y, b); } else if (!inL && b.inLv === o.id) b.inLv = -1; }
    else if (o.t === 'hole') { const dx = o.x - b.x, dy = o.y - b.y, d = Math.hypot(dx, dy); if (d < o.r*3.2 && d > 0.01) { const f = 0.9*o.r/0.08/(d*4 + 0.15); b.vx += dx/d*f*h; b.vy += dy/d*f*h; } }
    else if (o.t === 'boost') { if (Math.hypot(b.x - o.x, b.y - o.y) < 0.06 && !(b.bc > 0)) { const sp = Math.max(Math.hypot(b.vx, b.vy), V0*1.1), ns = Math.min(VMAX*1.3, sp*1.15); b.vx = Math.cos(o.a)*ns; b.vy = Math.sin(o.a)*ns; b.bc = 0.4; b.cu = 0; ev('lvboost', -1, b.x, b.y, b); } }
    else if (o.t === 'portal') {
      if (!(b.pc > 0)) for (const [px, py, qx, qy] of [[o.x, o.y, o.x2, o.y2], [o.x2, o.y2, o.x, o.y]]) if (Math.hypot(b.x - px, b.y - py) < 0.055) { b.x = qx; b.y = qy; b.pc = 0.6; ev('portal', -1, qx, qy, b); break; }
    }
    else if (o.t === 'star' && host) {
      if (Math.hypot(b.x - o.x, b.y - o.y) < 0.06 + BR && b.lh != null && b.lh >= 0 && st.alive[b.lh]) {
        o.on = false; o.cd = 4; st.stars[b.lh]++; ev('star', b.lh, o.x, o.y, b);
        if (R.goal === 'stars' && st.stars[b.lh] >= R.goalV) { st.tot += Math.round(st.sc); st.ph = 'ov'; st.winner = b.lh; st.balls = []; return true; }
      }
    }
  }
  b.bc = Math.max(0, (b.bc || 0) - h); b.pc = Math.max(0, (b.pc || 0) - h);
  return false;
}
// Once per frame: respawns, timed goals.
function stepLevelFrame(st, dt, ev, host) {
  for (const o of st.lv.objs) {
    if (o.t === 'bump') o.cd = Math.max(0, o.cd - dt);
    if (o.t === 'star' && !o.on && host) { o.cd -= dt; if (o.cd <= 0) { o.on = true; ev('starback', -1, o.x, o.y); } }
  }
  const R = st.lv.rules;
  if (host && R.goal === 'survive' && st.ph === 'pl' && st.mt >= R.goalV) {
    const al = aliveSeats(st); let best = -1, bl = -1, tie = false;
    for (const i of al) { if (st.lives[i] > bl) { bl = st.lives[i]; best = i; tie = false; } else if (st.lives[i] === bl) tie = true; }
    st.tot += Math.round(st.sc); st.ph = 'ov'; st.winner = tie ? -1 : best; st.balls = [];
  }
}
function levelSpot(st) {
  const spots = st.lv && st.lv.objs.filter(o => o.t === 'spot');
  if (!spots || !spots.length) return null;
  const free = spots.filter(o => st.items.every(i => Math.hypot(i.x - o.x, i.y - o.y) > 0.05));
  return free.length ? pick(free) : null;
}
// ================= /SIM =================

