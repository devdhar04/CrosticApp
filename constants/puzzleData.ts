import { BATCH1 } from "./puzzles/batch1";
import { BATCH2 } from "./puzzles/batch2";
import { BATCH3 } from "./puzzles/batch3";
import { BATCH4 } from "./puzzles/batch4";
import { BATCH5 } from "./puzzles/batch5";

export interface PuzzleRaw {
  id: string;
  quote: string;
  attribution: string;
  theme: string;
  difficulty: "easy" | "medium" | "hard" | "expert";
  clueWords: { hint: string; word: string }[];
}

// ─── p001–p030 (unique to this file; batches start at p031) ──────────────────
const BASE_PUZZLES: PuzzleRaw[] = [
  {
    id: "p001",
    quote: "The only way to do great work is to love what you do.",
    attribution: "Steve Jobs",
    theme: "Inspiration",
    difficulty: "easy",
    clueWords: [
      { hint: "Opposite of hate", word: "LOVE" },
      { hint: "Superior quality", word: "GREAT" },
      { hint: "Your path forward", word: "WAY" },
      { hint: "Sole or single", word: "ONLY" },
      { hint: "Labor or toil", word: "WORK" },
      { hint: "Yourself, second person", word: "YOU" },
    ],
  },
  {
    id: "p002",
    quote: "In the middle of difficulty lies opportunity.",
    attribution: "Albert Einstein",
    theme: "Wisdom",
    difficulty: "easy",
    clueWords: [
      { hint: "A golden chance", word: "OPPORTUNITY" },
      { hint: "Challenging situation", word: "DIFFICULTY" },
      { hint: "Halfway point", word: "MIDDLE" },
    ],
  },
  {
    id: "p003",
    quote: "It always seems impossible until it is done.",
    attribution: "Nelson Mandela",
    theme: "Perseverance",
    difficulty: "easy",
    clueWords: [
      { hint: "Cannot be achieved", word: "IMPOSSIBLE" },
      { hint: "Completed or finished", word: "DONE" },
      { hint: "Every time, invariably", word: "ALWAYS" },
      { hint: "Appears to be", word: "SEEMS" },
    ],
  },
  {
    id: "p004",
    quote: "Believe you can and you are halfway there.",
    attribution: "Theodore Roosevelt",
    theme: "Confidence",
    difficulty: "easy",
    clueWords: [
      { hint: "Have faith or trust", word: "BELIEVE" },
      { hint: "Fifty percent of distance", word: "HALFWAY" },
      { hint: "At that location", word: "THERE" },
      { hint: "Able to, have power to", word: "CAN" },
    ],
  },
  {
    id: "p005",
    quote: "The mind is everything. What you think you become.",
    attribution: "Buddha",
    theme: "Mindset",
    difficulty: "easy",
    clueWords: [
      { hint: "Brain or intellect", word: "MIND" },
      { hint: "Transform or change into", word: "BECOME" },
      { hint: "Ponder or contemplate", word: "THINK" },
      { hint: "Totality, the whole", word: "EVERYTHING" },
    ],
  },
  {
    id: "p006",
    quote: "Be yourself. Everyone else is already taken.",
    attribution: "Oscar Wilde",
    theme: "Identity",
    difficulty: "easy",
    clueWords: [
      { hint: "Every single person", word: "EVERYONE" },
      { hint: "Your true self", word: "YOURSELF" },
      { hint: "Occupied or claimed", word: "TAKEN" },
      { hint: "By this time", word: "ALREADY" },
    ],
  },
  {
    id: "p007",
    quote: "We accept the love we think we deserve.",
    attribution: "Stephen Chbosky",
    theme: "Self-worth",
    difficulty: "easy",
    clueWords: [
      { hint: "Receive willingly", word: "ACCEPT" },
      { hint: "Deep affection", word: "LOVE" },
      { hint: "Are worthy of", word: "DESERVE" },
      { hint: "Believe or suppose", word: "THINK" },
    ],
  },
  {
    id: "p008",
    quote: "Not all those who wander are lost.",
    attribution: "J.R.R. Tolkien",
    theme: "Adventure",
    difficulty: "easy",
    clueWords: [
      { hint: "Roam or drift freely", word: "WANDER" },
      { hint: "Unable to find the way", word: "LOST" },
      { hint: "Them, certain people", word: "THOSE" },
    ],
  },
  {
    id: "p009",
    quote: "The secret of getting ahead is getting started.",
    attribution: "Mark Twain",
    theme: "Action",
    difficulty: "easy",
    clueWords: [
      { hint: "Hidden knowledge", word: "SECRET" },
      { hint: "Moving forward", word: "AHEAD" },
      { hint: "Initiating or beginning", word: "STARTED" },
      { hint: "Acquiring or obtaining", word: "GETTING" },
    ],
  },
  {
    id: "p010",
    quote: "Wonder is the beginning of wisdom.",
    attribution: "Socrates",
    theme: "Wisdom",
    difficulty: "easy",
    clueWords: [
      { hint: "Amazement or awe", word: "WONDER" },
      { hint: "Start or commencement", word: "BEGINNING" },
      { hint: "Knowledge and insight", word: "WISDOM" },
    ],
  },
  {
    id: "p011",
    quote: "The purpose of our lives is to be happy.",
    attribution: "Dalai Lama",
    theme: "Happiness",
    difficulty: "easy",
    clueWords: [
      { hint: "Reason or intention", word: "PURPOSE" },
      { hint: "Filled with joy", word: "HAPPY" },
      { hint: "Our existence", word: "LIVES" },
    ],
  },
  {
    id: "p012",
    quote: "You only live once, but if you do it right, once is enough.",
    attribution: "Mae West",
    theme: "Life",
    difficulty: "easy",
    clueWords: [
      { hint: "Exist or inhabit", word: "LIVE" },
      { hint: "A single time", word: "ONCE" },
      { hint: "Sufficient or adequate", word: "ENOUGH" },
      { hint: "In the correct way", word: "RIGHT" },
    ],
  },
  {
    id: "p013",
    quote: "Turn your wounds into wisdom.",
    attribution: "Oprah Winfrey",
    theme: "Growth",
    difficulty: "easy",
    clueWords: [
      { hint: "Rotate or change direction", word: "TURN" },
      { hint: "Injuries or hurts", word: "WOUNDS" },
      { hint: "Knowledge and insight", word: "WISDOM" },
    ],
  },
  {
    id: "p014",
    quote: "Act as if what you do makes a difference. It does.",
    attribution: "William James",
    theme: "Impact",
    difficulty: "easy",
    clueWords: [
      { hint: "Perform or do something", word: "ACT" },
      { hint: "Creates a change", word: "MAKES" },
      { hint: "Contrast or variation", word: "DIFFERENCE" },
    ],
  },
  {
    id: "p015",
    quote: "It does not matter how slowly you go as long as you do not stop.",
    attribution: "Confucius",
    theme: "Perseverance",
    difficulty: "easy",
    clueWords: [
      { hint: "Cease or halt", word: "STOP" },
      { hint: "At a leisurely pace", word: "SLOWLY" },
      { hint: "Duration or time span", word: "LONG" },
    ],
  },
  {
    id: "p016",
    quote: "Everything you have ever wanted is on the other side of fear.",
    attribution: "George Addair",
    theme: "Courage",
    difficulty: "easy",
    clueWords: [
      { hint: "Wanted or desired", word: "WANTED" },
      { hint: "An emotion of dread", word: "FEAR" },
      { hint: "Opposite side", word: "OTHER" },
      { hint: "The whole amount", word: "EVERYTHING" },
    ],
  },
  {
    id: "p017",
    quote: "Happiness is not something ready made. It comes from your own actions.",
    attribution: "Dalai Lama",
    theme: "Happiness",
    difficulty: "easy",
    clueWords: [
      { hint: "State of joy", word: "HAPPINESS" },
      { hint: "Deeds or behaviors", word: "ACTIONS" },
      { hint: "Prepared in advance", word: "READY" },
      { hint: "Arrives or originates", word: "COMES" },
    ],
  },
  {
    id: "p018",
    quote: "You are never too old to set another goal or to dream a new dream.",
    attribution: "C.S. Lewis",
    theme: "Dreams",
    difficulty: "easy",
    clueWords: [
      { hint: "Aim or target", word: "GOAL" },
      { hint: "A sleeping vision", word: "DREAM" },
      { hint: "Establish or place", word: "SET" },
      { hint: "Mature in years", word: "OLD" },
    ],
  },
  {
    id: "p019",
    quote: "The journey of a thousand miles begins with one step.",
    attribution: "Lao Tzu",
    theme: "Beginnings",
    difficulty: "easy",
    clueWords: [
      { hint: "A long trip or voyage", word: "JOURNEY" },
      { hint: "Starts or commences", word: "BEGINS" },
      { hint: "A single footstep", word: "STEP" },
      { hint: "Distance measurement", word: "MILES" },
    ],
  },
  {
    id: "p020",
    quote: "Life is either a daring adventure or nothing at all.",
    attribution: "Helen Keller",
    theme: "Adventure",
    difficulty: "easy",
    clueWords: [
      { hint: "Bold and risky", word: "DARING" },
      { hint: "Exciting journey", word: "ADVENTURE" },
      { hint: "Human existence", word: "LIFE" },
      { hint: "Zero, not any", word: "NOTHING" },
    ],
  },
  {
    id: "p021",
    quote: "In three words I can sum up everything I have learned about life: it goes on.",
    attribution: "Robert Frost",
    theme: "Life",
    difficulty: "easy",
    clueWords: [
      { hint: "Condense or summarize", word: "SUM" },
      { hint: "Gained knowledge from", word: "LEARNED" },
      { hint: "Continues or progresses", word: "GOES" },
      { hint: "Total or all", word: "EVERYTHING" },
    ],
  },
  {
    id: "p022",
    quote: "Start where you are. Use what you have. Do what you can.",
    attribution: "Arthur Ashe",
    theme: "Action",
    difficulty: "easy",
    clueWords: [
      { hint: "Begin or commence", word: "START" },
      { hint: "Employ or utilize", word: "USE" },
      { hint: "Perform or achieve", word: "DO" },
      { hint: "Able to, possible", word: "CAN" },
    ],
  },
  {
    id: "p023",
    quote: "Dream big and dare to fail.",
    attribution: "Norman Vaughan",
    theme: "Dreams",
    difficulty: "easy",
    clueWords: [
      { hint: "Envision while sleeping", word: "DREAM" },
      { hint: "Large in size", word: "BIG" },
      { hint: "Take a bold risk", word: "DARE" },
      { hint: "Fall short of success", word: "FAIL" },
    ],
  },
  {
    id: "p024",
    quote: "Your time is limited, so don't waste it living someone else's life.",
    attribution: "Steve Jobs",
    theme: "Life",
    difficulty: "easy",
    clueWords: [
      { hint: "Restricted or finite", word: "LIMITED" },
      { hint: "Squander or misuse", word: "WASTE" },
      { hint: "Existing or residing", word: "LIVING" },
      { hint: "Another individual", word: "SOMEONE" },
    ],
  },
  {
    id: "p025",
    quote: "Try to be a rainbow in someone's cloud.",
    attribution: "Maya Angelou",
    theme: "Kindness",
    difficulty: "easy",
    clueWords: [
      { hint: "Make an attempt", word: "TRY" },
      { hint: "Colorful arc in the sky", word: "RAINBOW" },
      { hint: "A person or individual", word: "SOMEONE" },
      { hint: "Misty atmospheric mass", word: "CLOUD" },
    ],
  },
  {
    id: "p026",
    quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    attribution: "Winston Churchill",
    theme: "Success",
    difficulty: "easy",
    clueWords: [
      { hint: "Achievement or victory", word: "SUCCESS" },
      { hint: "Deadly or lethal", word: "FATAL" },
      { hint: "Bravery or boldness", word: "COURAGE" },
      { hint: "Persist or go on", word: "CONTINUE" },
      { hint: "Last or concluding", word: "FINAL" },
    ],
  },
  {
    id: "p027",
    quote: "You have brains in your head and feet in your shoes.",
    attribution: "Dr. Seuss",
    theme: "Confidence",
    difficulty: "easy",
    clueWords: [
      { hint: "Organ of thought", word: "BRAINS" },
      { hint: "Footwear or sneakers", word: "SHOES" },
      { hint: "Lower limbs", word: "FEET" },
    ],
  },
  {
    id: "p028",
    quote: "Spread love everywhere you go. Let no one come from you without leaving happier.",
    attribution: "Mother Teresa",
    theme: "Kindness",
    difficulty: "easy",
    clueWords: [
      { hint: "Scatter or distribute", word: "SPREAD" },
      { hint: "Opposite of hate", word: "LOVE" },
      { hint: "More joyful or glad", word: "HAPPIER" },
      { hint: "Allow or permit", word: "LET" },
    ],
  },
  {
    id: "p029",
    quote: "What lies behind us and what lies before us are tiny matters.",
    attribution: "Ralph Waldo Emerson",
    theme: "Inner Strength",
    difficulty: "easy",
    clueWords: [
      { hint: "In the rear, past", word: "BEHIND" },
      { hint: "In front, ahead", word: "BEFORE" },
      { hint: "Small, petite", word: "TINY" },
      { hint: "Issues or topics", word: "MATTERS" },
    ],
  },
  {
    id: "p030",
    quote: "Do what you can, with what you have, where you are.",
    attribution: "Theodore Roosevelt",
    theme: "Action",
    difficulty: "easy",
    clueWords: [
      { hint: "Perform or execute", word: "DO" },
      { hint: "Possess or own", word: "HAVE" },
      { hint: "Ability to do something", word: "CAN" },
      { hint: "A location or place", word: "WHERE" },
    ],
  },
];

