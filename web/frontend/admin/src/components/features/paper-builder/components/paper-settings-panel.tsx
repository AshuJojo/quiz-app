'use client';

import {
  HierarchicalSelect,
  TreeItem,
} from '@/components/ui/hierarchical-select/hierarchical-select';
import { Calendar, Layers, Target } from 'lucide-react';

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
  onDescriptionChange: (v: string) => void;
  onExamIdChange: (v: string) => void;
  onFetchChildren: (parentId: string) => Promise<any[]>;
  onDefaultPositiveMarksChange: (v: number) => void;
  onDefaultNegativeMarksChange: (v: number) => void;
  onHasSectionsChange: (v: boolean) => void;
  onDurationChange: (v: number) => void;
  onPaperDateChange: (v: Date | null) => void;
  onHasPaperDateChange: (v: boolean) => void;
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
  onDescriptionChange,
  onExamIdChange,
  onFetchChildren,
  onDefaultPositiveMarksChange,
  onDefaultNegativeMarksChange,
  onHasSectionsChange,
  onDurationChange,
  onPaperDateChange,
  onHasPaperDateChange,
}: PaperSettingsPanelProps) {
  const treeItems: TreeItem[] = exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    hasChildren: exam._count?.children > 0,
  }));

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

      <div className="pt-4" />
    </div>
  );
}
