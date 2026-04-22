'use client';

import { Option } from '@/components/features/papers/types';
import { OutputData } from '@editorjs/editorjs';
import { Circle, CircleDot, Copy, GripVertical, Plus, Trash2, X } from 'lucide-react';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('@/components/ui/editor'), {
  ssr: false,
  loading: () => <div className="h-20 bg-surface-container-low animate-pulse rounded-2xl" />,
});

interface QuestionWorkspaceProps {
  activeQuestionId: string | null;
  activeQuestionIndex: number;
  activeItemId: string | null;
  questionContent: OutputData;
  options: Option[];
  onActiveItemIdChange: (id: string) => void;
  onQuestionContentChange: (data: OutputData) => void;
  onOptionContentChange: (optId: string, data: any) => void;
  onToggleCorrect: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onAddOption: () => void;
  onDeleteOption: (id: string) => void;
}

export default function QuestionWorkspace({
  activeQuestionId,
  activeQuestionIndex,
  activeItemId,
  questionContent,
  options,
  onActiveItemIdChange,
  onQuestionContentChange,
  onOptionContentChange,
  onToggleCorrect,
  onDeleteQuestion,
  onAddOption,
  onDeleteOption,
}: QuestionWorkspaceProps) {
  return (
    <main className="flex-1 bg-background relative overflow-y-auto p-12 flex flex-col items-center dot-pattern">
      <div className="w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-1000">
        <div
          onClick={() => onActiveItemIdChange('question')}
          className={`bg-surface-container-lowest shadow-ambient rounded-[2rem] p-10 relative transition-all duration-500 group/card ${
            activeItemId === 'question' ? 'z-20 ring-1 ring-primary/10' : 'z-0'
          }`}
        >
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                Single Choice
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
              <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                Question{' '}
                {activeQuestionIndex !== -1
                  ? (activeQuestionIndex + 1).toString().padStart(2, '0')
                  : '--'}
              </span>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
              <button className="p-2.5 text-on-surface-variant/40 hover:text-on-background hover:bg-surface-container transition-all rounded-xl">
                <Copy size={18} />
              </button>
              <button
                onClick={() => activeQuestionId && onDeleteQuestion(activeQuestionId)}
                className="p-2.5 text-on-surface-variant/40 hover:text-error hover:bg-error/5 transition-all rounded-xl"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="mb-6">
            <Editor
              key={activeQuestionId ?? 'empty'}
              data={questionContent}
              onChange={onQuestionContentChange}
              placeholder="Type your question here..."
            />
          </div>

          <div className="space-y-4">
            {options.map((option, index) => (
              <div
                key={option.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onActiveItemIdChange(option.id);
                }}
                className={`group/option flex items-start gap-4 p-5 rounded-[1.5rem] transition-all duration-300 border border-transparent relative ${
                  activeItemId === option.id
                    ? 'bg-surface-container-low z-30 ring-1 ring-primary/5 shadow-sm'
                    : 'bg-surface-container-low/50 hover:bg-surface-container-low z-0 hover:z-10'
                }`}
              >
                <div className="mt-2.5 p-1 cursor-grab active:cursor-grabbing text-on-surface-variant/20 group-hover/option:text-on-surface-variant/40 transition-colors">
                  <GripVertical size={16} />
                </div>

                <button
                  onClick={() => onToggleCorrect(option.id)}
                  className={`mt-2 flex-shrink-0 transition-all duration-500 ${
                    option.isCorrect
                      ? 'text-primary scale-110'
                      : 'text-on-surface-variant/20 hover:text-on-surface-variant/40'
                  }`}
                >
                  {option.isCorrect ? (
                    <CircleDot size={24} strokeWidth={2.5} />
                  ) : (
                    <Circle size={24} strokeWidth={2} />
                  )}
                </button>

                <div className="flex-1 min-h-[40px]">
                  <Editor
                    key={option.id}
                    data={option.content as OutputData}
                    onChange={(data) => onOptionContentChange(option.id, data)}
                    placeholder={`Option ${index + 1}`}
                  />
                </div>

                <div className="mt-2 flex items-center gap-1 opacity-0 group-hover/option:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => onDeleteOption(option.id)}
                    className="p-2 text-on-surface-variant/40 hover:text-error transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={onAddOption}
              className="w-full mt-4 flex items-center gap-3 p-4 rounded-2xl border border-dashed border-outline-variant/30 text-on-surface-variant/40 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all group/add"
            >
              <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center group-hover/add:bg-primary/10 transition-colors">
                <Plus size={14} strokeWidth={3} />
              </div>
              <span className="text-sm font-black uppercase tracking-widest">Add Choice</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
