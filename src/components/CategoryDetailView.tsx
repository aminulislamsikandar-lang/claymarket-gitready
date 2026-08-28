import React from 'react';
import { ArrowLeft, ChevronRight, Store, ArrowRight, Heart, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategoryClayIcon } from './ClayIllustrations';
import { Shop, Product } from '../types';

export const CategoryDetailView: React.FC = () => {
  const { 
    selectedCategory, selectedMarket, categories, shops, products, 
    navigateTo, goBack, toggleWishlist, isWishlisted, addToCart 
  } = useApp();

  const [activeMarketFilter, setActiveMarketFilter] = React.useState<string | null>(selectedMarket ? selectedMarket.id : null);

  const category = selectedCategory || categories[0];

  // Filter shops that carry this category (and market if filtered)
  const matchingShops = shops.filter(s => {
    const matchesCategory = s.categoryId === category.id || 
      s.categoryName.toLowerCase().includes(category.name.toLowerCase()) ||
      (category.id === 'cat_more');
    const matchesMarket = activeMarketFilter ? s.marketId === activeMarketFilter : true;
    return matchesCategory && matchesMarket;
  });

  // Filter products in this category (and market if filtered, excluding hidden products)
  const categoryProducts = products.filter(p => {
    if (p.status === 'hidden') return false;
    const matchesCategory = p.categoryId === category.id || 
      (p.categoryName && p.categoryName.toLowerCase().includes(category.name.toLowerCase())) ||
      (category.id === 'cat_more');
    const matchesMarket = activeMarketFilter ? p.marketId === activeMarketFilter : true;
    return matchesCategory && matchesMarket;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-[#737B89] flex-wrap">
          {selectedMarket ? (
            <>
              <span 
                className="cursor-pointer hover:text-[#8067E8]" 
                onClick={() => navigateTo('market-detail', { market: selectedMarket })}
              >
                {selectedMarket.name}
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              <span className="cursor-pointer hover:text-[#8067E8]" onClick={() => navigateTo('markets')}>
                Local Markets
              </span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
          <span className="cursor-pointer hover:text-[#8067E8]" onClick={() => navigateTo('categories')}>
            Categories
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#20243A]">{category.name}</span>
        </div>
      </div>

      {/* Category Hero Banner */}
      <div 
        className="rounded-3xl p-6 sm:p-8 border border-white/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6"
        style={{
          backgroundColor: category.iconBg,
          boxShadow: '0 12px 28px -6px rgba(32, 36, 58, 0.05), inset 0 2px 4px rgba(255, 255, 255, 0.9)'
        }}
      >
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 backdrop-blur-xs rounded-full text-xs font-bold text-[#20243A]">
            <span>Category Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#20243A] tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm sm:text-base text-[#404758] font-medium max-w-xl">
            {category.description}
          </p>
        </div>

        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-white/70 backdrop-blur-md flex items-center justify-center shadow-md shrink-0">
          <CategoryClayIcon type={category.iconType} className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>
      </div>

      {/* Market Filter Bar if navigated from or filtering by markets */}
      {selectedMarket && (
        <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-xs">
          <span className="text-xs font-bold text-[#737B89]">Filter Market:</span>
          <button
            onClick={() => setActiveMarketFilter(selectedMarket.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMarketFilter === selectedMarket.id
                ? 'bg-[#8067E8] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📍 {selectedMarket.name}
          </button>
          <button
            onClick={() => setActiveMarketFilter(null)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeMarketFilter === null
                ? 'bg-[#8067E8] text-white shadow-xs'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Markets
          </button>
        </div>
      )}

      {/* Available Shops for this Category */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#20243A]">
              Available Shops for {category.name}
            </h2>
            <p className="text-xs text-[#737B89]">Local shops selling authentic {category.name.toLowerCase()}</p>
          </div>
          <span className="text-xs font-bold bg-[#DDD4FF] text-[#553BB8] px-3 py-1 rounded-full">
            {matchingShops.length} Shops Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matchingShops.map((shop: Shop) => {
            const shopProds = products.filter(p => p.shopId === shop.id).slice(0, 3);
            return (
              <div
                key={shop.id}
                onClick={() => navigateTo('shop-detail', { shop })}
                className="group bg-white rounded-3xl p-5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
                style={{
                  boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
                }}
              >
                <div>
                  {/* Shop Info Header */}
                  <div className="flex items-start gap-3.5 mb-3.5">
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
                        {shop.verified && <CheckCircle2 className="w-4 h-4 text-[#8067E8] shrink-0" />}
                      </div>
                      <p className="text-xs text-[#8067E8] font-semibold mt-0.5">
                        {shop.marketName}
                      </p>
                      <p className="text-xs text-[#737B89] truncate mt-0.5">
                        {shop.address}
                      </p>
                    </div>
                  </div>

                  {/* Product Previews row */}
                  {shopProds.length > 0 && (
                    <div className="mb-4">
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Popular Items
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {shopProds.map(p => (
                          <div key={p.id} className="relative rounded-xl overflow-hidden bg-gray-50 aspect-square">
                            <img loading="lazy" decoding="async" src={p.images[0]} alt={p.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-[#15192C]/75 py-0.5 text-center">
                              <span className="text-[9px] font-bold text-white">₹{p.price}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateTo('shop-detail', { shop });
                  }}
                  className="w-full py-2.5 px-4 rounded-full bg-[#F1EEFD] hover:bg-[#8067E8] text-[#6C4DE6] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>View Shop Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Direct Products in this Category */}
      <section className="space-y-4 pt-4">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#20243A]">
          All {category.name} in Markets
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {categoryProducts.map((product: Product) => (
            <div
              key={product.id}
              onClick={() => navigateTo('product-detail', { product })}
              className="group bg-white rounded-3xl p-3.5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer"
              style={{
                boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
              }}
            >
              <div>
                <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                  <img loading="lazy" decoding="async"
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
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
                  <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-[#15192C]/80 backdrop-blur-xs rounded-lg text-[10px] font-bold text-white">
                    {product.shopName}
                  </div>
                </div>

                <h3 className="font-bold text-sm text-[#20243A] group-hover:text-[#8067E8] transition-colors line-clamp-1 mb-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-xs text-[#737B89] line-clamp-2 mb-2 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

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
