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
          <span>Sono gli stessi dati del Profilo: se li cambi qui, si aggiornano anche lì.</span></div>
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

  int(value, def = 0) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : def;
  },
};
