import type { MetadataRoute } from 'next';
import { SITE_SEO } from '@/config/site-seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/admin/*',
          '/account',
          '/account/*',
          '/cart',
          '/cart/*',
          '/auth/',
          '/auth/*',
          '/api/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/account',
          '/cart',
          '/auth/',
        ],
      },
    ],
    sitemap: `${SITE_SEO.siteUrl}/sitemap.xml`,
    host: SITE_SEO.siteUrl,
  };
}
