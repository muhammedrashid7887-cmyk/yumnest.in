import assert from "node:assert/strict";
import { categoryCreateSchema, productCreateSchema, productUpdateSchema } from "../validators/catalogue.validators";
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
expectInvalid(
  productUpdateSchema.safeParse({ variants: [{ ...validProduct.variants[0], id: "507f1f77bcf86cd799439012", stockQuantity: 99 }] }),
  "stock changes must not be accepted by product updates"
);

console.log("Catalogue validation checks passed");
