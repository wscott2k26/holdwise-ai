import { createDeck, seededRandom, shuffle } from '../../lib/cards/deck.js';
import { bestFiveOfSeven, comparePokerHands } from '../core/pokerEvaluator.js';

const DEFAULTS = {
  seed: 1,
  startingStack: 1000,
  smallBlind: 10,
  bigBlind: 20,
  seats: 4,
  dealer: 0,
  humanSeat: 0,
};

const clone = (value) => structuredClone(value);
const chipTotal = (state) => state.players.reduce((sum, player) => sum + player.stack + player.contribution, 0);
const liveSeats = (state) => state.players.map((player, seat) => ({ player, seat })).filter(({ player }) => !player.folded);
const fundedSeats = (players) => players.map((player, seat) => ({ player, seat })).filter(({ player }) => player.stack > 0).map(({ seat }) => seat);

function nextSeat(players, from, predicate = (_player, _seat) => true) {
  for (let offset = 1; offset <= players.length; offset += 1) {
    const seat = (from + offset) % players.length;
    if (predicate(players[seat], seat)) return seat;
  }
  return null;
}

function nextFunded(players, from) {
  return nextSeat(players, from, (player) => player.stack > 0);
}

function nextActionable(state, from) {
  return nextSeat(state.players, from, (player) => !player.folded && !player.allIn && player.stack > 0);
}

function payChips(player, amount) {
  const paid = Math.max(0, Math.min(player.stack, Math.floor(Number(amount) || 0)));
  player.stack -= paid;
  player.bet += paid;
  player.contribution += paid;
  if (player.stack === 0) player.allIn = true;
  return paid;
}

function resetForHand(player) {
  return {
    ...player,
    hole: [],
    folded: player.stack <= 0,
    allIn: false,
    bet: 0,
    contribution: 0,
    acted: false,
    canRaise: true,
  };
}

function shuffledDeck(seed) {
  return shuffle(createDeck(), seededRandom(seed));
}

function dealHoleCards(state) {
  const activeSeats = fundedSeats(state.players);
  let first;
  if (activeSeats.length === 2) first = state.dealer;
  else first = nextFunded(state.players, state.dealer);
  const order = [];
  let seat = first;
  while (seat !== null && order.length < activeSeats.length) {
    order.push(seat);
    seat = nextFunded(state.players, seat);
    if (seat === first) break;
  }
  for (let round = 0; round < 2; round += 1) {
    for (const target of order) state.players[target].hole.push(state.deck.pop());
  }
}

function postBlind(state, seat, amount) {
  const player = state.players[seat];
  payChips(player, amount);
  player.acted = false;
  player.canRaise = true;
}

function bettingRoundComplete(state) {
  return state.players.every((player) =>
    player.folded || player.allIn || (player.acted && player.bet === state.currentBet)
  );
}

function resetStreetBets(state) {
  for (const player of state.players) {
    player.bet = 0;
    if (!player.folded && !player.allIn) {
      player.acted = false;
      player.canRaise = true;
    }
  }
  state.currentBet = 0;
  state.minRaise = state.config.bigBlind;
}

function runBoardToFive(state) {
  while (state.community.length < 5) state.community.push(state.deck.pop());
}

function activeWithChips(state) {
  return state.players.filter((player) => !player.folded && !player.allIn && player.stack > 0);
}

function firstPostflopActor(state) {
  return nextActionable(state, state.dealer);
}

function finishUncontested(state) {
  const remaining = liveSeats(state);
  if (remaining.length !== 1) return state;
  const winner = remaining[0].seat;
  const pot = state.players.reduce((sum, player) => sum + player.contribution, 0);
  state.players[winner].stack += pot;
  for (const player of state.players) {
    player.bet = 0;
    player.contribution = 0;
  }
  state.handComplete = true;
  state.street = 'complete';
  state.actor = null;
  state.winners = [winner];
  state.potResults = [{ amount: pot, winners: [winner], reason: 'uncontested' }];
  state.lastResult = { type: 'uncontested', pot, winners: [winner] };
  state.matchComplete = state.players.filter((player) => player.stack > 0).length <= 1;
  return state;
}

function awardPot(state, amount, winners) {
  const share = Math.floor(amount / winners.length);
  let remainder = amount - share * winners.length;
  for (const seat of [...winners].sort((a, b) => a - b)) {
    state.players[seat].stack += share + (remainder > 0 ? 1 : 0);
    if (remainder > 0) remainder -= 1;
  }
}

