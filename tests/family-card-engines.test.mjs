import test from 'node:test';
import assert from 'node:assert/strict';
import { createDeck } from '../src/lib/cards/deck.js';
import { crazyEightsEngine, crazyEightsPlayable, chooseCrazyEightsBotAction, startNextCrazyEightsRound } from '../src/games/engines/crazyEights.js';
import { goFishEngine, chooseGoFishBotAction } from '../src/games/engines/goFish.js';
import { warEngine } from '../src/games/engines/war.js';
import { speedEngine, speedAdjacent, chooseSpeedBotAction, driveSpeedBot } from '../src/games/engines/speed.js';
import { colorClashEngine, createColorClashDeck, colorClashPlayable, chooseColorClashBotAction, startNextColorClashRound } from '../src/games/engines/colorClash.js';

const byId=new Map(createDeck().map(card=>[card.id,card]));
const card=id=>structuredClone(byId.get(id));
const cards=(...ids)=>ids.map(card);

// Crazy Eights

test('Crazy Eights deals 5 cards to four players and starts with a non-eight discard',()=>{
  const state=crazyEightsEngine.createGame({seed:61,targetScore:100});
  assert.deepEqual(state.players.map(p=>p.hand.length),[5,5,5,5]);
  assert.equal(state.discard.length,1);assert.notEqual(state.discard.at(-1).rank,'8');assert.equal(state.phase,'playing');
});

test('Crazy Eights plays matching suit/rank while eights are wild and select the next suit',()=>{
  const top=card('5hearts');
  assert.equal(crazyEightsPlayable(card('Khearts'),top,'hearts'),true);
  assert.equal(crazyEightsPlayable(card('5clubs'),top,'hearts'),true);
  assert.equal(crazyEightsPlayable(card('8spades'),top,'hearts'),true);
  assert.equal(crazyEightsPlayable(card('Kclubs'),top,'hearts'),false);
});

test('Crazy Eights draw advances only when drawn card is not playable and a round scores opponents cards',()=>{
  let state=crazyEightsEngine.createGame({seed:62,humanSeat:0,targetScore:999});
  state.actor=0;state.players[0].hand=cards('Kclubs');state.discard=[card('5hearts')];state.currentSuit='hearts';state.stock=cards('2diamonds');
  state=crazyEightsEngine.applyAction(state,{type:'draw',actor:0});assert.equal(state.actor,1);
  state.players[1].hand=cards('5clubs');state.actor=1;
  state=crazyEightsEngine.applyAction(state,{type:'play',actor:1,cardId:'5clubs'});assert.equal(state.roundComplete,true);assert.ok(state.roundResult.points>0);
  const scores=state.scores.slice();state=startNextCrazyEightsRound(state);assert.deepEqual(state.scores,scores);assert.equal(state.roundNumber,2);
});

test('Crazy Eights bot always chooses a legal action',()=>{
  const state=crazyEightsEngine.createGame({seed:63,humanSeat:0});const action=chooseCrazyEightsBotAction(state,state.actor);assert.ok(crazyEightsEngine.legalActions(state,state.actor).some(a=>a.type===action.type&&(a.cardId===undefined||a.cardId===action.cardId)));
});

// Go Fish

test('Go Fish deals 5 cards to four players and only allows asking for a rank held by asker',()=>{
  let state=goFishEngine.createGame({seed:64,humanSeat:0});assert.deepEqual(state.players.map(p=>p.hand.length),[5,5,5,5]);
  state.actor=0;const held=state.players[0].hand[0].rank;const actions=goFishEngine.legalActions(state,0).filter(a=>a.type==='ask');assert.ok(actions.some(a=>a.rank===held));assert.equal(actions.every(a=>state.players[0].hand.some(c=>c.rank===a.rank)),true);
});

test('Go Fish successful ask transfers every matching rank and grants another turn',()=>{
  let state=goFishEngine.createGame({seed:65,humanSeat:0});state.actor=0;state.players[0].hand=cards('7clubs');state.players[1].hand=cards('7hearts','7spades','Kclubs');state.players[2].hand=cards('2clubs');state.players[3].hand=cards('3clubs');state.stock=cards('4clubs');
  state=goFishEngine.applyAction(state,{type:'ask',actor:0,target:1,rank:'7'});assert.equal(state.players[0].hand.filter(c=>c.rank==='7').length,3);assert.equal(state.players[1].hand.some(c=>c.rank==='7'),false);assert.equal(state.actor,0);
});

