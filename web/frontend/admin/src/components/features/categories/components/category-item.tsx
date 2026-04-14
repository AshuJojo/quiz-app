'use client';

import { useState } from 'react';
import { Category } from '@/types/category';
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, Folder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CategoryItemProps {
  category: Category;
  level?: number;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  children?: React.ReactNode;
}

export function CategoryItem({
  category,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
  children,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = category._count?.children ? category._count.children > 0 : false;

  return (
    <div className="w-full">
      <div
        className={cn(
          'group relative flex items-center justify-between py-4 px-6 rounded-2xl transition-all duration-300 border border-transparent',
          'hover:bg-surface-container-lowest hover:shadow-ambient hover:border-outline-variant/20',
          isExpanded && 'bg-surface-container-low/40'
        )}
        style={{ marginLeft: `${level * 2}rem` }}
      >
        {/* Tree Connectors */}
        {level > 0 && (
          <>
            <div className="absolute -left-6 top-0 bottom-0 w-px bg-outline-variant/30" />
            <div className="absolute -left-6 top-1/2 w-4 h-px bg-outline-variant/30" />
          </>
        )}

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'p-1.5 rounded-lg transition-all duration-200 hover:bg-surface-container',
              !hasChildren && 'invisible opacity-0',
              isExpanded ? 'text-primary rotate-0' : 'text-on-surface-variant -rotate-90'
            )}
          >
            <ChevronDown size={18} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container text-2xl shadow-sm border border-outline-variant/10 group-hover:scale-110 transition-transform">
              {category.icon || '📁'}
              <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-on-background group-hover:text-primary transition-colors">
                {category.name}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  <Folder className="w-3 h-3 text-primary/60" />
                  {category._count?.children || 0} Subcategories
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  <FileText className="w-3 h-3 text-primary/60" />
                  {category._count?.papers || 0} Papers
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => onAddChild(category.id!)}
            className="p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Add Sub-category"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onEdit(category)}
            className="p-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-on-background rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Edit"
          >
            <Pencil size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onDelete(category.id!)}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Delete"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isExpanded && children && (
        <div className="relative ml-2">
          {/* Vertical line for the whole sub-list */}
          <div className="absolute left-[0.25rem] top-0 bottom-4 w-px bg-outline-variant/30" />
          <div className="pt-2 pb-1">{children}</div>
        </div>
      )}
    </div>
  );
}
