// ---------- chests ----------
const CHESTS = {
  wood: { n: 'Wooden chest',     price: 120, odds: { c: 50, u: 30, r: 15, e: 5 },              col: '#C08040', trim: '#8A5A2B' },
  gold: { n: 'Gold chest',    price: 350, odds: { u: 35, r: 35, e: 22, l: 7, m: 1 },       col: '#FFD84A', trim: '#C9921A' },
  myth: { n: 'Mythic chest', price: 900, odds: { r: 30, e: 40, l: 25, m: 5 },             col: '#FF4F8B', trim: '#7A1A4A' }
};
const KIND_NAME = { c: 'Color', h: 'Hat', f: 'Face', k: 'Skin', t: 'Ball trail', v: 'Win effect', a: 'Arena', u: 'Aura', b: 'Ball skin', pb: 'Border', pg: 'Background', pt: 'Title', pe: 'Emblem' };
function priceRarity(p) { return p >= LUXE_MIN ? 'm' : p <= 60 ? 'c' : p <= 120 ? 'u' : p <= 180 ? 'r' : p <= 250 ? 'e' : 'l'; }
function chestPool() {
  const pool = [];
  for (const k of ['c', 'h', 'f', 'k', 't', 'v']) for (const [id] of shopList(k)) { const p = PRICE[k][id]; if (p) pool.push({ k, id, r: priceRarity(p) }); }
  for (const k of ['pb', 'pg', 'pt', 'pe']) for (const it of PROF[k]) if (it[3] === 'buy' || it[3] === 'chest') pool.push({ k, id: it[0], r: it[2] });
  return pool;
}
function ownsAny(k, id) { return k.startsWith('p') ? ownsProf(k, id) : ownsItem(k, id); }
function itemLabel(k, id) { return k.startsWith('p') ? profItem(k, id)[1] : itemName(k, id); }
function rollChest(type) {
  const odds = CHESTS[type].odds, pool = chestPool();
  let tot = 0; for (const r in odds) tot += odds[r];
  let x = Math.random()*tot, rar = 'c';
  for (const r of RAR_ORDER) { if (!odds[r]) continue; x -= odds[r]; if (x <= 0) { rar = r; break; } }
  let ri = RAR_ORDER.indexOf(rar), cand = [];
  while (ri >= 0 && !(cand = pool.filter(it => it.r === RAR_ORDER[ri])).length) ri--;
  const it = pick(cand);   // fully random: you can get something you already own (it turns into coins)
  const dup = ownsAny(it.k, it.id);
  return { ...it, dup, refund: dup ? Math.round((RAR6[it.r][2] || 1500)*0.4) : 0 };
}
let freeChests = Math.max(0, Math.floor(+store('trepong-freechest') || 0));
let chestAnim = null;   // { type, t, phase: 'shake' | 'burst' | 'reveal', item }
function saveFree() { store('trepong-freechest', String(freeChests)); syncChestBadge(); }
// gold and mythic chests from rewards are stored too, so they can be opened (and opened all at once) with the cutscene
let chestInv = storeJSON('trepong-chestinv', { gold: 0, myth: 0 });
function saveInv() { store('trepong-chestinv', JSON.stringify(chestInv)); syncChestBadge(); }
function invCount(t) { return t === 'wood' ? freeChests : (chestInv[t] || 0); }
function invTotal() { return freeChests + (chestInv.gold || 0) + (chestInv.myth || 0); }
function takeInv(t) { if (invCount(t) <= 0) return false; if (t === 'wood') { freeChests--; saveFree(); } else { chestInv[t]--; saveInv(); } return true; }
function syncChestBadge() { const b = $('#chestBadge'); if (!b) return; const n = invTotal(); b.hidden = !n; b.textContent = n; }
function openChestScreen() { chestAnim = null; showScreen('chests'); syncChests(); }
function syncChests() {
  $('#chestCoins').textContent = fmt(coins);
  const left = 5 - ((stats.matches || 0) % 5);
  const busy = !!chestAnim && chestAnim.phase !== 'reveal', tot = invTotal();
  $('#chestNote').textContent = (tot ? 'You have ' + tot + ' chest' + (tot === 1 ? '' : 's') + ' to open! ' : '') + 'Next free wooden chest in ' + left + (left === 1 ? ' match.' : ' matches.');
  const row = $('#chestInvRow'); row.textContent = '';
  for (const t of ['wood', 'gold', 'myth']) {
    const n = invCount(t); if (!n) continue;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'invbtn inv-' + t; b.disabled = busy;
    b.append(Object.assign(document.createElement('b'), { textContent: 'Open ' + CHESTS[t].n.toLowerCase() }), Object.assign(document.createElement('small'), { textContent: '× ' + n }));
    b.addEventListener('click', () => startChest(t, true)); row.append(b);
  }
  $('#btnOpenAll').hidden = tot < 2; $('#btnOpenAll').disabled = busy; $('#btnOpenAll').textContent = 'Open all ' + tot + ' chests';
  for (const t in CHESTS) { const b = $('#buy_' + t); b.disabled = busy || coins < CHESTS[t].price; }
  const rv = $('#chestReveal');
  if (chestAnim && chestAnim.phase === 'reveal' && chestAnim.multi) {
    const M = chestAnim.multi, fresh = M.filter(i => !i.dup), dups = M.filter(i => i.dup), back = dups.reduce((a, i) => a + i.refund, 0);
    const best = M[M.length - 1]; rv.hidden = false;
    $('#revRar').textContent = M.length + ' chests opened · best: ' + RAR6[best.r][0]; $('#revRar').style.color = RAR6[best.r][1];
    $('#revName').textContent = fresh.length + ' new item' + (fresh.length === 1 ? '' : 's') + '!';
    $('#revDup').textContent = (fresh.length ? 'New: ' + fresh.slice().reverse().slice(0, 8).map(i => itemLabel(i.k, i.id)).join(', ') + (fresh.length > 8 ? ' and ' + (fresh.length - 8) + ' more' : '') + '. ' : '') + (dups.length ? dups.length + ' duplicate' + (dups.length === 1 ? '' : 's') + ' became ' + fmt(back) + ' coins.' : '');
    $('#btnUseNow').hidden = true;
  } else if (chestAnim && chestAnim.phase === 'reveal') {
    const it = chestAnim.item; rv.hidden = false;
    $('#revRar').textContent = RAR6[it.r][0] + ' · ' + KIND_NAME[it.k]; $('#revRar').style.color = RAR6[it.r][1];
    $('#revName').textContent = itemLabel(it.k, it.id);
    $('#revDup').textContent = it.dup ? 'You already had it. You get ' + it.refund + ' coins instead.' : 'New item!';
    $('#btnUseNow').hidden = it.dup || it.k === 'a';
  } else rv.hidden = true;
}
function startChest(type, free) {
  if (chestAnim && chestAnim.phase !== 'reveal') return;
  if (free) { if (!takeInv(type)) return; }
  else { if (coins < CHESTS[type].price) return; coins -= CHESTS[type].price; saveWallet(); }
  audioOn(); track('chests');
  const item = rollChest(type);
  if (item.dup) addCoins(item.refund); else owned.add(item.k + ':' + item.id);
  saveWallet();
  chestAnim = { type, t: 0, phase: 'shake', item, parts: [] };
  syncChests();
}
const RAR_RANK = r => RAR_ORDER.indexOf(r);
function startChestAll() {
  if (chestAnim && chestAnim.phase !== 'reveal') return;
  const items = [];
  for (const t of ['wood', 'gold', 'myth']) while (invCount(t) > 0) {
    takeInv(t); const it = rollChest(t);
    if (it.dup) addCoins(it.refund); else owned.add(it.k + ':' + it.id);
    items.push({ ...it, ct: t });
  }
  if (!items.length) return;
  saveWallet(); audioOn(); track('chests', items.length);
  items.sort((a, b) => RAR_RANK(a.r) - RAR_RANK(b.r) || (a.dup - b.dup));   // the best one is revealed last
  const top = items.some(i => i.ct === 'myth') ? 'myth' : items.some(i => i.ct === 'gold') ? 'gold' : 'wood';
  chestAnim = { type: top, t: 0, phase: 'shake', item: items[items.length - 1], multi: items, parts: [], cards: null };
  syncChests();
}
function skipChestAnim() { const A = chestAnim; if (!A || !A.multi || A.phase === 'reveal') return; if (A.phase === 'shake') A.t = 1.64; else { A.t = Math.max(A.t, 99); A.skip = true; } }
function useChestItem() {
  if (!chestAnim) return; const it = chestAnim.item;
  if (it.k.startsWith('p')) { myProf[it.k] = it.id; saveProf(); }
  else { const fld = LOOK_FIELD[it.k]; if (fld) { myLook = validLook({ ...myLook, [fld]: it.id }); store('trepong-look', JSON.stringify(myLook)); } }
  toast(itemLabel(it.k, it.id) + ' equipped!'); $('#btnUseNow').hidden = true;
}
const revealCv = document.createElement('canvas'); revealCv.width = 176; revealCv.height = 120;
function drawChestBox(c, type, x, y, s, lid, glow) {
  const C = CHESTS[type];
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glow > 0) { const g = c.createRadialGradient(0, -10, 0, 0, -10, 90); g.addColorStop(0, C.col + 'cc'); g.addColorStop(1, C.col + '00'); c.globalAlpha = glow; c.fillStyle = g; c.fillRect(-100, -110, 200, 200); c.globalAlpha = 1; }
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(0, 42, 52, 9, 0, 0, TAU); c.fill();
  const body = c.createLinearGradient(0, -5, 0, 40); body.addColorStop(0, type === 'wood' ? '#B0703A' : type === 'gold' ? '#FFE58A' : '#7A2A8A'); body.addColorStop(1, type === 'wood' ? '#6A3F18' : type === 'gold' ? '#C9921A' : '#3A0A4A');
  c.fillStyle = body; rr(c, -46, -4, 92, 44, 6); c.fill();
  c.fillStyle = C.trim; c.fillRect(-46, 10, 92, 6); c.fillRect(-30, -4, 7, 44); c.fillRect(23, -4, 7, 44);
  // lid hinges at the back edge
  c.save(); c.translate(-48, -4); c.rotate(-lid*1.15); c.translate(48, 0);
  const lg2 = c.createLinearGradient(0, -34, 0, 0); lg2.addColorStop(0, type === 'wood' ? '#C08040' : type === 'gold' ? '#FFF1A8' : '#B04ABF'); lg2.addColorStop(1, type === 'wood' ? '#8A5A2B' : type === 'gold' ? '#E8B62A' : '#5A1A6A');
  c.fillStyle = lg2; c.beginPath(); c.moveTo(-48, 0); c.lineTo(-48, -18); c.quadraticCurveTo(0, -42, 48, -18); c.lineTo(48, 0); c.closePath(); c.fill();
  c.fillStyle = C.trim; c.fillRect(-30, -28, 7, 28); c.fillRect(23, -28, 7, 28);
  c.restore();
  if (lid < 0.2) { c.fillStyle = type === 'myth' ? '#FFD84A' : '#E6EEFF'; rr(c, -8, -8, 16, 18, 3); c.fill(); c.fillStyle = '#16112E'; c.beginPath(); c.arc(0, 0, 2.5, 0, TAU); c.fill(); c.fillRect(-1, 0, 2, 6); }
  c.restore();
}
function drawChestStage(dt) {
  const cv2 = $('#chestCv'), c = cv2.getContext('2d'), W = cv2.width, Hh = cv2.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, Hh);
  const bg = c.createRadialGradient(W/2, Hh*0.55, 10, W/2, Hh*0.55, W*0.7); bg.addColorStop(0, '#2C3664'); bg.addColorStop(1, '#121831'); c.fillStyle = bg; c.fillRect(0, 0, W, Hh);
  const cx = W/2, cy = Hh*0.62, sc = W/220;
  if (!chestAnim) {
    const types = Object.keys(CHESTS);
    types.forEach((tp, k) => drawChestBox(c, tp, W*(0.2 + k*0.3), cy + Math.sin(clock*2 + k)*4, sc*0.55, 0, 0.25));
    return;
  }
  const A = chestAnim; A.t += dt;
  if (A.multi && A.phase !== 'shake') { drawChestCards(c, W, Hh, dt); return; }
  const rar = A.item.r, rc = RAR6[rar][1];
  if (A.phase === 'shake') {
    const k = Math.floor(A.t/0.55), local = A.t % 0.55, amp = local < 0.25 ? Math.sin(local/0.25*Math.PI*4)*(4 + k*3) : 0;
    const glow = Math.min(1, A.t/1.6);
    c.save(); c.translate(amp, 0); c.rotate(amp*0.01); drawChestBox(c, A.type, cx, cy, sc, 0, glow); c.restore();
    if (A.multi) { c.fillStyle = '#F1ECE2'; c.font = '600 ' + Math.round(26*sc/2.7) + 'px Outfit, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('× ' + A.multi.length, cx, cy - 62*sc); }
    if (local < 0.02 && mode === 'menu') tone(200 + k*120, 0.12, 'square', 0.05);
    if (A.t > 1.65) { A.phase = 'burst'; A.t = 0; tone(523, 0.4, 'triangle', 0.07); tone(784, 0.4, 'triangle', 0.06, 0, 0.1); tone(1046, 0.5, 'triangle', 0.06, 0, 0.2); buzz([30, 30, 80]);
      for (let q = 0; q < 70; q++) { const a = Math.random()*TAU, sp = 60 + Math.random()*220; A.parts.push({ x: cx, y: cy - 20*sc, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 80, life: 1.4, col: Math.random() < 0.5 ? rc : '#FFFFFF' }); } }
  } else {
    const lid = Math.min(1, A.t*3);
    c.save(); c.translate(cx, cy - 20*sc); c.rotate(clock*0.4); c.fillStyle = rc + '30';
    for (let k = 0; k < 14; k++) { c.rotate(TAU/14); c.beginPath(); c.moveTo(0, 0); c.lineTo(-18, -W); c.lineTo(18, -W); c.fill(); } c.restore();
    drawChestBox(c, A.type, cx, cy, sc, lid, 0.8);
    for (const p of A.parts) { p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 260*dt; p.life -= dt; if (p.life > 0) { c.globalAlpha = Math.min(1, p.life); c.fillStyle = p.col; c.fillRect(p.x, p.y, 3, 3); } }
    c.globalAlpha = 1; A.parts = A.parts.filter(p => p.life > 0);
    const rise = Math.min(1, A.t*1.6), isz = 0.55 + 0.45*rise, iy = Math.max(52*isz + 8, cy - 20*sc - rise*60*sc);
    const it = A.item;
    if (it.k.startsWith('p')) drawProfChip(revealCv, it.k, it.id, clock); else { const keep = previewLook; previewLook = { ...myLook }; drawChip(revealCv, it.k, it.id); previewLook = keep; }
    c.save(); c.shadowColor = rc; c.shadowBlur = 30; c.fillStyle = '#16112E'; rr(c, cx - 70*isz, iy - 48*isz, 140*isz, 96*isz, 14); c.fill(); c.strokeStyle = rc; c.lineWidth = 3; c.stroke(); c.restore();
    c.drawImage(revealCv, cx - 66*isz, iy - 45*isz, 132*isz, 90*isz);
    if (A.phase === 'burst' && A.t > 0.7) { A.phase = 'reveal'; syncChests(); if (rar === 'l' || rar === 'm') { startVictory(rar === 'm' ? 'champion' : 'fireworks'); } }
  }
}


