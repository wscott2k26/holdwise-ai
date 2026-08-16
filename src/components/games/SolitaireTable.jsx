import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lightbulb, RotateCcw, Sparkles, Trophy, Undo2 } from 'lucide-react';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PlayingCard from '@/components/PlayingCard';
import { klondikeEngine } from '@/games/engines/klondike';
import { spiderEngine } from '@/games/engines/spider';
import { freeCellEngine } from '@/games/engines/freecell';
import { triPeaksEngine, triPeaksExposed } from '@/games/engines/tripeaks';
import { pyramidEngine, pyramidExposed } from '@/games/engines/pyramid';
import { recordGameResult } from '@/lib/cardAcademyProgress';
import './solitaire.css';

export const SOLITAIRE_IDS=['klondike','spider','freecell','tripeaks','pyramid'];
const ENGINES={klondike:klondikeEngine,spider:spiderEngine,freecell:freeCellEngine,tripeaks:triPeaksEngine,pyramid:pyramidEngine};
const TITLES={klondike:'Klondike',spider:'Spider',freecell:'FreeCell',tripeaks:'TriPeaks',pyramid:'Pyramid'};

function fresh(id,seed=20260815,spiderSuits=1){
  if(id==='spider')return spiderEngine.createGame({seed,suits:spiderSuits});
  if(id==='klondike')return klondikeEngine.createGame({seed,drawCount:1});
  return ENGINES[id].createGame({seed});
}
function keyOf(selection){return selection?JSON.stringify(selection):'';}
function MiniCard({card,faceDown=false,selected=false,onClick,label}){
  if(!card||faceDown)return <button type="button" onClick={onClick} className="hw-solitaire-mini-card hw-solitaire-card-back" aria-label={label||'Face-down card'} />;
  return <button type="button" onClick={onClick} className={`hw-solitaire-mini-card p-1 text-left ${card.colorCategory==='red'?'red':''} ${selected?'selected':''}`} aria-label={label||card.label}><span className="text-[12px]">{card.displaySymbol}</span><span className="ml-0.5 text-[12px]">{card.suitSymbol}</span><span className="absolute inset-0 flex items-center justify-center text-xl opacity-90">{card.suitSymbol}</span></button>;
}
function describeAction(action){
  const names={
    'draw-stock':'Draw from stock','recycle-stock':'Recycle waste','waste-to-foundation':'Move waste to foundation','waste-to-tableau':'Move waste to tableau',
    'tableau-to-foundation':'Move tableau card to foundation','move-tableau':'Move tableau run','foundation-to-tableau':'Move foundation card back','deal-row':'Deal a new Spider row','move-run':'Move Spider run',
    'tableau-to-cell':'Move to free cell','cell-to-tableau':'Move free cell card','cell-to-foundation':'Move free cell card to foundation','remove':'Clear exposed TriPeaks card','remove-pair':'Clear a Pyramid pair','remove-king':'Clear a Pyramid King','undo':'Undo last move'
  };return names[action.type]||action.type;
}

