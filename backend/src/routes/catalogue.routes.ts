import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import type { Environment } from "../config/env";
import { createCategoryController, deleteCategoryController, getCategoryController, listCategoriesController, listPublicCategoriesController, updateCategoryController } from "../controllers/category.controller";
import { archiveProductController, createProductController, deleteProductController, getProductController, getPublicProductController, listProductsController, listPublicProductsController, restoreProductController, updateProductController, updateProductStatusController, uploadProductImageController } from "../controllers/product.controller";
import { requireAuthenticatedAdmin, requireAdminRole } from "../middleware/auth";
import { validateBody } from "../middleware/validateBody";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import { categoryCreateSchema, categoryListQuerySchema, categoryUpdateSchema, idParamSchema, listQuerySchema, productCreateSchema, productUpdateSchema } from "../validators/catalogue.validators";
import { HttpError } from "../utils/httpError";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function catalogueRouter(env: Environment): Router {
  const router = Router();
  const authenticated = requireAuthenticatedAdmin(env);
  const canWrite = requireAdminRole(env, "owner", "admin");

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 10, fields: 10 },
    fileFilter: (_request, file, callback) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        callback(new HttpError(415, "Unsupported image format. Allowed: JPEG, PNG, WebP, AVIF"));
        return;
      }
      callback(null, true);
    },
  });

  // Admin Categories
  router.post("/admin/categories", canWrite, validateBody(categoryCreateSchema), createCategoryController);
  router.get("/admin/categories", authenticated, validateQuery(categoryListQuerySchema), listCategoriesController);
  router.get("/admin/categories/:id", authenticated, validateParams(idParamSchema), getCategoryController);
  router.put("/admin/categories/:id", canWrite, validateParams(idParamSchema), validateBody(categoryUpdateSchema), updateCategoryController);
  router.patch("/admin/categories/:id", canWrite, validateParams(idParamSchema), validateBody(categoryUpdateSchema), updateCategoryController);
  router.delete("/admin/categories/:id", canWrite, validateParams(idParamSchema), deleteCategoryController);

  // Admin Products
  router.post("/admin/products", canWrite, validateBody(productCreateSchema), createProductController);
  router.get("/admin/products", authenticated, validateQuery(listQuerySchema), listProductsController);
  router.get("/admin/products/:id", authenticated, validateParams(idParamSchema), getProductController);
  router.put("/admin/products/:id", canWrite, validateParams(idParamSchema), validateBody(productUpdateSchema), updateProductController);
  router.patch("/admin/products/:id", canWrite, validateParams(idParamSchema), validateBody(productUpdateSchema), updateProductController);
  router.patch("/admin/products/:id/status", canWrite, validateParams(idParamSchema), validateBody(z.object({ isActive: z.boolean() })), updateProductStatusController);
  router.post("/admin/products/:id/archive", canWrite, validateParams(idParamSchema), archiveProductController);
  router.post("/admin/products/:id/restore", canWrite, validateParams(idParamSchema), restoreProductController);
  router.post("/admin/products/upload-image", canWrite, upload.any(), uploadProductImageController);
  router.delete("/admin/products/:id", canWrite, validateParams(idParamSchema), deleteProductController);

  // Storefront Public Categories
  router.get("/categories", listPublicCategoriesController);
  router.get("/storefront/categories", listPublicCategoriesController);

  // Storefront Public Products
  router.get("/products", validateQuery(listQuerySchema), listPublicProductsController);
  router.get("/storefront/products", validateQuery(listQuerySchema), listPublicProductsController);
  router.get("/products/:idOrSlug", getPublicProductController);
  router.get("/storefront/products/:idOrSlug", getPublicProductController);

  return router;
}
