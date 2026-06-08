/**
 * In-App Purchase Product IDs
 *
 * IMPORTANT: These must match exactly with product IDs configured in:
 * - Google Play Console (for Android)
 * - App Store Connect (for iOS - to be added later)
 */

export interface CoinPackProduct {
  id: string;
  coins: number;
  price: string;        // fallback price shown before store data loads
  regularPrice: string; // original/list price — shown as strikethrough when on offer
  label: string;
  badge?: string;
}

// Product IDs for coin packs
export const IAP_PRODUCT_IDS = {
  // Coin packs
  COINS_200: 'coins_200_starter',
  COINS_700: 'coins_700_popular',
  COINS_2000: 'coins_2000_mega',

  // Premium (for future use)
  REMOVE_ADS: 'remove_ads_onetime',
  PREMIUM_WEEKLY: 'premium_weekly_subscription',
} as const;

// Coin pack configurations
export const COIN_PACKS: CoinPackProduct[] = [
  {
    id: IAP_PRODUCT_IDS.COINS_200,
    coins: 200,
    price: '$0.99',
    regularPrice: '$0.99',
    label: 'Starter',
  },
  {
    id: IAP_PRODUCT_IDS.COINS_700,
    coins: 700,
    price: '$2.99',
    regularPrice: '$2.99',
    label: 'Popular',
    badge: 'BEST',
  },
  {
    id: IAP_PRODUCT_IDS.COINS_2000,
    coins: 2000,
    price: '$7.99',
    regularPrice: '$7.99',
    label: 'Mega',
  },
];

// Helper to get coin amount from product ID
export function getCoinsForProductId(productId: string): number {
  const pack = COIN_PACKS.find(p => p.id === productId);
  return pack?.coins ?? 0;
}
