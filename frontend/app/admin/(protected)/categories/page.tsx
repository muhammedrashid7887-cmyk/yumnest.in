import { cookies } from 'next/headers';
import { serverApiRequest } from '@/lib/api/client';
import type { CategoryItem } from '@/types/api';
import { CategoryManager } from './CategoryManager';

export const instant = false;

export default async function CategoriesPage() {
  const cookieStore = await cookies();
  const res = await serverApiRequest<CategoryItem[]>('/api/admin/categories', cookieStore.toString());
  const categories = res?.data || [];

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Categories
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Organize and manage your product catalogue taxonomies.
        </p>
      </div>

      <CategoryManager initialCategories={categories} />
    </div>
  );
}

