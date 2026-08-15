import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import { evaluateFive, bestFiveOfSeven, comparePokerHands } from '../src/games/core/pokerEvaluator.js';

const byId = new Map(createDeck().map(card => [card.id, card]));
const cards = (...ids) => ids.map(id => {
  const card = byId.get(id);
  assert.ok(card, `missing card ${id}`);
  return card;
});

test('evaluateFive ranks wheel straight correctly', () => {
  const hand = evaluateFive(cards('Aspades','2hearts','3clubs','4diamonds','5spades'));
  assert.equal(hand.category, 'STRAIGHT');
  assert.equal(hand.ranks[0], 5);
});

test('evaluateFive distinguishes royal flush, quads and full house', () => {
  assert.equal(evaluateFive(cards('10spades','Jspades','Qspades','Kspades','Aspades')).category, 'STRAIGHT_FLUSH');
  assert.equal(evaluateFive(cards('9spades','9hearts','9clubs','9diamonds','Aspades')).category, 'FOUR_OF_A_KIND');
  assert.equal(evaluateFive(cards('Kspades','Khearts','Kclubs','2diamonds','2spades')).category, 'FULL_HOUSE');
});

test('comparePokerHands uses kickers and recognizes exact ties', () => {
  const acesKing = evaluateFive(cards('Aspades','Ahearts','Kclubs','7diamonds','3spades'));
  const acesQueen = evaluateFive(cards('Aclubs','Adiamonds','Qspades','7hearts','3clubs'));
  assert.equal(comparePokerHands(acesKing, acesQueen) > 0, true);
  const tieA = evaluateFive(cards('Aspades','Khearts','Qclubs','Jdiamonds','10spades'));
  const tieB = evaluateFive(cards('Ahearts','Kclubs','Qdiamonds','Jspades','10hearts'));
  assert.equal(comparePokerHands(tieA, tieB), 0);
});

test('bestFiveOfSeven chooses the best board-plus-hole combination', () => {
  const result = bestFiveOfSeven(cards('Aspades','Ahearts','Aclubs','Kdiamonds','Kspades','2clubs','3clubs'));
  assert.equal(result.category, 'FULL_HOUSE');
  assert.deepEqual(result.ranks.slice(0,2), [14,13]);
});
