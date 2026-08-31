import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {ReviewReflection} from './ReviewReflection';
import {useBecomingStore} from '@/store/useBecomingStore';

describe('ReviewReflection Component', () => {
  it('renders 8 prompt review cards', () => {
    useBecomingStore.setState({
      responses: {
        fearedFuture: 'Stagnating without focus.',
        limitingHabit: 'Endless planning.',
        disconnectionMoment: 'Procrastinating late at night.',
        chosenLife: 'Building impactful systems calmly.',
        avoidedStart: 'Shipping my major project.',
        desiredIdentity: 'A focused, grounded builder.',
        disciplineScore: '8/10 — Focused daily blocks.',
        uncommittedDream: 'Building an independent creative studio.',
      },
    });

    render(
      <MemoryRouter>
        <ReviewReflection />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /review your reflection/i})).toBeDefined();
    expect(screen.getByText('Building impactful systems calmly.')).toBeDefined();
    expect(screen.getByRole('button', {name: /create trajectory analysis/i})).toBeDefined();
  });
});
