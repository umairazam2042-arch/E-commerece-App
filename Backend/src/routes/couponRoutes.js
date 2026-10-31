const router = require('express').Router();
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const ctrl = require('../controllers/couponController');
const {
  createCouponSchema,
  updateCouponSchema,
  validateCouponSchema,
} = require('../validators/couponValidator');

// Customer
router.post('/coupons/validate', protect, validate(validateCouponSchema), ctrl.preview);

// Admin
router.use('/admin/coupons', protect, restrictTo('admin'));
router.post('/admin/coupons', validate(createCouponSchema), ctrl.create);
router.get('/admin/coupons', ctrl.list);
router.get('/admin/coupons/:id', ctrl.getOne);
router.patch('/admin/coupons/:id', validate(updateCouponSchema), ctrl.update);
router.delete('/admin/coupons/:id', ctrl.remove);

module.exports = router;