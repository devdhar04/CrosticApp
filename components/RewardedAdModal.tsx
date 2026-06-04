import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import { useAdMob } from "@/hooks/useAdMob";

const AD_DURATION_SECONDS = 5;

interface Props {
  visible: boolean;
  onClose: () => void;
  onReward: () => void;
}

/**
 * Rewarded Ad Modal
 *
 * In production: Shows real Google AdMob rewarded video ad
 * In development: Shows mock ad with countdown timer
 */
export default function RewardedAdModal({ visible, onClose, onReward }: Props) {
  const colors = useColors();
  const { isInitialized, rewardedLoaded, showRewarded } = useAdMob();
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS);
  const [claimed, setClaimed] = useState(false);
  const [showingAd, setShowingAd] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!visible) return;
    setSecondsLeft(AD_DURATION_SECONDS);
    setClaimed(false);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [visible]);

  const ready = secondsLeft === 0;

  const handleClaim = () => {
    if (!ready || claimed) return;
    setClaimed(true);
    onReward();
    onClose();
  };

  // Handler for watching real ad
  const handleWatchAd = async () => {
    setShowingAd(true);
    await showRewarded(() => {
      // User watched ad successfully
      onReward();
      onClose();
      setShowingAd(false);
    });
    setShowingAd(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.header}>
            <View
              style={[styles.adChip, { backgroundColor: colors.accent + "22" }]}
            >
              <Text style={[styles.adChipText, { color: colors.accent }]}>
                AD
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Watch to earn 1 hint
            </Text>
            {!ready && (
              <TouchableOpacity onPress={onClose} hitSlop={10}>
                <Feather name="x" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
            {ready && <View style={{ width: 20 }} />}
          </View>

          <View
            style={[
              styles.adSurface,
              { backgroundColor: colors.secondary, borderColor: colors.border },
            ]}
          >
            <Feather name="play-circle" size={48} color={colors.accent} />
            <Text
              style={[styles.adSurfaceLabel, { color: colors.mutedForeground }]}
            >
              Sponsored
            </Text>
            <Text
              style={[styles.adSurfaceCopy, { color: colors.foreground }]}
              numberOfLines={2}
            >
              Your ad could be here
            </Text>
          </View>

          <Text style={[styles.helper, { color: colors.mutedForeground }]}>
            {showingAd
              ? "Loading ad..."
              : isInitialized && rewardedLoaded
              ? "Tap below to watch ad and earn coins"
              : ready
              ? "Thanks for watching! Tap below to claim your hint."
              : `Ad finishes in ${secondsLeft}s…`}
          </Text>

          {showingAd && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}

          {!showingAd && (
            <TouchableOpacity
              disabled={!ready && !(isInitialized && rewardedLoaded)}
              onPress={isInitialized && rewardedLoaded ? handleWatchAd : handleClaim}
              style={[
                styles.claimBtn,
                {
                  backgroundColor: (ready || (isInitialized && rewardedLoaded))
                    ? colors.primary
                    : colors.muted,
                },
              ]}
              activeOpacity={0.85}
            >
              <Feather
                name={isInitialized && rewardedLoaded ? "play-circle" : "gift"}
                size={16}
                color={(ready || (isInitialized && rewardedLoaded))
                  ? colors.primaryForeground
                  : colors.mutedForeground}
              />
              <Text
                style={[
                  styles.claimText,
                  {
                    color: (ready || (isInitialized && rewardedLoaded))
                      ? colors.primaryForeground
                    : colors.mutedForeground,
                },
              ]}
              >
                {isInitialized && rewardedLoaded
                  ? "Watch Ad"
                  : ready
                  ? "Claim 1 Hint"
                  : "Please wait…"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  adChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  adChipText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_700Bold",
  },
  adSurface: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  adSurfaceLabel: {
    fontSize: 10,
    letterSpacing: 1,
    fontFamily: "Inter_600SemiBold",
  },
  adSurfaceCopy: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  helper: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  claimBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  claimText: {
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
