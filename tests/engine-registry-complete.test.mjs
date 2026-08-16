import test from 'node:test';
import assert from 'node:assert/strict';
import { CARD_ACADEMY_GAMES } from '../src/games/catalog.js';
import { getEngine, ENGINE_REGISTRY } from '../src/games/engineRegistry.js';

test('every one of the 21 launch games resolves to a concrete rules engine',()=>{
  assert.equal(CARD_ACADEMY_GAMES.length,21);
  assert.equal(Object.keys(ENGINE_REGISTRY).length,21);
  for(const game of CARD_ACADEMY_GAMES){
    const engine=getEngine(game.id);
    assert.ok(engine,`${game.id} missing engine`);
    for(const method of ['createGame','legalActions','applyAction','isTerminal','result','coachFacts'])assert.equal(typeof engine[method],'function',`${game.id}.${method} missing`);
    const state=engine.createGame({seed:101,humanSeat:0});
    assert.ok(state&&typeof state==='object',`${game.id} did not create state`);
  }
});

test('all six video poker catalog ids instantiate their own selected variant through registry',()=>{
  for(const id of ['jacks-or-better','bonus-poker','double-bonus-poker','double-double-bonus-poker','deuces-wild','joker-poker']){
    const state=getEngine(id).createGame({seed:2});
    assert.equal(state.variantId,id);
  }
});
