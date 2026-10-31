const router = require('express').Router();
const vendorInventoryRoutes = require('./vendorInventoryRoutes');
const reviewRoutes = require('./reviewRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const searchRoutes = require('./searchRoutes');
const couponRoutes = require('./couponRoutes');

router.get('/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

router.use('/auth', require('./authRoutes'));
router.use('/vendors', require('./vendorRoutes'));
router.use('/admin', require('./adminRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/products', require('./productRoutes'));
router.use('/vendor/products', require('./vendorProductRoutes'));
router.use('/vendor/uploads', require('./vendorUploadRoutes'));
router.use('/vendor/orders', require('./vendorOrderRoutes'));
router.use('/cart', require('./cartRoutes'));
router.use('/wishlist', require('./wishlistRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/payments', require('./paymentRoutes'));
router.use('/vendor/inventory', vendorInventoryRoutes);
router.use('/', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', analyticsRoutes);
router.use('/', couponRoutes);
router.use('/', searchRoutes);

module.exports = router;