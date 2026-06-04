import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  coins: number;
  onClaim: () => void;
}

// Each burst coin is its own component so hooks are valid
function BurstCoin({ index, total }: { index: number; total: number }) {
  const angle = (index / total) * Math.PI * 2;
  const animY = useRef(new Animated.Value(0)).current;
  const animX = useRef(new Animated.Value(0)).current;
  const animO = useRef(new Animated.Value(0)).current;
  const animS = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.timing(animO, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(animO, { toValue: 0, duration: 400, useNativeDriver: true }),
      ]),
      Animated.timing(animY, {
        toValue: -Math.sin(angle) * 65,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(animX, {
        toValue: Math.cos(angle) * 65,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(animS, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(animS, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.burstCoin,
        {
          opacity: animO,
          transform: [
            { translateX: animX },
            { translateY: animY },
            { scale: animS },
          ],
        },
      ]}
    >
      <View style={styles.burstCoinInner}>
        <Text style={styles.burstCoinText}>$</Text>
      </View>
    </Animated.View>
  );
}

const BURST_TOTAL = 8;

export default function DailyRewardModal({ visible, coins, onClaim }: Props) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const coinScaleAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      coinScaleAnim.setValue(0);
      spinAnim.setValue(0);

      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 70,
            friction: 7,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(coinScaleAnim, {
          toValue: 1,
          tension: 55,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const rotate = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "20deg"],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClaim}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              backgroundColor: colors.card,
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          {/* Coin with burst */}
          <View style={styles.coinWrapper}>
            {Array.from({ length: BURST_TOTAL }, (_, i) => (
              <BurstCoin key={i} index={i} total={BURST_TOTAL} />
            ))}
            <Animated.View
              style={[
                styles.coinCircle,
                {
                  backgroundColor: colors.accent,
                  transform: [{ scale: coinScaleAnim }, { rotate }],
                },
              ]}
            >
              <Text style={styles.coinSymbol}>$</Text>
            </Animated.View>
          </View>

          {/* Text */}
          <View style={styles.textBlock}>
            <Text style={[styles.tagline, { color: colors.mutedForeground }]}>
              DAILY REWARD
            </Text>
            <Text style={[styles.heading, { color: colors.foreground }]}>
              Welcome Back!
            </Text>
            <Text style={[styles.body, { color: colors.mutedForeground }]}>
              Here's your reward for returning today
            </Text>
          </View>

          {/* Amount */}
          <View
            style={[
              styles.rewardBox,
              {
                backgroundColor: colors.accent + "15",
                borderColor: colors.accent + "50",
              },
            ]}
          >
            <Feather name="dollar-sign" size={28} color={colors.accent} />
            <Text style={[styles.rewardAmount, { color: colors.accent }]}>
              +{coins}
            </Text>
            <Text style={[styles.rewardLabel, { color: colors.foreground }]}>
              Coins Earned
            </Text>
          </View>

          {/* Note */}
          <Text style={[styles.noteText, { color: colors.mutedForeground }]}>
            Play daily to build your streak and unlock bigger rewards!
          </Text>

          {/* CTA */}
          <TouchableOpacity
            onPress={onClaim}
            style={[styles.claimBtn, { backgroundColor: colors.accent }]}
            activeOpacity={0.85}
          >
            <Feather name="gift" size={18} color="#000" />
            <Text style={styles.claimBtnText}>Claim Reward</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: "88%",
    maxWidth: 360,
    borderRadius: 28,
    padding: 28,
    gap: 20,
    alignItems: "center",
    shadowColor: "#E8A838",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  coinWrapper: {
    width: 110,
    height: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  coinCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8A838",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  coinSymbol: {
    fontSize: 32,
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  burstCoin: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  burstCoinInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#E8A838",
    alignItems: "center",
    justifyContent: "center",
  },
  burstCoinText: {
    fontSize: 10,
    color: "#000",
    fontFamily: "Inter_700Bold",
  },
  textBlock: { alignItems: "center", gap: 6 },
  tagline: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    letterSpacing: 2,
  },
  heading: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  body: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
  },
  rewardBox: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 20,
    alignItems: "center",
    gap: 6,
  },
  rewardAmount: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    lineHeight: 50,
  },
  rewardLabel: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  noteText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 18,
  },
  claimBtn: {
    width: "100%",
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  claimBtnText: {
    color: "#000",
    fontSize: 17,
    fontFamily: "Inter_700Bold",
  },
});
