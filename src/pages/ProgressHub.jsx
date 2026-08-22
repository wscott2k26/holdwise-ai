import React, { useMemo } from 'react';
import { Award, BarChart3, Flame, Gamepad2, GraduationCap, Trophy } from 'lucide-react';
import PremiumBottomNav from '@/components/premium/PremiumBottomNav';
import SensoryControls from '@/components/premium/SensoryControls';
import { CARD_ACADEMY_GAMES, getGame } from '@/games/catalog';
import { loadCardAcademyProgress } from '@/lib/cardAcademyProgress';

export default function ProgressHub(){
  const progress=useMemo(()=>loadCardAcademyProgress(),[]);
  const rows=Object.entries(progress.games||{}).map(([id,row])=>({game:getGame(id),...row})).filter(row=>row.game);
  const totalPlays=rows.reduce((sum,row)=>sum+(row.plays||0),0);
  const totalWins=rows.reduce((sum,row)=>sum+(row.wins||0),0);
  const tutorials=rows.filter(row=>row.tutorialComplete).length;
  const winRate=totalPlays?Math.round((totalWins/totalPlays)*100):0;
  const streak=Number(globalThis.localStorage?.getItem?.('holdwise_streak_days')||0);
  const leaders=rows.sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,5);
  return <div className="hw-hub-page">
    <main className="mx-auto max-w-5xl px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
      <div className="mb-5 flex items-end justify-between gap-3"><div><p className="hw-eyebrow">Progress</p><h1 className="hw-page-title">Your card mastery</h1><p className="hw-page-subtitle">Progress comes from real tables, completed tutorials and daily reps.</p></div><SensoryControls/></div>
      <section className="hw-progress-hero hw-photo-glass-panel"><div><span className="hw-hero-pill"><Trophy size={14}/> HoldWise mastery</span><h2>{progress.totalXp||0} XP earned</h2><p>Keep playing across different families to build a broader card-game skill set.</p></div></section>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="hw-stat-card"><Gamepad2/><strong>{totalPlays}</strong><span>games played</span></div>
        <div className="hw-stat-card"><Award/><strong>{winRate}%</strong><span>win rate</span></div>
        <div className="hw-stat-card"><GraduationCap/><strong>{tutorials}/{CARD_ACADEMY_GAMES.length}</strong><span>tutorials</span></div>
        <div className="hw-stat-card"><Flame/><strong>{streak}d</strong><span>streak</span></div>
      </div>
      <section className="mt-6"><div className="hw-section-heading"><div><p className="hw-eyebrow">Top mastery</p><h2>Your strongest tables</h2></div><BarChart3/></div>
        <div className="space-y-3">{leaders.length?leaders.map(row=>{
          const max=Math.max(100,...leaders.map(item=>item.xp||0));
          return <div key={row.game.id} className="hw-mastery-row"><div><strong>{row.game.title}</strong><span>{row.plays||0} plays · {row.wins||0} wins · {row.tutorialComplete?'tutorial complete':'tutorial open'}</span></div><div className="hw-mastery-meter"><i style={{width:`${Math.max(7,Math.round(((row.xp||0)/max)*100))}%`}}/></div><b>{row.xp||0} XP</b></div>;
        }):<div className="hw-empty-state">Play a game or finish a tutorial and your mastery dashboard will light up here.</div>}</div>
      </section>
    </main>
    <PremiumBottomNav/>
  </div>;
}
