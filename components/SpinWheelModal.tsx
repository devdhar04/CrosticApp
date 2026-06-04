import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SPIN_REWARDS } from "@/context/GameContext";
import { useColors } from "@/hooks/useColors";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSpin: () => number; // calls doSpin(), returns coins
}

const SEGMENT_COLORS = [
  "#5B6AF0", "#F5A623", "#4ECB71", "#F54242",
  "#A46DF5", "#06D6A0", "#FFD166", "#E76F51",
];

const SEGMENTS = SPIN_REWARDS.length;
const SEGMENT_ANGLE = 360 / SEGMENTS;

/** Draws one coloured slice of the wheel using Animated + transforms */
function WheelSegment({
  index,
  label,
  color,
  size,
}: {
  index: number;
  label: string;
  color: string;
  size: number;
}) {
  const angle = index * SEGMENT_ANGLE;
  const rad = (angle * Math.PI) / 180;
  const r = size / 2 - 2;
  const midAngle = (angle + SEGMENT_ANGLE / 2) * (Math.PI / 180);
  const textR = r * 0.62;
  const tx = size / 2 + textR * Math.cos(midAngle - Math.PI / 2);
  const ty = size / 2 + textR * Math.sin(midAngle - Math.PI / 2);

  return (
    <View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: "hidden",
        transform: [{ rotate: `${angle}deg` }],
      }}
      pointerEvents="none"
    >
      {/* Half-pie slice using border trick */}
      <View
        style={{
          position: "absolute",
          width: size / 2,
          height: size,
          left: size / 2,
          backgroundColor: color,
          transformOrigin: "left center",
          transform: [{ rotate: `${SEGMENT_ANGLE - 180}deg` }],
          opacity: 0.9,
        }}
      />
    </View>
  );
}

