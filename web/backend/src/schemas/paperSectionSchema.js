const { z } = require('zod');

exports.paperSectionParamsSchema = z.object({
  params: z.object({ paperId: z.string().uuid({ message: 'Invalid paper ID' }) }),
});

exports.paperSectionDeleteParamsSchema = z.object({
  params: z.object({
    paperId: z.string().uuid({ message: 'Invalid paper ID' }),
    sectionId: z.string().uuid({ message: 'Invalid section ID' }),
  }),
});

exports.addSectionsToPaperSchema = z.object({
  params: z.object({ paperId: z.string().uuid({ message: 'Invalid paper ID' }) }),
  body: z.object({
    sectionIds: z
      .array(z.string().uuid({ message: 'Invalid section ID' }))
      .min(1, { message: 'At least one section ID must be provided' }),
  }),
});

exports.reorderPaperSectionsSchema = z.object({
  params: z.object({ paperId: z.string().uuid({ message: 'Invalid paper ID' }) }),
  body: z.object({
    updates: z
      .array(
        z.object({
          sectionId: z.string().uuid({ message: 'Invalid section ID' }),
          order: z.number().int().nonnegative(),
        })
      )
      .min(1),
  }),
});
