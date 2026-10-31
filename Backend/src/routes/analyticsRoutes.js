const router = require('express').Router();
const { protect, restrictTo } = require('../middlewares/auth');
const ctrl = require('../controllers/analyticsController');

// Vendor
router.get('/vendor/analytics/summary', protect, restrictTo('vendor'), ctrl.vendorSummary);
router.get('/vendor/analytics/daily', protect, restrictTo('vendor'), ctrl.vendorDaily);
router.get('/vendor/analytics/top-products', protect, restrictTo('vendor'), ctrl.vendorTopProducts);

// Admin
router.get('/admin/analytics/overview', protect, restrictTo('admin'), ctrl.adminOverview);
router.get('/admin/analytics/commission', protect, restrictTo('admin'), ctrl.adminCommission);

module.exports = router;