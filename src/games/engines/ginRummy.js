import { shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);
const nextSeat=seat=>1-seat;
const cardPoints=card=>card.value===14?1:Math.min(10,card.value);
const runValue=card=>card.value===14?1:card.value;

function combinations(items,size,start=0,prefix=[],out=[]){
  if(prefix.length===size){out.push(prefix.slice());return out;}
  for(let index=start;index<=items.length-(size-prefix.length);index+=1){prefix.push(items[index]);combinations(items,size,index+1,prefix,out);prefix.pop();}
  return out;
}

function candidateMelds(hand){
  const candidates=[];
  const byRank=new Map();
  hand.forEach((card,index)=>{if(!byRank.has(card.rank))byRank.set(card.rank,[]);byRank.get(card.rank).push(index);});
  for(const indexes of byRank.values()){
    if(indexes.length>=3){for(const size of [3,4])if(indexes.length>=size)for(const combo of combinations(indexes,size))candidates.push({type:'set',indexes:combo});}
  }
  const bySuit=new Map();
  hand.forEach((card,index)=>{if(!bySuit.has(card.suit))bySuit.set(card.suit,[]);bySuit.get(card.suit).push({index,value:runValue(card)});});
  for(const rows of bySuit.values()){
    rows.sort((a,b)=>a.value-b.value);
    for(let start=0;start<rows.length;start+=1){
      for(let end=start+2;end<rows.length;end+=1){
        const slice=rows.slice(start,end+1);let valid=true;
        for(let i=1;i<slice.length;i+=1)if(slice[i].value!==slice[i-1].value+1)valid=false;
        if(valid)candidates.push({type:'run',indexes:slice.map(row=>row.index)});
      }
    }
  }
  return candidates;
}

export function analyzeGinHand(hand){
  if(!Array.isArray(hand))throw new Error('Gin hand must be an array');
  const candidates=candidateMelds(hand);
  const total=hand.reduce((sum,card)=>sum+cardPoints(card),0);
  let best={covered:new Set(),meldIndexes:[]};
  function search(index,covered,chosen){
    if(index>=candidates.length){
      const coveredPoints=[...covered].reduce((sum,i)=>sum+cardPoints(hand[i]),0);
      const bestPoints=[...best.covered].reduce((sum,i)=>sum+cardPoints(hand[i]),0);
      if(coveredPoints>bestPoints||(coveredPoints===bestPoints&&chosen.length<best.meldIndexes.length))best={covered:new Set(covered),meldIndexes:chosen.slice()};
      return;
    }
    search(index+1,covered,chosen);
    const candidate=candidates[index];
    if(candidate.indexes.every(i=>!covered.has(i))){for(const i of candidate.indexes)covered.add(i);chosen.push(index);search(index+1,covered,chosen);chosen.pop();for(const i of candidate.indexes)covered.delete(i);}
  }
  search(0,new Set(),[]);
  const melds=best.meldIndexes.map(i=>({type:candidates[i].type,cards:candidates[i].indexes.map(index=>hand[index])}));
  const deadwood=hand.filter((_,index)=>!best.covered.has(index));
  return{melds,deadwood,deadwoodPoints:deadwood.reduce((sum,card)=>sum+cardPoints(card),0),meldPoints:total-deadwood.reduce((sum,card)=>sum+cardPoints(card),0)};
}

function canLayoff(card,meld){
  if(meld.type==='set')return meld.cards.length<4&&meld.cards.every(item=>item.rank===card.rank);
  const cards=meld.cards.slice().sort((a,b)=>runValue(a)-runValue(b));
  if(!cards.length||cards[0].suit!==card.suit)return false;
  const value=runValue(card),low=runValue(cards[0]),high=runValue(cards.at(-1));
  return value===low-1||value===high+1;
}
function bestLayoff(deadwood,melds){
  let best=deadwood.slice();
  function visit(remaining,currentMelds){
    if(remaining.reduce((sum,c)=>sum+cardPoints(c),0)<best.reduce((sum,c)=>sum+cardPoints(c),0))best=remaining.slice();
    for(let i=0;i<remaining.length;i+=1){for(let m=0;m<currentMelds.length;m+=1){if(canLayoff(remaining[i],currentMelds[m])){const nextRemaining=remaining.slice();const [card]=nextRemaining.splice(i,1);const nextMelds=clone(currentMelds);nextMelds[m].cards.push(card);visit(nextRemaining,nextMelds);}}}
  }
  visit(deadwood.slice(),clone(melds));return{deadwood:best,deadwoodPoints:best.reduce((sum,c)=>sum+cardPoints(c),0)};
}

