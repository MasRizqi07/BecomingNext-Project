import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {HowItWorks} from './HowItWorks';

describe('HowItWorks Component', () => {
  it('renders title, 3 steps and allows accordion toggle', () => {
    render(
      <MemoryRouter>
        <HowItWorks />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /eight prompts/i})).toBeDefined();
    expect(screen.getByText('Reflect Honestly')).toBeDefined();
    expect(screen.getByText('Dual-Path Synthesis')).toBeDefined();
    expect(screen.getByText('Daily Action Protocols')).toBeDefined();

    const faqButton = screen.getByRole('button', {
      name: /how long does a reflection session take/i,
    });
    expect(faqButton).toBeDefined();
    fireEvent.click(faqButton);
  });
});
