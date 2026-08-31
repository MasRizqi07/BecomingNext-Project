import {Moon, Sun, Monitor} from 'lucide-react';
import {motion} from 'motion/react';
import {useThemeStore, type ThemeMode} from '@/store/useThemeStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  className?: string;
}

export function ThemeToggle({variant = 'icon', className = ''}: ThemeToggleProps) {
  const {theme, resolvedTheme, setTheme, toggleTheme} = useThemeStore();

  if (variant === 'segmented') {
    const modes: {mode: ThemeMode; label: string; icon: typeof Sun}[] = [
      {mode: 'dark', label: 'Dark', icon: Moon},
      {mode: 'light', label: 'Light', icon: Sun},
      {mode: 'system', label: 'System', icon: Monitor},
    ];

    return (
      <div
        className={`flex items-center rounded-xl p-1 bg-white/5 border border-white/10 dark:bg-white/5 light:bg-black/5 light:border-black/10 ${className}`}
        role="radiogroup"
        aria-label="Select theme appearance"
      >
        {modes.map(({mode, label, icon: Icon}) => {
          const isSelected = theme === mode;
          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setTheme(mode)}
              className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'text-cyan-300 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900'
              }`}
            >
              {isSelected ? (
                <motion.div
                  layoutId="active-theme-pill"
                  className="absolute inset-0 rounded-lg bg-cyan-400/15 border border-cyan-400/30"
                  transition={{type: 'spring', stiffness: 400, damping: 30}}
                />
              ) : null}
              <Icon size={14} className="relative z-10" />
              <span className="relative z-10">{label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md transition-all hover:border-cyan-400/40 hover:bg-white/10 dark:border-white/10 dark:bg-white/5 light:border-black/10 light:bg-black/5 active:scale-95 ${className}`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        initial={false}
        animate={{
          rotate: isDark ? 0 : 180,
          scale: 1,
        }}
        transition={{type: 'spring', stiffness: 300, damping: 20}}
        className="flex items-center justify-center text-cyan-300 light:text-amber-500"
      >
        {isDark ? <Moon size={16} /> : <Sun size={16} />}
      </motion.div>
    </button>
  );
}

