import React, { useMemo, useState } from 'react';
import { Bot, Crown, Hand, RotateCcw, Sparkles } from 'lucide-react';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PlayingCard from '@/components/PlayingCard';
import { spadesEngine, chooseSpadesBotBid, chooseSpadesBotCard, startNextSpadesRound } from '@/games/engines/spades';
import { heartsEngine, chooseHeartsBotPass, chooseHeartsBotCard, startNextHeartsRound } from '@/games/engines/hearts';
import { recordGameResult } from '@/lib/cardAcademyProgress';
import './trickTable.css';

export const TRICK_GAME_IDS=['spades','hearts'];
const HUMAN=0;

function driveSpades(input){
  let state=structuredClone(input),guard=0;
  while(!state.roundComplete&&!state.matchComplete&&state.actor!==HUMAN&&guard++<120){
    if(state.phase==='bidding')state=spadesEngine.applyAction(state,{type:'bid',actor:state.actor,bid:chooseSpadesBotBid(state,state.actor)});
    else if(state.phase==='playing')state=spadesEngine.applyAction(state,chooseSpadesBotCard(state,state.actor));
    else break;
  }
  if(guard>=120)throw new Error('Spades bot guard exceeded');
  return state;
}
function prepareHeartsPassing(input){
  let state=structuredClone(input);
  if(state.phase!=='passing')return state;
  for(let seat=1;seat<4;seat+=1){if(!state.passes[seat])state=heartsEngine.applyAction(state,{type:'pass',actor:seat,cardIds:chooseHeartsBotPass(state,seat)});}
  return state;
}
function driveHearts(input){
  let state=prepareHeartsPassing(input),guard=0;
  while(state.phase==='playing'&&!state.roundComplete&&!state.matchComplete&&state.actor!==HUMAN&&guard++<120)state=heartsEngine.applyAction(state,chooseHeartsBotCard(state,state.actor));
  if(guard>=120)throw new Error('Hearts bot guard exceeded');
  return state;
}
function fresh(id,seed=20260815){return id==='spades'?driveSpades(spadesEngine.createGame({seed,humanSeat:HUMAN,targetScore:500})):driveHearts(heartsEngine.createGame({seed,humanSeat:HUMAN,targetScore:100}));}

function Seat({state,seat,id,position}){
  const player=state.players[seat],active=state.actor===seat;
  const score=id==='spades'?state.scores[seat%2]:state.scores[seat];
  const secondary=id==='spades'?(state.bids[seat]===null?'Bid —':state.nil[seat]?'NIL':`Bid ${state.bids[seat]} · ${player.tricks}`):`Round ${state.roundPoints[seat]}`;
  return <div className={`hw-trick-seat absolute z-20 min-w-[90px] rounded-2xl px-2.5 py-2 text-center ${position} ${active?'hw-trick-seat-active':''}`}><div className="flex items-center justify-center gap-1 text-[10px] font-black text-white/85">{seat===HUMAN?'YOU':<><Bot size={11}/>P{seat+1}</>}</div><div className="mt-1 text-[11px] font-black hw-trick-gold">{score}</div><div className="mt-1 text-[9px] font-bold text-white/48">{secondary}</div>{seat!==HUMAN&&<div className="mt-1 flex justify-center -space-x-2">{Array.from({length:Math.min(4,player.hand.length)},(_,index)=><span key={index} className="h-6 w-4 rounded border border-white/10 hw-card-back"/>)}</div>}</div>;
}
function TrickCenter({state}){return <div className="hw-trick-center absolute left-1/2 top-[43%] z-10 h-[190px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-[210px] sm:w-[260px]">{state.trick.map(play=>{const positions={0:'bottom-1 left-1/2 -translate-x-1/2',1:'left-2 top-1/2 -translate-y-1/2',2:'top-1 left-1/2 -translate-x-1/2',3:'right-2 top-1/2 -translate-y-1/2'};return <div key={`${play.seat}-${play.card.id}`} className={`absolute ${positions[play.seat]}`}><PlayingCard card={play.card}/></div>})}<div className="absolute inset-0 flex items-center justify-center text-center"><div className="rounded-full border border-white/7 bg-black/25 px-3 py-1.5 backdrop-blur-md"><p className="text-[8px] font-black uppercase tracking-[.15em] text-white/35">Trick</p><p className="text-xs font-black hw-trick-gold">{Math.min(13,state.trickNumber+1)} / 13</p></div></div></div>}

