import {Edit3} from 'lucide-react';

import {Dialog} from '@/components/primitives/Dialog';

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLeave: () => void;
}

export function UnsavedChangesDialog({isOpen, onClose, onConfirmLeave}: UnsavedChangesDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-[420px]"
      role="alertdialog"
      labelledBy="unsaved-changes-dialog-title"
      describedBy="unsaved-changes-dialog-description"
      initialFocusSelector="[data-dialog-initial]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 text-[var(--color-warning)]">
          <Edit3 size={22} />
        </div>

        <h2
          id="unsaved-changes-dialog-title"
          className="font-display text-xl font-bold tracking-tight text-[var(--color-text-1)]"
        >
          Unsaved Changes
        </h2>
        <p
          id="unsaved-changes-dialog-description"
          className="mt-2 text-sm leading-relaxed text-[var(--color-text-2)]"
        >
          You have reflection answers that haven't been submitted into an analysis yet.
        </p>

        <div className="mt-8 flex w-full flex-col gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="primary-button w-full"
            data-dialog-initial
          >
            Keep Reflecting
          </button>
          <button
            type="button"
            onClick={onConfirmLeave}
            className="ghost-button w-full text-[var(--color-text-3)] hover:text-[var(--color-text-1)]"
          >
            Leave Without Submitting
          </button>
        </div>
      </div>
    </Dialog>
  );
}