export default function SpinWheelModal({ visible, onClose, onSpin }: Props) {
  const colors = useColors();
  const spinAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(400)).current;
  const bgAnim = useRef(new Animated.Value(0)).current;

  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [totalRotation, setTotalRotation] = useState(0);

  const WHEEL_SIZE = 260;

  useEffect(() => {
    if (visible) {
      setResult(null);
      setSpinning(false);
      spinAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 65, friction: 10, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 400, duration: 200, useNativeDriver: true }),
        Animated.timing(bgAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const handleSpin = () => {
    if (spinning || result !== null) return;
    setSpinning(true);

    // Get reward first so we can animate to the right segment
    const coins = onSpin();
    setResult(coins);

    const targetIdx = SPIN_REWARDS.indexOf(coins);
    // Spin at least 5 full rotations + land on the target segment
    const targetAngle = 360 * 5 + (360 - targetIdx * SEGMENT_ANGLE - SEGMENT_ANGLE / 2);
    const newTotal = totalRotation + targetAngle;
    setTotalRotation(newTotal);

    Animated.timing(spinAnim, {
      toValue: newTotal,
      duration: 3000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setSpinning(false);
    });
  };

  const rotation = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ["0deg", "360deg"],
    extrapolate: "extend",
  });

  const bgOpacity = bgAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: bgOpacity }]} pointerEvents="none" />
        <TouchableOpacity style={styles.backdropTap} onPress={result ? onClose : undefined} activeOpacity={1} />

        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: colors.border }]} />

          <Text style={[styles.title, { color: colors.foreground }]}>Daily Spin</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
            Spin once a day for free coins!
          </Text>

          {/* Wheel */}
          <View style={styles.wheelContainer}>
            {/* Pointer */}
            <View style={[styles.pointer, { borderBottomColor: colors.destructive }]} />

            <Animated.View
              style={[
                styles.wheel,
                {
                  width: WHEEL_SIZE,
                  height: WHEEL_SIZE,
                  borderRadius: WHEEL_SIZE / 2,
                  transform: [{ rotate: rotation }],
                  borderColor: colors.border,
                },
              ]}
            >
              {SPIN_REWARDS.map((coins, i) => (
                <View
                  key={i}
                  style={[
                    styles.segment,
                    {
                      width: WHEEL_SIZE,
                      height: WHEEL_SIZE,
                      borderRadius: WHEEL_SIZE / 2,
                      transform: [{ rotate: `${i * SEGMENT_ANGLE}deg` }],
                    },
                  ]}
                >
                  {/* Coloured half */}
                  <View
                    style={[
                      styles.segmentHalf,
                      {
                        width: WHEEL_SIZE / 2,
                        height: WHEEL_SIZE,
                        backgroundColor: SEGMENT_COLORS[i % SEGMENT_COLORS.length],
                        transform: [{ rotate: `${SEGMENT_ANGLE / 2 - 90}deg` }],
                      },
                    ]}
                  />
                </View>
              ))}

              {/* Labels */}
              {SPIN_REWARDS.map((coins, i) => {
                const midAngle = ((i * SEGMENT_ANGLE + SEGMENT_ANGLE / 2) * Math.PI) / 180;
                const r = WHEEL_SIZE * 0.3;
                const tx = WHEEL_SIZE / 2 + r * Math.cos(midAngle - Math.PI / 2);
                const ty = WHEEL_SIZE / 2 + r * Math.sin(midAngle - Math.PI / 2);
                return (
                  <View
                    key={`label-${i}`}
                    style={[styles.segmentLabel, { left: tx - 18, top: ty - 10 }]}
                    pointerEvents="none"
                  >
                    <Text style={styles.segmentText}>{coins}</Text>
                  </View>
                );
              })}

              {/* Centre hub */}
              <View style={[styles.hub, { backgroundColor: colors.card, borderColor: colors.border }]} />
            </Animated.View>
          </View>

          {/* Result */}
          {result !== null && !spinning && (
            <View style={[styles.resultBox, { backgroundColor: colors.accent + "18", borderColor: colors.accent }]}>
              <Text style={[styles.resultText, { color: colors.accent }]}>🎉 +{result} Coins!</Text>
              <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
                Added to your balance
              </Text>
            </View>
          )}

          {/* CTA */}
          {result === null ? (
            <TouchableOpacity
              onPress={handleSpin}
              disabled={spinning}
              style={[styles.spinBtn, { backgroundColor: spinning ? colors.muted : colors.primary }]}
              activeOpacity={0.88}
            >
              <Feather name="refresh-cw" size={18} color={spinning ? colors.mutedForeground : "#fff"} />
              <Text style={[styles.spinBtnText, { color: spinning ? colors.mutedForeground : "#fff" }]}>
                {spinning ? "Spinning…" : "Spin!"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={onClose}
              style={[styles.spinBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.88}
            >
              <Text style={[styles.spinBtnText, { color: "#fff" }]}>Collect & Play</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },
  backdropTap: { ...StyleSheet.absoluteFillObject },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 20,
  },
  handle: { width: 36, height: 4, borderRadius: 2, marginBottom: 4 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold" },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },

  wheelContainer: { alignItems: "center", justifyContent: "center", marginVertical: 8 },
  pointer: {
    width: 0, height: 0,
    borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 20,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    position: "absolute", top: -10, zIndex: 10,
  },
  wheel: {
    borderWidth: 3,
    overflow: "hidden",
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  segment: { position: "absolute", overflow: "hidden" },
  segmentHalf: {
    position: "absolute",
    right: 0,
    top: 0,
    transformOrigin: "left center",
  },
  segmentLabel: { position: "absolute", width: 36, alignItems: "center" },
  segmentText: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  hub: {
    position: "absolute",
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2,
    alignSelf: "center",
    zIndex: 5,
  },
  resultBox: {
    width: "100%",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    alignItems: "center",
    gap: 4,
  },
  resultText: { fontSize: 24, fontFamily: "Inter_700Bold" },
  resultSub: { fontSize: 12, fontFamily: "Inter_400Regular" },

  spinBtn: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  spinBtnText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
