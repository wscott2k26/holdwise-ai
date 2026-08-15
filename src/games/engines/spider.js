import { createDeck, seededRandom, shuffle } from '../../lib/cards/deck.js';
import { pushUndo, restoreUndo } from './solitaireCommon.js';

const clone=value=>structuredClone(value);
const SPIDER_SUITS=['spades','hearts','clubs','diamonds'];
const spiderRank=card=>card?.value===14?1:card?.value;

function buildSpiderDeck(suits=1,seed=1){
  const count=Math.max(1,Math.min(4,Number(suits)||1));
  const base=createDeck();
  const cards=[];
  for(let run=0;run<8;run+=1){
    const suit=SPIDER_SUITS[run%count];
    const set=base.filter(card=>card.suit===suit);
    for(const card of set) cards.push({...card,shoeCardId:`spider-${run}-${card.id}`});
  }
  return shuffle(cards,seededRandom(seed));
}

function sameSuitDescending(run){
  if(!run.length) return false;
  for(let i=1;i<run.length;i+=1){
    if(run[i-1].card.suit!==run[i].card.suit) return false;
    if(spiderRank(run[i-1].card)!==spiderRank(run[i].card)+1) return false;
  }
  return true;
}

function reveal(column){if(column.length&&!column.at(-1).faceUp) column.at(-1).faceUp=true;}

function normalize(input){
  const state=clone(input);
  let changed=true;
  while(changed){
    changed=false;
    for(const column of state.tableau){
      if(column.length<13) continue;
      const run=column.slice(-13);
      if(run.every(row=>row.faceUp)&&sameSuitDescending(run)&&spiderRank(run[0].card)===13&&spiderRank(run.at(-1).card)===1){
        column.splice(-13);state.completed+=1;reveal(column);changed=true;
      }
    }
  }
  return state;
}

function createGame(options={}){
  const suits=Math.max(1,Math.min(4,Number(options.suits)||1));
  const deck=buildSpiderDeck(suits,options.seed??1);
  const tableau=Array.from({length:10},()=>[]);
  for(let row=0;row<6;row+=1){
    for(let col=0;col<10;col+=1){
      if(row===5&&col>=4) continue;
      tableau[col].push({card:deck.pop(),faceUp:false});
    }
  }
  for(const column of tableau) column.at(-1).faceUp=true;
  return{id:'spider',seed:options.seed??1,suits,unrestrictedDeal:Boolean(options.unrestrictedDeal),tableau,stock:deck,completed:0,moves:0,undoStack:[]};
}

function canMoveRun(column,index){
  const run=column.slice(index);return run.length>0&&run.every(row=>row.faceUp)&&sameSuitDescending(run);
}

function legalActions(state){
  const actions=[];if(state.undoStack?.length)actions.push({type:'undo'});
  if(state.stock.length>=10&&(state.unrestrictedDeal||state.tableau.every(column=>column.length>0)))actions.push({type:'deal-row'});
  for(let fromCol=0;fromCol<10;fromCol+=1){
    for(let fromIndex=0;fromIndex<state.tableau[fromCol].length;fromIndex+=1){
      if(!canMoveRun(state.tableau[fromCol],fromIndex))continue;
      const moving=state.tableau[fromCol][fromIndex].card;
      for(let toCol=0;toCol<10;toCol+=1){if(toCol===fromCol)continue;const target=state.tableau[toCol].at(-1)?.card;if(!target||spiderRank(target)===spiderRank(moving)+1)actions.push({type:'move-run',fromCol,fromIndex,toCol});}
    }
  }
  return actions;
}

function applyAction(input,action){
  if(action?.type==='undo')return restoreUndo(clone(input));
  let state=clone(input);pushUndo(state);
  if(action?.type==='deal-row'){
    if(state.stock.length<10||(!state.unrestrictedDeal&&state.tableau.some(column=>column.length===0)))throw new Error('Illegal Spider row deal');
    for(let col=0;col<10;col+=1)state.tableau[col].push({card:state.stock.pop(),faceUp:true});
  }else if(action?.type==='move-run'){
    const from=state.tableau[action.fromCol],to=state.tableau[action.toCol];if(!from||!to||action.fromCol===action.toCol||!canMoveRun(from,action.fromIndex))throw new Error('Illegal Spider run');
    const run=from.slice(action.fromIndex),moving=run[0].card,target=to.at(-1)?.card;if(target&&spiderRank(target)!==spiderRank(moving)+1)throw new Error('Illegal Spider destination');
    from.splice(action.fromIndex);to.push(...run);reveal(from);
  }else throw new Error(`Unknown Spider action: ${action?.type}`);
  state.moves+=1;return normalize(state);
}

function result(state){return{won:state.completed>=8,moves:state.moves,completed:state.completed};}
export const spiderEngine={id:'spider',createGame,legalActions,applyAction,normalize,isTerminal:state=>state.completed>=8,result,coachFacts:state=>[`Difficulty: ${state.suits} suit${state.suits===1?'':'s'}.`,`Completed runs: ${state.completed}/8. Stock deals left: ${Math.floor(state.stock.length/10)}.`,`Move same-suit descending runs; complete King through Ace to clear a run.`]};
export default spiderEngine;
