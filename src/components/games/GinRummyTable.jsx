import React, { useMemo, useState } from 'react';
import { Bot, Brain, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PlayingCard from '@/components/PlayingCard';
import { ginRummyEngine, analyzeGinHand, chooseGinBotAction, startNextGinRound } from '@/games/engines/ginRummy';
import { recordGameResult } from '@/lib/cardAcademyProgress';
import './ginRummy.css';

const HUMAN = 0;

function driveBot(input) {
  let state = structuredClone(input);
  let guard = 0;
  while (!state.roundComplete && !state.matchComplete && state.actor !== HUMAN && guard++ < 220) {
    state = ginRummyEngine.applyAction(state, chooseGinBotAction(state, state.actor));
  }
  if (guard >= 220) throw new Error('Gin Rummy bot guard exceeded');
  return state;
}

function fresh(seed = 20260815) {
  return driveBot(ginRummyEngine.createGame({ seed, humanSeat:HUMAN, targetScore:100 }));
}

export default function GinRummyTable({ game }) {
  const [seed,setSeed] = useState(20260815);
  const [state,setState] = useState(() => fresh());
  const [selected,setSelected] = useState(null);
  const [showCoach,setShowCoach] = useState(true);
  const legal = useMemo(() => ginRummyEngine.legalActions(state,HUMAN), [state]);
  const analysis = useMemo(() => analyzeGinHand(state.players[HUMAN]?.hand || []), [state]);
  const opponentAnalysis = state.roundComplete ? analyzeGinHand(state.players[1]?.hand || []) : null;

  function finish(previous,next) {
    if (!previous.roundComplete && next.roundComplete) {
      const won = Number(next.roundResult?.roundScores?.[HUMAN] || 0) > Number(next.roundResult?.roundScores?.[1] || 0);
      recordGameResult('gin-rummy',{family:'classics',won,xp:won?22:8});
    }
    setState(next);
    setSelected(null);
  }

  function commit(action) {
    const previous = state;
    let next = ginRummyEngine.applyAction(state,action);
    next = driveBot(next);
    finish(previous,next);
  }

  function nextRound() {
    let next = startNextGinRound(state);
    next = driveBot(next);
    setState(next);
    setSelected(null);
  }

  function newMatch() {
    const nextSeed = seed + 99991;
    setSeed(nextSeed);
    setState(fresh(nextSeed));
    setSelected(null);
  }

  const canDrawStock = legal.some(a=>a.type==='draw-stock');
  const canDrawDiscard = legal.some(a=>a.type==='draw-discard');
  const normalDiscard = selected ? legal.find(a=>a.type==='discard'&&a.cardId===selected) : null;
  const knock = selected ? legal.find(a=>a.type==='knock-discard'&&a.cardId===selected) : null;
  const coachFacts = ginRummyEngine.coachFacts(state,HUMAN);

  return <GameShell game={game} coachContext={{game:'Gin Rummy',facts:coachFacts}}>
    <div className="mx-auto max-w-3xl">
      <div className="mb-2 grid grid-cols-3 gap-2 text-center">
        <GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">You</p><p className="mt-1 text-sm font-black text-white">{state.scores[HUMAN]}</p></GlassSurface>
        <GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Round</p><p className="mt-1 text-sm font-black hw-gin-gold">{state.roundNumber}</p></GlassSurface>
        <GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Opponent</p><p className="mt-1 text-sm font-black text-white">{state.scores[1]}</p></GlassSurface>
      </div>

      <section className="hw-gin-table min-h-[515px] rounded-[2.8rem] p-4 sm:rounded-[4rem] sm:p-6">
        <div className="relative z-10 text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/8 bg-black/20 px-3 py-2 text-xs font-black text-white/70 backdrop-blur-md"><Bot size={14}/>Opponent · {state.players[1].hand.length} cards</div>
          <div className="mt-3 flex justify-center -space-x-4">{state.players[1].hand.map((card,index)=>state.roundComplete?<PlayingCard key={`${card.id}-${index}`} card={card}/>:<span key={index} className="h-20 w-14 rounded-xl hw-gin-stock sm:h-24 sm:w-16"/>)}</div>
          {state.roundComplete&&opponentAnalysis&&<p className="mt-2 text-[10px] text-white/45">Opponent deadwood {opponentAnalysis.deadwoodPoints}</p>}
        </div>

        <div className="relative z-10 mx-auto my-5 flex items-center justify-center gap-5">
          <button type="button" disabled={!canDrawStock} onClick={()=>canDrawStock&&commit({type:'draw-stock',actor:HUMAN})} className={`min-h-[96px] min-w-[70px] rounded-xl p-1 ${state.stock.length?'hw-gin-stock':'border border-white/8 bg-black/10'} ${canDrawStock?'cursor-pointer':'opacity-50'}`} aria-label="Stock"><span className="text-[9px] font-black uppercase tracking-wider text-white/70">Stock</span><span className="mt-1 block text-xs font-black text-white">{state.stock.length}</span></button>
          <div className="text-center"><p className="mb-1 text-[9px] font-black uppercase tracking-[.16em] text-white/35">Discard</p><div onClick={()=>canDrawDiscard&&commit({type:'draw-discard',actor:HUMAN})} className={canDrawDiscard?'cursor-pointer':''}>{state.discard.at(-1)?<PlayingCard card={state.discard.at(-1)}/>:<div className="h-24 w-16 rounded-xl border border-white/8 bg-black/10"/>}</div></div>
          <div className="hw-gin-purple rounded-2xl p-3 text-left"><p className="text-[9px] font-black uppercase tracking-[.15em] text-violet-200/75">Phase</p><p className="mt-1 text-sm font-black capitalize text-white">{state.phase}</p><p className="mt-1 text-[10px] text-white/45">Turn {state.turns+1}</p></div>
        </div>

        <div className="relative z-10 rounded-[1.6rem] border border-white/8 bg-black/12 p-3">
          <div className="mb-3 flex items-center justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[.16em] text-white/42">Your sorted hand</p><p className="mt-1 text-xs text-white/55">{state.phase==='draw'?'Choose Stock or Discard.':'Choose one card to discard.'}</p></div><span className="hw-gin-deadwood rounded-full px-3 py-1.5 text-xs font-black">Deadwood {analysis.deadwoodPoints}</span></div>
          <div className="flex overflow-x-auto pb-3"><div className="flex min-w-max -space-x-6 px-4 sm:-space-x-4">{state.players[HUMAN].hand.map(card=><div key={card.id} className={`transition-transform ${selected===card.id?'-translate-y-3':''}`}><PlayingCard card={card} selected={selected===card.id} onClick={state.phase==='discard'?()=>setSelected(current=>current===card.id?null:card.id):undefined}/></div>)}</div></div>
          <div className="mt-1 grid grid-cols-2 gap-2 text-[10px] text-white/50"><span>Meld groups: <strong className="text-white">{analysis.melds.length}</strong></span><span className="text-right">Target: <strong className="text-white">100</strong></span></div>
        </div>
      </section>

      {state.phase==='discard'&&state.actor===HUMAN&&<GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-3">
        {showCoach&&<div className="mb-3 hw-gin-purple rounded-2xl p-3"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.16em] text-violet-200"><Brain size={13}/>Coach Ace</p><p className="mt-1 text-xs leading-5 text-white/60">Knock is offered only if discarding the selected card leaves 10 or fewer deadwood points. GIN means the remaining ten cards have zero deadwood.</p></div>}
        <div className="grid grid-cols-2 gap-2"><TactilePressable disabled={!normalDiscard} onClick={()=>normalDiscard&&commit({type:'discard',actor:HUMAN,cardId:selected})} className="rounded-2xl bg-white/7 px-4 py-3.5 font-black text-white shadow-none">Discard</TactilePressable>{knock?<TactilePressable onClick={()=>commit({type:'knock-discard',actor:HUMAN,cardId:selected})} className="hw-gin-knock rounded-2xl px-4 py-3.5 font-black">{knock.gin?'GIN':'Knock'} · {knock.deadwood}</TactilePressable>:<TactilePressable disabled className="rounded-2xl bg-white/4 px-4 py-3.5 font-black text-white/30 shadow-none">Knock</TactilePressable>}</div>
        <button type="button" onClick={()=>setShowCoach(v=>!v)} className="mt-2 min-h-[44px] w-full text-[10px] font-bold text-white/40">{showCoach?'Hide':'Show'} strategy note</button>
      </GlassSurface>}

      {state.roundComplete&&<GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-5 text-center"><Trophy size={36} className="mx-auto hw-gin-gold"/><p className="mt-2 text-[9px] font-black uppercase tracking-[.17em] hw-gin-gold">Round complete</p><h3 className="mt-1 font-heading text-2xl font-black text-white">{state.roundResult?.draw?'Draw round':state.roundResult?.gin?'GIN!':state.roundResult?.undercut?'Undercut':'Knock settled'}</h3>{!state.roundResult?.draw&&<p className="mt-2 text-sm text-white/55">Deadwood {state.roundResult?.knockerDeadwood} vs {state.roundResult?.defenderDeadwood} · Round {state.roundResult?.roundScores?.[0]||0}–{state.roundResult?.roundScores?.[1]||0}</p>}<p className="mt-1 text-xs text-white/40">Match {state.scores[0]}–{state.scores[1]}</p><div className="mt-4 grid grid-cols-2 gap-2">{!state.matchComplete&&<TactilePressable onClick={nextRound} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3 font-black text-[hsl(var(--hw-navy))]">New Round</TactilePressable>}<TactilePressable onClick={newMatch} className="rounded-2xl bg-white/7 px-4 py-3 font-black text-white shadow-none"><RotateCcw size={15} className="mr-1 inline"/>New Match</TactilePressable></div></GlassSurface>}

      <p className="mt-2 text-center text-[10px] text-white/35"><Sparkles size={11} className="mr-1 inline hw-gin-gold"/>Stock · Discard · Deadwood · Knock · GIN · Layoffs · Undercut · first to 100</p>
    </div>
  </GameShell>;
}
