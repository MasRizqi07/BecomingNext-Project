import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {AppHeader} from '@/components/AppHeader';
import {Badge} from '@/components/primitives/Badge';
import {OrbVisualizer} from '@/components/primitives/OrbVisualizer';
import {formatServiceError} from '@/lib/errors';
import {getAnalysisHistory, type AnalysisRecord} from '@/services/analysisService';
import {useBecomingStore} from '@/store/useBecomingStore';

export function Dashboard() {
  const user = useBecomingStore((state) => state.user);
  const resetReflection = useBecomingStore((state) => state.resetReflection);
  const navigate = useNavigate();

  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let active = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const history = await getAnalysisHistory(uid);
        if (active) setRecords(history);
      } catch (err) {
        if (active) setError(formatServiceError(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadData();
    return () => {
      active = false;
    };
  }, [user]);

  function handleStartNewReflection() {
    resetReflection();
    navigate('/reflect');
  }

  const latestCompleted = records.find((r) => r.status === 'completed');
  const latestPendingOrFailed = records.find(
    (r) => r.status === 'pending' || r.status === 'failed',
  );

  const displayName = user?.displayName
    ? user.displayName.split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'Friend';

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <AppHeader />

      <main className="flex-1 w-full max-w-7xl mx-auto px-5 py-8 sm:px-8 md:px-12 md:py-12 flex flex-col gap-10">
        {/* Greeting Section */}
        <section className="flex flex-col justify-between items-start gap-4 sm:flex-row sm:items-end border-b border-white/8 pb-8">
          <div>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
              Personal Sanctuary
            </span>
            <h1 className="mt-2 text-3xl font-extralight tracking-tight sm:text-5xl md:text-6xl text-white">
              Welcome back, <span className="font-serif italic text-white/90">{displayName}</span>
            </h1>
            <p className="mt-2 text-sm text-slate-400 font-light">
              Ready to observe your patterns and continue your growth?
            </p>
          </div>

          <button
            type="button"
            onClick={handleStartNewReflection}
            className="primary-button text-xs font-bold whitespace-nowrap shadow-[0_0_15px_rgba(103,232,249,0.25)]"
          >
            <Plus size={15} /> New Reflection
          </button>
        </section>

        {/* Error Alert if history load failed */}
        {error ? (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-950/20 p-4 text-sm text-red-200"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="icon-button h-8 w-8"
              type="button"
              onClick={() => window.location.reload()}
              aria-label="Reload dashboard"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        ) : null}

        {/* Loading State */}
        {loading ? (
          <div
            className="glass-panel flex min-h-64 flex-col items-center justify-center rounded-3xl p-12 text-center"
            role="status"
          >
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border border-cyan-400/20 border-t-cyan-400" />
            <p className="mt-4 font-display text-xs uppercase tracking-[0.25em] text-slate-400">
              Accessing your private sanctuary…
            </p>
          </div>
        ) : records.length === 0 ? (
          /* Empty State */
          <section className="glass-panel-strong mx-auto max-w-3xl rounded-3xl p-10 text-center sm:p-16">
            <OrbVisualizer size="md" className="mb-8" />
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-400">
              Empty Sanctuary
            </span>
            <h2 className="mt-3 text-2xl font-light text-white sm:text-4xl">
              No reflections recorded yet
            </h2>
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Take 8 to 12 minutes to answer eight honest questions. Your future trajectories and
              action roadmap will appear here.
            </p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleStartNewReflection}
                className="primary-button px-8 py-3.5 text-xs"
              >
                <Sparkles size={15} /> Begin First Reflection
              </button>
            </div>
          </section>
        ) : (
          /* Populated Dashboard */
          <>
            {/* Status Banner for Pending/Failed Job */}
            {latestPendingOrFailed && latestPendingOrFailed.status === 'pending' ? (
              <div className="glass-panel flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full bg-amber-400 animate-ping" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">
                      Analysis in progress
                    </h4>
                    <p className="text-xs text-slate-400">
                      Your previous reflection is being synthesized. You can resume safely.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/analysis/${latestPendingOrFailed.id}`}
                  className="secondary-button text-xs font-semibold py-2 text-amber-300 border-amber-400/30"
                >
                  Resume Analysis <ArrowRight size={14} />
                </Link>
              </div>
            ) : latestPendingOrFailed && latestPendingOrFailed.status === 'failed' ? (
              <div className="glass-panel flex flex-col items-start justify-between gap-4 rounded-2xl border border-red-400/30 bg-red-400/5 p-5 sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <AlertCircle size={20} className="text-red-400" />
                  <div>
                    <h4 className="font-display text-sm font-bold text-white">
                      Previous analysis paused
                    </h4>
                    <p className="text-xs text-slate-400">
                      Your answers are saved. You can retry the synthesis safely.
                    </p>
                  </div>
                </div>
                <Link
                  to={`/analysis/${latestPendingOrFailed.id}`}
                  className="primary-button text-xs font-semibold py-2"
                >
                  <RefreshCcw size={14} /> Retry Safely
                </Link>
              </div>
            ) : null}

            {/* 2-Column Grid for Latest Completed Analysis */}
            {latestCompleted && latestCompleted.result ? (
              <section className="grid gap-6 lg:grid-cols-12">
                {/* Left Card: Latest Archetype */}
                <div className="identity-gradient-border p-7 sm:p-9 lg:col-span-7 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-cyan-400">
                          Current Archetype
                        </span>
                        <h2 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
                          {latestCompleted.result.identity.archetype}
                        </h2>
                      </div>
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-cyan-300">
                        <Sparkles size={20} />
                      </div>
                    </div>

                    <p className="mt-4 text-sm font-light leading-relaxed text-slate-300">
                      "{latestCompleted.result.identity.description}"
                    </p>

                    {/* Score Bar */}
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center justify-between text-xs font-display uppercase tracking-wider text-slate-400">
                        <span>Trajectory Alignment</span>
                        <span className="text-cyan-300 font-bold">
                          {latestCompleted.result.identityCard.potentialScore}% Aligned
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(10, latestCompleted.result.identityCard.potentialScore),
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
                    <Link to={`/results/${latestCompleted.id}`} className="primary-button text-xs">
                      Open Full Analysis <ArrowRight size={14} />
                    </Link>
                    <Link
                      to={`/check-in/${latestCompleted.id}`}
                      className="secondary-button text-xs"
                    >
                      <CheckCircle2 size={14} /> Habit Check-in
                    </Link>
                  </div>
                </div>

                {/* Right Card: Active Plan / Today's Habit */}
                <div className="glass-panel flex flex-col justify-between rounded-3xl p-7 sm:p-9 lg:col-span-5">
                  <div>
                    <div className="flex items-center gap-2 text-amber-300 font-display text-[10px] uppercase tracking-[0.25em]">
                      <Zap size={14} />
                      <span>Today's Micro-Habit</span>
                    </div>

                    <h3 className="mt-4 font-display text-xl font-bold text-white sm:text-2xl">
                      {latestCompleted.result.plan.dailyHabits[0] ??
                        'Deep work without distraction'}
                    </h3>

                    <p className="mt-3 text-xs leading-relaxed text-slate-400">
                      Focus on small, continuous progress. This directly develops your{' '}
                      <strong className="text-slate-200">
                        {latestCompleted.result.identity.archetype}
                      </strong>{' '}
                      pathway.
                    </p>

                    <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs font-serif italic text-slate-300">
                      “{latestCompleted.result.plan.antiProcrastination}”
                    </div>
                  </div>

                  <div className="mt-8">
                    <Link
                      to={`/check-in/${latestCompleted.id}`}
                      className="secondary-button w-full justify-center text-xs"
                    >
                      <CheckCircle2 size={14} /> Weekly / Daily Check-in
                    </Link>
                  </div>
                </div>
              </section>
            ) : null}

            {/* Recent Reflections Section */}
            <section className="mt-6 space-y-6">
              <div className="flex items-end justify-between border-b border-white/8 pb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-white">Recent Reflections</h3>
                  <p className="text-xs text-slate-400">Your most recent introspection sessions</p>
                </div>
                <Link
                  to="/history"
                  className="font-display text-xs font-semibold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition"
                >
                  View all history →
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {records.slice(0, 3).map((rec) => {
                  const isReady = rec.status === 'completed';
                  const dateString = rec.createdAt ? rec.createdAt.toLocaleDateString() : 'Recent';

                  return (
                    <Link
                      key={rec.id}
                      to={isReady ? `/results/${rec.id}` : `/analysis/${rec.id}`}
                      className="glass-panel card-interactive group flex flex-col justify-between rounded-2xl p-6 transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Clock size={12} /> {dateString}
                          </span>
                          <Badge
                            tone={
                              isReady ? 'success' : rec.status === 'pending' ? 'warning' : 'danger'
                            }
                          >
                            {isReady
                              ? 'Ready'
                              : rec.status === 'pending'
                                ? 'In Progress'
                                : 'Failed'}
                          </Badge>
                        </div>

                        <h4 className="font-display text-base font-bold text-white group-hover:text-cyan-300 transition">
                          {rec.result?.identity.archetype ?? 'Reflection Synthesis'}
                        </h4>

                        <p className="mt-2 line-clamp-2 text-xs font-light text-slate-400">
                          {rec.result?.identity.description ?? 'Draft in progress…'}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center gap-1 text-[11px] font-display font-semibold uppercase tracking-wider text-cyan-400 group-hover:translate-x-1 transition-transform">
                        <span>{isReady ? 'Open Analysis' : 'Resume'}</span>
                        <ArrowRight size={13} />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
