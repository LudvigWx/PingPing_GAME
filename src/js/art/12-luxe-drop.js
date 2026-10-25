// ===================== luxe drop: 5 new cosmetics in every shop category (build 17) =====================
// In every category: 3 regular items and 2 "luxe" items (40k / 50k coins). Luxe items count as mythic in chests.
// Hooks: drawHat6, drawFace6, drawSkin6, trailDot6, drawBallSkin6, drawAura6, vic6, drawVictoryChip6.
// Units for paddle parts: 1 = 0.01 world, -y = up. Eyes sit at x = ±4.2. Hats are drawn after translate(0,-2.1).

function lx_h(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function lx_dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function lx_lg(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i/(stops.length - 1), s)); return g; }
function lx_rg(c, x, y, r0, r1, stops) { const g = c.createRadialGradient(x, y, r0, x, y, r1); stops.forEach((s, i) => g.addColorStop(i/(stops.length - 1), s)); return g; }
function lx_poly(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }
function lx_heart(c, x, y, s) { c.beginPath(); c.moveTo(x, y + s*0.9); c.bezierCurveTo(x - s*1.6, y - s*0.1, x - s*0.8, y - s*1.3, x, y - s*0.45); c.bezierCurveTo(x + s*0.8, y - s*1.3, x + s*1.6, y - s*0.1, x, y + s*0.9); c.closePath(); }

// ---------------------------------------------------------------- shop entries
PALETTE.push(['#FF9EC7', 'Blossom'], ['#2DD4BF', 'Lagoon'], ['#C4B5FD', 'Lilac'], ['#DFF7FF', 'Diamond'], ['#2A2238', 'Obsidian']);
HATS.push(['beret', 'Beret'], ['sombrero', 'Sombrero'], ['gradcap', 'Grad cap'], ['diamondcrown', 'Diamond crown'], ['phoenix', 'Phoenix crest']);
FACES.push(['wink', 'Wink'], ['heartshades', 'Heart shades'], ['bubblegum', 'Bubblegum'], ['galaxyeyes', 'Galaxy eyes'], ['visor', 'Cyber visor']);
SKINS.push(['denim', 'Denim'], ['candycane', 'Candy stripe'], ['carbon', 'Carbon fiber'], ['aurora', 'Aurora'], ['diamond', 'Diamond']);
TRAILS.push(['leaves', 'Autumn leaves'], ['paws', 'Paw prints'], ['runes', 'Runes'], ['stardust', 'Stardust'], ['dragonfire', 'Dragon fire']);
BALLSKINS.push(['tennis', 'Tennis ball'], ['beachball', 'Beach ball'], ['moon', 'Moon'], ['planet', 'Ringed planet'], ['gemball', 'Diamond ball']);
AURAS.push(['fireflies', 'Fireflies'], ['snowfall', 'Snowfall'], ['bubbleaura', 'Bubbles'], ['storm', 'Thunderstorm'], ['cosmic', 'Cosmic orbit']);
VICTORY.push(['bubblepop', 'Bubble party'], ['sakura', 'Cherry blossoms'], ['coinrain', 'Coin rain'], ['northern', 'Northern lights'], ['dragon', 'Dragon flight']);
Object.assign(PRICE.c, { '#FF9EC7': 120, '#2DD4BF': 140, '#C4B5FD': 160, '#DFF7FF': 40000, '#2A2238': 50000 });
Object.assign(PRICE.h, { beret: 220, sombrero: 260, gradcap: 240, diamondcrown: 40000, phoenix: 50000 });
Object.assign(PRICE.f, { wink: 150, heartshades: 180, bubblegum: 160, galaxyeyes: 40000, visor: 50000 });
Object.assign(PRICE.k, { denim: 260, candycane: 240, carbon: 300, aurora: 40000, diamond: 50000 });
Object.assign(PRICE.t, { leaves: 220, paws: 200, runes: 260, stardust: 40000, dragonfire: 50000 });
Object.assign(PRICE.b, { tennis: 300, beachball: 300, moon: 350, planet: 40000, gemball: 50000 });
Object.assign(PRICE.u, { fireflies: 400, snowfall: 400, bubbleaura: 350, storm: 40000, cosmic: 50000 });
Object.assign(PRICE.v, { bubblepop: 350, sakura: 380, coinrain: 400, northern: 40000, dragon: 50000 });
const LUXE_MIN = 10000;   // anything this expensive is a luxe item (mythic in chests)