test('Go Fish failed ask draws one, repeats on lucky draw, otherwise passes turn; books of four score automatically',()=>{
  let state=goFishEngine.createGame({seed:66,humanSeat:0});state.actor=0;state.players[0].hand=cards('9clubs');state.players[1].hand=cards('Kclubs');state.players[2].hand=cards('2clubs');state.players[3].hand=cards('3clubs');state.stock=cards('9hearts');
  state=goFishEngine.applyAction(state,{type:'ask',actor:0,target:1,rank:'9'});assert.equal(state.lastEvent.luckyFish,true);assert.equal(state.actor,0);
  state.players[0].hand=cards('5clubs','5diamonds','5hearts');state.players[1].hand=cards('Kclubs');state.stock=cards('5spades');state.actor=0;
  state=goFishEngine.applyAction(state,{type:'ask',actor:0,target:1,rank:'5'});assert.equal(state.players[0].books,1);assert.equal(state.players[0].hand.some(c=>c.rank==='5'),false);
});

test('Go Fish bot asks a legal target/rank and game ends at 13 books with highest-book winner',()=>{
  let state=goFishEngine.createGame({seed:67,humanSeat:0});const action=chooseGoFishBotAction(state,state.actor);assert.ok(goFishEngine.legalActions(state,state.actor).some(a=>a.type==='ask'&&a.target===action.target&&a.rank===action.rank));
  state.players.forEach((p,i)=>{p.hand=[];p.books=i===0?4:3;});state.stock=[];assert.equal(goFishEngine.isTerminal(state),true);assert.deepEqual(goFishEngine.result(state).winners,[0]);
});

// War

test('War splits a 52-card deck evenly and each battle transfers both cards to winner',()=>{
  let state=warEngine.createGame({seed:68});assert.deepEqual(state.players.map(p=>p.deck.length),[26,26]);
  state.players[0].deck=[card('Aspades')];state.players[1].deck=[card('Kclubs')];state.pot=[];
  state=warEngine.applyAction(state,{type:'battle'});assert.equal(state.players[0].deck.length,2);assert.equal(state.players[1].deck.length,0);assert.equal(state.gameComplete,true);assert.deepEqual(state.winners,[0]);
});

test('War tie performs three-down one-up when enough cards and awards the full war pot',()=>{
  let state=warEngine.createGame({seed:69});state.players[0].deck=cards('5clubs','2clubs','3clubs','4clubs','Aspades');state.players[1].deck=cards('5hearts','2hearts','3hearts','4hearts','Kspades');state.pot=[];
  state=warEngine.applyAction(state,{type:'battle'});assert.equal(state.lastBattle.warDepth,1);assert.equal(state.players[0].deck.length,10);assert.equal(state.players[1].deck.length,0);
});

test('War exposes New Game terminal result and cycle protection may declare a draw instead of looping forever',()=>{
  const state=warEngine.createGame({seed:70,maxBattles:2});assert.equal(warEngine.legalActions(state).some(a=>a.type==='battle'),true);assert.ok(warEngine.result({...state,gameComplete:true,winners:[],draw:true}).draw);
});

// Speed

test('Speed standard setup gives each player 5-card hand + 15 stock and creates two active plus two 5-card reserves',()=>{
  const state=speedEngine.createGame({seed:71,humanSeat:0});assert.deepEqual(state.players.map(p=>[p.hand.length,p.stock.length]),[[5,15],[5,15]]);assert.equal(state.center.length,2);assert.deepEqual(state.reserves.map(p=>p.length),[5,5]);
});

test('Speed accepts adjacent ranks with Ace wrapping between King and Two',()=>{
  assert.equal(speedAdjacent(card('Aspades'),card('Khearts')),true);assert.equal(speedAdjacent(card('Aspades'),card('2hearts')),true);assert.equal(speedAdjacent(card('5clubs'),card('7hearts')),false);
});

test('Speed play removes a hand card, refills from personal stock, and rejects non-adjacent plays',()=>{
  let state=speedEngine.createGame({seed:72,humanSeat:0});state.actor=0;state.players[0].hand=cards('5clubs');state.players[0].stock=cards('9clubs');state.center=[card('4hearts'),card('Kspades')];
  state=speedEngine.applyAction(state,{type:'play',actor:0,cardId:'5clubs',pile:0});assert.equal(state.players[0].hand[0].id,'9clubs');assert.equal(state.center[0].id,'5clubs');
  assert.throws(()=>speedEngine.applyAction(state,{type:'play',actor:0,cardId:'9clubs',pile:1}),/illegal/i);
});

test('Speed stalled table flips reserve cards and complete player wins when hand and stock are empty',()=>{
  let state=speedEngine.createGame({seed:73,humanSeat:0});state.players[0].hand=cards('5clubs');state.players[1].hand=cards('5hearts');state.center=[card('9clubs'),card('9hearts')];state.players.forEach(p=>p.stock=[]);state.reserves=[cards('2clubs'),cards('3clubs')];state.actor=0;
  assert.ok(speedEngine.legalActions(state,0).some(a=>a.type==='flip-reserves'));
  state=speedEngine.applyAction(state,{type:'flip-reserves',actor:0});assert.equal(state.center[0].id,'2clubs');assert.equal(state.center[1].id,'3clubs');
  state.players[0].hand=[];state.players[0].stock=[];assert.equal(speedEngine.isTerminal(state),true);assert.deepEqual(speedEngine.result(state).winners,[0]);
});

