# Instruções para IA neste projeto

- Publicação na Play Store: siga `guias/GUIA-PUBLICACAO-GOOGLE-PLAY.md` (genérico) e `PUBLICACAO.md` (respostas
  específicas do WeatherPRO).
- **Guia vivo:** ao aprender algo novo ou desatualizado sobre a Play Console, atualize o guia na mesma sessão (texto
  genérico, sem dados pessoais) e acrescente uma linha no Histórico do guia.
- 🛑 **Sempre** verifique e registre o PC da build local (`scripts/registrar-ambiente-build.ps1` ou `.sh` →
  `docs/REGISTRO-BUILDS.md`) antes e depois de cada build de loja. Nunca registre senhas.
- 🛑 **Sempre** verifique o registro do app: nome/marca (Play nacional e estrangeiros, App Store, INPI) e registro do
  pacote na verificação de desenvolvedor Android.
- Modelo de negócio do WeatherPRO: trilhas **T1 anúncios + T2 compra no app + T3 doações** (guia §M). Ao mexer em
  anúncios ou compras, siga o checklist "No código" dessas trilhas e confira as declarações pela §M.9.
- Em um app novo: defina a trilha (§M.0) **antes** de gerar o código.
- Chaves de assinatura e senhas nunca vão para o Git. Variáveis em `.env` (ver `.env.example`).
- Documentação e textos do app em português do Brasil.
