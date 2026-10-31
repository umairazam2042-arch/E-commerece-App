const { z } = require('zod');

const checkoutSchema = z.object({
  paymentMethod: z.enum(['cod', 'stripe'], {
    errorMap: () => ({ message: 'paymentMethod must be cod or stripe' }),
  }),
  currency: z.string().trim().toUpperCase().length(3).default('PKR'),
  couponCode: z.string().trim().min(1).max(30).transform((v) => v.toUpperCase()).optional(),
  shippingAddress: z.object({
    fullName: z.string().trim().min(2, 'Full name is required').max(60),
    phone: z.string().trim().min(10, 'Phone number is too short').max(20),
    city: z.string().trim().min(2, 'City is required'),
    addressLine: z.string().trim().min(5, 'Address is required'),
    postalCode: z.string().trim().max(10).optional(),
    country: z.string().trim().max(60).default('Pakistan'),
  }),
});

const buyNowSchema = checkoutSchema.extend({
  productId: z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid product id'),
  quantity: z
    .number({ invalid_type_error: 'Quantity number honi chahiye' })
    .int('Quantity whole number honi chahiye')
    .min(1, 'Quantity kam az kam 1 ho')
    .max(20, 'Ek baar mein 20 se zyada nahi'),
});

const subOrderStatusSchema = z.object({
  status: z.enum(['processing', 'shipped', 'delivered', 'cancelled']),
});

module.exports = { checkoutSchema, buyNowSchema, subOrderStatusSchema };