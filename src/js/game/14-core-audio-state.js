// ---------- card art ----------
const RAR_COL = { c: '#9FB3D9', r: '#4FA8FF', e: '#FFC94A', x: '#FF4A5E' };
const RAR_BG = { c: ['#1E2340', '#141830'], r: ['#123058', '#0E1A36'], e: ['#4A2A6A', '#1A1036'], x: ['#4A0E1E', '#14060C'] };
function drawCardArt(cvs, id) {
  const c = cvs.getContext('2d'), W = cvs.width, H = cvs.height, card = CARDS[id], rc = RAR_COL[card.r];
  c.setTransform(1, 0, 0, 1, 0, 0);
  const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, RAR_BG[card.r][0]); g.addColorStop(1, RAR_BG[card.r][1]);
  c.fillStyle = g; c.fillRect(0, 0, W, H);
  c.globalAlpha = 0.25; c.strokeStyle = rc; c.lineWidth = 1;
  for (let k = -H; k < W; k += 14) { c.beginPath(); c.moveTo(k, H); c.lineTo(k + H, 0); c.stroke(); }
  c.globalAlpha = 1;
  if (card.r === 'e' || card.r === 'x') {
    const rg = c.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.5); rg.addColorStop(0, rc + '66'); rg.addColorStop(1, rc + '00');
    c.fillStyle = rg; c.fillRect(0, 0, W, H);
  }
  c.setTransform(W/100, 0, 0, H/100, 0, 0);
  c.lineCap = 'round'; c.lineJoin = 'round';
  c.shadowColor = rc; c.shadowBlur = 14;
  const ink = '#F0ECFF';
  const bar = (x1, x2, y, col, w) => { c.strokeStyle = col; c.lineWidth = w || 7; c.beginPath(); c.moveTo(x1, y); c.lineTo(x2, y); c.stroke(); };
  const ball = (x, y, r) => { c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r || 5, 0, TAU); c.fill(); };
  const arrowHead = (x, y, a, s) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(a - 0.5)*s, y - Math.sin(a - 0.5)*s); c.moveTo(x, y); c.lineTo(x - Math.cos(a + 0.5)*s, y - Math.sin(a + 0.5)*s); c.stroke(); };
  const shieldShape = (x, y, s) => { c.beginPath(); c.moveTo(x, y - s); c.quadraticCurveTo(x + s*0.9, y - s*0.9, x + s*0.85, y - s*0.2); c.quadraticCurveTo(x + s*0.7, y + s*0.7, x, y + s); c.quadraticCurveTo(x - s*0.7, y + s*0.7, x - s*0.85, y - s*0.2); c.quadraticCurveTo(x - s*0.9, y - s*0.9, x, y - s); c.closePath(); };
  const heart = (x, y, s) => { c.beginPath(); c.moveTo(x, y + s*0.8); c.bezierCurveTo(x - s*1.4, y - s*0.1, x - s*0.7, y - s*1.1, x, y - s*0.4); c.bezierCurveTo(x + s*0.7, y - s*1.1, x + s*1.4, y - s*0.1, x, y + s*0.8); c.closePath(); };
  if (id === 'wide') {
    bar(28, 72, 62, '#3EE6FF', 9); c.strokeStyle = ink; c.lineWidth = 4;
    c.beginPath(); c.moveTo(22, 40); c.lineTo(8, 40); c.stroke(); arrowHead(8, 40, Math.PI, 7);
    c.beginPath(); c.moveTo(78, 40); c.lineTo(92, 40); c.stroke(); arrowHead(92, 40, 0, 7); ball(50, 32, 6);
  } else if (id === 'life') {
    c.fillStyle = '#FF4F8B'; heart(50, 50, 30); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.moveTo(50, 38); c.lineTo(50, 58); c.moveTo(40, 48); c.lineTo(60, 48); c.stroke();
  } else if (id === 'shield') {
    c.fillStyle = '#4FA8FF'; shieldShape(50, 50, 32); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke();
    c.fillStyle = '#fff'; c.font = '700 22px "Rubik Mono One", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.shadowBlur = 0; c.fillText('1', 50, 50);
  } else if (id === 'fire') {
    c.fillStyle = '#FF6A2A'; c.beginPath(); c.moveTo(50, 12); c.bezierCurveTo(80, 40, 78, 82, 50, 86); c.bezierCurveTo(22, 82, 20, 50, 38, 34); c.bezierCurveTo(38, 52, 46, 54, 50, 12); c.fill();
    c.fillStyle = '#FFE34A'; c.beginPath(); c.moveTo(52, 44); c.bezierCurveTo(66, 58, 64, 80, 50, 82); c.bezierCurveTo(38, 80, 36, 64, 46, 56); c.fill(); ball(50, 72, 6);
  } else if (id === 'angle') {
    bar(30, 70, 80, '#FFB23E', 8); c.strokeStyle = ink; c.lineWidth = 3;
    [-0.9, -0.45, 0, 0.45, 0.9].forEach((a, i) => { c.globalAlpha = i === 0 || i === 4 ? 1 : 0.4; const x = 50 + Math.sin(a)*60, y = 72 - Math.cos(a)*60; c.beginPath(); c.moveTo(50, 72); c.lineTo(x, y); c.stroke(); });
    c.globalAlpha = 1; ball(50, 70, 6);
  } else if (id === 'magnet') {
    c.lineWidth = 14; c.lineCap = 'butt'; c.strokeStyle = '#FF4A5E'; c.beginPath(); c.arc(50, 46, 22, Math.PI, 0); c.stroke();
    c.strokeStyle = '#FF4A5E'; c.beginPath(); c.moveTo(28, 46); c.lineTo(28, 70); c.moveTo(72, 46); c.lineTo(72, 70); c.stroke();
    c.strokeStyle = '#E8E8F0'; c.beginPath(); c.moveTo(28, 62); c.lineTo(28, 74); c.moveTo(72, 62); c.lineTo(72, 74); c.stroke();
    c.lineCap = 'round'; c.lineWidth = 2.5; c.strokeStyle = '#7CFFB2';
    poly(c, [0, 1, 2, 3, 4, 5].map(k => [50 + Math.cos(k/6*TAU)*9, 88 + Math.sin(k/6*TAU)*9])); c.stroke();
  } else if (id === 'curve') {
    c.strokeStyle = ink; c.lineWidth = 4; c.setLineDash([2, 7]);
    c.beginPath(); c.moveTo(22, 84); c.bezierCurveTo(10, 40, 80, 50, 76, 18); c.stroke(); c.setLineDash([]); ball(76, 18, 7); bar(14, 40, 88, '#B57CFF', 7);
  } else if (id === 'harden') {
    c.fillStyle = '#9FB3D9'; poly(c, [[50, 14], [80, 38], [68, 84], [32, 84], [20, 38]]); c.fill();
    c.fillStyle = '#C9D6F2'; poly(c, [[50, 14], [80, 38], [50, 46], [20, 38]]); c.fill();
    c.fillStyle = '#6F80A6'; poly(c, [[50, 46], [68, 84], [32, 84]]); c.fill();
  } else if (id === 'amplify') {
    c.strokeStyle = '#7CFFB2'; c.lineWidth = 5;
    [14, 26, 38].forEach((r, i) => { c.globalAlpha = 1 - i*0.25; c.beginPath(); c.arc(30, 50, r, -0.9, 0.9); c.stroke(); });
    c.globalAlpha = 1; c.fillStyle = '#7CFFB2'; c.beginPath(); c.arc(30, 50, 8, 0, TAU); c.fill();
    c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.moveTo(80, 70); c.lineTo(80, 28); c.stroke(); arrowHead(80, 26, -Math.PI/2, 9);
  } else if (id === 'split') {
    c.strokeStyle = ink; c.lineWidth = 3.5; c.beginPath(); c.moveTo(50, 88); c.lineTo(50, 56); c.lineTo(26, 22); c.moveTo(50, 56); c.lineTo(74, 22); c.stroke();
    ball(26, 20, 8); ball(74, 20, 8); bar(36, 64, 90, '#FFC94A', 7);
  } else if (id === 'slow') {
    c.strokeStyle = '#FFC94A'; c.lineWidth = 4; c.beginPath(); c.moveTo(30, 14); c.lineTo(70, 14); c.moveTo(30, 86); c.lineTo(70, 86); c.stroke();
    c.beginPath(); c.moveTo(34, 16); c.quadraticCurveTo(34, 40, 50, 50); c.quadraticCurveTo(66, 60, 66, 84); c.moveTo(66, 16); c.quadraticCurveTo(66, 40, 50, 50); c.quadraticCurveTo(34, 60, 34, 84); c.stroke();
    c.fillStyle = '#FFE58A'; poly(c, [[42, 34], [58, 34], [50, 46]]); c.fill(); poly(c, [[38, 84], [62, 84], [50, 68]]); c.fill();
  } else if (id === 'phantom') {
    bar(14, 46, 76, '#3EE6FF', 8); c.globalAlpha = 0.45; c.setLineDash([4, 4]); bar(54, 86, 76, '#3EE6FF', 8); c.setLineDash([]); c.globalAlpha = 1;
    c.fillStyle = 'rgba(240,236,255,0.85)'; c.beginPath(); c.arc(70, 46, 13, Math.PI, 0); c.lineTo(83, 64); c.lineTo(78, 60); c.lineTo(74, 64); c.lineTo(70, 60); c.lineTo(66, 64); c.lineTo(62, 60); c.lineTo(57, 64); c.closePath(); c.fill();
    c.fillStyle = '#14102A'; c.beginPath(); c.arc(65, 46, 2.4, 0, TAU); c.arc(75, 46, 2.4, 0, TAU); c.fill();
  } else if (id === 'shieldgen') {
    c.fillStyle = '#FFC94A'; shieldShape(50, 52, 24); c.fill();
    c.strokeStyle = ink; c.lineWidth = 4; c.beginPath(); c.arc(50, 52, 38, -2.6, 0.4); c.stroke(); arrowHead(50 + Math.cos(0.4)*38, 52 + Math.sin(0.4)*38, 0.4 + Math.PI/2, 8);
    c.beginPath(); c.arc(50, 52, 38, 0.6, 2.4); c.stroke(); arrowHead(50 + Math.cos(2.4)*38, 52 + Math.sin(2.4)*38, 2.4 + Math.PI/2, 8);
  } else if (id === 'giantpact') {
    bar(8, 92, 58, '#FF4A5E', 14);
    c.strokeStyle = '#B9B4CC'; c.lineWidth = 3.5; c.shadowBlur = 0;
    for (let k = 0; k < 4; k++) { c.beginPath(); c.ellipse(50 + (k % 2 ? 4 : -4), 72 + k*7, 5, 3.5, k % 2 ? Math.PI/2 : 0, 0, TAU); c.stroke(); }
    c.fillStyle = '#2A2440'; c.beginPath(); c.arc(50, 22, 12, 0, TAU); c.fill(); c.strokeStyle = '#B9B4CC'; c.stroke();
  } else if (id === 'glass') {
    c.fillStyle = '#FF4F8B'; heart(30, 66, 16); c.fill();
    c.strokeStyle = '#14060C'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(30, 56); c.lineTo(26, 64); c.lineTo(33, 68); c.lineTo(29, 78); c.stroke();
    c.fillStyle = '#FFE34A'; poly(c, [[64, 10], [48, 48], [62, 48], [52, 88], [84, 38], [68, 38], [80, 10]]); c.fill();
  } else if (id === 'chaoseng') {
    c.fillStyle = '#F0ECFF'; c.save(); c.translate(50, 52); c.rotate(0.3);
    c.beginPath(); c.roundRect ? c.roundRect(-24, -24, 48, 48, 9) : c.rect(-24, -24, 48, 48); c.fill();
    c.fillStyle = '#FF4A5E'; [[-12, -12], [12, 12], [0, 0], [12, -12], [-12, 12]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 4.5, 0, TAU); c.fill(); });
    c.restore();
    c.strokeStyle = '#C59BFF'; c.lineWidth = 3; c.beginPath(); c.arc(50, 52, 40, 0.3, 1.6); c.stroke(); c.beginPath(); c.arc(50, 52, 40, 3.4, 4.7); c.stroke();
  } else if (id === 'pendulum') {
    c.strokeStyle = '#B9B4CC'; c.lineWidth = 3; c.beginPath(); c.moveTo(50, 8); c.lineTo(28, 62); c.stroke();
    c.globalAlpha = 0.35; c.beginPath(); c.moveTo(50, 8); c.lineTo(72, 62); c.stroke(); c.globalAlpha = 1;
    bar(10, 46, 70, '#FF4A5E', 9); c.globalAlpha = 0.45; bar(66, 78, 70, '#FF4A5E', 9); c.globalAlpha = 1;
    c.fillStyle = '#FFC94A'; c.beginPath(); c.arc(50, 8, 4, 0, TAU); c.fill();
  } else if (id === 'dark') {
    c.fillStyle = '#F0ECFF'; c.beginPath(); c.moveTo(14, 50); c.quadraticCurveTo(50, 18, 86, 50); c.quadraticCurveTo(50, 82, 14, 50); c.fill();
    c.fillStyle = '#FF4A5E'; c.beginPath(); c.arc(50, 50, 13, 0, TAU); c.fill();
    c.fillStyle = '#14060C'; c.beginPath(); c.ellipse(50, 50, 4, 11, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(20,6,12,0.75)'; c.beginPath(); c.moveTo(12, 50); c.quadraticCurveTo(50, 16, 88, 50); c.lineTo(88, 40); c.quadraticCurveTo(50, 6, 12, 40); c.fill();
  }
  c.shadowBlur = 0;
}

