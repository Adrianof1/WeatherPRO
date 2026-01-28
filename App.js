import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, TextInput, Modal, Image, Alert, Keyboard, Platform, Dimensions, RefreshControl, Linking
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

// ============================================================================
// 💰 ÁREA DE MONETIZAÇÃO (ADMOB)
// ============================================================================
const ADMOB_CONFIG = {
  appId: 'ca-app-pub-4541742841922750~8099858895', 
  bannerId: 'ca-app-pub-4541742841922750/9142629209',
  interstitialId: 'ca-app-pub-4541742841922750/6756139011'
};

// --- CONFIGURAÇÃO API ---
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY; 

// --- DADOS DE FALLBACK (MOCK) ---
const MOCK_DATA = {
  location: "Teresina, BR (Simulado)",
  current: {
    temp: 32, condition: "Ensolarado", description: "Céu limpo",
    humidity: "45", wind: "12", feels_like: "38", uv: "8", isDay: true, iconName: "weather-sunny",
    aqi: "Bom (20)", sunrise: "05:45", sunset: "18:15"
  },
  hourly: [
    { id: 'h1', time: '13:00', temp: 33, icon: 'weather-sunny' },
    { id: 'h2', time: '14:00', temp: 34, icon: 'weather-sunny' },
    { id: 'h3', time: '15:00', temp: 33, icon: 'weather-partly-cloudy' },
    { id: 'h4', time: '16:00', temp: 31, icon: 'weather-cloudy' },
    { id: 'h5', time: '17:00', temp: 29, icon: 'weather-rainy' },
    { id: 'h6', time: '18:00', temp: 28, icon: 'weather-rainy' },
  ],
  forecast: [
    { id: 1, day: "Hoje", icon: "sunny", tempMax: 34, tempMin: 24, condition: "Sol" },
    { id: 2, day: "Amanhã", icon: "partly-sunny", tempMax: 33, tempMin: 23, condition: "Parcialmente nublado" },
    { id: 3, day: "Qui", icon: "rainy", tempMax: 29, tempMin: 22, condition: "Chuva" },
    { id: 4, day: "Sex", icon: "thunderstorm", tempMax: 28, tempMin: 21, condition: "Tempestade" },
    { id: 5, day: "Sáb", icon: "cloudy", tempMax: 30, tempMin: 22, condition: "Nublado" },
  ]
};

// Temas Visuais (Gradientes)
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

