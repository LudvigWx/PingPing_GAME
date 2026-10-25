// ---------- battle pass screen ----------
let bpPremArmed = false;
function drawRewardChip(cv, r) {
  const c = cv.getContext('2d'), w = cv.width, h = cv.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  if (r[0] === 'coins') {
    for (let k = 0; k < 3; k++) {
      const x = w/2 - 10 + k*10, y = h/2 + 6 - k*5 + Math.sin(clock*3 + k)*1.5;
      const g = c.createRadialGradient(x - 3, y - 3, 1, x, y, 11); g.addColorStop(0, '#FFF1A8'); g.addColorStop(0.55, '#FFD84A'); g.addColorStop(1, '#C9921A');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, 10, 0, TAU); c.fill(); c.strokeStyle = '#8A5F0A'; c.lineWidth = 1.5; c.stroke();
    }
    return;
  }
  if (r[0] === 'chest') { drawChestBox(c, r[1], w/2, h*0.72 + Math.sin(clock*3)*1.5, 0.42, 0, 0.5); return; }
  if (r[0].startsWith('p')) { drawProfChip(cv, r[0], r[1], clock); return; }
  if (r[0] === 'c') { lookCanvas(cv, { ...myLook, c: r[1], h: 'none', f: 'eyes' }, 2.4, 11); return; }
  if (r[0] === 'h') { lookCanvas(cv, { ...myLook, h: r[1], f: 'none' }, 2.1, 9); return; }
  if (r[0] === 'f') { lookCanvas(cv, { ...myLook, h: 'none', f: r[1] }, 3.4, 9); return; }
  if (r[0] === 'k') { lookCanvas(cv, { ...myLook, h: 'none', f: 'none', s: r[1] }, 2.6, 13); return; }
  const keep = previewLook; previewLook = { ...myLook };
  if (r[0] === 't') drawTrailChip(cv, r[1]); else if (r[0] === 'v') drawVictoryChip(cv, r[1]);
  previewLook = keep;
}
function openBp() { bpPremArmed = false; showScreen('bp'); renderBp(); }
function renderBp() {
  syncCoinUI(); $('#bpCoins').textContent = fmt(coins);
  const T = bpTier(), max = BP_TIERS.length;
  $('#bpEnds').textContent = bpActive() ? 'Season 1 · ends in ' + daysLeft(BP.end) : 'Season 1 has ended';
  $('#bpTierN').textContent = T;
  $('#bpBar').style.width = Math.round(100*bpTierFrac()) + '%';
  $('#bpXpTxt').textContent = T >= max ? 'Max tier reached! ' + fmt(bp.pts) + ' rally points' : fmt(bp.pts) + ' / ' + fmt(BP_PTS[T]) + ' rally points to tier ' + (T + 1);
  const pb = $('#btnBpPrem');
  if (bp.prem) { pb.textContent = '★ Premium unlocked'; pb.disabled = true; pb.classList.add('on'); }
  else {
    pb.classList.remove('on'); pb.textContent = ''; pb.disabled = coins < BP.premium && !bpPremArmed;
    pb.append(bpPremArmed ? 'Tap again to unlock for ' : 'Unlock premium ', Object.assign(document.createElement('span'), { className: 'coin', textContent: fmt(BP.premium) }));
    if (coins < BP.premium) pb.append(Object.assign(document.createElement('small'), { textContent: 'Save up ' + fmt(BP.premium - coins) + ' more coins' }));
  }
  const n = bpClaimable(); $('#btnBpAll').hidden = !n; $('#btnBpAll').textContent = 'Claim all (' + n + ')';
  const list = $('#bpList'); list.textContent = '';
  BP_TIERS.forEach((t, i) => {
    const row = document.createElement('div'); row.className = 'bprow' + (i < T ? ' open' : '') + (i === T ? ' cur' : '');
    row.append(Object.assign(document.createElement('span'), { className: 'bpn', textContent: i + 1 }));
    [0, 1].forEach(side => {
      const r = t[side], prem = side === 1, got = (prem ? bp.cp : bp.cf).includes(i);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'bpcell' + (prem ? ' prem' : '') + (got ? ' got' : '');
      const cv = document.createElement('canvas'); cv.width = 88; cv.height = 60; cv.dataset.i = i; cv.dataset.s = side;
      const nm = document.createElement('span'); nm.textContent = rewardName(r);
      const stt = document.createElement('small');
      const can = i < T && !got && (!prem || bp.prem);
      stt.textContent = got ? '✓ Claimed' : i >= T ? '🔒 ' + fmtShort(BP_PTS[i]) : prem && !bp.prem ? '🔒 Premium' : 'Claim!';
      if (can) b.classList.add('can');
      b.append(cv, nm, stt);
      b.addEventListener('click', () => { if (can) bpClaim(i, prem); });
      row.append(b);
      drawRewardChip(cv, r);
    });
    list.append(row);
  });
  if (document.body.classList.contains('desk')) { const cur = list.children[Math.max(0, Math.min(T, BP_TIERS.length - 1) - 1)]; if (cur) list.scrollLeft = cur.offsetLeft - list.offsetLeft; }
}
function animBpChips() {
  $('#bpList').querySelectorAll('canvas').forEach(cv => { const r = BP_TIERS[+cv.dataset.i][+cv.dataset.s]; if (r[0] !== 'pt') drawRewardChip(cv, r); });
}
function buyPremium() {
  if (bp.prem) return;
  if (coins < BP.premium) return;
  if (!bpPremArmed) { bpPremArmed = true; renderBp(); return; }
  addCoins(-BP.premium); bp.prem = true; bpPremArmed = false; saveBp(); sfx.win(); buzz([30, 40, 80]); startVictory('batswarm');
  toast('Premium unlocked! Every reached tier can be claimed now.'); renderBp();
}
function drawMenuAdv() {
  const cv = $('#menuAdv'); if (!cv) return;
  const c = cv.getContext('2d'), w = cv.width, h = cv.height;
  c.setTransform(1, 0, 0, 1, 0, 0);
  const W = worldById(advSelW);
  drawScene(c, W.scene, clock, w, h);
  const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, 'rgba(12,10,28,0.85)'); g.addColorStop(0.55, 'rgba(12,10,28,0.25)'); g.addColorStop(1, 'rgba(12,10,28,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const sc = h/70;
  c.save(); c.setTransform(sc, 0, 0, sc, w*0.78, h*0.74 + Math.sin(clock*2)*sc); drawPaddleLocal(c, validLook({ c: W.boss[W.boss.length - 1].c, h: W.boss[W.boss.length - 1].h, f: W.boss[W.boss.length - 1].f, s: W.boss[W.boss.length - 1].s, t: 'std' }), 14, clock, [-1, -0.3], {}, 10); c.restore();
}


function fmtShort(v) { return v >= 1e6 ? (Math.round(v/1e5)/10) + 'M' : v >= 1e3 ? Math.round(v/1e3) + 'k' : String(v); }
