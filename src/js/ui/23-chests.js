// ---------- chests ----------
const CHESTS = {
  wood: { n: 'Wooden chest',     price: 120, odds: { c: 50, u: 30, r: 15, e: 5 },              col: '#C08040', trim: '#8A5A2B' },
  gold: { n: 'Gold chest',    price: 350, odds: { u: 35, r: 35, e: 22, l: 7, m: 1 },       col: '#FFD84A', trim: '#C9921A' },
  myth: { n: 'Mythic chest', price: 900, odds: { r: 30, e: 40, l: 25, m: 5 },             col: '#FF4F8B', trim: '#7A1A4A' }
};
const KIND_NAME = { c: 'Color', h: 'Hat', f: 'Face', k: 'Skin', t: 'Ball trail', v: 'Win effect', a: 'Arena', u: 'Aura', b: 'Ball skin', pb: 'Border', pg: 'Background', pt: 'Title', pe: 'Emblem' };
function priceRarity(p) { return p <= 60 ? 'c' : p <= 120 ? 'u' : p <= 180 ? 'r' : p <= 250 ? 'e' : 'l'; }
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
  const fresh = cand.filter(it => !ownsAny(it.k, it.id));
  const it = (fresh.length && Math.random() < 0.75 ? pick(fresh) : pick(cand));
  const dup = ownsAny(it.k, it.id);
  return { ...it, dup, refund: dup ? Math.round((RAR6[it.r][2] || 1500)*0.4) : 0 };
}
let freeChests = Math.max(0, Math.floor(+store('trepong-freechest') || 0));
let chestAnim = null;   // { type, t, phase: 'shake' | 'burst' | 'reveal', item }
function saveFree() { store('trepong-freechest', String(freeChests)); syncChestBadge(); }
function syncChestBadge() { const b = $('#chestBadge'); if (!b) return; b.hidden = !freeChests; b.textContent = freeChests; }
function openChestScreen() { chestAnim = null; showScreen('chests'); syncChests(); }
function syncChests() {
  $('#chestCoins').textContent = fmt(coins);
  const left = 5 - ((stats.matches || 0) % 5);
  $('#chestNote').textContent = freeChests ? 'You have ' + freeChests + ' free wooden chest' + (freeChests === 1 ? '' : 's') + ' to open!' : 'Next free wooden chest in ' + left + (left === 1 ? ' match.' : ' matches.');
  $('#btnFreeChest').hidden = !freeChests;
  for (const t in CHESTS) { const b = $('#buy_' + t); b.disabled = !!chestAnim && chestAnim.phase !== 'reveal' || coins < CHESTS[t].price; }
  const rv = $('#chestReveal');
  if (chestAnim && chestAnim.phase === 'reveal') {
    const it = chestAnim.item; rv.hidden = false;
    $('#revRar').textContent = RAR6[it.r][0] + ' · ' + KIND_NAME[it.k]; $('#revRar').style.color = RAR6[it.r][1];
    $('#revName').textContent = itemLabel(it.k, it.id);
    $('#revDup').textContent = it.dup ? 'You already had it. You get ' + it.refund + ' coins instead.' : 'New item!';
    $('#btnUseNow').hidden = it.dup || it.k === 'a';
  } else rv.hidden = true;
}
function startChest(type, free) {
  if (chestAnim && chestAnim.phase !== 'reveal') return;
  if (free) { if (!freeChests) return; freeChests--; saveFree(); }
  else { if (coins < CHESTS[type].price) return; coins -= CHESTS[type].price; saveWallet(); }
  audioOn(); track('chests');
  const item = rollChest(type);
  if (item.dup) addCoins(item.refund); else owned.add(item.k + ':' + item.id);
  saveWallet();
  chestAnim = { type, t: 0, phase: 'shake', item, parts: [] };
  syncChests();
}
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
  const bg = c.createRadialGradient(W/2, Hh*0.55, 10, W/2, Hh*0.55, W*0.7); bg.addColorStop(0, '#2A2060'); bg.addColorStop(1, '#0C0A1C'); c.fillStyle = bg; c.fillRect(0, 0, W, Hh);
  const cx = W/2, cy = Hh*0.62, sc = W/220;
  if (!chestAnim) {
    const types = Object.keys(CHESTS);
    types.forEach((tp, k) => drawChestBox(c, tp, W*(0.2 + k*0.3), cy + Math.sin(clock*2 + k)*4, sc*0.55, 0, 0.25));
    return;
  }
  const A = chestAnim; A.t += dt;
  const rar = A.item.r, rc = RAR6[rar][1];
  if (A.phase === 'shake') {
    const k = Math.floor(A.t/0.55), local = A.t % 0.55, amp = local < 0.25 ? Math.sin(local/0.25*Math.PI*4)*(4 + k*3) : 0;
    const glow = Math.min(1, A.t/1.6);
    c.save(); c.translate(amp, 0); c.rotate(amp*0.01); drawChestBox(c, A.type, cx, cy, sc, 0, glow); c.restore();
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

