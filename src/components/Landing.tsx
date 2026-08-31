import {ArrowRight, Eye, Lock, ShieldCheck, Sparkles, Zap} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {Footer} from '@/components/layout/Footer';
import {PublicHeader} from '@/components/layout/PublicHeader';
import {SignInModal} from '@/components/modals/SignInModal';
import {useBecomingStore} from '@/store/useBecomingStore';

export function Landing() {
  const {user, authReady} = useBecomingStore();
  const [signInOpen, setSignInOpen] = useState(false);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  function handlePrimaryCTA() {
    if (user) {
      navigate('/dashboard');
    } else {
      setSignInOpen(true);
    }
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <PublicHeader onOpenSignIn={() => setSignInOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex min-h-[85vh] items-center justify-center px-5 pb-20 pt-16 text-center sm:px-8 md:pt-24">
          <motion.div
            initial={prefersReducedMotion ? false : {opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: prefersReducedMotion ? 0 : 0.8}}
            className="max-w-5xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 dark:border-cyan-400/20 light:border-cyan-800/30 bg-cyan-400/5 dark:bg-cyan-400/5 light:bg-cyan-100/60 px-4 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.35em] text-cyan-300 dark:text-cyan-300 light:text-cyan-900">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              Private future reflection
            </div>

            <h1 className="text-5xl font-extralight leading-[0.95] tracking-tighter text-white dark:text-white light:text-slate-900 sm:text-7xl md:text-8xl lg:text-9xl">
              The future version <br />
              <span className="font-serif italic text-white/85 dark:text-white/85 light:text-slate-700">
                of you is listening.
              </span>
            </h1>

            <p className="mx-auto mt-8 max-w-xl text-sm font-light leading-relaxed text-slate-300 dark:text-slate-300 light:text-slate-700 sm:text-base md:max-w-2xl md:text-lg">
              Transform honest personal reflection into two plausible future trajectories and an
              actionable, daily roadmap. A private digital sanctuary—not a score or psychological
              diagnosis.
            </p>

            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                className="primary-button min-w-55"
                type="button"
                disabled={!authReady}
                onClick={handlePrimaryCTA}
              >
                <span>{user ? 'Open Dashboard' : 'Start Reflection'}</span>
                <ArrowRight size={15} />
              </button>

              <Link className="secondary-button min-w-55" to="/demo">
                <Eye size={15} /> View a safe demo
              </Link>
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-400 light:text-slate-600">
              <Lock
                size={13}
                className="text-cyan-400/80 dark:text-cyan-400/80 light:text-cyan-700"
              />{' '}
              Personalized analysis is private to your account & protected by App Check.
            </p>
          </motion.div>
        </section>

        {/* Product Outcome Preview */}
        <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <div className="mb-10 text-center">
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400 dark:text-cyan-400 light:text-cyan-900">
              Output Overview
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white dark:text-white light:text-slate-900 sm:text-3xl">
              What You Walk Away With
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Outcome 1 */}
            <div className="identity-gradient-border card-interactive p-7 flex flex-col justify-between">
              <div>
                <span className="font-display text-[10px] uppercase tracking-widest text-cyan-400 dark:text-cyan-400 light:text-cyan-900">
                  Archetype Synthesis
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white dark:text-white light:text-slate-900">
                  The Emergent Strategist
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-600">
                  Synthesizes past friction points into a unified framework for intentional
                  long-term execution.
                </p>
              </div>
              <div className="mt-6 flex items-center justify-between border-t border-white/10 dark:border-white/10 light:border-black/10 pt-4 text-[10px] text-cyan-300 dark:text-cyan-300 light:text-cyan-800 font-display uppercase tracking-wider">
                <span>Alignment: 85%</span>
                <span className="text-emerald-400 dark:text-emerald-400 light:text-emerald-700">
                  Ready
                </span>
              </div>
            </div>

            {/* Outcome 2 */}
            <div className="glass-panel card-interactive rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <span className="font-display text-[10px] uppercase tracking-widest text-violet-400 dark:text-violet-400 light:text-violet-900">
                  Two Contrasting Paths
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white dark:text-white light:text-slate-900">
                  Drifting vs. Intentional
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-600">
                  Direct comparison of outcomes across 6 months, 1 year, and 5 years based on your
                  current habits.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 border-t border-white/10 dark:border-white/10 light:border-black/10 pt-4 text-xs text-violet-300 dark:text-violet-300 light:text-violet-800 font-display">
                <Sparkles size={13} /> 5 Dimension Radar Chart
              </div>
            </div>

            {/* Outcome 3 */}
            <div className="glass-panel card-interactive rounded-3xl p-7 flex flex-col justify-between">
              <div>
                <span className="font-display text-[10px] uppercase tracking-widest text-emerald-400 dark:text-emerald-400 light:text-emerald-900">
                  Active Protocols
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-white dark:text-white light:text-slate-900">
                  Daily Habit Roadmap
                </h3>
                <p className="mt-3 text-xs leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-600">
                  Granular, small habits sized for real-life sustainability with weekly progress
                  check-ins.
                </p>
              </div>
              <div className="mt-6 flex items-center gap-2 border-t border-white/10 dark:border-white/10 light:border-black/10 pt-4 text-xs text-emerald-300 dark:text-emerald-300 light:text-emerald-800 font-display">
                <Zap size={13} /> Anti-Procrastination Trigger
              </div>
            </div>
          </div>
        </section>

        {/* 3-Step Philosophy */}
        <section id="philosophy" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 md:px-10">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                num: '01',
                title: 'Reflect honestly',
                copy: 'Eight focused prompts turn vague emotional pressure into clear, observable patterns.',
              },
              {
                num: '02',
                title: 'See two paths',
                copy: 'Compare what may happen if current friction drifts or if intentional choices take root.',
              },
              {
                num: '03',
                title: 'Act in small steps',
                copy: 'Leave with grounded micro-habits, future letters, and learning goals built for your real life.',
              },
            ].map((step) => (
              <article className="glass-panel card-interactive rounded-3xl p-8" key={step.title}>
                <span className="mb-6 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 dark:border-cyan-400/20 light:border-cyan-800/30 font-display text-xs font-bold text-cyan-400 dark:text-cyan-400 light:text-cyan-800">
                  {step.num}
                </span>
                <h3 className="mb-3 font-display text-lg font-semibold text-white dark:text-white light:text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-slate-400 dark:text-slate-400 light:text-slate-600">
                  {step.copy}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Trust & Privacy Guarantee */}
        <section className="mx-auto max-w-5xl px-5 py-16 text-center sm:px-8">
          <div className="glass-panel-strong rounded-3xl p-8 sm:p-12">
            <ShieldCheck
              className="mx-auto text-cyan-400 dark:text-cyan-400 light:text-cyan-700"
              size={36}
            />
            <h2 className="mt-4 font-display text-2xl font-bold text-white dark:text-white light:text-slate-900 sm:text-3xl">
              Privacy by Design
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-300 dark:text-slate-300 light:text-slate-700">
              No ads, public profiling, or selling of reflections. Personalized requests travel over
              HTTPS, records are owner-isolated, and you can permanently delete them.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/privacy" className="secondary-button text-xs">
                Read our full privacy boundaries
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
