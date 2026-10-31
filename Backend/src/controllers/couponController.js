const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const couponService = require('../services/couponService');
const { listCouponsQuerySchema } = require('../validators/couponValidator');

// POST /coupons/validate  (customer, body: { code })
exports.preview = asyncHandler(async (req, res) => {
  const data = await couponService.previewForCart({
    userId: req.user._id,
    code: req.body.code,
  });
  res.json({ success: true, data });
});

// POST /admin/coupons
exports.create = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  res.status(201).json({ success: true, data: coupon });
});

// GET /admin/coupons?page=1&limit=20&isActive=true
exports.list = asyncHandler(async (req, res) => {
  const parsed = listCouponsQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new AppError(parsed.error.issues[0].message, 400);

  const data = await couponService.listCoupons(parsed.data);
  res.json({ success: true, data });
});

// GET /admin/coupons/:id
exports.getOne = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCoupon(req.params.id);
  res.json({ success: true, data: coupon });
});

// PATCH /admin/coupons/:id
exports.update = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  res.json({ success: true, data: coupon });
});

// DELETE /admin/coupons/:id
exports.remove = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  res.json({ success: true, message: 'Coupon deleted' });
});