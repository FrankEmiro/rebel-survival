/* ============================================================
   Assistente — domande in linguaggio naturale sulle guide dell'app
   Fase 1: ricerca locale (100% offline, ogni telefono).
   Risponde SOLO con testi presenti nell'app (guide e piani degli
   scenari), sempre con la fonte e l'eventuale avviso di cautela.
   Fase 2: risposta scritta da un modello AI che gira SUL telefono (WebLLM),
   facoltativa, solo su dispositivi capaci, basata solo sui passaggi trovati.
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
    el.innerHTML = history.map((h, i) => `
      <div class="as-q"><span>${esc(h.q)}</span></div>
      <div class="as-a">${h.results.length
        ? `${h.ai ? `<div class="as-aians" id="as-aians-${i}">${_aiHtml(h.ai)}</div>` : ''}<p class="as-lead">${h.ai ? 'Passaggi delle guide usati per la risposta:' : `Ho trovato ${h.results.length === 1 ? 'questo passaggio' : 'questi passaggi'} nelle guide:`}</p>${h.results.map(_card).join('')}`
        : `<p class="as-lead">Non ho trovato nulla nelle guide su questo. Prova con altre parole, oppure sfoglia le <button class="as-link" onclick="navigateTo('guide')">Guide</button>.</p>`}
      </div>`).join('');
    el.lastElementChild?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  function ask(q) {
    q = String(q || '').trim();
    if (!q) return;
    const h = { q, results: search(q, 3) };
    if (AI.enabled() && h.results.length) h.ai = { status: 'wait', text: '' };
    history.push(h);
    if (history.length > 20) history.shift();
    const inp = document.getElementById('as-input');
    if (inp) inp.value = '';
    _renderThread();
    if (h.ai) AI.answer(h);
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

  /* ── FASE 2: AI LOCALE (facoltativa) ──
     Due motori, scelti in automatico:
     - GPU (WebLLM + Llama 3.2 1B) se la scheda grafica lo permette;
     - CPU (wllama/llama.cpp + Qwen3 0.6B) su tutti gli altri telefoni: più
       lento, ma non dipende dalla scheda grafica.
     Libreria e modello si scaricano UNA volta da server pubblici
     (jsDelivr, Hugging Face, GitHub) e poi restano nel telefono: funziona
     senza internet. Le domande non escono mai dal dispositivo.
     L'AI riassume SOLO i passaggi trovati dalla ricerca; se scrive numeri
     che non sono nei passaggi, la risposta viene nascosta. */
  const AI_LIB = 'https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.87/+esm';
  const AI_MODELS = { f16: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', f32: 'Llama-3.2-1B-Instruct-q4f32_1-MLC' };
  const WLLAMA_LIB = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.8.1/esm/index.js';
  const WLLAMA_WASM = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@3.8.1/esm/wasm/wllama.wasm';
  // versione del file fissata (commit Hugging Face): i pezzi scaricati in momenti diversi sono dello stesso file
  const CPU_MODEL_URL = 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/50968a4468ef4233ed78cd7c3de230dd1d61a56b/Qwen3-0.6B-Q4_K_M.gguf';
  const CPU_MODEL_URL_OLD = 'https://huggingface.co/unsloth/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q4_K_M.gguf';

  /* Download del modello CPU a pezzi da 8 MB salvati nel telefono (OPFS).
     Se la connessione cade, riprova da sola; se l'app si chiude, alla ripresa
     riparte dal primo pezzo mancante invece che da zero. */
  const Chunks = (() => {
    const DIR = 'rs-ai-qwen3-0.6b-q4km', SIZE = 8 * 1048576, IDLE_MS = 60000, TRIES = 6;
    const name = i => 'p' + String(i).padStart(4, '0');
    const supported = () => !!(navigator.storage && navigator.storage.getDirectory)
      && typeof FileSystemFileHandle !== 'undefined' && 'createWritable' in FileSystemFileHandle.prototype;
    const dir = async create => (await navigator.storage.getDirectory()).getDirectoryHandle(DIR, { create });
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const online = () => navigator.onLine ? null : new Promise(r => window.addEventListener('online', r, { once: true }));

    async function readMeta(d) {
      try { return JSON.parse(await (await (await d.getFileHandle('meta.json')).getFile()).text()); } catch (e) { return null; }
    }
    async function writeFile(d, n, blob) {
      const w = await (await d.getFileHandle(n, { create: true })).createWritable();
      await w.write(blob); await w.close();   // il file diventa visibile intero solo alla chiusura
    }
    async function sizeOf(d, n) {
      try { return (await (await d.getFileHandle(n)).getFile()).size; } catch (e) { return -1; }
    }
    const span = (meta, i) => [i * SIZE, Math.min(meta.total, (i + 1) * SIZE) - 1];

    // un pezzo, con timeout se non arrivano dati per 60 s
    async function fetchPart(start, end, onBytes) {
      const ac = new AbortController();
      let timer = setTimeout(() => ac.abort(), IDLE_MS);
      try {
        const res = await fetch(CPU_MODEL_URL, { headers: { Range: `bytes=${start}-${end}` }, signal: ac.signal, cache: 'no-store' });
        if (res.status !== 206) throw new Error('il server non accetta il download a pezzi (HTTP ' + res.status + ')');
        const rd = res.body.getReader(), parts = [];
        let got = 0;
        for (;;) {
          const { done, value } = await rd.read();
          if (done) break;
          clearTimeout(timer); timer = setTimeout(() => ac.abort(), IDLE_MS);
          parts.push(value); got += value.length; onBytes(got);
        }
        if (got !== end - start + 1) throw new Error('pezzo incompleto');
        return new Blob(parts);
      } finally { clearTimeout(timer); }
    }

    async function download(onPct) {
      const d = await dir(true);
      let meta = await readMeta(d);
      if (!meta || meta.url !== CPU_MODEL_URL) {
        const res = await fetch(CPU_MODEL_URL, { headers: { Range: 'bytes=0-0' }, cache: 'no-store' });
        const total = +((res.headers.get('Content-Range') || '').split('/')[1] || 0);
        if (res.status !== 206 || !total) throw new Error('dimensione del modello non disponibile');
        meta = { url: CPU_MODEL_URL, total, n: Math.ceil(total / SIZE) };
        await writeFile(d, 'meta.json', new Blob([JSON.stringify(meta)]));
      }
      const missing = [];
      let have = 0;
      for (let i = 0; i < meta.n; i++) {
        const [s, e] = span(meta, i);
        if (await sizeOf(d, name(i)) === e - s + 1) have += e - s + 1; else missing.push(i);
      }
      onPct(have / meta.total * 100);
      for (const i of missing) {
        const [s, e] = span(meta, i);
        for (let t = 1; ; t++) {
          try {
            await online();
            const blob = await fetchPart(s, e, got => onPct((have + got) / meta.total * 100));
            await writeFile(d, name(i), blob);
            have += blob.size;
            break;
          } catch (err) {
            if (err && err.name === 'QuotaExceededError') throw err;
            if (t >= TRIES) throw new Error('download interrotto (connessione assente o troppo lenta): tocca Riprendi, i pezzi già scaricati restano');
            await wait(3000 * t);
          }
        }
      }
    }

    // il modello intero come un unico Blob (i pezzi in ordine), o null se manca qualcosa
    async function blob() {
      try {
        const d = await dir(false), meta = await readMeta(d);
        if (!meta || meta.url !== CPU_MODEL_URL) return null;
        const files = [];
        for (let i = 0; i < meta.n; i++) files.push(await (await d.getFileHandle(name(i))).getFile());
        const b = new Blob(files);
        return b.size === meta.total ? b : null;
      } catch (e) { return null; }
    }

    async function remove() {
      try { await (await navigator.storage.getDirectory()).removeEntry(DIR, { recursive: true }); } catch (e) { /* già vuota */ }
    }
    return { supported, download, blob, remove };
  })();
  // peso reale dei download (verificato su Hugging Face) e spazio libero richiesto
  const BACKENDS = {
    gpu: { label: 'Llama 3.2 1B', engine: 'scheda grafica', mb: 700, freeMB: 1000, note: ' Built with Llama.' },
    cpu: { label: 'Qwen3 0.6B', engine: 'processore', mb: 390, freeMB: 600, note: '' },
  };
  const AI_KEY = 'assistente_ai';
  // AI sperimentale: visibile SOLO a chi apre l'app con ?lab=1 (?lab=0 la nasconde di nuovo)
  const LAB_KEY = 'lab';
  (() => {
    const m = /[?&]lab=([01])/.exec(location.search);
    if (m && typeof Storage !== 'undefined') Storage.set(LAB_KEY, m[1] === '1');
    const f = /[?&]ai=(cpu|gpu|auto)/.exec(location.search);   // solo per prove: forza il motore
    if (f && typeof Storage !== 'undefined') {
      const c = Storage.get('assistente_ai', {}) || {};
      if (f[1] === 'auto') delete c.force; else c.force = f[1];
      Storage.set('assistente_ai', c);
    }
  })();
  const labOn = () => typeof Storage !== 'undefined' && Storage.get(LAB_KEY, false) === true;
  // prompt corto e un solo passaggio: i modelli piccoli seguono meglio istruzioni brevi
  // e su GPU deboli ogni parola in più nel contesto costa secondi.
  const AI_SYSTEM = 'Rispondi in italiano con un breve elenco a trattini, riassumendo il PASSAGGIO per rispondere alla DOMANDA. '
    + 'Usa solo il passaggio. Copia i numeri esattamente. Non aggiungere altro.';
  const AI_CTX_CHARS = 600;

  // numeri nella risposta che non compaiono nei passaggi (né nella domanda)
  function _numbers(s) {
    return (String(s).match(/\d+(?:[.,]\d+)?/g) || []).map(n => n.replace(',', '.'));
  }
  function _unknownNumbers(answer, source, partial) {
    let t = String(answer).replace(/^\s*\d+[.)]\s/gm, ' ').replace(/\[\d+\]/g, ' ');
    if (partial) t = t.replace(/\d+(?:[.,]\d*)?$/, '');   // numero ancora in scrittura
    const ok = new Set([..._numbers(source), '112']);
    return [...new Set(_numbers(t).filter(n => !ok.has(n)))];
  }

  const AI = (() => {
    let lib = null, engine = null, loading = null, cap = null, queue = Promise.resolve();
    let state = { phase: 'idle', pct: 0 };
    let lastProgress = 0, watchdog = null;
    const STALL_MS = 15 * 60 * 1000;  // nessun progresso per 15 minuti = download forse fermo (il pezzo più grande è ~130 MB)
    const cfg = () => (typeof Storage !== 'undefined' && Storage.get(AI_KEY, {})) || {};
    const save = c => Storage.set(AI_KEY, c);
    const enabled = () => labOn() && !!cfg().enabled && !!cfg().installed && (!cap || cap.ok);

    async function capability() {
      if (cap) return cap;
      const c = { webgpu: false, f16: false, memGB: navigator.deviceMemory || null, sbuf: null, why: '' };
      try {
        const a = navigator.gpu && await navigator.gpu.requestAdapter();
        if (a) {
          c.webgpu = true; c.f16 = a.features.has('shader-f16');
          c.sbuf = a.limits.maxStorageBufferBindingSize;
          c.wgs = a.limits.maxComputeWorkgroupStorageSize;
        }
      } catch (e) { /* nessuna GPU utilizzabile */ }
      // WebLLM richiede sulla GPU: buffer da almeno 128 MB e 32 KB di memoria per gruppo di calcolo
      // (molte GPU Android si fermano a 16 KB: lì il modello non può partire)
      const gpuOk = (c.sbuf == null || c.sbuf >= 134217728) && (c.wgs == null || c.wgs >= 32768);
      c.gpuOk = c.webgpu && gpuOk && (c.memGB == null || c.memGB >= 4);
      c.gpuWhy = !c.webgpu ? 'il browser non ha WebGPU'
        : !gpuOk ? 'scheda grafica non adatta' : (c.memGB != null && c.memGB < 4) ? 'RAM inferiore a 4 GB' : '';
      // motore CPU: serve WebAssembly e almeno 2 GB di RAM
      c.cpuOk = typeof WebAssembly === 'object' && (c.memGB == null || c.memGB >= 2);
      const force = cfg().force;   // per le prove: ?ai=cpu o ?ai=gpu
      c.backend = (force === 'cpu' && c.cpuOk) ? 'cpu' : (force === 'gpu' && c.gpuOk) ? 'gpu'
        : c.gpuOk ? 'gpu' : c.cpuOk ? 'cpu' : null;
      c.ok = !!c.backend;
      c.why = c.ok ? '' : (!c.cpuOk ? 'memoria (RAM) inferiore a 2 GB o browser troppo vecchio' : c.gpuWhy);
      c.model = c.f16 ? AI_MODELS.f16 : AI_MODELS.f32;
      // modello installato per l'altro motore (es. dopo ?ai=cpu): va riscaricato quello giusto
      const conf = cfg();
      if (conf.installed && (conf.backend || 'gpu') !== c.backend) save({ ...conf, installed: false, enabled: false });
      return (cap = c);
    }

    function setState(s) {
      state = { ...state, ...s };
      renderBox();
      history.forEach(h => { if (h.ai && h.ai.status === 'wait') _upd(h); });
    }

    async function load() {
      if (engine) return engine;
      if (loading) return loading;
      loading = (async () => {
        const c = await capability();
        if (!c.ok) throw new Error('dispositivo non adatto');
        setState({ phase: 'loading', pct: 0, stalled: false, hint: null });
        lastProgress = Date.now();
        clearInterval(watchdog);
        watchdog = setInterval(() => {
          if (state.phase === 'loading' && !state.stalled && Date.now() - lastProgress > STALL_MS) setState({ stalled: true });
        }, 15000);
        const onPct = p => { lastProgress = Date.now(); setState({ phase: 'loading', pct: Math.min(100, Math.round(p)), stalled: false }); };
        try { engine = await _loadEngine(c, onPct); }
        finally { clearInterval(watchdog); }
        save({ ...cfg(), installed: true, backend: c.backend, model: c.backend === 'gpu' ? c.model : CPU_MODEL_URL });
        setState({ phase: 'ready' });
        return engine;
      })();
      try { return await loading; }
      catch (e) { engine = null; setState({ phase: 'error', msg: _errMsg(e) }); throw e; }
      finally { loading = null; }
    }

    // adattatore unico per i due motori: gen(messaggi, onToken, deveFermarsi)
    async function _loadEngine(c, onPct) {
      if (c.backend === 'gpu') {
        lib = lib || await import(AI_LIB);
        const e = await lib.CreateMLCEngine(c.model, { initProgressCallback: p => onPct((p.progress || 0) * 100) });
        return {
          async gen(messages, onTok, isStop) {
            const s = await e.chat.completions.create({ stream: true, temperature: 0.1, max_tokens: 320, messages });
            for await (const ch of s) {
              onTok(ch.choices?.[0]?.delta?.content || '');
              if (isStop()) { try { e.interruptGenerate(); } catch (x) {} break; }
            }
          },
          unload: () => e.unload(),
        };
      }
      const W = await import(WLLAMA_LIB);
      const w = new W.Wllama({ default: WLLAMA_WASM }, { allowOffline: true, suppressNativeLog: true, logger: W.LoggerWithoutDebug });
      if (Chunks.supported()) {
        let b = await Chunks.blob();
        if (!b) {
          // libera l'eventuale download parziale fatto dalle versioni precedenti (non riprendibile)
          try { await w.cacheManager.delete(CPU_MODEL_URL_OLD); } catch (x) { /* niente da liberare */ }
          await Chunks.download(onPct);
          b = await Chunks.blob();
          if (!b) throw new Error('modello incompleto dopo il download');
        }
        onPct(100);
        await w.loadModel([b], { n_ctx: 2048 });
      } else {
        // browser senza scrittura su file (es. alcuni iPhone): download unico, non riprendibile
        await w.loadModelFromUrl(CPU_MODEL_URL, {
          n_ctx: 2048,
          progressCallback: ({ loaded, total }) => { if (total) onPct(loaded / total * 100); },
        });
      }
      return {
        async gen(messages, onTok, isStop) {
          const ac = new AbortController();
          try {
            await w.createChatCompletion({
              messages, stream: true, temperature: 0.1, max_tokens: 320, abortSignal: ac.signal,
              chat_template_kwargs: { enable_thinking: false },   // Qwen3: niente "ragionamento" lungo
              onData: ch => { onTok(ch.choices?.[0]?.delta?.content || ''); if (isStop()) ac.abort(); },
            });
          } catch (x) { if (!isStop()) throw x; }
        },
        unload: () => w.exit(),
      };
    }

    const diag = { freeMB: null, err: '' };
    function _errMsg(e) {
      const m = String((e && e.message) || e || '');
      diag.err = ((e && e.name) ? e.name + ': ' : '') + m.slice(0, 300);
      if (/maxStorageBufferBindingSize|maxComputeWorkgroupStorageSize|maxBufferSize/.test(m)) return 'la scheda grafica del telefono non supporta questo modello';
      if (!navigator.onLine && !cfg().installed) return 'serve internet per il primo download';
      if ((e && e.name === 'QuotaExceededError') || /QuotaExceeded/i.test(m)) return `spazio insufficiente: servono circa ${_gb(BACKENDS[cap?.backend || 'cpu'].freeMB)} liberi`;
      return 'errore nel caricamento del modello (' + m.slice(0, 200) + ')';
    }
    const _gb = mb => (mb >= 1024 ? (mb / 1024).toFixed(1).replace('.', ',') + ' GB' : Math.max(0, Math.round(mb)) + ' MB');

    async function enable() {
      const c = await capability();
      if (!c.ok) return renderBox();
      if (!cfg().installed && navigator.storage?.estimate) {
        try {
          const est = await navigator.storage.estimate();
          const freeMB = est.quota ? (est.quota - (est.usage || 0)) / 1048576 : null;
          diag.freeMB = freeMB == null ? null : Math.round(freeMB);
          // la stima del browser è approssimativa: si blocca solo se non ci sta nemmeno il modello
          const need = BACKENDS[c.backend].mb;
          if (freeMB != null && freeMB < need) {
            return setState({ phase: 'error', msg: `spazio insufficiente: servono almeno ${_gb(need)}, il browser ne concede ${_gb(freeMB)}`, hint: 'space' });
          }
        } catch (e) { /* stima non disponibile: si prova comunque */ }
      }
      try { await navigator.storage?.persist?.(); } catch (e) { /* facoltativo */ }
      save({ ...cfg(), enabled: true });
      try { await load(); } catch (e) { /* stato già mostrato */ }
    }

    // riprende un download fermo: ricarica l'app e riparte (i pezzi già scaricati restano)
    function resume() {
      save({ ...cfg(), resume: true });
      location.reload();
    }

    function disable() {
      save({ ...cfg(), enabled: false });
      state = { phase: 'idle', pct: 0 };
      renderBox();
    }

    async function remove() {
      const conf = cfg();
      const be = conf.backend || (await capability()).backend;
      try {
        if (engine) { await engine.unload(); engine = null; }
        if (be === 'cpu') {
          await Chunks.remove();
          const W = await import(WLLAMA_LIB);
          const cm = new W.Wllama({ default: WLLAMA_WASM }).cacheManager;
          for (const u of [CPU_MODEL_URL, CPU_MODEL_URL_OLD]) { try { await cm.delete(u); } catch (x) { /* assente */ } }
        } else {
          lib = lib || await import(AI_LIB);
          await lib.deleteModelAllInfoInCache(conf.model || (await capability()).model);
        }
      } catch (e) { /* se fallisce, il modello resta: lo si può eliminare dalle impostazioni del browser */ }
      save({});
      state = { phase: 'idle', pct: 0 };
      renderBox();
    }

    function _upd(h) {
      const el = document.getElementById('as-aians-' + history.indexOf(h));
      if (el) el.innerHTML = _aiHtml(h.ai);
    }

    function answer(h) { queue = queue.then(() => _answer(h)).catch(() => {}); }

    async function _answer(h) {
      try {
        const eng = await load();
        const c0 = h.results[0];
        let ctx = `${c0.title} — ${c0.heading || ''}\n`, n = 0;
        for (const x of (c0.items || [c0.body || ''])) {     // righe intere, mai tagliate a metà
          if (n && n + x.length > AI_CTX_CHARS) break;
          ctx += '- ' + x + '\n'; n += x.length;
        }
        const src = ctx + ' ' + h.q;
        h.ai.status = 'run'; _upd(h);
        let raw = '', stop = false;
        await eng.gen(
          [{ role: 'system', content: AI_SYSTEM }, { role: 'user', content: `PASSAGGIO:\n${ctx}\nDOMANDA: ${h.q}` }],
          tok => {
            if (stop) return;
            raw += tok;
            // Qwen3 può emettere un blocco <think>…</think> (anche vuoto): non va mostrato
            h.ai.text = raw.replace(/<think>[\s\S]*?(<\/think>|$)/g, '').replace(/^\s+/, '');
            const extra = _unknownNumbers(h.ai.text, src, true);
            if (extra.length) { h.ai.status = 'blocked'; h.ai.extra = extra; stop = true; return; }
            _upd(h);
          },
          () => stop);
        if (h.ai.status === 'run') {
          const extra = _unknownNumbers(h.ai.text, src, false);
          if (extra.length) { h.ai.status = 'blocked'; h.ai.extra = extra; }
          else if (!h.ai.text.trim()) { h.ai.status = 'error'; h.ai.msg = 'nessuna risposta'; }
          else h.ai.status = 'done';
        }
      } catch (e) {
        h.ai.status = 'error'; h.ai.msg = _errMsg(e);
      }
      _upd(h);
    }

    // dettagli tecnici per capire i problemi sui telefoni (nessun dato personale)
    function _diagHtml(c) {
      const rows = [
        'Browser: ' + (navigator.userAgent.match(/(Chrome|Firefox|SamsungBrowser|Version)\/[\d.]+/g) || ['?']).join(' '),
        'WebGPU: ' + (c.webgpu ? 'sì' : 'no') + ' · f16: ' + (c.f16 ? 'sì' : 'no'),
        'Buffer GPU max: ' + (c.sbuf ? Math.round(c.sbuf / 1048576) + ' MB' : '?') + ' · memoria gruppo: ' + (c.wgs ? Math.round(c.wgs / 1024) + ' KB (servono 32)' : '?'),
        'RAM indicata: ' + (c.memGB != null ? c.memGB + ' GB' : '?'),
        'Motore: ' + (c.backend ? BACKENDS[c.backend].engine + ' (' + BACKENDS[c.backend].label + ')' : 'nessuno') + (c.gpuWhy && c.backend === 'cpu' ? ' · GPU: ' + c.gpuWhy : ''),
        'Spazio concesso dal browser: ' + (diag.freeMB != null ? _gb(diag.freeMB) : '?'),
        diag.err ? 'Errore: ' + diag.err : '',
      ].filter(Boolean);
      return `<details class="as-diag"><summary>Dettagli tecnici</summary><pre>${esc(rows.join('\n'))}</pre></details>`;
    }

    async function renderBox() {
      const el = document.getElementById('as-ai');
      if (!el) return;
      if (!labOn()) { el.innerHTML = ''; return; }
      const c = await capability();
      const conf = cfg();
      const privacy = `<a href="legal/privacy.html" target="_blank" rel="noopener">privacy</a>`;
      let html;
      if (!c.ok) {
        html = `<i class="ph ph-cpu"></i><div><strong>Risposte scritte dall'AI</strong>
          <span>Non disponibili su questo dispositivo: ${esc(c.why)}. La ricerca nelle guide funziona lo stesso.</span>${_diagHtml(c)}</div>`;
      } else if (state.phase === 'loading') {
        html = `<i class="ph ph-download-simple"></i><div><strong>${conf.installed ? 'Carico l\'AI…' : 'Scarico l\'AI (una volta sola)…'} ${state.pct}%</strong>
          <div class="as-prog"><span style="width:${state.pct}%"></span></div>
          ${state.stalled ? `<span class="as-ai-warn">Il download è fermo o molto lento. Puoi riprenderlo: le parti già completate non si perdono.</span>
          <div class="as-ai-btns"><button class="as-open" onclick="AssistenteModule.aiResume()">Riprendi il download</button></div>` : ''}
          <span>${conf.installed ? 'Pochi secondi.' : 'Con una connessione lenta può richiedere molti minuti.'} Non chiudere l'app: intanto la ricerca nelle guide funziona.</span></div>`;
      } else if (state.phase === 'error' && conf.enabled !== false) {
        html = `<i class="ph ph-warning"></i><div><strong>AI non disponibile: ${esc(state.msg || '')}</strong>
          <span>${state.hint === 'space' ? 'Libera spazio sul telefono (foto, app, file scaricati) e riprova. Se lo spazio c\'è, verifica di non essere in navigazione in incognito: lì il browser concede pochissimo spazio. ' : ''}La ricerca nelle guide funziona lo stesso.</span>${_diagHtml(c)}
          <div class="as-ai-btns"><button class="as-open" onclick="AssistenteModule.aiEnable()">Riprova</button>
          <button class="as-link" onclick="AssistenteModule.aiDisable()">Disattiva</button></div></div>`;
      } else if (conf.enabled && !conf.installed) {
        html = `<i class="ph ph-download-simple"></i><div><strong>Download dell'AI non completato</strong>
          <span>Le parti già scaricate restano sul telefono.</span>
          <div class="as-ai-btns"><button class="as-open" onclick="AssistenteModule.aiEnable()">Riprendi il download</button>
          <button class="as-link" onclick="AssistenteModule.aiRemove()">Annulla e libera spazio</button></div></div>`;
      } else if (conf.enabled) {
        html = `<i class="ph ph-cpu"></i><div><strong>Risposte AI attive (sperimentale)</strong>
          <span>Modello ${BACKENDS[conf.backend || c.backend].label} sul tuo telefono (usa il ${BACKENDS[conf.backend || c.backend].engine}), funziona senza internet. Riassume il primo passaggio trovato e può sbagliare o essere lenta (anche un minuto su dispositivi poco potenti): controlla sempre i passaggi.${BACKENDS[conf.backend || c.backend].note}</span>
          <div class="as-ai-btns"><button class="as-link" onclick="AssistenteModule.aiDisable()">Disattiva</button>
          <button class="as-link" onclick="AssistenteModule.aiRemove()">Elimina il modello (libera spazio)</button></div></div>`;
      } else {
        const mobile = navigator.connection && (navigator.connection.type === 'cellular' || navigator.connection.saveData);
        html = `<i class="ph ph-cpu"></i><div><strong>Risposte scritte dall'AI (sperimentale, facoltativa)</strong>
          <span>${conf.installed
            ? 'Il modello è già sul telefono: puoi riattivarlo.'
            : `Un'AI che gira sul tuo telefono scrive la risposta usando solo i passaggi delle guide. Su questo telefono userà il ${BACKENDS[c.backend].engine} (modello ${BACKENDS[c.backend].label}). Va scaricata una volta (circa ${_gb(BACKENDS[c.backend].mb)}, servono ${_gb(BACKENDS[c.backend].freeMB)} liberi; meglio con il Wi‑Fi) da server pubblici (jsDelivr, Hugging Face, GitHub); poi funziona senza internet. Le tue domande non escono dal telefono. Vedi la ${privacy}.`}</span>
          ${mobile && !conf.installed ? '<span class="as-ai-warn">Sembri connesso alla rete mobile: il download consuma molti dati.</span>' : ''}
          <div class="as-ai-btns"><button class="as-open" onclick="AssistenteModule.aiEnable()"><i class="ph ph-download-simple"></i> ${conf.installed ? 'Attiva' : 'Scarica e attiva'}</button></div></div>`;
      }
      el.innerHTML = html;
    }

    const resumePending = () => { const c = cfg(); if (!c.resume) return false; save({ ...c, resume: false }); return true; };
    return { resumePending, enabled, enable, disable, remove, resume, answer, renderBox, capability };
  })();

  function _aiHtml(ai) {
    const head = `<div class="as-aihead"><i class="ph ph-cpu"></i> Risposta dell'AI</div>`;
    if (ai.status === 'wait') return head + `<p class="as-aimuted">Preparo l'AI…</p>`;
    if (ai.status === 'error') return head + `<p class="as-aimuted">AI non disponibile (${esc(ai.msg || '')}). Leggi i passaggi qui sotto.</p>`;
    if (ai.status === 'blocked') return head + `<p class="as-aimuted">Ho nascosto la risposta dell'AI perché conteneva numeri che non trovo nelle guide (${esc(ai.extra.join(', '))}). Leggi i passaggi qui sotto.</p>`;
    const txt = esc(ai.text.trim()).replace(/\n/g, '<br>') || '…';
    return head + `<p class="as-aitext">${txt}${ai.status === 'run' ? ' <span class="as-cursor">▍</span>' : ''}</p>
      <p class="as-ainote">Scritta da un'AI sul tuo telefono riassumendo il primo passaggio qui sotto. Può sbagliare: controlla sempre i passaggi.</p>`;
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
    AI.renderBox();
    if (AI.resumePending()) AI.enable();
  }

  return { init, ask, submit, clear, search, openScenario, aiEnable: () => AI.enable(), aiDisable: () => AI.disable(), aiRemove: () => AI.remove(), aiResume: () => AI.resume() };
})();
