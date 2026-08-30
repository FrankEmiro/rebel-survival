/* ============================================================
   Storage — localStorage wrapper con namespace
   ============================================================ */
const Storage = {
  NS: 'kit-resilienza:',

  // Versione dello schema dati esportato — incrementare quando cambia la forma
  // di uno o più oggetti salvati, e aggiungere la migrazione in importAll().
  SCHEMA_VERSION: 1,

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
  },

  // Esporta tutte le chiavi namespaced in un unico oggetto backup
  exportAll() {
    const data = {};
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(this.NS))
        .forEach(k => {
          const shortKey = k.slice(this.NS.length);
          try { data[shortKey] = JSON.parse(localStorage.getItem(k)); } catch {}
        });
    } catch {}
    return {
      schemaVersion: this.SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      data,
    };
  },

  // Importa un backup generato da exportAll(). Sovrascrive le chiavi presenti in payload.data
  importAll(payload) {
    if (!payload || typeof payload !== 'object' || !payload.data || typeof payload.data !== 'object') {
      throw new Error('Formato backup non valido');
    }
    // Punto di innesto per future migrazioni: if (payload.schemaVersion < this.SCHEMA_VERSION) { ... }
    Object.entries(payload.data).forEach(([key, value]) => this.set(key, value));
  },
};
