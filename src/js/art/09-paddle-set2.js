// ===== Trepong cosmetics pack: hats / faces / skins (drawHat2, drawFace2, drawSkin2) =====
// Same local units as drawHat/drawFace/drawSkin: 1 = 0.01 world, origin at paddle centre, -y = "up".
function cos_dot(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
function cos_eye(c, x, gx, gy, blink, iris) {
  c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, 0, 1.8, blink ? 0.3 : 1.7, 0, 0, TAU); c.fill();
  if (blink) return;
  if (iris) { c.fillStyle = iris; cos_dot(c, x + gx*0.7, gy*0.7, 1.05); }
  c.fillStyle = '#0B0914'; cos_dot(c, x + gx*0.8, gy*0.8, iris ? 0.5 : 0.9);
}

function drawHat2(c, hat, col, t) {
  if (hat === 'pirate') {
    // front-on tricorn: smiling lower brim, arched crown, swept-up corners
    c.beginPath(); c.moveTo(-11, -7.5); c.quadraticCurveTo(-6, 0.8, 0, 0.8); c.quadraticCurveTo(6, 0.8, 11, -7.5);
    c.quadraticCurveTo(8, -7.2, 6.2, -9.6); c.bezierCurveTo(4, -13.8, -4, -13.8, -6.2, -9.6); c.quadraticCurveTo(-8, -7.2, -11, -7.5); c.closePath();
    c.fillStyle = '#17131F'; c.fill();
    c.strokeStyle = '#FFC94A'; c.lineWidth = 0.75; c.lineJoin = 'round'; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.12)'; c.lineWidth = 0.5;
    c.beginPath(); c.moveTo(-8.6, -5); c.quadraticCurveTo(0, -1.2, 8.6, -5); c.stroke();
    // skull & crossbones
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 0.65; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-2.4, -5.2); c.lineTo(2.4, -8.6); c.moveTo(2.4, -5.2); c.lineTo(-2.4, -8.6); c.stroke();
    c.fillStyle = '#FFFFFF'; cos_dot(c, 0, -7.6, 1.55); c.fillRect(-0.85, -6.8, 1.7, 1.2);
    c.fillStyle = '#17131F'; cos_dot(c, -0.55, -7.6, 0.42); cos_dot(c, 0.55, -7.6, 0.42);
    return true;
  }
  if (hat === 'beanie') {
    const w = Math.sin(t*3)*0.7, w2 = Math.cos(t*3.7)*0.3;
    c.save();
    c.beginPath(); c.moveTo(-7, -1.5); c.bezierCurveTo(-7, -12.5, 7, -12.5, 7, -1.5); c.closePath();
    c.fillStyle = col; c.fill(); c.clip();
    c.fillStyle = 'rgba(255,255,255,0.38)'; c.fillRect(-8, -6.6, 16, 1.5); c.fillRect(-8, -9.4, 16, 1.1);
    c.strokeStyle = 'rgba(0,0,0,0.16)'; c.lineWidth = 0.35;
    c.beginPath(); for (let x = -6; x <= 6; x += 2) { c.moveTo(x, -1); c.quadraticCurveTo(x*0.9, -6, x*0.55, -11); } c.stroke();
    c.restore();
    // ribbed cuff
    c.fillStyle = col; c.beginPath(); if (c.roundRect) c.roundRect(-7.8, -3.4, 15.6, 3.6, 1.2); else c.rect(-7.8, -3.4, 15.6, 3.6); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.22)'; c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.32)'; c.lineWidth = 0.45;
    c.beginPath(); for (let x = -6.6; x <= 6.7; x += 1.65) { c.moveTo(x, -2.8); c.lineTo(x, -0.4); } c.stroke();
    // pom-pom
    const px = w, py = -11.6 + w2;
    c.fillStyle = '#F3F0FF'; cos_dot(c, px, py, 2.7);
    c.fillStyle = '#D8D2F0'; cos_dot(c, px + 0.9, py + 0.9, 1.1); cos_dot(c, px - 1.2, py + 0.4, 0.8);
    c.fillStyle = '#FFFFFF'; cos_dot(c, px - 0.8, py - 0.9, 0.8);
    return true;
  }
  if (hat === 'icecrown') {
    const shards = [[-6.2, 7, -0.28, 1.6], [6.2, 7, 0.28, 1.6], [-3.4, 10.5, -0.12, 1.8], [3.4, 10.5, 0.12, 1.8], [0, 14, 0, 2.1]];
    c.shadowColor = '#9EEBFF'; c.shadowBlur = 8;
    c.fillStyle = 'rgba(200,245,255,0.75)'; c.beginPath(); if (c.roundRect) c.roundRect(-8, -2.4, 16, 2.6, 0.8); else c.rect(-8, -2.4, 16, 2.6); c.fill();
    c.shadowBlur = 0;
    c.lineJoin = 'round';
    shards.forEach(s => {
      const [x, h, a, w] = s;
      c.save(); c.translate(x, -1.5); c.rotate(a);
      poly(c, [[-w, 0], [-w*0.95, -h*0.55], [0, -h], [w*0.95, -h*0.55], [w, 0]]);
      c.fillStyle = 'rgba(150,225,255,0.55)'; c.fill();
      c.strokeStyle = 'rgba(235,252,255,0.95)'; c.lineWidth = 0.4; c.stroke();
      c.fillStyle = 'rgba(255,255,255,0.55)'; poly(c, [[-w*0.6, -0.4], [-w*0.55, -h*0.5], [0, -h*0.92], [-w*0.05, -h*0.45]]); c.fill();
      c.restore();
    });
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(-7.2, -1.9, 14.4, 0.45);
    // sparkle glints, one at a time
    const pts = [[0, -11.5], [-3.6, -8], [4.2, -6.5], [-6.6, -4.5], [6, -3.2]];
    for (let k = 0; k < pts.length; k++) {
      const ph = Math.sin(t*2.6 + k*1.9); if (ph < 0.55) continue;
      c.fillStyle = '#FFFFFF'; c.shadowColor = '#CFF6FF'; c.shadowBlur = 6; star4(c, pts[k][0], pts[k][1], 0.6 + 2.6*(ph - 0.55));
    }
    c.shadowBlur = 0;
    return true;
  }
  if (hat === 'voidhorns') {
    const p = 0.5 + 0.5*Math.sin(t*3);
    [-1, 1].forEach(s => {
      c.beginPath(); c.moveTo(s*2.5, 0.2); c.bezierCurveTo(s*12.5, -0.5, s*13.5, -10, s*8, -16.5);
      c.bezierCurveTo(s*10, -9.5, s*8.5, -4, s*6.6, 0.2); c.closePath();
      c.fillStyle = '#231632'; c.fill();
      c.strokeStyle = '#4E3570'; c.lineWidth = 0.5; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.18)'; c.lineWidth = 0.45;
      c.beginPath(); c.moveTo(s*3.6, -0.8); c.bezierCurveTo(s*10.6, -1.6, s*11.8, -9, s*8.6, -15); c.stroke();
    });
    c.strokeStyle = 'rgba(' + Math.round(200 + 55*p) + ',' + Math.round(110 + 110*p) + ',255,1)';
    c.shadowColor = '#B04CFF'; c.shadowBlur = 5 + 9*p; c.lineWidth = 0.55 + 0.25*p; c.lineJoin = 'round';
    c.beginPath();
    [-1, 1].forEach(s => {
      c.moveTo(s*4.4, -0.4); c.lineTo(s*6.6, -1.6); c.lineTo(s*8.4, -1.4); c.lineTo(s*9.6, -4); c.lineTo(s*10.9, -5.2);
      c.lineTo(s*10.4, -8.4); c.lineTo(s*11, -10); c.lineTo(s*9.4, -13.2);
      c.moveTo(s*9.6, -4); c.lineTo(s*8.6, -5.8);
    });
    c.stroke(); c.shadowBlur = 0;
    c.fillStyle = 'rgba(230,200,255,' + (0.4 + 0.6*p) + ')'; cos_dot(c, -9.4, -13.2, 0.55); cos_dot(c, 9.4, -13.2, 0.55);
    return true;
  }
  if (hat === 'emperor') {
    const bob = Math.sin(t*2)*0.6, oy = -14.6 + bob, p = 0.5 + 0.5*Math.sin(t*3.4);
    poly(c, [[-7.5, 0], [-7.5, -8], [-5.6, -4.6], [-3.8, -10], [-1.9, -5.4], [0, -11.2], [1.9, -5.4], [3.8, -10], [5.6, -4.6], [7.5, -8], [7.5, 0]]);
    c.fillStyle = '#1C1229'; c.fill();
    c.strokeStyle = '#6B3FB0'; c.lineWidth = 0.45; c.lineJoin = 'miter'; c.stroke();
    c.fillStyle = '#2E1F45'; c.fillRect(-7.5, -2.6, 15, 2.6);
    c.fillStyle = '#B57CFF'; c.shadowColor = '#B04CFF'; c.shadowBlur = 5;
    [-4.5, 0, 4.5].forEach(x => { poly(c, [[x, -2.4], [x + 0.9, -1.3], [x, -0.2], [x - 0.9, -1.3]]); c.fill(); });
    // floating eye-orb
    c.shadowBlur = 8 + 10*p; c.fillStyle = '#C79BFF'; cos_dot(c, 0, oy, 2.2);
    c.shadowBlur = 0;
    c.fillStyle = '#F4EAFF'; c.beginPath(); c.ellipse(0, oy, 1.9, 1.15, 0, 0, TAU); c.fill();
    c.fillStyle = '#5A1FA8'; cos_dot(c, 0, oy, 0.8);
    c.fillStyle = '#0B0914'; c.beginPath(); c.ellipse(0, oy, 0.25, 0.75, 0, 0, TAU); c.fill();
    // orbiting motes
    c.fillStyle = '#D9B8FF';
    for (let k = 0; k < 5; k++) {
      const a = t*1.6 + k*TAU/5, z = Math.sin(a);
      c.globalAlpha = 0.35 + 0.45*(z*0.5 + 0.5); c.fillRect(Math.cos(a)*4.8 - 0.3, oy + z*1.6 - 0.3, 0.6, 0.6);
    }
    c.globalAlpha = 1;
    return true;
  }
  if (hat === 'witch') {
    const sw = Math.sin(t*2.2)*1.1;
    c.beginPath(); c.moveTo(-5.4, -1); c.lineTo(-2.2, -10); c.quadraticCurveTo(-0.5, -15.5, 6.4 + sw, -16 + sw*0.3);
    c.quadraticCurveTo(2.4, -12.4, 2.4, -9.6); c.lineTo(5.4, -1); c.closePath();
    c.fillStyle = '#3B1A63'; c.fill();
    c.save(); c.clip();
    c.fillStyle = '#FF8A3D'; c.fillRect(-7, -4.2, 14, 2.3);
    c.fillStyle = 'rgba(255,255,255,0.08)'; c.fillRect(-6, -16, 3.8, 16);
    c.restore();
    c.fillStyle = '#2A1048'; c.beginPath(); c.ellipse(0, -0.8, 10.5, 1.9, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(181,124,255,0.6)'; c.lineWidth = 0.35; c.stroke();
    c.strokeStyle = '#FFD84A'; c.lineWidth = 0.55; c.strokeRect(-1.1, -4.2, 2.2, 2.3);
    return true;
  }
  if (hat === 'pumpkin') {
    const fl = 0.75 + 0.25*Math.sin(t*13)*Math.sin(t*7.3);
    c.fillStyle = '#4A6B1A'; c.beginPath(); c.moveTo(-0.9, -10.8); c.quadraticCurveTo(-0.6, -13.6, 1.6, -14.2); c.lineTo(1.9, -13.2); c.quadraticCurveTo(0.6, -12.8, 0.9, -10.8); c.closePath(); c.fill();
    c.fillStyle = '#FF7A1A'; c.beginPath(); c.ellipse(0, -5.7, 8.6, 5.7, 0, 0, TAU); c.fill();
    c.strokeStyle = '#C9500A'; c.lineWidth = 0.5;
    c.beginPath(); c.ellipse(0, -5.7, 5.2, 5.6, 0, 0, TAU); c.stroke();
    c.beginPath(); c.ellipse(0, -5.7, 1.7, 5.6, 0, 0, TAU); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.beginPath(); c.ellipse(-5.6, -7.6, 1.2, 2.4, 0.3, 0, TAU); c.fill();
    // carved face, flickering candle light
    c.fillStyle = 'rgb(255,' + Math.round(170 + 60*fl) + ',60)'; c.shadowColor = '#FFB23E'; c.shadowBlur = 4 + 8*fl;
    poly(c, [[-4.6, -5.6], [-1.8, -5.6], [-3.2, -8.4]]); c.fill();
    poly(c, [[1.8, -5.6], [4.6, -5.6], [3.2, -8.4]]); c.fill();
    poly(c, [[-4.8, -3.6], [-3, -2.6], [-2, -3.5], [-0.8, -2.2], [0.4, -3.3], [1.6, -2.2], [2.8, -3.4], [4.8, -3.6], [3.4, -1.5], [-3.4, -1.5]]); c.fill();
    c.shadowBlur = 0;
    return true;
  }
  if (hat === 'bat') {
    const f = Math.sin(t*5);
    c.fillStyle = '#3A2A55';
    [-1, 1].forEach(s => {
      c.save(); c.translate(s*1.8, -4.6); c.rotate(-s*(0.15 + f*0.35));
      c.beginPath(); c.moveTo(0, -1); c.lineTo(s*3, -3.6); c.lineTo(s*8.2, -2.6);
      c.quadraticCurveTo(s*7.2, -1.3, s*7, 0.4); c.quadraticCurveTo(s*6, -0.8, s*4.6, 0.5); c.quadraticCurveTo(s*3.7, -0.6, s*2.2, 0.8); c.lineTo(0, 1.4); c.closePath();
      c.fill(); c.restore();
    });
    c.fillStyle = '#4A3870';
    poly(c, [[-2.2, -6.6], [-1.6, -10.2], [-0.4, -7.5]]); c.fill(); poly(c, [[2.2, -6.6], [1.6, -10.2], [0.4, -7.5]]); c.fill();
    c.beginPath(); c.ellipse(0, -4.3, 2.8, 3.5, 0, 0, TAU); c.fill();
    c.fillStyle = '#6E5A99'; c.beginPath(); c.ellipse(0, -3.2, 1.6, 2, 0, 0, TAU); c.fill();
    c.fillStyle = '#FFFFFF'; cos_dot(c, -1.05, -5.5, 0.85); cos_dot(c, 1.05, -5.5, 0.85);
    c.fillStyle = '#0B0914'; cos_dot(c, -0.9, -5.4, 0.42); cos_dot(c, 1.2, -5.4, 0.42);
    c.fillStyle = '#FFFFFF'; poly(c, [[-0.7, -4.15], [-0.25, -4.15], [-0.47, -3.4]]); c.fill(); poly(c, [[0.25, -4.15], [0.7, -4.15], [0.47, -3.4]]); c.fill();
    c.strokeStyle = '#2A1F3D'; c.lineWidth = 0.45; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-0.9, -1); c.lineTo(-1.1, 0.2); c.moveTo(0.9, -1); c.lineTo(1.1, 0.2); c.stroke();
    return true;
  }
  if (hat === 'candycorn') {
    const by = -0.4 - 0.5*(Math.sin(t*3) + 1);
    c.save(); c.translate(0, by);
    c.beginPath(); c.moveTo(-6, -0.8); c.quadraticCurveTo(0, 1.4, 6, -0.8); c.quadraticCurveTo(4.6, -9, 0.7, -14.6);
    c.quadraticCurveTo(0, -15.4, -0.7, -14.6); c.quadraticCurveTo(-4.6, -9, -6, -0.8); c.closePath();
    c.save(); c.clip();
    c.fillStyle = '#FFD23A'; c.fillRect(-7, -5, 14, 7);
    c.fillStyle = '#FF8A1F'; c.fillRect(-7, -10.2, 14, 5.3);
    c.fillStyle = '#FFF8EC'; c.fillRect(-7, -16, 14, 5.9);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.ellipse(-2.6, -6, 0.9, 4.6, 0.32, 0, TAU); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.1)'; c.beginPath(); c.ellipse(4.4, -3, 1.3, 4.5, -0.3, 0, TAU); c.fill();
    c.restore(); c.restore();
    return true;
  }
  return false;
}

