# WeatherPRO — Acompanhamento do projeto

Última atualização: 06/11/2026 · Versão do app: 3.0.0 · Pacote Android: `com.adrianoferreira.weatherpro`

## 1. Estado atual

App Expo SDK 54 / React Native 0.81 que roda no Android. Foi testado em um celular real (build de release, arm64).
Clima, busca, alertas e alagamentos funcionam com dados reais da OpenWeather. **Compras ainda não funcionam**
(faltam configurações externas, ver seção 4). Anúncios estão integrados, mas ainda não exibem.

## 2. O que foi feito

### Análise e correção de bugs
- `.env.example` tinha uma chave real da OpenWeather. Foi trocado por placeholders. A chave nunca entrou no histórico do git.
- Ordenação dos alertas colocava os extremos por último (`|| 3` tratava 0 como falso). Corrigido com `??`.
- Previsão diária agora agrupa por dia local da cidade e calcula mínima e máxima reais. Antes pegava só o bloco das 12h em UTC.
- Horários (nascer e pôr do sol, alertas, previsão) usam o fuso da cidade buscada.
- Detecção de noite usa `endsWith('n')`.
- Alertas de temperatura só disparam se a API informou o valor (antes `0` virava "frio intenso").
- Pontos de alagamento são casados pelo nome exato da cidade. Antes "Rio" casava com "Rio de Janeiro".
- `sanitizeInput` aceita apóstrofo e ponto (`Sant'Ana`, `St. Louis`).
- Falha de rede não mostra mais dados falsos de Teresina. Mostra o último dado salvo com aviso de offline, ou uma tela de erro.
- Atualizar (refresh) mantém a cidade buscada em vez de voltar ao GPS.
- Vibração só dispara para alerta extremo novo.
- Nome da cidade vinha do bairro (`São Paulo` aparecia como `Liberdade`). Agora usa o nome do geocoding.
- Corrigido erro com `null` no geocoding reverso, que derrubava todas as buscas e aparecia como "sem conexão".
- Visual: selo "PRO" quebrado, ícone de pressão com "?", máxima e mínima iguais, menu do Android cobrindo o fim da lista.
- Removidos `Appbackup.jsxd` e o WhatsApp pessoal do rodapé. Removido `NSUserTrackingUsageDescription`, que não era usado.

### Refatoração
`App.js` tinha 1300 linhas. Agora é dividido em `src/` (config, data, services, hooks, context, screens, components).

### Anúncios (AdMob)
- O SDK nunca era inicializado, esse era o motivo de não funcionar. Agora há inicialização com formulário de consentimento UMP/LGPD.
- Banner nas telas e interstitial a cada 3 buscas, com intervalo mínimo de 3 minutos.
- Usuários premium não veem anúncio. Em desenvolvimento usa os IDs de teste.

### Café, doações e Premium (RevenueCat)
- `cafe_premium`: pagamento único, remove anúncios e libera o Premium.
- `doacao_5/10/20/50/100`: doações consumíveis, que também liberam o Premium.
- Premium: sem anúncios, previsão de 48h (grátis 24h) e até 10 cidades favoritas.
- Aba "Café" com preços da loja e "Restaurar compras". O estado premium fica salvo para abrir sem anúncios offline.

### Build e testes
- Build local de release pelo Gradle (`android/`), só arm64, em cerca de 2 a 4 minutos depois do primeiro (primeiro levou 20 min).
- Memória do Gradle aumentada em `android/gradle.properties` (a pasta `android/` não vai para o git).
- Testado no celular: 4 abas, busca em 10 cidades (inclusive fora do Brasil e uma inexistente) e aba de alagamentos das 8 cidades.
- Coordenadas dos pontos de alagamento validadas contra o OpenStreetMap (ver seção 5).

## 3. Como rodar e gerar o APK

```bash
npm install
cp .env.example .env            # preencha as chaves
npx expo prebuild --platform android --no-install
cd android
./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a -x lint
# APK: android/app/build/outputs/apk/release/app-release.apk
adb install -r app/build/outputs/apk/release/app-release.apk
```

Ambiente usado: `ANDROID_HOME=C:\dev\android-sdk`, JDK 17 (`C:\dev\jdk17`). Anúncios e compras não funcionam no Expo Go.

