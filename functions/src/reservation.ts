import {createHash} from 'node:crypto';

import {FieldValue, Timestamp, type Firestore} from 'firebase-admin/firestore';
import {HttpsError} from 'firebase-functions/v2/https';

import {
  analysisResultSchema,
  type AnalysisResult,
  type AnalysisStatus,
  type CreateAnalysisResponse,
  type ReflectionResponses,
} from '../../shared/contracts.js';
import {PROMPT_VERSION} from './prompt.js';
import {getAccountDeletionTombstoneRef, isDeletionRequested} from './accountDeletion.js';

// Keep the lease longer than the 120-second callable timeout so a slow invocation cannot be
// reclaimed while it can still complete and charge the AI provider.
const DEFAULT_LEASE_DURATION_MS = 150_000;

interface AnalysisDocument {
  userId: string;
  status: AnalysisStatus;
  requestHash: string;
  model: string;
  promptVersion: string;
  attempts: number;
  result?: AnalysisResult;
}

export interface Reservation {
  shouldGenerate: boolean;
  response: CreateAnalysisResponse;
}

export interface ReserveAnalysisInput {
  database: Firestore;
  analysisId: string;
  userId: string;
  responses: ReflectionResponses;
  model: string;
  dailyLimit: number;
  now?: Timestamp;
  leaseDurationMs?: number;
}

function hashRequest(responses: ReflectionResponses): string {
  return createHash('sha256').update(JSON.stringify(responses)).digest('hex');
}

export async function reserveAnalysis({
  database,
  analysisId,
  userId,
  responses,
  model,
  dailyLimit,
  now = Timestamp.now(),
  leaseDurationMs = DEFAULT_LEASE_DURATION_MS,
}: ReserveAnalysisInput): Promise<Reservation> {
  const analysisRef = database.collection('analyses').doc(analysisId);
  const reflectionRef = database.collection('reflections').doc(analysisId);
  const rateLimitRef = database.collection('rateLimits').doc(userId);
  const userRef = database.collection('users').doc(userId);
  const deletionTombstoneRef = getAccountDeletionTombstoneRef(database, userId);
  const requestHash = hashRequest(responses);
  const leaseExpiresAt = Timestamp.fromMillis(now.toMillis() + leaseDurationMs);
  const dayKey = new Date(now.toMillis()).toISOString().slice(0, 10);

  return database.runTransaction(async (transaction) => {
    const [userSnapshot, deletionTombstoneSnapshot, existingSnapshot] = await Promise.all([
      transaction.get(userRef),
      transaction.get(deletionTombstoneRef),
      transaction.get(analysisRef),
    ]);
    if (
      deletionTombstoneSnapshot.exists ||
      isDeletionRequested(userSnapshot.get('deletionRequestedAt'))
    ) {
      throw new HttpsError('failed-precondition', 'Account deletion is in progress.');
    }
    if (existingSnapshot.exists) {
      const existing = existingSnapshot.data() as AnalysisDocument;
      if (isDeletionRequested(existingSnapshot.get('deletionRequestedAt'))) {
        throw new HttpsError('failed-precondition', 'This analysis is being deleted.');
      }
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
    if (count >= dailyLimit) {
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
