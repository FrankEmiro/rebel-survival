/* ============================================================
   Wikipedia offline — l'utente sceglie quali pacchetti scaricare
   (nessuno è incluso di base). I file ZIM di Kiwix vengono salvati
   nel telefono (OPFS) a pezzi da 16 MB: il download riprende da dove
   si era fermato. Si può anche importare un file .zim già sul telefono
   (per esempio ricevuto via Bluetooth). Lettura: js/modules/zim.js.
   Contenuti: Wikipedia, licenza CC BY-SA 4.0, pacchetti di Kiwix.
   ============================================================ */
const WikiModule = (() => {
  const ROOT_DIR = 'rs-zim', SIZE = 16 * 1048576, IDLE_MS = 60000, TRIES = 8, CONC = 3;   // CONC: pezzi scaricati insieme (più veloce con server lenti)
  const LIST_URL = 'https://lb.download.kiwix.org/zim/wikipedia/';        // elenco file (CORS aperto)
  const FILE_URL = 'https://mirror.download.kiwix.org/zim/wikipedia/';    // download (CORS + Range)

  // pacchetti in italiano, dal più piccolo al più grande
  const FLAVOURS = [
    { key: 'medicine_nopic', label: 'Medicina — solo testo',                  desc: 'Malattie, sintomi, farmaci, primo soccorso. Senza immagini.' },
    { key: 'top_mini',       label: 'Voci più importanti — riassunto',        desc: 'Le voci più lette, solo la parte iniziale.' },
    { key: 'medicine_maxi',  label: 'Medicina — con immagini',                desc: 'Come «Medicina — solo testo», con immagini e schemi.' },
    { key: 'top_nopic',      label: 'Voci più importanti — testo completo',   desc: 'Le voci più lette, intere, senza immagini.' },
    { key: 'all_mini',       label: 'Tutta Wikipedia — riassunto',            desc: 'Tutte le voci, solo la parte iniziale.' },
    { key: 'top_maxi',       label: 'Voci più importanti — con immagini',     desc: 'Le voci più lette, intere, con immagini.' },
    { key: 'all_nopic',      label: 'Tutta Wikipedia — testo completo',       desc: 'Tutte le voci intere, senza immagini.' },
    { key: 'all_maxi',       label: 'Tutta Wikipedia — completa',             desc: 'Tutte le voci con immagini. Serve molto spazio.' },
  ];
  // se non c'è internet per leggere l'elenco aggiornato (date e dimensioni del 15/11/2026)
  const FALLBACK_IT = {
    medicine_nopic: ['wikipedia_it_medicine_nopic_2026-10.zim', '98M'],
    top_mini:       ['wikipedia_it_top_mini_2026-10.zim', '114M'],
    medicine_maxi:  ['wikipedia_it_medicine_maxi_2026-10.zim', '261M'],
    top_nopic:      ['wikipedia_it_top_nopic_2026-10.zim', '898M'],
    all_mini:       ['wikipedia_it_all_mini_2026-11.zim', '3.3G'],
    top_maxi:       ['wikipedia_it_top_maxi_2026-10.zim', '3.2G'],
    all_nopic:      ['wikipedia_it_all_nopic_2026-08.zim', '8.4G'],
    all_maxi:       ['wikipedia_it_all_maxi_2026-08.zim', '30G'],
  };
  // inglese: solo i pacchetti piccoli e medi (i «tutta Wikipedia» pesano da 13 a 119 GB)
  const FALLBACK_EN = {
    medicine_nopic: ['wikipedia_en_medicine_nopic_2026-10.zim', '1.0G'],
    top_mini:       ['wikipedia_en_top_mini_2026-09.zim', '283M'],
    medicine_maxi:  ['wikipedia_en_medicine_maxi_2026-10.zim', '1.7G'],
    top_nopic:      ['wikipedia_en_top_nopic_2026-09.zim', '2.6G'],
    top_maxi:       ['wikipedia_en_top_maxi_2026-09.zim', '6.5G'],
  };
  const LANGS = { it: { name: 'Italiano', fb: FALLBACK_IT, keys: null }, en: { name: 'Inglese', fb: FALLBACK_EN, keys: Object.keys(FALLBACK_EN) } };
  const getLang = () => (Storage.get('wiki-lang') === 'en' ? 'en' : 'it');
  const flavoursOf = lang => FLAVOURS.filter(f => !LANGS[lang].keys || LANGS[lang].keys.includes(f.key));

  let catalog = {};             // lingua → { key: [file, sizeLabel] }
  let busy = null;              // { name, pct, abort }
  let reader = null;            // { name, z, title, history: [], urls: [] }
  const esc = s => Utils.escapeHtml(String(s ?? ''));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const supported = () => !window.RS_OFFLINE_COPY && !!(navigator.storage && navigator.storage.getDirectory)
    && typeof FileSystemFileHandle !== 'undefined' && 'createWritable' in FileSystemFileHandle.prototype;
  const partName = i => 'p' + String(i).padStart(5, '0');
  const fmt = b => b >= 1073741824 ? (b / 1073741824).toFixed(1).replace('.', ',') + ' GB' : Math.round(b / 1048576) + ' MB';

  /* ── archivio nel telefono ── */
  const rootDir = async () => (await navigator.storage.getDirectory()).getDirectoryHandle(ROOT_DIR, { create: true });
  const bookDir = async (name, create = false) => (await rootDir()).getDirectoryHandle(name, { create });
  async function readJson(d, f) { try { return JSON.parse(await (await (await d.getFileHandle(f)).getFile()).text()); } catch (e) { return null; } }
  async function writeFile(d, f, blob) { const w = await (await d.getFileHandle(f, { create: true })).createWritable(); await w.write(blob); await w.close(); }
  async function sizeOf(d, f) { try { return (await (await d.getFileHandle(f)).getFile()).size; } catch (e) { return -1; } }
  const span = (meta, i) => [i * SIZE, Math.min(meta.total, (i + 1) * SIZE)];

  async function books() {
    const out = [];
    try {
      for await (const [name, h] of (await rootDir()).entries()) {
        if (h.kind !== 'directory') continue;
        const meta = await readJson(h, 'meta.json');
        if (meta) out.push({ name, meta });
      }
    } catch (e) { /* niente */ }
    return out.sort((a, b) => a.meta.total - b.meta.total);
  }

  async function bookBlob(name) {
    const d = await bookDir(name), meta = await readJson(d, 'meta.json');
    if (!meta || !meta.done) return null;
    const files = [];
    for (let i = 0; i < meta.n; i++) files.push(await (await d.getFileHandle(partName(i))).getFile());
    const b = new Blob(files);
    return b.size === meta.total ? b : null;
  }

  /* ── elenco pacchetti disponibili ── */
  async function loadCatalog(lang = getLang()) {
    if (catalog[lang]) return catalog[lang];
    const skey = lang === 'it' ? 'wiki-catalog' : 'wiki-catalog-' + lang;
    catalog[lang] = Storage.get(skey) || { ...LANGS[lang].fb };
    if (!navigator.onLine) return catalog[lang];
    try {
      const html = await (await fetch(LIST_URL, { cache: 'no-store' })).text();
      const found = {};
      const re = new RegExp('(wikipedia_' + lang + '_([a-z]+_[a-z]+)_(\\d{4}-\\d{2})\\.zim)<\\/a>\\s+\\S+\\s+\\S+\\s+(\\S+)', 'g');
      let m;
      while ((m = re.exec(html))) {
        const [, file, key, date, size] = m;
        if (!flavoursOf(lang).some(f => f.key === key)) continue;
        if (!found[key] || found[key][2] < date) found[key] = [file, size, date];
      }
      if (Object.keys(found).length) {
        const c = {};
        Object.entries(found).forEach(([k, v]) => { c[k] = [v[0], v[1]]; });
        catalog[lang] = c;
        Storage.set(skey, c);
      }
    } catch (e) { /* resta l'elenco salvato */ }
    return catalog[lang];
  }
  const sizeLabel = s => String(s).replace(/G$/, ' GB').replace(/M$/, ' MB').replace('.', ',');
  const dateOf = file => (file.match(/_(\d{4})-(\d{2})\.zim$/) || []).slice(1).reverse().join('/');

  /* ── download a pezzi con ripresa ── */
  async function fetchPart(url, start, end, signal, onBytes) {
    const ac = new AbortController();
    const stop = () => ac.abort();
    signal.addEventListener('abort', stop, { once: true });
    let timer = setTimeout(stop, IDLE_MS);
    try {
      const res = await fetch(url, { headers: { Range: `bytes=${start}-${end - 1}` }, signal: ac.signal, cache: 'no-store' });
      if (res.status !== 206) throw new Error('HTTP ' + res.status);
      const rd = res.body.getReader(), parts = [];
      let got = 0;
      for (;;) {
        const { done, value } = await rd.read();
        if (done) break;
        clearTimeout(timer); timer = setTimeout(stop, IDLE_MS);
        parts.push(value); got += value.length; onBytes(got);
      }
      if (got !== end - start) throw new Error('pezzo incompleto');
      return new Blob(parts);
    } finally { clearTimeout(timer); signal.removeEventListener('abort', stop); }
  }

  async function download(key, lang = getLang()) {
    if (busy) return;
    if (!LANGS[lang]) lang = 'it';
    const cat = await loadCatalog(lang);
    const [file] = cat[key] || LANGS[lang].fb[key];
    const name = file.replace(/\.zim$/, ''), url = FILE_URL + file;
    const ac = new AbortController();
    busy = { name, pct: 0, abort: () => ac.abort(), msg: 'Preparo il download…' };
    render();
    // App Android: il download continua anche con l'app in secondo piano (notifica con l'avanzamento)
    const bg = window.RSAndroid && window.RSAndroid.bgStart ? window.RSAndroid : null;
    const bgTitle = 'Scarico Wikipedia';
    let bgLast = 0;
    try { bg && bg.bgStart(bgTitle); } catch (e) {}
    try {
      try { await navigator.storage.persist?.(); } catch (e) {}
      const d = await bookDir(name, true);
      let meta = await readJson(d, 'meta.json');
      if (!meta || meta.url !== url) {
        const res = await fetch(url, { headers: { Range: 'bytes=0-0' }, cache: 'no-store' });
        const total = +((res.headers.get('Content-Range') || '').split('/')[1] || 0);
        if (res.status !== 206 || !total) throw new Error('il server non risponde come previsto');
        const fl = FLAVOURS.find(f => f.key === key);
        meta = { url, file, key, lang, label: (fl ? fl.label : file) + (lang === 'en' ? ' (inglese)' : ''), total, n: Math.ceil(total / SIZE), done: false };
        await writeFile(d, 'meta.json', new Blob([JSON.stringify(meta)]));
      }
      const est = await navigator.storage.estimate?.();
      let have = 0;
      const missing = [];
      for (let i = 0; i < meta.n; i++) {
        const [s, e] = span(meta, i);
        if (await sizeOf(d, partName(i)) === e - s) have += e - s; else missing.push(i);
      }
      if (est && est.quota && est.quota - est.usage < (meta.total - have) * 1.02) {
        throw new Error(`spazio insufficiente: servono ${fmt(meta.total - have)}, ne restano ${fmt(est.quota - est.usage)}`);
      }
      const inflight = {};       // pezzo → byte già arrivati (per la barra di avanzamento)
      let lastMove = Date.now();
      const show = () => {
        lastMove = Date.now();
        const got = Object.values(inflight).reduce((x, y) => x + y, 0);
        busy.pct = Math.min(100, (have + got) / meta.total * 100); busy.msg = `${fmt(have + got)} di ${fmt(meta.total)}`; _progress();
        if (bg && Date.now() - bgLast > 2000) { bgLast = Date.now(); try { bg.bgProgress(bgTitle, busy.msg, Math.floor(busy.pct)); } catch (e) {} }
      };
      show();
      // se la pagina torna in primo piano e non si muove nulla da un po', riparte il pezzo bloccato
      const onVis = () => { if (!document.hidden && Date.now() - lastMove > 20000) busy.kick && busy.kick(); };
      document.addEventListener('visibilitychange', onVis);
      let fatal = null;
      const queue = missing.slice();
      const worker = async () => {
        while (queue.length && !fatal) {
          const i = queue.shift();
          const [s0, e0] = span(meta, i);
          for (let t = 1; ; t++) {
            // ogni tentativo ha un suo "kick" per poter essere riavviato
            const sub = new AbortController();
            const onAbort = () => sub.abort();
            ac.signal.addEventListener('abort', onAbort, { once: true });
            busy.kicks = busy.kicks || new Set();
            const kick = () => sub.abort();
            busy.kicks.add(kick);
            try {
              if (!navigator.onLine) await new Promise(r => window.addEventListener('online', r, { once: true }));
              inflight[i] = 0;
              const blob = await fetchPart(url, s0, e0, sub.signal, got => { inflight[i] = got; show(); });
              await writeFile(d, partName(i), blob);
              delete inflight[i]; have += blob.size; show();
              break;
            } catch (err) {
              delete inflight[i];
              if (ac.signal.aborted) { fatal = fatal || new Error('fermato'); return; }
              if (err && err.name === 'QuotaExceededError') { fatal = new Error('spazio finito sul telefono'); return; }
              if (t >= TRIES) { fatal = fatal || new Error('connessione assente o troppo lenta'); return; }
              await wait(3000 * Math.min(t, 5));
            } finally {
              busy && busy.kicks && busy.kicks.delete(kick);
              ac.signal.removeEventListener('abort', onAbort);
            }
          }
        }
      };
      busy.kick = () => { (busy.kicks || []).forEach(k => k()); };
      try {
        await Promise.all(Array.from({ length: Math.min(CONC, missing.length || 1) }, worker));
      } finally { document.removeEventListener('visibilitychange', onVis); }
      if (fatal) throw fatal;
      meta.done = true;
      await writeFile(d, 'meta.json', new Blob([JSON.stringify(meta)]));
      busy = null;
      render(`Scaricato: ${meta.label}.`);
    } catch (err) {
      busy = null;
      render(err.message === 'fermato' ? 'Download in pausa: tocca «Riprendi» per continuare da dove eri.'
        : 'Download interrotto (' + err.message + '). Le parti scaricate restano: tocca «Riprendi».');
    } finally {
      try { bg && bg.bgStop(); } catch (e) {}
    }
  }

  // file .zim già sul telefono (scaricato altrove o ricevuto via Bluetooth)
  function importFile() {
    if (busy) return;
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.zim';
    input.onchange = async () => {
      const f = input.files[0];
      if (!f) return;
      const name = f.name.replace(/\.zim$/i, '').replace(/[^A-Za-z0-9._-]/g, '_');
      const ac = new AbortController();
      busy = { name, pct: 0, abort: () => ac.abort(), msg: 'Copio il file…' };
      render();
      try {
        try { await navigator.storage.persist?.(); } catch (e) {}
        const head = new Uint8Array(await f.slice(0, 4).arrayBuffer());
        if ((head[0] | head[1] << 8 | head[2] << 16 | head[3] << 24) >>> 0 !== 72173914) throw new Error('non è un file ZIM');
        const d = await bookDir(name, true);
        const meta = { url: 'import', file: f.name, key: null, label: f.name, total: f.size, n: Math.ceil(f.size / SIZE), done: false };
        await writeFile(d, 'meta.json', new Blob([JSON.stringify(meta)]));
        for (let i = 0; i < meta.n; i++) {
          if (ac.signal.aborted) throw new Error('fermato');
          const [s, e] = span(meta, i);
          if (await sizeOf(d, partName(i)) !== e - s) await writeFile(d, partName(i), f.slice(s, e));
          busy.pct = e / meta.total * 100; busy.msg = `${fmt(e)} di ${fmt(meta.total)}`; _progress();
        }
        const z = await Zim.open(Zim.blobSource(await (async () => { meta.done = true; await writeFile(d, 'meta.json', new Blob([JSON.stringify(meta)])); return bookBlob(name); })()));
        const t = await Zim.metadata(z, 'Title');
        if (t) { meta.label = t; await writeFile(d, 'meta.json', new Blob([JSON.stringify(meta)])); }
        busy = null;
        render('File importato: ' + meta.label + '.');
      } catch (err) {
        busy = null;
        if (err.message === 'non è un file ZIM') { try { await (await rootDir()).removeEntry(name, { recursive: true }); } catch (e) {} }
        render('Importazione non riuscita: ' + err.message + '.');
      }
    };
    input.click();
  }

  async function remove(name) {
    try { await (await rootDir()).removeEntry(name, { recursive: true }); } catch (e) {}
    if (reader && reader.name === name) reader = null;
    render('Pacchetto eliminato.');
  }

  /* ── lettura ── */
  async function openBook(name) {
    const root = document.getElementById('wiki-root');
    root.innerHTML = '<p class="pf-note"><i class="ph ph-spinner"></i> Apro il pacchetto…</p>';
    try {
      const blob = await bookBlob(name);
      if (!blob) throw new Error('pacchetto incompleto');
      await _openSource(Zim.blobSource(blob), name);
    } catch (err) {
      reader = null;
      render('Non riesco ad aprire il pacchetto: ' + err.message + '.');
    }
  }
  // apre una sorgente qualsiasi (pacchetto nel telefono; per le prove anche HTTP)
  async function _openSource(src, name) {
    {
      const z = await Zim.open(src);
      const title = (await Zim.metadata(z, 'Title')) || name;
      reader = { name, z, title, history: [], urls: [] };
      _readerShell();
      const main = await Zim.mainEntry(z);
      if (main) await _show(main, true);
    }
  }

  function _readerShell() {
    const root = document.getElementById('wiki-root');
    root.innerHTML = `
      <div class="wiki-bar">
        <button class="btn btn-outline btn-sm" onclick="WikiModule.back()" aria-label="Indietro"><i class="ph ph-arrow-left"></i></button>
        <button class="btn btn-outline btn-sm" onclick="WikiModule.home()" aria-label="Pagina principale"><i class="ph ph-house"></i></button>
        <input id="wiki-q" type="search" placeholder="Cerca un titolo in ${esc(reader.title)}…" autocomplete="off"
          oninput="WikiModule._search(this.value)">
        <button class="btn btn-outline btn-sm" onclick="WikiModule.library()" aria-label="Pacchetti"><i class="ph ph-books"></i></button>
      </div>
      <div id="wiki-results" class="wiki-results hidden"></div>
      <p class="pf-note wiki-src"><i class="ph ph-info"></i> Wikipedia (CC BY-SA 4.0), consultabile senza internet. Non è una fonte ufficiale: per salute e sicurezza segui le guide verificate e le autorità.</p>
      <iframe id="wiki-frame" class="wiki-frame" sandbox="allow-same-origin" title="Articolo"></iframe>`;
  }

  let searchSeq = 0;
  async function _search(q) {
    const box = document.getElementById('wiki-results');
    const seq = ++searchSeq;
    if (!q || q.trim().length < 2) { box.classList.add('hidden'); return; }
    const res = await Zim.searchTitle(reader.z, q, 15);
    if (seq !== searchSeq) return;
    reader.lastResults = res;
    box.classList.remove('hidden');
    box.innerHTML = res.length
      ? res.map((e, i) => `<button class="wiki-hit" onclick="WikiModule._pick(${i})"><i class="ph ph-article"></i> ${esc(e.title)}</button>`).join('')
      : '<p class="pf-note">Nessun titolo trovato. La ricerca guarda l\'inizio del titolo: prova con la prima parola.</p>';
  }
  async function _pick(i) {
    const e = reader.lastResults && reader.lastResults[i];
    document.getElementById('wiki-results').classList.add('hidden');
    document.getElementById('wiki-q').value = '';
    if (e) await _show(e);
  }

  // percorso relativo dentro il pacchetto → [namespace, percorso]
  function _resolvePath(href, cur) {
    const u = new URL(href, 'https://zim.invalid/' + cur.ns + '/' + cur.path.split('/').map(encodeURIComponent).join('/'));
    if (u.host !== 'zim.invalid') return null;
    const parts = u.pathname.slice(1).split('/').map(s => { try { return decodeURIComponent(s); } catch (e) { return s; } });
    if (parts.length > 1 && parts[0].length === 1) return [parts[0], parts.slice(1).join('/'), u.hash];
    return [cur.ns, parts.join('/'), u.hash];
  }

  async function _bytesFor(ns, path) {
    const e = await Zim.findByPath(reader.z, ns, path);
    return e ? Zim.content(reader.z, e) : null;
  }

  async function _show(entry, noHistory) {
    const frame = document.getElementById('wiki-frame');
    if (!frame) return;
    const c = await Zim.content(reader.z, entry);
    const cur = c.entry;
    if (!noHistory && reader.cur) reader.history.push(reader.cur);
    reader.cur = cur;
    reader.urls.forEach(u => URL.revokeObjectURL(u)); reader.urls = [];
    const doc = new DOMParser().parseFromString(Zim.decode(c.bytes), 'text/html');
    doc.querySelectorAll('script, iframe, object, embed, base').forEach(n => n.remove());
    // fogli di stile del pacchetto, messi dentro la pagina
    for (const l of [...doc.querySelectorAll('link[rel~="stylesheet"][href]')]) {
      const p = _resolvePath(l.getAttribute('href'), cur);
      const r = p && await _bytesFor(p[0], p[1]).catch(() => null);
      const st = doc.createElement('style');
      st.textContent = r ? Zim.decode(r.bytes).replace(/url\([^)]*\)/g, 'none') : '';
      l.replaceWith(st);
    }
    // immagini del pacchetto
    for (const img of [...doc.querySelectorAll('img[src]')]) {
      img.removeAttribute('srcset');
      const p = _resolvePath(img.getAttribute('src'), cur);
      const r = p && await _bytesFor(p[0], p[1]).catch(() => null);
      if (!r) { img.remove(); continue; }
      const u = URL.createObjectURL(new Blob([r.bytes], { type: r.mime }));
      reader.urls.push(u);
      img.setAttribute('src', u);
    }
    const st = doc.createElement('style');
    st.textContent = 'body{margin:8px;max-width:100%;overflow-x:hidden;font-size:16px;line-height:1.5}img{max-width:100%;height:auto}table{display:block;overflow-x:auto}';
    doc.head.appendChild(st);
    frame.onload = () => {
      const d = frame.contentDocument;
      if (!d) return;
      const fit = () => { frame.style.height = Math.max(400, d.documentElement.scrollHeight + 20) + 'px'; };
      fit(); d.querySelectorAll('img').forEach(i => i.addEventListener('load', fit));
      d.addEventListener('click', ev => {
        const a = ev.target.closest && ev.target.closest('a[href]');
        if (!a) return;
        const href = a.getAttribute('href');
        if (href.startsWith('#')) return;
        ev.preventDefault();
        if (/^[a-z]+:/i.test(href)) { _note('Collegamento esterno: si apre solo con internet, fuori da Wikipedia offline.'); return; }
        const p = _resolvePath(href, cur);
        if (!p) return;
        Zim.findByPath(reader.z, p[0], p[1]).then(e => e ? _show(e) : _note('Questa pagina non è nel pacchetto scaricato.'));
      });
    };
    frame.srcdoc = '<!DOCTYPE html>' + doc.documentElement.outerHTML;
    window.scrollTo(0, 0);
  }

  function _note(t) {
    const p = document.querySelector('#wiki-root .wiki-src');
    if (p) { p.innerHTML = '<i class="ph ph-info"></i> ' + esc(t); }
  }

  async function back() { if (reader && reader.history.length) await _show(reader.history.pop(), true); }
  async function home() { if (reader) { const m = await Zim.mainEntry(reader.z); if (m) await _show(m); } }
  function library() { reader = null; render(); }

  /* ── pagina dei pacchetti ── */
  function _progress() {
    const bar = document.getElementById('wiki-prog'), msg = document.getElementById('wiki-prog-msg');
    if (bar && busy) bar.style.width = busy.pct.toFixed(1) + '%';
    if (msg && busy) msg.textContent = busy.msg;
  }

  async function render(message) {
    const root = document.getElementById('wiki-root');
    if (!root) return;
    if (reader) return;   // in lettura: non toccare
    if (!supported()) {
      root.innerHTML = `<div class="alert alert-info"><i class="ph ph-info"></i><div>Wikipedia offline non è disponibile qui${window.RS_OFFLINE_COPY ? ' (copia offline)' : ''}: usa l'app installata o un browser recente.</div></div>`;
      return;
    }
    const lang = getLang();
    const [mine, cat, est] = await Promise.all([books(), loadCatalog(lang), navigator.storage.estimate?.().catch(() => null)]);
    const free = est && est.quota ? fmt(est.quota - est.usage) : null;
    const byKey = {}; mine.forEach(b => { if (b.meta.key && (b.meta.lang || 'it') === lang) byKey[b.meta.key] = b; });
    root.innerHTML = `
      ${message ? `<div class="alert alert-info mb-12"><i class="ph ph-info"></i><div>${esc(message)}</div></div>` : ''}
      <p class="pf-note"><i class="ph ph-wifi-slash"></i> Scarica ora, con internet, le parti di Wikipedia che ti servono: poi le leggi anche senza rete. Nessun pacchetto è scaricato di base.${free ? ` Spazio libero per l'app: <strong>${free}</strong>.` : ''}</p>
      ${busy ? `<div class="card wiki-busy">
          <strong>${esc(busy.name)}</strong>
          <div class="progress-bar-container mt-8"><div id="wiki-prog" class="progress-bar" style="width:${busy.pct.toFixed(1)}%"></div></div>
          <p id="wiki-prog-msg" class="pf-note">${esc(busy.msg)}</p>
          <button class="btn btn-outline btn-sm" onclick="WikiModule.stop()"><i class="ph ph-stop-circle"></i> Ferma il download</button>
          <p class="pf-note">Puoi fermarlo quando vuoi e riprenderlo dopo: le parti già scaricate restano. Su Android lo puoi fermare anche dalla notifica.</p>
        </div>` : ''}
      ${mine.length ? `<h2 class="pf-group-title">I tuoi pacchetti</h2>
        ${mine.map(b => `<div class="card wiki-book">
          <div><strong>${esc(b.meta.label)}</strong><div class="pf-note">${fmt(b.meta.total)}${b.meta.done ? '' : ' · incompleto'}</div></div>
          <div class="flex gap-8">
            ${b.meta.done ? `<button class="btn btn-sm" onclick="WikiModule.openBook('${esc(b.name)}')"><i class="ph ph-book-open"></i> Apri</button>`
              : (b.meta.key && !busy ? `<button class="btn btn-sm" onclick="WikiModule.download('${b.meta.key}','${b.meta.lang || 'it'}')"><i class="ph ph-play"></i> Riprendi</button>` : '')}
            ${busy ? '' : `<button class="btn btn-outline btn-sm" onclick="WikiModule.remove('${esc(b.name)}')" aria-label="Elimina"><i class="ph ph-trash"></i></button>`}
          </div></div>`).join('')}` : ''}
      <h2 class="pf-group-title">Pacchetti disponibili</h2>
      <div class="pf-note mb-8">Lingua di Wikipedia:
        ${Object.keys(LANGS).map(l => `<button class="btn btn-sm ${l === lang ? '' : 'btn-outline'}" ${busy ? 'disabled' : ''} onclick="WikiModule.setLang('${l}')">${LANGS[l].name}</button>`).join(' ')}</div>
      ${lang === 'en' ? '<p class="pf-note">In inglese ci sono solo i pacchetti piccoli e medi: «Tutta Wikipedia» pesa da 13 a 119 GB, troppo per un telefono.</p>' : ''}
      ${flavoursOf(lang).filter(f => cat[f.key]).map(f => {
        const [file, size] = cat[f.key];
        const has = byKey[f.key] && byKey[f.key].meta.file === file;
        return `<div class="card wiki-book">
          <div><strong>${esc(f.label)}</strong><div class="pf-note">${esc(f.desc)} · ${sizeLabel(size)} · aggiornato ${dateOf(file)}</div></div>
          ${has ? '<span class="pf-note">già presente</span>'
            : `<button class="btn btn-sm" ${busy || !navigator.onLine ? 'disabled' : ''} onclick="WikiModule.download('${f.key}','${lang}')"><i class="ph ph-download-simple"></i> Scarica</button>`}
        </div>`;
      }).join('')}
      <div class="pf-actions mt-12">
        <button class="pf-action" ${busy ? 'disabled' : ''} onclick="WikiModule.importFile()"><i class="ph ph-folder-open"></i> Importa un file .zim dal telefono</button>
      </div>
      <p class="pf-note">Contenuti di Wikipedia, licenza CC BY-SA 4.0. Pacchetti preparati da Kiwix (kiwix.org). Wikipedia non è una fonte ufficiale.</p>`;
  }

  function setLang(l) { if (busy || !LANGS[l]) return; Storage.set('wiki-lang', l); render(); }

  function stop() { if (busy) busy.abort(); }

  function init() { if (!reader) render(); }

  return { _openSource, init, setLang, download, importFile, remove, openBook, back, home, library, stop, _search, _pick };
})();
