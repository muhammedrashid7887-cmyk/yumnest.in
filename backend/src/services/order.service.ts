import mongoose from 'mongoose';
import { OrderModel, type IOrder } from '../models/order.model';
import { ProductModel } from '../models/product.model';
import { StockHistoryModel } from '../models/stock-history.model';
import { emitToAll } from './socket.service';
import { SOCKET_EVENTS } from '../constants/socket-events';
import { HttpError } from '../utils/httpError';
import { orderEvents } from './orderEvents';
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  UpdateOrderDetailsInput,
  OrderListQuery,
} from '../validators/order.validators';

// ─── Socket.IO Strongly-Typed Payloads ────────────────────────────────────────

export interface OrderSocketPayload {
  order: IOrder;
}

export interface OrderNotificationPayload {
  type: 'order';
  title: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  timestamp: string;
}

// ─── Phone Normalization Utility ──────────────────────────────────────────────

export function normalizePhoneNumber(raw: string): string {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  // If Indian country code prefix 91 is present on a 12-digit number, strip it
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  // If leading 0 is present on an 11-digit number, strip it
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits.slice(-10);
}

// ─── Order number generation ─────────────────────────────────────────────────

async function generateOrderNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `YN-${year}-`;

  // Find the highest existing order number for this year
  const lastOrder = await OrderModel.findOne(
    { orderNumber: { $regex: `^${prefix}` } },
    { orderNumber: 1 },
    { sort: { createdAt: -1 } }
  ).lean();

  let nextSeq = 1;
  if (lastOrder?.orderNumber) {
    const parts = lastOrder.orderNumber.split('-');
    const lastSeq = parseInt(parts[2] ?? '0', 10);
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1;
  }

  return `${prefix}${String(nextSeq).padStart(4, '0')}`;
}

// ─── Normalize order document ────────────────────────────────────────────────

export type OrderRawInput =
  | IOrder
  | (IOrder & { _id?: mongoose.Types.ObjectId | string })
  | Record<string, unknown>
  | null
  | undefined;

export function normalizeOrder(orderInput: OrderRawInput): IOrder | null {
  if (!orderInput) return null;

  const plain: Record<string, unknown> =
    typeof (orderInput as { toObject?: unknown }).toObject === 'function'
      ? (orderInput as { toObject: () => Record<string, unknown> }).toObject()
      : { ...(orderInput as Record<string, unknown>) };

  const idStr = String(plain._id || plain.id || '');
  return {
    ...plain,
    id: idStr,
    _id: idStr,
  } as unknown as IOrder;
}

