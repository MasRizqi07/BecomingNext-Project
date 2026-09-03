import {fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {useThemeStore} from '@/store/useThemeStore';
import {ThemeToggle} from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({
        matches: false,
        media: '(prefers-color-scheme: dark)',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    );
    localStorage.clear();
    useThemeStore.setState({theme: 'dark', resolvedTheme: 'dark'});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('toggles from dark to light with an accessible icon control', () => {
    render(<ThemeToggle />);

    fireEvent.click(screen.getByRole('button', {name: 'Switch to light mode'}));

    expect(useThemeStore.getState()).toMatchObject({theme: 'light', resolvedTheme: 'light'});
    expect(screen.getByRole('button', {name: 'Switch to dark mode'})).toBeVisible();
  });

  it('offers explicit dark, light, and system preferences', () => {
    render(<ThemeToggle variant="segmented" />);

    const light = screen.getByRole('radio', {name: 'Light'});
    fireEvent.click(light);

    expect(light).toHaveAttribute('aria-checked', 'true');
    expect(useThemeStore.getState().theme).toBe('light');
    expect(screen.getByRole('radio', {name: 'Dark'})).toBeVisible();
    expect(screen.getByRole('radio', {name: 'System'})).toBeVisible();
  });
});
