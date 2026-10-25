// ---------- customize & shop ----------
let previewLook = { ...myLook }, buyTarget = null;
function lookLabel(l) {
  const c = PALETTE.find(p => p[0] === l.c), h = HATS.find(p => p[0] === l.h), f = FACES.find(p => p[0] === l.f);
  return [c && c[1], h && h[0] !== 'none' ? h[1] : null, f && f[0] !== 'none' ? f[1] : null].filter(Boolean).join(' · ');
}
const SHOP_TABS = [['c', 'Color'], ['h', 'Hats'], ['f', 'Faces'], ['k', 'Skins'], ['t', 'Ball trail'], ['b', 'Ball'], ['u', 'Aura'], ['v', 'Win effect'], ['a', 'Arenas']];
let shopTab = 'h';
const LOOK_FIELD = { c: 'c', h: 'h', f: 'f', t: 't', k: 's', v: 'v', u: 'u', b: 'b' };
function shopList(kind) { return { c: PALETTE, h: HATS, f: FACES, k: SKINS, t: TRAILS, v: VICTORY, u: AURAS, b: BALLSKINS, a: Object.entries(ARENAS) }[kind]; }
function exclusiveFloor(kind, id) { for (const f in TOWER_LOOT) if (TOWER_LOOT[f].some(it => it[0] === kind && it[1] === id)) return f; return '?'; }
function selectItem(kind, id) {
  if (kind === 'a') {
    if (ownsItem('a', id)) { menuArena = id; store('trepong-arena', id); buyTarget = null; syncArenaSeg(); }
    else buyTarget = ['a', id];
    syncShop(); return;
  }
  if (secretLocked(kind, id)) { buyTarget = [kind, id]; tone(220, 0.08, 'square', 0.03); syncShop(); return; } // no peeking
  const fld = LOOK_FIELD[kind];
  previewLook = { ...previewLook, [fld]: id };
  if (kind === 'v') vicPreview = { type: id, t: 0 };
  if (ownsItem(kind, id)) { myLook = validLook({ ...myLook, [fld]: id }); store('trepong-look', JSON.stringify(myLook)); buyTarget = null; }
  else buyTarget = [kind, id];
  syncShop();
}
function itemName(kind, id) {
  const e = (shopList(kind) || []).find(p => p[0] === id); return e ? e[1] : id;
}
function buildShopTabs() {
  const box = $('#shopTabs'); box.textContent = '';
  for (const [k, n] of SHOP_TABS) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.k = k; b.textContent = n;
    b.addEventListener('click', () => { shopTab = k; buildShopGrid(); syncShop(); });
    box.append(b);
  }
}
function buildShopGrid() {
  const grid = $('#shopGrid'); grid.textContent = '';
  for (const [id, n] of shopList(shopTab)) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.id = id;
    const cvs = document.createElement('canvas'); cvs.width = 88; cvs.height = 60;
    const sp = document.createElement('span'); sp.textContent = secretLocked(shopTab, id) ? '???' : n;
    if (SECRETS[shopTab + ':' + id]) b.classList.add('secret');
    const pr = document.createElement('span'); pr.className = 'pr';
    b.append(cvs, sp, pr);
    b.addEventListener('click', () => selectItem(shopTab, id));
    grid.append(b);
  }
}
function drawChip(cvs, kind, id) {
  const L = previewLook;
  if (kind === 'c') lookCanvas(cvs, { ...L, c: id, h: 'none', f: 'eyes' }, 2.4, 11);
  else if (kind === 'h') lookCanvas(cvs, { ...L, h: id, f: 'none' }, 2.3, 9);
  else if (kind === 'f') lookCanvas(cvs, { ...L, h: 'none', f: id }, 3.6, 9);
  else if (kind === 'k') lookCanvas(cvs, { ...L, h: 'none', f: 'none', s: id }, 2.6, 13);
  else if (kind === 't') drawTrailChip(cvs, id);
  else if (kind === 'v') drawVictoryChip(cvs, id);
  else if (kind === 'a') drawArenaChip(cvs, id);
  else if (kind === 'u') lookCanvas(cvs, { ...L, u: id, h: 'none' }, 2.1, 13);
  else if (kind === 'b') { if (id.endsWith('_g') || id === 'eightball' || id === 'legend' || LX_BALLS[id]) { const c = cvs.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cvs.width, cvs.height); drawBallSkinX(c, id, cvs.width/2, cvs.height/2, 13, clock, 1, 0); } else if (id === 'std' || !drawBallChip(cvs, id)) { const c = cvs.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cvs.width, cvs.height); c.fillStyle = '#fff'; c.beginPath(); c.arc(cvs.width/2, cvs.height/2, 12, 0, TAU); c.fill(); } }
}
function syncShop() {
  syncCoinUI();
  $('#shopTabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === shopTab)));
  $('#shopGrid').querySelectorAll('button').forEach(b => {
    const id = b.dataset.id, own = ownsItem(shopTab, id), ex = isExclusive(shopTab, id);
    const sel = shopTab === 'a' ? (menuArena === id || (buyTarget && buyTarget[0] === 'a' && buyTarget[1] === id)) : previewLook[LOOK_FIELD[shopTab]] === id;
    b.setAttribute('aria-pressed', String(!!sel)); b.classList.toggle('locked', !own);
    const pr = b.querySelector('.pr'); pr.textContent = own ? '' : ex ? exclusiveText(shopTab, id).short : fmt(PRICE[shopTab][id]); b.classList.toggle('luxe', PRICE[shopTab][id] >= LUXE_MIN); pr.classList.toggle('ex', !own && ex);
    if (secretLocked(shopTab, id)) { pr.textContent = 'Secret'; drawSecretChip(b.querySelector('canvas')); } else drawChip(b.querySelector('canvas'), shopTab, id);
  });
  const bar = $('#buyBar');
  if (buyTarget) {
    const [k, id] = buyTarget, price = PRICE[k][id];
    bar.hidden = false;
    if (secretLocked(k, id)) { $('#buyTxt').textContent = '??? · "' + SECRETS[k + ':' + id] + '"'; $('#btnBuy').disabled = true; }
    else if (isExclusive(k, id)) { $('#buyTxt').textContent = itemName(k, id) + ': ' + exclusiveText(k, id).long; $('#btnBuy').disabled = true; }
    else if (coins >= price) { $('#buyTxt').textContent = itemName(k, id) + ' costs ' + fmt(price) + ' coins.' + (price >= LUXE_MIN ? ' ✦ Luxe item' : ''); $('#btnBuy').disabled = false; }
    else { $('#buyTxt').textContent = itemName(k, id) + ' costs ' + fmt(price) + ' coins. You need ' + fmt(price - coins) + ' more.'; $('#btnBuy').disabled = true; }
  } else bar.hidden = true;
}
function drawArenaChip(cvs, id) {
  const c = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  c.fillStyle = { ice: '#BFEFFF', hole: '#1A0828', retro: '#06210F', classic: '#241C4A' }[id]; c.beginPath(); c.moveTo(w/2, 4); c.lineTo(w - 10, h - 4); c.lineTo(10, h - 4); c.closePath(); c.fill();
  if (id === 'hole') { const g = c.createRadialGradient(w/2, h*0.62, 0, w/2, h*0.62, 14); g.addColorStop(0, '#000'); g.addColorStop(0.6, 'rgba(255,140,60,0.8)'); g.addColorStop(1, 'rgba(255,140,60,0)'); c.fillStyle = g; c.beginPath(); c.arc(w/2, h*0.62, 14, 0, TAU); c.fill(); }
  if (id === 'retro') { c.strokeStyle = '#3CFF8C'; c.lineWidth = 1; for (let x = 14; x < w - 10; x += 8) { c.beginPath(); c.moveTo(x, h - 4); c.lineTo(w/2, 4); c.stroke(); } }
  if (id === 'ice') { c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(w*0.35, h*0.7); c.lineTo(w*0.5, h*0.55); c.lineTo(w*0.62, h*0.75); c.stroke(); }
  c.strokeStyle = { ice: '#7FD8FF', hole: '#FF8C3C', retro: '#3CFF8C', classic: '#7C6FD0' }[id]; c.lineWidth = 2; c.beginPath(); c.moveTo(w/2, 4); c.lineTo(w - 10, h - 4); c.lineTo(10, h - 4); c.closePath(); c.stroke();
}
function syncArenaSeg() {
  const seg = $('#arenaSeg'); seg.textContent = '';
  for (const [id, n] of Object.entries(ARENAS)) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.a = id;
    const own = ownsItem('a', id);
    b.setAttribute('aria-pressed', String(curArena() === id));
    b.append(document.createTextNode(n));
    if (!own) { const s = document.createElement('small'); s.textContent = PRICE.a[id] + ' coins'; b.append(s); }
    b.addEventListener('click', () => { if (own) { menuArena = id; store('trepong-arena', id); syncArenaSeg(); } else { openShop('a'); buyTarget = ['a', id]; syncShop(); } });
    seg.append(b);
  }
}
function drawTrailChip(cvs, id) {
  const c = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  for (let i = 0; i < 9; i++) { const k = (i+1)/9; c.globalAlpha = id === 'std' ? k*0.7 : 0.4 + k*0.6; trailDot(c, id, previewLook.c, 10 + i*7.5, h/2 + Math.sin(i*0.7)*6, 6, k, i, clock); }
  c.globalAlpha = 1; c.fillStyle = '#fff'; c.beginPath(); c.arc(78, h/2 + Math.sin(9*0.7)*6, 6, 0, TAU); c.fill();
}
function buildCustom() { buildShopTabs(); buildShopGrid(); }
function openShop(tab) { previewLook = { ...myLook }; buyTarget = null; if (tab) shopTab = tab; showScreen('custom'); buildShopGrid(); syncShop(); }
function closeShop() { previewLook = { ...myLook }; buyTarget = null; showScreen('menu'); }
function buy() {
  if (!buyTarget) return;
  const [k, id] = buyTarget, price = PRICE[k][id];
  if (price == null || coins < price) return;
  coins -= price; owned.add(k + ':' + id); saveWallet(); sfx.coin(); buzz(20);
  if (k === 'a') { menuArena = id; store('trepong-arena', id); }
  else { const fld = LOOK_FIELD[k]; myLook = validLook({ ...myLook, [fld]: id }); store('trepong-look', JSON.stringify(myLook)); previewLook = { ...previewLook, [fld]: id }; }
  buyTarget = null; toast(itemName(k, id) + ' is yours!'); track('buys'); syncArenaSeg();
  syncShop();
}
function drawPreview() {
  const cvs = $('#preview'), c = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  c.setTransform(1, 0, 0, 1, 0, 0);
  c.fillStyle = '#0C0A1C'; c.fillRect(0, 0, w, h);
  const bt = i => [w/2 + Math.sin((clock - i*0.035)*1.3)*w*0.32, h*0.18 + Math.abs(Math.sin((clock - i*0.035)*2.6))*h*0.35];
  for (let i = 12; i >= 1; i--) { const [x, y] = bt(i), k = 1 - i/13; c.globalAlpha = previewLook.t === 'std' ? k*0.5 : 0.35 + k*0.5; trailDot(c, previewLook.t, previewLook.c, x, y, 9, k, i, clock); }
  c.globalAlpha = 1;
  const [bx, by] = bt(0);
  if (vicPreview && shopTab === 'v') { vicPreview.t += 1/60; if (vicPreview.t > 3) vicPreview = null; else { c.globalAlpha = 1; for (let k = 0; k < 18; k++) { const sx = (k*97 + vicPreview.t*60*((k % 3) + 1)) % w, sy = (k*53 + vicPreview.t*140*(1 + k % 2)) % h; c.fillStyle = 'hsl(' + (k*40 % 360) + ',90%,62%)'; c.fillRect(sx, sy, 6, 3); } } }
  c.fillStyle = '#fff'; c.shadowColor = previewLook.c; c.shadowBlur = 16; c.beginPath(); c.arc(bx, by, 9, 0, TAU); c.fill(); c.shadowBlur = 0;
  const px = w/2 + Math.sin(clock*1.3 - 0.3)*w*0.12, py = h*0.8, s = 4.4;
  const gx = bx - px, gy = by - py, gl = Math.hypot(gx, gy) || 1;
  c.setTransform(s, 0, 0, s, px, py);
  drawPaddleLocal(c, previewLook, 18, clock, [gx/gl, gy/gl], {}, 16);
}

