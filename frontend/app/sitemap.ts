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
    },
    {
      url: `${SITE_SEO.siteUrl}/products`,
      lastModified: now,
    },
    {
      url: `${SITE_SEO.siteUrl}/categories`,
      lastModified: now,
    },
    {
      url: `${SITE_SEO.siteUrl}/about`,
      lastModified: now,
    },
    {
      url: `${SITE_SEO.siteUrl}/awards`,
      lastModified: now,
    },
    {
      url: `${SITE_SEO.siteUrl}/contact`,
      lastModified: now,
    },
  ];

  try {
    // Dynamic Product Detail Pages
    const { products } = await getStorefrontProducts({ limit: 100 });
    const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
      url: `${SITE_SEO.siteUrl}/products/${product.slug || product.id}`,
      lastModified: now,
    }));

    // Dynamic Category Facet Pages
    const categories = await getStorefrontCategories();
    const categoryPages: MetadataRoute.Sitemap = (categories || [])
      .filter((cat) => cat.id !== 'cat-all')
      .map((cat) => ({
        url: `${SITE_SEO.siteUrl}/products?category=${encodeURIComponent(cat.name)}`,
        lastModified: now,
      }));

    return [...staticPages, ...categoryPages, ...productPages];
  } catch {
    // Fallback gracefully to static core pages if database is unavailable during build
    return staticPages;
  }
}
