import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, TextInput, Modal, Image, Alert, Keyboard, Linking, Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, TestIds, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';

// Tenta prevenir o hide automático, mas envolve em try/catch para não crashar se falhar
try {
  SplashScreen.preventAutoHideAsync();
} catch (e) {
  console.warn("Erro no Splash Screen prevent:", e);
}

// ============================================================================
// CONFIGURAÇÃO DOS IDs (SEUS DADOS REAIS)
// ============================================================================
const ADMOB_CONFIG = {
   appId: 'ca-app-pub-4541742841922750~8099858895', 
   bannerId: 'ca-app-pub-4541742841922750/9142629209',
   interstitialId: 'ca-app-pub-4541742841922750/6756139011'
};

const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY; 

const MOCK_DATA = {
  location: "Teresina, BR (Simulado)",
  current: {
    temp: 32, condition: "Ensolarado", description: "Dados simulados",
    humidity: "45%", wind: "12 km/h", feels_like: "38°", uv: "8", isDay: true, iconName: "weather-sunny"
  },
  forecast: [
    { id: 1, day: "Hoje", icon: "sunny", tempMax: 34, tempMin: 24, condition: "Sol" },
    { id: 2, day: "Amanhã", icon: "partly-sunny", tempMax: 33, tempMin: 23, condition: "Nublado" },
    { id: 3, day: "Qui", icon: "rainy", tempMax: 29, tempMin: 22, condition: "Chuva" },
    { id: 4, day: "Sex", icon: "thunderstorm", tempMax: 28, tempMin: 21, condition: "Tempestade" },
    { id: 5, day: "Sáb", icon: "cloudy", tempMax: 30, tempMin: 22, condition: "Nublado" },
  ]
};

const THEMES = {
  Clear: ['#4facfe', '#00f2fe'], 
  Clouds: ['#636fa4', '#e8cbc0'], 
  Rain: ['#373B44', '#4286f4'], 
  Thunderstorm: ['#141E30', '#243B55'], 
  Drizzle: ['#89F7FE', '#66A6FF'], 
  Snow: ['#83a4d4', '#b6fbff'], 
  Night: ['#0f2027', '#203a43', '#2c5364'], 
  Default: ['#4facfe', '#00f2fe']
};

let interstitial = null;

