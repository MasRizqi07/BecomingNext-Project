import {render, screen} from '@testing-library/react';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import App from './App';
import {useBecomingStore} from '@/store/useBecomingStore';

describe('App /demo Route', () => {
  it('renders demo route heading', async () => {
    useBecomingStore.getState().setAuth(null);
    render(
      <MemoryRouter initialEntries={['/demo']}>
        <App />
      </MemoryRouter>,
    );

    expect(
      await screen.findByRole('heading', {name: /evolution of/i}, {timeout: 8000}),
    ).toBeDefined();
    expect(await screen.findByText('The Quiet Builder', {}, {timeout: 8000})).toBeDefined();
  });
});
