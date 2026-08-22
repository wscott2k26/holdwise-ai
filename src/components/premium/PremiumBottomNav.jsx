import React from 'react';
import { BarChart3, BookOpenCheck, Gamepad2, Home, Target } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { hapticPulse, playSoundEffect } from '@/lib/haptics';
import { useApp } from '@/lib/appContext';

const ITEMS = [
  { label:'Home', path:'/home', Icon:Home },
  { label:'Games', path:'/games', Icon:Gamepad2 },
  { label:'Practice', path:'/practice', Icon:Target },
  { label:'Learn', path:'/learn', Icon:BookOpenCheck },
  { label:'Progress', path:'/progress', Icon:BarChart3 },
];

export default function PremiumBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { accessibility, settings } = useApp();

  function go(path) {
    hapticPulse(accessibility.haptics, 10, 'selection');
    playSoundEffect(settings.soundEffects !== false, 'selection');
    navigate(path);
  }

  return (
    <nav className="nav-bottom hw-premium-bottom-nav" aria-label="HoldWise primary navigation">
      {ITEMS.map(({ label, path, Icon }) => {
        const active = location.pathname === path || (path === '/games' && location.pathname.startsWith('/game/'));
        return (
          <button
            key={path}
            type="button"
            onClick={() => go(path)}
            className={cn('hw-premium-nav-item', active && 'hw-premium-nav-item-active')}
            aria-current={active ? 'page' : undefined}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
