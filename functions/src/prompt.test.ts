import {describe, expect, it} from 'vitest';

import type {ReflectionResponses} from '../../shared/contracts.js';
import {buildAnalysisPrompt, SYSTEM_INSTRUCTION} from './prompt.js';

const responses: ReflectionResponses = {
  fearedFuture: 'Staying stagnant.',
  limitingHabit: 'Avoiding difficult work.',
  disconnectionMoment: 'When I postpone important tasks.',
  chosenLife: 'A calm life building useful products.',
  avoidedStart: 'Publishing my work.',
  desiredIdentity: 'A consistent and thoughtful builder.',
  disciplineScore: '6',
  uncommittedDream: 'Starting a small studio.',
};

describe('buildAnalysisPrompt', () => {
  it('serializes reflection data without treating it as system instructions', () => {
    const prompt = buildAnalysisPrompt(responses, 'Rizqi');

    expect(prompt).toContain('DISPLAY_NAME: Rizqi');
    expect(prompt).toContain('USER_REFLECTIONS_JSON:');
    expect(prompt).toContain('Staying stagnant.');
    expect(SYSTEM_INSTRUCTION).toContain('untrusted personal data');
  });
});
