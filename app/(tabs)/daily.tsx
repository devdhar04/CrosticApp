import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DAILY_UNLOCK_LEVEL, PUZZLES } from "@/constants/puzzleData";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import { getDailyPuzzleId } from "@/utils/puzzleEngine";

function CountdownTimer() {
  const colors = useColors();
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(
        0,
        Math.floor((midnight.getTime() - now.getTime()) / 1000)
      );
      setTimeLeft({
        h: Math.floor(diff / 3600),
        m: Math.floor((diff % 3600) / 60),
        s: diff % 60,
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <View style={styles.timerRow}>
      {[timeLeft.h, timeLeft.m, timeLeft.s].map((val, i) => (
        <React.Fragment key={i}>
          {i > 0 && (
            <Text style={[styles.timerColon, { color: colors.mutedForeground }]}>
              :
            </Text>
          )}
          <View style={[styles.timerBlock, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.timerNum, { color: colors.foreground }]}>
              {pad(val)}
            </Text>
            <Text style={[styles.timerLabel, { color: colors.mutedForeground }]}>
              {i === 0 ? "HRS" : i === 1 ? "MIN" : "SEC"}
            </Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

function LockedDailyView({ level }: { level: number }) {
  const colors = useColors();
  const levelsNeeded = DAILY_UNLOCK_LEVEL - level;
  const progress = Math.min(1, level / DAILY_UNLOCK_LEVEL);

  return (
    <View style={[styles.lockedContainer, { backgroundColor: colors.background }]}>
      {/* Lock illustration */}
      <View
        style={[
          styles.lockCircleOuter,
          { borderColor: colors.border, backgroundColor: colors.secondary },
        ]}
      >
        <View
          style={[
            styles.lockCircleInner,
            { backgroundColor: colors.muted },
          ]}
        >
          <Feather name="lock" size={40} color={colors.mutedForeground} />
        </View>
      </View>

      <Text style={[styles.lockTitle, { color: colors.foreground }]}>
        Daily Challenge Locked
      </Text>
      <Text style={[styles.lockSubtitle, { color: colors.mutedForeground }]}>
        Complete puzzles to reach{" "}
        <Text style={{ color: colors.accent, fontFamily: "Inter_700Bold" }}>
          Level {DAILY_UNLOCK_LEVEL}
        </Text>{" "}
        and unlock daily challenges.
      </Text>

      {/* Progress */}
      <View style={[styles.lockProgressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.lockProgressRow}>
          <Text style={[styles.lockProgressLabel, { color: colors.foreground }]}>
            Your Level
          </Text>
          <Text style={[styles.lockProgressValue, { color: colors.primary }]}>
            {level} / {DAILY_UNLOCK_LEVEL}
          </Text>
        </View>
        <View style={[styles.lockBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.lockBarFill,
              {
                backgroundColor: colors.primary,
                width: `${Math.round(progress * 100)}%` as any,
              },
            ]}
          />
        </View>
        <Text style={[styles.lockProgressHint, { color: colors.mutedForeground }]}>
          {levelsNeeded} more level{levelsNeeded !== 1 ? "s" : ""} to unlock
        </Text>
      </View>

      {/* Tips */}
      <View style={[styles.tipsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.tipsTitle, { color: colors.foreground }]}>
          How to level up faster
        </Text>
        {[
          { icon: "cpu" as const, text: "Solve puzzles without using hints (+bonus XP)" },
          { icon: "zap" as const, text: "Complete harder difficulty puzzles for more XP" },
          { icon: "calendar" as const, text: "Play every day to maintain your streak" },
        ].map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <View style={[styles.tipIcon, { backgroundColor: colors.primary + "18" }]}>
              <Feather name={tip.icon} size={14} color={colors.primary} />
            </View>
            <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
              {tip.text}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function DailyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { streak, completedPuzzles, isPuzzleCompleted, getLevel } = useGame();

  const level = getLevel();
  const isDailyUnlocked = level >= DAILY_UNLOCK_LEVEL;

  const dailyId = getDailyPuzzleId(PUZZLES);
  const dailyPuzzle = PUZZLES.find((p) => p.id === dailyId)!;
  const isDailyDone = isPuzzleCompleted(dailyId);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const recentDailies = completedPuzzles
    .sort((a, b) => b.completedAt - a.completedAt)
    .slice(0, 5);

  const WEEK_DAYS = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toDateString();
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:
              Platform.OS === "web" ? insets.top + 67 : insets.top + 8,
            paddingBottom: Platform.OS === "web" ? 34 + 84 : 110 + insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Daily Challenge
            </Text>
            <Text style={[styles.date, { color: colors.mutedForeground }]}>
              {todayStr}
            </Text>
          </View>
          {isDailyUnlocked && (
            <View
              style={[
                styles.unlockedBadge,
                { backgroundColor: colors.success + "20", borderColor: colors.success },
              ]}
            >
              <Feather name="unlock" size={12} color={colors.success} />
              <Text style={[styles.unlockedText, { color: colors.success }]}>
                Unlocked
              </Text>
            </View>
          )}
        </View>

        {/* Locked state */}
        {!isDailyUnlocked && <LockedDailyView level={level} />}

        {/* Unlocked state */}
        {isDailyUnlocked && (
          <>
            {/* Streak Card */}
            <View style={[styles.streakCard, { backgroundColor: colors.primary }]}>
              <View style={styles.streakTopRow}>
                <View>
                  <Text style={styles.streakMain}>
                    {streak.current > 0
                      ? `🔥 ${streak.current} Day Streak`
                      : "Start a Streak!"}
                  </Text>
                  <Text style={styles.streakSub}>Best: {streak.best} days</Text>
                </View>
                <View style={styles.streakIconCircle}>
                  <Feather name="zap" size={28} color="rgba(255,255,255,0.9)" />
                </View>
              </View>
              {/* Week dots */}
              <View style={styles.weekRow}>
                {WEEK_DAYS.map((dayStr, i) => {
                  const d = new Date(dayStr);
                  const label = d.toLocaleDateString("en-US", {
                    weekday: "narrow",
                  });
                  const isToday = dayStr === new Date().toDateString();
                  const isDone = completedPuzzles.some(
                    (c) => new Date(c.completedAt).toDateString() === dayStr
                  );
                  return (
                    <View key={i} style={styles.dayItem}>
                      <Text style={styles.dayLabel}>{label}</Text>
                      <View
                        style={[
                          styles.dayDot,
                          {
                            backgroundColor: isDone
                              ? colors.success
                              : isToday
                              ? "rgba(255,255,255,0.35)"
                              : "rgba(255,255,255,0.15)",
                            borderColor: isToday
                              ? "rgba(255,255,255,0.8)"
                              : "transparent",
                            borderWidth: isToday ? 1.5 : 0,
                          },
                        ]}
                      >
                        {isDone && <Feather name="check" size={10} color="#FFF" />}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Today's puzzle card */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                TODAY'S PUZZLE
              </Text>
              {dailyPuzzle && (
                <View
                  style={[
                    styles.dailyCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isDailyDone ? colors.success : colors.accent,
                    },
                  ]}
                >
                  <View style={styles.dailyTop}>
                    <View
                      style={[
                        styles.themeTag,
                        { backgroundColor: colors.accent + "22" },
                      ]}
                    >
                      <Text
                        style={[styles.themeTagText, { color: colors.accent }]}
                      >
                        {dailyPuzzle.theme}
                      </Text>
                    </View>
                    {isDailyDone && (
                      <View
                        style={[
                          styles.doneTag,
                          { backgroundColor: colors.success + "22" },
                        ]}
                      >
                        <Feather
                          name="check-circle"
                          size={12}
                          color={colors.success}
                        />
                        <Text
                          style={[
                            styles.doneTagText,
                            { color: colors.success },
                          ]}
                        >
                          Completed
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text
                    style={[styles.dailyQuote, { color: colors.foreground }]}
                  >
                    "{dailyPuzzle.quote.length > 90
                      ? dailyPuzzle.quote.slice(0, 88) + "…"
                      : dailyPuzzle.quote}"
                  </Text>
                  <Text
                    style={[styles.dailyAttr, { color: colors.mutedForeground }]}
                  >
                    — {dailyPuzzle.attribution}
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: "/puzzle/[id]",
                        params: { id: dailyPuzzle.id },
                      })
                    }
                    style={[
                      styles.playBtn,
                      {
                        backgroundColor: isDailyDone
                          ? colors.secondary
                          : colors.primary,
                      },
                    ]}
                    activeOpacity={0.85}
                  >
                    <Feather
                      name={isDailyDone ? "refresh-cw" : "play"}
                      size={18}
                      color={isDailyDone ? colors.foreground : "#FFF"}
                    />
                    <Text
                      style={[
                        styles.playBtnText,
                        { color: isDailyDone ? colors.foreground : "#FFF" },
                      ]}
                    >
                      {isDailyDone ? "Play Again" : "Start Puzzle"}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Countdown */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
                NEXT PUZZLE IN
              </Text>
              <CountdownTimer />
            </View>

            {/* Recent */}
            {recentDailies.length > 0 && (
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  RECENT COMPLETIONS
                </Text>
                {recentDailies.map((c, i) => {
                  const puzzle = PUZZLES.find((p) => p.id === c.puzzleId);
                  if (!puzzle) return null;
                  const mins = Math.floor(c.durationSeconds / 60);
                  const secs = c.durationSeconds % 60;
                  return (
                    <View
                      key={i}
                      style={[
                        styles.historyItem,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.historyIcon,
                          { backgroundColor: colors.success + "22" },
                        ]}
                      >
                        <Feather name="check" size={14} color={colors.success} />
                      </View>
                      <View style={styles.historyInfo}>
                        <Text
                          style={[
                            styles.historyTheme,
                            { color: colors.foreground },
                          ]}
                        >
                          {puzzle.theme}
                        </Text>
                        <Text
                          style={[
                            styles.historyDate,
                            { color: colors.mutedForeground },
                          ]}
                        >
                          {new Date(c.completedAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.historyTime,
                          { color: colors.mutedForeground },
                        ]}
                      >
                        {mins > 0 ? `${mins}m ` : ""}
                        {secs}s
                      </Text>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  date: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  unlockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 4,
  },
  unlockedText: { fontSize: 12, fontFamily: "Inter_700Bold" },

  // Locked view
  lockedContainer: { alignItems: "center", paddingHorizontal: 24, gap: 20 },
  lockCircleOuter: {
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  lockCircleInner: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  lockTitle: { fontSize: 22, fontFamily: "Inter_700Bold", textAlign: "center" },
  lockSubtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  lockProgressCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 10,
  },
  lockProgressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lockProgressLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  lockProgressValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  lockBarBg: { height: 8, borderRadius: 4 },
  lockBarFill: { height: 8, borderRadius: 4 },
  lockProgressHint: { fontSize: 12, fontFamily: "Inter_400Regular" },
  tipsCard: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  tipsTitle: { fontSize: 14, fontFamily: "Inter_700Bold" },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  tipIcon: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },

  // Unlocked view
  streakCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  streakTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakMain: { color: "#FFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  streakSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  streakIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  dayItem: { alignItems: "center", gap: 6 },
  dayLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },
  dayDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
  },
  dailyCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 18,
    gap: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  dailyTop: { flexDirection: "row", gap: 8, alignItems: "center" },
  themeTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  themeTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  doneTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  doneTagText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  dailyQuote: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
    fontStyle: "italic",
  },
  dailyAttr: { fontSize: 13, fontFamily: "Inter_500Medium" },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 14,
  },
  playBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingHorizontal: 20,
  },
  timerBlock: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  timerNum: { fontSize: 28, fontFamily: "Inter_700Bold" },
  timerLabel: {
    fontSize: 10,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
  },
  timerColon: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 12 },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 16,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  historyIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  historyInfo: { flex: 1 },
  historyTheme: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  historyDate: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  historyTime: { fontSize: 13, fontFamily: "Inter_500Medium" },
});
