import test from 'node:test';
import assert from 'node:assert/strict';
import { CARD_ACADEMY_GAMES, getGame } from '../src/games/catalog.js';

const IDS = ['texas-holdem','jacks-or-better','bonus-poker','double-bonus-poker','double-double-bonus-poker','deuces-wild','joker-poker','blackjack','klondike','spider','freecell','tripeaks','pyramid','spades','hearts','gin-rummy','crazy-eights','go-fish','war','speed','color-clash'];

test('catalog exposes exactly the 21 approved full-play games', () => {
  assert.equal(CARD_ACADEMY_GAMES.length, 21);
  assert.deepEqual(CARD_ACADEMY_GAMES.map(g => g.id), IDS);
  assert.equal(new Set(IDS).size, 21);
  for (const game of CARD_ACADEMY_GAMES) {
    assert.equal(game.fullPlay, true, `${game.id} must be full play`);
    assert.ok(game.engineId);
    assert.ok(game.tutorialId);
    assert.ok(game.family);
    assert.ok(game.theme?.accent);
    assert.ok(Array.isArray(game.references) && game.references.length >= 1);
    assert.doesNotMatch(JSON.stringify(game), /coming soon|demo/i);
    assert.equal(getGame(game.id)?.id, game.id);
  }
});
