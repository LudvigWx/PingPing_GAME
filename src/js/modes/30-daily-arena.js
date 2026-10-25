// ---------- Daily Arena: one generated arena per day, chase your best rally ----------
const DAILY_ADJ = ['Neon', 'Molten', 'Frozen', 'Twisted', 'Electric', 'Hollow', 'Cosmic', 'Rusty', 'Velvet', 'Toxic', 'Golden', 'Haunted', 'Prism', 'Thunder'];
const DAILY_NOUN = ['Garden', 'Reactor', 'Maze', 'Orbit', 'Furnace', 'Lagoon', 'Circuit', 'Spire', 'Vortex', 'Bazaar', 'Temple', 'Hive', 'Arcade', 'Engine'];
const DAILY_MEDALS = [['Bronze', '#E8A951', 60, 20], ['Silver', '#C9D6F2', 120, 30], ['Gold', '#FFD84A', 250, 50]]; // name, colour, coins, pass xp
let dailyRun = false;
function arenaDay(d) { d = d || new Date(); return d.getFullYear()*10000 + (d.getMonth() + 1)*100 + d.getDate(); }
function prevArenaDay(k) { const d = new Date(Math.floor(k/10000), Math.floor(k/100) % 100 - 1, k % 100); d.setDate(d.getDate() - 1); return arenaDay(d); }
function dailyLevel(day) {
  const r = seeded(day*7919 + 104729); for (let k = 0; k < 9; k++) r();
  const pk = a => a[Math.floor(r()*a.length)], objs = [], at = (a, d) => [Math.cos(a)*d, Math.sin(a)*d];
  const cen = pk(['bump', 'spin', 'hole', 'rock', 'none', 'bump', 'spin']);
  if (cen === 'bump') objs.push({ t: 'bump', x: 0, y: 0, r: 0.07 + r()*0.03 });
  else if (cen === 'spin') objs.push({ t: 'spin', x: 0, y: 0, r: 0.12 + r()*0.04, w: (r() < 0.5 ? -1 : 1)*(1.2 + r()*1.2) });
  else if (cen === 'hole') objs.push({ t: 'hole', x: 0, y: 0, r: 0.045 + r()*0.02 });
  else if (cen === 'rock') objs.push({ t: 'rock', x: 0, y: 0, r: 0.06 + r()*0.03 });
  const rings = r() < 0.6 ? 2 : 1, kinds = [];
  for (let q = 0; q < rings; q++) {
    let kind = pk(['bump', 'rock', 'brick', 'boost', 'mover', 'spot', 'lava', 'spin', 'bump', 'boost']); while (kinds.includes(kind)) kind = pk(['bump', 'rock', 'brick', 'boost', 'mover', 'spot', 'lava']); kinds.push(kind);
    const base = q === 0 ? Math.PI/2 : Math.PI/2 + Math.PI/3, d = q === 0 ? 0.24 + r()*0.08 : 0.34 + r()*0.05, sz = r(), spin = r() < 0.5 ? -1 : 1;
    for (let k = 0; k < 3; k++) {
      const a = base + k*TAU/3, [x, y] = at(a, d);
      if (kind === 'bump') objs.push({ t: 'bump', x, y, r: 0.04 + sz*0.025 });
      else if (kind === 'rock') objs.push({ t: 'rock', x, y, r: 0.04 + sz*0.025 });
      else if (kind === 'brick') objs.push({ t: 'brick', x, y, hp: 2 + Math.round(sz), s: 0.06 });
      else if (kind === 'boost') objs.push({ t: 'boost', x, y, a: a + spin*Math.PI/2 });
      else if (kind === 'mover') { const [x2, y2] = at(a + spin*0.6, d); objs.push({ t: 'mover', x, y, x2, y2, r: 0.04, w: 0.8 + sz*0.8 }); }
      else if (kind === 'spot') objs.push({ t: 'spot', x, y });
      else if (kind === 'lava') objs.push({ t: 'lava', x, y, r: 0.06 + sz*0.02 });
      else if (kind === 'spin') objs.push({ t: 'spin', x, y, r: 0.07, w: spin*(1.5 + sz) });
    }
  }
  const rules = { lives: 3, speed: 1 + Math.round(r()*3)*0.05, size: 1, serve: r() < 0.15 ? 2 : 1, pu: pk(['on', 'on', 'storm']), grav: pk(['none', 'none', 'none', 'spin', 'wind', 'center']), paddle: 1, goal: 'last', goalV: 5, bots: 1.0 };
  return cleanLevel({ name: pk(DAILY_ADJ) + ' ' + pk(DAILY_NOUN), sides: 3, ar: pk(['classic', 'retro', 'ice', 'hole']), rules, objs });
}
// Medal targets scale a little with how wild the day's rules are.
function dailyTargets(L) { const k = (L.rules.serve > 1 ? 1.25 : 1)*(L.rules.pu === 'storm' ? 1.1 : 1); return [1200, 3500, 7000].map(v => Math.round(v*k/100)*100); }
function dailyData() {
  const d = storeJSON('trepong-daily-arena', {}) || {}, today = arenaDay();
  if (d.day !== today) { d.day = today; d.best = 0; d.medals = 0; d.plays = 0; }
  d.streak = d.streak || 0; d.golds = d.golds || 0; return d;
}
function saveDaily(d) { store('trepong-daily-arena', JSON.stringify(d)); }
function syncDailyBadge() { const d = dailyData(); $('#arenaNew').hidden = !!d.plays; $('#arenaNew').textContent = 'DAILY'; }
function playDaily() { dailyRun = true; const L = dailyLevel(arenaDay()); playLevel = L; editReturn = false; menuN = 3; startPractice('custom'); }
function dailyResolve() {
  const el = $('#dailyRes'); el.hidden = true; if (!dailyRun || !st || mySeat < 0) return;
  const today = arenaDay(), L = dailyLevel(today), T = dailyTargets(L), d = dailyData(), sc = Math.round(st.best);
  d.plays = (d.plays || 0) + 1; const wasBest = sc > d.best; d.best = Math.max(d.best, sc);
  let got = 0; while (got < 3 && d.best >= T[got]) got++;
  const fresh = [];
  for (let m = d.medals; m < got; m++) { const M = DAILY_MEDALS[m]; addCoins(M[2]); addBpXp(M[3], 'Daily Arena'); fresh.push(M[0]); if (m === 2) { d.golds++; track('dailyGolds'); if (d.golds >= 3) unlockSecret('v', 'singularity'); } }
  if (got > 0 && d.medals === 0) { d.streak = d.lastDay === prevArenaDay(today) ? d.streak + 1 : 1; d.lastDay = today; if (d.streak % 7 === 0) grantReward(['chest', 'gold']); else if (d.streak % 3 === 0) { freeChests++; saveFree(); } }
  d.medals = Math.max(d.medals, got); saveDaily(d); syncDailyBadge(); liveSubmit('daily', String(today), d.best);
  el.hidden = false;
  el.textContent = 'Daily Arena · best rally ' + fmt(sc) + (wasBest ? ' (new best today!)' : '') + (fresh.length ? ' · 🏅 ' + fresh.join(', ') + ' medal' + (fresh.length > 1 ? 's' : '') + '! +' + fresh.reduce((a, n) => a + DAILY_MEDALS[['Bronze', 'Silver', 'Gold'].indexOf(n)][2], 0) + ' coins' : got < 3 ? ' · next medal at ' + fmt(T[got]) : ' · all medals today!') + (d.streak > 1 && fresh.length && d.lastDay === today ? ' · 🔥 ' + d.streak + '-day streak' : '');
}
function renderDaily() {
  const today = arenaDay(), L = dailyLevel(today), T = dailyTargets(L), d = dailyData();
  drawArenaThumb($('#dailyCv'), L);
  $('#dailyName').textContent = L.name;
  const R = L.rules;
  $('#dailyDesc').textContent = 'You vs 2 bots · 3 lives' + (R.serve > 1 ? ' · double serve' : '') + (R.pu === 'storm' ? ' · power-up storm' : '') + (R.grav !== 'none' ? ' · ' + ({ spin: 'spinning gravity', wind: 'space wind', center: 'pull to the middle' })[R.grav] : '') + '. Your best single rally counts.';
  const box = $('#dailyMedals'); box.textContent = '';
  DAILY_MEDALS.forEach((M, i) => { const s = document.createElement('span'); s.className = 'medal' + (d.medals > i ? ' got' : ''); s.style.setProperty('--mc', M[1]); s.textContent = (d.medals > i ? '🏅 ' : '') + M[0] + ' ' + fmt(T[i]); box.append(s); });
  $('#dailyBest').textContent = (d.plays ? 'Best today: ' + fmt(d.best) : 'Not played today yet') + (d.streak ? ' · 🔥 streak ' + d.streak + (d.lastDay === today || d.lastDay === prevArenaDay(today) ? '' : ' (lost)') : '') + ' · gold medals: ' + d.golds;
  const now = new Date(), next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), mins = Math.max(1, Math.round((next - now)/60000));
  $('#dailyLeft').textContent = 'new in ' + (mins >= 60 ? Math.floor(mins/60) + 'h ' : '') + (mins % 60) + 'm';
}
function playLevelPractice(L, fromEditor) {
  dailyRun = false;
  playLevel = cleanLevel(L); editReturn = !!fromEditor;
  menuN = playLevel.sides; startPractice('custom');
}
