/* ============================================================
   Modulo Carburante — Autonomia mobilità
   ============================================================ */
const CarburanteModule = (() => {
  let initialized = false;

  const HTML = `
    <div class="card">
      <h3>Il Tuo Veicolo</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Tipo carburante</label>
          <select id="ca-tipo">
            <option value="benzina">Benzina</option>
            <option value="diesel" selected>Diesel</option>
            <option value="gpl">GPL</option>
            <option value="elettrico">Elettrico</option>
          </select>
        </div>
        <div class="form-group">
          <label>Consumo (L/100km o kWh/100km)</label>
          <input type="number" id="ca-consumo" value="7" min="2" max="25" step="0.5">
        </div>
        <div class="form-group">
          <label>Serbatoio (L o kWh)</label>
          <input type="number" id="ca-serbatoio" value="50" min="10" max="200">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Km percorsi / settimana (abituali)</label>
          <input type="number" id="ca-km-sett" value="200" min="0" max="2000">
        </div>
        <div class="form-group">
          <label>Scorta extra disponibile (L)</label>
          <input type="number" id="ca-scorta" value="0" min="0" max="100">
          <span class="form-hint">Max legale uso privato: 10L (taniche omologate)</span>
        </div>
        <div class="form-group">
          <label>Settimane da coprire</label>
          <input type="number" id="ca-settimane" value="4" min="1" max="52">
        </div>
      </div>
      <button class="btn btn-primary btn-full mt-16" onclick="CarburanteModule.calculate()">
        ⛽ Calcola Autonomia
      </button>
    </div>

    <div id="ca-results" class="hidden">
      <div class="results-panel">
        <h3>📊 Risultati</h3>
        <div class="three-col mb-16">
          <div class="mini-card">
            <div class="value" id="ca-res-km">—</div>
            <div class="label">km serbatoio pieno</div>
          </div>
          <div class="mini-card">
            <div class="value" id="ca-res-sett">—</div>
            <div class="label">Settimane autonomia tot.</div>
          </div>
          <div class="mini-card">
            <div class="value" id="ca-res-fabb">—</div>
            <div class="label">L necessari per X sett.</div>
          </div>
        </div>
        <div id="ca-status-alert"></div>
      </div>

      <div class="card mt-16">
        <h3>🗺 Piano Riduzione Spostamenti</h3>
        <div id="ca-piano"></div>
      </div>

      <div class="card mt-16">
        <h3>🚲 Alternative alla Macchina</h3>
        <div class="result-row"><span class="result-label">Bicicletta</span><span class="result-value text-sm">0-15 km · ideale per approvvigionamenti locali</span></div>
        <div class="result-row"><span class="result-label">Bici elettrica</span><span class="result-value text-sm">0-50 km · ricarica con pannelli solari (250W = 2-3h)</span></div>
        <div class="result-row"><span class="result-label">Moto/scooter</span><span class="result-value text-sm">3-4L/100km · consuma 50% in meno dell'auto</span></div>
        <div class="result-row"><span class="result-label">Carpooling</span><span class="result-value text-sm">Organizza con vicini: dividi consumi e percorsi</span></div>
        <div class="result-row"><span class="result-label">Lavoro remoto</span><span class="result-value text-sm">Elimina completamente i pendolamenti</span></div>
        <div class="alert alert-info mt-16">
          <span>💡</span>
          <div>In emergenza energetica, prioritizza: approvvigionamento cibo/acqua, evacuazione, assistenza medica. Elimina tutti gli spostamenti non essenziali.</div>
        </div>
      </div>

      <div class="card mt-16">
        <h3>📦 Conservazione Carburante</h3>
        <div class="result-row"><span class="result-label">Limite legale privati</span><span class="result-value text-sm">10L in tanica omologata · fino a 20L con dichiarazione prefettura</span></div>
        <div class="result-row"><span class="result-label">Durata benzina</span><span class="result-value text-sm">3-6 mesi (con stabilizzatore fino a 12 mesi)</span></div>
        <div class="result-row"><span class="result-label">Durata diesel</span><span class="result-value text-sm">6-12 mesi (in luogo fresco e buio)</span></div>
        <div class="result-row"><span class="result-label">Rotazione</span><span class="result-value text-sm">Usa la scorta ogni 3 mesi e rimpiazza</span></div>
      </div>
    </div>
  `;

  const RIDUZIONI = [
    { livello: '🟢 Normale',   riduzione: 0,   desc: 'Nessuna restrizione, uso normale' },
    { livello: '🟡 Parziale',  riduzione: 0.5, desc: 'Elimina spostamenti non essenziali (svago, shopping)' },
    { livello: '🔴 Critico',   riduzione: 0.75, desc: 'Solo approvvigionamento e emergenze' },
    { livello: '🚨 Lockdown',  riduzione: 0.90, desc: 'Solo evacuazione e assistenza medica' },
  ];

  function calculate() {
    const consumo    = parseFloat(document.getElementById('ca-consumo').value) || 7;
    const serbatoio  = parseFloat(document.getElementById('ca-serbatoio').value) || 50;
    const kmSett     = parseFloat(document.getElementById('ca-km-sett').value) || 200;
    const scorta     = parseFloat(document.getElementById('ca-scorta').value) || 0;
    const settimane  = parseInt(document.getElementById('ca-settimane').value) || 4;

    const kmSerbatoio = +(serbatoio / consumo * 100).toFixed(0);
    const litriSett   = +(kmSett * consumo / 100).toFixed(1);
    const litriNecessari = +(litriSett * settimane).toFixed(0);
    const litriTotale = serbatoio + scorta;
    const settAutonomia = +(litriTotale / litriSett).toFixed(1);

    document.getElementById('ca-res-km').textContent = kmSerbatoio + ' km';
    document.getElementById('ca-res-sett').textContent = settAutonomia + ' sett.';
    document.getElementById('ca-res-fabb').textContent = litriNecessari + ' L';

    const deficit = litriNecessari - litriTotale;
    const alertEl = document.getElementById('ca-status-alert');
    if (deficit <= 0) {
      alertEl.innerHTML = `<div class="alert alert-success"><span>✅</span><div>Autonomia sufficiente per ${settimane} settimane.</div></div>`;
    } else {
      alertEl.innerHTML = `<div class="alert alert-warning"><span>⚠️</span><div>Deficit di <strong>${deficit.toFixed(0)} L</strong> per coprire ${settimane} settimane. Riduci gli spostamenti o aumenta le scorte.</div></div>`;
    }

    // Piano riduzione
    const pianoEl = document.getElementById('ca-piano');
    pianoEl.innerHTML = RIDUZIONI.map(r => {
      const kmRidotti = +(kmSett * (1 - r.riduzione)).toFixed(0);
      const litriRidotti = +(kmRidotti * consumo / 100).toFixed(1);
      const settRid = +(litriTotale / litriRidotti).toFixed(1);
      return `
        <div class="result-row">
          <div>
            <div class="result-label">${r.livello}</div>
            <div class="text-xs text-secondary">${r.desc}</div>
          </div>
          <div style="text-align:right">
            <div class="result-value">${kmRidotti} km/sett</div>
            <div class="text-xs text-secondary">${litriRidotti} L/sett · ${settRid} sett. autonomia</div>
          </div>
        </div>
      `;
    }).join('');

    document.getElementById('ca-results').classList.remove('hidden');
  }

  function init() {
    if (initialized) return;
    const root = document.getElementById('carburante-root');
    if (!root) return;
    root.innerHTML = HTML;
    initialized = true;
  }

  return { init, calculate };
})();
