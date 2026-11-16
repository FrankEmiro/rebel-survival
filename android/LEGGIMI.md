# App Android di Rebel Survival

Questa è la stessa app web, impacchettata come app Android (`.apk`).
Tutti i file sono dentro l'APK: guide, PDF, mappa dei confini e icone. Per questo l'app funziona senza internet.
Si può anche passare a un altro telefono con Bluetooth o Quick Share, da Profilo → App → «Passa l'app a un altro telefono».

## Come è fatta
- **`app/src/main/java/.../MainActivity.java`** apre i file dell'app in una WebView. L'indirizzo interno è `https://appassets.androidplatform.net/` e non va su internet. Gestisce:
  - GPS e fotocamera (per la torcia);
  - la scelta dei file, per ripristinare un backup;
  - i link `tel:` e i siti esterni;
  - le guide PDF e il tasto «Indietro».
- **`ShareProvider.java`** passa ad altre app i file preparati: APK, PDF e backup.
- **`KeepAliveService.java`** tiene viva l'app durante i download lunghi, come Wikipedia, anche quando l'app è in secondo piano o lo schermo è spento. Mostra una notifica con l'avanzamento.
- **`mesh/`** è il modulo della chat tra telefoni vicini via Bluetooth. Il codice viene da bitchat-android, licenza GPL versione 3 (vedi `mesh/LEGGIMI.md`).

### Ponte con la pagina
La pagina parla con l'app tramite `window.RSAndroid`, e lo usa anche per capire di essere dentro l'app. Le funzioni sono:
- `version`, `shareApp`, `shareData`, `keepScreenOn`;
- per i download in secondo piano: `bgStart`, `bgProgress`, `bgStop`;
- per la chat: `meshStart`, `meshStop`, `meshRunning`, `meshMe`, `meshPeers`, `meshSend`, `meshSendPrivate`, `meshNick`, `meshSetNick`.

Gli eventi della chat arrivano alla pagina con `window.RSMeshEvent({...})`.

### Requisiti e permessi
- Android 8.0 o più recente (minSdk 26, richiesto dalla chat).
- Permessi:
  - internet;
  - posizione;
  - fotocamera;
  - Bluetooth («Dispositivi nelle vicinanze»);
  - notifiche;
  - servizio in primo piano per i download.

## Costruire l'APK
Servono JDK 17, Android SDK (platform 36, build-tools 35) e Gradle 8.14.

```
tools/build-android.sh
```

Lo script:
- copia i file web in `app/src/main/assets/www` (questa cartella non è salvata in git);
- crea `dist/RebelSurvival-vNN.apk`, dove NN è il numero della cache in `sw.js`.

Il numero aumenta a ogni versione, così Android accetta l'aggiornamento.

### Firma
- **Chiave definitiva:** il file è fuori dal repository (`~/RebelSurvival-firma/rebelsurvival.jks`, oppure il percorso in `RS_KEYSTORE`). La password viene solo dalla variabile d'ambiente `ANDROID_KEYSTORE_PASSWORD`.
- **Senza chiave:** se mancano il file o la password, si usa la chiave di prova del computer. Un'APK firmata così non può aggiornare quelle firmate con la chiave definitiva.
- **Backup:** la chiave va conservata con cura. Se si perde, non si possono più pubblicare aggiornamenti.

## Aggiornamenti
L'APK si distribuisce solo da **GitHub Releases**, non dal sito.
1. `tools/pubblica-apk.sh NN` controlla l'APK in `dist/` e scrive il comando `gh release create vNN …` da lanciare.
2. La release ha il tag `vNN` e il file allegato `RebelSurvival.apk`.
3. L'app installata legge l'ultima release da GitHub (`REPO` in `js/main.js`) e propone l'aggiornamento. Funziona solo se il repository è pubblico.

## Differenze rispetto al sito
- **Niente service worker:** i file sono già nell'APK. Per aggiornare si installa un APK nuovo.
- **Dati separati:** i dati salvati nel browser (sito) e quelli dell'app non si vedono a vicenda. Per spostarli si usa Profilo → esporta/importa backup.
- **Internet:** l'AI sperimentale e la mappa online lo usano come nel sito.
- **Solo nell'app:** chat Bluetooth e download in secondo piano.

## Da sapere prima di pubblicare
- **Licenza GPL.** L'APK con la chat (modulo `mesh`) va distribuita insieme al codice sorgente di tutta l'app, con licenza GPL versione 3. Finché il repository è privato, quell'APK non va pubblicata.
- **Identificativo dell'app.** È `it.cyberrebellion.rebelsurvival` (in `app/build.gradle` e `AndroidManifest.xml`). Dopo la prima pubblicazione su Google Play non si cambia più.
- **Google Play.** Servono il formato `.aab` (`gradle bundleRelease`) e una chiave di caricamento.

## Nomi da cambiare se il prodotto cambia nome
- `res/values/strings.xml` (nome sotto l'icona);
- `settings.gradle`;
- `MainActivity.APK_NAME`;
- `tools/build-android.sh` (nome del file in `dist/`).
