/**
 * Yumnest Product Image Normalization & Sizing Utility
 * 
 * Ensures all product images across the website appear consistently sized,
 * properly aligned, visually balanced, and maximally visible within their containers.
 * 
 * - Trims excess blank/transparent margins from Cloudinary images (e_trim)
 * - Automatically injects modern f_auto and q_auto parameters for WebP/AVIF delivery
 * - Supports responsive widths (w_limit) to prevent oversized payloads on mobile
 * - Preserves aspect ratio without stretching or cropping
 */

export interface ProductImageOptions {
  trim?: boolean;
  format?: 'auto' | 'png' | 'webp';
  width?: number;
  quality?: 'auto' | number;
}

export function getConsistentProductImageUrl(
  url?: string | null,
  options?: ProductImageOptions
): string {
  if (!url || typeof url !== 'string') {
    return '/assets/placeholder-product.png';
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return '/assets/placeholder-product.png';
  }

  // Handle Cloudinary URLs: apply f_auto, q_auto, e_trim and optional responsive width
  if (trimmed.includes('res.cloudinary.com') && trimmed.includes('/image/upload/')) {
    const [base, rest] = trimmed.split('/image/upload/');
    if (base && rest) {
      const segments = rest.split('/');
      let transformSegment = '';
      let assetPath = rest;

      // Check if the first segment is already a transformation segment (e.g., e_trim, w_500, etc.)
      // Cloudinary version directory starts with 'v' followed by digits (e.g. v1794389417)
      if (segments[0] && !/^v\d+$/.test(segments[0])) {
        transformSegment = segments[0];
        assetPath = segments.slice(1).join('/');
      }

      // Build consolidated transformation parameters
      const params = new Set<string>();
      if (transformSegment) {
        transformSegment.split(',').forEach((p) => {
          const cleanParam = p.trim();
          if (cleanParam) params.add(cleanParam);
        });
      }

      // 1. Automatic format selection (AVIF / WebP depending on browser support)
      params.add('f_auto');

      // 2. Perceptually lossless quality compression
      params.add('q_auto');

      // 3. Margin trimming unless explicitly disabled
      if (options?.trim !== false) {
        params.add('e_trim');
      }

      // 4. Responsive width limit if requested
      if (options?.width) {
        Array.from(params).forEach((p) => {
          if (p.startsWith('w_') || p.startsWith('c_')) params.delete(p);
        });
        params.add(`w_${options.width}`);
        params.add('c_limit');
      }

      const joinedParams = Array.from(params).join(',');
      return `${base}/image/upload/${joinedParams}/${assetPath}`;
    }
  }

  return trimmed;
}

/**
 * Generates a responsive srcset string for Cloudinary images.
 */
export function getCloudinarySrcSet(
  url?: string | null,
  widths: number[] = [260, 420, 600]
): string | undefined {
  if (!url || !url.includes('res.cloudinary.com')) return undefined;
  return widths
    .map((w) => `${getConsistentProductImageUrl(url, { width: w })} ${w}w`)
    .join(', ');
}
