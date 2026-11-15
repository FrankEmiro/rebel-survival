#!/usr/bin/env python3
"""Schemi SVG per le sezioni delle guide (al posto delle illustrazioni nascoste).

Regola: ogni testo e ogni numero viene dal testo verificato della guida
(js/data/guides.js). Niente numeri nuovi. Disegni semplici a linee.

Uso:  python3 tools/make-guide-svgs.py   → scrive js/images/guides/<guida>--<sezione>.svg
Poi aggiungere la chiave in GUIDE_IMG_SVG (js/data/guides.js).
"""
import os, re, textwrap, html

OUT = os.path.join(os.path.dirname(__file__), '..', 'js', 'images', 'guides')
W, H = 1024, 576
BG, INK, GOLD, RED, GREEN, SOFT = '#f4eedf', '#2a2a26', '#a8781f', '#b0362a', '#3d7a3a', '#d9cfb8'
FONT = "font-family='Helvetica Neue, Helvetica, Arial, sans-serif'"

def esc(s): return html.escape(s, quote=True)

def slug(heading):
    return re.sub(r'^-|-$', '', re.sub(r'[^a-z0-9]+', '-', heading.lower()))[:40]

# ── pittogrammi: ognuno disegna dentro un box 120x120 centrato in (cx, cy) ──
def g(cx, cy, body): return f"<g transform='translate({cx-60},{cy-60})' fill='none' stroke='{INK}' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'>{body}</g>"

def pot(fire=True, steam=True):
    b = "<path d='M22 52 h76 v34 q0 12 -12 12 h-52 q-12 0 -12 -12z'/><path d='M14 52 h92'/><path d='M98 60 h14'/>"
    if steam: b += "<path d='M42 42 q-6 -10 0 -18 q6 -8 0 -16'/><path d='M60 42 q-6 -10 0 -18 q6 -8 0 -16'/><path d='M78 42 q-6 -10 0 -18 q6 -8 0 -16'/>"
    if fire: b += f"<path d='M44 116 q-6 -10 4 -16 q-2 8 6 8 q2 -10 10 -12 q-4 10 6 14 q6 -6 2 -12 q12 8 4 18z' stroke='{RED}'/>"
    return b
def clock(label=None):
    b = "<circle cx='60' cy='62' r='40'/><path d='M50 16 h20 M60 16 v6'/>"
    if label: b += f"<text x='60' y='71' text-anchor='middle' {FONT} font-size='24' font-weight='800' fill='{INK}' stroke='none'>{esc(label)}</text>"
    else: b += "<path d='M60 62 V36'/><path d='M60 62 l18 10'/>"
    return b
def bottle(cap=True):
    b = "<path d='M46 30 h28 v12 q10 6 10 18 v46 q0 8 -8 8 h-32 q-8 0 -8 -8 v-46 q0 -12 10 -18z'/><path d='M40 70 h40'/>"
    if cap: b += f"<rect x='48' y='18' width='24' height='12' rx='3' fill='{GOLD}' stroke='{INK}'/>"
    return b
def drops(n, color=GOLD):
    out, w = '', 22
    x0 = 60 - (n - 1) * w / 2
    for i in range(n):
        x = x0 + i * w
        out += f"<path d='M{x} 34 q-12 18 -12 26 a12 12 0 0 0 24 0 q0 -8 -12 -26z' fill='{color}'/>"
    return out
def drops_jug(n, label):
    out = ''
    x0 = 60 - (n - 1) * 9
    for i in range(n):
        x = x0 + i * 18
        out += f"<path d='M{x} 2 q-8 12 -8 17 a8 8 0 0 0 16 0 q0 -5 -8 -17z' fill='{GOLD}'/>"
    return out + f"<path d='M38 40 h44 l6 12 v50 q0 8 -8 8 h-40 q-8 0 -8 -8 v-50z'/><text x='60' y='88' text-anchor='middle' {FONT} font-size='22' font-weight='700' fill='{INK}' stroke='none'>{esc(label)}</text>"
def jug(label):
    return f"<path d='M36 30 h40 l8 14 v56 q0 8 -8 8 h-40 q-8 0 -8 -8 v-56z'/><text x='58' y='82' text-anchor='middle' {FONT} font-size='22' font-weight='700' fill='{INK}' stroke='none'>{esc(label)}</text>"
