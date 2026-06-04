import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGame } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";
import { useNotifications } from "@/hooks/useNotifications";

function SettingRow({
  icon,
  label,
  description,
  rightElement,
  onPress,
  danger,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  description?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  const colors = useColors();
  const color = danger ? colors.destructive : colors.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.row, { borderBottomColor: colors.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: color + "18" }]}>
        <Feather name={icon} size={18} color={color} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, { color: danger ? colors.destructive : colors.foreground }]}>
          {label}
        </Text>
        {description && (
          <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>
            {description}
          </Text>
        )}
      </View>
      {rightElement ?? (
        onPress ? <Feather name="chevron-right" size={16} color={colors.mutedForeground} /> : null
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { settings, updateSettings, coins, addCoins, streak } = useGame();
  const {
    notificationsEnabled,
    permissionStatus,
    enableNotifications,
    disableNotifications,
    sendTestNotification,
  } = useNotifications();

  const handleToggleSound = () =>
    updateSettings({ soundEnabled: !settings.soundEnabled });

  const handleToggleHaptics = () =>
    updateSettings({ hapticsEnabled: !settings.hapticsEnabled });

  const handleToggleDark = () => {
    // Cycle through: null (system) -> false (light) -> true (dark) -> null
    if (settings.darkMode === null) {
      updateSettings({ darkMode: false });
    } else if (settings.darkMode === false) {
      updateSettings({ darkMode: true });
    } else {
      updateSettings({ darkMode: null });
    }
  };

  const handleToggleNotifications = async () => {
    if (notificationsEnabled) {
      await disableNotifications();
      Alert.alert('Notifications Disabled', 'You won\'t receive daily puzzle reminders.');
    } else {
      const success = await enableNotifications();
      if (success) {
        Alert.alert(
          '🔔 Notifications Enabled!',
          'You\'ll receive daily reminders at:\n• 9:00 AM\n• 2:00 PM\n• 7:00 PM',
          [
            { text: 'OK' },
            { text: 'Send Test', onPress: () => sendTestNotification() },
          ]
        );
      } else {
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily puzzle reminders.',
          [{ text: 'OK' }]
        );
      }
    }
  };

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
            Settings
          </Text>
        </View>

        {/* Wallet Card */}
        <View style={[styles.walletCard, { backgroundColor: colors.primary }]}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.walletLabel}>Your Balance</Text>
              <Text style={styles.walletCoins}>{coins} Coins</Text>
            </View>
            <TouchableOpacity
              onPress={() => addCoins(50)}
              style={styles.getMoreBtn}
              activeOpacity={0.8}
            >
              <Feather name="plus" size={14} color={colors.primary} />
              <Text style={[styles.getMoreText, { color: colors.primary }]}>
                Get More
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.hintCosts}>
            <View style={styles.hintCostItem}>
              <Feather name="type" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.hintCostText}>Reveal Letter: 10 coins</Text>
            </View>
            <View style={styles.hintCostItem}>
              <Feather name="align-left" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.hintCostText}>Reveal Word: 25 coins</Text>
            </View>
            <View style={styles.hintCostItem}>
              <Feather name="x-circle" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.hintCostText}>Remove Wrong: 15 coins</Text>
            </View>
          </View>
        </View>

        {/* Appearance */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            APPEARANCE
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <TouchableOpacity
              onPress={handleToggleDark}
              activeOpacity={0.7}
              style={[styles.row, { borderBottomColor: colors.border }]}
            >
              <View style={[styles.rowIcon, { backgroundColor: colors.primary + "18" }]}>
                <Feather name="moon" size={18} color={colors.primary} />
              </View>
              <View style={styles.rowInfo}>
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>
                  Dark Mode
                </Text>
                <Text style={[styles.rowDesc, { color: colors.mutedForeground }]}>
                  Tap to cycle: {settings.darkMode === null ? "System default" : settings.darkMode ? "On" : "Off"}
                </Text>
              </View>
              <View style={[styles.darkModeIndicator, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.darkModeText, { color: colors.foreground }]}>
                  {settings.darkMode === null ? "Auto" : settings.darkMode ? "Dark" : "Light"}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            NOTIFICATIONS
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="bell"
              label="Daily Reminders"
              description={
                notificationsEnabled
                  ? "Enabled • 9 AM, 2 PM, 7 PM"
                  : permissionStatus === 'denied'
                  ? "Denied in settings"
                  : "Disabled"
              }
              rightElement={
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleToggleNotifications}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#FFF"
                  disabled={permissionStatus === 'denied'}
                />
              }
            />
          </View>
        </View>

        {/* Sound & Haptics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            FEEDBACK
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="volume-2"
              label="Sound Effects"
              description="Play sounds on correct answers"
              rightElement={
                <Switch
                  value={settings.soundEnabled}
                  onValueChange={handleToggleSound}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#FFF"
                />
              }
            />
            <SettingRow
              icon="smartphone"
              label="Haptic Feedback"
              description="Vibrate on key presses"
              rightElement={
                <Switch
                  value={settings.hapticsEnabled}
                  onValueChange={handleToggleHaptics}
                  trackColor={{ false: colors.muted, true: colors.primary }}
                  thumbColor="#FFF"
                />
              }
            />
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            YOUR PROGRESS
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="zap"
              label="Current Streak"
              rightElement={
                <View
                  style={[
                    styles.valueBadge,
                    { backgroundColor: colors.destructive + "22" },
                  ]}
                >
                  <Text
                    style={[styles.valueBadgeText, { color: colors.destructive }]}
                  >
                    {streak.current} days
                  </Text>
                </View>
              }
            />
            <SettingRow
              icon="award"
              label="Best Streak"
              rightElement={
                <View
                  style={[
                    styles.valueBadge,
                    { backgroundColor: colors.accent + "22" },
                  ]}
                >
                  <Text
                    style={[styles.valueBadgeText, { color: colors.accent }]}
                  >
                    {streak.best} days
                  </Text>
                </View>
              }
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            ABOUT
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SettingRow
              icon="info"
              label="Version"
              rightElement={
                <Text style={[styles.versionText, { color: colors.mutedForeground }]}>
                  1.0.0
                </Text>
              }
            />
            <SettingRow
              icon="book-open"
              label="How to Play"
              description="Decode quotes using letter clues"
            />
            <SettingRow
              icon="star"
              label="Rate the App"
              description="Enjoying Crostic? Leave a review!"
              onPress={() => {}}
            />
          </View>
        </View>

        <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
          CROSTIC — Word Puzzle Game
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { gap: 20 },
  header: { paddingHorizontal: 20 },
  title: { fontSize: 26, fontFamily: "Inter_700Bold" },
  walletCard: {
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  walletRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  walletLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  walletCoins: {
    color: "#FFF",
    fontSize: 24,
    fontFamily: "Inter_700Bold",
    marginTop: 2,
  },
  getMoreBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
  },
  getMoreText: { fontSize: 13, fontFamily: "Inter_700Bold" },
  hintCosts: { gap: 8 },
  hintCostItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  hintCostText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 20,
  },
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 15, fontFamily: "Inter_500Medium" },
  rowDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  darkModeIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  darkModeText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  valueBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  valueBadgeText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  versionText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  footerText: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
    paddingBottom: 8,
  },
});
