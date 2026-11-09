#!/usr/bin/env bash
# Registra a configuração do PC usado na build local (Linux/macOS) e, opcionalmente, o AAB/APK gerado.
# Acrescenta uma entrada em docs/REGISTRO-BUILDS.md. NÃO registra senhas.
# Uso: scripts/registrar-ambiente-build.sh [caminho/do/app-release.aab] ["observação"]
set -u
ARTEFATO="${1:-}"; OBS="${2:-}"; SAIDA="docs/REGISTRO-BUILDS.md"
LINHAS=()
add() { LINHAS+=("| $1 | ${2:-(não encontrado)} |"); }
first() { "$@" 2>&1 | head -1; }

add "Sistema" "$(uname -srm)$( [ -f /etc/os-release ] && . /etc/os-release && echo " — $PRETTY_NAME")"
add "CPU (threads)" "$(getconf _NPROCESSORS_ONLN 2>/dev/null)"
add "RAM" "$(free -h 2>/dev/null | awk '/Mem:/{print $2}' || sysctl -n hw.memsize)"
add "Disco livre" "$(df -h . | awk 'NR==2{print $4}')"
add "JAVA_HOME" "${JAVA_HOME:-}"
add "java -version" "$(java -version 2>&1 | grep -v JAVA_TOOL_OPTIONS | head -1)"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}"
add "ANDROID_HOME" "$SDK"
for p in platforms build-tools ndk cmake; do add "SDK $p" "$(ls "$SDK/$p" 2>/dev/null | paste -sd, -)"; done
add "Node" "$(node -v 2>/dev/null)"
add "npm" "$(npm -v 2>/dev/null)"
add "Expo SDK (pacote)" "$(node -p "require('expo/package.json').version" 2>/dev/null)"
add "React Native" "$(node -p "require('react-native/package.json').version" 2>/dev/null)"
add "App" "$(node -p "const e=require('./app.json').expo; e.name+' '+e.version+' — versionCode '+e.android.versionCode+' — '+e.android.package")"
DIRTY=$([ -n "$(git status --porcelain)" ] && echo " (com alterações não commitadas!)")
add "Git" "$(git rev-parse --abbrev-ref HEAD) @ $(git rev-parse --short HEAD)$DIRTY"
[ -f android/gradle/wrapper/gradle-wrapper.properties ] && add "Gradle wrapper" "$(grep distributionUrl android/gradle/wrapper/gradle-wrapper.properties | sed 's|.*distributions/||')"
[ -f android/gradle.properties ] && add "org.gradle.jvmargs" "$(grep '^org.gradle.jvmargs' android/gradle.properties | cut -d= -f2-)"
grep -qs '^WEATHERPRO_UPLOAD_STORE_FILE' "$HOME/.gradle/gradle.properties" && add "Chave de upload configurada" "sim" || add "Chave de upload configurada" "NÃO — release sai com chave de debug"
if [ -n "$ARTEFATO" ] && [ -f "$ARTEFATO" ]; then
  add "Artefato" "$ARTEFATO ($(du -h "$ARTEFATO" | cut -f1))"
  add "SHA-256 do arquivo" "$(sha256sum "$ARTEFATO" 2>/dev/null | cut -d' ' -f1 || shasum -a 256 "$ARTEFATO" | cut -d' ' -f1)"
  CERT=$(keytool -printcert -jarfile "$ARTEFATO" 2>/dev/null)
  add "Assinado por" "$(echo "$CERT" | grep -m1 -E '^(Owner|Proprietário):')"
  add "Certificado SHA-256" "$(echo "$CERT" | grep -m1 'SHA256:' | sed 's/.*SHA256: *//')"
fi
[ -f "$SAIDA" ] || printf '# Registro de builds locais\n\nGerado por scripts/registrar-ambiente-build.ps1 (ou .sh). Não contém senhas.\n' > "$SAIDA"
{ printf '\n## %s — %s%s\n\n| Item | Valor |\n|---|---|\n' "$(date '+%Y-%m-%d %H:%M')" "$(hostname)" "${OBS:+ — $OBS}"; printf '%s\n' "${LINHAS[@]}"; } >> "$SAIDA"
echo "Registrado em $SAIDA"