// ---------------------------------------------------------------- hats
const LX_HATS = {
  beret(c, col, t) {
    c.fillStyle = '#A8323E'; c.beginPath(); c.ellipse(1.2, -2.6, 7.6, 2.9, -0.12, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(-0.6, -3.6, 4.2, 1.1, -0.12, 0, TAU); c.fill();
    c.fillStyle = '#2A1A1E'; rr(c, -6, -1.3, 12, 1.4, 0.6); c.fill();
    c.fillStyle = '#A8323E'; c.fillRect(1.6, -6.4, 0.8, 1.4);
  },
  sombrero(c, col, t) {
    c.fillStyle = '#C99A45'; c.beginPath(); c.ellipse(0, -0.6, 11.5, 2, 0, 0, TAU); c.fill();
    c.strokeStyle = '#8A6420'; c.lineWidth = 0.5; c.stroke();
    c.fillStyle = '#E3B860'; c.beginPath(); c.moveTo(-4.6, -1); c.bezierCurveTo(-4.6, -9.5, 4.6, -9.5, 4.6, -1); c.closePath(); c.fill();
    const cols = ['#E2364A', '#2E9E4F', '#F2C94C'];
    for (let k = 0; k < 6; k++) { c.fillStyle = cols[k % 3]; c.fillRect(-4.4 + k*1.47, -3.2, 1.47, 1.2); }
    c.fillStyle = '#E2364A';
    for (let k = -4; k <= 4; k++) { if (!k) continue; const x = k*2.5, sw = Math.sin(t*3 + k)*0.4; c.beginPath(); c.arc(x + sw, 1.4, 0.55, 0, TAU); c.fill(); }
  },
  gradcap(c, col, t) {
    c.fillStyle = '#16151F'; rr(c, -4.6, -4.4, 9.2, 4.6, 1.2); c.fill();
    lx_poly(c, [[-9, -5.4], [0, -8.4], [9, -5.4], [0, -2.6]]); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.25)'; c.lineWidth = 0.35; c.stroke();
    const sw = Math.sin(t*2.6)*0.7;
    c.strokeStyle = '#F2C94C'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(0, -5.5); c.lineTo(6.2, -4.6); c.lineTo(6.4 + sw, -0.8); c.stroke();
    c.fillStyle = '#F2C94C'; c.beginPath(); c.moveTo(5.8 + sw, -1); c.lineTo(7 + sw, -1); c.lineTo(7.4 + sw, 1.6); c.lineTo(5.4 + sw, 1.6); c.closePath(); c.fill();
    c.fillStyle = col; lx_dot(c, 0, -5.5, 0.6);
  },
  diamondcrown(c, col, t) {
    // a crown cut from one big diamond, refracting rainbow light
    c.save(); c.shadowColor = '#BFF6FF'; c.shadowBlur = 10;
    const spikes = [[-7, -9], [-3.5, -11.5], [0, -14], [3.5, -11.5], [7, -9]];
    c.fillStyle = lx_lg(c, 0, -14, 0, 0, ['#FFFFFF', '#C8F4FF', '#7FD8FF', '#4A9AD8']);
    c.beginPath(); c.moveTo(-8, 0); c.lineTo(-8, -4);
    spikes.forEach(([x, y], i) => { c.lineTo(x - 1.4, -4.5); c.lineTo(x, y); c.lineTo(x + 1.4, -4.5); });
    c.lineTo(8, -4); c.lineTo(8, 0); c.closePath(); c.fill(); c.restore();
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.3; c.stroke();
    // facets with rainbow glints sweeping over them
    for (let i = 0; i < 8; i++) {
      const x = -7 + i*2, hue = (t*120 + i*45) % 360, a = 0.25 + 0.25*Math.sin(t*3 + i);
      c.fillStyle = 'hsla(' + hue + ',100%,75%,' + a.toFixed(2) + ')'; lx_poly(c, [[x, -4], [x + 1, -0.4], [x + 2, -4]]); c.fill();
    }
    c.fillStyle = 'rgba(255,255,255,0.9)'; c.fillRect(-8, -4.3, 16, 0.5);
    spikes.forEach(([x, y], i) => { c.fillStyle = '#FFFFFF'; lx_poly(c, [[x, y - 1.6], [x + 1.1, y], [x, y + 1.6], [x - 1.1, y]]); c.fill(); });
    // twinkles
    c.fillStyle = '#FFFFFF';
    for (let k = 0; k < 4; k++) { const f = (t*0.9 + k*0.25) % 1; if (f < 0.35) { c.globalAlpha = Math.sin(f/0.35*Math.PI); star4(c, -7 + lx_h(k + Math.floor(t*0.9))*14, -2 - lx_h(k*3 + Math.floor(t*0.9))*11, 1.6); } }
    c.globalAlpha = 1;
  },
  phoenix(c, col, t) {
    // a crest of living flame with two small wings that beat slowly
    const fl = Math.sin(t*2.2);
    c.save(); c.globalCompositeOperation = 'lighter';
    for (const s of [-1, 1]) {
      c.save(); c.translate(s*4.5, -2.5); c.scale(s, 1); c.rotate(-0.25 - fl*0.18);
      for (let f = 0; f < 4; f++) {
        c.fillStyle = lx_lg(c, 0, 0, 9, -6, ['rgba(255,240,180,0.9)', 'rgba(255,150,40,0.85)', 'rgba(220,40,20,0)']);
        c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(4 + f, -3 - f*1.6, 8 + f*0.8, -2 - f*2.2 + Math.sin(t*6 + f)*0.4); c.quadraticCurveTo(4, -f*0.6, 0, 0.6); c.fill();
      }
      c.restore();
    }
    for (let f = 0; f < 3; f++) {
      const x = (f - 1)*2.2, h = 9 + (f === 1 ? 4 : 0) + Math.sin(t*7 + f*2)*1.2;
      c.fillStyle = lx_lg(c, x, 0, x, -h, ['rgba(255,90,30,0.95)', 'rgba(255,190,60,0.9)', 'rgba(255,255,220,0.95)']);
      c.beginPath(); c.moveTo(x - 1.8, -0.5); c.quadraticCurveTo(x - 2.4, -h*0.6, x + Math.sin(t*5 + f)*0.8, -h); c.quadraticCurveTo(x + 2.4, -h*0.6, x + 1.8, -0.5); c.closePath(); c.fill();
    }
    for (let k = 0; k < 6; k++) { const u = (t*0.8 + lx_h(k)) % 1; c.globalAlpha = 1 - u; c.fillStyle = k % 2 ? '#FFD27A' : '#FF7A3D'; lx_dot(c, (lx_h(k + 9) - 0.5)*10 + Math.sin(t*3 + k), -4 - u*14, 0.45); }
    c.restore();
    c.fillStyle = '#7A1E10'; rr(c, -4.5, -1.4, 9, 1.6, 0.8); c.fill();
    c.fillStyle = '#FFD84A'; lx_dot(c, 0, -0.6, 0.8);
  }
};
function drawHat6(c, hat, col, t) { const f = LX_HATS[hat]; if (!f) return false; c.save(); try { f(c, col, +t || 0); } catch (e) {} c.restore(); return true; }

