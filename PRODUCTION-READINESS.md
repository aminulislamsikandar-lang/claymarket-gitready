# Claymarket production readiness

This release preserves the existing frontend and adds a hardened backend foundation.

## Included
- Express + Firebase/Cloud Firestore/Mongoose API
- Firebase ID token authentication and bcrypt password hashing
- Helmet security headers and restricted CORS
- Request IDs and centralized API errors
- Health/readiness endpoints
- Basic request/auth rate limiting
- Seller/admin authorization checks
- Markets, categories, shops, products, conversations/messages
- Orders and reviews API foundations
- Seed data
- Graceful shutdown
- Dockerfile for API and frontend
- Production docker-compose for Firebase/Cloud Firestore + API
- Environment-based configuration

## Before production launch
1. Set a unique 32+ character `Firebase ID token_SECRET`.
2. Set exact production `FRONTEND_ORIGINS`.
3. Set `TRUST_PROXY=true` only when running behind a trusted reverse proxy.
4. Use managed Firebase/Cloud Firestore or a properly secured Firebase/Cloud Firestore deployment with backups.
5. Put the API behind HTTPS/reverse proxy.
6. Add a real object-storage service for product/shop images; the API stores image URLs, not large binary files.
7. Replace the simple in-process rate limiter with a shared Redis-backed limiter when horizontally scaling multiple API instances.
8. Run dependency/security audits in CI and pin/lock dependencies.
9. Configure monitoring, logs, backups, and alerting.


## Final hardening notes

- Production visitors start as Guest by default. There is no demo-role override in the current code — every visitor must sign in (or register) through the real Firebase Auth flow to become a buyer or seller.
- Product creation requires a name and at least one image; price, description, stock, category and sizes remain optional.
- Products without a price cannot be added to cart or checked out; they remain contact-seller listings.
- Multi-shop carts are split into separate local orders by shop in the current frontend prototype.
- Detail URLs are deep-linkable (`/markets/:market`, `/markets/:market/:category`, `/shops/:shop`, `/products/:product`) and invalid entity URLs render the custom 404.
- The frontend currently preserves its local/mock state and backend APIs are available for incremental integration; this release does not falsely claim that the browser is fully backed by Firebase/Cloud Firestore.
- Before public launch, set `VITE_SITE_URL`, `FRONTEND_ORIGINS`, `Firebase ID token_SECRET`, `MONGODB_URI`, and any real social/analytics identifiers.
- Real payment processing, production image storage/CDN, email/SMS delivery, shipping carrier integration, and operational monitoring still require provider-specific configuration.


## Firebase production integration

- Firebase Web SDK initialization is guarded against missing configuration so a missing environment variable cannot blank-screen the application.
- Firebase Authentication is used for real buyer/seller registration, sign-in, persistent sessions, and logout.
- Firestore stores authenticated user profiles and seller/shop data.
- Seller profiles require and persist state, district, market, and shop name.
- Firestore shop/product data is merged into the existing marketplace UI without removing the existing demo/reference catalog.
- Firebase Storage is used for seller product image uploads.
- Firestore and Storage security rules are included in `firestore.rules` and `storage.rules`.
- Firebase Admin SDK verifies ID tokens on the Express API.
