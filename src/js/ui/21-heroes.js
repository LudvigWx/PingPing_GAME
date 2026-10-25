// ---------- hero portraits ----------
const HERO_INFO = {
  none:     { title: 'Just you and the paddle', col: '#A49CD0' },
  kronos:   { title: 'Master of time',        col: '#FFD84A' },
  twin:     { title: 'The divided soul',   col: '#FF4F8B' },
  warden:   { title: 'The last wall',     col: '#3EE6FF' },
  storm:    { title: 'Daughter of thunder',       col: '#FFE34A' },
  graviton: { title: 'Devourer of light',    col: '#B57CFF' }
};
function gear(c, x, y, r, teeth, rot, col) {
  c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = col; c.beginPath();
  for (let k = 0; k < teeth*2; k++) { const a = k/(teeth*2)*TAU, rr = k % 2 ? r*0.78 : r; c.lineTo(Math.cos(a)*rr, Math.sin(a)*rr); }
  c.closePath(); c.fill(); c.fillStyle = '#0A0A26'; c.beginPath(); c.arc(0, 0, r*0.35, 0, TAU); c.fill(); c.restore();
}
function glowDot(c, x, y, r, col, blur) { c.save(); c.shadowColor = col; c.shadowBlur = blur; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); }
// Draws a hero bust in a 100x100 box centred in the canvas; t = time in seconds.
function drawHero(c, id, Wc, Hc, t, sel, variant) {
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const bgs = { none: ['#1A1636', '#0C0A1C'], kronos: ['#2A2A6A', '#0A0A26'], twin: ['#3A1240', '#0C0A1C'], warden: ['#0E3A4A', '#06121C'], storm: ['#3A1A5A', '#0C0618'], graviton: ['#1A0A30', '#030108'] }[id];
  const g = c.createRadialGradient(Wc/2, Hc*0.45, 10, Wc/2, Hc*0.45, Wc*0.7); g.addColorStop(0, bgs[0]); g.addColorStop(1, bgs[1]);
  c.fillStyle = g; c.fillRect(0, 0, Wc, Hc);
  const s = Hc/100; c.translate((Wc - 100*s)/2, 0); c.scale(s, s);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const pop = sel ? 1 + 0.06*Math.max(0, 1 - sel*3)*Math.sin(sel*30) : 1;
  c.translate(50, 60); c.scale(pop, pop); c.translate(-50, -60);
  const breathe = Math.sin(t*2)*0.8;
  if (id === 'none') {
    c.fillStyle = '#2E2656'; c.beginPath(); c.arc(50, 40, 15, 0, TAU); c.fill();
    c.beginPath(); c.moveTo(22, 100); c.quadraticCurveTo(24, 60, 50, 58); c.quadraticCurveTo(76, 60, 78, 100); c.fill();
    c.fillStyle = '#A49CD0'; c.font = '700 20px system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', 50, 41);
  } else if (id === 'kronos') {
    // giant clock behind
    c.save(); c.globalAlpha = 0.55; c.strokeStyle = '#FFD84A'; c.lineWidth = 1.2; c.beginPath(); c.arc(50, 44, 40, 0, TAU); c.stroke();
    for (let k = 0; k < 12; k++) { const a = k/12*TAU; c.beginPath(); c.moveTo(50 + Math.cos(a)*35, 44 + Math.sin(a)*35); c.lineTo(50 + Math.cos(a)*39, 44 + Math.sin(a)*39); c.stroke(); }
    c.lineWidth = 1.6; c.beginPath(); c.moveTo(50, 44); c.lineTo(50 + Math.cos(t*0.8 - 1.57)*30, 44 + Math.sin(t*0.8 - 1.57)*30); c.stroke();
    c.beginPath(); c.moveTo(50, 44); c.lineTo(50 + Math.cos(t*0.07 - 1.57)*20, 44 + Math.sin(t*0.07 - 1.57)*20); c.stroke(); c.restore();
    gear(c, 16, 22, 7, 8, t*0.8, 'rgba(255,216,74,0.5)'); gear(c, 86, 70, 9, 10, -t*0.6, 'rgba(255,216,74,0.4)'); gear(c, 82, 18, 5, 7, t*1.3, 'rgba(255,216,74,0.45)');
    // cloak + hood
    c.fillStyle = '#1C2260'; c.beginPath(); c.moveTo(16, 100); c.quadraticCurveTo(22, 58, 36, 50); c.quadraticCurveTo(34, 26, 50, 16 + breathe*0.3); c.quadraticCurveTo(66, 26, 64, 50); c.quadraticCurveTo(78, 58, 84, 100); c.closePath(); c.fill();
    c.strokeStyle = '#FFD84A'; c.lineWidth = 1; c.beginPath(); c.moveTo(36, 50); c.quadraticCurveTo(34, 26, 50, 16 + breathe*0.3); c.quadraticCurveTo(66, 26, 64, 50); c.stroke();
    c.fillStyle = '#05061A'; c.beginPath(); c.ellipse(50, 40, 11, 13, 0, 0, TAU); c.fill();
    const blink = (t % 4) < 0.1 ? 0.2 : 1;
    c.save(); c.scale(1, 1); glowDot(c, 45.5, 40, 1.8*blink, '#FFE58A', 8); glowDot(c, 54.5, 40, 1.8*blink, '#FFE58A', 8); c.restore();
    // hourglass on chest
    c.strokeStyle = '#FFD84A'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(43, 64); c.lineTo(57, 64); c.lineTo(50, 74); c.lineTo(57, 84); c.lineTo(43, 84); c.lineTo(50, 74); c.closePath(); c.stroke();
    const sand = (t*0.25) % 1; c.fillStyle = '#FFE58A';
    c.beginPath(); c.moveTo(45 + 5*sand, 65 + 8*sand); c.lineTo(55 - 5*sand, 65 + 8*sand); c.lineTo(50, 73); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(50, 83 - 8*sand); c.lineTo(56, 83); c.lineTo(44, 83); c.closePath(); c.fill();
    c.fillRect(49.6, 73, 0.8, 10);
  } else if (id === 'twin') {
    // ghost copies
    c.save(); c.globalAlpha = 0.18 + 0.08*Math.sin(t*3); c.fillStyle = '#3EE6FF'; c.beginPath(); c.arc(28 - Math.sin(t)*2, 44, 18, 0, TAU); c.fill(); c.fillStyle = '#FF4F8B'; c.beginPath(); c.arc(72 + Math.sin(t)*2, 44, 18, 0, TAU); c.fill(); c.restore();
    // shoulders
    c.fillStyle = '#1A6B80'; c.beginPath(); c.moveTo(18, 100); c.quadraticCurveTo(22, 70, 50, 68); c.lineTo(50, 100); c.fill();
    c.fillStyle = '#80204A'; c.beginPath(); c.moveTo(82, 100); c.quadraticCurveTo(78, 70, 50, 68); c.lineTo(50, 100); c.fill();
    // split head
    c.fillStyle = '#3EE6FF'; c.beginPath(); c.arc(50, 44, 21, Math.PI/2, Math.PI*1.5); c.fill();
    c.fillStyle = '#FF4F8B'; c.beginPath(); c.arc(50, 44, 21, -Math.PI/2, Math.PI/2); c.fill();
    c.strokeStyle = '#ffffff'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(50, 21); for (let k = 1; k <= 8; k++) c.lineTo(50 + (k % 2 ? 2 : -2), 21 + k*5.8); c.stroke();
    // happy left eye, angry right eye
    c.strokeStyle = '#06122A'; c.lineWidth = 2.2; c.beginPath(); c.arc(41, 42, 4, Math.PI*1.1, Math.PI*1.9); c.stroke();
    c.fillStyle = '#2A0614'; c.beginPath(); c.ellipse(59, 42, 3.2, 3.6, 0, 0, TAU); c.fill(); glowDot(c, 59 + Math.sin(t*2), 42, 1.1, '#FFE34A', 5);
    c.lineWidth = 1.8; c.beginPath(); c.moveTo(54, 35); c.lineTo(64, 38); c.stroke();
    // mouth: half smile, half snarl
    c.strokeStyle = '#06122A'; c.beginPath(); c.moveTo(38, 52); c.quadraticCurveTo(44, 58, 50, 54); c.stroke();
    c.strokeStyle = '#2A0614'; c.beginPath(); c.moveTo(50, 54); c.lineTo(54, 52); c.lineTo(57, 55); c.lineTo(61, 51); c.stroke();
  } else if (id === 'warden') {
    // pauldrons + body
    c.fillStyle = '#2A3A50'; c.beginPath(); c.moveTo(14, 100); c.quadraticCurveTo(18, 66, 50, 64); c.quadraticCurveTo(82, 66, 86, 100); c.fill();
    c.fillStyle = '#5A6E8A'; c.beginPath(); c.ellipse(24, 70, 13, 9, -0.3, 0, TAU); c.fill(); c.beginPath(); c.ellipse(76, 70, 13, 9, 0.3, 0, TAU); c.fill();
    // plume
    c.fillStyle = '#FF4A5E'; c.beginPath(); c.moveTo(50, 22); c.quadraticCurveTo(70 + Math.sin(t*3)*2, 6, 74 + Math.sin(t*3)*3, 18); c.quadraticCurveTo(62, 16, 52, 26); c.fill();
    // helmet
    const hg = c.createLinearGradient(36, 22, 64, 60); hg.addColorStop(0, '#C9D6F2'); hg.addColorStop(1, '#5A6E8A');
    c.fillStyle = hg; c.beginPath(); if (c.roundRect) c.roundRect(35, 22, 30, 38, 10); else c.rect(35, 22, 30, 38); c.fill();
    c.fillStyle = '#06121C'; c.fillRect(37, 37, 26, 6);
    const scan = 38 + ((Math.sin(t*2) + 1)/2)*22; c.save(); c.shadowColor = '#3EE6FF'; c.shadowBlur = 10; c.fillStyle = '#3EE6FF'; c.fillRect(37, 38.5, 26, 3); c.fillStyle = '#E6FDFF'; c.fillRect(scan - 2, 38, 4, 4); c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.4)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(50, 44); c.lineTo(50, 58); c.stroke();
    // tower shield with the triangle emblem
    c.fillStyle = '#1A4A66'; c.strokeStyle = '#3EE6FF'; c.lineWidth = 1.4; c.beginPath();
    c.moveTo(50, 62); c.quadraticCurveTo(66, 62, 68, 66); c.lineTo(66, 88); c.quadraticCurveTo(60, 98, 50, 101); c.quadraticCurveTo(40, 98, 34, 88); c.lineTo(32, 66); c.quadraticCurveTo(34, 62, 50, 62); c.closePath(); c.fill(); c.stroke();
    c.save(); c.shadowColor = '#3EE6FF'; c.shadowBlur = 8 + 4*Math.sin(t*3); c.strokeStyle = '#9FF3FF'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(50, 70); c.lineTo(59, 87); c.lineTo(41, 87); c.closePath(); c.stroke(); c.restore();
  } else if (id === 'storm') {
    // flashing bolts
    if (Math.sin(t*5.3) > 0.85) { c.save(); c.strokeStyle = '#FFF6B0'; c.lineWidth = 1.4; c.shadowColor = '#FFE34A'; c.shadowBlur = 12; c.beginPath(); c.moveTo(12, 0); c.lineTo(20, 18); c.lineTo(14, 20); c.lineTo(24, 40); c.stroke(); c.beginPath(); c.moveTo(90, 4); c.lineTo(82, 22); c.lineTo(88, 24); c.lineTo(78, 42); c.stroke(); c.restore(); }
    // lightning hair
    c.save(); c.strokeStyle = '#FFE34A'; c.lineWidth = 1.6; c.shadowColor = '#FFE34A'; c.shadowBlur = 8;
    for (let k = 0; k < 9; k++) {
      const a = Math.PI*1.05 + k/8*Math.PI*0.9, j = Math.sin(t*9 + k*2)*1.5;
      c.beginPath(); c.moveTo(50 + Math.cos(a)*14, 44 + Math.sin(a)*16);
      for (let q = 1; q <= 3; q++) c.lineTo(50 + Math.cos(a + (q % 2 ? 0.12 : -0.12))*(14 + q*8) + j, 44 + Math.sin(a)*(16 + q*8));
      c.stroke();
    }
    c.restore();
    // cloud cloak
    c.fillStyle = '#5A4A8A'; [[22, 92, 14], [38, 86, 15], [62, 86, 15], [78, 92, 14], [50, 96, 14]].forEach(q => { c.beginPath(); c.arc(q[0], q[1] + Math.sin(t*1.5 + q[0])*0.8, q[2], 0, TAU); c.fill(); });
    c.fillStyle = '#7A6AAA'; [[30, 80, 9], [70, 80, 9], [50, 78, 10]].forEach(q => { c.beginPath(); c.arc(q[0], q[1], q[2], 0, TAU); c.fill(); });
    // collar of lightning
    c.save(); c.strokeStyle = '#FFE34A'; c.lineWidth = 1.2; c.shadowColor = '#FFE34A'; c.shadowBlur = 6;
    c.beginPath(); c.moveTo(34, 70); for (let k = 1; k <= 8; k++) c.lineTo(34 + k*4, 70 + (k % 2 ? -4 : 0) + Math.sin(t*10 + k)*0.6); c.stroke(); c.restore();
    // dark hair mass behind the face
    c.fillStyle = '#2A1250'; c.beginPath(); c.moveTo(34, 62); c.quadraticCurveTo(28, 30, 50, 26); c.quadraticCurveTo(72, 30, 66, 62); c.quadraticCurveTo(50, 52, 34, 62); c.fill();
    // face with a pointed chin
    const fg = c.createLinearGradient(40, 32, 60, 64); fg.addColorStop(0, '#F0EAFF'); fg.addColorStop(1, '#A898E0');
    c.fillStyle = fg; c.beginPath(); c.moveTo(38, 40); c.quadraticCurveTo(38, 31, 50, 31); c.quadraticCurveTo(62, 31, 62, 40); c.quadraticCurveTo(61, 54, 50, 63); c.quadraticCurveTo(39, 54, 38, 40); c.fill();
    // fringe
    c.fillStyle = '#2A1250'; c.beginPath(); c.moveTo(38, 39); c.lineTo(42, 32); c.lineTo(45, 37); c.lineTo(49, 30); c.lineTo(52, 36); c.lineTo(57, 31); c.lineTo(62, 39); c.quadraticCurveTo(62, 30, 50, 29); c.quadraticCurveTo(38, 30, 38, 39); c.fill();
    // glowing eyes with light streaks
    c.save(); c.shadowColor = '#FFE34A'; c.shadowBlur = 10; c.fillStyle = '#FFF6B0';
    c.beginPath(); c.moveTo(41.5, 44); c.quadraticCurveTo(45, 41.5, 47.5, 44.5); c.quadraticCurveTo(45, 45.5, 41.5, 44); c.fill();
    c.beginPath(); c.moveTo(58.5, 44); c.quadraticCurveTo(55, 41.5, 52.5, 44.5); c.quadraticCurveTo(55, 45.5, 58.5, 44); c.fill();
    c.globalAlpha = 0.5 + 0.5*Math.sin(t*6); c.strokeStyle = '#FFE34A'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(41, 44); c.lineTo(33, 42); c.moveTo(59, 44); c.lineTo(67, 42); c.stroke(); c.restore();
    // cheek bolt + smirk
    c.strokeStyle = '#FFB23E'; c.lineWidth = 0.9; c.beginPath(); c.moveTo(56, 48); c.lineTo(58.5, 51); c.lineTo(56.5, 51.5); c.lineTo(59, 55); c.stroke();
    c.strokeStyle = '#3A1A5A'; c.lineWidth = 1.1; c.beginPath(); c.moveTo(46, 56); c.quadraticCurveTo(50, 58, 54.5, 55); c.stroke();
  } else if (id === 'graviton') {
    for (let k = 0; k < 30; k++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + 0.3*Math.sin(t + k)) + ')'; c.fillRect((k*37) % 100, (k*53) % 100, 0.6, 0.6); }
    // orbit behind
    const orbit = (front) => { for (let k = 0; k < 3; k++) { const a = t*0.9 + k*TAU/3, x = 50 + Math.cos(a)*36, y = 56 + Math.sin(a)*10; if ((Math.sin(a) > 0) !== front) continue; c.fillStyle = ['#FF8A3D', '#4FA8FF', '#7CFFB2'][k]; c.beginPath(); c.arc(x, y, 3 + k*0.6, 0, TAU); c.fill(); } };
    c.strokeStyle = 'rgba(181,124,255,0.35)'; c.lineWidth = 0.6; c.beginPath(); c.ellipse(50, 56, 36, 10, 0, 0, TAU); c.stroke();
    orbit(false);
    // robe
    c.fillStyle = '#1E0A3A'; c.strokeStyle = '#B57CFF'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(18, 100); c.quadraticCurveTo(26, 56, 38, 48); c.quadraticCurveTo(38, 22, 50, 18 + breathe*0.3); c.quadraticCurveTo(62, 22, 62, 48); c.quadraticCurveTo(74, 56, 82, 100); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#000'; c.beginPath(); c.ellipse(50, 38, 9, 11, 0, 0, TAU); c.fill();
    c.fillStyle = '#ffffff'; star4(c, 46.5, 37, 1.8); star4(c, 53.5, 37, 1.8);
    // black hole in the chest
    const bh = c.createRadialGradient(50, 72, 0, 50, 72, 13); bh.addColorStop(0, '#000'); bh.addColorStop(0.45, '#000'); bh.addColorStop(0.65, 'rgba(255,140,60,0.9)'); bh.addColorStop(1, 'rgba(181,124,255,0)');
    c.fillStyle = bh; c.beginPath(); c.arc(50, 72, 13, 0, TAU); c.fill();
    c.save(); c.translate(50, 72); c.rotate(t*1.5); c.strokeStyle = 'rgba(255,190,120,0.8)'; c.lineWidth = 0.9; c.beginPath(); c.ellipse(0, 0, 11, 3.5, 0, 0, TAU); c.stroke(); c.restore();
    orbit(true);
  }
  c.restore();
  if (variant && variant !== 'std') applyVariant(c, Wc, Hc, variant, t);
}
let heroSelT = 0, heroPop = null;
function drawHeroPop(dt) {
  if (!heroPop) return;
  heroPop.t += dt; const t = heroPop.t; if (t > 1.9) { heroPop = null; return; }
  const inX = t < 0.25 ? -170 + 186*(t/0.25) : t > 1.6 ? 16 - 186*((t - 1.6)/0.3) : 16;
  const w = 150, h = 105, y = H*0.58;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.save(); ctx.translate(inX, y);
  const oc = heroPop.cv || (heroPop.cv = document.createElement('canvas'));
  oc.width = Math.round(w*DPR); oc.height = Math.round(h*DPR);
  drawHero(oc.getContext('2d'), heroPop.id, oc.width, oc.height, clock, 0, heroPop.v);
  ctx.save(); ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(0, 0, w, h, 12); else ctx.rect(0, 0, w, h); ctx.clip();
  ctx.drawImage(oc, 0, 0, w, h); ctx.restore();
  ctx.setTransform(DPR, 0, 0, DPR, inX*DPR, y*DPR);
  ctx.strokeStyle = HERO_INFO[heroPop.id].col; ctx.lineWidth = 2; ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(0, 0, w, h, 12); else ctx.rect(0, 0, w, h); ctx.stroke();
  ctx.fillStyle = 'rgba(8,6,20,0.8)'; ctx.fillRect(1, h - 24, w - 2, 23);
  ctx.font = '12px "Rubik Mono One", monospace'; ctx.fillStyle = HERO_INFO[heroPop.id].col; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(HEROES[heroPop.id][0].toUpperCase(), 9, h - 12);
  if (heroPop.line) { ctx.font = '700 12px "Chakra Petch", system-ui, sans-serif'; ctx.fillStyle = '#F0ECFF'; ctx.fillText('”' + heroPop.line + '”', 2, h + 16); }
  ctx.restore();
}

