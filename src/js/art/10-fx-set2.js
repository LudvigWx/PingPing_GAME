// ---------- extra cosmetics: trails (waves, snow, void, bats, candy, souls) + victory fx (tide, snowstorm, supernova, ghosts, batswarm) ----------
// Shared shapes. All take a context and leave fill/stroke styles to the caller unless noted.
function cos_flake(c, x, y, s, rot, branches) {
  c.beginPath();
  for (let a = 0; a < 6; a++) {
    const an = rot + a*TAU/6, ca = Math.cos(an), sa = Math.sin(an);
    c.moveTo(x, y); c.lineTo(x + ca*s, y + sa*s);
    if (branches) {
      const bx = x + ca*s*0.55, by = y + sa*s*0.55, b = s*0.32;
      c.moveTo(bx, by); c.lineTo(bx + Math.cos(an + 0.8)*b, by + Math.sin(an + 0.8)*b);
      c.moveTo(bx, by); c.lineTo(bx + Math.cos(an - 0.8)*b, by + Math.sin(an - 0.8)*b);
    }
  }
  c.stroke();
}
// Bat silhouette centred at x,y; s = half wingspan; f = flap -1..1 (1 = wings up).
function cos_bat(c, x, y, s, f) {
  const up = f*s*0.55;
  c.beginPath();
  c.moveTo(x, y - s*0.22);
  c.lineTo(x - s*0.13, y - s*0.42); c.lineTo(x - s*0.16, y - s*0.16);           // left ear
  c.quadraticCurveTo(x - s*0.55, y - s*0.25 - up, x - s, y - s*0.1 - up*1.4);   // left wing top edge
  c.quadraticCurveTo(x - s*0.82, y + s*0.08 - up*0.6, x - s*0.68, y + s*0.12 - up*0.7);
  c.quadraticCurveTo(x - s*0.52, y + s*0.02 - up*0.4, x - s*0.38, y + s*0.2 - up*0.4);
  c.quadraticCurveTo(x - s*0.25, y + s*0.1, x - s*0.1, y + s*0.28);
  c.lineTo(x, y + s*0.36);
  c.lineTo(x + s*0.1, y + s*0.28);
  c.quadraticCurveTo(x + s*0.25, y + s*0.1, x + s*0.38, y + s*0.2 - up*0.4);
  c.quadraticCurveTo(x + s*0.52, y + s*0.02 - up*0.4, x + s*0.68, y + s*0.12 - up*0.7);
  c.quadraticCurveTo(x + s*0.82, y + s*0.08 - up*0.6, x + s, y - s*0.1 - up*1.4);
  c.quadraticCurveTo(x + s*0.55, y - s*0.25 - up, x + s*0.16, y - s*0.16);
  c.lineTo(x + s*0.13, y - s*0.42);                                             // right ear
  c.closePath();
}
// Cute ghost body centred at x,y with half-width s; ph animates the wavy hem.
function cos_ghostPath(c, x, y, s, ph) {
  c.beginPath();
  c.arc(x, y - s*0.2, s, Math.PI, 0);
  c.lineTo(x + s, y + s*0.9);
  for (let k = 0; k < 4; k++) {
    const x0 = x + s - k*s*0.5, x1 = x0 - s*0.5, dip = (k % 2 ? 0.55 : 0.75) + Math.sin(ph + k)*0.12;
    c.quadraticCurveTo((x0 + x1)/2, y + s*(0.9 + dip*0.5), x1, y + s*0.9);
  }
  c.closePath();
}
function cos_ghost(c, x, y, s, ph, a) {
  c.globalAlpha = a*0.62; c.fillStyle = '#EFFFF8';
  cos_ghostPath(c, x, y, s, ph); c.fill();
  c.globalAlpha = a*0.9; c.fillStyle = '#14102A';
  const look = Math.sin(ph*0.7)*s*0.08;
  c.beginPath(); c.ellipse(x - s*0.36 + look, y - s*0.22, s*0.13, s*0.19, 0, 0, TAU); c.ellipse(x + s*0.36 + look, y - s*0.22, s*0.13, s*0.19, 0, 0, TAU); c.fill();
  c.beginPath(); c.ellipse(x + look, y + s*0.22, s*0.12, s*0.15 + Math.sin(ph*2)*s*0.04, 0, 0, TAU); c.fill();
  c.globalAlpha = a*0.5; c.fillStyle = '#FF7AB0';
  c.beginPath(); c.arc(x - s*0.62, y + s*0.05, s*0.12, 0, TAU); c.arc(x + s*0.62, y + s*0.05, s*0.12, 0, TAU); c.fill();
  c.globalAlpha = 1;
}
function cos_candyCorn(c, s) {
  // Triangle pointing up, 3 bands: yellow base, orange middle, white tip. Drawn around origin.
  const h = s*1.25, w = s*0.75;
  c.fillStyle = '#FFD23A'; c.beginPath(); c.moveTo(-w, h*0.45); c.lineTo(w, h*0.45); c.lineTo(w*0.62, h*0.05); c.lineTo(-w*0.62, h*0.05); c.closePath(); c.fill();
  c.fillStyle = '#FF7A1A'; c.beginPath(); c.moveTo(-w*0.62, h*0.05); c.lineTo(w*0.62, h*0.05); c.lineTo(w*0.26, -h*0.35); c.lineTo(-w*0.26, -h*0.35); c.closePath(); c.fill();
  c.fillStyle = '#FFF6E8'; c.beginPath(); c.moveTo(-w*0.26, -h*0.35); c.lineTo(w*0.26, -h*0.35); c.lineTo(0, -h*0.62); c.closePath(); c.fill();
}

