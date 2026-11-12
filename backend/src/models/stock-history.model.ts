import mongoose, { Document, Schema } from "mongoose";

export type StockOperationType =
  | "stock_added"
  | "stock_removed"
  | "manual_adjustment"
  | "order_placed"
  | "order_cancelled";

export interface IStockHistory extends Document {
  productId: mongoose.Types.ObjectId;
  productName: string;
  variantId?: mongoose.Types.ObjectId;
  variantName?: string;
  sku?: string;
  previousStock: number;
  newStock: number;
  quantityChanged: number;
  operationType: StockOperationType;
  reason?: string;
  performedBy: string;
  orderId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockHistorySchema = new Schema<IStockHistory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    productName: { type: String, required: true, trim: true },
    variantId: { type: Schema.Types.ObjectId, index: true },
    variantName: { type: String, trim: true },
    sku: { type: String, trim: true },
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },
    quantityChanged: { type: Number, required: true },
    operationType: {
      type: String,
      required: true,
      enum: ["stock_added", "stock_removed", "manual_adjustment", "order_placed", "order_cancelled"],
      index: true,
    },
    reason: { type: String, trim: true },
    performedBy: { type: String, required: true, trim: true },
    orderId: { type: Schema.Types.ObjectId, ref: "Order" },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret["id"] = String(ret["_id"]);
        ret["__v"] = undefined;
        return ret;
      },
    },
  }
);

stockHistorySchema.index({ productId: 1, createdAt: -1 });
stockHistorySchema.index({ variantId: 1, createdAt: -1 });
stockHistorySchema.index({ operationType: 1, createdAt: -1 });

export const StockHistoryModel =
  mongoose.models["StockHistory"] ?? mongoose.model<IStockHistory>("StockHistory", stockHistorySchema);
