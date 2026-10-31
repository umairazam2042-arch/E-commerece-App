const Order = require('../models/Order');
const SubOrder = require('../models/SubOrder');
const AppError = require('../utils/AppError');

// Admin sab orders dekh sakta hai. Filter: status, customer, ya vendor.
const listAdminOrders = async ({ page, limit, status, customer, vendor }) => {
  const filter = {};
  if (status) filter.status = status;
  if (customer) filter.customer = customer;
  if (vendor) {
    filter._id = { $in: await SubOrder.distinct('order', { vendor }) };
  }

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Order.find(filter)
      .populate('customer', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

// Ek order ki poori detail: buyer, address, items, aur har vendor ka sub-order
const getAdminOrder = async (id) => {
  const order = await Order.findById(id).populate('customer', 'name email').lean();
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  const subOrders = await SubOrder.find({ order: id })
    .populate('vendor', 'storeName storeSlug')
    .lean();

  return { order, subOrders };
};

module.exports = { listAdminOrders, getAdminOrder };