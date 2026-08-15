import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import {
  blackjackEngine,
  blackjackValue,
  createBlackjackShoe,
  basicStrategyAdvice,
} from '../src/games/engines/blackjack.js';

const byId = new Map(createDeck().map(card => [card.id, card]));
const forced = (...ids) => ids.map(id => {
  const card = byId.get(id);
  assert.ok(card, `missing card ${id}`);
  return { ...card };
});

function deal(ids, options = {}) {
  let state = blackjackEngine.createGame({ seed: 77, bankroll: 500, forcedShoe: forced(...ids), ...options });
  state = blackjackEngine.applyAction(state, { type:'set-bet', amount:10 });
  return blackjackEngine.applyAction(state, { type:'deal' });
}

test('blackjackValue handles hard and soft aces', () => {
  assert.deepEqual(blackjackValue(forced('Aspades','6hearts')), { total:17, soft:true, blackjack:false, bust:false });
  assert.deepEqual(blackjackValue(forced('Aspades','6hearts','Kclubs')), { total:17, soft:false, blackjack:false, bust:false });
  assert.equal(blackjackValue(forced('Kspades','Qhearts','2clubs')).bust, true);
});

test('default game uses a six-deck 312-card shoe and starts in betting phase', () => {
  const shoe = createBlackjackShoe({ decks:6, seed:3 });
  assert.equal(shoe.length, 312);
  const state = blackjackEngine.createGame({ seed:3 });
  assert.equal(state.rules.decks, 6);
  assert.equal(state.rules.dealerHitsSoft17, false);
  assert.equal(state.phase, 'bet');
});

test('natural blackjack pays 3:2 and ends the round after dealer peek clears', () => {
  const state = deal(['Aspades','9clubs','Khearts','7diamonds']);
  assert.equal(state.phase, 'result');
  assert.equal(state.hands[0].result, 'blackjack');
  assert.equal(state.bankroll, 515);
});

test('dealer stands on soft 17 by default and normal win returns 1:1 profit', () => {
  let state = deal(['10spades','6clubs','8hearts','Adiamonds']);
  assert.equal(state.phase, 'player');
  state = blackjackEngine.applyAction(state, { type:'stand' });
  assert.equal(state.phase, 'result');
  assert.equal(blackjackValue(state.dealer.cards).total, 17);
  assert.equal(state.hands[0].result, 'win');
  assert.equal(state.bankroll, 510);
});

test('double is legal only on a two-card active hand, doubles wager, draws one and stands', () => {
  let state = deal(['5spades','6clubs','6hearts','10diamonds','Kclubs','8spades']);
  const actions = blackjackEngine.legalActions(state);
  assert.ok(actions.some(action => action.type === 'double'));
  state = blackjackEngine.applyAction(state, { type:'double' });
  assert.equal(state.hands[0].wager, 20);
  assert.equal(state.hands[0].cards.length, 3);
  assert.equal(state.hands[0].stood, true);
  assert.equal(state.phase, 'result');
});

test('split matching ranks creates two funded hands and both remain real playable hands', () => {
  let state = deal(['8spades','6clubs','8hearts','10diamonds','Kclubs','3spades','4hearts','7clubs']);
  assert.ok(blackjackEngine.legalActions(state).some(action => action.type === 'split'));
  state = blackjackEngine.applyAction(state, { type:'split' });
  assert.equal(state.hands.length, 2);
  assert.deepEqual(state.hands.map(hand => hand.wager), [10,10]);
  assert.equal(state.bankroll, 480);
  assert.equal(state.hands.every(hand => hand.cards.length === 2), true);
  assert.equal(state.phase, 'player');
});

test('split aces receive one card each and auto-stand before dealer resolution', () => {
  let state = deal(['Aspades','9clubs','Ahearts','7diamonds','5clubs','6spades','10hearts']);
  state = blackjackEngine.applyAction(state, { type:'split' });
  assert.equal(state.hands.length, 2);
  assert.equal(state.hands.every(hand => hand.splitAces && hand.stood && hand.cards.length === 2), true);
  assert.equal(state.phase, 'result');
});

test('insurance is offered only against dealer Ace and pays 2:1 when dealer has blackjack', () => {
  let state = deal(['10spades','Aspades','8hearts','Kdiamonds']);
  assert.equal(state.phase, 'insurance');
  assert.deepEqual(blackjackEngine.legalActions(state).map(action=>action.type).sort(), ['decline-insurance','take-insurance']);
  state = blackjackEngine.applyAction(state, { type:'take-insurance' });
  assert.equal(state.phase, 'result');
  assert.equal(state.dealer.blackjack, true);
  assert.equal(state.insurance.result, 'win');
  assert.equal(state.bankroll, 500);
});

test('dealer ten-value upcard peeks for blackjack before player decisions', () => {
  const state = deal(['9spades','Kclubs','9hearts','Adiamonds']);
  assert.equal(state.phase, 'result');
  assert.equal(state.dealer.blackjack, true);
  assert.equal(state.hands[0].result, 'loss');
});

test('hit can bust, stand can push, and illegal actions are rejected', () => {
  let bust = deal(['Kspades','6clubs','6hearts','9diamonds','Qclubs']);
  bust = blackjackEngine.applyAction(bust, { type:'hit' });
  assert.equal(bust.hands[0].result, 'bust');
  assert.equal(bust.phase, 'result');

  let push = deal(['10spades','10clubs','8hearts','8diamonds']);
  push = blackjackEngine.applyAction(push, { type:'stand' });
  assert.equal(push.hands[0].result, 'push');
  assert.equal(push.bankroll, 500);
  assert.throws(() => blackjackEngine.applyAction(push,{type:'hit'}), /illegal|round/i);
});

test('new round preserves bankroll/bet and reshuffles when shoe is below threshold', () => {
  let state = deal(['Aspades','9clubs','Khearts','7diamonds'], { reshuffleAt:310 });
  const bankroll = state.bankroll;
  const shoeId = state.shoeId;
  state = blackjackEngine.applyAction(state, { type:'new-round' });
  assert.equal(state.phase, 'bet');
  assert.equal(state.bet, 10);
  assert.equal(state.bankroll, bankroll);
  assert.ok(state.shoeId > shoeId);
  assert.equal(state.shoe.length, 312);
});

test('basic strategy coaching always recommends a currently legal action', () => {
  const state = deal(['10spades','6clubs','6hearts','10diamonds']);
  const advice = basicStrategyAdvice(state);
  assert.ok(advice?.action);
  assert.ok(blackjackEngine.legalActions(state).some(action => action.type === advice.action));
  assert.ok(advice.reason.length > 10);
});
