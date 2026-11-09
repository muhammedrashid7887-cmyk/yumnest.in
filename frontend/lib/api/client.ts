/**
 * Yumnest API client — centralized fetch wrapper.
 *
 * Rules:
 * - Always sends credentials (HTTP-only cookie) via `credentials: "include"`.
 * - Throws ApiRequestError for all non-2xx responses with a typed error shape.
 * - Never logs cookie values or credentials.
 * - Never exposes backend secrets.
 */

import { ApiRequestError, type ApiSuccess } from '@/types/api';

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, '');

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
};

/**
 * Core fetch wrapper. Called only from the browser (client components or
 * client-side server actions). For server-side requests that need to forward
 * the session cookie, use `serverApiRequest` below.
 */
export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiSuccess<T>> {
  const { body, headers, ...rest } = options;
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    ...(body !== undefined ? { body: isFormData ? body : JSON.stringify(body) } : {}),
  });

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    throw new ApiRequestError(
      response.status,
      'PARSE_ERROR',
      'The server returned an unexpected response.'
    );
  }

  const payload = json as { success: boolean; error?: { code: string; message: string }; data?: T };

  if (!response.ok || !payload.success) {
    throw new ApiRequestError(
      response.status,
      payload.error?.code ?? 'UNKNOWN_ERROR',
      payload.error?.message ?? 'An unexpected error occurred.'
    );
  }

  return payload as ApiSuccess<T>;
}

/**
 * Server-side fetch — used in Next.js Server Components and layouts to
 * verify sessions. Explicitly forwards the session cookie from the incoming
 * request headers so the Express backend can authenticate the server-side call.
 *
 * @param path     - API path, e.g. "/auth/me"
 * @param cookieHeader - The raw `Cookie` header string from the incoming
 *                       Next.js request (obtained via `cookies().toString()`).
 *                       Must not be logged.
 */
export async function serverApiRequest<T>(
  path: string,
  cookieHeader: string,
  options: Omit<RequestOptions, 'body'> & { body?: unknown } = {}
): Promise<ApiSuccess<T> | null> {
  const { body, headers, ...rest } = options;

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      cache: 'no-store',
      // Server-side: no `credentials: "include"` (that is a browser-only
      // concept). Instead we forward the cookie header manually.
      headers: {
        'Content-Type': 'application/json',
        Cookie: cookieHeader,
        ...headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    // Network failure — treat as unauthenticated; caller will redirect.
    return null;
  }

  if (!response.ok) return null;

  let json: unknown;
  try {
    json = await response.json();
  } catch {
    return null;
  }

  const payload = json as { success: boolean; data?: T };
  if (!payload.success) return null;

  return payload as ApiSuccess<T>;
}

