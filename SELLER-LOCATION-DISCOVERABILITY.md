# Seller Location & Shop Discoverability

Seller registration now requires and stores:

- State
- District
- Market
- Shop name

The location is stored in both the authenticated seller profile (`sellerLocation`) and the shop document (`state`, `district`, `marketId`, `marketName`).

Customer shop search can match:

- Shop name
- Market name
- State
- District
- Shop address
- Shop description

New seller shops are added to the active marketplace collection immediately after registration and are also loaded from the Firebase/Firestore-backed `/api/shops` endpoint so they remain discoverable across clients.
