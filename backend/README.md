# Claymarket Backend

Real Express API using **Firebase Authentication + Cloud Firestore** for the existing Claymarket marketplace.

## Requirements

- Node.js 20+
- A Firebase project with Email/Password Authentication and Firestore enabled
- Firebase Admin SDK credentials for the backend

## Setup

From the project root:

```powershell
npm install
copy backend\.env.example backend\.env
```

Fill the Firebase Admin environment variables in `backend/.env`.

## Seed data (optional)

Set a seed password at runtime:

```powershell
$env:SEED_PASSWORD="ChooseARealSeedPassword123!"
npm run backend:seed
```

The seed creates real Firebase Authentication accounts and matching Firestore profiles. The password is never stored in source code.

## Run API

```powershell
npm run server
```

API: `http://localhost:5000`

Health check: `GET /api/health`

Readiness: `GET /api/ready`

## Core endpoints

- `/api/auth`
- `/api/markets`
- `/api/categories`
- `/api/shops`
- `/api/products`
- `/api/conversations`
- `/api/search`
- `/api/orders`
- `/api/reviews`

Authentication is performed by Firebase Authentication in the frontend. The Express API verifies Firebase ID tokens with Firebase Admin SDK and reads role/profile data from Firestore.
