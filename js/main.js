/* ============================================================
   Main — routing SPA, navigazione, init
   ============================================================ */

const SECTION_TITLES = {
  home: 'Dashboard',
  acqua: 'Acqua',
  cibo: 'Cibo',
  energia: 'Energia',
  riscaldamento: 'Riscaldamento',
  carburante: 'Carburante',
  budget: 'Budget',
  kit: 'Kit Emergenza',
  'lista-spesa': 'Lista Spesa',
  guide: 'Guide Offline',
  settings: 'Dimensioni',
};

// Sezione corrente
let currentSection = 'home';

function navigateTo(section) {
  if (!document.getElementById('section-' + section)) return;

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

  // Scroll to top
  window.scrollTo(0, 0);

  // Init section if needed
  initSection(section);
}

function initSection(section) {
  switch (section) {
    case 'home':        DashboardModule.init(); break;
    case 'acqua':       AcquaModule.init(); break;
    case 'cibo':        CiboModule.init(); break;
    case 'energia':     EnergiaModule.init(); break;
    case 'riscaldamento': RiscaldamentoModule.init(); break;
    case 'carburante':  CarburanteModule.init(); break;
    case 'budget':      BudgetModule.init(); break;
    case 'kit':         KitModule.init(); break;
    case 'lista-spesa': ListaSpesaModule.init(); break;
    case 'guide':       GuideModule.init(); break;
    case 'settings':    SettingsModule.init(); break;
  }
}

// Bind navigation clicks
function bindNavClicks() {
  document.querySelectorAll('[data-section], [data-nav]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const target = el.dataset.section || el.dataset.nav;
      if (target) navigateTo(target);
    });
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

// App init
document.addEventListener('DOMContentLoaded', () => {
  bindNavClicks();
  initOfflineDetection();
  registerSW();
  navigateTo('home');
});
