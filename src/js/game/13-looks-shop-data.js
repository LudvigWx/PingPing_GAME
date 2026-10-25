// ---------- looks & shop ----------
const PALETTE = [['#3EE6FF', 'Ice'], ['#FF4F8B', 'Pink'], ['#FFB23E', 'Sun'], ['#B57CFF', 'Purple'], ['#4FFFC4', 'Mint'],
                 ['#FF5A4A', 'Lava'], ['#4A7BFF', 'Cobalt'], ['#FFE34A', 'Lemon'], ['#F3F0FF', 'White'], ['#FF8A3D', 'Tangerine'],
                 ['#C9D6F2', 'Silver'], ['#22C55E', 'Emerald'], ['#FF7A8A', 'Coral'], ['#7FD8FF', 'Sky'], ['#9B4DFF', 'Plum'], ['#FFC94A', 'Gold'],
                 ['#FF7518', 'Pumpkin'], ['#7CFF3A', 'Toxic'], ['#B3001B', 'Blood moon'], ['#E8E2CC', 'Bone']];
const HATS = [['none', 'None'], ['crown', 'Crown'], ['tophat', 'Top hat'], ['cap', 'Cap'], ['wizard', 'Wizard'], ['horns', 'Horn'],
              ['halo', 'Halo'], ['party', 'Party hat'], ['cat', 'Cat ears'], ['antenna', 'Antenna'], ['mohawk', 'Rooster'], ['propeller', 'Propeller'],
              ['chef', 'Chef hat'], ['bunny', 'Bunny ears'], ['pizza', 'Pizza slice'], ['toilet', 'Toilet roll'], ['shark', 'Shark fin'], ['viking', 'Viking'],
              ['duck', 'Rubber duck'], ['unicorn', 'Unicorn'], ['astro', 'Space helmet'], ['disco', 'Disco ball'], ['flamecrown', 'Fire crown'],
              ['demon', 'Demon horns'], ['champcrown', 'Champion crown'],
              ['pirate', 'Pirate hat'], ['beanie', 'Beanie'], ['icecrown', 'Ice crown'], ['voidhorns', 'Void horns'], ['emperor', 'Hollow crown'],
              ['witch', 'Witch hat'], ['pumpkin', 'Jack-o\'-lantern'], ['bat', 'Bat buddy'], ['candycorn', 'Candy corn'],
              ['krakencrown', 'Kraken crown'], ['mechhelm', 'Colossus helm'], ['sunhalo', 'Crown of rays'], ['hydra', 'Hydra heads']];
const FACES = [['eyes', 'Eyes'], ['angry', 'Angry'], ['shades', 'Glasses'], ['sleepy', 'Sleepy'], ['none', 'None'],
               ['tongue', 'Tongue'], ['mustache', 'Mustache'], ['clown', 'Clown'], ['hearts', 'In love'], ['vampire', 'Vampire'], ['monocle', 'Monocle'], ['robot', 'Robot'], ['laser', 'Laser eyes'],
               ['eyepatch', 'Eyepatch'], ['frozen', 'Frozen'], ['voideyes', 'Void eyes'], ['skeleton', 'Skeleton'], ['stitch', 'Stitches'], ['ghostface', 'Ghost face']];
const TRAILS = [['std', 'Plain'], ['pixel', 'Pixel'], ['fire', 'Fire'], ['rainbow', 'Rainbow'], ['stars', 'Stars'],
                ['bubbles', 'Bubbles'], ['hearts', 'Hearts'], ['confetti', 'Confetti'], ['notes', 'Music'], ['bolt', 'Lightning'], ['money', 'Money'], ['bossfire', 'Boss fire'],
                ['waves', 'Waves'], ['snow', 'Snowflakes'], ['void', 'Void orbs'], ['bats', 'Bats'], ['candy', 'Candy'], ['souls', 'Lost souls']];
const SKINS = [['solid', 'Solid'], ['wood', 'Wood'], ['zebra', 'Zebra'], ['pixel', 'Pixel'], ['matrix', 'Matrix'], ['lava', 'Lava'], ['galaxy', 'Galaxy'], ['rainbow', 'Rainbow'], ['gold', 'Gold'], ['tower', 'Glory of the Tower'],
               ['neonwave', 'Neon wave'], ['icecrystal', 'Ice crystal'], ['rift', 'Rift'], ['pumpkin', 'Pumpkin'], ['web', 'Spider web'], ['bones', 'Bones']];
const VICTORY = [['confetti', 'Confetti'], ['fireworks', 'Fireworks'], ['disco', 'Disco'], ['chickens', 'Chicken rain'], ['blackhole', 'Black hole'], ['champion', 'Champion'],
                 ['tide', 'Tidal wave'], ['snowstorm', 'Snowstorm'], ['supernova', 'Supernova'], ['ghosts', 'Ghosts'], ['batswarm', 'Bat swarm']];