// ─── Create order ────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<IOrder> {
  const deliveryCharge = input.deliveryCharge ?? 0;

  // 1. Resolve and validate stock for each item before creating the order
  const preparedItems: Array<{
    productId?: mongoose.Types.ObjectId;
    variantId?: mongoose.Types.ObjectId;
    variantName?: string;
    sku?: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    pDoc?: any;
    vDoc?: any;
  }> = [];

  for (const item of input.items) {
    let pDoc: any = null;
    let vDoc: any = null;

    if (item.productId && mongoose.isValidObjectId(item.productId)) {
      pDoc = await ProductModel.findById(item.productId).exec();
      if (pDoc && pDoc.variants && pDoc.variants.length > 0) {
        if (item.variantId) {
          vDoc = pDoc.variants.find(
            (v: any) => String(v._id) === item.variantId || v.sku === item.variantId
          );
        }
        if (!vDoc && item.sku) {
          vDoc = pDoc.variants.find((v: any) => v.sku === item.sku);
        }
        if (!vDoc && item.variantName) {
          vDoc = pDoc.variants.find(
            (v: any) => v.variantName === item.variantName || v.weight === item.variantName
          );
        }
        if (!vDoc) {
          vDoc = pDoc.variants[0];
        }

        const currentStock = Math.max(0, vDoc.stockQuantity ?? 0);
        if (currentStock < item.quantity) {
          throw new HttpError(
            400,
            `Insufficient stock for "${item.productName}" (${vDoc.variantName || 'Standard'}). Available: ${currentStock}, requested: ${item.quantity}.`
          );
        }
      }
    }

    const totalPrice = item.unitPrice * item.quantity;
    preparedItems.push({
      productId: pDoc ? pDoc._id : (item.productId && mongoose.isValidObjectId(item.productId) ? new mongoose.Types.ObjectId(item.productId) : undefined),
      variantId: vDoc ? vDoc._id : (item.variantId && mongoose.isValidObjectId(item.variantId) ? new mongoose.Types.ObjectId(item.variantId) : undefined),
      variantName: vDoc ? vDoc.variantName : item.variantName,
      sku: vDoc ? vDoc.sku : item.sku,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice,
      pDoc,
      vDoc,
    });
  }

  const items = preparedItems.map((pi) => ({
    productId: pi.productId,
    variantId: pi.variantId,
    variantName: pi.variantName,
    sku: pi.sku,
    productName: pi.productName,
    quantity: pi.quantity,
    unitPrice: pi.unitPrice,
    totalPrice: pi.totalPrice,
  }));

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalAmount = subtotal + deliveryCharge;

  let retries = 3;
  while (retries > 0) {
    try {
      const orderNumber = await generateOrderNumber();

      const orderDocument = new OrderModel({
        orderNumber,
        customerName: input.customerName,
        phone: input.phone,
        address: input.address,
        city: input.city,
        pincode: input.pincode,
        deliveryNotes: input.deliveryNotes,
        items,
        subtotal,
        deliveryCharge,
        totalAmount,
        paymentMethod: input.paymentMethod ?? 'WhatsApp COD',
        paymentStatus: 'pending',
        orderStatus: 'new',
        stockDeducted: false,
        customerNotes: input.customerNotes,
        statusHistory: [
          {
            status: 'new',
            changedAt: new Date(),
            changedBy: 'customer',
            note: 'Order placed via WhatsApp checkout',
          },
        ],
      });

      const savedOrderDoc = await orderDocument.save();

      // 2. Atomically deduct stock from MongoDB and record audit logs
      for (const pi of preparedItems) {
        if (pi.pDoc && pi.vDoc) {
          const deduction = await ProductModel.findOneAndUpdate(
            {
              _id: pi.pDoc._id,
              "variants._id": pi.vDoc._id,
              "variants.stockQuantity": { $gte: pi.quantity },
            },
            {
              $inc: { "variants.$.stockQuantity": -pi.quantity },
            },
            { new: true }
          ).exec();

          if (deduction) {
            const prevStock = pi.vDoc.stockQuantity ?? 0;
            const newStock = Math.max(0, prevStock - pi.quantity);
            await StockHistoryModel.create({
              productId: pi.pDoc._id,
              productName: pi.pDoc.name,
              variantId: pi.vDoc._id,
              variantName: pi.vDoc.variantName,
              sku: pi.vDoc.sku,
              previousStock: prevStock,
              newStock,
              quantityChanged: -pi.quantity,
              operationType: 'order_placed',
              reason: `Order placed: #${orderNumber}`,
              performedBy: `Customer: ${input.customerName}`,
              orderId: savedOrderDoc._id,
            });

            emitToAll(SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, {
              productId: String(pi.pDoc._id),
              variants: deduction.variants,
            });
          }
        }
      }

      savedOrderDoc.stockDeducted = true;
      await savedOrderDoc.save();

      const savedOrder = normalizeOrder(savedOrderDoc);
      if (!savedOrder) {
        throw new HttpError(500, 'Failed to process newly created order.');
      }

      return savedOrder;
    } catch (err: unknown) {
      const mongoErr = err as { code?: number };
      if (mongoErr?.code === 11000 && retries > 1) {
        retries--;
        await new Promise((res) => setTimeout(res, 50));
        continue;
      }
      throw err;
    }
  }
  throw new HttpError(500, 'Could not generate unique order number.');
}

// ─── List orders ─────────────────────────────────────────────────────────────

export async function listOrders(query: OrderListQuery): Promise<{
  orders: IOrder[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}> {
  const filter: Record<string, unknown> = {};

  if (query.status) filter.orderStatus = query.status;

  if (query.search) {
    const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { orderNumber: regex },
      { customerName: regex },
      { phone: regex },
    ];
  }

  const sortField = query.sortBy === 'orderNumber' ? 'orderNumber' : query.sortBy;
  const sortDir = query.sortOrder === 'asc' ? 1 : -1;

  const [rawOrders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<(IOrder & { _id: mongoose.Types.ObjectId })[]>(),
    OrderModel.countDocuments(filter),
  ]);

  return {
    orders: (rawOrders || []).map((o) => normalizeOrder(o)!),
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(total / query.limit),
  };
}

// ─── Get single order ────────────────────────────────────────────────────────

export async function getOrder(id: string): Promise<IOrder | null> {
  const cleanId = id.trim();
  let orderDocument: (IOrder & { _id: mongoose.Types.ObjectId }) | null = null;

  if (mongoose.isValidObjectId(cleanId)) {
    orderDocument = await OrderModel.findById(cleanId).lean<IOrder & { _id: mongoose.Types.ObjectId }>();
  }

  if (!orderDocument) {
    // Try by orderNumber (case-insensitive exact match)
    const escaped = cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    orderDocument = await OrderModel.findOne({
      orderNumber: new RegExp(`^${escaped}$`, 'i'),
    }).lean<IOrder & { _id: mongoose.Types.ObjectId }>();
  }

  if (!orderDocument) return null;

  return normalizeOrder(orderDocument);
}

