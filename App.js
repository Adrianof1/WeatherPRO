import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, Text, View, ScrollView, TouchableOpacity, 
  SafeAreaView, StatusBar, ActivityIndicator, TextInput, Modal, Image, Alert, Keyboard, Linking, Platform, RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// Ícones nativos do Expo (Garante zero tela branca no Expo Go)
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

// --- CONFIGURAÇÃO API ---
const API_KEY = process.env.EXPO_PUBLIC_WEATHER_API_KEY; 

// --- DADOS DE FALLBACK (MOCK) ---
const MOCK_DATA = {
  location: "Teresina, BR (Simulado)",
  current: {
    temp: 32, condition: "Ensolarado", description: "Dados simulados",
    humidity: "45%", wind: "12 km/h", feels_like: "38°", uv: "8", isDay: true, iconName: "weather-sunny",
    aqi: "Bom (20)", sunrise: "05:45", sunset: "18:15"
  },
  hourly: [
    { id: 'h1', time: '13:00', temp: 33, icon: 'weather-sunny' },
    { id: 'h2', time: '14:00', temp: 34, icon: 'weather-sunny' },
    { id: 'h3', time: '15:00', temp: 33, icon: 'weather-partly-cloudy' },
    { id: 'h4', time: '16:00', temp: 31, icon: 'weather-cloudy' },
    { id: 'h5', time: '17:00', temp: 29, icon: 'weather-rainy' },
  ],
  forecast: [
    { id: 1, day: "Hoje", icon: "sunny", tempMax: 34, tempMin: 24, condition: "Sol" },
    { id: 2, day: "Amanhã", icon: "partly-sunny", tempMax: 33, tempMin: 23, condition: "Nublado" },
    { id: 3, day: "Qui", icon: "rainy", tempMax: 29, tempMin: 22, condition: "Chuva" },
    { id: 4, day: "Sex", icon: "thunderstorm", tempMax: 28, tempMin: 21, condition: "Tempestade" },
    { id: 5, day: "Sáb", icon: "cloudy", tempMax: 30, tempMin: 22, condition: "Nublado" },
  ]
};

