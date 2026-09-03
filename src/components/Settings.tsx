import {
  AlertTriangle,
  Eye,
  LogOut,
  Shield,
  ShieldCheck,
  Trash2,
  User as UserIcon,
} from 'lucide-react';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {AppHeader} from '@/components/AppHeader';
import {DeleteAccountModal} from '@/components/modals/DeleteAccountModal';
import {Card} from '@/components/primitives/Card';
import {ThemeToggle} from '@/components/primitives/ThemeToggle';
import {Toast, type ToastItem} from '@/components/primitives/Toast';
import {formatServiceError} from '@/lib/errors';
import {deleteCurrentUserData} from '@/services/analysisService';
import {useBecomingStore} from '@/store/useBecomingStore';

export function Settings() {
  const user = useBecomingStore((state) => state.user);
  const resetReflection = useBecomingStore((state) => state.resetReflection);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);
  const navigate = useNavigate();

  async function handleSignOut() {
    resetReflection();
    const {signOut} = await import('@/lib/firebaseCore');
    await signOut();
    navigate('/');
  }

  async function handleConfirmDeleteAccount() {
    try {
      await deleteCurrentUserData();
      resetReflection();
      navigate('/');
    } catch (err) {
      setToast({id: 'del-acc-err', message: formatServiceError(err), type: 'error'});
      throw err;
    }
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <AppHeader backTo="/dashboard" />

      <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-10 sm:px-8 md:py-16 flex flex-col gap-10">
        {/* Header */}
        <div className="space-y-2 border-b border-[var(--color-border)] pb-8">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Account & Security
          </span>
          <h1 className="font-display text-3xl font-light tracking-tight sm:text-5xl text-[var(--color-text-1)]">
            Settings & Privacy
          </h1>
          <p className="text-sm font-light text-[var(--color-text-3)]">
            Manage your presence, preferences, and data ownership within the sanctuary.
          </p>
        </div>

        {/* Section 1: Account Identity */}
        <Card variant="glass-card" className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <UserIcon className="text-[var(--color-accent)]" size={20} />
            <h2 className="font-display text-lg font-bold text-[var(--color-text-1)]">
              Account Identity
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-[var(--color-border)] pt-5">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="h-14 w-14 rounded-full border border-[var(--color-border-strong)] object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 font-display text-lg font-bold text-[var(--color-accent)]">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div>
                <h3 className="font-display text-base font-bold text-[var(--color-text-1)]">
                  {user?.displayName ?? 'Anonymous Reflector'}
                </h3>
                <p className="text-xs text-[var(--color-text-3)]">
                  {user?.email ?? 'Google Authenticated'}
                </p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-[var(--color-success)]">
                  <ShieldCheck size={12} /> Active Session Verified
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => void handleSignOut()}
              className="secondary-button text-xs"
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </Card>

        {/* Section 2: Appearance & Theme Mode */}
        <Card variant="glass-card" className="space-y-6 p-6 sm:p-8">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-[var(--color-text-1)]">
              Appearance & Theme
            </h2>
            <p className="text-xs text-[var(--color-text-3)]">
              Choose Cinematic Dark, Pristine Light, or follow your operating-system preference.
              Your choice is stored only in this browser.
            </p>
          </div>

          <div className="border-t border-[var(--color-border)] pt-5">
            <ThemeToggle variant="segmented" />
          </div>
        </Card>

        {/* Section 3: Privacy Shortcuts & Boundaries */}
        <Card variant="glass-card" className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="text-[var(--color-violet)]" size={20} />
            <h2 className="font-display text-lg font-bold text-[var(--color-text-1)]">
              Data Boundaries
            </h2>
          </div>

          <p className="text-xs leading-relaxed text-[var(--color-text-2)]">
            Becoming stores reflection answers in owner-isolated Cloud Firestore records with direct
            client writes disabled. Raw answers are not placed in public pages or used to train an
            application-owned model.
          </p>

          <div className="pt-2">
            <Link to="/privacy" className="secondary-button text-xs">
              <Eye size={14} /> View Full Privacy & AI Boundaries
            </Link>
          </div>
        </Card>

        {/* Section 4: Danger Zone */}
        <Card variant="danger-card" className="p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-[var(--color-danger)]" size={20} />
            <h2 className="font-display text-lg font-bold text-[var(--color-danger)]">
              Danger Zone
            </h2>
          </div>

          <p className="text-xs leading-relaxed text-[var(--color-text-2)]">
            Permanently delete your account and all associated reflections, trajectory analysis
            records, habit check-ins, and user profile data. This cannot be undone.
          </p>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="danger-button text-xs"
          >
            <Trash2 size={14} /> Delete Account Permanently
          </button>
        </Card>

        {/* Legal / Non-Medical Disclaimer */}
        <p className="text-xs leading-relaxed text-[var(--color-text-3)]">
          Becoming provides editorial prompts and illustrative AI trajectory guidance. It is not a
          clinical mental health, medical, psychological, legal, or financial service. If you are in
          crisis, please seek professional support.
        </p>
      </main>

      <DeleteAccountModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteAccount}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
