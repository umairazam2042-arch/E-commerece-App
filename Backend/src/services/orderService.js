const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const AppError = require('../utils/AppError');
const appEvents = require('../utils/events');
const currencyService = require('./currencyService');
const couponService = require('./couponService');
const { restoreStock, reserveStock, saveMovements } = require('./stockService');
const { createPaymentIntent, refundPayment } = require('../config/stripe');
const {
  CURRENCY,
  COMMISSION_RATE,
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  CANCEL_WINDOW_HOURS,
} = require('../config/platform');

const generateOrderNumber = () =>
  `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

// Customer order cancel kar sakta hai: order banne ke CANCEL_WINDOW_HOURS tak
const cancelDeadlineOf = (order) =>
  new Date(new Date(order.createdAt).getTime() + CANCEL_WINDOW_HOURS * 60 * 60 * 1000);

// Shipped ya delivered hone ke baad cancel nahi, aur muddat khatam hone ke baad bhi nahi
const canBuyerCancel = (order, subOrders) => {
  if (['cancelled', 'delivered'].includes(order.status)) return false;
  if (Date.now() > cancelDeadlineOf(order).getTime()) return false;
  if (subOrders.some((s) => s.status === 'shipped' || s.status === 'delivered')) return false;
  return subOrders.some((s) => s.status !== 'cancelled');
};

// Vendor ki cancel hui sub-order ka hissa Stripe se wapas karta hai
const refundSubOrderShare = async (order, sub) => {
  const share = Math.round((order.displayTotal * sub.subtotal) / order.subtotal);
  const remaining = order.displayTotal - (order.refundedAmount || 0);
  const amount = Math.min(share, remaining);
  if (amount <= 0) return;

  await refundPayment(order.paymentIntentId, amount);
  order.refundedAmount = (order.refundedAmount || 0) + amount;
  await order.save();
};

// Order poora cancel: stock wapas, sub-orders cancel, baaqi refund, coupon wapas
const releaseOrder = async (order) => {
  const open = await SubOrder.find({ order: order._id, status: { $ne: 'cancelled' } });
  for (const sub of open) {
    await restoreStock(sub.items, {
      vendorId: sub.vendor,
      reason: `Order ${order.orderNumber} cancel hua`,
    });
  }
  await SubOrder.updateMany({ order: order._id }, { status: 'cancelled' });

  if (order.paymentStatus === 'paid' && order.paymentMethod === 'stripe' && order.paymentIntentId) {
    const remaining = order.displayTotal - (order.refundedAmount || 0);
    if (remaining > 0) await refundPayment(order.paymentIntentId, remaining);
    order.refundedAmount = order.displayTotal;
    order.paymentStatus = 'refunded';
  }

  if (order.coupon) {
    await couponService.releaseUsage({ couponId: order.coupon, orderId: order._id });
  }

  order.status = 'cancelled';
  await order.save();
};

// ----- Customer -----

const checkout = async (
  userId,
  { paymentMethod, currency, shippingAddress, couponCode },
  directItems = null
) => {
  if (paymentMethod === 'cod' && currency !== CURRENCY) {
    throw new AppError('Cash on delivery is available only in PKR', 400);
  }

  // directItems aaye to (buy-now) cart ko chhuya nahi jata
  let cart = null;
  let sourceItems = directItems;
  if (!sourceItems) {
    cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cart is empty', 400);
    }
    sourceItems = cart.items;
  }

  const problems = [];
  const lines = [];

  for (const item of sourceItems) {
    const p = item.product;
    if (!p || p.status !== 'published') {
      problems.push('Some products are no longer available');
      continue;
    }
    if (p.stock < item.quantity) {
      problems.push(`Only ${p.stock} of "${p.title}" left in stock`);
      continue;
    }
    lines.push({
      product: p._id,
      vendor: p.vendor,
      title: p.title,
      price: p.price,
      quantity: item.quantity,
      lineTotal: p.price * item.quantity,
    });
  }

  if (problems.length) {
    throw new AppError(problems.join('; '), 400);
  }

  const rate = await currencyService.getRate(currency);
  const subtotal = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  // Coupon stock kam karne se PEHLE check hota hai
  let coupon = null;
  let discount = 0;
  if (couponCode) {
    ({ coupon, discount } = await couponService.validateCoupon({
      code: couponCode,
      userId,
      subtotal,
    }));
  }

  const orderNumber = generateOrderNumber();
  const movements = await reserveStock(lines, {
    reason: `Order ${orderNumber}`,
    actorId: userId,
  });

  const shippingFee = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal - discount + shippingFee;
  const displayTotal = currencyService.toMinorUnits(total, rate.rate);

  let order = null;
  try {
    order = await Order.create({
      orderNumber,
      customer: userId,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending',
      currency: CURRENCY,
      subtotal,
      shippingFee,
      total,
      displayCurrency: rate.currency,
      exchangeRate: rate.rate,
      displayTotal,
      coupon: coupon?._id,
      couponCode: coupon?.code,
      discount,
    });

    if (coupon) {
      await couponService.consumeUsage({ couponId: coupon._id, userId, orderId: order._id });
    }

    const groups = new Map();
    for (const line of lines) {
      const key = line.vendor.toString();
      if (!groups.has(key)) groups.set(key, { vendor: line.vendor, items: [] });
      groups.get(key).items.push(line);
    }

    const subOrders = [...groups.values()].map((group) => {
      const subSubtotal = group.items.reduce((sum, i) => sum + i.lineTotal, 0);
      const commissionAmount = Math.round((subSubtotal * COMMISSION_RATE) / 100);
      return {
        order: order._id,
        vendor: group.vendor,
        items: group.items,
        subtotal: subSubtotal,
        commissionRate: COMMISSION_RATE,
        commissionAmount,
        vendorEarning: subSubtotal - commissionAmount,
      };
    });
    const createdSubs = await SubOrder.insertMany(subOrders);

    let clientSecret = null;
    if (paymentMethod === 'stripe') {
      const intent = await createPaymentIntent({
        amount: displayTotal,
        currency: rate.currency,
        metadata: { orderId: String(order._id), orderNumber: order.orderNumber },
      });
      order.paymentIntentId = intent.id;
      await order.save();
      clientSecret = intent.client_secret;
    }

    await saveMovements(movements);

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    // Har vendor ko naye order ki notification
    createdSubs.forEach((sub) =>
      appEvents.emit('order:placed', {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        subOrderId: String(sub._id),
        vendorId: String(sub.vendor),
        itemCount: sub.items.length,
        subtotal: sub.subtotal,
        paymentMethod,
      })
    );

    // Customer ko order ki notification, cancel ki aakhri time ke saath
    appEvents.emit('order:buyerPlaced', {
      orderId: String(order._id),
      orderNumber: order.orderNumber,
      customerId: String(userId),
      deadline: cancelDeadlineOf(order).toISOString(),
    });

    return { order, clientSecret };
  } catch (err) {
    await restoreStock(lines, { log: false });
    if (order) {
      await SubOrder.deleteMany({ order: order._id });
      await Order.deleteOne({ _id: order._id });
    }
    if (coupon && order) {
      await couponService.releaseUsage({ couponId: coupon._id, orderId: order._id });
    }
    throw err;
  }
};

// Ek product seedha khareedna (cart ko touch kiye baghair)
const buyNow = async (userId, { productId, quantity, ...rest }) => {
  const product = await Product.findOne({ _id: productId, status: 'published' });
  if (!product) {
    throw new AppError('Product not found or not available', 404);
  }
  return checkout(userId, rest, [{ product, quantity }]);
};

const listMyOrders = async (userId, { page, limit, status }) => {
  const filter = { customer: userId };
  if (status) filter.status = status;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// Order ki detail, saath mein cancel ki halat (allowed aur aakhri time)
const getMyOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const subOrders = await SubOrder.find({ order: order._id }).populate(
    'vendor',
    'storeName storeSlug'
  );

  return {
    order,
    subOrders,
    cancel: {
      allowed: canBuyerCancel(order, subOrders),
      deadline: cancelDeadlineOf(order),
    },
  };
};

const cancelMyOrder = async (userId, orderId) => {
  const order = await Order.findOne({ _id: orderId, customer: userId });
  if (!order) {
    throw new AppError('Order not found', 404);
  }
  if (order.status === 'cancelled' || order.status === 'delivered') {
    throw new AppError(`Order is already ${order.status}`, 409);
  }
  if (Date.now() > cancelDeadlineOf(order).getTime()) {
    throw new AppError(`Cancel ki muddat (${CANCEL_WINDOW_HOURS} ghante) khatam ho chuki hai`, 409);
  }

  const subOrders = await SubOrder.find({ order: order._id });
  if (subOrders.some((s) => s.status === 'shipped' || s.status === 'delivered')) {
    throw new AppError('Order ship ho chuka hai, ab cancel nahi ho sakta', 409);
  }

  await releaseOrder(order);

  // Vendors ko batana ke buyer ne cancel kiya
  subOrders
    .filter((s) => s.status !== 'cancelled')
    .forEach((sub) =>
      appEvents.emit('order:cancelled', {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
        subOrderId: String(sub._id),
        vendorId: String(sub.vendor),
      })
    );

  // Customer ko confirmation
  appEvents.emit('order:buyerCancelled', {
    orderId: String(order._id),
    orderNumber: order.orderNumber,
    customerId: String(userId),
  });

  return order;
};

module.exports = {
  checkout,
  buyNow,
  listMyOrders,
  getMyOrder,
  cancelMyOrder,
  releaseOrder,
  refundSubOrderShare,
};