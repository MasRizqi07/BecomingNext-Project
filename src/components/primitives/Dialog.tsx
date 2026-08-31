import {X} from 'lucide-react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useEffect, useRef} from 'react';
import type {ReactNode} from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  maxWidthClass?: string;
  showCloseButton?: boolean;
  role?: 'dialog' | 'alertdialog';
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
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus first focusable element inside modal
    setTimeout(() => {
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable && focusable.length > 0) {
        focusable[0]?.focus();
      }
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousActiveElement?.focus?.();
    };
  }, [isOpen, onClose]);

  return (
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
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
            aria-describedby={description ? 'dialog-description' : undefined}
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
                id="dialog-title"
                className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl"
              >
                {title}
              </h2>
            ) : null}

            {description ? (
              <div id="dialog-description" className="mt-2 text-sm leading-relaxed text-slate-300">
                {description}
              </div>
            ) : null}

            <div className="mt-6">{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
