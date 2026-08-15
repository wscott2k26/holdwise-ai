const CATEGORY_STRENGTH = {
  HIGH_CARD: 0,
  ONE_PAIR: 1,
  TWO_PAIR: 2,
  THREE_OF_A_KIND: 3,
  STRAIGHT: 4,
  FLUSH: 5,
  FULL_HOUSE: 6,
  FOUR_OF_A_KIND: 7,
  STRAIGHT_FLUSH: 8,
};

function assertCards(cards, expected = 5) {
  if (!Array.isArray(cards) || cards.length !== expected) {
    throw new Error(`Expected exactly ${expected} cards`);
  }
  const ids = new Set(cards.map((card) => card?.id));
  if (ids.size !== expected || [...ids].some((id) => !id)) throw new Error('Poker hand contains missing or duplicate cards');
}

function straightHigh(values) {
  const unique = [...new Set(values)].sort((a, b) => a - b);
  if (unique.length !== 5) return 0;
  if (unique[4] - unique[0] === 4) return unique[4];
  if (unique.join(',') === '2,3,4,5,14') return 5;
  return 0;
}

function groupsFor(cards) {
  const counts = new Map();
  for (const card of cards) counts.set(card.value, (counts.get(card.value) || 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value: Number(value), count }))
    .sort((a, b) => b.count - a.count || b.value - a.value);
}

export function evaluateFive(cards) {
  assertCards(cards, 5);
  const values = cards.map((card) => card.value);
  const groups = groupsFor(cards);
  const flush = cards.every((card) => card.suit === cards[0].suit);
  const highStraight = straightHigh(values);

  let category;
  let ranks;

  if (flush && highStraight) {
    category = 'STRAIGHT_FLUSH';
    ranks = [highStraight];
  } else if (groups[0].count === 4) {
    category = 'FOUR_OF_A_KIND';
    ranks = [groups[0].value, groups.find((group) => group.count === 1).value];
  } else if (groups[0].count === 3 && groups[1]?.count === 2) {
    category = 'FULL_HOUSE';
    ranks = [groups[0].value, groups[1].value];
  } else if (flush) {
    category = 'FLUSH';
    ranks = [...values].sort((a, b) => b - a);
  } else if (highStraight) {
    category = 'STRAIGHT';
    ranks = [highStraight];
  } else if (groups[0].count === 3) {
    category = 'THREE_OF_A_KIND';
    ranks = [groups[0].value, ...groups.filter((group) => group.count === 1).map((group) => group.value).sort((a, b) => b - a)];
  } else if (groups[0].count === 2 && groups[1]?.count === 2) {
    const pairs = groups.filter((group) => group.count === 2).map((group) => group.value).sort((a, b) => b - a);
    const kicker = groups.find((group) => group.count === 1).value;
    category = 'TWO_PAIR';
    ranks = [...pairs, kicker];
  } else if (groups[0].count === 2) {
    category = 'ONE_PAIR';
    ranks = [groups[0].value, ...groups.filter((group) => group.count === 1).map((group) => group.value).sort((a, b) => b - a)];
  } else {
    category = 'HIGH_CARD';
    ranks = [...values].sort((a, b) => b - a);
  }

  return {
    category,
    strength: CATEGORY_STRENGTH[category],
    ranks,
    cards: cards.slice(),
  };
}

export function comparePokerHands(a, b) {
  if (!a || !b) throw new Error('Two evaluated poker hands are required');
  if (a.strength !== b.strength) return a.strength - b.strength;
  const length = Math.max(a.ranks?.length || 0, b.ranks?.length || 0);
  for (let index = 0; index < length; index += 1) {
    const delta = (a.ranks?.[index] || 0) - (b.ranks?.[index] || 0);
    if (delta) return delta;
  }
  return 0;
}

export function bestFiveOfSeven(cards) {
  assertCards(cards, 7);
  let best = null;
  for (let a = 0; a < 3; a += 1) {
    for (let b = a + 1; b < 4; b += 1) {
      for (let c = b + 1; c < 5; c += 1) {
        for (let d = c + 1; d < 6; d += 1) {
          for (let e = d + 1; e < 7; e += 1) {
            const evaluated = evaluateFive([cards[a], cards[b], cards[c], cards[d], cards[e]]);
            if (!best || comparePokerHands(evaluated, best) > 0) best = evaluated;
          }
        }
      }
    }
  }
  return best;
}

export { CATEGORY_STRENGTH };
