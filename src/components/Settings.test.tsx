import {render, screen} from '@testing-library/react';
import type {User} from 'firebase/auth';
import {describe, it, expect} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {Settings} from './Settings';
import {useBecomingStore} from '@/store/useBecomingStore';

describe('Settings Component', () => {
  it('renders account identity and danger zone', () => {
    useBecomingStore.setState({
      user: {
        displayName: 'Jordan Stone',
        email: 'jordan@example.com',
      } as unknown as User,
    });

    render(
      <MemoryRouter>
        <Settings />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /settings & privacy/i})).toBeDefined();
    expect(screen.getByText('Jordan Stone')).toBeDefined();
    expect(screen.getByText('jordan@example.com')).toBeDefined();
    expect(screen.getByRole('button', {name: /delete account permanently/i})).toBeDefined();
  });
});
