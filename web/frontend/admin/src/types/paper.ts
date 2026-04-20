import { z } from 'zod';

export const PaperSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  examId: z.string().optional().nullable(),
  positiveMarks: z.coerce.number().nonnegative().optional().default(1),
  negativeMarks: z.coerce.number().nonnegative().optional().default(0),
  duration: z.coerce.number().nonnegative().optional().default(0),
  year: z.coerce.number().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export interface Section {
  id: string;
  title: string;
  order: number;
  isDefault: boolean;
  positiveMarks?: number | null;
  negativeMarks?: number | null;
  paperId: string;
  questions?: Question[];
  _count?: {
    questions: number;
  };
}

export interface Question {
  id: string;
  content: any;
  options: any[];
  correctAnswer?: any;
  positiveMarks?: number | null;
  negativeMarks?: number | null;
  order: number;
  sectionId: string;
  paperId: string;
  effectivePositiveMarks?: number;
  effectiveNegativeMarks?: number;
}

export interface Paper {
  id: string;
  title: string;
  examId: string;
  positiveMarks: number;
  negativeMarks: number;
  duration: number;
  year?: number | null;
  isPublished: boolean;
  exam: {
    name: string;
    slug: string;
    fullPath?: string;
  };
  sections?: Section[];
  _count?: {
    questions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreatePaperInput = z.infer<typeof PaperSchema>;
export type UpdatePaperInput = Partial<CreatePaperInput>;
