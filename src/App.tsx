import {lazy, Suspense, useEffect} from 'react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {Navigate, Route, Routes, useLocation} from 'react-router-dom';

import {Landing} from '@/components/Landing';
import {useBecomingStore} from '@/store/useBecomingStore';

const Results = lazy(() =>
  import('@/components/Results').then((module) => ({default: module.Results})),
);
const Intake = lazy(() =>
  import('@/components/Intake').then((module) => ({default: module.Intake})),
);
const Analysis = lazy(() =>
  import('@/components/Analysis').then((module) => ({default: module.Analysis})),
);
const History = lazy(() =>
  import('@/components/History').then((module) => ({default: module.History})),
);
const Settings = lazy(() =>
  import('@/components/Settings').then((module) => ({default: module.Settings})),
);
const ParticlesBG = lazy(() =>
  import('@/components/ParticlesBG').then((module) => ({default: module.ParticlesBG})),
);

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6" role="status">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-cyan-400/20 border-t-cyan-400" />
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Preparing your space</p>
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
    <div className="relative min-h-screen overflow-x-hidden bg-[#020205] text-white">
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <div className="pointer-events-none fixed -left-24 -top-24 h-125 w-125 rounded-full bg-cyan-900/10 blur-[120px]" />
      <div className="pointer-events-none fixed -bottom-24 -right-24 h-150 w-150 rounded-full bg-purple-900/10 blur-[140px]" />
      <Suspense fallback={null}>
        <ParticlesBG />
      </Suspense>

      <main id="main-content" className="relative z-10 min-h-screen">
        <Suspense fallback={<PageLoading />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={prefersReducedMotion ? false : {opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={{duration: prefersReducedMotion ? 0 : 0.25}}
            >
              <Routes location={location}>
                <Route path="/" element={<Landing />} />
                <Route path="/demo" element={<Results demo />} />
                <Route
                  path="/reflect"
                  element={
                    <RequireAuth>
                      <Intake />
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
    </div>
  );
}
