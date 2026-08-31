import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter, Route, Routes} from 'react-router-dom';
import {HabitCheckIn} from './HabitCheckIn';
import {useBecomingStore} from '@/store/useBecomingStore';
import {DEMO_ANALYSIS} from '@/data/demoAnalysis';

describe('HabitCheckIn Feature', () => {
  it('renders check-in habits and submits progress', async () => {
    useBecomingStore.setState({
      analysis: DEMO_ANALYSIS,
      activeAnalysisId: 'test-id',
    });

    render(
      <MemoryRouter initialEntries={['/check-in/test-id']}>
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
  });
});
