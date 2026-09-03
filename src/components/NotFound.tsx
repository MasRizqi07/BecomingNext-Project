import {ArrowRight, Home, LayoutDashboard} from 'lucide-react';
import {Link} from 'react-router-dom';

import {useBecomingStore} from '@/store/useBecomingStore';

export function NotFound() {
  const user = useBecomingStore((state) => state.user);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden transition-colors px-5 py-16 text-center">
      {/* Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-[140px]" />

      <main className="relative z-10 mx-auto flex max-w-xl flex-col items-center">
        <h1 className="glow-cyan font-serif text-8xl font-normal italic tracking-tight text-[var(--color-text-1)] sm:text-9xl">
          404
        </h1>

        <h2 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          This path does not exist.
        </h2>

        <p className="mt-3 max-w-md text-sm font-light leading-relaxed text-[var(--color-text-3)]">
          The reflection, analysis, or page you are looking for has been moved, removed, or never
          existed.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {user ? (
            <Link to="/dashboard" className="primary-button min-w-44">
              <LayoutDashboard size={15} /> Dashboard
            </Link>
          ) : (
            <Link to="/" className="primary-button min-w-44">
              <Home size={15} /> Return Home
            </Link>
          )}
          <Link to="/how-it-works" className="secondary-button min-w-44">
            How it works <ArrowRight size={15} />
          </Link>
        </div>
      </main>
    </div>
  );
}
