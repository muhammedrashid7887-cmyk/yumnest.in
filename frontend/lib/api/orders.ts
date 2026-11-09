/**
 * Yumnest Orders API client.
 * Public endpoint: POST /api/orders (customer checkout, no auth)
 * Admin endpoints: /api/admin/orders/* (requires session cookie)
 */

import { apiRequest } from './client';
import type {
  Order,
  OrderStats,
  CreateOrderInput,
  UpdateOrderStatusInput,
  UpdateOrderDetailsInput,
  ApiSuccess,
} from '@/types/api';

// ── Customer checkout ─────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const result = await apiRequest<Order>('/api/orders', {
    method: 'POST',
    body: input,
  });
  return result.data;
}

// ── Admin: list orders ────────────────────────────────────────────────────────

export interface FetchOrdersOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: 'createdAt' | 'totalAmount' | 'orderNumber';
  sortOrder?: 'asc' | 'desc';
}

export async function fetchOrders(options: FetchOrdersOptions = {}): Promise<ApiSuccess<Order[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search) params.set('search', options.search);
  if (options.status) params.set('status', options.status);
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.sortOrder) params.set('sortOrder', options.sortOrder);

  const qs = params.toString();
  return apiRequest<Order[]>(`/api/admin/orders${qs ? `?${qs}` : ''}`);
}

// ── Admin: single order ───────────────────────────────────────────────────────

export async function fetchOrder(id: string): Promise<Order> {
  const result = await apiRequest<Order>(`/api/admin/orders/${id}`);
  return result.data;
}

// ── Admin: update status ──────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput
): Promise<Order> {
  const result = await apiRequest<Order>(`/api/admin/orders/${id}/status`, {
    method: 'PATCH',
    body: input,
  });
  return result.data;
}

// ── Admin: update details ─────────────────────────────────────────────────────

export async function updateOrderDetails(
  id: string,
  input: UpdateOrderDetailsInput
): Promise<Order> {
  const result = await apiRequest<Order>(`/api/admin/orders/${id}`, {
    method: 'PATCH',
    body: input,
  });
  return result.data;
}

// ── Admin: stats ──────────────────────────────────────────────────────────────

export async function fetchOrderStats(): Promise<OrderStats> {
  const result = await apiRequest<OrderStats>('/api/admin/orders/stats');
  return result.data;
}
