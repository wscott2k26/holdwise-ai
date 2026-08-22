import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from '@/lib/appContext';
import CinematicBackdrop from '@/components/premium/CinematicBackdrop';
import PremiumHome from '@/pages/PremiumHome';
import GameLibrary from '@/pages/GameLibrary';
import PracticeHub from '@/pages/PracticeHub';
import LearnHub from '@/pages/LearnHub';
import ProgressHub from '@/pages/ProgressHub';
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
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/academy" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={<PremiumHome />} />
              <Route path="/games" element={<GameLibrary />} />
              <Route path="/practice" element={<PracticeHub />} />
              <Route path="/learn" element={<LearnHub />} />
              <Route path="/progress" element={<ProgressHub />} />
              <Route path="/game/:gameId" element={<GameRoom />} />
              <Route path="/game/:gameId/tutorial" element={<GameTutorial />} />
              <Route path="/daily-challenge" element={<DailyChallengeHub />} />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </CinematicBackdrop>
        </HashRouter>
      </QueryClientProvider>
    </AppProvider>
  );
}
