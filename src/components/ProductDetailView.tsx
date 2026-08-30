import React, { useState } from 'react';
import { 
  ArrowLeft, ChevronRight, Heart, ShoppingBag, MessageSquare, 
  Store, CheckCircle2, ShieldCheck, Truck, Star, 
  Minus, Plus, Phone, UserCheck, ArrowRight, Share2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { shareOrCopy } from '../utils/share';
import { EMPTY_SHOP_FALLBACK, EMPTY_MARKET_FALLBACK } from '../utils/fallbacks';

export const ProductDetailView: React.FC = () => {
  const { 
    selectedProduct, products, shops, markets, categories, navigateTo, goBack, 
    toggleWishlist, isWishlisted, addToCart, startChatWithShop,
    showToast 
  } = useApp();

  const product = selectedProduct || products[0];
  const shop = shops.find(s => s.id === product.shopId) || shops[0] || EMPTY_SHOP_FALLBACK;
  const market = markets.find(m => m.id === product.marketId || m.id === shop.marketId) || markets[0] || EMPTY_MARKET_FALLBACK;
  const category = categories.find(c => c.id === product.categoryId || c.id === shop.categoryId) || categories[0];

  const defaultColorName = product.colors?.[0]?.name || 'Default';

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] || '8');
  const [selectedColor, setSelectedColor] = useState<string>(defaultColorName);
  const [quantity, setQuantity] = useState(1);

  const stockKnown = product.stockCount !== undefined && product.stockCount !== null;
  const stockAvailable = stockKnown ? product.stockCount! : 999;
  const hasPrice = product.price !== undefined && product.price !== null && !isNaN(product.price);
  const hasOriginalPrice = product.originalPrice !== undefined && product.originalPrice !== null && !isNaN(product.originalPrice) && product.originalPrice > 0;
  const discountPercent = (hasPrice && hasOriginalPrice && product.originalPrice! > product.price!)
    ? Math.round(((product.originalPrice! - product.price!) / product.originalPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    const added = addToCart(product, quantity, selectedSize, selectedColor);
    if (added) showToast(`Added ${quantity}x "${product.name}" to cart!`, 'success');
  };

  const handleShare = async () => {
    const result = await shareOrCopy({
      title: `${product.name} on Claymarket`,
      text: `Check out ${product.name} at ${shop.name} on Claymarket!`,
    });
    showToast(result === 'copied' ? 'Product link copied to clipboard!' : 'Share sheet opened.', 'info');
  };

  const handleAskSeller = () => {
    startChatWithShop(
      shop,
      product,
      `Hello ${shop.ownerName}! Is the "${product.name}" available in size ${selectedSize} (${selectedColor}) for pickup or delivery?`
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
      {/* Breadcrumbs: Market -> Category -> Shop -> Product */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-[#737B89] flex-wrap">
          <span 
            className="cursor-pointer hover:text-[#8067E8] font-medium" 
            onClick={() => navigateTo('market-detail', { market })}
          >
            {product.marketName}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span 
            className="cursor-pointer hover:text-[#8067E8] font-medium" 
            onClick={() => navigateTo('category-detail', { category, market })}
          >
            {product.categoryName || category.name}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span 
            className="cursor-pointer hover:text-[#8067E8] font-medium" 
            onClick={() => navigateTo('shop-detail', { shop })}
          >
            {product.shopName}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#20243A] truncate max-w-[160px] sm:max-w-none">
            {product.name}
          </span>
        </div>
        <button onClick={handleShare} aria-label="Share product" className="ml-auto p-2.5 rounded-full bg-white hover:bg-gray-50 border border-gray-200/70 shadow-xs transition-all">
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Main Product Card */}
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 border border-white/90 shadow-sm"
        style={{
          boxShadow: '0 16px 36px -10px rgba(32, 36, 58, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.95)'
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* LEFT: Image Gallery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-gray-100 border border-gray-100 shadow-inner">
              <img 
                src={product.images[selectedImageIndex] || product.images[0]} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              
              {/* Discount Badge */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 px-3 py-1 bg-[#8067E8] text-white rounded-full text-xs font-bold shadow-md">
                  {discountPercent}% OFF
                </div>
              )}

              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all shadow-md ${
                  isWishlisted(product.id)
                    ? 'bg-[#FF6B8B] text-white'
                    : 'bg-white/80 text-gray-700 hover:bg-white'
                }`}
              >
                <Heart className="w-5 h-5 fill-current" />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1.5 scrollbar-none">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImageIndex(i)}
                    className={`w-18 h-18 rounded-2xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      selectedImageIndex === i 
                        ? 'border-[#8067E8] ring-2 ring-[#8067E8]/20 scale-105' 
                        : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img loading="lazy" decoding="async" src={img} alt={`${product.name} thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: Product Details & Controls */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Header / Title */}
            <div>
              {/* Shop Badge */}
              <div 
                onClick={() => navigateTo('shop-detail', { shop })}
                className="inline-flex items-center gap-2 px-3 py-1 bg-[#F1EDFD] hover:bg-[#DDD4FF] text-[#6C4DE6] rounded-full text-xs font-bold cursor-pointer transition-colors mb-2.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{product.shopName}</span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600">{product.marketName}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A] leading-tight">
                {product.name}
              </h1>

              {/* Rating & Stock */}
              <div className="flex items-center gap-4 text-xs sm:text-sm mt-2">
                <div className="flex items-center gap-1 font-bold text-[#FAB005]">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="text-[#20243A]">{product.rating}</span>
                  <span className="text-gray-400">({product.reviewsCount} reviews)</span>
                </div>
                <span>•</span>
                <span className={`font-bold flex items-center gap-1 ${product.stockCount === 0 ? 'text-red-600' : 'text-[#176F43]'}`}>
                  <CheckCircle2 className="w-4 h-4" />
                  {product.stockCount === 0 ? 'Out of stock' : stockKnown ? `In Stock (${stockAvailable} units available)` : 'Stock information not provided'}
                </span>
              </div>
            </div>

            {/* Price Row */}
            <div className="p-4 rounded-2xl bg-[#FAF8FE] border border-[#ECE5FD] flex items-center justify-between gap-3">
              {hasPrice ? (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-[#20243A]">₹{product.price}</span>
                  {hasOriginalPrice && product.originalPrice! > product.price! && (
                    <span className="text-base text-gray-400 line-through">₹{product.originalPrice}</span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-bold text-[#8067E8] bg-[#DDD4FF] px-2.5 py-1 rounded-full">
                      Save ₹{product.originalPrice! - product.price!}
                    </span>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#8067E8]">Contact seller for price</span>
                  <span className="text-xs text-gray-400 font-medium">(Price on request)</span>
                </div>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-[#505767] leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#20243A]">
                  <span>Select Size:</span>
                  <span className="text-[#8067E8]">Size: {selectedSize}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-11 h-11 px-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                        selectedSize === size
                          ? 'bg-[#8067E8] text-white shadow-md'
                          : 'bg-gray-100 hover:bg-gray-200 text-[#20243A]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#20243A]">
                  <span>Available Colors:</span>
                  <span className="text-[#8067E8]">{selectedColor}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((c, idx) => {
                    const cName = typeof c === 'object' ? c.name : String(c);
                    const cHex = typeof c === 'object' ? c.hex : '#8067E8';
                    const isSelected = selectedColor === cName;

                    return (
                      <button
                        key={idx}
                        onClick={() => setSelectedColor(cName)}
                        className={`px-3.5 py-2 rounded-2xl font-semibold text-xs transition-all cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? 'bg-[#DDD4FF] text-[#553BB8] ring-2 ring-[#8067E8]'
                            : 'bg-gray-100 hover:bg-gray-200 text-[#20243A]'
                        }`}
                      >
                        <span 
                          className="w-3.5 h-3.5 rounded-full border border-black/10 shadow-xs" 
                          style={{ backgroundColor: cHex }}
                        />
                        <span>{cName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Add to Cart */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-full p-1 border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-xs cursor-pointer"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-extrabold text-sm text-[#20243A]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                    className="w-9 h-9 rounded-full bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button */}
                {hasPrice ? (
                  <button
                    id="product-add-to-cart-btn"
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    style={{
                      boxShadow: '0 6px 18px rgba(128, 103, 232, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart • ₹{product.price! * quantity}</span>
                  </button>
                ) : (
                  <button
                    id="product-inquire-btn"
                    onClick={handleAskSeller}
                    className="flex-1 py-3.5 px-6 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                    style={{
                      boxShadow: '0 6px 18px rgba(128, 103, 232, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire for Price</span>
                  </button>
                )}
              </div>

              {/* Ask Seller Button */}
              <button
                id="product-ask-seller-btn"
                onClick={handleAskSeller}
                className="w-full py-3 px-4 rounded-full bg-[#FAF8FE] hover:bg-[#F1EDFD] border border-[#DDD4FF] text-[#6C4DE6] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Ask Seller about this Item</span>
              </button>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs text-[#737B89]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#8067E8]" />
                <span>100% Genuine Local Product</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#40C057]" />
                <span>Direct Stall Pickup Available</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* SELLER & STALL INFORMATION SECTION (Completing Market -> Category -> Shop -> Product -> Seller hierarchy) */}
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 border border-white/90 shadow-sm"
        style={{
          boxShadow: '0 10px 28px -4px rgba(32, 36, 58, 0.05), inset 0 2px 3px rgba(255, 255, 255, 0.95)'
        }}
      >
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-lg text-[#20243A]">Seller & Stall Details</h3>
            <p className="text-xs text-[#737B89]">Direct verified craftsman and vendor information</p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#CBEFD9] text-[#176F43] rounded-full text-xs font-bold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Verified Local Merchant</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Shop & Seller Identity */}
          <div className="flex items-center gap-4">
            <img 
              src={shop.avatar} 
              alt={shop.name} 
              className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#DDD4FF] shrink-0"
            />
            <div>
              <h4 className="font-bold text-base text-[#20243A]">{shop.name}</h4>
              <p className="text-xs text-[#8067E8] font-bold">Proprietor: {shop.ownerName}</p>
              <p className="text-xs text-[#737B89] mt-0.5">{shop.followersCount} stall followers</p>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-1 text-xs text-[#505767]">
            <p className="font-semibold text-[#20243A]">📍 {shop.address}</p>
            <p className="text-[#737B89]">Market: {product.marketName}</p>
            <p className="flex items-center gap-1 text-[#8067E8] font-semibold mt-1">
              <Phone className="w-3.5 h-3.5" />
              <span>{shop.phone}</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              onClick={handleAskSeller}
              className="w-full py-2.5 px-4 rounded-full bg-[#F1EDFD] hover:bg-[#DDD4FF] text-[#6C4DE6] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message {shop.ownerName}</span>
            </button>
            <button
              onClick={() => navigateTo('shop-detail', { shop })}
              className="w-full py-2.5 px-4 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <span>View Full Shop Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

