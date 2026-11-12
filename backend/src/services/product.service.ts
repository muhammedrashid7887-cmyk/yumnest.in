import mongoose from "mongoose";
import { CategoryModel } from "../models/category.model";
import { ProductModel, type ProductVariant } from "../models/product.model";
import { HttpError } from "../utils/httpError";
import { objectId } from "../utils/mongo";
import { slugify } from "../utils/slug";
import type { ListQuery, ProductCreateInput, ProductUpdateInput } from "../validators/catalogue.validators";
import { resolveMediaImages } from "../utils/media-reference";

async function uniqueSlug(value: string, id?: string): Promise<string> {
  const slug = slugify(value);
  if (!slug) throw new HttpError(400, "Product name or slug must contain letters or numbers");
  const filter: Record<string, unknown> = { slug };
  if (id) filter._id = { $ne: objectId(id) };
  if (await ProductModel.exists(filter)) throw new HttpError(409, "Product slug already exists");
  return slug;
}

async function assertCategory(categoryId: string) {
  if (!(await CategoryModel.exists({ _id: objectId(categoryId) }))) throw new HttpError(400, "Category not found");
}

function normalizeSku(sku: string): string {
  return sku.trim().toUpperCase();
}

async function assertUniqueSkus(skus: string[], productId?: string) {
  const normalized = skus.map(normalizeSku);
  if (new Set(normalized).size !== normalized.length) throw new HttpError(409, "Variant SKUs must be unique");

  const filter: Record<string, unknown> = { "variants.sku": { $in: normalized } };
  if (productId) filter._id = { $ne: objectId(productId) };
  if (await ProductModel.exists(filter)) throw new HttpError(409, "One or more variant SKUs already exist");
}

