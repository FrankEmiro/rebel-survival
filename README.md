# Rebel Survival

Rebel Survival (prima si chiamava «Kit Resilienza») è un'app per prepararsi alle emergenze e affrontarle: blackout, mancanza d'acqua, conflitto, incidente nucleare o radiologico, terremoto e altri scenari.
Funziona **anche senza internet**.

- Sito (app web installabile): https://resilienza.cyberrebellion.site
- App Android: si scarica dal sito (Profilo → App). Ha in più la chat tra telefoni vicini, che è sperimentale.

## Cosa contiene
- **Guide e scenari.** Ogni indicazione pratica viene da fonti ufficiali: Protezione civile, OMS, Ready.gov, ERC e altri enti pubblici. Le guide ancora da verificare sono segnate «Cautela».
- **Calcolatori:**
  - acqua, cibo e carburante;
  - energia;
  - riscaldamento.
- **Scorte e kit:**
  - liste da preparare;
  - zaino di emergenza;
  - lista della spesa.
- **Strumenti:**
  - posizione GPS;
  - torcia;
  - mappa dei confini comunali;
  - schermo sempre acceso;
  - condivisione dell'app.
- **Wikipedia offline.** Scarica un file `.zim` di Kiwix e lo legge dentro l'app. Il lettore è proprio dell'app (`js/modules/zim.js`).
- **Chat vicini** (solo Android, sperimentale). Funziona via Bluetooth, senza internet né rete telefonica. È compatibile con l'app *bitchat*.
- **Assistente AI** (sperimentale). Usa internet.
- **Profilo e backup.** I dati restano sul telefono: si possono esportare e reimportare.

## Come è fatta
È un'app web statica, senza passaggi di compilazione: HTML, CSS e JavaScript semplice, con un modulo per ogni sezione.

| Percorso | Contenuto |
|---|---|
| `index.html` | Pagina unica: tutte le sezioni (`section-*`) |
| `js/main.js` | Navigazione tra le sezioni, avvio, controllo aggiornamenti dell'APK (`SITE_URL`) |
| `js/modules/` | Un modulo per sezione (acqua, cibo, energia, kit, strumenti, chat, wiki, …) |
| `js/data/guides.js` | Testo delle guide e degli scenari |
| `js/data/*.geojson` | Confini di comuni, province e regioni |
| `js/vendor/` | Librerie esterne (vedi sotto) |
| `guides/pc/` | Guide PDF della Protezione civile |
| `legal/` | Privacy e condizioni d'uso |
| `sw.js` | Service worker: tiene in cache i file per l'uso offline |
| `manifest.json`, `icons/` | Installazione come app (PWA) |
| `android/` | App Android (vedi `android/LEGGIMI.md`) |
| `tools/` | Script: compilare e pubblicare l'APK, generare icone e schemi delle guide |
| `download/` | APK pubblicato sul sito e `version.json` (ultima versione) |
| `Dockerfile`, `nginx.conf` | Server del sito (nginx) |

## Provarla sul computer
```
npm start
```
Poi apri http://localhost:5500. In alternativa va bene qualsiasi server statico, per esempio `python3 -m http.server`.

## Pubblicare una nuova versione
1. A ogni modifica dei file dell'app aumenta il numero in `sw.js` (`CACHE_NAME = 'kit-resilienza-vNN'`). Senza questo passaggio chi ha già l'app continua a vedere i file vecchi. Lo stesso numero diventa la versione dell'app Android.
2. Il ramo `main` va online da solo: ogni push su `main` aggiorna il sito tramite il deploy automatico. Le modifiche si fanno su un altro ramo e si uniscono a `main` solo quando sono pronte.
3. Per pubblicare anche l'app Android:
   1. compila l'APK con `tools/build-android.sh`;
   2. mettila sul sito con `tools/pubblica-apk.sh NN`;
   3. fai il commit di `download/`.

   L'app installata vede la nuova versione da `download/version.json`.

## Librerie esterne
- **Leaflet 1.9.4** per la mappa, in `js/vendor/leaflet`.
- **Phosphor Icons** per le icone, in `js/vendor/phosphor`.
- **QR Code Generator** di Kazuhiko Arase, licenza MIT, in `js/vendor/qrcode`.
- **fzstd**, licenza MIT, per leggere i file Wikipedia compressi.
- **bitchat-android**, licenza GPL versione 3, per la chat Bluetooth. È in `android/mesh`; origine e modifiche sono descritte in `android/mesh/LEGGIMI.md`.

## Licenza
Da definire. La chat Bluetooth usa codice con licenza GPL versione 3. Per questo l'app Android con la chat potrà essere distribuita solo insieme al codice sorgente, con la stessa licenza.

## Nome del prodotto
Il vecchio nome «Kit Resilienza» resta in alcuni nomi tecnici. Se si cambia nome bisogna toccare:
- il prefisso della cache in `sw.js` e in `tools/build-android.sh`;
- il nome della cartella;
- `manifest.json`;
- `<title>` in `index.html`;
- i nomi per Android elencati in `android/LEGGIMI.md`.
