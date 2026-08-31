import type {ButtonHTMLAttributes, ReactNode} from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon' | 'pill';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = 'primary',
  loading = false,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
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
    case 'pill':
      baseClass =
        'inline-flex min-h-9 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80 transition hover:border-cyan-400/40 hover:bg-white/10 hover:text-white disabled:opacity-40';
      break;
  }

  return (
    <button
      className={`${baseClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span
            className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent"
            aria-hidden="true"
          />
          <span>{loadingText ?? children}</span>
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
