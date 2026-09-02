import {Shield} from 'lucide-react';
import {Link} from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer pb-16 pt-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
        <div className="grid gap-10 md:grid-cols-12 md:gap-8">
          {/* Brand & Manifesto */}
          <div className="space-y-4 md:col-span-6">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <span className="font-display text-xs font-bold uppercase tracking-[0.35em] text-white">
                Becoming.
              </span>
            </Link>
            <p className="max-w-md text-sm font-light leading-relaxed text-slate-400">
              A private digital sanctuary for honest introspection. Transforming eight thoughtful
              reflections into two plausible future trajectories and an actionable personal roadmap.
            </p>
            <div className="flex items-center gap-2 text-xs text-cyan-300/80 font-medium">
              <Shield size={13} /> Private by design • Owner-only data access
            </div>
          </div>

          {/* Navigation links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:col-span-6 md:justify-items-end">
            <div className="space-y-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                Exploration
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/how-it-works" className="text-slate-400 hover:text-white">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-400 hover:text-white">
                    Privacy & AI boundaries
                  </Link>
                </li>
                <li>
                  <Link to="/demo" className="text-slate-400 hover:text-white">
                    Safe demonstration
                  </Link>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                Application
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/reflect" className="text-slate-400 hover:text-white">
                    Begin reflection
                  </Link>
                </li>
                <li>
                  <Link to="/dashboard" className="text-slate-400 hover:text-white">
                    Personal dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/history" className="text-slate-400 hover:text-white">
                    Archive & history
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer and Copyright */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-slate-400 sm:flex-row">
          <p>
            © {currentYear} Becoming. Guidance generated for personal reflection, not a medical or
            psychiatric diagnosis.
          </p>
          <div className="flex items-center gap-4">
            <Link
              to="/privacy"
              className="text-slate-400 hover:text-white underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            <span>•</span>
            <Link
              to="/how-it-works"
              className="text-slate-400 hover:text-white underline underline-offset-4"
            >
              Methodology
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