export default function App() {
  const [activeTab, setActiveTab] = useState('clima'); 
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
  const loadCurrentLocation = async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if(!isRefresh) Alert.alert("Permissão negada", "Precisamos do GPS para mostrar o clima local.");
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
    triggerAd(() => fetchCityByName(searchText));
  };

  const fetchCityByName = async (city) => {
    setLoading(true);
    if (!API_KEY) { 
      loadMockData(); 
      return; 
    } 

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
        throw new Error();
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

    const hourlyForecast = dataForecast.list.slice(0, 8).map(item => ({
      id: item.dt,
      time: new Date(item.dt * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      temp: Math.round(item.main.temp),
      icon: mapApiIconToMaterial(item.weather[0].main, item.weather[0].icon.includes('n'))
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
      aqi: "Bom", 
      sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      forecast: dailyForecast,
      hourly: hourlyForecast
    });
    setLoading(false);
    setRefreshing(false);
  };

  const loadMockData = () => {
    setTimeout(() => {
      setTheme(THEMES.Clear);
      setWeather({
         city: "Teresina (Simulado)",
         ...MOCK_DATA.current,
         icon: "weather-sunny",
         forecast: MOCK_DATA.forecast,
         hourly: MOCK_DATA.hourly
      });
      setLoading(false);
      setRefreshing(false);
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

  const mapApiIconToMaterial = (condition, isNight) => mapIcon(condition, isNight);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadCurrentLocation(true);
  }, []);

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

  const openRadar = () => {
    triggerAd(() => setActiveTab('radar'));
  };

  // --- COMPONENTES VISUAIS ---

  const DetailCard = ({ icon, title, value }) => (
    <View style={styles.card}>
      <Ionicons name={icon} size={24} color="rgba(255,255,255,0.9)" />
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );

  const AdMobBanner = () => (
    <View style={styles.adBannerContainer}>
      <View style={styles.adLabelContainer}><Text style={styles.adLabelText}>Ad</Text></View>
      <View style={styles.adContent}>
        <Text style={styles.adTitle}>Google AdMob Banner</Text>
        <Text style={styles.adSubtitle}>ID: {ADMOB_CONFIG.bannerId.substring(0, 15)}...</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Carregando previsão...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={theme} style={styles.container}>
      <StatusBar barStyle="light-content" translucent={true} backgroundColor="transparent" />
      
      {/* SafeAreaView personalizada para evitar problemas no Android */}
      <View style={[styles.safeArea, { paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 40 }]}>
        
        {/* HEADER */}
        <View style={styles.header}>
           <View style={styles.locationInfo}>
              <Ionicons name="location" size={20} color="#fff" style={{marginRight: 5}}/>
              <Text style={styles.locationText}>{weather?.city}</Text>
           </View>
           <View style={{flexDirection: 'row'}}>
             <TouchableOpacity style={styles.iconBtn} onPress={openRadar}>
               <MaterialCommunityIcons name="radar" size={24} color="#fff" />
             </TouchableOpacity>
           </View>
        </View>

        {/* ABAS */}
        <View style={styles.tabContainer}>
           <TouchableOpacity onPress={() => setActiveTab('clima')} style={[styles.tabBtn, activeTab === 'clima' && styles.tabActive]}>
             <Text style={[styles.tabText, activeTab === 'clima' && styles.tabTextActive]}>Hoje</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => setActiveTab('radar')} style={[styles.tabBtn, activeTab === 'radar' && styles.tabActive]}>
             <Text style={[styles.tabText, activeTab === 'radar' && styles.tabTextActive]}>Radar</Text>
           </TouchableOpacity>
        </View>

        {activeTab === 'clima' && (
          <ScrollView 
            contentContainerStyle={styles.content}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
            showsVerticalScrollIndicator={false}
          >
            {/* BUSCA */}
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
              <TextInput 
                style={styles.input} 
                placeholder="Buscar outra cidade..." 
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={searchText}
                onChangeText={setSearchText}
                onSubmitEditing={handleSearch}
              />
            </View>

            {/* DESTAQUE */}
            <View style={styles.mainInfo}>
              <MaterialCommunityIcons name={weather?.icon} size={110} color="#fff" style={{ marginBottom: 10 }} />
              <Text style={styles.temp}>{weather?.temp}°</Text>
              <Text style={styles.desc}>{weather?.desc}</Text>
              <Text style={styles.minMax}>Sensação {weather?.feels_like}°</Text>
            </View>

            {/* PREVISÃO HORÁRIA (CARROSSEL) */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Hoje</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{paddingVertical: 10}}>
                {weather?.hourly && weather.hourly.map((h, i) => (
                   <View key={i} style={styles.hourlyItem}>
                      <Text style={styles.hourlyTime}>{h.time}</Text>
                      <MaterialCommunityIcons name={h.icon} size={28} color="#fff" style={{marginVertical: 5}} />
                      <Text style={styles.hourlyTemp}>{h.temp}°</Text>
                   </View>
                ))}
              </ScrollView>
            </View>

            {/* DETALHES (GRID) */}
            <View style={styles.grid}>
              <DetailCard icon="water-outline" title="Umidade" value={`${weather?.hum}%`} />
              <DetailCard icon="speedometer-outline" title="Vento" value={`${weather?.wind} km/h`} />
              <DetailCard icon="sunny-outline" title="Índice UV" value={weather?.uv} />
              <DetailCard icon="leaf-outline" title="Qualidade Ar" value={weather?.aqi || 'Bom'} />
            </View>

            {/* PREVISÃO SEMANAL */}
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>Próximos 5 Dias</Text>
              {weather?.forecast && weather.forecast.map((item, index) => (
                  <View key={index} style={styles.forecastRow}>
                    <Text style={styles.dayText}>{item.day}</Text>
                    <View style={styles.forecastIconContainer}>
                        <MaterialCommunityIcons name={mapApiIconToMaterial(item.condition, false)} size={24} color="#fff" />
                        <Text style={styles.forecastCondition}>{item.condition}</Text>
                    </View>
                    <View style={styles.tempRange}>
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

            {/* FOOTER */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Desenvolvido por Adriano Ferreira de Oliveira</Text>
              <View style={styles.footerLinks}>
                 <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('https://linkedin.com/in/adrianoferreira-dev')}>
                   <FontAwesome5 name="linkedin" size={16} color="#fff" />
                 </TouchableOpacity>
                 <Text style={{color:'rgba(255,255,255,0.5)', marginHorizontal: 10}}>|</Text>
                 <TouchableOpacity style={styles.link} onPress={() => Linking.openURL('https://wa.me/5586999830819')}>
                   <FontAwesome5 name="whatsapp" size={16} color="#fff" />
                 </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        )}

        {/* TELA RADAR */}
        {activeTab === 'radar' && (
           <View style={styles.radarContainer}>
              <View style={styles.radarHeader}>
                 <Text style={styles.radarTitle}>Radar em Tempo Real</Text>
              </View>
              <View style={styles.radarMapPlaceholder}>
                 <View style={{alignItems:'center', justifyContent:'center', flex:1}}>
                    <MaterialCommunityIcons name="radar" size={80} color="rgba(255,255,255,0.5)" />
                    <Text style={{color:'#fff', marginTop:10, fontWeight:'bold', fontSize: 18}}>Radar Ativo</Text>
                    <Text style={{color:'rgba(255,255,255,0.7)', fontSize: 12}}>Monitorando chuvas na região</Text>
                 </View>
              </View>
              <View style={styles.bannerWrapper}>
                <AdMobBanner />
              </View>
           </View>
        )}

        {/* MODAL INTERSTICIAL */}
        <Modal visible={showAd} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.adContent}>
              <View style={styles.adHeader}>
                <Text style={styles.adHeaderText}>PUBLICIDADE</Text>
                <TouchableOpacity onPress={closeAd} disabled={adTimer > 0}>
                   <Ionicons name="close" size={24} color={adTimer > 0 ? "#ccc" : "#333"} />
                </TouchableOpacity>
              </View>
              <View style={styles.adBody}>
                <MaterialCommunityIcons name="umbrella" size={60} color="#0ea5e9" />
                <Text style={styles.adBodyTitle}>Proteção Total</Text>
                <Text style={styles.adBodyText}>Seguro contra chuvas e tempestades. Confira as melhores ofertas hoje!</Text>
                <TouchableOpacity disabled={adTimer > 0} onPress={closeAd} style={[styles.closeBtn, adTimer > 0 && {backgroundColor:'#94a3b8'}]}>
                  <Text style={styles.closeBtnText}>{adTimer > 0 ? `Fechar em ${adTimer}s` : 'FECHAR ANÚNCIO'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#0f2027', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10, fontSize: 16 },
  safeArea: { flex: 1 },

  // Header & Tabs
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10 },
  locationInfo: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#fff', fontSize: 20, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 5 },
  iconBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 },
  
  tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10, backgroundColor: 'rgba(0,0,0,0.2)', marginHorizontal: 40, borderRadius: 25, padding: 4 },
  tabBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.2)' },
  tabText: { color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },

  searchBar: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', marginBottom: 20, padding: 10, borderRadius: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  input: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 10 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  
  mainInfo: { alignItems: 'center', marginBottom: 30 },
  cityName: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 5 },
  temp: { fontSize: 90, fontWeight: 'bold', color: '#fff', textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 10 },
  desc: { fontSize: 22, color: '#fff', textTransform: 'capitalize', fontWeight: '500' },
  minMax: { fontSize: 16, color: 'rgba(255,255,255,0.8)', marginTop: 5 },
  
  // Hourly
  sectionContainer: { marginBottom: 20 },
  sectionTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  hourlyItem: { alignItems: 'center', marginRight: 15, backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 18, minWidth: 70 },
  hourlyTime: { color: 'rgba(255,255,255,0.8)', fontSize: 12 },
  hourlyTemp: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginBottom: 20 },
  card: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardVal: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginTop: 5 },
  cardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  
  forecastContainer: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 25, padding: 20, marginBottom: 20 },
  forecastTitle: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 15, marginLeft: 5 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dayText: { color: '#fff', width: 60, fontWeight: 'bold', fontSize: 16 },
  forecastIconContainer: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  forecastCondition: { color: 'rgba(255,255,255,0.8)', fontSize: 14, textTransform: 'capitalize', marginLeft: 10 },
  tempRange: { flexDirection: 'row', width: 80, justifyContent: 'flex-end' },
  tempMax: { color: '#fff', fontWeight: 'bold', marginRight: 10, fontSize: 16 },
  tempMin: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },

  // Radar
  radarContainer: { flex: 1, padding: 20 },
  radarHeader: { flexDirection: 'row', justifyContent: 'center', marginBottom: 15 },
  radarTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  radarMapPlaceholder: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 20 },
  radarOverlay: { position: 'absolute', alignItems: 'center' },

  // Banner Ad Simulado
  bannerWrapper: { alignItems: 'center', marginBottom: 20 },
  adBannerContainer: { width: 320, height: 50, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderColor: '#ccc', borderRadius: 0 },
  adLabelContainer: { backgroundColor: '#facc15', width: 20, height: '100%', justifyContent: 'center', alignItems: 'center' },
  adLabelText: { fontSize: 10, fontWeight: 'bold', color: '#78350f', transform: [{ rotate: '-90deg' }] },
  adContent: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  adTitle: { fontSize: 12, fontWeight: 'bold', color: '#333' },
  adSubtitle: { fontSize: 10, color: '#666' },
  
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  adContent: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', padding: 0, width: '100%', maxWidth: 350 },
  adHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  adHeaderText: { fontWeight: 'bold', color: '#666', fontSize: 12 },
  adBody: { padding: 30, alignItems: 'center' },
  adBodyTitle: { fontSize: 22, fontWeight: 'bold', marginVertical: 15, color: '#333' },
  adBodyText: { textAlign: 'center', color: '#666', marginBottom: 25, lineHeight: 20 },
  closeBtn: { backgroundColor: '#0284c7', paddingVertical: 14, width: '100%', alignItems: 'center', borderRadius: 12 },
  closeBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  
  // Footer
  footer: { alignItems: 'center', padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 'bold' },
  footerLinks: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  link: { padding: 8 }
});