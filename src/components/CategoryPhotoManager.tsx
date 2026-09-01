import React, { useEffect, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ShopProductCategory } from '../types';
import { firebaseDb } from '../firebase';
import { uploadToCloudinary } from '../utils/cloudinary';
import { validateImageFile } from '../utils/imageOptimizer';
import { useApp } from '../context/AppContext';

type CategoryWithPhotos = ShopProductCategory & { images?: string[] };

interface Props {
  isOpen: boolean;
  shopId: string;
  category: CategoryWithPhotos | null;
  onClose: () => void;
  onUpdated: (categoryId: string, images: string[]) => void;
}

export const CategoryPhotoManager: React.FC<Props> = ({ isOpen, shopId, category, onClose, onUpdated }) => {
  const { currentUser, showToast } = useApp();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && category) setImages(Array.isArray(category.images) ? category.images : []);
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const isOwnerSeller = currentUser.role === 'seller' && currentUser.shopId === shopId;
  if (!isOwnerSeller) return null;

  const saveImages = async (nextImages: string[]) => {
    if (!firebaseDb) throw new Error('Firebase is not fully configured.');
    const targetShopRef = doc(firebaseDb, 'shops', shopId);
    const shopSnap = await getDoc(targetShopRef);
    if (!shopSnap.exists()) throw new Error('Shop not found.');
    const data = shopSnap.data() as { productCategories?: CategoryWithPhotos[] };
    const currentCategories = Array.isArray(data.productCategories) ? data.productCategories : [];
    if (!currentCategories.some(item => item.id === category.id)) throw new Error('Category not found.');
    const nextCategories = currentCategories.map(item => item.id === category.id ? { ...item, images: nextImages } : item);
    await updateDoc(targetShopRef, { productCategories: nextCategories, updatedAt: serverTimestamp() });
    setImages(nextImages);
    onUpdated(category.id, nextImages);
  };

  const handleFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const validation = validateImageFile(file);
        if (!validation.valid) throw new Error(validation.error || 'Invalid image file.');
        uploaded.push(await uploadToCloudinary(file, `shops/${shopId}/categories/${category.id}`));
      }
      await saveImages([...images, ...uploaded]);
      showToast(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} added to ${category.name}.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to add category photos.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (index: number) => {
    if (!window.confirm(`Delete this photo from ${category.name}?`)) return;
    setDeletingIndex(index);
    try {
      await saveImages(images.filter((_, i) => i !== index));
      showToast('Category photo removed.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to remove category photo.', 'error');
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl p-5 sm:p-7" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#20243A]">{category.name}</h2>
            <p className="text-sm text-[#737B89] mt-1">Manage photos for this category</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-[#F1EDFD] text-[#553BB8] hover:bg-[#DDD4FF] cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex items-center justify-between gap-3 mb-5">
          <span className="text-xs font-bold text-[#737B89]">{images.length} photo{images.length === 1 ? '' : 's'}</span>
          <>
            <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" onChange={handleFiles} />
            <button onClick={() => inputRef.current?.click()} disabled={uploading} className="px-4 py-2.5 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white font-bold text-sm flex items-center gap-2 shadow-md cursor-pointer disabled:opacity-60">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
              {uploading ? 'Uploading...' : 'Add Photos'}
            </button>
          </>
        </div>

        {images.length === 0 ? (
          <div className="border-2 border-dashed border-[#DDD4FF] rounded-3xl py-16 text-center bg-[#FAF8FE]">
            <Camera className="w-10 h-10 mx-auto text-[#8067E8] mb-3" />
            <h3 className="font-bold text-[#20243A]">No photos yet</h3>
            <p className="text-sm text-[#737B89] mt-1">Add photos of {category.name.toLowerCase()} items.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={`${image}-${index}`} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group">
                <img src={image} alt={`${category.name} ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                <button onClick={() => void handleDelete(index)} disabled={deletingIndex === index} title="Delete photo" aria-label={`Delete photo ${index + 1}`} className="absolute top-2 right-2 p-2 rounded-full bg-white/95 text-red-500 hover:bg-red-500 hover:text-white shadow-md cursor-pointer disabled:opacity-60">
                  {deletingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full bg-[#F1EDFD] hover:bg-[#DDD4FF] text-[#553BB8] font-bold text-sm cursor-pointer">Done</button>
        </div>
      </div>
    </div>
  );
};
