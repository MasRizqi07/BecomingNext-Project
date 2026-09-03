import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {THEME_STORAGE_KEY, useThemeStore} from './useThemeStore';

type MediaListener = (event: MediaQueryListEvent) => void;

function installMatchMedia(initialMatches = false) {
  let matches = initialMatches;
  const listeners = new Set<MediaListener>();
  const mediaQuery = {
    get matches() {
      return matches;
    },
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    addEventListener: (_type: string, listener: MediaListener) => listeners.add(listener),
    removeEventListener: (_type: string, listener: MediaListener) => listeners.delete(listener),
    addListener: (listener: MediaListener) => listeners.add(listener),
    removeListener: (listener: MediaListener) => listeners.delete(listener),
    dispatchEvent: () => true,
  } as MediaQueryList;

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQuery),
  );

  return {
    setMatches(next: boolean) {
      matches = next;
      const event = {matches, media: mediaQuery.media} as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
    listenerCount: () => listeners.size,
  };
}

describe('useThemeStore', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.colorScheme = '';
    document.head.innerHTML = '<meta name="theme-color" content="#020205">';
    useThemeStore.setState({theme: 'dark', resolvedTheme: 'dark'});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('applies and persists an explicit light preference', () => {
    installMatchMedia(true);

    useThemeStore.getState().setTheme('light');

    expect(useThemeStore.getState()).toMatchObject({theme: 'light', resolvedTheme: 'light'});
    expect(document.documentElement).toHaveClass('light');
    expect(document.documentElement).not.toHaveClass('dark');
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(document.documentElement.style.colorScheme).toBe('light');
    expect(document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.content).toBe(
      '#f8fafc',
    );
    expect(JSON.parse(localStorage.getItem(THEME_STORAGE_KEY) ?? '{}')).toMatchObject({
      state: {theme: 'light'},
    });
  });

  it('migrates the previous Zustand persistence format during initialization', () => {
    installMatchMedia(false);
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({state: {theme: 'light'}, version: 0}));

    const dispose = useThemeStore.getState().initTheme();

    expect(useThemeStore.getState()).toMatchObject({theme: 'light', resolvedTheme: 'light'});
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    dispose();
  });

  it('tracks system preference only while initialized and cleans up listeners', () => {
    const media = installMatchMedia(false);
    useThemeStore.getState().setTheme('system');

    const dispose = useThemeStore.getState().initTheme();
    expect(media.listenerCount()).toBe(1);
    expect(useThemeStore.getState().resolvedTheme).toBe('light');

    media.setMatches(true);
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');

    dispose();
    expect(media.listenerCount()).toBe(0);
    media.setMatches(false);
    expect(useThemeStore.getState().resolvedTheme).toBe('dark');
  });

  it('keeps listener registration idempotent across StrictMode-style mounts', () => {
    const media = installMatchMedia(false);

    const disposeFirst = useThemeStore.getState().initTheme();
    const disposeSecond = useThemeStore.getState().initTheme();

    expect(media.listenerCount()).toBe(1);
    disposeFirst();
    expect(media.listenerCount()).toBe(1);
    disposeSecond();
    expect(media.listenerCount()).toBe(0);
  });
});
