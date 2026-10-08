# Generates the app icons (run once; output committed with the site).
from PIL import Image, ImageDraw, ImageFilter
import math, pathlib
out = pathlib.Path(__file__).resolve().parent / 'icons'
def icon(size, maskable):
    S = size*4
    im = Image.new('RGBA', (S, S), (12, 10, 28, 255))
    d = ImageDraw.Draw(im)
    # subtle radial glow
    glow = Image.new('RGBA', (S, S), (0, 0, 0, 0)); g = ImageDraw.Draw(glow)
    g.ellipse((S*0.18, S*0.2, S*0.82, S*0.84), fill=(90, 40, 160, 120)); glow = glow.filter(ImageFilter.GaussianBlur(S*0.08))
    im.alpha_composite(glow)
    pad = 0.24 if maskable else 0.14
    cx, cy, r = S/2, S*0.54, S*(0.5 - pad)
    pts = [(cx + r*math.cos(a), cy + r*math.sin(a)) for a in [-math.pi/2, math.pi/6, 5*math.pi/6]]
    line = Image.new('RGBA', (S, S), (0, 0, 0, 0)); l = ImageDraw.Draw(line)
    w = int(S*0.045)
    cols = [(62, 230, 255), (255, 79, 139), (255, 178, 62)]
    for i in range(3):
        a, b = pts[i], pts[(i+1) % 3]
        l.line([a, b], fill=cols[i] + (255,), width=w)
    for p in pts: l.ellipse((p[0]-w/2, p[1]-w/2, p[0]+w/2, p[1]+w/2), fill=(240, 236, 255, 255))
    bl = line.filter(ImageFilter.GaussianBlur(S*0.02)); im.alpha_composite(bl); im.alpha_composite(line)
    br = S*0.07
    d = ImageDraw.Draw(im)
    d.ellipse((cx-br, cy+S*0.02-br, cx+br, cy+S*0.02+br), fill=(255, 255, 255, 255))
    if not maskable:  # rounded corners for the plain icon
        m = Image.new('L', (S, S), 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, S, S), radius=S*0.22, fill=255)
        im.putalpha(m)
    return im.resize((size, size), Image.LANCZOS)
for s in (192, 512): icon(s, False).save(out / f'icon-{s}.png'); icon(s, True).save(out / f'maskable-{s}.png')
icon(180, True).convert('RGB').save(out / 'apple-touch-icon.png')
print('icons ok')
