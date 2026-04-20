'use client';

import { paperService } from '@/services/paper-service';
import { questionService } from '@/services/question-service';
import { sectionService } from '@/services/section-service';
import { Option, Question, Section } from '@/types/paper';
import { OutputData } from '@editorjs/editorjs';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronRight,
  Circle,
  CircleDot,
  Copy,
  GripVertical,
  LayoutGrid,
  Plus,
  Rocket,
  Settings2,
  Trash2,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const Editor = dynamic(() => import('@/components/shared/editor'), {
  ssr: false,
  loading: () => <div className="h-20 bg-surface-container-low animate-pulse rounded-2xl" />,
});

// Helper for robust ID generation in non-secure contexts
const generateId = () => {
  try {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch (e) {
    console.warn('crypto.randomUUID not available, falling back to Math.random');
  }
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export default function PaperBuilderPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const queryClient = useQueryClient();

  const {
    data: paperResult,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperService.getPaper(id),
  });

  const paper = paperResult?.data;
  const initialSections = paper?.sections || [];

  // Local state for batch saving
  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Set<string>>(new Set());
  const [deletedSectionIds, setDeletedSectionIds] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);

  // Workspace internal state (for the editor/options currently being edited)
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [questionContent, setQuestionContent] = useState<OutputData>({ blocks: [] });
  const [options, setOptions] = useState<Option[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');

  // Initialize localSections and handle empty paper state
  useEffect(() => {
    if (isSuccess && initialSections && localSections.length === 0) {
      const allQuestionsCount = initialSections.reduce(
        (acc, s) => acc + (s.questions?.length || 0),
        0
      );

      if (allQuestionsCount === 0) {
        // Create uncategorized and first question if empty
        const sectionId = initialSections[0]?.id || generateId();
        const sectionTitle = initialSections[0]?.title || 'Uncategorized';
        const questionId = `temp-${generateId()}`;

        const newQuestion: Question = {
          id: questionId,
          sectionId,
          paperId: id,
          content: { blocks: [{ type: 'paragraph', data: { text: '' } }] },
          options: [
            { id: generateId(), content: { blocks: [] }, isCorrect: true },
            { id: generateId(), content: { blocks: [] }, isCorrect: false },
          ],
          order: 0,
          type: 'SINGLE_CHOICE',
        };

        const updatedSections: Section[] =
          initialSections.length === 0
            ? [
                {
                  id: sectionId,
                  paperId: id,
                  title: sectionTitle,
                  questions: [newQuestion],
                  order: 0,
                  isDefault: true,
                },
              ]
            : initialSections.map((s, i) => (i === 0 ? { ...s, questions: [newQuestion] } : s));

        setLocalSections(updatedSections);
        setActiveQuestionId(questionId);
        setQuestionContent(newQuestion.content);
        setOptions(newQuestion.options);
      } else {
        setLocalSections(initialSections);
      }
    }
  }, [isSuccess, initialSections, id, localSections.length]);

  // Sync active question workspace changes back to localSections
  useEffect(() => {
    if (activeQuestionId && localSections.length > 0) {
      setLocalSections((prev) =>
        prev.map((section) => ({
          ...section,
          questions:
            section.questions?.map((q) =>
              q.id === activeQuestionId ? { ...q, content: questionContent, options } : q
            ) || [],
        }))
      );
      setIsDirty(true);
    }
  }, [questionContent, options, activeQuestionId]);

  const allQuestions = useMemo(
    () => localSections.flatMap((s) => s.questions || []),
    [localSections]
  );

  const activeQuestionIndex = useMemo(
    () => allQuestions.findIndex((q) => q.id === activeQuestionId),
    [allQuestions, activeQuestionId]
  );

  const activeQuestion = useMemo(
    () => allQuestions[activeQuestionIndex],
    [allQuestions, activeQuestionIndex]
  );

  // Initialize first question as active
  useEffect(() => {
    if (localSections.length > 0 && !activeQuestionId) {
      const firstSection = localSections[0];
      if (firstSection.questions && firstSection.questions.length > 0) {
        const firstQ = firstSection.questions[0];
        setActiveQuestionId(firstQ.id);
        setQuestionContent(firstQ.content);
        setOptions(firstQ.options);
        setIsDirty(false); // Reset dirty on initial load
      }
    }
  }, [localSections, activeQuestionId]);

  // Handle question selection
  const handleSelectQuestion = (q: Question) => {
    setActiveQuestionId(q.id);
    setQuestionContent(q.content);
    setOptions(q.options);
  };

  const toggleSection = (sectionId: string) => {
    if (editingSectionId === sectionId) return; // Don't toggle while editing
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const handleStartEditSection = (e: React.MouseEvent, section: Section) => {
    e.stopPropagation();
    setEditingSectionId(section.id);
    setEditingSectionTitle(section.title);
  };

  const handleSaveSectionTitle = (sectionId: string) => {
    if (
      editingSectionTitle.trim() &&
      editingSectionTitle !== localSections.find((s) => s.id === sectionId)?.title
    ) {
      setLocalSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, title: editingSectionTitle.trim() } : s))
      );
      setIsDirty(true);
    }
    setEditingSectionId(null);
  };

  const handleDragStart = (e: React.DragEvent, qId: string) => {
    setDraggedQuestionId(qId);
    e.dataTransfer.setData('questionId', qId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropOnSection = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const qId = e.dataTransfer.getData('questionId');
    if (qId) {
      setLocalSections((prev) => {
        // Find the question and its source section
        let questionToMove: Question | undefined;
        const nextSections = prev.map((section) => {
          const qIdx = section.questions?.findIndex((q) => q.id === qId);
          if (qIdx !== undefined && qIdx !== -1) {
            questionToMove = section.questions![qIdx];
            return {
              ...section,
              questions: section.questions!.filter((q) => q.id !== qId),
            };
          }
          return section;
        });

        // Add to target section
        if (questionToMove) {
          setIsDirty(true);
          return nextSections.map((section) => {
            if (section.id === sectionId) {
              return {
                ...section,
                questions: [...(section.questions || []), { ...questionToMove!, sectionId }],
              };
            }
            return section;
          });
        }
        return prev;
      });
    }
    setDraggedQuestionId(null);
  };

  const handleDragStartSection = (e: React.DragEvent, sectionId: string) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.setData('sectionId', sectionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDropSection = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    const sourceSectionId = e.dataTransfer.getData('sectionId');
    if (sourceSectionId && sourceSectionId !== targetSectionId) {
      setLocalSections((prev) => {
        const sourceIdx = prev.findIndex((s) => s.id === sourceSectionId);
        const targetIdx = prev.findIndex((s) => s.id === targetSectionId);
        if (sourceIdx !== -1 && targetIdx !== -1) {
          const next = [...prev];
          const [movedSection] = next.splice(sourceIdx, 1);
          next.splice(targetIdx, 0, movedSection);
          setIsDirty(true);
          return next;
        }
        return prev;
      });
    }
    setDraggedSectionId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleToggleCorrect = (id: string) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isCorrect: opt.id === id,
      }))
    );
  };

  const handleSave = async () => {
    if (!isDirty || isSaving) return;
    setIsSaving(true);

    try {
      const allQuestions = localSections.flatMap((s) => s.questions || []);

      const questionUpdates = allQuestions
        .filter((q) => !q.id.startsWith('temp-'))
        .map((q, idx) => ({
          id: q.id,
          content: q.content,
          options: q.options,
          sectionId: q.sectionId,
          order: idx,
        }));

      const newQuestions = allQuestions
        .filter((q) => q.id.startsWith('temp-'))
        .map((q, idx) => ({
          content: q.content,
          options: q.options,
          sectionId: q.sectionId,
          paperId: id,
          order: idx,
        }));

      const promises = [];

      if (questionUpdates.length > 0) {
        promises.push(questionService.updateQuestions(questionUpdates));
      }

      if (newQuestions.length > 0) {
        promises.push(questionService.createQuestions(newQuestions));
      }

      if (deletedQuestionIds.size > 0) {
        promises.push(questionService.deleteQuestions(Array.from(deletedQuestionIds)));
      }

      // Handle sections
      const sectionUpdates = localSections
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => !s.id.startsWith('temp-'))
        .map(({ s, idx }) => ({
          id: s.id,
          title: s.title,
          order: idx,
          positiveMarks: s.positiveMarks,
          negativeMarks: s.negativeMarks,
        }));

      const newSections = localSections
        .map((s, idx) => ({ s, idx }))
        .filter(({ s }) => s.id.startsWith('temp-'))
        .map(({ s, idx }) => ({
          title: s.title,
          paperId: id,
          order: idx,
          positiveMarks: s.positiveMarks,
          negativeMarks: s.negativeMarks,
        }));

      if (sectionUpdates.length > 0) {
        promises.push(sectionService.updateSections(sectionUpdates));
      }

      if (newSections.length > 0) {
        promises.push(sectionService.createSections(newSections));
      }

      if (deletedSectionIds.size > 0) {
        promises.push(sectionService.deleteSections(Array.from(deletedSectionIds)));
      }

      await Promise.all(promises);

      toast.success('Paper saved successfully');
      setIsDirty(false);
      setDeletedQuestionIds(new Set());
      setDeletedSectionIds(new Set());

      queryClient.invalidateQueries({ queryKey: ['paper', id] });
    } catch (error) {
      console.error('Failed to save paper:', error);
      toast.error('Failed to save paper changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSection = () => {
    const newSection: Section = {
      id: `temp-${generateId()}`,
      title: 'New Section',
      order: localSections.length,
      paperId: id,
      isDefault: false,
      questions: [],
    };
    setLocalSections([...localSections, newSection]);
    setIsDirty(true);
  };

  const handleDeleteSection = (sectionId: string) => {
    const section = localSections.find((s) => s.id === sectionId);

    // Prevent deleting the last section
    if (localSections.length <= 1) {
      toast.error('Cannot delete the last section');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete "${section?.title || 'this section'}" and all its questions? This action cannot be undone after saving.`
      )
    ) {
      return;
    }

    if (!sectionId.startsWith('temp-')) {
      setDeletedSectionIds((prev) => new Set(prev).add(sectionId));
    }

    setLocalSections((prev) => {
      const next = prev.filter((s) => s.id !== sectionId);
      setIsDirty(true);
      return next;
    });

    // If active question was in this section, clear it
    const containsActiveQ = section?.questions?.some((q) => q.id === activeQuestionId);
    if (containsActiveQ) {
      setActiveQuestionId(null);
    }
  };

  const handleAddQuestion = (sectionId: string) => {
    const newQuestion: Question = {
      id: `temp-${generateId()}`,
      sectionId,
      paperId: id,
      content: { blocks: [{ type: 'paragraph', data: { text: '' } }] },
      options: [
        { id: generateId(), content: { blocks: [] }, isCorrect: true },
        { id: generateId(), content: { blocks: [] }, isCorrect: false },
      ],
      order: 0,
      type: 'SINGLE_CHOICE',
    };

    setLocalSections((prev) =>
      prev.map((s) =>
        s.id === sectionId ? { ...s, questions: [...(s.questions || []), newQuestion] } : s
      )
    );
    setActiveQuestionId(newQuestion.id);
  };

  const handleDeleteQuestion = (qId: string) => {
    if (!qId.startsWith('temp-')) {
      setDeletedQuestionIds((prev) => new Set(prev).add(qId));
    }
    setLocalSections((prev) =>
      prev.map((s) => ({
        ...s,
        questions: s.questions?.filter((q) => q.id !== qId) || [],
      }))
    );
    if (activeQuestionId === qId) {
      setActiveQuestionId(null);
    }
  };

  const handleAddOption = () => {
    const newOption: Option = {
      id: generateId(),
      content: { blocks: [] },
      isCorrect: false,
    };
    setOptions((prev) => [...prev, newOption]);
  };

  const handleDeleteOption = (optId: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== optId));
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
          <button
            onClick={handleSave}
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
          <div className="flex-1 flex flex-col p-4 overflow-y-auto custom-scrollbar space-y-2">
            {isLoading ? (
              // Loading Skeleton
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
              // Empty State
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
                  onClick={handleAddSection}
                  className="px-4 py-2 rounded-xl bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/20 transition-all"
                >
                  Create Section
                </button>
              </div>
            ) : (
              localSections.map((section: Section) => (
                <div key={section.id} className="space-y-1">
                  {/* Section Header */}
                  <div
                    draggable
                    onDragStart={(e) => handleDragStartSection(e, section.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => {
                      if (e.dataTransfer.types.includes('sectionid')) {
                        handleDropSection(e, section.id);
                      } else {
                        handleDropOnSection(e, section.id);
                      }
                    }}
                    className={`group relative ${draggedSectionId === section.id ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center gap-0.5">
                      <div className="p-1 cursor-grab active:cursor-grabbing text-on-surface-variant/10 group-hover:text-on-surface-variant/30 transition-colors">
                        <GripVertical size={14} />
                      </div>
                      <button
                        onClick={() => toggleSection(section.id)}
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
                            onChange={(e) => setEditingSectionTitle(e.target.value)}
                            onBlur={() => handleSaveSectionTitle(section.id)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveSectionTitle(section.id);
                              if (e.key === 'Escape') setEditingSectionId(null);
                            }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        ) : (
                          <span
                            className="text-[11px] font-black uppercase tracking-widest text-on-surface-variant/70 group-hover:text-on-background truncate flex-1"
                            onClick={(e) => handleStartEditSection(e, section)}
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
                        onClick={() => handleDeleteSection(section.id)}
                        className="p-1.5 opacity-0 group-hover:opacity-100 text-on-surface-variant/40 hover:text-error hover:bg-error/5 rounded-lg transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Section Questions */}
                  {!collapsedSections.has(section.id) && (
                    <div
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDropOnSection(e, section.id)}
                      className="pl-6 pr-2 pt-2 grid grid-cols-5 gap-y-3 gap-x-2 animate-in slide-in-from-left-2 duration-300 min-h-[10px]"
                    >
                      {section.questions?.map((q: Question, idx: number) => (
                        <div
                          key={q.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, q.id)}
                          className={`transition-opacity ${draggedQuestionId === q.id ? 'opacity-40' : ''}`}
                        >
                          <button
                            onClick={() => handleSelectQuestion(q)}
                            title={(
                              (q.content as any)?.blocks?.[0]?.data?.text || 'Empty Question'
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

                      {/* Add Question to Section */}
                      <button
                        onClick={() => handleAddQuestion(section.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center border-2 border-dashed border-outline-variant/40 text-on-surface-variant/30 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all group/addQ"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

            {!isLoading && localSections.length > 0 && (
              <button
                onClick={handleAddSection}
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

          {/* Navigator Footer Info */}
          <div className="p-6 bg-surface-container border-t border-outline-variant/10">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-on-surface-variant/40">
              <span>Total Questions</span>
              <span className="text-on-background">{paper?._count?.questions || 0}</span>
            </div>
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
                    onClick={() => handleDeleteQuestion(activeQuestionId!)}
                    className="p-2.5 text-on-surface-variant/40 hover:text-error hover:bg-error/5 transition-all rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Question Text Area (Editor.js) */}
              <div className="mb-6">
                <Editor
                  key={activeQuestionId}
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
                        key={option.id}
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
                      <button
                        onClick={() => handleDeleteOption(option.id)}
                        className="p-2 text-on-surface-variant/40 hover:text-error transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add Option Trigger */}
                <button
                  onClick={handleAddOption}
                  className="w-full mt-4 flex items-center gap-3 p-4 rounded-2xl border border-dashed border-outline-variant/30 text-on-surface-variant/40 hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all group/add"
                >
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
