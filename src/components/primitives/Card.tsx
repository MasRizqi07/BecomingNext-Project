import type {HTMLAttributes, KeyboardEvent, MouseEvent, MouseEventHandler, ReactNode} from 'react';

export type CardVariant =
  'surface-card' | 'glass-card' | 'insight-card' | 'status-card' | 'danger-card';

interface CardBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onClick'> {
  variant?: CardVariant;
  children: ReactNode;
  className?: string;
}

export type CardProps = CardBaseProps &
  (
    | {
        interactive: true;
        onClick: MouseEventHandler<HTMLDivElement>;
      }
    | {
        interactive?: false;
        onClick?: MouseEventHandler<HTMLDivElement>;
      }
  );

export function Card({
  variant = 'surface-card',
  interactive = false,
  children,
  className = '',
  onClick,
  onKeyDown,
  onKeyUp,
  role,
  tabIndex,
  ...props
}: CardProps) {
  const isClickable = Boolean(onClick);
  const ariaDisabled = props['aria-disabled'];
  const isDisabled = ariaDisabled === true || ariaDisabled === 'true';
  const resolvedRole = role ?? (isClickable ? 'button' : undefined);

  let variantClass = '';

  switch (variant) {
    case 'surface-card':
      variantClass =
        'bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8 shadow-sm';
      break;
    case 'glass-card':
      variantClass = 'glass rounded-3xl p-6 sm:p-8';
      break;
    case 'insight-card':
      variantClass = 'identity-gradient-border p-6 sm:p-8';
      break;
    case 'status-card':
      variantClass =
        'bg-[var(--color-surface-1)] border border-[var(--color-border)] rounded-2xl p-5 sm:p-6';
      break;
    case 'danger-card':
      variantClass =
        'bg-[var(--color-danger)]/5 border border-[var(--color-danger)]/30 rounded-3xl p-6 sm:p-8 text-[var(--color-text-1)]';
      break;
  }

  const interactiveClass =
    interactive || isClickable
      ? isDisabled
        ? 'cursor-not-allowed opacity-50'
        : 'card-interactive cursor-pointer transition-all duration-300'
      : '';

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    if (isDisabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !isClickable || isDisabled) return;

    if (event.key === 'Enter') {
      event.preventDefault();
      event.currentTarget.click();
    } else if (event.key === ' ') {
      event.preventDefault();
    }
  }

  function handleKeyUp(event: KeyboardEvent<HTMLDivElement>) {
    onKeyUp?.(event);
    if (event.defaultPrevented || !isClickable || isDisabled || event.key !== ' ') return;
    event.preventDefault();
    event.currentTarget.click();
  }

  return (
    <div
      className={`${variantClass} ${interactiveClass} ${className}`.trim()}
      onClick={isClickable ? handleClick : undefined}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
      role={resolvedRole}
      tabIndex={isClickable && tabIndex === undefined ? 0 : tabIndex}
      {...props}
    >
      {children}
    </div>
  );
}
