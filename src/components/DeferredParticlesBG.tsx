import {lazy, Suspense, useEffect, useState} from 'react';
import {useReducedMotion} from 'motion/react';

const ParticlesBG = lazy(() =>
  import('@/components/ParticlesBG').then((module) => ({default: module.ParticlesBG})),
);

interface NavigatorWithConnection extends Navigator {
  connection?: {saveData?: boolean};
}

export function DeferredParticlesBG() {
  const [shouldLoad, setShouldLoad] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const navigatorWithConnection = navigator as NavigatorWithConnection;
    if (prefersReducedMotion || navigatorWithConnection.connection?.saveData) return;

    let cancelled = false;
    let idleHandle: number | undefined;
    let timeoutHandle: number | undefined;

    const reveal = () => {
      if (!cancelled) setShouldLoad(true);
    };
    const schedule = () => {
      const requestIdleCallback = (
        window as unknown as {
          requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
        }
      ).requestIdleCallback;

      if (requestIdleCallback) {
        idleHandle = requestIdleCallback(reveal, {timeout: 2500});
      } else {
        timeoutHandle = globalThis.setTimeout(reveal, 1500);
      }
    };

    if (document.readyState === 'complete') {
      schedule();
    } else {
      window.addEventListener('load', schedule, {once: true});
    }

    return () => {
      cancelled = true;
      window.removeEventListener('load', schedule);
      const cancelIdleCallback = (
        window as unknown as {cancelIdleCallback?: (handle: number) => void}
      ).cancelIdleCallback;
      if (idleHandle !== undefined && cancelIdleCallback) {
        cancelIdleCallback(idleHandle);
      }
      if (timeoutHandle !== undefined) window.clearTimeout(timeoutHandle);
    };
  }, [prefersReducedMotion]);

  if (!shouldLoad) return null;

  return (
    <Suspense fallback={null}>
      <ParticlesBG />
    </Suspense>
  );
}
