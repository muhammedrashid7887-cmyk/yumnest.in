import { connectToDatabase, disconnectFromDatabase } from '../config/database';
import { loadEnvironment } from '../config/env';
import { createOrder, trackOrderSecure, getOrder } from '../services/order.service';

async function runGuestTrackingTests() {
  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // TEST 1: Place an order without logging in (Guest checkout)
  console.log('\n--- TEST 1: Guest places an order ---');
  const testPhone = '9847123456';
  const newOrder = await createOrder({
    customerName: 'Guest Tester',
    phone: testPhone,
    address: 'Near Beach Road, Fort Kochi',
    city: 'Kochi',
    pincode: '682001',
    deliveryNotes: 'Drop at security desk',
    items: [
      {
        productName: 'Broast Masala Powder (250g)',
        quantity: 1,
        unitPrice: 140,
      },
    ],
    deliveryCharge: 40,
    paymentMethod: 'WhatsApp COD',
  });

  // TEST 2: Copy the generated Order ID
  console.log('\n--- TEST 2: Verify generated Order ID ---');
  const orderId = newOrder.orderNumber;
  console.log(`✅ Order placed successfully! Order ID: ${orderId}`);
  if (!orderId || !orderId.startsWith('YN-')) {
    throw new Error(`Invalid Order ID generated: ${orderId}`);
  }

  // TEST 3 & 4: Simulate Phone B / separate browser tracking with correct Order ID + Phone number
  console.log('\n--- TEST 3 & 4: Separate device tracking with Order ID + Phone ---');
  const trackingResults = await trackOrderSecure(orderId, testPhone);
  if (!trackingResults || trackingResults.length === 0) {
    throw new Error('TEST 4 FAILED: Order was not found via trackOrderSecure!');
  }
  const retrieved = trackingResults[0];
  console.log(`✅ Successfully tracked order! Customer: ${retrieved.customerName}, Status: ${retrieved.orderStatus}`);
  console.log(`✅ Verified id property exists: ${retrieved.id}`);
  if (retrieved.orderNumber !== orderId) {
    throw new Error('TEST 4 FAILED: Order number mismatch!');
  }
  if (!retrieved.id) {
    throw new Error('TEST 4 FAILED: Order id property is missing!');
  }

  // Also test with Indian phone variations (+91, spaces)
  console.log('\n--- TEST 4B: Testing phone number formats (+91, leading 0, spaces) ---');
  const variation1 = await trackOrderSecure(orderId, `+91 ${testPhone.slice(0, 5)} ${testPhone.slice(5)}`);
  if (!variation1 || variation1[0].orderNumber !== orderId) {
    throw new Error('TEST 4B FAILED: +91 format did not match!');
  }
  console.log('✅ +91 format matched seamlessly');

  const variation2 = await trackOrderSecure(orderId.toLowerCase(), `0${testPhone}`);
  if (!variation2 || variation2[0].orderNumber !== orderId) {
    throw new Error('TEST 4B FAILED: Leading 0 or lowercase Order ID did not match!');
  }
  console.log('✅ Case-insensitive order ID & leading 0 phone matched seamlessly');

  // TEST 5: Try an incorrect mobile number -> EXPECTED RESULT: Reject / Do not reveal details
  console.log('\n--- TEST 5: Mismatched mobile number rejection ---');
  let rejected = false;
  try {
    await trackOrderSecure(orderId, '9999999999');
  } catch (err: any) {
    rejected = true;
    console.log(`✅ Correctly rejected with status ${err.statusCode || err.status}: ${err.message}`);
  }
  if (!rejected) {
    throw new Error('TEST 5 FAILED: Incorrect phone number was not rejected!');
  }

  // TEST 6: Non-existent order ID
  console.log('\n--- TEST 6: Non-existent Order ID ---');
  let notFound = false;
  try {
    await trackOrderSecure('YN-9999-9999', testPhone);
  } catch (err: any) {
    notFound = true;
    console.log(`✅ Correctly returned 404 for non-existent order: ${err.message}`);
  }
  if (!notFound) {
    throw new Error('TEST 6 FAILED: Non-existent order did not return 404!');
  }

  // TEST 7: Verify that existing orders in MongoDB are still accessible
  console.log('\n--- TEST 7: Existing order retrieval ---');
  const existingOrder = await getOrder('YN-2026-0001');
  if (!existingOrder) {
    throw new Error('TEST 7 FAILED: Could not retrieve existing order YN-2026-0001!');
  }
  console.log(`✅ Existing order YN-2026-0001 retrieved cleanly: Customer: ${existingOrder.customerName}, id: ${existingOrder.id}`);

  console.log('\n🎉 ALL 7 GUEST TRACKING TESTS PASSED FLAWLESSLY!');
  await disconnectFromDatabase();
}

runGuestTrackingTests().catch((err) => {
  console.error('❌ Tests failed:', err);
  process.exit(1);
});
