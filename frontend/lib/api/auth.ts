/**
 * Yumnest auth API — thin wrappers around the backend auth endpoints.
 *
 * Endpoints consumed:
 *   POST /auth/login
 *   POST /auth/logout
 *   GET  /auth/me
 *
 * Response contracts are defined in @/types/api and match the backend
 * auth.service.ts and auth.controller.ts implementations exactly.
 */

import { apiRequest } from './client';
import type {
  LoginResponseData,
  LogoutResponseData,
  MeResponseData,
  SafeAdmin,
  AuthenticatedAdmin,
} from '@/types/api';

// ─── Login ───────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * POST /auth/login
 * Sends credentials. On success the backend sets an HTTP-only session cookie.
 * Returns the SafeAdmin and session expiry.
 * Throws ApiRequestError on failure (invalid credentials, rate limit, etc.).
 */
export async function login(
  credentials: LoginCredentials
): Promise<{ admin: SafeAdmin; expiresAt: string }> {
  const result = await apiRequest<LoginResponseData>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
  return result.data;
}

// ─── Logout ──────────────────────────────────────────────────────────────────

/**
 * POST /auth/logout
 * Clears the server-side session and instructs the browser to remove the
 * HTTP-only cookie. Always resolves (logout is best-effort).
 */
export async function logout(): Promise<void> {
  await apiRequest<LogoutResponseData>('/auth/logout', { method: 'POST' });
}

// ─── Current session (client-side) ───────────────────────────────────────────

/**
 * GET /auth/me
 * Returns the authenticated admin for the current session cookie.
 * Throws ApiRequestError (401) when no valid session exists.
 */
export async function getMe(): Promise<AuthenticatedAdmin> {
  const result = await apiRequest<MeResponseData>('/auth/me');
  return result.data.admin;
}

