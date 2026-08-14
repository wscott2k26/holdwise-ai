import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Play, Calendar, Spade, GraduationCap, Lightbulb, ChevronRight, AlertCircle, Flame, Target, CheckCircle2, Award } from "lucide-react";
import { useApp } from "@/lib/appContext";
import { allLessonsFlat } from "@/lib/lessons";
import { completionCount } from "@/lib/progress";
import { loadPracticeStats } from "@/lib/practiceStats";
import { buildMasterySnapshot } from "@/lib/mastery";
import { loadMistakes } from "@/lib/mistakes";
import { loadDailyChallengeRecord } from "@/lib/dailyChallenge";
import { buildDailyMissionSnapshot } from "@/lib/dailyMissions";
import { useEntitlement } from "@/lib/billing";
import GlassSurface from "@/components/premium/GlassSurface";
import TactilePressable from "@/components/premium/TactilePressable";
import MasteryMeter from "@/components/premium/MasteryMeter";
import ScreenReveal, { RevealItem } from "@/components/premium/ScreenReveal";

const CARD_FACTS = [
  "A standard deck has 52 cards because 13 ranks times 4 suits equals 52.",
  "The Ace is the only card that can be both the highest and the lowest card in a straight.",
  "A royal flush is the rarest made hand — 10, Jack, Queen, King, and Ace of the same suit.",
  "Hearts and Diamonds are red; Clubs and Spades are black. Always check the suit symbol, not just the color.",
  "In Jacks or Better, only a pair of Jacks or higher pays — a pair of 10s does not.",
];

