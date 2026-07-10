#!/usr/bin/env bash
# ── Genera la clave de firma (upload key) de AceCoach ────────────────────
#
# Ejecutar UNA SOLA VEZ en tu máquina (necesita el JDK: viene con Android Studio).
# La misma clave debe firmar TODAS las versiones futuras — así las
# actualizaciones se instalan encima sin desinstalar.
#
# Uso:  ./scripts/generate-keystore.sh
#
set -euo pipefail

DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUT_DIR="$DIR/android/keystore"
KS="$OUT_DIR/acecoach-upload.jks"
ALIAS="acecoach-upload"

if [ -f "$KS" ]; then
  echo "❌ Ya existe $KS — no se sobreescribe (perderías la firma actual)."
  exit 1
fi

mkdir -p "$OUT_DIR"

echo "🎾 Generando clave de firma para AceCoach…"
echo "   Te pedirá una contraseña (apúntala en tu gestor de contraseñas)"
echo "   y datos del certificado (puedes dejar los opcionales en blanco)."
echo

keytool -genkeypair \
  -v \
  -keystore "$KS" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

echo
echo "✅ Clave creada en: $KS"
echo
echo "Siguientes pasos:"
echo "  1. cp android/keystore.properties.example android/keystore.properties"
echo "  2. Edita android/keystore.properties con tu contraseña (alias: $ALIAS)"
echo "  3. HAZ COPIA DE SEGURIDAD del .jks y la contraseña fuera del repo"
echo "  4. Compila firmado:  cd android && ./gradlew bundleRelease"
echo
echo "⚠️  El .jks y keystore.properties están en .gitignore — nunca los subas a git."
