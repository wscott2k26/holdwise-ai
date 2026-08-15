import { createDeck, seededRandom, shuffle } from '../../lib/cards/deck.js';

export const SUIT_KEYS = ['hearts','diamonds','clubs','spades'];

export function emptyFoundations() {
  return { hearts:[], diamonds:[], clubs:[], spades:[] };
}

export function shuffledStandardDeck(seed=1) {
  return shuffle(createDeck(), seededRandom(seed));
}

export function foundationCanTake(foundations, card) {
  if (!card) return false;
  const pile = foundations[card.suit] || [];
  if (!pile.length) return card.value === 14;
  return card.value === pile.at(-1).value + 1;
}

export function foundationsCount(foundations) {
  return SUIT_KEYS.reduce((sum,suit)=>sum+(foundations[suit]?.length||0),0);
}

export function pushUndo(state) {
  const snapshot = structuredClone({ ...state, undoStack:[] });
  state.undoStack = [...(state.undoStack||[]), snapshot].slice(-100);
}

export function restoreUndo(state) {
  const stack = state.undoStack || [];
  if (!stack.length) return state;
  const previous = structuredClone(stack.at(-1));
  previous.undoStack = stack.slice(0,-1);
  return previous;
}

export function uniqueShoe(cards, prefix='shoe') {
  return cards.map((card,index)=>({ ...card, shoeCardId:`${prefix}-${index}-${card.id}` }));
}

export function descendingAlternate(run=[]) {
  for(let i=1;i<run.length;i+=1){
    if(run[i-1].value !== run[i].value+1) return false;
    if(run[i-1].colorCategory === run[i].colorCategory) return false;
  }
  return true;
}
