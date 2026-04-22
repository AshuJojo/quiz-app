'use client';

import { AlertCircle, CheckCircle2, MessageSquare } from 'lucide-react';

interface QuizSettingsPanelProps {
  explanation: string;
  positiveMarks: number | null;
  negativeMarks: number | null;
  onExplanationChange: (v: string) => void;
  onPositiveMarksChange: (v: number | null) => void;
  onNegativeMarksChange: (v: number | null) => void;
}

export default function QuizSettingsPanel({
  explanation,
  positiveMarks,
  negativeMarks,
  onExplanationChange,
  onPositiveMarksChange,
  onNegativeMarksChange,
}: QuizSettingsPanelProps) {
  return (
    <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">
            Solution & Explanation
          </h3>
        </div>

        <div className="space-y-1.5">
          <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
            Explanation (Optional)
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
              <MessageSquare size={16} />
            </div>
            <textarea
              value={explanation}
              onChange={(e) => onExplanationChange(e.target.value)}
              placeholder="Explain the correct answer logic..."
              rows={6}
              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none custom-scrollbar"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1 h-4 bg-primary rounded-full" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant/80">
            Individual Scoring
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
              + Marks
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
                <CheckCircle2 size={16} />
              </div>
              <input
                type="number"
                value={positiveMarks ?? ''}
                onChange={(e) =>
                  onPositiveMarksChange(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Default"
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[9px] font-black uppercase tracking-wider text-on-surface-variant/40 ml-1">
              - Marks
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/30 group-focus-within:text-primary transition-colors">
                <AlertCircle size={16} />
              </div>
              <input
                type="number"
                value={negativeMarks ?? ''}
                onChange={(e) =>
                  onNegativeMarksChange(e.target.value ? Number(e.target.value) : null)
                }
                placeholder="Default"
                className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-2xl p-3.5 pl-12 text-sm text-on-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>
        </div>
        <p className="text-[9px] text-on-surface-variant/40 italic px-1">
          * Leave empty to inherit the paper&apos;s default values.
        </p>
      </section>

      <div className="pt-4" />
    </div>
  );
}
