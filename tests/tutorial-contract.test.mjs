import test from 'node:test';
import assert from 'node:assert/strict';
import { CARD_ACADEMY_GAMES } from '../src/games/catalog.js';
import { getTutorial } from '../src/games/tutorials.js';

const ORDER = ['objective','table','turn','legal-move','scoring','mistakes','guided-game','coach-review','graduation','reward'];

test('every game has the complete ten-stage tutorial contract', () => {
  for (const game of CARD_ACADEMY_GAMES) {
    const tutorial = getTutorial(game.id);
    assert.equal(tutorial.gameId, game.id);
    assert.deepEqual(tutorial.steps.map(s => s.id), ORDER, game.id);
    assert.ok(tutorial.steps.filter(s => ['interactive','review'].includes(s.kind)).length >= 3, game.id);
    for (const step of tutorial.steps) {
      assert.ok(step.title);
      assert.ok(step.body);
    }
  }
});
