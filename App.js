// WeatherPRO — Adriano Ferreira de Oliveira
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Alert, Animated, Easing, Platform, StatusBar, Text, TouchableOpacity, Vibration, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import { styles } from './src/styles';
import { THEMES } from './src/data/themes';
import { CONFIG } from './src/config';
import { getTheme } from './src/utils/helpers';
import { useWeather } from './src/hooks/useWeather';
import { AdService } from './src/services/ads';
import { Favorites } from './src/services/cache';
import { PremiumProvider, usePremium } from './src/context/PremiumContext';
import WeatherScreen from './src/screens/WeatherScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import FloodScreen from './src/screens/FloodScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import { expo as appConfig } from './app.json';

export default function App() {
  return (
    <PremiumProvider>
      <Main />
    </PremiumProvider>
  );
}

function Main() {
  const { isPremium } = usePremium();
  const { weather, loading, refreshing, error, stale, init, refresh, searchCity, loadCoords } = useWeather();
  const [activeTab, setActiveTab] = useState('clima');
  const [favorites, setFavorites] = useState([]);
  const searchCount = useRef(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const animateIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true, easing: Easing.out(Easing.cubic) }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  // Anima ao trocar de cidade/dados novos
  useEffect(() => { if (weather) animateIn(); }, [weather?.timestamp, weather?.city]);

  const buzz = (shouldVibrate) => {
    if (shouldVibrate === true || shouldVibrate?.vibrate) {
      try { Vibration.vibrate([0, 200, 100, 200]); } catch (e) { /* sem vibrador */ }
    }
  };

  useEffect(() => {
    Favorites.list().then(setFavorites);
    init().then(buzz);
  }, []);

  // ─── Ações ───
  const onSearch = async (text) => {
    const result = await searchCity(text);
    if (!result.ok) {
      if (result.notFound) Alert.alert('😕 Cidade não encontrada', 'Confira o nome e tente de novo.');
      else Alert.alert('Sem conexão', 'Não foi possível buscar agora. Verifique sua internet.');
      return false;
    }
    buzz(result);
    searchCount.current += 1;
    if (!isPremium && searchCount.current % CONFIG.ads.searchesPerInterstitial === 0) {
      AdService.showInterstitial();
    }
    return true;
  };

  const onRefresh = useCallback(async () => buzz(await refresh()), [refresh]);

  const isFavorite = !!weather && favorites.some((f) => f.lat === weather.lat && f.lon === weather.lon);

  const onToggleFavorite = async () => {
    if (!weather) return;
    if (!isPremium) return setActiveTab('premium');
    let next;
    if (isFavorite) {
      next = favorites.filter((f) => !(f.lat === weather.lat && f.lon === weather.lon));
    } else {
      if (favorites.length >= CONFIG.premium.maxFavorites) {
        return Alert.alert('Limite atingido', `Você pode salvar até ${CONFIG.premium.maxFavorites} cidades.`);
      }
      next = [...favorites, { name: weather.city, lat: weather.lat, lon: weather.lon }];
    }
    setFavorites(next);
    Favorites.save(next);
  };

  const onSelectFavorite = async (fav) => buzz(await loadCoords(fav.lat, fav.lon));

  // ─── Render ───
  if (loading && !weather) {
    return (
      <LinearGradient colors={['#020617', '#0f172a', '#1e293b']} style={styles.loadingScreen}>
        <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
        <MaterialCommunityIcons name="weather-partly-cloudy" size={56} color="#fbbf24" />
        <Text style={styles.loadingBrand}>WeatherPRO</Text>
        <ActivityIndicator size="large" color="#38bdf8" style={{ marginTop: 16 }} />
        <Text style={styles.loadingSub}>Conectando ao clima...</Text>
      </LinearGradient>
    );
  }

  const alerts = weather?.alerts || [];
  const extremeAlerts = alerts.filter((a) => a.severity === 'extremo');
  const theme = weather ? getTheme(weather.condition, weather.isNight, extremeAlerts.length > 0) : THEMES.Default;
  const tabs = [
    { id: 'clima', label: 'Clima', icon: 'partly-sunny' },
    { id: 'alertas', label: `Alertas${alerts.length ? ` (${alerts.length})` : ''}`, icon: 'warning' },
    { id: 'alagamentos', label: 'Alagamentos', icon: 'water' },
    { id: 'premium', label: isPremium ? 'Apoio' : 'Café', icon: 'cafe' },
  ];

  return (
    <LinearGradient colors={theme.colors} style={styles.container}>
      <StatusBar barStyle={theme.statusBar} translucent backgroundColor="transparent" />
      <View style={[styles.safe, { paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 50 }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>Weather<Text style={{ color: theme.accent }}>PRO</Text></Text>
            <Text style={styles.brandSub}>v{appConfig.version}{isPremium ? ' • Premium' : ''}</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh} accessibilityLabel="Atualizar">
            <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        <View style={styles.tabRow}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={[styles.tab, activeTab === tab.id && { backgroundColor: theme.accent + '33' }]}
            >
              <Ionicons name={tab.icon} size={14} color={activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.45)'} />
              <Text style={[styles.tabLabel, activeTab === tab.id && { color: '#fff', fontWeight: '700' }]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {extremeAlerts.length > 0 && activeTab === 'clima' && (
          <TouchableOpacity style={styles.alertBanner} onPress={() => setActiveTab('alertas')}>
            <MaterialCommunityIcons name="alert-circle" size={18} color="#fbbf24" />
            <Text style={styles.alertBannerText} numberOfLines={1}>{extremeAlerts[0].title} — Toque para ver detalhes</Text>
            <Ionicons name="chevron-forward" size={16} color="#fbbf24" />
          </TouchableOpacity>
        )}

        {weather && (stale || error === 'network') && (
          <View style={styles.offlineBanner}>
            <Ionicons name="cloud-offline-outline" size={14} color="#fde68a" />
            <Text style={styles.offlineText}>
              Sem conexão — mostrando dados de {new Date(weather.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.
            </Text>
          </View>
        )}

        {activeTab === 'clima' && (
          <WeatherScreen
            weather={weather} theme={theme} fadeAnim={fadeAnim} slideAnim={slideAnim}
            refreshing={refreshing} onRefresh={onRefresh} onSearch={onSearch} error={error}
            isPremium={isPremium} favorites={favorites} isFavorite={isFavorite}
            onToggleFavorite={onToggleFavorite} onSelectFavorite={onSelectFavorite}
            onOpenPremium={() => setActiveTab('premium')} onRetryGPS={() => init().then(buzz)}
          />
        )}
        {activeTab === 'alertas' && (
          <AlertsScreen weather={weather} theme={theme} onOpenFlood={() => setActiveTab('alagamentos')} />
        )}
        {activeTab === 'alagamentos' && <FloodScreen weather={weather} />}
        {activeTab === 'premium' && <PremiumScreen theme={theme} />}
      </View>
    </LinearGradient>
  );
}
