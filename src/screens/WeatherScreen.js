import React, { useState } from 'react';
import {
  Animated, Linking, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import { DetailCard, EmptyState, GlassCard, SectionLabel, SmartBanner } from '../components/ui';
import { CONFIG } from '../config';
import { getWindDirection, sanitizeInput } from '../utils/helpers';

export default function WeatherScreen({
  weather, theme, fadeAnim, slideAnim, refreshing, onRefresh, onSearch, error,
  isPremium, favorites, isFavorite, onToggleFavorite, onSelectFavorite, onOpenPremium, onRetryGPS,
}) {
  const [searchText, setSearchText] = useState('');

  const submit = async () => {
    if (sanitizeInput(searchText).length < 2) return;
    const ok = await onSearch(searchText);
    if (ok) setSearchText('');
  };

  const hourlyLimit = isPremium ? CONFIG.premium.maxHourly : CONFIG.free.maxHourly;
  const hourly = (weather?.hourly || []).slice(0, hourlyLimit);

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color="rgba(255,255,255,0.35)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar cidade..."
          placeholderTextColor="rgba(255,255,255,0.3)"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={submit}
          returnKeyType="search"
          maxLength={50}
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={submit} style={[styles.searchGo, { backgroundColor: theme.accent }]}>
            <Ionicons name="arrow-forward" size={14} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {isPremium && favorites.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.favRow} keyboardShouldPersistTaps="handled">
          {favorites.map((fav) => (
            <TouchableOpacity key={`${fav.lat},${fav.lon}`} style={styles.favChip} onPress={() => onSelectFavorite(fav)}>
              <Ionicons name="star" size={12} color="#fbbf24" />
              <Text style={styles.favChipText}>{fav.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {!weather && (
        <EmptyState
          icon={error === 'no_location' ? 'map-marker-off' : error === 'api_key' ? 'key-alert' : 'wifi-off'}
          title={
            error === 'no_location' ? 'Localização desativada'
              : error === 'api_key' ? 'Chave da API não configurada'
              : 'Sem dados do clima'
          }
          text={
            error === 'no_location' ? 'Permita o acesso à localização ou busque uma cidade acima.'
              : error === 'api_key' ? 'Defina EXPO_PUBLIC_WEATHER_API_KEY no .env (ou nos segredos do EAS) e gere a build novamente.'
              : 'Não foi possível carregar agora. Verifique sua internet e tente de novo.'
          }
        >
          {error !== 'api_key' && (
            <TouchableOpacity style={styles.primaryBtn} onPress={onRetryGPS}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.primaryBtnText}>Tentar novamente</Text>
            </TouchableOpacity>
          )}
        </EmptyState>
      )}

      {weather && (
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <View style={styles.hero}>
            <View style={styles.locRow}>
              <Ionicons name="location-sharp" size={13} color="rgba(255,255,255,0.5)" />
              <Text style={styles.locText}>{weather.city}{weather.country ? `, ${weather.country}` : ''}</Text>
            </View>
            <TouchableOpacity style={styles.favStar} onPress={onToggleFavorite} accessibilityLabel="Favoritar cidade">
              <Ionicons name={isFavorite ? 'star' : 'star-outline'} size={22} color={isFavorite ? '#fbbf24' : 'rgba(255,255,255,0.6)'} />
            </TouchableOpacity>
            <MaterialCommunityIcons name={weather.icon} size={96} color="#fff" style={styles.heroIcon} />
            <Text style={styles.heroTemp}>{weather.temp}°</Text>
            <Text style={styles.heroDesc}>{weather.desc}</Text>
            <View style={styles.heroMeta}>
              <Text style={styles.heroMetaItem}>↑ {weather.temp_max}°</Text>
              <View style={styles.heroDot} />
              <Text style={styles.heroMetaItem}>↓ {weather.temp_min}°</Text>
              <View style={styles.heroDot} />
              <Text style={styles.heroMetaItem}>Sensação {weather.feels_like}°</Text>
            </View>
            {weather.rain1h > 0 && (
              <View style={styles.rainNow}>
                <Ionicons name="water" size={12} color="#38bdf8" />
                <Text style={styles.rainNowText}>Chovendo agora: {weather.rain1h.toFixed(1)}mm/h</Text>
              </View>
            )}
          </View>

          <GlassCard>
            <SectionLabel>PREVISÃO — PRÓXIMAS {hourly.length * 3}H</SectionLabel>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {hourly.map((h, i) => (
                <View
                  key={h.id}
                  style={[styles.hourCard, i === 0 && { backgroundColor: theme.accent + '20', borderColor: theme.accent + '40', borderWidth: 1 }]}
                >
                  <Text style={[styles.hourTime, i === 0 && { color: '#fff', fontWeight: '700' }]}>{h.time}</Text>
                  <MaterialCommunityIcons name={h.icon} size={24} color="#fff" style={{ marginVertical: 5 }} />
                  <Text style={styles.hourTemp}>{h.temp}°</Text>
                  {h.pop > 0 && (
                    <View style={styles.popRow}>
                      <Ionicons name="water" size={9} color="#38bdf8" />
                      <Text style={styles.popText}>{h.pop}%</Text>
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          </GlassCard>

          {!isPremium && (
            <TouchableOpacity style={styles.lockCard} onPress={onOpenPremium} activeOpacity={0.8}>
              <MaterialCommunityIcons name="crown" size={22} color="#fbbf24" />
              <Text style={styles.lockText}>
                Pague um café: sem anúncios, previsão de {CONFIG.premium.maxHourly * 3}h e cidades favoritas.
              </Text>
              <Ionicons name="chevron-forward" size={16} color="#fbbf24" />
            </TouchableOpacity>
          )}

          <View style={styles.detailGrid}>
            <DetailCard icon="water-outline" title="Umidade" value={`${weather.hum}%`} accent="#38bdf8" />
            <DetailCard icon="speedometer-outline" title="Vento" value={`${weather.wind} km/h`} accent="#a78bfa" />
            <DetailCard icon="eye-outline" title="Visibilidade" value={`${weather.visibility} km`} accent="#34d399" />
            <DetailCard icon="gauge" title="Pressão" value={`${weather.pressure} hPa`} accent="#fb923c" iconPack="material" />
            <DetailCard icon="cloud-outline" title="Nuvens" value={`${weather.clouds}%`} accent="#94a3b8" />
            <DetailCard icon="navigate-outline" title="Dir. Vento" value={getWindDirection(weather.windDeg)} accent="#c084fc" />
          </View>

          <GlassCard style={styles.sunRow}>
            <View style={styles.sunItem}>
              <Ionicons name="sunny-outline" size={20} color="#fbbf24" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.sunLabel}>Nascer</Text>
                <Text style={styles.sunVal}>{weather.sunrise}</Text>
              </View>
            </View>
            <View style={styles.sunDiv} />
            <View style={styles.sunItem}>
              <Ionicons name="moon-outline" size={20} color="#818cf8" />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.sunLabel}>Pôr do Sol</Text>
                <Text style={styles.sunVal}>{weather.sunset}</Text>
              </View>
            </View>
          </GlassCard>

          <GlassCard>
            <SectionLabel>PRÓXIMOS DIAS</SectionLabel>
            {weather.forecast.map((d, i) => (
              <View key={d.id} style={[styles.dayRow, i < weather.forecast.length - 1 && styles.dayBorder]}>
                <Text style={styles.dayName}>{d.day}</Text>
                <MaterialCommunityIcons name={d.icon} size={22} color="#fff" />
                <View style={styles.dayCondWrap}>
                  <Text style={styles.dayCond} numberOfLines={1}>{d.condition}</Text>
                  {d.pop > 0 && (
                    <View style={styles.popRow}>
                      <Ionicons name="water" size={9} color="#38bdf8" />
                      <Text style={styles.popText}>{d.pop}%</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.dayMax}>{d.tempMax}°</Text>
                <Text style={styles.dayMin}>{d.tempMin}°</Text>
              </View>
            ))}
          </GlassCard>

          <SmartBanner />

          <View style={styles.footer}>
            <Text style={styles.footerName}>Desenvolvido por Adriano Ferreira de Oliveira</Text>
            <View style={styles.footerRow}>
              <TouchableOpacity style={styles.footerLink} onPress={() => Linking.openURL('https://linkedin.com/in/adrianoferreira-dev')}>
                <FontAwesome5 name="linkedin" size={12} color="rgba(255,255,255,0.5)" />
                <Text style={styles.footerLinkTxt}>LinkedIn</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
}
