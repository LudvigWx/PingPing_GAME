// ---------- online ----------
function findPeers() {
  if (!net) return [];
  return net.peers().filter(p => p.presence && p.presence.app === 'trepong' && p.presence.code === roomCode);
}
function myPeer() { if (!net) return null; const me = net.peers().find(p => p.sameTab); return me ? me.peer : null; }
async function joinNet(code) {
  try { const r = await roomNS.join('trepong-' + code); joinedNamed = true; return r; }
  catch (e) { joinedNamed = false; return roomNS; }
}
function seatNames() {
  const ps = findPeers();
  return hostSeats.map((peer, i) => {
    if (i === 0) return myName();
    if (bots[i] && hostPhase !== 'lobby') return 'Bot ' + i;
    const p = peer && ps.find(q => q.peer === peer);
    return p ? (cleanName(p.presence.name) || 'Guest') : 'Bot ' + i;
  });
}
function seatLooks() {
  const ps = findPeers();
  return hostSeats.map((peer, i) => {
    if (i === 0) return myLook;
    const p = peer && ps.find(q => q.peer === peer);
    if (p && !(bots[i] && hostPhase !== 'lobby')) return validLook(p.presence.look, SEAT_DEFAULT[i]);
    return botLooks[i] || (botLooks[i] = randomLook([myLook.c]));
  });
}

async function hostCreate() {
  if (!roomNS) return;
  audioOn();
  const btn = $('#btnHost'); btn.disabled = true; btn.textContent = 'Creating room…';
  roomCode = String(Math.floor(1000 + Math.random()*9000));
  net = await joinNet(roomCode);
  btn.disabled = false; btn.textContent = 'Create room';
  mode = 'host'; hostPhase = 'lobby'; lobbyN = menuN; lobbyFmt = pendingArenaHost && lobbyLevel ? 'arena' : menuFmt; if (!pendingArenaHost) lobbyLevel = null; pendingArenaHost = false; st = null; series = null; mySeat = 0; botLooks = []; bots = [];
  hostSeats = Array(lobbyN).fill(null); hostSeats[0] = 'host';
  names = seatNames(); looks = seatLooks();
  net.presence({ app: 'trepong', code: roomCode, role: 'host', name: myName(), fid: Live.uid || null, look: myLook, n: lobbyN, fmt: lobbyFmt, lvl: lobbyFmt === 'arena' ? lobbyLevel : null, ar: curArena(), smash: 0, emo: null, hero: myHero, chaos: lobbyChaos, card: myCardData(), seats: hostSeats, names, looks, phase: 'lobby', series: null, at: Date.now(), g: null }).catch(() => {});
  offPeers = net.onPeers(() => hostSync());
  enterLobbyUI(true);
}
function hostSync() {
  if (mode !== 'host') return;
  const guests = findPeers().filter(p => p.presence.role === 'guest' && !p.sameTab);
  for (let i = 1; i < hostSeats.length; i++) {
    if (hostSeats[i] && !guests.some(g => g.peer === hostSeats[i])) {
      const who = names[i];
      hostSeats[i] = null;
      if (hostPhase !== 'lobby') {
        bots[i] = true; botPickAt[i] = performance.now() + 800;
        toast((who || 'A player') + ' left. A bot takes over.');
      }
    }
  }
  if (hostPhase === 'lobby') {
    const un = guests.filter(g => !hostSeats.includes(g.peer)).sort((a, b) => (a.presence.at || 0) - (b.presence.at || 0));
    for (const g of un) { const i = hostSeats.indexOf(null, 1); if (i < 0) break; hostSeats[i] = g.peer; }
  }
  names = seatNames(); looks = seatLooks(); if (hostPhase !== 'lobby') { if (st && st.raid && raidArms) raidArms.forEach(([i, n, l]) => { names[i] = n; looks[i] = l; bots[i] = true; }); addBossSeat(); }
  net.presence({ seats: hostSeats, names, looks, n: lobbyN, fmt: lobbyFmt, lvl: lobbyFmt === 'arena' ? lobbyLevel : null, raid: lobbyRaid, rmod: lobbyRaidMod, ar: curArena(), chaos: lobbyChaos }).catch(() => {});
  renderLobby();
}
function hostSetN(n) {
  if (lobbyFmt === 'arena' && lobbyLevel) n = lobbyLevel.sides;
  if (lobbyFmt === 'torn') n = Math.min(3, n);
  if (lobbyFmt === 'raid') n = Math.min(4, n);
  lobbyN = n; setSeg($('#lobbySeg'), n);
  const old = hostSeats; hostSeats = Array(n).fill(null);
  for (let i = 0; i < n; i++) hostSeats[i] = old[i] || null;
  hostSeats[0] = 'host';
  hostSync();
}
function guestCard(i) { const p = findPeers().find(q => q.peer === hostSeats[i]); return validCard(p && p.presence.card); }
function guestHero(i) { const p = findPeers().find(q => q.peer === hostSeats[i]); const h = p && p.presence.hero; return HEROES[h] ? h : 'none'; }
function hostStart() {
  audioOn();
  bots = hostSeats.map((p, i) => i !== 0 && !p);
  names = seatNames(); looks = seatLooks();
  if (lobbyFmt === 'serie') beginSeries(); else { series = null; startMatch(); }
}

