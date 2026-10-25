#!/usr/bin/env python3
"""Generates the menu illustrations (night forest, nebula, mode cards) as SVG into src/art/.
build.py inlines them where page.html says <!--@ART:name@-->. Run: python tools/gen_art.py"""
import random, math, pathlib
OUT = pathlib.Path(__file__).resolve().parent.parent / 'src' / 'art'
OUT.mkdir(exist_ok=True)
BG = '#171D38'

def stars(rng, n, w, h, y0=0, col='#F4EFE2'):
    out = []
    for _ in range(n):
        x, y = rng.uniform(0, w), rng.uniform(y0, h)
        r = rng.choice([0.5, 0.6, 0.7, 0.8, 1.0, 1.2, 1.4])
        out.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{r}" fill="{col}" fill-opacity="{rng.uniform(.3, 1):.2f}"/>')
    return ''.join(out)

def sparkle(x, y, r, col='#FFF6DC', op=0.9):
    q = r * 0.28
    return f'<path d="M{x} {y-r}L{x+q:.1f} {y-q:.1f}L{x+r} {y}L{x+q:.1f} {y+q:.1f}L{x} {y+r}L{x-q:.1f} {y+q:.1f}L{x-r} {y}L{x-q:.1f} {y-q:.1f}Z" fill="{col}" fill-opacity="{op}"/>'

def pine_d(x, base, h):
    w = h * 0.42; d = ''
    for i in range(4):
        top = base - h + i * h * 0.2
        bot = base - h + (i + 1) * h * 0.2 + h * 0.14
        ww = w * (0.35 + 0.65 * (i + 1) / 4)
        d += f'M{x:.0f} {top:.0f}L{x+ww/2:.0f} {bot:.0f}L{x+ww*.12:.0f} {bot-h*.03:.0f}L{x-ww*.12:.0f} {bot-h*.03:.0f}L{x-ww/2:.0f} {bot:.0f}Z'
    d += f'M{x-w*.05:.0f} {base-h*.12:.0f}h{w*.1:.1f}V{base:.0f}h{-w*.1:.1f}Z'
    return d

def forest(rng, xs, base_fn, hmin, hmax, col):
    return f'<path fill="{col}" d="' + ''.join(pine_d(x, base_fn(x), rng.uniform(hmin, hmax)) for x in xs) + '"/>'

def svg(name, w, h, body, par='xMidYMid slice', cls='art'):
    (OUT / (name + '.svg')).write_text(f'<svg class="{cls}" aria-hidden="true" viewBox="0 0 {w} {h}" preserveAspectRatio="{par}">{body}</svg>', encoding='utf-8')

