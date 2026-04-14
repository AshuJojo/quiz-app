const { z } = require('zod');

exports.createCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    parentId: z.string().uuid({ message: 'Invalid parent ID' }).optional().nullable(),
    slug: z.string().optional(),
    icon: z.string().optional().nullable(),
  }),
});

exports.updateCategorySchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid category ID' }),
  }),
  body: z
    .object({
      name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
      parentId: z.string().uuid({ message: 'Invalid parent ID' }).optional().nullable(),
      slug: z.string().optional(),
      icon: z.string().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

exports.categoryIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid category ID' }),
  }),
});
