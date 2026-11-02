import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import type { Environment } from "../config/env";
import { createCategoryController, deleteCategoryController, getCategoryController, listCategoriesController, listPublicCategoriesController, updateCategoryController } from "../controllers/category.controller";
import { createProductController, deleteProductController, getProductController, getPublicProductController, listProductsController, listPublicProductsController, updateProductController } from "../controllers/product.controller";
import { validateBody } from "../middleware/validateBody";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import { categoryCreateSchema, categoryListQuerySchema, categoryUpdateSchema, idParamSchema, listQuerySchema, productCreateSchema, productUpdateSchema } from "../validators/catalogue.validators";
import { HttpError } from "../utils/httpError";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export function catalogueRouter(_env: Environment): Router {
  const router = Router();

  router.post("/admin/categories", validateBody(categoryCreateSchema), createCategoryController);
  router.get("/admin/categories", validateQuery(categoryListQuerySchema), listCategoriesController);
  router.get("/admin/categories/:id", validateParams(idParamSchema), getCategoryController);
  router.patch("/admin/categories/:id", validateParams(idParamSchema), validateBody(categoryUpdateSchema), updateCategoryController);
  router.delete("/admin/categories/:id", validateParams(idParamSchema), deleteCategoryController);

  router.post("/admin/products", validateBody(productCreateSchema), createProductController);
  router.get("/admin/products", validateQuery(listQuerySchema), listProductsController);
  router.get("/admin/products/:id", validateParams(idParamSchema), getProductController);
  router.patch("/admin/products/:id", validateParams(idParamSchema), validateBody(productUpdateSchema), updateProductController);
  router.delete("/admin/products/:id", validateParams(idParamSchema), deleteProductController);

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

