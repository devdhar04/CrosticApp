/**
 * Central analytics wrapper around Firebase Analytics.
 * All event logging goes through this file so we have one place
 * to add/change event names and parameters.
 *
 * Safe to call in Expo Go / web — all calls are no-ops when the
 * native module is unavailable.
 */

let analytics: any = null;

try {
  analytics = require('@react-native-firebase/analytics').default;
} catch {
  // Expo Go / web — analytics disabled
}

function log(event: string, params?: Record<string, any>) {
  if (!analytics) return;
  try {
    analytics().logEvent(event, params);
  } catch {
    // silently ignore
  }
}

// ─── Session ──────────────────────────────────────────────────────────────────

export function logAppOpen() {
  if (!analytics) return;
  try { analytics().logAppOpen(); } catch {}
}

// ─── Screen views ─────────────────────────────────────────────────────────────

export function logScreenView(screenName: string) {
  if (!analytics) return;
  try {
    analytics().logScreenView({ screen_name: screenName, screen_class: screenName });
  } catch {}
}

// ─── Puzzle ───────────────────────────────────────────────────────────────────

export function logPuzzleStart(params: {
  puzzle_id: string;
  difficulty: string;
}) {
  log('puzzle_start', params);
}

export function logPuzzleComplete(params: {
  puzzle_id: string;
  difficulty: string;
  duration_seconds: number;
  hints_used: number;
  coins_earned: number;
}) {
  log('puzzle_complete', params);
  // Also fire the standard Firebase "level_end" event
  if (!analytics) return;
  try {
    analytics().logLevelEnd({
      level: params.puzzle_id,
      success: true,
    });
  } catch {}
}

// ─── Hints ────────────────────────────────────────────────────────────────────

export function logHintUsed(params: {
  hint_type: 'letter' | 'word' | 'remove';
  coin_cost: number;
  puzzle_id: string;
}) {
  log('hint_used', params);
}

// ─── Ads ──────────────────────────────────────────────────────────────────────

export function logAdImpression(params: {
  ad_type: 'interstitial' | 'rewarded' | 'banner';
  placement: string;       // e.g. 'post_puzzle', 'hint_gate', 'shop'
}) {
  log('ad_impression', params);
  if (!analytics) return;
  try {
    analytics().logAdImpression({
      ad_format: params.ad_type,
      ad_unit_name: params.placement,
    });
  } catch {}
}

export function logAdDismissed(params: {
  ad_type: 'interstitial' | 'rewarded';
  placement: string;
}) {
  log('ad_dismissed', params);
}

export function logRewardedAdComplete(params: {
  placement: string;   // 'hint_gate' | 'double_reward' | 'shop'
  reward_coins: number;
}) {
  log('rewarded_ad_complete', params);
}

// ─── Purchases / IAP ──────────────────────────────────────────────────────────

export function logPurchaseInitiated(params: {
  product_id: string;
  coins: number;
  price: string;
}) {
  log('purchase_initiated', params);
}

export function logPurchaseSuccess(params: {
  product_id: string;
  coins: number;
  value: number;        // numeric price, e.g. 2.99
  currency: string;     // e.g. 'USD'
}) {
  log('purchase_success', params);
  if (!analytics) return;
  try {
    analytics().logPurchase({
      transaction_id: `${params.product_id}_${Date.now()}`,
      value: params.value,
      currency: params.currency,
      items: [{
        item_id: params.product_id,
        item_name: `${params.coins} Coins`,
        item_category: 'coin_pack',
        quantity: 1,
        price: params.value,
      }],
    });
  } catch {}
}

export function logRemoveAdsPurchase() {
  log('remove_ads_purchased');
  if (!analytics) return;
  try {
    analytics().logPurchase({
      transaction_id: `remove_ads_${Date.now()}`,
      value: 3.99,
      currency: 'USD',
      items: [{ item_id: 'remove_ads_onetime', item_name: 'Remove Ads', item_category: 'premium', quantity: 1, price: 3.99 }],
    });
  } catch {}
}

// ─── Engagement ───────────────────────────────────────────────────────────────

export function logDailyRewardClaimed(params: {
  streak_day: number;
  coins_earned: number;
}) {
  log('daily_reward_claimed', params);
}

export function logAchievementUnlocked(params: {
  achievement_id: string;
  achievement_title: string;
}) {
  if (!analytics) return;
  try {
    analytics().logUnlockAchievement({ achievement_id: params.achievement_id });
  } catch {}
  log('achievement_unlocked', params);
}

export function logSpinWheel(params: {
  coins_won: number;
  streak_day: number;
}) {
  log('spin_wheel_used', params);
}

export function logMissionCompleted(params: {
  mission_id: string;
  reward_coins: number;
}) {
  log('mission_completed', params);
}

export function logStreakUpdated(params: {
  current_streak: number;
  best_streak: number;
}) {
  log('streak_updated', params);
}

// ─── User properties ──────────────────────────────────────────────────────────

export function setUserProperties(params: {
  level: number;
  total_puzzles_completed: number;
  has_remove_ads: boolean;
  is_premium: boolean;
}) {
  if (!analytics) return;
  try {
    analytics().setUserProperties({
      player_level: String(params.level),
      puzzles_completed: String(params.total_puzzles_completed),
      has_remove_ads: String(params.has_remove_ads),
      is_premium: String(params.is_premium),
    });
  } catch {}
}
