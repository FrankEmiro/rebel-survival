<p align="center"><a href="https://github.com/FrankEmiro/rebel-survival/releases/latest"><img src="icons/icon-rs-512.png" alt="Rebel Survival" width="140"></a></p>

<h1 align="center">Rebel Survival</h1>

<p align="center">
  <b>L'app per prepararsi alle emergenze e affrontarle, anche senza internet.</b><br>
  Guide da fonti ufficiali, piani per scenario, calcolatori delle scorte, strumenti pratici, Wikipedia offline e una chat Bluetooth tra telefoni vicini. Niente account: i dati restano sul tuo telefono.
</p>

<p align="center">
  <a href="LICENSE"><img alt="Licenza: GPL v3" src="https://img.shields.io/badge/licenza-GPL%20v3-6366f1"></a>
  <img alt="Funziona offline" src="https://img.shields.io/badge/funziona-offline-10b981">
  <img alt="Android 8 o più recente" src="https://img.shields.io/badge/Android-8.0%2B-3ddc84">
  <img alt="Nessun account" src="https://img.shields.io/badge/account-nessuno-ec4899">
  <img alt="In italiano" src="https://img.shields.io/badge/lingua-italiano-3b82f6">
  <a href="https://cyberrebellion.site"><img alt="Fatto da Cyber Rebellion" src="https://img.shields.io/badge/fatto%20da-Cyber%20Rebellion-ef4444"></a>
</p>

<p align="center">🇮🇹 Italiano · <a href="README.en.md">🇬🇧 English</a></p>

<p align="center">
  <a href="https://github.com/FrankEmiro/rebel-survival/releases/latest"><b>⬇ Scarica l'app Android</b></a>
</p>