# ---------- backdrop: night forest (behind every menu) ----------
def scene_forest():
    rng = random.Random(7); W, H = 1200, 900; p = 'sf'
    b = [f'<defs><linearGradient id="{p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#121733"/><stop offset=".22" stop-color="#1C2650"/><stop offset=".36" stop-color="#2F4269"/><stop offset=".42" stop-color="#3A5074"/></linearGradient>',
         f'<radialGradient id="{p}m"><stop offset="0" stop-color="#F5EAC8" stop-opacity=".42"/><stop offset=".45" stop-color="#C9C2D8" stop-opacity=".12"/><stop offset="1" stop-color="#C9C2D8" stop-opacity="0"/></radialGradient>',
         f'<mask id="{p}c"><circle cx="760" cy="150" r="30" fill="#fff"/><circle cx="774" cy="140" r="26" fill="#000"/></mask>',
         f'<filter id="{p}f" x="-20%" y="-300%" width="140%" height="700%"><feGaussianBlur stdDeviation="12"/></filter>',
         f'<linearGradient id="{p}d" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{BG}" stop-opacity="0"/><stop offset="1" stop-color="{BG}"/></linearGradient></defs>',
         f'<rect width="{W}" height="{H}" fill="{BG}"/><rect width="{W}" height="390" fill="url(#{p}s)"/>',
         stars(rng, 260, W, 300)]
    for x, y, r in ((420, 90, 4), (560, 52, 3), (500, 160, 2.6), (880, 230, 3), (700, 60, 2.4), (960, 120, 3.4), (300, 200, 2.6), (1080, 70, 3)):
        b.append(sparkle(x, y, r))
    b.append(f'<circle cx="760" cy="150" r="110" fill="url(#{p}m)"/><circle cx="760" cy="150" r="30" fill="#F3E9CF" mask="url(#{p}c)"/>')
    b.append('<path d="M0 300C150 270 300 284 450 278 600 272 750 256 900 266 1050 276 1120 262 1200 270V420H0Z" fill="#2C3D61" fill-opacity=".85"/>')
    b.append(forest(rng, sorted(rng.uniform(-10, 1210) for _ in range(150)), lambda x: 318 + 8 * math.sin(x / 50), 28, 56, '#24345A'))
    b.append(f'<ellipse cx="600" cy="318" rx="760" ry="18" fill="#9FB4D8" fill-opacity=".14" filter="url(#{p}f)"/>')
    b.append(forest(rng, sorted(rng.uniform(-10, 1210) for _ in range(90)), lambda x: 372, 44, 84, '#1A2646'))
    near = [rng.uniform(-20, 330) for _ in range(14)] + [rng.uniform(870, 1220) for _ in range(14)] + [rng.uniform(330, 870) for _ in range(6)]
    b.append(forest(rng, sorted(near), lambda x: 410, 110, 210, '#131C36'))
    b.append(f'<rect y="290" width="{W}" height="160" fill="url(#{p}d)"/>')
    svg('forest', W, H, ''.join(b), 'xMidYMin slice', 'scene')

# ---------- backdrop: nebula (Collection tab) ----------
def scene_nebula():
    rng = random.Random(21); W, H = 1200, 900; p = 'sn'
    b = [f'<defs><filter id="{p}a" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>',
         f'<filter id="{p}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="12"/></filter></defs>',
         f'<rect width="{W}" height="{H}" fill="#141935"/>',
         f'<g filter="url(#{p}a)">',
         '<ellipse cx="620" cy="220" rx="420" ry="120" fill="#4C3A8E" fill-opacity=".75" transform="rotate(-18 620 220)"/>',
         '<ellipse cx="420" cy="320" rx="300" ry="90" fill="#2C5A98" fill-opacity=".6" transform="rotate(-8 420 320)"/>',
         '<ellipse cx="860" cy="150" rx="260" ry="80" fill="#8A4C9E" fill-opacity=".45" transform="rotate(-24 860 150)"/>',
         '<ellipse cx="700" cy="680" rx="460" ry="110" fill="#3A2F78" fill-opacity=".5" transform="rotate(-12 700 680)"/>',
         '<ellipse cx="260" cy="600" rx="260" ry="80" fill="#284E88" fill-opacity=".42"/></g>',
         f'<g filter="url(#{p}b)" fill="none"><path d="M200 380C380 300 520 320 620 240 720 160 880 130 1060 90" stroke="#9AA8F0" stroke-opacity=".25" stroke-width="26"/>',
         '<path d="M180 760C380 700 560 720 700 660 800 620 920 610 1100 590" stroke="#9A8AE0" stroke-opacity=".2" stroke-width="22"/></g>',
         stars(rng, 420, W, H)]
    for pts in (((360, 120), (410, 80), (460, 104), (446, 156)), ((800, 330), (850, 290), (890, 330)), ((300, 640), (340, 600), (390, 624), (430, 590)), ((860, 720), (910, 708), (940, 744))):
        b.append('<polyline points="' + ' '.join(f'{x},{y}' for x, y in pts) + '" fill="none" stroke="#E9E2D2" stroke-opacity=".3" stroke-width="1"/>')
        b.extend(f'<circle cx="{x}" cy="{y}" r="2.2" fill="#F4EFE2"/>' for x, y in pts)
    for x, y, r in ((420, 220, 4), (820, 240, 3.4), (330, 460, 2.6), (900, 500, 3)):
        b.append(sparkle(x, y, r))
    svg('nebula', W, H, ''.join(b), 'xMidYMin slice', 'scene')

