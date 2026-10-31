const { z } = require('zod');

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format YYYY-MM-DD hona chahiye');

const analyticsQuerySchema = z.object({
  from: dateStr.optional(),
  to: dateStr.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

module.exports = { analyticsQuerySchema };