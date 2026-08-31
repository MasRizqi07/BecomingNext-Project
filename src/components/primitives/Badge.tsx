import type {ReactNode} from 'react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'demo';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function Badge({tone = 'neutral', children, className = '', icon}: BadgeProps) {
  let toneStyles = 'border-white/10 bg-white/5 text-white/70';

  switch (tone) {
    case 'success':
      toneStyles = 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300';
      break;
    case 'warning':
      toneStyles = 'border-amber-400/30 bg-amber-400/10 text-amber-300';
      break;
    case 'danger':
      toneStyles = 'border-red-400/30 bg-red-400/10 text-red-300';
      break;
    case 'info':
      toneStyles = 'border-cyan-400/30 bg-cyan-400/10 text-cyan-300';
      break;
    case 'demo':
      toneStyles =
        'border-cyan-400/40 bg-cyan-400/10 text-cyan-200 shadow-[0_0_12px_rgba(103,232,249,0.15)]';
      break;
    case 'neutral':
      toneStyles = 'border-white/10 bg-white/5 text-white/65';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.2em] ${toneStyles} ${className}`.trim()}
    >
      {icon}
      {children}
    </span>
  );
}
