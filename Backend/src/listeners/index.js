const appEvents = require('../utils/events');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');
const notificationService = require('../services/notificationService');

const getVendorUserId = async (vendorId) => {
  const vendor = await Vendor.findById(vendorId).select('user').lean();
  return vendor?.user;
};

const money = (paisa) => `Rs ${(paisa / 100).toLocaleString('en-PK')}`;

// Step 10: naya review aaya
appEvents.on('review:created', async ({ productId, reviewId, rating }) => {
  try {
    const product = await Product.findById(productId).select('title vendor').lean();
    if (!product) return;

    const vendorUserId = await getVendorUserId(product.vendor);
    if (!vendorUserId) return;

    await notificationService.notify({
      recipientId: vendorUserId,
      type: 'review_created',
      title: 'Naya review',
      message: `"${product.title}" par ${rating} star ka naya review aaya hai.`,
      data: { productId, reviewId },
      email: true,
    });
  } catch (err) {
    console.error('review:created listener error:', err.message);
  }
});

// Step 9: stock threshold se neeche gaya
appEvents.on('stock:low', async ({ productId, vendorId, title, stock, threshold }) => {
  try {
    const vendorUserId = await getVendorUserId(vendorId);
    if (!vendorUserId) return;

    await notificationService.notify({
      recipientId: vendorUserId,
      type: 'stock_low',
      title: 'Stock kam hai',
      message: `"${title}" ka stock ${stock} reh gaya hai (threshold: ${threshold}).`,
      data: { productId, stock, threshold },
      email: true,
    });
  } catch (err) {
    console.error('stock:low listener error:', err.message);
  }
});

// Naya order aaya
appEvents.on('order:placed', async ({ orderId, orderNumber, subOrderId, vendorId, itemCount, subtotal, paymentMethod }) => {
  try {
    const vendorUserId = await getVendorUserId(vendorId);
    if (!vendorUserId) return;

    const payNote = paymentMethod === 'cod' ? 'Cash on Delivery' : 'Stripe (payment ka intezar)';
    await notificationService.notify({
      recipientId: vendorUserId,
      type: 'order_update',
      title: 'Naya order aaya',
      message: `Order ${orderNumber} mein aap ke ${itemCount} product hain. Total: ${money(subtotal)}. Payment: ${payNote}.`,
      data: { orderId, subOrderId, kind: 'new_order' },
      email: true,
    });
  } catch (err) {
    console.error('order:placed listener error:', err.message);
  }
});

// Stripe payment confirm hui
appEvents.on('order:paid', async ({ orderId, orderNumber, subOrderId, vendorId }) => {
  try {
    const vendorUserId = await getVendorUserId(vendorId);
    if (!vendorUserId) return;

    await notificationService.notify({
      recipientId: vendorUserId,
      type: 'payment_update',
      title: 'Payment mil gayi',
      message: `Order ${orderNumber} ki payment confirm ho gayi hai. Ab aap is order ko process kar sakte hain.`,
      data: { orderId, subOrderId, kind: 'paid' },
      email: true,
    });
  } catch (err) {
    console.error('order:paid listener error:', err.message);
  }
});

// Buyer ne order cancel kiya
appEvents.on('order:cancelled', async ({ orderId, orderNumber, subOrderId, vendorId }) => {
  try {
    const vendorUserId = await getVendorUserId(vendorId);
    if (!vendorUserId) return;

    await notificationService.notify({
      recipientId: vendorUserId,
      type: 'order_update',
      title: 'Order cancel hua',
      message: `Buyer ne order ${orderNumber} cancel kar diya hai. Stock wapas aa gaya hai.`,
      data: { orderId, subOrderId, kind: 'cancelled' },
      email: true,
    });
  } catch (err) {
    console.error('order:cancelled listener error:', err.message);
  }
});

// Customer ko order place hone ka notification, cancel ki aakhri time ke saath
appEvents.on('order:buyerPlaced', async ({ orderId, orderNumber, customerId, deadline }) => {
  try {
    const until = new Date(deadline).toLocaleString('en-PK', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });

    await notificationService.notify({
      recipientId: customerId,
      type: 'order_update',
      title: 'Aap ka order place ho gaya',
      message: `Order ${orderNumber} place ho gaya hai. Aap ${until} tak is ko cancel kar sakte hain.`,
      data: { orderId, kind: 'buyer_placed', deadline },
      email: true,
    });
  } catch (err) {
    console.error('order:buyerPlaced listener error:', err.message);
  }
});

// Customer ko cancel ki confirmation
appEvents.on('order:buyerCancelled', async ({ orderId, orderNumber, customerId }) => {
  try {
    await notificationService.notify({
      recipientId: customerId,
      type: 'order_update',
      title: 'Order cancel ho gaya',
      message: `Order ${orderNumber} cancel kar diya gaya hai. Agar payment ki thi to refund process hoga.`,
      data: { orderId, kind: 'buyer_cancelled' },
      email: true,
    });
  } catch (err) {
    console.error('order:buyerCancelled listener error:', err.message);
  }
});

module.exports = {};