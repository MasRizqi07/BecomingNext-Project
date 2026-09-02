import {motion, useReducedMotion} from 'motion/react';

interface OrbVisualizerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function OrbVisualizer({size = 'md', className = ''}: OrbVisualizerProps) {
  const prefersReducedMotion = useReducedMotion();

  const dimensionClass =
    size === 'sm'
      ? 'w-24 h-24'
      : size === 'lg'
        ? 'w-64 h-64 md:w-80 md:h-80'
        : 'w-40 h-40 md:w-48 md:h-48';

  if (prefersReducedMotion) {
    return (
      <div
        className={`relative mx-auto flex items-center justify-center ${dimensionClass} ${className}`}
      >
        <div className="h-full w-full rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="absolute h-1/2 w-1/2 rounded-full bg-violet-400/30 blur-xl" />
      </div>
    );
  }

  return (
    <div
      className={`relative mx-auto flex items-center justify-center ${dimensionClass} ${className}`}
    >
      {/* Outer rotating cyan ring */}
      <motion.div
        className="absolute inset-0 rounded-full border border-cyan-400/25"
        animate={{rotate: 360}}
        transition={{duration: 18, repeat: Infinity, ease: 'linear'}}
      />

      {/* Middle rotating violet ring */}
      <motion.div
        className="absolute inset-4 rounded-full border border-violet-400/20"
        animate={{rotate: -360}}
        transition={{duration: 24, repeat: Infinity, ease: 'linear'}}
      />

      {/* Breathing glow core */}
      <motion.div
        className="absolute inset-8 rounded-full bg-radial from-cyan-400/30 via-violet-500/20 to-transparent blur-xl"
        animate={{
          scale: [0.9, 1.1, 0.9],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Inner luminous dot */}
      <div className="h-3 w-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_15px_var(--color-accent)]" />
    </div>
  );
}
