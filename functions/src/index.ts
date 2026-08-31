import {createHash} from 'node:crypto';

import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {FieldValue, getFirestore, Timestamp} from 'firebase-admin/firestore';
import {defineInt, defineSecret, defineString} from 'firebase-functions/params';
import {logger} from 'firebase-functions';
import {HttpsError, onCall} from 'firebase-functions/v2/https';
import {z} from 'zod';

import {
  analysisResultSchema,
  createAnalysisRequestSchema,
  type AnalysisResult,
  type AnalysisStatus,
  type CreateAnalysisResponse,
  type ReflectionResponses,
} from '../../shared/contracts.js';
import {createDeterministicGenerator, createGeminiGenerator} from './ai.js';
import {PROMPT_VERSION} from './prompt.js';

initializeApp();

const db = getFirestore();
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const geminiModel = defineString('GEMINI_MODEL', {default: 'gemini-3.6-flash'});
const analysisProvider = defineString('ANALYSIS_PROVIDER', {default: 'gemini'});
const dailyAnalysisLimit = defineInt('DAILY_ANALYSIS_LIMIT', {default: 10});

const REGION = 'asia-southeast1';
const LEASE_DURATION_MS = 90_000;
const IS_FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR === 'true';
const callableSecurity = {
  enforceAppCheck: !IS_FUNCTIONS_EMULATOR,
  consumeAppCheckToken: !IS_FUNCTIONS_EMULATOR,
} as const;

interface AnalysisDocument {
  userId: string;
  status: AnalysisStatus;
  requestHash: string;
  model: string;
  promptVersion: string;
  attempts: number;
  result?: AnalysisResult;
}

interface Reservation {
  shouldGenerate: boolean;
  response: CreateAnalysisResponse;
}

function hashRequest(responses: ReflectionResponses): string {
  return createHash('sha256').update(JSON.stringify(responses)).digest('hex');
}

function getSafeDisplayName(token: Record<string, unknown>): string | undefined {
  const name = token.name;
  return typeof name === 'string' && name.trim() ? name.trim().slice(0, 80) : undefined;
}

async function reserveAnalysis(
  analysisId: string,
  userId: string,
  responses: ReflectionResponses,
  model: string,
): Promise<Reservation> {
  const analysisRef = db.collection('analyses').doc(analysisId);
  const reflectionRef = db.collection('reflections').doc(analysisId);
  const rateLimitRef = db.collection('rateLimits').doc(userId);
  const requestHash = hashRequest(responses);
  const now = Timestamp.now();
  const leaseExpiresAt = Timestamp.fromMillis(now.toMillis() + LEASE_DURATION_MS);
  const dayKey = new Date(now.toMillis()).toISOString().slice(0, 10);

  return db.runTransaction(async (transaction) => {
    const existingSnapshot = await transaction.get(analysisRef);
    if (existingSnapshot.exists) {
      const existing = existingSnapshot.data() as AnalysisDocument;
      if (existing.userId !== userId || existing.requestHash !== requestHash) {
        throw new HttpsError(
          'failed-precondition',
          'This idempotency key is already associated with another request.',
        );
      }

      if (existing.status === 'completed') {
        const parsedResult = analysisResultSchema.safeParse(existing.result);
        if (!parsedResult.success) {
          throw new HttpsError('data-loss', 'The stored analysis is invalid.');
        }
        return {
          shouldGenerate: false,
          response: {analysisId, status: 'completed', analysis: parsedResult.data},
        };
      }

      const existingLease = existingSnapshot.get('leaseExpiresAt');
      if (
        existing.status === 'pending' &&
        existingLease instanceof Timestamp &&
        existingLease.toMillis() > now.toMillis()
      ) {
        return {shouldGenerate: false, response: {analysisId, status: 'pending'}};
      }

      transaction.update(analysisRef, {
        status: 'pending',
        attempts: FieldValue.increment(1),
        leaseExpiresAt,
        updatedAt: now,
        errorCode: FieldValue.delete(),
      });
      return {shouldGenerate: true, response: {analysisId, status: 'pending'}};
    }

    const rateSnapshot = await transaction.get(rateLimitRef);
    const previousDay = rateSnapshot.exists ? rateSnapshot.get('dayKey') : undefined;
    const previousCount = rateSnapshot.exists ? rateSnapshot.get('count') : undefined;
    const count = previousDay === dayKey && typeof previousCount === 'number' ? previousCount : 0;
    if (count >= dailyAnalysisLimit.value()) {
      throw new HttpsError(
        'resource-exhausted',
        'Your daily analysis limit has been reached. Please try again tomorrow.',
      );
    }

    transaction.set(rateLimitRef, {dayKey, count: count + 1, updatedAt: now}, {merge: true});
    transaction.create(reflectionRef, {
      userId,
      responses,
      createdAt: now,
      updatedAt: now,
    });
    transaction.create(analysisRef, {
      userId,
      status: 'pending',
      requestHash,
      model,
      promptVersion: PROMPT_VERSION,
      attempts: 1,
      leaseExpiresAt,
      createdAt: now,
      updatedAt: now,
    } satisfies AnalysisDocument & Record<string, unknown>);

    return {shouldGenerate: true, response: {analysisId, status: 'pending'}};
  });
}