def cloth():
    return "<path d='M24 30 h72 l-14 30 h-44z'/><path d='M38 60 l10 22 h24 l10 -22'/><path d='M60 84 v20' stroke-dasharray='4 6'/><path d='M44 108 h32 v8 h-32z'/>"
def nose():
    return bottle() + f"<path d='M86 40 q10 -6 18 0 M86 54 q10 -6 18 0 M86 68 q10 -6 18 0' stroke='{GOLD}' stroke-dasharray='3 5'/><text x='96' y='100' text-anchor='middle' {FONT} font-size='26' font-weight='800' fill='{GOLD}' stroke='none'>?</text>"
def bleach():
    return f"<path d='M38 40 h44 v64 q0 8 -8 8 h-28 q-8 0 -8 -8z'/><path d='M50 40 v-14 h20 v14'/><rect x='46' y='60' width='28' height='26' rx='2' fill='{SOFT}'/><text x='60' y='79' text-anchor='middle' {FONT} font-size='13' font-weight='700' fill='{INK}' stroke='none'>6%</text>"
def filt():
    return "<rect x='44' y='16' width='32' height='64' rx='8'/><path d='M44 34 h32 M44 50 h32 M44 66 h32'/><path d='M60 80 v14'/><path d='M60 100 q-8 10 0 14 q8 -4 0 -14z'/>"
def book():
    return "<path d='M20 28 q20 -8 40 4 q20 -12 40 -4 v70 q-20 -8 -40 4 q-20 -12 -40 -4z'/><path d='M60 32 v70'/><path d='M30 44 h20 M30 56 h20 M70 44 h20 M70 56 h20'/>"
def xmark(cx=60, cy=60, r=34): return f"<path d='M{cx-r} {cy-r} L{cx+r} {cy+r} M{cx+r} {cy-r} L{cx-r} {cy+r}' stroke='{RED}' stroke-width='8'/>"
def check(cx=92, cy=96): return f"<circle cx='{cx}' cy='{cy}' r='16' fill='{GREEN}' stroke='none'/><path d='M{cx-8} {cy} l6 6 l11 -12' stroke='#fff' stroke-width='4'/>"
def badx(cx=92, cy=96): return f"<circle cx='{cx}' cy='{cy}' r='16' fill='{RED}' stroke='none'/><path d='M{cx-6} {cy-6} l12 12 M{cx+6} {cy-6} l-12 12' stroke='#fff' stroke-width='4'/>"
def house(): return "<path d='M14 60 L60 22 L106 60'/><path d='M24 52 v54 h72 v-54'/><rect x='50' y='74' width='20' height='32'/>"
def generator(): return f"<rect x='22' y='40' width='76' height='50' rx='6'/><circle cx='42' cy='65' r='12'/><path d='M66 56 h20 M66 66 h20 M66 76 h12'/><path d='M30 90 v10 M90 90 v10'/><path d='M98 50 q14 -4 14 -16' stroke='{SOFT}' stroke-width='6'/>"
def detector(): return f"<circle cx='60' cy='60' r='38'/><circle cx='60' cy='60' r='12' fill='{GOLD}'/><path d='M36 34 q-12 -12 -24 -2 M84 34 q12 -12 24 -2'/><text x='60' y='112' text-anchor='middle' {FONT} font-size='18' font-weight='700' fill='{INK}' stroke='none'>CO</text>"
def person_sick(): return "<circle cx='60' cy='30' r='14'/><path d='M60 44 v38 M60 56 l-18 14 M60 56 l18 14 M60 82 l-14 26 M60 82 l14 26'/><path d='M80 18 q8 -4 10 4 q2 8 -6 8' /><path d='M30 20 l-8 -6 M28 30 h-10'/>"
def door_out(): return f"<rect x='20' y='14' width='46' height='96'/><path d='M66 14 l24 10 v96 l-24 -10z' fill='{SOFT}'/><path d='M96 60 h18 M106 50 l10 10 l-10 10' stroke='{GREEN}'/>"
def phone(label=None):
    b = "<rect x='38' y='12' width='44' height='96' rx='8'/><path d='M54 22 h12'/><circle cx='60' cy='96' r='4'/>"
    if label: b += f"<text x='60' y='66' text-anchor='middle' {FONT} font-size='20' font-weight='700' fill='{RED}' stroke='none'>{esc(label)}</text>"
    return b
