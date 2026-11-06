import { useEffect, useState } from 'react';
import { CONFIG, ENV } from '../config';

// Importação condicional: no Expo Go o módulo nativo não existe e o app segue sem anúncios.
let Ads = null;
try {
  Ads = require('react-native-google-mobile-ads');
} catch (e) {
  console.log('[AdMob] Módulo nativo indisponível (Expo Go?). Anúncios desativados.');
}

export const isAdMobAvailable = !!Ads;

const bannerUnitId = () => (__DEV__ && Ads ? Ads.TestIds.BANNER : ENV.ADMOB_BANNER_ID);
const interstitialUnitId = () => (__DEV__ && Ads ? Ads.TestIds.INTERSTITIAL : ENV.ADMOB_INTERSTITIAL_ID);

const listeners = new Set();
const state = {
  ready: false, interstitial: null, loaded: false, lastShown: 0, started: false, privacyOptions: false,
};

const setReady = (value) => {
  state.ready = value;
  listeners.forEach((fn) => fn(value));
};

function loadInterstitial() {
  if (!state.interstitial) return;
  state.loaded = false;
  try { state.interstitial.load(); } catch (e) { /* tenta de novo no próximo ciclo */ }
}

export const AdService = {
  /**
   * 1) Formulário de consentimento (UMP / LGPD-GDPR) quando exigido
   * 2) Inicializa o SDK  3) Pré-carrega o interstitial
   * Chamar só para usuários NÃO premium.
   */
  async init() {
    if (!Ads || state.started) return;
    state.started = true;
    try {
      let canRequestAds = true;
      try {
        const info = await Ads.AdsConsent.gatherConsent();
        canRequestAds = info.canRequestAds;
        // Na UE/UK e em alguns estados dos EUA o Google exige um botão para o usuário rever a escolha.
        state.privacyOptions = info.privacyOptionsRequirementStatus === 'REQUIRED';
      } catch (e) {
        console.log('[AdMob] Consentimento indisponível:', e?.message);
      }
      if (!canRequestAds) { setReady(false); return; }

      await Ads.default().initialize();

      const { InterstitialAd, AdEventType } = Ads;
      const ad = InterstitialAd.createForAdRequest(interstitialUnitId());
      ad.addAdEventListener(AdEventType.LOADED, () => { state.loaded = true; });
      ad.addAdEventListener(AdEventType.CLOSED, () => loadInterstitial());
      ad.addAdEventListener(AdEventType.ERROR, () => {
        state.loaded = false;
        setTimeout(loadInterstitial, 60 * 1000);
      });
      state.interstitial = ad;
      loadInterstitial();
      setReady(true);
    } catch (e) {
      state.started = false;
      console.log('[AdMob] Falha ao inicializar:', e?.message);
    }
  },

  /** true quando o app deve oferecer "Privacidade dos anúncios" (exigência do UMP). */
  privacyOptionsRequired: () => state.privacyOptions,

  /** Reabre o formulário de consentimento. Se o usuário passar a permitir, inicia os anúncios. */
  async showPrivacyOptions() {
    if (!Ads) return false;
    try {
      const info = await Ads.AdsConsent.showPrivacyOptionsForm();
      if (info?.canRequestAds && !state.ready) {
        state.started = false;
        await AdService.init();
      }
      return true;
    } catch (e) {
      console.log('[AdMob] Formulário de privacidade indisponível:', e?.message);
      return false;
    }
  },

  showInterstitial() {
    if (!state.ready || !state.loaded || !state.interstitial) return false;
    if (Date.now() - state.lastShown < CONFIG.ads.interstitialCooldown) return false;
    try {
      state.interstitial.show();
      state.lastShown = Date.now();
      return true;
    } catch (e) {
      return false;
    }
  },
};

export function useAdsReady() {
  const [ready, setLocal] = useState(state.ready);
  useEffect(() => {
    listeners.add(setLocal);
    setLocal(state.ready);
    return () => listeners.delete(setLocal);
  }, []);
  return ready;
}

export const getBannerComponents = () =>
  Ads ? { BannerAd: Ads.BannerAd, BannerAdSize: Ads.BannerAdSize, unitId: bannerUnitId() } : null;