// ---------- smash & emotes ----------
function doSmash() {
  if (!st || mySeat < 0 || st.ph === 'ov' || !st.alive[mySeat] || st.sm[mySeat] < 1 || st.arm[mySeat] > 0) return;
  if (mode === 'guest') { mySmashN++; if (net) net.presence({ smash: mySmashN }).catch(() => {}); st.sm[mySeat] = 0; }
  else if (trySmash(st, mySeat)) fx('arm', mySeat, 0, 0);
  track('smashes');
}
function doHero() {
  if (!st || mySeat < 0 || st.he[mySeat] === 'none' || st.hc[mySeat] < 1 || st.ph !== 'pl') return;
  if (mode === 'guest') { myHeroN++; if (net) net.presence({ abil: myHeroN }).catch(() => {}); st.hc[mySeat] = 0; fx('hero', mySeat, 0, 0, null, st.he[mySeat]); }
  else useHero(st, mySeat, fx);
  track('heroUses');
}
function sendEmote(i) {
  const now = performance.now(); if (now - lastEmoT < 700) return; lastEmoT = now;
  const e = EMOTES[i]; bubble(mySeat, e); track('emotes');
  if (net && (mode === 'guest' || mode === 'host')) { myEmoN++; net.presence({ emo: [myEmoN, i] }).catch(() => {}); }
  else if (mode === 'practice' && Math.random() < 0.5) setTimeout(() => { const b = bots.map((x, k) => x && (!st || !st.boss || k !== st.boss.s) ? k : -1).filter(k => k >= 0); if (b.length) bubble(pick(b), pick(['😂', '😎', 'GG', '👋'])); }, 700);
  $('#emoteTray').hidden = true;
}
function readEmotes() {
  if (!net) return;
  for (const p of findPeers()) {
    if (p.sameTab) continue;
    const e = p.presence.emo; if (!Array.isArray(e)) continue;
    const seat = p.presence.role === 'host' ? 0 : hostSeats.indexOf(p.peer);
    if (lastEmoSeen[p.peer] !== undefined && lastEmoSeen[p.peer] !== e[0] && seat >= 0 && EMOTES[e[1]]) bubble(seat, EMOTES[e[1]]);
    lastEmoSeen[p.peer] = e[0];
  }
}
function syncPlayButtons() {
  const inGame = !!st && curScreen == null && mode !== 'menu' && !replay;
  const canSmash = inGame && mySeat >= 0 && st.alive[mySeat] && st.ph !== 'ov' && st.sm[mySeat] >= 1 && !(st.arm[mySeat] > 0);
  $('#smashBtn').hidden = !canSmash;
  $('#emoteBtn').hidden = !inGame || mySeat < 0;
  const canHero = inGame && mySeat >= 0 && st.alive[mySeat] && st.ph === 'pl' && st.he[mySeat] !== 'none' && st.hc[mySeat] >= 1;
  const hb = $('#heroBtn'); hb.hidden = !canHero; if (canHero) hb.textContent = HEROES[st.he[mySeat]][0].toUpperCase();
  if (!inGame) $('#emoteTray').hidden = true;
}

