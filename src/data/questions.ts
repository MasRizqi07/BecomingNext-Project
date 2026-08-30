import type {ReflectionQuestionId} from '@shared/contracts';

export interface ReflectionQuestion {
  id: ReflectionQuestionId;
  prompt: string;
  hint: string;
}

export const REFLECTION_QUESTIONS: readonly ReflectionQuestion[] = [
  {
    id: 'fearedFuture',
    prompt: 'What future are you most afraid of right now?',
    hint: 'Name the outcome honestly. You do not need to make it sound polished.',
  },
  {
    id: 'limitingHabit',
    prompt: 'What habit is silently holding you back?',
    hint: 'Think about a repeated behavior, not a personality label.',
  },
  {
    id: 'disconnectionMoment',
    prompt: 'When do you feel disconnected from the person you want to be?',
    hint: 'A recent situation or trigger is more useful than a general answer.',
  },
  {
    id: 'chosenLife',
    prompt: 'If money and fear disappeared, what kind of life would you choose?',
    hint: 'Describe a normal day in that life.',
  },
  {
    id: 'avoidedStart',
    prompt: 'What are you avoiding because it feels too difficult to start?',
    hint: 'Choose one concrete project, conversation, or decision.',
  },
  {
    id: 'desiredIdentity',
    prompt: 'What version of yourself are you trying to become?',
    hint: 'Focus on qualities and behaviors you can practice.',
  },
  {
    id: 'disciplineScore',
    prompt: 'From 1–10, how disciplined have you been lately?',
    hint: 'Add one short reason for your score.',
  },
  {
    id: 'uncommittedDream',
    prompt: 'What dream are you afraid to commit to—even privately?',
    hint: 'This reflection stays private to your account.',
  },
] as const;
