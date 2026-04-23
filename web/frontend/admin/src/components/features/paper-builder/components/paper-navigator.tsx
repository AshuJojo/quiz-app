'use client';

import { Question, Section } from '@/components/features/papers/types';
import { ChevronDown, ChevronRight, GripVertical, LayoutGrid, Plus, Trash2 } from 'lucide-react';

interface PaperNavigatorProps {
  isLoading: boolean;
  localSections: Section[];
  hasSections: boolean;
  allQuestions: Question[];
  activeQuestionId: string | null;
  collapsedSections: Set<string>;
  editingSectionId: string | null;
  editingSectionTitle: string;
  draggedQuestionId: string | null;
  draggedSectionId: string | null;
  totalQuestionsCount: number;
  onEditingSectionTitleChange: (title: string) => void;
  onSelectQuestion: (q: Question) => void;
  onToggleSection: (id: string) => void;
  onStartEditSection: (e: React.MouseEvent, section: Section) => void;
  onSaveSectionTitle: (id: string) => void;
  onCancelEditSection: () => void;
  onDragStart: (e: React.DragEvent, qId: string) => void;
  onDragStartSection: (e: React.DragEvent, sId: string) => void;
  onDropOnSection: (e: React.DragEvent, sId: string) => void;
  onDropSection: (e: React.DragEvent, tId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onAddSection: () => void;
  onDeleteSection: (id: string) => void;
  onAddQuestion: (sId: string) => void;
}

export default function PaperNavigator({
  isLoading,
  localSections,
  hasSections,
  allQuestions,
  activeQuestionId,
  collapsedSections,
  editingSectionId,
  editingSectionTitle,
  draggedQuestionId,
  draggedSectionId,
  totalQuestionsCount,
  onEditingSectionTitleChange,
  onSelectQuestion,
  onToggleSection,
  onStartEditSection,
  onSaveSectionTitle,
  onCancelEditSection,
  onDragStart,
  onDragStartSection,
  onDropOnSection,
  onDropSection,
  onDragOver,
  onAddSection,
  onDeleteSection,
  onAddQuestion,
}: PaperNavigatorProps) {
  return (
    <aside className="w-80 flex flex-col bg-surface-container-low border-r border-outline-variant/10 overflow-hidden shadow-[inset_-10px_0_30px_-15px_rgba(0,0,0,0.03)]">
      <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar space-y-2">
        {isLoading ? (
          <div className="space-y-4 px-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="h-8 bg-surface-container-high rounded-xl w-3/4 opacity-50" />
                <div className="grid grid-cols-5 gap-2 pl-4">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <div
                      key={j}
                      className="w-8 h-8 rounded-full bg-surface-container-high opacity-30"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : localSections.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-50">
            <div className="w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center text-on-surface-variant/30">
              <LayoutGrid size={24} />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant">
                No Sections Found
              </p>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">
                Start by adding your first question section.
              </p>
            </div>
            <button
              onClick={onAddSection}
              className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
            >
              Create Section
            </button>
          </div>
        ) : hasSections ? (
          localSections.map((section: Section) => (
            <div key={section.id} className="space-y-1">
              <div
                draggable
                onDragStart={(e) => onDragStartSection(e, section.id)}
                onDragOver={onDragOver}
                onDrop={(e) => {
                  if (e.dataTransfer.types.includes('sectionid')) {
                    onDropSection(e, section.id);
                  } else {
                    onDropOnSection(e, section.id);
                  }
                }}
                className={`group relative ${draggedSectionId === section.id ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-0.5">
                  <div className="p-1 cursor-grab active:cursor-grabbing text-on-surface-variant/10 group-hover:text-on-surface-variant/30 transition-colors">
                    <GripVertical size={14} />
                  </div>
                  <button
                    onClick={() => onToggleSection(section.id)}
                    className="flex-1 flex items-center gap-2 p-2 rounded-xl hover:bg-surface-container-high transition-all"
                  >
                    <div className="text-on-surface-variant/40 group-hover:text-on-surface-variant">
                      {collapsedSections.has(section.id) ? (
                        <ChevronRight size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </div>
                    {editingSectionId === section.id ? (
                      <input
                        autoFocus
                        className="bg-surface-container-high border-none outline-none text-[11px] font-black uppercase tracking-widest text-on-background w-full px-1 rounded transition-all focus:ring-1 focus:ring-primary/30"
                        value={editingSectionTitle}
                        onChange={(e) => onEditingSectionTitleChange(e.target.value)}
                        onBlur={() => onSaveSectionTitle(section.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSaveSectionTitle(section.id);
                          if (e.key === 'Escape') onCancelEditSection();
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/70 group-hover:text-on-background truncate flex-1"
                        onClick={(e) => onStartEditSection(e, section)}
                        title="Click to rename"
                      >
                        {section.title}
                      </span>
                    )}
                    <div className="flex-1" />
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-outline-variant/10 text-on-surface-variant/40">
                      {section.questions?.length || 0}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteSection(section.id)}
                    className="p-1.5 opacity-0 group-hover:opacity-100 text-on-surface-variant/40 hover:text-error hover:bg-error/5 rounded-lg transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {!collapsedSections.has(section.id) && (
                <div
                  onDragOver={onDragOver}
                  onDrop={(e) => onDropOnSection(e, section.id)}
                  className="pl-6 pr-2 pt-2 grid grid-cols-5 gap-y-3 gap-x-2 animate-in slide-in-from-left-2 duration-300 min-h-[10px]"
                >
                  {section.questions?.map((q: Question) => (
                    <div
                      key={q.id}
                      draggable
                      onDragStart={(e) => onDragStart(e, q.id)}
                      className={`transition-opacity ${draggedQuestionId === q.id ? 'opacity-40' : ''}`}
                    >
                      <button
                        onClick={() => onSelectQuestion(q)}
                        title={(
                          (q.question as any)?.blocks?.[0]?.data?.text || 'Empty Question'
                        ).replace(/<[^>]*>/g, '')}
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black transition-all border-2 ${
                          activeQuestionId === q.id
                            ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105'
                            : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant/40 hover:border-primary/40 hover:text-on-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        {allQuestions.findIndex((allQ) => allQ.id === q.id) + 1}
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => onAddQuestion(section.id)}
                    className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-dashed border-outline-variant/40 text-on-surface-variant/30 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
                  >
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 p-2 px-4 group">
              <span className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/70 group-hover:text-on-background transition-colors">
                Questions
              </span>
            </div>

            <div className="pl-6 pr-2 pt-2 grid grid-cols-5 gap-y-4 gap-x-2">
              {allQuestions.map((q: Question, idx: number) => (
                <div
                  key={q.id}
                  draggable
                  onDragStart={(e) => onDragStart(e, q.id)}
                  className={`transition-opacity ${draggedQuestionId === q.id ? 'opacity-40' : ''}`}
                >
                  <button
                    onClick={() => onSelectQuestion(q)}
                    title={(
                      (q.question as any)?.blocks?.[0]?.data?.text || 'Empty Question'
                    ).replace(/<[^>]*>/g, '')}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-black transition-all border-2 ${
                      activeQuestionId === q.id
                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-105'
                        : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant/40 hover:border-primary/40 hover:text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {idx + 1}
                  </button>
                </div>
              ))}

              <button
                onClick={() => onAddQuestion(localSections[0]?.id)}
                className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-dashed border-outline-variant/40 text-on-surface-variant/30 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all"
              >
                <Plus size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        )}

        {!isLoading && localSections.length > 0 && hasSections && (
          <button
            onClick={onAddSection}
            className="mt-4 mb-4 flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-outline-variant/20 text-on-surface-variant/40 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all text-[11px] font-black uppercase tracking-widest group"
          >
            <Plus
              size={18}
              strokeWidth={3}
              className="group-hover:scale-110 transition-transform"
            />
            Add New Section
          </button>
        )}
      </div>

      <div className="p-6 bg-surface-container border-t border-outline-variant/10">
        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
          <span>Total Questions</span>
          <span className="text-on-background">{totalQuestionsCount}</span>
        </div>
      </div>
    </aside>
  );
}
