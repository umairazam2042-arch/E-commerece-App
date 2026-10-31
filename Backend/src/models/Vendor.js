const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    storeName: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    storeSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, trim: true, maxlength: 1000, default: '' },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },

    businessInfo: {
      ownerType: { type: String, enum: ['individual', 'company'], required: true },
      cnic: { type: String, trim: true },
      registrationNumber: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      addressLine: { type: String, required: true, trim: true },
    },

    bankDetails: {
      bankName: { type: String, required: true, trim: true },
      accountTitle: { type: String, required: true, trim: true },
      accountNumber: { type: String, required: true, trim: true },
    },

    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Vendor', vendorSchema);