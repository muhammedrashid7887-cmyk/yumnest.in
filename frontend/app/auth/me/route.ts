import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = (
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://yumnest-in.onrender.com'
).replace(/\/$/, '');

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('yumnest_admin_session')?.value;

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      },
      { status: 401 }
    );
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      headers: {
        Cookie: `yumnest_admin_session=${token}`,
      },
      cache: 'no-store',
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: { code: 'GATEWAY_ERROR', message: 'Backend unreachable' },
      },
      { status: 502 }
    );
  }
}
