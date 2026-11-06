# WeatherPRO — Lançamento na Play Store

Passo a passo do que falta para publicar. Itens marcados com 💻 já estão prontos no código; o resto depende de você
no Play Console, AdMob e RevenueCat.

## 0. Antes de tudo: regra das contas pessoais novas

Se a sua conta de desenvolvedor é **pessoal** e foi criada depois de nov/2023, o Google exige um **teste fechado
com pelo menos 12 testadores ativos por 14 dias seguidos** antes de liberar a produção. Comece o teste fechado o quanto
antes (amigos, colegas de ADS, grupos). Contas de organização (CNPJ) não têm essa regra.

## 1. Política de privacidade 💻

- Arquivo: `docs/privacidade.html`.
- Ative o GitHub Pages: repositório → Settings → Pages → *Deploy from a branch* → `main` / pasta `/docs`.
- URL final: `https://adrianof1.github.io/WeatherPRO/privacidade.html` (já usada no app em `src/config.js`, `LINKS.privacy`).
- Cole a mesma URL no Play Console → Política do app → Política de privacidade.
- O repositório precisa ser **público** para o Pages gratuito.

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

`eas.json` já está pronto para produção: gera **AAB**, incrementa o `versionCode` sozinho e envia para a faixa
**interna** como rascunho.

```bash
npm i -g eas-cli
eas login
eas env:create --name EXPO_PUBLIC_WEATHER_API_KEY --value SUA_CHAVE --environment production --visibility sensitive
eas env:create --name EXPO_PUBLIC_REVENUECAT_ANDROID_KEY --value goog_xxx --environment production
eas build -p android --profile production   # na 1ª vez, deixe o EAS gerar a keystore (responda "Yes")
```

- A keystore fica guardada no EAS. Baixe uma cópia (`eas credentials`) e guarde fora do PC. **Perder a chave =
  não conseguir atualizar o app.**
- No Play Console, aceite a **Assinatura de apps do Google Play** (padrão).
- O primeiro AAB precisa ser enviado **manualmente** no Play Console. Depois dá para usar `eas submit`
  (exige uma conta de serviço do Google Cloud com acesso ao Play Console).

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

**Imagens necessárias:**
- Ícone 512×512 PNG (use `assets/icon.png` redimensionado)
- Gráfico de destaque 1024×500
- Pelo menos 2 capturas do celular (recomendado 4 a 8): Clima, Previsão, Alertas, Alagamentos, Café

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
- **Acesso ao app:** "Todas as funcionalidades estão disponíveis sem acesso especial".
- **App de notícias / saúde / financeiro:** Não.
- **Permissão de localização:** só em primeiro plano, não precisa da declaração de localização em segundo plano.

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
