import {Lock, ShieldCheck, Server, Trash2, AlertCircle} from 'lucide-react';
import {useState} from 'react';

import {Footer} from '@/components/layout/Footer';
import {PublicHeader} from '@/components/layout/PublicHeader';
import {SignInModal} from '@/components/modals/SignInModal';

export function PrivacyBoundaries() {
  const [signInOpen, setSignInOpen] = useState(false);

  const sections = [
    {id: 'core', label: 'Privacy at the Core'},
    {id: 'architecture', label: 'Technical Architecture'},
    {id: 'ai', label: 'AI Integrity & Processing'},
    {id: 'retention', label: 'Retention & Deletion'},
    {id: 'protocol', label: 'Crisis & Emergency Protocol'},
  ];

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <PublicHeader onOpenSignIn={() => setSignInOpen(true)} />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:px-12 md:py-24">
          <div className="grid gap-12 lg:grid-cols-12">
            {/* Sticky Table of Contents (Desktop) */}
            <aside className="hidden lg:col-span-4 lg:block">
              <div className="sticky top-28 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                <p className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                  Contents
                </p>
                <nav className="space-y-2">
                  {sections.map((sec) => (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      className="block text-sm text-slate-400 transition hover:text-cyan-300"
                    >
                      {sec.label}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Editorial Content */}
            <article className="space-y-16 lg:col-span-8">
              <header className="space-y-4">
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400">
                  Commitment to Discretion
                </span>
                <h1 className="text-4xl font-extralight tracking-tight sm:text-5xl md:text-6xl">
                  Privacy & AI Boundaries
                </h1>
                <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
                  Becoming is designed as a digital sanctuary. We prioritize privacy, explicit data
                  ownership, and transparent AI boundaries at every layer.
                </p>
              </header>

              {/* Section: Privacy at the Core */}
              <section id="core" className="glass-panel space-y-4 rounded-3xl p-8">
                <div className="flex items-center gap-3">
                  <Lock className="text-cyan-400" size={22} />
                  <h2 className="font-display text-2xl font-bold text-white">
                    01. Privacy at the Core
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Reflecting honestly requires feeling safe. Your eight reflection inputs are saved
                  in your authenticated account and are accessible solely by your verified user
                  credentials.
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>• No public social feed or shared profile metrics.</li>
                  <li>• No third-party ad trackers or behavioral pixel tracking.</li>
                  <li>
                    • Sharing summaries is always opt-in and strips out raw prompts and answers.
                  </li>
                </ul>
              </section>

              {/* Section: Technical Architecture */}
              <section id="architecture" className="glass-panel space-y-4 rounded-3xl p-8">
                <div className="flex items-center gap-3">
                  <Server className="text-violet-400" size={22} />
                  <h2 className="font-display text-2xl font-bold text-white">
                    02. Technical Architecture
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Our architecture strictly segregates client code from backend trust boundaries:
                </p>
                <div className="space-y-3 rounded-2xl border border-white/5 bg-black/30 p-5 text-xs font-mono text-slate-300">
                  <p>
                    <strong>Authentication:</strong> Firebase Auth (Google OAuth 2.0 with secure
                    session tokens).
                  </p>
                  <p>
                    <strong>Integrity:</strong> Firebase App Check supplies an application-integrity
                    signal and helps reject unauthorized scripted requests.
                  </p>
                  <p>
                    <strong>Database:</strong> Cloud Firestore with owner-enforced security rules.
                    Direct client writes are rejected.
                  </p>
                  <p>
                    <strong>Serverless Execution:</strong> Idempotent Cloud Functions executing
                    server-side analysis generation with strict rate limiting.
                  </p>
                </div>
              </section>

              {/* Section: AI Integrity & Processing */}
              <section id="ai" className="glass-panel space-y-4 rounded-3xl p-8">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="text-cyan-400" size={22} />
                  <h2 className="font-display text-2xl font-bold text-white">
                    03. AI Integrity & Processing
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  AI is used purely to synthesize contrast patterns across your prompts into two
                  illustrative trajectories. We never treat AI output as deterministic truth,
                  medical advice, or psychiatric assessment.
                </p>
                <p className="text-sm leading-relaxed text-slate-300">
                  Reflection answers are sent to Google Gemini over HTTPS through a server-side
                  request configured with <code>store: false</code>. Becoming does not train an
                  application model on your answers. Provider processing terms and retention for the
                  production Google account are documented separately before launch.
                </p>
              </section>

              {/* Section: Retention & Deletion */}
              <section id="retention" className="glass-panel space-y-4 rounded-3xl p-8">
                <div className="flex items-center gap-3">
                  <Trash2 className="text-amber-400" size={22} />
                  <h2 className="font-display text-2xl font-bold text-white">
                    04. Retention & Deletion
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  You retain full ownership of your data at all times:
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li>
                    • <strong>Delete Analysis:</strong> Deletes an individual reflection, generated
                    letter, roadmap, and radar records permanently.
                  </li>
                  <li>
                    • <strong>Delete Account:</strong> Purges your user record, all reflections,
                    analyses, habit check-ins, and Firebase Auth account permanently.
                  </li>
                  <li>
                    • <strong>Deletion replay guard:</strong> A server-only one-way hash of the
                    account ID plus deletion timestamps remains for 24 hours so a still-valid
                    sign-in token cannot recreate deleted data. It contains no profile, reflection,
                    or analysis content and becomes eligible for automatic TTL cleanup after expiry.
                  </li>
                </ul>
              </section>

              {/* Section: Crisis & Emergency Protocol */}
              <section
                id="protocol"
                className="rounded-3xl border border-red-400/20 bg-red-950/15 p-8 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-red-300" size={22} />
                  <h2 className="font-display text-xl font-bold text-white">
                    05. Crisis & Emergency Protocol
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-300">
                  Becoming is not equipped to handle acute mental health crises, suicidal thoughts,
                  or emergency interventions. If you or someone you know is in immediate distress or
                  danger:
                </p>
                <div className="rounded-2xl border border-red-400/20 bg-black/40 p-4 text-xs leading-relaxed text-red-200">
                  <p>
                    • <strong>US / Canada:</strong> Call or text <strong>988</strong> (Suicide &
                    Crisis Lifeline)
                  </p>
                  <p>
                    • <strong>UK:</strong> Call <strong>111</strong> or <strong>999</strong> for
                    emergencies
                  </p>
                  <p>
                    • <strong>International:</strong> Contact your local emergency services or visit{' '}
                    <a
                      href="https://findahelpline.com"
                      target="_blank"
                      rel="noreferrer"
                      className="underline font-semibold"
                    >
                      findahelpline.com
                    </a>
                  </p>
                </div>
              </section>
            </article>
          </div>
        </div>
      </main>

      <Footer />
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
