import { z } from "zod";

export const stockStatusEnum = z.enum(["all", "in_stock", "low_stock", "out_of_stock"]);
export type StockStatusFilter = z.infer<typeof stockStatusEnum>;

export const inventoryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  status: stockStatusEnum.default("all"),
  sortBy: z.enum(["name", "stock", "updatedAt", "sku"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type InventoryListQuery = z.infer<typeof inventoryListQuerySchema>;

export const stockAdjustmentModeEnum = z.enum(["add", "remove", "set"]);
export type StockAdjustmentMode = z.infer<typeof stockAdjustmentModeEnum>;

export const stockAdjustmentSchema = z.object({
  variantId: z.string().trim().optional(),
  mode: stockAdjustmentModeEnum,
  quantity: z.number().int().min(0, "Quantity must be a non-negative integer"),
  lowStockThreshold: z.number().int().min(0, "Low stock threshold must be a non-negative integer").optional(),
  reason: z.string().trim().max(500).optional(),
});

export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

export const stockHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  variantId: z.string().trim().optional(),
});

export type StockHistoryQuery = z.infer<typeof stockHistoryQuerySchema>;