export default function SolitaireTable({game}){
  const navigate=useNavigate();
  const id=SOLITAIRE_IDS.includes(game?.id)?game.id:'klondike';
  const engine=ENGINES[id];
  const [spiderSuits,setSpiderSuits]=useState(1);
  const [seed,setSeed]=useState(20260815);
  const [state,setState]=useState(()=>fresh(id,seed,spiderSuits));
  const [selection,setSelection]=useState(null);
  const [hint,setHint]=useState(null);
  const legal=useMemo(()=>engine.legalActions(state),[engine,state]);
  const terminal=engine.isTerminal(state);
  const gameResult=terminal?engine.result(state):null;

  useEffect(()=>{setState(fresh(id,seed,spiderSuits));setSelection(null);setHint(null);},[id]);

  function commit(action){
    const previousTerminal=engine.isTerminal(state);
    const next=engine.applyAction(state,action);
    if(!previousTerminal&&engine.isTerminal(next)){
      const result=engine.result(next);recordGameResult(id,{family:'solitaire',won:Boolean(result?.won),xp:result?.won?24:8});
    }
    setState(next);setSelection(null);setHint(null);
  }
  function newDeal(extra={}){const nextSeed=seed+104729;setSeed(nextSeed);const suits=extra.suits??spiderSuits;setState(fresh(id,nextSeed,suits));setSelection(null);setHint(null);}
  function showHint(){const action=legal.find(a=>a.type!=='undo');setHint(action||null);}
  function runHint(){if(hint)commit(hint);}
  function undo(){if(legal.some(a=>a.type==='undo'))commit({type:'undo'});}

  const coachFacts=engine.coachFacts(state);
  if(hint)coachFacts.push(`Hint: ${describeAction(hint)}.`);

  return <GameShell game={{...game,title:TITLES[id]}} coachContext={{game:TITLES[id],facts:coachFacts}}>
    <div className="mx-auto max-w-4xl">
      <div className="mb-2 flex gap-2 overflow-x-auto pb-1">{SOLITAIRE_IDS.map(tab=><TactilePressable key={tab} onClick={()=>navigate(`/game/${tab}`)} className={`min-w-max rounded-xl px-3 py-2 text-[11px] font-black ${tab===id?'bg-[hsl(var(--hw-gold))] text-[hsl(var(--hw-navy))]':'bg-white/6 text-white shadow-none'}`}>{TITLES[tab]}</TactilePressable>)}</div>

      <div className="mb-2 grid grid-cols-3 gap-2 text-center"><GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Game</p><p className="mt-1 text-sm font-black text-white">{TITLES[id]}</p></GlassSurface><GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Moves</p><p className="mt-1 text-sm font-black hw-gold-text">{state.moves||0}</p></GlassSurface><GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Legal now</p><p className="mt-1 text-sm font-black text-white">{legal.filter(a=>a.type!=='undo').length}</p></GlassSurface></div>

      {id==='spider'&&<GlassSurface strength={2} className="mb-2 rounded-2xl p-2"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-black uppercase tracking-[.15em] text-white/45">Spider difficulty</span><div className="flex gap-1">{[1,2,3,4].map(suits=><TactilePressable key={suits} onClick={()=>{setSpiderSuits(suits);newDeal({suits});}} className={`rounded-lg px-3 py-2 text-xs font-black ${spiderSuits===suits?'bg-[hsl(var(--hw-gold))] text-[hsl(var(--hw-navy))]':'bg-white/5 text-white shadow-none'}`}>{suits} suit{suits===1?'':'s'}</TactilePressable>)}</div></div></GlassSurface>}

      <section className="hw-solitaire-table min-h-[520px] rounded-[2rem] p-3 sm:p-4">
        {id==='klondike'&&<KlondikeBoard state={state} selection={selection} setSelection={setSelection} legal={legal} commit={commit}/>} 
        {id==='spider'&&<SpiderBoard state={state} selection={selection} setSelection={setSelection} legal={legal} commit={commit}/>} 
        {id==='freecell'&&<FreeCellBoard state={state} selection={selection} setSelection={setSelection} legal={legal} commit={commit}/>} 
        {id==='tripeaks'&&<TriPeaksBoard state={state} legal={legal} commit={commit}/>} 
        {id==='pyramid'&&<PyramidBoard state={state} selection={selection} setSelection={setSelection} legal={legal} commit={commit}/>} 
      </section>

      {hint&&<GlassSurface strength={3} goldEdge className="mt-3 rounded-2xl p-3"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.16em] hw-gold-text"><Lightbulb size={13}/>Hint</p><div className="mt-1 flex items-center justify-between gap-3"><p className="text-sm font-bold text-white">{describeAction(hint)}</p><TactilePressable onClick={runHint} className="rounded-xl bg-[hsl(var(--hw-gold))] px-3 py-2 text-xs font-black text-[hsl(var(--hw-navy))]">Play hint</TactilePressable></div></GlassSurface>}

      {terminal&&<GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-5 text-center"><Trophy size={36} className="mx-auto hw-gold-text"/><h3 className="mt-2 font-heading text-2xl font-black text-white">{gameResult?.won?'Table cleared!':'No more moves'}</h3><p className="mt-1 text-sm text-white/55">{gameResult?.won?'Full game complete. Mastery XP recorded.':'This deal is complete. Start a new deal or undo if available.'}</p><TactilePressable onClick={()=>newDeal()} className="mt-4 rounded-2xl bg-[hsl(var(--hw-gold))] px-5 py-3 font-black text-[hsl(var(--hw-navy))]">New Deal</TactilePressable></GlassSurface>}

      <GlassSurface strength={3} className="mt-3 grid grid-cols-3 gap-2 rounded-2xl p-2"><TactilePressable disabled={!legal.some(a=>a.type==='undo')} onClick={undo} className="rounded-xl bg-white/6 px-2 py-3 text-xs font-black text-white shadow-none"><Undo2 size={15} className="mr-1 inline"/>Undo</TactilePressable><TactilePressable disabled={terminal} onClick={showHint} className="rounded-xl bg-white/6 px-2 py-3 text-xs font-black text-white shadow-none"><Lightbulb size={15} className="mr-1 inline"/>Hint</TactilePressable><TactilePressable onClick={()=>newDeal()} className="rounded-xl bg-white/6 px-2 py-3 text-xs font-black text-white shadow-none"><RotateCcw size={15} className="mr-1 inline"/>New Deal</TactilePressable></GlassSurface>
      <p className="mt-2 text-center text-[10px] text-white/35"><Sparkles size={11} className="mr-1 inline hw-gold-text"/>Tap a card, then its destination. Only engine-verified legal moves are accepted.</p>
    </div>
  </GameShell>;
}

function Foundation({card,suit,onClick,selected}){
  const symbol=({hearts:'♥',diamonds:'♦',clubs:'♣',spades:'♠'})[suit];
  if(card)return <div className={`flex h-[62px] w-11 items-center justify-center rounded-lg ${selected?'hw-solitaire-action-glow':''}`}><MiniCard card={card} selected={selected} onClick={onClick}/></div>;
  return <button type="button" onClick={onClick} className={`hw-solitaire-slot flex h-[62px] w-11 items-center justify-center rounded-lg ${selected?'hw-solitaire-action-glow':''}`}><span className="text-lg text-white/18">{symbol}</span></button>;
}

function KlondikeBoard({state,selection,setSelection,legal,commit}){
  function chooseTableau(col,index){
    if(selection){
      const action=selection.zone==='waste'?legal.find(a=>a.type==='waste-to-tableau'&&a.toCol===col):selection.zone==='foundation'?legal.find(a=>a.type==='foundation-to-tableau'&&a.suit===selection.suit&&a.toCol===col):selection.zone==='tableau'?legal.find(a=>a.type==='move-tableau'&&a.fromCol===selection.col&&a.fromIndex===selection.index&&a.toCol===col):null;
      if(action){commit(action);return;}
    }
    if(state.tableau[col][index]?.faceUp)setSelection({zone:'tableau',col,index});
  }
  function foundationTap(suit){
    if(selection?.zone==='waste'){const action=legal.find(a=>a.type==='waste-to-foundation');if(action){commit(action);return;}}
    if(selection?.zone==='tableau'){const action=legal.find(a=>a.type==='tableau-to-foundation'&&a.fromCol===selection.col);if(action){commit(action);return;}}
    if(state.foundations[suit].length)setSelection({zone:'foundation',suit});
  }
  return <div><div className="flex items-start justify-between gap-3"><div className="flex gap-2"><button type="button" onClick={()=>{const action=legal.find(a=>a.type==='draw-stock'||a.type==='recycle-stock');if(action)commit(action);}} className="hw-solitaire-slot h-[62px] w-11 rounded-lg">{state.stock.length?<span className="block h-full w-full rounded-lg hw-solitaire-card-back"/>:<span className="text-xl text-white/30">↻</span>}</button><div onClick={()=>state.waste.length&&setSelection({zone:'waste'})}>{state.waste.at(-1)?<MiniCard card={state.waste.at(-1)} selected={selection?.zone==='waste'}/>:<div className="hw-solitaire-slot h-[62px] w-11 rounded-lg"/>}</div></div><div className="flex gap-1">{['hearts','diamonds','clubs','spades'].map(suit=><Foundation key={suit} suit={suit} card={state.foundations[suit].at(-1)} selected={selection?.zone==='foundation'&&selection.suit===suit} onClick={()=>foundationTap(suit)}/>)}</div></div><div className="mt-5 grid grid-cols-7 gap-1">{state.tableau.map((column,col)=><div key={col} className="hw-solitaire-column relative min-h-[320px]" onClick={()=>!column.length&&chooseTableau(col,0)}>{column.map((row,index)=><div key={`${row.card.id}-${index}`} className="absolute left-0" style={{top:index*24}}><MiniCard card={row.card} faceDown={!row.faceUp} selected={selection?.zone==='tableau'&&selection.col===col&&selection.index===index} onClick={event=>{event.stopPropagation();if(row.faceUp)chooseTableau(col,index);}}/></div>)}</div>)}</div></div>;
}

function SpiderBoard({state,selection,setSelection,legal,commit}){
  function tap(col,index){
    if(selection?.zone==='tableau'){
      const action=legal.find(a=>a.type==='move-run'&&a.fromCol===selection.col&&a.fromIndex===selection.index&&a.toCol===col);if(action){commit(action);return;}
    }
    if(state.tableau[col][index]?.faceUp)setSelection({zone:'tableau',col,index});
  }
  return <div><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/40">Completed runs</p><p className="mt-1 text-xl font-black hw-gold-text">{state.completed}/8</p></div><button type="button" onClick={()=>{const action=legal.find(a=>a.type==='deal-row');if(action)commit(action);}} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs font-black text-white"><span className="h-8 w-6 rounded hw-solitaire-card-back"/>{Math.floor(state.stock.length/10)} deals</button></div><div className="mt-4 grid grid-cols-10 gap-1 overflow-x-auto">{state.tableau.map((column,col)=><div key={col} className="hw-solitaire-column relative min-h-[390px]" onClick={()=>!column.length&&tap(col,0)}>{column.map((row,index)=><div key={row.card.shoeCardId} className="absolute left-0" style={{top:index*22}}><MiniCard card={row.card} faceDown={!row.faceUp} selected={selection?.col===col&&selection.index===index} onClick={event=>{event.stopPropagation();if(row.faceUp)tap(col,index);}}/></div>)}</div>)}</div></div>;
}

function FreeCellBoard({state,selection,setSelection,legal,commit}){
  function tapTableau(col,index){
    if(selection){let action=null;if(selection.zone==='cell')action=legal.find(a=>a.type==='cell-to-tableau'&&a.fromCell===selection.cell&&a.toCol===col);else if(selection.zone==='tableau')action=legal.find(a=>a.type==='move-tableau'&&a.fromCol===selection.col&&a.fromIndex===selection.index&&a.toCol===col);if(action){commit(action);return;}}
    if(state.tableau[col][index])setSelection({zone:'tableau',col,index});
  }
  function tapCell(cell){
    if(selection?.zone==='tableau'&&!state.freeCells[cell]){const action=legal.find(a=>a.type==='tableau-to-cell'&&a.fromCol===selection.col&&a.toCell===cell);if(action){commit(action);return;}}
    if(state.freeCells[cell])setSelection({zone:'cell',cell});
  }
  function tapFoundation(suit){
    let action=null;if(selection?.zone==='tableau')action=legal.find(a=>a.type==='tableau-to-foundation'&&a.fromCol===selection.col);if(selection?.zone==='cell')action=legal.find(a=>a.type==='cell-to-foundation'&&a.fromCell===selection.cell);if(action){commit(action);return;}
  }
  return <div><div className="flex items-start justify-between gap-2"><div className="grid grid-cols-4 gap-1">{state.freeCells.map((card,index)=><button key={index} type="button" onClick={()=>tapCell(index)} className={`hw-solitaire-slot h-[62px] w-11 rounded-lg ${selection?.zone==='cell'&&selection.cell===index?'hw-solitaire-action-glow':''}`}>{card?<MiniCard card={card}/>:<span className="text-[9px] text-white/18">FREE</span>}</button>)}</div><div className="grid grid-cols-4 gap-1">{['hearts','diamonds','clubs','spades'].map(suit=><Foundation key={suit} suit={suit} card={state.foundations[suit].at(-1)} onClick={()=>tapFoundation(suit)}/>)}</div></div><div className="mt-5 grid grid-cols-8 gap-1 overflow-x-auto">{state.tableau.map((column,col)=><div key={col} className="hw-solitaire-column relative min-h-[390px]" onClick={()=>!column.length&&tapTableau(col,0)}>{column.map((card,index)=><div key={card.id} className="absolute left-0" style={{top:index*28}}><MiniCard card={card} selected={selection?.zone==='tableau'&&selection.col===col&&selection.index===index} onClick={event=>{event.stopPropagation();tapTableau(col,index);}}/></div>)}</div>)}</div></div>;
}

const TRI_POS={0:[24,0],1:[120,0],2:[216,0],3:[8,52],4:[48,52],5:[104,52],6:[144,52],7:[200,52],8:[240,52],9:[0,104],10:[32,104],11:[64,104],12:[96,104],13:[128,104],14:[160,104],15:[192,104],16:[224,104],17:[256,104],18:[0,158],19:[30,158],20:[60,158],21:[90,158],22:[120,158],23:[150,158],24:[180,158],25:[210,158],26:[240,158],27:[270,158]};
function TriPeaksBoard({state,legal,commit}){const exposed=new Set(triPeaksExposed(state));return <div><div className="flex justify-between"><div><p className="text-[9px] uppercase tracking-[.15em] text-white/40">Chain</p><p className="text-xl font-black hw-gold-text">{state.streak}</p></div><div className="flex gap-2"><button type="button" onClick={()=>{const a=legal.find(x=>x.type==='draw-stock');if(a)commit(a);}} className="hw-solitaire-slot h-[70px] w-[50px] rounded-lg">{state.stock.length?<span className="block h-full w-full rounded-lg hw-solitaire-card-back"/>:<span className="text-white/25">0</span>}</button><PlayingCard card={state.waste} /></div></div><div className="relative mx-auto mt-5 h-[245px] w-[315px] max-w-full">{state.tableau.map(row=>!row.removed?<div key={row.index} className="absolute" style={{left:TRI_POS[row.index][0],top:TRI_POS[row.index][1]}}><MiniCard card={row.card} faceDown={!exposed.has(row.index)} onClick={()=>{const a=legal.find(x=>x.type==='remove'&&x.index===row.index);if(a)commit(a);}}/></div>:null)}</div></div>}

const PYR_POS=Array.from({length:28},(_,index)=>{let row=0;while((row+1)*(row+2)/2<=index)row++;const start=row*(row+1)/2,col=index-start;return [135-row*19+col*38,row*48];});
function PyramidBoard({state,selection,setSelection,legal,commit}){const exposed=new Set(pyramidExposed(state));function choose(target){const targetKey=keyOf(target);const king=legal.find(a=>a.type==='remove-king'&&keyOf(a.target)===targetKey);if(king){commit(king);return;}if(selection){const pair=legal.find(a=>a.type==='remove-pair'&&((keyOf(a.a)===keyOf(selection)&&keyOf(a.b)===targetKey)||(keyOf(a.b)===keyOf(selection)&&keyOf(a.a)===targetKey)));if(pair){commit(pair);return;}}setSelection(target);}return <div><div className="flex justify-between"><div><p className="text-[9px] uppercase tracking-[.15em] text-white/40">Cleared</p><p className="text-xl font-black hw-gold-text">{state.tableau.filter(row=>row.removed).length}/28</p></div><div className="flex gap-2"><button type="button" onClick={()=>{const a=legal.find(x=>x.type==='draw-stock');if(a)commit(a);}} className="hw-solitaire-slot h-[70px] w-[50px] rounded-lg">{state.stock.length?<span className="block h-full w-full rounded-lg hw-solitaire-card-back"/>:<span className="text-white/25">0</span>}</button><div onClick={()=>state.waste&&choose({zone:'waste'})}>{state.waste?<MiniCard card={state.waste} selected={selection?.zone==='waste'}/>:<div className="hw-solitaire-slot h-[70px] w-[50px] rounded-lg"/>}</div></div></div><div className="relative mx-auto mt-4 h-[355px] w-[320px] max-w-full">{state.tableau.map(row=>!row.removed?<div key={row.index} className="absolute" style={{left:PYR_POS[row.index][0],top:PYR_POS[row.index][1]}}><MiniCard card={row.card} faceDown={!exposed.has(row.index)} selected={selection?.zone==='tableau'&&selection.index===row.index} onClick={()=>{if(exposed.has(row.index))choose({zone:'tableau',index:row.index});}}/></div>:null)}</div><p className="text-center text-[10px] text-white/38">Pair exposed cards totaling 13. Kings clear alone.</p></div>}
