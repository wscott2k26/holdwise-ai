import test from 'node:test';
import assert from 'node:assert/strict';
import {
  texasHoldemEngine,
  startNextHand,
  chooseBotAction,
  runBotsUntilHumanTurn,
} from '../src/games/engines/texasHoldem.js';

function active(state) { return state.players.filter(p => !p.folded); }

test('new four-seat match posts blinds, deals hole cards and starts left of big blind', () => {
  const state = texasHoldemEngine.createGame({ seed: 41, startingStack: 500, smallBlind: 10, bigBlind: 20 });
  assert.equal(state.players.length, 4);
  assert.deepEqual(state.players.map(p => p.hole.length), [2,2,2,2]);
  assert.equal(state.players[state.smallBlindSeat].bet, 10);
  assert.equal(state.players[state.bigBlindSeat].bet, 20);
  assert.equal(state.currentBet, 20);
  assert.equal(state.actor, (state.bigBlindSeat + 1) % 4);
  assert.equal(state.street, 'preflop');
});

test('illegal check facing a blind is rejected and call settles the amount due', () => {
  let state = texasHoldemEngine.createGame({ seed: 2, startingStack: 500 });
  const actor = state.actor;
  assert.throws(() => texasHoldemEngine.applyAction(state, { type:'check', actor }), /illegal/i);
  const before = state.players[actor].stack;
  state = texasHoldemEngine.applyAction(state, { type:'call', actor });
  assert.equal(state.players[actor].bet, 20);
  assert.equal(state.players[actor].stack, before - 20);
});

test('raise resets opponents action obligations and betting advances through flop turn river', () => {
  let state = texasHoldemEngine.createGame({ seed: 8, startingStack: 1000 });
  const raiser = state.actor;
  state = texasHoldemEngine.applyAction(state, { type:'raise', actor:raiser, to:60 });
  assert.equal(state.currentBet, 60);
  assert.equal(state.minRaise, 40);
  assert.ok(state.players.filter((p,i)=>i!==raiser && !p.folded && !p.allIn).some(p=>!p.acted));

  let guard = 0;
  while (state.street === 'preflop' && guard++ < 20) {
    const a = state.actor;
    const actions = texasHoldemEngine.legalActions(state, a);
    const call = actions.find(x=>x.type==='call');
    const check = actions.find(x=>x.type==='check');
    state = texasHoldemEngine.applyAction(state, call || check || actions.find(x=>x.type==='fold'));
  }
  assert.equal(state.street, 'flop');
  assert.equal(state.community.length, 3);

  for (const expected of [['turn',4],['river',5],['showdown',5]]) {
    guard = 0;
    while (state.street !== expected[0] && !state.handComplete && guard++ < 30) {
      const a = state.actor;
      const actions = texasHoldemEngine.legalActions(state,a);
      state = texasHoldemEngine.applyAction(state, actions.find(x=>x.type==='check') || actions.find(x=>x.type==='call') || actions.find(x=>x.type==='fold'));
    }
    if (expected[0] !== 'showdown') {
      assert.equal(state.street, expected[0]);
      assert.equal(state.community.length, expected[1]);
    }
  }
  assert.equal(state.handComplete, true);
  assert.equal(state.community.length, 5);
  assert.ok(state.winners.length >= 1);
});

test('folding down to one player ends the hand and awards the entire pot', () => {
  let state = texasHoldemEngine.createGame({ seed: 12, startingStack: 200 });
  const initialTotal = state.players.reduce((sum,p)=>sum+p.stack,0) + state.players.reduce((sum,p)=>sum+p.contribution,0);
  let guard = 0;
  while (!state.handComplete && guard++ < 10) {
    const actor = state.actor;
    if (active(state).length > 1) state = texasHoldemEngine.applyAction(state, { type:'fold', actor });
  }
  assert.equal(state.handComplete, true);
  assert.equal(state.winners.length, 1);
  assert.equal(state.players.reduce((sum,p)=>sum+p.stack,0), initialTotal);
});

test('showdown settlement is side-pot safe and preserves every chip', () => {
  let state = texasHoldemEngine.createGame({ seed: 99, startingStack: 300 });
  state.players[0].stack = 0; state.players[0].contribution = 100; state.players[0].allIn = true; state.players[0].folded = false;
  state.players[1].stack = 0; state.players[1].contribution = 200; state.players[1].allIn = true; state.players[1].folded = false;
  state.players[2].stack = 0; state.players[2].contribution = 300; state.players[2].allIn = true; state.players[2].folded = false;
  state.players[3].stack = 50; state.players[3].contribution = 250; state.players[3].allIn = false; state.players[3].folded = true;
  state.community = state.deck.splice(0,5);
  state.street = 'river'; state.actor = 2; state.currentBet = 0;
  const chips = state.players.reduce((s,p)=>s+p.stack+p.contribution,0);
  state = texasHoldemEngine.settleShowdown(state);
  assert.equal(state.handComplete, true);
  assert.equal(state.players.reduce((s,p)=>s+p.stack,0), chips);
  assert.ok(state.potResults.length >= 2);
});

test('next hand rotates dealer and preserves stacks', () => {
  let state = texasHoldemEngine.createGame({ seed: 21, startingStack: 200 });
  while (!state.handComplete) state = texasHoldemEngine.applyAction(state, { type:'fold', actor:state.actor });
  const dealer = state.dealer;
  const stacks = state.players.map(p=>p.stack);
  state = startNextHand(state);
  assert.equal(state.dealer, (dealer + 1) % 4);
  assert.deepEqual(state.players.map(p=>p.stack), stacks.map((s,i)=>s));
  assert.equal(state.handNumber, 2);
  assert.equal(state.handComplete, false);
});

test('seeded bot policy only returns legal actions and can advance to a human decision', () => {
  let state = texasHoldemEngine.createGame({ seed: 73, startingStack: 250, humanSeat:0 });
  if (state.actor !== 0) {
    const action = chooseBotAction(state, state.actor, () => 0.42);
    assert.ok(texasHoldemEngine.legalActions(state,state.actor).some(a=>a.type===action.type));
  }
  state = runBotsUntilHumanTurn(state, { maxActions:100 });
  assert.ok(state.handComplete || state.matchComplete || state.actor === 0);
});
