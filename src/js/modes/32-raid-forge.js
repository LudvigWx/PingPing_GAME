// ---------- raid modifiers & the Raid Forge ----------
const RAID_MODS = [
  { n: 'Normal', col: '#7CFFB2', armL: 2, rate: 1, spd: 1, err: 1, heal: 0, luck: 1, shards: 1, desc: 'The standard raid.' },
  { n: 'Hard', col: '#FFB23E', armL: 3, rate: 0.9, spd: 1.03, err: 1, heal: 0.15, luck: 1.5, shards: 3, desc: 'Arms have 3 lives, attacks come faster and the core slowly heals itself. Drop chances ×1.5, 3 raid shards per clear.' },
  { n: 'Nightmare', col: '#FF2244', armL: 3, rate: 0.8, spd: 1.06, err: 0.95, heal: 0.3, luck: 2.5, shards: 8, nm: 1, desc: 'Arms have 3 lives, the core heals fast, attacks never stop and every phase twists the arena. Drop chances ×2.5, 8 shards per clear and gilded mythics that only drop here.' }
];
const FORGE_PTS = { shard: 5, r: 10, e: 30, l: 100, m: 400 };
const FORGE_GOAL = 1000;
const GILDED = { pearl: 'leviathan', core: 'colossus', sun: 'solarion', glitch: 'hydra' };
for (const [b, id] of Object.entries(GILDED)) {
  BALLSKINS.push([b + '_g', 'Gilded ' + BALLSKINS.find(x => x[0] === b)[1].toLowerCase()]); PRICE.b[b + '_g'] = null;
  RAIDS[id].loot.push(['b', b + '_g', 'm', 0.004, 1]);
}
for (const [id, R] of Object.entries(RAIDS)) for (const it of R.loot) RAID_SRC[lootKey(it)] = R.n + (it[4] ? ' (Nightmare)' : '');
// gilded ball skins = the base skin wrapped in molten gold and sparkles
function drawBallSkinX(c, id, x, y, r, t, vx, vy) {
  if (drawBallSkin4(c, id, x, y, r, t, vx, vy) || drawBallSkin5(c, id, x, y, r, t, vx, vy)) return true;
  if (!id || !id.endsWith('_g')) return drawBallSkin(c, id, x, y, r, t, vx, vy);
  drawBallSkin(c, id.slice(0, -2), x, y, r, t, vx, vy);
  c.save(); const A0 = c.globalAlpha;
  c.strokeStyle = '#FFD84A'; c.lineWidth = r*0.16; c.globalAlpha = A0*(0.75 + 0.25*Math.sin(t*6));
  c.beginPath(); c.arc(x, y, r*1.18, 0, TAU); c.stroke();
  c.strokeStyle = '#FFF6B0'; c.lineWidth = r*0.06; c.beginPath(); c.arc(x, y, r*1.18, t*3, t*3 + 1.2); c.stroke();
  c.fillStyle = '#FFE58A';
  for (let k = 0; k < 4; k++) { const a = t*2 + k*TAU/4, d = r*(1.45 + 0.12*Math.sin(t*5 + k)); c.globalAlpha = A0*(0.5 + 0.5*Math.sin(t*7 + k*2)); star4(c, x + Math.cos(a)*d, y + Math.sin(a)*d, r*0.28); }
  c.restore(); return true;
}
// ----- forge state -----
function forgeData() { const f = raidData._forge || (raidData._forge = { pts: 0, chests: 0, stash: {}, opened: 0 }); f.stash = f.stash || {}; return f; }
function stashAdd(key, n) { const f = forgeData(); f.stash[key] = (f.stash[key] || 0) + n; }
function stashRar(key) { if (key === 'shard') return 'shard'; for (const R of Object.values(RAIDS)) for (const it of R.loot) if (lootKey(it) === key) return it[2]; return 'r'; }
function stashItem(key) { for (const R of Object.values(RAIDS)) for (const it of R.loot) if (lootKey(it) === key) return it; return null; }
function allRaidLoot() { const out = []; for (const id of RAID_ORDER) for (const it of RAIDS[id].loot) out.push([id, it]); return out; }
// Raid chest: one raid item, rarity Epic 50 / Legendary 35 / Mythic 15, prefers things you don't own.
function rollRaidChest() {
  const x = Math.random()*100, rar = x < 50 ? 'e' : x < 85 ? 'l' : 'm';
  let pool = allRaidLoot().map(p => p[1]).filter(it => it[2] === rar);
  const fresh = pool.filter(it => !ownsLoot(it));
  const it = fresh.length && Math.random() < 0.9 ? pick(fresh) : pick(pool);
  return it;
}
let forgeSel = {}, forgeArmed = false, forgeAnim = null, raidTab = 'raids';
function renderForge() {
  const f = forgeData();
  $('#forgePts').textContent = fmt(f.pts) + ' / ' + fmt(FORGE_GOAL);
  $('#forgeBar').style.width = Math.min(100, 100*f.pts/FORGE_GOAL) + '%';
  $('#btnForgeMake').disabled = f.pts < FORGE_GOAL;
  $('#btnForgeMake').textContent = f.pts >= FORGE_GOAL ? 'Forge a Raid Chest (−' + fmt(FORGE_GOAL) + ' pts)' : 'Need ' + fmt(FORGE_GOAL - f.pts) + ' more forge points';
  $('#btnForgeOpen').hidden = !f.chests || !!forgeAnim; $('#btnForgeOpen').textContent = 'Open Raid Chest' + (f.chests > 1 ? ' (' + f.chests + ')' : '');
  // stash
  const box = $('#forgeStash'); box.textContent = '';
  const keys = Object.keys(f.stash).filter(k => f.stash[k] > 0).sort((a, b) => (FORGE_PTS[stashRar(b)] || 0) - (FORGE_PTS[stashRar(a)] || 0));
  let selPts = 0;
  if (!keys.length) box.append(Object.assign(document.createElement('p'), { className: 'note', textContent: 'Nothing to sacrifice yet. Every raid clear gives raid shards, and duplicate drops land here instead of turning into coins.' }));
  for (const k of keys) {
    const rar = stashRar(k), it = stashItem(k), have = f.stash[k], sel = Math.min(have, forgeSel[k] || 0);
    selPts += sel*(FORGE_PTS[rar] || 0);
    const row = document.createElement('div'); row.className = 'srow ' + rar;
    const cv = document.createElement('canvas'); cv.width = 88; cv.height = 60; cv.className = 'lootcv'; cv.dataset.k = it ? it[0] : 'shard'; cv.dataset.id = it ? it[1] : 'shard';
    const mid = document.createElement('div');
    mid.append(Object.assign(document.createElement('b'), { textContent: it ? lootName(it) : 'Raid shard' }),
      Object.assign(document.createElement('small'), { textContent: (rar === 'shard' ? 'Shard' : RAR_NAME[rar] + ' copy') + ' · ' + FORGE_PTS[rar] + ' pts each · you have ' + have }));
    const ctl = document.createElement('div'); ctl.className = 'sctl';
    const mk = (t, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = t; b.addEventListener('click', () => { fn(); forgeArmed = false; renderForge(); }); return b; };
    ctl.append(mk('−', () => forgeSel[k] = Math.max(0, sel - 1)), Object.assign(document.createElement('b'), { textContent: sel }), mk('+', () => forgeSel[k] = Math.min(have, sel + 1)), mk('All', () => forgeSel[k] = have));
    row.append(cv, mid, ctl); box.append(row);
  }
  const sb = $('#btnSacrifice'); sb.hidden = !keys.length; sb.disabled = !selPts;
  sb.textContent = forgeArmed ? 'Tap again: sacrifice for +' + fmt(selPts) + ' pts' : selPts ? 'Sacrifice selected (+' + fmt(selPts) + ' pts)' : 'Pick items to sacrifice';
  sb.classList.toggle('armed', forgeArmed);
  $('#btnSelAll').hidden = !keys.length;
  // collection
  const col = $('#forgeColl'); col.textContent = '';
  for (const id of RAID_ORDER) {
    const R = RAIDS[id], g = document.createElement('div'); g.className = 'cgroup';
    g.append(Object.assign(document.createElement('div'), { className: 'eyebrow', textContent: R.n + ' · ' + R.loot.filter(ownsLoot).length + '/' + R.loot.length }));
    const grid = document.createElement('div'); grid.className = 'cgrid';
    for (const it of R.loot) {
      const own = ownsLoot(it), cp = f.stash[lootKey(it)] || 0;
      const d = document.createElement('div'); d.className = 'citem ' + it[2] + (own ? ' own' : '');
      const cv = document.createElement('canvas'); cv.width = 88; cv.height = 60; cv.className = 'lootcv'; cv.dataset.k = it[0]; cv.dataset.id = it[1];
      d.append(cv, Object.assign(document.createElement('span'), { textContent: own ? lootName(it) : '???' }), Object.assign(document.createElement('small'), { textContent: own ? (cp ? '+' + cp + ' copies' : 'Owned') : RAR_NAME[it[2]] + (it[4] ? ' · Nightmare' : '') }));
      grid.append(d);
    }
    g.append(grid); col.append(g);
  }
  $('#forgeStats').textContent = 'Raid chests opened: ' + (f.opened || 0) + ' · Each chest holds one raid item: Epic 50% · Legendary 35% · Mythic 15%, and it prefers items you don\'t own yet.';
}
function sacrificeSelected() {
  const f = forgeData(); let pts = 0;
  for (const k in forgeSel) pts += Math.min(f.stash[k] || 0, forgeSel[k] || 0)*(FORGE_PTS[stashRar(k)] || 0);
  if (!pts) return;
  if (!forgeArmed) { forgeArmed = true; renderForge(); return; }
  for (const k in forgeSel) { const n = Math.min(f.stash[k] || 0, forgeSel[k] || 0); if (!n) continue; f.stash[k] -= n; if (f.stash[k] <= 0) delete f.stash[k]; }
  forgeArmed = false; f.pts += pts; forgeSel = {}; saveRaid();
  forgeAnim = { kind: 'burn', t: 0, pts }; tone(110, 0.8, 'sawtooth', 0.06, 0.4); tone(440, 0.4, 'triangle', 0.05, 2, 0.3); buzz([30, 30, 60]);
  toast('+' + fmt(pts) + ' forge points!'); renderForge();
}
function forgeMake() { const f = forgeData(); if (f.pts < FORGE_GOAL) return; f.pts -= FORGE_GOAL; f.chests++; saveRaid(); forgeAnim = { kind: 'make', t: 0 }; tone(220, 0.6, 'square', 0.05, 2); tone(660, 0.8, 'triangle', 0.05, 1.5, 0.3); renderForge(); }
function forgeOpen() {
  const f = forgeData(); if (!f.chests || forgeAnim) return;
  f.chests--; f.opened = (f.opened || 0) + 1;
  const it = rollRaidChest(), dup = ownsLoot(it);
  if (dup) stashAdd(lootKey(it), 1); else { owned.add(lootKey(it)); saveWallet(); }
  saveRaid();
  forgeAnim = { kind: 'open', t: 0, it, dup };
  $('#forgeReveal').hidden = true; renderForge();
}
function drawRaidChest(c, x, y, s, lid, t, glow) {
  c.save(); c.translate(x, y); c.scale(s, s);
  if (glow > 0) { const g = c.createRadialGradient(0, -10, 0, 0, -10, 110); g.addColorStop(0, 'rgba(255,79,139,0.55)'); g.addColorStop(0.5, 'rgba(62,230,255,0.25)'); g.addColorStop(1, 'rgba(62,230,255,0)'); c.globalAlpha = glow; c.fillStyle = g; c.fillRect(-120, -130, 240, 240); c.globalAlpha = 1; }
  c.fillStyle = 'rgba(0,0,0,0.4)'; c.beginPath(); c.ellipse(0, 44, 58, 10, 0, 0, TAU); c.fill();
  const body = c.createLinearGradient(0, -5, 0, 42); body.addColorStop(0, '#2A1A4A'); body.addColorStop(1, '#0E0820');
  c.fillStyle = body; rr(c, -50, -4, 100, 46, 7); c.fill();
  // glowing rune cracks
  const pulse = 0.55 + 0.45*Math.sin(t*3);
  c.strokeStyle = 'rgba(62,230,255,' + pulse + ')'; c.lineWidth = 2;
  c.beginPath(); c.moveTo(-40, 8); c.lineTo(-28, 18); c.lineTo(-34, 30); c.moveTo(38, 6); c.lineTo(30, 20); c.lineTo(40, 32); c.stroke();
  c.strokeStyle = 'rgba(255,79,139,' + pulse + ')'; c.beginPath(); c.moveTo(-12, 36); c.lineTo(-4, 26); c.lineTo(6, 34); c.lineTo(14, 24); c.stroke();
  c.fillStyle = '#FFD84A'; c.fillRect(-50, 10, 100, 5); c.fillRect(-32, -4, 6, 46); c.fillRect(26, -4, 6, 46);
  c.save(); c.translate(-52, -4); c.rotate(-lid*1.15); c.translate(52, 0);
  const lg = c.createLinearGradient(0, -36, 0, 0); lg.addColorStop(0, '#4A2A7A'); lg.addColorStop(1, '#1A0E36');
  c.fillStyle = lg; c.beginPath(); c.moveTo(-52, 0); c.lineTo(-52, -20); c.quadraticCurveTo(0, -46, 52, -20); c.lineTo(52, 0); c.closePath(); c.fill();
  c.fillStyle = '#FFD84A'; c.fillRect(-32, -31, 6, 31); c.fillRect(26, -31, 6, 31);
  // crest: a little raid skull-eye
  c.fillStyle = 'rgba(255,79,139,' + (0.6 + 0.4*pulse) + ')'; c.beginPath(); c.ellipse(0, -18, 10, 6, 0, 0, TAU); c.fill();
  c.fillStyle = '#0C0A1C'; c.beginPath(); c.arc(0, -18, 3, 0, TAU); c.fill();
  c.restore();
  if (lid < 0.2) { c.fillStyle = '#FFD84A'; rr(c, -8, -8, 16, 18, 3); c.fill(); c.fillStyle = '#16112E'; c.beginPath(); c.arc(0, 0, 2.5, 0, TAU); c.fill(); c.fillRect(-1, 0, 2, 6); }
  c.restore();
}
let forgeParts = [];
function drawForgeStage(dt) {
  const cv = $('#forgeCv'); if (!cv) return;
  const c = cv.getContext('2d'), w = cv.width, h = cv.height, f = forgeData();
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  const bg = c.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#1A0E36'); bg.addColorStop(1, '#0C0A1C'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
  // anvil fire glow
  const fg = c.createRadialGradient(w/2, h*0.95, 10, w/2, h*0.95, w*0.5); fg.addColorStop(0, 'rgba(255,138,61,0.45)'); fg.addColorStop(1, 'rgba(255,138,61,0)'); c.fillStyle = fg; c.fillRect(0, 0, w, h);
  for (let k = 0; k < 14; k++) { const ph = (clock*0.4 + k*0.137) % 1; c.fillStyle = 'rgba(255,' + (140 + k*7) + ',60,' + (1 - ph) + ')'; c.fillRect(w*(0.2 + ((k*0.373) % 0.6)) + Math.sin(clock*2 + k)*8, h*(1 - ph), 3, 3); }
  let lid = 0, shakeX = 0, glow = 0.35, sc = 1.6;
  if (forgeAnim) {
    const A = forgeAnim; A.t += dt;
    if (A.kind === 'open') {
      if (A.t < 1.4) { shakeX = Math.sin(A.t*40)*A.t*5; glow = 0.4 + A.t*0.4; if (Math.random() < 0.3) tone(300 + A.t*400, 0.05, 'square', 0.03); }
      else { lid = Math.min(1, (A.t - 1.4)*4); glow = 1;
        if (!A.burst) { A.burst = true; for (let k = 0; k < 90; k++) { const a = Math.random()*TAU, sp = 60 + Math.random()*240; forgeParts.push({ x: w/2, y: h*0.6, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp - 120, life: 1.2 + Math.random(), col: RAR_C[A.it[2]] }); } sfx.win(); buzz([40, 30, 80, 30, 160]);
          const rv = $('#forgeReveal'); rv.hidden = false; rv.className = 'lootreveal ' + A.it[2]; rv.textContent = '';
          const cv2 = document.createElement('canvas'); cv2.width = 176; cv2.height = 120; cv2.className = 'lootcv'; cv2.dataset.k = A.it[0]; cv2.dataset.id = A.it[1];
          rv.append(cv2, Object.assign(document.createElement('span'), { className: 'lr', textContent: RAR_NAME[A.it[2]] + ' ' + LOOT_KIND[A.it[0]] }), Object.assign(document.createElement('b'), { textContent: lootName(A.it) }), Object.assign(document.createElement('small'), { textContent: A.dup ? 'You already had it: the copy went to your stash (' + FORGE_PTS[A.it[2]] + ' pts).' : 'New raid loot! It is yours.' }));
          if (A.it[2] === 'm') startVictory('supernova');
        }
        if (A.t > 4) { forgeAnim = null; renderForge(); } }
    } else if (A.kind === 'make' || A.kind === 'burn') {
      glow = 0.4 + Math.sin(Math.min(1, A.t)*Math.PI)*0.8; sc = 1.6 + Math.sin(Math.min(1, A.t)*Math.PI)*0.15;
      if (A.t < 0.6 && Math.random() < 0.7) forgeParts.push({ x: w/2 + (Math.random() - 0.5)*120, y: h*0.85, vx: (Math.random() - 0.5)*60, vy: -150 - Math.random()*150, life: 1, col: A.kind === 'make' ? '#FFD84A' : '#FF8A3D' });
      if (A.t > 1.2) { forgeAnim = null; renderForge(); }
    }
  }
  if (f.chests || (forgeAnim && forgeAnim.kind === 'open')) drawRaidChest(c, w/2 + shakeX, h*0.62, sc, lid, clock, glow);
  else { // an anvil with the progress glow
    c.save(); c.translate(w/2, h*0.7); c.fillStyle = '#2A2350'; c.beginPath(); c.moveTo(-90, -30); c.lineTo(90, -30); c.lineTo(70, -10); c.lineTo(30, -10); c.lineTo(40, 30); c.lineTo(-40, 30); c.lineTo(-30, -10); c.lineTo(-70, -10); c.closePath(); c.fill();
    const p = Math.min(1, f.pts/FORGE_GOAL); c.fillStyle = 'rgba(255,' + Math.round(120 + 100*p) + ',60,' + (0.3 + 0.6*p) + ')'; c.fillRect(-90, -34, 180*p, 5);
    c.globalAlpha = 0.25 + 0.5*p; drawRaidChest(c, 0, -62, 0.6, 0, clock, 0); c.restore();
  }
  const keep = [];
  for (const q of forgeParts) { q.x += q.vx*dt; q.y += q.vy*dt; q.vy += 220*dt; q.life -= dt; if (q.life > 0) { keep.push(q); c.globalAlpha = Math.min(1, q.life); c.fillStyle = q.col; c.fillRect(q.x, q.y, 3, 3); } }
  c.globalAlpha = 1; forgeParts = keep;
  if (!$('#forgeReveal').hidden) $('#forgeReveal').querySelectorAll('canvas').forEach(x => drawLootCv(x, x.dataset.k, x.dataset.id));
}
function drawShardChip(cv) {
  const c = cv.getContext('2d'), w = cv.width, h = cv.height; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  c.save(); c.translate(w/2, h/2); c.rotate(Math.sin(clock*1.5)*0.2);
  const g = c.createLinearGradient(-12, -18, 12, 18); g.addColorStop(0, '#FF4F8B'); g.addColorStop(0.5, '#B57CFF'); g.addColorStop(1, '#3EE6FF');
  c.fillStyle = g; c.beginPath(); c.moveTo(0, -h*0.38); c.lineTo(h*0.2, -h*0.05); c.lineTo(h*0.08, h*0.38); c.lineTo(-h*0.14, h*0.3); c.lineTo(-h*0.22, -h*0.08); c.closePath(); c.fill();
  c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 1; c.stroke();
  c.fillStyle = 'rgba(255,255,255,' + (0.4 + 0.4*Math.sin(clock*5)) + ')'; star4(c, h*0.08, -h*0.15, 3);
  c.restore();
}
// Shrink one panel a bit on short desktop windows so it never needs to scroll.
function fitPanel(p) {
  if (!p) return; p.style.zoom = '';
  if (!document.body.classList.contains('desk') || uiSize !== 'auto') return;
  const h = p.getBoundingClientRect().height, avail = innerHeight - 34;
  if (h > avail) { const z = +getComputedStyle(document.documentElement).getPropertyValue('--uiz') || 1; p.style.zoom = String(Math.max(0.75, Math.floor(z*avail/h*100)/100)); }
}
function setRaidTab(t) {
  raidTab = t;
  document.querySelectorAll('#raid .rtab').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === t)));
  $('#raidMainTab').hidden = t !== 'raids'; $('#raidForgeTab').hidden = t !== 'forge';
  if (t === 'forge') { forgeArmed = false; $('#forgeReveal').hidden = true; renderForge(); }
  fitPanel($('#raid .panel'));
}

