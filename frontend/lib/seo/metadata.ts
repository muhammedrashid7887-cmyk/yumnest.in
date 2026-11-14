import type { Metadata } from 'next';
import { SITE_SEO } from '@/config/site-seo';

interface BuildMetadataParams {
  title?: string;
  description?: string;
  path?: string;
  keywords?: string[];
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
}

/**
 * Computes an absolute, normalized, canonical URL for Yum Nest.
 * Follows Next.js Headless SEO rules:
 * - Always absolute with https://yumnest.in
 * - Lowercase and path stripped of trailing slash (except root)
 * - Safe against non-http protocols
 */
export function computeCanonicalUrl(path: string = '/'): string {
  try {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(cleanPath, SITE_SEO.siteUrl);
    if (url.pathname !== '/' && url.pathname.endsWith('/')) {
      url.pathname = url.pathname.slice(0, -1);
    }
    return url.origin + url.pathname + (url.search || '');
  } catch {
    return `${SITE_SEO.siteUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }
}

/**
 * Builds Next.js App Router Metadata with complete Open Graph, Twitter Cards,
 * and canonical alternates, avoiding duplicate tags.
 */
export function buildPageMetadata(params: BuildMetadataParams = {}): Metadata {
  const title = params.title
    ? `${params.title} | ${SITE_SEO.brandName}`
    : SITE_SEO.defaultTitle;

  const description = params.description?.trim() || SITE_SEO.defaultDescription;
  const canonical = computeCanonicalUrl(params.path || '/');

  const ogImageUrl = params.image
    ? (params.image.startsWith('http') ? params.image : `${SITE_SEO.siteUrl}${params.image.startsWith('/') ? '' : '/'}${params.image}`)
    : SITE_SEO.defaultOgImage.url;

  const ogImageAlt = params.imageAlt || params.title || SITE_SEO.brandName;

  const keywords = Array.from(
    new Set([...(params.keywords || []), ...SITE_SEO.defaultKeywords])
  );

  return {
    metadataBase: new URL(SITE_SEO.siteUrl),
    title: {
      default: title,
      template: SITE_SEO.titleTemplate,
    },
    description,
    keywords,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_SEO.brandName,
      locale: 'en_IN',
      type: params.type || 'website',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
      creator: '@yumnest',
    },
    robots: params.noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
  };
}
