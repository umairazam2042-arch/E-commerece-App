const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Vendor = require('../models/Vendor');
const reviewService = require('../services/reviewService');
const { listReviewsQuerySchema } = require('../validators/reviewValidator');

// GET /products/:productId/reviews?page=1&limit=10&sort=highest&rating=5
exports.listForProduct = asyncHandler(async (req, res) => {
  const parsed = listReviewsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const result = await reviewService.listProductReviews({
    productId: req.params.productId,
    ...parsed.data,
  });

  res.json({ success: true, data: result });
});

// POST /products/:productId/reviews
exports.create = asyncHandler(async (req, res) => {
  const review = await reviewService.createReview({
    userId: req.user._id,
    productId: req.params.productId,
    ...req.body,
  });

  res.status(201).json({ success: true, data: review });
});

// PATCH /reviews/:reviewId
exports.update = asyncHandler(async (req, res) => {
  const review = await reviewService.updateReview({
    userId: req.user._id,
    reviewId: req.params.reviewId,
    data: req.body,
  });

  res.json({ success: true, data: review });
});

// DELETE /reviews/:reviewId
exports.remove = asyncHandler(async (req, res) => {
  await reviewService.deleteReview({
    userId: req.user._id,
    role: req.user.role,
    reviewId: req.params.reviewId,
  });

  res.json({ success: true, message: 'Review deleted' });
});

// POST /vendor/reviews/:reviewId/reply
exports.vendorReply = asyncHandler(async (req, res) => {
  const vendor = await Vendor.findOne({ user: req.user._id, status: 'approved' })
    .select('_id')
    .lean();
  if (!vendor) throw new AppError('Approved vendor profile not found', 403);

  const review = await reviewService.addVendorReply({
    vendorId: vendor._id,
    reviewId: req.params.reviewId,
    text: req.body.text,
  });

  res.json({ success: true, data: review });
});