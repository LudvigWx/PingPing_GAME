// ----- stickers: a new kind of collectible. Random drops after matches, stick up to 3 on your profile card -----
const STICKERS = [
  ['ball', '🏓', 'Ping!', 'c'], ['tri', '🔺', 'Triangle', 'c'], ['fire', '🔥', 'On fire', 'c'], ['star', '⭐', 'Gold star', 'c'], ['zap', '⚡', 'Zap', 'c'], ['gg', '🤝', 'GG', 'c'],
  ['pizza', '🍕', 'Pizza break', 'c'], ['coffee', '☕', 'Coffee', 'c'], ['dice', '🎲', 'Lucky roll', 'c'], ['music', '🎵', 'Bop', 'c'],
  ['ghost', '👻', 'Boo', 'u'], ['alien', '👽', 'Visitor', 'u'], ['robot', '🤖', 'Beep boop', 'u'], ['cat', '🐱', 'Cat', 'u'], ['frog', '🐸', 'Frog', 'u'], ['duck', '🦆', 'Quack', 'u'],
  ['rocket', '🚀', 'Liftoff', 'u'], ['cactus', '🌵', 'Prickly', 'u'], ['pepper', '🌶️', 'Spicy', 'u'],
  ['crown', '👑', 'Royalty', 'r'], ['gem', '💎', 'Diamond', 'r'], ['skull', '💀', 'Wrecked', 'r'], ['ufo', '🛸', 'UFO', 'r'], ['octo', '🐙', 'Octopus', 'r'], ['shark', '🦈', 'Shark', 'r'],
  ['rainbow', '🌈', 'Rainbow', 'r'], ['clover', '🍀', 'Four leaves', 'r'],
  ['dragon', '🐉', 'Dragon', 'e'], ['unicorn', '🦄', 'Unicorn', 'e'], ['volcano', '🌋', 'Eruption', 'e'], ['comet', '☄️', 'Comet', 'e'], ['trophy', '🏆', 'Champion', 'e'],
  ['moai', '🗿', 'Stone face', 'l'], ['blackhole', '🕳️', 'The void', 'l'], ['phoenix', '🐦‍🔥', 'Phoenix', 'l'],
  ['goldtri', '🔱', 'Trident of Trepong', 'm']
];
const STK_W = { c: 50, u: 28, r: 14, e: 6, l: 1.8, m: 0.2 };
stkReady = true;
function stickerById(id) { return STICKERS.find(s => s[0] === id); }
function myStickers() { return stats.stk || (stats.stk = {}); }
function rollSticker() {
  let tot = 0; for (const s of STICKERS) tot += STK_W[s[3]];
  let x = Math.random()*tot; for (const s of STICKERS) { x -= STK_W[s[3]]; if (x <= 0) return s; } return STICKERS[0];
}
function stickerDrop(ex) {
  if (Math.random() >= 0.25) return;
  const s = rollSticker(), S = myStickers(), fresh = !S[s[0]];
  S[s[0]] = (S[s[0]] || 0) + 1; trackMax('stickers', Object.keys(S).length); saveStats();
  if (fresh) { ex.push([s[1] + ' New sticker: ' + s[2] + ' (' + RAR6[s[3]][0] + ')', 0]); setTimeout(() => { toast(s[1] + ' New sticker: ' + s[2] + '! Stick it on your card in Progression → Collection.'); tone(1175, 0.08, 'triangle', 0.05); tone(1568, 0.15, 'triangle', 0.05, 1, 0.08); }, 2200); }
  else ex.push([s[1] + ' Sticker dupe', 10]);
}
function toggleSticker(id) {
  const arr = (myProf.sk || []).slice(), i = arr.indexOf(id);
  if (i >= 0) arr.splice(i, 1); else { if (arr.length >= 3) arr.shift(); arr.push(id); }
  myProf.sk = arr; saveProf(); tone(880, 0.05, 'sine', 0.05); renderStickers();
}
function renderStickers() {
  const box = $('#stkGrid'); if (!box) return; box.textContent = '';
  const S = myStickers(), on = myProf.sk || [];
  $('#stkCount').textContent = Object.keys(S).length + ' / ' + STICKERS.length + ' stickers · tap one to stick it on your card (max 3)';
  for (const s of STICKERS) {
    const have = S[s[0]] || 0, b = document.createElement('button'); b.type = 'button'; b.className = 'stk ' + s[3] + (have ? ' have' : '') + (on.includes(s[0]) ? ' on' : '');
    b.append(Object.assign(document.createElement('i'), { textContent: have ? s[1] : '?' }), Object.assign(document.createElement('small'), { textContent: have ? s[2] + (have > 1 ? ' ×' + have : '') : RAR6[s[3]][0] }));
    if (have) b.addEventListener('click', () => toggleSticker(s[0])); box.append(b);
  }
}
function drawCardStickers(c, ids, t) {
  const spots = [[42, 162, -0.22], [258, 162, 0.2], [264, 374, 0.15]];
  (ids || []).slice(0, 3).forEach((id, k) => { const s = stickerById(id); if (!s) return; const [x, y, r] = spots[k];
    c.save(); c.translate(x, y + Math.sin(t*1.5 + k)*0.8); c.rotate(r); c.font = '26px system-ui, "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.shadowColor = 'rgba(255,255,255,0.95)'; c.shadowBlur = 5; for (let q = 0; q < 3; q++) c.fillText(s[1], 0, 0); c.shadowBlur = 0; c.restore(); });
}
// ----- golden ball: now and then the serve is golden, and every hit on it pays -----
let goldHits = 0, goldSeen = -1;
// ----- new colours -----
PALETTE.push(['#B6FF3A', 'Neon lime'], ['#FF2BD6', 'Hot magenta'], ['#2B6BFF', 'Electric blue'], ['#FFB8A0', 'Peach'], ['#C8B6FF', 'Lavender'], ['#1FC8B0', 'Teal'], ['#FF3355', 'Crimson'], ['#E8C88A', 'Sand']);
Object.assign(PRICE.c, { '#B6FF3A': 90, '#FF2BD6': 120, '#2B6BFF': 90, '#FFB8A0': 70, '#C8B6FF': 70, '#1FC8B0': 80, '#FF3355': 110, '#E8C88A': 60 });
// ----- more achievements for the new stuff -----
ACH.push(['heat4', 'Meltdown', 'Reach max heat in a rally.', 'heatMax', 4, 150], ['rev10', 'Payback', 'Get 10 revenges.', 'revenges', 10, 120],
  ['sec1', 'Secret keeper', 'Unlock a secret item.', 'secrets', 1, 200], ['sec6', 'Know-it-all', 'Unlock all 6 secret items.', 'secrets', 6, 1000],
  ['stk12', 'Sticker fan', 'Collect 12 different stickers.', 'stickers', 12, 150], ['stk36', 'Full album', 'Collect every sticker.', 'stickers', STICKERS.length, 1500],
  ['dg1', 'Golden day', 'Win a gold medal in the Daily Arena.', 'dailyGolds', 1, 150], ['pres1', 'New beginnings', 'Prestige for the first time.', 'prestige', 1, 300],
  ['log7', 'Regular', 'Log in 7 days in a row.', 'loginStreak', 7, 300], ['gold25', 'Midas touch', 'Hit the golden ball 25 times.', 'goldHits', 25, 150]);
ACH_CAT.skill.push('heat4', 'rev10', 'gold25'); ACH_CAT.collect.push('sec1', 'sec6', 'stk12', 'stk36'); ACH_CAT.mode.push('dg1', 'pres1'); ACH_CAT.social.push('log7');

// Items from later modules (adventure, raids, forge, codes) exist now, so re-check the saved look and card.
// Before this, unlocked borders/backgrounds/ball skins from those modules fell back to the defaults on every restart.
myLook = validLook(storeJSON('trepong-look', null));
myProf = validProf(Object.assign({ pb: 'plain', pg: 'night', pt: 'newbie', pe: 'none', sh: [] }, storeJSON('trepong-prof', {})));
