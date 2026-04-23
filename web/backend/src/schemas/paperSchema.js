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
