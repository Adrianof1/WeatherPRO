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

## 2026-11-09 12:57 - THAISCRIS - primeiro registro (sem node_modules)

| Item | Valor |
|---|---|
| Windows | Microsoft Windows 11 Home Single Language 10.0.26300 (build 26300) |
| CPU | 11th Gen Intel(R) Core(TM) i3-1115G4 @ 3.00GHz - 4 threads |
| RAM | 7,7 GB |
| Disco livre (C:) | 11,4 GB |
| Android Studio | não instalado (build pelo SDK de linha de comando + Gradle) |
| JAVA_HOME | C:\dev\jdk17 |
| java -version | openjdk version "17.0.20.1" 2026-08-18 |
| java no PATH | não (Gradle usa o JAVA_HOME) |
| ANDROID_HOME | C:\dev\android-sdk |
| SDK platforms | android-34, android-35, android-36 |
| SDK build-tools | 34.0.0, 35.0.0, 36.0.0 |
| SDK ndk | 28.2.13676358 |
| SDK cmake | (não encontrado) |
| adb | Android Debug Bridge version 1.0.41 |
| Node | v24.12.0 |
| npm | 11.6.2 |
| Expo SDK (pacote) | (não encontrado) |
| React Native | (não encontrado) |
| App | WeatherPRO 3.0.0 - versionCode 1 - com.adrianoferreira.weatherpro |
| Git | ccr-81c633da-7iq8s0 @ 77b6900 (com alterações não commitadas!) |
| Chave de upload configurada | NÃO - release sai com chave de debug |
