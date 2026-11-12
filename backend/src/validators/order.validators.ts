import { z } from 'zod';

const phone = z.string().trim().min(10).max(20).regex(/^[0-9+\-\s()]+$/, 'Must be a valid phone number');
const pincode = z.string().trim().min(6).max(10).regex(/^[0-9]+$/, 'Must be a numeric PIN code');

export const createOrderSchema = z.object({
  customerName: z.string().trim().min(1).max(200),
  phone,
  address: z.string().trim().min(1).max(500),
  city: z.string().trim().min(1).max(100),
  pincode,
  deliveryNotes: z.string().trim().max(500).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().trim().optional(),
        variantId: z.string().trim().optional(),
        variantName: z.string().trim().max(100).optional(),
        sku: z.string().trim().max(80).optional(),
        productName: z.string().trim().min(1).max(200),
        quantity: z.number().int().min(1),
        unitPrice: z.number().min(0),
      })
    )
    .min(1)
    .max(100),
  deliveryCharge: z.number().min(0).optional(),
  paymentMethod: z.string().trim().max(100).optional(),
  customerNotes: z.string().trim().max(1000).optional(),
});

const orderStatusEnum = z.enum([
  'new',
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]);

export const updateOrderStatusSchema = z.object({
  status: orderStatusEnum,
  note: z.string().trim().max(1000).optional(),
});

export const updateOrderDetailsSchema = z.object({
  customerName: z.string().trim().min(1).max(200).optional(),
  phone: phone.optional(),
  address: z.string().trim().min(1).max(500).optional(),
  city: z.string().trim().min(1).max(100).optional(),
  pincode: pincode.optional(),
  deliveryNotes: z.string().trim().max(500).optional(),
  adminNotes: z.string().trim().max(2000).optional(),
  paymentStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  courierName: z.string().trim().max(100).optional(),
  trackingNumber: z.string().trim().max(100).optional(),
  trackingUrl: z.string().trim().max(500).optional(),
  estimatedDelivery: z.string().trim().max(100).optional(),
});

export const orderListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: orderStatusEnum.optional(),
  sortBy: z.enum(['createdAt', 'totalAmount', 'orderNumber']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const trackOrderSchema = z.object({
  orderId: z.string().trim().min(1, 'Order ID is required').max(100),
  phone: z.string().trim().min(7, 'Mobile number is required').max(25),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderDetailsInput = z.infer<typeof updateOrderDetailsSchema>;
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;
export type TrackOrderInput = z.infer<typeof trackOrderSchema>;
