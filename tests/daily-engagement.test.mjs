import test from "node:test";
import assert from "node:assert/strict";
import { evaluateHand } from "../src/lib/cards/handEvaluator.js";
import {
  buildDailyChallengeHands,
  buildDailyChallengeOptions,
  dailyChallengeDateKey,
  buildDailyChallengeRecord,
} from "../src/lib/dailyChallenge.js";
import { buildDailyMissionSnapshot } from "../src/lib/dailyMissions.js";
import { buildAchievementProgress } from "../src/lib/achievementProgress.js";
import { loadAcademyCompletions, recordAcademyCompletion } from "../src/lib/academyProgress.js";
import { markMistakeReviewed } from "../src/lib/mistakes.js";

function memoryStorage(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (key) => (map.has(key) ? map.get(key) : null),
    setItem: (key, value) => map.set(key, String(value)),
  };
}

test("daily challenge creates five deterministic valid hands", () => {
  const date = new Date(2026, 7, 13, 12, 0, 0);
  const first = buildDailyChallengeHands(date, 5);
  const second = buildDailyChallengeHands(date, 5);
  assert.deepEqual(first.map((hand) => hand.map((card) => card.id)), second.map((hand) => hand.map((card) => card.id)));
  assert.equal(first.length, 5);
  for (const hand of first) {
    assert.equal(hand.length, 5);
    assert.equal(new Set(hand.map((card) => card.id)).size, 5);
    for (const card of hand) {
      assert.ok(["hearts", "diamonds", "clubs", "spades"].includes(card.suit));
      assert.ok(card.suitSymbol);
    }
    assert.ok(evaluateHand(hand).name);
  }
});

test("daily challenge answer options are deterministic, unique, and include the correct hand", () => {
  const date = new Date(2026, 7, 13, 12, 0, 0);
  const hand = buildDailyChallengeHands(date, 5)[2];
  const first = buildDailyChallengeOptions(hand, date, 2);
  const second = buildDailyChallengeOptions(hand, date, 2);
  assert.deepEqual(first, second);
  assert.equal(first.length, 4);
  assert.equal(new Set(first).size, 4);
  assert.ok(first.includes(evaluateHand(hand).name));
});

test("daily challenge record carries the local date and completion score", () => {
  const date = new Date(2026, 7, 13, 12, 0, 0);
  assert.equal(dailyChallengeDateKey(date), "2026-08-13");
  assert.deepEqual(buildDailyChallengeRecord(date, 4, 5), {
    date: "2026-08-13",
    completed: true,
    score: 4,
    total: 5,
  });
});

test("daily missions adapt top-card-game quest loops to educational actions", () => {
  const date = new Date(2026, 7, 13, 12, 0, 0);
  const recent = [
    { at: "2026-08-13T13:00:00-04:00", correct: true },
    { at: "2026-08-13T13:01:00-04:00", correct: false },
    { at: "2026-08-13T13:02:00-04:00", correct: true },
    { at: "2026-08-13T13:03:00-04:00", correct: true },
    { at: "2026-08-13T13:04:00-04:00", correct: false },
  ];
  const snapshot = buildDailyMissionSnapshot({
    date,
    practice: { recent },
    challenge: buildDailyChallengeRecord(date, 4, 5),
  });
  assert.equal(snapshot.completed, 3);
  assert.equal(snapshot.total, 3);
  assert.equal(snapshot.percent, 100);
  assert.deepEqual(snapshot.missions.map((mission) => mission.id), ["five-decisions", "three-correct", "daily-challenge"]);
  assert.equal(snapshot.missions.every((mission) => mission.complete), true);
});

test("achievement progress uses real lesson, hold, review, streak, and academy data", () => {
  const cards = buildAchievementProgress({
    lessonsDone: 13,
    practice: { correct: 55 },
    profile: { streak: 8 },
    mistakes: Array.from({ length: 10 }, (_, index) => ({ at: String(index), reviewedAt: `2026-08-${String(index + 1).padStart(2, "0")}` })),
    academyCompleted: ["blackjack"],
  });
  const byId = Object.fromEntries(cards.map((card) => [card.id, card]));
  assert.equal(byId["first-lesson"].earned, true);
  assert.equal(byId["fifty-holds"].earned, true);
  assert.equal(byId["mistake-master"].earned, true);
  assert.equal(byId["streak-7"].earned, true);
  assert.equal(byId["academy-first"].earned, true);
  assert.equal(byId["academy-first"].progress, 1);
});

test("academy completion is persisted once per game", () => {
  const storage = memoryStorage();
  recordAcademyCompletion("blackjack", { score: 4, total: 5 }, storage);
  recordAcademyCompletion("blackjack", { score: 5, total: 5 }, storage);
  recordAcademyCompletion("hearts", { score: 3, total: 5 }, storage);
  const completions = loadAcademyCompletions(storage);
  assert.deepEqual(completions.map((row) => row.gameId).sort(), ["blackjack", "hearts"]);
  assert.equal(completions.find((row) => row.gameId === "blackjack").bestScore, 5);
});

test("replaying a mistake marks it reviewed without losing the saved hand", () => {
  const storage = memoryStorage({
    holdwise_mistakes_v1: JSON.stringify([{ at: "one", cards: ["Aspades"], category: "low-pair" }, { at: "two", cards: ["Kspades"] }]),
  });
  const updated = markMistakeReviewed("one", storage, "2026-08-13T20:00:00.000Z");
  assert.equal(updated.length, 2);
  assert.equal(updated[0].reviewedAt, "2026-08-13T20:00:00.000Z");
  assert.deepEqual(updated[0].cards, ["Aspades"]);
  assert.equal(updated[1].reviewedAt, undefined);
});
