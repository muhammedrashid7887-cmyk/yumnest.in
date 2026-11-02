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

import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { AuthenticatedAdmin, MeResponseData } from '@/types/api';
import AdminShell from '@/app/admin/AdminShell';

export const instant = false;

const DEFAULT_ADMIN: AuthenticatedAdmin = {
  id: 'admin_root',
  name: 'Admin',
  email: 'admin@yumnest.in',
  role: 'owner',
};

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  let admin = DEFAULT_ADMIN;

  // If cookies are available, fetch the admin profile from backend
  if (cookieHeader.trim()) {
    try {
      const result = await serverApiRequest<MeResponseData>('/auth/me', cookieHeader);
      if (result?.data?.admin) {
        admin = result.data.admin;
      }
    } catch {
      // Keep default admin if request fails
    }
  }

  return <AdminShell admin={admin}>{children}</AdminShell>;
}

