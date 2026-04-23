'use client';

import { paperService, questionService, sectionService } from '../services';
import { Option, Paper, Question, Section } from '@/components/features/papers/types';
import { OutputData } from '@editorjs/editorjs';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const generateId = () => {
  try {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch {}
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

export function usePaperBuilder(paperId: string, paper: Paper | undefined, isSuccess: boolean) {
  const queryClient = useQueryClient();
  const initialSections = paper?.sections || [];

  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Set<string>>(new Set());
  const [deletedSectionIds, setDeletedSectionIds] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null);
  const [draggedSectionId, setDraggedSectionId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');

  const [paperDescription, setPaperDescription] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [defaultPositiveMarks, setDefaultPositiveMarks] = useState(1);
  const [defaultNegativeMarks, setDefaultNegativeMarks] = useState(0);
  const [hasSections, setHasSections] = useState(true);
  const [paperDuration, setPaperDuration] = useState(0);
  const [paperDate, setPaperDate] = useState<Date | null>(new Date());
  const [hasPaperDate, setHasPaperDate] = useState(false);

  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [questionContent, setQuestionContent] = useState<OutputData>({ blocks: [] });
  const [options, setOptions] = useState<Option[]>([]);

  const [questionExplanation, setQuestionExplanation] = useState('');
  const [questionPositiveMarks, setQuestionPositiveMarks] = useState<number | null>(null);
  const [questionNegativeMarks, setQuestionNegativeMarks] = useState<number | null>(null);

  useEffect(() => {
    if (paper) {
      setPaperDescription(paper.description || '');
      setSelectedExamId(paper.examId || '');
      setDefaultPositiveMarks(paper.positiveMarks ?? 1);
      setDefaultNegativeMarks(paper.negativeMarks ?? 0);
      setHasSections(paper.hasSections ?? true);
      setPaperDuration(paper.duration ?? 0);
      setPaperDate(paper.paperDate ? new Date(paper.paperDate) : new Date());
      setHasPaperDate(!!paper.paperDate);
    }
  }, [paper]);

  useEffect(() => {
    if (isSuccess && initialSections && localSections.length === 0) {
      const totalQuestionsCount = initialSections.reduce(
        (acc: number, s: Section) => acc + (s.questions?.length || 0),
        0
      );

      if (totalQuestionsCount === 0) {
        const sectionId = initialSections[0]?.id || generateId();
        const sectionTitle = initialSections[0]?.title || 'Uncategorized';
        const questionId = `temp-${generateId()}`;

        const newQuestion: Question = {
          id: questionId,
          sectionId,
          paperId,
          question: { blocks: [{ type: 'paragraph', data: { text: '' } }] },
          options: [
            { id: generateId(), content: { blocks: [] }, isCorrect: true },
            { id: generateId(), content: { blocks: [] }, isCorrect: false },
            { id: generateId(), content: { blocks: [] }, isCorrect: false },
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
                  paperId,
                  title: sectionTitle,
                  questions: [newQuestion],
                  order: 0,
                  isDefault: true,
                },
              ]
            : initialSections.map((s: Section, i: number) =>
                i === 0 ? { ...s, questions: [newQuestion] } : s
              );

        setLocalSections(updatedSections);
        setActiveQuestionId(questionId);
        setQuestionContent(newQuestion.question);
        setOptions(newQuestion.options);
      } else {
        setLocalSections(initialSections);
      }
    }
  }, [isSuccess, initialSections, paperId, localSections.length]);

  useEffect(() => {
    if (activeQuestionId && localSections.length > 0) {
      setLocalSections((prev) =>
        prev.map((section) => ({
          ...section,
          questions:
            section.questions?.map((q) =>
              q.id === activeQuestionId
                ? {
                    ...q,
                    question: questionContent,
                    options,
                    explanation: questionExplanation,
                    positiveMarks: questionPositiveMarks,
                    negativeMarks: questionNegativeMarks,
                  }
                : q
            ) || [],
        }))
      );
      setIsDirty(true);
    }
  }, [
    questionContent,
    options,
    activeQuestionId,
    questionExplanation,
    questionPositiveMarks,
    questionNegativeMarks,
  ]);

  const allQuestions = useMemo(
    () => localSections.flatMap((s) => s.questions || []),
    [localSections]
  );

  useEffect(() => {
    if (localSections.length > 0 && !activeQuestionId) {
      const firstQ = localSections[0]?.questions?.[0];
      if (firstQ) {
        setActiveQuestionId(firstQ.id);
        setQuestionContent(firstQ.question);
        setOptions(firstQ.options);
        setIsDirty(false);
      }
    }
  }, [localSections, activeQuestionId]);

  useEffect(() => {
    if (activeQuestionId) {
      const q = allQuestions.find((q) => q.id === activeQuestionId);
      if (q) {
        setQuestionExplanation(q.explanation || '');
        setQuestionPositiveMarks(q.positiveMarks ?? null);
        setQuestionNegativeMarks(q.negativeMarks ?? null);
      }
    }
  }, [activeQuestionId, allQuestions]);

  // Dirty state for global paper fields
  useEffect(() => {
    if (paper) {
      const isPaperDirty =
        paperDescription !== (paper.description || '') ||
        selectedExamId !== (paper.examId || '') ||
        defaultPositiveMarks !== (paper.positiveMarks ?? 1) ||
        defaultNegativeMarks !== (paper.negativeMarks ?? 0) ||
        hasSections !== (paper.hasSections ?? true) ||
        paperDuration !== (paper.duration ?? 0) ||
        hasPaperDate !== !!paper.paperDate ||
        (hasPaperDate &&
          (paperDate?.toISOString() || '') !==
            (paper.paperDate ? new Date(paper.paperDate).toISOString() : ''));

      if (isPaperDirty) setIsDirty(true);
    }
  }, [
    paper,
    paperDescription,
    selectedExamId,
    defaultPositiveMarks,
    defaultNegativeMarks,
    hasSections,
    paperDuration,
    paperDate,
    hasPaperDate,
  ]);

  const activeQuestionIndex = useMemo(
    () => allQuestions.findIndex((q) => q.id === activeQuestionId),
    [allQuestions, activeQuestionId]
  );

  const activeQuestion = useMemo(
    () => allQuestions[activeQuestionIndex],
    [allQuestions, activeQuestionIndex]
  );

  const handleSelectQuestion = useCallback((q: Question) => {
    setActiveQuestionId(q.id);
    setQuestionContent(q.question);
    setOptions(q.options);
  }, []);

  const toggleSection = useCallback(
    (sectionId: string) => {
      if (editingSectionId === sectionId) return;
      setCollapsedSections((prev) => {
        const next = new Set(prev);
        if (next.has(sectionId)) next.delete(sectionId);
        else next.add(sectionId);
        return next;
      });
    },
    [editingSectionId]
  );

  const handleStartEditSection = useCallback((e: React.MouseEvent, section: Section) => {
    e.stopPropagation();
    setEditingSectionId(section.id);
    setEditingSectionTitle(section.title);
  }, []);

  const handleSaveSectionTitle = useCallback(
    (sectionId: string) => {
      const currentTitle = localSections.find((s) => s.id === sectionId)?.title;
      if (editingSectionTitle.trim() && editingSectionTitle !== currentTitle) {
        setLocalSections((prev) =>
          prev.map((s) => (s.id === sectionId ? { ...s, title: editingSectionTitle.trim() } : s))
        );
        setIsDirty(true);
      }
      setEditingSectionId(null);
    },
    [editingSectionTitle, localSections]
  );

  const cancelEditSection = useCallback(() => setEditingSectionId(null), []);

  const handleDragStart = useCallback((e: React.DragEvent, qId: string) => {
    setDraggedQuestionId(qId);
    e.dataTransfer.setData('questionId', qId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDropOnSection = useCallback((e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const qId = e.dataTransfer.getData('questionId');
    if (qId) {
      setLocalSections((prev) => {
        let questionToMove: Question | undefined;
        const nextSections = prev.map((section) => {
          const qIdx = section.questions?.findIndex((q) => q.id === qId);
          if (qIdx !== undefined && qIdx !== -1) {
            questionToMove = section.questions![qIdx];
            return { ...section, questions: section.questions!.filter((q) => q.id !== qId) };
          }
          return section;
        });
        if (questionToMove) {
          setIsDirty(true);
          return nextSections.map((section) =>
            section.id === sectionId
              ? {
                  ...section,
                  questions: [...(section.questions || []), { ...questionToMove!, sectionId }],
                }
              : section
          );
        }
        return prev;
      });
    }
    setDraggedQuestionId(null);
  }, []);

  const handleDragStartSection = useCallback((e: React.DragEvent, sectionId: string) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.setData('sectionId', sectionId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDropSection = useCallback((e: React.DragEvent, targetSectionId: string) => {
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
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleToggleCorrect = useCallback((id: string) => {
    setOptions((prev) => prev.map((opt) => ({ ...opt, isCorrect: opt.id === id })));
  }, []);

  const handleOptionContentChange = useCallback((optId: string, data: any) => {
    setOptions((prev) => prev.map((opt) => (opt.id === optId ? { ...opt, content: data } : opt)));
  }, []);

  const handleAddSection = useCallback(() => {
    setLocalSections((prev) => [
      ...prev,
      {
        id: `temp-${generateId()}`,
        title: 'New Section',
        order: 0,
        paperId,
        isDefault: false,
        questions: [],
      },
    ]);
    setIsDirty(true);
  }, [paperId]);

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (localSections.length <= 1) {
        toast.error('Cannot delete the last section');
        return;
      }
      const section = localSections.find((s) => s.id === sectionId);
      if (
        !window.confirm(
          `Are you sure you want to delete "${section?.title || 'this section'}" and all its questions? This action cannot be undone after saving.`
        )
      )
        return;
      if (!sectionId.startsWith('temp-')) {
        setDeletedSectionIds((prev) => new Set(prev).add(sectionId));
      }
      if (section?.questions?.some((q) => q.id === activeQuestionId)) {
        setActiveQuestionId(null);
      }
      setIsDirty(true);
      setLocalSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [localSections, activeQuestionId]
  );

  const handleAddQuestion = useCallback(
    (sectionId: string) => {
      const newQuestion: Question = {
        id: `temp-${generateId()}`,
        sectionId,
        paperId,
        question: { blocks: [{ type: 'paragraph', data: { text: '' } }] },
        options: [
          { id: generateId(), content: { blocks: [] }, isCorrect: true },
          { id: generateId(), content: { blocks: [] }, isCorrect: false },
          { id: generateId(), content: { blocks: [] }, isCorrect: false },
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
    },
    [paperId]
  );

  const handleDeleteQuestion = useCallback(
    (qId: string) => {
      if (!qId.startsWith('temp-')) {
        setDeletedQuestionIds((prev) => new Set(prev).add(qId));
      }
      setLocalSections((prev) =>
        prev.map((s) => ({ ...s, questions: s.questions?.filter((q) => q.id !== qId) || [] }))
      );
      if (activeQuestionId === qId) setActiveQuestionId(null);
    },
    [activeQuestionId]
  );

  const handleAddOption = useCallback(() => {
    setOptions((prev) => [
      ...prev,
      { id: generateId(), content: { blocks: [] }, isCorrect: false },
    ]);
  }, []);

  const handleDeleteOption = useCallback((optId: string) => {
    setOptions((prev) => prev.filter((o) => o.id !== optId));
  }, []);

  const handleSave = useCallback(
    async (isPublishing = false) => {
      if (!isDirty && !isPublishing && !isSaving) return;
      setIsSaving(true);
      try {
        const allQs = localSections.flatMap((s) => s.questions || []);

        const questionUpdates = allQs
          .filter((q) => !q.id.startsWith('temp-'))
          .map((q, idx) => ({
            id: q.id,
            question: q.question,
            options: q.options,
            explanation: q.explanation,
            positiveMarks: q.positiveMarks,
            negativeMarks: q.negativeMarks,
            correctOptionIndex: Math.max(0, q.options?.findIndex((o: any) => o.isCorrect) ?? 0),
            sectionId: q.sectionId,
            order: idx,
          }));

        const newQuestions = allQs
          .filter((q) => q.id.startsWith('temp-'))
          .map((q, idx) => ({
            question: q.question,
            options: q.options,
            explanation: q.explanation,
            positiveMarks: q.positiveMarks,
            negativeMarks: q.negativeMarks,
            correctOptionIndex: Math.max(0, q.options?.findIndex((o: any) => o.isCorrect) ?? 0),
            sectionId: q.sectionId,
            paperId,
            order: idx,
          }));

        const sectionUpdates = localSections
          .filter((s) => !s.id.startsWith('temp-'))
          .map((s, idx) => ({
            id: s.id,
            title: s.title,
            order: idx,
            positiveMarks: s.positiveMarks,
            negativeMarks: s.negativeMarks,
          }));

        const newSections = localSections
          .filter((s) => s.id.startsWith('temp-'))
          .map((s, idx) => ({
            title: s.title,
            paperId,
            order: idx,
            positiveMarks: s.positiveMarks,
            negativeMarks: s.negativeMarks,
          }));

        const paperUpdate = {
          description: paperDescription,
          examId: selectedExamId,
          positiveMarks: defaultPositiveMarks,
          negativeMarks: defaultNegativeMarks,
          hasSections,
          duration: paperDuration,
          paperDate: hasPaperDate ? paperDate : null,
          isPublished: isPublishing ? true : undefined,
        };

        const promises: Promise<any>[] = [];

        // 1. Update Paper Global Settings
        promises.push(paperService.updatePaper(paperId, paperUpdate));

        // 2. Update Questions
        if (questionUpdates.length > 0)
          promises.push(questionService.updateQuestions(questionUpdates));
        if (newQuestions.length > 0) promises.push(questionService.createQuestions(newQuestions));
        if (deletedQuestionIds.size > 0)
          promises.push(questionService.deleteQuestions(Array.from(deletedQuestionIds)));

        // 3. Update Sections
        if (sectionUpdates.length > 0) promises.push(sectionService.updateSections(sectionUpdates));
        if (newSections.length > 0) promises.push(sectionService.createSections(newSections));
        if (deletedSectionIds.size > 0)
          promises.push(sectionService.deleteSections(Array.from(deletedSectionIds)));

        await Promise.all(promises);
        toast.success(isPublishing ? 'Paper published successfully' : 'Paper saved successfully');
        setIsDirty(false);
        setDeletedQuestionIds(new Set());
        setDeletedSectionIds(new Set());
        queryClient.invalidateQueries({ queryKey: ['paper', paperId] });
      } catch (error) {
        console.error('Failed to save paper:', error);
        toast.error('Failed to save paper changes');
      } finally {
        setIsSaving(false);
      }
    },
    [
      isDirty,
      isSaving,
      localSections,
      deletedQuestionIds,
      deletedSectionIds,
      paperId,
      queryClient,
      paperDescription,
      selectedExamId,
      defaultPositiveMarks,
      defaultNegativeMarks,
      hasSections,
      paperDuration,
      paperDate,
      hasPaperDate,
    ]
  );

  const handlePublish = useCallback(async () => {
    if (
      !window.confirm(
        'Are you sure you want to publish this paper? It will become visible to students.'
      )
    )
      return;
    await handleSave(true);
  }, [handleSave]);

  return {
    localSections,
    isDirty,
    isSaving,
    collapsedSections,
    draggedQuestionId,
    draggedSectionId,
    editingSectionId,
    editingSectionTitle,
    setEditingSectionTitle,
    activeQuestionId,
    activeItemId,
    setActiveItemId,
    questionContent,
    setQuestionContent,
    options,
    allQuestions,
    activeQuestionIndex,
    activeQuestion,
    questionExplanation,
    setQuestionExplanation,
    questionPositiveMarks,
    setQuestionPositiveMarks,
    questionNegativeMarks,
    setQuestionNegativeMarks,
    paperDescription,
    setPaperDescription,
    selectedExamId,
    setSelectedExamId,
    defaultPositiveMarks,
    setDefaultPositiveMarks,
    defaultNegativeMarks,
    setDefaultNegativeMarks,
    hasSections,
    setHasSections,
    paperDuration,
    setPaperDuration,
    paperDate,
    setPaperDate,
    hasPaperDate,
    setHasPaperDate,
    handleSelectQuestion,
    toggleSection,
    handleStartEditSection,
    handleSaveSectionTitle,
    cancelEditSection,
    handleDragStart,
    handleDropOnSection,
    handleDragStartSection,
    handleDropSection,
    handleDragOver,
    handleToggleCorrect,
    handleOptionContentChange,
    handleAddSection,
    handleDeleteSection,
    handleAddQuestion,
    handleDeleteQuestion,
    handleAddOption,
    handleDeleteOption,
    handleSave,
    handlePublish,
  };
}
