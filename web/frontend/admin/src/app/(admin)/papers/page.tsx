'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperService } from '@/services/paper-service';
import { PaperItem } from '@/components/features/papers/components/paper-item';
import { PaperForm } from '@/components/features/papers/components/paper-form';
import { Paper, CreatePaperInput, UpdatePaperInput } from '@/types/paper';
import { FileText, Plus, Search, Loader2, Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

export default function PapersPage() {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<Paper | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: papersData, isLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperService.getPapers(),
  });

  const papers = Array.isArray(papersData?.data) ? papersData.data : [];
  const filteredPapers = papers.filter((p: Paper) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isAllSelected =
    filteredPapers.length > 0 && filteredPapers.every((p) => selectedIds.includes(p.id!));

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
      const allIds = filteredPapers.map((p) => p.id!);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    } else {
      const allIds = filteredPapers.map((p) => p.id!);
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
              ) : filteredPapers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-surface-container rounded-[2.5rem] flex items-center justify-center mb-6 border border-outline-variant/10 shadow-inner">
                    <Search className="text-on-surface-variant/20" size={40} />
                  </div>
                  <h3 className="text-2xl font-black text-on-background tracking-tight mb-2">
                    No Papers Found
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
                  {filteredPapers.map((paper: Paper) => (
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
