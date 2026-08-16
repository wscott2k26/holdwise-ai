import React from 'react';
import { useParams } from 'react-router-dom';
import HoldemTable from '@/components/games/HoldemTable';
import VideoPokerTable, { VIDEO_POKER_IDS } from '@/components/games/VideoPokerTable';
import BlackjackTable from '@/components/games/BlackjackTable';
import SolitaireTable, { SOLITAIRE_IDS } from '@/components/games/SolitaireTable';
import TrickTable, { TRICK_GAME_IDS } from '@/components/games/TrickTable';
import GinRummyTable from '@/components/games/GinRummyTable';
import FamilyTable, { FAMILY_GAME_IDS } from '@/components/games/FamilyTable';
import { getGame } from '@/games/catalog';

export default function GameRoom() {
  const { gameId } = useParams();
  const game = getGame(gameId);
  if (!game) return <div className="p-6 text-white">Unknown card game.</div>;

  if (game.id === 'texas-holdem') return <HoldemTable game={game} />;
  if (VIDEO_POKER_IDS.includes(game.id)) return <VideoPokerTable game={game} />;
  if (game.id === 'blackjack') return <BlackjackTable game={game} />;
  if (SOLITAIRE_IDS.includes(game.id)) return <SolitaireTable game={game} />;
  if (TRICK_GAME_IDS.includes(game.id)) return <TrickTable game={game} />;
  if (game.id === 'gin-rummy') return <GinRummyTable game={game} />;
  if (FAMILY_GAME_IDS.includes(game.id)) return <FamilyTable game={game} />;

  return <div className="p-6 text-white">This game route is unavailable.</div>;
}