// Componentes Auxiliares (Definidos antes para evitar ReferenceError)
const DetailCard = ({ icon, title, value }) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={24} color="rgba(255,255,255,0.7)" />
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(THEMES.Default);
  const [searchText, setSearchText] = useState('');
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Carrega fontes
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialCommunityIcons.font,
          ...FontAwesome5.font,
        });
        
        // Inicializa AdMob (Intersticial) de forma segura
        loadInterstitial();

        // Carrega localização
        await loadCurrentLocation();
      } catch (e) {
        console.warn("Erro na inicialização:", e);
      } finally {
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      try {
        await SplashScreen.hideAsync();
      } catch (e) {
        console.warn("Erro ao esconder splash:", e);
      }
    }
  }, [appIsReady]);

  const loadInterstitial = () => {
    try {
      const ad = InterstitialAd.createForAdRequest(ADMOB_CONFIG.interstitialId, {
        requestNonPersonalizedAdsOnly: true,
      });

      ad.addAdEventListener(AdEventType.LOADED, () => {
        setInterstitialLoaded(true);
        interstitial = ad;
      });

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setInterstitialLoaded(false);
        interstitial = null;
        loadInterstitial();
      });

      // Adiciona listener de erro para não crashar silenciosamente
      ad.addAdEventListener(AdEventType.ERROR, (error) => {
         console.warn("AdMob Interstitial Error:", error);
      });

      ad.load();
    } catch (e) {
      console.log("Erro ao configurar AdMob:", e);
    }
  };

  const showInterstitial = (callback) => {
    if (interstitialLoaded && interstitial) {
      try {
        interstitial.show();
        if (callback) callback();
      } catch (e) {
        console.warn("Erro ao mostrar Ad:", e);
        if (callback) callback();
      }
    } else {
      if (callback) callback();
    }
  };

  const loadCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        loadMockData(); 
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      console.warn("Erro Location:", error);
      loadMockData();
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;
    Keyboard.dismiss();
    showInterstitial(() => {
      fetchCityByName(searchText);
    });
  };

  const fetchCityByName = async (city) => {
    setLoading(true);
    if (!API_KEY) { loadMockData(); return; } 

    try {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        fetchWeather(geoData[0].lat, geoData[0].lon);
      } else {
        Alert.alert("Erro", "Cidade não encontrada.");
        setLoading(false);
      }
    } catch (e) {
      loadMockData();
    }
  };

  const fetchWeather = async (lat, lon) => {
    if (!API_KEY) { loadMockData(); return; }
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`);
      const data = await res.json();
      const resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`);
      const dataForecast = await resForecast.json();

      if (res.ok && resForecast.ok) {
        processWeatherData(data, dataForecast);
      } else {
        throw new Error("API Error");
      }
    } catch (e) {
      loadMockData();
    }
  };

  const processWeatherData = (data, dataForecast) => {
    const isNight = data.weather[0].icon.includes('n');
    const condition = data.weather[0].main;

    if (isNight) setTheme(THEMES.Night);
    else if (THEMES[condition]) setTheme(THEMES[condition]);
    else setTheme(THEMES.Default);

    const dailyForecast = dataForecast.list
      .filter(item => item.dt_txt.includes("12:00:00"))
      .slice(0, 5)
      .map(item => ({
        id: item.dt,
        day: new Date(item.dt * 1000).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        icon: mapIcon(item.weather[0].main, item.weather[0].icon.includes('n')),
        tempMax: Math.round(item.main.temp_max),
        tempMin: Math.round(item.main.temp_min),
        condition: item.weather[0].description
      }));

    setWeather({
      city: data.name,
      temp: Math.round(data.main.temp),
      desc: data.weather[0].description,
      hum: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6), 
      icon: mapIcon(condition, isNight),
      feels_like: Math.round(data.main.feels_like),
      uv: "Mod", 
      forecast: dailyForecast
    });
    setLoading(false);
  };

  const loadMockData = () => {
    setTimeout(() => {
      setTheme(THEMES.Clear);
      setWeather({
         city: "Teresina (Simulado)",
         ...MOCK_DATA.current,
         icon: "weather-sunny",
         forecast: MOCK_DATA.forecast
      });
      setLoading(false);
    }, 1000);
  };

  const mapIcon = (condition, isNight) => {
    if (isNight) return "weather-night";
    switch(condition) {
      case 'Clouds': return "weather-cloudy";
      case 'Rain': return "weather-pouring";
      case 'Thunderstorm': return "weather-lightning";
      case 'Snow': return "weather-snowy";
      default: return "weather-sunny";
    }
  };

  const mapApiIconToMaterial = (condition, isNight) => mapIcon(condition, isNight);

  if (!appIsReady) return null;

  if (loading) {
    return (
      <View style={styles.loadingContainer} onLayout={onLayoutRootView}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Buscando previsão...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={theme} style={styles.container} onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        
        <View style={styles.searchBar}>
          <TextInput 
            style={styles.input} 
            placeholder="Buscar cidade..." 
            placeholderTextColor="rgba(255,255,255,0.7)"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity onPress={handleSearch}>
            <Ionicons name="search" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.mainInfo}>
            <Text style={styles.cityName}>{weather?.city}</Text>
            <MaterialCommunityIcons name={weather?.icon} size={120} color="#fff" />
            <Text style={styles.temp}>{weather?.temp}°</Text>
            <Text style={styles.desc}>{weather?.desc}</Text>
          </View>

          <View style={styles.grid}>
            <DetailCard icon="water-outline" title="Umidade" value={weather?.hum + '%'} />
            <DetailCard icon="thermometer-outline" title="Sensação" value={weather?.feels_like + '°'} />
            <DetailCard icon="speedometer-outline" title="Vento" value={weather?.wind + ' km/h'} />
            <DetailCard icon="sunny-outline" title="UV" value={weather?.uv} />
          </View>

          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>Próximos Dias</Text>
            {weather?.forecast && weather.forecast.map((item) => (
                <View key={item.id} style={styles.forecastRow}>
                  <Text style={styles.dayText}>{item.day}</Text>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                      <MaterialCommunityIcons name={mapIcon(item.condition, false)} size={24} color="#fff" style={{marginRight:10}} />
                      <Text style={styles.forecastCondition}>{item.condition}</Text>
                  </View>
                  <View style={{flexDirection:'row'}}>
                      <Text style={styles.tempMax}>{item.tempMax}°</Text>
                      <Text style={styles.tempMin}>{item.tempMin}°</Text>
                  </View>
                </View>
            ))}
          </View>
        </ScrollView>

        {/* --- BANNER ADMOB REAL (RODAPÉ) --- */}
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
          <BannerAd
            unitId={ADMOB_CONFIG.bannerId}
            size={BannerAdSize.BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: true,
            }}
            onAdFailedToLoad={(error) => console.warn('Banner falhou:', error)}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Desenvolvido por Adriano Ferreira de Oliveira</Text>
          <View style={styles.footerLinks}>
             <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('https://linkedin.com/in/adrianoferreira-dev')}>
               <FontAwesome5 name="linkedin" size={14} color="#fff" />
             </TouchableOpacity>
             <Text style={{color:'rgba(255,255,255,0.5)'}}>|</Text>
             <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('https://wa.me/5586999830819')}>
               <FontAwesome5 name="whatsapp" size={14} color="#fff" />
             </TouchableOpacity>
          </View>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#0f2027', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  searchBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', margin: 20, padding: 10, borderRadius: 25, alignItems: 'center' },
  input: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 10 },
  content: { paddingHorizontal: 20 },
  mainInfo: { alignItems: 'center', marginTop: 20 },
  cityName: { fontSize: 32, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  temp: { fontSize: 80, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 20, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 40 },
  card: { width: '30%', backgroundColor: 'rgba(255,255,255,0.15)', padding: 15, borderRadius: 15, alignItems: 'center' },
  cardVal: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginTop: 5 },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12 },
  forecastContainer: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 20, marginTop: 20 },
  forecastTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dayText: { color: '#fff', width: 50, fontWeight: 'bold' },
  forecastCondition: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'capitalize' },
  tempMax: { color: '#fff', fontWeight: 'bold', marginRight: 10 },
  tempMin: { color: 'rgba(255,255,255,0.6)' },
  footer: { alignItems: 'center', padding: 20 },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' },
  footerLinks: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  link: { padding: 5 }
});