import type { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';
import { orderEvents } from '../services/orderEvents';
import { emitToAdmin, emitToOrder } from '../services/socket.service';
import { SOCKET_EVENTS } from '../constants/socket-events';
import {
  createOrder,
  listOrders,
  getOrder,
  updateOrderStatus,
  updateOrderDetails,
  getOrderStats,
  trackOrders,
  trackOrderSecure,
  type OrderSocketPayload,
  type OrderNotificationPayload,
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

    // Emit live order to admin room immediately
    const orderPayload: OrderSocketPayload = { order };
    const notificationPayload: OrderNotificationPayload = {
      type: 'order',
      title: 'New Order Received',
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      totalAmount: order.totalAmount,
      timestamp: new Date().toISOString(),
    };

    emitToAdmin(SOCKET_EVENTS.ORDER_CREATED, orderPayload);
    emitToAdmin(SOCKET_EVENTS.NOTIFICATION_NEW, notificationPayload);

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

// ─── Real-Time: Stream order status & tracking updates (SSE) ─────────────────

export async function streamOrderUpdatesController(
  req: Request,
  res: Response,
  _next: NextFunction
): Promise<void> {
  const { orderNumber } = req.params as { orderNumber: string };
  if (!orderNumber) {
    res.status(400).end();
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send initial connected payload
  res.write(`data: ${JSON.stringify({ type: 'connected', orderNumber, timestamp: new Date().toISOString() })}\n\n`);

  const onUpdate = (order: unknown) => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'orderUpdate', order })}\n\n`);
    } catch {
      // client connection closed
    }
  };

  orderEvents.on(`order:${orderNumber}`, onUpdate);

  // Keep-alive heartbeat every 20 seconds to prevent proxy / NAT dropouts
  const heartbeat = setInterval(() => {
    try {
      res.write(': keepalive\n\n');
    } catch {
      clearInterval(heartbeat);
    }
  }, 20000);

  req.on('close', () => {
    clearInterval(heartbeat);
    orderEvents.off(`order:${orderNumber}`, onUpdate);
    res.end();
  });
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

    // Real-time broadcast: to customer order room + admin room
    const statusPayload: OrderSocketPayload = { order };
    emitToOrder(order.orderNumber, SOCKET_EVENTS.ORDER_STATUS_UPDATED, statusPayload);
    orderEvents.emitOrderUpdate(order);

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

    // Real-time broadcast: to customer order room + admin room
    const updatePayload: OrderSocketPayload = { order };
    emitToOrder(order.orderNumber, SOCKET_EVENTS.ORDER_UPDATED, updatePayload);
    orderEvents.emitOrderUpdate(order);

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
