// Configuração central. Variáveis EXPO_PUBLIC_* são embutidas no app na build.
// Os IDs de anúncio não são segredos (ficam no APK de qualquer jeito), então têm fallback.
export const ENV = {
  WEATHER_API_KEY: process.env.EXPO_PUBLIC_WEATHER_API_KEY || '',
  ADMOB_BANNER_ID:
    process.env.EXPO_PUBLIC_ADMOB_BANNER_ID || 'ca-app-pub-4541742841922750/9142629209',
  ADMOB_INTERSTITIAL_ID:
    process.env.EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID || 'ca-app-pub-4541742841922750/6756139011',
  REVENUECAT_ANDROID_KEY: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
  REVENUECAT_IOS_KEY: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
};

export const CONFIG = {
  api: { baseUrl: 'https://api.openweathermap.org', timeoutMs: 12000 },
  cache: {
    weatherKey: '@wp_weather_v4',
    favoritesKey: '@wp_favorites_v1',
    duration: 10 * 60 * 1000,
  },
  ads: {
    interstitialCooldown: 3 * 60 * 1000,
    searchesPerInterstitial: 3,
  },
  free: { maxHourly: 8, maxFavorites: 0 },
  premium: { maxHourly: 16, maxFavorites: 10 },
};

// IDs dos produtos — crie EXATAMENTE estes IDs no Google Play Console / App Store Connect.
export const PRODUCTS = {
  // Não consumível: "Pague um café" — remove anúncios e libera o Premium para sempre.
  COFFEE: 'cafe_premium',
  // Consumíveis: doações. Qualquer uma também libera o Premium.
  DONATIONS: ['doacao_5', 'doacao_10', 'doacao_20', 'doacao_50', 'doacao_100'],
};