def fuel(): return f"<path d='M30 40 l14 -16 h40 v86 h-54z'/><path d='M84 36 h12 v20'/><path d='M44 60 h26 M44 74 h26' stroke='{GOLD}'/>"
def cord(): return f"<path d='M14 90 q30 -50 60 -20 q20 20 34 -10'/><rect x='96' y='44' width='16' height='26' rx='3' fill='{GOLD}'/><path d='M100 44 v-8 M108 44 v-8'/>"
def socket_x(): return f"<rect x='24' y='24' width='72' height='72' rx='10'/><circle cx='48' cy='60' r='5' fill='{INK}'/><circle cx='72' cy='60' r='5' fill='{INK}'/>" + xmark(60, 60, 40)
def rain(): return f"<path d='M30 46 q0 -20 22 -20 q8 -14 26 -8 q20 0 20 20 q12 4 8 16 h-76 q-10 -6 0 -8z'/>" + ''.join(f"<path d='M{x} 70 l-6 14' stroke='{GOLD}'/>" for x in (40, 58, 76, 94))
def brightness(): return phone() + f"<circle cx='60' cy='56' r='10' fill='{GOLD}'/><path d='M60 36 v-6 M60 82 v-6 M40 56 h-6 M86 56 h-6' stroke='{GOLD}'/>"
def plane(): return phone() + f"<path d='M60 34 v40 M46 56 l14 -6 l14 6 M52 74 l8 -4 l8 4' stroke='{GOLD}'/>"
def apps_close(): return phone() + f"<rect x='46' y='34' width='12' height='12'/><rect x='62' y='34' width='12' height='12'/><rect x='46' y='52' width='12' height='12'/>" + xmark(68, 58, 9)
def talk_short(): return "<path d='M20 30 h70 q8 0 8 8 v30 q0 8 -8 8 h-40 l-16 14 v-14 h-14 q-8 0 -8 -8 v-30 q0 -8 8 -8z'/><path d='M34 48 h44 M34 60 h24'/>"
def car(): return "<path d='M14 80 v-20 l16 -24 h56 l18 24 v20z'/><circle cx='36' cy='84' r='10'/><circle cx='88' cy='84' r='10'/><path d='M36 40 l-8 18 h66 l-10 -18z'/>"
def garage(): return "<path d='M10 50 L60 18 L110 50 v62 h-100z'/><path d='M24 112 v-48 h72 v48'/><path d='M24 76 h72 M24 88 h72 M24 100 h72'/>"
def radio(): return f"<rect x='16' y='42' width='88' height='56' rx='8'/><path d='M30 42 l50 -26'/><circle cx='44' cy='70' r='14'/><path d='M70 60 h22 M70 72 h22 M70 84 h14'/>"
def tap_off(): return "<path d='M20 54 h50 v-14 h18 v14 h12 v18 h-24'/><path d='M76 72 v16'/><path d='M54 30 h40' stroke-width='6'/>" + xmark(86, 98, 10)
def bags(): return f"<path d='M28 40 l8 70 h48 l8 -70z'/><path d='M38 46 l6 58 h32 l6 -58z' stroke='{GOLD}'/><path d='M28 40 q32 -16 64 0'/>"
def cover(): return f"<path d='M22 66 l10 44 h56 l10 -44z'/><path d='M18 66 h84'/><path d='M40 18 l40 0 l-6 22 h-28z' fill='{SOFT}'/><path d='M60 40 v6'/>" + ''.join(f"<circle cx='{x}' cy='{y}' r='3' fill='{GOLD}' stroke='none'/>" for x, y in ((52,52),(62,56),(70,50),(56,60),(66,62),(46,76),(58,74),(70,78),(80,74),(52,84),(64,86),(76,84)))
def lid(): return "<path d='M28 56 l8 54 h48 l8 -54z'/><path d='M22 56 h76'/><path d='M30 50 q30 -22 60 0'/><path d='M54 36 h12'/>"
def bucket(): return "<path d='M28 44 l10 66 h44 l10 -66z'/><path d='M24 44 h72'/><path d='M30 44 q30 -40 60 0'/>"
def wash(): return f"<path d='M30 80 q0 -20 16 -24 l30 -4 q10 0 10 8 l-10 2'/><path d='M40 84 q20 10 46 -6'/><circle cx='88' cy='34' r='8' stroke='{GOLD}'/><circle cx='70' cy='26' r='5' stroke='{GOLD}'/><circle cx='96' cy='54' r='5' stroke='{GOLD}'/>"
def gel(): return f"<path d='M42 46 h36 v58 q0 8 -8 8 h-20 q-8 0 -8 -8z'/><path d='M54 46 v-14 h22 M60 32 v-8'/><path d='M50 66 h20 M50 78 h20' stroke='{GOLD}'/>"
def gas_valve(): return f"<path d='M10 70 h100'/><rect x='46' y='56' width='28' height='28' rx='4'/><path d='M60 56 v-20 h30' stroke-width='7' stroke='{GOLD}'/><text x='60' y='112' text-anchor='middle' {FONT} font-size='16' font-weight='700' fill='{INK}' stroke='none'>GAS</text>"
def panel(): return "<rect x='20' y='16' width='80' height='92' rx='6'/>" + ''.join(f"<rect x='{x}' y='36' width='10' height='22' rx='2'/><path d='M{x+5} 40 v8'/>" for x in (30, 46, 62)) + f"<rect x='78' y='34' width='14' height='28' rx='2' fill='{GOLD}'/><text x='60' y='92' text-anchor='middle' {FONT} font-size='13' font-weight='700' fill='{INK}' stroke='none'>1 → 2</text>"
def water_valve(): return f"<path d='M10 70 h100' stroke='{GOLD}' stroke-width='10'/><circle cx='60' cy='70' r='16' fill='{BG}'/><path d='M60 54 v-22 M44 32 h32' stroke-width='6'/><text x='60' y='112' text-anchor='middle' {FONT} font-size='16' font-weight='700' fill='{INK}' stroke='none'>ACQUA</text>"
def no_switch(): return "<rect x='36' y='24' width='48' height='72' rx='6'/><rect x='50' y='40' width='20' height='40' rx='4'/>" + xmark(60, 60, 40)
def no_flame(): return f"<path d='M60 100 q-24 -16 -8 -48 q6 14 14 10 q-8 -24 10 -40 q0 26 14 34 q8 26 -14 44z' stroke='{RED}'/>" + xmark(60, 60, 42)
def window_open(): return "<rect x='20' y='20' width='80' height='84'/><path d='M60 20 v84'/><path d='M60 20 l-26 10 v70 l26 4' fill='#fff'/><path d='M86 56 q14 -8 22 0' stroke-dasharray='4 4'/>"
def fan_off(): return "<circle cx='60' cy='60' r='40'/><path d='M60 60 q-10 -30 10 -30 q6 20 -10 30 q30 -10 30 10 q-20 6 -30 -10 q10 30 -10 30 q-6 -20 10 -30'/>" + xmark(60, 60, 40)
def walls(): return f"<rect x='14' y='14' width='92' height='92'/><rect x='30' y='30' width='60' height='60'/><rect x='46' y='46' width='28' height='28' fill='{GOLD}'/>"
def bag_clothes(): return "<path d='M30 50 h60 l-6 60 h-48z'/><path d='M44 50 q16 -22 32 0'/><path d='M44 28 l16 -12 l16 12 l-6 6 h-20z'/>"
def shower(): return f"<path d='M30 20 h40 q10 0 10 10 v6'/><path d='M66 36 h28 l-4 10 h-20z'/>" + ''.join(f"<path d='M{x} 56 l-4 12' stroke='{GOLD}'/>" for x in (70, 80, 90)) + "<circle cx='50' cy='80' r='10'/><path d='M50 90 v20'/>"
def face(): return f"<circle cx='60' cy='60' r='40'/><circle cx='46' cy='52' r='5' fill='{GOLD}'/><circle cx='74' cy='52' r='5' fill='{GOLD}'/><path d='M60 58 v12'/><path d='M18 60 h-6 M102 60 h6' stroke='{GOLD}'/>"
def shirt(): return "<path d='M34 28 l14 -8 q12 10 24 0 l14 8 l14 20 l-14 8 v52 h-52 v-52 l-14 -8z'/>" + check(92, 100)
def plug_off(): return "<rect x='26' y='40' width='40' height='40' rx='6'/><path d='M66 60 h22 M88 50 v20'/><path d='M36 40 v-16 M56 40 v-16'/>" + f"<path d='M96 34 q14 26 0 52' stroke='{GOLD}' stroke-dasharray='4 4'/>"
def elevator_x(): return "<rect x='24' y='16' width='72' height='92'/><path d='M60 16 v92'/><path d='M44 40 l8 -10 l8 10 M68 30 l8 10 l8 -10'/>" + xmark(60, 64, 36)
def fridge(): return "<rect x='30' y='12' width='60' height='100' rx='6'/><path d='M30 46 h60'/><path d='M80 26 v10 M80 58 v16'/>" + f"<path d='M96 50 h14 v14 h-14z' fill='{GOLD}'/>"
def stove_x(): return "<rect x='20' y='50' width='80' height='56' rx='4'/><circle cx='42' cy='38' r='10'/><circle cx='78' cy='38' r='10'/><path d='M30 70 h60'/>" + xmark(60, 66, 40)
def steps_up(): return f"<path d='M14 100 h28 v-24 h28 v-24 h28 v-24'/><circle cx='28' cy='88' r='5' fill='{GOLD}'/><circle cx='56' cy='64' r='5' fill='{GOLD}'/><circle cx='84' cy='40' r='5' fill='{GOLD}'/>"
def thermo(label): return f"<rect x='48' y='14' width='24' height='70' rx='12'/><circle cx='60' cy='94' r='16' fill='{RED}'/><path d='M60 84 v-40' stroke='{RED}' stroke-width='8'/><text x='96' y='54' text-anchor='middle' {FONT} font-size='18' font-weight='700' fill='{INK}' stroke='none'>{esc(label)}</text>"
def pills(): return f"<rect x='22' y='44' width='76' height='36' rx='18'/><path d='M60 44 v36'/><rect x='70' y='18' width='20' height='20' rx='4' fill='{SOFT}'/><path d='M74 28 h12 M80 22 v12'/>"
def pets_none(): return ''
def glass_x(): return "<path d='M36 24 h48 l-8 84 h-32z'/><path d='M40 50 h40'/>" + f"<path d='M44 70 q4 -6 8 0 q4 6 8 0 q4 -6 8 0' stroke='{RED}'/>"

