import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import { VIDEO_POKER_VARIANTS, createVideoPokerDeck, evaluateVideoPokerHand, payoutForVideoPoker } from '../src/games/core/videoPokerEvaluator.js';
import { videoPokerEngine } from '../src/games/engines/videoPoker.js';

const standard = new Map(createDeck().map(card => [card.id, card]));
const c = (...ids) => ids.map(id => { const card=standard.get(id); assert.ok(card,id); return card; });
const joker = { id:'JOKER', rank:'JOKER', value:0, suit:'joker', label:'Joker', displaySymbol:'★', suitSymbol:'', colorCategory:'black', isWild:true };

const EXPECTED_IDS = ['jacks-or-better','bonus-poker','double-bonus-poker','double-double-bonus-poker','deuces-wild','joker-poker'];

test('six approved video poker variants have named authentic reference paytables', () => {
  assert.deepEqual(Object.keys(VIDEO_POKER_VARIANTS), EXPECTED_IDS);
  for (const id of EXPECTED_IDS) {
    const row = VIDEO_POKER_VARIANTS[id];
    assert.ok(row.name && row.payTableName && row.sourceUrl);
    assert.ok(Object.keys(row.payouts).length >= 9);
  }
});

test('Bonus Poker differentiates aces, low quads and 5-K quads', () => {
  assert.equal(evaluateVideoPokerHand(c('Aspades','Ahearts','Aclubs','Adiamonds','Kspades'),'bonus-poker').category,'FOUR_ACES');
  assert.equal(evaluateVideoPokerHand(c('3spades','3hearts','3clubs','3diamonds','Kspades'),'bonus-poker').category,'FOUR_2_4');
  assert.equal(evaluateVideoPokerHand(c('9spades','9hearts','9clubs','9diamonds','Aspades'),'bonus-poker').category,'FOUR_5_K');
});

test('Double Double Bonus recognizes premium kicker quads', () => {
  assert.equal(evaluateVideoPokerHand(c('Aspades','Ahearts','Aclubs','Adiamonds','2spades'),'double-double-bonus-poker').category,'FOUR_ACES_KICKER');
  assert.equal(evaluateVideoPokerHand(c('3spades','3hearts','3clubs','3diamonds','Aspades'),'double-double-bonus-poker').category,'FOUR_2_4_KICKER');
});

test('Full Pay Deuces Wild recognizes natural royal, four deuces and five of a kind', () => {
  assert.equal(evaluateVideoPokerHand(c('10spades','Jspades','Qspades','Kspades','Aspades'),'deuces-wild').category,'NATURAL_ROYAL');
  assert.equal(evaluateVideoPokerHand(c('2spades','2hearts','2clubs','2diamonds','Aspades'),'deuces-wild').category,'FOUR_DEUCES');
  assert.equal(evaluateVideoPokerHand(c('2spades','2hearts','7clubs','7diamonds','7spades'),'deuces-wild').category,'FIVE_OF_A_KIND');
});

test('Joker Poker uses a 53-card deck and recognizes natural/wild hands and Kings-or-better threshold', () => {
  const deck = createVideoPokerDeck('joker-poker');
  assert.equal(deck.length,53);
  assert.equal(deck.filter(card=>card.isWild).length,1);
  assert.equal(evaluateVideoPokerHand([...c('10spades','Jspades','Qspades','Kspades'),joker],'joker-poker').category,'WILD_ROYAL');
  assert.equal(evaluateVideoPokerHand([...c('Kspades','Khearts','4clubs','7diamonds'),joker].slice(0,5),'joker-poker').category,'THREE_OF_A_KIND');
  assert.equal(evaluateVideoPokerHand(c('Kspades','Khearts','4clubs','7diamonds','9spades'),'joker-poker').category,'KINGS_OR_BETTER');
  assert.equal(evaluateVideoPokerHand(c('Qspades','Qhearts','4clubs','7diamonds','9spades'),'joker-poker').category,'NOTHING');
});

test('selected paytables pay reference-category amounts at five credits', () => {
  assert.equal(payoutForVideoPoker('bonus-poker','FOUR_ACES',5),400);
  assert.equal(payoutForVideoPoker('double-bonus-poker','FOUR_ACES',5),800);
  assert.equal(payoutForVideoPoker('double-double-bonus-poker','FOUR_ACES_KICKER',5),2000);
  assert.equal(payoutForVideoPoker('deuces-wild','FOUR_DEUCES',5),1000);
  assert.equal(payoutForVideoPoker('joker-poker','FIVE_OF_A_KIND',5),1000);
});

test('videoPokerEngine plays a complete bet-deal-hold-draw-payout-new-hand loop for every variant', () => {
  for (const id of EXPECTED_IDS) {
    let state = videoPokerEngine.createGame({ variantId:id, seed:100 + EXPECTED_IDS.indexOf(id), bankroll:500 });
    assert.equal(state.phase,'bet');
    state = videoPokerEngine.applyAction(state,{type:'set-credits',credits:5});
    state = videoPokerEngine.applyAction(state,{type:'deal'});
    assert.equal(state.hand.length,5);
    assert.equal(state.phase,'hold');
    state = videoPokerEngine.applyAction(state,{type:'toggle-hold',index:0});
    state = videoPokerEngine.applyAction(state,{type:'draw'});
    assert.equal(state.phase,'result');
    assert.equal(state.hand.length,5);
    assert.ok(state.result?.category);
    state = videoPokerEngine.applyAction(state,{type:'new-hand'});
    assert.equal(state.phase,'bet');
  }
});

test('wild variants explicitly refuse to label standard Jacks strategy as exact', () => {
  for (const id of ['deuces-wild','joker-poker']) {
    const state = videoPokerEngine.createGame({variantId:id,seed:9});
    const facts = videoPokerEngine.coachFacts(state);
    assert.ok(facts.some(f=>/wild|variant/i.test(f)));
    assert.equal(facts.some(f=>/Jacks exact/i.test(f)),false);
  }
});
