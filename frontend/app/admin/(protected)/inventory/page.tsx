import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import type { Metadata } from 'next';
import InventoryManager from './InventoryManager';
import { Loader2 } from 'lucide-react';

export const instant = false;

export const metadata: Metadata = {
  title: 'Inventory Management | Yumnest Admin',
  description: 'Manage live stock, low-stock thresholds, and view audit trail in MongoDB.',
};

function InventoryLoadingFallback() {
  return (
    <div className="py-24 flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-[#0F6B47] animate-spin" />
      <p className="text-xs text-slate-500 font-medium">Loading inventory dashboard...</p>
    </div>
  );
}

export default async function InventoryPage() {
  const cookieStore = await cookies();
  void cookieStore.toString();

  return (
    <Suspense fallback={<InventoryLoadingFallback />}>
      <InventoryManager />
    </Suspense>
  );
}
