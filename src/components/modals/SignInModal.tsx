import {Lock, Sparkles} from 'lucide-react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {Dialog} from '@/components/primitives/Dialog';
import {useBecomingStore} from '@/store/useBecomingStore';

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessRedirect?: string;
}

export function SignInModal({isOpen, onClose, onSuccessRedirect = '/dashboard'}: SignInModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setAuth = useBecomingStore((state) => state.setAuth);
  const navigate = useNavigate();

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const {signInWithGoogle} = await import('@/lib/firebaseCore');
      const user = await signInWithGoogle();
      setAuth(user);
      onClose();
      navigate(onSuccessRedirect);
    } catch {
      setError('Sign-in was cancelled or could not be completed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-[440px]"
      labelledBy="sign-in-dialog-title"
      describedBy="sign-in-dialog-description"
    >
      <div className="flex flex-col items-center text-center">
        {/* Glow Icon */}
        <div className="glow-effect mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          <Sparkles size={28} />
        </div>

        <h2
          id="sign-in-dialog-title"
          className="font-display text-2xl font-bold tracking-tight text-[var(--color-text-1)] sm:text-3xl"
        >
          Your reflection is private
        </h2>
        <p
          id="sign-in-dialog-description"
          className="mt-3 text-sm leading-relaxed text-[var(--color-text-2)]"
        >
          Sign in to store personal reflections in records that only your authenticated account can
          read through the application.
        </p>

        {error ? (
          <p
            className="mt-4 rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3 text-xs text-[var(--color-danger)]"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {/* Google Sign In Button */}
        <div className="mt-8 w-full">
          <button
            type="button"
            disabled={loading}
            onClick={() => void handleGoogleSignIn()}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-full bg-white font-display text-xs font-bold uppercase tracking-wider text-black transition hover:bg-slate-100 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
            )}
            <span>{loading ? 'Securing session…' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Trust Footnote */}
        <div className="mt-6 flex items-center gap-1.5 text-xs text-[var(--color-text-3)]">
          <Lock size={13} className="text-[var(--color-accent)]" />
          <span>Protected by Auth and App Check • No marketing email</span>
        </div>
      </div>
    </Dialog>
  );
}
