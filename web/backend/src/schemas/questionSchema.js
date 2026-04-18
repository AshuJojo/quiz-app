const { z } = require('zod');

const questionItemSchema = z.object({
  paperId: z.string().uuid({ message: 'Invalid paper ID' }),
  sectionId: z.string().uuid({ message: 'Invalid section ID' }),
  questionText: z.string().min(1, { message: 'Question text must not be empty' }),
  options: z.array(z.string().min(1)).length(4, { message: 'Exactly 4 options are required' }),
  correctOptionIndex: z
    .number()
    .int()
    .min(0)
    .max(3, { message: 'correctOptionIndex must be between 0 and 3' }),
  explanation: z.string().optional().nullable(),
  order: z.number().int().nonnegative().optional(),
  positiveMarks: z.number().nonnegative().optional().nullable(),
  negativeMarks: z.number().nonnegative().optional().nullable(),
});

exports.createQuestionsSchema = z.object({
  body: z.object({
    questions: z
      .array(questionItemSchema)
      .min(1, { message: 'At least one question must be provided' }),
  }),
});

exports.updateQuestionSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid question ID' }),
  }),
  body: z
    .object({
      sectionId: z.string().uuid({ message: 'Invalid section ID' }).optional(),
      questionText: z.string().min(1).optional(),
      options: z.array(z.string().min(1)).length(4).optional(),
      correctOptionIndex: z.number().int().min(0).max(3).optional(),
      explanation: z.string().optional().nullable(),
      order: z.number().int().nonnegative().optional(),
      positiveMarks: z.number().nonnegative().optional().nullable(),
      negativeMarks: z.number().nonnegative().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

exports.bulkUpdateQuestionsSchema = z.object({
  body: z.object({
    questions: z
      .array(
        z.object({
          id: z.string().uuid({ message: 'Invalid question ID' }),
          sectionId: z.string().uuid({ message: 'Invalid section ID' }).optional(),
          questionText: z.string().min(1).optional(),
          options: z.array(z.string().min(1)).length(4).optional(),
          correctOptionIndex: z.number().int().min(0).max(3).optional(),
          explanation: z.string().optional().nullable(),
          order: z.number().int().nonnegative().optional(),
          positiveMarks: z.number().nonnegative().optional().nullable(),
          negativeMarks: z.number().nonnegative().optional().nullable(),
        })
      )
      .min(1, { message: 'At least one question must be provided' }),
  }),
});

exports.bulkDeleteQuestionsSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().uuid({ message: 'Invalid question ID' }))
      .min(1, { message: 'At least one question ID must be provided' }),
  }),
});

exports.questionIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid question ID' }),
  }),
});