# ── composizione ──
def wrap(t, n): return textwrap.wrap(t, n)

def panels_svg(title, subtitle, items, note=None, note_color=RED):
    n = len(items)
    cols = n if n <= 4 else (3 if n in (5, 6) else 4)
    rows = (n + cols - 1) // cols
    top = 118
    bottom = 46 if note else 16
    ch = (H - top - bottom) / rows
    cw = (W - 40) / cols
    s = [f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' width='{W}' height='{H}' role='img' aria-label='{esc(title)}'>",
         f"<rect width='{W}' height='{H}' fill='{BG}'/>",
         f"<rect x='10' y='10' width='{W-20}' height='{H-20}' fill='none' stroke='{INK}' stroke-width='3' rx='6'/>",
         f"<text x='{W/2}' y='60' text-anchor='middle' {FONT} font-size='38' font-weight='800' fill='{INK}'>{esc(title.upper())}</text>",
         f"<text x='{W/2}' y='94' text-anchor='middle' {FONT} font-size='20' fill='{GOLD}'>{esc(subtitle)}</text>"]
    for i, (pic, cap) in enumerate(items):
        r, c = divmod(i, cols)
        rowcount = cols if r < rows - 1 else n - cols * (rows - 1)
        offset = (cols - rowcount) * cw / 2
        x = 20 + offset + c * cw
        scale = min(1.3 if rows > 1 else 1.75, (ch - 84) / 120)
        block = 120 * scale + 84
        y = top + r * ch + max(0, (ch - block) / 2)
        s.append(f"<g transform='translate({x + cw/2},{y + 6 + 60*scale}) scale({scale:.3f})'>{g(0, 0, pic)}</g>")
        lines = wrap(cap, 24 if cols >= 4 else 30)
        ty = y + 14 + 120 * scale
        s.append(f"<circle cx='{x + 26}' cy='{y + 18}' r='14' fill='{GOLD}'/><text x='{x + 26}' y='{y + 24}' text-anchor='middle' {FONT} font-size='17' font-weight='800' fill='#fff'>{i+1}</text>")
        for k, ln in enumerate(lines[:3]):
            s.append(f"<text x='{x + cw/2}' y='{ty + 20 + k*21}' text-anchor='middle' {FONT} font-size='18' font-weight='{700 if k == 0 else 500}' fill='{INK}'>{esc(ln)}</text>")
    if note:
        s.append(f"<text x='{W/2}' y='{H-26}' text-anchor='middle' {FONT} font-size='19' font-weight='700' fill='{note_color}'>{esc(note)}</text>")
    s.append('</svg>')
    return '\n'.join(s)

