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
  token?: string;
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
  malayalamName?: string;
  description?: string;
  productCount?: number;
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
  malayalamName?: string;
  description?: string;
  image?: {
    mediaId?: string;
    url?: string;
    secureUrl?: string;
    publicId?: string;
    altText?: string;
  };
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
  variants?: ProductVariantUpdateInput[];
  tags?: string[];
  isActive?: boolean;
  isFeatured?: boolean;
  malayalamName?: string;
  badge?: string;
}

// ─── Media Assets ─────────────────────────────────────────────────────────────

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

// ─── Media Management (YouTube Videos & Instagram Reels) ─────────────────────

export type MediaPlatform = 'youtube' | 'instagram';
export type MediaStatus = 'draft' | 'published' | 'archived';

export interface AdminMediaItem {
  _id: string;
  id?: string;
  platform: MediaPlatform;
  url: string;
  externalId: string;
  title: string;
  titleMl?: string;
  description: string;
  descriptionMl?: string;
  category: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  duration?: string;
  status: MediaStatus;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface MediaItemInput {
  platform: MediaPlatform;
  url: string;
  title: string;
  titleMl?: string;
  description: string;
  descriptionMl?: string;
  category: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  duration?: string;
  status?: MediaStatus;
  featured?: boolean;
  displayOrder?: number;
}

export interface MediaItemUpdateInput {
  platform?: MediaPlatform;
  url?: string;
  title?: string;
  titleMl?: string;
  description?: string;
  descriptionMl?: string;
  category?: string;
  thumbnailUrl?: string;
  cloudinaryPublicId?: string;
  duration?: string;
  status?: MediaStatus;
  featured?: boolean;
  displayOrder?: number;
}

export interface StorefrontMediaItem {
  id: string;
  platform: MediaPlatform;
  url: string;
  externalId: string;
  title: string;
  titleMl?: string;
  description: string;
  descriptionMl?: string;
  category: string;
  thumbnailUrl?: string;
  duration?: string;
  featured: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface MediaMetadataResult {
  platform: MediaPlatform;
  externalId: string;
  normalizedUrl: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration?: string;
  authorName?: string;
  fetchedVia: 'youtube-data-api-v3' | 'youtube-oembed' | 'meta-oembed' | 'fallback';
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'new'
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface OrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface StatusHistoryEntry {
  status: OrderStatus;
  changedAt: string;
  changedBy: string;
  note?: string;
}

export interface Order {
  id: string;
  _id?: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  deliveryNotes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  customerNotes?: string;
  adminNotes?: string;
  statusHistory: StatusHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  customerName: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
  deliveryNotes?: string;
  items: Array<{
    productName: string;
    productId?: string;
    quantity: number;
    unitPrice: number;
  }>;
  deliveryCharge?: number;
  paymentMethod?: string;
  customerNotes?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  note?: string;
}

export interface UpdateOrderDetailsInput {
  customerName?: string;
  phone?: string;
  address?: string;
  city?: string;
  pincode?: string;
  deliveryNotes?: string;
  adminNotes?: string;
  paymentStatus?: PaymentStatus;
  courierName?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}

export interface OrderStats {
  total: number;
  byStatus: Record<string, number>;
  totalRevenue: number;
  recentOrders: Order[];
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

// ─── Wholesale & Distribution ────────────────────────────────────────────────

export type WholesaleEnquiryStatus =
  | 'pending'
  | 'contacted'
  | 'quotation_sent'
  | 'negotiation'
  | 'converted'
  | 'rejected';

export interface WholesaleEnquiry {
  _id?: string;
  enquiryId: string;
  fullName: string;
  businessName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  businessType: string;
  interestedProducts: string[];
  requiredQuantity: string;
  message?: string;
  status: WholesaleEnquiryStatus;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWholesaleEnquiryInput {
  fullName: string;
  businessName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  businessType: string;
  interestedProducts: string[];
  requiredQuantity: string;
  message?: string;
}

export interface UpdateWholesaleEnquiryInput {
  status?: WholesaleEnquiryStatus;
  adminNotes?: string;
}

export interface WholesaleStats {
  total: number;
  pending: number;
  contacted: number;
  quotation_sent: number;
  negotiation: number;
  converted: number;
  rejected: number;
}

export type DistributorStatus =
  | 'pending'
  | 'under_review'
  | 'contacted'
  | 'approved'
  | 'rejected'
  | 'deactivated';

export interface DistributorApplication {
  _id?: string;
  applicationId: string;
  fullName: string;
  businessName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  city: string;
  address: string;
  businessType: string;
  distributionExperience: 'yes' | 'no';
  experienceDetails?: string;
  interestedCategories: string[];
  additionalInformation?: string;
  status: DistributorStatus;
  adminNotes?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDistributorApplicationInput {
  fullName: string;
  businessName: string;
  mobile: string;
  whatsapp?: string;
  email?: string;
  state: string;
  district: string;
  city: string;
  address: string;
  businessType: string;
  distributionExperience: 'yes' | 'no';
  experienceDetails?: string;
  interestedCategories: string[];
  additionalInformation?: string;
}

export interface UpdateDistributorApplicationInput {
  status?: DistributorStatus;
  adminNotes?: string;
}

export interface DistributorStats {
  total: number;
  pending: number;
  under_review: number;
  contacted: number;
  approved: number;
  rejected: number;
  deactivated: number;
}

export interface BusinessOverviewStats {
  pendingWholesaleCount: number;
  pendingDistributorCount: number;
  totalPendingBusiness: number;
}

