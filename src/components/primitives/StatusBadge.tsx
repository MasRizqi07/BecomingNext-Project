import {CheckCircle2, Loader2, AlertTriangle} from 'lucide-react';
import type {HTMLAttributes, ReactNode} from 'react';

export type StatusType = 'pending' | 'completed' | 'failed';

const STATUS_CONFIG: Record<
  StatusType,
  {
    label: string;
    icon: typeof CheckCircle2;
    className: string;
    iconClass: string;
  }
> = {
  pending: {
    label: 'In progress',
    icon: Loader2,
    className:
      'border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
    iconClass: 'animate-spin text-[var(--color-warning)]',
  },
  completed: {
    label: 'Ready',
    icon: CheckCircle2,
    className:
      'border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]',
    iconClass: 'text-[var(--color-success)]',
  },
  failed: {
    label: 'Needs attention',
    icon: AlertTriangle,
    className:
      'border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
    iconClass: 'text-[var(--color-danger)]',
  },
};

export interface StatusBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  status: StatusType;
  className?: string;
  customLabel?: string;
  icon?: ReactNode;
}

export function StatusBadge({
  status,
  className = '',
  customLabel,
  icon,
  ...props
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const DefaultIcon = config.icon;
  const displayLabel = customLabel ?? config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-display text-[10px] font-semibold uppercase tracking-[0.2em] ${config.className} ${className}`.trim()}
      {...props}
    >
      {icon ?? <DefaultIcon size={12} className={config.iconClass} aria-hidden="true" />}
      <span>{displayLabel}</span>
    </span>
  );
}
