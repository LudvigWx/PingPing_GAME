// ---------- input ----------
function mySideScreen() {
  if (!st || mySeat < 0 || !st.alive[mySeat]) return null;
  const A = st.arena, s = A.sides[A.seatSide[mySeat]], v = computeView(A, mySeat, st.mut === 'upside');
  return { s, A, a: toScr(v, s.A[0], s.A[1]), b: toScr(v, s.B[0], s.B[1]) };
}
function pointerTo(px, py) {
  const m = mySideScreen(); if (!m) return;
  const dx = m.b[0]-m.a[0], dy = m.b[1]-m.a[1];
  const t = ((px-m.a[0])*dx + (py-m.a[1])*dy) / (dx*dx + dy*dy);
  myU = clamp((t*m.s.len - m.s.len/2) / padRange(m.A, m.s, padW(st, mySeat)), -1, 1);
}
function myTarget() { return st && mySeat >= 0 && st.F.r[mySeat] > 0 ? -myU : myU; }
const touchIds = new Set();
cv.addEventListener('pointerdown', e => {
  audioOn(); try { cv.setPointerCapture(e.pointerId); } catch (_) {}
  if (replay) { endReplay(); return; }
  if (e.pointerType === 'touch') { touchIds.add(e.pointerId); if (touchIds.size >= 2) { doSmash(); return; } }
  pointerTo(e.clientX, e.clientY);
});
['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, e => touchIds.delete(e.pointerId)));
cv.addEventListener('pointermove', e => { if (e.pointerType === 'mouse' || e.buttons || e.pressure > 0) pointerTo(e.clientX, e.clientY); });
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.l = true;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.r = true;
  if (e.key === ' ') { e.preventDefault(); doSmash(); }
  if (e.key === 'q' || e.key === 'Q') doHero();
});
addEventListener('keyup', e => {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') keys.l = false;
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keys.r = false;
});
function keyInput(dt) {
  if (!(keys.l || keys.r)) return;
  const m = mySideScreen(); if (!m) return;
  const sign = m.b[0] >= m.a[0] ? 1 : -1;
  myU = clamp(myU + ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * sign * 2.6 * dt, -1, 1);
}

