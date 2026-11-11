import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  updateOrderDetails,
  getOrderStats,
  trackOrders,
  trackOrderSecure,
} from '../services/order.service';
import type {
  CreateOrderInput,
  UpdateOrderStatusInput,
  UpdateOrderDetailsInput,
  OrderListQuery,
} from '../validators/order.validators';

// ─── Public: Customer creates order ─────────────────────────────────────────

export async function createOrderController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreateOrderInput;
    const order = await createOrder(input);
    res.status(201).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// ─── Public: Customer tracks order ──────────────────────────────────────────

export async function trackCustomerOrdersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const orderId = String(req.body?.orderId || req.query.orderId || '').trim();
    const phone = String(req.body?.phone || req.query.phone || '').trim();
    const query = String(req.query.query || req.body?.query || '').trim();

    // 1. Preferred secure flow: Order ID + Customer Mobile number
    if (orderId && phone) {
      const orders = await trackOrderSecure(orderId, phone);
      res.json({ success: true, data: orders });
      return;
    }

    if (orderId && !phone) {
      return next(
        new HttpError(
          400,
          'Please provide your registered mobile number alongside the Order ID to verify and view order details.',
          'PHONE_REQUIRED'
        )
      );
    }

    // 2. Legacy / fallback query flow
    if (query) {
      const orders = await trackOrders(query);
      res.json({ success: true, data: orders });
      return;
    }

    res.json({ success: true, data: [] });
  } catch (error) {
    next(error);
  }
}

// ─── Admin: List orders ──────────────────────────────────────────────────────

export async function listOrdersController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as OrderListQuery;
    const result = await listOrders(query);
    res.json({
      success: true,
      data: result.orders,
      meta: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages,
      },
    });
  } catch (error) {
    next(error);
  }
}

// ─── Admin: Get single order ─────────────────────────────────────────────────

export async function getOrderController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const order = await getOrder(id);
    if (!order) {
      return next(new HttpError(404, 'Order not found', 'NOT_FOUND'));
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// ─── Admin: Update order status ──────────────────────────────────────────────

export async function updateOrderStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateOrderStatusInput;
    const adminName = req.auth?.name ?? 'admin';

    const order = await updateOrderStatus(id, input, adminName);
    if (!order) {
      return next(new HttpError(404, 'Order not found', 'NOT_FOUND'));
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// ─── Admin: Update order details ─────────────────────────────────────────────

export async function updateOrderDetailsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params as { id: string };
    const input = req.body as UpdateOrderDetailsInput;

    const order = await updateOrderDetails(id, input);
    if (!order) {
      return next(new HttpError(404, 'Order not found', 'NOT_FOUND'));
    }
    res.json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
}

// ─── Admin: Get order stats ──────────────────────────────────────────────────

export async function getOrderStatsController(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await getOrderStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