// ---------- trails ----------
function trailDot2(c, style, col, x, y, r, k, idx, t) {
  if (style === 'waves') {
    const s = r*(0.45 + 0.75*k), bob = Math.sin(t*6 + idx*0.9)*r*0.35, cx = x, cy = y + bob;
    c.lineCap = 'round';
    c.strokeStyle = idx % 3 === 0 ? '#FFFFFF' : idx % 3 === 1 ? '#3EE6FF' : '#9FF4FF';
    c.lineWidth = Math.max(1, r*0.26);
    c.beginPath(); c.arc(cx, cy, s, Math.PI*0.75, Math.PI*2.15); c.stroke();               // the curl
    c.fillStyle = '#E8FDFF';
    c.beginPath(); c.arc(cx + Math.cos(Math.PI*2.15)*s, cy + Math.sin(Math.PI*2.15)*s, Math.max(0.8, r*0.2*(0.5 + k)), 0, TAU); c.fill(); // foam tip
    c.lineCap = 'butt';
    return true;
  }
  if (style === 'snow') {
    const s = r*(0.5 + 0.8*k);
    c.strokeStyle = idx % 2 ? '#FFFFFF' : '#BFE3FF'; c.lineWidth = Math.max(1, r*0.17); c.lineCap = 'round';
    cos_flake(c, x + Math.sin(idx*2.3 + t*2)*r*0.4, y + Math.cos(idx*1.7)*r*0.4, s, idx*0.5 + t*1.2, k > 0.55);
    c.lineCap = 'butt';
    return true;
  }
  if (style === 'void') {
    const s = r*(0.18 + 0.9*k*k), a0 = c.globalAlpha;
    c.globalAlpha = a0*0.22; c.fillStyle = '#9B4DFF';
    c.beginPath(); c.arc(x, y, s*1.45 + r*0.2, 0, TAU); c.fill();                          // faint glow
    c.globalAlpha = a0; c.fillStyle = '#12051F';
    c.beginPath(); c.arc(x, y, s, 0, TAU); c.fill();                                       // dark orb
    c.strokeStyle = idx % 2 ? '#E2C6FF' : '#B57CFF'; c.lineWidth = Math.max(1, r*0.16);
    c.beginPath(); c.arc(x, y, s, t*4 + idx, t*4 + idx + Math.PI*1.4); c.stroke();          // bright, spinning rim
    return true;
  }
  if (style === 'bats') {
    const s = r*(0.7 + 0.9*k), f = Math.sin(t*20 + idx*1.4);
    c.fillStyle = idx % 3 === 0 ? '#FF8A3D' : idx % 2 ? '#9B4DFF' : '#C59BFF';
    cos_bat(c, x + Math.sin(idx*1.9)*r*0.5, y + Math.cos(idx*2.7 + t*3)*r*0.4, s, f); c.fill();
    return true;
  }
  if (style === 'candy') {
    const s = r*(0.5 + 0.7*k);
    c.save(); c.translate(x + Math.sin(idx*2.1)*r*0.4, y + Math.cos(idx*1.3)*r*0.4); c.rotate(idx*0.9 + t*3);
    if (idx % 2) {
      c.fillStyle = idx % 4 === 1 ? '#FF7A1A' : '#9B4DFF';
      c.beginPath(); c.moveTo(-s*0.6, 0); c.lineTo(-s*1.45, -s*0.55); c.lineTo(-s*1.45, s*0.55); c.closePath();
      c.moveTo(s*0.6, 0); c.lineTo(s*1.45, -s*0.55); c.lineTo(s*1.45, s*0.55); c.closePath(); c.fill();   // wrapper twists
      c.beginPath(); c.arc(0, 0, s*0.72, 0, TAU); c.fill();
      c.fillStyle = idx % 4 === 1 ? '#FFE34A' : '#2A1240'; c.fillRect(-s*0.16, -s*0.7, s*0.32, s*1.4); // stripe
    } else cos_candyCorn(c, s);
    c.restore();
    return true;
  }
  if (style === 'souls') {
    const s = r*(0.5 + 0.7*k), a0 = c.globalAlpha, w = Math.sin(t*5 + idx*0.8);
    const tx = x + w*s*0.9, ty = y - s*2.3 - Math.abs(w)*s*0.3;
    c.globalAlpha = a0*0.5; c.fillStyle = idx % 2 ? '#E8FFFB' : '#5FF5D2';
    c.beginPath(); c.moveTo(tx, ty);
    c.quadraticCurveTo(x + s*1.15 + w*s*0.3, y - s*0.6, x + s, y);
    c.arc(x, y, s, 0, Math.PI);
    c.quadraticCurveTo(x - s*1.15 + w*s*0.3, y - s*0.6, tx, ty);
    c.fill();
    c.globalAlpha = a0*0.75; c.fillStyle = '#FFFFFF';
    c.beginPath(); c.arc(x, y + s*0.1, s*0.42, 0, TAU); c.fill();                          // soft core
    c.globalAlpha = a0;
    return true;
  }
  return false;
}

