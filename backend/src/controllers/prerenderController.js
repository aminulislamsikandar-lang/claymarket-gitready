// backend/src/controllers/prerenderController.js
//
// WHY THIS FILE EXISTS
// ---------------------
// Claymarket's frontend is a client-rendered SPA (Vite + React, no SSR).
// Real users get the full interactive app, and Googlebot is generally fine
// with that because it executes JavaScript before indexing a page.
//
// But link-preview bots used by WhatsApp, Facebook, Twitter/X, LinkedIn,
// Telegram and Slack do NOT execute JavaScript. When someone shares a
// product/shop/market link, those bots only ever see the static
// <meta property="og:..."> tags baked into index.html — which are always
// the generic "Claymarket — Your Local Marketplace" ones, never the actual
// product name, price, or photo.
//
// This controller renders a tiny, fast, meta-tag-correct HTML page for
// those bots only, built straight from the same Firestore data your API
// already serves. Real browsers never see this — see deploy/nginx.conf for
// the User-Agent based routing that sends only known bots here.

import { Product } from '../models/Product.js';
import { Shop } from '../models/Shop.js';
import { Market } from '../models/Market.js';

const SITE_URL = (process.env.SITE_URL || process.env.VITE_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/og-default.svg`;

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderMetaPage({ title, description, image, url, type = 'website' }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeImage = escapeHtml(image || DEFAULT_IMAGE);
  const safeUrl = escapeHtml(url);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${safeTitle}</title>
    <meta name="description" content="${safeDescription}" />
    <link rel="canonical" href="${safeUrl}" />
    <meta property="og:type" content="${type}" />
    <meta property="og:title" content="${safeTitle}" />
    <meta property="og:description" content="${safeDescription}" />
    <meta property="og:image" content="${safeImage}" />
    <meta property="og:url" content="${safeUrl}" />
    <meta property="og:site_name" content="Claymarket" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${safeTitle}" />
    <meta name="twitter:description" content="${safeDescription}" />
    <meta name="twitter:image" content="${safeImage}" />
    <!-- Bots stop here. Real visitors are redirected to the full app. -->
    <meta http-equiv="refresh" content="0; url=${safeUrl}" />
  </head>
  <body>
    <h1>${safeTitle}</h1>
    <p>${safeDescription}</p>
    <a href="${safeUrl}">Continue to Claymarket</a>
  </body>
</html>`;
}

export const prerenderProduct = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('shopId', 'name').populate('marketId', 'name');
  if (!product) return res.status(404).send('Not found');
  const price = product.price ? ` — ₹${product.price}` : '';
  const shopName = product.shopId?.name ? ` at ${product.shopId.name}` : '';
  res.set('Content-Type', 'text/html');
  return res.send(renderMetaPage({
    title: `${product.name}${price} | Claymarket`,
    description: product.description || `Buy ${product.name}${shopName} on Claymarket, your local marketplace.`,
    image: product.images?.[0],
    url: `${SITE_URL}/products/${product._id}`,
    type: 'product',
  }));
};

export const prerenderShop = async (req, res) => {
  const shop = await Shop.findById(req.params.id).populate('marketId', 'name');
  if (!shop) return res.status(404).send('Not found');
  res.set('Content-Type', 'text/html');
  return res.send(renderMetaPage({
    title: `${shop.name} | Claymarket`,
    description: shop.description || `Explore ${shop.name} on Claymarket, connecting you with local sellers.`,
    image: shop.coverImage || shop.profileImage,
    url: `${SITE_URL}/shops/${shop._id}`,
  }));
};

export const prerenderMarket = async (req, res) => {
  const market = await Market.findById(req.params.id);
  if (!market) return res.status(404).send('Not found');
  res.set('Content-Type', 'text/html');
  return res.send(renderMetaPage({
    title: `${market.name} | Claymarket`,
    description: market.description || `Discover shops and products in ${market.name} on Claymarket.`,
    image: market.image,
    url: `${SITE_URL}/markets/${market._id}`,
  }));
};
