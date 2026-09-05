// scripts/generate-sitemap.js
//
// Builds public/sitemap.xml from your live backend data (markets, shops,
// products) plus the static pages. Run it before every production build so
// the sitemap always reflects what's actually in Firestore right now.
//
// Usage:
//   SITEMAP_SITE_URL=https://your-domain.com \
//   SITEMAP_API_URL=https://your-backend.onrender.com/api \
//   node scripts/generate-sitemap.js
//
// Falls back to VITE_SITE_URL / VITE_API_URL from your .env if the
// SITEMAP_* vars aren't set, and finally to localhost defaults.

import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = (
  process.env.SITEMAP_SITE_URL ||
  process.env.VITE_SITE_URL ||
  'http://localhost:3000'
).replace(/\/$/, '');

const API_URL = (
  process.env.SITEMAP_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/$/, '');

const STATIC_PAGES = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/markets', changefreq: 'daily', priority: '0.9' },
  { path: '/shops', changefreq: 'daily', priority: '0.9' },
  { path: '/categories', changefreq: 'weekly', priority: '0.7' },
  { path: '/about', changefreq: 'monthly', priority: '0.4' },
  { path: '/faq', changefreq: 'monthly', priority: '0.3' },
  { path: '/privacy-policy', changefreq: 'yearly', priority: '0.2' },
  { path: '/terms', changefreq: 'yearly', priority: '0.2' },
];

async function fetchAll(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    if (!res.ok) {
      console.warn(`[sitemap] ${endpoint} responded ${res.status}, skipping.`);
      return [];
    }
    const json = await res.json();
    return Array.isArray(json?.data) ? json.data : [];
  } catch (err) {
    console.warn(`[sitemap] failed to fetch ${endpoint}:`, err.message);
    return [];
  }
}

function urlEntry(loc, { changefreq = 'weekly', priority = '0.5', lastmod } = {}) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].filter(Boolean).join('\n');
}

async function main() {
  const [markets, shops, products] = await Promise.all([
    fetchAll('/markets'),
    fetchAll('/shops'),
    fetchAll('/products'),
  ]);

  const entries = [];

  for (const p of STATIC_PAGES) {
    entries.push(urlEntry(`${SITE_URL}${p.path}`, p));
  }

  for (const market of markets) {
    const id = market._id || market.id;
    if (!id) continue;
    entries.push(urlEntry(`${SITE_URL}/markets/${id}`, {
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: market.updatedAt,
    }));
  }

  for (const shop of shops) {
    const id = shop._id || shop.id;
    if (!id) continue;
    entries.push(urlEntry(`${SITE_URL}/shops/${id}`, {
      changefreq: 'weekly',
      priority: '0.7',
      lastmod: shop.updatedAt,
    }));
  }

  for (const product of products) {
    const id = product._id || product.id;
    if (!id) continue;
    entries.push(urlEntry(`${SITE_URL}/products/${id}`, {
      changefreq: 'daily',
      priority: '0.6',
      lastmod: product.updatedAt,
    }));
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  fs.writeFileSync(outPath, xml, 'utf-8');
  console.log(`[sitemap] wrote ${entries.length} URLs to ${outPath}`);
}

main();
