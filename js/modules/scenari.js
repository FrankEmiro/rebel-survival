/* ============================================================
   Modulo Scenari — Piani d'azione per emergenza
   ============================================================ */
const ScenariModule = (() => {
  let initialized = false;

  const SCENARI = [
    {
      id: 'blackout-breve',
      titolo: 'Blackout Breve',
      icon: '⚡',
      desc: 'Interruzione elettricità < 24 ore',
      severity: 1,
      threats: ['blackout'],
      required: { acqua:30, cibo:40, energia:65, calore:40, comm:55, mobilita:20 },
      taskMap: {
        blackout: ['en01','en02','en03','en04','en05','si01','bbs01','bbs02','bbs03'],
      },
      steps: [
        { fase: 'IMMEDIATO (0-30 min)', azioni: [
          'Verifica se il blackout è solo tuo (controlla altri edifici)',
          'Chiama il numero guasti del tuo fornitore elettrico',
          'Spegni gli elettrodomestici principali (lascia un interruttore ON per sapere quando torna)',
          'Accendi torcia/lanterna solare',
          'Non aprire frigorifero/congelatore inutilmente (mantiene freddo 4-6h)',
        ]},
        { fase: 'SE DURA (> 2 ore)', azioni: [
          'Sposta cibo frigo in luogo fresco/cantina se disponibile',
          'Carica smartphone con power bank',
          'Sintonizza radio FM per aggiornamenti',
          'Avvisa familiari e vicini anziani',
        ]},
        { fase: 'SICUREZZA', azioni: [
          'NON usare generatori/stufe a gas al chiuso',
          'Attenzione ai semafori spenti (comportati come stop)',
          'Se hai apparecchiature mediche: attiva protocollo emergenza',
        ]},
      ]
    },
    {
      id: 'blackout-lungo',
      titolo: 'Blackout Prolungato',
      icon: '🔴',
      desc: 'Interruzione elettricità > 24 ore',
      severity: 2,
      threats: ['blackout', 'cibo', 'comm'],
      required: { acqua:55, cibo:70, energia:85, calore:65, comm:75, mobilita:40 },
      taskMap: {
        blackout: ['en01','en02','en03','en04','en05','si01','blt01','blt02','blt03'],
        cibo:    ['ci01','ci02','ci03','ci04'],
        comm:    ['co01','co02','co03','co04','si02','blt04'],
      },
      steps: [
        { fase: 'PRIME 24 ORE', azioni: [
          'Attiva fonte energetica alternativa (generatore, pannelli, batteria)',
          'Priorità consumi: frigorifero, pompa acqua, carica dispositivi, illuminazione',
          'Svuota e consuma il cibo fresco prima che si deteriori',
          'Fai scorta di acqua (riempi vasche, secchi) se hai ancora acqua corrente',
          'Carica tutti i dispositivi e power bank',
          'Sintonizza radio per aggiornamenti ufficiali',
        ]},
        { fase: 'GIORNI 2-7', azioni: [
          'Raziona il carburante del generatore: usa solo ore necessarie',
          'Organizza turni con vicini se hai generatore',
          'Monitora temperature esterne: rischio gelo o caldo estremo',
          'Verifica scorte cibo e acqua',
          'Limita apertura frigorifero/congelatore',
          'Tieni aggiornati i contatti di emergenza',
        ]},
        { fase: 'OLTRE 7 GIORNI', azioni: [
          'Valuta evacuazione se non hai risorse sufficienti',
          'Contatta protezione civile locale',
          'Organizza con comunità locale per risorse condivise',
          'Riduci riscaldamento/raffrescamento: coperte, strati di abbigliamento',
          'Usa cottura solare o a gas per preservare carburante',
        ]},
        { fase: 'SICUREZZA', azioni: [
          'Rilevatore CO sempre attivo se usi combustibili',
          'Non usare candele incustodite',
          'Mantieni estintore a portata',
          'Generatore: avvelenamento da monossido (CO) — mal di testa, nausea, sonnolenza = esci subito all\'aria aperta e chiama il 112',
        ]},
      ]
    },
    {
      id: 'gas',
      titolo: 'Interruzione Gas',
      icon: '🔥',
      desc: 'Stop fornitura gas metano',
      severity: 2,
      threats: ['gas'],
      required: { acqua:40, cibo:65, energia:55, calore:90, comm:40, mobilita:35 },
      taskMap: {
        gas: ['ca01','ca02','gas01','gas02','gas03'],
      },
      steps: [
        { fase: 'IMMEDIATO', azioni: [
          'ODORE DI GAS? NON toccare interruttori, NON accendere fiamme, NON usare il telefono in casa',
          'Se senti odore di gas: apri le finestre, esci all\'aperto e chiama il 115 (Vigili del Fuoco) da fuori',
          'Se non senti odore: chiudi il rubinetto gas principale',
          'Verifica se interruzione è locale o diffusa (chiama il numero del tuo distributore)',
        ]},
        { fase: 'RISCALDAMENTO ALTERNATIVO', azioni: [
          'Attiva stufa a pellet/legna se disponibile',
          'Stufa a GPL/gas: solo in ambienti ventilati e mai accesa mentre dormi (monossido di carbonio)',
          'Concentra le persone in una stanza sola e riscalda quella',
          'Usa coperte termiche, abbigliamento a strati',
          'Isola porte e finestre con tessuti/nastro',
        ]},
        { fase: 'ACQUA CALDA & CUCINA', azioni: [
          'Fornello da campeggio o a GPL per cucinare',
          'Acqua calda: riscalda pentole sul fornello alternativo',
          'Riduci le docce: lavati con poca acqua tiepida',
          'Non usare mai barbecue o braciere in casa',
        ]},
      ]
    },
    {
      id: 'razionamento',
      titolo: 'Razionamento Energetico',
      icon: '⏱',
      desc: 'Fasce orarie limitate (es. 6h/giorno)',
      severity: 2,
      threats: ['blackout', 'cibo'],
      required: { acqua:45, cibo:70, energia:80, calore:50, comm:50, mobilita:25 },
      taskMap: {
        blackout: ['en01','en02','en03','en04','en05','si01','raz01','raz03'],
        cibo:    ['ci01','ci02','ci03','ci04','raz02','raz04'],
      },
      steps: [
        { fase: 'PIANIFICAZIONE FASCE', azioni: [
          'Identifica le fasce orarie con energia disponibile',
          'Programma lavatrice, lavastoviglie nelle fasce',
          'Ricarica tutti i dispositivi durante le fasce',
          'Cuoci cibo in grandi quantità durante le fasce (risotto, zuppe)',
          'Carica batterie ausiliarie e power bank',
        ]},
        { fase: 'FUORI FASCIA', azioni: [
          'Usa illuminazione a batteria/solare',
          'Evita apertura frigo (pianifica pasti prima)',
          'Lavora offline se possibile',
          'Attività che non richiedono energia: lettura, giochi',
        ]},
        { fase: 'OTTIMIZZAZIONE', azioni: [
          'Disconnetti stand-by di tutti gli apparecchi',
          'LED invece di qualsiasi altra lampada',
          'Frigorifero regolato a 5°C: più freddo non serve e consuma di più',
          'Cucina a pressione: dimezza i tempi e il gas',
        ]},
      ]
    },
    {
      id: 'cibo',
      titolo: 'Interruzione Forniture Alimentari',
      icon: '🥫',
      desc: 'Scaffali vuoti, prezzi alle stelle',
      severity: 2,
      threats: ['cibo'],
      required: { acqua:60, cibo:90, energia:45, calore:45, comm:40, mobilita:45 },
      taskMap: {
        cibo: ['ci01','ci02','ci03','ci04','cib01','cib02','cib03','cib04'],
      },
      steps: [
        { fase: 'IMMEDIATO', azioni: [
          'Attiva le scorte già preparate: non fare scorte in preda al panico',
          'NON sprecare cibo: pianifica i pasti',
          'Dai priorità al cibo fresco (si deteriora prima)',
          'Contatta rete locale (vicini, cooperative, gruppi acquisto)',
        ]},
        { fase: 'GESTIONE SCORTE', azioni: [
          'Schedula un menù settimanale basato su quello che hai',
          'Integra con caccia/pesca/raccolta se sei in zona rurale',
          'Avvia orto d\'emergenza (semina rapida: ravanelli 3 sett., lattuga 4 sett.)',
          'Conserva bucce e scarti vegetali per brodo',
          'Fai fermentare verdure (kimchi semplice, crauti)',
        ]},
        { fase: 'RETE COMUNITARIA', azioni: [
          'Organizza acquisti collettivi con vicini',
          'Scambia eccedenze con la comunità locale',
          'Identifica agricoltori locali per acquisto diretto',
          'Contatta Protezione Civile per distribuzione aiuti',
        ]},
      ]
    },
    {
      id: 'acqua',
      titolo: 'Emergenza Acqua',
      icon: '💧',
      desc: 'Acquedotto interrotto o non potabile',
      severity: 3,
      threats: ['acqua', 'cibo'],
      required: { acqua:90, cibo:60, energia:45, calore:35, comm:40, mobilita:30 },
      taskMap: {
        acqua: ['ac01','ac02','ac03','ac04','acq01','acq02','acq03','acq04'],
        cibo:  ['ci01','ci02','ci03','ci04'],
      },
      steps: [
        { fase: 'IMMEDIATO', azioni: [
          'Riempi vasche da bagno, secchi, contenitori disponibili',
          'NON usare acqua del rubinetto se dichiarata non potabile',
          'Attiva scorte di acqua in bottiglia',
          'Identifica fonti alternative: pozzo, torrente, raccolta pioggia',
        ]},
        { fase: 'RAZIONAMENTO', azioni: [
          'Minimo vitale: 3 L/persona/giorno tra bere e cucinare',
          'Usa acqua sporca per WC e pulizie',
          'Igiene personale: minima quantità (1L/giorno per igiene)',
          'Usare salviettine umidificate per risparmio',
          'Cucina: usa acqua di cottura pasta per altre cotture',
        ]},
        { fase: 'PURIFICAZIONE', azioni: [
          'Bolli acqua da fonti naturali: 1 minuto a 100°C',
          'Usa filtro portatile (Sawyer, LifeStraw, etc.)',
          'Candeggina: 8 gocce per litro, attendi 30 min',
          'Solarizzazione SODIS: bottiglia PET al sole 6 ore',
          'NON bere acqua da fiumi in aree industriali',
        ]},
      ]
    },
    {
      id: 'evacuazione',
      titolo: 'Evacuazione Rapida',
      icon: '🚗',
      desc: 'Devi lasciare casa in 30-60 minuti',
      severity: 3,
      threats: ['carburante', 'acqua', 'cibo', 'comm'],
      required: { acqua:70, cibo:75, energia:60, calore:50, comm:80, mobilita:85 },
      taskMap: {
        carburante: ['mo02','eva01','eva02','eva03','eva04'],
        acqua:      ['ac01','ac02','ac04'],
        cibo:       ['ci01','ci02','ci04'],
        comm:       ['co01','co02','co03','co04','si02'],
      },
      steps: [
        { fase: 'PRIMI 10 MINUTI', azioni: [
          'Prendi lo zaino d\'emergenza, se ce l\'hai già pronto',
          'Documenti: passaporto, carta identità, tessera sanitaria',
          'Farmaci salvavita (propri e familiari)',
          'Telefono carico + powerbank',
          'Contanti (i bancomat potrebbero non funzionare)',
          'Chiavi di casa/auto',
        ]},
        { fase: 'ENTRO 30 MINUTI', azioni: [
          'Acqua: almeno 3L per persona',
          'Cibo per 72 ore: barrette, frutta secca, conserve',
          'Cambio vestiti + abbigliamento termico',
          'Medicinali base e kit primo soccorso',
          'Documenti bancari, polizze assicurative (foto sul telefono)',
          'Caricabatterie per tutti i dispositivi',
        ]},
        { fase: 'DESTINAZIONE & COMUNICAZIONE', azioni: [
          'Avvisa un familiare fuori zona della tua destinazione',
          'Vai al punto di raccolta designato oppure da parenti/amici',
          'Segui indicazioni protezione civile: non improvvisare',
          'Se hai animali domestici, portali con te',
          'Chiudi gas e corrente se hai ancora 1-2 minuti',
        ]},
      ]
    },
    {
      id: 'terremoto',
      titolo: 'Terremoto',
      icon: '🏚️',
      desc: 'Sisma significativo — danni strutturali possibili',
      severity: 3,
      threats: ['blackout', 'acqua', 'cibo', 'freddo', 'comm', 'carburante'],
      required: { acqua:85, cibo:75, energia:70, calore:65, comm:80, mobilita:75 },
      taskMap: {
        blackout:   ['en02','en03','en04','en05'],
        acqua:      ['ac01','ac02','ac03','ac04','ter04'],
        cibo:       ['ci01','ci02','ci04'],
        freddo:     ['ca02','ca03','ca04'],
        comm:       ['co01','co02','co03','co04','si02'],
        carburante: ['mo01','mo02','mo03','mo04','mo05','ter01','ter02','ter03'],
      },
      steps: [
        { fase: 'DURANTE LA SCOSSA', azioni: [
          'Riparati sotto un tavolo robusto o nel vano di una porta portante',
          'Allontanati da finestre, specchi, mobili alti e lampadari',
          'NON uscire di corsa durante la scossa',
          'Se sei in auto: fermati lontano da edifici, ponti, cavalcavia',
          'Se sei all\'aperto: allontanati da edifici, alberi, linee elettriche',
        ]},
        { fase: 'DOPO LA SCOSSA', azioni: [
          'Verifica ferite su te stesso e chi è vicino — primo soccorso',
          'Chiudi immediatamente gas, elettricità, acqua (rubinetti principali)',
          'NON usare fiamme, interruttori, ascensori',
          'Esci dall\'edificio con calma usando le scale — mai l\'ascensore',
          'Indossa scarpe robuste (protezione da vetri e macerie)',
          'Porta kit emergenza, farmaci, documenti e acqua',
        ]},
        { fase: 'NELLE ORE SUCCESSIVE', azioni: [
          'Allontanati dall\'edificio: rischio scosse di assestamento',
          'NON rientrare senza il via libera delle autorità',
          'Sintonizza radio per aggiornamenti ufficiali',
          'Avvisa familiari della tua situazione',
          'Non usare telefono se non strettamente necessario (linee intasate)',
          'Da fuori, guarda l\'edificio: crepe, pezzi pericolanti. Non rientrare a controllare',
        ]},
        { fase: 'SICUREZZA CONTINUA', azioni: [
          'Prepara acqua (la rete idrica può essere contaminata)',
          'Attendi istruzioni su potabilità acqua',
          'Gestisci scorte cibo: priorità a quello già aperto/fresco',
          'Contribuisci ai soccorsi locali solo se sei in sicurezza',
        ]},
      ]
    },
    {
      id: 'alluvione',
      titolo: 'Alluvione',
      icon: '🌊',
      desc: 'Esondazione o rischio allagamento zona',
      severity: 3,
      threats: ['acqua', 'cibo', 'comm', 'carburante'],
      required: { acqua:85, cibo:70, energia:60, calore:40, comm:75, mobilita:70 },
      taskMap: {
        acqua:      ['ac01','ac02','ac03','ac04','all01','all03'],
        cibo:       ['ci01','ci02','ci04','all02','all04'],
        comm:       ['co01','co02','co03','co04','si02'],
        carburante: ['mo01','mo02','mo03','mo04','mo05'],
      },
      steps: [
        { fase: 'PREALLARME (allerta meteo)', azioni: [
          'Monitora canali ufficiali: protezione civile, comune, allertameteo.gov.it',
          'Porta oggetti di valore ai piani alti',
          'Disconnetti elettrodomestici dalle prese a pianterreno',
          'Prepara go-bag: documenti, farmaci, acqua, contanti',
          'Fai il pieno di carburante preventivamente',
          'Avvisa familiari e vicini del rischio',
        ]},
        { fase: 'DURANTE L\'EVENTO', azioni: [
          'NON scendere in cantina o garage se l\'acqua sale',
          'NON attraversare a piedi correnti d\'acqua (anche 30cm sono pericolosi)',
          'NON mettere in moto l\'auto se la strada è allagata',
          'Sali ai piani superiori — non al tetto (rischio trappola)',
          'Stacca la corrente dal quadro PRIMA che l\'acqua arrivi — mai con i piedi nell\'acqua',
          'Segnala la tua posizione con luce e rumore se sei bloccato',
        ]},
        { fase: 'DOPO L\'ALLUVIONE', azioni: [
          'NON bere acqua del rubinetto fino a bonifica confermata',
          'Usa guanti e stivali impermeabili per gli spostamenti nel fango',
          'Attenzione a gas (perdite), elettricità e strutture indebolite',
          'Documenta i danni con foto per assicurazione',
          'Disinfetta ogni superficie e oggetto entrato in contatto con l\'acqua',
          'Segnala pozzi e cisterne contaminati alle autorità',
        ]},
      ]
    },
    {
      id: 'caldo',
      titolo: 'Ondata di Caldo',
      icon: '☀️',
      desc: 'Temperature estreme (> 38°C) per più giorni',
      severity: 2,
      threats: ['acqua', 'blackout', 'medico'],
      required: { acqua:80, cibo:55, energia:65, calore:30, comm:60, mobilita:45 },
      taskMap: {
        acqua:   ['ac01','ac02','ac03','ac04','cal03'],
        blackout:['en01','en02','en03','en04','en05','si01'],
        medico:  ['me01','me02','me03','co03','cal01','cal02'],
      },
      steps: [
        { fase: 'PROTEZIONE PERSONALE', azioni: [
          'Bevi spesso, almeno 2-3 L al giorno — non aspettare la sete',
          'Rimani al chiuso nelle ore più calde (11:00–17:00)',
          'Chiudi tapparelle e tende dal lato soleggiato — riapri di notte',
          'Indossa abbigliamento leggero, chiaro, traspirante',
          'Docce fredde frequenti o bagni freschi',
          'NON fare attività fisica intensa nelle ore calde',
        ]},
        { fase: 'GESTIONE DOMESTICA', azioni: [
          'Ottimizza il climatizzatore: 26°C è il minimo efficiente',
          'Se manca il clima: ventilatori + panni umidi sul collo/polsi',
          'Prepara acqua fresca in frigorifero (non ghiacciata — shock termico)',
          'Crea corrente d\'aria cross-ventilazione notturna (finestre opposte)',
          'Riduci fonti di calore: forni, asciugatrici, incandescenza',
        ]},
        { fase: 'SOGGETTI VULNERABILI', azioni: [
          'Controlla anziani soli ogni 1-2 ore nelle ore di picco',
          'Bambini e neonati: mai lasciati in auto, mai esposizione diretta al sole',
          'Persone con patologie cardiache/renali: contatta il medico per piano',
          'Segni di colpo di calore: confusione, pelle secca e rossa, T° > 40°C — EMERGENZA',
          'Colpo di calore: chiama subito il 118, nel frattempo raffredda con acqua fredda e all\'ombra',
        ]},
        { fase: 'RAZIONAMENTO ENERGETICO', azioni: [
          'Evita elettrodomestici ad alto consumo nelle fasce di picco (14-17)',
          'Prepara scorte acqua: le reti idriche possono cedere in caldo estremo',
          'Tieni power bank carichi in caso di blackout da sovraccarico rete',
        ]},
      ]
    },
    {
      id: 'tempesta-invernale',
      titolo: 'Tempesta Invernale',
      icon: '❄️',
      desc: 'Gelo estremo, neve abbondante, strade bloccate',
      severity: 2,
      threats: ['acqua', 'blackout', 'freddo', 'carburante'],
      required: { acqua:70, cibo:70, energia:80, calore:90, comm:65, mobilita:65 },
      taskMap: {
        acqua:      ['ac01','ac02','ac03','ac04','tem03'],
        blackout:   ['en01','en02','en03','en04','en05','si01','tem02'],
        freddo:     ['ca01','ca02','ca03','ca04','tem01'],
        carburante: ['mo01','mo02','mo03','mo04','mo05'],
      },
      steps: [
        { fase: 'PRIMA DELLA TEMPESTA', azioni: [
          'Scorta carburante per auto + generatore (se presente)',
          'Stocca acqua: le tubature possono ghiacciare e rompersi',
          'Prepara riscaldamento alternativo: stufa a pellet/legna, coperte termiche',
          'Fai scorte alimentari per 5-7 giorni (impossibile uscire)',
          'Carica dispositivi, power bank, torce',
          'Isola porte e finestre con paraspifferi e tende termiche',
        ]},
        { fase: 'DURANTE LA TEMPESTA', azioni: [
          'EVITA spostamenti non essenziali — il rischio principale è la strada',
          'NON usare generatori o barbecue al chiuso (CO)',
          'Scalda una stanza sola: chiudi le altre, riduce dispersione del calore',
          'Abbigliamento a strati: protezione testa e estremità',
          'Se sul tetto c\'è più di 30 cm di neve: falla togliere (rischio crollo). Non salirci da solo',
          'Controlla periodicamente tubature esposte: lascia scorrere l\'acqua a filo',
        ]},
        { fase: 'GESTIONE STRADE E USCITE', azioni: [
          'Catene a bordo obbligatorie — montale prima di partire in salita',
          'Non tenere l\'auto accesa in garage chiuso — gas di scarico tossici',
          'Libera dalla neve il tubo di scarico dell\'auto e le canne fumarie',
          'Segnala con nastro colorato eventuali pericoli sul tragitto',
          'Se bloccato in auto: resta nel veicolo, motore 10min/ora per riscaldare',
        ]},
      ]
    },
    {
      id: 'pandemia',
      titolo: 'Pandemia / Quarantena',
      icon: '🦠',
      desc: 'Lockdown, isolamento obbligatorio, ospedali saturi',
      severity: 2,
      threats: ['cibo', 'acqua', 'medico', 'comm'],
      required: { acqua:65, cibo:85, energia:50, calore:50, comm:75, mobilita:45 },
      taskMap: {
        cibo:   ['ci01','ci02','ci03','ci04'],
        acqua:  ['ac01','ac02','ac03','ac04'],
        medico: ['me01','me02','me03','co03','pan01','pan03','pan04'],
        comm:   ['co01','co02','co04','si02','pan02'],
      },
      steps: [
        { fase: 'ISOLAMENTO DOMESTICO', azioni: [
          'Attiva le scorte alimentari già preparate',
          'Organizza consegne a domicilio e acquisti online',
          'Designa un solo familiare per le uscite — riduce esposizione',
          'Zona "pulita" e zona "sporca" in casa per gli ingressi dall\'esterno',
          'Mascherine FFP2/N95 per uscite necessarie',
        ]},
        { fase: 'SALUTE & PREVENZIONE', azioni: [
          'Igiene mani frequente: 20 secondi con sapone o alcool 70%',
          'Ventila regolarmente i locali (10 min ogni ora)',
          'Controlla saturazione O2 con pulsossimetro (soglia: < 94% chiama medico)',
          'Farmaci di base: paracetamolo, ibuprofene, antitosse',
          'Scorta farmaci cronici per 60-90 giorni (chiedi al medico)',
          'Numeri utili visibili: medico di base, guardia medica, 118',
        ]},
        { fase: 'COMUNICAZIONE & SUPPORTO', azioni: [
          'Mantieni contatti regolari con anziani soli vicini',
          'Coordina con rete di vicinato: spesa, farmaci, emergenze',
          'Segui fonti ufficiali: Ministero Salute, ISS, protezione civile',
          'Evita infodemia: limita news a 2 volte al giorno da fonti verificate',
          'Supporto psicologico: numeri verdi disponibili gratuitamente',
        ]},
      ]
    },
    {
      id: 'crisi-economica',
      titolo: 'Crisi Economica',
      icon: '📉',
      desc: 'Inflazione severa, prezzi alle stelle, forniture instabili',
      severity: 1,
      threats: ['cibo', 'carburante'],
      required: { acqua:45, cibo:85, energia:45, calore:40, comm:40, mobilita:65 },
      taskMap: {
        cibo:       ['ci01','ci02','ci03','ci04','eco02','eco03'],
        carburante: ['mo01','mo02','mo03','mo04','mo05','eco01','eco04'],
      },
      steps: [
        { fase: 'GESTIONE IMMEDIATA', azioni: [
          'Censisci le scorte disponibili in casa',
          'Priorità al cibo a lunga conservazione: pasta, riso, legumi, olio',
          'Riduci spese non essenziali — crea fondo emergenza liquido',
          'Contanti disponibili: i sistemi di pagamento digitali possono fallire',
          'Rivedi abbonamenti e contratti — negozia tariffe energia/gas',
        ]},
        { fase: 'AUTONOMIA ALIMENTARE', azioni: [
          'Orto domestico: anche un balcone può produrre erbe, insalata, pomodori',
          'Gruppi di acquisto solidale (GAS) — prezzi all\'ingrosso',
          'Acquisto diretto da agricoltori locali',
          'Riduci sprechi: pianifica i pasti, usa avanzi, conserva in modo corretto',
          'Impara ricette base da ingredienti semplici e economici',
        ]},
        { fase: 'MOBILITÀ E CARBURANTE', azioni: [
          'Consolida gli spostamenti: più commissioni in un\'unica uscita',
          'Valuta bicicletta o trasporto pubblico per tratte brevi',
          'Tieni un livello minimo di scorta carburante sempre',
          'Verifica copertura assicurativa e manutenzione auto (risparmi di lungo termine)',
        ]},
      ]
    },
    {
      id: 'incendio-zona',
      titolo: 'Incendio Zona',
      icon: '🔥',
      desc: 'Incendio boschivo o industriale nelle vicinanze',
      severity: 3,
      threats: ['acqua', 'comm', 'carburante'],
      required: { acqua:65, cibo:55, energia:60, calore:35, comm:80, mobilita:85 },
      taskMap: {
        acqua:      ['ac01','ac02','ac04','inc02'],
        comm:       ['co01','co02','co03','co04','si02','inc03'],
        carburante: ['mo01','mo02','mo03','mo04','mo05','inc01','inc04'],
      },
      steps: [
        { fase: 'PREALLARME', azioni: [
          'Monitora direzione e velocità del vento — determina il rischio',
          'Segui aggiornamenti ufficiali: protezione civile, VVF, comune',
          'Prepara go-bag e tienila pronta vicino all\'uscita',
          'Metti in moto l\'auto — parcheggiata in uscita facile',
          'Chiudi finestre e porte — rallenta l\'ingresso dei fumi',
        ]},
        { fase: 'ORDINE DI EVACUAZIONE', azioni: [
          'Segui IMMEDIATAMENTE le indicazioni delle autorità — non aspettare',
          'Lascia oggetti pesanti: la vita viene prima di qualsiasi bene',
          'Segui le vie di evacuazione indicate — non improvvisare percorsi',
          'Avvisa i familiari della tua destinazione',
          'NON tornare indietro per recuperare cose',
        ]},
        { fase: 'SE SEI SORPRESO DAL FUOCO', azioni: [
          'In auto: tieni i fari accesi, chiudi le prese d\'aria, avanza lentamente',
          'Se non puoi fuggire: sdraiati sul terreno nudo, copri naso e bocca',
          'Evita zone con vegetazione secca densa',
          'Segnala la tua posizione chiamando il 115 (VVF)',
          'NON fermarti sotto ponti o tunnel',
        ]},
        { fase: 'DOPO L\'INCENDIO', azioni: [
          'NON rientrare fino ad autorizzazione ufficiale',
          'Controlla la qualità dell\'aria prima di stare all\'aperto (PM2.5)',
          'Verifica tubature e contaminazione acqua potabile',
          'Documenta i danni per assicurazione e autorità',
        ]},
      ]
    },
    {
      id: 'blackout-mobile',
      titolo: 'Black-out Rete Mobile',
      icon: '📵',
      desc: 'Telefonia e internet assenti per ore/giorni',
      severity: 1,
      threats: ['comm'],
      required: { acqua:30, cibo:35, energia:45, calore:30, comm:90, mobilita:25 },
      taskMap: {
        comm: ['co01','co02','co03','co04','si02','bmo01','bmo02','bmo03'],
      },
      steps: [
        { fase: 'COMUNICAZIONE ALTERNATIVA', azioni: [
          'Attiva radio FM/AM: i canali istituzionali trasmettono informazioni',
          'Usa walkie-talkie PMR446 per comunicare nel raggio di 2-5km',
          'Recati fisicamente al punto di ritrovo prestabilito con la famiglia',
          'Lascia note fisiche: post-it visibili su porte di casa',
          'Se la conosci: usa una rete radio locale tra telefoni (es. Meshtastic)',
        ]},
        { fase: 'INFORMAZIONE & AGGIORNAMENTI', azioni: [
          'Radio a pile/manovella: RAI Radio 1 per emergenze nazionali',
          'TV con antenna: i canali RAI trasmettono senza internet',
          'Controlla bacheca del comune o punti di raccolta locali',
          'Evita di diffondere voci non verificate',
        ]},
        { fase: 'OPERATIVITÀ SENZA CONNESSIONE', azioni: [
          'Mappe offline scaricate: Maps.me, Organic Maps, Google Maps offline',
          'Documenti importanti salvati offline sul telefono (PDF)',
          'Password manager offline o lista stampata in luogo sicuro',
          'Backup fotografie e dati critici su hard disk locale',
        ]},
      ]
    },
    {
      id: 'conflitto',
      titolo: 'Attacco Militare / Conflitto',
      icon: '🪖',
      desc: 'Allarme aereo, bombardamenti, guerra vicina',
      severity: 4,
      threats: ['acqua', 'cibo', 'blackout', 'comm', 'carburante', 'medico'],
      required: { acqua:90, cibo:85, energia:75, calore:60, comm:90, mobilita:70 },
      taskMap: {
        acqua:      ['ac01','ac02','ac04'],
        cibo:       ['ci01','ci02','ci04'],
        blackout:   ['en01','en02','en04','si01'],
        comm:       ['co01','co02','co03','co04','si02'],
        carburante: ['mo01','mo02','mo03','mo04','mo05'],
        medico:     ['me01','me02','me03'],
      },
      steps: [
        { fase: 'ALLARME (sirene, IT-alert, radio)', azioni: [
          'Vai subito al rifugio pubblico più vicino. Se non c\'è: scantinato, o la stanza più interna del piano più basso',
          'Stai lontano da finestre, vetrate e pareti esterne',
          'Porta lo zaino d\'emergenza, farmaci, documenti, acqua, telefono e radio',
          'Spegni gas e luce se hai il tempo di farlo, ma non rimandare per questo',
          'Non uscire per filmare o guardare: i pericoli sono vetri, crolli e un secondo colpo',
        ]},
        { fase: 'DURANTE GLI ATTACCHI', azioni: [
          'Resta nel rifugio: sdraiati a terra, proteggi testa e collo con le braccia',
          'Bocca leggermente aperta e orecchie coperte: attutisce lo spostamento d\'aria delle esplosioni',
          'Se sei all\'aperto: raggiungi il riparo più vicino (muro, fossa, edificio solido) e sdraiati',
          'Se sei in auto: fermati lontano da edifici e ponti, esci e ripara dietro un muro. Non restare nell\'abitacolo',
          'Ascolta la radio a batterie per sapere quando il pericolo è finito',
        ]},
        { fase: 'DOPO L\'ATTACCO', azioni: [
          'Aspetta il via libera ufficiale prima di uscire dal rifugio',
          'Controlla ferite tue e di chi è con te: primo soccorso, poi 112/118 se la linea funziona',
          'NON toccare oggetti sconosciuti o metallici a terra (ordigni inesplosi): allontanati e avvisa le autorità',
          'Resta lontano da edifici danneggiati, fili a terra e fughe di gas',
          'Chiudi gas ed elettricità se la casa è danneggiata',
        ]},
        { fase: 'SE DEVI LASCIARE LA ZONA', azioni: [
          'Evacua solo se ordinato dalle autorità o se la tua zona è colpita',
          'Evita strade principali, ponti, stazioni, caserme e impianti: sono obiettivi e si intasano',
          'Avvisa un familiare fuori zona di dove vai',
          'Porta contanti: i pagamenti elettronici possono non funzionare',
        ]},
        { fase: 'IN CASA, NEI GIORNI SUCCESSIVI', azioni: [
          'Segui solo fonti ufficiali: Protezione Civile, IT-alert, radio nazionale. Non diffondere voci non verificate',
          'Razione acqua e cibo: 3 L a persona al giorno, pasti piccoli e regolari',
          'Tieni radio, torce e power bank carichi; usa la luce solo dove serve',
          'Controlla i vicini più fragili e organizza turni di vigilanza e aiuto',
          'Cura le ferite subito: in guerra gli ospedali possono essere lontani o sovraccarichi',
        ]},
      ]
    },
    {
      id: 'nucleare',
      titolo: 'Incidente Nucleare / Radiologico',
      icon: '☢️',
      desc: 'Esplosione nucleare o nube radioattiva',
      severity: 4,
      threats: ['acqua', 'cibo', 'blackout', 'comm', 'medico'],
      required: { acqua:90, cibo:85, energia:70, calore:50, comm:90, mobilita:50 },
      taskMap: {
        acqua:    ['ac01','ac02','ac04'],
        cibo:     ['ci01','ci02','ci04'],
        blackout: ['en01','en02','en04'],
        comm:     ['co01','co03','co04','si02'],
        medico:   ['me01','me02','me03'],
      },
      steps: [
        { fase: 'PRIMI SECONDI (lampo / allarme)', azioni: [
          'NON guardare il lampo. Giraiti e distogli lo sguardo',
          'Se sei all\'aperto: sdraiati subito dietro un riparo, copri testa e collo con le braccia. L\'onda d\'urto arriva dopo secondi o minuti',
          'Resta giù finché l\'onda d\'urto non è passata (almeno 1-2 minuti)',
        ]},
        { fase: 'ENTRA E RESTA AL CHIUSO (primi 10-30 minuti)', azioni: [
          'Entra nell\'edificio più vicino, meglio un seminterrato o una stanza interna lontana da finestre e tetto',
          'Chiudi porte e finestre, spegni condizionatori e ventilazione',
          'Resta dentro: l\'edificio ti protegge molto, ogni ora che passa il pericolo cala',
          'Accendi la radio a batterie e sintonizzati sui canali ufficiali',
          'Non uscire a cercare familiari o a guardare cosa è successo',
        ]},
        { fase: 'DECONTAMINAZIONE (se eri all\'aperto)', azioni: [
          'Togli i vestiti esterni con cautela, senza scuoterli: elimina fino al 90% della contaminazione',
          'Mettili in un sacchetto chiuso, lontano da persone e animali',
          'Lavati con acqua e sapone, senza strofinare forte. Non usare balsamo né creme',
          'Soffia il naso, lava occhi e orecchie. Metti vestiti puliti',
          'Gli animali che erano fuori vanno lavati prima di farli entrare',
        ]},
        { fase: 'ACQUA E CIBO', azioni: [
          'Usa solo acqua e cibo confezionati, o tenuti al chiuso in contenitori sigillati',
          'Cibo e acqua lasciati all\'aperto possono essere contaminati: non usarli',
          'Non prendere pastiglie di iodio se non lo dicono le autorità: proteggono solo la tiroide da un tipo di radiazione',
          'Bevi e mangia a sufficienza: non serve sprecare scorte, ma non restare a digiuno',
        ]},
        { fase: 'QUANTO RESTARE AL CHIUSO', azioni: [
          'Almeno 24 ore, a meno che le autorità non dicano diversamente',
          'Esci solo su indicazione ufficiale (radio, IT-alert, Protezione Civile)',
          'Se ordinano di evacuare: segui il percorso indicato, non improvvisare',
          'Chiama il 112 solo per emergenze mediche vere: le linee saranno sovraccariche',
        ]},
      ]
    },
    {
      id: 'survival-natura',
      titolo: 'Survival in Natura',
      icon: '🌲',
      desc: 'Disperso o isolato in ambiente naturale',
      severity: 3,
      threats: ['acqua', 'cibo', 'freddo', 'comm', 'medico'],
      required: { acqua:85, cibo:75, energia:30, calore:85, comm:80, mobilita:60 },
      taskMap: {
        acqua:  ['sv01','sv02'],
        cibo:   ['sv03','sv04','sv13','sv15'],
        freddo: ['ca03','sv05','sv06','sv07','sv14'],
        comm:   ['co01','co02','co04','sv08','sv09','sv10','sv12'],
        medico: ['me01','me02','me03','sv11'],
      },
      steps: [
        { fase: 'REGOLA DEI 3 (priorità assolute)', azioni: [
          'Ordine delle priorità: 1) respirare e fermare ferite gravi · 2) riparo dal freddo · 3) acqua · 4) cibo (per ultimo)',
          'STOP — Siediti, Pensa, Osserva, Pianifica prima di agire',
        ]},
        { fase: 'RIPARO (protezione dal freddo)', azioni: [
          'Costruisci riparo prima del buio — mai bivaccare impreparato',
          'Isolamento dal suolo è priorità: il suolo disperde calore 30× più veloce dell\'aria',
          'Letto di foglie secche spesso almeno 30cm sotto il corpo',
          'Lean-to (tettoia con rami + foglie): 2h di lavoro, riparo efficace',
          'Bivacca lontano da fondovalle (umidità) e crinali (vento)',
          'Ingresso riparo sempre lontano dal vento dominante',
        ]},
        { fase: 'ACQUA', azioni: [
          'Fonti sicure: sorgenti, ruscelli veloci con fondo sassoso',
          'Raccolta rugiada: assorbi con tessuto al mattino presto',
          'Distillazione solare: buca nel terreno + contenitore + telo plastico',
          'BOLLISCI sempre: 1 minuto piena ebollizione (3 min sopra 2000m)',
          'Segni di acqua: vegetazione verde densa, insetti, tracce di animali',
          'NON bere acqua stagnante, acqua di mare, urina',
        ]},
        { fase: 'FUOCO', azioni: [
          'Tinder: corteccia birch, funghi secchi, erba secca, ovatta di cattail',
          'Kindling: rametti secchi fino a matita, poi fino a pollice',
          'Accendino → il più affidabile in assoluto (portane sempre 2)',
          'Acciarino ferrocerio: funziona bagnato, in alta quota, sotto zero',
          'Friction fire (arco-trapano) solo come ultima risorsa: ore di pratica necessarie',
          'Fuoco in cerchio di sassi, mai direttamente su suolo umido o radici',
        ]},
        { fase: 'CIBO', azioni: [
          'Il corpo sopravvive 3 settimane senza cibo — non rischiare per piante sconosciute',
          'Regola universale: se non sei al 100% sicuro, NON mangiarlo',
          'Sicuri in Italia: more, lamponi, more di rovo, mirtilli, castagne, ghiande (solo dopo molti cambi d\'acqua di bollitura)',
          'Proteine: insetti (grilli, larve) ben cotti — mai quelli pelosi o colorati. Evita lumache e funghi se non sei esperto',
          'Trappole: laccio semplice su sentiero di piccoli animali',
          'Pesca: amo e filo da pesca nel kit di sopravvivenza — essenziale',
        ]},
        { fase: 'SEGNALAZIONE & SALVATAGGIO', azioni: [
          'Rimani fermo se qualcuno sa dove sei — i soccorsi ti trovano più facilmente',
          'Specchio di segnalazione: visibile a 15+ km in cielo sereno',
          'SOS: 3 fuochi in triangolo equilatero (segnale internazionale)',
          'Fischietto: 3 fischi corti = distress, molto più efficace della voce',
          'Colori vivaci su spazio aperto visibile dall\'alto',
          'Numero emergenze: 112 (numero unico europeo), 118 (sanità e soccorso alpino), 115 (Vigili del Fuoco)',
        ]},
        { fase: 'ORIENTAMENTO SENZA STRUMENTI', azioni: [
          'Sole: sorge a EST, tramonta a OVEST — a mezzogiorno è a SUD (emisfero nord)',
          'Orologio analogico: punta lancetta delle ore verso il sole → bisettrice con 12 = SUD',
          'Stella polare: trova Orsa Maggiore → prolunga il "manico" 5× → Stella Polare = NORD',
          'Corsi d\'acqua scendono sempre a valle → portano a insediamenti umani',
          'Muschio: tende a crescere sul lato nord degli alberi (non affidabile al 100%)',
        ]},
      ],
    },
  ];

  // Expose scenario data globally (used by settings.js tab and dashboard.js)
  window.SCENARI_LIST = SCENARI;

  return {};
})();
