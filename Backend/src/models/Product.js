const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 120 },
    description: { type: String, required: true, trim: true, minlength: 10, maxlength: 5000 },
    // Price paisay mein (Rs 2500 = 250000)
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: 'Price must be a whole number (paisay)' },
    },
    sku: { type: String, trim: true, uppercase: true, maxlength: 40, unique: true, sparse: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5, min: 0 },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    images: {
      type: [String],
      default: [],
      validate: { validator: (arr) => arr.length <= 5, message: 'Maximum 5 images allowed' },
    },
    status: { type: String, enum: ['draft', 'published'], default: 'draft', index: true },
  },
  { timestamps: true }
);

// Search ke liye text index
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ vendor: 1, stock: 1 });
const { bumpVersion } = require('../utils/cache');

// Indexes: filter aur sort ke liye
productSchema.index({ status: 1, price: 1 });
productSchema.index({ status: 1, category: 1, price: 1 });
productSchema.index({ status: 1, ratingAverage: -1 });

// Product badalne par products ka search cache khud refresh ho jaye
const invalidateProductCache = () => {
  bumpVersion('products');
};
productSchema.post('save', invalidateProductCache);
productSchema.post(
  ['updateOne', 'updateMany', 'findOneAndUpdate', 'deleteOne', 'deleteMany', 'findOneAndDelete'],
  invalidateProductCache
);

module.exports = mongoose.model('Product', productSchema);