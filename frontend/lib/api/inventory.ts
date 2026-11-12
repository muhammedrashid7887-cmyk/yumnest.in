import { apiRequest } from './client';
import type {
  InventoryItem,
  InventorySummary,
  StockAdjustmentPayload,
  StockHistoryItem,
} from '@/types/inventory';
import type { ApiSuccess } from '@/types/api';

export async function fetchInventory(options: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
} = {}): Promise<{
  items: InventoryItem[];
  meta: { total: number; page: number; limit: number; pages: number };
  summary: InventorySummary;
}> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search?.trim()) params.set('search', options.search.trim());
  if (options.category && options.category !== 'all') params.set('category', options.category);
  if (options.status && options.status !== 'all') params.set('status', options.status);
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.sortOrder) params.set('sortOrder', options.sortOrder);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiRequest<InventoryItem[]>(`/api/admin/inventory${query}`);

  return {
    items: res.data || [],
    meta: (res as any).meta || { total: 0, page: 1, limit: 20, pages: 1 },
    summary: (res as any).summary || {
      totalProducts: 0,
      inStockCount: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    },
  };
}

export async function fetchProductInventory(productId: string): Promise<{
  product: InventoryItem;
  recentHistory: StockHistoryItem[];
}> {
  const res = await apiRequest<{
    product: InventoryItem;
    recentHistory: StockHistoryItem[];
  }>(`/api/admin/inventory/${productId}`);
  return res.data;
}

export async function adjustInventoryStock(
  productId: string,
  payload: StockAdjustmentPayload
): Promise<{ product: InventoryItem; history: StockHistoryItem }> {
  const res = await apiRequest<{
    product: InventoryItem;
    history: StockHistoryItem;
  }>(`/api/admin/inventory/${productId}`, {
    method: 'PATCH',
    body: payload,
  });
  return res.data;
}

export async function fetchStockHistory(
  productId: string,
  options: { page?: number; limit?: number; variantId?: string } = {}
): Promise<{
  history: StockHistoryItem[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.variantId) params.set('variantId', options.variantId);

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiRequest<StockHistoryItem[]>(
    `/api/admin/inventory/${productId}/history${query}`
  );

  return {
    history: res.data || [],
    total: (res as any).meta?.total ?? 0,
    page: (res as any).meta?.page ?? 1,
    limit: (res as any).meta?.limit ?? 20,
    pages: (res as any).meta?.pages ?? 1,
  };
}
