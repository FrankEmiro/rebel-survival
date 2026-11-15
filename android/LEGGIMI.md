# App Android di Rebel Survival

Questa è la stessa app web, impacchettata come app Android (`.apk`).
Tutti i file (guide, PDF, mappa dei confini, icone) sono dentro l'APK, quindi l'app funziona senza internet e si può passare a un altro telefono con Bluetooth o Quick Share (Profilo → App → «Passa l'app a un altro telefono»).

## Come è fatta
- `app/src/main/java/.../MainActivity.java`: apre i file dell'app in una WebView all'indirizzo interno `https://appassets.androidplatform.net/` (non va su internet). Gestisce GPS, fotocamera (torcia), scelta file (ripristino backup), link `tel:` e siti esterni, guide PDF, tasto «Indietro».
- `ShareProvider.java`: passa ad altre app i file preparati (APK, PDF, backup).
- Ponte con la pagina: `window.RSAndroid` (`version`, `shareApp`, `shareData`, `keepScreenOn`). La pagina usa `window.RSAndroid` per capire che è dentro l'app.
- Nessuna libreria esterna (niente androidx): serve solo il plugin Android per Gradle.

## Costruire l'APK
```
tools/build-android.sh
```
Copia i file web in `app/src/main/assets/www` (non salvati in git) e crea `dist/RebelSurvival-vNN.apk`.
NN è il numero della cache in `sw.js`: aumenta a ogni versione, così Android accetta l'aggiornamento.

## Differenze rispetto al sito
- Niente service worker: i file sono già nell'APK. Per aggiornare si installa un APK nuovo.
- I dati salvati nel browser (sito) e quelli dell'app sono separati: per spostarli usare Profilo → esporta/importa backup.
- L'AI sperimentale e la mappa online usano internet come nel sito.

## Da decidere prima di Google Play
- Identificativo `it.cyberrebellion.rebelsurvival` (in `app/build.gradle` e `AndroidManifest.xml`): dopo la prima pubblicazione non si cambia più.
- Firma: ora l'APK è firmato con la chiave di prova di questo computer. Va bene per installare a mano, ma gli aggiornamenti devono avere la stessa firma. Per Google Play serve una chiave di caricamento (upload key) custodita dal titolare, e il formato `.aab` (`./gradlew bundleRelease`).

## Nomi da cambiare se il prodotto cambia nome
`res/values/strings.xml` (nome sotto l'icona), `settings.gradle`, `MainActivity.APK_NAME`, `tools/build-android.sh` (nome del file in dist/).
