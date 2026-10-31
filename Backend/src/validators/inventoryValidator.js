const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const adjustStockSchema = z.object({
  change: z
    .number()
    .int()
    .refine((v) => v !== 0, 'Change cannot be zero'),
  type: z.enum(['restock', 'adjustment']).default('adjustment'),
  reason: z.string().trim().max(200).optional(),
});

const bulkStockSchema = z.object({
  updates: z
    .array(
      z.object({
        productId: objectId,
        stock: z.number().int().min(0),
      })
    )
    .min(1)
    .max(100),
});

const thresholdSchema = z.object({
  lowStockThreshold: z.number().int().min(0).max(1000),
});

const movementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['restock', 'adjustment', 'bulk_update', 'sale', 'release']).optional(),
});

module.exports = {
  adjustStockSchema,
  bulkStockSchema,
  thresholdSchema,
  movementsQuerySchema,
};