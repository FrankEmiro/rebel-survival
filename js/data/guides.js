/* ============================================================
   KNOWLEDGE BASE — 29 guide embedded, 100% offline
   Fonti: FM 21-76 (US Army) · FM 4-25.11 · FEMA Ready.gov
          WHO Water Guidelines · Protezione Civile · USDA
   ============================================================ */
const GUIDES_DATA = [

  /* ══════════════════════ ACQUA ══════════════════════ */
  {
    id: 'acqua-purificazione',
    title: 'Purificazione Acqua',
    icon: 'ph-drop',
    category: 'acqua',
    source: 'FM 21-76 · WHO',
    readTime: '4 min',
    quickRef: [
      'Bollitura: 1 min a 100°C — il metodo più sicuro in assoluto',
      'Candeggina 5–6%: 2 gocce/L limpida · 4 gocce/L torbida → attendi 30 min',
      'Filtro Sawyer/LifeStraw: 99.99% batteri e protozoi (NON virus)',
      'SODIS: bottiglia PET al sole 6h cielo sereno · 2 giorni nuvoloso',
      'Filtra sempre i sedimenti PRIMA della disinfezione chimica',
    ],
    sections: [
      {
        heading: 'Perché ogni fonte è sospetta',
        content: 'In emergenza, anche l\'acqua apparentemente limpida può contenere batteri (colera, tifo), virus (epatite A, rotavirus) e protozoi (Giardia, Cryptosporidium). I sintomi compaiono 6–48 ore dopo l\'ingestione. La disidratazione da diarrea infettiva può essere letale in 24–72 ore. Non fidarti mai dell\'aspetto: l\'acqua torbida è visibilmente contaminata, quella limpida può essere microbiologicamente pericolosa.',
      },
      {
        heading: 'Metodo 1 — Bollitura (migliore)',
        steps: [
          'Filtra prima l\'acqua torbida con un panno pulito o caffettiera senza filtro',
          'Porta a bollore vigoroso (bolle grandi, non solo vapore)',
          'Mantieni il bollore per 1 minuto (3 minuti oltre i 2.000m di quota)',
          'Copri il contenitore e lascia raffreddare naturalmente',
          'Travasa in contenitore pulito con coperchio — non bere direttamente dalla pentola',
          'Aerare il sapore "piatto": versa l\'acqua da un contenitore all\'altro 20 volte',
        ],
      },
      {
        heading: 'Metodo 2 — Candeggina domestica',
        steps: [
          'Usa SOLO candeggina non profumata con 5–6% di cloro attivo',
          'Acqua limpida: 2 gocce per litro',
          'Acqua torbida: 4 gocce per litro (filtra prima)',
          'Mescola bene e attendi 30 minuti prima di bere',
          'Dopo 30 min devi sentire un lieve odore di cloro — se no, ripeti il trattamento',
          'Acqua fredda o molto dura: raddoppia la dose e aumenta il tempo a 60 min',
          'Non usare candeggina con "additivi" (profumo, addensanti, sgrassatori)',
        ],
      },
      {
        heading: 'Metodo 3 — Filtro portatile',
        steps: [
          'Sawyer Squeeze o LifeStraw rimuovono batteri e protozoi al 99.9999%',
          'NON rimuovono virus (rischio in contesti con scarsa igiene e fognature danneggiate)',
          'Combina sempre filtro + candeggina per protezione completa',
          'Retrolava il filtro ogni 4–5 litri per mantenere la portata',
          'Se esposto al gelo: asciuga completamente e conserva in tasca interna — il ghiaccio rompe le membrane',
          'Durata: Sawyer filtra fino a 400.000 litri se mantenuto correttamente',
        ],
      },
      {
        heading: 'Metodo 4 — SODIS (solarizzazione)',
        steps: [
          'Usa bottiglie PET trasparenti (codice 1) max 2 litri — non vetro verde o blu',
          'Riempi d\'acqua già filtrata dai sedimenti',
          'Esponi orizzontalmente al sole diretto su superficie riflettente (lamiera ondulata)',
          'Cielo sereno: 6 ore di sole diretto',
          'Cielo nuvoloso: 2 giorni',
          'Segna l\'ora di inizio con un pennarello sulla bottiglia',
          'Non utilizzare se l\'acqua è molto torbida (blocca i raggi UV)',
        ],
      },
      {
        heading: 'Priorità di purificazione in emergenza',
        content: 'Se hai solo un metodo: bollitura > candeggina > filtro > SODIS. Se hai tempo e risorse, usa bollitura + candeggina insieme per massima sicurezza. Filtra sempre i sedimenti visibili prima di qualsiasi trattamento — riduce l\'efficacia di tutti i metodi chimici. In caso di infezione batterica accertata nell\'acquedotto locale, usa esclusivamente bollitura o candeggina.',
      },
    ],
    relatedGuides: ['acqua-stoccaggio', 'acqua-raccolta-pioggia', 'acqua-fonti-alternative'],
    tasks: ['ac01', 'ac02', 'ac04'],
  },

  {
    id: 'acqua-stoccaggio',
    title: 'Stoccaggio Acqua a Lungo Termine',
    icon: 'ph-cylinder',
    category: 'acqua',
    source: 'FEMA · WHO',
    readTime: '3 min',
    quickRef: [
      'Obiettivo: 5L/persona/giorno × 30 giorni = 150L per adulto',
      'Contenitori HDPE (codice 2) o PET (codice 1) — mai PVC o contenitori riusati con prodotti chimici',
      'Conserva al buio, fresco (10–15°C), lontano da prodotti chimici',
      'Acqua trattata in casa: cambia ogni 6 mesi',
      'Acqua imbottigliata sigillata: fino a 2 anni dalla produzione',
    ],
    sections: [
      {
        heading: 'Quanto stoccare',
        content: 'Il calcolo base è 3L/giorno tra bere e cucinare (minimo vitale), fino a 5L/persona/giorno con igiene minima. Per climi caldi, lavori fisici o bambini piccoli: 8–10L/giorno. Bambini sotto i 2 anni e donne in allattamento: +1L/giorno. Con questo calcolo: famiglia di 4 persone × 30 giorni = 600 litri. Inizia con 7 giorni (140L per 4 persone) e costruisci gradualmente.',
      },
      {
        heading: 'Contenitori — quale scegliere',
        steps: [
          'Taniche HDPE alimentari da 10-25L: economiche, robuste, impilabili — scelta migliore',
          'Bidoni da 60L o cisterne IBC da 1.000L: per stoccaggio definitivo garage/cantina',
          'Bottiglie PET originali sigillate: vanno bene, facile reperibilità e rotazione',
          'EVITA: contenitori trasparenti (favoriscono alghe), vecchi contenitori chimici (anche se lavati), sacchi non alimentari',
          'Tratta l\'acqua del rubinetto con 2 gocce di candeggina per litro prima di stoccarla',
          'Etichetta ogni contenitore con data di riempimento',
        ],
      },
      {
        heading: 'Conservazione corretta',
        steps: [
          'Temperatura ideale: 10–15°C. Mai oltre 25°C (favorisce proliferazione batterica)',
          'Buio totale: la luce degrada i contenitori plastici e favorisce le alghe',
          'Lontano da prodotti chimici, vernici, carburanti: la plastica è permeabile ai vapori',
          'Non a contatto diretto col cemento: poggia su pallet di legno',
          'Rotazione: consuma e riempi ogni 6 mesi per acqua trattata in casa',
          'Verifica integrità contenitore a ogni rotazione: nessuna crepa, tappo perfettamente chiuso',
        ],
      },
      {
        heading: 'Sistema di rotazione automatica',
        content: 'Organizza i contenitori in fila: riempi sempre da un lato, consuma dall\'altro (FIFO — First In, First Out). Lega la data di riempimento al tuo calendario mensile: ogni 6 mesi consuma la scorta più vecchia e riempi contenitori freschi. Un sistema semplice: etichetta con mese e anno + adesivo colorato (rosso = da consumare entro 6 mesi).',
      },
    ],
    relatedGuides: ['acqua-purificazione', 'acqua-raccolta-pioggia'],
    tasks: ['ac01'],
  },

  {
    id: 'acqua-raccolta-pioggia',
    title: 'Raccolta Acqua Piovana',
    icon: 'ph-cloud-rain',
    category: 'acqua',
    source: 'FM 21-76 · FEMA',
    readTime: '3 min',
    quickRef: [
      'Stima raccolta: mm pioggia × m² tetto × 0.8 = litri raccolti',
      'Scarta sempre i primi 5–10 min di pioggia (pulisce il tetto)',
      'Purifica SEMPRE prima del consumo — l\'acqua piovana non è potabile diretta',
      'Cisterna coperta: previeni alghe, zanzare, evaporazione',
      'In Italia: 600–1.500mm/anno. Con 40m² tetto → 19.200–48.000L/anno',
    ],
    sections: [
      {
        heading: 'Sistema base di raccolta',
        steps: [
          'Grondaia esistente: aggiungi un "primo flush diverter" (scarica automatica i primi 10-20L)',
          'Tubo discesa verso cisterna: usa filtro foglie con rete a maglia fine (2-3mm)',
          'Cisterna: minimo 500L, coperta, preferibilmente interrata o in ombra',
          'Rubinetto di prelievo nella parte bassa, sfioratore di troppo pieno in alto',
          'Sistema filtro a sabbia e ghiaia: rimuove sedimenti prima della cisterna',
        ],
      },
      {
        heading: 'Qualità e purificazione',
        content: 'L\'acqua piovana raccolta dal tetto contiene: polvere atmosferica, escrementi di uccelli, residui di tegole/lamiere, possibili metalli pesanti. Non è mai potabile diretta. Trattamento minimo prima del consumo: filtro fisico (sedimenti) + bollitura o candeggina. Per uso irrigazione orto: nessun trattamento necessario — vantaggio enorme.',
      },
      {
        heading: 'Sistema improvvisato in emergenza',
        steps: [
          'Teli impermeabili (tarp) o teloni da camion: tendi in pendenza verso un contenitore',
          'Area raccolta: anche 2m² raccolgono 2L ogni mm di pioggia',
          'Contenitore: pentola grande, secchio, qualsiasi recipiente pulito',
          'Filtra attraverso panno pulito a strati multipli prima di stoccare',
          'Copri immediatamente per evitare evaporazione e contaminazione',
        ],
      },
    ],
    relatedGuides: ['acqua-purificazione', 'acqua-stoccaggio'],
    tasks: ['ac03'],
  },

  {
    id: 'acqua-fonti-alternative',
    title: 'Fonti Acqua Locali in Emergenza',
    icon: 'ph-waves',
    category: 'acqua',
    source: 'FM 21-76',
    readTime: '3 min',
    quickRef: [
      'Priorità fonti: pozzo privato > raccolta pioggia > fiume/torrente > fontane pubbliche',
      'Fontane a caduta libera funzionano anche senza pressione di rete',
      'Fiume/torrente: rischio molto alto — filtra + bollitura SEMPRE, mai solo filtro',
      'Evita: zone a valle di industrie, agricoltura intensiva, discariche',
      'Rugiada su superfici: raccoglibile con panno — purifica prima di bere',
    ],
    sections: [
      {
        heading: 'Valutazione rapida delle fonti locali',
        content: 'Prima di una crisi, individua entro 2km da casa: pozzi (pubblici e privati), fontanelle pubbliche a caduta, fiumi/torrenti, laghetti. Mappa mentalmente le direzioni e i tempi di percorso a piedi. Le fontane pubbliche italiane "a canna" (zampilli continui) funzionano indipendentemente dalla pressione di rete perché alimentate per caduta da serbatoi in quota.',
      },
      {
        heading: 'Pozzi privati',
        steps: [
          'Acqua di pozzo non è automaticamente potabile: può contenere nitrati, batteri fecali, metalli',
          'Se il pozzo non è mai stato analizzato: tratta sempre come acqua di fiume',
          'Trattamento minimo: filtro + bollitura',
          'Pozzo mai usato da tempo: pulisci con candeggina prima (1L per 1.000L di volume pozzo)',
          'Pozzo vicino a zona agricola: rischio nitrati — non dare ai bambini sotto 1 anno senza analisi',
        ],
      },
      {
        heading: 'Corsi d\'acqua superficiali',
        steps: [
          'Preleva acqua il più possibile a monte rispetto ad abitazioni e attività umane',
          'Acqua di montagna è generalmente più sicura di quella di pianura',
          'Filtra sedimenti con panno o filtro improvvisato (ghiaia + sabbia + carbone in bottiglia)',
          'Bollitura obbligatoria: almeno 3 minuti per sicurezza extra',
          'Aggiungi candeggina dopo la bollitura per protezione aggiuntiva da virus',
          'EVITA assolutamente acqua: verde (alghe), schiumosa (detergenti), con odori chimici, a valle di ospedali o industrie',
        ],
      },
      {
        heading: 'Fonti non convenzionali',
        content: 'Scaldabagno elettrico: contiene 50–150L di acqua calda — scaricabile dal rubinetto in basso. Tubature della casa: chiudi il rubinetto principale, apri il punto più basso dell\'impianto. Caloriferi (solo se non trattati con antigelo — controlla prima). Ghiaccio del congelatore: quando si scongela, è acqua sicura se era ghiaccio da acqua potabile.',
      },
    ],
    relatedGuides: ['acqua-purificazione', 'acqua-stoccaggio'],
    tasks: ['ac01', 'ac02'],
  },

  /* ══════════════════════ CIBO ══════════════════════ */
  {
    id: 'cibo-conservazione',
    title: 'Conservazione Alimenti senza Frigo',
    icon: 'ph-package',
    category: 'cibo',
    source: 'USDA · FM 21-76',
    readTime: '4 min',
    quickRef: [
      'Carne fresca: max 2–4h a 20°C — cuoci immediatamente',
      'Uova non lavate: 2–3 settimane a temperatura ambiente',
      'Formaggi duri: 1–2 settimane in luogo fresco avvolti in carta (non plastica)',
      'Priorità consumo: fresco → refrigerato → conserve → secco',
      'Apri le conserve solo quando le usi — una volta aperte consumale entro 24h senza frigo',
    ],
    sections: [
      {
        heading: 'Alimenti a lunga conservazione senza energia',
        content: 'Gli alimenti che non richiedono refrigerazione e durano mesi/anni: pasta e riso (3–5 anni in contenitore chiuso), legumi secchi (5+ anni), farina (1 anno), zucchero e sale (indefiniti), miele (indefinito), conserve industriali chiuse (2–5 anni), frutta secca (1–2 anni), cioccolato fondente (2 anni). Questi formano il nucleo delle scorte di emergenza.',
      },
      {
        heading: 'Metodo 1 — Salatura',
        steps: [
          'Usa sale grosso non iodato (lo iodio si degrada col tempo)',
          'Carne: copri completamente con 300g di sale per kg. Asciuga bene prima',
          'Pesce: intestina, lava, copri con sale. Pronto in 24–48h',
          'Conservazione: luogo fresco, contenitore chiuso. Dura settimane–mesi',
          'Prima del consumo: immergi in acqua 12–24h per desalare (cambia l\'acqua ogni 6h)',
          'Verdure: salamoia 20g sale per litro d\'acqua — funziona per fermentazione',
        ],
      },
      {
        heading: 'Metodo 2 — Essiccazione',
        steps: [
          'Taglia in fette sottili (3–5mm): carne, frutta, verdura, funghi',
          'Al sole: 2–4 giorni su griglia sopraelevata, coperta con rete anti-insetti',
          'In forno: 60–70°C con sportello leggermente aperto per 6–12h',
          'Il prodotto è pronto quando è duro, senza umidità residua al tatto',
          'Conserva in sacchetti carta o vasetti di vetro con coperchio, al buio',
          'Durata: carne essiccata 2–3 mesi, frutta 6–12 mesi, funghi 1–2 anni',
        ],
      },
      {
        heading: 'Metodo 3 — Fermentazione',
        steps: [
          'Salamoia base: 20g sale per litro d\'acqua (circa 1 cucchiaio colmo)',
          'Immergi verdure tagliate completamente sotto la salamoia in vasetto',
          'Copri con peso per tenere tutto sommerso (pietra piccola, sacchetto d\'acqua)',
          'A temperatura ambiente (18–22°C): pronto in 3–7 giorni',
          'Segni positivi: bollicine, odore acidulo. Segno negativo: muffa (scarta tutto)',
          'Una volta pronto: conserva in frigorifero (se disponibile) o luogo fresco',
          'Dura mesi in luogo fresco. Ricco di probiotici — ottimo per immunità',
        ],
      },
      {
        heading: 'Metodo 4 — Sott\'olio e sott\'aceto',
        steps: [
          'Verdure sott\'olio: sterilizza le verdure in aceto a 5% per 10 min prima',
          'Asciuga completamente, riempì vasetti alternando olio e verdure',
          'Sott\'aceto: immergi verdure in aceto di vino bianco a 5% (non diluire)',
          'Vasetti ben chiusi: sterilizza in forno a 120°C per 10 min prima dell\'uso',
          'Durata: 6–12 mesi in luogo fresco e buio',
          'ATTENZIONE: verdure sott\'olio senza sterilizzazione → rischio botulino. Segui la procedura esatta',
        ],
      },
    ],
    relatedGuides: ['cibo-scorte-piano', 'cibo-cottura-campo'],
    tasks: ['ci01', 'ci04'],
  },

  {
    id: 'cibo-scorte-piano',
    title: 'Piano Scorte a Lungo Termine',
    icon: 'ph-stack',
    category: 'cibo',
    source: 'USDA · FEMA',
    readTime: '3 min',
    quickRef: [
      'Regola base: 2.000–2.500 kcal/giorno per adulto — 1.700 per anziani e bambini',
      'Ruota le scorte: FIFO (primo entrato, primo uscito) — non stoccare e dimenticare',
      'Lista minima 30 giorni: 9kg pasta, 6kg riso, 5kg legumi, 3L olio, sale, zucchero',
      'Conserva al buio, fresco (15–18°C), asciutto, lontano da prodotti chimici',
      'Contenitori vetro o alluminio > plastica per durata massima',
    ],
    sections: [
      {
        heading: 'Piano minimo 30 giorni per persona',
        content: 'Per una persona adulta attiva con 2.000 kcal/giorno per 30 giorni: Carboidrati: 9kg pasta/riso (5kg pasta + 4kg riso), 3kg crackers/gallette. Proteine: 3kg legumi secchi, 12 scatole tonno (80g), 6 scatole carne (200g). Grassi: 3L olio extra vergine, 0.5kg frutta secca. Condimenti: 1kg sale, 1kg zucchero, 0.5kg dado/brodo, 1L aceto. Bevande: caffè, tè, tisane. Costo stimato: 80–120€ per persona.',
      },
      {
        heading: 'Alimenti per priorità di durata',
        steps: [
          'INDEFINITA: sale, zucchero bianco, miele, aceto di vino, liquori ad alta gradazione',
          '5+ ANNI: riso bianco, pasta di semola, legumi secchi, farina integrale in contenitore ermetico',
          '2–5 ANNI: conserve industriali (tonno, carne, verdure), cioccolato fondente, riso integrale',
          '1–2 ANNI: crackers/gallette, olio (non extra vergine), caffè sigillato, latte in polvere',
          '6–12 MESI: olio extra vergine, noci, mandorle, farina 00, cereali in fiocchi',
          'ROTAZIONE MENSILE: latte UHT, succhi, biscotti — acquista e ruota regolarmente',
        ],
      },
      {
        heading: 'Contenitori corretti per la durata massima',
        steps: [
          'Barattoli di vetro con coperchio ermetico: ideali per cereali, legumi, farina',
          'Lattine sigillate: protezione assoluta — 25+ anni per alcuni prodotti (sale, zucchero)',
          'Sacchi Mylar + secchielli alimentari: per grandi quantità (25kg riso)',
          'Assorbitore di ossigeno (O2 absorber): aggiunto nel contenitore elimina insetti e ossidazione',
          'Plastica alimentare HDPE (codice 2): va bene ma è permeabile ai vapori nel lungo periodo',
          'Evita: buste di carta, contenitori non sigillati, qualsiasi contenitore non specificamente alimentare',
        ],
      },
      {
        heading: 'Sistema di rotazione FIFO',
        content: 'Acquista → posiziona DIETRO gli alimenti esistenti → consuma sempre DAVANTI. Etichetta ogni acquisto con data e scadenza reale. Un foglio excel o agenda dedicata: ogni mese controlla cosa scade nei prossimi 3 mesi e integralo nella dieta normale. Non stoccare e dimenticare: le scorte che scadono inutilizzate sono soldi sprecati e non aiutano in emergenza.',
      },
    ],
    relatedGuides: ['cibo-conservazione', 'cibo-cottura-campo'],
    tasks: ['ci01'],
  },

  {
    id: 'orto-emergenza',
    title: 'Orto di Emergenza',
    icon: 'ph-leaf',
    category: 'cibo',
    source: 'USDA',
    readTime: '4 min',
    quickRef: [
      'Germogli: pronti in 5–7 giorni — lenticchie, piselli, ravanello (solo acqua)',
      'Ravanelli: 25–30 giorni dal seme al piatto',
      'Lattuga taglio-e-ricresci: 35 giorni e poi produce per mesi',
      '1m² ben coltivato = 4–5kg verdure in stagione',
      'Semi da avere SEMPRE: ravanelli, lattuga, spinaci, fagiolini, pomodori, zucchine',
    ],
    sections: [
      {
        heading: 'Colture per velocità (dal più rapido)',
        content: 'GIORNI 5–7: Germogli (lenticchie, piselli, ravanello, erba medica). Solo acqua, nessun suolo, temperatura ambiente. GIORNI 25–30: Ravanelli. GIORNI 35–45: Lattuga, spinaci, rucola (taglio e ricresci per mesi). GIORNI 55–65: Fagiolini, bietola. GIORNI 60–80: Zucchine (1 pianta produce 5–10kg), cetrioli. GIORNI 90–120: Pomodori, peperoni, melanzane, patate.',
      },
      {
        heading: 'Coltivazione in spazi ridotti',
        steps: [
          'Vasi da 20–30cm: pomodori ciliegina, peperoni, lattuga, erbe aromatiche',
          'Orto verticale: palette in legno con geotessuto — 1m² di parete = 15 piante lattuga',
          'Balcone esposizione sud: sufficiente per produzione significativa (lattuga, pomodori, erbe)',
          'Sacchi geotessuto da 50–100L: ideali per patate (produzione 3–5kg per sacco)',
          'Sistema quadrati: 1m² = 16 piante lattuga, 9 spinaci, 4 cavoli, 1 zucchina',
          'Cassette della frutta riciclate con doppio strato di plastica: ottimi vasi gratuiti',
        ],
      },
      {
        heading: 'Germogli — produzione rapida senza suolo',
        steps: [
          'Metti 2–3 cucchiai di semi in un vasetto di vetro',
          'Risciacqua e immergi in acqua per 8–12h (ammollo iniziale)',
          'Svuota l\'acqua, copri con garza o tessuto non tessuto tenuto con elastico',
          'Risciacqua 2 volte al giorno (mattina e sera), tieni il vasetto inclinato per drenare',
          'Giorni 2–3: compaiono i germinelli. Giorni 5–7: pronti da mangiare',
          'Conserva in frigo (se disponibile) max 3 giorni. Consuma crudi o saltati',
          'Semi utilizzabili: lenticchie, piselli, fagioli mungo, ravanello, broccoli, erba medica',
        ],
      },
      {
        heading: 'Semi da conservare — come e quali',
        steps: [
          'Usa SOLO semi non ibridi (non F1): producono piante identiche alla generazione successiva',
          'Conserva in buste di carta (non plastica) in luogo fresco, buio e asciutto',
          'Durata: pomodori 4 anni, zucchine 6 anni, lattuga 3 anni, fagiolini 3 anni, cipolla 1 anno',
          'Testa germinabilità: 10 semi su carta bagnata piegata, in luogo tiepido — conta germinati in 7 giorni',
          'Estrai semi da frutti maturi: fai asciugare su carta per 2 settimane prima di conservare',
          'Varietà locali e antiche: più resistenti e adatte al tuo microclima',
        ],
      },
      {
        heading: 'Fertilizzazione di emergenza',
        content: 'Compost da scarti cucina: in 30–60 giorni produce terriccio ricco. Macerato di ortica: azoto naturale — lascia ortica in acqua 2 settimane, diluisci 1:10 prima dell\'uso. Macerato di comfrey: potassio e fosforo — stesse modalità dell\'ortica. Fondi di caffè: acidificano il suolo, ottimi per pomodori. Gusci d\'uovo pestati: calcio, contro marciume apicale dei pomodori. Cenere di legna: potassio, ma alcalinizza — usa con moderazione.',
      },
    ],
    relatedGuides: ['cibo-scorte-piano', 'cibo-conservazione'],
    tasks: ['ci03'],
  },

  {
    id: 'cibo-cottura-campo',
    title: 'Cottura con Risorse Limitate',
    icon: 'ph-cooking-pot',
    category: 'cibo',
    source: 'FM 21-76',
    readTime: '3 min',
    quickRef: [
      'Metodo thermos: porta a bollore → metti in borsa termica avvolta in coperte → cuoce in 1–2h senza energia',
      'Pentola a pressione: dimezza i tempi (legumi 15 min invece di 45)',
      'Forno solare DIY: scatola + alluminio → 100–150°C (cottura lenta senza combustibile)',
      'Pane in padella: impasto, fuoco bassissimo, coperchio — pronto in 30 min',
      'Priorità energetica: bollitura per sicurezza acqua > cottura cibo',
    ],
    sections: [
      {
        heading: 'Metodo thermos (box cooker)',
        steps: [
          'Porta l\'alimento a bollore completo per 2–3 minuti',
          'Metti la pentola in una borsa termica o scatola di cartone imbottita con coperte',
          'Chiudi ermeticamente e lascia riposare',
          'Tempi: pasta/riso 40 min, legumi pre-ammollati 2h, carne 3–4h, stufato 4–6h',
          'Non aprire durante la cottura — la perdita di calore interrompe il processo',
          'Risparmio carburante: 80–90% rispetto alla cottura tradizionale',
        ],
      },
      {
        heading: 'Forno solare fai-da-te',
        steps: [
          'Prendi una scatola di cartone grande, rivestila internamente con carta di alluminio',
          'Coperchio: lastra di vetro o plastica trasparente rigida (crea effetto serra)',
          'Orienta verso il sole, inclina il coperchio a 45° per massimizzare riflessione',
          'Temperatura raggiungibile: 100–150°C in giornata soleggiata',
          'Ideale per: riso, pasta, stufati, pane, pastorizzazione acqua',
          'Limiti: funziona solo con sole diretto, cottura 2–3× più lenta del forno tradizionale',
        ],
      },
      {
        heading: 'Fuoco a legna — efficienza',
        steps: [
          'Tre pietre disposte a triangolo: forma naturale del fuoco da campo',
          'Legna secca e sottile brucia meglio della legna grossa e umida',
          'Fuoco a "stella": posiziona tronchi come raggi, spingi verso il centro man mano',
          'Riduci al minimo le fiamme dopo il primo avvio: braci = calore costante, minor consumo',
          'Pentola col coperchio: riduce del 50% i tempi di cottura e il consumo di carburante',
          'Fumo bianco = legna umida (inefficiente). Fumo nero = materiali sintetici (pericoloso)',
        ],
      },
      {
        heading: 'Ricette di base con scorte minime',
        content: 'Pane in padella: 250g farina, 150ml acqua, 5g sale, 5g lievito istantaneo. Mescola, forma disco, padella antiaderente a fuoco basso con coperchio, 15 min per lato. Minestrone di emergenza: legumi secchi pre-ammollati (12h) + qualsiasi verdura conservata + dado + pasta o riso — 20 min di cottura. Polenta: 250g farina di mais, 1L acqua salata — mescola costantemente per 30–40 min (o 15 in pentola a pressione).',
      },
    ],
    relatedGuides: ['cibo-conservazione', 'cibo-scorte-piano'],
    tasks: ['ci02', 'ci04'],
  },

  /* ══════════════════════ ENERGIA ══════════════════════ */
  {
    id: 'energia-blackout-protocollo',
    title: 'Blackout: Protocollo d\'Azione',
    icon: 'ph-lightning-slash',
    category: 'energia',
    source: 'FEMA · Protezione Civile',
    readTime: '3 min',
    quickRef: [
      'Primo 15 min: non aprire frigo/freezer — mantiene freddo 4h/24–48h',
      'Distacca gli elettrodomestici principali (protegge dai picchi di tensione al ritorno)',
      'Frigo: 4°C per max 4h senza apertura. Freezer pieno: 48h. Mezzo pieno: 24h',
      'Priorità energia di riserva: comunicazioni > illuminazione > cottura > ricarica',
      'Segnala l\'anomalia al gestore (Enel 800.900.860) per capire la durata prevista',
    ],
    sections: [
      {
        heading: 'Azione immediata (primi 30 minuti)',
        steps: [
          'Non aprire frigo e freezer — mantengono la temperatura se chiusi',
          'Distacca TV, computer, elettrodomestici — rischio picchi al ritorno corrente',
          'Lascia accesa UNA lampadina: quando torna la corrente, lo vedi subito',
          'Attiva torcia di emergenza (dovrebbe essere già sul comodino)',
          'Controlla se il blackout è solo tuo (fusibili) o di tutto il quartiere',
          'Chiama il gestore per sapere la durata prevista — decisione critica per i prossimi passi',
        ],
      },
      {
        heading: 'Gestione frigo e freezer',
        content: 'Frigo chiuso: mantiene alimenti sicuri per 4 ore. Freezer pieno chiuso: 48 ore. Freezer mezzo pieno: 24 ore. Regola di sicurezza: a 4°C per max 2 ore la carne è ancora sicura. Dopo 4 ore di frigo aperto o a temperatura ambiente: carne, latticini, uova, avanzi di cucina — se non sei sicuro, butta. "When in doubt, throw it out." Risparmia il cibo da freezer: cucina immediatamente i prodotti parzialmente scongelati.',
      },
      {
        heading: 'Priorità per l\'energia di riserva',
        steps: [
          '1° COMUNICAZIONI: carica telefono e radio — informazioni = sicurezza',
          '2° ILLUMINAZIONE: torce LED, lampade solari da giardino portate all\'interno',
          '3° RISCALDAMENTO: se temperatura esterna < 5°C, attiva riscaldamento alternativo',
          '4° COTTURA: usa fornello da campo per cena calda',
          '5° APPARECCHIATURE MEDICHE: generatore dedicato se ci sono dipendenti da macchine',
          'NON usare candele senza supervisione — sono responsabili del 30% degli incendi domestici',
        ],
      },
      {
        heading: 'Blackout prolungato (oltre 24h)',
        steps: [
          'Cucina gli alimenti più deperibili nelle prime 6h',
          'Se inverno e temperatura scende: isola una stanza (vedi guida isolamento)',
          'Coordinati con vicini: condivisione risorse, verifica anziani e fragili',
          'Acqua: riempi vasche e contenitori disponibili subito (la pressione potrebbe calare)',
          'Carburante: non fare il pieno a raffica — causa panico e code. Usa le riserve che hai',
          'Comunicazione con famiglia: punto di ritrovo fisso se i telefoni non funzionano',
        ],
      },
    ],
    relatedGuides: ['energia-generatore', 'isolamento-stanza', 'comm-piano-famiglia'],
    tasks: ['en01', 'en02', 'en04'],
  },

  {
    id: 'energia-generatore',
    title: 'Generatore: Uso Sicuro',
    icon: 'ph-engine',
    category: 'energia',
    source: 'FEMA · CDC',
    readTime: '3 min',
    quickRef: [
      'MAI in ambienti chiusi o semi-chiusi — il CO è incolore, inodore, letale in 5 minuti',
      'Posiziona a 5m+ da porte e finestre, scarico vento contrario alla casa',
      'Non superare il 75% della potenza nominale — protezione motore',
      'Rifornimento: SEMPRE spento e raffreddato (15 min). La benzina su motore caldo = incendio',
      'Manutenzione ogni 6 mesi: olio, candele, filtro aria — fallo girare 30 min ogni 3 mesi',
    ],
    sections: [
      {
        heading: 'Monossido di carbonio — il pericolo invisibile',
        content: 'Il CO è prodotto da qualsiasi motore a combustione. È incolore, inodore, insapore. Causa: cefalea (30 min), nausea e confusione (1–2h), perdita di coscienza e morte (2–3h) a concentrazioni di 400ppm. Un generatore da 2kW produce CO quanto 80 auto in moto. Sintomi simili all\'influenza in inverno: sospetta sempre avvelenamento da CO. Azione: porta fuori immediatamente, aria fresca, chiama il 118.',
      },
      {
        heading: 'Installazione corretta',
        steps: [
          'Posiziona all\'esterno su superficie piana, stabile, asciutta',
          'Distanza minima: 5m da porte, finestre, venti di aerazione',
          'Orientamento: lo scarico deve puntare lontano dalla casa',
          'Protezione pioggia: tettoia o riparo laterale (non chiuso) — mai copertura ermetica',
          'Installa rilevatore CO in ogni piano della casa se usi il generatore regolarmente',
          'Collegamento casa: usa extension certificate per il carico previsto (mai prolunga normale)',
        ],
      },
      {
        heading: 'Manutenzione preventiva',
        steps: [
          'Ogni 3 mesi: fai girare il generatore per 30 minuti sotto carico (torce, frigorifero)',
          'Ogni 6 mesi: cambio olio (olio SAE 10W-30 o come indicato nel manuale)',
          'Ogni anno: candele di accensione, filtro aria, filtro carburante',
          'Verifica livello olio PRIMA di ogni utilizzo — motori senza olio si fondono in minuti',
          'Carburante: usa benzina fresca — la benzina "vecchia" (oltre 30 giorni) causa problemi di avvio',
          'Con stabilizzatore carburante: benzina buona per 12 mesi',
        ],
      },
    ],
    relatedGuides: ['energia-blackout-protocollo'],
    tasks: ['en01', 'en04'],
  },

  /* ══════════════════════ CALORE ══════════════════════ */
  {
    id: 'isolamento-stanza',
    title: 'Isolamento Stanza di Emergenza',
    icon: 'ph-house-line',
    category: 'calore',
    source: 'FEMA · FM 21-76',
    readTime: '3 min',
    quickRef: [
      'Isola UNA sola stanza — quella più piccola, con meno finestre, esposta a sud',
      'Coperte/teli sulle finestre: riducono -25–35% la dispersione termica',
      'Porta: bozze tappate con asciugamani arrotolati = guadagno 3–5°C',
      'Tutti in una stanza: corpo umano produce 100W di calore — 4 persone = 400W',
      'Obiettivo minimo: mantenere 15°C nella stanza chiave',
    ],
    sections: [
      {
        heading: 'Scegliere la stanza giusta',
        content: 'Criteri di selezione: la più piccola (meno volume da riscaldare), esposizione sud (sole invernale), meno finestre e porte esterne, piano intermedio (il calore sale dai piani inferiori), lontana da muri perimetrali nord. Ideale: camera da letto interna, bagno con finestra piccola. Evita: garage, sottotetto, qualsiasi stanza con grandi vetrate.',
      },
      {
        heading: 'Isolamento rapido delle aperture',
        steps: [
          'Finestre: appendi coperte pesanti, teli di plastica spessi o cartoni con strato d\'aria',
          'Fissa con nastro da imballo extra-forte o puntine — sigilla i bordi',
          'Porta: asciugamani arrotolati sul pavimento contro la fessura inferiore',
          'Nastro isolante (foam tape) sui bordi della porta: -15% dispersione aggiuntiva',
          'Tappi per le prese elettriche: bloccano correnti d\'aria dai cavi nella parete',
          'Camino: se non in uso, tappa con borsa di plastica gonfiata o cuscino',
        ],
      },
      {
        heading: 'Massimizzare il calore corporeo',
        content: 'Ogni persona a riposo produce circa 80W di calore, in attività 300–500W. 4 persone in una stanza di 15m² = radiatori che lavorano continuamente. Concentra tutta la famiglia in un\'unica stanza nelle ore notturne. Letto improvvisato: materassi sul pavimento più vicini al centro — lontano dai muri perimetrali freddi. Sistema a strati per dormire: pigiama tecnico + felpa + sacco a pelo + coperta in mylar sopra.',
      },
      {
        heading: 'Controllo dell\'umidità',
        content: 'In stanza chiusa con persone: l\'umidità sale rapidamente. Umidità > 70% sensazione freddo aumenta e muffa si forma. Ventila 5 minuti ogni 4–6 ore: apri finestra di 2cm, poi risigilla. Evita di cucinare nella stanza isolata se non necessario — produzione di vapore è alta. Assorbitore di umidità (silica gel o sale in ciotola): riduci umidità residua.',
      },
    ],
    relatedGuides: ['riscaldamento-alternativo', 'ipotermia-prevenzione'],
    tasks: ['ca04'],
  },

  {
    id: 'riscaldamento-alternativo',
    title: 'Riscaldamento Alternativo',
    icon: 'ph-flame',
    category: 'calore',
    source: 'FM 21-76 · FEMA',
    readTime: '4 min',
    quickRef: [
      'Stufa legna/pellet: soluzione ottimale, 65–90% efficienza, NESSUN rischio CO se ben installata',
      'GPL in cartuccia (da campeggio): max 2–3h continuative, finestra aperta OBBLIGATORIA',
      'Candele: 10 candele in stanza 15m² = +2–3°C — pericolose senza supervisione',
      'MAI: barbecue, braciere, carbonella, generatori al chiuso — CO letale in minuti',
      'Rilevatore CO: obbligatorio se usi qualsiasi combustibile al chiuso',
    ],
    sections: [
      {
        heading: 'Stufa a legna / pellet (soluzione ottimale)',
        content: 'La stufa a legna è la soluzione di riscaldamento d\'emergenza più sicura ed efficiente. Efficienza: stufa moderna a legna 60–70%, pellet 85–92%. Non dipende da elettricità (eccetto pellet automatico). Canna fumaria esistente: si può installare una stufa a legna relativamente facilmente. Stima consumo: 3–5kg legna/h per stanza 30m² a -5°C. Pellet: 0.5–1kg/h in condizioni simili. Stock 30 giorni: 300–400kg legna oppure 150–200kg pellet.',
      },
      {
        heading: 'Riscaldatori da campeggio a GPL (emergenza)',
        steps: [
          'Solo modelli certificati CE con valvola di sicurezza anti-ribaltamento',
          'Usa ESCLUSIVAMENTE in stanza ventilata: finestra aperta almeno 3–4cm',
          'Sessioni max 2–3 ore continue, poi pausa con aerazione completa 10 min',
          'MAI durante il sonno — non sveglieresti se si verificasse avvelenamento da CO',
          'Posiziona sul pavimento, su superficie stabile, lontano da tessuti',
          'Autonomia cartuccia da 450g: 3–5h a bassa potenza. Stocca almeno 20 cartucce per 30 giorni',
        ],
      },
      {
        heading: 'Sistema a strati per il corpo (abbigliamento)',
        steps: [
          'Base: lana merino o materiale tecnico — MAI cotone (trattiene umidità, raffredda)',
          'Mid: pile, maglione lana, gilet piumino',
          'Outer: giacca antivento impermeabile (blocca convezione)',
          'Testa: cappello di lana — il 30–40% del calore si disperde dalla testa',
          'Mani: guanti anche in casa, soprattutto di notte',
          'Piedi: calze di lana + stivali o pantofole isolate — il freddo ai piedi abbassa tutta la temperatura percepita',
        ],
      },
      {
        heading: 'Riconoscere avvelenamento da CO',
        content: 'Sintomi iniziali (simili all\'influenza): mal di testa pulsante, nausea, affaticamento inspiegabile, confusione. DIFFERENZA dall\'influenza: i sintomi migliorano uscendo all\'aria aperta e peggiorano rientrando. Azione immediata: esci subito dalla stanza, porta fuori tutti, chiama il 118, non rientrare finché i soccorsi non danno il via libera. Se qualcuno è privo di sensi: trascinalo fuori (non farne una vittima aggiuntiva), chiama il 118, RCP se necessario.',
      },
    ],
    relatedGuides: ['isolamento-stanza', 'ipotermia-prevenzione'],
    tasks: ['ca01', 'ca02', 'ca03'],
  },

  {
    id: 'ipotermia-prevenzione',
    title: 'Ipotermia: Prevenzione e Trattamento',
    icon: 'ph-snowflake',
    category: 'calore',
    source: 'FM 4-25.11 · FM 21-76',
    readTime: '3 min',
    quickRef: [
      'Ipotermia lieve (33–36°C): brividi forti — riparo, asciugatura, bevanda calda dolce',
      'Moderata (28–33°C): brividi cessano (segno NEGATIVO), confusione — urgente',
      'Grave (<28°C): perdita coscienza — RCP + 118 immediatamente',
      'NON frizionare gli arti — rischio aritmia fatale per sangue freddo che arriva al cuore',
      'Bambini e anziani: ipotermia compare molto più velocemente degli adulti',
    ],
    sections: [
      {
        heading: 'Riconoscere i livelli di ipotermia',
        content: 'LIEVE (33–36°C): brividi intensi e incontrollabili, pelle pallida, difficoltà di movimento, confusione lieve. MODERATA (28–33°C): brividi cessano (il corpo ha smesso di combattere — segnale grave), rigidità muscolare, sonnolenza, discorso inarticolato, pupille dilatate. GRAVE (<28°C): perdita di coscienza, polso debolissimo o assente, respiro superficiale, rigidità da freddo simile a morte apparente. NOTA: una persona in ipotermia grave può sembrare morta ma rianimarsi con cure appropriate.',
      },
      {
        heading: 'Trattamento ipotermia lieve',
        steps: [
          'Porta al riparo da vento, pioggia, pavimento freddo — immediatamente',
          'Rimuovi TUTTI gli indumenti bagnati — tessuto bagnato raffredda 25× più del freddo secco',
          'Asciuga il corpo completamente con asciugamani asciutti',
          'Avvolgi in coperte asciutte, coperta termica mylar, o sacco a pelo',
          'Bevanda calda dolce (non alcolica): tè, brodo, acqua calda con zucchero',
          'Scalda le zone centrali: ascelle, inguine, collo — NON frizionare le estremità',
          'Monitora il miglioramento: i brividi devono riprendere intensità poi diminuire',
        ],
      },
      {
        heading: 'Trattamento ipotermia moderata/grave',
        steps: [
          'Chiama il 118 immediatamente — questa è emergenza medica vera',
          'Muovi il paziente il MENO possibile e MOLTO delicatamente (rischio aritmia)',
          'Orizzontale, mai verticale — il sangue freddo agli arti non deve affluire al cuore di colpo',
          'Coperte da ogni lato incluso sotto (il freddo sale dal suolo)',
          'Coperta termica mylar: riflette il 90% del calore corporeo residuo',
          'NON somministrare bevande se incosciente — rischio soffocamento',
          'Se assenza di polso e respiro: inizia RCP e continua fino all\'arrivo del 118',
        ],
      },
      {
        heading: 'Prevenzione — cosa fare prima',
        content: 'Riconosci i segnali precoci: "The Umbles" — stumbles (inciampa), mumbles (balbetta), grumbles (si lamenta senza ragione), tumbles (cade). Questi sono segnali di ipotermia lieve che può peggiorare rapidamente. Prevenzione attiva: mangia cibo ad alto contenuto calorico (grassi e zuccheri = carburante per il calore corporeo), rimani idratato, evita il sudore eccessivo (cambia strati prima di fermarti), non consumare alcol (falso calore che aumenta la dispersione termica).',
      },
    ],
    relatedGuides: ['isolamento-stanza', 'riscaldamento-alternativo'],
    tasks: ['ca03'],
  },

  /* ══════════════════════ MEDICO ══════════════════════ */
  {
    id: 'kit-medico',
    title: 'Kit Medico Completo',
    icon: 'ph-first-aid',
    category: 'medico',
    source: 'FM 4-25.11 · Croce Rossa',
    readTime: '4 min',
    quickRef: [
      'Kit minimo: garze, cerotti, disinfettante, bende, laccio emostatico, antidolorifici',
      'Antibiotico topico (Bactroban/Neomicina): essenziale per ferite infette senza medico',
      'Termometro: indispensabile per monitorare febbre e progressione',
      'Lista farmaci cronici: riserva 30 giorni per ogni membro con terapia continuativa',
      'Rinnova il kit ogni 12 mesi — controlla scadenze medicinali',
    ],
    sections: [
      {
        heading: 'Contenuto kit base (obbligatorio)',
        content: 'ANTISETTICI: flacone povidone-iodina (Betadine) 250ml, acqua ossigenata 10 volumi, alcol isopropilico 70%. MEDICAZIONI: garze sterili (10×10 e 20×20), cerotti assortiti, bende elastiche 5cm e 10cm, cerotto da medicazione in rotolo. STRUMENTI: forbici a punta smussa, pinzette, ago da sutura curvo + filo (per emergenze), guanti in lattice monouso (10 paia). FARMACI BASE: paracetamolo, ibuprofene, antistaminico (es. cetirizina), antidiarroico (loperamide), antiacido, carbone vegetale attivo.',
      },
      {
        heading: 'Materiali avanzati (fortemente consigliati)',
        steps: [
          'Laccio emostatico (tourniquet) tipo CAT o equivalente — può salvare una vita in caso di emorragia grave',
          'Cerotto emostatico (tipo QuikClot): blocca emorragie massive in attesa dei soccorsi',
          'SAM Splint (stecca malleabile): immobilizzazione fratture e distorsioni',
          'Collare cervicale morbido: trauma cranico o colonna cervicale',
          'Coperta termica mylar (minimo 2): ipotermia, shock, trasporto feriti',
          'Termometro digitale impermeabile: ascellare e timpanico',
          'Sfigmomanometro manuale + fonendoscopio: monitoraggio pressione senza elettricità',
          'Pinza per splinter (schegge), ago sterile, bisturi monouso',
        ],
      },
      {
        heading: 'Farmaci da avere sempre (con ricetta medico)',
        steps: [
          'Antibiotico a largo spettro (amoxicillina o azitromicina): per infezioni batteriche senza accesso a medico — chiedi al medico di base',
          'Cortisone (prednisone): reazioni allergiche gravi, asma in emergenza',
          'Antispastico (buscopan): coliche addominali, spasmi muscolari',
          'Farmaci cronici familiari: 30+ giorni di scorta per ogni terapia continuativa',
          'Antiparassitario (permethrina): trattamento indumenti contro zecche e insetti (in zone rurali)',
          'Collirio antibiotico: congiuntiviti batteriche',
        ],
      },
      {
        heading: 'Conservazione e manutenzione',
        steps: [
          'Conserva in contenitore rigido impermeabile (cassetta di plastica con coperchio ermetico)',
          'Al riparo da luce solare, umidità, temperature estreme — non in auto (temperature eccessive)',
          'Inventario annuale: controlla ogni scadenza, sostituisci ciò che scade nei prossimi 6 mesi',
          'Lista contenuto sul coperchio: in emergenza non devi cercare, devi agire',
          'Tutti i membri della famiglia sanno DOVE si trova il kit',
          'Separa farmaci per bambini da quelli per adulti — etichette chiare',
        ],
      },
    ],
    relatedGuides: ['primo-soccorso', 'farmaci-scorta'],
    tasks: ['me01'],
  },

  {
    id: 'primo-soccorso',
    title: 'Primo Soccorso Base',
    icon: 'ph-heart',
    category: 'medico',
    source: 'FM 4-25.11 · IRC',
    readTime: '5 min',
    quickRef: [
      'ABCDE: Airway (vie aeree) → Breathing → Circulation → Disability → Exposure',
      'Arresto cardiaco: 30 compressioni + 2 insufflazioni — ritmo "Stayin\' Alive" (100–120/min)',
      'Emorragia: comprimi DIRETTAMENTE per 10 min senza alzare. Se non si ferma: laccio emostatico',
      'Ostruzione vie aeree cosciente: 5 colpi schiena + 5 manovre di Heimlich',
      'Frattura: immobilizza COM\'È — non raddrizzare mai un arto deformato',
    ],
    sections: [
      {
        heading: 'Valutazione primaria ABCDE',
        steps: [
          'A — Airway: "Parli?" Se risponde è cosciente con vie aeree aperte. Se no: inclina testa, solleva mento per aprire le vie aeree',
          'B — Breathing: conta i respiri per 10 secondi. Normale: 12–20 atti/min adulto. Assenza di respiro: avvia RCP',
          'C — Circulation: cerca emorragie visibili. Comprimi immediatamente qualsiasi sanguinamento abbondante',
          'D — Disability: è cosciente? Risponde a domande semplici? Muove gli arti? Pupille uguali?',
          'E — Exposure: cerca lesioni nascoste da vestiti — taglia gli indumenti se necessario',
          'Chiama il 118 dopo la valutazione primaria se le condizioni lo richiedono',
        ],
      },
      {
        heading: 'RCP (Rianimazione Cardio-Polmonare)',
        steps: [
          'Verifica coscienza: scuoti spalle, grida "Stai bene?"',
          'Se incosciente e non respira normalmente: chiama il 118 o fai chiamare da qualcun altro',
          'Posiziona sul dorso su superficie rigida',
          'Incrocia le mani al centro del petto (metà inferiore dello sterno)',
          'Comprimi 5–6 cm di profondità, ritmo 100–120/min (Stayin\' Alive dei Bee Gees)',
          '30 compressioni + 2 insufflazioni (1 secondo ciascuna, espansione del torace visibile)',
          'Continua senza interruzioni fino all\'arrivo dei soccorsi o al recupero della coscienza',
          'Se solo: fai solo le compressioni senza insufflazioni (hands-only CPR) — efficace ugualmente',
        ],
      },
      {
        heading: 'Gestione emorragie',
        steps: [
          'Indossa guanti prima di toccare sangue altrui (kit medico)',
          'Comprimi DIRETTAMENTE sulla ferita con garza o tessuto pulito',
          'Premi continuamente per 10 minuti senza alzare per controllare',
          'Se il sangue attraversa la garza: AGGIUNGI altra garza sopra, non togliere quella sotto',
          'Emorragia che non si ferma agli arti: laccio emostatico 5–8 cm sopra la ferita',
          'Scrivi l\'ora di applicazione del laccio — comunicala al 118',
          'Non rimuovere MAI il laccio — solo personale medico',
          'Ferite al petto (pneumotorace): copri con plastica su 3 lati, lascia un lato aperto come valvola',
        ],
      },
      {
        heading: 'Manovre disostruzione vie aeree',
        steps: [
          'Adulto cosciente con ostruzione: "Tossisci!" Se non riesce:',
          '5 colpi secchi tra le scapole con il palmo aperto (piegate in avanti)',
          '5 manovre di Heimlich: stai dietro, pugni a livello ombelico, tira verso te e verso l\'alto',
          'Alterna 5 colpi + 5 Heimlich fino a disostruzione o perdita di coscienza',
          'Se perde coscienza: avvia RCP (le compressioni possono liberare il corpo estraneo)',
          'Bambino < 1 anno: MAI Heimlich — 5 colpi sul dorso + 5 compressioni torace',
          'Donna incinta: Heimlich a livello del torace (non addome)',
        ],
      },
    ],
    relatedGuides: ['kit-medico', 'farmaci-scorta'],
    tasks: ['me03'],
  },

  {
    id: 'farmaci-scorta',
    title: 'Farmaci: Scorta di Emergenza',
    icon: 'ph-pill',
    category: 'medico',
    source: 'WHO · FEMA',
    readTime: '3 min',
    quickRef: [
      'Scorta minima: 30 giorni per ogni farmaco cronico di tutti i membri della famiglia',
      'Paracetamolo + ibuprofene: pilastri — dolore, febbre, infiammazione',
      'Loperamide (Imodium): essenziale — la diarrea non trattata causa disidratazione letale',
      'Antistaminico: allergie, punture insetti, reazioni lievi',
      'Controlla scadenze ogni 6 mesi — molti farmaci durano 1–3 anni oltre la data',
    ],
    sections: [
      {
        heading: 'Lista farmaci da banco obbligatori',
        content: 'DOLORE/FEBBRE: paracetamolo 500mg e 1000mg (adulti + bambini), ibuprofene 400mg. GASTROINTESTINALI: loperamide (Imodium) per diarrea, simeticone per meteorismo, antiacido (Maalox), sali reidratanti ORS, carbone vegetale attivo per intossicazioni. ALLERGIE: cetirizina o loratadina (antistaminico non sonnolento), prometazina (sonnolento, utile per allergie gravi). ANTISETTICI: acqua ossigenata, betadine, alcol isopropilico 70%. ALTRO: vitamina C, vitamina D, integratore multivitaminico, melatonina (disturbi sonno in emergenza).',
      },
      {
        heading: 'Farmaci cronici — gestione scorte',
        steps: [
          'Fai lista completa di tutti i farmaci cronici di ogni membro della famiglia',
          'Calcola 30 giorni di scorta: chiedi al medico di base ricetta in anticipo',
          'Spiega al medico il motivo (preparedness) — molti medici supportano questa richiesta',
          'Riordina quando sei a 10 giorni dalla fine delle scorte — non aspettare l\'ultimo giorno',
          'Conserva in contenitore separato etichettato con nome, dose, frequenza, scadenza',
          'Se in viaggio o evacuazione: i farmaci cronici sono la prima cosa da portare',
        ],
      },
      {
        heading: 'Scadenze — la verità',
        content: 'La data di scadenza garantisce potenza e sicurezza certificate dal produttore. Ricerche militari USA (per le scorte) mostrano che molti farmaci mantengono il 90%+ di efficacia per 10–15 anni oltre la scadenza se conservati correttamente. Eccezioni importanti: insulina (non usare mai scaduta), nitrati per cuore, adrenalina (EpiPen), antibiotici liquidi (solidi sono più stabili), tetracicline (possono diventare tossiche). Regola pratica: farmaci solidi (compresse, capsule) conservati al fresco e buio: considera buoni fino a 2–3 anni oltre la data.',
      },
    ],
    relatedGuides: ['kit-medico', 'primo-soccorso'],
    tasks: ['me01', 'me02'],
  },

  /* ══════════════════════ COMUNICAZIONI ══════════════════════ */
  {
    id: 'comm-piano-famiglia',
    title: 'Piano di Comunicazione Famiglia',
    icon: 'ph-users',
    category: 'comm',
    source: 'FEMA · Protezione Civile',
    readTime: '3 min',
    quickRef: [
      'Punto di ritrovo 1: vicino casa (es. angolo della strada). Punto 2: fuori dal quartiere',
      'Contatto fuori zona: parente/amico in altra città — centralino di notizie',
      'Check-in: ore fisse (es. 08:00 e 20:00) su canale walkie-talkie predefinito',
      'Stampa tutto su carta — non dipendere solo dai telefoni',
      'Definisci PRIMA chi va a prendere i bambini a scuola se l\'emergenza avviene di giorno',
    ],
    sections: [
      {
        heading: 'I 5 elementi del piano',
        content: '1. PUNTI DI RITROVO: due punti fisici pre-concordati (vicino e lontano da casa). 2. CONTATTO ESTERNO: una persona in un\'altra città che tutti possono raggiungere e che coordina le notizie tra i vari rami della famiglia. 3. ORARI DI CHECK-IN: ogni 12 ore, stesso canale, stessa frequenza. 4. LISTA CONTATTI STAMPATA: tutti i numeri importanti su carta — non solo nella memoria del telefono. 5. PIANO PER I BAMBINI: chi li prende a scuola se l\'emergenza avviene durante le ore scolastiche.',
      },
      {
        heading: 'Crea la tua lista contatti cartacea',
        steps: [
          'Scrivi i numeri di: tutti i membri della famiglia, nonni, zii, amici stretti',
          'Aggiungi: medico di famiglia, farmacia di fiducia, vicino di casa fidato',
          'Numeri di emergenza: 112 (emergenze), 115 (vigili del fuoco), 118 (soccorso medico), 1515 (emergenze ambientali)',
          'Numeri utili: numero guasti del distributore di elettricità (è scritto in bolletta), gestore acqua locale, comune/protezione civile locale',
          'Contatto fuori zona: nome, due numeri di telefono, indirizzo',
          'Plastifica la lista o mettila in busta impermeabile — una copia per ogni membro della famiglia',
        ],
      },
      {
        heading: 'Protocollo di comunicazione',
        steps: [
          'In caso di emergenza: invia prima SMS (consumano meno banda dei telefoni e passano anche con rete congestionata)',
          'Whatsapp e Telegram funzionano anche con 2G — più affidabili delle chiamate in emergenza di massa',
          'Se rete completamente giù: walkie-talkie PMR446, canale 8, check-in alle ore concordate',
          'Canale radio: sintonizza radio FM su emittente locale — Protezione Civile interrompe i programmi',
          'Non intasare il telefono con chiamate ripetute — un SMS ogni 30 min è più efficace',
          'Se batteria scarica: risparmia per comunicazioni essenziali, spegni dati mobili quando non cerchi info',
        ],
      },
    ],
    relatedGuides: ['comm-pmr446', 'comm-radio-canali'],
    tasks: ['co03'],
  },

  {
    id: 'comm-pmr446',
    title: 'Walkie-Talkie PMR446 — Guida',
    icon: 'ph-broadcast',
    category: 'comm',
    source: 'ETSI · Protezione Civile',
    readTime: '3 min',
    quickRef: [
      'PMR446: libero da licenza in tutta Europa, 8 canali (o 16 digitali), max 0.5W',
      'Canale 8: usato per abitudine come canale di chiamata d\'emergenza tra utenti — non è un canale ufficiale della Protezione Civile',
      'Portata reale: 0.5–2 km in città, 2–5 km in pianura aperta, 500m in edifici',
      'Codici CTCSS/DCS (sub-toni): filtrano le interferenze — usa lo stesso codice in famiglia',
      'Batterie: preferisci AA ricaricabili (NiMH 2500mAh) — ricaricabili con pannello solare',
    ],
    sections: [
      {
        heading: 'Frequenze e canali',
        content: 'I walkie-talkie PMR446 operano nella banda UHF 446 MHz. Canali standard: 8 canali da 446.00625 a 446.09375 MHz (passo 12.5 kHz). Canali digitali (dPMR446): 16 canali con compressione digitale, portata leggermente superiore. CANALE 8 (446.09375 MHz): convenzionalmente usato per chiamata di emergenza e coordinamento iniziale. Una volta stabilito il contatto, spostatevi su un canale meno frequentato per comunicazioni private.',
      },
      {
        heading: 'Protocollo di comunicazione',
        steps: [
          'Prima di trasmettere: ascolta per 5 secondi — verifica che il canale sia libero',
          'Premi il PTT (Push-To-Talk), aspetta 1 secondo, poi parla chiaramente e lentamente',
          'Parla a 5–10 cm dal microfono, angolo di 45° — non contro il microfono',
          'Identificati sempre: "Qui Marco a Base, passo"',
          'Fine trasmissione: "Passo" (attendo risposta) o "Passo e chiudo" (fine comunicazione)',
          'Mai trasmettere e rispondere simultaneamente — sistema semiduplex, uno per volta',
          'Parola profetica in testo non chiaro: usa l\'alfabeto fonetico (Alfa, Bravo, Charlie...)',
        ],
      },
      {
        heading: 'Massimizzare la portata',
        steps: [
          'Posizione: più alto = più portata. Salire su un tetto o collinetta può triplicare la distanza',
          'Antenna: sempre verticale e all\'esterno del corpo — il corpo assorbe il segnale',
          'In città: pareti e solai attenuano il segnale. Usa corridoi e aperture per mantenere linea visiva',
          'Batterie cariche: portata cala significativamente con batterie scariche',
          'Ripetitore: un walkie-talkie in posizione elevata può funzionare da relé tra due punti',
          'Manutenzione: pulisci i contatti delle batterie ogni 3 mesi con alcol isopropilico',
        ],
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'comm-radio-canali'],
    tasks: ['co02'],
  },

  {
    id: 'comm-radio-canali',
    title: 'Radio: Frequenze Emergenza Italia',
    icon: 'ph-radio',
    category: 'comm',
    source: 'Protezione Civile · ARRL',
    readTime: '2 min',
    quickRef: [
      'RAI Radio 1: canale ufficiale comunicazioni Protezione Civile durante emergenze',
      'RAI Radio 1 principali frequenze: 89.7 (Milano), 97.7 (Roma), 93.7 (Napoli)',
      'PMR446 canale 8: emergenza civile volontaria',
      'Radio portatile a manovella: NON dipende da corrente, funziona sempre',
      'AM (onde medie/corte): portata molto superiore all\'FM, fondamentale per notizie nazionali',
    ],
    sections: [
      {
        heading: 'Frequenze di emergenza per zona',
        content: 'RAI RADIO 1 (canale di allerta ufficiale): Milano/Lombardia 89.7 FM, Roma/Lazio 97.7 FM, Napoli/Campania 93.7 FM, Torino/Piemonte 89.3 FM, Bologna/Emilia 99.7 FM, Firenze/Toscana 98.0 FM, Palermo/Sicilia 101.0 FM. Per la tua zona specifica: cerca "RAI Radio 1 frequenza [tua città]" e stampa il numero. RADIO LOCALI: le emittenti locali spesso trasmettono aggiornamenti di emergenza più puntuali di quelle nazionali.',
      },
      {
        heading: 'Cosa ascoltare e quando',
        steps: [
          'Blackout: accendi subito la radio — le emittenti FM con UPS trasmettono fino a 12–24h',
          'Emergenza regionale: preferisci emittenti locali — informazioni più aggiornate e geograficamente precise',
          'Notizie nazionali: RAI Radio 1 AM 1332 kHz — portata notturna su tutta Italia',
          'In zone remote: onde corte (SW) per notizie internazionali — utile in crisi prolungate',
          'Protezione Civile interrompe i programmi normali per allerte — non spegnere la radio',
          'Tieni un\'agenda con le frequenze scritte — non fare affidamento sulla memoria',
        ],
      },
      {
        heading: 'Tipi di radio — quale scegliere',
        content: 'RADIO A MANOVELLA (consigliata): AM/FM/SW + ricarica a dinamo + solare + USB. Indipendente da corrente e batterie. Costo €20–50. Marchi affidabili: Kaito, Eton, Sangean. RADIO PORTATILE FM: economica, ottima ricezione FM. Usa batterie AA. Portata FM limitata (entro 200km). RADIO VHF/UHF (scanner): riceve anche frequenze dei servizi di emergenza. Richiede programmazione. SMARTPHONE CON FM: molti smartphone hanno chip FM — attiva in caso di emergenza, consuma meno batteria dello streaming.',
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'comm-pmr446'],
    tasks: ['co01'],
  },

  /* ══════════════════════ MOBILITÀ ══════════════════════ */
  {
    id: 'gobag-checklist',
    title: 'Go-Bag: Lista Completa',
    icon: 'ph-backpack',
    category: 'mobilita',
    source: 'FEMA · FM 21-76',
    readTime: '4 min',
    quickRef: [
      'Go-bag = 72 ore di autonomia in uno zaino pronto da prendere in 2 minuti',
      'Peso massimo: 15–20% del peso corporeo — non esagerare con le scorte',
      'Priorità assoluta: documenti originali + farmaci cronici + telefono carico',
      'Tienila pronta: ricarica i power bank mensilmente, controlla cibo ogni 6 mesi',
      'Una per ogni membro della famiglia: ogni persona porta la propria',
    ],
    sections: [
      {
        heading: 'Documenti (priorità assoluta)',
        steps: [
          'Originali: carta d\'identità, passaporto, codice fiscale, patente',
          'Fotocopie plastificate: tutti i documenti di cui sopra + tessera sanitaria',
          'Dati assicurativi: polizza casa, auto, sanitaria — numero di telefono sinistri',
          'Contatti bancari: IBAN, numero carta di credito (solo gli ultimi 4 cifre), numero blocco carta',
          'Contatti medici: medico di famiglia, specialisti, gruppo sanguigno, allergie note',
          'Contatti di emergenza: lista stampata con 15–20 numeri importanti',
          'Chiavi: copia chiavi di casa, auto, box',
        ],
      },
      {
        heading: 'Acqua e cibo (72 ore)',
        steps: [
          'Acqua: almeno 3L per persona (1L/giorno minimo emergenza)',
          'Filtro portatile (Sawyer Squeeze): accesso a qualsiasi fonte d\'acqua',
          'Pastiglie di purificazione: backup compatto ed efficace',
          'Cibo ad alta densità calorica: barrette energetiche, noci, cioccolato fondente, crackers',
          'Cibo per bambini e anziani: specifico per le loro esigenze',
          'Apriscatole + posate leggere (titanio o plastica resistente)',
          'Busta termica o thermos: per consumare cibo caldo anche senza cucina',
        ],
      },
      {
        heading: 'Equipaggiamento essenziale',
        steps: [
          'Torcia LED con batterie spare + torcia frontale (mani libere)',
          'Power bank 20.000mAh carico: 4–6 ricariche smartphone',
          'Cavo multiconnettore (USB-C + Lightning + micro-USB)',
          'Radio a manovella compatta: notizie senza corrente',
          'Kit primo soccorso compatto: garze, cerotti, disinfettante, antidolorifici, laccio emostatico',
          'Farmaci cronici: 7 giorni di scorta in contenitore impermeabile',
          'Coperta termica mylar (almeno 2): emergenza freddo, segnalazione',
          'Fischietto: segnalazione acustica visibile a 100m in ambienti chiusi (crolli)',
          'Coltello multiuso: strumento universale',
          'Accendino + fiammiferi impermeabili: fuoco per calore e cottura',
          'Contanti: 200–500€ in banconote piccole (bancomat/POS possono non funzionare)',
        ],
      },
      {
        heading: 'Manutenzione periodica',
        content: 'Ogni mese: ricarica tutti i power bank e le batterie ricaricabili. Ogni 3 mesi: controlla acqua (sostituisci se in bottiglie di plastica), test del fischietto e torcia. Ogni 6 mesi: sostituisci il cibo (consuma quello vecchio nella dieta quotidiana e reinserisci fresco), controlla i farmaci per scadenza. Ogni anno: aggiorna i documenti se scaduti, rivedi la lista completa. Stagionalmente: adatta l\'abbigliamento nella go-bag alla stagione.',
      },
    ],
    relatedGuides: ['evacuazione-piano', 'mappe-offline'],
    tasks: ['mo02'],
  },

  {
    id: 'mappe-offline',
    title: 'Mappe Offline: Setup e Uso',
    icon: 'ph-map-trifold',
    category: 'mobilita',
    source: 'OpenStreetMap',
    readTime: '2 min',
    quickRef: [
      'Scarica le mappe ADESSO — in emergenza la rete è sovraccarica o assente',
      'Organic Maps (iOS/Android): gratuita, open source, dati OSM, ottima per zona rurale',
      'Maps.me: alternativa popolare, più funzionalità ma meno privata',
      'Scarica anche: regione + 2 regioni confinanti + percorso verso luogo di rifugio',
      'Mappa cartacea: stampa o acquista sempre un backup fisico — il telefono si scarica',
    ],
    sections: [
      {
        heading: 'Setup immediato (fai ora)',
        steps: [
          'Installa Organic Maps (gratuita, no account richiesto)',
          'Scarica: tua provincia + province confinanti',
          'Se hai un luogo di rifugio alternativo (parenti fuori regione): scarica anche quella regione',
          'Segna come preferiti: casa, posto di lavoro, ospedale più vicino, punto di ritrovo familia, stazione/autostrada',
          'Scarica anche Maps.me come backup con le stesse mappe',
          'Testa offline: attiva modalità aereo e verifica che le mappe funzionino',
        ],
      },
      {
        heading: 'Mappa cartacea — il backup che non si scarica',
        steps: [
          'Acquista una mappa stradale regionale in cartoleria (€5–10)',
          'Oppure: stampa da OpenStreetMap.org selezione della tua zona, scala 1:50.000',
          'Evidenzia: casa, percorso alternativo alla destinazione, punti di rifornimento acqua/cibo, ospedali',
          'Plastifica o metti in busta impermeabile — nella go-bag',
          'Impara a leggere le curve di livello: la quota è informazione vitale in montagna',
        ],
      },
      {
        heading: 'Percorsi alternativi — pianifica ora',
        content: 'Per ogni destinazione frequente (lavoro, scuola, parenti) identifica 3 percorsi diversi: principale (autostrada), alternativo (statale), emergenza (strade provinciali/comunali). Considera: ponti potrebbero essere chiusi (alluvione), gallerie bloccate (terremoto), autostrade intasate (evacuazione di massa). Un percorso in bici: utile se il carburante è esaurito. I percorsi secondari sono spesso mantenuti aperti meglio di quelli principali in caso di calamità locali.',
      },
    ],
    relatedGuides: ['gobag-checklist', 'evacuazione-piano'],
    tasks: ['mo03'],
  },

  {
    id: 'evacuazione-piano',
    title: 'Piano di Evacuazione',
    icon: 'ph-door-open',
    category: 'mobilita',
    source: 'FEMA · Protezione Civile',
    readTime: '3 min',
    quickRef: [
      'Regola dei 2 minuti: dalla decisione di evacuare all\'uscita di casa in 2 minuti',
      'Go-bag sempre pronta: non stai preparando — stai PRENDENDO e USCENDO',
      'Destinazione predefinita: almeno 2 opzioni concordate con la famiglia',
      'Auto: serbatoio sempre sopra metà — in emergenza le stazioni si esauriscono in ore',
      'Mappa cartacea in auto: non dipendere dal GPS con rete congestionata',
    ],
    sections: [
      {
        heading: 'Livelli di evacuazione',
        content: 'ALLERTA (avviso): possibile evacuazione. Prepara: carica telefono, controlla go-bag, fai il pieno auto, avvisa i contatti. EVACUAZIONE VOLONTARIA: fortemente consigliato partire. Esci nelle prossime 2–4 ore, segui percorso predefinito. EVACUAZIONE OBBLIGATORIA (ordinanza del sindaco): esci IMMEDIATAMENTE. Non aspettare. Non tornare indietro. RIFUGIO IN LOCO (shelter-in-place): rimani in casa, sigilla le aperture (gas tossico, nube radioattiva). Segui le istruzioni specifiche della Protezione Civile.',
      },
      {
        heading: 'Procedura di evacuazione — step by step',
        steps: [
          'DECIDE: la sicurezza sopravviene a qualsiasi possesso materiale',
          'AFFERRA: go-bag + farmaci cronici + documenti (già nella bag) + telefono carico',
          'ANIMALI: trasportino pronto con microchip o targhetta identificativa',
          'CHIUDI: gas (rubinetto contatore), acqua (rubinetto principale), finestre',
          'INFORMA: manda un SMS con destinazione e percorso al contatto esterno',
          'ESCI: non tornare per prendere oggetti dimenticati — puoi comprare tutto, non puoi comprare la vita',
          'DESTINAZIONE: segui il percorso predefinito. Non deviare senza ottima ragione',
          'COMUNICA: appena arrivi, informa i tuoi contatti',
        ],
      },
      {
        heading: 'Destinazioni di evacuazione',
        content: 'PRIMARIA: casa di parenti/amici fuori dalla zona a rischio — pre-concordata e confermata periodicamente. SECONDARIA: seconda casa, casa di amici alternativi. TERZIARIA: struttura pubblica di accoglienza (scuole, palestre, centri civici — indicati dalla Protezione Civile locale). Conosci in anticipo almeno la destinazione primaria e secondaria. Verifica ogni anno che siano ancora disponibili e che i parenti siano d\'accordo. Non lasciare le decisioni di destinazione al momento dell\'emergenza.',
      },
    ],
    relatedGuides: ['gobag-checklist', 'mappe-offline', 'comm-piano-famiglia'],
    tasks: ['mo02', 'mo03', 'mo04'],
  },

  {
    id: 'conflitto-rifugio',
    title: 'Conflitto Armato: Rifugio e Sicurezza',
    icon: 'ph-shield-warning',
    category: 'mobilita',
    source: 'Protezione Civile · Croce Rossa · FEMA',
    readTime: '3 min',
    quickRef: [
      'Al segnale d\'allarme (IT-alert, radio, autorità) vai subito al riparo: non aspettare di vedere il pericolo',
      'Luogo migliore: rifugio, seminterrato o stanza interna del piano più basso',
      'Lontano da finestre e vetri: le schegge di vetro causano molte ferite',
      'Tieni zaino pronto, radio a batterie e contanti: rete e carte possono cadere',
      'Non toccare mai oggetti sconosciuti a terra: possono essere ordigni inesplosi',
    ],
    sections: [
      {
        heading: 'Scegliere il rifugio in casa',
        content: 'Il posto più sicuro è sotto il livello della strada o, in assenza, la stanza più interna del piano più basso, con più muri tra te e l\'esterno. Evita ultimi piani, lati con grandi vetrate, cucine con bombole e garage con carburante. Tieni in quel posto: acqua, torce, radio, coperte, kit medico.',
      },
      {
        heading: 'Cosa tenere sempre pronto',
        steps: [
          'Zaino d\'emergenza con documenti, farmaci, contanti, caricatore e power bank',
          'Radio a batterie o a manovella con batterie di scorta',
          'Acqua per 3 giorni (3 L a persona al giorno) e cibo che non richiede cottura',
          'Kit di primo soccorso con bende compressive e guanti',
          'Elenco stampato dei numeri utili e punto di ritrovo con la famiglia',
        ],
      },
      {
        heading: 'Dopo gli attacchi',
        content: 'Aspetta il via libera ufficiale. Controlla ferite e crolli. Non toccare oggetti sconosciuti o metallici a terra: allontanati e avvisa le autorità. Tieniti lontano da edifici danneggiati, cavi a terra e fughe di gas. Segui solo fonti ufficiali e non diffondere notizie non verificate.',
      },
    ],
    relatedGuides: ['gobag-checklist', 'evacuazione-piano', 'primo-soccorso'],
    tasks: ['mo02', 'mo05', 'co01'],
  },

  {
    id: 'cyberattacco',
    title: 'Cyberattacco su Larga Scala',
    icon: 'ph-shield-slash',
    category: 'comm',
    source: 'Ready.gov (FEMA) · Polizia Postale',
    readTime: '3 min',
    quickRef: [
      'Prima: aggiorna telefono, computer e app; password diverse e verifica in due passaggi',
      'Fai backup regolari di file e foto importanti su un supporto protetto',
      'Diffida di email, SMS e messaggi che chiedono dati o password: nel dubbio, non cliccare',
      'Controlla movimenti di carte e conti: se vedi spese che non riconosci, avvisa subito la banca',
      'Se luce, telefono o internet si fermano, segui anche gli scenari Blackout',
    ],
    sections: [
      {
        heading: 'Prepararsi prima',
        steps: [
          'Limita le informazioni personali che condividi online e controlla le impostazioni di privacy',
          'Tieni aggiornati sistema operativo e app di telefono e computer',
          'Usa password robuste e diverse per ogni account, un gestore di password e la verifica in due passaggi',
          'Non condividere PIN e password',
          'Proteggi la rete Wi-Fi di casa e usa antivirus e firewall',
          'Fai backup regolari dei file importanti su un supporto protetto (cifrato)',
        ],
      },
      {
        heading: 'Durante l\'attacco',
        steps: [
          'Controlla gli estratti conto di carte e conti: cerca spese che non riconosci',
          'Diffida di email o messaggi che chiedono informazioni private',
          'Se noti attività sospette, cambia subito le password dei tuoi account',
          'Se un dispositivo sembra colpito: spegnilo o scollegalo da internet e fallo controllare da un tecnico',
          'Avvisa il datore di lavoro o la scuola se sono coinvolti dispositivi o account di lavoro o di studio',
        ],
      },
      {
        heading: 'Dopo l\'attacco',
        steps: [
          'Contatta banca e società delle carte: fai bloccare i conti coinvolti e chiudere quelli aperti a tua insaputa',
          'Denuncia alla Polizia Postale (sito commissariatodips.it) o a un ufficio di polizia',
          'Avvisa gli altri enti coinvolti in base a cosa è stato rubato (per esempio documenti d\'identità)',
        ],
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'energia-blackout-protocollo', 'comm-radio-canali'],
    tasks: ['cy01', 'cy02', 'cy03', 'cy04'],
  },

  {
    id: 'nucleare-radiologico',
    title: 'Incidente Nucleare o Radiologico',
    icon: 'ph-radioactive',
    category: 'medico',
    source: 'Protezione Civile · FEMA Ready.gov · CDC',
    readTime: '3 min',
    quickRef: [
      'Entra, resta dentro, ascolta: tre azioni che salvano più vite',
      'Meglio un seminterrato o una stanza interna senza finestre',
      'Togli i vestiti esterni e lavati: elimina fino al 90% della contaminazione',
      'Acqua e cibo solo confezionati o tenuti al chiuso',
      'Pastiglie di iodio solo se lo dicono le autorità: proteggono solo la tiroide',
    ],
    sections: [
      {
        heading: 'Se vedi un lampo intenso',
        steps: [
          'Non guardare la luce: girati e abbassati',
          'Sdraiati dietro un riparo, proteggi testa e collo',
          'Resta giù 1-2 minuti: l\'onda d\'urto arriva dopo',
          'Poi entra subito nell\'edificio più vicino e resta lontano da finestre',
        ],
      },
      {
        heading: 'Restare al chiuso',
        content: 'Chiudi porte e finestre, spegni ventilazione e condizionatori. Più muri e più massa ci sono tra te e l\'esterno, meglio è. Resta dentro almeno 24 ore, o finché le autorità non dicono di uscire. Tieni la radio accesa. Il pericolo maggiore è nelle prime ore e cala rapidamente.',
      },
      {
        heading: 'Decontaminazione',
        steps: [
          'Togli i vestiti esterni senza scuoterli e mettili in un sacchetto chiuso',
          'Lavati con acqua e sapone, senza strofinare forte, no balsamo',
          'Lava occhi, naso e orecchie',
          'Metti vestiti puliti: gli animali fuori vanno lavati prima di entrare',
        ],
      },
    ],
    relatedGuides: ['isolamento-stanza', 'comm-radio-canali', 'acqua-stoccaggio'],
    tasks: ['ac01', 'ci01', 'co01'],
  },

  /* ══════════════════════ SICUREZZA / COMMUNITY ══════════════════════ */
  {
    id: 'sicurezza-casa',
    title: 'Sicurezza Domestica in Emergenza',
    icon: 'ph-shield',
    category: 'mobilita',
    source: 'FEMA',
    readTime: '3 min',
    quickRef: [
      'Illuminazione di emergenza: torcia LED sul comodino, sempre carica',
      'Luci a presa (auto-emergenza): si accendono automaticamente al blackout — €5–10 ciascuna',
      'Estintore in cucina: ABC polvere, 6kg, revisionato ogni 2 anni',
      'Rilevatore fumo: obbligatorio, testalo ogni mese con il pulsante di test',
      'Rilevatore CO: obbligatorio se hai caldaia, stufa a gas o generatore',
    ],
    sections: [
      {
        heading: 'Illuminazione di emergenza',
        steps: [
          'Torcia LED: sul comodino, carica, testata mensile. Batteria alcalina dura 5 anni in stand-by',
          'Luci di emergenza a presa: si caricano sempre collegate alla corrente, si accendono automaticamente al blackout',
          'Lampade solari da giardino: caricate di giorno, portate dentro di notte — luce gratuita',
          'Candele: SOLO in portacandele stabile, su superficie non infiammabile, mai incustodite',
          'Torcia frontale (headlamp): mani libere per lavori e primo soccorso',
          'Bastoncini luminosi (lightstick): 12h di luce senza corrente, sicuri senza fiamma',
        ],
      },
      {
        heading: 'Prevenzione incendi in emergenza',
        steps: [
          'Estintore: posiziona in cucina (causa #1 incendi) e vicino al generatore',
          'Distanza sicura da fonti di calore alternative: 1m da stufe, 0.5m da candele',
          'Generatore: 5m dalla casa, scarico lontano da aperture',
          'Stufe a gas portatili: non lasciare mai senza supervisione',
          'In caso di incendio piccolo (cestino, padella): togli l\'ossigeno (coperchio, coperta) non acqua',
          'In caso di incendio esteso: esci, chiudi le porte, non tornare mai indietro per oggetti',
        ],
      },
      {
        heading: 'Sicurezza dei carburanti stoccati',
        steps: [
          'Benzina: tanica omologata rossa, massimo 10L senza autorizzazione, lontano da fiamme e calore',
          'GPL bombole: all\'esterno o in locale ventilato, verticali, lontano da fonti di calore',
          'Kerosene: tanica blu specifica, stabile 1–2 anni, lontano da fiamme',
          'Legna: asciutta, impilata lontano dalla casa (rischio insetti e roditori), coperta dalla pioggia',
          'Pellet: sacchi originali chiusi, luogo asciutto — il pellet che assorbe umidità è inutilizzabile',
          'Tutti i combustibili: fuori dalla portata dei bambini, etichettati chiaramente',
        ],
      },
    ],
    relatedGuides: ['energia-generatore', 'riscaldamento-alternativo'],
    tasks: ['en04'],
  },

  {
    id: 'community-resilienza',
    title: 'Resilienza Comunitaria',
    icon: 'ph-handshake',
    category: 'comm',
    source: 'FEMA CERT · Protezione Civile',
    readTime: '3 min',
    quickRef: [
      'Il vicino di casa è la tua risorsa più vicina — conosci almeno 5 vicini per nome',
      'Identifica le competenze: medici, elettricisti, meccanici, infermieri nel tuo palazzo/via',
      'Identifica i fragili: anziani soli, disabili, bambini senza adulti — controlla in ogni emergenza',
      'Gruppo WhatsApp/Telegram di condominio: attivalo PRIMA dell\'emergenza',
      'Acquisti di gruppo: risparmio economico e relazioni sociali pre-crisi',
    ],
    sections: [
      {
        heading: 'Perché la comunità è la risorsa più importante',
        content: 'Nelle emergenze italiane (terremoti, alluvioni, blackout invernali) la maggior parte dei salvataggi nelle prime 72 ore è fatta da vicini, non dai soccorritori professionali. Il 118 e i Vigili del Fuoco arrivano dove possono e quando possono — in emergenza di massa, possono volerci giorni. La tua vera rete di sicurezza sono le 10 persone che vivono nel tuo stesso palazzo o nella tua stessa via. Investire nelle relazioni di quartiere è preparedness concreta.',
      },
      {
        heading: 'Costruire la rete locale',
        steps: [
          'Presentati ai vicini entro un piano da te: nome, numero di telefono',
          'Identifica chi ha: competenze mediche, strumenti utili (generatore, motosega, trapano), veicolo 4×4, spazio extra',
          'Identifica chi ha bisogno di supporto: anziani soli, mamme con neonati, disabili',
          'Proponi un gruppo di comunicazione (Telegram preferito per privacy)',
          'Piccoli gesti ora: presta un\'attrezzo, porta la spesa a un anziano — costruisci fiducia',
          'Accordo di mutuo soccorso: "In emergenza, ci controlliamo l\'un l\'altro"',
        ],
      },
      {
        heading: 'Volontariato di Protezione Civile',
        content: 'La Protezione Civile italiana ha oltre 300.000 volontari organizzati. Partecipare: formazione gratuita su primo soccorso, ricerca e soccorso, comunicazioni radio. Coordinamento professionale in emergenza. Accesso a risorse (attrezzature, formazione, rete). Cerca il gruppo locale su: protezionecivile.gov.it o chiedi al tuo comune. Anche senza aderire formalmente: segui i loro corsi pubblici di formazione alla popolazione.',
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'primo-soccorso'],
    tasks: ['co03'],
  },


  /* ══════════════════════ SURVIVAL ══════════════════════ */

  {
    id: 'survival-fuoco',
    title: 'Accendere il Fuoco in Emergenza',
    icon: 'ph-campfire',
    category: 'calore',
    source: 'FM 21-76 (US Army Survival Manual) · SAS Survival Handbook',
    readTime: '6 min',
    quickRef: [
      'Triangolo del fuoco: combustibile + calore + ossigeno — togli uno, il fuoco muore',
      'Acciarino ferrocerio funziona bagnato, a qualsiasi quota, per migliaia di usi',
      'Esca deve essere SECCA e finissima: un filo di fumo dall\'esca = pronti ad accendere',
      'Legno più secco e morbido per il drill: salice, tiglio, pioppo, nocciolo',
      'Regola dei 3: il fuoco non va spento — sempre qualcuno lo sorveglia',
    ],
    sections: [
      {
        heading: 'Il triangolo del fuoco e la preparazione',
        content: 'Ogni fuoco richiede tre elementi simultanei: combustibile (carburante), calore (fonte di ignizione) e ossigeno. Rimuovere uno dei tre spegne il fuoco. Prima di accendere, prepara tutto in anticipo in tre pile separate: esca (materiale finissimo che prende la prima scintilla), astine (rametti 3–5mm), legnetti (rami pencil-size), e legna grossa. Accendere senza materiale pronto significa perdere la fiamma.',
      },
      {
        heading: 'Metodo 1 — Acciarino ferrocerio (migliore)',
        steps: [
          'Prepara il nido di esca: erba secca tritata, corteccia di betulla sfilacciata, foglie secche polverizzate, pioppo marcio secco — forma un uccellino cavo a forma di U',
          'Posiziona il nido su un foglio di corteccia o pietra piatta (non terra umida)',
          'Tieni il raschietto fermo, muovi la barra dell\'acciarino verso di te — le scintille cadono in basso',
          'Quando vedi fumo dall\'esca, smetti di raschiare',
          'Solleva il nido, chiudilo attorno all\'esca fumante con delicatezza',
          'Soffia lentamente e costantemente nella base del nido — aumenta l\'intensità man mano',
          'Quando escono fiamme, deposita rapidamente sotto la catasta di astine preparata',
        ],
      },
      {
        heading: 'Metodo 2 — Bow Drill (senza attrezzi)',
        steps: [
          'Materiali: arco (ramo curvo + laccio), mandrino (legno dritto 30cm, morbido), piattaforma (legno morbido piatto), cuscinetto (legno duro per la mano)',
          'Piattaforma: taglia una vaschetta poco più larga del mandrino, taglia una tacca a V verso l\'esterno con piccola rientranza',
          'Posiziona sotto la tacca un pezzetto di corteccia per raccogliere la polvere nera',
          'Incordatura dell\'arco attorno al mandrino: un giro solo, non incrociato',
          'Ginocchio sinistro a terra, piede destro sulla piattaforma, polso sinistro contro lo stinco per stabilità',
          'Movimento dell\'arco: lungo, orizzontale, lento e costante — non veloce e corto',
          'Quando vedi fumo e polvere nera nella tacca → forma un grumo compatto → trasferisci nel nido',
        ],
      },
      {
        heading: 'Tipi di catasta (fire lay)',
        steps: [
          'Tipi: Log Cabin (lunga durata), Tepee (accensione rapida, fiamma alta), Star Fire (notturno con tronchi grandi a stella), Trench Fire (vento forte, nasconde la luce)',
          'Tepee: metti l\'esca al centro, astine appoggiate attorno inclinate verso il centro — accendi dal basso e dal lato sopravvento',
          'Log Cabin: due tronchi paralleli, due sopra perpendicolari — strati alternati come mattoni, esca al centro — brucia lentamente, ottimo per cucinare',
          'Trench: scava buca 15×60cm, profonda 10cm, vento lungo la buca — fuoco a basso profilo con ottimo tiraggio',
          'Star fire: 4–5 tronchi grandi a stella, punta al centro — spingi man mano che bruciano, dura tutta la notte',
        ],
      },
      {
        heading: 'Sicurezza e spegnimento',
        steps: [
          'Distanza minima da vegetazione: 1,5m intorno, 3m in condizioni secche',
          'Mai accendere sotto rami bassi o in cavità di alberi',
          'Spegnimento: versa acqua abbondante, mescola con bastone, tocca con mano — deve essere freddo al tatto prima di lasciarlo',
          'Senza acqua: ricopri di terra e sabbia, calca bene — nessun fumo deve uscire',
          'In zone ventose: usa una trincea o paravento di pietre',
        ],
      },
    ],
    relatedGuides: ['survival-riparo', 'survival-acqua-natura', 'survival-navigazione'],
    tasks: ['sv06', 'sv07'],
  },

  {
    id: 'survival-nodi',
    title: 'Nodi Fondamentali di Sopravvivenza',
    icon: 'ph-infinity',
    category: 'calore',
    source: 'Guida Scout Internazionale · Ashley Book of Knots · SAS Survival',
    readTime: '5 min',
    quickRef: [
      'Bowline: il nodo che non si stringe, non scivola — base di ogni sistema di sicurezza',
      'Mezzo collo (half hitch) x2 = due mezzi capi — veloce per legare ad alberi e pali',
      'Nodo piatto (reef knot): unisce due corde dello stesso spessore',
      'Prusik: blocca su una corda tesa, si sblocca a mano — per arrampicata e tensionamento',
      'Mai fidarsi di un nodo mai provato: testa a terra prima di affidarti la vita',
    ],
    sections: [
      {
        heading: 'Bowline — il re dei nodi',
        steps: [
          'Forma un ochiello (loop piccolo) nella corda tenendo il capo vivo in basso',
          'Fai passare il capo vivo attraverso l\'ochiello dal basso verso l\'alto (il coniglio esce dalla tana)',
          'Il capo gira attorno al dormiente da destra a sinistra (il coniglio gira attorno all\'albero)',
          'Il capo rientra nell\'ochiello dall\'alto verso il basso (il coniglio rientra nella tana)',
          'Tira il dormiente con forza mentre tieni il capo vivo — il loop finale non si stringe né scivola',
          'Uso: creare anello fisso intorno a un albero, persona, punto di ancoraggio — non si stringe sotto carico',
        ],
      },
      {
        heading: 'Nodo piatto (Reef Knot)',
        steps: [
          'Capo sinistro sopra capo destro, poi sotto — come per allacciare le scarpe',
          'Capo destro sopra capo sinistro, poi sotto',
          'Tira entrambi i capi per stringere',
          'Verifica: i due bight devono giacere paralleli — se uno è perpendicolare hai un nodo da nonna (granny knot), che scivola',
          'Uso: bendaggi, chiudere sacchi, unire due corde STESSO spessore in assenza di carico',
          'ATTENZIONE: non usare per carichi di sicurezza — si scioglie se un capo viene tirato lateralmente',
        ],
      },
      {
        heading: 'Clove Hitch — due mezzi capi',
        steps: [
          'Fai un loop attorno al palo, capo vivo sopra il dormiente',
          'Fai un secondo loop identico accanto al primo, capo vivo sopra il dormiente anche stavolta',
          'Infila il capo vivo sotto il secondo loop',
          'Tira entrambi i capi per stringere',
          'Uso: legare velocemente a pali, rami, tronchi — ottimo punto di partenza per legature',
          'Limite: si scioglie se il carico cambia direzione — aggiungi sempre un mezzo collo di sicurezza',
        ],
      },
      {
        heading: 'Prusik — nodo autobloccante',
        steps: [
          'Serve uno spezzone di corda più sottile (3–5mm) della corda principale',
          'Forma un anello con lo spezzone (unisci le estremità con nodo piatto)',
          'Avvolgi l\'anello attorno alla corda principale 3 volte, passando sempre lo stesso lato attraverso l\'altro',
          'Il prusik blocca sotto carico (peso), si sposta a mano quando scarico',
          'Uso: tensionare una linea, creare sistema di sollevamento, sicura su tiro inclinato',
          'Test: il prusik deve bloccare immediatamente quando molli la mano — se scivola aggiungi un giro in più',
        ],
      },
      {
        heading: 'Legatura quadrata e diagonale (Lashing)',
        steps: [
          'Legatura quadrata: per unire due pali perpendicolari — parti con clove hitch sul palo verticale',
          'Avvolgi 3–4 volte attorno a entrambi i pali alternando verticale/orizzontale',
          'Aggiungi 2–3 giri di "frapping" (attorno alle avvolgiture tra i pali) per stringere',
          'Chiudi con clove hitch sull\'altro palo',
          'Uso: costruire ripari, barelle improvvisate, sistemi di sostegno',
          'Legatura diagonale: identica ma per pali a X — le avvolgiture seguono la diagonale tra i pali',
        ],
      },
    ],
    relatedGuides: ['survival-riparo', 'survival-fuoco', 'survival-trappole'],
    tasks: ['sv06'],
  },

  {
    id: 'survival-riparo',
    title: 'Costruire un Riparo d\'Emergenza',
    icon: 'ph-house-simple',
    category: 'calore',
    source: 'FM 21-76 · SAS Survival Handbook · SERE Training Manual',
    readTime: '5 min',
    quickRef: [
      'Regola dei 3: 3 ore senza riparo in condizioni avverse = ipotermia letale',
      'Sito: rialzato da acqua, riparato da vento, vicino a risorse, lontano da pericoli naturali',
      'Isolamento dal suolo è priorità assoluta: perdi più calore verso terra che verso l\'aria',
      'Dimensioni minime: abbraccia te stesso — il corpo scalda solo uno spazio piccolo',
      'Porta ingressi piccoli e verso sud/est (sole mattutino, lontano dai venti dominanti da NO)',
    ],
    sections: [
      {
        heading: 'Scelta del sito',
        steps: [
          'RIALZATO: almeno 60m da corsi d\'acqua (esondazioni notturne, insetti, umidità)',
          'RIPARATO: schiena a un grande albero, roccia o costone — blocca il vento da nord/ovest',
          'DRENANTE: terreno leggermente inclinato — l\'acqua defluisce, non si accumula sotto di te',
          'RISORSE VICINE: legna per il fuoco, materiale per costruire e isolare entro 50m',
          'PERICOLI DA EVITARE: non sotto alberi morti o rami secchi (widow makers), non in avvallamenti (umidità, freddo, acqua), non in letti di torrenti in secca',
          'VISIBILITÀ: se vuoi essere trovato — scegli sito visibile dall\'alto; se vuoi nasconderti — zona coperta',
        ],
      },
      {
        heading: 'Lean-to (una notte, condizioni moderate)',
        steps: [
          'Materiali: palo orizzontale di 2–3m a 1–1,2m da terra tra due alberi, pali di appoggio inclinati ogni 30cm',
          'Angolo del tetto: 45° verso il vento (la pioggia scivola via)',
          'Copertura: strati di fronde, felci, erba lunga — dal basso verso l\'alto come tegole',
          'Spessore minimo: 30cm di materiale vegetale per impermeabilità',
          'Davanti al lean-to: fuoco con riflettore (tronco verticale) che proietta calore verso il riparo',
          'Sul fondo: 15cm di foglie/fronde secche come isolamento dal suolo — PRIORITÀ ASSOLUTA',
        ],
      },
      {
        heading: 'Debris Hut (notti fredde, senza fuoco)',
        steps: [
          'Palo centrale: 2,5–3m appoggiato a tronco a 1m da terra, angolo 30°',
          'Costole: rami corti inclinati lungo i due lati del palo centrale',
          'Copertura: cumula foglie, rami, aghi di pino — spessore minimo 60–90cm su tutti i lati (come la tua apertura del braccio)',
          'Ingresso: piccolo, ottimizzato per la tua altezza sdraiato — sigilla con un mucchio di foglie come tappo',
          'Interno: riempi completamente con foglie secche — devi annegare nelle foglie, non toccare le pareti',
          'Test del calore: se hai freddo nei primi 20 minuti, aggiungi materiale — non toglierlo',
          'Funziona perché: la tua temperatura corporea scalda il piccolo spazio, l\'isolamento non la disperde',
        ],
      },
      {
        heading: 'Riparo da neve (Quinzhee)',
        steps: [
          'Ammucchia neve in un cumulo di 2m di diametro × 1,5m di altezza',
          'Lascia consolidare 2 ore (la neve si cristallizza e diventa resistente)',
          'Inserisci rametti da 20cm uniformemente sulla superficie esterna (indicatori dello spessore)',
          'Scava dall\'esterno verso il basso e poi verso l\'alto — mai scavare diritto in avanti',
          'Spessore delle pareti: quando raggiungi i rametti, fermati (20–25cm)',
          'Fai un foro di ventilazione nel soffitto con un bastone',
          'Temperature interne: -5°C anche con -30°C fuori se ben costruito',
        ],
      },
    ],
    relatedGuides: ['survival-fuoco', 'survival-nodi', 'ipotermia-prevenzione'],
    tasks: ['sv05', 'sv07'],
  },

  {
    id: 'survival-navigazione',
    title: 'Navigazione Senza Strumenti',
    icon: 'ph-compass',
    category: 'mobilita',
    source: 'FM 21-76 · Wilderness Navigation (Bob Burns) · SERE',
    readTime: '5 min',
    quickRef: [
      'Stella Polare: l\'unico punto fisso — sempre a nord, errore < 1°',
      'Orologio analogico + sole: punta le lancette all\'ora solare, a metà strada è sud',
      'Sole nasce a E, tramonta a O — ma solo ai solstizi; in altri periodi leggermente spostato',
      'Alberi: muschio cresce dove c\'è umidità, non sempre a nord — non usarlo come riferimento primario',
      'Acqua in piano: segui sempre a valle — porta a insediamenti umani il 90% delle volte',
    ],
    sections: [
      {
        heading: 'Stella Polare (notte, cielo sereno)',
        steps: [
          'Trova il Grande Carro (Orsa Maggiore): 7 stelle a forma di mestolo',
          'Le due stelle sul bordo esterno del "secchio" (Dubhe e Merak) puntano sempre alla Stella Polare',
          'La distanza Grande Carro → Stella Polare è circa 5× la distanza tra le due stelle del bordo',
          'Stella Polare = nord geografico con errore inferiore a 1°',
          'Alternativa: Cassiopea (5 stelle a W/M) — la Stella Polare è al centro tra le due "punte" della W',
          'Segna il nord al suolo con due pietre, poi usa la luna come riferimento per la notte',
        ],
      },
      {
        heading: 'Metodo dell\'orologio (giorno)',
        steps: [
          'Funziona con orologio analogico impostato all\'ora solare locale (non legale — sottrai 1h in estate)',
          'Tieni l\'orologio orizzontale, punta la lancetta delle ORE verso il sole',
          'L\'angolo bisettore tra la lancetta delle ore e le 12 indica il SUD',
          'Emisfero nord: il sole è sempre a sud durante la giornata',
          'Se non hai un orologio analogico: disegna un quadrante su carta o terra',
          'Errore: circa 5° — abbastanza preciso per orientamento generico',
        ],
      },
      {
        heading: 'Metodo del bastone (stick-shadow)',
        steps: [
          'Pianta un bastone verticale in un terreno pianeggiante soleggiato',
          'Segna la punta dell\'ombra con una pietra (punto A)',
          'Aspetta 15–20 minuti, segna la nuova punta dell\'ombra (punto B)',
          'La linea A→B indica sempre OVEST→EST indipendentemente dalla stagione',
          'Stai in piedi con il piede sinistro su A e il destro su B: davanti a te c\'è il NORD',
          'Più lunga attendi tra le misurazioni, più preciso il risultato',
        ],
      },
      {
        heading: 'Orientamento con indizi naturali',
        steps: [
          'ACQUA: segui a valle qualsiasi corso d\'acqua — porta a vallate, poi pianure, poi insediamenti',
          'VEGETAZIONE: la vegetazione più fitta e verde indica acqua sotterranea o superficiale vicina',
          'VENTI dominanti in Italia: da nordovest in pianura padana, da ovest in zone costiere',
          'LINEE ARTIFICIALI: tralicci dell\'alta tensione portano a centri abitati; ferrovie portano a stazioni',
          'CIME: sali in cima per vedere il panorama — identifica valli, strade, edifici',
          'ANIMALI: uccelli al mattino volano verso l\'acqua; api volano in linea retta verso l\'alveare (max 1km)',
        ],
      },
      {
        heading: 'Pianificare e mantenere la rotta',
        steps: [
          'Scegli un obiettivo distante e visibile (cima, antenna, torre) come punto di riferimento',
          'Cammina verso di esso tenendolo sempre nel campo visivo',
          'Quando sparisce (alberi, nebbia): memorizza 2–3 oggetti intermedi in linea',
          'Tecnica "aiming off": mira deliberatamente a 5° a lato dell\'obiettivo — sai già in quale direzione stai',
          'Traccia il tuo percorso su carta, anche rudimentale — segnati i punti notevoli',
          'Non girare in cerchio: fai regolarmente il punto usando il sole/stelle',
        ],
      },
    ],
    relatedGuides: ['survival-riparo', 'survival-segnalazione', 'mappe-offline'],
    tasks: ['sv09', 'sv12'],
  },

  {
    id: 'survival-acqua-natura',
    title: 'Trovare Acqua in Natura',
    icon: 'ph-waves',
    category: 'acqua',
    source: 'FM 21-76 · WHO Field Guide · SAS Survival Handbook',
    readTime: '4 min',
    quickRef: [
      'In natura, TUTTA l\'acqua va purificata prima di bere — anche le sorgenti più limpide',
      'Rugiada: raccoglibile all\'alba su foglie con straccio — fino a 500ml/h in condizioni ottimali',
      'Segui le valli verso il basso — l\'acqua si accumula nei punti più bassi',
      'Piante indicate: salici, pioppi, sambuchi — dove crescono c\'è acqua entro 3–5m',
      'Evita acqua ferma con schiuma verde, odore di mandorle o di zolfo — probabile contaminazione',
    ],
    sections: [
      {
        heading: 'Trovare fonti d\'acqua',
        steps: [
          'VAI A VALLE: l\'acqua segue la gravità — fonti, pozze, ruscelli si trovano nelle zone più basse',
          'PIANTE INDICATRICI: salici, pioppi, ontani, sambuchi crescono vicino all\'acqua — scava alla base',
          'ANIMALI: tracce di animali convergono verso l\'acqua; uccelli in volo all\'alba/tramonto verso l\'acqua',
          'ROCCE: cerca zone umide sotto pareti rocciose — l\'acqua filtra e si raccoglie alla base',
          'COSTA: nelle dune di sabbia scava 100m dall\'alta marea — l\'acqua dolce galleggia sulla salmastra',
          'PIANURA: cerca depressioni nel terreno — acqua raccolta dalla pioggia; scava fino a 1m',
        ],
      },
      {
        heading: 'Raccolta rugiada e pioggia',
        steps: [
          'RUGIADA: al sorgere del sole, strofina un panno pulito (o la maglietta) su erba e foglie',
          'Strizza il panno in un contenitore ogni 5–10 minuti — ritmo: 200–500ml/ora in condizioni ottimali',
          'PLASTICA: stendi un telone/poncho in buca o su rami a forma di V — raccoglie la pioggia',
          'PIANTA: avvolgi un ramo fogliato con sacchetto di plastica trasparente al sole — l\'evapotraspirazione condensa fino a 50ml/ora',
          'BAMBÙ: i nodi dei bambù contengono acqua — inclina il fusto e fora il nodo superiore',
          'Tutta l\'acqua raccolta dalla vegetazione va purificata (contaminazione da uccelli, insetti)',
        ],
      },
      {
        heading: 'Distillazione solare',
        steps: [
          'Scava una buca 90×90cm, profonda 45cm in terreno soleggiato',
          'Posiziona un contenitore al centro della buca',
          'Stendi un telone di plastica trasparente sopra la buca, fissato ai bordi con terra/pietre',
          'Metti una pietra al centro del telone per creare un cono che gocciola nel contenitore',
          'Produzione: 500ml–1L al giorno in condizioni ideali (terreno umido, sole forte)',
          'Migliora: aggiungi materiale vegetale verde attorno al contenitore nella buca',
          'Variante: usa piante urticanti, cactus, terra umida — l\'evaporazione e condensazione separano l\'acqua',
        ],
      },
      {
        heading: 'Acqua da non bere MAI',
        content: 'Acqua con schiuma verde-blu (cianobatteri — tossici e letali), odore di mandorle amare (HCN — cianuro), odore di uova marce (solfuro di idrogeno), colore latte o molto torbido senza causa apparente, vicina a industrie o miniere abbandonate, a valle di campi coltivati intensivamente (pesticidi, nitrati). L\'acqua di mare non va mai bevuta: il rene umano non riesce a eliminare il sale più velocemente di quanto ne assuma — bere acqua di mare accelera la morte per disidratazione.',
      },
    ],
    relatedGuides: ['acqua-purificazione', 'survival-fuoco', 'survival-piante'],
    tasks: ['sv01', 'sv02'],
  },

  {
    id: 'survival-piante',
    title: 'Piante Commestibili e Tossiche',
    icon: 'ph-leaf',
    category: 'cibo',
    source: 'FM 21-76 · Flora Italiana (Pignone) · Guida Alpina CAI',
    readTime: '6 min',
    quickRef: [
      'Test universale: una parte alla volta — pelle, labbra, lingua, mastica senza ingoiare, poi ingoia piccola quantità',
      'Piante a 3 foglioline: sospetta (potrebbe essere edera velenosa o trifoglio)',
      'Bianco di latte nelle piante: spesso tossico (euforbiacee, alcune araceae)',
      'Bacche bianche/gialle: evita quasi sempre. Bacche rosse: 50/50. Bacche blu/nere: spesso commestibili',
      'Non mangiare MAI fungo non identificato con certezza assoluta — alcuni sono letali con un solo morso',
    ],
    sections: [
      {
        heading: 'Test universale di commestibilità (USAS)',
        steps: [
          '1. ODORE: schiaccia la pianta — odore amaro di mandorle, pesca, acido → non commestibile',
          '2. PELLE: strofina un pezzo sulla parte interna del polso — attendi 15 min — prurito/rossore → scarta',
          '3. LABBRA: strofina un piccolo pezzo sulle labbra senza ingerire — attendi 3 min — bruciore → scarta',
          '4. LINGUA: metti sulla lingua senza masticare — attendi 15 min — bruciore, intorpidimento → scarta',
          '5. MASTICA: mastica senza ingoiare — attendi 15 min — reazione → scarta',
          '6. INGERISCI PICCOLA QUANTITÀ: attendi 8 ore senza mangiare altro — nausea/dolori → scarta',
          'Testa ogni parte separatamente (radice, foglie, frutti, semi possono avere tossicità diverse)',
        ],
      },
      {
        heading: 'Piante commestibili comuni in Italia',
        steps: [
          'ORTICA (Urtica dioica): foglie giovani bollite — ricca di proteine e ferro. Perde il "pungiglione" con la cottura. Cresce ovunque.',
          'TARASSACO (Taraxacum officinale): tutte le parti commestibili — foglie in insalata, radici tostate come caffè, fiori in pastella',
          'SAMBUCO (Sambucus nigra): fiori in frittella, bacche mature cotte in confettura — ATTENZIONE: bacche crude e parti verdi tossiche',
          'ROVI (Rubus spp.): more mature in estate — riconoscibili, sicure, ricche di vitamina C',
          'ROSA CANINA: pseudo-frutti rossi in autunno — ricchissimi di vitamina C (20× arancio)',
          'PIANTAGGINE (Plantago): foglie crude o bollite — cresce in prati e bordi strada',
          'FAGGIO (Fagus sylvatica): faggiole tostate (autunno) — crude contengono tannini, cotte commestibili',
          'GHIANDE di quercia: amaro per tannini — filtra bollendo 3–4 volte cambiando l\'acqua → farina',
        ],
      },
      {
        heading: 'Piante tossiche da riconoscere e evitare',
        steps: [
          'ATROPA BELLADONNA: bacche nere-violacee lucide su pianta alta 1–2m, fiori viola campanulati — LETALE (1–5 bacche per un bambino)',
          'DIGITALE (Digitalis purpurea): fiori a ditale rosa/viola a campanella su spiga — intossicazione cardiaca letale',
          'TASSO (Taxus baccata): aghi verdi scuri, bacche rosse con seme nero — TUTTO letale tranne la polpa rossa della bacca',
          'CICUTA (Conium maculatum): simile al prezzemolo/finocchio selvatico, odore sgradevole, fusto maculato viola — letale',
          'ACONITO (Aconitum napellus): fiori blu a elmo, foglie palmate — uno dei veleni più potenti d\'Europa, assorbito anche per contatto',
          'EDERA (Hedera helix): bacche nere a grappolo — tossica per ingestione',
          'REGOLA GENERALE: se non sei certo al 100% dell\'identificazione, non mangiarlo',
        ],
      },
      {
        heading: 'Funghi — regola assoluta',
        content: 'Non raccogliere mai funghi che non sai identificare con certezza assoluta. L\'Amanita phalloides (Tignosa verdognola) — responsabile del 90% dei decessi da funghi in Europa — non provoca sintomi per 6–24 ore: quando compaiono (nausea, dolori addominali violenti, poi insufficienza epatica), il danno è già irreversibile. Non esiste antidoto. Il trapianto di fegato è l\'unica sopravvivenza possibile. Nessuna cottura, nessuna preparazione neutralizza la falloidina. Funghi sicuri da raccogliere SOLO con sicurezza assoluta: porcini (Boletus edulis), galletti (Cantharellus cibarius), prataiolo (Agaricus campestris) — ma richiedono esperienza per distinguerli dai doppi velenosi.',
      },
    ],
    relatedGuides: ['survival-acqua-natura', 'survival-trappole', 'cibo-scorte-piano'],
    tasks: ['sv04'],
  },

  {
    id: 'survival-trappole',
    title: 'Pesca e Selvaggina di Sussistenza',
    icon: 'ph-target',
    category: 'cibo',
    source: 'FM 21-76 · SAS Survival Handbook · Woodcraft and Indian Lore (Seton)',
    readTime: '6 min',
    quickRef: [
      'In Italia caccia e pesca sono regolate dalla legge e le trappole (lacci, cappi) sono vietate: questa guida non spiega come costruirle',
      'Pesca supera sempre la caccia in efficienza calorica per sforzo',
      'Non mangiare uccelli o mammiferi dall\'aspetto malato o trovati già morti',
    ],
    sections: [
      {
        heading: 'Pesca di sussistenza',
        steps: [
          'AMO IMPROVVISATO: spillone, spina di pino, osso appuntito — curva a 90° e affilato',
          'LENZA: fili di paracord (estrai il nucleo interno), cintura di nylon, filo ricavato da tessuto',
          'ESCA: vermi sotto pietre umide, grilli, locuste, piccoli pesci come esca per quelli grandi',
          'TECNICA: in un ruscello, cerca buche profonde sotto le cascatelle — i pesci stazionano in acque calme',
          'GORBIA: piega rami flessibili a imbuto nel senso della corrente — il pesce entra e non esce',
          'PULIZIA: eviscera immediatamente, cuoci completamente — i pesci d\'acqua dolce possono avere parassiti',
        ],
      },
      {
        heading: 'Selvaggina piccola — identificazione e preparazione',
        steps: [
          'LEPRE/CONIGLIO: scuoia dalla zampa posteriore verso la testa, taglia zampe e testa, eviscera — tutto il resto si mangia cotto',
          'UCCELLI: spenna o scuoia, eviscera — cuoci bene (Salmonella, Newcastle)',
          'RETTILI (serpenti, lucertole): taglia la testa (10cm sotto per sicurezza nei velenosi), scuoia, eviscera',
          'INSETTI: fonte proteica eccellente — grilli, larve di coleottero, tarme di farina cotti. EVITA: insetti colorati (velenosi), pelosi (irritanti), maleodoranti',
          'COTTURA: cuoci sempre completamente — non esistono eccezioni per la selvaggina in sopravvivenza',
          'CONSERVAZIONE: affumica o essicca entro 2h in clima caldo; il freddo conserva fino a 24h in inverno',
        ],
      },
    ],
    relatedGuides: ['survival-piante', 'survival-fuoco', 'survival-acqua-natura'],
    tasks: ['sv03', 'sv04', 'sv13'],
  },

  {
    id: 'survival-primo-soccorso-campo',
    title: 'Primo Soccorso Avanzato in Campo',
    icon: 'ph-first-aid-kit',
    category: 'medico',
    source: 'FM 4-25.11 (US Army First Aid) · TCCC Guidelines · Croce Rossa Italiana',
    readTime: '7 min',
    quickRef: [
      'TCCC: togli dall\'azione, poi M-MARCH (Massive hemorrhage, Airway, Respiration, Circulation, Hypothermia)',
      'Emorragia massiva: laccio emostatico entro 3 min è life-saving — il dolore è accettabile',
      'Ipotermia: rimuovi abiti bagnati, isola dal suolo, riscalda lentamente dal nucleo (NO mani/piedi)',
      'Colpo di calore: abbassa temperatura immediatamente — bagna e ventila — è più urgente di una frattura',
      'Frattura: immobilizza com\'è, non riposizionare — le eccezioni sono solo se perdita di circolo distale',
    ],
    sections: [
      {
        heading: 'Emorragia — controllo rapido',
        steps: [
          'PRESSIONE DIRETTA: premi forte con entrambe le mani per minimo 5 minuti senza guardare',
          'Se ancora sanguina: aggiungi altra garza sopra (non rimuovere la prima) — pressione continua',
          'LACCIO EMOSTATICO (arti): applica 5–7cm sopra la ferita, stringi fino a cessazione del sanguinamento, segna l\'ora — non allentarlo e non toglierlo: lo fa solo il personale sanitario',
          'GARZA EMOSTATICA (ferite profonde/inguine/ascella): comprimi la garza nella ferita con forza — Combat Gauze o QuikClot',
          'FERITE AL TORACE: sigilla con cerotto a 3 lati (uno aperto per permettere l\'uscita dell\'aria, non l\'entrata)',
          'SHOCK: sdraia il paziente, solleva le gambe 30cm, mantieni caldo, non dare da bere',
        ],
      },
      {
        heading: 'Ipotermia — riconoscimento e trattamento',
        steps: [
          'LIEVE (33–35°C): tremore forte, confusione lieve, pelle fredda — muovi in riparo, togli abiti bagnati',
          'MODERATA (30–33°C): tremore assente (muscoli "esauriti"), confusione marcata, movimenti lenti',
          'GRAVE (<30°C): sonnolenza, polso debole o assente, rigidità — PERICOLO VITA',
          'TRATTAMENTO: riparo dal vento, TOGLI SUBITO abiti bagnati, isolamento dal suolo (priorità assoluta)',
          'RISCALDAMENTO PASSIVO: sacchi a pelo, coperte termiche, corpo a corpo — riscalda dal centro (torace, collo, inguine)',
          'NON riscaldare mani e piedi prima: il sangue freddo periferico che torna al cuore può causare fibrillazione',
          'ATTENZIONE: un ipotermico sembra morto — rianimazione finché non è "caldo e morto"',
        ],
      },
      {
        heading: 'Colpo di calore',
        steps: [
          'EMERGENZA: temperatura corporea > 40°C con confusione = colpo di calore — priorità come emorragia',
          'RAFFREDDA IMMEDIATAMENTE: bagna testa, collo, ascelle, inguine con acqua fredda',
          'VENTIALA: fai aria con qualunque cosa disponibile — l\'evaporazione raffredda',
          'Ghiaccio o acqua gelata su ascelle, inguine, collo — le zone con grandi vasi sanguigni',
          'POSIZIONE: sdraia con testa sollevata 30° — se incosciente: posizione laterale di sicurezza',
          'NON dare aspirina o paracetamolo — la febbre da colpo di calore è diversa dalla febbre infettiva',
          'CONTINUA il raffreddamento fino a che la confusione non migliora',
        ],
      },
      {
        heading: 'Fratture e lussazioni',
        steps: [
          'PRINCIPIO BASE: immobilizza com\'è — non tentare di riallineare a meno che non ci sia perdita di polso distale',
          'STECCA IMPROVVISATA: rami dritti + fascia/cintura + imbottitura (foglie, vestiti) — immobilizza l\'articolazione sopra e sotto la frattura',
          'CONTROLLO NEUROVASCOLARE: ogni 15 min — polso distale, sensibilità, movimento dita (se impossibile per dolore, almeno polso)',
          'FRATTURA APERTA: copri con garza pulita bagnata di acqua pulita — NON spingere l\'osso dentro, NON togliere oggetti conficcati',
          'LUSSAZIONE SPALLA: può essere ridotta se si ha esperienza — posizione di Cunningham (braccio a 90°, rotazione esterna lenta) — NON forzare',
          'COLONNA VERTEBRALE: se sospetta, immobilizza in linea retta, non muovere il collo — casco e collare improvvisato con indumenti arrotolati',
        ],
      },
      {
        heading: 'Ustioni',
        steps: [
          'RAFFREDDAMENTO: acqua fresca (15°C) per 20 minuti — non ghiaccio, non burro, non dentifricio',
          'CLASSIFICAZIONE: 1° rossore (epidermide), 2° bolle (derma), 3° bianco/bruno/nero (tutto lo spessore)',
          'REGOLA DEL 9: testa 9%, ogni arto superiore 9%, ogni arto inferiore 18%, torace ant. 18%, post. 18%',
          'USTIONI GRAVI: > 20% superficie corporea → shock da ustione → idratazione massima',
          'NON bucare le bolle — sono protezione sterile naturale',
          'NON togliere abiti attaccati alla pelle — taglia intorno',
          'COPERTURA: garza non aderente bagnata (non asciutta) — mantieni umido per ridurre il dolore',
        ],
      },
    ],
    relatedGuides: ['kit-medico', 'survival-riparo', 'ipotermia-prevenzione'],
    tasks: ['sv11', 'me01', 'me03'],
  },

  {
    id: 'survival-conservazione-cibo',
    title: 'Conservare il Cibo Senza Energia',
    icon: 'ph-jar',
    category: 'cibo',
    source: 'USDA Preservation Guidelines · Ball Blue Book · Tecniche Tradizionali Europee',
    readTime: '5 min',
    quickRef: [
      'Temperatura pericolo: 4–60°C — batteri si moltiplicano ogni 20 min in questa fascia',
      'Essiccatura: rimuove l\'acqua (attività < 0.85) — inibisce batterio, muffe, lieviti',
      'Salatura: estrae acqua osmotica + inibisce patogeni — concentrazione 20% è sterile',
      'Fermentazione: i lattobacilli producono acido lattico — crea ambiente ostile ai patogeni',
      'Sottoterra: 10–15°C costanti tutto l\'anno a 60cm di profondità in Italia',
    ],
    sections: [
      {
        heading: 'Essiccatura (la tecnica più antica)',
        steps: [
          'CARNE: taglia striscioline di 5mm contro il grano, marinata in sale+aceto 12h, essiccatura 8–12h a 70°C o 2–3 giorni al sole diretto',
          'PESCE: eviscera, apri a farfalla, sala abbondantemente, appendi al vento/sole — pronto in 1–3 giorni',
          'FRUTTA: fette di 3–5mm, succo di limone per antiossidare, sole + vento su griglie rialzate — 2–5 giorni',
          'VERDURE: sbollenta 2–3 min, raffredda in acqua gelata, taglia, essicca — trattiene meglio colore e nutrienti',
          'ERBE AROMATICHE: mazzetti appesi in luogo asciutto e ventilato — pronte in 1–2 settimane',
          'CONSERVAZIONE: in vasetti di vetro ermetici al buio — carni e pesce fino a 6 mesi, frutta/verdura 1 anno',
        ],
      },
      {
        heading: 'Salatura e salagione',
        steps: [
          'SALE GROSSO NON IODATO: lo iodio inibisce la fermentazione e altera il sapore',
          'CARNI: strofinatura a secco (1 kg di sale ogni 3 kg di carne) + pressione + 2–4 settimane al fresco',
          'PESCE: salagione umida (salamoia 20% = 200g sale/litro) o salagione secca a strati alternati',
          'VERDURE: 20–30g di sale per kg di verdura affettata, massaggia fino a che rilascia liquido',
          'CONSERVA IN SALAMOIA: immergi completamente — nessuna parte deve emergere (rischio botulino)',
          'DISSALATURA: metti in acqua dolce 24h cambiandola 3–4 volte prima del consumo',
        ],
      },
      {
        heading: 'Fermentazione lattica',
        steps: [
          'PRINCIPIO: lattobacilli (già presenti su verdure) fermentano gli zuccheri → acido lattico → pH < 4.6 = ambiente sterile',
          'CRAUTI: cavolo affettato fine + 20g sale/kg, pressa con mani fino a che produce liquido, metti in vaso, comprimi, copri col liquido stesso',
          'VERDURE FERMENTATE: stessa tecnica per carote, cetrioli, barbabietole, fagiolini',
          'TEMPERATURA: 15–22°C ottimale — in estate va veloce (3–5 giorni), in inverno più lento (2–3 settimane)',
          'CONTROLLO: il liquido deve sempre coprire le verdure — se affiora muffa bianca in superficie, rimuovila, non gettare tutto',
          'PRONTO: quando ha sapore acidulo piacevole e non sa di "marcio" — la fermentazione attiva lo preserva',
        ],
      },
      {
        heading: 'Conservazione sotterranea (root cellar)',
        steps: [
          'PROFONDITÀ: 60–90cm — temperatura costante 10–15°C tutto l\'anno, umidità naturale',
          'COSTRUZIONE RAPIDA: buca 1×1×0,6m, forra con paglia, rivesti con cassa di legno, copri con terreno + 20cm di paglia',
          'COSA CONSERVARE: patate, rape, barbabietole, carote, mele, cipolle, aglio — mesi di conservazione senza energia',
          'SEPARAZIONE: mele producono etilene che fa maturare prematuramente altre verdure — tienile separate',
          'UMIDITÀ: leggermente umido è meglio per radici; arieggia 1×/settimana per evitare muffe',
          'ALTERNATIVA: secchio di plastica con coperchio sepolto — funziona anche in giardino',
        ],
      },
    ],
    relatedGuides: ['cibo-scorte-piano', 'cibo-conservazione', 'survival-fuoco'],
    tasks: ['sv03', 'ci01'],
  },

  {
    id: 'survival-segnalazione',
    title: 'Segnalazione e Salvataggio',
    icon: 'ph-megaphone',
    category: 'comm',
    source: 'FM 21-76 · ICAO Distress Signals · Corpo Nazionale Soccorso Alpino (CNSAS)',
    readTime: '4 min',
    quickRef: [
      'Segnale internazionale di soccorso: 3 segnali qualsiasi a intervalli regolari (3 fischi, 3 fuochi, SOS)',
      'Specchio di segnalazione: visibile fino a 16km — più efficace di qualsiasi altro segnale',
      'Fumo di giorno: pneumatici, gomma, plastica fanno fumo NERO visibile; foglie verdi → fumo BIANCO',
      'Mantieni sempre una posizione nota — non vagare senza segnare il percorso',
      'CNSAS: 118 per emergenze montagna; VHF canale 16 in mare; PLB/EPIRB per localizzazione satellitare',
    ],
    sections: [
      {
        heading: 'Segnali ottici',
        steps: [
          'SPECCHIO (heliograph): tieni lo specchio vicino all\'occhio, mira attraverso il foro centrale, direziona il riflesso verso l\'aereo/elicottero',
          'Se nessun foro: rifletti la luce sulla mano, poi dirigi la mano verso il bersaglio spostando lo specchio',
          'CODICE: 3 lampeggi brevi + pausa + 3 lunghi + pausa + 3 brevi = SOS',
          'FUOCO CON FUMO: tre fuochi in triangolo equilatero (30m di lato) — segnale internazionale di soccorso',
          'FUMO BIANCO (visibile su sfondo scuro): foglie verdi, erba fresca, muschio bagnato sul fuoco',
          'FUMO NERO (visibile su sfondo chiaro/neve): pneumatico, plastica, olio, gomma bruciata',
          'PANNELLI A TERRA: sistema rocce, rami, vestiti formando X (bisogno di soccorso) o → (stiamo andando in questa direzione) — dimensione min 10m',
        ],
      },
      {
        heading: 'Segnali sonori',
        steps: [
          'FISCHIETTO: 3 fischi brevi + pausa (6 sec) + ripeti — porta a 1–2km in bosco',
          'Fischietto Fox 40 o Storm (no palla interna — funziona anche bagnato)',
          'RISPOSTA: 2 fischi = ti abbiamo sentito, stai fermo — 3 fischi = continua a segnalare',
          'VOCE: usa SOLO "AIUTO" — non urlare il nome, si disperde. Urla verso il vento, non contro',
          'COLPI SU ALBERO: 3 colpi ritmici con bastone su tronco — trasmette le vibrazioni lontano',
        ],
      },
      {
        heading: 'Segnali a terra per aerei',
        steps: [
          'X = bisogno di cure mediche urgenti',
          '→ o freccia = stiamo andando in questa direzione',
          'F = bisogno di cibo e acqua',
          'LL = tutto bene',
          'SOS in rocce/rami: lettere grandi almeno 10m, largo 1m, contrasto massimo col terreno',
          'Posizionali in campo aperto, prato, riva del lago — non in mezzo al bosco',
          'Rinnova ogni mattina: segnali deformati dal vento/pioggia non vengono riconosciuti',
        ],
      },
      {
        heading: 'Tecnologia di emergenza',
        steps: [
          'PLB (Personal Locator Beacon): attiva il sistema COSPAS-SARSAT — localizzazione satellitare a 100m entro 90 min, batteria 24–48h, no abbonamento',
          'SPOT/Garmin inReach: invio posizione GPS e messaggi di testo tramite satellite — richiede abbonamento',
          'EMERGENCY SOS iPhone/Android: anche senza SIM e senza campo, in molti paesi chiama i soccorsi tramite satellite',
          'VHF RADIO: in montagna canale CH16 (16 FM) per emergenze marittime; in alpinismo cerca la frequenza locale del soccorso alpino',
          'SMS in emergenza: spesso passa anche con 1 barra di segnale quando la voce no — invia "SOS + posizione" a parenti',
          'Mantieni il telefono in tasca interna (calore del corpo mantiene la batteria) — in emergenza non sprecarlo nelle chiamate lunghe',
        ],
      },
    ],
    relatedGuides: ['survival-navigazione', 'comm-radio-canali', 'gobag-checklist'],
    tasks: ['sv08', 'co01'],
  },

];

/* ── Categorie per filtro ── */
const GUIDE_CATEGORIES = [
  { id: 'all',      label: 'Tutte',          icon: 'ph-books'         },
  { id: 'acqua',    label: 'Acqua',          icon: 'ph-drop'          },
  { id: 'cibo',     label: 'Cibo',           icon: 'ph-fork-knife'    },
  { id: 'energia',  label: 'Energia',        icon: 'ph-lightning'     },
  { id: 'calore',   label: 'Calore',         icon: 'ph-flame'         },
  { id: 'medico',   label: 'Medico',         icon: 'ph-first-aid'     },
  { id: 'comm',     label: 'Comunicazioni',  icon: 'ph-radio'         },
  { id: 'mobilita', label: 'Mobilità',       icon: 'ph-car'           },
];

const PC_GUIDES = [
  {
    name: 'Guida Multirischio',
    desc: 'Terremoto, alluvione, maremoto, vulcano, incendi — guida completa sfogliabile',
    icon: 'ph-book-open',
    file: '/guides/pc/multirischio.pdf',
  },
  {
    name: 'Terremoto — Pieghevole',
    desc: 'Cosa fare prima, durante e dopo un sisma · formato pieghevole per stampa',
    icon: 'ph-waves',
    file: '/guides/pc/terremoto.pdf',
  },
  {
    name: 'Alluvione — Pieghevole',
    desc: 'Comportamenti corretti in caso di alluvione · formato pieghevole per stampa',
    icon: 'ph-drop-half',
    file: '/guides/pc/alluvione.pdf',
  },
  {
    name: 'Maremoto — Pieghevole',
    desc: 'Riconoscere i segnali e mettersi in salvo · formato pieghevole per stampa',
    icon: 'ph-waves',
    file: '/guides/pc/maremoto.pdf',
  },
  {
    name: 'Vulcano — Pieghevole',
    desc: 'Rischio vulcanico: come prepararsi e reagire · formato pieghevole per stampa',
    icon: 'ph-flame',
    file: '/guides/pc/vulcano.pdf',
  },
  {
    name: 'Incendi Boschivi — Pieghevole',
    desc: 'Prevenzione e comportamenti in caso di incendio · formato pieghevole per stampa',
    icon: 'ph-fire',
    file: '/guides/pc/incendi-boschivi.pdf',
  },
];

/* ── URL di riferimento per ogni guida ── */
const GUIDE_SOURCE_URLS = {
  // Acqua
  'acqua-purificazione':        'https://www.who.int/publications/i/item/9789241549950',
  'acqua-stoccaggio':           'https://www.ready.gov/water',
  'acqua-raccolta-pioggia':     'https://www.ready.gov/water',
  'acqua-fonti-alternative':    'https://armypubs.army.mil/',

  // Cibo
  'cibo-conservazione':         'https://nchfp.uga.edu/',
  'cibo-scorte-piano':          'https://www.ready.gov/food',
  'orto-emergenza':             'https://www.usda.gov/',
  'cibo-cottura-campo':         'https://armypubs.army.mil/',

  // Energia
  'energia-blackout-protocollo':'https://www.ready.gov/power-outages',
  'energia-generatore':         'https://www.ready.gov/generators',
  'isolamento-stanza':          'https://www.ready.gov/shelter',

  // Calore
  'riscaldamento-alternativo':  'https://www.ready.gov/extreme-cold',
  'ipotermia-prevenzione':      'https://www.cdc.gov/niosh/topics/cold/',

  // Medico
  'kit-medico':                 'https://www.cri.it/',
  'primo-soccorso':             'https://www.ifrc.org/',
  'farmaci-scorta':             'https://www.who.int/',

  // Comunicazioni
  'comm-piano-famiglia':        'https://www.ready.gov/make-a-plan',
  'comm-pmr446':                'https://www.etsi.org/',
  'comm-radio-canali':          'https://www.protezionecivile.gov.it/',
  'cyberattacco':               'https://www.ready.gov/cybersecurity',

  // Pianificazione
  'gobag-checklist':            'https://www.ready.gov/kit',
  'mappe-offline':              'https://www.openstreetmap.org/',
  'evacuazione-piano':          'https://www.ready.gov/evacuation',
  'sicurezza-casa':             'https://www.ready.gov/home-fires',
  'community-resilienza':       'https://www.ready.gov/cert',

  // Survival
  'survival-fuoco':             'https://armypubs.army.mil/',
  'survival-nodi':              'https://www.scout.org/',
  'survival-riparo':            'https://armypubs.army.mil/',
  'survival-navigazione':       'https://armypubs.army.mil/',
  'survival-acqua-natura':      'https://armypubs.army.mil/',
  'survival-piante':            'https://www.cai.it/',
  'survival-trappole':          'https://armypubs.army.mil/',
  'survival-primo-soccorso-campo': 'https://www.cri.it/',
  'survival-conservazione-cibo':   'https://nchfp.uga.edu/',
  'survival-segnalazione':         'https://www.cnsas.it/',
};

/* ── Guide da usare con cautela ──
   Indicazioni NON ancora verificate su una fonte ufficiale (sanitaria o italiana).
   'salute'  = salute, acqua da bere, cibo, farmaci, primo soccorso
   'pratica' = pratiche con rischio fisico non verificate su fonti ufficiali italiane
   Quando una guida viene verificata riga per riga su una fonte ufficiale, toglila da qui. */
const GUIDE_CAUTION = {
  'acqua-purificazione':           'salute',
  'acqua-raccolta-pioggia':        'salute',
  'acqua-fonti-alternative':       'salute',
  'cibo-conservazione':            'salute',
  'energia-generatore':            'salute',
  'riscaldamento-alternativo':     'salute',
  'ipotermia-prevenzione':         'salute',
  'kit-medico':                    'salute',
  'primo-soccorso':                'salute',
  'farmaci-scorta':                'salute',
  'nucleare-radiologico':          'salute',
  'survival-acqua-natura':         'salute',
  'survival-piante':               'salute',
  'survival-trappole':             'salute',
  'survival-primo-soccorso-campo': 'salute',
  'survival-conservazione-cibo':   'salute',
  'cibo-cottura-campo':            'pratica',
  'isolamento-stanza':             'pratica',
  'comm-pmr446':                   'pratica',
  'comm-radio-canali':             'pratica',
  'conflitto-rifugio':             'pratica',
  'survival-fuoco':                'pratica',
  'survival-riparo':               'pratica',
};

const GUIDE_CAUTION_TEXT = {
  salute:  'Guida a rischio: contiene indicazioni su salute, acqua, cibo o farmaci non ancora verificate da una fonte sanitaria ufficiale. Se applicate male possono essere pericolose. Usala con cautela, solo come orientamento. In caso di dubbio chiama il 112 o il tuo medico e segui le autorità sanitarie.',
  pratica: 'Guida non verificata: le indicazioni non sono ancora state controllate su fonti ufficiali italiane e alcune pratiche possono essere pericolose. Usala con cautela, solo come orientamento, e segui sempre le istruzioni delle autorità.',
};
