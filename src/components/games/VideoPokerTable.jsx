import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Coins, Info, Sparkles, Trophy } from 'lucide-react';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PlayingCard from '@/components/PlayingCard';
import { VIDEO_POKER_VARIANTS } from '@/games/core/videoPokerEvaluator';
import { videoPokerEngine } from '@/games/engines/videoPoker';
import { getStrategyRecommendation } from '@/lib/cards/strategyClient';
import { getPayTable } from '@/lib/cards/payTables';
import { recordGameResult } from '@/lib/cardAcademyProgress';
import './videoPoker.css';

export const VIDEO_POKER_IDS = Object.keys(VIDEO_POKER_VARIANTS);

const LABELS = {
  ROYAL_FLUSH:'Royal Flush', NATURAL_ROYAL:'Natural Royal', WILD_ROYAL:'Wild Royal', STRAIGHT_FLUSH:'Straight Flush',
  FOUR_ACES_KICKER:'4 Aces + 2-4', FOUR_2_4_KICKER:'4 2-4 + A-4', FOUR_ACES:'Four Aces', FOUR_2_4:'Four 2-4', FOUR_5_K:'Four 5-K',
  FOUR_DEUCES:'Four Deuces', FIVE_OF_A_KIND:'Five of a Kind', FOUR_OF_A_KIND:'Four of a Kind', FULL_HOUSE:'Full House', FLUSH:'Flush', STRAIGHT:'Straight', THREE_OF_A_KIND:'Three of a Kind', TWO_PAIR:'Two Pair', HIGH_PAIR:'Jacks or Better', KINGS_OR_BETTER:'Kings or Better'
};

function createState(variantId, bankroll=500, seed=20260815) {
  return videoPokerEngine.createGame({ variantId, bankroll, seed });
}

