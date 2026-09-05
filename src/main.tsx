import React from 'react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Firebase/Firestore is the source of truth for marketplace data.
// Migrate only the two legacy marketplace caches once. User-owned caches
// (cart, wishlist, followed shops, conversation read state) must persist.
// Build marker: 2026-08-31 marketplace deployment refresh.
const MARKETPLACE_CACHE_MIGRATION_KEY = 'claymarket_cache_migrated_v1';

if (typeof window !== 'undefined') {
  try {
    if (!window.localStorage.getItem(MARKETPLACE_CACHE_MIGRATION_KEY)) {
      window.localStorage.removeItem('claymarket_shops_v2');
      window.localStorage.removeItem('claymarket_products');
      window.localStorage.setItem(MARKETPLACE_CACHE_MIGRATION_KEY, '1');
    }
  } catch {
    // localStorage may be unavailable/restricted; Firebase remains the source of truth.
  }

  // Register the PWA service worker in production only. The worker provides
  // app-shell caching without intercepting cross-origin Firebase/API requests.
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js').catch((error) => {
        console.warn('Claymarket service worker registration failed:', error);
      });
    });
  }
}

// Global broken-image fallback. Product/shop photos can come from many
// external hosts (Firebase Storage, Unsplash demo content, Google account
// avatars) and any one of those URLs can 404 or time out in production. The
// browser's `error` event does not bubble, but it does propagate in the
// capture phase, so a single listener here catches every <img> failure
// across the app without touching each component individually.
const FALLBACK_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23F0EEEA'/%3E%3Cpath d='M60 130l28-34 20 22 18-26 34 38z' fill='%23D9D5CE'/%3E%3Ccircle cx='78' cy='72' r='12' fill='%23D9D5CE'/%3E%3C/svg%3E";

document.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && !target.dataset.claymarketFallback) {
      target.dataset.claymarketFallback = 'true';
      target.src = FALLBACK_IMAGE_SRC;
      target.classList.add('claymarket-img-fallback');
    }
  },
  true,
);

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: '' };

  static getDerivedStateFromError(error: unknown) {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Unexpected application error.',
    };
  }

  componentDidCatch(error: unknown) {
    console.error('Claymarket application error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-[#F7F5F3] text-[#20243A] flex items-center justify-center p-6">
          <section className="max-w-lg w-full bg-white rounded-3xl p-8 shadow-xl border border-white text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FDECEC] text-[#C24141] flex items-center justify-center font-extrabold text-xl">
              !
            </div>
            <h1 className="mt-5 text-2xl font-extrabold">Claymarket could not load</h1>
            <p className="mt-2 text-sm text-[#737B89]">
              Please refresh the page. If the problem continues, check the Firebase configuration and browser console.
            </p>
            {import.meta.env.DEV && (
              <pre className="mt-4 text-left text-xs bg-[#F7F5F3] rounded-2xl p-3 overflow-auto">
                {this.state.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 px-5 py-2.5 rounded-full bg-[#8067E8] text-white font-bold text-sm"
            >
              Reload Claymarket
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
);
