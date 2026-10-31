const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const adminOrderService = require('../services/adminOrderService');
const { adminOrdersQuerySchema } = require('../validators/adminOrderValidator');

const listAdminOrders = asyncHandler(async (req, res) => {
  const parsed = adminOrdersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const result = await adminOrderService.listAdminOrders(parsed.data);
  res.json({ success: true, data: result });
});

const getAdminOrder = asyncHandler(async (req, res) => {
  const result = await adminOrderService.getAdminOrder(req.params.id);
  res.json({ success: true, data: result });
});

module.exports = { listAdminOrders, getAdminOrder };