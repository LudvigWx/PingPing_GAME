// ----- prestige-exclusive cosmetics: a paddle skin and a card frame for every prestige -----
function drawPrestigeSkin(c, n, L, Wd, t) {
  const col = PRESTIGE_COLS[n] || '#FFD84A';
  const g = c.createLinearGradient(L, -3, L + Wd, 3); g.addColorStop(0, '#0C0A1C'); g.addColorStop(0.5, n >= 12 ? 'hsl(' + ((t*90) % 360) + ',80%,45%)' : col); g.addColorStop(1, '#0C0A1C');
  c.fillStyle = g; c.fillRect(L, -3, Wd, 6);
  c.fillStyle = 'rgba(12,10,28,0.55)'; c.fillRect(L, -3, Wd, 6);
  // chevrons marching along the bar, more of them the higher you go
  const step = n >= 8 ? 3.2 : 4.2, off = (t*(2 + n*0.4)) % step;
  c.strokeStyle = n >= 12 ? 'hsl(' + ((t*120) % 360) + ',95%,70%)' : col; c.lineWidth = 0.7; c.lineJoin = 'round';
  for (let x = L - step + off; x < L + Wd + step; x += step) { c.beginPath(); c.moveTo(x - 1, -1.6); c.lineTo(x + 0.6, 0); c.lineTo(x - 1, 1.6); c.stroke(); }
  if (n >= 4) { c.fillStyle = '#FFD84A'; c.fillRect(L, -2.2, Wd, 0.35); c.fillRect(L, 1.85, Wd, 0.35); }
  if (n === 9 || n === 10) for (let k = 0; k < Wd/3; k++) { const x = L + ((k*7.3 + t*6) % Wd), y = 1.5 - ((t*3 + k*0.37) % 1)*4; c.fillStyle = k % 2 ? '#FF8A3D' : '#FFE34A'; c.globalAlpha = 0.8; c.fillRect(x, y, 0.6, 0.6); }
  if (n >= 7) for (let k = 0; k < 4; k++) { const ph = (t*0.7 + k*0.25) % 1; c.globalAlpha = Math.sin(ph*Math.PI); c.fillStyle = '#FFFFFF'; star4(c, L + Wd*((k*0.29 + 0.1) % 1), (k % 2 ? -1 : 1)*0.9, 0.9); }
  c.globalAlpha = 1;
  const sx = L + ((t*14) % (Wd + 12)) - 6; c.fillStyle = 'rgba(255,255,255,0.35)'; c.beginPath(); c.moveTo(sx, -3); c.lineTo(sx + 1.5, -3); c.lineTo(sx - 0.5, 3); c.lineTo(sx - 2, 3); c.fill();
}
function drawPrestigeFrame(c, n, t, W, H) {
  const s = Math.max(0.5, Math.min(1.4, Math.min(W/300, H/300))), pad = 5*s, x = pad, y = pad, w = W - 2*pad, h = H - 2*pad, R = 20*s, col = PRESTIGE_COLS[n] || '#FFD84A';
  c.save(); c.lineJoin = 'round';
  c.shadowColor = col; c.shadowBlur = (8 + n*1.2)*s;
  c.strokeStyle = n >= 12 && typeof cre_holo === 'function' ? cre_holo(c, W/2, H/2, t, 1) : col; c.lineWidth = (5 + n*0.25)*s; rr(c, x, y, w, h, R); c.stroke();
  c.shadowBlur = 0; c.strokeStyle = 'rgba(12,8,30,0.85)'; c.lineWidth = 1.6*s; rr(c, x, y, w, h, R); c.stroke();
  c.strokeStyle = n >= 4 ? '#FFD84A' : 'rgba(255,255,255,0.6)'; c.lineWidth = 1.1*s; rr(c, x + 7*s, y + 7*s, w - 14*s, h - 14*s, Math.max(4, R - 6*s)); c.stroke();
  // chevron studs, one more per three prestiges
  const per = 8 + n*2; c.fillStyle = col;
  for (let k = 0; k < per; k++) { const [px, py, nx, ny] = perim(k/per, x + 7*s, y + 7*s, w - 14*s, h - 14*s); c.save(); c.translate(px, py); c.rotate(Math.atan2(ny, nx)); c.beginPath(); c.moveTo(-1.6*s, -2*s); c.lineTo(0.8*s, 0); c.lineTo(-1.6*s, 2*s); c.lineWidth = 1*s; c.strokeStyle = col; c.stroke(); c.restore(); }
  // runners from prestige V up
  if (n >= 5) for (let q = 0; q < (n >= 10 ? 3 : n >= 8 ? 2 : 1); q++) for (let k = 10; k >= 0; k--) {
    const [px, py] = perim(t*0.14 + q/3 - k*0.004, x, y, w, h); c.globalAlpha = (1 - k/11)*0.9; c.fillStyle = k ? col : '#FFFFFF'; c.beginPath(); c.arc(px, py, (2.6 - k*0.18)*s, 0, TAU); c.fill();
  }
  c.globalAlpha = 1;
  // corner triangles
  [[x + 12*s, y + 12*s], [x + w - 12*s, y + 12*s], [x + w - 12*s, y + h - 12*s], [x + 12*s, y + h - 12*s]].forEach(([cx, cy], k) => {
    c.save(); c.translate(cx, cy); c.rotate(n >= 6 ? t*(k % 2 ? -1 : 1) : 0); c.fillStyle = col; c.shadowColor = col; c.shadowBlur = 8*s;
    poly(c, [0, 1, 2].map(j => [Math.cos(j*TAU/3 - Math.PI/2)*5*s, Math.sin(j*TAU/3 - Math.PI/2)*5*s])); c.fill(); c.restore();
  });
  // the prestige emblem on the bottom edge
  drawPrestigeBadge(c, n, n, W/2, y + h - 3*s, 12*s, t);
  c.restore(); c.shadowBlur = 0; c.globalAlpha = 1;
}


