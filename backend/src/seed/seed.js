import 'dotenv/config';
import { firebaseAuth, firestore } from '../config/firebase.js';
import { Category } from '../models/Category.js';

// Production-safe seed policy:
// - Do NOT create seeded markets, shops, sellers, products, or image URLs.
// - Real markets/shops/products must be created by real users/admins.
// - Image fields must remain empty until a user explicitly uploads an image.
// - Categories are system taxonomy only and contain no user/shop media.
const categories = [
  ['cat_slippers', 'Slippers', 'slippers', 'Comfortable daily footwear and sandals.'],
  ['cat_clothes', 'Clothes', 'clothes', 'Ethnic wear, cotton, shirts and fabrics.'],
  ['cat_electronics', 'Electronics', 'electronics', 'Mobile accessories and everyday electronics.'],
  ['cat_home', 'Home & Living', 'home', 'Bamboo crafts, utensils and home goods.'],
  ['cat_grocery', 'Grocery', 'grocery', 'Local produce, tea, rice and grains.'],
  ['cat_more', 'More', 'more', 'Stationery, tools, bags and local crafts.'],
];

async function clearCollection(name) {
  const db = firestore();
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  if (!snap.empty) await batch.commit();
}

async function seed() {
  // This seed intentionally resets demo/user marketplace data so no old
  // seeded market/shop/image can be recreated by running the seed again.
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8) {
    throw new Error('Set SEED_PASSWORD (8+ chars) before running the Firebase seed.');
  }

  // Clear all runtime data. Firebase Auth users are intentionally not deleted
  // here because the seed no longer creates demo users.
  for (const collection of [
    'users',
    'markets',
    'categories',
    'shops',
    'products',
    'orders',
    'reviews',
    'conversations',
    'messages',
  ]) {
    await clearCollection(collection);
  }

  await Category.create(
    categories.map(([id, name, slug, description]) => ({
      _id: id,
      name,
      slug,
      iconType: slug,
      description,
    }))
  );

  console.log('Firebase seed complete: no seeded markets, shops, products, or image URLs were created.');
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
