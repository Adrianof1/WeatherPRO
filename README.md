# 🌦️ WeatherPRO 1.0.1

App de previsão do tempo para Android e iOS (React Native + Expo SDK 54).

## Recursos

- Clima atual, previsão por hora (blocos de 3h) e dos próximos 5 dias, no fuso da cidade
- Alertas calculados (chuva forte, tempestade, vento, calor/frio) e pontos de alagamento de capitais
- GPS, busca por cidade, cache de 10 min e modo offline (mostra o último dado salvo)
- **Anúncios** AdMob (banner + tela cheia a cada 3 buscas, com consentimento UMP/LGPD)
- **Café / doações** (RevenueCat): remove anúncios e libera o Premium
- **Premium**: sem anúncios, previsão de 48h e até 10 cidades favoritas

## Estrutura

```
App.js                  estado geral, abas
src/config.js           chaves, limites e IDs dos produtos
src/services/           weatherApi, alertEngine, ads, purchases, cache
src/context/            PremiumContext (estado premium)
src/hooks/useWeather.js carregamento (GPS, busca, refresh, offline)
src/screens/            Weather, Alerts, Flood, Premium
```

## Rodar

```bash
npm install
cp .env.example .env     # preencha as chaves
npx expo start --dev-client
```

Anúncios e compras usam módulos nativos: **não funcionam no Expo Go**. Use uma development build
(`npm run build:dev`).

## Configurar as compras (uma vez)

1. **Google Play Console** → app → Monetizar → *Produtos no app*. Crie:
   - `cafe_premium` — produto **único (não consumível)**, ex.: R$ 9,90
   - `doacao_5`, `doacao_10`, `doacao_20`, `doacao_50`, `doacao_100` — produtos **consumíveis**, com o preço do nome
2. **RevenueCat** (revenuecat.com, plano gratuito): crie o projeto, adicione o app Android com o package
   `com.adrianoferreira.weatherpro`, conecte a conta de serviço do Google Play, importe os 6 produtos e copie a
   *public SDK key* para `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
3. Para testar, adicione seu e-mail em *License testing* no Play Console e instale a build por teste interno.

> O Google Play não permite valor livre em compra no app; por isso as doações têm valores fixos. Qualquer
> doação libera o Premium, assim como o café.

## Build para a Play Store (local, no PC com Android Studio)

Passo a passo completo em [`PUBLICACAO.md`](PUBLICACAO.md) §3. Resumo:

```powershell
.\scripts\registrar-ambiente-build.ps1 -Observacao "antes da build"   # registra o PC (obrigatório)
npm ci
npx expo prebuild --platform android --clean
cd android; .\gradlew bundleRelease; cd ..
.\scripts\registrar-ambiente-build.ps1 -Artefato android\app\build\outputs\bundle\release\app-release.aab
```

- A assinatura de release vem do plugin `plugins/withReleaseSigning.js`, que lê a chave de upload do
  `~/.gradle/gradle.properties` (fora do Git). Sem ela, a release sai com a chave de debug, que a Play recusa.
- O `.env` precisa existir no PC da build: as chaves `EXPO_PUBLIC_*` entram no app na hora do bundle.
- Aumente `expo.android.versionCode` no `app.json` a cada envio.
- O registro de cada build fica em [`docs/REGISTRO-BUILDS.md`](docs/REGISTRO-BUILDS.md).

## Documentação

| Arquivo | Para quê |
|---|---|
| [`PROJETO.md`](PROJETO.md) | Estado do projeto e o que falta |
| [`PUBLICACAO.md`](PUBLICACAO.md) | Respostas específicas do WeatherPRO para a Play Store |
| [`guias/GUIA-PUBLICACAO-GOOGLE-PLAY.md`](guias/GUIA-PUBLICACAO-GOOGLE-PLAY.md) | Guia genérico para gerar e publicar apps (trilhas de modelo de negócio, §M) |
| [`CLAUDE.md`](CLAUDE.md) | Regras para IA neste projeto |

Política de privacidade e termos: `voltzsi.com.br/weatherpro/privacidade.html` e `termos.html`.

## Chaves na build na nuvem (EAS, alternativa)

O EAS não lê o `.env` (ele está no `.gitignore`). Crie as variáveis na nuvem:

```bash
eas env:create --name EXPO_PUBLIC_WEATHER_API_KEY --value SUA_CHAVE --environment production --visibility sensitive
eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_xxx --environment production
```

(repita para `preview` e `development`). Variáveis `EXPO_PUBLIC_*` ficam no app instalado; restrinja a chave do
OpenWeather no painel deles.

## Build na nuvem (EAS, alternativa)

```bash
npm run build:test   # APK de teste
npm run build:prod   # AAB para a Play Store
```

⚠️ Não misture chave de upload do EAS com a chave local: todas as versões na Play precisam da mesma chave.

---

Desenvolvido por [Adriano Ferreira de Oliveira](https://linkedin.com/in/adrianoferreira-dev)
