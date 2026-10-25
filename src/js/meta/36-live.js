// ---------- live: players online right now + global leaderboards (Firebase, web version only) ----------
// Firebase Realtime Database layout (see database.rules.json):
//   presence/<uid> = { m: what they are doing, t: last heartbeat }
//   boards/<board>/<period>/<uid> = { n: name, s: score, t: time }
const LIVE_CFG = {
  apiKey: 'AIzaSyD0WCKWFhvrs_EpT8pNZW7PUR6i_f1KeYY',
  authDomain: 'trepong-c44d8.firebaseapp.com',
  databaseURL: 'https://trepong-c44d8-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'trepong-c44d8',
  storageBucket: 'trepong-c44d8.firebasestorage.app',
  messagingSenderId: '113130426744',
  appId: '1:113130426744:web:ecf21d30ea127be894388d'
};
const LIVE_SDK = ['app', 'auth', 'database'].map(p => 'https://cdn.jsdelivr.net/npm/firebase@10.12.2/firebase-' + p + '-compat.js');
// board id: [title, period function, lower is better, score formatter]
const LIVE_BOARDS = {
  daily: ['Daily Arena', () => String(arenaDay()), false, s => fmt(s)],
  rally: ['Best rally', () => 'all', false, s => fmt(s)],
  tower: ['Champion Tower', () => 'all', false, s => 'Floor ' + s],
  weekly: ['Weekly boss', () => String(weekId()), true, s => fmtTime(s/10)],
  raids: ['Raid clears', () => 'all', false, s => s + (s === 1 ? ' clear' : ' clears')],
  level: ['Highest level', () => 'all', false, s => (Math.floor(s/1000) ? 'P' + ROMAN[Math.floor(s/1000)] + ' · ' : '') + 'Lv ' + (s % 1000)]
};
const LIVE_MODES = { menu: '🏠 Menu', practice: '🤖 Vs bots', online: '🌐 Online rooms', adv: '🗺️ Adventure', raid: '⚔️ Raids', tower: '🗼 Tower', daily: '🏟️ Daily Arena', build: '🛠️ Arena Builder', cup: '🏆 Cup' };
const Live = { ok: false, uid: null, db: null, off: 0, online: [], mode: '', subs: {}, tops: {} };
function liveLoad(src) { return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.append(s); }); }
async function liveInit() {
  if (!window.PeerRoom || Live.started) return; // only the GitHub Pages version talks to Firebase
  Live.started = true;
  try {
    for (const src of LIVE_SDK) await liveLoad(src);
    const fb = window.firebase; fb.initializeApp(LIVE_CFG);
    Live.db = fb.database();
    Live.db.ref('.info/serverTimeOffset').on('value', s => { Live.off = s.val() || 0; });
    fb.auth().onAuthStateChanged(u => { if (!u) return; Live.uid = u.uid; Live.ok = true; livePresence(); liveSubmitAll(); liveWatch(); });
    await fb.auth().signInAnonymously();
  } catch (e) { Live.ok = false; }
}
function liveNow() { return Date.now() + Live.off; }
function liveMode() {
  if (curScreen && curScreen !== 'over' && curScreen !== 'pick') return ({ adv: 'adv', story: 'adv', raid: 'raid', build: 'build', arenas: 'build', lobby: 'online', tower: 'tower', cup: 'cup' })[curScreen] || 'menu';
  if (mode === 'host' || mode === 'guest') return 'online';
  if (special === 'adv') return 'adv';
  if (st && st.raid) return 'raid';
  if (dailyRun) return 'daily';
  if (special === 'cup') return 'cup';
  if (st && st.boss && st.boss.floor) return 'tower';
  return st ? 'practice' : 'menu';
}
function livePresence() {
  if (!Live.ok) return;
  const ref = Live.db.ref('presence/' + Live.uid);
  ref.onDisconnect().remove();
  Live.mode = liveMode(); ref.set({ m: Live.mode, t: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
  clearInterval(Live.hb); Live.hb = setInterval(() => { if (Live.ok) ref.set({ m: liveMode(), t: firebase.database.ServerValue.TIMESTAMP }).catch(() => {}); }, 60000);
  Live.db.ref('presence').on('value', s => {
    const now = liveNow(), v = s.val() || {};
    Live.online = Object.values(v).filter(p => p && now - (p.t || 0) < 150000); // a heartbeat in the last 2.5 min
    syncLiveUI();
  });
}
function liveTick() { // called every frame; only writes when what you are doing changes
  if (!Live.ok) return;
  const m = liveMode(); if (m === Live.mode) return;
  Live.mode = m; Live.db.ref('presence/' + Live.uid).set({ m, t: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
}
// submit a score: only if it beats what you already sent for that board and period
function liveSubmit(board, period, score, lower) {
  score = Math.max(0, Math.min(1e7, Math.round(+score || 0))); if (!score && !lower) return;
  const key = board + '/' + period, sent = storeJSON('trepong-live', {}) || {}, prev = sent[key];
  if (prev != null && (lower ? score >= prev : score <= prev)) return;
  if (!Live.ok) return; // try again next time; nothing is marked as sent
  sent[key] = score; for (const k in sent) if (k.startsWith('daily/') && k !== 'daily/' + arenaDay()) delete sent[k];
  store('trepong-live', JSON.stringify(sent));
  Live.db.ref('boards/' + board + '/' + period + '/' + Live.uid).set({ n: myName().slice(0, 16), s: score, t: firebase.database.ServerValue.TIMESTAMP }).catch(() => {});
}
function liveSubmitAll() { // everything we already know about you, so you show up right away
  liveSubmit('level', 'all', (stats.prest || 0)*1000 + myLevel());
  liveSubmit('tower', 'all', towerCleared());
  liveSubmit('raids', 'all', stats.raidClears || 0);
  for (let n = 2; n <= 6; n++) { const r = +store('trepong-rec-' + n) || 0; if (r) liveSubmit('rally' + n, 'all', r); }
  const d = dailyData(); if (d.best) liveSubmit('daily', String(arenaDay()), d.best);
  const w = weeklyBest(); if (w) liveSubmit('weekly', String(weekId()), w.t*10, true);
}
// keep the top 10 of a board live
function liveTop(board, period, lower, cb) {
  const key = board + '/' + period; if (Live.subs[key]) return;
  let q = Live.db.ref('boards/' + key).orderByChild('s'); q = lower ? q.limitToFirst(25) : q.limitToLast(25);
  Live.subs[key] = q; q.on('value', s => {
    const rows = []; s.forEach(c => { const v = c.val() || {}; rows.push({ id: c.key, n: cleanName(v.n) || 'Player', s: +v.s || 0 }); });
    rows.sort((a, b) => lower ? a.s - b.s : b.s - a.s); Live.tops[key] = rows; if (cb) cb(); syncLiveUI();
  });
}
function liveWatch() { liveTop('daily', String(arenaDay()), false); liveTop('weekly', String(weekId()), true, () => { if (curScreen === 'tower') renderWeekly(); }); }
// ----- UI -----
let liveTab = 'daily', liveRally = 3;
function syncLiveUI() {
  const n = Live.online.length, pill = $('#btnLive'); pill.hidden = !Live.ok;
  $('#liveN').textContent = n;
  const cnt = m => Live.online.filter(p => p.m === m).length;
  for (const [id, m] of [['liveAdv', 'adv'], ['liveRaid', 'raid'], ['liveBuild', 'build'], ['liveBuild2', 'daily']]) { const el = $('#' + id); if (el) { const c = cnt(m); el.textContent = c ? ' · ' + c + ' playing' : ''; } }
  const dr = Live.tops['daily/' + arenaDay()], dl = $('#dailyLive');
  if (dl) { dl.hidden = !Live.ok; if (Live.ok) { const me = dr ? dr.findIndex(r => r.id === Live.uid) : -1; dl.textContent = dr && dr.length ? '🌍 Today\'s #1: ' + dr[0].n + ' ' + fmt(dr[0].s) + (me >= 0 ? ' · you are #' + (me + 1) : '') : '🌍 No scores yet today. Be the first!'; } }
  if (curScreen === 'live') renderLive();
}
function openLive() { mode = 'menu'; st = null; series = null; special = null; showScreen('live'); renderLive(); }
function renderLive() {
  const by = {}; for (const p of Live.online) by[p.m] = (by[p.m] || 0) + 1;
  $('#liveCount').textContent = Live.online.length + (Live.online.length === 1 ? ' player' : ' players') + ' online right now';
  const box = $('#liveModes'); box.textContent = '';
  Object.keys(LIVE_MODES).filter(m => by[m]).sort((a, b) => by[b] - by[a]).forEach(m => box.append(Object.assign(document.createElement('span'), { textContent: LIVE_MODES[m] + ' ' + by[m] })));
  document.querySelectorAll('#live .lvtab2').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.b === liveTab)));
  $('#liveRallySeg').hidden = liveTab !== 'rally'; setSeg($('#liveRallySeg'), liveRally, 'n');
  const B = LIVE_BOARDS[liveTab], board = liveTab === 'rally' ? 'rally' + liveRally : liveTab, period = B[1](), key = board + '/' + period;
  $('#liveBoardSub').textContent = liveTab === 'daily' ? 'Today\'s arena: ' + dailyLevel(arenaDay()).name + '. Best single rally.' : liveTab === 'weekly' ? 'This week: ' + weeklyCfg().n + '. Fastest win.' : liveTab === 'rally' ? 'Best rally score in a ' + liveRally + '-player match.' : liveTab === 'tower' ? 'Highest Champion Tower floor cleared.' : liveTab === 'raids' ? 'Most raid clears.' : 'Prestige first, then level.';
  if (Live.ok) liveTop(board, period, B[2]);
  const list = $('#liveList'); list.textContent = '';
  const rows = Live.tops[key];
  if (!Live.ok) { list.append(Object.assign(document.createElement('p'), { className: 'note', textContent: 'Connecting…' })); return; }
  if (!rows) { list.append(Object.assign(document.createElement('p'), { className: 'note', textContent: 'Loading…' })); return; }
  if (!rows.length) { list.append(Object.assign(document.createElement('p'), { className: 'note', textContent: 'No scores yet. Be the first!' })); return; }
  rows.slice(0, 10).forEach((r, i) => {
    const el = document.createElement('div'); el.className = 'lbrow' + (r.id === Live.uid ? ' me' : '');
    el.append(Object.assign(document.createElement('span'), { className: 'pos', textContent: ['🥇', '🥈', '🥉'][i] || String(i + 1) }), Object.assign(document.createElement('span'), { className: 'nm', textContent: r.n }), Object.assign(document.createElement('span'), { className: 'tm', textContent: B[3](r.s) }));
    list.append(el);
  });
  const me = rows.findIndex(r => r.id === Live.uid);
  $('#liveMe').textContent = me >= 10 ? 'You: #' + (me + 1) + ' · ' + B[3](rows[me].s) : me < 0 ? 'You are not on this list yet.' : '';
}
