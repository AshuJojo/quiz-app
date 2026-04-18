'use client';

import { cn } from '@/lib/utils/cn';
import { ChevronDown, Folder, FileText, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface HierarchicalOptionProps {
  id: string;
  name: string;
  level?: number;
  hasChildren: boolean;
  onFetchChildren: (parentId: string) => void;
  onSelect: (id: string, name: string) => void;
  isSelected?: boolean;
  isLoadingChildren?: boolean;
  children?: React.ReactNode;
}

export function HierarchicalOption({
  id,
  name,
  level = 0,
  hasChildren,
  onFetchChildren,
  onSelect,
  isSelected = false,
  isLoadingChildren = false,
  children,
}: HierarchicalOptionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isExpanded && hasChildren && !children) {
      onFetchChildren(id);
    }
    setIsExpanded(!isExpanded);
  };

  const handleSelect = () => {
    if (!hasChildren) {
      onSelect(id, name);
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={handleSelect}
        className={cn(
          'flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer group',
          isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-surface-container',
          hasChildren ? 'cursor-default' : 'hover:scale-[1.01] active:scale-[0.99]',
          level > 0 && 'ms-4'
        )}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {hasChildren ? (
            <button
              type="button"
              onClick={handleToggle}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-300 hover:bg-surface-container-high',
                isExpanded ? 'rotate-0' : '-rotate-90'
              )}
            >
              {isLoadingChildren ? (
                <Loader2 size={16} className="animate-spin text-on-surface-variant/40" />
              ) : (
                <ChevronDown
                  size={16}
                  className={cn(isExpanded ? 'text-primary' : 'text-on-surface-variant/40')}
                />
              )}
            </button>
          ) : (
            <div className="w-8 flex justify-center">
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all group-hover:scale-150',
                  isSelected ? 'bg-primary' : 'bg-outline-variant/30'
                )}
              />
            </div>
          )}

          <div className="flex items-center gap-2 min-w-0">
            {hasChildren ? (
              <Folder size={16} className="text-primary/60 shrink-0" />
            ) : (
              <FileText size={16} className="text-on-surface-variant/30 shrink-0" />
            )}
            <span
              className={cn(
                'text-[15px] truncate font-bold tracking-tight transition-colors',
                isSelected ? 'text-primary' : 'text-on-surface'
              )}
            >
              {name}
            </span>
          </div>
        </div>

        {!hasChildren && (
          <div
            className={cn(
              'px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all',
              isSelected
                ? 'bg-primary text-white'
                : 'bg-outline-variant/10 text-on-surface-variant/60 group-hover:bg-primary/10 group-hover:text-primary'
            )}
          >
            Select
          </div>
        )}
      </div>

      {isExpanded && (children || isLoadingChildren) && (
        <div className="mt-1 relative border-l-2 border-outline-variant/10 ms-6 ps-2 animate-in slide-in-from-top-2 duration-300">
          {isLoadingChildren && !children ? (
            <div className="flex items-center gap-2 py-2 px-4 animate-pulse">
              <Loader2 size={14} className="animate-spin text-on-surface-variant/20" />
              <span className="text-xs font-bold text-on-surface-variant/40 uppercase tracking-widest">
                Loading...
              </span>
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  );
}
