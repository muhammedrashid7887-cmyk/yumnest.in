import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { AdminMediaItem } from '@/types/api';
import { MediaManager } from './MediaManager';

export const instant = false;

export default async function MediaPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const mediaRes = await serverApiRequest<AdminMediaItem[]>('/api/admin/media?limit=50', cookieHeader).catch(() => null);

  const items = mediaRes?.data || [];
  const total = mediaRes?.meta?.total ?? items.length;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Media Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your culinary recipe videos, YouTube showcases, and Instagram reels.
        </p>
      </div>

      <MediaManager
        initialMedia={items}
        initialTotal={total}
      />
    </div>
  );
}
