const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid category id');

const searchQuerySchema = z
  .object({
    q: z.string().trim().max(100).optional(),
    category: objectId.optional(),
    minPrice: z.coerce.number().int().min(0).optional(), // paisa mein
    maxPrice: z.coerce.number().int().min(0).optional(), // paisa mein
    sort: z.enum(['relevance', 'price_asc', 'price_desc', 'rating', 'newest']).default('relevance'),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(20),
  })
  .refine(
    (d) => d.minPrice === undefined || d.maxPrice === undefined || d.minPrice <= d.maxPrice,
    { message: 'minPrice, maxPrice se zyada nahi ho sakta' }
  );

const suggestQuerySchema = z.object({
  q: z.string().trim().min(2, 'Kam az kam 2 harf likhein').max(60),
});

module.exports = { searchQuerySchema, suggestQuerySchema };