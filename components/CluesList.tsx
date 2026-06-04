import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { ClueItem, ProcessedPuzzle } from "@/utils/puzzleEngine";

interface Props {
  puzzle: ProcessedPuzzle;
  numToGuess: Record<number, string>;
  selectedNum: number | null;
  onSelectNum: (num: number, context: 'quote' | 'clue') => void;
}

function ClueLetterBox({
  num,
  guess,
  correctLetter,
  isSelected,
  onPress,
}: {
  num: number;
  guess?: string;
  correctLetter: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const isCorrect = guess === correctLetter;

  const bgColor = isSelected
    ? colors.tileSelected
    : isCorrect
    ? colors.tileCorrect
    : colors.tileEmpty;

  const textColor = isSelected || isCorrect ? "#FFF" : colors.foreground;
  const numColor = isSelected
    ? "rgba(255,255,255,0.7)"
    : colors.mutedForeground;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.clueBox,
        {
          backgroundColor: bgColor,
          borderColor: isSelected
            ? colors.primary
            : isCorrect
            ? colors.tileCorrect
            : colors.border,
        },
      ]}
      activeOpacity={0.75}
    >
      <Text style={[styles.clueBoxLetter, { color: textColor }]}>
        {guess ?? " "}
      </Text>
    </TouchableOpacity>
  );
}

function ClueRow({
  clue,
  puzzle,
  numToGuess,
  selectedNum,
  onSelectNum,
}: {
  clue: ClueItem;
  puzzle: ProcessedPuzzle;
  numToGuess: Record<number, string>;
  selectedNum: number | null;
  onSelectNum: (num: number, context: 'quote' | 'clue') => void;
}) {
  const colors = useColors();
  const isClueSelected = clue.encoded.includes(selectedNum ?? -1);
  const isClueComplete = clue.encoded.every(
    (num) => numToGuess[num] === puzzle.numToLetter[num]
  );

  return (
    <View
      style={[
        styles.clueRow,
        {
          backgroundColor: isClueSelected
            ? colors.secondary
            : colors.card,
          borderColor: isClueComplete ? colors.success : colors.border,
          borderWidth: isClueComplete ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.clueHeader}>
        <View
          style={[
            styles.clueLabel,
            {
              backgroundColor: isClueComplete
                ? colors.success
                : colors.primary,
            },
          ]}
        >
          <Text style={styles.clueLabelText}>{clue.label}</Text>
        </View>
        <Text
          style={[
            styles.clueHint,
            {
              color: isClueComplete
                ? colors.mutedForeground
                : colors.foreground,
              textDecorationLine: isClueComplete ? "line-through" : "none",
            },
          ]}
          numberOfLines={2}
        >
          {clue.hint}
        </Text>
        <Text style={[styles.clueLength, { color: colors.mutedForeground }]}>
          ({clue.word.length})
        </Text>
      </View>
      <View style={styles.clueBoxes}>
        {clue.encoded.map((num, i) => (
          <ClueLetterBox
            key={i}
            num={num}
            guess={numToGuess[num]}
            correctLetter={clue.word[i]}
            isSelected={selectedNum === num}
            onPress={() => onSelectNum(num, 'clue')}
          />
        ))}
      </View>
    </View>
  );
}

export default function CluesList({ puzzle, numToGuess, selectedNum, onSelectNum }: Props) {
  const colors = useColors();
  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
        CLUES
      </Text>
      {puzzle.clues.map((clue) => (
        <ClueRow
          key={clue.label}
          clue={clue}
          puzzle={puzzle}
          numToGuess={numToGuess}
          selectedNum={selectedNum}
          onSelectNum={onSelectNum}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.2,
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  clueRow: {
    marginHorizontal: 12,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  clueHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  clueLabel: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  clueLabelText: {
    color: "#FFF",
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  clueHint: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  clueLength: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  clueBoxes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    paddingLeft: 36,
  },
  clueBox: {
    width: 26,
    height: 32,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 3,
  },
  clueBoxLetter: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
  },
  clueBoxNum: {
    fontSize: 8,
    fontFamily: "Inter_500Medium",
  },
});
