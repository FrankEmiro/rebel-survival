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
// Come scrivere il numero di soccorso del paese scelto nei testi (es. «112» o «numero di emergenza locale»)
const EMG = () => CountryMaps.emergency().label;
// Il numero come link per chiamare (se il paese non ha un numero indicato: solo testo)
const EMGLINK = () => { const e = CountryMaps.emergency(); return e.gen ? `<a href="tel:${e.gen}">${e.gen}</a>` : 'numero di emergenza locale'; };
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
  /* Numeri di soccorso per paese: [generale, ambulanza, vigili del fuoco, polizia, altro numero che funziona].
     null = non indicato. Dati copiati da una fonte NON ufficiale (Wikipedia, «List of emergency telephone numbers»):
     vanno verificati su fonti ufficiali dei singoli paesi. Dove la fonte è ambigua o manca il numero si lascia null
     e l'app dice di cercare il numero locale (non si inventa). */
  const EMERGENCY = {
    ITA: ['112', '118', '115', '113'],
    AUT: ['112'], BEL: ['112'], BGR: ['112'], HRV: ['112'], CZE: ['112'], DNK: ['112'], EST: ['112'], FIN: ['112'],
    FRA: ['112'], DEU: ['112'], GRC: ['112'], HUN: ['112'], LVA: ['112'], LTU: ['112'], LUX: ['112'], MLT: ['112'],
    NLD: ['112'], POL: ['112'], PRT: ['112'], ROU: ['112'], SVK: ['112'], SVN: ['112'], ESP: ['112'], SWE: ['112'],
    CYP: ['112', null, null, null, '199'], IRL: ['112', null, null, null, '999'], GBR: ['999', null, null, null, '112'],
    CHE: ['112', '144', '118', '117'], NOR: ['112', '113', '110', '112'], ISL: ['112'], ALB: ['112'], SRB: ['112'],
    MNE: ['112'], MKD: ['112'], UKR: ['112'], MDA: ['112'], TUR: ['112'],
    BIH: [null], BLR: [null], XKX: [null], MAR: ['112'], EGY: ['112'], ISR: ['112'], JOR: ['112'], ZAF: ['112'],
    DZA: [null], TUN: [null], LBY: [null], LBN: ['999', null, null, null, '112'], SAU: ['911'], ARE: [null, '998', '997', '999'],
    USA: ['911'], CAN: ['911'], MEX: ['911'], PHL: ['911'], ARG: ['911'], PER: ['911'],
    BRA: [null, '192', '193', '190'], CHL: ['133', '131', '132', '133'], COL: ['123'],
    AUS: ['000', null, null, null, '112'], NZL: ['111'], JPN: [null, '119', '119', '110'], IND: ['112', '108', '101', '100'],
  };
  const inflight = {};
  // Numeri di soccorso del paese scelto. gen = numero generale (null se non indicato) e label = come scriverlo nei testi
  function emergency(iso = get()) {
    const e = EMERGENCY[iso] || [null];
    const gen = e[0] || null;
    return { gen, amb: e[1] || null, fire: e[2] || null, police: e[3] || null, alt: e[4] || null,
      label: gen || 'numero di emergenza locale', known: !!gen, official: iso === DEFAULT };
  }

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
    applyEmergencyText();
    if (typeof DashboardModule !== 'undefined' && DashboardModule.refreshOfflineCard) DashboardModule.refreshOfflineCard();
  }

  // Avviso iniziale in index.html: numero del paese scelto; fuori dall'Italia si toglie «115, 118» (numeri italiani)
  function applyEmergencyText() {
    const e = emergency();
    document.querySelectorAll('[data-emg-gen]').forEach(n => { n.textContent = e.label; });
    document.querySelectorAll('[data-emg-more]').forEach(n => { n.hidden = !e.official; });
    if (typeof DashboardModule !== 'undefined' && DashboardModule.refreshEmergency) DashboardModule.refreshEmergency();
  }
  document.addEventListener('DOMContentLoaded', () => { try { applyEmergencyText(); } catch (e) {} });

  return { COUNTRIES, DEFAULT, EMERGENCY, applyEmergencyText, emergency, get, name, set, options, load, isOffline, choose };
})();
