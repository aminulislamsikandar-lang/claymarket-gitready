import React from 'react';
import { Store, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Market } from '../types';

export const MarketsGrid: React.FC = () => {
  const { filteredMarkets, navigateTo, shops, searchQuery } = useApp();

  // A seller can create a market manually when it does not exist in the
  // backend market collection. Those shops are stored in Firestore, so expose
  // their custom market as a normal Market card instead of hiding the shop's
  // market from the public marketplace.
  const customMarkets = React.useMemo<Market[]>(() => {
    const byMarketId = new Map<string, Market>();
    const normalizedQuery = searchQuery.trim().toLowerCase();

    shops.forEach((shop) => {
      const marketId = String(shop.marketId || '');
      const marketName = String(shop.marketName || '').trim();
      if (!marketId.startsWith('custom_market_') || !marketName) return;

      const location = [shop.district, shop.state].filter(Boolean).join(', ');
      const description = location ? `Local market in ${location}.` : 'Local market created by a local seller.';
      const matchesSearch = !normalizedQuery
        || marketName.toLowerCase().includes(normalizedQuery)
        || location.toLowerCase().includes(normalizedQuery)
        || description.toLowerCase().includes(normalizedQuery);

      if (!matchesSearch || byMarketId.has(marketId)) return;

      byMarketId.set(marketId, {
        id: marketId,
        name: marketName,
        slug: marketName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || marketId,
        bannerImage: shop.banner || shop.avatar || '',
        location,
        description,
        featuredCategories: shop.categoryId ? [shop.categoryId] : [],
        bannerText: marketName.toUpperCase(),
      });
    });

    return Array.from(byMarketId.values());
  }, [shops, searchQuery]);

  const displayMarkets = React.useMemo(() => {
    const byId = new Map<string, Market>();
    [...filteredMarkets, ...customMarkets].forEach((market) => byId.set(market.id, market));
    return Array.from(byId.values());
  }, [filteredMarkets, customMarkets]);

  return (
    <section className="py-4 sm:py-8">
      {/* Header with Title and "View all markets →" link */}
      <div className="flex items-center justify-between mb-2.5 sm:mb-6">
        <h2 className="text-base sm:text-3xl font-extrabold text-[#20243A] tracking-tight">
          All Markets
        </h2>
        <button
          id="view-all-markets-link"
          onClick={() => navigateTo('markets')}
          className="text-xs sm:text-sm font-bold text-[#8067E8] hover:text-[#6E52E2] flex items-center gap-1 sm:gap-1.5 transition-colors group cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid of Market Cards — tight 2-up grid on mobile (Amazon/Flipkart style), unchanged on desktop */}
      {displayMarkets.length === 0 ? (
        <div className="py-10 text-center bg-white/60 rounded-2xl border border-dashed border-gray-200">
          <Store className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-[#737B89] font-medium">No markets available yet. Please check back soon.</p>
        </div>
      ) : (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-6">
        {displayMarkets.map((market: Market) => (
          <div
            key={market.id}
            id={`market-card-${market.id}`}
            onClick={() => navigateTo('market-detail', { market })}
            className="group bg-white rounded-lg sm:rounded-3xl p-1.5 sm:p-3.5 border border-gray-200 sm:border-white/90 shadow-none sm:shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer sm:[box-shadow:0_10px_25px_-4px_rgba(32,36,58,0.05),inset_0_2px_3px_rgba(255,255,255,0.95)]"
          >
            <div>
              {/* Market Image with stylized entrance banner */}
              <div className="relative w-full h-24 sm:h-40 rounded-md sm:rounded-2xl overflow-hidden bg-gray-100 mb-1.5 sm:mb-3.5">
                <img loading="lazy" decoding="async"
                  src={market.bannerImage}
                  alt={market.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Banner overlay with market name badge (desktop only — mobile keeps it simple/flat) */}
                <div className="hidden sm:block absolute top-2.5 left-2.5 right-2.5 py-1 px-3 bg-[#112211]/75 backdrop-blur-sm rounded-lg text-center border border-white/20">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                    {market.bannerText || market.name.toUpperCase()}
                  </span>
                </div>

                {/* Circular Purple Stall Badge on bottom left (desktop only) */}
                <div className="hidden sm:flex absolute -bottom-2 left-3 w-10 h-10 rounded-2xl bg-[#8067E8] text-white items-center justify-center shadow-md ring-3 ring-white">
                  <Store className="w-5 h-5" />
                </div>
              </div>

              {/* Market Name */}
              <div className="px-0.5 sm:pt-2 sm:px-1 mb-1.5 sm:mb-4">
                <h3 className="text-xs sm:text-lg font-bold text-[#20243A] leading-tight line-clamp-2 sm:line-clamp-none group-hover:text-[#8067E8] transition-colors">
                  {market.name}
                </h3>
              </div>
            </div>

            {/* Explore Market Button (Clean pastel lavender pill) */}
            <div className="px-0.5 pb-0.5 sm:px-1 sm:pb-1">
              <button
                id={`explore-market-btn-${market.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('market-detail', { market });
                }}
                className="w-full py-1.5 sm:py-2.5 px-2 sm:px-4 rounded-full bg-[#F1EEFD] hover:bg-[#8067E8] text-[#6C4DE6] hover:text-white font-bold text-[10px] sm:text-sm flex items-center justify-center gap-1 sm:gap-1.5 transition-all shadow-xs group-hover:shadow-md cursor-pointer"
              >
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </section>
  );
};
