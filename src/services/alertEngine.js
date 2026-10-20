import { FLOOD_DATABASE } from '../data/floodDatabase';
import { formatTime, normalizeText, SEVERITY_ORDER } from '../utils/helpers';

const BLOCK_HOURS = 3; // a previsão da OpenWeather vem em blocos de 3h

export const findFloodData = (cityName) => {
  const target = normalizeText(cityName);
  if (!target) return null;
  const entry = Object.entries(FLOOD_DATABASE).find(([key]) => normalizeText(key) === target);
  return entry ? entry[1] : null;
};

const rainAlert = (item, tz) => {
  const mm = item.rain?.['3h'] || 0;
  const time = formatTime(new Date(item.dt * 1000), tz);
  const base = { type: 'chuva', time };
  if (mm > 30) {
    return {
      ...base, id: `rain_extreme_${item.dt}`, severity: 'extremo', icon: 'weather-pouring',
      title: '🚨 CHUVA EXTREMA', color: '#dc2626',
      message: `Previsão de ${mm.toFixed(0)}mm em ${BLOCK_HOURS}h a partir das ${time}. Risco alto de alagamento. Evite áreas de risco!`,
    };
  }
  if (mm > 15) {
    return {
      ...base, id: `rain_heavy_${item.dt}`, severity: 'alto', icon: 'weather-pouring',
      title: '⚠️ Chuva Forte', color: '#f59e0b',
      message: `Previsão de ${mm.toFixed(0)}mm em ${BLOCK_HOURS}h a partir das ${time}. Possíveis alagamentos em pontos conhecidos.`,
    };
  }
  if (mm > 5) {
    return {
      ...base, id: `rain_mod_${item.dt}`, severity: 'moderado', icon: 'weather-rainy',
      title: '🌧️ Chuva Moderada', color: '#3b82f6',
      message: `Chuva de ${mm.toFixed(0)}mm prevista a partir das ${time}. Leve guarda-chuva.`,
    };
  }
  return null;
};

export const generateAlerts = (current, forecast, cityName, apiAlerts = [], flood = null) => {
  const alerts = [];
  const tz = forecast?.city?.timezone ?? current.timezone;
  const nowTime = formatTime(new Date(), tz);

  // 1. Alertas oficiais (One Call 3.0, se a conta tiver acesso)
  apiAlerts.forEach((alert, i) => {
    alerts.push({
      id: `api_${alert.start || 0}_${i}`, type: 'api', severity: 'extremo', icon: 'alert-circle',
      title: alert.event || 'Alerta Meteorológico',
      message: alert.description || 'Alerta emitido pelas autoridades meteorológicas.',
      source: alert.sender_name || 'Autoridade meteorológica', time: nowTime, color: '#ef4444',
    });
  });

  // 2. Chuva e tempestade nas próximas 6h
  (forecast?.list || []).slice(0, 2).forEach((item) => {
    const rain = rainAlert(item, tz);
    if (rain) alerts.push(rain);
    if (item.weather?.[0]?.main === 'Thunderstorm') {
      alerts.push({
        id: `storm_${item.dt}`, type: 'tempestade', severity: 'extremo', icon: 'weather-lightning',
        title: '⛈️ TEMPESTADE', color: '#7c3aed',
        message: 'Tempestade prevista com raios e ventos fortes. Procure abrigo seguro. Evite árvores e postes.',
        time: formatTime(new Date(item.dt * 1000), tz),
      });
    }
  });

  // 3. Vento
  const windKmh = (current.wind?.speed || 0) * 3.6;
  if (windKmh > 80) {
    alerts.push({
      id: 'wind_extreme', type: 'vento', severity: 'extremo', icon: 'weather-windy',
      title: '🌪️ VENTO EXTREMO', color: '#dc2626', time: nowTime,
      message: `Ventos de ${Math.round(windKmh)} km/h! Risco de destelhamento e queda de árvores. Fique em local seguro.`,
    });
  } else if (windKmh > 50) {
    alerts.push({
      id: 'wind_strong', type: 'vento', severity: 'alto', icon: 'weather-windy',
      title: '💨 Vento Forte', color: '#f59e0b', time: nowTime,
      message: `Ventos de ${Math.round(windKmh)} km/h. Cuidado com objetos soltos e outdoors.`,
    });
  }

  // 4. Temperatura (só se a API informou)
  const temp = current.main?.temp;
  if (typeof temp === 'number') {
    if (temp > 40) {
      alerts.push({
        id: 'heat_extreme', type: 'calor', severity: 'alto', icon: 'thermometer-alert',
        title: '🔥 Calor Extremo', color: '#ef4444', time: nowTime,
        message: `Temperatura de ${Math.round(temp)}°C! Beba muita água e evite o sol entre 10h e 16h.`,
      });
    } else if (temp < 5) {
      alerts.push({
        id: 'cold_extreme', type: 'frio', severity: 'alto', icon: 'thermometer-low',
        title: '🥶 Frio Intenso', color: '#3b82f6', time: nowTime,
        message: `Temperatura de ${Math.round(temp)}°C! Vista-se em camadas e proteja-se.`,
      });
    }
  }

  // 5. Pontos de alagamento (chovendo agora ou chuva forte prevista)
  const isRaining = ['Rain', 'Thunderstorm', 'Drizzle'].includes(current.weather?.[0]?.main);
  const heavyRainSoon = alerts.some((a) => a.type === 'chuva' && a.severity !== 'moderado');
  if ((isRaining || heavyRainSoon) && flood) {
    const critical = flood.points.filter((p) => p.risk === 'crítico');
    if (critical.length > 0) {
      alerts.push({
        id: 'flood_warning', type: 'alagamento', icon: 'waves', color: '#0ea5e9', time: nowTime,
        severity: flood.riskLevel === 'crítico' ? 'extremo' : 'alto',
        title: '🌊 ALERTA DE ALAGAMENTO', hasFloodPoints: true,
        message: `${critical.length} ponto(s) crítico(s) conhecido(s) em ${cityName}. Evite: ${critical
          .slice(0, 2).map((p) => p.name).join(', ')}. (Estimativa baseada em histórico — siga a Defesa Civil.)`,
      });
    }
  }

  const unique = alerts.filter((a, i, all) => all.findIndex((b) => b.id === a.id) === i);
  return unique.sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3)
  );
};
