# ClayMarket — Combined fixes (#1 SEO, #2 Code quality, #3 Performance, #4 Trust & polish)

Sab verified hai jaha verify possible tha (tsc/eslint/vitest/node --check actually
chala ke check kiya — neeche "Kya verify kiya" section me proof hai). Payment
aur reviews/disputes backend ke liye kuch cheezein tumhare real repo dekhe
bina assume karni padi hain — wo saaf-saaf neeche likhi hain, in-line comments
me bhi hain code ke andar.

## ⚠️ Sabse zaroori baat — kya assume kiya hai

Mere paas tumhara pura repo nahi hai (`server.js`, `middleware/`, existing
`Order`/`Product`/`Shop` Mongoose models, auth setup) — sirf pichle fixes ki
files. Isliye:

1. **`requireAuth` middleware** — naye routes (`reviewRoutes.js`,
   `disputeRoutes.js`, `paymentRoutes.js`) `../middleware/requireAuth.js` se
   import karte hain aur maan lete hain `req.user.id` / `req.user.name` set
   hota hai. Agar tumhara auth middleware kisi aur naam/path se hai (Firebase
   ID token verify karta koi function), to bas import line badal do — logic
   waisa hi rahega.
2. **`Order` model ke fields** — maine assume kiya `order.total`,
   `order.shopId`, `order.buyerId`, `order.paymentStatus` fields hain. Agar
   naam alag hai, `paymentController.js` aur `disputeController.js` me
   sirf field-names match karne honge.
3. **Mongoose** — `package.json` me maine `mongoose` dependency add kar di
   hai (backend Mongoose models use karta hai, jaisa `prerenderController.js`
   se pata chalta hai) — **agar tumhare asli package.json me already hai to
   ye package.json ko poora overwrite mat karo, bas naye scripts/deps
   manually merge kar lena.**

## Files aur kahan copy karna hai

### #1 SEO
| File | Copy to |
|---|---|
| `public/robots.txt` | `public/robots.txt` — apna real domain daal do |
| `public/manifest.json` | `public/manifest.json` |
| `index.html` | root — overwrite |
| `scripts/generate-sitemap.js` | `scripts/generate-sitemap.js` |
| `backend/src/controllers/prerenderController.js` + `routes/prerenderRoutes.js` | same paths (optional/advanced — bot link-preview ke liye) |
| `deploy/nginx.conf` | overwrite (optional/advanced) |
| `backend/src/server.js.PATCH.md` | mat copy karo — sirf 2-line manual patch instructions |

### #2 Code quality
| File | Copy to |
|---|---|
| `tsconfig.json` | root — `strict: true` |
| `src/context/AppContext.tsx` | overwrite |
| `eslint.config.js`, `vitest.config.ts` | root — new |
| `src/test/setup.ts` | new |
| `src/utils/__tests__/imageOptimizer.test.ts`, `share.test.ts` | new |

### #3 Performance
| File | Copy to |
|---|---|
| `src/utils/cloudinaryOptimizer.ts` | new — responsive Cloudinary URL/srcset builder |
| `src/components/OptimizedImage.tsx` | new — `<img>` drop-in replacement |
| `src/utils/__tests__/cloudinaryOptimizer.test.ts` | new — 11 tests |

Manual step: `<img src={product.image}>` ko `<OptimizedImage src={product.image} alt={...} />` se replace karo jahan bhi product/shop images render hoti hain. Above-fold images pe `priority` prop lagao.

### #4 Trust & polish (is turn me naya)

**Order tracking status**
| File | Copy to | Kya hai |
|---|---|---|
| `src/utils/orderStatus.ts` | new | Existing statuses (`pending`/`confirmed`/`ready_for_pickup`/`completed`/`cancelled`) ko timeline me convert karta hai — koi naya status add nahi kiya, sirf display logic |
| `src/components/OrderStatusTimeline.tsx` | new | Amazon/Flipkart-style visual tracker |
| `src/utils/__tests__/orderStatus.test.ts` | new | 6 tests |

Use: apne order-detail view me `<OrderStatusTimeline status={order.status} />` daal do.

**Reviews & ratings**
| File | Copy to | Kya hai |
|---|---|---|
| `backend/src/models/Review.js` | new | Mongoose schema — ek user, ek product, ek review (upsert) |
| `backend/src/controllers/reviewController.js` | new | Create/list/delete + product ka `rating`/`reviewsCount` auto-update karta hai (tumhare Product model me ye fields already the) |
| `backend/src/routes/reviewRoutes.js` | new | `GET /products/:productId`, `POST /`, `DELETE /:id` |
| `src/utils/reviews.ts` | new | Pure helpers — average rating, star-distribution, validation |
| `src/components/StarRating.tsx`, `ReviewForm.tsx`, `ReviewList.tsx` | new | Display + submit UI |
| `src/utils/__tests__/reviews.test.ts` | new | 8 tests |

