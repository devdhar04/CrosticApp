import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { HINT_COST_LETTER, HINT_COST_REMOVE_WRONG, HINT_COST_WORD } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

export type HintType = "letter" | "remove" | "word";

interface Props {
  coins: number;
  onUseHint: (type: HintType) => void;
  /** True when player hasn't typed anything for 45+ seconds */
  idleNudge?: boolean;
}

interface HintButtonProps {
  label: string;
  icon: "type" | "x-circle" | "book-open";
  cost: number;
  hintType: HintType;
  coins: number;
  onPress: (type: HintType) => void;
  pulseAnim?: Animated.Value;
}

function HintButton({ label, icon, cost, hintType, coins, onPress, pulseAnim }: HintButtonProps) {
  const colors = useColors();
  const canAfford = coins >= cost;

  const scaleStyle = pulseAnim
    ? {
        transform: [
          {
            scale: pulseAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.08],
            }),
          },
        ],
      }
    : undefined;

  return (
    <Animated.View style={[{ flex: 1 }, scaleStyle]}>
      <TouchableOpacity
        onPress={() => onPress(hintType)}
        activeOpacity={0.82}
        style={[
          styles.hintBtn,
          {
            backgroundColor: canAfford ? colors.primary + "15" : colors.secondary,
            borderColor: canAfford ? colors.primary : colors.border,
            opacity: canAfford ? 1 : 0.55,
          },
        ]}
      >
        <Feather
          name={icon}
          size={13}
          color={canAfford ? colors.primary : colors.mutedForeground}
        />
        <Text
          style={[
            styles.hintLabel,
            { color: canAfford ? colors.foreground : colors.mutedForeground },
          ]}
        >
          {label}
        </Text>
        <View
          style={[
            styles.costBadge,
            { backgroundColor: canAfford ? colors.accent + "22" : colors.muted },
          ]}
        >
          <Text
            style={[
              styles.costText,
              { color: canAfford ? colors.accent : colors.mutedForeground },
            ]}
          >
            {cost}🪙
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * Horizontal hint bar rendered above the keyboard.
 * Shows three hint type buttons with coin costs.
 * Pulses the cheapest hint when the player appears idle (idleNudge=true).
 */
export default function HintsBar({ coins, onUseHint, idleNudge = false }: Props) {
  const colors = useColors();
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (idleNudge && coins >= HINT_COST_LETTER) {
      pulseLoop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ])
      );
      pulseLoop.current.start();
    } else {
      pulseLoop.current?.stop();
      pulseAnim.setValue(0);
    }
    return () => pulseLoop.current?.stop();
  }, [idleNudge, coins]);

  const isLow = coins < HINT_COST_WORD && coins >= HINT_COST_LETTER;
  const isBroke = coins < HINT_COST_LETTER;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, borderTopColor: colors.border },
      ]}
    >
      {/* Hint buttons */}
      <View style={styles.buttonsRow}>
        <HintButton
          label="Letter"
          icon="type"
          cost={HINT_COST_LETTER}
          hintType="letter"
          coins={coins}
          onPress={onUseHint}
          pulseAnim={idleNudge ? pulseAnim : undefined}
        />
        <HintButton
          label="Clean"
          icon="x-circle"
          cost={HINT_COST_REMOVE_WRONG}
          hintType="remove"
          coins={coins}
          onPress={onUseHint}
        />
        <HintButton
          label="Word"
          icon="book-open"
          cost={HINT_COST_WORD}
          hintType="word"
          coins={coins}
          onPress={onUseHint}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
    gap: 8,
  },
  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  balanceLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  coinPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  coinPillText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  coinWarning: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  buttonsRow: {
    flexDirection: "row",
    gap: 6,
  },
  hintBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  hintLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  costBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  costText: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },
});
