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
  onClose: () => void;
  quote: string;
  attribution: string;
  durationSeconds: number;
  hintsUsed: number;
  coinsEarned: number;
  /** Optional: callback when player taps "Watch ad to 2x coins" */
  onDoubleReward?: () => void;
}

function ConfettiPiece({ index }: { index: number }) {
  const colors = [
    "#E8A838",
    "#4C51A0",
    "#52B788",
    "#E76F51",
    "#9B5DE5",
    "#06D6A0",
  ];
  const color = colors[index % colors.length];
  const left = `${(index * 17 + 5) % 90}%`;
  const animY = useRef(new Animated.Value(-30)).current;
  const animO = useRef(new Animated.Value(1)).current;
  const animR = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(animY, {
        toValue: 500,
        duration: 1800 + index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(animO, {
        toValue: 0,
        duration: 1600 + index * 80,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(animR, {
        toValue: 3,
        duration: 1800 + index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotate = animR.interpolate({
    inputRange: [0, 3],
    outputRange: ["0deg", "1080deg"],
  });

  return (
    <Animated.View
      style={{
        position: "absolute",
        left,
        top: 0,
        transform: [{ translateY: animY }, { rotate }],
        opacity: animO,
      }}
    >
      <View
        style={{
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: index % 2 === 0 ? 5 : 2,
        }}
      />
    </Animated.View>
  );
}

export default function CongratsModal({
  visible,
  onClose,
  quote,
  attribution,
  durationSeconds,
  hintsUsed,
  coinsEarned,
  onDoubleReward,
}: Props) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0.6);
      opacityAnim.setValue(0);
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 8,
        useNativeDriver: true,
      }).start();
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeStr =
    minutes > 0
      ? `${minutes}m ${seconds}s`
      : `${seconds}s`;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        {Array.from({ length: 20 }, (_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
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
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.success + "22" },
            ]}
          >
            <Feather name="award" size={40} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Puzzle Solved!
          </Text>
          <View
            style={[styles.quoteBox, { backgroundColor: colors.secondary }]}
          >
            <Text style={[styles.quoteText, { color: colors.foreground }]}>
              "{quote}"
            </Text>
            <Text style={[styles.attr, { color: colors.mutedForeground }]}>
              — {attribution}
            </Text>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Feather name="clock" size={16} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {timeStr}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Time
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statItem}>
              <Feather name="help-circle" size={16} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.foreground }]}>
                {hintsUsed}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Hints
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: colors.border }]}
            />
            <View style={styles.statItem}>
              <Feather name="dollar-sign" size={16} color={colors.accent} />
              <Text style={[styles.statValue, { color: colors.accent }]}>
                +{coinsEarned}
              </Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
                Coins
              </Text>
            </View>
          </View>
          {/* 2x coins offer — shown if handler provided */}
          {onDoubleReward && (
            <TouchableOpacity
              onPress={onDoubleReward}
              style={[
                styles.doubleBtn,
                { backgroundColor: colors.accent + "18", borderColor: colors.accent },
              ]}
              activeOpacity={0.85}
            >
              <View style={[styles.adChip, { backgroundColor: colors.accent }]}>
                <Text style={[styles.adChipText, { color: "#000" }]}>AD</Text>
              </View>
              <Text style={[styles.doubleBtnText, { color: colors.accent }]}>
                Watch ad → double your coins (+{coinsEarned} bonus)
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onClose}
            style={[
              styles.button,
              { backgroundColor: colors.primary },
            ]}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  modal: {
    width: "88%",
    maxWidth: 360,
    borderRadius: 24,
    padding: 24,
    gap: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
  },
  quoteBox: {
    borderRadius: 12,
    padding: 16,
    gap: 8,
    width: "100%",
  },
  quoteText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 22,
    textAlign: "center",
    fontStyle: "italic",
  },
  attr: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-evenly",
  },
  statItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  statLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  statDivider: {
    width: 1,
    height: 40,
    opacity: 0.5,
  },
  doubleBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  adChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  adChipText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
  },
  doubleBtnText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    flex: 1,
  },
  button: {
    width: "100%",
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
  },
});
