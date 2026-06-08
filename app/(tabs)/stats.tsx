import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PUZZLES } from "@/constants/puzzleData";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import { logScreenView } from "@/utils/analytics";

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  const colors = useColors();
  const color = accent ?? colors.primary;

  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <View
        style={[styles.statIconBox, { backgroundColor: color + "18" }]}
      >
        <Feather name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.statValue, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
      {sub && (
        <Text style={[styles.statSub, { color: colors.mutedForeground }]}>
          {sub}
        </Text>
      )}
    </View>
  );
}

function AchievementItem({
  achievement,
}: {
  achievement: ReturnType<typeof useGame>["achievements"][0];
}) {
  const colors = useColors();
  const unlocked = !!achievement.unlockedAt;

  const iconMap: Record<string, React.ComponentProps<typeof Feather>["name"]> = {
    star: "star",
    flame: "zap",
    trophy: "award",
    brain: "cpu",
    fire: "zap",
    shield: "shield",
    zap: "zap",
    calendar: "calendar",
    coins: "dollar-sign",
  };

  const featherIcon = iconMap[achievement.icon] ?? "star";

  return (
    <View
      style={[
        styles.achieveItem,
        {
          backgroundColor: unlocked ? colors.card : colors.secondary,
          borderColor: unlocked ? colors.accent : colors.border,
          borderWidth: unlocked ? 1.5 : 1,
          opacity: unlocked ? 1 : 0.65,
        },
      ]}
    >
      <View
        style={[
          styles.achieveIcon,
          {
            backgroundColor: unlocked
              ? colors.accent + "22"
              : colors.muted,
          },
        ]}
      >
        <Feather
          name={featherIcon}
          size={22}
          color={unlocked ? colors.accent : colors.mutedForeground}
        />
      </View>
      <View style={styles.achieveInfo}>
        <Text
          style={[
            styles.achieveTitle,
            { color: unlocked ? colors.foreground : colors.mutedForeground },
          ]}
        >
          {achievement.title}
        </Text>
        <Text style={[styles.achieveDesc, { color: colors.mutedForeground }]}>
          {achievement.description}
        </Text>
        {unlocked && achievement.unlockedAt && (
          <Text style={[styles.achieveDate, { color: colors.success }]}>
            Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
      {unlocked && (
        <Feather name="check-circle" size={18} color={colors.success} />
      )}
      {!unlocked && (
        <Feather name="lock" size={16} color={colors.mutedForeground} />
      )}
    </View>
  );
}

export default function StatsScreen() {
  React.useEffect(() => { logScreenView('stats'); }, []);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    completedPuzzles,
    streak,
    totalWordsFound,
    hintsTotal,
    achievements,
    coins,
    getLevel,
    getXPProgress,
    xp,
  } = useGame();

  const totalCompleted = completedPuzzles.length;
  const avgTime =
    completedPuzzles.length > 0
      ? Math.round(
          completedPuzzles.reduce((a, c) => a + c.durationSeconds, 0) /
            completedPuzzles.length
        )
      : 0;
  const avgMins = Math.floor(avgTime / 60);
  const avgSecs = avgTime % 60;
  const avgTimeStr =
    avgTime === 0
      ? "—"
      : avgMins > 0
      ? `${avgMins}m ${avgSecs}s`
      : `${avgSecs}s`;

  const noHintSolves = completedPuzzles.filter((c) => c.hintsUsed === 0).length;
  const unlockedCount = achievements.filter((a) => !!a.unlockedAt).length;

  const level = getLevel();
  const xpProgress = getXPProgress();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:
              Platform.OS === "web"
                ? insets.top + 67
                : insets.top + 8,
            paddingBottom: Platform.OS === "web" ? 34 + 84 : 100 + insets.bottom,
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Statistics
          </Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Your puzzle journey
          </Text>
        </View>

        {/* Level card */}
        <View style={[styles.levelCard, { backgroundColor: colors.primary }]}>
          <Text style={styles.levelTitle}>Level {level} Solver</Text>
          <Text style={styles.levelXP}>
            {xpProgress.current} / {xpProgress.required} XP to next level
          </Text>
          <View style={styles.xpBarBg}>
            <View
              style={[
                styles.xpBarFill,
                {
                  width: `${Math.min(
                    100,
                    Math.round((xpProgress.current / xpProgress.required) * 100)
                  )}%` as any,
                },
              ]}
            />
          </View>
          <Text style={styles.totalXP}>{xp} total XP</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            OVERVIEW
          </Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="check-square"
              label="Puzzles Solved"
              value={totalCompleted}
              sub={`of ${PUZZLES.length} total`}
            />
            <StatCard
              icon="zap"
              label="Best Streak"
              value={streak.best}
              sub="days"
              accent={colors.destructive}
            />
            <StatCard
              icon="clock"
              label="Avg Time"
              value={avgTimeStr}
              accent={colors.accent}
            />
            <StatCard
              icon="help-circle"
              label="Hints Used"
              value={hintsTotal}
              accent="#9B5DE5"
            />
            <StatCard
              icon="cpu"
              label="Pure Solves"
              value={noHintSolves}
              sub="no hints"
              accent={colors.success}
            />
            <StatCard
              icon="dollar-sign"
              label="Coins"
              value={coins}
              accent={colors.accent}
            />
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.section}>
          <View style={styles.achieveHeader}>
            <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
              ACHIEVEMENTS
            </Text>
            <Text style={[styles.achieveCount, { color: colors.accent }]}>
              {unlockedCount}/{achievements.length}
            </Text>
          </View>
          <View style={styles.achieveProgress}>
            <View
              style={[
                styles.achieveProgressBar,
                { backgroundColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.achieveProgressFill,
                  {
                    backgroundColor: colors.accent,
                    width: `${achievements.length > 0
                      ? Math.round((unlockedCount / achievements.length) * 100)
                      : 0}%` as any,
                  },
                ]}
              />
            </View>
          </View>
          {achievements.map((a) => (
            <AchievementItem key={a.id} achievement={a} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 20 },
  header: { paddingHorizontal: 20, gap: 4 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  levelCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    gap: 10,
  },
  levelTitle: { color: "#FFF", fontSize: 22, fontFamily: "Inter_700Bold" },
  levelXP: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  xpBarBg: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  xpBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },
  totalXP: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 10,
  },
  statCard: {
    width: "47%",
    flexShrink: 1,
    borderRadius: 14,
    padding: 16,
    gap: 8,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: -4 },
  achieveHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  achieveCount: { fontSize: 13, fontFamily: "Inter_700Bold" },
  achieveProgress: { paddingHorizontal: 16 },
  achieveProgressBar: {
    height: 6,
    borderRadius: 3,
  },
  achieveProgressFill: {
    height: 6,
    borderRadius: 3,
  },
  achieveItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 14,
  },
  achieveIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  achieveInfo: { flex: 1, gap: 3 },
  achieveTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  achieveDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
  achieveDate: { fontSize: 11, fontFamily: "Inter_500Medium", marginTop: 2 },
});
