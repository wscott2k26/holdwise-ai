import React from 'react';
import { ArrowLeft, BookOpen, Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import PremiumBottomNav from '@/components/premium/PremiumBottomNav';
import AskCoachButton from '@/components/AskCoachButton';
import SensoryControls from '@/components/premium/SensoryControls';

export default function GameShell({ game, children, coachContext = null, actions = null }) {
  const navigate = useNavigate();
  return (
    <div className={`hw-game-shell min-h-screen px-3 pb-32 pt-[max(1rem,env(safe-area-inset-top))] hw-game-${game?.family || 'cards'}`}>
      <GlassSurface strength={4} className="hw-game-topbar mx-auto mb-3 flex max-w-5xl items-center justify-between gap-2 rounded-2xl p-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <TactilePressable onClick={() => navigate('/games')} className="hw-shell-icon rounded-xl p-2 shadow-none" aria-label="Back to games"><ArrowLeft size={19} /></TactilePressable>
          <div className="min-w-0">
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] hw-royal-text">HoldWise · {game?.family || 'cards'} table</p>
            <h1 className="truncate font-heading text-lg font-black leading-tight">{game?.title || 'Card Game'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <SensoryControls className="hidden md:flex" />
          {actions}
          <TactilePressable onClick={() => navigate(`/game/${game?.id}/tutorial`)} className="hw-shell-icon rounded-xl p-2 shadow-none" aria-label={`Tutorial for ${game?.title || 'game'}`}><BookOpen size={18} /></TactilePressable>
          <TactilePressable onClick={() => navigate('/home')} className="hw-shell-icon rounded-xl p-2 shadow-none" aria-label="HoldWise home"><Home size={18} /></TactilePressable>
        </div>
      </GlassSurface>
      <main className="hw-premium-game-stage mx-auto max-w-5xl">
        <div className="hw-premium-table-light" aria-hidden="true" />
        <div className="relative z-10">{children}</div>
      </main>
      <div className="mx-auto mt-4 flex max-w-5xl items-center justify-between gap-3 px-1">
        <span className="flex items-center gap-1.5 text-[11px] hw-game-caption"><Sparkles size={13} /> Full play · Coach-enabled</span>
        <AskCoachButton context={coachContext} label="Ask Coach Ace" />
      </div>
      <PremiumBottomNav />
    </div>
  );
}
