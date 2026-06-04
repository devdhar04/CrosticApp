import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { PuzzleRaw } from "@/constants/puzzleData";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#52B788",
  medium: "#E8A838",
  hard: "#E76F51",
  expert: "#9B5DE5",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
  expert: "Expert",
};

interface Props {
  puzzle: PuzzleRaw;
  isCompleted?: boolean;
  isDaily?: boolean;
  isLocked?: boolean;
}

export default function PuzzleCard({ puzzle, isCompleted, isDaily, isLocked }: Props) {
  const router = useRouter();
  const colors = useColors();
  const diffColor = DIFFICULTY_COLORS[puzzle.difficulty] ?? colors.accent;

  const handlePress = () => {
    if (isLocked) return;
    router.push({ pathname: "/puzzle/[id]", params: { id: puzzle.id } });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={isLocked ? 1 : 0.8}
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isCompleted
            ? colors.success
            : isDaily
            ? colors.accent
            : colors.border,
          borderWidth: isCompleted || isDaily ? 1.5 : 1,
          opacity: isLocked ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.row}>
        <View style={styles.left}>
          {isDaily && (
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.accent + "22", borderColor: colors.accent },
              ]}
            >
              <Feather name="calendar" size={10} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent }]}>
                DAILY
              </Text>
            </View>
          )}
          <Text
            style={[styles.theme, { color: colors.mutedForeground }]}
            numberOfLines={1}
          >
            {puzzle.theme}
          </Text>
          <Text
            style={[styles.quote, { color: colors.foreground }]}
            numberOfLines={2}
          >
            {puzzle.quote.length > 60
              ? puzzle.quote.slice(0, 58) + "..."
              : puzzle.quote}
          </Text>
          <Text style={[styles.attribution, { color: colors.mutedForeground }]}>
            — {puzzle.attribution}
          </Text>
        </View>
        <View style={styles.right}>
          {isCompleted ? (
            <View
              style={[styles.checkCircle, { backgroundColor: colors.success }]}
            >
              <Feather name="check" size={16} color="#FFF" />
            </View>
          ) : isLocked ? (
            <Feather name="lock" size={18} color={colors.mutedForeground} />
          ) : (
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          )}
        </View>
      </View>
      <View style={styles.footer}>
        <View style={[styles.diffBadge, { backgroundColor: diffColor + "22" }]}>
          <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
          <Text style={[styles.diffText, { color: diffColor }]}>
            {DIFFICULTY_LABELS[puzzle.difficulty]}
          </Text>
        </View>
        <Text style={[styles.wordCount, { color: colors.mutedForeground }]}>
          {puzzle.clueWords.length} clues
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  right: {
    paddingTop: 4,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: {
    fontSize: 9,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.8,
  },
  theme: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  quote: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  attribution: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    fontStyle: "italic",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  diffBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  diffDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  diffText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  wordCount: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});
