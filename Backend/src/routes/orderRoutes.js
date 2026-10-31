const router = require('express').Router();

const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/auth');
const { checkoutSchema, buyNowSchema } = require('../validators/orderValidator');
const {
  checkout,
  buyNow,
  myOrders,
  myOrder,
  cancelOrder,
} = require('../controllers/orderController');

// Sirf customer order bana sakta hai aur apna order dekh / cancel kar sakta hai
router.use(protect, restrictTo('customer'));

router.post('/checkout', validate(checkoutSchema), checkout);
router.post('/buy-now', validate(buyNowSchema), buyNow);
router.get('/', myOrders);
router.get('/:id', myOrder);
router.patch('/:id/cancel', cancelOrder);

module.exports = router;