// ---------- helpers ----------
const $ = s => document.querySelector(s);
const r3 = v => Math.round(v*1000)/1000, r1 = v => Math.round(v*10)/10;
const NAME_JUNK = new RegExp('[\\u0000-\\u001f\\u007f-\\u009f\\u200b-\\u200f\\u2028-\\u202e\\u2060-\\u206f\\ufeff]', 'g');
const cleanName = s => String(s || '').replace(NAME_JUNK, '').trim().slice(0, 12);
const fmt = n => Math.round(n).toLocaleString('en-US');
function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
function storeJSON(k, d) { try { const v = JSON.parse(store(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
let toastTimer = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toastTimer); toastTimer = setTimeout(() => t.hidden = true, 3200); }
function buzz(p) { try { navigator.vibrate && navigator.vibrate(p); } catch (e) {} }
function cleanCards(list) { return Array.isArray(list) ? list.filter(k => typeof k === 'string' && CARDS[k]).slice(0, 8) : []; }

// ---------- wallet ----------
let coins = Math.max(0, Math.floor(+store('trepong-coins') || 0));
let owned = new Set(storeJSON('trepong-owned', []));
function isFree(kind, id) { return PRICE[kind] && PRICE[kind][id] === 0; }
function isExclusive(kind, id) { return PRICE[kind] && PRICE[kind][id] === null; }
function ownsItem(kind, id) { return isFree(kind, id) || owned.has(kind + ':' + id); }
function saveWallet() { store('trepong-coins', String(coins)); store('trepong-owned', JSON.stringify([...owned])); syncCoinUI(); }
function syncCoinUI() { $('#menuCoins').textContent = fmt(coins); $('#shopCoins').textContent = fmt(coins); const a = $('#profCoins'), b = $('#chestCoins'), cc = $('#cupCoins'); if (cc) cc.textContent = fmt(coins); if (a) a.textContent = fmt(coins); if (b) b.textContent = fmt(coins); }
function addCoins(n) { coins += n; saveWallet(); if (n > 0 && typeof track === 'function') track('coinsEarned', n); }

// ---------- audio ----------
let AC = null, muted = store('trepong-mute') === '1';
function audioOn() {
  if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { AC = null; } }
  if (AC && AC.state === 'suspended') AC.resume().catch(() => {});
  musicStart();
}
// ----- living music: a synthwave loop whose layers stack up as the rally grows -----
const midiF = m => 440*Math.pow(2, (m - 69)/12);
// Each theme: chord progression ([root midi, major?]) plus the instruments that colour it.
const THEMES = {
  main: { bpm: 112, prog: [[57, 0], [53, 1], [48, 1], [55, 1]] },  // Am F C G
  boss: { bpm: 126, prog: [[50, 0], [46, 1], [43, 0], [45, 1]], stab: 1 },  // Dm Bb Gm A
  // Neon Harbor: bright gated synthwave
  harbor: { bpm: 108, prog: [[57, 0], [53, 1], [48, 1], [55, 1]], padLp: 1200, lead: 'square', scale: [0, 3, 5, 7, 10, 12], bassPat: [0, 12, 0, 12, 7, 12, 10, 12], extra: 'gull' },
  // Frostpeak: slow, glassy, bells and soft drums
  frost: { bpm: 94, prog: [[52, 0], [48, 1], [43, 1], [50, 1]], pad: 'sine', padVol: 0.03, padLp: 2400, arp: 'sine', arpLen: 3, lead: 'sine', scale: [0, 2, 3, 7, 10, 12, 14], drums: 'soft', extra: 'chime' },
  // The Rift: dark phrygian, heavy kick and glitches
  rift: { bpm: 118, prog: [[48, 0], [44, 1], [41, 0], [43, 1]], padLp: 650, bassWave: 'sawtooth', bassLp: 380, lead: 'sawtooth', leadLp: 1800, scale: [0, 1, 3, 5, 7, 8, 10, 12], drums: 'heavy', extra: 'glitch' },
  // Pumpkin Night: spooky organ, harmonic minor, swing and church bells
  pumpkin: { bpm: 100, prog: [[50, 0], [46, 1], [43, 0], [45, 1]], pad: 'square', padLp: 1100, padVol: 0.012, arp: 'square', lead: 'triangle', scale: [0, 2, 3, 5, 7, 8, 11, 12], drums: 'swing', extra: 'toll', theremin: 1 }
};
// Boss versions of the world themes: faster, a step heavier, and phase 2 goes a semitone up.
function bossTheme(base, phase) { return { ...base, bpm: Math.round(base.bpm*1.14) + (phase ? 10 : 0), stab: 1, drums: base.drums === 'soft' ? 'std' : base.drums, shift: phase ? 1 : 0, choir: phase ? 1 : 0 }; }
function curTheme() {
  const wid = mode === 'practice' && special === 'adv' && advCur ? advCur.wid : (curScreen === 'adv' ? advSelW : story ? story.W.id : null);
  if (wid && THEMES[wid]) {
    if (st && st.boss && mode !== 'menu') return bossTheme(THEMES[wid], st.boss.phase || 0);
    if (story && story.part === 'pre') return bossTheme(THEMES[wid], 0);
    return THEMES[wid];
  }
  return st && st.boss && mode !== 'menu' ? THEMES.boss : THEMES.main;
}
const Music = { on: store('trepong-music') !== '0', timer: null, step: 0, nextT: 0, out: null, noise: null, chord: [57, 0], lvl: 0 };
function musicStart() {
  if (!AC || Music.timer) return;
  Music.out = AC.createGain(); Music.out.gain.value = 0.55; Music.out.connect(AC.destination);
  const nb = AC.createBuffer(1, AC.sampleRate*0.5, AC.sampleRate), d = nb.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random()*2 - 1;
  Music.noise = nb; Music.nextT = AC.currentTime + 0.08;
  Music.timer = setInterval(musicTick, 25);
}
function musicLevel() {
  if (curScreen === 'story') return story && story.part === 'pre' ? 1 : 0;
  if (!st || mode === 'menu') return -1;           // menu: soft pad only
  if (replay) return 5;                             // replay: everything, slowed
  if (st.ph === 'ov') return 0;
  let l = st.rh >= 25 || st.balls.length > 1 ? 4 : st.rh >= 15 ? 3 : st.rh >= 8 ? 2 : st.rh >= 3 ? 1 : 0;
  if (st.boss) l = Math.min(4, l + 1 + st.boss.rage);
  return l;
}
function mNote(freq, t, dur, type, vol, opt) {
  const o = AC.createOscillator(), g = AC.createGain(); o.type = type; o.frequency.setValueAtTime(freq, t);
  let node = o;
  if (opt && opt.lp) { const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = opt.lp; o.connect(f); node = f; }
  const a = (opt && opt.att) || 0.005;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  node.connect(g).connect(Music.out); o.start(t); o.stop(t + dur + 0.05);
}
function mNoise(t, dur, vol, hp) {
  const s = AC.createBufferSource(), f = AC.createBiquadFilter(), g = AC.createGain();
  s.buffer = Music.noise; f.type = hp ? 'highpass' : 'bandpass'; f.frequency.value = hp || 1800;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(f).connect(g).connect(Music.out); s.start(t); s.stop(t + dur + 0.02);
}
function musicTick() {
  if (!AC || !Music.out) return;
  const silent = muted || !Music.on;
  const theme = curTheme();
  const slow = replay ? 0.5 : (st && st.mut === 'slowmo' && st.ph === 'pl' ? 0.75 : 1);
  const spb = 60 / (theme.bpm*slow) / 4;
  if (Music.nextT < AC.currentTime - 0.2) Music.nextT = AC.currentTime + 0.05;
  while (Music.nextT < AC.currentTime + 0.12) {
    if (!silent) playStep(Music.step, Music.nextT, theme, spb);
    Music.nextT += spb; Music.step = (Music.step + 1) % 64;
  }
}
function playStep(step, t, theme, spb) {
  const lvl = musicLevel(); Music.lvl = lvl;
  const T = theme, [r0, maj] = T.prog[Math.floor(step/16)], root = r0 + (T.shift || 0); Music.chord = [root, maj];
  const tri = [0, maj ? 4 : 3, 7], s16 = step % 16;
  // swing pushes every odd 16th a little late
  if (T.drums === 'swing' && step % 2 === 1) t += spb*0.28;
  // pad
  if (s16 === 0) for (const iv of tri) mNote(midiF(root + iv), t, spb*16, T.pad || 'sawtooth', (lvl < 0 ? 0.012 : 0.018) * ((T.padVol || 0.018)/0.018), { lp: T.padLp || 900, att: 0.4 });
  if (T.choir && s16 === 0) for (const iv of [0, 7, 12, 15]) for (const dt of [-6, 6]) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'sine'; o.frequency.value = midiF(root + 12 + iv); o.detune.value = dt; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012, t + 0.8); g.gain.exponentialRampToValueAtTime(0.0001, t + spb*16); o.connect(g).connect(Music.out); o.start(t); o.stop(t + spb*16 + 0.05); }
  // world flavour that plays even in menus
  if (T.extra === 'chime' && step % 3 === 0 && Math.random() < 0.35) mNote(midiF(root + 24 + pick([0, 7, 12, 14, 19])), t, 1.6, 'sine', 0.018);
  if (T.extra === 'toll' && step % 32 === 0) { mNote(midiF(root - 12), t, 3.2, 'sine', 0.06); mNote(midiF(root - 12)*2.76, t, 2.2, 'sine', 0.02); }
  if (T.extra === 'gull' && step === 40 && lvl <= 0) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(1500, t); o.frequency.exponentialRampToValueAtTime(900, t + 0.35); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.012, t + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4); o.connect(g).connect(Music.out); o.start(t); o.stop(t + 0.45); }
  if (lvl >= 1 && step % 2 === 0) { const bn = (T.bassPat || [0, 0, 7, 0, 12, 0, 7, 10])[(step/2) % 8]; mNote(midiF(root - 12 + bn), t, spb*1.8, T.bassWave || 'square', 0.05, { lp: T.bassLp || 500 }); }
  if (T.stab && lvl >= 1 && (s16 === 0 || s16 === 10)) for (const iv of [0, 12]) mNote(midiF(root - 12 + iv), t, spb*2.5, 'sawtooth', 0.05, { lp: 700 });
  if (lvl >= 2) {
    const heavy = T.drums === 'heavy', soft = T.drums === 'soft';
    if (step % 4 === 0 || (heavy && step % 16 === 10)) { const o = AC.createOscillator(), g = AC.createGain(); o.frequency.setValueAtTime(heavy ? 160 : 140, t); o.frequency.exponentialRampToValueAtTime(heavy ? 32 : 40, t + 0.15); g.gain.setValueAtTime(soft ? 0.12 : heavy ? 0.3 : 0.22, t); g.gain.exponentialRampToValueAtTime(0.0001, t + (heavy ? 0.3 : 0.2)); o.connect(g).connect(Music.out); o.start(t); o.stop(t + 0.35); }
    if (step % 8 === 4) mNoise(t, soft ? 0.25 : 0.16, soft ? 0.05 : 0.12, soft ? 3000 : 0);
    if (step % 2 === 1 && !(soft && step % 4 !== 3)) mNoise(t, 0.04, soft ? 0.03 : 0.05, 7000);
    if (T.extra === 'glitch' && Math.random() < 0.08) mNoise(t, 0.03, 0.08, 400 + Math.random()*6000);
  }
  if (lvl >= 3) { const arp = [0, 1, 2, 1][step % 4]; mNote(midiF(root + 12 + tri[arp] + (step % 8 >= 4 ? 12 : 0)), t, spb*0.9*(T.arpLen || 1), T.arp || 'triangle', 0.035); }
  if (lvl >= 4 && step % 4 === 2) { const sc = T.scale || [0, 3, 5, 7, 10, 12]; const n = sc[(step*7 + Math.floor(step/16)*3) % sc.length]; mNote(midiF(root + 24 + n), t, spb*3, T.lead || 'square', 0.028, { lp: T.leadLp || 3000 }); }
  if (T.theremin && lvl >= 3 && s16 === 8) { const o = AC.createOscillator(), g = AC.createGain(), v = AC.createOscillator(), vg = AC.createGain(); o.type = 'sine'; const sc = T.scale, a = midiF(root + 24 + sc[step % sc.length]); o.frequency.setValueAtTime(a, t); o.frequency.linearRampToValueAtTime(a*1.5, t + spb*6); v.frequency.value = 6; vg.gain.value = a*0.02; v.connect(vg).connect(o.frequency); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.025, t + 0.2); g.gain.exponentialRampToValueAtTime(0.0001, t + spb*7); o.connect(g).connect(Music.out); o.start(t); v.start(t); o.stop(t + spb*7 + 0.05); v.stop(t + spb*7 + 0.05); }
}
function hitNote(seat) {
  const pent = [0, 3, 5, 7, 10, 12, 15, 17, 19, 22, 24];
  const [root] = Music.chord;
  return midiF(root + 12 + pent[Math.min(pent.length - 1, (rally + (seat % 3)*2) % pent.length)]);
}
function tone(freq, dur, type, vol, slide, delay) {
  if (!AC || muted) return;
  const t = AC.currentTime + (delay || 0), o = AC.createOscillator(), g = AC.createGain();
  o.type = type || 'square'; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq*slide), t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.07, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + dur + 0.03);
}
const PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
const SEAT_ROOT = [261.63, 329.63, 392.0, 440.0, 293.66, 349.23, 233.08]; // a different note per seat
let rally = 0;
const sfx = {
  hit(seat) { const f = Music.on && Music.out ? hitNote(seat) : SEAT_ROOT[seat % SEAT_ROOT.length] * Math.pow(2, PENTA[Math.min(rally, PENTA.length-1)]/12); tone(f, 0.11, 'square', 0.06); tone(f*2, 0.07, 'triangle', 0.03); },
  wall() { tone(196, 0.06, 'triangle', 0.07); },
  bump() { tone(523, 0.08, 'sine', 0.07, 0.6); },
  rock() { tone(110, 0.12, 'square', 0.06, 0.5); tone(880, 0.04, 'triangle', 0.03); },
  shield() { tone(1046, 0.25, 'triangle', 0.07, 0.5); },
  split() { tone(784, 0.08, 'square', 0.05); tone(1175, 0.08, 'square', 0.05, 0, 0.06); },
  goal() { tone(330, 0.5, 'sawtooth', 0.06, 0.2); tone(165, 0.5, 'square', 0.03, 0.25); },
  count() { tone(660, 0.08, 'sine', 0.07); },
  go() { tone(990, 0.16, 'sine', 0.08); },
  win() { [0, 4, 7, 12].forEach((s, i) => tone(392*Math.pow(2, s/12), 0.22, 'triangle', 0.07, 0, i*0.11)); },
  coin() { tone(988, 0.07, 'square', 0.05); tone(1319, 0.18, 'square', 0.05, 0, 0.07); },
  card(r) { const base = { c: 523, r: 587, e: 659, x: 220 }[r] || 523; [0, 7, 12].forEach((s, i) => tone(base*Math.pow(2, s/12), 0.12, r === 'x' ? 'sawtooth' : 'triangle', 0.06, 0, i*0.06)); },
  power(cat) {
    const seq = cat === 'bra' ? [0, 4, 7, 12, 16] : cat === 'elak' ? [12, 8, 5, 1, -4] : [0, 6, 1, 7, 2, 11];
    seq.forEach((s, i) => tone(523*Math.pow(2, s/12), 0.09, cat === 'kaos' ? 'sawtooth' : 'square', 0.05, 0, i*0.05));
  }
};

