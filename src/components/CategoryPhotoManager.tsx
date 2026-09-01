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
    <div className="fixed inset-0 z-[100] h-screen w-screen bg-white" role="dialog" aria-modal="true" aria-label={`${category.name} photo manager`}>
      <div className="h-full w-full overflow-y-auto overscroll-contain">
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-[#EEEAF7]">
          <div className="w-full px-5 py-4 sm:px-8 sm:py-5 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#20243A] truncate">{category.name}</h2>
              <p className="text-sm text-[#737B89] mt-1">Manage photos for this category</p>
            </div>
            <button onClick={onClose} className="shrink-0 p-2.5 rounded-full bg-[#F1EDFD] text-[#553BB8] hover:bg-[#DDD4FF] cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <main className="w-full px-5 py-6 sm:px-8 sm:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <span className="text-sm font-bold text-[#20243A]">{images.length} photo{images.length === 1 ? '' : 's'}</span>
              <p className="text-sm text-[#737B89] mt-1">Add or remove photos for {category.name}.</p>
            </div>
            <div>
              <input ref={inputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" multiple className="hidden" onChange={handleFiles} />
              <button onClick={() => inputRef.current?.click()} disabled={uploading} className="px-5 py-3 rounded-full bg-[#8067E8] hover:bg-[#6E52E2] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImagePlus className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Add Photos'}
              </button>
            </div>
          </div>

          {images.length === 0 ? (
            <div className="min-h-[55vh] border-2 border-dashed border-[#DDD4FF] rounded-3xl flex flex-col items-center justify-center text-center bg-[#FAF8FE] px-6 py-16">
              <Camera className="w-12 h-12 text-[#8067E8] mb-4" />
              <h3 className="text-lg font-bold text-[#20243A]">No photos yet</h3>
              <p className="text-sm text-[#737B89] mt-1">Add photos of {category.name.toLowerCase()} items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5 pb-8">
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group shadow-sm">
                  <img src={image} alt={`${category.name} ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  <button onClick={() => void handleDelete(index)} disabled={deletingIndex === index} title="Delete photo" aria-label={`Delete photo ${index + 1}`} className="absolute top-3 right-3 p-2.5 rounded-full bg-white/95 text-red-500 hover:bg-red-500 hover:text-white shadow-md cursor-pointer disabled:opacity-60">
                    {deletingIndex === index ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>

        <div className="border-t border-[#EEEAF7] bg-white px-5 py-5 sm:px-8 sm:py-6 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 rounded-full bg-[#F1EDFD] hover:bg-[#DDD4FF] text-[#553BB8] font-bold text-sm cursor-pointer">Done</button>
        </div>
      </div>
    </div>
  );
};
