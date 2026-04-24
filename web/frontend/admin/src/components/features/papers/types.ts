import { z } from 'zod';

export const PaperSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  examId: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  hasSections: z.boolean().default(true),
  positiveMarks: z.coerce.number().nonnegative().optional().default(1),
  negativeMarks: z.coerce.number().nonnegative().optional().default(0),
  duration: z.coerce.number().nonnegative().optional().default(0),
  paperDate: z.coerce.date().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export interface Option {
  content: any;
}

export interface Question {
  id: string;
  question: any;
  options: any[];
  correctOptionIndex?: number;
  correctAnswer?: any;
  explanation?: string | null;
  positiveMarks?: number | null;
  negativeMarks?: number | null;
  order: number;
  sectionId: string;
  paperId: string;
  type?: string;
  effectivePositiveMarks?: number;
  effectiveNegativeMarks?: number;
}

export interface Section {
  id: string;
  title: string;
  examId: string;
  order?: number;
  paperSectionId?: string;
  questions?: Question[];
  _count?: { questions: number; paperSections: number };
}

export interface Paper {
  id: string;
  title: string;
  examId: string;
  description?: string | null;
  hasSections: boolean;
  positiveMarks: number;
  negativeMarks: number;
  duration: number;
  paperDate?: Date | string | null;
  isPublished: boolean;
  exam: {
    name: string;
    slug: string;
    fullPath?: string;
  };
  _count?: { questions: number };
  createdAt: string;
  updatedAt: string;
}

export type CreatePaperInput = z.infer<typeof PaperSchema>;
export type UpdatePaperInput = Partial<CreatePaperInput>;
