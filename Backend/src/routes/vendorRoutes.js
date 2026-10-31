const router = require('express').Router();

const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/auth');
const { applyVendorSchema, updateVendorSchema } = require('../validators/vendorValidator');
const { apply, getMyVendor, updateMyVendor } = require('../controllers/vendorController');

router.post('/apply', protect, validate(applyVendorSchema), apply);
router.get('/me', protect, getMyVendor);
router.patch('/me', protect, restrictTo('vendor'), validate(updateVendorSchema), updateMyVendor);

module.exports = router;