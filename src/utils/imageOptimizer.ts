import { ProductImageItem } from '../types';

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PRODUCT_PHOTOS = 8;

/**
 * Validates file type and size
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Validate extension/MIME
  const isTypeValid = ALLOWED_TYPES.includes(file.type.toLowerCase()) || 
    /\.(jpg|jpeg|png|webp)$/i.test(file.name);

  if (!isTypeValid) {
    return {
      valid: false,
      error: `"${file.name}" is not a supported format. Please select JPG, JPEG, PNG, or WEBP images.`,
    };
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `"${file.name}" is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Each image must be 5 MB or smaller.`,
    };
  }

  return { valid: true };
}

/**
 * Compresses and scales image to high-fidelity web format (~1200px max, 0.85 quality)
 * to maintain crisp details for product display while being lightweight in state/storage.
 */
export async function optimizeImageFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        const maxDim = 1280;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image on canvas with smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Export as WebP or JPEG
        const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(outputType, 0.85);
        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to read image file'));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to load file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Converts array of raw strings (URLs or base64) to ProductImageItem objects
 */
export function stringListToImageItems(images: string[]): ProductImageItem[] {
  if (!images || images.length === 0) return [];
  return images.map((url, index) => ({
    id: `img_${index}_${Math.random().toString(36).substring(2, 7)}`,
    url,
    isPrimary: index === 0,
  }));
}

/**
 * Converts ProductImageItem objects back to string[] URL list with primary photo first
 */
export function imageItemsToStringList(items: ProductImageItem[]): string[] {
  if (!items || items.length === 0) return [];
  
  // Sort so primary is always first
  const sorted = [...items].sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    return 0;
  });

  return sorted.map(item => item.url);
}
