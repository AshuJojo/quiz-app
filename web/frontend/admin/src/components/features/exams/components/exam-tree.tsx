'use client';

import { useQuery } from '@tanstack/react-query';
import { examService } from '@/services/exam-service';
import { ExamItem } from './exam-item';
import { Exam } from '@/types/exam';
import { Loader2 } from 'lucide-react';

interface ExamTreeProps {
  parentId?: string | null;
  level?: number;
  onEdit: (cat: Exam) => void;
  onDelete: (id: string) => void;
  onAddChild: (parentId: string) => void;
}

export function ExamTree({
  parentId = null,
  level = 0,
  onEdit,
  onDelete,
  onAddChild,
}: ExamTreeProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['exams', parentId],
    queryFn: () => examService.getExams(parentId),
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
      {exams.map((exam) => (
        <ExamItem
          key={exam.id}
          exam={exam}
          level={level}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        >
          {exam._count?.children ? (
            <ExamTree
              parentId={exam.id}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ) : null}
        </ExamItem>
      ))}
    </div>
  );
}
