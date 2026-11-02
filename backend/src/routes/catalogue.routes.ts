import { Router } from "express";
import type { Environment } from "../config/env";
import { createCategoryController, deleteCategoryController, getCategoryController, listCategoriesController, listPublicCategoriesController, updateCategoryController } from "../controllers/category.controller";
import { createProductController, deleteProductController, getProductController, getPublicProductController, listProductsController, listPublicProductsController, updateProductController } from "../controllers/product.controller";
import { validateBody } from "../middleware/validateBody";
import { validateParams } from "../middleware/validateParams";
import { validateQuery } from "../middleware/validateQuery";
import { categoryCreateSchema, categoryListQuerySchema, categoryUpdateSchema, idParamSchema, listQuerySchema, productCreateSchema, productUpdateSchema } from "../validators/catalogue.validators";

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

  router.get("/categories", listPublicCategoriesController);
  router.get("/products", validateQuery(listQuerySchema), listPublicProductsController);
  router.get("/products/:idOrSlug", getPublicProductController);

  return router;
}

