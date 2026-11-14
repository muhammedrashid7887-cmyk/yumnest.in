import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import type { Product } from '@/types';
import { notFound } from 'next/navigation';
import { getStorefrontProduct, getStorefrontProducts } from '@/lib/api/storefront';
import { Navbar } from '@/components/common/Navbar';
import { Footer } from '@/components/common/Footer';
import { MobileBottomNav } from '@/components/common/MobileBottomNav';
import { ProductDetailView } from '@/components/products/ProductDetailView';
import { JsonLd } from '@/components/seo/JsonLd';
import { getProductSchema, getBreadcrumbSchema } from '@/lib/seo/schemas';
import { SITE_SEO } from '@/config/site-seo';

export const instant = false;

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getStorefrontProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | Yum Nest',
      description: 'The requested spice product could not be found.',
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = product.seoTitle?.trim() || `${product.name} | Yum Nest Kerala Pure Spices`;
  const description =
    product.seoDescription?.trim() ||
    product.shortDescription?.trim() ||
    product.description?.trim().slice(0, 160) ||
    SITE_SEO.defaultDescription;

  const canonical = product.canonicalUrl?.trim() || `${SITE_SEO.siteUrl}/products/${product.slug || product.id}`;
  const ogImageUrl = product.ogImage || product.primaryImage || SITE_SEO.defaultOgImage.url;

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as { name?: string }).name
      : product.category;

  const keywords = Array.from(
    new Set([
      product.name,
      product.malayalamName || '',
      categoryName || '',
      product.focusKeyword || '',
      ...(product.secondaryKeywords || []),
      'Yum Nest',
      'Kerala Spices',
    ].filter(Boolean))
  );

  return {
    metadataBase: new URL(SITE_SEO.siteUrl),
    title,
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
      type: 'website',
      images: [
        {
          url: ogImageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImageUrl],
    },
    robots: product.isNoIndex
      ? { index: false, follow: false }
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

function ProductDetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      <div className="h-4 bg-stone-200 rounded w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-5 space-y-4">
          <div className="aspect-square bg-stone-200 rounded-3xl" />
          <div className="flex gap-3">
            <div className="w-20 h-20 bg-stone-200 rounded-2xl" />
            <div className="w-20 h-20 bg-stone-200 rounded-2xl" />
          </div>
        </div>
        <div className="lg:col-span-7 space-y-5">
          <div className="h-6 bg-stone-200 rounded w-32" />
          <div className="h-10 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-1/2" />
          <div className="h-24 bg-stone-200 rounded" />
        </div>
      </div>
    </div>
  );
}

async function ProductDetailContent({ params }: Props) {
  const { id } = await params;
  const product = await getStorefrontProduct(id);

  if (!product) {
    notFound();
  }

  let relatedProducts: Product[] = [];
  try {
    const categoryQuery =
      typeof product.category === 'object' && product.category !== null
        ? (product.category as { id?: string; name?: string; slug?: string }).slug ||
          (product.category as { id?: string; name?: string; slug?: string }).id ||
          (product.category as { id?: string; name?: string; slug?: string }).name || ''
        : String(product.category || '');

    const { products: catProds } = await getStorefrontProducts({
      category: categoryQuery || undefined,
      limit: 8,
    });
    relatedProducts = (catProds || [])
      .filter((p) => p.id !== product.id && (!product._id || p._id !== product._id))
      .slice(0, 4);

    if (relatedProducts.length < 4) {
      const { products: allProds } = await getStorefrontProducts({ limit: 12 });
      const extra = (allProds || []).filter(
        (p) =>
          p.id !== product.id &&
          (!product._id || p._id !== product._id) &&
          !relatedProducts.some((r) => r.id === p.id || (r._id && r._id === p._id))
      );
      relatedProducts = [...relatedProducts, ...extra].slice(0, 4);
    }
  } catch {
    relatedProducts = [];
  }

  const categoryName =
    typeof product.category === 'object' && product.category !== null
      ? (product.category as { name?: string }).name || 'Spices'
      : String(product.category || 'Spices');

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: categoryName, url: `/products?category=${encodeURIComponent(categoryName)}` },
    { name: product.name },
  ]);

  const productJsonLd = getProductSchema(product);

  return (
    <>
      <JsonLd data={[productJsonLd, breadcrumbs]} />
      <ProductDetailView product={product} relatedProducts={relatedProducts} />
    </>
  );
}

export default function ProductDetailPage({ params }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF7F0] text-[#1C1917]">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetailContent params={params} />
        </Suspense>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
