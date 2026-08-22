import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Flame, Gamepad2, Sparkles, Target, Trophy } from 'lucide-react';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import SensoryControls from '@/components/premium/SensoryControls';
import PremiumBottomNav from '@/components/premium/PremiumBottomNav';
import { CARD_ACADEMY_GAMES, getGame } from '@/games/catalog';
import { loadCardAcademyProgress } from '@/lib/cardAcademyProgress';

const FEATURED = ['spades', 'blackjack', 'gin-rummy', 'klondike'];

export default function PremiumHome() {
  const navigate = useNavigate();
  const progress = useMemo(() => loadCardAcademyProgress(), []);
  const recent = progress.recentGames.map(getGame).filter(Boolean);
  const continueGame = recent[0] || getGame('spades');
  const completedTutorials = Object.values(progress.games || {}).filter((row) => row.tutorialComplete).length;
  const featured = FEATURED.map(getGame).filter(Boolean);

  return (
    <div className="hw-hub-page hw-home-page">
      <main className="mx-auto w-full max-w-6xl px-4 pb-32 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="hw-eyebrow">Storm And Me presents</p>
            <h1 className="hw-wordmark">HoldWise</h1>
          </div>
          <SensoryControls />
        </div>

        <section className="hw-home-hero hw-photo-glass-panel">
          <div className="relative z-10 max-w-3xl">
            <span className="hw-hero-pill"><Sparkles size={14}/> Play · Learn · Practice · Master</span>
            <h2>Every card table in one premium place.</h2>
            <p>Twenty-one complete games, step-by-step lessons, real practice and Coach Ace guidance — wrapped in a bright card-room experience.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <TactilePressable onClick={() => navigate(`/game/${continueGame.id}`)} className="hw-cta-primary rounded-2xl px-5 py-4 font-black">
                <Gamepad2 size={19}/> Continue {continueGame.title}
              </TactilePressable>
              <TactilePressable onClick={() => navigate('/games')} className="hw-cta-secondary rounded-2xl px-5 py-4 font-black">
                Browse all games <ArrowRight size={18}/>
              </TactilePressable>
            </div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          <GlassSurface strength={3} className="hw-kpi-card rounded-2xl p-3 sm:p-4"><Gamepad2 size={18}/><strong>{CARD_ACADEMY_GAMES.length}</strong><span>full games</span></GlassSurface>
          <GlassSurface strength={3} className="hw-kpi-card rounded-2xl p-3 sm:p-4"><BookOpenCheck size={18}/><strong>{completedTutorials}</strong><span>tutorials done</span></GlassSurface>
          <GlassSurface strength={3} className="hw-kpi-card rounded-2xl p-3 sm:p-4"><Flame size={18}/><strong>{progress.totalXp || 0}</strong><span>mastery XP</span></GlassSurface>
        </section>

        <section className="mt-7">
          <div className="hw-section-heading"><div><p className="hw-eyebrow">Featured tables</p><h2>Jump into a favorite</h2></div><button type="button" onClick={() => navigate('/games')}>See all</button></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((game, index) => (
              <button key={game.id} type="button" onClick={() => navigate(`/game/${game.id}`)} className={`hw-feature-game hw-feature-game-${index + 1}`}>
                <span className="hw-feature-suit">{index % 2 ? '♥' : '♠'}</span>
                <span className="hw-difficulty-chip">{game.complexity}</span>
                <strong>{game.title}</strong>
                <span>{game.family} · full play</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7 grid gap-3 md:grid-cols-3">
          <button type="button" onClick={() => navigate('/daily-challenge')} className="hw-action-card"><Trophy/><div><strong>Daily Challenge</strong><span>Five smart decisions to keep the streak alive.</span></div><ArrowRight/></button>
          <button type="button" onClick={() => navigate('/practice')} className="hw-action-card"><Target/><div><strong>Practice Lab</strong><span>Fast reps for strategy, reads and rule recall.</span></div><ArrowRight/></button>
          <button type="button" onClick={() => navigate('/learn')} className="hw-action-card"><BookOpenCheck/><div><strong>Learn with Coach Ace</strong><span>Rules, table flow and guided tutorials for every game.</span></div><ArrowRight/></button>
        </section>

        {recent.length > 1 && <section className="mt-7"><div className="hw-section-heading"><div><p className="hw-eyebrow">Recently played</p><h2>Pick up where you left off</h2></div></div><div className="flex gap-3 overflow-x-auto pb-2">{recent.slice(0,6).map(game => <button key={game.id} type="button" onClick={() => navigate(`/game/${game.id}`)} className="hw-recent-chip"><span>{game.title}</span><ArrowRight size={15}/></button>)}</div></section>}
      </main>
      <PremiumBottomNav />
    </div>
  );
}
