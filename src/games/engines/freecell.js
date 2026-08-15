import { emptyFoundations, foundationCanTake, foundationsCount, pushUndo, restoreUndo, shuffledStandardDeck, descendingAlternate } from './solitaireCommon.js';

const clone=value=>structuredClone(value);

export function freeCellMoveCapacity(emptyFreeCells,emptyColumns){
  return (Math.max(0,emptyFreeCells)+1)*(2**Math.max(0,emptyColumns));
}

function canStack(moving,target){return !target||moving.value===target.value-1&&moving.colorCategory!==target.colorCategory;}

function createGame(options={}){
  const deck=shuffledStandardDeck(options.seed??1);const tableau=Array.from({length:8},()=>[]);
  let col=0;while(deck.length){tableau[col%8].push(deck.pop());col+=1;}
  return{id:'freecell',seed:options.seed??1,tableau,freeCells:[null,null,null,null],foundations:emptyFoundations(),moves:0,undoStack:[]};
}

function legalActions(state){
  const actions=[];if(state.undoStack?.length)actions.push({type:'undo'});
  for(let fromCol=0;fromCol<8;fromCol+=1){
    const column=state.tableau[fromCol],top=column.at(-1);if(!top)continue;
    for(let toCell=0;toCell<4;toCell+=1)if(!state.freeCells[toCell])actions.push({type:'tableau-to-cell',fromCol,toCell});
    if(foundationCanTake(state.foundations,top))actions.push({type:'tableau-to-foundation',fromCol});
    for(let fromIndex=0;fromIndex<column.length;fromIndex+=1){
      const run=column.slice(fromIndex);if(!descendingAlternate(run))continue;
      for(let toCol=0;toCol<8;toCol+=1){
        if(toCol===fromCol)continue;const dest=state.tableau[toCol],target=dest.at(-1);if(!canStack(run[0],target))continue;
        const emptyCells=state.freeCells.filter(cell=>!cell).length;
        const empties=state.tableau.filter((c,index)=>!c.length&&index!==toCol).length;
        const capacity=freeCellMoveCapacity(emptyCells,empties);
        if(run.length<=capacity)actions.push({type:'move-tableau',fromCol,fromIndex,toCol});
      }
    }
  }
  for(let fromCell=0;fromCell<4;fromCell+=1){const moving=state.freeCells[fromCell];if(!moving)continue;if(foundationCanTake(state.foundations,moving))actions.push({type:'cell-to-foundation',fromCell});for(let toCol=0;toCol<8;toCol+=1)if(canStack(moving,state.tableau[toCol].at(-1)))actions.push({type:'cell-to-tableau',fromCell,toCol});}
  return actions;
}

function applyAction(input,action){
  if(action?.type==='undo')return restoreUndo(clone(input));
  const state=clone(input);pushUndo(state);const type=action?.type;
  if(type==='tableau-to-cell'){
    const col=state.tableau[action.fromCol];if(!col?.length||state.freeCells[action.toCell])throw new Error('Illegal FreeCell cell move');state.freeCells[action.toCell]=col.pop();
  }else if(type==='cell-to-tableau'){
    const moving=state.freeCells[action.fromCell],to=state.tableau[action.toCol];if(!moving||!to||!canStack(moving,to.at(-1)))throw new Error('Illegal FreeCell tableau move');to.push(moving);state.freeCells[action.fromCell]=null;
  }else if(type==='tableau-to-foundation'){
    const col=state.tableau[action.fromCol],moving=col?.at(-1);if(!moving||!foundationCanTake(state.foundations,moving))throw new Error('Illegal FreeCell foundation move');state.foundations[moving.suit].push(col.pop());
  }else if(type==='cell-to-foundation'){
    const moving=state.freeCells[action.fromCell];if(!moving||!foundationCanTake(state.foundations,moving))throw new Error('Illegal FreeCell foundation move');state.foundations[moving.suit].push(moving);state.freeCells[action.fromCell]=null;
  }else if(type==='move-tableau'){
    const from=state.tableau[action.fromCol],to=state.tableau[action.toCol];if(!from||!to||action.fromCol===action.toCol)throw new Error('Illegal FreeCell move');const run=from.slice(action.fromIndex);if(!run.length||!descendingAlternate(run)||!canStack(run[0],to.at(-1)))throw new Error('Illegal FreeCell run');const emptyCells=state.freeCells.filter(cell=>!cell).length,empties=state.tableau.filter((c,index)=>!c.length&&index!==action.toCol).length;if(run.length>freeCellMoveCapacity(emptyCells,empties))throw new Error('FreeCell supermove exceeds available capacity');from.splice(action.fromIndex);to.push(...run);
  }else throw new Error(`Unknown FreeCell action: ${type}`);
  state.moves+=1;return state;
}

function result(state){return{won:foundationsCount(state.foundations)===52,moves:state.moves};}
export const freeCellEngine={id:'freecell',createGame,legalActions,applyAction,isTerminal:state=>foundationsCount(state.foundations)===52,result,coachFacts:state=>[`Foundation progress: ${foundationsCount(state.foundations)}/52.`,`Open free cells: ${state.freeCells.filter(cell=>!cell).length}/4.`,`Empty columns multiply how many correctly ordered cards you can move together.`]};
export default freeCellEngine;
