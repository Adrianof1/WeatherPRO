import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdService } from '../services/ads';
import { PurchaseService, isPremiumFromInfo, isSupporterFromInfo } from '../services/purchases';

const FLAG_KEY = '@wp_premium_flag_v1';
const PremiumContext = createContext({
  isPremium: false, isSupporter: false, ready: false, applyInfo: () => {},
});

export function PremiumProvider({ children }) {
  const [isPremium, setPremium] = useState(false);
  const [isSupporter, setSupporter] = useState(false);
  const [ready, setReady] = useState(false);

  const applyInfo = useCallback((info) => {
    const premium = isPremiumFromInfo(info);
    setPremium(premium);
    setSupporter(isSupporterFromInfo(info));
    // Guarda o último estado para o app abrir sem anúncios mesmo offline.
    AsyncStorage.setItem(FLAG_KEY, JSON.stringify({ premium, supporter: isSupporterFromInfo(info) })).catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FLAG_KEY);
        if (raw && !cancelled) {
          const saved = JSON.parse(raw);
          setPremium(!!saved.premium);
          setSupporter(!!saved.supporter);
        }
      } catch (e) { /* ignora */ }
      await PurchaseService.init(applyInfo);
      if (!cancelled) setReady(true);
    })();
    return () => { cancelled = true; };
  }, [applyInfo]);

  // Só inicia anúncios depois de saber se o usuário é premium.
  useEffect(() => {
    if (ready && !isPremium) AdService.init();
  }, [ready, isPremium]);

  const value = useMemo(
    () => ({ isPremium, isSupporter, ready, applyInfo }),
    [isPremium, isSupporter, ready, applyInfo]
  );
  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>;
}

export const usePremium = () => useContext(PremiumContext);