export default function TrickTable({game}){
  const id=TRICK_GAME_IDS.includes(game?.id)?game.id:'spades';
  const engine=id==='spades'?spadesEngine:heartsEngine;
  const [seed,setSeed]=useState(20260815);
  const [state,setState]=useState(()=>fresh(id));
  const [bid,setBid]=useState(3);
  const [passSelection,setPassSelection]=useState([]);
  const legal=useMemo(()=>engine.legalActions(state,HUMAN),[engine,state]);
  const human=state.players[HUMAN];

  React.useEffect(()=>{setState(fresh(id,seed));setPassSelection([]);setBid(3);},[id]);

  function recordIfRoundDone(previous,next){
    if(!previous.roundComplete&&next.roundComplete){
      const won=id==='spades'?(next.roundScores[0]>=next.roundScores[1]):(next.roundPoints[HUMAN]===Math.min(...next.roundPoints));
      recordGameResult(id,{family:'classics',won,xp:won?20:8});
    }
  }
  function commit(action){const previous=state;let next=engine.applyAction(state,action);next=id==='spades'?driveSpades(next):driveHearts(next);recordIfRoundDone(previous,next);setState(next);}
  function submitPass(){if(passSelection.length!==3)return;let next=heartsEngine.applyAction(state,{type:'pass',actor:HUMAN,cardIds:passSelection});next=driveHearts(next);setPassSelection([]);setState(next);}
  function nextRound(){let next=id==='spades'?startNextSpadesRound(state):startNextHeartsRound(state);next=id==='spades'?driveSpades(next):driveHearts(next);setState(next);setPassSelection([]);}
  function newMatch(){const nextSeed=seed+99991;setSeed(nextSeed);setState(fresh(id,nextSeed));setPassSelection([]);}
  function togglePass(cardId){setPassSelection(current=>current.includes(cardId)?current.filter(id=>id!==cardId):current.length<3?[...current,cardId]:current);}

  const coachFacts=engine.coachFacts(state,HUMAN);
  const teamLabel=id==='spades'?`Us ${state.scores[0]} · Them ${state.scores[1]}`:`Score ${state.scores[HUMAN]}`;
  const roundSummary=state.roundComplete?(id==='spades'?`Round ${state.roundScores[0]>=0?'+':''}${state.roundScores[0]} · Bags ${state.bags[0]}/10`:state.shotMoon!==null?`Player ${state.shotMoon+1} shot the moon`:`You took ${state.roundPoints[HUMAN]} points`):'';

  return <GameShell game={game} coachContext={{game:game.title,facts:coachFacts}}><div className="mx-auto max-w-3xl"><div className="mb-2 grid grid-cols-3 gap-2 text-center"><GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Match</p><p className="mt-1 text-sm font-black text-white">{teamLabel}</p></GlassSurface><GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Round</p><p className="mt-1 text-sm font-black hw-trick-gold">{state.roundNumber}</p></GlassSurface><GlassSurface strength={2} className="rounded-xl p-2"><p className="text-[8px] uppercase tracking-[.15em] text-white/40">Phase</p><p className="mt-1 text-sm font-black text-white capitalize">{state.phase}</p></GlassSurface></div>

    <section className="hw-trick-table relative h-[510px] rounded-[3.4rem] p-3 sm:h-[550px] sm:rounded-[5rem]"><Seat state={state} seat={2} id={id} position="left-1/2 top-3 -translate-x-1/2"/><Seat state={state} seat={1} id={id} position="left-2 top-[39%] -translate-y-1/2"/><Seat state={state} seat={3} id={id} position="right-2 top-[39%] -translate-y-1/2"/><Seat state={state} seat={0} id={id} position="bottom-3 left-1/2 -translate-x-1/2"/><TrickCenter state={state}/><div className="absolute bottom-[88px] left-1/2 z-20 w-[96%] -translate-x-1/2 overflow-x-auto pb-3"><div className="flex min-w-max justify-center -space-x-7 px-7 sm:-space-x-5">{human.hand.map(card=>{const playable=legal.some(action=>action.cardId===card.id);const selected=passSelection.includes(card.id);return <div key={card.id} className={`transition-transform ${selected?'-translate-y-3':''} ${state.phase==='playing'&&!playable?'opacity-55':''}`}><PlayingCard card={card} selected={selected||playable} onClick={state.phase==='passing'?()=>togglePass(card.id):playable?()=>commit({type:'play',actor:HUMAN,cardId:card.id}):undefined}/></div>})}</div></div></section>

    {id==='spades'&&state.phase==='bidding'&&state.actor===HUMAN&&<GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-3"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.16em] hw-trick-gold">Bid your hand</p><p className="mt-1 text-xs text-white/55">Promise tricks with your partner. Nil means you personally take zero.</p></div><span className="hw-trick-score-chip rounded-full px-3 py-1.5 text-sm font-black">{bid===0?'NIL':bid}</span></div><input type="range" min="0" max="13" value={bid} onChange={event=>setBid(Number(event.target.value))} className="mt-2 h-9 w-full accent-amber-300" aria-label="Spades bid"/><div className="grid grid-cols-2 gap-2"><TactilePressable onClick={()=>setBid(0)} className="rounded-xl bg-white/6 py-2.5 text-sm font-black text-white shadow-none">Nil</TactilePressable><TactilePressable onClick={()=>commit({type:'bid',actor:HUMAN,bid})} className="rounded-xl bg-[hsl(var(--hw-gold))] py-2.5 text-sm font-black text-[hsl(var(--hw-navy))]">Bid {bid}</TactilePressable></div></GlassSurface>}

    {id==='hearts'&&state.phase==='passing'&&<GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-3"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.16em] hw-trick-gold">Pass 3 · {state.passDirection}</p><p className="mt-1 text-xs text-white/55">Tap exactly three cards above, then send them together.</p></div><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm font-black text-white">{passSelection.length}/3</span></div><TactilePressable disabled={passSelection.length!==3} onClick={submitPass} className="mt-3 w-full rounded-xl bg-[hsl(var(--hw-gold))] py-3 text-sm font-black text-[hsl(var(--hw-navy))]">Pass 3</TactilePressable></GlassSurface>}

    {state.phase==='playing'&&state.actor===HUMAN&&<GlassSurface strength={3} className="mt-3 rounded-2xl p-3 text-center"><p className="text-[9px] font-black uppercase tracking-[.16em] hw-trick-gold">Your turn</p><p className="mt-1 text-sm font-bold text-white">{legal.length} legal card{legal.length===1?'':'s'} highlighted</p></GlassSurface>}
    {state.roundComplete&&<GlassSurface strength={4} goldEdge className="mt-3 rounded-[1.6rem] p-5 text-center"><Crown size={35} className="mx-auto hw-trick-gold"/><p className="mt-2 text-[9px] font-black uppercase tracking-[.17em] hw-trick-gold">Round complete</p><h3 className="mt-1 font-heading text-2xl font-black text-white">{roundSummary}</h3><p className="mt-2 text-xs text-white/50">{state.matchComplete?'Match complete. Final scores are locked.':'Scores persist into the next full 13-trick round.'}</p><div className="mt-4 grid grid-cols-2 gap-2">{!state.matchComplete&&<TactilePressable onClick={nextRound} className="rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3 font-black text-[hsl(var(--hw-navy))]">New Round</TactilePressable>}<TactilePressable onClick={newMatch} className="rounded-2xl bg-white/7 px-4 py-3 font-black text-white shadow-none"><RotateCcw size={15} className="mr-1 inline"/>New Match</TactilePressable></div></GlassSurface>}
    <p className="mt-2 text-center text-[10px] text-white/35"><Sparkles size={11} className="mr-1 inline hw-trick-gold"/>{id==='spades'?'Partnership bids · Nil · bags · 500-point match':'Pass cycle · Q♠ 13 · Hearts 1 · Shoot the Moon'}</p>
  </div></GameShell>;
}
