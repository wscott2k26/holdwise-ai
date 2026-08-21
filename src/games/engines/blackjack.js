import { createDeck, seededRandom, shuffle } from '../../lib/cards/deck.js';

const DEFAULT_RULES = {
  decks: 6,
  dealerHitsSoft17: false,
  blackjackPayout: 1.5,
  allowDoubleAfterSplit: true,
  maxSplitHands: 4,
  splitAcesOneCard: true,
  insurance: true,
  reshuffleAt: 60,
};

const clone = value => structuredClone(value);

export function blackjackValue(cards = []) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.value === 14) { total += 11; aces += 1; }
    else total += Math.min(10, card.value);
  }
  while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
  const soft = aces > 0;
  return {
    total,
    soft,
    blackjack: cards.length === 2 && total === 21,
    bust: total > 21,
  };
}

export function createBlackjackShoe({ decks = 6, seed = 1 } = {}) {
  const cards = [];
  for (let deckIndex = 0; deckIndex < decks; deckIndex += 1) {
    for (const card of createDeck()) cards.push({ ...card, shoeCardId: `${deckIndex}-${card.id}` });
  }
  return shuffle(cards, seededRandom(seed));
}

function draw(state) {
  if (!state.shoe.length) throw new Error('Blackjack shoe is empty');
  return state.shoe.shift();
}

function newHand(cards, wager, { fromSplit = false, splitAces = false } = {}) {
  return {
    cards,
    wager,
    stood: false,
    doubled: false,
    fromSplit,
    splitAces,
    result: null,
    payout: 0,
  };
}

function activeHand(state) {
  return state.hands[state.activeHand] || null;
}

function isNatural(hand) {
  return !hand.fromSplit && blackjackValue(hand.cards).blackjack;
}

function settleMain(state, hand, result, payout) {
  hand.result = result;
  hand.stood = true;
  hand.payout = payout;
  state.bankroll += payout;
}

function finishRound(state) {
  state.phase = 'result';
  state.activeHand = -1;
  state.roundResult = {
    hands: state.hands.map(hand => ({ result: hand.result, wager: hand.wager, payout: hand.payout, total: blackjackValue(hand.cards).total })),
    dealer: blackjackValue(state.dealer.cards),
    insurance: { ...state.insurance },
  };
  return state;
}

function settleDealerBlackjack(state) {
  state.dealer.blackjack = true;
  for (const hand of state.hands) {
    if (isNatural(hand)) settleMain(state, hand, 'push', hand.wager);
    else settleMain(state, hand, 'loss', 0);
  }
  return finishRound(state);
}

function settlePlayerNatural(state) {
  const hand = state.hands[0];
  if (!isNatural(hand)) return state;
  const payout = hand.wager * (1 + state.rules.blackjackPayout);
  settleMain(state, hand, 'blackjack', payout);
  return finishRound(state);
}

function dealerShouldHit(state) {
  const value = blackjackValue(state.dealer.cards);
  if (value.total < 17) return true;
  if (value.total > 17) return false;
  return value.soft && state.rules.dealerHitsSoft17;
}

function dealerPlayAndSettle(state) {
  const playable = state.hands.some(hand => !blackjackValue(hand.cards).bust);
  if (playable) while (dealerShouldHit(state)) state.dealer.cards.push(draw(state));
  const dealerValue = blackjackValue(state.dealer.cards);

  for (const hand of state.hands) {
    if (hand.result) continue;
    const value = blackjackValue(hand.cards);
    if (value.bust) settleMain(state, hand, 'bust', 0);
    else if (dealerValue.bust) settleMain(state, hand, 'win', hand.wager * 2);
    else if (value.total > dealerValue.total) settleMain(state, hand, 'win', hand.wager * 2);
    else if (value.total < dealerValue.total) settleMain(state, hand, 'loss', 0);
    else settleMain(state, hand, 'push', hand.wager);
  }
  return finishRound(state);
}

function advanceHand(state) {
  for (let index = state.activeHand + 1; index < state.hands.length; index += 1) {
    const hand = state.hands[index];
    if (!hand.stood && !blackjackValue(hand.cards).bust) {
      state.activeHand = index;
      return state;
    }
  }
  return dealerPlayAndSettle(state);
}

function peekAfterInsurance(state) {
  const dealerValue = blackjackValue(state.dealer.cards);
  state.dealer.blackjack = dealerValue.blackjack;
  if (dealerValue.blackjack) return settleDealerBlackjack(state);
  if (isNatural(state.hands[0])) return settlePlayerNatural(state);
  state.phase = 'player';
  state.activeHand = 0;
  return state;
}

