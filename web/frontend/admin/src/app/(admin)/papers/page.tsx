'use client';

import { PaperForm } from '@/components/features/papers/components/paper-form';
import { PaperItem } from '@/components/features/papers/components/paper-item';
import { cn } from '@/lib/utils/cn';
import { paperService } from '@/services/paper-service';
import { CreatePaperInput, Paper, UpdatePaperInput } from '@/types/paper';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronDown, FileText, Loader2, Plus, Search } from 'lucide-react';
import { useState } from 'react';

export default function PapersPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { data: papersData, isLoading } = useQuery({
    queryKey: ['papers', searchQuery, currentPage],
    queryFn: () => paperService.getPapers(undefined, searchQuery, currentPage),
  });

  const papers = Array.isArray(papersData?.data) ? papersData.data : [];
  const totalPapers = papersData?.total || 0;
  const totalPages = papersData?.totalPages || 1;
  const isAllSelected = papers.length > 0 && papers.every((p: any) => selectedIds.includes(p.id!));

  const createMutation = useMutation({
    mutationFn: (data: CreatePaperInput) => paperService.createPaper(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      handleCloseForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePaperInput }) =>
      paperService.updatePaper(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      handleCloseForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paperService.deletePaper(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) => paperService.bulkDeletePapers(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      setSelectedIds([]);
    },
  });

  const handleOpenCreateForm = () => {
    setEditingPaper(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (paper: Paper) => {
    setEditingPaper(paper);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPaper(null);
  };

  const handleSubmit = async (data: CreatePaperInput) => {
    if (editingPaper?.id) {
      await updateMutation.mutateAsync({ id: editingPaper.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      window.confirm('Are you sure you want to delete this paper? This action cannot be undone.')
    ) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((i) => i !== id)));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allIds = papers.map((p: any) => p.id!);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    } else {
      const allIds = papers.map((p: any) => p.id!);
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    }
  };

  const handleBulkDelete = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete ${selectedIds.length} selected papers? This action cannot be undone.`
      )
    ) {
      await bulkDeleteMutation.mutateAsync(selectedIds);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <FileText size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-5xl font-black tracking-tight text-on-background">Papers</h1>
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
              placeholder="Search papers..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-12 pr-6 py-4 bg-surface-container-low/50 border-2 border-outline-variant/10 rounded-2xl w-full lg:w-80 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none font-bold placeholder:text-on-surface-variant/30 text-base transition-all"
            />
          </div>

          <button
            onClick={handleOpenCreateForm}
            className="flex items-center justify-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20 ring-1 ring-primary/20"
          >
            <Plus size={24} strokeWidth={3} />
            Add Paper
          </button>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-12 space-y-6">
          <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-2xl border border-outline-variant/10 shadow-ambient overflow-hidden">
            {/* Table Header Row */}
            <div className="grid grid-cols-[1fr_auto] items-center px-10 py-6 border-b border-outline-variant/10 bg-surface-container-low/20">
              <div className="flex items-center gap-20">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                  Paper Name
                </span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                Actions
              </span>
            </div>

            {/* Contextual Action Bar */}
            {selectedIds.length > 0 && (
              <div className="bg-red-500/[0.03] border-b border-outline-variant/10 px-10 py-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-8">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="peer appearance-none w-5 h-5 rounded-md border-2 border-outline-variant/50 checked:bg-primary checked:border-primary transition-all cursor-pointer ring-offset-background focus:ring-2 focus:ring-primary/20"
                      />
                      <Check
                        className="absolute inset-0 m-auto text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none"
                        size={14}
                        strokeWidth={4}
                      />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60 group-hover:text-on-background transition-colors">
                      Select All
                    </span>
                  </label>
                  <div className="h-4 w-[1px] bg-outline-variant/20" />
                  <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    {selectedIds.length} paper{selectedIds.length > 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedIds([])}
                    className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-on-background transition-colors"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.15em] rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/10 active:scale-95"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="p-6 min-h-[60vh] relative flex flex-col justify-start">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader2 size={40} className="animate-spin text-primary/40" />
                  <p className="font-bold uppercase tracking-widest text-on-surface-variant/40 text-[10px]">
                    Hydrating Repository...
                  </p>
                </div>
              ) : papers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-surface-container rounded-[2.5rem] flex items-center justify-center mb-6 border border-outline-variant/10 shadow-inner">
                    <Search className="text-on-surface-variant/20" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-on-background tracking-tight mb-2">
                    {searchQuery ? 'No Matches Found' : 'No Papers Found'}
                  </h3>
                  <p className="text-on-surface-variant/60 font-bold max-w-sm mb-10 leading-relaxed uppercase tracking-wider text-xs">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different term or filter.`
                      : 'Start building your library by creating your first exam paper.'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={handleOpenCreateForm}
                      className="flex items-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                    >
                      <Plus size={20} strokeWidth={3} />
                      Create First Paper
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {papers.map((paper: Paper) => (
                    <PaperItem
                      key={paper.id}
                      paper={paper}
                      onEdit={handleOpenEditForm}
                      onDelete={handleDelete}
                      isSelected={selectedIds.includes(paper.id!)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {!isLoading && papers.length > 0 && totalPages > 1 && (
              <footer className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
                  Showing <span className="text-on-background">{(currentPage - 1) * 10 + 1}</span> -{' '}
                  <span className="text-on-background">
                    {Math.min(currentPage * 10, totalPapers)}
                  </span>{' '}
                  of <span className="text-on-background">{totalPapers} Papers</span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30 transition-colors"
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
                    className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30 transition-colors"
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
        <PaperForm
          initialData={editingPaper || undefined}
          onSubmit={handleSubmit}
          onClose={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}
