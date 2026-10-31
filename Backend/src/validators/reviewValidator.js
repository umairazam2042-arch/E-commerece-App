const { z } = require('zod');

const createReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(100).optional(),
  comment: z.string().trim().max(1000).optional(),
});

const updateReviewSchema = createReviewSchema.partial();

const replySchema = z.object({
  text: z.string().trim().min(1).max(500),
});

const listReviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sort: z.enum(['newest', 'highest', 'lowest']).default('newest'),
  rating: z.coerce.number().int().min(1).max(5).optional(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  replySchema,
  listReviewsQuerySchema,
};