// ---------- hero levels, variants & voices ----------
const HERO_XP = [0, 30, 80, 150, 250, 380, 550, 760, 1000, 1300];
function heroXp(id) { return stats['hx_' + id] || 0; }
function heroLevel(id) { if (!HEROES[id] || id === 'none') return 1; const x = heroXp(id); let L = 1; while (L < 10 && x >= HERO_XP[L]) L++; return L; }
function heroXpFrac(id) { const L = heroLevel(id); if (L >= 10) return 1; const lo = HERO_XP[L - 1], hi = HERO_XP[L]; return clamp((heroXp(id) - lo)/(hi - lo), 0, 1); }
const HERO_VARIANTS = [['std', 'Standard', 1], ['gold', 'Gold', 5], ['shadow', 'Shadow', 10]];
function heroVariant(id) { const v = store('trepong-hv-' + id) || 'std'; const row = HERO_VARIANTS.find(x => x[0] === v); return row && heroLevel(id) >= row[2] ? v : 'std'; }
function giveHeroXp(id, n) {
  if (!HEROES[id] || id === 'none') return;
  const before = heroLevel(id); track('hx_' + id, n); const after = heroLevel(id);
  if (after > before) { toast(HEROES[id][0] + ' reached level ' + after + '!' + (after === 5 ? ' Gold variant unlocked.' : after === 10 ? ' Shadow variant unlocked.' : '')); if (after >= 10) trackMax('heroMax', 10); }
}
const HERO_LINES = {
  kronos:   { use: ['Time is mine!', 'Time stands still!', 'Your time is up!'], win: ['Time was on my side.'], pitch: 0.55, rate: 0.85 },
  twin:     { use: ['Two is better than one!', 'Seeing double!', 'Mirror, mirror!'], win: ['We won. Both of us!'], pitch: 1.35, rate: 1.1 },
  warden:   { use: ['No one gets past!', 'The wall stands!', 'I hold the line!'], win: ['The defense holds.'], pitch: 0.75, rate: 0.95 },
  storm:    { use: ['Feel the thunder!', 'The storm is here!', 'Thunder and lightning!'], win: ['The storm has spoken!'], pitch: 1.45, rate: 1.15 },
  graviton: { use: ['Everything is drawn to me!', 'The light is devoured!', 'Gravity wins!'], win: ['Everything falls in the end.'], pitch: 0.4, rate: 0.8 }
};
let voicesOn = store('trepong-voices') !== '0';
function heroSay(id, kind) {
  const L = HERO_LINES[id]; if (!L) return '';
  const line = pick(L[kind] || L.use);
  if (voicesOn && !muted) {
    try {
      const ss = window.speechSynthesis; if (ss) {
        ss.cancel(); const u = new SpeechSynthesisUtterance(line); u.lang = 'en-US'; u.pitch = L.pitch; u.rate = L.rate; u.volume = 0.9;
        const v = ss.getVoices().find(x => /^sv/i.test(x.lang)); if (v) u.voice = v;
        ss.speak(u);
      }
    } catch (e) {}
  }
  return line;
}
function applyVariant(c, W, H, v, t) {
  if (v === 'gold') {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(232,182,42,0.8)'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(255,240,180,0.9)';
    for (let k = 0; k < 9; k++) { const x = ((k*97 + t*20*(k % 3 + 1)) % W), y = ((k*53 + Math.sin(t + k)*20) % H + H) % H; star4(c, x, y, (2 + (k % 3))*W/300 * (0.6 + 0.4*Math.sin(t*4 + k))); }
    c.restore();
  } else if (v === 'shadow') {
    c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
    c.globalCompositeOperation = 'color'; c.fillStyle = 'rgba(110,40,160,0.85)'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'multiply'; c.fillStyle = 'rgba(60,40,90,0.9)'; c.fillRect(0, 0, W, H);
    c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(W/2, H*0.45, W*0.05, W/2, H*0.45, W*0.45); g.addColorStop(0, 'rgba(255,40,90,0.25)'); g.addColorStop(1, 'rgba(255,40,90,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(255,60,120,0.7)';
    for (let k = 0; k < 14; k++) { const x = (k*71) % W, y = H - ((k*37 + t*30*(1 + k % 3)) % H); c.fillRect(x, y, 2*W/300, 2*W/300); }
    c.restore();
  }
}