export function scoreGinRound({knocker,knockerDeadwood,defenderDeadwood,gin=false,scores=[0,0],ginBonus=25,undercutBonus=25,targetScore=100}){
  const roundScores=[0,0];const defender=1-knocker;
  if(gin)roundScores[knocker]=ginBonus+defenderDeadwood;
  else if(knockerDeadwood<defenderDeadwood)roundScores[knocker]=defenderDeadwood-knockerDeadwood;
  else roundScores[defender]=undercutBonus+knockerDeadwood-defenderDeadwood;
  const nextScores=scores.map((score,seat)=>score+roundScores[seat]);const matchComplete=nextScores.some(score=>score>=targetScore);
  let winners=[];if(matchComplete){const best=Math.max(...nextScores);winners=nextScores.map((score,seat)=>score===best?seat:null).filter(seat=>seat!==null);}
  return{roundScores,scores:nextScores,matchComplete,winners,undercut:!gin&&roundScores[defender]>0};
}

function sortHand(hand){const order={clubs:0,diamonds:1,hearts:2,spades:3};return hand.sort((a,b)=>a.value-b.value||order[a.suit]-order[b.suit]);}
function buildRound(base,{dealer,roundNumber}){
  const deck=shuffledStandardDeck(base.seed+roundNumber*6151);const players=[0,1].map(seat=>({seat,name:seat===base.humanSeat?'You':'Opponent',isHuman:seat===base.humanSeat,hand:[]}));
  for(let i=0;i<10;i+=1){players[nextSeat(dealer)].hand.push(deck.pop());players[dealer].hand.push(deck.pop());}
  players.forEach(player=>sortHand(player.hand));const discard=[deck.pop()];
  return{...base,dealer,roundNumber,players,stock:deck,discard,actor:nextSeat(dealer),phase:'draw',drawnFromDiscardId:null,roundComplete:false,matchComplete:false,roundResult:null,winners:[],turns:0};
}
function createGame(options={}){const seed=Number(options.seed??1),dealer=Number(options.dealer??0),roundNumber=Number(options.roundNumber??1);return buildRound({id:'gin-rummy',seed,humanSeat:Number(options.humanSeat??0),targetScore:Number(options.targetScore??100),scores:[0,0],dealer,roundNumber},{dealer,roundNumber});}

function discardActions(state,actor){
  const hand=state.players[actor].hand,actions=[];
  for(const card of hand){
    if(card.id===state.drawnFromDiscardId)continue;
    const remaining=hand.filter(item=>item.id!==card.id);const analysis=analyzeGinHand(remaining);
    actions.push({type:'discard',actor,cardId:card.id,deadwood:analysis.deadwoodPoints});
    if(analysis.deadwoodPoints<=10)actions.push({type:'knock-discard',actor,cardId:card.id,deadwood:analysis.deadwoodPoints,gin:analysis.deadwoodPoints===0});
  }
  return actions;
}
function legalActions(state,actor=state.actor){
  if(state.roundComplete||state.matchComplete||actor!==state.actor)return[];
  if(state.phase==='draw'){const actions=[];if(state.stock.length>2)actions.push({type:'draw-stock',actor});if(state.discard.length)actions.push({type:'draw-discard',actor,cardId:state.discard.at(-1).id});return actions;}
  if(state.phase==='discard')return discardActions(state,actor);
  return[];
}
function settleKnock(state,knocker){
  const defender=1-knocker,knockerAnalysis=analyzeGinHand(state.players[knocker].hand),gin=knockerAnalysis.deadwoodPoints===0,defenderAnalysis=analyzeGinHand(state.players[defender].hand);
  const defenderAfter=gin?defenderAnalysis:bestLayoff(defenderAnalysis.deadwood,knockerAnalysis.melds);
  const scored=scoreGinRound({knocker,knockerDeadwood:knockerAnalysis.deadwoodPoints,defenderDeadwood:defenderAfter.deadwoodPoints,gin,scores:state.scores,targetScore:state.targetScore});
  state.scores=scored.scores;state.roundComplete=true;state.matchComplete=scored.matchComplete;state.winners=scored.winners;state.phase='result';state.actor=null;state.roundResult={knocker,gin,undercut:scored.undercut,knockerDeadwood:knockerAnalysis.deadwoodPoints,defenderDeadwood:defenderAfter.deadwoodPoints,roundScores:scored.roundScores,melds:knockerAnalysis.melds};return state;
}
function drawRound(state){state.roundComplete=true;state.phase='result';state.actor=null;state.roundResult={draw:true,roundScores:[0,0]};return state;}
function applyAction(input,action){
  const state=clone(input),actor=Number(action?.actor);if(actor!==state.actor)throw new Error('Illegal Gin Rummy action: wrong turn');const type=action?.type;
  if(state.phase==='draw'){
    if(type==='draw-stock'){if(state.stock.length<=2)throw new Error('Illegal Gin stock draw');state.players[actor].hand.push(state.stock.pop());state.drawnFromDiscardId=null;}
    else if(type==='draw-discard'){if(!state.discard.length)throw new Error('Gin discard pile empty');const drawn=state.discard.pop();state.players[actor].hand.push(drawn);state.drawnFromDiscardId=drawn.id;}
    else throw new Error('Illegal Gin draw action');sortHand(state.players[actor].hand);state.phase='discard';return state;
  }
  if(state.phase!=='discard'||!['discard','knock-discard'].includes(type))throw new Error('Illegal Gin discard action');const legal=discardActions(state,actor).find(candidate=>candidate.type===type&&candidate.cardId===action.cardId);if(!legal)throw new Error('Illegal Gin discard card');
  const index=state.players[actor].hand.findIndex(card=>card.id===action.cardId);const [discarded]=state.players[actor].hand.splice(index,1);state.discard.push(discarded);state.turns+=1;state.drawnFromDiscardId=null;
  if(type==='knock-discard')return settleKnock(state,actor);
  if(state.stock.length<=2)return drawRound(state);state.actor=nextSeat(actor);state.phase='draw';return state;
}

