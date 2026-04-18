'use client';

import { cn } from '@/lib/utils/cn';
import { Check } from 'lucide-react';
import React from 'react';

interface DataTableItemProps {
  isSelected?: boolean;
  onSelect?: (id: string, selected: boolean) => void;
  id?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  level?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function DataTableItem({
  isSelected = false,
  onSelect,
  id,
  actions,
  children,
  level = 0,
  className,
  style,
}: DataTableItemProps) {
  return (
    <div
      className={cn(
        'group relative flex items-center justify-between py-4 px-10 rounded-2xl transition-all duration-300 border border-transparent',
        'hover:bg-surface-container-lowest hover:shadow-ambient hover:border-outline-variant/20 bg-surface-container-low/40',
        isSelected && 'bg-primary/5 border-primary/20 shadow-ambient',
        className
      )}
      style={{
        marginLeft: level > 0 ? `${level * 2}rem` : undefined,
        ...style,
      }}
    >
      <div className="flex items-center gap-6 overflow-hidden">
        {onSelect && id && (
          <div className="relative flex items-center flex-shrink-0">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(id, e.target.checked)}
              className="peer appearance-none w-5 h-5 rounded-md border-2 border-outline-variant/50 checked:bg-primary checked:border-primary transition-all cursor-pointer ring-offset-background focus:ring-2 focus:ring-primary/20"
            />
            <Check
              className="absolute inset-0 m-auto text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none"
              size={14}
              strokeWidth={4}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">{children}</div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 ml-4 flex-shrink-0">
        {actions}
      </div>
    </div>
  );
}
