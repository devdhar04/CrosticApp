import { Feather } from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

interface Props {
  onLetter: (letter: string) => void;
  onDelete: () => void;
  selectedNum: number | null;
  numToGuess: Record<number, string>;
}

export default function LetterKeyboard({ onLetter, onDelete, selectedNum, numToGuess }: Props) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const currentGuess = selectedNum !== null ? numToGuess[selectedNum] : undefined;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.secondary,
          borderTopColor: colors.border,
          paddingBottom: Platform.OS === "web" ? 34 : Math.max(insets.bottom, 16),
        },
      ]}
    >
      {ROWS.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.keyRow}>
          {rowIdx === 2 && <View style={styles.spacer} />}
          {row.split("").map((letter) => {
            const isActive = currentGuess === letter;
            return (
              <TouchableOpacity
                key={letter}
                onPress={() => onLetter(letter)}
                style={[
                  styles.key,
                  rowIdx === 2 && styles.wideKey,
                  {
                    backgroundColor: isActive
                      ? colors.primary
                      : colors.card,
                    borderColor: isActive ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.keyText,
                    { color: isActive ? "#FFF" : colors.foreground },
                  ]}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
          {rowIdx === 2 && (
            <TouchableOpacity
              onPress={onDelete}
              style={[
                styles.key,
                styles.deleteKey,
                { backgroundColor: colors.muted, borderColor: colors.border },
              ]}
              activeOpacity={0.7}
            >
              <Feather name="delete" size={16} color={colors.foreground} />
            </TouchableOpacity>
          )}
          {rowIdx === 2 && <View style={styles.spacer} />}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 4,
    gap: 6,
    minHeight: 200,
  },
  statusBar: {
    alignItems: "center",
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  statusNum: {
    fontFamily: "Inter_700Bold",
    fontSize: 14,
  },
  keyRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
  },
  key: {
    flex: 1,
    maxWidth: 38,
    height: 46,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  wideKey: {
    maxWidth: 44,
    flex: 1.15,
  },
  keyText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  deleteKey: {
    maxWidth: 52,
    flex: 1.4,
  },
  spacer: {
    flex: 0.5,
  },
});
