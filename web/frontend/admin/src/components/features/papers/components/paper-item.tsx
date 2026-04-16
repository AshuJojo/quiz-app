'use client';

import { Paper } from '@/types/paper';
import { Calendar, Check, Clock, FileText, Pencil, Trash2 } from 'lucide-react';

interface PaperItemProps {
  paper: Paper;
  onEdit: (paper: Paper) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
}

export function PaperItem({
  paper,
  onEdit,
  onDelete,
  isSelected = false,
  onSelect,
}: PaperItemProps) {
  return (
    <div className="group relative flex items-center justify-between py-4 px-6 rounded-2xl transition-all duration-300 border border-transparent hover:bg-surface-container-lowest hover:shadow-ambient hover:border-outline-variant/20 bg-surface-container-low/40">
      <div className="flex items-center gap-6">
        <div className="relative flex items-center">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect?.(paper.id!, e.target.checked)}
            className="peer appearance-none w-5 h-5 rounded-md border-2 border-outline-variant/50 checked:bg-primary checked:border-primary transition-all cursor-pointer ring-offset-background focus:ring-2 focus:ring-primary/20"
          />
          <Check
            className="absolute inset-0 m-auto text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none"
            size={14}
            strokeWidth={4}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <h3 className="text-[17px] font-black tracking-tight text-on-background group-hover:text-primary transition-colors">
              {paper.title}
            </h3>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest">
              {paper.exam?.name || 'Unassigned'}
            </span>
          </div>

          <div className="flex items-center gap-5">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
              <FileText className="w-3.5 h-3.5 text-primary/60" />
              {paper.totalQuestions} Questions
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
              <Clock className="w-3.5 h-3.5 text-primary/60" />
              {paper.duration} Minutes
            </span>
            {paper.year && (
              <>
                <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  <Calendar className="w-3.5 h-3.5 text-primary/60" />
                  Year {paper.year}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
        <button
          onClick={() => onEdit(paper)}
          className="p-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-background rounded-2xl transition-all hover:scale-110 active:scale-90"
          title="Edit Paper"
        >
          <Pencil size={20} strokeWidth={2.5} />
        </button>
        <button
          onClick={() => onDelete(paper.id)}
          className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
          title="Delete Paper"
        >
          <Trash2 size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
