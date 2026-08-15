import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import {
  spadesEngine, legalSpadesCards, spadesTrickWinner, scoreSpadesRound,
  chooseSpadesBotBid, chooseSpadesBotCard, startNextSpadesRound,
} from '../src/games/engines/spades.js';
import {
  heartsEngine, legalHeartsCards, heartsTrickWinner, scoreHeartsRound,
  passTarget, chooseHeartsBotPass, chooseHeartsBotCard, startNextHeartsRound,
} from '../src/games/engines/hearts.js';

const byId=new Map(createDeck().map(c=>[c.id,c]));
const cards=(...ids)=>ids.map(id=>structuredClone(byId.get(id)));
const card=id=>{const found=byId.get(id);assert.ok(found,`missing card ${id}`);return structuredClone(found);};

test('Spades deals 13 cards to four seats and begins partnership bidding left of dealer',()=>{
  const state=spadesEngine.createGame({seed:20,dealer:0,targetScore:500});
  assert.deepEqual(state.players.map(p=>p.hand.length),[13,13,13,13]);
  assert.equal(state.phase,'bidding');assert.equal(state.actor,1);
  assert.deepEqual(state.scores,[0,0]);assert.deepEqual(state.bags,[0,0]);
});

test('Spades bidding accepts nil and moves into play after all four bids',()=>{
  let state=spadesEngine.createGame({seed:21,dealer:3,humanSeat:0});
  const bids=[3,0,4,2];
  for(let i=0;i<4;i+=1){assert.equal(state.actor,i);state=spadesEngine.applyAction(state,{type:'bid',actor:i,bid:bids[i]});}
  assert.equal(state.phase,'playing');assert.equal(state.bids[1],0);assert.equal(state.nil[1],true);assert.equal(state.trick.length,0);
});

test('Spades legal play must follow suit and cannot lead spades before broken unless hand is all spades',()=>{
  const hand=cards('2clubs','Aspades','Khearts');
  assert.deepEqual(legalSpadesCards(hand,[{card:card('10clubs'),seat:2}],false).map(c=>c.id),['2clubs']);
  assert.equal(legalSpadesCards(hand,[],false).some(c=>c.suit==='spades'),false);
  const only=cards('2spades','Aspades');assert.equal(legalSpadesCards(only,[],false).length,2);
});

test('Spades trick winner honors trump over lead suit and high trump',()=>{
  const trick=[{seat:0,card:card('Ahearts')},{seat:1,card:card('2spades')},{seat:2,card:card('Kspades')},{seat:3,card:card('10hearts')}];
  assert.equal(spadesTrickWinner(trick),2);
});

test('Spades round scoring handles contracts, bags, nil and ten-bag penalty',()=>{
  const result=scoreSpadesRound({bids:[3,0,4,2],tricks:[4,0,4,5],nil:[false,true,false,false],scores:[480,120],bags:[9,2],targetScore:500});
  assert.equal(result.roundScores[0],-29); // team 0 bid7, 8 tricks => +71, then 10th bag penalty -100
  assert.equal(result.bags[0],0);
  assert.equal(result.roundScores[1],123); // bid2 + 3 bags + successful nil = 20 + 3 + 100
  assert.equal(result.scores[1],243);
});

test('Spades bot bidding/play always produce legal choices',()=>{
  let state=spadesEngine.createGame({seed:22,humanSeat:0});
  const bid=chooseSpadesBotBid(state,state.actor);assert.ok(bid>=0&&bid<=13);
  while(state.phase==='bidding'){state=spadesEngine.applyAction(state,{type:'bid',actor:state.actor,bid:chooseSpadesBotBid(state,state.actor)});}
  const action=chooseSpadesBotCard(state,state.actor);assert.ok(spadesEngine.legalActions(state,state.actor).some(a=>a.type==='play'&&a.cardId===action.cardId));
});

test('Spades complete round can start a new round with rotated dealer and persistent scores',()=>{
  let state=spadesEngine.createGame({seed:23,dealer:0,targetScore:9999});
  let guard=0;
  while(!state.roundComplete&&guard++<200){
    if(state.phase==='bidding') state=spadesEngine.applyAction(state,{type:'bid',actor:state.actor,bid:chooseSpadesBotBid(state,state.actor)});
    else state=spadesEngine.applyAction(state,chooseSpadesBotCard(state,state.actor));
  }
  assert.equal(state.roundComplete,true);assert.equal(state.trickNumber,13);
  const scores=state.scores.slice(),dealer=state.dealer;
  state=startNextSpadesRound(state);assert.equal(state.dealer,(dealer+1)%4);assert.deepEqual(state.scores,scores);assert.equal(state.roundNumber,2);
});

