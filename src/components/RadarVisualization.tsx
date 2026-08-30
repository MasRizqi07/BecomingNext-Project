import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';

import type {AnalysisResult} from '@shared/contracts';

export function RadarVisualization({data}: {data: AnalysisResult['radarData']}) {
  return (
    <div className="h-90 w-full" aria-hidden="true">
      <ResponsiveContainer
        width="100%"
        height="100%"
        minWidth={0}
        initialDimension={{width: 640, height: 360}}
      >
        <RadarChart data={data} outerRadius="78%" accessibilityLayer={false}>
          <PolarGrid stroke="#ffffff14" />
          <PolarAngleAxis dataKey="subject" tick={{fill: '#8b98a8', fontSize: 11}} />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar name="Drift" dataKey="A" stroke="#f87171" fill="#f87171" fillOpacity={0.08} />
          <Radar name="Becoming" dataKey="B" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.18} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
