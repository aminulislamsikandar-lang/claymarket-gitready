# Claymarket Firebase Auth Stability & UX Update

This build preserves the existing Claymarket features and Firebase-based authentication.

## Authentication stability
- Sign-in no longer falls back to the legacy `/auth/me` endpoint after Firebase authentication succeeds.
- Firebase token/profile operations have bounded timeouts so the UI cannot remain in an indefinite loading state.
- A successful Firebase session is preserved even when profile synchronization is temporarily unavailable.
- Missing Firestore user profiles are repaired automatically.
- Seller information can be recovered from the existing local shop cache during temporary profile-sync failures.
- Logout continues to use Firebase `signOut()`.

## Auth modal UX
- Password visibility toggle.
- Loading spinner and clearer action text.
- Accessible dialog semantics and Escape-to-close.
- Better error presentation with live-region support.
- Password is cleared when switching auth modes or closing the modal.
- Mobile/smaller viewport scrolling is handled inside the modal.
- Existing seller location/shop fields and all existing tabs remain intact.

## Auth/Firebase fixes (this pass)

- **Sign-up race condition**: `onAuthStateChanged` could fire and try to
  "repair" a not-yet-created Firestore profile while `registerAccount` /
  `registerSeller` / login were still writing it, occasionally causing the
  listener's generic placeholder write to overwrite the real name/phone/role
  depending on network timing. A `manualAuthInProgressRef` guard now makes
  the listener stand down while a manual auth flow is in flight.
- **Lost account-creation date**: promoting a buyer to a seller
  (`registerSeller`) was resetting `createdAt` on every promotion. It now
  only touches `updatedAt`.
- **Token freshness on sign-up**: the ID token is now force-refreshed before
  the first Firestore profile write (was refreshed after), so the token's
  claims are current when security rules evaluate the write.
- **Firestore rules hardening** (`firestore.rules`):
  - A shop update could previously reassign `ownerId` to a different UID.
    Ownership can no longer change on update.
  - A product create only checked that `shopId` was a string, not that the
    caller actually owned that shop — a signed-in seller could attach a
    product to someone else's shop id. Now verified with a `get()` on the
    shop doc.
  - A product update could silently move a product to a different shop.
    `shopId` can no longer change on update.
- **Backend Firestore ORM cost/performance bug** (`backend/src/utils/firestoreModel.js`):
  `findById(...)` (and any `_id`/`_id: {$in:[...]}` filter) was implemented
  by reading **every document in the collection** and filtering in memory.
  Since this runs on every authenticated request (the auth middleware calls
  `User.findById` on every call) and in nearly every controller, this was a
  real Firestore cost and latency problem that gets worse as data grows. It
  now resolves `_id` lookups with direct document reads.

Validated with `tsc --noEmit` and `vite build` (frontend) and `node --check`
across all backend source files after each change.

