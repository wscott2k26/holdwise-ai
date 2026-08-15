import { pushUndo, restoreUndo, shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);
const ROWS=[
  [{i:0,x:3},{i:1,x:9},{i:2,x:15}],
  [{i:3,x:2},{i:4,x:4},{i:5,x:8},{i:6,x:10},{i:7,x:14},{i:8,x:16}],
  [{i:9,x:1},{i:10,x:3},{i:11,x:5},{i:12,x:7},{i:13,x:9},{i:14,x:11},{i:15,x:13},{i:16,x:15},{i:17,x:17}],
  [{i:18,x:0},{i:19,x:2},{i:20,x:4},{i:21,x:6},{i:22,x:8},{i:23,x:10},{i:24,x:12},{i:25,x:14},{i:26,x:16},{i:27,x:18}],
];

function blockerMap(){
  const blockers=Array.from({length:28},()=>[]);
  for(let row=0;row<ROWS.length-1;row+=1){
    for(const node of ROWS[row]) blockers[node.i]=ROWS[row+1].filter(child=>Math.abs(child.x-node.x)===1).map(child=>child.i);
  }
  return blockers;
}
const BLOCKERS=blockerMap();
const rank=card=>card?.value===14?1:card?.value;

export function isTriPeaksAdjacent(a,b,wrap=true){
  if(!a||!b)return false;const ra=rank(a),rb=rank(b);if(Math.abs(ra-rb)===1)return true;return Boolean(wrap&&((ra===1&&rb===13)||(ra===13&&rb===1)));
}

export function triPeaksExposed(state){
  return state.tableau.filter(row=>!row.removed&&row.blockers.every(index=>state.tableau[index].removed)).map(row=>row.index);
}

function createGame(options={}){
  const deck=shuffledStandardDeck(options.seed??1);const tableau=Array.from({length:28},(_,index)=>({index,card:deck.pop(),removed:false,blockers:BLOCKERS[index]}));
  const waste=deck.pop();return{id:'tripeaks',seed:options.seed??1,wrap:options.wrap!==false,tableau,stock:deck,waste,streak:0,bestStreak:0,moves:0,undoStack:[]};
}

function playable(state){return triPeaksExposed(state).filter(index=>isTriPeaksAdjacent(state.tableau[index].card,state.waste,state.wrap));}
function won(state){return state.tableau.every(row=>row.removed);}
function lost(state){return !won(state)&&state.stock.length===0&&playable(state).length===0;}
function legalActions(state){const actions=[];if(state.undoStack?.length)actions.push({type:'undo'});for(const index of playable(state))actions.push({type:'remove',index});if(state.stock.length)actions.push({type:'draw-stock'});return actions;}
function applyAction(input,action){
  if(action?.type==='undo')return restoreUndo(clone(input));const state=clone(input);pushUndo(state);
  if(action?.type==='remove'){
    const index=Number(action.index);if(!triPeaksExposed(state).includes(index)||!isTriPeaksAdjacent(state.tableau[index].card,state.waste,state.wrap))throw new Error('Illegal TriPeaks removal');state.waste=state.tableau[index].card;state.tableau[index].removed=true;state.streak+=1;state.bestStreak=Math.max(state.bestStreak,state.streak);
  }else if(action?.type==='draw-stock'){
    if(!state.stock.length)throw new Error('TriPeaks stock is empty');state.waste=state.stock.pop();state.streak=0;
  }else throw new Error(`Unknown TriPeaks action: ${action?.type}`);
  state.moves+=1;return state;
}
function result(state){return{won:won(state),lost:lost(state),cardsCleared:state.tableau.filter(row=>row.removed).length,bestStreak:state.bestStreak,moves:state.moves};}
export const triPeaksEngine={id:'tripeaks',createGame,legalActions,applyAction,isTerminal:state=>won(state)||lost(state),result,coachFacts:state=>[`Cards cleared: ${state.tableau.filter(row=>row.removed).length}/28. Stock: ${state.stock.length}.`,`Current chain: ${state.streak}. Best chain: ${state.bestStreak}.`,`Play an exposed card one rank above or below the waste; Ace wraps with King on this HoldWise table.`]};
export default triPeaksEngine;
