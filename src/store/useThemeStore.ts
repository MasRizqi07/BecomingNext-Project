import {create} from 'zustand';

export const THEME_STORAGE_KEY = 'becoming-theme-v1';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = Exclude<ThemeMode, 'system'>;

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => () => void;
}

const DEFAULT_THEME: ResolvedTheme = 'dark';
const DARK_THEME_COLOR = '#020205';
const LIGHT_THEME_COLOR = '#f8fafc';
const SYSTEM_THEME_QUERY = '(prefers-color-scheme: dark)';

let initializerCount = 0;
let detachGlobalListeners: (() => void) | undefined;

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'dark' || value === 'light' || value === 'system';
}

function parseStoredTheme(serialized: string | null): ThemeMode {
  if (!serialized) return DEFAULT_THEME;

  try {
    const parsed: unknown = JSON.parse(serialized);
    if (isThemeMode(parsed)) return parsed;

    if (typeof parsed === 'object' && parsed !== null) {
      const record = parsed as {theme?: unknown; state?: {theme?: unknown}};
      if (isThemeMode(record.theme)) return record.theme;
      if (isThemeMode(record.state?.theme)) return record.state.theme;
    }
  } catch {
    if (isThemeMode(serialized)) return serialized;
  }

  return DEFAULT_THEME;
}

function readStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return DEFAULT_THEME;

  try {
    return parseStoredTheme(window.localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return DEFAULT_THEME;
  }
}

function writeStoredTheme(theme: ThemeMode) {
  if (typeof window === 'undefined') return;

  try {
    // Preserve compatibility with the previous Zustand-persisted shape.
    window.localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify({state: {theme}, version: 1}));
  } catch {
    // A blocked storage API must not prevent an in-memory theme change.
  }
}

function resolveTheme(theme: ThemeMode): ResolvedTheme {
  if (theme !== 'system') return theme;
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function')
    return DEFAULT_THEME;
  return window.matchMedia(SYSTEM_THEME_QUERY).matches ? 'dark' : 'light';
}

function applyThemeToDocument(theme: ThemeMode, resolvedTheme: ResolvedTheme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', resolvedTheme === 'dark');
  root.classList.toggle('light', resolvedTheme === 'light');
  root.dataset.theme = resolvedTheme;
  root.dataset.themePreference = theme;
  root.style.colorScheme = resolvedTheme;

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  themeColor?.setAttribute(
    'content',
    resolvedTheme === 'dark' ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
  );
}

const initialTheme = readStoredTheme();

export const useThemeStore = create<ThemeState>((set, get) => {
  function updateTheme(theme: ThemeMode, persist: boolean) {
    const resolvedTheme = resolveTheme(theme);
    if (persist) writeStoredTheme(theme);
    applyThemeToDocument(theme, resolvedTheme);
    set({theme, resolvedTheme});
  }

  return {
    theme: initialTheme,
    resolvedTheme: resolveTheme(initialTheme),
    setTheme: (theme) => updateTheme(theme, true),
    toggleTheme: () => updateTheme(get().resolvedTheme === 'dark' ? 'light' : 'dark', true),
    initTheme: () => {
      updateTheme(readStoredTheme(), false);
      initializerCount += 1;

      if (initializerCount === 1 && typeof window !== 'undefined') {
        const mediaQuery =
          typeof window.matchMedia === 'function'
            ? window.matchMedia(SYSTEM_THEME_QUERY)
            : undefined;

        const handleSystemChange = () => {
          if (get().theme === 'system') updateTheme('system', false);
        };
        const handleStorage = (event: StorageEvent) => {
          if (event.key === THEME_STORAGE_KEY) updateTheme(parseStoredTheme(event.newValue), false);
        };

        if (mediaQuery && typeof mediaQuery.addEventListener === 'function') {
          mediaQuery.addEventListener('change', handleSystemChange);
        } else {
          mediaQuery?.addListener(handleSystemChange);
        }
        window.addEventListener('storage', handleStorage);

        detachGlobalListeners = () => {
          if (mediaQuery && typeof mediaQuery.removeEventListener === 'function') {
            mediaQuery.removeEventListener('change', handleSystemChange);
          } else {
            mediaQuery?.removeListener(handleSystemChange);
          }
          window.removeEventListener('storage', handleStorage);
        };
      }

      let disposed = false;
      return () => {
        if (disposed) return;
        disposed = true;
        initializerCount = Math.max(0, initializerCount - 1);
        if (initializerCount === 0) {
          detachGlobalListeners?.();
          detachGlobalListeners = undefined;
        }
      };
    },
  };
});
