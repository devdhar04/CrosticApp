import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { AD_UNIT_IDS } from '@/constants/adConfig';

let MobileAds: any = null;
let InterstitialAd: any = null;
let RewardedAd: any = null;
let BannerAdComponent: any = null;
let BannerAdSizeEnum: any = null;
let TestIds: any = null;
let AdEventType: any = null;
let RewardedAdEventType: any = null;

try {
  const GoogleMobileAds = require('react-native-google-mobile-ads');
  MobileAds = GoogleMobileAds.default;
  InterstitialAd = GoogleMobileAds.InterstitialAd;
  RewardedAd = GoogleMobileAds.RewardedAd;
  BannerAdComponent = GoogleMobileAds.BannerAd;
  BannerAdSizeEnum = GoogleMobileAds.BannerAdSize;
  TestIds = GoogleMobileAds.TestIds;
  AdEventType = GoogleMobileAds.AdEventType;
  RewardedAdEventType = GoogleMobileAds.RewardedAdEventType;
} catch (error) {
  if (__DEV__) {
    console.log('ℹ️ AdMob: Using demo mode (build production app for real ads)');
  }
}

const isAdMobAvailable = !!(MobileAds && InterstitialAd && RewardedAd);

export function useAdMob() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [interstitialLoaded, setInterstitialLoaded] = useState(false);
  const [rewardedLoaded, setRewardedLoaded] = useState(false);

  const interstitialRef = useRef<any>(null);
  const rewardedRef = useRef<any>(null);
  const rewardCallbackRef = useRef<(() => void) | null>(null);
  const interstitialClosedCallbackRef = useRef<(() => void) | null>(null);

  const loadInterstitialAd = useCallback(() => {
    if (!isAdMobAvailable) return;
    try {
      const adUnitId = AD_UNIT_IDS.INTERSTITIAL || TestIds.INTERSTITIAL;
      const ad = InterstitialAd.createForAdRequest(adUnitId);

      ad.addAdEventListener(AdEventType.LOADED, () => {
        console.log('📺 Interstitial ad loaded');
        setInterstitialLoaded(true);
      });

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('📺 Interstitial ad closed');
        setInterstitialLoaded(false);
        interstitialRef.current = null;
        if (interstitialClosedCallbackRef.current) {
          interstitialClosedCallbackRef.current();
          interstitialClosedCallbackRef.current = null;
        }
        loadInterstitialAd();
      });

      ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('❌ Interstitial ad error:', error);
        setInterstitialLoaded(false);
      });

      ad.load();
      interstitialRef.current = ad;
    } catch (error) {
      console.error('❌ Failed to load interstitial ad:', error);
    }
  }, []);

  const loadRewardedAd = useCallback(() => {
    if (!isAdMobAvailable) return;
    try {
      const adUnitId = AD_UNIT_IDS.REWARDED || TestIds.REWARDED;
      const ad = RewardedAd.createForAdRequest(adUnitId);

      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('🎁 Rewarded ad loaded');
        setRewardedLoaded(true);
      });

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        console.log('🎁 Rewarded ad closed');
        setRewardedLoaded(false);
        rewardedRef.current = null;
        loadRewardedAd();
      });

      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward: any) => {
        console.log('🎁 User earned reward:', reward);
        if (rewardCallbackRef.current) {
          rewardCallbackRef.current();
          rewardCallbackRef.current = null;
        }
      });

      ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.error('❌ Rewarded ad error:', error);
        setRewardedLoaded(false);
      });

      ad.load();
      rewardedRef.current = ad;
    } catch (error) {
      console.error('❌ Failed to load rewarded ad:', error);
    }
  }, []);

  useEffect(() => {
    if (!isAdMobAvailable) return;

    const init = async () => {
      try {
        await MobileAds().initialize();
        console.log('✅ AdMob initialized');
        setIsInitialized(true);
        loadInterstitialAd();
        loadRewardedAd();
      } catch (error) {
        console.error('❌ AdMob initialization failed:', error);
      }
    };

    init();
  }, [loadInterstitialAd, loadRewardedAd]);

  const showInterstitial = useCallback(async (onClosed?: () => void) => {
    if (onClosed) interstitialClosedCallbackRef.current = onClosed;
    if (!isAdMobAvailable) {
      console.log('📺 [Demo] Interstitial ad would show here');
      onClosed?.();
      return;
    }
    if (!interstitialLoaded || !interstitialRef.current) {
      console.log('📺 Interstitial ad not ready yet');
      onClosed?.();
      return;
    }
    try {
      await interstitialRef.current.show();
    } catch (error) {
      console.error('❌ Failed to show interstitial ad:', error);
      interstitialClosedCallbackRef.current = null;
      onClosed?.();
    }
  }, [interstitialLoaded]);

  const showRewarded = useCallback(async (onRewarded: () => void) => {
    if (!isAdMobAvailable) {
      console.log('📺 [Demo] Rewarded ad would show here');
      setTimeout(() => {
        Alert.alert('Demo Mode', 'In production, user would watch ad here. Giving reward anyway.', [
          { text: 'OK', onPress: onRewarded }
        ]);
      }, 500);
      return;
    }
    if (!rewardedLoaded || !rewardedRef.current) {
      Alert.alert('Ad Not Ready', 'Please wait a moment and try again.');
      return;
    }
    try {
      rewardCallbackRef.current = onRewarded;
      await rewardedRef.current.show();
    } catch (error) {
      console.error('❌ Failed to show rewarded ad:', error);
      rewardCallbackRef.current = null;
      Alert.alert('Error', 'Failed to show ad. Please try again.');
    }
  }, [rewardedLoaded]);

  return {
    isInitialized,
    interstitialLoaded,
    rewardedLoaded,
    showInterstitial,
    showRewarded,
    BannerAd: BannerAdComponent,
    BannerAdSize: BannerAdSizeEnum,
    AD_UNIT_IDS,
  };
}
