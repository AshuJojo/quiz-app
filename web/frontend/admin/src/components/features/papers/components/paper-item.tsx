'use client';

import { Paper } from '@/types/paper';
import { Calendar, Clock, FileText, Pencil, Trash2 } from 'lucide-react';
import { DataTableItem } from '@/components/shared/data-table/data-table-item';

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
  const actions = (
    <>
      <button
        onClick={() => onEdit(paper)}
        className="p-3 text-on-surface-variant hover:bg-surface-container-low hover:text-on-background rounded-2xl transition-all hover:scale-110 active:scale-90"
        title="Edit Paper"
      >
        <Pencil size={20} strokeWidth={2.5} />
      </button>
      <button
        onClick={() => onDelete(paper.id!)}
        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
        title="Delete Paper"
      >
        <Trash2 size={20} strokeWidth={2.5} />
      </button>
    </>
  );

  return (
    <DataTableItem id={paper.id} isSelected={isSelected} onSelect={onSelect} actions={actions}>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-3">
          <h3 className="text-[17px] font-black tracking-tight text-on-background group-hover:text-primary transition-colors">
            {paper.title}
          </h3>
          <span
            className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest truncate max-w-[200px]"
            title={paper.exam?.fullPath || paper.exam?.name}
          >
            {paper.exam?.fullPath || paper.exam?.name || 'Unassigned'}
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
    </DataTableItem>
  );
}
