// ---------- stats, achievements & daily challenges ----------
let stats = storeJSON('trepong-stats', {}), daily = storeJSON('trepong-daily', null);
let statTimer = 0;
function dayKey() { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate(); }
function ensureDaily() { if (!daily || daily.date !== dayKey()) daily = { date: dayKey(), c: {}, claimed: [] }; }
function saveStats() { clearTimeout(statTimer); statTimer = setTimeout(() => { store('trepong-stats', JSON.stringify(stats)); store('trepong-daily', JSON.stringify(daily)); syncQuestBadge(); }, 400); }
function track(k, n) { ensureDaily(); n = n == null ? 1 : n; stats[k] = (stats[k] || 0) + n; daily.c[k] = (daily.c[k] || 0) + n; checkAch(); saveStats(); }
function trackMax(k, v) { ensureDaily(); let ch = false; if (v > (stats[k] || 0)) { stats[k] = v; ch = true; } if (v > (daily.c[k] || 0)) { daily.c[k] = v; ch = true; } if (ch) { checkAch(); saveStats(); } }
// [id, name, description, stat key, target, reward]
const ACH = [
  ['rdn1', 'Nightmare walker', 'Clear a raid on Nightmare.', 'nightmareClears', 1, 300], ['rd1', 'Raider', 'Clear a raid.', 'raidClears', 1, 80], ['rd10', 'Raid veteran', 'Clear 10 raids.', 'raidClears', 10, 300],
  ['ad1', 'Into the unknown', 'Clear an adventure stage.', 'advClears', 1, 40], ['ad25', 'Explorer', 'Clear 25 adventure stages.', 'advClears', 25, 150],
  ['adw1', 'Light bringer', 'Clear an adventure world.', 'worldsCleared', 1, 200], ['adw3', 'Savior of the Paddleverse', 'Clear 3 adventure worlds.', 'worldsCleared', 3, 400], ['adb3', 'World boss hunter', 'Defeat 3 world bosses.', 'advBosses', 3, 250],
  ['m1', 'First match', 'Play a match.', 'matches', 1, 10],
  ['m10', 'Regular', 'Play 10 matches.', 'matches', 10, 30],
  ['m50', 'Ping pong addict', 'Play 50 matches.', 'matches', 50, 100],
  ['m200', 'Lifestyle', 'Play 200 matches.', 'matches', 200, 300],
  ['w1', 'First victory', 'Win a match.', 'wins', 1, 15],
  ['w10', 'Winner mindset', 'Win 10 matches.', 'wins', 10, 50],
  ['w50', 'Legend', 'Win 50 matches.', 'wins', 50, 150],
  ['s1', 'Series master', 'Win a series.', 'seriesWins', 1, 40],
  ['s5', 'Dynasty', 'Win 5 series.', 'seriesWins', 5, 120],
  ['b1', 'Boss slayer', 'Defeat the boss.', 'bossWins', 1, 50],
  ['b5', 'Boss hunter', 'Defeat the boss 5 times.', 'bossWins', 5, 150],
  ['h100', 'Hundred hits', 'Hit the ball 100 times.', 'hits', 100, 20],
  ['h1000', 'Thousand hits', 'Hit the ball 1,000 times.', 'hits', 1000, 80],
  ['h5000', 'Rubber arm', 'Hit the ball 5,000 times.', 'hits', 5000, 250],
  ['r20', 'Long rally', 'Be part of a 20-hit rally.', 'rallyHits', 20, 25],
  ['r50', 'Infinity', 'Be part of a 50-hit rally.', 'rallyHits', 50, 100],
  ['rs1k', 'Thousand pointer', 'Reach 1,000 points in a rally.', 'rallySc', 1000, 30],
  ['rs5k', 'Score machine', 'Reach 5,000 points in a rally.', 'rallySc', 5000, 120],
  ['ts3k', 'Team player', 'Reach 3,000 team score in a match.', 'teamScore', 3000, 40],
  ['p25', 'Collector', 'Grab 25 power-ups.', 'powers', 25, 30],
  ['p200', 'Power-junkie', 'Grab 200 power-ups.', 'powers', 200, 120],
  ['sm1', 'First lightning', 'Use supersmash.', 'smashes', 1, 15],
  ['sm50', 'Thunder god', 'Use supersmash 50 times.', 'smashes', 50, 100],
  ['sg10', 'Blitz', 'Score 10 goals with supersmash.', 'smashGoals', 10, 60],
  ['cl1', 'Heart in your throat', 'Win with one life left.', 'clutch', 1, 40],
  ['fl1', 'Flawless', 'Win without losing a life.', 'flawless', 1, 60],
  ['fl5', 'Untouchable', 'Win 5 matches without losing a life.', 'flawless', 5, 200],
  ['ep1', 'Epic draw', 'Pick an epic card.', 'epicPicks', 1, 20],
  ['cu1', 'Deal with the devil', 'Pick a cursed card.', 'cursedPicks', 1, 20],
  ['cw1', 'The pact held', 'Win a match with a cursed card.', 'cursedWins', 1, 60],
  ['mb5', 'Bullet rain', 'Have 5 balls in play at once.', 'maxBalls', 5, 40],
  ['sh10', 'The wall', 'Get saved by a shield 10 times.', 'shieldSaves', 10, 40],
  ['on1', 'Not alone', 'Play a match online.', 'online', 1, 20],
  ['on3', 'Full house', 'Play online with three humans.', 'online3', 1, 50],
  ['em20', 'Chatterbox', 'Send 20 emotes.', 'emotes', 20, 20],
  ['bu1', 'Shopper', 'Buy something in the shop.', 'buys', 1, 15],
  ['bu10', 'Fashion icon', 'Buy 10 things in the shop.', 'buys', 10, 100],
  ['ar4', 'World traveler', 'Play in all four arenas.', 'arenaCount', 4, 80],
  ['pr10', 'Practice addict', 'Play 10 practice matches.', 'practice', 10, 20],
  ['co1k', 'Rich', 'Earn 1,000 coins in total.', 'coinsEarned', 1000, 100],
  ['tw1', 'The climber', 'Clear floor 1 of the Tower.', 'towerFloor', 1, 25],
  ['tw5', 'Halfway', 'Clear floor 5 of the Tower.', 'towerFloor', 5, 100],
  ['tw10', 'Champion', 'Clear floor 10 of the Tower.', 'towerFloor', 10, 300],
  ['tw15', 'Beyond the top', 'Clear floor 15 of the Tower.', 'towerFloor', 15, 400],
  ['ch10', 'Chaos lover', 'Play 10 matches with the Chaos Wheel.', 'chaosMatches', 10, 50],
  ['he25', 'Superhero', 'Use your hero 25 times.', 'heroUses', 25, 50],
  ['six1', 'The whole gang', 'Play a match with 6 players.', 'sixMatch', 1, 30],
  ['cs1', 'Treasure hunter', 'Open a chest.', 'chests', 1, 20],
  ['cs20', 'Chest king', 'Open 20 chests.', 'chests', 20, 150],
  ['lv10', 'Veteran', 'Reach player level 10.', 'plevel', 10, 120],
  ['hm10', 'Master hero', 'Get a hero to level 10.', 'heroMax', 10, 200],
  ['cup1', 'Trophy winner', 'Win a tournament.', 'cupWins', 1, 80],
  ['cup5', 'Tournament machine', 'Win 5 tournaments.', 'cupWins', 5, 250],
  ['wk1', 'Hero of the week', 'Defeat the weekly boss.', 'weeklyWins', 1, 60]
];
// [id, text, stat key, target, reward]
const CHALLENGES = [
  ['dw2', 'Win 2 matches', 'wins', 2, 40], ['dm3', 'Play 3 matches', 'matches', 3, 25], ['dh60', 'Make 60 hits', 'hits', 60, 30],
  ['dp8', 'Grab 8 power-ups', 'powers', 8, 35], ['ds3', 'Use supersmash 3 times', 'smashes', 3, 30], ['dr15', 'Be part of a 15-hit rally', 'rallyHits', 15, 35],
  ['dse', 'Win a series', 'seriesWins', 1, 60], ['db1', 'Defeat the boss', 'bossWins', 1, 60], ['dsg2', 'Score 2 goals with supersmash', 'smashGoals', 2, 40],
  ['don', 'Play a match online', 'online', 1, 40], ['dfl', 'Win without losing a life', 'flawless', 1, 70], ['dem', 'Send 5 emotes', 'emotes', 5, 15],
  ['dts', 'Reach 2,000 team score in a match', 'teamScore', 2000, 40], ['dsh', 'Get saved by a shield 3 times', 'shieldSaves', 3, 30], ['dcl', 'Win with one life left', 'clutch', 1, 45],
  ['dtw', 'Clear a Tower floor', 'towerWins', 1, 60], ['dhe', 'Use your hero 5 times', 'heroUses', 5, 30], ['dch', 'Play 2 matches with the Chaos Wheel', 'chaosMatches', 2, 35]
];
const ACH_CATS = [['daily', 'Daily'], ['match', 'Matches'], ['skill', 'Skill'], ['mode', 'Modes'], ['collect', 'Collector'], ['social', 'Social'], ['adv', 'Adventure']];
const ACH_CAT = {
  match: ['m1', 'm10', 'm50', 'm200', 'w1', 'w10', 'w50', 'pr10'],
  skill: ['h100', 'h1000', 'h5000', 'r20', 'r50', 'rs1k', 'rs5k', 'ts3k', 'sm1', 'sm50', 'sg10', 'cl1', 'fl1', 'fl5', 'mb5', 'sh10'],
  mode: ['cup1', 'cup5', 'wk1', 's1', 's5', 'b1', 'b5', 'tw1', 'tw5', 'tw10', 'tw15', 'ch10', 'he25', 'ep1', 'cu1', 'cw1'],
  collect: ['p25', 'p200', 'bu1', 'bu10', 'ar4', 'co1k', 'cs1', 'cs20', 'lv10', 'hm10'],
  social: ['on1', 'on3', 'em20', 'six1'],
  adv: ['ad1', 'ad25', 'adw1', 'adw3', 'adb3', 'rd1', 'rd10', 'rdn1']
};
function achCat(id) { for (const k in ACH_CAT) if (ACH_CAT[k].includes(id)) return k; return 'match'; }
function todaysChallenges() {
  let h = 0; for (const ch of dayKey()) h = (h*31 + ch.charCodeAt(0)) >>> 0;
  const idx = [], rnd = () => (h = (h*1103515245 + 12345) >>> 0) / 4294967296;
  while (idx.length < 3) { const i = Math.floor(rnd()*CHALLENGES.length); if (!idx.includes(i)) idx.push(i); }
  return idx.map(i => CHALLENGES[i]);
}
let achClaimed = new Set(storeJSON('trepong-ach', [])), achSeen = new Set(storeJSON('trepong-achseen', []));
function achDone(a) { return (stats[a[3]] || 0) >= a[4]; }
function checkAch() {
  for (const a of ACH) if (achDone(a) && !achSeen.has(a[0])) {
    achSeen.add(a[0]); store('trepong-achseen', JSON.stringify([...achSeen]));
    toast('Achievement unlocked: ' + a[1] + '! Claim ' + a[5] + ' coins in the menu.');
  }
  syncQuestBadge();
}
function claimableCount() {
  ensureDaily();
  const d = todaysChallenges().filter(c => (daily.c[c[2]] || 0) >= c[3] && !daily.claimed.includes(c[0])).length;
  const a = ACH.filter(x => achDone(x) && !achClaimed.has(x[0])).length;
  return d + a;
}
function syncQuestBadge() { const n = claimableCount(), b = $('#questBadge'); b.hidden = n === 0; b.textContent = n; }
let questTab = 'daily';
function questRows(tab) {
  if (tab === 'daily') return todaysChallenges().map(c => ({ id: c[0], name: c[1], desc: '', have: daily.c[c[2]] || 0, need: c[3], reward: c[4], claimed: daily.claimed.includes(c[0]), kind: 'd' }));
  return ACH.filter(a => achCat(a[0]) === tab)
    .map(a => ({ id: a[0], name: a[1], desc: a[2], have: stats[a[3]] || 0, need: a[4], reward: a[5], claimed: achClaimed.has(a[0]), kind: 'a' }))
    .sort((x, y) => (x.claimed - y.claimed) || ((y.have >= y.need) - (x.have >= x.need)) || (y.have/y.need - x.have/x.need));
}
function renderQuests() {
  ensureDaily(); syncCoinUI(); $('#questCoins').textContent = fmt(coins);
  const tabs = $('#questTabs'); tabs.textContent = '';
  for (const [k, n] of ACH_CATS) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.q = k; b.textContent = n;
    b.setAttribute('aria-pressed', String(k === questTab));
    const waiting = questRows(k).filter(r => r.have >= r.need && !r.claimed).length;
    if (waiting) { const s = document.createElement('span'); s.className = 'tb'; s.textContent = waiting; b.append(s); }
    b.addEventListener('click', () => { questTab = k; renderQuests(); $('#quests').scrollTop = 0; });
    tabs.append(b);
  }
  const list = $('#questList'); list.textContent = '';
  const now = new Date(), mid = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), hrs = Math.ceil((mid - now) / 3600000);
  const rows = questRows(questTab);
  const ready = rows.filter(r => r.have >= r.need && !r.claimed);
  const ca = $('#btnClaimAll'); ca.hidden = ready.length < 2;
  ca.textContent = 'Claim all (' + ready.reduce((a, r) => a + r.reward, 0) + ' coins)';
  ca.onclick = () => { ready.forEach(r => claimQuest(r, true)); renderQuests(); syncQuestBadge(); };
  $('#questNote').textContent = questTab === 'daily' ? 'New challenges in ' + hrs + (hrs === 1 ? ' hour.' : ' hours.')
    : rows.filter(r => r.have >= r.need).length + ' of ' + rows.length + ' done in this category. Total ' + ACH.filter(achDone).length + ' of ' + ACH.length + '.';
  for (const r of rows) {
    const done = r.have >= r.need;
    const el = document.createElement('div'); el.className = 'quest' + (done ? ' done' : '') + (r.claimed ? ' claimed' : '');
    const left = document.createElement('div');
    const b = document.createElement('b'); b.textContent = r.name; left.append(b);
    if (r.desc) { const pp = document.createElement('p'); pp.textContent = r.desc; left.append(pp); }
    const side = document.createElement('div'); side.className = 'qside';
    if (done && !r.claimed) {
      const btn = document.createElement('button'); btn.type = 'button'; btn.textContent = 'Claim ' + r.reward;
      btn.addEventListener('click', () => claimQuest(r));
      side.append(btn);
    } else {
      const c = document.createElement('span'); c.className = 'coin'; c.textContent = r.claimed ? 'Claimed' : String(r.reward); side.append(c);
    }
    const pr = document.createElement('span'); pr.className = 'qprog'; pr.textContent = fmt(Math.min(r.have, r.need)) + ' / ' + fmt(r.need); side.append(pr);
    const bar = document.createElement('div'); bar.className = 'qbar'; const fill = document.createElement('i'); fill.style.width = (Math.min(1, r.have / r.need)*100) + '%'; bar.append(fill);
    el.append(left, side, bar); list.append(el);
  }
}
function claimQuest(r, many) {
  if (r.kind === 'd') { if (daily.claimed.includes(r.id)) return; daily.claimed.push(r.id); }
  else { if (achClaimed.has(r.id)) return; achClaimed.add(r.id); store('trepong-ach', JSON.stringify([...achClaimed])); }
  addCoins(r.reward); sfx.coin(); buzz(20); saveStats(); store('trepong-daily', JSON.stringify(daily));
  if (typeof addBpXp === 'function') addBpXp(r.kind === 'd' ? 25 : 10);
  if (!many) { renderQuests(); syncQuestBadge(); }
}
function secretLocked(k, id) { return !!SECRETS[k + ':' + id] && !ownsItem(k, id); }
function unlockSecret(k, id) {
  if (!SECRETS[k + ':' + id] || owned.has(k + ':' + id)) return;
  owned.add(k + ':' + id); saveWallet(); track('secrets');
  setTimeout(() => { toast('🔓 SECRET UNLOCKED: ' + itemName(k, id) + ' (' + KIND_NAME[k].toLowerCase() + ')!'); tone(523, 0.12, 'triangle', 0.06); tone(784, 0.12, 'triangle', 0.06, 1, 0.12); tone(1046, 0.3, 'triangle', 0.06, 1, 0.24); buzz([30, 40, 30, 40, 120]); }, 300);
}
function drawSecretChip(cv) {
  const c = cv.getContext('2d'), w = cv.width, h = cv.height; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  const g = c.createLinearGradient(0, 0, w, h), o = (clock*0.4) % 1;
  g.addColorStop(0, '#1A1238'); g.addColorStop(Math.max(0, o - 0.15), '#1A1238'); g.addColorStop(o, '#5A3FA8'); g.addColorStop(Math.min(1, o + 0.15), '#1A1238'); g.addColorStop(1, '#1A1238');
  c.fillStyle = g; rr(c, 6, 4, w - 12, h - 8, 10); c.fill();
  c.strokeStyle = 'rgba(181,124,255,0.6)'; c.setLineDash([3, 3]); c.lineDashOffset = -clock*10; c.lineWidth = 1.2; rr(c, 6, 4, w - 12, h - 8, 10); c.stroke(); c.setLineDash([]);
  c.fillStyle = '#E8D8FF'; c.font = '20px "Rubik Mono One", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowColor = '#B57CFF'; c.shadowBlur = 10;
  c.fillText('?', w/2 + Math.sin(clock*2)*2, h/2 + 1); c.shadowBlur = 0;
}
function trackMatchEnd(earned) {
  if (mySeat < 0) return;
  { const w0 = st.boss ? st.winner === -2 : st.winner === mySeat; addBpXp(10 + (w0 ? 10 : 0)); }
  { const w1 = st.boss ? st.winner === -2 : st.winner === mySeat, xg = 25 + (earned || 0) + (w1 ? 20 : 0); track('xp', xg); stats.pxp = (stats.pxp || 0) + xg; saveStats(); }
  if (myHero !== 'none') giveHeroXp(myHero, 5);
  if (((stats.matches || 0) + 1) % 5 === 0) { freeChests++; saveFree(); setTimeout(() => toast('You got a free wooden chest! Open it in Chests.'), 2200); }
  pushProfile();
  const boss = !!st.boss, won = boss ? st.winner === -2 : st.winner === mySeat;
  track('matches');
  if (mode === 'practice') track('practice');
  if (mode === 'host' || mode === 'guest') { track('online'); if (hostSeats.filter(Boolean).length >= 3) track('online3'); }
  stats.winStreak = won ? (stats.winStreak || 0) + 1 : 0; trackMax('bestStreak', stats.winStreak);
  if (won && stats.winStreak >= 5) unlockSecret('k', 'prism');
  if (won && new Date().getHours() < 5) unlockSecret('f', 'owl');
  if (won) {
    track('wins'); if (boss) track('bossWins');
    if (st.lives[mySeat] === 1) track('clutch');
    if (st.lives[mySeat] >= st.maxL[mySeat]) track('flawless');
    if ((st.cards[mySeat] || []).some(k => CARDS[k].r === 'x')) track('cursedWins');
  }
  trackMax('teamScore', st.tot); trackMax('rallySc', st.best);
  if (!st.boss && !st.raid && !st.lv && st.n >= 2 && st.n <= 6) liveSubmit('rally' + st.n, 'all', st.best);
  if (st.boss && st.boss.floor) liveSubmit('tower', 'all', towerCleared());
  if (st.raid) setTimeout(() => liveSubmit('raids', 'all', stats.raidClears || 0), 500);
  if (st.mut) track('chaosMatches');
  if (st.n >= 6 && !st.boss) track('sixMatch');
  const ars = new Set(stats.arenas || []); ars.add(st.ar); stats.arenas = [...ars]; trackMax('arenaCount', ars.size);
}

