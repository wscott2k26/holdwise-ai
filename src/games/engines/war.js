import { shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);

function createGame(options={}){
  const deck=shuffledStandardDeck(options.seed??1);
  return{id:'war',seed:Number(options.seed??1),players:[{seat:0,deck:deck.slice(0,26)},{seat:1,deck:deck.slice(26)}],pot:[],battleNumber:0,maxBattles:Number(options.maxBattles??10000),gameComplete:false,winners:[],draw:false,lastBattle:null,seen:{}};
}
function signature(state){return `${state.players[0].deck.map(c=>c.id).join(',')}|${state.players[1].deck.map(c=>c.id).join(',')}`;}
function terminal(state){return Boolean(state.gameComplete)||state.players.some(player=>player.deck.length===0);}
function settleIfNeeded(state){
  if(state.players[0].deck.length===0||state.players[1].deck.length===0){state.gameComplete=true;const max=Math.max(...state.players.map(p=>p.deck.length));state.winners=state.players.filter(p=>p.deck.length===max).map(p=>p.seat);state.draw=state.winners.length!==1;return state;}
  if(state.battleNumber>=state.maxBattles){state.gameComplete=true;state.draw=true;state.winners=[];return state;}
  const sig=signature(state);state.seen[sig]=(state.seen[sig]||0)+1;if(state.seen[sig]>=3){state.gameComplete=true;state.draw=true;state.winners=[];}return state;
}
function drawCard(player){return player.deck.shift()||null;}
function award(state,winner){state.players[winner].deck.push(...state.pot);state.pot=[];}
function resolveBattle(state,depth=0){
  const first=drawCard(state.players[0]),second=drawCard(state.players[1]);
  if(!first||!second){if(first)state.pot.push(first);if(second)state.pot.push(second);if(first&&!second)award(state,0);if(second&&!first)award(state,1);return{winner:first?0:second?1:null,warDepth:depth};}
  state.pot.push(first,second);
  if(first.value>second.value){award(state,0);return{winner:0,warDepth:depth};}
  if(second.value>first.value){award(state,1);return{winner:1,warDepth:depth};}
  const canWar0=state.players[0].deck.length>0,canWar1=state.players[1].deck.length>0;
  if(!canWar0||!canWar1){if(canWar0&&!canWar1)award(state,0);else if(canWar1&&!canWar0)award(state,1);return{winner:canWar0?0:canWar1?1:null,warDepth:depth+1};}
  const downCount=Math.min(3,Math.max(0,state.players[0].deck.length-1),Math.max(0,state.players[1].deck.length-1));
  for(let i=0;i<downCount;i+=1){const a=drawCard(state.players[0]),b=drawCard(state.players[1]);if(a)state.pot.push(a);if(b)state.pot.push(b);}
  const result=resolveBattle(state,depth+1);return{...result,warDepth:Math.max(result.warDepth,depth+1)};
}
function legalActions(state){return terminal(state)?[{type:'new-game'}]:[{type:'battle'}];}
function applyAction(input,action){
  if(action?.type==='new-game')return createGame({seed:Number(input.seed||1)+99991,maxBattles:input.maxBattles});
  const state=clone(input);if(action?.type!=='battle'||terminal(state))throw new Error('Illegal War action');state.battleNumber+=1;const result=resolveBattle(state,0);state.lastBattle={...result,potWon:result.winner===null?0:undefined};settleIfNeeded(state);return state;
}
function result(state){return{complete:terminal(state),winners:state.winners||[],draw:Boolean(state.draw),battleNumber:state.battleNumber,cards:state.players.map(p=>p.deck.length)};}
function coachFacts(state){return[`Cards: You ${state.players[0].deck.length} · Opponent ${state.players[1].deck.length}.`,`Higher rank wins the battle. A tie triggers War: up to three cards face down, then another card decides the full pot.`,`Cycle protection declares a draw if a deterministic deal repeats indefinitely.`];}
export const warEngine={id:'war',createGame,legalActions,applyAction,isTerminal:terminal,result,coachFacts};
export default warEngine;
