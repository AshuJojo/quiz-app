import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Name is required').max(50),
  slug: z.string().optional(),
  icon: z.string().min(1).optional().nullable(),
  parentId: z.string().uuid().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  _count: z
    .object({
      children: z.number().optional(),
      papers: z.number().optional(),
    })
    .optional()
    .nullable(),
});

export type Category = z.infer<typeof CategorySchema>;

export interface CategoryResponse {
  success: boolean;
  count?: number;
  data: Category[] | Category;
  message?: string;
}
