'use client';

import { ExamForm } from '@/components/features/exams/components/exam-form';
import { ExamTree } from '@/components/features/exams/components/exam-tree';
import { cn } from '@/lib/utils/cn';
import { examService } from '@/services/exam-service';
import { Exam } from '@/types/exam';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, FolderTree, Plus, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';

export default function ExamsPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

  // Fetch root exams for count-based logic and empty state
  const { data: rootExamsData, isLoading: isRootLoading } = useQuery({
    queryKey: ['exams', null],
    queryFn: () => examService.getExams(null),
  });

  const exams = Array.isArray(rootExamsData?.data) ? rootExamsData.data : [];
  const rootExamsCount = exams.length;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: Partial<Exam>) => examService.createExam(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      handleCloseForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Exam> }) =>
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

  const handleSubmit = async (data: Partial<Exam>) => {
    if (editingExam?.id) {
      await updateMutation.mutateAsync({ id: editingExam.id, data });
    } else {
      await createMutation.mutateAsync({ ...data, parentId: selectedParentId });
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
          <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-[3rem] border border-outline-variant/10 shadow-ambient overflow-hidden">
            {/* List Header Labels - Show only if > 10 root exams */}
            {rootExamsCount > 10 && (
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
            <div className="p-6 min-h-[500px] relative flex flex-col justify-center">
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
                    onEdit={handleOpenEditForm}
                    onDelete={handleDelete}
                    onAddChild={handleOpenCreateForm}
                  />
                </div>
              )}
            </div>

            {/* List Footer/Pagination - Only show if exams exist */}
            {rootExamsCount > 0 && (
              <footer className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[11px] font-bold text-on-surface-variant/60 uppercase tracking-widest">
                  Showing{' '}
                  <span className="text-on-background">1-{Math.min(10, rootExamsCount)}</span> of{' '}
                  <span className="text-on-background">{rootExamsCount} groups</span>
                </p>

                <div className="flex items-center gap-2">
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30">
                    <ChevronDown className="rotate-90" size={18} />
                  </button>
                  {[1].map((page) => (
                    <button
                      key={page}
                      className={cn(
                        'w-10 h-10 rounded-xl text-xs font-black transition-all',
                        page === 1
                          ? 'bg-primary text-white shadow-lg shadow-primary/20'
                          : 'text-on-surface-variant hover:bg-surface-container'
                      )}
                    >
                      {page}
                    </button>
                  ))}
                  <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30">
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
