import {deleteApp, initializeApp, type App} from 'firebase-admin/app';
import {FieldValue, getFirestore, Timestamp, type Firestore} from 'firebase-admin/firestore';
import {afterAll, beforeAll, describe, expect, it} from 'vitest';

import type {ReflectionResponses} from '../../shared/contracts.js';
import {DEMO_ANALYSIS} from '../../shared/demoAnalysis.js';
import {reserveAnalysis} from './reservation.js';

const MODEL = 'gemini-test';
const DAILY_LIMIT = 10;
const NOW = Timestamp.fromDate(new Date('2026-08-31T07:00:00.000Z'));
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

let app: App;
let database: Firestore;

function reserve(
  analysisId: string,
  userId: string,
  overrides: Partial<Parameters<typeof reserveAnalysis>[0]> = {},
) {
  return reserveAnalysis({
    database,
    analysisId,
    userId,
    responses: RESPONSES,
    model: MODEL,
    dailyLimit: DAILY_LIMIT,
    now: NOW,
    ...overrides,
  });
}

beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) {
    throw new Error('Reservation integration tests require the Firestore Emulator.');
  }

  app = initializeApp({projectId: 'demo-becoming'}, 'reservation-transaction-tests');
  database = getFirestore(app);
});

afterAll(async () => {
  await database.terminate();
  await deleteApp(app);
});

describe('reserveAnalysis transaction', () => {
  it('allows exactly one generator for concurrent duplicate requests', async () => {
    const analysisId = '01000000-0000-4000-8000-000000000001';
    const userId = 'concurrent-user';

    const reservations = await Promise.all([
      reserve(analysisId, userId),
      reserve(analysisId, userId),
    ]);

    expect(reservations.filter(({shouldGenerate}) => shouldGenerate)).toHaveLength(1);
    expect(reservations.filter(({shouldGenerate}) => !shouldGenerate)).toHaveLength(1);
    await expect(database.collection('analyses').doc(analysisId).get()).resolves.toMatchObject({
      exists: true,
    });
    await expect(database.collection('reflections').doc(analysisId).get()).resolves.toMatchObject({
      exists: true,
    });
    expect((await database.collection('rateLimits').doc(userId).get()).get('count')).toBe(1);
  });

  it('rejects a new reservation when the daily quota is exhausted', async () => {
    const analysisId = '02000000-0000-4000-8000-000000000002';
    const userId = 'quota-user';
    await database.collection('rateLimits').doc(userId).set({
      dayKey: '2026-08-31',
      count: DAILY_LIMIT,
      updatedAt: NOW,
    });

    await expect(reserve(analysisId, userId)).rejects.toMatchObject({code: 'resource-exhausted'});
    expect((await database.collection('analyses').doc(analysisId).get()).exists).toBe(false);
    expect((await database.collection('reflections').doc(analysisId).get()).exists).toBe(false);
    expect((await database.collection('rateLimits').doc(userId).get()).get('count')).toBe(
      DAILY_LIMIT,
    );
  });

  it('reclaims an expired lease without consuming another quota unit', async () => {
    const analysisId = '03000000-0000-4000-8000-000000000003';
    const userId = 'lease-user';
    const firstAttemptAt = Timestamp.fromMillis(NOW.toMillis() - 120_000);
    await reserve(analysisId, userId, {now: firstAttemptAt, leaseDurationMs: 30_000});

    const retry = await reserve(analysisId, userId);
    const analysis = await database.collection('analyses').doc(analysisId).get();

    expect(retry).toEqual({
      shouldGenerate: true,
      response: {analysisId, status: 'pending'},
    });
    expect(analysis.get('attempts')).toBe(2);
    expect(analysis.get('leaseExpiresAt')).toEqual(Timestamp.fromMillis(NOW.toMillis() + 150_000));
    expect((await database.collection('rateLimits').doc(userId).get()).get('count')).toBe(1);
  });

  it('rejects a different payload that reuses an existing idempotency key', async () => {
    const analysisId = '04000000-0000-4000-8000-000000000004';
    const userId = 'payload-user';
    await reserve(analysisId, userId);

    await expect(
      reserve(analysisId, userId, {
        responses: {...RESPONSES, limitingHabit: 'This is a materially different request.'},
      }),
    ).rejects.toMatchObject({code: 'failed-precondition'});

    const analysis = await database.collection('analyses').doc(analysisId).get();
    const reflection = await database.collection('reflections').doc(analysisId).get();
    expect(analysis.get('attempts')).toBe(1);
    expect(reflection.get('responses')).toEqual(RESPONSES);
    expect((await database.collection('rateLimits').doc(userId).get()).get('count')).toBe(1);
  });

  it('replays a completed record without regenerating or charging quota', async () => {
    const analysisId = '05000000-0000-4000-8000-000000000005';
    const userId = 'completed-user';
    await reserve(analysisId, userId);
    await database.collection('analyses').doc(analysisId).update({
      status: 'completed',
      result: DEMO_ANALYSIS,
      leaseExpiresAt: FieldValue.delete(),
    });

    const replay = await reserve(analysisId, userId);

    expect(replay).toEqual({
      shouldGenerate: false,
      response: {analysisId, status: 'completed', analysis: DEMO_ANALYSIS},
    });
    expect((await database.collection('analyses').doc(analysisId).get()).get('attempts')).toBe(1);
    expect((await database.collection('rateLimits').doc(userId).get()).get('count')).toBe(1);
  });
});
