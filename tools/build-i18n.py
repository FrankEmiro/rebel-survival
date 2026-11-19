#!/usr/bin/env python3
"""Genera js/data/i18n/en.js (e en_guides.js dalle guide) dai file di traduzione tools/i18n/en_*.txt (una riga: testo italiano ||| inglese)
e da tools/i18n/en_pat.js (testi con numeri, scritti come espressioni regolari).
Uso: python3 -I tools/build-i18n.py"""
import glob, json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = os.path.join(ROOT, 'tools', 'i18n')
d = {}
for f in sorted(glob.glob(os.path.join(src, 'en_*.txt'))):
    for n, line in enumerate(open(f, encoding='utf-8'), 1):
        line = line.rstrip('\n')
        if not line.strip() or line.startswith('#'): continue
        if ' ||| ' not in line: print('riga senza |||:', f, n); sys.exit(1)
        it, en = line.split(' ||| ', 1)
        it = re.sub(r'\s+', ' ', it.strip())
        en = en.strip()
        d[it] = en.replace('␣', ' ') if '␣' in en else en  # ␣ = spazio finale/iniziale voluto
pat = open(os.path.join(src, 'en_pat.js'), encoding='utf-8').read()
out = ('/* Generato da tools/build-i18n.py: NON modificare a mano (modifica tools/i18n/ e rilancia lo script). */\n'
       'window.RS_EN = ' + json.dumps(d, ensure_ascii=False, indent=0) + ';\n' + pat + '\n')
open(os.path.join(ROOT, 'js', 'data', 'i18n', 'en.js'), 'w', encoding='utf-8').write(out)
print(len(d), 'voci')

# Guide: tools/i18n/guides_en_*.txt -> js/data/i18n/en_guides.js (caricato solo se la lingua è l'inglese)
g = {}
for f in sorted(glob.glob(os.path.join(src, 'guides_en_*.txt'))):
    for n, line in enumerate(open(f, encoding='utf-8'), 1):
        line = line.rstrip('\n')
        if not line.strip() or line.startswith('#'): continue
        if ' ||| ' not in line: print('riga senza |||:', f, n); sys.exit(1)
        it, en = line.split(' ||| ', 1)
        g[re.sub(r'\s+', ' ', it.strip())] = en.strip()
out = ('/* Generato da tools/build-i18n.py: NON modificare a mano (modifica tools/i18n/guides_en_*.txt e rilancia lo script). */\n'
       'window.RS_EN_GUIDES = ' + json.dumps(g, ensure_ascii=False, indent=0) + ';\n')
open(os.path.join(ROOT, 'js', 'data', 'i18n', 'en_guides.js'), 'w', encoding='utf-8').write(out)
print(len(g), 'voci guide')
