// Platform settings. Baad mein admin panel se badalne ke liye DB mein move kar sakte hain.
module.exports = {
  CURRENCY: 'PKR',
  COMMISSION_RATE: 10, // percent, har sub-order par
  SHIPPING_FEE: 25000, // paisay mein (Rs 250)
  FREE_SHIPPING_THRESHOLD: 500000, // Rs 5000 se zyada par shipping free
  CANCEL_WINDOW_HOURS: 2, // customer order kitne ghante ke andar cancel kar sakta hai
};