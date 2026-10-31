const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ['percent', 'fixed'], required: true },
    value: { type: Number, required: true, min: 1 }, // percent ho to 1-100, fixed ho to paisa
    minOrderAmount: { type: Number, default: 0, min: 0 }, // paisa
    maxDiscount: { type: Number, min: 0 }, // sirf percent ke liye, paisa
    usageLimit: { type: Number, min: 1, default: null }, // null ka matlab unlimited
    usedCount: { type: Number, default: 0, min: 0 },
    perUserLimit: { type: Number, default: 1, min: 1 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ isActive: 1, validTo: 1 });

module.exports = mongoose.model('Coupon', couponSchema);