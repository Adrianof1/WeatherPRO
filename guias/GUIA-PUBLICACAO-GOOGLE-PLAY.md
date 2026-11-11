# Guia — Gerar e publicar um app Android na Google Play

Guia reutilizável. Copie este arquivo para a raiz ou `docs/` de qualquer projeto de app Android. Ele foi escrito a
partir da publicação real de um app (nov/2026) e serve para você seguir sozinho ou para qualquer IA te explicar o
passo a passo. Use-o **desde a geração do app**: o modelo de negócio (§M) define o que o código precisa ter antes de
chegar à loja.

> **Para a IA que estiver lendo:** siga as etapas na ordem, uma de cada vez. Antes de cada resposta na Console,
> confira no código do projeto o que o app realmente faz (permissões, SDKs, internet, login, anúncios, compras). As
> declarações precisam ser verdadeiras e coerentes entre si (Segurança dos dados × Política de Privacidade × Anúncios
> × Classificação). Peça ao usuário o texto ou print de cada tela antes de orientar. Regras da Google mudam: na
> dúvida, peça para abrir o "Saiba mais" da própria tela. Não é aconselhamento jurídico.
>
> **Sempre, em todo projeto:** (1) verifique e registre o PC da build local (§3.0); (2) verifique o registro do app,
> do nome e do pacote (§0.1); (3) antes de gerar o código, defina a trilha de modelo de negócio (§M: grátis, anúncios,
> compra no app, doações, assinatura ou pago) e implemente o checklist "No código" de cada trilha escolhida.

Legenda: 🔒 = decisão irreversível ou cara de mudar · ⚠️ = armadilha comum · ⏳ = pode levar horas/dias ·
🛑 = ponto de atenção obrigatório (verificar em todo app)

## 🔄 Guia vivo — regra de manutenção

Este guia é atualizado sempre que surgir algo novo na publicação de qualquer app: tela nova ou renomeada na Play
Console, política/prazo novo, recusa e o motivo, erro e a solução, atalho que funcionou. **Para a IA:** ao ajudar com
a Play Console, se aprender algo que não está aqui (ou que mudou), atualize este arquivo na mesma sessão:

- Texto genérico — sem nomes do app, e-mails, endereços ou outros dados pessoais.
- Na seção certa (ou em "Armadilhas e lições", §11).
- Uma linha no Histórico do guia (fim do arquivo) com data e o que mudou.

Vale para tudo: tamanhos e formatos de imagem (Anexo B), limites de texto, nomes de telas e menus, prazos,
formulários, recusas. Se algo aqui ficou errado/desatualizado, corrija e registre no histórico (não deixe a
informação antiga). Ao copiar o guia para outro projeto, copie também esta regra (e adicione-a ao
`CLAUDE.md`/instruções daquele projeto).

## Sumário

