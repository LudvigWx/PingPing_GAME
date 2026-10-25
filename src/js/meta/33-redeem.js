// ---------- redeem codes ----------
// Codes live here only as SHA-256 hashes of 'trepong:' + the code (upper case, letters and digits only),
// so reading the source doesn't give them away. Make new ones with make_code.py.
const CODES = {
  '91d980becc16bbdcad14d30ce28dfd70cf0db22cba9ea07d90c8645791a77b41': { n: 'Welcome to Trepong', r: [['coins', 250], ['chest', 'wood']] },
  '46532d99f79b700069b83c07e7eb3c54c677dfc5455b05867226df55eb801965': { n: 'Pumpkin Night secret', r: [['pe', 'candycorn'], ['pt', 'codebreaker'], ['coins', 300]], end: ADV_EVENT_END },
  '073debdc198f532c2377f183bf93402dc58544d8a6a2804f0fcd53b864c13241': { n: 'The Forester\'s Bundle', r: [['h', 'pinetree'], ['f', 'pinecones'], ['b', 'lingon'], ['u', 'leafwind'], ['v', 'forestfall'], ['a', 'forest']], look: 1, vic: 'forestfall' },
  '2bc15f89d763b69932b54df3a71aae3d54195cf72a1e6e2ab8986419368cb118': { n: 'The Creator', r: [['pb', 'creator'], ['pg', 'creator'], ['pt', 'creator']], eq: 1, big: 1 }
};
PROF.pb.push(['creator', 'Architect\'s Prism', 'm', 'creator', 1]);
PROF.pg.push(['creator', 'Genesis', 'm', 'creator', 1]);
PROF.pt.push(['creator', 'Creator of Trepong', 'm', 'creator'], ['codebreaker', 'Code Breaker', 'e', 'code']);
PROF.pe.push(['candycorn', 'Candy corn', 'e', 'code']);
let redeemed = (() => { const a = storeJSON('trepong-codes', []); return Array.isArray(a) ? a.filter(h => typeof h === 'string') : []; })();
function saveRedeemed() { store('trepong-codes', JSON.stringify(redeemed)); }
function normCode(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }   // ä, å, ö count as a, a, o
async function codeHash(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('trepong:' + s));
  return Array.from(new Uint8Array(buf), b => b.toString(16).padStart(2, '0')).join('');
}
let redeemFails = [], redeemBusy = false, redeemAnim = null, redeemShow = null;
function openRedeem(pre) {
  mode = 'menu'; st = null; series = null; special = null; resetFx();
  showScreen('redeem'); $('#redeemMsg').textContent = ''; $('#redeemMsg').className = 'note';
  if (pre) $('#redeemIn').value = pre;
  renderRedeem();
}
function renderRedeem() {
  syncCoinUI(); $('#redeemCoins').textContent = fmt(coins);
  const list = $('#redeemList'); list.textContent = '';
  const names = redeemed.map(h => CODES[h] ? CODES[h].n : null).filter(Boolean);
  list.textContent = names.length ? names.join(' · ') : 'Nothing yet.';
  $('#redeem .panel').classList.toggle('got', !!redeemShow);
  const got = $('#redeemGot'); got.hidden = !redeemShow; got.textContent = '';
  $('#redeemCard').hidden = !(redeemShow && redeemShow.big);
  if (redeemShow) for (const r of redeemShow.r) {
    const d = document.createElement('div'); d.className = 'rgitem';
    const cv = document.createElement('canvas'); cv.width = 88; cv.height = 60; cv.dataset.r = JSON.stringify(r);
    d.append(cv, Object.assign(document.createElement('span'), { textContent: rewardName(r) }));
    got.append(d);
  }
  fitPanel($('#redeem .panel'));
}
function redeemMsg(t, cls) { const m = $('#redeemMsg'); m.textContent = t; m.className = 'note ' + (cls || ''); }
async function redeemCode() {
  if (redeemBusy) return;
  const raw = normCode($('#redeemIn').value);
  if (!raw) { redeemMsg('Type a code first.', 'bad'); return; }
  const now = Date.now(); redeemFails = redeemFails.filter(x => now - x < 60000);
  if (redeemFails.length >= 6) { redeemMsg('Too many tries. Wait a minute and try again.', 'bad'); return; }
  if (!(window.crypto && crypto.subtle)) { redeemMsg('Codes need a secure (https) connection. Open the game from its normal web address.', 'bad'); return; }
  redeemBusy = true;
  let h = ''; try { h = await codeHash(raw); } catch (e) { h = ''; }
  redeemBusy = false;
  const C = CODES[h];
  if (!C) { redeemFails.push(now); redeemAnim = { kind: 'no', t: 0 }; tone(140, 0.25, 'square', 0.05, 0.6); buzz([60]); redeemMsg('That code doesn\'t work. Check the spelling, or the clue.', 'bad'); return; }
  if (redeemed.includes(h)) { redeemAnim = { kind: 'no', t: 0 }; redeemMsg('You have already redeemed "' + C.n + '".', 'bad'); return; }
  if (C.end && now > C.end) { redeemAnim = { kind: 'no', t: 0 }; redeemMsg('"' + C.n + '" has expired. Keep an eye out for the next one!', 'bad'); return; }
  for (const r of C.r) grantReward(r, true);
  if (C.eq) { for (const r of C.r) if (['pb', 'pg', 'pt', 'pe'].includes(r[0])) myProf[r[0]] = r[1]; myProf = validProf(myProf); saveProf(); }
  if (C.look) { // gift bundles put everything on straight away
    const nl = { ...myLook }; for (const r of C.r) { if (r[0] === 'a') { menuArena = r[1]; store('trepong-arena', r[1]); } else if (LOOK_FIELD[r[0]]) nl[LOOK_FIELD[r[0]]] = r[1]; }
    myLook = validLook(nl); store('trepong-look', JSON.stringify(myLook)); if (typeof syncArenaSeg === 'function') syncArenaSeg(); pushProfile();
  }
  redeemed.push(h); saveRedeemed(); track('codes');
  redeemShow = { r: C.r, big: !!C.big, n: C.n };
  redeemAnim = { kind: 'yes', t: 0, big: !!C.big, n: C.n };
  $('#redeemIn').value = '';
  redeemMsg(C.big ? 'Welcome home, creator. Everything is equipped.' : 'Code redeemed: ' + C.n + '!' + (C.look ? ' Everything is equipped.' : ''), 'good');
  sfx.win(); buzz(C.big ? [40, 30, 80, 30, 200] : [40, 30, 80]);
  startVictory(C.vic || (C.big ? 'supernova' : 'confetti'));
  renderRedeem();
}
let redeemParts = [];
function drawRedeemStage(dt) {
  const cv = $('#redeemCv'); if (!cv) return;
  const c = cv.getContext('2d'), w = cv.width, h = cv.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#120A2A'); bg.addColorStop(1, '#0C0A1C'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 50; k++) { c.fillStyle = 'rgba(255,255,255,' + (0.2 + 0.6*Math.abs(Math.sin(clock*(0.6 + k % 5*0.2) + k))) + ')'; c.fillRect((k*97.3) % w, (k*41.9) % h, 1.5, 1.5); }
  const A = redeemAnim; if (A) A.t += dt;
  let open = 0, shakeX = 0;
  if (A && A.kind === 'no') { shakeX = Math.sin(A.t*60)*8*Math.max(0, 1 - A.t*2.5); if (A.t > 0.5) redeemAnim = null; }
  if (A && A.kind === 'yes') {
    open = Math.min(1, A.t*1.6);
    if (!A.burst) { A.burst = true; for (let k = 0; k < (A.big ? 160 : 70); k++) { const a = Math.random()*TAU, sp = 80 + Math.random()*(A.big ? 380 : 220); redeemParts.push({ x: w/2, y: h/2, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 1 + Math.random()*1.2, col: A.big ? CRE_COLS[k % 3] : ['#FFD84A', '#3EE6FF', '#FF4F8B'][k % 3] }); } }
    if (A.t > 6) { redeemAnim = null; }
  }
  const cx = w/2 + shakeX, cy = h/2, R = h*0.32, rot = clock*0.5;
  // rune rings
  c.save(); c.translate(cx, cy);
  for (let k = 0; k < 3; k++) { c.strokeStyle = 'rgba(' + ['62,230,255', '255,79,139', '255,178,62'][k] + ',' + (0.35 + 0.25*Math.sin(clock*2 + k)) + ')'; c.lineWidth = 2; c.setLineDash([6 + k*3, 8]); c.lineDashOffset = clock*(k % 2 ? 30 : -30); c.beginPath(); c.arc(0, 0, R*(1.05 + k*0.18) + open*R*0.5*(k + 1), 0, TAU); c.stroke(); }
  c.setLineDash([]);
  // the triangle lock: three shards that slide apart when the code is right
  for (let k = 0; k < 3; k++) {
    const a = rot + k*TAU/3 - Math.PI/2, push = open*R*0.9;
    c.save(); c.rotate(a + Math.PI/2); c.translate(0, -push);
    c.shadowColor = SEAT_DEFAULT[k]; c.shadowBlur = 16; c.fillStyle = SEAT_DEFAULT[k];
    poly(c, [[0, -R], [R*0.866*0.55, -R*0.05], [-R*0.866*0.55, -R*0.05]]); c.fill();
    c.restore();
  }
  c.shadowBlur = 0;
  if (open < 1) { c.fillStyle = '#0C0A1C'; c.beginPath(); c.arc(0, 0, R*0.2*(1 - open), 0, TAU); c.fill(); c.fillStyle = '#FFD84A'; c.font = '700 ' + Math.round(R*0.22) + 'px "Rubik Mono One", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.globalAlpha = 1 - open; c.fillText('?', 0, 2); c.globalAlpha = 1; }
  else { const g = c.createRadialGradient(0, 0, 0, 0, 0, R); g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.globalAlpha = 0.5 + 0.3*Math.sin(clock*4); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R, 0, TAU); c.fill(); c.globalAlpha = 1; }
  c.restore();
  const keep = []; for (const q of redeemParts) { q.x += q.vx*dt; q.y += q.vy*dt; q.vy += 160*dt; q.vx *= 0.99; q.life -= dt; if (q.life > 0) { keep.push(q); c.globalAlpha = Math.min(1, q.life); c.fillStyle = q.col; c.fillRect(q.x, q.y, 3, 3); } }
  c.globalAlpha = 1; redeemParts = keep;
  if (A && A.kind === 'yes' && A.t < 3.5) { c.globalAlpha = Math.min(1, A.t*2, (3.5 - A.t)*2); c.fillStyle = '#FFFFFF'; c.font = '700 ' + Math.round(h*0.09) + 'px "Rubik Mono One", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(A.big ? 'HELLO, CREATOR' : 'UNLOCKED', w/2, h*0.88); c.globalAlpha = 1; }
  // reward chips + the creator card preview
  if (redeemShow) {
    $('#redeemGot').querySelectorAll('canvas').forEach(x => { try { drawRewardChip(x, JSON.parse(x.dataset.r)); } catch (e) {} });
    if (redeemShow.big) { const cc = $('#redeemCardCv'); drawCard(cc.getContext('2d'), myCardData(), clock); }
  }
}

