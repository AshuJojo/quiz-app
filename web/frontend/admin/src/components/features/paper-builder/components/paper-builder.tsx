'use client';

import { paperService } from '@/components/features/papers/services';
import { usePaperBuilder } from '@/components/features/paper-builder/hooks/use-paper-builder';
import { Paper } from '@/components/features/papers/types';
import { useQuery } from '@tanstack/react-query';
import { LayoutGrid, Settings2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import BuilderHeader from './builder-header';
import PaperNavigator from './paper-navigator';
import PaperSettingsPanel from './paper-settings-panel';
import QuestionWorkspace from './question-workspace';
import QuizSettingsPanel from './quiz-settings-panel';

interface PaperBuilderProps {
  id: string;
}

export default function PaperBuilder({ id }: PaperBuilderProps) {
  const router = useRouter();
  const [sidebarTab, setSidebarTab] = useState<'quiz' | 'paper'>('quiz');

  const {
    data: paperResult,
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperService.getPaper(id),
  });

  const paper = paperResult?.data as Paper | undefined;

  const b = usePaperBuilder(id, paper, isSuccess);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden animate-in fade-in duration-700">
      <BuilderHeader
        paperTitle={paper?.title ?? ''}
        isLoading={isLoading}
        isDirty={b.isDirty}
        isSaving={b.isSaving}
        onSave={b.handleSave}
        onBack={() => router.push('/papers')}
      />

      <div className="flex-1 flex overflow-hidden">
        <PaperNavigator
          isLoading={isLoading}
          localSections={b.localSections}
          hasSections={b.hasSections}
          allQuestions={b.allQuestions}
          activeQuestionId={b.activeQuestionId}
          collapsedSections={b.collapsedSections}
          editingSectionId={b.editingSectionId}
          editingSectionTitle={b.editingSectionTitle}
          draggedQuestionId={b.draggedQuestionId}
          draggedSectionId={b.draggedSectionId}
          totalQuestionsCount={paper?._count?.questions ?? 0}
          onEditingSectionTitleChange={b.setEditingSectionTitle}
          onSelectQuestion={b.handleSelectQuestion}
          onToggleSection={b.toggleSection}
          onStartEditSection={b.handleStartEditSection}
          onSaveSectionTitle={b.handleSaveSectionTitle}
          onCancelEditSection={b.cancelEditSection}
          onDragStart={b.handleDragStart}
          onDragStartSection={b.handleDragStartSection}
          onDropOnSection={b.handleDropOnSection}
          onDropSection={b.handleDropSection}
          onDragOver={b.handleDragOver}
          onAddSection={b.handleAddSection}
          onDeleteSection={b.handleDeleteSection}
          onAddQuestion={b.handleAddQuestion}
        />

        <QuestionWorkspace
          activeQuestionId={b.activeQuestionId}
          activeQuestionIndex={b.activeQuestionIndex}
          activeItemId={b.activeItemId}
          questionContent={b.questionContent}
          options={b.options}
          onActiveItemIdChange={(id) => b.setActiveItemId(id)}
          onQuestionContentChange={b.setQuestionContent}
          onOptionContentChange={b.handleOptionContentChange}
          onToggleCorrect={b.handleToggleCorrect}
          onDeleteQuestion={b.handleDeleteQuestion}
          onAddOption={b.handleAddOption}
          onDeleteOption={b.handleDeleteOption}
        />

        {/* Right sidebar: Properties */}
        <aside className="w-80 flex flex-col bg-background border-l border-outline-variant/10 overflow-hidden shadow-[-10px_0_30px_-15px_rgba(0,0,0,0.02)]">
          <div className="flex items-center p-4 border-b border-outline-variant/5">
            <div className="flex bg-surface-container-low p-1 rounded-xl w-full">
              <button
                onClick={() => setSidebarTab('quiz')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  sidebarTab === 'quiz'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-high/50'
                }`}
              >
                <LayoutGrid
                  size={14}
                  className={sidebarTab === 'quiz' ? 'animate-in zoom-in duration-300' : ''}
                />
                Quiz Settings
              </button>
              <button
                onClick={() => setSidebarTab('paper')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  sidebarTab === 'paper'
                    ? 'bg-surface-container-lowest text-primary shadow-sm'
                    : 'text-on-surface-variant/40 hover:text-on-surface-variant hover:bg-surface-container-high/50'
                }`}
              >
                <Settings2
                  size={14}
                  className={sidebarTab === 'paper' ? 'animate-in zoom-in duration-300' : ''}
                />
                Paper Settings
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {sidebarTab === 'quiz' ? (
              <QuizSettingsPanel
                explanation={b.questionExplanation}
                positiveMarks={b.questionPositiveMarks}
                negativeMarks={b.questionNegativeMarks}
                onExplanationChange={b.setQuestionExplanation}
                onPositiveMarksChange={b.setQuestionPositiveMarks}
                onNegativeMarksChange={b.setQuestionNegativeMarks}
              />
            ) : (
              <PaperSettingsPanel
                description={b.paperDescription}
                examId={b.selectedExamId}
                defaultPositiveMarks={b.defaultPositiveMarks}
                defaultNegativeMarks={b.defaultNegativeMarks}
                hasSections={b.hasSections}
                duration={b.paperDuration}
                year={b.paperYear}
                onDescriptionChange={b.setPaperDescription}
                onExamIdChange={b.setSelectedExamId}
                onDefaultPositiveMarksChange={b.setDefaultPositiveMarks}
                onDefaultNegativeMarksChange={b.setDefaultNegativeMarks}
                onHasSectionsChange={b.setHasSections}
                onDurationChange={b.setPaperDuration}
                onYearChange={b.setPaperYear}
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
