const router = require('express').Router();
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const ctrl = require('../controllers/reviewController');
const {
  createReviewSchema,
  updateReviewSchema,
  replySchema,
} = require('../validators/reviewValidator');

// Public
router.get('/products/:productId/reviews', ctrl.listForProduct);

// Customer (login zaroori, delivered purchase service mein check hota hai)
router.post(
  '/products/:productId/reviews',
  protect,
  validate(createReviewSchema),
  ctrl.create
);
router.patch('/reviews/:reviewId', protect, validate(updateReviewSchema), ctrl.update);
router.delete('/reviews/:reviewId', protect, ctrl.remove);

// Vendor reply
router.post(
  '/vendor/reviews/:reviewId/reply',
  protect,
  restrictTo('vendor'),
  validate(replySchema),
  ctrl.vendorReply
);

module.exports = router;