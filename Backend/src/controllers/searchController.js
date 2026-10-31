const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const searchService = require('../services/searchService');
const { searchQuerySchema, suggestQuerySchema } = require('../validators/searchValidator');

// GET /search/products?q=shirt&category=...&minPrice=100000&maxPrice=500000&sort=price_asc&page=1&limit=20
exports.search = asyncHandler(async (req, res) => {
  const parsed = searchQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await searchService.searchProducts(parsed.data);
  res.json({ success: true, data });
});

// GET /search/suggest?q=sh
exports.suggest = asyncHandler(async (req, res) => {
  const parsed = suggestQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await searchService.suggest(parsed.data);
  res.json({ success: true, data });
});