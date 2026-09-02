import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import {useReducedMotion} from 'motion/react';

import type {AnalysisResult} from '@shared/contracts';

export function RadarVisualization({data}: {data: AnalysisResult['radarData']}) {
  const prefersReducedMotion = useReducedMotion();

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
          outerRadius="78%"
          margin={{top: 16, right: 36, bottom: 16, left: 36}}
          accessibilityLayer={false}
        >
          <PolarGrid stroke="var(--color-border)" />
          <PolarAngleAxis dataKey="subject" tick={{fill: 'var(--color-text-3)', fontSize: 11}} />
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
