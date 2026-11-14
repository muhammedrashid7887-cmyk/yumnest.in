import { z } from "zod";

export const videoCreateSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(300),
  description: z.string().trim().max(5000).optional().default(""),
  cloudinaryPublicId: z.string().trim().min(1, "Cloudinary Public ID is required").max(512),
  cloudinaryAssetId: z.string().trim().max(512).optional(),
  videoUrl: z.string().trim().min(5, "Valid video URL is required").max(2048),
  thumbnailUrl: z.string().trim().max(2048).optional(),
  customThumbnailUrl: z.string().trim().max(2048).optional(),
  duration: z.coerce.number().min(0).default(0),
  format: z.string().trim().max(20).default("mp4"),
  width: z.coerce.number().int().min(1).default(1280),
  height: z.coerce.number().int().min(1).default(720),
  fileSize: z.coerce.number().int().min(0).default(0),
  category: z.string().trim().max(100).optional().default("General"),
  isPublished: z.boolean().default(true),
  displayOrder: z.coerce.number().int().default(0),
  instagramSourceUrl: z.string().trim().max(1024).optional(),
});

export const videoUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  description: z.string().trim().max(5000).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  customThumbnailUrl: z.string().trim().max(2048).optional().nullable(),
  isPublished: z.boolean().optional(),
  displayOrder: z.coerce.number().int().optional(),
  instagramSourceUrl: z.string().trim().max(1024).optional().nullable(),
});

export const videoPublishToggleSchema = z.object({
  isPublished: z.boolean(),
});

export const videoRegenerateThumbnailSchema = z.object({
  offsetSeconds: z.coerce.number().min(0).max(3600).default(1),
});

export const videoReplaceSchema = z.object({
  cloudinaryPublicId: z.string().trim().min(1, "New Cloudinary Public ID is required").max(512),
  cloudinaryAssetId: z.string().trim().max(512).optional(),
  videoUrl: z.string().trim().min(5, "Valid video URL is required").max(2048),
  duration: z.coerce.number().min(0).optional(),
  format: z.string().trim().max(20).optional(),
  width: z.coerce.number().int().min(1).optional(),
  height: z.coerce.number().int().min(1).optional(),
  fileSize: z.coerce.number().int().min(0).optional(),
  thumbnailUrl: z.string().trim().max(2048).optional(),
});

export const videoReorderSchema = z.object({
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

export const videoListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(["all", "published", "draft"]).default("all"),
  category: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional(),
});

export const videoPublicQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  category: z.string().trim().max(100).optional(),
});

export type VideoCreateInput = z.infer<typeof videoCreateSchema>;
export type VideoUpdateInput = z.infer<typeof videoUpdateSchema>;
export type VideoPublishToggleInput = z.infer<typeof videoPublishToggleSchema>;
export type VideoRegenerateThumbnailInput = z.infer<typeof videoRegenerateThumbnailSchema>;
export type VideoReplaceInput = z.infer<typeof videoReplaceSchema>;
export type VideoReorderInput = z.infer<typeof videoReorderSchema>;
export type VideoListQuery = z.infer<typeof videoListQuerySchema>;
export type VideoPublicQuery = z.infer<typeof videoPublicQuerySchema>;
