import React from 'react';
import { Store, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Market } from '../types';

export const MarketsGrid: React.FC = () => {
  const { filteredMarkets, navigateTo } = useApp();

  return (
    <section className="py-8">
      {/* Header with Title and "View all markets →" link */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#20243A] tracking-tight">
          All Markets
        </h2>
        <button
          id="view-all-markets-link"
          onClick={() => navigateTo('markets')}
          className="text-sm font-bold text-[#8067E8] hover:text-[#6E52E2] flex items-center gap-1.5 transition-colors group cursor-pointer"
        >
          <span>View all markets</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Grid of 4 Market Cards matching Image 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {filteredMarkets.map((market: Market) => (
          <div
            key={market.id}
            id={`market-card-${market.id}`}
            onClick={() => navigateTo('market-detail', { market })}
            className="group bg-white rounded-3xl p-3 sm:p-3.5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            style={{
              boxShadow: '0 10px 25px -4px rgba(32, 36, 58, 0.05), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
            }}
          >
            <div>
              {/* Market Image with stylized entrance banner */}
              <div className="relative w-full h-44 sm:h-40 rounded-2xl overflow-hidden bg-gray-100 mb-3.5">
                <img loading="lazy" decoding="async"
                  src={market.bannerImage}
                  alt={market.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                
                {/* Banner overlay with market name badge (matching design reference) */}
                <div className="absolute top-2.5 left-2.5 right-2.5 py-1 px-3 bg-[#112211]/75 backdrop-blur-sm rounded-lg text-center border border-white/20">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                    {market.bannerText || market.name.toUpperCase()}
                  </span>
                </div>

                {/* Circular Purple Stall Badge on bottom left */}
                <div className="absolute -bottom-2 left-3 w-10 h-10 rounded-2xl bg-[#8067E8] text-white flex items-center justify-center shadow-md ring-3 ring-white">
                  <Store className="w-5 h-5" />
                </div>
              </div>

              {/* Market Name */}
              <div className="pt-2 px-1 mb-4">
                <h3 className="text-lg font-bold text-[#20243A] leading-tight group-hover:text-[#8067E8] transition-colors">
                  {market.name}
                </h3>
              </div>
            </div>

            {/* Explore Market Button (Clean pastel lavender pill) */}
            <div className="px-1 pb-1">
              <button
                id={`explore-market-btn-${market.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('market-detail', { market });
                }}
                className="w-full py-2.5 px-4 rounded-full bg-[#F1EEFD] hover:bg-[#8067E8] text-[#6C4DE6] hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs group-hover:shadow-md cursor-pointer"
              >
                <span>Explore Market</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
