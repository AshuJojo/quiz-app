const { z } = require('zod');

const sectionItemSchema = z.object({
  paperId: z.string().uuid({ message: 'Invalid paper ID' }),
  title: z.string().min(1, { message: 'Title must not be empty' }),
  order: z.number().int().nonnegative().optional(),
  positiveMarks: z.number().nonnegative().optional().nullable(),
  negativeMarks: z.number().nonnegative().optional().nullable(),
});

exports.createSectionsSchema = z.object({
  body: z.object({
    sections: z
      .array(sectionItemSchema)
      .min(1, { message: 'At least one section must be provided' }),
  }),
});

exports.updateSectionSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid section ID' }),
  }),
  body: z
    .object({
      title: z.string().min(1).optional(),
      order: z.number().int().nonnegative().optional(),
      positiveMarks: z.number().nonnegative().optional().nullable(),
      negativeMarks: z.number().nonnegative().optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

exports.bulkUpdateSectionsSchema = z.object({
  body: z.object({
    sections: z
      .array(
        z.object({
          id: z.string().uuid({ message: 'Invalid section ID' }),
          title: z.string().min(1).optional(),
          order: z.number().int().nonnegative().optional(),
          positiveMarks: z.number().nonnegative().optional().nullable(),
          negativeMarks: z.number().nonnegative().optional().nullable(),
        })
      )
      .min(1, { message: 'At least one section must be provided' }),
  }),
});

exports.bulkDeleteSectionsSchema = z.object({
  body: z.object({
    ids: z
      .array(z.string().uuid({ message: 'Invalid section ID' }))
      .min(1, { message: 'At least one section ID must be provided' }),
  }),
});

exports.sectionIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid({ message: 'Invalid section ID' }),
  }),
});

exports.paperIdParamsSchema = z.object({
  params: z.object({
    paperId: z.string().uuid({ message: 'Invalid paper ID' }),
  }),
});
