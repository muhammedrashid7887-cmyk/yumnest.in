/**
 * Product management API client functions.
 * Connects directly to existing Express backend endpoints.
 */

import { apiRequest } from './client';
import type { AdminProduct, ProductInput, ProductUpdateInput, ProductVariantUpdateInput, ApiSuccess } from '@/types/api';

export async function fetchProducts(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  isArchived?: boolean;
  sortBy?: string;
  sortOrder?: string;
} = {}): Promise<ApiSuccess<AdminProduct[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search?.trim()) params.set('search', options.search.trim());
  if (options.category) params.set('category', options.category);
  if (options.isActive !== undefined) params.set('isActive', String(options.isActive));
  if (options.isArchived !== undefined) params.set('isArchived', String(options.isArchived));
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.sortOrder) params.set('sortOrder', options.sortOrder);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<AdminProduct[]>(`/api/admin/products${query}`);
}

export async function createProduct(input: ProductInput): Promise<AdminProduct> {
  const res = await apiRequest<{ product: AdminProduct }>('/api/admin/products', {
    method: 'POST',
    body: input,
  });
  return res.data.product;
}

export async function updateProduct(id: string, input: ProductUpdateInput): Promise<AdminProduct> {
  const res = await apiRequest<{ product: AdminProduct }>(`/api/admin/products/${id}`, {
    method: 'PATCH',
    body: input,
  });
  return res.data.product;
}

export async function deleteProduct(id: string, permanent = false): Promise<void> {
  const query = permanent ? '?permanent=true' : '';
  await apiRequest<{ deleted: boolean; permanent?: boolean }>(`/api/admin/products/${id}${query}`, {
    method: 'DELETE',
  });
}

export async function archiveProduct(id: string): Promise<AdminProduct> {
  const res = await apiRequest<{ product: AdminProduct }>(`/api/admin/products/${id}/archive`, {
    method: 'POST',
  });
  return res.data.product;
}

export async function restoreProduct(id: string): Promise<AdminProduct> {
  const res = await apiRequest<{ product: AdminProduct }>(`/api/admin/products/${id}/restore`, {
    method: 'POST',
  });
  return res.data.product;
}

export async function updateProductStatus(id: string, isActive: boolean): Promise<AdminProduct> {
  const res = await apiRequest<{ product: AdminProduct }>(`/api/admin/products/${id}/status`, {
    method: 'PATCH',
    body: { isActive },
  });
  return res.data.product;
}

export async function uploadProductImage(formData: FormData): Promise<{
  url: string;
  secureUrl: string;
  publicId?: string;
  mediaId?: string;
  width?: number;
  height?: number;
  format?: string;
}> {
  const res = await apiRequest<{
    image: {
      _id?: string;
      url?: string;
      secureUrl?: string;
      publicId?: string;
      width?: number;
      height?: number;
      format?: string;
    };
  }>('/api/admin/products/upload-image', {
    method: 'POST',
    body: formData,
  });
  const img = res.data.image;
  return {
    url: img.secureUrl || img.url || '',
    secureUrl: img.secureUrl || img.url || '',
    publicId: img.publicId,
    mediaId: img._id,
    width: img.width,
    height: img.height,
    format: img.format,
  };
}

