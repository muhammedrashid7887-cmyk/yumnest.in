import assert from "node:assert/strict";
import { categoryCreateSchema, listQuerySchema, productCreateSchema, productUpdateSchema } from "../validators/catalogue.validators";
import { slugify } from "./slug";

function expectInvalid(result: { success: boolean }, message: string): void {
  assert.equal(result.success, false, message);
}

const validCategory = {
  name: "Masala Powders",
  isActive: true,
  displayOrder: 0,
};

const validProduct = {
  name: "Broast Masala",
  shortDescription: "Crispy spice blend",
  description: "A detailed product description",
  category: "507f1f77bcf86cd799439011",
  variants: [{ variantName: "250g", sku: "BROAST-250", price: 320, stockQuantity: 10, unit: "g" }],
};

assert.equal(slugify("  Kerala Masala & Spices  "), "kerala-masala-spices");
assert.equal(categoryCreateSchema.safeParse(validCategory).success, true);
assert.equal(productCreateSchema.safeParse(validProduct).success, true);
expectInvalid(
  productCreateSchema.safeParse({ ...validProduct, variants: [{ ...validProduct.variants[0], price: -1 }] }),
  "negative prices must be rejected"
);
expectInvalid(
  productCreateSchema.safeParse({ ...validProduct, variants: [{ ...validProduct.variants[0], stockQuantity: -1 }] }),
  "negative stock must be rejected"
);
// Stock updates must be accepted in product updates
const stockUpdateResult = productUpdateSchema.safeParse({
  variants: [{ ...validProduct.variants[0], id: "507f1f77bcf86cd799439012", stockQuantity: 99 }],
});
assert.equal(stockUpdateResult.success, true, "stock changes must be accepted by product updates");

// Tags/Features longer than 40 characters must be accepted
const longTagProductResult = productCreateSchema.safeParse({
  ...validProduct,
  tags: ["100% Pure & Natural Cold-Pressed Authentic Traditional Farm Sourced Quality"],
});
assert.equal(longTagProductResult.success, true, "features longer than 40 chars must be accepted");

// Test listQuerySchema with isArchived
const parsedArchivedQuery = listQuerySchema.safeParse({ isArchived: "true" });
assert.equal(parsedArchivedQuery.success, true);
if (parsedArchivedQuery.success) {
  assert.equal(parsedArchivedQuery.data.isArchived, true);
}
const parsedNonArchivedQuery = listQuerySchema.safeParse({ isArchived: "false" });
assert.equal(parsedNonArchivedQuery.success, true);
if (parsedNonArchivedQuery.success) {
  assert.equal(parsedArchivedQuery.success && parsedNonArchivedQuery.data.isArchived, false);
}

console.log("Catalogue validation checks passed");
