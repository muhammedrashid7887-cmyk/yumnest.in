/**
 * Yumnest Storefront API Client
 * Connects customer-facing pages directly to the Express backend & MongoDB.
 * Falls back safely to local seed data if the backend is unreachable during static builds.
 */

import { Product, CategoryItem } from '@/types';
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from '@/data/mockData';

const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/$/, '');

export interface StorefrontProductsQuery {
  category?: string;
  featured?: boolean;
  search?: string;
  sortBy?: 'popular' | 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

interface RawVariant {
  id?: string;
  _id?: string;
  weight?: string;
  variantName?: string;
  price: number;
  compareAtPrice?: number;
  stock?: number;
  stockQuantity?: number;
}

interface RawProduct {
  id?: string;
  _id?: string;
  slug?: string;
  name: string;
  malayalamName?: string;
  subtitle?: string;
  category?: { name: string } | string;
  shortDescription: string;
  description: string;
  ingredients?: string[];
  howToUse?: string;
  nutrition?: { calories?: string; protein?: string; fat?: string; carbs?: string };
  primaryImage?: string;
  images?: string[];
  variants?: RawVariant[];
  rating?: number;
  reviewCount?: number;
  isBestSeller?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  inStock?: boolean;
  isFeatured?: boolean;
  badge?: string;
}

interface RawCategory {
  id?: string;
  _id?: string;
  name: string;
  slug?: string;
  malayalamName?: string;
  description?: string;
  image?: string;
}

function mapRawProduct(p: RawProduct): Product {
  return {
    id: p.slug || p.id || '',
    name: p.name,
    malayalamName: p.malayalamName,
    subtitle: p.subtitle,
    category: typeof p.category === 'object' ? p.category.name : String(p.category || ''),
    shortDescription: p.shortDescription,
    description: p.description,
    ingredients: Array.isArray(p.ingredients) ? p.ingredients : [],
    howToUse: p.howToUse || '',
    nutrition: {
      calories: p.nutrition?.calories || '',
      protein: p.nutrition?.protein || '',
      fat: p.nutrition?.fat || '',
      carbs: p.nutrition?.carbs || '',
    },
    primaryImage: p.primaryImage || p.images?.[0] || '',
    images: Array.isArray(p.images) ? p.images : [],
    variants: Array.isArray(p.variants)
      ? p.variants.map((v) => ({
          id: v.id || v._id || 'var-1',
          weight: v.weight || v.variantName || 'Standard',
          price: v.compareAtPrice !== undefined ? v.compareAtPrice : v.price,
          salePrice: v.compareAtPrice !== undefined ? v.price : undefined,
          stock: v.stock ?? v.stockQuantity ?? 0,
        }))
      : [],
    rating: p.rating ?? 4.8,
    reviewCount: p.reviewCount ?? 50,
    isBestSeller: p.isBestSeller ?? false,
    isPopular: p.isPopular ?? false,
    isNew: p.isNew ?? false,
    isOnSale: p.isOnSale ?? false,
    discountPercentage: p.discountPercentage,
    inStock: p.inStock ?? true,
    isFeatured: p.isFeatured ?? false,
    badge: p.badge,
  };
}

/**
 * Fetch public active products from the Express / MongoDB API
 */
export async function getStorefrontProducts(
  options: StorefrontProductsQuery = {}
): Promise<{ products: Product[]; total: number }> {
  try {
    const params = new URLSearchParams();
    if (options.category && options.category !== 'All Products' && options.category !== 'cat-all') {
      params.set('category', options.category);
    }
    if (options.featured !== undefined) params.set('featured', String(options.featured));
    if (options.search?.trim()) params.set('search', options.search.trim());
    if (options.sortBy) params.set('sortBy', options.sortBy === 'popular' ? 'createdAt' : options.sortBy);
    if (options.sortOrder) params.set('sortOrder', options.sortOrder);
    if (options.page) params.set('page', String(options.page));
    if (options.limit) params.set('limit', String(options.limit));

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/api/products${query}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const payload = (await res.json()) as {
      success: boolean;
      data: RawProduct[];
      meta?: { total: number };
    };

    if (payload.success && Array.isArray(payload.data)) {
      const products: Product[] = payload.data.map(mapRawProduct);
      return { products, total: payload.meta?.total ?? products.length };
    }
    return { products: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length };
  } catch {
    // Graceful fallback for offline build or temporary connection error
    return { products: FALLBACK_PRODUCTS, total: FALLBACK_PRODUCTS.length };
  }
}

/**
 * Fetch a single product by slug or id from the Express / MongoDB API
 */
export async function getStorefrontProduct(slugOrId: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/products/${slugOrId}`, {
      next: { revalidate: 60 },
    });

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const payload = (await res.json()) as {
      success: boolean;
      data?: { product: RawProduct };
    };

    const p = payload.data?.product;
    if (!p) return null;

    return mapRawProduct(p);
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((item) => item.id === slugOrId);
    return fallback || null;
  }
}

/**
 * Fetch active public categories from Express / MongoDB API
 */
export async function getStorefrontCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/categories`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) throw new Error(`API error: ${res.status}`);

    const payload = (await res.json()) as {
      success: boolean;
      data: RawCategory[];
    };

    if (payload.success && Array.isArray(payload.data)) {
      const allCategory: CategoryItem = {
        id: 'cat-all',
        name: 'All Products',
        malayalamName: 'എല്ലാ ഉൽപ്പന്നങ്ങളും',
        description: 'Explore our complete collection of single-estate spices & blends',
        image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80',
        featured: true,
      };

      const categories: CategoryItem[] = payload.data.map((c) => ({
        id: c.slug || c.id || 'cat',
        name: c.name,
        malayalamName: c.malayalamName,
        description: c.description,
        image: c.image || '',
        featured: true,
      }));

      return [allCategory, ...categories];
    }
    return FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}