// ----- "Open all": every chest bursts at once, then the cards flip one by one, best last -----
function chestCardChip(it) {
  if (it.cv) return it.cv;
  const cv = document.createElement('canvas'); cv.width = 176; cv.height = 120;
  if (it.k.startsWith('p')) drawProfChip(cv, it.k, it.id, clock); else { const keep = previewLook; previewLook = { ...myLook }; drawChip(cv, it.k, it.id); previewLook = keep; }
  return (it.cv = cv);
}
function drawChestCards(c, W, Hh, dt) {
  const A = chestAnim, M = A.multi, N = M.length, cx = W/2, cy = Hh*0.62, sc = W/220;
  if (A.phase === 'burst' && !A.cards) {
    A.t = 0; A.cards = true;
    for (let q = 0; q < 90; q++) { const a = Math.random()*TAU, sp = 80 + Math.random()*260; A.parts.push({ x: cx, y: cy - 20*sc, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 90, life: 1.4, col: Math.random() < 0.5 ? '#E9C46A' : '#FFFFFF' }); }
  }
  // grid layout
  const cols = N <= 3 ? N : N <= 8 ? 4 : N <= 15 ? 5 : N <= 24 ? 6 : 8, rows = Math.ceil(N / cols);
  let cw = Math.min(150, (W - 30)/cols - 10), ch = cw*0.8;
  if (rows*(ch + 10) > Hh - 24) { ch = (Hh - 24)/rows - 10; cw = ch/0.8; }
  const gx0 = (W - cols*(cw + 10) + 10)/2, gy0 = (Hh - rows*(ch + 10) + 10)/2;
  const step = Math.min(0.32, 3.2/N), fly = 0.45, t = A.t;
  // rays + the open chest fading behind the cards
  c.save(); c.translate(cx, cy - 20*sc); c.rotate(clock*0.3); c.fillStyle = 'rgba(233,196,106,0.10)';
  for (let k = 0; k < 14; k++) { c.rotate(TAU/14); c.beginPath(); c.moveTo(0, 0); c.lineTo(-20, -W); c.lineTo(20, -W); c.fill(); } c.restore();
  c.globalAlpha = Math.max(0, 1 - t*1.5); drawChestBox(c, A.type, cx, cy, sc, 1, 0.8); c.globalAlpha = 1;
  let allDone = true;
  M.forEach((it, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const tx = gx0 + col*(cw + 10) + cw/2, ty = gy0 + row*(ch + 10) + ch/2;
    const fk = Math.min(1, Math.max(0, (t - i*0.015)/fly)), e = 1 - Math.pow(1 - fk, 3);
    const x = cx + (tx - cx)*e, y = cy - 20*sc + (ty - cy + 20*sc)*e, s = 0.3 + 0.7*e;
    const ra = fly + 0.25 + i*step, f = Math.min(1, Math.max(0, (t - ra)/0.24));
    if (f < 1) allDone = false;
    if (f >= 0.5 && !it.flipped) {
      it.flipped = true; const rr6 = RAR_RANK(it.r);
      if (!A.skip || i === N - 1) tone(400 + rr6*110, 0.1, 'triangle', 0.05);
      if (rr6 >= 3) { buzz(rr6 >= 4 ? [40, 30, 90] : 25); for (let q = 0; q < 24 + rr6*8; q++) { const a = Math.random()*TAU, sp = 40 + Math.random()*160; A.parts.push({ x: tx, y: ty, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 60, life: 1.1, col: Math.random() < 0.6 ? RAR6[it.r][1] : '#FFFFFF' }); } }
    }
    const sx = Math.abs(Math.cos(f*Math.PI)) || 0.02, front = f >= 0.5, w = cw*s, h = ch*s;
    c.save(); c.translate(x, y); c.scale(sx, 1);
    if (!front) {
      const C = CHESTS[it.ct]; c.fillStyle = '#1E2648'; rr(c, -w/2, -h/2, w, h, 10); c.fill();
      c.strokeStyle = C.col; c.lineWidth = 2; c.stroke();
      c.fillStyle = C.col; c.font = '600 ' + Math.round(h*0.42) + 'px Outfit, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 0, 2);
    } else {
      const rc = RAR6[it.r][1], hi = RAR_RANK(it.r) >= 3;
      c.shadowColor = rc; c.shadowBlur = hi ? 18 + 6*Math.sin(clock*5) : 8; c.fillStyle = '#16112E'; rr(c, -w/2, -h/2, w, h, 10); c.fill(); c.shadowBlur = 0;
      c.strokeStyle = rc; c.lineWidth = hi ? 3 : 2; c.stroke();
      const cv = chestCardChip(it), iw = w*0.86, ih = iw*120/176;
      c.globalAlpha = it.dup ? 0.45 : 1; c.drawImage(cv, -iw/2, -h/2 + 3, iw, Math.min(ih, h*0.66)); c.globalAlpha = 1;
      if (h > 46) {
        c.fillStyle = '#F1ECE2'; c.font = '600 ' + Math.max(9, Math.round(h*0.12)) + 'px Outfit, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
        let nm = itemLabel(it.k, it.id); while (c.measureText(nm).width > w - 8 && nm.length > 3) nm = nm.slice(0, -2) + '…';
        c.fillText(nm, 0, h/2 - 6);
      }
      c.fillStyle = it.dup ? '#E9C46A' : '#8CD3B0'; c.font = '700 ' + Math.max(8, Math.round(h*0.1)) + 'px Outfit, system-ui, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top';
      c.fillText(it.dup ? '+' + it.refund : 'NEW', -w/2 + 6, -h/2 + 5);
    }
    c.restore();
  });
  for (const p of A.parts) { p.x += p.vx*dt; p.y += p.vy*dt; p.vy += 260*dt; p.life -= dt; if (p.life > 0) { c.globalAlpha = Math.min(1, p.life); c.fillStyle = p.col; c.fillRect(p.x, p.y, 3, 3); } }
  c.globalAlpha = 1; A.parts = A.parts.filter(p => p.life > 0);
  if (allDone && A.phase === 'burst') {
    A.phase = 'reveal'; syncChests();
    const best = M[N - 1].r; if (best === 'l' || best === 'm') startVictory(best === 'm' ? 'champion' : 'fireworks');
  }
}
