/* ============================================================
   Modulo Acqua — Calcolatore fabbisogno idrico
   ============================================================ */
const AcquaModule = (() => {
  let initialized = false;

  const HTML = `
    <div class="card">
      <h3>Parametri</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Persone</label>
          <input type="number" id="aq-persone" value="3" min="1" max="20">
        </div>
        <div class="form-group">
          <label>Giorni di autonomia</label>
          <input type="number" id="aq-giorni" value="30" min="1" max="365">
        </div>
        <div class="form-group">
          <label>Clima</label>
          <select id="aq-clima">
            <option value="normale">Temperato (Nord Italia)</option>
            <option value="caldo">Caldo / Estate</option>
            <option value="freddo">Freddo / Inverno</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Raccolta acqua piovana?</label>
          <select id="aq-pioggia">
            <option value="no">No</option>
            <option value="si">Sì</option>
          </select>
        </div>
        <div class="form-group" id="aq-tetto-group" style="display:none">
          <label>Superficie tetto (m²)</label>
          <input type="number" id="aq-tetto" value="80" min="10" max="500">
          <span class="form-hint">Area di raccolta disponibile</span>
        </div>
      </div>
      <button class="btn btn-primary btn-full mt-16" onclick="AcquaModule.calculate()">
        💧 Calcola Fabbisogno
      </button>
    </div>

    <div id="aq-results" class="hidden">
      <div class="results-panel">
        <h3>📊 Risultati</h3>
        <div class="two-col mb-16">
          <div class="mini-card">
            <div class="value" id="aq-res-min">—</div>
            <div class="label">Litri minimi (bere e cucinare)</div>
          </div>
          <div class="mini-card">
            <div class="value" id="aq-res-rac">—</div>
            <div class="label">Litri consigliati (con igiene)</div>
          </div>
        </div>
        <div class="result-row"><span class="result-label">Fabbisogno minimo/giorno</span><span class="result-value accent" id="aq-res-min-day">—</span></div>
        <div class="result-row"><span class="result-label">Fabbisogno raccomandato/giorno</span><span class="result-value" id="aq-res-rac-day">—</span></div>
        <div class="result-row" id="aq-pioggia-row" style="display:none"><span class="result-label">Raccolta pioggia stimata/giorno</span><span class="result-value success" id="aq-res-pioggia">—</span></div>
        <div class="result-row" id="aq-autonomia-row" style="display:none"><span class="result-label">Autonomia con solo raccolta pioggia</span><span class="result-value" id="aq-res-autonomia">—</span></div>
      </div>

      <div class="card mt-16">
        <h3>🛢 Contenitori Consigliati</h3>
        <table class="data-table">
          <thead><tr><th>Contenitore</th><th>Quantità</th><th>Note</th></tr></thead>
          <tbody id="aq-contenitori"></tbody>
        </table>
      </div>

      <div class="card mt-16">
        <h3>🧹 Metodi di Purificazione</h3>
        <div id="aq-purificazione"></div>
      </div>
    </div>
  `;

  function calculate() {
    const persone  = Utils.int(document.getElementById('aq-persone').value, 3);
    const giorni   = Utils.int(document.getElementById('aq-giorni').value, 30);
    const clima    = document.getElementById('aq-clima').value;
    const pioggia  = document.getElementById('aq-pioggia').value === 'si';
    const tetto    = Utils.num(document.getElementById('aq-tetto').value, 0);

    const climaMult = clima === 'caldo' ? 1.3 : clima === 'freddo' ? 0.85 : 1;
    const minDay    = Utils.WATER_L_PPD * climaMult;   // bere + cucinare (stessa regola di Home e Piano)
    const racDay    = 5   * climaMult;   // consigliato: include igiene di base

    const minDayTot = +(persone * minDay).toFixed(1);
    const racDayTot = +(persone * racDay).toFixed(1);
    const minTot    = +(minDayTot * giorni).toFixed(0);
    const racTot    = +(racDayTot * giorni).toFixed(0);

    // Raccolta pioggia: Nord Italia ~2.2mm/giorno media, fattore deflusso 0.8
    const pioggiaDayL = pioggia ? +(tetto * 2.2 * 0.8).toFixed(1) : 0;
    const autonomiaPioggia = pioggia && pioggiaDayL > 0
      ? (pioggiaDayL >= minDayTot ? '∞ (sufficiente)' : Math.round(minTot / (minDayTot - pioggiaDayL)) + ' giorni extra')
      : null;

    // Contenitori
    const contenitori = [
      { name: 'Bottiglie 1,5L (scorta immediata)', qty: Math.ceil(racTot / 1.5), note: 'Rotazione mensile' },
      { name: 'Taniche 10L (HDPE alimentare)',    qty: Math.ceil(racTot / 10),  note: 'Durata 6-12 mesi' },
      { name: 'Fusti 60L (stoccaggio)',            qty: Math.ceil(racTot / 60),  note: 'Per cantina/garage' },
      { name: 'Cisterna 1.000L (IBC)',             qty: Math.ceil(racTot / 1000), note: 'Soluzione definitiva' },
    ];

    // Render
    document.getElementById('aq-res-min').textContent    = minTot + ' L';
    document.getElementById('aq-res-rac').textContent    = racTot + ' L';
    document.getElementById('aq-res-min-day').textContent = minDayTot + ' L/giorno';
    document.getElementById('aq-res-rac-day').textContent = racDayTot + ' L/giorno';

    if (pioggia) {
      document.getElementById('aq-pioggia-row').style.display = 'flex';
      document.getElementById('aq-autonomia-row').style.display = 'flex';
      document.getElementById('aq-res-pioggia').textContent = pioggiaDayL + ' L/giorno';
      document.getElementById('aq-res-autonomia').textContent = autonomiaPioggia;
    }

    // Contenitori
    const tbody = document.getElementById('aq-contenitori');
    tbody.innerHTML = contenitori.map(c => `
      <tr><td>${c.name}</td><td class="text-accent font-bold">${c.qty}</td><td class="text-secondary">${c.note}</td></tr>
    `).join('');

    // Purificazione
    document.getElementById('aq-purificazione').innerHTML = `
      <div class="alert alert-info">
        <span>💡</span>
        <div>Combina sempre almeno due metodi per sicurezza massima.</div>
      </div>
      <div class="result-row"><span class="result-label">🔥 Bollitura</span><span class="result-value text-sm">1 min a 100°C (3 min sopra 2.000m)</span></div>
      <div class="result-row"><span class="result-label">🧴 Candeggina (5-6%)</span><span class="result-value text-sm">8 gocce/L acqua torbida · 4 gocce/L limpida · attendi 30 min</span></div>
      <div class="result-row"><span class="result-label">🔵 Pastiglie Cloro</span><span class="result-value text-sm">1 pastiglia/L · attendi 30 min</span></div>
      <div class="result-row"><span class="result-label">🌊 Filtro a sabbia/ghiaia</span><span class="result-value text-sm">Prima filtra sedimenti, poi disinfezione chimica</span></div>
      <div class="result-row"><span class="result-label">☀️ Solarizzazione (SODIS)</span><span class="result-value text-sm">Bottiglia PET trasparente al sole per 6h (cielo sereno)</span></div>
    `;

    document.getElementById('aq-results').classList.remove('hidden');

    // Salva in storage per dashboard
    Storage.set('acqua-result', { giorni, persone, litriMin: minTot, litriRac: racTot });
  }

  function init() {
    if (initialized) { prefill(); return; }
    const root = document.getElementById('acqua-root');
    if (!root) return;
    root.innerHTML = HTML;

    // Toggle tetto input
    document.getElementById('aq-pioggia').addEventListener('change', function() {
      document.getElementById('aq-tetto-group').style.display = this.value === 'si' ? 'block' : 'none';
    });

    initialized = true;
    prefill();
  }

  function prefill() {
    const p = SettingsModule.get();
    Utils.prefill({
      'aq-persone': SettingsModule.getTotalPeople(),
      'aq-tetto': p.tetto_mq,
      'aq-pioggia': p.ha_pioggia ? 'si' : 'no',
    });
    document.getElementById('aq-tetto-group').style.display = p.ha_pioggia ? 'block' : 'none';
    calculate();
  }

  return { init, calculate };
})();
