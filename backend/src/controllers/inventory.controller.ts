import type { Request, Response } from "express";
import {
  listInventory,
  getProductInventory,
  adjustStock,
  getStockHistory,
} from "../services/inventory.service";
import {
  inventoryListQuerySchema,
  stockAdjustmentSchema,
  stockHistoryQuerySchema,
} from "../validators/inventory.validators";

export const listInventoryController = async (request: Request, response: Response): Promise<void> => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  response.setHeader("Pragma", "no-cache");
  response.setHeader("Expires", "0");

  const query = inventoryListQuerySchema.parse(request.query);
  const result = await listInventory(query);
  response.status(200).json({
    success: true,
    data: result.items,
    meta: result.meta,
    summary: result.summary,
  });
};

export const getProductInventoryController = async (request: Request, response: Response): Promise<void> => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const result = await getProductInventory(request.params.productId as string);
  response.status(200).json({
    success: true,
    data: result,
  });
};

export const adjustStockController = async (request: Request, response: Response): Promise<void> => {
  const input = stockAdjustmentSchema.parse(request.body);
  const adminName = request.auth?.email || request.auth?.name || "Admin";
  const result = await adjustStock(request.params.productId as string, input, adminName);
  response.status(200).json({
    success: true,
    data: result,
  });
};

export const getStockHistoryController = async (request: Request, response: Response): Promise<void> => {
  response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
  const query = stockHistoryQuerySchema.parse(request.query);
  const result = await getStockHistory(request.params.productId as string, query);
  response.status(200).json({
    success: true,
    data: result.history,
    meta: {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    },
  });
};
