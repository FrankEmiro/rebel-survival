/* ============================================================
   i18n — lingua dell'interfaccia (it = originale, en = traduzione)
   Come funziona: i testi restano scritti in italiano nel codice. Se la lingua
   è l'inglese, ogni testo che compare a schermo viene sostituito con la voce
   del dizionario (js/data/i18n/en.js: oggetto RS_EN, più RS_EN_PAT per i testi
   con numeri). Un testo senza voce nel dizionario resta in italiano.
   Per aggiungere una lingua: nuovo file dizionario + riga in LANGS.
   ============================================================ */
const I18n = (() => {
  const LANGS = { it: 'Italiano', en: 'English' };   // nomi mostrati nei selettori
  const KEY = 'kit-resilienza:lang';
  let lang = 'it';
  try { const v = JSON.parse(localStorage.getItem(KEY)); if (LANGS[v]) lang = v; } catch {}

  // Le guide hanno un dizionario a parte (grande): si carica solo se la lingua è l'inglese
  if (lang === 'en' && !window.RS_EN_GUIDES) document.write('<script src="js/data/i18n/en_guides.js"><\/script>');
  const dict = () => window.RS_EN || {};
  const gdict = () => window.RS_EN_GUIDES || {};
  const pats = () => window.RS_EN_PAT || [];
  const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];
  const SKIP = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'CODE']);

  // Traduce una stringa (null se non c'è voce)
  function tr(s) {
    const m = s.match(/^(\s*)([\s\S]*?)(\s*)$/);
    const core = m[2].replace(/\s+/g, ' ');
    if (!core) return null;
    let out = dict()[core];
    if (out === undefined) out = gdict()[core];
    if (out === undefined) {
      for (const [re, rep] of pats()) { if (re.test(core)) { out = core.replace(re, rep); break; } }
    }
    return out === undefined ? null : m[1] + out + m[3];
  }

  // Per i testi costruiti dal codice (alert, conferme): I18n.t('testo italiano')
  function t(s) { if (lang === 'it') return s; const r = tr(String(s)); return r === null ? s : r.trim(); }

  function walk(root) {
    if (lang === 'it' || !root) return;
    if (root.nodeType === 3) { fixText(root); return; }
    if (root.nodeType !== 1 || SKIP.has(root.tagName)) return;
    fixAttrs(root);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: n => (n.nodeType === 1 && SKIP.has(n.tagName)) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    let n;
    while ((n = w.nextNode())) { if (n.nodeType === 3) fixText(n); else fixAttrs(n); }
  }
  function fixText(node) {
    const r = tr(node.nodeValue);
    if (r !== null && r !== node.nodeValue) node.nodeValue = r;
  }
  function fixAttrs(el) {
    for (const a of ATTRS) {
      const v = el.getAttribute && el.getAttribute(a);
      if (v) { const r = tr(v); if (r !== null && r !== v) el.setAttribute(a, r.trim()); }
    }
  }

  function init() {
    document.documentElement.lang = lang;
    if (lang === 'it') return;
    // Pagine legali: in inglese i link aprono la versione inglese (legal/en/)
    const LEGAL_EN = { 'privacy.html': 'privacy.html', 'condizioni.html': 'terms.html', 'licenze.html': 'licenses.html' };
    document.addEventListener('click', e => {
      const a = e.target.closest && e.target.closest('a[href^="/legal/"], a[href^="legal/"]');
      if (!a) return;
      const m = a.getAttribute('href').match(/^\/?legal\/([a-z]+\.html)$/);
      if (m && LEGAL_EN[m[1]]) a.setAttribute('href', '/legal/en/' + LEGAL_EN[m[1]]);
    }, true);
    const meta = document.querySelector('meta[name="description"]');
    if (meta) { const r = tr(meta.content); if (r) meta.content = r.trim(); }
    const tt = tr(document.title); if (tt) document.title = tt.trim();
    walk(document.body);
    new MutationObserver(muts => {
      for (const m of muts) {
        if (m.type === 'characterData') fixText(m.target);
        else if (m.type === 'attributes') fixAttrs(m.target);
        else m.addedNodes.forEach(walk);
      }
    }).observe(document.body, { childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS });
  }

  function get() { return lang; }
  // Cambia lingua e ricarica la pagina (il modo più semplice per rifare tutti i testi)
  function set(l) {
    if (!LANGS[l] || l === lang) return;
    try { localStorage.setItem(KEY, JSON.stringify(l)); } catch {}
    location.reload();
  }
  // Menu a tendina per scegliere la lingua (nomi sempre nella loro lingua)
  function select(id, extra) {
    return `<select ${id ? `id="${id}"` : ''} class="ob-select" aria-label="Lingua / Language" onchange="I18n.set(this.value)" ${extra || ''}>` +
      Object.entries(LANGS).map(([k, n]) => `<option value="${k}"${k === lang ? ' selected' : ''}>${n}</option>`).join('') + '</select>';
  }

  return { init, get, set, t, tr, select, LANGS };
})();
window.I18n = I18n;
