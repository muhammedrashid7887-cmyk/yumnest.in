import { Schema, model, type HydratedDocument } from "mongoose";

export interface Category {
  name: string;
  slug: string;
  malayalamName?: string;
  description?: string;
  image?: {
    mediaId?: string;
    url: string;
    secureUrl?: string;
    publicId?: string;
    width?: number;
    height?: number;
    format?: string;
    altText?: string;
    alt?: string;
  };
  isActive: boolean;
  displayOrder: number;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  secondaryKeywords?: string[];
  canonicalUrl?: string;
  isNoIndex?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type CategoryDocument = HydratedDocument<Category>;

const categorySchema = new Schema<Category>(
  {
    name: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    malayalamName: { type: String, trim: true, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    image: {
      mediaId: { type: String, trim: true, maxlength: 32 },
      url: { type: String, trim: true, maxlength: 2_048 },
      secureUrl: { type: String, trim: true, maxlength: 2_048 },
      publicId: { type: String, trim: true, maxlength: 512 },
      width: { type: Number, min: 1 },
      height: { type: Number, min: 1 },
      format: { type: String, trim: true, lowercase: true },
      altText: { type: String, trim: true, maxlength: 200 },
      alt: { type: String, trim: true, maxlength: 200 },
    },
    isActive: { type: Boolean, required: true, default: true, index: true },
    displayOrder: { type: Number, required: true, default: 0, min: 0, index: true },
    seoTitle: { type: String, trim: true, maxlength: 180 },
    seoDescription: { type: String, trim: true, maxlength: 320 },
    focusKeyword: { type: String, trim: true, maxlength: 100 },
    secondaryKeywords: { type: [String], default: [] },
    canonicalUrl: { type: String, trim: true, maxlength: 500 },
    isNoIndex: { type: Boolean, default: false },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, displayOrder: 1, name: 1 });
categorySchema.index({ name: "text", slug: "text" });

export const CategoryModel = model<Category>("Category", categorySchema);
