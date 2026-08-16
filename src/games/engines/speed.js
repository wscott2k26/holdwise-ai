import { shuffledStandardDeck } from './solitaireCommon.js';
import { seededRandom, shuffle } from '../../lib/cards/deck.js';

const clone=value=>structuredClone(value);
const other=seat=>1-seat;
const speedValue=card=>card?.value===14?1:card?.value;

export function speedAdjacent(card,target){
  if(!card||!target)return false;const a=speedValue(card),b=speedValue(target);return Math.abs(a-b)===1||(a===1&&b===13)||(a===13&&b===1);
}

function refill(player){while(player.hand.length<5&&player.stock.length)player.hand.push(player.stock.shift());}
function createGame(options={}){
  const deck=shuffledStandardDeck(options.seed??1);const players=[0,1].map(seat=>({seat,name:seat===Number(options.humanSeat??0)?'You':'Opponent',hand:[],stock:[]}));
  for(let seat=0;seat<2;seat+=1){players[seat].hand=deck.splice(0,5);players[seat].stock=deck.splice(0,15);}
  const center=[deck.shift(),deck.shift()];const reserves=[deck.splice(0,5),deck.splice(0,5)];
  return{id:'speed',seed:Number(options.seed??1),humanSeat:Number(options.humanSeat??0),players,center,reserves,spent:[[],[]],actor:Number(options.startingSeat??options.humanSeat??0),gameComplete:false,winners:[],draw:false,stalled:false,plays:0,lastEvent:null};
}
function playerDone(player){return player.hand.length===0&&player.stock.length===0;}
function settle(state){
  const winners=state.players.filter(player=>playerDone(player)).map(player=>player.seat);if(winners.length){state.gameComplete=true;state.winners=winners;state.draw=winners.length>1;state.actor=null;return state;}
  return state;
}
function playActions(state,actor){const actions=[];for(const card of state.players[actor].hand)for(let pile=0;pile<2;pile+=1)if(speedAdjacent(card,state.center[pile]))actions.push({type:'play',actor,cardId:card.id,pile});return actions;}
function noOneCanPlay(state){return playActions(state,0).length===0&&playActions(state,1).length===0;}
function canFlip(state){return state.reserves.some(pile=>pile.length>0)||state.spent.some(pile=>pile.length>0);}
function legalActions(state,actor=state.actor){
  if(state.gameComplete||actor===null||actor!==state.actor)return[];
  const own=playActions(state,actor);if(own.length)return own;
  const opponent=playActions(state,other(actor));if(opponent.length)return[{type:'pass',actor}];
  if(noOneCanPlay(state)&&canFlip(state))return[{type:'flip-reserves',actor}];
  return[];
}
function recycleReserve(state,pile){
  if(state.reserves[pile].length||!state.spent[pile].length)return;
  state.reserves[pile]=shuffle(state.spent[pile],seededRandom(state.seed+state.plays*101+pile*17));state.spent[pile]=[];
}
function applyAction(input,action){
  const state=clone(input),actor=Number(action?.actor);if(actor!==state.actor)throw new Error('Illegal Speed action: wrong turn');const legal=legalActions(state,actor),type=action?.type;
  if(type==='play'){
    if(!legal.some(a=>a.type==='play'&&a.cardId===action.cardId&&a.pile===Number(action.pile)))throw new Error('Illegal Speed play');const player=state.players[actor],index=player.hand.findIndex(card=>card.id===action.cardId),[played]=player.hand.splice(index,1),pile=Number(action.pile);state.spent[pile].push(state.center[pile]);state.center[pile]=played;refill(player);state.plays+=1;state.lastEvent={type:'play',actor,cardId:played.id,pile};settle(state);if(!state.gameComplete)state.actor=other(actor);return state;
  }
  if(type==='pass'){
    if(!legal.some(a=>a.type==='pass'))throw new Error('Illegal Speed pass');state.actor=other(actor);state.lastEvent={type:'pass',actor};return state;
  }
  if(type==='flip-reserves'){
    if(!legal.some(a=>a.type==='flip-reserves'))throw new Error('Illegal Speed reserve flip');for(let pile=0;pile<2;pile+=1){recycleReserve(state,pile);if(state.reserves[pile].length){state.spent[pile].push(state.center[pile]);state.center[pile]=state.reserves[pile].shift();}}
    state.lastEvent={type:'flip-reserves'};state.actor=state.humanSeat;state.stalled=noOneCanPlay(state)&&!canFlip(state);if(state.stalled){state.gameComplete=true;state.draw=true;state.winners=[];}return state;
  }
  throw new Error(`Unknown Speed action: ${type}`);
}
function permanentStall(state){return !state.players.some(player=>player.hand.length===0&&player.stock.length===0)&&noOneCanPlay(state)&&!canFlip(state);}
export function chooseSpeedBotAction(state,actor=state.actor){const legal=legalActions(state,actor);if(!legal.length)throw new Error('Speed bot has no legal action');const plays=legal.filter(a=>a.type==='play');if(plays.length){const player=state.players[actor];return plays.slice().sort((a,b)=>{const ca=player.hand.find(c=>c.id===a.cardId),cb=player.hand.find(c=>c.id===b.cardId);return (cb?.value||0)-(ca?.value||0);})[0];}return legal[0];}
export function driveSpeedBot(input,{maxActions=200}={}){let state=clone(input),guard=0;while(!state.gameComplete&&!state.stalled&&state.actor!==state.humanSeat&&guard++<maxActions){const legal=legalActions(state,state.actor);if(!legal.length){state.stalled=true;state.gameComplete=true;state.draw=true;state.winners=[];break;}state=applyAction(state,chooseSpeedBotAction(state,state.actor));}if(guard>=maxActions){state.stalled=true;}return state;}
function result(state){const dynamicWinners=state.players.filter(player=>player.hand.length===0&&player.stock.length===0).map(player=>player.seat);const winners=state.winners?.length?state.winners:dynamicWinners;return{complete:Boolean(state.gameComplete)||winners.length>0,winners,draw:Boolean(state.draw)||(winners.length>1)||permanentStall(state)||permanentStall(state),plays:state.plays,cardsRemaining:state.players.map(p=>p.hand.length+p.stock.length)};}
function coachFacts(state,actor=state.humanSeat){return[`Cards left: You ${state.players[actor].hand.length+state.players[actor].stock.length} · Opponent ${state.players[other(actor)].hand.length+state.players[other(actor)].stock.length}.`,`Play a card one rank above or below either center pile. Ace connects to both King and Two.`,`Your hand refills to five from your personal stock. When both players are stuck, flip the reserve piles.`];}
export const speedEngine={id:'speed',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.gameComplete)||state.players.some(player=>player.hand.length===0&&player.stock.length===0)||permanentStall(state)||permanentStall(state),result,coachFacts};
export default speedEngine;
