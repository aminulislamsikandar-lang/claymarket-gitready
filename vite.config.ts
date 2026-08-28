import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

function seoFilesPlugin(): Plugin {
  return {
    name: 'claymarket-seo-files',
    generateBundle() {
      const siteUrl = (process.env.VITE_SITE_URL || 'https://YOUR-DOMAIN.example').replace(/\/$/, '');
      const paths = ['/', '/shops', '/categories', '/about', '/faq', '/privacy-policy', '/terms'];
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(p => `<url><loc>${siteUrl}${p}</loc></url>`).join('')}</urlset>`;
      const robots = `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${siteUrl}/sitemap.xml\n`;
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: sitemap });
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}

export default defineConfig(() => ({
  plugins: [react(), tailwindcss(), seoFilesPlugin()],
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') },
  },
  server: {
    hmr: process.env.DISABLE_HMR !== 'true',
    watch: process.env.DISABLE_HMR === 'true' ? null : {},
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    cssMinify: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        // Firebase (Auth + Firestore + Storage SDKs) is the single largest
        // dependency and rarely changes between deploys, so splitting it
        // into its own chunk lets browsers cache it across app updates
        // instead of re-downloading it every time application code changes.
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
        },
      },
    },
  },
}));
