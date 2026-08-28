import React, { useState, useEffect } from 'react';
import { X, Sparkles, Plus, PackageCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Product, ProductImageItem } from '../types';
import { ProductPhotoUploader } from './ProductPhotoUploader';
import { stringListToImageItems, imageItemsToStringList } from '../utils/imageOptimizer';

interface AddEditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct?: Product | null;
  defaultShopId?: string;
  defaultShopName?: string;
  defaultMarketId?: string;
  defaultMarketName?: string;
}

export const AddEditProductModal: React.FC<AddEditProductModalProps> = ({
  isOpen,
  onClose,
  editingProduct,
  defaultShopId,
  defaultShopName,
  defaultMarketId,
  defaultMarketName,
}) => {
  const { currentUser, updateProduct, createProduct, showToast, categories } = useApp();

  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [origPrice, setOrigPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');
  const [sizes, setSizes] = useState('');
  const [desc, setDesc] = useState('');
  const [productImages, setProductImages] = useState<ProductImageItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (editingProduct) {
        setTitle(editingProduct.name || '');
        setPrice(editingProduct.price !== undefined && editingProduct.price !== null ? String(editingProduct.price) : '');
        setOrigPrice(editingProduct.originalPrice !== undefined && editingProduct.originalPrice !== null ? String(editingProduct.originalPrice) : '');
        setStock(editingProduct.stockCount !== undefined && editingProduct.stockCount !== null ? String(editingProduct.stockCount) : '');
        setCategory(editingProduct.categoryId || '');
        setSizes(editingProduct.sizes && editingProduct.sizes.length > 0 ? editingProduct.sizes.join(', ') : '');
        setDesc(editingProduct.description || '');
        setProductImages(stringListToImageItems(editingProduct.images || []));
      } else {
        setTitle('');
        setPrice('');
        setOrigPrice('');
        setStock('');
        setCategory('');
        setSizes('');
        setDesc('');
        setProductImages([]);
      }
    }
  }, [isOpen, editingProduct]);

  if (!isOpen) return null;

  const targetShopId = defaultShopId || currentUser.shopId || 'shop_aminul';
  const targetShopName = defaultShopName || currentUser.shopName || 'Aminul Slipper Shop';
  const targetMarketId = defaultMarketId || 'mkt_kachumara';
  const targetMarketName = defaultMarketName || 'Kachumara Market';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mandatory requirement: At least one photo
    if (productImages.length === 0) {
      showToast('Add at least one product photo.', 'error');
      return;
    }

    // 2. Mandatory requirement: Product name
    if (!title.trim()) {
      showToast('Product name is required.', 'error');
      return;
    }

    // Extract list of URLs (with primary photo as index 0)
    const finalImages = imageItemsToStringList(productImages);

    // Optional fields handling - preserve as undefined/omitted if empty
    const parsedPrice = price.trim() !== '' ? Number(price) : undefined;
    const parsedOrigPrice = origPrice.trim() !== '' ? Number(origPrice) : undefined;
    const parsedStock = stock.trim() !== '' ? Number(stock) : undefined;
    const parsedSizes = sizes.trim() !== '' 
      ? sizes.split(',').map(s => s.trim()).filter(Boolean) 
      : undefined;
    const parsedDesc = desc.trim() !== '' ? desc.trim() : undefined;

    let categoryIdVal: string | undefined = undefined;
    let categoryNameVal: string | undefined = undefined;
    if (category.trim() !== '') {
      categoryIdVal = category.trim();
      const matchedCategory = categories.find(c => c.id === categoryIdVal);
      categoryNameVal = matchedCategory ? matchedCategory.name : undefined;
    }

    if (editingProduct) {
      // Update existing product
      updateProduct(editingProduct.id, {
        name: title.trim(),
        price: parsedPrice,
        originalPrice: parsedOrigPrice,
        categoryId: categoryIdVal,
        categoryName: categoryNameVal,
        images: finalImages,
        description: parsedDesc,
        stockCount: parsedStock,
        inStock: parsedStock !== undefined ? parsedStock > 0 : undefined,
        sizes: parsedSizes,
        status: editingProduct.status || 'published',
      });

      onClose();
      showToast('✓ Product updated successfully', 'success');
    } else {
      // Create new product through the centralized context action.
      createProduct({
        name: title.trim(),
        shopId: targetShopId,
        shopName: targetShopName,
        marketId: targetMarketId,
        marketName: targetMarketName,
        images: finalImages,
        price: parsedPrice,
        originalPrice: parsedOrigPrice,
        categoryId: categoryIdVal,
        categoryName: categoryNameVal,
        description: parsedDesc,
        inStock: parsedStock !== undefined ? parsedStock > 0 : undefined,
        stockCount: parsedStock,
        sizes: parsedSizes,
      });
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-gray-100 my-auto animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
        style={{
          boxShadow: '0 20px 40px -15px rgba(32, 36, 58, 0.2), 0 0 0 1px rgba(128, 103, 232, 0.08)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-extrabold text-lg sm:text-xl text-[#20243A]">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <p className="text-xs text-[#737B89] mt-0.5">
              {editingProduct ? 'Update product details & photos for your shop' : 'Upload photos and list a new product for local buyers'}
            </p>
          </div>
          <button 
            id="close-product-modal-btn"
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-[#FAF8FE] text-gray-400 hover:text-[#20243A] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Photo Uploader Section (Required: At least 1 photo) */}
          <div className="p-4 bg-[#FAF8FE]/90 rounded-2xl border border-[#DDD4FF]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#20243A] flex items-center gap-1.5">
                Product Photos <span className="text-[#8067E8] font-black">*</span>
              </span>
              <span className="text-[11px] text-[#737B89]">Required (Max 8 photos)</span>
            </div>
            <ProductPhotoUploader 
              images={productImages}
              onChange={setProductImages}
              onErrorToast={showToast}
            />
          </div>

          {/* Product Name (Required) */}
          <div>
            <label className="text-xs font-bold text-[#20243A] block mb-1">
              Product Name <span className="text-[#8067E8] font-black">*</span>
            </label>
            <input
              type="text"
              required
              id="seller-product-title-input"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Handmade Leather Comfort Slipper"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all"
            />
          </div>

          {/* Pricing Row (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#20243A] block mb-1">
                Selling Price (₹) <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
              </label>
              <input
                type="number"
                id="seller-product-price-input"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="e.g. 299"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#20243A] block mb-1">
                Original MRP (₹) <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
              </label>
              <input
                type="number"
                id="seller-product-origprice-input"
                value={origPrice}
                onChange={e => setOrigPrice(e.target.value)}
                placeholder="e.g. 499"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all"
              />
            </div>
          </div>

          {/* Category & Stock (Optional) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#20243A] block mb-1">
                Category <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
              </label>
              <select
                id="seller-product-category-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all"
              >
                <option value="">Select Category (Optional)</option>
                <option value="cat_slippers">Slippers & Footwear</option>
                <option value="cat_clothes">Traditional Clothes & Handloom</option>
                <option value="cat_produce">Fresh Vegetables & Fruits</option>
                <option value="cat_spices">Local Spices & Grains</option>
                <option value="cat_crafts">Bamboo & Cane Crafts</option>
                <option value="cat_fish">Local Fishery</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#20243A] block mb-1">
                Stock Quantity <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
              </label>
              <input
                type="number"
                id="seller-product-stock-input"
                value={stock}
                onChange={e => setStock(e.target.value)}
                placeholder="20"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all"
              />
            </div>
          </div>

          {/* Sizes / Variants (Optional) */}
          <div>
            <label className="text-xs font-bold text-[#20243A] block mb-1">
              Available Sizes / Variants <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
            </label>
            <input
              type="text"
              id="seller-product-sizes-input"
              value={sizes}
              onChange={e => setSizes(e.target.value)}
              placeholder="e.g. 6, 7, 8, 9, 10 or S, M, L, XL"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all"
            />
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="text-xs font-bold text-[#20243A] block mb-1">
              Product Description <span className="text-gray-400 font-normal text-[11px]">(optional)</span>
            </label>
            <textarea
              rows={2}
              id="seller-product-desc-input"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Handcrafted authentic local craftsmanship with genuine quality guarantee..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F3] border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#8067E8] transition-all resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors cursor-pointer rounded-full hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="seller-publish-product-btn"
              className="px-6 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
              style={{
                boxShadow: '0 4px 14px rgba(128, 103, 232, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)'
              }}
            >
              <PackageCheck className="w-4 h-4" />
              <span>{editingProduct ? 'Save Changes' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
