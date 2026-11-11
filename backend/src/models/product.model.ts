import { Schema, model, type HydratedDocument, type Types } from "mongoose";

export interface ProductImage {
  mediaId?: string;
  url: string;
  secureUrl?: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
  altText?: string;
  alt?: string;
  sortOrder: number;
}

export interface ProductVariant {
  _id: Types.ObjectId;
  variantName: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stockQuantity: number;
  unit: string;
  isActive: boolean;
}

export interface Product {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: Types.ObjectId;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  isArchived: boolean;
  archivedAt?: Date;
  malayalamName?: string;
  subtitle?: string;
  badge?: string;
  ingredients?: string[];
  howToUse?: string;
  nutrition?: {
    calories?: string;
    protein?: string;
    fat?: string;
    carbs?: string;
  };
  rating?: number;
  reviewCount?: number;
  isBestSeller?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  isOnSale?: boolean;
  discountPercentage?: number;
  seoTitle?: string;
  seoDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ProductDocument = HydratedDocument<Product>;

const imageSchema = new Schema<ProductImage>(
  {
    mediaId: { type: String, trim: true, maxlength: 32 },
    url: { type: String, required: true, trim: true, maxlength: 2_048 },
    secureUrl: { type: String, trim: true, maxlength: 2_048 },
    publicId: { type: String, trim: true, maxlength: 512 },
    width: { type: Number, min: 1 },
    height: { type: Number, min: 1 },
    format: { type: String, trim: true, lowercase: true },
    altText: { type: String, trim: true, maxlength: 200 },
    alt: { type: String, trim: true, maxlength: 200 },
    sortOrder: { type: Number, required: true, min: 0, default: 0 },
  },
  { _id: true }
);

const variantSchema = new Schema<ProductVariant>(
  {
    variantName: { type: String, required: true, trim: true, maxlength: 80 },
    sku: { type: String, required: true, trim: true, uppercase: true, maxlength: 80 },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true, maxlength: 30 },
    isActive: { type: Boolean, required: true, default: true },
  },
  { _id: true }
);

const productSchema = new Schema<Product>(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 180 },
    shortDescription: { type: String, required: true, trim: true, maxlength: 500 },
    description: { type: String, required: true, trim: true, maxlength: 10_000 },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    images: { type: [imageSchema], default: [] },
    variants: { type: [variantSchema], required: true, validate: [(value: ProductVariant[]) => value.length > 0, "At least one variant is required"] },
    tags: { type: [String], default: [] },
    isActive: { type: Boolean, required: true, default: false, index: true },
    isFeatured: { type: Boolean, required: true, default: false, index: true },
    isArchived: { type: Boolean, required: true, default: false, index: true },
    archivedAt: { type: Date },
    malayalamName: { type: String, trim: true, maxlength: 200 },
    subtitle: { type: String, trim: true, maxlength: 200 },
    badge: { type: String, trim: true, maxlength: 100 },
    ingredients: { type: [String], default: [] },
    howToUse: { type: String, trim: true, maxlength: 5_000 },
    nutrition: {
      calories: { type: String, trim: true, maxlength: 50 },
      protein: { type: String, trim: true, maxlength: 50 },
      fat: { type: String, trim: true, maxlength: 50 },
      carbs: { type: String, trim: true, maxlength: 50 },
    },
    rating: { type: Number, min: 0, max: 5, default: 5 },
    reviewCount: { type: Number, min: 0, default: 0 },
    isBestSeller: { type: Boolean, default: false },
    isPopular: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    discountPercentage: { type: Number, min: 0, max: 100 },
    seoTitle: { type: String, trim: true, maxlength: 180 },
    seoDescription: { type: String, trim: true, maxlength: 320 },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });
productSchema.index({ isArchived: 1, isActive: 1, isFeatured: 1, createdAt: -1 });
productSchema.index({ name: "text", shortDescription: "text", tags: "text" });

export const ProductModel = model<Product>("Product", productSchema);
