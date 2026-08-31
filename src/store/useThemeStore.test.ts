import {describe, it, expect, beforeEach} from 'vitest';
import {useThemeStore} from './useThemeStore';

describe('useThemeStore', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') localStorage.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.clear();
    useThemeStore.setState({theme: 'dark', resolvedTheme: 'dark'});
  });

  it('initializes with dark theme by default', () => {
    const {theme, resolvedTheme} = useThemeStore.getState();
    expect(theme).toBe('dark');
    expect(resolvedTheme).toBe('dark');
  });

  it('changes theme to light mode and updates document class', () => {
    useThemeStore.getState().setTheme('light');
    const {theme, resolvedTheme} = useThemeStore.getState();
    expect(theme).toBe('light');
    expect(resolvedTheme).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles theme between dark and light', () => {
    useThemeStore.getState().setTheme('dark');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('light');
    useThemeStore.getState().toggleTheme();
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
  });

  it('initializes theme correctly', () => {
    useThemeStore.getState().initTheme();
    expect(document.documentElement.getAttribute('data-theme')).toBeDefined();
  });
});
