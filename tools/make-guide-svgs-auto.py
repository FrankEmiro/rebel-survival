#!/usr/bin/env python3
"""Schemi SVG automatici per tutte le sezioni delle guide ancora senza illustrazione.

- I testi sono SOLO quelli delle guide (js/data/guides.js): ogni passo diventa un riquadro.
  Se un passo è troppo lungo si usa la sua prima frase intera (il testo completo è sotto
  l'immagine nell'app). Nessun numero viene aggiunto.
- Il pittogramma è scelto dalle parole del passo; per il primo soccorso si usano solo
  pittogrammi neutri (niente posizioni del corpo).
- Le sezioni disegnate a mano in tools/make-guide-svgs.py hanno la precedenza.

Uso:  python3 tools/make-guide-svgs-auto.py   (serve node per leggere guides.js)
Scrive js/images/guides/<chiave>.svg e stampa le chiavi da mettere in GUIDE_IMG_SVG.
"""
import importlib.util, json, os, re, subprocess, textwrap

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
spec = importlib.util.spec_from_file_location('base', os.path.join(HERE, 'make-guide-svgs.py'))
B = importlib.util.module_from_spec(spec); spec.loader.exec_module(B)
INK, GOLD, RED, GREEN, SOFT, BG, FONT, esc = B.INK, B.GOLD, B.RED, B.GREEN, B.SOFT, B.BG, B.FONT, B.esc
W, H = B.W, B.H

