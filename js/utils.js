/* ============================================================
   Utils — helper condivisi (escaping HTML, parsing numerico)
   ============================================================ */
const Utils = {
  // Escapa testo libero prima di interpolarlo in innerHTML — previene XSS
  escapeHtml(str) {
    if (str == null) return '';
    return String(str).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
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
