import { useEffect, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { COIN_PACKS, IAP_PRODUCT_IDS, getCoinsForProductId } from '@/constants/iapProducts';
import { useGame } from '@/context/GameContext';

let RNIap: any = null;

try {
  RNIap = require('react-native-iap');
} catch (error) {
  if (__DEV__) {
    console.log('ℹ️ IAP: Using demo mode (build production app for real purchases)');
  }
}

const productIds = [
  IAP_PRODUCT_IDS.COINS_200,
  IAP_PRODUCT_IDS.COINS_700,
  IAP_PRODUCT_IDS.COINS_2000,
];

export interface StoreProductInfo {
  productId: string;
  /** Current price to pay (discounted if an offer is active) */
  price: string;
  /** Full/regular price — same as price when no offer is active */
  regularPrice: string;
  /** True when an intro price or discount is active */
  hasOffer: boolean;
  /** Human-readable offer label, e.g. "Intro offer" or "Save 25%" */
  offerLabel: string | null;
  /** Raw localised currency symbol + amount, e.g. "₹79" */
  currency: string;
}

/**
 * Extracts pricing and any active offer from a react-native-iap product object.
 * Handles both the old (v8-) shape and the new Android-billing-v5+ shape
 * that react-native-iap ≥ 12 returns.
 */
function parseProductInfo(product: any): StoreProductInfo {
  const productId: string = product.productId ?? product.id ?? '';
  const currency: string = product.currency ?? '';

  // ── New shape (react-native-iap ≥ 12, Google Play Billing v5+) ──────────
  // product.subscriptionOfferDetails / product.oneTimePurchaseOfferDetails
  const otpOffer = product.oneTimePurchaseOfferDetails;
  if (otpOffer) {
    const regularPriceMicros: number = otpOffer.priceAmountMicros ?? 0;
    const regularPrice: string = otpOffer.formattedPrice ?? product.localizedPrice ?? '';

    // introductoryPricingDetails lives under pricingPhases on newer shape
    const phases: any[] = otpOffer.pricingPhases?.pricingPhaseList ?? [];
    // The last phase is the recurring base price; earlier phases are intro/promos
    const introPhase = phases.length > 1 ? phases[0] : null;

    if (introPhase) {
      const introPrice: string = introPhase.formattedPrice ?? '';
      const introPriceMicros: number = introPhase.priceAmountMicros ?? regularPriceMicros;
      const savePct = regularPriceMicros > 0
        ? Math.round((1 - introPriceMicros / regularPriceMicros) * 100)
        : 0;

      return {
        productId,
        price: introPrice || regularPrice,
        regularPrice,
        hasOffer: true,
        offerLabel: savePct > 0 ? `Save ${savePct}%` : 'Special offer',
        currency,
      };
    }

    return { productId, price: regularPrice, regularPrice, hasOffer: false, offerLabel: null, currency };
  }

  // ── Legacy shape (react-native-iap < 12) ─────────────────────────────────
  const regularPrice: string = product.localizedPrice ?? product.price ?? '';

  // introductoryPrice is set when Google Play has an intro pricing configured
  const introPrice: string = product.introductoryPrice ?? '';
  const introAmountMicros: number = Number(product.introductoryPriceAmountMicros ?? 0);
  const regularAmountMicros: number = Number(product.priceAmountMicros ?? 0);

  if (introPrice && introAmountMicros > 0 && introAmountMicros < regularAmountMicros) {
    const savePct = regularAmountMicros > 0
      ? Math.round((1 - introAmountMicros / regularAmountMicros) * 100)
      : 0;

    return {
      productId,
      price: introPrice,
      regularPrice,
      hasOffer: true,
      offerLabel: savePct > 0 ? `Save ${savePct}%` : 'Intro offer',
      currency,
    };
  }

  // discounts array (iOS App Store / some Play shapes)
  const discounts: any[] = product.discounts ?? [];
  if (discounts.length > 0) {
    const best = discounts.reduce((a: any, b: any) =>
      Number(a.priceAmountMicros ?? 0) < Number(b.priceAmountMicros ?? 0) ? a : b
    );
    const discountPrice: string = best.localizedPrice ?? best.price ?? '';
    const discountMicros: number = Number(best.priceAmountMicros ?? 0);
    const savePct = regularAmountMicros > 0
      ? Math.round((1 - discountMicros / regularAmountMicros) * 100)
      : 0;

    if (discountPrice) {
      return {
        productId,
        price: discountPrice,
        regularPrice,
        hasOffer: true,
        offerLabel: savePct > 0 ? `Save ${savePct}%` : 'Limited offer',
        currency,
      };
    }
  }

  return { productId, price: regularPrice, regularPrice, hasOffer: false, offerLabel: null, currency };
}

export function useInAppPurchases() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [storeProducts, setStoreProducts] = useState<Record<string, StoreProductInfo>>({});
  const { purchaseCoinPack } = useGame();

  useEffect(() => {
    if (!RNIap || Platform.OS !== 'android') return;

    let purchaseListener: any = null;
    let errorListener: any = null;

    const init = async () => {
      try {
        await RNIap.initConnection();
        setIsConnected(true);
        console.log('✅ IAP connection established');

        const items = await RNIap.getProducts({ skus: productIds });
        console.log('✅ IAP products loaded:', items.length);

        const map: Record<string, StoreProductInfo> = {};
        for (const item of items) {
          const info = parseProductInfo(item);
          map[info.productId] = info;
        }
        setStoreProducts(map);
      } catch (error) {
        console.error('❌ IAP init error:', error);
        setIsConnected(false);
      }
    };

    purchaseListener = RNIap.purchaseUpdatedListener(async (purchase: any) => {
      console.log('🛒 Purchase updated:', purchase.productId);
      const coins = getCoinsForProductId(purchase.productId);
      if (coins > 0) {
        purchaseCoinPack(coins);
        Alert.alert('🎉 Success!', `${coins} coins added to your balance.`);
      }

      try {
        await RNIap.finishTransaction({ purchase, isConsumable: true });
        console.log('✅ Transaction finished');
      } catch (err) {
        console.error('❌ Error finishing transaction:', err);
      }
      setIsLoading(false);
    });

    errorListener = RNIap.purchaseErrorListener((error: any) => {
      console.error('❌ Purchase error:', error);
      setIsLoading(false);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert('Purchase Failed', error.message || 'Something went wrong. Please try again.');
      }
    });

    init();

    return () => {
      if (purchaseListener) purchaseListener.remove();
      if (errorListener) errorListener.remove();
      RNIap.endConnection();
    };
  }, [purchaseCoinPack]);

  const purchaseProduct = useCallback(async (productId: string) => {
    if (!RNIap || Platform.OS !== 'android') {
      const coins = getCoinsForProductId(productId);
      const pack = COIN_PACKS.find(p => p.id === productId);
      if (!pack) return;

      Alert.alert(
        'Purchase',
        `Buy ${coins} coins for ${pack.price}?\n\n(Demo mode — no real charge.)`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Buy',
            onPress: () => {
              purchaseCoinPack(coins);
              Alert.alert('🎉 Success!', `${coins} coins added to your balance.`);
            },
          },
        ]
      );
      return;
    }

    if (!isConnected) {
      Alert.alert('Store Error', 'Not connected to Google Play. Please restart the app.');
      return;
    }

    setIsLoading(true);
    try {
      await RNIap.requestPurchase({ skus: [productId] });
    } catch (error: any) {
      setIsLoading(false);
      if (error.code !== 'E_USER_CANCELLED') {
        Alert.alert('Error', 'Failed to start purchase. Please try again.');
      }
    }
  }, [isConnected, purchaseCoinPack]);

  const restorePurchases = useCallback(async () => {
    if (!RNIap || Platform.OS !== 'android') {
      Alert.alert('Restore', 'No previous purchases found.');
      return;
    }

    try {
      const purchases = await RNIap.getAvailablePurchases();
      if (purchases.length === 0) {
        Alert.alert('Restore', 'No previous purchases found.');
      } else {
        Alert.alert('Restored', `${purchases.length} purchase(s) restored.`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases.');
    }
  }, []);

  /** Returns live store pricing for a product, falling back to the hardcoded config. */
  const getProductInfo = useCallback((pack: typeof COIN_PACKS[number]): StoreProductInfo => {
    if (storeProducts[pack.id]) return storeProducts[pack.id];
    // Fallback while store data is loading or in demo mode
    return {
      productId: pack.id,
      price: pack.price,
      regularPrice: pack.regularPrice,
      hasOffer: false,
      offerLabel: null,
      currency: '',
    };
  }, [storeProducts]);

  return {
    isConnected,
    isLoading,
    storeProducts,
    getProductInfo,
    purchaseProduct,
    restorePurchases,
  };
}
