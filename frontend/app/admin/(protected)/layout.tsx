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

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { serverApiRequest } from '@/lib/api/client';
import type { MeResponseData } from '@/types/api';
import AdminShell from '@/app/admin/AdminShell';

const getSessionAdmin = cache(async (cookieHeader: string) => {
  return serverApiRequest<MeResponseData>('/auth/me', cookieHeader);
});

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // If no session cookies exist at all, redirect immediately to login
  if (!cookieHeader.trim()) {
    redirect('/admin/login');
  }

  // Verify session validity directly against the backend session store
  const result = await getSessionAdmin(cookieHeader);
  if (!result?.data?.admin) {
    redirect('/admin/login');
  }

  return <AdminShell admin={result.data.admin}>{children}</AdminShell>;
}
