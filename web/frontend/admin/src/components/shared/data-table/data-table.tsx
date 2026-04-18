'use client';

import { cn } from '@/lib/utils/cn';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import React from 'react';

interface DataTableProps {
  // Header
  headers: string[];

  // Selection
  selectedCount: number;
  totalCount: number;
  isAllSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
  resourceName: string;

  // States
  isLoading: boolean;
  searchQuery?: string;
  onAddFirst?: () => void;
  addFirstLabel?: string;

  // Pagination
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  limit?: number;

  // Content
  children: React.ReactNode;
}

export function DataTable({
  headers,
  selectedCount,
  totalCount,
  isAllSelected,
  onSelectAll,
  onBulkDelete,
  onClearSelection,
  resourceName,
  isLoading,
  searchQuery,
  onAddFirst,
  addFirstLabel = 'Add New',
  currentPage,
  totalPages,
  onPageChange,
  limit = 10,
  children,
}: DataTableProps) {
  const resourceNamePlural = resourceName + (totalCount !== 1 ? 's' : '');

  return (
    <div className="bg-surface-container-lowest/50 backdrop-blur-3xl rounded-2xl border border-outline-variant/10 shadow-ambient overflow-hidden">
      {/* Table Header Row */}
      <div className="grid grid-cols-[1fr_auto] items-center px-10 py-6 border-b border-outline-variant/10 bg-surface-container-low/20">
        <div className="flex items-center gap-20">
          {headers.map((header, index) => (
            <span
              key={index}
              className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40"
            >
              {header}
            </span>
          ))}
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
          Actions
        </span>
      </div>

      {/* Contextual Action Bar */}
      {selectedCount > 0 && (
        <div className="bg-red-500/[0.03] border-b border-outline-variant/10 px-10 py-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-8">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
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
              {selectedCount} {resourceName}
              {selectedCount > 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClearSelection}
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40 hover:text-on-background transition-colors"
            >
              Clear Selection
            </button>
            <button
              onClick={onBulkDelete}
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
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-surface-container rounded-[2.5rem] flex items-center justify-center mb-6 border border-outline-variant/10 shadow-inner">
              <Search className="text-on-surface-variant/20" size={40} />
            </div>
            <h3 className="text-2xl font-black text-on-background tracking-tight mb-2">
              {searchQuery ? 'No Matches Found' : `No ${resourceNamePlural} Found`}
            </h3>
            <p className="text-on-surface-variant/60 font-bold max-w-sm mb-10 leading-relaxed uppercase tracking-wider text-xs">
              {searchQuery
                ? `No results for "${searchQuery}". Try a different term or filter.`
                : `Start building your library by creating your first ${resourceName}.`}
            </p>
            {!searchQuery && onAddFirst && (
              <button
                onClick={onAddFirst}
                className="flex items-center gap-3 px-10 py-5 bg-primary text-white font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
              >
                {addFirstLabel}
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && totalCount > 0 && totalPages > 1 && (
        <footer className="px-10 py-6 border-t border-outline-variant/10 bg-surface-container-low/20 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/40">
            Showing <span className="text-on-background">{(currentPage - 1) * limit + 1}</span> -{' '}
            <span className="text-on-background">{Math.min(currentPage * limit, totalCount)}</span>{' '}
            of{' '}
            <span className="text-on-background">
              {totalCount} {resourceNamePlural}
            </span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronDown className="rotate-90" size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => onPageChange(p)}
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
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-2 text-on-surface-variant hover:bg-surface-container rounded-lg disabled:opacity-30 transition-colors"
            >
              <ChevronDown className="-rotate-90" size={18} />
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
