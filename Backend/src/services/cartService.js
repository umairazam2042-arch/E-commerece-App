const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist');
const AppError = require('../utils/AppError');

const MAX_QTY = 10;

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
  }
  return cart;
};

const findAvailableProduct = async (productId) => {
  const product = await Product.findOne({ _id: productId, status: 'published' });
  if (!product) {
    throw new AppError('Product not available', 404);
  }
  return product;
};

const ensureStock = (product, quantity) => {
  if (quantity > product.stock) {
    throw new AppError(`Only ${product.stock} item(s) in stock`, 400);
  }
};

// Cart ka poora view: har item ka total, subtotal aur availability
const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  await cart.populate({
    path: 'items.product',
    select: 'title price images stock status',
  });

  const items = cart.items.map((item) => {
    const p = item.product;
    const available = Boolean(p) && p.status === 'published';
    const inStock = available && p.stock >= item.quantity;

    return {
      product: p
        ? { _id: p._id, title: p.title, price: p.price, images: p.images, stock: p.stock, status: p.status }
        : null,
      quantity: item.quantity,
      lineTotal: available ? p.price * item.quantity : 0,
      available,
      inStock,
    };
  });

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  return { items, subtotal, itemCount: items.length };
};

const addItem = async (userId, { productId, quantity }) => {
  const product = await findAvailableProduct(productId);
  const cart = await getOrCreateCart(userId);

  const existing = cart.items.find((i) => i.product.toString() === productId);
  const newQty = (existing ? existing.quantity : 0) + quantity;

  if (newQty > MAX_QTY) {
    throw new AppError(`Maximum ${MAX_QTY} units per product`, 400);
  }
  ensureStock(product, newQty);

  if (existing) {
    existing.quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
};

const updateItem = async (userId, productId, quantity) => {
  const cart = await getOrCreateCart(userId);

  const item = cart.items.find((i) => i.product.toString() === productId);
  if (!item) {
    throw new AppError('Item not found in cart', 404);
  }

  const product = await Product.findById(productId);
  if (!product || product.status !== 'published') {
    throw new AppError('Product not available', 404);
  }
  ensureStock(product, quantity);

  item.quantity = quantity;
  await cart.save();
};

const removeItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);

  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.product.toString() !== productId);

  if (cart.items.length === before) {
    throw new AppError('Item not found in cart', 404);
  }
  await cart.save();
};

const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
};

// Login se pehle guest cart ka saman server cart mein daalta hai.
// Jo item available na ho, woh skip ho jata hai.
const mergeCart = async (userId, items) => {
  const skipped = [];

  for (const item of items) {
    try {
      await addItem(userId, item);
    } catch {
      skipped.push(item.productId);
    }
  }
  return skipped;
};

// ----- Wishlist -----

const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId }).populate(
    'products',
    'title price images status'
  );
  return wishlist ? wishlist.products : [];
};

const addToWishlist = async (userId, productId) => {
  await findAvailableProduct(productId);
  await Wishlist.findOneAndUpdate(
    { user: userId },
    { $addToSet: { products: productId } },
    { upsert: true, new: true }
  );
};

const removeFromWishlist = async (userId, productId) => {
  await Wishlist.updateOne({ user: userId }, { $pull: { products: productId } });
};

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