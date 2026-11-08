/* ============================================================
   Main — routing SPA, navigazione, init
   ============================================================ */

const SECTION_TITLES = {
  home: 'Home',
  acqua: 'Acqua',
  cibo: 'Cibo',
  energia: 'Energia',
  riscaldamento: 'Riscaldamento',
  carburante: 'Carburante',
  kit: 'Scorte',
  guide: 'Guide',
  settings: 'Profilo',
  strumenti: 'Emergenza',
  assistente: 'Chiedi',
};

// Sezione corrente
let currentSection = 'home';

// Freccia "Indietro": dopo aver aperto una guida o il Piano da un'azione della Home,
// riporta lì (stessa posizione di scroll) invece di ripartire da zero
let backTarget = null;
function setBackTarget(section) {
  backTarget = { section, y: window.scrollY };
}
function clearBackTarget() {
  backTarget = null;
  document.getElementById('back-btn').classList.add('hidden');
}
function goBack() {
  if (!backTarget) return;
  const { section, y } = backTarget;
  clearBackTarget();
  navigateTo(section);
  setTimeout(() => window.scrollTo(0, y), 60);
}

function switchKitTab(tab) {
  document.querySelectorAll('.kit-itab').forEach(b => b.classList.toggle('active', b.dataset.kitTab === tab));
  document.getElementById('kit-root').classList.toggle('hidden', tab !== 'kit');
  document.getElementById('lista-spesa-root').classList.toggle('hidden', tab !== 'lista-spesa');
  if (tab === 'lista-spesa') ListaSpesaModule.init();
  if (tab === 'kit') KitModule.init();
}

function navigateTo(section) {
  // lista-spesa è ora un tab interno a section-kit
  if (section === 'lista-spesa') {
    navigateTo('kit');
    switchKitTab('lista-spesa');
    return;
  }
  if (!document.getElementById('section-' + section)) return;

  // Ferma sensori/mappa/stream della sezione Strumenti prima di lasciarla
  // (GPS, bussola, torcia, wake lock) per evitare che restino attivi in background
  if (currentSection === 'strumenti' && section !== 'strumenti' && typeof StrumentiModule !== 'undefined') {
    StrumentiModule.destroy();
  }

  // Hide all sections
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  // Show target
  document.getElementById('section-' + section).classList.add('active');

  // Update nav links (sidebar)
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === section);
  });

  // Update bottom nav
  document.querySelectorAll('.bottom-nav-item').forEach(l => {
    l.classList.toggle('active', l.dataset.section === section);
  });

  // Update topbar title
  document.getElementById('page-title').textContent = SECTION_TITLES[section] || section;

  currentSection = section;
  document.getElementById('back-btn').classList.toggle('hidden', !backTarget || backTarget.section === section);
  // arrivando dalla Home basta la freccia in alto: il pulsante «← Profilo» dei calcolatori confonderebbe
  document.querySelectorAll('.calc-back').forEach(b => b.classList.toggle('hidden', !!backTarget && backTarget.section !== section));

  // Scroll to top
  window.scrollTo(0, 0);

  // Init section if needed
  initSection(section);
}

// Calcolatori di dettaglio: raggiungibili solo dal Piano → mostra "← Piano"
const CALC_SECTIONS = ['acqua', 'cibo', 'energia', 'riscaldamento', 'carburante'];

function addCalcBackButtons() {
  CALC_SECTIONS.forEach(id => {
    const header = document.querySelector('#section-' + id + ' .section-header');
    if (!header || header.querySelector('.calc-back')) return;
    const btn = document.createElement('button');
    btn.className = 'btn btn-outline btn-sm calc-back';
    btn.innerHTML = '<i class="ph ph-arrow-left"></i> Profilo';
    btn.addEventListener('click', () => {
      navigateTo('settings');
      setTimeout(() => SettingsModule._tab(id === 'riscaldamento' ? 'calore' : id === 'carburante' ? 'mobilita' : id), 0);
    });
    header.prepend(btn);
  });
}

function initSection(section) {
  switch (section) {
    case 'home':        DashboardModule.init(); break;
    case 'acqua':       AcquaModule.init(); break;
    case 'cibo':        CiboModule.init(); break;
    case 'energia':     EnergiaModule.init(); break;
    case 'riscaldamento': RiscaldamentoModule.init(); break;
    case 'carburante':  CarburanteModule.init(); break;
    case 'kit':         KitModule.init(); switchKitTab('kit'); break;
    case 'guide':       GuideModule.init(); break;
    case 'assistente':  AssistenteModule.init(); break;
    case 'settings':    SettingsModule.init(); break;
    case 'strumenti':   DashboardModule.renderEmergency(); StrumentiModule.init(); break;
  }
}

// Bind navigation clicks
function bindNavClicks() {
  document.querySelectorAll('[data-section], [data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.section || el.dataset.nav;
      clearBackTarget();
      if (target) navigateTo(target);
    });
  });
  document.querySelectorAll('[data-kit-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchKitTab(btn.dataset.kitTab));
  });
}

// Offline detection
function initOfflineDetection() {
  const badge = document.getElementById('offline-badge');
  const update = () => badge.classList.toggle('hidden', navigator.onLine);
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
}

// Service Worker registration
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').then(AppUpdate.watch).catch(() => {});
  }
}

/* Aggiornamenti dall'app: «Cerca aggiornamenti» nel Profilo, avviso quando
   una nuova versione si installa da sola, interruttore funzioni sperimentali
   (nascosto: si mostra toccando 5 volte il numero di versione). I dati
   dell'utente (localStorage, pacchetti offline, modello AI) non vengono toccati. */
