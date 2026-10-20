import { THEMES } from '../data/themes';

// Mantém letras (inclusive acentuadas), espaços, hífen, apóstrofo e ponto.
export const sanitizeInput = (text = '') =>
  text
    .replace(/[^\p{L}\s\-'.]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 50);

export const normalizeText = (text) =>
  String(text ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();

const pad = (n) => String(n).padStart(2, '0');

// Se `tzSeconds` for informado, formata no fuso da cidade (offset da OpenWeather);
// senão, no fuso do aparelho.
export const formatTime = (date, tzSeconds) => {
  if (typeof tzSeconds === 'number') {
    const d = new Date(date.getTime() + tzSeconds * 1000);
    return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  }
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const mapIcon = (condition, isNight = false) => {
  const map = {
    Clear: isNight ? 'weather-night' : 'weather-sunny',
    Clouds: isNight ? 'weather-night-partly-cloudy' : 'weather-cloudy',
    Rain: 'weather-pouring',
    Thunderstorm: 'weather-lightning-rainy',
    Snow: 'weather-snowy-heavy',
    Drizzle: 'weather-partly-rainy',
    Mist: 'weather-fog', Fog: 'weather-fog', Haze: 'weather-hazy',
    Smoke: 'weather-fog', Dust: 'weather-fog',
    Squall: 'weather-windy', Tornado: 'weather-tornado',
  };
  return map[condition] || (isNight ? 'weather-night' : 'weather-sunny');
};

export const getTheme = (condition, isNight, hasExtremeAlert = false) => {
  if (hasExtremeAlert) return THEMES.Alert;
  if (isNight) return THEMES.Night;
  return THEMES[condition] || THEMES.Default;
};

export const getWindDirection = (deg = 0) => {
  const dirs = ['N', 'NE', 'L', 'SE', 'S', 'SO', 'O', 'NO'];
  return dirs[Math.round(deg / 45) % 8];
};

export const getSeverityColor = (severity) =>
  ({ extremo: '#ef4444', alto: '#f59e0b', moderado: '#3b82f6', baixo: '#22c55e' }[severity] || '#6b7280');

export const getRiskColor = (risk) =>
  ({ 'crítico': '#ef4444', alto: '#f59e0b', 'médio': '#3b82f6', baixo: '#22c55e' }[risk] || '#6b7280');

export const SEVERITY_ORDER = { extremo: 0, alto: 1, moderado: 2, baixo: 3 };
