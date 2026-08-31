import {Menu, X, Sparkles, ArrowRight} from 'lucide-react';
import {AnimatePresence} from 'motion/react';
import {useEffect, useRef, useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';

import {useBecomingStore} from '@/store/useBecomingStore';
import {ThemeToggle} from '@/components/primitives/ThemeToggle';

interface PublicHeaderProps {
  onOpenSignIn?: () => void;
}

export function PublicHeader({onOpenSignIn}: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const user = useBecomingStore((state) => state.user);
  const drawerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = 'hidden';
    drawerRef.current?.querySelector<HTMLElement>('[data-drawer-initial]')?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [mobileMenuOpen]);

  function handleActionClick() {
    if (user) {
      navigate('/dashboard');
    } else if (onOpenSignIn) {
      onOpenSignIn();
    } else {
      navigate('/reflect');
    }
  }

  const navItems = [
    {label: 'How it works', href: '/how-it-works'},
    {label: 'Privacy', href: '/privacy'},
    {label: 'Demo', href: '/demo'},
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/8 dark:border-white/8 light:border-black/10 bg-[#020205]/85 dark:bg-[#020205]/85 light:bg-[#FFFFFF]/90 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 md:px-12">
          <Link className="flex items-center gap-2.5" to="/" aria-label="Becoming Home">
            <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
            <span className="font-display text-xs font-bold uppercase tracking-[0.35em] text-white dark:text-white light:text-slate-900">
              Becoming.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav aria-label="Main Navigation" className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={`nav-link ${isActive ? 'active text-cyan-300' : ''}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA Action */}
          <div className="hidden items-center gap-4 md:flex">
            <ThemeToggle />
            {user ? (
              <Link to="/dashboard" className="secondary-button px-5 py-2 text-xs">
                Dashboard <ArrowRight size={14} />
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleActionClick}
                className="primary-button px-6 py-2.5 text-xs font-bold shadow-[0_0_15px_rgba(103,232,249,0.2)]"
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              ref={menuButtonRef}
              onClick={() => setMobileMenuOpen(true)}
              className="icon-button h-10 w-10"
              aria-label="Open navigation menu"
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sheet */}
      <AnimatePresence>
        {mobileMenuOpen ? (
          <div
            id="mobile-navigation-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-title"
            tabIndex={-1}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-[#090A0F] dark:bg-[#090A0F] light:bg-[#FFFFFF] p-6 md:hidden"
          >
            <h2 id="mobile-navigation-title" className="sr-only">
              Navigation menu
            </h2>
            <div className="flex items-center justify-between border-b border-white/10 dark:border-white/10 light:border-black/10 pb-5">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5"
              >
                <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                <span className="font-display text-xs font-bold uppercase tracking-[0.35em] text-white dark:text-white light:text-slate-900">
                  Becoming.
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="icon-button h-10 w-10"
                aria-label="Close menu"
                data-drawer-initial
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-6 py-8" aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={location.pathname === item.href ? 'page' : undefined}
                  className={`font-display text-2xl font-light tracking-tight transition ${
                    location.pathname === item.href ? 'text-cyan-300' : 'text-slate-200'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="border-t border-white/10 pt-6">
              {user ? (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="primary-button w-full"
                >
                  Go to Dashboard <ArrowRight size={15} />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleActionClick();
                  }}
                  className="primary-button w-full"
                >
                  <Sparkles size={15} /> Sign in / Start
                </button>
              )}
            </div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
