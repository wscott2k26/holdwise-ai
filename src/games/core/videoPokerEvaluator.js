import { createDeck } from '../../lib/cards/deck.js';
import { evaluateHand } from '../../lib/cards/handEvaluator.js';

const scale = (value) => [1,2,3,4,5].map(credits => value * credits);
const royal = [250,500,750,1000,4000];

export const VIDEO_POKER_VARIANTS = {
  'jacks-or-better': {
    id:'jacks-or-better', name:'Jacks or Better', payTableName:'9/6 Full Pay', sourceUrl:'https://wizardofodds.com/games/video-poker/tables/jacks-or-better/', wild:false,
    payouts:{ ROYAL_FLUSH:royal, STRAIGHT_FLUSH:scale(50), FOUR_OF_A_KIND:scale(25), FULL_HOUSE:scale(9), FLUSH:scale(6), STRAIGHT:scale(4), THREE_OF_A_KIND:scale(3), TWO_PAIR:scale(2), HIGH_PAIR:scale(1) }
  },
  'bonus-poker': {
    id:'bonus-poker', name:'Bonus Poker', payTableName:'8/5 Bonus Poker', sourceUrl:'https://wizardofodds.com/games/video-poker/tables/bonus-poker/', wild:false,
    payouts:{ ROYAL_FLUSH:royal, STRAIGHT_FLUSH:scale(50), FOUR_ACES:scale(80), FOUR_2_4:scale(40), FOUR_5_K:scale(25), FULL_HOUSE:scale(8), FLUSH:scale(5), STRAIGHT:scale(4), THREE_OF_A_KIND:scale(3), TWO_PAIR:scale(2), HIGH_PAIR:scale(1) }
  },
  'double-bonus-poker': {
    id:'double-bonus-poker', name:'Double Bonus Poker', payTableName:'10/7 Double Bonus', sourceUrl:'https://wizardofodds.com/games/video-poker/tables/double-bonus/', wild:false,
    payouts:{ ROYAL_FLUSH:royal, STRAIGHT_FLUSH:scale(50), FOUR_ACES:scale(160), FOUR_2_4:scale(80), FOUR_5_K:scale(50), FULL_HOUSE:scale(10), FLUSH:scale(7), STRAIGHT:scale(5), THREE_OF_A_KIND:scale(3), TWO_PAIR:scale(1), HIGH_PAIR:scale(1) }
  },
  'double-double-bonus-poker': {
    id:'double-double-bonus-poker', name:'Double Double Bonus Poker', payTableName:'9/6 Double Double Bonus', sourceUrl:'https://wizardofodds.com/games/video-poker/strategy/double-double-bonus/9-6/', wild:false,
    payouts:{ ROYAL_FLUSH:royal, STRAIGHT_FLUSH:scale(50), FOUR_ACES_KICKER:scale(400), FOUR_2_4_KICKER:scale(160), FOUR_ACES:scale(160), FOUR_2_4:scale(80), FOUR_5_K:scale(50), FULL_HOUSE:scale(9), FLUSH:scale(6), STRAIGHT:scale(4), THREE_OF_A_KIND:scale(3), TWO_PAIR:scale(1), HIGH_PAIR:scale(1) }
  },
  'deuces-wild': {
    id:'deuces-wild', name:'Deuces Wild', payTableName:'Full Pay Deuces Wild', sourceUrl:'https://wizardofodds.com/games/video-poker/tables/deuces-wild/', wild:true,
    payouts:{ NATURAL_ROYAL:royal, FOUR_DEUCES:scale(200), WILD_ROYAL:scale(25), FIVE_OF_A_KIND:scale(15), STRAIGHT_FLUSH:scale(9), FOUR_OF_A_KIND:scale(5), FULL_HOUSE:scale(3), FLUSH:scale(2), STRAIGHT:scale(2), THREE_OF_A_KIND:scale(1) }
  },
  'joker-poker': {
    id:'joker-poker', name:'Joker Poker', payTableName:'Kings or Better 100.64%', sourceUrl:'https://wizardofodds.com/games/video-poker/tables/joker-poker-kings-or-better/', wild:true,
    payouts:{ NATURAL_ROYAL:royal, FIVE_OF_A_KIND:scale(200), WILD_ROYAL:scale(100), STRAIGHT_FLUSH:scale(50), FOUR_OF_A_KIND:scale(20), FULL_HOUSE:scale(7), FLUSH:scale(5), STRAIGHT:scale(3), THREE_OF_A_KIND:scale(2), TWO_PAIR:scale(1), KINGS_OR_BETTER:scale(1) }
  },
};

