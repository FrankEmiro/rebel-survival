/* ============================================================
   Storage — localStorage wrapper con namespace
   ============================================================ */
const Storage = {
  NS: 'kit-resilienza:',

  get(key, fallback = null) {
    try {
      const raw = localStorage.getItem(this.NS + key);
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  },

  set(key, value) {
    try { localStorage.setItem(this.NS + key, JSON.stringify(value)); } catch {}
  },

  remove(key) {
    try { localStorage.removeItem(this.NS + key); } catch {}
  },

  clear() {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(this.NS))
        .forEach(k => localStorage.removeItem(k));
    } catch {}
  }
};
