const router = require('express').Router();
const { protect, restrictTo } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const ctrl = require('../controllers/inventoryController');
const {
  adjustStockSchema,
  bulkStockSchema,
  thresholdSchema,
} = require('../validators/inventoryValidator');

router.use(protect, restrictTo('vendor'));

router.get('/low-stock', ctrl.lowStock);
router.put('/bulk', validate(bulkStockSchema), ctrl.bulkUpdate);
router.patch('/products/:productId/stock', validate(adjustStockSchema), ctrl.adjustStock);
router.patch('/products/:productId/threshold', validate(thresholdSchema), ctrl.setThreshold);
router.get('/products/:productId/movements', ctrl.listMovements);

module.exports = router;