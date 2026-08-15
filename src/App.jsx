import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@/lib/appContext';
import CinematicBackdrop from '@/components/premium/CinematicBackdrop';
import CardAcademyLobby from '@/pages/CardAcademyLobby';
import GameRoom from '@/pages/GameRoom';
import GameTutorial from '@/pages/GameTutorial';
import DailyChallengeHub from '@/pages/DailyChallengeHub';

const previewQueryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function App() {
  return (
    <AppProvider>
      <QueryClientProvider client={previewQueryClient}>
        <HashRouter>
          <CinematicBackdrop intensity="normal" className="text-scale-root">
            <Routes>
              <Route path="/" element={<Navigate to="/academy" replace />} />
              <Route path="/academy" element={<CardAcademyLobby />} />
              <Route path="/game/:gameId" element={<GameRoom />} />
              <Route path="/game/:gameId/tutorial" element={<GameTutorial />} />
              <Route path="/daily-challenge" element={<DailyChallengeHub />} />
              <Route path="*" element={<Navigate to="/academy" replace />} />
            </Routes>
          </CinematicBackdrop>
        </HashRouter>
      </QueryClientProvider>
    </AppProvider>
  );
}