### v3.1 (preparação para a loja)
- Permissão `VIBRATE` adicionada. Sem ela, a vibração do alerta extremo podia derrubar o app no Android.
- Link da política de privacidade no rodapé e na aba Café, e botão "Privacidade dos anúncios" quando o UMP exigir.
- Nome da cidade em português e, no GPS, o nome do geocoding em vez do bairro (também ao atualizar uma cidade buscada).
- `eas.json` de produção gera AAB, incrementa o `versionCode` e envia para o teste interno.

## 4. O que ainda falta fazer

### Para as compras funcionarem (dependem de você)
- [ ] Criar no Play Console os produtos `cafe_premium` (não consumível) e `doacao_5`, `doacao_10`, `doacao_20`, `doacao_50`, `doacao_100` (consumíveis).
- [ ] Criar a conta no RevenueCat, conectar o Play Console e colocar a chave pública em `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`.
- [ ] Cadastrar seu e-mail como testador de licença e testar por teste interno.
- [ ] Testar o fluxo completo: comprar café, ver os anúncios sumirem, reinstalar e "Restaurar compras".

### Anúncios
- [ ] Criar a mensagem de consentimento no AdMob (Privacidade e mensagens). Hoje falha com "no form configured".
- [ ] Banner falha com `internal-error`. Aguardar as unidades novas começarem a servir e conferir o vínculo do app com a loja no AdMob.
- [ ] Para iOS: criar um app iOS separado no AdMob. Hoje o `app.json` usa o mesmo ID nas duas plataformas.
- [ ] Publicar `app-ads.txt` (pronto em `docs/app-ads.txt`) na raiz do site do desenvolvedor. Ver `PUBLICACAO.md`.

### Alagamentos (dados)
- [ ] Corrigir as coordenadas dos pontos que caem em outro bairro (Teresina: Av. Raul Lopes, Poti Velho, Buenos Aires, Santa Maria da Codipi; Rio: Praça da Bandeira, Av. Presidente Vargas; Salvador: Bairro da Paz; Manaus: São Jorge; BH: Av. Tereza Cristina; Fortaleza: Carlito Pamplona).
- [x] Trocar o botão "Ver no mapa" para buscar por nome e cidade (mais robusto que a coordenada).
- [ ] Substituir a lista fixa por uma fonte oficial (SGB/CPRM, Defesa Civil, CEMADEN) e citar a fonte.

### Publicação (passo a passo completo em `PUBLICACAO.md`)
- [ ] Gerar uma chave de assinatura própria. O APK atual usa a chave de debug, que não serve para a Play Store.
- [x] Escrever a política de privacidade (`docs/privacidade.html`). Falta ativar o GitHub Pages e colocar o e-mail de contato.
- [ ] Preencher a declaração de segurança de dados e a classificação indicativa no Play Console.
- [ ] Ícone, capturas de tela e descrição da loja.
- [ ] Gerar o AAB com `npm run build:prod` (ou local) e enviar para teste interno.

### Melhorias técnicas
- [ ] Testes automáticos para `alertEngine`, `weatherApi` e `purchases`.
- [x] Nome da cidade em português ("Lisboa" aparece como "Lisbon").
- [ ] Testar GPS depois de mudança de local, favoritos (precisa do Premium liberado) e alerta extremo com vibração.
- [ ] Restringir a chave da OpenWeather no painel deles (ela vai embutida no app).
- [ ] Mover chaves para o EAS (`eas env:create`) se for usar o build na nuvem.

## 5. Riscos e observações
- **Alagamentos:** os níveis de risco e descrições são editoriais, sem fonte oficial. Na validação com o OpenStreetMap, os 34 pontos caíram na cidade certa, mas cerca de 10 em bairro diferente do indicado. O app já exibe aviso de que não são dados oficiais nem em tempo real.
- **Valor livre de doação:** a Play Store não permite. Por isso as doações têm valores fixos.
- **Primeiro build do Gradle** demora cerca de 20 min. Os seguintes usam cache.
- **Erros inesperados** agora aparecem no `adb logcat` com o prefixo `[Clima]`.
