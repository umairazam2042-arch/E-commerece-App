const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const vendorService = require('../services/vendorService');
const { listVendorsQuerySchema } = require('../validators/vendorValidator');

// ----- Customer / Vendor -----

const apply = asyncHandler(async (req, res) => {
  const vendor = await vendorService.applyForVendor(req.user._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Application submitted, waiting for admin approval',
    data: { vendor },
  });
});

const getMyVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.getMyVendor(req.user._id);
  res.json({ success: true, data: { vendor } });
});

const updateMyVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.updateMyVendor(req.user._id, req.body);
  res.json({ success: true, message: 'Store profile updated', data: { vendor } });
});

// ----- Admin -----

const listVendorApplications = asyncHandler(async (req, res) => {
  const parsed = listVendorsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    throw new AppError(parsed.error.issues[0].message, 400);
  }

  const result = await vendorService.listApplications(parsed.data);
  res.json({ success: true, data: result });
});

const approveVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.approveVendor(req.params.id, req.user._id);
  res.json({ success: true, message: 'Vendor approved', data: { vendor } });
});

const rejectVendor = asyncHandler(async (req, res) => {
  const vendor = await vendorService.rejectVendor(req.params.id, req.user._id, req.body.reason);
  res.json({ success: true, message: 'Vendor application rejected', data: { vendor } });
});

module.exports = {
  apply,
  getMyVendor,
  updateMyVendor,
  listVendorApplications,
  approveVendor,
  rejectVendor,
};