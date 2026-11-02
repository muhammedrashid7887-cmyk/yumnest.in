/**
 * Category management API client functions.
 * Connects directly to existing Express backend endpoints.
 */

import { apiRequest } from './client';
import type { CategoryItem, CategoryInput, ApiSuccess } from '@/types/api';

export async function fetchCategories(options: {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
} = {}): Promise<ApiSuccess<CategoryItem[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search?.trim()) params.set('search', options.search.trim());
  if (options.isActive !== undefined) params.set('isActive', String(options.isActive));

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<CategoryItem[]>(`/api/admin/categories${query}`);
}

export async function createCategory(input: CategoryInput): Promise<CategoryItem> {
  const res = await apiRequest<{ category: CategoryItem }>('/api/admin/categories', {
    method: 'POST',
    body: input,
  });
  return res.data.category;
}

export async function updateCategory(id: string, input: Partial<CategoryInput>): Promise<CategoryItem> {
  const res = await apiRequest<{ category: CategoryItem }>(`/api/admin/categories/${id}`, {
    method: 'PATCH',
    body: input,
  });
  return res.data.category;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

