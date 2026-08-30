import {describe, expect, it} from 'vitest';

import {DEMO_ANALYSIS} from '@/data/demoAnalysis';
import {
  analysisResultSchema,
  createAnalysisRequestSchema,
  reflectionResponsesSchema,
} from './contracts';

const validResponses = {
  fearedFuture: 'Remaining stuck for another year.',
  limitingHabit: 'Avoiding work when the outcome is uncertain.',
  disconnectionMoment: 'When I postpone the work that matters.',
  chosenLife: 'A calm life spent building useful tools.',
  avoidedStart: 'Publishing a small product.',
  desiredIdentity: 'A consistent and thoughtful builder.',
  disciplineScore: '6 because my routines are inconsistent.',
  uncommittedDream: 'Starting a small independent studio.',
};

describe('full-stack contracts', () => {
  it('accepts a complete reflection request', () => {
    expect(
      createAnalysisRequestSchema.safeParse({
        idempotencyKey: '34dee39a-b961-4b07-a928-e00e35155745',
        responses: validResponses,
      }).success,
    ).toBe(true);
  });

  it('rejects incomplete and oversized reflection data', () => {
    expect(reflectionResponsesSchema.safeParse({...validResponses, fearedFuture: ''}).success).toBe(
      false,
    );
    expect(
      reflectionResponsesSchema.safeParse({...validResponses, fearedFuture: 'x'.repeat(1201)})
        .success,
    ).toBe(false);
  });

  it('validates the safe demo against the production result contract', () => {
    expect(analysisResultSchema.safeParse(DEMO_ANALYSIS).success).toBe(true);
  });
});
