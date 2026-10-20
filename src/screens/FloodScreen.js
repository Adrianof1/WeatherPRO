import React from 'react';
import { Linking, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import { GlassCard, SmartBanner } from '../components/ui';
import { getRiskColor } from '../utils/helpers';

const openMap = (point) => {
  const web = `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lon}`;
  const native = Platform.OS === 'ios'
    ? `maps:?q=${encodeURIComponent(point.name)}&ll=${point.lat},${point.lon}`
    : `geo:${point.lat},${point.lon}?q=${point.lat},${point.lon}(${encodeURIComponent(point.name)})`;
  Linking.openURL(native).catch(() => Linking.openURL(web));
};

export default function FloodScreen({ weather }) {
  const points = weather?.floodPoints || [];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View>
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <MaterialCommunityIcons name="waves" size={20} color="#38bdf8" />
            <Text style={[styles.sectionLabel, { marginBottom: 0, marginLeft: 8 }]}>PONTOS DE ALAGAMENTO</Text>
          </View>
          <Text style={styles.alertSubhead}>
            Locais com histórico de alagamento em {weather?.city || 'sua cidade'}.
          </Text>
          {weather?.floodRisk && (
            <View style={[styles.riskOverall, { backgroundColor: getRiskColor(weather.floodRisk) + '18' }]}>
              <Text style={[styles.riskOverallText, { color: getRiskColor(weather.floodRisk) }]}>
                Risco geral: {weather.floodRisk.toUpperCase()}
              </Text>
            </View>
          )}
        </GlassCard>

        {points.length === 0 && (
          <GlassCard style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons name="map-marker-check" size={56} color="#22c55e" />
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 12 }}>Sem dados de alagamento</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 20 }}>
              Não temos pontos cadastrados para {weather?.city}. Cobrimos algumas capitais brasileiras.
            </Text>
          </GlassCard>
        )}

        {points.map((point) => (
          <GlassCard key={point.name} style={[styles.floodCard, { borderLeftColor: getRiskColor(point.risk), borderLeftWidth: 3 }]}>
            <View style={styles.floodCardHeader}>
              <MaterialCommunityIcons
                name={point.risk === 'crítico' ? 'alert-octagon' : point.risk === 'alto' ? 'alert' : 'information'}
                size={20}
                color={getRiskColor(point.risk)}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.floodName}>{point.name}</Text>
                <View style={[styles.riskBadge, { backgroundColor: getRiskColor(point.risk) + '22' }]}>
                  <Text style={[styles.riskBadgeText, { color: getRiskColor(point.risk) }]}>Risco {point.risk}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.floodDesc}>{point.desc}</Text>
            <TouchableOpacity style={styles.floodMapBtn} onPress={() => openMap(point)}>
              <Ionicons name="navigate-outline" size={14} color="#38bdf8" />
              <Text style={styles.floodMapText}>Ver no Mapa</Text>
            </TouchableOpacity>
          </GlassCard>
        ))}

        <GlassCard style={{ marginTop: 4 }}>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, lineHeight: 16, textAlign: 'center' }}>
            ⚠️ Pontos baseados em histórico e localização aproximada; não são dados oficiais nem em tempo real. Em
            emergência, siga a Defesa Civil (199).
          </Text>
        </GlassCard>

        <SmartBanner />
      </View>
    </ScrollView>
  );
}
