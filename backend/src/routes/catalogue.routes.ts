import { Router } from "express";
import type { Environment } from "../config/env";
import { createCategoryController, deleteCategoryController, getCategoryController, listCategoriesController, listPublicCategoriesController, updateCategoryController } from "../controllers/category.controller";
import { createProductController, deleteProductController, getProductController, getPublicProductController, listProductsController, listPublicProductsController, updateProductController } from "../controllers/product.controller";
import { requireAuthenticatedAdmin, requireAdminRole } from "../middleware/auth";
import { validateBody } from "../middleware/validateBody";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import { categoryCreateSchema, categoryListQuerySchema, categoryUpdateSchema, idParamSchema, listQuerySchema, productCreateSchema, productUpdateSchema } from "../validators/catalogue.validators";

export function catalogueRouter(env: Environment): Router {
  const router = Router();
  const authenticated = requireAuthenticatedAdmin(env);
  const canWrite = requireAdminRole(env, "owner", "admin");

  router.post("/admin/categories", canWrite, validateBody(categoryCreateSchema), createCategoryController);
  router.get("/admin/categories", authenticated, validateQuery(categoryListQuerySchema), listCategoriesController);
  router.get("/admin/categories/:id", authenticated, validateParams(idParamSchema), getCategoryController);
  router.patch("/admin/categories/:id", canWrite, validateParams(idParamSchema), validateBody(categoryUpdateSchema), updateCategoryController);
  router.delete("/admin/categories/:id", canWrite, validateParams(idParamSchema), deleteCategoryController);

  router.post("/admin/products", canWrite, validateBody(productCreateSchema), createProductController);
  router.get("/admin/products", authenticated, validateQuery(listQuerySchema), listProductsController);
  router.get("/admin/products/:id", authenticated, validateParams(idParamSchema), getProductController);
  router.patch("/admin/products/:id", canWrite, validateParams(idParamSchema), validateBody(productUpdateSchema), updateProductController);
  router.delete("/admin/products/:id", canWrite, validateParams(idParamSchema), deleteProductController);

  router.get("/categories", listPublicCategoriesController);
  router.get("/products", validateQuery(listQuerySchema), listPublicProductsController);
  router.get("/products/:idOrSlug", getPublicProductController);

  return router;
}
