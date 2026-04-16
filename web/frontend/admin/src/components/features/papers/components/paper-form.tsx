'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Paper, PaperSchema, CreatePaperInput } from '@/types/paper';
import { Exam } from '@/types/exam';
import { X, Loader2, Save } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useQuery } from '@tanstack/react-query';
import { examService } from '@/services/exam-service';

interface PaperFormProps {
  initialData?: Partial<Paper>;
  onSubmit: (data: CreatePaperInput) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export function PaperForm({ initialData, onSubmit, onClose, isLoading }: PaperFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePaperInput>({
    resolver: zodResolver(PaperSchema),
    defaultValues: {
      title: initialData?.title || '',
      examId: initialData?.examId || null,
      totalQuestions: initialData?.totalQuestions || 0,
      duration: initialData?.duration || 0,
      year: initialData?.year || null,
      isPublished: initialData?.isPublished || false,
    },
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Premium Backdrop */}
      <div
        className="absolute inset-0 bg-on-background/20 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg bg-surface-container-lowest/90 backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-white/40 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-8 duration-500 shadow-primary/5">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between px-8 py-4 border-b border-outline-variant/30 relative">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black tracking-tight text-on-background font-display leading-tight">
              {initialData?.id ? 'Edit Paper' : 'Add Paper'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-2xl hover:bg-surface-container transition-all text-on-surface-variant hover:text-on-background active:scale-90"
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-4 relative">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-on-surface uppercase tracking-widest ml-1">
              Paper Name
            </label>
            <div className="relative group">
              <input
                {...register('title')}
                autoFocus
                placeholder="e.g. Civil Services (Prelims) 2024"
                className={cn(
                  'w-full px-6 py-4 rounded-2xl border-2 border-outline-variant/30 bg-white/50 text-on-background font-bold placeholder:text-on-surface-variant/40 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none text-lg',
                  errors.title && 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                )}
              />
            </div>
            {errors.title && (
              <div className="flex items-center gap-2 mt-2 ml-1 text-red-600 animate-in slide-in-from-left-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                <p className="text-xs font-black uppercase tracking-wider">
                  {errors.title.message}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-sm font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-container rounded-2xl transition-all active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-10 py-4 text-sm font-black text-white bg-primary hover:bg-primary/90 rounded-2xl transition-all shadow-xl shadow-primary/20 hover:shadow-primary/30 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[180px] uppercase tracking-widest"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>{initialData?.id ? 'Update Paper' : 'Create Paper'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
