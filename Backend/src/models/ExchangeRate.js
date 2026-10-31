const mongoose = require('mongoose');

// rate = 1 PKR ke barabar kitne units of currency
// Example: USD ke liye 0.0036 (Rs 2500 = $9)
const exchangeRateSchema = new mongoose.Schema(
  {
    currency: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    rate: { type: Number, required: true, min: 0.0000001 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExchangeRate', exchangeRateSchema);