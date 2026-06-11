import React, { useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useColors } from "@/hooks/useColors";
import type { ProcessedPuzzle, QuoteWord } from "@/utils/puzzleEngine";

interface Props {
  puzzle: ProcessedPuzzle;
  numToGuess: Record<number, string>;
  selectedNum: number | null;
  onSelectNum: (num: number, context: 'quote' | 'clue') => void;
}

function LetterTile({
  num,
  guess,
  correctLetter,
  isSelected,
  onPress,
}: {
  num: number;
  guess: string | undefined;
  correctLetter: string;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const isCorrect = guess === correctLetter;
  const hasGuess = !!guess;

  const tileColor = isSelected
    ? colors.tileSelected
    : isCorrect
    ? colors.tileCorrect
    : colors.tile;

  const textColor = isSelected || isCorrect ? "#FFFFFF" : colors.foreground;
  const numColor = isSelected ? "rgba(255,255,255,0.7)" : colors.mutedForeground;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.tile,
          {
            backgroundColor: tileColor,
            borderColor: isSelected
              ? colors.primary
              : isCorrect
              ? colors.tileCorrect
              : colors.border,
          },
        ]}
        activeOpacity={0.8}
      >
        <Text style={[styles.tileLetter, { color: textColor }]}>
          {hasGuess ? guess : " "}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function PunctuationChar({ char }: { char: string }) {
  const colors = useColors();
  if (char === " ") return <View style={styles.space} />;
  return (
    <View style={styles.punctContainer}>
      <Text style={[styles.punctChar, { color: colors.foreground }]}>{char}</Text>
    </View>
  );
}

export default function QuoteDisplay({ puzzle, numToGuess, selectedNum, onSelectNum }: Props) {
  return (
    <View style={styles.wordsContainer}>
      {puzzle.quoteWords.map((word: QuoteWord, wordIdx: number) => (
        <React.Fragment key={wordIdx}>
          {wordIdx > 0 && <View style={styles.wordGap} />}
          <View style={styles.wordRow}>
            {word.segments.map((seg) => {
              if (seg.num !== null) {
                return (
                  <LetterTile
                    key={seg.segIndex}
                    num={seg.num}
                    guess={numToGuess[seg.num]}
                    correctLetter={puzzle.numToLetter[seg.num]}
                    isSelected={selectedNum === seg.num}
                    onPress={() => onSelectNum(seg.num!, 'quote')}
                  />
                );
              }
              return <PunctuationChar key={seg.segIndex} char={seg.char} />;
            })}
          </View>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wordsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-end",
    gap: 3,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  wordRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2,
  },
  wordGap: {
    width: 6,
  },
  tile: {
    width: 24,
    height: 30,
    borderRadius: 5,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tileLetter: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  tileNum: {
    fontSize: 8,
    fontFamily: "Inter_500Medium",
  },
  space: {
    width: 8,
  },
  punctContainer: {
    width: 10,
    height: 30,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  punctChar: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
});