export default function Home() {
  const { profile, bumpStreak } = useApp();
  const { isPremium } = useEntitlement();
  const navigate = useNavigate();
  const [fact] = React.useState(() => CARD_FACTS[new Date().getDate() % CARD_FACTS.length]);

  React.useEffect(() => {
    bumpStreak();
  }, []);

  const lessons = allLessonsFlat();
  const nextLesson = lessons[0];
  const lessonsDone = completionCount();
  const practice = useMemo(() => loadPracticeStats(), []);
  const mistakes = useMemo(() => loadMistakes(), []);
  const dailyChallenge = useMemo(() => loadDailyChallengeRecord(new Date()), []);
  const missions = useMemo(
    () => buildDailyMissionSnapshot({ date: new Date(), practice, challenge: dailyChallenge }),
    [practice, dailyChallenge]
  );
  const mastery = useMemo(
    () => buildMasterySnapshot({ profile, practice, mistakes, lessonsDone }),
    [profile, practice, mistakes, lessonsDone]
  );
  const lessonProgress = lessons.length ? Math.min(100, Math.round((lessonsDone / lessons.length) * 100)) : 0;

  return (
    <div className="mx-auto max-w-2xl px-5 pb-4 pt-7">
      <ScreenReveal>
        <RevealItem order={0}>
          <header className="mb-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] hw-gold-text">Private Card Academy</p>
              <h1 className="mt-1 font-heading text-3xl font-bold sm:text-4xl">{profile.displayName === "Guest" ? "Ready for a cleaner decision?" : `Welcome back, ${profile.displayName}`}</h1>
            </div>
            <GlassSurface strength={2} goldEdge className="flex min-h-[44px] items-center gap-1.5 rounded-full px-3 text-xs text-muted-foreground">
              <Flame size={14} className="hw-gold-text" /> {profile.streak} day streak
            </GlassSurface>
          </header>
        </RevealItem>

        <RevealItem order={1} className="mb-4">
          <TactilePressable onClick={() => navigate(`/learn/lesson/${nextLesson.id}`)} className="w-full rounded-3xl bg-transparent p-0 text-left shadow-none">
            <GlassSurface strength={4} variant="interactive" goldEdge className="relative overflow-hidden rounded-3xl p-5 sm:p-6">
              <div aria-hidden="true" className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-[hsl(var(--hw-victory-gold)/.1)] blur-3xl" />
              <div className="relative flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.18em] hw-gold-text">Continue Learning</span>
                <Play size={17} className="hw-gold-text" />
              </div>
              <h2 className="relative mt-2 font-heading text-xl font-bold">{nextLesson.unitTitle}</h2>
              <p className="relative text-sm text-muted-foreground">{nextLesson.title}</p>
              <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--hw-champagne)),hsl(var(--hw-victory-gold)))] transition-[width] duration-500" style={{ width: `${lessonProgress}%` }} />
              </div>
              <p className="relative mt-1.5 text-[11px] text-muted-foreground">Course progress {lessonProgress}%</p>
            </GlassSurface>
          </TactilePressable>
        </RevealItem>

        <RevealItem order={2} className="mb-4">
          <TactilePressable onClick={() => navigate("/practice/video-poker")} className="hw-lux-button w-full rounded-2xl px-5 py-4 text-left font-semibold">
            <span className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-3"><Spade size={20} /> <span><span className="block">Practice a Hand</span><span className="block text-xs font-medium opacity-75">Exact strategy • glass table • Coach Ace</span></span></span>
              <ChevronRight size={18} />
            </span>
          </TactilePressable>
        </RevealItem>

        <RevealItem order={3} className="mb-4">
          <MasteryMeter value={mastery.masteryPct} interpretation={`${mastery.accuracyPct}% decision accuracy`} streak={mastery.streakDays} focus={mastery.recommendedFocus} />
          <div className="mt-2 grid grid-cols-3 gap-2 text-center">
            <GlassSurface strength={1} className="rounded-xl px-2 py-2.5"><p className="font-heading text-lg font-bold">{mastery.accuracyPct}%</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Accuracy</p></GlassSurface>
            <GlassSurface strength={1} className="rounded-xl px-2 py-2.5"><p className="font-heading text-lg font-bold">{mastery.streakDays}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Streak</p></GlassSurface>
            <GlassSurface strength={1} className="rounded-xl px-2 py-2.5"><p className="font-heading text-lg font-bold">{mastery.reviewCount}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Saved hands</p></GlassSurface>
          </div>
        </RevealItem>

        <RevealItem order={3} className="mb-4">
          <GlassSurface strength={4} goldEdge className="rounded-3xl p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] hw-gold-text">Academy Missions</p>
                <p className="font-heading text-xl font-bold">Today’s learning run</p>
              </div>
              <div className="text-right"><p className="font-heading text-2xl font-bold hw-gold-text">{missions.completed}/{missions.total}</p><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Complete</p></div>
            </div>
            <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[linear-gradient(90deg,hsl(var(--hw-emerald)),hsl(var(--hw-victory-gold)))] transition-[width] duration-500" style={{ width: `${missions.percent}%` }} />
            </div>
            <div className="space-y-2">
              {missions.missions.map((mission) => (
                <TactilePressable key={mission.id} onClick={() => navigate(mission.route)} className="w-full rounded-2xl bg-transparent p-0 text-left shadow-none">
                  <GlassSurface strength={mission.complete ? 3 : 1} variant="interactive" className="flex min-h-[62px] items-center gap-3 rounded-2xl px-3.5 py-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${mission.complete ? "hw-lux-button" : "hw-glass-2 hw-gold-border"}`}>
                      {mission.complete ? <CheckCircle2 size={18} /> : <Target size={18} className="hw-gold-text" />}
                    </div>
                    <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{mission.title}</p><p className="text-xs text-muted-foreground">{mission.detail}</p></div>
                    <ChevronRight size={17} className="shrink-0 text-muted-foreground" />
                  </GlassSurface>
                </TactilePressable>
              ))}
            </div>
          </GlassSurface>
        </RevealItem>

        <RevealItem order={3} className="space-y-3">
          <TactilePressable onClick={() => navigate("/achievements")} className="w-full rounded-2xl bg-transparent p-0 text-left shadow-none">
            <GlassSurface strength={2} variant="interactive" goldEdge className="flex min-h-[64px] items-center gap-3 rounded-2xl p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl hw-glass-2 hw-gold-border"><Award size={18} className="hw-gold-text" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Badge Case</p><p className="text-xs text-muted-foreground">Collect milestones for skill, streaks, and study</p></div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </GlassSurface>
          </TactilePressable>

          <TactilePressable onClick={() => navigate("/daily-challenge")} className="w-full rounded-2xl bg-transparent p-0 text-left shadow-none">
            <GlassSurface strength={2} variant="interactive" className="flex min-h-[64px] items-center gap-3 rounded-2xl p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl hw-glass-2 hw-gold-border"><Calendar size={18} className="hw-gold-text" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Today’s five-minute challenge</p><p className="text-xs text-muted-foreground">{dailyChallenge ? `Completed • ${dailyChallenge.score}/${dailyChallenge.total} correct` : "Identify five poker hands"}</p></div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </GlassSurface>
          </TactilePressable>

          <TactilePressable onClick={() => navigate("/mistakes")} className="w-full rounded-2xl bg-transparent p-0 text-left shadow-none">
            <GlassSurface strength={2} variant="interactive" className="flex min-h-[64px] items-center gap-3 rounded-2xl p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl hw-glass-1"><AlertCircle size={18} className="text-muted-foreground" /></div>
              <div className="flex-1"><p className="text-sm font-semibold">Recent mistakes to review</p><p className="text-xs text-muted-foreground">{isPremium ? `${mastery.reviewCount} saved hand${mastery.reviewCount === 1 ? "" : "s"}` : "Premium feature — see your mistakes"}</p></div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </GlassSurface>
          </TactilePressable>

          <GlassSurface strength={2} className="rounded-2xl p-4">
            <div className="mb-1.5 flex items-center gap-2"><Lightbulb size={16} className="hw-gold-text" /><p className="text-[11px] uppercase tracking-[0.16em] hw-gold-text">Daily Card Fact</p></div>
            <p className="text-sm">{fact}</p>
          </GlassSurface>

          {!isPremium && (
            <TactilePressable onClick={() => navigate("/premium")} className="w-full rounded-2xl bg-transparent p-0 text-left shadow-none">
              <GlassSurface strength={3} goldEdge className="rounded-2xl p-5">
                <div className="mb-1 flex items-center gap-2"><GraduationCap size={18} className="hw-gold-text" /><p className="text-[11px] uppercase tracking-[0.16em] hw-gold-text">Premium Academy</p></div>
                <p className="font-heading text-lg font-bold">Turn every hand into a lesson</p>
                <p className="mt-1 text-xs text-muted-foreground">Unlock every card-game course and unlimited coaching.</p>
              </GlassSurface>
            </TactilePressable>
          )}
        </RevealItem>
      </ScreenReveal>
    </div>
  );
}
