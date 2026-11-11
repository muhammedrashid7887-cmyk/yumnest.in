import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { AdminMediaItem, NativeVideo } from '@/types/api';
import { MediaManager } from './MediaManager';

export const instant = false;

export default async function MediaPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [mediaRes, videoRes] = await Promise.all([
    serverApiRequest<AdminMediaItem[]>('/api/admin/media?limit=50', cookieHeader).catch(() => null),
    serverApiRequest<NativeVideo[]>('/api/videos/admin/list?limit=50', cookieHeader).catch(() => null),
  ]);

  const items = mediaRes?.data || [];
  const total = mediaRes?.meta?.total ?? items.length;
  const initialVideos = videoRes?.data || [];
  const totalVideos = videoRes?.meta?.total ?? initialVideos.length;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Media Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Upload and manage native videos with automatic thumbnails and direct on-site playback, as well as external media links.
        </p>
      </div>

      <MediaManager
        initialMedia={items}
        initialTotal={total}
        initialVideos={initialVideos}
        initialVideoTotal={totalVideos}
      />
    </div>
  );
}
