import {X} from 'lucide-react';
import {useCallback, useEffect, useId, useRef} from 'react';
import type {KeyboardEvent, MouseEvent, ReactNode, SyntheticEvent} from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  maxWidthClass?: string;
  showCloseButton?: boolean;
  role?: 'dialog' | 'alertdialog';
  initialFocusSelector?: string;
  labelledBy?: string;
  describedBy?: string;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidthClass = 'max-w-md',
  showCloseButton = true,
  role = 'dialog',
  initialFocusSelector,
  labelledBy,
  describedBy,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousTriggerRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);
  const titleId = useId();
  const descriptionId = useId();

  const restoreTriggerFocus = useCallback(() => {
    const trigger = previousTriggerRef.current;
    previousTriggerRef.current = null;
    if (!trigger) return;

    queueMicrotask(() => {
      if (document.body.contains(trigger)) trigger.focus();
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (!wasOpenRef.current) {
        previousTriggerRef.current = document.activeElement as HTMLElement | null;
      }
      wasOpenRef.current = true;
      const dialog = dialogRef.current;
      if (dialog && !dialog.open) {
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        } else {
          dialog.setAttribute('open', '');
        }
      }

      if (dialog && initialFocusSelector) {
        try {
          dialog.querySelector<HTMLElement>(initialFocusSelector)?.focus();
        } catch {
          // A bad consumer selector must not break an otherwise usable modal.
        }
      }
    } else if (wasOpenRef.current) {
      wasOpenRef.current = false;
      restoreTriggerFocus();
    }
  }, [initialFocusSelector, isOpen, restoreTriggerFocus]);

  useEffect(() => {
    return () => {
      if (wasOpenRef.current) restoreTriggerFocus();
    };
  }, [restoreTriggerFocus]);

  const handleCancel = (e: SyntheticEvent<HTMLDialogElement, Event>) => {
    e.preventDefault();
    onClose();
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target !== e.currentTarget) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const clickedOutside =
      e.clientX < bounds.left ||
      e.clientX > bounds.right ||
      e.clientY < bounds.top ||
      e.clientY > bounds.bottom;
    if (clickedOutside) {
      onClose();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== 'Tab') return;
    const dialog = event.currentTarget;
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
      (element) => !element.hidden && element.getAttribute('aria-hidden') !== 'true',
    );

    if (focusable.length === 0) {
      event.preventDefault();
      dialog.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !dialog.contains(active))) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
      event.preventDefault();
      first?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      role={role}
      aria-modal="true"
      aria-labelledby={title ? titleId : labelledBy}
      aria-describedby={description ? descriptionId : describedBy}
      onCancel={handleCancel}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
      className={`fixed inset-0 z-50 m-auto ${maxWidthClass} max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] overscroll-contain rounded-3xl border border-[var(--color-border-strong)] bg-[var(--color-surface-1)] p-6 text-[var(--color-text-1)] shadow-2xl backdrop:bg-[var(--color-canvas)]/80 backdrop:backdrop-blur-md open:flex open:flex-col sm:w-full sm:p-8`}
    >
      {showCloseButton ? (
        <button
          type="button"
          className="absolute right-5 top-5 rounded-full p-2 text-[var(--color-text-3)] transition hover:bg-white/10 hover:text-[var(--color-text-1)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={18} aria-hidden="true" />
        </button>
      ) : null}

      {title ? (
        <h2
          id={titleId}
          className="font-display text-xl font-bold tracking-tight text-[var(--color-text-1)] sm:text-2xl"
        >
          {title}
        </h2>
      ) : null}

      {description ? (
        <div id={descriptionId} className="mt-2 text-sm leading-relaxed text-[var(--color-text-2)]">
          {description}
        </div>
      ) : null}

      <div className="mt-6">{children}</div>
    </dialog>
  );
}
