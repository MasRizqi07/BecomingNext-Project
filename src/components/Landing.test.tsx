import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {Landing} from './Landing';

describe('Landing Component', () => {
  it('renders landing hero, philosophy, and outcome preview', () => {
    render(
      <MemoryRouter>
        <Landing />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /future version/i})).toBeDefined();
    expect(screen.getByRole('link', {name: /view a safe demo/i})).toBeDefined();
    expect(screen.getByText('The Emergent Strategist')).toBeDefined();
    expect(screen.getByText('Reflect honestly')).toBeDefined();
  });
});