const AppUpdate = (() => {
  let reloading = false, taps = 0;
  const startedAt = Date.now();
  const reloadOnce = () => { if (!reloading) { reloading = true; location.reload(); } };
  const say = t => { const el = document.getElementById('app-upd-msg'); if (el) el.textContent = t; };
  const num = name => { const m = /^kit-resilienza-v(\d+)$/.exec(name || ''); return m ? +m[1] : 0; };

  // versione più nuova scaricata nel telefono (può essere più nuova di quella in uso)
  async function latest() {
    try { return Math.max(0, ...(await caches.keys()).map(num)); } catch (e) { return 0; }
  }
  // versione che ha servito QUESTA pagina: la si chiede al service worker all'avvio
  const running = new Promise(resolve => {
    const ctl = navigator.serviceWorker && navigator.serviceWorker.controller;
    if (!ctl) return resolve(0);
    const ch = new MessageChannel();
    ch.port1.onmessage = e => resolve(num(e.data));
    setTimeout(() => resolve(0), 3000);   // service worker vecchio, che non risponde
    ctl.postMessage('version', [ch.port2]);
  });
  async function stale() {
    const [r, l] = await Promise.all([running, latest()]);
    return l > 0 && (r === 0 || l > r);
  }

  // nuova versione installata in background mentre l'app è aperta:
  // se l'app è stata appena aperta ed è sulla Home, ricarica da sola;
  // altrimenti (es. pagina Emergenza aperta) mostra solo l'avviso «Ricarica».
  function watch() {
    if (!navigator.serviceWorker.controller) return;   // primo avvio: niente da aggiornare
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (reloading) return;
      if (Date.now() - startedAt < 20000 && currentSection === 'home') reloadOnce();
      else _toast();
    });
  }
  function _toast() {
    if (document.getElementById('upd-toast')) return;
    const d = document.createElement('div');
    d.id = 'upd-toast'; d.className = 'upd-toast';
    d.innerHTML = '<span>Nuova versione dell\'app pronta.</span><button onclick="location.reload()">Ricarica</button>';
    document.body.appendChild(d);
  }

  async function check() {
    if (!('serviceWorker' in navigator)) return say('Aggiornamento non disponibile su questo browser.');
    if (!navigator.onLine) return say('Serve internet per cercare aggiornamenti.');
    say('Cerco aggiornamenti…');
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (!reg) { await navigator.serviceWorker.register('/sw.js'); return say('Fatto. Chiudi e riapri l\'app.'); }
      await reg.update();
      const nw = reg.installing || reg.waiting;
      if (!nw) {
        // già scaricata in background ma la pagina usa ancora i file vecchi: ricarica
        if (await stale()) { say('Applico la nuova versione…'); return reloadOnce(); }
        return say('Hai già l\'ultima versione.');
      }
      say('Scarico la nuova versione…');
      navigator.serviceWorker.addEventListener('controllerchange', reloadOnce);
      nw.addEventListener('statechange', () => {
        if (nw.state === 'activated') reloadOnce();
        if (nw.state === 'redundant') say('Aggiornamento non riuscito. Riprova.');
      });
      if (nw.state === 'activated') reloadOnce();
    } catch (e) { say('Non riesco a controllare ora. Riprova più tardi.'); }
  }

  const labOn = () => Storage.get('lab', false) === true;
  function setLab(on) {
    Storage.set('lab', !!on);
    say(on ? 'Funzioni sperimentali attive: le trovi in «Chiedi».' : 'Funzioni sperimentali disattivate.');
  }
  function tapVersion() {
    if (++taps < 5) return;
    taps = 0;
    const box = document.getElementById('app-lab-box');
    if (box) box.classList.remove('hidden');
  }
  async function render() {
    const v = document.getElementById('app-ver');
    if (v) {
      const [r, l] = await Promise.all([running, latest()]);
      v.textContent = r ? 'v' + r : (l ? 'v' + l : '—');
      if (await stale()) say(`È pronta la v${l}: tocca «Cerca aggiornamenti» per applicarla.`);
    }
    const box = document.getElementById('app-lab-box'), cb = document.getElementById('app-lab');
    if (cb) cb.checked = labOn();
    if (box && labOn()) box.classList.remove('hidden');
  }

  return { check, watch, setLab, tapVersion, render };
})();

// Disclaimer
function showDisclaimer() {
  document.getElementById('disclaimer-overlay').classList.remove('hidden');
}

function initDisclaimer() {
  const overlay = document.getElementById('disclaimer-overlay');
  const btn = document.getElementById('disclaimer-accept');

  btn.addEventListener('click', () => {
    overlay.classList.add('hidden');
    localStorage.setItem('disclaimer_accepted', '1');
    OnboardingModule.maybeStart();
  });

  if (!localStorage.getItem('disclaimer_accepted')) {
    overlay.classList.remove('hidden');
  }
}

// App init
document.addEventListener('DOMContentLoaded', () => {
  bindNavClicks();
  document.getElementById('back-btn').addEventListener('click', goBack);
  addCalcBackButtons();
  initOfflineDetection();
  registerSW();
  initDisclaimer();
  // Scorciatoia "Emergenza" della PWA (icona sulla schermata del telefono): /?mode=emergenza
  navigateTo(new URLSearchParams(location.search).get('mode') === 'emergenza' ? 'strumenti' : 'home');
  if (localStorage.getItem('disclaimer_accepted')) OnboardingModule.maybeStart();
});
