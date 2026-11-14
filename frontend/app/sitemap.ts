import type { MetadataRoute } from 'next';
import { SITE_SEO } from '@/config/site-seo';
import { getStorefrontProducts, getStorefrontCategories } from '@/lib/api/storefront';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core Static Marketing & Storefront Pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_SEO.siteUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_SEO.siteUrl}/products`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${SITE_SEO.siteUrl}/categories`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_SEO.siteUrl}/signature-collection`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_SEO.siteUrl}/recipes`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_SEO.siteUrl}/awards`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_SEO.siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_SEO.siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  try {
    // Dynamic Product Detail Pages (Filter out noindex and unpublished/inactive)
    const { products } = await getStorefrontProducts({ limit: 100 });
    const productPages: MetadataRoute.Sitemap = (products || [])
      .filter((p) => !p.isNoIndex && (p.slug || p.id))
      .map((product) => ({
        url: `${SITE_SEO.siteUrl}/products/${product.slug || product.id}`,
        lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));

    // Dynamic Category Facet Pages
    const categories = await getStorefrontCategories();
    const categoryPages: MetadataRoute.Sitemap = (categories || [])
      .filter((cat) => cat.id !== 'cat-all' && !cat.isNoIndex)
      .map((cat) => ({
        url: `${SITE_SEO.siteUrl}/products?category=${encodeURIComponent(cat.name)}`,
        lastModified: cat.updatedAt ? new Date(cat.updatedAt) : now,
        changeFrequency: 'weekly',
        priority: 0.7,
      }));

    // Deduplicate any accidental duplicate URLs
    const seen = new Set<string>();
    const allUrls = [...staticPages, ...categoryPages, ...productPages].filter((entry) => {
      if (seen.has(entry.url)) {
        return false;
      }
      seen.add(entry.url);
      return true;
    });

    return allUrls;
  } catch {
    // Fallback gracefully to static core pages if database is unavailable during build
    return staticPages;
  }
}
