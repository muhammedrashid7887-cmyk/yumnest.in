import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = (
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://yumnest-in.onrender.com'
).replace(/\/$/, '');

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('yumnest_admin_session')?.value;

  if (token) {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Cookie: `yumnest_admin_session=${token}`,
        },
      });
    } catch {
      // Best-effort backend notification
    }
    cookieStore.delete('yumnest_admin_session');
  }

  return NextResponse.json({ success: true, data: { loggedOut: true } });
}
