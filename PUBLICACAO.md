# WeatherPRO — Lançamento na Play Store

Passo a passo do que falta para publicar. Itens marcados com 💻 já estão prontos no código; o resto depende de você
no Play Console, AdMob e RevenueCat.

> Segue a ordem do guia genérico de publicação (projeto TOMEI, `guias/GUIA-PUBLICACAO-GOOGLE-PLAY.md`).
> Aqui ficam só as respostas específicas do WeatherPRO.

## Situação da publicação (guia §12) — conferido em 11/11/2026 (atualizado no mesmo dia)

**Veredito: ainda NÃO está pronto para enviar.** O código está pronto (trilhas T1+T2+T3, `targetSdk` 36, Billing
Library 8 via RevenueCat, permissões limpas), mas faltam itens que bloqueiam a build ou a Console.

**🚫 Bloqueiam a build de loja**
- [ ] **`.env` não existe no PC.** Sem `EXPO_PUBLIC_WEATHER_API_KEY`, o app instalado abre direto na tela de erro de
      chave. Criar a partir do `.env.example` antes do `prebuild`.
- [ ] **Chave de upload não criada** (`~/.gradle/gradle.properties` sem `WEATHERPRO_UPLOAD_*`). Sem ela o AAB sai com
      a chave de debug e a Play recusa.
- [ ] **Nome do app:** continua "WeatherPRO", que conflita com o app da DTN na Play (seção abaixo). Decidir antes das
      imagens e da ficha.

**🚫 Bloqueiam a Console**
- [ ] Política e Termos **fora do ar** (404): GitHub Pages não está ativado e os arquivos `docs/` só estão na branch
      `ccr-81c633da-7iq8s0`, não na `main`. Fazer o merge na `main` e ativar Pages (`main` / `docs`).
- [x] E-mail de contato `contato.voltz.si@gmail.com` na política e nos termos (use o mesmo como e-mail público
      na Console).
- [x] Capturas de tela prontas em `store/capturas/` (celular e tablet 7" 1080×1920, tablet 10" 1620×2880; 4 de
      cada). Geradas pela versão web com dados simulados: refazer se o nome mudar (`scripts/capturas/README.md`).
- [ ] **Conta pessoal** (decidido em 11/11/2026; CNPJ fica para depois, com conversão pelo guia §1.1). Consequências:
      **teste fechado obrigatório com 12+ testadores por 14 dias** antes da produção, e como o app é comerciante,
      endereço e telefone residenciais ficam públicos a partir de mar/2027 (converter para organização antes disso
      resolve). Falta concluir as verificações (guia §1–§2).

**⚠️ Antes do teste fechado/produção**
- [ ] `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` (sem ela a aba Café mostra "compras só funcionam na versão da loja").
- [ ] Produtos `cafe_premium` (não consumível) e `doacao_*` (consumíveis) no Play e no RevenueCat — só depois do
      1º AAB.
- [ ] AdMob: mensagens de consentimento publicadas e app vinculado à loja.
- [ ] `app-ads.txt` na raiz de um domínio (`adrianof1.github.io/app-ads.txt` dá 404).
- [ ] 🛑 Pacote `com.adrianoferreira.weatherpro` registrado (já circulou como APK com chave de debug).
- [ ] Testes da §M.7 (compra, pendente, restaurar, anúncios de teste, consentimento).

**🔧 Recomendado (não bloqueia)**
- [ ] `npx expo install --check`: `expo` 54.0.32 → 54.0.37, `expo-dev-client`, `expo-font` (patch) e
      `react-native-svg` 15.15.1 → 15.12.1 (versão esperada pelo SDK 54).
- [ ] PC com 7,7 GB de RAM e ~11 GB livres: o AAB com todas as arquiteturas é mais pesado que o APK só arm64. Liberar
      espaço (~20 GB) antes da 1ª build de loja.

**✅ Já pronto**
- Código das trilhas T1/T2/T3 conferido (tabela abaixo), pagamento pendente tratado.
- `targetSdk`/`compileSdk` 36, AAB configurado, `versionCode` 1, permissões não usadas bloqueadas.
- Plugin de assinatura (`plugins/withReleaseSigning.js`), script de registro do PC (testado no Windows).
- Política, Termos e `app-ads.txt` escritos; links dentro do app; ícone 512 e recurso gráfico 1024×500.
- Textos da ficha e respostas de Conteúdo do app (seções 4 e 5).

