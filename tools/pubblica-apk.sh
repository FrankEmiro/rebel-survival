#!/bin/bash
# Pubblica un APK già compilato e firmato come release su GitHub (l'APK non va più sul sito).
# Controlla che dist/RebelSurvival-vNN.apk esista e scrive il comando da lanciare.
# Uso:  tools/pubblica-apk.sh 114
# La release ha il tag vNN e il file allegato RebelSurvival.apk: l'app installata legge
# l'ultima release (REPO in js/main.js) e il link .../releases/latest/download/RebelSurvival.apk
# porta sempre all'ultima versione. Funziona solo con il repository pubblico.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="FrankEmiro/rebel-survival"   # rinomina prodotto/repository: cambiare qui e in js/main.js
VER="${1:?indica la versione, es. tools/pubblica-apk.sh 114}"
SRC="${APK:-$ROOT/dist/RebelSurvival-v$VER.apk}"
[ -f "$SRC" ] || { echo "Manca $SRC: compila prima con tools/build-android.sh"; exit 1; }
# su GitHub il file allegato deve chiamarsi proprio RebelSurvival.apk
OUT="$ROOT/dist/release-v$VER"; mkdir -p "$OUT"; cp "$SRC" "$OUT/RebelSurvival.apk"
echo "APK pronto: $OUT/RebelSurvival.apk"
echo "Per pubblicarlo (dopo aver unito il codice a main e fatto push), lancia:"
echo
echo "cd \"$ROOT\" && gh release create v$VER \"$OUT/RebelSurvival.apk\" --repo $REPO --title \"Rebel Survival v$VER\" --notes \"App Android v$VER\""
