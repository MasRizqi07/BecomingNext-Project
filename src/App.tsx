import {lazy, Suspense, useEffect} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';

import {Landing} from '@/components/Landing';
import {useBecomingStore} from '@/store/useBecomingStore';
import {useThemeStore} from '@/store/useThemeStore';

const Dashboard = lazy(() =>
  import('@/features/dashboard/Dashboard').then((m) => ({default: m.Dashboard})),
);
const HowItWorks = lazy(() =>
  import('@/components/HowItWorks').then((m) => ({default: m.HowItWorks})),
);
const PrivacyBoundaries = lazy(() =>
  import('@/components/PrivacyBoundaries').then((m) => ({default: m.PrivacyBoundaries})),
);
const Intake = lazy(() => import('@/components/Intake').then((m) => ({default: m.Intake})));
const ReviewReflection = lazy(() =>
  import('@/components/ReviewReflection').then((m) => ({default: m.ReviewReflection})),
);
const Analysis = lazy(() => import('@/components/Analysis').then((m) => ({default: m.Analysis})));
const Results = lazy(() => import('@/components/Results').then((m) => ({default: m.Results})));
const HabitCheckIn = lazy(() =>
  import('@/features/check-in/HabitCheckIn').then((m) => ({default: m.HabitCheckIn})),
);
const History = lazy(() => import('@/components/History').then((m) => ({default: m.History})));
const Settings = lazy(() => import('@/components/Settings').then((m) => ({default: m.Settings})));
const NotFound = lazy(() => import('@/components/NotFound').then((m) => ({default: m.NotFound})));
const ParticlesBG = lazy(() =>
  import('@/components/ParticlesBG').then((m) => ({default: m.ParticlesBG})),
);

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6" role="status">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-cyan-400/20 border-t-cyan-400" />
        <p className="font-display text-[10px] uppercase tracking-[0.3em] text-white/50">
          Preparing your space
        </p>
      </div>
    </div>
  );
}

function RequireAuth({children}: {children: React.ReactNode}) {
  const {authReady, user} = useBecomingStore();

  if (!authReady) return <PageLoading />;
  if (!user) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const setAuth = useBecomingStore((state) => state.setAuth);
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    useThemeStore.getState().initTheme();
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void import('@/lib/firebaseCore')
      .then(({observeAuthState}) => {
        if (!cancelled) unsubscribe = observeAuthState(setAuth);
      })
      .catch(() => {
        if (!cancelled) setAuth(null);
      });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [setAuth]);

  return (
    <div className="relative min-h-screen overflow-x-hidden transition-colors duration-300">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Atmospheric ambient glows */}
      <div className="pointer-events-none fixed -left-24 -top-24 h-128 w-128 rounded-full bg-cyan-900/10 blur-[130px]" />
      <div className="pointer-events-none fixed -bottom-24 -right-24 h-144 w-144 rounded-full bg-purple-900/10 blur-[150px]" />

      <Suspense fallback={null}>
        <ParticlesBG />
      </Suspense>

      <div id="main-content" className="relative z-10 min-h-screen flex flex-col" tabIndex={-1}>
        <Suspense fallback={<PageLoading />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={prefersReducedMotion ? false : {opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: prefersReducedMotion ? 0 : 0.2}}
              className="flex-1 flex flex-col"
            >
              <Routes location={location}>
                {/* Public Discovery Routes */}
                <Route path="/" element={<Landing />} />
                <Route path="/demo" element={<Results demo />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/privacy" element={<PrivacyBoundaries />} />

                {/* Authenticated Application Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth>
                      <Dashboard />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/reflect"
                  element={
                    <RequireAuth>
                      <Intake />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/reflect/review"
                  element={
                    <RequireAuth>
                      <ReviewReflection />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/analysis/:analysisId?"
                  element={
                    <RequireAuth>
                      <Analysis />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/results/:analysisId"
                  element={
                    <RequireAuth>
                      <Results />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/check-in/:analysisId"
                  element={
                    <RequireAuth>
                      <HabitCheckIn />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/history"
                  element={
                    <RequireAuth>
                      <History />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <RequireAuth>
                      <Settings />
                    </RequireAuth>
                  }
                />

                {/* 404 Recovery Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </div>
  );
}