# ── pittogrammi in più ──
def person(): return "<circle cx='60' cy='26' r='14'/><path d='M60 40 v40 M60 52 l-20 16 M60 52 l20 16 M60 80 l-16 30 M60 80 l16 30'/>"
def family(): return "<circle cx='38' cy='34' r='12'/><path d='M38 46 v34 M38 56 l-14 12 M38 56 l14 12 M38 80 l-10 26 M38 80 l10 26'/><circle cx='82' cy='50' r='9'/><path d='M82 59 v26 M82 66 l-10 8 M82 66 l10 8 M82 85 l-8 20 M82 85 l8 20'/>"
def paw(): return f"<ellipse cx='60' cy='76' rx='22' ry='18' fill='{GOLD}'/>" + ''.join(f"<ellipse cx='{x}' cy='{y}' rx='8' ry='10' fill='{GOLD}'/>" for x, y in ((32, 50), (50, 34), (70, 34), (88, 50)))
def backpack(): return "<path d='M34 34 q0 -16 26 -16 q26 0 26 16 v66 q0 8 -8 8 h-36 q-8 0 -8 -8z'/><path d='M44 60 h32 v26 h-32z'/><path d='M50 18 q10 -10 20 0'/>"
def docs(): return f"<path d='M30 18 h44 l16 16 v76 h-60z'/><path d='M74 18 v16 h16'/><path d='M42 54 h36 M42 68 h36 M42 82 h24' stroke='{GOLD}'/>"
def cash(): return f"<rect x='14' y='38' width='92' height='50' rx='6'/><circle cx='60' cy='63' r='14' stroke='{GOLD}'/><path d='M60 54 v18' stroke='{GOLD}'/><path d='M26 50 h8 M86 76 h8'/>"
def mapi(): return f"<path d='M16 30 l28 -10 l32 10 l28 -10 v70 l-28 10 l-32 -10 l-28 10z'/><path d='M44 20 v70 M76 30 v70'/><circle cx='62' cy='54' r='6' fill='{RED}' stroke='none'/>"
def compass(): return f"<circle cx='60' cy='60' r='44'/><path d='M60 24 l10 36 l-10 36 l-10 -36z'/><path d='M60 24 l10 36 h-20z' fill='{RED}' stroke='{RED}'/><text x='60' y='14' text-anchor='middle' {FONT} font-size='14' font-weight='800' fill='{INK}' stroke='none'>N</text>"
def heart(): return f"<path d='M60 104 q-46 -30 -46 -58 q0 -22 22 -22 q16 0 24 16 q8 -16 24 -16 q22 0 22 22 q0 28 -46 58z' fill='{SOFT}'/>"
def medkit(): return f"<rect x='18' y='36' width='84' height='64' rx='8'/><path d='M44 36 v-12 h32 v12'/><path d='M60 50 v36 M42 68 h36' stroke='{RED}' stroke-width='8'/>"
def rope(): return "<path d='M14 70 q20 -40 40 -10 q14 22 30 0 q14 -20 24 6'/><path d='M14 80 q20 -40 40 -10 q14 22 30 0 q14 -20 24 6'/><circle cx='54' cy='62' r='10'/>"
def tent(): return "<path d='M14 100 L60 22 L106 100z'/><path d='M60 22 v78 M48 100 L60 70 L72 100'/>"
def sun(): return f"<circle cx='60' cy='60' r='20' fill='{GOLD}'/>" + ''.join(f"<path d='M{60+30*c:.0f} {60+30*s:.0f} L{60+44*c:.0f} {60+44*s:.0f}'/>" for c, s in ((1,0),(-1,0),(0,1),(0,-1),(.7,.7),(-.7,.7),(.7,-.7),(-.7,-.7)))
def snow(): return ''.join(f"<path d='M{60+44*c:.0f} {60+44*s:.0f} L{60-44*c:.0f} {60-44*s:.0f}'/>" for c, s in ((1,0),(.5,.87),(-.5,.87))) + "<circle cx='60' cy='60' r='8'/>"
def fire(): return f"<path d='M60 108 q-34 -12 -24 -50 q6 14 16 12 q-10 -30 12 -54 q2 30 18 40 q12 34 -22 52z' stroke='{RED}'/><path d='M30 110 h60'/>"
def tree(): return "<path d='M60 14 l-30 44 h16 l-22 30 h72 l-22 -30 h16z'/><path d='M60 88 v24'/>"
def fish(): return f"<path d='M20 60 q30 -30 64 0 q-34 30 -64 0z'/><path d='M84 60 l20 -16 v32z'/><circle cx='38' cy='56' r='4' fill='{INK}'/>"
def leaf(): return f"<path d='M24 96 q0 -70 76 -76 q-4 76 -76 76z' fill='{SOFT}'/><path d='M24 96 l50 -50'/>"
def jar(): return f"<rect x='34' y='30' width='52' height='12' rx='3' fill='{GOLD}'/><path d='M36 42 h48 v58 q0 8 -8 8 h-32 q-8 0 -8 -8z'/><path d='M44 62 h32 M44 76 h32' stroke='{GOLD}'/>"
def lock(): return f"<rect x='28' y='54' width='64' height='50' rx='8'/><path d='M40 54 v-14 q0 -20 20 -20 q20 0 20 20 v14'/><circle cx='60' cy='78' r='6' fill='{GOLD}'/>"
def shield(): return f"<path d='M60 14 l40 14 v30 q0 34 -40 52 q-40 -18 -40 -52 v-30z' fill='{SOFT}'/><path d='M44 60 l12 12 l22 -24' stroke='{GREEN}' stroke-width='6'/>"
def wifi_off(): return "<path d='M20 50 q40 -36 80 0 M34 64 q26 -22 52 0 M48 78 q12 -10 24 0'/><circle cx='60' cy='92' r='5'/>" + B.xmark(60, 60, 42)
def computer(): return f"<rect x='18' y='22' width='84' height='56' rx='4'/><path d='M44 98 h32 M60 78 v20'/><path d='M34 40 h52 M34 54 h34' stroke='{GOLD}'/>"
def battery(): return f"<rect x='22' y='38' width='70' height='44' rx='6'/><rect x='92' y='52' width='8' height='16' rx='2'/><rect x='30' y='46' width='36' height='28' fill='{GREEN}' stroke='none'/>"
def solar(): return f"<path d='M14 92 l20 -56 h72 l-20 56z'/><path d='M44 36 l-10 56 M70 36 l-10 56 M24 64 h76'/><circle cx='98' cy='20' r='8' fill='{GOLD}'/>"
def warn(): return f"<path d='M60 16 L106 100 H14z' fill='{SOFT}'/><path d='M60 44 v28' stroke-width='7'/><circle cx='60' cy='86' r='4' fill='{INK}'/>"
def whistle(): return f"<path d='M20 52 h52 q22 0 22 22 q0 22 -22 22 q-22 0 -22 -22 v-8 h-30z'/><circle cx='72' cy='74' r='6'/><path d='M96 40 l10 -10 M100 56 h12' stroke='{GOLD}'/>"
def mirror(): return f"<rect x='22' y='30' width='60' height='60' rx='6'/><path d='M34 42 l20 20' stroke='{SOFT}' stroke-width='6'/><path d='M82 40 l26 -20 M82 60 h28 M82 80 l26 18' stroke='{GOLD}'/>"
def calendar(): return f"<rect x='18' y='26' width='84' height='78' rx='6'/><path d='M18 46 h84 M40 16 v18 M80 16 v18'/><path d='M34 64 h12 M54 64 h12 M74 64 h12 M34 82 h12 M54 82 h12' stroke='{GOLD}'/>"
def salt(): return f"<path d='M40 34 h40 l6 70 h-52z'/><path d='M44 20 h32 v14 h-32z' fill='{SOFT}'/>" + ''.join(f"<circle cx='{x}' cy='{y}' r='2.5' fill='{INK}' stroke='none'/>" for x, y in ((52,25),(60,27),(68,25)))
def knife(): return "<path d='M14 84 l60 -60 q14 0 10 14 l-46 46z'/><path d='M38 84 l14 14 l-10 10 l-14 -14z'/>"
def seed(): return f"<path d='M60 104 v-40'/><path d='M60 70 q-30 -4 -30 -34 q30 0 30 34z' fill='{SOFT}'/><path d='M60 64 q30 -4 30 -30 q-30 0 -30 30z' fill='{SOFT}'/><path d='M30 104 h60'/>"
def hands(): return "<path d='M20 70 q10 -30 40 -30 q30 0 40 30'/><path d='M30 70 q30 20 60 0'/><path d='M40 52 q20 -18 40 0'/>"
def chat(): return "<path d='M14 24 h66 q8 0 8 8 v32 q0 8 -8 8 h-38 l-16 14 v-14 h-12 q-8 0 -8 -8 v-32 q0 -8 8 -8z'/><path d='M48 82 h46 q8 0 8 8 v14 l-10 -8 h-36 q-8 0 -8 -8z'/>"
def eye(): return f"<path d='M10 60 q50 -50 100 0 q-50 50 -100 0z'/><circle cx='60' cy='60' r='16' fill='{GOLD}'/>"
def pin(): return f"<path d='M60 110 q-36 -40 -36 -62 a36 36 0 0 1 72 0 q0 22 -36 62z'/><circle cx='60' cy='48' r='12' fill='{RED}' stroke='none'/>"
def building(): return "<rect x='28' y='14' width='64' height='96'/>" + ''.join(f"<rect x='{x}' y='{y}' width='12' height='12'/>" for x in (38, 70) for y in (26, 48, 70)) + "<rect x='52' y='86' width='16' height='24'/>"
def drop(): return "<path d='M60 14 q-36 46 -36 66 a36 36 0 0 0 72 0 q0 -20 -36 -66z' fill='#5a8fb0'/><path d='M44 82 q0 12 12 16' stroke='#fff'/>"
def container(): return f"<path d='M30 30 h44 l16 16 v58 q0 6 -6 6 h-54 q-6 0 -6 -6 v-68 q0 -6 6 -6z'/><path d='M74 30 v-12 h-16 v12'/><path d='M36 70 h48' stroke='{GOLD}'/>"
def number(n): return f"<circle cx='60' cy='60' r='42' fill='{SOFT}'/><text x='60' y='76' text-anchor='middle' {FONT} font-size='46' font-weight='800' fill='{INK}' stroke='none'>{n}</text>"

