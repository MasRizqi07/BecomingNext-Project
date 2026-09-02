import {render, screen} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import App from './App';
import {useBecomingStore} from '@/store/useBecomingStore';

vi.mock('@/components/ParticlesBG', () => ({ParticlesBG: () => null}));

describe('App /demo Route', () => {
  it('renders demo route heading', async () => {
    useBecomingStore.getState().setAuth(null);
    render(
      <MemoryRouter initialEntries={['/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', {name: /evolution of/i}, {timeout: 12_000}),
    ).toBeDefined();
    expect(await screen.findByText('The Quiet Builder', {}, {timeout: 12_000})).toBeDefined();
  }, 15_000);
});
