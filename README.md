# 🌦️ WeatherPRO v3.0

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

## Chaves na build (EAS)

O EAS não lê o `.env` (ele está no `.gitignore`). Crie as variáveis na nuvem:

```bash
eas env:create --name EXPO_PUBLIC_WEATHER_API_KEY --value SUA_CHAVE --environment production --visibility sensitive
eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_xxx --environment production
```

(repita para `preview` e `development`). Variáveis `EXPO_PUBLIC_*` ficam no app instalado; restrinja a chave do
OpenWeather no painel deles.

## Build

```bash
npm run build:test   # APK de teste
npm run build:prod   # AAB para a Play Store
```

---

Desenvolvido por [Adriano Ferreira de Oliveira](https://linkedin.com/in/adrianoferreira-dev)
