# Deploy checklist (read this first)

## Audit result
Full code audit performed on this package:
- `npm install` + `tsc --noEmit` → **0 TypeScript errors**
- `npm run build` (Vite production build) → **succeeds**, no warnings besides an expected bundle-size note (Firebase SDK is already split into its own cached chunk on purpose — see `vite.config.ts`)
- `node --check` on every backend source file → **0 syntax errors**
- Dev server boot + module transform check on all core files → **clean**
- "Become a Seller" / shop-creation flow (`registerSeller` in `src/context/AppContext.tsx`, wired from `src/components/AuthModal.tsx`) was traced end-to-end against `firestore.rules` → the batched write (promote user to `seller` + create the `shops/{shopId}` doc) matches exactly what the security rules require. No code bug found.

No source changes were needed — the codebase was already sound. One stale doc line (`PRODUCTION-READINESS.md` referenced a non-existent `VITE_DEMO_ROLE` env var) was corrected.

## Why "shop creation" most commonly fails in production (not a code bug)
This app creates shops **client-side**, writing straight to Firestore from the browser (not through the Express backend). That means shop creation will fail with a permissions error unless BOTH of these are done, regardless of how correct the code is:

1. **Real Firebase env vars are set** — copy `.env.example` to `.env` and fill in your actual Firebase Web App config (Project settings → Your apps) before `npm run build`. If these are missing, the app runs in a safe fallback mode and `registerSeller` throws "Firebase is not configured."
2. **The security rules in this repo are actually deployed to your Firebase project** — having `firestore.rules` / `storage.rules` in the repo does nothing on its own. Run:
   ```
   firebase deploy --only firestore:rules,storage:rules
   ```
   If you skip this, your Firestore project falls back to its default rules (usually fully locked), and every shop-creation write will fail with `permission-denied` even though the app code is 100% correct.
3. Update `.firebaserc` — it currently points at project id `claymarket1`. Change this to your real Firebase project id.

## Full pre-launch checklist
- [ ] `cp .env.example .env` and fill in real `VITE_FIREBASE_*` values
- [ ] `.firebaserc` → set your real project id
- [ ] `firebase deploy --only firestore:rules,storage:rules`
- [ ] In Firebase Console, enable Email/Password sign-in under Authentication
- [ ] Create the `markets` and `categories` collections (see `backend/src/seed/seed.js`) — the seller-signup form's Market/Category dropdowns come from these; if empty, sellers can't pick a market/category
- [ ] Set `VITE_SITE_URL` to your real domain before building (used for canonical URLs, `sitemap.xml`, `robots.txt`)
- [ ] If you use the Express backend (`backend/`) for auth-resolve/orders/messages, set `backend/.env` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FRONTEND_ORIGINS`) and deploy it — it fails fast on startup with a clear error if these are missing
- [ ] `npm run build` → deploy the `dist/` folder (Docker/nginx setup is included: `Dockerfile.frontend`, `deploy/nginx.conf`, `docker-compose.production.yml`)