// ---------- victory effects ----------
function cos_once(key, fn) { if (vicFx && !vicFx[key]) { vicFx[key] = 1; try { fn(); } catch (e) {} } }
function cos_n(rate, dt) { const v = rate*dt; return Math.floor(v) + (Math.random() < v % 1 ? 1 : 0); }
function cos_env(t, fin, fout) { return Math.max(0, Math.min(1, t/fin, (4.5 - t)/fout)); }

function vic2(T, t, dt) {
  try {
    const n = vparts.length, room = n < 380;
    if (T === 'tide') {
      cos_once('s0', () => { tone(110, 1.1, 'sine', 0.06, 2.2); tone(900, 0.5, 'triangle', 0.02, 0.4, 0.2); });
      const env = cos_env(t, 0.7, 1), base = H - H*0.24*env, crestX = -W*0.25 + Math.min(1, t/2.4)*W*1.5;
      const surf = x => base + Math.sin(x*0.022 - t*3.5)*9 + Math.sin(x*0.051 + t*2.1)*4 - 140*env*Math.exp(-Math.pow((x - crestX)/(W*0.16), 2));
      ctx.save();
      const g = ctx.createLinearGradient(0, base - 110, 0, H);
      g.addColorStop(0, 'rgba(62,230,255,0.42)'); g.addColorStop(0.45, 'rgba(40,110,255,0.3)'); g.addColorStop(1, 'rgba(20,20,90,0.38)');
      ctx.globalAlpha = env;
      ctx.beginPath(); ctx.moveTo(0, H + 2);
      for (let x = 0; x <= W + 12; x += 12) ctx.lineTo(x, surf(x));
      ctx.lineTo(W, H + 2); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
      ctx.beginPath(); for (let x = 0; x <= W + 12; x += 12) x ? ctx.lineTo(x, surf(x)) : ctx.moveTo(x, surf(x));
      ctx.shadowColor = '#3EE6FF'; ctx.shadowBlur = 16; ctx.strokeStyle = '#3EE6FF'; ctx.lineWidth = 4; ctx.stroke();
      ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 1.5; ctx.stroke();
      // second, deeper swell line
      ctx.beginPath(); for (let x = 0; x <= W + 12; x += 16) { const yy = base + 40 + Math.sin(x*0.03 + t*2.6)*7; x ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }
      ctx.strokeStyle = 'rgba(181,124,255,0.55)'; ctx.lineWidth = 2; ctx.stroke();
      // the curling lip on the crest
      if (crestX > -40 && crestX < W + 60 && env > 0.05) {
        const cy = surf(crestX);
        ctx.strokeStyle = '#E8FDFF'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.shadowColor = '#3EE6FF'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(crestX + 20, cy + 16, 24, Math.PI*1.05, Math.PI*2.1); ctx.stroke(); ctx.shadowBlur = 0;
      }
      ctx.restore();
      if (t < 3.5 && room) {
        if (crestX > -20 && crestX < W + 20) for (let k = cos_n(180, dt); k > 0; k--) { const x = crestX + (Math.random() - 0.3)*50; vparts.push({ x, y: surf(x) - 4, vx: 40 + Math.random()*120, vy: -60 - Math.random()*160, g: 320, life: 0.9 + Math.random()*0.5, kind: 'foam', s: 1.5 + Math.random()*3 }); }
        if (Math.random() < dt*9) vparts.push({ x: Math.random()*W, y: H + 10, vx: 0, vy: -50 - Math.random()*80, life: 2.2 + Math.random()*1.5, kind: 'bubble', s: 3 + Math.random()*7, ph: Math.random()*TAU });
      }
      // anchor flash
      if (t > 0.9 && t < 2.3) {
        const u = (t - 0.9)/1.4, a = Math.sin(u*Math.PI), sc = 0.6 + 0.5*Math.min(1, u*3);
        ctx.save(); ctx.globalAlpha = a; ctx.translate(W/2, H*0.36); ctx.scale(sc, sc);
        ctx.fillStyle = 'rgba(62,230,255,0.18)'; ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); ctx.fill();
        ctx.shadowColor = '#3EE6FF'; ctx.shadowBlur = 24; ctx.font = '64px system-ui'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('⚓', 0, 4);
        ctx.restore();
      }
      return true;
    }
    if (T === 'snowstorm') {
      cos_once('s0', () => { [0, 0.25, 0.5, 0.8].forEach((d, i) => tone(1568 + i*262, 0.35, 'triangle', 0.025, 0.98, d)); tone(300, 1.4, 'sawtooth', 0.012, 0.5); });
      if (t < 3.5 && room) for (let k = cos_n(200, dt); k > 0; k--) {
        const fromTop = Math.random() < 0.4, big = Math.random() < 0.12;
        vparts.push({ x: fromTop ? Math.random()*W - W*0.4 : -20 - Math.random()*40, y: fromTop ? -20 : Math.random()*H*0.9, vx: 170 + Math.random()*190, vy: 30 + Math.random()*90, life: 4.2, kind: 'flake', s: big ? 7 + Math.random()*5 : 2 + Math.random()*3.5, rot: Math.random()*TAU, spin: (Math.random() - 0.5)*5, ph: Math.random()*TAU, big });
      }
      // frosty vignette, breathing in and out
      const a = cos_env(t, 0.8, 1.2)*(0.75 + 0.25*Math.sin(t*2.4));
      if (a > 0.01) {
        ctx.save(); ctx.globalAlpha = a;
        const R = Math.hypot(W, H)/2, g = ctx.createRadialGradient(W/2, H/2, R*0.45, W/2, H/2, R);
        g.addColorStop(0, 'rgba(190,235,255,0)'); g.addColorStop(0.65, 'rgba(160,215,255,0.16)'); g.addColorStop(1, 'rgba(225,245,255,0.5)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
        // a few frost crystals in the corners
        ctx.strokeStyle = 'rgba(235,250,255,0.55)'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        [[14, 14], [W - 14, 14], [14, H - 14], [W - 14, H - 14]].forEach(([x, y], i) => cos_flake(ctx, x, y, 18 + 4*Math.sin(t + i), t*0.3 + i, true));
        ctx.restore();
      }
      return true;
    }
    if (T === 'supernova') {
      const cx = W/2, cy = H*0.42, M = Math.max(W, H);
      cos_once('s0', () => { tone(70, 1.2, 'sawtooth', 0.07, 0.4); tone(1400, 0.6, 'sine', 0.04, 0.3); tone(600, 0.9, 'triangle', 0.03, 2, 0.1); });
      cos_once('s1', () => { for (let k = 0; k < 150; k++) { const a = Math.random()*TAU, sp = 140 + Math.random()*520; vparts.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 0.8 + Math.random()*1.2, kind: 'spark', col: Math.random() < 0.5 ? '#FFFFFF' : Math.random() < 0.6 ? '#C59BFF' : '#7FD8FF' }); } });
      if (t > 1.0) cos_once('s2', () => { for (let k = 0; k < 70; k++) { const a = Math.random()*TAU, sp = 90 + Math.random()*300; vparts.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 0.7 + Math.random()*1.1, kind: 'spark', col: Math.random() < 0.5 ? '#FF7AD9' : '#FFFFFF' }); } tone(90, 0.7, 'sawtooth', 0.04, 0.5); });
      if (t < 3.5 && room && Math.random() < dt*30) { const a = Math.random()*TAU, sp = 60 + Math.random()*140; vparts.push({ x: cx, y: cy, vx: Math.cos(a)*sp, vy: Math.sin(a)*sp, life: 0.6 + Math.random()*0.8, kind: 'spark', col: '#E2C6FF' }); }
      ctx.save();
      if (t < 0.35) { ctx.globalAlpha = 0.55*(1 - t/0.35); ctx.fillStyle = '#F4EEFF'; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
      ctx.globalCompositeOperation = 'lighter';
      // glow core
      const ca = Math.max(0, 1 - t/1.4)*0.9 + 0.25*cos_env(t, 0.2, 1.2), cr = 40 + Math.min(1, t*3)*M*0.32;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cr);
      g.addColorStop(0, 'rgba(255,255,255,' + ca + ')'); g.addColorStop(0.18, 'rgba(226,198,255,' + ca*0.75 + ')'); g.addColorStop(0.5, 'rgba(155,77,255,' + ca*0.3 + ')'); g.addColorStop(1, 'rgba(90,30,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, cr, 0, TAU); ctx.fill();
      // shockwave rings
      [[0, '#FFFFFF', 900], [0.25, '#C59BFF', 650], [0.6, '#7FD8FF', 480], [1.0, '#FF7AD9', 700], [1.5, '#C59BFF', 420]].forEach(([t0, col, sp]) => {
        const u = t - t0; if (u <= 0 || u > 2.2) return;
        const R = u*sp*(1 - u*0.18), a = Math.max(0, 1 - u/2.2);
        ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 2 + 10*a; ctx.shadowColor = col; ctx.shadowBlur = 18;
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
      });
      ctx.shadowBlur = 0;
      // lens-flare cross + lingering star
      const fa = Math.max(0, 1 - t/1.6)*0.9 + 0.35*cos_env(t, 0.3, 1);
      ctx.globalAlpha = fa; ctx.fillStyle = '#FFFFFF';
      const L = (60 + 140*Math.max(0, 1 - t/1.2))*(1 + 0.08*Math.sin(t*20));
      ctx.beginPath(); ctx.moveTo(cx - L, cy); ctx.lineTo(cx, cy - 3); ctx.lineTo(cx + L, cy); ctx.lineTo(cx, cy + 3); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx, cy - L*0.8); ctx.lineTo(cx - 3, cy); ctx.lineTo(cx, cy + L*0.8); ctx.lineTo(cx + 3, cy); ctx.closePath(); ctx.fill();
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t*0.8); star4(ctx, 0, 0, 16 + 4*Math.sin(t*9)); ctx.restore();
      ctx.restore();
      return true;
    }
    if (T === 'ghosts') {
      cos_once('s0', () => { tone(330, 1.0, 'sine', 0.035, 1.6); tone(495, 1.0, 'sine', 0.02, 0.7, 0.5); });
      if (t < 3.3 && room) {
        vicFx.gn = (vicFx.gn || 0) + dt;
        if (t < dt*1.5) for (let k = 0; k < 4; k++) vparts.push({ x: W*(0.1 + k*0.27), y: H + 10 + k*25, vx: 0, vy: -150 - Math.random()*60, life: 9, kind: 'ghost', s: 20 + Math.random()*10, ph: Math.random()*TAU, wob: 18 });
        if (vicFx.gn > 0.24) { vicFx.gn = 0; vparts.push({ x: W*(0.08 + Math.random()*0.84), y: H + 40, vx: (Math.random() - 0.5)*20, vy: -120 - Math.random()*90, life: 9, kind: 'ghost', s: 16 + Math.random()*16, ph: Math.random()*TAU, wob: 14 + Math.random()*16 }); }
        if (Math.random() < dt*6) vparts.push({ x: Math.random()*W, y: H - Math.random()*60, vx: (Math.random() - 0.5)*20, vy: -20 - Math.random()*30, life: 1.5 + Math.random(), kind: 'mote' });
      }
      // green fog at the bottom
      const a = cos_env(t, 0.8, 1.2);
      if (a > 0.01) {
        ctx.save(); ctx.globalAlpha = a;
        const lg = ctx.createLinearGradient(0, H*0.72, 0, H);
        lg.addColorStop(0, 'rgba(80,255,160,0)'); lg.addColorStop(1, 'rgba(80,255,160,0.22)');
        ctx.fillStyle = lg; ctx.fillRect(0, H*0.72, W, H*0.28);
        for (let k = 0; k < 5; k++) {
          const fx = ((k*0.27 + t*0.05*(k % 2 ? 1 : -1)) % 1 + 1) % 1*W*1.3 - W*0.15, fy = H - 20 - (k % 3)*22, fr = 90 + k*14;
          const rg = ctx.createRadialGradient(fx, fy, 0, fx, fy, fr);
          rg.addColorStop(0, 'rgba(120,255,180,0.2)'); rg.addColorStop(1, 'rgba(120,255,180,0)');
          ctx.fillStyle = rg; ctx.fillRect(fx - fr, fy - fr, fr*2, fr*2);
        }
        ctx.restore();
      }
      return true;
    }
    if (T === 'batswarm') {
      cos_once('s0', () => { for (let k = 0; k < 7; k++) tone(2200 + Math.random()*1400, 0.05, 'square', 0.018, 1.4, 0.3 + k*0.17); tone(160, 1.2, 'triangle', 0.03, 0.7); });
      const mx = W*0.68, my = H*0.17, mr = Math.min(W, H)*0.2, a = cos_env(t, 1.0, 1.2);
      if (a > 0.01) {
        ctx.save(); ctx.globalAlpha = a*0.92;
        const halo = ctx.createRadialGradient(mx, my, mr*0.8, mx, my, mr*2.4);
        halo.addColorStop(0, 'rgba(255,140,60,0.35)'); halo.addColorStop(1, 'rgba(255,90,40,0)');
        ctx.fillStyle = halo; ctx.fillRect(mx - mr*2.4, my - mr*2.4, mr*4.8, mr*4.8);
        const mg = ctx.createRadialGradient(mx - mr*0.3, my - mr*0.3, mr*0.1, mx, my, mr);
        mg.addColorStop(0, '#FFD27A'); mg.addColorStop(0.7, '#FF9A3D'); mg.addColorStop(1, '#E2602A');
        ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(170,60,20,0.28)';
        [[-0.3, -0.2, 0.18], [0.25, 0.15, 0.24], [-0.1, 0.45, 0.12], [0.4, -0.35, 0.1]].forEach(([u, v, s]) => { ctx.beginPath(); ctx.arc(mx + u*mr, my + v*mr, s*mr, 0, TAU); ctx.fill(); });
        ctx.restore();
      }
      if (t < 3.2 && room) {
        for (let k = cos_n(t < 0.4 ? 110 : 40, dt); k > 0; k--) {
          const lane = 0.12 + Math.random()*0.62;
          vparts.push({ x: -30 - Math.random()*30, y: H*lane, vx: 230 + Math.random()*200, vy: (Math.random() - 0.6)*40, life: 5, kind: 'bat', s: 10 + Math.random()*14, ph: Math.random()*TAU, amp: 10 + Math.random()*25, y0: 0 });
        }
      }
      return true;
    }
  } catch (e) {}
  return false;
}

