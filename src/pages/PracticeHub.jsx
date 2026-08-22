import React from 'react';
import { ArrowRight, Brain, Crosshair, Layers3, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PremiumBottomNav from '@/components/premium/PremiumBottomNav';
import SensoryControls from '@/components/premium/SensoryControls';

const DRILLS = [
  { game:'blackjack', title:'Blackjack Decisions', body:'Read the dealer up-card, make a legal move and reinforce basic strategy.', Icon:Crosshair },
  { game:'texas-holdem', title:'Hold’em Table Reads', body:'Practice legal betting flow, position awareness and showdown thinking.', Icon:Brain },
  { game:'spades', title:'Trick-Taking Reps', body:'Rehearse bids, following suit, trump timing and partnership discipline.', Icon:Layers3 },
  { game:'gin-rummy', title:'Deadwood & Knock', body:'Work draw/discard decisions and learn when a knock is actually legal.', Icon:Sparkles },
];

export default function PracticeHub(){
  const navigate=useNavigate();
  return <div className="hw-hub-page">
    <main className="mx-auto max-w-5xl px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-3"><div><p className="hw-eyebrow">Practice lab</p><h1 className="hw-page-title">Turn rules into instinct</h1><p className="hw-page-subtitle">Short, repeatable reps use the same real game engines as full play.</p></div><SensoryControls/></div>
      <section className="hw-practice-hero hw-photo-glass-panel"><div><span className="hw-hero-pill"><Brain size={14}/> Coach-guided reps</span><h2>Practice one decision at a time.</h2><p>Use tutorials for guided moves, then jump into the full table when the rule starts feeling automatic.</p></div></section>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">{DRILLS.map(({game,title,body,Icon})=><button key={game} type="button" onClick={()=>navigate(`/game/${game}/tutorial`)} className="hw-practice-card"><Icon/><div><strong>{title}</strong><span>{body}</span></div><ArrowRight/></button>)}</div>
      <button type="button" onClick={()=>navigate('/daily-challenge')} className="hw-wide-action">Daily five-decision challenge <ArrowRight size={18}/></button>
    </main>
    <PremiumBottomNav/>
  </div>;
}
