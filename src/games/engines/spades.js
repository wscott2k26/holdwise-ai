import { shuffledStandardDeck } from './solitaireCommon.js';

const clone = value => structuredClone(value);
const nextSeat = seat => (seat + 1) % 4;

function sortHand(hand) {
  const suitOrder = { clubs:0, diamonds:1, hearts:2, spades:3 };
  return hand.sort((a,b)=>suitOrder[a.suit]-suitOrder[b.suit] || a.value-b.value);
}

function dealHands(seed) {
  const deck = shuffledStandardDeck(seed);
  const hands = Array.from({length:4},()=>[]);
  let seat=0;
  while(deck.length){ hands[seat].push(deck.pop()); seat=nextSeat(seat); }
  return hands.map(sortHand);
}

export function legalSpadesCards(hand, trick = [], spadesBroken = false) {
  if (!Array.isArray(hand) || !hand.length) return [];
  if (trick.length) {
    const leadSuit = trick[0].card.suit;
    const following = hand.filter(card=>card.suit===leadSuit);
    return following.length ? following : hand.slice();
  }
  if (spadesBroken) return hand.slice();
  const nonSpades = hand.filter(card=>card.suit!=='spades');
  return nonSpades.length ? nonSpades : hand.slice();
}

export function spadesTrickWinner(trick) {
  if (!Array.isArray(trick) || trick.length !== 4) throw new Error('Spades trick requires four cards');
  const leadSuit = trick[0].card.suit;
  const spades = trick.filter(play=>play.card.suit==='spades');
  const eligible = spades.length ? spades : trick.filter(play=>play.card.suit===leadSuit);
  return eligible.reduce((best,play)=>play.card.value>best.card.value?play:best).seat;
}

export function scoreSpadesRound({ bids, tricks, nil, scores=[0,0], bags=[0,0], targetScore=500 }) {
  const nextScores = scores.slice();
  const nextBags = bags.slice();
  const roundScores = [0,0];

  for (let team=0; team<2; team+=1) {
    const seats = team===0 ? [0,2] : [1,3];
    const contract = seats.reduce((sum,seat)=>sum+(nil[seat]?0:Number(bids[seat]||0)),0);
    const teamTricks = seats.reduce((sum,seat)=>sum+Number(tricks[seat]||0),0);
    const made = teamTricks >= contract;
    const over = made ? Math.max(0,teamTricks-contract) : 0;
    let round = made ? contract*10 + over : -contract*10;

    for (const seat of seats) {
      if (nil[seat]) round += Number(tricks[seat]||0)===0 ? 100 : -100;
    }

    nextBags[team] += over;
    while (nextBags[team] >= 10) {
      nextBags[team] -= 10;
      round -= 100;
    }
    roundScores[team] = round;
    nextScores[team] += round;
  }

  const reached = nextScores.map(score=>score>=targetScore);
  const matchComplete = reached.some(Boolean) && nextScores[0] !== nextScores[1];
  let winners=[];
  if(matchComplete){
    const best=Math.max(...nextScores);
    winners=nextScores.map((score,index)=>score===best?index:null).filter(index=>index!==null);
  }
  return { roundScores, scores:nextScores, bags:nextBags, matchComplete, winners };
}

function buildRound(base,{dealer,roundNumber}){
  const hands=dealHands(base.seed + roundNumber*7919);
  const players=hands.map((hand,seat)=>({seat,name:seat===base.humanSeat?'You':`Player ${seat+1}`,isHuman:seat===base.humanSeat,hand,tricks:0}));
  return {
    ...base,
    dealer,
    roundNumber,
    players,
    bids:[null,null,null,null],
    nil:[false,false,false,false],
    phase:'bidding',
    actor:nextSeat(dealer),
    bidCount:0,
    trick:[],
    trickNumber:0,
    spadesBroken:false,
    roundComplete:false,
    matchComplete:false,
    roundScores:[0,0],
    winners:[],
  };
}

function createGame(options={}){
  const seed=Number(options.seed??1);
  const humanSeat=Number(options.humanSeat??0);
  const dealer=((Number(options.dealer??0)%4)+4)%4;
  const base={
    id:'spades',seed,humanSeat,targetScore:Number(options.targetScore??500),
    scores:[0,0],bags:[0,0],roundNumber:Number(options.roundNumber??1),dealer,
  };
  return buildRound(base,{dealer,roundNumber:base.roundNumber});
}

function legalActions(state,actor=state.actor){
  if(state.roundComplete||state.matchComplete||actor!==state.actor)return[];
  if(state.phase==='bidding')return Array.from({length:14},(_,bid)=>({type:'bid',actor,bid}));
  if(state.phase==='playing')return legalSpadesCards(state.players[actor].hand,state.trick,state.spadesBroken).map(card=>({type:'play',actor,cardId:card.id}));
  return[];
}