// ---------------------------------------------------------------- faces
function lx_eye(c, x, gx, gy, ry) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, 0, 1.8, ry || 1.7, 0, 0, TAU); c.fill(); c.fillStyle = '#0B0914'; lx_dot(c, x + gx*0.8, gy*0.8, 0.9); }
const LX_FACES = {
  wink(c, gx, gy, t) {
    lx_eye(c, -4.2, gx, gy);
    c.strokeStyle = '#0B0914'; c.lineWidth = 0.7; c.lineCap = 'round'; c.beginPath(); c.moveTo(2.6, 0.3); c.quadraticCurveTo(4.2, -1.3, 5.8, 0.3); c.stroke();
    c.fillStyle = 'rgba(255,120,150,0.55)'; c.beginPath(); c.ellipse(-6.6, 1.6, 1.2, 0.6, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(6.6, 1.6, 1.2, 0.6, 0, 0, TAU); c.fill();
  },
  heartshades(c, gx, gy, t) {
    const p = 1 + 0.06*Math.sin(t*6);
    for (const s of [-1, 1]) { c.fillStyle = '#FF2D6F'; lx_heart(c, s*4.2, 0, 2.3*p); c.fill(); c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(s*4.2 - 0.9, -0.7, 0.6, 0.35, -0.6, 0, TAU); c.fill(); }
    c.strokeStyle = '#FF2D6F'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-2, -0.3); c.quadraticCurveTo(0, -1.1, 2, -0.3); c.stroke();
  },
  bubblegum(c, gx, gy, t) {
    lx_eye(c, -4.2, gx, gy); lx_eye(c, 4.2, gx, gy);
    const cyc = t % 3.2, r = cyc < 2.6 ? 0.4 + cyc*1.25 : 0;
    if (r > 0) { c.fillStyle = 'rgba(255,140,190,0.85)'; lx_dot(c, 0, 2.4 + r*0.6, r); c.fillStyle = 'rgba(255,255,255,0.6)'; lx_dot(c, -r*0.35, 2.4 + r*0.25, r*0.22); }
    else { const k = (cyc - 2.6)/0.6; c.strokeStyle = 'rgba(255,140,190,' + (1 - k).toFixed(2) + ')'; c.lineWidth = 0.4; for (let a = 0; a < 6; a++) { const an = a*TAU/6; c.beginPath(); c.moveTo(Math.cos(an)*2, 4 + Math.sin(an)*2); c.lineTo(Math.cos(an)*(2.6 + k*2), 4 + Math.sin(an)*(2.6 + k*2)); c.stroke(); } }
  },
  galaxyeyes(c, gx, gy, t) {
    for (const s of [-1, 1]) {
      const x = s*4.2;
      c.save(); c.shadowColor = '#B57CFF'; c.shadowBlur = 6; c.fillStyle = '#0A0820'; c.beginPath(); c.ellipse(x, 0, 2.2, 2.1, 0, 0, TAU); c.fill(); c.restore();
      c.save(); c.beginPath(); c.ellipse(x, 0, 2.2, 2.1, 0, 0, TAU); c.clip();
      c.fillStyle = lx_rg(c, x + gx*0.5, gy*0.5, 0.1, 2.4, ['#FFFFFF', '#E9A8FF', '#7A4BFF', '#1A1060']); c.fillRect(x - 2.4, -2.4, 4.8, 4.8);
      c.globalCompositeOperation = 'lighter';
      for (let arm = 0; arm < 3; arm++) { c.strokeStyle = 'rgba(160,220,255,0.55)'; c.lineWidth = 0.35; c.beginPath(); for (let k = 0; k < 14; k++) { const a = t*1.6*s + arm*TAU/3 + k*0.3, rr2 = k*0.15; const px = x + gx*0.5 + Math.cos(a)*rr2, py = gy*0.5 + Math.sin(a)*rr2; k ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); }
      c.fillStyle = '#FFFFFF'; for (let k = 0; k < 5; k++) { const a = lx_h(k + s*7)*TAU + t*0.4, d = 0.6 + lx_h(k + 3)*1.3; c.globalAlpha = 0.5 + 0.5*Math.sin(t*4 + k*2); lx_dot(c, x + Math.cos(a)*d, Math.sin(a)*d, 0.16); }
      c.restore();
      c.fillStyle = 'rgba(255,255,255,0.9)'; lx_dot(c, x - 0.8, -0.8, 0.45);
    }
  },
  visor(c, gx, gy, t) {
    c.save(); c.shadowColor = '#3EE6FF'; c.shadowBlur = 7; c.fillStyle = '#0A1220'; rr(c, -8, -2.1, 16, 4, 2); c.fill(); c.restore();
    c.strokeStyle = '#3EE6FF'; c.lineWidth = 0.35; rr(c, -8, -2.1, 16, 4, 2); c.stroke();
    c.save(); rr(c, -8, -2.1, 16, 4, 2); c.clip();
    const sx = -8 + ((t*9) % 20) - 2; c.fillStyle = lx_lg(c, sx - 2, 0, sx + 2, 0, ['rgba(62,230,255,0)', 'rgba(62,230,255,0.55)', 'rgba(62,230,255,0)']); c.fillRect(sx - 2, -2.2, 4, 4.4);
    c.fillStyle = 'rgba(62,230,255,0.35)'; for (let k = 0; k < 10; k++) { const h = 0.3 + Math.abs(Math.sin(t*5 + k*1.7))*0.9; c.fillRect(-7 + k*0.5, 1.5 - h, 0.3, h); }
    for (const s of [-1, 1]) { c.fillStyle = '#E9FBFF'; c.shadowColor = '#3EE6FF'; c.shadowBlur = 5; rr(c, s*4.2 - 1.3 + gx*0.7, -0.6 + gy*0.4, 2.6, 1.1, 0.5); c.fill(); }
    c.restore();
    if ((t % 2.3) < 0.08) { c.fillStyle = 'rgba(62,230,255,0.5)'; c.fillRect(-8, -0.3, 16, 0.4); }
  }
};
function drawFace6(c, face, gx, gy, t) { const f = LX_FACES[face]; if (!f) return false; c.save(); try { f(c, gx || 0, gy || 0, +t || 0); } catch (e) {} c.restore(); return true; }

