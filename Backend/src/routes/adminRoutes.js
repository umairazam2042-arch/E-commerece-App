const router = require('express').Router();

const validate = require('../middlewares/validate');
const { protect, restrictTo } = require('../middlewares/auth');
const { rejectVendorSchema } = require('../validators/vendorValidator');
const { createCategorySchema, updateCategorySchema } = require('../validators/categoryValidator');
const { exchangeRateSchema } = require('../validators/exchangeRateValidator');
const {
  listVendorApplications,
  approveVendor,
  rejectVendor,
} = require('../controllers/vendorController');
const {
  listAll,
  create,
  update,
  remove,
} = require('../controllers/categoryController');
const {
  listRates,
  upsertRate,
} = require('../controllers/exchangeRateController');
const { listAdminOrders, getAdminOrder } = require('../controllers/adminOrderController');

// Saare admin routes sirf admin ke liye
router.use(protect, restrictTo('admin'));

// Vendors
router.get('/vendors', listVendorApplications);
router.patch('/vendors/:id/approve', approveVendor);
router.patch('/vendors/:id/reject', validate(rejectVendorSchema), rejectVendor);

// Categories
router.get('/categories', listAll);
router.post('/categories', validate(createCategorySchema), create);
router.patch('/categories/:id', validate(updateCategorySchema), update);
router.delete('/categories/:id', remove);

// Exchange rates
router.get('/exchange-rates', listRates);
router.post('/exchange-rates', validate(exchangeRateSchema), upsertRate);

// Orders (sab customers aur vendors ke)
router.get('/orders', listAdminOrders);
router.get('/orders/:id', getAdminOrder);

module.exports = router;