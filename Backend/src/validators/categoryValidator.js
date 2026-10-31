const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid category id');

const createCategorySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60),
  parent: objectIdSchema.nullable().optional(),
});

const updateCategorySchema = z
  .object({
    name: z.string().trim().min(2).max(60).optional(),
    parent: objectIdSchema.nullable().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

module.exports = { createCategorySchema, updateCategorySchema };