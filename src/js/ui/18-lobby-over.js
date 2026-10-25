// ---------- lobby & over UI ----------
function enterLobbyUI(isHost) {
  $('#lobbyArenaBtn').hidden = !lobbyLevel;
  $('#lobbyCode').textContent = roomCode;
  $('#lobbySeg').hidden = !isHost; $('#lobbyFmt').hidden = !isHost; $('#btnStart').hidden = !isHost;
  $('#lobbyWait').hidden = isHost; $('#lobbyHint').hidden = !isHost;
  setSeg($('#lobbySeg'), lobbyN); setSeg($('#lobbyFmt'), lobbyFmt, 'f');
  $('#lobbyFmtNote').textContent = FMT_TEXT[lobbyFmt];
  $('#btnStart').textContent = lobbyFmt === 'serie' ? 'Start the series' : lobbyFmt === 'boss' ? 'Start the boss fight' : lobbyFmt === 'torn' ? 'Start floor ' + towerNext() : 'Start the match';
  $('#lobbyChaos').hidden = !isHost; setSeg($('#lobbyChaos'), lobbyChaos ? 1 : 0, 'c');
  $('#hudCode').hidden = false; $('#hudCodeTxt').textContent = roomCode;
  showScreen('lobby'); renderLobby();
}
function lookCanvas(cvs, look, scale, hw) {
  const c = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  c.setTransform(scale, 0, 0, scale, w/2, h*0.82);
  drawPaddleLocal(c, look, hw || 14, clock, [0, -1], {}, 6);
}
function renderLobby() {
  $('#lobbyFmtNote').textContent = FMT_TEXT[lobbyFmt] + (lobbyFmt === 'arena' && lobbyLevel ? ' Arena: ' + lobbyLevel.name + ' (' + lobbyLevel.sides + ' players).' : '') + (lobbyFmt === 'raid' && RAIDS[lobbyRaid] ? ' Raid: ' + RAIDS[lobbyRaid].full + ' (' + RAID_MODS[lobbyRaidMod || 0].n + ').' : '') + (['boss', 'torn', 'raid'].includes(lobbyFmt) && mode === 'host' ? (hardcore ? ' Hardcore: friendly fire is on.' : ' Team shield: no friendly fire.') : '') + (lobbyChaos ? ' Chaos Wheel is on.' : '') + ' Arena: ' + ARENAS[mode === 'host' ? curArena() : lobbyArena] + '.';
  const ul = $('#seats'); ul.textContent = '';
  const ps = findPeers();
  for (let i = 0; i < lobbyN; i++) {
    const li = document.createElement('li');
    const cvs = document.createElement('canvas'); cvs.width = 88; cvs.height = 60;
    const nm = document.createElement('span'); nm.className = 'nm';
    const tg = document.createElement('span'); tg.className = 'tg';
    const peer = hostSeats[i];
    let name, tag;
    if (i === 0) { name = names[0] || (mode === 'host' ? myName() : 'Host'); tag = mode === 'host' ? 'You · host' : 'Host'; }
    else if (peer) { const p = ps.find(q => q.peer === peer); name = names[i] || (p && cleanName(p.presence.name)) || 'Guest'; tag = i === mySeat ? 'You' : 'Ready'; }
    else { name = 'Open seat'; tag = 'A bot plays here'; li.style.opacity = '0.6'; }
    nm.textContent = name; tg.textContent = tag;
    let card = null, fid = null;
    if (peer === 'host' || (i === 0 && mode === 'host')) { const hp = (ps.find(q => q.presence.role === 'host') || {}).presence; card = mode === 'host' ? myCardData() : hp?.card; fid = mode === 'host' ? null : hp?.fid; }
    else if (peer) { const p = ps.find(q => q.peer === peer); card = p && p.presence.card; fid = p && p.presence.fid; if (i === mySeat) { card = myCardData(); fid = null; } }
    if (card) { li.classList.add('tap'); const cl = document.createElement('span'); cl.className = 'cardlink'; cl.textContent = fid && Live.ok && !Friends.list[fid] ? 'Card · add friend' : 'Show card'; tg.textContent = tag + ' · '; tg.append(cl); li.addEventListener('click', () => showCardOf(card, fid, name)); }
    li.append(cvs, nm, tg); ul.append(li);
    lookCanvas(cvs, looks[i] || validLook(null, SEAT_DEFAULT[i]), 1.6);
  }
}
// little extras on top of the normal match coins (computed once per match)
const overExtras = {};
function matchExtras(sum) {
  const ex = [], won = st.boss ? st.winner === -2 : st.winner === mySeat, today = dayKey();
  if (won && stats.fwDay !== today) { stats.fwDay = today; stats.pxp = (stats.pxp || 0) + 50; saveStats(); ex.push(['⭐ First win of the day ×2', Math.max(20, sum)]); setTimeout(() => toast('First win of the day! Double coins and +50 XP'), 900); }
  if (revengeN) { ex.push(['😈 Revenge ×' + revengeN, 5*revengeN]); track('revenges', revengeN); }
  if (goldHits) { ex.push(['🪙 Golden ball ×' + goldHits, 3*goldHits]); track('goldHits', goldHits); }
  stickerDrop(ex);
  if (Math.random() < 0.05) { freeChests++; saveFree(); ex.push(['🍀 Lucky drop: wooden chest', 0]); setTimeout(() => { toast('🍀 Lucky drop! A free wooden chest is waiting in Chests.'); tone(1046, 0.1, 'triangle', 0.05); tone(1318, 0.2, 'triangle', 0.05, 1, 0.1); }, 1600); }
  return ex;
}
function matchCoins() {
  if (special === 'adv' && advRes) return advRes.parts;
  if (st && st.raid && raidRes) return [[raidRes.won ? 'Raid cleared' : 'Raid attempt', raidRes.coins]];
  const won = st.boss ? st.winner === -2 : st.winner === mySeat, hits = st.sh[mySeat] || 0;
  const tf = st.boss && st.boss.floor;
  const parts = [['Participation', 8], [tf ? 'Floor ' + tf : st.boss ? 'Boss defeated' : 'Win', won ? (tf ? towerCoins(tf) : st.boss ? 40 : 20) : 0], ['Hits', Math.min(30, hits*2)], ['Team score', Math.min(25, Math.round(st.tot/150))]];
  return parts;
}
function showOver() {
  overShown = true;
  if (special === 'adv') advResolve();
  if (st && st.raid) raidResolve();
  dailyResolve();
  const w = st.winner, el = $('#overWho');
  if (st.boss && st.boss.floor) {
    el.textContent = w === -2 ? 'Floor ' + st.boss.floor + ' cleared!' : (names[st.boss.s] || 'The boss') + ' stopped you';
    el.style.color = w === -2 ? '#7CFFB2' : '#FF5A4A';
  } else if (st.boss) {
    el.textContent = w === -2 ? 'You defeated the boss!' : 'The boss won this time';
    el.style.color = w === -2 ? '#7CFFB2' : '#FF5A4A';
  } else {
    el.textContent = w < 0 ? 'Draw' : (w === mySeat ? 'You win!' : (names[w] || 'Player ' + (w+1)) + ' wins!');
    el.style.color = w < 0 ? 'var(--ink)' : colOf(w);
  }
  $('#stTot').textContent = fmt(st.tot); $('#stBest').textContent = fmt(st.best);
  const key = 'trepong-rec-' + st.n, old = +store(key) || 0;
  const isRec = st.best > old && st.best > 0;
  if (isRec) store(key, String(st.best));
  $('#stRec').hidden = !isRec;
  $('#stRecOld').textContent = isRec ? (old ? 'The previous record was ' + fmt(old) + '.' : '') : 'Your rally record with ' + st.n + ' players: ' + fmt(old);
  // coins for this match, once
  const earn = $('#overEarn');
  if (mySeat >= 0) {
    const akey = (roomCode || 'p') + ':' + st.mid;
    const parts = matchCoins().filter(p => p[1] > 0);
    let sum = parts.reduce((a, p) => a + p[1], 0);
    const half = mode === 'practice' && !st.boss && special !== 'cup' && special !== 'adv' && !st.raid;
    if (half) sum = Math.round(sum/2);
    if (!awarded.has(akey)) {
      const ex = overExtras[akey] = matchExtras(sum);
      awarded.add(akey); addCoins(sum + ex.reduce((a, p) => a + p[1], 0)); trackMatchEnd(sum); setTimeout(() => sfx.coin(), 500);
      if (st.boss && st.boss.wk && st.winner === -2) {
        const firstThisWeek = !weeklyBest(); submitWeekly(st.mt, st.n - 1); track('weeklyWins');
        if (firstThisWeek) { addCoins(150); setTimeout(() => toast('Weekly boss defeated in ' + fmtTime(st.mt) + '! +150 coins'), 1200); }
        else setTimeout(() => toast('Time: ' + fmtTime(st.mt) + '. Best: ' + fmtTime(weeklyBest().t)), 1200);
      }
      if (special === 'cup' && cup) { const won = st.winner === mySeat; cupOnMatchEnd(won); if (won) track('cupMatchWins'); if (cup.done && cup.ents[cup.champ].me) { track('cupWins'); addCoins(cup.size === 8 ? 150 : 80); setTimeout(() => toast('Tournament victory! +' + (cup.size === 8 ? 150 : 80) + ' coins'), 1200); } }
      if (st.boss && st.boss.floor && st.winner === -2) { const loot = towerWin(st.boss.floor); if (loot.length) setTimeout(() => toast('Exclusive reward: ' + loot.join(' + ') + '!'), 1200); }
    }
    const ex = overExtras[akey] || [];
    $('#earnAmt').textContent = '+' + (sum + ex.reduce((a, p) => a + p[1], 0));
    $('#earnWhy').textContent = parts.map(p => p[0] + ' ' + p[1]).join(' · ') + (half ? ' · half coins vs bots' : '') + ex.map(p => ' · ' + p[0] + (p[1] ? ' +' + p[1] : '')).join('');
    earn.hidden = false;
  } else earn.hidden = true;
  updateOverSeries();
  if (special === 'adv') advOverUI();
  if (st.raid) raidOverUI();
  if (st.lv && mode === 'practice') { $('#btnAgain').textContent = 'Play again'; $('#btnOverMenu').textContent = editReturn ? 'Back to the editor' : 'To my arenas'; }
  showScreen('over');
  if (w === mySeat || (st.boss && w === -2 && mySeat >= 0)) { sfx.win(); buzz([30, 40, 30, 40, 80]); startVictory(myLook.v); if (myHero !== 'none') setTimeout(() => heroSay(myHero, 'win'), 900); }
}
function updateOverSeries() {
  $('#overStars').hidden = true; $('#overRewards').hidden = true; $('#btnRevive').hidden = true;
  const host = mode === 'host', prac = mode === 'practice', guest = mode === 'guest';
  const sOn = !!series, done = sOn && series.sp === 'done';
  $('#overEyebrow').textContent = sOn ? (done ? 'Series over' : 'Match ' + series.r + ' of ' + series.of + ' done') : 'Match over';
  $('#overBoard').hidden = !sOn;
  if (sOn) renderBoard($('#overBoard'), series, false);
  if (done) {
    const champs = seriesChampions(series);
    const el = $('#overWho');
    el.textContent = !champs.length ? 'Nobody won the series' : champs.length > 1 ? 'Shared victory!' : (champs[0] === mySeat ? 'You win the series!' : (names[champs[0]] || 'Player') + ' wins the series!');
    el.style.color = champs.length === 1 ? colOf(champs[0]) : 'var(--ink)';
    const skey = 'S' + series.id;
    if (mySeat >= 0 && champs.includes(mySeat) && !awarded.has(skey)) {
      awarded.add(skey); track('seriesWins');
      const bonus = mode === 'practice' ? 15 : 30;
      addCoins(bonus);
      $('#earnAmt').textContent = $('#earnAmt').textContent + ' +' + bonus;
      $('#earnWhy').textContent += ' · Series bonus ' + bonus;
      setTimeout(() => sfx.coin(), 900);
    }
  }
  $('#btnNext').hidden = !(sOn && !done && (host || prac));
  $('#btnAgain').hidden = !(host || prac) || (sOn && !done);
  const tw = st && st.boss && st.boss.floor;
  if (special === 'cup') { $('#btnAgain').textContent = 'To the bracket'; $('#btnAgain').hidden = false; }
  else $('#btnAgain').textContent = sOn ? 'New series' : st && st.boss && st.boss.wk ? 'Try again' : tw ? (st.winner === -2 ? 'Next floor' : 'Try again') : 'Play again';
  $('#btnToLobby').hidden = !host;
  $('#overWait').hidden = !guest || done;
  $('#overWait').textContent = sOn ? 'The host starts the card pick.' : 'The host decides whether to play again.';
  $('#btnOverMenu').textContent = guest || host ? 'Leave room' : 'To menu';
}

