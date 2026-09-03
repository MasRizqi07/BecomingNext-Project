import {ArrowRight, Clock, Plus, RefreshCcw, Sparkles, Trash2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';

import {AppHeader} from '@/components/AppHeader';
import {DeleteAnalysisDialog} from '@/components/modals/DeleteAnalysisDialog';
import {Card} from '@/components/primitives/Card';
import {formatServiceError} from '@/lib/errors';
import {
  deleteAnalysisRecord,
  getAnalysisHistory,
  type AnalysisRecord,
} from '@/services/analysisService';
import {useBecomingStore} from '@/store/useBecomingStore';

type StatusFilter = 'all' | 'completed' | 'pending' | 'failed';

export function History() {
  const user = useBecomingStore((state) => state.user);
  const resetReflection = useBecomingStore((state) => state.resetReflection);
  const navigate = useNavigate();

  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [recordToDelete, setRecordToDelete] = useState<AnalysisRecord | null>(null);
  const [toast, setToast] = useState<ToastItem | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    let active = true;

    void getAnalysisHistory(uid)
      .then((items) => {
        if (active) setRecords(items);
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
  }, [user]);

  async function loadData() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const items = await getAnalysisHistory(user.uid);
      setRecords(items);
    } catch (loadError) {
      setError(formatServiceError(loadError));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmDelete() {
    if (!recordToDelete) return;
    try {
      await deleteAnalysisRecord(recordToDelete.id);
      setRecords((prev) => prev.filter((r) => r.id !== recordToDelete.id));
      setToast({id: 'del-succ', message: 'Analysis removed permanently.', type: 'success'});
    } catch (err) {
      setToast({id: 'del-err', message: formatServiceError(err), type: 'error'});
    } finally {
      setRecordToDelete(null);
    }
  }

  const filteredRecords = records.filter((r) => {
    if (filter === 'all') return true;
    return r.status === filter;
  });

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <AppHeader backTo="/dashboard" />

      <main className="flex-1 w-full max-w-5xl mx-auto px-5 py-10 sm:px-8 md:py-16 flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[var(--color-border)] pb-8">
          <div>
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-accent)]">
              Private Archive
            </span>
            <h1 className="mt-2 text-3xl font-extralight tracking-tight sm:text-5xl text-[var(--color-text-1)]">
              Reflection History
            </h1>
            <p className="mt-2 text-sm font-light text-[var(--color-text-3)]">
              Review and revisit your previous introspection trajectories and guidance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              resetReflection();
              navigate('/reflect');
            }}
            className="primary-button text-xs font-bold whitespace-nowrap shadow-[0_0_15px_rgba(103,232,249,0.2)]"
          >
            <Plus size={15} /> New Reflection
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              {id: 'all', label: 'All Reflections'},
              {id: 'completed', label: 'Ready'},
              {id: 'pending', label: 'In Progress'},
              {id: 'failed', label: 'Needs Attention'},
            ] as const
          ).map((chip) => {
            const isSelected = filter === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setFilter(chip.id)}
                aria-pressed={isSelected}
                className={`rounded-full px-4 py-2 font-display text-xs font-semibold tracking-wider transition-all ${
                  isSelected
                    ? 'bg-[var(--color-accent)] text-[var(--color-canvas)] shadow-xs font-bold'
                    : 'border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text-3)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-1)]'
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>

        {error ? (
          <div
            className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-sm text-[var(--color-danger)]"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="icon-button h-8 w-8"
              type="button"
              onClick={() => void loadData()}
              aria-label="Retry loading history"
            >
              <RefreshCcw size={14} />
            </button>
          </div>
        ) : null}

        {/* Loading / List / Empty */}
        {loading ? (
          <div
            className="glass-panel flex min-h-64 flex-col items-center justify-center rounded-3xl p-12 text-center"
            role="status"
          >
            <div className="h-8 w-8 animate-spin rounded-full border border-cyan-400/20 border-t-cyan-400" />
            <p className="mt-4 font-display text-xs uppercase tracking-[0.25em] text-[var(--color-text-3)]">
              Loading your private archive…
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <Card variant="glass-card" className="p-12 text-center">
            <Sparkles className="mx-auto mb-4 text-[var(--color-accent)] opacity-60" size={32} />
              No Archived Reflections
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-xs leading-relaxed text-[var(--color-text-3)]">
              {filter !== 'all'
                ? 'No reflections matched your current filter criteria.'
                : 'Your completed analyses and in-progress sessions will appear here.'}
            </p>
            <div className="mt-6">
              <Link to="/reflect" className="primary-button text-xs">
                Begin a Reflection
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
              const isCompleted = rec.status === 'completed';
              const dateString = rec.createdAt ? rec.createdAt.toLocaleDateString() : 'Recent';

              return (
                <Card
                  key={rec.id}
                  variant="glass-card"
                  className="card-interactive group flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-7"
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <Clock size={12} /> {dateString}
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-bold text-[var(--color-text-1)]">
                      {rec.result?.identity.archetype ?? 'Reflection Synthesis'}
                    </h2>

                    {rec.result?.identity.description ? (
                      <p className="line-clamp-2 max-w-xl text-xs font-light leading-relaxed text-[var(--color-text-3)]">
                        "{rec.result.identity.description}"
                      </p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <Link to={`/results/${rec.id}`} className="primary-button text-xs font-bold">
                        Open <ArrowRight size={14} />
                      </Link>
                    ) : (
                      <Link to={`/analysis/${rec.id}`} className="primary-button text-xs font-bold">
                        Resume <RefreshCcw size={14} />
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={() => setRecordToDelete(rec)}
                      className="icon-button text-[var(--color-text-3)] hover:text-[var(--color-danger)]"
                      aria-label="Delete reflection"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <DeleteAnalysisDialog
        isOpen={Boolean(recordToDelete)}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
