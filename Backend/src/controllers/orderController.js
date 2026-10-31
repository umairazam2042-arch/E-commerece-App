const asyncHandler = require('../utils/asyncHandler');
const orderService = require('../services/orderService');
const vendorOrderService = require('../services/vendorOrderService');

const parsePage = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  return { page, limit, status: query.status };
};

// ----- Customer -----

const checkout = asyncHandler(async (req, res) => {
  const { order, clientSecret } = await orderService.checkout(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Order placed',
    data: { order, clientSecret },
  });
});

const buyNow = asyncHandler(async (req, res) => {
  const { order, clientSecret } = await orderService.buyNow(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Order placed',
    data: { order, clientSecret },
  });
});

const myOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = parsePage(req.query);
  const result = await orderService.listMyOrders(req.user._id, { page, limit, status });
  res.json({ success: true, data: result });
});

const myOrder = asyncHandler(async (req, res) => {
  const result = await orderService.getMyOrder(req.user._id, req.params.id);
  res.json({ success: true, data: result });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelMyOrder(req.user._id, req.params.id);
  res.json({ success: true, message: 'Order cancelled', data: { order } });
});

// ----- Vendor -----

const vendorOrders = asyncHandler(async (req, res) => {
  const parsed = parsePage(req.query);
  const result = await vendorOrderService.listVendorSubOrders(req.user._id, parsed);
  res.json({ success: true, data: result });
});

const updateVendorStatus = asyncHandler(async (req, res) => {
  const sub = await vendorOrderService.updateVendorSubOrderStatus(
    req.user._id,
    req.params.id,
    req.body.status
  );
  res.json({ success: true, message: 'Status updated', data: { subOrder: sub } });
});

module.exports = {
  checkout,
  buyNow,
  myOrders,
  myOrder,
  cancelOrder,
  vendorOrders,
  updateVendorStatus,
};