function showdownPotLevels(state) {
  return [...new Set(state.players.map((player) => player.contribution).filter((amount) => amount > 0))].sort((a, b) => a - b);
}

function settleShowdownInternal(input) {
  const state = clone(input);
  runBoardToFive(state);
  const totalBefore = chipTotal(state);
  const evaluated = new Map();
  for (let seat = 0; seat < state.players.length; seat += 1) {
    const player = state.players[seat];
    if (!player.folded) evaluated.set(seat, bestFiveOfSeven([...player.hole, ...state.community]));
  }

  const potResults = [];
  let previous = 0;
  for (const level of showdownPotLevels(state)) {
    const contributors = state.players.map((player, seat) => ({ player, seat })).filter(({ player }) => player.contribution >= level);
    const amount = (level - previous) * contributors.length;
    previous = level;
    if (amount <= 0) continue;
    const eligible = contributors.filter(({ player, seat }) => !player.folded && evaluated.has(seat));
    if (!eligible.length) continue;
    let best = eligible[0];
    let winners = [best.seat];
    for (let index = 1; index < eligible.length; index += 1) {
      const contender = eligible[index];
      const comparison = comparePokerHands(evaluated.get(contender.seat), evaluated.get(best.seat));
      if (comparison > 0) {
        best = contender;
        winners = [contender.seat];
      } else if (comparison === 0) {
        winners.push(contender.seat);
      }
    }
    awardPot(state, amount, winners);
    potResults.push({ amount, winners, level, category: evaluated.get(winners[0]).category });
  }

  for (const player of state.players) {
    player.bet = 0;
    player.contribution = 0;
  }
  state.handComplete = true;
  state.street = 'showdown';
  state.actor = null;
  state.potResults = potResults;
  state.winners = [...new Set(potResults.flatMap((pot) => pot.winners))];
  state.lastResult = {
    type: 'showdown',
    winners: state.winners,
    pots: potResults,
    hands: Object.fromEntries([...evaluated.entries()].map(([seat, hand]) => [seat, { category: hand.category, ranks: hand.ranks }]))
  };
  state.matchComplete = state.players.filter((player) => player.stack > 0).length <= 1;

  const totalAfter = state.players.reduce((sum, player) => sum + player.stack, 0);
  if (totalAfter !== totalBefore) throw new Error(`Chip conservation failure: ${totalBefore} -> ${totalAfter}`);
  return state;
}

function advanceStreet(input) {
  let state = clone(input);
  resetStreetBets(state);

  if (state.street === 'preflop') {
    state.street = 'flop';
    state.community.push(state.deck.pop(), state.deck.pop(), state.deck.pop());
  } else if (state.street === 'flop') {
    state.street = 'turn';
    state.community.push(state.deck.pop());
  } else if (state.street === 'turn') {
    state.street = 'river';
    state.community.push(state.deck.pop());
  } else if (state.street === 'river') {
    return settleShowdownInternal(state);
  }

  // If at most one player can still wager, no further betting can occur.
  // Run the remaining board and settle immediately.
  if (activeWithChips(state).length <= 1) {
    runBoardToFive(state);
    return settleShowdownInternal(state);
  }

  state.actor = firstPostflopActor(state);
  return state;
}

function prepareHand(base, { rotateDealer = false } = {}) {
  const state = clone(base);
  state.players = state.players.map(resetForHand);
  const funded = fundedSeats(state.players);
  if (funded.length <= 1) {
    state.matchComplete = true;
    state.handComplete = true;
    state.actor = null;
    state.winners = funded;
    return state;
  }

  if (rotateDealer) state.dealer = nextFunded(state.players, state.dealer);
  else if (state.players[state.dealer]?.stack <= 0) state.dealer = nextFunded(state.players, state.dealer);

  state.deck = shuffledDeck(state.config.seed + state.handNumber * 7919);
  state.community = [];
  state.street = 'preflop';
  state.handComplete = false;
  state.matchComplete = false;
  state.winners = [];
  state.potResults = [];
  state.lastResult = null;
  state.actionHistory = [];
  state.minRaise = state.config.bigBlind;

  dealHoleCards(state);

  if (funded.length === 2) {
    state.smallBlindSeat = state.dealer;
    state.bigBlindSeat = nextFunded(state.players, state.dealer);
  } else {
    state.smallBlindSeat = nextFunded(state.players, state.dealer);
    state.bigBlindSeat = nextFunded(state.players, state.smallBlindSeat);
  }
  postBlind(state, state.smallBlindSeat, state.config.smallBlind);
  postBlind(state, state.bigBlindSeat, state.config.bigBlind);
  state.currentBet = Math.max(state.players[state.smallBlindSeat].bet, state.players[state.bigBlindSeat].bet);

  state.actor = funded.length === 2 ? state.dealer : nextActionable(state, state.bigBlindSeat);
  if (state.actor === null) {
    runBoardToFive(state);
    return settleShowdownInternal(state);
  }
  return state;
}

