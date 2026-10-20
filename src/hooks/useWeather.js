import { useCallback, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { CONFIG } from '../config';
import { Cache } from '../services/cache';
import { WeatherAPI } from '../services/weatherApi';

/**
 * Estado do clima. `error` é um de: null | 'api_key' | 'network' | 'city_not_found' | 'no_location'.
 * `stale` = mostrando dados do cache expirados (ex.: sem internet).
 */
export function useWeather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [stale, setStale] = useState(false);
  const source = useRef({ type: 'gps' }); // última origem: 'gps' ou { lat, lon }
  const lastAlertIds = useRef(new Set());

  /** Retorna true se há um alerta extremo NOVO (para vibrar uma única vez). */
  const apply = (data, { cache = true } = {}) => {
    setWeather(data);
    setError(null);
    setStale(false);
    if (cache) Cache.save(CONFIG.cache.weatherKey, data);
    const extremeIds = (data.alerts || []).filter((a) => a.severity === 'extremo').map((a) => a.id);
    const isNew = cache && extremeIds.some((id) => !lastAlertIds.current.has(id));
    lastAlertIds.current = new Set(extremeIds);
    return isNew;
  };

  const handleFailure = async (e) => {
    const code = e?.message;
    if (!['NETWORK', 'API_ERROR', 'API_KEY_MISSING', 'API_KEY_INVALID', 'CITY_NOT_FOUND'].includes(code)) {
      console.log('[Clima] Erro inesperado:', e?.stack || e);
    }
    if (code === 'API_KEY_MISSING' || code === 'API_KEY_INVALID') setError('api_key');
    else if (code === 'CITY_NOT_FOUND') setError(null);
    else setError('network');
    // Offline: mostra o último dado salvo, mesmo expirado, em vez de uma tela vazia.
    if (code !== 'CITY_NOT_FOUND') {
      const old = await Cache.load(CONFIG.cache.weatherKey, { allowStale: true });
      if (old) { setWeather((cur) => cur || old); setStale(true); }
    }
  };

  const fetchCoords = async (lat, lon) => {
    const data = await WeatherAPI.fetchByCoords(lat, lon);
    source.current = { lat, lon };
    return apply(data);
  };

  const loadGPS = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('no_location');
      return false;
    }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    source.current = { type: 'gps' };
    const data = await WeatherAPI.fetchByCoords(loc.coords.latitude, loc.coords.longitude);
    return apply(data);
  }, []);

  /** Abertura do app: cache fresco na hora + GPS em seguida. */
  const init = useCallback(async () => {
    const cached = await Cache.load(CONFIG.cache.weatherKey);
    if (cached) apply(cached, { cache: false });
    try {
      return await loadGPS();
    } catch (e) {
      await handleFailure(e);
      return false;
    } finally {
      setLoading(false);
    }
  }, [loadGPS]);

  /** Atualiza a MESMA origem de antes (cidade buscada ou GPS). */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const s = source.current;
      return s.type === 'gps' ? await loadGPS() : await fetchCoords(s.lat, s.lon);
    } catch (e) {
      await handleFailure(e);
      return false;
    } finally {
      setRefreshing(false);
    }
  }, [loadGPS]);

  const searchCity = useCallback(async (text) => {
    setLoading(true);
    try {
      const data = await WeatherAPI.fetchByCity(text);
      source.current = { lat: data.lat, lon: data.lon };
      return { ok: true, vibrate: apply(data) };
    } catch (e) {
      await handleFailure(e);
      return { ok: false, notFound: e?.message === 'CITY_NOT_FOUND' };
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCoords = useCallback(async (lat, lon) => {
    setLoading(true);
    try {
      return await fetchCoords(lat, lon);
    } catch (e) {
      await handleFailure(e);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { weather, loading, refreshing, error, stale, init, refresh, searchCity, loadCoords, retryGPS: init };
}
