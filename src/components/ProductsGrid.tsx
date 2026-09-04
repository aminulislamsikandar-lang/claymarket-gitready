import React, { useState } from 'react';
import { Heart, ShoppingBag, MessageSquare, Trash2, Loader2, ShoppingBag as ShoppingBagIcon } from 'lucide-react';
import { Product, Shop } from '../types';
import { ProductImageViewer } from './ProductImageViewer';
import { ImageLightbox } from './ImageLightbox';
import type { ProductViewPreferences } from '../hooks/useProductViewPreferences';

interface ProductsGridProps {
  products: Product[];
  prefs: ProductViewPreferences;
  isLoading: boolean;
  shop: Shop;
  isOwnerSeller: boolean;
  deletingProductId: string | null;
  isWishlisted: (id: string) => boolean;
  toggleWishlist: (id: string) => void;
  onDeleteProduct: (product: Product) => void;
  onNavigate: (product: Product) => void;
  onAsk: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const SKELETON_COUNT = 8;

const LAYOUT_CONTAINER_CLASS: Record<ProductViewPreferences['layout'], string> = {
  large: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5',
  medium: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4',
  list: 'flex flex-col gap-3',
  details: 'flex flex-col gap-2',
  natural: 'columns-2 sm:columns-3 lg:columns-4 gap-4 [column-fill:_balance]',
  mosaic: 'grid grid-cols-3 gap-[2px] bg-black rounded-2xl overflow-hidden',
};

const priceBlock = (product: Product, size: 'sm' | 'lg') => {
  const big = size === 'lg';
  if (product.price !== undefined && product.price !== null) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className={`${big ? 'text-base' : 'text-sm'} font-extrabold text-[#20243A]`}>₹{product.price}</span>
        {product.originalPrice !== undefined && product.originalPrice !== null && product.originalPrice > product.price && (
          <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>
        )}
      </div>
    );
  }
  return <span className="text-xs font-bold text-[#8067E8]">Contact for Price</span>;
};

