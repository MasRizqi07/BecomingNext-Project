import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {NotFound} from './NotFound';

describe('NotFound Component', () => {
  it('renders 404 message and return link', () => {
    render(
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>,
    );

    expect(screen.getByText('404')).toBeDefined();
    expect(screen.getByRole('heading', {name: /this path does not exist/i})).toBeDefined();
    expect(screen.getByRole('link', {name: /return home/i})).toBeDefined();
  });
});
