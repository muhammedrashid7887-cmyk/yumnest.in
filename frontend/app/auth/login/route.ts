import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = (
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://yumnest-in.onrender.com'
).replace(/\/$/, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return NextResponse.json(data, { status: res.status });
    }

    // Extract token either from JSON data or from Set-Cookie header
    let token = data.data?.token;
    if (!token) {
      const setCookie = res.headers.get('set-cookie');
      if (setCookie) {
        const match = setCookie.match(/yumnest_admin_session=([^;]+)/);
        if (match) token = match[1];
      }
    }

    // Set HTTP-only session cookie directly on the frontend domain
    if (token) {
      const cookieStore = await cookies();
      cookieStore.set('yumnest_admin_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AUTH_GATEWAY_ERROR',
          message: err instanceof Error ? err.message : 'Authentication service unreachable',
        },
      },
      { status: 500 }
    );
  }
}
