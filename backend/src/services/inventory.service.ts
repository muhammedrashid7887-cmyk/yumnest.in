import mongoose from "mongoose";
import { ProductModel, type Product, type ProductVariant } from "../models/product.model";
import { StockHistoryModel, type IStockHistory } from "../models/stock-history.model";
import { CategoryModel } from "../models/category.model";
import { HttpError } from "../utils/httpError";
import { emitToAll } from "./socket.service";
import { SOCKET_EVENTS } from "../constants/socket-events";
import type { InventoryListQuery, StockAdjustmentInput, StockHistoryQuery } from "../validators/inventory.validators";

export type InventoryStockStatus = "in_stock" | "low_stock" | "out_of_stock";

export interface InventoryVariantItem {
  id: string;
  variantName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  reservedQuantity: number;
  lowStockThreshold: number;
  unit: string;
  isActive: boolean;
  status: InventoryStockStatus;
}

export interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  primaryImage: string;
  variants: InventoryVariantItem[];
  totalStock: number;
  reservedStock: number;
  lowStockThreshold: number;
  stockStatus: InventoryStockStatus;
  updatedAt: string;
}

export interface InventoryListResult {
  items: InventoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  summary: {
    totalProducts: number;
    inStockCount: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
}

function calculateVariantStatus(stockQuantity: number, threshold: number): InventoryStockStatus {
  if (stockQuantity <= 0) return "out_of_stock";
  if (stockQuantity <= threshold) return "low_stock";
  return "in_stock";
}

function calculateAggregateStatus(totalStock: number, threshold: number): InventoryStockStatus {
  if (totalStock <= 0) return "out_of_stock";
  if (totalStock <= threshold) return "low_stock";
  return "in_stock";
}

function mapProductToInventoryItem(product: any): InventoryItem {
  const productThreshold = product.lowStockThreshold ?? 10;
  let totalStock = 0;
  let totalReserved = 0;

  const variants: InventoryVariantItem[] = (product.variants || []).map((v: any) => {
    const stockQty = Math.max(0, Number(v.stockQuantity) || 0);
    const reservedQty = Math.max(0, Number(v.reservedQuantity) || 0);
    const varThreshold = v.lowStockThreshold !== undefined ? Number(v.lowStockThreshold) : productThreshold;
    totalStock += stockQty;
    totalReserved += reservedQty;

    return {
      id: String(v._id || v.id),
      variantName: v.variantName || "Standard Pack",
      sku: v.sku || "",
      price: Number(v.price) || 0,
      stockQuantity: stockQty,
      reservedQuantity: reservedQty,
      lowStockThreshold: varThreshold,
      unit: v.unit || "g",
      isActive: Boolean(v.isActive ?? true),
      status: calculateVariantStatus(stockQty, varThreshold),
    };
  });

  const primaryImage =
    product.images?.[0]?.url ||
    product.images?.[0]?.secureUrl ||
    product.primaryImage ||
    "";

  const firstSku = variants[0]?.sku || "";
  const catObj = product.category && typeof product.category === "object"
    ? {
        id: String(product.category._id || product.category.id),
        name: product.category.name || "General",
        slug: product.category.slug || "",
      }
    : null;

  return {
    id: String(product._id || product.id),
    productId: String(product._id || product.id),
    name: product.name,
    slug: product.slug,
    sku: firstSku,
    category: catObj,
    primaryImage,
    variants,
    totalStock,
    reservedStock: totalReserved,
    lowStockThreshold: productThreshold,
    stockStatus: calculateAggregateStatus(totalStock, productThreshold),
    updatedAt: product.updatedAt ? new Date(product.updatedAt).toISOString() : new Date().toISOString(),
  };
}

export async function listInventory(query: InventoryListQuery): Promise<InventoryListResult> {
  const filter: Record<string, unknown> = {
    isArchived: { $ne: true },
  };

  if (query.category) {
    const trimmed = query.category.trim();
    if (mongoose.Types.ObjectId.isValid(trimmed)) {
      filter.category = new mongoose.Types.ObjectId(trimmed);
    } else {
      const cat = await CategoryModel.findOne({
        $or: [
          { slug: trimmed.toLowerCase() },
          { name: new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        ],
      }).select("_id").lean().exec();
      if (cat) {
        filter.category = cat._id;
      } else {
        return {
          items: [],
          meta: { total: 0, page: query.page, limit: query.limit, pages: 0 },
          summary: { totalProducts: 0, inStockCount: 0, lowStockCount: 0, outOfStockCount: 0 },
        };
      }
    }
  }

  if (query.search?.trim()) {
    const escaped = query.search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escaped, "i");
    filter.$or = [
      { name: regex },
      { slug: regex },
      { "variants.sku": regex },
    ];
  }

  // Fetch all active products matching base filter to compute accurate summaries & filter by status
  const allMatching = await ProductModel.find(filter)
    .populate({ path: "category", select: "name slug" })
    .lean()
    .exec();

  const allItems = allMatching.map(mapProductToInventoryItem);

  // Compute global summary statistics
  const summary = {
    totalProducts: allItems.length,
    inStockCount: allItems.filter((i) => i.stockStatus === "in_stock").length,
    lowStockCount: allItems.filter((i) => i.stockStatus === "low_stock").length,
    outOfStockCount: allItems.filter((i) => i.stockStatus === "out_of_stock").length,
  };

  // Apply stock status filter if specified
  let filtered = allItems;
  if (query.status && query.status !== "all") {
    filtered = allItems.filter((i) => i.stockStatus === query.status);
  }

  // Sorting
  const sortDirection = query.sortOrder === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    if (query.sortBy === "name") {
      return a.name.localeCompare(b.name) * sortDirection;
    }
    if (query.sortBy === "stock") {
      return (a.totalStock - b.totalStock) * sortDirection;
    }
    if (query.sortBy === "sku") {
      return a.sku.localeCompare(b.sku) * sortDirection;
    }
    // Default: updatedAt
    return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * sortDirection;
  });

  const total = filtered.length;
  const skip = (query.page - 1) * query.limit;
  const paginated = filtered.slice(skip, skip + query.limit);

  return {
    items: paginated,
    meta: {
      total,
      page: query.page,
      limit: query.limit,
      pages: Math.ceil(total / query.limit) || 1,
    },
    summary,
  };
}

