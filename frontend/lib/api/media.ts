/**
 * Media library and Media Management API client functions.
 * Connects directly to existing Express backend endpoints.
 */

import { apiRequest } from './client';
import type {
  AdminMediaItem,
  MediaItemInput,
  MediaItemUpdateInput,
  MediaStatus,
  StorefrontMediaItem,
  MediaItem,
  MediaMetadataResult,
  ApiSuccess,
} from '@/types/api';

// ─── Admin Media Management (YouTube & Instagram) ───────────────────────────

export async function fetchAdminMediaItems(options: {
  page?: number;
  limit?: number;
  platform?: string;
  status?: string;
  search?: string;
  category?: string;
} = {}): Promise<ApiSuccess<AdminMediaItem[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.platform && options.platform !== 'all') params.set('platform', options.platform);
  if (options.status && options.status !== 'all') params.set('status', options.status);
  if (options.search) params.set('search', options.search.trim());
  if (options.category) params.set('category', options.category.trim());
  params.set('_t', String(Date.now()));

  const query = `?${params.toString()}`;
  return apiRequest<AdminMediaItem[]>(`/api/admin/media${query}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
}

export async function fetchAdminMediaItem(id: string): Promise<AdminMediaItem> {
  const res = await apiRequest<{ item: AdminMediaItem }>(`/api/admin/media/${id}`);
  return res.data.item;
}

export async function fetchMediaMetadata(
  platform: 'youtube' | 'instagram',
  url: string
): Promise<MediaMetadataResult> {
  const res = await apiRequest<MediaMetadataResult>('/api/admin/media/fetch-metadata', {
    method: 'POST',
    body: { platform, url },
  });
  return res.data;
}

export async function createMediaItem(input: MediaItemInput): Promise<AdminMediaItem> {
  const res = await apiRequest<{ item: AdminMediaItem }>('/api/admin/media', {
    method: 'POST',
    body: input,
  });
  return res.data.item;
}

export async function updateMediaItem(id: string, input: MediaItemUpdateInput): Promise<AdminMediaItem> {
  const res = await apiRequest<{ item: AdminMediaItem }>(`/api/admin/media/${id}`, {
    method: 'PATCH',
    body: input,
  });
  return res.data.item;
}

export async function updateMediaItemStatus(id: string, status: MediaStatus): Promise<AdminMediaItem> {
  const res = await apiRequest<{ item: AdminMediaItem }>(`/api/admin/media/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
  return res.data.item;
}

export async function reorderMediaItems(
  items: Array<{ id: string; displayOrder: number }>
): Promise<{ updated: number }> {
  const res = await apiRequest<{ updated: number }>('/api/admin/media/reorder', {
    method: 'PATCH',
    body: { items },
  });
  return res.data;
}

export async function deleteMediaItem(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/admin/media/${id}`, {
    method: 'DELETE',
  });
}

export async function uploadMediaThumbnail(file: File): Promise<{
  secureUrl: string;
  publicId?: string;
  format?: string;
}> {
  const formData = new FormData();
  formData.append('image', file);

  const res = await apiRequest<{
    image: {
      secureUrl: string;
      publicId?: string;
      format?: string;
    };
  }>('/api/admin/media/upload-thumbnail', {
    method: 'POST',
    body: formData,
  });

  return res.data.image;
}

// ─── Storefront Public Media ────────────────────────────────────────────────

export async function fetchStorefrontMedia(options: {
  limit?: number;
  category?: string;
  platform?: string;
} = {}): Promise<StorefrontMediaItem[]> {
  const params = new URLSearchParams();
  if (options.limit) params.set('limit', String(options.limit));
  if (options.category && options.category !== 'All') params.set('category', options.category);
  if (options.platform && options.platform !== 'all') params.set('platform', options.platform);
  params.set('_t', String(Date.now()));

  const query = `?${params.toString()}`;
  const res = await apiRequest<StorefrontMediaItem[]>(`/api/storefront/media${query}`, {
    cache: 'no-store',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });
  return res.data || [];
}

// ─── Legacy Image Asset Library (Backwards Compatibility) ───────────────────

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
  return apiRequest<MediaItem[]>(`/api/admin/media/assets${query}`);
}

export async function uploadMedia(formData: FormData): Promise<MediaItem[]> {
  const res = await apiRequest<{ media: MediaItem[] }>('/api/admin/media/upload', {
    method: 'POST',
    body: formData,
  });
  return res.data.media;
}

export async function deleteMedia(id: string): Promise<void> {
  await apiRequest<{ deleted: boolean }>(`/api/admin/media/assets/${id}`, {
    method: 'DELETE',
  });
}
