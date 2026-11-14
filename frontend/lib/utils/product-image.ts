/**
 * Yumnest Product Image Normalization & Sizing Utility
 * 
 * Ensures all product images across the website appear consistently sized,
 * properly aligned, visually balanced, and maximally visible within their containers.
 * 
 * - Trims excess blank/transparent margins from Cloudinary images (e_trim)
 * - Automatically supports square, portrait, and landscape packaging
 * - Preserves aspect ratio without stretching or cropping
 */

export function getConsistentProductImageUrl(
  url?: string | null,
  options?: {
    trim?: boolean;
    format?: 'auto' | 'png' | 'webp';
  }
): string {
  if (!url || typeof url !== 'string') {
    return '/assets/placeholder-product.png';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '/assets/placeholder-product.png';
  }

  // Handle Cloudinary URLs: ensure e_trim is present to trim unnecessary blank/transparent margins
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    if (!trimmed.includes('e_trim')) {
      return trimmed.replace('/image/upload/', '/image/upload/e_trim/');
    }
  }

  return trimmed;
}
