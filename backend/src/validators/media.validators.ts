import { z } from "zod";

export const mediaUploadSchema = z.object({
  folder: z.enum(["products", "categories"]).default("products"),
  altText: z.string().trim().max(200).optional(),
});

export const mediaListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  folder: z.enum(["products", "categories"]).optional(),
});
