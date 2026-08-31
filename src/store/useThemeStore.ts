import {create} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';

export type ThemeMode = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  initTheme: () => void;
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDocument(resolved: ResolvedTheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
    root.setAttribute('data-theme', 'dark');
    root.style.colorScheme = 'dark';
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      resolvedTheme: 'dark',
      setTheme: (theme: ThemeMode) => {
        const resolved: ResolvedTheme = theme === 'system' ? getSystemTheme() : theme;
        applyThemeToDocument(resolved);
        set({theme, resolvedTheme: resolved});
      },
      toggleTheme: () => {
        const current = get().resolvedTheme;
        const next: ThemeMode = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
      },
      initTheme: () => {
        const currentTheme = get().theme;
        const resolved: ResolvedTheme = currentTheme === 'system' ? getSystemTheme() : currentTheme;
        applyThemeToDocument(resolved);
        set({resolvedTheme: resolved});

        if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          const handleChange = () => {
            if (get().theme === 'system') {
              const newResolved = getSystemTheme();
              applyThemeToDocument(newResolved);
              set({resolvedTheme: newResolved});
            }
          };
          mediaQuery.addEventListener?.('change', handleChange);
        }
      },
    }),
    {
      name: 'becoming-theme-v1',
      storage: createJSONStorage(() =>
        typeof localStorage !== 'undefined' ? localStorage : sessionStorage,
      ),
      partialize: (state) => ({
        theme: state.theme,
      }),
    },
  ),
);
