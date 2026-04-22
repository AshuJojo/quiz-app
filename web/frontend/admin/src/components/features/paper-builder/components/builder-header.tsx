'use client';

import { Rocket, X } from 'lucide-react';

interface BuilderHeaderProps {
  paperTitle: string;
  isLoading: boolean;
  isDirty: boolean;
  isSaving: boolean;
  onSave: () => void;
  onPublish: () => void;
  onBack: () => void;
}

export default function BuilderHeader({
  paperTitle,
  isLoading,
  isDirty,
  isSaving,
  onSave,
  onPublish,
  onBack,
}: BuilderHeaderProps) {
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
        <h1 className="text-sm font-black text-on-background tracking-tight truncate max-w-[200px]">
          {isLoading ? 'Loading...' : paperTitle || 'Untitled Paper'}
        </h1>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <button
          onClick={onSave}
          disabled={!isDirty || isSaving}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/20 transition-all text-xs font-black uppercase tracking-widest select-none ${
            isDirty
              ? 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
              : 'text-on-surface-variant/40 cursor-not-allowed'
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <div
              className={`w-2 h-2 rounded-full ${isDirty ? 'bg-primary animate-pulse' : 'bg-on-surface-variant/20'}`}
            />
          )}
          {isSaving ? 'Saving...' : 'Save Progress'}
        </button>
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
