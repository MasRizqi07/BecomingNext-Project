import {ArrowLeft, Edit3, ShieldCheck, Sparkles} from 'lucide-react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {reflectionResponsesSchema} from '@shared/contracts';
import {AppHeader} from '@/components/AppHeader';
import {REFLECTION_QUESTIONS} from '@/data/questions';
import {useBecomingStore} from '@/store/useBecomingStore';

export function ReviewReflection() {
  const {responses, setCurrentQuestionIndex, setActiveAnalysisId, setAnalysis} = useBecomingStore();

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  function handleEditQuestion(index: number) {
    setCurrentQuestionIndex(index);
    navigate('/reflect');
  }

  function handleCreateAnalysis() {
    setError(null);
    const parsed = reflectionResponsesSchema.safeParse(responses);
    if (!parsed.success) {
      setError('Please review your answers. One or more responses are too short or incomplete.');
      return;
    }

    setSubmitting(true);
    setActiveAnalysisId(null);
    setAnalysis(null);
    navigate('/analysis');
  }

  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <AppHeader backTo="/reflect" />

      <main className="flex-1 w-full max-w-3xl mx-auto px-5 py-10 sm:px-8 md:py-16 flex flex-col gap-10">
        {/* Header */}
        <div className="space-y-3">
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-cyan-400">
            Final Step
          </span>
          <h1 className="font-display text-3xl font-light tracking-tight sm:text-5xl text-white">
            Review Your Reflection
          </h1>
          <p className="text-sm font-light leading-relaxed text-slate-400">
            Take a breath. Review your eight answers before generating your trajectory analysis.
          </p>
        </div>

        {error ? (
          <div
            className="rounded-2xl border border-red-400/20 bg-red-950/20 p-4 text-xs text-red-300"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        {/* 8 Answer Cards */}
        <section className="flex flex-col gap-4">
          {REFLECTION_QUESTIONS.map((q, index) => {
            const answer = responses[q.id]?.trim() || '';
            const isAnswered = answer.length > 0;

            return (
              <div
                key={q.id}
                className="glass-panel group relative rounded-2xl p-6 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                      Prompt 0{index + 1}
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-white sm:text-base">
                      {q.prompt}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEditQuestion(index)}
                    className="icon-button h-8 w-8 shrink-0 text-slate-400 hover:text-cyan-300"
                    aria-label={`Edit answer for question ${index + 1}`}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                <div className="mt-4 border-t border-white/5 pt-3">
                  {isAnswered ? (
                    <p className="text-sm font-light leading-relaxed text-slate-200">{answer}</p>
                  ) : (
                    <p className="text-xs italic text-amber-300/80">
                      Not yet answered. Click edit to provide a reflection.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </section>

        {/* Trust & Boundary Notice */}
        <div className="glass-panel rounded-2xl border border-cyan-400/25 p-5 flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
          <ShieldCheck className="text-cyan-400 shrink-0 mt-0.5" size={18} />
          <p>
            By proceeding, your reflections are sent to our isolated, encrypted backend service to
            synthesize your dual-path analysis. No data is published or shared.
          </p>
        </div>

        {/* Action Footer */}
        <footer className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8 pb-12">
          <button
            type="button"
            onClick={() => {
              setCurrentQuestionIndex(7);
              navigate('/reflect');
            }}
            className="secondary-button w-full sm:w-auto"
          >
            <ArrowLeft size={14} /> Back to Prompts
          </button>

          <button
            type="button"
            disabled={submitting}
            onClick={handleCreateAnalysis}
            className="primary-button w-full sm:w-auto px-8 py-3.5 text-xs font-bold shadow-[0_0_20px_rgba(103,232,249,0.3)]"
          >
            {submitting ? (
              <span>Securing reflection…</span>
            ) : (
              <>
                <span>Create Trajectory Analysis</span>
                <Sparkles size={14} />
              </>
            )}
          </button>
        </footer>
      </main>
    </div>
  );
}
