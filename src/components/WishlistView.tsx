import React from 'react';
import { 
  Heart, ArrowLeft, ChevronRight, ShoppingBag, 
  Trash2, ArrowRight, Store 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const WishlistView: React.FC = () => {
  const { 
    wishlist, products, toggleWishlist, addToCart, 
    navigateTo, goBack, showToast 
  } = useApp();

  const wishlistedProducts = products.filter(p => wishlist.includes(p.id));

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-[#737B89]">
          <span className="cursor-pointer hover:text-[#8067E8]" onClick={() => navigateTo('markets')}>Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#20243A]">My Wishlist</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
            Saved Wishlist
          </h1>
          <p className="text-xs sm:text-sm text-[#737B89]">
            Items you loved from local market stalls
          </p>
        </div>
        <span className="text-xs font-bold bg-[#FFD4DF] text-[#C92A2A] px-3.5 py-1.5 rounded-full">
          {wishlistedProducts.length} Saved Items
        </span>
      </div>

      {wishlistedProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center space-y-4 border border-white/90 shadow-sm max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#FFE3E8] text-[#FF6B8B] flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8 fill-current" />
          </div>
          <h3 className="text-lg font-bold text-[#20243A]">Your Wishlist is Empty</h3>
          <p className="text-xs text-[#737B89]">
            Save products you like while exploring markets to easily find them later.
          </p>
          <button
            onClick={() => navigateTo('markets')}
            className="px-6 py-2.5 bg-[#8067E8] text-white rounded-full font-bold text-xs shadow-md hover:bg-[#6E52E2] transition-colors"
          >
            Explore Markets
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wishlistedProducts.map((product) => (
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
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-[#FF6B8B] text-white backdrop-blur-md shadow-xs"
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
                    showToast(`Moved ${product.name} to cart!`, 'success');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#8067E8] hover:bg-[#6E52E2] text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>Move to Cart</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
