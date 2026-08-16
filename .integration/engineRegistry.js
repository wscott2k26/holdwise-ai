import { texasHoldemEngine } from './engines/texasHoldem.js';
import { videoPokerEngine } from './engines/videoPoker.js';
import { blackjackEngine } from './engines/blackjack.js';
import { klondikeEngine } from './engines/klondike.js';
import { spiderEngine } from './engines/spider.js';
import { freeCellEngine } from './engines/freecell.js';
import { triPeaksEngine } from './engines/tripeaks.js';
import { pyramidEngine } from './engines/pyramid.js';
import { spadesEngine } from './engines/spades.js';
import { heartsEngine } from './engines/hearts.js';
import { ginRummyEngine } from './engines/ginRummy.js';
import { crazyEightsEngine } from './engines/crazyEights.js';
import { goFishEngine } from './engines/goFish.js';
import { warEngine } from './engines/war.js';
import { speedEngine } from './engines/speed.js';
import { colorClashEngine } from './engines/colorClash.js';

const videoPokerVariant = id => ({
  ...videoPokerEngine,
  id,
  createGame(options = {}) {
    return videoPokerEngine.createGame({ ...options, variantId:id });
  },
});

export const ENGINE_REGISTRY = {
  'texas-holdem': texasHoldemEngine,
  'jacks-or-better': videoPokerVariant('jacks-or-better'),
  'bonus-poker': videoPokerVariant('bonus-poker'),
  'double-bonus-poker': videoPokerVariant('double-bonus-poker'),
  'double-double-bonus-poker': videoPokerVariant('double-double-bonus-poker'),
  'deuces-wild': videoPokerVariant('deuces-wild'),
  'joker-poker': videoPokerVariant('joker-poker'),
  blackjack: blackjackEngine,
  klondike: klondikeEngine,
  spider: spiderEngine,
  freecell: freeCellEngine,
  tripeaks: triPeaksEngine,
  pyramid: pyramidEngine,
  spades: spadesEngine,
  hearts: heartsEngine,
  'gin-rummy': ginRummyEngine,
  'crazy-eights': crazyEightsEngine,
  'go-fish': goFishEngine,
  war: warEngine,
  speed: speedEngine,
  'color-clash': colorClashEngine,
};

export function getEngine(gameId) {
  return ENGINE_REGISTRY[gameId] || null;
}

export default ENGINE_REGISTRY;
