// Na web (usada só para gerar as capturas da loja), as bibliotecas nativas de anúncios e compras
// não existem: viram módulos vazios e o app segue sem anúncios/compras. Android e iOS não são afetados.
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);
const NATIVE_ONLY = ['react-native-google-mobile-ads', 'react-native-purchases'];

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && NATIVE_ONLY.some((m) => moduleName === m || moduleName.startsWith(`${m}/`))) {
    return { type: 'empty' };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
