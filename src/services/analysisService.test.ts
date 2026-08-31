import {beforeEach, describe, expect, it, vi} from 'vitest';

import {DEMO_ANALYSIS} from '@shared/demoAnalysis';

const mocks = vi.hoisted(() => ({
  createAnalysis: vi.fn(),
  deleteAnalysis: vi.fn(),
  deleteMyData: vi.fn(),
  upsertCheckIn: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
}));

vi.mock('firebase/functions', () => ({
  httpsCallable: (_functions: unknown, name: string) => mocks[name as keyof typeof mocks],
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_db: unknown, name: string) => ({name})),
  doc: vi.fn((_db: unknown, collectionName: string, id: string) => ({collectionName, id})),
  getDoc: mocks.getDoc,
  getDocs: mocks.getDocs,
  limit: vi.fn((value: number) => ({limit: value})),
  orderBy: vi.fn((field: string, direction: string) => ({field, direction})),
  query: vi.fn((...constraints: unknown[]) => ({constraints})),
  where: vi.fn((field: string, operator: string, value: string) => ({field, operator, value})),
}));

vi.mock('@/lib/firebaseData', () => ({db: {}, functions: {}}));

import {
  createAnalysisJob,
  deleteAnalysisRecord,
  deleteCurrentUserData,
  getAnalysisHistory,
  getAnalysisRecord,
  saveCheckIn,
} from './analysisService';

const ANALYSIS_ID = '20000000-0000-4000-8000-000000000001';

beforeEach(() => vi.clearAllMocks());

describe('analysis service boundary', () => {
  it('coalesces concurrent analysis requests and validates the response', async () => {
    let resolveRequest: ((value: unknown) => void) | undefined;
    mocks.createAnalysis.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      }),
    );
    const request = {
      idempotencyKey: ANALYSIS_ID,
      responses: {
        fearedFuture: 'Remaining stuck for another year.',
        limitingHabit: 'Waiting for perfect clarity before starting.',
        disconnectionMoment: 'When consuming ideas without making anything.',
        chosenLife: 'Building useful tools at a sustainable pace.',
        avoidedStart: 'Publishing a deliberately small first version.',
        desiredIdentity: 'A reliable builder who finishes meaningful work.',
        disciplineScore: '6',
        uncommittedDream: 'Building an independent product studio.',
      },
    };

    const first = createAnalysisJob(request);
    const second = createAnalysisJob(request);
    expect(mocks.createAnalysis).toHaveBeenCalledOnce();
    resolveRequest?.({
      data: {analysisId: ANALYSIS_ID, status: 'completed', analysis: DEMO_ANALYSIS},
    });

    await expect(first).resolves.toMatchObject({status: 'completed'});
    await expect(second).resolves.toMatchObject({status: 'completed'});
  });

  it('parses individual and history records defensively', async () => {
    const data = {
      status: 'completed',
      result: DEMO_ANALYSIS,
      createdAt: {toDate: () => new Date('2026-08-31T00:00:00.000Z')},
    };
    mocks.getDoc.mockResolvedValue({exists: () => true, id: ANALYSIS_ID, data: () => data});
    mocks.getDocs.mockResolvedValue({
      docs: [{id: ANALYSIS_ID, data: () => data}],
    });

    await expect(getAnalysisRecord(ANALYSIS_ID)).resolves.toMatchObject({
      id: ANALYSIS_ID,
      status: 'completed',
      result: DEMO_ANALYSIS,
    });
    await expect(getAnalysisHistory('owner')).resolves.toHaveLength(1);

    mocks.getDoc.mockResolvedValue({exists: () => false});
    await expect(getAnalysisRecord(ANALYSIS_ID)).resolves.toBeNull();
  });

  it('validates check-in acknowledgements and invokes deletion callables', async () => {
    const checkInId = 'a'.repeat(64);
    mocks.upsertCheckIn.mockResolvedValue({
      data: {checkInId, savedAt: '2026-08-31T12:00:00.000Z'},
    });
    mocks.deleteAnalysis.mockResolvedValue({data: {deleted: true}});
    mocks.deleteMyData.mockResolvedValue({data: {deleted: true}});

    await expect(
      saveCheckIn({
        analysisId: ANALYSIS_ID,
        habitStates: [
          {habitIndex: 0, status: 'done'},
          {habitIndex: 1, status: 'not_started'},
        ],
        mood: 4,
      }),
    ).resolves.toEqual({checkInId, savedAt: '2026-08-31T12:00:00.000Z'});
    await expect(deleteAnalysisRecord(ANALYSIS_ID)).resolves.toBeUndefined();
    await expect(deleteCurrentUserData()).resolves.toBeUndefined();
  });
});
