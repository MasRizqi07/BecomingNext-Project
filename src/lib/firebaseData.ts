import {connectFirestoreEmulator, getFirestore} from 'firebase/firestore';
import {connectFunctionsEmulator, getFunctions} from 'firebase/functions';

import {firebaseApp, firestoreDatabaseId, useFirebaseEmulators} from '@/lib/firebaseCore';

export const db = getFirestore(firebaseApp, firestoreDatabaseId);
export const functions = getFunctions(firebaseApp, 'asia-southeast1');

if (useFirebaseEmulators) {
  connectFirestoreEmulator(db, '127.0.0.1', 8180);
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