// ─── Update order status ─────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
  adminName: string
): Promise<IOrder | null> {
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { orderNumber: id };

  const existingOrder = await OrderModel.findOne(filter).exec();
  if (!existingOrder) return null;

  const historyEntry = {
    status: input.status,
    changedAt: new Date(),
    changedBy: adminName,
    note: input.note,
  };

  // If transitioning to cancelled, restore deducted stock atomically (only once)
  if (input.status === 'cancelled' && existingOrder.stockDeducted && !existingOrder.stockRestored) {
    for (const item of existingOrder.items) {
      if (item.productId) {
        const query: Record<string, unknown> = { _id: item.productId };
        let updateQuery: Record<string, unknown>;

        if (item.variantId) {
          query['variants._id'] = item.variantId;
          updateQuery = { $inc: { 'variants.$.stockQuantity': item.quantity } };
        } else {
          // If no specific variant stored, restore to first variant
          query['variants.0'] = { $exists: true };
          updateQuery = { $inc: { 'variants.0.stockQuantity': item.quantity } };
        }

        const restored = await ProductModel.findOneAndUpdate(query, updateQuery, { new: true }).exec();

        if (restored) {
          const v = item.variantId
            ? restored.variants.find((vr: any) => String(vr._id) === String(item.variantId))
            : restored.variants[0];

          const newStock = v ? v.stockQuantity : item.quantity;
          const prevStock = Math.max(0, newStock - item.quantity);

          await StockHistoryModel.create({
            productId: item.productId,
            productName: item.productName,
            variantId: v?._id || item.variantId,
            variantName: v?.variantName || item.variantName,
            sku: v?.sku || item.sku,
            previousStock: prevStock,
            newStock,
            quantityChanged: item.quantity,
            operationType: 'order_cancelled',
            reason: `Order #${existingOrder.orderNumber} cancelled. ${input.note || ''}`.trim(),
            performedBy: adminName,
            orderId: existingOrder._id,
          });

          emitToAll(SOCKET_EVENTS.PRODUCT_STOCK_UPDATED, {
            productId: String(item.productId),
            variants: restored.variants,
          });
        }
      }
    }

    existingOrder.stockRestored = true;
  }

  existingOrder.orderStatus = input.status;
  existingOrder.statusHistory.push(historyEntry);
  const updatedOrderDocument = await existingOrder.save();

  const updatedOrder = normalizeOrder(updatedOrderDocument);

  if (updatedOrder) {
    orderEvents.emit(`order:${updatedOrder.orderNumber}`, updatedOrder);
    orderEvents.emit(`order:${String(updatedOrder._id)}`, updatedOrder);
    if (updatedOrder.phone) orderEvents.emit(`phone:${updatedOrder.phone}`, updatedOrder);
  }

  return updatedOrder;
}

// ─── Update order details ────────────────────────────────────────────────────

export async function updateOrderDetails(
  id: string,
  input: UpdateOrderDetailsInput
): Promise<IOrder | null> {
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { orderNumber: id };

  const updateData: Record<string, unknown> = {};
  if (input.customerName !== undefined) updateData.customerName = input.customerName;
  if (input.phone !== undefined) updateData.phone = input.phone;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.city !== undefined) updateData.city = input.city;
  if (input.pincode !== undefined) updateData.pincode = input.pincode;
  if (input.deliveryNotes !== undefined) updateData.deliveryNotes = input.deliveryNotes;
  if (input.adminNotes !== undefined) updateData.adminNotes = input.adminNotes;
  if (input.paymentStatus !== undefined) updateData.paymentStatus = input.paymentStatus;
  if (input.courierName !== undefined) updateData.courierName = input.courierName;
  if (input.trackingNumber !== undefined) updateData.trackingNumber = input.trackingNumber;
  if (input.trackingUrl !== undefined) updateData.trackingUrl = input.trackingUrl;
  if (input.estimatedDelivery !== undefined) updateData.estimatedDelivery = input.estimatedDelivery;

  const updatedOrderDocument = await OrderModel.findOneAndUpdate(
    filter,
    { $set: updateData },
    { new: true }
  ).lean<IOrder & { _id: mongoose.Types.ObjectId }>();

  const updatedOrder = normalizeOrder(updatedOrderDocument);

  if (updatedOrder) {
    orderEvents.emit(`order:${updatedOrder.orderNumber}`, updatedOrder);
    orderEvents.emit(`order:${String(updatedOrder._id)}`, updatedOrder);
    if (updatedOrder.phone) orderEvents.emit(`phone:${updatedOrder.phone}`, updatedOrder);
  }

  return updatedOrder;
}