## ⚠️ Decidir antes: o nome "WeatherPRO" já existe na Play

Já existe o **"WeatherPro: Forecast & Radar"** (pacote `com.mg.android`, DTN Germany, antigo MeteoGroup), com mais
de 1 milhão de downloads e ainda ativo. Publicar com o mesmo nome arrisca recusa por **falsificação de
identidade/marca** e confunde a busca. Opções:

1. Nome novo na loja (e no app) com personalidade própria, ex.: "Chuvisco", "Alerta Chuva", "Céu Aberto". Pesquise
   cada um na Play e no INPI (busca.inpi.gov.br → Marcas, classe 9).
2. Manter "WeatherPRO" só como nome interno.

O **pacote** `com.adrianoferreira.weatherpro` 🔒 pode ficar: ele não aparece na loja e é seu. Se trocar o nome,
mude `expo.name` no `app.json`, os textos da seção 4 e regenere `store/recurso-grafico-1024x500.png`.

## Tipo de conta

App de clima **não** está nas categorias restritas (finanças, saúde/medicina, VPN, governo): **conta pessoal serve**.
Grátis 🔒 (tem compras no app; grátis nunca vira pago).

**Status de comerciante:** o app tem anúncios e compras → **comerciante**. Exige link de Termos de Serviço
(💻 `docs/termos.html`) e, em conta pessoal, deixa telefone e endereço públicos (a partir de mar/2027).

### CNPJ: app remunerado, empresa ainda em abertura

O WeatherPRO é **remunerado** (anúncios + café + doações). Enquanto o CNPJ não sai, dá para seguir de dois jeitos
(detalhes no guia §1.2):

| | Esperar o CNPJ e abrir conta de **organização** | Publicar já como **pessoa física** e converter depois |
|---|---|---|
| Teste fechado 12 × 14 dias | Não precisa | Precisa |
| Endereço/telefone na loja (comerciante) | Da empresa | **Residencial** (público a partir de mar/2027) |
| Tempo | CNPJ + D-U-N-S (dias a semanas) | Imediato |
| Depois | — | Converter (guia §1.1); o app continua o mesmo |

Recomendação: **se o CNPJ sair em até ~1 mês, espere e abra como organização**. Nesse meio-tempo dá para fazer a
build, as imagens, o Pages e o AdMob. Confira com o contador se a atividade cabe no MEI ou precisa de ME, e peça o
D-U-N-S assim que tiver o CNPJ.

## 0. Regra das contas pessoais novas

Se a sua conta de desenvolvedor é **pessoal** e foi criada depois de nov/2023, o Google exige um **teste fechado
com pelo menos 12 testadores ativos por 14 dias seguidos** antes de liberar a produção. Comece o teste fechado o quanto
antes (amigos, colegas de ADS, grupos). Contas de organização (CNPJ) não têm essa regra.

## 1. Política de privacidade 💻

- Arquivo: `docs/privacidade.html`.
- Ative o GitHub Pages: repositório → Settings → Pages → *Deploy from a branch* → `main` / pasta `/docs`.
- URL final: `https://adrianof1.github.io/WeatherPRO/privacidade.html` (já usada no app em `src/config.js`, `LINKS.privacy`).
- Cole a mesma URL no Play Console → Política do app → Política de privacidade.
- Termos de uso: `https://adrianof1.github.io/WeatherPRO/termos.html` (link na aba Café, `LINKS.terms`).
- O repositório precisa ser **público** para o Pages gratuito.
- Troque `SEU_EMAIL_DE_CONTATO` nos dois arquivos pelo e-mail público do desenvolvedor.
- Teste as duas URLs numa aba anônima no celular antes de colar na Console.

## 2. Anúncios (AdMob)

- 💻 Consentimento UMP já roda na abertura. Se o usuário estiver em região que exige, aparece
  "Privacidade dos anúncios" no rodapé da tela de clima (exigência do Google).
