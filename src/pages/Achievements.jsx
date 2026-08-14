import React, { useMemo } from "react";
import { Award, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { completionCount } from "@/lib/progress";
import { loadPracticeStats } from "@/lib/practiceStats";
import { useApp } from "@/lib/appContext";
import { buildAchievementProgress } from "@/lib/achievementProgress";
import { loadAcademyCompletions } from "@/lib/academyProgress";
import { loadMistakes } from "@/lib/mistakes";
import GlassSurface from "@/components/premium/GlassSurface";
import ScreenReveal, { RevealItem } from "@/components/premium/ScreenReveal";

export default function Achievements() {
  const { profile } = useApp();
  const lessonsDone = completionCount();
  const practice = useMemo(() => loadPracticeStats(), []);
  const mistakes = useMemo(() => loadMistakes(), []);
  const academyCompleted = useMemo(() => loadAcademyCompletions().map((row) => row.gameId), []);
  const cards = useMemo(
    () => buildAchievementProgress({ lessonsDone, practice, profile, mistakes, academyCompleted }),
    [lessonsDone, practice, profile, mistakes, academyCompleted]
  );
  const earnedCount = cards.filter((card) => card.earned).length;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-24 pt-7">
      <ScreenReveal>
        <RevealItem order={0} className="mb-5">
          <div className="mb-1 flex items-center gap-2">
            <Award size={20} className="hw-gold-text" />
            <h1 className="font-heading text-3xl font-bold sm:text-4xl">Badge Case</h1>
          </div>
          <p className="text-sm text-muted-foreground">Skill milestones inspired by premium card-game collections — earned through learning, never spending or wagering.</p>
        </RevealItem>

        <RevealItem order={1} className="mb-4">
          <GlassSurface strength={4} goldEdge className="rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] hw-gold-text">Collection progress</p>
                <p className="mt-1 font-heading text-2xl font-bold">{earnedCount} of {cards.length} badges</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl hw-lux-button"><Sparkles size={20} /></div>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/30">
              <div className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--hw-emerald))] via-[hsl(var(--hw-champagne))] to-[hsl(var(--hw-victory-gold))]" style={{ width: `${Math.round((earnedCount / cards.length) * 100)}%` }} />
            </div>
          </GlassSurface>
        </RevealItem>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {cards.map((card, index) => (
            <RevealItem key={card.id} order={Math.min(index + 2, 6)}>
              <GlassSurface strength={card.earned ? 4 : 2} goldEdge={card.earned} className="h-full rounded-2xl p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className={card.earned ? "flex h-11 w-11 items-center justify-center rounded-xl hw-lux-button" : "flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-black/20"}>
                    {card.earned ? <Award size={20} /> : <Lock size={17} className="text-muted-foreground" />}
                  </div>
                  {card.earned && <span className="flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] hw-gold-text"><CheckCircle2 size={12} /> Earned</span>}
                </div>
                <p className="font-semibold">{card.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{card.desc}</p>
                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[10px] text-muted-foreground"><span>Progress</span><span>{Math.min(card.progress, card.value)}/{card.value}</span></div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-black/30">
                    <div className="h-full rounded-full bg-[hsl(var(--hw-champagne))]" style={{ width: `${card.percent}%` }} />
                  </div>
                </div>
              </GlassSurface>
            </RevealItem>
          ))}
        </div>
      </ScreenReveal>
    </div>
  );
}
