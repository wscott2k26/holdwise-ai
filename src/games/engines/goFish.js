import { shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);
const nextSeat=seat=>(seat+1)%4;

function sortHand(hand){return hand.sort((a,b)=>a.value-b.value||a.suit.localeCompare(b.suit));}
function collectBooks(player){
  const ranks=new Map();for(const card of player.hand){if(!ranks.has(card.rank))ranks.set(card.rank,[]);ranks.get(card.rank).push(card);}
  let added=0;
  for(const [rank,cards] of ranks){if(cards.length===4){player.hand=player.hand.filter(card=>card.rank!==rank);player.bookRanks.push(rank);player.books+=1;added+=1;}}
  return added;
}
function refillIfEmpty(state,seat){
  const player=state.players[seat];if(player.hand.length||!state.stock.length)return;
  const count=Math.min(5,state.stock.length);for(let i=0;i<count;i+=1)player.hand.push(state.stock.pop());sortHand(player.hand);collectBooks(player);
}
function createGame(options={}){
  const deck=shuffledStandardDeck(options.seed??1);const players=Array.from({length:4},(_,seat)=>({seat,name:seat===Number(options.humanSeat??0)?'You':`Player ${seat+1}`,isHuman:seat===Number(options.humanSeat??0),hand:[],books:0,bookRanks:[]}));
  for(let round=0;round<5;round+=1)for(let seat=0;seat<4;seat+=1)players[seat].hand.push(deck.pop());players.forEach(player=>{sortHand(player.hand);collectBooks(player);});
  return{id:'go-fish',seed:Number(options.seed??1),humanSeat:Number(options.humanSeat??0),players,stock:deck,actor:Number(options.startingSeat??0),lastEvent:null,gameComplete:false,winners:[]};
}
function totalBooks(state){return state.players.reduce((sum,p)=>sum+p.books,0);}
function terminal(state){return totalBooks(state)>=13||(state.stock.length===0&&state.players.every(player=>player.hand.length===0));}
function settle(state){if(!terminal(state))return state;state.gameComplete=true;const max=Math.max(...state.players.map(p=>p.books));state.winners=state.players.filter(p=>p.books===max).map(p=>p.seat);state.actor=null;return state;}
function legalActions(state,actor=state.actor){
  if(state.gameComplete||actor!==state.actor)return[];refillIfEmpty(state,actor);if(!state.players[actor].hand.length)return[];
  const ranks=[...new Set(state.players[actor].hand.map(card=>card.rank))];const actions=[];
  for(const rank of ranks)for(let target=0;target<4;target+=1)if(target!==actor&&state.players[target].hand.length)actions.push({type:'ask',actor,target,rank});
  return actions;
}
function advanceToNextWithCards(state,from){
  for(let offset=1;offset<=4;offset+=1){const seat=(from+offset)%4;refillIfEmpty(state,seat);if(state.players[seat].hand.length){state.actor=seat;return;}}
  state.actor=null;
}
function applyAction(input,action){
  const state=clone(input),actor=Number(action?.actor);if(actor!==state.actor||action?.type!=='ask')throw new Error('Illegal Go Fish action');refillIfEmpty(state,actor);
  const player=state.players[actor],target=state.players[Number(action.target)];if(!target||target.seat===actor||!target.hand.length||!player.hand.some(card=>card.rank===action.rank))throw new Error('Illegal Go Fish ask');
  const matches=target.hand.filter(card=>card.rank===action.rank);
  if(matches.length){target.hand=target.hand.filter(card=>card.rank!==action.rank);player.hand.push(...matches);sortHand(player.hand);const books=collectBooks(player);state.lastEvent={type:'got-cards',actor,target:target.seat,rank:action.rank,count:matches.length,books};refillIfEmpty(state,target.seat);if(!terminal(state))state.actor=actor;}
  else{
    let drawn=null;if(state.stock.length){drawn=state.stock.pop();player.hand.push(drawn);sortHand(player.hand);}const books=collectBooks(player);const luckyFish=Boolean(drawn&&drawn.rank===action.rank);state.lastEvent={type:'go-fish',actor,target:target.seat,rank:action.rank,drawn:drawn?.id||null,luckyFish,books};if(!luckyFish)advanceToNextWithCards(state,actor);
  }
  refillIfEmpty(state,actor);return settle(state);
}
export function chooseGoFishBotAction(state,actor=state.actor){
  const legal=legalActions(state,actor);if(!legal.length)throw new Error('Go Fish bot has no legal ask');const counts=new Map();for(const card of state.players[actor].hand)counts.set(card.rank,(counts.get(card.rank)||0)+1);return legal.slice().sort((a,b)=>(counts.get(b.rank)||0)-(counts.get(a.rank)||0)||state.players[b.target].hand.length-state.players[a.target].hand.length)[0];
}
function result(state){const max=Math.max(...state.players.map(p=>p.books));return{complete:terminal(state),books:state.players.map(p=>p.books),winners:state.players.filter(p=>p.books===max).map(p=>p.seat)};}
function coachFacts(state,actor=state.humanSeat){return[`Books: ${state.players[actor].books}. Total books collected: ${totalBooks(state)}/13.`,`Ask another player for a rank you already hold. If they have it, every card of that rank comes to you and you ask again.`,`Four of one rank automatically becomes a book.`];}
export const goFishEngine={id:'go-fish',createGame,legalActions,applyAction,isTerminal:terminal,result,coachFacts};
export default goFishEngine;
