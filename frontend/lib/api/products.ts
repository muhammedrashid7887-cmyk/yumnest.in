/**
 * Product management API client functions.
 * Connects directly to existing Express backend endpoints.
 */

import { apiRequest } from './client';
import type { AdminProduct, ProductInput, ProductUpdateInput, ApiSuccess } from '@/types/api';

export async function fetchProducts(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: string;
} = {}): Promise<ApiSuccess<AdminProduct[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search?.trim()) params.set('search', options.search.trim());
  if (options.category) params.set('category', options.category);
  if (options.isActive !== undefined) params.set('isActive', String(options.isActive));
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

export async function archiveProduct(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/admin/products/${id}`, {
    method: 'DELETE',
  });
}

