// ---------- progression: level road, prestige, collection book, level-up animations ----------
const LV_CAP = 60, PRESTIGE_MAX = 12, LV_SPECIAL = [10, 25, 45];
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
function xpNeed(L) { return 60 + 12*L; } // XP from level L to L+1
function lvCap() { return (stats.prest || 0) >= PRESTIGE_MAX ? 999 : LV_CAP; }
function lvOf(pxp) { let L = 1, x = pxp || 0; const cap = lvCap(); while (L < cap && x >= xpNeed(L)) { x -= xpNeed(L); L++; } return { L, into: x, need: L >= cap ? 0 : xpNeed(L) }; }
function myLevel() { return lvOf(stats.pxp).L; }
function myLvFrac() { const o = lvOf(stats.pxp); return o.need ? o.into/o.need : 1; }
if (stats.pxp == null) { stats.pxp = stats.xp || 0; stats.prest = 0; stats.lvSeen = 1; stats.collClaim = []; saveStats(); } // first run of the new system: everyone gets their levels' rewards
// level-exclusive cosmetics + titles
HATS.push(['laurel', 'Laurel crown']); SKINS.push(['chevron', 'Chevron steel']); AURAS.push(['wings', 'Neon wings']); BALLSKINS.push(['legend', 'Legend orb']);
PRICE.h.laurel = null; PRICE.k.chevron = null; PRICE.u.wings = null; PRICE.b.legend = null;
const LEVEL_SRC = { 'h:laurel': 10, 'k:chevron': 25, 'u:wings': 45, 'b:legend': 60 };
PROF.pt.push(['risingstar', 'Rising Star', 'r', 'level'], ['seasoned', 'Seasoned', 'e', 'level'], ['elitept', 'Elite', 'l', 'level'], ['paddlelegend', 'Paddle Legend', 'm', 'level'],
  ['curator', 'The Curator', 'e', 'coll'], ['completionist', 'Completionist', 'm', 'coll']);
for (let p = 1; p <= PRESTIGE_MAX; p++) {
  const rar = p >= 10 ? 'm' : p >= 6 ? 'l' : 'e';
  PROF.pt.push(['pres' + p, 'Prestige ' + ROMAN[p] + ' · ' + PRESTIGE_NAMES[p], rar, 'prestige']);
  PROF.pb.push(['pframe' + p, PRESTIGE_NAMES[p] + ' frame', rar, 'prestige', 1]);
  SKINS.push(['pskin' + p, PRESTIGE_NAMES[p] + ' steel']); PRICE.k['pskin' + p] = null; LEVEL_SRC['k:pskin' + p] = -p;
}
function prestigeRewards(p) { return [['pt', 'pres' + p], ['k', 'pskin' + p], ['pb', 'pframe' + p], ['coins', 1000], ['chest', 'myth']]; }
// anyone who prestiged before the prestige cosmetics existed gets them now
for (let p = 1; p <= (stats.prest || 0); p++) for (const r of prestigeRewards(p).slice(0, 3)) owned.add(rewardKey(r));
function levelRewards(L) {
  const r = [['coins', 40 + 4*Math.min(L, 120)]];
  if (L === 10) r.push(['h', 'laurel'], ['pt', 'risingstar'], ['chest', 'gold']);
  else if (L === 25) r.push(['k', 'chevron'], ['pt', 'seasoned'], ['chest', 'gold']);
  else if (L === 45) r.push(['u', 'wings'], ['pt', 'elitept'], ['chest', 'myth']);
  else if (L === 60) r.push(['b', 'legend'], ['pt', 'paddlelegend'], ['chest', 'myth']);
  else if (L > 60 && L % 100 === 0) r.push(['chest', 'myth']);
  else if (L % 10 === 0) r.push(['chest', 'gold']);
  else if (L % 5 === 0) r.push(['chest', 'wood']);
  return r;
}
function grantLevelReward(r) { // exclusive items you already own turn into coins
  if (!['coins', 'chest'].includes(r[0]) && ownsAny(r[0], r[1])) { addCoins(150); return '150 coins (dupe)'; }
  return grantReward(r, true);
}
function addPlayerXp(n) { stats.pxp = (stats.pxp || 0) + n; stats.xp = (stats.xp || 0) + n; saveStats(); }
// ----- collection book -----
const COLL_CATS = [['c', 'Colours'], ['h', 'Hats'], ['f', 'Faces'], ['k', 'Skins'], ['t', 'Trails'], ['v', 'Win effects'], ['u', 'Auras'], ['b', 'Ball skins'], ['a', 'Arenas'],
  ['pb', 'Borders'], ['pg', 'Backgrounds'], ['pt', 'Titles'], ['pe', 'Emblems']];
