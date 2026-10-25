// ===================== new_paddle.js — hats / faces / skins (set 4) =====================
// drawHat4(c, hat, col, t)            hats: headphones, cowboy, jester, samurai, frog, mushroom, infinity (secret)
// drawFace4(c, face, gx, gy, t)       faces: starry, kawaii, cyclops, nerd, dizzy, bandit, owl (secret)
// drawSkin4(c, s, look, L, Wd, t)     skins: camo, checker, circuit, holo, marble, thunder, prism (secret)
// All helpers prefixed cp4_. Units: 1 = 0.01 world, -y = up (hats are drawn after drawHat's translate(0,-2.1)).

function cp4_dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function cp4_hash(n) { const s = Math.sin(n*127.1 + 311.7)*43758.5453; return s - Math.floor(s); }
function cp4_shade(hex, k) { // k<0 darker, k>0 lighter (k in -1..1)
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return hex;
  const v = parseInt(m[1], 16), ch = [v >> 16, (v >> 8) & 255, v & 255].map(x => Math.round(k < 0 ? x*(1 + k) : x + (255 - x)*k));
  return 'rgb(' + ch.join(',') + ')';
}
function cp4_lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i/(stops.length - 1), s)); return g; }

// ================================ HATS ================================
const cp4_HATS = {
  headphones(c, col, t) {
    // headband
    c.lineCap = 'round';
    c.strokeStyle = '#1B1828'; c.lineWidth = 2.4;
    c.beginPath(); c.moveTo(-8.6, -3.2); c.bezierCurveTo(-8.6, -13.6, 8.6, -13.6, 8.6, -3.2); c.stroke();
    c.strokeStyle = '#4A4560'; c.lineWidth = 1.2; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.4;
    c.beginPath(); c.moveTo(-6.6, -9.2); c.bezierCurveTo(-4, -11.6, 4, -11.6, 6.6, -9.2); c.stroke();
    // ear cups
    [-1, 1].forEach(s => {
      const x = s*9.2;
      c.fillStyle = '#16131F'; c.beginPath(); rr(c, x - 2.2, -6.2, 4.4, 6.8, 1.8); c.fill();
      c.fillStyle = '#2C2840'; c.beginPath(); rr(c, x - 1.6, -5.6, 3.2, 5.6, 1.4); c.fill();
      c.save(); c.shadowColor = col; c.shadowBlur = 6; c.strokeStyle = col; c.lineWidth = 0.6;
      c.beginPath(); rr(c, x - 1.6, -5.6, 3.2, 5.6, 1.4); c.stroke(); c.restore();
      // tiny EQ bars on the cup
      c.fillStyle = col;
      for (let k = 0; k < 3; k++) {
        const h = 0.6 + 2.6*Math.abs(Math.sin(t*(5 + k*1.7) + k*1.3 + s));
        c.fillRect(x - 1.05 + k*0.8, -1.2 - h, 0.5, h);
      }
    });
    // floating EQ above the band
    c.save(); c.shadowColor = col; c.shadowBlur = 5;
    for (let k = 0; k < 5; k++) {
      const h = 0.5 + 2.4*Math.abs(Math.sin(t*4.2 + k*1.9)*Math.cos(t*1.3 + k));
      c.fillStyle = k === 2 ? '#FFFFFF' : col; c.globalAlpha = 0.9;
      c.fillRect(-2.4 + k*1.0, -12.6 - h, 0.6, h);
    }
    c.restore();
  },
  cowboy(c, col, t) {
    const leather = '#8A5528', dark = '#5C3416', light = '#B67A3E';
    // crown
    c.beginPath(); c.moveTo(-5.4, -2.2); c.bezierCurveTo(-6.4, -8, -5.6, -11.2, -3, -11);
    c.quadraticCurveTo(0, -9, 3, -11); c.bezierCurveTo(5.6, -11.2, 6.4, -8, 5.4, -2.2); c.closePath();
    c.fillStyle = cp4_lin(c, -6, 0, 6, 0, [dark, light, leather, dark]); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(0, -9.4); c.quadraticCurveTo(0.4, -6.5, 0, -4.6); c.stroke();
    // band
    c.fillStyle = col; c.beginPath(); c.moveTo(-5.6, -4.8); c.quadraticCurveTo(0, -4.0, 5.6, -4.8); c.lineTo(5.5, -2.9); c.quadraticCurveTo(0, -2.1, -5.5, -2.9); c.closePath(); c.fill();
    c.fillStyle = '#FFD84A'; star4(c, 0, -3.5, 1.1);
    // brim (curled up at sides)
    c.beginPath(); c.moveTo(-11.6, -5.4); c.quadraticCurveTo(-10, -1.4, -5, -1.6); c.quadraticCurveTo(0, -1.0, 5, -1.6);
    c.quadraticCurveTo(10, -1.4, 11.6, -5.4); c.quadraticCurveTo(11.4, -0.4, 6, 0.4); c.quadraticCurveTo(0, 1.2, -6, 0.4); c.quadraticCurveTo(-11.4, -0.4, -11.6, -5.4); c.closePath();
    c.fillStyle = cp4_lin(c, 0, -5, 0, 1, [light, leather, dark]); c.fill();
    c.strokeStyle = 'rgba(255,220,170,0.45)'; c.lineWidth = 0.35; c.stroke();
  },
  jester(c, col, t) {
    const alt = '#2A1E4A', tips = [[-10.6, -8.2, -1], [0, -13.0, 0], [10.6, -8.2, 1]];
    tips.forEach((tp, i) => {
      const bob = Math.sin(t*3.2 + i*1.9)*0.7, tx = tp[0] + bob*0.5*(tp[2] || 0.6), ty = tp[1] + bob;
      c.beginPath();
      if (i === 1) { c.moveTo(-2.8, -2.6); c.quadraticCurveTo(-2.4, -9, tx, ty); c.quadraticCurveTo(2.4, -9, 2.8, -2.6); }
      else { const s = tp[2]; c.moveTo(s*1.0, -2.6); c.quadraticCurveTo(s*2.4, -10.4, tx, ty); c.quadraticCurveTo(s*6.4, -5.2, s*6.6, -2.6); }
      c.closePath();
      c.fillStyle = i === 1 ? alt : col; c.fill();
      c.fillStyle = 'rgba(255,255,255,0.14)'; c.fill();
      c.strokeStyle = 'rgba(0,0,0,0.35)'; c.lineWidth = 0.3; c.stroke();
      tips[i].push(tx, ty);
    });
    // headband with diamonds
    c.fillStyle = '#F3EEDF'; c.beginPath(); rr(c, -7.4, -3.2, 14.8, 3.2, 1.2); c.fill();
    [-4.8, -1.6, 1.6, 4.8].forEach((x, k) => { c.fillStyle = k % 2 ? col : alt; poly(c, [[x, -2.9], [x + 1.1, -1.6], [x, -0.3], [x - 1.1, -1.6]]); c.fill(); });
    // bells
    tips.forEach((tp, i) => {
      const x = tp[3], y = tp[4] + 0.2;
      c.save(); c.shadowColor = '#FFD84A'; c.shadowBlur = 5; c.fillStyle = '#FFD84A'; cp4_dot(c, x, y, 1.25); c.restore();
      c.fillStyle = '#B98A10'; c.fillRect(x - 0.7, y + 0.15, 1.4, 0.3);
      c.fillStyle = '#FFF7C2'; cp4_dot(c, x - 0.4, y - 0.45, 0.35);
    });
  },
  samurai(c, col, t) {
    const iron = '#24202E', lac = '#7A1220';
    // neck guard (shikoro) flares
    [-1, 1].forEach(s => {
      c.beginPath(); c.moveTo(s*5.6, -5.4); c.quadraticCurveTo(s*9.6, -4.6, s*10.8, -0.6); c.lineTo(s*6.4, -0.8); c.closePath();
      c.fillStyle = lac; c.fill();
      c.strokeStyle = '#E8C060'; c.lineWidth = 0.3; c.beginPath();
      for (let k = 1; k <= 2; k++) { const f = k/3; c.moveTo(s*(5.8 + 0.4*f), -5.2 + 4.6*f); c.quadraticCurveTo(s*(8.6), -4.2 + 3.6*f, s*(6.2 + 4.4*f), -0.7 - 4*(1 - f)*0.15); }
      c.stroke();
    });
    // bowl
    c.beginPath(); c.moveTo(-6.6, -1.4); c.bezierCurveTo(-6.8, -10.6, 6.8, -10.6, 6.6, -1.4); c.closePath();
    c.fillStyle = cp4_lin(c, -6, -9, 6, 0, ['#4A4458', iron, '#110E18']); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.16)'; c.lineWidth = 0.3; c.beginPath();
    for (let x = -4; x <= 4; x += 2) { c.moveTo(x*1.15, -1.6); c.quadraticCurveTo(x*0.9, -6, x*0.35, -8.4); } c.stroke();
    // brim / visor
    c.fillStyle = lac; c.beginPath(); c.moveTo(-8, -0.6); c.quadraticCurveTo(0, -3.4, 8, -0.6); c.lineTo(7.4, 0.5); c.quadraticCurveTo(0, -1.8, -7.4, 0.5); c.closePath(); c.fill();
    c.strokeStyle = '#E8C060'; c.lineWidth = 0.35; c.stroke();
    // crescent crest (maedate)
    c.save(); c.shadowColor = '#FFD84A'; c.shadowBlur = 6;
    c.beginPath(); c.moveTo(0, -5.4);
    c.bezierCurveTo(-4, -6.6, -8.4, -9.6, -9.8, -14); c.bezierCurveTo(-6.6, -11, -3, -9.4, 0, -8.8);
    c.bezierCurveTo(3, -9.4, 6.6, -11, 9.8, -14); c.bezierCurveTo(8.4, -9.6, 4, -6.6, 0, -5.4); c.closePath();
    c.fillStyle = cp4_lin(c, 0, -14, 0, -5, ['#FFF2B0', '#FFD84A', '#C9921A']); c.fill(); c.restore();
    // mon
    c.fillStyle = '#C9921A'; cp4_dot(c, 0, -5.8, 1.6); c.fillStyle = col; cp4_dot(c, 0, -5.8, 1.05);
    c.fillStyle = 'rgba(255,255,255,0.6)'; cp4_dot(c, -0.35, -6.15, 0.3);
  },
  frog(c, col, t) {
    const g1 = '#5FD35A', g2 = '#2E8F3A';
    const blink = (t % 4.3) < 0.14;
    // body dome
    c.beginPath(); c.moveTo(-8.2, -0.6); c.bezierCurveTo(-8.6, -7.6, 8.6, -7.6, 8.2, -0.6); c.quadraticCurveTo(0, 0.6, -8.2, -0.6); c.closePath();
    c.fillStyle = cp4_lin(c, 0, -7, 0, 0, [g1, '#45B84A', g2]); c.fill();
    // eye bumps
    [-1, 1].forEach(s => {
      const x = s*4.1, y = -7.6;
      c.fillStyle = g1; cp4_dot(c, x, y, 3.1);
      c.fillStyle = '#FFFFFF'; cp4_dot(c, x, y - 0.2, 2.2);
      if (blink) { c.fillStyle = g2; c.beginPath(); c.ellipse(x, y - 0.2, 2.3, 2.3, 0, 0, TAU); c.fill(); c.strokeStyle = '#1C4A20'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(x - 1.6, y); c.quadraticCurveTo(x, y + 0.9, x + 1.6, y); c.stroke(); }
      else {
        const px = x + Math.sin(t*0.9 + s)*0.5;
        c.fillStyle = '#0B0914'; c.beginPath(); c.ellipse(px, y - 0.1, 1.15, 1.35, 0, 0, TAU); c.fill();
        c.fillStyle = '#FFFFFF'; cp4_dot(c, px - 0.45, y - 0.6, 0.38);
      }
    });
    // spots, smile, cheeks
    c.fillStyle = 'rgba(30,110,40,0.55)'; cp4_dot(c, -5.6, -2.6, 0.7); cp4_dot(c, 6, -3.2, 0.55); cp4_dot(c, 3.6, -1.6, 0.45);
    c.strokeStyle = '#1C4A20'; c.lineWidth = 0.45; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-3.6, -3.2); c.quadraticCurveTo(0, -1.2, 3.6, -3.2); c.stroke();
    c.fillStyle = 'rgba(255,120,150,0.55)'; c.beginPath(); c.ellipse(-5.4, -3.4, 1, 0.55, 0, 0, TAU); c.ellipse(5.4, -3.4, 1, 0.55, 0, 0, TAU); c.fill();
  },
  mushroom(c, col, t) {
    // gills / underside
    c.fillStyle = '#EADBC0'; c.beginPath(); c.ellipse(0, -1.4, 9.6, 1.6, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(150,110,70,0.5)'; c.lineWidth = 0.22; c.beginPath();
    for (let x = -8; x <= 8; x += 1.3) { c.moveTo(x*0.6, -1.6); c.lineTo(x, -0.3); } c.stroke();
    // cap
    c.beginPath(); c.moveTo(-10.4, -1.6); c.bezierCurveTo(-10.6, -12.6, 10.6, -12.6, 10.4, -1.6); c.quadraticCurveTo(0, -3.6, -10.4, -1.6); c.closePath();
    const g = c.createRadialGradient(-3, -9, 0.5, 0, -5, 12); g.addColorStop(0, '#FF6A5E'); g.addColorStop(0.6, '#E0242E'); g.addColorStop(1, '#8E0E18');
    c.fillStyle = g; c.fill();
    c.save(); c.clip();
    c.fillStyle = '#FFF6EA';
    [[-6.4, -4.4, 1.5], [-2.2, -8.0, 1.9], [3.6, -7.2, 1.3], [7.0, -3.8, 1.2], [0.6, -3.6, 1.1], [-4.8, -8.8, 0.8], [6.4, -9.2, 0.7]].forEach(p => {
      c.beginPath(); c.ellipse(p[0], p[1], p[2], p[2]*0.85, 0, 0, TAU); c.fill();
    });
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.ellipse(-4, -9, 3.6, 1.2, -0.4, 0, TAU); c.fill();
    c.restore();
    // tiny twinkle (spores)
    c.fillStyle = '#FFF2C0';
    for (let k = 0; k < 3; k++) { const ph = (t*0.4 + k/3) % 1; c.globalAlpha = Math.sin(ph*Math.PI)*0.8; cp4_dot(c, -6 + k*6 + Math.sin(t + k)*1.2, -11 - ph*4, 0.35); }
    c.globalAlpha = 1;
  },
  infinity(c, col, t) {
    const a = 8.6, cy = -8.6 + Math.sin(t*1.6)*0.6, N = 72;
    const pt = s => { const d = 1 + Math.sin(s)*Math.sin(s); return [a*Math.cos(s)/d, cy + a*Math.sin(s)*Math.cos(s)/d*1.15]; };
    // soft aura
    c.save();
    const rg = c.createRadialGradient(0, cy, 0, 0, cy, 11); rg.addColorStop(0, 'rgba(255,255,255,0.20)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = rg; c.beginPath(); c.ellipse(0, cy, 11.5, 5.5, 0, 0, TAU); c.fill();
    // prismatic curve: segment-by-segment hue
    c.lineCap = 'round'; c.lineWidth = 1.5;
    for (let i = 0; i < N; i++) {
      const s0 = i/N*TAU, s1 = (i + 1.15)/N*TAU, p0 = pt(s0), p1 = pt(s1), hue = (i/N*360 + t*90) % 360;
      c.strokeStyle = 'hsl(' + hue + ',100%,64%)'; c.shadowColor = c.strokeStyle; c.shadowBlur = 7;
      c.beginPath(); c.moveTo(p0[0], p0[1]); c.lineTo(p1[0], p1[1]); c.stroke();
    }
    c.shadowBlur = 0;
    c.strokeStyle = 'rgba(255,255,255,0.85)'; c.lineWidth = 0.45; c.beginPath();
    for (let i = 0; i <= N; i++) { const p = pt(i/N*TAU); i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]); } c.stroke();
    // running light particle with comet tail
    const sp = t*2.4;
    for (let k = 10; k >= 0; k--) {
      const p = pt(sp - k*0.07); c.globalAlpha = (1 - k/11)*0.9;
      c.fillStyle = k ? 'hsl(' + ((t*90 + k*20) % 360) + ',100%,80%)' : '#FFFFFF';
      cp4_dot(c, p[0], p[1], k ? 0.9*(1 - k/12) : 1.05);
    }
    c.globalAlpha = 1;
    const hp = pt(sp); c.shadowColor = '#FFFFFF'; c.shadowBlur = 10; c.fillStyle = '#FFFFFF'; star4(c, hp[0], hp[1], 1.9);
    c.shadowBlur = 0;
    // orbiting glints
    for (let k = 0; k < 4; k++) {
      const an = t*0.9 + k*TAU/4, x = Math.cos(an)*11, y = cy + Math.sin(an)*4.6, f = 0.5 + 0.5*Math.sin(t*4 + k*2);
      c.globalAlpha = 0.35 + 0.6*f; c.fillStyle = 'hsl(' + ((k*90 + t*90) % 360) + ',100%,82%)'; star4(c, x, y, 0.5 + 0.7*f);
    }
    c.restore();
  }
};
function drawHat4(c, hat, col, t) {
  const fn = cp4_HATS[hat];
  if (!fn) return false;
  c.save();
  try { fn(c, col, +t || 0); } catch (e) { /* never break the paddle */ }
  c.restore();
  return true;
}