// ---------------------------------------------------------------- skins (clipped to the paddle bar: x from L to L+Wd, y -2.2..2.2)
const LX_SKINS = {
  denim(c, look, L, Wd, t) {
    c.fillStyle = '#3B5BA5'; c.fillRect(L, -3, Wd, 6);
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 0.25; c.beginPath(); for (let x = L - 6; x < L + Wd + 6; x += 0.8) { c.moveTo(x, -3); c.lineTo(x + 3, 3); } c.stroke();
    c.strokeStyle = '#E8A04A'; c.lineWidth = 0.25; c.setLineDash([0.7, 0.5]); c.beginPath(); c.moveTo(L, -1.5); c.lineTo(L + Wd, -1.5); c.moveTo(L, 1.5); c.lineTo(L + Wd, 1.5); c.stroke(); c.setLineDash([]);
    c.fillStyle = '#C9A44A'; for (const x of [L + 4, L + Wd - 4]) lx_dot(c, x, 0, 0.55);
  },
  candycane(c, look, L, Wd, t) {
    c.fillStyle = '#FFF7F7'; c.fillRect(L, -3, Wd, 6);
    const off = (t*4) % 4; c.fillStyle = '#E8283C';
    for (let x = L - 8 + off; x < L + Wd + 4; x += 4) { c.beginPath(); c.moveTo(x, -3); c.lineTo(x + 1.6, -3); c.lineTo(x + 4.6, 3); c.lineTo(x + 3, 3); c.closePath(); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,0.45)'; c.fillRect(L, -1.6, Wd, 0.5);
  },
  carbon(c, look, L, Wd, t) {
    c.fillStyle = '#121418'; c.fillRect(L, -3, Wd, 6);
    for (let x = L, i = 0; x < L + Wd; x += 0.9, i++) for (let y = -2.2, j = 0; y < 2.3; y += 0.9, j++) { c.fillStyle = (i + j) % 2 ? '#2A2E36' : '#1A1D23'; c.fillRect(x, y, 0.9, 0.9); }
    const sx = L + ((t*12) % (Wd + 12)) - 6; c.fillStyle = lx_lg(c, sx - 4, 0, sx + 4, 0, ['rgba(255,255,255,0)', 'rgba(255,255,255,0.22)', 'rgba(255,255,255,0)']); c.fillRect(sx - 4, -3, 8, 6);
    c.fillStyle = look.c || '#3EE6FF'; c.fillRect(L, -0.2, Wd, 0.4);
  },
  aurora(c, look, L, Wd, t) {
    c.fillStyle = '#0B1530'; c.fillRect(L, -3, Wd, 6);
    c.globalCompositeOperation = 'lighter';
    const cols = ['rgba(80,255,170,0.55)', 'rgba(60,200,255,0.45)', 'rgba(190,110,255,0.45)'];
    cols.forEach((col, k) => {
      c.fillStyle = col; c.beginPath(); c.moveTo(L, 3);
      for (let x = L; x <= L + Wd + 1; x += 1) c.lineTo(x, Math.sin(x*0.25 + t*(1.2 + k*0.4) + k*2)*1.3 - 0.4 + k*0.5);
      c.lineTo(L + Wd + 1, 3); c.closePath(); c.fill();
    });
    c.globalCompositeOperation = 'source-over'; c.fillStyle = '#FFFFFF';
    for (let k = 0; k < 7; k++) { c.globalAlpha = 0.4 + 0.6*Math.abs(Math.sin(t*2 + k*1.9)); lx_dot(c, L + lx_h(k)*Wd, -1.8 + lx_h(k + 5)*1.2, 0.18); }
    c.globalAlpha = 1;
  },
  diamond(c, look, L, Wd, t) {
    for (let x = L - 2, i = 0; x < L + Wd + 2; x += 2.2, i++) {
      for (const up of [0, 1]) {
        const g = up ? lx_lg(c, x, -2.2, x + 2.2, 0, ['#FFFFFF', '#BDEFFF']) : lx_lg(c, x, 0, x + 2.2, 2.2, ['#9ADCF5', '#E6FAFF']);
        c.fillStyle = g; lx_poly(c, up ? [[x, -2.3], [x + 2.2, -2.3], [x + 1.1, 0]] : [[x + 1.1, 0], [x + 2.2, 2.3], [x, 2.3]]); c.fill();
        c.fillStyle = (i % 2 ? '#CDF3FF' : '#A8E2F7'); lx_poly(c, up ? [[x + 1.1, 0], [x + 2.2, -2.3], [x + 3.3, 0]] : [[x + 2.2, 2.3], [x + 1.1, 0], [x + 3.3, 0]]); c.fill();
      }
    }
    c.globalCompositeOperation = 'lighter';
    const sx = L + ((t*16) % (Wd + 14)) - 7; for (let k = 0; k < 3; k++) { c.fillStyle = 'hsla(' + ((t*140 + k*120) % 360) + ',100%,70%,0.35)'; c.fillRect(sx + k*1.2 - 2, -3, 1.2, 6); }
    c.fillStyle = '#FFFFFF'; for (let k = 0; k < 3; k++) { const f = (t*1.3 + k/3) % 1; if (f < 0.3) { c.globalAlpha = Math.sin(f/0.3*Math.PI); star4(c, L + lx_h(k + Math.floor(t*1.3)*3)*Wd, -1 + lx_h(k*5 + Math.floor(t*1.3))*2, 1.3); } }
    c.globalAlpha = 1;
  }
};
function drawSkin6(c, s, look, L, Wd, t) { const f = LX_SKINS[s]; if (!f) return false; c.save(); try { f(c, look || {}, L, Wd, +t || 0); } catch (e) {} c.restore(); return true; }

