/* ============================================================
   Modulo Riscaldamento — Combustibile alternativo e autonomia termica
   ============================================================ */
const RiscaldamentoModule = (() => {
  let initialized = false;

  // kWh termici utili per kg di combustibile (efficienza inclusa)
  const COMBUSTIBILI = {
    legna:    { nome: 'Legna (faggio/quercia)', kwhKg: 2.8,  unitLabel: 'kg',   prezzoKg: 0.15, note: 'Stufa tradizionale, efficienza ~65%' },
    pellet:   { nome: 'Pellet di legno A1',     kwhKg: 4.2,  unitLabel: 'kg',   prezzoKg: 0.45, note: 'Stufa a pellet, efficienza ~90%' },
    kerosene: { nome: 'Kerosene/gasolio',       kwhKg: 8.5,  unitLabel: 'L',    prezzoKg: 1.50, note: 'Stufa da campeggio, efficienza ~85%' },
    gpl:      { nome: 'GPL (bombola)',           kwhKg: 6.5,  unitLabel: 'kg',   prezzoKg: 1.80, note: 'Stufa GPL, efficienza ~90%' },
    candele:  { nome: 'Candele (emergenza)',     kwhKg: 0.5,  unitLabel: 'pz',   prezzoKg: 0.50, note: 'Solo illuminazione/calore minimo' },
  };

  // Fabbisogno termico: W/m² per livello isolamento
  const ISOLAMENTO = {
    scarso:  { wMq: 85,  label: 'Scarso (muratura anni \'60-\'70)' },
    medio:   { wMq: 55,  label: 'Medio (finestre doppie, coibentazione parziale)' },
    buono:   { wMq: 30,  label: 'Buono (cappotto, finestre triple)' },
    ottimo:  { wMq: 15,  label: 'Ottimo (casa passiva)' },
  };

  // Zone climatiche Italia (gradi-giorno approssimativi)
  const ZONE = {
    a: { label: 'Zona A – Siracusa, Lampedusa', gg: 600 },
    b: { label: 'Zona B – Palermo, Napoli costa', gg: 900 },
    c: { label: 'Zona C – Roma, Firenze, Genova', gg: 1400 },
    d: { label: 'Zona D – Milano, Torino, Bologna', gg: 2100 },
    e: { label: 'Zona E – Venezia, Trento, Bergamo', gg: 2800 },
    f: { label: 'Zona F – Bolzano, Cortina, alta montagna', gg: 3800 },
  };

  const HTML = `
    <div class="card">
      <h3>La Tua Abitazione</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Superficie riscaldata (m²)</label>
          <input type="number" id="ri-mq" value="80" min="10" max="500">
        </div>
        <div class="form-group">
          <label>Livello isolamento</label>
          <select id="ri-isolamento">
            <option value="scarso">Scarso (anni '60-'70)</option>
            <option value="medio" selected>Medio (finestre doppie)</option>
            <option value="buono">Buono (cappotto termico)</option>
            <option value="ottimo">Ottimo (casa passiva)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Zona climatica</label>
          <select id="ri-zona">
            <option value="c">C – Roma, Firenze</option>
            <option value="d" selected>D – Milano, Torino</option>
            <option value="e">E – Venezia, Trento</option>
            <option value="f">F – Montagna</option>
            <option value="b">B – Napoli, Palermo</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Ore riscaldamento/giorno</label>
          <input type="number" id="ri-ore" value="10" min="1" max="24">
        </div>
        <div class="form-group">
          <label>Temperatura target (°C)</label>
          <input type="number" id="ri-temp" value="18" min="12" max="24">
          <span class="form-hint">Min. confortevole: 18°C</span>
        </div>
        <div class="form-group">
          <label>Giorni di autonomia</label>
          <input type="number" id="ri-giorni" value="30" min="1" max="180">
        </div>
      </div>
    </div>

    <div class="card mt-16">
      <h3>Fonte di Riscaldamento Alternativa</h3>
      <div class="form-group">
        <label>Combustibile disponibile</label>
        <select id="ri-combustibile">
          <option value="legna">Legna da ardere</option>
          <option value="pellet" selected>Pellet</option>
          <option value="kerosene">Kerosene / Gasolio</option>
          <option value="gpl">GPL (bombola)</option>
        </select>
      </div>
      <div class="form-group">
        <label>Scorta attuale (kg o L)</label>
        <input type="number" id="ri-scorta" value="0" min="0">
        <span class="form-hint">Inserisci 0 se non hai scorte</span>
      </div>
      <button class="btn btn-primary btn-full mt-16" onclick="RiscaldamentoModule.calculate()">
        🔥 Calcola Autonomia
      </button>
    </div>

    <div id="ri-results" class="hidden">
      <div class="results-panel">
        <h3>📊 Risultati</h3>
        <div class="three-col mb-16">
          <div class="mini-card">
            <div class="value" id="ri-res-kwh">—</div>
            <div class="label">kWh/giorno necessari</div>
          </div>
          <div class="mini-card">
            <div class="value" id="ri-res-qty">—</div>
            <div class="label">Combustibile/giorno</div>
          </div>
          <div class="mini-card">
            <div class="value" id="ri-res-tot">—</div>
            <div class="label">Totale per X giorni</div>
          </div>
        </div>
        <div id="ri-autonomia-box"></div>
      </div>

      <div class="card mt-16">
        <h3>📊 Confronto Combustibili</h3>
        <table class="data-table">
          <thead><tr><th>Combustibile</th><th>Qty/giorno</th><th>Tot ${'<span id="ri-gg-label">30</span>'} gg</th><th>Costo est.</th></tr></thead>
          <tbody id="ri-confronto"></tbody>
        </table>
      </div>

      <div class="card mt-16">
        <h3>🏠 Consigli Risparmio Calore</h3>
        <div class="result-row"><span class="result-label">Isola una stanza sola</span><span class="result-value text-sm">Riduci superficie da 80 a 20m² → -75% consumo</span></div>
        <div class="result-row"><span class="result-label">Tende termiche</span><span class="result-value text-sm">-15% dispersione finestre</span></div>
        <div class="result-row"><span class="result-label">Bozze porte/finestre</span><span class="result-value text-sm">Nastro isolante: risparmio 10-20%</span></div>
        <div class="result-row"><span class="result-label">Temperatura notturna</span><span class="result-value text-sm">15°C di notte invece di 18°C → -25% consumo</span></div>
        <div class="result-row"><span class="result-label">Abbigliamento termico</span><span class="result-value text-sm">Ogni °C in meno → -7% consumo energetico</span></div>
        <div class="alert alert-danger mt-16">
          <span>🚨</span>
          <div><strong>Attenzione CO:</strong> Non usare MAI stufe a kerosene/gpl in ambienti chiusi senza ventilazione. Installa rilevatore CO.</div>
        </div>
      </div>
    </div>
  `;

  function calculate() {
    const mq          = parseFloat(document.getElementById('ri-mq').value) || 80;
    const isolamento  = document.getElementById('ri-isolamento').value;
    const zona        = document.getElementById('ri-zona').value;
    const ore         = parseFloat(document.getElementById('ri-ore').value) || 10;
    const temp        = parseFloat(document.getElementById('ri-temp').value) || 18;
    const giorni      = parseInt(document.getElementById('ri-giorni').value) || 30;
    const combustibile= document.getElementById('ri-combustibile').value;
    const scortaAtt   = parseFloat(document.getElementById('ri-scorta').value) || 0;

    const wMq = ISOLAMENTO[isolamento].wMq;
    const tempExt = zona === 'f' ? -5 : zona === 'e' ? 0 : zona === 'd' ? 2 : zona === 'c' ? 5 : 8;
    const deltaT = Math.max(1, temp - tempExt);

    // kWh/giorno necessari (potenza × ore)
    const potenzaKw = (mq * wMq) / 1000; // kW
    const kwhGiorno = +(potenzaKw * ore * (deltaT / 16)).toFixed(2); // normalizzato su ΔT base 16°C

    const comb = COMBUSTIBILI[combustibile];
    const qtyGiorno = +(kwhGiorno / comb.kwhKg).toFixed(2);
    const qtyTotale = +(qtyGiorno * giorni).toFixed(1);
    const costoTot  = +(qtyTotale * comb.prezzoKg).toFixed(0);
    const giorniScorta = scortaAtt > 0 ? Math.floor(scortaAtt / qtyGiorno) : 0;

    document.getElementById('ri-res-kwh').textContent = kwhGiorno + ' kWh';
    document.getElementById('ri-res-qty').textContent = qtyGiorno + ' ' + comb.unitLabel;
    document.getElementById('ri-res-tot').textContent = qtyTotale + ' ' + comb.unitLabel;

    const autBox = document.getElementById('ri-autonomia-box');
    if (scortaAtt > 0) {
      const cls = giorniScorta >= giorni ? 'success' : giorniScorta >= 14 ? 'warning' : 'danger';
      autBox.innerHTML = `<div class="alert alert-${cls}">
        <span>${giorniScorta >= giorni ? '✅' : '⚠️'}</span>
        <div>Con la scorta attuale di <strong>${scortaAtt} ${comb.unitLabel}</strong> puoi riscaldare per <strong>${giorniScorta} giorni</strong>.</div>
      </div>`;
    } else {
      autBox.innerHTML = `<div class="alert alert-warning"><span>⚠️</span><div>Nessuna scorta inserita. Acquista almeno ${qtyTotale} ${comb.unitLabel}.</div></div>`;
    }

    // Confronto combustibili
    const tbody = document.getElementById('ri-confronto');
    document.getElementById('ri-gg-label').textContent = giorni;
    tbody.innerHTML = Object.entries(COMBUSTIBILI).filter(([k]) => k !== 'candele').map(([k, c]) => {
      const qG = +(kwhGiorno / c.kwhKg).toFixed(2);
      const qT = +(qG * giorni).toFixed(1);
      const cT = +(qT * c.prezzoKg).toFixed(0);
      const isSelected = k === combustibile;
      return `<tr ${isSelected ? 'style="background:rgba(249,115,22,0.08)"' : ''}>
        <td>${c.nome} ${isSelected ? '✓' : ''}</td>
        <td>${qG} ${c.unitLabel}</td>
        <td class="text-accent font-bold">${qT} ${c.unitLabel}</td>
        <td>~€${cT}</td>
      </tr>`;
    }).join('');

    document.getElementById('ri-results').classList.remove('hidden');
  }

  function init() {
    if (initialized) return;
    const root = document.getElementById('riscaldamento-root');
    if (!root) return;
    root.innerHTML = HTML;
    initialized = true;
  }

  return { init, calculate };
})();
