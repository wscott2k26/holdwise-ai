import React from 'react';
import { ArrowLeft, BookOpen, Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';
import AskCoachButton from '@/components/AskCoachButton';

export default function GameShell({ game, children, coachContext = null, actions = null }) {
  const navigate = useNavigate();
  return (
    <div className={`min-h-screen px-3 pb-8 pt-[max(1rem,env(safe-area-inset-top))] hw-game-${game?.family || 'cards'}`}>
      <GlassSurface strength={3} className="mx-auto mb-3 flex max-w-5xl items-center justify-between gap-2 rounded-2xl p-2.5">
        <div className="flex items-center gap-2">
          <TactilePressable onClick={() => navigate('/academy')} className="rounded-xl bg-white/5 p-2 shadow-none" aria-label="Back to Card Academy"><ArrowLeft size={19} /></TactilePressable>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.18em] hw-gold-text">HoldWise Card Academy</p>
            <h1 className="font-heading text-lg font-black leading-tight text-white">{game?.title || 'Card Game'}</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {actions}
          <TactilePressable onClick={() => navigate(`/game/${game?.id}/tutorial`)} className="rounded-xl bg-white/5 p-2 shadow-none" aria-label={`Tutorial for ${game?.title || 'game'}`}><BookOpen size={18} /></TactilePressable>
          <TactilePressable onClick={() => navigate('/academy')} className="rounded-xl bg-white/5 p-2 shadow-none" aria-label="Academy home"><Home size={18} /></TactilePressable>
        </div>
      </GlassSurface>
      <main className="mx-auto max-w-5xl">{children}</main>
      <div className="mx-auto mt-4 flex max-w-5xl items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-[11px] text-white/50"><Sparkles size={13} className="hw-gold-text" /> Full play · Coach-enabled</span>
        <AskCoachButton context={coachContext} label="Ask Coach Ace" />
      </div>
    </div>
  );
}
