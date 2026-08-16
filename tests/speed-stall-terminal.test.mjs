import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import { speedEngine } from '../src/games/engines/speed.js';

const byId=new Map(createDeck().map(card=>[card.id,card]));
const card=id=>structuredClone(byId.get(id));

test('unrecoverable Speed stall is a terminal draw rather than a frozen table',()=>{
  const state=speedEngine.createGame({seed:222,humanSeat:0});
  state.players[0].hand=[card('5clubs')];state.players[0].stock=[];
  state.players[1].hand=[card('5hearts')];state.players[1].stock=[];
  state.center=[card('9clubs'),card('9hearts')];
  state.reserves=[[],[]];state.spent=[[],[]];state.actor=0;
  assert.deepEqual(speedEngine.legalActions(state,0),[]);
  assert.equal(speedEngine.isTerminal(state),true);
  assert.equal(speedEngine.result(state).draw,true);
});