export const createAnalysis = onCall(
  {
    region: REGION,
    cors: true,
    ...callableSecurity,
    secrets: [geminiApiKey],
    timeoutSeconds: 120,
    memory: '512MiB',
    maxInstances: 20,
    concurrency: 20,
  },
  async (request): Promise<CreateAnalysisResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before creating an analysis.');
    }

    const parsedRequest = createAnalysisRequestSchema.safeParse(request.data);
    if (!parsedRequest.success) {
      throw new HttpsError('invalid-argument', 'The reflection payload is invalid.');
    }

    const {idempotencyKey, responses} = parsedRequest.data;
    const userId = request.auth.uid;
    const model = geminiModel.value();
    const reservation = await reserveAnalysis(idempotencyKey, userId, responses, model);
    if (!reservation.shouldGenerate) {
      return reservation.response;
    }

    const analysisRef = db.collection('analyses').doc(idempotencyKey);
    try {
      const useDeterministicProvider =
        IS_FUNCTIONS_EMULATOR && analysisProvider.value() === 'deterministic';
      const generator = useDeterministicProvider
        ? createDeterministicGenerator()
        : createGeminiGenerator(geminiApiKey.value(), model);
      const analysis = await generator.generate(
        responses,
        getSafeDisplayName(request.auth.token as Record<string, unknown>),
      );
      const completedAt = Timestamp.now();
      await analysisRef.update({
        status: 'completed',
        result: analysis,
        completedAt,
        updatedAt: completedAt,
        leaseExpiresAt: FieldValue.delete(),
      });

      await db
        .collection('users')
        .doc(userId)
        .set(
          {
            uid: userId,
            email: typeof request.auth.token.email === 'string' ? request.auth.token.email : null,
            displayName:
              typeof request.auth.token.name === 'string'
                ? request.auth.token.name.slice(0, 120)
                : null,
            photoURL:
              typeof request.auth.token.picture === 'string'
                ? request.auth.token.picture.slice(0, 2048)
                : null,
            lastSeen: completedAt,
            updatedAt: completedAt,
          },
          {merge: true},
        );

      logger.info('Analysis completed', {analysisId: idempotencyKey, userId, model});
      return {analysisId: idempotencyKey, status: 'completed', analysis};
    } catch (error: unknown) {
      const failedAt = Timestamp.now();
      await analysisRef.update({
        status: 'failed',
        errorCode: 'AI_GENERATION_FAILED',
        updatedAt: failedAt,
        leaseExpiresAt: FieldValue.delete(),
      });
      logger.error('Analysis generation failed', {
        analysisId: idempotencyKey,
        userId,
        model,
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
      throw new HttpsError(
        'unavailable',
        'The reflection service is temporarily unavailable. You can retry safely.',
        {analysisId: idempotencyKey},
      );
    }
  },
);

const deleteAnalysisRequestSchema = z.object({analysisId: z.string().uuid()}).strict();

export const deleteAnalysis = onCall(
  {region: REGION, cors: true, ...callableSecurity},
  async (request): Promise<{deleted: true}> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before deleting an analysis.');
    }
    const parsedRequest = deleteAnalysisRequestSchema.safeParse(request.data);
    if (!parsedRequest.success) {
      throw new HttpsError('invalid-argument', 'The analysis identifier is invalid.');
    }

    const {analysisId} = parsedRequest.data;
    const analysisRef = db.collection('analyses').doc(analysisId);
    const analysisSnapshot = await analysisRef.get();
    if (!analysisSnapshot.exists) {
      return {deleted: true};
    }
    if (analysisSnapshot.get('userId') !== request.auth.uid) {
      throw new HttpsError('permission-denied', 'You cannot delete this analysis.');
    }

    const batch = db.batch();
    batch.delete(analysisRef);
    batch.delete(db.collection('reflections').doc(analysisId));
    await batch.commit();
    return {deleted: true};
  },
);

async function deleteCollectionForUser(collectionName: string, userId: string): Promise<void> {
  while (true) {
    const snapshot = await db
      .collection(collectionName)
      .where('userId', '==', userId)
      .limit(400)
      .get();
    if (snapshot.empty) return;

    const batch = db.batch();
    for (const document of snapshot.docs) batch.delete(document.ref);
    await batch.commit();
  }
}

export const deleteMyData = onCall(
  {region: REGION, cors: true, ...callableSecurity},
  async (request): Promise<{deleted: true}> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before deleting your data.');
    }

    const userId = request.auth.uid;
    await deleteCollectionForUser('reflections', userId);
    await deleteCollectionForUser('analyses', userId);
    await Promise.all([
      db.collection('users').doc(userId).delete(),
      db.collection('rateLimits').doc(userId).delete(),
    ]);
    await getAuth().deleteUser(userId);
    logger.info('User data deleted', {userId});
    return {deleted: true};
  },
);
