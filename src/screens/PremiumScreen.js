import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from '../styles';
import { GlassCard, SectionLabel } from '../components/ui';
import { usePremium } from '../context/PremiumContext';
import { CONFIG, LINKS } from '../config';
import { PurchaseService, isPurchasesAvailable } from '../services/purchases';

const PERKS = [
  'Sem anúncios (banners e tela cheia)',
  `Previsão de ${CONFIG.premium.maxHourly * 3}h (a grátis mostra ${CONFIG.free.maxHourly * 3}h)`,
  `Até ${CONFIG.premium.maxFavorites} cidades favoritas`,
  'Ajuda a manter o app no ar e com novidades',
];

export default function PremiumScreen({ theme }) {
  const { isPremium, isSupporter, applyInfo } = usePremium();
  const [products, setProducts] = useState({ coffee: null, donations: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const available = isPurchasesAvailable();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await PurchaseService.loadProducts());
    } catch (e) {
      console.log('[Compras] Falha ao carregar produtos:', e?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (available) load(); else setLoading(false); }, [available, load]);

  const buy = async (product, thanks) => {
    if (busy) return;
    setBusy(true);
    const result = await PurchaseService.buy(product);
    setBusy(false);
    if (result.ok) {
      applyInfo(result.info);
      Alert.alert('☕ Muito obrigado!', thanks);
    } else if (result.pending) {
      Alert.alert(
        'Pagamento pendente',
        'Assim que o Google Play confirmar o pagamento, o Premium é liberado automaticamente. Pode fechar o app.'
      );
    } else if (!result.cancelled) {
      Alert.alert('Não foi possível concluir', 'A compra não foi finalizada. Você não foi cobrado. Tente novamente.');
    }
  };

  const restore = async () => {
    setBusy(true);
    const result = await PurchaseService.restore();
    setBusy(false);
    if (!result.ok) return Alert.alert('Restaurar compras', 'Não foi possível restaurar agora. Verifique sua conexão.');
    applyInfo(result.info);
    Alert.alert('Restaurar compras', 'Compras verificadas na sua conta da loja.');
  };

  const storeReady = available && !loading;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {isPremium && (
        <GlassCard style={styles.premiumActive}>
          <MaterialCommunityIcons name="crown" size={40} color="#fbbf24" />
          <Text style={styles.coffeeTitle}>{isSupporter ? 'Obrigado pelo apoio! 💛' : 'Premium ativo!'}</Text>
          <Text style={styles.coffeeSub}>Sem anúncios e com todos os recursos liberados.</Text>
        </GlassCard>
      )}

      <GlassCard>
        <SectionLabel>O QUE VOCÊ LIBERA</SectionLabel>
        {PERKS.map((perk) => (
          <View key={perk} style={styles.perkRow}>
            <Ionicons name="checkmark-circle" size={18} color="#22c55e" />
            <Text style={styles.perkText}>{perk}</Text>
          </View>
        ))}
      </GlassCard>

      {!available && (
        <GlassCard>
          <Text style={styles.coffeeSub}>
            As compras só funcionam na versão instalada pela loja (ou build de desenvolvimento).
          </Text>
        </GlassCard>
      )}

      {available && loading && <ActivityIndicator color="#fff" style={{ marginVertical: 24 }} />}

      {storeReady && !products.coffee && products.donations.length === 0 && (
        <GlassCard>
          <Text style={styles.coffeeSub}>Não conseguimos carregar os preços da loja agora.</Text>
          <TouchableOpacity onPress={load}><Text style={styles.linkText}>Tentar novamente</Text></TouchableOpacity>
        </GlassCard>
      )}

      {storeReady && products.coffee && (
        <GlassCard style={styles.coffeeCard}>
          <MaterialCommunityIcons name="coffee" size={48} color="#fbbf24" />
          <Text style={styles.coffeeTitle}>Pague um café</Text>
          <Text style={styles.coffeeSub}>
            Pagamento único. Remove todos os anúncios para sempre e libera o Premium.
          </Text>
          <TouchableOpacity
            style={[styles.buyBtn, (busy || isPremium) && styles.buyBtnDisabled]}
            disabled={busy || isPremium}
            onPress={() => buy(products.coffee, 'Anúncios removidos e Premium liberado. Você ajuda muito o WeatherPRO!')}
          >
            <Text style={styles.buyBtnText}>
              {isPremium ? 'Já liberado ✓' : `Pagar um café — ${products.coffee.priceString}`}
            </Text>
          </TouchableOpacity>
        </GlassCard>
      )}

      {storeReady && products.donations.length > 0 && (
        <GlassCard>
          <SectionLabel>DOAR (ESCOLHA O VALOR)</SectionLabel>
          <Text style={[styles.coffeeSub, { marginBottom: 14, marginTop: 0 }]}>
            Gostou do app? Qualquer doação ajuda e também remove os anúncios.
          </Text>
          <View style={styles.donateGrid}>
            {products.donations.map((p) => (
              <TouchableOpacity
                key={p.identifier}
                style={[styles.donateBtn, busy && styles.buyBtnDisabled]}
                disabled={busy}
                onPress={() => buy(p, 'Sua doação foi recebida. Obrigado de coração! 💛')}
              >
                <Text style={styles.donateAmount}>{p.priceString}</Text>
                <Text style={styles.donateLabel}>doar</Text>
              </TouchableOpacity>
            ))}
          </View>
        </GlassCard>
      )}

      {available && (
        <TouchableOpacity onPress={restore} disabled={busy}>
          <Text style={styles.linkText}>Restaurar compras</Text>
        </TouchableOpacity>
      )}
      {busy && <ActivityIndicator color={theme?.accent || '#fff'} />}
      <Text style={styles.smallNote}>
        O pagamento é feito pela sua conta Google Play / Apple. Doações não são reembolsáveis pelo app.
      </Text>
      <TouchableOpacity onPress={() => Linking.openURL(LINKS.privacy)}>
        <Text style={styles.linkText}>Política de privacidade</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Linking.openURL(LINKS.terms)}>
        <Text style={styles.linkText}>Termos de uso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
