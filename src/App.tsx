import React, { Suspense, lazy } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroMarkets } from './components/HeroMarkets';
import { MarketsGrid } from './components/MarketsGrid';
import { BrowseByShops } from './components/BrowseByShops';
import { BrowseByCategories } from './components/BrowseByCategories';
import { AboutUsSection } from './components/AboutUsSection';
import { Footer } from './components/Footer';
import { MessagingDrawer } from './components/MessagingDrawer';
import { CartDrawer } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { CookieConsent } from './components/CookieConsent';
import { Analytics } from './components/Analytics';
import { SEO } from './components/SEO';

// Everything below is only needed once someone navigates away from the
// homepage, so it is code-split into its own chunk instead of bloating the
// very first page load. This is purely a bundling change — every view still
// renders exactly the same as before, just fetched on demand.
const MarketDetailView = lazy(() => import('./components/MarketDetailView').then(m => ({ default: m.MarketDetailView })));
const CategoryDetailView = lazy(() => import('./components/CategoryDetailView').then(m => ({ default: m.CategoryDetailView })));
const ShopProfileView = lazy(() => import('./components/ShopProfileView').then(m => ({ default: m.ShopProfileView })));
const ProductDetailView = lazy(() => import('./components/ProductDetailView').then(m => ({ default: m.ProductDetailView })));
const OrdersView = lazy(() => import('./components/OrdersView').then(m => ({ default: m.OrdersView })));
const WishlistView = lazy(() => import('./components/WishlistView').then(m => ({ default: m.WishlistView })));
const SellerDashboardView = lazy(() => import('./components/SellerDashboardView').then(m => ({ default: m.SellerDashboardView })));
const AdminDashboardView = lazy(() => import('./components/AdminDashboardView').then(m => ({ default: m.AdminDashboardView })));
const UserProfileView = lazy(() => import('./components/UserProfileView').then(m => ({ default: m.UserProfileView })));
const MarketsListPage = lazy(() => import('./components/Pages').then(m => ({ default: m.MarketsListPage })));
const ShopsListPage = lazy(() => import('./components/Pages').then(m => ({ default: m.ShopsListPage })));
const CategoriesListPage = lazy(() => import('./components/Pages').then(m => ({ default: m.CategoriesListPage })));
const AboutPage = lazy(() => import('./components/Pages').then(m => ({ default: m.AboutPage })));
const PrivacyPolicyPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.PrivacyPolicyPage })));
const TermsPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.TermsPage })));
const FAQPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.FAQPage })));
const NotFoundPage = lazy(() => import('./components/LegalPages').then(m => ({ default: m.NotFoundPage })));

const ViewLoadingFallback: React.FC = () => (
  <div className="w-full py-24 flex items-center justify-center" role="status" aria-live="polite">
    <div className="w-10 h-10 rounded-full border-4 border-[#DDD4FF] border-t-[#8067E8] animate-spin" />
    <span className="sr-only">Loading…</span>
  </div>
);

const AppContent: React.FC = () => {
  const {
    currentView,
    toasts,
    selectedMarket,
    selectedShop,
    selectedProduct,
    selectedCategory,
    markets,
    shops,
    products,
  } = useApp();

  const renderCurrentView = () => {
    switch (currentView) {
      case 'market-detail':
        // On a hard refresh, remote marketplace data loads after the first
        // render. Do not briefly show the 404 page while selectedMarket is
        // still being resolved from the URL.
        return selectedMarket ? <MarketDetailView /> : markets.length === 0 ? null : <NotFoundPage />;
      case 'category-detail':
        // Categories are local/static, so selectedCategory is resolved by the
        // route-sync effect immediately after mount. Avoid a one-frame 404.
        return selectedCategory ? <CategoryDetailView /> : null;
      case 'shop-detail':
        // Shop data is remote. During the initial refresh selectedShop is
        // temporarily null, so wait for the collection before deciding that
        // the URL is genuinely invalid.
        return selectedShop ? <ShopProfileView /> : shops.length === 0 ? null : <NotFoundPage />;
      case 'product-detail':
        return selectedProduct ? <ProductDetailView /> : products.length === 0 ? null : <NotFoundPage />;
      case 'shops':
        return <ShopsListPage />;
      case 'categories':
        return <CategoriesListPage />;
      case 'about':
        return <AboutPage />;
      case 'orders':
        return <OrdersView />;
      case 'wishlist':
        return <WishlistView />;
      case 'seller-dashboard':
        return <SellerDashboardView />;
      case 'admin-dashboard':
        return <AdminDashboardView />;
      case 'profile':
      case 'saved-addresses':
      case 'settings':
      case 'notifications':
        return <UserProfileView />;
      case 'help':
        return <AboutPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      case 'faq':
        return <FAQPage />;
      case 'not-found':
        return <NotFoundPage />;
      case 'markets':
      default:
        return (
          <>
            {/* 1. Hero Section (Image 1 top) */}
            <HeroMarkets />

            {/* 2. All Markets Grid (Image 1 middle) */}
            <MarketsGrid />

            {/* 3. Browse by Shops (Placed BETWEEN All Markets and Browse by Categories) */}
            <BrowseByShops />

            {/* 4. Browse by Categories (Image 1) */}
            <BrowseByCategories />

            {/* 5. About Us Banner Section (Image 1) */}
            <AboutUsSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F5F3] text-[#20243A] flex flex-col font-sans selection:bg-[#DDD4FF] selection:text-[#553BB8]">
      
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-[#20243A] focus:px-4 focus:py-2 focus:text-white focus:font-bold">Skip to main content</a>
      {/* Universal Header */}
      <SEO view={currentView} />
      <Analytics />
      <Header />

      {/* Main Container */}
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Suspense fallback={<ViewLoadingFallback />}>
          {renderCurrentView()}
        </Suspense>
      </main>

      {/* Interactive Drawers & Overlays */}
      <MessagingDrawer />
      <CartDrawer />
      <AuthModal />

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map(t => (
            <div 
              key={t.id}
              className="pointer-events-auto px-5 py-3 rounded-2xl bg-[#15192C] text-white text-xs sm:text-sm font-semibold shadow-2xl border border-white/20 animate-in slide-in-from-bottom-5 duration-200 flex items-center gap-3"
              style={{
                boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
              }}
            >
              <span className={`w-2 h-2 rounded-full animate-pulse ${
                t.type === 'info' ? 'bg-[#38BDF8]' : t.type === 'warning' ? 'bg-[#FBBF24]' : t.type === 'error' ? 'bg-[#EF4444]' : 'bg-[#8067E8]'
              }`} />
              <span>{t.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Universal Footer */}
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