const JOKER = { id:'JOKER', rank:'JOKER', value:0, suit:'joker', label:'Joker', writtenRank:'Joker', displaySymbol:'★', suitSymbol:'', colorCategory:'black', isRed:false, isBlack:true, isWild:true };

export function createVideoPokerDeck(variantId) {
  const deck = createDeck();
  return variantId === 'joker-poker' ? [...deck, { ...JOKER }] : deck;
}

function standardVariant(cards, variantId) {
  const base = evaluateHand(cards);
  if (!['bonus-poker','double-bonus-poker','double-double-bonus-poker'].includes(variantId) || base.category !== 'FOUR_OF_A_KIND') return base;
  const groups = new Map();
  for (const card of cards) groups.set(card.value, (groups.get(card.value) || 0) + 1);
  const quadRank = [...groups.entries()].find(([,count]) => count === 4)?.[0];
  const kicker = [...groups.entries()].find(([,count]) => count === 1)?.[0];
  if (variantId === 'double-double-bonus-poker') {
    if (quadRank === 14 && [2,3,4].includes(kicker)) return { ...base, category:'FOUR_ACES_KICKER', name:'Four Aces with 2-4 Kicker' };
    if ([2,3,4].includes(quadRank) && [14,2,3,4].includes(kicker)) return { ...base, category:'FOUR_2_4_KICKER', name:'Four 2s-4s with A-4 Kicker' };
  }
  if (quadRank === 14) return { ...base, category:'FOUR_ACES', name:'Four Aces' };
  if ([2,3,4].includes(quadRank)) return { ...base, category:'FOUR_2_4', name:'Four 2s-4s' };
  return { ...base, category:'FOUR_5_K', name:'Four 5s-Kings' };
}

const sequences = [
  [14,2,3,4,5], [2,3,4,5,6], [3,4,5,6,7], [4,5,6,7,8], [5,6,7,8,9],
  [6,7,8,9,10], [7,8,9,10,11], [8,9,10,11,12], [9,10,11,12,13], [10,11,12,13,14],
];

function canCompleteSequence(cards, wildCount) {
  const values = new Set(cards.map(card => card.value));
  return sequences.some(seq => {
    for (const value of values) if (!seq.includes(value)) return false;
    return seq.filter(value => !values.has(value)).length <= wildCount;
  });
}

function canStraightFlush(nonWild, wildCount) {
  if (!nonWild.length) return true;
  if (!nonWild.every(card => card.suit === nonWild[0].suit)) return false;
  return canCompleteSequence(nonWild, wildCount);
}

function canRoyal(nonWild, wildCount) {
  if (!nonWild.length || !nonWild.every(card => card.suit === nonWild[0].suit)) return false;
  const royalRanks = new Set([10,11,12,13,14]);
  if (nonWild.some(card => !royalRanks.has(card.value))) return false;
  return 5 - new Set(nonWild.map(card=>card.value)).size <= wildCount;
}

function counts(nonWild) {
  const map = new Map();
  for (const card of nonWild) map.set(card.value, (map.get(card.value) || 0) + 1);
  return map;
}

function canMakeGroupPattern(nonWild, wildCount, pattern) {
  const values = [...counts(nonWild).entries()];
  const candidateRanks = [...new Set([...values.map(([rank])=>rank), 3,4,5,6,7,8,9,10,11,12,13,14])];
  function walk(targetIndex, remainingWild, used, assigned) {
    if (targetIndex === pattern.length) {
      return nonWild.every(card => assigned.has(card.value));
    }
    const target = pattern[targetIndex];
    for (const rank of candidateRanks) {
      if (used.has(rank)) continue;
      const natural = values.find(([value])=>value===rank)?.[1] || 0;
      if (natural > target) continue;
      const need = target - natural;
      if (need > remainingWild) continue;
      used.add(rank); assigned.add(rank);
      if (walk(targetIndex+1, remainingWild-need, used, assigned)) return true;
      used.delete(rank); assigned.delete(rank);
    }
    return false;
  }
  return walk(0,wildCount,new Set(),new Set());
}

