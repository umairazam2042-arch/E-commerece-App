const asyncHandler = require('../utils/asyncHandler');
const cartService = require('../services/cartService');

// ----- Cart -----

const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user._id);
  res.json({ success: true, data: { cart } });
});

const addItem = asyncHandler(async (req, res) => {
  await cartService.addItem(req.user._id, req.body);
  const cart = await cartService.getCart(req.user._id);
  res.json({ success: true, message: 'Item added to cart', data: { cart } });
});

const updateItem = asyncHandler(async (req, res) => {
  await cartService.updateItem(req.user._id, req.params.productId, req.body.quantity);
  const cart = await cartService.getCart(req.user._id);
  res.json({ success: true, message: 'Cart updated', data: { cart } });
});

const removeItem = asyncHandler(async (req, res) => {
  await cartService.removeItem(req.user._id, req.params.productId);
  const cart = await cartService.getCart(req.user._id);
  res.json({ success: true, message: 'Item removed', data: { cart } });
});

const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user._id);
  res.json({ success: true, message: 'Cart cleared' });
});

const mergeCart = asyncHandler(async (req, res) => {
  const skipped = await cartService.mergeCart(req.user._id, req.body.items);
  const cart = await cartService.getCart(req.user._id);
  res.json({ success: true, message: 'Cart merged', data: { cart, skipped } });
});

// ----- Wishlist -----

const getWishlist = asyncHandler(async (req, res) => {
  const products = await cartService.getWishlist(req.user._id);
  res.json({ success: true, data: { products } });
});

const addToWishlist = asyncHandler(async (req, res) => {
  await cartService.addToWishlist(req.user._id, req.body.productId);
  res.status(201).json({ success: true, message: 'Added to wishlist' });
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  await cartService.removeFromWishlist(req.user._id, req.params.productId);
  res.json({ success: true, message: 'Removed from wishlist' });
});

module.exports = {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
};