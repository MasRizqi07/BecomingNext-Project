import {ArrowLeft, History, LogOut, Settings} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';

import {signOut} from '@/lib/firebaseCore';

export function AppHeader({backTo}: {backTo?: string}) {
  const navigate = useNavigate();

  return (
    <header className="relative z-40 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-6 md:px-10">
      <div className="flex items-center gap-4">
        {backTo ? (
          <Link className="icon-button" to={backTo} aria-label="Go back">
            <ArrowLeft size={17} />
          </Link>
        ) : null}
        <Link className="flex items-center gap-2" to="/">
          <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
          <span className="font-display text-xs font-semibold uppercase tracking-[0.35em]">
            Becoming.
          </span>
        </Link>
      </div>
      <nav aria-label="Account navigation" className="flex items-center gap-2">
        <Link className="icon-button" to="/history" aria-label="Analysis history">
          <History size={17} />
        </Link>
        <Link className="icon-button" to="/settings" aria-label="Account settings">
          <Settings size={17} />
        </Link>
        <button
          className="icon-button"
          type="button"
          aria-label="Sign out"
          onClick={() => void signOut().then(() => navigate('/'))}
        >
          <LogOut size={17} />
        </button>
      </nav>
    </header>
  );
}
