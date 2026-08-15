import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ChevronRight, GraduationCap, Sparkles } from 'lucide-react';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import { RevealItem } from '@/components/premium/ScreenReveal';
import { getGame } from '@/games/catalog';
import { getTutorial } from '@/games/tutorials';
import { markTutorialComplete } from '@/lib/cardAcademyProgress';

export default function GameTutorial() {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const game = getGame(gameId);
  const tutorial = useMemo(() => getTutorial(gameId), [gameId]);
  const [index, setIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  if (!game || !tutorial) return <div className="p-6 text-white">Unknown card game.</div>;
  const step = tutorial.steps[index];
  const last = index === tutorial.steps.length - 1;

  function next() {
    if (last) {
      markTutorialComplete(game.id, { family: game.family, xp: 100 });
      setCompleted(true);
      return;
    }
    setIndex(current => Math.min(tutorial.steps.length - 1, current + 1));
  }

  return (
    <GameShell game={game} coachContext={{ game:game.title, tutorialStep:step.title, facts:[step.body] }}>
      <RevealItem order={0}>
        <GlassSurface strength={4} goldEdge className="overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] hw-gold-text"><GraduationCap size={14} /> Full beginner tutorial</p><h2 className="mt-2 font-heading text-2xl font-black text-white">{game.title}</h2><p className="mt-1 text-sm text-white/55">Step {index + 1} of {tutorial.steps.length}</p></div>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] text-white/65">{step.kind}</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[hsl(var(--hw-gold))] transition-[width] duration-300" style={{width:`${((index+1)/tutorial.steps.length)*100}%`}} /></div>
        </GlassSurface>
      </RevealItem>

      <RevealItem order={1} className="mt-4">
        <GlassSurface strength={3} className="rounded-[1.75rem] p-5 sm:p-6">
          {!completed ? <>
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 hw-gold-text"><Sparkles size={22} /></div>
            <h3 className="font-heading text-2xl font-black text-white">{step.title}</h3>
            <p className="mt-3 text-[15px] leading-7 text-white/70">{step.body}</p>
            {(step.kind === 'interactive' || step.kind === 'review') && <div className="mt-5 rounded-2xl border border-emerald-300/15 bg-emerald-300/5 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-200">Coach-guided practice</p><p className="mt-2 text-sm text-white/65">This tutorial stage connects to the live rules engine for this game so only legal choices are accepted. In the full table, Coach Ace highlights the same decision and explains why after you act.</p></div>}
            <div className="mt-6 flex gap-3">
              <TactilePressable disabled={index===0} onClick={() => setIndex(current => Math.max(0,current-1))} className="flex-1 rounded-2xl bg-white/5 px-4 py-3 font-bold text-white shadow-none"><span className="flex items-center justify-center gap-2"><ChevronLeft size={18}/> Back</span></TactilePressable>
              <TactilePressable onClick={next} className="flex-[1.4] rounded-2xl bg-[hsl(var(--hw-gold))] px-4 py-3 font-black text-[hsl(var(--hw-navy))]"><span className="flex items-center justify-center gap-2">{last ? 'Graduate' : 'Continue'} <ChevronRight size={18}/></span></TactilePressable>
            </div>
          </> : <div className="py-8 text-center"><CheckCircle2 size={54} className="mx-auto hw-gold-text"/><h3 className="mt-4 font-heading text-2xl font-black text-white">Tutorial complete</h3><p className="mx-auto mt-2 max-w-md text-sm text-white/65">You earned 100 mastery XP. Now play the complete {game.title} mode with the same rules and Coach Ace available when you want help.</p><TactilePressable onClick={() => navigate(`/game/${game.id}`)} className="mt-6 rounded-2xl bg-[hsl(var(--hw-gold))] px-6 py-3 font-black text-[hsl(var(--hw-navy))]">Play full game</TactilePressable></div>}
        </GlassSurface>
      </RevealItem>
    </GameShell>
  );
}
