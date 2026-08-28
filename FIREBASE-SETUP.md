# Claymarket Firebase Setup

The application is configured for Firebase Authentication, Cloud Firestore, and Firebase Storage.

## Firebase project

- Project: `claymarket1`
- Web app: `Claymarket Web`

## Firebase Console steps

1. Open Firebase Console → **Authentication** → **Sign-in method**.
2. Enable **Email/Password**.
3. Open **Firestore Database** → create a database.
4. Open **Storage** → get started.
5. Deploy the included security rules:
   - `firestore.rules`
   - `storage.rules`

If using the Firebase CLI:

```powershell
npm install -g firebase-tools
firebase login
firebase use claymarket1
firebase deploy --only firestore:rules,storage
```

## Frontend environment

Copy `.env.example` to `.env.local` and fill the Firebase Web App values.

The uploaded working copy already contains `.env.local` for the registered `claymarket1` web app. Keep `.env.local` out of Git.

Required:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

## Backend environment

The Express API uses Firebase Admin SDK and Firestore. It needs either:

- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, and `FIREBASE_PRIVATE_KEY`, or
- Google Application Default Credentials / `GOOGLE_APPLICATION_CREDENTIALS`.

Do not put a Firebase service-account JSON or private key in frontend code.

## What is now real

- Firebase Email/Password authentication
- Persistent Firebase session restoration
- Firestore user profiles
- Real buyer registration
- Real seller registration
- Seller state, district, market, and shop name persistence
- Public Firestore shop discovery/search
- Firestore product persistence
- Firebase Storage product-image uploads
- Seller ownership checks in client rules
- Firebase ID-token based backend authentication

The existing marketplace UI, demo reference data, routes, SEO pages, carts, wishlist, messaging, orders, seller dashboard, and other existing features are preserved.
