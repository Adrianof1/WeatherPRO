// Gera capturas cruas do app (export web) com dados simulados da OpenWeather.
const { chromium } = require('playwright');
const http = require('http'); const fs = require('fs'); const path = require('path');
const WEB = process.argv[2]; const OUT = process.argv[3];
const CHROME = process.env.CHROME || undefined; // opcional: caminho de um Chrome/Chromium já instalado

const server = http.createServer((req, res) => {
  let f = path.join(WEB, decodeURIComponent(req.url.split('?')[0]));
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(WEB, 'index.html');
  const ext = path.extname(f); const types = { '.js': 'text/javascript', '.html': 'text/html', '.ttf': 'font/ttf', '.png': 'image/png', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
}).listen(8765);

const TZ = -10800, LAT = -5.0892, LON = -42.8019;
const now = Math.floor(Date.now() / 1000);
const start = Math.ceil(now / 10800) * 10800;
const cond = (i) => {
  const rain = [0, 22.6, 8.3, 1.2, 0, 0, 0, 0, 0, 0, 0, 3.5, 6.2, 0.8, 0, 0][i % 16];
  if (rain > 15) return { main: 'Rain', description: 'chuva forte', icon: '10', rain };
  if (rain > 0) return { main: 'Rain', description: 'chuva moderada', icon: '10', rain };
  return i % 3 ? { main: 'Clouds', description: 'nuvens dispersas', icon: '03', rain } : { main: 'Clear', description: 'céu limpo', icon: '01', rain };
};
const list = Array.from({ length: 40 }, (_, i) => {
  const dt = start + i * 10800; const h = new Date((dt + TZ) * 1000).getUTCHours(); const c = cond(i);
  const temp = 28 + 5 * Math.sin(((h - 9) / 24) * 2 * Math.PI) + (i > 20 ? 1 : 0);
  return { dt, main: { temp, feels_like: temp + 1, humidity: 78, pressure: 1012 }, weather: [{ main: c.main, description: c.description, icon: c.icon + (h >= 6 && h < 18 ? 'd' : 'n') }],
    pop: c.rain ? Math.min(0.95, 0.4 + c.rain / 40) : 0.1, rain: c.rain ? { '3h': c.rain } : undefined, wind: { speed: 3 + (c.rain > 15 ? 4 : 0) } };
});
const current = { coord: { lat: LAT, lon: LON }, name: 'Centro', timezone: TZ, visibility: 10000, clouds: { all: 20 },
  weather: [{ main: 'Clear', description: 'céu limpo', icon: '01d' }], main: { temp: 31.4, feels_like: 34.2, humidity: 58, pressure: 1009 },
  wind: { speed: 3.1, deg: 90 }, sys: { country: 'BR', sunrise: now - 6 * 3600, sunset: now + 6 * 3600 } };
const routes = {
  '/data/2.5/weather': current, '/data/2.5/forecast': { list, city: { timezone: TZ, name: 'Teresina' } },
  '/geo/1.0/reverse': [{ name: 'Teresina', local_names: { pt: 'Teresina' }, country: 'BR', lat: LAT, lon: LON }],
};

const DEVICES = { celular: { w: 360, h: 640, s: 3 }, tablet7: { w: 540, h: 960, s: 2 }, tablet10: { w: 810, h: 1440, s: 2 } };

(async () => {
  const browser = await chromium.launch({ executablePath: CHROME });
  for (const [name, d] of Object.entries(DEVICES)) {
    const ctx = await browser.newContext({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: d.s, isMobile: name === 'celular', hasTouch: true,
      geolocation: { latitude: LAT, longitude: LON }, permissions: ['geolocation'], locale: 'pt-BR', timezoneId: 'America/Sao_Paulo' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => console.log('pageerror', e.message));
    await page.route('https://api.openweathermap.org/**', (r) => {
      const p = new URL(r.request().url()).pathname;
      if (routes[p]) return r.fulfill({ json: routes[p] });
      return r.fulfill({ status: 401, json: {} }); // onecall 3.0: segue só com alertas calculados
    });
    await page.goto('http://localhost:8765/');
    await page.getByText('Teresina').first().waitFor({ timeout: 30000 });
    await page.waitForTimeout(1500);
    const shot = (n) => page.screenshot({ path: `${OUT}/${name}-${n}.png` });
    await shot('1-clima');
    await page.getByText(/^PREVISÃO/).first().evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(800); await shot('2-previsao');
    await page.getByText('PRÓXIMOS DIAS').first().evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(800); await shot('2b-dias');
    await page.getByText(/^Alertas/).first().click(); await page.waitForTimeout(1200); await shot('3-alertas');
    await page.getByText('Alagamentos', { exact: true }).first().click(); await page.waitForTimeout(1200); await shot('4-alagamentos');
    await ctx.close();
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
