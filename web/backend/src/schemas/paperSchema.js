const { z } = require('zod');

exports.createPaperSchema = z.object({
  body: z.object({
    title: z.string().min(2, { message: 'Title must be at least 2 characters' }),
    examId: z.string().uuid({ message: 'Invalid exam ID' }).optional().nullable(),
    positiveMarks: z
      .number()
      .nonnegative({ message: 'Positive marks must be non-negative' })
      .optional(),
    negativeMarks: z
      .number()
      .nonnegative({ message: 'Negative marks must be non-negative' })
      .optional(),
    duration: z
      .number()
      .int()
      .nonnegative({ message: 'Duration must be a non-negative integer' })
      .optional(),
    paperDate: z.coerce.date().optional().nullable(),
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
      description: z.string().optional().nullable(),
      variantName: z.string().optional().nullable(),
      paperTypeId: z.string().uuid().optional().nullable(),
      examId: z
        .union([z.string().uuid({ message: 'Invalid exam ID' }), z.literal(''), z.null()])
        .optional(),
      positiveMarks: z
        .number()
        .nonnegative({ message: 'Positive marks must be non-negative' })
        .optional(),
      negativeMarks: z
        .number()
        .nonnegative({ message: 'Negative marks must be non-negative' })
        .optional(),
      hasSections: z.boolean().optional(),
      duration: z
        .number()
        .int()
        .nonnegative({ message: 'Duration must be a non-negative integer' })
        .optional(),
      paperDate: z.coerce.date().optional().nullable(),
      // isPublished is intentionally absent — use PATCH /papers/:id/publish instead.
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
