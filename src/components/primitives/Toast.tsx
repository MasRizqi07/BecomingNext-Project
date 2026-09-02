import {AlertCircle, CheckCircle2, Info, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useCallback, useEffect, useRef} from 'react';
import type {FocusEvent} from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type?: ToastType;
}

interface ToastProps {
  toast: ToastItem | null;
  onDismiss: () => void;
  duration?: number;
}

type PauseReason = 'focus' | 'pointer';

export function Toast({toast, onDismiss, duration = 4000}: ToastProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startedAtRef = useRef(0);
  const remainingTimeRef = useRef(4000);
  const pauseReasonsRef = useRef(new Set<PauseReason>());
  const toastPresentRef = useRef(false);
  const onDismissRef = useRef(onDismiss);
  const effectiveDuration = Number.isFinite(duration) ? Math.max(4000, duration) : 4000;
  const toastId = toast?.id;
  const hasToast = toast !== null;

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  const clearTimer = useCallback(() => {
    if (timerRef.current === null) return;
    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  const dismiss = useCallback(() => {
    if (!toastPresentRef.current) return;
    toastPresentRef.current = false;
    remainingTimeRef.current = 0;
    clearTimer();
    onDismissRef.current();
  }, [clearTimer]);

  const startTimer = useCallback(() => {
    clearTimer();
    if (
      !toastPresentRef.current ||
      pauseReasonsRef.current.size > 0 ||
      remainingTimeRef.current <= 0
    ) {
      return;
    }

    startedAtRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      dismiss();
    }, remainingTimeRef.current);
  }, [clearTimer, dismiss]);

  useEffect(() => {
    toastPresentRef.current = hasToast;
    pauseReasonsRef.current.clear();
    clearTimer();

    if (!hasToast) return;
    remainingTimeRef.current = effectiveDuration;
    startTimer();

    return clearTimer;
  }, [clearTimer, effectiveDuration, hasToast, startTimer, toastId]);

  const pauseTimer = useCallback(
    (reason: PauseReason) => {
      if (pauseReasonsRef.current.has(reason)) return;
      const wasRunning = pauseReasonsRef.current.size === 0 && timerRef.current !== null;
      pauseReasonsRef.current.add(reason);

      if (wasRunning) {
        const elapsed = Date.now() - startedAtRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
        clearTimer();
      }
    },
    [clearTimer],
  );

  const resumeTimer = useCallback(
    (reason: PauseReason) => {
      pauseReasonsRef.current.delete(reason);
      if (pauseReasonsRef.current.size === 0) startTimer();
    },
    [startTimer],
  );

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget && event.currentTarget.contains(event.relatedTarget)) return;
    resumeTimer('focus');
  }

  const isError = toast?.type === 'error';
  const isInfo = toast?.type === 'info';
  const Icon = isError ? AlertCircle : isInfo ? Info : CheckCircle2;
  const iconColor = isError
    ? 'text-[var(--color-danger)]'
    : isInfo
      ? 'text-[var(--color-accent)]'
      : 'text-[var(--color-success)]';
  const borderColor = isError
    ? 'border-[var(--color-danger)]/30'
    : isInfo
      ? 'border-[var(--color-accent)]/30'
      : 'border-[var(--color-success)]/30';

  return (
    <AnimatePresence>
      {toast ? (
        <motion.div
          key={toast.id}
          initial={{opacity: 0, y: 15, scale: 0.95}}
          animate={{opacity: 1, y: 0, scale: 1}}
          exit={{opacity: 0, y: 15, scale: 0.95}}
          transition={{duration: 0.25, ease: 'easeOut'}}
          onMouseEnter={() => pauseTimer('pointer')}
          onMouseLeave={() => resumeTimer('pointer')}
          onFocusCapture={() => pauseTimer('focus')}
          onBlurCapture={handleBlur}
          className={`fixed bottom-6 right-6 z-100 flex max-w-sm items-center gap-3 rounded-2xl border ${borderColor} bg-[var(--color-surface-1)]/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl`}
          role={isError ? 'alert' : 'status'}
          aria-live={isError ? 'assertive' : 'polite'}
        >
          <Icon className={`shrink-0 ${iconColor}`} size={18} aria-hidden="true" />
          <span className="text-sm font-normal text-[var(--color-text-1)]">{toast.message}</span>
          <button
            type="button"
            className="ml-2 rounded-full p-1 text-[var(--color-text-3)] transition hover:bg-white/10 hover:text-[var(--color-text-1)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
            onClick={dismiss}
            aria-label="Close notification"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