// ---------- state ----------
let mode = 'menu';           // menu | practice | host | guest
let st = null, demo = null, demoLooks = [];
let mySeat = 0, names = [], bots = [], looks = [], botLooks = [];
let menuN = 3, lobbyN = 3, menuFmt = 'serie', lobbyFmt = 'serie';
let myU = 0, keys = { l: false, r: false };
let myLook = validLook(storeJSON('trepong-look', null));
['c', 'h', 'f', 't'].forEach(k => { const id = myLook[k]; if (!isFree(k, id) && !isExclusive(k, id)) owned.add(k + ':' + id); }); // keep what you already wear
let roomNS = null, net = null, joinedNamed = false, offPeers = null, roomCode = '';
let hostSeats = [], hostPhase = 'lobby';
let gs = { since: 0, seen: 0, everSeen: false, lastG: null, netPads: [], sentPad: 9, pk: 0, mid: -1 };
let botCache = [];
let particles = [], trails = new Map(), flash = [0, 0, 0, 0, 0, 0, 0, 0], shake = 0, lastCount = -1, overShown = false;
let banner = null, wakeLock = null, clock = 0;
// series: shared shape on host/practice and (read-only copy) on guests
let series = null;        // { id, r, of, wins, cards, offers, picked, left, lw, sp }
let seriesPicks = [], pickDeadline = 0, botPickAt = [], myPick = null, pubT = 0, awarded = new Set();
const SERIES_OF = 4, SERIES_LIVES = 3, QUICK_LIVES = 5, PICK_SECS = 15;

