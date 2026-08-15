import React from 'react';
import { useParams } from 'react-router-dom';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import PracticeVP from '@/pages/PracticeVP';
import { getGame } from '@/games/catalog';
import { getEngine } from '@/games/engineRegistry';

export default function GameRoom() {
  const { gameId } = useParams();
  const game = getGame(gameId);
  if (!game) return <div className="p-6 text-white">Unknown card game.</div>;

  if (game.id === 'jacks-or-better') return <PracticeVP />;

  const engine = getEngine(game.id);
  return (
    <GameShell game={game} coachContext={{game:game.title, facts:[`Full ${game.title} rules mode.`]}}>
      <GlassSurface strength={4} goldEdge className="rounded-[1.75rem] p-5 text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] hw-gold-text">Full play engine</p>
        <h2 className="mt-2 font-heading text-2xl font-black">{game.title}</h2>
        <p className="mt-3 text-sm leading-6 text-white/65">{engine ? 'Engine registered. Loading the family-specific premium table.' : 'Engine validation is still running on this development branch. This tile will not be included in the handoff until its complete rules, scoring, AI, terminal state, replay flow, tutorial integration, and tests pass.'}</p>
      </GlassSurface>
    </GameShell>
  );
}
