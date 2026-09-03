import {
  CheckCircle2,
  Download,
  Fingerprint,
  GitFork,
  Mail,
  Milestone,
  RefreshCcw,
  Share2,
  ShieldCheck,
  Target,
  Trash2,
  Zap,
} from 'lucide-react';
import {lazy, Suspense, useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {Link, useNavigate, useParams} from 'react-router-dom';

import type {AnalysisResult} from '@shared/contracts';
import {AppHeader} from '@/components/AppHeader';
import {Footer} from '@/components/layout/Footer';
import {MobileBottomNav} from '@/components/layout/MobileBottomNav';
import {PublicHeader} from '@/components/layout/PublicHeader';
import {DeleteAnalysisDialog} from '@/components/modals/DeleteAnalysisDialog';
import {ShareSummaryModal} from '@/components/modals/ShareSummaryModal';
import {SignInModal} from '@/components/modals/SignInModal';
import {Badge} from '@/components/primitives/Badge';
import {Toast, type ToastItem} from '@/components/primitives/Toast';
import {DEMO_ANALYSIS} from '@/data/demoAnalysis';
import {formatServiceError} from '@/lib/errors';
import {useBecomingStore} from '@/store/useBecomingStore';

const RadarVisualization = lazy(() =>
  import('@/components/RadarVisualization').then((module) => ({
    default: module.RadarVisualization,
  })),
);

export function Results({demo = false}: {demo?: boolean}) {
  const {analysisId} = useParams<{analysisId: string}>();
  const navigate = useNavigate();
  const {
    analysis: storedAnalysis,
    activeAnalysisId,
    setAnalysis: storeAnalysis,
    setActiveAnalysisId,
    resetReflection,
  } = useBecomingStore();

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    demo ? DEMO_ANALYSIS : activeAnalysisId === analysisId ? storedAnalysis : null,
  );
  const [loading, setLoading] = useState(!analysis);
  const [error, setError] = useState<string | null>(null);

  // Modals & Feedback
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [activeSection, setActiveSection] = useState('identity');

  useEffect(() => {
    if (demo || analysis || !analysisId) return;
    let active = true;

    void import('@/services/analysisService')
      .then(({getAnalysisRecord}) => getAnalysisRecord(analysisId))
      .then((record) => {
        if (!active) return;
        if (record?.status === 'completed' && record.result) {
          setAnalysis(record.result);
          storeAnalysis(record.result);
          setActiveAnalysisId(analysisId);
        } else if (record?.status === 'pending') {
          navigate(`/analysis/${analysisId}`, {replace: true});
        } else {
          setError('This analysis is unavailable or no longer exists.');
        }
      })
      .catch((loadError) => {
        if (active) setError(formatServiceError(loadError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [analysis, analysisId, demo, navigate, setActiveAnalysisId, storeAnalysis]);

  function scrollToSection(id: string) {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({behavior: 'smooth'});
    }
  }

  function downloadLetter() {
    if (!analysis) return;
    const content = `Becoming — ${analysis.identity.archetype}\n\n${analysis.futureLetter}\n\nGenerated reflection guidance; not professional or medical advice.`;
    const url = URL.createObjectURL(new Blob([content], {type: 'text/plain;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'becoming-future-letter.txt';
    anchor.click();
    URL.revokeObjectURL(url);
    setToast({id: 'download', message: 'Future letter downloaded.', type: 'success'});
  }

  async function handleDeleteAnalysis() {
    if (demo || !analysisId) return;
    try {
      const {deleteAnalysisRecord} = await import('@/services/analysisService');
      await deleteAnalysisRecord(analysisId);
      resetReflection();
      navigate('/history', {replace: true});
    } catch (deleteError) {
      setToast({id: 'delete-err', message: formatServiceError(deleteError), type: 'error'});
    }
  }

  function handleStartAgain() {
    resetReflection();
    navigate(demo ? '/' : '/reflect');
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-canvas)] text-[var(--color-text-1)]"
        role="status"
      >
        <div className="h-8 w-8 animate-spin rounded-full border border-cyan-400/20 border-t-cyan-400" />
        <p className="mt-4 font-display text-xs uppercase tracking-[0.25em] text-[var(--color-text-3)]">
          Loading your trajectory analysis…
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--color-canvas)] px-5 text-[var(--color-text-1)]">
        <div className="glass-panel-strong max-w-lg rounded-3xl p-10 text-center">
          <h1 className="font-display text-2xl font-bold text-[var(--color-text-1)]">
            Analysis Unavailable
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-3)]" role="alert">
            {error ?? 'Unable to find this reflection record.'}
          </p>
          <div className="mt-8">
            <Link className="primary-button" to="/history">
              Return to History
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors pb-16 lg:pb-0">
      {demo ? (
        <PublicHeader onOpenSignIn={() => setSignInOpen(true)} />
      ) : (
        <AppHeader backTo="/history" />
      )}

      {/* Demo Mode Sticky Notice */}
      {demo ? (
        <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-accent)]/20 bg-[var(--color-surface-1)]/90 py-2.5 px-6 backdrop-blur-md sm:px-12">
          <div className="flex items-center gap-2 text-xs text-[var(--color-accent)]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <strong className="font-display uppercase tracking-wider">Demo Mode:</strong> No
            personal data was collected. This is a sample analysis.
          </div>
          <Link
            to="/"
            className="primary-button text-[10px] font-bold uppercase tracking-wider py-1.5 px-4 min-h-8"
          >
            Create my own
          </Link>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:px-12 md:py-16 flex-1 w-full">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Sticky Table of Contents Navigation Rail (Desktop) */}
          <aside className="hidden lg:col-span-3 lg:block">
            <div className="sticky top-28 space-y-2 rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-5 backdrop-blur-xl">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)] px-3 block mb-3">
                Navigation Rail
              </span>

              {[
                {id: 'identity', label: 'Identity & Summary', icon: Fingerprint},
                {id: 'paths', label: 'Two Trajectories', icon: GitFork},
                {id: 'radar', label: 'Capability Radar', icon: Target},
                {id: 'timeline', label: 'Evolution Roadmap', icon: Milestone},
                {id: 'letter', label: 'Future Letter', icon: Mail},
                {id: 'protocols', label: 'Active Protocols', icon: Zap},
              ].map((item) => {
                const Icon = item.icon;
                const isCurrent = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold tracking-wider transition ${
                      isCurrent
                        ? 'border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/15 font-bold text-[var(--color-accent)]'
                        : 'text-[var(--color-text-3)] hover:bg-[var(--color-surface-3)] hover:text-[var(--color-text-1)]'
                    }`}
                  >
                    <Icon
                      size={14}
                      className={
                        isCurrent ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-3)]'
                      }
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Main Results Content Canvas */}
          <div className="space-y-20 lg:col-span-9">
            {/* Section 1: Hero & Identity */}
            <section id="identity" className="space-y-8 scroll-mt-28">
              <div className="text-center lg:text-left space-y-4">
                <div className="inline-flex items-center gap-2">
                  <Badge tone={demo ? 'demo' : 'info'}>
                    {demo ? 'Demonstration Analysis' : 'Authoritative Analysis'}
                  </Badge>
                </div>

                <h1 className="text-4xl font-extralight tracking-tight sm:text-6xl text-[var(--color-text-1)]">
                  The evolution of <br />
                  <span className="text-gradient-cyan font-serif italic font-normal">
                    your becoming.
                  </span>
                </h1>

                <p className="text-base font-light italic leading-relaxed text-[var(--color-text-2)] sm:text-lg max-w-3xl">
                  “{analysis.identity.description}”
                </p>

                <p className="text-xs leading-relaxed text-[var(--color-text-2)] max-w-2xl">
                  This reflection guidance is generated by AI from your honest inputs. It represents
                  illustrative trajectory mapping, not a psychiatric diagnosis or prediction.
                </p>
              </div>

              {/* Identity Metrics Grid */}
              <div className="identity-gradient-border p-6 sm:p-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <span className="font-display text-[10px] uppercase tracking-widest text-[var(--color-text-2)]">
                    Primary Archetype
                  </span>
                  <p className="font-display text-lg font-bold text-[var(--color-text-1)] flex items-center gap-2">
                    <ShieldCheck size={18} className="shrink-0 text-[var(--color-accent)]" />
                    <span>{analysis.identity.archetype}</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-display text-[10px] uppercase tracking-widest text-[var(--color-text-2)]">
                    Potential Score
                  </span>
                  <p className="font-display text-2xl font-light text-[var(--color-accent)]">
                    {analysis.identityCard.potentialScore}
                    <span className="text-xs text-[var(--color-text-3)]">/100</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-display text-[10px] uppercase tracking-widest text-[var(--color-text-2)]">
                    AI-Era Readiness
                  </span>
                  <p className="font-display text-2xl font-light text-[var(--color-violet)]">
                    {analysis.identityCard.aiReadiness}
                    <span className="text-xs text-[var(--color-text-3)]">/100</span>
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-display text-[10px] uppercase tracking-widest text-[var(--color-text-2)]">
                    Growth Potential
                  </span>
                  <p className="font-display text-sm font-semibold text-[var(--color-success)] pt-1">
                    {analysis.identityCard.growthPotential}
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Two Possible Trajectories */}
            <section id="paths" aria-label="Two possible paths" className="space-y-6 scroll-mt-28">
              <div>
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                  Trajectory Divergence
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-[var(--color-text-1)] sm:text-3xl">
                  Two Plausible Directions
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Drift Path */}
                <article className="glass-panel rounded-3xl border border-[var(--color-danger)]/20 p-8 flex flex-col justify-between">
                  <div>
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-danger)]">
                      The Drift Path
                    </span>
                    <h3 className="mt-3 font-display text-2xl font-bold text-[var(--color-text-1)]">
                      {analysis.futureA.title}
                    </h3>
                    <p className="mt-4 text-sm font-light leading-relaxed text-[var(--color-text-2)]">
                      {analysis.futureA.description}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-[var(--color-border)] pt-4">
                    <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--color-danger)] opacity-80">
                      Key Friction / Regret
                    </span>
                    <p className="mt-1 font-serif text-sm italic text-[var(--color-danger)]">
                      “{analysis.futureA.keyRegret}”
                    </p>
                  </div>
                </article>

                {/* Becoming Path */}
                <article className="glass-panel rounded-3xl border border-[var(--color-violet)]/25 p-8 flex flex-col justify-between">
                  <div>
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-violet)]">
                      The Becoming Path
                    </span>
                    <h3 className="mt-3 font-display text-2xl font-bold text-[var(--color-text-1)]">
                      {analysis.futureB.title}
                    </h3>
                    <p className="mt-4 text-sm font-light leading-relaxed text-[var(--color-text-2)]">
                      {analysis.futureB.description}
                    </p>
                  </div>

                  <div className="mt-8 border-t border-[var(--color-border)] pt-4">
                    <span className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--color-violet)] opacity-80">
                      Key Growth Unlock
                    </span>
                    <p className="mt-1 font-serif text-sm italic text-[var(--color-violet)]">
                      “{analysis.futureB.keyGrowth}”
                    </p>
                  </div>
                </article>
              </div>
            </section>

            {/* Section 3: Capability Radar Visualization */}
            <section id="radar" className="space-y-6 scroll-mt-28">
              <div className="glass-panel rounded-3xl p-6 sm:p-10">
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                      Multi-Dimensional Map
                    </span>
                    <h2 className="mt-1 font-display text-2xl font-bold text-[var(--color-text-1)]">
                      Reflective Capability Radar
                    </h2>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-display uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-[var(--color-accent)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" /> Drift
                      Path
                    </span>
                    <span className="flex items-center gap-1.5 text-[var(--color-violet)]">
                      <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-violet)]" />
                      Becoming Path
                    </span>
                  </div>
                </div>

                <Suspense
                  fallback={
                    <div className="flex h-72 items-center justify-center text-sm text-[var(--color-text-3)]">
                      Loading radar chart…
                    </div>
                  }
                >
                  <RadarVisualization data={analysis.radarData} />
                </Suspense>

                {/* Accessible Data Table Fallback */}
                <details className="mt-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4 text-xs text-[var(--color-text-3)]">
                  <summary className="cursor-pointer font-semibold text-[var(--color-text-2)] hover:text-[var(--color-text-1)]">
                    View Chart Data as Accessible Table
                  </summary>
                  <table className="mt-3 w-full text-left">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] text-[10px] uppercase font-display">
                        <th className="py-2">Dimension</th>
                        <th className="py-2 text-[var(--color-accent)]">Drift Score</th>
                        <th className="py-2 text-[var(--color-violet)]">Becoming Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analysis.radarData.map((row) => (
                        <tr key={row.subject} className="border-b border-[var(--color-border)]">
                          <td className="py-2 font-medium text-[var(--color-text-1)]">
                            {row.subject}
                          </td>
                          <td className="py-2">{row.A}</td>
                          <td className="py-2">{row.B}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </div>
            </section>

            {/* Section 4: Evolution Roadmap */}
            <section id="timeline" className="space-y-6 scroll-mt-28">
              <div>
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                  Milestones
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-[var(--color-text-1)] sm:text-3xl">
                  Evolution Roadmap
                </h2>
              </div>

              <div className="glass-panel rounded-3xl p-6 sm:p-10 space-y-8">
                {analysis.timeline.map((stage) => (
                  <article
                    key={stage.period}
                    className="relative border-l-2 border-[var(--color-accent)]/30 pl-6 sm:pl-8 space-y-2"
                  >
                    <span className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-[var(--color-surface-1)] bg-[var(--color-accent)]" />
                    <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                      {stage.period}
                    </span>

                    <div className="grid gap-3 sm:grid-cols-2 pt-2">
                      <div className="rounded-xl border border-[var(--color-danger)]/15 bg-[var(--color-danger)]/5 p-4 text-xs">
                        <strong className="mb-1 block uppercase tracking-wider text-[var(--color-danger)]">
                          Drift State
                        </strong>
                        <span className="text-[var(--color-text-2)] leading-relaxed">
                          {stage.stateA}
                        </span>
                      </div>

                      <div className="rounded-xl border border-[var(--color-violet)]/15 bg-[var(--color-violet)]/5 p-4 text-xs">
                        <strong className="mb-1 block uppercase tracking-wider text-[var(--color-violet)]">
                          Intentional State
                        </strong>
                        <span className="text-[var(--color-text-2)] leading-relaxed">
                          {stage.stateB}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Section 5: Future Letter */}
            <section id="letter" className="space-y-6 scroll-mt-28">
              <div className="glass-panel-strong mx-auto rounded-3xl p-8 sm:p-14">
                <div className="mb-8 text-center space-y-3">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-accent)]">
                    A Letter from Your Potential Self
                  </span>
                  <h2 className="font-display text-2xl font-light text-[var(--color-text-1)] sm:text-4xl">
                    A Direction — Not a Prophecy.
                  </h2>
                </div>

                <div className="prose prose-invert max-w-none text-base font-light leading-relaxed text-[var(--color-text-2)] sm:text-lg">
                  <ReactMarkdown>{analysis.futureLetter}</ReactMarkdown>
                </div>

                <div className="mt-10 flex flex-wrap justify-center gap-4 border-t border-[var(--color-border)] pt-8">
                  <button
                    type="button"
                    onClick={downloadLetter}
                    className="secondary-button text-xs"
                  >
                    <Download size={14} /> Download Letter
                  </button>
                  <button
                    type="button"
                    onClick={() => setShareModalOpen(true)}
                    className="secondary-button text-xs"
                  >
                    <Share2 size={14} /> Share Summary
                  </button>
                </div>
              </div>
            </section>

            {/* Section 6: Active Protocols */}
            <section id="protocols" className="space-y-6 scroll-mt-28">
              <div>
                <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--color-accent)]">
                  Actionable Steps
                </span>
                <h2 className="mt-1 font-display text-2xl font-bold text-[var(--color-text-1)] sm:text-3xl">
                  Active Protocols
                </h2>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {/* Daily Habits */}
                <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <RefreshCcw size={18} />
                    </div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-1)]">
                      Daily Micro-Habits
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {analysis.plan.dailyHabits.map((habit, i) => (
                        <li
                          key={habit}
                          className="flex items-start gap-2.5 text-xs text-[var(--color-text-2)] leading-relaxed"
                        >
                          <span className="font-mono text-[var(--color-accent)]">0{i + 1}</span>
                          <span>{habit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Learning Roadmap */}
                <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-violet)]/30 bg-[var(--color-violet)]/10 text-[var(--color-violet)]">
                      <Target size={18} />
                    </div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-1)]">
                      Learning Roadmap
                    </h3>
                    <ul className="mt-4 space-y-3">
                      {analysis.plan.learningRoadmap.map((item, i) => (
                        <li
                          key={item}
                          className="flex items-start gap-2.5 text-xs text-[var(--color-text-2)] leading-relaxed"
                        >
                          <span className="font-mono text-[var(--color-violet)]">0{i + 1}</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Anti-Procrastination */}
                <div className="glass-panel rounded-3xl p-7 flex flex-col justify-between">
                  <div>
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]">
                      <Zap size={18} />
                    </div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-1)]">
                      Anti-Procrastination
                    </h3>
                    <p className="mt-4 font-serif text-sm italic leading-relaxed text-[var(--color-text-2)]">
                      “{analysis.plan.antiProcrastination}”
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Bottom Actions Footer */}
            <footer className="flex flex-col items-center gap-6 border-t border-[var(--color-border)] pt-12 text-center">
              <div className="flex flex-wrap justify-center gap-3">
                {!demo ? (
                  <Link to={`/check-in/${analysisId}`} className="primary-button">
                    <CheckCircle2 size={15} /> Open Habit Check-in
                  </Link>
                ) : null}

                <button type="button" onClick={handleStartAgain} className="secondary-button">
                  <RefreshCcw size={15} /> {demo ? 'Start Reflection' : 'Reflect Again'}
                </button>

                {!demo ? (
                  <Link to="/history" className="secondary-button">
                    Archive History
                  </Link>
                ) : null}

                {!demo ? (
                  <button
                    type="button"
                    onClick={() => setDeleteModalOpen(true)}
                    className="danger-button"
                  >
                    <Trash2 size={15} /> Delete Analysis
                  </button>
                ) : null}
              </div>

              <p className="text-xs text-[var(--color-text-2)] max-w-md">
                Keep what is helpful, discard what is not, and seek professional guidance for
                critical health, legal, or financial decisions.
              </p>
            </footer>
          </div>
        </div>
      </main>

      <MobileBottomNav activeSection={activeSection} onSelectSection={scrollToSection} />

      <Footer />

      <ShareSummaryModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        analysis={analysis}
        onCopied={() =>
          setToast({id: 'copy', message: 'Summary copied to clipboard.', type: 'success'})
        }
      />

      <DeleteAnalysisDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteAnalysis}
      />

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