// ─── Order stats ─────────────────────────────────────────────────────────────

export async function getOrderStats(): Promise<{
  total: number;
  byStatus: Record<string, number>;
  totalRevenue: number;
  recentOrders: IOrder[];
}> {
  const [counts, revenue, recentOrders] = await Promise.all([
    OrderModel.aggregate([
      { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
    ]) as Promise<{ _id: string; count: number }[]>,
    OrderModel.aggregate([
      { $match: { orderStatus: { $in: ['delivered', 'shipped', 'out_for_delivery', 'processing', 'confirmed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]) as Promise<{ total: number }[]>,
    OrderModel.find({}).sort({ createdAt: -1 }).limit(5).lean<IOrder[]>(),
  ]);

  const total = (counts as { _id: string; count: number }[]).reduce((acc, c) => acc + c.count, 0);
  const byStatus: Record<string, number> = {};
  for (const c of counts as { _id: string; count: number }[]) {
    byStatus[c._id] = c.count;
  }

  const revenueArr = revenue as { total?: number }[];
  const totalRevenue = revenueArr[0]?.total ?? 0;

  return {
    total,
    byStatus,
    totalRevenue,
    recentOrders: (recentOrders || []).map((o) => normalizeOrder(o)!),
  };
}

// ─── Customer: Track orders securely (Order ID + Registered Phone) ────────────

export async function trackOrderSecure(orderId: string, phone: string): Promise<IOrder[]> {
  const cleanId = orderId.trim();
  const cleanPhone = phone.trim();

  if (!cleanId) {
    throw new HttpError(400, 'Order ID is required.', 'VALIDATION_ERROR');
  }
  if (!cleanPhone) {
    throw new HttpError(400, 'Registered mobile number is required.', 'VALIDATION_ERROR');
  }

  const normalizedInputPhone = normalizePhoneNumber(cleanPhone);
  if (normalizedInputPhone.length < 7) {
    throw new HttpError(400, 'Please enter a valid mobile number with at least 7 digits.', 'INVALID_PHONE');
  }

  // 1. Locate the order by orderNumber (case-insensitive exact match) or MongoDB _id
  const escapedId = cleanId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const conditions: Record<string, unknown>[] = [
    { orderNumber: new RegExp(`^${escapedId}$`, 'i') },
  ];

  if (mongoose.isValidObjectId(cleanId)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(cleanId) });
  }

  const orderDocument = await OrderModel.findOne({ $or: conditions }).lean<IOrder & { _id: mongoose.Types.ObjectId }>();
  if (!orderDocument) {
    throw new HttpError(
      404,
      `No order found matching Order ID "${cleanId}". Please check your Order ID and try again.`,
      'ORDER_NOT_FOUND'
    );
  }

  // 2. Validate mobile number against the order record
  const orderPhoneNormalized = normalizePhoneNumber(orderDocument.phone);
  if (orderPhoneNormalized !== normalizedInputPhone) {
    throw new HttpError(
      403,
      'The mobile number provided does not match the registered records for this Order ID.',
      'PHONE_MISMATCH'
    );
  }

  // 3. Format primary order with explicit id
  const formattedPrimaryOrder = normalizeOrder(orderDocument)!;

  // 4. Also fetch any other previous orders belonging to this verified customer's phone number
  const relatedDocuments = await OrderModel.find({
    _id: { $ne: orderDocument._id },
    phone: new RegExp(normalizedInputPhone.slice(-10), 'i'),
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean<(IOrder & { _id: mongoose.Types.ObjectId })[]>();

  const formattedRelated = (relatedDocuments || []).map((ro) => normalizeOrder(ro)!);

  return [formattedPrimaryOrder, ...formattedRelated];
}

// ─── Customer: Track orders (Legacy fallback) ──────────────────────────────────

export async function trackOrders(query: string): Promise<IOrder[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const digits = trimmed.replace(/\D/g, '');

  const conditions: Record<string, unknown>[] = [
    { orderNumber: new RegExp(`^${escaped}$`, 'i') },
    { trackingNumber: new RegExp(`^${escaped}$`, 'i') },
  ];

  if (mongoose.isValidObjectId(trimmed)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(trimmed) });
  }

  if (digits.length >= 7) {
    conditions.push({ phone: new RegExp(digits.slice(-10), 'i') });
  }

  const trackedDocuments = await OrderModel.find({ $or: conditions })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean<(IOrder & { _id: mongoose.Types.ObjectId })[]>();

  return (trackedDocuments || []).map((d) => normalizeOrder(d)!);
}