# parole → pittogramma (il primo che corrisponde vince)
RULES = [
    (r'^(evita|mai |attenzione|non usare|non toccare|non accendere)', warn),
    (r'rubinett|contatore|quadro', B.gas_valve),
    (r'etichett', docs),
    (r'trasportin|animal|cane|gatto|veterinar', paw),
    (r'\b(112|118|115|113|chiama|telefon|cellular|sms|smartphone)', lambda: B.phone()),
    (r'radio|notizie|autoradio|onde corte|dab', B.radio),
    (r'generatore', B.generator),
    (r'monossido|\bco\b|rilevator', B.detector),
    (r'candeggina|cloro', B.bleach),
    (r'bollit|bollore|bolli', B.pot),
    (r'filtr', B.filt),
    (r'temperatur|°c', lambda: B.thermo('°C')),
    (r'tanich|bidon|cistern|contenitor|bottigli', container),
    (r'acqua|bere|potabil|pioggia|pozz', drop),
    (r'farmac|medicin|pillol|antibiot|cortison', B.pills),
    (r'kit medico|garze|bend|cerott|laccio|ferit|emorragi|soccors', medkit),
    (r'fuoco|fiamm|incendi|brace|legna|accend', fire),
    (r'freddo|ipotermi|gelo|neve', snow),
    (r'caldo|sole|solare|calore', sun),
    (r'pannell', solar),
    (r'\bbatteri[ae]\b|power ?bank|ricaric|\bpile\b', battery),
    (r'animal|cane|gatto|veterinar|trasportino', paw),
    (r'bambin|famigli|figli|genitor', family),
    (r'zaino|go-bag|gobag', backpack),
    (r'document|copie|carta d|passaport|poliz', docs),
    (r'contant|soldi|banconot|bancomat|pagament', cash),
    (r'mapp|percors|strad|evacua|destinazion', mapi),
    (r'nord|sud|orient|bussola|stell|ombra|rotta', compass),
    (r'paura|stress|ansia|emozion|tristezz|calma|abbracc', heart),
    (r'nod|corda|cordino|legatur', rope),
    (r'ripar|tenda|rifugio|baita', tent),
    (r'pesc', fish),
    (r'piant|bacch|fungh|erb|fogli', leaf),
    (r'semi|orto|coltiv|germogl', seed),
    (r'sale|salat|salamoia', salt),
    (r'vasett|barattol|conserv|scort|dispens', jar),
    (r'frigo|freezer', B.fridge),
    (r'\bcibo|cucin|pasto|\bmangi', lambda: B.pot(fire=False)),
    (r'sacch|secchi', B.bags),
    (r'serratur|porta|chiud|sicurezza', lock),
    (r'internet|wi-?fi|rete', wifi_off),
    (r'computer|password|account|dati|hacker|informatic|email|backup', computer),
    (r'fischiett|segnal|sos', whistle),
    (r'specchi', mirror),
    (r'calendari|ogni mese|ogni anno|scadenz|giorni|settiman', calendar),
    (r'vicin|comunit|volontar|gruppo', family),
    (r'mani|lav', B.wash),
    (r'osserv|guarda|controlla|verifica', eye),
    (r'punto di ritrovo|ritrovo|luogo', pin),
    (r'casa|stanza|edifici|abitazion', building),
    (r'non |mai |evita|pericol|attenzione', warn),
]

