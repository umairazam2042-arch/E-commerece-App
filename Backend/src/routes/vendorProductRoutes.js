const router = require('express').Router();

const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/auth');
const {
  createProductSchema,
  updateProductSchema,
} = require('../validators/productValidator');
const { myList, create, update, remove } = require('../controllers/productController');

// Saare routes sirf vendor ke liye
router.use(protect, restrictTo('vendor'));

router.get('/', myList);
router.post('/', validate(createProductSchema), create);
router.patch('/:id', validate(updateProductSchema), update);
router.delete('/:id', remove);

module.exports = router;