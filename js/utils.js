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
  int(value, def = 0) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : def;
  },
};
