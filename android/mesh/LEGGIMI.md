# Modulo `mesh`: chat tra telefoni vicini via Bluetooth

Il codice viene da **bitchat-android** (https://github.com/permissionlesstech/bitchat-android),
licenza **GPL versione 3** (testo completo in `LICENSE-bitchat.md`). La versione di partenza è il commit indicato in `BITCHAT_COMMIT`.

Distribuire l'app con questo modulo obbliga a dare il codice sorgente di tutta l'app con la stessa licenza.

## Cosa è preso da bitchat (con modifiche minime)
Questi pacchetti sono in `src/main/java/com/bitchat/android/`:
- `mesh`: rete Bluetooth LE e inoltro dei messaggi fino a 7 passaggi;
- `noise`: cifratura dei messaggi privati;
- `protocol` e `model`: formato dei messaggi, compatibile con bitchat per iPhone e Android;
- `sync`: sincronizzazione dei messaggi tra i telefoni;
- `crypto` e `identity`: chiavi e identità del telefono;
- `services`, `service`, `favorites` e `spam`: servizi di supporto;
- `ui/debug`: solo le impostazioni, senza schermate.

## Modifiche di Rebel Survival (2026-11-16)
- **Tolti:**
  - messaggi via internet (Nostr e Tor): restano solo i sostituti vuoti in `nostr/RsNostrStubs.kt`;
  - voce in diretta: resta solo il sostituto `features/voice/LiveVoiceManager.kt`;
  - Wi‑Fi Aware: resta solo il sostituto `wifiaware/WifiAwareController.kt`;
  - tutte le schermate Compose.
- **Notifiche:**
  - i testi sono in italiano (`res/values/strings.xml`);
  - l'app si apre con l'intent di avvio del pacchetto;
  - i messaggi privati ad app chiusa passano da `mesh/RsBackgroundMessages.kt`.
- **Il nome nella chat** viene salvato nelle preferenze `rs_mesh` (`services/NicknameProvider.kt`).
- **Ponte verso l'app:** `rs/RsMesh.kt`. Lo usa `MainActivity.java` (metodi `RSAndroid.mesh*`), mentre la schermata web è `js/modules/chat.js`.
- **Limite attuale:** il servizio in background (`MeshForegroundService`) non è dichiarato nel manifest, quindi la chat funziona solo con l'app aperta.
