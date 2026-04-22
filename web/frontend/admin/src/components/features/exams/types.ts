import { z } from 'zod';

export const ExamSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().optional(),
  parentId: z.string().nullable().optional(),
});

export interface Exam {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    children: number;
    papers: number;
  };
}

export interface CreateExamInput {
  name: string;
  parentId?: string | null;
}

export interface UpdateExamInput {
  name?: string;
  parentId?: string | null;
}