# ---------- mode cards ----------
def art_adv():
    rng = random.Random(3); W, H = 560, 170; p = 'aa'; hz = 116
    b = [f'<defs><linearGradient id="{p}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#26305A"/><stop offset=".45" stop-color="#6A6688"/><stop offset=".62" stop-color="#C99A78"/><stop offset=".68" stop-color="#EDBE8C"/></linearGradient>',
         f'<linearGradient id="{p}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E7598"/><stop offset=".3" stop-color="#3F4B74"/><stop offset="1" stop-color="#1E2648"/></linearGradient>',
         f'<linearGradient id="{p}b" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stop-color="#FFE3A8" stop-opacity=".7"/><stop offset="1" stop-color="#FFE3A8" stop-opacity="0"/></linearGradient>',
         f'<filter id="{p}f" x="-30%" y="-150%" width="160%" height="400%"><feGaussianBlur stdDeviation="5"/></filter>',
         f'<filter id="{p}g" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>',
         f'<linearGradient id="{p}v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#141A36" stop-opacity=".85"/><stop offset=".55" stop-color="#141A36" stop-opacity=".1"/><stop offset="1" stop-color="#141A36" stop-opacity="0"/></linearGradient></defs>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}k)"/>', stars(rng, 30, W, 50)]
    for cx, cy, rx, ry in ((140, 66, 120, 8), (330, 54, 150, 7), (250, 86, 130, 6)):
        b.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="#E8C2B0" fill-opacity=".3" filter="url(#{p}f)"/>')
    b.append(f'<path d="M0 {hz-24}C60 {hz-34} 120 {hz-28} 170 {hz-12}C200 {hz-4} 230 {hz-2} 260 {hz}H0Z" fill="#3B3F62"/>')
    b.append(forest(rng, [rng.uniform(0, 190) for _ in range(26)], lambda x: hz - 20 + x * .1, 8, 16, '#2C3152'))
    b.append(f'<rect y="{hz}" width="{W}" height="{H-hz}" fill="url(#{p}s)"/>')
    for i in range(8):
        w = 80 - i * 7
        b.append(f'<rect x="{180-w/2+rng.uniform(-8,8):.0f}" y="{hz+4+i*6}" width="{w}" height="1.6" rx=".8" fill="#FFD9A0" fill-opacity="{.32-i*.03:.2f}"/>')
    b.append(f'<path d="M380 {hz+54}C400 {hz+20} 430 {hz+8} 470 {hz+4}C510 {hz} 540 {hz+4} 560 {hz+2}V{H}H380Z" fill="#1E2340"/>')
    lx, top = 480, hz - 70
    b.append(f'<polygon points="{lx-4},{top+8} {lx-4},{top+16} 240,{top+44} 220,{top-18}" fill="url(#{p}b)"/>')
    b.append(f'<polygon points="{lx-11},{hz+8} {lx+11},{hz+8} {lx+7},{top+18} {lx-7},{top+18}" fill="#E9E1CC"/>')
    for y in (hz - 12, hz - 36):
        b.append(f'<rect x="{lx-10}" y="{y-8}" width="20" height="8" fill="#3C4468"/>')
    b.append(f'<polygon points="{lx+2},{hz+8} {lx+11},{hz+8} {lx+7},{top+18} {lx+3},{top+18}" fill="#1E2340" fill-opacity=".35"/>')
    b.append(f'<rect x="{lx-11}" y="{top+14}" width="22" height="4" rx="1" fill="#2B3152"/><circle cx="{lx}" cy="{top+8}" r="10" fill="#FFE3A8" filter="url(#{p}g)"/>')
    b.append(f'<rect x="{lx-6}" y="{top+2}" width="12" height="12" fill="#FFF0C8"/><path d="M{lx-8} {top+2}Q{lx} {top-8} {lx+8} {top+2}Z" fill="#2B3152"/>')
    b.append(f'<rect width="{W}" height="{H}" fill="url(#{p}v)"/>')
    svg('adv', W, H, ''.join(b))

