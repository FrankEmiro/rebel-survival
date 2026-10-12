const CACHE_NAME = 'kit-resilienza-v57';
const CDN_CACHE  = 'kit-resilienza-cdn-v51';

// Asset locali — cache-first
const LOCAL_ASSETS = [
  '/',
  '/index.html',
  '/css/app.css',
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
  '/js/vendor/qrcode/qrcode.js',
  '/js/vendor/qrcode/qrcode_UTF8.js',
  '/js/data/guides.js',
  '/js/modules/guide.js',
  '/js/modules/settings.js',
  '/js/modules/dashboard.js',
  '/js/modules/onboarding.js',
  '/js/modules/strumenti.js',
  '/js/vendor/phosphor/style.css',
  '/js/vendor/phosphor/Phosphor.woff2',
  '/js/vendor/leaflet/leaflet.js',
  '/js/vendor/leaflet/leaflet.css',
  '/js/data/italy-regions.geojson',
  '/js/data/italy-provinces.geojson',
  '/manifest.json',
  '/icons/icon-2-192.png',
  '/icons/icon-2-512.png',
  '/guides/pc/multirischio.pdf',
  '/guides/pc/terremoto.pdf',
  '/guides/pc/alluvione.pdf',
  '/guides/pc/maremoto.pdf',
  '/guides/pc/vulcano.pdf',
  '/guides/pc/incendi-boschivi.pdf',
];

// CDN esterni — network-first con fallback cache
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com', 'tile.openstreetmap.org'];

// Cache dei "pacchetti offline" scaricati manualmente dall'utente (immagini guide,
// confini comunali/province, tile mappa area locale) — NON vanno cancellate ad ogni
// aggiornamento del service worker, altrimenti l'utente perderebbe silenziosamente
// i download offline al prossimo deploy dell'app.
const PACK_CACHES = ['kit-resilienza-guides', 'kit-resilienza-map', 'kit-resilienza-tiles'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(LOCAL_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME && k !== CDN_CACHE && !PACK_CACHES.includes(k))
            .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  const isCDN = CDN_HOSTS.some(h => url.hostname.includes(h));

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
