'use client';

import { paperService } from '@/services/paper-service';
import { OutputData } from '@editorjs/editorjs';
import { useQuery } from '@tanstack/react-query';
import {
  Circle,
  CircleDot,
  Copy,
  Eye,
  GripVertical,
  Plus,
  Rocket,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

const Editor = dynamic(() => import('@/components/shared/editor'), {
  ssr: false,
  loading: () => <div className="h-20 bg-surface-container-low animate-pulse rounded-2xl" />,
});

export default function PaperBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: paperResult, isLoading } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperService.getPaper(id),
  });

  const paper = paperResult?.data;

  // Track the active item for stacking context (z-index)
  const [activeItemId, setActiveItemId] = useState<string | null>('question');

  // Mock state for the UI with Editor.js data structure
  const [questionContent, setQuestionContent] = useState<OutputData>({
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: "What is the primary method used to define boundaries in the 'Tactile Atelier' design system?",
        },
      },
    ],
  });

  const [options, setOptions] = useState([
    {
      id: '1',
      content: {
        blocks: [
          { type: 'paragraph', data: { text: 'Stark contrast through geometric alignment' } },
        ],
      },
      isCorrect: true,
    },
    {
      id: '2',
      content: {
        blocks: [{ type: 'paragraph', data: { text: 'Fluidity achieved through tonal shifting' } }],
      },
      isCorrect: false,
    },
    {
      id: '3',
      content: {
        blocks: [{ type: 'paragraph', data: { text: 'Strict adherence to 1px mechanical grids' } }],
      },
      isCorrect: false,
    },
    {
      id: '4',
      content: {
        blocks: [{ type: 'paragraph', data: { text: 'High-contrast decorative borders' } }],
      },
      isCorrect: false,
    },
  ]);

  const handleToggleCorrect = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      }))
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden animate-in fade-in duration-700">
      {/* --- TOP HEADER --- */}
      <header className="h-16 flex items-center justify-between px-6 bg-surface-container-lowest/80 backdrop-blur-2xl border-b border-outline-variant/10 z-50">
        <div className="flex items-center gap-6">
          <button
            onClick={() => router.push('/papers')}
            className="flex items-center gap-2 text-on-surface-variant hover:text-on-background transition-colors group"
          >
            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          </button>
          <div className="w-[1px] h-6 bg-outline-variant/20" />
          <h1 className="text-sm font-black text-on-background tracking-tight truncate max-w-[200px]">
            {isLoading ? 'Loading...' : paper?.title || 'Untitled Paper'}
          </h1>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-low transition-all text-xs font-black uppercase tracking-widest select-none">
            <Eye size={16} />
            Preview
          </button>
          <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all select-none">
            <Rocket size={16} strokeWidth={3} />
            Publish
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT SIDEBAR: NAVIGATOR */}
        <aside className="w-80 flex flex-col bg-surface-container-low border-r border-outline-variant/10 overflow-hidden shadow-[inset_-10px_0_30px_-15px_rgba(0,0,0,0.03)]">
          <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
            <div className="flex-1" />
          </div>

          {/* Blocks Navigator (Recessed Bottom) */}
          <div className="h-48 bg-surface-container p-6 border-t border-outline-variant/10">
            <div className="flex-1" />
          </div>
        </aside>

        {/* CENTER WORKSPACE: CANVAS */}
        <main className="flex-1 bg-background relative overflow-y-auto p-12 flex flex-col items-center dot-pattern">
          {/* Workspace Canvas */}
          <div className="w-full max-w-3xl animate-in slide-in-from-bottom-4 duration-1000">
            {/* Question Card */}
            <div
              onClick={() => setActiveItemId('question')}
              className={`bg-surface-container-lowest shadow-ambient rounded-[2rem] p-10 relative transition-all duration-500 group/card ${activeItemId === 'question' ? 'z-20 ring-1 ring-primary/10' : 'z-0'}`}
            >
              {/* Question Header */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                    Single Choice
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
                  <span className="text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em]">
                    Question 01
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                  <button className="p-2.5 text-on-surface-variant/40 hover:text-on-background hover:bg-surface-container transition-all rounded-xl">
                    <Copy size={18} />
                  </button>
                  <button className="p-2.5 text-on-surface-variant/40 hover:text-error hover:bg-error/5 transition-all rounded-xl">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Question Text Area (Editor.js) */}
              <div className="mb-12 min-h-[100px]">
                <Editor
                  data={questionContent}
                  onChange={setQuestionContent}
                  placeholder="Type your question here..."
                />
              </div>

              {/* Options List */}
              <div className="space-y-4">
                {options.map((option, index) => (
                  <div
                    key={option.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveItemId(option.id);
                    }}
                    className={`group/option flex items-start gap-4 p-5 rounded-[1.5rem] transition-all duration-300 border border-transparent 
                      ${
                        activeItemId === option.id
                          ? 'bg-surface-container-low z-30 ring-1 ring-primary/5 shadow-sm'
                          : 'bg-surface-container-low/50 hover:bg-surface-container-low z-0 hover:z-10'
                      } relative`}
                  >
                    <div className="mt-2.5 p-1 cursor-grab active:cursor-grabbing text-on-surface-variant/20 group-hover/option:text-on-surface-variant/40 transition-colors">
                      <GripVertical size={16} />
                    </div>

                    <button
                      onClick={() => handleToggleCorrect(option.id)}
                      className={`mt-2 flex-shrink-0 transition-all duration-500 ${option.isCorrect ? 'text-primary scale-110' : 'text-on-surface-variant/20 hover:text-on-surface-variant/40'}`}
                    >
                      {option.isCorrect ? (
                        <CircleDot size={24} strokeWidth={2.5} />
                      ) : (
                        <Circle size={24} strokeWidth={2} />
                      )}
                    </button>

                    <div className="flex-1 min-h-[40px]">
                      <Editor
                        data={option.content as OutputData}
                        onChange={(data) => {
                          setOptions((prev) =>
                            prev.map((opt) =>
                              opt.id === option.id ? { ...opt, content: data } : opt
                            )
                          );
                        }}
                        placeholder={`Option ${index + 1}`}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-1 opacity-0 group-hover/option:opacity-100 transition-all duration-300">
                      <button className="p-2 text-on-surface-variant/40 hover:text-error transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Option Trigger */}
                <button className="w-full mt-4 flex items-center gap-3 p-4 rounded-2xl border border-dashed border-outline-variant/30 text-on-surface-variant/40 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all group/add">
                  <div className="w-6 h-6 rounded-lg bg-surface-container flex items-center justify-center group-hover/add:bg-primary/10 transition-colors">
                    <Plus size={14} strokeWidth={3} />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">Add Choice</span>
                </button>
              </div>
            </div>

            {/* Bottom Floating Control Bar */}
            <div className="mt-8 flex items-center justify-between px-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">
                    Points
                  </span>
                  <input
                    type="number"
                    defaultValue={1}
                    className="w-12 h-10 bg-surface-container-low border border-outline-variant/10 rounded-xl text-center text-sm font-black text-on-background focus:outline-none focus:border-primary/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-on-surface-variant/60 hover:text-on-background hover:bg-surface-container-low transition-all text-[10px] font-black uppercase tracking-widest">
                  <Settings2 size={16} />
                  Advanced
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR: PROPERTIES */}
        <aside className="w-80 flex flex-col bg-background border-l border-outline-variant/10 overflow-hidden shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.02)]">
          {/* Settings Tabs */}

          <div className="flex-1" />
        </aside>
      </div>
    </div>
  );
}
