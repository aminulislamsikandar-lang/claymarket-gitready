import admin from 'firebase-admin';

let app;

function privateKey() {
  return String(process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n');
}

export function getFirebaseApp() {
  if (app) return app;
  if (admin.apps.length) {
    app = admin.app();
    return app;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const key = privateKey();

  if (projectId && clientEmail && key) {
    app = admin.initializeApp({
      credential: admin.credential.cert({ projectId, clientEmail, privateKey: key }),
      projectId,
    });
  } else {
    // Supports GOOGLE_APPLICATION_CREDENTIALS / Application Default Credentials in deployed environments.
    app = admin.initializeApp();
  }
  return app;
}

export function firebaseAuth() {
  return admin.auth(getFirebaseApp());
}

export function firestore() {
  return admin.firestore(getFirebaseApp());
}

export { admin };
