/**
 * Protected admin layout.
 *
 * Runs as a Next.js Server Component under the (protected) route group.
 * Does NOT wrap /admin/login.
 *
 * Reads the session cookie from the incoming request and forwards it to the
 * backend GET /auth/me endpoint to verify the session server-side before
 * rendering any protected admin page.
 *
 * If the session is missing or invalid, unauthenticated users are redirected
 * to /admin/login before any admin UI is rendered.
 *
 * Cookie values and tokens are never logged or exposed to the client.
 */

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { MeResponseData } from '@/types/api';
import AdminShell from '@/app/admin/AdminShell';

// Next.js 16 Segment Config: disable instant static prerendering validation
// for this protected route segment so request cookies can block navigation
// and verify authentication before any protected UI is rendered.
export const instant = false;

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // Fast check: if no cookies were sent at all, redirect immediately
  if (!cookieHeader.trim()) {
    redirect('/admin/login');
  }

  // Forward the cookies to the backend so Express can validate the session
  const result = await serverApiRequest<MeResponseData>('/auth/me', cookieHeader);

  // No valid session → redirect to login page immediately
  if (!result) {
    redirect('/admin/login');
  }

  const admin = result.data.admin;

  return <AdminShell admin={admin}>{children}</AdminShell>;
}

