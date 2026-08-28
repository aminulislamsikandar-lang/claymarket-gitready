import { firestore } from './firebase.js';

function assertRequiredEnv() {
  // Firebase Admin can silently fall back to Application Default Credentials
  // when explicit credentials are missing, which then fails later with a
  // cryptic gRPC/auth error on the first request. Fail fast at startup with
  // an actionable message instead, unless ADC is clearly intended (GOOGLE_
  // APPLICATION_CREDENTIALS set, e.g. on Cloud Run/GKE/App Engine).
  const usingExplicitCredentials = Boolean(
    process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY,
  );
  const usingAdc = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  if (!usingExplicitCredentials && !usingAdc) {
    throw new Error(
      'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL and ' +
      'FIREBASE_PRIVATE_KEY (see backend/.env.example), or set GOOGLE_APPLICATION_CREDENTIALS to a ' +
      'service account file when relying on Application Default Credentials.',
    );
  }

  if (process.env.NODE_ENV === 'production') {
    const origins = String(process.env.FRONTEND_ORIGINS || '');
    if (!origins || /localhost|127\.0\.0\.1/.test(origins)) {
      console.warn(
        'WARNING: FRONTEND_ORIGINS is unset or still points at localhost while NODE_ENV=production. ' +
        'Set it to your real deployed frontend origin(s) or CORS will reject browser requests.',
      );
    }
  }
}

export async function connectDB() {
  assertRequiredEnv();
  // Firestore is serverless; initialize the Firebase Admin SDK and perform a harmless read
  // so configuration errors surface during backend startup rather than on the first request.
  const db = firestore();
  await db.collection('system').doc('health').get();
  console.log('Firebase/Firestore connected.');
}
