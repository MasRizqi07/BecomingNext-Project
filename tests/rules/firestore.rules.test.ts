import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  where,
} from 'firebase/firestore';
import {afterAll, afterEach, beforeAll, describe, it} from 'vitest';

let environment: RulesTestEnvironment;

beforeAll(async () => {
  environment = await initializeTestEnvironment({
    projectId: 'demo-becoming',
    firestore: {
      rules: await import('node:fs/promises').then((fs) => fs.readFile('firestore.rules', 'utf8')),
    },
  });
});

afterEach(async () => environment.clearFirestore());
afterAll(async () => environment.cleanup());

async function seedAnalysis(id: string, userId: string): Promise<void> {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'analyses', id), {
      userId,
      status: 'completed',
      createdAt: new Date('2026-08-30T00:00:00Z'),
      result: {},
    });
  });
}

describe('Firestore ownership rules', () => {
  it('allows an owner to read an analysis and rejects another user', async () => {
    await seedAnalysis('analysis-one', 'owner');
    const ownerDb = environment.authenticatedContext('owner').firestore();
    const strangerDb = environment.authenticatedContext('stranger').firestore();

    await assertSucceeds(getDoc(doc(ownerDb, 'analyses', 'analysis-one')));
    await assertFails(getDoc(doc(strangerDb, 'analyses', 'analysis-one')));
  });

  it('allows a bounded owner query and rejects an unbounded query', async () => {
    await seedAnalysis('analysis-one', 'owner');
    const ownerDb = environment.authenticatedContext('owner').firestore();

    await assertSucceeds(
      getDocs(
        query(
          collection(ownerDb, 'analyses'),
          where('userId', '==', 'owner'),
          orderBy('createdAt', 'desc'),
          limit(20),
        ),
      ),
    );
    await assertFails(getDocs(collection(ownerDb, 'analyses')));
  });

  it('rejects all direct client writes', async () => {
    const ownerDb = environment.authenticatedContext('owner').firestore();
    await assertFails(
      setDoc(doc(ownerDb, 'analyses', 'client-created'), {
        userId: 'owner',
        status: 'completed',
      }),
    );
    await assertFails(
      setDoc(doc(ownerDb, 'reflections', 'client-created'), {
        userId: 'owner',
        responses: {},
      }),
    );
  });

  it('rejects unauthenticated reads', async () => {
    await seedAnalysis('analysis-one', 'owner');
    const anonymousDb = environment.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(anonymousDb, 'analyses', 'analysis-one')));
  });
});
