import assert from "node:assert/strict";
import { createDeck, Deck, validateDeck } from "../src/lib/cards/deck.js";
import { evaluateHand } from "../src/lib/cards/handEvaluator.js";
import { recommendHoldExact, clearExactStrategyCache } from "../src/lib/cards/exactStrategyEngine.js";
import { PAY_TABLES } from "../src/lib/cards/payTables.js";
import { buildDailyChallengeHands, buildDailyChallengeOptions } from "../src/lib/dailyChallenge.js";

const EXPECTED_FIVE_CARD_COUNTS = {
  ROYAL_FLUSH: 4,
  STRAIGHT_FLUSH: 36,
  FOUR_OF_A_KIND: 624,
  FULL_HOUSE: 3744,
  FLUSH: 5108,
  STRAIGHT: 10200,
  THREE_OF_A_KIND: 54912,
  TWO_PAIR: 123552,
  HIGH_PAIR: 337920,
  LOW_PAIR: 760320,
  HIGH_CARD: 1302540,
};

function auditAllFiveCardHands() {
  const deck = createDeck();
  const counts = Object.fromEntries(Object.keys(EXPECTED_FIVE_CARD_COUNTS).map((key) => [key, 0]));
  let total = 0;
  for (let a = 0; a < 48; a += 1) {
    for (let b = a + 1; b < 49; b += 1) {
      for (let c = b + 1; c < 50; c += 1) {
        for (let d = c + 1; d < 51; d += 1) {
          for (let e = d + 1; e < 52; e += 1) {
            const result = evaluateHand([deck[a], deck[b], deck[c], deck[d], deck[e]]);
            counts[result.category] += 1;
            total += 1;
          }
        }
      }
    }
  }
  assert.equal(total, 2598960);
  assert.deepEqual(counts, EXPECTED_FIVE_CARD_COUNTS);
  return { total, counts };
}

function auditDecks() {
  for (let seed = 1; seed <= 200; seed += 1) {
    const deck = new Deck(seed);
    const cards = deck.draw(52);
    assert.equal(validateDeck(cards).ok, true, `seed ${seed}`);
    assert.equal(new Set(cards.map((card) => card.id)).size, 52, `seed ${seed}`);
    assert.equal(deck.remaining(), 0, `seed ${seed}`);
  }
  return 200;
}

function auditDailyChallenges() {
  for (let day = 0; day < 365; day += 1) {
    const date = new Date(2026, 0, 1 + day, 12, 0, 0);
    const first = buildDailyChallengeHands(date, 5);
    const second = buildDailyChallengeHands(date, 5);
    assert.deepEqual(first.map((hand) => hand.map((card) => card.id)), second.map((hand) => hand.map((card) => card.id)));
    first.forEach((hand, index) => {
      assert.equal(hand.length, 5);
      assert.equal(new Set(hand.map((card) => card.id)).size, 5);
      const optionsA = buildDailyChallengeOptions(hand, date, index);
      const optionsB = buildDailyChallengeOptions(hand, date, index);
      assert.deepEqual(optionsA, optionsB);
      assert.equal(new Set(optionsA).size, 4);
      assert.ok(optionsA.includes(evaluateHand(hand).name));
    });
  }
  return 365;
}

function auditExactStrategy() {
  const deck = createDeck();
  const byId = new Map(deck.map((card) => [card.id, card]));
  const cases = [
    { ids: ["Aspades", "Kspades", "Qspades", "Jspades", "2hearts"], expected: [true, true, true, true, false] },
    { ids: ["Jhearts", "Jclubs", "4spades", "7diamonds", "9clubs"], expected: [true, true, false, false, false] },
    { ids: ["2hearts", "5clubs", "8spades", "10diamonds", "3clubs"], expected: null },
  ];
  let checks = 0;
  for (const payTable of Object.values(PAY_TABLES)) {
    clearExactStrategyCache();
    for (const sample of cases) {
      const cards = sample.ids.map((id) => byId.get(id));
      assert.equal(cards.every(Boolean), true);
      const result = recommendHoldExact(cards, payTable, { credits: 5 });
      assert.equal(result.source, "exact-enumeration");
      assert.equal(result.outcomesEvaluated, 2598960);
      assert.equal(result.holdMask.length, 5);
      assert.equal(result.alternatives.length, 3);
      assert.ok(Number.isFinite(result.expectedReturnPerCredit));
      for (let i = 1; i < result.alternatives.length; i += 1) {
        assert.ok(result.alternatives[i - 1].expectedReturnPerCredit >= result.alternatives[i].expectedReturnPerCredit - 1e-12);
      }
      if (sample.expected) assert.deepEqual(result.holdMask, sample.expected);
      checks += 1;
    }
  }
  return checks;
}

const started = Date.now();
const deckSeeds = auditDecks();
const dailyDays = auditDailyChallenges();
const allHands = auditAllFiveCardHands();
const strategyChecks = auditExactStrategy();
const elapsedMs = Date.now() - started;

console.log(JSON.stringify({
  status: "PASS",
  deckSeeds,
  dailyChallengeDays: dailyDays,
  fiveCardHands: allHands.total,
  categoryCounts: allHands.counts,
  exactStrategyChecks: strategyChecks,
  elapsedMs,
}, null, 2));
