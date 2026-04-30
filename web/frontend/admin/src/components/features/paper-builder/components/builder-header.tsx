'use client';

import { ArchiveRestore, FileJson, Rocket, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface BuilderHeaderProps {
  paperTitle: string;
  isLoading: boolean;
  isDirty: boolean;
  isSaving: boolean;
  isPublished: boolean;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onPublish: () => void;
  onMoveToDraft: () => void;
  onImport: () => void;
  onBack: () => void;
}

export default function BuilderHeader({
  paperTitle,
  isLoading,
  isDirty,
  isSaving,
  isPublished,
  onTitleChange,
  onSave,
  onPublish,
  onMoveToDraft,
  onImport,
  onBack,
}: BuilderHeaderProps) {
  const canSave = isDirty && !isSaving;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTitleClick = () => {
    if (isLoading) return;
    setIsEditingTitle(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const handleTitleBlur = () => {
    setIsEditingTitle(false);
    if (!paperTitle.trim()) onTitleChange('Untitled Paper');
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setIsEditingTitle(false);
      if (!paperTitle.trim()) onTitleChange('Untitled Paper');
      inputRef.current?.blur();
    }
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-surface-container-lowest/80 backdrop-blur-2xl border-b border-outline-variant/10 z-50">
      <div className="flex items-center gap-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-on-background transition-colors group"
        >
          <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <div className="w-[1px] h-6 bg-outline-variant/20" />

        {isLoading ? (
          <span className="text-sm font-black text-on-surface-variant/40 tracking-tight">
            Loading...
          </span>
        ) : isEditingTitle ? (
          <input
            ref={inputRef}
            value={paperTitle}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            className="text-sm font-black text-on-background tracking-tight bg-transparent border-b border-primary/50 focus:outline-none focus:border-primary w-48 min-w-0"
          />
        ) : (
          <button
            onClick={handleTitleClick}
            className="text-sm font-black text-on-background tracking-tight truncate max-w-[200px] hover:text-primary transition-colors text-left"
            title="Click to edit title"
          >
            {paperTitle || 'Untitled Paper'}
          </button>
        )}

        {/* Status badge */}
        {!isLoading && (
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest select-none transition-all duration-300 ${
              isPublished
                ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20'
                : 'bg-amber-400/15 text-amber-500 border border-amber-400/20'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isPublished ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'
              }`}
            />
            {isPublished ? 'Published' : 'Draft'}
          </span>
        )}
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        {/* 0. Import JSON */}
        <button
          onClick={onImport}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant/60 text-xs font-black uppercase tracking-widest hover:bg-surface-container hover:text-on-background transition-all select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileJson size={14} strokeWidth={2.5} />
          Import JSON
        </button>

        {/* 1. Save Progress */}
        <button
          onClick={onSave}
          disabled={!canSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-xs font-black uppercase tracking-widest select-none ${
            canSave
              ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              : 'border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <div
              className={`w-2 h-2 rounded-full ${canSave ? 'bg-primary animate-pulse' : 'bg-on-surface-variant/20'}`}
            />
          )}
          {isSaving ? 'Saving...' : 'Save Progress'}
        </button>

        {/* 2. Move to Draft */}
        <button
          onClick={onMoveToDraft}
          disabled={!isPublished || isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all text-xs font-black uppercase tracking-widest select-none ${
            isPublished && !isSaving
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20'
              : 'border-outline-variant/20 text-on-surface-variant/40 cursor-not-allowed'
          }`}
        >
          <ArchiveRestore size={14} strokeWidth={3} />
          Move to Draft
        </button>

        {/* 3. Publish */}
        <button
          onClick={onPublish}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all select-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Rocket size={16} strokeWidth={3} />
          Publish
        </button>
      </div>
    </header>
  );
}