// ---------- game setup (practice + host) ----------
function requestWake() { try { navigator.wakeLock && navigator.wakeLock.request('screen').then(w => wakeLock = w).catch(() => {}); } catch (e) {} }
function resetFx() { pops = []; heatSeen = 0; revengeMap = {}; revengeN = 0; goldHits = 0; goldSeen = -1; replay = null; rec = []; emoBubbles = []; particles = []; trails = new Map(); flash = [0, 0, 0, 0, 0, 0, 0, 0]; shake = 0; rally = 0; lastCount = -1; overShown = false; myU = 0; banner = null; }
function seatCount() { return mode === 'practice' ? menuN : lobbyN; }
function isSeries() { return curFmt() === 'serie'; }
function curFmt() { return mode === 'practice' ? menuFmt : lobbyFmt; }
function curArena() { return ownsItem('a', menuArena) ? menuArena : 'classic'; }
function addBossSeat() {
  if (!st || !st.boss) return;
  const b = st.boss.s;
  bots[b] = true; names[b] = st.boss.cn || 'The boss';
  looks[b] = validLook(st.boss.lk || BOSS_LOOK);
}
const TOWER_LOOT = { 3: [['t', 'bossfire']], 5: [['k', 'tower']], 7: [['h', 'demon']], 8: [['pg', 'towerbg']], 10: [['h', 'champcrown'], ['v', 'champion'], ['pb', 'champion'], ['pt', 'champ']] };
function towerCoins(f) { return 30 + 15*f; }
function lootName(it) { return itemLabel(it[0], it[1]); }
function renderTower() {
  renderWeekly();
  syncCoinUI(); $('#towerCoins').textContent = fmt(coins);
  const next = towerNext(), cfg = towerCfg(next), loot = TOWER_LOOT[next];
  $('#towerHead').textContent = 'Floor ' + next + ': ' + cfg.n;
  $('#towerSub').textContent = 'Reward ' + towerCoins(next) + ' coins' + (loot ? ' and ' + loot.map(lootName).join(' + ') : '') + '. Arena: ' + ARENAS[cfg.ar] + '.';
  setSeg($('#towerSeg'), towerPlayers, 't');
  const list = $('#towerList'); list.textContent = '';
  const top = Math.max(10, next + 2);
  for (let f = 1; f <= top; f++) {
    const c = towerCfg(f), row = document.createElement('div');
    row.className = 'floor' + (f < next ? ' done' : f === next ? ' next' : ' locked');
    const cvs = document.createElement('canvas'); cvs.width = 88; cvs.height = 60;
    const mid = document.createElement('div'); const b = document.createElement('b'); b.textContent = f <= next ? c.n : '???';
    const sm = document.createElement('small'); sm.textContent = f < next ? 'Defeated' : (towerCoins(f) + ' coins' + (TOWER_LOOT[f] ? ' + ' + TOWER_LOOT[f].map(lootName).join(' + ') : ''));
    mid.append(b, sm);
    const lv = document.createElement('span'); lv.className = 'lvl'; lv.textContent = f;
    row.append(cvs, mid, lv); list.append(row);
    lookCanvas(cvs, f <= next ? { c: c.c, h: c.h, f: c.f, t: 'std', s: 'solid' } : { c: '#2E2656', h: 'none', f: 'none', t: 'std', s: 'solid' }, 1.6);
  }
}
function towerWin(floor) {
  const out = [];
  if (floor === towerNext()) {
    store('trepong-tower', String(floor));
    for (const it of TOWER_LOOT[floor] || []) { owned.add(it[0] + ':' + it[1]); out.push(lootName(it)); }
    saveWallet();
  }
  trackMax('towerFloor', Math.max(towerCleared(), floor)); track('towerWins');
  return out;
}
function towerCleared() { return Math.max(0, Math.floor(+store('trepong-tower') || 0)); }
function towerNext() { return towerCleared() + 1; }
function heroOf(i) { return i === 0 && mode !== 'guest' ? myHero : pick(Object.keys(HEROES).slice(1)); }

let botSkill = [];
const BOT_BASE = 1.3; // skill of ordinary bots (practice, empty online seats, teammates)
function startPractice(sp) {
  audioOn(); mode = 'practice'; mySeat = 0; resetFx(); special = typeof sp === 'string' ? sp : null; botSkill = [];
  bots = Array.from({ length: menuN }, (_, i) => i !== 0);
  names = bots.map((_, i) => i === 0 ? myName() : 'Bot ' + i);
  looks = [myLook]; for (let i = 1; i < menuN; i++) looks.push(randomLook(looks.map(l => l.c)));
  $('#hudCode').hidden = true;
  if (menuFmt === 'serie' && !special) beginSeries(); else { series = null; startMatch(); }
}
function startMatch() {
  resetFx();
  if ((mode === 'practice' && special === 'custom' && playLevel) || (mode === 'host' && lobbyFmt === 'arena' && lobbyLevel)) { startArenaMatch(mode === 'host' ? lobbyLevel : playLevel); return; }
  if ((mode === 'practice' && special === 'raid') || (mode === 'host' && lobbyFmt === 'raid')) { const id = mode === 'host' ? (lobbyRaid || activeRaids()[0]) : raidSel; startRaidMatch(id, mode === 'host' ? Math.min(4, seatCount()) : raidPlayers); return; }
  const weekly = special === 'weekly' && mode === 'practice', cupM = special === 'cup' && mode === 'practice';
  const fmt0 = weekly ? 'weekly' : cupM ? 'snabb' : curFmt(), tower = fmt0 === 'torn', boss = fmt0 === 'boss' || tower || weekly;
  const np = cupM ? 2 : weekly ? towerPlayers : tower ? (mode === 'practice' ? towerPlayers : Math.min(3, seatCount())) : boss ? Math.min(5, seatCount()) : seatCount();
  const chaos = mode === 'practice' ? menuChaos : lobbyChaos;
  const mut = chaos && !tower && !weekly && !cupM ? pick(MUT_KEYS) : null;
  if (tower) towerFloorPlaying = towerNext();
  if (mode === 'practice') { while (bots.length < np) { const i = bots.length; bots.push(true); names.push('Bot ' + i); looks.push(randomLook(looks.map(l => l.c))); } }
  const heroes = Array.from({ length: np }, (_, i) => mode === 'host' && i > 0 && hostSeats[i] ? guestHero(i) : heroOf(i));
  const heroLv = heroes.map((h, i) => i === 0 && mode !== 'guest' ? heroLevel(h) : mode === 'host' && hostSeats[i] ? guestCard(i).hl : 1 + Math.floor(Math.random()*4));
  const heroVar = heroes.map((h, i) => i === 0 && mode !== 'guest' ? heroVariant(h) : mode === 'host' && hostSeats[i] ? guestCard(i).hv : 'std');
  st = newGame(np + (boss ? 1 : 0), series ? SERIES_LIVES : boss ? BOSS_LIVES : QUICK_LIVES, series ? series.cards : null, { boss, tower: tower ? towerFloorPlaying : 0, weekly, ar: cupM ? 'classic' : curArena(), mut, heroes, heroLv, heroVar, ffs: !hardcore });
  botCache = []; mySeat = 0; lastSmashN = []; lastHeroN = [];
  names = names.slice(0, np); looks = looks.slice(0, np); bots = bots.slice(0, np);
  addBossSeat();
  if (series) series.sp = 'play';
  if (mode === 'host') {
    hostPhase = 'play';
    bots = hostSeats.map((p, i) => i !== 0 && !p).slice(0, np);
    names = seatNames().slice(0, np); looks = seatLooks().slice(0, np); addBossSeat();
    net.presence({ phase: 'play', names, looks, seats: hostSeats, n: lobbyN, fmt: lobbyFmt, series: packSeries(), g: packState(st) }).catch(() => {});
  }
  showScreen(null); requestWake();
}

