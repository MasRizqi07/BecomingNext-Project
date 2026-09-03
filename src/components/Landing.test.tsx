import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {Landing} from './Landing';

describe('Landing Component', () => {
  it('renders the complete landing narrative and final conversion action', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /future version/i})).toBeDefined();
    expect(screen.getByRole('link', {name: /view a safe demo/i})).toBeDefined();
    expect(screen.getByText('The Emergent Strategist')).toBeDefined();
    expect(screen.getByText('Reflect honestly')).toBeDefined();
    expect(
      screen.getByRole('heading', {name: /reflection guidance, never a verdict/i}),
    ).toBeDefined();
    expect(screen.getByRole('heading', {name: /future self is built/i})).toBeDefined();
    expect(screen.getByRole('button', {name: /start your first reflection/i})).toBeDefined();
  });
});
