'use client';

import { ExamForm } from '@/components/features/exams/components/exam-form';
import { ExamTree } from '@/components/features/exams/components/exam-tree';
import { cn } from '@/lib/utils/cn';
import { examService } from '@/services/exam-service';
import { CreateExamInput, Exam, UpdateExamInput } from '@/types/exam';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, FolderTree, Plus, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';

export default function ExamsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Fetch root exams for count-based logic and empty state
  const { data: rootExamsData, isLoading: isRootLoading } = useQuery({
    queryKey: ['exams', null, currentPage],
    queryFn: () => examService.getExams(null, currentPage, pageSize),
  });

  const rootExamsCount = rootExamsData?.total || 0;
  const totalPages = Math.ceil(rootExamsCount / pageSize);

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

        <button
          onClick={() => handleOpenCreateForm(null)}
          className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 ring-1 ring-primary/20"
        >
          <Plus size={24} strokeWidth={3} />
          Create Exam
        </button>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Exam List Section */}
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-2xl border border-outline-variant/10 shadow-ambient overflow-hidden">
            {/* List Header Labels - Show only if > 10 root exams */}
            {rootExamsCount > pageSize && (
              <div className="grid grid-cols-[1fr_auto] items-center px-10 py-6 border-b border-outline-variant/10 bg-surface-container-low/20">
                <div className="flex items-center gap-20">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                    Exam Name / Dynamics
                  </span>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                  Actions
                </span>
              </div>
            )}

            {/* Tree Content Area */}
            <div className="p-6 min-h-[60vh] relative flex flex-col justify-start">
              {rootExamsCount === 0 && !isRootLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-surface-container rounded-[2.5rem] flex items-center justify-center mb-6 border border-outline-variant/10 shadow-inner">
                    <Search className="text-on-surface-variant/20" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-on-background tracking-tight mb-2">
                    No Exams Found
                  </h3>
                  <p className="text-on-surface-variant/60 font-medium max-w-xs mb-8 leading-relaxed">
                    It looks like you haven't started your taxonomy yet. Create your first exam to
                    get started.
                  </p>
                  <button
                    onClick={() => handleOpenCreateForm(null)}
                    className="flex items-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    <PlusCircle size={20} strokeWidth={2.5} />
                    Create Your First Exam
                  </button>
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
                  />
                </div>
              )}
            </div>

            {/* List Footer/Pagination - Only show if more than one page exists */}
            {rootExamsCount > pageSize && (
              <footer className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  Showing{' '}
                  <span className="text-on-background">
                    {(currentPage - 1) * pageSize + 1}-
                    {Math.min(currentPage * pageSize, rootExamsCount)}
                  </span>{' '}
                  of <span className="text-on-background">{rootExamsCount} Exams</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30"
                  >
                    <ChevronDown className="rotate-90" size={18} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        'w-10 h-10 rounded-xl text-xs font-black transition-all',
                        p === currentPage
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30"
                  >
                    <ChevronDown className="-rotate-90" size={18} />
                  </button>
                </div>
              </footer>
            )}
          </div>
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
