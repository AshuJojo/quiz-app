import { z } from 'zod';

export const PaperSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  examId: z.string().optional().nullable(),
  totalQuestions: z.coerce.number().nonnegative().optional().default(0),
  duration: z.coerce.number().nonnegative().optional().default(0),
  year: z.coerce.number().optional().nullable(),
  isPublished: z.boolean().default(false),
});

export interface Paper {
  id: string;
  title: string;
  examId: string;
  totalQuestions: number;
  duration: number;
  year?: number | null;
  isPublished: boolean;
  exam: {
    name: string;
    slug: string;
  };
  _count?: {
    questions: number;
  };
  createdAt: string;
  updatedAt: string;
}

export type CreatePaperInput = z.infer<typeof PaperSchema>;
export type UpdatePaperInput = Partial<CreatePaperInput>;
