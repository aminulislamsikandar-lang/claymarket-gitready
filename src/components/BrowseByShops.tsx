import React from 'react';
import { ArrowRight, Footprints, Shirt, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shop } from '../types';

export const BrowseByShops: React.FC = () => {
  const { filteredShops, navigateTo } = useApp();

  // A seller must have one public shop. Older data may contain duplicate
  // shop documents for the same owner, so collapse those duplicates here.
  const uniqueShops = Array.from(
    filteredShops.reduce((map, shop) => {
      const key = shop.ownerId?.trim() ? `owner:${shop.ownerId}` : `shop:${shop.id}`;
      const existing = map.get(key);
      if (!existing || (shop.id.startsWith('shop_') && !existing.id.startsWith('shop_'))) {
        map.set(key, shop);
      }
      return map;
    }, new Map<string, Shop>()).values(),
  );

  const getShopIcon = (shop: Shop) => {
    if (shop.categoryId === 'cat_slippers') {
      return <Footprints className="w-4 h-4" />;
    }
    if (shop.categoryId === 'cat_clothes') {
      return <Shirt className="w-4 h-4" />;
    }
    if (shop.categoryId === 'cat_electronics') {
      return <Smartphone className="w-4 h-4" />;
    }
    return <Footprints className="w-4 h-4" />;
  };

  return (
    <section className="py-4 sm:py-8">
      {/* Header with Title and "View all shops →" link */}
      <div className="flex items-center justify-between mb-2.5 sm:mb-6">
        <h2 className="text-base sm:text-3xl font-extrabold text-[#20243A] tracking-tight">
          Browse by Shops
        </h2>
        <button
          id="view-all-shops-link"
          onClick={() => navigateTo('shops')}
          className="text-xs sm:text-sm font-bold text-[#8067E8] hover:text-[#6E52E2] flex items-center gap-1 sm:gap-1.5 transition-colors group cursor-pointer"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid of Compact Shop Cards — dense 3-up grid on mobile (Amazon/Flipkart style), unchanged on desktop */}
      {uniqueShops.length === 0 ? (
        <div className="py-10 text-center bg-white/60 rounded-2xl border border-dashed border-gray-200">
          <p className="text-sm text-[#737B89] font-medium">No shops available yet. Please check back soon.</p>
        </div>
      ) : (
      <div className="grid grid-cols-3 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
        {uniqueShops.slice(0, 5).map((shop: Shop) => (
          <div
            key={shop.id}
            id={`shop-card-${shop.id}`}
            onClick={() => navigateTo('shop-detail', { shop })}
            className="group bg-white rounded-lg sm:rounded-3xl p-1.5 sm:p-3 border border-gray-200 sm:border-white/90 shadow-none sm:shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer sm:[box-shadow:0_8px_20px_-4px_rgba(32,36,58,0.04),inset_0_2px_3px_rgba(255,255,255,0.95)]"
          >
            <div>
              {/* Shop Thumbnail and Icon Badge Container */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3 mb-1.5 sm:mb-2.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100 relative">
                  <img loading="lazy" decoding="async"
                    src={shop.avatar}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {/* Category badge overlaps thumbnail on mobile to save space */}
                  <div 
                    className="sm:hidden absolute -bottom-1 -right-1 w-5 h-5 rounded-md flex items-center justify-center shadow-xs ring-1 ring-white"
                    style={{ backgroundColor: shop.iconBg || '#DDD4FF', color: '#553BB8' }}
                  >
                    {getShopIcon(shop)}
                  </div>
                </div>

                {/* Circular Category Badge Icon (desktop only — merged into thumbnail on mobile) */}
                <div 
                  className="hidden sm:flex w-9 h-9 rounded-xl items-center justify-center shrink-0 shadow-xs"
                  style={{
                    backgroundColor: shop.iconBg || '#DDD4FF',
                    color: '#553BB8'
                  }}
                >
                  {getShopIcon(shop)}
                </div>
              </div>

              {/* Shop Name */}
              <h3 className="text-[11px] sm:text-base font-bold text-[#20243A] text-center sm:text-left leading-snug line-clamp-2 min-h-[2rem] sm:min-h-[2.75rem] group-hover:text-[#8067E8] transition-colors">
                {shop.name}
              </h3>
            </div>

            {/* View Shop Button */}
            <div className="mt-1.5 sm:mt-3">
              <button
                id={`view-shop-btn-${shop.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('shop-detail', { shop });
                }}
                className="w-full py-1 sm:py-2 px-1 sm:px-3 rounded-full bg-[#F1EEFD] hover:bg-[#8067E8] text-[#6C4DE6] hover:text-white font-bold text-[9px] sm:text-xs flex items-center justify-center gap-0.5 sm:gap-1 transition-all cursor-pointer"
              >
                <span>View</span>
                <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </section>
  );
};
