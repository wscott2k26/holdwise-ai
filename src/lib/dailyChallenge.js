import { Deck, seededRandom, shuffle } from "./cards/deck.js";
import { evaluateHand } from "./cards/handEvaluator.js";

export const DAILY_CHALLENGE_KEY = "holdwise_daily_challenge_v2";

const HAND_NAMES = [
  "Royal Flush",
  "Straight Flush",
  "Four of a Kind",
  "Full House",
  "Flush",
  "Straight",
  "Three of a Kind",
  "Two Pair",
  "Jacks or Better",
  "Low Pair",
  "High Card",
];

export function dailyChallengeDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function seedFromDate(date = new Date()) {
  return Number(dailyChallengeDateKey(date).replaceAll("-", ""));
}

export function buildDailyChallengeHands(date = new Date(), count = 5) {
  const seed = seedFromDate(date);
  return Array.from({ length: count }, (_, index) => new Deck(seed + (index + 1) * 7919).draw(5));
}

export function buildDailyChallengeOptions(hand, date = new Date(), handIndex = 0) {
  const correct = evaluateHand(hand).name;
  const wrong = HAND_NAMES.filter((name) => name !== correct);
  const seed = seedFromDate(date) + (handIndex + 1) * 104729;
  const chosenWrong = shuffle(wrong, seededRandom(seed)).slice(0, 3);
  return shuffle([...chosenWrong, correct], seededRandom(seed ^ 0x9e3779b9));
}

export function buildDailyChallengeRecord(date = new Date(), score = 0, total = 5) {
  return {
    date: dailyChallengeDateKey(date),
    completed: true,
    score: Math.max(0, Number(score) || 0),
    total: Math.max(1, Number(total) || 5),
  };
}

export function loadDailyChallengeRecord(date = new Date(), storage = globalThis.localStorage) {
  if (!storage) return null;
  try {
    const record = JSON.parse(storage.getItem(DAILY_CHALLENGE_KEY) || "null");
    return record?.date === dailyChallengeDateKey(date) && record?.completed ? record : null;
  } catch {
    return null;
  }
}

export function saveDailyChallengeRecord(record, storage = globalThis.localStorage) {
  if (!storage || !record) return record;
  storage.setItem(DAILY_CHALLENGE_KEY, JSON.stringify(record));
  return record;
}
