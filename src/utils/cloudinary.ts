// Uploads images to Cloudinary using an unsigned upload preset, so the app
// never needs Firebase Storage (which requires the paid Blaze plan).
// Configure VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in
// your .env file — see .env.example.

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();

export const cloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

if (!cloudinaryConfigured && import.meta.env.DEV) {
  console.warn(
    'Claymarket Cloudinary is not configured. Missing VITE_CLOUDINARY_CLOUD_NAME and/or VITE_CLOUDINARY_UPLOAD_PRESET.',
  );
}

/**
 * Uploads a File or Blob to Cloudinary and returns its public HTTPS URL.
 * `folder` groups uploads in the Cloudinary media library (e.g. "shops/abc123").
 */
export async function uploadToCloudinary(file: File | Blob, folder: string): Promise<string> {
  if (!cloudinaryConfigured) {
    throw new Error('Image hosting is not configured. Set up Cloudinary (see .env.example) before uploading photos.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET as string);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    let message = 'Image upload failed. Please try again.';
    try {
      const errorBody = await response.json();
      if (errorBody?.error?.message) message = errorBody.error.message;
    } catch {
      // ignore parse errors, use default message
    }
    throw new Error(message);
  }

  const data = await response.json();
  if (!data.secure_url) {
    throw new Error('Image upload succeeded but no URL was returned.');
  }
  return data.secure_url as string;
}
