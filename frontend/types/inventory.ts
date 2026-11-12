export type InventoryStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

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

export interface InventorySummary {
  totalProducts: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export interface InventoryListResponse {
  items: InventoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
  summary: InventorySummary;
}

export type StockOperationType =
  | 'stock_added'
  | 'stock_removed'
  | 'manual_adjustment'
  | 'order_placed'
  | 'order_cancelled';

export interface StockHistoryItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  sku?: string;
  previousStock: number;
  newStock: number;
  quantityChanged: number;
  operationType: StockOperationType;
  reason?: string;
  performedBy: string;
  orderId?: string;
  createdAt: string;
}

export interface StockAdjustmentPayload {
  variantId?: string;
  mode: 'add' | 'remove' | 'set';
  quantity: number;
  lowStockThreshold?: number;
  reason?: string;
}
