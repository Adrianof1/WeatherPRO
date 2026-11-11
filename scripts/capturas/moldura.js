// Monta as capturas finais da loja (moldura + frase) a partir das telas cruas.
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path');
const RAW = process.argv[2]; const OUT = process.argv[3];
const CHROME = process.env.CHROME || undefined;

const SLIDES = [
  { id: '1-clima', title: 'O clima de agora,<br>onde você estiver', sub: 'Pelo GPS ou buscando qualquer cidade' },
  { id: '2b-dias', title: 'Previsão por hora<br>e para 5 dias', sub: 'Máxima, mínima e chance de chuva' },
  { id: '3-alertas', title: 'Alertas de<br>chuva forte', sub: 'Calculados a partir da previsão' },
  { id: '4-alagamentos', title: 'Pontos de<br>alagamento', sub: 'Locais com histórico em capitais brasileiras' },
];
// largura/altura CSS × escala = tamanho final em pixels
const DEVICES = {
  celular: { w: 540, h: 960, s: 2, frame: 0.80, radius: 46, bezel: 12 },
  tablet7: { w: 540, h: 960, s: 2, frame: 0.84, radius: 30, bezel: 14 },
  tablet10: { w: 810, h: 1440, s: 2, frame: 0.84, radius: 40, bezel: 18 },
};

const html = (img, sl, d) => `<!doctype html><html><head><meta charset="utf-8"><style>
*{margin:0;box-sizing:border-box}
body{width:${d.w}px;height:${d.h}px;overflow:hidden;font-family:'Segoe UI','Roboto',sans-serif;color:#fff;
 background:radial-gradient(circle at 85% 8%,rgba(56,189,248,.55) 0,transparent 45%),linear-gradient(160deg,#020617 0%,#0c4a6e 55%,#0369a1 100%)}
.cap{height:${Math.round(d.h * 0.24)}px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:0 ${d.w * 0.06}px}
h1{font-size:${d.w * 0.075}px;font-weight:800;line-height:1.12;letter-spacing:-.5px}
p{font-size:${d.w * 0.036}px;margin-top:${d.w * 0.02}px;color:rgba(255,255,255,.8)}
.dev{margin:0 auto;width:${d.w * d.frame}px;background:#0b1220;border-radius:${d.radius}px;padding:${d.bezel}px;
 box-shadow:0 30px 70px rgba(0,0,0,.55),0 0 0 2px rgba(255,255,255,.08)}
.dev img{display:block;width:100%;border-radius:${d.radius - d.bezel / 2}px}
</style></head><body><div class="cap"><h1>${sl.title}</h1><p>${sl.sub}</p></div>
<div class="dev"><img src="data:image/png;base64,${img}"></div></body></html>`;

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  for (const [name, d] of Object.entries(DEVICES)) {
    fs.mkdirSync(path.join(OUT, name), { recursive: true });
    const page = await browser.newPage({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.s });
    for (const [i, sl] of SLIDES.entries()) {
      const img = fs.readFileSync(path.join(RAW, `${name}-${sl.id}.png`)).toString('base64');
      await page.setContent(html(img, sl, d));
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUT, name, `0${i + 1}-${sl.id.replace(/^\d+b?-/, '')}.png`) });
    }
    await page.close();
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
