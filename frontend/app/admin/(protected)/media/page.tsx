import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { AdminMediaItem } from '@/types/api';
import { MediaManager } from './MediaManager';

export const instant = false;

export default async function MediaPage() {
  const cookieStore = await cookies();
  const res = await serverApiRequest<AdminMediaItem[]>('/api/admin/media?limit=50', cookieStore.toString());
  const items = res?.data || [];
  const total = res?.meta?.total ?? items.length;

  return (
    <div className="max-w-7xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Media Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage YouTube cooking videos, recipe vlogs, and Instagram Reels displayed on the customer storefront.
        </p>
      </div>

      <MediaManager initialMedia={items} initialTotal={total} />
    </div>
  );
}
