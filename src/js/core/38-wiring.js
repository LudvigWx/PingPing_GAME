// ---------- wiring ----------
$('#name').value = store('trepong-name') || '';
$('#name').addEventListener('input', () => store('trepong-name', cleanName($('#name').value)));
const savedN = +store('trepong-n'); if (savedN === 2 || savedN === 3) menuN = savedN;
if (['snabb', 'boss', 'torn', 'cup'].includes(store('trepong-fmt'))) menuFmt = store('trepong-fmt');
if (ARENAS[store('trepong-arena')]) menuArena = store('trepong-arena');
syncArenaSeg();
menuChaos = store('trepong-chaos') === '1'; setSeg($('#chaosSeg'), menuChaos ? 1 : 0, 'c');
if (HEROES[store('trepong-hero')]) myHero = store('trepong-hero');
function syncHeroSeg() {
  const seg = $('#heroSeg'); seg.textContent = '';
  for (const [id, h] of Object.entries(HEROES)) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.h = id; b.textContent = h[0];
    b.setAttribute('aria-pressed', String(id === myHero));
    b.addEventListener('click', () => { myHero = id; store('trepong-hero', id); heroSelT = 0.0001; audioOn(); if (id !== 'none') { tone(220, 0.25, 'sawtooth', 0.05, 2); tone(660, 0.3, 'triangle', 0.05, 1.5, 0.08); } syncHeroSeg(); });
    seg.append(b);
  }
  $('#heroNote').textContent = HEROES[myHero][1] + (myHero !== 'none' ? '. Recharges in ' + HERO_CD + ' seconds.' : '.');
  $('#heroName').textContent = HEROES[myHero][0]; $('#heroName').style.color = HERO_INFO[myHero].col;
  $('#heroTitle').textContent = HERO_INFO[myHero].title;
  const none = myHero === 'none', L = heroLevel(myHero);
  $('#heroLv').textContent = none ? '' : 'LEVEL ' + L + (L >= 10 ? ' · MAX' : '');
  $('#heroXp').style.width = (none ? 0 : heroXpFrac(myHero)*100) + '%';
  $('.hlv').hidden = none;
  if (!none) $('#heroNote').textContent = HEROES[myHero][1] + ' (+' + Math.round(6*(L - 1)) + '% power). Recharges in ' + (HERO_CD - 0.6*(L - 1)).toFixed(1) + ' seconds.';
  const vs = $('#heroVar'); vs.textContent = ''; vs.hidden = none;
  for (const [v, n, need] of HERO_VARIANTS) {
    const b = document.createElement('button'); b.type = 'button'; b.textContent = n;
    const lock = L < need; if (lock) { const s = document.createElement('small'); s.textContent = 'Level ' + need; b.append(s); b.disabled = true; }
    b.setAttribute('aria-pressed', String(heroVariant(myHero) === v));
    b.addEventListener('click', () => { store('trepong-hv-' + myHero, v); heroSelT = 0.0001; syncHeroSeg(); pushProfile(); });
    vs.append(b);
  }
}
syncHeroSeg();
function syncPracticeLabel() { $('#btnPractice').textContent = menuFmt === 'torn' ? 'To the Tower' : menuFmt === 'cup' ? 'To the tournament' : 'Practice vs bots'; $('#btnHost').disabled = !roomNS || menuFmt === 'cup'; }
syncPracticeLabel();
$('#chaosSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; menuChaos = b.dataset.c === '1'; store('trepong-chaos', menuChaos ? '1' : '0'); setSeg($('#chaosSeg'), menuChaos ? 1 : 0, 'c'); });
$('#lobbyChaos').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || mode !== 'host') return; lobbyChaos = b.dataset.c === '1'; setSeg($('#lobbyChaos'), lobbyChaos ? 1 : 0, 'c'); hostSync(); });
$('#towerSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; towerPlayers = +b.dataset.t; setSeg($('#towerSeg'), towerPlayers, 't'); });
$('#btnTowerGo').addEventListener('click', () => { audioOn(); startPractice(); });
$('#btnWeekly').addEventListener('click', () => { audioOn(); startPractice('weekly'); });
$('#btnCupBack').addEventListener('click', () => showScreen('menu'));
$('#btnCupGo').addEventListener('click', () => { if (!cup || cup.done) { newCup(cupSize); renderCup(); return; } startCupMatch(); });
$('#cupSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; cupSize = +b.dataset.s; newCup(cupSize); renderCup(); });
initDB();
try { if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) $('#keysNote').hidden = false; } catch (e) {}
$('#btnTowerBack').addEventListener('click', () => showScreen('menu'));
$('#heroBtn').addEventListener('click', doHero);
$('#btnProfile').addEventListener('click', () => { audioOn(); openProfile(); });
$('#btnProfBack').addEventListener('click', () => { profPreview = null; showScreen('menu'); });
$('#btnProfSave').addEventListener('click', () => {
  // keep everything you own from the preview, drop what still has to be bought
  for (const k of ['pb', 'pg', 'pt', 'pe']) if (profPreview && ownsProf(k, profPreview[k])) myProf[k] = profPreview[k];
  myProf = validProf(myProf); saveProf();
  const unsaved = profPreview && ['pb', 'pg', 'pt', 'pe'].some(k => profPreview[k] !== myProf[k]);
  tone(660, 0.08, 'sine', 0.05); tone(990, 0.12, 'sine', 0.05, 1, 0.08); buzz([20, 30, 20]);
  toast(unsaved ? 'Card saved (items you haven\'t bought yet were left out)' : 'Profile card saved!');
  profPreview = { ...myProf }; profBuy = null; buildProfGrid(); syncProf();
});
$('#btnProfBuy').addEventListener('click', buyProf);
$('#btnChests').addEventListener('click', () => { audioOn(); openChestScreen(); });
$('#btnChestBack').addEventListener('click', () => { if (chestAnim && chestAnim.phase !== 'reveal') return; chestAnim = null; showScreen('menu'); });
$('#btnFreeChest').addEventListener('click', () => startChest('wood', true));
for (const t of Object.keys(CHESTS)) $('#buy_' + t).addEventListener('click', () => startChest(t, false));
$('#btnUseNow').addEventListener('click', useChestItem);
$('#btnCardClose').addEventListener('click', () => { $('#cardView').hidden = true; viewCard = null; });
setSeg($('#voiceSeg'), voicesOn ? 1 : 0, 'v');
$('#voiceSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; voicesOn = b.dataset.v === '1'; store('trepong-voices', voicesOn ? '1' : '0'); setSeg($('#voiceSeg'), voicesOn ? 1 : 0, 'v'); if (voicesOn && myHero !== 'none') heroSay(myHero, 'use'); });
syncChestBadge();


// ----- arena builder wiring -----
$('#btnArenas').addEventListener('click', () => { audioOn(); openArenas(); });
syncDailyBadge();
$('#btnDailyGo').addEventListener('click', () => { audioOn(); playDaily(); });
$('#btnArenasBack').addEventListener('click', () => showScreen('menu'));
$('#btnNewArena').addEventListener('click', () => openBuilder(null, null));
$('#btnLoadArena').addEventListener('click', () => { $('#loadBox').hidden = false; $('#loadMsg').textContent = ''; $('#loadCode').focus(); });
$('#btnLoadClose').addEventListener('click', () => { $('#loadBox').hidden = true; });
$('#btnLoadGo').addEventListener('click', () => { try { const L = parseLevelCode($('#loadCode').value); myArenas.unshift(L); saveArenas(); $('#loadBox').hidden = true; $('#loadCode').value = ''; renderArenas(); toast('Loaded "' + L.name + '"!'); } catch (e) { $('#loadMsg').textContent = e.message; } });
$('#btnShareClose').addEventListener('click', () => { $('#shareBox').hidden = true; });
$('#btnShareCopy').addEventListener('click', () => { const t = $('#shareUrl').value; try { navigator.clipboard.writeText(t).then(() => toast('Link copied!'), () => { $('#shareUrl').select(); }); } catch (e) { $('#shareUrl').select(); } });
$('#btnBuildBack').addEventListener('click', () => { edSave(true); openArenas(); });
$('#btnLvSave').addEventListener('click', () => edSave(false));
$('#btnLvTest').addEventListener('click', () => { audioOn(); edSave(true); playLevelPractice(ed.L, true); });
$('#btnLvUndo').addEventListener('click', edUndo);
$('#btnLvRedo').addEventListener('click', edRedo);
$('#btnLvClear').addEventListener('click', () => { if (!ed.L.objs.length) return; edSnapshot(); ed.L.objs = []; ed.sel = -1; renderBuilder(); toast('Cleared. Undo brings it back.'); });
$('#lvName').addEventListener('input', e => { if (ed) ed.L.name = e.target.value.slice(0, 24) || 'My arena'; });
document.querySelectorAll('#build .btab').forEach(b => b.addEventListener('click', () => { ed.tab = b.dataset.t; renderBuilder(); }));
$('#buildCv').addEventListener('pointerdown', e => { e.preventDefault(); edPointer('down', e); });
$('#buildCv').addEventListener('pointermove', e => edPointer('move', e));
addEventListener('pointerup', e => { if (ed && curScreen === 'build') edPointer('up', e); });
const lvSeg = (id, key, fn) => $(id).addEventListener('click', e => { const b = e.target.closest('button'); if (!b || !ed) return; edSnapshot(); fn(b.dataset[key]); renderBuilder(); });
lvSeg('#lvSym', 's', v => { ed.sym = v; ed.undo.pop(); });
lvSeg('#lvSnap', 'g', v => { ed.snap = v === '1'; ed.undo.pop(); });
lvSeg('#lvSides', 'n', v => { ed.L.sides = +v; edArena(); ed.L.objs = ed.L.objs.filter(o => edInside(o.x, o.y, 0.05)); });
lvSeg('#lvAr', 'a', v => { ed.L.ar = v; });
lvSeg('#lvGoal', 'g', v => { ed.L.rules.goal = v; ed.L.rules.goalV = v === 'stars' ? 5 : v === 'survive' ? 60 : 5; });
lvSeg('#lvServe', 'b', v => { ed.L.rules.serve = +v; });
lvSeg('#lvPu', 'p', v => { ed.L.rules.pu = v; });
lvSeg('#lvGrav', 'v', v => { ed.L.rules.grav = v; });
document.querySelectorAll('#build .stepper button').forEach(b => b.addEventListener('click', () => {
  if (!ed) return; const R = ed.L.rules, d = +b.dataset.d; edSnapshot();
  const k = b.dataset.k;
  if (k === 'lvLives') R.lives = clamp(R.lives + d, 1, 9);
  if (k === 'lvSpeed') R.speed = clamp(Math.round((R.speed + d*0.1)*10)/10, 0.6, 1.8);
  if (k === 'lvSize') R.size = clamp(Math.round((R.size + d*0.2)*10)/10, 0.6, 2.2);
  if (k === 'lvPaddle') R.paddle = clamp(Math.round((R.paddle + d*0.1)*10)/10, 0.5, 1.8);
  if (k === 'lvBots') R.bots = clamp(Math.round((R.bots + d*0.3)*10)/10, 0.6, 1.8);
  if (k === 'lvGoal') R.goalV = R.goal === 'stars' ? clamp(R.goalV + d, 1, 30) : clamp(R.goalV + d*15, 15, 300);
  renderBuilder();
}));
addEventListener('keydown', e => { if (curScreen !== 'build' || !ed || e.target.tagName === 'INPUT') return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? edRedo() : edUndo(); } else if (e.key === 'Delete' || e.key === 'Backspace') { if (ed.sel >= 0) { edSnapshot(); ed.L.objs.splice(ed.sel, 1); ed.sel = -1; renderBuilder(); } } });
// opening a shared arena link: ?arena=CODE
$('#btnLevel').addEventListener('click', () => { audioOn(); openLevels(collClaimable() ? 'coll' : lvTab); });
$('#btnLvBack').addEventListener('click', () => showScreen('menu'));
document.querySelectorAll('#levels .ltab').forEach(b => b.addEventListener('click', () => { lvTab = b.dataset.t; presArmed = false; renderLevels(); }));
$('#btnPrestige').addEventListener('click', () => { audioOn(); doPrestige(); });
$('#lvFx').addEventListener('click', e => { if (e.target.closest('button')) return; closeLvFx(); });
$('#btnLvLater').addEventListener('click', () => { lvFx.t = 9; nextLvFx(); toast('Prestige waits for you in Progression → Prestige.'); });
$('#btnLvPres').addEventListener('click', () => { nextLvFx(); presArmed = true; doPrestige(); });
setTimeout(() => { syncLevelBar(); if (curScreen === 'menu') { lvCheck(); if (!lvFx) loginCheck(); } }, 1200);
$('#btnLoginClaim').addEventListener('click', () => { audioOn(); claimLogin(); });
$('#btnRedeem').addEventListener('click', () => { audioOn(); redeemShow = null; openRedeem(); });
$('#btnRedeemBack').addEventListener('click', () => { redeemShow = null; showScreen('menu'); });
$('#btnRedeemGo').addEventListener('click', () => { audioOn(); redeemCode(); });
$('#redeemIn').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); audioOn(); redeemCode(); } });
try { const q = new URLSearchParams(location.search).get('code'); if (q) { setTimeout(() => openRedeem(normCode(q)), 400); history.replaceState(null, '', location.pathname); } } catch (e) {}
try { const q = new URLSearchParams(location.search).get('arena'); if (q) { const L = parseLevelCode('TPA1-' + q); myArenas.unshift(L); saveArenas(); setTimeout(() => { openArenas(); toast('Arena "' + L.name + '" added to your arenas!'); }, 400); history.replaceState(null, '', location.pathname); } } catch (e) {}
// ----- raids wiring -----
$('#btnRaid').addEventListener('click', () => { audioOn(); store('trepong-raidnew', '1'); $('#raidNew').hidden = true; openRaids(); });
if (store('trepong-raidnew') === '1') $('#raidNew').hidden = true;
$('#btnRaidBack').addEventListener('click', () => showScreen('menu'));
document.querySelectorAll('#raid .rtab').forEach(b => b.addEventListener('click', () => setRaidTab(b.dataset.t)));
$('#raidModSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; raidMod = +b.dataset.m; store('trepong-raidmod', String(raidMod)); renderRaids(); });
$('#btnForgeMake').addEventListener('click', forgeMake);
$('#btnForgeOpen').addEventListener('click', forgeOpen);
$('#btnSacrifice').addEventListener('click', sacrificeSelected);
$('#btnSelAll').addEventListener('click', () => { const f = forgeData(); forgeSel = {}; for (const k in f.stash) forgeSel[k] = f.stash[k]; forgeArmed = false; renderForge(); });
$('#raidTeam').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; raidPlayers = +b.dataset.p; setSeg($('#raidTeam'), raidPlayers, 'p'); });
$('#btnRaidGo').addEventListener('click', () => { if (!activeRaids().includes(raidSel)) return; audioOn(); lobbyRaid = raidSel; startPractice('raid'); });
// ----- adventure & battle pass wiring -----
$('#btnAdv').addEventListener('click', () => { audioOn(); store('trepong-advnew', '1'); $('#advNew').hidden = true; openAdv(); });
if (store('trepong-advnew') === '1') $('#advNew').hidden = true;
$('#btnAdvBack').addEventListener('click', () => showScreen('menu'));
$('#btnAdvGo').addEventListener('click', () => { audioOn(); advPlay(); });
$('#btnBuyLife').addEventListener('click', advBuyLife);
$('#btnAdvRevive').addEventListener('click', () => { audioOn(); advRevive(advSelW, true); });
$('#btnAdvCp').addEventListener('click', () => advCheckpoint(advSelW));
$('#story').addEventListener('click', e => { if (e.target.closest('#btnStorySkip')) return; storyNext(); });
$('#btnStorySkip').addEventListener('click', () => { if (!story) return; const d = story.done; story = null; d(); });
$('#btnBp').addEventListener('click', () => { audioOn(); openBp(); });
$('#btnBpBack').addEventListener('click', () => { showScreen('menu'); syncBpBadge(); });
$('#btnBpPrem').addEventListener('click', buyPremium);
$('#btnBpAll').addEventListener('click', () => { const T = bpTier(); for (let i = 0; i < T; i++) { if (!bp.cf.includes(i)) { bp.cf.push(i); grantReward(BP_TIERS[i][0]); } if (bp.prem && !bp.cp.includes(i)) { bp.cp.push(i); grantReward(BP_TIERS[i][1]); } } saveBp(); sfx.coin(); toast('All rewards claimed!'); renderBp(); });
syncBpBadge();
// ----- install as app (web version only) -----
const TI = window.TrepongInstall || null;
function syncInstall() {
  if (!TI) return;
  $('#appBox').hidden = false;
  const b = $('#btnInstall'), n = $('#appNote');
  $('#btnInstallTop').hidden = !(TI.canPrompt && !TI.installed);
  if (TI.installed) { b.hidden = true; n.textContent = 'You are playing the installed app.'; }
  else if (TI.canPrompt) { b.hidden = false; n.textContent = 'Put Trepong on your home screen or desktop. It opens fullscreen without the browser bar and works offline against bots.'; }
  else if (TI.ios) { b.hidden = true; n.textContent = 'On iPhone or iPad: open the game in Safari, tap the Share button, then "Add to Home Screen".'; }
  else if (/SamsungBrowser/i.test(navigator.userAgent)) { b.hidden = true; n.textContent = 'In Samsung Internet: tap the download icon in the address bar if you see one. Otherwise tap the menu (☰) at the bottom, then "Add page to" → "Home screen". Already installed? Open Trepong from your apps.'; }
  else if (/Android/i.test(navigator.userAgent)) { b.hidden = true; n.textContent = 'In Chrome: tap the menu (⋮) at the top right, then "Install app" or "Add to Home screen". The install button can also show up here after you have played for a little while.'; }
  else { b.hidden = true; n.textContent = 'In Chrome or Edge, open the browser menu and pick "Install Trepong". Already installed? Open it from your apps.'; }
}
if (TI) {
  TI.onChange(syncInstall); syncInstall();
  const doInstall = async () => { audioOn(); if (await TI.prompt()) toast('Trepong installed! Find it among your apps.'); syncInstall(); };
  $('#btnInstall').addEventListener('click', doInstall); $('#btnInstallTop').addEventListener('click', doInstall);
}
// ----- friendly fire / hardcore -----
let hardcore = store('trepong-hardcore') === '1';
function syncHardcore() { setSeg($('#hcSeg'), hardcore ? 1 : 0, 'h'); $('#hcNote').textContent = hardcore ? 'Hardcore: in boss fights your teammates CAN knock you out. When you host, this applies to everyone in your room.' : 'Team shield: in boss fights a teammate\'s shot bounces off your goal, so you can\'t knock each other out. When you host, this applies to everyone in your room.'; }
$('#hcSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; hardcore = b.dataset.h === '1'; store('trepong-hardcore', hardcore ? '1' : '0'); syncHardcore(); });
syncHardcore();
// ----- save code -----
function exportSave() {
  const data = {};
  try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('trepong-') && !['trepong-mic', 'trepong-spk'].includes(k)) data[k] = localStorage.getItem(k); } } catch (e) {}
  const json = JSON.stringify({ v: 1, t: Date.now(), d: data });
  return 'TREPONG1-' + btoa(unescape(encodeURIComponent(json)));
}
function parseSave(code) {
  code = String(code || '').trim().replace(/\s+/g, '');
  if (!code.startsWith('TREPONG1-')) throw new Error('The code should start with TREPONG1-.');
  let obj; try { obj = JSON.parse(decodeURIComponent(escape(atob(code.slice(9))))); } catch (e) { throw new Error('The code is broken. Copy the whole code and try again.'); }
  if (!obj || obj.v !== 1 || typeof obj.d !== 'object') throw new Error('This is not a Trepong save code.');
  const keys = Object.keys(obj.d).filter(k => k.startsWith('trepong-') && typeof obj.d[k] === 'string');
  if (!keys.length) throw new Error('The code contains no progress.');
  return { obj, keys };
}
function importSave(code) {
  const { obj, keys } = parseSave(code);
  try { const old = []; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('trepong-') && !['trepong-mic', 'trepong-spk'].includes(k)) old.push(k); } old.forEach(k => localStorage.removeItem(k)); keys.forEach(k => localStorage.setItem(k, obj.d[k])); }
  catch (e) { throw new Error('The browser won\'t let the game save here (incognito mode?).'); }
  return keys.length;
}
let saveMode = null, importArmed = false;
function openSaveBox(m) {
  saveMode = m; importArmed = false; $('#saveBox').hidden = false; $('#saveMsg').textContent = '';
  const ta = $('#saveCode');
  if (m === 'export') { ta.value = exportSave(); ta.readOnly = true; $('#btnSaveAct').textContent = 'Copy'; $('#saveMsg').textContent = 'Paste the code under Import on the other device.'; ta.focus(); ta.select(); }
  else { ta.value = ''; ta.readOnly = false; ta.placeholder = 'Paste your save code here'; $('#btnSaveAct').textContent = 'Import'; ta.focus(); }
}
$('#btnExport').addEventListener('click', () => openSaveBox('export'));
$('#btnImport').addEventListener('click', () => openSaveBox('import'));
$('#btnSaveClose').addEventListener('click', () => { $('#saveBox').hidden = true; saveMode = null; });
$('#btnSaveAct').addEventListener('click', () => {
  const ta = $('#saveCode'), msg = $('#saveMsg');
  if (saveMode === 'export') {
    const done = () => { msg.textContent = 'Copied! Keep the code somewhere safe.'; };
    try { navigator.clipboard.writeText(ta.value).then(done, () => { ta.select(); msg.textContent = 'Select the text and copy it yourself (Ctrl+C).'; }); } catch (e) { ta.select(); msg.textContent = 'Select the text and copy it yourself (Ctrl+C).'; }
    return;
  }
  if (!importArmed) {
    if (!ta.value.trim()) { msg.textContent = 'Paste a save code first.'; return; }
    try { parseSave(ta.value); } catch (e) { msg.textContent = e.message; return; }
    importArmed = true; $('#btnSaveAct').textContent = 'Yes, replace my progress';
    msg.textContent = 'Everything on this device will be replaced by the code. Tap again to confirm.'; return;
  }
  try { const n = importSave(ta.value); msg.textContent = 'Done! ' + n + ' items imported. Reloading…'; setTimeout(() => location.reload(), 900); }
  catch (e) { importArmed = false; $('#btnSaveAct').textContent = 'Import'; msg.textContent = e.message; }
});
// ----- voice chat (web version only) -----
const TV = window.TrepongVoice || null;
let vcBusy = false, vcTesting = false;
async function fillDevices() {
  if (!TV) return;
  const { mics, spks } = await TV.devices().catch(() => ({ mics: [], spks: [] }));
  const fill = (sel, list, cur, def) => {
    sel.textContent = '';
    const o0 = document.createElement('option'); o0.value = ''; o0.textContent = def; sel.append(o0);
    list.forEach((d, i) => { if (d.deviceId === 'default' || d.deviceId === 'communications') return; const o = document.createElement('option'); o.value = d.deviceId; o.textContent = d.label || ('Device ' + (i + 1)); sel.append(o); });
    sel.value = [...sel.options].some(o => o.value === cur) ? cur : '';
  };
  fill($('#micSel'), mics, TV.micId, 'Default microphone');
  fill($('#spkSel'), spks, TV.spkId, 'Default speakers');
  const named = mics.some(d => d.label);
  $('#btnMicGrant').hidden = named;
  $('#vcNote').textContent = !named ? 'Tap "Allow microphone" once. The browser remembers it, so voice chat starts right away after that.'
    : TV.sinkSupported ? 'All set! Your choices are saved and used automatically when voice chat opens.' : 'All set! This browser doesn\'t let pages pick speakers, so sound goes to the system default.';
}
function syncVoiceSettings() {
  if (!TV || !TV.supported) { $('#vcBox').hidden = true; return; }
  $('#vcBox').hidden = false; setSeg($('#vcSeg'), TV.enabled ? 1 : 0, 'o'); $('#spkField').hidden = !TV.sinkSupported;
  fillDevices();
}
if (TV) {
  $('#vcSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; TV.setEnabled(b.dataset.o === '1'); syncVoiceSettings(); });
  $('#btnMicGrant').addEventListener('click', async () => { const ok = await TV.requestMic(); if (!vcTesting) TV.stopTest(); if (!ok) $('#vcNote').textContent = 'The microphone was blocked. Click the lock by the address bar and allow the microphone for this site.'; fillDevices(); });
  $('#micSel').addEventListener('change', e => TV.setMic(e.target.value));
  $('#spkSel').addEventListener('change', e => TV.setSpk(e.target.value));
  $('#btnMicTest').addEventListener('click', async () => {
    if (vcTesting) { vcTesting = false; TV.stopTest(); $('#btnMicTest').textContent = 'Test microphone'; $('#micLvl').style.width = '0'; return; }
    const ok = await TV.startTest(); if (!ok) { $('#vcNote').textContent = 'Could not start the microphone. Allow the microphone for this site and try again.'; return; }
    vcTesting = true; $('#btnMicTest').textContent = 'Stop test'; fillDevices();
  });
  $('#btnSpkTest').addEventListener('click', () => TV.testSpeaker());
  $('#btnVcMute').addEventListener('click', () => { TV.setMuted(!TV.muted); syncVoiceBar(true); });
}
let vbKey = '';
function syncVoiceBar(force) {
  const bar = $('#voiceBar');
  if (!TV || !TV.open || !net) { if (!bar.hidden) bar.hidden = true; return; }
  bar.hidden = false;
  const btn = $('#btnVcMute'); btn.textContent = TV.muted ? 'Mic off' : 'Mic on'; btn.classList.toggle('off', TV.muted);
  const ps = findPeers(), me = myPeer();
  const ppl = ps.map(p => ({ id: p.peer, n: p.sameTab ? 'You' : (cleanName(p.presence.name) || 'Guest'), lvl: TV.level(p.sameTab ? 'me' : p.peer), on: p.sameTab || TV.connectedIds().includes(p.peer) }));
  const key = ppl.map(p => p.id + p.n + p.on).join('|');
  const box = $('#vcPeople');
  if (key !== vbKey || force) { vbKey = key; box.textContent = ''; ppl.forEach(p => { const s = document.createElement('span'); s.className = 'vp'; s.dataset.id = p.id; s.append(document.createElement('i'), document.createTextNode(p.n + (p.on ? '' : ' …'))); box.append(s); }); }
  ppl.forEach(p => { const s = box.querySelector('[data-id="' + CSS.escape(p.id) + '"]'); if (s) s.classList.toggle('talk', p.lvl > 0.12); });
}
function voiceTick() {
  if (!TV) return;
  if (vcTesting && curScreen === 'settings') $('#micLvl').style.width = Math.round(TV.level('me')*100) + '%';
  else if (vcTesting && curScreen !== 'settings') { vcTesting = false; TV.stopTest(); $('#btnMicTest').textContent = 'Test microphone'; }
  const online = (mode === 'host' || mode === 'guest') && net;
  const between = !!online && ['over', 'pick', 'lobby'].includes(curScreen) && !replay;
  if (!vcBusy) { vcBusy = true; TV.update(online ? net : null, between, online ? findPeers().map(p => p.peer) : []).catch(() => {}).finally(() => { vcBusy = false; }); }
  syncVoiceBar(false);
}
let layoutPref = ['auto', 'mobile', 'desk'].includes(store('trepong-layout')) ? store('trepong-layout') : 'auto';
function wantDesk() {
  if (layoutPref === 'desk') return true;
  if (layoutPref === 'mobile') return false;
  let fine = false; try { fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches; } catch (e) {}
  return innerWidth >= 980 && (fine || innerWidth >= 1200);
}
let uiSize = ['auto', '1', '1.25', '1.5'].includes(store('trepong-uiz')) ? store('trepong-uiz') : 'auto';
function applyLayout() {
  const d = wantDesk(); document.body.classList.toggle('desk', d);
  let z = 1;
  if (uiSize !== 'auto') z = +uiSize;
  else if (d) { // grow the UI as far as the menu still fits the window without scrolling
    document.documentElement.style.setProperty('--uiz', '1');
    const mp = document.querySelector('.menupanel'), menuOn = !$('#menu').hidden;
    if (!menuOn) $('#menu').hidden = false;
    const r = mp.getBoundingClientRect();
    if (!menuOn) $('#menu').hidden = true;
    if (r.height > 0) z = clamp(Math.min((innerWidth - 64)/r.width, (innerHeight - 40)/r.height), 1, 1.4);
  }
  document.documentElement.style.setProperty('--uiz', String(Math.round(z*100)/100));
  setSeg($('#uizSeg'), uiSize, 'z');
  setSeg($('#layoutSeg'), layoutPref, 'l');
  $('#layoutNote').textContent = layoutPref === 'auto' ? 'Auto picks desktop layout on wide screens with a mouse, otherwise mobile. Right now: ' + (d ? 'desktop' : 'mobile') + '.' : (d ? 'Desktop layout: the menu in three columns.' : 'Mobile layout: everything in one column.');
}
addEventListener('resize', applyLayout);
try { document.fonts.ready.then(() => setTimeout(applyLayout, 50)); } catch (e) {}
setTimeout(applyLayout, 1500);
$('#uizSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; uiSize = b.dataset.z; store('trepong-uiz', uiSize); applyLayout(); });
applyLayout();
function syncSettings() {
  applyLayout();
  syncVoiceSettings(); $('#saveBox').hidden = true;
  setSeg($('#sfxSeg'), muted ? 0 : 1, 'o'); setSeg($('#musicSeg'), Music.on ? 1 : 0, 'o'); setSeg($('#voiceSeg'), voicesOn ? 1 : 0, 'v');
}
$('#btnSettings').addEventListener('click', () => { audioOn(); syncSettings(); showScreen('settings'); });
$('#btnSetBack').addEventListener('click', () => showScreen('menu'));
$('#layoutSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; layoutPref = b.dataset.l; store('trepong-layout', layoutPref); applyLayout(); });
$('#sfxSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; muted = b.dataset.o === '0'; store('trepong-mute', muted ? '1' : '0'); syncSoundBtn(); syncSettings(); });
$('#musicSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; Music.on = b.dataset.o === '1'; store('trepong-music', Music.on ? '1' : '0'); $('#btnMusic').setAttribute('aria-pressed', String(Music.on)); audioOn(); syncSettings(); });
EMOTES.forEach((e, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = e; if (e.length > 2) b.className = 'txt'; b.addEventListener('click', () => sendEmote(i)); $('#emoteTray').append(b); });
$('#emoteBtn').addEventListener('click', () => { $('#emoteTray').hidden = !$('#emoteTray').hidden; });
$('#smashBtn').addEventListener('click', doSmash);
$('#btnQuests').addEventListener('click', () => { audioOn(); ensureDaily(); const w = ACH_CATS.find(([k]) => questRows(k).some(r => r.have >= r.need && !r.claimed)); questTab = w ? w[0] : 'daily'; showScreen('quests'); renderQuests(); $('#quests').scrollTop = 0; });
$('#btnQuestsDone').addEventListener('click', () => showScreen('menu'));
$('#btnShopBack').addEventListener('click', closeShop);
$('#btnTowerTop').addEventListener('click', () => showScreen('menu'));
ensureDaily(); syncQuestBadge();
setSeg($('#modeSeg'), menuN); setSeg($('#fmtSeg'), menuFmt, 'f'); $('#fmtNote').textContent = FMT_TEXT[menuFmt];
buildCustom(); saveWallet();
$('#btnLook').addEventListener('click', () => { audioOn(); openShop(); });
$('#btnLookDone').addEventListener('click', closeShop);
$('#btnBuy').addEventListener('click', buy);
$('#modeSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; menuN = +b.dataset.n; setSeg($('#modeSeg'), menuN); store('trepong-n', String(menuN)); });
$('#fmtSeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; menuFmt = b.dataset.f; setSeg($('#fmtSeg'), menuFmt, 'f'); $('#fmtNote').textContent = FMT_TEXT[menuFmt]; store('trepong-fmt', menuFmt); syncPracticeLabel(); });
$('#lobbySeg').addEventListener('click', e => { const b = e.target.closest('button'); if (!b || mode !== 'host') return; hostSetN(+b.dataset.n); });
$('#lobbyFmt').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b || mode !== 'host') return;
  lobbyFmt = b.dataset.f; setSeg($('#lobbyFmt'), lobbyFmt, 'f');
  if (lobbyFmt === 'torn' && lobbyN > 3) hostSetN(3);
  if (lobbyFmt === 'arena' && lobbyLevel) hostSetN(lobbyLevel.sides);
  if (lobbyFmt === 'raid') { lobbyRaidMod = raidMod; if (!activeRaids().includes(lobbyRaid)) lobbyRaid = activeRaids().includes(raidSel) ? raidSel : activeRaids()[0]; if (lobbyN > 4) hostSetN(4); }
  $('#btnStart').textContent = lobbyFmt === 'serie' ? 'Start the series' : lobbyFmt === 'boss' ? 'Start the boss fight' : lobbyFmt === 'torn' ? 'Start floor ' + towerNext() : lobbyFmt === 'raid' ? 'Start raid: ' + RAIDS[lobbyRaid].n : 'Start the match';
  hostSync();
});
$('#code').addEventListener('input', e => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
$('#code').addEventListener('keydown', e => { if (e.key === 'Enter') guestJoin(); });
$('#btnPractice').addEventListener('click', () => { audioOn(); if (menuFmt === 'torn') { showScreen('tower'); renderTower(); } else if (menuFmt === 'cup') openCup(); else startPractice(); });
$('#btnHost').addEventListener('click', hostCreate);
$('#btnJoin').addEventListener('click', guestJoin);
$('#btnStart').addEventListener('click', hostStart);
$('#btnLeaveLobby').addEventListener('click', leave);
$('#btnQuit').addEventListener('click', () => { if (special === 'adv') { advLeave(); return; } if (special === 'custom' && mode === 'practice') { const back = editReturn; leave().then(() => back && ed ? (showScreen('build'), renderBuilder()) : openArenas()); return; } leave(); });
$('#btnOverMenu').addEventListener('click', () => { if (special === 'adv') { advLeave(); return; } if (special === 'raid' && mode === 'practice') { leave().then(() => openRaids()); return; } if (special === 'custom' && mode === 'practice') { const back = editReturn; leave().then(() => back && ed ? (showScreen('build'), renderBuilder()) : openArenas()); return; } leave(); });
$('#btnRevive').addEventListener('click', () => { if (!advRes) return; const wid = advRes.W.id; audioOn(); advRevive(wid, true); });
$('#btnNext').addEventListener('click', () => { audioOn(); seriesNext(); });
$('#btnAgain').addEventListener('click', () => {
  audioOn();
  if (mode === 'practice' && special === 'adv') { advContinue(); return; }
  if (mode === 'practice' && special === 'raid') { startPractice('raid'); return; }
  if (mode === 'practice' && special === 'custom') { startPractice('custom'); return; }
  if (mode === 'practice' && special === 'cup') { st = null; resetFx(); mode = 'menu'; showScreen('cup'); renderCup(); return; }
  if (mode === 'practice' && special === 'weekly') { startPractice('weekly'); return; }
  if (mode === 'practice') startPractice();
  else if (mode === 'host') hostStart();
});
$('#btnToLobby').addEventListener('click', () => {
  if (mode !== 'host') return;
  st = null; series = null; resetFx(); hostPhase = 'lobby';
  net.presence({ phase: 'lobby', g: null, series: null }).catch(() => {});
  hostSync(); enterLobbyUI(true);
});
function syncSoundBtn() { $('#btnSound').textContent = muted ? 'Sound off' : 'Sound on'; }
syncSoundBtn();
$('#btnMusic').setAttribute('aria-pressed', String(Music.on));
$('#btnMusic').addEventListener('click', () => { Music.on = !Music.on; store('trepong-music', Music.on ? '1' : '0'); $('#btnMusic').setAttribute('aria-pressed', String(Music.on)); audioOn(); });
$('#btnSound').addEventListener('click', () => { muted = !muted; store('trepong-mute', muted ? '1' : '0'); audioOn(); syncSoundBtn(); });

(async () => {
  try { roomNS = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null; }
  catch (e) { roomNS = null; }
  const note = $('#netNote');
  if (roomNS) {
    $('#btnHost').disabled = false; $('#btnJoin').disabled = false; syncPracticeLabel();
    note.textContent = 'Create a room and give the code to your friend. You don\'t need to be on the same wifi.';
  } else {
    note.textContent = 'Online play only works when the page is open while signed in to Claude. Practice still works.';
  }
})();
