/**
 * Yumnest API — types mirroring the backend response contracts.
 *
 * These types are derived from the actual backend service/controller
 * implementations. Never add NEXT_PUBLIC_ variables here that would
 * expose backend secrets.
 */

// ─── Shared envelope ────────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ────────────────────────────────────────────────────────────────────

/** Returned by POST /auth/login and GET /auth/me */
export type AdminRole = 'owner' | 'admin';

/** Returned inside data.admin by GET /auth/me */
export interface AuthenticatedAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

/** Returned inside data.admin by POST /auth/login */
export interface SafeAdmin extends AuthenticatedAdmin {
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponseData {
  admin: SafeAdmin;
  expiresAt: string;
}

export interface MeResponseData {
  admin: AuthenticatedAdmin;
}

export interface LogoutResponseData {
  loggedOut: boolean;
}

// ─── Category ────────────────────────────────────────────────────────────────

export interface CategoryItem {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: {
    mediaId?: string;
    url?: string;
    secureUrl?: string;
    publicId?: string;
    altText?: string;
  };
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryInput {
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
  displayOrder?: number;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export interface AdminProductVariant {
  id?: string;
  _id?: string;
  variantName: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  malayalamName?: string;
  subtitle?: string;
  badge?: string;
  shortDescription: string;
  description: string;
  category: { id: string; name: string; slug: string } | string;
  images: Array<{
    url: string;
    secureUrl?: string;
    publicId?: string;
    sortOrder?: number;
    altText?: string;
    mediaId?: string;
  }>;
  primaryImage?: string;
  variants: AdminProductVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImageInput {
  mediaId?: string;
  url: string;
  secureUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  altText?: string;
  sortOrder?: number;
}

export interface ProductInput {
  name: string;
  slug?: string;
  shortDescription: string;
  description: string;
  category: string;
  images?: ProductImageInput[];
  images?: Array<{ url: string; sortOrder?: number; altText?: string; mediaId?: string }>;
  variants: Array<{
    variantName: string;
    sku: string;
    price: number;
    compareAtPrice?: number;
    stockQuantity: number;
    unit: string;
    isActive?: boolean;
  }>;
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  malayalamName?: string;
  badge?: string;
}

export interface ProductVariantUpdateInput {
  id?: string;
  variantName: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  unit: string;
  isActive?: boolean;
}

export interface ProductUpdateInput {
  name?: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  category?: string;
  images?: ProductImageInput[];
  images?: Array<{ url: string; sortOrder?: number; altText?: string; mediaId?: string }>;
  variants?: ProductVariantUpdateInput[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  malayalamName?: string;
  badge?: string;
}

// ─── Media ───────────────────────────────────────────────────────────────────

export interface MediaItem {
  _id: string;
  publicId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
  originalFilename: string;
  altText?: string;
  folder: 'products' | 'categories';
  createdAt: string;
}

// ─── Client error class ───────────────────────────────────────────────────────

export class ApiRequestError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

