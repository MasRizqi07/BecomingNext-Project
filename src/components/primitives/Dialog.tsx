import {X} from 'lucide-react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useEffect, useId, useRef} from 'react';
import {createPortal} from 'react-dom';
import type {ReactNode} from 'react';

let openDialogCount = 0;
let applicationRootSnapshot: {
  element: HTMLElement;
  inert: boolean;
  ariaHidden: string | null;
} | null = null;

function isolateApplicationRoot() {
  const applicationRoot = document.getElementById('main-content');
  if (!applicationRoot) return;

  if (openDialogCount === 0) {
    applicationRootSnapshot = {
      element: applicationRoot,
      inert: applicationRoot.inert,
      ariaHidden: applicationRoot.getAttribute('aria-hidden'),
    };
  }

  openDialogCount += 1;
  applicationRoot.inert = true;
  applicationRoot.setAttribute('aria-hidden', 'true');
}

function restoreApplicationRoot() {
  openDialogCount = Math.max(0, openDialogCount - 1);
  if (openDialogCount > 0 || !applicationRootSnapshot) return;

  const {element, inert, ariaHidden} = applicationRootSnapshot;
  element.inert = inert;
  if (ariaHidden === null) element.removeAttribute('aria-hidden');
  else element.setAttribute('aria-hidden', ariaHidden);
  applicationRootSnapshot = null;
}

interface DialogProps {
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    isolateApplicationRoot();
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const requestedTarget = initialFocusSelector
        ? dialogRef.current?.querySelector<HTMLElement>(initialFocusSelector)
        : null;
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])',
      );
      (requestedTarget ?? focusable?.[0] ?? dialogRef.current)?.focus();
    }, 50);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      restoreApplicationRoot();
      previousActiveElement?.focus?.();
    };
  }, [initialFocusSelector, isOpen, onClose]);

  const dialog = (
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="none">
          {/* Backdrop */}
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: prefersReducedMotion ? 0 : 0.2}}
            className="fixed inset-0 bg-[#020205]/80 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Dialog Container */}
          <motion.div
            ref={dialogRef}
            role={role}
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby={title ? titleId : labelledBy}
            aria-describedby={description ? descriptionId : describedBy}
            initial={prefersReducedMotion ? false : {opacity: 0, scale: 0.95, y: 10}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.95, y: 10}}
            transition={{duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut'}}
            className={`relative z-10 w-full ${maxWidthClass} glass-panel-strong rounded-3xl border border-white/15 p-6 sm:p-8 shadow-2xl`}
            onClick={(e) => e.stopPropagation()}
          >
            {showCloseButton ? (
              <button
                type="button"
                className="absolute right-5 top-5 rounded-full p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
                onClick={onClose}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            ) : null}

            {title ? (
              <h2
                id={titleId}
                className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {title}
              </h2>
            ) : null}

            {description ? (
              <div id={descriptionId} className="mt-2 text-sm leading-relaxed text-slate-300">
                {description}
              </div>
            ) : null}

            <div className="mt-6">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  return createPortal(dialog, document.body);
}
