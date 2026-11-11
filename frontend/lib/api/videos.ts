import { apiRequest } from './client';
import type {
  NativeVideo,
  VideoUploadSignatureData,
  CreateVideoInput,
  UpdateVideoInput,
  ReplaceVideoInput,
} from '@/types/api';

export interface AdminVideosResponse {
  items: NativeVideo[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface VideoStats {
  total: number;
  published: number;
  drafts: number;
  storage: {
    provider: string;
    connected: boolean;
  };
}

/**
 * Fetch video database summary statistics for admin counters.
 */
export async function fetchAdminVideoStats(): Promise<VideoStats> {
  const res = await apiRequest<VideoStats>('/api/videos/admin/stats', {
    method: 'GET',
  });
  return res.data;
}

/**
 * Fetch published native videos for customer storefront.
 */
export async function fetchPublishedVideos(params: {
  category?: string;
  limit?: number;
} = {}): Promise<NativeVideo[]> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.limit) query.set('limit', String(params.limit));

  const qs = query.toString();
  const res = await apiRequest<NativeVideo[]>(`/api/videos${qs ? `?${qs}` : ''}`, {
    method: 'GET',
  });
  return res.data;
}

/**
 * Fetch all videos (published + draft) for admin dashboard.
 */
export async function fetchAdminVideos(params: {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
} = {}): Promise<AdminVideosResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  if (params.status && params.status !== 'all') query.set('status', params.status);
  if (params.category && params.category !== 'all') query.set('category', params.category);
  if (params.search && params.search.trim()) query.set('search', params.search.trim());

  const qs = query.toString();
  const res = await apiRequest<NativeVideo[]>(`/api/videos/admin/list${qs ? `?${qs}` : ''}`, {
    method: 'GET',
  });

  return {
    items: res.data,
    total: res.meta?.total ?? res.data.length,
    page: res.meta?.page ?? 1,
    limit: res.meta?.limit ?? 20,
    pages: res.meta?.pages ?? 1,
  };
}

/**
 * Request direct-to-Cloudinary upload signature.
 */
export async function getVideoUploadSignature(): Promise<VideoUploadSignatureData> {
  const res = await apiRequest<VideoUploadSignatureData>('/api/videos/admin/sign-upload', {
    method: 'POST',
  });
  return res.data;
}

/**
 * Direct upload of video file to Cloudinary with real-time percentage progress.
 * Completely avoids Render server limits and upload timeouts.
 */
export function uploadVideoDirectToCloudinary(
  file: File,
  sig: VideoUploadSignatureData,
  onProgress?: (percent: number) => void
): Promise<{
  publicId: string;
  assetId?: string;
  secureUrl: string;
  duration: number;
  format: string;
  width: number;
  height: number;
  bytes: number;
}> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('api_key', sig.apiKey);
    formData.append('timestamp', String(sig.timestamp));
    formData.append('signature', sig.signature);
    formData.append('folder', sig.folder);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            publicId: res.public_id,
            assetId: res.asset_id,
            secureUrl: res.secure_url,
            duration: typeof res.duration === 'number' ? res.duration : 0,
            format: res.format || 'mp4',
            width: res.width || 1280,
            height: res.height || 720,
            bytes: res.bytes || file.size,
          });
        } catch {
          reject(new Error('Failed to parse Cloudinary upload response'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Cloudinary upload failed: HTTP ${xhr.status}`));
        } catch {
          reject(new Error(`Cloudinary upload failed with HTTP status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during video upload. Please check your internet connection.'));
    };

    xhr.send(formData);
  });
}

/**
 * Fallback server-side upload for smaller video files.
 */
export function uploadVideoFallback(
  file: File,
  onProgress?: (percent: number) => void
): Promise<{
  publicId: string;
  assetId?: string;
  secureUrl: string;
  duration: number;
  format: string;
  width: number;
  height: number;
  bytes: number;
}> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('video', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/videos/admin/upload');
    xhr.withCredentials = true;

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve(res.data);
        } catch {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error('Network error during fallback video upload.'));
    };

    xhr.send(formData);
  });
}

/**
 * Save new video record to MongoDB.
 */
export async function createVideoRecord(data: CreateVideoInput): Promise<NativeVideo> {
  const res = await apiRequest<{ video: NativeVideo }>('/api/videos/admin', {
    method: 'POST',
    body: data,
  });
  return res.data.video;
}

/**
 * Update video metadata.
 */
export async function updateVideoRecord(id: string, data: UpdateVideoInput): Promise<NativeVideo> {
  const res = await apiRequest<{ video: NativeVideo }>(`/api/videos/admin/${id}`, {
    method: 'PATCH',
    body: data,
  });
  return res.data.video;
}

/**
 * Toggle published / draft status.
 */
export async function toggleVideoPublish(id: string, isPublished: boolean): Promise<NativeVideo> {
  const res = await apiRequest<{ video: NativeVideo }>(`/api/videos/admin/${id}/publish`, {
    method: 'PATCH',
    body: { isPublished },
  });
  return res.data.video;
}

/**
 * Regenerate automatic thumbnail at specified second.
 */
export async function regenerateVideoThumbnail(id: string, offsetSeconds: number): Promise<NativeVideo> {
  const res = await apiRequest<{ video: NativeVideo }>(`/api/videos/admin/${id}/regenerate-thumbnail`, {
    method: 'POST',
    body: { offsetSeconds },
  });
  return res.data.video;
}

/**
 * Replace existing video binary file while keeping metadata.
 */
export async function replaceVideoFile(id: string, data: ReplaceVideoInput): Promise<NativeVideo> {
  const res = await apiRequest<{ video: NativeVideo }>(`/api/videos/admin/${id}/replace`, {
    method: 'PUT',
    body: data,
  });
  return res.data.video;
}

/**
 * Reorder videos display orders.
 */
export async function reorderVideos(
  items: Array<{ id: string; displayOrder: number }>
): Promise<{ success: boolean; updatedCount: number }> {
  const res = await apiRequest<{ success: boolean; updatedCount: number }>('/api/videos/admin/reorder', {
    method: 'PATCH',
    body: { items },
  });
  return res.data;
}

/**
 * Delete video from database and delete Cloudinary assets.
 */
export async function deleteVideo(id: string): Promise<{ deleted: boolean; id: string }> {
  const res = await apiRequest<{ deleted: boolean; id: string }>(`/api/videos/admin/${id}`, {
    method: 'DELETE',
  });
  return res.data;
}
