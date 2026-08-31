import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {Results} from './Results';

describe('Results Component', () => {
  it('renders demo result without throwing', async () => {
    render(
      <MemoryRouter initialEntries={['/demo']}>
        <Results demo />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', {name: /evolution of/i})).toBeDefined();
  });
});
