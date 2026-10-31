import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Yumnest Admin',
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Neutral admin layout for the /admin route segment.
 *
 * Does not contain an authentication guard so that public child routes like
 * /admin/login can render freely.
 *
 * Protected admin routes are nested under the (protected) route group
 * where the authentication guard layout resides.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