def art_raid():
    rng = random.Random(11); W, H = 560, 150; p = 'ar'
    b = [f'<defs><linearGradient id="{p}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2D3A62"/><stop offset="1" stop-color="#1A2242"/></linearGradient>',
         f'<radialGradient id="{p}o" cx=".4" cy=".35"><stop offset="0" stop-color="#F6EEFF"/><stop offset=".35" stop-color="#B48CF0"/><stop offset="1" stop-color="#5B3AA6"/></radialGradient>',
         f'<radialGradient id="{p}g"><stop offset="0" stop-color="#B48CF0" stop-opacity=".7"/><stop offset="1" stop-color="#B48CF0" stop-opacity="0"/></radialGradient>',
         f'<filter id="{p}f" x="-30%" y="-200%" width="160%" height="500%"><feGaussianBlur stdDeviation="7"/></filter>',
         f'<linearGradient id="{p}v" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#141A36" stop-opacity=".85"/><stop offset=".55" stop-color="#141A36" stop-opacity=".1"/><stop offset="1" stop-color="#141A36" stop-opacity="0"/></linearGradient></defs>',
         f'<rect width="{W}" height="{H}" fill="url(#{p}k)"/>', stars(rng, 26, W, 50),
         forest(rng, sorted(rng.uniform(0, 560) for _ in range(40)), lambda x: 84, 18, 34, '#26315A'),
         f'<ellipse cx="380" cy="86" rx="320" ry="12" fill="#A9B4E0" fill-opacity=".22" filter="url(#{p}f)"/>',
         f'<path d="M350 {H}C362 128 404 122 394 108 386 98 364 98 376 88H388C402 98 420 104 412 116 404 128 420 136 444 {H}Z" fill="#7C84AE" fill-opacity=".55"/>',
         forest(rng, sorted([rng.uniform(150, 240) for _ in range(5)] + [rng.uniform(500, 580) for _ in range(5)]), lambda x: H + 4, 70, 120, '#141B36'),
         f'<circle cx="382" cy="72" r="40" fill="url(#{p}g)"/>',
         '<path d="M374 92h16l3 9h-22z" fill="#4E587E"/><rect x="369" y="101" width="26" height="4" rx="1" fill="#3E4770"/>',
         f'<circle cx="382" cy="78" r="13" fill="url(#{p}o)"/>',
         sparkle(352, 56, 2.6, '#E3D2FF'), sparkle(414, 50, 2.2, '#E3D2FF'), sparkle(404, 92, 1.8, '#E3D2FF'),
         f'<rect width="{W}" height="{H}" fill="url(#{p}v)"/>']
    svg('raid', W, H, ''.join(b))

def art_tower():
    rng = random.Random(5); p = 'at'
    b = [f'<defs><linearGradient id="{p}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4A4D72"/><stop offset=".7" stop-color="#B98E72"/><stop offset="1" stop-color="#D9A47A"/></linearGradient>',
         f'<filter id="{p}g" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>',
         f'<rect width="280" height="110" fill="url(#{p}k)"/>', stars(rng, 10, 280, 30),
         '<path d="M0 78L50 46 86 66 132 36 182 68 230 44 280 70V110H0Z" fill="#5E5672"/>',
         '<path d="M0 94C60 82 110 86 140 78 180 84 230 86 280 90V110H0Z" fill="#3A3650"/>',
         forest(rng, [14, 30, 250, 266, 48, 232], lambda x: 102, 18, 30, '#2A2740'),
         '<rect x="124" y="24" width="32" height="60" fill="#8B7E72"/><rect x="124" y="24" width="9" height="60" fill="#A39584"/>',
         '<path d="M120 24h40v-8h-6v4h-6v-4h-8v4h-6v-4h-6v4h-8z" fill="#8B7E72"/>',
         f'<rect x="135" y="36" width="10" height="13" rx="5" fill="#FFD28A" filter="url(#{p}g)"/><rect x="136.5" y="37.5" width="7" height="10" rx="3.5" fill="#FFE7B8"/>',
         '<rect x="135" y="60" width="10" height="13" rx="5" fill="#2A2740"/>']
    svg('tower', 280, 110, ''.join(b))

