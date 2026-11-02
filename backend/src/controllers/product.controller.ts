import type { Request, Response } from "express";
import { createProduct, deleteProduct, getProduct, getPublicProduct, listProducts, listPublicProducts, updateProduct } from "../services/product.service";
import { uploadMedia } from "../services/media.service";
import { HttpError } from "../utils/httpError";

export const createProductController = async (request: Request, response: Response): Promise<void> => {
  response.status(201).json({ success: true, data: { product: await createProduct(request.body) } });
};

export const listProductsController = async (request: Request, response: Response): Promise<void> => {
  const result = await listProducts(request.query as never);
  response.status(200).json({ success: true, data: result.items, meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
};

export const getProductController = async (request: Request, response: Response): Promise<void> => {
  response.status(200).json({ success: true, data: { product: await getProduct(request.params.id as string) } });
};

export const updateProductController = async (request: Request, response: Response): Promise<void> => {
  response.status(200).json({ success: true, data: { product: await updateProduct(request.params.id as string, request.body) } });
};

export const updateProductStatusController = async (request: Request, response: Response): Promise<void> => {
  const { id } = request.params;
  const { isActive } = request.body as { isActive: boolean };
  const product = await updateProduct(id as string, { isActive: Boolean(isActive) });
  response.status(200).json({ success: true, data: { product } });
};

export const uploadProductImageController = async (request: Request, response: Response): Promise<void> => {
  if (!request.auth) throw new HttpError(401, "Authentication required");
  const multerFiles = (request.files as Express.Multer.File[] | undefined) ?? (request.file ? [request.file] : []);
  if (multerFiles.length === 0) throw new HttpError(400, "An image file is required");

  const media = await uploadMedia(multerFiles, { folder: "products", altText: request.body.altText }, request.auth.id);
  response.status(201).json({
    success: true,
    data: {
      image: media[0],
      images: media,
    },
  });
};

export const deleteProductController = async (request: Request, response: Response): Promise<void> => {
  await deleteProduct(request.params.id as string);
  response.status(200).json({ success: true, data: { deleted: true } });
};

export const listPublicProductsController = async (request: Request, response: Response): Promise<void> => {
  const result = await listPublicProducts(request.query as never);
  response.status(200).json({ success: true, data: result.items, meta: { total: result.total, page: result.page, limit: result.limit, pages: result.pages } });
};

export const getPublicProductController = async (request: Request, response: Response): Promise<void> => {
  response.status(200).json({ success: true, data: { product: await getPublicProduct(request.params.idOrSlug as string) } });
};
