// ---------- raids ----------
// A raid boss is a Core (the boss seat, has HP) guarded by two Arms (foe seats with lives).
// While an arm is alive the core only takes half damage; every so often the core opens a weak point for double damage.
// Later phases regrow the arms and change the arena. Raids rotate: two are active, each window lasts three days.
const RAID_ORDER = ['leviathan', 'colossus', 'solarion', 'hydra'];
const RAID_WINDOW = 3*86400000, RAID_EPOCH = Date.UTC(2026, 9, 6);
const RAR_NAME = { r: 'Rare', e: 'Epic', l: 'Legendary', m: 'Mythic' };
const RAR_C = { r: '#4FA8FF', e: '#C59BFF', l: '#FFB23E', m: '#FF4F8B' };
const RAIDS = {
  leviathan: { n: 'Leviathan', full: 'Leviathan of the Neon Deep', col: '#3EE6FF', ar: 'classic', armSkill: 1.0,
    lore: 'It sleeps under Neon Harbor and wakes when the tide glows. Two tentacles guard its heart. Cut them down, then strike the core when it opens.',
    core: { c: '#4FFFC4', h: 'krakencrown', f: 'angry', s: 'neonwave', t: 'waves' }, arm: { n: 'Tentacle', c: '#9B4DFF', h: 'none', f: 'none', s: 'neonwave' },
    phases: [{ atk: ['wall', 'multi'], rate: 1.05, spd: 1.05, err: 1.18, hp: 15 },
             { atk: ['wall', 'multi', 'ghost', 'laser'], rate: 0.92, spd: 1.12, err: 1.1, hp: 15, regrow: 1, mut: 'wind', say: 'THE TIDE RISES' },
             { atk: ['multi', 'ghost', 'laser', 'freeze', 'smash'], rate: 0.8, spd: 1.18, err: 1.02, hp: 18, regrow: 1, mut: 'portal', say: 'FROM THE DEEP' }],
    loot: [['pt', 'leviathanslayer', 'r', 0.20], ['pb', 'tentacle', 'e', 0.08], ['h', 'krakencrown', 'l', 0.035], ['u', 'abyss', 'l', 0.025], ['b', 'pearl', 'm', 0.008]] },
  colossus: { n: 'Iron Colossus', full: 'The Iron Colossus', col: '#FF8A3D', ar: 'retro', armSkill: 1.05,
    lore: 'A war machine left running in the old foundry. Its fists hit hard and its reactor never cools. Break the fists, then hit the reactor while it vents.',
    core: { c: '#C9D6F2', h: 'mechhelm', f: 'robot', s: 'gold', t: 'bolt' }, arm: { n: 'Iron Fist', c: '#FF8A3D', h: 'none', f: 'none', s: 'tower' },
    phases: [{ atk: ['wall', 'smash'], rate: 1.0, spd: 1.0, err: 1.15, hp: 16 },
             { atk: ['wall', 'smash', 'shrink', 'laser'], rate: 0.9, spd: 1.08, err: 1.08, hp: 16, regrow: 1, mut: 'lava', say: 'OVERHEATING' },
             { atk: ['wall', 'smash', 'shrink', 'laser', 'multi'], rate: 0.78, spd: 1.15, err: 1.0, hp: 19, regrow: 1, mut: 'giant', say: 'MELTDOWN' }],
    loot: [['pt', 'colossusbreaker', 'r', 0.20], ['pg', 'foundry', 'e', 0.08], ['h', 'mechhelm', 'l', 0.035], ['u', 'forge', 'l', 0.025], ['b', 'core', 'm', 0.008]] },
  solarion: { n: 'Solarion', full: 'Solarion, the Dying Star', col: '#FFD84A', ar: 'hole', armSkill: 1.08,
    lore: 'A star that refuses to die, burning everything near it. Its flares orbit it like guards. Snuff them out and strike when the corona dims.',
    core: { c: '#FFC94A', h: 'sunhalo', f: 'laser', s: 'lava', t: 'fire' }, arm: { n: 'Solar Flare', c: '#FF5A4A', h: 'none', f: 'none', s: 'lava' },
    phases: [{ atk: ['laser', 'freeze'], rate: 1.1, spd: 1.02, err: 1.2, hp: 15 },
             { atk: ['laser', 'freeze', 'multi', 'ghost'], rate: 0.95, spd: 1.08, err: 1.12, hp: 16, regrow: 1, mut: 'dark', say: 'THE LIGHT FADES' },
             { atk: ['laser', 'multi', 'ghost', 'smash', 'mirror'], rate: 0.76, spd: 1.2, err: 1.0, hp: 19, regrow: 1, mut: 'slowmo', say: 'SUPERNOVA' }],
    loot: [['pt', 'starborn', 'r', 0.20], ['pb', 'eclipse', 'e', 0.08], ['h', 'sunhalo', 'l', 0.035], ['u', 'solarflare', 'l', 0.025], ['b', 'sun', 'm', 0.008]] },
  hydra: { n: 'Glitch Hydra', full: 'The Glitch Hydra', col: '#FF4F8B', ar: 'retro', armSkill: 1.12,
    lore: 'Three heads, one corrupted mind. Cut a head and it grows back glitchier. Delete both side heads, then crash the core when it buffers.',
    core: { c: '#7CFF3A', h: 'hydra', f: 'robot', s: 'matrix', t: 'pixel' }, arm: { n: 'Hydra Head', c: '#FF4F8B', h: 'none', f: 'laser', s: 'pixel' },
    phases: [{ atk: ['ghost', 'multi'], rate: 1.05, spd: 1.05, err: 1.18, hp: 15 },
             { atk: ['mirror', 'multi', 'ghost', 'shrink'], rate: 0.95, spd: 1.1, err: 1.1, hp: 16, regrow: 1, mut: 'invis', say: 'REBOOTING' },
             { atk: ['mirror', 'multi', 'ghost', 'shrink', 'laser', 'smash'], rate: 0.75, spd: 1.22, err: 1.0, hp: 19, regrow: 1, mut: 'upside', say: 'FATAL ERROR' }],
    loot: [['pt', 'hydrahacker', 'r', 0.20], ['pg', 'corrupted', 'e', 0.08], ['h', 'hydra', 'l', 0.035], ['u', 'datastream', 'l', 0.025], ['b', 'glitch', 'm', 0.008]] }
};
for (const [id, R] of Object.entries(RAIDS)) {
  PROF.pt.push([{ leviathan: 'leviathanslayer', colossus: 'colossusbreaker', solarion: 'starborn', hydra: 'hydrahacker' }[id],
    { leviathan: 'Leviathan Slayer', colossus: 'Colossus Breaker', solarion: 'Starborn', hydra: 'Hydra Hacker' }[id], 'r', 'raid:' + id]);
}
PROF.pb.push(['tentacle', 'Leviathan grip', 'e', 'raid:leviathan', 1], ['eclipse', 'Eclipse', 'e', 'raid:solarion', 1]);
PROF.pg.push(['foundry', 'Colossus foundry', 'e', 'raid:colossus', 1], ['corrupted', 'Corrupted void', 'e', 'raid:hydra', 1]);
function raidWindow(now) { return Math.floor(((now || Date.now()) - RAID_EPOCH) / RAID_WINDOW); }
function activeRaids() { const w = raidWindow(); return [RAID_ORDER[((w % 4) + 4) % 4], RAID_ORDER[(((w + 1) % 4) + 4) % 4]]; }
function nextRaid() { const w = raidWindow(); return RAID_ORDER[(((w + 2) % 4) + 4) % 4]; }
function raidEndsIn() { const end = RAID_EPOCH + (raidWindow() + 1)*RAID_WINDOW, ms = end - Date.now(), h = Math.floor(ms/3600000); return h >= 24 ? Math.floor(h/24) + 'd ' + (h % 24) + 'h' : h + 'h ' + Math.floor((ms % 3600000)/60000) + 'm'; }
let raidData = storeJSON('trepong-raid', {});
if (!raidData || typeof raidData !== 'object') raidData = {};
function raidStat(id) { const r = raidData[id] || (raidData[id] = { clears: 0, dry: 0, tries: 0 }); return r; }
function saveRaid() { store('trepong-raid', JSON.stringify(raidData)); }
function raidLuck(id) { return Math.min(3, 1 + 0.25*raidStat(id).dry); }
function lootKey(it) { return it[0] + ':' + it[1]; }
function ownsLoot(it) { return it[0].startsWith('p') ? ownsProf(it[0], it[1]) : ownsItem(it[0], it[1]); }
const LOOT_KIND = { pt: 'Title', pb: 'Card border', pg: 'Card background', h: 'Hat', u: 'Aura', b: 'Ball skin' };
// One roll per clear, rarest first. Luck multiplies every chance and resets when something drops.
function rollRaidLoot(id, mod) {
  const M = RAID_MODS[mod || 0], R = RAIDS[id], luck = raidLuck(id)*M.luck;
  const order = R.loot.filter(it => !it[4] || M.nm).sort((a, b) => a[3] - b[3]);
  for (const it of order) if (Math.random() < it[3]*luck) return it;
  return null;
}
// ----- starting a raid -----
let raidSel = null, raidPlayers = 1, lobbyRaid = null, raidArms = null, raidMod = Math.max(0, Math.min(2, +store('trepong-raidmod') || 0)), lobbyRaidMod = 0, raidModPlaying = 0;
function startRaidMatch(id, np) {
  const R = RAIDS[id], P0 = R.phases[0];
  resetFx();
  if (mode === 'practice') { while (bots.length < np) { const i = bots.length; bots.push(true); names.push('Bot ' + i); looks.push(randomLook(looks.map(l => l.c))); } }
  bots = bots.slice(0, np); names = names.slice(0, np); looks = looks.slice(0, np);
  if (mode === 'host') { bots = hostSeats.map((p, i) => i !== 0 && !p).slice(0, np); names = seatNames().slice(0, np); looks = seatLooks().slice(0, np); }
  while (bots.length < np) { bots.push(true); names.push('Bot ' + bots.length); looks.push(randomLook(looks.map(l => l.c))); }
  const heroes = Array.from({ length: np }, (_, i) => mode === 'host' && i > 0 && hostSeats[i] ? guestHero(i) : heroOf(i));
  const heroLv = heroes.map((h, i) => i === 0 ? heroLevel(h) : mode === 'host' && hostSeats[i] ? guestCard(i).hl : 3);
  const heroVar = heroes.map((h, i) => i === 0 ? heroVariant(h) : mode === 'host' && hostSeats[i] ? guestCard(i).hv : 'std');
  const armLook = validLook({ c: R.arm.c, h: R.arm.h, f: R.arm.f, s: R.arm.s, t: 'std' });
  raidArms = [];
  for (let k = 0; k < 2; k++) { bots[np + k] = true; names[np + k] = R.arm.n + (k ? ' B' : ' A'); looks[np + k] = armLook; botSkill[np + k] = R.armSkill; raidArms.push([np + k, names[np + k], armLook]); }
  const MOD = RAID_MODS[raidModPlaying = (mode === 'host' ? lobbyRaidMod : raidMod) || 0];
  const n = np + 3, livesArr = Array.from({ length: n }, (_, i) => i < np ? BOSS_LIVES + 2 : i < np + 2 ? MOD.armL : 1), hpMul = 1 - 0.06*(np - 1);
  const coreCfg = (ph, k) => ({ n: R.full, c: R.core.c, h: R.core.h, f: R.core.f, s: R.core.s, t: R.core.t, atk: ph.atk, rate: ph.rate*MOD.rate, spd: ph.spd*MOD.spd, err: ph.err*MOD.err, hpAbs: Math.round(ph.hp*hpMul), regrow: ph.regrow, mut: ph.mut, say: ph.say, cards: ['wide'], ar: R.ar, hp: 1 });
  st = newGame(n, BOSS_LIVES, null, { boss: true, raid: id, mut: MOD.nm ? pick(['wind', 'dark', 'giant', 'storm']) : null, bcfg: coreCfg(P0), bossHp: Math.round(P0.hp*hpMul), bossQ: R.phases.slice(1).map(p => coreCfg(p)), foes: [np, np + 1], livesArr,
    ar: R.ar, heroes: heroes.concat(['none', 'none', 'none']), heroLv, heroVar, ffs: !hardcore });
  st.raidMod = raidModPlaying; st.boss.heal = MOD.heal; st.boss.armL = MOD.armL;
  botCache = []; mySeat = 0; lastSmashN = []; lastHeroN = [];
  addBossSeat();
  raidStat(id).tries++; saveRaid();
  if (mode === 'host') {
    hostPhase = 'play';
    net.presence({ phase: 'play', names, looks, seats: hostSeats, n: lobbyN, fmt: lobbyFmt, raid: id, rmod: raidModPlaying, series: null, g: packState(st) }).catch(() => {});
  }
  showScreen(null); requestWake();
  banner = { text: R.n.toUpperCase() + (MOD.nm ? ' · NIGHTMARE' : raidModPlaying ? ' · HARD' : ''), sub: 'Destroy the ' + R.arm.n.toLowerCase() + 's to expose the core', col: R.col, t: 0 };
  tone(70, 1.4, 'sawtooth', 0.07, 0.5); tone(55, 1.6, 'square', 0.04, 0.6, 0.3);
}
// ----- end of a raid: everyone rolls their own loot -----
let raidRes = null;
function raidResolve() {
  if (!st || !st.raid) return null;
  const key = 'R' + st.mid; if (raidRes && raidRes.key === key) return raidRes;
  const id = st.raid, R = RAIDS[id], won = st.winner === -2;
  const res = { key, id, won, drop: null, dup: false, refund: 0, chest: null, coins: 0 };
  if (mySeat < 0) { raidRes = res; return res; }
  const S = raidStat(id);
  if (won) {
    S.clears++;
    const mod = st.raidMod || 0, M = RAID_MODS[mod];
    const it = rollRaidLoot(id, mod);
    res.coins = Math.round((150 + 10*Math.min(10, S.clears))*(1 + 0.5*mod));
    res.shards = M.shards; stashAdd('shard', M.shards); res.mod = mod;
    if (mod === 2) track('nightmareClears');
    if (it) {
      res.drop = it;
      if (ownsLoot(it)) { res.dup = true; stashAdd(lootKey(it), 1); }
      else { owned.add(lootKey(it)); saveWallet(); }
      S.dry = 0;
    } else S.dry++;
    if (Math.random() < 0.25) res.chest = grantReward(['chest', 'gold']);
    track('raidClears');
    addBpXp(60);
  } else res.coins = 25;
  saveRaid();
  raidRes = res; return res;
}
function raidOverUI() {
  const r = raidRes; if (!r) return;
  const R = RAIDS[r.id], el = $('#overWho');
  el.textContent = r.won ? R.n + ' defeated!' : R.n + ' wiped your team';
  el.style.color = r.won ? R.col : '#FF5A4A';
  $('#overEyebrow').textContent = 'Raid · ' + R.full;
  const box = $('#overRewards'); box.textContent = ''; box.hidden = !r.won;
  if (r.won) {
    const d = document.createElement('div'); d.className = 'lootreveal ' + (r.drop ? r.drop[2] : 'none');
    if (r.drop) {
      const cv = document.createElement('canvas'); cv.width = 176; cv.height = 120; cv.className = 'lootcv'; cv.dataset.k = r.drop[0]; cv.dataset.id = r.drop[1];
      d.append(cv, Object.assign(document.createElement('span'), { className: 'lr', textContent: RAR_NAME[r.drop[2]] + ' ' + LOOT_KIND[r.drop[0]] }),
        Object.assign(document.createElement('b'), { textContent: lootName(r.drop) }),
        Object.assign(document.createElement('small'), { textContent: r.dup ? 'Duplicate! The copy went to your Forge stash (' + FORGE_PTS[r.drop[2]] + ' forge points).' : 'New raid loot! It is yours.' }));
      if (r.drop[2] === 'm' || r.drop[2] === 'l') { setTimeout(() => startVictory(r.drop[2] === 'm' ? 'supernova' : 'fireworks'), 60); buzz([60, 40, 60, 40, 200]); }
    } else d.append(Object.assign(document.createElement('b'), { textContent: 'No loot this time' }), Object.assign(document.createElement('small'), { textContent: 'Luck grows: next clear has +' + Math.round((raidLuck(r.id) - 1)*100) + '% better drop chances.' }));
    box.append(d);
    box.append(Object.assign(document.createElement('div'), { className: 'orw cp', textContent: '⚒ +' + r.shards + ' raid shard' + (r.shards > 1 ? 's' : '') + ' for the Forge' + (r.mod ? ' (' + RAID_MODS[r.mod].n + ')' : '') }));
    if (r.chest) box.append(Object.assign(document.createElement('div'), { className: 'orw', textContent: '🎁 ' + r.chest }));
  }
  $('#btnNext').hidden = true; $('#overBoard').hidden = true;
  if (mode === 'practice') { $('#btnAgain').hidden = false; $('#btnAgain').textContent = 'Raid again'; $('#btnOverMenu').textContent = 'To the raids'; }
}
function drawLootCv(cv, k, id) {
  if (k === 'b') { const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); drawBallSkinX(c, id, cv.width/2, cv.height/2, cv.height*0.26, clock, Math.cos(clock)*2, Math.sin(clock)*2); return; }
  if (k === 'u') { lookCanvas(cv, { ...myLook, u: id, h: 'none' }, cv.width/40, 14); return; }
  if (k === 'h') { lookCanvas(cv, { ...myLook, h: id, f: 'none' }, cv.width/40, 9); return; }
  if (k === 'pt') { const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height); c.fillStyle = '#FFD84A'; c.textAlign = 'center'; c.textBaseline = 'middle'; const txt = '“' + lootName([k, id]) + '”'; let fs = Math.round(cv.height*0.24); c.font = '700 ' + fs + 'px "Chakra Petch", sans-serif'; const tw = c.measureText(txt).width; if (tw > cv.width*0.92) { fs = Math.floor(fs*cv.width*0.92/tw); c.font = '700 ' + fs + 'px "Chakra Petch", sans-serif'; } c.fillText(txt, cv.width/2, cv.height/2); return; }
  drawProfChip(cv, k, id, clock);
}
// ----- raid screen -----
function openRaids(id) {
  mode = 'menu'; st = null; series = null; special = null; resetFx(); mySeat = 0;
  const act = activeRaids();
  raidSel = id || raidSel || act[0];
  showScreen('raid'); renderRaids(); setRaidTab(raidTab || 'raids');
}
function renderRaids() {
  { const f = forgeData(); $('#forgeBadge').hidden = !(f.chests || f.pts >= FORGE_GOAL); }
  syncCoinUI(); $('#raidCoins').textContent = fmt(coins);
  const act = activeRaids(), nx = nextRaid();
  const list = $('#raidList'); list.textContent = '';
  for (const id of RAID_ORDER) {
    const R = RAIDS[id], on = act.includes(id);
    const b = document.createElement('button'); b.type = 'button'; b.className = 'rcard' + (on ? ' on' : ''); b.style.setProperty('--rc', R.col);
    b.setAttribute('aria-pressed', String(id === raidSel));
    const cv = document.createElement('canvas'); cv.width = 320; cv.height = 180; cv.dataset.raid = id; cv.dataset.dim = on ? '' : '1';
    const tag = document.createElement('span'); tag.className = 'rtag'; tag.textContent = on ? 'ACTIVE · ' + raidEndsIn() : id === nx ? 'NEXT UP' : 'RESTING';
    const nm = document.createElement('b'); nm.textContent = R.n;
    const own = R.loot.filter(ownsLoot).length;
    const sm = document.createElement('small'); sm.textContent = 'Loot ' + own + '/' + R.loot.length + ' · cleared ' + raidStat(id).clears + '×';
    b.append(cv, tag, nm, sm);
    b.addEventListener('click', () => { raidSel = id; renderRaids(); });
    list.append(b);
  }
  const R = RAIDS[raidSel], on = act.includes(raidSel), S = raidStat(raidSel), M = RAID_MODS[raidMod], luck = raidLuck(raidSel)*M.luck;
  setSeg($('#raidModSeg'), raidMod, 'm'); $('#raidModNote').textContent = M.desc; $('#raidModNote').style.color = M.col;
  $('#raidName').textContent = R.full; $('#raidName').style.color = R.col;
  $('#raidLore').textContent = R.lore;
  $('#raidPhases').textContent = R.phases.length + ' phases · ' + R.arm.n + 's regrow each phase · arena changes: ' + R.phases.slice(1).map(p => MUTATORS[p.mut][0]).join(' → ');
  $('#raidLuck').textContent = (raidMod ? M.n + ': chances ×' + M.luck + ' · ' : '') + (raidLuck(raidSel) > 1 ? '🍀 Luck ×' + raidLuck(raidSel).toFixed(2) + ' (' + S.dry + ' clear' + (S.dry === 1 ? '' : 's') + ' without a drop)' : '🍀 Luck ×1.00 · every clear without a drop raises it');
  const tb = $('#raidLoot'); tb.textContent = '';
  let any = 0;
  for (const it of R.loot.slice().sort((a, b) => b[3] - a[3])) {
    const row = document.createElement('div'); row.className = 'lrow ' + it[2] + (ownsLoot(it) ? ' owned' : '');
    const cv = document.createElement('canvas'); cv.width = 88; cv.height = 60; cv.className = 'lootcv'; cv.dataset.k = it[0]; cv.dataset.id = it[1];
    const mid = document.createElement('div');
    mid.append(Object.assign(document.createElement('b'), { textContent: lootName(it) }), Object.assign(document.createElement('small'), { textContent: LOOT_KIND[it[0]] + (it[4] ? ' · Nightmare only' : '') + (ownsLoot(it) ? ' · owned ✓' : '') }));
    if (it[4]) row.classList.add('nm');
    const rr2 = document.createElement('div'); rr2.className = 'lch';
    const pct = it[4] && !M.nm ? 0 : it[3]*luck*100; any += pct;
    rr2.append(Object.assign(document.createElement('span'), { className: 'lr', textContent: RAR_NAME[it[2]] }), Object.assign(document.createElement('b'), { textContent: (pct < 1 ? pct.toFixed(2) : pct.toFixed(1)) + '%' }));
    row.append(cv, mid, rr2); tb.append(row);
  }
  $('#raidLootNote').textContent = 'One roll per clear, rarest item first. Chance of any loot right now: ' + Math.min(100, any).toFixed(1) + '%. Every clear also gives coins, ' + M.shards + ' raid shard' + (M.shards > 1 ? 's' : '') + ' and a 25% chance of a gold chest. Duplicates go to the Forge.';
  setSeg($('#raidTeam'), raidPlayers, 'p');
  const go = $('#btnRaidGo'); go.disabled = !on; go.textContent = on ? 'Start raid' + (raidMod ? ' · ' + M.n : '') : 'Not active right now'; go.style.background = go.style.borderColor = on ? R.col : '';
  $('#raidNote').textContent = on ? 'With friends: create a room, pick Raid and the host\'s selected raid is played. Up to 4 players.' : 'This raid returns when the rotation brings it back. Active now: ' + act.map(a => RAIDS[a].n).join(' and ') + '.';
  if (raidTab === "raids") fitPanel($("#raid .panel"));
}
function drawRaidScreen() {
  $('#raidList').querySelectorAll('canvas').forEach(cv => { const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); drawRaidPortrait(c, cv.dataset.raid, cv.width, cv.height, clock, cv.dataset.dim ? { dim: true } : undefined); });
  const big = $('#raidArt'); if (big) { const c = big.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); drawRaidPortrait(c, raidSel, big.width, big.height, clock, activeRaids().includes(raidSel) ? undefined : { dim: true }); }
  $('#raidLoot').querySelectorAll('canvas').forEach(cv => drawLootCv(cv, cv.dataset.k, cv.dataset.id));
}
function drawMenuRaid() {
  const cv = $('#menuRaid'); if (!cv) return;
  const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0);
  drawRaidPortrait(c, activeRaids()[0], cv.width, cv.height, clock);
  const g = c.createLinearGradient(0, 0, cv.width, 0); g.addColorStop(0, 'rgba(12,10,28,0.85)'); g.addColorStop(0.6, 'rgba(12,10,28,0.15)'); g.addColorStop(1, 'rgba(12,10,28,0)');
  c.fillStyle = g; c.fillRect(0, 0, cv.width, cv.height);
}
function raidPhaseFx() {
  if (!st || !st.raid || !st.boss) return;
  const R = RAIDS[st.raid], ph = R.phases[st.boss.phase || 0] || {};
  banner = { text: (ph.say || 'PHASE ' + ((st.boss.phase || 0) + 1)) + '!', sub: (ph.regrow ? 'The ' + R.arm.n.toLowerCase() + 's grew back' : '') + (ph.mut ? ' · ' + MUTATORS[ph.mut][0] : ''), col: R.col, t: 0 };
  shake = 1.2; tone(82, 1.2, 'sawtooth', 0.08, 0.5); tone(61, 1.4, 'square', 0.05, 0.6, 0.25); buzz([50, 40, 120]);
}
const RAID_SRC = {};
for (const [id, R] of Object.entries(RAIDS)) for (const it of R.loot) RAID_SRC[lootKey(it)] = R.n;