- [Mapa do caminho](#️-mapa-do-caminho-tudo-do-zero-à-loja)
- [0. Antes de começar](#0-antes-de-começar) · [0.1 🛑 Registro do app: nome, marca e pacote](#01--registro-do-app-nome-marca-e-pacote-ponto-de-atenção)
- [1. Criar a conta de desenvolvedor](#1-criar-a-conta-de-desenvolvedor) · [1.1 Converter pessoal → organização](#11-converter-a-conta-pessoal-em-organização) · [1.2 Abrir CNPJ para app remunerado](#12-abrir-cnpj-para-app-remunerado)
- [2. Concluir as verificações da conta](#2-concluir-as-verificações-da-conta)
- [3. Preparar o app para envio](#3-preparar-o-app-para-envio) · [3.0 🛑 Ambiente de build local](#30--ambiente-de-build-local-verificar-e-registrar-sempre)
- [4. Criar o app na Console](#4-criar-o-app-na-console)
- [5. Teste interno](#5-teste-interno)
- [6. Configurar o app — "Conteúdo do app"](#6-configurar-o-app--conteúdo-do-app)
- [7. Ficha da loja](#7-ficha-da-loja)
- [8. Teste fechado](#8-teste-fechado)
- [9. Acesso à produção e lançamento](#9-acesso-à-produção-e-lançamento)
- [10. Atualizações](#10-atualizações-cada-nova-versão)
- [11. Armadilhas e lições aprendidas](#11-armadilhas-e-lições-aprendidas)
- [M. Modelo de negócio: trilhas para gerar e publicar o app](#m-modelo-de-negócio-trilhas-para-gerar-e-publicar-o-app)
- [12. Modelo de acompanhamento](#12-modelo-de-acompanhamento-copiar-para-o-projeto)
- [Anexo A. Classificador pessoal × organização](#anexo-a-classificador-o-app-cabe-em-conta-pessoal-ou-precisa-de-organização)
- [Anexo B. Tabela-mestra de imagens e textos](#anexo-b-tabela-mestra-de-imagens-e-textos)

## 🗺️ Mapa do caminho: tudo, do zero à loja

Siga na ordem. Cada passo aponta para a seção com os detalhes.

| # | Passo | Onde | ⏳ |
|---|---|---|---|
| 0 | **Definir a trilha do modelo de negócio** (grátis, anúncios, compra no app, doações, assinatura, pago) antes de gerar o código | §M | — |
| 1 | Classificar o app: pessoal ou organização? | §0 e Anexo A | — |
| 2 | 🛑 Pesquisar o nome (Play + marcas, inclusive estrangeiros) e decidir o pacote 🔒 | §0.1 | — |
| 3 | Organização: CNPJ, D-U-N-S e site verificado | §0, §1, §1.2 | dias a semanas |
| 4 | Criar a conta e pagar US$ 25 | §1 | minutos |
| 5 | Verificar identidade, telefone, e-mails e status de comerciante | §2 | horas a dias |
| 6 | Implementar no código os checklists das trilhas escolhidas | §M.2 a §M.6 | — |
| 7 | 🛑 Registrar o PC da build local | §3.0 | — |
| 8 | No código: chave de upload com backup 🔒, versão, requisitos técnicos | §3 | — |
| 9 | Publicar a Política de Privacidade (URL pública + dentro do app) e, se comerciante, os Termos | §3.4 | — |
| 10 | Produzir as imagens nos tamanhos certos: ícone, recurso gráfico, capturas de celular e tablets | Anexo B, §7 | — |
| 11 | Criar o app na Console (nome, idioma, grátis/pago 🔒, pacote 🔒) e conferir o registro do pacote 🛑 | §4, §0.1 | minutos |
| 12 | Gerar o AAB assinado, registrar o build e enviar no teste interno | §3.0, §5 | ~1 h |
| 13 | Preencher Conteúdo do app (todas as declarações) e testar as compras/anúncios | §6, §M.7, §M.9 | — |
| 14 | Preencher a ficha da loja (textos + imagens do passo 10) | §7, Anexo B | — |
| 15 | Conta pessoal: teste fechado com ≥ 12 testadores × 14 dias | §8 | 14+ dias |
| 16 | Pedir acesso à produção e lançar (gradual) | §9 | ~7 dias de revisão |
| 17 | A cada versão nova: versionCode +1, registrar o build, notas, revisão | §10, §3.0 | horas a dias |
| 18 | Algo deu errado? Veja as armadilhas e registre o aprendizado aqui | §11 | — |

## 0. Antes de começar

### 🚦 Primeira decisão: conta pessoal ou de organização?

Responda antes de pagar a taxa. Errar aqui custa semanas (recusa, CNPJ, D-U-N-S, conversão).

O app é de algum destes tipos? (desde 31/08/2024, contas novas precisam ser de organização para eles)

- Serviços financeiros (banco, empréstimo, investimentos, carteira de criptomoedas…).
- Apps de saúde, como os de medicina e de pesquisa com pessoas. ⚠️ O Google classifica como médico também o
  lembrete/gerenciamento de medicamentos e adesão a tratamento — mesmo sem diagnóstico, cálculo de dose ou internet.
- Apps que usam `VpnService`.
- Apps governamentais (feitos por ou para órgãos públicos).

→ **Sim:** abra a conta como organização (CNPJ + D-U-N-S + site; §1). Com conta pessoal o app é recusado ("Violação
dos requisitos do Play Console"). → **Não:** conta pessoal serve (mas lembre do teste fechado obrigatório de 14 dias,
§8).

📋 Lista completa por tipo de app, com o roteiro para uma IA classificar o seu: Anexo A. Na dúvida, leia "Requisitos
do Play Console" e "Categorias de apps de saúde" na Central de Ajuda e confira com o que o app realmente faz.

| Item | Por quê |
|---|---|
| Conta Google dedicada ao desenvolvedor/empresa (ex.: `contato.suaempresa@gmail.com`) | O dono da Console; e-mail público na loja |
| Cartão internacional | Taxa única de US$ 25 |
| Documento oficial com foto + comprovante de residência recente (até ~3 meses, no seu nome) | Verificação de identidade. ⚠️ Comprovante antigo ou de outro nome é recusado |
| Celular Android real | Verificação de acesso a dispositivo e testes |
| Site/domínio (opcional, recomendado) | Hospedar a Política de Privacidade; dá para verificar pelo Google Search Console |
| Decidir pessoal × organização (acima e §1) | Muda exigências, o que fica público e quais tipos de app você pode publicar |
| Organização: CNPJ e número D-U-N-S ⏳ | O D-U-N-S é gratuito (Dun & Bradstreet), mas pode levar de dias a semanas — peça cedo |
| 🔒 Decidir o nome do pacote (`applicationId`), ex.: `br.com.suaempresa.nomedoapp` | Nunca pode ser trocado depois do 1º envio. Use o domínio invertido |
| 🛑 Verificar o registro do app (nome, marca e pacote) | Ver §0.1 |

### 0.1 🛑 Registro do app: nome, marca e pacote (ponto de atenção)

**Verificar em todo app novo, antes de investir em ícone, imagens e divulgação, e de novo antes do 1º envio.**
Registre o resultado (data, onde pesquisou, o que achou) no acompanhamento do projeto (§12).

**a) Nome e marca**

| Onde pesquisar | Como |
|---|---|
| Google Play | Nome exato, variações (com/sem espaço, "Pro", "Plus", acentos) e tradução em inglês. ⚠️ Um app **estrangeiro** grande com o mesmo nome também conta (risco de recusa por falsificação de identidade e de reclamação de marca) |
| App Store | Mesma busca (marcas costumam estar nas duas lojas) |
| INPI (busca.inpi.gov.br › Marcas) | Classe 9 (software) e a classe do assunto do app (ex.: 44 saúde, 42 serviços de TI, 36 finanças) |
| Domínio e redes | `.com.br`, `.com`, @ no Instagram/TikTok — ajuda a decidir se o nome é viável |

Outro app publicado ou marca registrada com o mesmo nome obriga a trocar — e quanto mais tarde, mais caro (ficha,
imagens, avaliações, divulgação). Palavras comuns são difíceis de registrar; nomes com personalidade ou marca mista
(nome + logo) são mais fáceis. Registrar a marca no INPI é opcional para publicar, mas protege o nome quando o app
der dinheiro (dá para pedir como pessoa física ou pelo CNPJ).

**b) Registro do pacote (verificação de desenvolvedor Android)**

Desde **30/09/2026**, no **Brasil** (e Indonésia, Singapura, Tailândia), apps instalados em aparelhos certificados
precisam estar **registrados** por um desenvolvedor verificado: identidade verificada + nome do pacote + chave de
assinatura. A expansão global está prevista para 2027.

- App novo criado na Play Console (a partir de 30/03/2026): o pacote é registrado automaticamente ao criar o app.
  Confira em Gerenciar conta (ou na tela que a Console indicar) se aparece como registrado.
- ⚠️ Se o pacote **já circulou** em aparelhos Android antes (ex.: APK de teste instalado por arquivo), a Console pode
  pedir prova de posse pelo fluxo manual: para pacote com instalações, enviar um APK assinado com a mesma chave.
  Por isso, desde o primeiro APK de teste, assine com a sua chave de upload, não com a de debug pública do template.
- Apps distribuídos fora da Play (site, APK direto) também precisam de registro para instalar normalmente no Brasil;
  sem registro, só por `adb` ou pelo fluxo avançado.
- Regras e telas mudam: confirme no blog oficial ("Android developer verification") e registre aqui o que mudou.

## 1. Criar a conta de desenvolvedor

`play.google.com/console` → escolher o tipo:

| | Pessoal | Organização |
|---|---|---|
| Exige | Documento pessoal | CNPJ + número D-U-N-S (gratuito, Dun & Bradstreet) + documentos da empresa + site |
| Nome exibido como responsável | Seu nome civil | Razão social |
| ⚠️ Teste fechado obrigatório (12 testadores × 14 dias) antes da produção | Sim (contas pessoais novas) | Não |
| Tipos restritos (finanças, saúde/medicina — inclui lembrete de remédio, VPN, governo) | ❌ Não pode publicar (conta nova) | ✅ Permitidos |
| App remunerado (comerciante) | Endereço e telefone **residenciais** ficam públicos (a partir de mar/2027) | Aparece o endereço da empresa |

Passos:

1. Escolher o tipo → perfil para pagamentos (nome civil + endereço — 🔒 o nome fica travado após verificar).
2. Questionário "Apps": nº de apps, se vai ganhar dinheiro, categorias. ⚠️ Marque só categorias reais. 🔒 Essa lista
   não aparece depois em Detalhes da conta para editar. Numa conta pessoal, marcar categorias restritas (ex.: "Apps
   de telessaúde ou medicina") gera recusa com a área "Developer Account" — e se o app é mesmo desse tipo, a conta
   precisa ser de organização.
3. Aceitar termos → pagar US$ 25.
4. ⏳ Receber e-mail de verificação de identidade.

### 1.1 Converter a conta pessoal em organização

Possível na própria Console, sem criar outra conta nem transferir os apps (o assistente da Console indicou este
caminho):

1. Gerenciar conta › Detalhes da conta › Sobre você.
2. Informar e verificar o site da organização (Google Search Console → pedido de verificação aprovado).
3. Alterar tipo de conta.
4. Criar ou selecionar um perfil para pagamentos empresarial com o D-U-N-S da empresa.
5. Preencher os dados da organização, concluir a verificação ⏳ e vincular o perfil.
6. Esperar ≥ 72 h antes de enviar nova versão para revisão.

Efeitos: deixa de exigir o teste fechado de 14 dias para contas pessoais, a loja passa a mostrar a razão social e os
tipos restritos ficam liberados. Revise o status de comerciante (o endereço exibido passa a ser o da empresa).

### 1.2 Abrir CNPJ para app remunerado

Para quem vai ganhar dinheiro com o app e ainda não tem empresa. Não é aconselhamento contábil: confirme com um
contador.

| Decisão | Notas |
|---|---|
| Esperar o CNPJ ou publicar já como pessoa física? | Se o CNPJ sai em poucas semanas, abrir a conta **direto como organização** evita o teste fechado de 14 dias e não expõe o endereço residencial. Se vai demorar, publique como pessoal e converta depois (§1.1) |
| Tipo de empresa | ⚠️ Atividades de desenvolvimento de software costumam **não** ser permitidas no MEI; o comum é ME no Simples Nacional. Confira a lista de ocupações do MEI vigente e o CNAE com o contador |
| CNAE | Ex.: desenvolvimento e licenciamento de programas, publicidade em meios digitais. O contador escolhe os códigos que cobrem anúncios e vendas digitais |
| D-U-N-S ⏳ | Gratuito; peça logo depois do CNPJ (dias a semanas) |
| Site + e-mail da empresa | Exigidos pela conta de organização; verifique o domínio no Google Search Console |
| Conta bancária PJ | Para o perfil de pagamentos empresarial (Play e AdMob) |
| Impostos | Receita da Play e do AdMob vem do exterior; o contador orienta a emissão de nota e o enquadramento. No AdMob, preencha as informações fiscais dos EUA (formulário W-8 da empresa) para evitar retenção maior |

## 2. Concluir as verificações da conta

Na página inicial aparece "Termine de configurar sua conta de desenvolvedor". Botão "Criar app" fica cinza até tudo
estar ok.

| # | Etapa | Onde | Dica |
|---|---|---|---|
| 2.1 | Verificar identidade ⏳ | Aviso azul › Mais detalhes | Dados idênticos ao documento. Recusa comum: comprovante de residência inválido/antigo → reenviar |
| 2.2 | Status de comerciante (lei EEE/Reino Unido) | Gerenciar conta › Detalhes da conta › Sobre você | Ver tabela abaixo |
| 2.3 | Verificar telefone de contato (SMS) | Detalhes da conta › Detalhes do contato | Só libera depois da identidade |
| 2.4 | E-mails de contato e do perfil público | Detalhes do contato | Precisam do "verificado" |
| 2.5 | Nome do desenvolvedor (público, até 50 caracteres) | Sobre você | Pode ser diferente do nome civil (ex.: marca). Revise a grafia! |
| 2.6 | Site (opcional) | Sobre você › Site | Verificar no Google Search Console e aprovar o pedido |
| 2.7 | 🛑 Verificação de desenvolvedor Android (nomes de pacote) | Gerenciar conta | Registrar o pacote se a Console pedir (§0.1 b) |

**Status de comerciante — como decidir**

- **Comerciante:** atividade com fins de negócio/lucro (app pago, compras, assinatura, anúncios, doações via
  faturamento da Play). Exige link de Termos de Serviço e autocertificação. ⚠️ Conta pessoal comerciante: telefone e
  endereço residencial ficam públicos para usuários de todos os países (a partir de mar/2027).
- **Não comerciante:** permitido a quem não distribui no EEE nem no Reino Unido (texto oficial da Google). Público:
  nome civil, e-mail e país.
- Pode mudar a qualquer momento. ⚠️ Declarar errado de propósito pode suspender a conta. Se for não comerciante,
  nunca marque países da Europa/Reino Unido na distribuição.
- Prazo: contas novas — imediatamente; demais — até 01/02/2027.

## 3. Preparar o app para envio

### 3.0 🛑 Ambiente de build local: verificar e registrar sempre

Quando o AAB é gerado no próprio PC (Android Studio/Gradle), **antes de cada build de loja** verifique a máquina e
**registre** a configuração. Motivos: reproduzir a build meses depois, descobrir por que uma versão saiu diferente,
trocar de PC sem perder a chave e provar qual chave assinou cada envio.

**Verificar antes de compilar**

| Item | Como conferir | Atenção |
|---|---|---|
| Sistema, RAM, disco livre | Configurações do sistema | Gradle + RN pedem ≥ 16 GB de RAM e ~20 GB livres |
| Android Studio | Help › About | Anote a versão; atualizações podem mudar AGP/JDK |
| JDK | `java -version`, `JAVA_HOME` | Use a versão que o projeto exige (RN/Expo atuais: JDK 17) |
| Android SDK | SDK Manager ou pasta `ANDROID_HOME` | Platform e build-tools no nível do `compileSdk`/`targetSdk` exigido pela Play no ano |
| NDK / CMake | SDK Manager › SDK Tools | Versão pedida pelo projeto (RN compila código nativo) |
| Gradle / AGP | `gradle-wrapper.properties`, `./gradlew --version` | Não atualize no meio de um lançamento |
| Node / npm / Expo / RN (projetos JS) | `node -v`, `npx expo --version` | Versões do `package-lock.json` (`npm ci`) |
| Flutter (projetos Flutter) | `flutter --version`, `flutter doctor -v` | Canal e versão |
| Chave de upload | Arquivo e propriedades de assinatura | Fora do Git, com backup em 2 lugares; senha só no gerenciador de senhas |
| Git | Branch e commit | ⚠️ Não gere build de loja com alterações não commitadas |
| Arquiteturas | `reactNativeArchitectures` / flags | Para teste rápido dá para usar só `arm64-v8a`; para a **loja**, gere o AAB com todas, senão aparelhos 32 bits ficam de fora |

**Registrar (depois de cada build de loja)**: data, PC, versões acima, `versionName`/`versionCode`, commit, caminho e
**SHA-256 do AAB**, e o **certificado SHA-256** de quem assinou (`keytool -printcert -jarfile app-release.aab`). Use
um script para não esquecer nada (modelos: `scripts/registrar-ambiente-build.ps1` para Windows e `.sh` para
Linux/macOS, gravando em `docs/REGISTRO-BUILDS.md`). Nunca registre senhas.

⚠️ **Expo/React Native com `prebuild`:** a pasta `android/` é recriada a cada `expo prebuild`, e ajustes manuais no
`build.gradle` (assinatura, memória) se perdem. Coloque a assinatura num config plugin que lê as credenciais do
`~/.gradle/gradle.properties` do usuário, e a memória do Gradle em `expo-build-properties` ou no próprio plugin.

### 3.1 Assinatura (chaves) 🔒

| Chave | Uso | Onde guardar |
|---|---|---|
| Upload key (`upload-keystore.jks`) | Assina o AAB que você envia | Nunca no Git. Backup em 2 lugares (gerenciador de senhas + pendrive). Senha junto |
| App signing key | Gerada e guardada pelo Google (Play App Signing — aceite o padrão) | No Google |
| Chave de debug/dev | Testes locais | Pode ser compartilhada entre máquinas do time |

Gerar a chave de upload:

```bash
keytool -genkeypair -v -keystore android/app/upload-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

(Em projetos Expo, gere fora de `android/`, ex.: `C:\dev\keys\`, porque essa pasta é recriada.)

⚠️ O app instalado pela Play é assinado pela chave do Google → não instala por cima de um APK instalado por
cabo/arquivo (e vice-versa). Para testar pela Play, desinstale o APK antes (faça backup dos dados de teste).

### 3.2 Versão

- `versionName` = o que o usuário vê (ex.: 0.9.0, 1.0.0).
- `versionCode` = número interno; cada envio precisa ser maior que todos os anteriores (mesmo os não publicados).
  Sugestão: MAJOR×10000 + MINOR×100 + PATCH (1.2.3 → 10203; 0.9.0 → 900).
- Flutter: `version: 1.0.0+10000` no `pubspec.yaml`. ⚠️ `--split-per-abi` soma 1000/2000 ao código dos APKs (normal;
  o AAB usa o valor do pubspec).
- Expo com build local: `expo.android.versionCode` no `app.json` (o `autoIncrement` do EAS só vale na nuvem).

### 3.3 Requisitos técnicos

- Formato AAB (Android App Bundle). Flutter: `flutter build appbundle --release`. Gradle: `./gradlew bundleRelease`.
- `targetSdk` no nível exigido pela Play no ano (a Console avisa).
- Remover permissões não usadas (manifest final). ⚠️ Frameworks adicionam permissões sozinhos (o Expo coloca
  armazenamento e `SYSTEM_ALERT_WINDOW`); confira o manifesto gerado e bloqueie as que sobram.
- Rodar análise e testes antes de cada build.
- Conferir quem assinou: `keytool -printcert -jarfile app-release.aab` (e anotar no registro, §3.0).

### 3.4 Política de Privacidade (obrigatória para TODO app)

Requisitos da Google:

- URL pública, https, sem login, sem bloqueio por país, página web (não PDF).
- Específica do app; diz o que coleta, por quê, com quem compartilha, retenção, direitos, contato.
- Também precisa estar acessível dentro do app (ex.: tela "Privacidade" ou link em Configurações/Sobre). ⚠️ Muitos
  esquecem.
- Coerente com a Segurança dos dados (§6.6).
- Teste a URL numa aba anônima no celular antes de colar. ⚠️ Sites SPA (React/Vite/Next) podem devolver a página
  inicial com status 200 para qualquer caminho — confira o título da página, não só se "abriu". Arquivos estáticos
  vão em `public/`.
- App comerciante (§2.2): publique também os **Termos de Uso** (compras, reembolso, limites de responsabilidade) e
  coloque o link no app.

## 4. Criar o app na Console

"Criar app":

| Campo | Dica |
|---|---|
| Nome do app (até 30) | Nome + palavra-chave (ex.: "MEUAPP! Lembrete de X"). 🛑 Já pesquisado (§0.1)? |
| Idioma padrão | Português (Brasil) |
| App ou jogo | App |
| Gratuito ou pago | 🔒 Grátis se houver compras no app/assinatura. Grátis nunca vira pago (§M.0, T5) |
| Declarações | Políticas, Play App Signing, exportação dos EUA (aceitar) |

O formulário pede o nome do pacote (até 150 caracteres) — digite exatamente o `applicationId` do app, tudo
minúsculo. 🔒 Não dá para trocar depois. (Em versões antigas da Console, o pacote era definido pelo primeiro AAB
enviado.) 🛑 Depois de criar, confira se o pacote aparece como registrado (§0.1 b).

O nome do app, ao contrário, pode ser trocado a qualquer momento (Ficha da loja); o pacote não precisa "combinar"
com o nome.

Categoria da loja (Aumentar número de usuários › Presença na loja › Configurações da loja): escolha a que descreve o
app. ⚠️ Trocar "Medicina" por "Saúde e fitness" não muda o tipo do app: o que vale para a regra de organização é o
que o app faz (declaração de saúde e cadastro da conta).

## 5. Teste interno

Rápido (minutos), até 100 testadores, sem revisão completa. Bom para o 1º envio.

1. Testar e lançar › Testes › Teste interno › aba Testadores › criar lista de e-mails (contas Google usadas na Play
   Store) + e-mail de feedback.
2. Criar nova versão → (aceitar chave gerada pelo Google) → enviar o `.aab` → nome da versão (só interno, ex.:
   `0.9.0 (900)`) → notas da versão:
   ```
   <pt-BR>
   Texto do que há de novo (até 500 caracteres)
   </pt-BR>
   ```
3. Próxima → Visualizar e confirmar (erros vermelhos bloqueiam; avisos amarelos em geral podem ser ignorados) →
   Salvar e publicar.
4. Aba Testadores → copiar link de participação → testadores aceitam o convite → baixam pela Play. ⏳ até ~1 h.
5. Enquanto o app não for revisado, aparece com nome temporário "pacote (unreviewed)" — normal.

## 6. Configurar o app — "Conteúdo do app"

Painel › "Termine de configurar seu app". Cada item: responder → Salvar. As mudanças se acumulam em Visão geral da
publicação e são enviadas juntas para revisão.

| # | Item | Como responder (pense no que o app faz hoje) |
|---|---|---|
| 6.1 | Política de Privacidade | URL pública (§3.4) |
| 6.2 | Detalhes do login (antigo "Acesso ao app") | Alguma parte é restrita (login, pagamento, PIN, biometria)? Se não → "Não". Se sim → forneça conta de teste e instruções (o revisor não cria contas nem paga) |
| 6.3 | Anúncios | Tem SDK de anúncios (AdMob etc.) ou banners próprios? Sim → etiqueta "Contém anúncios". ⚠️ Mentir pode suspender |
| 6.4 | Classificação de conteúdo (IARC) | Categoria: Jogo / Social / Todos os outros. Perguntas sobre violência, sexo, linguagem, conteúdo do usuário, conteúdo online, produtos com restrição de idade, localização, compras digitais. Refazer quando adicionar compras/anúncios |
| 6.5 | Público-alvo | Faixas etárias. Incluir menores de 13 → Política para Famílias (bem mais rígida). App adulto: só 18+. A opção "restringir menores" é opcional |
| 6.6 | Segurança dos dados | "Coletado" = sai do aparelho (para você ou terceiros, inclusive por SDKs). "Compartilhado" = vai para terceiros. Isenções: transferências iniciadas pelo usuário (ex.: ele mesmo compartilha um arquivo), processamento só no aparelho. Liste cada SDK e o que ele envia (Firebase, Analytics, Crashlytics, AdMob, RevenueCat…). Tem que bater com a Política de Privacidade |
| 6.7 | Apps governamentais | Normalmente Não |
| 6.8 | Recursos financeiros | Normalmente "não oferece" (assinatura/compra no app não conta como recurso financeiro) |
| 6.9 | Apps de saúde | Marque só e tudo o que o app faz. ⚠️ Nunca marque "dispositivo médico" ou "suporte à decisão clínica" se não for — atrai regulação (no Brasil, ANVISA). ⚠️ "Controle de medicamentos e tratamentos" (lembrete, adesão) é categoria médica → exige conta de organização (§0). E nunca desmarque o que o app faz para escapar da regra: declaração falsa pode suspender a conta inteira (todos os apps) |
| 6.10 | Declarações de permissões sensíveis (se aparecerem) | Tela cheia (`USE_FULL_SCREEN_INTENT`): a Play pergunta a funcionalidade principal (Despertador / Envio e recebimento de chamadas / Outro). Só despertador e chamadas ganham a permissão concedida na instalação. Se o app só usa um alarme (lembrete, agenda, remédio…), responda Outro — declarar "Despertador" sem ser o propósito principal é declaração imprecisa. Com "Outro", no Android 14+ o app precisa pedir a permissão ao usuário (`canUseFullScreenIntent()` → tela do sistema); sem ela, a notificação vira aviso flutuante (~60 s). Alarme exato: prefira `SCHEDULE_EXACT_ALARM` (usuário concede) a `USE_EXACT_ALARM` (restrita). Localização em 2º plano, SMS, contatos: formulários e vídeo |
| 6.11 | Categoria e contatos | Categoria da loja, tags (até 5), e-mail público (obrigatório), telefone (opcional — deixe vazio para não expor), site |
| 6.12 | Marketing externo | Pode deixar ligado (o Google divulga o app fora da Play, grátis) |
| 6.13 | ID de publicidade | App com SDK de anúncios/analytics usa o ID → "Sim" e finalidade (publicidade, análise). A permissão `AD_ID` costuma vir do SDK |

## 7. Ficha da loja

Painel › "Configurar a página Detalhes do app".

📐 Todos os tamanhos, formatos e limites em uma tabela só (inclusive ícones dentro do app, notificação, splash, TV,
Wear OS e Chromebook): Anexo B.

| Item | Especificação |
|---|---|
| Nome | até 30 caracteres |
| Descrição curta | até 80 |
| Descrição completa | até 4000. ⚠️ Só funções que existem na versão enviada (prometer o que não existe = rejeição por metadados enganosos). Sem nomes de concorrentes, sem marcas de terceiros, sem excesso de palavras-chave |
| Ícone | 512×512 PNG, quadrado cheio sem transparência (a Play arredonda) |
| Recurso gráfico (feature graphic) | 1024×500 PNG/JPG, sem transparência |
| Capturas de tela do celular | 2 a 8, PNG/JPEG até 8 MB, proporção exatamente 16:9 ou 9:16, lados entre 320 e 3840 px. Para promoção: ≥ 4 com ≥ 1080 px (ex.: 1080×1920). ⚠️ Celulares modernos têm tela 20:9 (ex.: 1220×2712) — o print direto é recusado; recorte para 9:16 ou gere as capturas (ver dica abaixo) |
| Capturas de tablet 7" | ⚠️ Aparecem obrigatórias (*) quando o app roda em tablets (padrão). Até 8; 9:16; lados 320–3840 px (ex.: 1080×1920 desenhado com ~600 dp de largura) |
| Capturas de tablet 10" | Obrigatórias nas mesmas condições; até 8; 9:16; lados 1080–7680 px (ex.: 1620×2880 com ~810 dp de largura) |
| Computador / Android XR | Opcionais (só se o app for distribuído nesses formatos) |
| Vídeo (opcional) | link do YouTube público ou não listado, sem anúncios e sem restrição de idade |

**Dica — capturas com moldura de marketing:** em vez da tela "crua", use fundo da marca + logo + uma frase curta de
benefício + a tela real dentro de um celular/tablet desenhado. Converte melhor na loja. Dá para gerar com uma página
HTML renderizada pelo Playwright/Chromium no tamanho exato (1080×1920; tablet 10" 1620×2880). Cuidados: título com
altura fixa (senão o celular encolhe quando o texto quebra em 2 linhas e as imagens ficam desiguais); frases só com
funções que existem na versão publicada; guarde as telas originais como fonte e regenere quando o nome ou a tela
mudar.

**Dica — gerar capturas sem celular (Expo/React Native):** exporte a versão web
(`npx expo export --platform web`), simule as respostas das APIs com `page.route` do Playwright (sem gastar chave
real nem precisar do `.env`) e tire as telas no tamanho exato (celular 360×640 com escala 3 = 1080×1920; tablet 10"
810×1440 com escala 2). Bibliotecas só nativas (anúncios, compras) quebram o bundle web: no `metro.config.js`,
resolva-as como `{ type: 'empty' }` só quando `platform === 'web'`. Escolha dados de exemplo que mostrem as funções
sem deixar a tela alarmante (ex.: tema de alerta vermelho como 1ª imagem) e deixe fora telas que na web aparecem
diferentes do celular (ex.: compras indisponíveis).

**Dica — gerar capturas sem celular (Flutter):** um teste temporário com `matchesGoldenFile` renderiza as telas reais
com dados de exemplo no tamanho exato (`tester.view.physicalSize` + `devicePixelRatio`). Cuidados: carregar fontes
reais com `FontLoader` (Roboto e MaterialIcons do cache do Flutter; uma fonte de emoji do sistema como fallback),
senão aparecem blocos; usar `debugDisableShadows = false` (senão sombras viram contornos pretos); textos com
`TextStyle` sem `fontFamily` caem na fonte de blocos do teste — prefira herdar do tema. Confira o tamanho final
(arredondamentos podem dar 1 px a mais) e apague o teste depois.

## 8. Teste fechado

Obrigatório para contas pessoais criadas após nov/2023 antes da produção. Contas de organização não precisam.

1. Testes › Teste fechado › criar faixa → Países/regiões (⚠️ coerente com o status de comerciante) → testadores
   (lista de e-mails ou Grupo Google).
2. Criar versão (pode reutilizar o AAB do interno ou enviar um novo com `versionCode` maior) → enviar para revisão ⏳.
3. ≥ 12 testadores inscritos por ≥ 14 dias seguidos. Recrute 20+ (alguns desistem). Peça para manterem o app
   instalado e usarem.
4. Não há como pular para conta pessoal. Sem 12 pessoas: (a) use o **teste interno** (sem revisão, até 100 pessoas —
   **não conta** para a produção) para já usar o app pela Play; (b) recrute em **grupos de troca de testes**
   (Facebook/Telegram "teste fechado 12 testadores", subreddit r/AndroidClosedTesting), além de família, amigos e
   colegas; (c) se houver CNPJ, uma **conta de organização** (D-U-N-S) dispensa a exigência (§1.1, §1.2).
   - ⚠️ Cada testador = pessoa real com conta Google própria. Contas falsas ou "testadores" comprados podem levar à
     **suspensão** (o Google avalia o engajamento e pergunta sobre o teste no pedido de produção).
5. Colete feedback (formulário/e-mail) e publique correções — a Google pergunta sobre isso.

- Teste **aberto** não conta para liberar produção (e, para contas pessoais novas, costuma só ficar disponível
  depois).
- App com compras (§M): use o teste fechado também para testar as compras com contas de **teste de licença**.

## 9. Acesso à produção e lançamento

1. Painel › **Solicitar acesso à produção** → questionário sobre o teste fechado (quem testou, feedback, mudanças
   feitas) ⏳ ~até 7 dias. (Conta de organização não passa por esse pedido.)
2. Produção › Países (ex.: só Brasil; ⚠️ coerente com o status de comerciante) › criar versão (pode usar **Adicionar
   da biblioteca** com o AAB já testado) › **lançamento gradual** (10–20% → 50% → 100%), acompanhando falhas e
   avaliações.
3. Depois: responder avaliações, acompanhar **Android Vitals** (falhas < 1,09%, ANR < 0,47%), pedir avaliação no app
   no momento certo (In-App Review API).
4. App com anúncios: vincular o app à loja no AdMob assim que a ficha estiver pública (§M.2).

## 10. Atualizações (cada nova versão)

A cada nova versão:

- [ ] `versionCode` maior; `versionName` novo; notas da versão
- [ ] 🛑 Registrar o ambiente de build e o AAB (§3.0) e conferir que o certificado SHA-256 de quem assinou é **o
      mesmo** das versões anteriores
- [ ] Mudou coleta de dados/SDK/internet? → **Segurança dos dados + Política de Privacidade** antes de enviar
- [ ] Entrou compra/assinatura/doação? → Classificação (compras digitais = Sim), Detalhes do login (acesso para o
      revisor), produtos em Monetizar, Termos de Uso (§M)
- [ ] Entraram anúncios? → Anúncios = Sim, Segurança dos dados (ID de publicidade), política de anúncios (nada na
      tela de bloqueio, sem intersticial inesperado) (§M.2)
- [ ] Nova permissão sensível? → declaração
- [ ] Ficha da loja descreve o que existe
- [ ] Lançamento gradual

## 11. Armadilhas e lições aprendidas

| Problema | Como evitar |
|---|---|
| Identidade recusada | Comprovante de residência **recente** e no nome do titular |
| `INSTALL_FAILED_UPDATE_INCOMPATIBLE` | Assinaturas diferentes. Use a mesma chave em todas as máquinas para testes; app da Play não instala sobre APK solto |
| Perder a chave de upload | Backup em 2 lugares desde o dia 1 |
| Reaproveitar a chave de outro app | Cada app tem a **sua** chave de upload; não use a de outro projeto que está no mesmo PC |
| Pacote errado | Conferir `applicationId` antes do 1º envio (🔒) |
| `versionCode` repetido | Sempre aumentar, mesmo após descartar um rascunho |
| Política "no ar" mas mostrando a home do site | Conferir o título da página; arquivos em `public/`; DNS do subdomínio configurado |
| Política e Segurança dos dados contraditórias | Escrever as duas juntas, a partir do código |
| Descrição promete função futura | Descrever só o que está na versão enviada |
| Comerciante com conta pessoal expõe endereço | Avaliar "não comerciante" (sem EEE/Reino Unido) ou conta de organização |
| Esquecer o link da política **dentro do app** | Tela "Privacidade/Termos" no app |
| Teste fechado com poucos testadores | Recrutar 20+ desde cedo |
| Build Gradle travado (Windows) | `cd android; .\gradlew --stop` e tentar de novo |
| Build sem memória em PC com pouca RAM | Fechar navegador; em `~/.gradle/gradle.properties` limitar `org.gradle.jvmargs` e `org.gradle.workers.max=1` |
| Print do celular recusado na ficha | Proporção 20:9 não é aceita; use 9:16 exato |
| Teste fechado com erros "não permite que os usuários existentes façam a atualização" + "não adiciona nem remove pacotes" | A versão está **sem pacote**: em "Criar versão" use **Adicionar da biblioteca** e escolha o AAB já enviado (o mesmo `versionCode` pode ir para várias faixas) |
| "É preciso informar se o app usa permissões de intent para tela cheia" | Só aparece ao lançar fora do teste interno. Conteúdo do app › **Intent para tela cheia** → funcionalidade principal: **Despertador** ou **Chamadas** só se for mesmo o propósito do app; senão **Outro** (e o app pede a permissão ao usuário) |
| Painel mostra "`pacote (unreviewed)`" | Normal até a 1ª revisão; testadores internos veem esse nome temporário |
| Ficha pede capturas de tablet | Gerar 7" e 10" (ou restringir dispositivos, se o app realmente não suportar tablet) |
| Compra "some" ou é reembolsada sozinha após 3 dias | Faltou confirmar (acknowledge) a compra (§M.3) |
| Usuário paga por boleto e o app diz "erro" | Tratar compra **pendente** (§M.3) |

Outras lições:

- Nome comum em inglês (ex.: "<Assunto>Pro") pode já pertencer a um app estrangeiro grande, com o mesmo nome exato
  e milhões de downloads. Pesquise a Play inteira, não só apps brasileiros (§0.1).
- Expo `prebuild` adiciona permissões que o app não usa (armazenamento, `SYSTEM_ALERT_WINDOW`) e recria `android/`,
  apagando a assinatura configurada à mão (§3.0, §3.3).
- Scripts `.ps1` com acentos ou travessão precisam ser salvos em **UTF-8 com BOM**. O Windows PowerShell 5.1 lê
  arquivo sem BOM como ANSI: o "—" vira `â€”`, cujo último byte é uma aspa curva que fecha a string, e o script
  inteiro dá erro de sintaxe ("Token inesperado"). No mesmo PowerShell 5.1, `$ErrorActionPreference =
  "SilentlyContinue"` descarta o stderr de programas externos (`java -version` escreve no stderr).
- No Windows, o JDK pode estar só no `JAVA_HOME` e fora do PATH: o Gradle funciona, mas `java` e `keytool` no
  terminal não. Chame `"$env:JAVA_HOME\bin\keytool.exe"` nos scripts.
- Builds locais de teste só para `arm64-v8a` são ótimas para velocidade, mas o AAB da loja deve incluir todas as
  arquiteturas (§3.0).

- Expo/RN com build local: variáveis `EXPO_PUBLIC_*` vêm do `.env` **do PC que compila**. Se ele não existir, a
  chave sai vazia no AAB sem erro de build; confira o `.env` no checklist do §3.0 antes de cada build de loja.
- Política de Privacidade no GitHub Pages: o Pages publica só a branch configurada (geralmente `main`). Arquivos em
  outra branch dão 404; teste a URL antes de colar na Console (§3.4).

## M. Modelo de negócio: trilhas para gerar e publicar o app

**Decida o modelo antes de gerar o código.** Cada trilha diz o que construir no app, o que criar na Console e quais
declarações mudam. As trilhas se combinam: o app segue todas as que escolher.

> **Para a IA que vai gerar o app:** antes de escrever código, pergunte ao usuário qual trilha (ou combinação) ele
> quer e registre a escolha no acompanhamento do projeto (§12). Implemente o bloco "No código" de cada trilha
> escolhida e confira as declarações pela tabela M.9. Se o modelo mudar depois, volte aqui: trocar de trilha mexe em
> código, Console, Política de Privacidade e Termos.

### M.0 Qual trilha?

| O app vai… | Trilha | 🔒 Decisão difícil de desfazer |
|---|---|---|
| Ser grátis, sem ganhar dinheiro | **T0 Grátis** | — |
| Mostrar anúncios | **T1 Anúncios** | — |
| Ser grátis e vender algo dentro dele (remover anúncios, Premium, recurso, créditos) | **T2 Grátis + compra no app** | Tipo de cada produto (único × consumível) |
| Receber doações / "pague um café" | **T3 Doações** | — |
| Cobrar mensalidade ou anuidade | **T4 Assinatura** | — |
| Cobrar para baixar | **T5 Pago** | 🔒 Grátis nunca vira pago; pago pode virar grátis |

Combinações comuns:

| Combinação | Para quem | Observação |
|---|---|---|
| T1 + T2 | App utilitário grátis | O clássico: anúncios + "remover anúncios / Premium" |
| T1 + T2 + T3 | App utilitário com comunidade | Doação também libera o Premium (sem anúncios) como agradecimento |
| T0/T1 + T4 | App com conteúdo ou serviço contínuo | Plano grátis limitado + assinatura |
| T5 (+ T2) | App de nicho, profissional | Pago + extras opcionais. ⚠️ Pago + anúncios gera avaliação ruim |

Valem para **todas** as trilhas que ganham dinheiro (T1 a T5):

- Status de **comerciante** (§2.2) e **Termos de Uso** publicados e com link no app (§3.4).
- **Perfil de pagamentos** com conta bancária (Play para T2–T5, AdMob para T1) e informações fiscais (§1.2).
- Política de Privacidade citando cada SDK de anúncio/compra.
- ⚠️ Pagamento de bens **digitais** (remover anúncios, Premium, doação ao desenvolvedor, créditos, assinatura) só pelo
  **Google Play Faturamento**. Link de PIX, vaquinha ou cartão dentro do app para isso pode remover o app. Exceções
  (produto físico, doação a instituição de caridade, programas de faturamento alternativo de alguns países) têm
  regras próprias: leia a Política de Pagamentos antes.
- Taxa da Play sobre T2–T5: 15% sobre o primeiro US$ 1 milhão por ano (assinaturas: 15%). Confira a tabela vigente e
  a inscrição no nível de 15% na Console; registre aqui se mudar.

### M.1 T0 — Grátis, sem monetização

- **No código:** nada específico. Política de Privacidade ainda é obrigatória.
- **Conta:** pode ser **não comerciante** se não distribuir no EEE nem no Reino Unido (§2.2).
- Para monetizar depois, siga a trilha nova inteira (não é só "ligar" anúncios).

### M.2 T1 — Anúncios

**No código (gerar o app):**

- [ ] SDK da rede (AdMob: `google_mobile_ads` no Flutter, `react-native-google-mobile-ads` no RN, Google Mobile Ads no
      nativo) + App ID no manifesto.
- [ ] **Consentimento antes de carregar anúncios** (UMP): pedir/atualizar o consentimento na abertura e só inicializar
      o SDK quando `canRequestAds` for verdadeiro.
- [ ] Botão **"Privacidade dos anúncios"** (configurações ou rodapé), visível quando o SDK indicar que é exigido.
- [ ] **IDs de teste** em desenvolvimento; IDs reais só na build de loja (variável de ambiente ou config).
- [ ] Banner em área própria, sem cobrir conteúdo nem encostar em botões.
- [ ] Tela cheia (interstitial) só em pausas naturais (ex.: a cada N ações), com intervalo mínimo; **nunca** ao
      abrir/fechar o app.
- [ ] Recompensado (rewarded), se usar: sempre opcional, com a recompensa explicada antes.
- [ ] Se combinar com T2/T3/T4: **não inicializar o SDK** para quem pagou (nem carregar banner escondido).
- [ ] Funcionar sem anúncio (sem internet, sem consentimento, rede sem estoque): nunca travar a tela esperando um.

**Na Console e na rede:**

- [ ] Conta AdMob, app criado e unidades de anúncio; vincular à loja depois do 1º envio ⏳ (24 a 48 h para anúncios
      reais).
- [ ] AdMob › Privacidade e mensagens: publicar as mensagens GDPR e de estados dos EUA.
- [ ] `app-ads.txt` na **raiz** do domínio informado como site na ficha (subpasta não vale).
- [ ] Declarações: Anúncios = Sim (§6.3), ID de publicidade = Sim (§6.13), Segurança dos dados com IDs do aparelho,
      interações e diagnóstico enviados pelo SDK (§6.6).

**⚠️ Anúncios minúsculos ou "quase imperceptíveis" para ganhar mais: não.** Parece esperto, mas é a forma mais
rápida de perder a conta AdMob:

- Formatos e tamanhos são definidos pela rede (banner mínimo 320×50; nativo com tamanho mínimo e selo "Anúncio").
  Encolher, esconder, deixar transparente ou cobrir um anúncio é proibido.
- Impressão que o usuário não consegue ver é tráfego inválido: a receita é descontada e a conta pode ser suspensa
  (o AdMob mede a visibilidade).
- Vários banners na mesma tela ou mais anúncios do que conteúdo violam a regra de densidade.
- Anúncio pequeno colado em botão gera clique acidental, também tratado como inválido.

O que aumenta a receita dentro das regras: um banner adaptativo ancorado (em vez de banner no meio do conteúdo, que
pode ser rolado para fora), anúncio **nativo** desenhado no estilo do app entre seções (com o selo "Anúncio"),
**premiado** opcional em troca de um benefício real, anúncio de **abertura do app** só a partir do 2º uso e com
limite, e mediação (outras redes competindo pelo mesmo espaço). Mais receita vem de mais uso, não de mais anúncios.

**Armadilhas:** clicar nos próprios anúncios bloqueia a conta AdMob; público com menores de 13 exige SDKs
certificados para famílias e anúncios não personalizados; anúncio na abertura do app é motivo comum de recusa.

### M.3 T2 — Grátis + compra no app (única ou consumível)

| Tipo de produto | Exemplo | Comportamento |
|---|---|---|
| Único (não consumível) | Remover anúncios, Premium vitalício, desbloquear recurso | Compra uma vez, vale para sempre, restaurável |
| Consumível | Créditos, moedas, pacotes | Pode comprar de novo; o app consome a compra |

🔒 O tipo de cada produto e o **ID** são definitivos: um ID apagado não pode ser reutilizado. Defina os IDs no código e
na Console com o mesmo texto (ex.: `remover_anuncios`, `premium_vitalicio`).

**No código (gerar o app):**

- [ ] Biblioteca de faturamento na **versão mínima exigida pela Play no ano** (Play Billing Library direta,
      RevenueCat, `in_app_purchase` no Flutter, `react-native-iap`…).
- [ ] IDs dos produtos num arquivo de configuração único.
- [ ] Preço **lido da loja** (já vem em reais e formatado); nunca escrever o preço fixo no app.
- [ ] Tratar os estados: comprado, **cancelado** pelo usuário, **pendente** (⚠️ boleto e outros meios lentos no
      Brasil: só liberar quando o status virar "comprado") e erro ("você não foi cobrado").
- [ ] **Confirmar (acknowledge) toda compra em até 3 dias**, senão a Google reembolsa sozinha. Bibliotecas como
      RevenueCat fazem isso; com a Billing Library direta, é você.
- [ ] Consumir os consumíveis depois de entregar.
- [ ] Botão **"Restaurar compras"**.
- [ ] Guardar o direito (Premium) localmente para funcionar offline, e reconferir com a loja ao abrir.
- [ ] Tela de vendas honesta: o que libera, preço da loja, "pagamento único" quando for.
- [ ] Bloqueio dos recursos pagos num só lugar (ex.: `isPremium`), para não esquecer uma tela.
- [ ] Opcional: validação no servidor (evita fraude em apps com valor alto).

**Na Console:**

- [ ] Monetizar › Produtos no app: criar os produtos ⚠️ só depois de enviar um AAB com a biblioteca de faturamento.
- [ ] Configuração › Teste de licença: incluir os e-mails de teste (compras de teste não cobram).
- [ ] Declarações: IARC com **compras digitais** (§6.4), Segurança dos dados com histórico de compras (§6.6).

**Armadilhas:** esquecer o acknowledge (reembolsos misteriosos depois de 3 dias); tratar pendente como erro; produto
único configurado como consumível na ferramenta de compras (o direito some ao reinstalar).

### M.4 T3 — Doações / "pague um café"

Doação ao **próprio desenvolvedor** é produto digital: segue a T2 com produtos **consumíveis**.

**No código (gerar o app):**

- [ ] Valores **fixos** (ex.: R$ 5, 10, 20, 50, 100). A Play não aceita valor livre.
- [ ] Texto "apoie o desenvolvedor", não "doação beneficente" (não é caridade).
- [ ] Agradecimento após a compra; opcional: liberar um benefício (ex.: Premium ou selo de apoiador). Se liberar,
      diga isso antes da compra.
- [ ] Mesmos estados, acknowledge/consumo e "Restaurar compras" da T2.
- [ ] ⚠️ Nada de chave PIX, link de vaquinha ou "pague por fora" dentro do app.

**Na Console:** igual à T2 (produtos consumíveis). Nos Termos: doações são voluntárias e o reembolso segue a política
da Google Play.

### M.5 T4 — Assinatura

**No código (gerar o app):**

- [ ] Produtos de assinatura com **planos base** (mensal, anual) e **ofertas** (teste grátis, preço introdutório).
- [ ] Antes de assinar, mostrar claramente: preço, período, renovação automática, o que acontece depois do teste
      grátis e como cancelar.
- [ ] Botão **"Gerenciar assinatura"** abrindo a tela da Play
      (`https://play.google.com/store/account/subscriptions?sku=<id>&package=<pacote>`).
- [ ] Conferir o direito **a cada abertura** (assinatura expira, é cancelada, entra em período de carência ou em
      suspensão de conta).
- [ ] Tratar período de carência (ainda dá acesso) e suspensão (sem acesso; pedir para atualizar o pagamento).
- [ ] Recomendado: servidor com notificações em tempo real (RTDN) ou um serviço como RevenueCat.
- [ ] Acknowledge, pendente e "Restaurar compras" como na T2.

**Na Console:** Monetizar › Assinaturas (planos base e ofertas), teste de licença (renovações aceleradas no teste).
Declarações iguais à T2. Siga a política de assinaturas (sem esconder o preço, sem cancelamento difícil).

### M.6 T5 — App pago

**No código (gerar o app):** sem tela de compra para o app em si. Opcional: Play Integrity para detectar cópias.
Não combine com anúncios.

**Na Console:** 🔒 escolher "Pago" ao criar o app (§4); preço por país em Monetizar; perfil de pagamentos. Não há
"teste grátis" nativo: para isso use T2 (versão grátis + desbloqueio). O usuário pode pedir reembolso rápido logo
após a compra pela própria Play.

### M.7 Testar antes de enviar para produção

| Trilha | Teste mínimo |
|---|---|
| T1 | IDs de teste aparecem; consentimento aparece com região de teste (EEA); app funciona sem anúncio; quem pagou não vê nenhum |
| T2/T3 | Comprar com conta de teste de licença; cancelar; simular pagamento lento (cartão de teste "aprova depois"); reinstalar e restaurar; esperar > 3 dias e ver que não houve reembolso automático |
| T4 | Assinar, deixar renovar (no teste é acelerado), cancelar, ver o acesso acabar no fim do período |
| T5 | Instalar pela faixa de teste com conta de testador |

### M.8 Ordem sugerida ao gerar um app monetizado

1. Escolher as trilhas (M.0) e os IDs dos produtos 🔒.
2. Gerar o app com o bloqueio Premium num só lugar e os IDs de teste dos anúncios.
3. Publicar a Política de Privacidade e os Termos (§3.4).
4. Enviar o 1º AAB no teste interno (§5); só então criar os produtos e vincular o AdMob.
5. Testar (M.7) e preencher as declarações (M.9).

### M.9 Declarações por trilha

| Declaração/item | T1 Anúncios | T2/T3 Compras e doações | T4 Assinatura | T5 Pago |
|---|---|---|---|---|
| Status de comerciante (§2.2) | Comerciante | Comerciante | Comerciante | Comerciante |
| Termos de Uso publicados e no app | Recomendado | **Sim** | **Sim** | Sim |
| Conteúdo do app › Anúncios (§6.3) | Sim | — | — | — |
| ID de publicidade (§6.13) | Sim | Só se um SDK coletar | Idem | — |
| IARC (§6.4) | Responder anúncios | **Compras digitais** | **Compras digitais** | — |
| Segurança dos dados (§6.6) | IDs do aparelho, interações, diagnóstico | Histórico de compras | Histórico de compras | — |
| Política de Privacidade (§3.4) | Citar a rede de anúncios | Citar a loja e o serviço de compras | Idem | — |
| Perfil de pagamentos com conta bancária | Na rede (AdMob) | **Play** | **Play** | **Play** |
| `app-ads.txt` | Sim | — | — | — |
| Faixa de teste com teste de licença | — | Sim | Sim | Sim |

## 12. Modelo de acompanhamento (copiar para o projeto)

Copie para o projeto e marque conforme avança:

```markdown
## Publicação na Google Play — <NOME DO APP>
- Pacote: `<br.com.empresa.app>` · Tipo de conta: pessoal/organização · Status de comerciante: ___
- Trilhas do modelo de negócio (§M.0): ___ · IDs dos produtos: ___
- [ ] 🛑 Registro do app verificado em ___/___: Play (nacional e estrangeiros), App Store, INPI, domínio
- [ ] Conta criada e taxa paga (data)
- [ ] Identidade verificada (data)
- [ ] Telefone/e-mails verificados · [ ] Status de comerciante declarado
- [ ] App criado na Console (data) · [ ] 🛑 Pacote registrado na verificação de desenvolvedor Android
- [ ] Chave de upload com backup em 2 lugares
- [ ] 🛑 Ambiente de build registrado (`docs/REGISTRO-BUILDS.md`) — último build: ___
- [ ] Checklists "No código" das trilhas implementados e testes da §M.7 feitos
- [ ] Teste interno publicado — versão ___ (data)
- [ ] Política de Privacidade no ar (URL: ___) e dentro do app · [ ] Termos de Uso (se comerciante)
- [ ] Conteúdo do app: login · anúncios · classificação · público-alvo · segurança dos dados · governo · finanças · saúde · permissões · ID de publicidade
- [ ] Declarações conferidas pela §M.9
- [ ] Categoria e contatos · [ ] Ficha da loja (textos, ícone, recurso gráfico, capturas de celular e tablets)
- [ ] Produtos criados em Monetizar · [ ] AdMob vinculado e mensagens de consentimento publicadas
- [ ] Teste fechado iniciado (data) com ___ testadores → 14 dias até ___
- [ ] Acesso à produção solicitado/aprovado (datas)
- [ ] Lançamento em produção (data) — gradual
```

## Anexo A. Classificador: o app cabe em conta pessoal ou precisa de organização?

> Reconstruído em 09/11/2026 a partir das regras deste guia (o original estava incompleto). Confira na Central de
> Ajuda ("Requisitos do Play Console", "Categorias de apps de saúde") e corrija aqui se algo mudou.

| Tipo de app | Conta pessoal nova? | Observação |
|---|---|---|
| Clima, calculadora, lanterna, conversor, utilitários | ✅ Sim | — |
| Jogos, entretenimento, música, fotos | ✅ Sim | Público infantil → Política para Famílias |
| Produtividade, notas, listas, agenda, lembretes **gerais** | ✅ Sim | Lembrete de remédio **não** é "geral" (ver abaixo) |
| Educação, cursos, quiz | ✅ Sim | Se for para crianças → Famílias |
| Fitness, treino, contador de passos, água, sono (bem-estar) | ✅ Em geral | Sem diagnóstico, dose ou tratamento. Na dúvida, confira "Categorias de apps de saúde" |
| Loja / catálogo / delivery de produtos físicos | ✅ Sim | Pagamento de produto físico pode ser fora da Play |
| Ferramentas automotivas (OBD, scanner) | ✅ Em geral | Sem recursos financeiros |
| **Lembrete/controle de medicamentos, adesão a tratamento** | ❌ Organização | Categoria médica, mesmo sem diagnóstico |
| **Medicina, telessaúde, prontuário, pesquisa com pessoas** | ❌ Organização | Pode atrair regulação (ANVISA) |
| **Finanças**: banco, empréstimo, investimento, cripto, pagamentos | ❌ Organização | Controle de gastos pessoal **sem** movimentar dinheiro: confira a declaração de recursos financeiros |
| **VPN** (`VpnService`) | ❌ Organização | — |
| **Governo** (feito por ou para órgão público) | ❌ Organização | — |

**Roteiro para a IA classificar o app:**

1. Leia o código: permissões, SDKs, telas, o que o app faz com dados de saúde, dinheiro, rede.
2. Compare com a tabela acima e com as declarações do §6 (saúde §6.9, finanças §6.8, governo §6.7).
3. Se qualquer função cai numa linha ❌ → organização (não "desmarque" a função para escapar).
4. Se tudo cai em ✅ → pessoal serve; lembre do teste fechado (§8) e, se for remunerado, do status de comerciante
   (§2.2) e da opção de CNPJ (§1.2).
5. Registre a conclusão e o motivo no acompanhamento do projeto (§12).

## Anexo B. Tabela-mestra de imagens e textos

> Reconstruído em 09/11/2026 a partir das regras deste guia (o original estava incompleto). Os limites da loja estão
> no §7; confira a tela da Console e corrija aqui se mudarem.

**Loja (Play Console)**

| Item | Tamanho / limite | Formato | Obrigatório |
|---|---|---|---|
| Nome do app | até 30 caracteres | texto | Sim |
| Descrição curta | até 80 caracteres | texto | Sim |
| Descrição completa | até 4000 caracteres | texto | Sim |
| Notas da versão | até 500 caracteres por idioma | texto `<pt-BR>…</pt-BR>` | Por versão |
| Nome do desenvolvedor | até 50 caracteres | texto | Sim |
| Ícone | 512×512 px, até 1 MB | PNG 32 bits, sem transparência | Sim |
| Recurso gráfico | 1024×500 px | PNG/JPG, sem transparência | Sim |
| Capturas do celular | 2 a 8; 9:16 ou 16:9 exato; lados 320–3840 px (ideal 1080×1920) | PNG/JPG até 8 MB | Sim |
| Capturas tablet 7" | até 8; 9:16; lados 320–3840 px (ex.: 1080×1920) | PNG/JPG | Se o app roda em tablet |
| Capturas tablet 10" | até 8; 9:16; lados 1080–7680 px (ex.: 1620×2880) | PNG/JPG | Se o app roda em tablet |
| Chromebook / TV / Wear OS / XR | conforme a tela da Console (TV: banner 1280×720) | PNG/JPG | Só se distribuir nesses formatos |
| Vídeo | link do YouTube | público ou não listado, sem anúncios | Não |

**Dentro do app (Android)**

| Item | Tamanho | Observação |
|---|---|---|
| Ícone de origem | 1024×1024 px | Quadrado cheio; as ferramentas geram as densidades |
| Ícone adaptativo (primeiro plano) | 432×432 px (108 dp), conteúdo na área segura central de 66 dp | Fundo em camada separada (cor ou imagem) |
| Ícone monocromático (Android 13+) | 432×432 px, uma cor com transparência | Para ícones temáticos |
| Ícone de notificação | 24 dp (96×96 px em xxxhdpi) | Branco com transparência; colorido vira quadrado branco |
| Splash (Android 12+) | Ícone central até 288 dp (com fundo) ou 240 dp; área visível de 192 dp | Cor de fundo única |

**Organização dos arquivos:** guarde as imagens finais da loja numa pasta do projeto (ex.: `store/`) e as fontes
(telas originais, HTML das molduras) junto, para regenerar quando o nome ou as telas mudarem.

## Histórico do guia

| Data | Mudança |
|---|---|
| 03/11/2026 | Versão inicial, a partir da publicação real de um app (conta pessoal, Brasil): conta e verificações, status de comerciante, chaves e versões, teste interno, Conteúdo do app, ficha da loja, teste fechado, produção, atualizações e armadilhas. |
| 03/11/2026 | Regra de manutenção ("guia vivo"). |
| 04/11/2026 | §11: erros do teste fechado (versão sem pacote → "Adicionar da biblioteca"; intent para tela cheia fora do teste interno). §6.10: apps de lembrete respondem **Outro**. §8: sem 12 testadores (teste interno, grupos de troca, organização; nunca contas falsas). §7: regras exatas das capturas e tablets. |
| nov/2026 | Mapa do caminho, §1.1 converter pessoal → organização, regra de apps de saúde/medicamento, Anexos A e B (versão colada, que chegou cortada). |
| 09/11/2026 | Novas seções: §0.1 registro do app (nome, marca e registro de pacote obrigatório no Brasil desde 30/09/2026), §1.2 abrir CNPJ para app remunerado, §3.0 ambiente de build local (verificar e registrar sempre), §M monetização (anúncios, compras, doações, assinatura, app pago). Lições em §11. Itens 🛑 no mapa e no §2.7. |
| 09/11/2026 | §M reescrito como trilhas de modelo de negócio (T0 grátis, T1 anúncios, T2 compra no app, T3 doações, T4 assinatura, T5 pago), com checklist "No código" para gerar o app, testes (M.7) e declarações por trilha (M.9). Guia passa a cobrir a geração do app, não só a publicação. |
| 09/11/2026 | §11: scripts PowerShell em UTF-8 com BOM, stderr no PowerShell 5.1 e JDK fora do PATH no Windows. |
| 09/11/2026 | Trechos cortados completados a partir da versão de 04/11 (fim do §8, §9, §10, tabela do §11, §12). Anexos A e B reconstruídos. Novas linhas no §11 (chave de outro app, pouca RAM, acknowledge, compra pendente). |
| 11/11/2026 | §11: `.env` ausente no PC gera AAB com chave vazia; GitHub Pages só publica a branch configurada. |
| 11/11/2026 | §M.2: por que anúncios minúsculos/imperceptíveis derrubam a conta AdMob e o que aumenta a receita dentro das regras. §7: capturas de tela de app Expo pela versão web com APIs simuladas. |
