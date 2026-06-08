import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Alert,
  Animated,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useGame } from "@/context/GameContext";
import { useInAppPurchases } from "@/hooks/useInAppPurchases";
import type { StoreProductInfo } from "@/hooks/useInAppPurchases";
import { COIN_PACKS } from "@/constants/iapProducts";

interface Props {
  visible: boolean;
  onClose: () => void;
  onWatchAd: () => void;
  /** Which hint the player tried to use so we show the right cost */
  hintCost: number;
  currentCoins: number;
}

interface CoinPackProps {
  coins: number;
  productInfo: StoreProductInfo;
  label: string;
  badge?: string;
  onBuy: () => void;
}

function CoinPackButton({ coins, productInfo, label, badge, onBuy }: CoinPackProps) {
  const colors = useColors();
  const isOnOffer = productInfo.hasOffer && productInfo.price !== productInfo.regularPrice;
  return (
    <TouchableOpacity
      onPress={onBuy}
      activeOpacity={0.85}
      style={[
        styles.packButton,
        { backgroundColor: colors.secondary, borderColor: isOnOffer ? colors.accent : colors.border },
      ]}
    >
      {isOnOffer && productInfo.offerLabel ? (
        <View style={[styles.packBadge, { backgroundColor: colors.accent }]}>
          <Text style={styles.packBadgeText}>{productInfo.offerLabel}</Text>
        </View>
      ) : badge ? (
        <View style={[styles.packBadge, { backgroundColor: colors.primary }]}>
          <Text style={styles.packBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Text style={styles.packCoinEmoji}>🪙</Text>
      <Text style={[styles.packCoins, { color: colors.foreground }]}>{coins}</Text>
      <Text style={[styles.packLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <View style={[styles.packPrice, { backgroundColor: isOnOffer ? colors.accent : colors.primary }]}>
        {isOnOffer && (
          <Text style={styles.packOldPriceText}>{productInfo.regularPrice}</Text>
        )}
        <Text style={styles.packPriceText}>{productInfo.price}</Text>
      </View>
    </TouchableOpacity>
  );
}

/**
 * Bottom sheet shown when the player tries to use a hint but doesn't have
 * enough coins. Presents options to get coins:
 *   1. Watch a rewarded ad → +30 coins (then hint auto-applied)
 *   2. Buy coin packs directly
 *   3. Keep playing without hint (dismiss)
 */
export default function OutOfCoinsSheet({
  visible,
  onClose,
  onWatchAd,
  hintCost,
  currentCoins,
}: Props) {
  const colors = useColors();
  const { purchaseCoinPack } = useGame();
  const { isConnected, purchaseProduct, getProductInfo } = useInAppPurchases();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bgAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleBuy = (productId: string, coinAmount: number, price: string) => {
    // For Android, use real IAP. For iOS and Web, use demo mode
    if (Platform.OS === 'android' && isConnected) {
      // Real Android purchase
      purchaseProduct(productId);
      onClose(); // Close modal while purchase is processing
    } else {
      // Demo mode for iOS/Web
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
              Alert.alert("🎉 Success!", `${coinAmount} coins added!`, [
                { text: "OK", onPress: onClose }
              ]);
            },
          },
        ]
      );
    }
  };

  const bgOpacity = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Backdrop */}
        <Animated.View
          style={[styles.backdrop, { opacity: bgOpacity }]}
          pointerEvents="box-none"
        />
        <TouchableOpacity style={styles.backdropTap} onPress={onClose} activeOpacity={1} />

        {/* Sheet */}
        <Animated.View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Handle */}
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconCircle, { backgroundColor: colors.destructive + "18" }]}>
              <Feather name="zap-off" size={24} color={colors.destructive} />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Not enough coins
              </Text>
              <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
                You need {hintCost} 🪙 — you have {currentCoins} 🪙
              </Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollContent}
            contentContainerStyle={styles.scrollContentContainer}
          >
            {/* Option 1 — Watch Ad (primary) */}
            <TouchableOpacity
              style={[styles.optionPrimary, { backgroundColor: colors.primary }]}
              onPress={onWatchAd}
              activeOpacity={0.88}
            >
              <View style={[styles.adChip, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                <Text style={styles.adChipText}>AD</Text>
              </View>
              <View style={styles.optionText}>
                <Text style={styles.optionPrimaryLabel}>Watch a short ad</Text>
                <Text style={styles.optionPrimarySub}>Get +30 coins instantly</Text>
              </View>
              <Feather name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>OR BUY COINS</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Coin Packs */}
            <View style={styles.packsContainer}>
              {COIN_PACKS.map((pack) => {
                const info = getProductInfo(pack);
                return (
                  <CoinPackButton
                    key={pack.id}
                    coins={pack.coins}
                    productInfo={info}
                    label={pack.label}
                    badge={pack.badge}
                    onBuy={() => handleBuy(pack.id, pack.coins, info.price)}
                  />
                );
              })}
            </View>
          </ScrollView>

          {/* Bottom dismiss button */}
          <TouchableOpacity
            style={styles.optionDismiss}
            onPress={onClose}
            activeOpacity={0.75}
          >
            <Text style={[styles.optionDismissText, { color: colors.mutedForeground }]}>
              Keep playing without hint
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  backdropTap: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '85%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  scrollContent: {
    flexGrow: 0,
  },
  scrollContentContainer: {
    gap: 12,
    paddingBottom: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  headerText: { flex: 1 },
  title: { fontSize: 17, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },

  optionPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  adChip: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adChipText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  optionText: { flex: 1 },
  optionPrimaryLabel: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  optionPrimarySub: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  optionSecondary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  optionSecondaryLabel: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  optionSecondarySub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  optionDismiss: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  optionDismissText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },

  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.8,
  },

  packsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  packButton: {
    flex: 1,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 6,
    position: "relative",
  },
  packBadge: {
    position: "absolute",
    top: -6,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  packBadgeText: {
    color: "#FFF",
    fontSize: 8,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.5,
  },
  packCoinEmoji: {
    fontSize: 28,
  },
  packCoins: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  packLabel: {
    fontSize: 10,
    fontFamily: "Inter_500Medium",
  },
  packPrice: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 2,
    alignItems: "center",
  },
  packOldPriceText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 9,
    fontFamily: "Inter_400Regular",
    textDecorationLine: "line-through",
  },
  packPriceText: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
});
