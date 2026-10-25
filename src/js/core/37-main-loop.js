// ---------- main loop ----------
function stepDemo(dt) {
  if (!demo || demo.ph === 'ov') { demo = newGame(3, 99); demo.t = 0.6; demoLooks = [0, 1, 2].map(i => ({ c: SEAT_DEFAULT[i], h: ['crown', 'wizard', 'propeller'][i], f: 'eyes', t: 'std' })); }
  const t = [0, 1, 2].map(i => {
    const c = botCache['d' + i] || (botCache['d' + i] = { t: 0, u: 0, err: 0, hits: -1 });
    if (c.hits !== demo.hits) { c.hits = demo.hits; c.err = botErr(demo, i); }
    c.t -= dt; if (c.t <= 0) { c.t = 0.1; c.u = clamp(botAim(demo, i) + c.err, -1, 1); }
    return c.u;
  });
  demo.padSpeed = [2.2, 2.2, 2.2];
  stepSim(demo, dt, t, { onEvent: (ty, s, x, y) => { if (!st) { if (ty === 'hit') burst(x, y, demoLooks[s].c, 10, 0.8); if (ty === 'goal') burst(x, y, demoLooks[s].c, 20, 1.2); } } });
}
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(0.04, Math.max(0, (now - lastT) / 1000)); lastT = now; clock += dt;
  keyInput(dt);
  if ((mode === 'practice' || mode === 'host')) {
    if (st && st.ph !== 'ov') hostTick(dt);
    else if (series && series.sp === 'pick') pickTick();
  }
  if (mode === 'guest') guestTick(dt);
  voteUI();
  if (pops.length) { for (const p of pops) p.t += dt; pops = pops.filter(p => p.t < 1.4); }
  heatSeen = st && st.ph === 'pl' ? heatOf(st.rh || 0) : heatSeen;
  if (st && st.ph === 'pl' && st.gb >= 0 && st.gb !== goldSeen && mySeat >= 0) { goldSeen = st.gb; banner = { text: '🪙 GOLDEN BALL', sub: 'Every hit on it is worth 3 coins', col: '#FFD84A', t: 0 }; tone(1318, 0.1, 'triangle', 0.05); tone(1760, 0.18, 'triangle', 0.05, 1, 0.1); }
  if (st && st.ph === 'pl' && mySeat >= 0 && st.alive[mySeat] && !replay) {
    if ((st.cm || 1) >= 6) unlockSecret('h', 'infinity');
    if (st.sc >= 25000) unlockSecret('b', 'eightball');
  }
  if (!st) stepDemo(dt);
  for (const p of particles) { p.x += p.vx*dt; p.y += p.vy*dt; p.vx *= 0.94; p.vy *= 0.94; p.life -= dt*1.6; }
  particles = particles.filter(p => p.life > 0);
  for (let i = 0; i < 8; i++) flash[i] = Math.max(0, flash[i] - dt*1.6);
  shake = Math.max(0, shake - dt*2.5);
  if (banner) { banner.t += dt; if (banner.t > 1.7) banner = null; }
  emoBubbles.forEach((b, i) => { if (b) { b.t += dt; if (b.t > 2.5) emoBubbles[i] = null; } });
  if (mode === 'host' || mode === 'guest') readEmotes();
  if (st && st.ph === 'pl' && st.balls.length > 1 && mySeat >= 0) trackMax('maxBalls', st.balls.length);
  syncPlayButtons();
  drawBg();
  recordFrame();
  if (replay) {
    replay.i += 0.32;
    if (replay.i >= replay.frames.length + 25) endReplay();
  }
  if (st && replay) { drawGame(replayView(st), mode === 'guest' && mySeat < 0 ? 0 : mySeat, 1, looks, true); drawReplayOverlay(); }
  else if (st) drawGame(st, mode === 'guest' && mySeat < 0 ? 0 : mySeat, 1, looks, true);
  else drawGame(demo, 0, 0.55, demoLooks, false);
  if (!$('#custom').hidden) { drawPreview(); if (Math.floor(clock*10) % 3 === 0) $('#shopGrid').querySelectorAll('button').forEach(b => secretLocked(shopTab, b.dataset.id) ? drawSecretChip(b.querySelector('canvas')) : drawChip(b.querySelector('canvas'), shopTab, b.dataset.id)); }
  drawVictory(dt);
  drawHeroPop(dt);
  if (typeof voiceTick === 'function') voiceTick();
  if (curScreen === 'profile') { drawCard($('#cardCv').getContext('2d'), previewCardData(), clock); if (Math.floor(clock*10) % 2 === 0) { const k = PROF_TABS[profTab][0]; $('#profGrid').querySelectorAll('button').forEach(b => { const cv3 = b.querySelector('canvas'); if (cv3) drawProfChip(cv3, k, b.dataset.id, clock); }); } }
  if (curScreen === 'chests') drawChestStage(dt);
  if (curScreen === 'story') drawStory(dt);
  if (curScreen === 'build') drawBuilder();
  if (curScreen === 'arenas' && Math.floor(clock*10) % 5 === 0) $('#arenaList').querySelectorAll('canvas').forEach((cv, i) => { const all = myArenas.concat(LV_EXAMPLES); if (all[i]) drawArenaThumb(cv, all[i]); });
  if (curScreen === 'raid' && raidTab === 'raids' && Math.floor(clock*30) % 2 === 0) drawRaidScreen();
  if (curScreen === 'redeem') drawRedeemStage(dt);
  if (curScreen === 'levels') drawLevelsFrame();
  liveTick();
  if (curScreen === 'menu' && Math.floor(clock*20) % 2 === 0) drawLevelBarBadge();
  if (lvFx) drawLvFx(dt);
  if (curScreen === 'raid' && raidTab === 'forge') { drawForgeStage(dt); if (Math.floor(clock*10) % 3 === 0) document.querySelectorAll('#forgeStash canvas, #forgeColl canvas').forEach(cv => { if (cv.dataset.k === 'shard') drawShardChip(cv); else drawLootCv(cv, cv.dataset.k, cv.dataset.id); }); }
  if (curScreen === 'over' && raidRes && !$('#overRewards').hidden) $('#overRewards').querySelectorAll('canvas').forEach(cv => drawLootCv(cv, cv.dataset.k, cv.dataset.id));
  if (curScreen === 'adv' && Math.floor(clock*30) % 2 === 0) drawWorldCards();
  if (curScreen === 'bp' && Math.floor(clock*20) % 3 === 0) animBpChips();
  if (!$('#cardView').hidden && viewCard) drawCard($('#viewCv').getContext('2d'), viewCard, clock);
  if (!$('#menu').hidden) {
    lookCanvas($('#menuLook'), myLook, 2.2);
    if (Math.floor(clock*30) % 2 === 0) drawMenuAdv();
    if (Math.floor(clock*30) % 3 === 1) drawMenuRaid();
    if (Math.floor(clock*20) % 3 === 0) { drawCard($('#menuCard').getContext('2d'), myCardData(), clock); const mc = $('#menuChest').getContext('2d'); mc.setTransform(1, 0, 0, 1, 0, 0); mc.clearRect(0, 0, 160, 160); drawChestBox(mc, freeChests ? 'gold' : 'wood', 80, 96 + Math.sin(clock*3)*3, 1.2, 0, freeChests ? 0.6 : 0.2); }
    if (heroSelT) heroSelT += dt; if (heroSelT > 1) heroSelT = 0;
    const hc = $('#heroArt'); drawHero(hc.getContext('2d'), myHero, hc.width, hc.height, clock, heroSelT, heroVariant(myHero));
  }
  if (net && !$('#hudCode').hidden) $('#hudDot').className = net.connected() ? 'on' : '';
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

