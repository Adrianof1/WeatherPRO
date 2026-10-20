import AsyncStorage from '@react-native-async-storage/async-storage';
import { CONFIG } from '../config';

export const Cache = {
  async save(key, data) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) { /* cache é opcional */ }
  },

  // `allowStale`: devolve mesmo expirado (usado quando está offline).
  async load(key, { allowStale = false } = {}) {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      const data = JSON.parse(raw);
      if (!allowStale && Date.now() - data.timestamp > CONFIG.cache.duration) return null;
      return data;
    } catch (e) {
      return null;
    }
  },
};

export const Favorites = {
  async list() {
    try {
      const raw = await AsyncStorage.getItem(CONFIG.cache.favoritesKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },
  async save(list) {
    try {
      await AsyncStorage.setItem(CONFIG.cache.favoritesKey, JSON.stringify(list));
    } catch (e) { /* silencioso */ }
  },
};
