import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { AD_UNIT_IDS } from "@/constants/adConfig";

let BannerAd: any = null;
let BannerAdSize: any = null;

try {
  const GoogleMobileAds = require("react-native-google-mobile-ads");
  BannerAd = GoogleMobileAds.BannerAd;
  BannerAdSize = GoogleMobileAds.BannerAdSize;
} catch {
  // Not available in dev
}

export default function BannerAdView() {
  if (!BannerAd || !BannerAdSize || !AD_UNIT_IDS.BANNER) {
    return null;
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={AD_UNIT_IDS.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: true }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
  },
});
