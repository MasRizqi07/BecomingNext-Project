import {ArrowRight, Eye, LockKeyhole, Sparkles} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {useBecomingStore} from '@/store/useBecomingStore';

export function Landing() {
  const {user, authReady, setAuth} = useBecomingStore();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  async function handleStart() {
    if (user) {
      navigate('/reflect');
      return;
    }

    setError(null);
    setIsSigningIn(true);
    try {
      const {signInWithGoogle} = await import('@/lib/firebaseCore');
      const signedInUser = await signInWithGoogle();
      setAuth(signedInUser);
      navigate('/reflect');
    } catch {
      setError('Sign-in was not completed. Check the popup and try again.');
    } finally {
      setIsSigningIn(false);
    }
  }

  return (
    <div className="relative">
      <nav className="absolute left-0 top-0 z-40 flex w-full items-center justify-between px-5 py-7 md:px-12">
        <Link className="flex items-center gap-2" to="/" aria-label="Becoming home">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.4em]">
            Becoming.
          </span>
        </Link>
        <div className="flex items-center gap-4 md:gap-8">
          <a className="nav-link hidden sm:block" href="#philosophy">
            Philosophy
          </a>
          {user ? (
            <Link className="nav-link hidden sm:block" to="/history">
              History
            </Link>
          ) : null}
          <button className="secondary-button px-5 py-2" type="button" onClick={handleStart}>
            {user ? 'Continue' : 'Sign in'}
          </button>
        </div>
      </nav>

      <section className="flex min-h-screen items-center justify-center px-5 pb-16 pt-28 text-center">
        <motion.div
          initial={prefersReducedMotion ? false : {opacity: 0, y: 18}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: prefersReducedMotion ? 0 : 0.8}}
          className="max-w-5xl"
        >
          <p className="mb-8 font-display text-[10px] font-medium uppercase tracking-[0.5em] text-cyan-400">
            Private future reflection
          </p>
          <h1 className="mb-9 text-5xl font-extralight leading-[0.95] tracking-tighter sm:text-6xl md:text-8xl">
            The future version
            <br />
            <span className="font-serif italic text-white/80">of you is listening.</span>
          </h1>
          <p className="mx-auto mb-12 max-w-xl text-sm font-light leading-7 text-gray-400 md:text-base">
            Turn honest reflection into two plausible paths and a small, practical roadmap. The
            result is guidance—not destiny, diagnosis, or a scientific score.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              className="primary-button min-w-55"
              type="button"
              disabled={!authReady || isSigningIn}
              onClick={handleStart}
            >
              <span>
                {isSigningIn
                  ? 'Opening secure sign-in…'
                  : user
                    ? 'Continue reflection'
                    : 'Start securely'}
              </span>
              <ArrowRight size={15} />
            </button>
            <Link className="secondary-button min-w-55" to="/demo">
              <Eye size={15} /> View a safe demo
            </Link>
          </div>
          {error ? (
            <p className="mx-auto mt-6 max-w-md text-sm text-red-300" role="alert">
              {error}
            </p>
          ) : null}
          <p className="mt-8 flex items-center justify-center gap-2 text-xs text-white/65">
            <LockKeyhole size={13} /> Personalized analysis requires authentication and App Check.
          </p>
        </motion.div>
      </section>

      <section
        id="philosophy"
        className="mx-auto grid max-w-6xl gap-5 px-5 py-24 md:grid-cols-3 md:px-10"
      >
        {[
          ['Reflect honestly', 'Eight focused prompts turn vague pressure into concrete patterns.'],
          ['See two paths', 'Compare what may happen if patterns drift or become intentional.'],
          ['Act in small steps', 'Leave with habits and learning actions sized for real life.'],
        ].map(([title, copy], index) => (
          <article className="glass rounded-3xl p-8" key={title}>
            <span className="mb-6 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 text-cyan-400">
              {index === 0 ? <Sparkles size={17} /> : `0${index + 1}`}
            </span>
            <h2 className="mb-3 font-display text-lg font-semibold">{title}</h2>
            <p className="text-sm font-light leading-7 text-gray-400">{copy}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
