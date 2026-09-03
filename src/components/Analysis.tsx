import {AlertCircle, ArrowLeft, RefreshCcw} from 'lucide-react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {reflectionResponsesSchema} from '@shared/contracts';
import {AppHeader} from '@/components/AppHeader';
import {OrbVisualizer} from '@/components/primitives/OrbVisualizer';
import {formatServiceError} from '@/lib/errors';
import {createAnalysisJob, getAnalysisRecord} from '@/services/analysisService';
import {useBecomingStore} from '@/store/useBecomingStore';

const STEPS = [
  'Securing your reflection…',
  'Finding recurring patterns…',
  'Comparing plausible paths…',
  'Turning insight into action…',
];

export function Analysis() {
  const params = useParams<{analysisId?: string}>();
  const navigate = useNavigate();
  const {responses, activeAnalysisId, setActiveAnalysisId, setAnalysis} = useBecomingStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  const finish = useCallback(
    (analysisId: string, analysis: Parameters<typeof setAnalysis>[0]) => {
      setAnalysis(analysis);
      navigate(`/results/${analysisId}`, {replace: true});
    },
    [navigate, setAnalysis],
  );

  useEffect(() => {
    const interval = window.setInterval(
      () => setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1)),
      2_800,
    );
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | undefined;
    const parsedResponses = reflectionResponsesSchema.safeParse(responses);
    const analysisId = params.analysisId ?? activeAnalysisId ?? crypto.randomUUID();

    if (!params.analysisId) {
      setActiveAnalysisId(analysisId);
      navigate(`/analysis/${analysisId}`, {replace: true});
    }

    async function poll() {
      try {
        const record = await getAnalysisRecord(analysisId);
        if (cancelled) return;
        if (record?.status === 'completed' && record.result) {
          finish(analysisId, record.result);
          return;
        }
        if (record?.status === 'failed') {
          setError('The previous attempt did not complete. You can retry safely.');
          return;
        }
        pollTimer = window.setTimeout(() => void poll(), 2_000);
      } catch (pollError) {
        if (!cancelled) setError(formatServiceError(pollError));
      }
    }

    async function start() {
      setError(null);
      if (!parsedResponses.success) {
        await poll();
        return;
      }
      try {
        const result = await createAnalysisJob({
          idempotencyKey: analysisId,
          responses: parsedResponses.data,
        });
        if (cancelled) return;
        if (result.status === 'completed' && result.analysis) {
          finish(analysisId, result.analysis);
        } else {
          await poll();
        }
      } catch (requestError) {
        if (!cancelled) setError(formatServiceError(requestError));
      }
    }

    void start();
    return () => {
      cancelled = true;
      if (pollTimer) window.clearTimeout(pollTimer);
    };
  }, [
    activeAnalysisId,
    finish,
    navigate,
    params.analysisId,
    responses,
    retryNonce,
    setActiveAnalysisId,
  ]);

  function retry() {
    setCurrentStep(0);
    setError(null);
    setRetryNonce((value) => value + 1);
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <AppHeader backTo="/dashboard" />

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        {error ? (
          /* Error State Card matching becoming_v2_synthesis_error_desktop */
          <motion.div
            initial={prefersReducedMotion ? false : {opacity: 0, scale: 0.95}}
            animate={{opacity: 1, scale: 1}}
            className="glass-panel-strong max-w-lg rounded-3xl p-8 sm:p-10 text-center border border-red-400/20"
            role="alert"
          >
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/30 bg-red-400/10 text-red-300">
              <AlertCircle size={28} />
            </div>

            <h1 className="font-display text-2xl font-bold text-white">Synthesis Paused</h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">{error}</p>
            <p className="mt-2 text-xs text-slate-400 light:text-slate-600">
              Your reflection answers remain safely stored in your session.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate('/reflect/review')}
                className="secondary-button"
              >
                <ArrowLeft size={14} /> Review Answers
              </button>
              <button className="primary-button" type="button" onClick={retry}>
                <RefreshCcw size={14} /> Retry Synthesis
              </button>
            </div>
          </motion.div>
        ) : (
          /* Processing Synthesis State */
          <div className="space-y-12 max-w-lg mx-auto" role="status" aria-live="polite">
            <OrbVisualizer size="lg" />

            <div className="space-y-3">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400">
                Synthesizing Trajectories
              </span>

              <AnimatePresence mode="wait">
                <motion.h1
                  key={currentStep}
                  initial={prefersReducedMotion ? false : {opacity: 0, y: 6}}
                  animate={{opacity: 1, y: 0}}
                  exit={{opacity: 0, y: -6}}
                  transition={{duration: 0.3}}
                  className="font-display text-2xl font-light italic tracking-tight sm:text-3xl text-white"
                >
                  {STEPS[currentStep]}
                </motion.h1>
              </AnimatePresence>
            </div>

            {/* Stepper Dots */}
            <div className="flex justify-center gap-2" aria-hidden="true">
              {STEPS.map((step, index) => (
                <span
                  key={step}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-10 bg-cyan-400'
                      : index < currentStep
                        ? 'w-4 bg-cyan-400/40'
                        : 'w-2 bg-white/10'
                  }`}
                />
              ))}
            </div>

            <p className="mx-auto max-w-sm text-xs leading-relaxed text-slate-400 light:text-slate-600">
              Your request is idempotent. You can safely keep this tab open or navigate away; your
              analysis will be waiting in your history.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
