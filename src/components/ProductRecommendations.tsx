import React from 'react';
import { ArrowRight, Star, Heart, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';

const ProductCard: React.FC<{ product: Product }> = ({ product }) => {
  const { navigateTo, addToCart, toggleWishlist, isWishlisted, showToast } = useApp();

  const hasDiscount =
    product.price !== undefined &&
    product.originalPrice !== undefined &&
    product.originalPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.originalPrice! - product.price!) / product.originalPrice!) * 100)
    : 0;

  return (
    <div
      onClick={() => navigateTo('product-detail', { product })}
      className="group relative bg-white rounded-2xl border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden shrink-0 w-[148px] sm:w-auto flex flex-col"
      style={{ boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)' }}
    >
      {/* Image */}
      <div className="relative w-full aspect-square bg-[#F7F5F3] overflow-hidden">
        <img
          loading="lazy"
          decoding="async"
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label={isWishlisted(product.id) ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-1.5 right-1.5 p-1.5 rounded-full backdrop-blur-md transition-all ${
            isWishlisted(product.id) ? 'bg-[#FF6B8B] text-white' : 'bg-white/85 text-gray-600 hover:bg-white'
          }`}
        >
          <Heart className="w-3.5 h-3.5 fill-current" />
        </button>
        {hasDiscount && (
          <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 bg-[#176F43] text-white rounded-md text-[10px] font-extrabold shadow-sm">
            {discountPct}% OFF
          </span>
        )}
      </div>

      {/* Details */}
      <div className="p-2.5 space-y-1 flex-1">
        <h3 className="text-xs font-bold text-[#20243A] line-clamp-1">{product.name}</h3>
        <p className="text-[10px] text-[#737B89] line-clamp-1">{product.shopName}</p>

        <div className="flex items-baseline gap-1.5 flex-wrap">
          {product.price !== undefined && product.price !== null ? (
            <>
              <span className="text-sm font-extrabold text-[#20243A]">₹{product.price}</span>
              {hasDiscount && <span className="text-[10px] text-gray-400 line-through">₹{product.originalPrice}</span>}
            </>
          ) : (
            <span className="text-xs font-bold text-[#8067E8]">Contact for Price</span>
          )}
        </div>

        {product.rating !== undefined && product.rating > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#176F43] text-white text-[10px] font-bold rounded">
              {product.rating.toFixed(1)}
              <Star className="w-2.5 h-2.5 fill-current" />
            </span>
            {product.reviewsCount !== undefined && product.reviewsCount > 0 && (
              <span className="text-[10px] text-gray-400">({product.reviewsCount})</span>
            )}
          </div>
        )}
      </div>

      {/* Quick add to cart */}
      <button
        onClick={(e) => { e.stopPropagation(); addToCart(product); showToast(`${product.name} added to cart`, 'success'); }}
        className="w-full py-1.5 border-t border-gray-100 text-[11px] font-bold text-[#8067E8] hover:bg-[#F1EDFD] transition-colors flex items-center justify-center gap-1 cursor-pointer"
      >
        <ShoppingBag className="w-3.5 h-3.5" />
        Add to Cart
      </button>
    </div>
  );
};

interface ProductRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  onViewAll?: () => void;
  maxItems?: number;
}

export const ProductRow: React.FC<ProductRowProps> = ({ title, subtitle, products, onViewAll, maxItems = 10 }) => {
  if (products.length === 0) return null;
  const items = products.slice(0, maxItems);

  return (
    <section className="py-4 sm:py-8">
      <div className="flex items-end justify-between mb-2.5 sm:mb-5">
        <div>
          <h2 className="text-base sm:text-2xl font-extrabold text-[#20243A] tracking-tight">{title}</h2>
          {subtitle && <p className="text-[11px] sm:text-sm text-[#737B89] mt-0.5">{subtitle}</p>}
        </div>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-xs sm:text-sm font-bold text-[#8067E8] hover:text-[#6E52E2] flex items-center gap-1 sm:gap-1.5 shrink-0 cursor-pointer group"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>

      {/* MOBILE: Meesho/Flipkart-style horizontal scroll */}
      <div className="sm:hidden -mx-4 px-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-3 w-max pb-1">
          {items.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* DESKTOP/TABLET: grid */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </section>
  );
};
