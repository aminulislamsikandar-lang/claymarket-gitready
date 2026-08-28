import React, { useRef, useState } from 'react';
import { 
  Camera, Image as ImageIcon, X, Star, ArrowLeft, 
  ArrowRight, UploadCloud, AlertCircle, Loader2, Plus 
} from 'lucide-react';
import { ProductImageItem } from '../types';
import { 
  validateImageFile, optimizeImageFile, MAX_PRODUCT_PHOTOS 
} from '../utils/imageOptimizer';

interface ProductPhotoUploaderProps {
  images: ProductImageItem[];
  onChange: (images: ProductImageItem[]) => void;
  onErrorToast?: (msg: string, type: 'error' | 'info' | 'warning' | 'success') => void;
}

export const ProductPhotoUploader: React.FC<ProductPhotoUploaderProps> = ({
  images,
  onChange,
  onErrorToast,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const notify = (msg: string, type: 'error' | 'info' | 'warning' | 'success' = 'error') => {
    if (onErrorToast) {
      onErrorToast(msg, type);
    } else {
      alert(msg);
    }
  };

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    const availableSlots = MAX_PRODUCT_PHOTOS - images.length;

    if (availableSlots <= 0) {
      notify(`Maximum limit reached (${MAX_PRODUCT_PHOTOS} photos per product).`, 'warning');
      return;
    }

    if (files.length > availableSlots) {
      notify(`Only ${availableSlots} more photo${availableSlots > 1 ? 's' : ''} can be added (Max ${MAX_PRODUCT_PHOTOS}).`, 'warning');
    }

    const filesToProcess = files.slice(0, availableSlots);
    setIsProcessing(true);

    const newItems: ProductImageItem[] = [];

    for (const file of filesToProcess) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        notify(validation.error || 'Invalid image file.', 'error');
        continue;
      }

      try {
        const optimizedDataUrl = await optimizeImageFile(file);
        newItems.push({
          id: `img_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          url: optimizedDataUrl,
          isPrimary: images.length === 0 && newItems.length === 0, // First photo is primary by default
        });
      } catch (err) {
        notify(`Failed to process "${file.name}". Please try another image.`, 'error');
      }
    }

    setIsProcessing(false);

    if (newItems.length > 0) {
      const updated = [...images, ...newItems];
      // Ensure exactly one primary image
      if (!updated.some(item => item.isPrimary)) {
        updated[0].isPrimary = true;
      }
      onChange(updated);
      notify(`Added ${newItems.length} photo${newItems.length > 1 ? 's' : ''}!`, 'success');
    }

    // Reset file input values so the same file can be re-selected if needed
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleRemove = (idToRemove: string) => {
    const remaining = images.filter(img => img.id !== idToRemove);
    // If we removed the primary image, make the first remaining image primary
    if (remaining.length > 0 && !remaining.some(img => img.isPrimary)) {
      remaining[0].isPrimary = true;
    }
    onChange(remaining);
  };

  const handleSetPrimary = (idToMakePrimary: string) => {
    const updated = images.map(img => ({
      ...img,
      isPrimary: img.id === idToMakePrimary,
    }));
    onChange(updated);
    notify('Main display photo updated!', 'info');
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newArr = [...images];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // If first item changed, automatically keep primary alignment or maintain flag
    onChange(newArr);
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      {/* Hidden File Inputs */}
      {/* Native Camera input with capture="environment" for back camera on smartphones */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        className="hidden"
        id="camera-photo-input"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Gallery / File Picker input with multiple selection */}
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/jpeg,image/jpg,image/png,image/webp,image/*"
        multiple
        className="hidden"
        id="gallery-photo-input"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {/* Header & Photo Count Badge */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-[#20243A] block">
            Product Photos
          </label>
          <span className="text-[11px] text-[#737B89]">
            Add up to {MAX_PRODUCT_PHOTOS} photos (JPG, PNG, WEBP max 5MB each)
          </span>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
          images.length >= MAX_PRODUCT_PHOTOS 
            ? 'bg-amber-100 text-amber-800' 
            : 'bg-[#FAF8FE] text-[#8067E8] border border-[#DDD4FF]'
        }`}>
          {images.length} / {MAX_PRODUCT_PHOTOS} Photos
        </span>
      </div>

      {/* Upload Action Buttons: 📷 Take Photo + 🖼️ Choose from Gallery */}
      {images.length < MAX_PRODUCT_PHOTOS && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* TAKE PHOTO BUTTON */}
          <button
            type="button"
            id="seller-take-photo-btn"
            disabled={isProcessing}
            onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-[#FAF8FE] hover:bg-[#F1EDFD] active:scale-98 text-[#6C4DE6] border border-[#DDD4FF] rounded-2xl font-bold text-xs shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-white text-[#8067E8] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[#20243A] font-extrabold text-xs">Take Photo</span>
              <span className="text-[10px] text-[#8067E8] font-medium">Use device camera</span>
            </div>
          </button>

          {/* CHOOSE FROM GALLERY BUTTON */}
          <button
            type="button"
            id="seller-gallery-upload-btn"
            disabled={isProcessing}
            onClick={() => galleryInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-gray-50 active:scale-98 text-[#20243A] border border-gray-200/90 rounded-2xl font-bold text-xs shadow-xs transition-all cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#FAF8FE] text-[#8067E8] flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="block text-[#20243A] font-extrabold text-xs">Choose from Gallery</span>
              <span className="text-[10px] text-gray-500 font-medium">Select multiple images</span>
            </div>
          </button>
        </div>
      )}

      {/* Desktop Drag and Drop Dropzone (when empty or on desktop) */}
      {images.length === 0 && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => galleryInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
            isDragging 
              ? 'border-[#8067E8] bg-[#FAF8FE]' 
              : 'border-gray-200 bg-[#FBFBFA] hover:bg-[#FAF8FE] hover:border-[#DDD4FF]'
          }`}
        >
          <UploadCloud className="w-8 h-8 text-[#8067E8] mx-auto mb-2 opacity-80" />
          <p className="text-xs font-bold text-[#20243A]">
            Drag & drop product images here, or tap to browse
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Supports High-res camera photos, JPG, JPEG, PNG, WEBP (Up to 5MB each)
          </p>
        </div>
      )}

      {/* Loading state indicator */}
      {isProcessing && (
        <div className="flex items-center justify-center gap-2 p-3 bg-[#FAF8FE] border border-[#DDD4FF] rounded-2xl text-xs font-bold text-[#8067E8] animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Optimizing and preparing photo preview...</span>
        </div>
      )}

      {/* Photos Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {images.map((img, index) => {
              const isMain = img.isPrimary || index === 0;

              return (
                <div
                  key={img.id}
                  className={`relative group rounded-2xl overflow-hidden bg-gray-100 border-2 transition-all shadow-xs aspect-square flex flex-col justify-between p-1.5 ${
                    isMain 
                      ? 'border-[#8067E8] ring-2 ring-[#8067E8]/20 bg-[#FAF8FE]' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {/* Photo image */}
                  <img loading="lazy" decoding="async"
                    src={img.url}
                    alt={`Product photo ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />

                  {/* Top Bar: Main Badge & Remove Button */}
                  <div className="relative z-10 flex items-center justify-between gap-1 w-full">
                    {isMain ? (
                      <span className="px-2 py-0.5 bg-[#8067E8] text-white text-[10px] font-extrabold rounded-md shadow-md flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        <span>MAIN</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(img.id);
                        }}
                        title="Set as Main Product Photo"
                        className="px-2 py-0.5 bg-black/60 hover:bg-[#8067E8] text-white text-[10px] font-bold rounded-md backdrop-blur-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Star className="w-2.5 h-2.5" />
                        <span>Set Main</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(img.id);
                      }}
                      title="Remove Photo"
                      className="w-6 h-6 rounded-full bg-black/60 hover:bg-red-500 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Bottom Bar: Reorder Controls (Move Left / Move Right) */}
                  <div className="relative z-10 flex items-center justify-between gap-1 w-full bg-black/50 backdrop-blur-xs p-1 rounded-lg mt-auto opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'left');
                      }}
                      title="Move Left"
                      className="p-1 text-white disabled:opacity-30 hover:bg-white/20 rounded cursor-pointer transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3" />
                    </button>

                    <span className="text-[10px] text-white font-bold">
                      #{index + 1}
                    </span>

                    <button
                      type="button"
                      disabled={index === images.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMove(index, 'right');
                      }}
                      title="Move Right"
                      className="p-1 text-white disabled:opacity-30 hover:bg-white/20 rounded cursor-pointer transition-colors"
                    >
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Quick Add more thumbnail slot if not reached limit */}
            {images.length < MAX_PRODUCT_PHOTOS && (
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#8067E8] bg-[#FAF8FE]/50 hover:bg-[#FAF8FE] flex flex-col items-center justify-center gap-1 text-gray-500 hover:text-[#8067E8] transition-all aspect-square cursor-pointer"
              >
                <Plus className="w-6 h-6" />
                <span className="text-[10px] font-bold">Add Photo</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
