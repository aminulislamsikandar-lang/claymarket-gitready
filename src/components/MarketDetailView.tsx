import React, { useState } from 'react';
import { 
  ArrowLeft, Store, MapPin, Calendar, CheckCircle2, 
  ArrowRight, Heart, ShoppingBag, MessageSquare, ChevronRight 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryClayIcon } from './ClayIllustrations';
import { Market, Shop, Product, Category } from '../types';
import { EMPTY_MARKET_FALLBACK } from '../utils/fallbacks';

export const MarketDetailView: React.FC = () => {
  const { 
    selectedMarket, markets, shops, products, categories, 
    navigateTo, goBack, toggleWishlist, isWishlisted, addToCart,
    startChatWithShop 
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const market = selectedMarket || markets[0] || EMPTY_MARKET_FALLBACK;

  // Filter shops and products in this market
  const marketShops = shops.filter(s => s.marketId === market.id);
  const marketProducts = products.filter(p => p.marketId === market.id && p.status !== 'hidden');

  const filteredMarketProducts = activeCategoryFilter === 'all' 
    ? marketProducts 
    : marketProducts.filter(p => p.categoryId === activeCategoryFilter);

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Markets</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-[#737B89]">
          <span className="cursor-pointer hover:text-[#8067E8]" onClick={() => navigateTo('markets')}>Markets</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#20243A]">{market.name}</span>
        </div>
      </div>

      {/* Market Hero Banner Card */}
      <div 
        className="relative rounded-3xl overflow-hidden bg-white border border-white/90 shadow-sm"
        style={{
          boxShadow: '0 16px 36px -10px rgba(32, 36, 58, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
        }}
      >
        <div className="relative h-64 sm:h-80 w-full bg-gray-900">
          <img loading="lazy" decoding="async" 
            src={market.bannerImage} 
            alt={market.name} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15192C]/90 via-[#15192C]/40 to-transparent" />
          
          {/* Banner Title & Info */}
          <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white border border-white/30 mb-1">
              <Store className="w-3.5 h-3.5 text-[#FFE9AD]" />
              <span>Local Market Hub</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight">
              {market.name}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-200 pt-1">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#DDD4FF]" />
                {market.location}
              </span>
              {market.established && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#CBE4FF]" />
                  Est. {market.established}
                </span>
              )}
              <span className="flex items-center gap-1.5 font-bold text-[#CBEFD9]">
                <CheckCircle2 className="w-4 h-4" />
                {marketShops.length} Verified Local Shops
              </span>
            </div>
          </div>
        </div>

        {/* Market Description */}
        <div className="p-6 sm:p-8 bg-white">
          <p className="text-base text-[#505767] leading-relaxed max-w-4xl">
            {market.description}
          </p>
        </div>
      </div>

      {/* 1. Browse Categories in this Market */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#20243A]">
            Browse Categories in {market.name}
          </h2>
          {activeCategoryFilter !== 'all' && (
            <button
              onClick={() => setActiveCategoryFilter('all')}
              className="text-xs font-bold text-[#8067E8] underline cursor-pointer"
            >
              Reset Filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat: Category) => {
            return (
              <div
                key={cat.id}
                onClick={() => {
                  navigateTo('category-detail', { category: cat, market });
                }}
                className="group p-3.5 rounded-2xl bg-white hover:bg-[#FAF8FE] border border-white/90 shadow-xs hover:shadow-md transition-all cursor-pointer text-center flex flex-col items-center justify-center"
              >
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 group-hover:scale-105 transition-transform"
                  style={{ backgroundColor: cat.iconBg }}
                >
                  <CategoryClayIcon type={cat.iconType} className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-[#20243A] group-hover:text-[#8067E8] transition-colors leading-tight">
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Popular & Available Shops in this Market */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#20243A]">
              Available Shops in {market.name}
            </h2>
            <p className="text-xs text-[#737B89]">Visit the local shops operating in this market</p>
          </div>
          <span className="text-xs font-bold bg-[#DDD4FF] text-[#553BB8] px-3 py-1 rounded-full">
            {marketShops.length} Shops Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {marketShops.map((shop: Shop) => (
            <div
              key={shop.id}
              onClick={() => navigateTo('shop-detail', { shop })}
              className="group bg-white rounded-3xl p-5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              style={{
                boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
              }}
            >
              <div>
                <div className="flex items-start gap-3.5 mb-3">
                  <img loading="lazy" decoding="async"
                    src={shop.avatar}
                    alt={shop.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-base text-[#20243A] group-hover:text-[#8067E8] transition-colors truncate">
                        {shop.name}
                      </h3>
                      {shop.verified && (
                        <CheckCircle2 className="w-4 h-4 text-[#8067E8] shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-[#8067E8] font-semibold mt-0.5">
                      {shop.categoryName}
                    </p>
                    <p className="text-xs text-[#737B89] truncate mt-0.5">
                      {shop.address}
                    </p>
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
                    startChatWithShop(shop, undefined, `Hello! Inquiring about products at ${shop.name}`);
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
      </section>

      {/* 3. Products available in this Market */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#20243A]">
            Products from {market.name}
          </h2>
          <span className="text-xs text-[#737B89]">
            Showing {filteredMarketProducts.length} items
          </span>
        </div>

        {/* Quick Category Filter Pills for Products */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveCategoryFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeCategoryFilter === 'all'
                ? 'bg-[#8067E8] text-white shadow-xs'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            All Items
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryFilter(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeCategoryFilter === cat.id
                  ? 'bg-[#8067E8] text-white shadow-xs'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredMarketProducts.map((product: Product) => (
            <div
              key={product.id}
              onClick={() => navigateTo('product-detail', { product })}
              className="group bg-white rounded-3xl p-3.5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              style={{
                boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
              }}
            >
              <div>
                {/* Product Image */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                  <img loading="lazy" decoding="async"
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Wishlist Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(product.id);
                    }}
                    className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${
                      isWishlisted(product.id)
                        ? 'bg-[#FF6B8B] text-white'
                        : 'bg-white/80 text-gray-700 hover:bg-white'
                    }`}
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>

                  {/* Shop Name Tag */}
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-[#15192C]/80 backdrop-blur-xs rounded-lg text-[10px] font-bold text-white">
                    {product.shopName}
                  </div>
                </div>

                {/* Product Info */}
                <h3 className="font-bold text-sm text-[#20243A] group-hover:text-[#8067E8] transition-colors line-clamp-1 mb-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-[#737B89] line-clamp-2 mb-2 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price and Add to Cart */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <div>
                  {product.price !== undefined && product.price !== null ? (
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-extrabold text-[#20243A]">₹{product.price}</span>
                      {product.originalPrice !== undefined && product.originalPrice !== null && product.originalPrice > product.price && (
                        <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-[#8067E8]">Contact for Price</span>
                  )}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product);
                  }}
                  className="p-2 rounded-xl bg-[#F1EDFD] hover:bg-[#8067E8] text-[#8067E8] hover:text-white transition-colors cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
