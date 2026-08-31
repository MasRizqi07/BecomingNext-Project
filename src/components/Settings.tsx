import {LogOut, ShieldCheck, Trash2} from 'lucide-react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {AppHeader} from '@/components/AppHeader';
import {signOut} from '@/lib/firebaseCore';
import {formatServiceError} from '@/lib/errors';
import {deleteCurrentUserData} from '@/services/analysisService';
import {useBecomingStore} from '@/store/useBecomingStore';

export function Settings() {
  const user = useBecomingStore((state) => state.user);
  const resetReflection = useBecomingStore((state) => state.resetReflection);
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSignOut() {
    resetReflection();
    await signOut();
    navigate('/');
  }

  async function handleDelete() {
    if (confirmation !== 'DELETE') return;
    setDeleting(true);
    setError(null);
    try {
      await deleteCurrentUserData();
      resetReflection();
      navigate('/');
    } catch (deleteError) {
      setError(formatServiceError(deleteError));
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader backTo="/history" />
      <div className="mx-auto max-w-3xl space-y-8 px-5 pb-24 pt-10 md:px-10">
        <div>
          <p className="mb-3 font-display text-[10px] uppercase tracking-[0.4em] text-cyan-400">
            Account controls
          </p>
          <h1 className="text-4xl font-light tracking-tight md:text-5xl">Privacy and settings</h1>
        </div>

        <section className="glass rounded-3xl p-7 md:p-9" aria-labelledby="account-heading">
          <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/20 text-cyan-400">
            <ShieldCheck size={20} />
          </div>
          <h2 id="account-heading" className="mb-2 font-display text-xl font-semibold">
            Signed-in account
          </h2>
          <p className="mb-7 text-sm text-gray-400">
            {user?.email ?? user?.displayName ?? 'Authenticated user'}
          </p>
          <button className="secondary-button" type="button" onClick={() => void handleSignOut()}>
            <LogOut size={15} /> Sign out
          </button>
        </section>

        <section
          className="rounded-3xl border border-red-400/15 bg-red-950/10 p-7 md:p-9"
          aria-labelledby="delete-heading"
        >
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-red-400/20 text-red-300">
            <Trash2 size={20} />
          </div>
          <h2 id="delete-heading" className="mb-3 font-display text-xl font-semibold">
            Delete account and private data
          </h2>
          <p className="mb-6 text-sm leading-7 text-gray-400">
            This permanently deletes your reflections, analyses, rate-limit record, profile, and
            Firebase Authentication account. This action cannot be undone.
          </p>
          <label
            className="mb-2 block text-xs uppercase tracking-widest text-white/50"
            htmlFor="delete-confirmation"
          >
            Type DELETE to confirm
          </label>
          <input
            id="delete-confirmation"
            className="mb-5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-red-300"
            value={confirmation}
            autoComplete="off"
            onChange={(event) => setConfirmation(event.target.value)}
          />
          {error ? (
            <p className="mb-5 text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <button
            className="inline-flex items-center gap-2 rounded-full bg-red-300 px-6 py-3 font-display text-xs font-bold uppercase tracking-widest text-red-950 disabled:cursor-not-allowed disabled:opacity-40"
            type="button"
            disabled={confirmation !== 'DELETE' || deleting}
            onClick={() => void handleDelete()}
          >
            <Trash2 size={15} /> {deleting ? 'Deleting…' : 'Delete permanently'}
          </button>
        </section>

        <p className="text-xs leading-6 text-white/65">
          Becoming provides reflective prompts and generated guidance. It is not a medical,
          psychological, legal, or financial service. If you are in immediate danger, contact local
          emergency services or a trusted professional.
        </p>
      </div>
    </div>
  );
}