function myName() { return cleanName($('#name').value) || 'Player'; }
function colOf(i, lk) { const l = (lk || looks)[i]; return l ? l.c : SEAT_DEFAULT[i]; }

// ---------- screens ----------
const SCREENS = ['menu', 'lobby', 'over', 'custom', 'pick', 'quests', 'tower', 'profile', 'chests', 'cup', 'settings', 'adv', 'story', 'bp', 'raid', 'build', 'arenas', 'redeem', 'levels', 'live', 'friends'];
function showScreen(name) {
  SCREENS.forEach(id => $('#' + id).hidden = id !== name);
  $('#hud').hidden = mode === 'menu' || ['menu', 'custom', 'quests', 'tower', 'profile', 'chests', 'cup', 'settings', 'adv', 'story', 'bp', 'raid', 'build', 'arenas', 'redeem', 'levels', 'live', 'friends'].includes(name);
  curScreen = name;
  if (name === 'menu' && typeof lvCheck === 'function') setTimeout(() => { if (curScreen === 'menu' && !lvFx) { lvCheck(); syncLevelBar(); if (!lvFx) loginCheck(); } }, 350);
  if (name && $('#' + name)) $('#' + name).scrollTop = 0;
}
function setSeg(seg, v, key) { seg.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(String(b.dataset[key || 'n']) === String(v)))); }
const FMT_TEXT = { arena: 'A custom arena from the Arena Builder.', raid: 'Raid! Team up against the giant raid boss selected in Raids. Everyone rolls their own loot when you win.', serie: 'Four matches with 3 lives. Everyone picks a buff card before each match, and the winner gets a shot at stronger cards.', snabb: 'One match with 5 lives. No cards.', cup: 'A knockout tournament against bots with 4 or 8 players. Win every match to take home the trophy.', torn: 'Climb the Champion Tower! Every floor has a new boss, and every win takes you one floor higher.', boss: 'Everyone vs the boss! You have 4 lives each. Score on the boss until its health runs out, and watch out for its attacks.' };
const BOSS_LIVES = 4;
let lobbyArena = 'classic', menuChaos = false, lobbyChaos = false, myHero = 'none', towerPlayers = 1, myHeroN = 0, lastHeroN = [], replay = null, towerFloorPlaying = 0, curScreen = 'menu', menuArena = 'classic', emoBubbles = [], mySmashN = 0, myEmoN = 0, lastEmoT = 0, lastSmashN = [], lastEmoSeen = {};

