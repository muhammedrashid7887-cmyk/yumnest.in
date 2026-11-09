import OrderManager from './OrderManager';

export const instant = false;

export const metadata = {
  title: 'Order Management | Yum Nest Admin',
  description: 'Manage customer orders, track fulfillment statuses, and WhatsApp integrations.',
};

export default function AdminOrdersPage() {
  return <OrderManager />;
}