function drawFace2(c, face, gx, gy, t) {
  const blink = (t % 3.7) < 0.12;
  if (face === 'eyepatch') {
    cos_eye(c, -4.2, gx, gy, blink);
    c.strokeStyle = '#0B0914'; c.lineWidth = 0.45; c.beginPath(); c.moveTo(1, -2.9); c.lineTo(7.4, 2.9); c.stroke();
    c.fillStyle = '#0B0914'; c.beginPath(); c.ellipse(4.2, 0.1, 2.3, 1.9, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.35; c.beginPath(); c.ellipse(4.2, 0.1, 1.6, 1.25, 0, Math.PI*1.1, Math.PI*1.45); c.stroke();
    return true;
  }
  if (face === 'frozen') {
    [-1, 1].forEach(s => cos_eye(c, s*4.2, gx, gy, blink, '#4FC8FF'));
    c.fillStyle = '#E6FAFF'; c.shadowColor = '#9EEBFF'; c.shadowBlur = 4;
    c.beginPath();
    [-1, 1].forEach(s => {
      const x = s*4.2;
      c.moveTo(x - 1.6, 1.5); c.lineTo(x - 1.1, 3.1); c.lineTo(x - 0.6, 1.6);
      c.lineTo(x - 0.1, 3.8); c.lineTo(x + 0.5, 1.6); c.lineTo(x + 0.9, 2.7); c.lineTo(x + 1.4, 1.5); c.closePath();
      // frosty brow
      c.moveTo(x - 2.2, -2.3); c.lineTo(x - 1, -2.9); c.lineTo(x + 0.3, -2.5); c.lineTo(x + 1.4, -3); c.lineTo(x + 2.3, -2.3); c.lineTo(x, -1.9); c.closePath();
    });
    c.fill(); c.shadowBlur = 0;
    return true;
  }
  if (face === 'voideyes') {
    const p = 0.5 + 0.5*Math.sin(t*2.2);
    c.shadowColor = '#B04CFF'; c.shadowBlur = 5 + 8*p;
    c.fillStyle = '#9B4DFF'; [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s*4.2, 0, 2, 1.5, 0, 0, TAU); c.fill(); });
    c.shadowBlur = 0;
    c.fillStyle = 'rgb(' + Math.round(220 + 35*p) + ',' + Math.round(190 + 50*p) + ',255)';
    [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s*4.2 + gx*0.6, gy*0.4, 1, 0.75, 0, 0, TAU); c.fill(); });
    c.fillStyle = '#E2C8FF';
    for (let k = 0; k < 6; k++) {
      const s = k % 2 ? 1 : -1, ph = (t*0.55 + k*0.37) % 1;
      c.globalAlpha = (1 - ph)*0.9; c.fillRect(s*4.2 + Math.sin(k*2.3 + t*1.3)*1.6 - 0.25, -1.2 - ph*4.2, 0.5, 0.5);
    }
    c.globalAlpha = 1;
    return true;
  }
  if (face === 'skeleton') {
    c.fillStyle = '#0B0914';
    [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s*4.2, -0.2, 2.1, blink ? 0.5 : 1.85, 0, 0, TAU); c.fill(); });
    poly(c, [[0, -0.4], [0.75, 0.9], [-0.75, 0.9]]); c.fill();
    if (!blink) {
      c.fillStyle = '#9BFFEA'; c.shadowColor = '#9BFFEA'; c.shadowBlur = 5;
      [-1, 1].forEach(s => cos_dot(c, s*4.2 + gx*0.7, -0.2 + gy*0.6, 0.48));
      c.shadowBlur = 0;
    }
    c.fillStyle = '#F2EEE4'; c.fillRect(-2.7, 1.3, 5.4, 1.3);
    c.strokeStyle = '#0B0914'; c.lineWidth = 0.28;
    c.beginPath(); c.moveTo(-2.7, 1.95); c.lineTo(2.7, 1.95);
    for (let x = -1.8; x < 2.7; x += 0.9) { c.moveTo(x, 1.3); c.lineTo(x, 2.6); }
    c.stroke();
    return true;
  }
  if (face === 'stitch') {
    cos_eye(c, -4.2, gx, gy, blink);
    c.save(); c.translate(4.2, 0); c.scale(0.85, 0.85); cos_eye(c, 0, gx, gy, blink); c.restore();
    c.strokeStyle = '#2A1A2E'; c.lineWidth = 0.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(-1.6, -2.4); c.lineTo(-0.4, -0.8); c.lineTo(0.3, 0.4); c.lineTo(1.6, 2.4);
    [[-1.5, -1.7], [-0.25, -0.5], [0.9, 1.1]].forEach(p => { c.moveTo(p[0] - 0.8, p[1] + 0.45); c.lineTo(p[0] + 0.8, p[1] - 0.45); });
    // small cross-stitched scar over the right brow
    c.moveTo(2.4, -2.3); c.lineTo(6.6, -1.9);
    [3.2, 4.5, 5.8].forEach(x => { c.moveTo(x, -2.85); c.lineTo(x + 0.1, -1.35); });
    c.stroke();
    return true;
  }
  if (face === 'ghostface') {
    const w = Math.sin(t*2.1)*0.35, k = 1 + 0.06*Math.sin(t*2.7);
    c.save(); c.translate(w, 0); c.scale(1, k);
    c.fillStyle = 'rgba(255,255,255,0.55)'; c.beginPath(); c.ellipse(0, 0.1, 7.8, 2.9, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(11,9,20,0.9)';
    [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s*3.4, -0.5, 1.35, 2.1, s*0.35, 0, TAU); c.fill(); });
    c.beginPath(); c.ellipse(0, 1.5, 0.8, 1.05, 0, 0, TAU); c.fill();
    c.restore();
    return true;
  }
  return false;
}

