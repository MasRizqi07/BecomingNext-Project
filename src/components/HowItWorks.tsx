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
      a: 'No. Your answers are processed in isolated backend environments strictly to generate your analysis. Data is never shared publicly or used for model training.',
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
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400">
              Methodology & Architecture
            </span>
            <h1 className="mt-5 text-4xl font-extralight tracking-tight sm:text-6xl md:text-7xl">
              Eight prompts. Two paths. <br />
              <span className="font-serif italic text-white/85">One practical next step.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-relaxed text-slate-400 sm:text-lg">
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
            <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
              The 3-Step Journey
            </span>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              From Inquiry to Action
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Step 1 */}
            <div className="glass-panel relative rounded-3xl p-8 transition hover:border-cyan-400/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 font-display text-base font-bold text-cyan-300">
                01
              </div>
              <h3 className="font-display text-xl font-bold text-white">Reflect Honestly</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Answer 8 structured, introspective prompts exploring feared futures, chosen
                directions, discipline scores, and avoidance patterns.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-cyan-300/80">
                <Lock size={12} /> Auto-saved in private session
              </div>
            </div>

            {/* Step 2 */}
            <div className="glass-panel relative rounded-3xl p-8 transition hover:border-cyan-400/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-400/20 bg-violet-400/10 font-display text-base font-bold text-violet-300">
                02
              </div>
              <h3 className="font-display text-xl font-bold text-white">Dual-Path Synthesis</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                AI analyzes recurring friction points and maps two contrasting trajectories: the{' '}
                <em>Drifting Path</em> and the <em>Intentional Path</em>.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-violet-300/80">
                <Route size={12} /> 6mo, 1yr & 5yr milestones
              </div>
            </div>

            {/* Step 3 */}
            <div className="glass-panel relative rounded-3xl p-8 transition hover:border-cyan-400/30">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10 font-display text-base font-bold text-emerald-300">
                03
              </div>
              <h3 className="font-display text-xl font-bold text-white">Daily Action Protocols</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">
                Receive 2–5 grounded daily habits, a learning roadmap, an anti-procrastination
                strategy, and weekly check-in tracking.
              </p>
              <div className="mt-6 flex items-center gap-2 text-xs text-emerald-300/80">
                <Zap size={12} /> Sized for sustainable progress
              </div>
            </div>
          </div>
        </section>

        {/* What You Receive Artifacts */}
        <section className="border-t border-white/5 bg-[#090A0F]/40 py-20">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
            <div className="mb-14 text-center">
              <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-cyan-400">
                Synthesis Output
              </span>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                What You Receive
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="glass-panel rounded-2xl p-6">
                <BrainCircuit className="mb-4 text-cyan-400" size={24} />
                <h4 className="font-display text-base font-bold text-white">Archetype Synthesis</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  A high-level thematic title and synthesis of your current mindset and core
                  leverage points.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <Route className="mb-4 text-violet-400" size={24} />
                <h4 className="font-display text-base font-bold text-white">
                  Trajectory Comparison
                </h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Side-by-side comparative views of where momentum leads versus where deliberate
                  action leads.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <FileText className="mb-4 text-amber-400" size={24} />
                <h4 className="font-display text-base font-bold text-white">Future Letter</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  An editorial, literary narrative addressing you from the vantage point of your
                  intentional future self.
                </p>
              </div>

              <div className="glass-panel rounded-2xl p-6">
                <Calendar className="mb-4 text-emerald-400" size={24} />
                <h4 className="font-display text-base font-bold text-white">Action Protocols</h4>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  Concrete daily routines, focus skills to develop, and a structured
                  anti-procrastination trigger.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* AI Boundaries Callout */}
        <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8">
          <div className="glass-panel-strong rounded-3xl border border-cyan-400/20 p-8 sm:p-12">
            <div className="flex items-center gap-3">
              <Sparkles className="text-cyan-400" size={24} />
              <h3 className="font-display text-2xl font-bold text-white">
                What AI Does & Does Not Do
              </h3>
            </div>

            <div className="mt-8 grid gap-8 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-cyan-300">
                  What AI Does
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                    <span>Synthesizes recurring behavioral patterns across your 8 answers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                    <span>Constructs structured, illustrative future scenarios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-cyan-400" />
                    <span>Suggests small, testable habit experiments</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-red-300">
                  What AI Does Not Do
                </h4>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-red-400">✕</span>
                    <span>Does not provide clinical psychological diagnosis or therapy</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-red-400">✕</span>
                    <span>Does not claim absolute prophecy or deterministic futures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 font-bold text-red-400">✕</span>
                    <span>Does not train public LLMs on your private reflection answers</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="mx-auto max-w-4xl px-5 pb-24 sm:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.q}
                  className="glass-panel overflow-hidden rounded-2xl border border-white/10 transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-display text-base font-semibold text-white transition hover:text-cyan-300"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-cyan-400' : 'text-slate-500'
                      }`}
                    />
                  </button>
                  {isOpen ? (
                    <div className="border-t border-white/5 px-5 pb-5 pt-2 text-sm leading-relaxed text-slate-400">
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