- [ ] AdMob → **Privacidade e mensagens** → crie a mensagem **GDPR** (e a de **estados dos EUA**) e publique. Sem
  isso o formulário falha com "no form configured".
- [ ] AdMob → Apps → WeatherPRO → **vincular à loja** depois que o app estiver no Play (mesmo em teste). Os
  `internal-error`/`no fill` do banner geralmente somem depois disso e de 24 a 48h.
- [ ] **app-ads.txt** 💻 (`docs/app-ads.txt`): o Google lê esse arquivo na **raiz** do domínio do site de
  desenvolvedor informado na loja. O Pages de projeto (`/WeatherPRO/`) não é raiz. Opções:
  1. Criar o repositório `Adrianof1.github.io`, colocar o `app-ads.txt` nele e informar
     `https://adrianof1.github.io` como site na ficha da loja; ou
  2. Usar um domínio próprio.
- Política do AdMob: não clique nos próprios anúncios. Para testar, use build de desenvolvimento (IDs de teste) ou
  cadastre seu aparelho como dispositivo de teste no AdMob.

## 3. Assinatura e AAB 💻

**Permissões finais** (conferidas no manifesto gerado pelo prebuild): localização fina e aproximada, internet,
vibração, mais `ACCESS_NETWORK_STATE`, `WAKE_LOCK` e `AD_ID` das bibliotecas de anúncio/compra. O Expo adicionava
`READ/WRITE_EXTERNAL_STORAGE` e `SYSTEM_ALERT_WINDOW`, que o app não usa; agora estão em
`android.blockedPermissions` no `app.json`.

### Build local (Android Studio no PC) — caminho principal

**🛑 Antes de cada build de loja, registre o PC** (guia §3.0). Na raiz do projeto, no PowerShell:

```powershell
.\scripts\registrar-ambiente-build.ps1 -Observacao "antes da build 3.1.0"
```

O script grava Windows, Android Studio, JDK, SDK/NDK, Node, Expo, Gradle, commit e se a chave está configurada em
`docs/REGISTRO-BUILDS.md`. Commite esse arquivo junto com a versão.

**1. Chave de upload (uma vez só) 🔒**

```powershell
mkdir C:\dev\keys
keytool -genkeypair -v -keystore C:\dev\keys\weatherpro-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Faça backup do `.jks` e da senha em 2 lugares (gerenciador de senhas + pendrive). Depois crie ou edite
`C:\Users\<você>\.gradle\gradle.properties` (fora do projeto, nunca no Git):

```properties
WEATHERPRO_UPLOAD_STORE_FILE=C:/dev/keys/weatherpro-upload.jks
WEATHERPRO_UPLOAD_STORE_PASSWORD=sua_senha
WEATHERPRO_UPLOAD_KEY_ALIAS=upload
WEATHERPRO_UPLOAD_KEY_PASSWORD=sua_senha
```

💻 O plugin `plugins/withReleaseSigning.js` lê essas propriedades em todo `prebuild`, então a assinatura não se perde
quando a pasta `android/` é recriada. Sem elas, a release sai com a chave de debug e o Gradle avisa.

**2. Gerar o AAB**

```powershell
npm ci
npx expo prebuild --platform android --clean
cd android
.\gradlew bundleRelease
# AAB: android\app\build\outputs\bundle\release\app-release.aab
```

- Para a **loja**, não use `-PreactNativeArchitectures=arm64-v8a`: o AAB precisa de todas as arquiteturas. Esse
  atalho continua bom para APK de teste rápido (`assembleRelease`).
- `prebuild --clean` apaga o ajuste de memória em `android\gradle.properties`. Se faltar memória, ponha
  `org.gradle.jvmargs=-Xmx4g -XX:MaxMetaspaceSize=1g` no seu `~\.gradle\gradle.properties`, que vale para todos os
  projetos.
- A cada envio, **aumente `expo.android.versionCode`** no `app.json` (1, 2, 3…). O `autoIncrement` do `eas.json` só
  vale para build na nuvem.

**3. Registrar o artefato**

```powershell
cd ..
.\scripts\registrar-ambiente-build.ps1 -Artefato android\app\build\outputs\bundle\release\app-release.aab -Observacao "3.1.0 (versionCode 1) teste interno"
```

Confira no registro: "Assinado por" **não** pode ser `Android Debug`, e o certificado SHA-256 deve ser o mesmo em
todas as versões.

- No Play Console, aceite a **Assinatura de apps do Google Play** (padrão).
- 🛑 Depois de criar o app, confira se o pacote `com.adrianoferreira.weatherpro` aparece como **registrado**
  (verificação de desenvolvedor Android, obrigatória no Brasil desde 30/09/2026). Esse pacote já foi instalado como
  APK de teste assinado com a chave de debug. Se a Console pedir prova de posse, siga o fluxo manual e anote aqui o
  que aconteceu.

### Build na nuvem (EAS) — alternativa

`eas.json` está pronto (AAB, `versionCode` automático, envio para o teste interno). Use `eas build -p android
--profile production` e as variáveis com `eas env:create` (ver README). Se usar EAS, a chave fica guardada lá: não
misture com a chave local sem planejar, porque todas as versões precisam da mesma chave de upload.

## 4. Ficha da loja (textos prontos)

**Nome (até 30):** `WeatherPRO: Clima e Alertas`

**Descrição curta (até 80):**
`Previsão do tempo, alertas de chuva forte e pontos de alagamento na sua cidade.`

**Descrição completa:**

```
O WeatherPRO mostra o clima da sua cidade de forma rápida e bonita, com alertas para você não ser pego de surpresa.

