import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Must be a valid MongoDB ObjectId");
const slug = z.string().trim().min(1).max(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Must be a URL-safe slug");
const nonNegative = z.number().finite().min(0);

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
  slug: slug.optional(),
  malayalamName: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  image: z.object({
    mediaId: objectId.optional(),
    url: z.string().trim().min(1).max(2_048).optional(),
    secureUrl: z.string().trim().max(2_048).optional(),
    publicId: z.string().trim().max(512).optional(),
    width: nonNegative.int().optional(),
    height: nonNegative.int().optional(),
    format: z.string().trim().max(20).optional(),
    altText: z.string().trim().max(200).optional(),
    alt: z.string().trim().max(200).optional(),
  }).strict().optional(),
  isActive: z.boolean().optional(),
  displayOrder: nonNegative.int().optional(),
}).strict();

export const categoryUpdateSchema = categoryCreateSchema.partial();

const variantCreateSchema = z.object({
  variantName: z.string().trim().min(1).max(80),
  sku: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  price: nonNegative,
  compareAtPrice: nonNegative.optional(),
  stockQuantity: nonNegative.int(),
  unit: z.string().trim().min(1).max(30),
  isActive: z.boolean().optional(),
}).superRefine((variant, context) => {
  if (variant.compareAtPrice !== undefined && variant.compareAtPrice < variant.price) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["compareAtPrice"], message: "Must be greater than or equal to price" });
  }
});

const variantUpdateSchema = z.object({
  id: objectId.optional(),
  _id: objectId.optional(),
  variantName: z.string().trim().min(1).max(80),
  sku: z.string().trim().min(1).max(80).regex(/^[a-zA-Z0-9_-]+$/),
  price: nonNegative,
  compareAtPrice: nonNegative.optional(),
  stockQuantity: nonNegative.int().optional(),
  unit: z.string().trim().min(1).max(30),
  isActive: z.boolean().optional(),
}).superRefine((variant, context) => {
  if (variant.compareAtPrice !== undefined && variant.compareAtPrice < variant.price) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["compareAtPrice"], message: "Must be greater than or equal to price" });
  }
});

export const productCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: slug.optional(),
  shortDescription: z.string().trim().min(1).max(500),
  description: z.string().trim().min(1).max(10_000),
  category: objectId.optional(),
  images: z.array(z.object({ id: objectId.optional(), _id: objectId.optional(), mediaId: objectId.optional(), url: z.string().trim().min(1).max(2_048).optional(), secureUrl: z.string().trim().max(2_048).optional(), publicId: z.string().trim().max(512).optional(), width: nonNegative.int().optional(), height: nonNegative.int().optional(), format: z.string().trim().max(20).optional(), altText: z.string().trim().max(200).optional(), alt: z.string().trim().max(200).optional(), sortOrder: nonNegative.int().optional() })).max(20).optional(),
  variants: z.array(variantCreateSchema).min(1).max(50),
  tags: z.array(z.string().trim().min(1).max(500)).max(50).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  malayalamName: z.string().trim().max(200).optional(),
  subtitle: z.string().trim().max(200).optional(),
  badge: z.string().trim().max(100).optional().nullable(),
  ingredients: z.array(z.string().trim().max(100)).max(50).optional(),
  howToUse: z.string().trim().max(5000).optional(),
  nutrition: z.object({
    calories: z.string().trim().max(50).optional(),
    protein: z.string().trim().max(50).optional(),
    fat: z.string().trim().max(50).optional(),
    carbs: z.string().trim().max(50).optional(),
  }).partial().optional(),
  rating: z.number().min(0).max(5).optional(),
  reviewCount: z.number().int().min(0).optional(),
  isBestSeller: z.boolean().optional(),
  isPopular: z.boolean().optional(),
  isNew: z.boolean().optional(),
  isOnSale: z.boolean().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  seoTitle: z.string().trim().max(180).optional(),
  seoDescription: z.string().trim().max(320).optional(),
}).strict();

export const productUpdateSchema = productCreateSchema.omit({ variants: true }).extend({
  id: objectId.optional(),
  _id: objectId.optional(),
  variants: z.array(variantUpdateSchema).min(1).max(50).optional(),
}).partial();

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().min(1).max(120).optional(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  isArchived: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  featured: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
  sortBy: z.enum(["createdAt", "name", "price"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const categoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  isActive: z.enum(["true", "false"]).transform((value) => value === "true").optional(),
});

export const idParamSchema = z.object({ id: objectId });

export type CategoryCreateInput = z.infer<typeof categoryCreateSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;
export type ProductCreateInput = z.infer<typeof productCreateSchema>;
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;
