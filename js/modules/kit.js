/* ============================================================
   Modulo Kit Emergenza — Checklist casa, auto, go-bag
   ============================================================ */
const KitModule = (() => {
  let initialized = false;
  let activeTab = 'casa';

  const KIT = {
    casa: {
      label: '🏠 Casa',
      categorie: [
        { nome: 'Acqua & Idratazione', items: [
          { id: 'c1',  nome: 'Acqua in bottiglia (min. 3L/persona)',       note: '72h minimo' },
          { id: 'c2',  nome: 'Taniche HDPE 10L con coperchio',              note: 'Per stoccaggio lungo termine' },
          { id: 'c3',  nome: 'Filtro acqua portatile (Sawyer/LifeStraw)',   note: 'Filtra qualsiasi fonte' },
          { id: 'c4',  nome: 'Candeggina non profumata (5-6%)',             note: 'Disinfezione acqua' },
          { id: 'c5',  nome: 'Pastiglie purificazione acqua',               note: 'Backup filtro' },
        ]},
        { nome: 'Cibo', items: [
          { id: 'c6',  nome: 'Scorte cibo a lunga conservazione 30gg',      note: 'Pasta, riso, legumi, conserve' },
          { id: 'c7',  nome: 'Apriscatole manuale',                          note: 'Fondamentale!' },
          { id: 'c8',  nome: 'Fornello da campeggio + ricariche gas',       note: 'Per cottura senza elettricità' },
          { id: 'c9',  nome: 'Pentola a pressione',                          note: 'Risparmia carburante di cottura' },
          { id: 'c10', nome: 'Multivitaminici e sali minerali',              note: 'Integrazione dieta emergenza' },
        ]},
        { nome: 'Illuminazione', items: [
          { id: 'c11', nome: 'Torce LED ricaricabili (x3)',                  note: 'Una per persona' },
          { id: 'c12', nome: 'Pile AA/AAA di scorta',                        note: 'Per radio e torce' },
          { id: 'c13', nome: 'Candele + accendino + fiammiferi',             note: 'Backup illuminazione' },
          { id: 'c14', nome: 'Lanterne solari ricaricabili',                 note: 'Senza costi operativi' },
          { id: 'c15', nome: 'Lampada a dinamo/manovella',                   note: 'Senza batterie' },
        ]},
        { nome: 'Comunicazione', items: [
          { id: 'c16', nome: 'Radio FM/AM portatile a batterie',             note: 'Info emergenza senza internet' },
          { id: 'c17', nome: 'Power bank 20.000mAh (x2)',                    note: 'Ricarica smartphone' },
          { id: 'c18', nome: 'Lista contatti emergenza stampata',            note: 'Non fare affidamento solo sul telefono' },
          { id: 'c19', nome: 'Walkie-talkie (coppia)',                       note: 'Comunicazione locale senza rete' },
        ]},
        { nome: 'Primo Soccorso', items: [
          { id: 'c20', nome: 'Kit primo soccorso completo',                  note: 'Garze, bende, laccio emostatico' },
          { id: 'c21', nome: 'Farmaci personali (scorta 3 mesi)',            note: 'Priorità assoluta' },
          { id: 'c22', nome: 'Antidolorifici (paracetamolo, ibuprofene)',    note: 'Scorta 3 mesi' },
          { id: 'c23', nome: 'Antibiotici (con prescrizione)',               note: 'Consulta il medico in anticipo' },
          { id: 'c24', nome: 'Termometro digitale',                          note: '' },
          { id: 'c25', nome: 'Antisettico (acqua ossigenata, betadine)',     note: '' },
          { id: 'c26', nome: 'Manuale primo soccorso stampato',              note: 'Funziona anche senza internet' },
        ]},
        { nome: 'Riscaldamento', items: [
          { id: 'c27', nome: 'Coperte termiche di emergenza (x4)',           note: 'Riflettono 90% calore corporeo' },
          { id: 'c28', nome: 'Stufa a pellet o legna (se possibile)',        note: 'Investimento a lungo termine' },
          { id: 'c29', nome: 'Stufa portatile a GPL (con ventilazione)',     note: 'Solo in ambienti ventilati' },
          { id: 'c30', nome: 'Abbigliamento termico layering (tutti)',       note: 'Base, mid, outer layer' },
        ]},
        { nome: 'Energia', items: [
          { id: 'c31', nome: 'Pannelli solari portatili 100W+',             note: 'Ricarica batterie/dispositivi' },
          { id: 'c32', nome: 'Batteria LiFePO4 stazionaria',                note: 'Stoccaggio energia' },
          { id: 'c33', nome: 'Generatore 2kW (con scorta carburante)',       note: 'Backup principale' },
          { id: 'c34', nome: 'Rilevatore CO + gas',                         note: 'OBBLIGATORIO con combustibili indoor' },
          { id: 'c35', nome: 'Estintore CO2 2kg',                           note: 'Sicurezza antincendio' },
        ]},
        { nome: 'Igiene & Sanitario', items: [
          { id: 'c36', nome: 'Sapone solido scorta 3 mesi',                  note: 'Durata indefinita' },
          { id: 'c37', nome: 'Salviettine umidificate (10 confezioni)',      note: 'Igiene senza acqua corrente' },
          { id: 'c38', nome: 'Carta igienica (scorta 3 mesi)',               note: '' },
          { id: 'c39', nome: 'Alcool isopropilico 70% (2L)',                 note: 'Disinfezione superfici e ferite' },
          { id: 'c40', nome: 'WC chimico portatile',                         note: 'Se acquedotto interrotto' },
        ]},
        { nome: 'Documenti & Contanti', items: [
          { id: 'c41', nome: 'Copie documenti in busta impermeabile',       note: 'Carta identità, codice fiscale, polizze' },
          { id: 'c42', nome: 'Contanti (500€+ in tagli piccoli)',           note: 'I bancomat non funzionano senza elettricità' },
          { id: 'c43', nome: 'Lista numeri emergenza stampata',              note: 'Protezione civile, medico, parenti' },
          { id: 'c44', nome: 'Copia polizze assicurative',                  note: '' },
        ]},
      ]
    },
    auto: {
      label: '🚗 Auto',
      categorie: [
        { nome: 'Emergenza Stradale', items: [
          { id: 'a1',  nome: 'Triangolo di emergenza + gilet rifrangente', note: 'Obbligatorio per legge' },
          { id: 'a2',  nome: 'Kit primo soccorso auto',                    note: 'Con coperta termica' },
          { id: 'a3',  nome: 'Cavi avviamento',                            note: 'Per batteria scarica' },
          { id: 'a4',  nome: 'Compressore aria portatile 12V',             note: 'Gonfia pneumatici' },
          { id: 'a5',  nome: 'Kit riparazione rapida pneumatici',          note: 'Fix-a-flat o kit tappabuchi' },
          { id: 'a6',  nome: 'Torcia impermeabile',                        note: '' },
        ]},
        { nome: 'Scorte in Auto', items: [
          { id: 'a7',  nome: 'Acqua (2L per persona)',                     note: 'Min. 48h' },
          { id: 'a8',  nome: 'Cibo emergenza 48h (barrette, frutta secca)', note: '' },
          { id: 'a9',  nome: 'Coperta termica',                            note: '' },
          { id: 'a10', nome: 'Cambio vestiti + impermeabile',               note: '' },
          { id: 'a11', nome: 'Caricabatterie auto USB',                    note: 'Ricarica dispositivi' },
          { id: 'a12', nome: 'Tanica carburante omologata 10L',            note: 'Scorta emergenza' },
        ]},
        { nome: 'Navigazione', items: [
          { id: 'a13', nome: 'Carta stradale cartacea zona',                note: 'Senza GPS funziona' },
          { id: 'a14', nome: 'Mappe offline scaricate (Maps.me)',           note: 'Funziona senza dati' },
          { id: 'a15', nome: 'Bussola',                                     note: '' },
        ]},
      ]
    },
    gobag: {
      label: '🎒 Go-Bag',
      categorie: [
        { nome: 'Il Go-Bag (72h)', items: [
          { id: 'g0',  nome: 'Zaino resistente 40-60L impermeabile',       note: 'Base del go-bag' },
        ]},
        { nome: 'Acqua & Cibo', items: [
          { id: 'g1',  nome: 'Acqua 3L in borraccia filtrante',            note: 'LifeStraw integrata' },
          { id: 'g2',  nome: 'Barrette energetiche (9 pezzi)',             note: '72h × 3 pasti' },
          { id: 'g3',  nome: 'Frutta secca e cioccolato fondente',         note: 'Alta densità calorica' },
          { id: 'g4',  nome: 'Pastiglie purificazione acqua',              note: '' },
        ]},
        { nome: 'Riparo & Calore', items: [
          { id: 'g5',  nome: 'Tenda bivacco / sacco a pelo',               note: 'Per riparo di emergenza' },
          { id: 'g6',  nome: 'Coperta termica emergenza (x2)',             note: '' },
          { id: 'g7',  nome: 'Accendino + fiammiferi impermeabili',        note: '' },
          { id: 'g8',  nome: 'Abbigliamento layering per 3 giorni',        note: 'Compatto e termico' },
          { id: 'g9',  nome: 'Impermeabile leggero',                       note: '' },
        ]},
        { nome: 'Comunicazione', items: [
          { id: 'g10', nome: 'Telefono + power bank carico',               note: '' },
          { id: 'g11', nome: 'Radio tascabile a manovella',                note: 'Senza batterie' },
          { id: 'g12', nome: 'Fischietto di segnalazione',                 note: 'Segnale soccorso' },
          { id: 'g13', nome: 'Lista contatti emergenza stampata',          note: '' },
        ]},
        { nome: 'Salute & Primo Soccorso', items: [
          { id: 'g14', nome: 'Kit primo soccorso compatto',                note: '' },
          { id: 'g15', nome: 'Farmaci personali 7 giorni',                 note: 'Priorità assoluta' },
          { id: 'g16', nome: 'Antidolorifici + antistaminici',             note: '' },
          { id: 'g17', nome: 'Salviettine disinfettanti',                  note: '' },
        ]},
        { nome: 'Documenti & Valore', items: [
          { id: 'g18', nome: 'Documenti in busta impermeabile',            note: 'CI, passaporto, tessera sanitaria' },
          { id: 'g19', nome: 'Contanti (200€ in tagli piccoli)',           note: '' },
          { id: 'g20', nome: 'Copia chiavi importanti',                    note: 'Casa, auto, ufficio' },
          { id: 'g21', nome: 'USB con copie digitali documenti',           note: 'Cifrata' },
        ]},
        { nome: 'Strumenti', items: [
          { id: 'g22', nome: 'Coltellino multiuso / Leatherman',           note: '' },
          { id: 'g23', nome: 'Torcia frontale LED + pile',                 note: '' },
          { id: 'g24', nome: 'Corda 10m',                                  note: 'Mille usi' },
          { id: 'g25', nome: 'Sacchi spazzatura robusti grandi (5)',       note: 'Impermeabilizzazione, riparo' },
          { id: 'g26', nome: 'Nastro adesivo resistente (Duct tape)',      note: 'Riparazioni rapide' },
        ]},
      ]
    }
  };

  function getTotalItems() {
    let total = 0;
    Object.values(KIT).forEach(tab => {
      tab.categorie.forEach(cat => { total += cat.items.length; });
    });
    return total;
  }

  function renderTab(tab) {
    activeTab = tab;
    const saved = Storage.get('kit-checks') || {};
    const kitData = KIT[tab];

    let totalTab = 0, checkedTab = 0;
    kitData.categorie.forEach(cat => {
      cat.items.forEach(item => {
        totalTab++;
        if (saved[item.id]) checkedTab++;
      });
    });
    const pct = totalTab > 0 ? Math.round((checkedTab / totalTab) * 100) : 0;

    const contentEl = document.getElementById('kit-content');
    contentEl.innerHTML = `
      <div class="card mb-16">
        <div class="flex-between">
          <span class="text-secondary text-sm">${checkedTab}/${totalTab} completati</span>
          <span class="font-bold text-accent">${pct}%</span>
        </div>
        <div class="progress-bar-container mt-8">
          <div class="progress-bar ${pct >= 80 ? 'success' : ''}" style="width:${pct}%"></div>
        </div>
      </div>
      ${kitData.categorie.map(cat => `
        <div class="card mb-16">
          <h3>${cat.nome}</h3>
          <ul class="checklist">
            ${cat.items.map(item => {
              const checked = saved[item.id];
              return `
                <li class="checklist-item ${checked ? 'checked' : ''}"
                  onclick="KitModule.toggleItem('${item.id}', this)">
                  <input type="checkbox" ${checked ? 'checked' : ''} onclick="event.stopPropagation()">
                  <div class="flex-1">
                    <div class="checklist-label">${item.nome}</div>
                    ${item.note ? `<div class="checklist-meta">${item.note}</div>` : ''}
                  </div>
                </li>
              `;
            }).join('')}
          </ul>
        </div>
      `).join('')}
      <div class="flex gap-8 mt-8">
        <button class="btn btn-outline btn-sm" onclick="KitModule.print()">🖨 Stampa</button>
        <button class="btn btn-outline btn-sm" onclick="KitModule.resetTab()">🔄 Reset</button>
      </div>
    `;
  }

  function toggleItem(id, el) {
    const saved = Storage.get('kit-checks') || {};
    saved[id] = !saved[id];
    Storage.set('kit-checks', saved);
    el.classList.toggle('checked', saved[id]);
    el.querySelector('input').checked = saved[id];
    updateTabBadges();
  }

  function updateTabBadges() {
    const saved = Storage.get('kit-checks') || {};
    Object.entries(KIT).forEach(([tabId, tabData]) => {
      let total = 0, checked = 0;
      tabData.categorie.forEach(cat => {
        cat.items.forEach(item => { total++; if (saved[item.id]) checked++; });
      });
      const badge = document.getElementById('kit-badge-' + tabId);
      if (badge) badge.textContent = `${checked}/${total}`;
    });
  }

  function resetTab() {
    const saved = Storage.get('kit-checks') || {};
    const tabData = KIT[activeTab];
    tabData.categorie.forEach(cat => {
      cat.items.forEach(item => { delete saved[item.id]; });
    });
    Storage.set('kit-checks', saved);
    renderTab(activeTab);
    updateTabBadges();
  }

  function print() { window.print(); }

  function init() {
    if (initialized) return;
    const root = document.getElementById('kit-root');
    if (!root) return;
    initialized = true;

    root.innerHTML = `
      <div class="tabs">
        ${Object.entries(KIT).map(([id, data]) => `
          <button class="tab-btn ${id === activeTab ? 'active' : ''}"
            onclick="KitModule.switchTab('${id}', this)">
            ${data.label} <span id="kit-badge-${id}" class="text-xs text-secondary"></span>
          </button>
        `).join('')}
      </div>
      <div id="kit-content"></div>
    `;

    renderTab(activeTab);
    updateTabBadges();
  }

  function switchTab(id, btn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTab(id);
  }

  return { init, toggleItem, switchTab, resetTab, print, getTotalItems };
})();
