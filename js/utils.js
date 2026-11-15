/* ============================================================
   Utils — helper condivisi (escaping HTML, parsing numerico)
   ============================================================ */
const Utils = {
  // Fabbisogno d'acqua minimo per persona/giorno (bere + cucinare): UNICO valore usato da livelli, task, Piano e calcolatore
  WATER_L_PPD: 3,

  // Escapa testo libero prima di interpolarlo in innerHTML — previene XSS
  escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  },

  // Precompila i campi del calcolatore dal profilo salvato (evita di reinserire i dati).
  // map: { idElemento: valore }. Salta valori null/undefined/0-vuoti per non sovrascrivere i default.
  prefill(map) {
    Object.entries(map).forEach(([id, v]) => {
      const el = document.getElementById(id);
      if (el && v != null && v !== '' && !(typeof v === 'number' && v === 0 && el.type === 'number' && el.min > 0)) el.value = v;
    });
  },

  // parseFloat con fallback che non tratta 0 come "mancante"
  num(value, def = 0) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : def;
  },

  // parseInt con fallback che non tratta 0 come "mancante"
  /* ── «La tua situazione» in cima ai calcolatori ──
     I campi con data-pkey="campo_del_profilo" mostrano e salvano SUBITO
     lo stesso dato del Profilo (un solo posto dove sta il valore).
     data-ptype: "num" (numero), "bool" (casella), "yesno" (select sì/no), altrimenti testo. */
  sitCard(inner, statusId) {
    return `<div class="card sit-card">
      <div class="sit-head">
        <i class="ph ph-house-line"></i>
        <div><h3>La tua situazione</h3>
          <span>Sono gli stessi dati delle Scorte: se li cambi qui, si aggiornano anche lì.</span></div>
        <span class="sit-saved" aria-live="polite"></span>
      </div>
      ${inner}
      ${statusId ? `<div class="sit-status" id="${statusId}"></div>` : ''}
    </div>`;
  },

  fillProfile(root) {
    const p = SettingsModule.get();
    root.querySelectorAll('[data-pkey]').forEach(el => {
      const v = p[el.dataset.pkey], t = el.dataset.ptype;
      if (t === 'bool') el.checked = !!v;
      else if (t === 'yesno') el.value = v ? 'si' : 'no';
      else if (el.type === 'number' && +v === 0 && +el.min > 0) return;   // 0 non valido qui: resta il valore di esempio
      else if (v != null && (el.tagName !== 'SELECT' || [...el.options].some(o => o.value === String(v)))) el.value = v;
    });
  },

  // onChange: ricalcolo (anche per i campi che non sono del profilo); hooks: { campo: (profilo, valore) => {} }
  bindProfile(root, onChange, hooks = {}) {
    let timer = null, flash = null;
    const handler = ev => {
      const el = ev.target;
      if (el.dataset && el.dataset.pkey) {
        const t = el.dataset.ptype, key = el.dataset.pkey;
        const v = t === 'bool' ? el.checked : t === 'yesno' ? el.value === 'si'
          : t === 'num' ? Math.max(0, Utils.num(el.value, 0)) : el.value;
        const p = SettingsModule.get();
        p[key] = v;
        if (hooks[key]) hooks[key](p, v);
        Storage.set('profilo', p);
        const s = root.querySelector('.sit-saved');
        if (s) { s.textContent = 'Salvato ✓'; clearTimeout(flash); flash = setTimeout(() => { s.textContent = ''; }, 1500); }
      }
      clearTimeout(timer);
      timer = setTimeout(onChange, 150);
    };
    root.addEventListener('input', handler);
    root.addEventListener('change', ev => { if (ev.target.tagName === 'SELECT' || ev.target.type === 'checkbox') handler(ev); });
  },

  /* ── Impaginazione dei calcolatori (una volta, dopo aver inserito l'HTML) ──
     - il risultato entra nello STESSO pannello dei dati del calcolo;
     - le schede successive (consigli, metodi, liste) diventano sezioni
       che si aprono con un tocco, la prima aperta. Il testo non cambia. */
  calcLayout(root, resultsId, icons = []) {
    const res = root.querySelector('#' + resultsId);
    if (!res) return;
    const calc = res.previousElementSibling;
    const panel = res.querySelector('.results-panel');
    if (calc && panel) {
      calc.classList.add('calc-card');
      const out = document.createElement('div');
      out.className = 'calc-out';
      out.innerHTML = '<div class="calc-out-lab"><i class="ph ph-chart-bar"></i> Risultato</div>';
      panel.querySelector(':scope > h3')?.remove();
      while (panel.firstChild) out.appendChild(panel.firstChild);
      panel.remove();
      calc.appendChild(out);
      calc.appendChild(res);   // il contenitore dei risultati segue il pannello (resta per show/hide)
      res.classList.add('calc-res');
    }
    const strip = t => t.replace(/^[^\p{L}\d]+/u, '').trim();
    [...res.querySelectorAll(':scope > .card')].forEach((card, i) => {
      const h = card.querySelector('h3');
      const title = h ? strip(h.textContent) : '';
      const head = h && h.parentElement !== card ? h.parentElement : h;   // es. titolo + pulsante Stampa
      const extra = head && head !== h ? [...head.children].filter(x => x !== h) : [];
      head?.remove();
      const d = document.createElement('details');
      d.className = 'card fold calc-more';
      if (i === 0) d.open = true;
      d.innerHTML = `<summary><i class="ph ${icons[i] || 'ph-info'} fold-icon"></i><span class="fold-title">${Utils.escapeHtml(title)}</span><i class="ph ph-caret-down fold-caret"></i></summary><div class="fold-body"></div>`;
      const body = d.querySelector('.fold-body');
      extra.forEach(x => body.appendChild(x));
      while (card.firstChild) body.appendChild(card.firstChild);
      card.replaceWith(d);
    });
    // le sezioni vanno DOPO il pannello, non dentro
    const calcCard = res.closest('.calc-card');
    if (calcCard) [...res.querySelectorAll(':scope > details.calc-more')].reverse().forEach(d => calcCard.after(d));
  },

  int(value, def = 0) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : def;
  },
};
