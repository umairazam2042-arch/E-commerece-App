const Vendor = require('../models/Vendor');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const AppError = require('../utils/AppError');
const { restoreStock } = require('./stockService');
const { releaseOrder, refundSubOrderShare } = require('./orderService');

const TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

const getVendorOrThrow = async (userId) => {
  const vendor = await Vendor.findOne({ user: userId });
  if (!vendor) {
    throw new AppError('Vendor profile not found', 404);
  }
  return vendor;
};

// Sub-orders ke status ke hisaab se poore order ka status set karta hai
const refreshOrderStatus = async (orderId) => {
  const subs = await SubOrder.find({ order: orderId }, 'status');
  const statuses = subs.map((s) => s.status);

  if (statuses.every((s) => s === 'cancelled')) {
    const order = await Order.findById(orderId);
    await releaseOrder(order);
    return;
  }

  const status = statuses.every((s) => s === 'delivered' || s === 'cancelled')
    ? 'delivered'
    : 'processing';

  const update = { status };
  if (status === 'delivered') update.paymentStatus = 'paid'; // COD: delivery par paisa mila
  await Order.updateOne({ _id: orderId }, update);
};

const listVendorSubOrders = async (userId, { status, page, limit }) => {
  const vendor = await getVendorOrThrow(userId);
  const filter = { vendor: vendor._id };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    SubOrder.find(filter)
      .populate({
        path: 'order',
        select: 'orderNumber shippingAddress paymentStatus paymentMethod createdAt customer',
        populate: { path: 'customer', select: 'name email' },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    SubOrder.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const updateVendorSubOrderStatus = async (userId, subOrderId, nextStatus) => {
  const vendor = await getVendorOrThrow(userId);
  const sub = await SubOrder.findOne({ _id: subOrderId, vendor: vendor._id });
  if (!sub) {
    throw new AppError('Sub-order not found', 404);
  }

  const order = await Order.findById(sub.order);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  // Cancel par payment check nahi, taake unpaid order bhi cancel ho sake
  if (
    nextStatus !== 'cancelled' &&
    order.paymentMethod === 'stripe' &&
    order.paymentStatus !== 'paid'
  ) {
    throw new AppError('Payment has not been received yet', 409);
  }

  if (!TRANSITIONS[sub.status].includes(nextStatus)) {
    throw new AppError(`Cannot change status from ${sub.status} to ${nextStatus}`, 400);
  }

  if (nextStatus === 'cancelled') {
    // Pehle refund (agar Stripe se paid hai), phir stock wapas
    if (order.paymentMethod === 'stripe' && order.paymentStatus === 'paid' && order.paymentIntentId) {
      await refundSubOrderShare(order, sub);
    }
    await restoreStock(sub.items, {
      vendorId: sub.vendor,
      reason: `Vendor ne cancel kiya (${order.orderNumber})`,
    });
  }

  sub.status = nextStatus;
  await sub.save();
  await refreshOrderStatus(sub.order);

  return sub;
};

module.exports = { listVendorSubOrders, updateVendorSubOrderStatus };