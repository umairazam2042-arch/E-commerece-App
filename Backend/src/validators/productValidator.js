const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');
const imagesSchema = z
  .array(z.string().url('Each image must be a valid URL'))
  .max(5, 'Maximum 5 images allowed');

const createProductSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(5000),
  price: z
    .number({ invalid_type_error: 'Price must be a number' })
    .int('Price must be a whole number (paisay)')
    .nonnegative('Price cannot be negative'),
  sku: z.string().trim().min(2).max(40).optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative').default(0),
  images: imagesSchema.optional(),
  category: objectIdSchema,
  status: z.enum(['draft', 'published']).default('draft'),
});

const updateProductSchema = z
  .object({
    title: z.string().trim().min(3).max(120).optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    price: z.number().int().nonnegative().optional(),
    sku: z.string().trim().min(2).max(40).optional(),
    stock: z.number().int().nonnegative().optional(),
    images: imagesSchema.optional(),
    category: objectIdSchema.optional(),
    status: z.enum(['draft', 'published']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

const listPublicQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  category: objectIdSchema.optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(),
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

const listMineQuerySchema = z.object({
  status: z.enum(['draft', 'published']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  listPublicQuerySchema,
  listMineQuerySchema,
};