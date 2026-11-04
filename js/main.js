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
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

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
