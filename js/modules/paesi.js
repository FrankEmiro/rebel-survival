/* ============================================================
   Paese e mappe dei confini
   L'utente sceglie il paese (primo avvio e Impostazioni > Profilo).
   - Italia: confini già inclusi nell'app (regioni, province, comuni).
   - Altri paesi: confini scaricati da geoBoundaries (github.com/wmgeolab/geoBoundaries),
     livello 1 (regioni/stati) e livello 2 (province/distretti) in versione semplificata,
     senza i comuni. Salvati nel telefono (cache 'kit-resilienza-map'): poi si usano senza rete.
   Le tile della mappa restano quelle di OpenStreetMap.
   Ogni paese ha la sua licenza dei dati: vedi legal/licenze.html.
   ============================================================ */
const CountryMaps = (() => {
  const API = 'https://www.geoboundaries.org/api/current/gbOpen/';
  const CACHE = 'kit-resilienza-map';
  // codice ISO a 3 lettere → nome in italiano (elenco ridotto: Europa, Mediterraneo e paesi più grandi)
  const COUNTRIES = {
    ITA: 'Italia', AUT: 'Austria', BEL: 'Belgio', BGR: 'Bulgaria', HRV: 'Croazia', CYP: 'Cipro', CZE: 'Cechia',
    DNK: 'Danimarca', EST: 'Estonia', FIN: 'Finlandia', FRA: 'Francia', DEU: 'Germania', GRC: 'Grecia',
    HUN: 'Ungheria', IRL: 'Irlanda', LVA: 'Lettonia', LTU: 'Lituania', LUX: 'Lussemburgo', MLT: 'Malta',
    NLD: 'Paesi Bassi', POL: 'Polonia', PRT: 'Portogallo', ROU: 'Romania', SVK: 'Slovacchia', SVN: 'Slovenia',
    ESP: 'Spagna', SWE: 'Svezia', CHE: 'Svizzera', GBR: 'Regno Unito', NOR: 'Norvegia', ISL: 'Islanda',
    ALB: 'Albania', BIH: 'Bosnia ed Erzegovina', SRB: 'Serbia', MNE: 'Montenegro', MKD: 'Macedonia del Nord',
    UKR: 'Ucraina', MDA: 'Moldavia', BLR: 'Bielorussia', TUR: 'Turchia', XKX: 'Kosovo',
    MAR: 'Marocco', DZA: 'Algeria', TUN: 'Tunisia', LBY: 'Libia', EGY: 'Egitto',
    ISR: 'Israele', LBN: 'Libano', JOR: 'Giordania', SAU: 'Arabia Saudita', ARE: 'Emirati Arabi Uniti',
    USA: 'Stati Uniti', CAN: 'Canada', MEX: 'Messico', BRA: 'Brasile', ARG: 'Argentina', CHL: 'Cile',
    COL: 'Colombia', PER: 'Perù', AUS: 'Australia', NZL: 'Nuova Zelanda', JPN: 'Giappone', IND: 'India',
    ZAF: 'Sudafrica', PHL: 'Filippine',
  };
  const DEFAULT = 'ITA';
  const inflight = {};

  const get = () => { const c = Storage.get('paese'); return COUNTRIES[c] ? c : DEFAULT; };
  const name = (iso = get()) => COUNTRIES[iso] || iso;
  const set = iso => { if (COUNTRIES[iso]) Storage.set('paese', iso); };
  const key = (iso, lvl) => new Request(`/paese/${iso}/${lvl}.geojson`);

  function options(selected = get()) {
    return Object.entries(COUNTRIES)
      .sort((a, b) => a[0] === DEFAULT ? -1 : b[0] === DEFAULT ? 1 : a[1].localeCompare(b[1], 'it'))
      .map(([c, n]) => `<option value="${c}"${c === selected ? ' selected' : ''}>${n}</option>`).join('');
  }

  async function level(iso, lvl) {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(key(iso, lvl));
    if (hit) return hit.json();
    const meta = await (await fetch(`${API}${iso}/${lvl}/`, { cache: 'no-store' })).json();
    // github.com/<repo>/raw/<sha>/<file> risponde con un reindirizzamento senza CORS: si va diretti a media.githubusercontent.com
    const m = /^https:\/\/github\.com\/wmgeolab\/geoBoundaries\/raw\/([0-9a-f]+)\/(releaseData\/[\w\-\/.]+\.geojson)$/.exec((meta && meta.simplifiedGeometryGeoJSON) || '');
    if (!m) throw new Error('livello non disponibile');
    const url = `https://media.githubusercontent.com/media/wmgeolab/geoBoundaries/${m[1]}/${m[2]}`;
    const text = await (await fetch(url)).text();
    const gj = JSON.parse(text);
    if (!gj || !Array.isArray(gj.features)) throw new Error('dati non validi');
    await cache.put(key(iso, lvl), new Response(text, { headers: { 'Content-Type': 'application/json' } }));
    return gj;
  }

  // { adm1, adm2 } — un livello può mancare (null) se per quel paese non esiste
  function load(iso) {
    if (iso === DEFAULT) return Promise.reject(new Error('Italia: file inclusi'));
    return inflight[iso] || (inflight[iso] = (async () => {
      const [a1, a2] = await Promise.allSettled([level(iso, 'ADM1'), level(iso, 'ADM2')]);
      const adm1 = a1.status === 'fulfilled' ? a1.value : null, adm2 = a2.status === 'fulfilled' ? a2.value : null;
      if (!adm1 && !adm2) throw new Error('nessuna mappa disponibile per questo paese');
      Storage.set('offline-map-' + iso, 'done');
      return { adm1, adm2 };
    })().finally(() => { delete inflight[iso]; }));
  }

  const isOffline = iso => iso === DEFAULT ? !!Storage.get('offline-map') : !!Storage.get('offline-map-' + iso);

  // Cambio paese dal profilo; avvisa se non c'è internet per la mappa
  function choose(iso) {
    set(iso);
    if (iso !== DEFAULT && navigator.onLine) load(iso).catch(() => {});
    if (typeof DashboardModule !== 'undefined' && DashboardModule.refreshOfflineCard) DashboardModule.refreshOfflineCard();
  }

  return { COUNTRIES, DEFAULT, get, name, set, options, load, isOffline, choose };
})();
