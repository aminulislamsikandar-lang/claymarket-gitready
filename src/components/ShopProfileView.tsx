import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, ChevronRight, Store, MapPin, Phone, Clock, 
  CheckCircle2, MessageSquare, UserPlus, UserCheck, Star, 
  Heart, ShoppingBag, Share2, ShieldCheck, Sparkles, Filter,
  Plus, Camera, Pencil, Trash2, X, Loader2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MOCK_REVIEWS } from '../data/mockData';
import { Shop, Product } from '../types';
import { AddEditProductModal } from './AddEditProductModal';
import { EditShopDetailsModal } from './EditShopDetailsModal';
import { EMPTY_SHOP_FALLBACK } from '../utils/fallbacks';

export const ShopProfileView: React.FC = () => {
  const { 
    currentUser, selectedShop, shops, products, markets, categories, navigateTo, goBack, 
    toggleWishlist, isWishlisted, addToCart, startChatWithShop,
    toggleFollowShop, isFollowingShop, showToast,
    updateShopImages, addShopCategory, updateShopCategory, deleteShopCategory,
    updateProduct, deleteProduct,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'products' | 'reviews' | 'photos' | 'about'>('products');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isEditDetailsOpen, setIsEditDetailsOpen] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const shop = selectedShop || shops[0] || EMPTY_SHOP_FALLBACK;
  const targetMarket = markets.find(m => m.id === shop.marketId);
  const targetCategory = categories.find(c => c.id === shop.categoryId);
  const isFollowing = isFollowingShop(shop.id);

  // Check if current user is the owner/seller of this shop
  const isOwnerSeller = currentUser.role === 'seller' && (currentUser.shopId === shop.id || shop.id === 'shop_aminul' || currentUser.id === 'user_aminul');

  // Shop products (hide hidden products from public shop)
  const shopProducts = products.filter(p => p.shopId === shop.id && p.status !== 'hidden');
  const shopCategories = shop.productCategories || [];
  const filteredProducts = productCategoryFilter === 'all'
    ? shopProducts
    : shopProducts.filter(p => p.shopCategoryId === productCategoryFilter);

  // Reviews for this shop
  const reviews = MOCK_REVIEWS[shop.id] || MOCK_REVIEWS['shop_aminul'];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${shop.name} on Claymarket`,
        text: `Check out ${shop.name} at ${shop.marketName} on Claymarket!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href).then(() => showToast('Shop link copied to clipboard!', 'info'));
    }
  };

  const DEFAULT_AVATAR_URL = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&auto=format&fit=crop&q=80';
  const DEFAULT_BANNER_URL = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1000&auto=format&fit=crop&q=80';

  const handleAvatarFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      await updateShopImages(shop.id, { avatarFile: file });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = '';
    }
  };

  const handleBannerFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBanner(true);
    try {
      await updateShopImages(shop.id, { bannerFile: file });
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (shop.avatar === DEFAULT_AVATAR_URL) return;
    setIsUploadingAvatar(true);
    try {
      await updateShopImages(shop.id, { removeAvatar: true });
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemoveBanner = async () => {
    if (shop.banner === DEFAULT_BANNER_URL) return;
    setIsUploadingBanner(true);
    try {
      await updateShopImages(shop.id, { removeBanner: true });
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleAddCategory = async () => {
    const name = window.prompt('New category name (e.g. "Men\'s Wear", "Kids Wear"):');
    if (name === null) return;
    await addShopCategory(shop.id, name);
  };

  const handleRenameCategory = async (categoryId: string, currentName: string) => {
    const name = window.prompt('Rename category:', currentName);
    if (name === null) return;
    await updateShopCategory(shop.id, categoryId, name);
  };

  const handleDeleteCategory = async (categoryId: string, name: string) => {
    if (!window.confirm(`Remove category "${name}"? Products in it will become uncategorized.`)) return;
    if (productCategoryFilter === categoryId) setProductCategoryFilter('all');
    await deleteShopCategory(shop.id, categoryId);
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!isOwnerSeller) return;
    if (!window.confirm(`Delete "${product.name}" from your shop? This will remove the entire product listing.`)) return;
    setDeletingProductId(product.id);
    try {
      await deleteProduct(product.id);
      showToast('Product deleted from your shop.', 'success');
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Breadcrumbs: Market -> Category -> Shop */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={goBack}
          className="p-2.5 rounded-full bg-white hover:bg-gray-100 text-[#20243A] shadow-xs border border-gray-200/80 transition-all cursor-pointer flex items-center gap-1 text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-2 text-sm text-[#737B89] flex-wrap">
          <span className="cursor-pointer hover:text-[#8067E8] font-medium" onClick={() => navigateTo('market-detail', { market: targetMarket })}>{shop.marketName}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="cursor-pointer hover:text-[#8067E8] font-medium" onClick={() => navigateTo('category-detail', { category: targetCategory, market: targetMarket })}>{shop.categoryName}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[#20243A]">{shop.name}</span>
        </div>
        {(shop.district || shop.state) && (
          <div className="flex items-center gap-1.5 text-xs text-[#737B89] ml-1">
            <MapPin className="w-3.5 h-3.5 text-[#8067E8]" />
            <span>{shop.district}{shop.district && shop.state ? ', ' : ''}{shop.state}</span>
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl overflow-hidden border border-white/90 shadow-sm" style={{boxShadow: '0 16px 36px -10px rgba(32, 36, 58, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.95)'}}>
        <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-[#8067E8]/20 to-[#CBEFD9]/40">
          <img loading="lazy" decoding="async" src={shop.banner} alt={shop.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#15192C]/80 via-[#15192C]/20 to-transparent" />
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {isOwnerSeller && (
              <>
                <input type="file" ref={bannerInputRef} accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" id="shop-banner-file-input" onChange={handleBannerFileSelected} />
                <button onClick={() => bannerInputRef.current?.click()} disabled={isUploadingBanner} title="Change cover photo" className="p-2.5 rounded-full bg-white/80 hover:bg-white text-[#20243A] backdrop-blur-md transition-all shadow-xs cursor-pointer disabled:opacity-60">
                  {isUploadingBanner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </button>
                {shop.banner !== DEFAULT_BANNER_URL && <button onClick={handleRemoveBanner} disabled={isUploadingBanner} title="Remove cover photo" className="p-2.5 rounded-full bg-white/80 hover:bg-white text-red-500 backdrop-blur-md transition-all shadow-xs cursor-pointer disabled:opacity-60"><Trash2 className="w-4 h-4" /></button>}
              </>
            )}
            <button onClick={handleShare} className="p-2.5 rounded-full bg-white/80 hover:bg-white text-[#20243A] backdrop-blur-md transition-all shadow-xs cursor-pointer"><Share2 className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-6 sm:p-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex items-end gap-4">
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden bg-white ring-4 ring-white shadow-xl shrink-0 group">
                <img loading="lazy" decoding="async" src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                {isOwnerSeller && <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 sm:opacity-100">
                  <input type="file" ref={avatarInputRef} accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" id="shop-avatar-file-input" onChange={handleAvatarFileSelected} />
                  <button onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar} title="Change profile photo" className="p-1.5 rounded-full bg-white/90 hover:bg-white text-[#20243A] transition-all shadow-xs cursor-pointer disabled:opacity-60">{isUploadingAvatar ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5" />}</button>
                  {shop.avatar !== DEFAULT_AVATAR_URL && <button onClick={handleRemoveAvatar} disabled={isUploadingAvatar} title="Remove profile photo" className="p-1.5 rounded-full bg-white/90 hover:bg-white text-red-500 transition-all shadow-xs cursor-pointer disabled:opacity-60"><Trash2 className="w-3.5 h-3.5" /></button>}
                </div>}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2"><h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A] tracking-tight">{shop.name}</h1>{shop.verified && <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#DDD4FF] text-[#553BB8] text-xs font-bold rounded-full"><ShieldCheck className="w-3.5 h-3.5" />Verified</span>}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#737B89]"><span onClick={() => navigateTo('market-detail', { market: targetMarket })} className="font-bold text-[#8067E8] bg-[#F1EDFD] hover:bg-[#DDD4FF] px-2.5 py-0.5 rounded-full transition-colors cursor-pointer">📍 {shop.marketName}</span><span>•</span><span onClick={() => navigateTo('category-detail', { category: targetCategory, market: targetMarket })} className="font-semibold text-gray-700 hover:text-[#8067E8] cursor-pointer transition-colors">{shop.categoryName}</span><span>•</span><span className="flex items-center gap-1 font-bold text-[#20243A]"><Star className="w-3.5 h-3.5 fill-[#FAB005] text-[#FAB005]" />{shop.rating} ({shop.reviewsCount} reviews)</span></div>
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2 sm:pt-0">
              <button id="shop-message-btn" onClick={() => startChatWithShop(shop, undefined, `Hello ${shop.ownerName}! I am interested in items from ${shop.name}.`)} className="px-6 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"><MessageSquare className="w-4 h-4" /><span>Message</span></button>
              <button id="shop-follow-btn" onClick={() => toggleFollowShop(shop.id)} className={`px-5 py-2.5 rounded-full font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${isFollowing ? 'bg-[#CBEFD9] text-[#176F43] border border-[#A7E2BE]' : 'bg-[#F1EEFD] hover:bg-[#DDD4FF] text-[#6C4DE6]'}`}>{isFollowing ? <><UserCheck className="w-4 h-4" /><span>Following</span></> : <><UserPlus className="w-4 h-4" /><span>Follow</span></>}</button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3 border-t border-gray-100 text-xs text-[#505767]"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#8067E8]" /><span className="truncate">{shop.address}</span></div><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[#40C057]" /><span>{shop.phone}</span></div><div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#FF922B]" /><span>{shop.openingHours || 'Open 8:00 AM - 8:30 PM'}</span></div></div>
        </div>
        <div className="px-6 sm:px-8 bg-[#FAF8FE] border-t border-gray-100 flex items-center space-x-2 overflow-x-auto">{(['products', 'reviews', 'photos', 'about'] as const).map(tab => <button key={tab} id={`shop-tab-${tab}`} onClick={() => setActiveTab(tab)} className={`py-3.5 px-5 font-bold text-sm capitalize border-b-2 transition-all cursor-pointer whitespace-nowrap ${activeTab === tab ? 'border-[#8067E8] text-[#8067E8]' : 'border-transparent text-[#737B89] hover:text-[#20243A]'}`}>{tab === 'products' ? `Products (${shopProducts.length})` : tab}</button>)}</div>
      </div>

      {activeTab === 'products' && (
        <section className="space-y-5 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100"><div><h2 className="text-xl font-extrabold text-[#20243A]">Available in Shop</h2><span className="text-xs text-[#737B89]">{shopProducts.length} items in stock</span></div>{isOwnerSeller && <button id="shop-add-product-btn" onClick={() => setIsAddProductOpen(true)} className="px-5 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"><Plus className="w-4 h-4" /><span>+ Add Product</span></button>}</div>
          {(shopCategories.length > 0 || isOwnerSeller) && <div className="flex flex-wrap items-center gap-2"><button onClick={() => setProductCategoryFilter('all')} className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${productCategoryFilter === 'all' ? 'bg-[#8067E8] text-white shadow-xs' : 'bg-[#F1EDFD] text-[#553BB8] hover:bg-[#DDD4FF]'}`}>All</button>{shopCategories.map(cat => <div key={cat.id} className={`flex items-center gap-1 pl-3.5 pr-1.5 py-1.5 rounded-full text-xs font-bold transition-all ${productCategoryFilter === cat.id ? 'bg-[#8067E8] text-white shadow-xs' : 'bg-[#F1EDFD] text-[#553BB8] hover:bg-[#DDD4FF]'}`}><button onClick={() => setProductCategoryFilter(cat.id)} className="cursor-pointer">{cat.name}</button>{isOwnerSeller && <span className="flex items-center gap-0.5 ml-1"><button onClick={() => handleRenameCategory(cat.id, cat.name)} title="Rename category" className={`p-1 rounded-full cursor-pointer transition-colors ${productCategoryFilter === cat.id ? 'hover:bg-white/20' : 'hover:bg-[#DDD4FF]'}`}><Pencil className="w-3 h-3" /></button><button onClick={() => handleDeleteCategory(cat.id, cat.name)} title="Delete category" className={`p-1 rounded-full cursor-pointer transition-colors ${productCategoryFilter === cat.id ? 'hover:bg-white/20' : 'hover:bg-[#DDD4FF]'}`}><X className="w-3 h-3" /></button></span>}</div>)}{isOwnerSeller && <button id="shop-add-category-btn" onClick={handleAddCategory} className="flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-dashed border-[#8067E8]/40 text-[#8067E8] hover:bg-[#F1EDFD] transition-all cursor-pointer"><Plus className="w-3.5 h-3.5" />Add Category</button>}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product: Product) => (
              <div key={product.id} onClick={() => navigateTo('product-detail', { product })} className="group bg-white rounded-3xl p-3.5 border border-white/90 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer" style={{boxShadow: '0 8px 24px -4px rgba(32, 36, 58, 0.04), inset 0 2px 3px rgba(255, 255, 255, 0.95)'}}>
                <div>
                  <div className="relative w-full h-44 rounded-2xl overflow-hidden bg-gray-100 mb-3">
                    <img loading="lazy" decoding="async" src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button onClick={(e) => {e.stopPropagation(); toggleWishlist(product.id);}} className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all ${isWishlisted(product.id) ? 'bg-[#FF6B8B] text-white' : 'bg-white/80 text-gray-700 hover:bg-white'}`}><Heart className="w-4 h-4 fill-current" /></button>
                    {isOwnerSeller && <button onClick={(e) => {e.stopPropagation(); void handleDeleteProduct(product);}} disabled={deletingProductId === product.id} title="Delete product from shop" aria-label={`Delete ${product.name}`} className="absolute top-2.5 left-2.5 z-10 p-2 rounded-full bg-white/90 hover:bg-red-500 text-red-500 hover:text-white backdrop-blur-md shadow-sm transition-all cursor-pointer disabled:opacity-60">{deletingProductId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}</button>}
                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-[#176F43]/90 text-white rounded-md text-[10px] font-bold">In Stock</div>
                  </div>
                  <h3 className="font-bold text-sm text-[#20243A] group-hover:text-[#8067E8] transition-colors line-clamp-1 mb-1">{product.name}</h3>
                  {product.sizes && product.sizes.length > 0 && <div className="flex items-center gap-1 mb-2"><span className="text-[10px] text-gray-400 font-semibold">Sizes:</span><span className="text-[10px] font-bold text-gray-700">{product.sizes.slice(0, 4).join(', ')}</span></div>}
                  {product.description && <p className="text-xs text-[#737B89] line-clamp-2 mb-2 leading-relaxed">{product.description}</p>}
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between"><div>{product.price !== undefined && product.price !== null ? <div className="flex items-baseline gap-1.5"><span className="text-base font-extrabold text-[#20243A]">₹{product.price}</span>{product.originalPrice !== undefined && product.originalPrice !== null && product.originalPrice > product.price && <span className="text-xs text-gray-400 line-through">₹{product.originalPrice}</span>}</div> : <span className="text-xs font-bold text-[#8067E8]">Contact for Price</span>}</div><div className="flex items-center gap-1.5"><button onClick={(e) => {e.stopPropagation(); startChatWithShop(shop, product, `Hi ${shop.ownerName}, is the "${product.name}" available?`);}} title="Ask Seller" className="p-2 rounded-xl bg-[#FAF8FE] hover:bg-[#DDD4FF] text-[#8067E8] transition-colors"><MessageSquare className="w-4 h-4" /></button><button onClick={(e) => {e.stopPropagation(); addToCart(product);}} className="p-2 rounded-xl bg-[#F1EDFD] hover:bg-[#8067E8] text-[#8067E8] hover:text-white transition-colors cursor-pointer shadow-xs"><ShoppingBag className="w-4 h-4" /></button></div></div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'reviews' && <section className="space-y-6 animate-in fade-in duration-150"><div className="bg-white rounded-3xl p-6 border border-white/90 shadow-sm flex flex-col sm:flex-row items-center gap-8"><div className="text-center sm:text-left shrink-0"><div className="text-5xl font-extrabold text-[#20243A]">{shop.rating}</div><div className="flex items-center justify-center sm:justify-start gap-1 text-[#FAB005] my-1">{[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}</div><p className="text-xs text-[#737B89]">Based on {shop.reviewsCount} local customer reviews</p></div><div className="flex-1 w-full space-y-2"><div className="flex items-center gap-3 text-xs"><span className="w-12 font-bold">5 Stars</span><div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#8067E8] w-[90%]" /></div><span className="w-8 text-right text-gray-500">90%</span></div><div className="flex items-center gap-3 text-xs"><span className="w-12 font-bold">4 Stars</span><div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#8067E8] w-[8%]" /></div><span className="w-8 text-right text-gray-500">8%</span></div><div className="flex items-center gap-3 text-xs"><span className="w-12 font-bold">3 Stars</span><div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-[#8067E8] w-[2%]" /></div><span className="w-8 text-right text-gray-500">2%</span></div></div></div><div className="space-y-3">{reviews.map((rev) => <div key={rev.id} className="bg-white rounded-3xl p-5 border border-white/90 shadow-xs space-y-2"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><img loading="lazy" decoding="async" src={rev.authorAvatar} alt={rev.authorName} className="w-9 h-9 rounded-full object-cover" /><div><h4 className="font-bold text-sm text-[#20243A]">{rev.authorName}</h4><p className="text-[11px] text-gray-400">{rev.date}</p></div></div><div className="flex items-center gap-0.5 text-[#FAB005]">{[...Array(rev.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}</div></div><p className="text-sm text-[#505767] leading-relaxed pt-1">{rev.comment}</p></div>)}</div></section>}

      {activeTab === 'photos' && <section className="space-y-4 animate-in fade-in duration-150"><h2 className="text-xl font-extrabold text-[#20243A]">Stall & Workshop Photos</h2><div className="grid grid-cols-2 sm:grid-cols-3 gap-4">{[shop.banner, shop.avatar, ...products.filter(p => p.shopId === shop.id).map(p => p.images[0])].map((img, i) => <div key={i} className="rounded-2xl overflow-hidden bg-gray-100 aspect-video shadow-xs"><img loading="lazy" decoding="async" src={img} alt="Shop stall" className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" /></div>)}</div></section>}

      {activeTab === 'about' && <section className="bg-white rounded-3xl p-6 sm:p-8 border border-white/90 shadow-sm space-y-6 animate-in fade-in duration-150"><div className="flex items-start justify-between gap-3"><div><h3 className="text-lg font-bold text-[#20243A] mb-2">Shop Story</h3><p className="text-sm sm:text-base text-[#505767] leading-relaxed">{shop.about}</p></div>{isOwnerSeller && <button id="shop-edit-details-btn" onClick={() => setIsEditDetailsOpen(true)} className="shrink-0 flex items-center gap-1.5 py-2 px-3.5 rounded-full bg-[#F1EDFD] hover:bg-[#DDD4FF] text-[#6C4DE6] font-bold text-xs transition-colors cursor-pointer"><Pencil className="w-3.5 h-3.5" /><span>Edit Shop Details</span></button>}</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-gray-100"><div><h4 className="font-bold text-sm text-[#20243A] mb-2">Market & Location</h4><p className="text-sm text-[#737B89]">Market: <strong>{shop.marketName}</strong></p><p className="text-sm text-[#737B89]">Stall Address: <strong>{shop.address}</strong></p><p className="text-sm text-[#737B89]">Primary Category: <strong>{shop.categoryName}</strong></p></div><div><h4 className="font-bold text-sm text-[#20243A] mb-2">Owner & Contact</h4><p className="text-sm text-[#737B89]">Proprietor: <strong>{shop.ownerName}</strong></p><p className="text-sm text-[#737B89]">Phone: <strong>{shop.phone}</strong></p><p className="text-sm text-[#737B89]">Working Hours: <strong>{shop.openingHours || '8:00 AM - 8:30 PM'}</strong></p><button onClick={() => startChatWithShop(shop, undefined, `Hello ${shop.ownerName}! I have an inquiry about ${shop.name}.`)} className="mt-3 py-2 px-4 rounded-full bg-[#F1EDFD] hover:bg-[#DDD4FF] text-[#6C4DE6] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"><MessageSquare className="w-3.5 h-3.5" /><span>Message Proprietor ({shop.ownerName})</span></button></div></div></section>}

      {isOwnerSeller && <AddEditProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} defaultShopId={shop.id} defaultShopName={shop.name} defaultMarketId={shop.marketId} defaultMarketName={shop.marketName} />}
      {isOwnerSeller && <EditShopDetailsModal isOpen={isEditDetailsOpen} onClose={() => setIsEditDetailsOpen(false)} shop={shop} />}
    </div>
  );
};