test('Hearts deals 13 cards and cycles passing left, right, across, hold',()=>{
  for(let round=1;round<=4;round+=1){const state=heartsEngine.createGame({seed:30+round,roundNumber:round,dealer:0});const expected=['left','right','across','hold'][round-1];assert.equal(state.passDirection,expected);assert.equal(state.phase,expected==='hold'?'playing':'passing');}
  assert.equal(passTarget(0,'left'),1);assert.equal(passTarget(0,'right'),3);assert.equal(passTarget(0,'across'),2);
});

test('Hearts passing requires exactly three cards and transfers simultaneously',()=>{
  let state=heartsEngine.createGame({seed:35,roundNumber:1,humanSeat:0});
  const originals=state.players.map(p=>p.hand.map(c=>c.id));
  for(let seat=0;seat<4;seat+=1){const chosen=chooseHeartsBotPass(state,seat);assert.equal(chosen.length,3);state=heartsEngine.applyAction(state,{type:'pass',actor:seat,cardIds:chosen});}
  assert.equal(state.phase,'playing');assert.equal(state.players.every(p=>p.hand.length===13),true);assert.notDeepEqual(state.players[0].hand.map(c=>c.id).sort(),originals[0].sort());
});

test('Hearts first lead is 2 clubs, players must follow suit, and point cards are blocked on first trick when alternatives exist',()=>{
  const hand=cards('2clubs','Qspades','5hearts','9diamonds');
  assert.deepEqual(legalHeartsCards(hand,[],false,0).map(c=>c.id),['2clubs']);
  assert.deepEqual(legalHeartsCards(cards('3clubs','Qspades','5hearts'),[{seat:0,card:card('2clubs')}],false,0).map(c=>c.id),['3clubs']);
  const voidHand=cards('Qspades','5hearts','9diamonds');assert.deepEqual(legalHeartsCards(voidHand,[{seat:0,card:card('2clubs')}],false,0).map(c=>c.id),['9diamonds']);
});

test('Hearts cannot be led before broken unless only hearts, and trick winner follows lead suit',()=>{
  const hand=cards('5hearts','9clubs');assert.deepEqual(legalHeartsCards(hand,[],false,4).map(c=>c.id),['9clubs']);
  assert.equal(legalHeartsCards(cards('5hearts','9hearts'),[],false,4).length,2);
  const trick=[{seat:0,card:card('10clubs')},{seat:1,card:card('Aclubs')},{seat:2,card:card('Kspades')},{seat:3,card:card('Qclubs')}];assert.equal(heartsTrickWinner(trick),1);
});

test('Hearts scoring counts hearts and queen of spades and applies Shoot the Moon',()=>{
  const normal=scoreHeartsRound([1,13,12,0],[10,20,30,40],100);assert.deepEqual(normal.roundPoints,[1,13,12,0]);assert.deepEqual(normal.scores,[11,33,42,40]);
  const moon=scoreHeartsRound([26,0,0,0],[10,20,30,40],100);assert.deepEqual(moon.roundPoints,[0,26,26,26]);assert.deepEqual(moon.scores,[10,46,56,66]);
});

test('Hearts bots choose legal passes/cards and a full round reaches score settlement',()=>{
  let state=heartsEngine.createGame({seed:40,roundNumber:4,humanSeat:0,targetScore:999});let guard=0;
  while(!state.roundComplete&&guard++<100){const action=chooseHeartsBotCard(state,state.actor);assert.ok(heartsEngine.legalActions(state,state.actor).some(a=>a.cardId===action.cardId));state=heartsEngine.applyAction(state,action);}
  assert.equal(state.roundComplete,true);assert.equal(state.trickNumber,13);assert.equal(state.scores.length,4);
  const prior=state.scores.slice(),round=state.roundNumber;state=startNextHeartsRound(state);assert.equal(state.roundNumber,round+1);assert.deepEqual(state.scores,prior);
});