async function guestJoin() {
  if (!roomNS) return;
  const code = $('#code').value.replace(/\D/g, '');
  if (code.length !== 4) { toast('Enter a four-digit room code.'); return; }
  audioOn();
  const btn = $('#btnJoin'); btn.disabled = true; btn.textContent = 'Connecting…';
  roomCode = code; net = await joinNet(code);
  btn.disabled = false; btn.textContent = 'Join';
  mode = 'guest'; st = null; series = null; mySeat = -1; myPick = null;
  gs = { since: performance.now(), seen: 0, everSeen: false, lastG: null, netPads: [], sentPad: 9, pk: -1, mid: -1 };
  net.presence({ app: 'trepong', code: roomCode, role: 'guest', name: myName(), fid: Live.uid || null, look: myLook, at: Date.now(), pad: 0, pick: null, smash: mySmashN, emo: null, hero: myHero, abil: myHeroN, card: myCardData() }).catch(() => {});
  offPeers = net.onPeers(() => guestSync());
  enterLobbyUI(false);
  $('#lobbyWait').textContent = 'Looking for the room…';
}
function findHost() { return findPeers().find(p => p.presence.role === 'host' && !p.sameTab); }
function readHostMeta(hp) {
  hostSeats = Array.isArray(hp.seats) ? hp.seats : [];
  names = Array.isArray(hp.names) ? hp.names.map(n => String(n || '').replace(NAME_JUNK, '').trim().slice(0, 26)) : [];
  looks = Array.isArray(hp.looks) ? hp.looks.map((l, i) => validLook(l, SEAT_DEFAULT[i])) : [];
  lobbyN = clamp(+hp.n || 3, 2, 6);
  lobbyFmt = ['snabb', 'boss', 'torn', 'raid', 'arena'].includes(hp.fmt) ? hp.fmt : 'serie'; if (RAIDS[hp.raid]) lobbyRaid = hp.raid; lobbyRaidMod = clamp(+hp.rmod || 0, 0, 2);
  if (hp.lvl && typeof hp.lvl === 'object') lobbyLevel = cleanLevel(hp.lvl);
  lobbyArena = ARENAS[hp.ar] ? hp.ar : 'classic'; lobbyChaos = !!hp.chaos;
  mySeat = hostSeats.indexOf(myPeer());
  const s = hp.series;
  if (s && typeof s === 'object' && Array.isArray(s.wins)) {
    const n = lobbyN;
    const prevKey = series ? series.id + ':' + series.r : '';
    series = {
      id: +s.id || 0, r: +s.r || 1, of: +s.of || SERIES_OF, lw: typeof s.lw === 'number' ? s.lw : -1,
      wins: arr(s.wins, n, 0), cards: Array.from({ length: n }, (_, i) => cleanCards(s.cards && s.cards[i])),
      offers: Array.from({ length: n }, (_, i) => cleanCards(s.offers && s.offers[i])),
      picked: Array.from({ length: n }, (_, i) => !!(s.picked && s.picked[i])), left: +s.left || 0,
      sp: ['pick', 'play', 'between', 'done'].includes(s.sp) ? s.sp : 'play'
    };
    if (prevKey !== series.id + ':' + series.r) myPick = null;
  } else series = null;
}
function guestSync() {
  if (mode !== 'guest') return;
  const host = findHost(); if (!host) return;
  gs.seen = performance.now(); gs.everSeen = true;
  const hp = host.presence;
  readHostMeta(hp);
  if (hp.phase === 'lobby') {
    if (st) { st = null; resetFx(); }
    if ($('#lobby').hidden) enterLobbyUI(false);
    $('#lobbyWait').textContent = mySeat > 0 ? 'You\'re in. Waiting for the host to start…' : 'The room is full right now. You can watch.';
    renderLobby();
  }
}
function arr(a, n, d) { return Array.from({ length: n }, (_, i) => Array.isArray(a) && typeof a[i] === 'number' ? a[i] : d); }
function applyG(g) {
  if (!g || !Array.isArray(g.p) || !Array.isArray(g.B)) return;
  const n = clamp(g.p.length, 2, 7);
  if (!st || st.n !== n || st.mid !== g.mid) {
    st = newGame(n, SERIES_LIVES, series ? series.cards : null, { lvl: g.lv && lobbyLevel ? lobbyLevel : null, raid: RAIDS[g.rd] ? g.rd : null, foes: Array.isArray(g.fo) ? g.fo.map((f, i) => f ? i : -1).filter(i => i >= 0) : null, boss: Array.isArray(g.bs), tower: Array.isArray(g.bs) ? +g.bs[4] || 0 : 0, ar: g.ar, mut: g.mu, mid: g.mid, heroes: g.he, heroLv: g.hl, heroVar: g.hv }); st.mid = g.mid; resetFx();
    gs.pk = Array.isArray(g.pk) ? g.pk[0] : 0;
  }
  st.ffs = g.ff !== 0; st.raidMod = +g.rm || 0; st.rh = +g.rh || 0; st.cm = +g.cm || 1; st.gb = typeof g.gb === 'number' ? g.gb : -1;
  if (Array.isArray(g.vt) && Array.isArray(g.vt[1])) { const o = g.vt[1].filter(k => BOONS[k]).slice(0, 3); if (!st.vote || st.vote.r !== g.vt[0]) st.vote = { r: +g.vt[0] || 0, o, v: {}, done: -1 }; st.vote.o = o; st.vote.c = Array.isArray(g.vt[2]) ? g.vt[2].slice(0, 3).map(x => +x || 0) : [0, 0, 0]; st.vote.done = typeof g.vt[3] === 'number' ? g.vt[3] : -1; } else if (!g.vt) st.vote = null;
  if (st.lv && Array.isArray(g.lb)) st.lv.objs.forEach((o, i) => { const v = +g.lb[i] || 0; o.on = v > 0; if (o.t === 'brick') o.hp = v; });
  if (Array.isArray(g.lst)) st.stars = arr(g.lst, st.n, 0);
  if (st.boss && Array.isArray(g.bs)) { st.boss.hp = +g.bs[1] || 0; st.boss.mh = +g.bs[2] || 1; st.boss.rage = +g.bs[3] || 0; const ph = +g.bs[5] || 0; if (ph !== (st.boss.phase || 0) && mySeat >= 0) { st.boss.phase = ph; if (st.raid) raidPhaseFx(); } st.boss.phase = ph; st.boss.nph = +g.bs[6] || 1; st.boss.weak = +g.bs[7] || 0; st.boss.cn = st.boss.cn || (names[st.boss.s] || null); }
  if ((g.mu || null) !== (st.mut || null)) { st.mut = g.mu || null; initMut(st); }
  const prevArm = st.arm.slice();
  st.sm = arr(g.sm, n, 0); st.arm = arr(g.arm, n, 0); st.lgs = typeof g.lgs === 'number' ? g.lgs : -1;
  st.hc = arr(g.hc, n, 0); st.slowT = +g.slo || 0; st.clone = arr(g.cl, n, 0); st.wall = arr(g.wl, n, 0); st.grav = arr(g.gv, n, 0);
  for (let i = 0; i < n; i++) if (st.arm[i] > 0 && !(prevArm[i] > 0)) fx('arm', i, 0, 0);
  const goalCh = g.gl !== st.goals, phCh = g.ph !== st.ph;
  if (goalCh && g.lg >= 0 && g.gl > 0) {
    const s = st.arena.sides[st.arena.seatSide[g.lg]];
    fx('goal', g.lg, (s.A[0]+s.B[0])/2, (s.A[1]+s.B[1])/2);
  }
  if (Array.isArray(g.pk) && g.pk[0] !== gs.pk) {
    gs.pk = g.pk[0];
    const t = String(g.pk[1] || '');
    if (POWERS[t]) showPower(t, g.pk[2]);
    else if (t.startsWith('boss:') && BOSS_ATTACKS[t.slice(5)]) fx('battack', g.pk[2], 0, 0, null, t.slice(5));
  }
  st.ph = g.ph; st.t = +g.t || 0; st.lives = arr(g.l, n, 0); st.maxL = arr(g.ml, n, 3); st.alive = st.lives.map(l => l > 0);
  st.winner = g.w; st.goals = g.gl; st.hits = g.h; st.last = g.ls; st.sh = arr(g.sh, n, 0);
  st.sc = +g.sc || 0; st.best = +g.be || 0; st.tot = +g.to || 0;
  const F = g.F || {};
  st.F = { g: arr(F.g, n, 0), m: arr(F.m, n, 0), i: arr(F.i, n, 0), r: arr(F.r, n, 0), s: arr(F.s, n, 0) };
  st.ghost = +g.gh || 0; st.curve = +g.cv || 0; st.curveDir = g.cd === -1 ? -1 : 1; st.mt = +g.mt || 0;
  st.items = (Array.isArray(g.I) ? g.I : []).filter(i => POWERS[i[3]]).map(i => ({ id: i[0], x: i[1], y: i[2], type: i[3], life: i[4] }));
  st.obs = (Array.isArray(g.O) ? g.O : []).map(o => ({ id: o[0], x: o[1], y: o[2], r: o[3], vx: o[4], vy: o[5], life: o[6], age: o[7] }));
  gs.netPads = arr(g.p, n, 0);
  const lat = 0.05, now = performance.now(), next = [];
  for (const hb of g.B) {
    const [id, x, y, vx, vy, cu, cd, co, bo, sx] = hb;
    const ax = x + vx*lat, ay = y + vy*lat;
    let b = st.balls.find(q => q.id === id);
    if (!b || phCh || goalCh) {
      b = b || { id, cx: 0, cy: 0, bt: 0 };
      b.x = ax; b.y = ay; b.vx = vx; b.vy = vy; b.cx = 0; b.cy = 0; b.cu = +cu || 0; b.cd = cd === -1 ? -1 : 1; b.co = typeof co === 'number' ? co : -1; b.bo = +bo || 1; b.sx = typeof sx === 'number' ? sx : -1;
    } else {
      const contradicts = now - (b.bt || 0) < 260 && (vx*b.vx + vy*b.vy) < 0;
      if (!contradicts) {
        const ex = ax - b.x, ey = ay - b.y;
        if (Math.hypot(ex, ey) > 0.25) { b.x = ax; b.y = ay; b.cx = 0; b.cy = 0; }
        else { b.cx = ex; b.cy = ey; }
        b.vx = vx; b.vy = vy; b.cu = +cu || 0; b.cd = cd === -1 ? -1 : 1; b.co = typeof co === 'number' ? co : -1; b.bo = +bo || 1; b.sx = typeof sx === 'number' ? sx : -1;
      }
    }
    next.push(b);
  }
  st.balls = next;
  if (st.ph === 'ov' && !overShown) beginReplayThen(showOver);
  if (st.ph !== 'ov' && (!$('#over').hidden || !$('#pick').hidden || !$('#lobby').hidden)) { overShown = false; showScreen(null); }
}
let lastSeriesSeen = null;
function guestTick(dt) {
  const now = performance.now();
  const host = findHost();
  if (!host) {
    if (!gs.everSeen && now - gs.since > 7000) { toast('No room found with code ' + roomCode + '.'); leave(); return; }
    if (gs.everSeen && now - gs.seen > 4000) { toast('The host left the room.'); leave(); return; }
  } else {
    gs.seen = now;
    if (!gs.everSeen) guestSync();
    const hp = host.presence;
    if (hp.series !== lastSeriesSeen || hp.phase === 'pick') { lastSeriesSeen = hp.series; readHostMeta(hp); }
    if (hp.phase === 'pick' && series) {
      if (st) { st = null; resetFx(); }
      if ($('#pick').hidden) showPickUI(); else renderPick(series, mySeat);
    } else if (hp.phase === 'play' && hp.g && hp.g !== gs.lastG) {
      gs.lastG = hp.g; readHostMeta(hp); applyG(hp.g);
    }
    if (!$('#over').hidden && st && st.ph === 'ov') updateOverSeries();
  }
  if (!st) return;
  const targets = [];
  for (let i = 0; i < st.n; i++) targets[i] = i === mySeat ? myTarget() : (gs.netPads[i] ?? st.pads[i]);
  st.padSpeed = st.pads.map((_, i) => i === mySeat ? Infinity : 7);
  const ev = (type, seat, x, y, b) => { if (['hit', 'wall', 'bump', 'rock', 'shield', 'smash', 'shieldbreak', 'lava', 'portal'].includes(type)) { if (b) b.bt = performance.now(); fx(type, seat, x, y); } };
  stepSim(st, dt, targets, { follower: true, onEvent: ev });
  const f = Math.min(1, dt*10);
  for (const b of st.balls) { if (!b.cx && !b.cy) continue; b.x += b.cx*f; b.y += b.cy*f; b.cx *= 1-f; b.cy *= 1-f; }
  pushTrails(st);
  const t = myTarget();
  if (mySeat > 0 && Math.abs(t - gs.sentPad) > 0.002) { gs.sentPad = t; net.presence({ pad: r3(t) }).catch(() => {}); }
}

async function leave() {
  const n = net, named = joinedNamed;
  if (offPeers) { try { offPeers(); } catch (e) {} offPeers = null; }
  net = null; joinedNamed = false;
  if (n) {
    try {
      if (named) await n.leave();
      else await n.presence({ app: null, code: null, role: null, g: null, seats: null, names: null, looks: null, look: null, pad: null, phase: null, n: null, fmt: null, series: null, pick: null, smash: null, emo: null, ar: null, hero: null, abil: null, chaos: null, card: null });
    } catch (e) {}
  }
  mode = 'menu'; st = null; series = null; resetFx(); mySeat = 0; roomCode = ''; looks = []; myPick = null; special = null; botSkill = [];
  if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
  showScreen('menu');
}

