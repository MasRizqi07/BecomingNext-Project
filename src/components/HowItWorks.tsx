import {
  ArrowRight,
  BrainCircuit,
  Calendar,
  CheckCircle2,
  ChevronDown,
  Eye,
  FileText,
  Lock,
  Route,
  Sparkles,
  Zap,
} from 'lucide-react';
import {motion, useReducedMotion} from 'motion/react';
import {useState} from 'react';
import {Link} from 'react-router-dom';

import {Footer} from '@/components/layout/Footer';
import {PublicHeader} from '@/components/layout/PublicHeader';
import {SignInModal} from '@/components/modals/SignInModal';

export function HowItWorks() {
  const [signInOpen, setSignInOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const prefersReducedMotion = useReducedMotion();

  const faqs = [
    {
      q: 'How long does a reflection session take?',
      a: 'Most sessions take 8 to 12 minutes. The 8 prompts are designed to be focused and deep rather than lengthy.',
    },
    {
      q: 'Is my reflection data used to train public AI models?',
      a: 'Becoming does not train its own model on your answers. Gemini requests use stateless processing (store: false); the production privacy notice must also document the processing terms of the configured Google account.',
    },
    {
      q: 'Is this a psychological assessment or personality test?',
      a: 'No. Becoming is an editorial reflection tool designed to compare plausible future trajectories. It is not a clinical, diagnostic, or psychometric assessment.',
    },
    {
      q: 'Can I delete my analysis or entire account?',
      a: 'Yes, at any time. You can delete individual reflections from your archive or permanently wipe all account data from the Settings page.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <PublicHeader onOpenSignIn={() => setSignInOpen(true)} />

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-5 pt-20 pb-16 text-center sm:px-8 md:pt-28">
          <motion.div
            initial={prefersReducedMotion ? false : {opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: prefersReducedMotion ? 0 : 0.6}}
          >
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-accent)]">
              Methodology & Architecture
            </span>
            <h1 className="mt-5 text-4xl font-extralight tracking-tight sm:text-6xl md:text-7xl">
              Eight prompts. Two paths. <br />
              <span className="font-serif italic text-[var(--color-text-2)]">
                One practical next step.
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-[var(--color-text-3)] sm:text-lg">
              Understand how Becoming transforms your honest introspection into structured,
              actionable future guidance.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link to="/reflect" className="primary-button min-w-44">
                Begin reflection <ArrowRight size={15} />
              </Link>
              <Link to="/demo" className="secondary-button min-w-44">
                <Eye size={15} /> View safe demo
              </Link>
            </div>
          </motion.div>
        </section>

        {/* 3-Step Process */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12">
          <div className="mb-14 text-center">
            <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
              The 3-Step Journey
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--color-text-1)] sm:text-4xl">
              From Inquiry to Action
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="glass-panel relative rounded-3xl p-8 transition hover:border-[var(--color-accent)]/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/10 font-display text-base font-bold text-[var(--color-accent)]">
                01
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--color-text-1)]">
                Reflect Honestly
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-3)]">
                Answer 8 structured, introspective prompts exploring feared futures, chosen
                directions, discipline scores, and avoidance patterns.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-accent)] opacity-80">
                <Lock size={12} /> Auto-saved in private session
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-panel relative rounded-3xl p-8 transition hover:border-[var(--color-accent)]/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-violet)]/20 bg-[var(--color-violet)]/10 font-display text-base font-bold text-[var(--color-violet)]">
                02
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--color-text-1)]">
                Dual-Path Synthesis
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-3)]">
                AI analyzes recurring friction points and maps two contrasting trajectories: the{' '}
                <em>Drifting Path</em> and the <em>Intentional Path</em>.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-violet)] opacity-80">
                <Route size={12} /> 6mo, 1yr & 5yr milestones
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-panel relative rounded-3xl p-8 transition hover:border-[var(--color-accent)]/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-success)]/20 bg-[var(--color-success)]/10 font-display text-base font-bold text-[var(--color-success)]">
                03
              </div>
              <h3 className="font-display text-xl font-bold text-[var(--color-text-1)]">
                Daily Action Protocols
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-3)]">
                Receive 2–5 grounded daily habits, a learning roadmap, an anti-procrastination
                strategy, and weekly check-in tracking.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-[var(--color-success)] opacity-80">
                <Zap size={12} /> Sized for sustainable progress
              </div>
            </div>
          </div>
        </section>

        {/* What You Receive Artifacts */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-1)]/40 py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
            <div className="mb-14 text-center">
              <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                Synthesis Output
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-[var(--color-text-1)] sm:text-4xl">
                What You Receive
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-panel rounded-2xl p-6">
                <BrainCircuit className="mb-4 text-[var(--color-accent)]" size={24} />
                <h4 className="font-display text-base font-bold text-[var(--color-text-1)]">
                  Archetype Synthesis
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-3)]">
                  A high-level thematic title and synthesis of your current mindset and core
                  leverage points.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <Route className="mb-4 text-[var(--color-violet)]" size={24} />
                <h4 className="font-display text-base font-bold text-[var(--color-text-1)]">
                  Trajectory Comparison
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-3)]">
                  Side-by-side comparative views of where momentum leads versus where deliberate
                  action leads.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <FileText className="mb-4 text-[var(--color-warning)]" size={24} />
                <h4 className="font-display text-base font-bold text-[var(--color-text-1)]">
                  Future Letter
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-3)]">
                  An editorial, literary narrative addressing you from the vantage point of your
                  intentional future self.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <Calendar className="mb-4 text-[var(--color-success)]" size={24} />
                <h4 className="font-display text-base font-bold text-[var(--color-text-1)]">
                  Action Protocols
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-3)]">
                  Concrete daily routines, focus skills to develop, and a structured
                  anti-procrastination trigger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Boundaries Callout */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <div className="glass-panel-strong rounded-3xl border border-[var(--color-accent)]/20 p-8 sm:p-12">
            <div className="flex items-center gap-3">
              <Sparkles className="text-[var(--color-accent)]" size={24} />
              <h3 className="font-display text-2xl font-bold text-[var(--color-text-1)]">
                What AI Does & Does Not Do
              </h3>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-accent)]">
                  What AI Does
                </h4>
                <ul className="space-y-2.5 text-sm text-[var(--color-text-2)]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                    />
                    <span>Synthesizes recurring behavioral patterns across your 8 answers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                    />
                    <span>Constructs structured, illustrative future scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                    />
                    <span>Suggests small, testable habit experiments</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-danger)]">
                  What AI Does Not Do
                </h4>
                <ul className="space-y-2.5 text-sm text-[var(--color-text-2)]">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-[var(--color-danger)]">✕</span>
                    <span>Does not provide clinical psychological diagnosis or therapy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-[var(--color-danger)]">✕</span>
                    <span>Does not claim absolute prophecy or deterministic futures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-[var(--color-danger)]">✕</span>
                    <span>
                      Uses stateless Gemini requests and does not train an application model
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-[var(--color-text-1)] sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="glass-panel overflow-hidden rounded-2xl border border-[var(--color-border)] transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-display text-base font-semibold text-[var(--color-text-1)] transition hover:text-[var(--color-accent)]"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 text-[var(--color-accent)]'
                          : 'text-[var(--color-text-3)]'
                      }`}
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-[var(--color-border)] px-5 pb-5 pt-2 text-sm leading-relaxed text-[var(--color-text-3)]">
                      {faq.a}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
