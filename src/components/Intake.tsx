import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  Sparkles,
  Clock,
  Shield,
} from 'lucide-react';
import {AnimatePresence, motion, useReducedMotion} from 'motion/react';
import {useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';

import {AppHeader} from '@/components/AppHeader';
import {UnsavedChangesDialog} from '@/components/modals/UnsavedChangesDialog';
import {Card} from '@/components/primitives/Card';
import {ScoreField, TextareaField} from '@/components/primitives/Field';
import {REFLECTION_QUESTIONS} from '@/data/questions';
import {useBecomingStore} from '@/store/useBecomingStore';

export function Intake() {
  const {responses, currentQuestionIndex, setCurrentQuestionIndex, setResponse} =
    useBecomingStore();

  const [hasStartedIntro, setHasStartedIntro] = useState(() => {
    // If user already has any answer written, skip intro
    return Object.values(responses).some((val) => Boolean(val?.trim()));
  });

  const [unsavedDialogOpen, setUnsavedDialogOpen] = useState(false);
  const safeQuestionIndex =
    currentQuestionIndex >= 0 && currentQuestionIndex < REFLECTION_QUESTIONS.length
      ? currentQuestionIndex
      : 0;
  const question = REFLECTION_QUESTIONS[safeQuestionIndex]!;

  const [input, setInput] = useState(responses[question.id] ?? '');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (hasStartedIntro) {
      textareaRef.current?.focus();
    }
  }, [safeQuestionIndex, hasStartedIntro]);

  // For question 7 (disciplineScore), parse rating 1-10 if present
  const isScoreQuestion = question.id === 'disciplineScore';

  function handleScoreSelect(score: number) {
    // If input already has text after score, preserve it
    const parts = input.split(' — ');
    const reason =
      parts.length > 1 ? parts.slice(1).join(' — ') : parts[0]?.match(/^\d+$/) ? '' : input;
    const combined = reason.trim() ? `${score}/10 — ${reason.trim()}` : `${score}/10`;
    setInput(combined);
    setResponse(question.id, combined);
  }

  const currentScoreVal = isScoreQuestion ? parseInt(input.match(/^(\d+)/)?.[1] ?? '0', 10) : 0;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answer = input.trim();
    const minimumLength = isScoreQuestion ? 1 : 3;
    if (answer.length < minimumLength) {
      setError('Please add a little more detail before continuing.');
      return;
    }

    setResponse(question.id, answer);

    if (safeQuestionIndex < REFLECTION_QUESTIONS.length - 1) {
      const nextIndex = safeQuestionIndex + 1;
      const nextQuestion = REFLECTION_QUESTIONS[nextIndex]!;
      setInput(responses[nextQuestion.id] ?? '');
      setError(null);
      setCurrentQuestionIndex(nextIndex);
      return;
    }

    // Finished 8 questions -> go to review screen!
    navigate('/reflect/review');
  }

  function goBack() {
    if (safeQuestionIndex === 0) {
      const hasAnyInput = Object.values(responses).some((v) => Boolean(v?.trim()));
      if (hasAnyInput) {
        setUnsavedDialogOpen(true);
      } else {
        navigate('/dashboard');
      }
      return;
    }
    const previousIndex = safeQuestionIndex - 1;
    const previousQuestion = REFLECTION_QUESTIONS[previousIndex]!;
    setInput(responses[previousQuestion.id] ?? '');
    setError(null);
    setCurrentQuestionIndex(previousIndex);
  }

  const progress = ((safeQuestionIndex + 1) / REFLECTION_QUESTIONS.length) * 100;

  // Intro Screen View
  if (!hasStartedIntro) {
    return (
      <div className="min-h-screen flex flex-col transition-colors">
        <AppHeader backTo="/dashboard" />

        <main className="flex-1 flex items-center justify-center py-16 px-5 sm:px-8">
          <motion.div
            initial={prefersReducedMotion ? false : {opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: prefersReducedMotion ? 0 : 0.6}}
            className="w-full max-w-2xl mx-auto flex flex-col gap-10 text-center"
          >
            <div>
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.35em] text-[var(--color-accent)]">
                Before You Begin
              </span>
              <h1 className="mt-4 text-3xl font-extralight tracking-tight sm:text-5xl text-[var(--color-text-1)]">
                Eight honest questions. <br />
                <span className="font-serif italic text-[var(--color-text-2)]">No judgment.</span>
              </h1>
              <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-[var(--color-text-3)] font-light">
                This space is designed to help you pause and observe where your current habits are
                taking you. There are no wrong answers.
              </p>
            </div>

            {/* Bento Grid */}
            <div className="grid gap-4 sm:grid-cols-3 text-left">
              <Card variant="glass-card" className="rounded-2xl p-5">
                <Clock className="mb-3 text-[var(--color-accent)]" size={20} />
                <h3 className="font-display text-sm font-bold text-[var(--color-text-1)]">
                  8 to 12 Minutes
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-3)]">
                  Quiet, unhurried focus.
                </p>
              </Card>

              <Card variant="glass-card" className="rounded-2xl p-5">
                <CheckCircle2 className="mb-3 text-[var(--color-success)]" size={20} />
                <h3 className="font-display text-sm font-bold text-[var(--color-text-1)]">
                  Auto-Saving
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-3)]">
                  Your session persists on refresh.
                </p>
              </Card>

              <Card variant="glass-card" className="rounded-2xl p-5">
                <Shield className="mb-3 text-[var(--color-violet)]" size={20} />
                <h3 className="font-display text-sm font-bold text-[var(--color-text-1)]">
                  Private Sanctuary
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-3)]">
                  Owner-only cloud storage with direct client writes disabled.
                </p>
              </Card>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setHasStartedIntro(true)}
                className="primary-button px-9 py-3.5 text-xs font-bold shadow-[0_0_20px_rgba(103,232,249,0.3)]"
              >
                <Sparkles size={15} /> Begin Reflection
              </button>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // Active Reflection Question View
  return (
    <div className="min-h-screen flex flex-col transition-colors">
      <AppHeader backTo="/dashboard" />

      <main className="flex-1 mx-auto flex w-full max-w-2xl flex-col px-5 pb-24 pt-8 md:pt-14">
        {/* Progress header */}
        <div className="mb-6 flex items-center justify-between font-display text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-3)]">
          <span>
            Question {safeQuestionIndex + 1} of {REFLECTION_QUESTIONS.length}
          </span>
          <span className="font-bold text-[var(--color-accent)]">
            {Math.round(progress)}% Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div
          className="mb-10 h-1 w-full overflow-hidden rounded-full bg-[var(--color-surface-3)]"
          aria-hidden="true"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full"
            animate={{width: `${progress}%`}}
            transition={{duration: prefersReducedMotion ? 0 : 0.3}}
          />
        </div>

        <progress className="sr-only" value={progress} max="100">
          {progress}%
        </progress>

        <AnimatePresence mode="wait">
          <motion.form
            key={question.id}
            initial={prefersReducedMotion ? false : {opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -10}}
            transition={{duration: prefersReducedMotion ? 0 : 0.25}}
            className="glass-panel-strong rounded-3xl p-6 sm:p-10 shadow-2xl"
            onSubmit={submit}
          >
            <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Current Prompt
            </span>

            {/* If Question 7 (disciplineScore): Render ScoreField with accessible buttons */}
            {isScoreQuestion ? (
              <ScoreField
                id="discipline-score"
                label="Rate your current discipline (1 = Low, 10 = High)"
                labelClassName="block font-display text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-3)]"
                min={1}
                max={10}
                value={currentScoreVal}
                onChange={(val) => handleScoreSelect(Number(val))}
                className="mt-6"
              />
            ) : null}

            {/* Answer Textarea via TextareaField primitive */}
            <div className="mt-6">
              <TextareaField
                ref={textareaRef}
                id="reflection-answer"
                label={question.prompt}
                labelClassName="block font-display text-xl font-light leading-relaxed text-[var(--color-text-1)] sm:text-2xl"
                hint={
                  <span className="flex flex-col gap-1.5">
                    <span>{question.hint}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[var(--color-text-3)]">
                      <LockKeyhole size={12} className="text-[var(--color-accent)]" /> Private to
                      your account
                    </span>
                  </span>
                }
                value={input}
                rows={isScoreQuestion ? 4 : 5}
                maxLength={1200}
                showCounter={true}
                error={error}
                placeholder={
                  isScoreQuestion
                    ? 'Add brief context on why you chose this score…'
                    : 'Write honestly. There is no right or wrong answer.'
                }
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-6">
              <button className="secondary-button" type="button" onClick={goBack}>
                <ArrowLeft size={14} /> Back
              </button>

              <button className="primary-button" type="submit" disabled={!input.trim()}>
                <span>
                  {safeQuestionIndex === REFLECTION_QUESTIONS.length - 1
                    ? 'Review Answers'
                    : 'Continue'}
                </span>
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </main>

      <UnsavedChangesDialog
        isOpen={unsavedDialogOpen}
        onClose={() => setUnsavedDialogOpen(false)}
        onConfirmLeave={() => {
          setUnsavedDialogOpen(false);
          navigate('/dashboard');
        }}
      />
    </div>
  );
}