// ----- series -----
function beginSeries() {
  const n = seatCount();
  series = { id: Math.floor(Math.random()*1e9), r: 1, of: SERIES_OF, wins: Array(n).fill(0), cards: Array.from({ length: n }, () => []), offers: [], picked: [], left: PICK_SECS, lw: -1, sp: 'pick' };
  startPick();
}
function startPick() {
  const n = seatCount();
  st = null; resetFx();
  series.offers = Array.from({ length: n }, (_, i) => makeOffer(series.cards[i], i === series.lw));
  series.picked = Array(n).fill(false); series.sp = 'pick'; series.left = PICK_SECS;
  seriesPicks = Array(n).fill(null); myPick = null;
  pickDeadline = performance.now() + PICK_SECS*1000;
  if (mode === 'host') bots = hostSeats.map((p, i) => i !== 0 && !p);
  botPickAt = bots.map(b => b ? performance.now() + 1200 + Math.random()*3500 : Infinity);
  if (mode === 'host') { hostPhase = 'pick'; publishSeries(true); }
  showPickUI();
}
function packSeries() {
  if (!series) return null;
  return { id: series.id, r: series.r, of: series.of, wins: series.wins.slice(), cards: series.cards.map(c => c.slice()), offers: series.offers.map(o => o.slice()), picked: series.picked.slice(), left: Math.ceil(series.left), lw: series.lw, sp: series.sp };
}
function publishSeries(force) {
  if (mode !== 'host' || !net) return;
  const now = performance.now();
  if (!force && now - pubT < 250) return;
  pubT = now;
  net.presence({ phase: hostPhase, fmt: lobbyFmt, series: packSeries(), names, looks, seats: hostSeats, n: lobbyN }).catch(() => {});
}
function choosePick(seat, id) {
  if (!series || series.sp !== 'pick' || series.picked[seat]) return;
  if (!series.offers[seat] || !series.offers[seat].includes(id)) return;
  seriesPicks[seat] = id; series.picked[seat] = true;
  publishSeries(true);
}
function pickTick() {
  if (!series || series.sp !== 'pick') return;
  const now = performance.now();
  series.left = Math.max(0, (pickDeadline - now) / 1000);
  for (let i = 0; i < series.picked.length; i++) {
    if (series.picked[i]) continue;
    if (bots[i] && now >= botPickAt[i]) choosePick(i, botPickCard(series.offers[i]));
    else if (mode === 'host' && i !== 0 && hostSeats[i]) {
      const p = findPeers().find(q => q.peer === hostSeats[i]);
      const pk = p && p.presence.pick;
      if (Array.isArray(pk) && pk[0] === series.id * 10 + series.r) choosePick(i, pk[1]);
    }
  }
  if (series.left <= 0) series.picked.forEach((done, i) => { if (!done) choosePick(i, pick(series.offers[i])); });
  if (series.picked.every(Boolean)) {
    series.picked.forEach((_, i) => { if (seriesPicks[i]) series.cards[i].push(seriesPicks[i]); });
    startMatch();
    return;
  }
  publishSeries(false);
  renderPick(series, mySeat);
}
function onMatchOverHost() {
  if (!series) return;
  if (st.winner >= 0) series.wins[st.winner]++;
  series.lw = st.winner;
  series.sp = series.r >= series.of ? 'done' : 'between';
  if (mode === 'host') publishSeries(true);
}
function seriesNext() {
  if (!series || series.sp !== 'between') return;
  series.r++; startPick();
}
function seriesChampions(s) {
  const top = Math.max(...s.wins);
  return s.wins.map((w, i) => w === top && top > 0 ? i : -1).filter(i => i >= 0);
}

