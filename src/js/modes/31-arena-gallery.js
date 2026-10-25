// ----- gallery -----
function openArenas() { mode = 'menu'; st = null; series = null; special = null; resetFx(); showScreen('arenas'); renderArenas(); renderDaily(); }
function renderArenas() {
  const list = $('#arenaList'); list.textContent = '';
  const card = (L, i, example) => {
    const d = document.createElement('div'); d.className = 'acard';
    const cv = document.createElement('canvas'); cv.width = 200; cv.height = 150; drawArenaThumb(cv, L);
    const info = document.createElement('div');
    info.append(Object.assign(document.createElement('b'), { textContent: L.name }), Object.assign(document.createElement('small'), { textContent: L.sides + ' players · ' + ({ last: 'Last one standing', stars: 'Star hunt (' + L.rules.goalV + ')', survive: 'Survive ' + L.rules.goalV + 's' })[L.rules.goal] + ' · ' + L.objs.length + ' things' + (example ? ' · example' : '') }));
    const btns = document.createElement('div'); btns.className = 'abtns';
    const mk = (txt, fn, cls) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = txt; if (cls) b.className = cls; b.addEventListener('click', fn); btns.append(b); };
    mk('Play', () => { audioOn(); playLevelPractice(L, false); }, 'primary');
    mk('With friends', () => { audioOn(); hostArena(L); });
    mk('Edit', () => openBuilder(example ? { ...L, name: L.name + ' remix' } : L, example ? null : i));
    mk('Share', () => { const code = levelCode(L); const url = location.origin + location.pathname + '?arena=' + code.slice(5); showShare(L.name, code, url); });
    if (!example) mk('Delete', () => { if (d.dataset.armed) { myArenas.splice(i, 1); saveArenas(); renderArenas(); } else { d.dataset.armed = '1'; toast('Tap Delete again to remove "' + L.name + '".'); } }, 'ghost');
    d.append(cv, info, btns); list.append(d);
  };
  if (!myArenas.length) list.append(Object.assign(document.createElement('p'), { className: 'note', textContent: 'No arenas yet. Build your first one, or remix an example below.' }));
  myArenas.forEach((L, i) => card(L, i, false));
  list.append(Object.assign(document.createElement('div'), { className: 'eyebrow', textContent: 'Examples' }));
  LV_EXAMPLES.forEach((L, i) => card(L, i, true));
}
function drawArenaThumb(cv, L) {
  const c = cv.getContext('2d'), A = makeArena(L.sides, false), w = cv.width, h = cv.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const v of A.verts) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
  const sc = Math.min((w - 16)/(x1 - x0), (h - 16)/(y1 - y0)), cx = w/2 - (x0 + x1)/2*sc, cy = h/2 - (y0 + y1)/2*sc;
  c.setTransform(sc, 0, 0, sc, cx, cy);
  c.beginPath(); A.verts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
  c.fillStyle = 'rgba(120,100,255,0.1)'; c.fill(); c.strokeStyle = 'rgba(160,150,230,0.5)'; c.lineWidth = 0.012; c.stroke();
  drawLevelObjs(c, { objs: L.objs }, 1, true);
}
function showShare(name, code, url) {
  $('#shareBox').hidden = false; $('#shareName').textContent = name; $('#shareCode').value = code; $('#shareUrl').value = url;
}
function hostArena(L) {
  if (!roomNS) { toast('Online play is not available right now. Try Play instead.'); return; }
  lobbyLevel = cleanLevel(L); menuN = lobbyLevel.sides; menuFmt = 'snabb';
  pendingArenaHost = true; hostCreate();
}
let pendingArenaHost = false;

function startArenaMatch(L) {
  const np = L.sides;
  if (mode === 'practice') { while (bots.length < np) { const i = bots.length; bots.push(true); names.push('Bot ' + i); looks.push(randomLook(looks.map(l => l.c))); } bots = bots.slice(0, np); names = names.slice(0, np); looks = looks.slice(0, np); }
  else { bots = hostSeats.map((p, i) => i !== 0 && !p).slice(0, np); names = seatNames().slice(0, np); looks = seatLooks().slice(0, np); while (bots.length < np) { bots.push(true); names.push('Bot ' + bots.length); looks.push(randomLook(looks.map(l => l.c))); } }
  for (let i = 1; i < np; i++) if (bots[i]) botSkill[i] = L.rules.bots;
  const heroes = Array.from({ length: np }, (_, i) => mode === 'host' && i > 0 && hostSeats[i] ? guestHero(i) : heroOf(i));
  const heroLv = heroes.map((h, i) => i === 0 ? heroLevel(h) : mode === 'host' && hostSeats[i] ? guestCard(i).hl : 3);
  const heroVar = heroes.map((h, i) => i === 0 ? heroVariant(h) : mode === 'host' && hostSeats[i] ? guestCard(i).hv : 'std');
  st = newGame(np, L.rules.lives, null, { lvl: L, heroes, heroLv, heroVar });
  botCache = []; mySeat = 0; lastSmashN = []; lastHeroN = [];
  if (mode === 'host') { hostPhase = 'play'; net.presence({ phase: 'play', names, looks, seats: hostSeats, n: lobbyN, fmt: lobbyFmt, lvl: lobbyLevel, series: null, g: packState(st) }).catch(() => {}); }
  showScreen(null); requestWake();
  banner = { text: L.name.toUpperCase(), sub: ({ last: 'Last one standing wins', stars: 'First to ' + L.rules.goalV + ' stars wins', survive: 'Most lives after ' + L.rules.goalV + 's wins' })[L.rules.goal], col: '#3EE6FF', t: 0 };
}
