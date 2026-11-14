import { SITE_SETTINGS } from '@/data/mockData';

export interface WhatsAppOrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal?: number;
}

export interface WhatsAppOrderMessageParams {
  customerName?: string;
  phone?: string;
  items: WhatsAppOrderItem[];
  totalAmount?: number;
  deliveryAddress?: string;
}

export interface WhatsAppEnquiryMessageParams {
  customerName?: string;
  phone?: string;
  message?: string;
}

/**
 * Normalizes phone numbers to a clean numeric string for WhatsApp URLs.
 * If 10 digits, prepends Indian country code '91'.
 */
export function cleanWhatsAppPhone(phone?: string): string {
  const fallback = SITE_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '');
  if (!phone) {
    return fallback;
  }
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) {
    return fallback;
  }
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Builds the complete wa.me URL with properly encoded message.
 */
export function getWhatsAppUrl(phone: string | undefined, message: string): string {
  const cleanPhone = cleanWhatsAppPhone(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Builds clean plain-text customer enquiry message.
 * Format:
 * YUMNEST - NEW CUSTOMER ENQUIRY
 *
 * Customer Name: [Customer Name]
 *
 * Phone Number: [Customer Phone Number]
 *
 * Message:
 * [Customer Message]
 *
 * Thank you for contacting Yumnest. We look forward to assisting you.
 */
export function buildWhatsAppEnquiryMessage(params: WhatsAppEnquiryMessageParams): string {
  const customerName = params.customerName?.trim() || 'Not provided';
  const phoneNumber = params.phone?.trim() || 'Not provided';
  const customerMessage =
    params.message?.trim() || 'I would like to enquire about Yumnest products and services.';

  return [
    'YUMNEST - NEW CUSTOMER ENQUIRY',
    '',
    `Customer Name: ${customerName}`,
    '',
    `Phone Number: ${phoneNumber}`,
    '',
    'Message:',
    customerMessage,
    '',
    'Thank you for contacting Yumnest. We look forward to assisting you.',
  ].join('\n');
}

/**
 * Builds clean plain-text order request message.
 * Supports both multi-product cart orders and single product direct orders.
 * Format:
 * YUMNEST - NEW ORDER REQUEST
 *
 * Customer Name: [Customer Name]
 *
 * Phone Number: [Customer Phone Number]
 *
 * Order Details:
 *
 * Product: [Product Name]
 * Quantity: [Quantity]
 * Price: ₹[Product Price]
 * Subtotal: ₹[Subtotal]
 *
 * Total Amount: ₹[Total Amount]
 *
 * Delivery Address:
 * [Customer Delivery Address]
 *
 * Please confirm the order and provide the delivery details.
 *
 * Thank you.
 */
export function buildWhatsAppOrderMessage(params: WhatsAppOrderMessageParams): string {
  const parts: string[] = ['YUMNEST - NEW ORDER REQUEST'];

  const customerName = params.customerName?.trim();
  const phone = params.phone?.trim();

  if (customerName || phone) {
    parts.push('');
    if (customerName) {
      parts.push(`Customer Name: ${customerName}`);
    }
    if (phone) {
      if (customerName) parts.push('');
      parts.push(`Phone Number: ${phone}`);
    }
  }

  parts.push('');
  parts.push('Order Details:');
  parts.push('');

  const productBlocks = params.items.map((item) => {
    const subtotal = item.subtotal !== undefined ? item.subtotal : item.price * item.quantity;
    return [
      `Product: ${item.name}`,
      `Quantity: ${item.quantity}`,
      `Price: ₹${item.price}`,
      `Subtotal: ₹${subtotal}`,
    ].join('\n');
  });

  parts.push(productBlocks.join('\n\n'));

  const calculatedTotal =
    params.totalAmount !== undefined
      ? params.totalAmount
      : params.items.reduce((sum, item) => sum + (item.subtotal ?? item.price * item.quantity), 0);

  parts.push('');
  parts.push(`Total Amount: ₹${calculatedTotal}`);

  const deliveryAddress = params.deliveryAddress?.trim();
  if (deliveryAddress) {
    parts.push('');
    parts.push('Delivery Address:');
    parts.push(deliveryAddress);
  }

  parts.push('');
  parts.push('Please confirm the order and provide the delivery details.');
  parts.push('');
  parts.push('Thank you.');

  return parts.join('\n');
}

/**
 * Builds clean plain-text wholesale enquiry message.
 */
export function buildWhatsAppWholesaleMessage(params: {
  enquiryId: string;
  fullName: string;
  businessName: string;
  location: string;
  products: string[];
  quantity: string;
}): string {
  return [
    'YUMNEST - WHOLESALE ENQUIRY',
    '',
    `Enquiry ID: ${params.enquiryId}`,
    `Customer Name: ${params.fullName}`,
    `Business Name: ${params.businessName}`,
    `Location: ${params.location}`,
    `Interested Products: ${params.products.join(', ')}`,
    `Required Quantity: ${params.quantity}`,
    '',
    'Hello Yumnest! I have submitted this wholesale enquiry online. Please share the wholesale catalog and pricing details.',
    '',
    'Thank you.',
  ].join('\n');
}

/**
 * Builds clean plain-text distributor application message.
 */
export function buildWhatsAppDistributorMessage(params: {
  applicationId: string;
  fullName: string;
  businessName: string;
  location: string;
  businessType: string;
  categories: string[];
}): string {
  return [
    'YUMNEST - DISTRIBUTOR APPLICATION',
    '',
    `Application ID: ${params.applicationId}`,
    `Applicant Name: ${params.fullName}`,
    `Business Name: ${params.businessName}`,
    `Location: ${params.location}`,
    `Business Type: ${params.businessType}`,
    `Categories: ${params.categories.join(', ')}`,
    '',
    'Hello Yumnest! I have submitted an application to become an authorized distributor. Looking forward to partnering with your brand.',
    '',
    'Thank you.',
  ].join('\n');
}

/**
 * Builds clean plain-text order support message.
 */
export function buildWhatsAppOrderSupportMessage(params: {
  customerName?: string;
  orderNumber: string;
  totalAmount?: number;
}): string {
  const parts = ['YUMNEST - ORDER SUPPORT', ''];
  if (params.customerName?.trim()) {
    parts.push(`Customer Name: ${params.customerName.trim()}`);
    parts.push('');
  }
  parts.push(`Order Reference: ${params.orderNumber}`);
  if (params.totalAmount !== undefined) {
    parts.push(`Total Amount: ₹${params.totalAmount}`);
  }
  parts.push('');
  parts.push('Hello Yumnest Team! I would like to check the fulfillment status and delivery updates of my order.');
  parts.push('');
  parts.push('Thank you.');
  return parts.join('\n');
}

/**
 * General clean plain-text support and greeting messages without emojis or decorative characters.
 */
export const DEFAULT_WHATSAPP_SUPPORT_MESSAGE =
  'Hello Yumnest! I would like to know more about your traditional spices and delivery options.';

export const DEFAULT_WHATSAPP_FLOAT_MESSAGE =
  'Hello Yumnest! I would like to order authentic Kerala spices and broast powders. Please assist me with product details.';
