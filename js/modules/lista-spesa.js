/* ============================================================
   Modulo Lista Spesa — Dinamica per scenario e threat attive
   ============================================================ */
const ListaSpesaModule = (() => {

  /* ── Threat → sezioni che diventano priorità ── */
  const THREAT_PRIORITY = {
    acqua:      ['acqua'],
    blackout:   ['energia', 'illuminazione'],
    gas:        ['riscaldamento'],
    cibo:       ['alimentare'],
    carburante: ['mobilita'],
    freddo:     ['riscaldamento'],
    comm:       ['comunicazione'],
    medico:     ['salute'],
  };

  /* ── Extra items iniettati in sezioni esistenti per scenario ── */
  const SCENARIO_INJECT = {
    terremoto: {
      acqua: [
        { nome:'Tanica HDPE 20L extra', qty:'3 pz', note:'Rete idrica può essere contaminata post-sisma', extra:true },
        { nome:'WaterBOB (sacco per vasca 100L)', qty:'1 pz', note:'Stoccaggio rapido in emergenza', extra:true },
      ],
      salute: [
        { nome:'Casco protettivo da cantiere', qty:'1/persona', note:'Protezione da calcinacci', extra:true },
        { nome:'Guanti da lavoro anti-taglio (Kevlar)', qty:'2 paia', note:'Rimozione macerie in sicurezza', extra:true },
        { nome:'Fischietto di emergenza', qty:'1/persona', note:'Segnalazione posizione se intrappolato', extra:true },
        { nome:'Mascherina antipolvere FFP2', qty:'10 pz', note:'Polvere da macerie può contenere amianto', extra:true },
      ],
      igiene: [
        { nome:'Stivali da cantiere con puntale', qty:'1 paio/adulto', note:'Protezione piedi da macerie', extra:true },
      ],
    },
    alluvione: {
      acqua: [
        { nome:'Candeggina concentrata 5L extra', qty:'2 flaconi', note:'Decontaminazione post-alluvione', extra:true },
        { nome:'Kit test qualità acqua', qty:'1 pz', note:'Verifica potabilità fonti locali', extra:true },
      ],
      igiene: [
        { nome:'Stivali impermeabili alti (al ginocchio)', qty:'1 paio/persona', note:'Protezione da acqua contaminata', extra:true },
        { nome:'Guanti monouso in nitrile', qty:'200 pz', note:'Pulizia post-alluvione', extra:true },
        { nome:'Impermeabile integrale/poncho', qty:'1/persona', note:'', extra:true },
      ],
      documenti: [
        { nome:'Buste ZIP impermeabili grandi', qty:'10 pz', note:'Protezione documenti, telefoni, elettronica', extra:true },
        { nome:'Pompa di drenaggio 12V', qty:'1 pz', note:'Svuotare cantina/garage', extra:true },
      ],
    },
    'blackout-lungo': {
      energia: [
        { nome:'Inverter per auto 300W (12V → 220V)', qty:'1 pz', note:'Ricarica dispositivi dalla batteria auto', extra:true },
        { nome:'Carburante per generatore (tanica extra)', qty:'20L', note:'Scorta 3-5 giorni operatività', extra:true },
        { nome:'Batterie ricaricabili AA/AAA + caricatore solare', qty:'1 set', note:'Zero dipendenza da rete', extra:true },
      ],
    },
    'tempesta-invernale': {
      riscaldamento: [
        { nome:'Sale antigelo 5 kg', qty:'2 sacchi', note:'Percorsi pedonali e scalini', extra:true },
        { nome:'Pala da neve leggera (alluminio)', qty:'1 pz', note:'Liberare uscite e scaricare tetto', extra:true },
        { nome:'Termosifone a gas portatile', qty:'1 pz', note:'Solo in ambienti ventilati', extra:true },
      ],
      mobilita: [
        { nome:'Catene da neve omologate', qty:'1 set', note:'Verifica compatibilità con i tuoi pneumatici', extra:true },
        { nome:'Liquido antigelo tergicristalli -30°C', qty:'2 L', note:'', extra:true },
        { nome:'Raschietto + spazzola per neve', qty:'1 pz', note:'', extra:true },
      ],
    },
    caldo: {
      acqua: [
        { nome:'Sali per reidratazione orale (ORS)', qty:'20 bustine', note:'Prevenzione disidratazione in caldo estremo', extra:true },
        { nome:'Bottiglie spray da nebulizzazione', qty:'3 pz', note:'Raffreddamento rapido', extra:true },
      ],
      energia: [
        { nome:'Ventilatore USB ricaricabile', qty:'2 pz', note:'Funziona da power bank in caso di blackout', extra:true },
        { nome:'Tappetino raffreddante', qty:'1 pz', note:'Per bambini e anziani', extra:true },
      ],
      salute: [
        { nome:'Crema solare SPF 50+', qty:'3 flaconi', note:'Protezione durante uscite necessarie', extra:true },
        { nome:'Pulsossimetro', qty:'1 pz', note:'Monitoraggio soggetti vulnerabili', extra:true },
      ],
    },
    pandemia: {
      igiene: [
        { nome:'Mascherine FFP2/N95', qty:'50 pz', note:'Per uscite obbligate e assistenza malati', extra:true },
        { nome:'Guanti monouso in nitrile', qty:'200 pz (2 scatole)', note:'Evita contaminazione crociata', extra:true },
        { nome:'Disinfettante mani 70%+ alcool', qty:'5 L', note:'Ricarica dispenser casa/auto', extra:true },
        { nome:'Candeggina Amuchina spray', qty:'5 flaconi', note:'Disinfezione superfici toccate frequentemente', extra:true },
      ],
      salute: [
        { nome:'Pulsossimetro', qty:'1 pz', note:'Soglia allarme: saturazione O2 < 94%', extra:true },
        { nome:'Antistaminici', qty:'2 confezioni', note:'Gestione reazioni allergiche', extra:true },
        { nome:'Loperamide (antidiarroico)', qty:'2 confezioni', note:'Prevenzione disidratazione da diarrea', extra:true },
        { nome:'Sali ORS per reidratazione', qty:'20 bustine', note:'', extra:true },
      ],
    },
    'crisi-economica': {
      alimentare: [
        { nome:'Pasti liofilizzati da trekking', qty:'10 pz', note:'Leggerissimi, lunga conservazione, alto valore nutritivo', extra:true },
        { nome:'Olio di cocco', qty:'2 kg', note:'Alta densità calorica, conservazione 2 anni', extra:true },
        { nome:'Lievito secco attivo', qty:'5 confezioni', note:'Per pane fatto in casa', extra:true },
        { nome:'Semi per germogliazione', qty:'1 kit', note:'Fonte di vitamina fresca in pochi giorni', extra:true },
      ],
    },
    'incendio-zona': {
      igiene: [
        { nome:'Maschera filtrante P3/FFP3', qty:'1/persona', note:'Protezione da fumo e particolato fine (PM2.5)', extra:true },
        { nome:'Occhiali protettivi a tenuta stagna', qty:'1/persona', note:'Protezione occhi da cenere', extra:true },
      ],
    },
    evacuazione: {
      documenti: [
        { nome:'Hard disk esterno con backup dati', qty:'1 pz', note:'Foto, documenti scansionati, dati importanti', extra:true },
        { nome:'Caricabatterie multi-porta USB-C', qty:'1 pz', note:'Ricarica multipla in zone di raccolta', extra:true },
      ],
    },
  };

  /* ── Sezioni extra aggiunte intere per scenario specifico ── */
  const SCENARIO_SECTIONS = {
    pandemia: [{
      id: 'protezione-sanitaria',
      titolo: 'Protezione Sanitaria',
      priority: true,
      extra: true,
      items: [
        { nome:'Mascherine FFP2/N95', qty:'50 pz', note:'Per uscite obbligate e cura malati' },
        { nome:'Guanti monouso in nitrile', qty:'200 pz (2 scatole)', note:'Evita contaminazione crociata' },
        { nome:'Disinfettante mani 70%+ alcool', qty:'5 L', note:'Ricarica dispenser' },
        { nome:'Termometro digitale', qty:'2 pz', note:'Monitoraggio febbre quotidiano' },
        { nome:'Pulsossimetro', qty:'1 pz', note:'Soglia allarme: saturazione < 94%' },
        { nome:'Candeggina spray per superfici', qty:'5 flaconi', note:'Disinfezione superfici toccate frequentemente' },
        { nome:'Visiera/occhiali protettivi', qty:'1/adulto', note:'Protezione mucose durante l\'assistenza' },
      ],
    }],
    evacuazione: [{
      id: 'gobag',
      titolo: 'Go-Bag (72h)',
      priority: true,
      extra: true,
      items: [
        { nome:'Zaino impermeabile 30-40L', qty:'1 per adulto', note:'Già pronto vicino alla porta di uscita' },
        { nome:'Documenti originali in busta impermeabile', qty:'1 set', note:'Carta identità, passaporto, tessera sanitaria, polizze' },
        { nome:'Contanti in tagli piccoli', qty:'€300 minimo', note:'I POS non funzionano senza corrente' },
        { nome:'Medicinali personali (scorta 72h)', qty:'1 set/persona', note:'' },
        { nome:'Cambio vestiti + abbigliamento termico', qty:'2 giorni/persona', note:'' },
        { nome:'Razione cibo 72h', qty:'per ogni persona', note:'Barrette energetiche, frutta secca, conserve' },
        { nome:'Acqua 3L/persona', qty:'', note:'Bottiglia piena tenuta nel frigo go-bag' },
        { nome:'Power bank carico 20.000mAh', qty:'1 pz', note:'' },
        { nome:'Cartina stradale zona', qty:'1 pz', note:'Non dipendere dal GPS' },
        { nome:'Coperta termica di emergenza', qty:'1/persona', note:'Pesa 50g, riflette 90% calore corporeo' },
      ],
    }],
    terremoto: [{
      id: 'kit-sisma',
      titolo: 'Kit Post-Sisma',
      priority: true,
      extra: true,
      items: [
        { nome:'Casco protettivo da cantiere', qty:'1/persona', note:'Protezione da calcinacci e oggetti cadenti' },
        { nome:'Guanti da lavoro anti-taglio (Kevlar)', qty:'2 paia', note:'Rimozione macerie in sicurezza' },
        { nome:'Fischietto di emergenza', qty:'1/persona', note:'Segnalazione posizione se intrappolato' },
        { nome:'Scarpe antinfortunistiche con puntale', qty:'1 paio/adulto', note:'Protezione piedi da macerie e vetri' },
        { nome:'Mascherina antipolvere FFP2', qty:'10 pz', note:'Polvere da macerie può contenere amianto' },
        { nome:'Torcia frontale LED ricaricabile', qty:'1/persona', note:'Mani libere per muoversi tra macerie' },
        { nome:'Leva piede di porco (crowbar) 60cm', qty:'1 pz', note:'Apertura porte bloccate da deformazione' },
      ],
    }],
    alluvione: [{
      id: 'kit-alluvione',
      titolo: 'Kit Alluvione',
      priority: true,
      extra: true,
      items: [
        { nome:'Stivali impermeabili alti (al ginocchio)', qty:'1 paio/persona', note:'Protezione da acqua contaminata e biologici' },
        { nome:'Tuta integrale impermeabile (Tyvek)', qty:'2 pz', note:'Pulizia post-alluvione in ambienti contaminati' },
        { nome:'Pompa di drenaggio elettrica 12V', qty:'1 pz', note:'Svuotare cantine e garage allagati' },
        { nome:'Candeggina concentrata 5L', qty:'2 flaconi', note:'Decontaminazione superfici e oggetti' },
        { nome:'Sacchi sabbia (vuoti)', qty:'10 pz', note:'Barriera anti-acqua su soglie e finestre' },
        { nome:'Guanti monouso in nitrile', qty:'200 pz', note:'Protezione mani da contaminanti' },
      ],
    }],
    'incendio-zona': [{
      id: 'kit-incendio',
      titolo: 'Protezione Incendio',
      priority: true,
      extra: true,
      items: [
        { nome:'Maschera filtrante P3/FFP3', qty:'1/persona', note:'Protezione da fumo e PM2.5 — NON una semplice mascherina chirurgica' },
        { nome:'Occhiali protettivi a tenuta stagna', qty:'1/persona', note:'Protezione occhi da cenere e fumo' },
        { nome:'Abbigliamento in cotone/lana (no sintetici)', qty:'1 set/persona', note:'I tessuti sintetici si fondono a contatto con calore' },
        { nome:'Guanti da lavoro in pelle', qty:'1 paio/adulto', note:'Protezione termica di base' },
        { nome:'Sacchetti di sabbia', qty:'10 pz', note:'Barriera anti-fuoco su soglie' },
      ],
    }],
    'tempesta-invernale': [{
      id: 'kit-gelo',
      titolo: 'Kit Gelo / Neve',
      priority: true,
      extra: true,
      items: [
        { nome:'Catene da neve omologate', qty:'1 set', note:'Verifica compatibilità con i tuoi pneumatici prima di comprare' },
        { nome:'Sale antigelo 5 kg', qty:'2 sacchi', note:'Percorsi pedonali, scalini, rampe' },
        { nome:'Pala da neve leggera (alluminio)', qty:'1 pz', note:'Liberare uscite e scaricare neve dal tetto' },
        { nome:'Raschietto + spazzola per neve auto', qty:'1 pz', note:'' },
        { nome:'Liquido antigelo tergicristalli -30°C', qty:'2 L', note:'' },
        { nome:'Tuta termica intera (overall)', qty:'1/adulto', note:'Coperte e strati non bastano se devi uscire' },
      ],
    }],
    'survival-natura': [{
      id: 'kit-survival',
      titolo: 'Kit Survival in Natura',
      priority: true,
      extra: true,
      items: [
        { nome:'Accendino Bic × 3', qty:'3 pz', note:'Nessun tool di accensione è più affidabile — portane sempre più di uno' },
        { nome:'Acciarino ferrocerio con raschietto', qty:'1 pz', note:'Funziona bagnato, sotto zero, in quota' },
        { nome:'Fischietto di emergenza (Fox 40)', qty:'1/persona', note:'3 fischi = distress; udibile fino a 1 km' },
        { nome:'Specchio di segnalazione', qty:'1 pz', note:'Visibile fino a 15 km dall\'alto in cielo sereno' },
        { nome:'Coltello fisso con lama 10-15 cm (full tang)', qty:'1 pz', note:'Tool più versatile in survival — affilalo prima' },
        { nome:'Paracord 550 (30 metri)', qty:'1 rotolo', note:'Costruzione riparo, legature, medicazioni' },
        { nome:'Telo mylar di emergenza (bivacchetto)', qty:'2 pz', note:'Riparo, segnalazione, raccolta acqua piovana' },
        { nome:'Filtro acqua portatile Sawyer Mini', qty:'1 pz', note:'Filtra 100.000L senza cartucce da sostituire' },
        { nome:'Pastiglie Micropur (purificazione acqua)', qty:'1 confezione', note:'Backup quando non puoi bollire' },
        { nome:'Amo da pesca + filo nylon (kit)', qty:'1 kit', note:'Fonte proteica passiva — zero energie spese' },
        { nome:'Bussola baseplate (Silva o simile)', qty:'1 pz', note:'Impara ad usarla PRIMA di averne bisogno' },
        { nome:'Cartina topografica zona laminata', qty:'1 pz', note:'1:25.000 — dettaglio sentieri e curve di livello' },
        { nome:'Cerotto moleskin per vesciche', qty:'1 confezione', note:'I piedi sono il tuo mezzo di trasporto' },
        { nome:'Laccio emostatico CAT', qty:'1 pz', note:'Emorragie agli arti — applicare entro 3 min' },
        { nome:'Sacco a pelo -10°C (mummy)', qty:'1 pz', note:'Sottostima sempre le temperature notturne in quota' },
        { nome:'Tenda ultraleggera 3 stagioni', qty:'1 pz', note:'O tarp + bivy come alternativa più leggera' },
        { nome:'Pentolino titanio 750ml con coperchio', qty:'1 pz', note:'Bollire acqua + cottura cibi base' },
        { nome:'Razioni di emergenza liofilizzate', qty:'5 pz', note:'2000 kcal/giorno minimo in condizioni di stress' },
        { nome:'Kit medicazione avanzata (IFAK)', qty:'1 pz', note:'Garze emostatiche, tourniquet, chest seal, guanti' },
        { nome:'Farmaci: paracetamolo + ibuprofene + antibiotico', qty:'1 set', note:'Chiedi al medico prescrizione antibiotico di emergenza' },
      ],
    }],
    'blackout-lungo': [{
      id: 'kit-blackout-avanzato',
      titolo: 'Kit Blackout Avanzato',
      priority: true,
      extra: true,
      items: [
        { nome:'Inverter per auto 300W (12V → 220V)', qty:'1 pz', note:'Ricarica dispositivi dalla batteria auto' },
        { nome:'Carburante in tanica omologata 20L', qty:'2 taniche', note:'Scorta per generatore — rotazione ogni 6 mesi' },
        { nome:'Trattamento conservante carburante (STA-BIL)', qty:'1 flacone', note:'Stabilizza carburante per 12 mesi' },
        { nome:'Batterie ricaricabili AA/AAA (20 pz)', qty:'1 set', note:'' },
        { nome:'Caricabatterie solare per AA/AAA', qty:'1 pz', note:'Ricarica anche senza generatore' },
        { nome:'Lampada solare da giardino potente', qty:'3 pz', note:'Carica di giorno, illumina di notte' },
      ],
    }],
  };

  /* ── Sezioni base sempre presenti ── */
  function _buildBaseSezioni(profilo) {
    const acquaData = Storage.get('acqua-result');
    // Stessa regola della Home: 3 L a persona al giorno (bambini 0,7 · anziani 0,9), per 30 giorni.
    // Se l'utente ha usato il calcolatore Acqua, vale il suo risultato.
    const persPes = Math.max(1, (profilo.adulti ?? 2) + (profilo.bambini || 0) * 0.7 + (profilo.anziani || 0) * 0.9);
    const litriRac = acquaData?.litriRac || Math.ceil(persPes * Utils.WATER_L_PPD * 30);

    return [
      {
        id: 'acqua',
        titolo: 'Acqua',
        items: [
          { nome:'Acqua: ' + litriRac + ' litri in tutto', qty: Math.ceil(litriRac / 1.5) + ' bottiglie da 1,5 L', note:'Oppure ' + Math.ceil(litriRac / 10) + ' taniche alimentari da 10 L · ruota le scorte' },
          { nome:'Candeggina non profumata', qty:'3 bottiglie', note:'2 gocce/L per purificazione (4 se torbida)' },
          { nome:'Filtro portatile (Sawyer Squeeze)', qty:'1 pz', note:'Filtra qualsiasi fonte' },
          { nome:'Pastiglie purificazione', qty:'2 confezioni', note:'Backup filtro' },
        ],
      },
      {
        id: 'alimentare',
        titolo: 'Alimentare',
        items: [
          { nome:'Pasta di semola',             qty:'10 kg',  note:'Durata 3 anni' },
          { nome:'Riso bianco',                 qty:'5 kg',   note:'Durata 5 anni' },
          { nome:'Legumi secchi misti',         qty:'5 kg',   note:'Durata 5 anni' },
          { nome:'Tonno al naturale in scatola',qty:'20 latte', note:'80g cad.' },
          { nome:'Passata di pomodoro',         qty:'10 L',   note:'1L bottiglie o tetrapak' },
          { nome:'Olio extravergine di oliva',  qty:'5 L',    note:'' },
          { nome:'Zucchero bianco',             qty:'3 kg',   note:'Durata indefinita' },
          { nome:'Sale fino',                   qty:'2 kg',   note:'Durata indefinita' },
          { nome:'Miele',                       qty:'2 kg',   note:'Durata indefinita' },
          { nome:'Frutta secca mista',          qty:'2 kg',   note:'Alta densità calorica' },
          { nome:'Cioccolato fondente 80%',     qty:'1 kg',   note:'' },
          { nome:'Latte UHT intero',            qty:'12 L',   note:'Durata 6 mesi' },
          { nome:'Crackers/gallette di riso',   qty:'2 kg',   note:'' },
          { nome:'Multivitaminici',             qty:'3 confezioni', note:'90 giorni di integrazione' },
          { nome:'Farina 00',                   qty:'5 kg',   note:'Per pane e prodotti fatti in casa' },
          { nome:'Apriscatole manuale robusto', qty:'2 pz',   note:'FONDAMENTALE' },
        ],
      },
      {
        id: 'illuminazione',
        titolo: 'Illuminazione',
        items: [
          { nome:'Torce LED ricaricabili',               qty:'3 pz',              note:'1 per persona' },
          { nome:'Torcia frontale LED',                  qty:'1/persona',         note:'Mani libere' },
          { nome:'Batterie AA (scorta)',                  qty:'24 pz',             note:'' },
          { nome:'Batterie AAA (scorta)',                 qty:'12 pz',             note:'' },
          { nome:'Candele bianche (scorta)',              qty:'50 pz',             note:'' },
          { nome:'Lanterne solari ricaricabili',          qty:'2 pz',              note:'0 costi operativi' },
          { nome:'Accendino + fiammiferi impermeabili',   qty:'5 pz + 1 scatola', note:'' },
        ],
      },
      {
        id: 'energia',
        titolo: 'Energia',
        items: [
          { nome:'Power bank 20.000mAh',           qty:'2 pz', note:'Ricarica telefoni' },
          { nome:'Pannello solare portatile 100W', qty:'1 pz', note:'Ricarica batterie e power bank' },
          { nome:'Rilevatore CO + gas',            qty:'1 pz', note:'OBBLIGATORIO se usi combustibili al chiuso' },
          { nome:'Prolunga schermata + multipresa',qty:'1 pz', note:'' },
        ],
      },
      {
        id: 'comunicazione',
        titolo: 'Comunicazione',
        items: [
          { nome:'Radio FM/AM a pile o manovella', qty:'1 pz',     note:'Info emergenza senza internet' },
          { nome:'Walkie-talkie PMR446 (coppia)',  qty:'1 coppia', note:'Concordate canale e codice in famiglia' },
          { nome:'SIM prepagata con credito',      qty:'1 pz',     note:'Rete alternativa in roaming' },
        ],
      },
      {
        id: 'salute',
        titolo: 'Primo Soccorso & Salute',
        items: [
          { nome:'Kit primo soccorso completo',   qty:'1 pz',          note:'Garze, bende, laccio emostatico, forbici, cerotti' },
          { nome:'Paracetamolo 500mg',            qty:'3 confezioni',  note:'' },
          { nome:'Ibuprofene 400mg',              qty:'3 confezioni',  note:'' },
          { nome:'Antisettico (betadine/alcool)', qty:'2 flaconi',     note:'' },
          { nome:'Cerotti assortiti',             qty:'3 confezioni',  note:'' },
          { nome:'Termometro digitale',           qty:'1 pz',          note:'' },
          { nome:'Farmaci personali (scorta)',    qty:'3 mesi',        note:'Chiedi al medico la prescrizione anticipata' },
        ],
      },
      {
        id: 'riscaldamento',
        titolo: 'Riscaldamento & Cucina',
        items: [
          { nome:'Coperte termiche di emergenza',  qty:'4 pz',  note:'Riflettono 90% del calore corporeo' },
          { nome:'Fornello da campeggio a gas',    qty:'1 pz',  note:'' },
          { nome:'Bombole gas campeggio 230g',     qty:'10 pz', note:'~1h cottura ciascuna' },
          { nome:'Pentola a pressione',            qty:'1 pz',  note:'Dimezza i tempi di cottura — risparmio gas' },
        ],
      },
      {
        id: 'igiene',
        titolo: 'Igiene',
        items: [
          { nome:'Sapone solido',              qty:'10 pz',             note:'Durata lunga, non scade' },
          { nome:'Salviettine umidificate',    qty:'10 confezioni',     note:'Igiene senza acqua' },
          { nome:'Carta igienica',            qty:'1 pacco grande',    note:'3 mesi circa' },
          { nome:'Dentifricio + spazzolini',  qty:'3 mesi',            note:'' },
          { nome:'Alcool isopropilico 70%',   qty:'2 L',               note:'Disinfezione superfici e oggetti' },
        ],
      },
      {
        id: 'mobilita',
        titolo: 'Mobilità',
        items: [
          { nome:'Tanica carburante omologata 20L',         qty:'1 pz',    note:'Verifica materiale: PE (benzina) vs acciaio (diesel)' },
          { nome:'Trattamento conservante carburante (STA-BIL)', qty:'1 flacone', note:'Mantiene carburante fino a 12 mesi' },
          { nome:'Triangoli riflettenti + giubbotto',       qty:'1 kit',   note:'Obbligatorio per legge' },
          { nome:'Mappe offline (Maps.me)',                 qty:'1 app',   note:'Scarica la zona in anticipo' },
        ],
      },
      {
        id: 'documenti',
        titolo: 'Documenti & Finanza',
        items: [
          { nome:'Busta impermeabile per documenti', qty:'1 pz',   note:'' },
          { nome:'Contanti in tagli piccoli',        qty:'€500+',  note:'Bancomat e POS inutili senza elettricità' },
          { nome:'Cartina stradale zona',            qty:'1 pz',   note:'Funziona senza GPS e batteria' },
        ],
      },
    ];
  }

  /* ── Ottieni threats attive da scenario ── */
  function _getActiveThreats(profilo) {
    const scenarioId = profilo.scenario_id;
    if (!scenarioId) return [];
    if (scenarioId === 'custom') return profilo.custom_threats || [];
    return window.SCENARI_LIST?.find(s => s.id === scenarioId)?.threats || [];
  }

  /* ── Genera lista completa ── */
  function generateList() {
    const profilo     = typeof SettingsModule !== 'undefined' ? SettingsModule.get() : {};
    const scenarioId  = profilo.scenario_id;
    const activeThreats = _getActiveThreats(profilo);

    // Sezioni base
    const sezioni = _buildBaseSezioni(profilo);
    // Le quantità di cibo erano pensate per 2-3 persone: le adatto alle persone del profilo
    const persone = Math.max(1, (profilo.adulti ?? 2) + (profilo.bambini || 0) + (profilo.anziani || 0));
    const fattore = persone / 2.5;
    const scala = q => {
      const m = /^(\d+(?:[.,]\d+)?)\s+(.*)$/.exec(q || '');
      if (!m || /\/|persona/.test(q)) return q;
      return Math.max(1, Math.ceil(parseFloat(m[1].replace(',', '.')) * fattore)) + ' ' + m[2];
    };
    sezioni.filter(x => x.id === 'alimentare').forEach(x => x.items.forEach(it => { it.qty = scala(it.qty); }));

    // Marca priorità in base alle threat attive
    const priorityIds = new Set();
    activeThreats.forEach(t => (THREAT_PRIORITY[t] || []).forEach(sid => priorityIds.add(sid)));
    sezioni.forEach(s => { s.priority = priorityIds.has(s.id); });

    // Inietta extra items per scenario
    if (scenarioId && SCENARIO_INJECT[scenarioId]) {
      const injectMap = SCENARIO_INJECT[scenarioId];
      sezioni.forEach(s => {
        if (injectMap[s.id]) {
          s.extraItems = injectMap[s.id];
          s.priority = true;
        }
      });
    }

    // Sezioni extra specifiche per scenario (prepend)
    const extraSections = (scenarioId && SCENARIO_SECTIONS[scenarioId])
      ? SCENARIO_SECTIONS[scenarioId]
      : [];

    // Ordina: priority first, poi le altre
    const sorted = [
      ...sezioni.filter(s => s.priority),
      ...sezioni.filter(s => !s.priority),
    ];

    // Nome scenario
    const scenarioName = !scenarioId ? null
      : scenarioId === 'custom' ? 'Scenario Personalizzato'
      : (window.SCENARI_LIST?.find(s => s.id === scenarioId)?.titolo || scenarioId);

    return { sezioni: [...extraSections, ...sorted], scenarioId, scenarioName, activeThreats };
  }

  /* ── Render singola sezione ── */
  function _renderSezione(s) {
    const allItems = [
      ...(s.items || []).map(i => ({ ...i, extra: false })),
      ...(s.extraItems || []),
    ];

    const rows = allItems.map(i => `
      <div class="shop-item${i.extra ? ' shop-item-extra' : ''}">
        <div>
          <div class="shop-item-name">
            ${i.extra ? '<i class="ph ph-star ls-extra-icon"></i>' : ''}${i.nome}
          </div>
          ${i.note ? `<div class="shop-item-note">${i.note}</div>` : ''}
        </div>
        <div class="shop-item-qty">${i.qty}</div>
      </div>`).join('');

    return `
      <div class="shop-category${s.priority ? ' ls-priority' : ''}${s.extra ? ' ls-section-extra' : ''}">
        <div class="shop-category-title">
          ${s.titolo}
          ${s.priority ? '<span class="ls-priority-badge">PRIORITÀ</span>' : ''}
          ${s.extra ? '<span class="ls-scenario-badge">SCENARIO</span>' : ''}
        </div>
        ${rows}
      </div>`;
  }

  /* ── RENDER ── */
  function render() {
    const root = document.getElementById('lista-spesa-root');
    if (!root) return;

    const { sezioni, scenarioId, scenarioName, activeThreats } = generateList();
    const hasData = Storage.get('acqua-result') || Storage.get('cibo-result');

    const scenarioBanner = scenarioName
      ? `<div class="alert alert-warning mb-12">
          <i class="ph ph-warning-octagon"></i>
          <div><strong>Lista adatta a: ${scenarioName}</strong>
            <br><span style="font-size:0.8rem;opacity:0.8">In cima trovi le voci più importanti per questo scenario. Le voci con ★ servono solo per questo scenario.</span>
          </div>
          <button class="btn btn-outline btn-sm" onclick="navigateTo('settings')" style="margin-left:auto;white-space:nowrap;flex-shrink:0">
            <i class="ph ph-sliders"></i> Cambia
          </button>
        </div>`
      : (!hasData
          ? `<div class="alert alert-info mb-12">
              <i class="ph ph-info"></i>
              <div>Lista per 30 giorni, calcolata sulle persone del tuo Profilo. Scegli uno <strong>scenario</strong> per aggiungere le voci specifiche.
                <button class="btn btn-outline btn-sm mt-8" onclick="navigateTo('settings')">
                  <i class="ph ph-warning-octagon"></i> Seleziona scenario
                </button>
              </div>
            </div>`
          : `<div class="alert alert-success mb-12">
              <i class="ph ph-check-circle"></i>
              <div>Lista generata con i tuoi dati. Seleziona uno <strong>scenario</strong> per aggiungere priorità e item specifici.</div>
            </div>`);

    root.innerHTML = `
      ${scenarioBanner}

      <div class="flex gap-8 mb-16">
        <button class="btn btn-secondary" onclick="ListaSpesaModule.print()">
          <i class="ph ph-printer"></i> Stampa
        </button>
        <button class="btn btn-primary" onclick="ListaSpesaModule.savePdf()">
          <i class="ph ph-file-pdf"></i> Salva PDF
        </button>
        <button class="btn btn-outline" onclick="ListaSpesaModule.copyText()">
          <i class="ph ph-clipboard-text"></i> Copia testo
        </button>
      </div>
      <p id="ls-pdf-hint" class="guide-pdf-hint hidden">
        <i class="ph ph-info"></i> Nella finestra che si apre, imposta <strong>Destinazione → Salva come PDF</strong> e clicca Salva.
      </p>

      <div id="ls-content">
        ${sezioni.map(_renderSezione).join('')}
      </div>

      <div class="card mt-16">
        <h3>💡 Dove Comprare</h3>
        <div class="result-row"><span class="result-label">Cibo a lunga conservazione</span><span class="result-value text-sm">Supermercati, ingrosso, Amazon</span></div>
        <div class="result-row"><span class="result-label">Taniche e contenitori</span><span class="result-value text-sm">Ferramenta, Amazon, negozi campeggio</span></div>
        <div class="result-row"><span class="result-label">Kit primo soccorso</span><span class="result-value text-sm">Farmacia, Amazon</span></div>
        <div class="result-row"><span class="result-label">Attrezzatura outdoor / DPI</span><span class="result-value text-sm">Decathlon, Amazon, negozi outdoor</span></div>
        <div class="result-row"><span class="result-label">Energia e pannelli</span><span class="result-value text-sm">Amazon, Leroy Merlin, negozi elettronica</span></div>
        <div class="result-row"><span class="result-label">Catene, pala, sale</span><span class="result-value text-sm">Leroy Merlin, Bricoman, Amazon</span></div>
      </div>
    `;
  }

  function print() {
    const section = document.getElementById('section-lista-spesa');
    section.classList.add('print-target');
    window.print();
    section.classList.remove('print-target');
  }

  function savePdf() {
    const hint = document.getElementById('ls-pdf-hint');
    if (hint) {
      hint.classList.remove('hidden');
      setTimeout(() => hint.classList.add('hidden'), 8000);
    }
    const { scenarioName } = generateList();
    const prevTitle = document.title;
    document.title = scenarioName
      ? `Rebel-Survival-Spesa-${scenarioName.replace(/\s+/g, '-')}`
      : 'Rebel-Survival-Lista-Spesa';
    const section = document.getElementById('section-lista-spesa');
    section.classList.add('print-target');
    setTimeout(() => {
      window.print();
      section.classList.remove('print-target');
      const restore = () => { document.title = prevTitle; window.removeEventListener('afterprint', restore); };
      window.addEventListener('afterprint', restore);
    }, 150);
  }

  function copyText() {
    const { sezioni, scenarioName, activeThreats } = generateList();
    let text = 'LISTA SPESA EMERGENZA\n';
    if (scenarioName) {
      text += `Scenario: ${scenarioName}`;
      if (activeThreats.length) text += ` | Minacce: ${activeThreats.join(', ')}`;
      text += '\n';
    }
    text += '\n';
    sezioni.forEach(s => {
      text += `\n${s.titolo}${s.priority ? ' [PRIORITÀ]' : ''}\n`;
      text += '─'.repeat(35) + '\n';
      const allItems = [...(s.items || []), ...(s.extraItems || [])];
      allItems.forEach(i => {
        text += `${i.extra ? '★' : '□'} ${i.nome} — ${i.qty}`;
        if (i.note) text += ` (${i.note})`;
        text += '\n';
      });
    });
    navigator.clipboard?.writeText(text).then(() => {
      alert('Lista copiata negli appunti!');
    }).catch(() => alert('Usa il tasto Stampa per salvare la lista.'));
  }

  function init() {
    const root = document.getElementById('lista-spesa-root');
    if (!root) return;
    render();
  }

  return { init, print, savePdf, copyText };
})();