function applyAction(input,action){
  const state=clone(input);const actor=Number(action?.actor);
  if(actor!==state.actor)throw new Error('Illegal Spades action: wrong turn');
  if(state.phase==='bidding'){
    if(action?.type!=='bid')throw new Error('Illegal Spades bidding action');
    const bid=Math.floor(Number(action.bid));if(bid<0||bid>13)throw new Error('Illegal Spades bid');
    state.bids[actor]=bid;state.nil[actor]=bid===0;state.bidCount+=1;
    if(state.bidCount===4){state.phase='playing';state.actor=nextSeat(state.dealer);}else state.actor=nextSeat(actor);
    return state;
  }
  if(state.phase!=='playing'||action?.type!=='play')throw new Error('Illegal Spades play action');
  const legal=legalSpadesCards(state.players[actor].hand,state.trick,state.spadesBroken);
  if(!legal.some(card=>card.id===action.cardId))throw new Error('Illegal Spades card');
  const index=state.players[actor].hand.findIndex(card=>card.id===action.cardId);
  const [played]=state.players[actor].hand.splice(index,1);
  if(played.suit==='spades')state.spadesBroken=true;
  state.trick.push({seat:actor,card:played});
  if(state.trick.length<4){state.actor=nextSeat(actor);return state;}

  const winner=spadesTrickWinner(state.trick);state.players[winner].tricks+=1;state.trickNumber+=1;state.trick=[];
  if(state.trickNumber===13){
    const scored=scoreSpadesRound({bids:state.bids,tricks:state.players.map(player=>player.tricks),nil:state.nil,scores:state.scores,bags:state.bags,targetScore:state.targetScore});
    state.scores=scored.scores;state.bags=scored.bags;state.roundScores=scored.roundScores;state.matchComplete=scored.matchComplete;state.winners=scored.winners;state.roundComplete=true;state.phase='result';state.actor=null;return state;
  }
  state.actor=winner;return state;
}

export function chooseSpadesBotBid(state,seat=state.actor){
  const hand=state.players[seat]?.hand||[];
  const spades=hand.filter(card=>card.suit==='spades');
  let estimate=0;
  for(const card of hand){
    if(card.value===14)estimate+=0.9;
    else if(card.value===13)estimate+=0.55;
    else if(card.value===12)estimate+=0.25;
  }
  estimate += Math.max(0,spades.length-3)*0.55;
  const strongSpades=spades.filter(card=>card.value>=11).length;estimate+=strongSpades*0.25;
  const rounded=Math.max(1,Math.min(7,Math.round(estimate)));
  const highCards=hand.filter(card=>card.value>=12).length;
  return highCards===0&&spades.length<=2?0:rounded;
}

export function chooseSpadesBotCard(state,seat=state.actor){
  const legal=legalSpadesCards(state.players[seat]?.hand||[],state.trick,state.spadesBroken);
  if(!legal.length)throw new Error('Spades bot has no legal card');
  const bid=state.bids[seat]??1,tricks=state.players[seat].tricks;
  const wantsTrick=tricks<bid;
  const sorted=legal.slice().sort((a,b)=>a.value-b.value || (a.suit==='spades'?1:0)-(b.suit==='spades'?1:0));
  const chosen=wantsTrick?sorted.at(-1):sorted[0];
  return{type:'play',actor:seat,cardId:chosen.id};
}

export function startNextSpadesRound(input){
  if(!input.roundComplete)throw new Error('Spades round is not complete');
  if(input.matchComplete)throw new Error('Spades match is complete');
  const base=clone(input);const roundNumber=base.roundNumber+1,dealer=nextSeat(base.dealer);
  return buildRound({...base,players:undefined,bids:undefined,nil:undefined,trick:undefined},{dealer,roundNumber});
}

function coachFacts(state,actor=state.humanSeat){
  const team=actor%2;const facts=[`Partnership score: ${state.scores[team]} · bags ${state.bags[team]}/10.`,`Target score: ${state.targetScore}.`];
  if(state.phase==='bidding')facts.push(`Your bid commits your partnership to that many total tricks; bid 0 to attempt Nil.`);
  if(state.phase==='playing'){facts.push(`Your bid: ${state.bids[actor]} · tricks won: ${state.players[actor].tricks}.`);facts.push(`Spades ${state.spadesBroken?'are broken and may be led':'cannot be led yet unless your hand is all spades'}.`);facts.push(`Legal cards: ${legalSpadesCards(state.players[actor].hand,state.trick,state.spadesBroken).length}.`);}
  return facts;
}

export const spadesEngine={id:'spades',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.matchComplete),result:state=>state.roundComplete?{scores:state.scores,bags:state.bags,roundScores:state.roundScores,matchComplete:state.matchComplete,winners:state.winners}:null,coachFacts};
export default spadesEngine;
