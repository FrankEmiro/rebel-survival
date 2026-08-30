/* ============================================================
   Modulo Budget — Piano acquisti prioritizzato
   ============================================================ */
const BudgetModule = (() => {
  let initialized = false;

  const VOCI = [
    { id: 'acqua_cont',  cat: 'Acqua',    nome: 'Taniche 10L HDPE (set 5)',        costo: 25,   priorita: 1, desc: 'Stoccaggio acqua potabile' },
    { id: 'acqua_filt',  cat: 'Acqua',    nome: 'Filtro acqua portatile (Sawyer)',  costo: 35,   priorita: 2, desc: 'Filtra qualsiasi acqua' },
    { id: 'acqua_candeg',cat: 'Acqua',    nome: 'Candeggina 5L (3 bottiglie)',      costo: 10,   priorita: 3, desc: 'Disinfezione acqua, multiuso' },
    { id: 'cibo_base',   cat: 'Cibo',     nome: 'Scorte base 30gg (3 persone)',     costo: 280,  priorita: 4, desc: 'Pasta, riso, legumi, olio, conserve' },
    { id: 'cibo_vitamine',cat: 'Cibo',    nome: 'Multivitaminici 3 mesi',           costo: 25,   priorita: 5, desc: 'Integrazione micronutrienti' },
    { id: 'luce_torce',  cat: 'Illuminazione', nome: 'Torce LED ricaricabili (3)', costo: 40,   priorita: 6, desc: 'Illuminazione emergenza' },
    { id: 'luce_candele',cat: 'Illuminazione', nome: 'Candele (50 pz)',             costo: 15,   priorita: 7, desc: 'Backup illuminazione' },
    { id: 'luce_solar',  cat: 'Illuminazione', nome: 'Lanterne solari (2)',         costo: 30,   priorita: 8, desc: 'Ricarica solare, 0 costi operativi' },
    { id: 'comm_radio',  cat: 'Comunicazione', nome: 'Radio FM/AM a batterie',      costo: 30,   priorita: 9, desc: 'Info emergenza senza internet' },
    { id: 'comm_walkie', cat: 'Comunicazione', nome: 'Walkie-talkie (coppia)',       costo: 45,   priorita: 10, desc: 'Comunicazione locale senza rete' },
    { id: 'ps_kit',      cat: 'Primo Soccorso', nome: 'Kit primo soccorso completo', costo: 35,  priorita: 11, desc: 'Medicazioni, laccio, garze' },
    { id: 'ps_farmaci',  cat: 'Primo Soccorso', nome: 'Farmaci base scorta 3 mesi', costo: 80,   priorita: 12, desc: 'Antidolorifici, antibiotici, personali' },
    { id: 'risc_coperte',cat: 'Riscaldamento', nome: 'Coperte termiche emergenza (4)', costo: 20, priorita: 13, desc: 'Riflettono 90% calore corporeo' },
    { id: 'risc_pellet', cat: 'Riscaldamento', nome: 'Pellet 300kg (stagione)',      costo: 135, priorita: 14, desc: 'Se hai stufa a pellet' },
    { id: 'risc_stufa',  cat: 'Riscaldamento', nome: 'Stufa a gas portatile + 5 bombole', costo: 80, priorita: 15, desc: 'Riscaldamento/cottura emergenza' },
    { id: 'en_power',    cat: 'Energia',   nome: 'Power bank 20.000mAh',            costo: 50,   priorita: 16, desc: 'Ricarica smartphone/dispositivi' },
    { id: 'en_solar_sm', cat: 'Energia',   nome: 'Pannello solare 100W portatile',  costo: 120,  priorita: 17, desc: 'Ricarica batterie/dispositivi' },
    { id: 'en_gen',      cat: 'Energia',   nome: 'Generatore 2kW',                  costo: 450,  priorita: 18, desc: 'Backup energia principale' },
    { id: 'carb_tanica', cat: 'Carburante', nome: 'Taniche omologate + 20L scorta', costo: 45,   priorita: 19, desc: 'Max legale per privati' },
    { id: 'igiene',      cat: 'Igiene',    nome: 'Kit igiene 3 mesi (sapone, candeggina, alcool)', costo: 40, priorita: 20, desc: 'Prevenzione malattie' },
    { id: 'cucina_camp', cat: 'Cucina',    nome: 'Fornello da campeggio + gas',      costo: 45,   priorita: 21, desc: 'Cottura senza elettricità/gas rete' },
    { id: 'cucina_press',cat: 'Cucina',    nome: 'Pentola a pressione',              costo: 40,   priorita: 22, desc: 'Cottura veloce = meno carburante' },
    { id: 'semi',        cat: 'Orto',      nome: 'Semi orto non ibridi (set 20 varietà)', costo: 25, priorita: 23, desc: 'Produzione cibo autonoma' },
    { id: 'co_rilevatore', cat: 'Sicurezza', nome: 'Rilevatore CO + gas',           costo: 35,   priorita: 24, desc: 'Obbligatorio se usi combustibili indoor' },
    { id: 'co_estintore', cat: 'Sicurezza', nome: 'Estintore CO2 2kg',              costo: 30,   priorita: 25, desc: 'Sicurezza antincendio' },
  ];

  const HTML = `
    <div class="card">
      <h3>Il Tuo Budget</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Budget disponibile (€)</label>
          <input type="number" id="bu-budget" value="500" min="50" max="50000" step="50">
        </div>
        <div class="form-group">
          <label>Priorità massima</label>
          <select id="bu-priorita">
            <option value="tutte">Mostra tutto</option>
            <option value="critica" selected>Solo essenziale (fino a ~€300)</option>
            <option value="completa">Piano completo</option>
          </select>
        </div>
      </div>
      <button class="btn btn-primary btn-full mt-16" onclick="BudgetModule.calculate()">
        💶 Genera Piano Acquisti
      </button>
    </div>

    <div id="bu-results" class="hidden">
      <div class="results-panel">
        <h3>📊 Riepilogo</h3>
        <div class="three-col mb-16">
          <div class="mini-card">
            <div class="value" id="bu-res-speso">—</div>
            <div class="label">Costo piano selezionato</div>
          </div>
          <div class="mini-card">
            <div class="value" id="bu-res-resto">—</div>
            <div class="label">Budget rimanente</div>
          </div>
          <div class="mini-card">
            <div class="value" id="bu-res-voci">—</div>
            <div class="label">Voci incluse</div>
          </div>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar" id="bu-prog-bar" style="width:0%"></div>
        </div>
        <p class="text-xs text-secondary mt-8" id="bu-prog-label"></p>
      </div>

      <div class="card mt-16">
        <div class="flex-between mb-16">
          <h3>📋 Lista Acquisti</h3>
          <button class="btn btn-outline btn-sm" onclick="BudgetModule.print()">🖨 Stampa</button>
        </div>
        <div id="bu-lista"></div>
      </div>

      <div class="card mt-16">
        <h3>🛒 Voci Escluse per Budget</h3>
        <div id="bu-escluse"></div>
      </div>
    </div>
  `;

  function calculate() {
    const budget   = Utils.num(document.getElementById('bu-budget').value, 500);
    const priorita = document.getElementById('bu-priorita').value;

    let voci = [...VOCI].sort((a, b) => a.priorita - b.priorita);

    // Filtro priorità
    if (priorita === 'critica') voci = voci.filter(v => v.priorita <= 15);

    let speso = 0;
    const incluse = [];
    const escluse = [];

    voci.forEach(v => {
      if (speso + v.costo <= budget) {
        speso += v.costo;
        incluse.push(v);
      } else {
        escluse.push(v);
      }
    });

    document.getElementById('bu-res-speso').textContent = '€' + speso;
    document.getElementById('bu-res-resto').textContent = '€' + (budget - speso).toFixed(0);
    document.getElementById('bu-res-voci').textContent = incluse.length + ' voci';

    const pct = Math.min(100, Math.round((speso / budget) * 100));
    document.getElementById('bu-prog-bar').style.width = pct + '%';
    document.getElementById('bu-prog-label').textContent = `${pct}% del budget utilizzato`;

    // Raggruppa per categoria
    const perCat = {};
    incluse.forEach(v => {
      if (!perCat[v.cat]) perCat[v.cat] = [];
      perCat[v.cat].push(v);
    });

    const listaEl = document.getElementById('bu-lista');
    listaEl.innerHTML = Object.entries(perCat).map(([cat, items]) => `
      <div class="shop-category">
        <div class="shop-category-title">${cat}</div>
        ${items.map(i => `
          <div class="shop-item">
            <div>
              <div class="shop-item-name">${i.nome}</div>
              <div class="shop-item-note">${i.desc}</div>
            </div>
            <div class="shop-item-qty">€${i.costo}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

    const escluseEl = document.getElementById('bu-escluse');
    if (escluse.length > 0) {
      escluseEl.innerHTML = escluse.map(v => `
        <div class="result-row">
          <span class="result-label text-secondary">${v.nome}</span>
          <span class="result-value text-secondary">€${v.costo}</span>
        </div>
      `).join('');
    } else {
      escluseEl.innerHTML = `<p class="text-secondary text-sm">Budget sufficiente per tutto!</p>`;
    }

    document.getElementById('bu-results').classList.remove('hidden');
  }

  function print() { window.print(); }

  function init() {
    if (initialized) return;
    const root = document.getElementById('budget-root');
    if (!root) return;
    root.innerHTML = HTML;
    initialized = true;
  }

  return { init, calculate, print };
})();