// ---------------------------------------------------------------- ball trails (k: 0..1 age, 1 = newest)
const LX_TRAILS = {
  leaves(c, col, x, y, r, k, idx, t) {
    const cols = ['#E8742A', '#D9442B', '#F2B33D', '#A8632A'];
    c.save(); c.translate(x, y); c.rotate(idx*1.3 + t*2); const s = r*(0.45 + 0.55*k);
    c.fillStyle = cols[idx % 4]; c.beginPath(); c.moveTo(-s, 0); c.quadraticCurveTo(0, -s*0.9, s, 0); c.quadraticCurveTo(0, s*0.9, -s, 0); c.fill();
    c.strokeStyle = 'rgba(80,30,10,0.6)'; c.lineWidth = s*0.12; c.beginPath(); c.moveTo(-s, 0); c.lineTo(s, 0); c.stroke(); c.restore();
  },
  paws(c, col, x, y, r, k, idx, t) {
    if (idx % 2) return;
    const s = r*0.55, o = (idx % 4 ? 1 : -1)*r*0.5;
    c.fillStyle = col; c.beginPath(); c.ellipse(x, y + o + s*0.3, s*0.75, s*0.6, 0, 0, TAU); c.fill();
    for (let j = 0; j < 4; j++) lx_dot(c, x + (j - 1.5)*s*0.55, y + o - s*0.55 - (j === 1 || j === 2 ? s*0.2 : 0), s*0.28);
  },
  runes(c, col, x, y, r, k, idx, t) {
    const G = [[[-1, -1], [1, 1], [-1, 1]], [[0, -1], [0, 1], [-1, 0], [1, 0]], [[-1, 1], [0, -1], [1, 1], [-0.5, 0.2]], [[-1, -1], [-1, 1], [1, -1], [1, 1]], [[1, -1], [-1, 0], [1, 1]]];
    const g = G[idx % G.length], s = r*0.7;
    c.save(); c.shadowColor = col; c.shadowBlur = 8; c.strokeStyle = col; c.lineWidth = Math.max(1, r*0.22); c.lineCap = 'round';
    c.beginPath(); g.forEach((p, i) => i ? c.lineTo(x + p[0]*s, y + p[1]*s) : c.moveTo(x + p[0]*s, y + p[1]*s)); c.stroke(); c.restore();
  },
  stardust(c, col, x, y, r, k, idx, t) {
    c.save(); c.globalCompositeOperation = 'lighter';
    c.fillStyle = lx_rg(c, x, y, 0, r*1.6, ['hsla(' + ((idx*40 + t*120) % 360) + ',100%,75%,0.45)', 'rgba(0,0,0,0)']); lx_dot(c, x, y, r*1.6);
    for (let j = 0; j < 3; j++) {
      const a = lx_h(idx*3 + j)*TAU + t*2, d = r*(0.4 + lx_h(idx + j*7)*1.4), tw = 0.5 + 0.5*Math.sin(t*9 + idx + j*2);
      c.fillStyle = 'hsl(' + ((idx*40 + j*90 + t*120) % 360) + ',100%,' + (70 + tw*25) + '%)'; star4(c, x + Math.cos(a)*d, y + Math.sin(a)*d, r*(0.25 + 0.45*tw)*(0.5 + k*0.5));
    }
    c.restore();
  },
  dragonfire(c, col, x, y, r, k, idx, t) {
    c.save(); c.globalCompositeOperation = 'lighter';
    const fl = 0.75 + 0.25*Math.sin(t*20 + idx*2.3), s = r*(0.5 + 0.9*k)*fl;
    c.fillStyle = lx_rg(c, x, y, 0, s*1.5, ['rgba(255,255,255,0.95)', 'rgba(140,230,255,0.8)', 'rgba(60,110,255,0.45)', 'rgba(40,40,200,0)']); lx_dot(c, x, y, s*1.5);
    if (idx % 2 === 0) { c.fillStyle = 'rgba(255,170,70,0.9)'; lx_dot(c, x + Math.sin(t*7 + idx)*r, y - r*(1 - k)*1.5, r*0.18); }
    c.restore();
  }
};
function trailDot6(c, style, col, x, y, r, k, idx, t) { const f = LX_TRAILS[style]; if (!f) return false; c.save(); try { f(c, col, x, y, r, k, idx, +t || 0); } catch (e) {} c.restore(); return true; }

// ---------------------------------------------------------------- ball skins
const LX_BALLS = {
  tennis(c, A0, x, y, r, t) {
    c.fillStyle = lx_rg(c, x - r*0.35, y - r*0.35, r*0.1, r*1.1, ['#F4FF9A', '#D4EC3A', '#9DB51E']); lx_dot(c, x, y, r);
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip(); c.translate(x, y); c.rotate(t*3);
    c.strokeStyle = '#FFFFFF'; c.lineWidth = r*0.14; c.beginPath(); c.arc(-r*1.15, 0, r*0.85, -1.1, 1.1); c.stroke(); c.beginPath(); c.arc(r*1.15, 0, r*0.85, Math.PI - 1.1, Math.PI + 1.1); c.stroke(); c.restore();
  },
  beachball(c, A0, x, y, r, t) {
    const cols = ['#FF4F5A', '#FFFFFF', '#3E8BFF', '#FFFFFF', '#FFD23E', '#FFFFFF'];
    c.save(); c.translate(x, y); c.rotate(t*2);
    cols.forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, r, i*TAU/6, (i + 1)*TAU/6); c.closePath(); c.fill(); });
    c.restore(); c.fillStyle = '#FFFFFF'; lx_dot(c, x, y, r*0.22);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.beginPath(); c.ellipse(x - r*0.35, y - r*0.4, r*0.3, r*0.16, -0.6, 0, TAU); c.fill();
  },
  moon(c, A0, x, y, r, t) {
    c.fillStyle = lx_rg(c, x - r*0.3, y - r*0.3, r*0.1, r*1.1, ['#F4F2EA', '#C9C6BC', '#8A877F']); lx_dot(c, x, y, r);
    c.fillStyle = 'rgba(90,88,80,0.45)'; [[0.3, -0.2, 0.25], [-0.35, 0.3, 0.18], [0.1, 0.45, 0.12], [-0.2, -0.45, 0.1]].forEach(([a, b, s]) => lx_dot(c, x + a*r, y + b*r, s*r));
    c.fillStyle = 'rgba(10,12,30,0.35)'; c.beginPath(); c.arc(x, y, r, -Math.PI/2, Math.PI/2); c.ellipse(x, y, r*0.45, r, 0, Math.PI/2, -Math.PI/2, true); c.fill();
  },
  planet(c, A0, x, y, r, t) {
    const tilt = -0.35;
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lx_rg(c, x, y, r*0.5, r*2.4, ['rgba(255,170,90,0.35)', 'rgba(140,90,255,0)']); lx_dot(c, x, y, r*2.4); c.restore();
    const ring = (front) => { c.save(); c.translate(x, y); c.rotate(tilt); c.strokeStyle = 'rgba(255,214,150,0.9)'; c.lineWidth = r*0.22; c.beginPath(); c.ellipse(0, 0, r*1.75, r*0.5, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); c.stroke(); c.strokeStyle = 'rgba(190,140,255,0.8)'; c.lineWidth = r*0.08; c.beginPath(); c.ellipse(0, 0, r*2.05, r*0.6, 0, front ? 0 : Math.PI, front ? Math.PI : TAU); c.stroke(); c.restore(); };
    ring(false);
    c.save(); c.beginPath(); c.arc(x, y, r, 0, TAU); c.clip();
    c.fillStyle = '#E8955A'; c.fillRect(x - r, y - r, r*2, r*2);
    const bands = ['#F2C08A', '#C8663E', '#F5D7A8', '#B65A3A']; bands.forEach((b, i) => { c.fillStyle = b; c.fillRect(x - r, y - r + (i*0.5 + ((t*0.3) % 0.5))*r, r*2, r*0.22); });
    c.fillStyle = lx_rg(c, x - r*0.4, y - r*0.4, r*0.2, r*1.3, ['rgba(255,255,255,0.25)', 'rgba(0,0,0,0)', 'rgba(20,0,40,0.5)']); c.fillRect(x - r, y - r, r*2, r*2);
    c.restore(); ring(true);
    const a = t*2.2; c.fillStyle = '#DDE6FF'; lx_dot(c, x + Math.cos(a)*r*2.5, y + Math.sin(a)*r*0.9, r*0.2);
  },
  gemball(c, A0, x, y, r, t) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = lx_rg(c, x, y, r*0.3, r*2.2, ['rgba(190,240,255,0.55)', 'rgba(120,200,255,0)']); lx_dot(c, x, y, r*2.2); c.restore();
    const n = 8, rot = t*1.2, P = Array.from({ length: n }, (_, i) => [x + Math.cos(rot + i*TAU/n)*r, y + Math.sin(rot + i*TAU/n)*r]);
    for (let i = 0; i < n; i++) { const p = P[i], q = P[(i + 1) % n]; c.fillStyle = 'hsl(' + (195 + (i % 2)*15) + ',90%,' + (72 + 18*Math.sin(t*3 + i)) + '%)'; lx_poly(c, [[x, y], p, q]); c.fill(); }
    const I = Array.from({ length: n }, (_, i) => [x + Math.cos(rot + (i + 0.5)*TAU/n)*r*0.5, y + Math.sin(rot + (i + 0.5)*TAU/n)*r*0.5]);
    c.fillStyle = 'rgba(255,255,255,0.75)'; lx_poly(c, I); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = r*0.06; lx_poly(c, P); c.stroke();
    c.globalCompositeOperation = 'lighter'; c.fillStyle = 'hsla(' + ((t*150) % 360) + ',100%,70%,0.4)'; lx_poly(c, [[x, y], P[0], P[1], P[2]]); c.fill();
    const f = (t % 1.4)/1.4; if (f < 0.25) { c.globalAlpha = A0*Math.sin(f/0.25*Math.PI); c.fillStyle = '#FFFFFF'; star4(c, x + r*0.5, y - r*0.6, r*0.9); }
  }
};
function drawBallSkin6(c, id, x, y, r, t, vx, vy) { const f = LX_BALLS[id]; if (!f) return false; c.save(); try { const A0 = c.globalAlpha; c.shadowBlur = 0; f(c, A0, x, y, r, +t || 0, vx || 0, vy || 0); } catch (e) {} c.restore(); return true; }

