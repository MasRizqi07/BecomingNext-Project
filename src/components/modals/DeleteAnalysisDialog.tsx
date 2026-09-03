import {AlertTriangle, Trash2} from 'lucide-react';
import {useState} from 'react';

import {Dialog} from '@/components/primitives/Dialog';

interface DeleteAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAnalysisDialog({isOpen, onClose, onConfirm}: DeleteAnalysisDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClose() {
    if (isDeleting) return;
    setError(null);
    onClose();
  }

  async function handleDelete() {
    if (isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      handleClose();
    } catch (deleteError: unknown) {
      setError(deleteError instanceof Error ? deleteError.message : 'Deletion failed. Try again.');
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      maxWidthClass="max-w-[460px]"
      role="alertdialog"
      labelledBy="delete-analysis-dialog-title"
      describedBy="delete-analysis-dialog-description"
      initialFocusSelector="[data-dialog-initial]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
          <AlertTriangle size={26} />
        </div>

        <h2
          id="delete-analysis-dialog-title"
          className="font-display text-xl font-bold tracking-tight text-[var(--color-text-1)] sm:text-2xl"
        >
          Delete This Analysis?
        </h2>
        <p
          id="delete-analysis-dialog-description"
          className="mt-3 text-sm leading-relaxed text-[var(--color-text-2)]"
        >
          This permanently removes this reflection, generated analysis, and its related check-ins.
          Your account and other reflections remain untouched.
        </p>

        {error ? (
          <p
            className="mt-4 w-full rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-2 text-xs text-[var(--color-danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex w-full flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleClose}
            className="secondary-button flex-1"
            disabled={isDeleting}
            data-dialog-initial
          >
            Keep Analysis
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={isDeleting}
            className="danger-button flex-1"
          >
            <Trash2 size={15} />
            <span>{isDeleting ? 'Deleting…' : 'Delete Analysis'}</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
