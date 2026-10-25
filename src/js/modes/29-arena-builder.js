// ---------- Arena Builder: drawing, editor, gallery, sharing ----------
const LV_TOOLS = [
  ['select', 'Move', '✋'], ['rock', 'Rock', '●'], ['bump', 'Bumper', '◎'], ['brick', 'Brick', '▣'], ['wall', 'Wall', '╱'], ['spin', 'Spinner', '✢'],
  ['mover', 'Mover', '⇄'], ['portal', 'Portal', '◐'], ['lava', 'Lava', '♨'], ['hole', 'Black hole', '◉'], ['boost', 'Booster', '➤'], ['star', 'Star', '★'],
  ['spot', 'Power-up spot', '✚'], ['erase', 'Erase', '✖']
];
const LV_TIPS = {
  select: 'Drag things around. Tap one to edit it.', rock: 'A solid rock. Balls bounce off it.', bump: 'Pinball bumper: bounces the ball away faster.',
  brick: 'Breakable brick. Takes 1–5 hits and may drop a power-up.', wall: 'Drag to draw a wall.', spin: 'A spinning bar. Set its speed and direction.',
  mover: 'Drag to set the path. A rock slides back and forth along it.', portal: 'Drag from one end to the other: a linked pair of portals.',
  lava: 'Balls that roll over lava speed up.', hole: 'Mini black hole: bends the ball towards it.', boost: 'Booster arrow: launches the ball in its direction. Tap it to rotate.',
  star: 'Collectible star. The player who hit the ball gets it. Use with the Star hunt goal.', spot: 'Power-ups appear on these spots instead of randomly.', erase: 'Tap things to remove them.'
};
// ----- drawing (world units; ctx already world-transformed) -----
function drawLevelObjs(c, g, t, editing) {
  const objs = g.lv ? g.lv.objs : g.objs || [];
  const mt = g.mt || t;
  for (const o of objs) {
    if (o.t === 'lava') {
      const lg = c.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
      lg.addColorStop(0, 'rgba(255,230,120,0.75)'); lg.addColorStop(0.6, 'rgba(255,110,40,0.55)'); lg.addColorStop(1, 'rgba(255,60,30,0.05)');
      c.fillStyle = lg; c.beginPath(); c.arc(o.x, o.y, o.r*(1 + 0.05*Math.sin(t*3 + o.x*9)), 0, TAU); c.fill();
    } else if (o.t === 'hole') {
      const rg = c.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r*1.6);
      rg.addColorStop(0, 'rgba(0,0,0,1)'); rg.addColorStop(0.45, 'rgba(10,0,25,0.95)'); rg.addColorStop(0.7, 'rgba(255,130,60,0.4)'); rg.addColorStop(1, 'rgba(120,60,255,0)');
      c.fillStyle = rg; c.beginPath(); c.arc(o.x, o.y, o.r*1.6, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,170,90,0.55)'; c.lineWidth = 0.004;
      for (let k = 0; k < 2; k++) { c.beginPath(); c.ellipse(o.x, o.y, o.r*(0.7 + k*0.35), o.r*(0.25 + k*0.12), t*(0.8 + k*0.5), 0, TAU); c.stroke(); }
      if (editing) { c.strokeStyle = 'rgba(181,124,255,0.25)'; c.setLineDash([0.015, 0.015]); c.beginPath(); c.arc(o.x, o.y, o.r*3.2, 0, TAU); c.stroke(); c.setLineDash([]); }
    } else if (o.t === 'spot') {
      c.strokeStyle = 'rgba(124,255,178,0.6)'; c.lineWidth = 0.005; c.setLineDash([0.012, 0.01]);
      c.beginPath(); c.arc(o.x, o.y, 0.05, t*0.8, t*0.8 + TAU); c.stroke(); c.setLineDash([]);
      c.fillStyle = 'rgba(124,255,178,0.5)'; c.fillRect(o.x - 0.004, o.y - 0.022, 0.008, 0.044); c.fillRect(o.x - 0.022, o.y - 0.004, 0.044, 0.008);
    } else if (o.t === 'boost') {
      c.save(); c.translate(o.x, o.y); c.rotate(o.a);
      c.fillStyle = 'rgba(62,230,255,0.12)'; c.beginPath(); c.arc(0, 0, 0.06, 0, TAU); c.fill();
      for (let k = 0; k < 3; k++) {
        const ph = ((t*2 + k/3) % 1); c.globalAlpha *= 1; c.strokeStyle = 'rgba(62,230,255,' + (0.3 + 0.7*(1 - Math.abs(ph - 0.5)*2)) + ')'; c.lineWidth = 0.008;
        const x = -0.035 + k*0.025; c.beginPath(); c.moveTo(x - 0.012, -0.022); c.lineTo(x + 0.008, 0); c.lineTo(x - 0.012, 0.022); c.stroke();
      }
      c.restore();
    } else if (o.t === 'portal') {
      [[o.x, o.y, '#4FA8FF'], [o.x2, o.y2, '#FF8A3D']].forEach(([x, y, col], k) => {
        c.strokeStyle = col; c.lineWidth = 0.01;
        for (let r = 0; r < 3; r++) { c.beginPath(); c.arc(x, y, 0.025 + r*0.014 + 0.004*Math.sin(t*6 + r), t*(k ? -3 : 3) + r, t*(k ? -3 : 3) + r + 4.5); c.stroke(); }
      });
      if (editing) { c.strokeStyle = 'rgba(255,255,255,0.15)'; c.setLineDash([0.015, 0.02]); c.lineWidth = 0.004; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x2, o.y2); c.stroke(); c.setLineDash([]); }
    } else if (o.t === 'star') {
      if (!o.on && !editing) { c.strokeStyle = 'rgba(255,216,74,0.25)'; c.lineWidth = 0.003; c.beginPath(); c.arc(o.x, o.y, 0.03, 0, TAU); c.stroke(); continue; }
      c.save(); c.translate(o.x, o.y + Math.sin(t*3 + o.x*5)*0.006); c.rotate(Math.sin(t*2)*0.2);
      c.fillStyle = 'rgba(255,216,74,0.18)'; c.beginPath(); c.arc(0, 0, 0.05, 0, TAU); c.fill();
      c.fillStyle = '#FFD84A'; c.beginPath();
      for (let k = 0; k < 10; k++) { const a = -Math.PI/2 + k*Math.PI/5, rr2 = k % 2 ? 0.014 : 0.034; k ? c.lineTo(Math.cos(a)*rr2, Math.sin(a)*rr2) : c.moveTo(Math.cos(a)*rr2, Math.sin(a)*rr2); }
      c.closePath(); c.fill(); c.restore();
    }
  }
  for (const o of objs) {
    if (o.t === 'rock' || o.t === 'mover') {
      const p = o.t === 'mover' ? (editing ? [o.x, o.y] : moverPos(o, mt)) : [o.x, o.y];
      if (o.t === 'mover' && editing) { c.strokeStyle = 'rgba(160,150,230,0.35)'; c.setLineDash([0.012, 0.012]); c.lineWidth = 0.004; c.beginPath(); c.moveTo(o.x, o.y); c.lineTo(o.x2, o.y2); c.stroke(); c.setLineDash([]); c.strokeStyle = 'rgba(160,150,230,0.35)'; c.beginPath(); c.arc(o.x2, o.y2, o.r, 0, TAU); c.stroke(); }
      rockPath({ x: p[0], y: p[1], r: o.r, id: (o.id || 0) + (o.t === 'mover' ? 50 : 0) }); c.fillStyle = o.t === 'mover' ? '#3A2A60' : '#2A2350'; c.fill(); c.strokeStyle = o.t === 'mover' ? '#C59BFF' : '#8C7FE0'; c.lineWidth = 0.007; c.stroke();
    } else if (o.t === 'bump') {
      const k = 1 + (o.cd || 0)*0.8;
      c.fillStyle = '#1A1238'; c.strokeStyle = o.cd > 0 ? '#FFFFFF' : '#FF4F8B'; c.lineWidth = 0.01;
      c.beginPath(); c.arc(o.x, o.y, o.r*k, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = '#FFB23E'; c.lineWidth = 0.005; c.beginPath(); c.arc(o.x, o.y, o.r*0.55*k, 0, TAU); c.stroke();
      c.fillStyle = '#FF4F8B'; c.beginPath(); c.arc(o.x, o.y, o.r*0.22, 0, TAU); c.fill();
    } else if (o.t === 'brick') {
      if (!o.on && !editing) continue;
      const s = o.s, hp = editing ? o.hp : o.hp, cols = ['#7CFFB2', '#3EE6FF', '#FFB23E', '#FF4F8B', '#C59BFF'];
      c.fillStyle = cols[clamp(hp - 1, 0, 4)]; c.globalAlpha *= 0.85; c.fillRect(o.x - s/2, o.y - s/2, s, s); c.globalAlpha /= 0.85;
      c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.004; c.strokeRect(o.x - s/2, o.y - s/2, s, s);
      c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(o.x - s/2, o.y + s*0.2, s, s*0.3);
      if (hp > 1) { c.fillStyle = '#0C0A1C'; for (let k = 0; k < hp; k++) c.fillRect(o.x - s*0.35 + k*s*0.17, o.y - s*0.32, s*0.1, s*0.1); }
    } else if (o.t === 'wall' || o.t === 'spin') {
      const sg = o.t === 'spin' ? (editing ? spinSeg(o, t*0.6) : spinSeg(o, mt)) : [o.x, o.y, o.x2, o.y2];
      c.lineCap = 'round'; c.strokeStyle = o.t === 'spin' ? '#FFB23E' : '#A99BFF'; c.lineWidth = 0.018;
      c.beginPath(); c.moveTo(sg[0], sg[1]); c.lineTo(sg[2], sg[3]); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,0.5)'; c.lineWidth = 0.005; c.beginPath(); c.moveTo(sg[0], sg[1]); c.lineTo(sg[2], sg[3]); c.stroke();
      if (o.t === 'spin') { c.fillStyle = '#FFE34A'; c.beginPath(); c.arc(o.x, o.y, 0.014, 0, TAU); c.fill(); }
    }
  }
}
// ----- storage & sharing -----
let myArenas = storeJSON('trepong-arenas', []);
if (!Array.isArray(myArenas)) myArenas = [];
myArenas = myArenas.map(cleanLevel);
function saveArenas() { store('trepong-arenas', JSON.stringify(myArenas)); }
const LV_EXAMPLES = [
  { name: 'Pinball Palace', sides: 3, ar: 'retro', rules: { lives: 5, speed: 1.1, size: 1, serve: 1, pu: 'on', grav: 'none', paddle: 1, goal: 'last', goalV: 5 },
    objs: [{ t: 'bump', x: 0, y: 0, r: 0.07 }, { t: 'bump', x: -0.22, y: -0.13, r: 0.05 }, { t: 'bump', x: 0.22, y: -0.13, r: 0.05 }, { t: 'bump', x: 0, y: 0.25, r: 0.05 },
           { t: 'spin', x: 0, y: -0.3, r: 0.1, w: 2 }, { t: 'boost', x: -0.3, y: 0.15, a: -0.5 }, { t: 'boost', x: 0.3, y: 0.15, a: Math.PI + 0.5 }] },
  { name: 'Star Hunt', sides: 4, ar: 'classic', rules: { lives: 9, speed: 1, size: 1, serve: 2, pu: 'on', grav: 'none', paddle: 1.1, goal: 'stars', goalV: 6 },
    objs: [{ t: 'star', x: 0, y: 0 }, { t: 'star', x: 0.3, y: 0.3 }, { t: 'star', x: -0.3, y: -0.3 }, { t: 'star', x: 0.3, y: -0.3 }, { t: 'star', x: -0.3, y: 0.3 },
           { t: 'brick', x: 0.15, y: 0, hp: 2, s: 0.06 }, { t: 'brick', x: -0.15, y: 0, hp: 2, s: 0.06 }, { t: 'brick', x: 0, y: 0.15, hp: 2, s: 0.06 }, { t: 'brick', x: 0, y: -0.15, hp: 2, s: 0.06 }] },
  { name: 'Portal Maze', sides: 2, ar: 'hole', rules: { lives: 5, speed: 1.05, size: 1, serve: 1, pu: 'storm', grav: 'none', paddle: 1, goal: 'last', goalV: 5 },
    objs: [{ t: 'wall', x: -0.42, y: 0, x2: -0.12, y2: 0 }, { t: 'wall', x: 0.12, y: 0, x2: 0.42, y2: 0 }, { t: 'portal', x: -0.3, y: -0.4, x2: 0.3, y2: 0.4 },
           { t: 'portal', x: 0.3, y: -0.4, x2: -0.3, y2: 0.4 }, { t: 'hole', x: 0, y: 0, r: 0.05 }, { t: 'mover', x: -0.35, y: -0.2, x2: 0.35, y2: -0.2, r: 0.05, w: 1 }, { t: 'mover', x: 0.35, y: 0.2, x2: -0.35, y2: 0.2, r: 0.05, w: 1 }] }
].map(cleanLevel);
function levelCode(L) { const json = JSON.stringify(cleanLevel(L)); return 'TPA1-' + btoa(unescape(encodeURIComponent(json))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function parseLevelCode(code) {
  code = String(code || '').trim(); const m = code.match(/TPA1-([A-Za-z0-9_-]+)/); if (!m) throw new Error('That is not an arena code. It should start with TPA1-.');
  try { let b = m[1].replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '='; return cleanLevel(JSON.parse(decodeURIComponent(escape(atob(b))))); }
  catch (e) { throw new Error('The arena code is broken. Copy the whole code and try again.'); }
}
// ----- editor state -----
let ed = null; // { L, tool, sel, drag, undo:[], redo:[], sym, snap, tab }
let lobbyLevel = null, playLevel = null, editReturn = false;
function newLevel() { return cleanLevel({ name: 'My arena', sides: 3, ar: 'classic', rules: {}, objs: [] }); }
function openBuilder(L, idx) {
  mode = 'menu'; st = null; series = null; special = null; resetFx(); mySeat = 0;
  ed = { L: cleanLevel(L || newLevel()), idx: idx == null ? -1 : idx, tool: 'select', sel: -1, drag: null, undo: [], redo: [], sym: 'off', snap: true, tab: 'build', arena: null };
  edArena(); showScreen('build'); renderBuilder();
}
function edArena() { ed.arena = makeArena(ed.L.sides, false); }
function edSnapshot() { ed.undo.push(JSON.stringify(ed.L)); if (ed.undo.length > 60) ed.undo.shift(); ed.redo = []; }
function edUndo() { if (!ed.undo.length) return; ed.redo.push(JSON.stringify(ed.L)); ed.L = cleanLevel(JSON.parse(ed.undo.pop())); ed.sel = -1; edArena(); renderBuilder(); }
function edRedo() { if (!ed.redo.length) return; ed.undo.push(JSON.stringify(ed.L)); ed.L = cleanLevel(JSON.parse(ed.redo.pop())); ed.sel = -1; edArena(); renderBuilder(); }
function edView() {
  const cv = $('#buildCv'), r = cv.getBoundingClientRect(), w = r.width, h = r.height;
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
  for (const v of ed.arena.verts) { x0 = Math.min(x0, v[0]); x1 = Math.max(x1, v[0]); y0 = Math.min(y0, v[1]); y1 = Math.max(y1, v[1]); }
  const pad = 18, sc = Math.min((w - pad*2)/(x1 - x0), (h - pad*2)/(y1 - y0));
  return { w, h, sc, cx: w/2 - (x0 + x1)/2*sc, cy: h/2 - (y0 + y1)/2*sc };
}
// screen <-> world (side 0, your side, is at the bottom like in-game)
function edToWorld(px, py) { const v = edView(); return [(px - v.cx)/v.sc, (py - v.cy)/v.sc]; }
function edInside(x, y, margin) { for (const s of ed.arena.sides) if (x*s.out[0] + y*s.out[1] > s.d - (margin == null ? 0.13 : margin)) return false; return true; }
function edClampIn(x, y) { for (let k = 0; k < 8 && !edInside(x, y); k++) { x *= 0.94; y *= 0.94; } return [x, y]; }
function edSnap(v) { return ed.snap ? Math.round(v/0.025)*0.025 : v; }
function objHit(o, x, y) {
  if (['wall', 'portal', 'mover'].includes(o.t)) {
    const near = (ax, ay) => Math.hypot(x - ax, y - ay) < 0.05;
    if (near(o.x, o.y) || near(o.x2, o.y2)) return true;
    if (o.t === 'wall') { const dx = o.x2 - o.x, dy = o.y2 - o.y, L2 = dx*dx + dy*dy || 1, u = clamp(((x - o.x)*dx + (y - o.y)*dy)/L2, 0, 1); return Math.hypot(x - o.x - dx*u, y - o.y - dy*u) < 0.03; }
    return false;
  }
  const r = o.r || (o.s ? o.s*0.7 : 0.05);
  return Math.hypot(x - o.x, y - o.y) < Math.max(0.04, r + 0.015);
}
function edPick(x, y) { for (let i = ed.L.objs.length - 1; i >= 0; i--) if (objHit(ed.L.objs[i], x, y)) return i; return -1; }
function edMake(t, x, y) {
  const o = { t, x, y };
  if (['rock', 'bump', 'lava', 'hole', 'spin', 'mover'].includes(t)) o.r = { rock: 0.07, bump: 0.05, lava: 0.09, hole: 0.05, spin: 0.11, mover: 0.05 }[t];
  if (t === 'brick') { o.hp = 2; o.s = 0.06; }
  if (t === 'boost') o.a = Math.atan2(-y, -x) + (Math.hypot(x, y) < 0.05 ? Math.PI/2 : 0);
  if (t === 'spin') o.w = 1.6;
  if (t === 'mover') o.w = 1;
  if (['wall', 'portal', 'mover'].includes(t)) { o.x2 = x; o.y2 = y; }
  return o;
}
// symmetry copies of an object: mirror across the vertical axis, or rotate once per side
function edSymCopies(o) {
  if (ed.sym === 'off') return [];
  const out = [];
  const tf = fn => { const q = { ...o }; [q.x, q.y] = fn(o.x, o.y); if (o.x2 != null) [q.x2, q.y2] = fn(o.x2, o.y2); if (o.a != null) { const p = fn(Math.cos(o.a), Math.sin(o.a)), z = fn(0, 0); q.a = Math.atan2(p[1] - z[1], p[0] - z[0]); } return q; };
  if (ed.sym === 'mirror') out.push(tf((x, y) => [-x, y]));
  else { const n = ed.L.sides; for (let k = 1; k < n; k++) { const a = k*TAU/n, c = Math.cos(a), s = Math.sin(a); out.push(tf((x, y) => [x*c - y*s, x*s + y*c])); } }
  return out.filter(q => edInside(q.x, q.y, 0.05) && Math.hypot(q.x - o.x, q.y - o.y) > 0.03);
}
function edCount() { return ed.L.objs.length; }
function edPointer(type, e) {
  const cv = $('#buildCv'), r = cv.getBoundingClientRect();
  let [x, y] = edToWorld(e.clientX - r.left, e.clientY - r.top);
  if (type === 'down') {
    audioOn(); cv.setPointerCapture && cv.setPointerCapture(e.pointerId);
    const hit = edPick(x, y), tool = ed.tool;
    if (tool === 'erase') { if (hit >= 0) { edSnapshot(); ed.L.objs.splice(hit, 1); ed.sel = -1; tone(200, 0.08, 'square', 0.04, 0.6); renderBuilder(); } return; }
    if (tool === 'select') {
      if (hit >= 0) { const o = ed.L.objs[hit]; edSnapshot(); ed.sel = hit; ed.drag = { kind: 'move', i: hit, ox: x - o.x, oy: y - o.y, end: o.x2 != null && Math.hypot(x - o.x2, y - o.y2) < 0.05 ? 2 : o.x2 != null && Math.hypot(x - o.x, y - o.y) < 0.05 ? 1 : 0 }; }
      else ed.sel = -1;
      renderBuilder(); return;
    }
    if (edCount() >= 60) { toast('An arena can hold up to 60 things.'); return; }
    [x, y] = edClampIn(edSnap(x), edSnap(y));
    edSnapshot();
    const o = edMake(tool, x, y); ed.L.objs.push(o); ed.sel = ed.L.objs.length - 1;
    if (['wall', 'portal', 'mover'].includes(tool)) ed.drag = { kind: 'end', i: ed.sel };
    else { for (const q of edSymCopies(o)) if (edCount() < 60) ed.L.objs.push(q); ed.drag = null; }
    tone(520 + LV_TOOLS.findIndex(t => t[0] === tool)*30, 0.07, 'triangle', 0.05);
    renderBuilder(); return;
  }
  if (type === 'move' && ed.drag) {
    const o = ed.L.objs[ed.drag.i]; if (!o) return;
    if (ed.drag.kind === 'end') { [o.x2, o.y2] = edClampIn(edSnap(x), edSnap(y)); }
    else if (ed.drag.end === 2) { [o.x2, o.y2] = edClampIn(edSnap(x), edSnap(y)); }
    else if (ed.drag.end === 1) { [o.x, o.y] = edClampIn(edSnap(x), edSnap(y)); }
    else { const nx = edSnap(x - ed.drag.ox), ny = edSnap(y - ed.drag.oy), dx = nx - o.x, dy = ny - o.y; const [cx2, cy2] = edClampIn(nx, ny); o.x = cx2; o.y = cy2; if (o.x2 != null) { o.x2 += dx; o.y2 += dy; [o.x2, o.y2] = edClampIn(o.x2, o.y2); } }
    return;
  }
  if (type === 'up' && ed.drag) {
    const o = ed.L.objs[ed.drag.i];
    if (ed.drag.kind === 'end' && o) {
      if (Math.hypot(o.x2 - o.x, o.y2 - o.y) < 0.06) { const d = o.t === 'wall' ? 0.2 : 0.4; o.x2 = o.x + d; o.y2 = o.y; [o.x2, o.y2] = edClampIn(o.x2, o.y2); }
      for (const q of edSymCopies(o)) if (edCount() < 60) ed.L.objs.push(q);
    }
    ed.drag = null; renderBuilder();
  }
}
function drawBuilder() {
  if (!ed) return;
  const cv = $('#buildCv'), r = cv.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  if (cv.width !== Math.round(r.width*dpr) || cv.height !== Math.round(r.height*dpr)) { cv.width = Math.round(r.width*dpr); cv.height = Math.round(r.height*dpr); }
  const c = cv.getContext('2d'), v = edView();
  c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
  c.setTransform(dpr*v.sc, 0, 0, dpr*v.sc, dpr*v.cx, dpr*v.cy);
  const A = ed.arena;
  c.beginPath(); A.verts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath();
  c.fillStyle = ({ ice: 'rgba(170,230,255,0.13)', hole: 'rgba(40,10,60,0.45)', retro: 'rgba(40,255,140,0.06)' })[ed.L.ar] || 'rgba(120,100,255,0.08)'; c.fill();
  // grid
  c.save(); c.clip(); c.strokeStyle = 'rgba(160,150,230,0.08)'; c.lineWidth = 0.002;
  for (let k = -1.2; k <= 1.2001; k += 0.1) { c.beginPath(); c.moveTo(k, -1.3); c.lineTo(k, 1.3); c.stroke(); c.beginPath(); c.moveTo(-1.3, k); c.lineTo(1.3, k); c.stroke(); }
  if (ed.sym !== 'off') { c.strokeStyle = 'rgba(255,79,139,0.3)'; c.setLineDash([0.02, 0.02]); c.lineWidth = 0.004; if (ed.sym === 'mirror') { c.beginPath(); c.moveTo(0, -1.3); c.lineTo(0, 1.3); c.stroke(); } else for (let k = 0; k < ed.L.sides; k++) { const a = Math.PI/2 + k*TAU/ed.L.sides; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a)*1.3, Math.sin(a)*1.3); c.stroke(); } c.setLineDash([]); }
  c.restore();
  // paddles (ghost) on each side
  A.sides.forEach((s, i) => {
    const col = SEAT_DEFAULT[i % SEAT_DEFAULT.length];
    c.strokeStyle = col; c.globalAlpha = 0.35; c.lineWidth = 0.006; c.setLineDash([0.03, 0.025]); c.beginPath(); c.moveTo(s.A[0], s.A[1]); c.lineTo(s.B[0], s.B[1]); c.stroke(); c.setLineDash([]);
    const w = A.padW*ed.L.rules.paddle, mx = (s.A[0] + s.B[0])/2 - s.out[0]*INSET, my = (s.A[1] + s.B[1])/2 - s.out[1]*INSET;
    c.globalAlpha = 0.55; c.lineWidth = 0.044; c.lineCap = 'round'; c.beginPath(); c.moveTo(mx - s.dir[0]*w/2, my - s.dir[1]*w/2); c.lineTo(mx + s.dir[0]*w/2, my + s.dir[1]*w/2); c.stroke(); c.globalAlpha = 1;
  });
  if (A.bump > 0) for (const p of A.verts) { c.fillStyle = '#211A44'; c.strokeStyle = '#7C6FD0'; c.lineWidth = 0.008; c.beginPath(); c.arc(p[0], p[1], A.bump, 0, TAU); c.fill(); c.stroke(); }
  drawLevelObjs(c, { objs: ed.L.objs }, clock, true);
  // selection
  if (ed.sel >= 0 && ed.L.objs[ed.sel]) {
    const o = ed.L.objs[ed.sel], rr2 = (o.r || (o.s ? o.s*0.75 : 0.05)) + 0.02;
    c.strokeStyle = '#FFFFFF'; c.lineWidth = 0.004; c.setLineDash([0.012, 0.01]);
    c.beginPath(); c.arc(o.x, o.y, rr2 + 0.004*Math.sin(clock*6), 0, TAU); c.stroke();
    if (o.x2 != null) { c.beginPath(); c.arc(o.x2, o.y2, 0.05, 0, TAU); c.stroke(); }
    c.setLineDash([]);
  }
  // ball at center for scale
  c.fillStyle = 'rgba(255,255,255,0.8)'; c.beginPath(); c.arc(0, 0, BALL_R*ed.L.rules.size, 0, TAU); c.fill();
}
// ----- builder UI -----
function renderBuilder() {
  if (!ed) return;
  const L = ed.L;
  $('#lvName').value = L.name;
  const tb = $('#lvTools'); tb.textContent = '';
  for (const [id, n, ic] of LV_TOOLS) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'tool' + (id === ed.tool ? ' on' : '');
    b.append(Object.assign(document.createElement('i'), { textContent: ic }), Object.assign(document.createElement('span'), { textContent: n }));
    b.title = LV_TIPS[id];
    b.addEventListener('click', () => { ed.tool = id; if (id !== 'select') ed.sel = -1; renderBuilder(); });
    tb.append(b);
  }
  $('#lvTip').textContent = LV_TIPS[ed.tool] + '  ' + L.objs.length + '/60';
  setSeg($('#lvSym'), ed.sym, 's'); setSeg($('#lvSnap'), ed.snap ? 1 : 0, 'g');
  $('#btnLvUndo').disabled = !ed.undo.length; $('#btnLvRedo').disabled = !ed.redo.length;
  // inspector
  const o = ed.sel >= 0 ? L.objs[ed.sel] : null, ins = $('#lvInspect');
  ins.hidden = !o; ins.textContent = '';
  if (o) {
    const add = (label, fn) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = label; b.addEventListener('click', () => { edSnapshot(); fn(); renderBuilder(); }); ins.append(b); };
    ins.append(Object.assign(document.createElement('b'), { textContent: LV_TOOLS.find(t => t[0] === o.t)[1] }));
    if (o.r != null) { add('Smaller', () => o.r = clamp(o.r - 0.01, 0.03, 0.3)); add('Bigger', () => o.r = clamp(o.r + 0.01, 0.03, 0.3)); }
    if (o.t === 'brick') { add('Hits −', () => o.hp = clamp(o.hp - 1, 1, 5)); add('Hits +', () => o.hp = clamp(o.hp + 1, 1, 5)); add('Size', () => o.s = o.s >= 0.12 ? 0.045 : o.s + 0.025); }
    if (o.t === 'boost') { add('↺ Rotate', () => o.a -= Math.PI/8); add('↻ Rotate', () => o.a += Math.PI/8); }
    if (o.t === 'spin') { add('Slower', () => o.w = clamp(Math.abs(o.w) - 0.4, 0.4, 4)*Math.sign(o.w || 1)); add('Faster', () => o.w = clamp(Math.abs(o.w) + 0.4, 0.4, 4)*Math.sign(o.w || 1)); add('Flip', () => o.w = -o.w); }
    if (o.t === 'mover') { add('Slower', () => o.w = clamp(o.w - 0.25, 0.2, 3)); add('Faster', () => o.w = clamp(o.w + 0.25, 0.2, 3)); }
    add('Copy', () => { const q = { ...o, x: o.x + 0.06, y: o.y - 0.06 }; if (q.x2 != null) { q.x2 += 0.06; q.y2 -= 0.06; } [q.x, q.y] = edClampIn(q.x, q.y); L.objs.push(q); ed.sel = L.objs.length - 1; });
    add('Delete', () => { L.objs.splice(ed.sel, 1); ed.sel = -1; });
  }
  // rules
  const R = L.rules;
  setSeg($('#lvSides'), L.sides, 'n'); setSeg($('#lvAr'), L.ar, 'a'); setSeg($('#lvGoal'), R.goal, 'g'); setSeg($('#lvPu'), R.pu, 'p'); setSeg($('#lvGrav'), R.grav, 'v'); setSeg($('#lvServe'), R.serve, 'b');
  const lab = (id, txt) => { $(id).textContent = txt; };
  lab('#lvLivesV', R.lives); lab('#lvSpeedV', Math.round(R.speed*100) + '%'); lab('#lvSizeV', Math.round(R.size*100) + '%'); lab('#lvPaddleV', Math.round(R.paddle*100) + '%'); lab('#lvBotsV', R.bots <= 0.9 ? 'Easy' : R.bots <= 1.2 ? 'Normal' : R.bots <= 1.5 ? 'Hard' : 'Brutal');
  $('#lvGoalRow').hidden = R.goal === 'last'; lab('#lvGoalL', R.goal === 'stars' ? 'Stars to win' : 'Seconds'); lab('#lvGoalV', R.goalV);
  $('#lvStarWarn').hidden = !(R.goal === 'stars' && !L.objs.some(q => q.t === 'star'));
  document.querySelectorAll('#build .btab').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === ed.tab)));
  $('#lvBuildTab').hidden = ed.tab !== 'build'; $('#lvRulesTab').hidden = ed.tab !== 'rules';
}
function edSave(quiet) {
  const L = cleanLevel(ed.L);
  if (ed.idx >= 0 && myArenas[ed.idx]) myArenas[ed.idx] = L; else { myArenas.unshift(L); ed.idx = 0; if (myArenas.length > 30) myArenas.length = 30; }
  saveArenas(); if (!quiet) { toast('Saved "' + L.name + '"'); sfx.coin(); }
}
