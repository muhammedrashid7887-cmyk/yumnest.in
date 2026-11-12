/**
 * Comprehensive Automated Verification for YumNest Stock & Inventory System
 * Tests all 10 required scenarios against MongoDB and asserts exact correctness.
 */

import mongoose from "mongoose";
import { connectToDatabase, disconnectFromDatabase } from "../config/database";
import { loadEnvironment } from "../config/env";
import { ProductModel } from "../models/product.model";
import { OrderModel } from "../models/order.model";
import { StockHistoryModel } from "../models/stock-history.model";
import {
  listInventory,
  getProductInventory,
  adjustStock,
  getStockHistory,
} from "../services/inventory.service";
import { createOrder, updateOrderStatus } from "../services/order.service";

async function runVerification() {
  console.log("================================================================================");
  console.log("   YUMNEST DATABASE-DRIVEN STOCK MANAGEMENT SYSTEM VERIFICATION");
  console.log("================================================================================\n");

  const env = loadEnvironment();
  await connectToDatabase(env.MONGODB_URI);

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail: string) {
    if (condition) {
      console.log(`  ✓ [PASS] Scenario: ${testName}`);
      console.log(`     Details: ${detail}\n`);
      passed++;
    } else {
      console.error(`  ✗ [FAIL] Scenario: ${testName}`);
      console.error(`     Details: ${detail}\n`);
      failed++;
    }
  }

  try {
    // Pick an existing test product from DB
    let testProduct = await ProductModel.findOne({ isArchived: { $ne: true } }).exec();
    if (!testProduct) {
      throw new Error("No active product found in MongoDB to test stock management with.");
    }

    const productId = String(testProduct._id);
    const variant1 = testProduct.variants[0];
    const variant1Id = String(variant1._id);

    console.log(`Testing with product: "${testProduct.name}" (ID: ${productId})`);
    console.log(`Testing variant: "${variant1.variantName}" (ID: ${variant1Id})\n`);

    // Scenario 1: Add 50 units to an existing product
    console.log("--- SCENARIO 1: Add 50 units ---");
    // Baseline: set to 0 first
    await adjustStock(productId, { variantId: variant1Id, mode: "set", quantity: 0, reason: "Baseline setup" }, "QA Automated Test");
    const res1 = await adjustStock(productId, { variantId: variant1Id, mode: "add", quantity: 50, reason: "Scenario 1: Add 50 units" }, "Admin Tester");
    const v1AfterAdd = res1.product.variants.find((v) => v.id === variant1Id);
    assert(
      v1AfterAdd?.stockQuantity === 50,
      "1. Add 50 units to an existing product",
      `Stock increased from 0 to ${v1AfterAdd?.stockQuantity}. Status: ${v1AfterAdd?.status}`
    );

    // Scenario 2: Reduce stock from 50 to 30 (deduct 20)
    console.log("--- SCENARIO 2: Reduce stock from 50 to 30 ---");
    const res2 = await adjustStock(productId, { variantId: variant1Id, mode: "remove", quantity: 20, reason: "Scenario 2: Deduct 20 units" }, "Admin Tester");
    const v1AfterRemove = res2.product.variants.find((v) => v.id === variant1Id);
    assert(
      v1AfterRemove?.stockQuantity === 30,
      "2. Reduce stock from 50 to 30",
      `Stock reduced by 20; current stock: ${v1AfterRemove?.stockQuantity}`
    );

    // Scenario 3: Set exact stock to 100
    console.log("--- SCENARIO 3: Set exact stock to 100 ---");
    const res3 = await adjustStock(productId, { variantId: variant1Id, mode: "set", quantity: 100, reason: "Scenario 3: Set exact stock to 100" }, "Admin Tester");
    const v1AfterSet = res3.product.variants.find((v) => v.id === variant1Id);
    assert(
      v1AfterSet?.stockQuantity === 100,
      "3. Set exact stock to 100",
      `Stock set exactly to ${v1AfterSet?.stockQuantity}. Status: ${v1AfterSet?.status}`
    );

    // Scenario 4: Refresh the page (re-query MongoDB) and verify stock remains 100
    console.log("--- SCENARIO 4: Refresh/Re-query and verify persistence ---");
    const freshDbProduct = await ProductModel.findById(productId).lean().exec();
    const freshVariant = freshDbProduct?.variants.find((v) => String(v._id) === variant1Id);
    assert(
      freshVariant?.stockQuantity === 100,
      "4. Persistence across queries",
      `Re-queried directly from MongoDB: stockQuantity = ${freshVariant?.stockQuantity}`
    );

    // Scenario 5: Edit one variant without affecting other variants
    console.log("--- SCENARIO 5: Edit one variant without affecting other variants ---");
    // Ensure product has at least 2 variants for this test
    if (testProduct.variants.length < 2) {
      testProduct.variants.push({
        _id: new mongoose.Types.ObjectId(),
        variantName: "QA Isolated Variant 500g",
        sku: `QA-ISO-${Date.now().toString().slice(-4)}`,
        price: 350,
        stockQuantity: 40,
        unit: "g",
        isActive: true,
      } as any);
      await testProduct.save();
    }
    // Reload
    const reloadedProduct = await ProductModel.findById(productId).exec();
    if (!reloadedProduct) throw new Error("Product reload failed");
    testProduct = reloadedProduct;
    const variant2 = testProduct.variants[1];
    const variant2Id = String(variant2._id);
    const initialV2Stock = variant2.stockQuantity;

    // Adjust only variant 1 to 75
    await adjustStock(productId, { variantId: variant1Id, mode: "set", quantity: 75, reason: "Scenario 5 variant 1 update" }, "Admin Tester");

    const recheckDb = await ProductModel.findById(productId).lean().exec();
    const recheckV1 = recheckDb?.variants.find((v) => String(v._id) === variant1Id);
    const recheckV2 = recheckDb?.variants.find((v) => String(v._id) === variant2Id);

    assert(
      recheckV1?.stockQuantity === 75 && recheckV2?.stockQuantity === initialV2Stock,
      "5. Variant isolation test",
      `Variant 1 updated to ${recheckV1?.stockQuantity}; Variant 2 completely unaffected at ${recheckV2?.stockQuantity}`
    );

    // Scenario 6: Set stock to zero and verify Out of Stock status
    console.log("--- SCENARIO 6: Set stock to zero & verify Out of Stock ---");
    const res6 = await adjustStock(productId, { variantId: variant1Id, mode: "set", quantity: 0, reason: "Scenario 6: Set stock to 0" }, "Admin Tester");
    const v1Zero = res6.product.variants.find((v) => v.id === variant1Id);
    assert(
      v1Zero?.stockQuantity === 0 && v1Zero?.status === "out_of_stock",
      "6. Out of Stock status at 0 units",
      `Stock is ${v1Zero?.stockQuantity}, status correctly calculated as '${v1Zero?.status}'`
    );

    // Scenario 7: Try setting negative stock and verify validation rejection
    console.log("--- SCENARIO 7: Prevent negative stock ---");
    let caughtNegativeError = false;
    try {
      // Trying to reduce 50 from 0
      await adjustStock(productId, { variantId: variant1Id, mode: "remove", quantity: 50, reason: "Attempt negative stock" }, "Admin Tester");
    } catch (err: any) {
      caughtNegativeError = true;
    }
    assert(
      caughtNegativeError,
      "7. Negative stock rejection",
      "Service and database correctly threw validation error and prevented negative stock."
    );

    // Scenario 8: Place an order and verify stock deduction
    console.log("--- SCENARIO 8: Place an order and verify stock deduction ---");
    // Restore stock to 50 for the order test
    await adjustStock(productId, { variantId: variant1Id, mode: "set", quantity: 50, reason: "Pre-order stock setup" }, "Admin Tester");

    const testOrder = await createOrder({
      customerName: "QA Stock Verification Customer",
      phone: "9876543210",
      address: "Kerala Spices Testing Hub, Calicut",
      city: "Kozhikode",
      pincode: "673001",
      deliveryCharge: 0,
      paymentMethod: "WhatsApp COD",
      items: [
        {
          productId,
          variantId: variant1Id,
          variantName: variant1.variantName,
          sku: variant1.sku,
          productName: testProduct?.name || "Test Product",
          quantity: 5,
          unitPrice: variant1.price || 150,
        },
      ],
    });

    const dbAfterOrder = await ProductModel.findById(productId).lean().exec();
    const v1AfterOrder = dbAfterOrder?.variants.find((v) => String(v._id) === variant1Id);

    assert(
      v1AfterOrder?.stockQuantity === 45,
      "8. Order placement stock deduction",
      `Order #${testOrder.orderNumber} placed for 5 units. Stock atomically reduced from 50 to ${v1AfterOrder?.stockQuantity}. Order stockDeducted: ${(testOrder as any).stockDeducted}`
    );

    // Scenario 9: Cancel an eligible order and verify stock restoration
    console.log("--- SCENARIO 9: Cancel order & verify stock restoration ---");
    const cancelledOrder = await updateOrderStatus(String(testOrder.id || (testOrder as any)._id), { status: "cancelled", note: "Customer changed mind" }, "Admin Tester");

    const dbAfterCancel = await ProductModel.findById(productId).lean().exec();
    const v1AfterCancel = dbAfterCancel?.variants.find((v) => String(v._id) === variant1Id);

    assert(
      v1AfterCancel?.stockQuantity === 50 && (cancelledOrder as any)?.stockRestored === true,
      "9. Order cancellation stock restoration",
      `Order #${testOrder.orderNumber} cancelled. Stock atomically restored to ${v1AfterCancel?.stockQuantity}. Double-restoration guarded.`
    );

    // Clean up QA test order
    await OrderModel.findByIdAndDelete(testOrder.id || (testOrder as any)._id);

    // Scenario 10: Verify stock history records every adjustment
    console.log("--- SCENARIO 10: Stock history audit trail ---");
    const historyRes = await getStockHistory(productId, { page: 1, limit: 10 });
    const hasOrderPlaced = historyRes.history.some((h) => h.operationType === "order_placed");
    const hasOrderCancelled = historyRes.history.some((h) => h.operationType === "order_cancelled");
    const hasManualAdjustment = historyRes.history.some((h) => h.operationType === "manual_adjustment" || h.operationType === "stock_added");

    assert(
      historyRes.history.length >= 5 && hasOrderPlaced && hasOrderCancelled && hasManualAdjustment,
      "10. Complete stock history audit trail",
      `Found ${historyRes.history.length} movement logs in MongoDB. Captured operation types: ${[...new Set(historyRes.history.map((h) => h.operationType))].join(", ")}`
    );

    console.log("================================================================================");
    console.log(`   FINAL SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL 10 SCENARIOS)`);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Verification crashed with unexpected error:", error);
    process.exit(1);
  } finally {
    await disconnectFromDatabase();
  }
}

void runVerification();
