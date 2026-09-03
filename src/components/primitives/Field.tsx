import {useId, useRef, useState} from 'react';
import type {
  ChangeEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

export interface FieldBaseProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  id?: string;
  className?: string;
  labelClassName?: string;
  required?: boolean;
}

export interface InputFieldProps
  extends
    FieldBaseProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'required'> {
  type?: string;
}

export interface TextareaFieldProps
  extends
    FieldBaseProps,
    Omit<
      TextareaHTMLAttributes<HTMLTextAreaElement>,
      'id' | 'className' | 'required' | 'maxLength'
    > {
  showCounter?: boolean;
  maxLength?: number;
  ref?: React.Ref<HTMLTextAreaElement>;
}

export interface ScoreOption {
  value: number | string;
  label?: string;
  ariaLabel?: string;
}

export interface ScoreFieldProps extends FieldBaseProps {
  value?: number | string;
  onChange: (value: number | string) => void;
  options?: ScoreOption[];
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * Standard text/email/number Input with outside label and combined aria-describedby
 */
export function InputField({
  label,
  hint,
  error,
  id: explicitId,
  className = '',
  labelClassName = '',
  required,
  type = 'text',
  ...inputProps
}: InputFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <label
        htmlFor={id}
        className={
          labelClassName ||
          'font-display text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)]'
        }
      >
        {label}
        {required ? (
          <span className="ml-1 text-[var(--color-accent)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>

      {hint ? (
        <p id={hintId} className="text-xs text-[var(--color-text-3)] leading-relaxed">
          {hint}
        </p>
      ) : null}

      <input
        {...inputProps}
        id={id}
        type={type}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`w-full rounded-2xl border bg-[var(--color-surface-2)] px-4 py-3 text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)]/60 transition focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:border-transparent ${
          error
            ? 'border-[var(--color-danger)]/60'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
        }`}
      />

      {error ? (
        <p
          id={errorId}
          className="text-xs font-medium text-[var(--color-danger)] leading-relaxed"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Textarea with minimum 144px height, vertical resize, and optional character counter
 */
export function TextareaField({
  label,
  hint,
  error,
  id: explicitId,
  className = '',
  labelClassName = '',
  required,
  maxLength,
  showCounter = Boolean(maxLength),
  value,
  onChange,
  ref,
  ...textareaProps
}: TextareaFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const [uncontrolledLength, setUncontrolledLength] = useState(() =>
    textareaProps.defaultValue === undefined ? 0 : String(textareaProps.defaultValue).length,
  );
  const currentLength = value === undefined ? uncontrolledLength : String(value).length;
  const isApproachingLimit = maxLength ? currentLength / maxLength >= 0.9 : false;

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    if (value === undefined) setUncontrolledLength(event.target.value.length);
    onChange?.(event);
  }

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className={
            labelClassName ||
            'font-display text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)]'
          }
        >
          {label}
          {required ? (
            <span className="ml-1 text-[var(--color-accent)]" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>

        {showCounter && maxLength ? (
          <span
            className={`text-[11px] font-mono transition-colors ${
              isApproachingLimit
                ? 'text-[var(--color-warning)] font-semibold'
                : 'text-[var(--color-text-3)]'
            }`}
            aria-live="polite"
          >
            {currentLength}/{maxLength}
          </span>
        ) : null}
      </div>

      {hint ? (
        <p id={hintId} className="text-xs text-[var(--color-text-3)] leading-relaxed">
          {hint}
        </p>
      ) : null}

      <textarea
        {...textareaProps}
        ref={ref}
        id={id}
        value={value}
        onChange={handleChange}
        maxLength={maxLength}
        required={required}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        className={`w-full min-h-[144px] resize-y rounded-2xl border bg-[var(--color-surface-2)] p-4 text-sm leading-relaxed text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)]/60 transition focus-visible:outline-2 focus-visible:outline-[var(--color-accent)] focus-visible:border-transparent ${
          error
            ? 'border-[var(--color-danger)]/60'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
        }`}
      />

      {error ? (
        <p
          id={errorId}
          className="text-xs font-medium text-[var(--color-danger)] leading-relaxed"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Score / Segmented rating selector with 44x44px minimum tap targets and arrow key navigation
 */
export function ScoreField({
  label,
  hint,
  error,
  id: explicitId,
  value,
  onChange,
  options,
  min = 1,
  max = 10,
  disabled = false,
  className = '',
  labelClassName = '',
  required,
}: ScoreFieldProps) {
  const generatedId = useId();
  const id = explicitId ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const scoreOptions: ScoreOption[] =
    options ??
    Array.from({length: max - min + 1}, (_, i) => {
      const val = min + i;
      return {value: val, label: String(val), ariaLabel: `Score ${val} of ${max}`};
    });

  const describedBy =
    [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(' ') || undefined;

  const selectOption = (index: number) => {
    const targetOption = scoreOptions[index];
    if (!targetOption) return;
    onChange(targetOption.value);
    inputRefs.current[index]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, focusedIndex: number) => {
    if (disabled || scoreOptions.length === 0) return;
    const selectedIndex = scoreOptions.findIndex((opt) => opt.value === value);
    const currentIndex = selectedIndex >= 0 ? selectedIndex : focusedIndex;
    let targetIndex: number | undefined;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = currentIndex < scoreOptions.length - 1 ? currentIndex + 1 : 0;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = currentIndex > 0 ? currentIndex - 1 : scoreOptions.length - 1;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = scoreOptions.length - 1;
    }

    if (targetIndex === undefined) return;
    e.preventDefault();
    selectOption(targetIndex);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      <span
        id={`${id}-label`}
        className={
          labelClassName ||
          'font-display text-xs font-semibold uppercase tracking-wider text-[var(--color-text-2)]'
        }
      >
        {label}
        {required ? (
          <span className="ml-1 text-[var(--color-accent)]" aria-hidden="true">
            *
          </span>
        ) : null}
      </span>

      {hint ? (
        <p id={hintId} className="text-xs text-[var(--color-text-3)] leading-relaxed">
          {hint}
        </p>
      ) : null}

      <div
        role="radiogroup"
        aria-labelledby={`${id}-label`}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        aria-required={required || undefined}
        className="flex flex-wrap gap-2 pt-1"
      >
        {scoreOptions.map((opt, index) => {
          const isSelected = value === opt.value;
          return (
            <label
              key={String(opt.value)}
              className={`relative flex min-h-[44px] min-w-[44px] cursor-pointer select-none items-center justify-center rounded-xl border text-sm font-semibold transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-accent)] ${
                isSelected
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent)] text-black shadow-[0_0_16px_rgba(103,232,249,0.35)]'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-2)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-3)]'
              } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              <input
                type="radio"
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                name={id}
                value={String(opt.value)}
                checked={isSelected}
                disabled={disabled}
                required={required}
                onChange={() => onChange(opt.value)}
                onKeyDown={(event) => handleKeyDown(event, index)}
                aria-label={opt.ariaLabel ?? opt.label ?? String(opt.value)}
                className="sr-only"
              />
              <span>{opt.label ?? opt.value}</span>
            </label>
          );
        })}
      </div>

      {error ? (
        <p
          id={errorId}
          className="text-xs font-medium text-[var(--color-danger)] leading-relaxed"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
