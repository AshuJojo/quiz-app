'use client';

import { Paper } from '@/components/features/papers/types';
import { Calendar, Clock, FileText, Pencil, Trash2 } from 'lucide-react';
import { DataTableItem } from '@/components/ui/data-table/data-table-item';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  const handleRowClick = () => {
    router.push(`/papers/${paper.id}`);
  };

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
    <DataTableItem
      id={paper.id}
      isSelected={isSelected}
      onSelect={onSelect}
      actions={actions}
      onClick={handleRowClick}
    >
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
            {paper._count?.questions ?? 0} Questions
          </span>
          <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
            <Clock className="w-3.5 h-3.5 text-primary/60" />
            {paper.duration} Minutes
          </span>
          {paper.paperDate && (
            <>
              <span className="w-1 h-1 rounded-full bg-outline-variant/40" />
              <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                <Calendar className="w-3.5 h-3.5 text-primary/60" />
                {new Date(paper.paperDate).toLocaleDateString()}
              </span>
            </>
          )}
        </div>
      </div>
    </DataTableItem>
  );
}
