/* ============================================================
   Dashboard Module — Situazione → Minacce Auto → Task → Score
   ============================================================ */
const DashboardModule = (() => {

  /* ── ASSI ── */
  const AXES = [
    { id: 'acqua',    label: 'ACQUA',    icon: 'ph-drop'       },
    { id: 'cibo',     label: 'CIBO',     icon: 'ph-fork-knife' },
    { id: 'energia',  label: 'ENERGIA',  icon: 'ph-lightning'  },
    { id: 'calore',   label: 'CALORE',   icon: 'ph-flame'      },
    { id: 'comm',     label: 'COMM.',    icon: 'ph-radio'      },
    { id: 'mobilita', label: 'MOBILITÀ', icon: 'ph-car'        },
  ];

  /* ── MINACCE con regole di auto-rilevamento ── */
  const THREATS = [
    {
      id: 'blackout', label: 'Blackout', icon: 'ph-lightning-slash',
      check: p => !p.en_pannelli && !p.en_batteria && !p.en_generatore,
      reason: p => 'Nessuna fonte energia alternativa dichiarata',
      required: { acqua:55, cibo:60, energia:85, calore:60, comm:70, mobilita:40 },
    },
    {
      id: 'acqua', label: 'Acqua', icon: 'ph-drop-slash',
      check: p => !p.ha_pozzo && !p.ha_pioggia && !p.ha_fiume && (p.acqua_scorte_litri || 0) < 30,
      reason: p => `Scorte acqua insufficienti (${p.acqua_scorte_litri||0}L), nessuna fonte alternativa`,
      required: { acqua:90, cibo:55, energia:45, calore:35, comm:40, mobilita:30 },
    },
    {
      id: 'gas', label: 'Gas off', icon: 'ph-flame',
      check: p => !p.risc_legna && !p.risc_pellet && !p.risc_gpl && (p.temp_min || 0) < 8,
      reason: p => `Nessun riscaldamento alternativo, minima invernale ${p.temp_min}°C`,
      required: { acqua:40, cibo:60, energia:55, calore:90, comm:40, mobilita:35 },
    },
    {
      id: 'cibo', label: 'Cibo scarso', icon: 'ph-fork-knife',
      check: p => (p.cibo_scorte_giorni || 0) < 14,
      reason: p => `Scorte alimentari: ${p.cibo_scorte_giorni||0} giorni (target: 30+)`,
      required: { acqua:60, cibo:90, energia:45, calore:45, comm:40, mobilita:45 },
    },
    {
      id: 'carburante', label: 'Carburante', icon: 'ph-gas-pump',
      check: p => (p.carburante_litri || 0) < 20 && (p.km_settimana || 0) > 20,
      reason: p => `${p.carburante_litri||0}L stoccati vs ${p.km_settimana||0}km/settimana`,
      required: { acqua:45, cibo:65, energia:65, calore:50, comm:50, mobilita:20 },
    },
    {
      id: 'freddo', label: 'Freddo', icon: 'ph-snowflake',
      check: p => (p.temp_now <= 5) || (p.temp_min <= -3) || ['tenda','rifugio','nessun_riparo'].includes(p.tipo_abitazione),
      reason: p => {
        if (['tenda','rifugio','nessun_riparo'].includes(p.tipo_abitazione)) return `Riparo esterno (${p.tipo_abitazione}) — isolamento minimo`;
        if (p.temp_now <= 5) return `Temperatura attuale ${p.temp_now}°C`;
        return `Minima invernale ${p.temp_min}°C`;
      },
      required: { acqua:50, cibo:70, energia:65, calore:90, comm:55, mobilita:35 },
    },
    {
      id: 'comm', label: 'No internet', icon: 'ph-wifi-slash',
      check: p => !p.has_radio && !p.has_walkie && !p.has_sat_phone && !p.has_mesh,
      reason: p => 'Nessun canale di comunicazione di emergenza (radio/walkie/satellite)',
      required: { acqua:35, cibo:40, energia:50, calore:35, comm:90, mobilita:30 },
    },
    {
      id: 'medico', label: 'Medico limitato', icon: 'ph-first-aid',
      check: p => (p.anziani > 0 || p.bambini > 0) && !p.has_kit_medico,
      reason: p => `${p.anziani||0} anziani + ${p.bambini||0} bambini in famiglia, kit medico non completo`,
      required: { acqua:55, cibo:55, energia:50, calore:50, comm:70, mobilita:50 },
    },
  ];

  /* ── SCENARIO → THREATS MAPPING ── */
  // Derivato dinamicamente da window.SCENARI_LIST (definito in scenari.js, caricato prima)
  // Niente duplicazione manuale: aggiungere uno scenario in scenari.js è sufficiente.
  const SCENARIO_THREATS = Object.fromEntries(
    (window.SCENARI_LIST || []).map(s => [s.id, s.threats || []])
  );

  /* ── TASK LIBRARY ── */
  // resolve: funzione(profilo) → true se la dimensione soddisfa la soglia (auto-complete)
  // resolve: null → task manuale (checkbox utente)
  // Scenario → tasks mapping gestito in scenari.js tramite scenario.taskMap
  const ALL_TASKS = [
    // ACQUA
    { id:'ac01', axis:'acqua',    scoreBonus:20, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-stoccaggio',            resolve: p=>(p.acqua_scorte_litri||0)>=_persone(p)*Utils.WATER_L_PPD*30,                        text:'Accumula acqua: 3 L/persona/giorno × 30 giorni in taniche' },
    { id:'ac02', axis:'acqua',    scoreBonus:15, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-purificazione',         resolve: p=>!!p.ha_filtro,   field:'ha_filtro',                text:'Acquista filtro portatile (Sawyer / LifeStraw)' },
    { id:'ac03', axis:'acqua',    scoreBonus:10, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-raccolta-pioggia',      resolve: p=>!!p.ha_pioggia,  field:'ha_pioggia',               text:'Imposta sistema raccolta acqua piovana' },
    { id:'ac04', axis:'acqua',    scoreBonus: 6, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-purificazione',         resolve: null,                                                    text:'Scorta candeggina non profumata per purificazione (4 gocce/L)' },
    // CIBO
    { id:'ci01', axis:'cibo',     scoreBonus:25, nav:'settings', tab:'cibo',     threats:['cibo'],                guide:'cibo-scorte-piano',           resolve: p=>(p.cibo_scorte_giorni||0)>=30,                        text:'Scorte alimentari 30+ giorni' },
    { id:'ci02', axis:'cibo',     scoreBonus:10, nav:'settings', tab:'cibo',     threats:['cibo'],                guide:'cibo-cottura-campo',          resolve: null,                                                    text:'Fornello da campo + cartucce gas (min 3 per 30gg)' },
    { id:'ci03', axis:'cibo',     scoreBonus: 8, nav:'guide',    tab:null,       threats:['cibo'],                guide:'orto-emergenza',              resolve: null,                                                    text:'Avvia orto emergenza (ravanelli 25gg, lattuga 45gg)' },
    { id:'ci04', axis:'cibo',     scoreBonus: 5, nav:'settings', tab:'cibo',     threats:['cibo'],                guide:'cibo-conservazione',          resolve: null,                                                    text:'Apriscatole manuale + set utensili da campo' },
    // ENERGIA
    { id:'en01', axis:'energia',  scoreBonus:25, nav:'settings', tab:'energia',  threats:['blackout'],            guide:'energia-generatore',          resolve: p=>!!(p.en_pannelli||p.en_batteria||p.en_generatore),    text:'Installa/verifica fonte energia alternativa' },
    { id:'en02', axis:'energia',  scoreBonus:12, nav:'settings', tab:'energia',  threats:['blackout'],            guide:'energia-blackout-protocollo', resolve: null,                                                    text:'Power bank 20.000mAh per ogni adulto' },
    { id:'en03', axis:'energia',  scoreBonus:10, nav:'settings', tab:'energia',  threats:['blackout'],            guide:'energia-generatore',          resolve: p=>!!p.en_pannelli,         field:'en_pannelli',          text:'Pannello solare portatile 100W+ con uscita USB-C' },
    { id:'en04', axis:'energia',  scoreBonus: 8, nav:'settings', tab:'sicurezza',threats:['blackout'],            guide:'sicurezza-casa',              resolve: p=>!!p.has_rilevatore_co,   field:'has_rilevatore_co',    text:'Rilevatori CO installati se usi combustibili al chiuso' },
    { id:'en05', axis:'energia',  scoreBonus: 6, nav:'guide',    tab:null,       threats:['blackout'],            guide:'energia-blackout-protocollo', resolve: null,                                                    text:'Definisci protocollo blackout: priorità consumi, lista azioni' },
    // CALORE
    { id:'ca01', axis:'calore',   scoreBonus:30, nav:'settings', tab:'calore',   threats:['gas','freddo'],        guide:'riscaldamento-alternativo',   resolve: p=>!!(p.risc_legna||p.risc_pellet||p.risc_gpl),          text:'Attiva riscaldamento alternativo (pellet/legna/GPL)' },
    { id:'ca02', axis:'calore',   scoreBonus:15, nav:'settings', tab:'calore',   threats:['gas','freddo'],        guide:'riscaldamento-alternativo',   resolve: p=>(p.combustibile_kg||0)>=10,                           text:'Stocca combustibile alternativo 30+ giorni' },
    { id:'ca03', axis:'calore',   scoreBonus:10, nav:'settings', tab:'calore',   threats:['freddo'],              guide:'ipotermia-prevenzione',       resolve: null,                                                    text:'Coperte termiche di emergenza (min 2 per persona)' },
    { id:'ca04', axis:'calore',   scoreBonus: 8, nav:'guide',    tab:null,       threats:['freddo'],              guide:'isolamento-stanza',           resolve: null,                                                    text:'Isola una stanza principale (tende termiche, nastro)' },
    // COMM
    { id:'co01', axis:'comm',     scoreBonus:30, nav:'settings', tab:'comm',     threats:['comm'],                guide:'comm-radio-canali',           resolve: p=>!!p.has_radio,           field:'has_radio',            text:'Radio FM/AM portatile a manovella' },
    { id:'co02', axis:'comm',     scoreBonus:20, nav:'settings', tab:'comm',     threats:['comm'],                guide:'comm-pmr446',                 resolve: p=>!!p.has_walkie,          field:'has_walkie',           text:'Coppia walkie-talkie PMR446 (canale 8 emergenza)' },
    { id:'co03', axis:'comm',     scoreBonus:12, nav:'settings', tab:'comm',     threats:['comm','medico'],       guide:'comm-piano-famiglia',         resolve: p=>!!p.comm_contatti_stampati, field:'comm_contatti_stampati', text:'Lista contatti emergenza stampata + piano ritrovo fisso' },
    { id:'co04', axis:'comm',     scoreBonus: 8, nav:'settings', tab:'comm',     threats:['comm'],                guide:'energia-blackout-protocollo', resolve: null,                                                    text:'Tutti i power bank caricati e mantenuti > 80%' },
    // MOBILITÀ
    { id:'mo01', axis:'mobilita', scoreBonus:20, nav:'settings', tab:'mobilita', threats:['carburante'],          guide:'evacuazione-piano',           resolve: p=>(p.carburante_litri||0)>=20,                          text:'Fai il pieno + tanica 10-20L approvata' },
    { id:'mo02', axis:'mobilita', scoreBonus:15, nav:'settings', tab:'mobilita', threats:['carburante','medico'], guide:'gobag-checklist',             resolve: p=>!!p.has_gobag,           field:'has_gobag',            text:'Go-bag pronto: documenti, contanti, farmaci, cambio' },
    { id:'mo03', axis:'mobilita', scoreBonus:10, nav:'guide',    tab:null,       threats:['carburante'],          guide:'mappe-offline',               resolve: null,                                                    text:'Mappe offline scaricate (Maps.me o Organic Maps)' },
    { id:'mo04', axis:'mobilita', scoreBonus: 8, nav:'settings', tab:'mobilita', threats:['carburante'],          guide:'evacuazione-piano',           resolve: null,                                                    text:'Percorsi alternativi e punti rifornimento identificati' },
    { id:'mo05', axis:'mobilita', scoreBonus: 6, nav:'guide',    tab:null,       threats:['carburante','freddo'], guide:'evacuazione-piano',           resolve: null,                                                    text:'Piano evacuazione: route, punto ritrovo fuori comune, zaino pronto' },
    // MEDICO
    { id:'me01', axis:'mobilita', scoreBonus:20, nav:'settings', tab:'medico',   threats:['medico'],              guide:'kit-medico',                  resolve: p=>!!p.has_kit_medico,      field:'has_kit_medico',       text:'Kit medico completo: antipiretici, disinfettante, bende, farmaci cronici' },
    { id:'me02', axis:'mobilita', scoreBonus:12, nav:'settings', tab:'medico',   threats:['medico'],              guide:'farmaci-scorta',              resolve: p=>!!(p.has_farmaci_cronici&&(p.farmaci_scorta_giorni||0)>=14), text:'Scorta farmaci cronici per 30+ giorni' },
    { id:'me03', axis:'mobilita', scoreBonus: 8, nav:'settings', tab:'medico',   threats:['medico'],              guide:'primo-soccorso',              resolve: p=>!!p.has_bls_corso,       field:'has_bls_corso',        text:'Corso primo soccorso base (BLS/BLSD)' },
    // SICUREZZA
    { id:'si01', axis:'energia',  scoreBonus:10, nav:'settings', tab:'sicurezza',threats:['blackout','freddo'],   guide:'sicurezza-casa',              resolve: p=>!!(p.has_estintore&&p.has_rilevatore_co),             text:'Sicurezza casa: estintore, rilevatore CO, rinforzo serrature' },
    { id:'si02', axis:'comm',     scoreBonus: 8, nav:'settings', tab:'sicurezza',threats:['comm','cibo'],         guide:'community-resilienza',        resolve: p=>!!p.has_rete_vicinato,   field:'has_rete_vicinato',    text:'Rete di vicinato: identifica vicini, competenze, persone fragili' },

    // ── TERREMOTO ─────────────────────────────────────────────────────────────
    { id:'ter01', axis:'mobilita', scoreBonus:12, nav:'guide', tab:null, threats:['acqua','cibo'],         guide:'gobag-checklist',           resolve: null, text:'Fissa mobili pesanti alle pareti (librerie, armadi) — prevenzione crollo' },
    { id:'ter02', axis:'mobilita', scoreBonus:15, nav:'guide', tab:null, threats:['blackout','acqua'],     guide:'acqua-stoccaggio',          resolve: null, text:'Kit 72h sotto il letto: acqua, torcia, radio, farmaci, copia documenti' },
    { id:'ter03', axis:'mobilita', scoreBonus:15, nav:'guide', tab:null, threats:['blackout','acqua'],     guide:'gobag-checklist',           resolve: null, text:'Dopo la scossa: stai fuori — rientra SOLO dopo verifica strutturale delle autorità competenti' },
    { id:'ter04', axis:'acqua',   scoreBonus:12, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-purificazione',       resolve: null, text:'Acqua post-sisma non garantita: usa solo scorte o acqua purificata (bollitura 1 min)' },
    // ── ALLUVIONE ─────────────────────────────────────────────────────────────
    { id:'all01', axis:'acqua',    scoreBonus:15, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-stoccaggio',          resolve: null, text:'Soglie anti-allagamento + sacchi di sabbia per porte e finestre basse' },
    { id:'all02', axis:'cibo',     scoreBonus:10, nav:'guide', tab:null, threats:['acqua','cibo'],         guide:'cibo-scorte-piano',         resolve: null, text:'Sposta farmaci, documenti e beni vitali al piano superiore' },
    { id:'all03', axis:'energia',  scoreBonus:15, nav:'guide', tab:null, threats:['acqua','blackout'],     guide:'sicurezza-casa',            resolve: null, text:'Stacca corrente dal quadro elettrico se l\'acqua sale entro 30cm dalle prese' },
    { id:'all04', axis:'mobilita', scoreBonus:10, nav:'guide', tab:null, threats:['acqua','cibo'],         guide:'kit-medico',                resolve: null, text:'Dopo alluvione: guanti e stivali per il fango (leptospirosi) — non toccare acqua a mani nude' },
    // ── PANDEMIA ──────────────────────────────────────────────────────────────
    { id:'pan01', axis:'mobilita', scoreBonus:18, nav:'guide', tab:null, threats:['medico'],               guide:'kit-medico',                resolve: null, text:'Scorta DPI: maschere FFP2, guanti nitrile, disinfettante mani (1+ mese)' },
    { id:'pan02', axis:'comm',     scoreBonus:12, nav:'guide', tab:null, threats:['medico','comm'],        guide:'comm-piano-famiglia',       resolve: null, text:'Protocollo isolamento: stanza dedicata, bagno separato, turni cucina' },
    { id:'pan03', axis:'mobilita', scoreBonus:15, nav:'guide', tab:null, threats:['medico','cibo'],        guide:'farmaci-scorta',            resolve: null, text:'Farmaci OTC 30+ giorni: paracetamolo, ibuprofene, antidiarroico (loperamide), sali ORS' },
    { id:'pan04', axis:'mobilita', scoreBonus:10, nav:'guide', tab:null, threats:['medico','comm'],        guide:'kit-medico',                resolve: null, text:'Zona pulita/sporca per ingressi: cambio vestiti all\'entrata, borsa spesa isolata fuori' },
    // ── CRISI ECONOMICA ───────────────────────────────────────────────────────
    { id:'eco01', axis:'mobilita', scoreBonus:20, nav:'guide', tab:null, threats:['cibo','carburante'],    guide:'evacuazione-piano',         resolve: null, text:'Riserva contanti fuori banca: 1-3 mesi di spese essenziali in casa' },
    { id:'eco02', axis:'cibo',     scoreBonus:12, nav:'guide', tab:null, threats:['cibo'],                 guide:'cibo-scorte-piano',         resolve: null, text:'Filiera corta: mercati locali, baratto, orti condivisi, gruppi acquisto' },
    { id:'eco03', axis:'cibo',     scoreBonus:12, nav:'guide', tab:null, threats:['cibo'],                 guide:'cibo-conservazione',        resolve: null, text:'Cucina di sussistenza: zuppe di legumi, pane fatto in casa, conserve e fermentati fai-da-te' },
    { id:'eco04', axis:'mobilita', scoreBonus: 8, nav:'guide', tab:null, threats:['cibo','carburante'],    guide:'evacuazione-piano',         resolve: null, text:'Consolida spostamenti: più commissioni in una sola uscita — valuta bici per tratte brevi' },
    // ── INCENDIO ZONA ─────────────────────────────────────────────────────────
    { id:'inc01', axis:'mobilita', scoreBonus:20, nav:'guide', tab:null, threats:['carburante','comm'],    guide:'evacuazione-piano',         resolve: null, text:'Piano fuga: percorsi lontani da boschi, punto ritrovo prestabilito' },
    { id:'inc02', axis:'acqua',    scoreBonus:12, nav:'guide', tab:null, threats:['acqua','comm'],         guide:'sicurezza-casa',            resolve: null, text:'Rimuovi materiale infiammabile entro 10m dalla casa; tieni prato irrigato' },
    { id:'inc03', axis:'mobilita', scoreBonus:12, nav:'guide', tab:null, threats:['acqua','comm'],         guide:'kit-medico',                resolve: null, text:'Qualità aria: finestre chiuse, mascherina FFP2 se esci — evita attività fisica all\'aperto' },
    { id:'inc04', axis:'mobilita', scoreBonus:10, nav:'guide', tab:null, threats:['carburante','comm'],    guide:'evacuazione-piano',         resolve: null, text:'Tieni l\'auto parcheggiata in uscita e carica — ordine di evacuazione può arrivare in 30 min' },
    // ── EVACUAZIONE ───────────────────────────────────────────────────────────
    { id:'eva01', axis:'mobilita', scoreBonus:18, nav:'guide', tab:null, threats:['carburante','acqua'],   guide:'gobag-checklist',           resolve: null, text:'Documenti in busta impermeabile nella go-bag (CI, passaporto, polizze)' },
    { id:'eva02', axis:'mobilita', scoreBonus:12, nav:'guide', tab:null, threats:['carburante','cibo'],    guide:'gobag-checklist',           resolve: null, text:'Contanti + carta carburante prepagata in go-bag (ATM potrebbero non funzionare)' },
    { id:'eva03', axis:'mobilita', scoreBonus:15, nav:'guide', tab:null, threats:['carburante','medico'],  guide:'kit-medico',                resolve: null, text:'Farmaci salvavita in go-bag + foglio scritto con allergie, condizioni mediche, terapie' },
    { id:'eva04', axis:'mobilita', scoreBonus: 8, nav:'guide', tab:null, threats:['carburante','acqua'],   guide:'gobag-checklist',           resolve: null, text:'Animali domestici: trasportino/guinzaglio pronti — i rifugi di emergenza possono non accettarli' },
    // ── BLACKOUT LUNGO ────────────────────────────────────────────────────────
    { id:'blt01', axis:'cibo',     scoreBonus:15, nav:'guide', tab:null, threats:['cibo','blackout'],      guide:'cibo-scorte-piano',         resolve: null, text:'Frigorifero: consuma o sposta i perishables entro le prime 4h dal blackout' },
    { id:'blt02', axis:'mobilita', scoreBonus:12, nav:'guide', tab:null, threats:['blackout','medico'],    guide:'kit-medico',                resolve: null, text:'Priorità carica: dispositivi medici (insulina frigo, CPAP, concentratore O2)' },
    { id:'blt03', axis:'energia',  scoreBonus:12, nav:'guide', tab:null, threats:['blackout'],             guide:'energia-generatore',        resolve: null, text:'Raziona carburante generatore: usa solo nelle fasce critiche (cottura, ricarica, pompa acqua)' },
    { id:'blt04', axis:'comm',     scoreBonus: 8, nav:'guide', tab:null, threats:['blackout','comm'],      guide:'community-resilienza',      resolve: null, text:'Organizza turni con vicini per accesso al generatore — divide il consumo e il carico termico' },
    // ── TEMPESTA INVERNALE ────────────────────────────────────────────────────
    { id:'tem01', axis:'calore',   scoreBonus:18, nav:'guide', tab:null, threats:['freddo','blackout'],    guide:'riscaldamento-alternativo', resolve: null, text:'Scorta legna/pellet al coperto + kit sbloccaggio auto (catene, pala, sale)' },
    { id:'tem02', axis:'comm',     scoreBonus:10, nav:'guide', tab:null, threats:['freddo','blackout'],    guide:'comm-piano-famiglia',       resolve: null, text:'Non uscire durante la tempesta: radio per aggiornamenti, check famiglia ogni 2h' },
    { id:'tem03', axis:'acqua',    scoreBonus:10, nav:'guide', tab:null, threats:['acqua','freddo'],       guide:'acqua-stoccaggio',          resolve: null, text:'Tubature esposte: lascia scorrere acqua a filo nelle ore di gelo — previene rotture e allagamenti' },
    // ── CALDO ESTREMO ─────────────────────────────────────────────────────────
    { id:'cal01', axis:'mobilita', scoreBonus:12, nav:'guide', tab:null, threats:['acqua','medico'],       guide:'kit-medico',                resolve: null, text:'Identifica luoghi freschi vicini: centri diurni comunali, biblioteche, amici' },
    { id:'cal02', axis:'mobilita', scoreBonus:15, nav:'guide', tab:null, threats:['medico','acqua'],       guide:'kit-medico',                resolve: null, text:'Check giornaliero anziani e bambini: sintomi colpo di calore, 2L acqua/giorno' },
    { id:'cal03', axis:'acqua',    scoreBonus:10, nav:'guide', tab:null, threats:['acqua','medico'],       guide:'acqua-purificazione',       resolve: null, text:'Ore 11–17 al chiuso: tapparelle abbassate sul lato soleggiato — apri tutte le finestre di notte' },
    // ── GAS ───────────────────────────────────────────────────────────────────
    { id:'gas01', axis:'calore',   scoreBonus:20, nav:'guide', tab:null, threats:['gas'],                  guide:'riscaldamento-alternativo', resolve: null, text:'Chiudi rubinetto gas principale + ventila subito + non usare interruttori elettrici' },
    { id:'gas02', axis:'cibo',     scoreBonus:15, nav:'guide', tab:null, threats:['gas'],                  guide:'cibo-cottura-campo',        resolve: null, text:'Cucinare senza metano: fornello GPL da campeggio — 1 cartuccia 227g = ~2h cottura' },
    { id:'gas03', axis:'calore',   scoreBonus:12, nav:'guide', tab:null, threats:['gas'],                  guide:'riscaldamento-alternativo', resolve: null, text:'Acqua calda: pentola su fonte alternativa · riduci docce a 1/giorno con acqua tiepida' },
    // ── ACQUA CONTAMINATA ─────────────────────────────────────────────────────
    { id:'acq01', axis:'acqua',    scoreBonus:18, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-purificazione',       resolve: null, text:'Non usare acqua corrente: solo imbottigliata o filtrata fino a deroga revocata' },
    { id:'acq02', axis:'acqua',    scoreBonus:20, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-stoccaggio',          resolve: null, text:'Riempi SUBITO vasche, secchi e ogni contenitore disponibile — l\'acquedotto può cedere ulteriormente' },
    { id:'acq03', axis:'acqua',    scoreBonus:15, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-purificazione',       resolve: null, text:'Protocollo purificazione attivo: 1 min ebollizione o 2 gocce candeggina/L + 30 min attesa' },
    { id:'acq04', axis:'acqua',    scoreBonus:10, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-purificazione',       resolve: null, text:'Raziona: 3L/persona/giorno tra bere e cucinare · poca acqua per igiene · acqua sporca per WC e pulizie' },
    // ── BLACKOUT BREVE ─────────────────────────────────────────────────────────
    { id:'bbs01', axis:'cibo',    scoreBonus:10, nav:'guide', tab:null, threats:['blackout'],             guide:'cibo-conservazione',          resolve: null, text:'NON aprire frigo/congelatore: mantiene freddo 4–6h — pianifica i pasti da ora' },
    { id:'bbs02', axis:'comm',    scoreBonus:12, nav:'guide', tab:null, threats:['blackout','comm'],      guide:'energia-blackout-protocollo', resolve: null, text:'Carica ADESSO tutti i dispositivi e power bank — spegni elettrodomestici non essenziali' },
    { id:'bbs03', axis:'comm',    scoreBonus:10, nav:'guide', tab:null, threats:['blackout','comm'],      guide:'comm-radio-canali',           resolve: null, text:'Chiama numero guasti fornitore + radio FM per aggiornamenti sulla durata' },
    // ── RAZIONAMENTO ──────────────────────────────────────────────────────────
    { id:'raz01', axis:'energia', scoreBonus:18, nav:'guide', tab:null, threats:['blackout'],             guide:'energia-blackout-protocollo', resolve: null, text:'Mappa le fasce orarie con energia: concentra lavatrice, cottura e ricariche in quelle finestre' },
    { id:'raz02', axis:'cibo',    scoreBonus:12, nav:'guide', tab:null, threats:['cibo','blackout'],      guide:'cibo-cottura-campo',          resolve: null, text:'Cucina in batch durante le fasce: zuppe e legumi per 2–3 giorni, raffredda rapido' },
    { id:'raz03', axis:'energia', scoreBonus:10, nav:'guide', tab:null, threats:['blackout'],             guide:'energia-blackout-protocollo', resolve: null, text:'Disconnetti tutti i dispositivi in stand-by nelle fasce off — risparmio fino al 20%' },
    { id:'raz04', axis:'cibo',    scoreBonus: 8, nav:'guide', tab:null, threats:['cibo'],                 guide:'cibo-conservazione',          resolve: null, text:'Frigo a 5°C ottimale — apri una volta per pasto con lista ingredienti già preparata' },
    // ── INTERRUZIONE FORNITURE ALIMENTARI ─────────────────────────────────────
    { id:'cib01', axis:'cibo',    scoreBonus:18, nav:'guide', tab:null, threats:['cibo'],                 guide:'cibo-scorte-piano',           resolve: null, text:'Pianifica menù settimanale dalle scorte: prima fresco e aperto, poi scatolame, poi secco' },
    { id:'cib02', axis:'cibo',    scoreBonus:15, nav:'guide', tab:null, threats:['cibo'],                 guide:'community-resilienza',        resolve: null, text:'Filiera corta: identifica mercati locali, agricoltori diretti, gruppi acquisto solidale (GAS)' },
    { id:'cib03', axis:'cibo',    scoreBonus:12, nav:'guide', tab:null, threats:['cibo'],                 guide:'cibo-conservazione',          resolve: null, text:'Impara fermentazione: crauti in 7 giorni, kimchi in 14 — conserva verdure senza energia' },
    { id:'cib04', axis:'cibo',    scoreBonus: 8, nav:'guide', tab:null, threats:['cibo'],                 guide:'cibo-conservazione',          resolve: null, text:'Zero sprechi: bucce e fondi per brodo, pane secco in pan di pane, avanzi proteici in frittata' },
    // ── BLACKOUT RETE MOBILE ──────────────────────────────────────────────────
    { id:'bmo01', axis:'comm',    scoreBonus:20, nav:'guide', tab:null, threats:['comm'],                 guide:'comm-radio-canali',           resolve: null, text:'Radio FM/AM: RAI Radio 1 emergenze nazionali — 97.7 MHz o 1332 kHz in AM' },
    { id:'bmo02', axis:'comm',    scoreBonus:15, nav:'guide', tab:null, threats:['comm'],                 guide:'comm-piano-famiglia',         resolve: null, text:'Recati al punto di ritrovo fisico prestabilito — lascia nota cartacea sulla porta di casa' },
    { id:'bmo03', axis:'comm',    scoreBonus:12, nav:'guide', tab:null, threats:['comm'],                 guide:'comm-pmr446',                 resolve: null, text:'Walkie-talkie PMR446 canale 8: check ogni 4h con familiari nel raggio di 2–5km' },

    // ── SURVIVAL IN NATURA ────────────────────────────────────────────────────
    { id:'sv01', axis:'acqua',    scoreBonus:20, nav:'settings', tab:'acqua',    threats:['acqua'],  guide:'acqua-purificazione',            resolve: p=>!!p.ha_filtro,      field:'ha_filtro',      text:'Filtro Sawyer Mini + pastiglie Micropur nel kit' },
    { id:'sv02', axis:'acqua',    scoreBonus:10, nav:'guide',    tab:null,       threats:['acqua'],  guide:'survival-acqua-natura',          resolve: null,                                          text:'Studia distillazione solare e raccolta rugiada' },
    { id:'sv03', axis:'cibo',     scoreBonus:20, nav:'guide',    tab:null,       threats:['cibo'],   guide:'survival-trappole',              resolve: null,                                          text:'Razioni liofilizzate 3+ giorni (2000 kcal/giorno) + kit pesca' },
    { id:'sv04', axis:'cibo',     scoreBonus:10, nav:'guide',    tab:null,       threats:['cibo'],   guide:'survival-piante',                resolve: null,                                          text:'Impara piante commestibili sicure nella tua zona' },
    { id:'sv05', axis:'calore',   scoreBonus:25, nav:'guide',    tab:null,       threats:['freddo'], guide:'survival-riparo',                resolve: null,                                          text:'Sacco a pelo -10°C + telo mylar bivacchetto nel kit' },
    { id:'sv06', axis:'calore',   scoreBonus:15, nav:'guide',    tab:null,       threats:['freddo'], guide:'survival-fuoco',                 resolve: null,                                          text:'Acciarino ferrocerio + paracord 550: costruisci fuoco e lean-to' },
    { id:'sv07', axis:'calore',   scoreBonus:10, nav:'guide',    tab:null,       threats:['freddo'], guide:'survival-riparo',                resolve: null,                                          text:'Studia regola dei 3 e costruzione riparo di emergenza' },
    { id:'sv08', axis:'comm',     scoreBonus:20, nav:'guide',    tab:null,       threats:['comm'],   guide:'survival-segnalazione',          resolve: null,                                          text:'Fischietto Fox 40 + specchio di segnalazione nel kit' },
    { id:'sv09', axis:'comm',     scoreBonus:15, nav:'guide',    tab:null,       threats:['comm'],   guide:'survival-navigazione',           resolve: null,                                          text:'Bussola baseplate + cartina topografica 1:25.000 zona' },
    { id:'sv10', axis:'mobilita', scoreBonus:12, nav:'guide',    tab:null,       threats:['comm'],   guide:'survival-navigazione',           resolve: null,                                          text:'Coltello survival full tang (lama 10-15cm) sempre con te' },
    { id:'sv11', axis:'mobilita', scoreBonus:15, nav:'settings', tab:'medico',   threats:['medico'], guide:'survival-primo-soccorso-campo',  resolve: p=>!!p.has_kit_medico, field:'has_kit_medico', text:'IFAK avanzato: garze emostatiche, laccio CAT, chest seal' },
    { id:'sv12', axis:'comm',     scoreBonus: 8, nav:'guide',    tab:null,       threats:['comm'],   guide:'survival-navigazione',           resolve: null,                                          text:'Studia orientamento senza strumenti: sole, stelle, acqua' },
    { id:'sv13', axis:'cibo',     scoreBonus:15, nav:'guide',    tab:null,       threats:['cibo'],   guide:'survival-trappole',              resolve: null,                                          text:'Kit pesca di base nella go-bag + leggi la guida su pesca e selvaggina' },
    { id:'sv14', axis:'calore',   scoreBonus:12, nav:'guide',    tab:null,       threats:['freddo'], guide:'survival-nodi',                  resolve: null,                                          text:'Impara 5 nodi fondamentali: bowline, reef, clove hitch, prusik, lashing' },
    { id:'sv15', axis:'cibo',     scoreBonus:10, nav:'guide',    tab:null,       threats:['cibo'],   guide:'survival-conservazione-cibo',    resolve: null,                                          text:'Tecniche conservazione senza energia: essiccatura, salatura, fermentazione' },
  ];

  /* ── VIEW MODE ── */
  // Home mostra il Focus (top 3); "Vedi tutte" espande la lista completa per minaccia
  let showAllTasks = false;
  function toggleAllTasks() { showAllTasks = !showAllTasks; render(); }

  /* ── OFFLINE PACKS ── */
  const MAP_PACK_PATHS = [
    '/js/data/italy-municipalities.geojson',
    '/js/data/italy-provinces.geojson',
  ];

  function _guideImagePaths() {
    const paths = [];
    (typeof GUIDES_DATA !== 'undefined' ? GUIDES_DATA : []).forEach(g => {
      (g.sections || []).forEach(sec => {
        const slug = sec.heading.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
        paths.push(`/js/images/guides/${g.id}--${slug}.png`);
      });
    });
    return paths;
  }

  async function _downloadBatch(cacheName, paths, progEl) {
    const cache = await caches.open(cacheName);
    const BATCH = 6;
    let done = 0;
    for (let i = 0; i < paths.length; i += BATCH) {
      await Promise.allSettled(paths.slice(i, i + BATCH).map(async p => {
        try { const r = await fetch(p); if (r.ok) await cache.put(p, r); } catch {}
        done++;
        if (progEl) progEl.textContent = `${done} / ${paths.length}`;
      }));
    }
  }

  async function downloadGuidesPack() {
    const btn = document.getElementById('op-guides-btn');
    const prog = document.getElementById('op-guides-prog');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Download…';
    await _downloadBatch('kit-resilienza-guides', _guideImagePaths(), prog);
    Storage.set('offline-guides', 'done');
    refreshOfflineCard();
  }

  async function downloadMapPack() {
    const btn = document.getElementById('op-map-btn');
    const prog = document.getElementById('op-map-prog');
    if (!btn || btn.disabled) return;
    btn.disabled = true;
    btn.innerHTML = '<i class="ph ph-spinner"></i> Download…';
    await _downloadBatch('kit-resilienza-map', MAP_PACK_PATHS, prog);
    Storage.set('offline-map', 'done');
    refreshOfflineCard();
  }

  // La card dei pacchetti offline vive nella sezione Guide (slot #offline-pack-slot)
  function refreshOfflineCard() {
    const slot = document.getElementById('offline-pack-slot');
    if (slot) slot.innerHTML = _buildOfflineCard();
  }

  function _buildOfflineCard() {
    const guidesOk = !!Storage.get('offline-guides');
    const mapOk    = !!Storage.get('offline-map');
    if (guidesOk && mapOk) return '';

    const guideItem = guidesOk
      ? `<div class="op-item op-done">
          <i class="ph ph-books"></i><span>Immagini Guide</span>
          <span class="op-ok"><i class="ph ph-check-circle"></i> Offline</span>
        </div>`
      : `<div class="op-item">
          <div class="op-info">
            <i class="ph ph-books"></i>
            <div><strong>Immagini Guide</strong><span class="op-size">~114 MB · 135 file</span></div>
          </div>
          <div class="op-action">
            <span id="op-guides-prog" class="op-prog"></span>
            <button id="op-guides-btn" class="btn btn-sm btn-outline"
              onclick="DashboardModule.downloadGuidesPack()">
              <i class="ph ph-download-simple"></i> Scarica
            </button>
          </div>
        </div>`;

    const mapItem = mapOk
      ? `<div class="op-item op-done">
          <i class="ph ph-map-trifold"></i><span>Mappa Vettoriale Italia</span>
          <span class="op-ok"><i class="ph ph-check-circle"></i> Offline</span>
        </div>`
      : `<div class="op-item">
          <div class="op-info">
            <i class="ph ph-map-trifold"></i>
            <div><strong>Mappa Vettoriale Italia</strong><span class="op-size">~42 MB · Comuni + Province</span></div>
          </div>
          <div class="op-action">
            <span id="op-map-prog" class="op-prog"></span>
            <button id="op-map-btn" class="btn btn-sm btn-outline"
              onclick="DashboardModule.downloadMapPack()">
              <i class="ph ph-download-simple"></i> Scarica
            </button>
          </div>
        </div>`;

    return `<div class="card op-card">
      <div class="op-header">
        <i class="ph ph-cloud-arrow-down"></i>
        <div>
          <strong>Contenuto Offline Disponibile</strong>
          <p class="text-secondary text-sm mt-4">Scarica per usare l'app completamente senza connessione</p>
        </div>
      </div>
      <div class="op-items">${guideItem}${mapItem}</div>
    </div>`;
  }

  /* ── SCORE DELTA TOAST ── */
  function _showScoreToast(axis, bonus, checked) {
    if (!checked) return;
    const AXIS_LABEL = { acqua:'ACQUA', cibo:'CIBO', energia:'ENERGIA', calore:'CALORE', comm:'COMM', mobilita:'MOBILITÀ' };
    const toast = document.createElement('div');
    toast.className = 'score-toast';
    toast.innerHTML = `<i class="ph ph-check"></i> Fatto · ${AXIS_LABEL[axis] || axis}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('score-toast-show'));
    setTimeout(() => { toast.classList.remove('score-toast-show'); setTimeout(() => toast.remove(), 300); }, 1800);
  }

  /* ── SCENARIO PICKER MODAL ── */
  function openScenarioPicker() {
    const existing = document.getElementById('scenario-picker-modal');
    if (existing) { existing.remove(); return; }
    const profilo = SettingsModule.get();
    const current = profilo.scenario_id;
    const scenarios = window.SCENARI_LIST || [];
    const modal = document.createElement('div');
    modal.id = 'scenario-picker-modal';
    modal.className = 'sp-modal';
    modal.innerHTML = `
      <div class="sp-backdrop" onclick="DashboardModule.openScenarioPicker()"></div>
      <div class="sp-drawer">
        <div class="sp-header">
          <span>Cambia Scenario</span>
          <button class="sp-close" onclick="DashboardModule.openScenarioPicker()"><i class="ph ph-x"></i></button>
        </div>
        <div class="sp-list">
          <div class="sp-item${!current ? ' sp-active' : ''}" onclick="DashboardModule._pickScenario(null)">
            <span class="sp-icon"><i class="ph ph-magnifying-glass"></i></span>
            <div class="sp-info"><strong>Auto-rilevamento</strong><span>Minacce da profilo</span></div>
            ${!current ? '<i class="ph ph-check sp-check"></i>' : ''}
          </div>
          ${scenarios.map(s => `
            <div class="sp-item${current === s.id ? ' sp-active' : ''}" onclick="DashboardModule._pickScenario('${s.id}')">
              <span class="sp-icon">${s.icon}</span>
              <div class="sp-info"><strong>${s.titolo}</strong><span>${s.desc}</span></div>
              ${current === s.id ? '<i class="ph ph-check sp-check"></i>' : ''}
            </div>`).join('')}
        </div>
      </div>`;
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add('sp-open'));
  }

  function _pickScenario(id) {
    const p = SettingsModule.get();
    p.scenario_id = id;
    if (typeof Storage !== 'undefined') Storage.set('profilo', p);
    if (typeof SettingsModule !== 'undefined') SettingsModule._syncFromStorage?.();
    openScenarioPicker();
    render();
  }

  /* ── SCORING DA PROFILO ── */
  function scoreFromDays(d) {
    if (d <= 0)  return 0;
    if (d <= 7)  return Math.round((d / 7) * 30);
    if (d <= 14) return Math.round(30 + ((d - 7) / 7) * 22);
    if (d <= 30) return Math.round(52 + ((d - 14) / 16) * 23);
    return Math.min(100, Math.round(75 + ((d - 30) / 30) * 25));
  }

  function computeBaseScores(p) {
    // ACQUA: da litri stoccati + fonti alternative
    const persone = (p.adulti || 2) + (p.bambini || 0) * 0.7 + (p.anziani || 0) * 0.9;
    const litriGiorno = Math.max(1, persone * Utils.WATER_L_PPD);
    const acquaGiorni = (p.acqua_scorte_litri || 0) / litriGiorno;
    let acqua = scoreFromDays(acquaGiorni);
    if (p.ha_pozzo)   acqua = Math.min(100, acqua + 15);
    if (p.ha_pioggia) acqua = Math.min(100, acqua + 10);
    if (p.ha_fiume)   acqua = Math.min(100, acqua + 5);

    // CIBO: da giorni stoccati
    const cibo = scoreFromDays(p.cibo_scorte_giorni || 0);

    // ENERGIA: da fonti disponibili
    let energia = 8;
    if (p.en_pannelli)   energia += p.pannelli_wp  > 0 ? Math.min(35, 20 + p.pannelli_wp / 40) : 20;
    if (p.en_batteria)   energia += p.batteria_kwh > 0 ? Math.min(25, 12 + p.batteria_kwh * 4) : 12;
    if (p.en_generatore) energia += p.generatore_w > 0 ? Math.min(20, 10 + p.generatore_w / 400) : 10;
    energia = Math.min(100, Math.round(energia));

    // CALORE: da riscaldamento + isolamento + tipo riparo
    let calore = ['tenda','rifugio','nessun_riparo'].includes(p.tipo_abitazione) ? 5 : 12;
    if (p.risc_legna)   calore += 30;
    if (p.risc_pellet)  calore += 28;
    if (p.risc_gpl)     calore += 20;
    if (p.isolamento === 'buono')  calore += 10;
    if (p.isolamento === 'ottimo') calore += 20;
    calore = Math.min(100, calore);

    // COMM: da dispositivi disponibili + internet
    let comm = p.has_internet ? 10 : 0;
    if (p.has_radio)     comm += 30;
    if (p.has_walkie)    comm += 22;
    if (p.has_sat_phone) comm += 28;
    if (p.has_mesh)      comm += 15;
    comm = Math.min(100, comm);

    // MOBILITÀ: da carburante stoccato vs km settimanali
    const kmSett = p.km_settimana || 0;
    const litriSett = kmSett * 0.10; // ~10L/100km
    const settimane = litriSett > 0 ? (p.carburante_litri || 0) / litriSett : (p.carburante_litri > 0 ? 4 : 0);
    let mobilita = kmSett === 0 ? 40 : scoreFromDays(settimane * 7); // converto settimane in giorni

    return { acqua, cibo, energia, calore, comm, mobilita };
  }

  function _scenarioTaskIds(scenarioId) {
    if (!scenarioId || scenarioId === 'custom') return null;
    const sc = (window.SCENARI_LIST || []).find(s => s.id === scenarioId);
    if (!sc || !sc.taskMap) return null;
    return new Set(Object.values(sc.taskMap).flat());
  }

  function computeCurrentScores(profilo, activeIds, scenarioId) {
    const base = computeBaseScores(profilo);
    const done = Storage.get('task-checks') || {};
    const scenarioTasks = _scenarioTaskIds(scenarioId);

    ALL_TASKS.forEach(task => {
      const relevant = !activeIds || task.threats.some(tid => activeIds.includes(tid));
      if (!relevant) return;
      // Scenario attivo: solo task nel taskMap; nessuno scenario: tutti i task rilevanti per minaccia
      if (scenarioTasks && !scenarioTasks.has(task.id)) return;
      const completed = task.resolve ? task.resolve(profilo) : !!done[task.id];
      if (completed) base[task.axis] = Math.min(100, base[task.axis] + task.scoreBonus);
    });

    return base;
  }

  function computeRequiredScores(activeThreats, scenarioId) {
    if (activeThreats.length === 0) return { acqua:0, cibo:0, energia:0, calore:0, comm:0, mobilita:0 };
    // Scenario con required esplicito → usa quello
    if (scenarioId && scenarioId !== 'custom') {
      const sc = (window.SCENARI_LIST || []).find(s => s.id === scenarioId);
      if (sc && sc.required) return { ...sc.required };
    }
    // Fallback: max tra le minacce attive
    const req = { acqua:0, cibo:0, energia:0, calore:0, comm:0, mobilita:0 };
    activeThreats.forEach(tid => {
      const threat = THREATS.find(t => t.id === tid);
      if (!threat) return;
      Object.keys(req).forEach(k => req[k] = Math.max(req[k], threat.required[k] || 0));
    });
    return req;
  }

  /* ── LIVELLO DI PREPARAZIONE ── */
  // Il livello dipende solo da quanti giorni reggi con acqua E cibo (il più scarso dei due).
  const LEVELS = [
    { n: 0, label: 'Da iniziare',  days: 0  },
    { n: 1, label: '72 ore',       days: 3  },
    { n: 2, label: '2 settimane',  days: 14 },
    { n: 3, label: '30 giorni',    days: 30 },
  ];

  // Persone "equivalenti adulto" e giorni d'acqua (una sola regola in tutta l'app: Utils.WATER_L_PPD)
  const _persone = p => Math.max(1, (p.adulti || 0) + (p.bambini || 0) * 0.7 + (p.anziani || 0) * 0.9);
  function _waterDays(p) {
    let gg = (p.acqua_scorte_litri || 0) / (_persone(p) * Utils.WATER_L_PPD);
    if (p.ha_pozzo || p.ha_fiume) gg = Math.max(gg, 14);
    else if (p.ha_pioggia)        gg = Math.max(gg, 7);
    return gg;
  }

  function computeLevel(p) {
    const litriGiorno = _persone(p) * Utils.WATER_L_PPD;
    const acquaGg = _waterDays(p);
    const ciboGg = p.cibo_scorte_giorni || 0;
    const days = Math.min(acquaGg, ciboGg);
    const level = [...LEVELS].reverse().find(l => days >= l.days) || LEVELS[0];
    const next = LEVELS[level.n + 1] || null;
    let needAcqua = 0, needCibo = 0;
    if (next) {
      needAcqua = Math.max(0, Math.ceil(next.days * litriGiorno - (p.acqua_scorte_litri || 0)));
      if (p.ha_pozzo || p.ha_fiume || (p.ha_pioggia && next.days <= 7)) needAcqua = 0;
      needCibo = Math.max(0, Math.ceil(next.days - ciboGg));
    }
    const targetLitri = next ? Math.ceil(next.days * litriGiorno) : 0;
    return { level, next, needAcqua, needCibo, targetLitri };
  }

  // Percorso base: ordine in cui un utente nuovo dovrebbe agire (acqua → cibo → medico → comunicare → luce → calore)
  const PATH = ['ac01','ci01','me01','co01','en01','ac02','co03','mo02','en02','ca01','ca03','co02','me02','mo01','ci02','ci04','ac04','si01','en04','mo03','ca02'];
  const pathIdx = id => { const i = PATH.indexOf(id); return i < 0 ? 99 : i; };
  // Task da survivalista (sv*): visibili solo se lo scenario scelto le include
  const isVisibleTask = (t, scenarioTasks, p) => {
    if (t.id.startsWith('sv') && !(scenarioTasks && scenarioTasks.has(t.id))) return false;
    if (['mo01', 'mo04'].includes(t.id) && !((p && p.km_settimana) > 0)) return false;   // carburante/percorsi: solo con veicolo
    return true;
  };

  /* ── AUTO-RILEVA MINACCE ── */
  function autoDetectThreats(profilo) {
    return THREATS.filter(t => t.check(profilo)).map(t => ({
      id: t.id, label: t.label, icon: t.icon,
      reason: t.reason(profilo),
    }));
  }

  /* ── RISORSE: valori concreti (giorni, fonti, canali), non percentuali opache ── */
  function buildResources(current, p) {
    const aq = _waterDays(p), ci = p.cibo_scorte_giorni || 0;
    const fmt = n => (n < 10 ? (Math.round(n * 10) / 10).toString().replace('.', ',') : String(Math.round(n)));
    const fonti = [p.en_pannelli, p.en_batteria, p.en_generatore].filter(Boolean).length;
    const risc = [p.risc_legna && 'legna', p.risc_pellet && 'pellet', p.risc_gpl && 'GPL'].filter(Boolean);
    const canali = [p.has_radio, p.has_walkie, p.has_sat_phone, p.has_mesh].filter(Boolean).length;
    const dayCls = d => d >= 14 ? 'good' : d >= 3 ? 'warn' : 'bad';
    const pctCls = v => v >= 70 ? 'good' : v >= 35 ? 'warn' : 'bad';
    const rows = [
      { label:'Acqua',   icon:'ph-drop',       days:aq, val: fmt(aq) + ' gg',   sub: (p.acqua_scorte_litri || 0) + ' L', nav:'acqua' },
      { label:'Cibo',    icon:'ph-fork-knife', days:ci, val: ci + ' gg',        sub: '', nav:'cibo' },
      { label:'Energia', icon:'ph-lightning',  pct:current.energia, val: fonti ? fonti + (fonti > 1 ? ' fonti' : ' fonte') : 'Nessuna', nav:'energia' },
      { label:'Calore',  icon:'ph-flame',      pct:current.calore,  val: risc.length ? risc.join(' + ') : 'Nessuno', nav:'riscaldamento' },
      { label:'Comunic.',icon:'ph-radio',      pct:current.comm,    val: canali ? canali + (canali > 1 ? ' canali' : ' canale') : 'Nessuno', nav:'settings', tab:'comm' },
      (p.km_settimana || 0) > 0 && { label:'Mobilità', icon:'ph-car', pct:current.mobilita, val: p.carburante_litri ? p.carburante_litri + ' L' : '—', nav:'carburante' },
    ].filter(Boolean);

    return rows.map(r => {
      const isDays = r.days !== undefined;
      const cls  = isDays ? dayCls(r.days) : pctCls(r.pct);
      const fill = isDays ? Math.min(100, r.days / 30 * 100) : r.pct;
      const ticks = isDays ? '<i class="res-tick" style="left:10%"></i><i class="res-tick" style="left:46.7%"></i>' : '';
      const onclick = r.tab
        ? `navigateTo('${r.nav}'); setTimeout(()=>SettingsModule._tab('${r.tab}'), 180)`
        : `navigateTo('${r.nav}')`;
      return `<div class="res-row" onclick="${onclick}">
        <div class="res-label"><i class="ph ${r.icon}"></i><span>${r.label}</span></div>
        <div class="res-bar ${cls}">${ticks}<div class="res-fill" style="width:${Math.max(fill, 2)}%"></div></div>
        <div class="res-val ${cls}">${r.val}${r.sub ? `<small>${r.sub}</small>` : ''}</div>
      </div>`;
    }).join('') + `<div class="res-legend"><i class="res-tick-demo"></i> tacche sulle barre di acqua e cibo: 72 ore · 2 settimane · 30 giorni</div>`;
  }

  /* ── TASK CARD (shared renderer) ── */
  const AXIS_ICON = { acqua:'ph-drop', cibo:'ph-fork-knife', energia:'ph-lightning', calore:'ph-flame', comm:'ph-radio', mobilita:'ph-car' };
  const URGENCY_META = {
    critico:    { label:'CRITICO',     icon:'ph-warning-octagon' },
    urgente:    { label:'URGENTE',     icon:'ph-warning'         },
    pianificato:{ label:'PIANIFICATO', icon:'ph-clock'           },
  };

  function renderTaskCard(t) {
    const um = t.rankLabel ? { label: t.rankLabel, icon: URGENCY_META[t.urgency].icon } : URGENCY_META[t.urgency];

    // Lato sinistro:
    // · field  → checkbox che scrive nel profilo (bidirezionale con Piano)
    // · auto senza field → badge che guida a Piano
    // · manuale → checkbox normale (task-checks)
    const leftCtrl = (t.field || !t.isAutoTask)
      ? `<label class="task-checkbox-wrap" onclick="event.stopPropagation()">
           <input type="checkbox" ${t.completed ? 'checked' : ''}
             onchange="DashboardModule.toggleTask('${t.id}', this.checked)">
           <span class="task-cb"></span>
         </label>`
      : (t.completed
          ? `<span class="task-auto-badge resolved" title="Valori in Piano soddisfatti — risolto automaticamente">
               <i class="ph ph-check-circle"></i>
             </span>`
          : `<span class="task-auto-badge pending" onclick="DashboardModule.goToTask('${t.id}')"
               title="Aggiorna i valori in Piano per risolvere">
               <i class="ph ph-sliders"></i>
             </span>`);

    const navIcon  = t.tab ? 'ph-sliders' : (t.guide ? 'ph-arrow-right' : 'ph-arrow-right');
    const navTitle = t.tab ? 'Aggiorna il Piano' : 'Apri guida';

    return `
      <div class="priority-task ${t.urgency} ${t.completed ? 'task-completed' : ''}${t.isAutoTask ? ' task-auto' : ''}">
        ${leftCtrl}
        <div class="task-body" onclick="DashboardModule.goToTask('${t.id}')">
          <div class="task-title ${t.completed ? 'task-done' : ''}">
            <i class="ph ${AXIS_ICON[t.axis]||'ph-circle'} task-axis-icon"></i>
            ${t.text}
          </div>
          <div class="task-meta">
            <span class="task-urgency-badge ${t.urgency}"><i class="ph ${um.icon}"></i>${um.label}</span>
            <span>${(AXES.find(a => a.id === t.axis) || { label: t.axis.toUpperCase() }).label}</span>
            ${t.isAutoTask
              ? `<span class="task-auto-label">${t.completed ? '· già a posto ✓' : (Storage.get('onboarded') ? '· tocca per aggiornare i tuoi dati' : '· tocca e inserisci i tuoi dati')}</span>`
              : (t.completed ? '<span class="text-success">· ✓</span>' : '')}
          </div>
        </div>
        <div class="task-actions">
          <button class="task-guide-btn ${t.guide ? '' : 'task-guide-soon'}"
            onclick="event.stopPropagation(); DashboardModule.openGuide('${t.guide || t.id}')"
            title="${t.guide ? 'Apri guida' : 'Guida in arrivo'}">
            <i class="ph ph-book-open"></i>
          </button>
          <i class="ph ${navIcon} task-nav-icon" title="${navTitle}"
             onclick="event.stopPropagation(); DashboardModule.goToTask('${t.id}')"></i>
        </div>
      </div>`;
  }

  /* ── TASK BOARD ── */
  function buildTaskBoard(current, required, activeIds, detected, done, profilo) {
    const scenarioId = profilo.scenario_id;
    const scenarioTasks = _scenarioTaskIds(scenarioId);
    // Arricchisce ogni task con urgency + completed (auto o manuale)
    const enriched = ALL_TASKS
      .filter(t => t.threats.some(tid => activeIds.includes(tid)))
      .filter(t => !scenarioTasks || scenarioTasks.has(t.id))
      .filter(t => isVisibleTask(t, scenarioTasks, profilo))
      .map(t => {
        // Usa il più stringente tra scenario.required e threat.required per quell'asse
        const threatReqForAxis = t.threats
          .filter(tid => activeIds.includes(tid))
          .reduce((max, tid) => {
            const td = THREATS.find(x => x.id === tid);
            return td ? Math.max(max, td.required[t.axis] || 0) : max;
          }, 0);
        const effectiveRequired = Math.max(required[t.axis] || 0, threatReqForAxis);
        const gap = effectiveRequired - (current[t.axis] || 0);
        const isAutoTask = !!t.resolve;
        const completed  = isAutoTask ? t.resolve(profilo) : !!done[t.id];
        const urgency = gap <= 0 ? 'pianificato' : gap > 45 ? 'critico' : gap > 20 ? 'urgente' : 'pianificato';
        return { ...t, gap, urgency, completed, isAutoTask };
      });

    if (enriched.length === 0) {
      const noThreats = activeIds.length === 0;
      return `<div class="tasks-empty">
        <i class="ph ph-check-circle" style="font-size:2rem;color:var(--success);display:block;margin-bottom:8px"></i>
        <p>${noThreats
          ? 'Nessuna minaccia attiva — configura le impostazioni per ricevere task operative'
          : 'Tutti i requisiti soddisfatti per le minacce attive — mantieni le scorte aggiornate'}</p>
        ${noThreats ? `<button class="btn btn-outline btn-sm mt-12" onclick="navigateTo('settings')">
          <i class="ph ph-sliders"></i> Apri Piano</button>` : ''}
      </div>`;
    }

    const remaining = enriched.filter(t => !t.completed).length;
    return showAllTasks
      ? _buildByThreat(enriched, detected, current, required, scenarioId) + _allToggle(remaining, true)
      : _buildFocus(enriched, profilo) + _allToggle(remaining, false);
  }

  /* ── MODALITÀ: "Preparati" (calma) vs "Emergenza" (un passo alla volta) ── */
  const getMode = () => Storage.get('home_mode') || 'prepara';
  function setMode(m) { Storage.set('home_mode', m); render(); window.scrollTo(0, 0); }

  function _modeSwitch(mode) {
    return `<div class="mode-switch" role="tablist">
      <button role="tab" aria-selected="${mode === 'prepara'}" class="${mode === 'prepara' ? 'active' : ''}" onclick="DashboardModule.setMode('prepara')">
        <i class="ph ph-shield-check"></i> Preparati
      </button>
      <button role="tab" aria-selected="${mode === 'emergenza'}" class="mode-emg ${mode === 'emergenza' ? 'active' : ''}" onclick="DashboardModule.setMode('emergenza')">
        <i class="ph ph-siren"></i> Emergenza
      </button>
    </div>`;
  }

  // Protocollo appiattito: ogni azione è un passo (con il nome della fase di appartenenza)
  // Senza veicolo si saltano i passi su carburante e catene
  const NEEDS_VEHICLE = /carburante|il pieno|Metti in moto l'auto|Catene a bordo/;
  // Passi in più per chi ha neonati, persone con difficoltà di movimento o animali (sono ovunque dopo la prima fase)
  const _extraPhase = p => {
    const azioni = [];
    if (p.mobilita_ridotta) azioni.push(
      'Chi fa fatica a muoversi: non lasciarlo solo e non usare l\'ascensore. Quando chiami il 112 dillo subito',
      'Scegli un percorso senza scale e chiedi aiuto a un vicino prima che serva');
    if (p.ha_neonato) azioni.push(
      'Neonato: tieni a portata latte, biberon, pannolini e una coperta. Usa solo acqua bollita per il latte');
    if (p.ha_animali) azioni.push(
      'Animali: tienili con te, con guinzaglio o trasportino. Non lasciarli liberi né da soli in casa');
    return azioni.length ? { fase: 'PER LA TUA SITUAZIONE', azioni } : null;
  };
  const _phases = sc => {
    const p = SettingsModule.get();
    const veicolo = (p.km_settimana || 0) > 0;
    const base = sc.steps
      .map(f => ({ fase: f.fase, azioni: f.azioni.filter(text => veicolo || !NEEDS_VEHICLE.test(text)) }))
      .filter(f => f.azioni.length);
    const extra = _extraPhase(p);
    if (extra && !CHECKLIST.has(sc.id) && sc.id !== 'survival-natura') base.splice(1, 0, extra);
    else if (extra && CHECKLIST.has(sc.id)) base.push(extra);
    return base;
  };
  const _flatSteps = sc => _phases(sc).flatMap(f => f.azioni.map(text => ({ fase: f.fase, text })));
  // Situazioni lente (non da vivere minuto per minuto): checklist invece di un passo alla volta
  const CHECKLIST = new Set(['razionamento', 'cibo', 'crisi-economica', 'blackout-mobile']);
  const _chkKey = id => 'emg_chk_' + id;
  const _chkGet = id => Storage.get(_chkKey(id)) || [];
  function emgCheck(key) {
    const id = SettingsModule.get().scenario_id;
    const cur = _chkGet(id);
    Storage.set(_chkKey(id), cur.includes(key) ? cur.filter(k => k !== key) : [...cur, key]);
    render();
  }
  function emgJump(i) {
    const id = SettingsModule.get().scenario_id;
    Storage.set(_emgKey(id), i);
    render();
  }
  const _emgKey = id => 'emg_' + id;
  const _emgIdx = id => Storage.get(_emgKey(id)) || 0;

  function _emgMove(delta) {
    const id = SettingsModule.get().scenario_id;
    const sc = (window.SCENARI_LIST || []).find(x => x.id === id);
    if (!sc || !sc.steps) return;
    const total = _flatSteps(sc).length;
    Storage.set(_emgKey(id), Math.max(0, Math.min(total, _emgIdx(id) + delta)));
    render();
  }
  function emgNext() { _emgMove(1); }
  function emgPrev() { _emgMove(-1); }
  function emgReset() {
    const id = SettingsModule.get().scenario_id;
    if (id) { Storage.set(_emgKey(id), 0); Storage.set(_chkKey(id), []); }
    render();
  }

  /* ── Numeri utili: 112 grande, 118/115 e numeri personali (guasti, medico, famiglia) ── */
  const _numeri = () => Storage.get('num_utili') || [];
  function addNumero() {
    const nome = (prompt('Nome del numero (es. Guasti luce, Medico, Mamma)') || '').trim();
    if (!nome) return;
    const num = (prompt('Numero di telefono per "' + nome + '"') || '').replace(/[^\d+]/g, '');
    if (!num) return;
    Storage.set('num_utili', [..._numeri(), { nome: nome.slice(0, 24), num }]);
    render();
  }
  function delNumero(i) {
    Storage.set('num_utili', _numeri().filter((_, j) => j !== i));
    render();
  }
  const _esc = t => String(t).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  function _callBlock() {
    const mine = _numeri().map((n, i) => `<span class="emg-num"><a href="tel:${_esc(n.num)}"><i class="ph ph-phone"></i> ${_esc(n.nome)}</a><button aria-label="Rimuovi ${_esc(n.nome)}" onclick="DashboardModule.delNumero(${i})"><i class="ph ph-x"></i></button></span>`).join('');
    return `<div class="emg-calls">
      <a class="emg-call" href="tel:112"><i class="ph ph-phone-call"></i> Chiama 112</a>
      <div class="emg-call-row">
        <a href="tel:118"><i class="ph ph-first-aid"></i> 118 Ambulanza</a>
        <a href="tel:115"><i class="ph ph-fire-extinguisher"></i> 115 Vigili del Fuoco</a>
      </div>
      <div class="emg-call-row emg-mine">${mine}<button class="emg-add" onclick="DashboardModule.addNumero()"><i class="ph ph-plus"></i> Aggiungi un tuo numero</button></div>
    </div>`;
  }

  function _buildEmergency(profilo, scenarioId) {
    const sc = scenarioId && scenarioId !== 'custom' ? (window.SCENARI_LIST || []).find(x => x.id === scenarioId) : null;
    const call = _callBlock();

    if (!sc || !sc.steps || !sc.steps.length) {
      return `<div class="emg">
        <div class="emg-card emg-pick">
          <i class="ph ph-question"></i>
          <h2>Cosa sta succedendo?</h2>
          <p>Scegli la situazione e ti guido un passo alla volta.</p>
          <button class="btn btn-primary btn-full" onclick="DashboardModule.openScenarioPicker()"><i class="ph ph-list-bullets"></i> Scegli la situazione</button>
        </div>${call}</div>`;
    }

    const steps = _flatSteps(sc);
    const idx = Math.min(_emgIdx(sc.id), steps.length);
    const head = `<div class="emg-top">
        <span class="now-badge"><i class="ph ph-siren"></i> Emergenza</span>
        <button class="banner-scenario-chip" onclick="DashboardModule.openScenarioPicker()"><span>${sc.icon || ''}</span> ${sc.titolo} <i class="ph ph-swap"></i></button>
      </div>`;

    if (CHECKLIST.has(sc.id)) {
      const chk = _chkGet(sc.id);
      let n = 0;
      const tot = steps.length;
      const body = _phases(sc).map((f, fi) => `
        <div class="chk-phase"><div class="emg-phase">${f.fase}</div>
        ${f.azioni.map((a, ai) => { const k = fi + '-' + ai; n += chk.includes(k) ? 1 : 0;
          return `<label class="chk-item"><input type="checkbox" ${chk.includes(k) ? 'checked' : ''} onchange="DashboardModule.emgCheck('${k}')"><span>${a}</span></label>`; }).join('')}
        </div>`).join('');
      return `<div class="emg">${head}
        <div class="emg-card emg-chk">
          <div class="emg-count">${n} di ${tot} fatti</div>
          <div class="emg-bar"><div style="width:${Math.round(n / tot * 100)}%"></div></div>
          ${body}
          <button class="btn btn-outline btn-sm" onclick="DashboardModule.emgReset()"><i class="ph ph-arrow-counter-clockwise"></i> Azzera</button>
        </div>${call}</div>`;
    }

    if (idx >= steps.length) {
      return `<div class="emg">${head}
        <div class="emg-card emg-done">
          <i class="ph ph-check-circle"></i>
          <h2>Protocollo completato</h2>
          <p>Se la situazione continua, ripeti i passi o segui le istruzioni delle autorità.</p>
          <div class="emg-actions">
            <button class="btn btn-outline" onclick="DashboardModule.emgReset()"><i class="ph ph-arrow-counter-clockwise"></i> Ricomincia</button>
            <button class="btn btn-primary" onclick="DashboardModule.setMode('prepara')">Torna a prepararti</button>
          </div>
        </div>${call}</div>`;
    }

    const st = steps[idx];
    const pct = Math.round(idx / steps.length * 100);
    const newPhase = idx === 0 || steps[idx - 1].fase !== st.fase;
    const phases = _phases(sc);
    let start = 0;
    const jump = phases.length > 1 ? `<div class="emg-jump">${phases.map(f => {
      const i = start; start += f.azioni.length;
      return `<button class="${f.fase === st.fase ? 'active' : ''}" onclick="DashboardModule.emgJump(${i})">${f.fase}</button>`;
    }).join('')}</div>` : '';
    return `<div class="emg">${head}
      ${jump}
      <div class="emg-card">
        <div class="emg-phase${newPhase ? ' emg-phase-new' : ''}">${st.fase}</div>
        <div class="emg-count">Passo ${idx + 1} di ${steps.length}</div>
        <div class="emg-text">${st.text}</div>
        <div class="emg-bar"><div style="width:${pct}%"></div></div>
      </div>
      <div class="emg-actions">
        <button class="btn btn-outline emg-prev" ${idx === 0 ? 'disabled' : ''} onclick="DashboardModule.emgPrev()" aria-label="Passo precedente"><i class="ph ph-arrow-left"></i></button>
        <button class="btn btn-primary emg-next" onclick="DashboardModule.emgNext()">${/^(NON|Non|EVITA|ODORE|Mai)\b/.test(st.text) ? 'Ok, capito' : 'Fatto, avanti'} <i class="ph ph-arrow-right"></i></button>
      </div>
      ${call}
    </div>`;
  }

  /* ── Sezioni a scomparsa (Preparati): tutto chiuso tranne le 3 azioni ── */
  const foldOpen = new Set();
  function _foldToggle(key, open) { open ? foldOpen.add(key) : foldOpen.delete(key); }
  function _fold(key, icon, title, sub, body) {
    return `<details class="card fold"${foldOpen.has(key) ? ' open' : ''} ontoggle="DashboardModule._foldToggle('${key}', this.open)">
      <summary>
        <i class="ph ${icon} fold-icon"></i>
        <span class="fold-title">${title}</span>
        <span class="fold-sub">${sub}</span>
        <i class="ph ph-caret-down fold-caret"></i>
      </summary>
      <div class="fold-body">${body}</div>
    </details>`;
  }

  /* ── Se succede ora: protocollo completo a fasi (lettura, da calmi) ── */
  const nowOpen = new Set([0]);
  function _nowToggle(i, open) { open ? nowOpen.add(i) : nowOpen.delete(i); }

  function _nowBody(sc) {
    if (!sc || !sc.steps || !sc.steps.length) {
      return `<p class="now-desc">Scegli lo scenario che temi di più: qui leggi cosa fare, fase per fase. Quando succede davvero, usa la modalità <strong>Emergenza</strong>.</p>
        <button class="btn btn-outline btn-sm mt-12" onclick="DashboardModule.openScenarioPicker()"><i class="ph ph-swap"></i> Scegli scenario</button>`;
    }
    return `<div class="now-phases">
        ${_phases(sc).map((f, i) => `
          <details class="now-phase"${nowOpen.has(i) ? ' open' : ''} ontoggle="DashboardModule._nowToggle(${i}, this.open)">
            <summary><span class="now-num">${i + 1}</span><span class="now-fase">${f.fase}</span><i class="ph ph-caret-down now-caret"></i></summary>
            <ul class="now-list">${f.azioni.map(a => `<li>${a}</li>`).join('')}</ul>
          </details>`).join('')}
      </div>`;
  }

  function _allToggle(remaining, open) {
    return `<button class="btn btn-outline btn-sm btn-full mt-12" onclick="DashboardModule.toggleAllTasks()">
      <i class="ph ${open ? 'ph-caret-up' : 'ph-list-bullets'}"></i>
      ${open ? 'Mostra solo le 3 principali' : 'Vedi tutte le azioni'}
    </button>`;
  }

  /* Lista completa: raggruppata per minaccia */
  function _buildByThreat(enriched, detected, current, required, scenarioId) {
    const sc = scenarioId && scenarioId !== 'custom'
      ? (window.SCENARI_LIST || []).find(s => s.id === scenarioId) : null;
    const seenIds = new Set();

    return detected.map(threat => {
      let tTasks;
      if (sc && sc.taskMap && sc.taskMap[threat.id]) {
        // Scenario mode: ogni task appartiene esattamente al suo threat nel taskMap
        const ownedIds = new Set(sc.taskMap[threat.id]);
        tTasks = enriched.filter(t => ownedIds.has(t.id) && !seenIds.has(t.id));
      } else {
        // Auto-detect mode: fallback a task.threats
        tTasks = enriched.filter(t => t.threats.includes(threat.id) && !seenIds.has(t.id));
      }
      tTasks.forEach(t => seenIds.add(t.id));
      tTasks = tTasks.sort((a, b) => (a.completed - b.completed) || (b.gap - a.gap));
      if (tTasks.length === 0) return '';

      // Gap badge: usa required specifico della threat, solo assi con task disponibili
      const threatDef = THREATS.find(x => x.id === threat.id);
      const threatRequired = threatDef ? threatDef.required : required;
      const taskAxes = new Set(tTasks.map(t => t.axis));
      const gapAxes = Object.keys(threatRequired)
        .map(k => ({ k, gap: Math.max(0, (threatRequired[k]||0) - (current[k]||0)) }))
        .filter(x => x.gap > 0 && taskAxes.has(x.k))
        .sort((a,b) => b.gap - a.gap);

      const done = tTasks.filter(t => t.completed).length;
      const resolved = done === tTasks.length;

      return `<div class="threat-group${resolved ? ' threat-group-resolved' : ''}">
        <div class="threat-group-header">
          <div class="threat-group-title">
            <i class="ph ${threat.icon}"></i>
            <span>${threat.label}</span>
            <span class="threat-group-progress">${done}/${tTasks.length}</span>
          </div>
          <div class="threat-group-reason">${threat.reason}</div>
          ${gapAxes.length > 0 ? `<div class="threat-gap-axes">
            ${gapAxes.map(g => `<span class="gap-axis-badge">${g.k.toUpperCase()} −${g.gap}</span>`).join('')}
          </div>` : ''}
        </div>
        <div class="threat-group-tasks">${tTasks.map(renderTaskCard).join('')}</div>
      </div>`;
    }).filter(Boolean).join('');
  }

  /* Focus — 3 azioni verso il PROSSIMO livello: prima acqua e cibo con cifre concrete, poi le task dello scenario */
  const SYNTH = {};
  const RANK = [
    { urgency: 'critico',     label: 'PRIMA' },
    { urgency: 'urgente',     label: 'POI'   },
    { urgency: 'pianificato', label: 'DOPO'  },
  ];
  const GENERIC_ID = /^(ac|ci|en|ca|co|mo|me|si|sv)\d/;
  // Fuori dal Focus: ac01/ci01 (30 giorni) già coperti dagli obiettivi di livello; ter03/ter04/bbs01/bbs03 sono
  // istruzioni da seguire durante l'evento (stanno già in "Se arriva l'emergenza"), non cose da preparare
  const FOCUS_SKIP = new Set(['ac01', 'ci01', 'ter03', 'ter04', 'bbs01', 'bbs03', 'acq01', 'acq02', 'acq04', 'gas01']);

  function _buildFocus(enriched, profilo) {
    Object.keys(SYNTH).forEach(k => delete SYNTH[k]);
    const lv = computeLevel(profilo);
    const synth = [];
    const tipo = profilo.tipo_abitazione;
    const outdoor = ['tenda', 'rifugio', 'nessun_riparo'].includes(tipo);
    if (tipo === 'ospite') {
      // In accoglienza non si fanno scorte: servono poche cose sempre con sé
      synth.push({ id:'lv-ospite', axis:'comm', nav:'guide', tab:null, guide:'gobag-checklist', threats:[], scoreBonus:0,
        isAutoTask:true, completed:false, gap:100,
        text:'Tieni sempre con te: documenti, farmaci, caricabatterie, una bottiglia d\'acqua e un po\' di contanti' });
    } else if (outdoor) {
      synth.push({ id:'lv-fonte', axis:'acqua', nav:'guide', tab:null, guide:'survival-acqua-natura', threats:[], scoreBonus:0,
        isAutoTask:true, completed:false, gap:100,
        text:'Individua una fonte d\'acqua e impara a renderla potabile (bollitura 1 minuto)' });
    }
    const cura = [];
    if (profilo.ha_neonato) cura.push({ id:'lv-neonato', axis:'cibo', guide:'cibo-scorte-piano',
      text:'Scorta per il neonato: latte, biberon, pannolini e acqua per 7 giorni' });
    if (profilo.mobilita_ridotta) cura.push({ id:'lv-mobilita', axis:'mobilita', guide:'evacuazione-piano',
      text:'Accordati con un vicino o un parente su chi aiuta a uscire chi fa fatica a muoversi, e tieni libere le vie d\'uscita' });
    if (profilo.ha_animali) cura.push({ id:'lv-animali', axis:'cibo', guide:'gobag-checklist',
      text:'Animali: cibo e acqua per 7 giorni, guinzaglio o trasportino, documenti e farmaci' });
    if (!outdoor && tipo !== 'ospite' && lv.next && lv.needAcqua > 0) {
      synth.push({ id:'lv-acqua', axis:'acqua', tab:'acqua', nav:'settings', guide:'acqua-stoccaggio', threats:[], scoreBonus:0,
        isAutoTask:true, completed:false, gap:100,
        text:`Porta l'acqua a ${lv.targetLitri} L: ti mancano ${lv.needAcqua} L (circa ${Math.ceil(lv.needAcqua / 1.5)} bottiglie da 1,5 L)` });
    }
    if (!outdoor && tipo !== 'ospite' && lv.next && lv.needCibo > 0) {
      synth.push({ id:'lv-cibo', axis:'cibo', tab:'cibo', nav:'settings', guide:'cibo-scorte-piano', threats:[], scoreBonus:0,
        isAutoTask:true, completed:false, gap:100,
        text:`Porta il cibo a ${lv.next.days} giorni: ti mancano ${lv.needCibo} giorni di scorte (riso, pasta, legumi, scatolette)` });
    }
    cura.forEach(t => synth.push({ ...t, nav:'guide', tab:null, threats:[], scoreBonus:0, isAutoTask:true, completed:false, gap:100 }));
    synth.forEach(t => { SYNTH[t.id] = t; });

    // ac01/ci01 (30 giorni) sono già coperti dagli obiettivi di livello qui sopra
    const rest = enriched
      .filter(t => !t.completed && !FOCUS_SKIP.has(t.id))
      .map(t => ({ ...t, impact: Math.max(0, t.gap) * t.scoreBonus }))
      // prima le task specifiche dello scenario (es. kit 72h per il terremoto), poi il percorso base
      .sort((a, b) => ((GENERIC_ID.test(a.id) ? pathIdx(a.id) : -1) - (GENERIC_ID.test(b.id) ? pathIdx(b.id) : -1)) || (b.impact - a.impact));

    const top = [...synth, ...rest].slice(0, 3)
      .map((t, i) => ({ ...t, urgency: RANK[i].urgency, rankLabel: RANK[i].label }));

    if (top.length === 0) return `<div class="tasks-empty">
      <i class="ph ph-check-circle" style="font-size:2rem;color:var(--success);display:block;margin-bottom:8px"></i>
      <p>Hai completato le azioni principali per questo scenario — controlla <strong>Piano</strong> per eventuali deficit non coperti.</p></div>`;

    return `<div class="focus-header">
        <i class="ph ph-crosshair"></i>
        ${lv.next ? `Per arrivare al livello ${lv.next.n} (${lv.next.label})` : 'Mantieni il livello massimo'} — in quest'ordine
      </div>
      <div class="focus-tasks">${top.map((t, i) => `
        <div class="focus-rank rank-${i + 1}">
          <span class="focus-num">${i + 1}</span>
          ${renderTaskCard(t)}
        </div>`).join('')}
      </div>`;
  }

  /* ── NAVIGA A PIANO + tab corretto ── */
  function goToTask(taskId) {
    const t = ALL_TASKS.find(x => x.id === taskId) || SYNTH[taskId];
    if (!t) return;
    if (typeof setBackTarget === 'function') setBackTarget('home');
    if (t.tab) {
      navigateTo('settings');
      setTimeout(() => {
        if (typeof SettingsModule !== 'undefined') SettingsModule._tab(t.tab);
      }, 180);
    } else if (t.guide) {
      openGuide(t.guide);
    } else {
      navigateTo(t.nav);
    }
  }

  function openGuide(guideId) {
    if (typeof setBackTarget === 'function') setBackTarget('home');
    if (typeof GuideModule !== 'undefined') {
      GuideModule.openGuide(guideId);
    } else {
      navigateTo('guide');
    }
  }

  const TIPO_LABEL = {
    appartamento: 'Appartamento',
    casa:         'Casa indipendente',
    rurale:       'Casa rurale',
    isolata:      'Casa isolata',
    ospite:       'Ospite / accoglienza',
    tenda:        'Tenda / veicolo',
    rifugio:      'Rifugio improvvisato',
    nessun_riparo:'Senza riparo',
  };

  /* ── RENDER ── */
  function render() {
    const root = document.getElementById('dashboard-root');
    if (!root) return;

    if (typeof OnboardingModule !== 'undefined' && !OnboardingModule.isDone()) {
      root.innerHTML = `<div class="card ob-welcome">
        <i class="ph ph-shield-check"></i>
        <h2>Benvenuto in Kit Resilienza</h2>
        <p>In un minuto ti dico a che <strong>livello di preparazione</strong> sei (72 ore, 2 settimane, 30 giorni) e quale azione fare per prima.</p>
        <button class="btn btn-primary btn-full" onclick="OnboardingModule.open()">
          <i class="ph ph-play"></i> Inizia (1 minuto)
        </button>
      </div>`;
      return;
    }

    const mode = getMode();
    if (mode === 'emergenza') {
      root.innerHTML = _modeSwitch(mode) + _buildEmergency(SettingsModule.get(), SettingsModule.get().scenario_id);
      return;
    }

    const profilo = SettingsModule.get();
    const autoDetected = autoDetectThreats(profilo);
    const autoIds = autoDetected.map(t => t.id);

    // Quando uno scenario è attivo, le minacce sono SOLO quelle dello scenario.
    // Auto-detect rimane attivo solo se nessuno scenario è selezionato.
    const scenarioId = profilo.scenario_id;
    const scenarioName = !scenarioId ? null
      : scenarioId === 'custom' ? 'Scenario Personalizzato'
      : (window.SCENARI_LIST?.find(s => s.id === scenarioId)?.titolo || scenarioId);
    const scenarioIds = !scenarioId ? []
      : scenarioId === 'custom' ? (profilo.custom_threats || [])
      : (SCENARIO_THREATS[scenarioId] || []);
    let detected;
    if (!scenarioId) {
      // Nessuno scenario: usa auto-detect
      detected = autoDetected;
    } else {
      // Scenario attivo: usa solo le minacce dello scenario (ignora auto-detect)
      detected = scenarioIds.map(tid => {
        const threat = THREATS.find(t => t.id === tid);
        if (!threat) return null;
        // Se la minaccia era già auto-rilevata mantieni la reason originale, altrimenti usa scenario
        const auto = autoDetected.find(a => a.id === tid);
        return auto || { id: threat.id, label: threat.label, icon: threat.icon,
                         reason: `Scenario attivo: ${scenarioName}` };
      }).filter(Boolean);
    }
    const activeIds = detected.map(t => t.id);
    const current  = computeCurrentScores(profilo, activeIds, scenarioId);
    const required = computeRequiredScores(activeIds, scenarioId);
    const done     = Storage.get('task-checks') || {};
    const persone  = (profilo.adulti||0) + (profilo.bambini||0) + (profilo.anziani||0);

    const scenarioTasks = _scenarioTaskIds(scenarioId);
    const visibleTasks = ALL_TASKS
      .filter(t => t.threats.some(tid => activeIds.includes(tid)))
      .filter(t => !scenarioTasks || scenarioTasks.has(t.id))
      .filter(t => isVisibleTask(t, scenarioTasks, profilo));
    const completedVisible = visibleTasks.filter(t => t.resolve ? t.resolve(profilo) : !!done[t.id]).length;
    const progressPct      = visibleTasks.length > 0 ? Math.round(completedVisible / visibleTasks.length * 100) : 0;

    const scObj = scenarioId && scenarioId !== 'custom' ? (window.SCENARI_LIST || []).find(s => s.id === scenarioId) : null;
    // Banner: livello di preparazione (acqua + cibo)
    const lv = computeLevel(profilo);
    const bannerCls  = ['danger', 'warning', 'warning', 'ok'][lv.level.n];
    const bannerIcon = ['ph-warning-octagon', 'ph-warning', 'ph-warning', 'ph-check-circle'][lv.level.n];
    const bannerLabel = lv.level.n === 0 ? 'DA INIZIARE' : `LIVELLO ${lv.level.n} DI 3`;
    const nextHint = lv.next
      ? `Per il livello ${lv.next.n} (${lv.next.label}): ${[
          lv.needAcqua > 0 ? `+${lv.needAcqua} L di acqua` : '',
          lv.needCibo > 0 ? `+${lv.needCibo} giorni di cibo` : '',
        ].filter(Boolean).join(' e ') || 'completa le azioni qui sotto'}`
      : 'Ottimo livello: mantieni scorte e rotazione.';

    const aqGg = _waterDays(profilo);
    const fmtGg = n => (n < 10 ? (Math.round(n * 10) / 10).toString().replace('.', ',') : String(Math.round(n)));
    const nPhases = scObj && scObj.steps ? scObj.steps.length : 0;

    root.innerHTML = `
      ${_modeSwitch(mode)}
      <!-- STATUS: livello + percorso 72h / 2 sett / 30gg -->
      <div class="status-banner ${bannerCls}">
        <i class="ph ${bannerIcon}"></i>
        <div class="status-banner-text">
          <strong>${bannerLabel}</strong>
          — ${lv.level.n === 0 ? 'meno di 72 ore di autonomia' : lv.level.label + ' di autonomia'}
          <div class="banner-next">${nextHint}</div>
          <button class="banner-scenario-chip${scenarioName ? '' : ' banner-scenario-chip-empty'}" onclick="DashboardModule.openScenarioPicker()">
            <i class="ph ${scenarioName ? 'ph-warning-octagon' : 'ph-swap'}"></i>
            ${scenarioName || 'Scegli uno scenario'}
          </button>
        </div>
        <div class="level-track" role="img" aria-label="Livello ${lv.level.n} di 3">
          ${LEVELS.slice(1).map(l => `
            <div class="lt-step ${lv.level.n >= l.n ? 'done' : lv.level.n + 1 === l.n ? 'next' : ''}">
              <span class="lt-dot">${lv.level.n >= l.n ? '<i class="ph ph-check-bold"></i>' : l.n}</span>
              <span class="lt-lab">${l.label}</span>
            </div>`).join('<span class="lt-line"></span>')}
        </div>
      </div>

      <!-- TASK OPERATIVE -->
      <div class="card">
        <div class="task-board-header">
          <h3><i class="ph ph-list-checks"></i> I tuoi prossimi passi</h3>
          <div class="task-board-controls">
            <div class="task-progress-wrap"${showAllTasks ? '' : ' hidden'}>
              <span class="task-progress-label">${completedVisible}/${visibleTasks.length}</span>
              <div class="task-progress-bar">
                <div class="task-progress-fill" style="width:${progressPct}%"></div>
              </div>
            </div>
          </div>
        </div>
        ${buildTaskBoard(current, required, activeIds, detected, done, profilo)}
      </div>

      ${_fold('now', 'ph-siren', 'Se arriva l\'emergenza', scObj ? `${scObj.titolo} · ${nPhases} fasi` : 'scegli uno scenario', _nowBody(scObj))}

      ${_fold('res', 'ph-chart-bar', 'Le tue scorte', `Acqua ${fmtGg(aqGg)} gg · Cibo ${profilo.cibo_scorte_giorni || 0} gg`, `
        ${buildResources(current, profilo)}
        <button class="btn btn-outline btn-sm btn-full mt-16" onclick="navigateTo('settings')">
          <i class="ph ph-pencil"></i> Aggiorna scorte
        </button>`)}

      <!-- PROFILO -->
      <div class="profile-quick">
        <button class="profile-chip profile-chip-btn" onclick="navigateTo('settings')">
          <i class="ph ph-users"></i>${persone > 0 ? persone + (persone === 1 ? ' persona' : ' persone') : 'Configura profilo'}
        </button>
        ${profilo.ha_neonato ? '<div class="profile-chip"><i class="ph ph-baby"></i>Neonato</div>' : ''}
        ${profilo.mobilita_ridotta ? '<div class="profile-chip"><i class="ph ph-wheelchair"></i>Mobilità ridotta</div>' : ''}
        ${profilo.ha_animali ? '<div class="profile-chip"><i class="ph ph-paw-print"></i>Animali</div>' : ''}
        ${profilo.tipo_abitazione ? `<div class="profile-chip">
          <i class="ph ph-house-simple"></i>${TIPO_LABEL[profilo.tipo_abitazione] || profilo.tipo_abitazione}
        </div>` : ''}
        <button class="profile-chip profile-chip-btn" onclick="navigateTo('settings')">
          <i class="ph ph-gear"></i> Modifica profilo
        </button>
      </div>
    `;
  }

  function toggleTask(id, checked) {
    const task = ALL_TASKS.find(t => t.id === id);
    if (task) _showScoreToast(task.axis, task.scoreBonus, checked);
    if (task && task.field) {
      if (typeof SettingsModule !== 'undefined') {
        SettingsModule.setField(task.field, checked);
      }
    } else {
      const done = Storage.get('task-checks') || {};
      done[id] = checked;
      Storage.set('task-checks', done);
      render();
    }
  }

  function init() { render(); }

  return { init, render, computeLevel, _nowToggle, _foldToggle, setMode, addNumero, delNumero, emgCheck, emgJump, emgNext, emgPrev, emgReset, toggleTask, toggleAllTasks, refreshOfflineCard, openGuide, goToTask, openScenarioPicker, _pickScenario, downloadGuidesPack, downloadMapPack };
})();
