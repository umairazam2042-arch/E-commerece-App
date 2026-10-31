const { z } = require('zod');

const objectId = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid id');

const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['pending', 'processing', 'delivered', 'cancelled']).optional(),
  customer: objectId.optional(),
  vendor: objectId.optional(),
});

module.exports = { adminOrdersQuerySchema };