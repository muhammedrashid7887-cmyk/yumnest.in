import mongoose from 'mongoose';
import { OrderModel, type IOrder } from '../models/order.model';
import type { CreateOrderInput, UpdateOrderStatusInput, UpdateOrderDetailsInput, OrderListQuery } from '../validators/order.validators';

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
  const orderNumber = await generateOrderNumber();

  const deliveryCharge = input.deliveryCharge ?? 0;

  const items = input.items.map((item) => {
    const totalPrice = item.unitPrice * item.quantity;
    return {
      productId: item.productId ? new mongoose.Types.ObjectId(item.productId) : undefined,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice,
    };
  });

  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0);
  const totalAmount = subtotal + deliveryCharge;

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

  return order.save();
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

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .sort({ [sortField]: sortDir })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit)
      .lean<IOrder[]>(),
    OrderModel.countDocuments(filter),
  ]);

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
  if (mongoose.isValidObjectId(id)) {
    return OrderModel.findById(id).lean<IOrder>();
  }
  // Try by orderNumber
  return OrderModel.findOne({ orderNumber: id }).lean<IOrder>();
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