# Distanza del generatore: disegno dedicato
def generator_layout():
    t = lambda x, y, txt, size=17, w=700, col=INK, anchor='middle': f"<text x='{x}' y='{y}' text-anchor='{anchor}' {FONT} font-size='{size}' font-weight='{w}' fill='{col}'>{esc(txt)}</text>"
    s = [f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' width='{W}' height='{H}' role='img' aria-label='Installazione corretta del generatore'>",
         f"<rect width='{W}' height='{H}' fill='{BG}'/><rect x='10' y='10' width='{W-20}' height='{H-20}' fill='none' stroke='{INK}' stroke-width='3' rx='6'/>",
         t(W/2, 60, 'INSTALLAZIONE CORRETTA', 38, 800),
         t(W/2, 94, 'Generatore: uso sicuro (Ready.gov · CDC)', 20, 400, GOLD),
         f"<g fill='none' stroke='{INK}' stroke-width='4' stroke-linejoin='round'>",
         "<path d='M40 290 L170 180 L300 290'/><path d='M60 274 v150 h220 v-150'/>",
         "<rect x='90' y='320' width='50' height='104'/><rect x='180' y='320' width='70' height='50'/><path d='M215 320 v50'/>",
         f"<path d='M20 424 h980' stroke='{SOFT}'/></g>",
         f"<g transform='translate(600,250) scale(1.5)'>{g(60, 60, generator())}</g>",
         f"<g stroke='{GREEN}' stroke-width='5' fill='none'><path d='M282 456 H622'/><path d='M282 442 v28 M622 442 v28'/></g>",
         t(452, 498, 'almeno 6 metri', 32, 800, GREEN),
         t(452, 526, 'da finestre, porte e garage attaccati alla casa', 18, 500),
         f"<g transform='translate(130,150) scale(0.7)'>{g(60, 60, detector())}</g>",
         t(170, 140, 'Rilevatore di CO su ogni piano', 17),
         f"<g transform='translate(640,140) scale(0.75)'>{g(60, 60, rain())}</g>",
         t(685, 245, 'Tienilo asciutto', 17),
         f"<g transform='translate(830,130) scale(0.8)'>{g(60, 60, socket_x())}</g>",
         t(878, 250, 'Mai collegarlo', 18, 800, RED), t(878, 272, "all'impianto di casa", 18, 800, RED),
         t(878, 312, 'Apparecchi collegati', 16, 500), t(878, 332, 'al generatore con', 16, 500), t(878, 352, 'prolunghe per uso pesante', 16, 500),
         t(150, 510, 'Mai in casa, garage o cantina', 18, 800, RED),
         '</svg>']
    return '\n'.join(s)

