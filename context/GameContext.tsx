import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  logAchievementUnlocked,
  logDailyRewardClaimed,
  logSpinWheel,
  logMissionCompleted,
  logStreakUpdated,
  setUserProperties,
} from "@/utils/analytics";

export interface CompletedPuzzle {
  puzzleId: string;
  completedAt: number;
  durationSeconds: number;
  hintsUsed: number;
  difficulty: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: number;
}

export interface GameSettings {
  darkMode: boolean | null;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface DailyStreak {
  current: number;
  best: number;
  lastPlayedDate: string;
}

// ─── Hint coin costs ─────────────────────────────────────────────────────────
export const HINT_COST_LETTER = 10;
export const HINT_COST_REMOVE_WRONG = 20;
export const HINT_COST_WORD = 30;

// ─── Daily reward scales with streak ─────────────────────────────────────────
export function getDailyRewardCoins(streakDay: number): number {
  if (streakDay >= 7) return 100;
  if (streakDay >= 5) return 60;
  if (streakDay >= 3) return 40;
  if (streakDay >= 2) return 30;
  return 20;
}

// ─── Daily missions ───────────────────────────────────────────────────────────
export interface DailyMission {
  id: string;
  label: string;
  target: number;
  progress: number;
  reward: number;
  claimed: boolean;
}

export function buildDailyMissions(): DailyMission[] {
  return [
    { id: "solve_2",       label: "Solve 2 puzzles",          target: 2, progress: 0, reward: 30,  claimed: false },
    { id: "use_3_hints",   label: "Use 3 hints",              target: 3, progress: 0, reward: 25,  claimed: false },
    { id: "no_hint_solve", label: "Solve a puzzle hint-free", target: 1, progress: 0, reward: 40,  claimed: false },
  ];
}

// ─── Spin wheel rewards ───────────────────────────────────────────────────────
export const SPIN_REWARDS = [10, 20, 30, 50, 75, 100, 150, 20];

// ─── State ────────────────────────────────────────────────────────────────────
interface GameState {
  coins: number;
  xp: number;
  completedPuzzles: CompletedPuzzle[];
  achievements: Achievement[];
  streak: DailyStreak;
  settings: GameSettings;
  totalWordsFound: number;
  hintsTotal: number;
  lastRewardDate: string;
  dailyMissions: DailyMission[];
  dailyMissionsDate: string;
  lastSpinDate: string;
  removeAds: boolean;
  isPremium: boolean;
  puzzlesSinceInterstitial: number;
}

interface GameContextValue extends GameState {
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => boolean;
  addXP: (amount: number) => void;
  completePuzzle: (data: Omit<CompletedPuzzle, "completedAt">) => void;
  unlockAchievement: (id: string) => void;
  updateSettings: (settings: Partial<GameSettings>) => void;
  incrementWordsFound: (count: number) => void;
  incrementHintsUsed: () => void;
  isPuzzleCompleted: (puzzleId: string) => boolean;
  getLevel: () => number;
  getXPProgress: () => { current: number; required: number };
  claimDailyReward: () => void;
  hasPendingReward: () => boolean;
  canSpin: () => boolean;
  doSpin: () => number;
  getDailyMissions: () => DailyMission[];
  claimMissionReward: (missionId: string) => void;
  purchaseRemoveAds: () => void;
  purchasePremium: () => void;
  purchaseCoinPack: (coins: number) => void;
  shouldShowInterstitial: (frequency?: number) => boolean;
  resetInterstitialCounter: () => void;
}

const ACHIEVEMENTS_DEFINITIONS: Achievement[] = [
  { id: "first_puzzle",   title: "First Steps",       description: "Complete your first puzzle",       icon: "star"         },
  { id: "five_puzzles",   title: "Getting Warm",       description: "Complete 5 puzzles",               icon: "flame"        },
  { id: "ten_puzzles",    title: "Puzzle Master",      description: "Complete 10 puzzles",              icon: "trophy"       },
  { id: "twenty_puzzles", title: "On a Roll",          description: "Complete 20 puzzles",              icon: "zap"          },
  { id: "fifty_puzzles",  title: "Halfway There",      description: "Complete 50 puzzles",              icon: "award"        },
  { id: "all_puzzles",    title: "The Completionist",  description: "Complete all 1000 puzzles",        icon: "check-circle" },
  { id: "no_hints",       title: "Pure Mind",          description: "Complete a puzzle without hints",  icon: "brain"        },
  { id: "streak_3",       title: "On Fire",            description: "Maintain a 3-day streak",          icon: "fire"         },
  { id: "streak_7",       title: "Week Warrior",       description: "Maintain a 7-day streak",          icon: "shield"       },
  { id: "speed_5min",     title: "Speed Solver",       description: "Complete a puzzle in under 5 min", icon: "zap"          },
  { id: "daily_unlock",   title: "Daily Devotee",      description: "Reach level 5 to unlock daily",    icon: "calendar"     },
  { id: "coins_500",      title: "Wealthy Words",      description: "Accumulate 500 coins",             icon: "coins"        },
];

const INITIAL_STATE: GameState = {
  coins: 150,
  xp: 0,
  completedPuzzles: [],
  achievements: ACHIEVEMENTS_DEFINITIONS,
  streak: { current: 0, best: 0, lastPlayedDate: "" },
  settings: { darkMode: null, soundEnabled: true, hapticsEnabled: true },
  totalWordsFound: 0,
  hintsTotal: 0,
  lastRewardDate: "",
  dailyMissions: buildDailyMissions(),
  dailyMissionsDate: "",
  lastSpinDate: "",
  removeAds: false,
  isPremium: false,
  puzzlesSinceInterstitial: 0,
};

const STORAGE_KEY = "crostic_game_state_v3";

const GameContext = createContext<GameContextValue | null>(null);

function getXPForLevel(level: number): number {
  return level * 10;
}

function getLevelFromXP(xp: number): number {
  let level = 1;
  let accumulated = 0;
  while (true) {
    const needed = getXPForLevel(level);
    if (xp < accumulated + needed) break;
    accumulated += needed;
    level++;
    if (level > 999) break;
  }
  return level;
}

function getAccumulatedXPForLevel(level: number): number {
  let total = 0;
  for (let l = 1; l < level; l++) total += getXPForLevel(l);
  return total;
}

function refreshMissionsIfNeeded(
  missions: DailyMission[],
  missionsDate: string,
  today: string
): { missions: DailyMission[]; date: string } {
  if (missionsDate === today) return { missions, date: missionsDate };
  return { missions: buildDailyMissions(), date: today };
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(INITIAL_STATE);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const saved = JSON.parse(raw) as Partial<GameState>;
          setState((prev) => ({
            ...prev,
            ...saved,
            achievements: ACHIEVEMENTS_DEFINITIONS.map((def) => ({
              ...def,
              unlockedAt: saved.achievements?.find((a) => a.id === def.id)?.unlockedAt,
            })),
            dailyMissions: saved.dailyMissions ?? buildDailyMissions(),
            dailyMissionsDate: saved.dailyMissionsDate ?? "",
            lastSpinDate: saved.lastSpinDate ?? "",
            removeAds: saved.removeAds ?? false,
            isPremium: saved.isPremium ?? false,
            puzzlesSinceInterstitial: saved.puzzlesSinceInterstitial ?? 0,
          }));
        } catch {
          // ignore corrupt saves
        }
      }
      setLoaded(true);
    });
  }, []);

  const save = useCallback((newState: GameState) => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  }, []);

  const update = useCallback(
    (updater: (prev: GameState) => GameState) => {
      setState((prev) => {
        const next = updater(prev);
        save(next);
        return next;
      });
    },
    [save]
  );

  const addCoins = useCallback(
    (amount: number) =>
      update((prev) => ({ ...prev, coins: prev.coins + amount })),
    [update]
  );

  const spendCoins = useCallback(
    (amount: number): boolean => {
      let success = false;
      update((prev) => {
        if (prev.coins >= amount) {
          success = true;
          return { ...prev, coins: prev.coins - amount };
        }
        return prev;
      });
      return success;
    },
    [update]
  );

  const addXP = useCallback(
    (amount: number) =>
      update((prev) => ({ ...prev, xp: prev.xp + amount })),
    [update]
  );

  const completePuzzle = useCallback(
    (data: Omit<CompletedPuzzle, "completedAt">) => {
      const today = new Date().toDateString();
      update((prev) => {
        const alreadyDone = prev.completedPuzzles.some(
          (c) => c.puzzleId === data.puzzleId
        );
        const newPuzzle: CompletedPuzzle = { ...data, completedAt: Date.now() };

        let newStreak = { ...prev.streak };
        if (!alreadyDone && newStreak.lastPlayedDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          if (newStreak.lastPlayedDate === yesterday.toDateString()) {
            newStreak.current += 1;
          } else {
            newStreak.current = 1;
          }
          newStreak.lastPlayedDate = today;
          newStreak.best = Math.max(newStreak.best, newStreak.current);
        }

        const xpEarned = alreadyDone ? 0
          : data.difficulty === "easy"   ? 100
          : data.difficulty === "medium" ? 200
          : data.difficulty === "hard"   ? 350
          : 500;

        const coinsEarned = alreadyDone ? 0
          : data.difficulty === "easy"   ? 15
          : data.difficulty === "medium" ? 25
          : data.difficulty === "hard"   ? 40
          : 60;

        const { missions: refreshed, date: missDate } = refreshMissionsIfNeeded(
          prev.dailyMissions,
          prev.dailyMissionsDate,
          today
        );

        const updatedMissions = refreshed.map((m) => {
          if (m.id === "solve_2" && !alreadyDone)
            return { ...m, progress: Math.min(m.target, m.progress + 1) };
          if (m.id === "no_hint_solve" && !alreadyDone && data.hintsUsed === 0)
            return { ...m, progress: Math.min(m.target, m.progress + 1) };
          return m;
        });

        const nextCompletedCount = alreadyDone
          ? prev.completedPuzzles.length
          : prev.completedPuzzles.length + 1;

        if (!alreadyDone && newStreak.current !== prev.streak.current) {
          logStreakUpdated({ current_streak: newStreak.current, best_streak: newStreak.best });
        }

        const nextLevel = getLevelFromXP(prev.xp + xpEarned);
        setUserProperties({
          level: nextLevel,
          total_puzzles_completed: nextCompletedCount,
          has_remove_ads: prev.removeAds,
          is_premium: prev.isPremium,
        });

        return {
          ...prev,
          completedPuzzles: alreadyDone
            ? prev.completedPuzzles
            : [...prev.completedPuzzles, newPuzzle],
          streak: newStreak,
          coins: prev.coins + coinsEarned,
          xp: prev.xp + xpEarned,
          dailyMissions: updatedMissions,
          dailyMissionsDate: missDate,
          puzzlesSinceInterstitial: prev.puzzlesSinceInterstitial + 1,
        };
      });
    },
    [update]
  );

  const unlockAchievement = useCallback(
    (id: string) => {
      update((prev) => {
        const target = prev.achievements.find((a) => a.id === id && !a.unlockedAt);
        if (target) {
          logAchievementUnlocked({ achievement_id: id, achievement_title: target.title });
        }
        return {
          ...prev,
          achievements: prev.achievements.map((a) =>
            a.id === id && !a.unlockedAt ? { ...a, unlockedAt: Date.now() } : a
          ),
        };
      });
    },
    [update]
  );

  const updateSettings = useCallback(
    (settings: Partial<GameSettings>) =>
      update((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...settings },
      })),
    [update]
  );

  const incrementWordsFound = useCallback(
    (count: number) =>
      update((prev) => ({ ...prev, totalWordsFound: prev.totalWordsFound + count })),
    [update]
  );

  const incrementHintsUsed = useCallback(() => {
    const today = new Date().toDateString();
    update((prev) => {
      const { missions: refreshed, date: missDate } = refreshMissionsIfNeeded(
        prev.dailyMissions,
        prev.dailyMissionsDate,
        today
      );
      const updatedMissions = refreshed.map((m) =>
        m.id === "use_3_hints"
          ? { ...m, progress: Math.min(m.target, m.progress + 1) }
          : m
      );
      return {
        ...prev,
        hintsTotal: prev.hintsTotal + 1,
        dailyMissions: updatedMissions,
        dailyMissionsDate: missDate,
      };
    });
  }, [update]);

  const isPuzzleCompleted = useCallback(
    (puzzleId: string) =>
      state.completedPuzzles.some((c) => c.puzzleId === puzzleId),
    [state.completedPuzzles]
  );

  const getLevel = useCallback(() => getLevelFromXP(state.xp), [state.xp]);

  const getXPProgress = useCallback(() => {
    const level = getLevelFromXP(state.xp);
    const accumulated = getAccumulatedXPForLevel(level);
    return { current: state.xp - accumulated, required: getXPForLevel(level) };
  }, [state.xp]);

  const hasPendingReward = useCallback(() => {
    return state.lastRewardDate !== new Date().toDateString();
  }, [state.lastRewardDate]);

  const claimDailyReward = useCallback(() => {
    const today = new Date().toDateString();
    update((prev) => {
      const coinsEarned = getDailyRewardCoins(prev.streak.current);
      logDailyRewardClaimed({ streak_day: prev.streak.current, coins_earned: coinsEarned });
      return {
        ...prev,
        coins: prev.coins + coinsEarned,
        lastRewardDate: today,
      };
    });
  }, [update]);

  // ─── Spin wheel ──────────────────────────────────────────────────────────────
  const canSpin = useCallback((): boolean => {
    return state.lastSpinDate !== new Date().toDateString();
  }, [state.lastSpinDate]);

  const doSpin = useCallback((): number => {
    const today = new Date().toDateString();
    const reward = SPIN_REWARDS[Math.floor(Math.random() * SPIN_REWARDS.length)];
    update((prev) => {
      logSpinWheel({ coins_won: reward, streak_day: prev.streak.current });
      return { ...prev, coins: prev.coins + reward, lastSpinDate: today };
    });
    return reward;
  }, [update]);

  // ─── Daily missions ──────────────────────────────────────────────────────────
  const getDailyMissions = useCallback((): DailyMission[] => {
    const today = new Date().toDateString();
    if (state.dailyMissionsDate !== today) return buildDailyMissions();
    return state.dailyMissions;
  }, [state.dailyMissions, state.dailyMissionsDate]);

  const claimMissionReward = useCallback(
    (missionId: string) => {
      const today = new Date().toDateString();
      update((prev) => {
        const { missions: refreshed, date: missDate } = refreshMissionsIfNeeded(
          prev.dailyMissions, prev.dailyMissionsDate, today
        );
        let coinsToAdd = 0;
        const updated = refreshed.map((m) => {
          if (m.id === missionId && m.progress >= m.target && !m.claimed) {
            coinsToAdd = m.reward;
            logMissionCompleted({ mission_id: m.id, reward_coins: m.reward });
            return { ...m, claimed: true };
          }
          return m;
        });
        return { ...prev, dailyMissions: updated, dailyMissionsDate: missDate, coins: prev.coins + coinsToAdd };
      });
    },
    [update]
  );

  // ─── Monetization ─────────────────────────────────────────────────────────────
  const purchaseRemoveAds = useCallback(
    () => update((prev) => ({ ...prev, removeAds: true })),
    [update]
  );
  const purchasePremium = useCallback(
    () => update((prev) => ({ ...prev, isPremium: true, removeAds: true })),
    [update]
  );
  const purchaseCoinPack = useCallback(
    (coins: number) => update((prev) => ({ ...prev, coins: prev.coins + coins })),
    [update]
  );

  // ─── Interstitial ─────────────────────────────────────────────────────────────
  const shouldShowInterstitial = useCallback((frequency = 3): boolean => {
    return !state.removeAds && state.puzzlesSinceInterstitial >= frequency;
  }, [state.removeAds, state.puzzlesSinceInterstitial]);

  const resetInterstitialCounter = useCallback(
    () => update((prev) => ({ ...prev, puzzlesSinceInterstitial: 0 })),
    [update]
  );

  if (!loaded) return null;

  return (
    <GameContext.Provider
      value={{
        ...state,
        addCoins,
        spendCoins,
        addXP,
        completePuzzle,
        unlockAchievement,
        updateSettings,
        incrementWordsFound,
        incrementHintsUsed,
        isPuzzleCompleted,
        getLevel,
        getXPProgress,
        claimDailyReward,
        hasPendingReward,
        canSpin,
        doSpin,
        getDailyMissions,
        claimMissionReward,
        purchaseRemoveAds,
        purchasePremium,
        purchaseCoinPack,
        shouldShowInterstitial,
        resetInterstitialCounter,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
