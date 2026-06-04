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

export function useInAppPurchases() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
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
        setProducts(items);
        console.log('✅ IAP products loaded:', items.length);
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
      // Demo mode fallback
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

  return {
    isConnected,
    isLoading,
    products,
    purchaseProduct,
    restorePurchases,
  };
}
