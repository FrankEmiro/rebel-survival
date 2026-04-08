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
          'Attenzione all\'iperventilazione da generatore',
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
      steps: [
        { fase: 'IMMEDIATO', azioni: [
          'Chiudi rubinetto gas principale',
          'Verifica se interruzione è locale o diffusa (chiama fornitore)',
          'NON accendere fiamme o interruttori se senti odore di gas',
          'Arieggia i locali in caso di sospetta perdita',
        ]},
        { fase: 'RISCALDAMENTO ALTERNATIVO', azioni: [
          'Attiva stufa a pellet/legna se disponibile',
          'Stufa portatile a GPL: solo in ambienti ventilati',
          'Concentra le persone in una stanza sola e riscalda quella',
          'Usa coperte termiche, abbigliamento a strati',
          'Isola porte e finestre con tessuti/nastro',
        ]},
        { fase: 'ACQUA CALDA & CUCINA', azioni: [
          'Fornello da campeggio o a GPL per cucinare',
          'Acqua calda: riscalda pentole sul fornello alternativo',
          'Riduci frequenza docce: usa acqua tiepida sparagnina',
          'Termosifoni a propano portatili come soluzione temporanea',
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
          'Frigorifero a temperatura massima (5°C) per efficienza',
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
      steps: [
        { fase: 'IMMEDIATO', azioni: [
          'Riempi vasche da bagno, secchi, contenitori disponibili',
          'NON usare acqua del rubinetto se dichiarata non potabile',
          'Attiva scorte di acqua in bottiglia',
          'Identifica fonti alternative: pozzo, torrente, raccolta pioggia',
        ]},
        { fase: 'RAZIONAMENTO', azioni: [
          'Minimo vitale: 2.5L/persona/giorno per bere',
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
      steps: [
        { fase: 'PRIMI 10 MINUTI', azioni: [
          'Prendi il bag out bag già preparato',
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
          'Porta con te animali domestici',
          'Chiudi gas e elettricità prima di uscire',
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
          'Verifica struttura con occhio critico: crepe, inclinazioni, perdite gas',
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
          'Stacca la corrente dal quadro elettrico se l\'acqua si avvicina',
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
      steps: [
        { fase: 'PROTEZIONE PERSONALE', azioni: [
          'Bevi almeno 2L di acqua al giorno — non aspettare la sete',
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
          'Colpo di calore: raffredda subito con acqua fredda, chiama 118',
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
          'Sciogli neve sul tetto se supera 30cm (rischio crollo)',
          'Controlla periodicamente tubature esposte: lascia scorrere l\'acqua a filo',
        ]},
        { fase: 'GESTIONE STRADE E USCITE', azioni: [
          'Catene a bordo obbligatorie — montale prima di partire',
          'Non avviare l\'auto in garage chiuso — esalanda',
          'Libera scarichi fumi e canne fumarie dalla neve',
          'Segnala con nastro colorato o bandiere eventuali buche pericolose',
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
      steps: [
        { fase: 'COMUNICAZIONE ALTERNATIVA', azioni: [
          'Attiva radio FM/AM: i canali istituzionali trasmettono informazioni',
          'Usa walkie-talkie PMR446 per comunicare nel raggio di 2-5km',
          'Recati fisicamente al punto di ritrovo prestabilito con la famiglia',
          'Lascia note fisiche: post-it visibili su porte di casa',
          'Riattiva contatti su reti mesh locale se disponibili (Meshtastic)',
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
      id: 'survival-natura',
      titolo: 'Survival in Natura',
      icon: '🌲',
      desc: 'Disperso o isolato in ambiente naturale',
      severity: 3,
      threats: ['acqua', 'cibo', 'freddo', 'comm', 'medico'],
      steps: [
        { fase: 'REGOLA DEI 3 (priorità assolute)', azioni: [
          '3 minuti senza aria → priorità numero 1: vie aeree libere',
          '3 ore in ambiente freddo → priorità: riparo e calore corporeo',
          '3 giorni senza acqua → trova e purifica acqua prima del cibo',
          '3 settimane senza cibo → il cibo è l\'ultima priorità in survival',
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
          'Sicuri in Italia: more, lamponi, more di rovo, mirtilli, castagne, ghiande bollite',
          'Proteine sicure: lumache (bollite 5 min), insetti (grilli, larve — no pelosi o colorati)',
          'Trappole: laccio semplice su sentiero di piccoli animali',
          'Pesca: amo e filo da pesca nel kit di sopravvivenza — essenziale',
        ]},
        { fase: 'SEGNALAZIONE & SALVATAGGIO', azioni: [
          'Rimani fermo se qualcuno sa dove sei — i soccorsi ti trovano più facilmente',
          'Specchio di segnalazione: visibile a 15+ km in cielo sereno',
          'SOS: 3 fuochi in triangolo equilatero (segnale internazionale)',
          'Fischietto: 3 fischi corti = distress, molto più efficace della voce',
          'Colori vivaci su spazio aperto visibile dall\'alto',
          'Numero emergenze: 118 (sanità), 112 (unico europeo), 115 (VVF), 117 (soccorso alpino)',
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
