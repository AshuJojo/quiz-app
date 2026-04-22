'use client';

import { cn } from '@/lib/utils/cn';
import { ChevronDown, Search, X, Loader2 } from 'lucide-react';
import { useState, useRef, useEffect, useMemo } from 'react';
import { HierarchicalOption } from './hierarchical-option';

export interface TreeItem {
  id: string;
  name: string;
  hasChildren: boolean;
  children?: TreeItem[];
  isLoading?: boolean;
}

interface HierarchicalSelectProps {
  value?: string;
  onChange: (id: string) => void;
  onFetchChildren: (parentId: string) => Promise<TreeItem[]>;
  initialData: TreeItem[];
  placeholder?: string;
  className?: string;
  error?: string;
  isLoadingInitial?: boolean;
  selectedLabel?: string;
  triggerClassName?: string;
  inputClassName?: string;
}

export function HierarchicalSelect({
  value,
  onChange,
  onFetchChildren,
  initialData,
  placeholder = 'Select an item...',
  className,
  error,
  isLoadingInitial = false,
  selectedLabel,
  triggerClassName,
  inputClassName,
}: HierarchicalSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [treeData, setTreeData] = useState<TreeItem[]>(initialData);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [prevInitialData, setPrevInitialData] = useState(initialData);

  // Sync treeData with initialData during render (soft merge)
  if (initialData !== prevInitialData) {
    setPrevInitialData(initialData);
    setTreeData((prev) => {
      if (prev.length === 0) return initialData;
      return initialData.map((newItem) => {
        const existingItem = prev.find((p) => p.id === newItem.id);
        if (existingItem) {
          return {
            ...newItem,
            children: existingItem.children,
            isLoading: existingItem.isLoading,
          };
        }
        return newItem;
      });
    });
  }

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Autofocus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Derive selected name
  const selectedName = useMemo(() => {
    if (!value) return '';

    const findName = (items: TreeItem[]): string | undefined => {
      for (const item of items) {
        if (item.id === value) return item.name;
        if (item.children) {
          const name = findName(item.children);
          if (name) return name;
        }
      }
      return undefined;
    };

    return findName(treeData) || selectedLabel || '';
  }, [value, treeData, selectedLabel]);

  const handleFetchChildren = async (parentId: string) => {
    // Set loading state
    const setItemLoading = (items: TreeItem[]): TreeItem[] => {
      return items.map((item) => {
        if (item.id === parentId) return { ...item, isLoading: true };
        if (item.children) return { ...item, children: setItemLoading(item.children) };
        return item;
      });
    };
    setTreeData((prev) => setItemLoading(prev));

    try {
      const children = await onFetchChildren(parentId);

      const updateChildren = (items: TreeItem[]): TreeItem[] => {
        return items.map((item) => {
          if (item.id === parentId) return { ...item, children, isLoading: false };
          if (item.children) return { ...item, children: updateChildren(item.children) };
          return item;
        });
      };
      setTreeData((prev) => updateChildren(prev));
    } catch (err) {
      console.error('Failed to fetch children:', err);
      // Reset loading state
      const resetLoading = (items: TreeItem[]): TreeItem[] => {
        return items.map((item) => ({
          ...item,
          isLoading: false,
          children: item.children ? resetLoading(item.children) : undefined,
        }));
      };
      setTreeData((prev) => resetLoading(prev));
    }
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
    setSearchQuery('');
  };

  const renderOptions = (items: TreeItem[], level = 0): React.ReactNode[] => {
    return items
      .filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (item.children && renderOptions(item.children, level + 1).length > 0)
      )
      .map((item) => (
        <HierarchicalOption
          key={item.id}
          id={item.id}
          name={item.name}
          level={level}
          hasChildren={item.hasChildren}
          onFetchChildren={handleFetchChildren}
          onSelect={handleSelect}
          isSelected={value === item.id}
          isLoadingChildren={item.isLoading}
        >
          {item.children && renderOptions(item.children, level + 1)}
        </HierarchicalOption>
      ));
  };

  const handleTriggerClick = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (!next) setSearchQuery('');
      return next;
    });
  };

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {/* Trigger */}
      <div
        onClick={handleTriggerClick}
        className={cn(
          'flex items-center gap-4 px-6 py-4 rounded-2xl border-2 border-outline-variant/30 bg-white/50 cursor-pointer transition-all hover:border-primary/50 group',
          isOpen ? 'border-primary ring-4 ring-primary/10 bg-white' : '',
          error ? 'border-red-500/50 focus:border-red-500' : '',
          triggerClassName
        )}
      >
        <div className="flex-1 min-w-0 relative">
          <input
            ref={inputRef}
            type="text"
            className={cn(
              'w-full bg-transparent border-none outline-none text-lg font-bold placeholder:text-on-surface-variant/40 placeholder:font-bold',
              !isOpen && 'cursor-pointer',
              inputClassName
            )}
            placeholder={placeholder}
            value={isOpen ? searchQuery : selectedName || ''}
            onChange={(e) => {
              if (isOpen) {
                setSearchQuery(e.target.value);
              }
            }}
            readOnly={!isOpen}
          />
        </div>

        <div className="flex items-center gap-2">
          {searchQuery && isOpen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearchQuery('');
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full hover:bg-surface-container text-on-surface-variant/40 hover:text-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
          {isLoadingInitial && <Loader2 size={18} className="animate-spin text-primary/40" />}
          <ChevronDown
            size={20}
            className={cn(
              'text-on-surface-variant/40 transition-transform duration-300 group-hover:text-primary/60',
              isOpen ? 'rotate-180 text-primary' : ''
            )}
          />
        </div>
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-3 z-[110] bg-surface-container-lowest/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden animate-in zoom-in-95 slide-in-from-top-4 duration-300 flex flex-col max-h-[400px]">
          {/* List */}
          <div className="flex-1 overflow-y-auto p-2 min-h-[200px] custom-scrollbar">
            {isLoadingInitial && treeData.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                  <Loader2 size={32} className="animate-spin text-primary relative" />
                </div>
                <p className="text-sm font-black text-on-surface-variant uppercase tracking-widest animate-pulse">
                  Loading Categories...
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {renderOptions(treeData).length > 0 ? (
                  renderOptions(treeData)
                ) : (
                  <div className="text-center py-12 px-6">
                    <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search size={24} className="text-on-surface-variant/20" />
                    </div>
                    <p className="font-bold text-on-surface-variant/60">
                      No exams matched your search
                    </p>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-4 text-xs font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      Clear search
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
