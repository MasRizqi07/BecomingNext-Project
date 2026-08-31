import {ArrowLeft, History, LogOut, Settings, LayoutDashboard, PlusCircle} from 'lucide-react';
import {Link, useLocation, useNavigate} from 'react-router-dom';

import {ThemeToggle} from '@/components/primitives/ThemeToggle';
import {useBecomingStore} from '@/store/useBecomingStore';

export function AppHeader({backTo}: {backTo?: string}) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useBecomingStore((state) => state.user);
  const resetReflection = useBecomingStore((state) => state.resetReflection);

  async function handleSignOut() {
    resetReflection();
    const {signOut} = await import('@/lib/firebaseCore');
    await signOut();
    navigate('/');
  }

  const navLinks = [
    {href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard},
    {href: '/reflect', label: 'New Reflection', icon: PlusCircle},
    {href: '/history', label: 'History', icon: History},
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 dark:border-white/8 light:border-black/10 bg-[#020205]/85 dark:bg-[#020205]/85 light:bg-[#FFFFFF]/90 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-8 md:px-12">
        {/* Left: Back / Brand */}
        <div className="flex items-center gap-4 sm:gap-6">
          {backTo ? (
            <Link className="icon-button h-9 w-9 sm:h-10 sm:w-10" to={backTo} aria-label="Go back">
              <ArrowLeft size={16} />
            </Link>
          ) : null}
          <Link
            className="flex items-center gap-2.5"
            to="/dashboard"
            aria-label="Becoming Dashboard"
          >
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.35em] text-white dark:text-white light:text-slate-900">
              Becoming.
            </span>
          </Link>
        </div>

        {/* Center: Main App Tabs (Desktop) */}
        <nav aria-label="App Navigation" className="hidden items-center gap-1 sm:flex md:gap-2">
          {navLinks.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-display text-xs font-semibold tracking-wider transition ${
                  isActive
                    ? 'bg-white/10 text-cyan-300 dark:bg-white/10 dark:text-cyan-300 light:bg-black/5 light:text-cyan-800 shadow-xs'
                    : 'text-white/60 hover:bg-white/5 hover:text-white dark:text-white/60 dark:hover:bg-white/5 dark:hover:text-white light:text-slate-600 light:hover:bg-black/5 light:hover:text-slate-900'
                }`}
              >
                <item.icon
                  size={14}
                  className={
                    isActive
                      ? 'text-cyan-300 dark:text-cyan-300 light:text-cyan-800'
                      : 'text-white/50 dark:text-white/50 light:text-slate-400'
                  }
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle, User Profile, Settings, Sign Out */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Link
            className="icon-button h-9 w-9 sm:h-10 sm:w-10"
            to="/settings"
            aria-label="Account settings"
          >
            <Settings size={16} />
          </Link>

          <button
            className="icon-button h-9 w-9 sm:h-10 sm:w-10 text-white/60 hover:text-red-300"
            type="button"
            aria-label="Sign out"
            onClick={() => void handleSignOut()}
          >
            <LogOut size={16} />
          </button>

          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="User avatar"
              className="h-8 w-8 rounded-full border border-white/15 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/10 font-display text-xs font-bold text-cyan-300">
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