SVGS = {
  ('acqua-purificazione', 'Metodo 1 — Bollitura (migliore)'): panels_svg(
      'Bollitura', 'Purificazione acqua (CDC · EPA)',
      [(cloth(), "Se torbida: lasciala depositare e filtrala con un panno"),
       (pot(), "Porta a bollore vigoroso"),
       (clock('1 min'), "Bollore per 1 minuto (3 minuti sopra i 2.000 m)"),
       (bottle(), "Lascia raffreddare e conserva in contenitori puliti chiusi")],
      note="La bollitura non elimina le sostanze chimiche"),
  ('acqua-purificazione', 'Metodo 2 — Candeggina domestica'): panels_svg(
      'Candeggina domestica', 'Purificazione acqua (EPA · CDC)',
      [(bleach(), "Solo liquida, non profumata: dosi per il 6% di cloro"),
       (drops_jug(2, '1 L'), "Acqua limpida: 2 gocce per litro"),
       (drops_jug(4, '1 L'), "Torbida, colorata o molto fredda: raddoppia la dose"),
       (clock('30'), "Mescola e attendi 30 minuti prima di bere"),
       (nose(), "Leggero odore di cloro? Se no ripeti la dose e attendi altri 15 minuti")]),
  ('acqua-purificazione', 'Metodo 3 — Filtro portatile'): panels_svg(
      'Filtro portatile', 'Purificazione acqua (CDC)',
      [(filt(), "Molti filtri trattengono parassiti e batteri, non i virus"),
       (pot(), "Per i virus: dopo il filtro bolli o usa la candeggina"),
       (book(), "Pulizia, durata e gelo: istruzioni del produttore")]),
  ('acqua-purificazione', 'Quale metodo scegliere'): panels_svg(
      'Quale metodo scegliere', 'Purificazione acqua (CDC · EPA)',
      [(pot(), "1° Bollitura: il modo più sicuro per uccidere i germi"),
       (bleach(), "2° Se non puoi bollire: candeggina"),
       (filt(), "3° Filtro o SODIS: quando mancano gli altri metodi"),
       (fuel() + xmark(), "Carburanti o chimici: nessun metodo basta. Usa acqua in bottiglia")]),
  ('energia-generatore', 'Installazione corretta'): generator_layout(),
  ('energia-generatore', 'Monossido di carbonio — il pericolo invisibile'): panels_svg(
      'Monossido di carbonio', 'Generatore: uso sicuro (CDC · Ready.gov)',
      [(generator(), "Il generatore produce CO: senza colore e senza odore"),
       (detector(), "Solo un rilevatore di CO funzionante può avvisarti"),
       (person_sick(), "Mal di testa, nausea o capogiri col generatore acceso?"),
       (door_out() , "Esci subito all'aria aperta e chiama il 112 o il 118")]),
  ('energia-generatore', 'Rifornimento e manutenzione'): panels_svg(
      'Rifornimento', 'Generatore: uso sicuro (Ready.gov)',
      [(generator() + xmark(60, 60, 20), "Spegnilo"),
       (clock(), "Lascialo raffreddare: la benzina su parti calde può prendere fuoco"),
       (fuel(), "Poi fai rifornimento"),
       (book(), "Olio, manutenzione e carburante: istruzioni del produttore")]),
  ('energia-ricarica', 'Far durare la batteria'): panels_svg(
      'Far durare la batteria', 'Ricaricare senza corrente (Energy.gov)',
      [(brightness(), "Abbassa la luminosità dello schermo"),
       (plane(), "Modalità aereo quando non ti serve la rete"),
       (apps_close(), "Chiudi le app che non usi"),
       (talk_short(), "Chiamate brevi, solo informazioni essenziali")]),
  ('energia-ricarica', 'Ricaricare in auto'): panels_svg(
      'Ricaricare in auto', 'Ricaricare senza corrente (Energy.gov · Ready.gov)',
      [(car() + check(96, 22), "Motore acceso solo all'aperto, in un posto ben ventilato"),
       (garage() + badx(96, 22), "Mai in garage, nemmeno con la porta aperta: monossido"),
       (radio(), "Con l'autoradio ascolti notizie e avvisi")]),
  ('igiene-wc-emergenza', 'Bagno di emergenza nel WC'): panels_svg(
      'Bagno di emergenza', 'Igiene senza acqua corrente (NC DHHS · Oregon OEM)',
      [(tap_off(), "Chiudi il rubinetto del WC e svuota la tazza"),
       (bags(), "Un sacco dentro un altro sacco nella tazza"),
       (cover(), "Dopo ogni uso copri con segatura, carta, lettiera o terra"),
       (lid(), "Chiudi il sacco e il coperchio tra un uso e l'altro"),
       (bucket(), "Senza WC: secchio con coperchio, rivestito allo stesso modo")],
      note="Sorveglia i bambini piccoli quando lo usano", note_color=INK),
  ('igiene-wc-emergenza', 'Rifiuti e mani'): panels_svg(
      'Rifiuti e mani', 'Igiene senza acqua corrente (Washington County OR · CDC)',
      [(bags(), "Sacchi pieni: chiusi e in un secondo sacco"),
       (fridge() + xmark(60, 60, 22), "Separati dalla spazzatura, lontano da cibo e acqua"),
       (wash(), "Lavati le mani con acqua e sapone dopo il bagno e prima del cibo"),
       (gel(), "Se l'acqua manca: gel igienizzante")]),
  ('casa-utenze', 'Come chiudere'): panels_svg(
      'Come chiudere', 'Gas, acqua e luce (Ready.gov)',
      [(gas_valve(), "Gas: chiudi il rubinetto del contatore. Lo riapre solo un tecnico"),
       (panel(), "Luce: prima i singoli interruttori, poi il generale"),
       (water_valve(), "Acqua: rubinetto generale dentro casa")]),
  ('casa-utenze', 'Quando chiudere'): panels_svg(
      'Odore di gas', 'Gas, acqua e luce (Ready.gov)',
      [(no_switch(), "Non toccare interruttori"),
       (no_flame(), "Non accendere fiamme"),
       (window_open(), "Apri le finestre"),
       (door_out(), "Esci"),
       (phone('112'), "Chiama il 112 da fuori")],
      note="Chiudi le utenze solo se lo chiedono le autorità o c'è un pericolo reale", note_color=INK),
  ('nucleare-radiologico', 'Restare al chiuso'): panels_svg(
      'Restare al chiuso', 'Nucleare e radiologico (Ready.gov · CDC · Protezione civile)',
      [(window_open() + xmark(60, 60, 30), "Chiudi porte e finestre"),
       (fan_off(), "Spegni ventilazione e condizionatori"),
       (walls(), "Più muri e più massa tra te e l'esterno"),
       (clock('24 h'), "Resta dentro almeno 24 ore o finché le autorità dicono di uscire"),
       (radio(), "Tieni la radio accesa")]),
  ('nucleare-radiologico', 'Decontaminazione'): panels_svg(
      'Decontaminazione', 'Nucleare e radiologico (CDC · Ready.gov)',
      [(bag_clothes(), "Togli i vestiti esterni senza scuoterli, in un sacchetto chiuso"),
       (shower(), "Lavati con acqua e sapone, senza strofinare forte, no balsamo"),
       (face(), "Lava occhi, naso e orecchie"),
       (shirt(), "Metti vestiti puliti")]),
  ('energia-blackout-protocollo', 'Durante il blackout'): panels_svg(
      'Durante il blackout', 'Blackout (Protezione civile · Ready.gov)',
      [(plug_off(), "Spegni gli apparecchi accesi: la corrente può tornare con sbalzi"),
       (elevator_x(), "Non prendere l'ascensore"),
       (radio(), "Notizie dalla radio, telefono solo per emergenze"),
       (fridge(), "Apri il meno possibile frigo e freezer"),
       (stove_x(), "Mai fornello o forno a gas per scaldare la casa"),
       (generator() + xmark(60, 60, 18), "Generatore: mai collegato all'impianto, sempre all'aperto")]),
  ('energia-blackout-protocollo', 'Quando torna la corrente'): panels_svg(
      'Quando torna la corrente', 'Blackout (Ready.gov · Protezione civile)',
      [(steps_up(), "Riaccendi gli apparecchi un po' alla volta"),
       (thermo('≥4°C') , "Cibo a 4 °C o più per 2 ore o più: buttalo. Nel dubbio, buttalo"),
       (pills(), "Corrente mancata più di un giorno: farmaci da frigo da buttare, salvo indicazioni")]),
}

def main():
    os.makedirs(OUT, exist_ok=True)
    keys = []
    for (gid, heading), svg in SVGS.items():
        key = f"{gid}--{slug(heading)}"
        with open(os.path.join(OUT, key + '.svg'), 'w', encoding='utf-8') as f:
            f.write(svg)
        keys.append(key)
    print('\n'.join(keys))

if __name__ == '__main__':
    main()
