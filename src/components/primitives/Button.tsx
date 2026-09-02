import type {ButtonHTMLAttributes, ReactNode} from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'link' | 'pill';

interface BaseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export type ButtonProps =
  | (BaseButtonProps & {
      variant: 'icon';
      'aria-label': string;
    })
  | (BaseButtonProps & {
      variant?: Exclude<ButtonVariant, 'icon'>;
      'aria-label'?: string;
    });

export function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
  type = 'button',
  ...props
}: ButtonProps) {
  let baseClass = '';

  switch (variant) {
    case 'primary':
      baseClass = 'primary-button';
      break;
    case 'secondary':
      baseClass = 'secondary-button';
      break;
    case 'ghost':
      baseClass = 'ghost-button';
      break;
    case 'danger':
      baseClass = 'danger-button';
      break;
    case 'icon':
      baseClass = 'icon-button';
      break;
    case 'link':
      baseClass =
        'inline-flex items-center gap-1.5 p-0 font-sans text-sm font-medium text-[var(--color-accent)] underline-offset-4 hover:underline hover:text-cyan-200 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline';
      break;
    case 'pill':
      baseClass =
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white disabled:opacity-40';
      break;
  }

  const workLabel = loadingText ?? (typeof children === 'string' ? children : 'Working...');

  return (
    <button
      {...props}
      type={type}
      className={`${baseClass} ${className}`.trim()}
      disabled={disabled || loading}
      aria-busy={loading ? true : undefined}
    >
      {loading ? (
        <>
          <span
            className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
          {variant !== 'icon' ? <span>{workLabel}</span> : null}
        </>
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}
