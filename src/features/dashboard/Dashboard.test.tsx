import {render, screen} from '@testing-library/react';
import type {User} from 'firebase/auth';
import {describe, it, expect, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {Dashboard} from './Dashboard';
import {useBecomingStore} from '@/store/useBecomingStore';

const {mockRecord} = vi.hoisted(() => ({
  mockRecord: {
    id: 'analysis-123',
    status: 'completed' as const,
    createdAt: new Date('2026-08-30'),
    result: {
      identity: {
        archetype: 'The Quiet Builder',
        description:
          'You are not short on ambition; you are learning to replace bursts of intensity with a rhythm you can trust.',
      },
      futureA: {
        title: 'The Drifting Version',
        description:
          'If every difficult beginning keeps being postponed, your ideas remain vivid but untested.',
        keyRegret: 'Waiting for confidence instead of letting small completed work create it.',
      },
      futureB: {
        title: 'The Becoming Version',
        description: 'By protecting a small daily building window, you create a body of work.',
        keyGrowth: 'Becoming someone who finishes.',
      },
      radarData: [
        {subject: 'Discipline' as const, A: 42, B: 78, fullMark: 100 as const},
        {subject: 'Consistency' as const, A: 35, B: 82, fullMark: 100 as const},
        {subject: 'Adaptability' as const, A: 66, B: 84, fullMark: 100 as const},
        {subject: 'Resilience' as const, A: 58, B: 86, fullMark: 100 as const},
        {subject: 'Execution' as const, A: 38, B: 80, fullMark: 100 as const},
      ],
      futureLetter: 'Hey Builder,\n\nThe turning point was smaller than you expected.',
      timeline: [
        {period: '6 Months' as const, stateA: 'State A', stateB: 'State B'},
        {period: '1 Year' as const, stateA: 'State A', stateB: 'State B'},
        {period: '5 Years' as const, stateA: 'State A', stateB: 'State B'},
      ],
      plan: {
        dailyHabits: [
          'Protect one distraction-free 45-minute building block.',
          'Write the next smallest action before ending each session.',
        ],
        learningRoadmap: [
          'Ship one deliberately small project this month.',
          'Ask three target users for feedback.',
        ],
        antiProcrastination:
          'When the task feels too large, define a version that can be completed in twenty minutes.',
      },
      identityCard: {
        potentialScore: 83,
        aiReadiness: 76,
        growthPotential: 'High when ambition is converted into a repeatable weekly system.',
      },
    },
  },
}));

vi.mock('@/services/analysisService', () => ({
  getAnalysisHistory: vi.fn().mockImplementation(() => Promise.resolve([mockRecord])),
}));

describe('Dashboard Feature', () => {
  it('renders dashboard with analysis record', async () => {
    useBecomingStore.getState().setAuth({
      uid: 'user-123',
      displayName: 'Alex Rivers',
      email: 'alex@example.com',
    } as unknown as User);

    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    );

    expect((await screen.findAllByText('The Quiet Builder', {}, {timeout: 5000}))[0]).toBeDefined();
    expect(
      await screen.findByRole('link', {name: /open full analysis/i}, {timeout: 5000}),
    ).toBeDefined();
  }, 10000);
});
