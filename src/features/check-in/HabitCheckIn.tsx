import {ArrowLeft, ArrowRight, CheckCircle2, LayoutDashboard, Lock, Sparkles} from 'lucide-react';
import {motion} from 'motion/react';
import {useEffect, useState} from 'react';
import {Link, useNavigate, useParams} from 'react-router-dom';

import type {AnalysisResult, HabitStatus} from '@shared/contracts';
import {AppHeader} from '@/components/AppHeader';
import {Card} from '@/components/primitives/Card';
import {TextareaField} from '@/components/primitives/Field';
import {formatServiceError} from '@/lib/errors';
import {getAnalysisRecord, saveCheckIn} from '@/services/analysisService';
import {useBecomingStore} from '@/store/useBecomingStore';

export function HabitCheckIn() {
  const {analysisId} = useParams<{analysisId: string}>();
  const navigate = useNavigate();
  const storedAnalysis = useBecomingStore((state) => state.analysis);
  const activeAnalysisId = useBecomingStore((state) => state.activeAnalysisId);

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(
    activeAnalysisId === analysisId ? storedAnalysis : null,
  );
  const [loading, setLoading] = useState(!analysis);
  const [habitStates, setHabitStates] = useState<Record<number, HabitStatus>>({});
  const [mood, setMood] = useState<number>(3);
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (analysis || !analysisId) return;
    let active = true;

    void getAnalysisRecord(analysisId)
      .then((rec) => {
        if (!active) return;
        if (rec?.result) {
          setAnalysis(rec.result);
        }
      })
      .catch((error: unknown) => {
        if (active) setLoadError(formatServiceError(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [analysis, analysisId]);

  function handleSetHabitStatus(index: number, status: HabitStatus) {
    setHabitStates((prev) => ({...prev, [index]: status}));
  }

  async function handleSubmitCheckIn(e: React.FormEvent) {
    e.preventDefault();
    if (!analysisId || !analysis || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const trimmedNote = note.trim();
      const response = await saveCheckIn({
        analysisId,
        habitStates: analysis.plan.dailyHabits.map((_, habitIndex) => ({
          habitIndex,
          status: habitStates[habitIndex] ?? 'not_started',
        })),
        mood,
        ...(trimmedNote ? {note: trimmedNote} : {}),
      });
      setSavedAt(new Date(response.savedAt));
      setSubmitted(true);
    } catch (error: unknown) {
      setSubmitError(formatServiceError(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-canvas)] text-[var(--color-text-1)]">
        <div className="h-8 w-8 animate-spin rounded-full border border-cyan-400/20 border-t-cyan-400" />
        <p className="mt-4 font-display text-xs uppercase tracking-[0.25em] text-[var(--color-text-3)]">
          Loading check-in space…
        </p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-text-1)]">
        <AppHeader backTo="/dashboard" />
        <div className="flex flex-1 items-center justify-center px-5 text-center">
          <div className="glass-panel-strong max-w-md rounded-3xl p-8">
            <h2 className="font-display text-xl font-bold text-[var(--color-text-1)]">
              No Active Analysis
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--color-text-3)]">
              {loadError ?? 'Please complete a reflection to begin your habit check-ins.'}
            </p>
            <div className="mt-6">
              <Link to="/reflect" className="primary-button">
                Start Reflection
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const habits = analysis.plan.dailyHabits;
  const completedCount = Object.values(habitStates).filter((status) => status === 'done').length;

  // Success Screen View
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col transition-colors">
        <AppHeader backTo="/dashboard" />

        <main className="flex-1 flex items-center justify-center px-5 py-16 text-center">
          <motion.div
            initial={{opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            className="w-full max-w-lg"
          >
            <Card
              variant="glass-card"
              className="p-8 sm:p-12 text-center border border-[var(--color-border-strong)]"
            >
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)] shadow-[0_0_20px_rgba(134,239,172,0.2)]">
                <CheckCircle2 size={32} />
              </div>

              <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-success)]">
                Check-in Complete
              </span>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--color-text-1)] sm:text-4xl">
                Progress Recorded
              </h1>
              <p className="mt-3 text-sm font-light text-[var(--color-text-2)]">
                You marked{' '}
                <strong className="text-[var(--color-success)]">
                  {completedCount} of {habits.length}
                </strong>{' '}
                micro-habits as completed today.
              </p>
              <p className="mt-2 text-xs text-[var(--color-text-3)]">
                Saved securely{savedAt ? ` at ${savedAt.toLocaleTimeString()}` : ''}.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/dashboard" className="primary-button text-xs">
                  <LayoutDashboard size={14} /> Go to Dashboard
                </Link>
                <Link to={`/results/${analysisId}`} className="secondary-button text-xs">
                  View Full Trajectory <ArrowRight size={14} />
                </Link>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  // Active Check-in Form View
  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <AppHeader backTo="/dashboard" />

      {/* Context Banner */}
      <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-1)]/70 py-3.5 px-5 sm:px-8 backdrop-blur-md">
        <div className="mx-auto max-w-3xl flex items-center gap-2 text-xs text-[var(--color-text-3)]">
          <Sparkles size={14} className="text-[var(--color-accent)]" />
          <span>
            Check-in for:{' '}
            <strong className="font-medium text-[var(--color-text-1)]">
              {analysis.identity.archetype}
            </strong>
          </span>
        </div>
      </div>

      <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-10 sm:px-8 md:py-16 flex flex-col gap-10">
        <div className="space-y-3">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
            Grounding Moment
          </span>
          <h1 className="font-display text-3xl font-light tracking-tight sm:text-5xl text-[var(--color-text-1)]">
            Daily Habit Check-in
          </h1>
          <p className="text-sm font-light leading-relaxed text-[var(--color-text-3)]">
            Observe where you showed up today. Progress is measured in quiet consistency, not
            perfection.
          </p>
        </div>

        <form onSubmit={handleSubmitCheckIn} className="space-y-10">
          {/* Section 1: Habits List */}
          <section className="space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-2)]">
              Micro-Habits Status
            </h2>

            <div className="space-y-3">
              {habits.map((habit, index) => {
                const currentStatus = habitStates[index] ?? 'not_started';

                return (
                  <Card
                    key={habit}
                    variant="glass-card"
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-5"
                  >
                    <div className="space-y-1">
                      <span className="font-display text-[10px] uppercase tracking-wider text-[var(--color-accent)]">
                        Habit 0{index + 1}
                      </span>
                      <p className="text-sm font-medium text-[var(--color-text-1)]">{habit}</p>
                    </div>

                    {/* 3-State Segmented Control */}
                    <div
                      className="inline-flex rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-1"
                      role="group"
                      aria-label={`Status for habit ${index + 1}`}
                    >
                      {(
                        [
                          {id: 'not_started', label: 'Not Started'},
                          {id: 'in_progress', label: 'In Progress'},
                          {id: 'done', label: 'Completed'},
                        ] as const
                      ).map((opt) => {
                        const isSelected = currentStatus === opt.id;
                        let activeStyles = 'bg-[var(--color-surface-3)] text-[var(--color-text-1)]';
                        if (isSelected) {
                          if (opt.id === 'done') {
                            activeStyles =
                              'border border-[var(--color-success)]/30 bg-[var(--color-success)]/15 font-bold text-[var(--color-success)] shadow-xs';
                          } else if (opt.id === 'in_progress') {
                            activeStyles =
                              'border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/15 font-bold text-[var(--color-warning)] shadow-xs';
                          } else {
                            activeStyles =
                              'bg-[var(--color-surface-3)] font-bold text-[var(--color-text-1)]';
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            onClick={() => handleSetHabitStatus(index, opt.id)}
                            aria-pressed={isSelected}
                            className={`rounded-lg px-3 py-1.5 font-display text-xs transition-all ${
                              isSelected
                                ? activeStyles
                                : 'text-[var(--color-text-3)] hover:text-[var(--color-text-1)]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                );
              })}
            </div>
          </section>

          {/* Section 2: Mood / Groundedness Rating */}
          <section className="space-y-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-2)]">
              State of Mind (1 = Distracted, 5 = Grounded)
            </h2>

            <div
              className="grid grid-cols-5 gap-2 sm:gap-3"
              role="group"
              aria-label="State of mind rating"
            >
              {[
                {val: 1, label: 'Distracted'},
                {val: 2, label: 'Resistant'},
                {val: 3, label: 'Steady'},
                {val: 4, label: 'Focused'},
                {val: 5, label: 'Grounded'},
              ].map((m) => {
                const isSelected = mood === m.val;

                return (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => setMood(m.val)}
                    aria-pressed={isSelected}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3.5 sm:p-4 transition-all ${
                      isSelected
                        ? 'scale-105 border-[var(--color-accent)]/50 bg-[var(--color-accent)]/10 text-[var(--color-accent)] shadow-[0_0_15px_rgba(103,232,249,0.15)]'
                        : 'border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-3)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-1)]'
                    }`}
                  >
                    <span className="font-display text-lg font-bold">{m.val}</span>
                    <span className="font-display text-[9px] uppercase tracking-wider mt-1">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section 3: Notes & Friction Points */}
          <section>
            <TextareaField
              id="checkin-note"
              label="Reflection Notes & Obstacles (Optional)"
              labelClassName="block font-display text-sm font-bold uppercase tracking-wider text-[var(--color-text-2)]"
              hint={
                <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-3)]">
                  <Lock size={12} className="text-[var(--color-accent)]" /> Private check-in log
                </span>
              }
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={1000}
              showCounter={true}
              placeholder="What friction did you notice? What helped you stay intentional?"
            />
          </section>

          {submitError ? (
            <p
              className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3 text-sm text-[var(--color-danger)]"
              role="alert"
            >
              {submitError}
            </p>
          ) : null}

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="secondary-button"
            >
              <ArrowLeft size={14} /> Back to Dashboard
            </button>

            <button type="submit" className="primary-button px-8" disabled={submitting}>
              <CheckCircle2 size={15} />
              {submitting ? 'Saving Check-in…' : 'Complete Check-in'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
