import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, TextInput, Modal, Image, Alert, Keyboard, Linking, Platform, Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// MUDANÇA: Usando ícones nativos do Expo para evitar tela branca no Expo Go
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// 💰 ÁREA DE MONETIZAÇÃO (ADMOB)
// ============================================================================
const ADMOB_CONFIG = {
  appId: 'ca-app-pub-4541742841922750~8099858895', 
  bannerId: 'ca-app-pub-4541742841922750/9142629209',
  interstitialId: 'ca-app-pub-4541742841922750/6756139011'
};

// --- CONFIGURAÇÃO API (OpenWeatherMap) ---
// SEGURANÇA: A chave agora é carregada do arquivo .env local.
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY; 

// --- DADOS DE FALLBACK (MOCK) ---
const MOCK_DATA = {
  location: "Teresina, BR (Simulado)",
  current: {
    temp: 32, condition: "Ensolarado", description: "Dados simulados (Erro na API)",
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

// Temas Visuais (Gradientes)
const THEMES = {
  Clear: ['#4facfe', '#00f2fe'], // Céu Azul
  Clouds: ['#636fa4', '#e8cbc0'], // Nublado
  Rain: ['#373B44', '#4286f4'], // Chuva
  Thunderstorm: ['#141E30', '#243B55'], // Tempestade
  Drizzle: ['#89F7FE', '#66A6FF'], // Garoa
  Snow: ['#83a4d4', '#b6fbff'], // Neve
  Night: ['#0f2027', '#203a43', '#2c5364'], // Noite
  Default: ['#4facfe', '#00f2fe']
};

export default function App() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(THEMES.Default);
  const [searchText, setSearchText] = useState('');
  
  // Monetização
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  // --- LÓGICA DE CLIMA ---
  const loadCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permissão negada", "Precisamos do GPS para mostrar o clima local.");
        loadMockData(); 
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      fetchWeather(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      loadMockData();
    }
  };

  const handleSearch = () => {
    if (!searchText.trim()) return;
    Keyboard.dismiss();
    // ADS: Mostra anúncio ao pesquisar cidade
    triggerAd(() => fetchCityByName(searchText));
  };

  const fetchCityByName = async (city) => {
    setLoading(true);
    if (!API_KEY) { 
      console.log("Sem chave de API no .env"); 
      loadMockData(); 
      return; 
    } 

    try {
      // Busca lat/lon pelo nome
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        fetchWeather(geoData[0].lat, geoData[0].lon);
      } else {
        Alert.alert("Erro", "Cidade não encontrada.");
        setLoading(false);
      }
    } catch (e) {
      console.warn("Erro Geo:", e);
      loadMockData();
    }
  };

  const fetchWeather = async (lat, lon) => {
    if (!API_KEY) { loadMockData(); return; }

    try {
      // Clima Atual
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`);
      const data = await res.json();
      
      // Previsão (5 dias / 3 horas)
      const resForecast = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${API_KEY}`);
      const dataForecast = await resForecast.json();

      if (res.ok && resForecast.ok) {
        processWeatherData(data, dataForecast);
      } else {
        throw new Error();
      }
    } catch (e) {
      console.warn("Erro Weather API:", e);
      loadMockData();
    }
  };

  const processWeatherData = (data, dataForecast) => {
    const isNight = data.weather[0].icon.includes('n');
    const condition = data.weather[0].main;

    if (isNight) setTheme(THEMES.Night);
    else if (THEMES[condition]) setTheme(THEMES[condition]);
    else setTheme(THEMES.Default);

    // Processar Previsão (Pegar 1 por dia aprox)
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
      forecast: dailyForecast
    });
    setLoading(false);
  };

  const loadMockData = () => {
    setTimeout(() => {
      setTheme(THEMES.Clear);
      // Mescla com forecast mock se necessário
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
      case 'Drizzle': return "weather-partly-rainy";
      default: return "weather-sunny";
    }
  };

  // --- LÓGICA DE ADS ---
  const triggerAd = (callback) => {
    setPendingAction(() => callback);
    setAdTimer(5);
    setShowAd(true);
  };

  useEffect(() => {
    let interval;
    if (showAd && adTimer > 0) interval = setInterval(() => setAdTimer(t => t - 1), 1000);
    else if (adTimer === 0) clearInterval(interval);
    return () => clearInterval(interval);
  }, [showAd, adTimer]);

  const closeAd = () => {
    setShowAd(false);
    if (pendingAction) pendingAction();
    setPendingAction(null);
  };

  // --- COMPONENTE DE BANNER (Simulado para Expo Go) ---
  const AdMobBanner = () => (
    <View style={styles.adBannerContainer}>
      <View style={styles.adLabelContainer}><Text style={styles.adLabelText}>Ad</Text></View>
      <View style={styles.adContent}>
        <Text style={styles.adTitle}>Google AdMob Banner</Text>
        <Text style={styles.adSubtitle}>ID: {ADMOB_CONFIG.bannerId.substring(0, 15)}...</Text>
      </View>
    </View>
  );

  // --- RENDER ---
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Buscando previsão...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={theme} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* BUSCA */}
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
          
          {/* INFO PRINCIPAL */}
          <View style={styles.mainInfo}>
            <Text style={styles.cityName}>{weather?.city}</Text>
            <MaterialCommunityIcons name={weather?.icon} size={120} color="#fff" />
            <Text style={styles.temp}>{weather?.temp}°</Text>
            <Text style={styles.desc}>{weather?.desc}</Text>
          </View>

          {/* DETALHES (GRID) */}
          <View style={styles.grid}>
            <View style={styles.card}>
              <Ionicons name="water-outline" size={24} color="#fff" />
              <Text style={styles.cardVal}>{weather?.hum}%</Text>
              <Text style={styles.cardLabel}>Umidade</Text>
            </View>
            <View style={styles.card}>
              <Ionicons name="thermometer-outline" size={24} color="#fff" />
              <Text style={styles.cardVal}>{weather?.feels_like}°</Text>
              <Text style={styles.cardLabel}>Sensação</Text>
            </View>
            <View style={styles.card}>
              <MaterialCommunityIcons name="weather-windy" size={24} color="#fff" />
              <Text style={styles.cardVal}>{weather?.wind} km/h</Text>
              <Text style={styles.cardLabel}>Vento</Text>
            </View>
          </View>

          {/* PREVISÃO */}
          <View style={styles.forecastContainer}>
             <Text style={styles.forecastTitle}>Próximos Dias</Text>
             {weather?.forecast && weather.forecast.map((item) => (
                <View key={item.id} style={styles.forecastRow}>
                   <Text style={styles.dayText}>{item.day}</Text>
                   <View style={{flexDirection:'row', alignItems:'center'}}>
                      <MaterialCommunityIcons name={item.icon} size={24} color="#fff" style={{marginRight:10}} />
                      <Text style={styles.forecastCondition}>{item.condition}</Text>
                   </View>
                   <View style={{flexDirection:'row'}}>
                      <Text style={styles.tempMax}>{item.tempMax}°</Text>
                      <Text style={styles.tempMin}>{item.tempMin}°</Text>
                   </View>
                </View>
             ))}
          </View>

          {/* BANNER ADS */}
          <View style={styles.bannerWrapper}>
            <AdMobBanner />
          </View>

        </ScrollView>

        {/* MODAL INTERSTICIAL */}
        <Modal visible={showAd} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.adContent}>
              <View style={styles.adHeader}><Text style={styles.adHeaderText}>PUBLICIDADE</Text></View>
              <View style={styles.adBody}>
                <MaterialCommunityIcons name="umbrella-outline" size={60} color="#0284c7" />
                <Text style={styles.adBodyTitle}>Proteção Total</Text>
                <Text style={styles.adBodyText}>Seguro contra chuvas e tempestades. Confira!</Text>
                <TouchableOpacity disabled={adTimer > 0} onPress={closeAd} style={[styles.closeBtn, adTimer > 0 && {backgroundColor:'#94a3b8'}]}>
                  <Text style={styles.closeBtnText}>{adTimer > 0 ? `Fechar em ${adTimer}s` : 'FECHAR'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* FOOTER */}
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
  
  forecastContainer: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 20, marginTop: 30 },
  forecastTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dayText: { color: '#fff', width: 50, fontWeight: 'bold' },
  forecastCondition: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'capitalize' },
  tempMax: { color: '#fff', fontWeight: 'bold', marginRight: 10 },
  tempMin: { color: 'rgba(255,255,255,0.6)' },

  // Banner Ad Simulado
  bannerWrapper: { marginTop: 40, alignItems: 'center' },
  adBannerContainer: { width: 320, height: 50, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc' },
  adLabelContainer: { backgroundColor: '#facc15', width: 20, height: '100%', justifyContent: 'center', alignItems: 'center' },
  adLabelText: { fontSize: 10, fontWeight: 'bold', color: '#78350f', transform: [{ rotate: '-90deg' }] },
  adContent: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  adTitle: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  adSubtitle: { fontSize: 10, color: '#666' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  adContent: { backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden' },
  adHeader: { backgroundColor: '#e0f2fe', padding: 10, alignItems: 'center' },
  adHeaderText: { fontWeight: 'bold', color: '#0369a1' },
  adBody: { padding: 30, alignItems: 'center' },
  adBodyTitle: { fontSize: 20, fontWeight: 'bold', marginVertical: 15 },
  adBodyText: { textAlign: 'center', color: '#666', marginBottom: 20 },
  closeBtn: { backgroundColor: '#0284c7', paddingVertical: 12, width: '100%', alignItems: 'center', borderRadius: 8 },
  closeBtnText: { color: '#fff', fontWeight: 'bold' },
  
  // Footer
  footer: { alignItems: 'center', padding: 20 },
  footerText: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold' },
  footerLinks: { flexDirection: 'row', marginTop: 5, alignItems: 'center' },
  link: { padding: 5 }
});