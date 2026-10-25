// ---------- weekly boss ----------
function weekId() {
  const d = new Date(), t = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), day = (new Date(t).getUTCDay() + 6) % 7;
  const th = new Date(t - day*864e5 + 3*864e5), y = th.getUTCFullYear(), jan4 = Date.UTC(y, 0, 4);
  return y*100 + 1 + Math.round(((th - jan4)/864e5 - 3 + ((new Date(jan4).getUTCDay() + 6) % 7))/7);
}
const WEEKLY_BOSSES = [
  { n: 'The Neon Kraken',   c: '#FF4F8B', h: 'demon',      f: 'laser',   ar: 'retro' },
  { n: 'The Glitch Dragon', c: '#4FFFC4', h: 'mohawk',     f: 'robot',   ar: 'retro' },
  { n: 'The Comet King',  c: '#FFB23E', h: 'flamecrown', f: 'shades',  ar: 'hole'  },
  { n: 'The Disco Demon', c: '#B57CFF', h: 'disco',      f: 'vampire', ar: 'classic' },
  { n: 'The Ice Wraith',   c: '#7FD8FF', h: 'horns',      f: 'angry',   ar: 'ice'   },
  { n: 'The Duck God',     c: '#FFE34A', h: 'duck',       f: 'monocle', ar: 'classic' }
];
function weeklyCfg() {
  const w = weekId(), base = TOWER[5 + (w % 5)], W = WEEKLY_BOSSES[w % WEEKLY_BOSSES.length];
  return { ...base, ...W, floor: 0, hp: base.hp*1.7, rate: base.rate*0.85, spd: base.spd*1.05, atk: Object.keys(BOSS_ATTACKS) };
}
let special = null;   // null | 'weekly' | 'cup'
let DB = null, USER = null, myUid = null, lbUnsub = null, lbRows = [];
function fmtTime(s) { s = Math.max(0, s); const m = Math.floor(s/60), r = s - m*60; return m + ':' + (r < 10 ? '0' : '') + r.toFixed(1); }
function weeklyBest() { const b = storeJSON('trepong-wk', null); return b && b.w === weekId() ? b : null; }
function renderWeekly() {
  const cfg = weeklyCfg(), best = weeklyBest();
  $('#wkName').textContent = cfg.n; $('#wkName').style.color = cfg.c;
  $('#wkSub').textContent = 'New boss every Monday. Arena: ' + ARENAS[cfg.ar] + '. Your first win each week gives 150 coins.' + (best ? ' Your best time: ' + fmtTime(best.t) + '.' : '');
  lookCanvas($('#wkLook'), { c: cfg.c, h: cfg.h, f: cfg.f, t: 'std', s: 'solid' }, 2.6);
  const list = $('#wkList'); list.textContent = '';
  if (!DB && Live.ok) { const lr = Live.tops['weekly/' + weekId()] || []; lbRows = lr.map(r => ({ id: r.id, n: r.n, t: r.s/10, w: weekId(), p: 1 })); myUid = Live.uid; }
  else if (!DB) { const p = document.createElement('p'); p.className = 'note'; p.textContent = 'The leaderboard shows when the page is open while signed in to Claude.'; list.append(p); return; }
  const rows = lbRows.filter(r => r.w === weekId()).sort((a, b) => a.t - b.t).slice(0, 10);
  if (!rows.length) { const p = document.createElement('p'); p.className = 'note'; p.textContent = 'No one has beaten the weekly boss yet. Be the first!'; list.append(p); }
  rows.forEach((r, i) => {
    const el = document.createElement('div'); el.className = 'lbrow' + (r.id === myUid ? ' me' : '');
    const pos = document.createElement('span'); pos.className = 'pos'; pos.textContent = ['🥇', '🥈', '🥉'][i] || String(i + 1);
    const nm = document.createElement('span'); nm.className = 'nm'; nm.textContent = cleanName(r.n) || 'Player';
    const tm = document.createElement('span'); tm.className = 'tm'; tm.textContent = fmtTime(r.t) + (r.p > 1 ? ' · ' + r.p + ' st' : '');
    el.append(pos, nm, tm); list.append(el);
  });
}
async function initDB() {
  try {
    const [db, user] = await Promise.all([window.claude && window.claude.use ? window.claude.use('db') : null, window.claude && window.claude.use ? window.claude.use('user') : null]);
    DB = db; USER = user;
    if (USER) myUid = await USER.id();
    if (DB) lbUnsub = DB.collection('weekly').where('w', '==', weekId()).onSnapshot(snap => { lbRows = snap.docs.map(d => ({ id: d.id, ...d.data() })); if (curScreen === 'tower') renderWeekly(); }, () => { DB = null; });
  } catch (e) { DB = null; }
}
async function submitWeekly(t, players) {
  const prev = weeklyBest();
  if (!prev || t < prev.t) store('trepong-wk', JSON.stringify({ w: weekId(), t }));
  liveSubmit('weekly', String(weekId()), t*10, true);
  if (!DB || !myUid) return;
  const mine = lbRows.find(r => r.id === myUid && r.w === weekId());
  if (mine && mine.t <= t) return;
  try { await DB.doc('weekly/' + myUid).set({ w: weekId(), t: Math.round(t*10)/10, n: myName(), p: players, at: Date.now() }); } catch (e) {}
}
// ---------- tournament (cup) ----------
const CUP_NAMES = ['Flash', 'The wall', 'Spinner', 'Comet', 'The Ghost', 'Rocket', 'Ninja', 'Dragon', 'Pixel', 'Turbo', 'Spark', 'Vortex', 'Captain', 'Zappo'];
let cup = null;   // { size, ents:[{n, lk, sk, me}], rounds:[[ [a,b,winner], ...], ...], r, done, champ }
function newCup(size) {
  const names2 = CUP_NAMES.slice().sort(() => Math.random() - 0.5);
  const ents = [{ n: myName(), lk: myLook, sk: 1, me: true }];
  for (let k = 1; k < size; k++) ents.push({ n: names2[k - 1], lk: randomLook([myLook.c]), sk: 0.75 + Math.random()*0.5 });
  const order = ents.map((_, i) => i).sort(() => Math.random() - 0.5);
  const first = []; for (let k = 0; k < size; k += 2) first.push([order[k], order[k + 1], -1]);
  cup = { size, ents, rounds: [first], r: 0, done: false, champ: -1 };
}
function cupRoundName(r, total) { const left = total - r; return left === 1 ? 'Final' : left === 2 ? 'Semifinal' : 'Quarterfinal'; }
function cupMyMatch() { if (!cup || cup.done) return null; return cup.rounds[cup.r].find(m => m[2] < 0 && (cup.ents[m[0]].me || cup.ents[m[1]].me)); }
function cupResolveOthers() {
  for (const m of cup.rounds[cup.r]) if (m[2] < 0 && !cup.ents[m[0]].me && !cup.ents[m[1]].me) {
    const a = cup.ents[m[0]].sk, b = cup.ents[m[1]].sk; m[2] = Math.random() < a/(a + b) ? m[0] : m[1];
  }
}
function cupAdvance() {
  const R = cup.rounds[cup.r];
  if (R.some(m => m[2] < 0)) return;
  if (R.length === 1) { cup.done = true; cup.champ = R[0][2]; return; }
  const next = []; for (let k = 0; k < R.length; k += 2) next.push([R[k][2], R[k + 1][2], -1]);
  cup.rounds.push(next); cup.r++;
}
function cupOnMatchEnd(iWon) {
  const m = cupMyMatch(); if (!m) return;
  const meIdx = cup.ents[m[0]].me ? m[0] : m[1];
  m[2] = iWon ? meIdx : (meIdx === m[0] ? m[1] : m[0]);
  cupResolveOthers(); cupAdvance();
  if (!iWon) { while (!cup.done) { cupResolveOthers(); cupAdvance(); } }
}
function openCup() {
  if (!cup || cup.done && cup.seen) newCup(cupSize);
  showScreen('cup'); renderCup();
}
let cupSize = 8;
function renderCup() {
  setSeg($('#cupSeg'), cupSize, 's');
  const total = Math.log2(cup.size), box = $('#cupTree'); box.textContent = '';
  cup.rounds.forEach((R, r) => {
    const h = document.createElement('div'); h.className = 'qcat'; h.textContent = cupRoundName(r, total); box.append(h);
    for (const m of R) {
      const row = document.createElement('div'); row.className = 'cupm' + ((cup.ents[m[0]].me || cup.ents[m[1]].me) ? ' mine' : '');
      [m[0], m[1]].forEach((e, k) => {
        const s = document.createElement('span'); s.className = 'ce' + (m[2] === e ? ' win' : m[2] >= 0 ? ' out' : '');
        const dot = document.createElement('i'); dot.style.background = cup.ents[e].lk.c;
        s.append(dot, document.createTextNode(cup.ents[e].me ? cup.ents[e].n + ' (you)' : cup.ents[e].n));
        row.append(s);
        if (k === 0) { const vs = document.createElement('b'); vs.textContent = 'vs'; row.append(vs); }
      });
      box.append(row);
    }
  });
  const mm = cupMyMatch();
  const go = $('#btnCupGo'), st2 = $('#cupStatus');
  if (cup.done) {
    const me = cup.ents[cup.champ];
    st2.textContent = me.me ? 'You won the tournament! 🏆' : me.n + ' won the tournament.'; st2.style.color = me.me ? '#FFD84A' : 'var(--ink)';
    go.textContent = 'New tournament'; cup.seen = true;
  } else {
    const opp = mm ? cup.ents[cup.ents[mm[0]].me ? mm[1] : mm[0]] : null;
    st2.textContent = opp ? cupRoundName(cup.r, total) + ' vs ' + opp.n + '.' : ''; st2.style.color = 'var(--ink)';
    go.textContent = 'Play ' + cupRoundName(cup.r, total).toLowerCase();
  }
  $('#cupSeg').hidden = cup.rounds.length > 1 || cup.rounds[0].some(m => m[2] >= 0);
}
function startCupMatch() {
  if (!cup || cup.done) { newCup(cupSize); renderCup(); return; }
  const mm = cupMyMatch(); if (!mm) return;
  const opp = cup.ents[cup.ents[mm[0]].me ? mm[1] : mm[0]];
  audioOn(); mode = 'practice'; mySeat = 0; resetFx(); special = 'cup';
  bots = [false, true]; names = [myName(), opp.n]; looks = [myLook, opp.lk];
  botSkill = [1, 1.1 + 0.2*cup.r + (opp.sk - 1)*0.4];
  $('#hudCode').hidden = true; series = null; startMatch();
}

