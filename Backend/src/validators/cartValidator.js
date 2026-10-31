const { z } = require('zod');

const objectIdSchema = z.string().regex(/^[a-fA-F0-9]{24}$/, 'Invalid product id');

const quantitySchema = z
  .number({ invalid_type_error: 'Quantity must be a number' })
  .int('Quantity must be a whole number')
  .min(1, 'Quantity must be at least 1')
  .max(10, 'Maximum 10 units per product');

const addToCartSchema = z.object({
  productId: objectIdSchema,
  quantity: quantitySchema.default(1),
});

const updateCartItemSchema = z.object({
  quantity: quantitySchema,
});

const mergeCartSchema = z.object({
  items: z.array(addToCartSchema).max(50, 'Too many items to merge'),
});

const wishlistSchema = z.object({
  productId: objectIdSchema,
});

module.exports = {
  addToCartSchema,
  updateCartItemSchema,
  mergeCartSchema,
  wishlistSchema,
};