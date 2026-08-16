import { shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);
const nextSeat=seat=>(seat+1)%4;
const suits=['hearts','diamonds','clubs','spades'];

function sortHand(hand){const order={clubs:0,diamonds:1,hearts:2,spades:3};return hand.sort((a,b)=>order[a.suit]-order[b.suit]||a.value-b.value);}
function cardPoints(card){if(card.rank==='8')return 50;if(card.value>=10&&card.value<=13)return 10;if(card.value===14)return 1;return card.value;}

export function crazyEightsPlayable(card,top,currentSuit){
  if(!card||!top)return false;
  return card.rank==='8'||card.suit===currentSuit||card.rank===top.rank;
}

function buildRound(base,{dealer,roundNumber}){
  const deck=shuffledStandardDeck(base.seed+roundNumber*5171);
  const players=Array.from({length:4},(_,seat)=>({seat,name:seat===base.humanSeat?'You':`Player ${seat+1}`,isHuman:seat===base.humanSeat,hand:[]}));
  for(let round=0;round<5;round+=1)for(let seat=0;seat<4;seat+=1)players[seat].hand.push(deck.pop());
  players.forEach(player=>sortHand(player.hand));
  let discardIndex=deck.length-1;
  while(discardIndex>=0&&deck[discardIndex].rank==='8')discardIndex-=1;
  if(discardIndex<0)throw new Error('Crazy Eights could not find opening non-eight');
  const [opener]=deck.splice(discardIndex,1);
  return{...base,dealer,roundNumber,players,stock:deck,discard:[opener],currentSuit:opener.suit,actor:nextSeat(dealer),phase:'playing',drawnCardId:null,roundComplete:false,matchComplete:false,roundResult:null,winners:[],lastEvent:null};
}
function createGame(options={}){const dealer=((Number(options.dealer??3)%4)+4)%4,roundNumber=Number(options.roundNumber??1);return buildRound({id:'crazy-eights',seed:Number(options.seed??1),humanSeat:Number(options.humanSeat??0),targetScore:Number(options.targetScore??100),scores:[0,0,0,0],dealer,roundNumber},{dealer,roundNumber});}

function replenishStock(state){
  if(state.stock.length||state.discard.length<=1)return;
  const top=state.discard.pop();
  state.stock=state.discard.reverse();
  state.discard=[top];
}
function scoreRound(state,winner){
  const points=state.players.reduce((sum,player,seat)=>seat===winner?sum:sum+player.hand.reduce((s,card)=>s+cardPoints(card),0),0);
  state.scores[winner]+=points;state.roundComplete=true;state.phase='result';state.actor=null;state.matchComplete=state.scores[winner]>=state.targetScore;state.winners=state.matchComplete?[winner]:[];state.roundResult={winner,points,scores:state.scores.slice()};return state;
}
function legalActions(state,actor=state.actor){
  if(state.phase!=='playing'||state.roundComplete||actor!==state.actor)return[];
  const hand=state.players[actor].hand,top=state.discard.at(-1);
  let playable=hand.filter(card=>crazyEightsPlayable(card,top,state.currentSuit));
  if(state.drawnCardId)playable=playable.filter(card=>card.id===state.drawnCardId);
  const actions=[];
  for(const card of playable){
    if(card.rank==='8')for(const suit of suits)actions.push({type:'play',actor,cardId:card.id,chosenSuit:suit});
    else actions.push({type:'play',actor,cardId:card.id});
  }
  if(state.drawnCardId){actions.push({type:'pass-drawn',actor});return actions;}
  if(!playable.length)actions.push({type:'draw',actor});
  return actions;
}
function applyAction(input,action){
  const state=clone(input),actor=Number(action?.actor);if(actor!==state.actor)throw new Error('Illegal Crazy Eights action: wrong turn');const legal=legalActions(state,actor);const type=action?.type;
  if(type==='play'){
    const candidate=legal.find(a=>a.type==='play'&&a.cardId===action.cardId&&(a.chosenSuit??null)===(action.chosenSuit??null));if(!candidate)throw new Error('Illegal Crazy Eights card');
    const index=state.players[actor].hand.findIndex(card=>card.id===action.cardId),[played]=state.players[actor].hand.splice(index,1);state.discard.push(played);state.currentSuit=played.rank==='8'?action.chosenSuit:played.suit;state.drawnCardId=null;state.lastEvent={type:'play',actor,cardId:played.id,currentSuit:state.currentSuit};if(!state.players[actor].hand.length)return scoreRound(state,actor);state.actor=nextSeat(actor);return state;
  }
  if(type==='draw'){
    if(!legal.some(a=>a.type==='draw'))throw new Error('Illegal Crazy Eights draw');replenishStock(state);if(!state.stock.length){state.actor=nextSeat(actor);state.lastEvent={type:'pass',actor,reason:'stock-empty'};return state;}
    const drawn=state.stock.pop();state.players[actor].hand.push(drawn);sortHand(state.players[actor].hand);if(crazyEightsPlayable(drawn,state.discard.at(-1),state.currentSuit)){state.drawnCardId=drawn.id;state.lastEvent={type:'draw-playable',actor,cardId:drawn.id};}else{state.drawnCardId=null;state.actor=nextSeat(actor);state.lastEvent={type:'draw-pass',actor,cardId:drawn.id};}return state;
  }
  if(type==='pass-drawn'){
    if(!legal.some(a=>a.type==='pass-drawn'))throw new Error('Illegal Crazy Eights pass');state.drawnCardId=null;state.actor=nextSeat(actor);state.lastEvent={type:'pass-drawn',actor};return state;
  }
  throw new Error(`Unknown Crazy Eights action: ${type}`);
}
export function chooseCrazyEightsBotAction(state,actor=state.actor){
  const legal=legalActions(state,actor);if(!legal.length)throw new Error('Crazy Eights bot has no legal action');const plays=legal.filter(a=>a.type==='play');if(plays.length){const hand=state.players[actor].hand;const scored=plays.map(action=>({action,score:cardPoints(hand.find(card=>card.id===action.cardId))+(action.chosenSuit?hand.filter(card=>card.suit===action.chosenSuit).length*2:0)})).sort((a,b)=>b.score-a.score);return scored[0].action;}return legal.find(a=>a.type==='draw')||legal.find(a=>a.type==='pass-drawn')||legal[0];
}
export function startNextCrazyEightsRound(input){if(!input.roundComplete)throw new Error('Crazy Eights round not complete');if(input.matchComplete)throw new Error('Crazy Eights match complete');const base=clone(input),dealer=nextSeat(base.dealer),roundNumber=base.roundNumber+1;return buildRound({...base,players:undefined,stock:undefined,discard:undefined},{dealer,roundNumber});}
function result(state){return state.roundResult||null;}
function coachFacts(state,actor=state.humanSeat){const top=state.discard.at(-1);return[`Score: ${state.scores[actor]} · target ${state.targetScore}.`,`Current suit: ${state.currentSuit}. Top card: ${top?.label||'none'}.`,`Match suit or rank. Any Eight is wild and lets you choose the next suit.`];}
export const crazyEightsEngine={id:'crazy-eights',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.matchComplete),result,coachFacts};
export default crazyEightsEngine;
