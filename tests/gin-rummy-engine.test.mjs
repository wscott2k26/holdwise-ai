import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import { ginRummyEngine, analyzeGinHand, scoreGinRound, chooseGinBotAction, startNextGinRound } from '../src/games/engines/ginRummy.js';

const byId=new Map(createDeck().map(card=>[card.id,card]));
const cards=(...ids)=>ids.map(id=>structuredClone(byId.get(id)));

test('analyzeGinHand finds disjoint runs/sets that minimize deadwood exactly',()=>{
  const result=analyzeGinHand(cards('7hearts','8hearts','9hearts','Kclubs','Kdiamonds','Kspades','2diamonds','5clubs','Aclubs','Qspades'));
  assert.equal(result.deadwoodPoints,18);
  assert.equal(result.melds.length,2);
  assert.deepEqual(result.deadwood.map(card=>card.id).sort(),['2diamonds','5clubs','Aclubs','Qspades'].sort());
});

test('analyzeGinHand recognizes gin at zero deadwood',()=>{
  const result=analyzeGinHand(cards('3hearts','4hearts','5hearts','6hearts','9clubs','9diamonds','9spades','2clubs','2diamonds','2spades'));
  assert.equal(result.deadwoodPoints,0);assert.equal(result.deadwood.length,0);
});

test('new Gin Rummy round deals ten cards each, one discard, and 31 stock cards',()=>{
  const state=ginRummyEngine.createGame({seed:50,dealer:0,targetScore:100});
  assert.deepEqual(state.players.map(player=>player.hand.length),[10,10]);
  assert.equal(state.stock.length,31);assert.equal(state.discard.length,1);assert.equal(state.phase,'draw');assert.equal(state.actor,1);
});

test('draw stock or discard creates eleven-card discard phase then a legal discard returns opponent to draw',()=>{
  let state=ginRummyEngine.createGame({seed:51,dealer:0});const actor=state.actor;
  assert.deepEqual(ginRummyEngine.legalActions(state,actor).map(a=>a.type).sort(),['draw-discard','draw-stock']);
  state=ginRummyEngine.applyAction(state,{type:'draw-stock',actor});assert.equal(state.players[actor].hand.length,11);assert.equal(state.phase,'discard');
  const cardId=state.players[actor].hand[0].id;state=ginRummyEngine.applyAction(state,{type:'discard',actor,cardId});assert.equal(state.players[actor].hand.length,10);assert.equal(state.phase,'draw');assert.equal(state.actor,1-actor);
});

test('a player cannot immediately discard the exact card just taken from discard pile',()=>{
  let state=ginRummyEngine.createGame({seed:52,dealer:0});const actor=state.actor,top=state.discard.at(-1).id;
  state=ginRummyEngine.applyAction(state,{type:'draw-discard',actor});
  assert.equal(ginRummyEngine.legalActions(state,actor).some(a=>a.cardId===top),false);
});

test('knock-discard is exposed only when resulting deadwood is ten or less',()=>{
  let state=ginRummyEngine.createGame({seed:53,dealer:0});const actor=state.actor;
  state.players[actor].hand=cards('3hearts','4hearts','5hearts','6hearts','9clubs','9diamonds','9spades','2clubs','2diamonds','Aspades');
  state.players[actor].hand.push(cards('Qclubs')[0]);state.phase='discard';state.drawnFromDiscardId=null;
  const knocks=ginRummyEngine.legalActions(state,actor).filter(a=>a.type==='knock-discard');
  assert.ok(knocks.length>0);assert.ok(knocks.every(action=>action.deadwood<=10));
});

test('Gin scores bonus plus defender deadwood; normal knock scores difference; undercut pays defender bonus',()=>{
  const gin=scoreGinRound({knocker:0,knockerDeadwood:0,defenderDeadwood:32,gin:true,scores:[0,0]});assert.deepEqual(gin.roundScores,[57,0]);
  const knock=scoreGinRound({knocker:1,knockerDeadwood:7,defenderDeadwood:18,gin:false,scores:[10,20]});assert.deepEqual(knock.roundScores,[0,11]);assert.deepEqual(knock.scores,[10,31]);
  const undercut=scoreGinRound({knocker:0,knockerDeadwood:8,defenderDeadwood:6,gin:false,scores:[0,0]});assert.deepEqual(undercut.roundScores,[0,27]);
});

test('bot always chooses legal draw/discard/knock actions',()=>{
  let state=ginRummyEngine.createGame({seed:54,humanSeat:0});
  if(state.actor!==0){let action=chooseGinBotAction(state,state.actor);assert.ok(ginRummyEngine.legalActions(state,state.actor).some(a=>a.type===action.type&&(a.cardId===undefined||a.cardId===action.cardId)));state=ginRummyEngine.applyAction(state,action);action=chooseGinBotAction(state,state.actor);assert.ok(ginRummyEngine.legalActions(state,state.actor).some(a=>a.type===action.type&&a.cardId===action.cardId));}
});

test('full bot rounds reach settlement and next round rotates dealer while preserving score',()=>{
  let state=ginRummyEngine.createGame({seed:55,targetScore:9999});let guard=0;
  while(!state.roundComplete&&guard++<500)state=ginRummyEngine.applyAction(state,chooseGinBotAction(state,state.actor));
  assert.equal(state.roundComplete,true);assert.ok(state.roundResult);const dealer=state.dealer,scores=state.scores.slice();
  state=startNextGinRound(state);assert.equal(state.dealer,1-dealer);assert.deepEqual(state.scores,scores);assert.equal(state.roundNumber,2);
});
