const router = require('express').Router();

const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/auth');
const { subOrderStatusSchema } = require('../validators/orderValidator');
const { vendorOrders, updateVendorStatus } = require('../controllers/orderController');

router.use(protect, restrictTo('vendor'));

router.get('/', vendorOrders);
router.patch('/:id/status', validate(subOrderStatusSchema), updateVendorStatus);

module.exports = router;