// ================================ FACES ================================
function cp4_eyeWhite(c, x, y, rx, ry) { c.fillStyle = '#FFFFFF'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); }
function cp4_spiral(c, x, y, r, rot) {
  c.beginPath();
  for (let i = 0; i <= 40; i++) { const f = i/40, an = rot + f*TAU*2.2, rr2 = r*f; i ? c.lineTo(x + Math.cos(an)*rr2, y + Math.sin(an)*rr2) : c.moveTo(x, y); }
  c.stroke();
}
const cp4_FACES = {
  starry(c, gx, gy, t) {
    [-1, 1].forEach(s => {
      const x = s*4.2;
      cp4_eyeWhite(c, x, 0, 1.95, 1.8);
      const tw = 1 + 0.18*Math.sin(t*6 + s*1.3);
      c.save(); c.translate(x + gx*0.5, gy*0.4); c.rotate(Math.sin(t*1.5 + s)*0.25); c.scale(tw, tw);
      c.shadowColor = '#FFD84A'; c.shadowBlur = 5; c.fillStyle = '#FFC21E';
      c.beginPath();
      for (let k = 0; k < 10; k++) { const an = -Math.PI/2 + k*Math.PI/5, r = k % 2 ? 0.55 : 1.45; k ? c.lineTo(Math.cos(an)*r, Math.sin(an)*r) : c.moveTo(Math.cos(an)*r, Math.sin(an)*r); }
      c.closePath(); c.fill(); c.restore();
      c.fillStyle = '#FFFFFF'; cp4_dot(c, x + gx*0.5 - 0.35, gy*0.4 - 0.35, 0.28);
      const f = Math.max(0, Math.sin(t*3.4 + s*2));
      if (f > 0.2) { c.fillStyle = '#FFF6B0'; c.globalAlpha = f; star4(c, x + s*2.4, -2.2, 0.4 + 0.8*f); c.globalAlpha = 1; }
    });
  },
  kawaii(c, gx, gy, t) {
    c.strokeStyle = '#0B0914'; c.lineWidth = 0.9; c.lineCap = 'round'; c.lineJoin = 'round';
    const b = Math.sin(t*2.5)*0.15;
    [-1, 1].forEach(s => { const x = s*4.2; c.beginPath(); c.moveTo(x - 1.7, 0.6 + b); c.lineTo(x, -1.2 + b); c.lineTo(x + 1.7, 0.6 + b); c.stroke(); });
    c.fillStyle = 'rgba(255,60,120,0.75)'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s*6.6, 1.0, 1.25, 0.6, 0, 0, TAU); c.fill(); });
    c.fillStyle = 'rgba(255,255,255,0.7)'; [-1, 1].forEach(s => { c.fillRect(s*6.6 - 0.6, 0.8, 0.3, 0.3); c.fillRect(s*6.6 + 0.1, 0.9, 0.3, 0.3); });
    c.lineWidth = 0.45; c.beginPath(); c.moveTo(-0.9, 0.9); c.quadraticCurveTo(-0.45, 1.6, 0, 1.0); c.quadraticCurveTo(0.45, 1.6, 0.9, 0.9); c.stroke();
  },
  cyclops(c, gx, gy, t) {
    const blink = (t % 4.1) < 0.14;
    const wx = clamp(gx*0.9 + Math.sin(t*0.8)*0.5, -1.1, 1.1), wy = clamp(gy*0.6 + Math.cos(t*0.6)*0.2, -0.6, 0.6);
    c.fillStyle = '#0B0914'; c.beginPath(); c.ellipse(0, 0, 3.4, 2.65, 0, 0, TAU); c.fill();
    if (blink) { c.strokeStyle = '#FFFFFF'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(-2.6, 0.2); c.quadraticCurveTo(0, 1.2, 2.6, 0.2); c.stroke(); return; }
    cp4_eyeWhite(c, 0, 0, 3.0, 2.3);
    c.save(); c.beginPath(); c.ellipse(0, 0, 3.0, 2.3, 0, 0, TAU); c.clip();
    const ix = wx*1.2, iy = wy*0.9;
    const g = c.createRadialGradient(ix, iy, 0.2, ix, iy, 1.7); g.addColorStop(0, '#8BFFB0'); g.addColorStop(1, '#1E9E5A');
    c.fillStyle = g; cp4_dot(c, ix, iy, 1.6);
    c.fillStyle = '#0B0914'; cp4_dot(c, ix, iy, 0.75);
    c.fillStyle = '#FFFFFF'; cp4_dot(c, ix - 0.6, iy - 0.6, 0.35);
    c.fillStyle = 'rgba(11,9,20,0.18)'; c.fillRect(-3.2, -2.4, 6.4, 0.6);
    c.restore();
    c.strokeStyle = '#0B0914'; c.lineWidth = 0.6; c.lineCap = 'round'; c.beginPath(); c.moveTo(-3, -3.1); c.quadraticCurveTo(0, -3.9, 3, -3.1); c.stroke();
  },
  nerd(c, gx, gy, t) {
    const blink = (t % 3.7) < 0.12;
    [-1, 1].forEach(s => {
      const x = s*4.2;
      cp4_eyeWhite(c, x, 0, 1.6, blink ? 0.3 : 1.5);
      if (!blink) { c.fillStyle = '#0B0914'; cp4_dot(c, x + gx*0.6, gy*0.6, 0.75); c.fillStyle = '#fff'; cp4_dot(c, x + gx*0.6 - 0.3, gy*0.6 - 0.3, 0.22); }
    });
    c.strokeStyle = '#17131F'; c.lineWidth = 0.6;
    c.beginPath(); c.arc(-4.2, 0, 2.3, 0, TAU); c.moveTo(6.5, 0); c.arc(4.2, 0, 2.3, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(-1.9, -0.3); c.quadraticCurveTo(0, -1.2, 1.9, -0.3); c.moveTo(-6.5, -0.4); c.lineTo(-8.2, -0.9); c.moveTo(6.5, -0.4); c.lineTo(8.2, -0.9); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.3;
    [-1, 1].forEach(s => { c.beginPath(); c.arc(s*4.2, 0, 1.75, Math.PI*1.1, Math.PI*1.45); c.stroke(); });
    c.fillStyle = '#F7F5EE'; c.strokeStyle = '#17131F'; c.lineWidth = 0.25;
    [-1.05, 0.05].forEach(x => { rr(c, x, 1.5, 1.0, 1.5, 0.25); c.fill(); c.stroke(); });
  },
  dizzy(c, gx, gy, t) {
    c.lineCap = 'round';
    [-1, 1].forEach(s => {
      const x = s*4.2;
      cp4_eyeWhite(c, x, 0, 1.95, 1.85);
      c.strokeStyle = '#0B0914'; c.lineWidth = 0.42; cp4_spiral(c, x, 0, 1.65, -t*5*s);
    });
    c.fillStyle = '#FFE34A';
    for (let k = 0; k < 3; k++) { const an = t*2.5 + k*TAU/3; star4(c, Math.cos(an)*6.6, -3.2 + Math.sin(an)*0.9, 0.7); }
    c.strokeStyle = '#0B0914'; c.lineWidth = 0.4; c.beginPath();
    for (let i = 0; i <= 8; i++) { const x = -1.4 + i*0.35, y = 1.6 + Math.sin(i*1.6 + t*6)*0.25; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
  },
  bandit(c, gx, gy, t) {
    const blink = (t % 3.7) < 0.12;
    // knot tails flapping on the right
    c.fillStyle = '#0F0C18';
    [0, 1].forEach(k => {
      const w = Math.sin(t*5 + k*1.7)*0.6;
      c.beginPath(); c.moveTo(8.2, -0.6); c.quadraticCurveTo(10.2, -1.6 + k*1.8 + w, 12.2, -0.4 + k*2.4 + w); c.lineTo(11.6, 0.6 + k*2.2 + w); c.quadraticCurveTo(10, 0.2 + k*1.4, 8.2, 0.8); c.closePath(); c.fill();
    });
    // mask band with eye holes
    c.beginPath();
    c.moveTo(-8.8, -1.5); c.quadraticCurveTo(0, -2.6, 8.8, -1.5); c.lineTo(8.8, 1.3); c.quadraticCurveTo(0, 2.4, -8.8, 1.3); c.closePath();
    [-1, 1].forEach(s => { const x = s*4.2; c.moveTo(x + 1.9, 0); c.ellipse(x, 0, 1.9, 1.15, 0, 0, TAU, true); });
    c.fillStyle = '#0F0C18'; c.fill('evenodd');
    c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(-8, -1.2); c.quadraticCurveTo(0, -2.1, 8, -1.2); c.stroke();
    [-1, 1].forEach(s => {
      const x = s*4.2; cp4_eyeWhite(c, x, 0, 1.55, blink ? 0.25 : 0.95);
      if (!blink) { c.fillStyle = '#0B0914'; cp4_dot(c, x + gx*0.7, gy*0.3, 0.62); }
    });
  },
  owl(c, gx, gy, t) {
    const lid = clamp(((t % 5.3) - 5.0)/0.3, 0, 1), lidK = Math.sin(lid*Math.PI);
    // feather discs
    [-1, 1].forEach(s => {
      const x = s*4.0;
      c.save(); c.shadowColor = '#FFB23E'; c.shadowBlur = 6;
      c.fillStyle = '#6B4A2A'; c.beginPath();
      for (let k = 0; k < 16; k++) { const an = k/16*TAU, r = k % 2 ? 2.7 : 3.05; k ? c.lineTo(x + Math.cos(an)*r, Math.sin(an)*r*0.92) : c.moveTo(x + r, 0); }
      c.closePath(); c.fill(); c.restore();
      c.fillStyle = '#E8D3B0'; cp4_dot(c, x, 0, 2.45);
      const ix = x + gx*0.45, iy = gy*0.35;
      const g = c.createRadialGradient(ix, iy, 0.3, ix, iy, 2.1); g.addColorStop(0, '#FFE27A'); g.addColorStop(0.6, '#FFA51E'); g.addColorStop(1, '#B25A0A');
      c.fillStyle = g; cp4_dot(c, ix, iy, 2.0);
      c.fillStyle = '#0B0914'; cp4_dot(c, ix + gx*0.35, iy + gy*0.3, 1.0 + 0.1*Math.sin(t*1.3));
      c.fillStyle = '#FFFFFF'; cp4_dot(c, ix - 0.7, iy - 0.75, 0.42); cp4_dot(c, ix + 0.6, iy + 0.55, 0.18);
      if (lidK > 0) { // slow blink: lids close from top and bottom
        c.save(); c.beginPath(); c.arc(x, 0, 2.5, 0, TAU); c.clip();
        c.fillStyle = '#7A5532'; c.fillRect(x - 2.6, -2.6, 5.2, 2.6*lidK); c.fillRect(x - 2.6, 2.6 - 1.2*lidK, 5.2, 1.2*lidK);
        c.restore();
      }
      // feather tuft brows
      c.fillStyle = '#4A3018';
      c.beginPath(); c.moveTo(s*1.2, -1.8); c.quadraticCurveTo(s*3.8, -3.6, s*7.6, -5.4); c.quadraticCurveTo(s*5.8, -3.2, s*6.6, -3.4);
      c.quadraticCurveTo(s*4.6, -2.4, s*1.2, -1.8); c.closePath(); c.fill();
      c.strokeStyle = '#C89A62'; c.lineWidth = 0.22; c.beginPath(); c.moveTo(s*2.2, -2.2); c.quadraticCurveTo(s*4.6, -3.4, s*6.8, -4.6); c.stroke();
    });
    // beak
    c.fillStyle = '#FFB23E'; poly(c, [[-0.85, 0.1], [0.85, 0.1], [0, 2.2]]); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.45)'; poly(c, [[-0.5, 0.25], [0, 0.25], [-0.1, 1.2]]); c.fill();
  }
};
function drawFace4(c, face, gx, gy, t) {
  const fn = cp4_FACES[face];
  if (!fn) return false;
  c.save();
  try { fn(c, +gx || 0, +gy || 0, +t || 0); } catch (e) { /* never break the paddle */ }
  c.restore();
  return true;
}