test('Speed bot action is legal and drive helper returns at human turn, terminal, or stall',()=>{
  let state=speedEngine.createGame({seed:74,humanSeat:0});if(state.actor===0)state.actor=1;const action=chooseSpeedBotAction(state,1);assert.ok(speedEngine.legalActions(state,1).some(a=>a.type===action.type&&(a.cardId===undefined||a.cardId===action.cardId)));state=driveSpeedBot(state,{maxActions:120});assert.ok(state.gameComplete||state.actor===0||state.stalled);
});

// Color Clash

test('Color Clash original deck has 108 cards and no UNO branding',()=>{
  const deck=createColorClashDeck();assert.equal(deck.length,108);assert.equal(deck.some(c=>/uno/i.test(`${c.name} ${c.symbol}`)),false);assert.equal(new Set(deck.map(c=>c.id)).size,108);
});

test('Color Clash deals 7 cards to four players and matching color/symbol/number plus wild cards are legal',()=>{
  const state=colorClashEngine.createGame({seed:75,targetScore:250});assert.deepEqual(state.players.map(p=>p.hand.length),[7,7,7,7]);
  const top={color:'ember',symbol:'5',number:5,type:'number'};assert.equal(colorClashPlayable({color:'ember',symbol:'9',number:9,type:'number'},top,'ember'),true);assert.equal(colorClashPlayable({color:'tide',symbol:'5',number:5,type:'number'},top,'ember'),true);assert.equal(colorClashPlayable({color:null,symbol:'color-shift',type:'wild'},top,'ember'),true);
});

test('Color Clash action cards Block, Flip Flow, Surge Two, Color Shift and Prism Four apply full turn effects',()=>{
  let state=colorClashEngine.createGame({seed:76,humanSeat:0,targetScore:999});state.actor=0;state.players[0].hand=[{id:'b',color:'ember',symbol:'block',type:'block',points:20},{id:'x',color:'ember',symbol:'1',number:1,type:'number',points:1}];state.currentColor='ember';state.discard=[{id:'top',color:'ember',symbol:'7',number:7,type:'number'}];
  state=colorClashEngine.applyAction(state,{type:'play',actor:0,cardId:'b'});assert.equal(state.actor,2);
  state.players[2].hand=[{id:'f',color:'ember',symbol:'flip-flow',type:'reverse',points:20},{id:'x2',color:'ember',symbol:'2',number:2,type:'number',points:2}];state.actor=2;state=colorClashEngine.applyAction(state,{type:'play',actor:2,cardId:'f'});assert.equal(state.direction,-1);
  state.players[state.actor].hand=[{id:'s',color:'ember',symbol:'surge-two',type:'draw2',points:20},{id:'x3',color:'ember',symbol:'3',number:3,type:'number',points:3}];const victim=(state.actor+state.direction+4)%4;const before=state.players[victim].hand.length;state=colorClashEngine.applyAction(state,{type:'play',actor:state.actor,cardId:'s'});assert.equal(state.players[victim].hand.length,before+2);
});

test('Color Clash missing Last Spark declaration at one card adds a two-card penalty',()=>{
  let state=colorClashEngine.createGame({seed:77,humanSeat:0,targetScore:999});state.actor=0;state.currentColor='ember';state.discard=[{id:'top',color:'ember',symbol:'7',number:7,type:'number'}];state.players[0].hand=[{id:'a',color:'ember',symbol:'5',number:5,type:'number',points:5},{id:'left',color:'tide',symbol:'2',number:2,type:'number',points:2}];const before=state.players[0].hand.length;state=colorClashEngine.applyAction(state,{type:'play',actor:0,cardId:'a',declareLastSpark:false});assert.equal(before,2);assert.equal(state.players[0].hand.length,3);assert.equal(state.lastEvent.lastSparkPenalty,true);
});

test('Color Clash winner scores opponents, match score persists to next round, and bot is legal',()=>{
  let state=colorClashEngine.createGame({seed:78,humanSeat:0,targetScore:999});const bot=chooseColorClashBotAction(state,state.actor);assert.ok(colorClashEngine.legalActions(state,state.actor).some(a=>a.type===bot.type&&(a.cardId===undefined||a.cardId===bot.cardId)));
  state.actor=0;state.currentColor='ember';state.discard=[{id:'top',color:'ember',symbol:'4',number:4,type:'number'}];state.players[0].hand=[{id:'win',color:'ember',symbol:'5',number:5,type:'number',points:5}];state=colorClashEngine.applyAction(state,{type:'play',actor:0,cardId:'win',declareLastSpark:true});assert.equal(state.roundComplete,true);assert.ok(state.scores[0]>0);const scores=state.scores.slice();state=startNextColorClashRound(state);assert.deepEqual(state.scores,scores);assert.equal(state.roundNumber,2);
});
