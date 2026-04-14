'use client';

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category-service';
import { CategoryItem } from './category-item';
import { Category } from '@/types/category';
import { Loader2 } from 'lucide-react';

interface CategoryTreeProps {
  parentId?: string | null;
  level?: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function CategoryTree({
  parentId = null,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
}: CategoryTreeProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['categories', parentId],
    queryFn: () => categoryService.getCategories(parentId),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-4 ml-8 animate-pulse">
        <Loader2 size={16} className="animate-spin text-zinc-400" />
        <span className="text-sm text-zinc-400">Loading sub-categories...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-xs ml-8 py-2">Failed to load categories</div>;
  }

  const categories = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          level={level}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        >
          {category._count?.children ? (
            <CategoryTree
              parentId={category.id}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ) : null}
        </CategoryItem>
      ))}
    </div>
  );
}