export async function getProductInventory(productId: string): Promise<{
  product: InventoryItem;
  recentHistory: IStockHistory[];
}> {
  if (!mongoose.isValidObjectId(productId)) {
    throw new HttpError(400, "Invalid product ID");
  }

  const product = await ProductModel.findById(productId)
    .populate({ path: "category", select: "name slug" })
    .lean()
    .exec();

  if (!product) {
    throw new HttpError(404, "Product not found");
  }

  const item = mapProductToInventoryItem(product);
  const recentHistory = await StockHistoryModel.find({ productId: product._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()
    .exec();

  return {
    product: item,
    recentHistory: recentHistory as unknown as IStockHistory[],
  };
}

export async function adjustStock(
  productId: string,
  input: StockAdjustmentInput,
  adminName: string
): Promise<{ product: InventoryItem; history: IStockHistory }> {
  if (!mongoose.isValidObjectId(productId)) {
    throw new HttpError(400, "Invalid product ID");
  }

  const productDoc = await ProductModel.findById(productId).exec();
  if (!productDoc) {
    throw new HttpError(404, "Product not found");
  }

  if (!productDoc.variants || productDoc.variants.length === 0) {
    throw new HttpError(400, "Product has no variants configured");
  }

  // Find target variant
  let targetVariant = productDoc.variants[0];
  if (input.variantId) {
    const found = productDoc.variants.find(
      (v) => String(v._id) === input.variantId || v.sku === input.variantId
    );
    if (!found) {
      throw new HttpError(404, `Variant with ID "${input.variantId}" not found on product`);
    }
    targetVariant = found;
  }

  const currentStock = Math.max(0, targetVariant.stockQuantity ?? 0);
  let newStock = currentStock;

  if (input.mode === "add") {
    newStock = currentStock + input.quantity;
  } else if (input.mode === "remove") {
    newStock = currentStock - input.quantity;
    if (newStock < 0) {
      throw new HttpError(
        400,
        `Cannot remove ${input.quantity} units. Current stock is only ${currentStock}. Stock cannot be negative.`
      );
    }
  } else if (input.mode === "set") {
    newStock = input.quantity;
    if (newStock < 0) {
      throw new HttpError(400, "Stock quantity cannot be negative.");
    }
  }

  const quantityChanged = newStock - currentStock;

  // Prepare atomic update fields
  const updateFields: Record<string, unknown> = {
    "variants.$.stockQuantity": newStock,
  };

  if (input.lowStockThreshold !== undefined) {
    updateFields["variants.$.lowStockThreshold"] = input.lowStockThreshold;
    updateFields["lowStockThreshold"] = input.lowStockThreshold;
  }

  // Perform atomic MongoDB update
  const updatedProduct = await ProductModel.findOneAndUpdate(
    {
      _id: productDoc._id,
      "variants._id": targetVariant._id,
    },
    {
      $set: updateFields,
    },
    { new: true }
  )
    .populate({ path: "category", select: "name slug" })
    .lean()
    .exec();

  if (!updatedProduct) {
    throw new HttpError(500, "Failed to update product stock atomically.");
  }

  // Create audit history entry in MongoDB
  const operationType =
    input.mode === "add"
      ? "stock_added"
      : input.mode === "remove"
      ? "stock_removed"
      : "manual_adjustment";

  const historyEntry = await StockHistoryModel.create({
    productId: productDoc._id,
    productName: productDoc.name,
    variantId: targetVariant._id,
    variantName: targetVariant.variantName,
    sku: targetVariant.sku,
    previousStock: currentStock,
    newStock,
    quantityChanged,
    operationType,
    reason: input.reason?.trim() || `Stock ${input.mode}ed by ${adminName}`,
    performedBy: adminName,
  });

  // Emit Socket.IO event for real-time storefront synchronization
  emitToAll(SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, {
    productId: String(productDoc._id),
    variants: updatedProduct.variants,
  });

  const item = mapProductToInventoryItem(updatedProduct);

  return {
    product: item,
    history: historyEntry,
  };
}

export async function getStockHistory(
  productId: string,
  query: StockHistoryQuery
): Promise<{
  history: IStockHistory[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  if (!mongoose.isValidObjectId(productId)) {
    throw new HttpError(400, "Invalid product ID");
  }

  const filter: Record<string, unknown> = {
    productId: new mongoose.Types.ObjectId(productId),
  };

  if (query.variantId && mongoose.isValidObjectId(query.variantId)) {
    filter.variantId = new mongoose.Types.ObjectId(query.variantId);
  }

  const skip = (query.page - 1) * query.limit;

  const [items, total] = await Promise.all([
    StockHistoryModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .lean()
      .exec(),
    StockHistoryModel.countDocuments(filter).exec(),
  ]);

  return {
    history: items as unknown as IStockHistory[],
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(total / query.limit) || 1,
  };
}