function createGame(options = {}) {
  const rules = { ...DEFAULT_RULES, ...(options.rules || {}) };
  if (options.reshuffleAt !== undefined) rules.reshuffleAt = Number(options.reshuffleAt);
  const seed = Number(options.seed ?? 1);
  const forcedShoe = Array.isArray(options.forcedShoe) ? options.forcedShoe.map(card => ({ ...card })) : null;
  return {
    id: 'blackjack',
    seed,
    rules,
    bankroll: Number(options.bankroll ?? 500),
    bet: Number(options.bet ?? 10),
    phase: 'bet',
    roundNumber: 1,
    shoeId: 1,
    shoe: forcedShoe || createBlackjackShoe({ decks: rules.decks, seed }),
    forcedShoe: Boolean(forcedShoe),
    hands: [],
    activeHand: -1,
    dealer: { cards: [], blackjack: false },
    insurance: { offered: false, wager: 0, result: null, payout: 0 },
    roundResult: null,
  };
}

/** @returns {any[]} */
function legalActions(state) {
  if (state.phase === 'bet') {
    const actions = [{ type: 'set-bet', min: 1, max: Math.max(1, state.bankroll) }];
    if (state.bankroll >= state.bet && state.bet > 0) actions.push({ type: 'deal' });
    return actions;
  }
  if (state.phase === 'insurance') {
    const actions = [{ type: 'decline-insurance' }];
    const wager = state.hands[0]?.wager / 2;
    if (state.rules.insurance && state.bankroll >= wager) actions.push({ type: 'take-insurance', amount: wager });
    return actions;
  }
  if (state.phase === 'result') return [{ type: 'new-round' }];
  if (state.phase !== 'player') return [];
  const hand = activeHand(state);
  if (!hand || hand.stood || blackjackValue(hand.cards).bust) return [];
  const actions = [{ type: 'hit' }, { type: 'stand' }];
  if (hand.cards.length === 2 && state.bankroll >= hand.wager && (!hand.fromSplit || state.rules.allowDoubleAfterSplit)) actions.push({ type: 'double' });
  if (
    hand.cards.length === 2 &&
    hand.cards[0].rank === hand.cards[1].rank &&
    state.hands.length < state.rules.maxSplitHands &&
    state.bankroll >= hand.wager
  ) actions.push({ type: 'split' });
  return actions;
}

function assertLegal(state, type) {
  if (!legalActions(state).some(action => action.type === type)) throw new Error(`Illegal blackjack action: ${type}`);
}

function applyAction(input, action) {
  const state = clone(input);
  const type = action?.type;
  if (!type) throw new Error('Blackjack action type is required');
  assertLegal(state, type);

  if (type === 'set-bet') {
    const amount = Math.floor(Number(action.amount));
    if (!Number.isFinite(amount) || amount < 1 || amount > state.bankroll) throw new Error('Illegal blackjack bet');
    state.bet = amount;
    return state;
  }

  if (type === 'deal') {
    state.bankroll -= state.bet;
    const playerFirst = draw(state);
    const dealerUp = draw(state);
    const playerSecond = draw(state);
    const dealerHole = draw(state);
    state.hands = [newHand([playerFirst, playerSecond], state.bet)];
    state.activeHand = 0;
    state.dealer = { cards: [dealerUp, dealerHole], blackjack: false };
    state.insurance = { offered: false, wager: 0, result: null, payout: 0 };
    state.roundResult = null;

    const upValue = dealerUp.value === 14 ? 11 : Math.min(10, dealerUp.value);
    if (upValue === 11 && state.rules.insurance) {
      state.phase = 'insurance';
      state.insurance.offered = true;
      return state;
    }
    if (upValue === 10 && blackjackValue(state.dealer.cards).blackjack) return settleDealerBlackjack(state);
    if (isNatural(state.hands[0])) return settlePlayerNatural(state);
    state.phase = 'player';
    return state;
  }

  if (type === 'take-insurance') {
    const wager = state.hands[0].wager / 2;
    state.bankroll -= wager;
    state.insurance.wager = wager;
    if (blackjackValue(state.dealer.cards).blackjack) {
      state.insurance.result = 'win';
      state.insurance.payout = wager * 3;
      state.bankroll += state.insurance.payout;
    } else {
      state.insurance.result = 'loss';
      state.insurance.payout = 0;
    }
    return peekAfterInsurance(state);
  }

  if (type === 'decline-insurance') {
    state.insurance.result = 'declined';
    return peekAfterInsurance(state);
  }

  const hand = activeHand(state);
  if (type === 'hit') {
    hand.cards.push(draw(state));
    const value = blackjackValue(hand.cards);
    if (value.bust) {
      hand.result = 'bust';
      hand.stood = true;
      hand.payout = 0;
      return advanceHand(state);
    }
    if (value.total === 21) {
      hand.stood = true;
      return advanceHand(state);
    }
    return state;
  }

  if (type === 'stand') {
    hand.stood = true;
    return advanceHand(state);
  }

  if (type === 'double') {
    state.bankroll -= hand.wager;
    hand.wager *= 2;
    hand.doubled = true;
    hand.cards.push(draw(state));
    const value = blackjackValue(hand.cards);
    hand.stood = true;
    if (value.bust) { hand.result = 'bust'; hand.payout = 0; }
    return advanceHand(state);
  }

  if (type === 'split') {
    const [left, right] = hand.cards;
    state.bankroll -= hand.wager;
    const splitAces = left.value === 14;
    const first = newHand([left, draw(state)], hand.wager, { fromSplit: true, splitAces });
    const second = newHand([right, draw(state)], hand.wager, { fromSplit: true, splitAces });
    if (splitAces && state.rules.splitAcesOneCard) {
      first.stood = true;
      second.stood = true;
    }
    state.hands.splice(state.activeHand, 1, first, second);
    if (splitAces && state.rules.splitAcesOneCard) return dealerPlayAndSettle(state);
    state.activeHand = Math.min(state.activeHand, state.hands.length - 1);
    if (blackjackValue(state.hands[state.activeHand].cards).total === 21) {
      state.hands[state.activeHand].stood = true;
      return advanceHand(state);
    }
    return state;
  }

  if (type === 'new-round') {
    state.roundNumber += 1;
    state.phase = 'bet';
    state.hands = [];
    state.activeHand = -1;
    state.dealer = { cards: [], blackjack: false };
    state.insurance = { offered: false, wager: 0, result: null, payout: 0 };
    state.roundResult = null;
    if (state.shoe.length < state.rules.reshuffleAt) {
      state.shoeId += 1;
      state.forcedShoe = false;
      state.shoe = createBlackjackShoe({ decks: state.rules.decks, seed: state.seed + state.shoeId * 7919 });
    }
    return state;
  }

  throw new Error(`Unknown blackjack action: ${type}`);
}

