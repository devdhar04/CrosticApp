import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  CHAPTER_SIZE,
  PUZZLES,
  PuzzleRaw,
  getChapters,
  getUnlockedPuzzleIds,
} from "@/constants/puzzleData";
import DailyMissionsCard from "@/components/DailyMissionsCard";
import DailyRewardModal from "@/components/DailyRewardModal";
// import SpinWheelModal from "@/components/SpinWheelModal";
import { getDailyRewardCoins, useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "#52B788",
  medium: "#E8A838",
  hard: "#E76F51",
  expert: "#9B5DE5",
};

function PuzzleRow({
  puzzle,
  index,
  isCompleted,
  isUnlocked,
  isCurrent,
  onPress,
}: {
  puzzle: PuzzleRaw;
  index: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const diffColor = DIFFICULTY_COLORS[puzzle.difficulty] ?? colors.accent;

  return (
    <TouchableOpacity
      onPress={isUnlocked ? onPress : undefined}
      activeOpacity={isUnlocked ? 0.75 : 1}
      style={[
        styles.puzzleRow,
        {
          backgroundColor: isCurrent
            ? colors.primary + "12"
            : colors.card,
          borderColor: isCurrent
            ? colors.primary
            : isCompleted
            ? colors.success + "60"
            : colors.border,
          borderWidth: isCurrent ? 1.5 : 1,
          opacity: isUnlocked ? 1 : 0.45,
        },
      ]}
    >
      {/* Number badge */}
      <View
        style={[
          styles.numBadge,
          {
            backgroundColor: isCompleted
              ? colors.success
              : isCurrent
              ? colors.primary
              : isUnlocked
              ? colors.secondary
              : colors.muted,
          },
        ]}
      >
        {isCompleted ? (
          <Feather name="check" size={14} color="#FFF" />
        ) : !isUnlocked ? (
          <Feather name="lock" size={12} color={colors.mutedForeground} />
        ) : (
          <Text
            style={[
              styles.numText,
              { color: isCurrent ? "#FFF" : colors.mutedForeground },
            ]}
          >
            {index + 1}
          </Text>
        )}
      </View>

      {/* Info */}
      <View style={styles.puzzleInfo}>
        <View style={styles.puzzleMeta}>
          <View style={[styles.diffDot, { backgroundColor: diffColor }]} />
          <Text style={[styles.puzzleTheme, { color: colors.mutedForeground }]}>
            {puzzle.theme}
          </Text>
        </View>
        <Text
          style={[
            styles.puzzleQuote,
            {
              color: isUnlocked ? colors.foreground : colors.mutedForeground,
            },
          ]}
          numberOfLines={1}
        >
          {isUnlocked
            ? puzzle.quote.length > 50
              ? puzzle.quote.slice(0, 48) + "…"
              : puzzle.quote
            : "Complete previous puzzle to unlock"}
        </Text>
      </View>

      {/* Right arrow */}
      {isCurrent && isUnlocked && (
        <View style={[styles.currentArrow, { backgroundColor: colors.primary }]}>
          <Feather name="arrow-right" size={14} color="#FFF" />
        </View>
      )}
      {isCompleted && (
        <Feather name="check-circle" size={18} color={colors.success} />
      )}
      {!isCompleted && isUnlocked && !isCurrent && (
        <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
      )}
    </TouchableOpacity>
  );
}

function ChapterSection({
  chapterIndex,
  title,
  puzzles,
  completedIds,
  unlockedIds,
  currentPuzzleId,
  globalOffset,
}: {
  chapterIndex: number;
  title: string;
  puzzles: PuzzleRaw[];
  completedIds: Set<string>;
  unlockedIds: Set<string>;
  currentPuzzleId: string | null;
  globalOffset: number;
}) {
  const colors = useColors();
  const router = useRouter();
  const completedInChapter = puzzles.filter((p) => completedIds.has(p.id)).length;
  const isChapterComplete = completedInChapter === puzzles.length;
  const isChapterUnlocked = unlockedIds.has(puzzles[0].id);
  const [expanded, setExpanded] = useState(
    puzzles.some((p) => p.id === currentPuzzleId || (!completedIds.has(p.id) && unlockedIds.has(p.id)))
  );

  return (
    <View style={styles.chapter}>
      {/* Chapter header */}
      <TouchableOpacity
        onPress={() => isChapterUnlocked && setExpanded((e) => !e)}
        activeOpacity={isChapterUnlocked ? 0.75 : 1}
        style={[
          styles.chapterHeader,
          {
            backgroundColor: isChapterComplete
              ? colors.success + "15"
              : isChapterUnlocked
              ? colors.card
              : colors.secondary,
            borderColor: isChapterComplete
              ? colors.success + "50"
              : isChapterUnlocked
              ? colors.border
              : colors.border,
          },
        ]}
      >
        <View style={styles.chapterLeft}>
          <View
            style={[
              styles.chapterNumBadge,
              {
                backgroundColor: isChapterComplete
                  ? colors.success
                  : isChapterUnlocked
                  ? colors.primary
                  : colors.muted,
              },
            ]}
          >
            {isChapterComplete ? (
              <Feather name="check" size={14} color="#FFF" />
            ) : !isChapterUnlocked ? (
              <Feather name="lock" size={12} color={colors.mutedForeground} />
            ) : (
              <Text style={styles.chapterNumText}>{chapterIndex + 1}</Text>
            )}
          </View>
          <View>
            <Text
              style={[
                styles.chapterTitle,
                {
                  color: isChapterUnlocked
                    ? colors.foreground
                    : colors.mutedForeground,
                },
              ]}
            >
              {title}
            </Text>
            <Text style={[styles.chapterProgress, { color: colors.mutedForeground }]}>
              {isChapterUnlocked
                ? `${completedInChapter} / ${puzzles.length} complete`
                : `Locked — finish previous chapter`}
            </Text>
          </View>
        </View>
        <View style={styles.chapterRight}>
          {isChapterUnlocked && (
            <>
              {/* Mini progress dots */}
              <View style={styles.miniDots}>
                {puzzles.map((p) => (
                  <View
                    key={p.id}
                    style={[
                      styles.miniDot,
                      {
                        backgroundColor: completedIds.has(p.id)
                          ? colors.success
                          : unlockedIds.has(p.id)
                          ? colors.primary + "60"
                          : colors.muted,
                      },
                    ]}
                  />
                ))}
              </View>
              <Feather
                name={expanded ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.mutedForeground}
              />
            </>
          )}
        </View>
      </TouchableOpacity>

      {/* Expanded puzzle rows */}
      {expanded && isChapterUnlocked && (
        <View
          style={[
            styles.chapterBody,
            { borderColor: colors.border, backgroundColor: colors.background },
          ]}
        >
          {puzzles.map((puzzle, i) => (
            <PuzzleRow
              key={puzzle.id}
              puzzle={puzzle}
              index={globalOffset + i}
              isCompleted={completedIds.has(puzzle.id)}
              isUnlocked={unlockedIds.has(puzzle.id)}
              isCurrent={puzzle.id === currentPuzzleId}
              onPress={() =>
                router.push({ pathname: "/puzzle/[id]", params: { id: puzzle.id } })
              }
            />
          ))}
        </View>
      )}
    </View>
  );
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    coins,
    streak,
    completedPuzzles,
    getLevel,
    hasPendingReward,
    claimDailyReward,
    canSpin,
    doSpin,
    getDailyMissions,
    claimMissionReward,
  } = useGame();

  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showSpin, setShowSpin] = useState(false);

  // Auto-show daily reward on mount
  useEffect(() => {
    if (hasPendingReward()) {
      const timer = setTimeout(() => setShowDailyReward(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const dailyRewardCoins = getDailyRewardCoins(streak.current);
  const missions = getDailyMissions();

  const completedIds = useMemo(
    () => new Set(completedPuzzles.map((c) => c.puzzleId)),
    [completedPuzzles]
  );

  const unlockedIds = useMemo(
    () => getUnlockedPuzzleIds(completedIds),
    [completedIds]
  );

  const currentPuzzleId = useMemo(() => {
    for (const p of PUZZLES) {
      if (!completedIds.has(p.id) && unlockedIds.has(p.id)) return p.id;
    }
    return null;
  }, [completedIds, unlockedIds]);

  const chapters = useMemo(() => getChapters(), []);
  const level = getLevel();
  const totalCompleted = completedPuzzles.length;

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
        {/* ─── HEADER ─── */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.appName, { color: colors.foreground }]}>
              CROSTIC
            </Text>
            <Text style={[styles.appSubtitle, { color: colors.mutedForeground }]}>
              Word Puzzle
            </Text>
          </View>
          <View style={styles.headerBadges}>
            {/* Spin button - Hidden for now */}
            {/* <TouchableOpacity
              onPress={() => setShowSpin(true)}
              style={[
                styles.badge,
                {
                  backgroundColor: canSpin()
                    ? colors.primary + "20"
                    : colors.secondary,
                  borderColor: canSpin() ? colors.primary : colors.border,
                },
              ]}
              activeOpacity={0.82}
            >
              <Feather name="refresh-cw" size={13} color={canSpin() ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.badgeText, { color: canSpin() ? colors.primary : colors.mutedForeground }]}>
                {canSpin() ? "Spin!" : "Spun"}
              </Text>
            </TouchableOpacity> */}
            <View
              style={[
                styles.badge,
                { backgroundColor: colors.accent + "20", borderColor: colors.accent },
              ]}
            >
              <Feather name="dollar-sign" size={13} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent }]}>{coins}</Text>
            </View>
            {streak.current > 0 && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: colors.destructive + "20",
                    borderColor: colors.destructive,
                  },
                ]}
              >
                <Feather name="zap" size={13} color={colors.destructive} />
                <Text style={[styles.badgeText, { color: colors.destructive }]}>
                  {streak.current}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ─── LEVEL CARD ─── */}
        <View style={[styles.levelCard, { backgroundColor: colors.primary }]}>
          <View style={styles.levelRow}>
            <View>
              <Text style={styles.levelTitle}>Level {level}</Text>
              <Text style={styles.levelSub}>
                {totalCompleted} / {PUZZLES.length} puzzles completed
              </Text>
            </View>
          </View>

          {/* Puzzle progress */}
          <View style={styles.puzzleProgressRow}>
            <View style={styles.progressBarOuter}>
              <View
                style={[
                  styles.progressBarInner,
                  {
                    width: `${Math.round(
                      (totalCompleted / PUZZLES.length) * 100
                    )}%` as any,
                    backgroundColor: "#FFFFFF",
                  },
                ]}
              />
            </View>
            <Text style={styles.progressLabel}>
              {Math.round((totalCompleted / PUZZLES.length) * 100)}%
            </Text>
          </View>
        </View>

        {/* ─── DAILY MISSIONS ─── */}
        <DailyMissionsCard
          missions={missions}
          onClaim={claimMissionReward}
        />

        {/* ─── CURRENT PUZZLE BANNER ─── */}
        {currentPuzzleId && (() => {
          const current = PUZZLES.find((p) => p.id === currentPuzzleId)!;
          return (
            <TouchableOpacity
              onPress={() =>
                router.push({ pathname: "/puzzle/[id]", params: { id: current.id } })
              }
              style={[
                styles.currentBanner,
                { backgroundColor: colors.accent },
              ]}
              activeOpacity={0.88}
            >
              <View style={styles.currentBannerLeft}>
                <Text style={styles.currentBannerLabel}>CONTINUE PLAYING</Text>
                <Text style={styles.currentBannerTheme}>{current.theme}</Text>
                <Text style={styles.currentBannerQuote} numberOfLines={1}>
                  {current.quote.length > 45
                    ? current.quote.slice(0, 43) + "…"
                    : current.quote}
                </Text>
              </View>
              <View style={styles.currentBannerRight}>
                <Feather name="play-circle" size={44} color="rgba(0,0,0,0.4)" />
              </View>
            </TouchableOpacity>
          );
        })()}

        {/* ─── CHAPTERS ─── */}
        <View style={styles.chaptersSection}>
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
            YOUR JOURNEY
          </Text>
          {chapters.map((chapter, idx) => (
            <ChapterSection
              key={idx}
              chapterIndex={idx}
              title={chapter.title}
              puzzles={chapter.puzzles}
              completedIds={completedIds}
              unlockedIds={unlockedIds}
              currentPuzzleId={currentPuzzleId}
              globalOffset={idx * CHAPTER_SIZE}
            />
          ))}
        </View>
      </ScrollView>

      {/* Daily reward modal */}
      <DailyRewardModal
        visible={showDailyReward}
        coins={dailyRewardCoins}
        onClaim={() => {
          claimDailyReward();
          setShowDailyReward(false);
        }}
      />

      {/* Spin wheel modal - Hidden for now */}
      {/* <SpinWheelModal
        visible={showSpin}
        onClose={() => setShowSpin(false)}
        onSpin={doSpin}
      /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 16 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  appName: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: 3 },
  appSubtitle: { fontSize: 12, fontFamily: "Inter_400Regular", letterSpacing: 1 },
  headerBadges: { flexDirection: "row", gap: 8 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  badgeText: { fontSize: 14, fontFamily: "Inter_700Bold" },

  levelCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 18,
    gap: 10,
  },
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  levelTitle: { color: "#FFF", fontSize: 20, fontFamily: "Inter_700Bold" },
  levelSub: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  puzzleProgressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  progressBarOuter: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  progressBarInner: { height: 8, borderRadius: 4 },
  progressLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    minWidth: 30,
  },

  currentBanner: {
    marginHorizontal: 16,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  currentBannerLeft: { flex: 1, gap: 4 },
  currentBannerLabel: {
    color: "rgba(0,0,0,0.55)",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 1.5,
  },
  currentBannerTheme: {
    color: "#000",
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  currentBannerQuote: {
    color: "rgba(0,0,0,0.65)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  currentBannerRight: { paddingLeft: 12 },

  chaptersSection: { gap: 10, paddingHorizontal: 16 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
  },

  chapter: { gap: 0 },
  chapterHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  chapterLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  chapterNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chapterNumText: { color: "#FFF", fontSize: 14, fontFamily: "Inter_700Bold" },
  chapterTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  chapterProgress: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 2 },
  chapterRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  miniDots: { flexDirection: "row", gap: 3 },
  miniDot: { width: 5, height: 5, borderRadius: 2.5 },

  chapterBody: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    marginTop: -8,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 4,
  },

  puzzleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  numBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  numText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  puzzleInfo: { flex: 1, gap: 3 },
  puzzleMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  diffDot: { width: 6, height: 6, borderRadius: 3 },
  puzzleTheme: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 0.5 },
  puzzleQuote: { fontSize: 13, fontFamily: "Inter_400Regular" },
  currentArrow: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
});