// Temas Visuais
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
  const [refreshing, setRefreshing] = useState(false); // Estado para Pull-to-Refresh
  const [theme, setTheme] = useState(THEMES.Default);
  const [searchText, setSearchText] = useState('');
  
  // Monetização
  const [showAd, setShowAd] = useState(false);
  const [adTimer, setAdTimer] = useState(5);
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    loadCurrentLocation();
  }, []);

  // --- LÓGICA DE ATUALIZAÇÃO (PULL TO REFRESH) ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Recarrega o local atual ou a busca, dependendo do contexto
    // Aqui forçamos recarregar o GPS para garantir dados frescos
    loadCurrentLocation(true).then(() => setRefreshing(false));
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
      await fetchWeather(location.coords.latitude, location.coords.longitude);
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
        await fetchWeather(geoData[0].lat, geoData[0].lon);
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

  // --- COMPONENTES AUXILIARES ---
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
  if (loading && !refreshing) {
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
        
        {/* HEADER TABS & REFRESH */}
        <View style={styles.tabHeader}>
           <View style={{flexDirection:'row'}}>
             <TouchableOpacity 
               style={[styles.tabBtn, activeTab === 'clima' && styles.tabBtnActive]} 
               onPress={() => setActiveTab('clima')}
             >
               <Text style={[styles.tabText, activeTab === 'clima' && {color:'#fff', fontWeight:'bold'}]}>Clima</Text>
             </TouchableOpacity>
             <TouchableOpacity 
               style={[styles.tabBtn, activeTab === 'radar' && styles.tabBtnActive]} 
               onPress={openRadar}
             >
               <MaterialCommunityIcons name="radar" size={16} color={activeTab === 'radar' ? '#fff' : 'rgba(255,255,255,0.7)'} />
               <Text style={[styles.tabText, activeTab === 'radar' && {color:'#fff', fontWeight:'bold'}, {marginLeft:5}]}>Radar</Text>
             </TouchableOpacity>
           </View>
           
           {/* Botão de Atualizar Manual (Extra) */}
           <TouchableOpacity style={styles.refreshBtn} onPress={() => onRefresh()}>
              <Ionicons name="refresh" size={20} color="#fff" />
           </TouchableOpacity>
        </View>

        {/* TELA CLIMA */}
        {activeTab === 'clima' && (
          <>
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

            <ScrollView 
              contentContainerStyle={styles.content}
              // AQUI ESTÁ O PULL TO REFRESH:
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
              }
            >
              
              {/* INFO PRINCIPAL */}
              <View style={styles.mainInfo}>
                <Text style={styles.cityName}>{weather?.city}</Text>
                <MaterialCommunityIcons name={weather?.icon} size={100} color="#fff" />
                <Text style={styles.temp}>{weather?.temp}°</Text>
                <Text style={styles.desc}>{weather?.desc}</Text>
              </View>

              {/* PREVISÃO HORÁRIA */}
              <View style={styles.hourlyContainer}>
                 <Text style={styles.sectionTitle}>Hoje (3h em 3h)</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {weather?.hourly && weather.hourly.map((h) => (
                       <View key={h.id} style={styles.hourlyItem}>
                          <Text style={styles.hourlyTime}>{h.time}</Text>
                          <MaterialCommunityIcons name={h.icon} size={24} color="#fff" />
                          <Text style={styles.hourlyTemp}>{h.temp}°</Text>
                       </View>
                    ))}
                 </ScrollView>
              </View>

              {/* DETALHES (GRID) */}
              <View style={styles.grid}>
                <DetailCard icon="water-outline" title="Umidade" value={weather?.hum + '%'} />
                <DetailCard icon="thermometer-outline" title="Sensação" value={weather?.feels_like + '°'} />
                <DetailCard icon="speedometer-outline" title="Vento" value={weather?.wind + ' km/h'} />
                <DetailCard icon="sunny-outline" title="UV" value={weather?.uv} />
                <DetailCard icon="leaf-outline" title="Qualidade Ar" value={weather?.aqi || 'Bom'} />
                <DetailCard icon="time-outline" title="Nascer Sol" value={weather?.sunrise} />
              </View>

              {/* PREVISÃO SEMANAL */}
              <View style={styles.forecastContainer}>
                <Text style={styles.forecastTitle}>Próximos 5 Dias</Text>
                {weather?.forecast && weather.forecast.map((item) => (
                    <View key={item.id} style={styles.forecastRow}>
                      <Text style={styles.dayText}>{item.day}</Text>
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                          <MaterialCommunityIcons name={mapApiIconToMaterial(item.condition, false)} size={24} color="#fff" style={{marginRight:10}} />
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
          </>
        )}

        {/* TELA RADAR (SIMULADA) */}
        {activeTab === 'radar' && (
           <View style={styles.radarContainer}>
              <View style={styles.radarHeader}>
                 <Text style={styles.radarTitle}>Radar de Chuva (Ao Vivo)</Text>
                 <TouchableOpacity onPress={loadCurrentLocation}><Ionicons name="refresh" size={24} color="#fff" /></TouchableOpacity>
              </View>
              <View style={styles.radarMapPlaceholder}>
                 <View style={{alignItems:'center', justifyContent:'center', flex:1}}>
                    <MaterialCommunityIcons name="radar" size={80} color="rgba(255,255,255,0.3)" />
                    <Text style={{color:'#fff', marginTop:10, fontWeight:'bold'}}>Radar Ativo</Text>
                 </View>
              </View>
              <View style={styles.bannerWrapper}>
                <AdMobBanner />
              </View>
           </View>
        )}

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

const DetailCard = ({ icon, title, value }) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={24} color="rgba(255,255,255,0.7)" />
    <Text style={styles.cardValue}>{value}</Text>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, backgroundColor: '#0f2027', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 10 },
  safeArea: { flex: 1, paddingTop: Platform.OS === 'android' ? 35 : 0 },
  
  // Tabs Header
  tabHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10, alignItems: 'center' },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginRight: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  tabBtnActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  tabText: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },
  refreshBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },

  searchBar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.2)', margin: 20, padding: 10, borderRadius: 25, alignItems: 'center' },
  input: { flex: 1, color: '#fff', fontSize: 16, marginLeft: 10 },
  content: { paddingHorizontal: 20 },
  
  mainInfo: { alignItems: 'center', marginTop: 10 },
  cityName: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  temp: { fontSize: 70, fontWeight: 'bold', color: '#fff' },
  desc: { fontSize: 18, color: 'rgba(255,255,255,0.8)', textTransform: 'capitalize' },
  
  // Hourly
  hourlyContainer: { marginTop: 30 },
  sectionTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 10, fontWeight: 'bold' },
  hourlyItem: { alignItems: 'center', marginRight: 20, backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 15 },
  hourlyTime: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 5 },
  hourlyTemp: { color: '#fff', fontWeight: 'bold', marginTop: 5 },

  grid: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 30 },
  card: { width: '30%', backgroundColor: 'rgba(255,255,255,0.15)', padding: 10, borderRadius: 15, alignItems: 'center', marginBottom: 10 },
  cardVal: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginTop: 5 },
  cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10 },
  
  forecastContainer: { backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 20, padding: 20, marginTop: 20 },
  forecastTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16, marginBottom: 15 },
  forecastRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  dayText: { color: '#fff', width: 50, fontWeight: 'bold' },
  forecastCondition: { color: 'rgba(255,255,255,0.8)', fontSize: 12, textTransform: 'capitalize' },
  tempMax: { color: '#fff', fontWeight: 'bold', marginRight: 10 },
  tempMin: { color: 'rgba(255,255,255,0.6)' },

  // Radar
  radarContainer: { flex: 1, padding: 20 },
  radarHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  radarTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  radarMapPlaceholder: { flex: 1, backgroundColor: '#0f2027', borderRadius: 20, overflow: 'hidden', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  radarOverlay: { position: 'absolute', alignItems: 'center' },

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