// ----- pick UI (all modes) -----
let pickKey = '';
function showPickUI() { showScreen('pick'); pickKey = ''; renderPick(series, mySeat); }
function renderPick(s, seat) {
  if (!s) return;
  $('#pickTitle').textContent = 'Match ' + s.r + ' of ' + s.of;
  const lw = s.lw;
  $('#pickHead').textContent = s.r === 1 ? 'Pick a starting card' : (lw < 0 ? 'Draw!' : (lw === seat ? 'You won!' : (names[lw] || 'Player ' + (lw+1)) + ' won'));
  $('#pickHead').style.color = s.r === 1 || lw < 0 ? 'var(--ink)' : colOf(lw);
  $('#pickSub').textContent = s.r === 1 ? 'Everyone picks at once. The card lasts for the rest of the series.' : (lw === seat ? 'The winner has a better chance of rare and epic cards.' : 'Everyone gets a new card. The winner has better odds.');
  $('#pickBar').style.width = (clamp(s.left / PICK_SECS, 0, 1) * 100) + '%';
  const offer = seat >= 0 && s.offers ? s.offers[seat] || [] : [];
  const mine = seat >= 0 && (s.picked[seat] || myPick);
  const key = JSON.stringify(offer) + '|' + s.r + '|' + (myPick || '');
  if (key !== pickKey) {
    pickKey = key;
    const box = $('#pickCards'); box.textContent = '';
    offer.forEach(id => {
      const c = CARDS[id];
      const b = document.createElement('button'); b.type = 'button'; b.className = 'card ' + c.r; b.lang = 'en';
      b.setAttribute('aria-pressed', String(myPick === id));
      if (myPick && myPick !== id) b.classList.add('dim');
      const cvs = document.createElement('canvas'); cvs.width = 200; cvs.height = 200;
      const body = document.createElement('span'); body.className = 'cb';
      const rr = document.createElement('span'); rr.className = 'cr'; rr.textContent = RARITY[c.r];
      const nn = document.createElement('span'); nn.className = 'cn'; nn.textContent = c.n;
      const dd = document.createElement('span'); dd.className = 'cd'; dd.textContent = c.d;
      body.append(rr, nn, dd); b.append(cvs, body); box.append(b);
      drawCardArt(cvs, id);
      b.addEventListener('click', () => onPickCard(id));
    });
    if (!offer.length) { const p = document.createElement('p'); p.className = 'note'; p.textContent = 'You\'re watching. The players are picking cards.'; box.append(p); }
  }
  const left = s.picked.filter(x => !x).length;
  $('#pickWait').textContent = mine ? (left ? 'Waiting for ' + left + ' more…' : 'Everyone has picked!') : (offer.length ? 'Tap a card. ' + Math.ceil(s.left) + ' s left.' : '');
  renderBoard($('#pickBoard'), s, true);
}
function onPickCard(id) {
  if (!series || myPick || series.sp !== 'pick') return;
  myPick = id; audioOn(); sfx.card(CARDS[id].r); buzz(15);
  if (CARDS[id].r === 'e') track('epicPicks'); if (CARDS[id].r === 'x') track('cursedPicks');
  if (mode === 'guest') { if (net) net.presence({ pick: [series.id * 10 + series.r, id] }).catch(() => {}); }
  else choosePick(mySeat, id);
  pickKey = ''; renderPick(series, mySeat);
}
function renderBoard(el, s, showPicked) {
  const key = JSON.stringify([s.wins, s.cards, showPicked ? s.picked : 0, s.sp, names, mySeat, looks.map(l => l && l.c)]);
  if (el._key === key) return;
  el._key = key;
  el.textContent = '';
  const n = s.wins.length;
  for (let i = 0; i < n; i++) {
    const row = document.createElement('div'); row.className = 'brow';
    const who = document.createElement('span'); who.className = 'who'; who.style.color = colOf(i);
    who.textContent = (i === mySeat ? 'You' : (names[i] || 'Player ' + (i+1)));
    const wins = document.createElement('span'); wins.className = 'wins';
    wins.textContent = s.wins[i] + (s.wins[i] === 1 ? ' win' : ' wins') + (showPicked && s.sp === 'pick' ? (s.picked[i] ? ' · picked' : ' · picking…') : '');
    const pills = document.createElement('span'); pills.className = 'pills';
    const cs = s.cards[i] || [];
    if (!cs.length) { const e = document.createElement('span'); e.className = 'empty'; e.textContent = 'No cards yet'; pills.append(e); }
    cs.forEach(id => { const p = document.createElement('span'); p.className = 'pill ' + CARDS[id].r; p.textContent = CARDS[id].n; pills.append(p); });
    row.append(who, wins, pills); el.append(row);
  }
}

