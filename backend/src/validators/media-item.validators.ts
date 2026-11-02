import { z } from "zod";

export const mediaItemCreateSchema = z.object({
  platform: z.enum(["youtube", "instagram"]),
  url: z.string().trim().min(5, "Media URL is required").max(1024),
  title: z.string().trim().min(1, "Title is required").max(300),
  titleMl: z.string().trim().max(300).optional(),
  description: z.string().trim().min(1, "Description is required").max(5000),
  descriptionMl: z.string().trim().max(5000).optional(),
  category: z.string().trim().min(1, "Category is required").max(100),
  thumbnailUrl: z.string().trim().max(2048).optional(),
  cloudinaryPublicId: z.string().trim().max(512).optional(),
  duration: z.string().trim().max(30).optional(),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  featured: z.boolean().default(false),
  displayOrder: z.coerce.number().int().default(0),
});

export const mediaItemUpdateSchema = z.object({
  platform: z.enum(["youtube", "instagram"]).optional(),
  url: z.string().trim().min(5).max(1024).optional(),
  title: z.string().trim().min(1).max(300).optional(),
  titleMl: z.string().trim().max(300).optional(),
  description: z.string().trim().min(1).max(5000).optional(),
  descriptionMl: z.string().trim().max(5000).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  thumbnailUrl: z.string().trim().max(2048).optional(),
  cloudinaryPublicId: z.string().trim().max(512).optional(),
  duration: z.string().trim().max(30).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  featured: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
});

export const mediaItemStatusSchema = z.object({
  status: z.enum(["draft", "published", "archived"]),
});

export const mediaItemReorderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1),
        displayOrder: z.coerce.number().int(),
      })
    )
    .min(1)
    .max(100),
});

export const mediaItemListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  platform: z.enum(["all", "youtube", "instagram"]).optional(),
  status: z.enum(["all", "draft", "published", "archived"]).optional(),
  search: z.string().trim().max(100).optional(),
  category: z.string().trim().max(100).optional(),
});

export const mediaFetchMetadataSchema = z.object({
  platform: z.enum(["youtube", "instagram"]),
  url: z.string().trim().min(1, "URL is required").max(1024),
});

export type MediaItemCreateInput = z.infer<typeof mediaItemCreateSchema>;
export type MediaItemUpdateInput = z.infer<typeof mediaItemUpdateSchema>;
export type MediaItemListQuery = z.infer<typeof mediaItemListQuerySchema>;
export type MediaFetchMetadataInput = z.infer<typeof mediaFetchMetadataSchema>;
