import {z} from 'zod';

export const QUESTION_IDS = [
  'fearedFuture',
  'limitingHabit',
  'disconnectionMoment',
  'chosenLife',
  'avoidedStart',
  'desiredIdentity',
  'disciplineScore',
  'uncommittedDream',
] as const;

export const reflectionResponsesSchema = z
  .object({
    fearedFuture: z.string().trim().min(3).max(1200),
    limitingHabit: z.string().trim().min(3).max(1200),
    disconnectionMoment: z.string().trim().min(3).max(1200),
    chosenLife: z.string().trim().min(3).max(1200),
    avoidedStart: z.string().trim().min(3).max(1200),
    desiredIdentity: z.string().trim().min(3).max(1200),
    disciplineScore: z.string().trim().min(1).max(120),
    uncommittedDream: z.string().trim().min(3).max(1200),
  })
  .strict();

export const createAnalysisRequestSchema = z
  .object({
    idempotencyKey: z.string().uuid(),
    responses: reflectionResponsesSchema,
  })
  .strict();

const identitySchema = z
  .object({
    archetype: z.string().trim().min(2).max(100),
    description: z.string().trim().min(20).max(1600),
  })
  .strict();

const futureSchema = z
  .object({
    title: z.string().trim().min(2).max(100),
    description: z.string().trim().min(20).max(1800),
  })
  .strict();

const driftingFutureSchema = futureSchema.extend({
  keyRegret: z.string().trim().min(5).max(600),
});

const becomingFutureSchema = futureSchema.extend({
  keyGrowth: z.string().trim().min(5).max(600),
});

const scoreSchema = z.number().finite().int().min(0).max(100);

export const radarSubjects = [
  'Discipline',
  'Consistency',
  'Adaptability',
  'Resilience',
  'Execution',
] as const;

const radarItemSchema = z
  .object({
    subject: z.enum(radarSubjects),
    A: scoreSchema,
    B: scoreSchema,
    fullMark: z.literal(100),
  })
  .strict();

const timelineItemSchema = z
  .object({
    period: z.enum(['6 Months', '1 Year', '5 Years']),
    stateA: z.string().trim().min(5).max(600),
    stateB: z.string().trim().min(5).max(600),
  })
  .strict();

export const analysisResultSchema = z
  .object({
    identity: identitySchema,
    futureA: driftingFutureSchema,
    futureB: becomingFutureSchema,
    radarData: z.array(radarItemSchema).length(5),
    futureLetter: z.string().trim().min(50).max(6000),
    timeline: z.array(timelineItemSchema).length(3),
    plan: z
      .object({
        dailyHabits: z.array(z.string().trim().min(3).max(300)).min(2).max(5),
        learningRoadmap: z.array(z.string().trim().min(3).max(300)).min(2).max(5),
        antiProcrastination: z.string().trim().min(10).max(800),
      })
      .strict(),
    identityCard: z
      .object({
        potentialScore: scoreSchema,
        aiReadiness: scoreSchema,
        growthPotential: z.string().trim().min(3).max(200),
      })
      .strict(),
  })
  .strict();

export const analysisStatusSchema = z.enum(['pending', 'completed', 'failed']);

export const createAnalysisResponseSchema = z
  .object({
    analysisId: z.string().uuid(),
    status: analysisStatusSchema,
    analysis: analysisResultSchema.optional(),
  })
  .strict();

export const habitStatuses = ['not_started', 'in_progress', 'done'] as const;

export const checkInHabitStateSchema = z
  .object({
    habitIndex: z.number().int().min(0).max(4),
    status: z.enum(habitStatuses),
  })
  .strict();

export const upsertCheckInRequestSchema = z
  .object({
    analysisId: z.string().uuid(),
    habitStates: z
      .array(checkInHabitStateSchema)
      .min(2)
      .max(5)
      .superRefine((states, context) => {
        const indices = states.map(({habitIndex}) => habitIndex);
        if (new Set(indices).size !== indices.length) {
          context.addIssue({
            code: 'custom',
            message: 'Habit indices must be unique.',
          });
        }
      }),
    mood: z.number().int().min(1).max(5),
    note: z.string().trim().max(1000).optional(),
  })
  .strict();

export const upsertCheckInResponseSchema = z
  .object({
    checkInId: z.string().regex(/^[a-f0-9]{64}$/),
    savedAt: z.string().datetime(),
  })
  .strict();

export type ReflectionResponses = z.infer<typeof reflectionResponsesSchema>;
export type ReflectionQuestionId = (typeof QUESTION_IDS)[number];
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;
export type CreateAnalysisRequest = z.infer<typeof createAnalysisRequestSchema>;
export type CreateAnalysisResponse = z.infer<typeof createAnalysisResponseSchema>;
export type HabitStatus = (typeof habitStatuses)[number];
export type CheckInHabitState = z.infer<typeof checkInHabitStateSchema>;
export type UpsertCheckInRequest = z.infer<typeof upsertCheckInRequestSchema>;
export type UpsertCheckInResponse = z.infer<typeof upsertCheckInResponseSchema>;
