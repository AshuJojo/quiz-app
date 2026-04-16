'use client';

import { useQuery } from '@tanstack/react-query';
import { examService } from '@/services/exam-service';
import { ExamItem } from './exam-item';
import { Exam } from '@/types/exam';
import { Loader2 } from 'lucide-react';

interface ExamTreeProps {
  parentId?: string | null;
  level?: number;
  page?: number;
  limit?: number;
  onEdit: (cat: Exam) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
  selectedIds?: string[];
  onSelect?: (id: string, selected: boolean) => void;
}

export function ExamTree({
  parentId = null,
  level = 0,
  page = 1,
  limit = 10,
  onEdit,
  onDelete,
  onAddChild,
  selectedIds = [],
  onSelect,
}: ExamTreeProps) {
  // If we are root, we paginate. If we are sub-exam, we fetch all.
  const queryLimit = parentId === null ? limit : 'all';
  const queryPage = parentId === null ? page : 1;

  const { data, isLoading, error } = useQuery({
    queryKey: ['exams', parentId, queryPage, queryLimit],
    queryFn: () => examService.getExams(parentId, queryPage, queryLimit),
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-4 ml-8 animate-pulse">
        <Loader2 size={16} className="animate-spin text-zinc-400" />
        <span className="text-sm text-zinc-400">Loading sub-exams...</span>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-xs ml-8 py-2">Failed to load exams</div>;
  }

  const exams = Array.isArray(data?.data) ? data.data : [];

  return (
    <div className="space-y-1">
      {exams.map((exam: any) => (
        <ExamItem
          key={exam.id}
          exam={exam}
          level={level}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
          isSelected={selectedIds.includes(exam.id)}
          onSelect={onSelect}
        >
          {exam._count?.children ? (
            <ExamTree
              parentId={exam.id}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              selectedIds={selectedIds}
              onSelect={onSelect}
            />
          ) : null}
        </ExamItem>
      ))}
    </div>
  );
}
