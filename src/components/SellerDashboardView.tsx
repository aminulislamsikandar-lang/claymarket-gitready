import React, { useState, useEffect, useRef } from 'react';
import { 
  Store, Package, TrendingUp, Users, Plus, Edit, 
  Trash2, CheckCircle2, Clock, Eye, EyeOff, AlertCircle, 
  ShoppingBag, ChevronRight, ArrowLeft, MessageSquare, ExternalLink,
  Sparkles, Search, MoreVertical, X, Check, AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product } from '../types';
import { AddEditProductModal } from './AddEditProductModal';
import { EMPTY_SHOP_FALLBACK } from '../utils/fallbacks';

export const SellerDashboardView: React.FC = () => {
  const { 
    currentUser, products, updateProduct, deleteProduct, orders, updateOrderStatus,
    navigateTo, goBack, showToast, shops, conversations,
    setActiveConversationId, setIsMessagesOpen
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'messages' | 'analytics'>('inventory');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Seller Search and Filter States
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'hidden'>('all');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Confirmation Modals State
  const [productToHide, setProductToHide] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close more menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const shopId = currentUser.shopId || '';
  const myProducts = products.filter(p => p.shopId === shopId);
  const myOrders = orders.filter(o => o.shopId === shopId);

  const publishedProducts = myProducts.filter(p => p.status !== 'hidden');
  const hiddenProducts = myProducts.filter(p => p.status === 'hidden');

  // Filter seller products based on status and search query
  const filteredMyProducts = myProducts.filter(p => {
    // Status filter
    if (statusFilter === 'published' && p.status === 'hidden') return false;
    if (statusFilter === 'hidden' && p.status !== 'hidden') return false;

    // Search query filter (name, category, description, material, sizes)
    if (productSearchQuery.trim()) {
      const q = productSearchQuery.toLowerCase().trim();
      const matchName = p.name.toLowerCase().includes(q);
      const matchCat = p.categoryName ? p.categoryName.toLowerCase().includes(q) : false;
      const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
      const matchMaterial = p.material ? p.material.toLowerCase().includes(q) : false;
      const matchSizes = p.sizes ? p.sizes.some(s => s.toLowerCase().includes(q)) : false;
      return matchName || matchCat || matchDesc || matchMaterial || matchSizes;
    }
    return true;
  });

  const openAddProductModal = () => {
    setOpenMenuId(null);
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod: Product) => {
    setOpenMenuId(null);
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  // Trigger Hide Confirmation Modal
  const requestHideProduct = (prod: Product) => {
    setOpenMenuId(null);
    setProductToHide(prod);
  };

  // Confirm Hide
  const confirmHideProduct = () => {
    if (!productToHide) return;
    updateProduct(productToHide.id, { status: 'hidden' });
    showToast('✓ Product hidden from public shop', 'info');
    setProductToHide(null);
  };

  // Direct Publish Action
  const handlePublishProduct = (prod: Product) => {
    setOpenMenuId(null);
    updateProduct(prod.id, { status: 'published' });
    showToast('✓ Product published successfully', 'success');
  };

  // Trigger Delete Confirmation Modal
  const requestDeleteProduct = (prod: Product) => {
    setOpenMenuId(null);
    setProductToDelete(prod);
  };

  // Confirm Delete
  const confirmDeleteProduct = () => {
    if (!productToDelete) return;
    deleteProduct(productToDelete.id);
    showToast('✓ Product deleted successfully', 'success');
    setProductToDelete(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-16">
      
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
          <span className="font-bold text-[#20243A]">Seller Dashboard</span>
        </div>
      </div>

      {/* Header Banner */}
      <div 
        className="bg-white rounded-3xl p-6 sm:p-8 border border-white/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        style={{
          boxShadow: '0 16px 36px -10px rgba(32, 36, 58, 0.08), inset 0 2px 4px rgba(255, 255, 255, 0.95)'
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#DDD4FF] text-[#6C4DE6] flex items-center justify-center font-bold shadow-inner">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20243A]">
                {currentUser.shopName || 'Aminul Slipper Shop'}
              </h1>
              <span className="px-2.5 py-0.5 bg-[#CBEFD9] text-[#176F43] text-xs font-bold rounded-full">
                Active Stall
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#737B89] mt-0.5">
              Owner: <strong>{currentUser.name}</strong> • Location: <strong>Kachumara Market</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const shop = shops.find(s => s.id === shopId) || EMPTY_SHOP_FALLBACK;
              navigateTo('shop-detail', { shop });
            }}
            className="px-4 py-2.5 rounded-full bg-[#FAF8FE] hover:bg-[#F1EDFD] text-[#8067E8] font-bold text-xs flex items-center gap-2 border border-[#DDD4FF] transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Shop</span>
          </button>

          <button
            id="seller-add-product-top-btn"
            onClick={openAddProductModal}
            className="px-5 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
            style={{
              boxShadow: '0 4px 14px rgba(128, 103, 232, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
            }}
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Product</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-3xl p-5 border border-white/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Revenue</span>
            <TrendingUp className="w-4 h-4 text-[#40C057]" />
          </div>
          <div className="text-2xl font-extrabold text-[#20243A]">₹48,920</div>
          <p className="text-[11px] text-[#40C057] font-semibold">+18% this month</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-white/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Products</span>
            <Package className="w-4 h-4 text-[#8067E8]" />
          </div>
          <div className="text-2xl font-extrabold text-[#20243A]">{publishedProducts.length}</div>
          <p className="text-[11px] text-[#8067E8] font-semibold">
            {hiddenProducts.length > 0 ? `${hiddenProducts.length} hidden product${hiddenProducts.length > 1 ? 's' : ''}` : 'All published in shop'}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-white/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-[#FF922B]" />
          </div>
          <div className="text-2xl font-extrabold text-[#20243A]">{myOrders.length}</div>
          <p className="text-[11px] text-gray-500 font-semibold">Stall pickups & deliveries</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-white/90 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold uppercase tracking-wider">Stall Visitors</span>
            <Users className="w-4 h-4 text-[#1B5899]" />
          </div>
          <div className="text-2xl font-extrabold text-[#20243A]">1,240</div>
          <p className="text-[11px] text-[#176F43] font-semibold">Local buyers reached</p>
        </div>

      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'inventory' 
              ? 'border-[#8067E8] text-[#8067E8]' 
              : 'border-transparent text-gray-500 hover:text-[#20243A]'
          }`}
        >
          Products ({myProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'orders' 
              ? 'border-[#8067E8] text-[#8067E8]' 
              : 'border-transparent text-gray-500 hover:text-[#20243A]'
          }`}
        >
          Incoming Orders ({myOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('messages')}
          className={`py-3 px-5 font-bold text-sm border-b-2 transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'messages' 
              ? 'border-[#8067E8] text-[#8067E8]' 
              : 'border-transparent text-gray-500 hover:text-[#20243A]'
          }`}
        >
          <span>Customer Inquiries</span>
          {conversations.filter(c => c.shopId === shopId || c.sellerId === currentUser.id).length > 0 && (
            <span className="text-xs bg-[#DDD4FF] text-[#553BB8] px-2 py-0.5 rounded-full font-bold">
              {conversations.filter(c => c.shopId === shopId || c.sellerId === currentUser.id).length}
            </span>
          )}
        </button>
      </div>

      {/* 1. SELLER PRODUCTS PAGE & INVENTORY TAB */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-white/90 shadow-sm space-y-5">
          
          {/* Header Row: Products + Add Product Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl text-[#20243A]">Products</h3>
              <p className="text-xs text-[#737B89] mt-0.5">Manage and organize all products in your shop</p>
            </div>

            <button
              id="seller-add-product-inventory-btn"
              onClick={openAddProductModal}
              className="px-5 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer self-start sm:self-auto"
              style={{
                boxShadow: '0 4px 14px rgba(128, 103, 232, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
              }}
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Product</span>
            </button>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input: [ 🔍 Search my products... ] */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="seller-search-my-products-input"
                type="text"
                value={productSearchQuery}
                onChange={(e) => setProductSearchQuery(e.target.value)}
                placeholder="Search my products..."
                className="w-full pl-9 pr-9 py-2 rounded-xl bg-[#F7F5F3] border border-gray-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all"
              />
              {productSearchQuery && (
                <button
                  onClick={() => setProductSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === 'all'
                    ? 'bg-[#8067E8] text-white shadow-xs'
                    : 'bg-[#F7F5F3] text-gray-600 hover:bg-gray-200'
                }`}
              >
                All ({myProducts.length})
              </button>

              <button
                onClick={() => setStatusFilter('published')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'published'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-[#F7F5F3] text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusFilter === 'published' ? 'bg-white' : 'bg-emerald-500'}`} />
                <span>Published ({publishedProducts.length})</span>
              </button>

              <button
                onClick={() => setStatusFilter('hidden')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  statusFilter === 'hidden'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-[#F7F5F3] text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${statusFilter === 'hidden' ? 'bg-white' : 'bg-amber-500'}`} />
                <span>Hidden ({hiddenProducts.length})</span>
              </button>
            </div>

          </div>

          {/* Product List / Cards */}
          {myProducts.length === 0 ? (
            /* 10. EMPTY PRODUCT LIST */
            <div className="text-center py-12 px-4 rounded-3xl bg-[#FAF8FE] border border-dashed border-[#DDD4FF] space-y-3">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-[#DDD4FF] text-[#6C4DE6] flex items-center justify-center shadow-inner">
                <Package className="w-8 h-8" />
              </div>
              <h4 className="font-extrabold text-lg text-[#20243A]">No products yet</h4>
              <p className="text-xs sm:text-sm text-[#737B89] max-w-sm mx-auto">
                Start adding products to your shop. Showcase your local footwear, crafts, and goods to buyers.
              </p>
              <button
                onClick={openAddProductModal}
                className="px-6 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md transition-all cursor-pointer mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product</span>
              </button>
            </div>
          ) : filteredMyProducts.length === 0 ? (
            /* Search / Filter Zero State */
            <div className="text-center py-10 px-4 rounded-3xl bg-[#FAF8FE] border border-gray-100 space-y-3">
              <AlertCircle className="w-10 h-10 text-gray-400 mx-auto" />
              <h4 className="font-bold text-base text-[#20243A]">No matching products</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {productSearchQuery 
                  ? `No products found matching "${productSearchQuery}". Try another keyword or clear search.`
                  : `No products in the "${statusFilter}" category.`}
              </p>
              <div className="flex justify-center gap-2 pt-1">
                {productSearchQuery && (
                  <button
                    onClick={() => setProductSearchQuery('')}
                    className="px-4 py-2 rounded-full bg-white hover:bg-gray-100 text-[#8067E8] border border-[#DDD4FF] text-xs font-bold transition-all cursor-pointer"
                  >
                    Clear Search
                  </button>
                )}
                {statusFilter !== 'all' && (
                  <button
                    onClick={() => setStatusFilter('all')}
                    className="px-4 py-2 rounded-full bg-[#8067E8] text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Show All Products
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredMyProducts.map((p) => {
                const isHidden = p.status === 'hidden';
                const isMenuOpen = openMenuId === p.id;

                return (
                  <div 
                    key={p.id} 
                    className={`py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors rounded-2xl px-2 sm:px-3 ${
                      isHidden ? 'bg-amber-50/40 border border-amber-100/60' : 'hover:bg-[#FAF8FE]'
                    }`}
                  >
                    {/* Left: Image + Info */}
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img loading="lazy" decoding="async" 
                          src={p.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'} 
                          alt={p.name} 
                          className="w-16 h-16 rounded-2xl object-cover ring-1 ring-gray-100" 
                        />
                        {p.images.length > 1 && (
                          <span className="absolute -bottom-1.5 -right-1.5 bg-[#20243A] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-xs">
                            {p.images.length}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h4 className="font-bold text-sm sm:text-base text-[#20243A] truncate">
                            {p.name}
                          </h4>

                          {/* 8. PRODUCT STATUS BADGE */}
                          {isHidden ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                              <span>Hidden</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              <span>Published</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                          {p.price !== undefined && p.price !== null ? (
                            <span className="font-extrabold text-[#20243A] text-sm">
                              ₹{p.price}
                              {p.originalPrice !== undefined && p.originalPrice !== null && p.originalPrice > p.price && (
                                <span className="text-xs text-gray-400 font-normal line-through ml-1.5">
                                  ₹{p.originalPrice}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="font-semibold text-[#8067E8] italic">Contact for price</span>
                          )}

                          <span className="text-gray-300">•</span>
                          <span>{p.images.length} photo{p.images.length > 1 ? 's' : ''}</span>

                          {p.sizes && p.sizes.length > 0 && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>Sizes: {p.sizes.join(', ')}</span>
                            </>
                          )}

                          {p.stockCount !== undefined && p.stockCount !== null && (
                            <>
                              <span className="text-gray-300">•</span>
                              <span>Stock: <strong className="text-emerald-700 font-bold">{p.stockCount}</strong></span>
                            </>
                          )}
                        </div>

                        {p.description && (
                          <p className="text-xs text-gray-400 truncate mt-1 max-w-lg hidden sm:block">
                            {p.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions: [ Edit ] [ More ⋮ ] */}
                    <div className="flex items-center justify-end gap-2 shrink-0 self-end sm:self-center relative">
                      
                      {/* Edit Button */}
                      <button
                        id={`edit-prod-btn-${p.id}`}
                        onClick={() => openEditProductModal(p)}
                        className="px-3.5 py-1.5 text-[#8067E8] hover:bg-[#FAF8FE] active:scale-95 rounded-xl border border-[#DDD4FF] hover:border-[#8067E8] transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs"
                        title="Edit Product and Photos"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* More ⋮ Dropdown Menu */}
                      <div className="relative" ref={isMenuOpen ? menuRef : null}>
                        <button
                          id={`more-menu-btn-${p.id}`}
                          onClick={() => setOpenMenuId(isMenuOpen ? null : p.id)}
                          className="p-1.5 text-gray-500 hover:text-[#20243A] rounded-xl hover:bg-gray-100 border border-gray-200/80 transition-colors cursor-pointer flex items-center justify-center"
                          title="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Dropdown Popover */}
                        {isMenuOpen && (
                          <div 
                            className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
                            style={{
                              boxShadow: '0 12px 28px -4px rgba(32, 36, 58, 0.15)'
                            }}
                          >
                            <button
                              onClick={() => openEditProductModal(p)}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-gray-700 hover:bg-[#FAF8FE] hover:text-[#8067E8] flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
                              <span>Edit Product</span>
                            </button>

                            {/* 4. HIDE / 5. PUBLISH PRODUCT */}
                            {isHidden ? (
                              <button
                                onClick={() => handlePublishProduct(p)}
                                className="w-full px-3.5 py-2 text-left text-xs font-bold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <Eye className="w-4 h-4 text-emerald-600" />
                                <span>Publish Product</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => requestHideProduct(p)}
                                className="w-full px-3.5 py-2 text-left text-xs font-bold text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                              >
                                <EyeOff className="w-4 h-4 text-amber-600" />
                                <span>Hide Product</span>
                              </button>
                            )}

                            <div className="my-1 border-t border-gray-100" />

                            {/* 6. DELETE PRODUCT */}
                            <button
                              onClick={() => requestDeleteProduct(p)}
                              className="w-full px-3.5 py-2 text-left text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                              <span>Delete Product</span>
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-white/90 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-[#20243A]">Orders from Local Buyers</h3>
          <div className="space-y-3">
            {myOrders.map(ord => (
              <div key={ord.id} className="p-4 bg-[#FAF8FE] rounded-2xl border border-[#ECE5FD] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-gray-500">Order #{ord.id}</span>
                  <p className="font-bold text-sm text-[#20243A] mt-0.5">
                    {ord.items.map(i => `${i.quantity}x ${i.product.name}`).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Address: {ord.address || 'Not provided'}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-sm text-[#20243A]">₹{ord.totalAmount}</span>
                  
                  <select
                    value={ord.status}
                    onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-[#20243A] focus:outline-none focus:ring-2 focus:ring-[#8067E8]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="ready_for_pickup">Ready for Pickup</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CUSTOMER INQUIRIES & MESSAGES TAB */}
      {activeTab === 'messages' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-white/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-[#20243A]">Direct Customer Inquiries</h3>
              <p className="text-xs text-[#737B89]">Inquiries from local shoppers exploring your stall</p>
            </div>
            <button
              onClick={() => setIsMessagesOpen(true)}
              className="text-xs font-bold text-[#8067E8] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Open Chat Drawer</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-gray-100">
            {conversations.filter(c => c.shopId === shopId || c.sellerId === currentUser.id).map((conv) => (
              <div 
                key={conv.id}
                onClick={() => {
                  setActiveConversationId(conv.id);
                  setIsMessagesOpen(true);
                }}
                className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#FAF8FE] p-3 rounded-2xl cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <img loading="lazy" decoding="async" 
                    src={conv.buyerAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
                    alt={conv.buyerName || 'Buyer'} 
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#DDD4FF] shrink-0" 
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-[#20243A]">{conv.buyerName || 'Local Buyer'}</h4>
                      {conv.unreadCount > 0 && (
                        <span className="w-2 h-2 rounded-full bg-[#FF6B6B]" />
                      )}
                    </div>
                    <p className="text-xs text-[#505767] truncate mt-0.5 max-w-sm">
                      {conv.lastMessage}
                    </p>
                    {conv.productAttachment && (
                      <span className="text-[10px] text-[#8067E8] font-semibold bg-[#DDD4FF]/50 px-2 py-0.5 rounded-md inline-block mt-1">
                        📦 Discussing: {conv.productAttachment.name}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <span className="text-[11px] text-gray-400 font-medium">{conv.timestamp}</span>
                  <button
                    className="px-3.5 py-1.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. HIDE PRODUCT CONFIRMATION MODAL */}
      {productToHide && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setProductToHide(null);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 shadow-inner">
                <EyeOff className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#20243A]">Hide this product?</h3>
                <p className="text-xs text-gray-500">Temporarily unpublish from your public stall</p>
              </div>
            </div>

            <p className="text-xs text-[#505767] leading-relaxed">
              Hidden products will no longer appear publicly in your shop, category listings, or search results. You can publish it again anytime.
            </p>

            <div className="p-3 rounded-2xl bg-[#FAF8FE] border border-[#DDD4FF] flex items-center gap-3">
              <img loading="lazy" decoding="async" 
                src={productToHide.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'} 
                alt={productToHide.name} 
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-gray-200 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-xs text-[#20243A] truncate">{productToHide.name}</h5>
                <span className="text-[11px] font-extrabold text-[#8067E8]">
                  {productToHide.price ? `₹${productToHide.price}` : 'Price on request'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToHide(null)}
                className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmHideProduct}
                className="px-5 py-2.5 rounded-full bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Hide Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. DELETE PRODUCT CONFIRMATION MODAL */}
      {productToDelete && (
        <div 
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setProductToDelete(null);
          }}
        >
          <div 
            className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 shadow-inner">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#20243A]">Delete Product?</h3>
                <p className="text-xs text-gray-500">Permanent action from your shop catalog</p>
              </div>
            </div>

            <p className="text-xs text-[#505767] leading-relaxed">
              Are you sure you want to permanently delete <strong className="text-[#20243A]">"{productToDelete.name}"</strong>? This will remove the item and all photos from your catalog.
            </p>

            <div className="p-3 rounded-2xl bg-red-50/50 border border-red-100 flex items-center gap-3">
              <img loading="lazy" decoding="async" 
                src={productToDelete.images[0] || 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80'} 
                alt={productToDelete.name} 
                className="w-12 h-12 rounded-xl object-cover ring-1 ring-gray-200 shrink-0" 
              />
              <div className="min-w-0 flex-1">
                <h5 className="font-bold text-xs text-[#20243A] truncate">{productToDelete.name}</h5>
                <span className="text-[11px] font-extrabold text-red-600">
                  {productToDelete.price ? `₹${productToDelete.price}` : 'Price on request'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Product</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      <AddEditProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        editingProduct={editingProduct}
        defaultShopId={shopId}
        defaultShopName={currentUser.shopName || 'Aminul Slipper Shop'}
      />

    </div>
  );
};

