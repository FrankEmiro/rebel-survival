/* ============================================================
   Modulo Energia — Autonomia elettrica domestica
   ============================================================ */
const EnergiaModule = (() => {
  let initialized = false;

  const DISPOSITIVI = [
    { id: 'frigo',     nome: 'Frigorifero',          watt: 150,  hDay: 8,   priorita: 1, categoria: 'Conservazione' },
    { id: 'freezer',   nome: 'Congelatore',           watt: 200,  hDay: 8,   priorita: 2, categoria: 'Conservazione' },
    { id: 'led1',      nome: 'Illuminazione LED (4 ambienti)', watt: 40, hDay: 6, priorita: 3, categoria: 'Illuminazione' },
    { id: 'telefono',  nome: 'Smartphone (ricarica)', watt: 10,  hDay: 2,   priorita: 4, categoria: 'Comunicazione' },
    { id: 'radio',     nome: 'Radio portatile',        watt: 5,   hDay: 4,   priorita: 5, categoria: 'Comunicazione' },
    { id: 'pompa',     nome: 'Pompa acqua (se pozzo)', watt: 750, hDay: 1,   priorita: 6, categoria: 'Acqua' },
    { id: 'laptop',    nome: 'Laptop',                 watt: 45,  hDay: 6,   priorita: 7, categoria: 'Lavoro' },
    { id: 'router',    nome: 'Router WiFi',             watt: 10,  hDay: 12,  priorita: 8, categoria: 'Comunicazione' },
    { id: 'tv',        nome: 'TV 40"',                  watt: 80,  hDay: 4,   priorita: 9, categoria: 'Intrattenimento' },
    { id: 'lavatrice', nome: 'Lavatrice (per ciclo)',   watt: 500, hDay: 0.5, priorita: 10, categoria: 'Domestico' },
    { id: 'microonde', nome: 'Microonde',               watt: 1000, hDay: 0.25, priorita: 11, categoria: 'Cucina' },
    { id: 'boiler',    nome: 'Boiler elettrico',        watt: 2000, hDay: 1,   priorita: 12, categoria: 'Acqua calda' },
  ];

  const HTML = `
    <div class="card">
      <h3>Fonti Energetiche Disponibili</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Pannelli Solari (Wp totali)</label>
          <input type="number" id="en-pannelli" value="0" min="0" max="20000" step="100">
          <span class="form-hint">Es: 2 pannelli da 400W = 800</span>
        </div>
        <div class="form-group">
          <label>Batteria (kWh)</label>
          <input type="number" id="en-batteria" value="0" min="0" max="100" step="0.5">
          <span class="form-hint">Capacità utile (LiFePO4 ~90%)</span>
        </div>
        <div class="form-group">
          <label>Generatore (Watt)</label>
          <input type="number" id="en-generatore" value="0" min="0" max="10000" step="100">
          <span class="form-hint">Potenza nominale</span>
        </div>
      </div>
      <div class="form-group">
        <label>Stagione (influenza produzione solare)</label>
        <select id="en-stagione">
          <option value="estate">Estate (max produzione)</option>
          <option value="primavera" selected>Primavera/Autunno</option>
          <option value="inverno">Inverno (min produzione)</option>
        </select>
      </div>
    </div>

    <div class="card mt-16">
      <h3>Dispositivi da Alimentare</h3>
      <p class="text-secondary text-sm mb-16">Seleziona i dispositivi essenziali e modifica watt/ore se necessario</p>
      <div id="en-dispositivi-list"></div>
      <div class="form-row mt-16">
        <div class="form-group">
          <label>Dispositivo personalizzato</label>
          <input type="text" id="en-custom-nome" placeholder="Nome dispositivo">
        </div>
        <div class="form-group">
          <label>Watt</label>
          <input type="number" id="en-custom-watt" placeholder="100" min="1">
        </div>
        <div class="form-group">
          <label>Ore/giorno</label>
          <input type="number" id="en-custom-hday" placeholder="4" min="0.1" step="0.5">
        </div>
      </div>
      <button class="btn btn-outline btn-sm" onclick="EnergiaModule.addCustom()">+ Aggiungi</button>
      <button class="btn btn-primary btn-full mt-16" onclick="EnergiaModule.calculate()">
        🔋 Calcola Autonomia
      </button>
    </div>

    <div id="en-results" class="hidden">
      <div class="results-panel">
        <h3>📊 Risultati</h3>
        <div class="three-col mb-16">
          <div class="mini-card">
            <div class="value" id="en-res-consumo">—</div>
            <div class="label">kWh/giorno selezionati</div>
          </div>
          <div class="mini-card">
            <div class="value" id="en-res-prod">—</div>
            <div class="label">kWh/giorno prodotti</div>
          </div>
          <div class="mini-card">
            <div class="value" id="en-res-autonomia">—</div>
            <div class="label">Autonomia batteria</div>
          </div>
        </div>
        <div id="en-bilancio-alert"></div>
      </div>

      <div class="card mt-16">
        <h3>📋 Priorità Consumi</h3>
        <p class="text-secondary text-sm mb-16">In caso di autonomia limitata, spegni dall'ultimo verso il primo</p>
        <div id="en-priorita-list"></div>
      </div>

      <div class="card mt-16">
        <h3>⛽ Carburante Generatore (se usato)</h3>
        <div id="en-generatore-info"></div>
      </div>
    </div>
  `;

  let customDevices = [];
  let selectedDevices = {};

  function renderDevices() {
    const list = document.getElementById('en-dispositivi-list');
    const allDevices = [...DISPOSITIVI, ...customDevices];
    list.innerHTML = allDevices.map(d => `
      <div class="checklist-item" style="cursor:default">
        <input type="checkbox" id="dev-${d.id}" ${selectedDevices[d.id] !== false ? 'checked' : ''}
          onchange="EnergiaModule.toggleDevice('${d.id}')">
        <div style="flex:1">
          <div class="checklist-label">${Utils.escapeHtml(d.nome)}</div>
          <div class="checklist-meta">${Utils.escapeHtml(d.categoria)}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <input type="number" id="watt-${d.id}" value="${d.watt}" min="1"
            style="width:70px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);padding:4px 6px;font-size:0.8rem">
          <span class="text-secondary text-xs">W ×</span>
          <input type="number" id="hday-${d.id}" value="${d.hDay}" min="0.1" step="0.5"
            style="width:50px;background:var(--bg-secondary);border:1px solid var(--border);border-radius:4px;color:var(--text-primary);padding:4px 6px;font-size:0.8rem">
          <span class="text-secondary text-xs">h/g</span>
        </div>
      </div>
    `).join('');
  }

  function toggleDevice(id) {
    selectedDevices[id] = document.getElementById('dev-' + id).checked;
  }

  function addCustom() {
    const nome = document.getElementById('en-custom-nome').value.trim();
    const watt = parseFloat(document.getElementById('en-custom-watt').value);
    const hDay = parseFloat(document.getElementById('en-custom-hday').value);
    if (!nome || !watt || !hDay) { alert('Compila tutti i campi'); return; }
    const id = 'custom_' + Date.now();
    customDevices.push({ id, nome, watt, hDay, priorita: 99, categoria: 'Personalizzato' });
    document.getElementById('en-custom-nome').value = '';
    document.getElementById('en-custom-watt').value = '';
    document.getElementById('en-custom-hday').value = '';
    renderDevices();
  }

  function calculate() {
    const pannelli   = Utils.num(document.getElementById('en-pannelli').value, 0);
    const batteria   = Utils.num(document.getElementById('en-batteria').value, 0);
    const generatore = Utils.num(document.getElementById('en-generatore').value, 0);
    const stagione   = document.getElementById('en-stagione').value;

    // Produzione solare in Nord Italia (ore equivalenti di picco)
    const orePicco = { estate: 5.5, primavera: 3.5, inverno: 1.5 };
    const prodSolare = (pannelli / 1000) * orePicco[stagione] * 0.85; // kWh/giorno (85% efficienza)

    // Calcola consumi selezionati
    const allDevices = [...DISPOSITIVI, ...customDevices];
    let consumoTotale = 0;
    let deviceResults = [];

    allDevices.forEach(d => {
      const checked = document.getElementById('dev-' + d.id)?.checked;
      if (!checked) return;
      const watt = Utils.num(document.getElementById('watt-' + d.id)?.value, d.watt);
      const hDay = Utils.num(document.getElementById('hday-' + d.id)?.value, d.hDay);
      const kwhDay = (watt * hDay) / 1000;
      consumoTotale += kwhDay;
      deviceResults.push({ ...d, watt, hDay, kwhDay });
    });

    consumoTotale = +consumoTotale.toFixed(3);

    // Autonomia batteria senza prod. solare
    const batteriaUtile = batteria * 0.9; // LiFePO4 90% DoD
    const deficitGiorno = Math.max(0, consumoTotale - prodSolare);
    const autonomiaOre = deficitGiorno > 0 ? +(batteriaUtile / deficitGiorno * 24).toFixed(1) : Infinity;

    // Render
    document.getElementById('en-res-consumo').textContent = consumoTotale.toFixed(2) + ' kWh';
    document.getElementById('en-res-prod').textContent = prodSolare.toFixed(2) + ' kWh';

    const autonomiaLabel = autonomiaOre === Infinity
      ? '∞ autosuff.'
      : autonomiaOre >= 24
        ? Math.round(autonomiaOre / 24) + ' giorni'
        : autonomiaOre + ' ore';
    document.getElementById('en-res-autonomia').textContent = autonomiaLabel;

    const bilancio = prodSolare - consumoTotale;
    const alertEl = document.getElementById('en-bilancio-alert');
    if (bilancio >= 0) {
      alertEl.innerHTML = `<div class="alert alert-success"><span>✅</span><div>Il sistema è <strong>autosufficiente</strong>. Surplus: ${bilancio.toFixed(2)} kWh/giorno.</div></div>`;
    } else {
      alertEl.innerHTML = `<div class="alert alert-warning"><span>⚠️</span><div>Deficit: <strong>${Math.abs(bilancio).toFixed(2)} kWh/giorno</strong>. Usa la batteria o riduci i consumi.</div></div>`;
    }

    // Priorità consumi
    deviceResults.sort((a, b) => a.priorita - b.priorita);
    const prioritaEl = document.getElementById('en-priorita-list');
    prioritaEl.innerHTML = deviceResults.map((d, i) => `
      <div class="result-row">
        <span class="result-label">${i + 1}. ${Utils.escapeHtml(d.nome)}</span>
        <span class="result-value">${d.kwhDay.toFixed(3)} kWh/g
          <span class="text-secondary text-xs">(${d.watt}W × ${d.hDay}h)</span>
        </span>
      </div>
    `).join('');

    // Generatore info
    const genEl = document.getElementById('en-generatore-info');
    if (generatore > 0) {
      const consumoLPerOra = generatore <= 1000 ? 0.4 : generatore <= 2000 ? 0.6 : 1.0;
      const oreNecessarie = deficitGiorno > 0 ? +(deficitGiorno / (generatore / 1000)).toFixed(1) : 0;
      const litriGiorno = +(oreNecessarie * consumoLPerOra).toFixed(1);
      genEl.innerHTML = `
        <div class="result-row"><span class="result-label">Ore/giorno necessarie</span><span class="result-value accent">${oreNecessarie} h</span></div>
        <div class="result-row"><span class="result-label">Consumo benzina stimato</span><span class="result-value">${litriGiorno} L/giorno</span></div>
        <div class="result-row"><span class="result-label">Per 30 giorni</span><span class="result-value">${(litriGiorno * 30).toFixed(0)} L benzina</span></div>
        <div class="alert alert-warning mt-8"><span>⚠️</span><div>Usa sempre il generatore all'esterno o in locale ventilato. Rischio CO letale in spazi chiusi.</div></div>
      `;
    } else {
      genEl.innerHTML = `<p class="text-secondary text-sm">Nessun generatore inserito.</p>`;
    }

    document.getElementById('en-results').classList.remove('hidden');
    Storage.set('energia-result', { ore: autonomiaOre === Infinity ? 9999 : Math.round(autonomiaOre) });
  }

  function init() {
    if (initialized) { prefill(); return; }
    const root = document.getElementById('energia-root');
    if (!root) return;
    root.innerHTML = HTML;
    // Default tutti selezionati tranne quelli non essenziali
    DISPOSITIVI.forEach(d => { selectedDevices[d.id] = d.priorita <= 7; });
    renderDevices();
    initialized = true;
    prefill();
  }

  function prefill() {
    const p = SettingsModule.get();
    Utils.prefill({
      'en-pannelli': p.pannelli_wp, 'en-batteria': p.batteria_kwh,
      'en-generatore': p.generatore_w, 'en-stagione': p.en_stagione,
    });
    calculate();
  }

  return { init, calculate, addCustom, toggleDevice };
})();
