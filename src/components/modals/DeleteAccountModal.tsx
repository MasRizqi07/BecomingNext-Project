import {AlertTriangle, Trash2} from 'lucide-react';
import {useState} from 'react';

import {Dialog} from '@/components/primitives/Dialog';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountModal({isOpen, onClose, onConfirm}: DeleteAccountModalProps) {
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmationText === 'DELETE';

  function handleClose() {
    if (isDeleting) return;
    setConfirmationText('');
    setError(null);
    onClose();
  }

  async function handleDelete() {
    if (!canDelete || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirm();
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deletion failed. Try again.');
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      maxWidthClass="max-w-[460px]"
      role="alertdialog"
      labelledBy="delete-account-dialog-title"
      describedBy="delete-account-dialog-description"
      initialFocusSelector="[data-dialog-initial]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
          <AlertTriangle size={26} />
        </div>

        <h2
          id="delete-account-dialog-title"
          className="font-display text-xl font-bold tracking-tight text-[var(--color-text-1)] sm:text-2xl"
        >
          Permanently Delete Account?
        </h2>
        <p
          id="delete-account-dialog-description"
          className="mt-3 text-sm leading-relaxed text-[var(--color-text-2)]"
        >
          This action <strong className="text-[var(--color-danger)]">cannot be undone</strong>. All
          your reflections, generated analyses, habit check-ins, and user profile data will be
          permanently wiped. A server-only anti-replay marker containing only a one-way hash of your
          account ID and deletion timestamps expires after 24 hours; it contains no profile,
          reflection, or analysis content and is then eligible for automatic TTL cleanup.
        </p>

        <div className="mt-6 w-full text-left">
          <label
            htmlFor="delete-confirm-input"
            className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-text-3)]"
          >
            Type <span className="font-mono text-[var(--color-danger)]">DELETE</span> to confirm
          </label>
          <input
            id="delete-confirm-input"
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            placeholder="DELETE"
            className="mt-2 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-4 py-2.5 text-sm text-[var(--color-text-1)] placeholder:text-[var(--color-text-3)] outline-none focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/20"
          />
        </div>

        {error ? (
          <p
            className="mt-3 w-full rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-2 text-xs text-[var(--color-danger)]"
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
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={!canDelete || isDeleting}
            className="danger-button flex-1"
          >
            <Trash2 size={15} />
            <span>{isDeleting ? 'Deleting data…' : 'Delete Forever'}</span>
          </button>
        </div>
      </div>
    </Dialog>
  );
}