function responseProduct(product: any, publicOnly = false) {
  const category = product.category && typeof product.category === "object" && "name" in product.category
    ? { id: product.category._id.toString(), name: product.category.name, slug: product.category.slug }
    : product.category?.toString();
  const variants = (product.variants ?? [])
    .filter((variant: ProductVariant) => !publicOnly || variant.isActive)
    .map((variant: ProductVariant) => ({
      id: variant._id.toString(),
      price: publicOnly && variant.compareAtPrice !== undefined ? variant.compareAtPrice : variant.price,
      salePrice: publicOnly && variant.compareAtPrice !== undefined ? variant.price : undefined,
      stock: variant.stockQuantity,
      weight: variant.variantName,
      ...(publicOnly ? {} : {
        variantName: variant.variantName,
        sku: variant.sku,
        compareAtPrice: variant.compareAtPrice,
        stockQuantity: variant.stockQuantity,
        unit: variant.unit,
        isActive: variant.isActive,
      }),
    }));

  const images = (product.images ?? []).slice().sort((a: { sortOrder: number }, b: { sortOrder: number }) => a.sortOrder - b.sortOrder);

  return {
    id: product._id.toString(),
    name: product.name,
    slug: product.slug,
    malayalamName: product.malayalamName,
    subtitle: product.subtitle,
    shortDescription: product.shortDescription,
    description: product.description,
    category,
    images,
    primaryImage: images[0]?.url,
    variants,
    ingredients: product.ingredients ?? [],
    howToUse: product.howToUse ?? "",
    nutrition: product.nutrition ?? { calories: "", protein: "", fat: "", carbs: "" },
    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    inStock: variants.some((variant: { stock: number }) => variant.stock > 0),
    isBestSeller: product.isBestSeller ?? false,
    isPopular: product.isPopular ?? false,
    isNew: product.isNew ?? false,
    isOnSale: product.isOnSale ?? false,
    discountPercentage: product.discountPercentage,
    badge: product.badge,
    tags: product.tags,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isArchived: Boolean(product.isArchived),
    archivedAt: product.archivedAt,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function publicProduct(product: any) {
  const mapped = responseProduct(product, true);
  return {
    ...mapped,
    images: mapped.images.map((image: { url: string }) => image.url),
    primaryImage: mapped.primaryImage,
    category: typeof mapped.category === "object" ? mapped.category.name : mapped.category,
  };
}

export async function createProduct(input: ProductCreateInput) {
  if (input.category) {
    await assertCategory(input.category);
  }
  await assertUniqueSkus(input.variants.map((variant) => variant.sku));

  const product = await ProductModel.create({
    ...input,
    slug: await uniqueSlug(input.slug ?? input.name),
    category: input.category ? objectId(input.category) : undefined,
    images: input.images ? await resolveMediaImages(input.images.map((image, index) => ({ ...image, sortOrder: image.sortOrder ?? index })), "products") : undefined,
    variants: input.variants.map((variant) => ({ ...variant, sku: normalizeSku(variant.sku) })),
  });
  if (product.category) {
    await product.populate("category", "name slug");
  }
  return responseProduct(product);
}

async function resolveCategoryId(categoryInput?: string): Promise<mongoose.Types.ObjectId | null | undefined> {
  if (!categoryInput?.trim()) return undefined;
  const trimmed = categoryInput.trim();
  if (mongoose.Types.ObjectId.isValid(trimmed)) {
    return objectId(trimmed);
  }
  const categoryDoc = await CategoryModel.findOne({
    $or: [
      { slug: trimmed.toLowerCase() },
      { name: new RegExp(`^${escapeRegex(trimmed)}$`, "i") },
    ],
  }).select("_id").lean().exec();
  return categoryDoc ? (categoryDoc._id as mongoose.Types.ObjectId) : null;
}

export async function listProducts(options: ListQuery) {
  const filter: Record<string, unknown> = {};
  if (options.category) {
    const resolvedCatId = await resolveCategoryId(options.category);
    if (resolvedCatId === null) {
      return { items: [], total: 0, page: options.page, limit: options.limit, pages: 0 };
    }
    if (resolvedCatId) {
      filter.category = resolvedCatId;
    }
  }
  if (options.isActive !== undefined) filter.isActive = options.isActive;
  if (options.featured !== undefined) filter.isFeatured = options.featured;

  if (options.isArchived === true) {
    filter.isArchived = true;
  } else {
    filter.isArchived = { $ne: true };
  }

  if (options.search) {
    const regex = { $regex: escapeRegex(options.search), $options: "i" };
    filter.$or = [{ name: regex }, { slug: regex }, { malayalamName: regex }];
  }

  const direction = options.sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = options.sortBy === "price" ? { "variants.0.price": direction as 1 | -1 } : { [options.sortBy]: direction as 1 | -1 };
  const skip = (options.page - 1) * options.limit;
  const [items, total] = await Promise.all([
    ProductModel.find(filter).populate("category", "name slug").sort(sort).skip(skip).limit(options.limit).lean().exec(),
    ProductModel.countDocuments(filter).exec(),
  ]);
  return { items: items.map((item) => responseProduct(item)), total, page: options.page, limit: options.limit, pages: Math.ceil(total / options.limit) };
}

export async function getProduct(id: string) {
  const product = await ProductModel.findById(objectId(id)).populate("category", "name slug").lean().exec();
  if (!product) throw new HttpError(404, "Product not found");
  return responseProduct(product);
}

export async function updateProduct(id: string, input: ProductUpdateInput) {
  const product = await ProductModel.findById(objectId(id)).exec();
  if (!product) throw new HttpError(404, "Product not found");
  if (input.category) await assertCategory(input.category);

  const update: Record<string, unknown> = { ...input };
  if (input.name !== undefined || input.slug !== undefined) update.slug = await uniqueSlug(input.slug ?? input.name ?? product.slug, id);
  if (input.category !== undefined) update.category = input.category ? objectId(input.category) : null;
  if (input.badge !== undefined) update.badge = input.badge ? input.badge.trim() : "";
  if (input.images) update.images = await resolveMediaImages(input.images.map((image, index) => ({ ...image, sortOrder: image.sortOrder ?? index })), "products");
  if (input.variants) {
    await assertUniqueSkus(input.variants.map((variant) => variant.sku), id);
    update.variants = input.variants.map((variant) => {
      const variantId = variant.id ?? (variant as any)._id;
      const existing = variantId ? product.variants.find((item) => item._id.toString() === variantId) : product.variants.find((item) => item.sku === normalizeSku(variant.sku));
      return {
        ...variant,
        sku: normalizeSku(variant.sku),
        stockQuantity: variant.stockQuantity !== undefined ? variant.stockQuantity : (existing?.stockQuantity ?? 0),
      };
    });
  }

  Object.assign(product, update);
  await product.save();
  await product.populate("category", "name slug");
  return responseProduct(product);
}

export async function archiveProduct(id: string) {
  const targetId = objectId(id);
  const product = await ProductModel.findById(targetId).exec();
  if (!product) throw new HttpError(404, "Product not found");

  product.isArchived = true;
  product.archivedAt = new Date();
  product.isActive = false;
  await product.save();
  await product.populate("category", "name slug");
  return responseProduct(product);
}

export async function restoreProduct(id: string) {
  const targetId = objectId(id);
  const product = await ProductModel.findById(targetId).exec();
  if (!product) throw new HttpError(404, "Product not found");

  product.isArchived = false;
  product.archivedAt = undefined;
  product.isActive = true;
  await product.save();
  await product.populate("category", "name slug");
  return responseProduct(product);
}

export async function deleteProduct(id: string, permanent = false) {
  const targetId = objectId(id);
  const product = await ProductModel.findById(targetId).exec();
  if (!product) throw new HttpError(404, "Product not found or already deleted");

  if (permanent) {
    if (mongoose.connection.db) {
      try {
        const orders = mongoose.connection.db.collection("orders");
        const orderCount = await orders.countDocuments({
          $or: [
            { "items.productId": targetId },
            { "items.product": targetId },
          ],
        });
        if (orderCount > 0) {
          throw new HttpError(
            409,
            `Cannot permanently delete "${product.name}" because ${orderCount} existing order(s) reference it. You can archive it instead to remove it from the storefront.`
          );
        }
      } catch (err) {
        if (err instanceof HttpError) throw err;
      }
    }
    const deletedDoc = await ProductModel.findByIdAndDelete(targetId).exec();
    if (!deletedDoc) {
      throw new HttpError(404, "Product not found or already deleted");
    }
    return { deleted: true, permanent: true, id };
  }

  product.isArchived = true;
  product.archivedAt = new Date();
  product.isActive = false;
  await product.save();
  return { deleted: true, permanent: false, archived: true, id };
}

export async function listPublicProducts(options: ListQuery) {
  const filter: Record<string, unknown> = { isActive: true, isArchived: { $ne: true } };
  const activeCategoryIds = await CategoryModel.find({ isActive: true }).distinct("_id").exec();

  if (options.category) {
    const requestedCategory = await resolveCategoryId(options.category);
    if (!requestedCategory || !activeCategoryIds.some((id) => id.equals(requestedCategory))) {
      return { items: [], total: 0, page: options.page, limit: options.limit, pages: 0 };
    }
    filter.category = requestedCategory;
  } else {
    filter.$or = [
      { category: { $in: activeCategoryIds } },
      { category: null },
      { category: { $exists: false } },
    ];
  }
  if (options.search) {
    const regex = { $regex: escapeRegex(options.search), $options: "i" };
    filter.$or = [{ name: regex }, { slug: regex }, { malayalamName: regex }];
  }
  if (options.featured !== undefined) filter.isFeatured = options.featured;

  const direction = options.sortOrder === "asc" ? 1 : -1;
  const sort: Record<string, 1 | -1> = options.sortBy === "price" ? { "variants.0.price": direction as 1 | -1 } : { [options.sortBy]: direction as 1 | -1 };
  const skip = (options.page - 1) * options.limit;
  const [items, total] = await Promise.all([
    ProductModel.find(filter).populate({ path: "category", select: "name slug" }).sort(sort).skip(skip).limit(options.limit).lean().exec(),
    ProductModel.countDocuments(filter).exec(),
  ]);
  const visible = items.map((item) => publicProduct(item));
  return { items: visible, total, page: options.page, limit: options.limit, pages: Math.ceil(total / options.limit) };
}

export async function getPublicProduct(idOrSlug: string) {
  const filter = /^[a-f\d]{24}$/i.test(idOrSlug) ? { _id: objectId(idOrSlug) } : { slug: idOrSlug.toLowerCase() };
  const product = await ProductModel.findOne({ ...filter, isActive: true, isArchived: { $ne: true } }).populate({ path: "category", match: { isActive: true }, select: "name slug" }).lean().exec();
  if (!product) throw new HttpError(404, "Product not found");
  return publicProduct(product);
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
