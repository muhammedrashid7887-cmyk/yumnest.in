import { SITE_SEO } from '@/config/site-seo';
import type { Product } from '@/types';

/**
 * Organization Schema for Yum Nest
 */
export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${SITE_SEO.siteUrl}/#organization`,
    name: SITE_SEO.brandName,
    legalName: SITE_SEO.brandLegalName,
    url: SITE_SEO.siteUrl,
    logo: `${SITE_SEO.siteUrl}/assets/yummnext-og-logo.png`,
    image: `${SITE_SEO.siteUrl}/assets/chef-faseeha.jpg`,
    description: SITE_SEO.defaultDescription,
    founder: {
      '@type': 'Person',
      name: SITE_SEO.founder.name,
      jobTitle: SITE_SEO.founder.role,
      award: SITE_SEO.founder.awards,
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE_SEO.contact.streetAddress,
      addressLocality: SITE_SEO.contact.addressLocality,
      addressRegion: SITE_SEO.contact.addressRegion,
      postalCode: SITE_SEO.contact.postalCode,
      addressCountry: SITE_SEO.contact.addressCountry,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: SITE_SEO.contact.telephone,
      contactType: 'customer service',
      email: SITE_SEO.contact.email,
      areaServed: 'IN',
      availableLanguage: ['English', 'Malayalam'],
    },
    sameAs: [
      SITE_SEO.social.instagram,
      SITE_SEO.social.facebook,
      SITE_SEO.social.linkedin,
      SITE_SEO.social.twitter,
    ],
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_SEO.siteUrl}/#website`,
    url: SITE_SEO.siteUrl,
    name: SITE_SEO.brandName,
    description: SITE_SEO.defaultDescription,
    publisher: {
      '@id': `${SITE_SEO.siteUrl}/#organization`,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_SEO.siteUrl}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Founder Person Schema
 */
export function getFounderPersonSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_SEO.siteUrl}/about/#founder`,
    name: SITE_SEO.founder.name,
    jobTitle: SITE_SEO.founder.role,
    worksFor: {
      '@id': `${SITE_SEO.siteUrl}/#organization`,
    },
    image: `${SITE_SEO.siteUrl}/assets/chef-faseeha.jpg`,
    award: SITE_SEO.founder.awards,
    knowsAbout: [
      'Kerala Culinary Traditions',
      'Authentic Broast Masala Blending',
      'Arabian Alfaham Grilling Spices',
      'Heritage Spice Formulation',
      'Preservative-Free Cooking',
    ],
  };
}

/**
 * BreadcrumbList Schema generator
 */
export function getBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => {
      const isLast = index === items.length - 1;
      const element: Record<string, unknown> = {
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
      };
      if (!isLast && item.url) {
        element.item = item.url.startsWith('http')
          ? item.url
          : `${SITE_SEO.siteUrl}${item.url.startsWith('/') ? '' : '/'}${item.url}`;
      }
      return element;
    }),
  };
}

/**
 * Product Schema generator according to Google Rich Results guidelines.
 * Adheres strictly to the rule: ONLY emit aggregateRating if genuine reviews/ratings exist.
 * Never invent fake reviews.
 */
export function getProductSchema(product: Product) {
  const canonicalUrl = `${SITE_SEO.siteUrl}/products/${product.slug || product.id}`;
  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (typeof img === 'string' ? img : (img as { url: string }).url || product.primaryImage))
    : [product.primaryImage].filter(Boolean);

  const primaryVariant = product.variants?.[0];
  const price = primaryVariant?.salePrice ?? primaryVariant?.price ?? 0;
  const inStock = product.inStock !== false;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonicalUrl}/#product`,
    name: product.name,
    description: product.description || product.shortDescription,
    image: images,
    url: canonicalUrl,
    sku: product.variants?.[0]?.sku || `YN-${product.id}`,
    brand: {
      '@type': 'Brand',
      name: SITE_SEO.brandName,
    },
    offers: {
      '@type': 'Offer',
      price: price > 0 ? price : 0,
      priceCurrency: 'INR',
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: canonicalUrl,
      seller: {
        '@id': `${SITE_SEO.siteUrl}/#organization`,
      },
      itemCondition: 'https://schema.org/NewCondition',
    },
  };

  // Only include aggregateRating if genuine rating count and rating value exist
  if (product.reviewCount && product.reviewCount > 0 && product.rating && product.rating > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      reviewCount: product.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  return schema;
}

/**
 * Article Schema generator for culinary guides and recipes
 */
export function getArticleSchema(article: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.image || SITE_SEO.defaultOgImage.url,
    url: article.url.startsWith('http') ? article.url : `${SITE_SEO.siteUrl}${article.url}`,
    datePublished: article.datePublished || '2026-01-01T00:00:00Z',
    dateModified: article.dateModified || new Date().toISOString(),
    author: {
      '@type': 'Person',
      name: SITE_SEO.founder.name,
      jobTitle: SITE_SEO.founder.role,
    },
    publisher: {
      '@id': `${SITE_SEO.siteUrl}/#organization`,
    },
  };
}
