import 'dotenv/config';
import { firebaseAuth, firestore } from '../config/firebase.js';
import { User } from '../models/User.js';
import { Market } from '../models/Market.js';
import { Category } from '../models/Category.js';
import { Shop } from '../models/Shop.js';
import { Product } from '../models/Product.js';

// Seed only the market that has the seeded real seller/shop below.
// Other markets should be created through the admin flow and become publicly
// visible only after a real seller has a shop there.
const markets = [
  ['mkt_kachumara','Kachumara Market','kachumara-market','Kachumara, Barpeta District, Assam','https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800','A local marketplace for footwear and everyday goods.'],
];
const categories = [
  ['cat_slippers','Slippers','slippers','Comfortable daily footwear and sandals.'],
  ['cat_clothes','Clothes','clothes','Ethnic wear, cotton, shirts and fabrics.'],
  ['cat_electronics','Electronics','electronics','Mobile accessories and everyday electronics.'],
  ['cat_home','Home & Living','home','Bamboo crafts, utensils and home goods.'],
  ['cat_grocery','Grocery','grocery','Local produce, tea, rice and grains.'],
  ['cat_more','More','more','Stationery, tools, bags and local crafts.'],
];
const img1='https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700';
const img2='https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700';
const img3='https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700';

async function clearCollection(name) {
  const db = firestore();
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach(doc => batch.delete(doc.ref));
  if (!snap.empty) await batch.commit();
}

async function ensureFirebaseUser(email, password, displayName) {
  try {
    return await firebaseAuth().getUserByEmail(email);
  } catch (error) {
    if (error.code !== 'auth/user-not-found') throw error;
    return firebaseAuth().createUser({ email, password, displayName });
  }
}

async function seed() {
  const password = process.env.SEED_PASSWORD;
  if (!password || password.length < 8) throw new Error('Set SEED_PASSWORD (8+ chars) before running the Firebase seed.');

  for (const collection of ['users','markets','categories','shops','products','orders','reviews','conversations','messages']) await clearCollection(collection);

  const adminUser = await ensureFirebaseUser('admin@claymarket.local', password, 'Admin');
  const sellerUser = await ensureFirebaseUser('aminul@claymarket.local', password, 'Aminul Islam');
  const buyerUser = await ensureFirebaseUser('rahul@claymarket.local', password, 'Rahul Das');

  await User.create([{ _id: adminUser.uid, name:'Admin', email:adminUser.email, role:'admin', avatar:'', addresses:[] }, { _id: sellerUser.uid, name:'Aminul Islam', email:sellerUser.email, role:'seller', phone:'+91 94350 87654', avatar:'', addresses:[], sellerLocation:{ state:'Assam', district:'Barpeta', marketId:'mkt_kachumara', marketName:'Kachumara Market' } }, { _id: buyerUser.uid, name:'Rahul Das', email:buyerUser.email, role:'buyer', phone:'+91 98765 12340', avatar:'', addresses:[] }]);
  const marketDocs = await Market.create(markets.map(([id,name,slug,location,bannerImage,description]) => ({ _id:id, name, slug, location, bannerImage, description })));
  const categoryDocs = await Category.create(categories.map(([id,name,slug,description]) => ({ _id:id, name, slug, iconType:slug, description })));
  const km = marketDocs.find(m=>m.slug==='kachumara-market');
  const slippers = categoryDocs.find(c=>c.slug==='slippers');
  const clothes = categoryDocs.find(c=>c.slug==='clothes');
  const shop = await Shop.create({ _id:'shop_aminul-slipper-shop', ownerId:sellerUser.uid, name:'Aminul Slipper Shop', slug:'aminul-slipper-shop', marketId:km._id, marketName:km.name, state:'Assam', district:'Barpeta', categoryIds:[slippers._id], profileImage:img1, coverImage:img3, description:'Quality slippers and footwear from Kachumara Market.', phone:'+91 94350 87654', address:'Stall #14, Footwear Alley, Kachumara Market', verified:true });
  await Product.create([
    { _id:'prod_black-comfort-slipper', sellerId:sellerUser.uid, shopId:shop._id, marketId:km._id, marketName:km.name, state:'Assam', district:'Barpeta', categoryIds:[slippers._id], name:'Black Comfort Slipper', price:299, originalPrice:399, description:'Comfortable everyday slipper.', stock:20, sizes:['7','8','9','10'], colors:[{name:'Black',hex:'#000000'}], images:[{url:img1,isPrimary:true}], status:'published' },
    { _id:'prod_brown-casual-slipper', sellerId:sellerUser.uid, shopId:shop._id, marketId:km._id, marketName:km.name, state:'Assam', district:'Barpeta', categoryIds:[slippers._id], name:'Brown Casual Slipper', price:349, originalPrice:449, description:'Casual local footwear.', stock:14, sizes:['7','8','9'], colors:[{name:'Brown',hex:'#7b4b2a'}], images:[{url:img2,isPrimary:true}], status:'published' },
    { _id:'prod_daily-wear-flip-flop', sellerId:sellerUser.uid, shopId:shop._id, marketId:km._id, marketName:km.name, state:'Assam', district:'Barpeta', categoryIds:[slippers._id], name:'Daily Wear Flip Flop', images:[{url:img3,isPrimary:true}], status:'published' },
    { _id:'prod_local-cotton-market-shirt', sellerId:sellerUser.uid, shopId:shop._id, marketId:km._id, categoryIds:[clothes._id], name:'Local Cotton Market Shirt', price:599, images:[{url:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700',isPrimary:true}], status:'hidden' },
  ]);
  console.log('Firebase seed complete. Seed password is supplied via SEED_PASSWORD.');
}
seed().catch(error => { console.error(error); process.exit(1); });
