import {AlertCircle, RefreshCcw} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useCallback, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

import {reflectionResponsesSchema} from '@shared/contracts';
import {AppHeader} from '@/components/AppHeader';
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
      2_500,
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
    setRetryNonce((value) => value + 1);
  }

  return (
    <div className="min-h-screen">
      <AppHeader backTo="/reflect" />
      <div className="flex min-h-[75vh] flex-col items-center justify-center px-6 text-center">
        {error ? (
          <div className="glass max-w-lg rounded-3xl p-8" role="alert">
            <AlertCircle className="mx-auto mb-5 text-red-300" size={30} />
            <h1 className="mb-3 font-display text-2xl font-semibold">The analysis paused</h1>
            <p className="mb-7 text-sm leading-7 text-gray-400">{error}</p>
            <button className="primary-button mx-auto" type="button" onClick={retry}>
              <RefreshCcw size={15} /> Retry safely
            </button>
          </div>
        ) : (
          <div className="space-y-14" role="status" aria-live="polite">
            <div className="relative mx-auto h-36 w-36">
              <motion.div
                className="absolute inset-0 rounded-full border border-cyan-500/25"
                animate={{rotate: 360}}
                transition={{duration: 10, repeat: Infinity, ease: 'linear'}}
              />
              <motion.div
                className="absolute inset-5 rounded-full border border-purple-500/20"
                animate={{rotate: -360}}
                transition={{duration: 14, repeat: Infinity, ease: 'linear'}}
              />
              <div className="absolute inset-12 rounded-full bg-cyan-400/15 blur-xl" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{opacity: 0, y: 8}}
                animate={{opacity: 1, y: 0}}
                exit={{opacity: 0, y: -8}}
              >
                <h1 className="text-xl font-light italic tracking-tight md:text-2xl">
                  {STEPS[currentStep]}
                </h1>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-center gap-2" aria-hidden="true">
              {STEPS.map((step, index) => (
                <span
                  key={step}
                  className={`h-0.5 rounded-full transition-all ${index === currentStep ? 'w-8 bg-cyan-400' : 'w-2 bg-white/15'}`}
                />
              ))}
            </div>
            <p className="max-w-md text-xs leading-6 text-white/35">
              Your request is idempotent. Refreshing this page will not create a duplicate paid
              analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
