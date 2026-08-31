import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY?.trim(),
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN?.trim(),
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID?.trim(),
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET?.trim(),
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID?.trim(),
  appId: import.meta.env.VITE_FIREBASE_APP_ID?.trim(),
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'appId'] as const;
export const firebaseMissingConfig = requiredKeys.filter(
  (key) => !firebaseConfig[key],
);

export const firebaseConfigured = firebaseMissingConfig.length === 0;

// The marketplace now treats Firestore as the source of truth. Clear legacy
// browser caches once at startup so deleted demo shops/products cannot reappear.
if (typeof window !== 'undefined') {
  try {
    window.localStorage.removeItem('claymarket_shops_v2');
    window.localStorage.removeItem('claymarket_products');
  } catch {
    // localStorage is optional; Firebase remains the source of truth.
  }
}

if (!firebaseConfigured && import.meta.env.DEV) {
  console.warn(
    `Claymarket Firebase is not configured. Missing: ${firebaseMissingConfig.join(', ')}`,
  );
}

let firebaseApp: FirebaseApp | null = null;

if (firebaseConfigured) {
  firebaseApp = getApps()[0] ?? initializeApp(firebaseConfig);
}

export const firebaseAuthClient: Auth | null = firebaseApp ? getAuth(firebaseApp) : null;
export const firebaseDb: Firestore | null = firebaseApp ? getFirestore(firebaseApp) : null;
export const firebaseStorage: FirebaseStorage | null = firebaseApp ? getStorage(firebaseApp) : null;

export function requireFirebase(): {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
} {
  if (!firebaseApp || !firebaseAuthClient || !firebaseDb || !firebaseStorage) {
    throw new Error(
      `Firebase is not configured. Missing: ${firebaseMissingConfig.join(', ') || 'unknown configuration'}.`,
    );
  }

  return {
    app: firebaseApp,
    auth: firebaseAuthClient,
    db: firebaseDb,
    storage: firebaseStorage,
  };
}
