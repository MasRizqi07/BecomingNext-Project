import {CheckCircle2, AlertCircle, Info, X} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useEffect} from 'react';

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

export function Toast({toast, onDismiss, duration = 3500}: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, duration);
    return () => clearTimeout(timer);
  }, [toast, onDismiss, duration]);

  if (!toast) return null;

  const Icon = toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;
  const iconColor =
    toast.type === 'error'
      ? 'text-red-400'
      : toast.type === 'info'
        ? 'text-cyan-400'
        : 'text-emerald-400';
  const borderColor =
    toast.type === 'error'
      ? 'border-red-400/30'
      : toast.type === 'info'
        ? 'border-cyan-400/30'
        : 'border-emerald-400/30';

  return (
    <AnimatePresence>
      <div className="fixed bottom-6 right-6 z-100 max-w-sm" role="status" aria-live="polite">
        <motion.div
          initial={{opacity: 0, y: 15, scale: 0.95}}
          animate={{opacity: 1, y: 0, scale: 1}}
          exit={{opacity: 0, y: 15, scale: 0.95}}
          transition={{duration: 0.25, ease: 'easeOut'}}
          className={`flex items-center gap-3 rounded-2xl border ${borderColor} bg-[#090A0F]/95 px-5 py-3.5 shadow-2xl backdrop-blur-xl`}
        >
          <Icon className={`shrink-0 ${iconColor}`} size={18} />
          <span className="text-sm font-normal text-white">{toast.message}</span>
          <button
            type="button"
            className="ml-2 rounded-full p-1 text-white/50 hover:bg-white/10 hover:text-white"
            onClick={onDismiss}
            aria-label="Close notification"
          >
            <X size={14} />
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
