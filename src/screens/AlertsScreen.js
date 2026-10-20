import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import { GlassCard, SmartBanner } from '../components/ui';
import { getSeverityColor } from '../utils/helpers';

export default function AlertsScreen({ weather, theme, onOpenFlood }) {
  const [expanded, setExpanded] = useState(null);
  const alerts = weather?.alerts || [];

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View>
        <GlassCard>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <MaterialCommunityIcons name="bell-ring" size={20} color={theme.accent} />
            <Text style={[styles.sectionLabel, { marginBottom: 0, marginLeft: 8 }]}>CENTRAL DE ALERTAS</Text>
          </View>
          <Text style={styles.alertSubhead}>
            Alertas calculados a partir da previsão para {weather?.city || 'sua cidade'}. Não substituem avisos oficiais
            da Defesa Civil / INMET.
          </Text>
        </GlassCard>

        {alerts.length === 0 && (
          <GlassCard style={{ alignItems: 'center', paddingVertical: 40 }}>
            <MaterialCommunityIcons name="check-circle-outline" size={56} color="#22c55e" />
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginTop: 12 }}>Tudo tranquilo!</Text>
            <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
              Nenhum alerta ativo para {weather?.city}.
            </Text>
          </GlassCard>
        )}

        {alerts.map((alert) => (
          <TouchableOpacity
            key={alert.id}
            onPress={() => setExpanded(expanded === alert.id ? null : alert.id)}
            activeOpacity={0.7}
          >
            <GlassCard style={[styles.alertCard, { borderLeftColor: alert.color, borderLeftWidth: 4 }]}>
              <View style={styles.alertCardHeader}>
                <MaterialCommunityIcons name={alert.icon} size={22} color={alert.color} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.alertCardTitle}>{alert.title}</Text>
                  <View style={styles.alertMeta}>
                    <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(alert.severity) + '22' }]}>
                      <Text style={[styles.severityText, { color: getSeverityColor(alert.severity) }]}>
                        {alert.severity.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.alertTime}>{alert.time}</Text>
                  </View>
                </View>
                <Ionicons name={expanded === alert.id ? 'chevron-up' : 'chevron-down'} size={16} color="rgba(255,255,255,0.4)" />
              </View>

              {expanded === alert.id && (
                <View style={styles.alertExpanded}>
                  <Text style={styles.alertMsg}>{alert.message}</Text>
                  {alert.source && <Text style={styles.alertSource}>Fonte: {alert.source}</Text>}
                  {alert.hasFloodPoints && (
                    <TouchableOpacity
                      style={[styles.floodBtn, { backgroundColor: theme.accent + '22' }]}
                      onPress={onOpenFlood}
                    >
                      <Ionicons name="map-outline" size={14} color={theme.accent} />
                      <Text style={[styles.floodBtnText, { color: theme.accent }]}>Ver pontos de alagamento</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </GlassCard>
          </TouchableOpacity>
        ))}

        <SmartBanner />
      </View>
    </ScrollView>
  );
}
