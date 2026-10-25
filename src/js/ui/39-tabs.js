// ----- tabbed main menu (Play / Modes / Collection / Social / Profile) and the calm scenery behind menu screens -----
var menuTabCur = store('trepong-tab') || 'play';
const SCENIC = ['menu', 'custom', 'quests', 'tower', 'profile', 'chests', 'cup', 'settings', 'adv', 'story', 'bp', 'raid', 'build', 'arenas', 'redeem', 'levels', 'live', 'friends', 'lobby'];
const NEBULA_ON = ['custom', 'chests'];
function syncScenic() {
  const on = SCENIC.includes(curScreen);
  document.body.classList.toggle('scenic', on);
  $('#sceneNeb').hidden = !(on && (NEBULA_ON.includes(curScreen) || (curScreen === 'menu' && menuTabCur === 'collection')));
}
function menuTab(t) {
  if (!document.querySelector('.mtab[data-tab="' + t + '"]')) t = 'play';
  menuTabCur = t; store('trepong-tab', t);
  document.querySelectorAll('.mtab').forEach(el => { el.hidden = el.dataset.tab !== t; });
  document.querySelectorAll('.tabbar button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === t)));
  $('#menu').scrollTop = 0;
  syncScenic();
  if (t === 'social' && Live.ok) renderLive();
  if (Live.ok) setTimeout(() => renderMinis(true), 0);
}
const _showScreenBase = showScreen;
showScreen = function (name) { _showScreenBase(name); syncScenic(); };

// the leaderboards live inside the Social tab now (the old Live screen stays as an empty shell)
(function () {
  const lp = $('#live .panel'), dst = $('#socialLive');
  [...lp.children].forEach(c => { if (!c.classList.contains('toprow')) dst.append(c); });
})();

$('.tabbar').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; audioOn(); menuTab(b.dataset.tab); });
function pickFmt(f) { const b = $('#fmtSeg [data-f="' + f + '"]'); if (b) b.click(); menuTab('play'); }
$('#btnModeTower').addEventListener('click', () => pickFmt('torn'));
$('#btnModeCup').addEventListener('click', () => pickFmt('cup'));
$('#btnModeBoss').addEventListener('click', () => pickFmt('boss'));
$('#btnSettings2').addEventListener('click', () => $('#btnSettings').click());

function greeting() {
  const h = new Date().getHours(), nm = ($('#name').value || '').trim();
  const g = h < 5 ? 'Good night' : h < 11 ? 'Good morning' : h < 17 ? 'Good afternoon' : h < 22 ? 'Good evening' : 'Good night';
  return g + (nm ? ', ' + nm : '') + '. Ready to rally?';
}
function syncTabs() {
  $('#topCoins').textContent = $('#menuCoins').textContent;
  const gt = greeting(); if ($('#greetTag').textContent !== gt) $('#greetTag').textContent = gt;
  document.querySelectorAll('.tabbar button').forEach(b => {
    const dot = b.querySelector('.ndot'); if (!dot) return;
    const pane = document.querySelector('.mtab[data-tab="' + b.dataset.tab + '"]');
    dot.hidden = !pane || !pane.querySelector('.badge:not([hidden]), .advnew:not([hidden])');
  });
  $('#socialOff').hidden = Live.ok; $('#socialLive').hidden = !Live.ok;
}
setInterval(syncTabs, 400);
menuTab(menuTabCur); syncTabs();

// Boss fight card: the real boss paddle (same drawing as in a match) over embers, with its health bar
const bossEmbers = Array.from({ length: 26 }, (_, i) => [Math.random(), Math.random(), 0.4 + Math.random()*0.8, i]);
function drawMenuBoss() {
  const cv = $('#menuBoss'); if (!cv) return;
  const c = cv.getContext('2d'), w = cv.width, h = cv.height;
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createRadialGradient(w/2, h*0.62, 10, w/2, h*0.62, w*0.6);
  g.addColorStop(0, '#5A1E2E'); g.addColorStop(0.55, '#2A1430'); g.addColorStop(1, '#140C22');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // rising embers
  for (const e of bossEmbers) {
    const y = h - ((e[1]*h + clock*28*e[2]) % (h + 20)), x = e[0]*w + Math.sin(clock*1.3 + e[3])*8;
    c.fillStyle = 'rgba(255,' + (120 + (e[3]*7) % 80) + ',70,' + (0.25 + 0.5*(y/h)).toFixed(2) + ')';
    c.beginPath(); c.arc(x, y, 1.5 + e[2]*2, 0, TAU); c.fill();
  }
  // floor glow
  const fg = c.createRadialGradient(w/2, h*0.86, 4, w/2, h*0.86, w*0.34);
  fg.addColorStop(0, 'rgba(255,90,74,0.45)'); fg.addColorStop(1, 'rgba(255,90,74,0)');
  c.fillStyle = fg; c.fillRect(0, 0, w, h);
  // the boss itself (rage shake)
  const sh = Math.sin(clock*23)*1.4, s = 7.2;
  c.setTransform(s, 0, 0, s, w/2 + sh, h*0.76);
  drawPaddleLocal(c, BOSS_LOOK, 18, clock, [0, 0.2], {}, 26);
  // health bar like in a match
  c.setTransform(1, 0, 0, 1, 0, 0);
  const bw = w*0.56, bx = (w - bw)/2, by = 16, f = 0.55 + 0.25*Math.sin(clock*0.7);
  c.fillStyle = 'rgba(0,0,0,0.45)'; c.fillRect(bx, by, bw, 14);
  c.fillStyle = '#FF5A4A'; c.fillRect(bx, by, bw*f, 14);
  c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 2; c.strokeRect(bx, by, bw, 14);
}
