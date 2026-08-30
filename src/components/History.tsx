import {ArrowRight, Clock3, RefreshCcw, Trash2} from 'lucide-react';
import {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';

import {AppHeader} from '@/components/AppHeader';
import {formatServiceError} from '@/lib/errors';
import {
  deleteAnalysisRecord,
  getAnalysisHistory,
  type AnalysisRecord,
} from '@/services/analysisService';
import {useBecomingStore} from '@/store/useBecomingStore';

export function History() {
  const user = useBecomingStore((state) => state.user);
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      setRecords(await getAnalysisHistory(user.uid));
    } catch (loadError) {
      setError(formatServiceError(loadError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    let active = true;
    void getAnalysisHistory(user.uid)
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

  async function remove(record: AnalysisRecord) {
    const confirmed = window.confirm(
      'Delete this analysis and its private reflection permanently?',
    );
    if (!confirmed) return;
    try {
      await deleteAnalysisRecord(record.id);
      setRecords((current) => current.filter((item) => item.id !== record.id));
    } catch (deleteError) {
      setError(formatServiceError(deleteError));
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader backTo="/" />
      <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 md:px-10">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <p className="mb-3 font-display text-[10px] uppercase tracking-[0.4em] text-cyan-400">
              Private archive
            </p>
            <h1 className="text-4xl font-light tracking-tight md:text-5xl">
              Your reflection history
            </h1>
          </div>
          <Link className="primary-button" to="/reflect">
            New reflection <ArrowRight size={15} />
          </Link>
        </div>

        {error ? (
          <div
            className="mb-7 flex items-center justify-between gap-4 rounded-2xl border border-red-400/20 bg-red-950/20 p-5 text-sm text-red-200"
            role="alert"
          >
            <span>{error}</span>
            <button
              className="icon-button"
              type="button"
              onClick={() => void load()}
              aria-label="Retry history"
            >
              <RefreshCcw size={16} />
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="glass rounded-3xl p-10 text-center text-sm text-white/45" role="status">
            Loading your private archive…
          </div>
        ) : records.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <Clock3 className="mx-auto mb-5 text-cyan-400/60" size={30} />
            <h2 className="mb-3 font-display text-xl font-semibold">No archived analysis yet</h2>
            <p className="mx-auto mb-7 max-w-md text-sm leading-7 text-gray-400">
              Complete a reflection and the result will be available here across sessions.
            </p>
            <Link className="secondary-button mx-auto" to="/reflect">
              Begin your first reflection
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {records.map((record) => (
              <li
                className="glass flex flex-col justify-between gap-5 rounded-3xl p-6 sm:flex-row sm:items-center"
                key={record.id}
              >
                <div>
                  <p className="mb-2 font-display text-[10px] uppercase tracking-[0.3em] text-cyan-400/70">
                    {record.status}
                  </p>
                  <h2 className="font-display text-lg font-semibold">
                    {record.result?.identity.archetype ?? 'Analysis in progress'}
                  </h2>
                  <p className="mt-2 text-xs text-white/40">
                    {record.createdAt?.toLocaleString() ?? 'Timestamp unavailable'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {record.status === 'completed' ? (
                    <Link className="secondary-button" to={`/results/${record.id}`}>
                      Open <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link className="secondary-button" to={`/analysis/${record.id}`}>
                      Resume <RefreshCcw size={14} />
                    </Link>
                  )}
                  <button
                    className="icon-button text-red-300"
                    type="button"
                    onClick={() => void remove(record)}
                    aria-label="Delete analysis"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
