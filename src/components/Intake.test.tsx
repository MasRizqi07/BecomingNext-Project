import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {Intake} from './Intake';
import {useBecomingStore} from '@/store/useBecomingStore';

describe('Intake Component', () => {
  it('renders intro screen and begins reflection', async () => {
    useBecomingStore.setState({
      responses: {},
      currentQuestionIndex: 0,
    });

    render(
      <MemoryRouter>
        <Intake />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /eight honest questions/i})).toBeDefined();
    const beginBtn = screen.getByRole('button', {name: /begin reflection/i});
    fireEvent.click(beginBtn);

    expect(await screen.findByText('Question 1 of 8')).toBeDefined();
  });
});
