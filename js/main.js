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
  kit: 'Kit & Lista Spesa',
  guide: 'Guide Offline',
  settings: 'Dimensioni',
  strumenti: 'Strumenti di Campo',
};

// Sezione corrente
let currentSection = 'home';

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
    case 'kit':         KitModule.init(); switchKitTab('kit'); break;
    case 'guide':       GuideModule.init(); break;
    case 'settings':    SettingsModule.init(); break;
    case 'strumenti':   StrumentiModule.init(); break;
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
  });

  if (!localStorage.getItem('disclaimer_accepted')) {
    overlay.classList.remove('hidden');
  }
}

// App init
document.addEventListener('DOMContentLoaded', () => {
  bindNavClicks();
  initOfflineDetection();
  registerSW();
  initDisclaimer();
  navigateTo('home');
});
