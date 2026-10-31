const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Vendor = require('../models/Vendor');
const inventoryService = require('../services/inventoryService');
const { movementsQuerySchema } = require('../validators/inventoryValidator');

const getVendorId = async (req) => {
  const vendor = await Vendor.findOne({ user: req.user._id, status: 'approved' })
    .select('_id')
    .lean();
  if (!vendor) throw new AppError('Approved vendor profile not found', 403);
  return vendor._id;
};

// PATCH /vendor/inventory/products/:productId/stock
exports.adjustStock = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);
  const { change, type, reason } = req.body;

  const result = await inventoryService.adjustStock({
    vendorId,
    productId: req.params.productId,
    change,
    type,
    reason,
    actorId: req.user._id,
  });

  res.json({ success: true, data: result });
});

// PATCH /vendor/inventory/products/:productId/threshold
exports.setThreshold = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);

  const product = await inventoryService.setThreshold({
    vendorId,
    productId: req.params.productId,
    lowStockThreshold: req.body.lowStockThreshold,
  });

  res.json({ success: true, data: product });
});

// PUT /vendor/inventory/bulk
exports.bulkUpdate = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);

  const result = await inventoryService.bulkUpdateStock({
    vendorId,
    updates: req.body.updates,
    actorId: req.user._id,
  });

  res.json({ success: true, data: result });
});

// GET /vendor/inventory/low-stock
exports.lowStock = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);
  const items = await inventoryService.getLowStock(vendorId);
  res.json({ success: true, count: items.length, data: items });
});

// GET /vendor/inventory/products/:productId/movements?page=1&limit=20&type=sale
exports.listMovements = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);

  const parsed = movementsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const result = await inventoryService.listMovements({
    vendorId,
    productId: req.params.productId,
    ...parsed.data,
  });

  res.json({ success: true, data: result });
});