import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { MediaItem } from '@/types/api';
import { MediaManager } from './MediaManager';

export const instant = false;

export default async function MediaPage() {
  const cookieStore = await cookies();
  const res = await serverApiRequest<MediaItem[]>('/api/admin/media?limit=24', cookieStore.toString());
  const items = res?.data || [];
  const total = res?.meta?.total ?? items.length;

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Media Library
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Upload and manage product photography and category banner assets.
        </p>
      </div>

      <MediaManager initialMedia={items} initialTotal={total} />
    </div>
  );
}

