import {initializeApp} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {FieldValue, getFirestore, Timestamp} from 'firebase-admin/firestore';
import {defineInt, defineSecret, defineString} from 'firebase-functions/params';
import {logger} from 'firebase-functions';
import {HttpsError, onCall} from 'firebase-functions/v2/https';
import {z} from 'zod';

import {
  createAnalysisRequestSchema,
  upsertCheckInRequestSchema,
  type AnalysisResult,
  type CreateAnalysisResponse,
  type UpsertCheckInResponse,
} from '../../shared/contracts.js';
import {createDeterministicGenerator, createGeminiGenerator} from './ai.js';
import {
  ACCOUNT_DELETION_TOMBSTONE_TTL_MS,
  getAccountDeletionTombstoneRef,
  isDeletionRequested,
} from './accountDeletion.js';
import {deleteCheckInsForAnalysis, deleteCheckInsForUser, upsertCheckInRecord} from './checkIn.js';
import {reserveAnalysis} from './reservation.js';

initializeApp();

const db = getFirestore();
const geminiApiKey = defineSecret('GEMINI_API_KEY');
const geminiModel = defineString('GEMINI_MODEL', {default: 'gemini-3.7-flash'});
const analysisProvider = defineString('ANALYSIS_PROVIDER', {default: 'gemini'});
const dailyAnalysisLimit = defineInt('DAILY_ANALYSIS_LIMIT', {default: 10});

const REGION = 'asia-southeast1';
const IS_FUNCTIONS_EMULATOR = process.env.FUNCTIONS_EMULATOR === 'true';
const callableSecurity = {
  enforceAppCheck: !IS_FUNCTIONS_EMULATOR,
  consumeAppCheckToken: !IS_FUNCTIONS_EMULATOR,
} as const;

function getSafeDisplayName(token: Record<string, unknown>): string | undefined {
  const name = token.name;
  return typeof name === 'string' && name.trim() ? name.trim().slice(0, 80) : undefined;
}

async function persistCompletedAnalysis(input: {
  analysisId: string;
  userId: string;
  analysis: AnalysisResult;
  token: Record<string, unknown>;
}): Promise<Timestamp> {
  const completedAt = Timestamp.now();
  const analysisRef = db.collection('analyses').doc(input.analysisId);
  const userRef = db.collection('users').doc(input.userId);
  const deletionTombstoneRef = getAccountDeletionTombstoneRef(db, input.userId);

  await db.runTransaction(async (transaction) => {
    const [userSnapshot, deletionTombstoneSnapshot, analysisSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(deletionTombstoneRef),
      transaction.get(analysisRef),
    ]);
    if (
      deletionTombstoneSnapshot.exists ||
      isDeletionRequested(userSnapshot.get('deletionRequestedAt')) ||
      isDeletionRequested(analysisSnapshot.get('deletionRequestedAt'))
    ) {
      throw new HttpsError('failed-precondition', 'Deletion is in progress.');
    }
    if (!analysisSnapshot.exists || analysisSnapshot.get('userId') !== input.userId) {
      throw new HttpsError('not-found', 'The reserved analysis no longer exists.');
    }

    transaction.update(analysisRef, {
      status: 'completed',
      result: input.analysis,
      completedAt,
      updatedAt: completedAt,
      leaseExpiresAt: FieldValue.delete(),
    });
    transaction.set(
      userRef,
      {
        uid: input.userId,
        email: typeof input.token.email === 'string' ? input.token.email : null,
        displayName: typeof input.token.name === 'string' ? input.token.name.slice(0, 120) : null,
        photoURL:
          typeof input.token.picture === 'string' ? input.token.picture.slice(0, 2048) : null,
        lastSeen: completedAt,
        updatedAt: completedAt,
      },
      {merge: true},
    );
  });

  return completedAt;
}

