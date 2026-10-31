const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const appEvents = require('../utils/events');
const { releaseOrder } = require('./orderService');

// Stripe webhook events. Har event ek se zyada dafa aa sakta hai, is liye idempotent hai.
const handleWebhookEvent = async (event) => {
  const intent = event.data.object;
  const order = await Order.findOne({ paymentIntentId: intent.id });
  if (!order) return;

  if (event.type === 'payment_intent.succeeded') {
    if (order.paymentStatus === 'paid') return;

    order.paymentStatus = 'paid';
    if (order.status === 'pending') order.status = 'processing';
    await order.save();

    // Har vendor ko batana ke payment mil gayi
    const subs = await SubOrder.find({ order: order._id }).select('vendor');
    subs.forEach((sub) =>
      appEvents.emit('order:paid', {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        subOrderId: String(sub._id),
        vendorId: String(sub.vendor),
      })
    );
    return;
  }

  if (event.type === 'payment_intent.payment_failed') {
    if (order.paymentStatus !== 'pending') return;

    order.paymentStatus = 'failed';
    await order.save();
    await releaseOrder(order); // stock wapas, order cancel
  }
};

module.exports = { handleWebhookEvent };