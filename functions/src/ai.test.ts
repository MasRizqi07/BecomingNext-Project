import {afterEach, describe, expect, it, vi} from 'vitest';

import type {ReflectionResponses} from '../../shared/contracts.js';
import {DEMO_ANALYSIS} from '../../shared/demoAnalysis.js';
import {SYSTEM_INSTRUCTION} from './prompt.js';

const {createInteraction} = vi.hoisted(() => ({createInteraction: vi.fn()}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: class {
    interactions = {create: createInteraction};
  },
}));

import {createGeminiGenerator} from './ai.js';

const RESPONSES: ReflectionResponses = {
  fearedFuture: 'I am afraid of never completing meaningful work.',
  limitingHabit: 'I wait for perfect clarity before beginning.',
  disconnectionMoment: 'I disconnect when I consume ideas without creating.',
  chosenLife: 'I would build useful products at a sustainable pace.',
  avoidedStart: 'I am avoiding publishing a small first version.',
  desiredIdentity: 'I want to become a reliable and thoughtful builder.',
  disciplineScore: '6',
  uncommittedDream: 'I want to build an independent product studio.',
};

afterEach(() => vi.clearAllMocks());

describe('Gemini analysis generator', () => {
  it('uses a stateless structured Interactions request and validates its response', async () => {
    createInteraction.mockResolvedValue({output_text: JSON.stringify(DEMO_ANALYSIS)});
    const generator = createGeminiGenerator('server-only-key', 'gemini-3.7-flash');

    await expect(generator.generate(RESPONSES, 'Builder Test')).resolves.toEqual(DEMO_ANALYSIS);
    expect(createInteraction).toHaveBeenCalledOnce();
    expect(createInteraction).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'gemini-3.7-flash',
        store: false,
        system_instruction: SYSTEM_INSTRUCTION,
        generation_config: {max_output_tokens: 5_000},
        response_format: [
          expect.objectContaining({
            type: 'text',
            mime_type: 'application/json',
            schema: expect.any(Object),
          }),
        ],
      }),
    );
  });

  it('fails closed when the model returns malformed JSON', async () => {
    createInteraction.mockResolvedValue({output_text: '{not-json'});
    const generator = createGeminiGenerator('server-only-key', 'gemini-3.7-flash');

    await expect(generator.generate(RESPONSES)).rejects.toThrow('malformed JSON');
  });
});
