import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HashRouter } from 'react-router-dom';
import { AppProvider } from '@/lib/appContext';
import PracticeVP from '@/pages/PracticeVP';
import CinematicBackdrop from '@/components/premium/CinematicBackdrop';

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
            <PracticeVP />
          </CinematicBackdrop>
        </HashRouter>
      </QueryClientProvider>
    </AppProvider>
  );
}
