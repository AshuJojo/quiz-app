const { z } = require('zod');

exports.createExamSchema = z.object({
  body: z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    parentId: z.string().uuid({ message: 'Invalid parent ID' }).optional().nullable(),
    slug: z.string().optional(),
  }),
});

exports.updateExamSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid exam ID' }),
  }),
  body: z
    .object({
      name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
      parentId: z.string().uuid({ message: 'Invalid parent ID' }).optional().nullable(),
      slug: z.string().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

exports.examIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid exam ID' }),
  }),
});

exports.bulkDeleteExamSchema = z.object({
  body: z.object({
    ids: z.array(z.string().uuid({ message: 'Invalid exam ID in list' })).min(1, {
      message: 'At least one exam ID must be provided',
    }),
  }),
});
