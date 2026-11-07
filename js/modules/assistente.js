/* ============================================================
   Assistente — domande in linguaggio naturale sulle guide dell'app
   Fase 1: ricerca locale (100% offline, ogni telefono).
   Risponde SOLO con testi presenti nell'app (guide e piani degli
   scenari), sempre con la fonte e l'eventuale avviso di cautela.
   Fase 2 (in valutazione): modello AI locale, solo su dispositivi capaci.
   ============================================================ */
const AssistenteModule = (() => {

  let index = null;          // { chunks, df, avgLen }
  const history = [];        // [{ q, results }]

  /* ── TESTO ── */
  const STOP = new Set(('a ad al allo ai agli alla alle anche avere c che chi ci come con contro cosa cui da dal dallo dai dagli dalla dalle '
    + 'dei degli del della delle dello di dove e ed era essere fa fare gli ha hai ho i il in io la le lo loro ma me mi mia mio '
    + 'ne negli nei nel nella nelle nello noi non o per perche piu po poi puo qua quale quali quando quanto quanti quanta '
    + 'quante quello questa questo qui se sei si sia sono su sua sue sui sul sulla suo ti tra tu tua tuo un una uno vi voi '
    + 'devo deve devono posso puoi bisogna serve servono fare cosa come dovrei meglio faccio facciamo molto hanno sempre ancora rendo rendere rende').split(' '));

  // Sinonimi di ricerca (aiutano a trovare la guida giusta, non aggiungono contenuti)
  const SYN = {
    sisma: 'terremoto', scossa: 'terremoto', terremot: 'terremoto',
    corrente: 'blackout', luce: 'blackout', elettricita: 'blackout',
    sangue: 'emorragia', sanguina: 'emorragia', ferito: 'ferita',
    potabil: 'acqua purificazione', purific: 'purificazione', bere: 'acqua', sete: 'acqua',
    mangiare: 'cibo', fame: 'cibo', viveri: 'cibo', scorte: 'scorta',
    freddo: 'ipotermia', gelo: 'ipotermia', scaldarsi: 'riscaldamento',
    radioattiv: 'nucleare', radiazioni: 'nucleare', atomic: 'nucleare',
    guerra: 'conflitto', bombardamento: 'conflitto', allarme: 'allerta',
    hacker: 'cyberattacco', informatico: 'cyberattacco', bancomat: 'contanti pagamenti',
    inondazione: 'alluvione', allagamento: 'alluvione', fuoco: 'incendio',
    zaino: 'kit', borsa: 'kit', medicine: 'farmaci', medicinali: 'farmaci',
    telefono: 'comunicazione', walkie: 'pmr', ricetrasmittente: 'pmr',
  };

  function norm(s) {
    return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  }
  function stem(w) {
    if (w.length > 5) w = w.replace(/(azione|azioni|mente|ment|ando|endo|are|ere|ire|ato|ata|ati|ate|uto|uta|ito|ita)$/, '');
    if (w.length > 4) w = w.replace(/[aeio]$/, '');
    return w.slice(0, 7);
  }
  function tokens(s) {
    const out = [];
    for (let w of norm(s).split(/[^a-z0-9]+/)) {
      if (!w || w.length < 2 || STOP.has(w)) continue;
      const pre = SYN[w] ? null : Object.keys(SYN).find(k => k.length >= 6 && w.startsWith(k));
      const syn = SYN[w] || (pre && SYN[pre]);
      out.push(stem(w));
      if (syn) syn.split(' ').forEach(x => out.push(stem(x)));
    }
    return out;
  }

  /* ── INDICE ── */
  function _build() {
    const chunks = [];
    // titolo e intestazione contano di più del testo (ripetuti nell'indice)
    const add = (c) => {
      const t = c.title.replace(/^Piano: /, '');
      c.toks = tokens([t, t, t, c.heading || '', c.heading || '', c.text].join(' '));
      c.ttoks = new Set(tokens(t));
      chunks.push(c);
    };
    (typeof GUIDES_DATA !== 'undefined' ? GUIDES_DATA : []).forEach(g => {
      if (g.quickRef?.length) add({ kind: 'guide', id: g.id, title: g.title, heading: 'In breve', items: g.quickRef, text: g.quickRef.join(' '), source: g.source });
      (g.sections || []).forEach(s => {
        const items = s.steps || null;
        add({ kind: 'guide', id: g.id, title: g.title, heading: s.heading, items, body: s.content || '', text: (s.content || '') + ' ' + (items || []).join(' '), source: g.source });
      });
    });
    (window.SCENARI_LIST || []).forEach(sc => {
      (sc.steps || []).forEach(f => add({ kind: 'scenario', id: sc.id, title: 'Piano: ' + sc.titolo, heading: f.fase, items: f.azioni, text: sc.titolo + ' ' + (f.azioni || []).join(' ') }));
    });
    const df = new Map();
    let tot = 0;
    chunks.forEach(c => { tot += c.toks.length; new Set(c.toks).forEach(t => df.set(t, (df.get(t) || 0) + 1)); });
    index = { chunks, df, avgLen: tot / Math.max(1, chunks.length) };
  }

  // BM25
  function search(q, k = 3) {
    if (!index) _build();
    const qt = [...new Set(tokens(q))];
    if (!qt.length) return [];
    const N = index.chunks.length, k1 = 1.2, b = 0.5;
    const scored = index.chunks.map(c => {
      let s = 0, hit = 0;
      qt.forEach(t => {
        const tf = c.toks.reduce((n, x) => n + (x === t), 0);
        if (!tf) return;
        hit++;
        const df = index.df.get(t) || 0;
        const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
        s += idf * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * c.toks.length / index.avgLen));
      });
      // i piani degli scenari pesano un po' meno delle guide (più generici)
      return { c, hit, s: s * (0.6 + 0.4 * hit / qt.length) * (c.kind === 'scenario' ? 0.85 : 1) * (1 + 0.4 * qt.filter(t => c.ttoks.has(t)).length) };
    })
      // con 3+ parole utili ne devono comparire almeno 2 (evita risposte fuori tema)
      .filter(x => x.s > 0 && (qt.length < 3 || x.hit >= 2)).sort((a, b) => b.s - a.s);
    if (!scored.length) return [];
    const top = scored[0].s, seen = new Set(), res = [];
    for (const x of scored) {
      if (x.s < top * 0.35) break;
      const key = x.c.id + '|' + x.c.heading;
      if (seen.has(key)) continue;
      seen.add(key); res.push(x.c);
      if (res.length >= k) break;
    }
    return res;
  }

  /* ── UI ── */
  const esc = s => (typeof Utils !== 'undefined' && Utils.escapeHtml) ? Utils.escapeHtml(s) : String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));

  function _suggestions() {
    const sid = (typeof SettingsModule !== 'undefined') ? SettingsModule.get().scenario_id : null;
    const sc = (window.SCENARI_LIST || []).find(s => s.id === sid);
    const base = ['Come rendo potabile l\'acqua?', 'Cosa metto nello zaino di emergenza?', 'Come fermo un\'emorragia?', 'Cosa faccio se manca la corrente?'];
    return sc ? [`Cosa faccio in caso di ${sc.titolo.toLowerCase()}?`, ...base.slice(0, 3)] : base;
  }

  function _caution(c) {
    if (c.kind !== 'guide' || typeof GUIDE_CAUTION === 'undefined' || !GUIDE_CAUTION[c.id]) return '';
    return `<div class="as-caution"><i class="ph ph-warning"></i> Guida con etichetta «Cautela»: indicazioni non ancora verificate su fonti ufficiali. Usale con prudenza.</div>`;
  }

  function _card(c) {
    const body = c.items
      ? `<ul class="as-list">${c.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`
      : `<p>${esc(c.body || '')}</p>`;
    const open = c.kind === 'guide'
      ? `<button class="as-open" onclick="GuideModule.openGuide('${c.id}')"><i class="ph ph-book-open"></i> Apri la guida</button>`
      : `<button class="as-open" onclick="AssistenteModule.openScenario('${c.id}')"><i class="ph ph-siren"></i> Apri in Emergenza</button>`;
    return `<div class="as-card">
      <div class="as-src"><i class="ph ${c.kind === 'guide' ? 'ph-book-open-text' : 'ph-list-checks'}"></i> ${esc(c.title)} · <span>${esc(c.heading || '')}</span></div>
      ${_caution(c)}${body}${open}
    </div>`;
  }

  function _renderThread() {
    const el = document.getElementById('as-thread');
    if (!el) return;
    if (!history.length) {
      el.innerHTML = `<div class="as-empty">
        <p>Fai una domanda con parole tue. Ti rispondo con i passaggi delle guide di questa app, indicando sempre da dove vengono. Funziona senza internet.</p>
        <div class="as-chips">${_suggestions().map(s => `<button class="as-chip" onclick="AssistenteModule.ask(this.textContent)">${esc(s)}</button>`).join('')}</div>
      </div>`;
      return;
    }
    el.innerHTML = history.map(h => `
      <div class="as-q"><span>${esc(h.q)}</span></div>
      <div class="as-a">${h.results.length
        ? `<p class="as-lead">Ho trovato ${h.results.length === 1 ? 'questo passaggio' : 'questi passaggi'} nelle guide:</p>${h.results.map(_card).join('')}`
        : `<p class="as-lead">Non ho trovato nulla nelle guide su questo. Prova con altre parole, oppure sfoglia le <button class="as-link" onclick="navigateTo('guide')">Guide</button>.</p>`}
      </div>`).join('');
    el.lastElementChild?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function ask(q) {
    q = String(q || '').trim();
    if (!q) return;
    history.push({ q, results: search(q, 3) });
    if (history.length > 20) history.shift();
    const inp = document.getElementById('as-input');
    if (inp) inp.value = '';
    _renderThread();
  }

  function submit(ev) {
    ev.preventDefault();
    ask(document.getElementById('as-input')?.value);
    return false;
  }

  function clear() { history.length = 0; _renderThread(); }

  function openScenario(id) {
    if (typeof SettingsModule !== 'undefined') {
      const p = SettingsModule.get();
      if (p.scenario_id !== id) { p.scenario_id = id; Storage.set('profilo', p); }
    }
    navigateTo('strumenti');
  }

  /* ── FASE 2: compatibilità per l'AI locale (solo verifica, nessun download) ── */
  async function _capability() {
    const out = { webgpu: false, memGB: navigator.deviceMemory || null };
    try { out.webgpu = !!(navigator.gpu && await navigator.gpu.requestAdapter()); } catch (e) {}
    out.ok = out.webgpu && (out.memGB == null || out.memGB >= 4);
    return out;
  }
  async function _renderCapability() {
    const el = document.getElementById('as-ai');
    if (!el) return;
    const c = await _capability();
    el.innerHTML = `<i class="ph ph-cpu"></i><div><strong>Risposte scritte dall'AI (in arrivo)</strong>
      <span>${c.ok ? 'Questo dispositivo sembra adatto: quando sarà pronta potrai attivarla.' : 'Su questo dispositivo resterà attiva la ricerca nelle guide, che funziona ovunque.'}</span></div>`;
  }

  function init() {
    const root = document.getElementById('assistente-root');
    if (!root) return;
    if (!root.dataset.ready) {
      root.innerHTML = `
        <div class="as-warn"><i class="ph ph-phone-call"></i> In pericolo? Chiama subito il <a href="tel:112">112</a>.</div>
        <div id="as-thread" class="as-thread" aria-live="polite"></div>
        <form class="as-form" onsubmit="return AssistenteModule.submit(event)">
          <input id="as-input" type="text" enterkeyhint="send" autocomplete="off" placeholder="Scrivi la tua domanda…" aria-label="La tua domanda">
          <button type="submit" class="as-send" aria-label="Chiedi"><i class="ph ph-paper-plane-right"></i></button>
        </form>
        <div class="as-foot">
          <button class="as-link" onclick="AssistenteModule.clear()"><i class="ph ph-trash"></i> Nuova conversazione</button>
        </div>
        <div id="as-ai" class="as-ai"></div>`;
      root.dataset.ready = '1';
    }
    _renderThread();
    _renderCapability();
  }

  return { init, ask, submit, clear, search, openScenario };
})();