export function chooseGinBotAction(state,seat=state.actor){
  const legal=legalActions(state,seat);if(!legal.length)throw new Error('Gin bot has no legal action');
  if(state.phase==='draw'){
    const discardAction=legal.find(action=>action.type==='draw-discard');if(discardAction){const current=analyzeGinHand(state.players[seat].hand).deadwoodPoints;const top=state.discard.at(-1);let best=current;for(const card of state.players[seat].hand){if(card.id===top.id)continue;best=Math.min(best,analyzeGinHand([...state.players[seat].hand,top].filter(item=>item.id!==card.id)).deadwoodPoints);}if(best<current)return discardAction;}
    return legal.find(action=>action.type==='draw-stock')||discardAction;
  }
  const knocks=legal.filter(action=>action.type==='knock-discard').sort((a,b)=>a.deadwood-b.deadwood);if(knocks.length)return knocks[0];
  return legal.filter(action=>action.type==='discard').sort((a,b)=>a.deadwood-b.deadwood)[0];
}
export function startNextGinRound(input){if(!input.roundComplete)throw new Error('Gin round is not complete');if(input.matchComplete)throw new Error('Gin match is complete');const base=clone(input),dealer=nextSeat(base.dealer),roundNumber=base.roundNumber+1;return buildRound({...base,players:undefined,stock:undefined,discard:undefined},{dealer,roundNumber});}
function coachFacts(state,actor=state.humanSeat){const analysis=analyzeGinHand(state.players[actor]?.hand||[]),facts=[`Score: ${state.scores[actor]}–${state.scores[1-actor]} · target ${state.targetScore}.`,`Deadwood now: ${analysis.deadwoodPoints}. Melds: ${analysis.melds.length}.`];if(state.phase==='draw'&&state.actor===actor)facts.push(`Draw from stock or take ${state.discard.at(-1)?.label||'the discard'}.`);if(state.phase==='discard'&&state.actor===actor)facts.push(`Discard one card. Knock is legal when the remaining hand has 10 or fewer deadwood points.`);if(state.roundResult?.gin)facts.push('Gin: zero deadwood earned the 25-point gin bonus plus the opponent’s deadwood.');if(state.roundResult?.undercut)facts.push('Undercut: the defender matched or beat the knocker’s deadwood and earned the undercut bonus.');return facts;}
export const ginRummyEngine={id:'gin-rummy',createGame,legalActions,applyAction,isTerminal:state=>Boolean(state.matchComplete),result:state=>state.roundResult,coachFacts};
export default ginRummyEngine;
