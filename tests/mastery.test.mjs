import test from "node:test";
import assert from "node:assert/strict";
import { buildMasterySnapshot } from "../src/lib/mastery.js";

const practice = {
  total: 10,
  correct: 7,
  byCategory: { "high-pair": { total: 4, correct: 4 }, "low-pair": { total: 4, correct: 1 } },
  byPayTable: { "job-9-6": { total: 8, correct: 6 }, "job-8-5": { total: 2, correct: 1 } },
  recent: [{ correct: true }, { correct: false }, { correct: true }, { correct: true }],
};

test("mastery snapshot reuses existing educational metrics deterministically", () => {
  const result = buildMasterySnapshot({ profile: { streak: 5 }, practice, mistakes: [{ category: "low-pair" }, { category: "low-pair" }], lessonsDone: 12 });
  assert.equal(result.accuracyPct, 70);
  assert.equal(result.streakDays, 5);
  assert.equal(result.totalDecisions, 10);
  assert.equal(result.reviewCount, 2);
  assert.equal(result.recentAccuracyPct, 75);
  assert.equal(result.strongest.category, "high-pair");
  assert.equal(result.weakest.category, "low-pair");
  assert.equal(result.bestPayTableId, "job-9-6");
  assert.equal(result.recommendedFocus, "Low Pair");
  assert.equal(result.masteryPct, 38);
});

test("mastery snapshot stays useful before enough practice exists", () => {
  const result = buildMasterySnapshot({ profile: { streak: 0 }, practice: { total: 0, correct: 0, byCategory: {}, byPayTable: {}, recent: [] }, mistakes: [], lessonsDone: 0 });
  assert.equal(result.accuracyPct, 0);
  assert.equal(result.masteryPct, 0);
  assert.equal(result.strongest, null);
  assert.equal(result.weakest, null);
  assert.equal(result.recommendedFocus, "Complete more practice hands");
});
