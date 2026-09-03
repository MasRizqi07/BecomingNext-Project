import {ArrowLeft, Edit3, ShieldCheck, Sparkles} from 'lucide-react';
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';

import {reflectionResponsesSchema} from '@shared/contracts';
import {AppHeader} from '@/components/AppHeader';
import {Card} from '@/components/primitives/Card';
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
          <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-accent)]">
            Final Step
          </span>
          <h1 className="font-display text-3xl font-light tracking-tight sm:text-5xl text-[var(--color-text-1)]">
            Review Your Reflection
          </h1>
          <p className="text-sm font-light leading-relaxed text-[var(--color-text-3)]">
            Take a breath. Review your eight answers before generating your trajectory analysis.
          </p>
        </div>

        {error ? (
          <div
            className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-4 text-xs text-[var(--color-danger)]"
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
              <Card
                key={q.id}
                variant="glass-card"
                className="group relative rounded-2xl p-6 transition hover:border-[var(--color-border-strong)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-display text-[10px] font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                      Prompt 0{index + 1}
                    </span>
                    <h3 className="mt-1 font-display text-sm font-bold text-[var(--color-text-1)] sm:text-base">
                      {q.prompt}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleEditQuestion(index)}
                    className="icon-button h-8 w-8 shrink-0 text-[var(--color-text-3)] hover:text-[var(--color-accent)]"
                    aria-label={`Edit answer for question ${index + 1}`}
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                <div className="mt-4 border-t border-[var(--color-border)] pt-3">
                  {isAnswered ? (
                    <p className="text-sm font-light leading-relaxed text-[var(--color-text-2)]">
                      {answer}
                    </p>
                  ) : (
                    <p className="text-xs italic text-[var(--color-warning)] opacity-80">
                      Not yet answered. Click edit to provide a reflection.
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </section>

        {/* Trust & Boundary Notice */}
        <div className="glass-panel rounded-2xl border border-[var(--color-accent)]/25 p-5 flex items-start gap-3 text-xs text-[var(--color-text-2)] leading-relaxed">
          <ShieldCheck className="shrink-0 mt-0.5 text-[var(--color-accent)]" size={18} />
          <p>
            By proceeding, your reflections travel over HTTPS to the server-side analysis service.
            They are not published; review the privacy boundary for provider processing details.
          </p>
        </div>

        {/* Action Footer */}
        <footer className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 border-t border-[var(--color-border)] pt-8 pb-12">
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
