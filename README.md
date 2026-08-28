# Claymarket

Claymarket is a local-market marketplace with a Claymorphism frontend and a production-oriented Express API backed by **Firebase Authentication + Cloud Firestore**.

## Local development

### 1. Firebase project

Create a Firebase project and enable:

- Authentication → Email/Password
- Cloud Firestore
- A Firebase Web App
- Firebase Admin SDK credentials for the backend

See `FIREBASE-SETUP.md` for the complete setup.

### 2. Frontend

Copy `.env.example` to `.env` and fill the Firebase Web App values, then:

```bash
npm install
npm run dev
```

### 3. Backend

Copy `backend/.env.example` to `backend/.env` and configure Firebase Admin credentials, then:

```bash
cd backend
npm install
npm start
```

Or from the project root:

```bash
npm run server
```

### 4. Seed marketplace data (optional)

Set a seed password at runtime:

```bash
set SEED_PASSWORD=ChooseARealSeedPassword123!
npm run backend:seed
```

This creates Firestore marketplace data and real Firebase Authentication seed accounts. No password is stored in source code.

### Health

`GET http://localhost:5000/api/health`

### Readiness

`GET http://localhost:5000/api/ready`

## Production

See `PRODUCTION-READINESS.md`, `FIREBASE-SETUP.md` and `docker-compose.production.yml`.

The production stack no longer starts or requires MongoDB. Firebase Authentication handles identity/passwords and Cloud Firestore stores marketplace application data. The Express API remains the server-side authorization/business-logic boundary.

## Security

Never commit Firebase Admin service-account credentials or private keys. Use deployment secrets or Application Default Credentials.
