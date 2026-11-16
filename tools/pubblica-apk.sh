#!/bin/bash
# Mette sul sito un APK già compilato e firmato: copia dist/RebelSurvival-vNN.apk in
# download/RebelSurvival.apk e scrive download/version.json (letto dall'app installata
# per proporre l'aggiornamento). Uso:  tools/pubblica-apk.sh 107
# Dopo: commit dei due file sul ramo di rilascio e push del titolare.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VER="${1:?indica la versione, es. tools/pubblica-apk.sh 107}"
SRC="${APK:-$ROOT/dist/RebelSurvival-v$VER.apk}"
[ -f "$SRC" ] || { echo "Manca $SRC: compila prima con tools/build-android.sh"; exit 1; }
mkdir -p "$ROOT/download"
cp "$SRC" "$ROOT/download/RebelSurvival.apk"
printf '{ "version": %d }\n' "$VER" > "$ROOT/download/version.json"
echo "Pronto: download/RebelSurvival.apk (v$VER) e download/version.json"
