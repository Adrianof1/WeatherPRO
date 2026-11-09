# Registro de builds locais

Gerado por `scripts/registrar-ambiente-build.ps1` (Windows) ou `scripts/registrar-ambiente-build.sh` (Linux/macOS).
Rode **antes** de cada build (ambiente) e **depois** com `-Artefato` (hash e certificado do AAB). Não contém senhas.

## 2026-10 — PC Windows do Adriano — registro retroativo (anotado à mão no PROJETO.md)

| Item | Valor |
|---|---|
| Sistema | Windows (versão não anotada) |
| JAVA_HOME | `C:\dev\jdk17` (JDK 17) |
| ANDROID_HOME | `C:\dev\android-sdk` |
| Android Studio | versão não anotada |
| Expo SDK / React Native | 54 / 0.81.5 |
| Arquiteturas | só `arm64-v8a` (`-PreactNativeArchitectures=arm64-v8a`) |
| Gradle | memória aumentada em `android/gradle.properties` (valor não anotado) |
| Tempo de build | 1ª ~20 min; seguintes 2 a 4 min |
| Assinatura | chave de **debug** (não serve para a Play Store) |
| Artefato | `app-release.apk` (testado em celular real) |

> Pendente: rodar o script no PC para completar as versões que faltam.
