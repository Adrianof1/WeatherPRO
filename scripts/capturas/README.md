# Capturas de tela da loja

Geradas a partir da versão **web** do app com dados de clima **simulados** (Teresina, céu limpo com chuva forte
prevista). Não usa o `.env` nem build Android. Refaça sempre que o nome do app ou alguma tela mudar.

```bash
# 1) exportar a versão web com uma chave fictícia (as chamadas à OpenWeather são simuladas)
EXPO_PUBLIC_WEATHER_API_KEY=demo npx expo export --platform web --output-dir <pasta-temp>/web

# 2) Playwright numa pasta temporária (não entra no package.json)
cd <pasta-temp> && npm init -y && npm i playwright@1.57.0 && npx playwright install chromium
#   ou use um Chromium já instalado: CHROME=<caminho do chrome.exe>

# 3) telas cruas e capturas finais com moldura
node <projeto>/scripts/capturas/telas.js   <pasta-temp>/web <projeto>/store/capturas/fonte
node <projeto>/scripts/capturas/moldura.js <projeto>/store/capturas/fonte <projeto>/store/capturas
```

`telas.js` também grava `*-2-previsao.png`, que não entra na loja (pode apagar).

| Pasta | Tamanho | Uso na Play Console |
|---|---|---|
| `store/capturas/celular` | 1080×1920 | Capturas de tela do telefone |
| `store/capturas/tablet7` | 1080×1920 | Tablet de 7 polegadas |
| `store/capturas/tablet10` | 1620×2880 | Tablet de 10 polegadas |
| `store/capturas/fonte` | — | Telas cruas (fonte das molduras) |

A aba "Café" não entra: na web ela mostra "compras só funcionam na versão da loja", e preço inventado na captura
seria enganoso. As frases das molduras falam só de funções que existem no app.
