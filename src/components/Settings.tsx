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
        <div className="space-y-2 border-b border-white/8 pb-8">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400">
            Account & Security
          </span>
          <h1 className="font-display text-3xl font-light tracking-tight sm:text-5xl text-white">
            Settings & Privacy
          </h1>
          <p className="text-sm font-light text-slate-400">
            Manage your presence, preferences, and data ownership within the sanctuary.
          </p>
        </div>

        {/* Section 1: Account Identity */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3">
            <UserIcon className="text-cyan-400" size={20} />
            <h2 className="font-display text-lg font-bold text-white">Account Identity</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-t border-white/5 pt-5">
            <div className="flex items-center gap-4">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="h-14 w-14 rounded-full border border-white/20 object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 font-display text-lg font-bold text-cyan-300">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}

              <div>
                <h3 className="font-display text-base font-bold text-white">
                  {user?.displayName ?? 'Anonymous Reflector'}
                </h3>
                <p className="text-xs text-slate-400">{user?.email ?? 'Google Authenticated'}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-emerald-400">
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
        </section>

        {/* Section 2: Appearance & Theme Mode */}
        <section className="glass-panel space-y-6 rounded-3xl p-6 sm:p-8">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-bold text-white light:text-slate-950">
              Appearance & Theme
            </h2>
            <p className="text-xs text-slate-400 light:text-slate-600">
              Choose Cinematic Dark, Pristine Light, or follow your operating-system preference.
              Your choice is stored only in this browser.
            </p>
          </div>

          <div className="border-t border-white/5 pt-5 light:border-black/10">
            <ThemeToggle variant="segmented" />
          </div>
        </section>

        {/* Section 3: Privacy Shortcuts & Boundaries */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <Shield className="text-violet-400" size={20} />
            <h2 className="font-display text-lg font-bold text-white">Data Boundaries</h2>
          </div>

          <p className="text-xs leading-relaxed text-slate-300">
            Becoming stores reflection answers in owner-isolated Cloud Firestore records with direct
            client writes disabled. Raw answers are not placed in public pages or used to train an
            application-owned model.
          </p>

          <div className="pt-2">
            <Link to="/privacy" className="secondary-button text-xs">
              <Eye size={14} /> View Full Privacy & AI Boundaries
            </Link>
          </div>
        </section>

        {/* Section 4: Danger Zone */}
        <section className="rounded-3xl border border-red-400/25 bg-red-950/15 p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-400" size={20} />
            <h2 className="font-display text-lg font-bold text-red-200">Danger Zone</h2>
          </div>

          <p className="text-xs leading-relaxed text-slate-300">
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
        </section>

        {/* Legal / Non-Medical Disclaimer */}
        <p className="text-xs leading-relaxed text-slate-400 light:text-slate-600">
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
