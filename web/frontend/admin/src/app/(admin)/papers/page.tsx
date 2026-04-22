'use client';

import { PaperForm } from '@/components/features/papers/components/paper-form';
import { PaperItem } from '@/components/features/papers/components/paper-item';
import { DataTable } from '@/components/ui/data-table/data-table';
import { paperService } from '@/components/features/papers/services';
import { CreatePaperInput, Paper, UpdatePaperInput } from '@/components/features/papers/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, Search } from 'lucide-react';
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
  const totalPages = Math.ceil(totalPapers / 10);
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
          <DataTable
            headers={['Paper Name']}
            selectedCount={selectedIds.length}
            totalCount={totalPapers}
            isAllSelected={isAllSelected}
            onSelectAll={handleSelectAll}
            onBulkDelete={handleBulkDelete}
            onClearSelection={() => setSelectedIds([])}
            resourceName="paper"
            isLoading={isLoading}
            searchQuery={searchQuery}
            onAddFirst={handleOpenCreateForm}
            addFirstLabel="Create First Paper"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          >
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
          </DataTable>
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
