'use client';

import {
  HierarchicalSelect,
  TreeItem,
} from '@/components/ui/hierarchical-select/hierarchical-select';
import { PaperType, PaperVariant } from '@/components/features/papers/types';
import { Calendar, Globe, Layers, Pencil, Plus, Tag, Target, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface PaperSettingsPanelProps {
  description: string;
  examId: string;
  exams: any[];
  selectedLabel?: string;
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  hasSections: boolean;
  duration: number;
  paperDate: Date | null;
  hasPaperDate: boolean;
  paperTypeId: string | null;
  paperTypes: PaperType[];
  variants: PaperVariant[];
  currentPaperId: string;
  onDescriptionChange: (v: string) => void;
  onExamIdChange: (v: string) => void;
  onFetchChildren: (parentId: string) => Promise<any[]>;
  onDefaultPositiveMarksChange: (v: number) => void;
  onDefaultNegativeMarksChange: (v: number) => void;
  onHasSectionsChange: (v: boolean) => void;
  onDurationChange: (v: number) => void;
  onPaperDateChange: (v: Date | null) => void;
  onHasPaperDateChange: (v: boolean) => void;
  onPaperTypeChange: (id: string | null) => void;
  onCreatePaperType: (name: string) => Promise<void>;
  onDeletePaperType: (id: string) => Promise<void>;
  onCreateVariant: (language: string) => Promise<void>;
  onSwitchVariant: (variantId: string) => void;
  onRenameVariant: (variantId: string, title: string) => Promise<void>;
  onDeleteVariant: (variantId: string) => Promise<void>;
}

export default function PaperSettingsPanel({
  description,
  examId,
  exams,
  selectedLabel,
  defaultPositiveMarks,
  defaultNegativeMarks,
  hasSections,
  duration,
  paperDate,
  hasPaperDate,
  paperTypeId,
  paperTypes,
  variants,
  currentPaperId,
  onDescriptionChange,
  onExamIdChange,
  onFetchChildren,
  onDefaultPositiveMarksChange,
  onDefaultNegativeMarksChange,
  onHasSectionsChange,
  onDurationChange,
  onPaperDateChange,
  onHasPaperDateChange,
  onPaperTypeChange,
  onCreatePaperType,
  onDeletePaperType,
  onCreateVariant,
  onSwitchVariant,
  onRenameVariant,
  onDeleteVariant,
}: PaperSettingsPanelProps) {
  const treeItems: TreeItem[] = exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    hasChildren: exam._count?.children > 0,
  }));

  const [newPaperTypeName, setNewPaperTypeName] = useState('');
  const [showPaperTypeInput, setShowPaperTypeInput] = useState(false);
  const [creatingPaperType, setCreatingPaperType] = useState(false);

  const handleCreatePaperTypeLocal = async () => {
    const name = newPaperTypeName.trim();
    if (!name) return;
    setCreatingPaperType(true);
    try {
      await onCreatePaperType(name);
      setNewPaperTypeName('');
      setShowPaperTypeInput(false);
    } catch {
      toast.error('Failed to create paper type');
    } finally {
      setCreatingPaperType(false);
    }
  };

  const [showVariantPicker, setShowVariantPicker] = useState(false);
  const [creatingVariant, setCreatingVariant] = useState(false);
  const [selectedVariantLang, setSelectedVariantLang] = useState('');
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingVariantTitle, setEditingVariantTitle] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);

  const handleCreateVariant = async () => {
    if (!selectedVariantLang) return;
    setCreatingVariant(true);
    try {
      await onCreateVariant(selectedVariantLang);
    } catch {
      toast.error('Failed to create variant');
    } finally {
      setCreatingVariant(false);
      setShowVariantPicker(false);
    }
  };

  const startEditVariant = (v: PaperVariant) => {
    setEditingVariantId(v.id);
    setEditingVariantTitle(v.variantName ?? '');
    setTimeout(() => editInputRef.current?.select(), 0);
  };

  const saveEditVariant = async () => {
    if (!editingVariantId) return;
    const trimmed = editingVariantTitle.trim();
    if (!trimmed) {
      setEditingVariantId(null);
      return;
    }
    try {
      await onRenameVariant(editingVariantId, trimmed);
    } catch {
      toast.error('Failed to rename variant');
    } finally {
      setEditingVariantId(null);
    }
  };

  const cancelEditVariant = () => setEditingVariantId(null);

  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">
            Global Configuration
          </h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 pt-4 border-t border-outline-variant/5">
            <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
              Paper Description
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Enter paper description..."
              rows={3}
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-on-surface-variant/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
              Exam
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
                <Target size={16} />
              </div>
              <HierarchicalSelect
                value={examId}
                initialData={treeItems}
                onChange={onExamIdChange}
                onFetchChildren={onFetchChildren}
                placeholder="Select Exam"
                selectedLabel={selectedLabel}
                triggerClassName="!pl-12 !p-3 !text-sm !border-outline-variant/10 !bg-surface-container-lowest !rounded-2xl !font-normal"
                inputClassName="!text-sm !font-normal !placeholder:font-normal"
              />
            </div>
          </div>

          {/* Paper Type */}
          {examId && (
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1 flex items-center gap-1">
                Paper Type
                <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${!paperTypeId ? 'text-red-400' : 'text-on-surface-variant/30 group-focus-within:text-primary'}`}
                >
                  <Tag size={16} />
                </div>
                <select
                  value={paperTypeId ?? ''}
                  onChange={(e) => onPaperTypeChange(e.target.value || null)}
                  className={`w-full appearance-none bg-surface-container-lowest rounded-2xl p-3.5 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 transition-all border ${
                    !paperTypeId
                      ? 'border-red-400/50 focus:ring-red-400/20 focus:border-red-400'
                      : 'border-outline-variant/10 focus:ring-primary/20'
                  }`}
                >
                  <option value="">— Select paper type —</option>
                  {paperTypes.map((pt) => (
                    <option key={pt.id} value={pt.id}>
                      {pt.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Inline type management */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {paperTypes.map((pt) => (
                  <span
                    key={pt.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-container text-[10px] font-black text-on-surface-variant/60"
                  >
                    {pt.name}
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete paper type "${pt.name}"?`)) {
                          onDeletePaperType(pt.id);
                        }
                      }}
                      className="hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </span>
                ))}
              </div>

              {showPaperTypeInput ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    value={newPaperTypeName}
                    onChange={(e) => setNewPaperTypeName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPaperTypeName.trim())
                        handleCreatePaperTypeLocal();
                      if (e.key === 'Escape') setShowPaperTypeInput(false);
                    }}
                    placeholder="e.g. Previous Year Paper"
                    autoFocus
                    className="flex-1 min-w-0 bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-3 py-2 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
                  />
                  <button
                    onClick={handleCreatePaperTypeLocal}
                    disabled={creatingPaperType || !newPaperTypeName.trim()}
                    className="px-3 py-2 rounded-xl bg-primary text-white text-[11px] font-black disabled:opacity-50"
                  >
                    {creatingPaperType ? '...' : 'Add'}
                  </button>
                  <button
                    onClick={() => setShowPaperTypeInput(false)}
                    className="px-3 py-2 rounded-xl border border-outline-variant/20 text-on-surface-variant/60 text-[11px] font-black"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowPaperTypeInput(true)}
                  className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-on-surface-variant/40 hover:text-primary transition-colors mt-1"
                >
                  <Plus size={11} strokeWidth={3} />
                  New Type
                </button>
              )}
            </div>
          )}

          <div className="space-y-4 pt-4 border-t border-outline-variant/5">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shadow-sm">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-on-surface">
                    Paper Date
                  </p>
                  <p className="text-[9px] text-on-surface-variant/50">
                    Specify the original paper year
                  </p>
                </div>
              </div>
              <button
                onClick={() => onHasPaperDateChange(!hasPaperDate)}
                className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
                  hasPaperDate ? 'bg-primary' : 'bg-outline-variant/30'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                    hasPaperDate ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {hasPaperDate && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
                  Select Date
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
                    <Calendar size={16} />
                  </div>
                  <input
                    type="date"
                    value={
                      paperDate instanceof Date && !isNaN(paperDate.getTime())
                        ? paperDate.toISOString().split('T')[0]
                        : ''
                    }
                    onChange={(e) =>
                      onPaperDateChange(e.target.value ? new Date(e.target.value) : null)
                    }
                    className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="space-y-4 pt-4 border-t border-outline-variant/5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-primary/40 rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">
            Score & Timing
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
              Default Pos.
            </label>
            <input
              type="number"
              value={defaultPositiveMarks}
              onChange={(e) => onDefaultPositiveMarksChange(Number(e.target.value))}
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 text-center text-sm font-black text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
              Default Neg.
            </label>
            <input
              type="number"
              value={defaultNegativeMarks}
              onChange={(e) => onDefaultNegativeMarksChange(Number(e.target.value))}
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 text-center text-sm font-black text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
            Duration (HH:MM:SS)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'H', value: Math.floor(duration / 3600), max: 99 },
              { label: 'M', value: Math.floor((duration % 3600) / 60), max: 59 },
              { label: 'S', value: duration % 60, max: 59 },
            ].map((unit, i) => (
              <div key={unit.label} className="relative group/unit">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-on-surface-variant/30 group-focus-within/unit:text-primary pointer-events-none transition-colors">
                  {unit.label}
                </div>
                <input
                  type="number"
                  min={0}
                  max={unit.max}
                  value={unit.value || ''}
                  onChange={(e) => {
                    const val = Math.min(unit.max, Math.max(0, Number(e.target.value)));
                    const hms = [
                      Math.floor(duration / 3600),
                      Math.floor((duration % 3600) / 60),
                      duration % 60,
                    ];
                    hms[i] = val;
                    onDurationChange(hms[0] * 3600 + hms[1] * 60 + hms[2]);
                  }}
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-8 text-sm font-black text-center text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/20"
                  placeholder="00"
                />
              </div>
            ))}
          </div>
          <p className="text-[9px] text-on-surface-variant/40 ml-1 italic">
            Total time: {Math.floor(duration / 3600)}Hr {Math.floor((duration % 3600) / 60)}Min{' '}
            {(duration % 60).toString().padStart(2, '0')}s
          </p>
        </div>
      </section>

      <section className="space-y-4 pt-4 border-t border-outline-variant/5">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-low transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary shadow-sm">
              <Layers size={18} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-on-surface">
                Have Sections
              </p>
              <p className="text-[9px] text-on-surface-variant/50">Group questions into subjects</p>
            </div>
          </div>
          <button
            onClick={() => onHasSectionsChange(!hasSections)}
            className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${
              hasSections ? 'bg-primary' : 'bg-outline-variant/30'
            }`}
          >
            <div
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm ${
                hasSections ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Language Variants */}
      <section className="space-y-3 pt-4 border-t border-outline-variant/5">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-1 h-4 bg-primary/30 rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">
            Variants
          </h3>
        </div>

        <div className="space-y-2">
          {variants.map((v) => {
            const isCurrent = v.id === currentPaperId;
            const isEditing = editingVariantId === v.id;
            return (
              <div
                key={v.id}
                className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border transition-all ${
                  isCurrent
                    ? 'border-primary/30 bg-primary/5'
                    : 'border-outline-variant/10 bg-surface-container-lowest'
                }`}
              >
                <Globe
                  size={14}
                  className={`shrink-0 ${isCurrent ? 'text-primary' : 'text-on-surface-variant/40'}`}
                />

                {isEditing ? (
                  <input
                    ref={editInputRef}
                    value={editingVariantTitle}
                    onChange={(e) => setEditingVariantTitle(e.target.value)}
                    onBlur={saveEditVariant}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditVariant();
                      if (e.key === 'Escape') cancelEditVariant();
                    }}
                    className="flex-1 min-w-0 bg-transparent text-xs font-black text-on-surface border-b border-primary/40 focus:outline-none focus:border-primary"
                    autoFocus
                  />
                ) : (
                  <button
                    onClick={() => !isCurrent && onSwitchVariant(v.id)}
                    disabled={isCurrent}
                    className={`flex-1 min-w-0 text-left text-xs font-black truncate ${
                      isCurrent
                        ? 'text-primary cursor-default'
                        : 'text-on-surface hover:text-primary cursor-pointer'
                    }`}
                  >
                    {v.variantName || v.title}
                  </button>
                )}

                {!isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditVariant(v);
                    }}
                    className="shrink-0 p-1 rounded-lg text-on-surface-variant/30 hover:text-primary hover:bg-primary/10 transition-all"
                    title="Rename"
                  >
                    <Pencil size={12} />
                  </button>
                )}

                {!isEditing && !v.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        window.confirm(
                          `Delete variant "${v.variantName || v.title}"? This cannot be undone.`
                        )
                      ) {
                        onDeleteVariant(v.id);
                      }
                    }}
                    className="shrink-0 p-1 rounded-lg text-on-surface-variant/30 hover:text-red-500 hover:bg-red-500/10 transition-all"
                    title="Delete variant"
                  >
                    <Trash2 size={12} />
                  </button>
                )}

                {!isEditing &&
                  (v.isDefault ? (
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30">
                      Default
                    </span>
                  ) : isCurrent ? (
                    <span className="shrink-0 text-[9px] font-black uppercase tracking-widest text-primary/60">
                      Current
                    </span>
                  ) : (
                    <button
                      onClick={() => onSwitchVariant(v.id)}
                      className="shrink-0 text-[9px] font-black uppercase tracking-widest text-on-surface-variant/30 hover:text-primary transition-colors"
                    >
                      Open →
                    </button>
                  ))}
              </div>
            );
          })}
        </div>

        {showVariantPicker ? (
          <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <input
              type="text"
              value={selectedVariantLang}
              onChange={(e) => setSelectedVariantLang(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && selectedVariantLang.trim()) handleCreateVariant();
                if (e.key === 'Escape') setShowVariantPicker(false);
              }}
              placeholder="e.g. Hindi, Gujarati..."
              autoFocus
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl px-4 py-3 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-on-surface-variant/30"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateVariant}
                disabled={creatingVariant || !selectedVariantLang.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingVariant ? 'Creating...' : 'Create'}
              </button>
              <button
                onClick={() => {
                  setShowVariantPicker(false);
                  setSelectedVariantLang('');
                }}
                className="px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant/60 text-[11px] font-black uppercase tracking-widest hover:bg-surface-container transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowVariantPicker(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-outline-variant/20 text-on-surface-variant/40 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all text-[11px] font-black uppercase tracking-widest"
          >
            <Plus size={13} strokeWidth={3} />
            Add Variant
          </button>
        )}
      </section>

      <div className="pt-4" />
    </div>
  );
}