function drawSkin2(c, s, look, L, Wd, t) {
  const R = L + Wd;
  if (s === 'neonwave') {
    const g = c.createLinearGradient(0, -2.2, 0, 2.2); g.addColorStop(0, '#26104F'); g.addColorStop(1, '#070726');
    c.fillStyle = g; c.fillRect(L, -3, Wd, 6);
    c.lineWidth = 0.4; c.lineJoin = 'round';
    [['#3EE6FF', -0.9, 0], ['#FF4F8B', 0.9, 2.1]].forEach(w => {
      c.strokeStyle = w[0]; c.shadowColor = w[0]; c.shadowBlur = 4; c.beginPath();
      for (let x = L; x <= R + 1.5; x += 1.5) { const y = w[1] + 0.65*Math.sin(x*0.45 - t*3 + w[2]); x === L ? c.moveTo(x, y) : c.lineTo(x, y); }
      c.stroke();
    });
    c.shadowBlur = 0;
    return true;
  }
  if (s === 'icecrystal') {
    const g = c.createLinearGradient(0, -2.2, 0, 2.2); g.addColorStop(0, '#E4F8FF'); g.addColorStop(1, '#79C3EE');
    c.fillStyle = g; c.fillRect(L, -3, Wd, 6);
    c.fillStyle = 'rgba(255,255,255,0.42)'; c.beginPath();
    for (let x = L, k = 0; x < R; x += 4.2, k++) {
      const u = k % 2 ? 1 : -1;
      c.moveTo(x, -2.4*u); c.lineTo(x + 2.2, 0.6*u); c.lineTo(x + 4.2, -2.4*u); c.closePath();
    }
    c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.22; c.stroke();
    c.fillStyle = '#FFFFFF';
    for (let k = 0; k < Wd/5; k++) {
      const ph = Math.sin(t*2.4 + k*2.1); if (ph < 0.4) continue;
      star4(c, L + 2 + ((k*7.3) % (Wd - 3)), ((k*3.1) % 3) - 1.5, 0.3 + 1.4*(ph - 0.4));
    }
    return true;
  }
  if (s === 'rift') {
    c.fillStyle = '#05030A'; c.fillRect(L, -3, Wd, 6);
    const f = 0.65 + 0.35*Math.abs(Math.sin(t*17)*Math.sin(t*5.3));
    c.beginPath();
    for (let x = L, k = 0; x <= R + 2.2; x += 2.2, k++) { const y = (((k*37) % 7) - 3)*0.38; k ? c.lineTo(x, y) : c.moveTo(x, y); }
    for (let x = L + 4, k = 0; x < R - 2; x += 8.8, k++) { const y = (((Math.round((x - L)/2.2)*37) % 7) - 3)*0.38; c.moveTo(x, y); c.lineTo(x + 1.2, y + (k % 2 ? 1.8 : -1.8)); }
    c.lineJoin = 'miter';
    c.globalAlpha = f; c.strokeStyle = '#9B4DFF'; c.shadowColor = '#B04CFF'; c.shadowBlur = 8; c.lineWidth = 1.1; c.stroke();
    c.shadowBlur = 0; c.globalAlpha = 1; c.strokeStyle = '#F4E4FF'; c.lineWidth = 0.32; c.stroke();
    return true;
  }
  if (s === 'pumpkin') {
    const p = 0.5 + 0.5*Math.sin(t*2.5);
    const g = c.createLinearGradient(0, -2.2, 0, 2.2);
    g.addColorStop(0, '#FF9A3A'); g.addColorStop(0.5, 'rgb(255,' + Math.round(150 + 40*p) + ',70)'); g.addColorStop(1, '#E0600F');
    c.fillStyle = g; c.fillRect(L, -3, Wd, 6);
    c.strokeStyle = '#B4480A'; c.lineWidth = 0.5; c.beginPath();
    for (let x = L + 2.5; x < R; x += 3.4) { c.moveTo(x, -2.4); c.quadraticCurveTo(x + 0.9, 0, x, 2.4); }
    c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.18)'; c.fillRect(L, -1.9, Wd, 0.5);
    return true;
  }
  if (s === 'web') {
    c.fillStyle = '#16112A'; c.fillRect(L, -3, Wd, 6);
    c.strokeStyle = 'rgba(240,238,255,0.75)'; c.lineWidth = 0.22; c.beginPath();
    for (let cx = L + 5, n = 0; cx < R + 4 && n < 4; cx += 11, n++) {
      const cy = n % 2 ? 1.6 : -1.6;
      for (let a = 0; a < 6; a++) { const an = a*TAU/6 + 0.3; c.moveTo(cx, cy); c.lineTo(cx + Math.cos(an)*7, cy + Math.sin(an)*7); }
      [2.2, 4.4].forEach(r => {
        for (let a = 0; a <= 6; a++) {
          const an = a*TAU/6 + 0.3, x = cx + Math.cos(an)*r, y = cy + Math.sin(an)*r;
          if (a === 0) c.moveTo(x, y); else { const am = an - TAU/12; c.quadraticCurveTo(cx + Math.cos(am)*r*0.72, cy + Math.sin(am)*r*0.72, x, y); }
        }
      });
    }
    c.stroke();
    return true;
  }
  if (s === 'bones') {
    c.fillStyle = '#1C1530'; c.fillRect(L, -3, Wd, 6);
    c.fillStyle = '#F2EEE4'; c.beginPath();
    for (let x = L + 3, k = 0; x < R - 1; x += 5, k++) {
      const a = k % 2 ? 0.35 : -0.35, dx = Math.cos(a)*1.5, dy = Math.sin(a)*1.5, nx = -Math.sin(a)*0.45, ny = Math.cos(a)*0.45;
      c.moveTo(x - dx + nx*0.7, -dy + ny*0.7); c.lineTo(x + dx + nx*0.7, dy + ny*0.7); c.lineTo(x + dx - nx*0.7, dy - ny*0.7); c.lineTo(x - dx - nx*0.7, -dy - ny*0.7); c.closePath();
      [[-1, 1], [-1, -1], [1, 1], [1, -1]].forEach(e => { const ex = x + e[0]*dx + e[1]*nx, ey = e[0]*dy + e[1]*ny; c.moveTo(ex + 0.55, ey); c.arc(ex, ey, 0.55, 0, TAU); });
    }
    c.fill();
    return true;
  }
  return false;
}