export function basicStrategyAdvice(state) {
  const legal = legalActions(state);
  if (!legal.length) return null;
  if (state.phase === 'insurance') return { action: 'decline-insurance', reason: 'Insurance is usually a separate negative-expectation side bet when you are not using a validated card count.' };
  if (state.phase !== 'player') return { action: legal[0].type, reason: 'Use the currently available table action to continue the round.' };

  const hand = activeHand(state);
  const value = blackjackValue(hand.cards);
  const dealerUp = state.dealer.cards[0];
  const dealer = dealerUp.value === 14 ? 11 : Math.min(10, dealerUp.value);
  const has = type => legal.some(action => action.type === type);

  if (has('split') && [14, 8].includes(hand.cards[0].value)) return { action: 'split', reason: 'Pairs of Aces and Eights are standard high-priority splits under this S17 table rule set.' };
  if (has('double') && value.total === 11) return { action: 'double', reason: 'Eleven is a strong doubling total because many ten-value cards make 21 and the dealer is still constrained by fixed drawing rules.' };
  if (value.soft && value.total <= 17) return { action: 'hit', reason: 'This soft total can take another card without an immediate bust, so drawing is the legal pressure play here.' };
  if (value.total >= 17) return { action: 'stand', reason: 'A hard total of 17 or more is normally strong enough to stand against the dealer rather than risk busting.' };
  if (value.total >= 12 && value.total <= 16 && dealer >= 2 && dealer <= 6) return { action: 'stand', reason: 'The dealer shows a weak 2–6 upcard, so standing lets the dealer face the higher bust risk.' };
  return { action: 'hit', reason: 'Against this dealer upcard, improving the current total is preferable to standing on a weak hand.' };
}

function coachFacts(state) {
  const facts = [
    `Table: ${state.rules.decks}-deck ${state.rules.dealerHitsSoft17 ? 'H17' : 'S17'}, blackjack pays 3:2.`,
    `Bankroll: ${state.bankroll}; base bet: ${state.bet}.`,
  ];
  if (state.phase === 'player') {
    const hand = activeHand(state);
    const value = blackjackValue(hand.cards);
    facts.push(`Your active hand is ${value.soft ? 'soft ' : ''}${value.total}.`);
    facts.push(`Dealer upcard: ${state.dealer.cards[0]?.label || 'unknown'}.`);
    const advice = basicStrategyAdvice(state);
    if (advice) facts.push(`Coach action: ${advice.action}. ${advice.reason}`);
  }
  if (state.phase === 'insurance') facts.push('Insurance is available because the dealer shows an Ace; the dealer hole card has not been resolved yet.');
  if (state.phase === 'result') facts.push(`Round complete: ${state.hands.map(hand => hand.result).join(', ')}.`);
  return facts;
}

export const blackjackEngine = {
  id: 'blackjack',
  createGame,
  legalActions,
  applyAction,
  isTerminal: state => state.bankroll <= 0 && state.phase === 'result',
  result: state => state.roundResult,
  coachFacts,
};

export default blackjackEngine;