async function markAnalysisFailedUnlessDeleting(analysisId: string, userId: string): Promise<void> {
  const failedAt = Timestamp.now();
  const analysisRef = db.collection('analyses').doc(analysisId);
  const userRef = db.collection('users').doc(userId);
  const deletionTombstoneRef = getAccountDeletionTombstoneRef(db, userId);

  await db.runTransaction(async (transaction) => {
    const [userSnapshot, deletionTombstoneSnapshot, analysisSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(deletionTombstoneRef),
      transaction.get(analysisRef),
    ]);
    if (
      !analysisSnapshot.exists ||
      deletionTombstoneSnapshot.exists ||
      isDeletionRequested(userSnapshot.get('deletionRequestedAt')) ||
      isDeletionRequested(analysisSnapshot.get('deletionRequestedAt'))
    ) {
      return;
    }
    transaction.update(analysisRef, {
      status: 'failed',
      errorCode: 'AI_GENERATION_FAILED',
      updatedAt: failedAt,
      leaseExpiresAt: FieldValue.delete(),
    });
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
    const reservation = await reserveAnalysis({
      database: db,
      analysisId: idempotencyKey,
      userId,
      responses,
      model,
      dailyLimit: dailyAnalysisLimit.value(),
    });
    if (!reservation.shouldGenerate) {
      return reservation.response;
    }

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
      await persistCompletedAnalysis({
        analysisId: idempotencyKey,
        userId,
        analysis,
        token: request.auth.token as Record<string, unknown>,
      });

      logger.info('Analysis completed', {analysisId: idempotencyKey, userId, model});
      return {analysisId: idempotencyKey, status: 'completed', analysis};
    } catch (error: unknown) {
      await markAnalysisFailedUnlessDeleting(idempotencyKey, userId);
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

export const upsertCheckIn = onCall(
  {
    region: REGION,
    cors: true,
    ...callableSecurity,
    timeoutSeconds: 30,
    memory: '256MiB',
    maxInstances: 20,
    concurrency: 80,
  },
  async (request): Promise<UpsertCheckInResponse> => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Sign in before saving a check-in.');
    }
    const parsedRequest = upsertCheckInRequestSchema.safeParse(request.data);
    if (!parsedRequest.success) {
      throw new HttpsError('invalid-argument', 'The check-in payload is invalid.');
    }

    const response = await upsertCheckInRecord({
      database: db,
      userId: request.auth.uid,
      request: parsedRequest.data,
    });
    logger.info('Check-in saved', {
      checkInId: response.checkInId,
      analysisId: parsedRequest.data.analysisId,
      userId: request.auth.uid,
    });
    return response;
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
    const shouldDelete = await db.runTransaction(async (transaction) => {
      const analysisSnapshot = await transaction.get(analysisRef);
      if (!analysisSnapshot.exists) return false;
      if (analysisSnapshot.get('userId') !== request.auth?.uid) {
        throw new HttpsError('permission-denied', 'You cannot delete this analysis.');
      }
      transaction.update(analysisRef, {deletionRequestedAt: Timestamp.now()});
      return true;
    });
    if (!shouldDelete) {
      return {deleted: true};
    }

    await deleteCheckInsForAnalysis(db, analysisId);
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
    const userRef = db.collection('users').doc(userId);
    const deletionRequestedAt = Timestamp.now();
    const deletionTombstoneRef = getAccountDeletionTombstoneRef(db, userId);
    const markerBatch = db.batch();
    markerBatch.set(userRef, {deletionRequestedAt}, {merge: true});
    markerBatch.set(deletionTombstoneRef, {
      deletionRequestedAt,
      expiresAt: Timestamp.fromMillis(
        deletionRequestedAt.toMillis() + ACCOUNT_DELETION_TOMBSTONE_TTL_MS,
      ),
    });
    await markerBatch.commit();

    await Promise.all([
      deleteCheckInsForUser(db, userId),
      deleteCollectionForUser('reflections', userId),
      deleteCollectionForUser('analyses', userId),
    ]);
    await Promise.all([userRef.delete(), db.collection('rateLimits').doc(userId).delete()]);
    try {
      await getAuth().deleteUser(userId);
    } catch (error: unknown) {
      const code =
        typeof error === 'object' && error !== null && 'code' in error ? error.code : undefined;
      if (code !== 'auth/user-not-found') throw error;
    }
    logger.info('User data deleted', {userId});
    return {deleted: true};
  },
);
