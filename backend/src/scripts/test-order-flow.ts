import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { loadEnvironment } from '../config/env';
import {
  createOrder,
  getOrder,
  listOrders,
  updateOrderStatus,
  updateOrderDetails,
  getOrderStats,
} from '../services/order.service';
import { OrderModel } from '../models/order.model';

async function main() {
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // 1. Create a test order
  console.log('Creating test order…');
  const testOrder = await createOrder({
    customerName: 'Adhil Test Customer',
    phone: '9847012345',
    address: '14/204 Spice Villa, MG Road',
    city: 'Kochi',
    pincode: '682001',
    deliveryNotes: 'Please call before arrival',
    items: [
      {
        productName: 'Broast Masala Powder (250g)',
        quantity: 2,
        unitPrice: 140,
      },
      {
        productName: 'Black Pepper (100g)',
        quantity: 1,
        unitPrice: 180,
      },
    ],
    deliveryCharge: 0,
    paymentMethod: 'WhatsApp COD',
  });

  console.log('✅ Created order successfully:');
  console.log({
    id: testOrder.id,
    orderNumber: testOrder.orderNumber,
    customerName: testOrder.customerName,
    subtotal: testOrder.subtotal,
    deliveryCharge: testOrder.deliveryCharge,
    totalAmount: testOrder.totalAmount,
    orderStatus: testOrder.orderStatus,
    statusHistoryCount: testOrder.statusHistory.length,
  });

  // 2. Fetch order by orderNumber
  const fetched = await getOrder(testOrder.orderNumber);
  if (!fetched || fetched.orderNumber !== testOrder.orderNumber) {
    throw new Error('Failed to retrieve order by orderNumber');
  }
  console.log('✅ Successfully retrieved order by orderNumber');

  // 3. Search order in list
  const list = await listOrders({
    page: 1,
    limit: 10,
    search: 'Adhil',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  if (!list.orders.some((o) => o.orderNumber === testOrder.orderNumber)) {
    throw new Error('Order not found in search results');
  }
  console.log(`✅ Found order in listOrders search (total matching: ${list.total})`);

  // 4. Update status: new -> confirmed
  const confirmed = await updateOrderStatus(
    testOrder.id || testOrder.orderNumber,
    { status: 'confirmed', note: 'Customer confirmed via WhatsApp chat' },
    'Admin Owner'
  );
  if (!confirmed || confirmed.orderStatus !== 'confirmed') {
    throw new Error('Failed to update status to confirmed');
  }
  console.log('✅ Order status updated to confirmed. History entries:', confirmed.statusHistory.length);

  // 5. Update status: confirmed -> processing
  const processing = await updateOrderStatus(
    testOrder.id || testOrder.orderNumber,
    { status: 'processing', note: 'Packing spices at warehouse' },
    'Admin Owner'
  );
  if (!processing || processing.orderStatus !== 'processing') {
    throw new Error('Failed to update status to processing');
  }
  console.log('✅ Order status updated to processing. History entries:', processing.statusHistory.length);

  // 6. Update order details (admin notes)
  const updatedDetails = await updateOrderDetails(testOrder.id || testOrder.orderNumber, {
    adminNotes: 'High priority customer; extra sample pack included.',
  });
  if (!updatedDetails || updatedDetails.adminNotes !== 'High priority customer; extra sample pack included.') {
    throw new Error('Failed to update admin notes');
  }
  console.log('✅ Admin notes successfully updated');

  // 7. Verify stats
  const stats = await getOrderStats();
  console.log('✅ Stats computed successfully:');
  console.log({
    total: stats.total,
    byStatus: stats.byStatus,
    totalRevenue: stats.totalRevenue,
    recentOrdersCount: stats.recentOrders.length,
  });

  console.log('\n🎉 ALL ORDER BACKEND TESTS PASSED SUCCESSFULLY!');
  await disconnectFromDatabase();
}

main().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