export const ProductsGrid: React.FC<ProductsGridProps> = ({ products, prefs, isLoading, shop, isOwnerSeller, deletingProductId, isWishlisted, toggleWishlist, onDeleteProduct, onNavigate, onAsk, onAddToCart }) => {
  const [lightbox, setLightbox] = useState<{ product: Product; index: number } | null>(null);
  const { layout, imageFit, showDetails } = prefs;
  const effectiveShowDetails = layout === 'list' || layout === 'details' ? true : showDetails;

  if (isLoading) {
    if (layout === 'mosaic') {
      return (
        <div className={LAYOUT_CONTAINER_CLASS.mosaic}>
          {Array.from({ length: 9 }).map((_, i) => <div key={`skeleton-${i}`} className="aspect-square shimmer-loading" />)}
        </div>
      );
    }
    return (
      <div className={LAYOUT_CONTAINER_CLASS[layout]}>
        {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
          <div key={`skeleton-${i}`} className={`bg-white rounded-3xl p-3.5 border border-white/90 shadow-sm ${layout === 'natural' ? 'break-inside-avoid mb-4' : ''} ${layout === 'list' || layout === 'details' ? 'flex items-center gap-4' : ''}`}>
            <div className={`shimmer-loading rounded-2xl ${layout === 'list' || layout === 'details' ? 'w-24 h-24 shrink-0' : layout === 'medium' ? 'w-full h-28 mb-3' : 'w-full h-60 mb-3'}`} />
            <div className="flex-1 min-w-0">
              <div className="h-3.5 w-3/4 rounded-full shimmer-loading mb-2" />
              <div className="h-3 w-1/2 rounded-full shimmer-loading" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 bg-white/60 rounded-3xl border border-dashed border-[#DDD4FF]">
        <ShoppingBagIcon className="w-10 h-10 text-[#8067E8] mb-3" />
        <h3 className="font-bold text-[#20243A]">No products in this category yet</h3>
        {isOwnerSeller && <p className="text-sm text-[#737B89] mt-1">Tap "+ Add Product" and assign it to this category.</p>}
      </div>
    );
  }

  const openLightbox = (product: Product, index: number) => setLightbox({ product, index });

  const wishlistBtn = (product: Product, size: 'sm' | 'lg') => (
    <button
      onClick={e => { e.stopPropagation(); toggleWishlist(product.id); }}
      className={`absolute ${size === 'lg' ? 'top-2.5 right-2.5 p-2' : 'top-1.5 right-1.5 p-1.5'} rounded-full backdrop-blur-md transition-all z-10 ${isWishlisted(product.id) ? 'bg-[#FF6B8B] text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}
    >
      <Heart className={size === 'lg' ? 'w-4 h-4 fill-current' : 'w-3.5 h-3.5 fill-current'} />
    </button>
  );

  const deleteBtn = (product: Product, size: 'sm' | 'lg') => isOwnerSeller && (
    <button
      onClick={e => { e.stopPropagation(); onDeleteProduct(product); }}
      disabled={deletingProductId === product.id}
      title="Delete product from shop"
      className={`absolute ${size === 'lg' ? 'top-2.5 left-2.5 p-2' : 'top-1.5 left-1.5 p-1.5'} z-10 rounded-full bg-white/90 hover:bg-red-500 text-red-500 hover:text-white backdrop-blur-md shadow-sm transition-all cursor-pointer disabled:opacity-60`}
    >
      {deletingProductId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
    </button>
  );

  const inStockBadge = (
    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-[#176F43]/90 text-white rounded-md text-[10px] font-bold z-10">In Stock</div>
  );

  const actionButtons = (product: Product) => (
    <div className="flex items-center gap-1.5">
      <button onClick={e => { e.stopPropagation(); onAsk(product); }} title="Ask Seller" className="p-2 rounded-xl bg-[#FAF8FE] hover:bg-[#DDD4FF] text-[#8067E8] transition-colors cursor-pointer"><MessageSquare className="w-4 h-4" /></button>
      <button onClick={e => { e.stopPropagation(); onAddToCart(product); }} className="p-2 rounded-xl bg-[#F1EDFD] hover:bg-[#8067E8] text-[#8067E8] hover:text-white transition-colors cursor-pointer shadow-xs"><ShoppingBag className="w-4 h-4" /></button>
    </div>
  );

  // --- Mosaic: tight 3-per-row grid, image-only, hairline black dividers ----------------------
  if (layout === 'mosaic') {
    return (
      <>
        <div className={LAYOUT_CONTAINER_CLASS.mosaic}>
          {products.map(product => (
            <div key={product.id} className="relative aspect-square bg-black overflow-hidden cursor-pointer">
              <ProductImageViewer
                images={product.images}
                alt={product.name}
                fit="cover"
                frameClassName="w-full h-full"
                onNavigate={() => onNavigate(product)}
                onOpenLightbox={idx => openLightbox(product, idx)}
              >
                {wishlistBtn(product, 'sm')}
                {deleteBtn(product, 'sm')}
              </ProductImageViewer>
            </div>
          ))}
        </div>
        {lightbox && <ImageLightbox images={lightbox.product.images} startIndex={lightbox.index} title={lightbox.product.name} onClose={() => setLightbox(null)} />}
      </>
    );
  }

  // --- Card layouts: large / medium / natural -------------------------------------------------
  if (layout === 'large' || layout === 'medium' || layout === 'natural') {
    const isNatural = layout === 'natural';
    const isMedium = layout === 'medium';
    return (
      <>
        <div className={LAYOUT_CONTAINER_CLASS[layout]}>
          {products.map(product => (
            <div
              key={product.id}
              onClick={() => onNavigate(product)}
              className={`group bg-white rounded-3xl border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer ${isMedium ? 'p-2.5' : 'p-3.5'} ${isNatural ? 'break-inside-avoid mb-4' : ''}`}
              style={{ boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)' }}
            >
              <div>
                <ProductImageViewer
                  images={product.images}
                  alt={product.name}
                  fit={imageFit}
                  natural={isNatural}
                  frameClassName={isNatural ? 'w-full mb-3' : `w-full rounded-2xl mb-3 ${isMedium ? 'h-28' : 'h-60 sm:h-64'}`}
                  onNavigate={() => onNavigate(product)}
                  onOpenLightbox={idx => openLightbox(product, idx)}
                >
                  {wishlistBtn(product, isMedium ? 'sm' : 'lg')}
                  {deleteBtn(product, isMedium ? 'sm' : 'lg')}
                  {!isNatural && inStockBadge}
                </ProductImageViewer>
                {effectiveShowDetails && (
                  <>
                    <h3 className={`font-bold ${isMedium ? 'text-xs' : 'text-sm'} text-[#20243A] group-hover:text-[#8067E8] transition-colors line-clamp-1 mb-1`}>{product.name}</h3>
                    {!isMedium && product.sizes && product.sizes.length > 0 && <div className="flex items-center gap-1 mb-2"><span className="text-[10px] text-gray-400 font-semibold">Sizes:</span><span className="text-[10px] font-bold text-gray-700">{product.sizes.slice(0, 4).join(', ')}</span></div>}
                    {!isMedium && product.description && <p className="text-xs text-[#737B89] line-clamp-2 mb-2 leading-relaxed">{product.description}</p>}
                  </>
                )}
              </div>
              {effectiveShowDetails && (
                <div className={`pt-2 border-t border-gray-100 flex flex-col items-start gap-1.5 ${isMedium ? '' : 'sm:flex-row sm:items-center sm:justify-between'}`}>
                  <div>{priceBlock(product, isMedium ? 'sm' : 'lg')}</div>
                  {isMedium ? (
                    <button onClick={e => { e.stopPropagation(); onAddToCart(product); }} className="w-full py-1.5 rounded-lg bg-[#F1EDFD] hover:bg-[#8067E8] text-[#8067E8] hover:text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"><ShoppingBag className="w-3.5 h-3.5" />Add</button>
                  ) : actionButtons(product)}
                </div>
              )}
            </div>
          ))}
        </div>
        {lightbox && <ImageLightbox images={lightbox.product.images} startIndex={lightbox.index} title={lightbox.product.name} onClose={() => setLightbox(null)} />}
      </>
    );
  }

  // --- Row layouts: list / details -------------------------------------------------------------
  const isDetails = layout === 'details';
  return (
    <>
      <div className={LAYOUT_CONTAINER_CLASS[layout]}>
        {isDetails && (
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 text-[11px] font-extrabold uppercase tracking-wide text-[#9C93BE]">
            <span className="w-20 shrink-0">Photo</span>
            <span className="flex-1 min-w-0">Product</span>
            <span className="w-32 shrink-0">Sizes</span>
            <span className="w-28 shrink-0">Price</span>
            <span className="w-40 shrink-0 text-right">Actions</span>
          </div>
        )}
        {products.map(product => (
          <div
            key={product.id}
            onClick={() => onNavigate(product)}
            className="group bg-white rounded-2xl p-3 border border-white/90 shadow-sm hover:shadow-lg transition-all duration-300 flex items-center gap-4 cursor-pointer"
            style={{ boxShadow: '0 6px 18px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)' }}
          >
            <ProductImageViewer
              images={product.images}
              alt={product.name}
              fit={imageFit}
              frameClassName="w-20 h-20 sm:w-24 sm:h-24 rounded-xl shrink-0"
              onNavigate={() => onNavigate(product)}
              onOpenLightbox={idx => openLightbox(product, idx)}
            >
              {wishlistBtn(product, 'sm')}
              {deleteBtn(product, 'sm')}
            </ProductImageViewer>

            <div className={`flex-1 min-w-0 flex ${isDetails ? 'sm:items-center' : 'flex-col'} ${isDetails ? 'flex-col sm:flex-row gap-1 sm:gap-4' : ''}`}>
              <div className={isDetails ? 'flex-1 min-w-0' : ''}>
                <h3 className="font-bold text-sm text-[#20243A] group-hover:text-[#8067E8] transition-colors line-clamp-1">{product.name}</h3>
                {product.description && <p className="text-xs text-[#737B89] line-clamp-1 mt-0.5">{product.description}</p>}
              </div>
              <div className={isDetails ? 'w-full sm:w-32 shrink-0 text-xs' : 'text-xs mt-1'}>
                {product.sizes && product.sizes.length > 0 && <span><span className="text-gray-400 font-semibold">Sizes: </span><span className="font-bold text-gray-700">{product.sizes.slice(0, 4).join(', ')}</span></span>}
              </div>
              <div className={isDetails ? 'w-full sm:w-28 shrink-0' : 'mt-1'}>{priceBlock(product, 'sm')}</div>
            </div>

            <div className={isDetails ? 'w-40 shrink-0 flex justify-end' : 'shrink-0'}>{actionButtons(product)}</div>
          </div>
        ))}
      </div>
      {lightbox && <ImageLightbox images={lightbox.product.images} startIndex={lightbox.index} title={lightbox.product.name} onClose={() => setLightbox(null)} />}
    </>
  );
};
