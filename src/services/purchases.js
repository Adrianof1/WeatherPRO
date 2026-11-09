import { Platform } from 'react-native';
import { ENV, PRODUCTS } from '../config';

// Importação condicional: sem build nativa (Expo Go) as compras ficam indisponíveis.
let RC = null;
try {
  RC = require('react-native-purchases');
} catch (e) {
  console.log('[Compras] Módulo nativo indisponível (Expo Go?).');
}
const Purchases = RC?.default;

let configured = false;

const apiKey = () => (Platform.OS === 'ios' ? ENV.REVENUECAT_IOS_KEY : ENV.REVENUECAT_ANDROID_KEY);

export const isPurchasesAvailable = () => !!Purchases && !!apiKey();

// Premium = comprou o café OU fez qualquer doação OU tem o entitlement "premium" no RevenueCat.
export function isPremiumFromInfo(info) {
  if (!info) return false;
  if (info.entitlements?.active?.premium) return true;
  const bought = info.allPurchasedProductIdentifiers || [];
  return bought.includes(PRODUCTS.COFFEE) || PRODUCTS.DONATIONS.some((id) => bought.includes(id));
}

export const isSupporterFromInfo = (info) =>
  (info?.allPurchasedProductIdentifiers || []).some((id) => PRODUCTS.DONATIONS.includes(id));

export const PurchaseService = {
  async init(onInfo) {
    if (!isPurchasesAvailable() || configured) return null;
    try {
      Purchases.configure({ apiKey: apiKey() });
      configured = true;
      Purchases.addCustomerInfoUpdateListener(onInfo);
      const info = await Purchases.getCustomerInfo();
      onInfo(info);
      return info;
    } catch (e) {
      console.log('[Compras] Falha ao iniciar:', e?.message);
      return null;
    }
  },

  /** Busca café + doações com preço localizado da loja. */
  async loadProducts() {
    if (!configured) return { coffee: null, donations: [] };
    const category = RC.PRODUCT_CATEGORY?.NON_SUBSCRIPTION;
    const products = await Purchases.getProducts(
      [PRODUCTS.COFFEE, ...PRODUCTS.DONATIONS],
      category
    );
    const byId = Object.fromEntries(products.map((p) => [p.identifier, p]));
    return {
      coffee: byId[PRODUCTS.COFFEE] || null,
      donations: PRODUCTS.DONATIONS.map((id) => byId[id]).filter(Boolean),
    };
  },

  /** Retorna { ok, cancelled, pending, info, error }. */
  async buy(product) {
    if (!configured || !product) return { ok: false, error: 'indisponivel' };
    try {
      const { customerInfo } = await Purchases.purchaseStoreProduct(product);
      return { ok: true, info: customerInfo };
    } catch (e) {
      if (e?.userCancelled) return { ok: false, cancelled: true };
      // Boleto e outros meios lentos: a compra fica pendente e o Premium chega pelo listener quando for paga.
      if (e?.code === RC.PURCHASES_ERROR_CODE?.PAYMENT_PENDING_ERROR) return { ok: false, pending: true };
      return { ok: false, error: e?.message || 'erro' };
    }
  },

  async restore() {
    if (!configured) return { ok: false, error: 'indisponivel' };
    try {
      const info = await Purchases.restorePurchases();
      return { ok: true, info };
    } catch (e) {
      return { ok: false, error: e?.message || 'erro' };
    }
  },
};
