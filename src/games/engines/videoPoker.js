import { seededRandom, shuffle } from '../../lib/cards/deck.js';
import { VIDEO_POKER_VARIANTS, createVideoPokerDeck, evaluateVideoPokerHand, payoutForVideoPoker } from '../core/videoPokerEvaluator.js';

const clone = value => structuredClone(value);

function newDeck(variantId, seed) {
  return shuffle(createVideoPokerDeck(variantId), seededRandom(seed));
}

function createGame(options={}) {
  const variantId = options.variantId || 'jacks-or-better';
  if (!VIDEO_POKER_VARIANTS[variantId]) throw new Error(`Unknown video poker variant: ${variantId}`);
  return {
    id:variantId,
    variantId,
    seed:Number(options.seed ?? 1),
    handNumber:1,
    bankroll:Number(options.bankroll ?? 500),
    credits:1,
    phase:'bet',
    deck:[],
    hand:[],
    holdMask:[false,false,false,false,false],
    result:null,
    wager:0,
    history:[],
  };
}

function legalActions(state) {
  if (state.phase === 'bet') return [
    {type:'set-credits',min:1,max:5},
    ...(state.bankroll >= state.credits ? [{type:'deal'}] : []),
  ];
  if (state.phase === 'hold') return [
    ...state.hand.map((_,index)=>({type:'toggle-hold',index})),
    {type:'draw'},
  ];
  if (state.phase === 'result') return [{type:'new-hand'}];
  return [];
}

function applyAction(input, action) {
  const state = clone(input);
  if (!action?.type) throw new Error('Video poker action type is required');
  if (action.type === 'set-credits') {
    if (state.phase !== 'bet') throw new Error('Credits can only change before a deal');
    const credits = Math.floor(Number(action.credits));
    if (credits < 1 || credits > 5) throw new Error('Credits must be 1 through 5');
    state.credits = credits;
    return state;
  }
  if (action.type === 'deal') {
    if (state.phase !== 'bet') throw new Error('Deal is illegal now');
    if (state.bankroll < state.credits) throw new Error('Not enough bankroll for that wager');
    state.bankroll -= state.credits;
    state.wager = state.credits;
    state.deck = newDeck(state.variantId, state.seed + state.handNumber * 1009);
    state.hand = state.deck.splice(-5);
    state.holdMask = [false,false,false,false,false];
    state.result = null;
    state.phase = 'hold';
    return state;
  }
  if (action.type === 'toggle-hold') {
    if (state.phase !== 'hold') throw new Error('Hold selection is illegal now');
    const index = Number(action.index);
    if (!Number.isInteger(index) || index < 0 || index >= 5) throw new Error('Invalid hold index');
    state.holdMask[index] = !state.holdMask[index];
    return state;
  }
  if (action.type === 'draw') {
    if (state.phase !== 'hold') throw new Error('Draw is illegal now');
    for (let index=0; index<5; index+=1) {
      if (!state.holdMask[index]) {
        const card = state.deck.pop();
        if (!card) throw new Error('Video poker deck exhausted');
        state.hand[index] = card;
      }
    }
    const evaluated = evaluateVideoPokerHand(state.hand,state.variantId);
    const payout = payoutForVideoPoker(state.variantId,evaluated.category,state.credits);
    state.bankroll += payout;
    state.result = { ...evaluated, payout, credits:state.credits, net:payout-state.wager };
    state.history.push({ handNumber:state.handNumber, variantId:state.variantId, result:state.result, cards:state.hand.map(card=>card.id) });
    state.phase = 'result';
    return state;
  }
  if (action.type === 'new-hand') {
    if (state.phase !== 'result') throw new Error('Finish the current hand first');
    state.handNumber += 1;
    state.phase = 'bet';
    state.deck=[]; state.hand=[]; state.holdMask=[false,false,false,false,false]; state.result=null; state.wager=0;
    if (state.bankroll <= 0) state.bankroll = Number(action.rebuy ?? 500);
    return state;
  }
  throw new Error(`Unknown video poker action: ${action.type}`);
}

function coachFacts(state) {
  const variant = VIDEO_POKER_VARIANTS[state.variantId];
  const facts = [
    `${variant.name} — ${variant.payTableName}`,
    `Bankroll: ${state.bankroll} credits`,
    `Bet: ${state.credits} credit${state.credits===1?'':'s'}`,
  ];
  if (variant.wild) facts.push(`${variant.name} uses variant-specific wild-card rules; HoldWise will not label standard Jacks strategy as exact here.`);
  else if (state.variantId === 'jacks-or-better') facts.push('Jacks or Better keeps the existing exact 32-hold enumeration coaching engine.');
  else facts.push('This bonus variant uses its own quad-sensitive payout categories and strategy must be evaluated against this selected paytable.');
  if (state.result) facts.push(`Last result: ${state.result.name}; paid ${state.result.payout} credits.`);
  return facts;
}

export const videoPokerEngine = {
  id:'video-poker', createGame, legalActions, applyAction,
  isTerminal: state => state.bankroll <= 0 && state.phase === 'result',
  result: state => state.result,
  coachFacts,
};

export default videoPokerEngine;
