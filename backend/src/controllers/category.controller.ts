import type { Request, Response } from "express";
import { createCategory, deleteCategory, getCategory, listCategories, listPublicCategories, updateCategory } from "../services/category.service";

export const createCategoryController = async (request: Request, response: Response): Promise<void> => {
  const category = await createCategory(request.body);
  response.status(201).json({ success: true, data: { category } });
};

export const listCategoriesController = async (request: Request, response: Response): Promise<void> => {
  const result = await listCategories(request.query as never);
  response.status(200).json({ success: true, data: result.items, meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
};

export const getCategoryController = async (request: Request, response: Response): Promise<void> => {
  response.status(200).json({ success: true, data: { category: await getCategory(request.params.id as string) } });
};

export const updateCategoryController = async (request: Request, response: Response): Promise<void> => {
  response.status(200).json({ success: true, data: { category: await updateCategory(request.params.id as string, request.body) } });
};

export const deleteCategoryController = async (request: Request, response: Response): Promise<void> => {
  await deleteCategory(request.params.id as string);
  response.status(200).json({ success: true, data: { deleted: true } });
};

export const listPublicCategoriesController = async (_request: Request, response: Response): Promise<void> => {
  response.status(200).json({ success: true, data: await listPublicCategories() });
};
