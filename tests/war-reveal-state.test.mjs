import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import { warEngine } from '../src/games/engines/war.js';

const byId=new Map(createDeck().map(card=>[card.id,card]));
const card=id=>structuredClone(byId.get(id));

test('War keeps the just-played face-up battle cards for the premium table reveal',()=>{
  let state=warEngine.createGame({seed:902});
  state.players[0].deck=[card('Aspades')];state.players[1].deck=[card('Kclubs')];state.pot=[];
  state=warEngine.applyAction(state,{type:'battle'});
  assert.ok(Array.isArray(state.lastBattle.reveals));
  assert.equal(state.lastBattle.reveals.length,1);
  assert.equal(state.lastBattle.reveals[0].you.id,'Aspades');
  assert.equal(state.lastBattle.reveals[0].opponent.id,'Kclubs');
});

test('War reveal history records the final face-up comparison after a tie war',()=>{
  let state=warEngine.createGame({seed:903});
  state.players[0].deck=[card('5clubs'),card('2clubs'),card('3clubs'),card('4clubs'),card('Aspades')];
  state.players[1].deck=[card('5hearts'),card('2hearts'),card('3hearts'),card('4hearts'),card('Kspades')];state.pot=[];
  state=warEngine.applyAction(state,{type:'battle'});
  assert.equal(state.lastBattle.reveals.length,2);
  assert.equal(state.lastBattle.reveals.at(-1).you.id,'Aspades');
  assert.equal(state.lastBattle.reveals.at(-1).opponent.id,'Kspades');
});
