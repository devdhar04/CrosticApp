import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { DailyMission } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  missions: DailyMission[];
  onClaim: (missionId: string) => void;
}

const MISSION_ICONS: Record<string, "check-square" | "zap" | "eye-off"> = {
  solve_2:       "check-square",
  use_3_hints:   "zap",
  no_hint_solve: "eye-off",
};

export default function DailyMissionsCard({ missions, onClaim }: Props) {
  const colors = useColors();
  const totalDone = missions.filter((m) => m.claimed).length;
  const allClaimed = totalDone === missions.length;

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Feather name="target" size={16} color={colors.primary} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Daily Missions
          </Text>
        </View>
        <Text style={[styles.headerCount, { color: colors.mutedForeground }]}>
          {totalDone}/{missions.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View style={[styles.progressBg, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            {
              backgroundColor: allClaimed ? colors.success : colors.primary,
              width: `${(totalDone / missions.length) * 100}%` as any,
            },
          ]}
        />
      </View>

      {/* Mission rows */}
      {missions.map((mission) => {
        const isDone = mission.progress >= mission.target;
        const icon = MISSION_ICONS[mission.id] ?? "check-square";

        return (
          <View key={mission.id} style={styles.missionRow}>
            {/* Icon */}
            <View
              style={[
                styles.missionIcon,
                {
                  backgroundColor: mission.claimed
                    ? colors.success + "22"
                    : isDone
                    ? colors.primary + "18"
                    : colors.secondary,
                },
              ]}
            >
              <Feather
                name={mission.claimed ? "check" : icon}
                size={14}
                color={
                  mission.claimed
                    ? colors.success
                    : isDone
                    ? colors.primary
                    : colors.mutedForeground
                }
              />
            </View>

            {/* Label + progress */}
            <View style={styles.missionInfo}>
              <Text
                style={[
                  styles.missionLabel,
                  {
                    color: mission.claimed ? colors.mutedForeground : colors.foreground,
                    textDecorationLine: mission.claimed ? "line-through" : "none",
                  },
                ]}
              >
                {mission.label}
              </Text>
              <View style={[styles.miniBarBg, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.miniBarFill,
                    {
                      backgroundColor: mission.claimed
                        ? colors.success
                        : colors.primary,
                      width: `${Math.min(100, (mission.progress / mission.target) * 100)}%` as any,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.missionProgress, { color: colors.mutedForeground }]}>
                {Math.min(mission.progress, mission.target)}/{mission.target}
              </Text>
            </View>

            {/* Claim button or reward badge */}
            {mission.claimed ? (
              <View style={[styles.claimedBadge, { backgroundColor: colors.success + "18" }]}>
                <Feather name="check-circle" size={14} color={colors.success} />
              </View>
            ) : isDone ? (
              <TouchableOpacity
                onPress={() => onClaim(mission.id)}
                style={[styles.claimBtn, { backgroundColor: colors.accent }]}
                activeOpacity={0.85}
              >
                <Text style={styles.claimBtnText}>+{mission.reward} 🪙</Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.rewardBadge, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.rewardBadgeText, { color: colors.mutedForeground }]}>
                  {mission.reward} 🪙
                </Text>
              </View>
            )}
          </View>
        );
      })}

      {allClaimed && (
        <View style={[styles.allDoneBanner, { backgroundColor: colors.success + "15" }]}>
          <Feather name="award" size={14} color={colors.success} />
          <Text style={[styles.allDoneText, { color: colors.success }]}>
            All missions complete! Come back tomorrow.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitle: { fontSize: 15, fontFamily: "Inter_700Bold" },
  headerCount: { fontSize: 13, fontFamily: "Inter_600SemiBold" },

  progressBg: { height: 4, borderRadius: 2 },
  progressFill: { height: 4, borderRadius: 2 },

  missionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  missionIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  missionInfo: { flex: 1, gap: 4 },
  missionLabel: { fontSize: 13, fontFamily: "Inter_500Medium" },
  miniBarBg: { height: 3, borderRadius: 1.5 },
  miniBarFill: { height: 3, borderRadius: 1.5 },
  missionProgress: { fontSize: 10, fontFamily: "Inter_400Regular" },

  claimBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    flexShrink: 0,
  },
  claimBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#000" },
  claimedBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  rewardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rewardBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },

  allDoneBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    borderRadius: 10,
  },
  allDoneText: { fontSize: 12, fontFamily: "Inter_600SemiBold", flex: 1 },
});
