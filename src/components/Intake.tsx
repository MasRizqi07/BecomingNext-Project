import {ArrowLeft, ArrowRight, LockKeyhole} from 'lucide-react';
import {AnimatePresence, motion} from 'motion/react';
import {useEffect, useRef, useState} from 'react';
import type {FormEvent} from 'react';
import {useNavigate} from 'react-router-dom';

import {reflectionResponsesSchema} from '@shared/contracts';
import {AppHeader} from '@/components/AppHeader';
import {REFLECTION_QUESTIONS} from '@/data/questions';
import {useBecomingStore} from '@/store/useBecomingStore';

export function Intake() {
  const {
    responses,
    currentQuestionIndex,
    setCurrentQuestionIndex,
    setResponse,
    setActiveAnalysisId,
    setAnalysis,
  } = useBecomingStore();
  const safeQuestionIndex =
    currentQuestionIndex >= 0 && currentQuestionIndex < REFLECTION_QUESTIONS.length
      ? currentQuestionIndex
      : 0;
  const question = REFLECTION_QUESTIONS[safeQuestionIndex]!;
  const [input, setInput] = useState(responses[question.id] ?? '');
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    textareaRef.current?.focus();
  }, [safeQuestionIndex]);

  const currentQuestion = question;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const answer = input.trim();
    const minimumLength = currentQuestion.id === 'disciplineScore' ? 1 : 3;
    if (answer.length < minimumLength) {
      setError('Add a little more detail before continuing.');
      return;
    }

    const nextResponses = {...responses, [currentQuestion.id]: answer};
    setResponse(currentQuestion.id, answer);
    if (safeQuestionIndex < REFLECTION_QUESTIONS.length - 1) {
      const nextIndex = safeQuestionIndex + 1;
      const nextQuestion = REFLECTION_QUESTIONS[nextIndex]!;
      setInput(responses[nextQuestion.id] ?? '');
      setError(null);
      setCurrentQuestionIndex(nextIndex);
      return;
    }

    if (!reflectionResponsesSchema.safeParse(nextResponses).success) {
      setError('One or more reflections are incomplete. Review the earlier answers.');
      return;
    }
    setActiveAnalysisId(null);
    setAnalysis(null);
    navigate('/analysis');
  }

  function goBack() {
    if (safeQuestionIndex === 0) {
      navigate('/');
      return;
    }
    const previousIndex = safeQuestionIndex - 1;
    const previousQuestion = REFLECTION_QUESTIONS[previousIndex]!;
    setInput(responses[previousQuestion.id] ?? '');
    setError(null);
    setCurrentQuestionIndex(previousIndex);
  }

  const progress = ((safeQuestionIndex + 1) / REFLECTION_QUESTIONS.length) * 100;

  return (
    <div className="min-h-screen">
      <AppHeader backTo="/" />
      <div className="mx-auto flex max-w-2xl flex-col px-5 pb-20 pt-12 md:pt-20">
        <div className="mb-10 flex items-center justify-between text-[10px] uppercase tracking-[0.3em] text-white/45">
          <span>
            Reflection {safeQuestionIndex + 1} / {REFLECTION_QUESTIONS.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
        <div className="mb-12 h-1 overflow-hidden rounded-full bg-white/5" aria-hidden="true">
          <motion.div className="h-full bg-cyan-400" animate={{width: `${progress}%`}} />
        </div>
        <progress className="sr-only" value={progress} max="100">
          {progress}%
        </progress>

        <AnimatePresence mode="wait">
          <motion.form
            key={question.id}
            initial={{opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -12}}
            transition={{duration: 0.3}}
            className="glass rounded-4xl p-7 shadow-2xl md:p-12"
            onSubmit={submit}
          >
            <p className="mb-6 font-display text-[10px] uppercase tracking-[0.35em] text-cyan-400">
              Current reflection
            </p>
            <label
              className="mb-8 block text-2xl font-light leading-relaxed text-gray-100 md:text-3xl"
              htmlFor="reflection-answer"
            >
              {question.prompt}
            </label>
            <p className="mb-4 text-sm leading-6 text-white/45" id="reflection-hint">
              {question.hint}
            </p>
            <textarea
              ref={textareaRef}
              id="reflection-answer"
              value={input}
              rows={5}
              maxLength={1200}
              aria-describedby="reflection-hint reflection-count"
              className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 p-5 text-base leading-7 text-white outline-none transition focus:border-cyan-400/70 focus:ring-4 focus:ring-cyan-400/10"
              placeholder="Write honestly. There is no perfect answer."
              onChange={(event) => setInput(event.target.value)}
            />
            <div className="mt-3 flex items-center justify-between text-xs text-white/35">
              <span className="flex items-center gap-2">
                <LockKeyhole size={12} /> Private to your account
              </span>
              <span id="reflection-count">{input.length}/1200</span>
            </div>
            {error ? (
              <p className="mt-5 text-sm text-red-300" role="alert">
                {error}
              </p>
            ) : null}
            <div className="mt-10 flex items-center justify-between gap-4">
              <button className="secondary-button" type="button" onClick={goBack}>
                <ArrowLeft size={15} /> Back
              </button>
              <button className="primary-button" type="submit" disabled={!input.trim()}>
                {safeQuestionIndex === REFLECTION_QUESTIONS.length - 1
                  ? 'Create analysis'
                  : 'Continue'}
                <ArrowRight size={15} />
              </button>
            </div>
          </motion.form>
        </AnimatePresence>
      </div>
    </div>
  );
}
