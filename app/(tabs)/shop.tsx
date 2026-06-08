import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AD_CONFIG } from "@/constants/adConfig";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import { useAdMob } from "@/hooks/useAdMob";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import { COIN_PACKS } from "@/constants/iapProducts";
import type { StoreProductInfo } from "@/hooks/useInAppPurchases";
import {
  logScreenView,
  logPurchaseInitiated,
  logRemoveAdsPurchase,
  logAdImpression,
  logRewardedAdComplete,
} from "@/utils/analytics";

interface CoinPackProps {
  coins: number;
  productInfo: StoreProductInfo;
  label: string;
  badge?: string;
  onBuy: () => void;
  colors: ReturnType<typeof useColors>;
}

function CoinPack({ coins, productInfo, label, badge, onBuy, colors }: CoinPackProps) {
  const isOnOffer = productInfo.hasOffer && productInfo.price !== productInfo.regularPrice;

  return (
    <TouchableOpacity
      onPress={onBuy}
      activeOpacity={0.85}
      style={[
        styles.packCard,
        { backgroundColor: colors.card, borderColor: isOnOffer ? colors.accent : colors.border },
      ]}
    >
      {/* Offer label takes priority over regular badge */}
      {isOnOffer && productInfo.offerLabel ? (
        <View style={[styles.packBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.packBadgeText}>{productInfo.offerLabel}</Text>
        </View>
      ) : badge ? (
        <View style={[styles.packBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.packBadgeText}>{badge}</Text>
        </View>
      ) : null}

      <View style={[styles.packIconCircle, { backgroundColor: colors.accent + "18" }]}>
        <Text style={styles.packCoinEmoji}>🪙</Text>
      </View>
      <Text style={[styles.packCoins, { color: colors.foreground }]}>{coins}</Text>
      <Text style={[styles.packLabel, { color: colors.mutedForeground }]}>{label}</Text>

      <View style={[styles.packPriceBtn, { backgroundColor: isOnOffer ? colors.accent : colors.primary }]}>
        {isOnOffer && (
          <Text style={styles.packOldPrice}>{productInfo.regularPrice}</Text>
        )}
        <Text style={styles.packPriceBtnText}>{productInfo.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { coins, purchaseCoinPack, purchaseRemoveAds, purchasePremium, removeAds, isPremium, addCoins } = useGame();
  const { isConnected, isLoading, purchaseProduct, getProductInfo } = useInAppPurchases();

  React.useEffect(() => { logScreenView('shop'); }, []);
  const { showRewarded } = useAdMob();

  const handleBuy = (productId: string, coinAmount: number, price: string) => {
    logPurchaseInitiated({ product_id: productId, coins: coinAmount, price });
    if (Platform.OS === 'android' && isConnected) {
      purchaseProduct(productId);
    } else {
      Alert.alert(
        "Purchase",
        Platform.OS === 'android' && !isConnected
          ? "Store connection failed. Please restart the app."
          : `Buy ${coinAmount} coins for ${price}?\n\n(Demo mode - no real charge on iOS/Web yet)`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Buy",
            onPress: () => {
              purchaseCoinPack(coinAmount);
              Alert.alert("🎉 Success!", `${coinAmount} coins added to your balance.`);
            },
          },
        ]
      );
    }
  };

  const handleRemoveAds = () => {
    if (removeAds) return;
    Alert.alert(
      "Remove Ads",
      "Remove all ads permanently for $3.99?\n\n(This is a demo — no real charge.)",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Buy", onPress: () => { purchaseRemoveAds(); logRemoveAdsPurchase(); Alert.alert("🎉 Ads removed!"); } },
      ]
    );
  };

  const handlePremium = () => {
    if (isPremium) return;
    Alert.alert(
      "Go Premium",
      "Unlock Premium for $1.99/week?\nIncludes: No ads + 50 bonus coins/day + exclusive themes.\n\n(This is a demo — no real charge.)",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Subscribe", onPress: () => { purchasePremium(); Alert.alert("🌟 Welcome to Premium!"); } },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Platform.OS === "web" ? insets.top + 67 : insets.top + 12,
            paddingBottom: Platform.OS === "web" ? 34 + 84 : 110 + insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>Shop</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Coins power your hints
            </Text>
          </View>
          <View style={[styles.balancePill, { backgroundColor: colors.accent + "18", borderColor: colors.accent }]}>
            <Text style={[styles.balanceText, { color: colors.accent }]}>🪙 {coins}</Text>
          </View>
        </View>

        {/* Free coins — watch ad */}
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sectionHeader}>
            <Feather name="tv" size={16} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Free Coins</Text>
          </View>
          <Text style={[styles.sectionDesc, { color: colors.mutedForeground }]}>
            Watch a short ad to earn 30 coins — completely free.
          </Text>
          <TouchableOpacity
            onPress={() => {
              logAdImpression({ ad_type: 'rewarded', placement: 'shop' });
              showRewarded(() => {
                addCoins(AD_CONFIG.REWARDED_AD_COINS);
                logRewardedAdComplete({ placement: 'shop', reward_coins: AD_CONFIG.REWARDED_AD_COINS });
              });
            }}
            style={[styles.freeAdBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.88}
          >
            <View style={[styles.adChip, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Text style={styles.adChipText}>AD</Text>
            </View>
            <Text style={styles.freeAdBtnText}>Watch Ad → +30 Coins</Text>
          </TouchableOpacity>
        </View>

        {/* Coin packs */}
        <View style={styles.packHeader}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>COIN PACKS</Text>
          {Platform.OS === 'android' && isConnected && (
            <View style={[styles.storeBadge, { backgroundColor: colors.success + "18" }]}>
              <Text style={[styles.storeBadgeText, { color: colors.success }]}>
                🔒 Secure Google Play
              </Text>
            </View>
          )}
          {isLoading && (
            <ActivityIndicator size="small" color={colors.primary} />
          )}
        </View>
        <View style={styles.packsGrid}>
          {COIN_PACKS.map((pack) => {
            const info = getProductInfo(pack);
            return (
              <CoinPack
                key={pack.id}
                coins={pack.coins}
                productInfo={info}
                label={pack.label}
                badge={pack.badge}
                onBuy={() => handleBuy(pack.id, pack.coins, info.price)}
                colors={colors}
              />
            );
          })}
        </View>

        {/* Premium offerings - HIDDEN FOR NOW */}
        {false && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>PREMIUM</Text>

            {/* Remove Ads */}
            <TouchableOpacity
              onPress={handleRemoveAds}
              disabled={removeAds}
              activeOpacity={0.85}
              style={[
                styles.premiumCard,
                {
                  backgroundColor: colors.card,
                  borderColor: removeAds ? colors.success : colors.border,
                  opacity: removeAds ? 0.7 : 1,
                },
              ]}
            >
              <View style={[styles.premiumIcon, { backgroundColor: removeAds ? colors.success + "18" : colors.secondary }]}>
                <Feather name="eye-off" size={22} color={removeAds ? colors.success : colors.foreground} />
              </View>
              <View style={styles.premiumText}>
                <Text style={[styles.premiumTitle, { color: colors.foreground }]}>Remove Ads</Text>
                <Text style={[styles.premiumDesc, { color: colors.mutedForeground }]}>
                  {removeAds ? "Already purchased ✓" : "One-time purchase — no more interstitials ever"}
                </Text>
              </View>
              {!removeAds && (
                <View style={[styles.premiumPrice, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
                  <Text style={[styles.premiumPriceText, { color: colors.foreground }]}>$3.99</Text>
                </View>
              )}
              {removeAds && (
                <Feather name="check-circle" size={20} color={colors.success} />
              )}
            </TouchableOpacity>

            {/* Premium subscription */}
            <TouchableOpacity
              onPress={handlePremium}
              disabled={isPremium}
              activeOpacity={0.85}
              style={[
                styles.premiumCard,
                styles.premiumCardGold,
                {
                  backgroundColor: isPremium ? colors.card : colors.accent + "10",
                  borderColor: isPremium ? colors.success : colors.accent,
                  opacity: isPremium ? 0.7 : 1,
                },
              ]}
            >
              <View style={[styles.premiumIcon, { backgroundColor: isPremium ? colors.success + "18" : colors.accent + "22" }]}>
                <Feather name="star" size={22} color={isPremium ? colors.success : colors.accent} />
              </View>
              <View style={styles.premiumText}>
                <View style={styles.premiumTitleRow}>
                  <Text style={[styles.premiumTitle, { color: colors.foreground }]}>Premium</Text>
                  <View style={[styles.premiumTag, { backgroundColor: colors.accent }]}>
                    <Text style={styles.premiumTagText}>WEEKLY</Text>
                  </View>
                </View>
                <Text style={[styles.premiumDesc, { color: colors.mutedForeground }]}>
                  {isPremium
                    ? "Active — thank you! ✓"
                    : "No ads + 50 bonus coins/day + exclusive themes"}
                </Text>
              </View>
              {!isPremium && (
                <View style={[styles.premiumPrice, { backgroundColor: colors.accent + "22", borderColor: colors.accent }]}>
                  <Text style={[styles.premiumPriceText, { color: colors.accent }]}>$1.99</Text>
                </View>
              )}
              {isPremium && (
                <Feather name="check-circle" size={20} color={colors.success} />
              )}
            </TouchableOpacity>

            {/* Legal note */}
            <Text style={[styles.legalNote, { color: colors.mutedForeground }]}>
              All purchases are final. Subscriptions auto-renew weekly until cancelled. Prices shown in USD.
            </Text>
          </>
        )}
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 16, paddingHorizontal: 16 },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  balancePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  balanceText: { fontSize: 16, fontFamily: "Inter_700Bold" },

  section: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  sectionDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  freeAdBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  adChip: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  adChipText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold", letterSpacing: 0.6 },
  freeAdBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },

  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.2,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  packHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: -4,
  },
  storeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  storeBadgeText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
  },

  packsGrid: { flexDirection: "row", gap: 10 },
  packCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    alignItems: "center",
    gap: 8,
    position: "relative",
  },
  packBadge: {
    position: "absolute",
    top: -8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  packBadgeText: { color: "#000", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  packIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  packCoinEmoji: { fontSize: 24 },
  packCoins: { fontSize: 22, fontFamily: "Inter_700Bold" },
  packLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  packPriceBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginTop: 2, alignItems: "center" },
  packOldPrice: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Inter_400Regular", textDecorationLine: "line-through" },
  packPriceBtnText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },

  premiumCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
  },
  premiumCardGold: { marginTop: 0 },
  premiumIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  premiumText: { flex: 1, gap: 3 },
  premiumTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  premiumTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  premiumTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  premiumTagText: { color: "#000", fontSize: 9, fontFamily: "Inter_700Bold", letterSpacing: 0.5 },
  premiumDesc: { fontSize: 12, fontFamily: "Inter_400Regular", lineHeight: 17 },
  premiumPrice: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    flexShrink: 0,
  },
  premiumPriceText: { fontSize: 13, fontFamily: "Inter_700Bold" },

  legalNote: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 15,
    paddingHorizontal: 8,
    marginTop: 4,
  },
});