// ─── Full puzzle list: p001–p030 + all 5 batches (p031–p1000) ────────────────
export const PUZZLES: PuzzleRaw[] = [
  ...BASE_PUZZLES,
  ...BATCH1,
  ...BATCH2,
  ...BATCH3,
  ...BATCH4,
  ...BATCH5,
];

// ─── Chapter settings ─────────────────────────────────────────────────────────
/** Puzzles per chapter. 20 × 50 chapters = 1000 puzzles. */
export const CHAPTER_SIZE = 20;

/** Level required to unlock the Daily Challenge tab. */
export const DAILY_UNLOCK_LEVEL = 3;

// 50 chapter names covering the full 1000-puzzle journey
const CHAPTER_NAMES: string[] = [
  // Easy tier (chapters 1–10, puzzles 1–200)
  "First Steps",
  "Finding Your Voice",
  "Simple Truths",
  "Everyday Wisdom",
  "Words That Stick",
  "Light Reading",
  "Open Pages",
  "Morning Thoughts",
  "Short & Sweet",
  "Easy Rider",
  // Medium tier (chapters 11–25, puzzles 201–500)
  "Picking Up Pace",
  "Deeper Waters",
  "Second Wind",
  "Mind at Work",
  "The Middle Path",
  "Word by Word",
  "Sharpening Up",
  "Rising Tide",
  "Gathering Speed",
  "Halfway Home",
  "The Long Game",
  "Thinking Harder",
  "Mind Over Matter",
  "Unlocking Meaning",
  "The Climb Begins",
  // Hard tier (chapters 26–40, puzzles 501–800)
  "Into Thin Air",
  "Challenge Accepted",
  "No Easy Answers",
  "Pushing Through",
  "The Hard Road",
  "Words of Fire",
  "Tested by Time",
  "Breaking Through",
  "The Crucible",
  "Storm Season",
  "Uncharted Waters",
  "Mind the Gap",
  "Between the Lines",
  "The Deep End",
  "Pressure Point",
  // Expert tier (chapters 41–50, puzzles 801–1000)
  "Expert Territory",
  "Sage Counsel",
  "The Summit",
  "Master Class",
  "Wisdom's Edge",
  "The Final Climb",
  "Peak Performance",
  "Words of Legend",
  "The Last Mile",
  "Grand Finale",
];

export function getChapters(): { title: string; puzzles: PuzzleRaw[] }[] {
  const chapters: { title: string; puzzles: PuzzleRaw[] }[] = [];
  for (let i = 0; i < PUZZLES.length; i += CHAPTER_SIZE) {
    const idx = Math.floor(i / CHAPTER_SIZE);
    chapters.push({
      title: CHAPTER_NAMES[idx] ?? `Chapter ${idx + 1}`,
      puzzles: PUZZLES.slice(i, i + CHAPTER_SIZE),
    });
  }
  return chapters;
}

export function getUnlockedPuzzleIds(completedIds: Set<string>): Set<string> {
  const unlocked = new Set<string>();
  for (let i = 0; i < PUZZLES.length; i++) {
    if (i === 0) {
      unlocked.add(PUZZLES[0].id);
    } else if (completedIds.has(PUZZLES[i - 1].id)) {
      unlocked.add(PUZZLES[i].id);
    }
  }
  return unlocked;
}
