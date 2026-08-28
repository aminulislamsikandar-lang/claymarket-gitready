import React from 'react';
import { ArrowRight, Footprints, Shirt, Smartphone } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Shop } from '../types';

export const BrowseByShops: React.FC = () => {
  const { filteredShops, navigateTo } = useApp();

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
    <section className="py-8">
      {/* Header with Title and "View all shops →" link */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20243A] tracking-tight">
          Browse by Shops
        </h2>
        <button
          id="view-all-shops-link"
          onClick={() => navigateTo('shops')}
          className="text-sm font-bold text-[#8067E8] hover:text-[#6E52E2] flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          <span>View all shops</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid of Compact Shop Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {filteredShops.slice(0, 5).map((shop: Shop) => (
          <div
            key={shop.id}
            id={`shop-card-${shop.id}`}
            onClick={() => navigateTo('shop-detail', { shop })}
            className="group bg-white rounded-3xl p-3 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            style={{
              boxShadow: '0 8px 20px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
            }}
          >
            <div>
              {/* Shop Thumbnail and Icon Badge Container */}
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
                  <img loading="lazy" decoding="async"
                    src={shop.avatar}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Circular Category Badge Icon */}
                <div 
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                  style={{
                    backgroundColor: shop.iconBg || '#DDD4FF',
                    color: '#553BB8'
                  }}
                >
                  {getShopIcon(shop)}
                </div>
              </div>

              {/* Shop Name */}
              <h3 className="text-sm sm:text-base font-bold text-[#20243A] leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#8067E8] transition-colors">
                {shop.name}
              </h3>
            </div>

            {/* View Shop Button */}
            <div className="mt-3">
              <button
                id={`view-shop-btn-${shop.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('shop-detail', { shop });
                }}
                className="w-full py-2 px-3 rounded-full bg-[#F1EEFD] hover:bg-[#8067E8] text-[#6C4DE6] hover:text-white font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <span>View Shop</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
