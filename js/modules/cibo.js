/* ============================================================
   Modulo Cibo — Scorte alimentari a lunga conservazione
   ============================================================ */
const CiboModule = (() => {
  let initialized = false;

  // Database alimenti: [nome, kcal/100g, durata, unità min, note]
  const ALIMENTI = [
    { nome: 'Pasta di semola',       kcal: 350, durata: '3 anni',  cat: 'Carboidrati', unita: 'kg' },
    { nome: 'Riso bianco',           kcal: 360, durata: '5 anni',  cat: 'Carboidrati', unita: 'kg' },
    { nome: 'Farina 00',             kcal: 350, durata: '1 anno',  cat: 'Carboidrati', unita: 'kg' },
    { nome: 'Farina di mais (polenta)', kcal: 360, durata: '1 anno', cat: 'Carboidrati', unita: 'kg' },
    { nome: 'Crackers/gallette',     kcal: 430, durata: '1 anno',  cat: 'Carboidrati', unita: 'kg' },
    { nome: 'Legumi secchi (ceci/lenticchie/fagioli)', kcal: 340, durata: '5 anni', cat: 'Proteine', unita: 'kg' },
    { nome: 'Tonno in scatola',      kcal: 120, durata: '4 anni',  cat: 'Proteine', unita: 'latte (80g)' },
    { nome: 'Sgombro in scatola',    kcal: 200, durata: '4 anni',  cat: 'Proteine', unita: 'latte (125g)' },
    { nome: 'Carne in scatola',      kcal: 200, durata: '3 anni',  cat: 'Proteine', unita: 'latte (200g)' },
    { nome: 'Uova (liofilizzate/in polvere)', kcal: 590, durata: '5 anni', cat: 'Proteine', unita: 'kg' },
    { nome: 'Olio extravergine oliva', kcal: 900, durata: '2 anni', cat: 'Grassi', unita: 'L' },
    { nome: 'Burro chiarificato (ghee)', kcal: 900, durata: '1 anno', cat: 'Grassi', unita: 'kg' },
    { nome: 'Frutta secca (noci/mandorle)', kcal: 600, durata: '1 anno', cat: 'Grassi', unita: 'kg' },
    { nome: 'Zucchero bianco',       kcal: 400, durata: 'indefinita', cat: 'Dolcificanti', unita: 'kg' },
    { nome: 'Miele',                 kcal: 300, durata: 'indefinita', cat: 'Dolcificanti', unita: 'kg' },
    { nome: 'Cioccolato fondente 80%', kcal: 550, durata: '2 anni', cat: 'Dolcificanti', unita: 'kg' },
    { nome: 'Sale fino',             kcal: 0,   durata: 'indefinita', cat: 'Condimenti', unita: 'kg' },
    { nome: 'Dado/brodo in polvere', kcal: 200, durata: '2 anni',  cat: 'Condimenti', unita: 'kg' },
    { nome: 'Passata di pomodoro',   kcal: 35,  durata: '2 anni',  cat: 'Verdure', unita: 'L' },
    { nome: 'Verdure sott\'olio/conserva', kcal: 50, durata: '2 anni', cat: 'Verdure', unita: 'vasetti' },
    { nome: 'Latte UHT intero',      kcal: 65,  durata: '6 mesi',  cat: 'Latticini', unita: 'L' },
    { nome: 'Latte condensato zuccherato', kcal: 320, durata: '2 anni', cat: 'Latticini', unita: 'latte' },
    { nome: 'Multivitaminici',       kcal: 0,   durata: '2 anni',  cat: 'Integratori', unita: 'confezioni' },
  ];

  const FABBISOGNO = {
    adulto_sedentario: 2000,
    adulto_attivo:     2500,
    adulto_pesante:    3000,
    bambino:           1700,
    anziano:           1700,
  };

  // Piano base per X kcal/giorno/persona: quante percentuali da ogni categoria
  const PIANO_BASE = [
    { nome: 'Pasta di semola',       gPerPersonaGiorno: 120 },
    { nome: 'Riso bianco',           gPerPersonaGiorno: 80  },
    { nome: 'Legumi secchi (ceci/lenticchie/fagioli)', gPerPersonaGiorno: 80 },
    { nome: 'Tonno in scatola',      gPerPersonaGiorno: 60  },
    { nome: 'Olio extravergine oliva', gPerPersonaGiorno: 30 },
    { nome: 'Frutta secca (noci/mandorle)', gPerPersonaGiorno: 30 },
    { nome: 'Zucchero bianco',       gPerPersonaGiorno: 30  },
    { nome: 'Passata di pomodoro',   gPerPersonaGiorno: 80  },
    { nome: 'Sale fino',             gPerPersonaGiorno: 5   },
    { nome: 'Latte UHT intero',      gPerPersonaGiorno: 200 },
    { nome: 'Crackers/gallette',     gPerPersonaGiorno: 50  },
    { nome: 'Miele',                 gPerPersonaGiorno: 20  },
  ];

  const HTML = `
    ${Utils.sitCard(`
      <div class="form-row">
        <div class="form-group">
          <label>Per quanti giorni hai cibo in casa?</label>
          <input type="number" id="cb-scorta" data-pkey="cibo_scorte_giorni" data-ptype="num" value="0" min="0" max="3650">
          <span class="form-hint">Stima a occhio: quanti giorni mangereste tutti con quello che c'è</span>
        </div>
      </div>
      <p class="sit-people" id="cb-persone-txt"></p>`, 'cb-sit')}

    <div class="card mt-16">
      <h3>Calcola cosa comprare</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Giorni da coprire</label>
          <input type="number" id="cb-giorni" value="30" min="1" max="365">
        </div>
        <div class="form-group">
          <label>Budget disponibile (€)</label>
          <input type="number" id="cb-budget" value="300" min="50" max="10000">
          <span class="form-hint">Opzionale, per stima costo</span>
        </div>
      </div>
    </div>

    <div id="cb-results" class="hidden">
      <div class="results-panel">
        <h3>📊 Fabbisogno Calorico</h3>
        <div class="three-col mb-16">
          <div class="mini-card">
            <div class="value" id="cb-res-kcal">—</div>
            <div class="label">kcal/giorno tot.</div>
          </div>
          <div class="mini-card">
            <div class="value" id="cb-res-giorni">—</div>
            <div class="label">Giorni coperti</div>
          </div>
          <div class="mini-card">
            <div class="value" id="cb-res-costo">—</div>
            <div class="label">Costo stimato</div>
          </div>
        </div>
      </div>

      <div class="card mt-16">
        <div class="flex-between mb-16">
          <h3>📦 Lista Scorte</h3>
          <button class="btn btn-outline btn-sm" onclick="CiboModule.print()">🖨 Stampa</button>
        </div>
        <div id="cb-lista-categorie"></div>
      </div>

      <div class="card mt-16">
        <h3>⚠️ Note Importanti</h3>
        <div class="alert alert-warning">
          <span>⚠️</span>
          <div>Integrare con vitamine e sali minerali. Aggiungere sementi per orto d'emergenza.</div>
        </div>
        <div class="result-row"><span class="result-label">Rotazione scorte</span><span class="result-value text-sm">Consuma e rimpiazza ogni 3-6 mesi</span></div>
        <div class="result-row"><span class="result-label">Conservazione ottimale</span><span class="result-value text-sm">Luogo fresco, buio, asciutto — 15-18°C</span></div>
        <div class="result-row"><span class="result-label">Contenitori</span><span class="result-value text-sm">Barattoli vetro o buste sottovuoto per cereali</span></div>
        <div class="result-row"><span class="result-label">Acqua per cottura</span><span class="result-value text-sm">+0.5L/persona/giorno per cucinare pasta/riso</span></div>
      </div>
    </div>
  `;

  // Prezzi medi in €
  const PREZZI = {
    'Pasta di semola': 1.2,
    'Riso bianco': 1.5,
    'Farina 00': 0.9,
    'Legumi secchi (ceci/lenticchie/fagioli)': 2.5,
    'Tonno in scatola': 1.5,
    'Olio extravergine oliva': 6.0,
    'Frutta secca (noci/mandorle)': 12.0,
    'Zucchero bianco': 0.9,
    'Passata di pomodoro': 1.2,
    'Sale fino': 0.5,
    'Latte UHT intero': 1.2,
    'Crackers/gallette': 2.0,
    'Miele': 8.0,
  };

  function calculate() {
    const pr = SettingsModule.get();
    const adulti   = pr.adulti || 0, anziani = pr.anziani || 0, bambini = pr.bambini || 0;
    const giorni   = Utils.int(document.getElementById('cb-giorni').value, 30);
    const scorta   = Utils.int(document.getElementById('cb-scorta').value, 0);
    const persone  = adulti + anziani + bambini;

    document.getElementById('cb-persone-txt').innerHTML = persone > 0
      ? `<i class="ph ph-users"></i> Calcolo per <strong>${persone} ${persone === 1 ? 'persona' : 'persone'}</strong> (lo cambi in Profilo › Famiglia e casa)`
      : `<i class="ph ph-warning"></i> Indica quante persone siete in Profilo › Famiglia e casa`;
    const manca = Math.max(0, giorni - scorta);
    document.getElementById('cb-sit').innerHTML = `
      <div class="sit-line"><span>Con quello che hai copri</span><strong>${scorta} ${scorta === 1 ? 'giorno' : 'giorni'}</strong></div>
      <div class="sit-line ${manca > 0 ? 'bad' : 'good'}"><span>Per ${giorni} giorni ${manca > 0 ? 'ti mancano' : ''}</span><strong>${manca > 0 ? manca + (manca === 1 ? ' giorno' : ' giorni') : 'sei coperto ✓'}</strong></div>`;
    if (persone === 0) { document.getElementById('cb-results').classList.add('hidden'); return; }

    const kcalGiorno = adulti * 2500 + anziani * 1800 + bambini * 1700;

    // Costruisci lista per categoria
    const perCategoria = {};
    let costoTot = 0;

    PIANO_BASE.forEach(item => {
      const alimento = ALIMENTI.find(a => a.nome === item.nome);
      if (!alimento) return;

      const totGrammi = item.gPerPersonaGiorno * persone * giorni;
      const totKg = (totGrammi / 1000).toFixed(2);
      const prezzoUnitario = PREZZI[item.nome] || 2;
      // prezzo per kg
      const costo = +(totKg * prezzoUnitario).toFixed(2);
      costoTot += costo;

      if (!perCategoria[alimento.cat]) perCategoria[alimento.cat] = [];
      perCategoria[alimento.cat].push({
        nome: item.nome,
        quantita: totKg + ' kg',
        durata: alimento.durata,
        costo: costo.toFixed(2),
      });
    });

    // Render stats
    document.getElementById('cb-res-kcal').textContent = kcalGiorno.toLocaleString('it');
    document.getElementById('cb-res-giorni').textContent = giorni;
    document.getElementById('cb-res-costo').textContent = '~€' + costoTot.toFixed(0);

    // Render categorie
    const container = document.getElementById('cb-lista-categorie');
    container.innerHTML = Object.entries(perCategoria).map(([cat, items]) => `
      <div class="shop-category">
        <div class="shop-category-title">${cat}</div>
        ${items.map(i => `
          <div class="shop-item">
            <div>
              <div class="shop-item-name">${i.nome}</div>
              <div class="shop-item-note">Durata: ${i.durata} · ~€${i.costo}</div>
            </div>
            <div class="shop-item-qty">${i.quantita}</div>
          </div>
        `).join('')}
      </div>
    `).join('');

    document.getElementById('cb-results').classList.remove('hidden');
    Storage.set('cibo-result', { giorni, persone, costoTot: costoTot.toFixed(0) });
  }

  function print() {
    window.print();
  }

  function init() {
    if (initialized) { prefill(); return; }
    const root = document.getElementById('cibo-root');
    if (!root) return;
    root.innerHTML = HTML;
    Utils.bindProfile(root, calculate);
    initialized = true;
    prefill();
  }

  function prefill() {
    Utils.fillProfile(document.getElementById('cibo-root'));
    calculate();
  }

  return { init, calculate, print };
})();
