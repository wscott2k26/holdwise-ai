import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Flame, Play, Sparkles, Trophy, Zap } from 'lucide-react';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import ScreenReveal, { RevealItem } from '@/components/premium/ScreenReveal';
import GameFamilyTile from '@/components/games/GameFamilyTile';
import { CARD_ACADEMY_FAMILIES, CARD_ACADEMY_GAMES, gamesByFamily, getGame } from '@/games/catalog';
import { loadCardAcademyProgress } from '@/lib/cardAcademyProgress';

const FAMILY_LABELS = { poker:'Poker', casino:'Casino', solitaire:'Solitaire', classics:'Classics', family:'Family' };

function MiniGameCard({ game, onPlay, onTutorial }) {
  return (
    <GlassSurface strength={2} variant="interactive" className={`hw-mini-card min-w-[178px] rounded-2xl p-3 hw-mini-${game.family}`}>
      <p className="text-[9px] font-bold uppercase tracking-[0.16em] hw-royal-text">{FAMILY_LABELS[game.family]}</p>
      <h3 className="mt-1 font-heading text-base font-black text-[hsl(var(--hw-ink))]">{game.title}</h3>
      <p className="mt-1 text-[11px] text-[hsl(var(--hw-ink)/.62)]">{game.complexity} · full play</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <TactilePressable onClick={onPlay} className="hw-primary-action rounded-xl px-3 py-2 text-xs font-black">Play</TactilePressable>
        <TactilePressable onClick={onTutorial} className="hw-secondary-action rounded-xl px-3 py-2 text-xs font-bold">Learn</TactilePressable>
      </div>
    </GlassSurface>
  );
}

export default function CardAcademyLobby() {
  const navigate = useNavigate();
  const progress = useMemo(() => loadCardAcademyProgress(), []);
  const recent = progress.recentGames.map(getGame).filter(Boolean);
  const continueGame = recent[0] || getGame('jacks-or-better');
  const streak = Number(globalThis.localStorage?.getItem?.('holdwise_streak_days') || 0);

  return (
    <ScreenReveal className="min-h-screen px-3 pb-8 pt-[max(1rem,env(safe-area-inset-top))] text-[hsl(var(--hw-ink))]">
      <div className="mx-auto max-w-5xl space-y-4">
        <RevealItem order={0}>
          <GlassSurface strength={4} className="hw-academy-hero relative overflow-hidden rounded-[2rem] p-5 sm:p-6">
            <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-[hsl(var(--hw-lavender)/.38)] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-[hsl(var(--hw-mint)/.38)] blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] hw-royal-text"><Zap size={14} /> Storm And Me presents</div>
                  <h1 className="mt-2 font-heading text-3xl font-black tracking-tight text-[hsl(var(--hw-ink))] sm:text-4xl">HoldWise Card Academy</h1>
                  <p className="mt-2 max-w-2xl text-sm text-[hsl(var(--hw-ink)/.68)]">Twenty-one full card games. Learn the rules, play complete matches, understand the move, then master the table.</p>
                </div>
                <div className="hidden rounded-2xl border border-[hsl(var(--hw-royal)/.16)] bg-[hsl(0_0%_100%/.56)] p-3 text-center sm:block">
                  <p className="text-2xl font-black hw-royal-text">{CARD_ACADEMY_GAMES.length}</p>
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[hsl(var(--hw-ink)/.55)]">full games</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-[1.25fr_.75fr]">
                <TactilePressable onClick={() => navigate(`/game/${continueGame.id}`)} className="hw-primary-action rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <div><p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-70">Continue Learning</p><p className="mt-1 font-heading text-xl font-black">{continueGame.title}</p></div>
                    <Play size={26} fill="currentColor" />
                  </div>
                </TactilePressable>
                <TactilePressable onClick={() => navigate('/daily-challenge')} className="hw-secondary-action rounded-2xl p-4 text-left">
                  <div className="flex items-center justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] hw-royal-text">Daily Challenge</p><p className="mt-1 text-sm font-bold">Five smart decisions</p></div><Trophy size={24} className="hw-sunshine-text" /></div>
                </TactilePressable>
              </div>
            </div>
          </GlassSurface>
        </RevealItem>

        <RevealItem order={1} className="grid grid-cols-3 gap-2">
          <GlassSurface strength={2} className="hw-progress-card hw-progress-xp rounded-2xl p-3"><p className="text-[9px] uppercase tracking-[0.15em] text-[hsl(var(--hw-ink)/.58)]">XP</p><p className="mt-1 text-lg font-black text-[hsl(var(--hw-ink))]">{progress.totalXp || 0}</p></GlassSurface>
          <GlassSurface strength={2} className="hw-progress-card hw-progress-streak rounded-2xl p-3"><p className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-[hsl(var(--hw-ink)/.58)]"><Flame size={11} /> streak</p><p className="mt-1 text-lg font-black text-[hsl(var(--hw-ink))]">{streak}d</p></GlassSurface>
          <GlassSurface strength={2} className="hw-progress-card hw-progress-tutorials rounded-2xl p-3"><p className="flex items-center gap-1 text-[9px] uppercase tracking-[0.15em] text-[hsl(var(--hw-ink)/.58)]"><BookOpen size={11} /> tutorials</p><p className="mt-1 text-lg font-black text-[hsl(var(--hw-ink))]">{Object.values(progress.games).filter(row=>row.tutorialComplete).length}</p></GlassSurface>
        </RevealItem>

        <RevealItem order={2}>
          <div className="mb-2 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] hw-royal-text">Choose your table</p><h2 className="font-heading text-2xl font-black text-[hsl(var(--hw-ink))]">Game families</h2></div><Sparkles size={19} className="hw-sunshine-text" /></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {CARD_ACADEMY_FAMILIES.map(family => <GameFamilyTile key={family} family={family} count={gamesByFamily(family).length} onClick={() => document.getElementById(`family-${family}`)?.scrollIntoView({behavior:'smooth',block:'start'})} />)}
          </div>
        </RevealItem>

        {recent.length > 0 && <RevealItem order={3}><div className="mb-2"><p className="text-[10px] font-black uppercase tracking-[0.18em] hw-royal-text">Recently Played</p><h2 className="font-heading text-xl font-black text-[hsl(var(--hw-ink))]">Jump back in</h2></div><div className="flex gap-3 overflow-x-auto pb-2">{recent.map(game => <MiniGameCard key={game.id} game={game} onPlay={() => navigate(`/game/${game.id}`)} onTutorial={() => navigate(`/game/${game.id}/tutorial`)} />)}</div></RevealItem>}

        {CARD_ACADEMY_FAMILIES.map((family, familyIndex) => (
          <RevealItem order={3 + familyIndex} key={family}>
            <section id={`family-${family}`} className="scroll-mt-4">
              <div className="mb-2 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.18em] hw-royal-text">{FAMILY_LABELS[family]}</p><h2 className="font-heading text-xl font-black text-[hsl(var(--hw-ink))]">{gamesByFamily(family).length} full games</h2></div><span className="text-[10px] text-[hsl(var(--hw-ink)/.55)]">Tutorial included</span></div>
              <div className="flex gap-3 overflow-x-auto pb-2">{gamesByFamily(family).map(game => <MiniGameCard key={game.id} game={game} onPlay={() => navigate(`/game/${game.id}`)} onTutorial={() => navigate(`/game/${game.id}/tutorial`)} />)}</div>
            </section>
          </RevealItem>
        ))}
      </div>
    </ScreenReveal>
  );
}
