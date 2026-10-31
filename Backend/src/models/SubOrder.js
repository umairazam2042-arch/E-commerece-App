const mongoose = require('mongoose');

const itemSnapshotSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false }
);

// Har vendor ka hissa. Ek order mein kai sub-orders ho sakte hain.
const subOrderSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true, index: true },
    items: { type: [itemSnapshotSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    commissionRate: { type: Number, required: true },
    commissionAmount: { type: Number, required: true },
    vendorEarning: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('SubOrder', subOrderSchema);