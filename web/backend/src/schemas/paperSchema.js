const { z } = require('zod');

exports.createPaperSchema = z.object({
  body: z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
    examId: z.string().uuid({ message: 'Invalid exam ID' }),
    totalQuestions: z
      .number()
      .int()
      .positive({ message: 'Total questions must be a positive integer' }),
    duration: z.number().int().positive({ message: 'Duration must be a positive integer' }),
    year: z.number().int().optional().nullable(),
    isPublished: z.boolean().optional(),
  }),
});

exports.updatePaperSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid paper ID' }),
  }),
  body: z
    .object({
      title: z.string().min(2, { message: 'Title must be at least 2 characters' }).optional(),
      examId: z.string().uuid({ message: 'Invalid exam ID' }).optional(),
      totalQuestions: z
        .number()
        .int()
        .positive({ message: 'Total questions must be a positive integer' })
        .optional(),
      duration: z
        .number()
        .int()
        .positive({ message: 'Duration must be a positive integer' })
        .optional(),
      year: z.number().int().optional().nullable(),
      isPublished: z.boolean().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

exports.paperIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid paper ID' }),
  }),
});
