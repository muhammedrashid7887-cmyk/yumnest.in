import mongoose from 'mongoose';
import { OrderModel, type IOrder } from '../models/order.model';
import { HttpError } from '../utils/httpError';
import type { CreateOrderInput, UpdateOrderStatusInput, UpdateOrderDetailsInput, OrderListQuery } from '../validators/order.validators';

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

// ─── Create order ────────────────────────────────────────────────────────────

export async function createOrder(input: CreateOrderInput): Promise<IOrder> {
  const deliveryCharge = input.deliveryCharge ?? 0;

  const items = input.items.map((item) => {
    const totalPrice = item.unitPrice * item.quantity;
    return {
      productId: item.productId && mongoose.isValidObjectId(item.productId) ? new mongoose.Types.ObjectId(item.productId) : undefined,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice,
    };
  });

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalAmount = subtotal + deliveryCharge;

  let retries = 3;
  while (retries > 0) {
    try {
      const orderNumber = await generateOrderNumber();

      const order = new OrderModel({
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

      const saved = await order.save();
      const obj = saved.toObject();
      return {
        ...obj,
        id: String(saved._id),
      } as unknown as IOrder;
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

  const orders = rawOrders.map((o) => ({
    ...o,
    id: String(o._id),
  }));

  return {
    orders,
    total,
    page: query.page,
    limit: query.limit,
    pages: Math.ceil(total / query.limit),
  };
}

// ─── Get single order ────────────────────────────────────────────────────────

export async function getOrder(id: string): Promise<IOrder | null> {
  let doc: (IOrder & { _id: mongoose.Types.ObjectId }) | null = null;
  if (mongoose.isValidObjectId(id)) {
    doc = await OrderModel.findById(id).lean<IOrder & { _id: mongoose.Types.ObjectId }>();
  }
  if (!doc) {
    // Try by orderNumber (case-insensitive)
    doc = await OrderModel.findOne({
      orderNumber: new RegExp(`^${id.trim()}$`, 'i'),
    }).lean<IOrder & { _id: mongoose.Types.ObjectId }>();
  }
  if (!doc) return null;
  return {
    ...doc,
    id: String(doc._id),
  };
}

// ─── Update order status ─────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatusInput,
  adminName: string
): Promise<IOrder | null> {
  const filter = mongoose.isValidObjectId(id) ? { _id: id } : { orderNumber: id };

  const historyEntry = {
    status: input.status,
    changedAt: new Date(),
    changedBy: adminName,
    note: input.note,
  };

  return OrderModel.findOneAndUpdate(
    filter,
    {
      $set: { orderStatus: input.status },
      $push: { statusHistory: historyEntry },
    },
    { new: true }
  ).lean<IOrder>();
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

  return OrderModel.findOneAndUpdate(filter, { $set: updateData }, { new: true }).lean<IOrder>();
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

  return { total, byStatus, totalRevenue, recentOrders };
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

  const order = await OrderModel.findOne({ $or: conditions }).lean<IOrder & { _id: mongoose.Types.ObjectId }>();
  if (!order) {
    throw new HttpError(
      404,
      `No order found matching Order ID "${cleanId}". Please check your Order ID and try again.`,
      'ORDER_NOT_FOUND'
    );
  }

  // 2. Validate mobile number against the order record
  const orderPhoneNormalized = normalizePhoneNumber(order.phone);
  if (orderPhoneNormalized !== normalizedInputPhone) {
    throw new HttpError(
      403,
      'The mobile number provided does not match the registered records for this Order ID.',
      'PHONE_MISMATCH'
    );
  }

  // 3. Format primary order with explicit id
  const formattedPrimaryOrder: IOrder = {
    ...order,
    id: String(order._id),
  };

  // 4. Also fetch any other previous orders belonging to this verified customer's phone number
  const relatedOrders = await OrderModel.find({
    _id: { $ne: order._id },
    phone: new RegExp(normalizedInputPhone.slice(-10), 'i'),
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean<(IOrder & { _id: mongoose.Types.ObjectId })[]>();

  const formattedRelated = relatedOrders.map((ro) => ({
    ...ro,
    id: String(ro._id),
  }));

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
  ];

  if (mongoose.isValidObjectId(trimmed)) {
    conditions.push({ _id: new mongoose.Types.ObjectId(trimmed) });
  }

  if (digits.length >= 7) {
    conditions.push({ phone: new RegExp(digits.slice(-10), 'i') });
  }

  const rawOrders = await OrderModel.find({ $or: conditions })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean<(IOrder & { _id: mongoose.Types.ObjectId })[]>();

  return rawOrders.map((o) => ({
    ...o,
    id: String(o._id),
  }));
}