def art_build():
    rng = random.Random(9); p = 'ab'; lines = []
    vx, vy = 140, 24
    for i in range(-7, 8):
        bx = 140 + i * 30
        lines.append(f'<line x1="{vx+(bx-vx)*.2:.0f}" y1="{44:.0f}" x2="{bx}" y2="110"/>')
    for k in range(6):
        t = (k / 5) ** 1.8; y = 44 + t * 66; half = 46 + t * 200
        lines.append(f'<line x1="{140-half:.0f}" y1="{y:.0f}" x2="{140+half:.0f}" y2="{y:.0f}"/>')
    L = ''.join(lines)
    b = [f'<defs><linearGradient id="{p}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#22385A"/><stop offset=".4" stop-color="#1B3A3C"/><stop offset="1" stop-color="#10221F"/></linearGradient>',
         f'<filter id="{p}g" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2"/></filter><clipPath id="{p}c"><rect y="43" width="280" height="67"/></clipPath></defs>',
         f'<rect width="280" height="110" fill="url(#{p}k)"/>', stars(rng, 16, 280, 34),
         forest(rng, sorted(rng.uniform(-5, 285) for _ in range(28)), lambda x: 46, 12, 24, '#142A2C'),
         f'<g clip-path="url(#{p}c)" stroke="#73E6B0" stroke-width="2.6" filter="url(#{p}g)" opacity=".8">{L}</g>',
         f'<g clip-path="url(#{p}c)" stroke="#C9FFE4" stroke-width=".9">{L}</g>']
    svg('build', 280, 110, ''.join(b))

def art_cup():
    rng = random.Random(4); p = 'ac'
    b = [f'<defs><linearGradient id="{p}k" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2A2A50"/><stop offset="1" stop-color="#1A1D3C"/></linearGradient>',
         f'<linearGradient id="{p}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE3A8" stop-opacity=".35"/><stop offset="1" stop-color="#FFE3A8" stop-opacity="0"/></linearGradient>',
         f'<linearGradient id="{p}t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C9932E"/><stop offset=".45" stop-color="#FFE7A0"/><stop offset="1" stop-color="#B07A1E"/></linearGradient></defs>',
         f'<rect width="280" height="110" fill="url(#{p}k)"/>', stars(rng, 18, 280, 60),
         f'<polygon points="120,0 160,0 200,96 80,96" fill="url(#{p}l)"/>',
         '<ellipse cx="140" cy="98" rx="60" ry="8" fill="#3A3A64"/><rect x="118" y="80" width="44" height="14" rx="2" fill="#4A4A78"/>',
         f'<path d="M124 30h32v10c0 12-7 20-16 20s-16-8-16-20z" fill="url(#{p}t)"/><rect x="136" y="60" width="8" height="12" fill="#C9932E"/><rect x="128" y="72" width="24" height="7" rx="2" fill="url(#{p}t)"/>',
         '<path d="M124 34h-8v4c0 6 4 10 9 10M156 34h8v4c0 6-4 10-9 10" fill="none" stroke="#E2B654" stroke-width="3"/>',
         sparkle(110, 34, 3), sparkle(172, 24, 2.4), sparkle(162, 66, 2)]
    svg('cup', 280, 110, ''.join(b))

for f in (scene_forest, scene_nebula, art_adv, art_raid, art_tower, art_build, art_cup):
    f()
print('art written to', OUT)
