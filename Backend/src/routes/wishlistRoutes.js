const router = require('express').Router();

const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/auth');
const { wishlistSchema } = require('../validators/cartValidator');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} = require('../controllers/cartController');

router.use(protect, restrictTo('customer'));

router.get('/', getWishlist);
router.post('/', validate(wishlistSchema), addToWishlist);
router.delete('/:productId', removeFromWishlist);

module.exports = router;