def pick_icon(text, gid, idx):
    t = text.lower()
    for rx, fn in RULES:
        if re.search(rx, t):
            return fn()
    return number(idx + 1)

def first_sentence(t):
    m = re.match(r'(.+?[.!?])(\s|$)', t)
    return m.group(1) if m else t

def caption(t, maxlen):
    t = re.sub(r'\s+', ' ', t).strip()
    if len(t) <= maxlen:
        return t
    f = first_sentence(t)
    if len(f) <= maxlen:
        return f
    # frase unica troppo lunga: la parte prima dei due punti o del trattino, se c'è
    for sep in (': ', ' — ', ' – ', ' - '):
        if sep in f and len(f.split(sep)[0]) >= 12:
            head = f.split(sep)[0]
            if len(head) <= maxlen:
                return head + '…'
    return f[:maxlen - 1].rsplit(' ', 1)[0] + '…'

def build(sec):
    items = sec['steps'] or re.split(r'(?<=[.!?])\s+(?=[A-ZÀ-Ú0-9«"])', sec['content'] or '')
    items = [i for i in items if i.strip()]
    more = len(items) > 6
    items = items[:6]
    n = len(items)
    cols = n if n <= 3 else (2 if n == 4 else 3)
    rows = (n + cols - 1) // cols
    maxl = 6 if n <= 3 else 5               # righe massime per riquadro
    top, bottom = 118, (40 if more else 16)
    ch = (H - top - bottom) / rows
    cw = (W - 40) / cols
    wrapn = 34 if cols <= 2 else 30
    maxlen = wrapn * maxl - 8
    src = (sec['source'] or '').split('·')[0].strip()
    s = [f"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {W} {H}' width='{W}' height='{H}' role='img' aria-label='{esc(sec['heading'])}'>",
         f"<rect width='{W}' height='{H}' fill='{BG}'/>",
         f"<rect x='10' y='10' width='{W-20}' height='{H-20}' fill='none' stroke='{INK}' stroke-width='3' rx='6'/>"]
    title = sec['heading'].upper()
    tsize = 36 if len(title) <= 34 else (30 if len(title) <= 44 else 24)
    s.append(f"<text x='{W/2}' y='58' text-anchor='middle' {FONT} font-size='{tsize}' font-weight='800' fill='{INK}'>{esc(title)}</text>")
    s.append(f"<text x='{W/2}' y='92' text-anchor='middle' {FONT} font-size='19' fill='{GOLD}'>{esc(sec['guide'])}{(' (' + esc(src) + ')') if src else ''}</text>")
    for i, it in enumerate(items):
        r, c = divmod(i, cols)
        rowcount = cols if r < rows - 1 else n - cols * (rows - 1)
        x = 20 + (cols - rowcount) * cw / 2 + c * cw
        cap = caption(it, maxlen)
        lines = textwrap.wrap(cap, wrapn)
        while len(lines) > maxl:            # mai tagliare in silenzio: accorcia e segna con …
            words = cap.rstrip('…').split(' ')
            cap = ' '.join(words[:-1]).rstrip(',;:') + '…'
            lines = textwrap.wrap(cap, wrapn)
        text_h = 20 * len(lines)
        scale = max(0.55, min(1.25 if rows > 1 else 1.5, (ch - text_h - 34) / 120))
        block = 120 * scale + 14 + text_h
        y = top + r * ch + max(0, (ch - block) / 2)
        pic = pick_icon(it, sec['key'].split('--')[0], i)
        s.append(f"<g transform='translate({x + cw/2 - 60*scale:.1f},{y:.1f}) scale({scale:.3f})'><g fill='none' stroke='{INK}' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'>{pic}</g></g>")
        s.append(f"<circle cx='{x + 24}' cy='{y + 14}' r='14' fill='{GOLD}'/><text x='{x + 24}' y='{y + 20}' text-anchor='middle' {FONT} font-size='17' font-weight='800' fill='#fff'>{i+1}</text>")
        ty = y + 120 * scale + 30
        for k, ln in enumerate(lines):
            s.append(f"<text x='{x + cw/2:.1f}' y='{ty + k*20:.1f}' text-anchor='middle' {FONT} font-size='16' font-weight='{700 if k == 0 else 500}' fill='{INK}'>{esc(ln)}</text>")
    if more:
        s.append(f"<text x='{W/2}' y='{H-24}' text-anchor='middle' {FONT} font-size='17' font-weight='700' fill='{GOLD}'>Altri passi nel testo qui sotto</text>")
    s.append('</svg>')
    return '\n'.join(s)

