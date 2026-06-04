import { Platform } from 'react-native';

/**
 * AdMob Ad Unit IDs
 *
 * IMPORTANT: These are TEST IDs for development.
 * Replace with your REAL Ad Unit IDs from AdMob before publishing!
 *
 * Get your Ad Unit IDs from:
 * https://apps.admob.google.com/
 */

// Test Ad Unit IDs (provided by Google for testing)
const TEST_IDS = {
  BANNER: Platform.select({
    android: 'ca-app-pub-3940256099942544/6300978111',
    ios: 'ca-app-pub-3940256099942544/2934735716',
  }),
  INTERSTITIAL: Platform.select({
    android: 'ca-app-pub-3940256099942544/1033173712',
    ios: 'ca-app-pub-3940256099942544/4411468910',
  }),
  REWARDED: Platform.select({
    android: 'ca-app-pub-3940256099942544/5224354917',
    ios: 'ca-app-pub-3940256099942544/1712485313',
  }),
};

// Production Ad Unit IDs
const PRODUCTION_IDS = {
  BANNER: Platform.select({
    android: 'ca-app-pub-1504708773553595/8688917498',
    ios: 'ca-app-pub-1504708773553595/8688917498',
  }),
  INTERSTITIAL: Platform.select({
    android: 'ca-app-pub-1504708773553595/8688917498', // TODO: Create separate interstitial ad unit
    ios: 'ca-app-pub-1504708773553595/8688917498',
  }),
  REWARDED: Platform.select({
    android: 'ca-app-pub-1504708773553595/6845352784',
    ios: 'ca-app-pub-1504708773553595/6845352784',
  }),
};

// Use test IDs in development, production IDs in release
const USE_TEST_IDS = __DEV__;

export const AD_UNIT_IDS = USE_TEST_IDS ? TEST_IDS : PRODUCTION_IDS;

// Ad Configuration
export const AD_CONFIG = {
  // Show banner ads on these screens
  SHOW_BANNER_ON_HOME: false, // Usually don't show on main screen
  SHOW_BANNER_ON_SHOP: false,
  SHOW_BANNER_IN_PUZZLE: false, // Never show during gameplay

  // Interstitial ad frequency
  INTERSTITIAL_FREQUENCY: 3, // Show after every 3 puzzles completed

  // Rewarded ad coin reward
  REWARDED_AD_COINS: 30,
};

// AdMob App ID (from app.json)
export const ADMOB_APP_ID = Platform.select({
  android: 'ca-app-pub-1504708773553595~9960116650',
  ios: 'ca-app-pub-1504708773553595~9960116650',
});
