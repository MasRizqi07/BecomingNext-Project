import type {AnalysisResult} from '@shared/contracts';

export const DEMO_ANALYSIS: AnalysisResult = {
  identity: {
    archetype: 'The Quiet Builder',
    description:
      'You are not short on ambition; you are learning to replace bursts of intensity with a rhythm you can trust.',
  },
  futureA: {
    title: 'The Drifting Version',
    description:
      'If every difficult beginning keeps being postponed, your ideas remain vivid but untested. The cost is less about failure and more about never collecting evidence of what you can build.',
    keyRegret: 'Waiting for confidence instead of letting small completed work create it.',
  },
  futureB: {
    title: 'The Becoming Version',
    description:
      'By protecting a small daily building window, you create a body of work, clearer judgment, and a calmer relationship with ambition. Consistency becomes an identity rather than a temporary challenge.',
    keyGrowth:
      'Becoming someone who finishes, learns in public, and adjusts without abandoning the mission.',
  },
  radarData: [
    {subject: 'Discipline', A: 42, B: 78, fullMark: 100},
    {subject: 'Consistency', A: 35, B: 82, fullMark: 100},
    {subject: 'Adaptability', A: 66, B: 84, fullMark: 100},
    {subject: 'Resilience', A: 58, B: 86, fullMark: 100},
    {subject: 'Execution', A: 38, B: 80, fullMark: 100},
  ],
  futureLetter:
    'Hey Builder,\n\nThe turning point was smaller than you expected. You stopped asking whether the work would prove your worth and started giving one honest hour to it each day. The studio, the confidence, and the opportunities grew from evidence—one finished piece at a time.\n\nKeep the promise small enough to keep, and meaningful enough to matter.',
  timeline: [
    {
      period: '6 Months',
      stateA: 'Ideas continue to accumulate without a reliable shipping habit.',
      stateB: 'A weekly release rhythm produces a visible portfolio and sharper priorities.',
    },
    {
      period: '1 Year',
      stateA: 'Unfinished projects make every new idea feel heavier.',
      stateB: 'Consistent work creates collaborators, feedback, and credible momentum.',
    },
    {
      period: '5 Years',
      stateA: 'The dream remains emotionally important but operationally distant.',
      stateB: 'A sustainable practice supports meaningful products and a calmer life.',
    },
  ],
  plan: {
    dailyHabits: [
      'Protect one distraction-free 45-minute building block.',
      'Write the next smallest action before ending each session.',
      'Record one sentence of evidence that you kept the promise.',
    ],
    learningRoadmap: [
      'Ship one deliberately small project this month.',
      'Ask three target users for feedback before expanding scope.',
      'Review outcomes weekly and remove work that does not serve the goal.',
    ],
    antiProcrastination:
      'When the task feels too large, define a version that can be completed in twenty minutes and begin before renegotiating it.',
  },
  identityCard: {
    potentialScore: 83,
    aiReadiness: 76,
    growthPotential: 'High when ambition is converted into a repeatable weekly system.',
  },
};
