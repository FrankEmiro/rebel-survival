# Generates the Rebel Survival app icons from icons/source/cr-logo.png (CyberRebellion mark).
# Usage: python3 -I tools/make-icons.py icons/source/cr-logo.png icons
import sys, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops
src, outdir = sys.argv[1], sys.argv[2]
S = 1024
GOLD=(201,168,76); GOLD_L=(232,212,138); RED=(181,48,32)
# background: radial olive gradient, full bleed (maskable-safe)
bg = Image.new('RGB',(S,S))
px = bg.load()
for y in range(S):
    for x in range(S):
        d = math.hypot(x-S/2, y-S*0.46)/(S*0.72)
        t = min(1,d)
        c0=(44,56,33); c1=(14,18,11)
        px[x,y]=tuple(int(c0[i]+(c1[i]-c0[i])*t) for i in range(3))
img = bg.convert('RGBA')
d = ImageDraw.Draw(img)
cx, cy, R = S/2, S/2, S*0.415
# compass bezel
d.arc([cx-R,cy-R,cx+R,cy+R], start=90+32, end=90-32+360, fill=GOLD+(170,), width=int(S*0.012))
r2 = R - S*0.035
d.arc([cx-r2,cy-r2,cx+r2,cy+r2], start=90+34, end=90-34+360, fill=GOLD+(60,), width=int(S*0.004))
for deg in range(0,360,10):
    if 140 < deg < 220: continue          # gap for the SURVIVAL label
    a = math.radians(deg-90)
    L = S*0.045 if deg%90==0 else S*0.022
    w = int(S*0.010) if deg%90==0 else int(S*0.005)
    x1,y1 = cx+R*math.cos(a), cy+R*math.sin(a)
    x2,y2 = cx+(R-L)*math.cos(a), cy+(R-L)*math.sin(a)
    if deg != 0:
        d.line([x1,y1,x2,y2], fill=GOLD+(200,), width=w)
# north marker (red)
tw = S*0.04
d.polygon([(cx, cy-R-S*0.02),(cx-tw, cy-R+S*0.06),(cx+tw, cy-R+S*0.06)], fill=RED+(255,))
# CR logo recoloured gold with vertical gradient
logo = Image.open(src).convert('RGBA')
logo = logo.crop(logo.getbbox())
box = S*0.50
sc = box/max(logo.size)
logo = logo.resize((int(logo.width*sc), int(logo.height*sc)), Image.LANCZOS)
alpha = logo.split()[3]
grad = Image.new('RGBA', logo.size)
gp = grad.load()
for y in range(logo.height):
    t = y/max(1,logo.height-1)
    col = tuple(int(GOLD_L[i]+(GOLD[i]-GOLD_L[i])*t) for i in range(3))
    for x in range(logo.width): gp[x,y]=col+(255,)
grad.putalpha(alpha)
lx, ly = int(cx-logo.width/2), int(S*0.445-logo.height/2)
shadow = Image.new('RGBA', img.size, (0,0,0,0))
sh = Image.new('RGBA', logo.size, (0,0,0,160)); sh.putalpha(ImageChops.multiply(alpha, Image.new('L',logo.size,160)))
shadow.paste(sh, (lx+int(S*0.008), ly+int(S*0.012)), sh)
img = Image.alpha_composite(img, shadow.filter(ImageFilter.GaussianBlur(S*0.01)))
img.alpha_composite(grad, (lx, ly))
# SURVIVAL label in the bottom gap of the bezel
d = ImageDraw.Draw(img)
font = ImageFont.truetype('/System/Library/Fonts/Avenir Next Condensed.ttc', int(S*0.075), index=0)
for i in range(12):
    try:
        f = ImageFont.truetype('/System/Library/Fonts/Avenir Next Condensed.ttc', int(S*0.075), index=i)
        if 'Heavy' in ' '.join(f.getname()) or 'Bold' == f.getname()[1]: font=f; break
    except Exception: break
text = 'SURVIVAL'
spacing = S*0.012
widths = [d.textlength(ch, font=font) for ch in text]
total = sum(widths)+spacing*(len(text)-1)
x = cx-total/2; y = cy+R-S*0.005
for ch,w in zip(text,widths):
    d.text((x, y), ch, font=font, fill=GOLD_L+(255,), anchor='lm')
    x += w+spacing
out = img.convert('RGB')
for n in (512,192):
    out.resize((n,n), Image.LANCZOS).save(f'{outdir}/icon-rs-{n}.png', optimize=True)
out.resize((180,180), Image.LANCZOS).save(f'{outdir}/icon-rs-180.png', optimize=True)
print('font', font.getname())
# maskable: same art shrunk to fit the 80% safe zone, on the plain dark edge colour
m = Image.new('RGB', (S, S), (14,18,11))
k = int(S*0.82)
mk = Image.new('L', (k,k), 0)
ImageDraw.Draw(mk).ellipse([k*0.02,k*0.02,k*0.98,k*0.98], fill=255)
mk = mk.filter(ImageFilter.GaussianBlur(k*0.04))
m.paste(out.resize((k,k), Image.LANCZOS), ((S-k)//2, (S-k)//2), mk)
m.resize((512,512), Image.LANCZOS).save(f'{outdir}/icon-rs-maskable-512.png', optimize=True)
