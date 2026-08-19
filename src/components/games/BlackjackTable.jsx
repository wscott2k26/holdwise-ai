import React, { useMemo, useState } from 'react';
import { Brain, CircleDollarSign, Info, RotateCcw, ShieldQuestion, Sparkles } from 'lucide-react';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PlayingCard from '@/components/PlayingCard';
import { blackjackEngine, blackjackValue, basicStrategyAdvice } from '@/games/engines/blackjack';
import { recordGameResult } from '@/lib/cardAcademyProgress';
import './blackjack.css';

const STARTING_BANKROLL = 500;

function makeGame(seed = 20260815, bankroll = STARTING_BANKROLL) {
  return blackjackEngine.createGame({ seed, bankroll, bet:10 });
}

function handLabel(hand, index) {
  const value = blackjackValue(hand.cards);
  return `${hand.fromSplit ? `Split hand ${index + 1}` : 'Your hand'} · ${value.soft ? 'Soft ' : ''}${value.total}`;
}

function resultLabel(result) {
  return ({ blackjack:'Blackjack!', win:'You win', loss:'Dealer wins', push:'Push', bust:'Bust' })[result] || result || '';
}

export default function BlackjackTable({ game }) {
  const [state,setState] = useState(() => makeGame());
  const [showAdvice,setShowAdvice] = useState(true);
  const legal = useMemo(() => blackjackEngine.legalActions(state), [state]);
  const advice = useMemo(() => basicStrategyAdvice(state), [state]);
  const can = type => legal.some(action => action.type === type);
  const dealerReveal = state.phase === 'result';
  const dealerValue = dealerReveal ? blackjackValue(state.dealer.cards) : null;

  function apply(action) {
    const previous = state;
    const next = blackjackEngine.applyAction(state, action);
    if (previous.phase !== 'result' && next.phase === 'result') {
      const won = next.hands.some(hand => ['win','blackjack'].includes(hand.result));
      recordGameResult('blackjack',{family:'casino',won,xp:won?18:7});
    }
    setState(next);
  }

  function newMatch() {
    setState(makeGame(state.seed + 99991, STARTING_BANKROLL));
  }

  const coachFacts = blackjackEngine.coachFacts(state);
  if (advice?.reason) coachFacts.push(`Basic strategy: ${advice.action}. ${advice.reason}`);

  return <GameShell game={game} coachContext={{game:'Blackjack',facts:coachFacts}}>
    <div className="mx-auto max-w-3xl">
      <div className="mb-2 grid grid-cols-3 gap-2 text-center">
        <GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] font-black uppercase tracking-[.16em] text-white/42">Bankroll</p><p className="mt-1 flex items-center justify-center gap-1 text-sm font-black text-white"><CircleDollarSign size={13}/>{state.bankroll}</p></GlassSurface>
        <GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] font-black uppercase tracking-[.16em] text-white/42">Table</p><p className="mt-1 text-sm font-black hw-gold-text">6D · S17 · 3:2</p></GlassSurface>
        <GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] font-black uppercase tracking-[.16em] text-white/42">Shoe</p><p className="mt-1 text-sm font-black text-white">{state.shoe.length}</p></GlassSurface>
      </div>

      <section className="hw-blackjack-felt min-h-[510px] rounded-[3rem] px-3 py-5 sm:rounded-[4.8rem] sm:px-6">
        <div className="relative z-10 text-center">
          <p className="text-[9px] font-black uppercase tracking-[.2em] text-white/45">Dealer</p>
          <div className="mt-2 flex min-h-[112px] justify-center gap-2">
            {state.dealer.cards.length ? state.dealer.cards.map((card,index)=><PlayingCard key={`${card.shoeCardId||card.id}-${index}`} card={card} faceDown={index===1 && !dealerReveal} />) : <><div className="h-24 w-16 rounded-xl border border-dashed border-white/10 bg-black/10 sm:h-28 sm:w-20"/><div className="h-24 w-16 rounded-xl border border-dashed border-white/10 bg-black/10 sm:h-28 sm:w-20"/></>}
          </div>
          <div className="mt-1 min-h-6 text-xs font-black text-white/70">{dealerReveal ? `Dealer ${dealerValue?.soft?'soft ':''}${dealerValue?.total}${dealerValue?.bust?' · BUST':''}` : state.dealer.cards.length ? `Showing ${state.dealer.cards[0].displaySymbol}${state.dealer.cards[0].suitSymbol}` : 'Dealer waiting'}</div>
        </div>

        <div className="relative z-10 mx-auto my-5 h-px w-3/4 bg-gradient-to-r from-transparent via-amber-200/25 to-transparent" />

        <div className="relative z-10 space-y-3">
          {state.hands.length ? state.hands.map((hand,index)=>{
            const value=blackjackValue(hand.cards);
            const active=state.phase==='player' && state.activeHand===index;
            return <GlassSurface key={index} strength={2} className={`rounded-2xl border p-3 ${active?'hw-blackjack-hand-active':'border-white/8'}`}>
              <div className="mb-2 flex items-center justify-between gap-2"><p className="text-[10px] font-black uppercase tracking-[.13em] text-white/55">{handLabel(hand,index)}</p><div className="flex items-center gap-2"><span className="hw-blackjack-chip rounded-full px-2 py-1 text-[9px] font-black">BET {hand.wager}</span>{hand.result&&<span className={`rounded-full px-2 py-1 text-[9px] font-black uppercase ${['loss','bust'].includes(hand.result)?'hw-blackjack-bust':'bg-emerald-300/12 text-emerald-100'}`}>{resultLabel(hand.result)}</span>}</div></div>
              <div className="flex min-h-[112px] flex-wrap items-center justify-center gap-2">{hand.cards.map((card,cardIndex)=><PlayingCard key={`${card.shoeCardId||card.id}-${cardIndex}`} card={card} />)}</div>
              {value.blackjack && <p className="mt-2 text-center font-heading text-xl font-black hw-gold-text">BLACKJACK</p>}
            </GlassSurface>;
          }) : <div className="flex min-h-[170px] items-center justify-center text-center"><div><p className="font-heading text-2xl font-black text-white">Blackjack</p><p className="mt-2 text-sm text-white/48">Set your bet and deal a full casino round.</p></div></div>}
        </div>
      </section>

      {state.phase==='bet' && <GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-3">
        <div className="flex items-center justify-between text-xs"><span className="font-bold text-white/65">Bet <strong className="ml-1 hw-gold-text">{state.bet}</strong></span><span className="text-white/40">Bankroll {state.bankroll}</span></div>
        <input type="range" min="1" max={Math.max(1,state.bankroll)} step="5" value={Math.min(state.bet,Math.max(1,state.bankroll))} onChange={event=>apply({type:'set-bet',amount:Number(event.target.value)})} className="mt-2 h-9 w-full accent-amber-300" aria-label="Blackjack bet" />
        <div className="grid grid-cols-4 gap-2">{[10,25,50,100].map(amount=><TactilePressable key={amount} disabled={amount>state.bankroll} onClick={()=>apply({type:'set-bet',amount})} className={`rounded-xl py-2 text-xs font-black ${state.bet===amount?'bg-[hsl(var(--hw-gold))] text-[hsl(var(--hw-navy))]':'bg-white/6 text-white shadow-none'}`}>{amount}</TactilePressable>)}</div>
        <TactilePressable disabled={!can('deal')} onClick={()=>apply({type:'deal'})} soundType="deal" className="mt-3 w-full rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3.5 text-lg font-black text-[hsl(var(--hw-navy))]">Deal</TactilePressable>
      </GlassSurface>}

      {state.phase==='insurance' && <GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-4 text-center">
        <ShieldQuestion size={30} className="mx-auto hw-gold-text"/><p className="mt-2 text-[10px] font-black uppercase tracking-[.17em] hw-gold-text">Insurance</p><h3 className="mt-1 font-heading text-xl font-black text-white">Dealer shows an Ace</h3><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-white/55">Insurance costs {state.hands[0].wager/2} and pays 2:1 if the dealer has Blackjack. Coach Ace can explain why basic strategy usually declines it.</p>
        <div className="mt-4 grid grid-cols-2 gap-2">{can('take-insurance')&&<TactilePressable onClick={()=>apply({type:'take-insurance'})} className="rounded-2xl bg-white/7 px-3 py-3 font-black text-white shadow-none">Take Insurance</TactilePressable>}<TactilePressable onClick={()=>apply({type:'decline-insurance'})} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-3 py-3 font-black text-[hsl(var(--hw-navy))]">No Insurance</TactilePressable></div>
      </GlassSurface>}

      {state.phase==='player' && <GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-3">
        {showAdvice && advice && <div className="mb-3 rounded-2xl border border-amber-200/12 bg-amber-200/5 p-3"><p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.16em] hw-gold-text"><Brain size={13}/>Coach strategy</p><p className="mt-1 text-sm font-black capitalize text-white">{advice.action}</p><p className="mt-1 text-[11px] leading-5 text-white/55">{advice.reason}</p></div>}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {can('hit')&&<TactilePressable onClick={()=>apply({type:'hit'})} className="hw-blackjack-action rounded-2xl px-3 py-3.5 font-black text-white">Hit</TactilePressable>}
          {can('stand')&&<TactilePressable onClick={()=>apply({type:'stand'})} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-3 py-3.5 font-black text-[hsl(var(--hw-navy))]">Stand</TactilePressable>}
          {can('double')&&<TactilePressable onClick={()=>apply({type:'double'})} className="hw-blackjack-action rounded-2xl px-3 py-3.5 font-black text-white">Double</TactilePressable>}
          {can('split')&&<TactilePressable onClick={()=>apply({type:'split'})} className="hw-blackjack-action rounded-2xl px-3 py-3.5 font-black text-white">Split</TactilePressable>}
        </div>
        <button type="button" onClick={()=>setShowAdvice(v=>!v)} className="mt-3 min-h-[44px] w-full text-[10px] font-bold text-white/45">{showAdvice?'Hide':'Show'} strategy Advice</button>
      </GlassSurface>}

      {state.phase==='result' && <GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-4 text-center">
        <Sparkles size={28} className="mx-auto hw-gold-text"/><p className="mt-2 text-[10px] font-black uppercase tracking-[.17em] hw-gold-text">Round complete</p><h3 className="mt-1 font-heading text-2xl font-black text-white">{state.hands.map(hand=>resultLabel(hand.result)).join(' · ')}</h3><p className="mt-2 text-xs text-white/52">Bankroll {state.bankroll} · Shoe {state.shoe.length} cards remaining</p>
        {state.insurance.result && state.insurance.result!=='declined' && <p className="mt-1 text-xs text-white/45">Insurance: {state.insurance.result} {state.insurance.payout?`· returned ${state.insurance.payout}`:''}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2"><TactilePressable onClick={()=>apply({type:'new-round'})} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3 font-black text-[hsl(var(--hw-navy))]">New Round</TactilePressable><TactilePressable onClick={newMatch} className="rounded-2xl bg-white/7 px-4 py-3 font-black text-white shadow-none"><RotateCcw size={15} className="mr-1 inline"/>New Match</TactilePressable></div>
      </GlassSurface>}

      <div className="mt-3 flex items-center justify-between gap-3 px-1 text-[10px] text-white/38"><span className="flex items-center gap-1"><Info size={11}/>Dealer stands soft 17</span><span>Blackjack 3:2 · Insurance 2:1</span></div>
    </div>
  </GameShell>;
}
