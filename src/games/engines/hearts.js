import { shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);
const nextSeat=seat=>(seat+1)%4;
const isPointCard=card=>card?.suit==='hearts'||(card?.suit==='spades'&&card?.rank==='Q');
const pointsForCard=card=>card?.suit==='hearts'?1:(card?.suit==='spades'&&card?.rank==='Q'?13:0);
const DIRECTIONS=['left','right','across','hold'];

function sortHand(hand){const order={clubs:0,diamonds:1,spades:2,hearts:3};return hand.sort((a,b)=>order[a.suit]-order[b.suit]||a.value-b.value);}
function dealHands(seed){const deck=shuffledStandardDeck(seed);const hands=Array.from({length:4},()=>[]);let seat=0;while(deck.length){hands[seat].push(deck.pop());seat=nextSeat(seat);}return hands.map(sortHand);}
export function passTarget(seat,direction){if(direction==='left')return(seat+1)%4;if(direction==='right')return(seat+3)%4;if(direction==='across')return(seat+2)%4;return seat;}
function findTwoClubs(players){for(let seat=0;seat<4;seat+=1)if(players[seat].hand.some(card=>card.id==='2clubs'))return seat;throw new Error('2 of Clubs missing');}

export function legalHeartsCards(hand,trick=[],heartsBroken=false,trickNumber=0){
  if(!Array.isArray(hand)||!hand.length)return[];
  if(!trick.length){
    if(trickNumber===0){const two=hand.filter(card=>card.id==='2clubs');if(two.length)return two;}
    if(!heartsBroken){const nonHearts=hand.filter(card=>card.suit!=='hearts');if(nonHearts.length)return nonHearts;}
    return hand.slice();
  }
  const leadSuit=trick[0].card.suit;
  const following=hand.filter(card=>card.suit===leadSuit);
  if(following.length)return following;
  if(trickNumber===0){const nonPoints=hand.filter(card=>!isPointCard(card));if(nonPoints.length)return nonPoints;}
  return hand.slice();
}

export function heartsTrickWinner(trick){
  if(!Array.isArray(trick)||trick.length!==4)throw new Error('Hearts trick requires four cards');
  const lead=trick[0].card.suit;return trick.filter(play=>play.card.suit===lead).reduce((best,play)=>play.card.value>best.card.value?play:best).seat;
}

export function scoreHeartsRound(roundPoints,scores=[0,0,0,0],targetScore=100){
  let applied=roundPoints.slice();const shooter=roundPoints.findIndex(points=>points===26);
  if(shooter>=0)applied=roundPoints.map((_,seat)=>seat===shooter?0:26);
  const nextScores=scores.map((score,seat)=>score+applied[seat]);
  const matchComplete=nextScores.some(score=>score>=targetScore);
  let winners=[];
  if(matchComplete){const low=Math.min(...nextScores);winners=nextScores.map((score,seat)=>score===low?seat:null).filter(seat=>seat!==null);}
  return{roundPoints:applied,scores:nextScores,matchComplete,winners,shotMoon:shooter>=0?shooter:null};
}

function buildRound(base,{dealer,roundNumber}){
  const hands=dealHands(base.seed+roundNumber*7919);const players=hands.map((hand,seat)=>({seat,name:seat===base.humanSeat?'You':`Player ${seat+1}`,isHuman:seat===base.humanSeat,hand,roundPoints:0}));
  const passDirection=DIRECTIONS[(roundNumber-1)%4];
  const state={...base,dealer,roundNumber,players,passDirection,passes:[null,null,null,null],phase:passDirection==='hold'?'playing':'passing',actor:null,trick:[],trickNumber:0,heartsBroken:false,roundComplete:false,matchComplete:false,roundPoints:[0,0,0,0],winners:[],shotMoon:null};
  if(state.phase==='playing')state.actor=findTwoClubs(players);
  return state;
}
function createGame(options={}){const seed=Number(options.seed??1),humanSeat=Number(options.humanSeat??0),dealer=((Number(options.dealer??0)%4)+4)%4,roundNumber=Number(options.roundNumber??1);return buildRound({id:'hearts',seed,humanSeat,targetScore:Number(options.targetScore??100),scores:[0,0,0,0],dealer,roundNumber},{dealer,roundNumber});}

function legalActions(state,actor=state.actor){
  if(state.roundComplete||state.matchComplete)return[];
  if(state.phase==='passing')return state.passes[actor]?[]:[{type:'pass',actor,count:3}];
  if(state.phase==='playing'&&actor===state.actor)return legalHeartsCards(state.players[actor].hand,state.trick,state.heartsBroken,state.trickNumber).map(card=>({type:'play',actor,cardId:card.id}));
  return[];
}

function completePassing(state){
  const outgoing=state.passes.map((ids,seat)=>ids.map(id=>{const card=state.players[seat].hand.find(item=>item.id===id);if(!card)throw new Error('Passed card missing');return card;}));
  for(let seat=0;seat<4;seat+=1){const ids=new Set(state.passes[seat]);state.players[seat].hand=state.players[seat].hand.filter(card=>!ids.has(card.id));}
  for(let seat=0;seat<4;seat+=1){const target=passTarget(seat,state.passDirection);state.players[target].hand.push(...outgoing[seat]);}
  for(const player of state.players)sortHand(player.hand);
  state.phase='playing';state.actor=findTwoClubs(state.players);
}

