import React from 'react';
import { useParams } from 'react-router-dom';
import GameShell from '@/components/games/GameShell';
import GlassSurface from '@/components/premium/GlassSurface';
import HoldemTable from '@/components/games/HoldemTable';
import VideoPokerTable, { VIDEO_POKER_IDS } from '@/components/games/VideoPokerTable';
import BlackjackTable from '@/components/games/BlackjackTable';
import SolitaireTable, { SOLITAIRE_IDS } from '@/components/games/SolitaireTable';
import { getGame } from '@/games/catalog';
import { getEngine } from '@/games/engineRegistry';

export default function GameRoom() {
  const { gameId } = useParams();
  const game = getGame(gameId);
  if (!game) return <div className="p-6 text-white">Unknown card game.</div>;

  if (game.id === 'texas-holdem') return <HoldemTable game={game} />;
  if (VIDEO_POKER_IDS.includes(game.id)) return <VideoPokerTable game={game} />;
  if (game.id === 'blackjack') return <BlackjackTable game={game} />;
  if (SOLITAIRE_IDS.includes(game.id)) return <SolitaireTable game={game} />;

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
