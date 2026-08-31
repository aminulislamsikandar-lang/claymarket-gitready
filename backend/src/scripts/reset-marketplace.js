// One-off cleanup script: wipes ALL marketplace data (Firestore + Auth users)
// so the site starts completely fresh. Markets/shops will only reappear once
// a real seller creates one through the app.

// Run this ONCE, from the backend service's Render Shell (or as a Render
// One-Off Job), never from a browser or the frontend:

//   node src/scripts/reset-marketplace.js

// It reuses the same Firebase Admin credentials the backend already has
// configured (FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY),
// so no extra setup is needed on Render.

import 'dotenv/config';
import { firebaseAuth, firestore } from '../config/firebase.js';

const COLLECTIONS_TO_CLEAR = [
  'shops',
  'markets',
  'products',
  'conversations',
  'messages',
  'orders',
  'reviews',
];

async function clearCollection(name) {
  const db = firestore();
  const snap = await db.collection(name).get();
  if (snap.empty) {
    console.log(`  ${name}: already empty`);
    return;
  }

  // Firestore batches are capped at 500 writes, so chunk large collections.
  const docs = snap.docs;
  const CHUNK_SIZE = 400;
  let deleted = 0;
  for (let i = 0; i < docs.length; i += CHUNK_SIZE) {
    const batch = db.batch();
    docs.slice(i, i + CHUNK_SIZE).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    deleted += Math.min(CHUNK_SIZE, docs.length - i);
  }
  console.log(`  ${name}: deleted ${deleted} document(s)`);
}

async function deleteAllAuthUsers() {
  const auth = firebaseAuth();
  let deleted = 0;
  let pageToken;
  do {
    const result = await auth.listUsers(1000, pageToken);
    if (result.users.length > 0) {
      const uids = result.users.map(u => u.uid);
      const res = await auth.deleteUsers(uids);
      deleted += res.successCount;
      if (res.failureCount > 0) {
        console.warn(`  Warning: ${res.failureCount} user(s) failed to delete`);
      }
    }
    pageToken = result.pageToken;
  } while (pageToken);
  console.log(`  Firebase Auth: deleted ${deleted} user(s)`);
}

async function main() {
  console.log('Resetting Claymarket to a fresh, empty state...\n');

  console.log('Clearing Firestore collections:');
  for (const name of COLLECTIONS_TO_CLEAR) {
    await clearCollection(name);
  }

  console.log('\nClearing Firebase Authentication users:');
  await deleteAllAuthUsers();

  console.log('\nDone. The site will now show no markets/shops/products until');
  console.log('a real seller registers and creates a shop through the app.');
  process.exit(0);
}

main().catch(error => {
  console.error('Reset failed:', error);
  process.exit(1);
});
