import mongoose from "mongoose";
import { CategoryModel } from "../models/category.model";
import { ProductModel } from "../models/product.model";
import { HttpError } from "../utils/httpError";
import { objectId } from "../utils/mongo";
import { slugify } from "../utils/slug";
import { resolveMediaImage } from "../utils/media-reference";
import type { CategoryCreateInput, CategoryUpdateInput } from "../validators/catalogue.validators";

async function uniqueSlug(value: string, id?: string): Promise<string> {
  const slug = slugify(value);
  if (!slug) throw new HttpError(400, "Category name or slug must contain letters or numbers");

  const filter: Record<string, unknown> = { slug };
  if (id) filter._id = { $ne: objectId(id) };
  if (await CategoryModel.exists(filter)) throw new HttpError(409, "Category slug already exists");
  return slug;
}

export async function createCategory(input: CategoryCreateInput) {
  const category = await CategoryModel.create({
    ...input,
    image: input.image ? await resolveMediaImage(input.image, "categories") : undefined,
    slug: await uniqueSlug(input.slug ?? input.name),
  });
  return {
    ...category.toJSON(),
    id: category._id.toString(),
    productCount: 0,
  };
}

export async function listCategories(options: { page: number; limit: number; search?: string; isActive?: boolean }) {
  const filter: Record<string, unknown> = {};
  if (options.isActive !== undefined) filter.isActive = options.isActive;
  if (options.search) {
    const regex = { $regex: escapeRegex(options.search), $options: "i" };
    filter.$or = [{ name: regex }, { slug: regex }, { malayalamName: regex }];
  }

  const skip = (options.page - 1) * options.limit;
  const [items, total] = await Promise.all([
    CategoryModel.find(filter).sort({ displayOrder: 1, name: 1 }).skip(skip).limit(options.limit).lean().exec(),
    CategoryModel.countDocuments(filter).exec(),
  ]);

  // Aggregate product counts for the returned categories
  const categoryIds = items.map((c) => c._id);
  const counts = await ProductModel.aggregate([
    { $match: { category: { $in: categoryIds } } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
  ]);
  const countMap = new Map<string, number>();
  counts.forEach((c) => countMap.set(String(c._id), c.count));

  const enrichedItems = items.map((cat) => ({
    ...cat,
    id: String(cat._id),
    productCount: countMap.get(String(cat._id)) || 0,
  }));

  return {
    items: enrichedItems,
    total,
    page: options.page,
    limit: options.limit,
    pages: Math.ceil(total / options.limit) || 1,
  };
}

export async function getCategory(idOrSlug: string) {
  const query = mongoose.Types.ObjectId.isValid(idOrSlug)
    ? { _id: objectId(idOrSlug) }
    : { slug: idOrSlug.trim().toLowerCase() };

  const cat = await CategoryModel.findOne(query).lean().exec();
  if (!cat) throw new HttpError(404, "Category not found");
  const productCount = await ProductModel.countDocuments({ category: cat._id });
  return {
    ...cat,
    id: String(cat._id),
    productCount,
  };
}

export async function updateCategory(id: string, input: CategoryUpdateInput) {
  const category = await CategoryModel.findById(objectId(id)).exec();
  if (!category) throw new HttpError(404, "Category not found");

  const update: Record<string, unknown> = { ...input };
  if (input.image) update.image = await resolveMediaImage(input.image, "categories");
  if (input.name !== undefined || input.slug !== undefined) {
    update.slug = await uniqueSlug(input.slug ?? input.name ?? category.slug, id);
  }

  Object.assign(category, update);
  await category.save();

  const productCount = await ProductModel.countDocuments({ category: category._id });
  return {
    ...category.toJSON(),
    id: category._id.toString(),
    productCount,
  };
}

export async function deleteCategory(id: string): Promise<void> {
  const categoryId = objectId(id);
  const category = await CategoryModel.findById(categoryId).exec();
  if (!category) throw new HttpError(404, "Category not found");

  const count = await ProductModel.countDocuments({ category: categoryId });
  if (count > 0) {
    throw new HttpError(
      409,
      `Cannot delete category "${category.name}" because ${count} product(s) are assigned to it. Please reassign or delete the products first.`
    );
  }

  await category.deleteOne();
}

export async function listPublicCategories() {
  const categories = await CategoryModel.find({ isActive: true }).sort({ displayOrder: 1, name: 1 }).lean().exec();
  return categories.map((category) => ({
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    malayalamName: category.malayalamName,
    description: category.description,
    image: category.image?.secureUrl || category.image?.url || "",
    seoTitle: category.seoTitle,
    seoDescription: category.seoDescription,
    focusKeyword: category.focusKeyword,
    secondaryKeywords: category.secondaryKeywords ?? [],
    canonicalUrl: category.canonicalUrl,
    isNoIndex: Boolean(category.isNoIndex),
  }));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
