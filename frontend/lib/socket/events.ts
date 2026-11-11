/**
 * Centralized Socket.IO Event Names for Yumnest Frontend
 * Matches backend/src/constants/socket-events.ts exactly.
 */
export const SOCKET_EVENTS = {
  // Connection & Room Management
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ORDER_TRACK: 'order:track',
  ORDER_UNTRACK: 'order:untrack',
  ADMIN_JOIN: 'admin:join',
  ADMIN_LEAVE: 'admin:leave',

  // Video Management (Admin -> Customer)
  VIDEO_CREATED: 'video:created',
  VIDEO_UPDATED: 'video:updated',
  VIDEO_PUBLISHED: 'video:published',
  VIDEO_UNPUBLISHED: 'video:unpublished',
  VIDEO_DELETED: 'video:deleted',

  // Product Management (Admin -> Customer)
  PRODUCT_CREATED: 'product:created',
  PRODUCT_UPDATED: 'product:updated',
  PRODUCT_DELETED: 'product:deleted',
  PRODUCT_STOCK_UPDATED: 'product:stock_updated',

  // Category Management (Admin -> Customer)
  CATEGORY_CREATED: 'category:created',
  CATEGORY_UPDATED: 'category:updated',
  CATEGORY_DELETED: 'category:deleted',

  // Order Management (Admin <-> Customer)
  ORDER_CREATED: 'order:created',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  ORDER_UPDATED: 'order:updated',

  // Offers and Promotions
  OFFER_UPDATED: 'offer:updated',

  // Reviews and Enquiries (Customer <-> Admin)
  ENQUIRY_CREATED: 'enquiry:created',
  ENQUIRY_STATUS_UPDATED: 'enquiry:status_updated',
  REVIEW_CREATED: 'review:created',
  REVIEW_STATUS_UPDATED: 'review:status_updated',

  // Live Admin Notification Badges
  NOTIFICATION_NEW: 'notification:new',
} as const;

export type SocketEventName = typeof SOCKET_EVENTS[keyof typeof SOCKET_EVENTS];
