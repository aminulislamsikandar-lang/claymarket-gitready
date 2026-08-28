import React, { useState } from 'react';
import { 
  ArrowLeft, Store, ArrowRight, ShoppingBag, ShieldCheck, 
  MapPin, CheckCircle2, MessageSquare, Heart 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryClayIcon } from './ClayIllustrations';
import { AboutUsSection } from './AboutUsSection';

/* ALL MARKETS PAGE */
export const MarketsListPage: React.FC = () => {
  const { filteredMarkets, navigateTo, goBack } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
          Explore All Local Markets
        </h1>
      </div>

      <p className="text-sm text-[#737B89] max-w-2xl">
        Discover verified traditional markets and haats in your district. Browse shops, check available stall products, and communicate directly with local vendors.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
        {filteredMarkets.map((market) => (
          <div
            key={market.id}
            onClick={() => navigateTo('market-detail', { market })}
            className="group bg-white rounded-3xl p-3.5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            style={{
              boxShadow: '0 10px 25px -4px rgba(32, 36, 58, 0.05), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
            }}
          >
            <div>
              <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3.5">
                <img loading="lazy" decoding="async"
                  src={market.bannerImage}
                  alt={market.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2.5 left-2.5 right-2.5 py-1 px-3 bg-[#112211]/75 backdrop-blur-sm rounded-lg text-center border border-white/20">
                  <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">
                    {market.bannerText || market.name.toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-2 left-3 w-10 h-10 rounded-2xl bg-[#8067E8] text-white flex items-center justify-center shadow-md ring-3 ring-white">
                  <Store className="w-5 h-5" />
                </div>
              </div>

              <div className="pt-2 px-1 mb-4">
                <h3 className="text-lg font-bold text-[#20243A] leading-tight group-hover:text-[#8067E8] transition-colors">
                  {market.name}
                </h3>
                <p className="text-xs text-[#737B89] mt-1">{market.location}</p>
              </div>
            </div>

            <div className="px-1 pb-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('market-detail', { market });
                }}
                className="w-full py-2.5 px-4 rounded-full bg-[#F1EEFD] hover:bg-[#8067E8] text-[#6C4DE6] hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <span>Explore Market</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ALL SHOPS PAGE */
export const ShopsListPage: React.FC = () => {
  const { filteredShops, navigateTo, goBack, startChatWithShop } = useApp();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const displayedShops = categoryFilter === 'all'
    ? filteredShops
    : filteredShops.filter(s => s.categoryId === categoryFilter);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
          Explore Local Shops
        </h1>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {['all', 'cat_slippers', 'cat_clothes', 'cat_electronics', 'cat_home', 'cat_grocery'].map(catId => {
          const label = catId === 'all' ? 'All Shops' : 
                        catId === 'cat_slippers' ? 'Footwear & Slippers' :
                        catId === 'cat_clothes' ? 'Clothing & Fashion' :
                        catId === 'cat_electronics' ? 'Electronics' :
                        catId === 'cat_home' ? 'Home & Living' : 'Grocery';
          return (
            <button
              key={catId}
              onClick={() => setCategoryFilter(catId)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === catId
                  ? 'bg-[#8067E8] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {displayedShops.map((shop) => (
          <div
            key={shop.id}
            onClick={() => navigateTo('shop-detail', { shop })}
            className="group bg-white rounded-3xl p-5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
            style={{
              boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
            }}
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3.5">
                <img loading="lazy" decoding="async"
                  src={shop.avatar}
                  alt={shop.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-bold text-base text-[#20243A] group-hover:text-[#8067E8] transition-colors truncate">
                      {shop.name}
                    </h3>
                    {shop.verified && <CheckCircle2 className="w-4 h-4 text-[#8067E8] shrink-0" />}
                  </div>
                  <p className="text-xs text-[#8067E8] font-semibold mt-0.5">
                    📍 {shop.marketName} • {shop.categoryName}
                  </p>
                  <p className="text-xs text-[#737B89] truncate mt-0.5">
                    {shop.address}
                  </p>
                  {(shop.district || shop.state) && (
                    <p className="text-xs text-[#737B89] truncate mt-0.5">
                      {shop.district}{shop.district && shop.state ? ', ' : ''}{shop.state}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-xs text-[#505767] line-clamp-2 mb-4 leading-relaxed">
                {shop.about}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startChatWithShop(shop, undefined, `Hello! Inquiring regarding products from ${shop.name}`);
                }}
                className="flex-1 py-2 px-3 rounded-full bg-[#FAF8FE] hover:bg-[#F1EDFD] text-[#8067E8] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Message</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigateTo('shop-detail', { shop });
                }}
                className="flex-1 py-2 px-3 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors shadow-xs"
              >
                <span>View Shop</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ALL CATEGORIES PAGE */
export const CategoriesListPage: React.FC = () => {
  const { categories, navigateTo, goBack } = useApp();

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
          Explore Marketplace Categories
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => navigateTo('category-detail', { category: cat })}
            className="group bg-white rounded-3xl p-6 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex items-center gap-5 cursor-pointer"
            style={{
              boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
            }}
          >
            <div 
              className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform"
              style={{ backgroundColor: cat.iconBg }}
            >
              <CategoryClayIcon type={cat.iconType} className="w-14 h-14" />
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#20243A] group-hover:text-[#8067E8] transition-colors leading-tight">
                {cat.name}
              </h3>
              <p className="text-xs text-[#737B89] mt-1 line-clamp-2">
                {cat.description}
              </p>
              <span className="text-xs font-bold text-[#8067E8] flex items-center gap-1 mt-2">
                <span>Browse Products</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ABOUT US PAGE */
export const AboutPage: React.FC = () => {
  const { goBack } = useApp();

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-16">
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </button>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
          About Claymarket
        </h1>
      </div>

      <AboutUsSection />

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-white/90 shadow-sm space-y-6">
        <h2 className="text-2xl font-extrabold text-[#20243A]">
          Our Vision for Local Digital Commerce
        </h2>
        <p className="text-base text-[#505767] leading-relaxed">
          Traditional neighborhood markets, weekly haats, and bazaar alleyways are the heartbeat of local culture and livelihoods. Claymarket digitizes these physical hubs so that buyers can explore stalls from their phone while preserving direct personal relationships with trusted merchants.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-[#FAF8FE] border border-[#DDD4FF] space-y-2">
            <h4 className="font-bold text-base text-[#20243A]">Direct Seller Connection</h4>
            <p className="text-xs text-[#737B89]">Talk with Aminul, Rahman and local craftsmen before placing your order or visiting the stall.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8FE] border border-[#DDD4FF] space-y-2">
            <h4 className="font-bold text-base text-[#20243A]">Zero Intermediary Exploitation</h4>
            <p className="text-xs text-[#737B89]">Local vendors keep 100% of their earnings with transparent local pricing.</p>
          </div>

          <div className="p-5 rounded-2xl bg-[#FAF8FE] border border-[#DDD4FF] space-y-2">
            <h4 className="font-bold text-base text-[#20243A]">Authentic Market Discovery</h4>
            <p className="text-xs text-[#737B89]">Walk digitally through Kachumara, Nagarbera, Rangapara and Barpeta markets anytime.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
