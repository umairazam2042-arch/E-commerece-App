const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const Vendor = require('../models/Vendor');
const analyticsService = require('../services/analyticsService');
const { analyticsQuerySchema } = require('../validators/analyticsValidator');

const getVendorId = async (req) => {
  const vendor = await Vendor.findOne({ user: req.user._id, status: 'approved' })
    .select('_id')
    .lean();
  if (!vendor) throw new AppError('Approved vendor profile not found', 403);
  return vendor._id;
};

const parseQuery = (req) => {
  const parsed = analyticsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);
  return parsed.data;
};

// GET /vendor/analytics/summary?from=2026-10-01&to=2026-10-17
exports.vendorSummary = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);
  const { from, to } = parseQuery(req);
  const data = await analyticsService.vendorSummary({ vendorId, from, to });
  res.json({ success: true, data });
});

// GET /vendor/analytics/daily?from=...&to=...
exports.vendorDaily = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);
  const { from, to } = parseQuery(req);
  const data = await analyticsService.vendorDaily({ vendorId, from, to });
  res.json({ success: true, data });
});

// GET /vendor/analytics/top-products?limit=5
exports.vendorTopProducts = asyncHandler(async (req, res) => {
  const vendorId = await getVendorId(req);
  const { from, to, limit } = parseQuery(req);
  const data = await analyticsService.vendorTopProducts({ vendorId, from, to, limit });
  res.json({ success: true, data });
});

// GET /admin/analytics/overview?from=...&to=...
exports.adminOverview = asyncHandler(async (req, res) => {
  const { from, to } = parseQuery(req);
  const data = await analyticsService.platformOverview({ from, to });
  res.json({ success: true, data });
});

// GET /admin/analytics/commission?from=...&to=...&page=1&limit=10
exports.adminCommission = asyncHandler(async (req, res) => {
  const { from, to, page, limit } = parseQuery(req);
  const data = await analyticsService.commissionReport({ from, to, page, limit });
  res.json({ success: true, data });
});