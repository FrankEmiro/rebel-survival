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
    { id:'ac01', axis:'acqua',    scoreBonus:20, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-stoccaggio',            resolve: p=>(p.acqua_scorte_litri||0)>=30,                        text:'Accumula acqua: 5L/persona/giorno × 30 giorni in taniche' },
    { id:'ac02', axis:'acqua',    scoreBonus:15, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-purificazione',         resolve: p=>!!p.ha_filtro,   field:'ha_filtro',                text:'Acquista filtro portatile (Sawyer / LifeStraw)' },
    { id:'ac03', axis:'acqua',    scoreBonus:10, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-raccolta-pioggia',      resolve: p=>!!p.ha_pioggia,  field:'ha_pioggia',               text:'Imposta sistema raccolta acqua piovana' },
    { id:'ac04', axis:'acqua',    scoreBonus: 6, nav:'settings', tab:'acqua',    threats:['acqua'],               guide:'acqua-purificazione',         resolve: null,                                                    text:'Scorta candeggina non profumata per purificazione (4 gocce/L)' },
    // CIBO
    { id:'ci01', axis:'cibo',     scoreBonus:25, nav:'settings', tab:'cibo',     threats:['cibo'],                guide:'cibo-scorte-piano',           resolve: p=>(p.cibo_scorte_giorni||0)>=14,                        text:'Scorte alimentari 30+ giorni' },
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
    { id:'acq03', axis:'acqua',    scoreBonus:15, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-purificazione',       resolve: null, text:'Protocollo purificazione attivo: 1 min ebollizione o 4 gocce candeggina/L + 30 min attesa' },
    { id:'acq04', axis:'acqua',    scoreBonus:10, nav:'guide', tab:null, threats:['acqua'],                guide:'acqua-purificazione',       resolve: null, text:'Raziona: 2.5L/persona/giorno per bere · 1L igiene · acqua sporca per WC e pulizie' },
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
    { id:'sv13', axis:'cibo',     scoreBonus:15, nav:'guide',    tab:null,       threats:['cibo'],   guide:'survival-trappole',              resolve: null,                                          text:'Studia loop snare e spring snare + tieni filo metallico nel kit' },
    { id:'sv14', axis:'calore',   scoreBonus:12, nav:'guide',    tab:null,       threats:['freddo'], guide:'survival-nodi',                  resolve: null,                                          text:'Impara 5 nodi fondamentali: bowline, reef, clove hitch, prusik, lashing' },
    { id:'sv15', axis:'cibo',     scoreBonus:10, nav:'guide',    tab:null,       threats:['cibo'],   guide:'survival-conservazione-cibo',    resolve: null,                                          text:'Tecniche conservazione senza energia: essiccatura, salatura, fermentazione' },
  ];

  /* ── VIEW MODE ── */
  let taskView = 'minacce'; // 'minacce' | 'priorita' | 'focus'
  function setView(mode) { taskView = mode; render(); }

  /* ── SCORE DELTA TOAST ── */
  function _showScoreToast(axis, bonus, checked) {
    if (!checked) return;
    const AXIS_LABEL = { acqua:'ACQUA', cibo:'CIBO', energia:'ENERGIA', calore:'CALORE', comm:'COMM', mobilita:'MOBILITÀ' };
    const toast = document.createElement('div');
    toast.className = 'score-toast';
    toast.innerHTML = `<i class="ph ph-arrow-up"></i> +${bonus} ${AXIS_LABEL[axis] || axis}`;
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
            <span class="sp-icon">🔍</span>
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
    const litriGiorno = Math.max(1, persone * 3);
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

  /* ── AUTO-RILEVA MINACCE ── */
  function autoDetectThreats(profilo) {
    return THREATS.filter(t => t.check(profilo)).map(t => ({
      id: t.id, label: t.label, icon: t.icon,
      reason: t.reason(profilo),
    }));
  }

  /* ── RADAR SVG ── */
  function buildRadar(current, required) {
    const SIZE = 280, CX = 140, CY = 140, R = 100, LABEL_R = R + 28;
    const N = AXES.length;

    function polar(deg, r) {
      const rad = ((deg - 90) * Math.PI) / 180;
      return { x: CX + r * Math.cos(rad), y: CY + r * Math.sin(rad) };
    }
    function pts(scores) {
      return AXES.map((ax, i) => {
        const p = polar((i * 360) / N, R * (scores[ax.id] / 100));
        return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
      }).join(' ');
    }

    const rings = [0.2,0.4,0.6,0.8,1.0].map(s => {
      const rpts = AXES.map((_,i) => { const p = polar((i*360)/N, R*s); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');
      return `<polygon points="${rpts}" fill="none" stroke="rgba(201,168,76,0.1)" stroke-width="1"/>`;
    }).join('');

    const axisLines = AXES.map((ax, i) => {
      const p = polar((i*360)/N, R);
      return `<line x1="${CX}" y1="${CY}" x2="${p.x.toFixed(1)}" y2="${p.y.toFixed(1)}" stroke="rgba(201,168,76,0.15)" stroke-width="1"/>
              <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.5" fill="var(--bg-card)" stroke="rgba(201,168,76,0.35)" stroke-width="1"/>`;
    }).join('');

    const labels = AXES.map((ax, i) => {
      const p = polar((i*360)/N, LABEL_R);
      const score = current[ax.id] || 0;
      const col = score >= 70 ? '#5fa832' : score >= 40 ? '#c8852a' : '#b53020';
      return `<text x="${p.x.toFixed(1)}" y="${(p.y-5).toFixed(1)}" text-anchor="middle"
                font-family="'JetBrains Mono',monospace" font-size="8" font-weight="600"
                fill="rgba(220,215,192,0.65)" letter-spacing="0.06em">${ax.label}</text>
              <text x="${p.x.toFixed(1)}" y="${(p.y+7).toFixed(1)}" text-anchor="middle"
                font-family="'JetBrains Mono',monospace" font-size="10" font-weight="700"
                fill="${col}">${score}</text>`;
    }).join('');

    const hasReq = Object.values(required).some(v => v > 0);
    const reqPoly = hasReq ? `<polygon points="${pts(required)}" fill="rgba(181,48,32,0.08)"
      stroke="#b53020" stroke-width="1.5" stroke-dasharray="4 3" opacity="0.85"/>` : '';

    const curPoly = `<polygon points="${pts(current)}" fill="rgba(201,168,76,0.18)"
      stroke="#c9a84c" stroke-width="2" stroke-linejoin="round"/>`;

    const curDots = AXES.map((ax, i) => {
      const p = polar((i*360)/N, R * ((current[ax.id]||0)/100));
      const col = (current[ax.id]||0) >= 70 ? '#5fa832' : (current[ax.id]||0) >= 40 ? '#c8852a' : '#b53020';
      return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${col}" stroke="var(--bg-card)" stroke-width="1.5"/>`;
    }).join('');

    const ringLabels = [20,40,60,80,100].map((v,i) => {
      const p = polar(0, R * (v/100));
      return `<text x="${(CX+4).toFixed(1)}" y="${p.y.toFixed(1)}" font-family="'JetBrains Mono',monospace"
        font-size="7" fill="rgba(138,131,104,0.5)" dominant-baseline="middle">${v}</text>`;
    }).join('');

    const legend = `<g transform="translate(${CX-60},${SIZE-16})">
      <line x1="0" y1="5" x2="14" y2="5" stroke="#c9a84c" stroke-width="2"/>
      <circle cx="7" cy="5" r="3" fill="#c9a84c"/>
      <text x="18" y="8" font-family="'JetBrains Mono',monospace" font-size="8" fill="rgba(220,215,192,0.55)">ATTUALE</text>
      ${hasReq ? `<line x1="70" y1="5" x2="84" y2="5" stroke="#b53020" stroke-width="1.5" stroke-dasharray="4 3"/>
        <text x="88" y="8" font-family="'JetBrains Mono',monospace" font-size="8" fill="rgba(181,48,32,0.75)">RICHIESTO</text>` : ''}
    </g>`;

    return `<svg viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${SIZE}px;display:block;margin:0 auto">
      ${rings}${ringLabels}${axisLines}${reqPoly}${curPoly}${curDots}${labels}${legend}
    </svg>`;
  }

  /* ── TIMELINE RISORSE ── */
  function buildTimeline(current, profilo, activeIds, scenarioId) {
    const rows = [
      { id:'acqua',    label:'Acqua',   icon:'ph-drop',      pct:current.acqua,    val: profilo.acqua_scorte_litri ? profilo.acqua_scorte_litri+'L' : '—', nav:'acqua' },
      { id:'cibo',     label:'Cibo',    icon:'ph-fork-knife', pct:current.cibo,     val: profilo.cibo_scorte_giorni ? profilo.cibo_scorte_giorni+'gg' : '—', nav:'cibo' },
      { id:'energia',  label:'Energia', icon:'ph-lightning',  pct:current.energia,  val: current.energia+'%', nav:'energia' },
      { id:'calore',   label:'Calore',  icon:'ph-flame',      pct:current.calore,   val: current.calore+'%', nav:'riscaldamento' },
      { id:'comm',     label:'Comm.',   icon:'ph-radio',      pct:current.comm,     val: current.comm+'%', nav:'settings', tab:'comm' },
      { id:'mobilita', label:'Mobilità',icon:'ph-car',        pct:current.mobilita, val: profilo.carburante_litri ? profilo.carburante_litri+'L' : '—', nav:'carburante' },
    ];

    const done = Storage.get('task-checks') || {};
    const scenarioTasks = _scenarioTaskIds(scenarioId);

    function bestTask(axisId) {
      return ALL_TASKS
        .filter(t => t.axis === axisId && t.threats.some(tid => (activeIds||[]).includes(tid)))
        .filter(t => !scenarioTasks || scenarioTasks.has(t.id))
        .filter(t => !(t.resolve ? t.resolve(profilo) : !!done[t.id]))
        .sort((a, b) => b.scoreBonus - a.scoreBonus)[0];
    }

    return rows.map(r => {
      const cls = r.pct >= 70 ? 'good' : r.pct >= 35 ? 'warn' : 'bad';
      const onclick = r.tab
        ? `navigateTo('${r.nav}'); setTimeout(()=>SettingsModule._tab('${r.tab}'), 180)`
        : `navigateTo('${r.nav}')`;
      const next = activeIds?.length ? bestTask(r.id) : null;
      const nextHtml = next
        ? `<div class="timeline-next" onclick="event.stopPropagation(); DashboardModule.goToTask('${next.id}')">
             <i class="ph ph-arrow-elbow-right-down"></i>+${next.scoreBonus} pts · ${next.text.length > 52 ? next.text.slice(0,52)+'…' : next.text}
           </div>` : '';
      return `<div class="timeline-row" onclick="${onclick}" style="cursor:pointer" title="→ ${r.nav}">
        <div class="timeline-label"><i class="ph ${r.icon}"></i><span>${r.label}</span></div>
        <div class="timeline-bar"><div class="timeline-fill ${cls}" style="width:${r.pct}%"></div></div>
        <div class="timeline-val">${r.val}</div>
        ${nextHtml}
      </div>`;
    }).join('');
  }

  /* ── TASK CARD (shared renderer) ── */
  const AXIS_ICON = { acqua:'ph-drop', cibo:'ph-fork-knife', energia:'ph-lightning', calore:'ph-flame', comm:'ph-radio', mobilita:'ph-car' };
  const URGENCY_META = {
    critico:    { label:'CRITICO',     icon:'ph-warning-octagon' },
    urgente:    { label:'URGENTE',     icon:'ph-warning'         },
    pianificato:{ label:'PIANIFICATO', icon:'ph-clock'           },
  };

  function renderTaskCard(t) {
    const um = URGENCY_META[t.urgency];

    // Lato sinistro:
    // · field  → checkbox che scrive nel profilo (bidirezionale con Dimensioni)
    // · auto senza field → badge che guida a Dimensioni
    // · manuale → checkbox normale (task-checks)
    const leftCtrl = (t.field || !t.isAutoTask)
      ? `<label class="task-checkbox-wrap" onclick="event.stopPropagation()">
           <input type="checkbox" ${t.completed ? 'checked' : ''}
             onchange="DashboardModule.toggleTask('${t.id}', this.checked)">
           <span class="task-cb"></span>
         </label>`
      : (t.completed
          ? `<span class="task-auto-badge resolved" title="Valori in Dimensioni soddisfatti — risolto automaticamente">
               <i class="ph ph-check-circle"></i>
             </span>`
          : `<span class="task-auto-badge pending" onclick="DashboardModule.goToTask('${t.id}')"
               title="Aggiorna i valori in Dimensioni per risolvere">
               <i class="ph ph-sliders"></i>
             </span>`);

    const navIcon  = t.tab ? 'ph-sliders' : (t.guide ? 'ph-arrow-right' : 'ph-arrow-right');
    const navTitle = t.tab ? 'Aggiorna Dimensione' : 'Apri guida';

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
            <span>+${t.scoreBonus} pts ${t.axis.toUpperCase()}</span>
            ${t.isAutoTask
              ? `<span class="task-auto-label">${t.completed ? '· auto ✓' : '· aggiorna dim.'}</span>`
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
      .map(t => {
        const gap = (required[t.axis] || 0) - (current[t.axis] || 0);
        const isAutoTask = !!t.resolve;
        const completed  = isAutoTask ? t.resolve(profilo) : !!done[t.id];
        return { ...t, gap, urgency: gap > 45 ? 'critico' : gap > 20 ? 'urgente' : 'pianificato', completed, isAutoTask };
      });

    if (enriched.length === 0) {
      const noThreats = activeIds.length === 0;
      return `<div class="tasks-empty">
        <i class="ph ph-check-circle" style="font-size:2rem;color:var(--success);display:block;margin-bottom:8px"></i>
        <p>${noThreats
          ? 'Nessuna minaccia attiva — configura le impostazioni per ricevere task operative'
          : 'Tutti i requisiti soddisfatti per le minacce attive — mantieni le scorte aggiornate'}</p>
        ${noThreats ? `<button class="btn btn-outline btn-sm mt-12" onclick="navigateTo('settings')">
          <i class="ph ph-sliders"></i> Apri Dimensioni</button>` : ''}
      </div>`;
    }

    return taskView === 'focus'
      ? _buildFocus(enriched)
      : taskView === 'minacce'
        ? _buildByThreat(enriched, detected, current, required, scenarioId)
        : _buildByPriority(enriched);
  }

  /* Vista: Per Minaccia */
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

      // Gap badge: usa required specifico della threat (non scenario intero)
      const threatDef = THREATS.find(x => x.id === threat.id);
      const threatRequired = threatDef ? threatDef.required : required;
      const gapAxes = Object.keys(threatRequired)
        .map(k => ({ k, gap: Math.max(0, (threatRequired[k]||0) - (current[k]||0)) }))
        .filter(x => x.gap > 0)
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

  /* Vista: Focus — top 3 task per impatto massimo */
  function _buildFocus(enriched) {
    const top = enriched
      .filter(t => !t.completed)
      .map(t => ({ ...t, impact: Math.max(0, t.gap) * t.scoreBonus }))
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3);

    if (top.length === 0) return `<div class="tasks-empty">
      <i class="ph ph-trophy" style="font-size:2rem;color:var(--success);display:block;margin-bottom:8px"></i>
      <p>Nessun task pendente — ottimo lavoro!</p></div>`;

    return `<div class="focus-header">
        <i class="ph ph-crosshair"></i>
        Le 3 azioni con il massimo impatto sui tuoi punteggi
      </div>
      <div class="focus-tasks">${top.map((t, i) => `
        <div class="focus-rank">
          <span class="focus-num">${i + 1}</span>
          ${renderTaskCard(t)}
        </div>`).join('')}
      </div>`;
  }

  /* Vista: Per Priorità (Kanban) */
  function _buildByPriority(enriched) {
    const sorted = [...enriched].sort((a, b) => (a.completed - b.completed) || (b.gap - a.gap));
    const LEVELS = ['critico','urgente','pianificato'];
    const LMETA  = {
      critico:    { label:'CRITICO',     icon:'ph-warning-octagon' },
      urgente:    { label:'URGENTE',     icon:'ph-warning'         },
      pianificato:{ label:'PIANIFICATO', icon:'ph-clock'           },
    };
    return `<div class="priority-board">` +
      LEVELS.map(level => {
        const lt = sorted.filter(t => t.urgency === level);
        const m  = LMETA[level];
        return `<div class="priority-col">
          <div class="priority-col-header ${level}">
            <i class="ph ${m.icon}"></i><span>${m.label}</span>
            <span class="priority-col-count">${lt.length}</span>
          </div>
          ${lt.length === 0
            ? `<div class="priority-empty"><i class="ph ph-check"></i> Nessuna</div>`
            : lt.map(renderTaskCard).join('')}
        </div>`;
      }).join('') + `</div>`;
  }

  /* ── NAVIGA A DIMENSIONI + tab corretto ── */
  function goToTask(taskId) {
    const t = ALL_TASKS.find(x => x.id === taskId);
    if (!t) return;
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
    tenda:        'Tenda',
    rifugio:      'Rifugio improvvisato',
    nessun_riparo:'Senza riparo',
  };

  /* ── RENDER ── */
  function render() {
    const root = document.getElementById('dashboard-root');
    if (!root) return;

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
    const avgScore = Math.round(Object.values(current).reduce((a,b)=>a+b,0) / 6);

    const scenarioTasks = _scenarioTaskIds(scenarioId);
    const visibleTasks = ALL_TASKS
      .filter(t => t.threats.some(tid => activeIds.includes(tid)))
      .filter(t => !scenarioTasks || scenarioTasks.has(t.id));
    const completedVisible = visibleTasks.filter(t => t.resolve ? t.resolve(profilo) : !!done[t.id]).length;
    const progressPct      = visibleTasks.length > 0 ? Math.round(completedVisible / visibleTasks.length * 100) : 0;

    // Status banner
    let bannerCls = 'ok', bannerIcon = 'ph-check-circle', bannerLabel = 'PRONTO';
    if (detected.length > 0) {
      const maxGap = Math.max(...AXES.map(ax => Math.max(0, (required[ax.id]||0) - (current[ax.id]||0))));
      if (maxGap > 45) { bannerCls='danger';  bannerIcon='ph-warning-octagon'; bannerLabel='SITUAZIONE CRITICA'; }
      else if (maxGap > 20) { bannerCls='warning'; bannerIcon='ph-warning';         bannerLabel='ATTENZIONE RICHIESTA'; }
      else { bannerCls='ok'; bannerIcon='ph-check-circle'; bannerLabel='PREPARAZIONE ADEGUATA'; }
    }

    root.innerHTML = `
      <!-- STATUS -->
      <div class="status-banner ${bannerCls}">
        <i class="ph ${bannerIcon}"></i>
        <div class="status-banner-text">
          <strong>${bannerLabel}</strong>
          ${detected.length > 0 ? `— ${detected.length} minaccia/e rilevata/e` : ' — nessuna minaccia rilevata'}
          <button class="banner-scenario-chip${scenarioName ? '' : ' banner-scenario-chip-empty'}" onclick="DashboardModule.openScenarioPicker()">
            <i class="ph ${scenarioName ? 'ph-warning-octagon' : 'ph-swap'}"></i>
            ${scenarioName || 'Cambia scenario'}
          </button>
        </div>
        <div class="status-banner-score">${avgScore}<span style="font-size:0.65rem;opacity:0.7">/100</span></div>
      </div>

      <!-- PROFILO QUICK -->
      <div class="profile-quick">
        <div class="profile-chip" onclick="navigateTo('settings')" title="Modifica">
          <i class="ph ph-users"></i>${persone > 0 ? persone+' persone' : 'Configura profilo →'}
        </div>
        ${profilo.tipo_abitazione ? `<div class="profile-chip">
          <i class="ph ph-house-simple"></i>${TIPO_LABEL[profilo.tipo_abitazione] || profilo.tipo_abitazione}
        </div>` : ''}
        <div class="profile-chip">
          <i class="ph ph-thermometer"></i>${profilo.temp_now != null ? profilo.temp_now+'°C ora' : '—'}
          · min ${profilo.temp_min}° / max ${profilo.temp_max}°
        </div>
        <div class="profile-chip">
          <i class="ph ph-drop"></i>${profilo.acqua_scorte_litri||0}L acqua
        </div>
        <div class="profile-chip">
          <i class="ph ph-fork-knife"></i>${profilo.cibo_scorte_giorni||0}gg cibo
        </div>
        <button class="profile-chip profile-chip-btn" onclick="navigateTo('settings')">
          <i class="ph ph-gear"></i> Modifica
        </button>
      </div>

      <!-- MINACCE AUTO-RILEVATE -->
      <div class="card">
        <h3><i class="ph ph-target"></i> Minacce Rilevate Automaticamente</h3>
        <p class="text-secondary text-sm mb-16">
          Basate sulle impostazioni profilo — aggiorna le scorte per risolvere le minacce
        </p>
        ${detected.length === 0
          ? `<div class="threats-ok"><i class="ph ph-shield-check"></i> Nessuna minaccia critica rilevata — continua ad aggiornare le scorte</div>`
          : `<div class="threat-grid">
              ${detected.map(t => `
                <div class="threat-card threat-card-active">
                  <div class="threat-card-top">
                    <i class="ph ${t.icon}"></i>
                    <span class="threat-card-label">${t.label}</span>
                  </div>
                  <div class="threat-card-reason">${t.reason}</div>
                </div>`).join('')}
            </div>`}
      </div>

      <!-- RADAR + TIMELINE -->
      <div class="radar-timeline-grid">
        <div class="card">
          <h3><i class="ph ph-chart-polar"></i> Prontezza</h3>
          <div class="radar-container">${buildRadar(current, required)}</div>
          <div class="text-center text-xs text-secondary mt-8">
            Score medio: <span class="text-accent font-mono">${avgScore}/100</span>
          </div>
        </div>
        <div class="card">
          <h3><i class="ph ph-chart-bar"></i> Risorse</h3>
          ${buildTimeline(current, profilo, activeIds, scenarioId)}
          <button class="btn btn-outline btn-sm btn-full mt-16" onclick="navigateTo('settings')">
            <i class="ph ph-pencil"></i> Aggiorna scorte
          </button>
        </div>
      </div>

      <!-- TASK OPERATIVE -->
      <div class="card">
        <div class="task-board-header">
          <h3><i class="ph ph-list-checks"></i> Task Operative</h3>
          <div class="task-board-controls">
            <div class="task-view-toggle">
              <button class="tvt-btn${taskView === 'focus' ? ' active' : ''}"
                onclick="DashboardModule.setView('focus')" title="Top 3 task per impatto massimo">
                <i class="ph ph-crosshair"></i> Focus
              </button>
              <button class="tvt-btn${taskView === 'minacce' ? ' active' : ''}"
                onclick="DashboardModule.setView('minacce')">
                <i class="ph ph-target"></i> Minacce
              </button>
              <button class="tvt-btn${taskView === 'priorita' ? ' active' : ''}"
                onclick="DashboardModule.setView('priorita')">
                <i class="ph ph-kanban"></i> Priorità
              </button>
            </div>
            <div class="task-progress-wrap">
              <span class="task-progress-label">${completedVisible}/${visibleTasks.length}</span>
              <div class="task-progress-bar">
                <div class="task-progress-fill" style="width:${progressPct}%"></div>
              </div>
            </div>
          </div>
        </div>
        ${buildTaskBoard(current, required, activeIds, detected, done, profilo)}
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

  return { init, render, toggleTask, setView, openGuide, goToTask, openScenarioPicker, _pickScenario };
})();
