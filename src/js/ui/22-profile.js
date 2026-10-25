// ---------- profile cards ----------
const RAR6 = { c: ['Common', '#9FB3D9', 60], u: ['Uncommon', '#7CFFB2', 150], r: ['Rare', '#4FA8FF', 300], e: ['Epic', '#C59BFF', 600], l: ['Legendary', '#FFB23E', 1200], m: ['Mythic', '#FF4F8B', null] };
const RAR_ORDER = ['c', 'u', 'r', 'e', 'l', 'm'];
// [id, name, rarity, source]  source: 'free' | 'buy' | 'chest' | 'tower:N' | 'ach:ID'
const PROF = {
  pb: [ // borders (static) + enchanted borders (animated)
    ['plain', 'Simple', 'c', 'free'], ['steel', 'Steel', 'c', 'buy'], ['bronze', 'Bronze', 'u', 'buy'], ['neon', 'Neon', 'u', 'buy'],
    ['circuit', 'Circuit board', 'r', 'buy'], ['gold', 'Gold', 'r', 'buy'], ['crystal', 'Crystal', 'e', 'buy'], ['royal', 'Royal', 'e', 'buy'], ['dragon', 'Dragon scale', 'l', 'buy'],
    ['pulse', 'Pulse', 'u', 'buy', 1], ['rainbowe', 'Rainbow flow', 'r', 'buy', 1], ['flame', 'Flames', 'e', 'buy', 1], ['frost', 'Frost', 'e', 'buy', 1],
    ['lightning', 'Thunder frame', 'l', 'buy', 1], ['cosmic', 'Cosmic', 'm', 'chest', 1], ['champion', 'Champion frame', 'm', 'tower:10', 1]
  ],
  pg: [ // backgrounds (static) + live backgrounds (animated)
    ['night', 'Night', 'c', 'free'], ['sunset', 'Sunset', 'c', 'buy'], ['mint', 'Mint dream', 'u', 'buy'], ['carbon', 'Carbon fiber', 'u', 'buy'],
    ['grid', 'Synth grid', 'r', 'buy'], ['mountains', 'Mountains', 'r', 'buy'], ['neoncity', 'Neon city', 'e', 'buy'],
    ['stars', 'Starfield', 'u', 'buy', 1], ['aurora', 'Aurora', 'r', 'buy', 1], ['rain', 'Neon rain', 'r', 'buy', 1], ['matrixl', 'Code rain', 'e', 'buy', 1],
    ['synthsun', 'Synth sun', 'e', 'buy', 1], ['galaxyl', 'Galaxy swirl', 'l', 'buy', 1], ['void', 'The void', 'm', 'chest', 1], ['towerbg', 'Top of the Tower', 'm', 'tower:8', 1]
  ],
  pt: [ // titles
    ['newbie', 'Newcomer', 'c', 'free'], ['chicken', 'The chicken', 'u', 'buy'], ['trend', 'Three is a trend', 'u', 'buy'], ['king', 'Ping pong king', 'r', 'buy'],
    ['influencer', 'Paddlefluencer', 'r', 'buy'], ['lord', 'Lord of the ball', 'e', 'buy'], ['legendt', 'The living legend', 'l', 'buy'],
    ['bosskiller', 'Boss slayer', 'r', 'ach:b1'], ['seriesm', 'Series master', 'r', 'ach:s1'], ['flawless', 'Flawless', 'e', 'ach:fl1'], ['thunder', 'Thunder god', 'e', 'ach:sm50'],
    ['collector', 'Collector', 'r', 'ach:p200'], ['chaos', 'Chaos lover', 'u', 'ach:ch10'], ['rich', 'The millionaire', 'e', 'ach:co1k'], ['legend', 'Legend', 'l', 'ach:w50'],
    ['champ', 'Champion', 'm', 'tower:10'], ['mythic', 'Mythic', 'm', 'chest']
  ],
  pe: [ // emblems
    ['none', 'None', 'c', 'free'], ['star', 'Star', 'c', 'buy'], ['heart', 'Heart', 'u', 'buy'], ['bolt', 'Lightning', 'u', 'buy'], ['crown', 'Crown', 'r', 'buy'],
    ['skull', 'Skull', 'r', 'buy'], ['flame', 'Flame', 'e', 'buy'], ['diamond', 'Diamond', 'l', 'buy'], ['triforce', 'Tri-triangle', 'm', 'chest']
  ]
};
const PROF_TABS = [['pb', 'Borders', 0], ['pb', 'Enchanted', 1], ['pg', 'Backgrounds', 0], ['pg', 'Live', 1], ['pt', 'Titles'], ['pe', 'Emblem'], ['sh', 'Showcase']];
function profItem(kind, id) { return (PROF[kind] || []).find(x => x[0] === id); }
function profPrice(it) { if (!it || it[3] !== 'buy') return null; return Math.round(RAR6[it[2]][2] * (it[4] ? 1.6 : 1)); }
function ownsProf(kind, id) {
  const it = profItem(kind, id); if (!it) return false;
  if (it[3] === 'free') return true;
  if (it[3].startsWith('ach:')) return achDone(ACH.find(a => a[0] === it[3].slice(4)) || ['', '', '', 'x', 1e9]);
  return owned.has(kind + ':' + id);
}
function profSourceText(it) {
  if (it[3] === 'chest') return 'Only in chests';
  if (it[3].startsWith('adv:')) return 'Adventure reward: ' + worldById(it[3].slice(4)).n;
  if (it[3] === 'bp') return 'Battle pass reward';
  if (it[3] === 'code') return 'Secret redeem code';
  if (it[3] === 'level') return 'Level road reward';
  if (it[3] === 'coll') return 'Collection book reward';
  if (it[3] === 'prestige') return 'Prestige reward';
  if (it[3] === 'creator') return 'Only the creator of Trepong has this';
  if (it[3] === 'gift') return 'A one-of-a-kind gift. Only from a secret code.';
  if (it[3].startsWith('raid:')) return 'Raid loot: ' + RAIDS[it[3].slice(5)].n;
  if (it[3].startsWith('tower:')) return 'Clear floor ' + it[3].slice(6) + ' of the Tower';
  if (it[3].startsWith('ach:')) { const a = ACH.find(x => x[0] === it[3].slice(4)); return 'Achievement: ' + (a ? a[1] : '?'); }
  return '';
}
let myProf = Object.assign({ pb: 'plain', pg: 'night', pt: 'newbie', pe: 'none', sh: [] }, storeJSON('trepong-prof', {}));
function validProf(p) {
  p = p && typeof p === 'object' ? p : {};
  const ok = (k, id, d) => profItem(k, id) ? id : d;
  return { pb: ok('pb', p.pb, 'plain'), pg: ok('pg', p.pg, 'night'), pt: ok('pt', p.pt, 'newbie'), pe: ok('pe', p.pe, 'none'),
    sh: Array.isArray(p.sh) ? p.sh.filter(id => ACH.some(a => a[0] === id)).slice(0, 3) : [],
    sk: Array.isArray(p.sk) ? p.sk.filter(id => typeof id === 'string' && (!stkReady || stickerById(id))).slice(0, 3) : [] };
}
myProf = validProf(myProf);
function saveProf() { store('trepong-prof', JSON.stringify(myProf)); pushProfile(); }
// ----- player level from XP -----
function xpLevel(xp) { xp = xp || 0; let L = 1; while (30*L*(L + 1) <= xp) L++; return L; }
function xpFrac(xp) { const L = xpLevel(xp), lo = 30*(L - 1)*L, hi = 30*L*(L + 1); return clamp(((xp || 0) - lo) / (hi - lo), 0, 1); }
function myCardData() {
  return {
    n: myName(), lk: myLook, he: myHero, hv: heroVariant(myHero), hl: heroLevel(myHero), lv: myLevel(), xf: Math.round(myLvFrac()*100)/100, pr: stats.prest || 0,
    pb: myProf.pb, pg: myProf.pg, pt: myProf.pt, pe: myProf.pe, sh: myProf.sh.slice(), sk: (myProf.sk || []).slice(),
    s: [stats.matches || 0, stats.wins || 0, stats.rallySc || 0, towerCleared(), ACH.filter(achDone).length]
  };
}
function validCard(d) {
  d = d && typeof d === 'object' ? d : {};
  const p = validProf(d), s = Array.isArray(d.s) ? d.s.slice(0, 5).map(v => Math.max(0, Math.floor(+v || 0))) : [0, 0, 0, 0, 0];
  return Object.assign(p, { n: cleanName(d.n) || 'Player', lk: validLook(d.lk), he: HEROES[d.he] ? d.he : 'none', hv: ['std', 'gold', 'shadow'].includes(d.hv) ? d.hv : 'std',
    hl: clamp(Math.floor(+d.hl || 1), 1, 10), lv: clamp(Math.floor(+d.lv || 1), 1, 999), pr: clamp(Math.floor(+d.pr || 0), 0, 12), xf: clamp(+d.xf || 0, 0, 1), s });
}
function pushProfile() { if (net) net.presence({ card: myCardData(), fid: Live.uid || null }).catch(() => {}); if (typeof friendsPublish === 'function') { Friends.pubT = 0; friendsPublish(false); } }
// ----- drawing helpers -----
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function perim(u, x, y, w, h) { // point + inward normal along a rectangle's perimeter, u in 0..1
  const P = 2*(w + h); let d = ((u % 1) + 1) % 1 * P;
  if (d < w) return [x + d, y, 0, 1]; d -= w;
  if (d < h) return [x + w, y + d, -1, 0]; d -= h;
  if (d < w) return [x + w - d, y + h, 0, -1]; d -= w;
  return [x, y + h - d, 1, 0];
}
function drawEmblem(c, id, x, y, r) {
  if (id === 'candycorn') { drawCandyCorn(c, x, y, r); return; }
  if (id === 'forester') { fr_emblem(c, x, y, r); return; }
  if (drawEmblem2(c, id, x, y, r)) return;
  c.save(); c.translate(x, y); c.lineJoin = 'round';
  if (id === 'star') { c.fillStyle = '#FFD84A'; c.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI/2 + k*Math.PI/5, rr2 = k % 2 ? r*0.45 : r; c.lineTo(Math.cos(a)*rr2, Math.sin(a)*rr2); } c.closePath(); c.fill(); }
  else if (id === 'heart') { c.fillStyle = '#FF4F8B'; c.beginPath(); c.moveTo(0, r*0.8); c.bezierCurveTo(-r*1.4, -r*0.1, -r*0.7, -r*1.1, 0, -r*0.4); c.bezierCurveTo(r*0.7, -r*1.1, r*1.4, -r*0.1, 0, r*0.8); c.fill(); }
  else if (id === 'bolt') { c.fillStyle = '#FFE34A'; poly(c, [[r*0.2, -r], [-r*0.6, r*0.1], [-r*0.05, r*0.1], [-r*0.25, r], [r*0.6, -r*0.15], [r*0.05, -r*0.15]]); c.fill(); }
  else if (id === 'crown') { c.fillStyle = '#FFD84A'; poly(c, [[-r, r*0.6], [-r, -r*0.4], [-r*0.5, r*0.05], [0, -r*0.8], [r*0.5, r*0.05], [r, -r*0.4], [r, r*0.6]]); c.fill(); }
  else if (id === 'skull') { c.fillStyle = '#F0ECFF'; c.beginPath(); c.arc(0, -r*0.15, r*0.8, Math.PI, 0); c.lineTo(r*0.55, r*0.45); c.lineTo(-r*0.55, r*0.45); c.closePath(); c.fill(); c.fillRect(-r*0.45, r*0.4, r*0.9, r*0.4); c.fillStyle = '#16112E'; c.beginPath(); c.arc(-r*0.32, -r*0.1, r*0.2, 0, TAU); c.arc(r*0.32, -r*0.1, r*0.2, 0, TAU); c.fill(); }
  else if (id === 'flame') { c.fillStyle = '#FF8A3D'; c.beginPath(); c.moveTo(0, -r); c.bezierCurveTo(r, -r*0.2, r*0.8, r, 0, r); c.bezierCurveTo(-r*0.8, r, -r, -r*0.2, 0, -r); c.fill(); c.fillStyle = '#FFE34A'; c.beginPath(); c.moveTo(0, -r*0.3); c.bezierCurveTo(r*0.45, r*0.1, r*0.4, r*0.85, 0, r*0.85); c.bezierCurveTo(-r*0.4, r*0.85, -r*0.45, r*0.1, 0, -r*0.3); c.fill(); }
  else if (id === 'diamond') { c.fillStyle = '#7FD8FF'; poly(c, [[0, -r], [r*0.85, -r*0.25], [0, r], [-r*0.85, -r*0.25]]); c.fill(); c.fillStyle = 'rgba(255,255,255,0.6)'; poly(c, [[0, -r], [r*0.85, -r*0.25], [0, -r*0.1], [-r*0.85, -r*0.25]]); c.fill(); }
  else if (id === 'triforce') { c.fillStyle = '#FF4F8B'; c.shadowColor = '#FF4F8B'; c.shadowBlur = 8; const s2 = r*0.95; [[0, -s2], [-s2*0.55, 0], [s2*0.55, 0]].forEach(([tx, ty], k) => { c.fillStyle = SEAT_DEFAULT[k]; poly(c, [[tx, ty - s2*0.0], [tx + s2*0.5, ty + s2*0.9], [tx - s2*0.5, ty + s2*0.9]]); c.fill(); }); }
  c.restore();
}
function drawCardBg(c, id, t, W, H) {
  if (id === 'creator') { drawCreatorBg(c, t, W, H); return; }
  if (id === 'oldgrowth') { fr_bg(c, t, W, H); return; }
  if (drawCardBg3(c, id, t, W, H) || drawCardBg2(c, id, t, W, H)) return;
  const lin = (stops) => { const g = c.createLinearGradient(0, 0, W*0.3, H); stops.forEach((s, i) => g.addColorStop(i/(stops.length - 1), s)); return g; };
  if (id === 'sunset') { c.fillStyle = lin(['#FF8A3D', '#FF4F8B', '#4A1A6A']); c.fillRect(0, 0, W, H); }
  else if (id === 'mint') { c.fillStyle = lin(['#4FFFC4', '#1A6B80', '#0C1A2A']); c.fillRect(0, 0, W, H); }
  else if (id === 'carbon') { c.fillStyle = '#16161C'; c.fillRect(0, 0, W, H); for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x += 8) { c.fillStyle = (x/8 + y/8) % 2 ? '#202028' : '#121216'; c.fillRect(x, y, 8, 4); } }
  else if (id === 'grid' || id === 'synthsun') {
    c.fillStyle = lin(['#1A0B3A', '#4A1A6A', '#FF4F8B']); c.fillRect(0, 0, W, H);
    const sy = H*0.42, R = W*0.32; const sg = c.createLinearGradient(0, sy - R, 0, sy + R); sg.addColorStop(0, '#FFE34A'); sg.addColorStop(1, '#FF4F8B');
    c.fillStyle = sg; c.beginPath(); c.arc(W/2, sy, R, Math.PI, 0); c.fill();
    c.fillStyle = '#4A1A6A'; for (let k = 0; k < 6; k++) { const yy = sy - R*0.08 - k*R*0.14 + (id === 'synthsun' ? (t*6 % (R*0.14)) : 0); c.fillRect(W/2 - R, yy, R*2, 2 + k*0.6); }
    c.fillStyle = '#0C0618'; c.fillRect(0, sy, W, H - sy);
    c.strokeStyle = '#FF4F8B'; c.lineWidth = 1;
    for (let k = -8; k <= 8; k++) { c.beginPath(); c.moveTo(W/2 + k*8, sy); c.lineTo(W/2 + k*60, H); c.stroke(); }
    const off = id === 'synthsun' ? (t*0.6) % 1 : 0;
    for (let k = 0; k < 10; k++) { const p = Math.pow((k + off)/10, 2), yy = sy + p*(H - sy); c.globalAlpha = p; c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke(); } c.globalAlpha = 1;
  }
  else if (id === 'mountains') { c.fillStyle = lin(['#2A1A5A', '#5A3A8A', '#FFB23E']); c.fillRect(0, 0, W, H); [['#3A2A6A', 0.45, 40], ['#24184A', 0.6, 30], ['#140C2E', 0.75, 22]].forEach(([col, base, amp], k) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 10) c.lineTo(x, H*base + Math.sin(x*0.03 + k*2)*amp + Math.sin(x*0.011 + k)*amp*0.8); c.lineTo(W, H); c.fill(); }); }
  else if (id === 'neoncity') { c.fillStyle = lin(['#0A0620', '#2A0A40', '#FF4F8B']); c.fillRect(0, 0, W, H); const rnd = seeded(7); for (let x = 0; x < W; x += 22) { const h2 = H*(0.25 + rnd()*0.35); c.fillStyle = '#0A0618'; c.fillRect(x, H - h2, 20, h2); for (let y = H - h2 + 6; y < H - 6; y += 9) for (let wx = x + 3; wx < x + 18; wx += 6) if (rnd() > 0.45) { c.fillStyle = rnd() > 0.5 ? '#FFE34A' : '#3EE6FF'; c.fillRect(wx, y, 3, 4); } } }
  else if (id === 'stars' || id === 'void' || id === 'galaxyl') {
    c.fillStyle = id === 'void' ? '#000' : lin(['#05030F', '#120A2A']); c.fillRect(0, 0, W, H);
    if (id === 'galaxyl') { c.save(); c.translate(W/2, H*0.38); for (let k = 0; k < 260; k++) { const arm = k % 3, d = (k/260)*W*0.7, a = d*0.03 + arm*TAU/3 + t*0.3; c.fillStyle = 'hsla(' + (260 + d*0.4) % 360 + ',90%,' + (70 - d*0.15) + '%,0.8)'; c.fillRect(Math.cos(a)*d, Math.sin(a)*d*0.55, 2, 2); } c.restore(); }
    for (let k = 0; k < 70; k++) { const sp = (k % 3 + 1)*8, x = (k*97.3) % W, y = ((k*53.7) + (id === 'stars' ? t*sp : 0)) % H; c.fillStyle = 'rgba(255,255,255,' + (0.3 + (k % 4)*0.15) + ')'; c.fillRect(x, y, 1.5, 1.5); }
    if (id === 'void') { c.save(); c.translate(W/2, H*0.4); for (let k = 0; k < 120; k++) { const r2 = ((k*13.7 + t*25) % (W*0.6)), a = k*2.4 - t*0.8 + r2*0.02; c.fillStyle = 'rgba(181,124,255,' + (1 - r2/(W*0.6)) + ')'; c.fillRect(Math.cos(a)*r2, Math.sin(a)*r2, 2, 2); } c.strokeStyle = 'rgba(255,79,139,0.5)'; c.lineWidth = 1.5; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(0, 0); let x = 0, y = 0; const a0 = k*1.6 + Math.sin(t)*0.2; for (let q = 0; q < 6; q++) { x += Math.cos(a0 + Math.sin(q*3)*0.6)*16; y += Math.sin(a0 + Math.sin(q*3)*0.6)*16; c.lineTo(x, y); } c.stroke(); } c.restore(); }
  }
  else if (id === 'aurora') { c.fillStyle = lin(['#02101A', '#062A2E', '#0A0A1E']); c.fillRect(0, 0, W, H); for (let b = 0; b < 3; b++) { c.beginPath(); for (let x = 0; x <= W; x += 6) c.lineTo(x, H*(0.22 + b*0.1) + Math.sin(x*0.02 + t*(0.8 + b*0.3) + b)*22); for (let x = W; x >= 0; x -= 6) c.lineTo(x, H*(0.22 + b*0.1) + 40 + Math.sin(x*0.025 + t*(0.6 + b*0.2))*26); c.closePath(); c.fillStyle = ['rgba(79,255,196,0.22)', 'rgba(62,230,255,0.18)', 'rgba(181,124,255,0.16)'][b]; c.fill(); } for (let k = 0; k < 40; k++) { c.fillStyle = 'rgba(255,255,255,0.6)'; c.fillRect((k*71) % W, (k*37) % (H*0.6), 1, 1); } }
  else if (id === 'rain') { c.fillStyle = lin(['#0A0618', '#1A0A30']); c.fillRect(0, 0, W, H); for (let k = 0; k < 60; k++) { const x = (k*37.1) % W, y = ((k*91.3) + t*(220 + (k % 5)*40)) % (H + 40) - 40; c.strokeStyle = ['#FF4F8B', '#3EE6FF', '#B57CFF'][k % 3]; c.globalAlpha = 0.7; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 18); c.stroke(); } c.globalAlpha = 1; }
  else if (id === 'matrixl') { c.fillStyle = '#020A04'; c.fillRect(0, 0, W, H); c.font = '700 11px monospace'; for (let col = 0; col < W/11; col++) { const head = ((col*53.7) + t*(60 + (col % 5)*20)) % (H + 120); for (let k = 0; k < 12; k++) { const y = head - k*12; if (y < 0 || y > H) continue; c.fillStyle = k === 0 ? '#D8FFE4' : 'rgba(60,255,140,' + (1 - k/12) + ')'; c.fillText(String.fromCharCode(0x30A0 + ((col*7 + k*13 + Math.floor(t*4)) % 90)), col*11, y); } } }
  else if (id === 'towerbg') { c.fillStyle = lin(['#2A0A40', '#4A1A6A', '#FFB23E']); c.fillRect(0, 0, W, H); c.save(); c.translate(W/2, H*0.85); c.rotate(t*0.15); for (let k = 0; k < 12; k++) { c.rotate(TAU/12); c.fillStyle = 'rgba(255,216,74,0.10)'; c.beginPath(); c.moveTo(0, 0); c.lineTo(-25, -H); c.lineTo(25, -H); c.fill(); } c.restore(); c.fillStyle = '#140820'; c.beginPath(); c.moveTo(W*0.38, H); c.lineTo(W*0.42, H*0.35); c.lineTo(W*0.5, H*0.22); c.lineTo(W*0.58, H*0.35); c.lineTo(W*0.62, H); c.fill(); c.fillStyle = '#FFD84A'; for (let k = 0; k < 5; k++) c.fillRect(W*0.48, H*0.42 + k*H*0.1, W*0.04, H*0.03); }
  else { const g = c.createRadialGradient(W/2, H*0.35, 10, W/2, H*0.35, H); g.addColorStop(0, '#2A2060'); g.addColorStop(1, '#0C0A1C'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
}
function drawCardBorder(c, id, t, W, H, accent) {
  if (id === 'creator') { drawCreatorBorder(c, t, W, H); return; }
  if (id === 'heartwood') { fr_border(c, t, W, H); return; }
  if (id.startsWith('pframe')) { drawPrestigeFrame(c, +id.slice(6), t, W, H); return; }
  if (drawCardBorder3(c, id, t, W, H, accent) || drawCardBorder2(c, id, t, W, H, accent)) return;
  const pad = 5, x = pad, y = pad, w = W - pad*2, h = H - pad*2, R = 20;
  const stroke = (col, lw) => { c.strokeStyle = col; c.lineWidth = lw; rr(c, x, y, w, h, R); c.stroke(); };
  const lg = (stops) => { const g = c.createLinearGradient(0, 0, W, H); stops.forEach((s, i) => g.addColorStop(i/(stops.length - 1), s)); return g; };
  const corners = (fn) => [[x + 8, y + 8], [x + w - 8, y + 8], [x + w - 8, y + h - 8], [x + 8, y + h - 8]].forEach((p, k) => fn(p[0], p[1], k));
  c.save();
  if (id === 'plain') stroke('#3A3270', 3);
  else if (id === 'steel') { stroke(lg(['#C9D6F2', '#5A6E8A', '#C9D6F2']), 8); c.fillStyle = '#E6EEFF'; corners((px, py) => { c.beginPath(); c.arc(px, py, 2.5, 0, TAU); c.fill(); }); }
  else if (id === 'bronze') { stroke(lg(['#E8A951', '#7A4A1A', '#E8A951']), 8); }
  else if (id === 'neon') { c.shadowColor = '#3EE6FF'; c.shadowBlur = 14; stroke('#3EE6FF', 3); rr(c, x + 6, y + 6, w - 12, h - 12, R - 5); c.strokeStyle = '#FF4F8B'; c.lineWidth = 2; c.stroke(); }
  else if (id === 'circuit') { stroke('#0D6B32', 6); c.strokeStyle = '#3CFF8C'; c.lineWidth = 1.5; for (let k = 0; k < 24; k++) { const [px, py, nx, ny] = perim(k/24, x, y, w, h); c.beginPath(); c.moveTo(px, py); c.lineTo(px + nx*10, py + ny*10); c.stroke(); c.fillStyle = '#3CFF8C'; c.beginPath(); c.arc(px + nx*10, py + ny*10, 1.8, 0, TAU); c.fill(); } }
  else if (id === 'gold') { stroke(lg(['#FFF1A8', '#C9921A', '#FFE58A', '#8A5F0A']), 9); corners((px, py, k) => { c.fillStyle = ['#FF4F8B', '#3EE6FF', '#7CFFB2', '#B57CFF'][k]; poly(c, [[px, py - 5], [px + 5, py], [px, py + 5], [px - 5, py]]); c.fill(); }); }
  else if (id === 'crystal') { stroke(lg(['#E6FDFF', '#7FD8FF', '#B57CFF', '#E6FDFF']), 7); corners((px, py, k) => { c.fillStyle = 'rgba(200,240,255,0.85)'; const sx = k === 0 || k === 3 ? 1 : -1, sy = k < 2 ? 1 : -1; poly(c, [[px - sx*3, py - sy*3], [px + sx*22, py - sy*3], [px - sx*3, py + sy*22]]); c.fill(); }); }
  else if (id === 'royal') { stroke('#4A1A8A', 9); stroke('#FFD84A', 2); corners((px, py) => { c.fillStyle = '#FFD84A'; c.save(); c.translate(px, py); for (let k = 0; k < 4; k++) { c.rotate(Math.PI/2); c.beginPath(); c.ellipse(0, -7, 2.5, 6, 0, 0, TAU); c.fill(); } c.restore(); }); }
  else if (id === 'dragon') { stroke('#5A0A14', 11); for (let k = 0; k < 60; k++) { const [px, py, nx, ny] = perim(k/60, x, y, w, h); c.fillStyle = k % 2 ? '#C9921A' : '#FF5A4A'; c.beginPath(); c.arc(px + nx*2, py + ny*2, 4, 0, TAU); c.fill(); } stroke('#FFD84A', 1.5); }
  else if (id === 'pulse') { const a = 0.5 + 0.5*Math.sin(t*4); c.shadowColor = accent; c.shadowBlur = 10 + 16*a; stroke(accent, 3 + 3*a); }
  else if (id === 'rainbowe') { for (let k = 0; k < 120; k++) { const [px, py] = perim(k/120, x, y, w, h); c.fillStyle = 'hsl(' + ((k*3 + t*120) % 360) + ',95%,62%)'; c.beginPath(); c.arc(px, py, 4.5, 0, TAU); c.fill(); } }
  else if (id === 'flame') { stroke('#5A1A08', 6); c.shadowColor = '#FF8A3D'; c.shadowBlur = 12; for (let k = 0; k < 70; k++) { const [px, py, nx, ny] = perim(k/70, x, y, w, h), fl = 6 + 6*Math.abs(Math.sin(t*6 + k*1.7)); c.fillStyle = k % 2 ? '#FF8A3D' : '#FFE34A'; c.beginPath(); c.moveTo(px - ny*4 - nx*1, py + nx*4 - ny*1); c.quadraticCurveTo(px - nx*fl*0.5, py - ny*fl*0.5, px - nx*fl, py - ny*fl); c.quadraticCurveTo(px - nx*fl*0.5, py - ny*fl*0.5, px + ny*4 - nx*1, py - nx*4 - ny*1); c.fill(); } }
  else if (id === 'frost') { stroke(lg(['#E6FDFF', '#7FD8FF']), 6); c.fillStyle = 'rgba(230,253,255,0.9)'; for (let k = 0; k < 16; k++) { const xx = x + 20 + k*(w - 40)/15, L = 6 + ((k*7) % 5)*3; poly(c, [[xx - 3, y + 3], [xx + 3, y + 3], [xx, y + 3 + L]]); c.fill(); } for (let k = 0; k < 24; k++) { const xx = (k*37.7) % W, yy = ((k*61.3) + t*20) % H; c.fillRect(xx, yy, 2, 2); } }
  else if (id === 'lightning') { stroke('#9FF3FF', 4); c.shadowColor = '#9FF3FF'; c.shadowBlur = 14; c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; for (let b = 0; b < 3; b++) { const u0 = (t*0.35 + b/3) % 1; c.beginPath(); for (let k = 0; k <= 10; k++) { const [px, py, nx, ny] = perim(u0 + k*0.012, x, y, w, h), j = (Math.random() - 0.5)*8; k ? c.lineTo(px + nx*j, py + ny*j) : c.moveTo(px, py); } c.stroke(); } }
  else if (id === 'cosmic') { stroke(lg(['#1A0B3A', '#B57CFF', '#1A0B3A']), 8); for (let k = 0; k < 14; k++) { const [px, py] = perim(t*0.05 + k/14, x, y, w, h); c.fillStyle = k % 3 ? '#FFFFFF' : '#FF4F8B'; c.shadowColor = '#B57CFF'; c.shadowBlur = 10; star4(c, px, py, 3 + (k % 3)); } }
  else if (id === 'champion') { stroke(lg(['#FFF6B0', '#FFD84A', '#C9921A', '#FFF6B0']), 10); c.shadowColor = '#FFD84A'; c.shadowBlur = 18; stroke('#FFFFFF', 1.5); corners((px, py) => { c.save(); c.translate(px, py); c.rotate(t); c.fillStyle = 'rgba(255,246,176,0.9)'; star4(c, 0, 0, 7); c.restore(); }); c.font = '22px system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('👑', W/2, y + 2); }
  c.restore();
}
const heroCardCv = document.createElement('canvas'); heroCardCv.width = 520; heroCardCv.height = 300;
// Draws a full profile card into canvas c (W x H pixels, portrait 3:4)
function drawCard(c, d, t) {
  const W = c.canvas.width, H = c.canvas.height, s = W/300;
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.scale(s, s);
  const CW = 300, CH = 400;
  c.save(); rr(c, 0, 0, CW, CH, 22); c.clip();
  drawCardBg(c, d.pg, t, CW, CH);
  const shade = c.createLinearGradient(0, 165, 0, CH), sk = d.pg === 'oldgrowth' ? 0.62 : 1; shade.addColorStop(0, 'rgba(8,6,20,0)'); shade.addColorStop(0.25, 'rgba(8,6,20,' + 0.72*sk + ')'); shade.addColorStop(1, 'rgba(8,6,20,' + 0.9*sk + ')');
  c.fillStyle = shade; c.fillRect(0, 150, CW, CH - 150);
  if (d.pg === 'creator') drawCreatorOverlay(c, t, CW, CH);
  // the paddle on a soft spotlight (no hero portrait: the card is about you, your paddle and your style)
  { const sg = c.createRadialGradient(150, 112, 4, 150, 112, 120); sg.addColorStop(0, 'rgba(255,255,255,0.16)'); sg.addColorStop(0.5, 'rgba(255,255,255,0.05)'); sg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = sg; c.fillRect(0, 0, CW, 200); }
  c.fillStyle = 'rgba(0,0,0,0.35)'; c.beginPath(); c.ellipse(150, 152, 74, 7, 0, 0, TAU); c.fill();
  c.save(); c.translate(150, 140); c.scale(3.3, 3.3); drawPaddleLocal(c, d.lk, 18, t, [Math.sin(t*0.7)*0.5, -1], {}, 12); c.restore();
  // level badge
  c.save(); drawPrestigeBadge(c, d.pr || 0, d.lv, 256, 40, 17, t);
  c.fillStyle = PRESTIGE_COLS[d.pr || 0]; c.font = '700 7px "Chakra Petch", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(d.pr ? 'PRESTIGE ' + ROMAN[d.pr] : 'LEVEL', 256, 15); c.restore();
  // name + emblem + title
  c.textAlign = 'center'; c.textBaseline = 'alphabetic';
  c.font = '22px "Rubik Mono One", monospace';
  const nm = d.n.toUpperCase(), nw = c.measureText(nm).width;
  c.fillStyle = '#F0ECFF'; c.fillText(nm, 150 + (d.pe !== 'none' ? 12 : 0), 204);
  if (d.pe !== 'none') { const big = d.pe === 'forester'; drawEmblem(c, d.pe, 150 - nw/2 - (big ? 8 : 4), big ? 192 : 196, big ? 15 : 10); }
  const ti = profItem('pt', d.pt); c.font = '700 12px "Chakra Petch", system-ui'; c.fillStyle = d.pt === 'creator' ? cre_holo(c, 150, 218, t*1.5, 1) : d.pt === 'skogsmastare' ? fr_titleFill(c, 150, t) : RAR6[ti[2]][1];
  if (d.pt === 'skogsmastare') { c.save(); c.shadowColor = 'rgba(160,255,170,0.8)'; c.shadowBlur = 8 + 4*Math.sin(t*1.6); c.fillText(ti[1].toUpperCase(), 150, 222); c.restore(); } else c.fillText(ti[1].toUpperCase(), 150, 222);
  // xp bar
  c.fillStyle = 'rgba(255,255,255,0.12)'; rr(c, 40, 232, 220, 6, 3); c.fill();
  const xg = c.createLinearGradient(40, 0, 260, 0); xg.addColorStop(0, '#3EE6FF'); xg.addColorStop(1, '#FFD84A'); c.fillStyle = xg; rr(c, 40, 232, Math.max(6, 220*d.xf), 6, 3); c.fill();
  // stats
  const S = [['MATCHES', d.s[0]], ['WINS', d.s[1]], ['WIN %', d.s[0] ? Math.round(100*d.s[1]/d.s[0]) + '%' : '–'], ['BEST RALLY', d.s[2]], ['TOWER FLOOR', d.s[3]], ['ACHIEVEMENTS', d.s[4] + '/' + ACH.length]];
  S.forEach(([lab, val], k) => { const cx = 60 + (k % 3)*90, cy = 266 + Math.floor(k/3)*40;
    c.fillStyle = 'rgba(255,255,255,0.06)'; rr(c, cx - 40, cy - 14, 80, 34, 8); c.fill();
    c.fillStyle = '#F0ECFF'; c.font = '14px "Rubik Mono One", monospace'; c.fillText(typeof val === 'number' ? fmt(val) : val, cx, cy + 4);
    c.fillStyle = '#A49CD0'; c.font = '700 7px "Chakra Petch", system-ui'; c.fillText(lab, cx, cy + 15); });
  // showcase medals
  const shs = d.sh.length ? d.sh : [];
  if (shs.length) { shs.forEach((id, k) => { const a = ACH.find(x => x[0] === id); const cx = 150 + (k - (shs.length - 1)/2)*92, cy = 360;
    c.fillStyle = '#FFD84A'; c.beginPath(); c.arc(cx - 30, cy, 9, 0, TAU); c.fill(); c.fillStyle = '#8A5F0A'; star4(c, cx - 30, cy, 5);
    c.textAlign = 'left'; c.fillStyle = '#F0ECFF'; c.font = '700 8px "Chakra Petch", system-ui'; c.fillText((a ? a[1] : '').slice(0, 14), cx - 18, cy + 3); c.textAlign = 'center'; }); }
  else { c.fillStyle = '#6B6490'; c.font = '700 9px "Chakra Petch", system-ui'; c.fillText('No achievements showcased yet', 150, 364); }
  c.restore();
  drawCardBorder(c, d.pb, t, CW, CH, d.lk.c);
  if (d.sk && d.sk.length) drawCardStickers(c, d.sk, t);
  c.restore();
}
// ----- profile screen -----
let profTab = 0, profPreview = null, profBuy = null, viewCard = null;
function openProfile() { profPreview = { ...myProf }; profBuy = null; showScreen('profile'); buildProfTabs(); buildProfGrid(); syncProf(); }
function buildProfTabs() {
  const box = $('#profTabs'); box.textContent = '';
  PROF_TABS.forEach(([k, n], i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = n; b.dataset.i = i; b.addEventListener('click', () => { profTab = i; profBuy = null; buildProfGrid(); syncProf(); }); box.append(b); });
}
function profTabItems() {
  const [k, , anim] = PROF_TABS[profTab];
  if (k === 'sh') return ACH.filter(a => achDone(a)).map(a => [a[0], a[1], 'r', 'ach']);
  return PROF[k].filter(it => anim === undefined || !!it[4] === !!anim);
}
function buildProfGrid() {
  const grid = $('#profGrid'); grid.textContent = '';
  const [k] = PROF_TABS[profTab], items = profTabItems();
  if (k === 'sh' && !items.length) { const p = document.createElement('p'); p.className = 'note'; p.textContent = 'Complete achievements to show them off on your card.'; grid.append(p); return; }
  for (const it of items) {
    const b = document.createElement('button'); b.type = 'button'; b.dataset.id = it[0];
    const cvs = document.createElement('canvas'); cvs.width = 88; cvs.height = 60;
    const nm = document.createElement('span'); nm.textContent = it[1];
    const rar = document.createElement('span'); rar.className = 'rar'; rar.textContent = k === 'sh' ? '' : RAR6[it[2]][0]; rar.style.color = RAR6[it[2]][1];
    const pr = document.createElement('span'); pr.className = 'pr';
    b.append(cvs, nm, rar, pr); b.style.borderColor = k === 'sh' ? '' : RAR6[it[2]][1] + '66';
    b.addEventListener('click', () => pickProf(k, it[0]));
    grid.append(b);
  }
}
function drawProfChip(cvs, k, id, t) {
  const c = cvs.getContext('2d'), w = cvs.width, h = cvs.height;
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, w, h);
  if (k === 'pg') { c.save(); rr(c, 4, 2, w - 8, h - 4, 8); c.clip(); c.translate(4, 2); c.scale((w - 8)/300, (h - 4)/200); drawCardBg(c, id, t, 300, 200); c.restore(); }
  else if (k === 'pb') { c.save(); c.translate(4, 2); c.scale((w - 8)/240, (h - 4)/160); c.fillStyle = '#16112E'; rr(c, 0, 0, 240, 160, 22); c.fill(); drawCardBorder(c, id, t, 240, 160, myLook.c); c.restore(); }
  else if (k === 'pe') { if (id === 'none') { c.fillStyle = '#6B6490'; c.font = '700 12px system-ui'; c.textAlign = 'center'; c.fillText('—', w/2, h/2 + 4); } else drawEmblem(c, id, w/2, h/2, 18); }
  else if (k === 'pt') { const it = profItem('pt', id); c.fillStyle = id === 'skogsmastare' ? fr_titleFill(c, w/2, t) : RAR6[it[2]][1]; c.font = '700 13px "Chakra Petch", system-ui'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('“' + (it[1].length > 11 ? it[1].slice(0, 10) + '…' : it[1]) + '”', w/2, h/2); }
  else if (k === 'sh') { c.fillStyle = '#FFD84A'; c.beginPath(); c.arc(w/2, h/2, 16, 0, TAU); c.fill(); c.fillStyle = '#8A5F0A'; star4(c, w/2, h/2, 9); }
}
function pickProf(k, id) {
  if (k === 'sh') {
    const i = profPreview.sh.indexOf(id);
    if (i >= 0) profPreview.sh.splice(i, 1); else { if (profPreview.sh.length >= 3) profPreview.sh.shift(); profPreview.sh.push(id); }
    myProf.sh = profPreview.sh.slice(); saveProf(); syncProf(); return;
  }
  profPreview[k] = id;
  if (ownsProf(k, id)) { myProf[k] = id; saveProf(); profBuy = null; tone(660, 0.06, 'sine', 0.05); }
  else profBuy = [k, id];
  syncProf();
}
function syncProf() {
  $('#profCoins').textContent = fmt(coins);
  $('#profTabs').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.i === profTab)));
  const [k] = PROF_TABS[profTab];
  $('#profGrid').querySelectorAll('button').forEach(b => {
    const id = b.dataset.id, own = k === 'sh' ? true : ownsProf(k, id), it = k === 'sh' ? null : profItem(k, id);
    const sel = k === 'sh' ? profPreview.sh.includes(id) : profPreview[k] === id;
    b.setAttribute('aria-pressed', String(sel)); b.classList.toggle('locked', !own);
    const pr = b.querySelector('.pr'); pr.textContent = own ? '' : (profPrice(it) != null ? profPrice(it) : it[3] === 'chest' ? 'Chest' : it[3].startsWith('tower:') ? 'Tower ' + it[3].slice(6) : it[3].startsWith('adv:') ? 'Adventure' : it[3] === 'bp' ? 'Pass' : it[3].startsWith('raid:') ? 'Raid' : it[3] === 'gift' ? 'Gift' : 'Achievement');
    pr.classList.toggle('ex', !own && profPrice(it) == null);
  });
  const bar = $('#profBuyBar');
  if (profBuy) {
    const it = profItem(profBuy[0], profBuy[1]), price = profPrice(it);
    bar.hidden = false;
    if (price == null) { $('#profBuyTxt').textContent = it[1] + ' (' + RAR6[it[2]][0].toLowerCase() + '): ' + profSourceText(it) + '.'; $('#btnProfBuy').disabled = true; }
    else { $('#profBuyTxt').textContent = it[1] + ' (' + RAR6[it[2]][0].toLowerCase() + ') costs ' + price + ' coins.' + (coins < price ? ' You need ' + (price - coins) + ' more.' : ''); $('#btnProfBuy').disabled = coins < price; }
  } else bar.hidden = true;
}
function buyProf() {
  if (!profBuy) return;
  const [k, id] = profBuy, it = profItem(k, id), price = profPrice(it);
  if (price == null || coins < price) return;
  coins -= price; owned.add(k + ':' + id); saveWallet(); myProf[k] = id; saveProf(); sfx.coin(); buzz(20); track('buys');
  toast(it[1] + ' is yours!'); profBuy = null; syncProf();
}
function previewCardData() { const d = myCardData(); if (profPreview) Object.assign(d, { pb: profPreview.pb, pg: profPreview.pg, pt: profPreview.pt, pe: profPreview.pe, sh: profPreview.sh }); return d; }
function showCardOf(d, fid, n) { viewCard = validCard(d); viewFid = fid || null; viewFn = n || ''; $('#cardView').hidden = false; if (typeof syncCardAdd === 'function') syncCardAdd(); }
var viewFid = null, viewFn = '';

