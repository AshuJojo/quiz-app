// src/schemas/userSchema.js
const { z } = require('zod');

exports.createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

exports.updateUserSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
  body: z
    .object({
      email: z.string().email('Invalid email format').optional(),
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for update',
    }),
});

exports.userIdParamsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

exports.deleteUsersSchema = z.object({
  body: z
    .object({
      ids: z.array(z.string().uuid('Invalid user ids')).optional(),
      all: z.boolean().optional(),
    })
    .optional()
    .refine((data) => data && (data.ids || data.all === true), {
      message: 'Must provide an array of IDs or set all: true',
    }),
});
