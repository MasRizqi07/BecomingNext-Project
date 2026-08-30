import {getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions} from 'firebase/app';
import {initializeAppCheck, ReCaptchaEnterpriseProvider} from 'firebase/app-check';
import {
  connectAuthEmulator,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User,
} from 'firebase/auth';

import fallbackConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    FIREBASE_APPCHECK_DEBUG_TOKEN?: boolean | string;
  }
}

const environmentConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasEnvironmentConfig = Object.values(environmentConfig).every(
  (value) => typeof value === 'string' && value.length > 0 && value !== 'replace-me',
);

if (import.meta.env.PROD && !hasEnvironmentConfig) {
  throw new Error('Production Firebase configuration is incomplete.');
}

const config: FirebaseOptions = hasEnvironmentConfig ? environmentConfig : fallbackConfig;
export const firebaseApp: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(config);
export const auth = getAuth(firebaseApp);
export const firestoreDatabaseId =
  import.meta.env.VITE_FIRESTORE_DATABASE_ID || fallbackConfig.firestoreDatabaseId;
export const useFirebaseEmulators = import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true';

if (useFirebaseEmulators) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', {disableWarnings: true});
}

const appCheckSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY;
if (!useFirebaseEmulators && appCheckSiteKey && appCheckSiteKey !== 'replace-me') {
  if (import.meta.env.DEV && import.meta.env.VITE_APPCHECK_DEBUG === 'true') {
    window.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaEnterpriseProvider(appCheckSiteKey),
    isTokenAutoRefreshEnabled: true,
  });
} else if (import.meta.env.PROD) {
  throw new Error('Production App Check configuration is missing.');
}

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({prompt: 'select_account'});

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export function observeAuthState(onUserChanged: (user: User | null) => void) {
  return onAuthStateChanged(auth, onUserChanged, () => onUserChanged(null));
}

export function signOut() {
  return firebaseSignOut(auth);
}
