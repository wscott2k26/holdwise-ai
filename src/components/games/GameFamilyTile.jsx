import React from 'react';
import { ChevronRight, GraduationCap, Sparkles } from 'lucide-react';
import GlassSurface from '@/components/premium/GlassSurface';
import TactilePressable from '@/components/premium/TactilePressable';

const FAMILY_COPY = {
  poker: ['Poker Room', 'Emerald felt · gold stakes'],
  casino: ['Casino', 'Dealer tables · strategy-first'],
  solitaire: ['Solitaire', 'Calm tables · five classics'],
  classics: ['Classics', 'Tricks, bids & melds'],
  family: ['Family', 'Fast, colorful table games'],
};

export default function GameFamilyTile({ family, count = 0, onClick }) {
  const [title, subtitle] = FAMILY_COPY[family] || [family, 'Card Academy'];
  return (
    <GlassSurface strength={3} variant="interactive" className={`hw-family-tile relative overflow-hidden rounded-[1.6rem] p-1 hw-family-${family}`}>
      <TactilePressable onClick={onClick} className="hw-family-tile-inner w-full rounded-[1.35rem] p-4 text-left shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] hw-royal-text">
              <GraduationCap size={14} /> Full play + tutorial
            </div>
            <h3 className="font-heading text-xl font-black text-[hsl(var(--hw-ink))]">{title}</h3>
            <p className="mt-1 text-xs text-[hsl(var(--hw-ink)/.64)]">{subtitle}</p>
          </div>
          <div className="rounded-full border border-[hsl(var(--hw-royal)/.16)] bg-[hsl(0_0%_100%/.56)] p-2 text-[hsl(var(--hw-royal))]"><ChevronRight size={18} /></div>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-[hsl(var(--hw-royal)/.14)] pt-3 text-xs">
          <span className="flex items-center gap-1.5 text-[hsl(var(--hw-ink)/.7)]"><Sparkles size={13} /> {count} games</span>
          <span className="font-bold hw-royal-text">Explore</span>
        </div>
      </TactilePressable>
    </GlassSurface>
  );
}
