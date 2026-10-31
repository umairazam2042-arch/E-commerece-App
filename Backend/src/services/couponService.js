const Coupon = require('../models/Coupon');
const CouponUsage = require('../models/CouponUsage');
const Cart = require('../models/Cart');
const AppError = require('../utils/AppError');

const calculateDiscount = (coupon, subtotal) => {
  let discount =
    coupon.type === 'percent'
      ? Math.floor((subtotal * coupon.value) / 100)
      : coupon.value;

  if (coupon.type === 'percent' && coupon.maxDiscount) {
    discount = Math.min(discount, coupon.maxDiscount);
  }

  return Math.min(discount, subtotal);
};

// Coupon ki tamam shartein check karta hai aur discount nikalta hai
const validateCoupon = async ({ code, userId, subtotal }) => {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) throw new AppError('Coupon code galat hai', 404);

  const now = new Date();
  if (!coupon.isActive) throw new AppError('Ye coupon abhi active nahi hai', 400);
  if (now < coupon.validFrom) throw new AppError('Coupon abhi start nahi hua', 400);
  if (now > coupon.validTo) throw new AppError('Coupon ki muddat khatam ho chuki hai', 400);

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new AppError('Coupon ki limit khatam ho gayi', 400);
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new AppError(
      `Is coupon ke liye minimum order ${coupon.minOrderAmount / 100} PKR hona chahiye`,
      400
    );
  }

  const usedByUser = await CouponUsage.countDocuments({ coupon: coupon._id, user: userId });
  if (usedByUser >= coupon.perUserLimit) {
    throw new AppError('Aap ye coupon pehle hi use kar chuke hain', 400);
  }

  return { coupon, discount: calculateDiscount(coupon, subtotal) };
};

// Customer ke cart par coupon preview (checkout se pehle)
const previewForCart = async ({ userId, code }) => {
  const cart = await Cart.findOne({ user: userId }).populate('items.product', 'price');

  const subtotal = (cart?.items || []).reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  if (!subtotal) throw new AppError('Cart khali hai', 400);

  const { coupon, discount } = await validateCoupon({ code, userId, subtotal });

  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    subtotal,
    discount,
    payable: subtotal - discount,
  };
};

// Order ban jane ke baad usage record karta hai (atomic limit check ke saath)
const consumeUsage = async ({ couponId, userId, orderId }) => {
  const updated = await Coupon.findOneAndUpdate(
    {
      _id: couponId,
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    },
    { $inc: { usedCount: 1 } },
    { new: true }
  );

  if (!updated) throw new AppError('Coupon ki limit khatam ho gayi', 409);

  await CouponUsage.create({ coupon: couponId, user: userId, order: orderId });
};

// Order cancel hone par usage wapas karta hai
const releaseUsage = async ({ couponId, orderId }) => {
  const deleted = await CouponUsage.findOneAndDelete({ coupon: couponId, order: orderId });
  if (deleted) {
    await Coupon.updateOne({ _id: couponId }, { $inc: { usedCount: -1 } });
  }
};

// ---------- ADMIN ----------

const createCoupon = (data) => Coupon.create({ ...data, code: data.code });

const listCoupons = async ({ page, limit, isActive }) => {
  const filter = {};
  if (isActive !== undefined) filter.isActive = isActive;

  const [items, total] = await Promise.all([
    Coupon.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Coupon.countDocuments(filter),
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
};

const getCoupon = async (id) => {
  const coupon = await Coupon.findById(id).lean();
  if (!coupon) throw new AppError('Coupon not found', 404);
  return coupon;
};

const updateCoupon = async (id, data) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);

  if (coupon.usedCount > 0 && data.code && data.code !== coupon.code) {
    throw new AppError('Use ho chuke coupon ka code change nahi ho sakta', 409);
  }

  Object.assign(coupon, data);

  if (coupon.validTo <= coupon.validFrom) {
    throw new AppError('validTo, validFrom ke baad honi chahiye', 400);
  }
  if (coupon.type === 'percent' && coupon.value > 100) {
    throw new AppError('Percent 100 se zyada nahi ho sakta', 400);
  }

  await coupon.save();
  return coupon;
};

const deleteCoupon = async (id) => {
  const coupon = await Coupon.findById(id);
  if (!coupon) throw new AppError('Coupon not found', 404);

  if (coupon.usedCount > 0) {
    throw new AppError('Use ho chuka coupon delete nahi ho sakta, isActive false karein', 409);
  }

  await coupon.deleteOne();
};

module.exports = {
  validateCoupon,
  previewForCart,
  consumeUsage,
  releaseUsage,
  createCoupon,
  listCoupons,
  getCoupon,
  updateCoupon,
  deleteCoupon,
};