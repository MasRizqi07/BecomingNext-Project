import {render, screen, fireEvent} from '@testing-library/react';
import {describe, it, expect, vi} from 'vitest';
import {MemoryRouter} from 'react-router-dom';
import {SignInModal} from './SignInModal';
import {DeleteAccountModal} from './DeleteAccountModal';
import {DeleteAnalysisDialog} from './DeleteAnalysisDialog';
import {ShareSummaryModal} from './ShareSummaryModal';
import {UnsavedChangesDialog} from './UnsavedChangesDialog';
import {DEMO_ANALYSIS} from '@/data/demoAnalysis';

describe('Modals', () => {
  it('renders SignInModal', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <SignInModal isOpen={true} onClose={onClose} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Your reflection is private')).toBeDefined();
    expect(screen.getByRole('button', {name: /continue with google/i})).toBeDefined();
  });

  it('renders DeleteAccountModal and requires DELETE text confirmation', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <DeleteAccountModal isOpen={true} onClose={onClose} onConfirm={onConfirm} />
      </MemoryRouter>,
    );

    const deleteBtn = screen.getByRole('button', {name: /delete forever/i});
    expect(deleteBtn).toBeDisabled();

    const input = screen.getByPlaceholderText('DELETE');
    fireEvent.change(input, {target: {value: 'DELETE'}});
    expect(deleteBtn).not.toBeDisabled();

    fireEvent.click(deleteBtn);
    expect(onConfirm).toHaveBeenCalled();
  });

  it('renders ShareSummaryModal', () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <ShareSummaryModal isOpen={true} onClose={onClose} analysis={DEMO_ANALYSIS} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', {name: /share reflection summary/i})).toBeDefined();
    expect(screen.getByRole('button', {name: /copy summary/i})).toBeDefined();
  });

  it('uses a scoped confirmation for deleting one analysis', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <MemoryRouter>
        <DeleteAnalysisDialog isOpen={true} onClose={onClose} onConfirm={onConfirm} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', {name: /delete this analysis/i})).toBeDefined();
    expect(screen.getByText(/account and other reflections remain untouched/i)).toBeDefined();
    fireEvent.click(screen.getByRole('button', {name: /^delete analysis$/i}));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('renders UnsavedChangesDialog', () => {
    const onClose = vi.fn();
    const onConfirmLeave = vi.fn();
    render(
      <MemoryRouter>
        <UnsavedChangesDialog isOpen={true} onClose={onClose} onConfirmLeave={onConfirmLeave} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Unsaved Changes')).toBeDefined();
    fireEvent.click(screen.getByRole('button', {name: /keep reflecting/i}));
    expect(onClose).toHaveBeenCalled();
  });
});