Verified-purchase check hai: review tabhi post hoga jab `orderId` diya jaye aur wo order us buyer ka `completed` ho (optional — `orderId` skip kar sakte ho agar har purchase pe strict check nahi chahiye).

**Return/refund + dispute flow**
| File | Copy to | Kya hai |
|---|---|---|
| `backend/src/models/Dispute.js` | new | Mongoose schema — reason enum, status enum |
| `backend/src/controllers/disputeController.js` | new | Create (7-din window check), list mine/shop, seller response |
| `backend/src/routes/disputeRoutes.js` | new | `POST /`, `GET /mine`, `GET /shop/:shopId`, `PATCH /:id` |
| `src/utils/disputeStatus.ts` | new | Pure label helpers | 
| `src/components/DisputeForm.tsx` | new | "Report a problem" form on order |
| `src/components/ReturnPolicyPage.tsx` | new | Static policy page — **content ek starting template hai, apni real terms se replace karo before publishing** |
| `src/utils/__tests__/disputeStatus.test.ts` | new | 5 tests |

**Payment gateway (Razorpay)**
| File | Copy to | Kya hai |
|---|---|---|
| `backend/src/utils/razorpaySignature.js` | new | HMAC-SHA256 signature verification — **ye asli security check hai**, alag file rakhi taaki isolated verify ho sake |
| `backend/src/controllers/paymentController.js` | new | `createRazorpayOrder`, `verifyPayment` |
| `backend/src/routes/paymentRoutes.js` | new | `POST /create-order`, `POST /verify` |
| `src/utils/razorpayCheckout.ts` | new | Frontend — Razorpay checkout.js load + modal open |

**Setup (zaroori, bina iske payment kaam nahi karega):**
1. [Razorpay](https://razorpay.com) account banao (test mode se shuru karo), Key ID/Secret lo.
2. Env vars set karo: `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
3. `npm install` (razorpay package.json me add ho chuka hai)
4. Frontend flow: order create karo → backend `/payments/create-order` ko `orderId` bhejo → response se `keyId`/`razorpayOrderId`/`amount` milega → `openRazorpayCheckout()` call karo → user payment kare → `onSuccess` callback se mile fields backend `/payments/verify` ko bhejo → tabhi order `paid` maana jayega.

**Manual step tumhara hai**: `server.js` me `paymentRoutes`, `reviewRoutes`, `disputeRoutes` register karna (jaisa `server.js.PATCH.md` me prerender ke liye dikhaya):
```js
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import disputeRoutes from './routes/disputeRoutes.js';
// ...
app.use('/payments', paymentRoutes);
app.use('/reviews', reviewRoutes);
app.use('/disputes', disputeRoutes);
```

## Kya verify kiya (proof)

- **Frontend naye tests**: `cloudinaryOptimizer` (11), `orderStatus` (6),
  `reviews` (8), `disputeStatus` (5) = **30/30 pass**, actually `npx vitest run`
  chala ke.
- **TypeScript strict**: sab naye `.ts`/`.tsx` files `tsc --strict` se
  0 errors.
- **ESLint**: sab naye files 0 errors, 0 warnings.
- **Backend JS syntax**: sab naye backend files `node --check` se clean.
- **Razorpay signature function**: alag se isolate karke node me chala ke
  test kiya — valid signature accept, tampered/wrong-secret/empty/short
  signature sab correctly reject hote hain, koi crash nahi. Ye sabse critical
  security piece tha isliye extra verify kiya.

Jo verify NAHI ho saka (tumhara real repo dekhe bina possible nahi):
poore project ka end-to-end `npm run typecheck`/`build` — kyunki tumhare
asli `types.ts`, `firebase.ts`, `middleware/requireAuth.js`, `models/Order.js`
etc is package me nahi hain. Jab tum ye files apne real repo me daaloge
(jaha in dependencies ka original version already maujood hai), tab poora
build clean chalega.

## Install aur verify (apne machine pe, poora repo ke saath)

```
npm install
npm run typecheck
npm run lint
npm run test
npm run build
```

## Git push (VS Code terminal)

```
git clone https://github.com/aminulislamsikandar-lang/claymarket-gitready.git
cd claymarket-gitready
# upar table ke hisaab se files copy/overwrite karo
git add .
git commit -m "SEO + code quality + performance + trust/payments (reviews, disputes, order tracking, Razorpay)"
git push origin main
```

## Baaki bacha

**#5 Accessibility** — alt-text/ARIA/keyboard-nav audit. Iske liye tumhare
actual rendered components dekhne honge (real Lighthouse-style audit blind
nahi ho sakta) — jab chaho batana.
