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
    seoTitle: { type: String, trim: true, maxlength: 180 },
    seoDescription: { type: String, trim: true, maxlength: 320 },
  },
  { timestamps: true }
);

productSchema.index({ "variants.sku": 1 }, { unique: true, sparse: true });
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });
productSchema.index({ name: "text", shortDescription: "text", tags: "text" });

export const ProductModel = model<Product>("Product", productSchema);
