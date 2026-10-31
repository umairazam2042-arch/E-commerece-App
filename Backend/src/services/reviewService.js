const mongoose = require('mongoose');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const AppError = require('../utils/AppError');
const appEvents = require('../utils/events');

const SORT_MAP = {
  newest: { createdAt: -1 },
  highest: { rating: -1, createdAt: -1 },
  lowest: { rating: 1, createdAt: -1 },
};

// Product ki average rating aur count dobara calculate karta hai
const recalcProductRating = async (productId) => {
  const [stats] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  const ratingAverage = stats ? Math.round(stats.avg * 10) / 10 : 0;
  const ratingCount = stats ? stats.count : 0;

  await Product.updateOne({ _id: productId }, { ratingAverage, ratingCount });
};

// Check karta hai ke user ka koi delivered order is product par hai
const hasDeliveredPurchase = async (userId, productId) => {
  const orders = await Order.find({ customer: userId, status: 'delivered' })
    .select('_id')
    .lean();
  if (!orders.length) return false;

  const found = await SubOrder.exists({
    order: { $in: orders.map((o) => o._id) },
    'items.product': productId,
    status: 'delivered',
  });
  return !!found;
};

const createReview = async ({ userId, productId, rating, title, comment }) => {
  const product = await Product.exists({ _id: productId, status: 'published' });
  if (!product) throw new AppError('Product not found', 404);

  const verified = await hasDeliveredPurchase(userId, productId);
  if (!verified) {
    throw new AppError('Sirf wahi customer review de sakta hai jis ka order deliver ho chuka ho', 403);
  }

  const already = await Review.exists({ product: productId, user: userId });
  if (already) throw new AppError('Aap is product par pehle hi review de chuke hain', 409);

  const review = await Review.create({
    product: productId,
    user: userId,
    rating,
    title,
    comment,
    isVerifiedPurchase: true,
  });

  await recalcProductRating(productId);
  appEvents.emit('review:created', {
    reviewId: review._id,
    productId,
    userId,
    rating,
  });

  return review;
};

const listProductReviews = async ({ productId, page, limit, sort, rating }) => {
  const product = await Product.findOne({ _id: productId, status: 'published' })
    .select('ratingAverage ratingCount')
    .lean();
  if (!product) throw new AppError('Product not found', 404);

  const filter = { product: productId };
  if (rating) filter.rating = rating;

  const [items, total, distributionRaw] = await Promise.all([
    Review.find(filter)
      .sort(SORT_MAP[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name')
      .lean(),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: { product: new mongoose.Types.ObjectId(productId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
    ]),
  ]);

  // Star-wise count, e.g. { 5: 10, 4: 3, 3: 0, 2: 1, 1: 0 }
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  distributionRaw.forEach((d) => {
    distribution[d._id] = d.count;
  });

  return {
    summary: {
      ratingAverage: product.ratingAverage,
      ratingCount: product.ratingCount,
      distribution,
    },
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

const updateReview = async ({ userId, reviewId, data }) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);
  if (String(review.user) !== String(userId)) {
    throw new AppError('Aap sirf apna review update kar sakte hain', 403);
  }

  ['rating', 'title', 'comment'].forEach((field) => {
    if (data[field] !== undefined) review[field] = data[field];
  });

  await review.save();
  await recalcProductRating(review.product);
  return review;
};

// Owner ya admin delete kar sakta hai
const deleteReview = async ({ userId, role, reviewId }) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  const isOwner = String(review.user) === String(userId);
  if (!isOwner && role !== 'admin') {
    throw new AppError('Aap ko ye review delete karne ki ijazat nahi', 403);
  }

  const productId = review.product;
  await review.deleteOne();
  await recalcProductRating(productId);
};

const addVendorReply = async ({ vendorId, reviewId, text }) => {
  const review = await Review.findById(reviewId);
  if (!review) throw new AppError('Review not found', 404);

  const owned = await Product.exists({ _id: review.product, vendor: vendorId });
  if (!owned) throw new AppError('Ye review aap ki product par nahi hai', 403);

  review.vendorReply = { text, repliedAt: new Date() };
  await review.save();
  return review;
};

module.exports = {
  createReview,
  listProductReviews,
  updateReview,
  deleteReview,
  addVendorReply,
};