// ----- per-frame host/practice game -----
function packState(s) {
  const F = s.F;
  return {
    mid: s.mid, k: s.k, ph: s.ph, t: r3(s.t),
    B: s.balls.map(b => [b.id, r3(b.x), r3(b.y), r3(b.vx), r3(b.vy), r1(b.cu || 0), b.cd || 1, b.co ?? -1, r3(b.bo || 1), b.sx ?? -1]), mt: r1(s.mt),
    p: s.pads.map(r3), l: s.lives.slice(), ml: s.maxL.slice(), h: s.hits, gl: s.goals, lg: s.lastGoal, w: s.winner, ls: s.last,
    I: s.items.map(i => [i.id, r3(i.x), r3(i.y), i.type, r1(i.life)]),
    O: s.obs.map(o => [o.id, r3(o.x), r3(o.y), r3(o.r), r3(o.vx), r3(o.vy), r1(o.life), r1(o.age)]),
    F: { g: F.g.map(r1), m: F.m.map(r1), i: F.i.map(r1), r: F.r.map(r1), s: F.s.slice() },
    gh: r1(s.ghost), cv: r1(s.curve), cd: s.curveDir,
    sc: Math.round(s.sc), gb: s.gb ?? -1, rh: s.rh, cm: Math.round((s.cm || 1)*100)/100, be: s.best, to: s.tot, pk: s.pk, sh: s.sh.slice(),
    sm: s.sm.map(v => Math.round(v*100)/100), arm: s.arm.map(r1), lgs: s.lgs, ar: s.ar,
    bs: s.boss ? [s.boss.s, Math.round(s.boss.hp*10)/10, s.boss.mh, s.boss.rage, s.boss.floor || 0, s.boss.phase || 0, s.boss.nph || 1, r1(s.boss.weak || 0)] : null, ff: s.ffs ? 1 : 0, vt: s.vote ? [s.vote.r, s.vote.o, voteCounts(s.vote), s.vote.done] : null, rd: s.raid || 0, rm: s.raidMod || 0, fo: s.foe.map(f => f ? 1 : 0), lv: s.lv ? 1 : 0, lb: s.lv ? s.lv.objs.map(o => o.on ? (o.hp || 1) : 0) : null, lst: s.stars,
    mu: s.mut, he: s.he, hl: s.hl, hv: s.hv, hc: s.hc.map(v => Math.round(v*100)/100), slo: r1(s.slowT), cl: s.clone.map(r1), wl: s.wall.map(r1), gv: s.grav.map(r1)
  };
}
function botThink(i, dt) {
  const c = botCache[i] || (botCache[i] = { t: 0, u: 0, err: 0, hits: -1 });
  if (st.ph !== 'pl') { c.t = 0; c.u = 0; return 0; } // countdown: wait in the middle, no leftover aiming error
  const sv = st.balls.length ? st.balls[0].id : -1, fresh = sv !== c.sv;
  if (c.hits !== st.hits || fresh) { c.hits = st.hits; c.sv = sv; c.err = botErr(st, i) / Math.pow(botSkill[i] || BOT_BASE, 1.5) * (fresh ? 0.5 : 1); if (fresh) c.t = 0; }
  c.t -= dt;
  if (c.t <= 0) { c.t = 0.09; c.u = clamp(botAim(st, i) + c.err, -1, 1); }
  return c.u;
}
function pushTrails(g) {
  const live = new Set();
  for (const b of g.balls) {
    live.add(b.id);
    let tr = trails.get(b.id); if (!tr) { tr = []; trails.set(b.id, tr); }
    tr.push([b.x, b.y]); if (tr.length > 14) tr.shift();
  }
  for (const id of trails.keys()) if (!live.has(id)) trails.delete(id);
}
function hostTick(dt) {
  const targets = [], slack = [];
  st.padSpeed = st.pads.map((_, i) => st.boss && i === st.boss.s ? bossSpeed(st) : bots[i] ? 2.3*(0.7 + 0.3*(botSkill[i] || BOT_BASE)) : Infinity);
  const guestPeers = mode === 'host' ? findPeers() : null;
  for (let i = 0; i < st.n; i++) {
    if (i === mySeat) targets[i] = myTarget();
    else if (bots[i]) {
      targets[i] = botThink(i, dt);
      if (st.sm[i] >= 1 && st.ph === 'pl' && Math.random() < dt*0.5 && trySmash(st, i)) fx('arm', i, 0, 0);
      if (st.hc[i] >= 1 && Math.random() < dt*0.4) useHero(st, i, fx);
    } else {
      const p = guestPeers && guestPeers.find(q => q.peer === hostSeats[i]);
      const smN = p && typeof p.presence.smash === 'number' ? p.presence.smash : null;
      if (smN != null && smN !== lastSmashN[i]) { if (lastSmashN[i] !== undefined && trySmash(st, i)) fx('arm', i, 0, 0); lastSmashN[i] = smN; }
      const hN = p && typeof p.presence.abil === 'number' ? p.presence.abil : null;
      if (hN != null && hN !== lastHeroN[i]) { if (lastHeroN[i] !== undefined) useHero(st, i, fx); lastHeroN[i] = hN; }
      const vv = p && p.presence.vote; if (st.vote && st.vote.done < 0 && Array.isArray(vv) && vv[0] === st.vote.r && st.alive[i]) st.vote.v[i] = clamp(Math.floor(+vv[1] || 0), 0, 2);
      const u = p && typeof p.presence.pad === 'number' ? p.presence.pad : null;
      targets[i] = u == null ? st.pads[i] : clamp(u, -1, 1);
      slack[i] = 0.04; // a little forgiveness for network lag
    }
  }
  if (st.vote && st.vote.done < 0) hostVote();
  const prevPh = st.ph;
  stepSim(st, dt, targets, { onEvent: fx, slack });
  pushTrails(st);
  if (special === 'adv' && advCur && st.boss && st.bsw !== (advCur.bsw || 0)) { advCur.bsw = st.bsw; advBossPhase(); }
  if (st.raid && st.bsw !== (st.lbsw || 0)) { st.lbsw = st.bsw; raidPhaseFx(); }
  if (st.ph === 'ov' && prevPh !== 'ov') onMatchOverHost();
  if (mode === 'host') { st.k++; net.presence({ g: packState(st) }).catch(() => {}); }
  if (st.ph === 'ov' && prevPh !== 'ov') beginReplayThen(showOver);
}