// ================================ SKINS ================================
const cp4_SKINS = {
  camo(c, look, L, Wd, t) {
    c.fillStyle = '#4C5A2E'; c.fillRect(L, -3, Wd, 6);
    const cols = ['#2E3A1C', '#7A7A48', '#5E4A2C', '#1E2414'];
    for (let k = 0; k < Wd*0.9; k++) {
      const x = L + cp4_hash(k)*Wd, y = -2.6 + cp4_hash(k + 50)*5.2, r = 0.9 + cp4_hash(k + 99)*1.4;
      c.fillStyle = cols[k % 4]; c.beginPath();
      for (let j = 0; j < 7; j++) { const an = j/7*TAU, rr2 = r*(0.65 + 0.5*cp4_hash(k*7 + j)); j ? c.lineTo(x + Math.cos(an)*rr2*1.4, y + Math.sin(an)*rr2) : c.moveTo(x + rr2*1.4, y); }
      c.closePath(); c.fill();
    }
  },
  checker(c, look, L, Wd, t) {
    const sz = 1.1, off = (t*1.6) % (sz*2);
    c.fillStyle = '#F4F4F8'; c.fillRect(L, -3, Wd, 6);
    c.fillStyle = '#121018';
    for (let x = L - sz*2 + off, i = 0; x < L + Wd; x += sz, i++) for (let j = 0; j < 4; j++) if ((i + j) % 2) c.fillRect(x, -2.2 + j*sz, sz + 0.02, sz + 0.02);
    c.fillStyle = 'rgba(255,255,255,0.22)'; c.fillRect(L, -2.2, Wd, 0.8);
  },
  circuit(c, look, L, Wd, t) {
    c.fillStyle = '#0B3A22'; c.fillRect(L, -3, Wd, 6);
    const R = L + Wd, paths = [];
    for (let k = 0, x = L; x < R; k++) {
      const y0 = [-1.3, 0.2, 1.4][k % 3], y1 = [0.4, -1.4, 0.6][k % 3], len = 3 + cp4_hash(k)*3.5, x1 = x + len*0.45;
      paths.push([[x, y0], [x1, y0], [x1 + Math.abs(y1 - y0), y1], [x + len, y1]]);
      x += len*0.7;
    }
    c.lineWidth = 0.32; c.strokeStyle = '#2FAF5E'; c.lineJoin = 'round';
    c.beginPath(); paths.forEach(p => p.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]))); c.stroke();
    c.fillStyle = '#C9A13A'; paths.forEach(p => { cp4_dot(c, p[3][0], p[3][1], 0.42); });
    c.fillStyle = '#0B3A22'; paths.forEach(p => { cp4_dot(c, p[3][0], p[3][1], 0.17); });
    // chip
    c.fillStyle = '#111018'; c.fillRect(-2.2, -1.1, 4.4, 2.2); c.fillStyle = '#9AA0A8';
    for (let x = -1.8; x < 2; x += 0.7) { c.fillRect(x, -1.5, 0.3, 0.4); c.fillRect(x, 1.1, 0.3, 0.4); }
    // light pulses travelling along traces
    c.save(); c.shadowColor = '#7CFFB0'; c.shadowBlur = 5; c.fillStyle = '#C8FFD8';
    paths.forEach((p, k) => {
      const f = (t*0.7 + cp4_hash(k + 7)) % 1, segs = [];
      let tot = 0; for (let i = 1; i < 4; i++) { const d = Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1]); segs.push(d); tot += d; }
      let d = f*tot, i = 0; while (i < 2 && d > segs[i]) { d -= segs[i]; i++; }
      const u = segs[i] ? d/segs[i] : 0, x = p[i][0] + (p[i + 1][0] - p[i][0])*u, y = p[i][1] + (p[i + 1][1] - p[i][1])*u;
      cp4_dot(c, x, y, 0.4);
    });
    c.restore();
  },
  holo(c, look, L, Wd, t) {
    c.fillStyle = cp4_lin(c, 0, -2.2, 0, 2.2, ['#E8ECF6', '#B9C2D6', '#DCE2EE']); c.fillRect(L, -3, Wd, 6);
    const g = c.createLinearGradient(L, -3, L + Wd, 3);
    for (let k = 0; k <= 12; k++) g.addColorStop(k/12, 'hsla(' + ((k*55 - t*70) % 360 + 360) % 360 + ',100%,62%,0.55)');
    c.fillStyle = g; c.fillRect(L, -3, Wd, 6);
    // fine diffraction lines
    c.strokeStyle = 'rgba(255,255,255,0.28)'; c.lineWidth = 0.12; c.beginPath();
    for (let x = L - 3; x < L + Wd + 3; x += 0.9) { c.moveTo(x, -3); c.lineTo(x + 2.2, 3); } c.stroke();
    // sweeping sheen
    const sx = L + ((t*12) % (Wd + 12)) - 6;
    c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.moveTo(sx, -3); c.lineTo(sx + 1.2, -3); c.lineTo(sx - 1.4, 3); c.lineTo(sx - 2.6, 3); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.beginPath(); c.moveTo(sx + 2, -3); c.lineTo(sx + 4.5, -3); c.lineTo(sx + 1.9, 3); c.lineTo(sx - 0.6, 3); c.fill();
  },
  marble(c, look, L, Wd, t) {
    c.fillStyle = cp4_lin(c, L, -2, L + Wd, 2, ['#F4F2EE', '#E2DFDA', '#F7F6F2', '#DAD7D2']); c.fillRect(L, -3, Wd, 6);
    c.lineCap = 'round';
    for (let k = 0; k < Wd/6; k++) {
      const x0 = L + cp4_hash(k*3)*Wd, y0 = -2.6 + cp4_hash(k*3 + 1)*1.2, dx = 4 + cp4_hash(k*3 + 2)*6;
      c.strokeStyle = k % 3 ? 'rgba(120,118,128,0.55)' : 'rgba(70,68,80,0.7)'; c.lineWidth = k % 3 ? 0.18 : 0.3;
      c.beginPath(); c.moveTo(x0, y0); c.bezierCurveTo(x0 + dx*0.3, y0 + 2, x0 + dx*0.6, y0 + 0.4, x0 + dx, y0 + 5);
      c.moveTo(x0 + dx*0.45, y0 + 1.3); c.quadraticCurveTo(x0 + dx*0.7, y0 + 1.6, x0 + dx*0.9, y0 + 0.6); c.stroke();
    }
    c.strokeStyle = 'rgba(201,170,90,0.6)'; c.lineWidth = 0.15; c.beginPath(); c.moveTo(L, 0.8); for (let x = L; x <= L + Wd; x += 2) c.lineTo(x, 0.8 + Math.sin(x*0.35)*1.1); c.stroke();
    const sx = L + ((t*6) % (Wd + 16)) - 8; c.fillStyle = 'rgba(255,255,255,0.45)'; c.beginPath(); c.moveTo(sx, -3); c.lineTo(sx + 2, -3); c.lineTo(sx, 3); c.lineTo(sx - 2, 3); c.fill();
  },
  thunder(c, look, L, Wd, t) {
    c.fillStyle = cp4_lin(c, 0, -2.2, 0, 2.2, ['#3A4060', '#1C1F34', '#0E1020']); c.fillRect(L, -3, Wd, 6);
    // drifting cloud puffs
    c.fillStyle = 'rgba(120,130,170,0.28)';
    for (let k = 0; k < Wd/4; k++) { const x = L + ((cp4_hash(k)*Wd + t*1.5) % (Wd + 4)) - 2; cp4_dot(c, x, -1.6 + cp4_hash(k + 3)*1.4, 1.1 + cp4_hash(k + 9)*0.8); }
    c.strokeStyle = 'rgba(150,180,255,0.35)'; c.lineWidth = 0.14; c.beginPath();
    for (let k = 0; k < Wd/1.6; k++) { const x = L + ((cp4_hash(k + 40)*Wd - t*6) % Wd + Wd) % Wd, y = -2.6 + ((cp4_hash(k + 77)*6 + t*9) % 6); c.moveTo(x, y); c.lineTo(x - 0.4, y + 1.1); }
    c.stroke();
    c.strokeStyle = 'rgba(140,170,255,0.45)'; c.lineWidth = 0.25; c.strokeRect(L - 1, -2.1, Wd + 2, 4.2);
    // occasional lightning strikes
    const cyc = 1.9, n = Math.floor(t/cyc), ph = t - n*cyc, on = ph < 0.22 && (ph < 0.06 || ph > 0.12);
    if (on) {
      const bx = L + 3 + cp4_hash(n)*(Wd - 6);
      c.fillStyle = 'rgba(190,210,255,0.28)'; c.fillRect(L, -3, Wd, 6);
      c.save(); c.shadowColor = '#9FD0FF'; c.shadowBlur = 8; c.strokeStyle = '#EAF4FF'; c.lineWidth = 0.4; c.lineJoin = 'miter';
      c.beginPath(); let x = bx, y = -2.6; c.moveTo(x, y);
      for (let i = 0; i < 5; i++) { x += (cp4_hash(n*5 + i) - 0.5)*2.2; y += 1.2; c.lineTo(x, y); if (i === 2) { c.moveTo(x, y); c.lineTo(x + 1.6, y + 1.2); c.moveTo(x, y); } }
      c.stroke(); c.restore();
    } else {
      const fl = Math.max(0, Math.sin(t*7.3)*Math.sin(t*3.1));
      c.fillStyle = 'rgba(160,190,255,' + (fl*0.12) + ')'; c.fillRect(L, -3, Wd, 6);
    }
  },
  prism(c, look, L, Wd, t) {
    c.fillStyle = '#100C24'; c.fillRect(L, -3, Wd, 6);
    const st = 2.6, R = L + Wd;
    // triangular facets, each refracting a moving rainbow
    for (let x = L - st, i = 0; x < R + st; x += st/2, i++) {
      const up = i % 2 === 0, y0 = up ? 2.4 : -2.4, y1 = -y0;
      const hue = ((x - L)*9 - t*120 + (up ? 0 : 40)) % 360, lit = 55 + 18*Math.sin(t*2 + i*0.9);
      const g = c.createLinearGradient(x, y0, x + st/2, y1);
      g.addColorStop(0, 'hsl(' + ((hue + 360) % 360) + ',95%,' + lit + '%)'); g.addColorStop(1, 'hsl(' + ((hue + 420) % 360) + ',95%,' + (lit - 18) + '%)');
      c.fillStyle = g; poly(c, [[x, y0], [x + st, y0], [x + st/2, y1]]); c.fill();
    }
    c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.15; c.beginPath();
    for (let x = L - st, i = 0; x < R + st; x += st/2, i++) { const y0 = i % 2 === 0 ? 2.4 : -2.4; c.moveTo(x, y0); c.lineTo(x + st/2, -y0); }
    c.stroke();
    // bright refraction band
    const bx = L + ((t*10) % (Wd + 10)) - 5;
    const bg = c.createLinearGradient(bx - 3, 0, bx + 3, 0); bg.addColorStop(0, 'rgba(255,255,255,0)'); bg.addColorStop(0.5, 'rgba(255,255,255,0.6)'); bg.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = bg; c.fillRect(bx - 3, -3, 6, 6);
    // glints
    c.fillStyle = '#FFFFFF'; c.shadowColor = '#FFFFFF'; c.shadowBlur = 4;
    for (let k = 0; k < Wd/4; k++) {
      const ph = Math.sin(t*3.1 + k*2.7); if (ph < 0.55) continue;
      star4(c, L + 1.5 + cp4_hash(k + 21)*(Wd - 3), -1.6 + cp4_hash(k + 4)*3.2, 0.3 + 2.2*(ph - 0.55));
    }
    c.shadowBlur = 0;
  }
};
function drawSkin4(c, s, look, L, Wd, t) {
  const fn = cp4_SKINS[s];
  if (!fn) return false;
  c.save();
  try { fn(c, look || {}, L, Wd, +t || 0); } catch (e) { /* never break the paddle */ }
  c.restore();
  return true;
}

