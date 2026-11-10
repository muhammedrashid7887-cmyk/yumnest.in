import { Router } from 'express';
import type { Environment } from '../config/env';
import { requireAuthenticatedAdmin } from '../middleware/auth';
import { validateBody } from '../middleware/validateBody';
import { validateQuery } from '../middleware/validateQuery';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updateOrderDetailsSchema,
  orderListQuerySchema,
} from '../validators/order.validators';
import {
  createOrderController,
  trackCustomerOrdersController,
  listOrdersController,
  getOrderController,
  updateOrderStatusController,
  updateOrderDetailsController,
  getOrderStatsController,
} from '../controllers/order.controller';

export function orderRouter(env: Environment): Router {
  const router = Router();
  const authenticated = requireAuthenticatedAdmin(env);

  // ── Public (customer checkout & tracking — no auth) ───────────────────────
  router.post('/orders', validateBody(createOrderSchema), createOrderController);
  router.get('/orders/track', trackCustomerOrdersController);

  // ── Admin only ────────────────────────────────────────────────────────────
  router.get('/admin/orders/stats', authenticated, getOrderStatsController);
  router.get('/admin/orders', authenticated, validateQuery(orderListQuerySchema), listOrdersController);
  router.get('/admin/orders/:id', authenticated, getOrderController);
  router.patch('/admin/orders/:id/status', authenticated, validateBody(updateOrderStatusSchema), updateOrderStatusController);
  router.patch('/admin/orders/:id', authenticated, validateBody(updateOrderDetailsSchema), updateOrderDetailsController);

  return router;
}
