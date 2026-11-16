#!/bin/bash
# Costruisce l'app Android (APK) di Rebel Survival con dentro tutti i file dell'app web.
# Uso:  tools/build-android.sh
# Risultato: dist/RebelSurvival-vNN.apk  (NN = versione della cache in sw.js)
# Servono: JDK 17 o più recente e Android SDK (vedi android/LEGGIMI.md).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
WWW="$ROOT/android/app/src/main/assets/www"
VER="$(grep -o "kit-resilienza-v[0-9]*" "$ROOT/sw.js" | head -1 | sed 's/.*-v//')"

echo "Copio i file dell'app web (versione v$VER)…"
mkdir -p "$WWW"
# solo i file che servono all'app (niente strumenti, note interne, Docker)
rsync -a --delete \
  --exclude '.DS_Store' --exclude 'icons/source' --exclude 'icons/generate-icons.html' \
  "$ROOT/index.html" "$ROOT/manifest.json" \
  "$ROOT/css" "$ROOT/fonts" "$ROOT/guides" "$ROOT/icons" "$ROOT/js" "$ROOT/legal" \
  "$WWW/"

echo "Compilo l'APK…"
cd "$ROOT/android"
"${GRADLE:-./gradlew}" --quiet assembleRelease -PrsVersion="$VER"

mkdir -p "$ROOT/dist"
cp "$ROOT/android/app/build/outputs/apk/release/app-release.apk" "$ROOT/dist/RebelSurvival-v$VER.apk"
[ -n "${ANDROID_KEYSTORE_PASSWORD:-}" ] && echo "Firma: chiave definitiva" || echo "Firma: chiave di PROVA (non distribuire)"
echo "Fatto: dist/RebelSurvival-v$VER.apk ($(du -h "$ROOT/dist/RebelSurvival-v$VER.apk" | cut -f1))"