function wildEvaluate(cards, variantId) {
  const isDeuce = card => variantId === 'deuces-wild' && card.value === 2;
  const isJoker = card => variantId === 'joker-poker' && card.isWild;
  const wild = cards.filter(card => isDeuce(card) || isJoker(card));
  const nonWild = cards.filter(card => !wild.includes(card));
  const w = wild.length;
  const rankCounts = counts(nonWild);
  const maxCount = Math.max(0,...rankCounts.values());

  if (w === 0) {
    const natural = evaluateHand(cards);
    if (natural.category === 'ROYAL_FLUSH') return { ...natural, category:'NATURAL_ROYAL', name:'Natural Royal Flush' };
    if (variantId === 'joker-poker' && natural.category === 'HIGH_PAIR') {
      const pairRank = natural.groups.find(group=>group.count===2)?.value || 0;
      return pairRank >= 13 ? { ...natural, category:'KINGS_OR_BETTER', name:'Kings or Better' } : { ...natural, category:'NOTHING', name:'Nothing' };
    }
    if (variantId === 'joker-poker' && natural.category === 'LOW_PAIR') return { ...natural, category:'NOTHING', name:'Nothing' };
    return natural.category === 'ROYAL_FLUSH' ? { ...natural, category:'NATURAL_ROYAL' } : natural;
  }

  if (variantId === 'deuces-wild' && w === 4) return { category:'FOUR_DEUCES', name:'Four Deuces', wildCount:w };
  if (canRoyal(nonWild,w)) return { category:'WILD_ROYAL', name:'Wild Royal Flush', wildCount:w };
  if (maxCount + w >= 5) return { category:'FIVE_OF_A_KIND', name:'Five of a Kind', wildCount:w };
  if (canStraightFlush(nonWild,w)) return { category:'STRAIGHT_FLUSH', name:'Straight Flush', wildCount:w };
  if (maxCount + w >= 4) return { category:'FOUR_OF_A_KIND', name:'Four of a Kind', wildCount:w };
  if (canMakeGroupPattern(nonWild,w,[3,2])) return { category:'FULL_HOUSE', name:'Full House', wildCount:w };
  if (!nonWild.length || nonWild.every(card=>card.suit===nonWild[0].suit)) return { category:'FLUSH', name:'Flush', wildCount:w };
  if (canCompleteSequence(nonWild,w)) return { category:'STRAIGHT', name:'Straight', wildCount:w };
  if (maxCount + w >= 3) return { category:'THREE_OF_A_KIND', name:'Three of a Kind', wildCount:w };

  if (variantId === 'joker-poker') {
    const pairRanks = [...rankCounts.entries()].filter(([,count])=>count===2).map(([rank])=>rank);
    if (pairRanks.length >= 2) return { category:'TWO_PAIR', name:'Two Pair', wildCount:w };
    if ([...rankCounts.keys()].some(rank=>rank>=13)) return { category:'KINGS_OR_BETTER', name:'Kings or Better', wildCount:w };
  }
  return { category:'NOTHING', name:'Nothing', wildCount:w };
}

export function evaluateVideoPokerHand(cards, variantId='jacks-or-better') {
  if (!VIDEO_POKER_VARIANTS[variantId]) throw new Error(`Unknown video poker variant: ${variantId}`);
  if (!Array.isArray(cards) || cards.length !== 5) throw new Error('Video poker evaluator needs exactly five cards');
  if (VIDEO_POKER_VARIANTS[variantId].wild) return wildEvaluate(cards, variantId);
  return standardVariant(cards, variantId);
}

export function payoutForVideoPoker(variantId, category, credits=5) {
  const variant = VIDEO_POKER_VARIANTS[variantId];
  if (!variant) throw new Error(`Unknown video poker variant: ${variantId}`);
  const row = variant.payouts[category];
  if (!row) return 0;
  const normalized = Math.max(1,Math.min(5,Number(credits)||1));
  return Number(row[normalized-1] || 0);
}
