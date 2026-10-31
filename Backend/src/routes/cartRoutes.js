const router = require('express').Router();

const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/auth');
const {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
} = require('../validators/cartValidator');
const {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeCart,
} = require('../controllers/cartController');

// Cart sirf logged-in user ke liye
router.use(protect, restrictTo('customer'));

router.get('/', getCart);
router.delete('/', clearCart);
router.post('/items', validate(addToCartSchema), addItem);
router.patch('/items/:productId', validate(updateCartItemSchema), updateItem);
router.delete('/items/:productId', removeItem);
router.post('/merge', validate(mergeCartSchema), mergeCart);

module.exports = router;