const { z } = require('zod');

exports.createSectionsSchema = z.object({
  body: z.object({
    sections: z
      .array(
        z.object({
          examId: z.string().uuid({ message: 'Invalid exam ID' }),
          title: z.string().min(1, { message: 'Title must not be empty' }),
        })
      )
      .min(1, { message: 'At least one section must be provided' }),
  }),
});

exports.updateSectionSchema = z.object({
  params: z.object({ id: z.string().uuid({ message: 'Invalid section ID' }) }),
  body: z.object({ title: z.string().min(1, { message: 'Title must not be empty' }) }),
});

exports.bulkUpdateSectionsSchema = z.object({
  body: z.object({
    updates: z
      .array(
        z.object({
          id: z.string().uuid({ message: 'Invalid section ID' }),
          title: z.string().min(1, { message: 'Title must not be empty' }),
        })
      )
      .min(1),
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
  params: z.object({ id: z.string().uuid({ message: 'Invalid section ID' }) }),
});

exports.examIdParamsSchema = z.object({
  params: z.object({ examId: z.string().uuid({ message: 'Invalid exam ID' }) }),
});
