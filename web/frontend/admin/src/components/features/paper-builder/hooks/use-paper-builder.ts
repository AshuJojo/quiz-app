'use client';

import { Option, Paper, Question, Section } from '@/components/features/papers/types';
import { OutputData } from '@editorjs/editorjs';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { paperSectionService, paperService, questionService, sectionService } from '../services';

const generateId = () => {
  try {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
  } catch {}
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

/** Strip leading/trailing empty paragraph blocks from EditorJS output. */
const trimBlocks = (data: any): any => {
  if (!data?.blocks?.length) return data;
  const isEmpty = (block: any) =>
    (block?.data?.text ?? '').replace(/<[^>]*>/g, '').trim().length === 0;
  const blocks = [...data.blocks];
  while (blocks.length > 0 && isEmpty(blocks[0])) blocks.shift();
  while (blocks.length > 0 && isEmpty(blocks[blocks.length - 1])) blocks.pop();
  return { ...data, blocks };
};

/** True if the EditorJS output has at least one block with visible text. */
const hasTextContent = (data: any): boolean => {
  if (!data?.blocks?.length) return false;
  return data.blocks.some(
    (block: any) => (block?.data?.text ?? '').replace(/<[^>]*>/g, '').trim().length > 0
  );
};

const EMPTY_OPTIONS: Option[] = [
  { content: { blocks: [] } },
  { content: { blocks: [] } },
  { content: { blocks: [] } },
  { content: { blocks: [] } },
];

export function usePaperBuilder(
  paperId: string,
  paper: Paper | undefined,
  sections: Section[] | undefined, // sections in paper (ordered), includes default
  questions: Question[] | undefined,
  examSections: Section[] | undefined, // all exam sections (excludes default sections)
  isSuccess: boolean
) {
  const queryClient = useQueryClient();

  const initialSections = useMemo(() => {
    if (!sections) return [];
    return sections.map((s) => ({
      ...s,
      questions: questions?.filter((q) => q.sectionId === s.id) || [],
    }));
  }, [sections, questions]);

  const [localSections, setLocalSections] = useState<Section[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Derived from the server-fetched paper — not local state
  const isPublished = paper?.isPublished ?? false;

  const [addedSectionIds, setAddedSectionIds] = useState<Set<string>>(new Set());
  const [removedSectionIds, setRemovedSectionIds] = useState<Set<string>>(new Set());
  const [renamedSections, setRenamedSections] = useState<Map<string, string>>(new Map());
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<Set<string>>(new Set());
  // Sections imported from JSON that don't exist in the exam yet — created on save
  const [draftSections, setDraftSections] = useState<
    Array<{ tempId: string; title: string; examId: string }>
  >([]);

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
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);

  const [questionExplanation, setQuestionExplanation] = useState('');
  const [questionPositiveMarks, setQuestionPositiveMarks] = useState<number | null>(null);
  const [questionNegativeMarks, setQuestionNegativeMarks] = useState<number | null>(null);

  // Keys: `q:{id}` = empty question text, `o:{id}:{i}` = empty option i
  const [validationErrors, setValidationErrors] = useState<Set<string>>(new Set());

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
      setLocalSections(initialSections);
    }
  }, [isSuccess, initialSections, localSections.length]);

  // Write-back: sync workspace state into the active question in localSections
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
                    correctOptionIndex,
                    explanation: questionExplanation,
                    positiveMarks: questionPositiveMarks,
                    negativeMarks: questionNegativeMarks,
                  }
                : q
            ) || [],
        }))
      );
      setIsDirty(true);
      // Clear validation errors for the active question as the user edits
      setValidationErrors((prev) => {
        if (prev.size === 0 || !activeQuestionId) return prev;
        const next = new Set(prev);
        if (hasTextContent(questionContent)) next.delete(`q:${activeQuestionId}`);
        options.forEach((opt, i) => {
          if (hasTextContent(opt.content)) next.delete(`o:${activeQuestionId}:${i}`);
        });
        return next.size === prev.size ? prev : next;
      });
    }
  }, [
    questionContent,
    options,
    correctOptionIndex,
    activeQuestionId,
    questionExplanation,
    questionPositiveMarks,
    questionNegativeMarks,
  ]);

  const allQuestions = useMemo(
    () => localSections.flatMap((s) => s.questions || []),
    [localSections]
  );

  // Visible sections — excludes the hidden default/uncategorized section
  const visibleSections = useMemo(() => localSections.filter((s) => !s.isDefault), [localSections]);

  // ID of the hidden default section (used for questions when hasSections=false)
  const defaultSectionId = useMemo(
    () => localSections.find((s) => s.isDefault)?.id ?? null,
    [localSections]
  );

  // Exam sections that haven't been added to this paper yet
  const availableExamSections = useMemo(() => {
    if (!examSections) return [];
    const inPaper = new Set(localSections.map((s) => s.id));
    return examSections.filter((s) => !inPaper.has(s.id));
  }, [examSections, localSections]);

  // Auto-select the first question when none is active
  useEffect(() => {
    if (localSections.length > 0 && !activeQuestionId) {
      const firstQ = allQuestions[0];
      if (firstQ) {
        setActiveQuestionId(firstQ.id);
        setQuestionContent(firstQ.question);
        setOptions(firstQ.options ?? []);
        setCorrectOptionIndex(firstQ.correctOptionIndex ?? 0);
        setQuestionExplanation(firstQ.explanation || '');
        setQuestionPositiveMarks(firstQ.positiveMarks ?? null);
        setQuestionNegativeMarks(firstQ.negativeMarks ?? null);
        setIsDirty(false);
      }
    }
  }, [localSections, activeQuestionId, allQuestions]);

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
    setOptions(q.options ?? []);
    setCorrectOptionIndex(q.correctOptionIndex ?? 0);
    setQuestionExplanation(q.explanation || '');
    setQuestionPositiveMarks(q.positiveMarks ?? null);
    setQuestionNegativeMarks(q.negativeMarks ?? null);
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
        setRenamedSections((prev) => new Map(prev).set(sectionId, editingSectionTitle.trim()));
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

  const handleSetCorrectOption = useCallback((index: number) => {
    setCorrectOptionIndex(index);
  }, []);

  const handleOptionContentChange = useCallback((index: number, data: any) => {
    setOptions((prev) => prev.map((opt, i) => (i === index ? { ...opt, content: data } : opt)));
  }, []);

  // Add an existing exam section to this paper (buffered until save)
  const handleAddSection = useCallback(
    (sectionId: string) => {
      const section = examSections?.find((s) => s.id === sectionId);
      if (!section) return;
      setLocalSections((prev) => [...prev, { ...section, questions: [], isDefault: false }]);
      setAddedSectionIds((prev) => {
        const next = new Set(prev);
        next.add(sectionId);
        return next;
      });
      setRemovedSectionIds((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
      setIsDirty(true);
    },
    [examSections]
  );

  // Create a new section in the exam immediately, then buffer the add-to-paper
  const handleCreateSection = useCallback(
    async (title: string) => {
      if (!selectedExamId) {
        toast.error('Paper must be linked to an exam to create sections');
        return;
      }
      try {
        const result = await sectionService.createSections([{ examId: selectedExamId, title }]);
        const newSection: Section = result.data?.[0];
        if (!newSection) throw new Error('No section returned');
        setLocalSections((prev) => [...prev, { ...newSection, questions: [], isDefault: false }]);
        setAddedSectionIds((prev) => new Set(prev).add(newSection.id));
        setIsDirty(true);
        // Invalidate exam sections so the picker reflects the new section
        queryClient.invalidateQueries({ queryKey: ['exam-sections', selectedExamId] });
      } catch {
        toast.error('Failed to create section');
      }
    },
    [selectedExamId, queryClient]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      const section = localSections.find((s) => s.id === sectionId);

      if (section?.isDefault) {
        toast.error('The default section cannot be removed.');
        return;
      }
      if (hasSections && visibleSections.length <= 1) {
        toast.error(
          'Cannot remove the only section. Disable "Have Sections" or add another section first.'
        );
        return;
      }
      if (
        !window.confirm(
          `Remove "${section?.title || 'this section'}" from this paper? All its questions in this paper will be deleted.`
        )
      )
        return;

      if (addedSectionIds.has(sectionId)) {
        setAddedSectionIds((prev) => {
          const next = new Set(prev);
          next.delete(sectionId);
          return next;
        });
      } else {
        setRemovedSectionIds((prev) => new Set(prev).add(sectionId));
      }

      const sectionQIds = new Set(
        (section?.questions ?? []).filter((q) => !q.id.startsWith('temp-')).map((q) => q.id)
      );
      if (sectionQIds.size > 0) {
        setDeletedQuestionIds((prev) => {
          const next = new Set(prev);
          sectionQIds.forEach((id) => next.delete(id));
          return next;
        });
      }

      if (section?.questions?.some((q) => q.id === activeQuestionId)) {
        setActiveQuestionId(null);
      }
      setIsDirty(true);
      setLocalSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [localSections, activeQuestionId, hasSections, visibleSections.length, addedSectionIds]
  );

  const handleAddQuestion = useCallback(
    (sectionId: string) => {
      // When hasSections is off, route new questions to the hidden default section
      const targetSectionId = !hasSections && defaultSectionId ? defaultSectionId : sectionId;
      const emptyContent = { blocks: [{ type: 'paragraph', data: { text: '' } }] };
      const newQuestion: Question = {
        id: `temp-${generateId()}`,
        sectionId: targetSectionId,
        paperId,
        question: emptyContent,
        options: [...EMPTY_OPTIONS],
        correctOptionIndex: 0,
        order: 0,
        type: 'SINGLE_CHOICE',
      };
      setLocalSections((prev) =>
        prev.map((s) =>
          s.id === targetSectionId ? { ...s, questions: [...(s.questions || []), newQuestion] } : s
        )
      );
      setActiveQuestionId(newQuestion.id);
      setQuestionContent(emptyContent);
      setOptions([...EMPTY_OPTIONS]);
      setCorrectOptionIndex(0);
      setQuestionExplanation('');
      setQuestionPositiveMarks(null);
      setQuestionNegativeMarks(null);
    },
    [paperId, hasSections, defaultSectionId]
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

  const handleDuplicateQuestion = useCallback((qId: string) => {
    const duplicateId = `temp-${generateId()}`;
    setLocalSections((prev) =>
      prev.map((section) => {
        const qIdx = section.questions?.findIndex((q) => q.id === qId);
        if (qIdx === undefined || qIdx === -1) return section;
        const original = section.questions![qIdx];
        const duplicate: Question = {
          ...original,
          id: duplicateId,
          options: original.options.map((opt: Option) => ({ ...opt })),
        };
        const next = [...section.questions!];
        next.splice(qIdx + 1, 0, duplicate);
        return { ...section, questions: next };
      })
    );
    // Switch active question to the duplicate — the write-back effect will copy the
    // current workspace content (which matches the original) into the duplicate.
    setActiveQuestionId(duplicateId);
    setIsDirty(true);
  }, []);

  // Fully local — no API calls during import. New sections get temp IDs and are created on save.
  const handleImportJson = useCallback(
    async (jsonData: any): Promise<{ sections: number; questions: number }> => {
      const toContent = (v: any): any => {
        if (!v) return { blocks: [] };
        if (typeof v === 'string') return { blocks: [{ type: 'paragraph', data: { text: v } }] };
        if (Array.isArray(v?.blocks)) return v;
        return { blocks: [] };
      };

      // Apply optional paper-level settings
      if (typeof jsonData.description === 'string') setPaperDescription(jsonData.description);
      if (typeof jsonData.positiveMarks === 'number')
        setDefaultPositiveMarks(jsonData.positiveMarks);
      if (typeof jsonData.negativeMarks === 'number')
        setDefaultNegativeMarks(jsonData.negativeMarks);
      if (typeof jsonData.duration === 'number') setPaperDuration(jsonData.duration);
      if (typeof jsonData.hasSections === 'boolean') setHasSections(jsonData.hasSections);

      type Row = {
        section: Section;
        questions: Question[];
        addToExisting: boolean;
        isDraft: boolean;
      };
      const rows: Row[] = [];
      const newDrafts: Array<{ tempId: string; title: string; examId: string }> = [];

      for (const sData of jsonData.sections as any[]) {
        const title = String(sData.title || 'Imported Section').trim();

        // 1. Already in this paper?
        let section: Section | undefined = localSections.find(
          (s) => !s.isDefault && s.title.toLowerCase() === title.toLowerCase()
        );
        let addToExisting = false;
        let isDraft = false;

        if (!section) {
          // 2. Exists in exam but not yet added to this paper?
          section = examSections?.find((s) => s.title.toLowerCase() === title.toLowerCase());
          if (section) {
            addToExisting = !localSections.some((s) => s.id === section!.id);
          } else {
            // 3. Doesn't exist anywhere — create a local draft with a temp ID
            const tempId = `temp-${generateId()}`;
            section = {
              id: tempId,
              title,
              examId: selectedExamId || null,
              questions: [],
              isDefault: false,
            };
            newDrafts.push({ tempId, title, examId: selectedExamId || '' });
            isDraft = true;
          }
        }

        const questions: Question[] = (sData.questions || []).map((qData: any, i: number) => ({
          id: `temp-${generateId()}`,
          sectionId: section!.id,
          paperId,
          question: toContent(qData.question ?? qData.text),
          options: (qData.options || []).map((opt: any) => ({
            content: toContent(typeof opt === 'object' && opt?.content ? opt.content : opt),
          })),
          correctOptionIndex:
            typeof qData.correctOptionIndex === 'number' ? qData.correctOptionIndex : 0,
          explanation: qData.explanation ?? null,
          positiveMarks: qData.positiveMarks ?? null,
          negativeMarks: qData.negativeMarks ?? null,
          order: i,
          type: 'SINGLE_CHOICE',
        }));

        rows.push({ section, questions, addToExisting, isDraft });
      }

      setLocalSections((prev) => {
        const next = [...prev];
        for (const { section, questions } of rows) {
          const idx = next.findIndex((s) => s.id === section.id);
          if (idx >= 0) {
            next[idx] = { ...next[idx], questions: [...(next[idx].questions || []), ...questions] };
          } else {
            next.push({ ...section, questions, isDefault: false });
          }
        }
        return next;
      });

      setAddedSectionIds((prev) => {
        const next = new Set(prev);
        for (const { section, addToExisting } of rows) {
          if (addToExisting) next.add(section.id);
        }
        return next;
      });

      if (newDrafts.length > 0) {
        setDraftSections((prev) => [...prev, ...newDrafts]);
      }

      setIsDirty(true);
      const totalQ = rows.reduce((acc, { questions }) => acc + questions.length, 0);
      return { sections: rows.length, questions: totalQ };
    },
    [localSections, examSections, selectedExamId, paperId]
  );

  const handleAddOption = useCallback(() => {
    setOptions((prev) => [...prev, { content: { blocks: [] } }]);
  }, []);

  const handleDeleteOption = useCallback((index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
    setCorrectOptionIndex((prev) => {
      if (index < prev) return prev - 1;
      if (index === prev) return 0;
      return prev;
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;

    // ── Validate before saving ───────────────────────────────────────────────
    const allQsForValidation = localSections.flatMap((s) => s.questions || []);
    const errors = new Set<string>();
    allQsForValidation.forEach((q) => {
      if (!hasTextContent(q.question)) errors.add(`q:${q.id}`);
      q.options?.forEach((opt, i) => {
        if (!hasTextContent(opt?.content)) errors.add(`o:${q.id}:${i}`);
      });
    });
    if (errors.size > 0) {
      setValidationErrors(errors);
      // Auto-navigate to the first question that has an error
      const firstErrorQ = allQsForValidation.find(
        (q) =>
          errors.has(`q:${q.id}`) ||
          q.options?.some((_: any, i: number) => errors.has(`o:${q.id}:${i}`))
      );
      if (firstErrorQ) {
        setActiveQuestionId(firstErrorQ.id);
        setQuestionContent(firstErrorQ.question);
        setOptions(firstErrorQ.options ?? []);
        setCorrectOptionIndex(firstErrorQ.correctOptionIndex ?? 0);
        setQuestionExplanation(firstErrorQ.explanation || '');
        setQuestionPositiveMarks(firstErrorQ.positiveMarks ?? null);
        setQuestionNegativeMarks(firstErrorQ.negativeMarks ?? null);
      }
      toast.error('Some questions or options are empty — highlighted in red.');
      return;
    }
    setValidationErrors(new Set());

    setIsSaving(true);
    try {
      const allQs = localSections.flatMap((s) => s.questions || []);
      const tempQuestions = allQs.filter((q) => q.id.startsWith('temp-'));

      const trimQuestion = (q: any) => ({
        ...q,
        question: trimBlocks(q.question),
        options: q.options.map((opt: any) => ({ ...opt, content: trimBlocks(opt.content) })),
      });

      const questionUpdates = allQs
        .filter((q) => !q.id.startsWith('temp-'))
        .map((q, idx) => {
          const t = trimQuestion(q);
          return {
            id: t.id,
            question: t.question,
            options: t.options,
            explanation: t.explanation,
            positiveMarks: t.positiveMarks,
            negativeMarks: t.negativeMarks,
            correctOptionIndex: t.correctOptionIndex ?? 0,
            sectionId: t.sectionId,
            order: idx,
          };
        });

      const newQuestions = tempQuestions.map((q, idx) => {
        const t = trimQuestion(q);
        return {
          question: t.question,
          options: t.options,
          explanation: t.explanation,
          positiveMarks: t.positiveMarks,
          negativeMarks: t.negativeMarks,
          correctOptionIndex: t.correctOptionIndex ?? 0,
          sectionId: t.sectionId,
          paperId,
          order: idx,
        };
      });

      const paperUpdate = {
        description: paperDescription,
        examId: selectedExamId || null,
        positiveMarks: defaultPositiveMarks,
        negativeMarks: defaultNegativeMarks,
        hasSections,
        duration: paperDuration,
        paperDate: hasPaperDate ? paperDate : null,
        // NOTE: isPublished is intentionally omitted — use handlePublish() to publish.
      };

      // 1. Paper
      await paperService.updatePaper(paperId, paperUpdate);

      // 2a. Create draft sections (from JSON import) in the exam, map temp → real IDs
      const tempSectionIdMap = new Map<string, string>();
      if (draftSections.length > 0) {
        const toCreate = draftSections
          .filter((s) => s.examId)
          .map((s) => ({ examId: s.examId, title: s.title }));
        if (toCreate.length > 0) {
          const result = await sectionService.createSections(toCreate);
          const createdSecs: Array<{ id: string }> = result.data ?? [];
          draftSections
            .filter((s) => s.examId)
            .forEach((s, idx) => {
              if (createdSecs[idx]) tempSectionIdMap.set(s.tempId, createdSecs[idx].id);
            });
        }
        // Add newly created sections to paper
        const newRealIds = Array.from(tempSectionIdMap.values());
        if (newRealIds.length > 0) {
          await paperSectionService.addSectionsToPaper(paperId, newRealIds);
        }
        if (tempSectionIdMap.size > 0 && selectedExamId) {
          queryClient.invalidateQueries({ queryKey: ['exam-sections', selectedExamId] });
        }
      }

      const resolveSecId = (id: string) => tempSectionIdMap.get(id) ?? id;

      // 2b. Remove sections from paper
      if (removedSectionIds.size > 0) {
        await Promise.all(
          Array.from(removedSectionIds).map((sId) =>
            paperSectionService.removeSectionFromPaper(paperId, sId)
          )
        );
      }

      // 2c. Add existing exam sections to paper
      if (addedSectionIds.size > 0) {
        await paperSectionService.addSectionsToPaper(paperId, Array.from(addedSectionIds));
      }

      // 2d. Reorder non-default sections (resolve any temp IDs)
      const sectionOrderUpdates = visibleSections
        .filter((s) => !s.id.startsWith('temp-') || tempSectionIdMap.has(s.id))
        .map((s, idx) => ({ sectionId: resolveSecId(s.id), order: idx + 1 }));
      if (sectionOrderUpdates.length > 0) {
        await paperSectionService.reorderPaperSections(paperId, sectionOrderUpdates);
      }

      // 2e. Update renamed section titles (exam-level)
      if (renamedSections.size > 0) {
        const titleUpdates = Array.from(renamedSections.entries()).map(([id, title]) => ({
          id: resolveSecId(id),
          title,
        }));
        await sectionService.updateSections(titleUpdates);
      }

      // 3. Questions — resolve any temp section IDs before sending to backend
      const resolvedNewQuestions = newQuestions.map((q) => ({
        ...q,
        sectionId: resolveSecId(q.sectionId),
      }));
      const resolvedQuestionUpdates = questionUpdates.map((q) => ({
        ...q,
        sectionId: resolveSecId(q.sectionId),
      }));

      const [, createdQuestionsResult] = await Promise.all([
        resolvedQuestionUpdates.length > 0
          ? questionService.updateQuestions(resolvedQuestionUpdates)
          : null,
        resolvedNewQuestions.length > 0
          ? questionService.createQuestions(resolvedNewQuestions)
          : null,
        deletedQuestionIds.size > 0
          ? questionService.deleteQuestions(Array.from(deletedQuestionIds))
          : null,
      ]);

      // Replace temp question IDs AND temp section IDs with real IDs
      const questionIdMap = new Map<string, string>();
      const createdQs: Array<{ id: string }> = (createdQuestionsResult as any)?.data ?? [];
      tempQuestions.forEach((q, idx) => {
        if (createdQs[idx]) questionIdMap.set(q.id, createdQs[idx].id);
      });

      setLocalSections((prev) =>
        prev.map((section) => ({
          ...section,
          id: resolveSecId(section.id),
          questions:
            section.questions?.map((q) => ({
              ...q,
              id: questionIdMap.get(q.id) ?? q.id,
              sectionId: resolveSecId(q.sectionId),
            })) ?? [],
        }))
      );
      setActiveQuestionId((prev) => (prev ? (questionIdMap.get(prev) ?? prev) : prev));

      toast.success('Paper saved successfully');
      setIsDirty(false);
      setAddedSectionIds(new Set());
      setRemovedSectionIds(new Set());
      setRenamedSections(new Map());
      setDeletedQuestionIds(new Set());
      setDraftSections([]);
      queryClient.invalidateQueries({ queryKey: ['paper', paperId] });
      queryClient.invalidateQueries({ queryKey: ['paper-sections', paperId] });
      queryClient.invalidateQueries({ queryKey: ['paper-questions', paperId] });
    } catch (error) {
      console.error('Failed to save paper:', error);
      toast.error('Failed to save paper changes');
    } finally {
      setIsSaving(false);
    }
  }, [
    isDirty,
    isSaving,
    localSections,
    visibleSections,
    addedSectionIds,
    removedSectionIds,
    renamedSections,
    deletedQuestionIds,
    draftSections,
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
  ]);

  const handlePublish = useCallback(async () => {
    if (
      !window.confirm(
        'Are you sure you want to publish this paper? It will become visible to students.'
      )
    )
      return;
    setIsSaving(true);
    try {
      // 1. Save any pending content changes first (without touching isPublished)
      if (isDirty) await handleSave();
      // 2. Flip isPublished via the dedicated endpoint (cascades to questions)
      await paperService.publishPaper(paperId, true);
      toast.success('Paper published successfully');
      queryClient.invalidateQueries({ queryKey: ['paper', paperId] });
      queryClient.invalidateQueries({ queryKey: ['paper-questions', paperId] });
    } catch {
      toast.error('Failed to publish paper');
    } finally {
      setIsSaving(false);
    }
  }, [handleSave, isDirty, paperId, queryClient]);

  const handleMoveToDraft = useCallback(async () => {
    if (!window.confirm('Move this paper back to draft? It will no longer be visible to students.'))
      return;
    setIsSaving(true);
    try {
      await paperService.publishPaper(paperId, false);
      toast.success('Paper moved to draft');
      queryClient.invalidateQueries({ queryKey: ['paper', paperId] });
      queryClient.invalidateQueries({ queryKey: ['paper-questions', paperId] });
    } catch {
      toast.error('Failed to move paper to draft');
    } finally {
      setIsSaving(false);
    }
  }, [paperId, queryClient]);

  return {
    localSections,
    visibleSections,
    defaultSectionId,
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
    correctOptionIndex,
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
    availableExamSections,
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
    handleSetCorrectOption,
    handleOptionContentChange,
    handleAddSection,
    handleCreateSection,
    handleImportJson,
    handleDeleteSection,
    handleAddQuestion,
    handleDeleteQuestion,
    validationErrors,
    handleDuplicateQuestion,
    handleAddOption,
    handleDeleteOption,
    handleSave,
    handlePublish,
    handleMoveToDraft,
    isPublished,
  };
}