function vpart2(p, t) {
  try {
    const k = p.kind;
    if (k === 'foam') {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life*1.4)); ctx.fillStyle = '#E8FDFF';
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; return true;
    }
    if (k === 'bubble') {
      const x = p.x + Math.sin(t*4 + p.ph)*6;
      ctx.globalAlpha = Math.max(0, Math.min(0.85, p.life)); ctx.strokeStyle = '#9FF4FF'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(x, p.y, p.s, 0, TAU); ctx.stroke();
      ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.arc(x - p.s*0.35, p.y - p.s*0.35, p.s*0.22, 0, TAU); ctx.fill();
      ctx.globalAlpha = 1; return true;
    }
    if (k === 'flake') {
      if (p.x > W + 30) { p.life = 0; return true; }
      p.vy += Math.sin(t*3 + p.ph)*6;                                   // swirl
      p.vy = Math.max(-60, Math.min(160, p.vy));
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life))*(p.big ? 0.95 : 0.85);
      ctx.strokeStyle = p.big ? '#FFFFFF' : '#DDF1FF'; ctx.lineWidth = p.big ? 1.6 : 1.2; ctx.lineCap = 'round';
      if (p.s < 3) { ctx.fillStyle = '#F4FBFF'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s*0.6, 0, TAU); ctx.fill(); }
      else cos_flake(ctx, p.x, p.y, p.s, p.rot + t*p.spin, p.big);
      ctx.lineCap = 'butt'; ctx.globalAlpha = 1; return true;
    }
    if (k === 'spark') {
      p.vx *= 0.985; p.vy *= 0.985;
      const a = Math.max(0, Math.min(1, p.life*1.2));
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = a;
      ctx.strokeStyle = p.col; ctx.lineWidth = 2; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx*0.035, p.y - p.vy*0.035); ctx.stroke();
      ctx.restore(); return true;
    }
    if (k === 'ghost') {
      if (p.y < -p.s*3) { p.life = 0; return true; }
      const x = p.x + Math.sin(t*1.8 + p.ph)*p.wob, y = p.y + Math.sin(t*3 + p.ph)*4;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(Math.sin(t*1.8 + p.ph + 0.6)*0.18);
      ctx.shadowColor = '#7CFFB2'; ctx.shadowBlur = 16;
      cos_ghost(ctx, 0, 0, p.s, t*5 + p.ph, Math.min(1, (H + 40 - p.y)/80));
      ctx.restore(); return true;
    }
    if (k === 'mote') {
      ctx.globalAlpha = Math.max(0, Math.min(0.8, p.life)); ctx.fillStyle = '#9CFFC9';
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; return true;
    }
    if (k === 'bat') {
      if (p.x > W + 40) { p.life = 0; return true; }
      const y = p.y + Math.sin(p.x*0.018 + p.ph)*p.amp, f = Math.sin(t*22 + p.ph);
      ctx.save();
      ctx.fillStyle = '#160A24'; ctx.strokeStyle = 'rgba(197,155,255,0.85)'; ctx.lineWidth = 1.2; ctx.lineJoin = 'round';
      ctx.shadowColor = '#9B4DFF'; ctx.shadowBlur = p.s > 15 ? 8 : 0;
      cos_bat(ctx, p.x, y, p.s, f); ctx.fill(); ctx.shadowBlur = 0; ctx.stroke();
      ctx.fillStyle = '#FFB23E'; ctx.fillRect(p.x - p.s*0.1, y - p.s*0.12, 1.5, 1.5); ctx.fillRect(p.x + p.s*0.05, y - p.s*0.12, 1.5, 1.5);
      ctx.restore(); return true;
    }
  } catch (e) { ctx.globalAlpha = 1; ctx.shadowBlur = 0; ctx.globalCompositeOperation = 'source-over'; }
  return false;
}