function createGame(options = {}) {
  const config = { ...DEFAULTS, ...options };
  if (config.seats !== 4) throw new Error('This HoldWise local Hold’em mode uses four seats');
  const players = Array.from({ length: config.seats }, (_, seat) => ({
    id: seat === config.humanSeat ? 'you' : `bot-${seat}`,
    name: seat === config.humanSeat ? 'You' : `Player ${seat + 1}`,
    seat,
    isHuman: seat === config.humanSeat,
    stack: config.startingStack,
    hole: [], folded: false, allIn: false, bet: 0, contribution: 0, acted: false, canRaise: true,
  }));
  return prepareHand({
    id: 'texas-holdem',
    config,
    players,
    dealer: ((config.dealer % config.seats) + config.seats) % config.seats,
    handNumber: 1,
    deck: [], community: [], street: 'preflop', currentBet: 0, minRaise: config.bigBlind,
    smallBlindSeat: null, bigBlindSeat: null, actor: null,
    handComplete: false, matchComplete: false, winners: [], potResults: [], actionHistory: [], lastResult: null,
  });
}

function legalActions(state, actor) {
  if (state.handComplete || state.matchComplete || actor !== state.actor) return [];
  const player = state.players[actor];
  if (!player || player.folded || player.allIn || player.stack <= 0) return [];
  const toCall = Math.max(0, state.currentBet - player.bet);
  const actions = [{ type: 'fold', actor }];
  if (toCall === 0) actions.push({ type: 'check', actor });
  else actions.push({ type: 'call', actor, amount: Math.min(toCall, player.stack) });

  const maxTo = player.bet + player.stack;
  if (state.currentBet === 0) {
    if (maxTo >= state.config.bigBlind && player.canRaise) actions.push({ type: 'bet', actor, minTo: state.config.bigBlind, maxTo });
  } else if (maxTo > state.currentBet && player.canRaise) {
    const minTo = state.currentBet + state.minRaise;
    if (maxTo >= minTo) actions.push({ type: 'raise', actor, minTo, maxTo });
  }
  if (player.stack > 0) actions.push({ type: 'all-in', actor, to: maxTo });
  return actions;
}

function hasLegalType(state, actor, type) {
  return legalActions(state, actor).some((action) => action.type === type);
}

function resetAfterFullRaise(state, actor) {
  for (let seat = 0; seat < state.players.length; seat += 1) {
    if (seat === actor) continue;
    const player = state.players[seat];
    if (!player.folded && !player.allIn && player.stack > 0) {
      player.acted = false;
      player.canRaise = true;
    }
  }
}

function resetAfterShortRaise(state, actor) {
  for (let seat = 0; seat < state.players.length; seat += 1) {
    if (seat === actor) continue;
    const player = state.players[seat];
    if (!player.folded && !player.allIn && player.stack > 0 && player.bet < state.currentBet) {
      if (player.acted) player.canRaise = false;
      player.acted = false;
    }
  }
}