const COLL_MS = [[25, [['coins', 500], ['chest', 'gold']]], [50, [['coins', 1000], ['pt', 'curator']]], [75, [['coins', 2000], ['chest', 'myth']]], [100, [['coins', 5000], ['pt', 'completionist']]]];
function collItems(k) {
  if (k.startsWith('p')) return PROF[k].filter(it => it[3] !== 'creator' && it[3] !== 'prestige').map(it => it[0]);
  return shopList(k).map(p => p[0]).filter(id => !id.startsWith('pskin'));
}
function collStats() {
  let own = 0, tot = 0; const cats = COLL_CATS.map(([k, n]) => { const ids = collItems(k), o = ids.filter(id => ownsAny(k, id)).length; own += o; tot += ids.length; return { k, n, o, t: ids.length }; });
  return { cats, own, tot, pct: tot ? 100*own/tot : 0 };
}
function collClaimable() {
  const S = collStats(), cl = stats.collClaim || [];
  return COLL_MS.filter(([p]) => S.pct >= p && !cl.includes('m' + p)).length + S.cats.filter(c => c.o === c.t && !cl.includes('c' + c.k)).length;
}
function claimColl(key, rewards) {
  stats.collClaim = stats.collClaim || []; if (stats.collClaim.includes(key)) return;
  stats.collClaim.push(key); saveStats();
  const got = rewards.map(r => grantReward(r, true)); toast('Collection reward: ' + got.join(', ')); sfx.coin(); buzz([20, 30, 20]);
  renderLevels(); syncLevelBar();
}
// ----- menu level bar -----
function syncLevelBar() {
  const o = lvOf(stats.pxp), p = stats.prest || 0;
  $('#lvBarTxt').textContent = 'Level ' + o.L + (p ? ' · Prestige ' + ROMAN[p] : '');
  const nx = o.need ? levelRewards(o.L + 1).filter(r => r[0] !== 'coins').map(rewardText)[0] : null;
  $('#lvBarSub').textContent = (o.need ? fmt(o.into) + ' / ' + fmt(o.need) + ' XP' + (nx ? ' · next: ' + nx : '') : (p >= PRESTIGE_MAX ? 'Max level!' : 'Prestige ready!')) + ((stats.winStreak || 0) >= 2 ? ' · 🔥 ' + stats.winStreak + ' wins in a row' : '');
  $('#lvBarFill').style.width = (o.need ? 100*o.into/o.need : 100) + '%';
  const n = collClaimable(); $('#lvBadge').hidden = !n && !(o.L >= LV_CAP && p < PRESTIGE_MAX); $('#lvBadge').textContent = n ? n : '!';
}
function drawLevelBarBadge() { const cv = $('#lvBarCv'); if (!cv || $('#menu').hidden) return; const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); drawPrestigeBadge(c, stats.prest || 0, myLevel(), cv.width/2, cv.height/2, cv.width*0.36, clock); }
// ----- levels screen -----
let lvTab = 'road', presArmed = false;
function openLevels(tab) { lvTab = tab || lvTab; presArmed = false; mode = 'menu'; st = null; series = null; special = null; showScreen('levels'); renderLevels(); }
function rewardText(r) { return r[0] === 'coins' ? r[1] + ' coins' : rewardName(r); }
function renderLevels() {
  document.querySelectorAll('#levels .ltab').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === lvTab)));
  ['road', 'coll', 'pres'].forEach(t => $('#lv_' + t).hidden = t !== lvTab);
  const o = lvOf(stats.pxp), p = stats.prest || 0, cap = lvCap();
  $('#lvHeadName').textContent = 'Level ' + o.L + (p ? ' · Prestige ' + ROMAN[p] + ' ' + PRESTIGE_NAMES[p] : '');
  $('#lvHeadXp').textContent = o.need ? fmt(o.into) + ' / ' + fmt(o.need) + ' XP to level ' + (o.L + 1) : p >= PRESTIGE_MAX ? 'You reached the very top.' : 'Level ' + LV_CAP + ' reached. Prestige is ready when you are.';
  $('#lvHeadFill').style.width = (o.need ? 100*o.into/o.need : 100) + '%';
  if (lvTab === 'road') {
    const box = $('#lvRoad'); box.textContent = '';
    const from = cap > LV_CAP ? Math.max(1, o.L - 5) : 1, to = cap > LV_CAP ? Math.min(cap, o.L + 40) : cap;
    for (let L = from; L <= to; L++) {
      const row = document.createElement('div'), sp = LV_SPECIAL.includes(L) || L === LV_CAP;
      row.className = 'lvrow' + (L <= o.L ? ' got' : '') + (L === o.L + 1 ? ' next' : '') + (sp ? ' special' : '');
      const cv = document.createElement('canvas'); cv.width = 56; cv.height = 56; cv.className = 'lvbadge'; cv.dataset.lv = L;
      const mid = document.createElement('div');
      mid.append(Object.assign(document.createElement('b'), { textContent: 'Level ' + L + (sp ? (L === LV_CAP ? ' · PRESTIGE READY' : ' · MILESTONE') : '') }),
        Object.assign(document.createElement('small'), { textContent: levelRewards(L).map(rewardText).join(' · ') }));
      row.append(cv, mid, Object.assign(document.createElement('span'), { className: 'lvst', textContent: L <= o.L ? '✓' : '🔒' }));
      box.append(row);
      if (L === o.L + 1) setTimeout(() => row.scrollIntoView({ block: 'center' }), 50);
    }
  } else if (lvTab === 'coll') {
    renderStickers();
    const S = collStats(), cl = stats.collClaim || [];
    $('#collPct').textContent = S.pct.toFixed(1) + '%'; $('#collCount').textContent = S.own + ' / ' + S.tot + ' items collected';
    $('#collFill').style.width = S.pct + '%';
    const ms = $('#collMs'); ms.textContent = '';
    for (const [pc, rw] of COLL_MS) {
      const done = cl.includes('m' + pc), can = S.pct >= pc && !done, d = document.createElement('div'); d.className = 'cms' + (done ? ' done' : can ? ' can' : '');
      d.append(Object.assign(document.createElement('b'), { textContent: pc + '%' }), Object.assign(document.createElement('small'), { textContent: rw.map(rewardText).join(' + ') }));
      if (can) { const b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = 'Claim'; b.addEventListener('click', () => claimColl('m' + pc, rw)); d.append(b); }
      else d.append(Object.assign(document.createElement('span'), { textContent: done ? '✓' : '🔒' }));
      ms.append(d);
    }
    const cats = $('#collCats'); cats.textContent = '';
    for (const c of S.cats) {
      const d = document.createElement('div'), full = c.o === c.t, done = cl.includes('c' + c.k); d.className = 'ccat' + (full ? ' full' : '');
      const bar = document.createElement('i'); const f = document.createElement('b'); f.style.width = (c.t ? 100*c.o/c.t : 0) + '%'; bar.append(f);
      d.append(Object.assign(document.createElement('span'), { textContent: c.n }), bar, Object.assign(document.createElement('small'), { textContent: c.o + '/' + c.t }));
      if (full && !done) { const b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = '+200'; b.addEventListener('click', () => claimColl('c' + c.k, [['coins', 200]])); d.append(b); }
      else d.append(Object.assign(document.createElement('span'), { className: 'cst', textContent: done ? '✓' : '' }));
      cats.append(d);
    }
  } else {
    const ready = o.L >= LV_CAP && p < PRESTIGE_MAX;
    $('#presNow').textContent = p ? 'Prestige ' + ROMAN[p] + ' · ' + PRESTIGE_NAMES[p] : 'No prestige yet';
    $('#presInfo').textContent = p >= PRESTIGE_MAX ? 'Apex is the final prestige. Your level now goes all the way to 999.' :
      'Reach level ' + LV_CAP + ' to prestige. You go back to level 1 and earn the ' + PRESTIGE_NAMES[p + 1] + ' emblem plus its own exclusive paddle skin and card frame, the "Prestige ' + ROMAN[p + 1] + '" title, 1,000 coins and a Mythic chest. Coins, cosmetics and everything else stay. The level road rewards can be earned again. It is always your choice.';
    const b = $('#btnPrestige'); b.hidden = p >= PRESTIGE_MAX; b.disabled = !ready;
    b.textContent = !ready ? 'Reach level ' + LV_CAP + ' first (' + o.L + '/' + LV_CAP + ')' : presArmed ? 'Tap again to prestige for real' : 'Prestige to ' + PRESTIGE_NAMES[p + 1];
    b.classList.toggle('armed', presArmed);
  }
}
function drawLevelsFrame() {
  const hc = $('#lvHeadCv'); if (hc) { const c = hc.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, hc.width, hc.height); drawPrestigeBadge(c, stats.prest || 0, myLevel(), hc.width/2, hc.height/2, hc.width*0.36, clock); }
  if (lvTab === 'road' && Math.floor(clock*10) % 4 === 0) document.querySelectorAll('#lvRoad canvas').forEach(cv => { const r = cv.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return; const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); drawPrestigeBadge(c, stats.prest || 0, +cv.dataset.lv, cv.width/2, cv.height/2, cv.width*0.36, clock); });
  if (lvTab === 'pres') {
    const pc = $('#presCv'); const c = pc.getContext('2d'), w = pc.width, h = pc.height, p = stats.prest || 0;
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
    const cols = 7, cw = w/cols, ch = h/2;
    for (let k = 0; k <= PRESTIGE_MAX; k++) {
      const col = k % cols, row = Math.floor(k/cols), x = cw*(col + 0.5) + (row ? cw/2 : 0), y = ch*(row + 0.45);
      if (k <= p) drawPrestigeBadge(c, k, k === p ? myLevel() : 1, x, y, cw*0.3, clock);
      else drawBadgeSilhouette(c, k, x, y, cw*0.3, k === p + 1);
      c.globalAlpha = 1; c.fillStyle = k === p ? '#FFFFFF' : k <= p ? '#A49CD0' : '#4A4370'; c.font = '700 ' + Math.round(cw*0.095) + 'px "Chakra Petch", system-ui'; c.textAlign = 'center';
      c.fillText((k ? ROMAN[k] + ' ' : '') + (k <= p + 1 ? PRESTIGE_NAMES[k] : '???'), x, y + cw*0.47);
      if (k === p) { c.strokeStyle = PRESTIGE_COLS[k]; c.lineWidth = 2; c.beginPath(); c.arc(x, y, cw*0.43, 0, TAU); c.stroke(); }
    }
  }
}
// a locked emblem: pitch black with only a faint outline, so you can guess the shape but not much more
const silCv = [document.createElement('canvas'), document.createElement('canvas')];
function drawBadgeSilhouette(c, k, x, y, r, next) {
  const S = Math.ceil(r*3), [a, b] = silCv; for (const q of silCv) { if (q.width !== S) { q.width = S; q.height = S; } }
  const ca = a.getContext('2d'); ca.setTransform(1, 0, 0, 1, 0, 0); ca.clearRect(0, 0, S, S); drawPrestigeBadge(ca, k, 0, S/2, S/2, r, 0);
  ca.globalCompositeOperation = 'source-in'; ca.fillStyle = next ? '#5A4F9A' : '#3A3366'; ca.fillRect(0, 0, S, S); ca.globalCompositeOperation = 'source-over';
  const cb = b.getContext('2d'); cb.setTransform(1, 0, 0, 1, 0, 0); cb.clearRect(0, 0, S, S); cb.drawImage(a, 0, 0);
  cb.globalCompositeOperation = 'source-in'; cb.fillStyle = '#05030C'; cb.fillRect(0, 0, S, S); cb.globalCompositeOperation = 'source-over';
  c.save(); if (next) { c.shadowColor = '#B57CFF'; c.shadowBlur = 8 + 4*Math.sin(clock*3); }
  const o = Math.max(1.5, r*0.06); for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o]]) c.drawImage(a, x - S/2 + dx, y - S/2 + dy);
  c.shadowBlur = 0; c.drawImage(b, x - S/2, y - S/2); c.restore();
}
function doPrestige() {
  const o = lvOf(stats.pxp), p = stats.prest || 0;
  if (o.L < LV_CAP || p >= PRESTIGE_MAX) return;
  if (!presArmed) { presArmed = true; renderLevels(); return; }
  presArmed = false;
  stats.prest = p + 1; stats.pxp = 0; stats.lvSeen = 1; stats.readyShown = 0; saveStats();
  const rw = prestigeRewards(stats.prest), got = rw.map(r => grantReward(r, true));
  trackMax('prestige', stats.prest); pushProfile(); syncLevelBar(); liveSubmit('level', 'all', stats.prest*1000 + 1);
  startLvFx({ kind: 'prestige', p: stats.prest, from: p, lv: 1, rewards: got });
  renderLevels();
}
// ----- level up check (runs when you come back to the menu) -----
// ----- daily login calendar: come back every day, the rewards grow for 7 days -----
const LOGIN_RW = [[['coins', 50]], [['coins', 75]], [['chest', 'wood']], [['coins', 120]], [['coins', 150], ['chest', 'wood']], [['chest', 'gold']], [['coins', 300], ['chest', 'gold']]];
function loginCheck() {
  const today = arenaDay(); if (stats.loginDay === today || !$('#loginBox').hidden) return;
  const idx = stats.loginDay === prevArenaDay(today) ? ((stats.loginIdx || 0) + 1) % 7 : 0;
  const box = $('#loginDays'); box.textContent = '';
  LOGIN_RW.forEach((rw, i) => { const d = document.createElement('div'); d.className = 'lday' + (i < idx ? ' done' : i === idx ? ' today' : '');
    d.append(Object.assign(document.createElement('b'), { textContent: 'Day ' + (i + 1) }), Object.assign(document.createElement('small'), { textContent: rw.map(rewardText).join(' + ') }), Object.assign(document.createElement('span'), { textContent: i < idx ? '✓' : i === idx ? '🎁' : '' })); box.append(d); });
  $('#loginNote').textContent = idx ? 'Day ' + (idx + 1) + ' in a row! Miss a day and it starts over.' : 'Come back tomorrow for a bigger reward. 7 days in a row = jackpot.';
  $('#loginBox').hidden = false; $('#loginBox').dataset.idx = idx; tone(784, 0.1, 'triangle', 0.05); tone(1046, 0.15, 'triangle', 0.05, 1, 0.1);
}
function claimLogin() {
  const idx = +$('#loginBox').dataset.idx || 0, today = arenaDay();
  if (stats.loginDay === today) { $('#loginBox').hidden = true; return; }
  stats.loginDay = today; stats.loginIdx = idx; trackMax('loginStreak', idx + 1); saveStats();
  const got = LOGIN_RW[idx].map(r => grantReward(r, true)); sfx.coin(); buzz([20, 30, 60]);
  toast('Day ' + (idx + 1) + ' reward: ' + got.join(' + ')); $('#loginBox').hidden = true; syncCoinUI();
}
function lvCheck() {
  const o = lvOf(stats.pxp), seen = stats.lvSeen || 1;
  if (o.L > seen) {
    const got = [], merged = {}; let coinsSum = 0;
    for (let L = seen + 1; L <= o.L; L++) for (const r of levelRewards(L)) { if (r[0] === 'coins') coinsSum += r[1]; else got.push(grantLevelReward(r)); }
    if (coinsSum) { addCoins(coinsSum); got.unshift(fmt(coinsSum) + ' coins'); }
    stats.lvSeen = o.L; trackMax('plevel', o.L); saveStats(); syncLevelBar(); pushProfile(); liveSubmit('level', 'all', (stats.prest || 0)*1000 + o.L);
    const crossed = LV_SPECIAL.filter(v => v > seen && v <= o.L).pop();
    startLvFx({ kind: crossed || o.L === LV_CAP ? 'special' : 'normal', lv: o.L, from: seen, p: stats.prest || 0, rewards: got, milestone: crossed || (o.L === LV_CAP ? LV_CAP : 0) });
  }
  if (o.L >= LV_CAP && (stats.prest || 0) < PRESTIGE_MAX && !stats.readyShown) { stats.readyShown = 1; saveStats(); lvQueue.push({ kind: 'ready', lv: o.L, p: stats.prest || 0 }); if (!lvFx) nextLvFx(); }
}
// ----- the animation overlay -----
let lvFx = null, lvQueue = [], lvParts = [];
function startLvFx(a) { lvQueue.push(a); if (!lvFx) nextLvFx(); }
function nextLvFx() {
  lvFx = lvQueue.shift() || null; lvParts = [];
  const box = $('#lvFx'); box.hidden = !lvFx; if (!lvFx) { if (curScreen === 'menu') setTimeout(() => { if (lvFx) return; lvCheck(); if (!lvFx) loginCheck(); }, 300); return; }
  const A = lvFx; A.t = 0;
  box.className = 'lvfx ' + A.kind;
  const big = A.kind !== 'normal';
  $('#lvFxTop').textContent = A.kind === 'ready' ? 'PRESTIGE READY' : A.kind === 'prestige' ? 'PRESTIGE ' + ROMAN[A.p] : A.kind === 'special' ? (A.milestone === LV_CAP ? 'MAX LEVEL' : 'MILESTONE') : 'LEVEL UP!';
  $('#lvFxMain').textContent = A.kind === 'ready' ? 'Level ' + A.lv : A.kind === 'prestige' ? PRESTIGE_NAMES[A.p] : 'Level ' + A.lv;
  $('#lvFxSub').textContent = A.kind === 'ready' ? 'You can prestige to ' + PRESTIGE_NAMES[A.p + 1] + '. You go back to level 1 and keep everything else. Your choice, now or later.' :
    A.kind === 'prestige' ? 'Welcome to Prestige ' + ROMAN[A.p] + '. Back to level 1, with a brand new emblem.' : A.lv - A.from > 1 ? '+' + (A.lv - A.from) + ' levels' : '';
  const rw = $('#lvFxRw'); rw.textContent = '';
  for (const t of A.rewards || []) rw.append(Object.assign(document.createElement('span'), { textContent: t }));
  $('#lvFxBtns').hidden = A.kind !== 'ready'; $('#lvFxTap').hidden = A.kind === 'ready';
  // sound
  const notes = A.kind === 'normal' ? [523, 659, 784] : A.kind === 'special' ? [392, 523, 659, 784, 1046] : A.kind === 'ready' ? [220, 330, 440] : [262, 330, 392, 523, 659, 784, 1046, 1318];
  notes.forEach((f, i) => tone(f, big ? 0.35 : 0.18, 'triangle', 0.06, 1, i*(big ? 0.12 : 0.09)));
  if (big) { tone(110, 1.2, 'sawtooth', 0.04, 0.5); buzz([40, 40, 80, 40, 160]); } else buzz([20, 30, 40]);
}
function closeLvFx() { if (!lvFx || lvFx.t < 0.8) return; nextLvFx(); }
function drawLvFx(dt) {
  const A = lvFx; if (!A) return;
  A.t += dt;
  const cv = $('#lvFxCv'), dpr = Math.min(2, devicePixelRatio || 1), W2 = innerWidth, H2 = innerHeight;
  if (cv.width !== Math.round(W2*dpr) || cv.height !== Math.round(H2*dpr)) { cv.width = Math.round(W2*dpr); cv.height = Math.round(H2*dpr); }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W2, H2);
  const t = A.t, big = A.kind !== 'normal', col = PRESTIGE_COLS[A.kind === 'ready' ? Math.min(PRESTIGE_MAX, A.p + 1) : A.p] || '#FFD84A';
  const cx = W2/2, cy = H2*0.4, R = Math.min(W2, H2)*(big ? 0.17 : 0.12);
  if (A.lay !== W2 + 'x' + H2) { A.lay = W2 + 'x' + H2; $('#lvFxTop').style.top = Math.max(12, cy - R*1.5 - 56) + 'px'; $('#lvFxLow').style.top = (cy + R*1.3 + 6) + 'px'; }
  c.fillStyle = 'rgba(6,4,16,' + Math.min(big ? 0.9 : 0.72, t*2) + ')'; c.fillRect(0, 0, W2, H2);
  // god rays
  if (big) { c.save(); c.translate(cx, cy); c.rotate(t*0.25); c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 14; k++) { c.rotate(TAU/14); c.globalAlpha = Math.min(1, t)*0.09; c.fillStyle = k % 2 ? col : '#FFFFFF'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-R*0.5, -Math.max(W2, H2)); c.lineTo(R*0.5, -Math.max(W2, H2)); c.fill(); }
    c.restore(); }
  // glow
  const g = c.createRadialGradient(cx, cy, 0, cx, cy, R*2.6); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
  c.globalAlpha = 0.35*Math.min(1, t*2); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R*2.6, 0, TAU); c.fill(); c.globalAlpha = 1;
  // shockwave rings
  for (let k = 0; k < (big ? 3 : 1); k++) { const tt = t - 0.25 - k*0.25; if (tt > 0 && tt < 1.4) { c.strokeStyle = col; c.globalAlpha = 1 - tt/1.4; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R*(1 + tt*2.2), 0, TAU); c.stroke(); c.globalAlpha = 1; } }
  // particles
  if (!A.burst && t > 0.25) { A.burst = true; for (let k = 0; k < (big ? 160 : 60); k++) { const a = Math.random()*TAU, sp = 120 + Math.random()*(big ? 520 : 300); lvParts.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 0.8 + Math.random()*1.4, col: Math.random() < 0.5 ? col : ['#FFFFFF', '#FFD84A', '#3EE6FF', '#FF4F8B'][k % 4] }); } }
  const keep = []; for (const q of lvParts) { q.x += q.vx*dt; q.y += q.vy*dt; q.vx *= 0.985; q.vy = q.vy*0.985 + 90*dt; q.life -= dt; if (q.life > 0) { keep.push(q); c.globalAlpha = Math.min(1, q.life); c.fillStyle = q.col; c.fillRect(q.x - 1.5, q.y - 1.5, 3, 3); } } lvParts = keep; c.globalAlpha = 1;
  // the badge
  if (A.kind === 'prestige') {
    if (t < 1.4) { // old emblem shakes and cracks
      const sh = Math.min(1, t)*6; c.save(); c.translate((Math.random() - 0.5)*sh, (Math.random() - 0.5)*sh); drawPrestigeBadge(c, A.from, LV_CAP, cx, cy, R, clock); c.restore();
      c.strokeStyle = 'rgba(255,255,255,' + Math.min(1, t) + ')'; c.lineWidth = 2; for (let k = 0; k < 6; k++) { const a = k*1.1; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a)*R*Math.min(1.2, t), cy + Math.sin(a)*R*Math.min(1.2, t)); c.stroke(); }
      if (t > 1.3 && !A.shatter) { A.shatter = true; for (let k = 0; k < 120; k++) { const a = Math.random()*TAU, sp = 200 + Math.random()*500; lvParts.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1 + Math.random(), col: PRESTIGE_COLS[A.from] }); } tone(80, 0.8, 'sawtooth', 0.08, 0.4); }
    } else {
      const k = Math.min(1, (t - 1.4)/0.9), e = 1 - Math.pow(1 - k, 3);
      c.save(); c.globalAlpha = 0.6*(1 - k); c.fillStyle = '#FFFFFF'; c.fillRect(cx - R*0.3*(1 - k), 0, R*0.6*(1 - k), H2); c.restore(); // light pillar
      c.save(); c.translate(cx, cy); c.rotate((1 - e)*TAU*1.5); c.scale(0.2 + 0.8*e + 0.06*Math.sin(t*3), 0.2 + 0.8*e + 0.06*Math.sin(t*3)); drawPrestigeBadge(c, A.p, 1, 0, 0, R, clock); c.restore();
    }
  } else if (A.kind === 'ready') {
    const pulse = 0.5 + 0.5*Math.sin(t*3);
    c.save(); c.globalAlpha = 0.35 + 0.45*pulse; drawPrestigeBadge(c, Math.min(PRESTIGE_MAX, A.p + 1), 1, cx, cy, R*1.05, clock); c.restore();
    c.save(); c.globalAlpha = 0.9; drawPrestigeBadge(c, A.p, A.lv, cx - R*1.6, cy + R*0.9, R*0.45, clock); c.restore();
    c.fillStyle = '#FFFFFF'; c.font = Math.round(R*0.35) + 'px "Rubik Mono One", monospace'; c.textAlign = 'center'; c.fillText('➜', cx - R*0.95, cy + R*1.0);
  } else {
    const k = Math.min(1, t/0.55), e = k < 1 ? 1 + 2.2*Math.pow(k - 1, 3) + 1.2*Math.pow(k - 1, 2) : 1, s = big ? (t < 0.6 ? 2.6 - 1.6*Math.min(1, t/0.6) : 1) : e;
    c.save(); c.translate(cx, cy); if (big) c.rotate(Math.max(0, 0.6 - t)*4); c.scale(s*(1 + 0.04*Math.sin(t*4)), s*(1 + 0.04*Math.sin(t*4))); drawPrestigeBadge(c, A.p, A.lv, 0, 0, R, clock); c.restore();
  }
  if (A.kind === 'normal' && t > 3.6) nextLvFx();
}

