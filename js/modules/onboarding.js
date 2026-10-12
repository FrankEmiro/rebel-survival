/* ============================================================
   Onboarding — primo avvio guidato in 4 domande
   Salva nel profilo i dati minimi per un punteggio sensato.
   Finché non è completato la Home mostra un invito, non un allarme.
   ============================================================ */
const OnboardingModule = (() => {

  // Situazione abitativa: al chiuso / all'aperto o in emergenza.
  // 'key' è l'opzione mostrata; 'tipo' (+ extra) è ciò che viene salvato nel profilo.
  const SHELTERS = [
    { group: 'Ho un tetto', items: [
      { key: 'appartamento', icon: 'ph-buildings',    label: 'Appartamento',                 tipo: 'appartamento' },
      { key: 'casa',         icon: 'ph-house-simple', label: 'Casa indipendente',            tipo: 'casa' },
      { key: 'rurale',       icon: 'ph-barn',         label: 'Casa di campagna / isolata',   tipo: 'rurale' },
      { key: 'ospite',       icon: 'ph-users-three',  label: 'Ospite o centro accoglienza',  tipo: 'ospite' },
    ]},
    { group: 'Sono all\'aperto o in emergenza', items: [
      { key: 'auto',         icon: 'ph-car-profile',  label: 'Auto o camper',               tipo: 'tenda', extra: { riparo_materiale: 'veicolo', riparo_mq: 4 } },
      { key: 'tenda',        icon: 'ph-tent',         label: 'Tenda o accampamento',        tipo: 'tenda', extra: { riparo_materiale: 'tenda_da_campeggio', riparo_mq: 6 } },
      { key: 'rifugio',      icon: 'ph-campfire',     label: 'Rifugio improvvisato',        tipo: 'rifugio', extra: { riparo_materiale: 'materiali_naturali', riparo_mq: 4 } },
      { key: 'nessun_riparo',icon: 'ph-tree',         label: 'Nessun riparo (da costruire)', tipo: 'nessun_riparo', extra: { riparo_materiale: 'nessuno', riparo_mq: 0 } },
    ]},
  ];
  const ALL_SHELTERS = SHELTERS.flatMap(g => g.items);
  const isOutdoor = key => ['auto', 'tenda', 'rifugio', 'nessun_riparo'].includes(key);

  // Scenari proposti al primo avvio (gli altri restano scegliibili dalla Home)
  const SCENARIO_IDS = ['blackout-lungo', 'terremoto', 'alluvione', 'tempesta-invernale', 'evacuazione'];

  // Clima: imposta minima/massima e zona climatica (attiva la minaccia "Freddo" e i calcoli del calore)
  const CLIMI = [
    { key: 'mite',     icon: 'ph-sun',       label: 'Mite',               desc: 'Inverni sopra lo zero (centro-sud, coste)', vals: { temp_min: 5,   temp_max: 35, ri_zona: 'c' } },
    { key: 'freddo',   icon: 'ph-cloud-snow', label: 'Inverni freddi',     desc: 'Gelo e neve in inverno (pianura nord, collina)', vals: { temp_min: -5,  temp_max: 32, ri_zona: 'e' } },
    { key: 'montagna', icon: 'ph-mountains', label: 'Montagna / molto freddo', desc: 'Sotto -10 °C in inverno', vals: { temp_min: -12, temp_max: 26, ri_zona: 'f' } },
  ];

  const STEPS = ['persone', 'casa', 'clima', 'scenario', 'scorte'];

  let step = 0;
  let data = {};

  function isDone() { return !!Storage.get('onboarded'); }

  // Chi aveva già un profilo salvato (versione precedente) non rivede il wizard
  function maybeStart() {
    if (isDone()) return;
    if (Storage.get('profilo')) { Storage.set('onboarded', true); return; }
    open();
  }

  function open() {
    step = 0;
    const p = SettingsModule.get();
    data = {
      adulti: p.adulti || 2, bambini: p.bambini || 0, anziani: p.anziani || 0,
      shelter_key: p.riparo_materiale === 'veicolo' ? 'auto' : (p.tipo_abitazione || 'casa'),
      show_all_scenari: false, clima_key: null,
      scenario_id: p.scenario_id || null,
      acqua_scorte_litri: p.acqua_scorte_litri || 0,
      cibo_scorte_giorni: p.cibo_scorte_giorni || 0,
      has_radio: !!p.has_radio, has_kit_medico: !!p.has_kit_medico,
      ha_auto: (p.km_settimana || 0) > 0,
    };
    let el = document.getElementById('onboarding-overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = 'onboarding-overlay';
      el.className = 'disclaimer-overlay';
      el.style.zIndex = 9998;
      document.body.appendChild(el);
    }
    el.classList.remove('hidden');
    _render();
  }

  function close() {
    document.getElementById('onboarding-overlay')?.classList.add('hidden');
  }

  function skip() {
    close();
    if (typeof DashboardModule !== 'undefined') DashboardModule.render();
  }

  function _stepper(key, label, hint, min) {
    return `<div class="ob-row">
      <div><strong>${label}</strong><span class="ob-hint">${hint}</span></div>
      <div class="ob-stepper">
        <button type="button" onclick="OnboardingModule._bump('${key}', -1, ${min})" aria-label="Meno">−</button>
        <span id="ob-v-${key}">${data[key]}</span>
        <button type="button" onclick="OnboardingModule._bump('${key}', 1, ${min})" aria-label="Più">+</button>
      </div>
    </div>`;
  }

  function _body() {
    switch (STEPS[step]) {
      case 'persone':
        return `<h2>Quante persone siete?</h2>
          <p class="ob-sub">Servono per calcolare quanta acqua e cibo ti servono.</p>
          ${_stepper('adulti', 'Adulti', '', 1)}
          ${_stepper('bambini', 'Bambini', 'sotto i 14 anni', 0)}
          ${_stepper('anziani', 'Anziani', 'over 65', 0)}`;
      case 'casa':
        return `<h2>Dove ti trovi?</h2>
          <p class="ob-sub">Cambia i consigli su riparo, calore e scorte.</p>
          ${SHELTERS.map(g => `<div class="ob-group">${g.group}</div>
            <div class="ob-options">${g.items.map(h => `
              <button type="button" class="ob-opt${data.shelter_key === h.key ? ' active' : ''}"
                onclick="OnboardingModule._set('shelter_key','${h.key}')">
                <i class="ph ${h.icon}"></i> ${h.label}
              </button>`).join('')}</div>`).join('')}`;
      case 'clima':
        return `<h2>Che clima fa dove sei?</h2>
          <p class="ob-sub">Serve per capire se il freddo è un rischio e quanto riscaldamento ti serve.</p>
          <div class="ob-options">${CLIMI.map(c => `
            <button type="button" class="ob-opt${data.clima_key === c.key ? ' active' : ''}"
              onclick="OnboardingModule._set('clima_key','${c.key}')">
              <i class="ph ${c.icon}"></i>
              <span>${c.label}<span class="ob-hint">${c.desc}</span></span>
            </button>`).join('')}</div>`;
      case 'scenario': {
        const all = window.SCENARI_LIST || [];
        const ids = isOutdoor(data.shelter_key) ? ['survival-natura', ...SCENARIO_IDS] : SCENARIO_IDS;
        const list = data.show_all_scenari
          ? all
          : ids.map(id => all.find(s => s.id === id)).filter(Boolean);
        return `<h2>Cosa ti preoccupa di più?</h2>
          <p class="ob-sub">Adatta le azioni consigliate. Puoi cambiarlo quando vuoi.</p>
          <div class="ob-options">
            <button type="button" class="ob-opt${!data.scenario_id ? ' active' : ''}"
              onclick="OnboardingModule._set('scenario_id', null)">
              <i class="ph ph-compass"></i> Non so — preparazione generale
            </button>
            ${list.map(s => `
              <button type="button" class="ob-opt${data.scenario_id === s.id ? ' active' : ''}"
                onclick="OnboardingModule._set('scenario_id','${s.id}')">
                <span class="ob-emoji">${s.icon || ''}</span>
                <span>${s.titolo}<span class="ob-hint">${s.desc || ''}</span></span>
              </button>`).join('')}
            ${data.show_all_scenari ? '' : `<button type="button" class="ob-opt ob-more"
              onclick="OnboardingModule._set('show_all_scenari', true)">
              <i class="ph ph-list-bullets"></i> Altri scenari (${Math.max(0, all.length - list.length)})
            </button>`}
          </div>`;
      }
      case 'scorte':
        return `<h2>Cosa hai già in casa?</h2>
          <p class="ob-sub">Stima a occhio. Anche zero va bene: ti dirò da dove partire.</p>
          <div class="ob-row">
            <div><strong>Acqua in bottiglia / taniche</strong><span class="ob-hint">litri totali</span></div>
            <input type="number" class="ob-num" min="0" max="5000" inputmode="numeric" value="${data.acqua_scorte_litri}"
              oninput="OnboardingModule._num('acqua_scorte_litri', this.value)">
          </div>
          <div class="ob-row">
            <div><strong>Cibo che dura</strong><span class="ob-hint">giorni per tutta la famiglia</span></div>
            <input type="number" class="ob-num" min="0" max="365" inputmode="numeric" value="${data.cibo_scorte_giorni}"
              oninput="OnboardingModule._num('cibo_scorte_giorni', this.value)">
          </div>
          <label class="check-option ob-check"><input type="checkbox" ${data.has_radio ? 'checked' : ''}
            onchange="OnboardingModule._set('has_radio', this.checked, true)">
            <span><i class="ph ph-radio"></i> Ho una radio a batterie o a manovella</span></label>
          <label class="check-option ob-check"><input type="checkbox" ${data.ha_auto ? 'checked' : ''}
            onchange="OnboardingModule._set('ha_auto', this.checked, true)">
            <span><i class="ph ph-car"></i> Uso un'auto o un mezzo (serve il carburante)</span></label>
          <label class="check-option ob-check"><input type="checkbox" ${data.has_kit_medico ? 'checked' : ''}
            onchange="OnboardingModule._set('has_kit_medico', this.checked, true)">
            <span><i class="ph ph-first-aid"></i> Ho un kit di primo soccorso completo</span></label>`;
    }
    return '';
  }

  function _render() {
    const el = document.getElementById('onboarding-overlay');
    if (!el) return;
    const last = step === STEPS.length - 1;
    el.innerHTML = `
      <div class="disclaimer-modal ob-modal">
        <div class="ob-progress">${STEPS.map((_, i) =>
          `<span class="${i <= step ? 'on' : ''}"></span>`).join('')}</div>
        <div class="ob-step-label">Passo ${step + 1} di ${STEPS.length}</div>
        ${_body()}
        <div class="ob-actions">
          ${step > 0 ? `<button type="button" class="btn btn-outline" onclick="OnboardingModule._back()">Indietro</button>` : `<button type="button" class="btn btn-outline" onclick="OnboardingModule.skip()">Più tardi</button>`}
          <button type="button" class="disclaimer-btn ob-next" onclick="OnboardingModule._next()">
            ${last ? '<i class="ph ph-check-circle"></i> Vedi il mio livello' : 'Avanti <i class="ph ph-arrow-right"></i>'}
          </button>
        </div>
      </div>`;
  }

  function _bump(key, delta, min) {
    data[key] = Math.max(min, Math.min(20, (data[key] || 0) + delta));
    const v = document.getElementById('ob-v-' + key);
    if (v) v.textContent = data[key];
  }

  function _num(key, val) { data[key] = Math.max(0, Utils.num(val, 0)); }

  function _set(key, val, silent) {
    data[key] = val;
    if (!silent) _render();
  }

  function _back() { if (step > 0) { step--; _render(); } }

  function _next() {
    if (step < STEPS.length - 1) { step++; _render(); return; }
    _finish();
  }

  function _finish() {
    const { shelter_key, show_all_scenari, clima_key, ha_auto, ...rest } = data;
    const sh = ALL_SHELTERS.find(x => x.key === shelter_key) || ALL_SHELTERS[1];
    const profilo = { ...SettingsModule.get(), ...rest, tipo_abitazione: sh.tipo, ...(sh.extra || {}) };
    // Senza veicolo: niente carburante né task di mobilità su strada
    const haVeicolo = ha_auto || shelter_key === 'auto';
    profilo.km_settimana = haVeicolo ? ((profilo.km_settimana || 0) > 0 ? profilo.km_settimana : 100) : 0;
    const clima = CLIMI.find(c => c.key === clima_key);
    if (clima) Object.assign(profilo, clima.vals);
    // All'aperto senza scenario scelto: il piano base da casa non ha senso → survival
    if (isOutdoor(shelter_key) && !profilo.scenario_id) profilo.scenario_id = 'survival-natura';
    // All'aperto non c'è una casa da misurare/isolare (stessa regola del tab Piano)
    if (isOutdoor(shelter_key)) { profilo.mq = 0; profilo.isolamento = 'scarso'; }
    Storage.set('profilo', profilo);
    Storage.set('onboarded', true);
    if (typeof SettingsModule._syncFromStorage === 'function') SettingsModule._syncFromStorage();
    close();
    navigateTo('home');
    DashboardModule.render();
  }

  return { isDone, maybeStart, open, skip, _bump, _num, _set, _back, _next };
})();
