import {createHash} from 'node:crypto';

import {Timestamp, type Firestore} from 'firebase-admin/firestore';

// Firebase ID tokens last for at most one hour. A 24-hour tombstone adds a generous
// buffer for clock skew and delayed clients, while Firestore TTL removes it automatically.
export const ACCOUNT_DELETION_TOMBSTONE_TTL_MS = 24 * 60 * 60 * 1000;

export function getAccountDeletionTombstoneRef(database: Firestore, userId: string) {
  const tombstoneId = createHash('sha256').update(userId).digest('hex');
  return database.collection('accountDeletionTombstones').doc(tombstoneId);
}

export function isDeletionRequested(value: unknown): boolean {
  return value instanceof Timestamp;
}
