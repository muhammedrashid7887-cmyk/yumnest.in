/**
 * Yumnest Business API client — Wholesale & Distribution.
 * Connects frontend customer popup & admin dashboard to the backend endpoints.
 */

import { apiRequest } from './client';
import type {
  WholesaleEnquiry,
  CreateWholesaleEnquiryInput,
  UpdateWholesaleEnquiryInput,
  WholesaleStats,
  DistributorApplication,
  CreateDistributorApplicationInput,
  UpdateDistributorApplicationInput,
  DistributorStats,
  BusinessOverviewStats,
  ApiSuccess,
} from '@/types/api';

// ─── Public Submissions ──────────────────────────────────────────────────────

export async function submitWholesaleEnquiry(
  input: CreateWholesaleEnquiryInput
): Promise<WholesaleEnquiry> {
  const result = await apiRequest<WholesaleEnquiry>('/api/wholesale/enquiries', {
    method: 'POST',
    body: input,
  });
  return result.data;
}

export async function submitDistributorApplication(
  input: CreateDistributorApplicationInput
): Promise<DistributorApplication> {
  const result = await apiRequest<DistributorApplication>('/api/distributors/applications', {
    method: 'POST',
    body: input,
  });
  return result.data;
}

// ─── Admin Wholesale Enquiries ───────────────────────────────────────────────

export interface FetchWholesaleOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchWholesaleEnquiries(
  options: FetchWholesaleOptions = {}
): Promise<ApiSuccess<WholesaleEnquiry[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search) params.set('search', options.search);
  if (options.status) params.set('status', options.status);
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.sortOrder) params.set('sortOrder', options.sortOrder);

  const qs = params.toString();
  return apiRequest<WholesaleEnquiry[]>(`/api/admin/wholesale/enquiries${qs ? `?${qs}` : ''}`);
}

export async function fetchWholesaleEnquiry(id: string): Promise<WholesaleEnquiry> {
  const result = await apiRequest<WholesaleEnquiry>(`/api/admin/wholesale/enquiries/${id}`);
  return result.data;
}

export async function updateWholesaleEnquiry(
  id: string,
  input: UpdateWholesaleEnquiryInput
): Promise<WholesaleEnquiry> {
  const result = await apiRequest<WholesaleEnquiry>(`/api/admin/wholesale/enquiries/${id}`, {
    method: 'PATCH',
    body: input,
  });
  return result.data;
}

export async function deleteWholesaleEnquiry(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/api/admin/wholesale/enquiries/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchWholesaleStats(): Promise<WholesaleStats> {
  const result = await apiRequest<WholesaleStats>('/api/admin/wholesale/enquiries/stats');
  return result.data;
}

// ─── Admin Distributor Applications ─────────────────────────────────────────

export interface FetchDistributorOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export async function fetchDistributorApplications(
  options: FetchDistributorOptions = {}
): Promise<ApiSuccess<DistributorApplication[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search) params.set('search', options.search);
  if (options.status) params.set('status', options.status);
  if (options.sortBy) params.set('sortBy', options.sortBy);
  if (options.sortOrder) params.set('sortOrder', options.sortOrder);

  const qs = params.toString();
  return apiRequest<DistributorApplication[]>(
    `/api/admin/distributors/applications${qs ? `?${qs}` : ''}`
  );
}

export async function fetchDistributorApplication(id: string): Promise<DistributorApplication> {
  const result = await apiRequest<DistributorApplication>(
    `/api/admin/distributors/applications/${id}`
  );
  return result.data;
}

export async function updateDistributorApplication(
  id: string,
  input: UpdateDistributorApplicationInput
): Promise<DistributorApplication> {
  const result = await apiRequest<DistributorApplication>(
    `/api/admin/distributors/applications/${id}`,
    {
      method: 'PATCH',
      body: input,
    }
  );
  return result.data;
}

export async function deleteDistributorApplication(id: string): Promise<void> {
  await apiRequest<{ message: string }>(`/api/admin/distributors/applications/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchDistributorStats(): Promise<DistributorStats> {
  const result = await apiRequest<DistributorStats>('/api/admin/distributors/applications/stats');
  return result.data;
}

export async function fetchApprovedDistributors(options: {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'all' | 'approved' | 'deactivated';
} = {}): Promise<ApiSuccess<DistributorApplication[]>> {
  const params = new URLSearchParams();
  if (options.page) params.set('page', String(options.page));
  if (options.limit) params.set('limit', String(options.limit));
  if (options.search) params.set('search', options.search);
  if (options.status) params.set('status', options.status);

  const qs = params.toString();
  return apiRequest<DistributorApplication[]>(`/api/admin/distributors/approved${qs ? `?${qs}` : ''}`);
}

// ─── Business Overview Notification Stats ───────────────────────────────────

export async function fetchBusinessNotificationStats(): Promise<BusinessOverviewStats> {
  const result = await apiRequest<BusinessOverviewStats>('/api/admin/business/stats');
  return result.data;
}
