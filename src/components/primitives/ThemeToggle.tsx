import {Monitor, Moon, Sun} from 'lucide-react';
import {motion} from 'motion/react';

import {type ThemeMode, useThemeStore} from '@/store/useThemeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  className?: string;
}

const themeOptions: ReadonlyArray<{
  mode: ThemeMode;
  label: string;
  icon: typeof Sun;
}> = [
  {mode: 'dark', label: 'Dark', icon: Moon},
  {mode: 'light', label: 'Light', icon: Sun},
  {mode: 'system', label: 'System', icon: Monitor},
];

export function ThemeToggle({variant = 'icon', className = ''}: ThemeToggleProps) {
  const theme = useThemeStore((state) => state.theme);
  const resolvedTheme = useThemeStore((state) => state.resolvedTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  if (variant === 'segmented') {
    return (
      <div
        className={`flex flex-wrap items-center rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-1 ${className}`}
        role="radiogroup"
        aria-label="Theme preference"
      >
        {themeOptions.map(({mode, label, icon: Icon}) => {
          const selected = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={label}
              onClick={() => setTheme(mode)}
              className={`relative flex min-h-10 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selected
                  ? 'text-[var(--color-accent)]'
                  : 'text-[var(--color-text-3)] hover:text-[var(--color-text-1)]'
              }`}
            >
              {selected ? (
                <motion.span
                  layoutId="active-theme-pill"
                  className="absolute inset-0 rounded-lg border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10"
                  transition={{type: 'spring', stiffness: 400, damping: 30}}
                />
              ) : null}
              <Icon size={14} className="relative z-10" aria-hidden="true" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const targetTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const Icon = resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`icon-button relative h-9 w-9 sm:h-10 sm:w-10 ${className}`}
      aria-label={`Switch to ${targetTheme} mode`}
      title={`Current preference: ${theme}. Switch to ${targetTheme} mode`}
    >
      <motion.span
        initial={false}
        animate={{rotate: resolvedTheme === 'dark' ? 0 : 180}}
        transition={{type: 'spring', stiffness: 300, damping: 20}}
        className="flex items-center justify-center text-cyan-300 light:text-amber-600"
      >
        <Icon size={16} aria-hidden="true" />
      </motion.span>
    </button>
  );
}
