/**
 * Media library API client functions.
 * Connects directly to existing Express backend endpoints.
 */

import { apiRequest } from './client';
import type { MediaItem, ApiSuccess } from '@/types/api';

export async function fetchMedia(options: {
  page?: number;
  limit?: number;
  folder?: 'products' | 'categories';
} = {}): Promise<ApiSuccess<MediaItem[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.folder) params.set('folder', options.folder);

  const query = params.toString() ? `?${params.toString()}` : '';
  return apiRequest<MediaItem[]>(`/api/admin/media${query}`);
}

export async function uploadMedia(formData: FormData): Promise<MediaItem[]> {
  const res = await apiRequest<{ media: MediaItem[] }>('/api/admin/media/upload', {
    method: 'POST',
    body: formData,
  });
  return res.data.media;
}

export async function deleteMedia(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/admin/media/${id}`, {
    method: 'DELETE',
  });
}