> 🏴 **Rebel Survival è un progetto di [Cyber Rebellion](https://cyberrebellion.site).** L'app è gratuita e il codice è pubblico. Idee, segnalazioni di errori e correzioni alle guide sono benvenute nelle [issues](https://github.com/FrankEmiro/rebel-survival/issues).

## Il problema

Quando manca la corrente, l'acqua o la rete telefonica, le informazioni servono subito, ma internet spesso non c'è. Le indicazioni ufficiali esistono, però sono sparse tra siti e PDF diversi. E prepararsi prima, cioè capire quanta acqua e quanto cibo tenere in casa o cosa mettere nello zaino, richiede tempo e calcoli che nessuno fa.

## Cosa fa Rebel Survival

Mette in **un'unica app che funziona offline** quello che serve **prima** di un'emergenza (scorte, piani, kit) e quello che serve **durante** (cosa fare passo per passo, strumenti, comunicare con chi è vicino). È un'app Android e si scarica gratis da GitHub.

## ✨ Funzioni principali

| | |
|---|---|
| 🚨 **Cosa sta succedendo?** | Scegli la situazione e l'app ti dà il piano da seguire, passo per passo. **21 scenari**: blackout breve e lungo, terremoto, alluvione, maremoto, vulcano, incendio, ondata di caldo, tempesta invernale, evacuazione, mancanza di acqua, cibo o gas, pandemia, crisi economica, attacco informatico, conflitto, incidente nucleare o radiologico, sopravvivenza in natura e altri. |
| 📚 **Guide da fonti ufficiali** | **47 guide** in 8 aree (acqua, cibo, energia, calore, salute, comunicazioni, mobilità, casa e persone), con schemi illustrati. Ogni indicazione pratica viene da enti ufficiali (Protezione civile, OMS, Ready.gov, ERC e altri), con il link alla fonte. Le guide ancora da verificare sono segnate **«Cautela»** e si possono nascondere. In più ci sono le **guide PDF della Protezione civile**. |
| 🧮 **Calcolatori delle scorte** | Quanta acqua e quanto cibo servono alla tua famiglia, per quanti giorni ti basta l'energia, il riscaldamento, il carburante. I numeri seguono le raccomandazioni ufficiali e sono calcolati sul tuo profilo. |
| 🎒 **Scorte e kit** | Cosa hai già e cosa ti manca, area per area: acqua, cibo, energia, salute, igiene, zaino di emergenza. Con la **lista della spesa** pronta. |
| 🔦 **Strumenti** | Torcia, segnale SOS, bussola, posizione GPS, mappa con i confini di comuni, province e regioni, stato di batteria e rete. Lo schermo può restare acceso. |
| 📖 **Wikipedia offline** | Scegli e scarica le parti di Wikipedia che ti servono, per esempio la medicina, e leggile senza rete. I file vengono da Kiwix; il lettore è dentro l'app. Su Android il download continua anche con l'app in secondo piano. |
| 📡 **Chat tra telefoni vicini** *(Android, sperimentale)* | Messaggi via **Bluetooth, senza internet né rete telefonica**. I messaggi passano di telefono in telefono fino a 7 passaggi, quelli privati sono cifrati. È compatibile con l'app **bitchat** per Android e iPhone. |
| 💬 **Assistente** *(sperimentale)* | Fai una domanda a parole tue: l'app cerca la risposta nelle sue guide, **offline**, e ti mostra sempre la fonte. Sui telefoni più potenti può anche scrivere la risposta con un modello AI che gira sul telefono stesso. |
| 📲 **Passala a chi non ha internet** | Condividi il tuo piano con un **codice QR**. Passa l'app intera a un altro telefono con Bluetooth o Quick Share: l'APK, oppure una copia offline in un unico file che si apre con il browser. |
| 🔒 **Privacy** | Niente account e niente registrazione. Profilo, scorte e messaggi restano sul telefono; puoi esportarli in un backup e reimportarli. |

## Come si usa

1. **Scarica l'app** dall'[ultima release](https://github.com/FrankEmiro/rebel-survival/releases/latest) (file `RebelSurvival.apk`) e installala: il telefono ti chiederà di consentire l'installazione da questa fonte.
2. **Compila il profilo**: quante persone siete, eventuali animali, cosa hai già in casa.
3. **Prepara le scorte** con i calcolatori e le liste, area per area.
4. **In un'emergenza** tocca «Cosa sta succedendo?» e segui il piano. Tutto funziona anche senza rete.

> ⚠️ **Da sapere.** Rebel Survival raccoglie indicazioni da fonti ufficiali, ma **non sostituisce i soccorsi né le istruzioni delle autorità**. In caso di pericolo chiama il **112** e segui le indicazioni della Protezione civile e delle autorità locali. Le funzioni segnate «sperimentale» possono non funzionare su tutti i telefoni.

## Per sviluppatori

È un'app web statica, **senza passaggi di compilazione e senza dipendenze npm**: HTML, CSS e JavaScript semplice, con un modulo per ogni sezione. L'app Android impacchetta gli stessi file in una WebView e aggiunge le parti native (chat Bluetooth, download in secondo piano).

### Provarla sul computer
```bash
git clone https://github.com/FrankEmiro/rebel-survival.git
cd rebel-survival
npm start          # oppure: python3 -m http.server 5500
```
Poi apri **http://localhost:5500**.

### Struttura

| Percorso | Contenuto |
|---|---|
| `index.html` | Pagina unica: tutte le sezioni (`section-*`) |
| `js/main.js` | Navigazione, avvio, controllo aggiornamenti dell'APK su GitHub (`REPO`) |
| `js/modules/` | Un modulo per sezione (acqua, cibo, energia, kit, strumenti, chat, wiki, assistente…) |
| `js/data/guides.js` | Testo delle guide, fonti e avvisi di cautela |
| `js/data/*.geojson` | Confini di comuni, province e regioni |
| `js/vendor/` | Librerie esterne |
| `guides/pc/` | Guide PDF della Protezione civile |
| `legal/` | Privacy e condizioni d'uso |
| `sw.js` | Service worker: tiene in cache i file per l'uso offline |
| `android/` | App Android, vedi [android/LEGGIMI.md](android/LEGGIMI.md) |
| `tools/` | Script: compilare e pubblicare l'APK, generare icone e schemi delle guide |
| `Dockerfile`, `nginx.conf` | Server per la versione web (oggi non pubblicata) |

### Pubblicare una nuova versione
1. A ogni modifica dei file dell'app aumenta il numero in `sw.js` (`CACHE_NAME = 'kit-resilienza-vNN'`): senza questo, chi ha già l'app continua a vedere i file vecchi. Lo stesso numero diventa la versione dell'app Android.
2. Lavora su un altro ramo e unisci a `main` solo quando è pronto.
3. Per l'app Android: `tools/build-android.sh` crea l'APK, `tools/pubblica-apk.sh NN` scrive il comando per pubblicarla come release `vNN` su GitHub. L'APK non sta sul sito: l'app installata vede la nuova versione dall'ultima release.

### Contribuire alle guide
Le guide riguardano la sicurezza delle persone. **Ogni indicazione pratica (dosi, numeri, distanze, procedure) deve avere una fonte ufficiale**: Protezione civile, OMS, ministeri, enti pubblici. Se proponi una modifica, metti il link alla fonte. Senza fonte, la guida resta segnata «Cautela».

## Librerie e contenuti di terzi

- [Leaflet](https://leafletjs.com) 1.9.4: mappa (BSD-2-Clause)
- [Phosphor Icons](https://phosphoricons.com): icone (MIT)
- QR Code Generator di Kazuhiko Arase: codici QR (MIT)
- [fzstd](https://github.com/101arrowz/fzstd): lettura dei file Wikipedia compressi (MIT)
- [bitchat-android](https://github.com/permissionlesstech/bitchat-android): chat Bluetooth, in `android/mesh` (GPL v3)
- Font Rajdhani, Nunito e JetBrains Mono (SIL Open Font License 1.1)
- Mappe © contributori di OpenStreetMap (ODbL); pagine di Wikipedia © autori di Wikipedia (CC BY-SA), scaricate da Kiwix
- Guide PDF © Dipartimento della Protezione civile

## Cyber Rebellion

[Cyber Rebellion](https://cyberrebellion.site) è una rete di professionisti indipendenti in Italia che porta gli agenti AI nelle aziende. Rebel Survival è il nostro progetto per la preparazione alle emergenze, gratuito e aperto a tutti.

⭐ Se l'app ti è utile, **[metti una stella al repository](https://github.com/FrankEmiro/rebel-survival)**: aiuta altre persone a trovarla.

## Licenza

Il codice di Rebel Survival è software libero con licenza **[GNU GPL versione 3](LICENSE)**. In breve:

- **Puoi** usarla gratis, studiarla, modificarla e condividerla.
- **Se la distribuisci**, anche modificata, devi dare il codice sorgente con la stessa licenza.
- **Non sono compresi** nella licenza: il nome e il logo «Rebel Survival», le guide PDF della Protezione civile e le librerie esterne, ognuna con la propria licenza.

Questo è un riassunto: vale il testo della licenza.
