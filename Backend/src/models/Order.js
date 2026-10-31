const mongoose = require('mongoose');

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    addressLine: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, trim: true, default: 'Pakistan' },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    shippingAddress: { type: shippingAddressSchema, required: true },

    coupon: { type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    discount: { type: Number, default: 0, min: 0 },

    paymentMethod: { type: String, enum: ['cod', 'stripe'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentIntentId: { type: String, unique: true, sparse: true },
    // Display currency mein ab tak kitna refund ho chuka hai
    refundedAmount: { type: Number, default: 0, min: 0 },

    status: {
      type: String,
      enum: ['pending', 'processing', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // Base amounts PKR paisa mein
    currency: { type: String, default: 'PKR' },
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    // Customer ko jo currency dikhai/charge ki gayi
    displayCurrency: { type: String, default: 'PKR' },
    exchangeRate: { type: Number, default: 1 },
    displayTotal: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);