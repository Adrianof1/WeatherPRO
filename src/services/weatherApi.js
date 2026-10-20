import { CONFIG, ENV } from '../config';
import { findFloodData, generateAlerts } from './alertEngine';
import { formatTime, mapIcon, sanitizeInput } from '../utils/helpers';

const WEEKDAYS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

async function request(path, params) {
  const key = ENV.WEATHER_API_KEY;
  if (!key) throw new Error('API_KEY_MISSING');

  const query = Object.entries({ ...params, appid: key })
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CONFIG.api.timeoutMs);
  try {
    const res = await fetch(`${CONFIG.api.baseUrl}${path}?${query}`, { signal: controller.signal });
    if (res.status === 401) throw new Error('API_KEY_INVALID');
    if (!res.ok) throw new Error('API_ERROR');
    return await res.json();
  } catch (e) {
    if (['API_KEY_INVALID', 'API_ERROR', 'API_KEY_MISSING'].includes(e.message)) throw e;
    throw new Error('NETWORK'); // sem internet, timeout ou DNS
  } finally {
    clearTimeout(timer);
  }
}

// Agrupa os blocos de 3h por dia local da cidade e calcula min/max reais do dia.
function buildDaily(list, tz) {
  const days = new Map();
  list.forEach((item) => {
    const local = new Date((item.dt + tz) * 1000);
    const key = local.toISOString().slice(0, 10);
    if (!days.has(key)) days.set(key, { key, weekday: local.getUTCDay(), items: [] });
    days.get(key).items.push(item);
  });

  return [...days.values()].slice(0, 5).map((day, i) => {
    const temps = day.items.map((it) => it.main.temp);
    // condição representativa: o bloco mais próximo do meio-dia
    const midday = day.items.reduce((best, it) => {
      const hour = new Date((it.dt + tz) * 1000).getUTCHours();
      const bestHour = new Date((best.dt + tz) * 1000).getUTCHours();
      return Math.abs(hour - 12) < Math.abs(bestHour - 12) ? it : best;
    });
    return {
      id: day.key,
      day: i === 0 ? 'Hoje' : WEEKDAYS[day.weekday],
      icon: mapIcon(midday.weather[0].main, false),
      tempMax: Math.round(Math.max(...temps)),
      tempMin: Math.round(Math.min(...temps)),
      condition: midday.weather[0].description,
      pop: Math.round(Math.max(...day.items.map((it) => it.pop || 0)) * 100),
      rain: day.items.reduce((sum, it) => sum + (it.rain?.['3h'] || 0), 0),
    };
  });
}

function processData(current, forecast, apiAlerts, names = {}) {
  const tz = forecast.city?.timezone ?? current.timezone ?? 0;
  const condition = current.weather[0].main;
  const isNight = current.weather[0].icon.endsWith('n');
  // O endpoint de clima devolve o nome do bairro/ponto; na busca preferimos o nome da cidade do geocoding.
  const cityName = names.display || current.name;
  const clock = (unix) => formatTime(new Date(unix * 1000), tz);

  const hourly = forecast.list.slice(0, CONFIG.premium.maxHourly).map((item, i) => ({
    id: `h${item.dt}`,
    time: i === 0 ? 'Agora' : clock(item.dt),
    temp: Math.round(item.main.temp),
    icon: mapIcon(item.weather[0].main, item.weather[0].icon.endsWith('n')),
    pop: Math.round((item.pop || 0) * 100),
    rain: item.rain?.['3h'] || 0,
  }));

  const daily = buildDaily(forecast.list, tz);
  const flood = [cityName, names.geo, names.reverse, current.name].map(findFloodData).find(Boolean) || null;
  const alerts = generateAlerts(current, forecast, cityName, apiAlerts, flood);

  return {
    city: cityName,
    country: names.country || current.sys?.country || '',
    lat: current.coord?.lat,
    lon: current.coord?.lon,
    temp: Math.round(current.main.temp),
    feels_like: Math.round(current.main.feels_like),
    // A API de clima atual só traz min/max do instante; usamos o intervalo do dia da previsão.
    temp_min: Math.round(Math.min(current.main.temp, daily[0]?.tempMin ?? current.main.temp)),
    temp_max: Math.round(Math.max(current.main.temp, daily[0]?.tempMax ?? current.main.temp)),
    desc: current.weather[0].description,
    condition,
    icon: mapIcon(condition, isNight),
    isNight,
    hum: current.main.humidity,
    wind: Math.round((current.wind?.speed || 0) * 3.6),
    windDeg: current.wind?.deg || 0,
    pressure: current.main.pressure,
    visibility: Math.round((current.visibility ?? 10000) / 1000),
    clouds: current.clouds?.all || 0,
    sunrise: clock(current.sys.sunrise),
    sunset: clock(current.sys.sunset),
    rain1h: current.rain?.['1h'] || 0,
    hourly,
    forecast: daily,
    alerts,
    floodPoints: flood?.points || [],
    floodRisk: flood?.riskLevel || null,
    timestamp: Date.now(),
  };
}

export const WeatherAPI = {
  async fetchByCoords(lat, lon, geoInfo = null) {
    const base = { lat, lon, units: 'metric', lang: 'pt_br' };
    const [current, forecast] = await Promise.all([
      request('/data/2.5/weather', base),
      request('/data/2.5/forecast', base),
    ]);

    // Alertas oficiais exigem One Call 3.0 (assinatura própria). Se falhar, seguimos só com os calculados.
    let apiAlerts = [];
    try {
      const data = await request('/data/3.0/onecall', { lat, lon, exclude: 'minutely,hourly,daily' });
      apiAlerts = data.alerts || [];
    } catch (e) {
      if (e.message === 'API_KEY_MISSING') throw e;
    }

    // Para GPS, descobre a cidade (best effort) só para casar com os pontos de alagamento.
    let reverse = null;
    if (!geoInfo) {
      try {
        const rev = await request('/geo/1.0/reverse', { lat, lon, limit: 1 });
        reverse = rev?.[0]?.name || null;
      } catch (e) { /* segue com o nome do clima */ }
    }

    return processData(current, forecast, apiAlerts, {
      display: geoInfo?.name,
      geo: geoInfo?.name,
      reverse,
      country: geoInfo?.country,
    });
  },

  async fetchByCity(cityName) {
    const sanitized = sanitizeInput(cityName);
    if (sanitized.length < 2) throw new Error('INVALID_CITY');
    const geo = await request('/geo/1.0/direct', { q: sanitized, limit: 1 });
    if (!Array.isArray(geo) || geo.length === 0) throw new Error('CITY_NOT_FOUND');
    return this.fetchByCoords(geo[0].lat, geo[0].lon, { name: geo[0].name, country: geo[0].country });
  },
};
