'use client';

import { DataTable } from '@/components/shared/data-table/data-table';
import { ExamForm } from '@/components/features/exams/components/exam-form';
import { ExamItem } from '@/components/features/exams/components/exam-item';
import { ExamTree } from '@/components/features/exams/components/exam-tree';
import { examService } from '@/services/exam-service';
import { CreateExamInput, Exam, UpdateExamInput } from '@/types/exam';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderTree, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function ExamsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  // Fetch root exams for count-based logic and empty state
  const { data: rootExamsData, isLoading: isRootLoading } = useQuery({
    queryKey: ['exams', null, currentPage, searchQuery || pageSize, searchQuery],
    queryFn: () => examService.getExams(null, currentPage, pageSize, searchQuery),
  });

  const exams = Array.isArray(rootExamsData?.data) ? rootExamsData.data : [];
  const rootExamsCount = rootExamsData?.total || 0;
  const totalPages = Math.ceil(rootExamsCount / pageSize);
  const isSearchActive = searchQuery.length > 0;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: CreateExamInput) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      handleCloseForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExamInput }) =>
      examService.updateExam(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      handleCloseForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => examService.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== editingExam?.id));
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => examService.bulkDeleteExams(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      setSelectedIds([]);
    },
  });

  const handleOpenCreateForm = (parentId: string | null = null) => {
    setSelectedParentId(parentId);
    setEditingExam(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (exam: Exam) => {
    setEditingExam(exam);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingExam(null);
    setSelectedParentId(null);
  };

  const handleSubmit = async (data: any) => {
    if (editingExam?.id) {
      await updateMutation.mutateAsync({ id: editingExam.id, data: data as UpdateExamInput });
    } else {
      await createMutation.mutateAsync({
        name: data.name,
        parentId: selectedParentId,
      } as CreateExamInput);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this exam and all its sub-exams?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected exams and their sub-exams?`
      )
    ) {
      await bulkDeleteMutation.mutateAsync(selectedIds);
    }
  };

  const allCurrentPageIds = exams.map((e: Exam) => e.id!);
  const isAllSelected =
    allCurrentPageIds.length > 0 &&
    allCurrentPageIds.every((id: string) => selectedIds.includes(id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allCurrentPageIds])));
    } else {
      setSelectedIds((prev) => prev.filter((id) => !allCurrentPageIds.includes(id)));
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <FolderTree size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-black tracking-tight text-on-background">Exams</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search
              className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search exams..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-6 py-4 bg-surface-container-low/50 border-2 border-outline-variant/10 rounded-2xl w-full lg:w-80 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold placeholder:text-on-surface-variant/30 text-base transition-all"
            />
          </div>

          <button
            onClick={() => handleOpenCreateForm(null)}
            className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 ring-1 ring-primary/20"
          >
            <Plus size={24} strokeWidth={3} />
            Add Exam
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Exam List Section */}
        <div className="lg:col-span-12 space-y-6">
          <DataTable
            headers={['Exam Name / Dynamics']}
            selectedCount={selectedIds.length}
            totalCount={rootExamsCount}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            onBulkDelete={handleBulkDelete}
            onClearSelection={() => setSelectedIds([])}
            resourceName="exam"
            isLoading={isRootLoading}
            searchQuery={searchQuery}
            onAddFirst={() => handleOpenCreateForm(null)}
            addFirstLabel="Create Your First Exam"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          >
            {isSearchActive ? (
              <div className="space-y-3">
                {exams.map((exam: Exam) => (
                  <ExamItem
                    key={exam.id}
                    exam={exam}
                    onEdit={handleOpenEditForm}
                    onDelete={handleDelete}
                    onAddChild={handleOpenCreateForm}
                    isSelected={selectedIds.includes(exam.id!)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            ) : (
              <div className="relative">
                <ExamTree
                  parentId={null}
                  page={currentPage}
                  limit={pageSize}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDelete}
                  onAddChild={handleOpenCreateForm}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                />
              </div>
            )}
          </DataTable>
        </div>
      </div>

      {/* Forms Modal */}
      {isFormOpen && (
        <ExamForm
          initialData={editingExam || undefined}
          parentId={selectedParentId}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
