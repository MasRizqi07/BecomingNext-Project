import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import {useReducedMotion} from 'motion/react';
import {useSyncExternalStore} from 'react';

import type {AnalysisResult} from '@shared/contracts';

const MOBILE_RADAR_QUERY = '(max-width: 639px)';

function getMobileRadarSnapshot() {
  return typeof window !== 'undefined' && typeof window.matchMedia === 'function'
    ? window.matchMedia(MOBILE_RADAR_QUERY).matches
    : false;
}

function subscribeToMobileRadar(onChange: () => void) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};

  const mediaQuery = window.matchMedia(MOBILE_RADAR_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
}

export function RadarVisualization({data}: {data: AnalysisResult['radarData']}) {
  const prefersReducedMotion = useReducedMotion();
  const isMobile = useSyncExternalStore(
    subscribeToMobileRadar,
    getMobileRadarSnapshot,
    () => false,
  );

  return (
    <div className="h-90 w-full" aria-hidden="true">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{width: 640, height: 360}}
      >
        <RadarChart
          data={data}
          outerRadius={isMobile ? '60%' : '78%'}
          margin={
            isMobile
              ? {top: 20, right: 50, bottom: 20, left: 50}
              : {top: 16, right: 36, bottom: 16, left: 36}
          }
          accessibilityLayer={false}
        >
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{fill: 'var(--color-text-3)', fontSize: isMobile ? 10 : 11}}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Drift"
            dataKey="A"
            stroke="var(--color-accent)"
            fill="var(--color-accent)"
            fillOpacity={0.14}
            isAnimationActive={!prefersReducedMotion}
          />
          <Radar
            name="Becoming"
            dataKey="B"
            stroke="var(--color-violet)"
            fill="var(--color-violet)"
            fillOpacity={0.18}
            isAnimationActive={!prefersReducedMotion}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