☀️ CLIMA AGORA
Temperatura, sensação térmica, umidade, vento, pressão, visibilidade, nascer e pôr do sol.

🕒 PREVISÃO
Previsão por hora e para os próximos 5 dias, com chance de chuva, sempre no fuso da cidade.

⚠️ ALERTAS
Avisos de chuva forte, tempestade, ventania, calor e frio intensos, calculados a partir da previsão.

🌊 PONTOS DE ALAGAMENTO
Locais com histórico de alagamento em capitais brasileiras, com nível de risco e atalho para o mapa.
(Dados históricos e aproximados. Em emergência, ligue para a Defesa Civil: 199.)

📍 GPS OU BUSCA
Use sua localização ou busque qualquer cidade do mundo.

📶 MODO OFFLINE
Sem internet? O app mostra o último dado salvo.

☕ PREMIUM
Pague um café (pagamento único) ou faça uma doação para remover os anúncios, liberar 48h de previsão
por hora e salvar até 10 cidades favoritas.

Dados meteorológicos: OpenWeather.
```

**Categoria:** Clima · **Tags:** previsão do tempo, chuva, alertas

**Imagens:**

| Item | Tamanho | Status |
|---|---|---|
| Ícone | 512×512 PNG, sem transparência | 💻 `store/icone-512.png` |
| Recurso gráfico | 1024×500, sem transparência | 💻 `store/recurso-grafico-1024x500.png` |
| Capturas do celular | 2 a 8, **exatamente 9:16** (ex.: 1080×1920) | Falta. ⚠️ Print direto de celular 20:9 é recusado: recorte para 9:16 |
| Capturas de tablet 7" | até 8, 9:16, ex.: 1080×1920 | Falta. ⚠️ Obrigatórias, porque o app roda em tablets |
| Capturas de tablet 10" | até 8, 9:16, lados 1080–7680, ex.: 1620×2880 | Falta. ⚠️ Obrigatórias pelo mesmo motivo |

Sugestão: telas reais (Clima, Previsão, Alertas, Alagamentos, Café) dentro de uma moldura com fundo da marca e uma
frase curta, renderizada no tamanho exato. Só frases de funções que existem na versão enviada.

## 5. Formulários do Play Console (Política do app)

**Segurança dos dados** (respostas para o app como está hoje):

| Pergunta | Resposta |
|---|---|
| Coleta ou compartilha dados? | Sim |
| Dados criptografados em trânsito? | Sim |
| Usuário pode pedir exclusão? | Não há conta; dados ficam no aparelho (explique na política) |
| Localização aproximada e precisa | Coletada · Funcionalidade do app · Opcional · Não compartilhada* |
| IDs do dispositivo (ID de publicidade) | Coletado e compartilhado · Publicidade, análise, prevenção de fraude (AdMob) |
| Histórico de compras | Coletado · Funcionalidade do app (RevenueCat/Google Play) |
| Diagnóstico / interações | Coletado pelo SDK do AdMob · Publicidade, análise |

\* Envio para prestador de serviço (OpenWeather) não conta como "compartilhamento" pela definição do Google.
Confira a página "Data disclosure" do AdMob e do RevenueCat se o formulário mudar.

**Outros:**
- **Anúncios:** "Sim, meu app contém anúncios".
- **ID de publicidade:** "Sim" → finalidade: publicidade/marketing. (A permissão `AD_ID` vem da biblioteca de anúncios.)
- **Classificação indicativa (IARC):** categoria "Utilitário" → responde "não" a violência, sexo etc. → Livre.
- **Público-alvo:** 18+ (ou 13+). **Não** marque crianças: com crianças entra a política "Famílias" e o AdMob
  precisa de configuração especial.
- **Detalhes do login (Acesso ao app):** "Não" / "Todas as funcionalidades estão disponíveis sem acesso especial".
- **App de notícias / saúde / financeiro / governo:** Não. (Compra no app não conta como recurso financeiro.)
- **Classificação (IARC):** responda "sim" para compras digitais e anúncios; "não" para compartilhar localização
  com outros usuários.
- **Permissão de localização:** só em primeiro plano, não precisa da declaração de localização em segundo plano.

## Modelo de negócio: trilhas T1 + T2 + T3 (guia §M)

Conferência do app contra os checklists "No código" do guia:

| Trilha | Item | WeatherPRO |
|---|---|---|
| T1 Anúncios | Consentimento UMP antes de inicializar | ✅ `src/services/ads.js` |
| | Botão "Privacidade dos anúncios" quando exigido | ✅ rodapé da tela de clima |
| | IDs de teste em desenvolvimento | ✅ `__DEV__` usa `TestIds` |
| | Tela cheia só em pausa natural, com intervalo | ✅ a cada 3 buscas, mínimo 3 min, nunca na abertura |
| | Quem pagou não vê anúncios | ✅ SDK não inicia para Premium; banner e tela cheia checam `isPremium` |
| | Funciona sem anúncio | ✅ |
| T2 Compra no app | `cafe_premium` (único) | ✅ código · ⬜ criar no Play e RevenueCat |
| | Preço lido da loja | ✅ `priceString` |
| | Pendente (boleto) tratado | ✅ corrigido em 09/11: avisa que o Premium chega quando o pagamento confirmar |
| | Acknowledge em 3 dias | ✅ feito pelo RevenueCat |
| | Restaurar compras + Premium offline | ✅ |
| | Bloqueio num só lugar | ✅ `PremiumContext` (`isPremium`) |
| T3 Doações | `doacao_5/10/20/50/100` consumíveis, valores fixos | ✅ código · ⬜ criar no Play |
| | Benefício dito antes da compra | ✅ "também remove os anúncios" |
| | Sem PIX/link externo | ✅ |

⚠️ **RevenueCat:** no painel, marque `cafe_premium` como **não consumível** (Product type) e as doações como
consumíveis. Se o café for consumido, o direito pode sumir ao reinstalar. Confira o nome exato da opção no painel.

Possível no futuro: anúncio recompensado (ex.: ver um anúncio para liberar 48h de previsão por um dia).

## 6. Compras (RevenueCat)

Ver README → "Configurar as compras". Os produtos só podem ser criados **depois** de enviar um AAB com a
biblioteca de faturamento (o primeiro build de produção já tem).

## 7. Ordem sugerida

1. Ativar o GitHub Pages (privacidade).
2. `eas build --profile production` → criar o app no Play Console → enviar o AAB no **teste interno**.
3. Criar os produtos no Play e ligar o RevenueCat. Testar compra com conta de teste de licença.
4. Vincular o app no AdMob e publicar as mensagens de consentimento.
5. Preencher ficha, segurança dos dados e classificação.
6. **Teste fechado** com 12+ testadores por 14 dias (se conta pessoal).
7. Pedir acesso à produção e lançar (comece com lançamento gradual de 20%).