function applyAction(input, action) {
  const state = clone(input);
  const actor = Number(action?.actor);
  if (actor !== state.actor) throw new Error('Illegal action: it is not that seat’s turn');
  const player = state.players[actor];
  const type = action?.type;
  if (!hasLegalType(state, actor, type)) throw new Error(`Illegal ${type || 'unknown'} action`);
  const toCall = Math.max(0, state.currentBet - player.bet);
  const oldCurrentBet = state.currentBet;
  const oldMinRaise = state.minRaise;

  if (type === 'fold') {
    player.folded = true;
    player.acted = true;
    player.canRaise = false;
  } else if (type === 'check') {
    if (toCall !== 0) throw new Error('Illegal check while facing a bet');
    player.acted = true;
    player.canRaise = false;
  } else if (type === 'call') {
    payChips(player, toCall);
    player.acted = true;
    player.canRaise = false;
  } else if (type === 'bet') {
    const target = Math.floor(Number(action.to));
    const maxTo = player.bet + player.stack;
    if (!Number.isFinite(target) || target < state.config.bigBlind || target > maxTo) throw new Error('Illegal bet size');
    payChips(player, target - player.bet);
    state.currentBet = target;
    state.minRaise = target;
    player.acted = true;
    player.canRaise = false;
    resetAfterFullRaise(state, actor);
  } else if (type === 'raise') {
    const target = Math.floor(Number(action.to));
    const maxTo = player.bet + player.stack;
    const minTo = state.currentBet + state.minRaise;
    if (!Number.isFinite(target) || target < minTo || target > maxTo) throw new Error('Illegal raise size');
    payChips(player, target - player.bet);
    const raiseSize = target - state.currentBet;
    state.currentBet = target;
    state.minRaise = raiseSize;
    player.acted = true;
    player.canRaise = false;
    resetAfterFullRaise(state, actor);
  } else if (type === 'all-in') {
    const target = player.bet + player.stack;
    payChips(player, player.stack);
    if (target > oldCurrentBet) {
      const raiseSize = target - oldCurrentBet;
      state.currentBet = target;
      if (oldCurrentBet === 0 && target >= state.config.bigBlind) {
        state.minRaise = target;
        resetAfterFullRaise(state, actor);
      } else if (raiseSize >= oldMinRaise) {
        state.minRaise = raiseSize;
        resetAfterFullRaise(state, actor);
      } else {
        resetAfterShortRaise(state, actor);
      }
    }
    player.acted = true;
    player.canRaise = false;
  }

  state.actionHistory.push({ hand: state.handNumber, street: state.street, actor, type, to: action.to ?? null });

  if (liveSeats(state).length === 1) return finishUncontested(state);
  if (bettingRoundComplete(state)) return advanceStreet(state);

  state.actor = nextActionable(state, actor);
  if (state.actor === null) return advanceStreet(state);
  return state;
}

export function startNextHand(input) {
  if (!input.handComplete) throw new Error('Current Hold’em hand is not complete');
  const state = clone(input);
  state.handNumber += 1;
  return prepareHand(state, { rotateDealer: true });
}

export function chooseBotAction(state, actor, rng = Math.random) {
  const actions = legalActions(state, actor);
  if (!actions.length) throw new Error('Bot has no legal action');
  const check = actions.find((action) => action.type === 'check');
  const call = actions.find((action) => action.type === 'call');
  const raise = actions.find((action) => action.type === 'raise');
  const bet = actions.find((action) => action.type === 'bet');
  const allIn = actions.find((action) => action.type === 'all-in');
  const fold = actions.find((action) => action.type === 'fold');
  const roll = rng();

  if (check && roll < 0.72) return check;
  if ((bet || raise) && roll > 0.78) {
    const aggressive = raise || bet;
    return { ...aggressive, to: Math.min(aggressive.maxTo, aggressive.minTo) };
  }
  if (call) {
    const player = state.players[actor];
    if (call.amount <= Math.max(state.config.bigBlind * 2, Math.floor(player.stack * 0.22)) || roll > 0.32) return call;
    return fold || call;
  }
  if (check) return check;
  if (allIn && roll > 0.96) return allIn;
  return fold || allIn || actions[0];
}

export function runBotsUntilHumanTurn(input, { maxActions = 200, rng = null } = {}) {
  let state = clone(input);
  const random = rng || seededRandom(state.config.seed + state.handNumber * 3571 + state.actionHistory.length);
  let count = 0;
  while (!state.handComplete && !state.matchComplete && state.actor !== state.config.humanSeat) {
    if (count++ >= maxActions) throw new Error('Bot action guard exceeded');
    const action = chooseBotAction(state, state.actor, random);
    state = applyAction(state, action);
  }
  return state;
}

function coachFacts(state, actor = state.config.humanSeat) {
  const player = state.players[actor];
  if (!player) return [];
  const toCall = Math.max(0, state.currentBet - player.bet);
  return [
    `Street: ${state.street}`,
    `Pot: ${state.players.reduce((sum, p) => sum + p.contribution, 0)} chips`,
    `Your stack: ${player.stack} chips`,
    `Amount to call: ${toCall}`,
    `Legal actions: ${legalActions(state, actor).map((action) => action.type).join(', ') || 'none'}`,
    `Dealer seat: ${state.dealer + 1}`,
  ];
}

function result(state) {
  if (!state.handComplete && !state.matchComplete) return null;
  return state.lastResult || { type: state.matchComplete ? 'match' : 'hand', winners: state.winners };
}

export const texasHoldemEngine = {
  id: 'texas-holdem',
  createGame,
  legalActions,
  applyAction,
  isTerminal: (state) => Boolean(state.matchComplete),
  result,
  coachFacts,
  settleShowdown: settleShowdownInternal,
};

export default texasHoldemEngine;
