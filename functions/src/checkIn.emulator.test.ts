import {deleteApp, initializeApp, type App} from 'firebase-admin/app';
import {getFirestore, Timestamp, type Firestore} from 'firebase-admin/firestore';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

import type {UpsertCheckInRequest} from '../../shared/contracts.js';
import {DEMO_ANALYSIS} from '../../shared/demoAnalysis.js';
import {getAccountDeletionTombstoneRef} from './accountDeletion.js';
import {deleteCheckInsForAnalysis, deleteCheckInsForUser, upsertCheckInRecord} from './checkIn.js';

const NOW = Timestamp.fromDate(new Date('2026-08-31T07:00:00.000Z'));
const LATER = Timestamp.fromDate(new Date('2026-08-31T09:00:00.000Z'));
const ANALYSIS_ID = '11000000-0000-4000-8000-000000000001';
const USER_ID = 'check-in-owner';
const REQUEST: UpsertCheckInRequest = {
  analysisId: ANALYSIS_ID,
  habitStates: DEMO_ANALYSIS.plan.dailyHabits.map((_, habitIndex) => ({
    habitIndex,
    status: habitIndex === 0 ? 'done' : 'in_progress',
  })),
  mood: 4,
  note: 'A focused session with a small amount of friction.',
};

let app: App;
let database: Firestore;

async function seedCompletedAnalysis(analysisId: string, userId: string): Promise<void> {
  await database.collection('analyses').doc(analysisId).set({
    userId,
    status: 'completed',
    result: DEMO_ANALYSIS,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('Check-in integration tests require the Firestore Emulator.');
  }
  app = initializeApp({projectId: 'demo-becoming'}, 'check-in-transaction-tests');
  database = getFirestore(app);
});

afterAll(async () => {
  await database.terminate();
  await deleteApp(app);
});

describe('authoritative check-in lifecycle', () => {
  it('upserts one server-owned daily record and preserves its creation time', async () => {
    await seedCompletedAnalysis(ANALYSIS_ID, USER_ID);

    const first = await upsertCheckInRecord({
      database,
      userId: USER_ID,
      request: REQUEST,
      now: NOW,
    });
    const second = await upsertCheckInRecord({
      database,
      userId: USER_ID,
      request: {...REQUEST, mood: 5, note: 'The second update.'},
      now: LATER,
    });
    const snapshot = await database.collection('checkIns').doc(first.checkInId).get();

    expect(second.checkInId).toBe(first.checkInId);
    expect(snapshot.get('userId')).toBe(USER_ID);
    expect(snapshot.get('analysisId')).toBe(ANALYSIS_ID);
    expect(snapshot.get('createdAt')).toEqual(NOW);
    expect(snapshot.get('updatedAt')).toEqual(LATER);
    expect(snapshot.get('mood')).toBe(5);
  });

  it('rejects non-owners and incomplete habit state arrays', async () => {
    const otherAnalysisId = '12000000-0000-4000-8000-000000000002';
    await seedCompletedAnalysis(otherAnalysisId, 'different-owner');

    await expect(
      upsertCheckInRecord({
        database,
        userId: USER_ID,
        request: {...REQUEST, analysisId: otherAnalysisId},
        now: NOW,
      }),
    ).rejects.toMatchObject({code: 'permission-denied'});

    await expect(
      upsertCheckInRecord({
        database,
        userId: USER_ID,
        request: {...REQUEST, habitStates: REQUEST.habitStates.slice(0, 2)},
        now: NOW,
      }),
    ).rejects.toMatchObject({code: 'invalid-argument'});
  });

  it('cascades records by analysis and account owner', async () => {
    const secondAnalysisId = '13000000-0000-4000-8000-000000000003';
    await seedCompletedAnalysis(secondAnalysisId, USER_ID);
    const second = await upsertCheckInRecord({
      database,
      userId: USER_ID,
      request: {...REQUEST, analysisId: secondAnalysisId},
      now: NOW,
    });

    await deleteCheckInsForAnalysis(database, ANALYSIS_ID);
    expect((await database.collection('checkIns').doc(second.checkInId).get()).exists).toBe(true);

    await deleteCheckInsForUser(database, USER_ID);
    expect((await database.collection('checkIns').doc(second.checkInId).get()).exists).toBe(false);
  });

  it('blocks check-ins from a stale token after account deletion starts', async () => {
    const analysisId = '14000000-0000-4000-8000-000000000004';
    const userId = 'deleted-check-in-owner';
    await seedCompletedAnalysis(analysisId, userId);
    await getAccountDeletionTombstoneRef(database, userId).set({expiresAt: LATER});

    await expect(
      upsertCheckInRecord({
        database,
        userId,
        request: {...REQUEST, analysisId},
        now: NOW,
      }),
    ).rejects.toMatchObject({code: 'failed-precondition'});
  });
});
