import React, { useMemo } from 'react';
import { ArrowRight, BookOpenCheck, Brain, GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PremiumBottomNav from '@/components/premium/PremiumBottomNav';
import SensoryControls from '@/components/premium/SensoryControls';
import { CARD_ACADEMY_GAMES } from '@/games/catalog';
import { loadCardAcademyProgress } from '@/lib/cardAcademyProgress';

export default function LearnHub(){
  const navigate=useNavigate();
  const progress=useMemo(()=>loadCardAcademyProgress(),[]);
  const completeCount=Object.values(progress.games||{}).filter(row=>row.tutorialComplete).length;
  return <div className="hw-hub-page">
    <main className="mx-auto max-w-6xl px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-3"><div><p className="hw-eyebrow">Learn with Coach Ace</p><h1 className="hw-page-title">Master the why behind the move</h1><p className="hw-page-subtitle">Every HoldWise game includes a rules-engine-backed tutorial, common mistakes and guided practice.</p></div><SensoryControls/></div>
      <section className="hw-learn-hero hw-photo-glass-panel"><div><span className="hw-hero-pill"><GraduationCap size={14}/> Card Academy</span><h2>From first hand to confident play.</h2><p>Start with rules and table flow, make a real legal move, then graduate into the full game.</p><div className="hw-learn-progress"><span>{completeCount} of {CARD_ACADEMY_GAMES.length} tutorials complete</span><div><i style={{width:`${Math.round((completeCount/CARD_ACADEMY_GAMES.length)*100)}%`}}/></div></div></div></section>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{CARD_ACADEMY_GAMES.map((game,index)=>{
        const done=Boolean(progress.games?.[game.id]?.tutorialComplete);
        return <button key={game.id} type="button" onClick={()=>navigate(`/game/${game.id}/tutorial`)} className="hw-lesson-card"><span className="hw-lesson-number">{String(index+1).padStart(2,'0')}</span><div><strong>{game.title}</strong><span>{game.complexity} · {done?'Mastery started':'10-step guided tutorial'}</span></div>{done?<Sparkles size={17}/>:<ArrowRight size={17}/>}</button>;
      })}</div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="hw-coach-banner"><Brain/><div><strong>Coach Ace</strong><span>Ask rule questions from inside any full-play table.</span></div></div><div className="hw-coach-banner"><BookOpenCheck/><div><strong>Rule-safe learning</strong><span>Tutorial moves are validated by the same engines used in gameplay.</span></div></div></div>
    </main>
    <PremiumBottomNav/>
  </div>;
}