export default function VideoPokerTable({ game }) {
  const navigate = useNavigate();
  const variantId = game?.id && VIDEO_POKER_IDS.includes(game.id) ? game.id : 'jacks-or-better';
  const variant = VIDEO_POKER_VARIANTS[variantId];
  const [state,setState] = useState(() => createState(variantId));
  const [showPayTable,setShowPayTable] = useState(true);
  const [exactHint,setExactHint] = useState(null);
  const [hintBusy,setHintBusy] = useState(false);

  useEffect(() => { setState(previous => createState(variantId, Math.max(1,previous.bankroll), previous.seed+97)); setExactHint(null); }, [variantId]);

  useEffect(() => {
    let cancelled=false;
    if (variantId !== 'jacks-or-better' || state.phase !== 'hold' || state.hand.length !== 5) { setExactHint(null); return undefined; }
    setHintBusy(true);
    getStrategyRecommendation(state.hand,getPayTable('job-9-6'),{credits:state.credits,timeoutMs:15000}).then(result=>{ if(!cancelled) setExactHint(result); }).finally(()=>{ if(!cancelled) setHintBusy(false); });
    return () => { cancelled=true; };
  },[variantId,state.phase,state.handNumber]);

  const payoutRows = useMemo(() => Object.entries(variant.payouts), [variant]);

  function apply(action) {
    const next = videoPokerEngine.applyAction(state,action);
    if (state.phase !== 'result' && next.phase === 'result') recordGameResult(variantId,{family:'poker',won:next.result.payout>0,xp:next.result.payout>0?12:5});
    setState(next);
  }

  const coachFacts = videoPokerEngine.coachFacts(state);
  if (exactHint?.reason) coachFacts.push(`Exact Jacks hold: ${exactHint.reason}`);
  const gameShell = { ...game, title:variant.name };

  return <GameShell game={gameShell} coachContext={{game:variant.name,facts:coachFacts}}>
    <div className="mx-auto max-w-3xl hw-vp-machine rounded-[1.8rem] p-3 sm:p-4">
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {VIDEO_POKER_IDS.map(id => <TactilePressable key={id} onClick={()=>navigate(`/game/${id}`)} className={`min-w-max rounded-xl px-3 py-2 text-[11px] font-black ${id===variantId?'bg-[hsl(var(--hw-gold))] text-[hsl(var(--hw-navy))]':'bg-white/6 text-white shadow-none'}`}>{VIDEO_POKER_VARIANTS[id].name}</TactilePressable>)}
      </div>

      <GlassSurface strength={3} className="hw-vp-paytable rounded-2xl p-3">
        <button type="button" onClick={()=>setShowPayTable(v=>!v)} className="flex min-h-[44px] w-full items-center justify-between text-left">
          <div><p className="text-[9px] font-black uppercase tracking-[.18em] hw-gold-text">Pay Table</p><p className="mt-0.5 text-xs font-bold text-white">{variant.payTableName}</p></div><ChevronDown size={18} className={`text-white/60 transition-transform ${showPayTable?'rotate-180':''}`} />
        </button>
        {showPayTable && <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-white/6 bg-black/15">
          <div className="sticky top-0 grid grid-cols-[1.45fr_repeat(5,.55fr)] bg-[#071015]/95 px-2 py-1.5 text-[9px] font-black uppercase text-white/45"><span>Hand</span>{[1,2,3,4,5].map(c=><span key={c} className="text-center">{c}</span>)}</div>
          {payoutRows.map(([category,row])=><div key={category} className={`grid grid-cols-[1.45fr_repeat(5,.55fr)] border-t border-white/5 px-2 py-1.5 text-[10px] ${state.result?.category===category?'bg-amber-300/10 text-amber-100':'text-white/68'}`}><span className="font-bold">{LABELS[category]||category.replaceAll('_',' ')}</span>{row.map((p,index)=><span key={index} className="text-center tabular-nums">{p}</span>)}</div>)}
        </div>}
      </GlassSurface>

      <div className="hw-vp-screen mt-3 rounded-[1.5rem] p-3 sm:p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-black/20 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-wider text-white/40">Bankroll</p><p className="mt-1 font-black text-white">{state.bankroll}</p></div>
          <div className="rounded-xl bg-black/20 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-wider text-white/40">Credits</p><p className="mt-1 font-black hw-gold-text">{state.credits}</p></div>
          <div className="rounded-xl bg-black/20 px-2 py-2"><p className="text-[8px] font-black uppercase tracking-wider text-white/40">Hand</p><p className="mt-1 font-black text-white">#{state.handNumber}</p></div>
        </div>

        <div className="mt-5 flex min-h-[132px] items-center justify-center gap-1 sm:gap-2">
          {state.hand.length ? state.hand.map((card,index)=><div key={`${state.handNumber}-${index}-${card.id}`} className={state.holdMask[index]?'hw-vp-held rounded-xl':''}><PlayingCard card={card} held={state.holdMask[index]} onClick={state.phase==='hold'?()=>apply({type:'toggle-hold',index}):undefined} /></div>) : Array.from({length:5},(_,index)=><div key={index} className="h-24 w-16 rounded-xl border border-white/8 bg-black/10 sm:h-28 sm:w-20" />)}
        </div>

        <div className="mt-3 min-h-14 text-center">
          {state.phase==='bet' && <p className="text-sm font-bold text-white/65">Choose 1–5 Credits, then Deal.</p>}
          {state.phase==='hold' && <><p className="text-sm font-black text-white">Tap cards to <span className="hw-vp-win">Hold</span>, then Draw.</p>{variantId==='jacks-or-better' && <p className="mt-1 text-[10px] text-white/45">{hintBusy?'Coach Ace is calculating every legal hold…':exactHint?'Exact hold calculation ready — Ask Coach Ace for the why.':'Exact strategy available.'}</p>}{variant.wild && <p className="mt-1 flex items-center justify-center gap-1 text-[10px] text-amber-100/60"><Info size={11}/>Wild-card scoring is variant-specific.</p>}</>}
          {state.phase==='result' && <motionResult result={state.result} />}
        </div>
      </div>

      {state.phase==='bet' && <div className="mt-3 grid grid-cols-[1fr_1.35fr] gap-3">
        <GlassSurface strength={2} className="rounded-2xl p-2"><p className="px-1 text-[9px] font-black uppercase tracking-[.16em] text-white/45">Credits</p><div className="mt-1 grid grid-cols-5 gap-1">{[1,2,3,4,5].map(credits=><TactilePressable key={credits} onClick={()=>apply({type:'set-credits',credits})} className={`rounded-lg py-2 text-xs font-black ${state.credits===credits?'bg-[hsl(var(--hw-gold))] text-[hsl(var(--hw-navy))]':'bg-white/5 text-white shadow-none'}`}>{credits}</TactilePressable>)}</div></GlassSurface>
        <TactilePressable disabled={state.bankroll<state.credits} onClick={()=>apply({type:'deal'})} className="rounded-2xl bg-[hsl(var(--hw-gold))] text-lg font-black text-[hsl(var(--hw-navy))]"><Coins size={19} className="mr-2 inline"/>Deal</TactilePressable>
      </div>}

      {state.phase==='hold' && <div className="mt-3 grid grid-cols-[.75fr_1.25fr] gap-3"><TactilePressable onClick={()=>state.hand.forEach((_,index)=>{ if(state.holdMask[index]){} })} className="rounded-2xl bg-white/6 px-3 py-3 text-xs font-black text-white shadow-none">Hold selected</TactilePressable><TactilePressable onClick={()=>apply({type:'draw'})} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3.5 text-lg font-black text-[hsl(var(--hw-navy))]">Draw</TactilePressable></div>}

      {state.phase==='result' && <div className="mt-3"><TactilePressable onClick={()=>apply({type:'new-hand'})} className="w-full rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3.5 text-base font-black text-[hsl(var(--hw-navy))]"><Sparkles size={18} className="mr-2 inline"/>New Hand</TactilePressable></div>}

      <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[10px] text-white/38"><span className="flex items-center gap-1"><Trophy size={11}/>Authentic named Pay Table</span><span>Ask Coach Ace for strategy</span></div>
    </div>
  </GameShell>;
}

function motionResult({result}) {
  if(!result) return null;
  return <div className="rounded-2xl border border-white/8 bg-black/15 p-2.5"><p className={`font-heading text-xl font-black ${result.payout>0?'hw-vp-win':'hw-vp-danger'}`}>{result.name}</p><p className="mt-1 text-xs text-white/55">{result.payout>0?`Paid ${result.payout} credits · Net ${result.net>=0?'+':''}${result.net}`:'No payout this hand'}</p></div>;
}
