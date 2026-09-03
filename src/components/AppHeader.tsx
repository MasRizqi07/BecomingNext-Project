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
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border)] bg-[var(--color-canvas)]/85 backdrop-blur-xl transition-all">
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
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_var(--color-accent-strong)]" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.35em] text-[var(--color-text-1)]">
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
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-display text-xs font-semibold tracking-wider transition ${
                  isActive
                    ? 'bg-[var(--color-surface-3)] text-[var(--color-accent)] shadow-xs'
                    : 'text-[var(--color-text-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-1)]'
                }`}
              >
                <item.icon
                  size={14}
                  className={isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-3)]'}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme, User Profile, Settings, Sign Out */}
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
            className="icon-button h-9 w-9 text-[var(--color-text-3)] hover:text-[var(--color-danger)] sm:h-10 sm:w-10"
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
              className="h-8 w-8 rounded-full border border-[var(--color-border)] object-cover"
            />
          ) : (
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 font-display text-xs font-bold text-[var(--color-accent)]"
              role="img"
              aria-label="User avatar"
            >
              {user?.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
