import type {ReactNode} from 'react';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'demo';

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
}

export function Badge({tone = 'neutral', children, className = '', icon}: BadgeProps) {
  let toneStyles =
    'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]';

  switch (tone) {
    case 'success':
      toneStyles =
        'border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]';
      break;
    case 'warning':
      toneStyles =
        'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]';
      break;
    case 'danger':
      toneStyles =
        'border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]';
      break;
    case 'info':
      toneStyles =
        'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]';
      break;
    case 'demo':
      toneStyles =
        'border-[var(--color-accent)]/40 bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-[0_0_12px_rgba(103,232,249,0.15)]';
      break;
    case 'neutral':
      toneStyles =
        'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)]';
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
