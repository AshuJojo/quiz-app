'use client';

import { Calendar, ChevronDown, Clock, FileText, Layers, Target } from 'lucide-react';

interface PaperSettingsPanelProps {
  description: string;
  examId: string;
  defaultPositiveMarks: number;
  defaultNegativeMarks: number;
  hasSections: boolean;
  duration: number;
  year: number;
  onDescriptionChange: (v: string) => void;
  onExamIdChange: (v: string) => void;
  onDefaultPositiveMarksChange: (v: number) => void;
  onDefaultNegativeMarksChange: (v: number) => void;
  onHasSectionsChange: (v: boolean) => void;
  onDurationChange: (v: number) => void;
  onYearChange: (v: number) => void;
}

export default function PaperSettingsPanel({
  description,
  examId,
  defaultPositiveMarks,
  defaultNegativeMarks,
  hasSections,
  duration,
  year,
  onDescriptionChange,
  onExamIdChange,
  onDefaultPositiveMarksChange,
  onDefaultNegativeMarksChange,
  onHasSectionsChange,
  onDurationChange,
  onYearChange,
}: PaperSettingsPanelProps) {
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
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
              Description (Optional)
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
                <FileText size={16} />
              </div>
              <textarea
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                placeholder="Brief overview of this paper..."
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-4 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
                Exam
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
                  <Target size={16} />
                </div>
                <select
                  value={examId}
                  onChange={(e) => onExamIdChange(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-12 text-sm text-on-background appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option value="">Select Exam</option>
                  <option value="exam-1">JEE Advanced</option>
                  <option value="exam-2">JEE Main</option>
                  <option value="exam-3">NEET</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant/20">
                  <ChevronDown size={14} />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
                Year (Optional)
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
                  <Calendar size={16} />
                </div>
                <input
                  type="number"
                  value={year || ''}
                  onChange={(e) => onYearChange(e.target.value ? Number(e.target.value) : 0)}
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
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

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
            Duration (Optional)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
              <Clock size={16} />
            </div>
            <input
              type="number"
              value={duration || ''}
              onChange={(e) => onDurationChange(e.target.value ? Number(e.target.value) : 0)}
              placeholder="Minutes"
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
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
