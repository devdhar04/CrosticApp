import type { PuzzleRaw } from "../constants/puzzleData";

export interface QuoteSegment {
  char: string;
  num: number | null;
  segIndex: number;
}

export interface QuoteWord {
  segments: QuoteSegment[];
}

export interface ClueItem {
  label: string;
  hint: string;
  word: string;
  encoded: number[];
}

export interface ProcessedPuzzle {
  id: string;
  quote: string;
  attribution: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  quoteSegments: QuoteSegment[];
  quoteWords: QuoteWord[];
  letterToNum: Record<string, number>;
  numToLetter: Record<number, string>;
  clues: ClueItem[];
  totalLetterCount: number;
}

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = ((s * 1664525 + 1013904223) >>> 0) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

export function processPuzzle(raw: PuzzleRaw): ProcessedPuzzle {
  const upperQuote = raw.quote.toUpperCase();
  const seed = raw.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  const numbers = Array.from({ length: 26 }, (_, i) => i + 1);
  for (let i = numbers.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
  }

  const allLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const letterToNum: Record<string, number> = {};
  const numToLetter: Record<number, string> = {};
  allLetters.forEach((letter, i) => {
    letterToNum[letter] = numbers[i];
    numToLetter[numbers[i]] = letter;
  });

  let segIndex = 0;
  const quoteSegments: QuoteSegment[] = upperQuote.split("").map((char) => {
    const num = /[A-Z]/.test(char) ? letterToNum[char] : null;
    const seg: QuoteSegment = { char, num, segIndex: segIndex++ };
    return seg;
  });

  const totalLetterCount = quoteSegments.filter((s) => s.num !== null).length;

  const quoteWords: QuoteWord[] = [];
  let wordSegs: QuoteSegment[] = [];
  for (const seg of quoteSegments) {
    if (seg.char === " " || seg.char === "\n") {
      if (wordSegs.length > 0) {
        quoteWords.push({ segments: wordSegs });
        wordSegs = [];
      }
    } else {
      wordSegs.push(seg);
    }
  }
  if (wordSegs.length > 0) quoteWords.push({ segments: wordSegs });

  const clues: ClueItem[] = raw.clueWords.map((cw, i) => ({
    label: String.fromCharCode(65 + i),
    hint: cw.hint,
    word: cw.word.toUpperCase(),
    encoded: cw.word
      .toUpperCase()
      .split("")
      .map((c) => letterToNum[c] ?? 0),
  }));

  return {
    id: raw.id,
    quote: raw.quote,
    attribution: raw.attribution,
    theme: raw.theme,
    difficulty: raw.difficulty,
    quoteSegments,
    quoteWords,
    letterToNum,
    numToLetter,
    clues,
    totalLetterCount,
  };
}

export function getCompletionStats(
  puzzle: ProcessedPuzzle,
  numToGuess: Record<number, string>
): { correct: number; total: number; percentage: number; isComplete: boolean } {
  let correct = 0;
  const total = puzzle.totalLetterCount;
  for (const seg of puzzle.quoteSegments) {
    if (seg.num === null) continue;
    const correctLetter = puzzle.numToLetter[seg.num];
    if (numToGuess[seg.num] === correctLetter) correct++;
  }
  return {
    correct,
    total,
    percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
    isComplete: correct === total && total > 0,
  };
}

export function getDailyPuzzleId(puzzles: PuzzleRaw[]): string {
  const today = new Date();
  const dateNum =
    today.getFullYear() * 10000 +
    (today.getMonth() + 1) * 100 +
    today.getDate();
  const eligible = puzzles.filter(
    (p) => p.difficulty === "easy" || p.difficulty === "medium"
  );
  return eligible[dateNum % eligible.length].id;
}

export function applyHintRevealLetter(
  numToGuess: Record<number, string>,
  puzzle: ProcessedPuzzle,
  targetNum: number
): Record<number, string> {
  const correctLetter = puzzle.numToLetter[targetNum];
  if (!correctLetter) return numToGuess;
  return { ...numToGuess, [targetNum]: correctLetter };
}

export function applyHintRevealWord(
  numToGuess: Record<number, string>,
  puzzle: ProcessedPuzzle,
  clueLabel: string
): Record<number, string> {
  const clue = puzzle.clues.find((c) => c.label === clueLabel);
  if (!clue) return numToGuess;
  const updated = { ...numToGuess };
  clue.encoded.forEach((num, i) => {
    const correctLetter = clue.word[i];
    if (correctLetter) updated[num] = correctLetter;
  });
  return updated;
}

export function removeWrongLetters(
  numToGuess: Record<number, string>,
  puzzle: ProcessedPuzzle
): Record<number, string> {
  const updated: Record<number, string> = {};
  for (const [numStr, guess] of Object.entries(numToGuess)) {
    const num = Number(numStr);
    const correct = puzzle.numToLetter[num];
    if (correct && guess === correct) {
      updated[num] = guess;
    }
  }
  return updated;
}