const AURAS = [['none', 'None'], ['abyss', 'Abyssal tide'], ['forge', 'Forge heat'], ['solarflare', 'Solar flare'], ['datastream', 'Data stream']];
const BALLSKINS = [['std', 'Plain'], ['pearl', 'Abyss pearl'], ['core', 'Reactor core'], ['sun', 'Dying star'], ['glitch', 'Glitch orb']];
const PRICE = {
  c: { '#3EE6FF': 0, '#FF4F8B': 0, '#FFB23E': 0, '#B57CFF': 40, '#4FFFC4': 40, '#FF5A4A': 40, '#4A7BFF': 40, '#FFE34A': 50, '#F3F0FF': 60, '#FF8A3D': 40,
       '#C9D6F2': 60, '#22C55E': 60, '#FF7A8A': 60, '#7FD8FF': 60, '#9B4DFF': 80, '#FFC94A': 120, '#FF7518': null, '#7CFF3A': null, '#B3001B': null, '#E8E2CC': null },
  h: { none: 0, cap: 0, cat: 0, party: 70, antenna: 60, mohawk: 80, tophat: 90, horns: 100, crown: 120, halo: 130, wizard: 150, propeller: 160,
       chef: 110, bunny: 120, pizza: 140, toilet: 150, shark: 160, viking: 170, duck: 180, unicorn: 200, astro: 220, disco: 240, flamecrown: 260, demon: null, champcrown: null,
       pirate: null, beanie: null, icecrown: null, voidhorns: null, emperor: null, witch: null, pumpkin: null, bat: null, candycorn: null, krakencrown: null, mechhelm: null, sunhalo: null, hydra: null },
  f: { eyes: 0, none: 0, angry: 40, sleepy: 40, shades: 70, tongue: 70, mustache: 80, clown: 90, hearts: 100, vampire: 120, monocle: 130, robot: 180, laser: 250, eyepatch: null, frozen: null, voideyes: null, skeleton: null, stitch: null, ghostface: null },
  t: { std: 0, pixel: 80, fire: 120, rainbow: 150, stars: 180, bubbles: 120, hearts: 140, confetti: 160, notes: 180, bolt: 200, money: 220, bossfire: null, waves: null, snow: null, void: null, bats: null, candy: null, souls: null },
  k: { solid: 0, wood: 100, zebra: 120, pixel: 140, matrix: 220, lava: 240, galaxy: 260, rainbow: 280, gold: 300, tower: null, neonwave: null, icecrystal: null, rift: null, pumpkin: null, web: null, bones: null },
  v: { confetti: 0, fireworks: 200, disco: 220, chickens: 250, blackhole: 280, champion: null, tide: null, snowstorm: null, supernova: null, ghosts: null, batswarm: null },
  a: { classic: 0, retro: 100, ice: 150, hole: 200 },
  u: { none: 0, abyss: null, forge: null, solarflare: null, datastream: null },
  b: { std: 0, pearl: null, core: null, sun: null, glitch: null }
};
// ----- autumn drop: new shop cosmetics + secret ??? items -----
HATS.push(['headphones', 'Headphones'], ['cowboy', 'Cowboy hat'], ['jester', 'Jester'], ['samurai', 'Samurai helm'], ['frog', 'Frog hat'], ['mushroom', 'Toadstool'], ['infinity', 'Infinity']);
FACES.push(['starry', 'Starry eyes'], ['kawaii', 'Kawaii'], ['cyclops', 'Cyclops'], ['nerd', 'Nerd'], ['dizzy', 'Dizzy'], ['bandit', 'Bandit mask'], ['owl', 'Night owl']);
SKINS.push(['camo', 'Camo'], ['checker', 'Checkered flag'], ['circuit', 'Circuit'], ['holo', 'Holo foil'], ['marble', 'Marble'], ['thunder', 'Thunderstorm'], ['prism', 'Prism']);
TRAILS.push(['sparkle', 'Sparkle'], ['ink', 'Ink splat'], ['petals', 'Petals'], ['comet', 'Comet'], ['smoke', 'Smoke'], ['glitchtrail', 'Glitch'], ['plasma', 'Plasma']);
VICTORY.push(['meteors', 'Meteor shower'], ['balloons', 'Balloons'], ['lasers', 'Laser show'], ['singularity', 'Singularity']);
BALLSKINS.push(['eightball', 'Magic 8']);
Object.assign(PRICE.h, { headphones: 180, cowboy: 160, jester: 190, samurai: 260, frog: 150, mushroom: 140, infinity: null });
Object.assign(PRICE.f, { starry: 120, kawaii: 100, cyclops: 140, nerd: 110, dizzy: 130, bandit: 120, owl: null });
Object.assign(PRICE.k, { camo: 160, checker: 180, circuit: 240, holo: 300, marble: 220, thunder: 280, prism: null });
Object.assign(PRICE.t, { sparkle: 160, ink: 140, petals: 170, comet: 220, smoke: 130, glitchtrail: 240, plasma: null });
Object.assign(PRICE.v, { meteors: 300, balloons: 240, lasers: 320, singularity: null });
PRICE.b.eightball = null;
// Secret items stay "???" in the shop until you earn them. The hint is all you get.
const SECRETS = {
  't:plasma': 'Some say a ball can get too hot to handle…',
  'h:infinity': 'Multiply until it never ends.',
  'k:prism': 'Five in a row. No breaks.',
  'f:owl': 'Only awake while the world sleeps.',
  'v:singularity': 'Gold. Gold. Gold.',
  'b:eightball': 'Ask the magic ball: will this rally ever end?'
};
const SEAT_DEFAULT = ['#3EE6FF', '#FF4F8B', '#FFB23E', '#B57CFF', '#4FFFC4', '#FFE34A', '#FF5A4A'];
const BOSS_LOOK = { c: '#FF5A4A', h: 'horns', f: 'angry', t: 'fire', s: 'lava', v: 'confetti' };
function validLook(l, fallbackC) {
  l = l && typeof l === 'object' ? l : {};
  return {
    c: PALETTE.some(p => p[0] === l.c) ? l.c : (fallbackC || PALETTE[0][0]),
    h: HATS.some(p => p[0] === l.h) ? l.h : 'none',
    f: FACES.some(p => p[0] === l.f) ? l.f : 'eyes',
    t: TRAILS.some(p => p[0] === l.t) ? l.t : 'std',
    s: SKINS.some(p => p[0] === l.s) ? l.s : 'solid',
    v: VICTORY.some(p => p[0] === l.v) ? l.v : 'confetti',
    u: AURAS.some(p => p[0] === l.u) ? l.u : 'none',
    b: BALLSKINS.some(p => p[0] === l.b) ? l.b : 'std'
  };
}
function randomLook(avoid) {
  const cs = PALETTE.map(p => p[0]).filter(c => !avoid.includes(c) && PRICE.c[c] != null);
  const buyable = (list, k) => list.filter(p => PRICE[k][p[0]] != null && p[0] !== 'none');
  return { c: pick(cs.length ? cs : PALETTE.map(p => p[0])), h: pick(buyable(HATS, 'h'))[0], f: pick(buyable(FACES, 'f'))[0], t: pick(buyable(TRAILS, 't'))[0], s: pick(buyable(SKINS, 'k'))[0], v: 'confetti', u: 'none', b: 'std' };
}

