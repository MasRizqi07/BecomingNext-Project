import {GoogleGenAI} from '@google/genai';

import {
  analysisResultSchema,
  type AnalysisResult,
  type ReflectionResponses,
} from '../../shared/contracts.js';
import {DEMO_ANALYSIS} from '../../shared/demoAnalysis.js';
import {buildAnalysisPrompt, SYSTEM_INSTRUCTION} from './prompt.js';

const ANALYSIS_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'identity',
    'futureA',
    'futureB',
    'radarData',
    'futureLetter',
    'timeline',
    'plan',
    'identityCard',
  ],
  properties: {
    identity: {
      type: 'object',
      additionalProperties: false,
      required: ['archetype', 'description'],
      properties: {archetype: {type: 'string'}, description: {type: 'string'}},
    },
    futureA: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'description', 'keyRegret'],
      properties: {
        title: {type: 'string'},
        description: {type: 'string'},
        keyRegret: {type: 'string'},
      },
    },
    futureB: {
      type: 'object',
      additionalProperties: false,
      required: ['title', 'description', 'keyGrowth'],
      properties: {
        title: {type: 'string'},
        description: {type: 'string'},
        keyGrowth: {type: 'string'},
      },
    },
    radarData: {
      type: 'array',
      minItems: 5,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['subject', 'A', 'B', 'fullMark'],
        properties: {
          subject: {
            type: 'string',
            enum: ['Discipline', 'Consistency', 'Adaptability', 'Resilience', 'Execution'],
          },
          A: {type: 'integer', minimum: 0, maximum: 100},
          B: {type: 'integer', minimum: 0, maximum: 100},
          fullMark: {type: 'integer', enum: [100]},
        },
      },
    },
    futureLetter: {type: 'string'},
    timeline: {
      type: 'array',
      minItems: 3,
      maxItems: 3,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['period', 'stateA', 'stateB'],
        properties: {
          period: {type: 'string', enum: ['6 Months', '1 Year', '5 Years']},
          stateA: {type: 'string'},
          stateB: {type: 'string'},
        },
      },
    },
    plan: {
      type: 'object',
      additionalProperties: false,
      required: ['dailyHabits', 'learningRoadmap', 'antiProcrastination'],
      properties: {
        dailyHabits: {type: 'array', minItems: 2, maxItems: 5, items: {type: 'string'}},
        learningRoadmap: {
          type: 'array',
          minItems: 2,
          maxItems: 5,
          items: {type: 'string'},
        },
        antiProcrastination: {type: 'string'},
      },
    },
    identityCard: {
      type: 'object',
      additionalProperties: false,
      required: ['potentialScore', 'aiReadiness', 'growthPotential'],
      properties: {
        potentialScore: {type: 'integer', minimum: 0, maximum: 100},
        aiReadiness: {type: 'integer', minimum: 0, maximum: 100},
        growthPotential: {type: 'string'},
      },
    },
  },
} as const;

export interface AnalysisGenerator {
  generate(responses: ReflectionResponses, displayName?: string): Promise<AnalysisResult>;
}

export function createGeminiGenerator(apiKey: string, model: string): AnalysisGenerator {
  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {timeout: 60_000, retryOptions: {attempts: 3}},
  });

  return {
    async generate(responses, displayName) {
      const interaction = await client.interactions.create({
        model,
        input: buildAnalysisPrompt(responses, displayName),
        system_instruction: SYSTEM_INSTRUCTION,
        store: false,
        generation_config: {
          max_output_tokens: 5_000,
        },
        response_format: [
          {type: 'text', mime_type: 'application/json', schema: ANALYSIS_JSON_SCHEMA},
        ],
      });

      if (!interaction.output_text) {
        throw new Error('Gemini returned an empty response.');
      }

      let candidate: unknown;
      try {
        candidate = JSON.parse(interaction.output_text);
      } catch {
        throw new Error('Gemini returned malformed JSON.');
      }

      const parsed = analysisResultSchema.safeParse(candidate);
      if (!parsed.success) {
        throw new Error('Gemini response failed the analysis contract.');
      }

      return parsed.data;
    },
  };
}

export function createDeterministicGenerator(): AnalysisGenerator {
  return {
    async generate() {
      return DEMO_ANALYSIS;
    },
  };
}
