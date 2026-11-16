/* ============================================================
   Settings Module (Profilo) — sezioni a gruppi, auto-save, stato per sezione
   ============================================================ */
const SettingsModule = (() => {

  const DEFAULTS = {
    adulti: 2, bambini: 0, anziani: 0,
    ha_animali: false, mobilita_ridotta: false, ha_neonato: false,
    tipo_abitazione: 'casa', mq: 80, isolamento: 'medio',
    riparo_materiale: 'tenda_da_campeggio', riparo_mq: 6,
    temp_now: 18, temp_min: 0, temp_max: 32, pioggia_mm: 700,
    acqua_scorte_litri: 0, ha_pozzo: false, ha_pioggia: false, ha_fiume: false,
    tetto_mq: 60, ha_filtro: false,
    cibo_scorte_giorni: 0,
    en_pannelli: false, en_batteria: false, en_generatore: false,
    pannelli_wp: 0, batteria_kwh: 0, generatore_w: 0, en_stagione: 'primavera',
    risc_legna: false, risc_pellet: false, risc_gpl: false,
    ri_zona: 'd', combustibile_kg: 0,
    carburante_litri: 0, km_settimana: 100,
    ca_tipo: 'diesel', ca_consumo: 7, ca_serbatoio: 50,
    has_kit_medico: false, has_gobag: false,
    // Medico
    has_farmaci_cronici: false, farmaci_scorta_giorni: 0,
    has_bls_corso: false, has_manuale_ps: false,
    // Sicurezza
    has_estintore: false, has_rilevatore_co: false,
    has_serrature_rinforzate: false, has_luci_emergenza: false,
    has_rete_vicinato: false, has_generatore_sicuro: false,
    // Scenario
    scenario_id: null,
    custom_threats: [],
    // Comunicazioni
    has_internet: true, tipo_internet: 'fibra',
    has_radio: false, has_walkie: false, has_sat_phone: false, has_mesh: false,
    comm_contatti_stampati: false,
  };

  // Sezioni del Profilo, raggruppate. Una sola sezione aperta alla volta.
  const TABS = [
    { id: 'profilo',  group: 'about', label: 'Famiglia e casa',     desc: 'Chi siete e dove vivete',            icon: 'ph-users'          },
    { id: 'scenario', group: 'about', label: 'Situazione',          desc: 'Per cosa vuoi prepararti',           icon: 'ph-warning-octagon' },
    { id: 'acqua',    group: 'have',  label: 'Acqua',               desc: 'Scorte e fonti',                     icon: 'ph-drop'           },
    { id: 'cibo',     group: 'have',  label: 'Cibo',                desc: 'Giorni di scorte',                   icon: 'ph-fork-knife'     },
    { id: 'energia',  group: 'have',  label: 'Energia',             desc: 'Pannelli, batterie, generatore',     icon: 'ph-lightning'      },
    { id: 'calore',   group: 'have',  label: 'Riscaldamento',       desc: 'Stufe e combustibile',               icon: 'ph-flame'          },
    { id: 'mobilita', group: 'have',  label: 'Auto e spostamenti',  desc: 'Carburante e kit in auto',          icon: 'ph-car'            },
    { id: 'comm',     group: 'ready', label: 'Comunicazioni',       desc: 'Radio, internet, contatti',          icon: 'ph-radio'          },
    { id: 'medico',   group: 'ready', label: 'Salute',              desc: 'Kit medico, farmaci, corsi',         icon: 'ph-first-aid'      },
    { id: 'sicurezza',group: 'ready', label: 'Sicurezza in casa',   desc: 'Estintore, rilevatore CO, vicini',   icon: 'ph-shield-check'   },
    { id: 'igiene',   group: 'ready', label: 'Igiene, documenti, contanti', desc: 'Sapone, carta, copie, soldi',  icon: 'ph-hand-soap'      },
    { id: 'zaino',    group: 'ready', label: 'Zaino d\'emergenza',   desc: 'Pronto da prendere e andare',        icon: 'ph-backpack'       },
  ];
  // Profilo = «Chi siete»; tutto il resto («cosa avete») sta nella sezione Scorte
  const STOCK_GROUPS = ['have', 'ready'];
  const isStockTab = id => { const t = TABS.find(x => x.id === id); return !!t && STOCK_GROUPS.includes(t.group); };
  const GROUPS = [
    { id: 'about', label: 'Chi siete' },
    { id: 'have',  label: 'Cosa avete già' },
    { id: 'ready', label: 'Come siete preparati' },
  ];

  let activeTab = null;

  /* ── GET ── */
  function get() { return { ...DEFAULTS, ...(Storage.get('profilo') || {}) }; }
  function getTotalPeople() {
    const p = get();
    return (p.adulti || 0) + (p.bambini || 0) + (p.anziani || 0);
  }

  /* ── SECTION SWITCH ── */
  // _tab(id)        → apre la sezione (usato da Home e calcolatori)
  // _tab(id, true)  → tocco sulla riga: apre o chiude
  function _tab(id, fromRow) {
    // le sezioni «cosa avete» sono nelle Scorte: se servono da un'altra pagina, ci si va
    const want = isStockTab(id) ? 'kit' : 'settings';
    if (!fromRow && typeof currentSection !== 'undefined' && currentSection !== want && typeof navigateTo === 'function') {
      activeTab = id;
      navigateTo(want);
    }
    activeTab = (fromRow && activeTab === id) ? null : id;
    document.querySelectorAll('.pf-sec').forEach(sec => {
      const open = sec.dataset.tab === activeTab;
      sec.classList.toggle('open', open);
      sec.querySelector('.pf-row')?.setAttribute('aria-expanded', open ? 'true' : 'false');
      sec.querySelector('.stab-panel')?.classList.toggle('hidden', !open);
    });
    if (activeTab === 'scenario') _renderScenarioTab();
    const row = activeTab && document.querySelector(`.pf-sec[data-tab="${activeTab}"]`);
    if (row) row.scrollIntoView({ block: 'start', behavior: fromRow ? 'smooth' : 'auto' });
  }

  /* ── COLLECT ALL FORM VALUES ── */
  function _collect() {
    const base = get();
    const n  = (id, def = 0) => { const el = document.getElementById(id); return el ? Utils.num(el.value, def) : (base[id] ?? def); };
    const s  = (id, def = '') => { const el = document.getElementById(id); return el ? el.value : (base[id] ?? def); };
    const c  = (id)           => { const el = document.getElementById(id); return el ? el.checked : (base[id] ?? false); };

    const tipo = s('s-tipo', 'casa');
    const ext  = ['tenda','rifugio','nessun_riparo'].includes(tipo);

    return {
      ...base,
      adulti: Math.round(n('s-adulti', 2)),
      bambini: Math.round(n('s-bambini', 0)),
      anziani: Math.round(n('s-anziani', 0)),
      ha_animali: c('s-ha-animali'),
      mobilita_ridotta: c('s-mobilita-ridotta'),
      ha_neonato: c('s-ha-neonato'),
      tipo_abitazione: tipo,
      mq: ext ? 0 : Math.round(n('s-mq', 80)),
      isolamento: ext ? 'scarso' : s('s-isolamento', 'medio'),
      riparo_materiale: ext ? s('s-riparo-materiale') : null,
      riparo_mq: ext ? Math.round(n('s-riparo-mq', 6)) : null,
      temp_now: Math.round(n('s-temp-now', 18)),
      temp_min: Math.round(n('s-temp-min', 0)),
      temp_max: Math.round(n('s-temp-max', 32)),
      pioggia_mm: Math.round(n('s-pioggia', 700)),
      acqua_scorte_litri: Math.round(n('s-acqua-litri', 0)),
      ha_pozzo:   c('s-acqua-pozzo'),
      ha_pioggia: c('s-acqua-pioggia'),
      ha_fiume:   c('s-acqua-fiume'),
      ha_filtro:  c('s-ha-filtro'),
      tetto_mq:   Math.round(n('s-tetto', 60)),
      cibo_scorte_giorni: Math.round(n('s-cibo-giorni', 0)),
      cibo_attivita: s('s-cibo-attivita', 'normale'),
      en_pannelli:   c('s-en-pannelli'),
      en_batteria:   c('s-en-batteria'),
      en_generatore: c('s-en-generatore'),
      pannelli_wp:   Math.round(n('s-pannelli-wp', 0)),
      batteria_kwh:  parseFloat(n('s-batteria-kwh', 0).toFixed ? n('s-batteria-kwh', 0).toFixed(1) : 0),
      generatore_w:  Math.round(n('s-gen-w', 0)),
      en_stagione:   s('s-en-stagione', 'primavera'),
      risc_legna:  c('s-risc-legna'),
      risc_pellet: c('s-risc-pellet'),
      risc_gpl:    c('s-risc-gpl'),
      ri_zona:      s('s-ri-zona', 'd'),
      combustibile_kg: Math.round(n('s-combustibile-kg', 0)),
      carburante_litri: Math.round(n('s-carburante-litri', 0)),
      km_settimana:    Math.round(n('s-km-settimana', 100)),
      ca_tipo:    s('s-ca-tipo', 'diesel'),
      ca_consumo: parseFloat(n('s-ca-consumo', 7)),
      ca_serbatoio: Math.round(n('s-ca-serbatoio', 50)),
      has_kit_medico: c('s-has-kit-medico'),
      has_gobag:      c('s-has-gobag'),
      // Medico
      has_farmaci_cronici:  c('s-has-farmaci-cronici'),
      farmaci_scorta_giorni: Math.round(n('s-farmaci-giorni', 0)),
      has_bls_corso:    c('s-has-bls'),
      has_manuale_ps:   c('s-has-manuale-ps'),
      // Sicurezza
      has_estintore:          c('s-has-estintore'),
      has_rilevatore_co:      c('s-has-rilevatore-co'),
      has_serrature_rinforzate: c('s-has-serrature'),
      has_luci_emergenza:     c('s-has-luci-emergenza'),
      has_rete_vicinato:      c('s-has-rete-vicinato'),
      has_generatore_sicuro:  c('s-has-gen-sicuro'),
      // Comunicazioni
      has_internet:          c('s-has-internet'),
      tipo_internet:         s('s-tipo-internet', 'fibra'),
      has_radio:             c('s-has-radio'),
      has_walkie:            c('s-has-walkie'),
      has_sat_phone:         c('s-has-sat-phone'),
      has_mesh:              c('s-has-mesh'),
      comm_contatti_stampati: c('s-comm-contatti'),
    };
  }

  /* ── AUTO-SAVE ── */
  let _saveTimer = null;
  function _autoSave() {
    clearTimeout(_saveTimer);
    _saveTimer = setTimeout(() => {
      const p = _collect();
      Storage.set('profilo', p);
      _updateTabResults(p);
      if (typeof DashboardModule !== 'undefined') DashboardModule.render();
    }, 120);
  }

  /* ── LIVE RESULT BADGES ── */
  function _updateTabResults(p) {
    if (!p) p = _collect();
    _rAcqua(p); _rCibo(p); _rEnergia(p); _rCalore(p); _rComm(p); _rMobilita(p);
    _rMedico(p); _rSicurezza(p); _rProfilo(p); _rScenario(p);
  }

  const TIPO_LABEL = {
    appartamento: 'Appartamento', casa: 'Casa indipendente', rurale: 'Casa rurale',
    isolata: 'Casa isolata', ospite: 'Ospite', tenda: 'Tenda', rifugio: 'Rifugio', nessun_riparo: 'Senza riparo',
  };
  function _rProfilo(p) {
    const n = (p.adulti || 0) + (p.bambini || 0) + (p.anziani || 0);
    _badge('sr-profilo', `${n} ${n === 1 ? 'persona' : 'persone'}`, TIPO_LABEL[p.tipo_abitazione] || '', 'neutral');
  }
  function _rScenario(p) {
    const id = p.scenario_id;
    const sc = (window.SCENARI_LIST || []).find(s => s.id === id);
    const label = id === 'custom' ? 'Personalizzata' : (sc?.titolo || '');
    _badge('sr-scenario', label || 'Da scegliere', '', label ? 'neutral' : 'warn');
  }

  function _badge(id, val, sub, cls) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<span class="sr-val ${cls}">${val}</span>`;
    el.title = sub || '';
  }

  function _gg(n) { return n === 1 ? '1 giorno' : n + ' giorni'; }
  function _rAcqua(p) {
    const persone = (p.adulti || 2) + (p.bambini || 0) * 0.7 + (p.anziani || 0) * 0.9;
    // Stessa regola di Home e task: Utils.WATER_L_PPD L/persona/giorno (bere + cucinare)
    const litriGiorno = persone * Utils.WATER_L_PPD;
    const giorni = Math.round((p.acqua_scorte_litri || 0) / Math.max(1, litriGiorno));
    const sub = `autonomia (${Utils.WATER_L_PPD} L/persona/giorno)`;
    _badge('sr-acqua', _gg(giorni), sub, giorni >= 30 ? 'good' : giorni >= 7 ? 'warn' : 'bad');
  }
  function _rCibo(p) {
    const g = p.cibo_scorte_giorni || 0;
    // stesso riferimento del calcolatore Cibo: 2.100 kcal a persona al giorno (Manuale Sphere / UNHCR)
    const kcalGiorno = 2100 * ((p.adulti || 0) + (p.bambini || 0) + (p.anziani || 0));
    const sub = `autonomia · ${Math.round(kcalGiorno)} kcal/giorno fam.`;
    _badge('sr-cibo', _gg(g), sub, g >= 30 ? 'good' : g >= 7 ? 'warn' : 'bad');
  }
  function _rEnergia(p) {
    const fonti = [p.en_pannelli && 'Solare', p.en_batteria && 'Batteria', p.en_generatore && 'Gen.'].filter(Boolean);
    _badge('sr-energia', fonti.length > 0 ? fonti.join(', ') : 'Nessuna', 'energia alternativa',
      fonti.length >= 2 ? 'good' : fonti.length === 1 ? 'warn' : 'bad');
  }
  function _rCalore(p) {
    const r = [p.risc_legna && 'Legna', p.risc_pellet && 'Pellet', p.risc_gpl && 'GPL'].filter(Boolean);

    // Stima giorni dal combustibile stoccato: stessa formula e stessi valori del calcolatore Riscaldamento
    const est      = RiscaldamentoModule.profileEstimate(p);
    const dailyKwh = est.kwhGiorno;
    const giorni   = est.giorni;
    const hasFuel  = (p.combustibile_kg || 0) > 0;

    const sub = r.length > 0 && hasFuel
      ? `~${giorni}gg · ${Math.round(dailyKwh)}kWh/giorno stimato`
      : 'riscaldamento alternativo';
    _badge('sr-calore', r.length > 0 ? r.join('+') : 'Nessuno', sub,
      r.length >= 1 && (giorni >= 30 || !hasFuel) ? 'good' : r.length >= 1 ? 'warn' : 'bad');
  }
  function _rComm(p) {
    // Count independent channels (excluding standard internet which can fail)
    const canali = [
      p.has_radio     && 'Radio',
      p.has_walkie    && 'Walkie',
      p.has_sat_phone && 'Satellite',
      p.has_mesh      && 'Mesh',
    ].filter(Boolean);
    const internet = p.has_internet ? ` +internet` : '';
    _badge('sr-comm',
      canali.length > 0 ? canali.join(', ') : 'Nessun canale',
      'emergenza' + internet,
      canali.length >= 2 ? 'good' : canali.length === 1 ? 'warn' : 'bad');
  }
  function _rMobilita(p) {
    const km   = p.km_settimana || 0;
    const cons = p.ca_consumo || 7;
    const litSett = km * cons / 100;
    const sett = litSett > 0
      ? Math.round((p.carburante_litri || 0) / litSett)
      : (p.carburante_litri > 0 ? 8 : 0);
    _badge('sr-mobilita', sett === 1 ? '1 settimana' : sett + ' settimane', 'autonomia carburante',
      sett >= 4 ? 'good' : sett >= 1 ? 'warn' : 'bad');
  }
  function _rMedico(p) {
    const items = [
      p.has_kit_medico       && 'Kit',
      p.has_farmaci_cronici  && 'Farmaci',
      p.has_bls_corso        && 'BLS',
      p.has_manuale_ps       && 'Manuale',
    ].filter(Boolean);
    _badge('sr-medico',
      items.length + ' su 4',
      'preparazione medica',
      items.length >= 3 ? 'good' : items.length >= 1 ? 'warn' : 'bad');
  }
  function _rSicurezza(p) {
    const items = [
      p.has_estintore            && 'Estintore',
      p.has_rilevatore_co        && 'CO',
      p.has_serrature_rinforzate && 'Serrature',
      p.has_luci_emergenza       && 'Luci',
      p.has_rete_vicinato        && 'Vicinato',
    ].filter(Boolean);
    _badge('sr-sicurezza',
      items.length + ' su 5',
      'sicurezza attiva',
      items.length >= 4 ? 'good' : items.length >= 2 ? 'warn' : 'bad');
  }

  // numero di voci spuntate per area (checklist delle Scorte)
  function refreshCounts() {
    if (typeof KitModule === 'undefined') return;
    TABS.forEach(t => {
      const el = document.getElementById('kc-' + t.id);
      const c = KitModule.areaCount(t.id);
      if (el) el.textContent = c ? ` · ${c.done}/${c.total} oggetti` : '';
    });
  }

  /* ── TEMPERATURE ── */
  const TEMP_MIN = -20, TEMP_SPAN = 65;
  function _tPct(t) { return Math.max(0, Math.min(100, ((t - TEMP_MIN) / TEMP_SPAN) * 100)); }
  function _tLabel(t) {
    if (t <= -10) return { text:'Pericolo gelo', cls:'temp-badge-freeze' };
    if (t <=   0) return { text:'Sotto zero',    cls:'temp-badge-cold'   };
    if (t <=  10) return { text:'Freddo',        cls:'temp-badge-cold'   };
    if (t <=  18) return { text:'Fresco',        cls:'temp-badge-cool'   };
    if (t <=  25) return { text:'Mite',          cls:'temp-badge-mild'   };
    if (t <=  33) return { text:'Caldo',         cls:'temp-badge-hot'    };
    return { text:'Caldo estremo', cls:'temp-badge-extreme' };
  }

  function renderClimateVis() {
    const min = Utils.int(document.getElementById('s-temp-min')?.value, 0);
    const max = Utils.int(document.getElementById('s-temp-max')?.value, 32);
    const now = Utils.int(document.getElementById('s-temp-now')?.value, 18);
    const lbl = _tLabel(now);
    const badge = document.getElementById('s-temp-now-badge');
    if (badge) { badge.textContent = lbl.text; badge.className = 'temp-badge ' + lbl.cls; }
    const vis = document.getElementById('s-climate-vis');
    if (!vis) return;
    vis.innerHTML = `
      <div class="climate-bar-wrap">
        <div class="climate-bar-labels-top"><span>-20°C</span><span>0°C</span><span>+20°C</span><span>+45°C</span></div>
        <div class="climate-bar">
          <div class="climate-range" style="left:${_tPct(min)}%;width:${Math.max(1,_tPct(max)-_tPct(min))}%"></div>
          <div class="climate-pin climate-pin-min" style="left:${_tPct(min)}%"><span class="climate-pin-label">${min}°C</span></div>
          <div class="climate-pin climate-pin-now" style="left:${_tPct(now)}%"><span class="climate-pin-label climate-pin-label-now">▼${now}°C</span></div>
          <div class="climate-pin climate-pin-max" style="left:${_tPct(max)}%"><span class="climate-pin-label">${max}°C</span></div>
        </div>
        <div class="climate-bar-legend">
          <span class="legend-min">Min storico</span>
          <span class="legend-now">▼ Ora</span>
          <span class="legend-max">Max storico</span>
        </div>
      </div>`;
  }

  function _onTipoChange(val) {
    const ext = ['tenda','rifugio','nessun_riparo'].includes(val);
    document.getElementById('s-casa-fields').style.display  = ext ? 'none' : '';
    document.getElementById('s-riparo-panel').style.display = ext ? 'block' : 'none';
    document.getElementById('s-guida-rifugio').style.display = val === 'nessun_riparo' ? 'block' : 'none';
  }
  function _onTempChange() { renderClimateVis(); _autoSave(); }

  function _toggleEnDetail() {
    const any = document.getElementById('s-en-pannelli')?.checked
              || document.getElementById('s-en-batteria')?.checked
              || document.getElementById('s-en-generatore')?.checked;
    document.getElementById('s-energia-detail')?.classList.toggle('hidden', !any);
    document.getElementById('s-pannelli-group').style.display  = document.getElementById('s-en-pannelli')?.checked  ? 'block' : 'none';
    document.getElementById('s-batteria-group').style.display  = document.getElementById('s-en-batteria')?.checked  ? 'block' : 'none';
    document.getElementById('s-generatore-group').style.display= document.getElementById('s-en-generatore')?.checked ? 'block' : 'none';
  }

  /* ── SCENARIO TAB ── */
  const SEVERITY_LABEL = { 1:'BASSO', 2:'MEDIO', 3:'ALTO' };
  const SEVERITY_CLS   = { 1:'severity-1', 2:'severity-2', 3:'severity-3' };

  const THREAT_OPTIONS = [
    { id:'blackout',    label:'Blackout',        icon:'ph-lightning-slash' },
    { id:'acqua',       label:'Emergenza Acqua',  icon:'ph-drop-slash'      },
    { id:'gas',         label:'Gas off',          icon:'ph-flame'           },
    { id:'cibo',        label:'Cibo scarso',      icon:'ph-fork-knife'      },
    { id:'carburante',  label:'Carburante',       icon:'ph-gas-pump'        },
    { id:'freddo',      label:'Freddo',           icon:'ph-snowflake'       },
    { id:'comm',        label:'No internet',      icon:'ph-wifi-slash'      },
    { id:'medico',      label:'Medico limitato',  icon:'ph-first-aid'       },
  ];

  function _renderScenarioTab() {
    const panel = document.getElementById('stab-scenario');
    if (!panel) return;
    const p = get();
    _rScenario(p);
    const activeId = p.scenario_id || null;
    const list = window.SCENARI_LIST || [];
    const activeSc = list.find(s => s.id === activeId);
    const customThreats = p.custom_threats || [];
    const activeLabel = activeId === 'custom'
      ? 'Scenario Personalizzato'
      : (activeSc?.titolo || activeId);

    panel.innerHTML = `
      <div class="alert ${activeId ? 'alert-warning' : 'alert-info'} mb-16">
        <i class="ph ph-warning-octagon"></i>
        <div>${activeId
          ? `<strong>Scenario attivo: ${activeLabel}</strong> — Le minacce e le task sono calibrate su questo scenario.`
          : 'Seleziona lo <strong>scenario attuale</strong>: determina i rischi prioritari e le azioni nella Home.'
        }</div>
      </div>

      <div class="scenario-pick-grid">
        ${list.map(s => `
          <div class="scenario-pick-card${activeId === s.id ? ' active' : ''}"
               onclick="SettingsModule.selectScenario('${s.id}')">
            <div class="sp-head">
              <span class="sp-emoji">${s.icon}</span>
              <span class="severity-badge ${SEVERITY_CLS[s.severity] || 'severity-2'}">${SEVERITY_LABEL[s.severity] || 'MEDIO'}</span>
              ${activeId === s.id ? '<i class="ph ph-check-circle sp-check-icon"></i>' : ''}
            </div>
            <div class="sp-title">${s.titolo}</div>
            <div class="sp-desc">${s.desc}</div>
            <div class="sp-threats">
              ${(s.threats || []).map(tid => `<span class="sp-threat-tag">${tid.toUpperCase()}</span>`).join('')}
            </div>
          </div>
        `).join('')}

        <!-- Custom scenario card -->
        <div class="scenario-pick-card scenario-pick-custom${activeId === 'custom' ? ' active' : ''}"
             onclick="SettingsModule.selectScenario('custom')">
          <div class="sp-head">
            <span class="sp-emoji">⚙️</span>
            <span class="severity-badge severity-2">CUSTOM</span>
            ${activeId === 'custom' ? '<i class="ph ph-check-circle sp-check-icon"></i>' : ''}
          </div>
          <div class="sp-title">Personalizzato</div>
          <div class="sp-desc">Scegli tu quali minacce attivare</div>
          <div class="sp-threats">
            ${customThreats.length > 0
              ? customThreats.map(tid => `<span class="sp-threat-tag">${tid.toUpperCase()}</span>`).join('')
              : '<span style="font-size:0.75rem;color:var(--text-secondary)">Configura sotto →</span>'}
          </div>
        </div>
      </div>

      ${activeId === 'custom' ? `
        <div class="card mt-12 mb-12">
          <h3 style="margin-bottom:12px"><i class="ph ph-sliders"></i> Seleziona Minacce Attive</h3>
          <div class="custom-threat-grid">
            ${THREAT_OPTIONS.map(t => `
              <label class="check-option${customThreats.includes(t.id) ? ' checked' : ''}">
                <input type="checkbox" ${customThreats.includes(t.id) ? 'checked' : ''}
                  onchange="SettingsModule.toggleCustomThreat('${t.id}', this.checked)">
                <span><i class="ph ${t.icon}"></i> ${t.label}</span>
              </label>
            `).join('')}
          </div>
        </div>` : ''}

      ${activeId ? `<div class="sp-clear-row">
        <button class="btn btn-outline btn-sm" onclick="SettingsModule.selectScenario('${activeId}')">
          <i class="ph ph-x"></i> Rimuovi scenario attivo
        </button>
      </div>` : ''}

      ${activeId && activeId !== 'custom' ? _renderScenarioPlan(activeSc) : ''}
    `;
  }

  function _renderScenarioPlan(s) {
    if (!s) return '';
    const saved = Storage.get('sc-checks-' + s.id) || {};
    return `
      <div class="card mt-16">
        <div class="flex-between mb-16">
          <h3>${s.icon} Piano d'Azione: ${s.titolo}</h3>
          <button class="btn btn-outline btn-sm" onclick="SettingsModule._resetScCheck('${s.id}')">
            <i class="ph ph-arrow-counter-clockwise"></i> Reset
          </button>
        </div>
        ${s.steps.map((fase, fi) => `
          <div style="margin-bottom:20px">
            <div class="shop-category-title">${fase.fase}</div>
            <ul class="checklist">
              ${fase.azioni.map((azione, ai) => {
                const key = fi + '_' + ai;
                const checked = !!saved[key];
                return `<li class="checklist-item${checked ? ' checked' : ''}"
                            onclick="SettingsModule._toggleScCheck('${s.id}', '${key}', this)">
                          <input type="checkbox" ${checked ? 'checked' : ''} onclick="event.stopPropagation()">
                          <span class="checklist-label">${azione}</span>
                        </li>`;
              }).join('')}
            </ul>
          </div>
        `).join('')}
      </div>`;
  }

  function selectScenario(id) {
    const p = get();
    // Toggle off if clicking the same scenario
    p.scenario_id = (id && id !== p.scenario_id) ? id : null;
    Storage.set('profilo', p);
    _renderScenarioTab();
    if (typeof DashboardModule !== 'undefined') DashboardModule.render();
  }

  function _toggleScCheck(scenId, key, el) {
    const saved = Storage.get('sc-checks-' + scenId) || {};
    saved[key] = !saved[key];
    Storage.set('sc-checks-' + scenId, saved);
    el.classList.toggle('checked', saved[key]);
    el.querySelector('input[type=checkbox]').checked = saved[key];
  }

  function _resetScCheck(scenId) {
    if (!confirm('Azzerare la checklist per questo scenario?')) return;
    Storage.remove('sc-checks-' + scenId);
    _renderScenarioTab();
  }

  function toggleCustomThreat(tid, checked) {
    const p = get();
    const threats = [...(p.custom_threats || [])];
    const idx = threats.indexOf(tid);
    if (checked && idx < 0) threats.push(tid);
    else if (!checked && idx >= 0) threats.splice(idx, 1);
    p.custom_threats = threats;
    Storage.set('profilo', p);
    _renderScenarioTab();
    if (typeof DashboardModule !== 'undefined') DashboardModule.render();
  }

  /* ── TAB COMPLETENESS ── */
  const TAB_FIELDS = {
    acqua:    { keys: ['acqua_scorte_litri','ha_filtro','ha_pozzo','ha_pioggia'], positives: ['ha_filtro','ha_pozzo','ha_pioggia'], numThreshold: { acqua_scorte_litri: 30 } },
    cibo:     { keys: ['cibo_scorte_giorni'], numThreshold: { cibo_scorte_giorni: 14 } },
    energia:  { keys: ['en_pannelli','en_batteria','en_generatore'], positives: ['en_pannelli','en_batteria','en_generatore'] },
    calore:   { keys: ['risc_legna','risc_pellet','risc_gpl','combustibile_kg'], positives: ['risc_legna','risc_pellet','risc_gpl'], numThreshold: { combustibile_kg: 10 } },
    comm:     { keys: ['has_radio','has_walkie','has_sat_phone','has_mesh'], positives: ['has_radio','has_walkie','has_sat_phone','has_mesh'] },
    mobilita: { keys: ['carburante_litri','has_gobag'], numThreshold: { carburante_litri: 20 }, positives: ['has_gobag'] },
    medico:   { keys: ['has_kit_medico','has_farmaci_cronici','has_bls_corso','has_manuale_ps'], positives: ['has_kit_medico','has_farmaci_cronici','has_bls_corso','has_manuale_ps'] },
    sicurezza:{ keys: ['has_estintore','has_rilevatore_co','has_serrature_rinforzate','has_rete_vicinato'], positives: ['has_estintore','has_rilevatore_co','has_serrature_rinforzate','has_rete_vicinato'] },
  };

  function _tabCompleteness(tabId) {
    const def = TAB_FIELDS[tabId];
    if (!def) return null;
    const p = get();
    let filled = 0;
    const total = def.keys.length;
    def.keys.forEach(k => {
      const v = p[k];
      if (def.positives?.includes(k)) { if (v) filled++; }
      else if (def.numThreshold?.[k] !== undefined) { if ((v || 0) >= def.numThreshold[k]) filled++; }
      else if (v != null && v !== 0 && v !== false && v !== '') filled++;
    });
    return { filled, total, pct: Math.round(filled / total * 100) };
  }

  /* ── HTML BUILDERS ── */
  function _section(t, inner) {
    const open = t.id === activeTab;
    return `<div class="pf-sec${open ? ' open' : ''}" data-tab="${t.id}">
      <button class="pf-row" aria-expanded="${open}" aria-controls="stab-${t.id}" onclick="SettingsModule._tab('${t.id}', true)">
        <span class="pf-ico"><i class="ph ${t.icon}"></i></span>
        <span class="pf-txt"><span class="pf-title">${t.label}</span><span class="pf-desc">${t.desc}<span class="pf-kc" id="kc-${t.id}"></span></span></span>
        <span class="pf-status" id="sr-${t.id}"></span>
        <i class="ph ph-caret-down pf-caret"></i>
      </button>
      <div class="stab-panel${open ? '' : ' hidden'}" id="stab-${t.id}">${inner}${typeof KitModule !== 'undefined' ? KitModule.areaHtml(t.id) : ''}</div>
    </div>`;
  }

  function _sectionsHtml(groupIds) {
    const builders = {
      profilo: _htmlProfilo, scenario: () => '', acqua: _htmlAcqua, cibo: _htmlCibo,
      energia: _htmlEnergia, calore: _htmlCalore, mobilita: _htmlMobilita,
      comm: _htmlComm, medico: _htmlMedico, sicurezza: _htmlSicurezza,
      igiene: () => '', zaino: _htmlZaino,
    };
    return GROUPS.filter(g => groupIds.includes(g.id)).map(g => `
      <div class="pf-group">
        <h2 class="pf-group-title">${g.label}</h2>
        ${TABS.filter(t => t.group === g.id).map(t => _section(t, builders[t.id]())).join('')}
      </div>`).join('');
  }

  function _htmlProfilo() { return `
    <div class="card">
      <h3><i class="ph ph-users"></i> Composizione Famiglia</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Adulti (14–65 anni)</label>
          <input type="number" id="s-adulti" min="0" max="20" value="2">
        </div>
        <div class="form-group">
          <label>Bambini (sotto i 14 anni)</label>
          <input type="number" id="s-bambini" min="0" max="10" value="0">
        </div>
        <div class="form-group">
          <label>Anziani (oltre 65 anni)</label>
          <input type="number" id="s-anziani" min="0" max="10" value="0">
        </div>
      </div>
      <label class="check-option"><input type="checkbox" id="s-ha-neonato">
        <span><i class="ph ph-baby"></i> C'è un neonato (sotto 1 anno)</span></label>
      <label class="check-option"><input type="checkbox" id="s-mobilita-ridotta">
        <span><i class="ph ph-wheelchair"></i> Qualcuno fa fatica a muoversi o a usare le scale</span></label>
      <label class="check-option"><input type="checkbox" id="s-ha-animali">
        <span><i class="ph ph-paw-print"></i> Ho animali domestici</span></label>
    </div>

    <div class="card">
      <h3><i class="ph ph-house-simple"></i> Abitazione / Riparo</h3>
      <div class="form-group mb-16">
        <label>Tipo di riparo</label>
        <select id="s-tipo">
          <option value="appartamento">Appartamento / condominio</option>
          <option value="casa" selected>Casa indipendente</option>
          <option value="rurale">Casa rurale / campagna</option>
          <option value="isolata">Isolata / fuori rete</option>
          <option value="ospite">Ospite / centro accoglienza</option>
          <optgroup label="── Emergenza ──">
            <option value="tenda">Tenda / accampamento</option>
            <option value="rifugio">Rifugio improvvisato</option>
            <option value="nessun_riparo">Nessun riparo — da costruire</option>
          </optgroup>
        </select>
      </div>
      <div id="s-casa-fields" class="form-row">
        <div class="form-group">
          <label>Superficie (m²)</label>
          <input type="number" id="s-mq" min="20" max="500" value="80">
        </div>
        <div class="form-group">
          <label>Isolamento termico</label>
          <select id="s-isolamento">
            <option value="scarso">Scarso (anni '60-'70)</option>
            <option value="medio" selected>Medio (finestre doppie)</option>
            <option value="buono">Buono (cappotto)</option>
            <option value="ottimo">Ottimo (casa passiva)</option>
          </select>
        </div>
      </div>
      <div id="s-riparo-panel" style="display:none">
        <div class="form-row">
          <div class="form-group">
            <label>Materiale riparo</label>
            <select id="s-riparo-materiale">
              <option value="tenda_da_campeggio">Tenda da campeggio (3 stagioni)</option>
              <option value="tenda_expedition">Tenda expedition (4 stagioni)</option>
              <option value="telo_tarp">Telo impermeabile / tarp</option>
              <option value="materiali_naturali">Materiali naturali</option>
              <option value="veicolo">Veicolo (auto/furgone)</option>
              <option value="nessuno">Da costruire</option>
            </select>
          </div>
          <div class="form-group">
            <label>Superficie coperta (m²)</label>
            <input type="number" id="s-riparo-mq" min="2" max="50" value="6">
          </div>
        </div>
        <div id="s-guida-rifugio" class="riparo-guida" style="display:none">
          <div class="riparo-guida-title"><i class="ph ph-hard-hat"></i> Costruzione rifugio — linee guida rapide</div>
          <ul class="riparo-steps">
            <li><i class="ph ph-map-pin"></i> <strong>Sito:</strong> zona elevata, riparata dal vento, lontano da corsi d'acqua e alberi morti</li>
            <li><i class="ph ph-tree-evergreen"></i> <strong>Struttura:</strong> palo orizzontale su forcelle, rami diagonali, copertura foglie ≥30cm</li>
            <li><i class="ph ph-leaf"></i> <strong>Suolo:</strong> foglie secche ≥15cm — il freddo sale dal basso più che dall'alto</li>
            <li><i class="ph ph-wind"></i> <strong>Dimensioni:</strong> più piccolo = più caldo</li>
            <li><i class="ph ph-clock"></i> <strong>Tempo:</strong> 2–4h per rifugio base, iniziare 3h prima del buio</li>
          </ul>
        </div>
        <div class="riparo-alert">
          <i class="ph ph-warning-octagon"></i>
          <div><strong>Fabbisogno termico critico</strong> — senza isolamento il consumo calore è 3–5× superiore. Priorità: sacco a pelo adeguato, isolamento dal suolo.</div>
        </div>
      </div>
    </div>

    <details class="card adv-card"><summary><i class="ph ph-thermometer"></i> Clima Locale <span class="adv-tag">opzionale</span></summary>
      <p class="text-secondary text-sm mb-16">Usato per calcolare riscaldamento, scoring e auto-rilevamento minacce.</p>
      <div class="temp-now-row">
        <div class="temp-now-label"><i class="ph ph-thermometer-hot"></i><span>Temperatura <strong>ORA</strong></span></div>
        <div class="temp-now-input-wrap">
          <input type="number" id="s-temp-now" min="-30" max="55" value="18" step="1">
          <span class="temp-now-unit">°C</span>
        </div>
        <div id="s-temp-now-badge" class="temp-badge">Mite</div>
      </div>
      <div class="form-row mt-12">
        <div class="form-group">
          <label>Minima invernale (°C)</label>
          <input type="number" id="s-temp-min" min="-30" max="15" value="0" step="1">
          <span class="form-hint">Es: -5°C montagna, +5°C costa</span>
        </div>
        <div class="form-group">
          <label>Massima estiva (°C)</label>
          <input type="number" id="s-temp-max" min="15" max="55" value="32" step="1">
        </div>
        <div class="form-group">
          <label>Pioggia annua (mm)</label>
          <input type="number" id="s-pioggia" min="100" max="3000" value="700" step="50">
        </div>
      </div>
      <div id="s-climate-vis" class="climate-vis mt-16"></div>
    </details>
  `; }

  function _htmlAcqua() { return `
    <div class="card">
      <h3><i class="ph ph-package"></i> Scorte Stoccate</h3>
      <div class="big-input-group">
        <label>Acqua disponibile</label>
        <div class="big-input-wrap">
          <input type="number" id="s-acqua-litri" min="0" max="10000" value="0" step="5">
          <span class="big-input-unit">litri</span>
        </div>
        <span class="form-hint">Bottiglie + taniche + cisterne — aggiorna quando cambia</span>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-drop"></i> Fonti Alternative</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-acqua-pozzo">
          <span><i class="ph ph-cylinder"></i> Pozzo privato</span></label>
        <label class="check-option"><input type="checkbox" id="s-acqua-pioggia">
          <span><i class="ph ph-cloud-rain"></i> Raccolta pioggia</span></label>
        <label class="check-option"><input type="checkbox" id="s-acqua-fiume">
          <span><i class="ph ph-waves"></i> Fiume / sorgente</span></label>
        <label class="check-option"><input type="checkbox" id="s-ha-filtro">
          <span><i class="ph ph-funnel"></i> Filtro portatile (Sawyer/LifeStraw)</span></label>
      </div>
      <div class="form-group mt-12" id="s-tetto-group" style="display:none">
        <label>Superficie tetto raccolta (m²)</label>
        <input type="number" id="s-tetto" value="60" min="10" max="500">
        <span class="form-hint">Raccolta stimata = pioggia_mm × m² × 0.8 / 1000 = L/anno</span>
      </div>
    </div>
    <div class="card">
      <button class="btn btn-outline btn-sm btn-full" onclick="navigateTo('acqua')">
        <i class="ph ph-calculator"></i> Calcolatore acqua dettagliato →
      </button>
    </div>
  `; }

  function _htmlCibo() { return `
    <div class="card">
      <h3><i class="ph ph-package"></i> Scorte Alimentari</h3>
      <div class="big-input-group">
        <label>Autonomia alimentare</label>
        <div class="big-input-wrap">
          <input type="number" id="s-cibo-giorni" min="0" max="365" value="0">
          <span class="big-input-unit">giorni</span>
        </div>
        <span class="form-hint">Giorni di autonomia per tutta la famiglia — aggiorna dopo ogni acquisto</span>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-bowl-food"></i> Fabbisogno di riferimento</h3>
      <p class="text-secondary text-sm">Per le scorte l'app calcola 2.100 kcal a persona al giorno: è il valore medio usato per pianificare gli aiuti alimentari nelle emergenze (Manuale Sphere, UNHCR). Bambini, anziani, donne in gravidanza o allattamento e chi fa lavori pesanti possono avere bisogni diversi.</p>
    </div>
    <div class="card">
      <h3><i class="ph ph-target"></i> Target di Riferimento</h3>
      <div class="result-row"><span class="result-label">Minimo emergenza</span><span class="result-value" style="color:var(--warning)">7 giorni</span></div>
      <div class="result-row"><span class="result-label">Crisi 2–4 settimane</span><span class="result-value" style="color:var(--warning)">30 giorni</span></div>
      <div class="result-row"><span class="result-label">Preparazione seria</span><span class="result-value" style="color:var(--success)">60+ giorni</span></div>
      <div class="result-row"><span class="result-label">Autonomia completa</span><span class="result-value" style="color:var(--success)">90+ giorni</span></div>
      <button class="btn btn-outline btn-sm btn-full mt-12" onclick="navigateTo('cibo')">
        <i class="ph ph-calculator"></i> Calcolatore scorte dettagliato →
      </button>
    </div>
  `; }

  function _htmlEnergia() { return `
    <div class="card">
      <h3><i class="ph ph-sun"></i> Fonti Disponibili</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-en-pannelli">
          <span><i class="ph ph-sun"></i> Pannelli solari</span></label>
        <label class="check-option"><input type="checkbox" id="s-en-batteria">
          <span><i class="ph ph-battery-charging"></i> Batteria stazionaria</span></label>
        <label class="check-option"><input type="checkbox" id="s-en-generatore">
          <span><i class="ph ph-engine"></i> Generatore</span></label>
      </div>
      <div id="s-energia-detail" class="mt-12 hidden">
        <div class="form-row">
          <div class="form-group" id="s-pannelli-group" style="display:none">
            <label>Pannelli — potenza (Wp)</label>
            <input type="number" id="s-pannelli-wp" value="0" min="0" step="100">
            <span class="form-hint">Es: 2 × 400W = 800Wp</span>
          </div>
          <div class="form-group" id="s-batteria-group" style="display:none">
            <label>Batteria — capacità (kWh)</label>
            <input type="number" id="s-batteria-kwh" value="0" min="0" step="0.5">
          </div>
          <div class="form-group" id="s-generatore-group" style="display:none">
            <label>Generatore — potenza (W)</label>
            <input type="number" id="s-gen-w" value="0" min="0" step="100">
          </div>
        </div>
      </div>
    </div>
    <details class="card adv-card"><summary><i class="ph ph-calendar"></i> Stagione Attuale <span class="adv-tag">opzionale</span></summary>
      <select id="s-en-stagione">
        <option value="estate">Estate (max produzione solare)</option>
        <option value="primavera" selected>Primavera / Autunno</option>
        <option value="inverno">Inverno (min produzione)</option>
      </select>
      <p class="form-hint mt-8">Influenza la stima della produzione solare giornaliera nel dashboard.</p>
      <button class="btn btn-outline btn-sm btn-full mt-12" onclick="navigateTo('energia')">
        <i class="ph ph-calculator"></i> Calcolatore autonomia dettagliato →
      </button>
    </details>
  `; }

  function _htmlCalore() { return `
    <div class="card">
      <h3><i class="ph ph-flame"></i> Riscaldamento Alternativo</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-risc-legna">
          <span><i class="ph ph-tree"></i> Stufa a legna / camino</span></label>
        <label class="check-option"><input type="checkbox" id="s-risc-pellet">
          <span><i class="ph ph-fire"></i> Stufa a pellet</span></label>
        <label class="check-option"><input type="checkbox" id="s-risc-gpl">
          <span><i class="ph ph-cylinder"></i> GPL / bombole</span></label>
      </div>
      <div class="big-input-group mt-16">
        <label>Combustibile stoccato</label>
        <div class="big-input-wrap">
          <input type="number" id="s-combustibile-kg" min="0" max="5000" value="0" step="10">
          <span class="big-input-unit">kg</span>
        </div>
        <span class="form-hint">Legna, pellet o GPL in kg equivalenti</span>
      </div>
    </div>
    <details class="card adv-card"><summary><i class="ph ph-map-pin"></i> Zona Climatica <span class="adv-tag">opzionale</span></summary>
      <select id="s-ri-zona">
        <option value="a">A – Siracusa, Lampedusa (GG 600)</option>
        <option value="b">B – Palermo, Napoli (GG 900)</option>
        <option value="c">C – Roma, Firenze (GG 1400)</option>
        <option value="d" selected>D – Milano, Torino (GG 2100)</option>
        <option value="e">E – Venezia, Trento (GG 2800)</option>
        <option value="f">F – Bolzano, alta montagna (GG 3800)</option>
      </select>
      <button class="btn btn-outline btn-sm btn-full mt-12" onclick="navigateTo('riscaldamento')">
        <i class="ph ph-calculator"></i> Calcolatore combustibile dettagliato →
      </button>
    </details>
  `; }

  function _htmlComm() { return `
    <div class="card">
      <h3><i class="ph ph-wifi"></i> Connettività Internet</h3>
      <div class="checkbox-grid" style="margin-bottom:12px">
        <label class="check-option"><input type="checkbox" id="s-has-internet" checked>
          <span><i class="ph ph-wifi"></i> Internet disponibile ora</span></label>
      </div>
      <div class="form-group">
        <label>Tipo connessione</label>
        <select id="s-tipo-internet">
          <option value="fibra">Fibra ottica (FTTH/FTTC)</option>
          <option value="adsl">ADSL / VDSL</option>
          <option value="mobile_4g">Mobile 4G/5G (SIM dati)</option>
          <option value="satellite">Satellitare (Starlink / HughesNet)</option>
          <option value="nessuna">Nessuna connessione</option>
        </select>
        <span class="form-hint">In blackout prolungato: fibra/ADSL cade entro 4–8h (UPS router). Mobile regge fino a esaurimento celle. Satellite è l'unica opzione resiliente.</span>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-broadcast"></i> Comunicazione di Emergenza</h3>
      <p class="text-secondary text-sm mb-16">Canali indipendenti dalla rete internet e dalla corrente elettrica.</p>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-has-radio">
          <span><i class="ph ph-radio"></i> Radio FM/AM a manovella</span></label>
        <label class="check-option"><input type="checkbox" id="s-has-walkie">
          <span><i class="ph ph-broadcast"></i> Walkie-talkie PMR446</span></label>
        <label class="check-option"><input type="checkbox" id="s-has-sat-phone">
          <span><i class="ph ph-phone"></i> Telefono satellitare (Iridium / Garmin)</span></label>
        <label class="check-option"><input type="checkbox" id="s-has-mesh">
          <span><i class="ph ph-graph"></i> Rete mesh locale (Meshtastic / LoRa)</span></label>
      </div>
      <div class="comm-channel-info mt-16">
        <div class="comm-row"><i class="ph ph-radio"></i><div><strong>Radio FM</strong> — ricezione notizie in emergenza (RAI Radio 1 e radio locali: annota le frequenze della tua zona). Solo ricezione, nessuna trasmissione.</div></div>
        <div class="comm-row"><i class="ph ph-broadcast"></i><div><strong>PMR446</strong> — comunicazione locale 0.5–3 km, canale e codice concordati in famiglia, batterie AA/AAA.</div></div>
        <div class="comm-row"><i class="ph ph-phone"></i><div><strong>Sat phone</strong> — funziona ovunque, indipendente da infrastrutture terrestri. Costo elevato.</div></div>
        <div class="comm-row"><i class="ph ph-graph"></i><div><strong>Mesh LoRa</strong> — rete peer-to-peer autonoma, range fino a 5–10 km in campo aperto, nessun abbonamento.</div></div>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-address-book"></i> Piano di Comunicazione</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-comm-contatti">
          <span><i class="ph ph-printer"></i> Contatti emergenza stampati (non solo digitali)</span></label>
      </div>
      <div class="alert-info-box mt-12">
        <i class="ph ph-lightbulb"></i>
        <div>
          <strong>Piano minimo:</strong> punto di ritrovo fisso + orari di check-in via walkie-talkie ogni 12h + lista contatti fuori zona (parente/amico in altra città reperibile telefonicamente).
        </div>
      </div>
    </div>
  `; }

  function _htmlMobilita() { return `
    <div class="card">
      <h3><i class="ph ph-gas-pump"></i> Carburante Disponibile</h3>
      <div class="big-input-group">
        <label>Carburante stoccato</label>
        <div class="big-input-wrap">
          <input type="number" id="s-carburante-litri" min="0" max="500" value="0" step="5">
          <span class="big-input-unit">litri</span>
        </div>
        <span class="form-hint">Serbatoio pieno + taniche approvate — aggiorna dopo ogni rifornimento</span>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-car"></i> Il Tuo Veicolo</h3>
      <div class="form-row">
        <div class="form-group">
          <label>Tipo carburante</label>
          <select id="s-ca-tipo">
            <option value="benzina">Benzina</option>
            <option value="diesel" selected>Diesel</option>
            <option value="gpl">GPL</option>
            <option value="elettrico">Elettrico (kWh)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Consumo (L/100km)</label>
          <input type="number" id="s-ca-consumo" min="2" max="25" step="0.5" value="7">
        </div>
        <div class="form-group">
          <label>Serbatoio (L)</label>
          <input type="number" id="s-ca-serbatoio" min="10" max="200" value="50">
        </div>
      </div>
      <div class="big-input-group mt-12">
        <label>Km percorsi a settimana (media)</label>
        <div class="big-input-wrap">
          <input type="number" id="s-km-settimana" min="0" max="2000" value="100" step="10">
          <span class="big-input-unit">km/sett</span>
        </div>
      </div>
      <button class="btn btn-outline btn-sm btn-full mt-12" onclick="navigateTo('carburante')">
        <i class="ph ph-calculator"></i> Calcolatore mobilità dettagliato →
      </button>
    </div>
  `; }

  function _htmlZaino() { return `
    <div class="card">
      <h3><i class="ph ph-backpack"></i> Zaino pronto</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-has-gobag">
          <span><i class="ph ph-backpack"></i> Zaino d'emergenza pronto (72 ore)<br><small>Documenti, contanti, cambio, farmaci, acqua, cibo</small></span></label>
      </div>
      <div class="form-hint mt-8">Kit medico e farmaci → sezione <strong>Salute</strong> · Radio e walkie → sezione <strong>Comunicazioni</strong></div>
    </div>
  `; }

  function _htmlMedico() { return `
    <div class="card">
      <h3><i class="ph ph-first-aid"></i> Kit e Scorte Mediche</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-has-kit-medico">
          <span><i class="ph ph-first-aid"></i> Kit medico completo<br><small>Garze, bende, disinfettante, cerotti, forbici, laccio, termometro</small></span></label>
        <label class="check-option"><input type="checkbox" id="s-has-farmaci-cronici">
          <span><i class="ph ph-pill"></i> Farmaci cronici disponibili<br><small>Per tutti i membri della famiglia che ne hanno bisogno</small></span></label>
        <label class="check-option"><input type="checkbox" id="s-has-manuale-ps">
          <span><i class="ph ph-book-open"></i> Manuale primo soccorso (cartaceo)<br><small>Usabile offline, senza dispositivi</small></span></label>
      </div>
      <div class="big-input-group mt-16">
        <label>Scorta farmaci cronici</label>
        <div class="big-input-wrap">
          <input type="number" id="s-farmaci-giorni" min="0" max="365" value="0" step="7">
          <span class="big-input-unit">giorni</span>
        </div>
        <span class="form-hint">0 = nessuna scorta — target minimo: 30 giorni</span>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-heartbeat"></i> Formazione</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-has-bls">
          <span><i class="ph ph-heartbeat"></i> Corso BLS / Primo Soccorso completato<br><small>Almeno 1 adulto in famiglia</small></span></label>
      </div>
      <div class="alert alert-info mt-12" style="font-size:0.82rem">
        <i class="ph ph-info"></i>
        <div>Croce Rossa Italiana offre corsi BLS-D a circa €50-80. Verifica <strong>cri.it</strong> per la sede più vicina.</div>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-pill"></i> Farmaci OTC da Scorta</h3>
      <div class="comm-channel-info">
        <div class="comm-row"><i class="ph ph-check"></i><div><strong>Paracetamolo / Ibuprofene</strong> — dolore e febbre</div></div>
        <div class="comm-row"><i class="ph ph-check"></i><div><strong>Antistaminico</strong> — reazioni allergiche</div></div>
        <div class="comm-row"><i class="ph ph-check"></i><div><strong>Loperamide</strong> — antidiarroico, previene disidratazione</div></div>
        <div class="comm-row"><i class="ph ph-check"></i><div><strong>Carbone vegetale</strong> — intossicazioni alimentari lievi</div></div>
        <div class="comm-row"><i class="ph ph-check"></i><div><strong>Sali ORS</strong> — reidratazione (o fai-da-te: 1L acqua + 6 cucch. zucchero + 1 cucch. sale)</div></div>
      </div>
    </div>
  `; }

  function _htmlSicurezza() { return `
    <div class="card">
      <h3><i class="ph ph-fire-extinguisher"></i> Sicurezza Domestica</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-has-estintore">
          <span><i class="ph ph-fire-extinguisher"></i> Estintore a polvere (min. 2kg)<br><small>Posizionato vicino a cucina e uscita</small></span></label>
        <label class="check-option"><input type="checkbox" id="s-has-rilevatore-co">
          <span><i class="ph ph-warning"></i> Rilevatore CO installato<br><small>Obbligatorio se usi combustibili al chiuso</small></span></label>
        <label class="check-option"><input type="checkbox" id="s-has-serrature">
          <span><i class="ph ph-lock"></i> Serrature rinforzate (porte principali)<br><small>Triplo punto o catenaccio di sicurezza</small></span></label>
        <label class="check-option"><input type="checkbox" id="s-has-luci-emergenza">
          <span><i class="ph ph-flashlight"></i> Luci di emergenza / torce disponibili<br><small>Una per stanza + prese di emergenza ricaricabili</small></span></label>
        <label class="check-option"><input type="checkbox" id="s-has-gen-sicuro">
          <span><i class="ph ph-engine"></i> Generatore posizionato correttamente<br><small>All'aperto, ad almeno 6 m da finestre, porte e garage</small></span></label>
      </div>
    </div>
    <div class="card">
      <h3><i class="ph ph-users-three"></i> Rete di Comunità</h3>
      <div class="checkbox-grid">
        <label class="check-option"><input type="checkbox" id="s-has-rete-vicinato">
          <span><i class="ph ph-users-three"></i> Rete di vicinato attiva<br><small>Hai identificato vicini fidati con competenze utili</small></span></label>
      </div>
      <div class="comm-channel-info mt-12">
        <div class="comm-row"><i class="ph ph-check-circle"></i><div>Identifica <strong>medici, meccanici, elettricisti, agricoltori</strong> nel raggio di 2km</div></div>
        <div class="comm-row"><i class="ph ph-check-circle"></i><div>Individua le <strong>persone fragili</strong> vicine (anziani soli, disabili) — controlla il loro stato in emergenza</div></div>
        <div class="comm-row"><i class="ph ph-check-circle"></i><div>Crea un <strong>gruppo Telegram / WhatsApp di quartiere</strong> ora, prima dell'emergenza</div></div>
        <div class="comm-row"><i class="ph ph-check-circle"></i><div>Definisci un <strong>punto di ritrovo fisico</strong> nel quartiere per scenari senza telefono</div></div>
      </div>
    </div>
    <div class="alert alert-warning mt-4" style="font-size:0.82rem">
      <i class="ph ph-warning-octagon"></i>
      <div><strong>CO — Monossido di Carbonio:</strong> incolore, inodore, letale. Non usare MAI barbecue, carbonella o generatori in spazi chiusi. Sintomi: mal di testa, nausea, confusione → esci subito.</div>
    </div>
  `; }

  /* ── POPULATE FROM STORAGE ── */
  function populateFromStorage() {
    const p = get();
    const sv = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    const sc = (id, v) => {
      const el = document.getElementById(id); if (!el) return;
      el.checked = !!v;
      const lbl = el.closest('.check-option');
      if (lbl) lbl.classList.toggle('checked', !!v);
    };

    // Profilo
    sv('s-adulti', p.adulti); sv('s-bambini', p.bambini); sv('s-anziani', p.anziani);
    sv('s-tipo', p.tipo_abitazione); sv('s-mq', p.mq); sv('s-isolamento', p.isolamento);
    sv('s-temp-now', p.temp_now ?? 18); sv('s-temp-min', p.temp_min); sv('s-temp-max', p.temp_max);
    sv('s-pioggia', p.pioggia_mm);
    _onTipoChange(p.tipo_abitazione);
    if (p.riparo_materiale) sv('s-riparo-materiale', p.riparo_materiale);
    if (p.riparo_mq)        sv('s-riparo-mq', p.riparo_mq);

    // Acqua
    sv('s-acqua-litri', p.acqua_scorte_litri || 0);
    sc('s-acqua-pozzo', p.ha_pozzo); sc('s-acqua-pioggia', p.ha_pioggia); sc('s-acqua-fiume', p.ha_fiume);
    sc('s-ha-filtro', p.ha_filtro);
    sv('s-tetto', p.tetto_mq || 60);
    if (p.ha_pioggia) { const tg = document.getElementById('s-tetto-group'); if (tg) tg.style.display = 'block'; }

    // Cibo
    sv('s-cibo-giorni', p.cibo_scorte_giorni || 0);
    sv('s-cibo-attivita', p.cibo_attivita || 'normale');

    // Energia
    sc('s-en-pannelli', p.en_pannelli); sc('s-en-batteria', p.en_batteria); sc('s-en-generatore', p.en_generatore);
    sv('s-pannelli-wp', p.pannelli_wp || 0); sv('s-batteria-kwh', p.batteria_kwh || 0); sv('s-gen-w', p.generatore_w || 0);
    sv('s-en-stagione', p.en_stagione || 'primavera');
    if (p.en_pannelli || p.en_batteria || p.en_generatore) {
      document.getElementById('s-energia-detail')?.classList.remove('hidden');
      if (p.en_pannelli)   document.getElementById('s-pannelli-group').style.display  = 'block';
      if (p.en_batteria)   document.getElementById('s-batteria-group').style.display  = 'block';
      if (p.en_generatore) document.getElementById('s-generatore-group').style.display = 'block';
    }

    // Calore
    sc('s-risc-legna', p.risc_legna); sc('s-risc-pellet', p.risc_pellet); sc('s-risc-gpl', p.risc_gpl);
    sv('s-ri-zona', p.ri_zona || 'd'); sv('s-combustibile-kg', p.combustibile_kg || 0);

    // Mobilità & Kit
    sv('s-carburante-litri', p.carburante_litri || 0); sv('s-km-settimana', p.km_settimana || 100);
    sv('s-ca-tipo', p.ca_tipo || 'diesel'); sv('s-ca-consumo', p.ca_consumo || 7); sv('s-ca-serbatoio', p.ca_serbatoio || 50);
    sc('s-has-kit-medico', p.has_kit_medico); sc('s-has-gobag', p.has_gobag);

    // Medico
    sc('s-has-farmaci-cronici', p.has_farmaci_cronici);
    sv('s-farmaci-giorni', p.farmaci_scorta_giorni || 0);
    sc('s-has-bls', p.has_bls_corso);
    sc('s-has-manuale-ps', p.has_manuale_ps);

    // Sicurezza
    sc('s-has-estintore',    p.has_estintore);
    sc('s-has-rilevatore-co', p.has_rilevatore_co);
    sc('s-has-serrature',    p.has_serrature_rinforzate);
    sc('s-has-luci-emergenza', p.has_luci_emergenza);
    sc('s-has-rete-vicinato', p.has_rete_vicinato);
    sc('s-has-gen-sicuro',   p.has_generatore_sicuro);

    // Comunicazioni
    sc('s-has-internet', p.has_internet ?? true);
    sv('s-tipo-internet', p.tipo_internet || 'fibra');
    sc('s-has-radio',    p.has_radio);
    sc('s-ha-neonato', p.ha_neonato); sc('s-mobilita-ridotta', p.mobilita_ridotta); sc('s-ha-animali', p.ha_animali);
    sc('s-has-walkie',   p.has_walkie);
    sc('s-has-sat-phone', p.has_sat_phone);
    sc('s-has-mesh',     p.has_mesh);
    sc('s-comm-contatti', p.comm_contatti_stampati);
  }

  /* ── BIND EVENTS ── */
  function bindEvents() {
    // All inputs/selects → auto-save
    document.querySelectorAll('#settings-root input, #settings-root select, #kit-root input[id^="s-"], #kit-root select[id^="s-"]').forEach(el => {
      el.addEventListener('input',  _autoSave);
      el.addEventListener('change', _autoSave);
    });

    // Checkbox visual class
    document.querySelectorAll('.check-option input[type="checkbox"]').forEach(input => {
      const lbl = input.closest('.check-option');
      if (input.checked) lbl.classList.add('checked');
      input.addEventListener('change', () => lbl.classList.toggle('checked', input.checked));
    });

    // Tipo abitazione → panel toggle
    document.getElementById('s-tipo').addEventListener('change', function() { _onTipoChange(this.value); });

    // Temperatura → climate vis
    ['s-temp-now','s-temp-min','s-temp-max'].forEach(id =>
      document.getElementById(id)?.addEventListener('input', renderClimateVis));

    // Acqua pioggia → tetto field
    document.getElementById('s-acqua-pioggia')?.addEventListener('change', function() {
      document.getElementById('s-tetto-group').style.display = this.checked ? 'block' : 'none';
    });

    // Energia checkboxes → detail fields
    ['s-en-pannelli','s-en-batteria','s-en-generatore'].forEach(id =>
      document.getElementById(id)?.addEventListener('change', _toggleEnDetail));
  }

  /* ── MAP: profilo key → element ID in DOM ── */
  const FIELD_DOM = {
    ha_filtro:              's-ha-filtro',
    ha_pioggia:             's-acqua-pioggia',
    ha_pozzo:               's-acqua-pozzo',
    ha_fiume:               's-acqua-fiume',
    en_pannelli:            's-en-pannelli',
    en_batteria:            's-en-batteria',
    en_generatore:          's-en-generatore',
    risc_legna:             's-risc-legna',
    risc_pellet:            's-risc-pellet',
    risc_gpl:               's-risc-gpl',
    has_radio:              's-has-radio',
    ha_animali:             's-ha-animali',
    mobilita_ridotta:       's-mobilita-ridotta',
    ha_neonato:             's-ha-neonato',
    has_walkie:             's-has-walkie',
    has_sat_phone:          's-has-sat-phone',
    has_mesh:               's-has-mesh',
    comm_contatti_stampati: 's-comm-contatti',
    has_internet:           's-has-internet',
    has_gobag:              's-has-gobag',
    has_kit_medico:         's-has-kit-medico',
    has_farmaci_cronici:    's-has-farmaci-cronici',
    has_bls_corso:          's-has-bls',
    has_manuale_ps:         's-has-manuale-ps',
    has_estintore:          's-has-estintore',
    has_rilevatore_co:      's-has-rilevatore-co',
    has_serrature_rinforzate: 's-has-serrature',
    has_luci_emergenza:     's-has-luci-emergenza',
    has_rete_vicinato:      's-has-rete-vicinato',
    has_generatore_sicuro:  's-has-gen-sicuro',
  };

  /* Aggiorna un campo nel profilo e sincronizza il DOM delle Dimensioni */
  function setField(key, value) {
    const p = get();
    p[key] = value;
    Storage.set('profilo', p);

    // Aggiorna il checkbox nel DOM delle Dimensioni (se visibile)
    const elId = FIELD_DOM[key];
    if (elId) {
      const el = document.getElementById(elId);
      if (el) {
        el.checked = !!value;
        const lbl = el.closest('.check-option');
        if (lbl) lbl.classList.toggle('checked', !!value);
      }
    }

    _updateTabResults(p);
    if (typeof DashboardModule !== 'undefined') DashboardModule.render();
  }

  /* ── RESET ── */
  function reset() {
    if (!confirm('Azzerare tutte le dimensioni e i task manuali? I dati salvati verranno eliminati.')) return;
    Storage.set('profilo', {});
    Storage.set('task-checks', {});
    Storage.remove('onboarded');
    init();
    if (typeof DashboardModule !== 'undefined') DashboardModule.render();
  }

  /* ── EXPORT ── */
  // Scarica un backup JSON di TUTTI i dati salvati (profilo, checklist kit,
  // task dashboard, checklist scenari, risultati calcolatori, ecc.) con un
  // numero di versione dello schema per eventuali migrazioni future.
  function exportData() {
    const data = Storage.exportAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `rebel-survival-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── IMPORT ── */
  function importData() {
    const input = document.createElement('input');
    input.type  = 'file';
    input.accept = '.json,application/json';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        try {
          const payload = JSON.parse(ev.target.result);
          const dateLabel = (payload.exportedAt || '').slice(0, 10) || 'selezionato';
          if (!confirm(`Importare il backup del ${dateLabel}? I dati attuali verranno sovrascritti.`)) return;
          Storage.importAll(payload);
          init();
          if (typeof DashboardModule !== 'undefined') DashboardModule.render();
          alert('Backup importato correttamente.');
        } catch {
          alert('Errore: file non valido o corrotto.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  /* ── SAVE (button / external call) ── */
  function save() {
    const p = _collect();
    Storage.set('profilo', p);
    _updateTabResults(p);
    if (typeof DashboardModule !== 'undefined') DashboardModule.render();
    const msg = document.getElementById('s-save-msg');
    if (msg) { msg.classList.remove('hidden'); setTimeout(() => msg.classList.add('hidden'), 2500); }
  }

  /* ── INIT ── */
  function init() {
    const root = document.getElementById('settings-root');
    if (!root) return;

    // Scorte: disegnate qui insieme al Profilo, così ogni campo esiste una volta sola
    // e il salvataggio automatico trova sempre tutti i valori
    const stock = document.getElementById('kit-root');
    if (stock) stock.innerHTML = (typeof KitModule !== 'undefined' ? KitModule.headHtml() : '') +
      _sectionsHtml(STOCK_GROUPS) + (typeof KitModule !== 'undefined' ? KitModule.footHtml() : '');

    root.innerHTML = `
      ${_sectionsHtml(['about'])}
      <div class="pf-group">
        <h2 class="pf-group-title">I tuoi dati</h2>
        <p class="pf-note"><i class="ph ph-lock-simple"></i> Restano solo su questo dispositivo.</p>
        <div class="pf-actions">
          <button class="pf-action" onclick="SettingsModule.exportData()"><i class="ph ph-download-simple"></i> Salva un backup</button>
          <button class="pf-action" onclick="SettingsModule.importData()"><i class="ph ph-upload-simple"></i> Ripristina un backup</button>
          <button class="pf-action" onclick="CondividiModule.open()"><i class="ph ph-qr-code"></i> Condividi con un familiare</button>
          <button class="pf-action" onclick="OnboardingModule.open()"><i class="ph ph-play"></i> Rifai le domande iniziali</button>
          <button class="pf-action pf-action-danger" onclick="SettingsModule.reset()"><i class="ph ph-arrow-counter-clockwise"></i> Cancella tutti i dati</button>
        </div>
      </div>
      <div class="pf-group">
        <h2 class="pf-group-title">App</h2>
        <p class="pf-note" onclick="AppUpdate.tapVersion()"><i class="ph ph-info"></i> Versione <span id="app-ver">—</span></p>
        <div class="pf-actions">
          <button class="pf-action" onclick="AppUpdate.check()"><i class="ph ph-arrows-clockwise"></i> Cerca aggiornamenti</button>
        </div>
        <p id="app-upd-msg" class="pf-note" aria-live="polite"></p>
        <div class="pf-actions">
          <button class="pf-action" onclick="CopiaOffline.share()"><i class="ph ph-bluetooth"></i> Passa l'app a un altro telefono</button>
        </div>
        <p class="pf-note"><i class="ph ph-wifi-slash"></i> Funziona anche senza internet: crea un file da inviare con Bluetooth o Quick Share. Chi lo riceve lo apre con il browser. Non contiene guide PDF, mappa e AI, e non contiene i tuoi dati.</p>
        <p id="app-share-msg" class="pf-note" aria-live="polite"></p>
        <div id="app-apk-box" class="pf-actions hidden">
          <a class="pf-action" href="/download/RebelSurvival.apk" download><i class="ph ph-android-logo"></i> Scarica l'app Android</a>
        </div>
        <p id="app-apk-note" class="pf-note hidden"><i class="ph ph-info"></i> App completa con tutto dentro: funziona senza internet e si passa ad altri telefoni via Bluetooth. Il telefono chiederà di consentire l'installazione da questa fonte.</p>
        <label class="pf-lab-row"><input type="checkbox" id="app-hide-caution" ${Storage.get('hide_caution', false) === true ? 'checked' : ''} onchange="SettingsModule.setHideCaution(this.checked)">
          <span><i class="ph ph-warning"></i> Nascondi le guide da usare con cautela</span></label>
        <p class="pf-note">Le guide con fonti non ufficiali o non ancora verificate non compariranno in Guide e in «Chiedi».</p>
        <div id="app-lab-box" class="pf-lab hidden">
          <label class="pf-lab-row"><input type="checkbox" id="app-lab" onchange="AppUpdate.setLab(this.checked)">
            <span><i class="ph ph-flask"></i> Funzioni sperimentali (AI nella sezione «Chiedi»)</span></label>
          <p class="pf-note">Solo per prove: possono essere lente o sbagliare.</p>
        </div>
      </div>
      <p id="s-save-msg" class="text-center text-secondary text-sm mt-12 hidden">
        <i class="ph ph-check-circle"></i> Profilo aggiornato — Home aggiornata
      </p>
      <div class="legal-footer">
        <button class="legal-link" onclick="showDisclaimer()">
          <i class="ph ph-shield-warning"></i> Avviso importante
        </button>
        <a class="legal-link" href="/legal/privacy.html">Privacy</a>
        <a class="legal-link" href="/legal/condizioni.html">Condizioni d'uso</a>
      </div>
    `;

    populateFromStorage();
    bindEvents();
    renderClimateVis();
    _updateTabResults();
    refreshCounts();
    _renderScenarioTab();
    if (typeof AppUpdate !== 'undefined') AppUpdate.render();
  }

  function setHideCaution(on) {
    Storage.set('hide_caution', !!on);
    if (typeof GuideModule !== 'undefined' && GuideModule.reset) GuideModule.reset();
    if (typeof AssistenteModule !== 'undefined' && AssistenteModule.reindex) AssistenteModule.reindex();
  }

  return { refreshCounts, setHideCaution, init, save, reset, exportData, importData, setField, get, getTotalPeople, _onTipoChange, _onTempChange, _autoSave, _tab, selectScenario, _toggleScCheck, _resetScCheck, toggleCustomThreat };
})();