function poly(c, pts) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); }
// Local units: 1 = 0.01 world. Origin at paddle center, +x along paddle, -y points into the arena ("up").
function drawHat(c, hat, col, t) {
  c.save(); c.translate(0, -2.1);
  if (hat === 'crown') {
    c.fillStyle = '#FFD84A'; poly(c, [[-7, 0], [-7, -8], [-3.5, -4.5], [0, -10], [3.5, -4.5], [7, -8], [7, 0]]); c.fill();
    c.fillStyle = col; [-3.5, 0, 3.5].forEach(x => { c.beginPath(); c.arc(x, -2, 1, 0, TAU); c.fill(); });
  } else if (hat === 'tophat') {
    c.fillStyle = '#17131F'; c.fillRect(-8, -1.6, 16, 1.6); c.fillRect(-5.2, -13, 10.4, 11.6);
    c.fillStyle = col; c.fillRect(-5.2, -4.8, 10.4, 2.2);
    c.strokeStyle = 'rgba(255,255,255,0.35)'; c.lineWidth = 0.5; c.strokeRect(-5.2, -13, 10.4, 11.6);
  } else if (hat === 'cap') {
    c.fillStyle = col; c.beginPath(); c.arc(0, 0, 6, Math.PI, 0); c.closePath(); c.fill();
    c.beginPath(); c.ellipse(7.5, -0.7, 5, 1.3, 0, 0, TAU); c.fill();
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(7.5, -0.7, 5, 1.3, 0, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -6, 1, 0, TAU); c.fill();
  } else if (hat === 'wizard') {
    c.fillStyle = '#4136A8'; c.beginPath(); c.moveTo(-6, 0); c.quadraticCurveTo(-2, -10, 4, -18); c.quadraticCurveTo(2, -9, 6, 0); c.closePath(); c.fill();
    c.fillStyle = '#2E2580'; c.beginPath(); c.ellipse(0, -0.4, 9, 1.6, 0, 0, TAU); c.fill();
    c.fillStyle = '#FFE34A'; [[-1.5, -5], [1.6, -9.5], [2.8, -14]].forEach(p => { c.beginPath(); c.arc(p[0], p[1], 0.9, 0, TAU); c.fill(); });
  } else if (hat === 'horns') {
    c.fillStyle = '#F2E8D0';
    [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s*3, 0); c.quadraticCurveTo(s*10.5, -1, s*10, -11); c.quadraticCurveTo(s*7, -4, s*6.8, 0); c.closePath(); c.fill(); });
  } else if (hat === 'halo') {
    const y = -7 + Math.sin(t*3)*0.8;
    c.strokeStyle = '#FFE58A'; c.lineWidth = 1.3; c.shadowColor = '#FFE58A'; c.shadowBlur = 10;
    c.beginPath(); c.ellipse(0, y, 7, 1.8, 0, 0, TAU); c.stroke(); c.shadowBlur = 0;
  } else if (hat === 'party') {
    c.save(); poly(c, [[-5, 0], [5, 0], [0, -15]]); c.fillStyle = col; c.fill(); c.clip();
    c.strokeStyle = '#fff'; c.lineWidth = 1.4;
    for (let k = -16; k < 10; k += 4) { c.beginPath(); c.moveTo(-6, k); c.lineTo(6, k - 6); c.stroke(); }
    c.restore(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, -15, 1.8, 0, TAU); c.fill();
  } else if (hat === 'cat') {
    [-1, 1].forEach(s => {
      c.fillStyle = col; poly(c, [[s*8.5, 0], [s*3, 0], [s*6.8, -8.5]]); c.fill();
      c.fillStyle = '#FFB3CF'; poly(c, [[s*7.2, -0.6], [s*4.3, -0.6], [s*6.5, -5.5]]); c.fill();
    });
  } else if (hat === 'antenna') {
    const sw = Math.sin(t*4)*2;
    c.strokeStyle = '#C9C3E8'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(sw*0.3, -7, sw, -12); c.stroke();
    c.fillStyle = col; if (Math.sin(t*6) > 0) { c.shadowColor = col; c.shadowBlur = 12; }
    c.beginPath(); c.arc(sw, -12, 2, 0, TAU); c.fill(); c.shadowBlur = 0;
  } else if (hat === 'mohawk') {
    let k = 0;
    for (let x = -6; x <= 6; x += 3, k++) { c.fillStyle = k % 2 ? '#fff' : col; poly(c, [[x-1.8, 0.2], [x+1.8, 0.2], [x + 0.6, -(6.5 + (k % 2 ? 0 : 3))]]); c.fill(); }
  } else if (hat === 'chef') {
    c.fillStyle = '#FFFFFF'; c.fillRect(-5.5, -7, 11, 7);
    [[-4.5, -9, 4], [0, -11, 4.6], [4.5, -9, 4]].forEach(q => { c.beginPath(); c.arc(q[0], q[1], q[2], 0, TAU); c.fill(); });
    c.fillStyle = 'rgba(0,0,0,0.12)'; c.fillRect(-5.5, -2.2, 11, 1);
  } else if (hat === 'bunny') {
    [-1, 1].forEach(s => { c.save(); c.translate(s*3.5, 0); c.rotate(s*(0.15 + 0.05*Math.sin(t*3))); c.fillStyle = '#F3F0FF'; c.beginPath(); c.ellipse(0, -8, 2.4, 8, 0, 0, TAU); c.fill(); c.fillStyle = '#FFB3CF'; c.beginPath(); c.ellipse(0, -8, 1.1, 6, 0, 0, TAU); c.fill(); c.restore(); });
  } else if (hat === 'pizza') {
    c.fillStyle = '#E8A951'; c.beginPath(); c.moveTo(-7, -1); c.quadraticCurveTo(0, 2, 7, -1); c.lineTo(0, -15); c.closePath(); c.fill();
    c.fillStyle = '#FFD24A'; c.beginPath(); c.moveTo(-5.6, -2); c.lineTo(5.6, -2); c.lineTo(0, -13.5); c.closePath(); c.fill();
    c.fillStyle = '#D2382E'; [[-1.8, -5], [2, -7], [0, -10.5], [-2.4, -2.8]].forEach(q => { c.beginPath(); c.arc(q[0], q[1], 1.2, 0, TAU); c.fill(); });
  } else if (hat === 'toilet') {
    c.fillStyle = '#F7F7FA'; c.fillRect(-5, -10, 10, 10);
    c.beginPath(); c.ellipse(0, -10, 5, 1.8, 0, 0, TAU); c.fillStyle = '#E2E2EA'; c.fill();
    c.fillStyle = '#8A7A6A'; c.beginPath(); c.ellipse(0, -10, 1.6, 0.7, 0, 0, TAU); c.fill();
    c.fillStyle = '#F7F7FA'; c.beginPath(); c.moveTo(5, -8); c.lineTo(8.5 + Math.sin(t*3)*0.6, -8); c.lineTo(8 + Math.sin(t*3), 1.5); c.lineTo(5, 1.5); c.fill();
    c.strokeStyle = 'rgba(0,0,0,0.12)'; c.lineWidth = 0.4; c.beginPath(); c.moveTo(5.2, -4); c.lineTo(8.3, -4); c.stroke();
  } else if (hat === 'shark') {
    c.fillStyle = '#8FA3B8'; c.beginPath(); c.moveTo(-5, 0); c.quadraticCurveTo(-1, -6, 3, -13); c.quadraticCurveTo(2, -5, 6, 0); c.closePath(); c.fill();
    c.fillStyle = '#B9C8D8'; c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(0, -4, 2.5, -9); c.quadraticCurveTo(1.5, -4, 3, 0); c.closePath(); c.fill();
  } else if (hat === 'viking') {
    c.fillStyle = '#F2E8D0'; [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s*5, -3); c.quadraticCurveTo(s*11, -4, s*11, -12); c.quadraticCurveTo(s*8, -6, s*4, -5.5); c.closePath(); c.fill(); });
    c.fillStyle = '#9AA3B5'; c.beginPath(); c.arc(0, 0, 6.5, Math.PI, 0); c.closePath(); c.fill();
    c.fillStyle = '#C9A24A'; c.fillRect(-6.5, -1.6, 13, 1.6); c.fillRect(-0.7, -6.5, 1.4, 5);
  } else if (hat === 'duck') {
    const bob = Math.sin(t*4)*0.6;
    c.fillStyle = '#FFD84A'; c.beginPath(); c.ellipse(0, -3.5 + bob, 6, 3.6, 0, 0, TAU); c.fill();
    c.beginPath(); c.arc(3.2, -8 + bob, 3, 0, TAU); c.fill();
    c.fillStyle = '#FF8A3D'; c.beginPath(); c.ellipse(6.4, -7.6 + bob, 1.9, 0.9, 0, 0, TAU); c.fill();
    c.fillStyle = '#0B0914'; c.beginPath(); c.arc(4, -8.8 + bob, 0.6, 0, TAU); c.fill();
    c.fillStyle = '#F0B020'; c.beginPath(); c.ellipse(-1.5, -3.8 + bob, 2.6, 1.4, -0.3, 0, TAU); c.fill();
  } else if (hat === 'unicorn') {
    c.fillStyle = '#FF9BD2'; [-4, -1.5, 1].forEach((x, k) => { c.beginPath(); c.ellipse(x, -1.5, 2, 3, 0.4, 0, TAU); c.fillStyle = ['#FF9BD2', '#B57CFF', '#7FD8FF'][k]; c.fill(); });
    const g = c.createLinearGradient(0, 0, 0, -16); g.addColorStop(0, '#FFE58A'); g.addColorStop(1, '#FF9BD2');
    c.fillStyle = g; c.beginPath(); c.moveTo(-2.4, -1); c.lineTo(2.4, -1); c.lineTo(0.4, -16); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,0.7)'; c.lineWidth = 0.5; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(-2.2 + k*0.5, -1 - k*3.5); c.lineTo(2 - k*0.5, -2.5 - k*3.5); c.stroke(); }
  } else if (hat === 'astro') {
    c.fillStyle = 'rgba(180,230,255,0.18)'; c.strokeStyle = 'rgba(220,245,255,0.9)'; c.lineWidth = 0.7;
    c.beginPath(); c.arc(0, 1, 9.5, Math.PI*1.05, Math.PI*1.95); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.6; c.beginPath(); c.arc(0, 1, 7.5, Math.PI*1.2, Math.PI*1.45); c.stroke();
    c.strokeStyle = '#C9C3E8'; c.beginPath(); c.moveTo(5, -6); c.lineTo(8, -12); c.stroke();
    c.fillStyle = Math.sin(t*5) > 0 ? '#FF5A4A' : '#7CFFB2'; c.beginPath(); c.arc(8, -12, 1.1, 0, TAU); c.fill();
  } else if (hat === 'disco') {
    c.strokeStyle = '#C9C3E8'; c.lineWidth = 0.5; c.beginPath(); c.moveTo(0, -1); c.lineTo(0, -4); c.stroke();
    const R = 5.5, cy = -9.5;
    c.save(); c.beginPath(); c.arc(0, cy, R, 0, TAU); c.clip();
    for (let yy = -R; yy < R; yy += 1.6) for (let xx = -R; xx < R; xx += 1.6) {
      const ph = Math.sin(t*6 + xx*1.3 + yy*0.7); c.fillStyle = ph > 0.6 ? '#FFFFFF' : ph > 0 ? '#C9D6F2' : '#6F80A6'; c.fillRect(xx + 0.1, cy + yy + 0.1, 1.4, 1.4);
    }
    c.restore();
    c.fillStyle = 'hsl(' + ((t*120) % 360) + ',90%,70%)'; star4(c, 6*Math.cos(t*3), cy + 6*Math.sin(t*3), 1.4);
  } else if (hat === 'flamecrown' || hat === 'demon' || hat === 'champcrown') {
    if (hat === 'demon') {
      c.fillStyle = '#3A0A14'; [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s*3, 0); c.quadraticCurveTo(s*12, -2, s*9, -14); c.quadraticCurveTo(s*8, -5, s*6.5, 0); c.closePath(); c.fill(); });
      c.strokeStyle = '#FF2244'; c.lineWidth = 0.6; [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s*4, -1); c.quadraticCurveTo(s*10.5, -3, s*9, -13); c.stroke(); });
    }
    const base = hat === 'demon' ? '#FF2244' : '#FFD84A';
    if (hat !== 'demon') { c.fillStyle = base; poly(c, [[-7, 0], [-7, -6], [-3.5, -3.5], [0, -8], [3.5, -3.5], [7, -6], [7, 0]]); c.fill(); }
    for (let k = -1; k <= 1; k++) {
      const fl = 1 + 0.25*Math.sin(t*14 + k*2), x = k*4.5, y0 = hat === 'demon' ? -2 : -6;
      c.fillStyle = hat === 'champcrown' ? '#FFF6B0' : '#FF8A3D'; c.beginPath(); c.moveTo(x - 2, y0); c.quadraticCurveTo(x - 2.5, y0 - 5*fl, x, y0 - 8*fl); c.quadraticCurveTo(x + 2.5, y0 - 5*fl, x + 2, y0); c.closePath(); c.fill();
      c.fillStyle = hat === 'champcrown' ? '#FFFFFF' : '#FFE34A'; c.beginPath(); c.moveTo(x - 1, y0); c.quadraticCurveTo(x - 1.2, y0 - 3*fl, x, y0 - 4.5*fl); c.quadraticCurveTo(x + 1.2, y0 - 3*fl, x + 1, y0); c.closePath(); c.fill();
    }
    if (hat === 'champcrown') { c.fillStyle = '#4FA8FF'; c.beginPath(); c.arc(0, -3, 1.3, 0, TAU); c.fill(); c.fillStyle = '#FF4F8B'; [-4, 4].forEach(x => { c.beginPath(); c.arc(x, -2.5, 1, 0, TAU); c.fill(); }); c.fillStyle = '#FFF6B0'; star4(c, 8*Math.sin(t*2), -12 + 2*Math.cos(t*3), 1.3); }
  } else if (hat === 'propeller') {
    c.fillStyle = col; c.beginPath(); c.arc(0, 0, 4.6, Math.PI, 0); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,0.8)'; c.fillRect(-0.7, -4.6, 1.4, 4.6);
    c.strokeStyle = '#C9C3E8'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(0, -4.6); c.lineTo(0, -7.5); c.stroke();
    const sx = Math.abs(Math.cos(t*16));
    c.fillStyle = '#FFD84A'; c.beginPath(); c.ellipse(0, -7.5, 0.4 + 7*sx, 1, 0, 0, TAU); c.fill();
    c.fillStyle = '#FF5A4A'; c.beginPath(); c.arc(0, -7.5, 1, 0, TAU); c.fill();
  } else if (!drawHat6(c, hat, col, t) && !drawHat5(c, hat, col, t) && !drawHat4(c, hat, col, t) && !drawHat3(c, hat, col, t)) drawHat2(c, hat, col, t);
  c.restore();
}
function drawFace(c, face, gx, gy, t) {
  if (face === 'none') return;
  if (drawFace6(c, face, gx, gy, t) || drawFace4(c, face, gx, gy, t) || drawFace2(c, face, gx, gy, t)) return;
  const blink = (t % 3.7) < 0.12;
  if (face === 'shades') {
    c.fillStyle = '#0B0914';
    [-1, 1].forEach(s => { c.beginPath(); c.ellipse(s*4.2, 0.1, 2.6, 1.7, 0, 0, TAU); c.fill(); });
    c.fillRect(-1.8, -0.6, 3.6, 0.8);
    c.strokeStyle = 'rgba(255,255,255,0.8)'; c.lineWidth = 0.45;
    [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s*4.2 - 1.4, -0.7); c.lineTo(s*4.2 - 0.4, -1.1); c.stroke(); });
    return;
  }
  if (face === 'robot') {
    c.fillStyle = '#0B0914'; c.fillRect(-7.5, -1.4, 15, 2.8);
    const sx = Math.sin(t*3)*6; c.fillStyle = '#FF2244'; c.shadowColor = '#FF2244'; c.shadowBlur = 6; c.fillRect(sx - 1.2, -0.7, 2.4, 1.4); c.shadowBlur = 0;
    return;
  }
  if (face === 'hearts') {
    c.fillStyle = '#FF4F8B';
    [-1, 1].forEach(s => { const x = s*4.2, k = 1 + 0.12*Math.sin(t*8); c.save(); c.translate(x, 0); c.scale(k, k); c.beginPath(); c.moveTo(0, 1.5); c.bezierCurveTo(-2.6, -0.2, -1.4, -2.2, 0, -0.9); c.bezierCurveTo(1.4, -2.2, 2.6, -0.2, 0, 1.5); c.fill(); c.restore(); });
    return;
  }
  if (face === 'laser') {
    [-1, 1].forEach(s => {
      const x = s*4.2; c.fillStyle = '#FF2244'; c.shadowColor = '#FF2244'; c.shadowBlur = 8; c.beginPath(); c.ellipse(x, 0, 1.8, 1.4, 0, 0, TAU); c.fill();
      if (Math.sin(t*9 + s) > -0.3) { c.strokeStyle = 'rgba(255,40,70,0.75)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x, 0); c.lineTo(x + gx*40, gy*40); c.stroke(); }
      c.shadowBlur = 0;
    });
    return;
  }
  const ry = blink ? 0.3 : face === 'sleepy' ? 0.75 : 1.7;
  [-1, 1].forEach(s => {
    const x = s*4.2;
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, 0, 1.8, ry, 0, 0, TAU); c.fill();
    if (!blink) { c.fillStyle = '#0B0914'; c.beginPath(); c.arc(x + gx*0.8, (face === 'sleepy' ? 0.2 : gy*0.8), face === 'sleepy' ? 0.6 : 0.9, 0, TAU); c.fill(); }
    if (face === 'angry') { c.strokeStyle = '#0B0914'; c.lineWidth = 0.75; c.beginPath(); c.moveTo(s*6.4, -2.3); c.lineTo(s*2.4, -1.1); c.stroke(); }
    if (face === 'vampire' && !blink) { c.fillStyle = '#FF2244'; c.beginPath(); c.arc(x + gx*0.8, gy*0.8, 0.9, 0, TAU); c.fill(); }
    if (face === 'monocle' && s === 1) { c.strokeStyle = '#FFD84A'; c.lineWidth = 0.5; c.beginPath(); c.arc(x, 0, 2.5, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x + 1.8, 1.8); c.quadraticCurveTo(x + 3, 4, x + 1, 6); c.stroke(); }
  });
  if (face === 'mustache') { c.fillStyle = '#2A1A10'; [-1, 1].forEach(s => { c.beginPath(); c.moveTo(0, 1.4); c.quadraticCurveTo(s*3, 0.4, s*5.5, 2.4); c.quadraticCurveTo(s*6.5, 1.2, s*5.8, 0.8); c.quadraticCurveTo(s*3, 3.4, 0, 2.6); c.closePath(); c.fill(); }); }
  if (face === 'clown') { c.fillStyle = '#FF2244'; c.beginPath(); c.arc(0, 0.6, 1.6, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,0.7)'; c.beginPath(); c.arc(-0.5, 0.1, 0.4, 0, TAU); c.fill(); }
  if (face === 'vampire') { c.fillStyle = '#FFFFFF'; [-1, 1].forEach(s => { c.beginPath(); c.moveTo(s*1.2, 2.2); c.lineTo(s*2.2, 2.2); c.lineTo(s*1.7, 4.6); c.closePath(); c.fill(); }); }
  if (face === 'tongue') { c.fillStyle = '#FF7A9A'; c.beginPath(); c.moveTo(-1.6, 2); c.lineTo(1.6, 2); c.quadraticCurveTo(1.8, 6 + Math.sin(t*5)*0.6, 0, 6 + Math.sin(t*5)*0.6); c.quadraticCurveTo(-1.8, 6, -1.6, 2); c.fill(); c.strokeStyle = '#D9506F'; c.lineWidth = 0.3; c.beginPath(); c.moveTo(0, 2.4); c.lineTo(0, 4.8); c.stroke(); }
}
function drawSkin(c, look, hw, t) {
  const L = -hw - 2.2, Wd = hw*2 + 4.4;
  c.save(); c.beginPath(); if (c.roundRect) c.roundRect(L, -2.2, Wd, 4.4, 2.2); else c.rect(L, -2.2, Wd, 4.4); c.clip();
  const s = look.s;
  if (s === 'zebra') { c.fillStyle = '#F7F7FA'; c.fillRect(L, -3, Wd, 6); c.fillStyle = '#16112E'; for (let x = L; x < -L + 2; x += 3.2) { c.beginPath(); c.moveTo(x, -3); c.lineTo(x + 1.4, -3); c.lineTo(x + 0.2, 3); c.lineTo(x - 1.2, 3); c.fill(); } }
  else if (s === 'wood') { c.fillStyle = '#8A5A2B'; c.fillRect(L, -3, Wd, 6); c.strokeStyle = '#6A3F18'; c.lineWidth = 0.4; for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(L, k); for (let x = L; x < -L; x += 2) c.lineTo(x, k + Math.sin(x*0.6 + k)*0.35); c.stroke(); } }
  else if (s === 'pixel') { for (let x = L, i = 0; x < -L; x += 2.2, i++) for (let y = -2.2, j = 0; y < 2.2; y += 2.2, j++) { c.fillStyle = (i + j) % 2 ? look.c : '#16112E'; c.fillRect(x, y, 2.2, 2.2); } }
  else if (s === 'matrix') { c.fillStyle = '#031A0B'; c.fillRect(L, -3, Wd, 6); for (let x = L + 1, i = 0; x < -L; x += 1.8, i++) { const on = Math.sin(t*7 + i*1.7) > 0; c.fillStyle = on ? '#3CFF8C' : '#0D6B32'; c.fillRect(x, -1.5 + ((i*7) % 3), 0.9, 1.2); } }
  else if (s === 'lava') { c.fillStyle = '#3A0A0A'; c.fillRect(L, -3, Wd, 6); c.strokeStyle = 'rgba(255,' + Math.round(140 + 80*Math.sin(t*4)) + ',40,1)'; c.lineWidth = 0.6; c.beginPath(); for (let x = L, k = 0; x < -L; x += 2.5, k++) c.lineTo(x, ((k*37) % 5) - 2); c.stroke(); }
  else if (s === 'galaxy') { const g = c.createLinearGradient(L, 0, -L, 0); g.addColorStop(0, '#1A0B3A'); g.addColorStop(0.5, '#3A1A6A'); g.addColorStop(1, '#0B1A3A'); c.fillStyle = g; c.fillRect(L, -3, Wd, 6); c.fillStyle = '#fff'; for (let k = 0; k < Wd/2; k++) { const x = L + ((k*13.7) % Wd), y = ((k*5.3) % 4) - 2; c.globalAlpha = 0.5 + 0.5*Math.sin(t*3 + k); c.fillRect(x, y, 0.5, 0.5); } c.globalAlpha = 1; }
  else if (s === 'rainbow') { const g = c.createLinearGradient(L, 0, -L, 0); for (let k = 0; k <= 6; k++) g.addColorStop(k/6, 'hsl(' + ((k*60 + t*120) % 360) + ',95%,62%)'); c.fillStyle = g; c.fillRect(L, -3, Wd, 6); }
  else if (s === 'gold' || s === 'tower') {
    const g = c.createLinearGradient(L, -2, -L, 2);
    if (s === 'gold') { g.addColorStop(0, '#8A5F0A'); g.addColorStop(0.5, '#FFE58A'); g.addColorStop(1, '#C9921A'); }
    else { g.addColorStop(0, '#4A1A8A'); g.addColorStop(0.5, '#FFD84A'); g.addColorStop(1, '#4A1A8A'); }
    c.fillStyle = g; c.fillRect(L, -3, Wd, 6);
    const sx = L + ((t*20) % (Wd + 10)) - 5; c.fillStyle = 'rgba(255,255,255,0.6)'; c.beginPath(); c.moveTo(sx, -3); c.lineTo(sx + 2, -3); c.lineTo(sx - 1, 3); c.lineTo(sx - 3, 3); c.fill();
    if (s === 'tower') { c.fillStyle = '#FFF6B0'; star4(c, L + ((t*7) % Wd), 0, 1.2); }
  }
  else if (s.startsWith('pskin')) drawPrestigeSkin(c, +s.slice(5), L, Wd, t);
  else if (!drawSkin6(c, s, look, L, Wd, t) && !drawSkin5(c, s, look, L, Wd, t) && !drawSkin4(c, s, look, L, Wd, t)) drawSkin2(c, s, look, L, Wd, t);
  c.restore();
}
function drawPaddleLocal(c, look, hwU, t, gaze, state, glowPx) {
  if (look.u && look.u !== 'none' && !drawAura6(c, look.u, hwU, t, look.c) && !drawAura5(c, look.u, hwU, t, look.c)) drawAura(c, look.u, hwU, t, look.c);
  c.lineCap = 'round';
  c.shadowColor = look.c; c.shadowBlur = glowPx;
  c.strokeStyle = state.ice ? '#CFF6FF' : look.c; c.lineWidth = 4.4;
  c.beginPath(); c.moveTo(-hwU, 0); c.lineTo(hwU, 0); c.stroke();
  c.shadowBlur = 0;
  if (look.s && look.s !== 'solid' && !state.ice) drawSkin(c, look, hwU, t);
  c.strokeStyle = 'rgba(255,255,255,0.55)'; c.lineWidth = 0.9;
  c.beginPath(); c.moveTo(-hwU*0.85, -1.1); c.lineTo(hwU*0.85, -1.1); c.stroke();
  if (state.ice) { c.fillStyle = 'rgba(255,255,255,0.75)'; for (let x = -hwU + 2; x < hwU - 1; x += 5) { c.beginPath(); c.moveTo(x, 2.2); c.lineTo(x + 1, 4.2); c.lineTo(x + 2, 2.2); c.fill(); } }
  drawFace(c, look.f, gaze[0], gaze[1], t);
  drawHat(c, look.h, look.c, t);
}
function star4(c, x, y, r) { c.beginPath(); c.moveTo(x, y - r); c.lineTo(x + r*0.3, y - r*0.3); c.lineTo(x + r, y); c.lineTo(x + r*0.3, y + r*0.3); c.lineTo(x, y + r); c.lineTo(x - r*0.3, y + r*0.3); c.lineTo(x - r, y); c.lineTo(x - r*0.3, y - r*0.3); c.closePath(); c.fill(); }
// Draws one trail dot. k: 0..1 age (1 newest), r: ball radius in current units, idx: position index.
function trailDot(c, style, col, x, y, r, k, idx, t) {
  if (style === 'pixel') { c.fillStyle = col; const s = r*(0.5 + 0.9*k); c.fillRect(x - s, y - s, s*2, s*2); }
  else if (style === 'fire') { c.fillStyle = k > 0.6 ? '#FFE34A' : k > 0.3 ? '#FF8A3D' : '#FF4A3D'; c.beginPath(); c.arc(x, y, r*(0.45 + 0.9*k)*(0.85 + 0.3*Math.sin(t*30 + idx)), 0, TAU); c.fill(); }
  else if (style === 'rainbow') { c.fillStyle = 'hsl(' + ((idx*28 + t*200) % 360) + ',95%,62%)'; c.beginPath(); c.arc(x, y, r*(0.4 + 0.7*k), 0, TAU); c.fill(); }
  else if (style === 'stars') { c.fillStyle = idx % 2 ? '#fff' : col; star4(c, x, y, r*(0.6 + 1.1*k)); }
  else if (style === 'bubbles') { c.strokeStyle = idx % 3 ? col : '#ffffff'; c.lineWidth = r*0.18; c.beginPath(); c.arc(x + Math.sin(idx*2.1)*r*0.6, y + Math.cos(idx*1.7)*r*0.6, r*(0.3 + 0.7*k), 0, TAU); c.stroke(); }
  else if (style === 'hearts') { const s2 = r*(0.5 + 0.9*k); c.fillStyle = idx % 2 ? '#FF4F8B' : col; c.beginPath(); c.moveTo(x, y + s2*0.8); c.bezierCurveTo(x - s2*1.4, y - s2*0.1, x - s2*0.7, y - s2*1.1, x, y - s2*0.4); c.bezierCurveTo(x + s2*0.7, y - s2*1.1, x + s2*1.4, y - s2*0.1, x, y + s2*0.8); c.fill(); }
  else if (style === 'confetti') { c.fillStyle = 'hsl(' + ((idx*67) % 360) + ',90%,62%)'; c.save(); c.translate(x + Math.sin(idx*3.1)*r, y + Math.cos(idx*2.3)*r); c.rotate(idx + t*4); c.fillRect(-r*0.5, -r*0.25, r, r*0.5); c.restore(); }
  else if (style === 'notes') { c.fillStyle = col; c.strokeStyle = col; const s2 = r*(0.4 + 0.6*k); c.beginPath(); c.ellipse(x, y, s2, s2*0.75, -0.4, 0, TAU); c.fill(); c.lineWidth = s2*0.3; c.beginPath(); c.moveTo(x + s2*0.85, y); c.lineTo(x + s2*0.85, y - s2*2.6); c.lineTo(x + s2*1.8, y - s2*2); c.stroke(); }
  else if (style === 'bolt') { c.strokeStyle = idx % 2 ? '#FFE34A' : '#ffffff'; c.lineWidth = r*0.25; c.beginPath(); c.moveTo(x - r, y - r); c.lineTo(x + r*0.2, y - r*0.1); c.lineTo(x - r*0.2, y + r*0.1); c.lineTo(x + r, y + r); c.stroke(); }
  else if (style === 'money') { c.save(); c.translate(x, y); c.rotate(idx*0.7 + t*2); c.fillStyle = '#2FBF5A'; c.fillRect(-r*0.9, -r*0.5, r*1.8, r); c.fillStyle = '#B8F5C8'; c.beginPath(); c.arc(0, 0, r*0.28, 0, TAU); c.fill(); c.restore(); }
  else if (style === 'bossfire') { c.fillStyle = k > 0.6 ? '#FF2244' : k > 0.3 ? '#8A0A1E' : '#1A0208'; c.beginPath(); c.arc(x, y, r*(0.6 + 1.2*k)*(0.8 + 0.4*Math.sin(t*25 + idx)), 0, TAU); c.fill(); if (idx % 3 === 0) { c.fillStyle = '#FFB23E'; c.fillRect(x + Math.sin(idx)*r, y + Math.cos(idx)*r, r*0.3, r*0.3); } }
  else if (!trailDot6(c, style, col, x, y, r, k, idx, t) && !trailDot4(c, style, col, x, y, r, k, idx, t) && !trailDot2(c, style, col, x, y, r, k, idx, t)) { c.fillStyle = col; c.beginPath(); c.arc(x, y, r*(0.35 + 0.6*k), 0, TAU); c.fill(); }
}