// ---------------------------------------------------------------- auras (behind the paddle, paddle spans x = ±hw)
const LX_AURAS = {
  fireflies(c, A0, hw, t, col) {
    c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 10; k++) {
      const x = (lx_h(k) - 0.5)*(hw*2 + 16) + Math.sin(t*0.9 + k*2)*3, y = -8 + lx_h(k + 4)*12 + Math.cos(t*1.3 + k)*2, on = 0.3 + 0.7*Math.max(0, Math.sin(t*2.5 + k*1.7));
      c.globalAlpha = A0*on; c.fillStyle = lx_rg(c, x, y, 0, 2.8, ['rgba(230,255,120,0.9)', 'rgba(200,255,90,0.35)', 'rgba(200,255,90,0)']); lx_dot(c, x, y, 2.8); c.fillStyle = '#FBFFD0'; lx_dot(c, x, y, 0.7);
    }
  },
  snowfall(c, A0, hw, t, col) {
    c.fillStyle = '#FFFFFF';
    for (let k = 0; k < 14; k++) { const u = (t*0.25 + lx_h(k)) % 1, x = (lx_h(k + 3) - 0.5)*(hw*2 + 14) + Math.sin(t*1.5 + k)*1.5, y = -16 + u*22; c.globalAlpha = A0*Math.sin(u*Math.PI)*0.9; star4(c, x, y, 0.5 + lx_h(k + 8)*0.7); }
  },
  bubbleaura(c, A0, hw, t, col) {
    c.lineWidth = 0.35;
    for (let k = 0; k < 9; k++) { const u = (t*0.35 + lx_h(k)) % 1, x = (lx_h(k + 2) - 0.5)*(hw*2 + 6) + Math.sin(t*2 + k)*1.2, y = 3 - u*18, r = 0.7 + lx_h(k + 6)*1.3; c.globalAlpha = A0*Math.sin(u*Math.PI); c.strokeStyle = col || '#7FD8FF'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.7)'; lx_dot(c, x - r*0.35, y - r*0.35, r*0.22); }
  },
  storm(c, A0, hw, t, col) {
    c.globalAlpha = A0*0.3; c.fillStyle = '#3A3E66';
    for (let k = 0; k < 5; k++) { const x = (k - 2)*hw*0.45 + Math.sin(t*0.6 + k)*1.5; lx_dot(c, x, -11 + Math.sin(k*1.7)*1.2, 3.6 + lx_h(k)*1.6); }
    c.globalCompositeOperation = 'lighter';
    const seed = Math.floor(t*8);
    for (let b = 0; b < 3; b++) {
      if (lx_h(seed*3 + b) < 0.35) continue;
      const x0 = (lx_h(seed + b*11) - 0.5)*hw*2, y0 = -10, x1 = (lx_h(seed + b*7 + 1) - 0.5)*(hw*2 + 10), y1 = 2;
      c.beginPath(); c.moveTo(x0, y0); for (let s = 1; s <= 6; s++) { const f = s/6; c.lineTo(x0 + (x1 - x0)*f + (lx_h(seed*13 + b*5 + s) - 0.5)*4, y0 + (y1 - y0)*f); }
      c.globalAlpha = A0*0.5; c.strokeStyle = '#8A9BFF'; c.lineWidth = 1.6; c.stroke();
      c.globalAlpha = A0; c.strokeStyle = '#F2F4FF'; c.lineWidth = 0.4; c.stroke();
    }
    if (lx_h(seed + 99) > 0.8) { c.globalAlpha = A0*0.25; c.fillStyle = '#C8D2FF'; c.beginPath(); c.ellipse(0, -4, hw + 10, 10, 0, 0, TAU); c.fill(); }
  },
  cosmic(c, A0, hw, t, col) {
    c.globalCompositeOperation = 'lighter';
    c.globalAlpha = A0*0.4; c.fillStyle = lx_rg(c, 0, -2, 1, hw + 12, ['rgba(150,110,255,0.6)', 'rgba(60,120,255,0.2)', 'rgba(0,0,0,0)']); c.beginPath(); c.ellipse(0, -2, hw + 12, 11, 0, 0, TAU); c.fill();
    c.globalAlpha = A0*0.7; c.strokeStyle = 'rgba(200,190,255,0.7)'; c.lineWidth = 0.3; c.beginPath(); c.ellipse(0, -1, hw + 7, 5.5, -0.08, 0, TAU); c.stroke();
    const P = [['#FFB36A', 1.3, 0], ['#7FD8FF', 0.9, 2.1], ['#FF7AC8', 1.1, 4.2]];
    for (const [pc, s, ph] of P) { const a = t*0.8 + ph, px = Math.cos(a)*(hw + 7), py = -1 + Math.sin(a)*5.5 - Math.cos(a)*0.6; c.globalAlpha = A0; c.fillStyle = lx_rg(c, px - s*0.3, py - s*0.3, 0.1, s*1.2, ['#FFFFFF', pc, 'rgba(0,0,0,0.2)']); lx_dot(c, px, py, s); }
    c.fillStyle = '#FFFFFF'; for (let k = 0; k < 8; k++) { c.globalAlpha = A0*(0.3 + 0.7*Math.abs(Math.sin(t*2 + k*1.3))); star4(c, (lx_h(k) - 0.5)*(hw*2 + 18), -12 + lx_h(k + 3)*14, 0.5 + lx_h(k + 6)*0.6); }
  }
};
function drawAura6(c, id, hw, t, col) { const f = LX_AURAS[id]; if (!f) return false; c.save(); try { const A0 = c.globalAlpha; c.shadowBlur = 0; f(c, A0, +hw || 14, +t || 0, col); } catch (e) {} c.restore(); return true; }

