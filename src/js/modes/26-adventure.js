// ---------- adventure (singleplayer campaign) ----------
// Worlds of 10 stages. Lives carry over between matches; every third stage is a checkpoint that refills them.
// Between stages you pick a card that lasts for the run. Stars: 1 clear, 2 flawless, 3 a stage-specific goal.
const ADV_EVENT_END = Date.UTC(2026, 10, 16, 23, 0); // Pumpkin Night ends 16 Nov 2026
const ADV_LIVES = 5, ADV_MAX_LIVES = 9;
const CHAR = {
  lu:      { n: 'Lighthouse Lu', lk: { c: '#FFE34A', h: 'cap', f: 'eyes', s: 'solid' } },
  riptide: { n: 'Captain Riptide', lk: { c: '#4FFFC4', h: 'pirate', f: 'eyepatch', s: 'neonwave' } },
  mittens: { n: 'Mittens', lk: { c: '#F3F0FF', h: 'beanie', f: 'sleepy', s: 'solid' } },
  sleet:   { n: 'Sleet', lk: { c: '#F3F0FF', h: 'beanie', f: 'frozen', s: 'icecrystal' } },
  hail:    { n: 'Hail', lk: { c: '#7FD8FF', h: 'icecrown', f: 'frozen', s: 'icecrystal' } },
  echo:    { n: 'Echo', lk: { c: '#B57CFF', h: 'none', f: 'voideyes', s: 'solid' } },
  emperor: { n: 'The Hollow Emperor', lk: { c: '#9B4DFF', h: 'emperor', f: 'voideyes', s: 'rift' } },
  betty:   { n: 'Bat Betty', lk: { c: '#B57CFF', h: 'bat', f: 'hearts', s: 'solid' } },
  hitter:  { n: 'The Headless Hitter', lk: { c: '#FF7518', h: 'none', f: 'none', s: 'pumpkin' } },
  pking:   { n: 'The Pumpkin King', lk: { c: '#FF7518', h: 'pumpkin', f: 'skeleton', s: 'pumpkin' } }
};
const WORLDS = [
  { id: 'harbor', n: 'Neon Harbor', no: 'World 1', col: '#3EE6FF', col2: '#FF4F8B', scene: 'harborbg',
    ars: ['classic', 'retro'], muts: ['wind', 'storm', 'giant'], sk: [0.7, 0.95], rally: [350, 850], bossAr: 'classic', bossMut: null,
    foes: ['Dockhand Dex', 'Neon Nell', 'Barnacle Bo', 'Gull', 'Tidal Tess', 'Rusty'], champ: 'First Mate Marlo',
    look: { cs: ['#3EE6FF', '#4FFFC4', '#7FD8FF', '#FF4F8B', '#4A7BFF'], hs: ['cap', 'shark', 'duck', 'viking', 'propeller'], fs: ['eyes', 'angry', 'shades', 'mustache'], ss: ['solid', 'wood', 'zebra'] },
    boss: [{ n: 'Captain Riptide', c: '#4FFFC4', h: 'pirate', f: 'eyepatch', t: 'waves', s: 'neonwave', atk: ['wall', 'laser', 'multi'], rate: 1.05, spd: 1.0, err: 1.18, hpAbs: 30, cards: ['wide'] }],
    minions: [], bossFast: 150,
    rw: { '3-1': [['t', 'waves']], '5-3': [['f', 'eyepatch']], '7-2': [['k', 'neonwave']], '10-1': [['h', 'pirate'], ['pt', 'harborhero']], '10-2': [['pb', 'harbor']], '10-3': [['v', 'tide']], s20: [['pg', 'harborbg']], s30: [['pe', 'anchor']] },
    story: {
      intro: [['', 'For a thousand years the Grand Rally never stopped. Every hit kept the lights of the Paddleverse burning.'],
              ['', 'Then the Hollow Emperor tore open the Rift and stole the echo of the ball. The rally fell silent, and three worlds went dark.'],
              ['lu', 'Finally, a challenger! Captain Riptide grabbed the harbor light and her crew guards the docks.'],
              ['lu', 'Beat the crew and she will have to face you herself.'],
              ['me', 'Point me to the docks.']],
      pre: [['riptide', 'Yarr! Ye knocked out me whole crew? Then I\'ll sink ye myself!'],
            ['me', 'Let\'s see if your aim is as good as your accent.']],
      post: [['riptide', 'Blast it... the tide turns. Take the harbor light, it\'s yours.'],
             ['riptide', 'But watch out for Frostpeak. The Snow Twins froze the second light solid.'],
             ['me', 'Then I\'ll bring a warm paddle.']]
    } },
  { id: 'frost', n: 'Frostpeak', no: 'World 2', col: '#9FF3FF', col2: '#F3F0FF', scene: 'frostbg', unlock: 'harbor',
    ars: ['ice'], muts: ['wind', 'giant', 'tiny'], sk: [0.85, 1.1], rally: [600, 1150], bossAr: 'ice', bossMut: null,
    foes: ['Yeti Jr.', 'Icicle Ida', 'Sledge', 'Flurry', 'Snowball', 'Avalanche Al'], champ: 'Glacier Greta',
    look: { cs: ['#F3F0FF', '#7FD8FF', '#C9D6F2', '#3EE6FF', '#4A7BFF'], hs: ['bunny', 'viking', 'astro', 'cat', 'beanie'], fs: ['eyes', 'sleepy', 'angry', 'frozen'], ss: ['solid', 'zebra', 'galaxy'] },
    boss: [{ n: 'Sleet', c: '#F3F0FF', h: 'beanie', f: 'frozen', t: 'snow', s: 'icecrystal', atk: ['freeze', 'wall'], rate: 1.05, spd: 1.0, err: 1.2, hpAbs: 15, cards: ['wide'] },
           { n: 'Hail', c: '#7FD8FF', h: 'icecrown', f: 'frozen', t: 'snow', s: 'icecrystal', atk: ['freeze', 'shrink', 'multi', 'laser'], rate: 0.95, spd: 1.08, err: 1.12, hpAbs: 20 }],
    minions: [], bossFast: 200,
    rw: { '2-3': [['t', 'snow']], '4-1': [['f', 'frozen']], '6-2': [['h', 'beanie']], '8-3': [['k', 'icecrystal']], '10-1': [['h', 'icecrown'], ['pt', 'frostbreaker']], '10-2': [['pb', 'glacier']], '10-3': [['v', 'snowstorm']], s20: [['pg', 'frostbg']], s30: [['pe', 'snowflake']] },
    story: {
      intro: [['', 'Frostpeak. Where the wind bites and every rally slides.'],
              ['mittens', 'Brrr! A visitor! The Snow Twins froze everyone who lost to them. So... maybe don\'t lose?'],
              ['me', 'No pressure, then.']],
      pre: [['sleet', 'Another statue for our garden, sister?'],
            ['hail', 'If this one lasts long enough to freeze, Sleet.'],
            ['me', 'Two against one? Fine. I\'ll take you both.']],
      post: [['hail', 'Impossible... the ice is cracking!'],
             ['sleet', 'The second light is free. But the Emperor will feel this. He will come for you.'],
             ['me', 'Good. Saves me the trip.']]
    } },
  { id: 'rift', n: 'The Rift', no: 'World 3', col: '#B57CFF', col2: '#FF4F8B', scene: 'riftbg', unlock: 'frost',
    ars: ['hole', 'classic'], muts: ['portal', 'upside', 'invis', 'dark'], sk: [0.95, 1.2], rally: [800, 1400], bossAr: 'hole', bossMut: null,
    foes: ['Static', 'Glitch', 'Null', 'Shade', 'Flicker', 'Hollow'], champ: 'The Void Knight',
    look: { cs: ['#9B4DFF', '#B57CFF', '#FF4F8B', '#4A7BFF', '#F3F0FF'], hs: ['horns', 'halo', 'antenna', 'wizard', 'voidhorns'], fs: ['robot', 'laser', 'angry', 'voideyes'], ss: ['matrix', 'galaxy', 'rift'] },
    boss: [{ n: 'The Hollow Emperor', c: '#9B4DFF', h: 'emperor', f: 'voideyes', t: 'void', s: 'rift', atk: ['ghost', 'laser', 'wall'], rate: 1.05, spd: 1.05, err: 1.25, hpAbs: 16, cards: ['wide', 'shieldgen'] },
           { n: 'The Emperor Unbound', c: '#B57CFF', h: 'voidhorns', f: 'voideyes', t: 'void', s: 'rift', atk: ['ghost', 'mirror', 'laser', 'multi', 'smash', 'shrink'], rate: 1.0, spd: 1.1, err: 1.15, hpAbs: 20 }],
    minions: [{ n: 'Echo', lk: CHAR.echo.lk, lives: 1, sk: 0.8 }, { n: 'Shade', lk: { c: '#4A7BFF', h: 'none', f: 'voideyes', s: 'solid' }, lives: 1, sk: 0.8 }], bossFast: 260,
    rw: { '2-2': [['t', 'void']], '4-3': [['f', 'voideyes']], '6-1': [['k', 'rift']], '8-2': [['h', 'voidhorns']], '10-1': [['h', 'emperor'], ['pt', 'riftwalker']], '10-2': [['pb', 'rift']], '10-3': [['v', 'supernova']], s20: [['pg', 'riftbg']], s30: [['pe', 'eye']] },
    story: {
      intro: [['', 'The Rift. A place where the ball forgets which way is down.'],
              ['echo', '...you... should not... be here...'],
              ['me', 'Says the guy who is basically a whisper. Where\'s your boss?']],
      pre: [['emperor', 'So. The little paddle that relit two worlds.'],
            ['emperor', 'My shadows will hold you while I end this rally forever.'],
            ['me', 'Rallies don\'t end. They just wait for someone like me.']],
      post: [['emperor', 'The silence... breaks...'],
             ['', 'The third light flares. Across the Paddleverse a thousand paddles start to hum again.'],
             ['me', 'Rally on.']]
    } },
  { id: 'pumpkin', n: 'Pumpkin Night', no: 'Event world', col: '#FF7518', col2: '#B57CFF', scene: 'moon', event: true,
    ars: ['classic', 'hole'], muts: ['dark', 'invis', 'lava', 'portal'], sk: [0.9, 1.15], rally: [600, 1200], bossAr: 'classic', bossMut: 'dark',
    foes: ['Ghoul', 'Mummy Max', 'Skelly', 'Witchy Wren', 'Count Clack', 'Boo'], champ: 'The Scarecrow',
    look: { cs: ['#FF7518', '#B57CFF', '#7CFF3A', '#E8E2CC', '#B3001B'], hs: ['witch', 'horns', 'bat', 'wizard', 'candycorn'], fs: ['vampire', 'skeleton', 'stitch', 'ghostface'], ss: ['web', 'bones', 'pumpkin'] },
    boss: [{ n: 'The Headless Hitter', c: '#FF7518', h: 'none', f: 'none', t: 'candy', s: 'pumpkin', atk: ['multi', 'wall', 'ghost'], rate: 1.0, spd: 1.05, err: 1.15, hpAbs: 18, cards: ['wide'] },
           { n: 'The Pumpkin King', c: '#FF7518', h: 'pumpkin', f: 'skeleton', t: 'bats', s: 'pumpkin', atk: ['ghost', 'multi', 'mirror', 'laser', 'freeze'], rate: 0.88, spd: 1.12, err: 1.05, hpAbs: 24 }],
    minions: [{ n: 'Boo', lk: { c: '#E8E2CC', h: 'none', f: 'ghostface', s: 'solid' }, lives: 2, sk: 0.85 }], bossFast: 230,
    rw: { '1-1': [['h', 'witch']], '3-3': [['t', 'bats']], '5-2': [['f', 'skeleton']], '7-1': [['k', 'pumpkin']], '10-1': [['h', 'pumpkin'], ['pt', 'pumpkinslayer']], '10-2': [['pb', 'spooky']], '10-3': [['v', 'ghosts']], s20: [['pg', 'graveyard']], s30: [['pe', 'pumpkin']] },
    story: {
      intro: [['', 'Once a year, when the harvest moon hangs fat and orange, Pumpkin Night begins.'],
              ['betty', 'Trick or treat, paddle pal! The Pumpkin King stole ALL the candy. Win it back... if you dare!'],
              ['me', 'I always dare. Especially for candy.']],
      pre: [['hitter', '...'],
            ['', 'The Headless Hitter cannot talk. It just points its paddle at you. Rude.'],
            ['pking', 'Beat my Hitter and you face ME, little snack!']],
      post: [['pking', 'Nooo! My beautiful candy!'],
             ['betty', 'Happy Pumpkin Night! Come back before the moon sets, there is more loot in the battle pass.'],
             ['me', 'Saving the candy corn for later.']]
    } }
];
// The ten stages of every world. Difficulty climbs with the index; every third stage is a checkpoint.
const STAGE_PLAN = [
  { k: 'duel', bots: 1, bl: 2, s3: 'rally' },
  { k: 'duel', bots: 1, bl: 3, s3: 'hits', v: 22 },
  { k: 'brawl', bots: 2, bl: 2, s3: 'rally', cp: 1 },
  { k: 'surv', bots: 2, bl: 9, t: 40, mut: 0, s3: 'rally' },
  { k: 'elite', bots: 1, bl: 3, mut: 1, hero: 1, s3: 'fast', v: 80 },
  { k: 'brawl', bots: 3, bl: 2, mut: 2, s3: 'smash', v: 1, cp: 1 },
  { k: 'champ', bots: 1, bl: 3, hero: 1, s3: 'rally' },
  { k: 'elite', bots: 2, bl: 3, mut: 3, hero: 1, s3: 'hits', v: 40 },
  { k: 'surv', bots: 3, bl: 9, t: 50, mut: 'multi', s3: 'rally', cp: 1 },
  { k: 'boss', s3: 'fast' }
];
const KIND_TXT = { duel: 'Duel', brawl: 'Brawl', surv: 'Survival', elite: 'Elite', champ: 'Champion', boss: 'Boss' };
function worldById(id) { return WORLDS.find(w => w.id === id) || WORLDS[0]; }
function advStage(W, i) {
  const P = STAGE_PLAN[i], wi = WORLDS.indexOf(W), f = Math.min(1, i/8);
  const skill = W.sk[0] + (W.sk[1] - W.sk[0])*f + (P.k === 'elite' ? 0.05 : P.k === 'champ' ? 0.07 : 0);
  let mut = null;
  if (P.mut === 'multi') mut = 'multi'; else if (typeof P.mut === 'number') mut = W.muts[P.mut % W.muts.length];
  const extra = 0;
  const S = { i, k: P.k, cp: !!P.cp, bots: P.bots || 0, bl: (P.bl || 2) + extra, skill, mut, hero: !!P.hero, surv: P.k === 'surv' ? P.t + (wi >= 2 ? 5 : 0) : 0,
    ar: P.k === 'boss' ? W.bossAr : W.ars[i % W.ars.length], s3: P.s3, v: P.v };
  if (P.s3 === 'rally') S.v = Math.round((W.rally[0] + (W.rally[1] - W.rally[0])*f)/50)*50;
  if (P.k === 'boss') { S.v = W.bossFast; S.mut = W.bossMut; }
  S.foes = Array.from({ length: S.bots }, (_, k) => P.k === 'champ' ? W.champ : (P.k === 'elite' ? 'Elite ' : '') + W.foes[(i*2 + k) % W.foes.length]);
  S.title = P.k === 'boss' ? W.boss.map(b => b.n).join(' & ') : P.k === 'champ' ? W.champ : S.bots === 1 ? 'vs ' + S.foes[0] : (P.k === 'surv' ? 'Hold out vs ' : 'Free-for-all vs ') + S.bots;
  S.desc = P.k === 'surv' ? 'Survive ' + S.surv + ' seconds against ' + S.bots + ' opponents' :
           P.k === 'boss' ? (W.boss.length > 1 ? 'Two-phase boss fight' : 'Boss fight') + (W.minions.length ? ' with ' + W.minions.length + (W.minions.length > 1 ? ' minions' : ' minion') : '') :
           'Beat ' + (S.bots > 1 ? S.bots + ' opponents' : S.foes[0]) + ' (' + S.bl + ' lives' + (S.bots > 1 ? ' each' : '') + ')';
  if (mut) S.desc += ' · ' + MUTATORS[mut][0];
  return S;
}
function starGoals(S) {
  const g3 = S.s3 === 'rally' ? 'Reach ' + fmt(S.v) + ' in one rally' : S.s3 === 'hits' ? 'Hit the ball ' + S.v + ' times' : S.s3 === 'fast' ? 'Win in under ' + fmtTime(S.v).replace(/\.\d$/, '') : 'Score with a supersmash';
  return ['Clear the stage', 'Lose no lives', g3];
}
// ----- saved progress -----
let adv = storeJSON('trepong-adv', {});
if (!adv || typeof adv !== 'object') adv = {};
adv.w = adv.w && typeof adv.w === 'object' ? adv.w : {}; adv.seen = adv.seen || {};
function saveAdv() { store('trepong-adv', JSON.stringify(adv)); }
function freshRun() { return { s: 0, lives: ADV_LIVES, max: ADV_LIVES, cards: [], cp: { s: 0, cards: [], max: ADV_LIVES }, bought: 0, dead: false, pick: null }; }
function advW(id) {
  const w = adv.w[id] || (adv.w[id] = {});
  w.stars = w.stars && typeof w.stars === 'object' ? w.stars : {};
  if (!w.run || typeof w.run !== 'object') w.run = freshRun();
  return w;
}
function worldStars(id) { const st0 = advW(id).stars; let n = 0; for (const k in st0) n += (st0[k] || []).filter(Boolean).length; return n; }
function worldUnlocked(W) { if (W.event && Date.now() > ADV_EVENT_END) return false; return !W.unlock || !!advW(W.unlock).cleared; }
function lifePrice(run) { return 300 + 150*run.bought; }
// ----- rewards -----
const ADV_PROF = {
  pb: [['harbor', 'Harbor', 'e', 'adv:harbor'], ['glacier', 'Glacier', 'l', 'adv:frost'], ['rift', 'Rift', 'l', 'adv:rift', 1], ['spooky', 'Spooky', 'e', 'adv:pumpkin', 1], ['cobweb', 'Cobweb', 'r', 'bp', 1], ['bone', 'Bones', 'u', 'bp']],
  pg: [['harborbg', 'Night harbor', 'r', 'adv:harbor'], ['frostbg', 'Frost peaks', 'e', 'adv:frost', 1], ['riftbg', 'The rift', 'l', 'adv:rift', 1], ['graveyard', 'Graveyard', 'e', 'adv:pumpkin', 1], ['moon', 'Harvest moon', 'l', 'bp', 1], ['haunted', 'Haunted manor', 'r', 'bp']],
  pt: [['harborhero', 'Harbor Hero', 'r', 'adv:harbor'], ['frostbreaker', 'Frostbreaker', 'e', 'adv:frost'], ['riftwalker', 'Riftwalker', 'l', 'adv:rift'], ['pumpkinslayer', 'Pumpkin Slayer', 'e', 'adv:pumpkin'],
       ['trickster', 'Trick or Treater', 'u', 'bp'], ['hauntedt', 'The Haunted', 'r', 'bp'], ['season1', 'Season 1 Legend', 'l', 'bp']],
  pe: [['anchor', 'Anchor', 'r', 'adv:harbor'], ['snowflake', 'Snowflake', 'r', 'adv:frost'], ['eye', 'Mystic eye', 'e', 'adv:rift'], ['pumpkin', 'Pumpkin', 'r', 'adv:pumpkin'], ['bat', 'Bat', 'u', 'bp'], ['ghost', 'Ghost', 'r', 'bp']]
};
for (const k in ADV_PROF) PROF[k].push(...ADV_PROF[k]);
function rewardKey(r) { return r[0] + ':' + r[1]; }
function hasReward(r) { return r[0] === 'coins' || r[0] === 'chest' ? false : ownsAny(r[0], r[1]); }
function rewardName(r) {
  if (r[0] === 'coins') return r[1] + ' coins';
  if (r[0] === 'chest') return CHESTS[r[1]].n;
  return itemLabel(r[0], r[1]);
}
function grantReward(r, quiet) {
  if (r[0] === 'coins') { addCoins(r[1]); return r[1] + ' coins'; }
  if (r[0] === 'chest') {
    if (r[1] === 'wood') { freeChests++; saveFree(); return 'Wooden chest (open it in Chests)'; }
    chestInv[r[1]] = (chestInv[r[1]] || 0) + 1; saveInv();
    return CHESTS[r[1]].n + ' (open it in Chests)';
  }
  owned.add(rewardKey(r)); saveWallet();
  return rewardName(r);
}
const EXCL_SRC = {};
for (const W of WORLDS) for (const key in W.rw) for (const r of W.rw[key]) {
  const where = key.startsWith('s') ? W.n + ': collect ' + key.slice(1) + ' stars' : W.n + ': stage ' + key.split('-')[0] + ', star ' + key.split('-')[1];
  EXCL_SRC[rewardKey(r)] = where;
}
function exclusiveText(kind, id) {
  if (LEVEL_SRC[kind + ':' + id] < 0) { const p = -LEVEL_SRC[kind + ':' + id]; return { short: 'Prestige ' + ROMAN[p], long: 'Prestige reward: reach Prestige ' + ROMAN[p] + ' (' + PRESTIGE_NAMES[p] + ').' }; }
  if (LEVEL_SRC[kind + ':' + id]) return { short: 'Level ' + LEVEL_SRC[kind + ':' + id], long: 'Level road reward: reach level ' + LEVEL_SRC[kind + ':' + id] + '.' };
  if (SECRETS[kind + ':' + id]) return { short: 'Secret', long: 'A secret item. Hint: "' + SECRETS[kind + ':' + id] + '"' };
  if (RAID_SRC[kind + ':' + id]) return { short: 'Raid', long: 'Raid loot from ' + RAID_SRC[kind + ':' + id] + '. Check the drop chances in Raids.' };
  const src = EXCL_SRC[kind + ':' + id];
  if (src) return { short: 'Adventure', long: 'Adventure reward. ' + src + '.' };
  if (BP_SRC[kind + ':' + id]) return { short: 'Pass', long: 'Battle pass reward (tier ' + BP_SRC[kind + ':' + id] + ').' };
  return { short: 'Tower ' + exclusiveFloor(kind, id), long: 'Exclusive. Clear floor ' + exclusiveFloor(kind, id) + ' in the Champion Tower.' };
}
// ----- battle pass -----
const BP = { id: 's1', n: 'Season 1: Pumpkin Night', end: ADV_EVENT_END, premium: 3000, matchCap: 500000, xpPts: 1000 };
// The pass is a grind: tiers are checkpoints of TOTAL rally points (everything your team scores, summed over the season).
// One match counts at most BP.matchCap, so a single lucky rally can't skip half the pass. Tier 30 needs 25 million.
function bpNice(v) { const m = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(v / m) * m; }
const BP_PTS = Array.from({ length: 30 }, (_, i) => bpNice(25e6 * Math.pow((i + 1) / 30, 2.3)));
const BP_TIERS = [ // [free, premium]
  [['coins', 50], ['c', '#FF7518']], [['chest', 'wood'], ['coins', 100]], [['coins', 75], ['h', 'candycorn']], [['pe', 'bat'], ['t', 'candy']], [['chest', 'wood'], ['f', 'stitch']],
  [['coins', 75], ['c', '#7CFF3A']], [['pt', 'trickster'], ['chest', 'gold']], [['coins', 100], ['k', 'web']], [['chest', 'wood'], ['pg', 'haunted']], [['h', 'bat'], ['pb', 'cobweb']],
  [['coins', 100], ['coins', 150]], [['chest', 'wood'], ['f', 'ghostface']], [['coins', 100], ['c', '#B3001B']], [['pe', 'ghost'], ['t', 'souls']], [['chest', 'gold'], ['k', 'bones']],
  [['coins', 125], ['coins', 200]], [['chest', 'wood'], ['pb', 'bone']], [['coins', 125], ['chest', 'gold']], [['c', '#E8E2CC'], ['pt', 'hauntedt']], [['chest', 'gold'], ['pg', 'moon']],
  [['coins', 150], ['coins', 200]], [['chest', 'wood'], ['v', 'batswarm']], [['coins', 150], ['chest', 'myth']], [['chest', 'wood'], ['coins', 250]], [['chest', 'gold'], ['pt', 'season1']],
  [['coins', 150], ['chest', 'gold']], [['chest', 'wood'], ['coins', 250]], [['coins', 200], ['chest', 'myth']], [['chest', 'gold'], ['coins', 300]], [['coins', 300], ['chest', 'myth']]
];
const BP_SRC = {};
BP_TIERS.forEach((t, i) => t.forEach(r => { if (r[0] !== 'coins' && r[0] !== 'chest') BP_SRC[rewardKey(r)] = i + 1; }));
let bp = storeJSON('trepong-bp', null);
if (!bp || bp.id !== BP.id) bp = { id: BP.id, xp: 0, prem: false, cf: [], cp: [] };
if (typeof bp.pts !== 'number') bp.pts = 0;   // build 16: progress moved from XP to rally points
function saveBp() { store('trepong-bp', JSON.stringify(bp)); syncBpBadge(); }
function bpActive() { return Date.now() < BP.end; }
function bpTier() { let t = 0; while (t < BP_TIERS.length && bp.pts >= BP_PTS[t]) t++; return t; }
function bpTierFrac() { const t = bpTier(); if (t >= BP_TIERS.length) return 1; const a = t ? BP_PTS[t - 1] : 0; return (bp.pts - a) / (BP_PTS[t] - a); }
function bpClaimable() { const t = bpTier(); let n = 0; for (let i = 0; i < t; i++) { if (!bp.cf.includes(i)) n++; if (bp.prem && !bp.cp.includes(i)) n++; } return n; }
function addBpXp(n, why) { addBpPts(n * BP.xpPts); }
function addBpPts(n) {
  if (!bpActive() || !(n > 0)) return;
  const before = bpTier(); bp.pts += Math.round(n); saveBp();
  const after = bpTier();
  if (after > before) setTimeout(() => toast('Battle pass tier ' + after + ' reached! Claim it in the menu.'), 1600);
}
function syncBpBadge() { const b = $('#bpBadge'); if (!b) return; const n = bpClaimable(); b.hidden = !n; b.textContent = n; const bar = $('#bpMini'); if (bar) bar.style.width = Math.round(100*bpTierFrac()) + '%'; const lv = $('#bpLvl'); if (lv) lv.textContent = 'Tier ' + bpTier() + ' / ' + BP_TIERS.length; }
function bpClaim(i, prem) {
  if (i >= bpTier()) return;
  const list = prem ? bp.cp : bp.cf; if (list.includes(i) || (prem && !bp.prem)) return;
  list.push(i); const r = BP_TIERS[i][prem ? 1 : 0];
  const txt = grantReward(r); saveBp(); sfx.coin(); buzz(20); toast('Claimed: ' + txt); renderBp();
}
// ----- run state helpers -----
let advSelW = store('trepong-advw') || 'harbor', advSel = null, advCur = null, advRes = null;
if (!WORLDS.some(w => w.id === advSelW)) advSelW = 'harbor';
function advNextIdx(id) { return advW(id).run.s; }
function openAdv(wid) {
  if (wid) advSelW = wid;
  const W = worldById(advSelW); if (!worldUnlocked(W)) advSelW = 'harbor';
  store('trepong-advw', advSelW);
  mode = 'menu'; st = null; series = null; special = null; resetFx(); mySeat = 0;
  advSel = null; showScreen('adv'); renderAdv();
  if (!adv.seen.prologue) { adv.seen.prologue = 1; saveAdv(); }
}
function advTitle(W, S) { return 'Stage ' + (S.i + 1) + ' · ' + S.title; }
function renderAdv() {
  syncCoinUI(); $('#advCoins').textContent = fmt(coins);
  // world tabs
  const box = $('#advWorlds'); box.textContent = '';
  for (const W of WORLDS) {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'wcard' + (W.event ? ' ev' : '');
    const open = worldUnlocked(W), w = advW(W.id);
    b.style.setProperty('--wc', W.col); b.disabled = !open && !(W.event && Date.now() > ADV_EVENT_END);
    b.setAttribute('aria-pressed', String(W.id === advSelW));
    const cv = document.createElement('canvas'); cv.width = 240; cv.height = 120; cv.dataset.scene = W.scene;
    const t = document.createElement('span'); t.className = 'wno'; t.textContent = W.event ? (Date.now() > ADV_EVENT_END ? 'Event ended' : 'Event · ' + daysLeft(ADV_EVENT_END)) : W.no;
    const n = document.createElement('b'); n.textContent = W.n;
    const s = document.createElement('small'); s.textContent = open ? '★ ' + worldStars(W.id) + ' / 30' + (w.cleared ? ' · cleared' : '') : '🔒 Clear ' + worldById(W.unlock).n;
    b.append(cv, t, n, s);
    b.addEventListener('click', () => { if (!worldUnlocked(W)) return; advSelW = W.id; advSel = null; store('trepong-advw', W.id); renderAdv(); });
    box.append(b);
  }
  drawWorldCards(true);
  const W = worldById(advSelW), w = advW(W.id), run = w.run;
  $('#advTitle').textContent = W.n; $('#advTitle').style.color = W.col;
  $('#advEyebrow').textContent = W.no + (W.event ? ' · ends in ' + daysLeft(ADV_EVENT_END) : '');
  const next = run.s, sel = advSel == null ? next : advSel;
  const S = advStage(W, Math.min(9, sel));
  // run bar
  const hearts = $('#advHearts'); hearts.textContent = '';
  for (let k = 0; k < Math.max(run.max, run.lives); k++) { const i = document.createElement('i'); i.className = k < run.lives ? 'on' : ''; hearts.append(i); }
  $('#advLivesTxt').textContent = run.lives + ' / ' + run.max + ' lives';
  const pills = $('#advCards'); pills.textContent = '';
  if (!run.cards.length) { const e = document.createElement('span'); e.className = 'empty'; e.textContent = 'No run cards yet. Win stages to pick cards.'; pills.append(e); }
  for (const id of run.cards) { const p = document.createElement('span'); p.className = 'pill ' + CARDS[id].r; p.textContent = CARDS[id].n; p.title = CARDS[id].d; pills.append(p); }
  const price = lifePrice(run);
  $('#btnBuyLife').innerHTML = ''; $('#btnBuyLife').append('Buy a life ', Object.assign(document.createElement('span'), { className: 'coin', textContent: fmt(price) }));
  $('#btnBuyLife').disabled = coins < price || run.lives >= ADV_MAX_LIVES || run.dead;
  // pending pick / dead state
  const pk = $('#advPick'), dead = $('#advDead');
  pk.hidden = !run.pick; dead.hidden = !run.dead;
  $('.selbox').hidden = !!run.pick || run.dead;
  if (run.pick) { renderAdvPick(W, run); setTimeout(() => pk.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60); }
  if (run.dead) { $('#btnAdvRevive').textContent = 'Revive with 1 life (' + fmt(price) + ' coins)'; $('#btnAdvRevive').disabled = coins < price; $('#btnAdvCp').textContent = 'Restart from stage ' + (run.cp.s + 1); }
  // main button
  const go = $('#btnAdvGo');
  go.hidden = !!run.pick || run.dead;
  const replay = sel < next || (w.cleared && sel !== next);
  go.textContent = replay ? 'Replay stage ' + (sel + 1) + ' for stars' : (S.k === 'boss' ? 'Fight the boss' : 'Play stage ' + (sel + 1));
  go.style.background = go.style.borderColor = W.col;
  $('#advSelTxt').textContent = advTitle(W, S); $('#advSelDesc').textContent = S.desc + (replay ? ' · Replays use 3 fresh lives and no cards.' : '');
  const goals = starGoals(S), got = w.stars[sel + 1] || [];
  const gl = $('#advGoals'); gl.textContent = '';
  goals.forEach((g, k) => {
    const li = document.createElement('li'); li.className = got[k] ? 'got' : '';
    const rw = W.rw[(sel + 1) + '-' + (k + 1)];
    li.append(Object.assign(document.createElement('span'), { className: 'st', textContent: got[k] ? '★' : '☆' }), Object.assign(document.createElement('span'), { textContent: g }));
    if (rw) li.append(Object.assign(document.createElement('em'), { textContent: '🎁 ' + rw.map(rewardName).join(' + ') }));
    gl.append(li);
  });
  // path
  const path = $('#advPath'); path.textContent = '';
  for (let i = 0; i < 10; i++) {
    const Si = advStage(W, i), gi = w.stars[i + 1] || [];
    const row = document.createElement('button'); row.type = 'button';
    const done = i < next || (w.cleared && !!gi[0]);
    row.className = 'node ' + Si.k + (i === next && !w.cleared ? ' next' : '') + (done ? ' done' : '') + (i > next && !w.cleared ? ' locked' : '') + (i === sel ? ' sel' : '');
    const num = document.createElement('span'); num.className = 'nn'; num.textContent = i + 1;
    const mid = document.createElement('span'); mid.className = 'nm';
    mid.append(Object.assign(document.createElement('b'), { textContent: Si.title }), Object.assign(document.createElement('small'), { textContent: KIND_TXT[Si.k] + (Si.mut ? ' · ' + MUTATORS[Si.mut][0] : '') + (Object.keys(W.rw).some(k => k.startsWith((i + 1) + '-')) ? ' · 🎁' : '') }));
    const stars = document.createElement('span'); stars.className = 'ns'; [0, 1, 2].forEach(k => stars.append(Object.assign(document.createElement('i'), { className: gi[k] ? 'on' : '', textContent: '★' })));
    row.append(num, mid, stars);
    row.disabled = i > next && !w.cleared;
    row.addEventListener('click', () => { advSel = i === next && !w.cleared ? null : i; renderAdv(); });
    path.append(row);
    if (Si.cp) { const cp = document.createElement('div'); cp.className = 'cpline'; cp.textContent = '⛳ Checkpoint: lives refill to max and progress is saved'; path.append(cp); }
  }
  const s20 = W.rw.s20, s30 = W.rw.s30, n = worldStars(W.id);
  $('#advStarRw').textContent = '★ ' + n + ' / 30 · 20★: ' + rewardName(s20[0]) + (n >= 20 ? ' ✓' : '') + ' · 30★: ' + rewardName(s30[0]) + (n >= 30 ? ' ✓' : '');
}
function daysLeft(t) { const d = Math.ceil((t - Date.now()) / 86400000); return d <= 1 ? 'less than a day' : d + ' days'; }
function drawWorldCards(force) {
  $('#advWorlds').querySelectorAll('canvas').forEach(cv => {
    const c = cv.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0);
    drawScene(c, cv.dataset.scene, clock, cv.width, cv.height);
  });
  const bc = $('#advBanner'); if (bc) { const c = bc.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); drawScene(c, worldById(advSelW).scene, clock, bc.width, bc.height); drawBannerChars(c, bc.width, bc.height); }
}
function drawScene(c, scene, t, w, h) {
  c.save(); c.clearRect(0, 0, w, h);
  if (!drawCardBg2(c, scene, t, w, h)) { c.fillStyle = '#16112E'; c.fillRect(0, 0, w, h); }
  c.restore();
}
function drawBannerChars(c, w, h) {
  const W = worldById(advSelW), run = advW(W.id).run, S = advStage(W, Math.min(9, advSel == null ? run.s : advSel));
  const foeLook = S.k === 'boss' ? { c: W.boss[0].c, h: W.boss[0].h, f: W.boss[0].f, s: W.boss[0].s, t: 'std' } : advFoeLook(W, S, 0);
  const g = c.createLinearGradient(0, h*0.55, 0, h); g.addColorStop(0, 'rgba(12,10,28,0)'); g.addColorStop(1, 'rgba(12,10,28,0.85)'); c.fillStyle = g; c.fillRect(0, h*0.5, w, h*0.5);
  const sc = h/80;
  c.save(); c.setTransform(sc, 0, 0, sc, w*0.27, h*0.78 + Math.sin(clock*2)*sc); drawPaddleLocal(c, validLook(myLook), 15, clock, [1, -0.3], {}, 8); c.restore();
  c.save(); c.setTransform(sc*(S.k === 'boss' ? 1.25 : 1), 0, 0, sc*(S.k === 'boss' ? 1.25 : 1), w*0.73, h*0.78 + Math.cos(clock*2)*sc); drawPaddleLocal(c, validLook(foeLook), 15, clock, [-1, -0.3], {}, 8); c.restore();
  c.font = '700 ' + Math.round(h*0.09) + 'px "Rubik Mono One", monospace'; c.textAlign = 'center'; c.textBaseline = 'middle';
  c.fillStyle = '#F0ECFF'; c.globalAlpha = 0.9; c.fillText('VS', w/2, h*0.72); c.globalAlpha = 1;
}
function advFoeLook(W, S, k) {
  const L = W.look, j = S.i*3 + k*5;
  return { c: L.cs[j % L.cs.length], h: L.hs[(j + 1) % L.hs.length], f: L.fs[(j + 2) % L.fs.length], s: S.k === 'elite' || S.k === 'champ' ? L.ss[(j + 1) % L.ss.length] : 'solid', t: 'std', v: 'confetti' };
}
function renderAdvPick(W, run) {
  const box = $('#advPickCards'); box.textContent = '';
  for (const id of run.pick) {
    const c = CARDS[id];
    const b = document.createElement('button'); b.type = 'button'; b.className = 'card ' + c.r;
    const cv = document.createElement('canvas'); cv.width = 200; cv.height = 200; drawCardArt(cv, id);
    const cb = document.createElement('div'); cb.className = 'cb';
    cb.append(Object.assign(document.createElement('span'), { className: 'cr', textContent: RARITY[c.r] }), Object.assign(document.createElement('span'), { className: 'cn', textContent: c.n }), Object.assign(document.createElement('span'), { className: 'cd', textContent: advCardText(id) }));
    b.append(cv, cb);
    b.addEventListener('click', () => advPickCard(W.id, id));
    box.append(b);
  }
}
function advCardText(id) { return id === 'life' ? '+1 max life for this run (and +1 life now).' : id === 'glass' ? 'Your hits are 35% faster. But -1 max life for this run.' : CARDS[id].d; }
function advPickCard(wid, id) {
  const w = advW(wid), run = w.run; if (!run.pick || !run.pick.includes(id)) return;
  run.cards.push(id); run.pick = null;
  if (id === 'life') { run.max = Math.min(ADV_MAX_LIVES, run.max + 1); run.lives = Math.min(ADV_MAX_LIVES, run.lives + 1); }
  if (id === 'glass') { run.max = Math.max(1, run.max - 1); run.lives = Math.min(run.lives, run.max); }
  track('cardsPicked'); if (CARDS[id].r === 'e') track('epicPicks'); if (CARDS[id].r === 'x') track('cursedPicks');
  audioOn(); tone(523, 0.12, 'triangle', 0.06); tone(784, 0.2, 'triangle', 0.06, 1, 0.08);
  saveAdv(); renderAdv();
}
// ----- starting a stage -----
function advPlay() {
  const W = worldById(advSelW), w = advW(W.id), run = w.run;
  if (run.pick || run.dead) return;
  const sel = advSel == null ? run.s : advSel;
  const replay = sel < run.s || (w.cleared && advSel != null && sel !== run.s);
  const go = () => startAdvMatch(W.id, sel, replay);
  if (!replay && sel === 0 && !adv.seen['i_' + W.id]) { adv.seen['i_' + W.id] = 1; saveAdv(); playStory(W, 'intro', go); return; }
  if (sel === 9 && !adv.seen['p_' + W.id]) { adv.seen['p_' + W.id] = 1; saveAdv(); playStory(W, 'pre', go); return; }
  go();
}
function startAdvMatch(wid, idx, replay) {
  const W = worldById(wid), S = advStage(W, idx), run = advW(wid).run, boss = S.k === 'boss';
  audioOn(); mode = 'practice'; mySeat = 0; special = 'adv'; series = null; resetFx();
  bots = [false]; names = [myName()]; looks = [myLook]; botSkill = [1];
  const livesArr = [replay ? 3 : Math.max(1, run.lives)], heroes = [myHero], foes = [];
  if (boss) W.minions.forEach((m, k) => { bots.push(true); names.push(m.n); looks.push(validLook(m.lk)); botSkill.push(m.sk); livesArr.push(m.lives); heroes.push('none'); foes.push(k + 1); });
  else for (let k = 0; k < S.bots; k++) {
    bots.push(true); names.push(S.foes[k]); looks.push(validLook(advFoeLook(W, S, k))); botSkill.push(S.skill + k*0.03); livesArr.push(S.bl);
    heroes.push(S.hero ? pick(Object.keys(HEROES).slice(1)) : 'none');
  }
  const np = bots.length;
  const heroLv = heroes.map((h, i) => i === 0 ? heroLevel(h) : 1 + Math.min(9, Math.floor(S.skill*4)));
  const heroVar = heroes.map((h, i) => i === 0 ? heroVariant(h) : 'std');
  const b0 = W.boss[0];
  st = newGame(np + (boss ? 1 : 0), 3, [replay ? [] : run.cards.slice()], {
    boss, bcfg: boss ? { ...b0, ar: S.ar, hp: 1 } : null, bossHp: boss ? b0.hpAbs : 0, bossQ: boss ? W.boss.slice(1) : null, foes: boss ? foes : null,
    ar: S.ar, mut: S.mut, heroes: boss ? heroes.concat(['none']) : heroes, heroLv, heroVar, livesArr, surv: S.surv, solo: true
  });
  if (boss && S.mut) { st.mut = S.mut; }
  advCur = { wid, idx, replay, mid: st.mid, lives0: livesArr[0], done: false };
  advRes = null;
  botCache = []; lastSmashN = []; lastHeroN = [];
  addBossSeat();
  $('#hudCode').hidden = true;
  showScreen(null); requestWake();
  banner = { text: (boss ? S.title : 'STAGE ' + (idx + 1)).toUpperCase(), sub: boss ? W.n : S.title + (S.surv ? ' · survive ' + S.surv + 's' : ''), col: W.col, t: 0 };
}
// Called from hostTick when a boss swaps to its next phase.
function advBossPhase() {
  addBossSeat();
  banner = { text: (st.boss.cn || 'THE BOSS').toUpperCase() + '!', sub: 'Phase ' + (st.boss.phase + 1) + ' of ' + st.boss.nph, col: '#FF4F8B', t: 0 };
  shake = 1; tone(110, 0.8, 'sawtooth', 0.07, 0.5); tone(82, 1, 'square', 0.04, 0.6, 0.2); buzz([40, 30, 80]);
}
// ----- end of a stage -----
function advResolve() {
  if (!advCur || advCur.done || !st || st.mid !== advCur.mid) return advRes;
  advCur.done = true;
  const W = worldById(advCur.wid), S = advStage(W, advCur.idx), w = advW(W.id), run = w.run, boss = S.k === 'boss';
  const won = boss ? st.winner === -2 : st.winner === 0;
  const livesLeft = st.lives[0], lost = advCur.lives0 - livesLeft;
  const res = { won, W, S, boss, replay: advCur.replay, stars: [false, false, false], newStars: [false, false, false], rewards: [], parts: [], cleared: false, cp: false };
  if (won) {
    const g3 = S.s3 === 'rally' ? st.best >= S.v : S.s3 === 'hits' ? (st.sh[0] || 0) >= S.v : S.s3 === 'fast' ? st.mt <= S.v : S.s3 === 'smash' ? (advCur.smashes || 0) >= (S.v || 1) : false;
    res.stars = [true, lost <= 0, g3];
    const key = S.i + 1, old = w.stars[key] || [false, false, false];
    const starsBefore = worldStars(W.id);
    res.newStars = res.stars.map((s, k) => s && !old[k]);
    w.stars[key] = old.map((o, k) => !!(o || res.stars[k]));
    res.newStars.forEach((n, k) => { if (n) { const rw = W.rw[key + '-' + (k + 1)]; if (rw) for (const r of rw) if (!hasReward(r)) res.rewards.push(grantReward(r)); } });
    const starsAfter = worldStars(W.id);
    for (const [need, k] of [[20, 's20'], [30, 's30']]) if (starsBefore < need && starsAfter >= need) for (const r of W.rw[k]) if (!hasReward(r)) res.rewards.push(grantReward(r));
    const wi = WORLDS.indexOf(W), wm = [1, 1.3, 1.6, 1.4][wi] || 1;
    let clear = Math.round((boss ? [150, 220, 300, 250][wi] : 20 + 4*S.i + (S.k === 'elite' || S.k === 'champ' ? 15 : 0)) * (boss ? 1 : wm));
    if (res.replay) clear = Math.round(clear/2);
    res.parts.push([boss ? 'Boss defeated' : 'Stage clear', clear]);
    const ns = res.newStars.filter(Boolean).length;
    if (ns) res.parts.push(['New stars', 15*ns]);
    res.parts.push(['Hits', Math.min(20, (st.sh[0] || 0))]);
    track('advClears'); if (boss) track('advBosses');
    addBpXp((25 + 10*ns) * (W.event ? 1.5 : 1));
    if (!res.replay) {
      run.lives = livesLeft;
      if (boss) {
        res.cleared = true; const first = !w.cleared; w.cleared = true; res.firstClear = first;
        w.run = freshRun(); track('worldsCleared');
      } else {
        run.s = S.i + 1;
        if (S.cp) { run.lives = run.max; run.cp = { s: run.s, cards: run.cards.slice(), max: run.max }; res.cp = true; }
        run.pick = makeOffer(run.cards, S.k === 'elite' || S.k === 'champ');
      }
    }
  } else {
    res.parts.push(['Participation', 8]);
    if (!res.replay) { run.lives = 0; run.dead = true; }
  }
  saveAdv();
  advRes = res;
  return res;
}
function advOverUI() {
  const r = advRes; if (!r) return;
  const el = $('#overWho');
  el.textContent = r.won ? (r.boss ? (r.W.boss[r.W.boss.length - 1].n + ' defeated!') : 'Stage ' + (r.S.i + 1) + ' cleared!') : (r.replay ? 'Not this time' : 'Out of lives!');
  el.style.color = r.won ? r.W.col : '#FF5A4A';
  $('#overEyebrow').textContent = r.W.n + ' · Stage ' + (r.S.i + 1) + (r.replay ? ' (replay)' : '');
  const sb = $('#overStars'); sb.hidden = !r.won; sb.textContent = '';
  if (r.won) starGoals(r.S).forEach((g, k) => {
    const d = document.createElement('div'); d.className = 'ostar' + (r.stars[k] ? ' got' : '') + (r.newStars[k] ? ' new' : '');
    d.append(Object.assign(document.createElement('b'), { textContent: r.stars[k] ? '★' : '☆' }), Object.assign(document.createElement('span'), { textContent: g + (r.newStars[k] ? ' · NEW' : '') }));
    sb.append(d);
  });
  const rw = $('#overRewards'); rw.hidden = !r.rewards.length && !r.cp; rw.textContent = '';
  for (const t of r.rewards) rw.append(Object.assign(document.createElement('div'), { className: 'orw', textContent: '🎁 Unlocked: ' + t }));
  if (r.cp) rw.append(Object.assign(document.createElement('div'), { className: 'orw cp', textContent: '⛳ Checkpoint! Lives refilled to ' + advW(r.W.id).run.max + '.' }));
  const run = advW(r.W.id).run, price = lifePrice(run);
  $('#btnNext').hidden = true; $('#btnToLobby').hidden = true; $('#overWait').hidden = true; $('#overBoard').hidden = true;
  $('#btnAgain').hidden = false;
  $('#btnAgain').textContent = r.won ? (r.cleared ? 'Continue' : r.replay ? 'Back to the map' : 'Pick your reward') : (r.replay ? 'Try again' : 'Restart from stage ' + (run.cp.s + 1));
  $('#btnRevive').hidden = r.won || r.replay;
  $('#btnRevive').textContent = 'Revive with 1 life (' + fmt(price) + ' coins)'; $('#btnRevive').disabled = coins < price;
  $('#btnOverMenu').textContent = 'Adventure map';
}
function advContinue() {
  const r = advRes; st = null; resetFx(); mode = 'menu'; special = null;
  if (r && r.won && r.cleared && (r.firstClear || !adv.seen['o_' + r.W.id])) { adv.seen['o_' + r.W.id] = 1; saveAdv(); playStory(r.W, 'post', () => { openAdv(r.W.id); if (r.firstClear) { const nx = WORLDS.find(x => x.unlock === r.W.id); if (nx) setTimeout(() => toast(nx.n + ' is now unlocked!'), 600); } }); return; }
  if (r && !r.won && r.replay) { startAdvMatch(r.W.id, r.S.i, true); return; }
  if (r && !r.won && !r.replay) { advCheckpoint(r.W.id); return; }
  openAdv(r ? r.W.id : null);
}
function advCheckpoint(wid) {
  const run = advW(wid).run;
  run.s = run.cp.s; run.cards = run.cp.cards.slice(); run.max = run.cp.max; run.lives = run.max; run.dead = false; run.pick = null;
  saveAdv(); openAdv(wid);
}
function advRevive(wid, restart) {
  const run = advW(wid).run, price = lifePrice(run);
  if (coins < price) return;
  addCoins(-price); run.bought++; run.lives = 1; run.dead = false; saveAdv(); sfx.coin();
  if (restart) startAdvMatch(wid, run.s, false); else renderAdv();
}
function advBuyLife() {
  const W = worldById(advSelW), run = advW(W.id).run, price = lifePrice(run);
  if (coins < price || run.lives >= ADV_MAX_LIVES || run.dead) return;
  addCoins(-price); run.bought++; run.lives++; run.max = Math.max(run.max, run.lives); saveAdv(); sfx.coin(); buzz(20); renderAdv();
}
// Leaving mid-stage keeps the lives already lost, so quitting never dodges a defeat.
function advLeave() {
  if (advCur && !advCur.done && st && st.mid === advCur.mid && !advCur.replay) {
    const run = advW(advCur.wid).run; run.lives = Math.max(0, st.lives[0]);
    if (run.lives <= 0) { run.lives = 0; run.dead = true; }
    saveAdv();
  }
  const wid = advCur ? advCur.wid : advSelW; advCur = null;
  if (wakeLock) { try { wakeLock.release(); } catch (e) {} wakeLock = null; }
  openAdv(wid);
}
// ----- story scenes -----
let story = null; // { W, lines, i, shown, t, done, chars }
function playStory(W, part, done) {
  const lines = (W.story[part] || []).map(l => ({ who: l[0], text: l[1] }));
  if (!lines.length) { done(); return; }
  const ids = [...new Set(lines.map(l => l.who).filter(x => x && x !== 'me'))];
  story = { W, lines, i: 0, shown: 0, t: 0, done, ids, part };
  showScreen('story'); storyText();
}
function storyLine() { return story.lines[story.i]; }
function storyName(who) { return who === 'me' ? myName() : who ? CHAR[who].n : ''; }
function storyText() {
  const L = storyLine(); story.shown = 0; story.lineT = 0;
  $('#storyWho').textContent = storyName(L.who); $('#storyWho').style.color = L.who === 'me' ? myLook.c : L.who ? CHAR[L.who].lk.c : 'var(--mute)';
  $('#storyBox').classList.toggle('narr', !L.who);
  $('#storyTxt').textContent = '';
}
function storyNext() {
  if (!story) return;
  const L = storyLine();
  if (story.shown < L.text.length) { story.shown = L.text.length; $('#storyTxt').textContent = L.text; return; }
  story.i++;
  if (story.i >= story.lines.length) { const d = story.done; story = null; d(); return; }
  storyText(); tone(660, 0.05, 'triangle', 0.03);
}
function drawStory(dt) {
  if (!story) return;
  story.t += dt; story.lineT += dt;
  const L = storyLine();
  const want = Math.min(L.text.length, Math.floor(story.lineT*48));
  if (want > story.shown) { story.shown = want; $('#storyTxt').textContent = L.text.slice(0, want); if (want % 3 === 0 && !muted) tone(L.who === 'me' ? 880 : 520, 0.02, 'square', 0.012); }
  const cv = $('#storyCv'), dpr = Math.min(2, window.devicePixelRatio || 1), w = innerWidth, h = innerHeight;
  if (cv.width !== Math.round(w*dpr) || cv.height !== Math.round(h*dpr)) { cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); }
  const c = cv.getContext('2d'); c.setTransform(dpr, 0, 0, dpr, 0, 0);
  // scene background with a slow ken-burns drift
  c.save(); const z = 1.06 + 0.04*Math.sin(story.t*0.2); c.translate(w/2, h/2); c.scale(z, z); c.translate(-w/2, -h/2);
  drawScene(c, story.W.scene, story.t, w, h); c.restore();
  const vg = c.createLinearGradient(0, h*0.35, 0, h); vg.addColorStop(0, 'rgba(12,10,28,0)'); vg.addColorStop(1, 'rgba(12,10,28,0.92)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
  // characters: you on the left, the other speaker on the right
  const other = L.who && L.who !== 'me' ? L.who : (story.lastOther || story.ids[0]);
  if (L.who && L.who !== 'me') story.lastOther = L.who;
  const sc = Math.min(w*0.36, h*0.3)/30, y0 = h*0.6;
  const ent = Math.min(1, story.t/0.6), e = 1 - Math.pow(1 - ent, 3);
  const drawChar = (look, x, talk, dir, big) => {
    const bob = Math.sin(story.t*2.2 + x)*2*sc + (talk ? Math.abs(Math.sin(story.lineT*14))*1.5*sc*(story.shown < L.text.length ? 1 : 0) : 0);
    const k = (talk ? 1.08 : 0.9) * (big ? 1.1 : 1);
    c.save(); c.globalAlpha = talk ? 1 : L.who ? 0.45 : 0.8;
    c.setTransform(dpr*sc*k, 0, 0, dpr*sc*k, dpr*x, dpr*(y0 - bob));
    drawPaddleLocal(c, validLook(look), 15, story.t, [dir, -0.4], {}, talk ? 14 : 4);
    c.restore();
  };
  drawChar(myLook, -w*0.3*(1 - e) + w*0.26, L.who === 'me', 1, false);
  if (other) drawChar(CHAR[other].lk, w*1.3 - w*0.56*e, L.who === other, -1, ['riptide', 'emperor', 'pking', 'hail', 'sleet', 'hitter'].includes(other));
  // speaking sparkle
  if (L.who) { const sx = L.who === 'me' ? w*0.26 : w*0.74; c.fillStyle = 'rgba(255,255,255,' + (0.5 + 0.5*Math.sin(story.t*8)) + ')'; star4(c, sx + 26*sc, y0 - 34*sc, 3 + 2*Math.sin(story.t*6)); }
  c.setTransform(1, 0, 0, 1, 0, 0);
}

