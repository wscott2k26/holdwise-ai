import { pushUndo, restoreUndo, shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);
const indexOf=(row,col)=>row*(row+1)/2+col;
const value=card=>card?.value===14?1:Math.min(13,card?.value||0);

function buildBlockers(){
  const out=Array.from({length:28},()=>[]);
  for(let row=0;row<6;row+=1){for(let col=0;col<=row;col+=1){out[indexOf(row,col)]=[indexOf(row+1,col),indexOf(row+1,col+1)];}}
  return out;
}
const BLOCKERS=buildBlockers();

export function pyramidExposed(state){return state.tableau.filter(row=>!row.removed&&row.blockers.every(index=>state.tableau[index].removed)).map(row=>row.index);}
function targetCard(state,target){if(target?.zone==='waste')return state.waste;if(target?.zone==='tableau')return state.tableau[target.index]?.removed?null:state.tableau[target.index]?.card;return null;}
function targetAvailable(state,target){if(target?.zone==='waste')return Boolean(state.waste);if(target?.zone==='tableau')return pyramidExposed(state).includes(target.index);return false;}
function removeTarget(state,target){if(target.zone==='waste')state.waste=null;else state.tableau[target.index].removed=true;}

function createGame(options={}){
  const deck=shuffledStandardDeck(options.seed??1);const tableau=Array.from({length:28},(_,index)=>({index,card:deck.pop(),removed:false,blockers:BLOCKERS[index]}));const waste=deck.pop();
  return{id:'pyramid',seed:options.seed??1,tableau,stock:deck,waste,moves:0,removedCount:0,undoStack:[]};
}
function won(state){return state.tableau.every(row=>row.removed);}
function removableActions(state){
  const actions=[];const exposed=pyramidExposed(state);const targets=exposed.map(index=>({zone:'tableau',index}));if(state.waste)targets.push({zone:'waste'});
  for(const target of targets){if(value(targetCard(state,target))===13)actions.push({type:'remove-king',target});}
  for(let a=0;a<targets.length;a+=1){for(let b=a+1;b<targets.length;b+=1){if(value(targetCard(state,targets[a]))+value(targetCard(state,targets[b]))===13)actions.push({type:'remove-pair',a:targets[a],b:targets[b]});}}
  return actions;
}
function lost(state){return !won(state)&&state.stock.length===0&&removableActions(state).length===0;}
function legalActions(state){const actions=[];if(state.undoStack?.length)actions.push({type:'undo'});actions.push(...removableActions(state));if(state.stock.length)actions.push({type:'draw-stock'});return actions;}
function applyAction(input,action){
  if(action?.type==='undo')return restoreUndo(clone(input));const state=clone(input);pushUndo(state);
  if(action?.type==='draw-stock'){
    if(!state.stock.length)throw new Error('Pyramid stock is empty');state.waste=state.stock.pop();
  }else if(action?.type==='remove-king'){
    if(!targetAvailable(state,action.target)||value(targetCard(state,action.target))!==13)throw new Error('Illegal Pyramid King removal');removeTarget(state,action.target);state.removedCount+=1;
  }else if(action?.type==='remove-pair'){
    if(JSON.stringify(action.a)===JSON.stringify(action.b)||!targetAvailable(state,action.a)||!targetAvailable(state,action.b)||value(targetCard(state,action.a))+value(targetCard(state,action.b))!==13)throw new Error('Illegal Pyramid pair');removeTarget(state,action.a);removeTarget(state,action.b);state.removedCount+=2;
  }else throw new Error(`Unknown Pyramid action: ${action?.type}`);
  state.moves+=1;return state;
}
function result(state){return{won:won(state),lost:lost(state),removed:state.tableau.filter(row=>row.removed).length,moves:state.moves};}
export const pyramidEngine={id:'pyramid',createGame,legalActions,applyAction,isTerminal:state=>won(state)||lost(state),result,coachFacts:state=>[`Pyramid cleared: ${state.tableau.filter(row=>row.removed).length}/28. Stock: ${state.stock.length}.`,`Remove exposed pairs totaling 13. Kings remove by themselves.`,`Only cards with both covering cards already cleared are exposed.`]};
export default pyramidEngine;