// ---------------------------------------------------------------- victory effects (full screen, drawn every frame from t)
const LX_VIC = ['bubblepop', 'sakura', 'coinrain', 'northern', 'dragon'];
const LX_VIC_FN = {}, LX_CHIP_FN = {};   // extra victory effects / shop chips registered by later drops
function lx_env(t) { return Math.min(1, t/0.4)*Math.max(0, Math.min(1, (4.4 - t)/0.8)); }
function vic6(T, t, dt) {
  if (!LX_VIC.includes(T)) return;
  if (LX_VIC_FN[T]) { ctx.save(); try { LX_VIC_FN[T](t, dt); } catch (e) {} ctx.restore(); return; }
  const c = ctx, a = lx_env(t);
  c.save();
  try {
    if (T === 'bubblepop') {
      for (let i = 0; i < 46; i++) {
        const st0 = lx_h(i)*1.8, u = (t - st0)/(1.6 + lx_h(i + 3)*1.4); if (u < 0 || u > 1.15) continue;
        const x = W*lx_h(i + 7) + Math.sin(t*2 + i)*14, y = H + 30 - u*H*(0.6 + lx_h(i + 2)*0.5), r = 10 + lx_h(i + 5)*26;
        if (u <= 1) { c.globalAlpha = a*0.9; c.strokeStyle = 'hsla(' + (i*37 % 360) + ',90%,75%,0.9)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.fillStyle = 'rgba(255,255,255,0.12)'; c.fill(); c.fillStyle = 'rgba(255,255,255,0.8)'; lx_dot(c, x - r*0.35, y - r*0.35, r*0.15); }
        else { const k = (u - 1)/0.15; c.globalAlpha = a*(1 - k); c.strokeStyle = '#FFFFFF'; c.lineWidth = 2; for (let s = 0; s < 8; s++) { const an = s*TAU/8; c.beginPath(); c.moveTo(x + Math.cos(an)*r*(0.8 + k*0.6), y + Math.sin(an)*r*(0.8 + k*0.6)); c.lineTo(x + Math.cos(an)*r*(1 + k*0.9), y + Math.sin(an)*r*(1 + k*0.9)); c.stroke(); } }
      }
    } else if (T === 'sakura') {
      c.globalAlpha = a*0.12; c.fillStyle = '#FFB7D0'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) {
        const sp = 70 + lx_h(i)*90, x = (W*lx_h(i + 1) + t*sp*0.6 + Math.sin(t*2 + i)*30) % (W + 40) - 20, y = (lx_h(i + 2)*H*0.5 + t*sp) - 40; if (y > H + 20) continue;
        c.globalAlpha = a; c.save(); c.translate(x, y); c.rotate(t*2.5 + i); c.scale(1, 0.6 + 0.4*Math.sin(t*4 + i));
        c.fillStyle = i % 3 ? '#FFC2D6' : '#FF8FB4'; c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(6, -3, 0, 7); c.quadraticCurveTo(-6, -3, 0, -7); c.fill(); c.restore();
      }
    } else if (T === 'coinrain') {
      for (let i = 0; i < 60; i++) {
        const st0 = lx_h(i)*2.6, y = (t - st0)*(320 + lx_h(i + 4)*260) - 30; if (y < -30 || y > H + 30) continue;
        const x = W*lx_h(i + 9), r = 9 + lx_h(i + 2)*7, sx = Math.abs(Math.cos(t*6 + i));
        c.globalAlpha = a; c.save(); c.translate(x, y); c.scale(Math.max(0.15, sx), 1);
        c.fillStyle = lx_rg(c, -r*0.3, -r*0.3, 1, r, ['#FFF6B0', '#FFD84A', '#C9921A']); lx_dot(c, 0, 0, r); c.strokeStyle = '#8A5F0A'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#C9921A'; c.font = '700 ' + Math.round(r) + 'px Outfit, system-ui, sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; if (sx > 0.5) c.fillText('$', 0, 1); c.restore();
      }
    } else if (T === 'northern') {
      c.globalAlpha = a*0.55; c.fillStyle = lx_lg(c, 0, 0, 0, H, ['rgba(6,10,30,0.9)', 'rgba(6,10,30,0.3)', 'rgba(6,10,30,0)']); c.fillRect(0, 0, W, H);
      c.globalCompositeOperation = 'lighter';
      const bands = [['80,255,170', 0.0], ['60,200,255', 1.7], ['190,110,255', 3.1]];
      bands.forEach(([rgb, ph], k) => {
        for (let x = 0; x < W; x += 6) {
          const yb = H*0.22 + Math.sin(x*0.006 + t*0.8 + ph)*H*0.07 + k*H*0.05, hgt = H*(0.12 + 0.08*Math.sin(x*0.013 + t*1.6 + ph));
          c.globalAlpha = a*0.35*(0.6 + 0.4*Math.sin(x*0.02 + t*2 + ph));
          c.fillStyle = 'rgba(' + rgb + ',1)'; c.fillRect(x, yb - hgt, 6, hgt);
          c.globalAlpha = a*0.12; c.fillRect(x, yb, 6, hgt*0.6);
        }
      });
      c.globalCompositeOperation = 'source-over'; c.fillStyle = '#FFFFFF';
      for (let i = 0; i < 50; i++) { c.globalAlpha = a*(0.3 + 0.7*Math.abs(Math.sin(t*2 + i))); lx_dot(c, W*lx_h(i), H*0.5*lx_h(i + 3), 1.2); }
    } else if (T === 'dragon') {
      // a long golden dragon sweeps across the screen and breathes fire
      const u = Math.min(1, t/3.2), hx = -W*0.3 + u*W*1.6, base = H*0.35;
      const seg = 44, sp = Math.max(9, Math.min(16, W*0.012)), pts = [];
      for (let i = 0; i < seg; i++) { const x = hx - i*sp*1.4, y = base + Math.sin(x*0.012 + t*3)*H*0.07; pts.push([x, y]); }
      c.globalAlpha = a;
      for (let i = seg - 1; i >= 0; i--) {
        const [x, y] = pts[i], r = i === 0 ? 26 : Math.max(5, 22 - i*0.38);
        c.fillStyle = lx_rg(c, x - r*0.3, y - r*0.3, 2, r, [i % 2 ? '#FFE58A' : '#FFD24A', '#E8A020', '#9A4A0A']); lx_dot(c, x, y, r);
        if (i % 3 === 0 && i && i < seg - 4) { c.fillStyle = '#C8301E'; lx_poly(c, [[x - 4, y - r*0.9], [x, y - r*1.6], [x + 4, y - r*0.9]]); c.fill(); }
      }
      const [x0, y0] = pts[0];
      c.fillStyle = '#FFE58A'; c.beginPath(); c.ellipse(x0 + 22, y0 + 4, 20, 12, 0.2, 0, TAU); c.fill();
      c.strokeStyle = '#C8301E'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 + 6, y0 - 18); c.quadraticCurveTo(x0 - 6, y0 - 40, x0 - 22, y0 - 36); c.moveTo(x0 + 14, y0 - 16); c.quadraticCurveTo(x0 + 8, y0 - 42, x0 - 4, y0 - 46); c.stroke();
      c.fillStyle = '#FFFFFF'; lx_dot(c, x0 + 26, y0 - 2, 4); c.fillStyle = '#1A0A00'; lx_dot(c, x0 + 27, y0 - 2, 2);
      c.strokeStyle = '#FFB0A0'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 38, y0 + 8); c.quadraticCurveTo(x0 + 60, y0 + 30 + Math.sin(t*8)*6, x0 + 80, y0 + 20); c.stroke();
      if (t > 0.6 && t < 3.6) {
        c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 26; k++) { const f = ((t*2 + k/26) % 1), fx = x0 + 44 + f*W*0.35, fy = y0 + 10 + f*H*0.18 + Math.sin(k*3 + t*9)*f*30, r = 6 + f*34;
          c.globalAlpha = a*(1 - f*0.8); c.fillStyle = lx_rg(c, fx, fy, 0, r, ['rgba(255,250,210,1)', 'rgba(255,160,40,0.95)', 'rgba(255,60,20,0)']); lx_dot(c, fx, fy, r); }
      }
    }
  } catch (e) {}
  c.restore();
}
function drawVictoryChip6(c, id, w, h) {
  if (!LX_VIC.includes(id)) return false;
  if (LX_CHIP_FN[id]) { c.save(); try { LX_CHIP_FN[id](c, w, h); } catch (e) {} c.restore(); return true; }
  const t = clock;
  if (id === 'bubblepop') { for (let i = 0; i < 6; i++) { const u = (t*0.5 + i/6) % 1; c.strokeStyle = 'hsl(' + (i*60) + ',90%,75%)'; c.lineWidth = 1.5; c.beginPath(); c.arc(12 + i*12, h - u*h, 4 + (i % 3)*2, 0, TAU); c.stroke(); } }
  if (id === 'sakura') { for (let i = 0; i < 9; i++) { c.save(); c.translate((i*23 + t*20) % w, (i*13 + t*30) % h); c.rotate(t*2 + i); c.fillStyle = i % 2 ? '#FFC2D6' : '#FF8FB4'; c.beginPath(); c.moveTo(0, -5); c.quadraticCurveTo(4, -2, 0, 5); c.quadraticCurveTo(-4, -2, 0, -5); c.fill(); c.restore(); } }
  if (id === 'coinrain') { for (let i = 0; i < 6; i++) { const y = (t*40 + i*19) % (h + 12) - 6, x = 10 + i*13; c.save(); c.translate(x, y); c.scale(Math.max(0.2, Math.abs(Math.cos(t*5 + i))), 1); c.fillStyle = '#FFD84A'; lx_dot(c, 0, 0, 6); c.strokeStyle = '#8A5F0A'; c.lineWidth = 1; c.stroke(); c.restore(); } }
  if (id === 'northern') { c.fillStyle = '#0A1030'; c.fillRect(0, 0, w, h); c.globalCompositeOperation = 'lighter'; [['80,255,170', 0], ['190,110,255', 2]].forEach(([rgb, ph]) => { for (let x = 0; x < w; x += 3) { const yb = h*0.55 + Math.sin(x*0.08 + t + ph)*6, hh = 14 + 6*Math.sin(x*0.15 + t*2 + ph); c.fillStyle = 'rgba(' + rgb + ',0.35)'; c.fillRect(x, yb - hh, 3, hh); } }); c.globalCompositeOperation = 'source-over'; }
  if (id === 'dragon') { c.save(); c.translate(w/2, h/2); for (let i = 7; i >= 0; i--) { const x = -i*7 + 10, y = Math.sin(t*3 + i*0.6)*5; c.fillStyle = i % 2 ? '#FFE58A' : '#FFC93A'; lx_dot(c, x, y, i ? 7 - i*0.4 : 8); } c.fillStyle = 'rgba(255,140,40,0.85)'; lx_dot(c, 24 + Math.sin(t*9)*2, Math.sin(t*3)*5 + 3, 4); c.fillStyle = '#C8301E'; c.fillRect(6, -10 + Math.sin(t*3)*5, 3, 5); c.restore(); }
  if (PRICE.v[id] >= LUXE_MIN) { c.fillStyle = '#FFD84A'; c.font = '700 9px Outfit, system-ui, sans-serif'; c.textAlign = 'right'; c.textBaseline = 'top'; c.fillText('LUXE', w - 4, 3); }
  return true;
}
