import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter, HashRouter, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import { AppProvider } from '@/lib/appContext';
import AppLayout from '@/components/AppLayout';
import MascotStage from '@/components/mascot/MascotStage';
// Add page imports here
import Welcome from '@/pages/Welcome';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import AgeConfirmation from '@/pages/AgeConfirmation';
import Onboarding from '@/pages/Onboarding';
import Assessment from '@/pages/Assessment';
import Home from '@/pages/Home';
import Learn from '@/pages/Learn';
import LessonDetail from '@/pages/LessonDetail';
import Hands from '@/pages/Hands';
import HandDetail from '@/pages/HandDetail';
import PayTables from '@/pages/PayTables';
import PracticeVP from '@/pages/PracticeVP';
import Academy from '@/pages/Academy';
import GameCourse from '@/pages/GameCourse';
import GuidedRound from '@/pages/GuidedRound';
import GamePractice from '@/pages/GamePractice';
import Mistakes from '@/pages/Mistakes';
import DailyChallenge from '@/pages/DailyChallenge';
import Glossary from '@/pages/Glossary';
import Achievements from '@/pages/Achievements';
import Statistics from '@/pages/Statistics';
import Premium from '@/pages/Premium';
import Profile from '@/pages/Profile';
import MascotGallery from '@/pages/MascotGallery';
import Settings from '@/pages/Settings';
import Accessibility from '@/pages/Accessibility';
import ResponsibleLearning from '@/pages/ResponsibleLearning';
import Privacy from '@/pages/Privacy';
import Terms from '@/pages/Terms';
import Support from '@/pages/Support';
import Admin from '@/pages/Admin';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center hw-felt-bg">
        <div className="w-8 h-8 border-4 border-white/20 border-t-[hsl(var(--hw-gold))] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      navigateToLogin();
      return null;
    }
  }

  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/age-confirmation" element={<AgeConfirmation />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />
        <Route path="/learn" element={<Learn />} />
        <Route path="/learn/lesson/:lessonId" element={<LessonDetail />} />
        <Route path="/hands" element={<Hands />} />
        <Route path="/hands/:handType" element={<HandDetail />} />
        <Route path="/video-poker" element={<PayTables />} />
        <Route path="/video-poker/pay-tables" element={<PayTables />} />
        <Route path="/practice" element={<PracticeVP />} />
        <Route path="/practice/video-poker" element={<PracticeVP />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/academy/game/:gameId" element={<GameCourse />} />
        <Route path="/academy/game/:gameId/guided-round" element={<GuidedRound />} />
        <Route path="/academy/game/:gameId/practice" element={<GamePractice />} />
        <Route path="/mistakes" element={<Mistakes />} />
        <Route path="/daily-challenge" element={<DailyChallenge />} />
        <Route path="/glossary" element={<Glossary />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mascots" element={<MascotGallery />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/responsible-learning" element={<ResponsibleLearning />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/support" element={<Support />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/courses" element={<Admin />} />
        <Route path="/admin/games" element={<Admin />} />
        <Route path="/admin/pay-tables" element={<Admin />} />
        <Route path="/admin/challenges" element={<Admin />} />
        <Route path="/admin/settings" element={<Admin />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  const nativeShell = typeof window !== 'undefined' && (Boolean(window.HoldWiseNative) || ['file:', 'holdwise:'].includes(window.location.protocol));
  const Router = nativeShell ? HashRouter : BrowserRouter;

  return (
    <AuthProvider>
      <AppProvider>
        <QueryClientProvider client={queryClientInstance}>
          <Router>
            <ScrollToTop />
            <AuthenticatedApp />
          </Router>
          <MascotStage />
          <Toaster />
        </QueryClientProvider>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