function applyAction(input,action){
  const state=clone(input);const type=action?.type;
  if(state.phase==='passing'){
    if(type!=='pass')throw new Error('Illegal Hearts passing action');const actor=Number(action.actor);if(actor<0||actor>3||state.passes[actor])throw new Error('Illegal Hearts pass');
    const ids=Array.isArray(action.cardIds)?action.cardIds:[];if(ids.length!==3||new Set(ids).size!==3)throw new Error('Hearts pass requires exactly three unique cards');
    if(ids.some(id=>!state.players[actor].hand.some(card=>card.id===id)))throw new Error('Hearts pass includes card not in hand');state.passes[actor]=ids.slice();if(state.passes.every(Boolean))completePassing(state);return state;
  }
  if(state.phase!=='playing'||type!=='play')throw new Error('Illegal Hearts play action');const actor=Number(action.actor);if(actor!==state.actor)throw new Error('Illegal Hearts action: wrong turn');
  const legal=legalHeartsCards(state.players[actor].hand,state.trick,state.heartsBroken,state.trickNumber);if(!legal.some(card=>card.id===action.cardId))throw new Error('Illegal Hearts card');
  const index=state.players[actor].hand.findIndex(card=>card.id===action.cardId);const [played]=state.players[actor].hand.splice(index,1);if(played.suit==='hearts')state.heartsBroken=true;state.trick.push({seat:actor,card:played});
  if(state.trick.length<4){state.actor=nextSeat(actor);return state;}
  const winner=heartsTrickWinner(state.trick);const points=state.trick.reduce((sum,play)=>sum+pointsForCard(play.card),0);state.players[winner].roundPoints+=points;state.roundPoints[winner]+=points;state.trickNumber+=1;state.trick=[];
  if(state.trickNumber===13){const scored=scoreHeartsRound(state.roundPoints,state.scores,state.targetScore);state.roundPoints=scored.roundPoints;state.scores=scored.scores;state.matchComplete=scored.matchComplete;state.winners=scored.winners;state.shotMoon=scored.shotMoon;state.roundComplete=true;state.phase='result';state.actor=null;return state;}
  state.actor=winner;return state;
}

export function chooseHeartsBotPass(state,seat){
  const hand=state.players[seat]?.hand||[];return hand.slice().sort((a,b)=>{const pa=pointsForCard(a),pb=pointsForCard(b);if(pa!==pb)return pb-pa;if(a.suit==='spades'&&a.value>=12&&b.suit!=='spades')return-1;if(b.suit==='spades'&&b.value>=12&&a.suit!=='spades')return 1;return b.value-a.value;}).slice(0,3).map(card=>card.id);
}
export function chooseHeartsBotCard(state,seat=state.actor){
  const legal=legalHeartsCards(state.players[seat]?.hand||[],state.trick,state.heartsBroken,state.trickNumber);if(!legal.length)throw new Error('Hearts bot has no legal card');
  let chosen;
  if(state.trick.length){const lead=state.trick[0].card.suit;const leadCards=state.trick.filter(play=>play.card.suit===lead);const currentHigh=Math.max(...leadCards.map(play=>play.card.value));const following=legal.filter(card=>card.suit===lead);if(following.length){const under=following.filter(card=>card.value<currentHigh).sort((a,b)=>b.value-a.value);chosen=under[0]||following.slice().sort((a,b)=>a.value-b.value)[0];}else{chosen=legal.slice().sort((a,b)=>pointsForCard(b)-pointsForCard(a)||b.value-a.value)[0];}}
  else chosen=legal.slice().sort((a,b)=>pointsForCard(a)-pointsForCard(b)||a.value-b.value)[0];
  return{type:'play',actor:seat,cardId:chosen.id};
}

export function startNextHeartsRound(input){if(!input.roundComplete)throw new Error('Hearts round is not complete');if(input.matchComplete)throw new Error('Hearts match is complete');const base=clone(input),roundNumber=base.roundNumber+1,dealer=nextSeat(base.dealer);return buildRound({...base,players:undefined,passes:undefined,trick:undefined},{dealer,roundNumber});}
function coachFacts(state,actor=state.humanSeat){const facts=[`Score: ${state.scores[actor]} · target ${state.targetScore}; lowest score wins.`,`Pass direction: ${state.passDirection}.`];if(state.phase==='passing')facts.push('Pass exactly three cards before play begins.');if(state.phase==='playing'){facts.push(`Hearts ${state.heartsBroken?'are broken and may be led':'cannot be led unless your hand is all hearts'}.`);facts.push(`Round points collected: ${state.roundPoints[actor]}.`);facts.push(`Legal cards now: ${actor===state.actor?legalHeartsCards(state.players[actor].hand,state.trick,state.heartsBroken,state.trickNumber).length:0}.`);}if(state.shotMoon!==null)facts.push(`Player ${state.shotMoon+1} shot the moon.`);return facts;}
export const heartsEngine={id:'hearts',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.matchComplete),result:state=>state.roundComplete?{scores:state.scores,roundPoints:state.roundPoints,matchComplete:state.matchComplete,winners:state.winners,shotMoon:state.shotMoon}:null,coachFacts};
export default heartsEngine;
