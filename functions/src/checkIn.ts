import {createHash} from 'node:crypto';

import {Timestamp, type Firestore} from 'firebase-admin/firestore';
import {HttpsError} from 'firebase-functions/v2/https';

import {
  analysisResultSchema,
  type UpsertCheckInRequest,
  type UpsertCheckInResponse,
} from '../../shared/contracts.js';
import {getAccountDeletionTombstoneRef, isDeletionRequested} from './accountDeletion.js';

function createCheckInId(userId: string, analysisId: string, dayKey: string): string {
  return createHash('sha256').update(`${userId}:${analysisId}:${dayKey}`).digest('hex');
}

export interface UpsertCheckInInput {
  database: Firestore;
  userId: string;
  request: UpsertCheckInRequest;
  now?: Timestamp;
}

export async function upsertCheckInRecord({
  database,
  userId,
  request,
  now = Timestamp.now(),
}: UpsertCheckInInput): Promise<UpsertCheckInResponse> {
  const dayKey = new Date(now.toMillis()).toISOString().slice(0, 10);
  const checkInId = createCheckInId(userId, request.analysisId, dayKey);
  const userRef = database.collection('users').doc(userId);
  const deletionTombstoneRef = getAccountDeletionTombstoneRef(database, userId);
  const analysisRef = database.collection('analyses').doc(request.analysisId);
  const checkInRef = database.collection('checkIns').doc(checkInId);

  await database.runTransaction(async (transaction) => {
    const [userSnapshot, deletionTombstoneSnapshot, analysisSnapshot, existingCheckIn] =
      await Promise.all([
        transaction.get(userRef),
        transaction.get(deletionTombstoneRef),
        transaction.get(analysisRef),
        transaction.get(checkInRef),
      ]);

    if (
      deletionTombstoneSnapshot.exists ||
      isDeletionRequested(userSnapshot.get('deletionRequestedAt'))
    ) {
      throw new HttpsError('failed-precondition', 'Account deletion is in progress.');
    }
    if (!analysisSnapshot.exists) {
      throw new HttpsError('not-found', 'The analysis no longer exists.');
    }
    if (analysisSnapshot.get('userId') !== userId) {
      throw new HttpsError('permission-denied', 'You cannot check in to this analysis.');
    }
    if (
      analysisSnapshot.get('status') !== 'completed' ||
      isDeletionRequested(analysisSnapshot.get('deletionRequestedAt'))
    ) {
      throw new HttpsError('failed-precondition', 'The analysis is not available for check-in.');
    }

    const parsedAnalysis = analysisResultSchema.safeParse(analysisSnapshot.get('result'));
    if (!parsedAnalysis.success) {
      throw new HttpsError('data-loss', 'The stored analysis is invalid.');
    }

    const expectedIndices = parsedAnalysis.data.plan.dailyHabits.map((_, index) => index);
    const submittedIndices = request.habitStates
      .map(({habitIndex}) => habitIndex)
      .sort((left, right) => left - right);
    if (
      expectedIndices.length !== submittedIndices.length ||
      expectedIndices.some((index, position) => submittedIndices[position] !== index)
    ) {
      throw new HttpsError(
        'invalid-argument',
        'A status is required for every habit in this analysis.',
      );
    }

    const createdAt = existingCheckIn.exists ? existingCheckIn.get('createdAt') : now;
    transaction.set(checkInRef, {
      userId,
      analysisId: request.analysisId,
      dayKey,
      habitStates: request.habitStates,
      mood: request.mood,
      note: request.note ?? null,
      createdAt: createdAt instanceof Timestamp ? createdAt : now,
      updatedAt: now,
    });
  });

  return {checkInId, savedAt: now.toDate().toISOString()};
}

async function deleteQueryInBatches(
  database: Firestore,
  field: 'analysisId' | 'userId',
  value: string,
): Promise<void> {
  while (true) {
    const snapshot = await database
      .collection('checkIns')
      .where(field, '==', value)
      .limit(400)
      .get();
    if (snapshot.empty) return;

    const batch = database.batch();
    for (const document of snapshot.docs) batch.delete(document.ref);
    await batch.commit();
  }
}

export function deleteCheckInsForAnalysis(database: Firestore, analysisId: string): Promise<void> {
  return deleteQueryInBatches(database, 'analysisId', analysisId);
}

export function deleteCheckInsForUser(database: Firestore, userId: string): Promise<void> {
  return deleteQueryInBatches(database, 'userId', userId);
}
