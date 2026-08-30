import {Calendar, Download, RefreshCcw, Share2, ShieldCheck, Target, Trash2} from 'lucide-react';
import {motion} from 'motion/react';
import {lazy, Suspense, useEffect, useState} from 'react';
import ReactMarkdown from 'react-markdown';
import {Link, useNavigate, useParams} from 'react-router-dom';

import type {AnalysisResult} from '@shared/contracts';
import {DEMO_ANALYSIS} from '@/data/demoAnalysis';
import {formatServiceError} from '@/lib/errors';
import {useBecomingStore} from '@/store/useBecomingStore';

const AppHeader = lazy(() =>
  import('@/components/AppHeader').then((module) => ({default: module.AppHeader})),
);
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
  const [notice, setNotice] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-sm text-white/45"
        role="status"
      >
        Loading your analysis…
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex min-h-screen items-center justify-center px-5">
        <div className="glass max-w-lg rounded-3xl p-9 text-center">
          <h1 className="mb-4 font-display text-2xl font-semibold">Analysis unavailable</h1>
          <p className="mb-7 text-sm leading-7 text-gray-400" role="alert">
            {error}
          </p>
          <Link className="primary-button mx-auto" to="/history">
            Return to history
          </Link>
        </div>
      </div>
    );
  }

  const currentAnalysis = analysis;

  function downloadLetter() {
    const content = `Becoming — ${currentAnalysis.identity.archetype}\n\n${currentAnalysis.futureLetter}\n\nGenerated reflection guidance; not professional advice.`;
    const url = URL.createObjectURL(new Blob([content], {type: 'text/plain;charset=utf-8'}));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'becoming-future-letter.txt';
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice('Future letter downloaded.');
  }

  async function shareSummary() {
    const text = `${currentAnalysis.identity.archetype}: ${currentAnalysis.identity.description}`;
    if (navigator.share) {
      await navigator.share({title: 'My Becoming reflection', text});
      setNotice('Share sheet opened.');
      return;
    }
    await navigator.clipboard.writeText(text);
    setNotice('Summary copied to your clipboard.');
  }

  async function removeAnalysis() {
    if (demo || !analysisId) return;
    if (!window.confirm('Delete this analysis and its private reflection permanently?')) return;
    try {
      const {deleteAnalysisRecord} = await import('@/services/analysisService');
      await deleteAnalysisRecord(analysisId);
      resetReflection();
      navigate('/history', {replace: true});
    } catch (deleteError) {
      setNotice(formatServiceError(deleteError));
    }
  }

  function startAgain() {
    resetReflection();
    navigate(demo ? '/' : '/reflect');
  }

  return (
    <div className="min-h-screen">
      {demo ? (
        <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-6 md:px-10">
          <Link className="flex items-center gap-2" to="/">
            <span className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="font-display text-xs font-semibold uppercase tracking-[0.35em]">
              Becoming.
            </span>
          </Link>
          <Link className="primary-button" to="/">
            Create my own
          </Link>
        </header>
      ) : (
        <Suspense fallback={<div className="h-21" />}>
          <AppHeader backTo="/history" />
        </Suspense>
      )}

      <div className="mx-auto max-w-7xl space-y-20 px-5 pb-24 pt-10 md:px-10">
        <section className="text-center">
          <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-4 py-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span className="font-display text-[10px] uppercase tracking-[0.35em] text-cyan-300">
              {demo ? 'Demonstration analysis' : 'Private analysis complete'}
            </span>
          </div>
          <h1 className="mb-6 text-5xl font-extralight leading-none tracking-tighter md:text-7xl">
            The evolution of
            <br />
            <span className="text-gradient-cyan font-serif italic">your becoming.</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg font-light italic leading-8 text-gray-400">
            “{analysis.identity.description}”
          </p>
          <p className="mx-auto mt-6 max-w-xl text-xs leading-6 text-white/65">
            This is generated reflection guidance, not a prediction, diagnosis, or scientific
            assessment.
          </p>
        </section>

        <section
          className="glass grid gap-4 rounded-3xl p-6 sm:grid-cols-2 lg:grid-cols-4"
          aria-label="Reflection summary"
        >
          <Metric label="Potential score" value={`${analysis.identityCard.potentialScore}/100`} />
          <Metric label="AI-era readiness" value={`${analysis.identityCard.aiReadiness}/100`} />
          <Metric label="Growth potential" value={analysis.identityCard.growthPotential} compact />
          <div className="rounded-2xl border border-white/5 p-5">
            <p className="mb-4 text-[10px] uppercase tracking-widest text-white/65">
              Primary archetype
            </p>
            <div className="flex items-center gap-3 text-sm font-medium">
              <ShieldCheck size={17} className="text-cyan-400" /> {analysis.identity.archetype}
            </div>
          </div>
        </section>

        <section className="grid gap-8 md:grid-cols-2" aria-label="Two possible paths">
          <PathCard
            eyebrow="The drift path"
            title={analysis.futureA.title}
            description={analysis.futureA.description}
            highlightLabel="Possible regret"
            highlight={analysis.futureA.keyRegret}
            tone="red"
          />
          <PathCard
            eyebrow="The becoming path"
            title={analysis.futureB.title}
            description={analysis.futureB.description}
            highlightLabel="Possible growth"
            highlight={analysis.futureB.keyGrowth}
            tone="cyan"
          />
        </section>

        <section className="grid gap-8 lg:grid-cols-12">
          <div className="glass rounded-3xl p-6 md:p-10 lg:col-span-7">
            <div className="mb-5">
              <h2 className="font-display text-xl font-bold uppercase">
                Reflective capability map
              </h2>
              <p className="mt-2 text-xs leading-6 text-gray-400">
                Illustrative scores generated from your answers; they are not validated
                measurements.
              </p>
            </div>
            <Suspense
              fallback={
                <div className="flex h-90 items-center justify-center text-sm text-white/65">
                  Loading visualization…
                </div>
              }
            >
              <RadarVisualization data={analysis.radarData} />
            </Suspense>
            <details className="rounded-xl border border-white/10 p-4 text-sm text-white/60">
              <summary className="cursor-pointer font-medium text-white/75">
                View chart as accessible data
              </summary>
              <table className="mt-4 w-full text-left">
                <thead>
                  <tr>
                    <th className="py-2">Capability</th>
                    <th>Drift</th>
                    <th>Becoming</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.radarData.map((item) => (
                    <tr key={item.subject} className="border-t border-white/5">
                      <th className="py-2 font-normal">{item.subject}</th>
                      <td>{item.A}</td>
                      <td>{item.B}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>

          <div className="glass rounded-3xl p-7 md:p-10 lg:col-span-5">
            <h2 className="mb-8 flex items-center gap-3 font-display text-xl font-bold uppercase">
              <Calendar size={19} className="text-cyan-400" /> Evolution roadmap
            </h2>
            <div className="space-y-8">
              {analysis.timeline.map((item) => (
                <article className="border-l border-cyan-400/20 pl-5" key={item.period}>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
                    {item.period}
                  </p>
                  <p className="mb-2 text-xs leading-6 text-red-200/80">
                    <strong>Drift:</strong> {item.stateA}
                  </p>
                  <p className="text-sm leading-7 text-gray-300">
                    <strong>Intentional:</strong> {item.stateB}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="glass mx-auto max-w-4xl rounded-[2.5rem] p-8 md:p-16">
          <div className="mb-10 text-center">
            <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.45em] text-cyan-400">
              A letter from your potential self
            </p>
            <h2 className="text-3xl font-extralight md:text-5xl">A direction—not a prophecy.</h2>
          </div>
          <div className="prose prose-invert max-w-none text-base font-light leading-8 text-gray-300 md:text-lg">
            <ReactMarkdown
              components={{
                a: ({href, children}) => (
                  <a href={href} target="_blank" rel="noreferrer noopener">
                    {children}
                  </a>
                ),
              }}
            >
              {analysis.futureLetter}
            </ReactMarkdown>
          </div>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <button className="secondary-button" type="button" onClick={downloadLetter}>
              <Download size={15} /> Download letter
            </button>
            <button className="secondary-button" type="button" onClick={() => void shareSummary()}>
              <Share2 size={15} /> Share summary
            </button>
          </div>
        </section>

        <section>
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
              Active protocols
            </h2>
            <p className="mt-3 text-sm text-gray-400">
              Small actions you can review and adapt to your circumstances.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <ActionCard
              icon={<RefreshCcw size={18} />}
              title="Daily habits"
              items={analysis.plan.dailyHabits}
            />
            <ActionCard
              icon={<Target size={18} />}
              title="Learning roadmap"
              items={analysis.plan.learningRoadmap}
            />
            <article className="glass rounded-3xl p-8">
              <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/25 text-blue-300">
                <Calendar size={18} />
              </div>
              <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-widest text-white/60">
                Start strategy
              </h3>
              <p className="text-sm font-light italic leading-7 text-gray-400">
                “{analysis.plan.antiProcrastination}”
              </p>
            </article>
          </div>
        </section>

        <footer className="flex flex-col items-center gap-5 border-t border-white/5 pt-12 text-center">
          {notice ? (
            <p className="text-sm text-cyan-200" role="status">
              {notice}
            </p>
          ) : null}
          <div className="flex flex-wrap justify-center gap-3">
            <button className="primary-button" type="button" onClick={startAgain}>
              <RefreshCcw size={15} /> {demo ? 'Return home' : 'Reflect again'}
            </button>
            {!demo ? (
              <Link className="secondary-button" to="/history">
                View history
              </Link>
            ) : null}
            {!demo ? (
              <button
                className="secondary-button text-red-300"
                type="button"
                onClick={() => void removeAnalysis()}
              >
                <Trash2 size={15} /> Delete
              </button>
            ) : null}
          </div>
          <p className="max-w-xl text-xs leading-6 text-white/65">
            Keep what is useful, question what is not, and seek qualified support for decisions that
            require professional care.
          </p>
        </footer>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/5 p-5">
      <p className="mb-4 text-[10px] uppercase tracking-widest text-white/65">{label}</p>
      <p className={compact ? 'text-sm leading-6 text-cyan-100' : 'text-3xl font-light'}>{value}</p>
    </div>
  );
}

function PathCard({
  eyebrow,
  title,
  description,
  highlightLabel,
  highlight,
  tone,
}: {
  eyebrow: string;
  title: string;
  description: string;
  highlightLabel: string;
  highlight: string;
  tone: 'red' | 'cyan';
}) {
  const toneClass =
    tone === 'red' ? 'text-red-300 border-red-400/20' : 'text-cyan-300 border-cyan-400/20';
  return (
    <motion.article
      className={`glass rounded-3xl border p-8 md:p-10 ${toneClass}`}
      whileHover={{y: -4}}
    >
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em]">{eyebrow}</p>
      <h2 className="mb-6 font-display text-3xl font-bold text-white">{title}</h2>
      <p className="mb-8 text-base font-light leading-8 text-gray-300">{description}</p>
      <div className="border-t border-white/5 pt-6">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.25em]">{highlightLabel}</p>
        <p className="font-serif text-lg italic leading-7 text-white/75">“{highlight}”</p>
      </div>
    </motion.article>
  );
}

function ActionCard({icon, title, items}: {icon: React.ReactNode; title: string; items: string[]}) {
  return (
    <article className="glass rounded-3xl p-8">
      <div className="mb-7 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/25 text-cyan-300">
        {icon}
      </div>
      <h3 className="mb-5 font-display text-sm font-bold uppercase tracking-widest text-white/60">
        {title}
      </h3>
      <ol className="space-y-4">
        {items.map((item, index) => (
          <li className="flex gap-4 text-sm font-light leading-6 text-gray-400" key={item}>
            <span className="text-cyan-300">0{index + 1}</span>
            <span>{item}</span>
          </li>
        ))}
      </ol>
    </article>
  );
}
