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
    source: 'CDC · EPA · OMS · SODIS (Eawag)',
    sources: [
      { n: 'CDC — Come rendere sicura l\'acqua in emergenza (bollitura, candeggina, filtri)', u: 'https://www.cdc.gov/water-emergency/about/index.html' },
      { n: 'EPA — Disinfezione d\'emergenza dell\'acqua potabile (tabella gocce 6% e 8,25%, odore di cloro)', u: 'https://www.epa.gov/ground-water-and-drinking-water/emergency-disinfection-drinking-water' },
      { n: 'Eawag — SODIS, disinfezione solare (pagina generale del metodo)', u: 'https://eawag.ch/en/department/sandec/projects/swp/solar-water-disinfection-sodis' },
    ],
    readTime: '4 min',
    quickRef: [
      'Bollitura: bollore vigoroso per 1 minuto (3 minuti sopra i 2.000 m) — il modo più sicuro per uccidere i germi',
      'Candeggina 6% non profumata: 2 gocce per litro, mescola e attendi 30 minuti',
      'Acqua torbida, colorata o molto fredda: raddoppia le gocce',
      'SODIS: bottiglia trasparente al sole pieno 6 ore · 2 giorni di fila se il cielo è coperto per più di metà',
      'Nessuno di questi metodi elimina le sostanze chimiche (carburanti, prodotti tossici)',
    ],
    sections: [
      {
        heading: 'Perché ogni fonte è sospetta',
        content: 'In emergenza anche l\'acqua che sembra limpida può contenere batteri, virus e parassiti (per esempio Giardia e Cryptosporidium). L\'aspetto non basta: tratta sempre l\'acqua di cui non sei sicuro. Se le autorità danno indicazioni per la tua zona (per esempio un avviso di bollitura), segui le loro.',
      },
      {
        heading: 'Metodo 1 — Bollitura (migliore)',
        steps: [
          'Se l\'acqua è torbida, lasciala depositare e filtrala con un panno pulito, carta da cucina o un filtro da caffè',
          'Porta a bollore vigoroso',
          'Mantieni il bollore per 1 minuto (3 minuti sopra i 2.000 m di quota)',
          'Lascia raffreddare e conserva in contenitori puliti con coperchio',
          'Se il sapore è "piatto", versala più volte da un contenitore pulito all\'altro',
          'La bollitura non elimina le sostanze chimiche',
        ],
      },
      {
        heading: 'Metodo 2 — Candeggina domestica',
        steps: [
          'Usa SOLO candeggina liquida non profumata, senza detergenti aggiunti e non "delicata sui colori"',
          'Controlla sull\'etichetta la percentuale di cloro: le dosi qui sotto valgono per il 6%',
          'Acqua limpida: 2 gocce per litro (8 gocce per gallone, cioè 3,8 litri)',
          'Acqua torbida, colorata o molto fredda: raddoppia la dose',
          'Mescola e attendi 30 minuti prima di bere',
          'Dopo 30 minuti l\'acqua deve avere un leggero odore di cloro: se non lo senti, ripeti la dose e attendi altri 15 minuti',
        ],
      },
      {
        heading: 'Metodo 3 — Filtro portatile',
        steps: [
          'Molti filtri portatili trattengono parassiti e batteri ma non i virus: leggi cosa dichiara il produttore',
          'Per eliminare anche i virus, dopo il filtro disinfetta l\'acqua (bollitura o candeggina)',
          'Per pulizia, durata e protezione dal gelo segui le istruzioni del produttore',
        ],
      },
      {
        heading: 'Metodo 4 — SODIS (solarizzazione)',
        steps: [
          'Usa bottiglie trasparenti e incolori, meglio in PET, da non più di 3 litri',
          'Prova di torbidità: metti la bottiglia piena su un titolo di giornale e guarda dall\'alto attraverso l\'acqua. Se non leggi le lettere, filtra prima',
          'Esponi la bottiglia al sole pieno',
          'Cielo sereno o coperto per meno di metà: almeno 6 ore',
          'Cielo coperto per più di metà: 2 giorni consecutivi',
          'Segna l\'ora di inizio sulla bottiglia',
        ],
      },
      {
        heading: 'Quale metodo scegliere',
        content: 'La bollitura è il modo più sicuro per uccidere i germi. Se non puoi bollire, usa la candeggina. Filtro e SODIS sono alternative quando mancano gli altri metodi. Nessun metodo rende sicura l\'acqua contaminata da carburanti o sostanze chimiche: in quel caso usa acqua in bottiglia o un\'altra fonte.',
      },
    ],
    relatedGuides: ['acqua-stoccaggio', 'acqua-raccolta-pioggia', 'acqua-fonti-alternative'],
    tasks: ['ac01', 'ac02', 'ac04'],
  },

  {
    id: 'acqua-stoccaggio',
    title: 'Scorte d\'acqua',
    icon: 'ph-cylinder',
    category: 'acqua',
    // Fonti: OMS Technical Note 9 (quantità minime in emergenza); Ready.gov «Water» (contenitori, pulizia, sostituzione)
    source: 'OMS · Ready.gov',
    sources: [
      { n: 'Ready.gov — Water (contenitori, pulizia, sostituzione ogni 6 mesi, caldo)', u: 'https://ready.gov/water' },
    ],
    readTime: '2 min',
    quickRef: [
      'Minimo OMS in emergenza: 7,5 litri a persona al giorno con l\'igiene di base (2,5–3 litri solo per bere e cucinare)',
      'Con molto caldo il bisogno d\'acqua può raddoppiare',
      'Meglio l\'acqua in bottiglia sigillata, in un luogo fresco e buio',
      'Contenitori tuoi: solo per alimenti, lavati e disinfettati prima di riempirli',
      'Acqua non imbottigliata: sostituiscila ogni 6 mesi',
    ],
    sections: [
      {
        heading: 'Quanto stoccare',
        steps: [
          'Solo per bere e cucinare servono 2,5–3 litri a persona al giorno (OMS, livello di sopravvivenza)',
          'Con l\'igiene di base il minimo OMS in emergenza è 7,5 litri a persona al giorno',
          'Con molto caldo il bisogno può raddoppiare',
          'Esempio a 7,5 litri: 4 persone per 7 giorni = 210 litri; per 30 giorni = 900 litri. Il calcolatore Acqua fa il conto per la tua famiglia',
        ],
      },
      {
        heading: 'Contenitori',
        steps: [
          'La scelta più semplice: acqua in bottiglia, nella confezione originale sigillata',
          'Se usi contenitori tuoi, comprali adatti agli alimenti',
          'Prima di riempirli lavali con detersivo per piatti e risciacqua',
          'Poi disinfettali con 1 cucchiaino di candeggina liquida non profumata per ogni litro d\'acqua circa (Ready.gov: per quarto di gallone), e riempili con acqua del rubinetto',
        ],
      },
      {
        heading: 'Conservare e sostituire',
        steps: [
          'Tieni l\'acqua in un luogo fresco e buio',
          'L\'acqua in bottiglia resta nella confezione originale sigillata',
          'L\'acqua che hai messo tu nei contenitori va sostituita ogni 6 mesi',
        ],
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
    sources: [
      { n: 'CDC – Raccolta dell\'acqua piovana e salute (non potabile senza trattamento; contaminanti dal tetto; deviatore della prima pioggia)', u: 'https://www.cdc.gov/drinking-water/about/collecting-rainwater-and-your-health-an-overview.html' },
    ],
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
        content: 'L\'acqua piovana raccolta dal tetto contiene: polvere atmosferica, escrementi di uccelli, residui di tegole/lamiere, possibili metalli pesanti. Non è mai potabile diretta. Trattamento minimo prima del consumo: filtro fisico (sedimenti) + bollitura o candeggina. Per irrigare le piante da mangiare il CDC consiglia acqua di rete o in bottiglia: quella piovana raccolta dal tetto può contaminarle. Usala non trattata solo per piante non commestibili.',
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
    sources: [
      { n: 'CDC – Come trovare acqua pulita in emergenza (scaldabagno, tubature, ghiaccio, fiumi e pioggia da trattare)', u: 'https://www.cdc.gov/water-emergency/about/how-to-find-clean-water-in-an-emergency.html' },
      { n: 'CDC – Come rendere sicura l\'acqua (caloriferi e caldaie dell\'impianto di riscaldamento da non usare)', u: 'https://www.cdc.gov/water-emergency/about/index.html' },
    ],
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
        content: 'Prima di una crisi, individua entro 2km da casa: pozzi (pubblici e privati), fontanelle pubbliche a caduta, fiumi/torrenti, laghetti. Mappa mentalmente le direzioni e i tempi di percorso a piedi.',
      },
      {
        heading: 'Pozzi privati',
        steps: [
          'Acqua di pozzo non è automaticamente potabile: può contenere nitrati, batteri fecali, metalli',
          'Se il pozzo non è mai stato analizzato: tratta sempre come acqua di fiume',
          'Trattamento minimo: filtro + bollitura',
          'Pozzo fermo da tempo: prima di usarlo chiedi consiglio al Comune o all\'ASL',
          'Pozzo vicino a zona agricola: rischio nitrati — non dare ai bambini sotto 1 anno senza analisi',
        ],
      },
      {
        heading: 'Corsi d\'acqua superficiali',
        steps: [
          'Preleva acqua il più possibile a monte rispetto ad abitazioni e attività umane',
          'Acqua di montagna è generalmente più sicura di quella di pianura',
          'Filtra sedimenti con panno o filtro improvvisato (ghiaia + sabbia + carbone in bottiglia)',
          'Prima di bere: bollore vigoroso per 1 minuto (3 minuti sopra i 2.000 m) o candeggina come nella guida Purificazione dell\'acqua (CDC)',
          'EVITA assolutamente acqua: verde (alghe), schiumosa (detergenti), con odori chimici, a valle di ospedali o industrie',
        ],
      },
      {
        heading: 'Fonti non convenzionali',
        content: 'Scaldabagno: contiene acqua che si può scaricare dal rubinetto in basso. Tubature della casa: chiudi il rubinetto principale, apri il punto più basso dell\'impianto. Ghiaccio del congelatore: quando si scongela, è acqua sicura se era ghiaccio da acqua potabile. Non usare mai l\'acqua dei caloriferi o dell\'impianto di riscaldamento (FEMA).',
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
    source: 'USDA · FM 21-76 · ISS',
    sources: [
      { n: 'ISS e Ministero della Salute – Linee guida per le conserve in ambito domestico (botulismo, pastorizzazione, conserve poco acide, carne e pesce)', u: 'https://www.iss.it/documents/20126/2293568/LineeGuidaConserve_light.pdf/f76af27b-51bb-4675-158b-7433f66d07de?t=1575730710064' },
      { n: 'CDC – Conserve fatte in casa e botulismo (vasetti gonfi, con odore strano o muffa da buttare)', u: 'https://www.cdc.gov/botulism/prevention/home-canned-foods.html' },
    ],
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
          'In Italia la gran parte dei casi di botulismo viene da conserve fatte in casa, soprattutto sott\'olio e non acide (ISS)',
          'Sterilizzare i vasetti vuoti serve solo per l\'igiene: non rende sicura la conserva',
          'Per sott\'olio e sott\'aceto segui passo per passo le «Linee guida per la corretta preparazione delle conserve alimentari in ambito domestico» di ISS e Ministero della Salute',
          'Gli alimenti poco acidi (pH sopra 4,6) non si possono rendere sicuri in casa con la pentola a pressione: non raggiunge le temperature che distruggono le spore del botulino (ISS). Meglio preferire alimenti in vasetti industriali o congelati',
          'Non consumare mai vasetti con il coperchio gonfio, bollicine o odore strano',
        ],
      },
    ],
    relatedGuides: ['cibo-scorte-piano', 'cibo-cottura-campo'],
    tasks: ['ci01', 'ci04'],
  },

  {
    id: 'cibo-scorte-piano',
    title: 'Scorte di cibo',
    icon: 'ph-stack',
    category: 'cibo',
    // Fonti: Ready.gov «Food»; Commissione europea, linee guida 72 ore (3/11/2026); Alertswiss «Piano d'emergenza»;
    // 2.100 kcal a persona al giorno: Manuale Sphere / UNHCR (usato dal calcolatore Cibo)
    source: 'Ready.gov · Commissione UE · Alertswiss · Sphere',
    sources: [
      { n: 'Commissione europea – Linee guida sull\'autonomia di almeno 72 ore (cibo conservabile a temperatura ambiente, acqua, luce, medicine, igiene, radio, contanti, animali)', u: 'https://civil-protection-knowledge-network.europa.eu/system/files/2026-11/sufficiency-of-at-least-72-hours-under-the-eu-preparedness-union-strategy.pdf' },
      { n: 'Ready.gov – Prepara un kit (apriscatole, cibo in luogo fresco e asciutto, sostituire gli scaduti, cibo per animali)', u: 'https://www.ready.gov/kit' },
    ],
    readTime: '3 min',
    quickRef: [
      'Almeno 72 ore di autonomia (Commissione UE); meglio scorte per più giorni',
      'Cibi che la famiglia mangia davvero, comprese le diete speciali',
      'Anche cibi pronti che si mangiano senza cottura, e un apriscatole manuale',
      'Luogo fresco, asciutto e al buio; contenitori chiusi',
      'Consuma e ricompra regolarmente, controllando le scadenze',
    ],
    sections: [
      {
        heading: 'Cosa tenere',
        steps: [
          'Carne, frutta e verdura in scatola pronte da mangiare, e un apriscatole manuale',
          'Barrette proteiche o di frutta, cereali secchi o muesli, burro di arachidi, frutta secca',
          'Succhi in scatola e latte a lunga conservazione',
          'Cibi molto energetici e qualche cibo che consola',
          'Cibo per neonati e per chi ha diete speciali; cibo per gli animali',
          'Posate e stoviglie',
        ],
      },
      {
        heading: 'Quanto',
        steps: [
          'Obiettivo minimo: soddisfare i bisogni essenziali per almeno 72 ore (Commissione UE)',
          'Meglio una scorta per più giorni (Ready.gov); il piano svizzero indica cibo per una settimana',
          'Il calcolatore Cibo usa 2.100 kcal a persona al giorno, il valore medio per gli aiuti nelle emergenze (Sphere, UNHCR)',
        ],
      },
      {
        heading: 'Conservare e ruotare',
        steps: [
          'Conserva le scorte in un luogo fresco, asciutto e al buio',
          'Tieni il cibo in contenitori chiusi',
          'Consuma le scorte e ricomprale regolarmente, attento alla data di scadenza',
          'Non mangiare da lattine gonfie, ammaccate o arrugginite',
          'Butta il cibo con odore, colore o consistenza strani, o venuto a contatto con acqua di alluvione',
        ],
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
          'Conserva in frigo (se disponibile) max 3 giorni. Meglio cotti: i germogli crudi sono sconsigliati a bambini, anziani, donne in gravidanza e persone con difese immunitarie basse (FDA)',
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

  {
    id: 'cibo-senza-frigo-gas',
    title: 'Frigo a evaporazione e cottura a fuoco spento',
    icon: 'ph-cooking-pot',
    category: 'cibo',
    // Fonti (non ufficiali): Practical Action «Evaporative cooling – the clay refrigerator»; Tearfund «Making a zeer pot fridge»;
    // Low Impact «Haybox (retained heat) cooking and food safety». Zona di pericolo 5–60 °C: USDA/FSIS.
    source: 'Practical Action · Tearfund · Low Impact · USDA (non tutte ufficiali)',
    readTime: '3 min',
    quickRef: [
      'Frigo a evaporazione: un vaso di terracotta dentro uno più grande, sabbia bagnata in mezzo, panno bagnato sopra',
      'Funziona bene solo con clima secco e caldo. NON va bene per carne, latticini e farmaci',
      'Cottura a fuoco spento: porta a bollore pieno, poi chiudi la pentola in una cassa isolata (coperte, paglia)',
      'Il cibo non deve restare a lungo tra 5 e 60 °C: prima di mangiare riportalo a bollore',
      'Risparmia combustibile, ma richiede più tempo',
    ],
    sections: [
      {
        heading: 'Frigo a evaporazione (vaso nel vaso)',
        steps: [
          'Metti un vaso di terracotta non smaltata dentro un vaso più grande',
          'Riempi lo spazio tra i due vasi con sabbia e bagnala',
          'Metti frutta e verdura nel vaso interno e coprilo con un panno bagnato',
          'Aggiungi acqua alla sabbia più volte al giorno, perché resti sempre umida',
          'Tienilo in un posto asciutto e ventilato: l\'acqua che evapora porta via calore',
          'Funziona poco con aria umida. Non usarlo per carne, latticini o farmaci che devono restare freddi',
        ],
      },
      {
        heading: 'Cottura a fuoco spento (cassa termica)',
        steps: [
          'Porta il cibo a bollore pieno sul fuoco, nella sua pentola con coperchio',
          'Togli dal fuoco e metti subito la pentola in una cassa o scatola ben isolata (coperte, cuscini, paglia, sacco a pelo)',
          'Lascia cuocere con il calore trattenuto: serve più tempo della cottura normale',
          'Prima di mangiare riporta il cibo a bollore, o controlla con un termometro: sotto i 60 °C i batteri possono crescere',
          'Adatto a legumi, cereali e zuppe. Non lasciare il cibo tiepido per ore',
        ],
      },
    ],
    relatedGuides: ['cibo-conservazione', 'cibo-cottura-campo'],
    tasks: [],
  },

  /* ══════════════════════ ENERGIA ══════════════════════ */
  {
    id: 'energia-blackout-protocollo',
    title: 'Blackout totale: cosa fare',
    icon: 'ph-lightning-slash',
    category: 'energia',
    // Fonti: Ready.gov «Power Outages»; Energy.gov «Keeping Mobile Devices Charged»;
    // Comune di Ravenna, Protezione civile, «Rischio black out elettrico»;
    // Commissione europea, linee guida di preparazione 72 ore (3/11/2026); Alertswiss «Piano d'emergenza»
    source: 'Ready.gov · Energy.gov · Protezione civile (Ravenna) · Commissione UE · Alertswiss',
    sources: [
      { n: 'Ready.gov – Interruzione di corrente (frigo 4 ore, freezer 48 ore, cibo oltre 40 °F per 2 ore, apparecchi spenti, fornelli a gas, farmaci in frigo)', u: 'https://www.ready.gov/power-outages' },
      { n: 'Protezione Civile – Vademecum «Protezione civile in famiglia», capitolo black out (torcia e radio a pile, frigo chiuso, ascensore, telefono, ritorno della corrente)', u: 'https://www.protezionecivile.gov.it/static/40f6aa132a339e223934865d7a37341d/vademecum_pc_ita.pdf' },
      { n: 'Commissione europea – Linee guida sull\'autonomia di almeno 72 ore (radio a batterie, power bank, contanti)', u: 'https://civil-protection-knowledge-network.europa.eu/system/files/2026-11/sufficiency-of-at-least-72-hours-under-the-eu-preparedness-union-strategy.pdf' },
    ],
    readTime: '4 min',
    quickRef: [
      'Spegni o stacca gli apparecchi accesi: al ritorno la corrente può arrivare con sbalzi che li danneggiano',
      'Non usare l\'ascensore finché non è annunciato il ripristino della rete',
      'Tieni chiusi frigo e freezer: il frigo tiene il freddo circa 4 ore, il freezer pieno circa 48 ore',
      'Ascolta la radio a pile per le notizie. Usa il telefono solo per le emergenze',
      'Apparecchi medici elettrici vitali senza corrente: chiama il 118 o i servizi sociali',
      'Mai fornelli a gas, generatori o barbecue per scaldare o illuminare in casa: monossido e incendio',
    ],
    sections: [
      {
        heading: 'Cosa può smettere di funzionare',
        content: 'Con un blackout esteso possono fermarsi anche servizi che non sembrano elettrici: bancomat e banche possono restare chiusi e i pagamenti elettronici possono bloccarsi; l\'acqua potabile può mancare; la rete del cellulare e internet possono essere sovraccariche o ferme; gli ascensori si fermano. Il telefono fisso funziona senza corrente solo con alcuni impianti: verifica in anticipo il tuo e per quanto tempo regge la sua batteria.',
      },
      {
        heading: 'Prepararsi prima',
        steps: [
          'Fai l\'elenco di tutto ciò che in casa dipende dalla corrente e prevedi pile o altre fonti di energia per ciò che ti serve davvero',
          'Una torcia per ogni persona della famiglia, con pile di riserva',
          'Una radio a pile (FM, meglio se anche DAB+) con pile di riserva',
          'Powerbank e caricatori portatili tenuti carichi; un caricatore da auto per il telefono',
          'Contanti in casa, con banconote di piccolo taglio e monete, per gli acquisti indispensabili se i pagamenti elettronici si bloccano',
          'Acqua e cibo per almeno 72 ore, compresi alimenti che si mangiano senza cottura (vedi le guide Acqua e Cibo)',
          'Se in famiglia qualcuno usa apparecchi medici elettrici o farmaci da frigo: prepara un piano con il medico e chiedi per quanto tempo i farmaci restano validi fuori dal frigo',
          'Rilevatori di monossido di carbonio con batteria, su ogni piano della casa',
        ],
      },
      {
        heading: 'Durante il blackout',
        steps: [
          'Spegni gli apparecchi che erano accesi (computer, lavatrice, ecc.): la corrente può tornare con sbalzi',
          'Non prendere l\'ascensore: anche se la corrente torna per poco, può essere solo per i lavori di riparazione',
          'Non intasare le linee per cercare notizie: ascolta la radio e usa il telefono solo per le emergenze',
          'Apri il meno possibile frigo e freezer. Se serve usa borse frigo con ghiaccio e controlla la temperatura con un termometro',
          'Se fa molto caldo o molto freddo, vai in un luogo pubblico con corrente indicato dal Comune',
          'Non usare il fornello o il forno a gas per scaldare la casa',
          'Generatore: mai collegarlo all\'impianto elettrico di casa. Collega gli apparecchi direttamente al generatore, sempre all\'aperto (vedi la guida Generatore)',
        ],
      },
      {
        heading: 'Quando torna la corrente',
        steps: [
          'Riaccendi gli apparecchi un po\' alla volta, non tutti insieme',
          'Butta il cibo rimasto a 4 °C o più per 2 ore o più, o che ha odore, aspetto o consistenza strani. Nel dubbio, buttalo',
          'Se la corrente è mancata per più di un giorno, butta i farmaci che vanno tenuti in frigo, salvo diversa indicazione sulla confezione, e chiedi subito al medico o al farmacista come sostituirli',
        ],
      },
    ],
    relatedGuides: ['energia-ricarica', 'senza-internet', 'energia-generatore', 'comm-piano-famiglia'],
    tasks: ['en01', 'en02', 'en04'],
  },

  {
    id: 'energia-ricarica',
    title: 'Ricaricare il telefono senza corrente',
    icon: 'ph-battery-charging',
    category: 'energia',
    // Fonti: Energy.gov «Keeping Mobile Devices Charged»; Ready.gov «Power Outages» e «Get Tech Ready»;
    // FCC/FEMA «Tips for communicating in an emergency»; Commissione europea (powerbank carichi)
    source: 'Energy.gov · Ready.gov · FCC/FEMA · Commissione UE',
    sources: [
      { n: 'FCC/FEMA – Consigli per comunicare in emergenza (luminosità, modalità aereo, ricarica in auto all\'aperto, chiamate brevi)', u: 'https://docs.fcc.gov/public/attachments/DOC-309723A1.pdf' },
      { n: 'Ready.gov – Interruzione di corrente (power bank)', u: 'https://www.ready.gov/power-outages' },
    ],
    readTime: '3 min',
    quickRef: [
      'Prima dell\'emergenza: powerbank carichi, pile di riserva e caricatore da auto',
      'Risparmia batteria: luminosità bassa, modalità aereo quando non ti serve la rete, chiudi le app',
      'In auto: ricarica solo con l\'auto all\'aperto in un posto ben ventilato, mai in garage',
      'Radio a manovella o solare con presa USB: alcune ricaricano il telefono, leggi prima il manuale',
      'Chiamate brevi, solo informazioni essenziali. Se la chiamata non passa, prova con un SMS',
    ],
    sections: [
      {
        heading: 'Prima: cosa tenere pronto',
        steps: [
          'Powerbank e caricatori portatili, tenuti sempre carichi',
          'Pile di riserva per i dispositivi che le usano (radio, torce)',
          'Un caricatore da auto per il telefono',
          'Se vuoi una fonte che non si esaurisce: un caricatore solare o a manovella',
        ],
      },
      {
        heading: 'Far durare la batteria',
        steps: [
          'Abbassa la luminosità dello schermo',
          'Metti il telefono in modalità aereo quando non ti serve la rete',
          'Chiudi le app che non stai usando',
          'Fai chiamate brevi e di\' solo le informazioni essenziali',
        ],
      },
      {
        heading: 'Ricaricare in auto',
        content: 'Puoi ricaricare il telefono con il caricatore dell\'auto. Se per farlo devi tenere acceso il motore, l\'auto deve stare all\'aperto in un posto ben ventilato: mai in garage, nemmeno con la porta aperta, per il monossido di carbonio. Esci con l\'auto solo quando il pericolo è passato. Con l\'autoradio puoi anche ascoltare le notizie e gli avvisi.',
      },
      {
        heading: 'Radio a manovella o solare',
        content: 'Alcune radio a manovella o solari hanno una presa USB e possono dare un po\' di carica al telefono. Prima di usarla per ricaricare, leggi il manuale della radio. Sono utili anche perché ricevono le notizie senza pile e senza corrente.',
      },
    ],
    relatedGuides: ['energia-blackout-protocollo', 'senza-internet', 'comm-radio-canali'],
    tasks: [],
  },

  {
    id: 'energia-solare-piccola',
    title: 'Pannello solare e batterie portatili',
    icon: 'ph-solar-panel',
    category: 'energia',
    // Fonti: Energy.gov (powerbank, caricatori); indicazioni dei produttori di batterie (non ufficiali): marcatura,
    // ventilazione, lontano da materiali infiammabili. Il collegamento all'impianto di casa: Protezione civile (Ravenna)
    source: 'Energy.gov · Protezione civile · indicazioni dei produttori (non ufficiali)',
    readTime: '2 min',
    quickRef: [
      'Un pannello solare portatile con una batteria portatile (power station) può ricaricare telefono, radio, luci',
      'Compra prodotti con marcatura CE e segui il manuale del produttore',
      'Batteria in un posto ventilato, asciutto, lontano da fonti di calore e da cose che bruciano',
      'Non collegare mai pannelli o batterie all\'impianto elettrico di casa da solo: serve un elettricista',
      'Batteria gonfia, calda o che puzza: staccala, portala lontano da cose infiammabili, non usarla più',
    ],
    sections: [
      {
        heading: 'A cosa serve',
        content: 'Un piccolo pannello solare portatile e una batteria portatile (power station o powerbank grande) ti danno un po\' di corrente anche se il blackout dura giorni: per telefono, radio, luci LED, piccoli apparecchi. Quanta energia ottieni dipende dal sole e dalla potenza del pannello: controlla i dati del produttore e prova il sistema prima dell\'emergenza.',
      },
      {
        heading: 'Usarlo in sicurezza',
        steps: [
          'Scegli prodotti con marcatura CE e leggi il manuale',
          'Carica e usa la batteria in un posto ventilato e asciutto, lontano dal sole diretto, da fonti di calore e da materiali infiammabili',
          'Non coprirla mentre lavora: scalda un po\' durante la carica e con apparecchi potenti',
          'Non collegarla da solo all\'impianto elettrico di casa: un collegamento fisso lo fa solo un elettricista abilitato',
          'Se la batteria si gonfia, scotta, fa fumo o puzza: staccala, allontanala da cose che bruciano e non usarla più',
          'Tienila carica e provala ogni tanto, come i powerbank',
        ],
      },
    ],
    relatedGuides: ['energia-ricarica', 'energia-blackout-protocollo'],
    tasks: [],
  },

  {
    id: 'energia-generatore',
    title: 'Generatore: Uso Sicuro',
    icon: 'ph-engine',
    category: 'energia',
    source: 'Ready.gov (FEMA) · CDC · CPSC · Protezione civile',
    sources: [
      { n: 'CDC – Monossido di carbonio (generatore solo all\'aperto a più di 20 piedi da finestre, porte e prese d\'aria; mai in casa o garage; sintomi; rilevatori)', u: 'https://www.cdc.gov/carbon-monoxide/about/index.html' },
      { n: 'Ready.gov – Interruzione di corrente (generatore ad almeno 20 piedi, rilevatori di CO su ogni piano)', u: 'https://www.ready.gov/power-outages' },
    ],
    readTime: '3 min',
    quickRef: [
      'SOLO all\'aperto: mai in casa, in garage o in locali semichiusi. Il monossido di carbonio (CO) non ha colore né odore e uccide senza preavviso',
      'Almeno 6 metri (20 piedi) da finestre, porte e garage attaccati alla casa',
      'Rifornimento: spegnilo e lascialo raffreddare. La benzina versata su parti calde può prendere fuoco',
      'Rilevatori di CO funzionanti su ogni piano della casa',
      'Tienilo asciutto e collega gli apparecchi con prolunghe per uso pesante',
    ],
    sections: [
      {
        heading: 'Monossido di carbonio — il pericolo invisibile',
        content: 'Il generatore produce monossido di carbonio (CO), un gas senza colore e senza odore che uccide senza preavviso. Solo un rilevatore di CO funzionante può avvisarti. Se ti senti male, hai mal di testa, nausea o capogiri mentre il generatore è acceso, esci subito all\'aria aperta e chiama il 112 o il 118.',
      },
      {
        heading: 'Installazione corretta',
        steps: [
          'Usalo solo all\'aperto, ad almeno 6 metri (20 piedi) da finestre, porte e garage attaccati alla casa',
          'Mai in casa, in garage o in cantina, nemmeno con porte e finestre aperte',
          'Tienilo asciutto e al riparo da pioggia e allagamenti: toccare un generatore bagnato o gli apparecchi collegati può dare la scossa',
          'Collega gli apparecchi direttamente al generatore con prolunghe per uso pesante',
          'Non collegarlo mai all\'impianto elettrico di casa (per esempio con una spina in una presa): rischi folgorazione e incendio, e la corrente può tornare nella rete e ferire chi la ripara. Un collegamento fisso all\'impianto lo può fare solo un elettricista abilitato',
          'Installa rilevatori di CO funzionanti su ogni piano della casa',
        ],
      },
      {
        heading: 'Rifornimento e manutenzione',
        steps: [
          'Prima del rifornimento spegnilo e lascialo raffreddare: la benzina versata su parti calde può prendere fuoco',
          'Segui con attenzione le istruzioni del produttore per uso, olio, manutenzione e conservazione del carburante',
        ],
      },
    ],
    relatedGuides: ['energia-blackout-protocollo'],
    tasks: ['en01', 'en04'],
  },

  /* ══════════════════════ CASA E PERSONE ══════════════════════ */
  {
    id: 'igiene-wc-emergenza',
    title: 'Igiene e bagno senza acqua corrente',
    icon: 'ph-toilet',
    category: 'casa',
    // Fonti: CDC «Potential Sanitation Solutions During an Emergency Response»; NC DHHS «Toilet use during an emergency»;
    // Oregon OEM e Washington County (OR) «Disaster sanitation»; Ready.gov «Build a kit»
    source: 'CDC · NC DHHS · Oregon OEM · Ready.gov',
    sources: [
      { n: 'NC DHHS – Come usare il bagno in emergenza (sacco dentro un sacco, materiale assorbente, secchio da 5 galloni, lavare le mani)', u: 'https://www.ncdhhs.gov/toilet-use-during-emergency/open' },
    ],
    readTime: '3 min',
    quickRef: [
      'Prima prova un bagno funzionante di un vicino o di un locale vicino',
      'WC senza acqua: chiudi il rubinetto del WC, svuota la tazza e mettici dentro due sacchi della spazzatura uno nell\'altro',
      'Dopo ogni uso copri con segatura, carta sminuzzata, lettiera o terra asciutta e chiudi il sacco',
      'Sacchi pieni: doppio sacco, chiusi, lontano da cibo e acqua',
      'Accanto al bagno: sapone, acqua e asciugamani di carta per lavarsi le mani ogni volta',
    ],
    sections: [
      {
        heading: 'Cosa tenere pronto',
        steps: [
          'Sacchi robusti per la spazzatura e fascette o lacci per chiuderli',
          'Un secchio con coperchio che chiude bene',
          'Carta igienica, salviette umide, sapone, gel igienizzante, assorbenti e prodotti per l\'igiene personale',
          'Segatura, lettiera per gatti, sabbia o carta sminuzzata per coprire',
          'Candeggina per disinfettare',
        ],
      },
      {
        heading: 'Bagno di emergenza nel WC',
        steps: [
          'Chiudi il rubinetto dell\'acqua del WC e svuota l\'acqua rimasta nella tazza: non deve riempirsi di nuovo',
          'Metti nella tazza un sacco dentro un altro sacco della spazzatura',
          'Dopo ogni uso copri con segatura, carta sminuzzata, lettiera o terra asciutta: asciuga e riduce l\'odore',
          'Chiudi il sacco tra un uso e l\'altro e tieni chiuso il coperchio',
          'Se non hai il WC, usa un secchio con coperchio, rivestito allo stesso modo',
          'I bambini piccoli vanno sorvegliati quando usano il bagno di emergenza',
        ],
      },
      {
        heading: 'Rifiuti e mani',
        steps: [
          'Chiudi bene i sacchi pieni, mettili in un secondo sacco e tienili separati dalla spazzatura normale, lontano da cibo e acqua',
          'Segui le indicazioni del Comune su dove e quando portarli via',
          'Lavati le mani con acqua e sapone dopo il bagno e prima di toccare il cibo. Se l\'acqua manca usa il gel igienizzante',
          'Se il secchio si sporca, disinfettalo con candeggina diluita o buttalo',
        ],
      },
    ],
    relatedGuides: ['acqua-stoccaggio', 'energia-blackout-protocollo'],
    tasks: [],
  },

  {
    id: 'casa-utenze',
    title: 'Chiudere gas, acqua e luce',
    icon: 'ph-wrench',
    category: 'casa',
    // Fonti: Ready.gov «Utility Shut-off & Safety» (archivio) e «Safety skills»; Adams County OEM (CO)
    source: 'Ready.gov · Adams County OEM',
    sources: [
      { n: 'Ready.gov – Competenze di sicurezza (gas, corrente, acqua: dove sono i rubinetti, ordine degli interruttori, chi riapre il gas)', u: 'https://www.ready.gov/safety-skills' },
    ],
    readTime: '2 min',
    quickRef: [
      'Impara ORA dove sono i rubinetti di gas e acqua e il quadro elettrico, e insegnalo a tutti in casa',
      'Chiudili solo se le autorità lo chiedono o se c\'è un pericolo reale (odore di gas, perdita, allagamento)',
      'Odore di gas: niente fiamme né interruttori, apri le finestre, esci e chiama il 112 da fuori',
      'Il gas, una volta chiuso, lo deve riaprire solo un tecnico',
      'Luce: abbassa prima i singoli interruttori, poi il generale',
    ],
    sections: [
      {
        heading: 'Prepararsi prima',
        steps: [
          'Trova il rubinetto del gas, il rubinetto generale dell\'acqua dentro casa e il quadro elettrico',
          'Segnali con un\'etichetta e tieni vicino l\'attrezzo che serve (alcuni rubinetti richiedono una chiave apposita)',
          'Mostra a tutti gli adulti della famiglia come si chiudono',
        ],
      },
      {
        heading: 'Quando chiudere',
        content: 'Chiudi le utenze solo se te lo chiedono le autorità o se c\'è un pericolo reale: odore di gas, una perdita d\'acqua, acqua che entra in casa, fili danneggiati. Nel dubbio chiedi al gestore o al 112. Una scintilla elettrica può incendiare il gas che perde: se senti odore di gas non toccare interruttori, non accendere fiamme, apri le finestre, esci e chiama il 112 da fuori.',
      },
      {
        heading: 'Come chiudere',
        steps: [
          'Gas: gira il rubinetto del contatore in posizione chiusa. NON riaprirlo da solo: deve farlo un tecnico',
          'Elettricità: abbassa prima i singoli interruttori del quadro, poi l\'interruttore generale',
          'Acqua: usa il rubinetto generale dentro casa. Quello in strada è spesso difficile da girare e richiede un attrezzo speciale',
        ],
      },
    ],
    relatedGuides: ['evacuazione-piano', 'sicurezza-casa'],
    tasks: [],
  },

  {
    id: 'animali-emergenza',
    title: 'Animali domestici in emergenza',
    icon: 'ph-paw-print',
    category: 'casa',
    // Fonti: Ready.gov «Pets and Animals»; Commissione europea, linee guida 72 ore (3/11/2026)
    source: 'Ready.gov · Commissione UE',
    sources: [
      { n: 'Ready.gov – Animali domestici (evacuare con gli animali, rifugi che non li accettano, microchip, kit, trasportino)', u: 'https://www.ready.gov/pets' },
    ],
    readTime: '3 min',
    quickRef: [
      'Se devi evacuare, porta con te anche gli animali: non lasciarli chiusi in casa',
      'Molti rifugi pubblici e alberghi non accettano animali: trova prima un posto che li accetti',
      'Microchip con i tuoi recapiti aggiornati, collare con medaglietta e un contatto fuori zona',
      'Kit: cibo e acqua per alcuni giorni, ciotola, farmaci, guinzaglio, trasportino, sacchetti',
      'Una tua foto insieme all\'animale aiuta a dimostrare che è tuo se vi separate',
    ],
    sections: [
      {
        heading: 'Il piano',
        steps: [
          'Trova prima un posto sicuro dove portare gli animali: molti rifugi pubblici e alberghi non li accettano',
          'Accordati con vicini, amici o parenti che possano occuparsene o portarli via se tu non puoi',
          'Fai mettere il microchip e tieni aggiornati i tuoi recapiti; aggiungi un contatto fuori dalla tua zona',
          'Chiedi al tuo veterinario e al Comune come gestire gli animali in emergenza',
          'Al primo segnale di pericolo porta gli animali dentro casa',
        ],
      },
      {
        heading: 'Il kit per l\'animale',
        steps: [
          'Cibo per alcuni giorni in un contenitore chiuso e impermeabile, acqua e ciotola',
          'Una scorta dei suoi farmaci in un contenitore impermeabile; chiedi al veterinario cosa serve per il primo soccorso',
          'Collare con medaglietta, pettorina o guinzaglio, e un ricambio',
          'Trasportino robusto per ogni animale',
          'Copia dei documenti (libretto, registrazione) in busta impermeabile e sul telefono',
          'Igiene: lettiera, giornali, carta, sacchetti, candeggina',
          'Una tua foto con l\'animale, giochi o coperta familiari per ridurre lo stress',
          'Controlla il kit spesso e cambia cibo e farmaci prima che scadano',
        ],
      },
      {
        heading: 'Abituarlo al trasportino',
        steps: [
          'Lascia il trasportino aperto dove l\'animale sta di solito',
          'Mettici dentro premi e una coperta che conosce',
          'Impara dove si nasconde, per trovarlo in fretta se devi uscire',
        ],
      },
    ],
    relatedGuides: ['evacuazione-piano', 'gobag-checklist'],
    tasks: [],
  },

  {
    id: 'stress-bambini',
    title: 'Paura e stress: adulti e bambini',
    icon: 'ph-heart',
    category: 'casa',
    // Fonte: Ready.gov «Coping with Disaster»
    source: 'Ready.gov',
    sources: [
      { n: 'Ready.gov – Affrontare un disastro (parlare dei sentimenti, routine, notizie, quando chiedere aiuto)', u: 'https://www.ready.gov/coping-disaster' },
    ],
    readTime: '3 min',
    quickRef: [
      'È normale avere paura, rabbia o tristezza: parlarne aiuta',
      'Mantieni il più possibile la routine: pasti, sonno, gioco, piccoli compiti',
      'Con i bambini: abbracci, risposte semplici e vere, tempo in più insieme',
      'Limita le notizie ripetute davanti ai bambini e guardale insieme a loro',
      'Se il disagio dura o peggiora, chiedi aiuto al medico, al pediatra o a uno psicologo',
    ],
    sections: [
      {
        heading: 'Per gli adulti',
        steps: [
          'Parla con qualcuno di ciò che provi: paura, rabbia, tristezza',
          'Non sentirti responsabile di ciò che è successo',
          'Mangia, riposa, muoviti e prenditi momenti di calma',
          'Mantieni una routine normale per te e la famiglia, senza chiederti troppo',
          'Passa tempo con familiari e amici e accetta l\'aiuto della comunità',
        ],
      },
      {
        heading: 'Segnali da non trascurare',
        content: 'Chiedi aiuto se compaiono e durano: difficoltà a dormire o a concentrarsi, confusione, irritabilità, più alcol o farmaci, mal di testa o mal di pancia, tristezza profonda, senso di impotenza o di colpa, paura di stare soli o tra la gente, crisi di pianto. Rivolgiti al medico di famiglia, a uno psicologo o ai servizi della tua zona.',
      },
      {
        heading: 'Per i bambini',
        steps: [
          'I genitori sono quasi sempre il sostegno migliore: stai vicino, abbraccia, rassicura',
          'Ascolta le loro paure e rispondi con parole semplici e vere. I più piccoli possono disegnare o raccontare',
          'Le paure più comuni: che succeda di nuovo, che qualcuno si faccia male, di restare soli',
          'Ripristina appena puoi gli orari di pasti, gioco, sonno e scuola. Dai piccoli compiti utili e lodali',
          'Guarda le notizie insieme e spiega: le immagini ripetute fanno credere che stia succedendo di nuovo',
          'Reazioni possibili: i piccoli possono tornare a bagnare il letto o non volersi staccare; i grandi possono essere arrabbiati o chiudersi',
          'Se il disagio dura, peggiora o blocca la vita normale, chiedi aiuto al pediatra o a uno specialista',
        ],
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'community-resilienza'],
    tasks: [],
  },

  {
    id: 'persone-fragili',
    title: 'Persone fragili e con disabilità',
    icon: 'ph-wheelchair',
    category: 'casa',
    // Fonti: Ready.gov «People with Disabilities»; Comune di Ravenna, Protezione civile (apparecchi elettromedicali)
    source: 'Ready.gov · Protezione civile',
    sources: [
      { n: 'Ready.gov – Persone con disabilità (rete di aiuto, apparecchi a corrente, farmaci in frigo, batterie, carrozzina, trasporto, registro)', u: 'https://www.ready.gov/disability' },
    ],
    readTime: '3 min',
    quickRef: [
      'Crea una rete di persone che possano aiutarti e di\' loro dove sono le tue scorte',
      'Apparecchi medici elettrici: chiedi al medico come tenerli accesi senza corrente. Se servono subito: 118',
      'Elenco farmaci con dosi e allergie, scorta concordata con il medico, borsa frigo per i farmaci da frigo',
      'Batterie di ricambio per apparecchi acustici, carrozzine e altri dispositivi',
      'Chiedi al Comune se esiste un registro delle persone fragili per le emergenze',
    ],
    sections: [
      {
        heading: 'Il piano',
        steps: [
          'Chiediti se potresti cavartela da solo per alcuni giorni senza farmacia né ospedale',
          'Crea una rete di persone che possano aiutarti; tieni i loro numeri su carta e sul telefono e di\' loro dove sono le scorte',
          'Organizza in anticipo un trasporto accessibile per l\'evacuazione',
          'Se fai dialisi o terapie salvavita, conosci almeno due centri che possono seguirti',
          'Apparecchi medici a corrente: chiedi al medico come mantenerli in funzione durante un blackout. Se servono e la corrente manca, chiama il 118 o i servizi sociali',
          'Chiedi al Comune se esiste un registro volontario delle persone con disabilità',
        ],
      },
      {
        heading: 'Farmaci e dispositivi',
        steps: [
          'Chiedi al medico o al farmacista come preparare una scorta di emergenza dei farmaci',
          'Elenco scritto: farmaci, dosi, orari, diagnosi, allergie, dispositivi con modello e numero di serie',
          'Borsa frigo e siberini per i farmaci che vanno tenuti al fresco',
          'Occhiali, apparecchi acustici e batterie di ricambio',
          'Carrozzina elettrica: batteria di riserva carica, kit per forature o camera d\'aria, pompa; se possibile una carrozzina manuale leggera di scorta. Insegna ad altri come usarla e smontarla',
        ],
      },
      {
        heading: 'Comunicare',
        steps: [
          'Persone sorde: carta e penna, una lampada a pile per leggere il labiale o la lingua dei segni al buio',
          'Persone cieche: etichette in Braille o a caratteri grandi sulle scorte',
          'Difficoltà di parola: cartellini plastificati con frasi o immagini se il dispositivo smette di funzionare',
          'Autismo e disabilità intellettive: dispositivi carichi con video e attività, cuffie antirumore, cibi che rassicurano',
          'Demenza: non lasciare mai sola la persona; portate oggetti familiari; in un rifugio scegliete un angolo tranquillo lontano dalle uscite',
        ],
      },
    ],
    relatedGuides: ['farmaci-scorta', 'energia-blackout-protocollo', 'evacuazione-piano'],
    tasks: [],
  },

  /* ══════════════════════ CALORE ══════════════════════ */
  {
    id: 'isolamento-stanza',
    title: 'Isolamento Stanza di Emergenza',
    icon: 'ph-house-line',
    category: 'calore',
    source: 'FEMA · FM 21-76',
    sources: [
      { n: 'Ready.gov – Maltempo invernale (isolare la casa con guarnizioni e sigillanti; rilevatori di CO; mai il forno a gas per scaldare)', u: 'https://www.ready.gov/winter-weather' },
    ],
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
    sources: [
      { n: 'CDC – Monossido di carbonio (mai scaldare con il forno a gas; generatore solo all\'aperto; sintomi; rilevatori a batteria)', u: 'https://www.cdc.gov/carbon-monoxide/about/index.html' },
      { n: 'Ready.gov – Maltempo invernale (rilevatori di CO su ogni piano; mai fornelli o forno a gas per scaldare)', u: 'https://www.ready.gov/winter-weather' },
    ],
    readTime: '4 min',
    quickRef: [
      'Stufa legna/pellet: buona soluzione, ma produce anche lei monossido di carbonio (CO): canna fumaria pulita e controlli del tecnico',
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
          'Testa: copri sempre la testa con un cappello di lana',
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
    sources: [
      { n: 'CDC – Prevenire i problemi del freddo (segni di ipotermia, togliere i vestiti bagnati, bevande calde senza alcol, RCP; sotto 35 °C è emergenza)', u: 'https://www.cdc.gov/winter-weather/prevention/index.html' },
    ],
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
          'Rimuovi TUTTI gli indumenti bagnati — un tessuto bagnato ti raffredda molto più in fretta del freddo secco',
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
          'Coperta termica mylar: riflette parte del calore corporeo',
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
    sources: [
      { n: 'Resuscitation Council UK – Linee guida 2025 sul supporto di base delle funzioni vitali (compressioni 5–6 cm, 100–120 al minuto, 30:2, solo compressioni se non addestrati)', u: 'https://www.resus.org.uk/professional-library/2025-resuscitation-guidelines/adult-basic-life-support-guidelines' },
    ],
    readTime: '5 min',
    quickRef: [
      'ABCDE: Airway (vie aeree) → Breathing → Circulation → Disability → Exposure',
      'Arresto cardiaco: 30 compressioni + 2 insufflazioni — ritmo "Stayin\' Alive" (100–120/min)',
      'Emorragia: comprimi DIRETTAMENTE e senza interruzioni, senza alzare per controllare. Se non si ferma: laccio emostatico',
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
          'Se non sei addestrato o non riesci a fare le insufflazioni: fai solo compressioni, senza fermarti',
        ],
      },
      {
        heading: 'Gestione emorragie',
        steps: [
          'Indossa guanti prima di toccare sangue altrui (kit medico)',
          'Comprimi DIRETTAMENTE sulla ferita con garza o tessuto pulito',
          'Premi forte e senza interruzioni, senza alzare per controllare',
          'Se il sangue attraversa la garza: AGGIUNGI altra garza sopra, non togliere quella sotto',
          'Emorragia grave a un arto che non si ferma: laccio emostatico il prima possibile, 5–7 cm sopra la ferita e non sopra un\'articolazione, stretto finché il sangue si ferma',
          'Scrivi l\'ora di applicazione del laccio — comunicala al 118',
          'Non rimuovere MAI il laccio — solo personale medico',
          'Ferita aperta al torace: lasciala scoperta, non coprirla e non sigillarla',
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
        content: 'La data di scadenza garantisce potenza e sicurezza certificate dal produttore. Dopo la scadenza il produttore non garantisce più efficacia e sicurezza: chiedi sempre il parere di un medico o di un farmacista prima di usare un farmaco scaduto. Non usare mai scaduti, in particolare: insulina, nitrati per il cuore, adrenalina (EpiPen), antibiotici.',
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
    // Fonti: Ready.gov «Make a Plan» ed «Evacuation»; Alertswiss «Piano d'emergenza»; FCC/FEMA (SMS)
    source: 'Ready.gov · Alertswiss · FCC/FEMA',
    sources: [
      { n: 'Ready.gov – Fai un piano (domande su allerte, riparo, evacuazione; luogo di ritrovo; contatti; provare il piano)', u: 'https://www.ready.gov/plan' },
      { n: 'FCC/FEMA – Consigli per comunicare in emergenza (SMS quando la chiamata non passa, chiamate brevi)', u: 'https://docs.fcc.gov/public/attachments/DOC-309723A1.pdf' },
    ],
    readTime: '3 min',
    quickRef: [
      'Decidete prima come vi contattate e dove vi ritrovate se siete separati',
      'Almeno due punti di ritrovo: uno vicino a casa e uno se casa non è raggiungibile',
      'Numeri importanti scritti su carta, una copia per ognuno',
      'Un contatto che vive lontano, che tutti possono chiamare per dare notizie',
      'Provate il piano insieme e aggiornatelo quando cambia qualcosa',
    ],
    sections: [
      {
        heading: 'Le domande da farsi',
        steps: [
          'Come riceviamo allerte e avvisi?',
          'Dove ci ripariamo se dobbiamo restare in casa?',
          'Da che strada andiamo via se dobbiamo evacuare?',
          'Come ci contattiamo e dove ci ritroviamo se siamo separati?',
          'Lo zaino e le scorte sono da aggiornare?',
          'Cosa serve a ognuno: età, farmaci, diete, lingue, animali?',
        ],
      },
      {
        heading: 'Lista contatti su carta',
        steps: [
          'Numeri di tutti i familiari (cellulare e fisso)',
          'Chi tiene i tuoi figli, la scuola, il lavoro, i vicini, le persone che assisti',
          'Medico di famiglia e farmacia',
          'Un contatto che vive lontano dalla tua zona',
          'Numero unico di emergenza 112',
          'Una copia per ogni persona, al riparo dall\'acqua',
        ],
      },
      {
        heading: 'Ritrovarsi e comunicare',
        steps: [
          'Un punto di ritrovo familiare e facile da trovare vicino a casa, e un secondo se casa non è raggiungibile',
          'Se una chiamata non passa, prova con un SMS',
          'Notizie e istruzioni: ascolta la radio',
          'Se usate walkie-talkie PMR446, concordate prima il canale (vedi la guida PMR446)',
          'Se vi spostate, avvisate il contatto lontano di dove andate',
        ],
      },
      {
        heading: 'Provare il piano',
        steps: [
          'Scrivete il piano e tenetelo con i documenti',
          'Provatelo con tutta la famiglia',
          'Aggiornatelo quando cambiano persone, numeri o abitudini',
        ],
      },
    ],
    relatedGuides: ['comm-pmr446', 'comm-radio-canali', 'senza-internet'],
    tasks: ['co03'],
  },

  {
    id: 'senza-internet',
    title: 'Senza internet e senza telefono',
    icon: 'ph-wifi-slash',
    category: 'comm',
    // Fonti: Alertswiss «Piano d'emergenza»; Commissione europea, linee guida 72 ore (3/11/2026);
    // FCC/FEMA (SMS quando la chiamata non passa); Comune di Ravenna, Protezione civile; Energy.gov
    source: 'Alertswiss · Commissione UE · FCC/FEMA · Protezione civile',
    sources: [
      { n: 'Commissione europea – Linee guida sull\'autonomia di almeno 72 ore (radio a batterie, contanti, piano di famiglia, informazioni quando i servizi non funzionano)', u: 'https://civil-protection-knowledge-network.europa.eu/system/files/2026-11/sufficiency-of-at-least-72-hours-under-the-eu-preparedness-union-strategy.pdf' },
      { n: 'FCC/FEMA – Consigli per comunicare in emergenza (SMS, chiamate brevi, rete congestionata)', u: 'https://docs.fcc.gov/public/attachments/DOC-309723A1.pdf' },
      { n: 'Protezione Civile – Vademecum «Protezione civile in famiglia» (radio a pile, telefono solo per emergenza)', u: 'https://www.protezionecivile.gov.it/static/40f6aa132a339e223934865d7a37341d/vademecum_pc_ita.pdf' },
    ],
    readTime: '3 min',
    quickRef: [
      'Le notizie e le istruzioni delle autorità arrivano via radio: tieni una radio a pile (FM, meglio anche DAB+)',
      'Scrivi su carta i numeri di famiglia, scuola, lavoro, vicini e medico: conosci a memoria i loro numeri?',
      'Concorda almeno due punti di ritrovo: uno vicino a casa e uno per quando casa non è raggiungibile',
      'Contanti con banconote piccole e monete: i pagamenti elettronici possono bloccarsi',
      'Rete congestionata: chiamate brevi e solo se serve. Un SMS spesso passa quando la chiamata non passa',
    ],
    sections: [
      {
        heading: 'Prepararsi finché funziona tutto',
        steps: [
          'Scrivi su carta i numeri di familiari, di chi tiene i tuoi figli, della scuola, del lavoro, dei vicini e delle persone che assisti. Tienine una copia nello zaino di emergenza',
          'Concorda con la famiglia almeno due punti di ritrovo: uno vicino a casa e uno da usare se casa non è raggiungibile',
          'Decidi per ogni familiare la strada per tornare a casa, evitando le strade più trafficate. Accordati con colleghi e vicini per condividere l\'auto',
          'Scegli uno o più posti dove stare per qualche giorno in caso di evacuazione (parenti, amici): né troppo vicini né troppo lontani da casa',
          'Tieni in casa una radio a pile con pile di riserva e un po\' di contanti in banconote piccole e monete',
          'Scarica ora sul telefono questa app, le mappe della tua zona (sezione Emergenza → Mappa) e i documenti che ti servono: senza rete non potrai farlo',
        ],
      },
      {
        heading: 'Dove trovare le notizie',
        content: 'Quando la rete del cellulare è sovraccarica o ferma, le autorità danno le istruzioni anche via radio. Ascolta una radio a pile o a manovella, oppure l\'autoradio. Le notizie ufficiali sul tuo Comune le danno il sindaco e la Protezione civile: segui le loro indicazioni e diffida delle voci non confermate.',
      },
      {
        heading: 'Comunicare con la rete congestionata',
        steps: [
          'Non chiamare per chiedere notizie: lascia libere le linee per le emergenze',
          'Se una chiamata non passa, prova con un SMS: spesso arriva anche quando la voce non passa',
          'Fai chiamate brevi e di\' solo le informazioni essenziali',
          'Se i telefoni non funzionano, raggiungi il punto di ritrovo concordato',
          'Per le emergenze chiama sempre il 112',
        ],
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'comm-radio-canali', 'energia-ricarica', 'energia-blackout-protocollo'],
    tasks: ['co03'],
  },

  {
    id: 'radio-emergenza',
    title: 'Radio di emergenza: onde corte e radio a galena',
    icon: 'ph-radio',
    category: 'comm',
    // Fonti: Cornell University con Tompkins County Amateur Radio Club «Make your own crystal radio»;
    // University of Iowa, Physics «Build a simple crystal radio set»; Alertswiss (radio FM e DAB+).
    // Spegnimento onde medie RAI: 2022.
    source: 'Cornell University · Tompkins County Amateur Radio Club · University of Iowa · Alertswiss',
    readTime: '4 min',
    quickRef: [
      'In un\'emergenza grave non sai quali emittenti resteranno attive: una radio che riceve FM, DAB+, onde medie e onde corte ti dà più possibilità',
      'Onde corte: si ricevono anche da molto lontano, utili se le emittenti vicine tacciono',
      'Radio a galena: funziona senza pile né corrente, prende energia dall\'onda radio. Riceve solo onde medie (AM)',
      'Antenna: MAI vicino a linee elettriche. Mai collegarsi a fili elettrici o tubi del gas',
      'Antenna esterna: staccala quando c\'è rischio di fulmini',
    ],
    sections: [
      {
        heading: 'Quale radio tenere',
        content: 'Le autorità danno le istruzioni anche via radio, soprattutto se la rete del cellulare è ferma. Tieni una radio a pile o a manovella che riceva FM e DAB+. Se puoi, scegline una che riceva anche onde medie e onde corte: in Italia la RAI ha spento le onde medie nel 2022, ma in un\'emergenza grave non si sa quali emittenti, vicine o lontane, continueranno a trasmettere. Le onde corte viaggiano molto lontano, soprattutto di notte, e permettono di ascoltare emittenti di altri paesi.',
      },
      {
        heading: 'Come funziona la radio a galena',
        content: 'È una radio che non ha bisogno di pile: usa l\'energia dell\'onda radio stessa. Ha quattro parti: ANTENNA e TERRA (due conduttori grandi, per esempio un filo lungo e un tubo metallico dell\'acqua fredda) che catturano l\'onda; il CIRCUITO DI SINTONIA (una bobina di filo e un condensatore variabile) che sceglie la stazione; il RIVELATORE (un diodo al germanio, oppure un cristallo di galena) che estrae la voce o la musica; l\'AURICOLARE piezoelettrico (ad alta impedenza) che la trasforma in suono. Riceve solo le onde medie (AM) e sente poco: serve una stazione abbastanza vicina o potente.',
      },
      {
        heading: 'Costruirla: materiale',
        steps: [
          'Filo di rame isolato per antenna e collegamenti, il più lungo possibile per l\'antenna',
          'Una bobina: filo di rame avvolto su un tubo di cartone o plastica, con alcune prese intermedie per provare la sintonia',
          'Un condensatore variabile (si trova nelle vecchie radio o nei negozi di elettronica)',
          'Un diodo al germanio',
          'Un auricolare piezoelettrico (cristallo). Le cuffie normali non funzionano bene',
          'Morsetti a coccodrillo per collegare e cambiare le prese della bobina',
          'Gli schemi completi sono nelle guide delle università (Cornell, University of Iowa): procurale e stampale prima',
        ],
      },
      {
        heading: 'Antenna e terra: sicurezza',
        steps: [
          'MAI lanciare o stendere l\'antenna sopra o vicino a linee elettriche: è molto pericoloso',
          'Non collegarti mai a fili elettrici sotto tensione né ai tubi del gas',
          'Terra: un tubo metallico dell\'acqua fredda (non di plastica) o un rubinetto da giardino in metallo',
          'Antenna: un filo steso il più lungo possibile, sollevato da terra all\'aperto, oppure grandi parti metalliche (grondaia, telaio metallico, condotto dell\'aria)',
          'Un\'antenna esterna va staccata quando non la usi e quando c\'è rischio di temporale. Un\'antenna fissa richiede un parafulmine installato da un elettricista',
          'Prova direzioni e collegamenti diversi: la ricezione cambia molto',
        ],
      },
    ],
    relatedGuides: ['comm-radio-canali', 'senza-internet', 'energia-ricarica'],
    tasks: [],
  },

  {
    id: 'comm-pmr446',
    title: 'Walkie-Talkie PMR446 — Guida',
    icon: 'ph-broadcast',
    category: 'comm',
    source: 'ETSI · Protezione Civile',
    sources: [
      { n: 'CEPT/ECC – Decisione ECC/DEC/(15)05 sul PMR446 (banda armonizzata 446,0–446,2 MHz, esenzione dalla licenza individuale)', u: 'https://docdb.cept.org/document/448' },
    ],
    readTime: '3 min',
    quickRef: [
      'PMR446: libero da licenza in Europa, 16 canali analogici dal 2016 (i modelli più vecchi ne hanno 8), max 0,5 W',
      'Canale 8: usato per abitudine come canale di chiamata d\'emergenza tra utenti — non è un canale ufficiale della Protezione Civile',
      'Portata reale: 0.5–2 km in città, 2–5 km in pianura aperta, 500m in edifici',
      'Codici CTCSS/DCS (sub-toni): filtrano le interferenze — usa lo stesso codice in famiglia',
      'Batterie: preferisci AA ricaricabili (NiMH 2500mAh) — ricaricabili con pannello solare',
    ],
    sections: [
      {
        heading: 'Frequenze e canali',
        content: 'I walkie-talkie PMR446 operano nella banda UHF 446,0–446,2 MHz (decisione europea CEPT ECC/DEC/(15)05). Canali analogici: 16, da 446,00625 a 446,19375 MHz (passo 12,5 kHz); gli apparecchi più vecchi usano solo i primi 8. Canali digitali (dPMR446): 32. Due apparecchi si sentono solo se usano lo stesso tipo (analogico o digitale), lo stesso canale e lo stesso codice. CANALE 8 (446,09375 MHz): per abitudine alcuni utenti lo usano per la prima chiamata, ma non è un canale ufficiale di emergenza. Una volta stabilito il contatto, spostatevi su un canale meno frequentato per comunicazioni private.',
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
          'Posizione elevata: da un punto alto (collina, piano alto) la portata di solito aumenta',
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
      'Notizie: RAI Radio 1 e radio locali. Gli avvisi ufficiali arrivano da IT-alert, Protezione civile e Comune',
      'RAI Radio 1: la frequenza FM cambia da zona a zona — cerca quella della tua zona e scrivila su carta',
      'PMR446 canale 8: usato per abitudine, non è un canale ufficiale di emergenza',
      'Radio portatile a manovella: NON dipende da corrente, funziona sempre',
      'Onde medie: la RAI le ha spente nel settembre 2022 — per la RAI usa l\'FM (o il digitale DAB+ se la radio lo riceve)',
    ],
    sections: [
      {
        heading: 'Frequenze di emergenza per zona',
        content: 'RAI RADIO 1: le frequenze FM cambiano da zona a zona. Cerca le frequenze di RAI Radio 1 della tua città sul sito della Rai, scrivile su carta e tienile vicino alla radio. RADIO LOCALI: le emittenti locali spesso trasmettono aggiornamenti di emergenza più puntuali di quelle nazionali.',
      },
      {
        heading: 'Cosa ascoltare e quando',
        steps: [
          'Blackout: accendi subito la radio a pile o a manovella per avere notizie',
          'Emergenza regionale: preferisci emittenti locali — informazioni più aggiornate e geograficamente precise',
          'Notizie nazionali: RAI Radio 1 in FM (le onde medie RAI sono spente dal settembre 2022)',
          'In zone remote: onde corte (SW) per notizie internazionali — utile in crisi prolungate',
          'Tieni un\'agenda con le frequenze scritte — non fare affidamento sulla memoria',
        ],
      },
      {
        heading: 'Tipi di radio — quale scegliere',
        content: 'RADIO A MANOVELLA (consigliata): AM/FM/SW + ricarica a dinamo + solare + USB. Indipendente da corrente e batterie. RADIO PORTATILE FM: economica, ottima ricezione FM. Usa batterie AA. RADIO VHF/UHF (scanner): riceve anche frequenze dei servizi di emergenza. Richiede programmazione. SMARTPHONE CON FM: molti smartphone hanno chip FM — attiva in caso di emergenza, consuma meno batteria dello streaming.',
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'comm-pmr446'],
    tasks: ['co01'],
  },

  /* ══════════════════════ MOBILITÀ ══════════════════════ */
  {
    id: 'gobag-checklist',
    title: 'Zaino d\'emergenza: lista completa',
    icon: 'ph-backpack',
    category: 'mobilita',
    // Fonti: Ready.gov «Build a Kit»; Commissione europea, linee guida 72 ore (3/11/2026); Alertswiss «Piano d'emergenza»
    source: 'Ready.gov · Commissione UE · Alertswiss',
    sources: [
      { n: 'Ready.gov – Prepara un kit (fischietto, mascherina, teli e nastro, pinza per le utenze, radio, torcia, primo soccorso, documenti, sacco a pelo, kit al lavoro e in auto)', u: 'https://www.ready.gov/kit' },
      { n: 'Commissione europea – Linee guida sull\'autonomia di almeno 72 ore (zaino di evacuazione, contanti, radio, power bank)', u: 'https://civil-protection-knowledge-network.europa.eu/system/files/2026-11/sufficiency-of-at-least-72-hours-under-the-eu-preparedness-union-strategy.pdf' },
    ],
    readTime: '3 min',
    quickRef: [
      'Uno zaino pronto da prendere al volo, in un posto che tutta la famiglia conosce',
      'Dentro: acqua, cibo che non va cucinato, farmaci, documenti, contanti, radio, torcia e pile',
      'Documenti importanti in busta impermeabile o salvati in digitale',
      'Ogni anno rivedi lo zaino e cambia ciò che scade',
      'Tieni un kit anche in auto, e al lavoro uno per almeno 24 ore',
    ],
    sections: [
      {
        heading: 'Documenti e contanti',
        steps: [
          'Documenti d\'identità, polizze assicurative e documenti della banca, in busta impermeabile o salvati in digitale',
          'Contanti in banconote di piccolo taglio e monete: i pagamenti elettronici possono bloccarsi',
          'Elenco su carta dei numeri di famiglia, scuola, lavoro, vicini e medico',
          'Carta e matita',
        ],
      },
      {
        heading: 'Acqua e cibo',
        steps: [
          'Acqua: nello zaino portane quanta riesci a trasportare; per le scorte di casa vedi la guida Stoccaggio acqua',
          'Cibo che non si guasta e che si mangia senza cuocerlo',
          'Apriscatole manuale',
          'Per i neonati: latte in polvere, biberon, pannolini, salviette',
          'Per gli animali: cibo e acqua in più',
        ],
      },
      {
        heading: 'Attrezzatura',
        steps: [
          'Radio a pile o a manovella, torcia e pile di riserva',
          'Telefono con caricatore e batteria di riserva',
          'Kit di primo soccorso',
          'Fischietto per chiedere aiuto e mascherina antipolvere',
          'Teli di plastica, forbici e nastro adesivo; chiave o pinza per chiudere gas e acqua',
          'Salviette umide, sacchi della spazzatura e fascette per l\'igiene; cartine della zona; fiammiferi in contenitore impermeabile',
        ],
      },
      {
        heading: 'Bisogni personali',
        steps: [
          'Farmaci con ricetta: in emergenza può essere difficile averne altri',
          'Farmaci da banco che usi (antidolorifici, antidiarroici, antiacidi) e occhiali o lenti',
          'Sapone, gel igienizzante, salviette disinfettanti, prodotti per l\'igiene femminile e personale',
          'Sacco a pelo o coperta calda per ogni persona',
          'Un cambio completo di vestiti adatti al clima e scarpe robuste',
          'Libri o giochi per i bambini',
        ],
      },
      {
        heading: 'Tenerlo pronto',
        steps: [
          'Tienilo in un posto da cui si prende al volo e che tutti in famiglia conoscono',
          'Cibo in scatola in un luogo fresco e asciutto; cibo in confezioni di cartone dentro contenitori chiusi di plastica o metallo',
          'Sostituisci ciò che scade',
          'Ogni anno rivedi cosa serve alla tua famiglia e aggiorna lo zaino',
          'Al lavoro: un kit per restare almeno 24 ore, con cibo, acqua, farmaci e scarpe comode. In auto: un kit di emergenza',
        ],
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
    sources: [
      { n: 'Organic Maps – sito ufficiale (mappe offline con dati OpenStreetMap, senza registrazione)', u: 'https://organicmaps.app/' },
    ],
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
    // Fonti: Ready.gov «Evacuation»; Protezione civile «Io non rischio» (piano comunale, istruzioni delle autorità)
    source: 'Ready.gov · Protezione civile',
    sources: [
      { n: 'Ready.gov – Evacuazione (seguire le autorità, partire presto, più destinazioni, mezzo serbatoio, niente scorciatoie, cavi a terra)', u: 'https://www.ready.gov/evacuation' },
    ],
    readTime: '3 min',
    quickRef: [
      'Segui sempre le istruzioni delle autorità (sindaco, Protezione civile): se dicono di andare via, vai',
      'Parti presto, per non restare bloccato dal maltempo',
      'Scegli prima più posti dove andare, in direzioni diverse',
      'Tieni sempre almeno mezzo serbatoio; se l\'evacuazione è probabile, fai il pieno',
      'Segui i percorsi indicati: niente scorciatoie e mai in strade allagate',
    ],
    sections: [
      {
        heading: 'Prepararsi',
        steps: [
          'Informati sui rischi della tua zona e sul piano di protezione civile del tuo Comune',
          'Scrivi come partirai e dove andrai se ti dicono di evacuare',
          'Scegli più posti in direzioni diverse: parenti, amici, un albergo; se non hai alternative, le strutture indicate dal Comune',
          'Conosci percorsi alternativi per uscire dalla zona, anche a piedi',
          'Trova prima un posto che accetti i tuoi animali',
          'Se non hai l\'auto, accordati prima con familiari, amici o con il Comune per il trasporto',
        ],
      },
      {
        heading: 'Prima di uscire di casa',
        steps: [
          'Chiudi a chiave porte e finestre',
          'Stacca gli apparecchi elettrici (radio, TV, piccoli elettrodomestici); lascia accesi frigo e freezer, salvo rischio di allagamento',
          'Se la casa è danneggiata e te lo dicono, chiudi acqua, gas e luce',
          'Lascia un biglietto con l\'ora in cui sei partito e dove vai',
          'Chiedi ai vicini se hanno bisogno di un passaggio',
          'Prendi lo zaino d\'emergenza e una radio a pile; metti scarpe robuste, pantaloni e maniche lunghe',
        ],
      },
      {
        heading: 'Durante il viaggio',
        steps: [
          'Segui i percorsi raccomandati: niente scorciatoie, possono essere bloccate',
          'Attenzione a strade franate, ponti danneggiati e cavi elettrici a terra',
          'Non entrare mai con l\'auto in zone allagate',
          'Se possibile una sola auto per famiglia, per non intasare le strade',
          'Ascolta la radio per le istruzioni e avvisa un contatto lontano di dove stai andando',
        ],
      },
      {
        heading: 'Dopo',
        steps: [
          'Torna a casa solo quando le autorità dicono che è sicuro',
          'Stai lontano dai cavi elettrici caduti, che possono essere sotto tensione, e segnalali',
          'Usa il generatore solo all\'aperto, mai in casa o in garage',
          'Avvisa familiari e amici quando parti e quando arrivi',
        ],
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
    sources: [
      { n: 'Ready.gov – Sicurezza informatica (aggiornamenti, password e verifica in due passaggi, backup cifrati, controllare gli estratti conto, scollegare il dispositivo)', u: 'https://www.ready.gov/cybersecurity' },
      { n: 'Polizia Postale – Commissariato di P.S. online (segnalazioni e denunce di reati informatici, phishing)', u: 'https://www.commissariatodips.it' },
    ],
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
    sources: [
      { n: 'Protezione Civile – Rischio radiologico e nucleare: cosa sapere e cosa fare (riparo al chiuso, finestre e aerazione spente, seminterrato, vestiti in sacchetto, iodoprofilassi solo su indicazione)', u: 'https://www.protezionecivile.gov.it/static/80faded4b853f0b5254a184defc3ebc2/nucleare-sintesi.pdf' },
      { n: 'Ready.gov – Esplosione nucleare (resta dentro, 24 ore, togliere gli abiti esterni, lavarsi, animali)', u: 'https://www.ready.gov/nuclear-explosion' },
    ],
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
          'Resta giù finché non è passata l\'onda d\'urto, che arriva dopo il lampo',
          'Poi entra subito nell\'edificio più vicino e resta lontano da finestre',
        ],
      },
      {
        heading: 'Restare al chiuso',
        content: 'Chiudi porte e finestre, spegni ventilazione e condizionatori. Più muri e più massa ci sono tra te e l\'esterno, meglio è. Resta dentro finché le autorità non dicono di uscire: la Protezione Civile indica, in modo orientativo, fino a 48 ore (Ready.gov indica almeno 24 ore). Tieni la radio accesa. Il pericolo maggiore è nelle prime ore e cala rapidamente.',
      },
      {
        heading: 'Decontaminazione',
        steps: [
          'Togli i vestiti esterni senza scuoterli e mettili in un sacchetto chiuso',
          'Lavati con acqua e sapone, senza strofinare forte, no balsamo',
          'Se non puoi fare la doccia, lava comunque con acqua e sapone occhi, orecchie e bocca: un semplice getto d\'acqua sul corpo non basta',
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
    // Fonti: Ready.gov «Home Fires» e «Power Outages»; CPSC «Portable Generator Safety Alert»
    // (carburanti); FEMA «Use generators safely» (vapori)
    source: 'Ready.gov · CPSC · FEMA',
    sources: [
      { n: 'Ready.gov – Incendi domestici (rilevatori di fumo su ogni piano, estintore in cucina, candele e stufe lontane dai materiali infiammabili, piano di fuga, porta calda)', u: 'https://www.ready.gov/home-fires' },
      { n: 'CDC – Monossido di carbonio (generatore solo all\'aperto, a più di 20 piedi da finestre e porte)', u: 'https://www.cdc.gov/carbon-monoxide/about/index.html' },
    ],
    readTime: '3 min',
    quickRef: [
      'Rilevatori di fumo su ogni piano, cantina compresa. Cambia le pile due volte l\'anno (salvo pile al litio da 10 anni)',
      'Estintore in cucina, a portata di mano quando cucini',
      'Candele: almeno 30 cm da ciò che può bruciare, mai incustodite. Meglio luci senza fiamma',
      'Stufe portatili: niente di infiammabile entro circa 1 metro',
      'Carburanti fuori dalle stanze in cui vivi, in taniche di sicurezza etichettate e non di vetro',
    ],
    sections: [
      {
        heading: 'Luce senza corrente',
        steps: [
          'Una torcia per ogni persona della famiglia, con pile di riserva',
          'Preferisci luci senza fiamma alle candele',
          'Se usi candele: almeno 30 cm da tende, carta e tutto ciò che può bruciare, e mai incustodite',
        ],
      },
      {
        heading: 'Prevenire gli incendi',
        steps: [
          'Rilevatori di fumo su ogni piano, cantina compresa. Cambia le pile due volte l\'anno, salvo pile al litio da 10 anni; sostituisci il rilevatore ogni 10 anni o come dice il produttore',
          'Non staccare mai il rilevatore mentre cucini',
          'Stufe portatili: tieni lontano almeno 1 metro tutto ciò che può bruciare. Scegli modelli con termostato e spegnimento automatico se si ribaltano',
          'Quando friggi o cucini alla griglia resta in cucina; se esci anche per poco, spegni',
          'Tieni un estintore in cucina e chiedi ai Vigili del fuoco come usarlo e mantenerlo',
          'Generatore: solo all\'aperto, ad almeno 6 metri da finestre, porte e garage (vedi la guida Generatore)',
        ],
      },
      {
        heading: 'Se scoppia un incendio',
        steps: [
          'Esci subito: stai basso e muoviti sotto il fumo verso l\'uscita',
          'Tocca la porta prima di aprirla: se è calda o passa fumo, tienila chiusa e usa l\'altra uscita',
          'Se non puoi uscire: chiudi la porta, tappa fessure e prese d\'aria con stoffa o nastro, chiedi aiuto dalla finestra con un panno chiaro o una torcia',
          'Chiama il 115 o il 112 da un posto sicuro e di\' dove sei',
          'Se ti prendono fuoco i vestiti: fermati, buttati a terra e rotola',
          'Prepara prima un piano di fuga con due uscite per ogni stanza e provalo con la famiglia due volte l\'anno',
        ],
      },
      {
        heading: 'Carburanti e combustibili',
        steps: [
          'Benzina, GPL e kerosene vanno tenuti fuori dalle stanze in cui vivi, in contenitori di sicurezza etichettati e non di vetro',
          'Non tenerli vicino ad apparecchi a fiamma (caldaia, scaldabagno a gas): i vapori scendono a terra e una fiamma o una scintilla può accenderli',
          'Per le quantità che puoi tenere in casa o in garage chiedi ai Vigili del fuoco o al Comune: ci sono regole',
          'Tutti i combustibili lontano dai bambini e con l\'etichetta chiara',
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
    // Fonti: Ready.gov «Make a Plan» (rete di supporto), «People with Disabilities»; Alertswiss (accordi con vicini);
    // Protezione civile (volontariato organizzato, informarsi presso il Comune)
    source: 'Ready.gov · Alertswiss · Protezione civile',
    readTime: '2 min',
    quickRef: [
      'Conosci i vicini: in emergenza possono aiutarti e tu puoi aiutare loro',
      'Sapere prima chi ha bisogno di aiuto: anziani soli, persone con disabilità, famiglie con neonati',
      'Accordi semplici: chi controlla chi, chi può dare un passaggio',
      'Chiedi al Comune quali gruppi di volontariato di protezione civile ci sono nella tua zona',
    ],
    sections: [
      {
        heading: 'Costruire la rete locale',
        steps: [
          'Presentati ai vicini e scambiatevi i numeri di telefono',
          'Parlate di come potete aiutarvi: comunicazioni, bambini, animali, spostamenti',
          'Sappiate chi ha bisogno di più aiuto: anziani soli, persone con disabilità, famiglie con neonati',
          'Accordatevi per condividere l\'auto in caso di evacuazione',
          'Chi ha bisogno di aiuto può dire a una persona fidata dove sono le sue scorte',
        ],
      },
      {
        heading: 'Volontariato di Protezione Civile',
        content: 'In Italia la protezione civile si basa anche sulle organizzazioni di volontariato. Per sapere quali operano nella tua zona e come partecipare, chiedi al tuo Comune o consulta il sito del Dipartimento della Protezione civile.',
      },
    ],
    relatedGuides: ['comm-piano-famiglia', 'persone-fragili'],
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
      'Bacche: non mangiare mai bacche che non riconosci con certezza, di nessun colore',
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
      'Emorragia grave a un arto: laccio emostatico il prima possibile — può essere molto doloroso',
      'Ipotermia: rimuovi abiti bagnati, isola dal suolo, riscalda lentamente dal nucleo (NO mani/piedi)',
      'Colpo di calore: abbassa temperatura immediatamente — bagna e ventila — è più urgente di una frattura',
      'Frattura: immobilizza com\'è, non riposizionare — le eccezioni sono solo se perdita di circolo distale',
    ],
    sections: [
      {
        heading: 'Emorragia — controllo rapido',
        steps: [
          'PRESSIONE DIRETTA: premi forte con entrambe le mani, senza interruzioni e senza sollevare per guardare',
          'Se ancora sanguina: aggiungi altra garza sopra (non rimuovere la prima) — pressione continua',
          'LACCIO EMOSTATICO (arti): applica 5–7cm sopra la ferita, stringi fino a cessazione del sanguinamento, segna l\'ora — non allentarlo e non toglierlo: lo fa solo il personale sanitario',
          'GARZA EMOSTATICA (ferite profonde/inguine/ascella): comprimi la garza nella ferita con forza — Combat Gauze o QuikClot',
          'FERITE AL TORACE: lascia la ferita scoperta, non coprirla e non sigillarla (ERC 2021)',
          'SHOCK: sdraia la persona sulla schiena. Se non ci sono traumi, in attesa dei soccorsi puoi sollevarle le gambe (ERC 2021)',
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
          'CONTROLLO: il liquido deve sempre coprire le verdure — se affiora muffa in superficie, scarta tutto (come indicato anche nella guida «Conservazione Alimenti senza Frigo»)',
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
      'Segnale internazionale di soccorso: 3 segnali a intervalli regolari (3 fuochi, SOS). In montagna col fischietto: 6 segnali in 10 secondi, pausa di 1 minuto, ripeti (CAI/CNSAS)',
      'Specchio di segnalazione: visibile fino a 16km — più efficace di qualsiasi altro segnale',
      'Fumo di giorno: pneumatici, gomma, plastica fanno fumo NERO visibile; foglie verdi → fumo BIANCO',
      'Mantieni sempre una posizione nota — non vagare senza segnare il percorso',
      'Se c\'è campo: chiama prima il 112 (dove non esiste il 112, il 118). CNSAS per la montagna; VHF canale 16 in mare; PLB/EPIRB per localizzazione satellitare',
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
          'FISCHIETTO (richiesta di soccorso in montagna, CAI/CNSAS): 6 fischi in 10 secondi, poi pausa di 1 minuto, e ripeti',
          'Fischietto Fox 40 o Storm (no palla interna — funziona anche bagnato)',
          'RISPOSTA dei soccorritori: 3 segnali al minuto. Se senti la risposta, continua a segnalare e resta fermo',
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
  { id: 'casa',     label: 'Casa e persone', icon: 'ph-house-line'    },
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
// Guide tolte dalla lista dopo verifica sulle fonti (v90): acqua-purificazione (CDC, EPA, Eawag),
// energia-generatore (Ready.gov, CDC), nucleare-radiologico (Ready.gov, CDC, Protezione civile).
const GUIDE_CAUTION = {
  'cibo-senza-frigo-gas':          'pratica',   // fonti ONG e siti non ufficiali
  'radio-emergenza':               'pratica',   // fonti universitarie e radioamatori, non enti pubblici
  'energia-solare-piccola':        'pratica',   // parte delle indicazioni dai produttori
  'acqua-raccolta-pioggia':        'salute',
  'acqua-fonti-alternative':       'salute',
  'cibo-conservazione':            'salute',
  'riscaldamento-alternativo':     'salute',
  'ipotermia-prevenzione':         'salute',
  'kit-medico':                    'salute',
  'primo-soccorso':                'salute',
  'farmaci-scorta':                'alto',
  'survival-acqua-natura':         'salute',
  'survival-piante':               'alto',
  'survival-trappole':             'salute',
  'survival-primo-soccorso-campo': 'alto',
  'survival-conservazione-cibo':   'alto',
  'cibo-cottura-campo':            'pratica',
  'isolamento-stanza':             'pratica',
  'comm-pmr446':                   'pratica',
  'comm-radio-canali':             'pratica',
  'conflitto-rifugio':             'pratica',
  'survival-fuoco':                'pratica',
  'survival-riparo':               'pratica',
};

// 'alto' = guide in cui un errore può avvelenare o ferire gravemente: avviso rafforzato (v121).
const GUIDE_CAUTION_TEXT = {
  alto:    'ATTENZIONE, RISCHIO ALTO. Un errore in questa guida può causare avvelenamento, danni gravi o morte. Le indicazioni NON sono ancora verificate da una fonte ufficiale e un testo o un disegno non bastano per riconoscere con certezza una pianta, un fungo o un farmaco. Se hai anche solo un dubbio, NON mangiare, NON usare e NON dare a nessuno ciò che non conosci con certezza assoluta. Non usare questa guida come unica fonte. Se qualcuno sta male o pensi di aver ingerito qualcosa di tossico, chiama subito il 112 o il Centro antiveleni, senza aspettare che compaiano i sintomi.',
  salute:  'Guida a rischio: contiene indicazioni su salute, acqua, cibo o farmaci non ancora verificate da una fonte sanitaria ufficiale. Se applicate male possono essere pericolose. Usala con cautela, solo come orientamento. In caso di dubbio chiama il 112 o il tuo medico e segui le autorità sanitarie.',
  pratica: 'Guida non verificata: le indicazioni non sono ancora state controllate su fonti ufficiali italiane e alcune pratiche possono essere pericolose. Usala con cautela, solo come orientamento, e segui sempre le istruzioni delle autorità.',
};

// Illustrazioni che NON vengono mostrate (revisione del 16/11/2026): contengono numeri,
// dosi o procedure diverse dalle guide verificate o senza fonte. I file restano nella
// cartella; motivi uno per uno in note-interne/revisione-illustrazioni-2026-11-16.md.
// Per rimostrarne una, toglierla da qui dopo averla rifatta.
const GUIDE_IMG_HIDDEN = new Set([
  'acqua-fonti-alternative--corsi-d-acqua-superficiali',
  'acqua-fonti-alternative--fonti-non-convenzionali',
  'acqua-fonti-alternative--pozzi-privati',
  'acqua-fonti-alternative--valutazione-rapida-delle-fonti-locali',
  'acqua-purificazione--metodo-1-bollitura-migliore',
  'acqua-purificazione--metodo-2-candeggina-domestica',
  'acqua-purificazione--metodo-3-filtro-portatile',
  'acqua-purificazione--perch-ogni-fonte-sospetta',
  'acqua-raccolta-pioggia--sistema-base-di-raccolta',
  'acqua-stoccaggio--conservazione-corretta',
  'acqua-stoccaggio--contenitori-quale-scegliere',
  'acqua-stoccaggio--quanto-stoccare',
  'cibo-conservazione--alimenti-a-lunga-conservazione-senza-ene',
  'cibo-conservazione--metodo-1-salatura',
  'cibo-conservazione--metodo-2-essiccazione',
  'cibo-conservazione--metodo-3-fermentazione',
  'cibo-conservazione--metodo-4-sott-olio-e-sott-aceto',
  'cibo-cottura-campo--forno-solare-fai-da-te',
  'cibo-cottura-campo--fuoco-a-legna-efficienza',
  'cibo-cottura-campo--metodo-thermos-box-cooker',
  'cibo-scorte-piano--alimenti-per-priorit-di-durata',
  'cibo-scorte-piano--contenitori-corretti-per-la-durata-massi',
  'cibo-scorte-piano--piano-minimo-30-giorni-per-persona',
  'comm-piano-famiglia--crea-la-tua-lista-contatti-cartacea',
  'comm-piano-famiglia--i-5-elementi-del-piano',
  'comm-piano-famiglia--protocollo-di-comunicazione',
  'comm-pmr446--frequenze-e-canali',
  'comm-radio-canali--cosa-ascoltare-e-quando',
  'comm-radio-canali--frequenze-di-emergenza-per-zona',
  'comm-radio-canali--tipi-di-radio-quale-scegliere',
  'community-resilienza--costruire-la-rete-locale',
  'community-resilienza--volontariato-di-protezione-civile',
  'energia-generatore--installazione-corretta',
  'energia-generatore--monossido-di-carbonio-il-pericolo-invisi',
  'evacuazione-piano--livelli-di-evacuazione',
  'farmaci-scorta--farmaci-cronici-gestione-scorte',
  'farmaci-scorta--lista-farmaci-da-banco-obbligatori',
  'farmaci-scorta--scadenze-la-verit',
  'gobag-checklist--acqua-e-cibo-72-ore',
  'ipotermia-prevenzione--riconoscere-i-livelli-di-ipotermia',
  'ipotermia-prevenzione--trattamento-ipotermia-lieve',
  'ipotermia-prevenzione--trattamento-ipotermia-moderata-grave',
  'isolamento-stanza--controllo-dell-umidit',
  'isolamento-stanza--isolamento-rapido-delle-aperture',
  'isolamento-stanza--massimizzare-il-calore-corporeo',
  'kit-medico--farmaci-da-avere-sempre-con-ricetta-medi',
  'kit-medico--materiali-avanzati-fortemente-consigliat',
  'orto-emergenza--germogli-produzione-rapida-senza-suolo',
  'primo-soccorso--gestione-emorragie',
  'primo-soccorso--manovre-disostruzione-vie-aeree',
  'primo-soccorso--rcp-rianimazione-cardio-polmonare',
  'primo-soccorso--valutazione-primaria-abcde',
  'riscaldamento-alternativo--riconoscere-avvelenamento-da-co',
  'riscaldamento-alternativo--riscaldatori-da-campeggio-a-gpl-emergenz',
  'riscaldamento-alternativo--stufa-a-legna-pellet-soluzione-ottimale',
  'sicurezza-casa--prevenzione-incendi-in-emergenza',
  'sicurezza-casa--sicurezza-dei-carburanti-stoccati',
  'survival-acqua-natura--acqua-da-non-bere-mai',
  'survival-acqua-natura--distillazione-solare',
  'survival-acqua-natura--raccolta-rugiada-e-pioggia',
  'survival-acqua-natura--trovare-fonti-d-acqua',
  'survival-conservazione-cibo--essiccatura-la-tecnica-pi-antica',
  'survival-conservazione-cibo--fermentazione-lattica',
  'survival-conservazione-cibo--salatura-e-salagione',
  'survival-fuoco--metodo-2-bow-drill-senza-attrezzi',
  'survival-fuoco--sicurezza-e-spegnimento',
  'survival-navigazione--orientamento-con-indizi-naturali',
  'survival-piante--piante-commestibili-comuni-in-italia',
  'survival-piante--test-universale-di-commestibilit-usas',
  'survival-primo-soccorso-campo--colpo-di-calore',
  'survival-primo-soccorso-campo--emorragia-controllo-rapido',
  'survival-primo-soccorso-campo--fratture-e-lussazioni',
  'survival-primo-soccorso-campo--ipotermia-riconoscimento-e-trattamento',
  'survival-primo-soccorso-campo--ustioni',
  'survival-segnalazione--segnali-ottici',
  'survival-trappole--pesca-di-sussistenza',
]);

// Schemi SVG disegnati a partire dal testo verificato (tools/make-guide-svgs.py): al posto della .webp
const GUIDE_IMG_SVG = new Set([
  'acqua-purificazione--metodo-1-bollitura-migliore',
  'acqua-purificazione--metodo-2-candeggina-domestica',
  'acqua-purificazione--metodo-3-filtro-portatile',
  'acqua-purificazione--perch-ogni-fonte-sospetta',
  'acqua-purificazione--quale-metodo-scegliere',
  'acqua-stoccaggio--conservare-e-sostituire',
  'acqua-stoccaggio--contenitori',
  'acqua-stoccaggio--quanto-stoccare',
  'animali-emergenza--abituarlo-al-trasportino',
  'animali-emergenza--il-kit-per-l-animale',
  'animali-emergenza--il-piano',
  'casa-utenze--come-chiudere',
  'casa-utenze--prepararsi-prima',
  'casa-utenze--quando-chiudere',
  'cibo-scorte-piano--conservare-e-ruotare',
  'cibo-scorte-piano--cosa-tenere',
  'cibo-scorte-piano--quanto',
  'comm-piano-famiglia--le-domande-da-farsi',
  'comm-piano-famiglia--lista-contatti-su-carta',
  'comm-piano-famiglia--provare-il-piano',
  'comm-piano-famiglia--ritrovarsi-e-comunicare',
  'community-resilienza--costruire-la-rete-locale',
  'community-resilienza--volontariato-di-protezione-civile',
  'cyberattacco--dopo-l-attacco',
  'cyberattacco--durante-l-attacco',
  'cyberattacco--prepararsi-prima',
  'energia-blackout-protocollo--cosa-pu-smettere-di-funzionare',
  'energia-blackout-protocollo--durante-il-blackout',
  'energia-blackout-protocollo--prepararsi-prima',
  'energia-blackout-protocollo--quando-torna-la-corrente',
  'energia-generatore--installazione-corretta',
  'energia-generatore--monossido-di-carbonio-il-pericolo-invisi',
  'energia-generatore--rifornimento-e-manutenzione',
  'energia-ricarica--far-durare-la-batteria',
  'energia-ricarica--prima-cosa-tenere-pronto',
  'energia-ricarica--radio-a-manovella-o-solare',
  'energia-ricarica--ricaricare-in-auto',
  'evacuazione-piano--dopo',
  'evacuazione-piano--durante-il-viaggio',
  'evacuazione-piano--prepararsi',
  'evacuazione-piano--prima-di-uscire-di-casa',
  'gobag-checklist--acqua-e-cibo',
  'gobag-checklist--attrezzatura',
  'gobag-checklist--bisogni-personali',
  'gobag-checklist--documenti-e-contanti',
  'gobag-checklist--tenerlo-pronto',
  'igiene-wc-emergenza--bagno-di-emergenza-nel-wc',
  'igiene-wc-emergenza--cosa-tenere-pronto',
  'igiene-wc-emergenza--rifiuti-e-mani',
  'nucleare-radiologico--decontaminazione',
  'nucleare-radiologico--restare-al-chiuso',
  'nucleare-radiologico--se-vedi-un-lampo-intenso',
  'persone-fragili--comunicare',
  'persone-fragili--farmaci-e-dispositivi',
  'persone-fragili--il-piano',
  'senza-internet--comunicare-con-la-rete-congestionata',
  'senza-internet--dove-trovare-le-notizie',
  'senza-internet--prepararsi-finch-funziona-tutto',
  'sicurezza-casa--carburanti-e-combustibili',
  'sicurezza-casa--luce-senza-corrente',
  'sicurezza-casa--prevenire-gli-incendi',
  'sicurezza-casa--se-scoppia-un-incendio',
  'stress-bambini--per-gli-adulti',
  'stress-bambini--per-i-bambini',
  'stress-bambini--segnali-da-non-trascurare',
]);

// Profilo → «Nascondi le guide da usare con cautela»: se attivo, le guide in GUIDE_CAUTION
// non compaiono nell'elenco, nei collegamenti e nella ricerca «Chiedi».
function guideVisible(id) {
  try { if (Storage.get('hide_caution', false) !== true) return true; } catch (e) { return true; }
  return !GUIDE_CAUTION[id];
}
