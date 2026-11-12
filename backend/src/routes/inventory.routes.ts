import { Router } from "express";
import { z } from "zod";
import type { Environment } from "../config/env";
import {
  listInventoryController,
  getProductInventoryController,
  adjustStockController,
  getStockHistoryController,
} from "../controllers/inventory.controller";
import { requireAuthenticatedAdmin, requireAdminRole } from "../middleware/auth";
import { validateBody } from "../middleware/validateBody";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import {
  inventoryListQuerySchema,
  stockAdjustmentSchema,
  stockHistoryQuerySchema,
} from "../validators/inventory.validators";

const productIdParamSchema = z.object({
  productId: z.string().trim().min(1),
});

export function inventoryRouter(env: Environment): Router {
  const router = Router();
  const authenticated = requireAuthenticatedAdmin(env);
  const canWrite = requireAdminRole(env, "owner", "admin");

  // List inventory with search, filters, pagination, and stock status counters
  router.get(
    "/admin/inventory",
    authenticated,
    validateQuery(inventoryListQuerySchema),
    listInventoryController
  );

  // Single product inventory details
  router.get(
    "/admin/inventory/:productId",
    authenticated,
    validateParams(productIdParamSchema),
    getProductInventoryController
  );

  // Atomic stock adjustment (add, remove, set)
  router.patch(
    "/admin/inventory/:productId",
    canWrite,
    validateParams(productIdParamSchema),
    validateBody(stockAdjustmentSchema),
    adjustStockController
  );

  // Stock movement audit history
  router.get(
    "/admin/inventory/:productId/history",
    authenticated,
    validateParams(productIdParamSchema),
    validateQuery(stockHistoryQuerySchema),
    getStockHistoryController
  );

  return router;
}
