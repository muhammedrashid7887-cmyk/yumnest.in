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
  return category.toJSON();
}

export async function listCategories(options: { page: number; limit: number; search?: string; isActive?: boolean }) {
  const filter: Record<string, unknown> = {};
  if (options.isActive !== undefined) filter.isActive = options.isActive;
  if (options.search) filter.$or = [{ name: { $regex: escapeRegex(options.search), $options: "i" } }, { slug: { $regex: escapeRegex(options.search), $options: "i" } }];

  const skip = (options.page - 1) * options.limit;
  const [items, total] = await Promise.all([
    CategoryModel.find(filter).sort({ displayOrder: 1, name: 1 }).skip(skip).limit(options.limit).lean().exec(),
    CategoryModel.countDocuments(filter).exec(),
  ]);
  return { items, total, page: options.page, limit: options.limit, pages: Math.ceil(total / options.limit) };
}

export async function getCategory(id: string) {
  const category = await CategoryModel.findById(objectId(id)).lean().exec();
  if (!category) throw new HttpError(404, "Category not found");
  return category;
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
  return category.toJSON();
}

export async function deleteCategory(id: string): Promise<void> {
  const categoryId = objectId(id);
  const category = await CategoryModel.findById(categoryId).exec();
  if (!category) throw new HttpError(404, "Category not found");
  if (await ProductModel.exists({ category: categoryId })) {
    throw new HttpError(409, "Category contains products; reassign products before deletion");
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
  }));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
