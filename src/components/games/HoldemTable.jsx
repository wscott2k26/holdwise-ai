import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Bot, CircleDollarSign, Crown, RotateCcw, Sparkles } from 'lucide-react';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PlayingCard from '@/components/PlayingCard';
import { texasHoldemEngine, runBotsUntilHumanTurn, startNextHand } from '@/games/engines/texasHoldem';
import { recordGameResult } from '@/lib/cardAcademyProgress';
import './holdem.css';

const DEFAULT_SEED = 20260815;

function potOf(state) {
  return state.players.reduce((sum, player) => sum + player.contribution, 0);
}

function bootMatch(seed = DEFAULT_SEED) {
  return runBotsUntilHumanTurn(texasHoldemEngine.createGame({ seed, startingStack:1000, smallBlind:10, bigBlind:20, humanSeat:0 }), { maxActions:160 });
}

function compactCard(card) {
  if (!card) return null;
  const red = card.colorCategory === 'red';
  return <span key={card.id} className={`inline-flex h-8 min-w-6 items-center justify-center rounded-md bg-white px-1 text-[10px] font-black shadow ${red ? 'text-red-600' : 'text-slate-950'}`}>{card.displaySymbol}{card.suitSymbol}</span>;
}

function Seat({ state, seat, position }) {
  const player = state.players[seat];
  const active = state.actor === seat;
  const isDealer = state.dealer === seat;
  const showCards = state.handComplete && state.street === 'showdown' && !player.folded;
  return (
    <motion.div
      layout
      className={`absolute z-20 min-w-[92px] rounded-2xl border border-white/10 bg-[#031613]/88 px-2.5 py-2 text-center shadow-xl backdrop-blur-md ${active ? 'hw-holdem-seat-active' : ''} ${position}`}
      animate={active ? { scale:1.035 } : { scale:1 }}
      transition={{ type:'spring', stiffness:330, damping:26 }}
    >
      <div className="flex items-center justify-center gap-1 text-[10px] font-black text-white/85">{player.isHuman ? 'YOU' : <><Bot size={11}/>P{seat+1}</>}{isDealer && <span className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white text-[8px] font-black text-black">D</span>}</div>
      <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-bold hw-gold-text"><CircleDollarSign size={11}/>{player.stack}</div>
      {player.bet > 0 && <div className="mt-1 text-[9px] font-bold text-emerald-200">Bet {player.bet}</div>}
      {player.folded && <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-red-300/75">Folded</div>}
      {player.allIn && !player.folded && <div className="mt-1 text-[9px] font-black uppercase tracking-wider text-amber-200">All in</div>}
      {!player.isHuman && !player.folded && <div className="mt-1 flex justify-center gap-1">{showCards ? player.hole.map(compactCard) : <><span className="h-7 w-5 rounded hw-card-back"/><span className="h-7 w-5 rounded hw-card-back"/></>}</div>}
    </motion.div>
  );
}

export default function HoldemTable({ game }) {
  const [state, setState] = useState(() => bootMatch());
  const humanSeat = state.config.humanSeat;
  const legal = useMemo(() => texasHoldemEngine.legalActions(state, humanSeat), [state, humanSeat]);
  const sizeAction = legal.find(action => action.type === 'raise') || legal.find(action => action.type === 'bet');
  const [betTo, setBetTo] = useState(sizeAction?.minTo || state.config.bigBlind);
  const pot = potOf(state);

  useEffect(() => {
    if (sizeAction) setBetTo(sizeAction.minTo);
  }, [state.handNumber, state.street, state.actor, state.currentBet, sizeAction?.minTo, sizeAction?.maxTo]);

  function finishAndSet(previous, next) {
    if (!previous.handComplete && next.handComplete) {
      recordGameResult('texas-holdem', { family:'poker', won:next.winners.includes(humanSeat), xp:next.winners.includes(humanSeat) ? 20 : 8 });
    }
    setState(next);
  }

  function act(action) {
    const previous = state;
    let next = texasHoldemEngine.applyAction(state, { ...action, actor:humanSeat });
    if (!next.handComplete && !next.matchComplete) next = runBotsUntilHumanTurn(next, { maxActions:160 });
    finishAndSet(previous, next);
  }

  function nextHand() {
    let next = startNextHand(state);
    if (!next.handComplete && !next.matchComplete) next = runBotsUntilHumanTurn(next, { maxActions:160 });
    setState(next);
  }

  function newMatch() {
    setState(bootMatch(state.config.seed + 100003));
  }

  function clampTarget(value) {
    if (!sizeAction) return 0;
    return Math.max(sizeAction.minTo, Math.min(sizeAction.maxTo, Math.round(value)));
  }

  function preset(fraction) {
    if (!sizeAction) return;
    const callAmount = Math.max(0, state.currentBet - state.players[humanSeat].bet);
    const base = sizeAction.type === 'bet' ? Math.max(state.config.bigBlind, pot * fraction) : state.currentBet + Math.max(state.minRaise, (pot + callAmount) * fraction);
    setBetTo(clampTarget(base));
  }

  const fold = legal.find(action => action.type === 'fold');
  const check = legal.find(action => action.type === 'check');
  const call = legal.find(action => action.type === 'call');
  const allIn = legal.find(action => action.type === 'all-in');
  const coachContext = { game:'Texas Hold’em', street:state.street, facts:texasHoldemEngine.coachFacts(state, humanSeat) };

  const winnerText = state.winners.length ? state.winners.map(seat => state.players[seat].isHuman ? 'You' : `Player ${seat+1}`).join(' + ') : '';

  return (
    <GameShell game={game} coachContext={coachContext}>
      <div className="mx-auto max-w-3xl">
        <div className="mb-2 grid grid-cols-3 gap-2 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">
          <GlassSurface strength={2} className="rounded-xl px-2 py-2">Hand <span className="ml-1 text-white">#{state.handNumber}</span></GlassSurface>
          <GlassSurface strength={2} className="rounded-xl px-2 py-2">Street <span className="ml-1 hw-gold-text">{state.street}</span></GlassSurface>
          <GlassSurface strength={2} className="rounded-xl px-2 py-2">Blinds <span className="ml-1 text-white">{state.config.smallBlind}/{state.config.bigBlind}</span></GlassSurface>
        </div>

        <section className="hw-holdem-felt relative h-[480px] overflow-hidden rounded-[3.4rem] px-2 py-3 sm:h-[530px] sm:rounded-[5rem]">
          <Seat state={state} seat={2} position="left-1/2 top-3 -translate-x-1/2" />
          <Seat state={state} seat={1} position="left-2 top-[38%] -translate-y-1/2" />
          <Seat state={state} seat={3} position="right-2 top-[38%] -translate-y-1/2" />
          <Seat state={state} seat={0} position="bottom-3 left-1/2 -translate-x-1/2" />

          <div className="absolute left-1/2 top-[42%] z-10 w-full -translate-x-1/2 -translate-y-1/2 px-2 text-center">
            <motion.div key={`${state.handNumber}-${state.street}-${pot}`} initial={{opacity:.4,scale:.96}} animate={{opacity:1,scale:1}} className="mx-auto mb-2 inline-flex items-center gap-1.5 rounded-full border border-amber-200/15 bg-black/35 px-3 py-1.5 text-xs font-black text-amber-100 backdrop-blur-md">
              <span className="hw-holdem-chip inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[9px]">$</span> POT {pot}
            </motion.div>
            <div className="flex min-h-[96px] items-center justify-center gap-1 sm:gap-2">
              {state.community.map((card,index) => <motion.div key={card.id} initial={{opacity:0,y:-18,rotateY:90}} animate={{opacity:1,y:0,rotateY:0}} transition={{delay:index*.055}}><PlayingCard card={card} /></motion.div>)}
              {Array.from({length:5-state.community.length},(_,index)=><div key={`slot-${index}`} className="h-24 w-16 rounded-xl border border-dashed border-white/10 bg-black/5 sm:h-28 sm:w-20" />)}
            </div>
            <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/45">{state.street === 'preflop' ? 'Waiting for the flop' : state.street === 'showdown' ? 'Showdown' : `${state.street} betting`}</div>
          </div>

          <div className="absolute bottom-[92px] left-1/2 z-20 -translate-x-1/2">
            <div className="flex justify-center gap-2">{state.players[humanSeat].hole.map(card => <PlayingCard key={card.id} card={card} size="lg" />)}</div>
          </div>
        </section>

        {!state.handComplete && state.actor === humanSeat && <GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-3">
          {sizeAction && <div className="mb-3 rounded-2xl border border-white/8 bg-black/15 p-3">
            <div className="flex items-center justify-between text-xs"><span className="font-bold text-white/65">{sizeAction.type === 'raise' ? 'Raise to' : 'Bet'} <strong className="ml-1 hw-gold-text">{betTo}</strong></span><span className="text-white/40">max {sizeAction.maxTo}</span></div>
            <input type="range" min={sizeAction.minTo} max={sizeAction.maxTo} step={Math.max(1,state.config.smallBlind)} value={betTo} onChange={event=>setBetTo(clampTarget(Number(event.target.value)))} className="mt-2 h-9 w-full accent-amber-300" aria-label={`${sizeAction.type} size`} />
            <div className="grid grid-cols-3 gap-2"><TactilePressable onClick={()=>preset(.5)} className="rounded-xl bg-white/5 py-2 text-[11px] font-bold text-white shadow-none">½ Pot</TactilePressable><TactilePressable onClick={()=>preset(1)} className="rounded-xl bg-white/5 py-2 text-[11px] font-bold text-white shadow-none">Pot</TactilePressable><TactilePressable onClick={()=>setBetTo(sizeAction.maxTo)} className="rounded-xl bg-white/5 py-2 text-[11px] font-bold text-white shadow-none">Max</TactilePressable></div>
          </div>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {fold && <TactilePressable onClick={()=>act(fold)} className="hw-holdem-action-danger rounded-2xl px-3 py-3.5 font-black text-white">Fold</TactilePressable>}
            {check && <TactilePressable onClick={()=>act(check)} className="rounded-2xl bg-white/8 px-3 py-3.5 font-black text-white shadow-none">Check</TactilePressable>}
            {call && <TactilePressable onClick={()=>act(call)} className="rounded-2xl bg-white/8 px-3 py-3.5 font-black text-white shadow-none">Call {call.amount}</TactilePressable>}
            {sizeAction && <TactilePressable onClick={()=>act({type:sizeAction.type,to:betTo})} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-3 py-3.5 font-black text-[hsl(var(--hw-navy))]">{sizeAction.type === 'raise' ? 'Raise' : 'Bet'} {betTo}</TactilePressable>}
            {allIn && <TactilePressable onClick={()=>act(allIn)} className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-3 py-3.5 font-black text-amber-100 shadow-none">All In</TactilePressable>}
          </div>
        </GlassSurface>}

        {!state.handComplete && state.actor !== humanSeat && <GlassSurface strength={2} className="mt-3 rounded-2xl p-3 text-center text-sm text-white/60"><Sparkles size={15} className="mr-1 inline hw-gold-text"/>Coach is watching the table while the bots act…</GlassSurface>}

        {state.handComplete && <GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-4 text-center">
          <Crown size={32} className="mx-auto hw-gold-text"/>
          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] hw-gold-text">Hand complete</p>
          <h3 className="mt-1 font-heading text-2xl font-black text-white">{winnerText || 'Pot settled'}</h3>
          <p className="mt-2 text-xs text-white/55">{state.lastResult?.type === 'showdown' ? `${state.potResults.length} pot${state.potResults.length===1?'':'s'} settled with exact best-five hand comparison.` : 'The table folded down and the remaining player collected the pot.'}</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {!state.matchComplete && <TactilePressable onClick={nextHand} soundType="deal" className="rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3 font-black text-[hsl(var(--hw-navy))]">New Hand</TactilePressable>}
            <TactilePressable onClick={newMatch} className="rounded-2xl bg-white/7 px-4 py-3 font-black text-white shadow-none"><RotateCcw size={16} className="mr-1 inline"/>New Match</TactilePressable>
          </div>
        </GlassSurface>}
      </div>
    </GameShell>
  );
}
