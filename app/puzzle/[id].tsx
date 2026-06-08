import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CluesList from "@/components/CluesList";
import CongratsModal from "@/components/CongratsModal";
import HintsBar, { HintType } from "@/components/HintsBar";
import LetterKeyboard from "@/components/LetterKeyboard";
import OutOfCoinsSheet from "@/components/OutOfCoinsSheet";
import QuoteDisplay from "@/components/QuoteDisplay";
import RewardedAdModal from "@/components/RewardedAdModal";
import { PUZZLES } from "@/constants/puzzleData";
import { AD_CONFIG } from "@/constants/adConfig";
import { useAdMob } from "@/hooks/useAdMob";
import { useRemoteConfig } from "@/hooks/useRemoteConfig";
import {
  HINT_COST_LETTER,
  HINT_COST_REMOVE_WRONG,
  HINT_COST_WORD,
  useGame,
} from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import {
  applyHintRevealLetter,
  applyHintRevealWord,
  getCompletionStats,
  processPuzzle,
  removeWrongLetters,
} from "@/utils/puzzleEngine";

const IDLE_NUDGE_MS = 45_000;

export default function PuzzleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const router = useRouter();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const {
    coins,
    spendCoins,
    addCoins,
    completePuzzle,
    isPuzzleCompleted,
    unlockAchievement,
    settings,
    completedPuzzles,
    incrementHintsUsed,
    shouldShowInterstitial,
    resetInterstitialCounter,
  } = useGame();
  const { showRewarded, showInterstitial } = useAdMob();
  const { interstitialAdEnabled, interstitialFrequency } = useRemoteConfig();

  const raw = useMemo(() => PUZZLES.find((p) => p.id === id), [id]);
  const puzzle = useMemo(() => (raw ? processPuzzle(raw) : null), [raw]);

  const [numToGuess, setNumToGuess] = useState<Record<number, string>>({});
  const [selectedNum, setSelectedNum] = useState<number | null>(null);
  const [selectedContext, setSelectedContext] = useState<'quote' | 'clue' | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);
  const [showOutOfCoins, setShowOutOfCoins] = useState(false);
  const [pendingHintType, setPendingHintType] = useState<HintType | null>(null);
  const [pendingHintCost, setPendingHintCost] = useState(0);
  const [idleNudge, setIdleNudge] = useState(false);
  const [doubleRewardPending, setDoubleRewardPending] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const startTime = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isComplete) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isComplete]);

  // ─── Idle nudge ───────────────────────────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    setIdleNudge(false);
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!isComplete) {
      idleTimerRef.current = setTimeout(() => setIdleNudge(true), IDLE_NUDGE_MS);
    }
  }, [isComplete]);

  useEffect(() => {
    resetIdleTimer();
    return () => { if (idleTimerRef.current) clearTimeout(idleTimerRef.current); };
  }, []);

  useEffect(() => {
    if (puzzle) {
      navigation.setOptions({ title: puzzle.theme, headerBackTitle: "Back" });
    }
  }, [puzzle, navigation]);

  const stats = useMemo(() => {
    if (!puzzle) return null;
    return getCompletionStats(puzzle, numToGuess);
  }, [puzzle, numToGuess]);

  // ─── Puzzle complete ──────────────────────────────────────────────────────
  useEffect(() => {
    if (stats?.isComplete && !isComplete && puzzle) {
      setIsComplete(true);
      const duration = Math.floor((Date.now() - startTime.current) / 1000);

      const coinReward =
        puzzle.difficulty === "easy"   ? 15
        : puzzle.difficulty === "medium" ? 25
        : puzzle.difficulty === "hard"   ? 40
        : 60;
      setEarnedCoins(coinReward);

      if (settings.hapticsEnabled && Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      completePuzzle({
        puzzleId: puzzle.id,
        durationSeconds: duration,
        hintsUsed,
        difficulty: puzzle.difficulty,
      });
      if (!isPuzzleCompleted(puzzle.id)) {
        if (completedPuzzles.length === 0) unlockAchievement("first_puzzle");
        if (completedPuzzles.length >= 4)  unlockAchievement("five_puzzles");
        if (completedPuzzles.length >= 9)  unlockAchievement("ten_puzzles");
        if (hintsUsed === 0)               unlockAchievement("no_hints");
        if (duration < 300)                unlockAchievement("speed_5min");
      }

      // Delay congrats so haptics/state can settle
      setTimeout(() => setShowCongrats(true), 200);
    }
  }, [stats?.isComplete]);

  // ─── Input ────────────────────────────────────────────────────────────────
  const handleSelectNum = useCallback((num: number, context: 'quote' | 'clue') => {
    setSelectedNum(num);
    setSelectedContext(context);
    resetIdleTimer();
  }, [resetIdleTimer]);

  const handleLetter = useCallback(
    (letter: string) => {
      if (selectedNum === null || isComplete) return;
      if (settings.hapticsEnabled && Platform.OS !== "web") Haptics.selectionAsync();
      setNumToGuess((prev) => ({ ...prev, [selectedNum]: letter }));
      resetIdleTimer();

      // Auto-advance to next empty box within the same context (quote or clue)
      if (puzzle && selectedContext) {
        if (selectedContext === 'clue') {
          // Find the clue that contains the selected number
          const currentClue = puzzle.clues.find(c => c.encoded.includes(selectedNum));
          if (currentClue) {
            // Advance within the same clue word
            const currentIndex = currentClue.encoded.indexOf(selectedNum);
            for (let i = currentIndex + 1; i < currentClue.encoded.length; i++) {
              const nextNum = currentClue.encoded[i];
              if (!numToGuess[nextNum]) {
                setSelectedNum(nextNum);
                return;
              }
            }
            // If all boxes in this clue are filled, stay on current
          }
        } else if (selectedContext === 'quote') {
          // Advance within quote
          const allNums = puzzle.quoteSegments.filter(s => s.num !== null).map(s => s.num as number);
          const currentIndex = allNums.indexOf(selectedNum);
          if (currentIndex !== -1) {
            for (let i = currentIndex + 1; i < allNums.length; i++) {
              const nextNum = allNums[i];
              if (!numToGuess[nextNum]) {
                setSelectedNum(nextNum);
                return;
              }
            }
          }
        }
      }
    },
    [selectedNum, isComplete, settings.hapticsEnabled, resetIdleTimer, puzzle, selectedContext, numToGuess]
  );

  const handleDelete = useCallback(() => {
    if (selectedNum === null) return;
    setNumToGuess((prev) => {
      const next = { ...prev };
      delete next[selectedNum];
      return next;
    });
    resetIdleTimer();
  }, [selectedNum, resetIdleTimer]);

  // ─── Hint actions ─────────────────────────────────────────────────────────
  const costFor = (type: HintType): number =>
    type === "letter" ? HINT_COST_LETTER
    : type === "remove" ? HINT_COST_REMOVE_WRONG
    : HINT_COST_WORD;

  const applyHint = useCallback(
    (type: HintType) => {
      if (!puzzle) return;
      if (type === "letter") {
        if (selectedNum === null) {
          Alert.alert("Select a tile", "Tap a tile in the puzzle grid first.");
          return;
        }
        setNumToGuess((prev) => applyHintRevealLetter(prev, puzzle, selectedNum));
      } else if (type === "remove") {
        setNumToGuess((prev) => removeWrongLetters(prev, puzzle));
      } else {
        // Find first clue that's not completely solved
        const firstUnsolved = puzzle.clues.find((c) => {
          return c.encoded.some((num, i) => {
            const correctLetter = c.word[i];
            return numToGuess[num] !== correctLetter;
          });
        });
        if (firstUnsolved) {
          setNumToGuess((prev) => applyHintRevealWord(prev, puzzle, firstUnsolved.label));
        }
      }
      setHintsUsed((h) => h + 1);
      incrementHintsUsed();
      resetIdleTimer();
    },
    [puzzle, selectedNum, numToGuess, incrementHintsUsed, resetIdleTimer]
  );

  const handleUseHint = useCallback(
    (type: HintType) => {
      const cost = costFor(type);
      if (spendCoins(cost)) {
        applyHint(type);
      } else {
        setPendingHintType(type);
        setPendingHintCost(cost);
        setShowOutOfCoins(true);
      }
    },
    [spendCoins, applyHint]
  );

  // After ad: +25 coins, auto-apply pending hint
  const handleAdReward = useCallback(() => {
    if (doubleRewardPending) {
      addCoins(earnedCoins);
      setDoubleRewardPending(false);
      return;
    }
    addCoins(AD_CONFIG.REWARDED_AD_COINS);
    if (pendingHintType) {
      const type = pendingHintType;
      setPendingHintType(null);
      const cost = costFor(type);
      setTimeout(() => {
        if (spendCoins(cost)) applyHint(type);
      }, 300);
    }
  }, [addCoins, earnedCoins, doubleRewardPending, pendingHintType, spendCoins, applyHint]);

  // Launch real rewarded ad
  const handleWatchRewardedAd = useCallback(() => {
    setShowOutOfCoins(false);
    setPendingHintType(null);
    showRewarded(() => {
      addCoins(AD_CONFIG.REWARDED_AD_COINS);
    });
  }, [showRewarded, addCoins]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const timeStr = `${mins}:${String(secs).padStart(2, "0")}`;

  if (!puzzle || !raw) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.foreground }]}>Puzzle not found</Text>
      </View>
    );
  }

  const percentage = stats?.percentage ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.topLeft}>
          <Text style={[styles.topTheme, { color: colors.foreground }]}>{puzzle.theme}</Text>
          <Text style={[styles.topAttribution, { color: colors.mutedForeground }]}>— {puzzle.attribution}</Text>
        </View>
        <View style={styles.topRight}>
          <View style={[styles.timerBadge, { backgroundColor: colors.secondary }]}>
            <Feather name="clock" size={12} color={colors.mutedForeground} />
            <Text style={[styles.timerText, { color: colors.mutedForeground }]}>{timeStr}</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/shop")}
            style={[styles.coinBadge, { backgroundColor: colors.accent + "22", borderColor: colors.accent }]}
            activeOpacity={0.7}
          >
            <Feather name="award" size={14} color={colors.accent} />
            <Text style={[styles.coinBadgeText, { color: colors.accent }]}>{coins}</Text>
            <Feather name="plus" size={14} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View style={[styles.progressFill, { backgroundColor: isComplete ? colors.success : colors.primary, width: `${percentage}%` as any }]} />
      </View>

      {/* Near-miss motivator */}
      {percentage >= 70 && !isComplete && (
        <View style={[styles.nearMissBanner, { backgroundColor: colors.primary + "12" }]}>
          <Text style={[styles.nearMissText, { color: colors.primary }]}>
            {percentage >= 90
              ? `🔥 Almost there! ${Math.round(percentage)}% complete`
              : `⚡ You're ${Math.round(percentage)}% done — keep going!`}
          </Text>
        </View>
      )}

      {/* Quote */}
      <View style={[styles.quoteSection, { backgroundColor: colors.secondary, borderBottomColor: colors.border }]}>
        <Text style={[styles.quoteSectionLabel, { color: colors.mutedForeground }]}>QUOTE</Text>
        <QuoteDisplay puzzle={puzzle} numToGuess={numToGuess} selectedNum={selectedNum} onSelectNum={handleSelectNum} />
      </View>

      {/* Clues */}
      <ScrollView style={styles.cluesScroll} contentContainerStyle={styles.cluesContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <CluesList puzzle={puzzle} numToGuess={numToGuess} selectedNum={selectedNum} onSelectNum={handleSelectNum} />
        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Hints bar */}
      <HintsBar coins={coins} onUseHint={handleUseHint} idleNudge={idleNudge} />

      {/* Keyboard */}
      <View style={styles.keyboardContainer}>
        <LetterKeyboard onLetter={handleLetter} onDelete={handleDelete} selectedNum={selectedNum} numToGuess={numToGuess} />
      </View>

      {/* Out of coins sheet */}
      <OutOfCoinsSheet
        visible={showOutOfCoins}
        onClose={() => setShowOutOfCoins(false)}
        onWatchAd={handleWatchRewardedAd}
        hintCost={pendingHintCost}
        currentCoins={coins}
      />

      {/* Rewarded ad */}
      <RewardedAdModal
        visible={showAdModal}
        onClose={() => { setShowAdModal(false); setDoubleRewardPending(false); }}
        onReward={handleAdReward}
      />

      {/* Congrats */}
      <CongratsModal
        visible={showCongrats}
        onClose={() => {
          setShowCongrats(false);

          const navigate = () => {
            const completedIds = new Set(completedPuzzles.map((c) => c.puzzleId));
            completedIds.add(puzzle.id);
            const nextPuzzle = PUZZLES.find((p) => !completedIds.has(p.id));
            if (nextPuzzle) {
              router.replace({ pathname: "/puzzle/[id]", params: { id: nextPuzzle.id } });
            } else {
              router.back();
            }
          };

          // Show interstitial if enabled via Remote Config and frequency threshold met
          if (interstitialAdEnabled && shouldShowInterstitial(interstitialFrequency)) {
            resetInterstitialCounter();
            showInterstitial(navigate);
          } else {
            navigate();
          }
        }}
        quote={puzzle.quote}
        attribution={puzzle.attribution}
        durationSeconds={elapsed}
        hintsUsed={hintsUsed}
        coinsEarned={earnedCoins}
        onDoubleReward={() => {
          setDoubleRewardPending(true);
          setShowCongrats(false);
          setShowAdModal(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  errorText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  topLeft: { flex: 1, gap: 2 },
  topTheme: { fontSize: 14, fontFamily: "Inter_700Bold" },
  topAttribution: { fontSize: 11, fontFamily: "Inter_400Regular" },
  topRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  timerBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  timerText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  coinBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  coinBadgeText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  progressBg: { height: 3 },
  progressFill: { height: 3 },
  nearMissBanner: { paddingHorizontal: 16, paddingVertical: 6 },
  nearMissText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  quoteSection: { paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, gap: 4 },
  quoteSectionLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, paddingHorizontal: 16 },
  cluesScroll: { flex: 1 },
  cluesContent: { paddingVertical: 12, gap: 8 },
  keyboardContainer: { minHeight: 200 },
});
