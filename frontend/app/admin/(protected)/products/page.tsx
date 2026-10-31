import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { AdminProduct, CategoryItem } from '@/types/api';
import { ProductManager } from './ProductManager';

export const instant = false;

export default async function ProductsPage() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const [productsRes, categoriesRes] = await Promise.all([
    serverApiRequest<AdminProduct[]>('/api/admin/products?limit=10', cookieHeader),
    serverApiRequest<CategoryItem[]>('/api/admin/categories', cookieHeader),
  ]);

  const products = productsRes?.data || [];
  const total = productsRes?.meta?.total ?? products.length;
  const categories = categoriesRes?.data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Products
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          View, create, edit and archive products and pricing variants.
        </p>
      </div>

      <ProductManager
        initialProducts={products}
        categories={categories}
        initialTotal={total}
      />
    </div>
  );
}

