'use client';

import { cn } from '@/lib/utils/cn';
import { Exam } from '@/types/exam';
import { Check, ChevronDown, FileText, Folder, Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface ExamItemProps {
  exam: Exam;
  level?: number;
  onEdit: (cat: Exam) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  children?: React.ReactNode;
}

export function ExamItem({
  exam,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
  isSelected = false,
  onSelect,
  children,
}: ExamItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = exam._count?.children ? exam._count.children > 0 : false;

  return (
    <div className="w-full">
      <div
        className={cn(
          'group relative flex items-center justify-between py-4 px-6 rounded-2xl transition-all duration-300 border border-transparent',
          'hover:bg-surface-container-lowest hover:shadow-ambient hover:border-outline-variant/20 bg-surface-container-low/40',
          isSelected && 'bg-primary/5 border-primary/20 shadow-ambient'
        )}
        style={{ marginLeft: `${level * 2}rem` }}
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(exam.id!, e.target.checked)}
              className="peer appearance-none w-5 h-5 rounded-md border-2 border-outline-variant/50 checked:bg-primary checked:border-primary transition-all cursor-pointer ring-offset-background focus:ring-2 focus:ring-primary/20"
            />
            <Check
              className="absolute inset-0 m-auto text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none"
              size={14}
              strokeWidth={4}
            />
          </div>

          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200 hover:bg-surface-container',
                isExpanded ? 'text-primary rotate-0' : 'text-on-surface-variant -rotate-90'
              )}
            >
              <ChevronDown size={18} strokeWidth={2.5} />
            </button>
          )}

          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-[15px] font-bold text-on-background group-hover:text-primary transition-colors">
                {exam.name}
              </span>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  <Folder className="w-3 h-3 text-primary/60" />
                  {exam._count?.children || 0} Sub-exams
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  <FileText className="w-3 h-3 text-primary/60" />
                  {exam._count?.papers || 0} Papers
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => onAddChild(exam.id!)}
            className="p-2.5 text-primary hover:bg-primary/10 rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Add Sub-exam"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onEdit(exam)}
            className="p-2.5 text-on-surface-variant hover:bg-surface-container-low hover:text-on-background rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Edit"
          >
            <Pencil size={18} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => onDelete(exam.id!)}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:scale-105 active:scale-95"
            title="Delete"
          >
            <Trash2 size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {isExpanded && children && (
        <div className="relative ml-2">
          <div className="pt-2 pb-1">{children}</div>
        </div>
      )}
    </div>
  );
}