function drawVictoryChip2(c, id, w, h) {
  try {
    const t = clock;
    if (id === 'tide') {
      const surf = x => h*0.58 + Math.sin(x*0.12 - t*3)*3 - 12*Math.exp(-Math.pow((x - w*0.4)/14, 2));
      const g = c.createLinearGradient(0, h*0.35, 0, h); g.addColorStop(0, 'rgba(62,230,255,0.55)'); g.addColorStop(1, 'rgba(40,60,200,0.35)');
      c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 4) c.lineTo(x, surf(x)); c.lineTo(w, h); c.closePath(); c.fillStyle = g; c.fill();
      c.beginPath(); for (let x = 0; x <= w; x += 4) x ? c.lineTo(x, surf(x)) : c.moveTo(x, surf(x));
      c.strokeStyle = '#3EE6FF'; c.lineWidth = 2; c.shadowColor = '#3EE6FF'; c.shadowBlur = 6; c.stroke(); c.shadowBlur = 0;
      c.strokeStyle = '#E8FDFF'; c.lineWidth = 1.6; c.beginPath(); c.arc(w*0.4 + 4, surf(w*0.4) + 4, 6, Math.PI*1.05, Math.PI*2.1); c.stroke();
      c.strokeStyle = '#9FF4FF'; c.lineWidth = 1;
      for (let k = 0; k < 4; k++) { const by = h - ((t*14 + k*15) % (h*0.6)); c.beginPath(); c.arc(16 + k*18 + Math.sin(t*3 + k)*2, by, 1.8 + k % 2, 0, TAU); c.stroke(); }
      c.font = '16px system-ui'; c.fillText('⚓', w*0.75, h*0.3);
      return true;
    }
    if (id === 'snowstorm') {
      const g = c.createRadialGradient(w/2, h/2, 10, w/2, h/2, 52); g.addColorStop(0, 'rgba(190,235,255,0)'); g.addColorStop(1, 'rgba(210,240,255,0.35)');
      c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.lineCap = 'round';
      for (let k = 0; k < 9; k++) {
        const x = ((k*37 + t*40) % (w + 20)) - 10, y = (k*29 + 6) % (h - 8) + 4 + Math.sin(t*2 + k)*3, s = k % 3 === 0 ? 7 : 3.5;
        c.strokeStyle = k % 2 ? '#FFFFFF' : '#BFE3FF'; c.lineWidth = k % 3 === 0 ? 1.4 : 1;
        cos_flake(c, x, y, s, t + k, k % 3 === 0);
      }
      c.lineCap = 'butt';
      return true;
    }
    if (id === 'supernova') {
      const cx = w/2, cy = h/2, u = (t*0.7) % 1;
      c.globalCompositeOperation = 'lighter';
      const g = c.createRadialGradient(cx, cy, 0, cx, cy, 26); g.addColorStop(0, '#FFFFFF'); g.addColorStop(0.3, 'rgba(197,155,255,0.8)'); g.addColorStop(1, 'rgba(120,50,255,0)');
      c.fillStyle = g; c.beginPath(); c.arc(cx, cy, 26, 0, TAU); c.fill();
      c.globalAlpha = 1 - u; c.strokeStyle = '#C59BFF'; c.lineWidth = 2.5; c.beginPath(); c.arc(cx, cy, 6 + u*34, 0, TAU); c.stroke();
      c.globalAlpha = Math.max(0, 1 - ((u + 0.5) % 1)); c.strokeStyle = '#7FD8FF'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, 6 + ((u + 0.5) % 1)*34, 0, TAU); c.stroke();
      c.globalAlpha = 1; c.strokeStyle = '#FFFFFF'; c.lineWidth = 1.2;
      for (let k = 0; k < 10; k++) { const a = k/10*TAU + 0.3, r0 = 12 + u*10; c.beginPath(); c.moveTo(cx + Math.cos(a)*r0, cy + Math.sin(a)*r0); c.lineTo(cx + Math.cos(a)*(r0 + 5), cy + Math.sin(a)*(r0 + 5)); c.stroke(); }
      c.fillStyle = '#FFFFFF'; star4(c, cx, cy, 9);
      c.globalCompositeOperation = 'source-over';
      return true;
    }
    if (id === 'ghosts') {
      const fg = c.createLinearGradient(0, h*0.6, 0, h); fg.addColorStop(0, 'rgba(80,255,160,0)'); fg.addColorStop(1, 'rgba(80,255,160,0.35)');
      c.fillStyle = fg; c.fillRect(0, h*0.6, w, h*0.4);
      c.shadowColor = '#7CFFB2'; c.shadowBlur = 8;
      cos_ghost(c, w*0.36 + Math.sin(t*1.8)*4, h*0.46 + Math.sin(t*3)*2.5, 13, t*5, 1);
      cos_ghost(c, w*0.72 + Math.sin(t*1.8 + 2)*3, h*0.36 + Math.sin(t*3 + 1)*2, 8, t*5 + 2, 0.85);
      c.shadowBlur = 0; c.globalAlpha = 1;
      return true;
    }
    if (id === 'batswarm') {
      const mg = c.createRadialGradient(w*0.66, h*0.4, 2, w*0.66, h*0.42, 20); mg.addColorStop(0, '#FFD27A'); mg.addColorStop(0.75, '#FF9A3D'); mg.addColorStop(1, '#E2602A');
      c.shadowColor = '#FF8A3D'; c.shadowBlur = 12; c.fillStyle = mg; c.beginPath(); c.arc(w*0.66, h*0.42, 18, 0, TAU); c.fill(); c.shadowBlur = 0;
      c.fillStyle = '#160A24'; c.strokeStyle = 'rgba(197,155,255,0.9)'; c.lineWidth = 1; c.lineJoin = 'round';
      [[0.25, 0.35, 9, 0], [0.58, 0.48, 11, 1.7], [0.42, 0.72, 7, 3.1], [0.82, 0.68, 6, 4.4]].forEach(([u, v, s, ph]) => {
        const x = w*u + Math.sin(t*2 + ph)*3, y = h*v + Math.cos(t*2.4 + ph)*2;
        cos_bat(c, x, y, s, Math.sin(t*14 + ph)); c.fill(); c.stroke();
      });
      return true;
    }
  } catch (e) {}
  c.shadowBlur = 0; c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  return false;
}

