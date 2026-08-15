import { emptyFoundations, foundationCanTake, foundationsCount, pushUndo, restoreUndo, shuffledStandardDeck } from './solitaireCommon.js';

const clone=value=>structuredClone(value);

export function canStackKlondike(moving,target){
  if(!moving) return false;
  if(!target) return moving.value===13;
  return moving.value===target.value-1 && moving.colorCategory!==target.colorCategory;
}

function flipExposed(state,col){
  const column=state.tableau[col];
  if(column?.length && !column.at(-1).faceUp) column.at(-1).faceUp=true;
}

function createGame(options={}){
  const deck=shuffledStandardDeck(options.seed??1);
  const tableau=[];
  for(let col=0;col<7;col+=1){
    const column=[];
    for(let row=0;row<=col;row+=1){
      column.push({card:deck.pop(),faceUp:row===col});
    }
    tableau.push(column);
  }
  return {id:'klondike',seed:options.seed??1,drawCount:options.drawCount===3?3:1,tableau,stock:deck,waste:[],foundations:emptyFoundations(),moves:0,undoStack:[]};
}

function legalActions(state){
  const actions=[];
  if(state.undoStack?.length) actions.push({type:'undo'});
  if(state.stock.length) actions.push({type:'draw-stock'});
  else if(state.waste.length) actions.push({type:'recycle-stock'});
  const waste=state.waste.at(-1);
  if(waste){
    if(foundationCanTake(state.foundations,waste)) actions.push({type:'waste-to-foundation'});
    for(let toCol=0;toCol<7;toCol+=1){if(canStackKlondike(waste,state.tableau[toCol].at(-1)?.card)) actions.push({type:'waste-to-tableau',toCol});}
  }
  for(let fromCol=0;fromCol<7;fromCol+=1){
    const col=state.tableau[fromCol];
    const top=col.at(-1);
    if(top?.faceUp && foundationCanTake(state.foundations,top.card)) actions.push({type:'tableau-to-foundation',fromCol});
    for(let fromIndex=0;fromIndex<col.length;fromIndex+=1){
      if(!col[fromIndex].faceUp) continue;
      const run=col.slice(fromIndex);
      let valid=true;
      for(let i=1;i<run.length;i+=1) if(!canStackKlondike(run[i].card,run[i-1].card)) valid=false;
      if(!valid) continue;
      for(let toCol=0;toCol<7;toCol+=1){
        if(toCol===fromCol) continue;
        if(canStackKlondike(run[0].card,state.tableau[toCol].at(-1)?.card)) actions.push({type:'move-tableau',fromCol,fromIndex,toCol});
      }
    }
  }
  for(const suit of Object.keys(state.foundations)){
    const top=state.foundations[suit].at(-1);
    if(!top) continue;
    for(let toCol=0;toCol<7;toCol+=1) if(canStackKlondike(top,state.tableau[toCol].at(-1)?.card)) actions.push({type:'foundation-to-tableau',suit,toCol});
  }
  return actions;
}

function applyAction(input,action){
  if(action?.type==='undo') return restoreUndo(clone(input));
  const state=clone(input);pushUndo(state);
  const type=action?.type;
  if(type==='draw-stock'){
    if(!state.stock.length) throw new Error('Illegal Klondike stock draw');
    const count=Math.min(state.drawCount,state.stock.length);
    for(let i=0;i<count;i+=1) state.waste.push(state.stock.pop());
  }else if(type==='recycle-stock'){
    if(state.stock.length||!state.waste.length) throw new Error('Illegal Klondike recycle');
    state.stock=state.waste.reverse();state.waste=[];
  }else if(type==='waste-to-foundation'){
    const moving=state.waste.at(-1);if(!foundationCanTake(state.foundations,moving)) throw new Error('Illegal foundation move');
    state.foundations[moving.suit].push(state.waste.pop());
  }else if(type==='waste-to-tableau'){
    const moving=state.waste.at(-1);const dest=state.tableau[action.toCol];
    if(!dest||!canStackKlondike(moving,dest.at(-1)?.card)) throw new Error('Illegal tableau move');
    dest.push({card:state.waste.pop(),faceUp:true});
  }else if(type==='tableau-to-foundation'){
    const col=state.tableau[action.fromCol];const top=col?.at(-1);
    if(!top?.faceUp||!foundationCanTake(state.foundations,top.card)) throw new Error('Illegal foundation move');
    state.foundations[top.card.suit].push(col.pop().card);flipExposed(state,action.fromCol);
  }else if(type==='move-tableau'){
    const from=state.tableau[action.fromCol],to=state.tableau[action.toCol];
    if(!from||!to||action.fromCol===action.toCol) throw new Error('Illegal tableau move');
    const run=from.slice(action.fromIndex);if(!run.length||!run[0].faceUp) throw new Error('Illegal tableau run');
    for(let i=1;i<run.length;i+=1) if(!canStackKlondike(run[i].card,run[i-1].card)) throw new Error('Illegal tableau run');
    if(!canStackKlondike(run[0].card,to.at(-1)?.card)) throw new Error('Illegal tableau destination');
    from.splice(action.fromIndex);to.push(...run);flipExposed(state,action.fromCol);
  }else if(type==='foundation-to-tableau'){
    const pile=state.foundations[action.suit],to=state.tableau[action.toCol],moving=pile?.at(-1);
    if(!moving||!to||!canStackKlondike(moving,to.at(-1)?.card)) throw new Error('Illegal foundation return');
    to.push({card:pile.pop(),faceUp:true});
  }else throw new Error(`Unknown Klondike action: ${type}`);
  state.moves+=1;return state;
}

function result(state){const won=foundationsCount(state.foundations)===52;return{won,moves:state.moves};}

export const klondikeEngine={id:'klondike',createGame,legalActions,applyAction,isTerminal:state=>foundationsCount(state.foundations)===52,result,coachFacts:state=>[`Stock: ${state.stock.length}. Waste: ${state.waste.length}.`,`Foundation progress: ${foundationsCount(state.foundations)}/52.`,`Build tableau downward in alternating colors; only Kings may move to empty columns.`]};
export default klondikeEngine;
