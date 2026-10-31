const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 100, default: '' },
    comment: { type: String, trim: true, maxlength: 1000, default: '' },
    isVerifiedPurchase: { type: Boolean, default: false },
    vendorReply: {
      text: { type: String, trim: true, maxlength: 500 },
      repliedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Ek user ek product par sirf ek review de sakta hai
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, createdAt: -1 });
reviewSchema.index({ product: 1, rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);