NODE = r"""
global.Storage={get:()=>false};
eval(require('fs').readFileSync(process.argv[1]+'/js/data/guides.js','utf8')+';global.G=GUIDES_DATA;global.H=GUIDE_IMG_HIDDEN;global.C=GUIDE_CAUTION;');
const fs=require('fs');const out=[];
G.forEach(g=>(g.sections||[]).forEach(s=>{const slug=s.heading.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);const k=g.id+'--'+slug;
 const webp=fs.existsSync(process.argv[1]+'/js/images/guides/'+k+'.webp')&&!H.has(k);
 out.push({hidden:H.has(k),caution:!!C[g.id],key:k,guide:g.title,source:g.source,heading:s.heading,steps:s.steps||null,content:s.content||null,webp})}));
process.stdout.write(JSON.stringify(out));
"""

# Sezioni da NON illustrare finché il testo non è deciso dal titolare (vedi note-interne):
# farmaci e kit medico (antibiotici, farmaci scaduti), test di commestibilità delle piante.
EXCLUDE = ('farmaci-scorta--', 'kit-medico--', 'survival-piante--test-universale',
           'comm-piano-famiglia--', 'acqua-stoccaggio--', 'cibo-scorte-piano--', 'orto-emergenza--',
           'evacuazione-piano--livelli')   # livelli e tempi di evacuazione senza fonte
# (piano famiglia, stoccaggio acqua, piano scorte e orto: numeri senza fonte già segnalati, da decidere)
# Le guide «Cautela» (GUIDE_CAUTION) non si illustrano: il loro testo non è ancora verificato
# e contiene numeri senza fonte; uno schema li renderebbe più credibili.

# Sezioni la cui illustrazione è stata nascosta per il contenuto: il loro testo ha gli stessi
# dati non verificati, quindi niente schema. Eccezioni: testo già riscritto su fonti ufficiali,
# o illustrazione nascosta solo per un difetto del disegno.
HIDDEN_OK = ('acqua-purificazione--perch-ogni-fonte-sospetta', 'community-resilienza--costruire-la-rete-locale')

def main():
    data = json.loads(subprocess.check_output(['node', '-e', NODE, ROOT]))
    manual = {f"{gid}--{B.slug(h)}" for gid, h in B.SVGS}
    keys = []
    for sec in data:
        if sec['webp'] or sec['key'] in manual or sec['key'].startswith(EXCLUDE) or sec['caution'] or (sec['hidden'] and sec['key'] not in HIDDEN_OK):
            continue
        with open(os.path.join(B.OUT, sec['key'] + '.svg'), 'w', encoding='utf-8') as f:
            f.write(build(sec))
        keys.append(sec['key'])
    print('\n'.join(keys))

if __name__ == '__main__':
    main()
