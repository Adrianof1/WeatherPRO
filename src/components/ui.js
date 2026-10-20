import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import { getBannerComponents, isAdMobAvailable, useAdsReady } from '../services/ads';
import { usePremium } from '../context/PremiumContext';

export const GlassCard = ({ children, style }) => (
  <View style={[styles.glass, style]}>{children}</View>
);

export const SectionLabel = ({ children }) => <Text style={styles.sectionLabel}>{children}</Text>;

export const DetailCard = ({ icon, title, value, accent, iconPack }) => {
  const IconPack = iconPack === 'material' ? MaterialCommunityIcons : Ionicons;
  return (
    <GlassCard style={styles.detailCard}>
      <View style={[styles.detailIconBg, { backgroundColor: (accent || '#fff') + '18' }]}>
        <IconPack name={icon} size={20} color={accent || 'rgba(255,255,255,0.8)'} />
      </View>
      <Text style={styles.detailValue}>{value}</Text>
      <Text style={styles.detailLabel}>{title}</Text>
    </GlassCard>
  );
};

export const EmptyState = ({ icon, title, text, children }) => (
  <View style={styles.emptyState}>
    <MaterialCommunityIcons name={icon} size={56} color="rgba(255,255,255,0.8)" />
    <Text style={styles.emptyTitle}>{title}</Text>
    <Text style={styles.emptyText}>{text}</Text>
    {children}
  </View>
);

/** Banner AdMob. Some para usuários premium e enquanto o SDK/consentimento não estiverem prontos. */
export const SmartBanner = () => {
  const { isPremium } = usePremium();
  const adsReady = useAdsReady();
  if (isPremium) return null;

  const banner = getBannerComponents();
  if (banner && adsReady) {
    const { BannerAd, BannerAdSize, unitId } = banner;
    return (
      <View style={styles.adBannerWrap}>
        <BannerAd
          unitId={unitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          onAdFailedToLoad={(error) => console.log('[AdMob] Banner falhou:', error?.message)}
        />
      </View>
    );
  }
  // Em desenvolvimento sem módulo nativo (Expo Go), mostra um espaço reservado.
  if (__DEV__ && !isAdMobAvailable) {
    return (
      <View style={styles.adBannerWrap}>
        <View style={styles.adPlaceholder}>
          <View style={styles.adPlaceholderStrip}><Text style={styles.adPlaceholderLabel}>Ad</Text></View>
          <View style={styles.adPlaceholderContent}>
            <Text style={styles.adPlaceholderTitle}>Espaço de anúncio</Text>
            <Text style={styles.adPlaceholderSub}>Aparece na build nativa</Text>
          </View>
        </View>
      </View>
    );
  }
  return null;
};
