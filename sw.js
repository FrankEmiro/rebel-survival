const CACHE_NAME = 'kit-resilienza-v131';
const CDN_CACHE  = 'kit-resilienza-cdn-v51';

// Asset locali — cache-first
const LOCAL_ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
  '/css/fonts.css',
  '/legal/legal.css',
  '/legal/privacy.html',
  '/legal/condizioni.html',
  '/legal/licenze.html',
  '/fonts/jetbrains-mono-latin-1.woff2',
  '/fonts/jetbrains-mono-latin-ext-0.woff2',
  '/fonts/nunito-latin-3.woff2',
  '/fonts/nunito-latin-ext-2.woff2',
  '/fonts/rajdhani-latin-11.woff2',
  '/fonts/rajdhani-latin-5.woff2',
  '/fonts/rajdhani-latin-7.woff2',
  '/fonts/rajdhani-latin-9.woff2',
  '/fonts/rajdhani-latin-ext-10.woff2',
  '/fonts/rajdhani-latin-ext-4.woff2',
  '/fonts/rajdhani-latin-ext-6.woff2',
  '/fonts/rajdhani-latin-ext-8.woff2',
  '/css/print.css',
  '/js/main.js',
  '/js/utils.js',
  '/js/storage.js',
  '/js/modules/acqua.js',
  '/js/modules/cibo.js',
  '/js/modules/energia.js',
  '/js/modules/riscaldamento.js',
  '/js/modules/carburante.js',
  '/js/modules/scenari.js',
  '/js/modules/kit.js',
  '/js/modules/lista-spesa.js',
  '/js/modules/condividi.js',
  '/js/modules/copia-offline.js',
  '/js/vendor/qrcode/qrcode.js',
  '/js/vendor/qrcode/qrcode_UTF8.js',
  '/js/data/guides.js',
  '/js/modules/guide.js',
  '/js/modules/settings.js',
  '/js/modules/dashboard.js',
  '/js/modules/onboarding.js',
  '/js/modules/strumenti.js',
  '/js/modules/assistente.js',
  '/js/vendor/fzstd.min.js',
  '/js/modules/paesi.js',
  '/js/modules/zim.js',
  '/js/modules/wiki.js',
  '/js/modules/chat.js',
  '/js/vendor/phosphor/style.css',
  '/js/vendor/phosphor/Phosphor.woff2',
  '/js/vendor/leaflet/leaflet.js',
  '/js/vendor/leaflet/leaflet.css',
  '/js/data/italy-regions.geojson',
  '/js/data/italy-provinces.geojson',
  '/manifest.json',
  '/icons/icon-rs-192.png',
  '/icons/icon-rs-512.png',
  '/icons/icon-rs-maskable-512.png',
  '/icons/icon-rs-180.png',
  '/guides/pc/multirischio.pdf',
  '/guides/pc/terremoto.pdf',
  '/guides/pc/alluvione.pdf',
  '/guides/pc/maremoto.pdf',
  '/guides/pc/vulcano.pdf',
  '/guides/pc/incendi-boschivi.pdf',
];

// CDN esterni — network-first con fallback cache
const CDN_HOSTS = ['tile.openstreetmap.org'];

// Cache dei "pacchetti offline" scaricati manualmente dall'utente (immagini guide,
// confini comunali/province, tile mappa area locale) — NON vanno cancellate ad ogni
// aggiornamento del service worker, altrimenti l'utente perderebbe silenziosamente
// i download offline al prossimo deploy dell'app.
const PACK_CACHES = ['kit-resilienza-guides', 'kit-resilienza-map', 'kit-resilienza-tiles', 'kit-resilienza-ai-lib'];

// AI locale (facoltativa): la libreria WebLLM (versione fissa su jsDelivr) va in
// cache-first per funzionare offline; il modello lo salva WebLLM nelle sue cache
// "webllm/..." che NON vanno cancellate (sono ~1 GB scaricato dall'utente).
const AI_LIB_HOSTS = ['cdn.jsdelivr.net'];
const AI_BYPASS_HOSTS = ['huggingface.co', 'hf.co', 'raw.githubusercontent.com'];
const AI_LIB_CACHE = 'kit-resilienza-ai-lib';

self.addEventListener('install', e => {
  e.waitUntil(
    // cache: 'reload' = scarica dal server, non dalla cache HTTP del browser.
    // nginx serve JS/CSS con "immutable 1y": senza questo, al cambio di versione
    // il service worker rimetterebbe in cache i file VECCHI.
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(LOCAL_ASSETS.map(u => new Request(u, { cache: 'reload' }))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== CDN_CACHE && !PACK_CACHES.includes(k) && !k.startsWith('webllm'))
            .map(k => caches.delete(k))
      )
    ).then(() => caches.open('kit-resilienza-guides')).then(async c => {
      // illustrazioni vecchie in PNG (sostituite da WebP, v97): liberano spazio nel telefono
      for (const r of await c.keys()) if (/\/js\/images\/guides\/.*\.png$/.test(r.url)) await c.delete(r);
    }).catch(() => {})
  );
  self.clients.claim();
});

// l'app chiede quale versione l'ha servita (per capire se serve ricaricare)
self.addEventListener('message', e => {
  if (e.data === 'version' && e.ports && e.ports[0]) e.ports[0].postMessage(CACHE_NAME);
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isCDN = CDN_HOSTS.some(h => url.hostname.includes(h));

  // download del modello AI: lo gestisce WebLLM, il service worker non interviene
  if (AI_BYPASS_HOSTS.some(h => url.hostname === h || url.hostname.endsWith('.' + h))) return;

  if (AI_LIB_HOSTS.includes(url.hostname)) {
    e.respondWith(
      caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
        if (res.ok) { const clone = res.clone(); caches.open(AI_LIB_CACHE).then(c => c.put(e.request, clone)); }
        return res;
      }))
    );
    return;
  }

  if (isCDN) {
    // Network-first per CDN, fallback a cache
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CDN_CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache-first per asset locali
    e.respondWith(
      caches.match(e.request, { ignoreSearch: e.request.mode === 'navigate' }).then(cached => cached || fetch(e.request))
    );
  }
});
