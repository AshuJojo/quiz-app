'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Category, CategorySchema } from '@/types/category';
import { X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CategoryFormProps {
  initialData?: Partial<Category>;
  parentId?: string | null;
  onSubmit: (data: Partial<Category>) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function CategoryForm({
  initialData,
  parentId,
  onSubmit,
  onClose,
  isLoading,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Category>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: initialData?.name || '',
      icon: initialData?.icon || '📁',
      parentId: initialData?.parentId || parentId || null,
    } as any, // using any temporarily if types are still stubborn, but this should work better
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            {initialData?.id ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Category Name
            </label>
            <input
              {...register('name')}
              placeholder="e.g. SSC, CGL, Mathematics"
              className={cn(
                'w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all outline-none',
                errors.name && 'border-red-500 focus:ring-red-500'
              )}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Icon / Emoji
            </label>
            <input
              {...register('icon')}
              placeholder="📁"
              className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading && <Loader2 size={16} className="animate-spin" />}
              {initialData?.id ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
