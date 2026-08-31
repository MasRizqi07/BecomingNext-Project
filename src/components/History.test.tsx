import {render, screen} from '@testing-library/react';
import type {User} from 'firebase/auth';
import {describe, it, expect, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {History} from './History';
import {useBecomingStore} from '@/store/useBecomingStore';

const {mockRecord} = vi.hoisted(() => ({
  mockRecord: {
    id: 'rec-1',
    status: 'completed',
    createdAt: new Date('2026-08-30'),
    result: {
      identity: {
        title: 'The Quiet Builder',
        archetype: 'The Quiet Builder',
        description: 'A dedicated craftsman.',
      },
      trajectories: {
        drift: {title: 'Drift', vision: 'Drifting...', friction: 'None'},
        becoming: {title: 'Becoming', vision: 'Growing...', catalyst: 'Action'},
      },
      capabilities: {
        radar: [{capability: 'Clarity', current: 7, potential: 9, description: 'Focus'}],
      },
      roadmap: {
        immediateShift: 'Start now',
        ninetyDayAnchor: 'Build system',
        oneYearTrajectory: 'Thrive',
      },
      plan: {
        dailyHabits: ['Focus block'],
        learningRoadmap: ['Read'],
        antiProcrastinationRule: 'Just start',
      },
      futureLetter: 'Dear Future Self...',
    },
  },
}));

vi.mock('@/services/analysisService', () => ({
  getAnalysisHistory: vi.fn().mockImplementation(() => Promise.resolve([mockRecord])),
  deleteAnalysisRecord: vi.fn().mockImplementation(() => Promise.resolve()),
}));

describe('History Component', () => {
  it('renders archive history with filter chips', async () => {
    useBecomingStore.setState({
      user: {uid: 'user-123'} as unknown as User,
    });

    render(
      <MemoryRouter>
        <History />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', {name: /reflection history/i}, {timeout: 4000}),
    ).toBeDefined();
    expect(await screen.findByText('The Quiet Builder', {}, {timeout: 4000})).toBeDefined();
    expect(await screen.findByText('All Reflections', {}, {timeout: 4000})).toBeDefined();
  });
});
