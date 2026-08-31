import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {HabitCheckIn} from './HabitCheckIn';
import {useBecomingStore} from '@/store/useBecomingStore';
import {DEMO_ANALYSIS} from '@/data/demoAnalysis';

const {saveCheckIn} = vi.hoisted(() => ({
  saveCheckIn: vi.fn().mockResolvedValue({
    checkInId: 'a'.repeat(64),
    savedAt: '2026-08-31T12:00:00.000Z',
  }),
}));

vi.mock('@/services/analysisService', () => ({
  getAnalysisRecord: vi.fn(),
  saveCheckIn,
}));

const ANALYSIS_ID = '10000000-0000-4000-8000-000000000001';

describe('HabitCheckIn Feature', () => {
  it('renders check-in habits and submits progress', async () => {
    useBecomingStore.setState({
      analysis: DEMO_ANALYSIS,
      activeAnalysisId: ANALYSIS_ID,
    });

    render(
      <MemoryRouter initialEntries={[`/check-in/${ANALYSIS_ID}`]}>
        <Routes>
          <Route path="/check-in/:analysisId" element={<HabitCheckIn />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /daily habit check-in/i})).toBeDefined();
    expect(
      screen.getByText('Protect one distraction-free 45-minute building block.'),
    ).toBeDefined();

    // Mark completed
    const completedBtns = screen.getAllByRole('button', {name: 'Completed'});
    if (completedBtns[0]) {
      fireEvent.click(completedBtns[0]);
    }

    // Submit
    const submitBtn = screen.getByRole('button', {name: /complete check-in/i});
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Progress Recorded')).toBeDefined();
    expect(saveCheckIn).toHaveBeenCalledWith(
      expect.objectContaining({
        analysisId: ANALYSIS_ID,
        mood: 3,
        habitStates: expect.arrayContaining([
          expect.objectContaining({habitIndex: 0, status: 'done'}),
        ]),
      }),
    );
  });
});
